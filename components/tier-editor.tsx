"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { MAX_TIERS, MIN_TIERS } from "@/lib/tier-rules";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  count: `Pick ${MIN_TIERS} to ${MAX_TIERS} memberships, or none to switch it off.`,
  tier: "One of those is no longer a membership that runs until canceled at one price, with no introductory price. Reload the page and pick again.",
};

/**
 * The memberships a member can switch between, up or down, from their own
 * membership page (lib/tier-switch.ts).
 */
export function TierEditor({ initial, memberships }: { initial: string[]; memberships: { id: string; title: string; words: string }[] }) {
  const [saved, setSaved] = useState(initial);
  const [picked, setPicked] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const on = saved.length >= MIN_TIERS;

  async function save(tiers: string[]) {
    if (busy) return;
    const expected = [...tiers];
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/store/tiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tiers: expected }) });
      const raw: unknown = await response.json().catch(() => null);
      const reply = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : null;
      if (response.ok && reply?.ok === true && !("error" in reply) && Array.isArray(reply.tiers) && JSON.stringify(reply.tiers) === JSON.stringify(expected)) {
        setSaved(expected);
        setPicked(expected);
        toast("Membership tier settings saved.");
      } else {
        const problem = reply?.ok !== true && typeof reply?.error === "string" && Object.hasOwn(MESSAGES, reply.error) ? MESSAGES[reply.error] : null;
        setError(problem ?? "We could not confirm these tier settings. Reload this page to check before trying again.");
      }
    } catch {
      setError("We could not confirm these tier settings. Reload this page to check before trying again.");
    } finally {
      setBusy(false);
    }
  }

  const toggle = (id: string) => setPicked((now) => (now.includes(id) ? now.filter((x) => x !== id) : now.length >= MAX_TIERS ? now : [...now, id]));

  return (
    <section data-tier-editor aria-busy={busy} className="card mt-8 p-6 sm:p-8" aria-labelledby="tiers-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="tiers-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Membership tiers</h2>
        <span className={`tag ${on ? "tag-live" : ""}`}>{on ? "On" : "Off"}</span>
      </div>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Pick the memberships a member can move between, up or down, on their own. From their membership page they see the exact
        amount first: moving up charges the new price less what was left of their last payment, at once, to the card they pay
        with; moving down turns what was left into a credit taken off their next payments. What the new plan includes opens as
        soon as it is paid, and what only the old one included closes. You get an email each time.
      </p>
      {memberships.length < MIN_TIERS ? (
        <p className="notice mt-4 text-sm">
          Tiers need at least two memberships that run until canceled, at one price, with no introductory price. Add another membership under Products first.
        </p>
      ) : (
        <>
          <fieldset disabled={busy} className="mt-4">
            <legend className="field-label">{`Memberships members can switch between (${MIN_TIERS} to ${MAX_TIERS})`}</legend>
            {memberships.map((m) => (
              <label key={m.id} className="mt-2 flex min-h-[44px] items-center gap-3 text-sm text-ink">
                <input type="checkbox" className="h-4 w-4" checked={picked.includes(m.id)} onChange={() => toggle(m.id)} />
                <span>
                  <span className="font-semibold">{m.title}</span>
                  <span className="block text-ink-soft">{m.words}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <p className="mt-2 text-xs text-ink-soft">
            Memberships that end after a set number of payments, and ones with price options or pay what you want, cannot be tiers.
            A member in a free trial switches without paying; the new price starts when the trial ends.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary btn-sm" aria-busy={busy} disabled={busy || picked.length === 1} onClick={() => void save(picked)}>
              {on ? "Save the tiers" : "Let members switch"}
            </button>
            {on ? (
              <button type="button" className="btn btn-ghost btn-sm" aria-busy={busy} disabled={busy} onClick={() => void save([])}>
                Switch it off
              </button>
            ) : null}
          </div>
        </>
      )}
      {error ? <p className="notice notice-error mt-3 text-sm" role="alert">{error}</p> : null}
    </section>
  );
}
