import { readFunnelPaymentChecks } from "@/lib/funnel-payment-checks";
import type { Metadata } from "next";
import { BUMP_CHOICES, idsOfKind, readCards, readListings, readProduct } from "@/lib/catalog";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioPath, studioView } from "@/lib/studio-route";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { formatMoney } from "@/lib/money";
import { canBeBumped } from "@/lib/product-extras";
import { MAX_FUNNEL_STEPS } from "@/lib/funnel";
import { imageUrl } from "@/lib/product-image";
import { FunnelEditor } from "@/components/funnel-editor";
import { offerableAfterPaying } from "@/lib/bundles";
import { PageFunnelEditor, type SavedFunnel, type StepChoice } from "@/components/page-funnel-editor";
import { readFunnelCounts, readPageFunnels, stepStates } from "@/lib/page-funnel-store";
import { MAX_SITE_PAGES, pageOut } from "@/lib/site-page-rules";
import { FunnelTypePicker, type TypeProduct } from "@/components/funnel-type-picker";
import { MAX_PAGE_FUNNELS } from "@/lib/page-funnel";
import { can } from "@/lib/team-roles";
import { canUseDomain } from "@/lib/domains";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Funnels — Marktmorgen",
  robots: { index: false, follow: false },
};

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

/**
 * What each product offers after it is paid for: up to five one-click offers
 * in a row, each with a way on for yes and for no thanks. On every plan.
 */
/** Products listed beside the editor at once; a longer list is searched. */
const NAV_LIMIT = 50;

export default async function StudioFunnelsPage({ searchParams }: Params) {
  const query = await searchParams;
  // Which store, and whether this person's role there has "products" (lib/studio-route.ts).
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "products");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view } = found;
  const { store } = view;

  // Only a plain one-off sale can be followed by offers. Every card is read
  // once; the product being edited is read in full, for its funnel.
  // A product that can own a funnel is one that is paid, not a membership and
  // not a call — every one of which the store's own index answers. The names
  // are the one card hash. No product record is read to build this list.
  const cards = await readCards(store);
  const notOneOff = new Set([...idsOfKind(store, "free"), ...idsOfKind(store, "recurring"), ...idsOfKind(store, "call")]);
  const owners = [...cards.values()].filter((p) => !notOneOff.has(p.id));
  const withOffers = new Set(idsOfKind(store, "funnel"));
  const asked = typeof query.product === "string" ? query.product : "";
  const find = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const chosen =
    owners.find((p) => p.id === asked) ?? owners.find((p) => withOffers.has(p.id)) ?? owners[0] ?? null;
  const selected = chosen ? await readProduct(store, chosen.id) : null;
  // A long store lists the products with offers first and the rest after,
  // NAV_LIMIT at a time, found by name.
  const matching = (find ? owners.filter((p) => p.title.toLowerCase().includes(find.toLowerCase())) : owners)
    .slice()
    .sort((a, b) => Number(withOffers.has(b.id)) - Number(withOffers.has(a.id)));
  const listed = matching.slice(0, NAV_LIMIT);
  if (selected && !listed.some((p) => p.id === selected.id)) listed.unshift(selected);
  /*
   * The two pickers below want things the card does not carry — whether a
   * product has a file, and whether it has an image. The index still rules
   * most of a catalogue out before a single read: a membership, a call, a free
   * product and one with price options can never be offered after paying. Only
   * what survives is read, and at most BUMP_CHOICES of it, which is already
   * more than a list to pick from can usefully hold. This used to read every
   * product in the store.
   */
  const withOptions = new Set(store.catalog.items.filter((item) => item.options.length > 0).map((item) => item.id));
  const candidates = owners.filter((p) => !withOptions.has(p.id)).slice(0, BUMP_CHOICES).map((p) => p.id);
  const listings = await readListings(store, candidates);
  // A bundle is offered like any product, unless it holds a course (lib/bundles.ts).
  const offerable = (await offerableAfterPaying(store, listings))
    .filter((p) => canBeBumped(p))
    .map((p) => ({
      id: p.id,
      title: p.title,
      priceCents: p.priceCents,
    }));
  const pictures = listings
    .filter((p) => p.image)
    .map((p) => ({ id: p.id, title: p.title, src: imageUrl(p.image!) }));

  // Funnels of pages (lib/page-funnel.ts): every saved one, each step as the
  // store stands and how many people reached it, and what can be a step — the
  // store's own pages and every product bought from its own page.
  const calls = new Set(idsOfKind(store, "call"));
  const drafts = new Set(idsOfKind(store, "hidden"));
  const free = new Set(idsOfKind(store, "free"));
  const choices: StepChoice[] = [
    ...store.sitePages.map((page) => ({ kind: "page" as const, id: page.id, title: page.title, note: pageOut(page) ? "" : "kept back" })),
    ...[...cards.values()]
      .filter((p) => !calls.has(p.id))
      .map((p) => ({ kind: "product" as const, id: p.id, title: p.title, note: drafts.has(p.id) ? "draft" : free.has(p.id) ? "free" : "" })),
  ];
  const savedFunnels: SavedFunnel[] = await Promise.all(
    (await readPageFunnels(store.statsId).catch(() => [])).map(async (funnel) => {
      const [states, counts] = await Promise.all([stepStates(store, funnel), readFunnelCounts(store.statsId, funnel)]);
      return {
        funnel,
        paymentIssues: await readFunnelPaymentChecks(store, funnel).catch(() => null),
        steps: states.map((state, i) => ({
          title: state.title,
          open: state.open,
          why: state.why,
          free: state.free,
          product: state.step.kind === "product",
          seen: counts[i]?.seen ?? 0,
          done: counts[i]?.done ?? 0,
        })),
      };
    }),
  );
  // What a kind of funnel can be built with (lib/funnel-types.ts): every product, and what it is.
  const typeProducts: TypeProduct[] = [...cards.values()].map((p) => ({ id: p.id, title: p.title, free: free.has(p.id), call: calls.has(p.id), draft: drafts.has(p.id) }));
  const funnelBase =
    store.domain?.liveAt && canUseDomain(store) ? `https://${store.domain.name}/go/` : `${SITE_URL}/@${store.handle}/go/`;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <StudioHeader
        current={store}
        role={view.role}
        stores={view.stores}
        owned={view.owned}
        action={{ href: studioPath(store), label: "Back to the studio", short: "Studio" }}
      />
      <StudioStorePin sid={store.sid}>

      <main id="content" className="container-page pb-20 pt-10 sm:pt-14">
        <p className="eyebrow">Funnels</p>
        <h1 className="t-h2 mt-3">Funnels</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Pages walked in order from one address, and the offers a buyer meets right after paying.
        </p>

        <div className="mt-8">
          <FunnelTypePicker
            products={typeProducts}
            pagesLeft={Math.max(0, MAX_SITE_PAGES - store.sitePages.length)}
            canMakePages={can(view.role, "page")}
            funnelsLeft={Math.max(0, MAX_PAGE_FUNNELS - savedFunnels.length)}
            sid={store.sid}
          />
        </div>

        <div className="mt-8">
          <PageFunnelEditor saved={savedFunnels} choices={choices} base={funnelBase} />
        </div>

        <h2 className="mt-14 text-xl font-semibold tracking-[-0.02em] text-ink">Offers after they pay</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          {`Right after paying, the buyer sees one offer at a time on their thank-you page, up to ${MAX_FUNNEL_STEPS} per product. Each offer has a yes and a no thanks, and you choose where each one leads: another offer, a cheaper one after a no, or the end. Yes charges the card they just used, in one press, on your own Stripe account.`}
        </p>

        {store.tax.enabled ? (
          <div className="notice notice-warn mt-6">
            <p className="font-bold text-ink">Nothing is offered after paying while sales tax is on</p>
            <p className="mt-1 text-sm text-ink-soft">
              A one-click charge cannot carry Stripe Tax, so buyers are not shown these offers. What you set here is kept and
              is shown again the moment tax is off.
            </p>
          </div>
        ) : null}

        {owners.length === 0 ? (
          <div className="card mt-8 p-6 sm:p-8">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">Nothing to follow yet</p>
            <p className="mt-2 text-ink-soft">
              Offers follow a one-off paid product: a download, a link or a course. Add one in the studio and it appears here.
            </p>
            <Link href={`${studioPath(store)}#products`} className="btn btn-primary mt-5">Go to products</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
            <nav aria-label="Products" className="card min-w-0 p-3 lg:sticky lg:top-24">
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.08em] text-ink-mute">After buying</p>
              {owners.length > NAV_LIMIT ? (
                <form action="/studio/funnels" method="get" role="search" className="px-1 pb-3">
                  {store.sid ? <input type="hidden" name="store" value={store.sid} /> : null}
                  <label htmlFor="funnel-find" className="sr-only">Find a product by its name</label>
                  <input
                    id="funnel-find"
                    type="search"
                    name="q"
                    defaultValue={find}
                    placeholder="Find a product"
                    className="field field-search w-full"
                  />
                  <p className="mt-2 px-2 text-xs text-ink-mute" role="status">
                    {matching.length === 0
                      ? "Nothing has that in its name."
                      : `${Math.min(matching.length, NAV_LIMIT)} of ${matching.length.toLocaleString("en-US")} shown. Search to find another.`}
                  </p>
                </form>
              ) : null}
              <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:block lg:space-y-1 lg:overflow-visible">
                {listed.map((p) => {
                  const on = p.id === selected?.id;
                  // The one open is read in full; the rest are known to have offers or not.
                  const count = on ? selected?.funnel?.steps.length ?? 0 : withOffers.has(p.id) ? -1 : 0;
                  return (
                    <li key={p.id} className="shrink-0 lg:shrink">
                      <Link
                        href={studioPath(store, `product=${p.id}${find ? `&q=${encodeURIComponent(find)}` : ""}`, "funnels")}
                        aria-current={on ? "page" : undefined}
                        className={`flex min-h-[44px] items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-sm transition-colors ${
                          on ? "bg-lilac text-violet-ink" : "text-ink-soft hover:bg-paper hover:text-ink"
                        }`}
                      >
                        <span className="max-w-[14rem] truncate font-semibold">{p.title}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                            count ? "bg-mint-soft text-mint-deep" : "bg-sand text-ink-mute"
                          }`}
                        >
                          {count > 0 ? `${count} ${count === 1 ? "offer" : "offers"}` : count < 0 ? "Offers" : "None"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {selected ? (
              <FunnelEditor
                key={selected.id}
                owner={{ id: selected.id, title: selected.title, priceCents: selected.priceCents }}
                initial={selected.funnel}
                offerable={offerable.filter((p) => p.id !== selected.id)}
                pictures={pictures}
                ownerPrice={formatMoney(selected.priceCents, store.currency)}
                currency={store.currency}
              />
            ) : null}
          </div>
        )}
      </main>
      </StudioStorePin>
    </div>
  );
}
