/** Disposable test build only. The real transport still validates its exact
 * review, credentials, usage and dispatch receipt. The ACK adapter here is
 * synthetic; the separate required Redis suites prove the exact budget Lua.
 * No production module imports this file. No environment or HTTP flag can
 * select it in a production build.
 */
import { guardedResendPost as realPost, type ResendPost, type ResendTransportRuntime } from "../../lib/resend-fallback-transport";
import { createResendFallbackFixture } from "../resend-fallback-fixture";
export type { ResendTransportRuntime } from "../../lib/resend-fallback-transport";

const fixtures = new Map<string, ReturnType<typeof createResendFallbackFixture>>();
export async function guardedResendPost(input: ResendPost, runtime: ResendTransportRuntime = {}) {
  if (Object.keys(runtime).length) return realPost(input, runtime);
  // Only the two literal credentials in these disposable journeys are known.
  // Accidentally pointing this build at a real account never authorizes POST.
  const keys = ["re_local_only_a_stand_in", "re_test_security_journey_only_a_stand_in"];
  if (!keys.includes(input.credential) || !keys.includes(input.usageCredential) ||
      !/^http:\/\/127\.0\.0\.1:\d+$|^https:\/\/api\.resend\.com$/.test(input.base)) return { kind: "blocked" as const };
  const identity = `${input.credential}\n${input.usageCredential}`;
  let pending = fixtures.get(identity);
  if (!pending) {
    pending = createResendFallbackFixture({ credential: input.credential, usageCredential: input.usageCredential,
      accountId: "SYNTHETIC_DISPOSABLE_BROWSER_ACCOUNT", fetch: (request, init) => fetch(request, init) });
    fixtures.set(identity, pending);
  }
  const fixture = await pending;
  return realPost(input, fixture.runtime);
}
