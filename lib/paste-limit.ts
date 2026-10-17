/** HTML maxlength counts UTF-16 units; a paste replaces the current selection. */
export function pasteExceedsLimit(value: string, start: number, end: number, pasted: string, max: number, multiline = true): boolean {
  if (!Number.isSafeInteger(max) || max < 0 ||
      !Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
      start < 0 || end < start || end > value.length) return true;
  // Textareas normalize platform line endings when the browser inserts them.
  const inserted = multiline ? pasted.replace(/\r\n?/g, "\n") : pasted.replace(/[\r\n]/g, "");
  return value.length - (end - start) + inserted.length > max;
}
