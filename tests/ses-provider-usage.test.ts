import { done, is, part } from "./check";

const oldFetch = globalThis.fetch;
const names = [
  "AWS_SES_ROLE_ARN", "AWS_SES_REGION", "AWS_SES_CONFIGURATION_SET",
  "AWS_SES_TOPIC_ARN", "VERCEL_OIDC_TOKEN",
] as const;
for (const name of names) delete process.env[name];

async function main(): Promise<void> {
  const { sesProviderUsage } = await import("@/lib/ses-provider-usage");

  part("Configuration and timestamps fail closed before I/O");
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return new Response(); };
  is("missing configuration is not zero", await sesProviderUsage(1_000), { ok: false, reason: "not_configured" });
  is("an invalid snapshot is unknown", await sesProviderUsage(Number.NaN), { ok: false, reason: "unknown" });
  is("neither case reaches a provider", requests, 0);

  process.env.AWS_SES_ROLE_ARN = "arn:aws:iam::123456789012:role/synthetic-provider-usage";
  process.env.AWS_SES_REGION = "us-east-1";
  process.env.AWS_SES_CONFIGURATION_SET = "marktmorgen";
  process.env.AWS_SES_TOPIC_ARN = "arn:aws:sns:us-east-1:123456789012:marktmorgen-email";
  process.env.VERCEL_OIDC_TOKEN = "header.payload.signature";

  part("The official rolling counter keeps its own snapshot");
  let accountRequest: { method: string; authorization: string; token: string; cache: RequestCache | undefined } | null = null;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.hostname === "sts.us-east-1.amazonaws.com") {
      return Response.json({
        AssumeRoleWithWebIdentityResponse: {
          AssumeRoleWithWebIdentityResult: {
            Credentials: {
              AccessKeyId: "ASIASYNTHETICUSAGE01",
              SecretAccessKey: "synthetic-secret-provider-usage-only",
              SessionToken: "synthetic-provider-usage-session",
              Expiration: 4_000_000_000,
            },
          },
        },
      });
    }
    accountRequest = {
      method: String(init?.method),
      authorization: String(new Headers(init?.headers).get("authorization")),
      token: String(new Headers(init?.headers).get("x-amz-security-token")),
      cache: init?.cache,
    };
    return Response.json({
      ProductionAccessEnabled: true,
      SendingEnabled: true,
      EnforcementStatus: "HEALTHY",
      SendQuota: { Max24HourSend: 50_000, MaxSendRate: 14, SentLast24Hours: 37 },
    });
  };
  is("SES count, limits, readiness and the pre-request instant stay together",
    await sesProviderUsage(1_000, () => 1_125),
    {
      ok: true,
      sentLast24Hours: 37,
      max24: 50_000,
      rate: 14,
      production: true,
      sending: true,
      enforcement: "HEALTHY",
      requestedAt: "1970-01-01T00:00:01.000Z",
      observedAt: "1970-01-01T00:00:01.125Z",
    });
  is("a backwards response clock is unknown",
    await sesProviderUsage(2_000, () => 1_999),
    { ok: false, reason: "unknown" });
  is("the read is signed with only the temporary role identity and is not cached",
    [
      accountRequest?.method,
      accountRequest?.authorization.startsWith("AWS4-HMAC-SHA256 Credential=ASIASYNTHETICUSAGE01/"),
      accountRequest?.token,
      accountRequest?.cache,
    ],
    ["GET", true, "synthetic-provider-usage-session", "no-store"]);

  part("Malformed, unauthorized and unavailable evidence never becomes zero");
  let getterCalls = 0;
  const getterQuota = Object.defineProperty({}, "SentLast24Hours", {
    get() { getterCalls += 1; return 0; },
  });
  for (const account of [
    {},
    {
      ProductionAccessEnabled: true, SendingEnabled: true, EnforcementStatus: "HEALTHY",
      SendQuota: getterQuota,
    },
    {
      ProductionAccessEnabled: true, SendingEnabled: true, EnforcementStatus: "HEALTHY",
      SendQuota: { Max24HourSend: 50_000, MaxSendRate: 14, SentLast24Hours: -1 },
    },
    {
      ProductionAccessEnabled: true, SendingEnabled: true, EnforcementStatus: "UNKNOWN",
      SendQuota: { Max24HourSend: 50_000, MaxSendRate: 14, SentLast24Hours: 0 },
    },
  ]) {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => account }) as Response;
    is("partial or executable account usage is unknown", await sesProviderUsage(2_000), { ok: false, reason: "unknown" });
  }
  is("provider getters were not executed", getterCalls, 0);
  globalThis.fetch = async () => new Response("", { status: 403 });
  is("authorization failure stays distinct", await sesProviderUsage(2_000), { ok: false, reason: "unauthorized" });
  globalThis.fetch = async () => new Response("", { status: 503 });
  is("provider refusal is not absence", await sesProviderUsage(2_000), { ok: false, reason: "provider" });
  globalThis.fetch = async () => { throw new Error("synthetic network loss"); };
  is("transport loss is not absence", await sesProviderUsage(2_000), { ok: false, reason: "provider" });

  globalThis.fetch = oldFetch;
  done();
}

main().catch((error) => {
  globalThis.fetch = oldFetch;
  console.error(error);
  process.exit(1);
});
