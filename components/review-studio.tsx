"use client";

import { ELSEWHERE_NOTE, MAX_REVIEW_URL, parseReviewElsewhere } from "@/lib/review-elsewhere";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Stars } from "@/components/review-stars";
import { toast } from "@/components/toast";
import { MAX_REPLY_TEXT } from "@/lib/review-summary";
import { AiOn } from "@/components/ai-assist";
import { DEFAULT_ASK_DAYS, MAX_ASK_DAYS, MIN_ASK_DAYS } from "@/lib/review-ask";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { NewTab } from "@/components/new-tab";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  days: `Pick between ${MIN_ASK_DAYS} and ${MAX_ASK_DAYS} days.`,
  elsewhere: "That is not a review page on Google, Trustpilot or Facebook. Paste the https address of your page there.",
  email: "Review requests are email, so they need Pro with your email set up (the sender name and postal address). Set that up in Email first.",
  busy: "Someone else changed this review at the same moment. Try again.",
  missing: "That review is not there anymore: its buyer may have deleted it. Reload the page.",
  signed_out: "Your session ended. Log in again.",
  unavailable: "Stores are not switched on yet, so nothing was saved.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

async function post(body: Record<string, unknown>): Promise<string | null> {
  try {
    const response = await fetch("/api/store/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    return data.ok ? null : MESSAGES[data.error ?? ""] ?? MESSAGES.server_error;
  } catch {
    return MESSAGES.server_error;
  }
}

/** The review-request email: off, or on some days after buying. */
export function ReviewAskEditor({ days, canEmail, elsewhere = "" }: { days: number; canEmail: boolean; elsewhere?: string }) {
  const router = useRouter();
  const [on, setOn] = useState(days > 0);
  const [value, setValue] = useState(days > 0 ? days : DEFAULT_ASK_DAYS);
  const [page, setPage] = useState(elsewhere);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = on !== days > 0 || (on && value !== days) || page.trim() !== elsewhere;

  async function save() {
    setError(null);
    // The same rule the server holds (lib/review-elsewhere.ts), said before anything is sent.
    if (page.trim() && !parseReviewElsewhere(page)) {
      setError(MESSAGES.elsewhere);
      return;
    }
    setBusy(true);
    const problem = await post({ action: "ask", days: on ? value : 0, elsewhere: page.trim() });
    setBusy(false);
    if (problem) {
      setError(problem);
      return;
    }
    toast(on ? "Review requests saved." : "Review requests switched off.");
    router.refresh();
  }

  return (
    <div>
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 font-semibold text-ink">
        <input type="checkbox" className="h-5 w-5" checked={on} disabled={!canEmail && !on} onChange={(e) => setOn(e.target.checked)} />
        Email buyers once to ask for a review
      </label>
      {on ? (
        <label htmlFor="ask-days" className="mt-2 block max-w-xs">
          <span className="field-label">Days after buying</span>
          <select id="ask-days" className="field" value={value} onChange={(e) => setValue(Number(e.target.value))}>
            {Array.from({ length: MAX_ASK_DAYS - MIN_ASK_DAYS + 1 }, (_, i) => i + MIN_ASK_DAYS).map((d) => (
              <option key={d} value={d}>{`${d} days`}</option>
            ))}
          </select>
        </label>
      ) : null}
      {on ? (
        <label htmlFor="ask-elsewhere" className="mt-3 block max-w-xl">
          <span className="field-label">Your public review page (optional)</span>
          <input
            id="ask-elsewhere"
            type="url"
            inputMode="url"
            className="field"
            maxLength={MAX_REVIEW_URL}
            placeholder="https://g.page/r/…/review"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            aria-describedby="ask-elsewhere-note"
          />
          <span id="ask-elsewhere-note" className="mt-1 block text-xs text-ink-soft">{ELSEWHERE_NOTE}</span>
        </label>
      ) : null}
      <p className="mt-2 text-sm text-ink-soft">
        {canEmail
          ? "One email per order, from your name, only for orders paid while this is on and not refunded, and never to someone who already reviewed it, left your list or pressed stop. It counts in your month's emails and carries your postal address and a one-click way to stop. It asks for an honest review and offers nothing in return."
          : "Review requests are email, so they need Pro with your email set up: the sender name and postal address every email carries. Buyers can still review from their thank-you page and their list of purchases on every plan."}
      </p>
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
      {dirty ? (
        <button type="button" onClick={save} disabled={busy} aria-busy={busy} className="btn btn-primary mt-3">
          {busy ? "Saving…" : "Save"}
        </button>
      ) : null}
    </div>
  );
}

export type StudioReview = {
  id: string;
  productId: string;
  productTitle: string;
  reference: string;
  rating: number;
  text: string;
  name: string;
  date: string;
  edited: string;
  hidden: boolean;
  refunded: boolean;
  reply: string;
  unseen: boolean;
  /** The buyer's photo, by its address; null when there is none. */
  photo: string | null;
};

/** One review in the studio: what the buyer wrote, and what the creator may do about it. */
export function ReviewRow({ review }: { review: StudioReview }) {
  const router = useRouter();
  const ai = useContext(AiOn);
  const [drafting, setDrafting] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  /** A reply drafted from the review as it is kept (lib/ai.ts, replyToReview), into the box, for the creator to change. */
  async function draft() {
    setDrafting(true);
    setAiNote(null);
    try {
      const response = await fetch("/api/store/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "reply", product: review.productId, id: review.id }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; value?: string; error?: string };
      if (data.ok && typeof data.value === "string") {
        setReply(data.value.slice(0, MAX_REPLY_TEXT));
        setAiNote("Drafted. Read it, make it yours, then post it.");
        return;
      }
      setAiNote(data.error === "used" ? "This month's writing help is used up. It starts again with your next billing month." : "The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.");
    } catch {
      setAiNote("The writing help did not answer just now. Your content was not changed. Started attempts count toward the monthly allowance.");
    } finally {
      setDrafting(false);
    }
  }
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(review.reply);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(kind: string, body: Record<string, unknown>, done: string) {
    setBusy(kind);
    setError(null);
    const problem = await post({ product: review.productId, id: review.id, ...body });
    setBusy(null);
    if (problem) {
      setError(problem);
      return;
    }
    toast(done);
    setReplying(false);
    router.refresh();
  }

  const base = `rv-${review.id}`;
  return (
    <li className={`rounded-2xl border bg-white p-4 sm:p-5 ${review.unseen ? "border-violet-brand/40" : "border-line"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-violet-deep">
          <Stars value={review.rating} size={16} label={`${review.rating} out of 5 stars`} />
        </span>
        <span className="font-semibold text-ink">{review.name || "Verified buyer"}</span>
        {review.unseen ? <span className="tag tag-brand">New</span> : null}
        {review.hidden ? <span className="tag">Hidden</span> : null}
        {review.refunded ? <span className="tag">Refunded, not counted</span> : null}
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        {`${review.productTitle} · ${review.date}${review.edited ? ` · edited ${review.edited}` : ""}`}
      </p>
      {review.text ? (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-ink [overflow-wrap:anywhere]">{review.text}</p>
      ) : (
        <p className="mt-3 text-sm italic text-ink-soft">Stars only, no words.</p>
      )}
      {review.photo ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <a href={review.photo} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={review.photo} alt="The buyer's photo" className="h-24 w-24 rounded-xl object-cover ring-1 ring-line" loading="lazy" />
          <NewTab /></a>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy !== null}
            onClick={() => act("photo", { action: "photo" }, "Photo taken off the review.")}
          >
            <Icon name="trash" size={15} />
            {busy === "photo" ? "Taking it off…" : "Take the photo off"}
          </button>
        </div>
      ) : null}
      <p className="mt-3 break-all font-mono text-xs text-ink-mute">{`Order ${review.reference}`}</p>

      {review.reply && !replying ? (
        <div className="mt-3 rounded-xl bg-paper p-3 ring-1 ring-line">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-mute">Your public reply</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink [overflow-wrap:anywhere]">{review.reply}</p>
        </div>
      ) : null}

      {replying ? (
        <div className="mt-3">
          <label htmlFor={`${base}-reply`} className="field-label">
            Your reply, shown under the review
          </label>
          <textarea id={`${base}-reply`} className="field" rows={3} maxLength={MAX_REPLY_TEXT} value={reply} onChange={(e) => setReply(e.target.value)} />
          {ai.on ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-ghost btn-sm ring-1 ring-line" onClick={() => void draft()} disabled={drafting || busy !== null} aria-busy={drafting}>
                <Icon name="sparkle" size={15} />
                {drafting ? "Writing…" : reply.trim() ? "Draft another with AI" : "Draft it with AI"}
              </button>
              {aiNote ? (
                <span className="text-xs text-ink-soft" role="status">
                  {aiNote}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy !== null || !reply.trim()}
              onClick={() => act("reply", { action: "reply", text: reply }, "Reply posted.")}
            >
              {busy === "reply" ? "Posting…" : "Post the reply"}
            </button>
            {review.reply ? (
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => act("reply", { action: "reply", text: "" }, "Reply removed.")}>
                Remove the reply
              </button>
            ) : null}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setReplying(false); setReply(review.reply); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {!replying ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReplying(true)}>
            <Icon name="chat" size={15} />
            {review.reply ? "Edit your reply" : "Reply"}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy !== null}
          onClick={() => act("hide", { action: "hide", hidden: !review.hidden }, review.hidden ? "Review shown again." : "Review hidden.")}
        >
          <Icon name={review.hidden ? "eye" : "ban"} size={15} />
          {review.hidden ? "Show it again" : "Hide from the page"}
        </button>
        {review.unseen ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy !== null}
            onClick={() => act("seen", { action: "seen", items: [`${review.productId}|${review.id}`] }, "Marked as seen.")}
          >
            <Icon name="check" size={15} />
            Mark as seen
          </button>
        ) : null}
      </div>
    </li>
  );
}

/** Empties the queue of new reviews in one press. */
export function SeenAllButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (count === 0) return null;
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const problem = await post({ action: "seen", all: true });
        setBusy(false);
        if (!problem) {
          toast("All marked as seen.");
          router.refresh();
        }
      }}
    >
      <Icon name="check" size={15} />
      {`Mark all ${count} as seen`}
    </button>
  );
}
