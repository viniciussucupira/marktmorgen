import { stepStates } from "@/lib/page-funnel-store";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { is, done } from "./check";

async function main() {
  const product = { id: "product001", title: "Course", priceCents: 500, hidden: false, call: null, slug: "course" };
  const partial = { handle: "shop", sitePages: [], catalog: { id: "catalog1", head: [], inline: [], items: [{ id: product.id }] } } as unknown as Store;
  const funnel = { steps: [{ kind: "product" as const, id: product.id }] };
  let rejected = false;
  try { await stepStates(partial, funnel, { strictProducts: true }); } catch { rejected = true; }
  is("indexed but unreadable product remains unknown", rejected, true);
  is("legacy visitor behavior is unchanged", (await stepStates(partial, funnel))[0].open, false);
  const full = { ...partial, catalog: { ...partial.catalog, inline: [product] } } as unknown as Store;
  is("fully loaded product remains available", (await stepStates(full, funnel, { strictProducts: true }))[0].open, true);
  const draft = { ...partial, catalog: { ...partial.catalog, inline: [{ ...product, hidden: true }] } } as unknown as Store;
  is("confirmed draft is unavailable rather than unknown", (await stepStates(draft, funnel, { strictProducts: true }))[0].why.includes("draft"), true);
  const removed = { ...partial, catalog: { ...partial.catalog, items: [] } } as unknown as Store;
  is("confirmed removed identity retains deleted state", (await stepStates(removed, funnel, { strictProducts: true }))[0].why.includes("deleted"), true);
  const pipeline = redis.pipeline;
  redis.pipeline = async () => { throw new Error("storage unavailable"); };
  try {
    const remote = { ...partial, catalog: { ...partial.catalog, inline: undefined } } as unknown as Store;
    let failed = false;
    try { await stepStates(remote, funnel, { strictProducts: true }); } catch { failed = true; }
    is("strict transport failure remains unavailable", failed, true);
    is("no-product journey needs no product read", await stepStates(remote, { steps: [] }, { strictProducts: true }), []);
  } finally { redis.pipeline = pipeline; }
  done();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
