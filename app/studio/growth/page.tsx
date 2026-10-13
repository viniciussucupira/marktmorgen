import { readFunnelPaymentChecks } from "@/lib/funnel-payment-checks";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { studioPath, studioView } from "@/lib/studio-route";
import { can } from "@/lib/team-roles";
import { GROWTH_GOALS, growthActions, growthGoal } from "@/lib/growth-plan";
import { dealFollowUps } from "@/lib/crm-rules";
import { readDeals, readStages } from "@/lib/crm";
import { readPageFunnels, stepStates } from "@/lib/page-funnel-store";

export const metadata: Metadata = { title: "Growth — Marktmorgen", robots: { index: false, follow: false } };
type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

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
  const today = new Date().toISOString().slice(0, 10);
  const actions = growthActions(goal, role);
  let follow: ReturnType<typeof dealFollowUps> | null = null;
  let funnels: { name: string; unavailable: number; paymentIssues: string[] | null; on: boolean }[] | null = null;
  let followFailed = false;
  let funnelsFailed = false;
  if (can(role, "orders")) {
    try { const stages = await readStages(store.statsId); follow = dealFollowUps(stages, await readDeals(store.statsId, stages), today); }
    catch { followFailed = true; }
  }
  if (can(role, "products")) {
    try { funnels = await Promise.all((await readPageFunnels(store.statsId)).map(async f => ({ name: f.name, on: f.on, paymentIssues: await readFunnelPaymentChecks(store, f).catch(() => null), unavailable: (await stepStates(store, f)).filter(s => !s.open).length }))); }
    catch { funnelsFailed = true; }
  }
  const attention = funnels?.filter(f => f.on && (f.unavailable > 0 || f.paymentIssues === null || f.paymentIssues.length > 0)) ?? [];
  const linkFor = (path: string) => path.startsWith("#") ? studioPath(store) + path : studioPath(store, "", path);
  return <div className="min-h-screen bg-paper text-ink">
    <StudioHeader current={store} role={role} stores={view.stores} owned={view.owned} action={{ href: studioPath(store), label: "Back to the studio", short: "Studio" }} />
    <StudioStorePin sid={store.sid}>
      <main id="content" className="container-page pb-20 pt-10 sm:pt-14">
        <p className="eyebrow">Growth</p><h1 className="t-h2 mt-3">Choose your next business goal</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">A short plan that connects the tools you already have. These are practical starting points, not forecasts or promises of more sales.</p>
        <nav aria-label="Growth goals" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GROWTH_GOALS.map(g => <Link key={g.id} href={studioPath(store, "goal=" + g.id, "growth")} aria-current={goal === g.id ? "page" : undefined} className={"card min-h-32 p-5 " + (goal === g.id ? "ring-2 ring-violet-brand" : "")}><span className="font-semibold">{g.label}</span><span className="mt-2 block text-sm text-ink-soft">{g.hint}</span></Link>)}
        </nav>
        <section aria-labelledby="growth-plan" className="card mt-8 p-5 sm:p-8">
          <h2 id="growth-plan" className="text-lg font-semibold">Your next steps</h2>
          {actions.length ? <ol className="mt-5 space-y-4">{actions.map((a,i) => <li key={a.title} className="flex items-start gap-4"><span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lilac font-semibold">{i+1}</span><div><Link className="inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4" href={linkFor(a.path)}>{a.title}</Link><p className="text-sm text-ink-soft">{a.why}</p></div></li>)}</ol> : <p className="mt-4 text-sm text-ink-soft">Your role does not include the tools for this goal. Ask the store owner to work through this plan.</p>}
        </section>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {follow || followFailed ? <section className="card p-5 sm:p-8" aria-labelledby="growth-deals"><h2 id="growth-deals" className="font-semibold">Opportunities to follow up</h2>{followFailed ? <p className="mt-3 text-sm text-ink-soft">We could not read the deals right now. No conclusion has been made about them.</p> : <><p className="mt-3 text-sm text-ink-soft">{follow!.overdue.length} overdue, {follow!.today.length} due today, {follow!.unplanned.length} without a dated next action.</p><p className="mt-2 text-xs text-ink-mute">Open deals only. Calendar day: {today} (UTC).</p></>}<Link className="btn btn-secondary mt-4" href={studioPath(store, "", "deals")}>Review deals</Link></section> : null}
          {funnels || funnelsFailed ? <section className="card p-5 sm:p-8" aria-labelledby="growth-funnels"><h2 id="growth-funnels" className="font-semibold">Check the journey</h2>{funnelsFailed ? <p className="mt-3 text-sm text-ink-soft">We could not read the funnels right now. Open the editor to check them.</p> : attention.length ? <ul className="mt-3 space-y-2 text-sm text-ink-soft">{attention.map(f => <li key={f.name}>{f.name}: {f.unavailable} unavailable step(s). {f.paymentIssues === null ? "Payment configuration could not be checked." : `${f.paymentIssues.length} offer configuration issue(s).`}</li>)}</ul> : <p className="mt-3 text-sm text-ink-soft">{funnels!.length ? "No blocker found in the available steps or saved offer configuration. Test live checkout, free sign-up, email and delivery separately." : "No page funnels yet. Start from a type and choose your products."}</p>}<Link className="btn btn-secondary mt-4" href={studioPath(store, "", "funnels")}>Review funnels</Link></section> : null}
        </div>
      </main>
    </StudioStorePin>
  </div>;
}
