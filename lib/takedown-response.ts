/** Display evidence only; token and store authorization remain on the server. */
export function takedownAnswer(httpOk: boolean, raw: unknown): { ok: true; done: string } | { ok: false; nothing: boolean } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, nothing: false };
  const data = raw as Record<string, unknown>;
  const own = (key: string) => Object.prototype.hasOwnProperty.call(data, key);
  if (httpOk && own("ok") && data.ok === true && !own("error") &&
      own("done") && typeof data.done === "string" && data.done.trim().length > 0) {
    return { ok: true, done: data.done.trim() };
  }
  return { ok: false, nothing: own("error") && data.error === "nothing" };
}
