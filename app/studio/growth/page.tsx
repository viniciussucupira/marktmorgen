import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { studioPath, studioView } from "@/lib/studio-route";
import { GROWTH_GOALS, growthActions, growthGoal } from "@/lib/growth-plan";

export const metadata: Metadata = { title: "Growth — Marktmorgen", robots: { index: false, follow: false } };
type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

/** Navigation only beyond the existing counted studio view. No CRM/funnel
 * snapshots, provider calls, new records or automatic actions. */
export default async function GrowthPage({ searchParams }: Params) {
  const query = await searchParams;
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "member");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view } = found;
  const { store, role } = view;
  const goal = growthGoal(query.goal);
  const actions = growthActions(goal, role);
  const linkFor = (path: string) => path.startsWith("#") ? studioPath(store) + path : studioPath(store, "", path);
  return <div className="min-h-screen bg-paper text-ink">
    <StudioHeader current={store} role={role} stores={view.stores} owned={view.owned} action={{ href: studioPath(store), label: "Back to the studio", short: "Studio" }} />
    <StudioStorePin sid={store.sid}>
      <main id="content" className="container-page pb-20 pt-10 sm:pt-14">
        <p className="eyebrow">Growth</p>
        <h1 className="t-h2 mt-3">Choose your next business goal</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">Connect the tools you already have. These are practical starting points, not forecasts or promises of more sales.</p>
        <nav aria-label="Growth goals" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GROWTH_GOALS.map(item => <Link key={item.id} prefetch={false} href={studioPath(store, "goal=" + item.id, "growth")} aria-current={goal === item.id ? "page" : undefined} className={"card min-h-32 p-5 " + (goal === item.id ? "ring-2 ring-violet-deep" : "")}>
            <span className="font-semibold">{item.label}</span>
            <span className="mt-2 block text-sm text-ink-soft">{item.hint}</span>
          </Link>)}
        </nav>
        <section aria-labelledby="growth-plan" className="card mt-8 p-5 sm:p-8">
          <h2 id="growth-plan" className="text-lg font-semibold">Your next steps</h2>
          {actions.length ? <ol className="mt-5 space-y-4">{actions.map((action,index) => <li key={action.title} className="flex items-start gap-4">
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lilac font-semibold">{index+1}</span>
            <div className="min-w-0"><Link prefetch={false} className="inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4" href={linkFor(action.path)}>{action.title}</Link><p className="text-sm text-ink-soft">{action.why}</p></div>
          </li>)}</ol> : <p className="mt-4 text-sm text-ink-soft">Your role does not include the tools for this goal. Ask the store owner to work through this plan.</p>}
          <p className="mt-5 text-sm text-ink-soft">Open the relevant tool to review its current records. This guide does not check live checkout, delivery, consent or campaign readiness, and starts nothing automatically.</p>
        </section>
      </main>
    </StudioStorePin>
  </div>;
}
