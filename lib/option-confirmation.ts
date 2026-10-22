/** The option route acknowledges a completed write with its own exact boolean. */
export function confirmsOptionWrite(raw: unknown, httpOk: boolean): boolean {
  return httpOk === true && typeof raw === "object" && raw !== null
    && !Array.isArray(raw) && Object.hasOwn(raw, "ok")
    && (raw as { ok?: unknown }).ok === true && !Object.hasOwn(raw, "error");
}
