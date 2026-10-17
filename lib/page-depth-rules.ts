/** How far a page is read, the figures (lib/page-depth.ts). Pure. */

/**
 * The most fields one page's record may have (since 18 October 2026): a
 * field is a block, with the answer and the video step a visitor sent, and
 * every new one was kept for a year, however many a request named. Past
 * this a new one is counted under "~" (lib/capped-count.ts).
 */
export const DEPTH_FIELDS_MAX = 120;
/**
 * What a page's record can weigh at the most, in bytes: its fields of up to
 * 44 characters, each with its count and what Redis keeps beside it, and the
 * key. Counted in the store's data room with its product from the day the
 * product is made, and for as long as the store is once it is deleted,
 * because a page already drawn can still send its reading (lib/store.ts).
 */
export const DEPTH_RECORD_BYTES = (DEPTH_FIELDS_MAX + 1) * 96 + 128;
