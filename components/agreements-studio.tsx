"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agreementReply, type AgreementAction, type AgreementReply } from "@/lib/agreement-reply";
import { agreementEditorVersion } from "@/lib/agreement-editor-version";
import { toast } from "@/components/toast";
import { Icon } from "@/components/icons";
import { type Currency, fieldPrefix, formatMoney, readMoney } from "@/lib/money";
import {
  KEEP_DAYS,
  KIND_WORDS,
  MAX_BODY,
  MAX_KEPT_AGREEMENTS,
  MAX_LINES,
  MAX_LINE_TEXT,
  MAX_NAME,
  MAX_QUANTITY,
  MAX_SENDS,
  MAX_TITLE,
  MAX_VERSIONS,
  SIGN_DAYS,
  STATUS_WORDS,
  type Agreement,
  type AgreementKind,
  type AgreementStatus,
  canRevise,
  canSendAgain,
  latestOf,
  statusOf,
} from "@/lib/agreement-rules";

type LineDraft = { text: string; quantity: string; amount: string };
export type AgreementRow = Agreement & { link: string };
export type PayChoice = { id: string; label: string };

const TONES: Record<AgreementStatus, string> = {
  open: "bg-sky-50 text-sky-900 ring-sky-200",
  signed: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  expired: "bg-paper text-ink-soft ring-line",
  withdrawn: "bg-paper text-ink-soft ring-line",
};

const day = (at: number) => new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const emptyLine = (): LineDraft => ({ text: "", quantity: "1", amount: "" });

/**
 * The studio's proposals and agreements (lib/agreement-rules.ts): a form for
 * a new one, or a new version of one, and every one kept, with where it
 * stands, its link, each version's signature and what can still be done.
 */
export function AgreementsStudio({
  rows,
  now,
  currency,
  canSend,
  open,
  emails,
  payChoices,
}: {
  rows: AgreementRow[];
  now: number;
  currency: Currency;
  canSend: boolean;
  open: boolean;
  emails: { used: number; limit: number };
  payChoices: PayChoice[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AgreementRow | null>(null);
  const [kind, setKind] = useState<AgreementKind>("agreement");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [payRequest, setPayRequest] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const money = (cents: number) => formatMoney(cents, currency);

  const total = lines.reduce((sum, line) => {
    const cents = readMoney(line.amount.trim().replace(/^(\d+),(\d{1,2})$/, "$1.$2"), currency);
    const quantity = Number(line.quantity);
    return cents !== null && Number.isSafeInteger(quantity) && quantity > 0 ? sum + cents * quantity : sum;
  }, 0);

  async function call(payload: Record<string, unknown> & { action: AgreementAction }): Promise<AgreementReply> {
    try {
      const response = await fetch("/api/store/agreements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return agreementReply(response.ok, await response.json().catch(() => null), payload.action);
    } catch {
      return { ok: false };
    }
  }

  function reset() {
    setEditing(null);
    setKind("agreement");
    setEmail("");
    setName("");
    setTitle("");
    setBody("");
    setLines([]);
    setPayRequest("");
    setConsent(false);
    setError("");
  }

  async function startEdit(row: AgreementRow) {
    if (busy) return;
    setBusy(`read:${row.id}`);
    const answer = await call({ action: "read", id: row.id });
    setBusy("");
    const latest = latestOf(row);
    const v = agreementEditorVersion(answer.version, currency, latest?.n ?? 0);
    if (!answer.ok || !v || v.sha256 !== latest?.sha256) {
      toast(answer.message ?? "That agreement can't be read right now. Try again in a moment.");
      return;
    }
    setEditing(row);
    setKind(row.kind);
    setEmail(row.email);
    setName(row.name);
    setTitle(v.title);
    setBody(v.body);
    setLines(v.lines);
    setPayRequest(row.payRequest);
    setError("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy("save");
    setError("");
    const answer = editing
      ? await call({ action: "revise", id: editing.id, title, body, lines, payRequest })
      : await call({ action: "create", kind, email, name, title, body, lines, payRequest, consent });
    setBusy("");
    if (!answer.ok) {
      setError(answer.message ?? "We couldn't confirm whether the agreement was saved or emailed. Your text is still here. Reload to check before trying again.");
      return;
    }
    toast(answer.sent ? (editing ? "New version sent. It needs a new signature." : "Sent for signature.") : "Saved, but its email did not go. Send it again from the list.");
    reset();
    router.refresh();
  }

  async function act(action: "resend" | "copy" | "withdraw" | "delete", id: string, done: string) {
    if (busy) return;
    setBusy(`${action}:${id}`);
    const answer = await call({ action, id });
    setBusy("");
    if (!answer.ok) {
      toast(answer.message ?? "We couldn't confirm the result. Reload to check before trying again.");
      return;
    }
    toast((action === "resend" || action === "copy") && answer.sent === false ? "The email did not go. Your store's emails for this month may be used." : done);
    router.refresh();
  }

  const setLine = (i: number, patch: Partial<LineDraft>) => setLines((all) => all.map((line, j) => (j === i ? { ...line, ...patch } : line)));

  return (
    <div className="mt-8 space-y-8">
      {canSend ? (
        <form onSubmit={submit} className="card p-6 sm:p-8" noValidate>
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{editing ? `New version for ${editing.name || editing.email}` : "New proposal or agreement"}</p>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {editing
              ? "A version that was sent is never changed. Saving writes a new version, emails its link, and needs a new signature; an earlier signature stays recorded against the text it signed."
              : "For one person you deal with. They get one email from your store's name with a link to a page that shows the exact text, and sign it there by typing their full name and the address it was sent to."}
          </p>
          {!open ? <p className="notice notice-error mt-4" role="alert">Agreements can be sent while your plan, or free trial, is running.</p> : null}
          {!editing ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Kind</span>
                <select className="field mt-1" value={kind} onChange={(e) => setKind(e.target.value === "proposal" ? "proposal" : "agreement")}>
                  <option value="agreement">Agreement</option>
                  <option value="proposal">Proposal</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Their email</span>
                <input className="field mt-1" type="email" autoComplete="off" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Their name (optional)</span>
                <input className="field mt-1" maxLength={MAX_NAME} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            </div>
          ) : null}
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Title</span>
            <input className="field mt-1" maxLength={MAX_TITLE} required placeholder="Coaching agreement, October to December" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">The text</span>
            <textarea className="field mt-1 min-h-64 font-mono text-sm" maxLength={MAX_BODY} required value={body} onChange={(e) => setBody(e.target.value)} />
            <span className="mt-1 block text-xs text-ink-soft">{`Plain text, up to ${MAX_BODY.toLocaleString("en-US")} characters, shown exactly as you type it. Marktmorgen gives no legal advice and provides no templates: you write the terms, and whether they can be enforced depends on the law where you and they are.`}</span>
          </label>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-ink">Lines with amounts (optional)</legend>
            <div className="mt-2 space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_9rem_auto] sm:items-end">
                  <label className="block min-w-0">
                    <span className="sr-only">{`Line ${i + 1}: what it is for`}</span>
                    <input className="field" placeholder="Twelve weekly sessions" maxLength={MAX_LINE_TEXT} value={line.text} onChange={(e) => setLine(i, { text: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-ink-soft">Quantity</span>
                    <input className="field" inputMode="numeric" value={line.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} aria-label={`Line ${i + 1}: quantity, 1 to ${MAX_QUANTITY}`} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-ink-soft">{`Each, ${fieldPrefix(currency)}`}</span>
                    <input className="field" inputMode="decimal" placeholder="120" value={line.amount} onChange={(e) => setLine(i, { amount: e.target.value })} aria-label={`Line ${i + 1}: amount each`} />
                  </label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLines((all) => all.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`}>
                    <Icon name="minus" size={16} />
                  </button>
                </div>
              ))}
            </div>
            {lines.length < MAX_LINES ? (
              <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setLines((all) => [...all, emptyLine()])}>
                <Icon name="plus" size={16} /> Add a line
              </button>
            ) : null}
            {lines.length ? <p className="mt-3 font-semibold tabular-nums text-ink">{`Total: ${money(total)}`}</p> : null}
          </fieldset>
          {payChoices.length ? (
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-ink">Payment request to show once signed (optional)</span>
              <select className="field mt-1" value={payRequest} onChange={(e) => setPayRequest(e.target.value)}>
                <option value="">None</option>
                {payChoices.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-ink-soft">One of your open payment requests. Signing never charges anything; they pay only if they open it and pay.</span>
            </label>
          ) : null}
          <p className="mt-5 text-sm text-ink-soft">
            {`Each email, the link, a new version and each signed copy (one to them, one to you), is one of your store's emails for this month: ${emails.used.toLocaleString("en-US")} of ${emails.limit.toLocaleString("en-US")} used. The link takes a signature for ${SIGN_DAYS} days.`}
          </p>
          {!editing ? (
            <label className="mt-4 flex items-start gap-3">
              <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span className="text-sm text-ink">I deal with this person, and they expect this from me.</span>
            </label>
          ) : null}
          {error ? <p className="notice notice-error mt-4" role="alert">{error}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={!open || busy !== ""}>
              {busy === "save" ? "Sending..." : editing ? "Send the new version" : "Send for signature"}
            </button>
            {editing ? (
              <button type="button" className="btn btn-secondary" onClick={reset} disabled={busy !== ""}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="notice">Only the owner and admins can send agreements. You can see them here.</p>
      )}

      <section aria-labelledby="agreements-heading">
        <h2 id="agreements-heading" className="text-lg font-semibold tracking-[-0.02em] text-ink">{`Agreements (${rows.length.toLocaleString("en-US")} of ${MAX_KEPT_AGREEMENTS} kept)`}</h2>
        <p className="mt-1 text-sm text-ink-soft">{`Each is kept for ${KEEP_DAYS} days from when it was made, then deleted by itself. Keep the signed copy you are emailed.`}</p>
        {rows.length === 0 ? <p className="mt-3 text-ink-soft">No agreements yet.</p> : null}
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const status = statusOf(r, now);
            const latest = latestOf(r);
            const again = canSendAgain(r, now);
            const revisable = canRevise(r);
            return (
              <li key={r.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink [overflow-wrap:anywhere]">{r.name ? `${r.name} · ${r.email}` : r.email}</p>
                  <p className="flex items-center gap-2">
                    <span className="text-sm text-ink-soft">{`${KIND_WORDS[r.kind]}, version ${latest?.n ?? 1} of ${MAX_VERSIONS}`}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${TONES[status]}`}>{STATUS_WORDS[status]}</span>
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                  {r.versions.map((m) => (
                    <li key={m.n} className="[overflow-wrap:anywhere]">
                      {`Version ${m.n}, ${day(m.createdAt)}: ${m.signature ? `signed by ${m.signature.name} on ${day(m.signature.at)}` : m.n === latest?.n ? "not signed" : "not signed, replaced by a later version"} · SHA-256 ${m.sha256.slice(0, 16)}…`}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-ink-soft">
                  {[
                    `Made ${day(r.createdAt)}`,
                    status === "open" ? `link takes a signature until ${day(r.expiresAt)}` : "",
                    r.sent.length ? `emailed ${r.sent.length} of ${MAX_SENDS} times, last ${day(r.sent[r.sent.length - 1])}` : "not emailed yet",
                    r.copies ? `${r.copies} signed ${r.copies === 1 ? "copy" : "copies"} emailed` : "",
                  ].filter(Boolean).join(" · ")}
                </p>
                {r.failed ? <p className="mt-1 text-xs font-semibold text-danger">{r.failed}</p> : null}
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
                    <button type="button" className="btn btn-secondary btn-sm" disabled={!again.ok || !open || busy !== ""} title={again.ok ? "" : again.why} onClick={() => void act("resend", r.id, "Sent again.")}>
                      <Icon name="mail" size={15} /> Send again
                    </button>
                  ) : null}
                  {canSend && r.state !== "withdrawn" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={!revisable.ok || !open || busy !== ""} title={revisable.ok ? "" : revisable.why} onClick={() => void startEdit(r)}>
                      New version
                    </button>
                  ) : null}
                  {canSend && status === "signed" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== ""} onClick={() => void act("copy", r.id, "Signed copy sent again.")}>
                      Send the signed copy again
                    </button>
                  ) : null}
                  {canSend && (status === "open" || status === "expired") ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== ""} onClick={() => void act("withdraw", r.id, "Withdrawn. Its link no longer takes a signature.")}>
                      Withdraw
                    </button>
                  ) : null}
                  {canSend && status !== "open" ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={busy !== ""} onClick={() => void act("delete", r.id, "Deleted. Copies already emailed stay with whoever received them.")} aria-label={`Delete the agreement with ${r.email}`}>
                      <Icon name="trash" size={15} /> Delete
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
