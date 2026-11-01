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
 * than said to be fine. The page that shows these is app/studio/checkup
 * (unit 2), read by lib/checkup.ts; the readers for the plan's limits and
 * for open disputes are still to come, and until then those two are always
 * "not checked".
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
  if (!account.detailsSubmitted && !account.chargesEnabled) {
    return {
      id: "stripe",
      title,
      state: "problem",
      found: "Stripe has turned off card payments on your account, and the date to send details about you or your business has passed.",
      ifLeft: "Buyers cannot pay by card in your store until Stripe has what it asks for.",
      fix: { kind: "outside", where: "In your Stripe dashboard, look for the notice asking for information, and send what it asks for." },
    };
  }
  if (!account.detailsSubmitted) {
    return {
      id: "stripe",
      title,
      state: "problem",
      found: "Stripe is waiting for details about you or your business, and the date to send them has passed.",
      ifLeft: "Stripe can stop your payments or your payouts until it has them.",
      fix: { kind: "outside", where: "In your Stripe dashboard, look for the notice asking for information, and send what it asks for." },
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

const DOMAIN_FIX: CheckFix = { kind: "studio", href: "/studio#domain", label: "Open your domain settings" };

/**
 * The store's own domain, as Vercel sees it (lib/domains.ts, domainCheckup).
 * Left out (null) when the store has none; not checked when Vercel could not
 * be asked; "gone" when Vercel says it is no longer set to serve the store;
 * "resting" when the store is not on Pro, so its pages send visitors to the
 * marktmorgen.com address whatever the records say (Vercel is not asked).
 */
export function domainCheck(domain: string | null, status: { live: boolean; records: unknown[] } | "gone" | "resting" | null | undefined): Check | null {
  if (!domain) return null;
  const title = "Your domain";
  if (status === "resting") {
    return {
      id: "domain",
      title,
      state: "problem",
      found: `${domain} is resting, because your store is not on Pro right now.`,
      ifLeft: `People who type ${domain} are sent to your marktmorgen.com address instead.`,
      fix: DOMAIN_FIX,
    };
  }
  if (!status) return { id: "domain", title, state: "not-checked", found: `We could not check ${domain} just now. Try again in a few minutes.` };
  if (status === "gone") {
    return {
      id: "domain",
      title,
      state: "problem",
      found: `${domain} is no longer set up to serve your store on our side. To use it again, remove it in your domain settings and add it again.`,
      ifLeft: `People who type ${domain} do not reach your store. Your marktmorgen.com address still works.`,
      fix: DOMAIN_FIX,
    };
  }
  // live is Vercel's own verdict on the records (lib/domains.ts); the certificate is not part of it, so it is not claimed.
  if (status.live) return { id: "domain", title, state: "ok", found: `${domain} is set up to show your store.` };
  return {
    id: "domain",
    title,
    state: "problem",
    found: `${domain} does not show your store yet: its DNS records are missing or wrong.`,
    ifLeft: `People who type ${domain} do not reach your store. Your marktmorgen.com address still works.`,
    fix: { kind: "studio", href: "/studio#domain", label: "See the records to add" },
  };
}

/**
 * Email to the creator's list: paused for bounces or spam reports, or not,
 * as pauseForSending (lib/mail-health.ts) reads it; undefined when it could
 * not be read. Its `until` is in seconds, as that file keeps it.
 */
export function emailCheck(pause: { reason: "bounces" | "complaints"; until: number } | null | undefined, now = Date.now()): Check {
  const title = "Email to your list";
  if (pause === undefined) return { id: "email", title, state: "not-checked", found: "We could not read whether your list's email is paused just now. Try again in a few minutes." };
  if (pause === null || pause.until * 1000 <= now) return { id: "email", title, state: "ok", found: "Email to your list is not paused." };
  const day = new Date(pause.until * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
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

/**
 * Email to the list stopped by the plan itself (lib/plan.ts, canUse "email"):
 * null when the plan lets it go out, so the pause is read instead.
 */
export function emailStopped(plan: { pro: boolean; renewalUnpaid: boolean; disputed: boolean }): Check | "left-out" | null {
  // A store not on Pro sends no email to a list at all: nothing to check.
  if (!plan.pro) return "left-out";
  const title = "Email to your list";
  if (plan.renewalUnpaid) {
    return {
      id: "email",
      title,
      state: "problem",
      found: "Email to your list is stopped: your plan's last renewal is not paid.",
      ifLeft: "Nothing goes to your list, and your sequences wait, until it is paid. Sign-in links and receipts still go out.",
      fix: { kind: "studio", href: "/studio#billing", label: "Pay the renewal" },
    };
  }
  if (plan.disputed) {
    return {
      id: "email",
      title,
      state: "problem",
      found: "Email to your list is stopped while a payment for your plan is disputed.",
      ifLeft: "Nothing goes to your list, and your sequences wait, until the dispute is closed. Sign-in links and receipts still go out.",
      fix: { kind: "studio", href: "/studio#billing", label: "See your plan" },
    };
  }
  return null;
}

/**
 * Checkouts Stripe refused to open in the last 7 days; null when they could
 * not be read. The count is what lib/checkout-trouble.ts recorded (any
 * Stripe error when opening one, a refusal or Stripe being down), so "ok"
 * says only that none was recorded. readTrouble (lib/checkout-trouble.ts) answers zero today when
 * its store cannot be read, so the screen needs a strict reading of it before
 * an "ok" from here can be shown (next unit).
 */
export function checkoutCheck(trouble: { week: number; last: { message: string } | null } | null): Check {
  const title = "Checkout";
  if (!trouble) return { id: "checkout", title, state: "not-checked", found: "We could not read whether Stripe refused any checkout just now." };
  if (trouble.week <= 0) return { id: "checkout", title, state: "ok", found: "We recorded no checkout that Stripe would not open in the last 7 days." };
  const times = trouble.week === 1 ? "once" : `${trouble.week.toLocaleString("en-US")} times`;
  return {
    id: "checkout",
    title,
    state: "problem",
    // Stripe's own words close the sentence as Stripe wrote them, with no full stop added after the quote.
    found: `Stripe would not open a checkout ${times} in the last 7 days.${trouble.last ? ` The last time it said: "${trouble.last.message}"` : ""}`,
    ifLeft: "A buyer who presses buy gets an error instead of the payment page, and that sale is lost.",
    fix: { kind: "outside", where: "In your Stripe dashboard, look for a notice asking for information and send what it asks for. If there is none, it may have been Stripe failing for a moment, which passes by itself; if it keeps happening, Stripe's words above say what it would not do." },
  };
}

/** A part with no reader yet: always "not checked", never fine. */
export function notCheckedYet(id: "limits" | "disputes"): Check {
  return id === "limits"
    ? { id, title: "Your plan's limits", state: "not-checked", found: "Not checked here yet. Each limit is shown where you use it." }
    : { id, title: "Disputes", state: "not-checked", found: "Not checked here yet. Your Stripe dashboard shows any dispute a buyer opened." };
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
  if (checks.length === 0) return "Nothing was checked.";
  if (!problems && !unchecked) return "We checked everything listed here and found no problem.";
  if (!problems) return `No problem found in what we checked; ${unchecked} not checked.`;
  return `${parts.join(", ")}.`;
}
