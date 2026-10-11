"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import type { ServerSetup } from "@/lib/ad-events";

type Platform = "meta" | "tiktok";

const PLATFORMS: { id: Platform; name: string; where: string }[] = [
  {
    id: "meta",
    name: "Meta",
    where: "Meta Events Manager: your pixel, Settings, Conversions API, “Generate access token”.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    where: "TikTok Events Manager: your pixel, Settings, Events API, “Generate access token”.",
  },
];

/**
 * Sending purchases from our server as well as from the buyer's browser
 * (lib/ad-events.ts): one access token per platform, pasted once, sealed, and
 * never shown again.
 */
export function ServerEventsEditor({ setup, pixels }: { setup: ServerSetup; pixels: Record<Platform, boolean> }) {
  const [state, setState] = useState(setup);
  const [tokens, setTokens] = useState<Record<Platform, string>>({ meta: "", tiktok: "" });
  const [testCode, setTestCode] = useState(setup.testCode);
  const [busy, setBusy] = useState(false);

  async function send(body: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/store/ads-server", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const answer = (await response.json().catch(() => ({}))) as { ok?: boolean; setup?: ServerSetup; error?: string };
      if (answer.ok && answer.setup) {
        setState(answer.setup);
        toast(done);
        return true;
      }
      toast(
        answer.error === "token"
          ? "That does not look like an access token. Copy the whole token from Events Manager."
          : answer.error === "code"
            ? "A test code looks like TEST12345."
            : "That did not save. Try again.",
      );
    } catch {
      toast("That did not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  if (!pixels.meta && !pixels.tiktok) return null;
  return (
    <section aria-labelledby="server-events-title" className="card mt-8 p-6 sm:p-8">
      <h2 id="server-events-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Send purchases from our server too
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        A pixel in the browser misses part of your sales: blockers, Safari and in-app browsers stop it. When a buyer&apos;s
        pixel fires a purchase, we also send that purchase to Meta and TikTok from our server, with the same order id, so it
        is counted once and your ads learn from every sale they can. Only for buyers whose pixels were allowed to run: never
        where they said no, and never without a yes where the law asks first.
      </p>
      <div className="mt-5 space-y-6">
        {PLATFORMS.filter((p) => pixels[p.id]).map((p) => (
          <form
            key={p.id}
            className="space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (await send({ platform: p.id, token: tokens[p.id] }, `${p.name} token saved.`)) setTokens((t) => ({ ...t, [p.id]: "" }));
            }}
          >
            <p className="text-sm font-semibold text-ink">
              {p.name}
              <span className={`ml-2 text-xs font-semibold ${state.on[p.id] ? "text-mint-deep" : "text-ink-soft"}`}>
                {state.on[p.id] ? "On: a token is saved" : "Off"}
              </span>
            </p>
            <label className="block text-sm">
              <span className="field-label">{`${p.name} access token`}</span>
              <input
                type="password"
                autoComplete="off"
                className="field mt-1 py-2"
                value={tokens[p.id]}
                onChange={(e) => setTokens((t) => ({ ...t, [p.id]: e.target.value }))}
                placeholder={state.on[p.id] ? "Saved. Paste a new one to replace it." : "Paste it here"}
              />
            </label>
            <p className="text-xs text-ink-soft">{`Where: ${p.where} It is sealed before it is kept and never shown again.`}</p>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn btn-secondary btn-sm" disabled={busy || !tokens[p.id].trim()}>
                Save token
              </button>
              {state.on[p.id] ? (
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void send({ platform: p.id, token: "" }, `${p.name} turned off.`)}>
                  Turn off
                </button>
              ) : null}
            </div>
          </form>
        ))}
        {pixels.meta ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send({ testCode }, testCode ? "Test code saved." : "Test code cleared.");
            }}
          >
            <label className="text-sm">
              <span className="field-label">Meta test event code (optional)</span>
              <input className="field mt-1 w-auto py-2" value={testCode} maxLength={14} onChange={(e) => setTestCode(e.target.value)} placeholder="TEST12345" />
            </label>
            <button type="submit" className="btn btn-ghost btn-sm" disabled={busy}>
              Save
            </button>
            <p className="w-full text-xs text-ink-soft">
              While it is set, purchases appear under Test events in Meta Events Manager so you can see them arrive. Clear it
              when you have.
            </p>
          </form>
        ) : null}
        {state.last ? (
          <p className="text-xs text-ink-soft">
            {`Last purchase sent ${new Date(state.last.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}: `}
            {[state.last.meta ? `Meta: ${state.last.meta}` : "", state.last.tiktok ? `TikTok: ${state.last.tiktok}` : ""].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
