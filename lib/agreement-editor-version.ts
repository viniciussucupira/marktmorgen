import { MAX_BODY, MAX_LINES, MAX_LINE_TEXT, MAX_QUANTITY, MAX_TITLE, MAX_VERSIONS, SHA_PATTERN } from "@/lib/agreement-rules";
import { readMoney, type Currency } from "@/lib/money";

export type AgreementEditorVersion = {
  n: number; title: string; body: string;
  lines: { text: string; quantity: string; amount: string }[];
  text: string; sha256: string;
};
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const owns = (value: object, keys: string[]) => keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));

/** Validate the whole read before replacing any editor state. Preserve every accepted string exactly. */
export function agreementEditorVersion(value: unknown, currency: Currency, expectedVersion: number): AgreementEditorVersion | null {
  if (!record(value) || !owns(value, ["n", "title", "body", "lines", "text", "sha256"])) return null;
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1 || expectedVersion > MAX_VERSIONS || value.n !== expectedVersion) return null;
  if (typeof value.title !== "string" || !value.title.trim() || value.title.length > MAX_TITLE ||
      typeof value.body !== "string" || !value.body.trim() || value.body.length > MAX_BODY ||
      typeof value.text !== "string" || !value.text ||
      typeof value.sha256 !== "string" || !SHA_PATTERN.test(value.sha256) ||
      !Array.isArray(value.lines) || value.lines.length > MAX_LINES) return null;
  const lines: AgreementEditorVersion["lines"] = [];
  for (const line of value.lines) {
    if (!record(line) || !owns(line, ["text", "quantity", "amount"]) ||
        typeof line.text !== "string" || !line.text.trim() || line.text.length > MAX_LINE_TEXT ||
        typeof line.quantity !== "string" || !/^[1-9]\d*$/.test(line.quantity) ||
        !Number.isSafeInteger(Number(line.quantity)) || Number(line.quantity) > MAX_QUANTITY ||
        typeof line.amount !== "string") return null;
    const amount = readMoney(line.amount, currency);
    if (amount === null || amount < 0) return null;
    lines.push({text: line.text, quantity: line.quantity, amount: line.amount});
  }
  return {n: expectedVersion, title: value.title, body: value.body, lines, text: value.text, sha256: value.sha256};
}
