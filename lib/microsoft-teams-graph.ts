import { TEAMS_APPROVED, teamsEligibility, teamsEventPayload, ownedTeamsEventPath, type TeamsEventInput } from "./microsoft-teams-policy";

/** Unconnected preparation: every production request remains blocked while approval is false. */
export class TeamsGraphError extends Error {
  constructor(readonly kind: "disabled" | "budget" | "invalid" | "auth" | "scope" | "gone" | "limit" | "provider", readonly status = 0) {
    super("Teams request refused: " + kind);
  }
}
type Owner = { storeId: string; connectionId: string };
type Options = {
  accessToken: string;
  owner: Owner;
  /** Must reserve existing integration allowance before each request, refresh and retry. */
  reserve: () => Promise<boolean>;
  /** Only an explicit loopback fixture in a non-production process. */
  localBase?: string;
};
const MAX_BYTES = 1_000_000;
export class TeamsGraph {
  private readonly base: string;
  private readonly local: boolean;
  constructor(private readonly options: Options) {
    const local = options.localBase ?? "";
    if (local && (!/^http:\/\/127\.0\.0\.1:\d+$/.test(local) || process.env.NODE_ENV === "production")) throw new TeamsGraphError("invalid");
    this.local = Boolean(local);
    this.base = local || "https://graph.microsoft.com/v1.0";
  }
  private async call(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<Record<string, unknown>> {
    if (!this.local && !TEAMS_APPROVED) throw new TeamsGraphError("disabled");
    if (!/^\/me\/(calendar|events(?:\/[^/?#]+)?)(?:\?\$select=[A-Za-z,]+)?$/.test(path)) throw new TeamsGraphError("invalid");
    const token = this.options.accessToken;
    if (!token || token.length > 4000 || /[\r\n]/.test(token)) throw new TeamsGraphError("invalid");
    if (!(await this.options.reserve())) throw new TeamsGraphError("budget");
    let response: Response;
    try {
      response = await fetch(this.base + path, {
        method, headers: { Authorization: "Bearer " + token, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(8000),
      });
    } catch { throw new TeamsGraphError("provider"); }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      const status = response.status;
      throw new TeamsGraphError(status === 401 ? "auth" : status === 403 ? "scope" : status === 404 || status === 410 ? "gone" : status === 429 ? "limit" : "provider", status);
    }
    if (response.status === 204) return {};
    const reader = response.body?.getReader();
    if (!reader) throw new TeamsGraphError("provider");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); throw new TeamsGraphError("provider"); }
        chunks.push(value);
      }
      const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new TeamsGraphError("provider");
      return parsed as Record<string, unknown>;
    } catch { throw new TeamsGraphError("provider"); }
    finally { reader.releaseLock(); }
  }
  async capability(accountType: unknown): Promise<boolean> {
    if (accountType !== "organizational") return false;
    const calendar = await this.call("GET", "/me/calendar?$select=allowedOnlineMeetingProviders");
    return teamsEligibility(accountType, calendar).ok;
  }
  async create(input: TeamsEventInput, accountType: unknown): Promise<Record<string, unknown>> {
    const payload = teamsEventPayload(input);
    if (!payload) throw new TeamsGraphError("invalid");
    if (!(await this.capability(accountType))) throw new TeamsGraphError("scope");
    return this.call("POST", "/me/events", payload);
  }
  private owned(record: unknown): string {
    const path = ownedTeamsEventPath(record, this.options.owner.storeId, this.options.owner.connectionId);
    if (!path) throw new TeamsGraphError("invalid");
    return path;
  }
  async move(record: unknown, input: TeamsEventInput): Promise<Record<string, unknown>> {
    const path = this.owned(record), payload = teamsEventPayload(input);
    if (!payload) throw new TeamsGraphError("invalid");
    // Preserve the provider's meeting body/blob and attendees. Never patch those fields.
    return this.call("PATCH", path, { start: payload.start, end: payload.end });
  }
  async remove(record: unknown): Promise<void> {
    await this.call("DELETE", this.owned(record));
  }
}
