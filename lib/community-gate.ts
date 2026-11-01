/**
 * Which spaces of a community a member can see, as one pure decision
 * (399 [SL3], unit 1; added 1 November 2026): the rule lib/community-access.ts
 * applies with the member's real purchases (maySeeSpace, visibleSpaces), and
 * the creator's "View as a member" applies with purchases the creator picks
 * for the preview. One rule, so the preview can never show something a real
 * member would not see, or hide something they would.
 *
 *   - a space kept for nobody in particular is open to every member;
 *   - a space kept for some products opens to a member who holds one of
 *     them, among those that still open the community (a product taken off
 *     the community's own list is ignored, so it shuts nobody out);
 *   - the creator sees every space.
 *
 * The preview's holdings are only the product ids the creator chose: no
 * buyer's identity, address, purchases or token is read or used, and
 * nothing is asked of Stripe for it.
 *
 * Browser-safe: plain data and pure functions.
 */

export type GatedSpace = { id: string; only: string[] };

/** Open to every member, or the products of which a member needs one. */
export type SpaceGate = { open: true } | { open: false; needs: string[] };

export function spaceGate(space: GatedSpace, access: readonly string[]): SpaceGate {
  if (!space.only.length) return { open: true };
  const needs = space.only.filter((p) => access.includes(p));
  return needs.length ? { open: false, needs } : { open: true };
}

/** Whether a member holding these products sees the space. */
export function seesSpace(space: GatedSpace, access: readonly string[], holdings: ReadonlySet<string>): boolean {
  const gate = spaceGate(space, access);
  return gate.open || gate.needs.some((id) => holdings.has(id));
}

/**
 * What "View as a member" shows: the spaces, in the creator's order, that a
 * member holding exactly the products chosen would see. An empty choice is a
 * member who bought none of the products that keep spaces.
 */
export function previewSpaces<S extends GatedSpace>(spaces: readonly S[], access: readonly string[], chosen: readonly string[]): S[] {
  const holdings = new Set(chosen.filter((id) => access.includes(id)));
  return spaces.filter((space) => seesSpace(space, access, holdings));
}
