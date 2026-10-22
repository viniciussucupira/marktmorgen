"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentRequestReply, type RequestAction } from "@/lib/payment-request-reply";
import { toast } from "@/components/toast";
import { Icon } from "@/components/icons";
import { type Currency, fieldPrefix, formatMoney, readMoney } from "@/lib/money";
import {
  MAX_AUTO_REMINDERS,
  MAX_LINES,
  MAX_LINE_TEXT,
  MAX_NAME,
  MAX_NOTE,
  MAX_QUANTITY,
  MAX_SENDS,
  OPEN_DAYS,
  REMIND_EVERY_DAYS,
  STATUS_WORDS,
  type PaymentRequest,
  type RequestStatus,
  canSendAgain,
  nextReminderAt,
  requestBounds,
  statusOf,
} from "@/lib/payment-request-rules";

type LineDraft = { text: string; quantity: string; amount: string };
export type RequestRow = PaymentRequest & { link: string };
export type Prefill = { email: string; name: string; text: string; amount: string };

const TONES: Record<RequestStatus, string> = {
  open: "bg-sky-50 text-sky-900 ring-sky-200",
  paid: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  refunded: "bg-amber-50 text-amber-900 ring-amber-200",
  canceled: "bg-paper text-ink-soft ring-line",
  expired: "bg-paper text-ink-soft ring-line",
};

const day = (at: number) => new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dueDay = (d: string) => day(Date.parse(`${d}T12:00:00Z`));

/**
 * The studio's payment requests (lib/payment-request-rules.ts): a form for a
 * new one, for one person, with its lines, an optional due date and the
 * reminders that may go by themselves; and every request kept, with where
 * it stands, its link, and what can still be done with it.
 */
export function PaymentRequestsStudio({
  rows,
  now,
  currency,
  canSend,
  open,
  closedWhy,
  limits,
  openNow,
  emails,
  shareWords,
  taxOn,
  prefill,
  dueFirst,
  dueLast,
}: {
  rows: RequestRow[];
  now: number;
  currency: Currency;
  canSend: boolean;
  open: boolean;
  closedWhy: string;
  limits: { open: number; kept: number };
  openNow: number;
  emails: { used: number; limit: number };
  shareWords: string;
  taxOn: boolean;
  prefill: Prefill;
  dueFirst: string;
  dueLast: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(prefill.email);
  const [name, setName] = useState(prefill.name);
  const [lines, setLines] = useState<LineDraft[]>([{ text: prefill.text, quantity: "1", amount: prefill.amount }]);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminders, setReminders] = useState(1);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const money = (cents: number) => formatMoney(cents, currency);
  const { min, max } = requestBounds(currency);

  const total = lines.reduce((sum, line) => {
    const cents = readMoney(line.amount.trim().replace(/^(\d+),(\d{1,2})$/, "$1.$2"), currency);
    const quantity = Number(line.quantity);
    return cents !== null && Number.isSafeInteger(quantity) && quantity > 0 ? sum + cents * quantity : sum;
  }, 0);

  async function call(body: Record<string, unknown> & { action: RequestAction }): Promise<{ ok: boolean; message?: string; sent?: boolean }> {
    try {
      const response = await fetch("/api/store/payment-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data: unknown = await response.json().catch(() => null);
      return paymentRequestReply(response.ok, data, body.action);
    } catch {
      return { ok: false };
    }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy("create");
    setError("");
    const answer = await call({ action: "create", email, name, lines, note, dueDate, autoReminders: reminders, consent });
    setBusy("");
    if (!answer.ok) {
      setError(answer.message ?? "The result could not be confirmed. Reload to check the request before trying again.");
      return;
    }
    toast(answer.sent ? "Request sent." : "Request saved, but its email did not go. Send it again from the list.");
    setEmail("");
    setName("");
    setLines([{ text: "", quantity: "1", amount: "" }]);
    setNote("");
    setDueDate("");
    setConsent(false);
    router.refresh();
  }

  async function act(action: "remind" | "cancel" | "delete", id: string, done: string) {
    if (busy) return;
    setBusy(`${action}:${id}`);
    const answer = await call({ action, id });
    setBusy("");
    if (!answer.ok) {
      toast(answer.message ?? "The result could not be confirmed. Reload to check the request before trying again.");
      return;
    }
    toast(action === "remind" && answer.sent === false ? "The reminder did not go. Your store's emails for this month may be used." : done);
    router.refresh();
  }

  const setLine = (i: number, patch: Partial<LineDraft>) => setLines((all) => all.map((line, j) => (j === i ? { ...line, ...patch } : line)));

  return (
    <div className="mt-8 space-y-8">
      {canSend ? (
        <form onSubmit={create} className="card p-6 sm:p-8" noValidate>
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">New payment request</p>
          <p className="mt-2 max-w-2xl text-ink-soft">
            For one person who agreed to pay you: a client, a brand, a student. They get one email from your store&apos;s name with a link to a page
            that shows what it is for and the total, and pay on Stripe&apos;s page, to your own Stripe account. Nothing is added to what they pay
            {taxOn ? ", except sales tax where your Stripe Tax collects it" : ""}. {shareWords}
          </p>
          {!open ? <p className="notice notice-error mt-4" role="alert">{closedWhy}</p> : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Their email</span>
              <input className="field mt-1" type="email" autoComplete="off" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Their name (optional)</span>
              <input className="field mt-1" maxLength={MAX_NAME} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-ink">What it is for</legend>
            <div className="mt-2 space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_9rem_auto] sm:items-end">
                  <label className="block min-w-0">
                    <span className="sr-only">{`Line ${i + 1}: what it is for`}</span>
                    <input className="field" placeholder="Coaching, October (4 sessions)" maxLength={MAX_LINE_TEXT} value={line.text} onChange={(e) => setLine(i, { text: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-ink-soft">Quantity</span>
                    <input className="field" inputMode="numeric" value={line.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} aria-label={`Line ${i + 1}: quantity, 1 to ${MAX_QUANTITY}`} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-ink-soft">{`Each, ${fieldPrefix(currency)}`}</span>
                    <input className="field" inputMode="decimal" placeholder="120" value={line.amount} onChange={(e) => setLine(i, { amount: e.target.value })} aria-label={`Line ${i + 1}: amount each`} />
                  </label>
                  {lines.length > 1 ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLines((all) => all.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`}>
                      <Icon name="minus" size={16} />
                    </button>
                  ) : <span />}
                </div>
              ))}
            </div>
            {lines.length < MAX_LINES ? (
              <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setLines((all) => [...all, { text: "", quantity: "1", amount: "" }])}>
                <Icon name="plus" size={16} /> Add a line
              </button>
            ) : null}
            <p className="mt-3 font-semibold tabular-nums text-ink">{`Total: ${money(total)}`}</p>
            <p className="text-xs text-ink-soft">{`From ${money(min)} to ${money(max)} for one request, up to ${MAX_LINES} lines.`}</p>
          </fieldset>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">A note for them (optional)</span>
            <textarea className="field mt-1 min-h-24" maxLength={MAX_NOTE} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Due date (optional)</span>
              <input className="field mt-1" type="date" min={dueFirst} max={dueLast} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <span className="mt-1 block text-xs text-ink-soft">{`Shown as a date, nothing more. The link takes payment for ${OPEN_DAYS} days.`}</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">If it is not paid</span>
              <select className="field mt-1" value={reminders} onChange={(e) => setReminders(Number(e.target.value))}>
                <option value={0}>Send no reminder</option>
                {Array.from({ length: MAX_AUTO_REMINDERS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n === 1 ? `One reminder, ${REMIND_EVERY_DAYS} days later` : `Up to ${n} reminders, ${REMIND_EVERY_DAYS} days apart`}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-ink-soft">None after it is paid, canceled or expired.</span>
            </label>
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            {`Each email, the request and each reminder, is one of your store's emails for this month: ${emails.used.toLocaleString("en-US")} of ${emails.limit.toLocaleString("en-US")} used. Open requests: ${openNow.toLocaleString("en-US")} of ${limits.open.toLocaleString("en-US")}.`}
          </p>
          <label className="mt-4 flex items-start gap-3">
            <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm text-ink">This person agreed to pay me for what this request lists, and expects it.</span>
          </label>
          {error ? <p className="notice notice-error mt-4" role="alert">{error}</p> : null}
          <button type="submit" className="btn btn-primary mt-5" disabled={!open || busy !== ""}>
            {busy === "create" ? "Sending..." : "Send request"}
          </button>
        </form>
      ) : (
        <p className="notice">Only the owner and admins can send payment requests. You can see them here.</p>
      )}

      <section aria-labelledby="requests-heading">
        <h2 id="requests-heading" className="text-lg font-semibold tracking-[-0.02em] text-ink">{`Requests (${rows.length.toLocaleString("en-US")} of ${limits.kept.toLocaleString("en-US")} kept)`}</h2>
        {rows.length === 0 ? <p className="mt-3 text-ink-soft">No requests yet.</p> : null}
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const status = statusOf(r, now);
            const next = nextReminderAt(r, now);
            const again = canSendAgain(r, now);
            return (
              <li key={r.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink [overflow-wrap:anywhere]">{r.name ? `${r.name} · ${r.email}` : r.email}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums text-ink">{money(r.total)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${TONES[status]}`}>{STATUS_WORDS[status]}</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-ink-soft [overflow-wrap:anywhere]">{r.lines.map((l) => (l.quantity > 1 ? `${l.text} × ${l.quantity}` : l.text)).join(" · ")}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {[
                    `Made ${day(r.createdAt)}`,
                    r.dueDate ? `due ${dueDay(r.dueDate)}` : "",
                    status === "open" ? `link works until ${day(r.expiresAt)}` : "",
                    r.sent.length ? `emailed ${r.sent.length} of ${MAX_SENDS} times, last ${day(r.sent[r.sent.length - 1])}` : "not emailed yet",
                    next !== null ? `next reminder ${day(next)}` : "",
                    status === "paid" || status === "refunded" ? `paid ${money(r.amountPaid || r.total)} on ${day(r.paidAt)}` : "",
                    r.refunded > 0 ? `${money(r.refunded)} refunded` : "",
                  ].filter(Boolean).join(" · ")}
                </p>
                {r.failed && status === "open" ? <p className="mt-1 text-xs font-semibold text-danger">{r.failed}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(r.link);
                        toast("Link copied.");
                      } catch {
                        toast(r.link);
                      }
                    }}
                  >
                    <Icon name="copy" size={15} /> Copy link
                  </button>
                  {canSend && status === "open" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={!again.ok || !open || busy !== ""} title={again.ok ? "" : again.why} onClick={() => void act("remind", r.id, "Reminder sent.")}>
                      <Icon name="mail" size={15} /> Send a reminder
                    </button>
                  ) : null}
                  {canSend && status === "open" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== ""} onClick={() => void act("cancel", r.id, "Request canceled. Its link no longer takes payment.")}>
                      Cancel
                    </button>
                  ) : null}
                  {canSend && status !== "open" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== ""} onClick={() => void act("delete", r.id, "Request deleted. Any payment stays on your Stripe account.")} aria-label={`Delete the request to ${r.email}`}>
                      <Icon name="trash" size={15} /> Delete
                    </button>
                  ) : null}
                  {status === "open" && !again.ok && canSend ? <span className="text-xs text-ink-soft">{again.why}</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
