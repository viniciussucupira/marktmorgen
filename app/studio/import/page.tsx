import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioPath, studioView } from "@/lib/studio-route";
import { StudioHeader } from "@/components/studio-header";
import { StudioStorePin } from "@/components/studio-store-pin";
import { Icon, type IconName } from "@/components/icons";
import { type ImportJob, IMPORT_LIMITS, storeImports } from "@/lib/imports";
import { ImportProgress, ImportTool, type ImportKind, type ImportView } from "@/components/import-tool";
import { isPaidUp } from "@/lib/billing";
import { isSenderConfigured } from "@/lib/email";
import { listCounts } from "@/lib/contacts";
import { productCount } from "@/lib/catalog";
import { MAX_PRODUCTS } from "@/lib/store";
import { moveCounts } from "@/lib/move-members";

export const metadata: Metadata = {
  title: "Moving from another platform — Marktmorgen",
  robots: { index: false, follow: false },
};

type Params = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const TABS: { kind: ImportKind; title: string; text: string; icon: IconName }[] = [
  {
    kind: "contacts",
    title: "Your email list",
    text: `Up to ${IMPORT_LIMITS.contacts.toLocaleString("en-US")} people who agreed to hear from you.`,
    icon: "mail",
  },
  {
    kind: "products",
    title: "Your products",
    text: `Up to ${IMPORT_LIMITS.products.toLocaleString("en-US")} at once, as drafts to check and publish.`,
    icon: "tag",
  },
  {
    kind: "purchases",
    title: "Your past buyers",
    text: `Up to ${IMPORT_LIMITS.purchases.toLocaleString("en-US")} rows: they keep their courses and files.`,
    icon: "users",
  },
  {
    kind: "members",
    title: "Your members",
    text: `Up to ${IMPORT_LIMITS.members.toLocaleString("en-US")}: each keeps their membership here, first paying on its renewal date.`,
    icon: "repeat",
  },
];

const DATE = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

function view(job: ImportJob): ImportView {
  return {
    id: job.id,
    kind: job.kind,
    state: job.state,
    file: job.file,
    at: job.at,
    finishedAt: job.finishedAt,
    expected: job.expected,
    total: job.total,
    done: job.done,
    counts: job.counts,
    email: job.options.email,
  };
}

/**
 * Moving from another platform: a creator's list, products and past buyers,
 * brought over from a spreadsheet the old platform exports (lib/imports.ts).
 * For the owner and admins (the "import" permission, lib/team-roles.ts).
 */
export default async function StudioImportPage({ searchParams }: Params) {
  const query = await searchParams;
  const found = await studioView(await cookies(), typeof query.store === "string" ? query.store : undefined, "import");
  if (!found.ok) {
    if (found.reason === "signed_out") redirect("/signin");
    redirect(found.store ? studioPath(found.store, "team=forbidden") : "/studio");
  }
  const { view: access } = found;
  const { store } = access;
  const kind: ImportKind = query.what === "products" || query.what === "purchases" || query.what === "members" ? query.what : "contacts";
  const [jobs, counts, moved] = await Promise.all([
    storeImports(store).catch(() => []),
    listCounts(store.listId).catch(() => null),
    kind === "members" ? moveCounts(store).catch(() => null) : Promise.resolve(null),
  ]);
  const running = jobs.find((job) => job.state === "receiving" || job.state === "queued" || job.state === "running" || job.state === "mailing") ?? null;
  const past = jobs.filter((job) => job.id !== running?.id);
  const tab = TABS.find((t) => t.kind === kind)!;
  const facts: Record<ImportKind, string> = {
    contacts: counts ? `Your list has ${counts.mailable.toLocaleString("en-US")} people you may email now.` : "",
    products: `Your store has ${productCount(store).toLocaleString("en-US")} of ${MAX_PRODUCTS.toLocaleString("en-US")} products.`,
    purchases: "Products are matched by their name or their id in your store, so bring your products over first.",
    members: moved && moved.invited
      ? `${moved.invited.toLocaleString("en-US")} ${moved.invited === 1 ? "member" : "members"} invited so far, and ${moved.kept.toLocaleString("en-US")} kept their membership here.`
      : "Make the membership in your store first, at the same price, then bring its members.",
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <StudioHeader
        current={store}
        role={access.role}
        stores={access.stores}
        owned={access.owned}
        action={{ href: studioPath(store), label: "Back to the studio", short: "Studio" }}
      />
      <StudioStorePin sid={store.sid}>
        <main id="content" className="container-page pb-20 pt-10 sm:pt-14">
          <p className="eyebrow">Moving from another platform</p>
          <h1 className="t-h2 mt-3">Bring your store with you</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Export a spreadsheet from Stan, Gumroad, Kajabi, Patreon, Mailchimp or anywhere else, choose it here, and say which column is
            which. Every row is checked the way the studio checks what you type, and any row that could not be brought in is
            listed in a file you can download, with the reason.
          </p>

          <nav aria-label="What to import" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TABS.map((t) => {
              const on = t.kind === kind;
              return (
                <Link
                  key={t.kind}
                  href={studioPath(store, `what=${t.kind}`, "import")}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-[44px] items-start gap-3 rounded-2xl p-4 ring-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-brand ${
                    on ? "bg-lilac ring-violet-brand/40" : "bg-white ring-line hover:ring-violet-brand/40"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? "bg-white text-violet-deep" : "bg-lilac text-violet-deep"}`}>
                    <Icon name={t.icon} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{t.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{t.text}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <section className="card min-w-0 p-5 sm:p-7" aria-labelledby="import-title">
              <h2 id="import-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
                {tab.title}
              </h2>
              {facts[kind] ? <p className="mt-1 text-sm text-ink-soft">{facts[kind]}</p> : null}
              <div className="mt-5">
                <ImportTool
                  key={kind}
                  kind={kind}
                  active={running ? view(running) : null}
                  canEmail={isPaidUp(store) && isSenderConfigured()}
                  storeName={store.name}
                />
              </div>
            </section>

            <aside className="card min-w-0 p-5 sm:p-6" aria-labelledby="past-title">
              <h2 id="past-title" className="text-base font-semibold text-ink">
                Your last imports
              </h2>
              {past.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">None yet. Each one is listed here for two weeks, with its report.</p>
              ) : (
                <ul className="mt-3 space-y-4">
                  {past.map((job) => (
                    <li key={job.id}>
                      <p className="text-sm font-semibold text-ink">{`${TABS.find((t) => t.kind === job.kind)?.title ?? job.kind}${job.file ? `: ${job.file}` : ""}`}</p>
                      <p className="mb-2 text-xs text-ink-soft">{`${DATE.format(new Date(job.at))} UTC · ${job.total.toLocaleString("en-US")} rows`}</p>
                      <ImportProgress job={view(job)} compact />
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </main>
      </StudioStorePin>
    </div>
  );
}
