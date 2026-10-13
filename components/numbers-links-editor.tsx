"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  label: "Say who the link is for, so you know which one to take back.",
  password: "Use a password of 8 characters or more. Send it apart from the link.",
  days: "Pick how long the link works.",
  full: "Five links at most work at once. Take one back first.",
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  server_error: "Something went wrong on our side. Nothing was changed; try again in a moment.",
};

export type LinkRow = { id: string; label: string; expires: number; money: boolean; url: string };

const day = (seconds: number) => new Date(seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Read-only links to the store's counted numbers, each with a password and an end (lib/numbers-links.ts). */
export function NumbersLinksEditor({ links, now }: { links: LinkRow[]; now: number }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [days, setDays] = useState("30");
  const [money, setMoney] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<LinkRow | null>(null);
  const live = links.filter((l) => l.expires > now);

  async function send(body: Record<string, unknown>): Promise<{ ok?: boolean; error?: string; link?: LinkRow }> {
    const response = await fetch("/api/store/numbers-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; link?: LinkRow };
  }

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const data = await send({ action: "create", label, password, days: Number(days), money });
      if (data.ok && data.link) {
        setMade(data.link);
        setLabel("");
        setPassword("");
        toast("Link made. Send the password apart from it.");
        router.refresh();
        return;
      }
      setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const data = await send({ action: "remove", id });
      if (data.ok) {
        if (made?.id === id) setMade(null);
        toast("Taken back. The link no longer opens.");
        router.refresh();
        return;
      }
      setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="numbers-links-title" data-numbers-links>
      <h2 id="numbers-links-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Share your numbers with a link
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        For a partner, a co-producer or a sponsor: a read-only page with your visitors, page views, checkouts and sales for the last 7, 30 and
        90 days, where visitors came from, what sold and where buyers are. Counted here and read once a day, so it says the day; never a
        buyer&apos;s name or address. Each link has its own password and an end date, and you can take it back at any time.
      </p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <label className="block" htmlFor="numbers-link-label">
          <span className="field-label">Who it is for</span>
          <input id="numbers-link-label" className="field mt-2" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Acme sponsorship" />
        </label>
        <label className="block" htmlFor="numbers-link-password">
          <span className="field-label">Password, 8 characters or more</span>
          <input id="numbers-link-password" type="password" autoComplete="new-password" className="field mt-2" maxLength={100} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block" htmlFor="numbers-link-days">
          <span className="field-label">Works for</span>
          <select id="numbers-link-days" className="field mt-2" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-3 self-end text-sm font-semibold text-ink" htmlFor="numbers-link-money">
          <input id="numbers-link-money" type="checkbox" className="h-5 w-5" checked={money} onChange={(e) => setMoney(e.target.checked)} />
          <span>Show revenue too, not only how many sales</span>
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
            {busy ? "Saving…" : "Make the link"}
          </button>
        </div>
      </form>
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
      {made ? (
        <p className="notice mt-4 text-sm [overflow-wrap:anywhere]" role="status" data-numbers-link-made>
          {`New link for ${made.label}: `}
          <a href={made.url} target="_blank" rel="noopener" className="font-semibold text-violet-deep underline underline-offset-4">{made.url}</a>
          {". Send the password apart from it, by another message."}
        </p>
      ) : null}
      {live.length ? (
        <ul className="mt-5 divide-y divide-line text-sm">
          {live.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{l.label}</p>
                <p className="text-ink-soft [overflow-wrap:anywhere]">{`${l.url} · until ${day(l.expires)}${l.money ? " · with revenue" : ""}`}</p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void remove(l.id)}>
                Take it back
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
