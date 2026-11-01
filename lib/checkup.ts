/**
 * "Something's not working": the studio's checkup, read on the server
 * (491 [PP2], unit 2; added 1 November 2026). Each part is read by a reader
 * already in the code, strictly, and worked out by lib/checkup-rules.ts:
 *
 *   payments   readAccount (lib/stripe-connect.ts), a GET at Stripe
 *   domain     domainCheckup (lib/domains.ts), two GETs at Vercel
 *   email      pauseForSending (lib/mail-health.ts), one Redis read
 *   checkout   readTroubleStrict (lib/checkout-trouble.ts), one Redis read
 *
 * Each has a ceiling of CHECK_WAIT_MS: a reader that has not answered by
 * then, or that failed, is "not checked", never fine. The readers run side
 * by side, so the page waits at most that long. Nothing is written, sent or
 * charged and no model is asked: each request is a read at no cost per call
 * (Stripe's account, Vercel's domain, the store's own Redis keys), made
 * only when the creator opens the page, inside the studio's page allowance.
 *
 * What the plan already decides is said without asking anyone: a domain
 * rests and email to the list stops off Pro, and email stops while a
 * renewal is unpaid or a plan payment disputed (lib/plan.ts, canUse). A fix
 * on a studio card the person's role cannot open is said as a step for the
 * owner instead of a link that would lead nowhere.
 */
import type { Store } from "@/lib/store";
import { canUse, hasPro } from "@/lib/plan";
import { planDisputed } from "@/lib/plan-dispute-rules";
import type { Permission } from "@/lib/team-roles";
import { readAccount } from "@/lib/stripe-connect";
import { domainCheckup } from "@/lib/domains";
import { healthId, pauseForSending } from "@/lib/mail-health";
import { readTroubleStrict } from "@/lib/checkout-trouble";
import { type Check, checkoutCheck, domainCheck, emailCheck, emailStopped, notCheckedYet, orderChecks, stripeCheck } from "@/lib/checkup-rules";

/** The moment a checkup is read, said on the page with it. */
export function checkupClock(): number {
  return Date.now();
}

/** The longest any one reader is waited for. */
export const CHECK_WAIT_MS = 8_000;

/** A reader's answer, or `fallback` when it failed or took longer than `ms`. */
export async function within<T, F>(read: () => Promise<T>, fallback: F, ms = CHECK_WAIT_MS): Promise<T | F> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<F>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([read().catch(() => fallback), late]);
  } finally {
    clearTimeout(timer);
  }
}

type CheckedStore = Pick<Store, "sid" | "listId" | "statsId" | "stripeAccountId" | "domain" | "subscriptionActive" | "tier" | "renewalUnpaidSince" | "planDisputes">;

/** The studio card each fix leads to, and the permission that draws it (app/studio/page.tsx). */
const CARD_NEEDS: [string, Permission][] = [
  ["/studio#stripe", "payments"],
  ["/studio#billing", "billing"],
  ["/studio#domain", "settings"],
  ["/studio/email", "draft"],
];

/** A fix the person's role cannot open becomes a step for the owner. */
export function forRole(check: Check, can: (permission: Permission) => boolean): Check {
  const fix = check.fix;
  if (fix?.kind !== "studio") return check;
  const need = CARD_NEEDS.find(([href]) => fix.href === href)?.[1];
  if (!need || can(need)) return check;
  return { ...check, fix: { kind: "outside", where: `This is fixed in a part of the studio your role cannot open ("${fix.label}"). Ask the store's owner.` } };
}

export async function runCheckup(store: CheckedStore, can: (permission: Permission) => boolean, now = Date.now(), ms = CHECK_WAIT_MS): Promise<Check[]> {
  const account = store.stripeAccountId;
  const domain = store.domain?.name ?? null;
  const resting = domain !== null && !canUse(store, "domain");
  const stopped = emailStopped({ pro: store.subscriptionActive && hasPro(store.tier), renewalUnpaid: (store.renewalUnpaidSince ?? 0) > 0, disputed: store.subscriptionActive && planDisputed(store, now / 1000) });
  const [stripe, site, pause, trouble] = await Promise.all([
    account ? within(() => readAccount(account), null, ms) : Promise.resolve(null),
    domain && !resting ? within(() => domainCheckup(domain, store), null, ms) : Promise.resolve(null),
    stopped === null ? within(() => pauseForSending(healthId(store), now), undefined, ms) : Promise.resolve(undefined),
    // With no Stripe account no checkout can open at all; the payments line says so.
    account ? within(() => readTroubleStrict(store.statsId, now), null, ms) : Promise.resolve(null),
  ]);
  const checks = orderChecks([
    stripeCheck(Boolean(account), stripe),
    domainCheck(domain, resting ? "resting" : site),
    stopped === "left-out" ? null : stopped ?? emailCheck(pause, now),
    account ? checkoutCheck(trouble) : null,
    notCheckedYet("limits"),
    notCheckedYet("disputes"),
  ]);
  return checks.map((check) => forRole(check, can));
}
