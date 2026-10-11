/**
 * The one store here that is ours: the demo store.
 *
 * "Live demo store" used to be a page written by hand. It looked like a
 * store and its checkout was real, but none of it was the code a creator's
 * store runs on — so what a visitor tried was not what a creator's buyers
 * get, and the speed published for it was not the speed of a store.
 *
 * Now it is a store: a record like any creator's, made through the same
 * functions the studio calls (lib/demo-seed.ts), drawn by the same pages,
 * sold through the same checkout and handed over by the same download. This
 * file is the short list of ways it is, on purpose, not like the others —
 * every one of them because it is the only store whose buyers pay nothing:
 *
 *   - It sells in Stripe's test mode whatever the site's own key is
 *     (lib/demo-account.ts), and its pages say so before anybody reaches a
 *     card form.
 *   - Nobody can sign in as its owner. It is changed by changing the code
 *     that makes it, and in no other way.
 *   - It takes no reviews. A review here would be words from anybody at all
 *     under "verified purchase", on a page of ours, with no creator to answer
 *     for them — and a purchase costs nothing.
 *   - It writes to no buyer (lib/purchase-email.ts): a checkout that takes
 *     any address for free must never be a way to send somebody an email.
 *
 * Everything else about it is whatever a store on the $29 plan is.
 *
 * Nothing is imported here, so a page drawn in the browser can read the
 * store's address without carrying anything else along.
 */

/** The address the demo store is kept under. No sign-in link is ever sent to it (lib/auth.ts). */
export const HOUSE_OWNER = "demo@marktmorgen.com";

/** Where the demo store lives: marktmorgen.com/@harborkitchen. */
export const HOUSE_HANDLE = "harborkitchen";

/** Stripe's own test card, as the demo's pages print it. */
export const TEST_CARD = "4242 4242 4242 4242";

/**
 * Who opens the demo store's studio.
 *
 * Nobody signs in as the demo's owner, and its Zoom and Google Calendar
 * connections are made in the studio, the way every creator's are. So one
 * address is on its team as an Admin (lib/demo-seed.ts, lib/team.ts). It is
 * written here rather than left to a setting, so the demo is the same
 * wherever this code runs; DEMO_STUDIO_ADMIN replaces it where one is set.
 *
 * An Admin can reach the store's settings and products. They cannot change
 * what the demo is: it is built from lib/demo-seed.ts on every deployment
 * that changes it, and anything edited by hand is put back.
 */
export const DEMO_STUDIO_ADMIN = "viniciussucupira084@gmail.com";

export function isHouseAddress(email: string): boolean {
  return email.trim().toLowerCase() === HOUSE_OWNER;
}

/** Whether a store is the demo store. By who owns it, which nobody can become. */
export function isHouseStore(store: { email: string }): boolean {
  return isHouseAddress(store.email);
}

/** Whether buyers of this store may leave a review. Every store but the demo. */
export function takesReviews(store: { email: string }): boolean {
  return !isHouseStore(store);
}
