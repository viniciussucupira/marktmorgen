/**
 * A pass over each store's recent checkouts, for what the thanks page cannot
 * be trusted to do alone.
 *
 * The thanks page confirms a purchase the moment the buyer lands on it. A
 * buyer who closes the tab while Stripe is sending them there never lands,
 * and a checkout that closes unpaid has no page at all. So the five-minute
 * job walks the stores a slice at a time and, for each one that sells, asks
 * the creator's own Stripe account for the checkouts of the last day — one
 * request per hundred — and hands each on:
 *
 *   - a settled one that has not been confirmed gets its confirmation
 *     (lib/purchase-email.ts);
 *   - a closed, unpaid one on a store with reminders on is offered to
 *     lib/checkout-recovery.ts, which sends only if the buyer agreed;
 *   - a settled one that came through an affiliate's link is written down
 *     for that affiliate (lib/affiliates.ts), once;
 *   - a settled one not yet told to the creator's phone or email platform
 *     is told now (lib/sale-events.ts), once, on a store that connected
 *     either;
 *   - a settled one not yet put on the creator's list is put there, with
 *     what it bought, and its sequences started (lib/buyer-list.ts), once;
 *   - a settled one whose buyer allowed ad measurement is sent to the
 *     creator's ad platforms (lib/ad-events.ts), once, and so is each
 *     renewal of a membership bought that way.
 *
 * A store that hands out license keys also has its refunds read, and the
 * key of every sale refunded in full is revoked (lib/licence-keys.ts), so
 * the creator's software hears about a refund within minutes, without the
 * creator having to go and revoke it by hand. A store whose buyers have
 * written reviews has its refunds read in the same way, and each review a
 * payment refunded in full paid for is marked "refunded", which takes its
 * stars out of the average (lib/reviews.ts).
 *
 * Bounded three ways, so it can never run away with the job: a time budget
 * the caller sets, at most three pages of a hundred checkouts per store, and
 * a place in the list of stores kept in Redis, so each run carries on where
 * the last one stopped and every store is reached in turn. Both emails are
 * guarded by their own marks, so a store seen twice is only work, never a
 * second email.
 */
import { noteFirstSale } from "@/lib/yearly-offer";
import { noteTestSales } from "@/lib/headline-test";
import { revokeRefundedGifts } from "@/lib/gifts";
import { revokeRefundedPreorders } from "@/lib/preorders";
import { revokeRefundedGroups } from "@/lib/group-buy";
import { sweepPayPal } from "@/lib/paypal-delivery";
import { dropEnrollment } from "@/lib/learn";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { onAccount, platformKey } from "@/lib/stripe-account";
import { isSettled } from "@/lib/instant-pay";
import { CONFIRM_WITHIN_SECONDS, type SessionRecord, canConfirm, confirmPurchase, confirmationKey } from "@/lib/purchase-email";
import { REMIND_WITHIN_SECONDS, remindAbandoned } from "@/lib/checkout-recovery";
import { enroll, readFlows } from "@/lib/flows";
import { recoveryOn } from "@/lib/recovery-setting";
import { type Store, ensureStoreId, saleHandles, storeRef, storesAfter } from "@/lib/store";
import { listingsNamed, sellsThings } from "@/lib/catalog";
import { affiliatesOn, listPartners, noteSession } from "@/lib/affiliates";
import { affiliateForCodes, codeOwners } from "@/lib/affiliate-codes";
import { revokeRefunded, storeHasKeys } from "@/lib/licence-keys";
import { markRefundedReviews, storeHasReviews } from "@/lib/review-proof";
import { listensToSales, noteSales } from "@/lib/sale-events";
import { listOrder, listedAlready } from "@/lib/buyer-list";
import { rememberBuyers } from "@/lib/buyer-library";
import { isHouseStore } from "@/lib/house-store";
import { deliveredIds } from "@/lib/bundle-rules";
import { sendPaidOrders, sendRenewals, sendsFromServer } from "@/lib/ad-events";

const CURSOR_KEY = "nl:sweep:cursor";
/** At most this many pages of a hundred checkouts are read per store per pass. */
export const MAX_PAGES_PER_STORE = 3;

export type SweepCounts = {
  stores: number;
  confirmed: number;
  reminded: number;
  failed: number;
  revoked: number;
  /** Reviews marked refunded. */
  unrated: number;
  /** Paid orders put on the creator's list here, their buyer never having reached the thanks page. */
  listed: number;
};

/** Whether a store has anything this pass could send about. */
function worthAsking(store: Store): boolean {
  return (
    (canConfirm(store) && sellsThings(store)) ||
    (Boolean(store.stripeAccountId) && affiliatesOn(store)) ||
    storeHasKeys(store) ||
    listensToSales(store) ||
    (Boolean(store.stripeAccountId) && Boolean(store.listId) && sellsThings(store)) ||
    (Boolean(store.stripeAccountId) && sendsFromServer(store))
  );
}

/** One store: its checkouts of the last day, each handed to what it needs. */
async function sweepStore(store: Store, counts: SweepCounts, deadline: number, reviewed: boolean): Promise<void> {
  // Refunds first: a key that should no longer open anything matters more
  // than a reminder. One failing never stops the checkouts below.
  if (storeHasKeys(store)) {
    try {
      counts.revoked += await revokeRefunded(store, deadline);
    } catch (error) {
      console.error("reading a store's refunds failed", store.handle, error);
    }
  }
  // A gift refunded in full is taken back from whoever it was given to
  // (lib/gifts.ts). Nothing is asked of a store that never sold one.
  try {
    counts.revoked += await revokeRefundedGifts(store, deadline, (email, productId) => dropEnrollment(store, email, productId));
  } catch (error) {
    console.error("reading a store's refunds for gifts failed", store.handle, error);
  }
  // And so is a pre-order, handed over or still waiting (lib/preorders.ts).
  try {
    counts.revoked += await revokeRefundedPreorders(store, deadline, (email, productId) => dropEnrollment(store, email, productId));
  } catch (error) {
    console.error("reading a store's refunds for pre-orders failed", store.handle, error);
  }
  // And so is every place of a purchase for several people (lib/group-buy.ts).
  try {
    counts.revoked += await revokeRefundedGroups(store, deadline, (email, productId) => dropEnrollment(store, email, productId));
  } catch (error) {
    console.error("reading a store's refunds for places failed", store.handle, error);
  }
  // Sold through the creator's PayPal (lib/paypal-sales.ts): a payment PayPal
  // held as pending is handed over once it completes, and a full refund takes
  // the purchase back.
  if (store.paypalSeller) {
    try {
      const paypal = await sweepPayPal(store, deadline);
      counts.confirmed += paypal.cleared;
      counts.revoked += paypal.revoked;
    } catch (error) {
      console.error("asking PayPal about a store's orders failed", store.handle, error);
    }
  }
  if (reviewed) {
    try {
      counts.unrated += await markRefundedReviews(store, deadline);
    } catch (error) {
      console.error("reading a store's refunds for reviews failed", store.handle, error);
    }
  }
  if (!worthAsking(store)) return;
  // A membership's renewals, sent to the creator's ad platforms as purchases
  // of their own (lib/ad-events.ts): one read of the day's invoices, only on
  // a store that sends from the server.
  if (store.stripeAccountId && sendsFromServer(store)) {
    await sendRenewals(store, Date.now(), deadline).catch((error) => console.error("sending renewals to ad platforms failed", store.handle, error));
  }
  const now = Math.floor(Date.now() / 1000);
  const since = now - CONFIRM_WITHIN_SECONDS;
  const reminding = recoveryOn(store);
  let after = "";
  for (let page = 0; page < MAX_PAGES_PER_STORE && Date.now() < deadline; page += 1) {
    const listed = await onAccount(
      "GET",
      store.stripeAccountId as string,
      `/checkout/sessions?limit=100&created[gte]=${since}${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`,
    );
    const rows = Array.isArray(listed.data) ? (listed.data as SessionRecord[]) : [];

    // Asked in one round trip: which of the paid ones were already confirmed.
    const paid = rows.filter((row) => isSettled(row) && typeof row.id === "string");
    // An affiliate's sale is written down whether or not its buyer came back —
    // through a link, and through a discount code given to an affiliate, which
    // is the only trace left by a sale made on a podcast or from a stage. The
    // store's given-away codes are read once, not once an order.
    // A partner's standing share has to be written for every sale, not only
    // the ones somebody referred, so the store's partners are read once here
    // and a sale is passed on when a link, a code or a partner touches it.
    if (affiliatesOn(store)) {
      const [owners, partners] = paid.length
        ? await Promise.all([codeOwners(store), listPartners(store)])
        : [new Map<string, string>(), []];
      for (const row of paid) {
        // A gift through "Support my work" sold nothing, so it earns nobody a share (lib/store-tips.ts).
        if (row.metadata?.kind === "tip") continue;
        const code = owners.size ? affiliateForCodes(row as { discounts?: unknown }, owners) : "";
        if (row.metadata?.via || code || partners.length) {
          await noteSession(store, row as Parameters<typeof noteSession>[1], owners, partners);
        }
      }
    }
    // The store's first sale ever, noted once, with the yearly plan offered
    // at the moment it is most worth keeping (lib/yearly-offer.ts). Not on the
    // demo's account, which canConfirm leaves out.
    if (paid.length && canConfirm(store)) {
      await noteFirstSale(store, paid).catch((error) => console.error("noting a first sale failed", store.handle, error));
    }
    // A sale paid from a page running a test counts for the version its buyer was shown, once (lib/headline-test.ts).
    if (paid.some((row) => row.metadata?.ab)) {
      await noteTestSales(store.statsId, store.currency, paid).catch((error) => console.error("counting a tested page's sales failed", store.handle, error));
    }
    // The creator's ad platforms, sent each sale whose buyer allowed ad
    // measurement, whether or not the buyer came back from Stripe (lib/ad-events.ts).
    if (sendsFromServer(store) && paid.some((row) => row.metadata?.ads)) {
      await sendPaidOrders(store, paid, Date.now(), deadline).catch((error) => console.error("sending sales to ad platforms failed", store.handle, error));
    }
    // The creator's phone and email platform, told of each sale once.
    if (listensToSales(store)) {
      await noteSales(store, paid).catch((error) => console.error("telling about sales failed", store.handle, error));
    }
    const confirming = canConfirm(store);
    const marks = paid.length && confirming
      ? await redisPipeline(paid.map((row) => ["EXISTS", confirmationKey(row.id as string)]))
      : [];
    for (let i = 0; confirming && i < paid.length && Date.now() < deadline; i += 1) {
      if (Number(marks[i]) === 1) continue;
      const outcome = await confirmPurchase(store, paid[i].id as string, paid[i]);
      if (outcome === "sent") counts.confirmed += 1;
      if (outcome === "failed") counts.failed += 1;
    }

    // Every buyer of an ordinary order finds this store in their library,
    // whether or not they reached the thanks page (lib/buyer-library.ts).
    {
      const handles = saleHandles(store);
      const buyers = paid.flatMap((row) => {
        const meta = row.metadata ?? {};
        const email = typeof row.customer_details?.email === "string" ? row.customer_details.email : "";
        return email && handles.has(meta.store ?? "") && meta.kind !== "tip" && deliveredIds(meta).length > 0 ? [email] : [];
      });
      // Never the demo store's, whose checkout takes any address (lib/house-store.ts).
      if (buyers.length && !isHouseStore(store)) {
        // A store made before stores had ids is given its own now.
        const sid = store.sid || (await ensureStoreId(storeRef(store)).catch(() => null))?.sid || "";
        await rememberBuyers(sid, buyers);
      }
    }
    // A buyer who never reached the thanks page is put on the list all the
    // same, with what they bought, and their sequences start (lib/buyer-list.ts).
    if (store.listId && paid.length && Date.now() < deadline) {
      const handles = saleHandles(store);
      const ordinary = paid.filter((row) => {
        const meta = row.metadata ?? {};
        return handles.has(meta.store ?? "") && meta.kind !== "tip" && deliveredIds(meta).length > 0;
      });
      const listed = await listedAlready(ordinary.map((row) => row.id as string));
      for (let i = 0; i < ordinary.length && Date.now() < deadline; i += 1) {
        if (listed[i]) continue;
        const row = ordinary[i];
        const email = typeof row.customer_details?.email === "string" ? row.customer_details.email : typeof row.customer_email === "string" ? row.customer_email : "";
        if (!email) continue;
        const products = await listingsNamed(store, row.metadata);
        if ((await listOrder(store, {
          sessionId: row.id as string,
          email,
          news: row.metadata?.news === "yes",
          clicks: row.metadata?.news === "yes" && row.metadata?.clicks === "yes",
          created: typeof row.created === "number" ? row.created : Math.floor(Date.now() / 1000),
          products: products.map((p) => ({ id: p.id, title: p.title })),
        })) === "done") counts.listed += 1;
      }
    }

    if (reminding) {
      for (const row of rows) {
        if (Date.now() >= deadline) break;
        if (row.status !== "expired" || row.consent?.promotions !== "opt_in") continue;
        const outcome = await remindAbandoned(store, row);
        if (outcome === "sent") counts.reminded += 1;
        if (outcome === "failed") counts.failed += 1;
      }
    }

    // Workflows that start on an abandoned checkout (lib/flows.ts, trigger
    // "abandoned"): only for a buyer who agreed on Stripe's page to hear from
    // the creator and who is on the creator's list, once per checkout, and
    // only for a store that has such a workflow switched on.
    if (store.listId && rows.some((row) => row.status === "expired" && row.consent?.promotions === "opt_in") && Date.now() < deadline) {
      await startAbandonedWorkflows(store, rows).catch((error) => console.error("starting abandoned-checkout workflows failed", store.handle, error));
    }

    const last = rows[rows.length - 1];
    if (listed.has_more !== true || !last || typeof last.id !== "string") break;
    after = last.id;
  }
}

/**
 * Walks stores until the deadline or the end of the list, whichever comes
 * first, and remembers where it stopped.
 *
 * The place is the Redis cursor of the batch being read and how many stores
 * of that batch were done, so a run that stops half way through a batch
 * starts the next one at the store after the last it finished.
 */
export async function sweepCheckouts(deadline: number): Promise<SweepCounts> {
  const counts: SweepCounts = { stores: 0, confirmed: 0, reminded: 0, failed: 0, revoked: 0, unrated: 0, listed: 0 };
  if (!isRedisConfigured() || !platformKey()) return counts;

  const [saved] = await redisPipeline([["GET", CURSOR_KEY]]);
  const [savedCursor, savedDone] = typeof saved === "string" ? saved.split("|") : ["0", "0"];
  let cursor = /^\d+$/.test(savedCursor ?? "") ? savedCursor : "0";
  let skip = Number(savedDone) || 0;

  while (Date.now() < deadline) {
    const { stores, next } = await storesAfter(cursor);
    let done = 0;
    for (const store of stores) {
      if (done < skip) {
        done += 1;
        continue;
      }
      if (Date.now() >= deadline) break;
      const reviewed = Boolean(store.stripeAccountId) && (await storeHasReviews(store).catch(() => false));
      if (worthAsking(store) || reviewed || store.paypalSeller) {
        counts.stores += 1;
        try {
          await sweepStore(store, counts, deadline, reviewed);
        } catch (error) {
          // One store's account refusing, or Stripe having a moment, does not
          // hold up everyone after it. It is reached again next time round.
          console.error("reading a store's checkouts failed", store.handle, error);
        }
      }
      done += 1;
    }
    if (done < stores.length) {
      await redisPipeline([["SET", CURSOR_KEY, `${cursor}|${done}`]]);
      return counts;
    }
    skip = 0;
    cursor = next;
    // The end of the list: the next run starts again from the top, rather
    // than this one reading the first stores twice in a row.
    if (next === "0") break;
  }
  await redisPipeline([["SET", CURSOR_KEY, `${cursor}|0`]]);
  return counts;
}

/**
 * Starts the workflows about an abandoned checkout, for each closed, unpaid
 * checkout of the last few hours whose buyer agreed to hear from the creator
 * on Stripe's own page. enroll() then also requires them to be on the
 * creator's list and still written to. Each checkout is handed on once.
 */
async function startAbandonedWorkflows(store: Store, rows: SessionRecord[]): Promise<void> {
  // Never the demo store's, whose checkout takes any address (lib/house-store.ts).
  if (!store.listId || isHouseStore(store)) return;
  const flows = (await readFlows(store.listId)).filter((f) => f.active && f.trigger === "abandoned");
  if (!flows.length) return;
  const handles = saleHandles(store);
  const now = Math.floor(Date.now() / 1000);
  for (const row of rows) {
    if (row.status !== "expired" || row.consent?.promotions !== "opt_in") continue;
    const meta = row.metadata ?? {};
    const closed = typeof row.expires_at === "number" ? row.expires_at : 0;
    if (!closed || now - closed > REMIND_WITHIN_SECONDS || closed > now) continue;
    if (!handles.has(meta.store ?? "") || !meta.product || !flows.some((f) => f.productId === meta.product)) continue;
    const email = typeof row.customer_details?.email === "string" ? row.customer_details.email : typeof row.customer_email === "string" ? row.customer_email : "";
    if (!email || typeof row.id !== "string") continue;
    const [fresh] = await redisPipeline([["SET", `nl:wf:abandoned:${row.id}`, "1", "NX", "EX", 2 * 86_400]]);
    if (fresh === null) continue;
    await enroll(store, email, { joined: false, abandoned: meta.product });
  }
}
