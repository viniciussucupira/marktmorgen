/**
 * Static contents for a native disclosure. These strings are plain text,
 * including when plan wording changes; no supplied markup is trusted.
 * Keeping its descendants outside React's hydration tree lets the browser
 * open the list without hydrating all of its rows first.
 */
const TEXT_ENTITIES: Readonly<Record<string, string>> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, (char) => TEXT_ENTITIES[char]!);
}

// Keep native disclosure rows in the document while letting the browser defer
// layout/paint for offscreen rows when a long list is first opened on mobile.
// There is no JavaScript virtualization, extra wait, removed text or changed gate.
export function pricingPerksMarkup(perks: readonly string[]): string {
  const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>';
  const check = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 shrink-0 text-mint-brand" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>';
  return '<summary class="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[8px] text-sm font-semibold text-violet-deep [&::-webkit-details-marker]:hidden"><span aria-hidden="true" class="inline-flex shrink-0 group-open/perks:rotate-45">' + plus + '</span><span class="group-open/perks:hidden">All ' + perks.length + ' of them, itemized</span><span class="hidden group-open/perks:inline">Close the list</span></summary><ul class="mt-4 space-y-3">' + perks.map((perk) => '<li style="content-visibility:auto;contain-intrinsic-size:auto 48px" class="flex gap-3 text-[0.9375rem] text-ink-soft">' + check + '<span>' + escapeText(perk) + '</span></li>').join("") + '</ul>';
}

/** Static definition-list rows share the disclosure text escaping. The browser
 * keeps identical terms while React hydrates only their parent, not each row. */
export function pricingTermsMarkup(rows: readonly (readonly [string, string])[]): string {
  return rows.map(([label, value]) => '<div class="grid gap-x-4 py-2.5 sm:grid-cols-[6.5rem_1fr]"><dt class="font-semibold text-ink">' + escapeText(label) + '</dt><dd class="text-ink-mute">' + escapeText(value) + '</dd></div>').join("");
}
