/**
 * "Something's not working": what the studio's checkup says about each part
 * of a store (491 [PP2], unit 1; added 1 November 2026).
 *
 * Each check is worked out here from what a reader already in the code found
 * (lib/stripe-connect.ts readAccount, lib/domains.ts domainStatus,
 * lib/mail-health.ts pauseForSending, lib/checkout-trouble.ts readTrouble),
 * with no model and nothing guessed:
 *
 *   ok           the reader answered and found nothing wrong;
 *   problem      it found something: the cause in plain words, what happens
 *                if it is left, and the fix (a page in the studio, or the
 *                exact place outside it when only the creator can fix it);
 *   not-checked  the reader could not answer, or there is no reader yet.
 *                Never shown as fine.
 *
 * A part the store does not use (no domain of its own) is left out rather
 * than said to be fine. The page that shows these, and the readers for the
 * plan's limits and for open disputes, are the next unit; until then those
 * two are always "not checked".
 *
 * Browser-safe: plain data and pure functions.
 */

export type CheckState = "ok" | "problem" | "not-checked";
export type CheckId = "stripe" | "domain" | "email" | "checkout" | "limits" | "disputes";

/** Where the fix is: a page of the studio, or a place only the creator can reach. */
export type CheckFix = { kind: "studio"; href: string; label: string } | { kind: "outside"; where: string };

export type Check = {
  id: CheckId;
  /** What is checked, as a heading. */
  title: string;
  state: CheckState;
  /** One sentence: what was found, or why it could not be checked. */
  found: string;
  /** For a problem: what happens if it is left. */
  ifLeft?: string;
  /** For a problem: how to put it right. */
  fix?: CheckFix;
};

const STRIPE_FIX: CheckFix = { kind: "studio", href: "/studio#stripe", label: "Open your Stripe connection" };

/** The creator's Stripe account, as Stripe says it is right now; null when Stripe could not be asked. */
export function stripeCheck(connected: boolean, account: { chargesEnabled: boolean; detailsSubmitted: boolean } | null): Check {
  const title = "Payments";
  if (!connected) {
    return { id: "stripe", title, state: "problem", found: "Your store is not connected to a Stripe account.", ifLeft: "Nobody can buy anything from your store.", fix: STRIPE_FIX };
  }
  if (!account) return { id: "stripe", title, state: "not-checked", found: "We could not ask Stripe about your account just now. Try again in a few minutes." };
  if (!account.detailsSubmitted) {
    return {
      id: "stripe",
      title,
      state: "problem",
      found: "Stripe is waiting for details about you or your business, and the date to send them has passed.",
      ifLeft: "Stripe can stop your payments or your payouts until it has them.",
      fix: { kind: "outside", where: "In your Stripe dashboard, open the notice at the top of the home page and send what it asks for." },
    };
  }
  if (!account.chargesEnabled) {
    return {
      id: "stripe",
      title,
      state: "problem",
      found: "Stripe has not turned on card payments for your account.",
      ifLeft: "Buyers cannot pay by card in your store.",
      fix: STRIPE_FIX,
    };
  }
  return { id: "stripe", title, state: "ok", found: "Stripe says your account can take card payments." };
}

/**
 * The store's own domain, as Vercel sees it. Left out (null) when the store
 * has none; not checked when Vercel could not be asked.
 */
export function domainCheck(domain: string | null, status: { live: boolean; records: unknown[] } | null | undefined): Check | null {
  if (!domain) return null;
  const title = "Your domain";
  if (!status) return { id: "domain", title, state: "not-checked", found: `We could not check ${domain} just now. Try again in a few minutes.` };
  if (status.live) return { id: "domain", title, state: "ok", found: `${domain} shows your store, with its security certificate.` };
  return {
    id: "domain",
    title,
    state: "problem",
    found: `${domain} does not show your store yet: its DNS records are missing or wrong, or its certificate is not ready.`,
    ifLeft: `People who type ${domain} do not reach your store. Your marktmorgen.com address still works.`,
    fix: { kind: "studio", href: "/studio#domain", label: "See the records to add" },
  };
}

/** Email to the creator's list: paused for bounces or spam reports, or not. Undefined when the pause could not be read. */
export function emailCheck(pause: { reason: "bounces" | "complaints"; until: number } | null | undefined, now = Date.now()): Check {
  const title = "Email to your list";
  if (pause === undefined) return { id: "email", title, state: "not-checked", found: "We could not read whether your list's email is paused just now. Try again in a few minutes." };
  if (pause === null || pause.until <= now) return { id: "email", title, state: "ok", found: "Email to your list is not paused." };
  const day = new Date(pause.until).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  return {
    id: "email",
    title,
    state: "problem",
    found:
      pause.reason === "bounces"
        ? "Email to your list is paused: too many of your emails went to addresses that do not exist."
        : "Email to your list is paused: too many people marked your emails as spam.",
    ifLeft: `Email to your list, your sequences and the email to buyers you brought over wait until ${day} (UTC). Sign-in links and receipts still go out.`,
    fix: { kind: "studio", href: "/studio/email", label: "See what to change" },
  };
}

/** Checkouts Stripe refused to open in the last 7 days; null when they could not be read. */
export function checkoutCheck(trouble: { week: number; last: { message: string } | null } | null): Check {
  const title = "Checkout";
  if (!trouble) return { id: "checkout", title, state: "not-checked", found: "We could not read whether Stripe refused any checkout just now." };
  if (trouble.week <= 0) return { id: "checkout", title, state: "ok", found: "Stripe opened every checkout in the last 7 days." };
  const times = trouble.week === 1 ? "once" : `${trouble.week.toLocaleString("en-US")} times`;
  return {
    id: "checkout",
    title,
    state: "problem",
    // Stripe's own words close the sentence as Stripe wrote them, with no full stop added after the quote.
    found: `Stripe refused to open a checkout ${times} in the last 7 days.${trouble.last ? ` The last time it said: "${trouble.last.message}"` : ""}`,
    ifLeft: "A buyer who presses buy gets an error instead of the payment page, and that sale is lost.",
    fix: { kind: "outside", where: "In your Stripe dashboard, open the notice at the top of the home page; most refusals are the account needing something." },
  };
}

/** A part with no reader yet: always "not checked", never fine. */
export function notCheckedYet(id: "limits" | "disputes"): Check {
  return id === "limits"
    ? { id, title: "Your plan's limits", state: "not-checked", found: "Not checked here yet. Each limit is shown where you use it." }
    : { id, title: "Disputes", state: "not-checked", found: "Not checked here yet. Open disputes are on the Disputes page.", fix: { kind: "studio", href: "/studio/disputes", label: "Open disputes" } };
}

/** The checks in the order shown: problems first, then what could not be checked, then what is fine; each group in a fixed order. */
const ORDER: CheckId[] = ["stripe", "checkout", "domain", "email", "limits", "disputes"];
const RANK: Record<CheckState, number> = { problem: 0, "not-checked": 1, ok: 2 };

export function orderChecks(checks: (Check | null)[]): Check[] {
  return checks
    .filter((c): c is Check => c !== null)
    .sort((a, b) => RANK[a.state] - RANK[b.state] || ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}

/**
 * The one line at the top. Never "everything is fine" while anything was not
 * checked: it says how many were.
 */
export function checkupSummary(checks: Check[]): string {
  const problems = checks.filter((c) => c.state === "problem").length;
  const unchecked = checks.filter((c) => c.state === "not-checked").length;
  const parts: string[] = [];
  if (problems) parts.push(`${problems} ${problems === 1 ? "problem" : "problems"} found`);
  if (unchecked) parts.push(`${unchecked} not checked`);
  if (!problems && !unchecked) return "We checked everything listed here and found no problem.";
  if (!problems) return `No problem found in what we checked; ${unchecked} not checked.`;
  return `${parts.join(", ")}.`;
}
