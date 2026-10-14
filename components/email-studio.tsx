"use client";

import { AiAssist, AiOn } from "@/components/ai-assist";
import { EMAIL_GOALS, type EmailGoal } from "@/lib/ai-rules";
import { DEFAULT_SEQUENCE_DRAFT, type DraftedStep, SEQUENCE_DRAFT_COUNTS } from "@/lib/sequence-draft";
import { PRO_MONTHLY_EMAILS, TRIAL_MONTHLY_EMAILS } from "@/lib/plan";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLeaveGuard } from "@/components/leave-guard";
import { mailAnswer, type MailAnswer } from "@/lib/mail-response";
import { toast } from "@/components/toast";
import { MailAccent, MailBodyEditor } from "@/components/mail-designer";
import { flowConfigurationIssues } from "@/lib/flow-review";
import type { Flow, FlowCounts, FlowStep } from "@/lib/flows";
import { flowWaitHours, type FlowAction, MAX_CONDITION_TAG, type StepCondition, type StepIf, isCourseIf } from "@/lib/flow-rules";
import type { MailSettings } from "@/lib/store";
import { StoreField } from "@/components/studio-store-pin";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { formatMoney } from "@/lib/money";
import { MIN_TEST_REACH, TEST_HOURS, TEST_SHARES, type SubjectTest, type TestBy } from "@/lib/mail-test";
import { type Currency, plainAmount, readMoney } from "@/lib/money";
import { channelName } from "@/lib/channel-names";
import { type Narrow, QUIET_DAYS, type Segment } from "@/lib/segments-rules";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  from_name: "Type the name your emails are from.",
  address: "Type a postal address where you can be reached: a street address or a PO box. The law in the United States asks for one in every email like this.",
  confirm: "Check the box to confirm the people you are importing agreed to hear from you.",
  no_addresses: "No email addresses were found in what you pasted.",
  too_many: "That is more than one import takes. Split it into files of 5,000 addresses or fewer.",
  subject: "Write a subject line.",
  body: "Write the email itself.",
  placeholder: "Part of the template is still in ⟦brackets⟧. Replace each with your own words, or remove it, before it can go out.",
  when: "Pick a time between now and a year from now.",
  product: "That product is not in your store anymore.",
  empty: "Nobody on your list matches, so there is nobody to send it to yet.",
  test_subject: "Write a second subject line that is different from the first, or uncheck the test.",
  test_small: `Trying two subject lines needs at least ${MIN_TEST_REACH} people, or each line reaches too few for the result to mean anything. Send it without the test, or to a bigger group.`,
  test_links:
    "Two subject lines are compared by the visits and sales the email's links bring, and this email has no link to your store. Add a link to your store or to a product, or send it without the test.",
  allowance: "This goes to more people than this month's emails have left. Send it to a smaller group, or next month.",
  day: "Today's sending is full. A test can go out again tomorrow.",
  sender: "Email is waiting on our side: the service that sends it has reached the volume it allows us for now. Nothing was sent; it opens again by itself as soon as there is room.",
  setup: "Save the name and postal address your emails carry first, at the top of this page.",
  plan: "Email to your list is part of Pro.",
  name: "Give the sequence a name.",
  trigger: "Choose what starts the sequence.",
  steps: "A sequence has between one and ten steps.",
  step: "Every email needs a subject, some text, and a wait of up to a year. A condition needs its product, or its label, and one on the email before needs an email right before it. A label needs its words, and another sequence has to still be there. A field needs a value it keeps, a deal a stage, and a note its words.",
  tag: "Write the label that starts the sequence.",
  form: "Choose one of your forms that asks for an email address.",
  unknown: "That is not there anymore. Reload the page.",
  send: "The email service did not take it just now. Nothing was sent; try again in a moment.",
  signed_out: "Your session ended. Log in again.",
  unavailable: "Email is not switched on yet, so nothing was sent.",
  full: "A store keeps 20 drafts at most. Send or delete one first.",
  list: "This store has no list yet, so there is nowhere to keep a draft.",
  role: "Your role on this store does not include this.",
  starters_nothing: "Your store already has a sequence for each of those moments. They are under Sequences.",
  keep_unsent: "Only an email that has finished going out can be kept sending.",
  keep_excludes:
    "This email was narrowed two ways at once, and an email in a sequence keeps one condition. Write it again instead, and choose who it goes to.",
  goal: "That ending would stop the sequence before its first email. Choose another, or none.",
  keep_money:
    "This email was sent to people chosen by what they spent, where they came from or when they last bought, and a sequence cannot choose that way. Write it again instead.",
  stripe: "Your Stripe account could not be read just now, so spending, channels and last purchases cannot be counted. Try again in a moment.",
  segment_name: "Give the group a name.",
  segment_empty: "Choose who the group is first: a kind of reader, a product, someone to leave out, or one of the three ways below.",
  segment_product: "That product is not in your store anymore.",
  segment_full: "A store keeps 20 saved groups at most. Remove one first.",
  keep_already: "This email is already going to new people by itself. It is under Sequences.",
  keep_full: "That sequence already holds 10 emails. Remove one under Sequences first.",
  too_many_flows: "A store keeps 10 sequences at most. Remove one under Sequences first.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

type Answer = MailAnswer;

async function call(payload: Record<string, unknown>): Promise<Answer> {
  try {
    const response = await fetch("/api/store/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return mailAnswer(response.ok, await response.json().catch(() => null));
  } catch {
    return { ok: false, error: "server_error" };
  }
}

const message = (a: Answer) => MESSAGES[a.error ?? ""] ?? MESSAGES.server_error;
const n = (x: number) => x.toLocaleString("en-US");

type BroadcastRow = {
  id: string;
  subject: string;
  status: string;
  sendAt: number;
  finishedAt: number;
  total: number;
  sent: number;
  note: string;
  productId: string | null;
  /** Everybody, only buyers, or only people who have not bought yet (lib/contacts.ts). */
  who: Who;
  /** Left out the people who own this product. */
  notProductId: string | null;
  /** Narrowed by spending, first channel or quiet days (lib/segments.ts); null for none. */
  narrow?: Narrow | null;
  /** Whether its links carry its tag, so its sales can be counted at all (lib/mail-links.ts). */
  tagged: boolean;
  /** What it sold, from the creator's own Stripe account; null when nothing is counted for it. */
  money: Money | null;
  /** Pages of the store opened through its links; null when that could not be read. */
  visits: number | null;
  /** The second subject line it tried, and how that went (lib/mail-test.ts). */
  test: SubjectTest | null;
};
type Money = { sales: number; cents: number };
type FlowRow = Flow & { stats: FlowCounts; statsAvailable?: boolean; money: Money | null };

/** "3 sales · $117.00 from its links in the last 90 days", in the store's own currency. */
function soldWords(money: Money, currency: string): string {
  return `${n(money.sales)} ${money.sales === 1 ? "sale" : "sales"} · ${formatMoney(money.cents, currency)} from its links in the last 90 days`;
}

/**
 * What a sent email brought: "42 visits · 3 sales · $117.00 from its links in
 * the last 90 days". Visits are left out, never shown as none, when they
 * could not be read.
 */
function broughtWords(visits: number | null, money: Money | null, currency: string): string {
  const came = visits === null ? "" : `${n(visits)} ${visits === 1 ? "visit" : "visits"}`;
  if (money) return `${came ? `${came} · ` : ""}${soldWords(money, currency)}`;
  if (came && visits) return `${came} from its links in the last 90 days · no sale yet`;
  return came ? "No visit or sale from its links yet" : "No sale from its links yet";
}

/**
 * Who a sent email goes on reaching once it is kept sending (lib/mail-reuse.ts):
 * "Everyone who joins and has not bought yet".
 */
function keptWords(b: Pick<BroadcastRow, "who" | "productId" | "notProductId">, products: { id: string; title: string }[]): string {
  const title = (id: string | null) => products.find((p) => p.id === id)?.title ?? "that product";
  const start =
    b.who === "buyers" && !b.productId
      ? "Everyone who buys something for the first time"
      : b.productId
        ? `Everyone who gets ${title(b.productId)}`
        : "Everyone who joins";
  if (b.notProductId) return `${start} and does not have ${title(b.notProductId)}`;
  if (b.who === "leads") return `${start} and has not bought yet`;
  if (b.who === "buyers" && b.productId) return `${start} and has paid`;
  return start;
}

/** Whether a sent email can be kept sending: narrowed at most one way beyond what starts its sequence. */
/** How an email was narrowed by money, in one line (lib/segments.ts). */
function narrowWords(narrow: Narrow, currency: string): string {
  const parts = [
    narrow.minSpent ? `spent at least ${formatMoney(narrow.minSpent, currency)}` : "",
    narrow.channel ? `first came through ${channelName(narrow.channel)}` : "",
    narrow.quietDays ? `had not bought in ${narrow.quietDays} days` : "",
  ].filter(Boolean);
  return `Only those who ${parts.join(", ")}.`;
}

function keepable(b: Pick<BroadcastRow, "who" | "productId" | "notProductId" | "narrow">): boolean {
  // Chosen by spending, a channel or quiet days: a sequence cannot choose that way (lib/mail-reuse.ts).
  if (b.narrow) return false;
  return [Boolean(b.notProductId), b.who === "leads", b.who === "buyers" && Boolean(b.productId)].filter(Boolean).length < 2;
}

/** "a day", "4 hours": how long the rest of a list waits for a subject test. */
function hoursWords(hours: number): string {
  return hours === 24 ? "a day" : `${hours} hours`;
}
export type DraftRow = {
  id: string;
  subject: string;
  body: string;
  productId: string | null;
  by: string;
  savedAt: string;
  /** Set when a sent email is written again, so it starts addressed to the same people. */
  who?: Who;
};
type Who = "all" | "buyers" | "leads";

const TIME: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

/**
 * A time in the reader's own time zone. The server does not know it, so the
 * first render says UTC and the browser swaps in local time straight after.
 */
const noSubscription = () => () => {};
function When({ seconds }: { seconds: number }) {
  const inBrowser = useSyncExternalStore(noSubscription, () => true, () => false);
  const date = new Date(seconds * 1000);
  return <>{inBrowser ? date.toLocaleString("en-US", TIME) : `${date.toLocaleString("en-US", { ...TIME, timeZone: "UTC" })} UTC`}</>;
}

function Feedback({ error, done }: { error: string | null; done: string | null }) {
  if (error) return <p className="notice notice-error mt-3" role="alert">{error}</p>;
  if (done) return <p className="notice notice-success mt-3" role="status">{done}</p>;
  return null;
}

/**
 * The studio's email page. What a role may do here is decided by the server
 * (lib/team-roles.ts); these switches only leave out what it may not, so an
 * Editor sees a composer that keeps drafts, and the owner or an Admin sends
 * them.
 */
export function EmailStudio(props: {
  email: string;
  name: string;
  mail: MailSettings | null;
  counts: { total: number; agreed: number; left: number; mailable: number };
  used: number;
  allowance: number;
  trial: boolean;
  products: { id: string; title: string }[];
  broadcasts: BroadcastRow[];
  /** The store's currency, for what each email sold. */
  currency: string;
  /** The plan above this one, when the store is on Pro and this person may change its plan. */
  moveUp: { action: string; cycle: "month" | "year"; price: string; emails: number; trial: boolean } | null;
  /** Whether anything on the store is sold for money. */
  sells: boolean;
  flows: FlowRow[];
  drafts: DraftRow[];
  canSend: boolean;
  canSettings: boolean;
  canExport: boolean;
  /** Each product's own address, for an email about it. */
  links?: Record<string, string>;
  /** Whether the writing help is on, and what is left of the month (lib/ai.ts). */
  ai?: { on: boolean; left: number };
  /** The store's saved groups (lib/segments.ts). */
  segments?: Segment[];
  /** The products that are courses (lib/catalog.ts, "course"). */
  courses?: string[];
  /** Paid products in the selected store catalog, for sequence ending checks. */
  paidProducts?: string[];
  /** The store's forms that ask for an address, its own fields and its deal stages, for the sequences (lib/flows.ts). */
  automation?: { forms: { id: string; name: string }[]; fields: { id: string; name: string; type: string; options: string[] }[]; stages: { id: string; name: string }[] };
  /** Who a new email goes to, when opened from "Worth knowing" (lib/insights.ts). */
  preset?: { who: Who };
  /** The store's colour for a button in its emails (lib/store-look.ts), so the designer's preview is what is sent. */
  accent?: string;
}) {
  const ready = props.mail !== null;
  // The draft open in the composer; a new key starts the composer afresh.
  const [open, setOpen] = useState<DraftRow | null>(null);
  return (
    <MailAccent.Provider value={props.accent ?? "#4c1d95"}>
    <div className="mt-8 grid items-start gap-x-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {ready ? (
          <>
            <AiOn value={props.ai ?? { on: false, left: 0 }}>
              <Compose
                key={open ? `${open.id}-${open.savedAt}` : "new"}
                email={props.email}
                products={props.products}
                links={props.links ?? {}}
                counts={props.counts}
                canSend={props.canSend}
                draft={open}
                onDone={() => setOpen(null)}
                currency={props.currency}
                segments={props.segments ?? []}
                preset={open ? undefined : props.preset}
              />
            </AiOn>
            <Drafts drafts={props.drafts} products={props.products} open={open} onOpen={setOpen} />
            <History broadcasts={props.broadcasts} products={props.products} canSend={props.canSend} onOpen={setOpen} currency={props.currency} />
            {props.canSend ? (
              <AiOn value={props.ai ?? { on: false, left: 0 }}>
                <Flows flows={props.flows} products={props.products} currency={props.currency} sells={props.sells} courses={props.courses ?? []} paidProducts={props.paidProducts} automation={props.automation} />
              </AiOn>
            ) : null}
          </>
        ) : props.canSettings ? (
          <div className="card p-6 sm:p-8">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">First, how your emails are signed</p>
            <p className="mt-2 text-ink-soft">One minute, once. Then you can write.</p>
            <Settings name={props.name} mail={props.mail} />
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">Not set up yet</p>
            <p className="mt-2 text-ink-soft">
              The store&apos;s owner or an Admin first saves the name and postal address its emails carry. Then you can write here.
            </p>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="card mt-8 p-6 sm:p-8 lg:mt-0">
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">This month</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{`${n(props.used)} of ${n(props.allowance)}`}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {props.trial
              ? `emails sent. During the free trial a month holds ${TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")}; the full ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} opens with your first payment.`
              : "emails sent, one-off and sequences together. The count starts again on the first of the month."}
          </p>
          {props.moveUp ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-ink underline underline-offset-2">
                {`Need more? ${n(props.moveUp.emails)} a month on Scale`}
              </summary>
              <p className="mt-3 text-sm text-ink-soft">
                {`Scale is the plan you have with room for a bigger list: up to ${n(props.moveUp.emails)} emails a month, at ${props.moveUp.price}. `}
                {props.moveUp.trial
                  ? "Nothing is charged now. When the trial ends you pay the Scale price instead."
                  : "Today you are charged only the difference for the rest of the period you already paid for. You can go back to Pro from your studio whenever you like."}
              </p>
              <form action={props.moveUp.action} method="post" className="mt-3">
                <input type="hidden" name="tier" value="scale" />
                <input type="hidden" name="cycle" value={props.moveUp.cycle} />
                <button type="submit" className="btn btn-secondary btn-sm">Move up to Scale</button>
              </form>
            </details>
          ) : null}
        </div>
        <ListCard counts={props.counts} canExport={props.canExport} canImport={props.canSend} />
        {ready && props.canSettings ? (
          <div className="card mt-8 p-6 sm:p-8">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">How your emails are signed</p>
            <Settings name={props.name} mail={props.mail} />
          </div>
        ) : null}
      </div>
    </div>
    </MailAccent.Provider>
  );
}

function Settings({ name, mail }: { name: string; mail: MailSettings | null }) {
  const router = useRouter();
  const [fromName, setFromName] = useState(mail?.fromName ?? name);
  const [address, setAddress] = useState(mail?.address ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const a = await call({ action: "settings", fromName, address });
        setBusy(false);
        if (a.ok) {
          toast("Email settings saved.");
          router.refresh();
        } else setError(message(a));
      }}
    >
      <label className="block">
        <span className="field-label">Your emails are from</span>
        <input className="field mt-2" maxLength={60} value={fromName} onChange={(e) => setFromName(e.target.value)} />
      </label>
      <label className="block">
        <span className="field-label">Postal address at the bottom of each email</span>
        <input className="field mt-2" maxLength={200} placeholder="Street, city, ZIP or postal code, country — or a PO box" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <p className="text-sm text-ink-soft">
        Replies go to the email address the store&apos;s owner logs in with. The postal address is required by the CAN-SPAM Act for emails
        like these; a PO box or a mail service address counts.
      </p>
      <button type="submit" aria-busy={busy} disabled={busy} className="btn btn-secondary">Save</button>
      <Feedback error={error} done={null} />
    </form>
  );
}

function ListCard({
  counts,
  canExport,
  canImport,
}: {
  counts: { total: number; agreed: number; left: number; mailable: number };
  canExport: boolean;
  canImport: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="card mt-8 p-6 sm:p-8">
      <p className="text-lg font-semibold tracking-[-0.02em] text-ink">Your list</p>
      <p className="mt-2 text-ink-soft">
        {`${n(counts.mailable)} ${counts.mailable === 1 ? "person" : "people"} you can write to. ${n(counts.left)} left through the unsubscribe link, and ${n(counts.total - counts.agreed)} gave their address for one thing only and are never written to.`}
      </p>
      {canExport ? (
        <form action="/api/store/leads" method="get" className="mt-4">
          <StoreField />
          <input type="hidden" name="who" value="agreed" />
          <button type="submit" className="btn btn-secondary btn-sm">Download the people you can write to</button>
        </form>
      ) : null}
      {canImport ? (
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-bold text-ink underline underline-offset-2">Import addresses</summary>
        <form
          className="mt-3 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            setDone(null);
            const a = await call({ action: "import", text, confirm });
            setBusy(false);
            if (a.ok) {
              setDone(`${n(Number(a.added))} added. ${n(Number(a.already))} were already on your list or had left it, and stay as they were.${Number(a.skipped) ? ` ${n(Number(a.skipped))} did not look like email addresses.` : ""}`);
              setText("");
              setConfirm(false);
              router.refresh();
            } else setError(message(a));
          }}
        >
          <label htmlFor="import-text" className="field-label">Paste addresses, or a CSV file&apos;s contents</label>
          <textarea id="import-text" rows={6} className="field" value={text} onChange={(e) => setText(e.target.value)} />
          <label className="block text-sm">
            <span className="text-ink-soft">Or choose a file</span>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="mt-1 block w-full text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setText(await file.text());
              }}
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" className="mt-1" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
            <span>These people agreed to get emails from me. None of them came from a bought or borrowed list.</span>
          </label>
          <p className="text-sm text-ink-soft">
            Up to 5,000 at a time. Anyone who ever unsubscribed from you here stays unsubscribed, whatever the file says.
          </p>
          <button type="submit" disabled={busy || !text.trim()} className="btn btn-secondary btn-sm">Import</button>
        </form>
      </details>
      ) : null}
      <Feedback error={error} done={done} />
    </div>
  );
}

function Compose(props: {
  email: string;
  products: { id: string; title: string }[];
  links: Record<string, string>;
  counts: { mailable: number };
  canSend: boolean;
  /** A draft opened into the composer, or null for a new email. */
  draft: DraftRow | null;
  onDone: () => void;
  currency: string;
  segments: Segment[];
  preset?: { who: Who };
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(props.draft?.subject ?? "");
  const [body, setBody] = useState(props.draft?.body ?? "");
  // The email's box, so a picture goes where the cursor is.
  const bodyBox = useRef<HTMLTextAreaElement>(null);
  const [productId, setProductId] = useState(props.draft?.productId ?? "");
  const [notProductId, setNotProductId] = useState("");
  // Everybody, only people who have bought something, or only those who have not yet.
  const [who, setWho] = useState<Who>(props.draft?.who ?? props.preset?.who ?? "all");
  const [draftId, setDraftId] = useState(props.draft?.id ?? "");
  const [later, setLater] = useState(false);
  const [at, setAt] = useState("");
  // A second subject line tried on part of the list (lib/mail-test.ts).
  const [testing, setTesting] = useState(false);
  const [subjectB, setSubjectB] = useState("");
  const [share, setShare] = useState<number>(TEST_SHARES[0]);
  const [hours, setHours] = useState<number>(TEST_HOURS[1]);
  const [by, setBy] = useState<TestBy>("visits");
  const [reach, setReach] = useState<number>(props.counts.mailable);
  // Spent at least, first found the store through, has not bought in these
  // days (lib/segments.ts), and the groups saved under a name.
  const [spentText, setSpentText] = useState("");
  const [channel, setChannel] = useState("");
  const [quietDays, setQuietDays] = useState(0);
  const [more, setMore] = useState(false);
  const [channels, setChannels] = useState<string[] | null>(null);
  const [partial, setPartial] = useState(false);
  const [segments, setSegments] = useState<Segment[]>(props.segments);
  const [groupName, setGroupName] = useState("");
  const minSpent = spentText.trim() ? readMoney(spentText, props.currency as Currency) ?? 0 : 0;
  const narrow: Narrow = { minSpent, channel, quietDays };
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What the writing help is asked to write, and about which product.
  const [goal, setGoal] = useState<EmailGoal>("announce");
  const [about, setAbout] = useState("");

  useEffect(() => {
    let live = true;
    call({ action: "count", productId, notProductId, who, narrow: { minSpent, channel, quietDays }, channels: more && channels === null }).then((a) => {
      if (!live) return;
      if (a.ok) {
        setReach(Number(a.count) || 0);
        if (Array.isArray(a.channels)) setChannels(a.channels.filter((c): c is string => typeof c === "string"));
        if (typeof a.partial === "boolean") setPartial(a.partial);
      } else if (a.error === "stripe") setError(message(a));
    });
    return () => {
      live = false;
    };
    // `channels` is asked for once, when the choices are first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, notProductId, who, minSpent, channel, quietDays, more]);

  async function group(payload: Record<string, unknown>, done: string) {
    setBusy(true);
    setError(null);
    const a = await call(payload);
    setBusy(false);
    if (!a.ok) {
      setError(message(a));
      return;
    }
    if (Array.isArray(a.segments)) setSegments(a.segments as Segment[]);
    toast(done);
  }

  function pick(segment: Segment) {
    setWho(segment.who);
    setProductId(segment.productId);
    setNotProductId(segment.notProductId);
    setSpentText(segment.minSpent ? plainAmount(segment.minSpent, props.currency) : "");
    setChannel(segment.channel);
    setQuietDays(segment.quietDays);
    setGroupName(segment.name);
    if (segment.minSpent || segment.channel || segment.quietDays) setMore(true);
  }

  async function send(payload: Record<string, unknown>, success: string) {
    setBusy(true);
    setError(null);
    const a = await call(payload);
    setBusy(false);
    setConfirming(false);
    if (!a.ok) {
      setError(message(a));
      return false;
    }
    toast(success);
    return true;
  }

  async function keep() {
    setBusy(true);
    setError(null);
    const a = await call({ action: "draft-save", id: draftId || undefined, subject, body, productId });
    setBusy(false);
    if (!a.ok) {
      setError(message(a));
      return;
    }
    const saved = a.draft as DraftRow | undefined;
    if (saved) setDraftId(saved.id);
    toast("Draft saved.");
    router.refresh();
  }

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="compose-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="compose-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          {draftId ? "Draft" : "New email"}
        </h2>
        {draftId ? (
          <button type="button" className="text-sm font-bold text-ink-soft underline underline-offset-4" onClick={props.onDone}>
            Start a new one instead
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        <AiAssist<{ subject: string; body: string }>
          title="Write a draft with AI"
          hint="Pick what the email is for, and say in a few words what you want it to say. The subject and the email below are filled in for you to read and change."
          placeholder="The recipe pack is out: 40 weeknight dinners, $27, and the first 10 pages are free to read on the page."
          extra={
            <div className="grid gap-3">
              <label className="block">
                <span className="field-label">It is to</span>
                <select className="field mt-2" value={goal} onChange={(e) => setGoal(e.target.value as EmailGoal)}>
                  {EMAIL_GOALS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">About</span>
                <select className="field mt-2" value={about} onChange={(e) => setAbout(e.target.value)}>
                  <option value="">No product in particular</option>
                  {props.products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>
            </div>
          }
          payload={() => ({
            kind: "email",
            goal,
            product: props.products.find((p) => p.id === about)?.title ?? "",
            link: about ? props.links[about] ?? "" : "",
          })}
          onResult={(value) => {
            setSubject(value.subject);
            setBody(value.body);
          }}
          done="The subject and the email below are filled in. Read them, change anything, then save or send."
        />
        <label className="block">
          <span className="field-label">Subject</span>
          <input className="field mt-2" maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        {/*
          A second subject line, tried against the first.

          Decided by what the email's links bring to the store, never by
          opens: nothing in an email here reports back (app/privacy), and an
          open is the number a mail app inflates by itself anyway.
        */}
        {props.canSend ? (
          <div>
            <label className="flex items-start gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={testing}
                onChange={(e) => setTesting(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-violet-brand"
              />
              Try a second subject line
            </label>
            {testing ? (
              <div className="mt-3 space-y-4 rounded-[var(--r-md)] bg-sand p-4">
                <label className="block">
                  <span className="field-label">Second subject</span>
                  <input className="field mt-2" maxLength={150} value={subjectB} onChange={(e) => setSubjectB(e.target.value)} />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="field-label">Share of the list</span>
                    <select className="field mt-2" value={share} onChange={(e) => setShare(Number(e.target.value))}>
                      {TEST_SHARES.map((value) => (
                        <option key={value} value={value}>{`${value}%`}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">Decide after</span>
                    <select className="field mt-2" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                      {TEST_HOURS.map((value) => (
                        <option key={value} value={value}>{hoursWords(value)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">Decided by</span>
                    <select className="field mt-2" value={by} onChange={(e) => setBy(e.target.value as TestBy)}>
                      <option value="visits">Visits</option>
                      <option value="sales">Sales</option>
                    </select>
                  </label>
                </div>
                <p className="text-sm text-ink-soft">
                  {`Half of that ${share}% gets each subject, chosen at random. ${hours === 24 ? "A day" : `${hours} hours`} after the last of them goes out, everyone else gets the one whose links brought more ${by === "sales" ? "sales" : "visits to your store"} for each email sent${by === "sales" ? ", with visits deciding when sales are level" : ""}. If neither did better, they get the first, and this page says so.`}
                </p>
                <p className="text-sm text-ink-soft">
                  {`It needs at least ${MIN_TEST_REACH} people and a link to your store in the email. Emails here carry no tracking pixel, so opens are not counted, and a small difference on a small list is mostly chance.`}
                </p>
                {reach < MIN_TEST_REACH ? (
                  <p className="notice notice-error" role="status">
                    {`This goes to ${n(reach)} ${reach === 1 ? "person" : "people"}, which is too few to compare two subjects. Uncheck the box, or choose a bigger group.`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <MailBodyEditor
          body={body}
          onChange={setBody}
          boxRef={(el) => {
            bodyBox.current = el;
          }}
        />
        <p className="text-sm text-ink-soft">
          Blank lines make paragraphs, lines starting with &quot;- &quot; make a list, web addresses become links, and a picture you add shows where its line is. Design lays it out in blocks, with headings, buttons and templates. Why they are getting it, the unsubscribe link and your postal address are added at the bottom.
        </p>
        {segments.length ? (
          <label className="block">
            <span className="field-label">Saved groups</span>
            <select
              className="field mt-2"
              value=""
              onChange={(e) => {
                const found = segments.find((s) => s.id === e.target.value);
                if (found) pick(found);
              }}
            >
              <option value="">Choose a group you saved</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="field-label">Send to</span>
          <select
            className="field mt-2"
            value={who === "all" ? productId : `@${who}`}
            onChange={(e) => {
              // The two kinds of reader are choices of their own, beside the
              // products: picking one clears the other.
              const value = e.target.value;
              if (value === "@buyers" || value === "@leads") {
                setWho(value === "@buyers" ? "buyers" : "leads");
                setProductId("");
              } else {
                setWho("all");
                setProductId(value);
              }
            }}
          >
            <option value="">Everyone you can write to</option>
            <option value="@buyers">Everyone who has bought something</option>
            <option value="@leads">Everyone who has not bought yet</option>
            {props.products.map((p) => (
              <option key={p.id} value={p.id}>{`Only those who got ${p.title}`}</option>
            ))}
          </select>
        </label>
        {/*
          And who to leave out.

          The letter that sells is the one to the people who took the free
          thing and have not bought the paid one, and until this box existed
          there was no way to address it: you could write to everybody, or to
          the buyers of one product, and not to the difference between them.
          It reads what every contact has carried from the start — what they
          asked for or bought — so nothing new is recorded about anyone.
        */}
        <label className="block">
          <span className="field-label">Leave out</span>
          <select className="field mt-2" value={notProductId} onChange={(e) => setNotProductId(e.target.value)}>
            <option value="">Nobody</option>
            {props.products
              .filter((p) => p.id !== productId)
              .map((p) => (
                <option key={p.id} value={p.id}>{`Anyone who already got ${p.title}`}</option>
              ))}
          </select>
          <span className="field-hint mt-1 block">
            {notProductId
              ? "They will not get this one. Use it to write to the people who have not bought yet."
              : "Everyone chosen above gets it."}
          </span>
        </label>
        {/*
          And three ways no list can choose by itself: what they spent, where
          they first found the store, and how long since they last bought.
          Read from the creator's own Stripe account when the email goes out
          (lib/segments.ts); nothing is recorded about anybody to do it.
        */}
        <details className="rounded-[12px] bg-paper px-4 py-3 ring-1 ring-line" open={more} onToggle={(e) => setMore((e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer text-sm font-semibold text-ink">More ways to choose: what they spent, where they came from, when they last bought</summary>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className="field-label">Spent with you at least</span>
              <input
                className="field mt-2"
                inputMode="decimal"
                placeholder={`For example: ${plainAmount(10000, props.currency)}`}
                value={spentText}
                onChange={(e) => setSpentText(e.target.value)}
              />
              <span className="field-hint mt-1 block">
                {spentText.trim() && !minSpent ? "Type an amount without a currency sign, like 100 or 99.50." : `In ${props.currency.toUpperCase()}, everything they paid you, extras included. Empty for any amount.`}
              </span>
            </label>
            <label className="block">
              <span className="field-label">First found you through</span>
              <select className="field mt-2" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="">Anywhere</option>
                {(channels ?? (channel ? [channel] : [])).map((c) => (
                  <option key={c} value={c}>{channelName(c)}</option>
                ))}
              </select>
              <span className="field-hint mt-1 block">
                {channels === null ? "Reading where your buyers came from…" : channels.length ? "Where they were when they first bought." : "Nobody has bought yet, so there is no channel to choose."}
              </span>
            </label>
            <label className="block">
              <span className="field-label">Has not bought in the last</span>
              <select className="field mt-2" value={quietDays} onChange={(e) => setQuietDays(Number(e.target.value))}>
                <option value={0}>Any time</option>
                {QUIET_DAYS.map((d) => (
                  <option key={d} value={d}>{`${d} days, but has bought before`}</option>
                ))}
              </select>
            </label>
            <p className="text-xs text-ink-soft">
              Only buyers can match these three. They are read from your own Stripe account when the email goes out, in your
              store&apos;s currency; support for your work, sales in another currency and sales paid with PayPal are not counted.
              {partial ? " Your Stripe account holds more sales than one reading takes, so the oldest are not counted." : ""}
            </p>
          </div>
        </details>
        <p className="text-sm font-semibold text-ink" role="status">{`${n(reach)} ${reach === 1 ? "person" : "people"}`}</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="field-label">Save who this goes to as a group</span>
            <input className="field mt-2" maxLength={60} placeholder="Best customers" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={busy || !groupName.trim()}
            onClick={() => void group({ action: "segment-save", name: groupName, who, productId, notProductId, narrow }, "Group saved.")}
          >
            Save group
          </button>
          {segments.some((s) => s.name.toLowerCase() === groupName.trim().toLowerCase()) ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busy}
              onClick={() => {
                const found = segments.find((s) => s.name.toLowerCase() === groupName.trim().toLowerCase());
                if (found) void group({ action: "segment-remove", id: found.id }, "Group removed.");
              }}
            >
              Remove group
            </button>
          ) : null}
        </div>
        {props.canSend ? (
        <fieldset>
          <legend className="field-label">When</legend>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="when" checked={!later} onChange={() => setLater(false)} /> Now
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="when" checked={later} onChange={() => setLater(true)} /> At a time I choose
            </label>
          </div>
          {later ? (
            <label className="mt-3 block">
              <span className="sr-only">Date and time, in your own time zone</span>
              <input type="datetime-local" className="field" value={at} onChange={(e) => setAt(e.target.value)} />
            </label>
          ) : null}
        </fieldset>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-busy={busy} disabled={busy}
            className="btn btn-secondary"
            onClick={() => send({ action: "test", subject, body }, `Test sent to ${props.email}.`)}
          >
            Send me a test
          </button>
          <button
            type="button"
            aria-busy={busy}
            disabled={busy || !subject.trim() || !body.trim()}
            className="btn btn-secondary"
            onClick={() => void keep()}
          >
            {draftId ? "Save the draft" : "Save as a draft"}
          </button>
          {!props.canSend ? null : confirming ? (
            <>
              <button
                type="button"
                aria-busy={busy} disabled={busy}
                className="btn btn-primary"
                onClick={async () => {
                  const sendAt = later && at ? new Date(at).getTime() : undefined;
                  const ok = await send(
                    {
                      action: "broadcast",
                      subject,
                      body,
                      productId,
                      notProductId,
                      who,
                      narrow,
                      sendAt,
                      draftId: draftId || undefined,
                      test: testing ? { subjectB, share, hours, by } : undefined,
                    },
                    later ? "Your email is scheduled." : "Your email is on its way.",
                  );
                  if (ok) {
                    setSubject("");
                    setBody("");
                    setDraftId("");
                    setTesting(false);
                    setSubjectB("");
                    props.onDone();
                    router.refresh();
                  }
                }}
              >
                {later ? `Yes, schedule it for ${n(reach)}` : `Yes, send it to ${n(reach)}`}
              </button>
              <button type="button" className="text-sm font-bold text-ink-soft underline underline-offset-4" onClick={() => setConfirming(false)}>
                Not yet
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy || !subject.trim() || !body.trim() || reach === 0 || (later && !at) || (testing && (!subjectB.trim() || reach < MIN_TEST_REACH))}
              className="btn btn-primary"
              onClick={() => setConfirming(true)}
            >
              {later ? "Schedule" : "Send"}
            </button>
          )}
        </div>
        {props.canSend ? null : (
          <p className="text-sm text-ink-soft">
            Sending to the list is for the store&apos;s owner and Admins. Save it as a draft and they can read it, send it or
            schedule it from this page.
          </p>
        )}
        <Feedback error={error} done={null} />
      </div>
    </section>
  );
}

/** The store's drafts: open one into the composer, or throw it away. */
function Drafts({
  drafts,
  products,
  open,
  onOpen,
}: {
  drafts: DraftRow[];
  products: { id: string; title: string }[];
  open: DraftRow | null;
  onOpen: (draft: DraftRow | null) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  if (!drafts.length) return null;
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="drafts-title">
      <h2 id="drafts-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Drafts</h2>
      <ul className="mt-4 divide-y divide-line">
        {drafts.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
            <span className="min-w-0">
              <span className="block break-words font-semibold text-ink">{d.subject}</span>
              <span className="block text-sm text-ink-soft">
                {`${d.productId ? `To those who got ${products.find((p) => p.id === d.productId)?.title ?? "a product"}` : "To everyone you can write to"} · saved by ${d.by || "someone"}, `}
                <When seconds={Math.floor(new Date(d.savedAt).getTime() / 1000)} />
              </span>
            </span>
            <span className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex min-h-11 -my-2.5 items-center text-sm font-bold text-violet-deep underline underline-offset-4"
                aria-current={open?.id === d.id ? "true" : undefined}
                onClick={() => {
                  onOpen(d);
                  document.getElementById("compose-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {open?.id === d.id ? "Open above" : "Open"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                aria-busy={busy === d.id}
                className="inline-flex min-h-11 -my-2.5 items-center text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-danger"
                onClick={async () => {
                  if (!window.confirm("Delete this draft?")) return;
                  setBusy(d.id);
                  const a = await call({ action: "draft-remove", id: d.id });
                  setBusy(null);
                  if (a.ok) {
                    toast("Draft deleted.");
                    if (open?.id === d.id) onOpen(null);
                    router.refresh();
                  }
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The second subject line an email tried: what is happening, or what happened and why. */
function TestLine({ test, status }: { test: SubjectTest; status: string }) {
  if (test.skipped) {
    return (
      <p className="mt-1 text-sm text-ink-soft">
        {`The list was under ${MIN_TEST_REACH} people when this went out, so the second subject was not tried and everyone got the first.`}
      </p>
    );
  }
  if (test.winner) {
    return (
      <p className="mt-1 text-sm text-ink-soft">
        <span className="font-semibold text-ink">{`Second subject: ${test.subjectB}. `}</span>
        {test.why}
      </p>
    );
  }
  if (status === "cancelled" || status === "failed") return null;
  return (
    <p className="mt-1 text-sm text-ink-soft">
      <span className="font-semibold text-ink">{`Second subject: ${test.subjectB}. `}</span>
      {test.endsAt ? (
        <>
          {`${n(test.a)} got the first and ${n(test.b)} the second. The better one is chosen `}
          <When seconds={test.endsAt} />
          {", and the rest go out then."}
        </>
      ) : (
        `Tried on ${test.share}% of the list, half each; the rest get the better one ${hoursWords(test.hours)} after.`
      )}
    </p>
  );
}

const STATUS: Record<string, string> = {
  scheduled: "Scheduled",
  sending: "Going out",
  sent: "Sent",
  waiting: "Waiting",
  cancelled: "Canceled",
  failed: "Stopped",
};

/** "a day", "3 days", "5 hours": how long after joining a kept email goes. */
function waitWords(hours: number): string {
  if (hours % 24 === 0) return hours === 24 ? "a day" : `${hours / 24} days`;
  return hours === 1 ? "an hour" : `${hours} hours`;
}

function History({
  broadcasts,
  products,
  canSend,
  onOpen,
  currency,
}: {
  broadcasts: BroadcastRow[];
  products: { id: string; title: string }[];
  canSend: boolean;
  /** Puts a sent email back in the composer, as a new one. */
  onOpen: (draft: DraftRow | null) => void;
  currency: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!broadcasts.length) return null;

  /** A sent email's subject and text, back in the composer to change and send. */
  async function again(b: BroadcastRow) {
    setBusy(true);
    setError(null);
    const a = await call({ action: "copy", id: b.id });
    setBusy(false);
    const copy = a.ok ? (a.copy as { subject: string; body: string; productId: string | null; who?: Who } | undefined) : undefined;
    if (!copy) return setError(message(a));
    // No id: it is a new email, not the draft of an old one. The time makes
    // the composer start afresh even when the same email is opened twice.
    onOpen({ id: "", subject: copy.subject, body: copy.body, productId: copy.productId, who: copy.who, by: "", savedAt: String(Date.now()) });
    document.getElementById("compose-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** The email joins a sequence, and goes by itself to everybody who arrives from now on. */
  async function keep(b: BroadcastRow) {
    setBusy(true);
    setError(null);
    const a = await call({ action: "keep", id: b.id });
    setBusy(false);
    if (!a.ok) return setError(a.error === "too_many" ? MESSAGES.too_many_flows : message(a));
    toast(`Done. ${keptWords(b, products)} from now on gets this email ${waitWords(Number(a.waitHours))} later. It is under Sequences, switched on.`);
    router.refresh();
  }
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="history-title">
      <h2 id="history-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Sent and scheduled</h2>
      <p className="mt-2 text-sm text-ink-soft">
        A visit is a page of your store opened through one of an email&apos;s links, and a sale is one made on that page.
        Nothing in an email reports back, so there is no open rate here, and nothing is kept about who visited. (In sequences,
        readers who allowed it are counted as having used a link or not, only to choose their next email.)
      </p>
      <ul className="mt-4 divide-y divide-line">
        {broadcasts.map((b) => (
          <li key={b.id} className="py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="min-w-0 break-words font-semibold text-ink">{b.subject}</p>
              <span className="tag">{STATUS[b.status] ?? b.status}</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {b.status === "scheduled" ? (
                <>
                  {"Goes out "}
                  <When seconds={b.sendAt} />
                  {` to ${n(b.total)}${b.productId ? ` who got ${products.find((p) => p.id === b.productId)?.title ?? "a product"}` : ""}`}
                </>
              ) : (
                <>
                  {`${n(b.sent)} of ${n(b.total)} sent`}
                  {b.finishedAt ? (
                    <>
                      {", "}
                      <When seconds={b.finishedAt} />
                    </>
                  ) : null}
                </>
              )}
            </p>
            {b.narrow ? <p className="mt-1 text-sm text-ink-soft">{narrowWords(b.narrow, currency)}</p> : null}
            {b.note ? <p className="mt-1 text-sm text-ink-soft">{b.note}</p> : null}
            {b.test ? <TestLine test={b.test} status={b.status} /> : null}
            {/* Said only for an email whose links were tagged: for an older
                one nothing could be counted, and "no sales" would be a guess. */}
            {b.status === "sent" && b.tagged ? (
              <p className="mt-1 text-sm font-semibold text-ink">{broughtWords(b.visits, b.money, currency)}</p>
            ) : null}
            {b.status === "scheduled" && canSend ? (
              <button
                type="button"
                aria-busy={busy} disabled={busy}
                className="mt-2 text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-danger"
                onClick={async () => {
                  setBusy(true);
                  const a = await call({ action: "cancel", id: b.id });
                  setBusy(false);
                  if (a.ok) toast("Scheduled email canceled.");
                  router.refresh();
                }}
              >
                Cancel it
              </button>
            ) : null}
            {b.status === "sent" ? (
              <div className="mt-1 flex flex-wrap gap-x-5">
                <button
                  type="button"
                  aria-busy={busy} disabled={busy}
                  className="inline-flex min-h-11 items-center text-sm font-bold text-ink underline underline-offset-4"
                  onClick={() => again(b)}
                >
                  Write it again
                </button>
                {/* Not offered for an email narrowed two ways at once: an
                    email in a sequence keeps one condition (lib/mail-reuse.ts). */}
                {canSend && keepable(b) ? (
                  <button
                    type="button"
                    aria-busy={busy} disabled={busy}
                    className="inline-flex min-h-11 items-center text-left text-sm font-bold text-ink underline underline-offset-4"
                    onClick={() => keep(b)}
                  >
                    {`Keep sending it to ${keptWords(b, products).replace(/^Everyone/, "everyone")}`}
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <Feedback error={error} done={null} />
    </section>
  );
}

/**
 * One email of a sequence as the form holds it. `when` is "" for everyone;
 * its product or label is kept apart, so switching between conditions does
 * not lose what was chosen (lib/flow-rules.ts).
 */
type StepDraft = {
  id?: string;
  /** An email, or a step that acts instead (lib/flow-rules.ts, FlowAction). */
  kind: "email" | "tag" | "untag" | "start" | "webhook" | "field" | "deal" | "note" | "notify";
  actionTag: string;
  actionFlow: string;
  /** For a step that sets a field: which, and to what. */
  actionField: string;
  actionValue: string;
  /** For a step that puts the person's deal in a stage: which stage, and a new deal's title. */
  actionStage: string;
  actionTitle: string;
  /** For a step that writes a note on the person's page. */
  actionText: string;
  wait: string;
  unit: "hours" | "days";
  subject: string;
  body: string;
  when: StepIf | "";
  whenProduct: string;
  whenTag: string;
  otherwise: "skip" | "end";
};
type FlowDraft = {
  id?: string;
  name: string;
  trigger: "joined" | "product" | "bought" | "tagged" | "finished" | "form";
  productId: string;
  /** The label that starts it, for "tagged". */
  triggerTag: string;
  /** The form that starts it, for "form". */
  formId: string;
  active: boolean;
  steps: StepDraft[];
  /** When it ends early: never, once they have bought anything, or once they get one product. */
  goal: "" | "any" | "product";
  goalProduct: string;
};

/** What each condition is called in the form, in the order offered. */
const STEP_IF_WORDS: { value: StepIf | ""; label: string }[] = [
  { value: "", label: "Everyone still in the sequence" },
  { value: "lacks", label: "Only those who do not have a product" },
  { value: "has", label: "Only those who have a product" },
  { value: "lead", label: "Only those who have not bought anything yet" },
  { value: "buyer", label: "Only those who have bought something" },
  { value: "tag", label: "Only those with a label" },
  { value: "untagged", label: "Only those without a label" },
  { value: "clicked", label: "Only those who used a link in the email before" },
  { value: "unclicked", label: "Only those who did not use a link in the email before" },
  { value: "unstarted", label: "Only those who have not opened a course" },
  { value: "started", label: "Only those who have opened a course" },
  { value: "unfinished", label: "Only those who have not finished a course" },
  { value: "finished", label: "Only those who have finished a course" },
  { value: "half-a", label: "Only the first half of the sequence (A)" },
  { value: "half-b", label: "Only the second half of the sequence (B)" },
];

function blankStep(wait: string, unit: "hours" | "days", firstProduct: string): StepDraft {
  return { kind: "email", actionTag: "", actionFlow: "", actionField: "", actionValue: "", actionStage: "", actionTitle: "", actionText: "", wait, unit, subject: "", body: "", when: "", whenProduct: firstProduct, whenTag: "", otherwise: "skip" };
}

/** What a step that acts does, as one line reads it: "gives the label “warm”". */
function actionWords(action: FlowAction, flows: { id: string; name: string }[]): string {
  if (action.do === "start") {
    const target = action.flowId;
    return `starts the sequence “${flows.find((f) => f.id === target)?.name ?? "a sequence no longer in your store"}”`;
  }
  if (action.do === "webhook") return "tells your webhooks who reached it";
  if (action.do === "field") return `sets a field to “${action.value}”`;
  if (action.do === "deal") return "puts their deal in a stage of your deals board";
  if (action.do === "note") return "writes a note on their page";
  if (action.do === "notify") return "emails you who reached it";
  return action.do === "tag" ? `gives the label “${action.tag}”` : `takes off the label “${action.tag}”`;
}

/** "3 emails" or "2 emails and 1 action". */
function stepCount(steps: Pick<FlowStep, "action">[]): string {
  const actions = steps.filter((s) => s.action).length;
  const emails = steps.length - actions;
  const e = `${emails} ${emails === 1 ? "email" : "emails"}`;
  return actions ? `${e} and ${actions} ${actions === 1 ? "action" : "actions"}` : e;
}

/** The action a step draft stands for, as the server reads it; null for an email. */
function actionOf(s: StepDraft): FlowAction | null {
  if (s.kind === "tag" || s.kind === "untag") return { do: s.kind, tag: s.actionTag };
  if (s.kind === "start") return { do: "start", flowId: s.actionFlow };
  if (s.kind === "webhook") return { do: "webhook" };
  if (s.kind === "field") return { do: "field", field: s.actionField, value: s.actionValue };
  if (s.kind === "deal") return { do: "deal", stage: s.actionStage, title: s.actionTitle };
  if (s.kind === "note") return { do: "note", text: s.actionText };
  if (s.kind === "notify") return { do: "notify" };
  return null;
}

function stepToDraft(s: FlowStep, firstProduct: string): StepDraft {
  const when = s.when;
  return {
    id: s.id,
    kind: s.action ? s.action.do : "email",
    actionTag: s.action && "tag" in s.action ? s.action.tag : "",
    actionFlow: s.action && "flowId" in s.action ? s.action.flowId : "",
    actionField: s.action && "field" in s.action ? s.action.field : "",
    actionValue: s.action && "value" in s.action ? s.action.value : "",
    actionStage: s.action && "stage" in s.action ? s.action.stage : "",
    actionTitle: s.action && "title" in s.action ? s.action.title : "",
    actionText: s.action && "text" in s.action ? s.action.text : "",
    ...(s.delayHours % 24 === 0 && s.delayHours > 0 ? { wait: String(s.delayHours / 24), unit: "days" as const } : { wait: String(s.delayHours), unit: "hours" as const }),
    subject: s.subject,
    body: s.body,
    when: when?.if ?? "",
    whenProduct: when && "productId" in when ? when.productId : firstProduct,
    whenTag: when && "tag" in when ? when.tag : "",
    otherwise: s.otherwise === "end" ? "end" : "skip",
  };
}

/** The condition a step draft stands for, as the server reads it. */
function conditionOf(s: StepDraft): StepCondition | null {
  if (s.when === "has" || s.when === "lacks") return { if: s.when, productId: s.whenProduct };
  if (isCourseIf(s.when)) return { if: s.when, productId: s.whenProduct };
  if (s.when === "tag" || s.when === "untagged") return { if: s.when, tag: s.whenTag };
  if (s.when === "buyer" || s.when === "lead" || s.when === "clicked" || s.when === "unclicked" || s.when === "half-a" || s.when === "half-b") return { if: s.when };
  return null;
}

/** "Only to those who do not have The Weeknight Plan; the others skip it." */
function conditionWords(step: FlowStep, products: { id: string; title: string }[]): string {
  const when = step.when;
  if (!when) return "";
  const title = (id: string) => products.find((p) => p.id === id)?.title ?? "a product no longer in your store";
  const courseWords: Record<string, string> = { started: "have opened", unstarted: "have not opened", finished: "have finished", unfinished: "have not finished" };
  const who =
    "productId" in when && isCourseIf(when.if)
      ? `who ${courseWords[when.if]} ${title(when.productId)}`
      : "productId" in when
      ? `who ${when.if === "has" ? "have" : "do not have"} ${title(when.productId)}`
      : "tag" in when
        ? `${when.if === "tag" ? "labeled" : "not labeled"} “${when.tag}”`
        : when.if === "buyer"
          ? "who have bought something"
          : when.if === "lead"
            ? "who have not bought anything yet"
            : when.if === "clicked"
              ? "who used a link in the email before"
              : "who did not use a link in the email before";
  return `${step.action ? "Only for those" : "Only to those"} ${who}; ${step.otherwise === "end" ? "for the others, the sequence ends there" : "the others skip it"}.`;
}

/** "Ends for anyone who gets The Weeknight Plan." */
function goalWords(flow: Pick<Flow, "goal">, products: { id: string; title: string }[]): string {
  if (!flow.goal) return "";
  if ("any" in flow.goal) return "Ends for anyone once they have bought something";
  return `Ends for anyone who gets ${products.find((p) => "productId" in flow.goal! && p.id === flow.goal.productId)?.title ?? "a product no longer in your store"}`;
}

function toDraft(flow: FlowRow | null, products: { id: string }[]): FlowDraft {
  const first = products[0]?.id ?? "";
  if (!flow) {
    return {
      name: "Welcome",
      trigger: "joined",
      productId: first,
      triggerTag: "",
      formId: "",
      active: false,
      steps: [blankStep("0", "hours", first)],
      goal: "",
      goalProduct: first,
    };
  }
  return {
    id: flow.id,
    name: flow.name,
    trigger: flow.trigger,
    productId: flow.productId ?? first,
    triggerTag: flow.tag ?? "",
    formId: flow.formId ?? "",
    active: flow.active,
    steps: flow.steps.map((s) => stepToDraft(s, first)),
    goal: !flow.goal ? "" : "any" in flow.goal ? "any" : "product",
    goalProduct: flow.goal && "productId" in flow.goal ? flow.goal.productId : first,
  };
}

function Flows({
  flows,
  products,
  currency,
  sells,
  courses = [],
  paidProducts,
  automation = { forms: [], fields: [], stages: [] },
}: {
  flows: FlowRow[];
  products: { id: string; title: string }[];
  currency: string;
  automation?: { forms: { id: string; name: string }[]; fields: { id: string; name: string; type: string; options: string[] }[]; stages: { id: string; name: string }[] };
  /** The products that are courses, for "finishes a course" and the conditions on one. */
  courses?: string[];
  paidProducts?: string[];
  /** Whether the store sells anything for money, so a first purchase can happen at all. */
  sells: boolean;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const refreshFlows = () => startRefresh(() => router.refresh());
  const [draft, setDraft] = useState<FlowDraft | null>(null);
  const invalidWait = draft?.steps.some(step => flowWaitHours(step.wait, step.unit) === null) ?? false;
  const [draftBaseline, setDraftBaseline] = useState<string | null>(null);
  useLeaveGuard(draft !== null && JSON.stringify(draft) !== draftBaseline);
  const [draftCount, setDraftCount] = useState<number>(DEFAULT_SEQUENCE_DRAFT);
  // Each step's box, so a picture goes where the cursor is.
  const stepBoxes = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [operationBusy, setBusy] = useState(false);
  const busy = operationBusy || refreshing;
  const [error, setError] = useState<string | null>(null);

  const triggerWords = (f: FlowRow) =>
    f.trigger === "joined"
      ? "Starts when someone joins your list"
      : f.trigger === "tagged"
        ? `Starts when a sequence gives someone the label “${f.tag ?? ""}”`
      : f.trigger === "form"
        ? `Starts when someone on your list sends the form “${automation.forms.find((x) => x.id === f.formId)?.name ?? "a form no longer in your store"}”`
      : f.trigger === "finished"
        ? `Starts when someone who agreed to hear from you finishes ${products.find((p) => p.id === f.productId)?.title ?? "a course"}`
      : f.trigger === "bought"
        ? "Starts the first time someone who agreed to hear from you buys anything"
        : `Starts when someone who agreed to hear from you gets ${products.find((p) => p.id === f.productId)?.title ?? "a product"}`;

  function openDraft(flow: FlowRow | null) {
    if (busy || draft !== null) return;
    const opened = toDraft(flow, products);
    const others = flows.filter(other => other.id !== flow?.id);
    const next = { ...opened, steps: opened.steps.map(step => step.kind === "start" && !others.some(other => other.id === step.actionFlow) ? { ...step, actionFlow: "" } : step) };
    setDraftBaseline(JSON.stringify(next));
    setError(null);
    setDraft(next);
  }

  async function save() {
    if (!draft || busy || invalidWait) return;
    setBusy(true);
    setError(null);
    const a = await call({
      action: "flow",
      flow: {
        id: draft.id,
        name: draft.name,
        trigger: draft.trigger,
        productId: draft.trigger === "product" || draft.trigger === "finished" ? draft.productId : null,
        tag: draft.trigger === "tagged" ? draft.triggerTag : null,
        formId: draft.trigger === "form" ? draft.formId : null,
        active: draft.active,
        steps: draft.steps.map((s) => {
          const when = conditionOf(s);
          const action = actionOf(s);
          return {
            id: s.id,
            delayHours: flowWaitHours(s.wait, s.unit)!,
            subject: action ? "" : s.subject,
            body: action ? "" : s.body,
            ...(action ? { action } : {}),
            ...(when ? { when, otherwise: s.otherwise } : {}),
          };
        }),
        goal: draft.goal === "any" ? { any: true } : draft.goal === "product" ? { productId: draft.goalProduct } : null,
      },
    });
    setBusy(false);
    if (!a.ok) {
      setError(message(a));
      return;
    }
    setDraft(null);
    toast("Sequence saved.");
    refreshFlows();
  }

  const draftIssues = draft ? flowConfigurationIssues({
    id: draft.id ?? "", name: draft.name, trigger: draft.trigger, active: draft.active, createdAt: 0,
    productId: draft.productId, tag: draft.triggerTag, formId: draft.formId,
    goal: draft.goal === "any" ? { any: true } : draft.goal === "product" ? { productId: draft.goalProduct } : undefined,
    steps: draft.steps.map((step, index) => {
      const action = actionOf(step);
      const when = conditionOf(step);
      return { id: step.id ?? "draft-step-" + index, delayHours: flowWaitHours(step.wait, step.unit) ?? NaN, subject: step.subject, body: step.body, ...(action ? { action } : {}), ...(when ? { when } : {}) };
    }),
  }, { products, courses, paidProducts, flows, ...automation }) : [];

  // Which of the two starter sequences this store has no sequence for yet.
  // The after-a-purchase one is made only by a store that sells something,
  // and the server decides that; here it is offered whenever none exists.
  const missing = {
    welcome: flows.length < 10 && !flows.some((f) => f.trigger === "joined"),
    bought: flows.length < 10 && sells && !flows.some((f) => f.trigger === "bought"),
  };

  // The sequences a step can start: any other of the store's.
  const otherFlows = flows.filter((f) => f.id !== draft?.id);
  // A condition on the email before is cleared wherever no email is right
  // before it any more, so what the form shows is always what is saved.
  const settle = (steps: StepDraft[]): StepDraft[] =>
    steps.map((x, j) => ((x.when === "clicked" || x.when === "unclicked") && (j === 0 || steps[j - 1].kind !== "email") ? { ...x, when: "" } : x));
  const setStep = (i: number, change: Partial<StepDraft>) =>
    draft && setDraft({ ...draft, steps: settle(draft.steps.map((s, j) => (j === i ? { ...s, ...change } : s))) });

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="flows-title">
      <h2 id="flows-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Sequences</h2>
      <p className="mt-2 text-ink-soft">
        Emails that go out by themselves: a welcome when someone joins, a few tips in the days after they buy. Each person
        goes through a sequence once, and stops the moment they unsubscribe.
      </p>
      {/*
        The two sequences worth having from the first day, written for the
        creator (lib/mail-starters.ts). Offered only for a moment — joining,
        a first purchase — that no sequence of theirs starts on yet, and made
        switched off: nothing is sent until they have read one and turned it on.
      */}
      {!draft && (missing.welcome || missing.bought) ? (
        <div className="mt-4 rounded-[var(--r-sm)] bg-sand p-4">
          <p className="font-semibold text-ink">
            {missing.welcome && missing.bought
              ? "Start with two sequences, written for you"
              : missing.welcome
                ? "Add a welcome for everyone who joins"
                : "Add a thank-you after a first purchase"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {missing.welcome && missing.bought
              ? "A welcome for everyone who joins your list, and a thank-you after someone's first purchase. We write them from your store's name, products and links, and leave them switched off. Read them, change what you like, then switch them on."
              : "We write it from your store's name, products and links, and leave it switched off. Read it, change what you like, then switch it on."}
          </p>
          <button
            type="button"
            aria-busy={busy} disabled={busy}
            className="btn btn-secondary mt-3"
            onClick={async () => {
              setBusy(true);
              setError(null);
              const a = await call({ action: "starters" });
              setBusy(false);
              if (!a.ok) return setError(a.error === "too_many" ? MESSAGES.too_many_flows : message(a));
              const made = Array.isArray(a.made) ? a.made.length : 0;
              toast(made === 1 ? "Written. It is below, switched off, for you to read." : "Written. Both are below, switched off, for you to read.");
              refreshFlows();
            }}
          >
            Write them for me
          </button>
        </div>
      ) : null}
      {refreshing ? <p role="status" className="mt-4 text-sm text-ink-soft">Updating sequences… Wait for the latest list before making another change.</p> : null}
      {!draft ? <Feedback error={error} done={null} /> : null}
      {flows.length ? (
        <ul className="mt-4 space-y-3">
          {flows.map((f) => (
            <li key={f.id} className="rounded-[var(--r-sm)] border border-line bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="min-w-0 break-words font-semibold text-ink">{f.name}</p>
                <span className="tag">{f.active ? "On" : "Paused"}</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{`${triggerWords(f)} · ${stepCount(f.steps)}`}</p>
              {(() => {
                const issues = flowConfigurationIssues(f, { products, courses, paidProducts, flows, ...automation });
                return issues.length ? <div className="notice notice-warn mt-3 text-sm"><p className="font-semibold">Review saved configuration</p><ul className="mt-2 list-disc space-y-1 pl-5">{issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul><p className="mt-2">Edit this sequence to review its references. No live delivery or action has been tested.</p></div> : null;
              })()}
              {f.goal ? <p className="mt-1 text-sm text-ink-soft" data-flow-goal>{`${goalWords(f, products)}.`}</p> : null}
              {f.steps.some((step) => step.when || step.action) ? (
                <ul className="mt-1 text-sm text-ink-soft" data-flow-steps>
                  {f.steps.map((step, i) =>
                    step.when || step.action ? (
                      <li key={step.id}>
                        {`${step.action ? "Step" : "Email"} ${i + 1}: ${step.action ? `${actionWords(step.action, flows)[0].toUpperCase()}${actionWords(step.action, flows).slice(1)}.` : ""}${step.action && step.when ? " " : ""}${step.when ? conditionWords(step, products) : ""}`}
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : null}
              {f.statsAvailable === false ? <p role="status" className="mt-1 text-sm text-ink-soft">Sequence activity is unavailable. Reload to try again.</p> : <p className="mt-1 text-sm text-ink-soft">
                {[
                  `${n(f.stats.started)} started`,
                  `${n(f.stats.sent)} emails sent`,
                  ...(f.goal || f.stats.reached ? [`${n(f.stats.reached)} left ${f.goal && "productId" in f.goal ? "once they got it" : "once they bought"}`] : []),
                  ...(f.steps.some((s) => s.when) || f.stats.skipped ? [`${n(f.stats.skipped)} skipped by a condition`] : []),
                  ...(f.steps.some((s) => s.action) || f.stats.acted ? [`${n(f.stats.acted)} ${f.stats.acted === 1 ? "action" : "actions"} done`] : []),
                ].join(" · ")}
              </p>}
              {f.money ? <p className="mt-1 text-sm font-semibold text-ink">{soldWords(f.money, currency)}</p> : null}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
                <button
                  type="button"
                  className="text-ink-soft underline underline-offset-4 hover:text-violet-deep"
                  disabled={busy || draft !== null}
                  onClick={() => {
                    openDraft(f);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-busy={busy} disabled={busy || draft !== null}
                  className="text-ink-soft underline underline-offset-4 hover:text-danger"
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    const a = await call({ action: "flow-remove", id: f.id });
                    setBusy(false);
                    if (!a.ok) {
                      setError("Removal of “" + f.name + "” could not be confirmed. Reload to check its current status. " + message(a));
                      return;
                    }
                    toast("Sequence removed.");
                    refreshFlows();
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {draft ? (
        <form
          className="mt-5 space-y-4 rounded-[var(--r-sm)] border border-line bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset disabled={busy} className="min-w-0 space-y-4">
          <legend className="sr-only">Sequence configuration</legend>
          <label className="block">
            <span className="field-label">Name, for you</span>
            <input className="field mt-2" maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="field-label">Starts when</span>
            <select
              className="field mt-2"
              value={draft.trigger}
              onChange={(e) =>
                setDraft((current) => {
                  if (!current) return current;
                  const trigger =
                    e.target.value === "product" ? "product" : e.target.value === "bought" ? "bought" : e.target.value === "tagged" ? "tagged" : e.target.value === "finished" ? "finished" : e.target.value === "form" ? "form" : "joined";
                  // Finishing is only for a course: the first course, when the product chosen is not one.
                  const productId = trigger === "finished" && !courses.includes(current.productId) ? (courses[0] ?? current.productId) : current.productId;
                  // A sequence that starts with a purchase cannot end at one.
                  const formId = trigger === "form" && !automation.forms.some((x) => x.id === current.formId) ? (automation.forms[0]?.id ?? "") : current.formId;
                  return { ...current, trigger, productId, formId, goal: trigger === "bought" && current.goal === "any" ? "" : current.goal };
                })
              }
            >
              <option value="joined">Someone joins your list</option>
              <option value="bought">Someone who agreed to hear from you buys anything, the first time</option>
              {products.length ? <option value="product">Someone who agreed to hear from you gets a product</option> : null}
              <option value="tagged">A sequence gives someone a label</option>
              {courses.length ? <option value="finished">Someone who agreed to hear from you finishes a course</option> : null}
              {automation.forms.length ? <option value="form">Someone on your list sends a form</option> : null}
            </select>
          </label>
          {draft.trigger === "form" ? (
            <label className="block">
              <span className="field-label">Which form</span>
              <select className="field mt-2" value={draft.formId} onChange={(e) => setDraft({ ...draft, formId: e.target.value })}>
                {automation.forms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <span className="mt-2 block text-sm text-ink-soft">
                Only forms that ask for an email address. Someone already on your list starts it when they send the form; someone who checks the box to hear from you starts it once they confirm by email.
              </span>
            </label>
          ) : null}
          {draft.trigger === "tagged" ? (
            <label className="block">
              <span className="field-label">Which label</span>
              <input
                className="field mt-2"
                maxLength={MAX_CONDITION_TAG}
                value={draft.triggerTag}
                placeholder="interested"
                onChange={(e) => setDraft({ ...draft, triggerTag: e.target.value })}
              />
              <span className="mt-2 block text-sm text-ink-soft">
                Given by a step of another sequence. A label an import brought does not start anything.
              </span>
            </label>
          ) : null}
          {draft.trigger === "finished" ? (
            <label className="block">
              <span className="field-label">Which course</span>
              <select className="field mt-2" value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })}>
                {products
                  .filter((p) => courses.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
              </select>
              <span className="mt-2 block text-sm text-ink-soft">
                When the last lesson is marked done, by a button, a quiz passed or work approved. Each student starts it once.
              </span>
            </label>
          ) : null}
          {draft.trigger === "product" ? (
            <label className="block">
              <span className="field-label">Which product</span>
              <select className="field mt-2" value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </label>
          ) : null}
          {/* The sequence's end (lib/flow-rules.ts): once somebody has what
              it was selling, the rest of it is not for them. */}
          <div>
            <label className="block">
              <span className="field-label">Ends early</span>
              <select
                className="field mt-2"
                data-flow-goal-choice
                value={draft.goal}
                onChange={(e) => setDraft({ ...draft, goal: e.target.value === "any" ? "any" : e.target.value === "product" ? "product" : "" })}
              >
                <option value="">Never: everyone gets every email</option>
                {draft.trigger === "bought" ? null : <option value="any">Once they have bought anything</option>}
                {products.length ? <option value="product">Once they get a product</option> : null}
              </select>
            </label>
            {draft.goal === "product" ? (
              <label className="mt-3 block">
                <span className="sr-only">The product it ends on</span>
                <select className="field" value={draft.goalProduct} onChange={(e) => setDraft({ ...draft, goalProduct: e.target.value })}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <p className="mt-2 text-sm text-ink-soft">
              Checked before each email. Someone who buys while in it gets none of the emails still to come.
            </p>
          </div>
          <AiAssist<DraftedStep[]>
            title="Write the emails with AI"
            hint="For the moment chosen above, from what your store sells: its products' names, summaries, prices and links, and anything you add here. Only your store's own links are kept. The emails fill the sequence below for you to read and change; nothing is saved or sent until you save it."
            placeholder="Optional: what these emails should say, or the tone. For example: share my three favorite weeknight tricks before mentioning the meal planner."
            allowEmpty
            extra={
              <label className="flex flex-wrap items-center gap-2 text-sm text-ink">
                <span className="font-semibold">How many emails</span>
                <select className="field w-auto" value={draftCount} onChange={(e) => setDraftCount(Number(e.target.value))}>
                  {SEQUENCE_DRAFT_COUNTS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            }
            payload={() => ({ kind: "sequence", trigger: draft.trigger, productId: draft.trigger === "product" || draft.trigger === "finished" ? draft.productId : "", tag: draft.trigger === "tagged" ? draft.triggerTag : "", count: draftCount })}
            onResult={(written) =>
              setDraft((current) => {
                if (!current) return current;
                const steps: StepDraft[] = written.map((w) => ({
                  ...(w.delayHours > 0 && w.delayHours % 24 === 0
                    ? blankStep(String(w.delayHours / 24), "days", products[0]?.id ?? "")
                    : blankStep(String(w.delayHours), "hours", products[0]?.id ?? "")),
                  subject: w.subject,
                  body: w.body,
                }));
                // Emails still empty are replaced; the creator's own are kept, and these follow them.
                // A step that acts has no words of its own, and is kept too.
                const kept = current.steps.filter((x) => x.kind !== "email" || x.subject.trim() || x.body.trim());
                return { ...current, steps: [...kept, ...steps].slice(0, 10) };
              })
            }
            done="The emails are in the sequence below. Read each one, change what you like, then save it."
          />
          <ol className="space-y-4">
            {draft.steps.map((s, i) => (
              <li key={i} className="rounded-[var(--r-sm)] bg-sand p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{s.kind === "email" ? `Email ${i + 1}` : `Step ${i + 1}`}</p>
                  <label className="block">
                    <span className="sr-only">{`What step ${i + 1} does`}</span>
                    <select
                      className="field w-auto"
                      data-step-kind
                      value={s.kind}
                      onChange={(e) => {
                        const v = e.target.value;
                        const kind = v === "tag" || v === "untag" || v === "start" || v === "webhook" || v === "field" || v === "deal" || v === "note" || v === "notify" ? v : "email";
                        setStep(i, {
                          kind,
                          actionFlow: s.actionFlow || otherFlows[0]?.id || "",
                          actionField: s.actionField || automation.fields[0]?.id || "",
                          actionStage: s.actionStage || automation.stages[0]?.id || "",
                        });
                      }}
                    >
                      <option value="email">Sends an email</option>
                      <option value="tag">Gives a label</option>
                      <option value="untag">Takes a label off</option>
                      {otherFlows.length ? <option value="start">Starts another sequence</option> : null}
                      <option value="webhook">Tells your webhooks</option>
                      {automation.fields.length ? <option value="field">Sets a field</option> : null}
                      {automation.stages.length ? <option value="deal">Puts their deal in a stage</option> : null}
                      <option value="note">Writes a note on their page</option>
                      <option value="notify">Emails you who reached it</option>
                    </select>
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <label className="block">
                    <span className="text-sm text-ink-soft">{i === 0 ? "Wait after it starts" : "Wait after the one before"}</span>
                    <input
                      className="field mt-1 w-24"
                      inputMode="numeric"
                      value={s.wait}
                      onChange={(e) => setStep(i, { wait: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Hours or days</span>
                    <select className="field w-28" value={s.unit} onChange={(e) => setStep(i, { unit: e.target.value === "days" ? "days" : "hours" })}>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                  </label>
                </div>
                {s.kind === "tag" || s.kind === "untag" ? (
                  <label className="mt-3 block">
                    <span className="text-sm text-ink-soft">{s.kind === "tag" ? "The label to give" : "The label to take off"}</span>
                    <input
                      className="field mt-1"
                      maxLength={MAX_CONDITION_TAG}
                      value={s.actionTag}
                      placeholder="interested"
                      onChange={(e) => setStep(i, { actionTag: e.target.value })}
                    />
                    {s.kind === "tag" ? (
                      <span className="mt-1 block text-sm text-ink-soft">
                        Starts any sequence that starts with this label. Someone who already has ten labels is not given another.
                      </span>
                    ) : null}
                  </label>
                ) : s.kind === "start" ? (
                  <label className="mt-3 block">
                    <span className="text-sm text-ink-soft">The sequence to start</span>
                    <select className="field mt-1" value={s.actionFlow} onChange={(e) => setStep(i, { actionFlow: e.target.value })} required>
                      {s.actionFlow ? null : <option value="">A sequence that was removed: choose another</option>}
                      {otherFlows.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <span className="mt-1 block text-sm text-ink-soft">Each person goes through a sequence once, so nobody is started on it twice.</span>
                  </label>
                ) : s.kind === "field" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-ink-soft">The field</span>
                      <select className="field mt-1" value={s.actionField} onChange={(e) => setStep(i, { actionField: e.target.value, actionValue: "" })}>
                        {automation.fields.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </label>
                    {(() => {
                      const field = automation.fields.find((f) => f.id === s.actionField);
                      return field?.type === "choice" ? (
                        <label className="block">
                          <span className="text-sm text-ink-soft">Set to</span>
                          <select className="field mt-1" value={s.actionValue} onChange={(e) => setStep(i, { actionValue: e.target.value })}>
                            <option value="">Choose one</option>
                            {field.options.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <label className="block">
                          <span className="text-sm text-ink-soft">Set to</span>
                          <input
                            className="field mt-1"
                            type={field?.type === "date" ? "date" : "text"}
                            inputMode={field?.type === "number" ? "decimal" : undefined}
                            maxLength={200}
                            value={s.actionValue}
                            onChange={(e) => setStep(i, { actionValue: e.target.value })}
                          />
                        </label>
                      );
                    })()}
                    <span className="block text-sm text-ink-soft sm:col-span-2">Shown on their page in your studio, and in your list&apos;s file.</span>
                  </div>
                ) : s.kind === "deal" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-ink-soft">The stage</span>
                      <select className="field mt-1" value={s.actionStage} onChange={(e) => setStep(i, { actionStage: e.target.value })}>
                        {automation.stages.map((st) => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm text-ink-soft">A new deal&apos;s title (optional)</span>
                      <input className="field mt-1" maxLength={90} value={s.actionTitle} placeholder={draft.name} onChange={(e) => setStep(i, { actionTitle: e.target.value })} />
                    </label>
                    <span className="block text-sm text-ink-soft sm:col-span-2">Their open deal moves to this stage; with none open, a new one is made for them on your deals board.</span>
                  </div>
                ) : s.kind === "note" ? (
                  <label className="mt-3 block">
                    <span className="text-sm text-ink-soft">The note</span>
                    <input className="field mt-1" maxLength={300} value={s.actionText} placeholder="Asked about coaching" onChange={(e) => setStep(i, { actionText: e.target.value })} />
                    <span className="mt-1 block text-sm text-ink-soft">Written on their page in your studio, with the sequence and the step it came from.</span>
                  </label>
                ) : s.kind === "notify" ? (
                  <p className="mt-3 text-sm text-ink-soft">
                    One email to you for everyone who reaches this step together: who they are, and the link to find them in your studio.
                  </p>
                ) : s.kind === "webhook" ? (
                  <p className="mt-3 text-sm text-ink-soft">
                    Each person who reaches this step is sent to your own server as a &ldquo;Sequence step&rdquo; event, once: their email, the sequence and the step. Choose an address that listens for it under Webhooks, in your settings; with none, this step does nothing.
                  </p>
                ) : (
                <>
                <label className="mt-3 block">
                  <span className="text-sm text-ink-soft">Subject</span>
                  <input className="field mt-1" maxLength={150} value={s.subject} onChange={(e) => setStep(i, { subject: e.target.value })} />
                </label>
                <div className="mt-3">
                  <MailBodyEditor
                    body={s.body}
                    rows={6}
                    onChange={(next) => setStep(i, { body: next })}
                    boxRef={(el) => {
                      stepBoxes.current[i] = el;
                    }}
                  />
                </div>
                </>
                )}
                {/* Who this email is for (lib/flow-rules.ts). Read from what
                    your list keeps — what each person has and the labels an
                    import brought, and links used, only for readers who allowed it
                    (lib/mail-clicks.ts) — never from opens. */}
                <div className="mt-3 flex flex-wrap items-end gap-2" data-step-condition>
                  <label className="block min-w-0 flex-1">
                    <span className="text-sm text-ink-soft">{s.kind === "email" ? "Send it to" : "Do it for"}</span>
                    <select
                      className="field mt-1"
                      value={s.when}
                      onChange={(e) => {
                        const when = STEP_IF_WORDS.find((w) => w.value === e.target.value)?.value ?? "";
                        // A condition on a course names a course: the first, when the product chosen is not one.
                        setStep(i, isCourseIf(when) && !courses.includes(s.whenProduct) ? { when, whenProduct: courses[0] ?? s.whenProduct } : { when });
                      }}
                    >
                      {STEP_IF_WORDS.filter(
                        (w) =>
                          (products.length || (w.value !== "has" && w.value !== "lacks")) &&
                          (courses.length > 0 || !isCourseIf(w.value)) &&
                          ((i > 0 && draft.steps[i - 1].kind === "email") || (w.value !== "clicked" && w.value !== "unclicked")),
                      ).map((w) => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                    </select>
                  </label>
                  {s.when === "has" || s.when === "lacks" ? (
                    <label className="block min-w-0 flex-1">
                      <span className="text-sm text-ink-soft">Product</span>
                      <select className="field mt-1" value={s.whenProduct} onChange={(e) => setStep(i, { whenProduct: e.target.value })}>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {isCourseIf(s.when) ? (
                    <label className="block min-w-0 flex-1">
                      <span className="text-sm text-ink-soft">Course</span>
                      <select className="field mt-1" value={s.whenProduct} onChange={(e) => setStep(i, { whenProduct: e.target.value })}>
                        {products
                          .filter((p) => courses.includes(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  {s.when === "tag" || s.when === "untagged" ? (
                    <label className="block min-w-0 flex-1">
                      <span className="text-sm text-ink-soft">Label, from an import or a sequence</span>
                      <input className="field mt-1" maxLength={MAX_CONDITION_TAG} value={s.whenTag} onChange={(e) => setStep(i, { whenTag: e.target.value })} />
                    </label>
                  ) : null}
                </div>
                {s.when === "clicked" || s.when === "unclicked" ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    Counted only for readers who allowed it with a box of its own when they joined, and only for links to your
                    store. Everyone else counts as not having used one.
                  </p>
                ) : null}
                {s.when ? (
                  <label className="mt-2 block">
                    <span className="text-sm text-ink-soft">Everyone else</span>
                    <select className="field mt-1" value={s.otherwise} onChange={(e) => setStep(i, { otherwise: e.target.value === "end" ? "end" : "skip" })}>
                      <option value="skip">{s.kind === "email" ? "Skips this email and goes on to the next" : "Skips this step and goes on to the next"}</option>
                      <option value="end">Leaves the sequence here</option>
                    </select>
                  </label>
                ) : null}
                {draft.steps.length > 1 ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-danger"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        // The email that becomes the first has no email before it to read.
                        steps: settle(draft.steps.filter((_, j) => j !== i)),
                      })
                    }
                  >
                    {s.kind === "email" ? "Remove this email" : "Remove this step"}
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
          {draft.steps.length < 10 ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDraft({ ...draft, steps: [...draft.steps, blankStep("2", "days", products[0]?.id ?? "")] })}
            >
              Add a step
            </button>
          ) : null}
          {draftIssues.length ? <div className="notice notice-warn text-sm"><p className="font-semibold">Review this configuration before activating</p><ul className="mt-2 list-disc space-y-1 pl-5">{draftIssues.map((issue, index) => <li key={index}>{issue}</li>)}</ul><p className="mt-2">These are reference checks. Saving still uses server validation; delivery and action execution have not been tested.</p></div> : null}
          {!draft.id ? <p className="text-sm text-ink-soft">New sequences start paused. Review the content, trigger and actions, then switch On when ready to save an active sequence.</p> : null}
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            <span>On. Switched off, nobody new starts it, and those already in it get none of its emails that are still to come.</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" aria-busy={busy} disabled={busy || invalidWait} className="btn btn-primary">Save the sequence</button>
            <button type="button" className="text-sm font-bold text-ink-soft underline underline-offset-4" onClick={() => setDraft(null)}>
              Close
            </button>
          </div>
          <Feedback error={error} done={null} />
          </fieldset>
        </form>
      ) : flows.length < 10 ? (
        <button type="button" className="btn btn-secondary mt-5" disabled={busy} onClick={() => openDraft(null)}>
          New sequence
        </button>
      ) : null}
    </section>
  );
}
