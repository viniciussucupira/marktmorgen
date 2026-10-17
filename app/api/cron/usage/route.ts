import type { NextRequest } from "next/server";
import { cronAllowed } from "@/lib/request-guard";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import {
  DELIVERY_ALLOWANCE_BYTES,
  FREE_PAUSE_ABOVE_BYTES,
  bytesWords,
  monthKey,
  ownersOf,
  storesOverAllowance,
} from "@/lib/delivery";
import { SUPPORT_EMAIL } from "@/lib/creator-research";
import { PLANS_ON_SALE } from "@/lib/opening";
import { SITE_URL } from "@/lib/site-url";
import { SETUP_VIDEO_SECONDS, standingOf, videoLimitFor } from "@/lib/plan-standing";
import { watchedFolders, watchedIn } from "@/lib/watch";
import { firstWord, settleAll, storeOf } from "@/lib/watch-billing";
import { VIDEO_SECONDS_INCLUDED, canBeCharged, centsWords, videoOwedCents } from "@/lib/watch-rules";
import { videoUsageNotice } from "@/lib/video-usage-notice";
import { visitedFolders, visitsIn } from "@/lib/traffic";
import { firstWordOnVisits, settleAllVisits } from "@/lib/traffic-billing";
import { SETUP_VISITS, VISIT_CENTS_PER_THOUSAND_OVER, countWords, visitLimitFor, visitsIncluded, visitsOwedCents, visitsWords } from "@/lib/traffic-rules";
import { firstWordOnOrders, settleAllOrders } from "@/lib/orders-billing";
import { ORDER_CENTS_PER_THOUSAND_OVER, ordersIncluded, ordersOwedCents, ordersWords } from "@/lib/order-rules";

/**
 * The daily run that writes to a creator who has gone past the allowance.
 *
 * Section 5 of the Terms promises that a store far above the published
 * limits is written to first, with the figures, and given time to answer,
 * before anything is limited. That promise was the last thing in this system
 * that needed a person: everything else — the pause on free downloads, the
 * brake on storage — acts by itself, while the letter sat waiting for
 * somebody to notice and write it.
 *
 * A promise that depends on somebody noticing is not a promise. So the
 * letter is sent from here, to the creator, by name, with their own number
 * in it, the morning after they cross. Nobody has to be watching, and the
 * clause in the Terms is kept by the machine that made it necessary.
 *
 * Once per store per calendar month. A store that is over stays over until
 * the counter rolls, and a mail every morning for three weeks is how a
 * notice stops being read.
 *
 * Nothing in here blocks or limits anything. It writes.
 *
 * It is also the run that bills the one thing charged by use: lesson video
 * watched past the hours a plan covers (lib/watch-billing.ts). Each store
 * past them has the hours added to its next invoice, by itself, and its
 * creator is written to the first time a month passes them: what they have
 * come to, and that nobody is cut off. A store with no plan to charge is
 * written to as well, because its videos are paused (lib/learn.ts).
 *
 * And the other: visits to a store past the visits its plan covers
 * (lib/traffic-billing.ts), billed and written about the same way. A store
 * with no plan to charge is written to because its pages are resting
 * (lib/traffic.ts).
 *
 * And orders past the orders a plan covers (lib/orders-billing.ts), billed
 * and written about the same way. There is nothing to rest for them: a buyer
 * is never refused, and a store with no plan to charge gives no free copies
 * past the trial's (lib/order-rules.ts).
 */
export const maxDuration = 60;

const TOLD = "nl:usage-watch:told";

type VideoRun = { stores: number; billed: number; cents: number; paused: number; failed: number; told: number };

/** Bills video past the plan's hours, and writes to each creator the first time a month passes them. */
async function videoRun(): Promise<VideoRun> {
  const out: VideoRun = { stores: 0, billed: 0, cents: 0, paused: 0, failed: 0, told: 0 };
  let settled: Awaited<ReturnType<typeof settleAll>> = [];
  try {
    settled = await settleAll();
  } catch (error) {
    console.error("settling video hours failed", error);
    return out;
  }
  for (const row of settled) {
    out.stores += 1;
    if (row.added > 0) {
      out.billed += 1;
      out.cents += row.added;
    }
    if (row.state === "failed") out.failed += 1;
  }

  // Each creator is written to once about the month that is running: the
  // first time their hours pass what a plan covers, or, where there is no
  // plan to charge, the first time their videos are paused. A store with no
  // plan has far fewer hours than one in a trial (lib/plan-standing.ts), so
  // every store watched for at least the smallest figure is looked at.
  const month = monthKey();
  let watchedStores: string[] = [];
  try {
    watchedStores = await watchedFolders(month);
  } catch (error) {
    console.error("could not read the stores whose video was watched", error);
  }
  for (const folder of watchedStores) {
    try {
      const seconds = await watchedIn(folder, month);
      if (seconds < SETUP_VIDEO_SECONDS) continue;
      const store = await storeOf(folder);
      if (!store) continue;
      const limit = videoLimitFor(store);
      const paused = limit !== null && seconds >= limit;
      const charged = canBeCharged(store) && seconds > VIDEO_SECONDS_INCLUDED;
      if (!paused && !charged) continue;
      if (paused) out.paused += 1;
      if (!isSenderConfigured() || !(await firstWord(folder, month))) continue;
      const notice = videoUsageNotice({ seconds, limit, standing: standingOf(store),
        legacyChargeCents: charged ? videoOwedCents(seconds) : 0,
        studioUrl: `${SITE_URL}/studio`, supportEmail: SUPPORT_EMAIL });
      const sent = await sendEmail({
        from: NIMBUS_FROM,
        to: store.email,
        replyTo: SUPPORT_EMAIL,
        ...notice,
      }).catch((error) => {
        console.error("sending the video hours notice failed", error);
        return false;
      });
      if (sent !== false) out.told += 1;
    } catch (error) {
      console.error("writing to a creator about video hours failed", error);
    }
  }
  console.log(
    out.stores === 0 && out.paused === 0
      ? "video-watch: every store inside its hours"
      : `video-watch: ${out.stores} past a plan's hours, ${out.billed} billed ${centsWords(out.cents)}, ${out.paused} playback paused, ${out.failed} failed, ${out.told} written to`,
  );
  return out;
}

type VisitsRun = { stores: number; billed: number; cents: number; resting: number; failed: number; told: number };

/** Bills visits past the plan's, and writes to each creator the first time a month passes them. */
async function visitsRun(): Promise<VisitsRun> {
  const out: VisitsRun = { stores: 0, billed: 0, cents: 0, resting: 0, failed: 0, told: 0 };
  let settled: Awaited<ReturnType<typeof settleAllVisits>> = [];
  try {
    settled = await settleAllVisits();
  } catch (error) {
    console.error("settling visits failed", error);
    return out;
  }
  for (const row of settled) {
    if (row.owed > 0) out.stores += 1;
    if (row.added > 0) {
      out.billed += 1;
      out.cents += row.added;
    }
    if (row.state === "failed") out.failed += 1;
  }

  // Each creator is written to once about the month that is running: the
  // first time their visits pass what their plan covers, or, where there is
  // no plan to charge, the first time their pages rest.
  const month = monthKey();
  let visited: string[] = [];
  try {
    visited = await visitedFolders(month);
  } catch (error) {
    console.error("could not read the stores that were visited", error);
  }
  for (const folder of visited) {
    try {
      const visits = await visitsIn(folder, month);
      if (visits < SETUP_VISITS) continue;
      const store = await storeOf(folder);
      if (!store) continue;
      const limit = visitLimitFor(store);
      const resting = limit !== null && visits >= limit;
      const included = visitsIncluded(store.tier);
      const charged = canBeCharged(store) && visits > included;
      if (!resting && !charged) continue;
      if (resting) out.resting += 1;
      if (!isSenderConfigured() || !(await firstWordOnVisits(folder, month))) continue;
      const price = centsWords(VISIT_CENTS_PER_THOUSAND_OVER);
      const sent = await sendEmail({
        from: NIMBUS_FROM,
        to: store.email,
        replyTo: SUPPORT_EMAIL,
        subject: charged ? `Your store has had ${visitsWords(visits)} this month` : "Your store's pages are resting",
        text: (charged
          ? [
              `Your store has had ${visitsWords(visits)} so far this month. Your plan covers`,
              `${countWords(included)} a month, so you are past it.`,
              "",
              "Your store is open, and it stays open. Nothing is taken down for this.",
              "",
              `Past the ${countWords(included)}, visits are ${price} for each thousand, counted to the visit.`,
              `So far this month that comes to ${centsWords(visitsOwedCents(visits, store.tier))}. It is added to your next invoice, on`,
              "the card you already pay with. There is nothing for you to do.",
              "",
              "A visit is one person opening your store on one day, however many of its",
              "pages they look at. You are never counted, and neither is a robot that",
              "says it is one. Your studio shows the count as it grows, under your plan:",
              `${SITE_URL}/studio`,
              "",
              `If the figure surprises you, reply to this email or write to ${SUPPORT_EMAIL}.`,
            ]
          : [
              `Your store has had ${visitsWords(visits)} this month, which is the ${countWords(limit ?? 0)}`,
              `${standingOf(store) === "trial" ? "a free trial has" : "a store without a paid plan has"} in a month.`,
              "",
              "Your store has no paid plan to carry more, so its pages are resting: a",
              "visitor is told the page will be open again soon. Everything your buyers",
              "already have is open as usual: their orders, their downloads, their",
              "lessons, their memberships.",
              "",
              ...(PLANS_ON_SALE || standingOf(store) === "trial"
                ? ["Your pages open again as soon as your plan is paid, or when the month", "turns, whichever comes first. Nothing has been charged for the visits."]
                : ["Your pages open again when the month turns. Plans are not on sale yet, and", "nothing has been charged for the visits."]),
              "",
              `${SITE_URL}/studio`,
            ]
        ).join("\n"),
      }).catch((error) => {
        console.error("sending the visits notice failed", error);
        return false;
      });
      if (sent !== false) out.told += 1;
    } catch (error) {
      console.error("writing to a creator about visits failed", error);
    }
  }
  console.log(
    out.stores === 0 && out.resting === 0
      ? "visits-watch: every store inside its visits"
      : `visits-watch: ${out.stores} past a plan's visits, ${out.billed} billed ${centsWords(out.cents)}, ${out.resting} resting with no plan, ${out.failed} failed, ${out.told} written to`,
  );
  return out;
}

export async function GET(request: NextRequest) {
  if (!(await cronAllowed(request))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRedisConfigured()) {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const video = await videoRun();
  const visits = await visitsRun();
  const orders = await ordersRun();

  const over = await storesOverAllowance();
  const allowance = bytesWords(DELIVERY_ALLOWANCE_BYTES);

  console.log(
    over.length === 0
      ? "usage-watch: every store inside the delivery allowance"
      : `usage-watch: ${over.length} over ${allowance} — ${over.map((s) => `${s.folder} ${bytesWords(s.bytes)}`).join(", ")}`,
  );

  const [seenRaw] = await redisPipeline([["GET", TOLD]]);
  const seen = new Set<string>(typeof seenRaw === "string" ? (JSON.parse(seenRaw) as string[]) : []);
  const fresh = over.filter((s) => !seen.has(s.folder));
  if (fresh.length === 0) {
    return Response.json(
      { ok: true, over: over.length, told: 0, video, visits, orders },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const owners = await ownersOf(fresh.map((s) => s.folder));
  let told = 0;
  const unknown: string[] = [];

  for (let i = 0; i < fresh.length; i += 1) {
    const store = fresh[i];
    const email = owners[i];
    if (!email) {
      unknown.push(store.folder);
      continue;
    }
    if (!isSenderConfigured()) break;
    const sent = await sendEmail({
      from: NIMBUS_FROM,
      to: email,
      replyTo: SUPPORT_EMAIL,
      subject: `Your store has sent out ${bytesWords(store.bytes)} this month`,
      text: [
        `Your store has handed out ${bytesWords(store.bytes)} of files so far this month. The`,
        `subscription covers ${allowance} a month, so you are past it.`,
        "",
        "Nothing has been stopped, and nothing will be stopped for this. Your buyers",
        "are getting what they paid for, at any number — we do not take money for a",
        "sale and then not complete it.",
        "",
        "Two things are worth knowing.",
        "",
        `Free downloads — copies given away rather than bought — pause on their own if a`,
        `store passes ${bytesWords(FREE_PAUSE_ABOVE_BYTES)} in a month, and start again when the month turns.`,
        "Anything anyone has bought is never affected by that.",
        "",
        "And if your store stays far above the allowance month after month, we will",
        "want to talk about a plan that fits what you are doing. This email is that",
        "conversation starting, which is what our Terms say we do before anything",
        "else happens. You have time, and you have a person to answer: reply to this",
        `email, or write to ${SUPPORT_EMAIL}.`,
        "",
        "If this is a surprise, it is worth checking whether a free product of yours",
        "has been shared somewhere you did not expect. Your studio shows the month's",
        "total under your plan.",
        "",
        `${SITE_URL}/studio`,
      ].join("\n"),
    }).catch((error) => {
      console.error("sending the allowance notice failed", error);
      return false;
    });
    if (sent !== false) told += 1;
  }

  /*
    A store whose owner we cannot name is the one case left that a person has
    to look at — and it can only happen to a store that has delivered files
    without ever uploading one through the studio, which should not occur.
    It is said out loud rather than passed over in silence.
  */
  if (unknown.length > 0 && isSenderConfigured()) {
    await sendEmail({
      from: NIMBUS_FROM,
      to: SUPPORT_EMAIL,
      subject: `${unknown.length} store(s) over the allowance could not be written to`,
      text: [
        "These folders are past the delivery allowance, and we have no address on",
        "file for whoever owns them, so the notice our Terms promise could not be",
        "sent automatically:",
        "",
        ...unknown.map((f) => `  ${f}`),
      ].join("\n"),
    }).catch((error) => console.error("sending the unknown-owner notice failed", error));
  }

  await redisPipeline([
    ["SET", TOLD, JSON.stringify([...new Set([...seen, ...over.map((s) => s.folder)])]), "EX", 40 * 86_400],
  ]);

  return Response.json(
    { ok: true, over: over.length, told, unknown: unknown.length, video, visits, orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}

type OrdersRun = { stores: number; billed: number; cents: number; failed: number; told: number };

/** Bills orders past the plan's, and writes to each creator the first time a month passes them. */
async function ordersRun(): Promise<OrdersRun> {
  const out: OrdersRun = { stores: 0, billed: 0, cents: 0, failed: 0, told: 0 };
  let settled: Awaited<ReturnType<typeof settleAllOrders>> = [];
  try {
    settled = await settleAllOrders();
  } catch (error) {
    console.error("settling orders failed", error);
    return out;
  }
  const month = monthKey();
  for (const row of settled) {
    if (row.owed > 0) out.stores += 1;
    if (row.added > 0) {
      out.billed += 1;
      out.cents += row.added;
    }
    if (row.state === "failed") out.failed += 1;
    // Written to once, about the month that is running, the first time it passes what the plan covers.
    const store = row.store;
    if (row.month !== month || !store || row.owed <= 0 || !canBeCharged(store)) continue;
    try {
      if (!isSenderConfigured() || !(await firstWordOnOrders(row.folder, month))) continue;
      const included = ordersIncluded(store.tier);
      const sent = await sendEmail({
        from: NIMBUS_FROM,
        to: store.email,
        replyTo: SUPPORT_EMAIL,
        subject: `Your store has had ${ordersWords(row.amount)} this month`,
        text: [
          `Your store has had ${ordersWords(row.amount)} so far this month. Your plan covers`,
          `${countWords(included)} a month, so you are past it.`,
          "",
          "Nothing is refused to a buyer for this, and nothing is asked of you.",
          "",
          `Past the ${countWords(included)}, orders are ${centsWords(ORDER_CENTS_PER_THOUSAND_OVER)} for each thousand, half a cent an order.`,
          `So far this month that comes to ${centsWords(ordersOwedCents(row.amount, store.tier))}. It is added to your next invoice, on`,
          "the card you already pay with. There is nothing for you to do.",
          "",
          "An order is a purchase confirmed, an offer taken after paying, a place taken",
          "in a purchase for several people, or a free copy sent. Your studio shows the",
          `count as it grows, under your plan: ${SITE_URL}/studio`,
          "",
          `If the figure surprises you, reply to this email or write to ${SUPPORT_EMAIL}.`,
        ].join("\n"),
      }).catch((error) => {
        console.error("sending the orders notice failed", error);
        return false;
      });
      if (sent !== false) out.told += 1;
    } catch (error) {
      console.error("writing to a creator about orders failed", error);
    }
  }
  console.log(
    out.stores === 0
      ? "orders-watch: every store inside its orders"
      : `orders-watch: ${out.stores} past a plan's orders, ${out.billed} billed ${centsWords(out.cents)}, ${out.failed} failed, ${out.told} written to`,
  );
  return out;
}
