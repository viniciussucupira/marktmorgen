import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioPath, studioView } from "@/lib/studio-route";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { FormsEditor, type SavedForm } from "@/components/forms-editor";
import { readForms, readResponses } from "@/lib/form-store";
import { readCards } from "@/lib/catalog";
import { readTeam } from "@/lib/team";
import { readStages } from "@/lib/crm";
import { can } from "@/lib/team-roles";

export const metadata: Metadata = {
  title: "Forms — Marktmorgen",
  robots: { index: false, follow: false },
};

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

/** How many answers of each form the studio lists; the file has all of them. */
const SHOWN = 50;

/**
 * The store's forms, surveys and quizzes (lib/forms.ts), and their answers.
 * Making them is part of the public page ("page"); their answers are shown
 * only to a role that may also download the store's files ("export"), since
 * they can hold people's addresses and words.
 */
export default async function StudioFormsPage({ searchParams }: Params) {
  const query = await searchParams;
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "page");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view } = found;
  const { store } = view;
  const reads = can(view.role, "export");
  const forms = await readForms(store.statsId);
  const canCreateDeals = reads && can(view.role, "orders");
  const [dealStages, team] = canCreateDeals ? await Promise.all([readStages(store.statsId), readTeam(store.sid)]) : [[], null];
  const dealAssignees = team ? [...new Set([store.email, ...team.members.filter(member => can(member.role, "orders")).map(member => member.email)])] : [];
  const saved: SavedForm[] = await Promise.all(
    forms.map(async (form) => {
      const { responses, total } = reads ? await readResponses(store.statsId, form.id, SHOWN) : { responses: [], total: 0 };
      return { form, total, latest: responses };
    }),
  );
  const cards = await readCards(store);
  const products = [...cards.values()].map((p) => ({ id: p.id, title: p.title }));
  const sid = store.sid;

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
          <p className="eyebrow">Forms</p>
          <h1 className="t-h2 mt-3">Forms, surveys and quizzes</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Ask your questions on one of your own pages: add a Form block to it under Pages. On a page that is a step of a funnel, sending the form leads on to the
            next step.
          </p>
          <div className="mt-8">
            <FormsEditor currency={store.currency} dealAssignees={dealAssignees} sid={sid} dealStages={dealStages} saved={saved} products={products} exportBase={`/api/store/forms/export?${sid ? `store=${sid}&` : ""}id=`} />
          </div>
          {!reads && forms.length ? <p className="mt-4 text-sm text-ink-soft">Your role does not see the answers: they can hold people&apos;s addresses and words.</p> : null}
        </main>
      </StudioStorePin>
    </div>
  );
}
