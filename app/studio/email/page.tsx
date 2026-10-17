import { WHO, type Who } from "@/lib/contacts";
import { lookColours } from "@/lib/store-look";
import type { Metadata } from "next";
import { aiAvailableFor, aiLeft } from "@/lib/ai";
import { productLink } from "@/lib/checkout-recovery";
import { idsOfKind, readTitles } from "@/lib/catalog";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioPath, studioView } from "@/lib/studio-route";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { listCounts } from "@/lib/contacts";
import { listBroadcastsStrict } from "@/lib/broadcasts";
import { broadcastMoney, flowMoney, readMailRevenue, readMailVisits } from "@/lib/mail-revenue";
import { sellsSomething } from "@/lib/mail-starters";
import { readFlowStatsStrict } from "@/lib/flow-stats";
import { readFlowListStrict } from "@/lib/flow-list";
import { inTrial, monthlyAllowance, usedThisMonth } from "@/lib/mail";
import { healthId, pauseWords, pausedFor } from "@/lib/mail-health";
import { PRO_MONTHLY_EMAILS, PRO_ON_SALE, SCALE_MONTHLY_EMAILS, TRIAL_DAYS, TRIAL_MONTHLY_EMAILS, publishedPriceWords as priceWords, publishedYearSaving as yearSaving } from "@/lib/plan";
import { EmailStudio } from "@/components/email-studio";
import { readForms } from "@/lib/form-store";
import { readFields, readStages } from "@/lib/crm";
import { listDraftsStrict } from "@/lib/mail-drafts";
import { can } from "@/lib/team-roles";
import { trialOffered } from "@/lib/billing";
import { listSegments } from "@/lib/segments";
import { activeFlowLimit, dailyRunLimit } from "@/lib/flow-limits";
import { listHeld, runsToday } from "@/lib/flow-runs";
import { readTeam } from "@/lib/team";

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export const metadata: Metadata = {
  title: "Email — Marktmorgen",
  robots: { index: false, follow: false },
};

/** Writing to the people who agreed to hear from the creator. */
export default async function StudioEmailPage({ searchParams }: Params) {
  const query = await searchParams;
  // Which store, and whether this person's role there has "draft" (lib/studio-route.ts).
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "draft");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view } = found;
  const { store } = view;

  const allowance = monthlyAllowance(store);
  const [counts, used, loadedBroadcasts, loadedFlows, listings, loadedDrafts, pause] = await Promise.all([
    listCounts(store.listId),
    usedThisMonth(store.listId),
    listBroadcastsStrict(store.listId).catch(() => null),
    readFlowListStrict(store.listId).catch(() => null),
    // The names of the products a flow or a broadcast can be about: one
    // command, where reading every card was one per product (lib/catalog.ts).
    readTitles(store),
    listDraftsStrict(store.listId).catch(() => null),
    // Whether this store's list email is waiting out a week because too many
    // of its addresses bounced or reported it (lib/mail-health.ts).
    pausedFor(healthId(store)),
  ]);
  const broadcasts = loadedBroadcasts ?? [];
  const flows = loadedFlows ?? [];
  const drafts = loadedDrafts ?? [];
  const role = view.role;
  // What each email sold, from the creator's own Stripe account, cached for
  // ten minutes (lib/mail-revenue.ts). Asked only when something was sent.
  const [stats, revenue, visits] = await Promise.all([
    readFlowStatsStrict(flows).catch(() => null),
    broadcasts.length || flows.length ? readMailRevenue(store) : Promise.resolve(null),
    // And how many times its links opened a page of the store, from the
    // store's own count of visits by tag: nothing in the email reports back.
    readMailVisits(store, broadcasts.filter((b) => b.status === "sent" && b.tagged).map((b) => b.id)),
  ]);
  const trial = allowance > 0 && inTrial(store);

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
        <p className="eyebrow">Email</p>
        <h1 className="t-h2 mt-3">Write to your list</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Only the people who agreed to hear from you are written to: those who checked the box when they got
          something free or bought from you, and those you import who agreed elsewhere. Every email carries a
          one-click unsubscribe, and anyone who leaves is never written to again.
        </p>

        {allowance === 0 ? (
          <div className="card mt-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold tracking-[-0.02em] text-ink">Part of Pro</p>
              <span className="tag tag-brand">{priceWords("pro", "month")}</span>
            </div>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>One-off emails to everyone on your list, or only to those who got one product.</li>
              <li>Readers chosen by what they spent with you, where they first found you or when they last bought, saved as groups to use again.</li>
              <li>Emails scheduled for the day and time you choose.</li>
              <li>Sequences that go out by themselves, hours or days after someone joins or buys.</li>
              <li>{`Up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month, sent from your name, with replies coming to you.`}</li>
              <li>Import the list you already have, and take it with you as a file whenever you like.</li>
            </ul>
            <p className="mt-4 text-sm text-ink-soft">
              {`${priceWords("pro", "month")}, or ${priceWords("pro", "year")} — $${yearSaving("pro") / 100} less. Everything else in your store stays exactly as it is.`}
            </p>
            {!can(role, "billing") ? (
              <p className="mt-5 rounded-[var(--r-md)] bg-sand p-4 text-sm text-ink-soft">
                The store&apos;s owner chooses its plan. When they move it to Pro, email opens here for you too.
              </p>
            ) : store.subscriptionActive ? (
              <form action={`/api/billing/switch?store=${store.sid}`} method="post" className="mt-5">
                <input type="hidden" name="tier" value="pro" />
                <input type="hidden" name="cycle" value={store.cycle} />
                <button type="submit" className="btn btn-primary">Move up to Pro</button>
              </form>
            ) : (
              <form action={`/api/billing/checkout?store=${store.sid}`} method="post" className="mt-5 flex flex-col items-start gap-3">
                <input type="hidden" name="tier" value="pro" />
                <button type="submit" name="cycle" value="month" className="btn btn-primary btn-wrap">
                  {trialOffered(store)
                    ? `Start the ${TRIAL_DAYS}-day trial on Pro — ${priceWords("pro", "month")} after that`
                    : `Start Pro — ${priceWords("pro", "month")}, from today`}
                </button>
                <button type="submit" name="cycle" value="year" className="btn btn-secondary btn-wrap">
                  {`Or Pro yearly: ${priceWords("pro", "year")}`}
                </button>
              </form>
            )}
            <p className="mt-3 text-sm text-ink-soft">
              {`During the free trial a store sends up to ${TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month; the full ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} opens with the first payment.`}
            </p>
          </div>
        ) : (
          <>
          {pause ? (
            <div role="status" className="mt-8 rounded-[var(--r-md)] border border-line bg-sand p-5 text-ink">
              <p className="font-semibold">Email to your list is paused</p>
              <p className="mt-2 text-sm text-ink-soft">{pauseWords(pause)}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {pause.reason === "bounces"
                  ? "This usually means a list brought in from somewhere else held old addresses. You do not need to do anything: you can keep writing and scheduling, and the rest of your store is not affected."
                  : "This usually means people on the list did not expect to hear from you. You can keep writing and scheduling, and the rest of your store is not affected."}
              </p>
            </div>
          ) : null}
          <EmailStudio
            accent={lookColours(store.look).accent}
            email={view.email}
            canSend={can(role, "send")}
            canSettings={can(role, "settings")}
            canExport={can(role, "export")}
            drafts={drafts.map(({ id, subject, body, productId, by, savedAt, audience, subjectTest }) => ({ id, subject, body, productId, by, savedAt, subjectTest, ...audience }))}
            name={store.name}
            mail={store.mail}
            counts={counts}
            used={used}
            allowance={allowance}
            trial={trial}
            // The way up for a list that has outgrown Pro, offered beside the
            // month's count to whoever may change the plan (lib/plan.ts).
            moveUp={
              PRO_ON_SALE && store.tier === "pro" && store.subscriptionActive && can(role, "billing")
                ? {
                    action: `/api/billing/switch?store=${store.sid}`,
                    cycle: store.cycle,
                    price: priceWords("scale", store.cycle),
                    emails: SCALE_MONTHLY_EMAILS,
                    trial,
                  }
                : null
            }
            products={[...listings].map(([id, title]) => ({ id, title }))}
            broadcastsReadFailed={loadedBroadcasts === null}
            broadcasts={broadcasts.map((b) => ({
              id: b.id,
              subject: b.subject,
              status: b.status,
              sendAt: b.sendAt,
              finishedAt: b.finishedAt,
              total: b.total,
              sent: b.sent,
              note: b.note,
              productId: b.productId,
              who: b.who,
              notProductId: b.notProductId,
              narrow: b.narrow,
              tagged: b.tagged,
              money: broadcastMoney(revenue, b.id),
              visits: visits?.[b.id] ?? null,
              test: b.test,
            }))}
            currency={store.currency}
            sells={sellsSomething(store)}
            flowsReadFailed={loadedFlows === null}
            draftsReadFailed={loadedDrafts === null}
            flows={flows.map((f) => ({ ...f, statsAvailable: stats?.has(f.id) ?? false, stats: stats?.get(f.id) ?? { started: 0, sent: 0, reached: 0, skipped: 0, acted: 0 }, money: flowMoney(revenue, f.id) }))}
            links={Object.fromEntries([...listings].map(([id]) => [id, productLink(store, id)]))}
            ai={aiAvailableFor(store) && can(role, "draft") ? { on: true, left: await aiLeft(store).catch(() => 0) } : { on: false, left: 0 }}
            segments={await listSegments(store.listId).catch(() => [])}
            preset={typeof query.who === "string" && (WHO as readonly string[]).includes(query.who) ? { who: query.who as Who } : undefined}
            courses={idsOfKind(store, "course")}
            paidProducts={idsOfKind(store, "paid")}
            automation={{
              forms: (await readForms(store.statsId).catch(() => [])).filter((f) => f.fields.some((x) => x.type === "email")).map((f) => ({ id: f.id, name: f.name })),
              fields: (await readFields(store.statsId).catch(() => [])).map((f) => ({ id: f.id, name: f.name, type: f.type, options: f.options })),
              stages: (await readStages(store.statsId).catch(() => [])).map((st) => ({ id: st.id, name: st.name })),
            }}
            workflowLimits={{
              maxActive: activeFlowLimit(store),
              dailyRuns: dailyRunLimit(store),
              runsToday: await runsToday(store.listId),
              held: can(role, "send") ? ((await listHeld(store.listId, 500).catch(() => null))?.length ?? null) : null,
            }}
            assignees={can(role, "send") ? [store.email.toLowerCase(), ...(await readTeam(store.sid).catch(() => ({ members: [] as { email: string; role: Parameters<typeof can>[0] }[] }))).members.filter((m) => can(m.role, "orders")).map((m) => m.email.toLowerCase())] : []}
          />
          </>
        )}
      </main>
      </StudioStorePin>
    </div>
  );
}
