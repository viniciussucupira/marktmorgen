/**
 * How many visitors a page's reading is measured on (lib/page-read.ts): one
 * in READ_SAMPLE. Apart from that file because a browser needs it and that
 * file signs with a key the browser must never be handed.
 */
export const READ_SAMPLE = 8;

/** The fewest measured visitors before a share is shown: below it, chance says more than the page. */
export const READ_MIN_VISITORS = 30;
