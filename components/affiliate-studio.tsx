"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { StoreCurrency, useStoreCurrency } from "@/components/store-currency";
import { type Currency, fieldPrefix, formatMoney, moneyField } from "@/lib/money";
import {
  type AffiliateSetting,
  MAX_COMMISSION,
  MAX_COOKIE_DAYS,
  MIN_COMMISSION,
  MIN_COOKIE_DAYS,
} from "@/lib/affiliate-setting";
import type { Affiliate, AffiliateStatus, LineStatus, Payout } from "@/lib/affiliates";
import { StoreField } from "@/components/studio-store-pin";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  percent: `Type a whole share from ${MIN_COMMISSION} to ${MAX_COMMISSION} percent.`,
  days: `Type a whole number of days from ${MIN_COOKIE_DAYS} to ${MAX_COOKIE_DAYS}.`,
  rate: `A product's own share is a whole number from 0 to ${MAX_COMMISSION}; 0 leaves it out.`,
  amount: "Type the amount you paid, like 25 or 25.50.",
  date: "Pick the day you paid it.",
  nothing: "Nobody is owed anything right now, so there was nothing to write down.",
  refunds:
    "Stripe could not be asked about refunds just now, so what is owed is not settled. Try again in a moment rather than record a payout against a guess.",
  unknown: "That affiliate or payout is no longer on record. Reload the page.",
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  unavailable: "Stores are not switched on yet, so nothing was saved.",
  store_full: "Your store is full. Remove something before adding more.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

type Row = {
  affiliate: Affiliate;
  clicks: number;
  sales: number;
  earned: number;
  paid: number;
  owed: number;
  link: string;
};

type LineView = {
  ref: string;
  at: number;
  title: string;
  aff: string;
  base: number;
  refunded: number;
  rate: number;
  commission: number;
  status: LineStatus;
  /** What the sale was paid in. */
  currency: string;
};

/** An amount in the currency it was paid in (lib/money.ts). */
const money = (cents: number, currency: string) => `${cents < 0 ? "-" : ""}${formatMoney(Math.abs(cents), currency)}`;
const day = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dayMs = (ms: number) => day(Math.floor(ms / 1000));

const STATUS_TAG: Record<AffiliateStatus, { label: string; tone: string }> = {
  approved: { label: "Approved", tone: "tag-live" },
  pending: { label: "Waiting for you", tone: "tag-next" },
  declined: { label: "Declined", tone: "" },
  removed: { label: "Removed", tone: "" },
};

async function post(payload: Record<string, unknown>): Promise<string | null> {
  try {
    const response = await fetch("/api/store/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (data.ok) return null;
    return MESSAGES[data.error ?? ""] ?? MESSAGES.server_error;
  } catch {
    return MESSAGES.server_error;
  }
}

/**
 * Writing down a whole batch the creator has just paid in their own provider.
 * Separate from `post` because it answers with how many payouts it wrote, and
 * because it is the one call that touches several affiliates at once.
 */
async function postBatch(payload: Record<string, unknown>): Promise<{ written: number } | { error: string }> {
  try {
    const response = await fetch("/api/store/affiliates/payout-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; written?: number };
    if (data.ok) return { written: Number(data.written) || 0 };
    return { error: MESSAGES[data.error ?? ""] ?? MESSAGES.server_error };
  } catch {
    return { error: MESSAGES.server_error };
  }
}

/** The studio's affiliate programme: terms, applications, the book and payouts. */
export function AffiliateStudio({
  handle,
  setting,
  products,
  rows,
  lines,
  payouts,
  refundsChecked,
  today,
  currency = "usd",
  elsewhere = 0,
}: {
  handle: string;
  setting: AffiliateSetting;
  products: { id: string; title: string; credited: boolean }[];
  rows: Row[];
  lines: LineView[];
  payouts: Payout[];
  refundsChecked: boolean;
  today: string;
  /** The store's currency: what the totals and new payouts are in. */
  currency?: Currency;
  /** Sales and payouts in another currency, left out of the totals. */
  elsewhere?: number;
}) {
  const router = useRouter();
  const pending = rows.filter((r) => r.affiliate.status === "pending");
  const members = rows.filter((r) => r.affiliate.status !== "pending");
  const who = new Map(rows.map((r) => [r.affiliate.id, r.affiliate]));
  const owedTotal = rows.reduce((sum, r) => sum + Math.max(0, r.owed), 0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ where: string; text: string } | null>(null);
  // Everyone owed something today: what one batch file holds.
  const owedNow = rows.filter((r) => r.owed > 0 && r.affiliate.status === "approved");
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchDate, setBatchDate] = useState(today);
  const [batchReference, setBatchReference] = useState("");

  async function act(where: string, payload: Record<string, unknown>, confirmation: string): Promise<boolean> {
    setBusy(where);
    setError(null);
    const problem = await post(payload);
    setBusy(null);
    if (problem) {
      setError({ where, text: problem });
      return false;
    }
    toast(confirmation);
    router.refresh();
    return true;
  }

  const errorAt = (where: string) =>
    error?.where === where ? (
      <p className="notice notice-error mt-3" role="alert">
        {error.text}
      </p>
    ) : null;

  return (
    <StoreCurrency value={currency}>
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div className="min-w-0 space-y-6">
        <Terms
          handle={handle}
          setting={setting}
          products={products}
          busy={busy === "terms"}
          onSave={(payload, confirmation) => act("terms", payload, confirmation)}
          error={errorAt("terms")}
        />
        <section aria-labelledby="money-title" className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-soft text-mint-deep">
              <Icon name="bank" size={20} />
            </span>
            <h2 id="money-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
              You pay your affiliates yourself
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Nimbus Labs never holds, moves or pays out this money. Every sale is paid in full to your own Stripe account, as
            always; this page keeps the record of who is owed what. Pay them however you agree — PayPal, a bank transfer,
            Wise — then write it down here with Mark as paid, and it shows on their page too.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <form action="/api/store/affiliates/export" method="get">
              <StoreField />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Icon name="download" size={16} />
                Download everything (CSV)
              </button>
            </form>
            <span className="text-sm text-ink-soft">{`Owed now, in all: ${money(owedTotal, currency)}`}</span>
          </div>
          {owedNow.length ? (
            <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
              <h3 className="font-semibold text-ink">Pay everyone at once</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {`${owedNow.length} ${owedNow.length === 1 ? "affiliate is" : "affiliates are"} owed ${money(owedTotal, currency)}. Download the batch, upload it to your own PayPal or Wise, and the money goes straight from your account to theirs. It never passes through Nimbus, so there is no payout to wait for.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <form action="/api/store/affiliates/payout-batch" method="get">
                  <StoreField />
                  <input type="hidden" name="provider" value="paypal" />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Icon name="download" size={16} />
                    PayPal Payouts file
                  </button>
                </form>
                <form action="/api/store/affiliates/payout-batch" method="get">
                  <StoreField />
                  <input type="hidden" name="provider" value="worksheet" />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Icon name="download" size={16} />
                    Worksheet for Wise or a bank
                  </button>
                </form>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                The PayPal file uploads as it is. Wise only reads a file built from the template it gives you, so paste the
                worksheet into that template — and fill in the name column yourself: Wise wants the name on your affiliate&rsquo;s
                bank account, and we never asked them for it.
              </p>
              {batchOpen ? (
                <form
                  className="mt-4 rounded-xl border-2 border-violet-brand/30 bg-white p-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy("batch");
                    setError(null);
                    const done = await postBatch({ date: batchDate, reference: batchReference });
                    setBusy(null);
                    if ("error" in done) {
                      setError({ where: "batch", text: done.error });
                      return;
                    }
                    setBatchOpen(false);
                    setBatchReference("");
                    toast(`${done.written} ${done.written === 1 ? "payout" : "payouts"} written down.`);
                    router.refresh();
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <label className="block" htmlFor="batch-d">
                      <span className="field-label">Paid on</span>
                      <input
                        id="batch-d"
                        type="date"
                        value={batchDate}
                        max={today}
                        onChange={(e) => setBatchDate(e.target.value)}
                        className="field"
                        required
                      />
                    </label>
                    <label className="block" htmlFor="batch-r">
                      <span className="field-label">Reference (optional)</span>
                      <input
                        id="batch-r"
                        type="text"
                        maxLength={80}
                        value={batchReference}
                        placeholder="PayPal batch 5TY0..."
                        onChange={(e) => setBatchReference(e.target.value)}
                        className="field"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">
                    This writes one payout for each of the {owedNow.length} owed right now, against what the book says at this
                    moment. It records a payment you already made; no money moves from here.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={busy !== null} aria-busy={busy === "batch"}>
                      Write the batch down
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBatchOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="mt-3 min-h-[36px] text-sm font-bold text-violet-deep underline underline-offset-4"
                  onClick={() => {
                    setBatchDate(today);
                    setBatchReference("");
                    setBatchOpen(true);
                  }}
                >
                  I have paid this batch
                </button>
              )}
              {errorAt("batch")}
            </div>
          ) : null}
          {elsewhere > 0 ? (
            <p className="mt-3 text-xs text-ink-soft">
              {`${elsewhere} ${elsewhere === 1 ? "sale or payout is" : "sales and payouts are"} in another currency, from before your store charged in ${currency.toUpperCase()}. ${elsewhere === 1 ? "It is" : "They are"} listed with ${elsewhere === 1 ? "its" : "their"} own currency and left out of these totals, because amounts in two currencies do not add up.`}
            </p>
          ) : null}
        </section>
      </div>

      <div className="min-w-0 space-y-6">
        {pending.length ? (
          <section aria-labelledby="apps-title" className="card p-6 sm:p-8">
            <h2 id="apps-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
              {`Applications (${pending.length})`}
            </h2>
            <ul className="mt-4 space-y-3">
              {pending.map((row) => (
                <li key={row.affiliate.id} className="rounded-2xl border border-line bg-paper p-4">
                  <p className="font-semibold text-ink [overflow-wrap:anywhere]">{row.affiliate.email}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{`Applied ${dayMs(row.affiliate.appliedAt)}`}</p>
                  {row.affiliate.note ? <p className="mt-2 text-sm text-ink-soft">{`“${row.affiliate.note}”`}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={busy !== null}
                      aria-busy={busy === `a-${row.affiliate.id}`}
                      onClick={() => act(`a-${row.affiliate.id}`, { action: "approve", id: row.affiliate.id }, "Affiliate approved.")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy !== null}
                      onClick={() => act(`a-${row.affiliate.id}`, { action: "decline", id: row.affiliate.id }, "Application declined.")}
                    >
                      Decline
                    </button>
                  </div>
                  {errorAt(`a-${row.affiliate.id}`)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">Approving emails them their link. Declining sends nothing.</p>
          </section>
        ) : null}

        <section aria-labelledby="people-title" className="card p-6 sm:p-8">
          <h2 id="people-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Your affiliates</h2>
          {members.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              {setting.enabled
                ? "Nobody yet. Share your affiliate page with the people who already recommend you."
                : "Switch the program on and share your affiliate page; applications appear here."}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {members.map((row) => (
                <Member
                  key={row.affiliate.id}
                  row={row}
                  today={today}
                  busy={busy}
                  act={act}
                  error={errorAt(`m-${row.affiliate.id}`)}
                />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="sales-title" className="card p-6 sm:p-8">
          <h2 id="sales-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Sales through affiliates</h2>
          {!refundsChecked ? (
            <p className="notice notice-warn mt-3 text-sm">
              Stripe could not be asked about every refund just now, so a recently refunded sale may still show as earning.
              It is corrected the next time this page opens.
            </p>
          ) : null}
          {lines.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">None yet. Each one appears here once Stripe says it is paid.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.ref} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{line.title}</span>
                    <span className="block text-xs text-ink-soft [overflow-wrap:anywhere]">
                      {`${day(line.at)} · ${who.get(line.aff)?.email ?? "A removed affiliate"} · ${money(line.base, line.currency)} before tax · ${line.rate}%`}
                      {line.refunded ? ` · ${money(line.refunded, line.currency)} refunded` : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold tabular-nums text-ink">{money(line.commission, line.currency)}</span>
                    {line.status !== "earned" ? (
                      <span className="block text-xs font-semibold text-ink-soft">{line.status === "own purchase" ? "Their own purchase" : line.status === "refunded" ? "Refunded" : "Partly refunded"}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {payouts.length ? (
          <section aria-labelledby="payouts-title" className="card p-6 sm:p-8">
            <h2 id="payouts-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Payouts you recorded</h2>
            <ul className="mt-4 divide-y divide-line">
              {payouts.map((payout) => (
                <li key={payout.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <span className="min-w-0 text-sm">
                    <span className="block font-semibold text-ink [overflow-wrap:anywhere]">{who.get(payout.aff)?.email ?? "A removed affiliate"}</span>
                    <span className="block text-xs text-ink-soft">{`${payout.date}${payout.reference ? ` · ${payout.reference}` : ""}`}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums text-ink">{money(payout.cents, payout.currency)}</span>
                    <button
                      type="button"
                      className="min-h-[36px] text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-danger"
                      disabled={busy !== null}
                      onClick={() => act(`p-${payout.id}`, { action: "unpay", payout: payout.id }, "Payout taken off the record.")}
                    >
                      Undo
                    </button>
                  </span>
                  {errorAt(`p-${payout.id}`)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
    </StoreCurrency>
  );
}

function Terms({
  handle,
  setting,
  products,
  busy,
  onSave,
  error,
}: {
  handle: string;
  setting: AffiliateSetting;
  products: { id: string; title: string; credited: boolean }[];
  busy: boolean;
  onSave: (payload: Record<string, unknown>, confirmation: string) => Promise<boolean>;
  error: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(setting.enabled);
  const [percent, setPercent] = useState(String(setting.percent));
  const [days, setDays] = useState(String(setting.days));
  const [rates, setRates] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(setting.rates).map(([id, n]) => [id, String(n)])),
  );
  const [showRates, setShowRates] = useState(Object.keys(setting.rates).length > 0);
  const credited = products.filter((p) => p.credited);
  const left = products.filter((p) => !p.credited);

  return (
    <section aria-labelledby="terms-title" className="card p-6 sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const chosen = Object.fromEntries(
            Object.entries(rates)
              .filter(([, v]) => v.trim() !== "")
              .map(([id, v]) => [id, Number(v.trim())]),
          );
          onSave(
            { action: "settings", enabled, percent: Number(percent.trim()), days: Number(days.trim()), rates: chosen },
            enabled ? "Affiliate program saved." : "Affiliate program switched off.",
          );
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="terms-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Your program</h2>
          <span className={`tag ${setting.enabled ? "tag-live" : ""}`}>{setting.enabled ? "On" : "Off"}</span>
        </div>

        <label className="mt-5 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--violet)]"
          />
          <span className="text-sm">
            <span className="block font-semibold text-ink">Take affiliates</span>
            <span className="block text-ink-soft">Your affiliate page opens, and links start earning.</span>
          </span>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block" htmlFor="aff-percent">
            <span className="field-label">Share of each sale</span>
            <span className="relative block">
              <input
                id="aff-percent"
                type="number"
                inputMode="numeric"
                min={MIN_COMMISSION}
                max={MAX_COMMISSION}
                step={1}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="field pr-9"
                required
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-ink-soft">%</span>
            </span>
          </label>
          <label className="block" htmlFor="aff-days">
            <span className="field-label">A click counts for</span>
            <span className="relative block">
              <input
                id="aff-days"
                type="number"
                inputMode="numeric"
                min={MIN_COOKIE_DAYS}
                max={MAX_COOKIE_DAYS}
                step={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="field pr-14"
                required
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-ink-soft">days</span>
            </span>
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          {`From ${MIN_COMMISSION} to ${MAX_COMMISSION}%, of what the buyer paid before tax, and a window of ${MIN_COOKIE_DAYS} to ${MAX_COOKIE_DAYS} days after their last click. A change applies to sales from then on; a sale keeps the share it was made at. Visitors from the European Economic Area, the UK, Switzerland and Brazil are asked first, because the rules there require it, and their click is remembered once they allow it.`}
        </p>

        {credited.length ? (
          <div className="mt-4">
            <button
              type="button"
              className="flex min-h-[40px] items-center gap-1 text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-violet-deep"
              aria-expanded={showRates}
              onClick={() => setShowRates((v) => !v)}
            >
              <Icon name="chevron-right" size={16} className={`transition-transform ${showRates ? "rotate-90" : ""}`} />
              A different share for some products
            </button>
            {showRates ? (
              <ul className="mt-2 space-y-2">
                {credited.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <label htmlFor={`rate-${p.id}`} className="min-w-0 truncate text-sm text-ink">
                      {p.title}
                    </label>
                    <span className="relative w-28 shrink-0">
                      <input
                        id={`rate-${p.id}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MAX_COMMISSION}
                        step={1}
                        value={rates[p.id] ?? ""}
                        placeholder={percent || "20"}
                        onChange={(e) => setRates((all) => ({ ...all, [p.id]: e.target.value }))}
                        className="field pr-9"
                      />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-ink-soft">%</span>
                    </span>
                  </li>
                ))}
                <li className="text-xs text-ink-soft">Empty uses the share above; 0 leaves the product out.</li>
              </ul>
            ) : null}
          </div>
        ) : null}
        {left.length ? (
          <p className="mt-3 text-xs text-ink-soft">
            {`Memberships and payment plans are not credited to affiliates: ${left.map((p) => p.title).join(", ")}.`}
          </p>
        ) : null}

        {error}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary" aria-busy={busy} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <a href={`/@${handle}/affiliates`} className="inline-flex min-h-[40px] items-center gap-1 text-sm font-bold text-violet-deep underline-offset-4 hover:underline">
            Your affiliate page
            <Icon name="arrow-up-right" size={15} />
          </a>
        </div>
      </form>
    </section>
  );
}

function Member({
  row,
  today,
  busy,
  act,
  error,
}: {
  row: Row;
  today: string;
  busy: string | null;
  act: (where: string, payload: Record<string, unknown>, confirmation: string) => Promise<boolean>;
  error: React.ReactNode;
}) {
  const { affiliate } = row;
  const currency = useStoreCurrency();
  const where = `m-${affiliate.id}`;
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState(row.owed > 0 ? moneyField(row.owed, currency) : "");
  const [date, setDate] = useState(today);
  const [reference, setReference] = useState("");
  const tag = STATUS_TAG[affiliate.status];

  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink [overflow-wrap:anywhere]">{affiliate.email}</p>
          <p className="mt-0.5 font-mono text-xs text-ink-soft">{`?via=${affiliate.code}`}</p>
        </div>
        <span className={`tag ${tag.tone}`}>{tag.label}</span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center sm:grid-cols-5">
        {[
          { label: "Clicks", value: row.clicks.toLocaleString("en-US") },
          { label: "Sales", value: row.sales.toLocaleString("en-US") },
          { label: "Earned", value: money(row.earned, currency) },
          { label: "Paid", value: money(row.paid, currency) },
          { label: row.owed < 0 ? "Paid ahead" : "Owed", value: money(Math.abs(row.owed), currency), strong: row.owed > 0 },
        ].map((tile) => (
          <div key={tile.label} className={`rounded-xl px-2 py-2 ${tile.strong ? "bg-lilac" : "bg-paper"}`}>
            <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-mute">{tile.label}</dt>
            <dd className={`mt-0.5 font-semibold tabular-nums ${tile.strong ? "text-violet-ink" : "text-ink"}`}>{tile.value}</dd>
          </div>
        ))}
      </dl>

      {paying ? (
        <form
          className="mt-3 rounded-xl border-2 border-violet-brand/30 bg-white p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const done = await act(where, { action: "payout", id: affiliate.id, amount: amount.trim(), date, reference }, "Payout recorded.");
            if (done) setPaying(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[8rem_10rem_minmax(0,1fr)]">
            <label className="block" htmlFor={`${where}-a`}>
              <span className="field-label">{`Amount, ${currency === "usd" ? "$" : fieldPrefix(currency)}`}</span>
              <input id={`${where}-a`} type="text" inputMode={currency === "jpy" ? "numeric" : "decimal"} value={amount} onChange={(e) => setAmount(e.target.value)} className="field" required />
            </label>
            <label className="block" htmlFor={`${where}-d`}>
              <span className="field-label">Paid on</span>
              <input id={`${where}-d`} type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="field" required />
            </label>
            <label className="block" htmlFor={`${where}-r`}>
              <span className="field-label">Reference (optional)</span>
              <input
                id={`${where}-r`}
                type="text"
                maxLength={80}
                value={reference}
                placeholder="PayPal 5TY0..."
                onChange={(e) => setReference(e.target.value)}
                className="field"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-ink-soft">This only writes down a payment you made yourself. No money moves from here.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy !== null} aria-busy={busy === where}>
              Record the payout
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPaying(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button type="button" className="min-h-[36px] text-sm font-bold text-violet-deep underline underline-offset-4" onClick={() => {
              // The form opens on what is owed now, not on what was owed
              // when this row first appeared.
              setAmount(row.owed > 0 ? moneyField(row.owed, currency) : "");
              setDate(today);
              setReference("");
              setPaying(true);
            }}>
            Mark as paid
          </button>
          {affiliate.status === "approved" ? (
            <button
              type="button"
              className="min-h-[36px] text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-danger"
              disabled={busy !== null}
              onClick={() => act(where, { action: "remove", id: affiliate.id }, "Affiliate removed. Their link no longer earns.")}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="min-h-[36px] text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-violet-deep"
              disabled={busy !== null}
              onClick={() => act(where, { action: "restore", id: affiliate.id }, "Affiliate approved.")}
            >
              Approve
            </button>
          )}
          <a href={row.link} target="_blank" rel="noopener noreferrer" className="min-h-[36px] text-sm text-ink-soft underline-offset-4 hover:underline [overflow-wrap:anywhere]">
            {row.link.replace(/^https:\/\//, "")}
          </a>
        </div>
      )}
      {error}
    </li>
  );
}
