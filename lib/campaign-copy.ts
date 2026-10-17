export type CampaignLinkField = Pick<HTMLInputElement, 'value' | 'focus' | 'select'>;
export type CampaignCopyResult = 'copied' | 'selected' | 'stale' | 'unavailable';

/** Clipboard access may be absent or denied. Select the current link for manual
 * copying instead; never select an unrelated link after an asynchronous failure.
 * Selection is not reported as a successful copy.
 */
export async function copyCampaignLink(
  link: string,
  getField: () => CampaignLinkField | null,
  writeText?: (text: string) => Promise<void>,
): Promise<CampaignCopyResult> {
  if (!link) return 'unavailable';
  try {
    if (writeText) { await writeText(link); return 'copied'; }
  } catch { /* A manual-copy path remains available. */ }
  try {
    const field = getField();
    if (!field || field.value !== link) return 'stale';
    field.focus({ preventScroll: true });
    field.select();
    return 'selected';
  } catch { return 'unavailable'; }
}
