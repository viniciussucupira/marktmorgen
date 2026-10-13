import { dealActionFilter } from "@/lib/crm-deal-filter";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioPath, studioView } from "@/lib/studio-route";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { DealsBoard } from "@/components/deals-board";
import { readTeam } from "@/lib/team";
import { can } from "@/lib/team-roles";
import { readDeals, readFields, readStages } from "@/lib/crm";

export const metadata: Metadata = {
  title: "Deals and fields — Marktmorgen",
  robots: { index: false, follow: false },
};

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

/**
 * A store's deals and its own fields about each person (lib/crm-rules.ts),
 * for a role that may read orders with buyers' addresses ("orders"): a deal
 * names a person, and a field is something kept about one.
 */
export default async function StudioDealsPage({ searchParams }: Params) {
  const query = await searchParams;
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "orders");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view } = found;
  const { store } = view;
  const [fields, stages] = await Promise.all([readFields(store.statsId), readStages(store.statsId)]);
  const [deals, team] = await Promise.all([readDeals(store.statsId, stages), readTeam(store.sid)]);
  const assignees = [store.email, ...team.members.filter(m => can(m.role, "orders")).map(m => m.email)];
  const today = new Date().toISOString().slice(0, 10);

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
          <p className="eyebrow">Deals and fields</p>
          <h1 className="t-h2 mt-3">Your deals and what you keep about people</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Only your team sees any of this, and nothing here sends anything to anybody. Each person&apos;s answers to your fields are on their page under{" "}
            <a className="underline underline-offset-4" href={studioPath(store, "", "people")}>
              Buyers
            </a>
            .
          </p>
          <div className="mt-8">
            <DealsBoard key={(store.sid || store.handle) + ":" + dealActionFilter(query.followup)} deals={deals} stages={stages} fields={fields} currency={store.currency} assignees={assignees} today={today} initialFilter={dealActionFilter(query.followup)} />
          </div>
        </main>
      </StudioStorePin>
    </div>
  );
}
