"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import type { AdSpend } from "@/lib/ad-spend-rules";
import { formatMoney } from "@/lib/money";

function shortDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** The smallest units of an amount typed in the store's currency: "12.50" is 1250 cents, "¥500" in yen is 500. */
function toCents(raw: string, currency: string): number {
  const digits = raw.replace(/[^0-9.,]/g, "").replace(/,(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const decimals = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  return Math.round(value * 10 ** decimals);
}

const REASONS: Record<string, string> = {
  channel: "Choose where the ad ran.",
  amount: "Type what you spent, more than zero.",
  days: "Check the days: the first before the last, not in the future, and no more than 400 days apart.",
};

/**
 * What the creator spent on ads (lib/ad-spend-rules.ts), typed in by them:
 * where it ran, the post or campaign if they want it on that row too, the
 * amount and the days. Each channel's row then says what was left.
 */
export function AdSpendEditor({
  spends,
  onChange,
  channels,
  currency,
  today,
}: {
  spends: AdSpend[];
  onChange: (spends: AdSpend[]) => void;
  /** The channels the numbers know, offered first. */
  channels: { value: string; label: string }[];
  currency: string;
  today: string;
}) {
  const [channel, setChannel] = useState(channels[0]?.value ?? "instagram");
  const [other, setOther] = useState("");
  const [campaign, setCampaign] = useState("");
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);
  const money = (cents: number) => formatMoney(cents, currency);

  async function send(body: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/store/spend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const answer = (await response.json().catch(() => ({}))) as { ok?: boolean; spends?: AdSpend[]; error?: string };
      if (answer.ok && answer.spends) {
        onChange(answer.spends);
        toast(done);
        return true;
      }
      toast(REASONS[answer.error ?? ""] ?? "That did not save. Try again.");
    } catch {
      toast("That did not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  return (
    <details className="mt-3 rounded-[12px] bg-paper px-4 py-3 text-sm ring-1 ring-line">
      <summary className="cursor-pointer font-semibold text-ink">{spends.length ? `What you spent on ads (${spends.length})` : "Add what you spent on ads"}</summary>
      <p className="mt-2 text-xs text-ink-soft">
        Type what an ad, a sponsored post or a promotion cost, and the days it ran. Each channel&apos;s row then shows what was
        left after it and what came back for every {money(100)}. An amount over several days is spread evenly over them.
        Only you and your team see these.
      </p>
      {spends.length ? (
        <ul className="mt-2 divide-y divide-line">
          {[...spends].reverse().map((spend) => (
            <li key={spend.id} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="min-w-0">
                <span className="font-semibold text-ink">{spend.channel}</span>
                {spend.campaign ? <span className="ml-1.5 text-ink-soft">{spend.campaign}</span> : null}
                <span className="ml-2 tabular-nums text-ink-soft">{`${money(spend.cents)} · ${shortDay(spend.from)}${spend.to !== spend.from ? ` to ${shortDay(spend.to)}` : ""}`}</span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm shrink-0"
                disabled={busy}
                onClick={() => void send({ action: "remove", id: spend.id }, "Removed.")}
                aria-label={`Remove ${money(spend.cents)} on ${spend.channel}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 grid gap-2 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const where = channel === "~other" ? other : channel;
          const ok = await send({ action: "add", channel: where, campaign, cents: toCents(amount, currency), from, to }, "Added.");
          if (ok) {
            setAmount("");
            setCampaign("");
          }
        }}
      >
        <label>
          <span className="field-label">Where it ran</span>
          <select className="field mt-1 py-2" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {channels.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value="~other">Somewhere else…</option>
          </select>
        </label>
        {channel === "~other" ? (
          <label>
            <span className="field-label">Its name, as in your links&apos; utm_source</span>
            <input required className="field mt-1 py-2" maxLength={30} value={other} onChange={(e) => setOther(e.target.value)} placeholder="podcast-sponsor" />
          </label>
        ) : (
          <label>
            <span className="field-label">Post or campaign (optional)</span>
            <input className="field mt-1 py-2" maxLength={40} value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="october-reel" />
          </label>
        )}
        <label>
          <span className="field-label">{`Amount (${currency.toUpperCase()})`}</span>
          <input required inputMode="decimal" className="field mt-1 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120.00" />
        </label>
        <div className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="field-label">First day</span>
            <input type="date" required className="field mt-1 py-2" value={from} max={today} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="min-w-0 flex-1">
            <span className="field-label">Last day</span>
            <input type="date" required className="field mt-1 py-2" value={to} max={today} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-secondary btn-sm" disabled={busy}>
            Add spend
          </button>
        </div>
      </form>
    </details>
  );
}
