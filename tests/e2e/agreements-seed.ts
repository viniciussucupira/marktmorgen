/**
 * The store tests/e2e/agreements.mjs opens in a browser: one store on a
 * running plan, with its sender's name and postal address set, and a
 * session for its owner. Written through the same functions the studio
 * uses, into the stand-in database (tests/e2e/services.mjs).
 */
import { claimHandle, ensureStoreId, setMailSettings, setSubscription } from "@/lib/store";
import { openSession } from "@/lib/auth";

const OWNER = "owner@example.com";

async function main(): Promise<void> {
  const claimed = await claimHandle(OWNER, "signshop", "Harbor Coaching Local", "Coaching sessions. A store on this computer only, for checking pages.");
  if (!claimed.ok) throw new Error(`the address was refused: ${claimed.reason}`);
  await setSubscription(OWNER, { active: true, tier: "creator", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  await setMailSettings(OWNER, { fromName: "Harbor Coaching", address: "1 Main St, Austin, TX 78701" });
  await ensureStoreId(OWNER);
  console.log(JSON.stringify({ session: await openSession(OWNER) }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
