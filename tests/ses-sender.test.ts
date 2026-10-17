/**
 * Email goes through Amazon SES when Amazon says it may, and through Resend
 * whenever it may not — with nobody choosing, nothing lost, and nobody
 * written to twice (lib/email.ts, lib/ses.ts).
 *
 * Amazon is the cheaper sender by nine times, and the one with more ways to
 * say no: a new account is looked at before it may write to the public, an
 * account has a number of emails for any 24 hours and for any second, and
 * Amazon pauses one whose email bounces too much. Each of those is stood in
 * for here, and each must end the same way: the email arrives.
 *
 * The last parts are the other direction: Amazon telling us an email
 * bounced (app/api/mail/ses), believed only from our own topic and with
 * Amazon's signature.
 */
import { createSign, generateKeyPairSync } from "node:crypto";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/mail/ses/route";
import { claimHandle, ensureListId, ensureStatsId, setMailSettings, setSubscription, storeForEmail } from "@/lib/store";
import { isMailable, upsertContact } from "@/lib/contacts";
import { hasResend, isSenderConfigured, sendBatch, sendEmail, sentThisMonth } from "@/lib/email";
import { listCeiling, senderRoom } from "@/lib/mail";
import { LIST_TAG, STORE_TAG, healthId, listHealth } from "@/lib/mail-health";
import { HOLD_SECONDS, isSesConfigured, sesConfig, sesSentLast24h, sesState } from "@/lib/ses";
import { stringToSign, type SnsMessage } from "@/lib/sns";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { ROOM } from "./data-room";

const REGION = "us-east-1";
const TOPIC = `arn:aws:sns:${REGION}:123456789012:marktmorgen-email`;
const SUPPORT = "support@marktmorgen.com";

type AmazonSent = { to: string; subject: string; body: Record<string, unknown>; headers: Record<string, string> };
type ResendSent = { to: string; subject: string; key: string | null };
const amazon: AmazonSent[] = [];
const resend: ResendSent[] = [];
const resendKeys = new Set<string>();
let asked = 0;
let account: Record<string, unknown> | number = 0;
/** What Amazon answers to a send, by recipient; anything not named is taken. */
let amazonSays: (to: string, nth: number) => { status: number; type?: string; message?: string } = () => ({ status: 200 });
const fetched: string[] = [];
const exchanges: { role: string; token: string; action: string }[] = [];
let stsRefuses = false;
let stsAnswersXml = false;
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const CERT = publicKey.export({ type: "spki", format: "pem" }).toString();

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(data), { status, headers });
  if (url.hostname === `email.${REGION}.amazonaws.com`) {
    if (url.pathname === "/v2/email/account") {
      asked += 1;
      return typeof account === "number" ? json({ message: "no" }, account || 500) : json(account);
    }
    if (url.pathname === "/v2/email/outbound-emails") {
      const body = JSON.parse(String(init?.body)) as { Destination: { ToAddresses: string[] }; Content: { Simple: { Subject: { Data: string } } } };
      const to = body.Destination.ToAddresses[0];
      const says = amazonSays(to, amazon.filter((a) => a.to === to).length);
      if (says.status !== 200) return json({ message: says.message ?? "" }, says.status, says.type ? { "x-amzn-errortype": says.type } : {});
      amazon.push({ to, subject: body.Content.Simple.Subject.Data, body: body as unknown as Record<string, unknown>, headers: init?.headers as Record<string, string> });
      return json({ MessageId: `m-${amazon.length}` });
    }
    return json({}, 404);
  }
  if (url.hostname === "api.resend.com") {
    const key = (init?.headers as Record<string, string>)["Idempotency-Key"] ?? null;
    // Resend answers a key it has seen without sending again.
    if (key && resendKeys.has(key)) return json({ id: "again" });
    if (key) resendKeys.add(key);
    const body = JSON.parse(String(init?.body)) as { to: string[]; subject: string } | { to: string[]; subject: string }[];
    for (const m of Array.isArray(body) ? body : [body]) resend.push({ to: m.to[0], subject: m.subject, key });
    return json({ id: "email_1" });
  }
  if (url.hostname === `sts.${REGION}.amazonaws.com`) {
    const form = new URLSearchParams(String(init?.body));
    exchanges.push({ role: form.get("RoleArn") ?? "", token: form.get("WebIdentityToken") ?? "", action: form.get("Action") ?? "" });
    if (stsRefuses) return json({ Error: { Code: "AccessDenied", Message: "Not authorized to perform sts:AssumeRoleWithWebIdentity" } }, 403);
    const credentials = { AccessKeyId: `ASIAEXAMPLELENT${exchanges.length}`, SecretAccessKey: "lent-for-an-hour-and-never-stored-0000000", SessionToken: `session-token-${exchanges.length}`, Expiration: Math.floor(Date.now() / 1000) + 3_600 };
    return stsAnswersXml
      ? new Response(`<AssumeRoleWithWebIdentityResponse><AssumeRoleWithWebIdentityResult><Credentials><AccessKeyId>${credentials.AccessKeyId}</AccessKeyId><SecretAccessKey>${credentials.SecretAccessKey}</SecretAccessKey><SessionToken>${credentials.SessionToken}</SessionToken><Expiration>${new Date(credentials.Expiration * 1000).toISOString()}</Expiration></Credentials></AssumeRoleWithWebIdentityResult></AssumeRoleWithWebIdentityResponse>`)
      : json({ AssumeRoleWithWebIdentityResponse: { AssumeRoleWithWebIdentityResult: { Credentials: credentials } } });
  }
  fetched.push(url.href);
  if (url.hostname === `sns.${REGION}.amazonaws.com`) return new Response(url.pathname.endsWith(".pem") ? CERT : "<ok/>");
  return json({}, 404);
}) as typeof fetch;

const approved = (extra: Record<string, unknown> = {}) => ({ ProductionAccessEnabled: true, SendingEnabled: true, EnforcementStatus: "HEALTHY", SendQuota: { Max24HourSend: 50_000, MaxSendRate: 100, SentLast24Hours: 0 }, ...extra });
/** Amazon is asked again on the next email, as it is once five minutes have passed. */
const askAgain = () => redis.run(["DEL", "nl:ses:state"]);
const clear = () => {
  amazon.length = 0;
  resend.length = 0;
};
const letter = (to: string, subject = "Hello") => ({ meter: { by: "company" } as const, from: "Marktmorgen <hello@marktmorgen.com>", to, subject, text: "Hello.", html: "<p>Hello.</p>" });

let announced = 0;
function announce(over: Partial<SnsMessage> & { event?: unknown }, opts: { sign?: boolean } = {}): NextRequest {
  announced += 1;
  const base: SnsMessage = {
    Type: "Notification",
    MessageId: `sns-${announced}`,
    TopicArn: TOPIC,
    Message: JSON.stringify(over.event ?? {}),
    Timestamp: new Date().toISOString(),
    SignatureVersion: "2",
    Signature: "",
    SigningCertURL: `https://sns.${REGION}.amazonaws.com/SimpleNotificationService-abc.pem`,
  };
  const { event: _event, ...fields } = over;
  void _event;
  const message: SnsMessage = { ...base, ...fields };
  if (!over.Signature) {
    const signed = createSign(message.SignatureVersion === "1" ? "RSA-SHA1" : "RSA-SHA256").update(stringToSign(message), "utf8").sign(privateKey, "base64");
    message.Signature = opts.sign === false ? signed.replace(/^./, (c) => (c === "A" ? "B" : "A")) : signed;
  }
  const body = JSON.stringify(message);
  return new NextRequest("https://marktmorgen.com/api/mail/ses", {
    method: "POST",
    headers: { host: "marktmorgen.com", "content-type": "text/plain; charset=UTF-8", "content-length": String(Buffer.byteLength(body)), "x-amz-sns-message-type": message.Type },
    body,
  });
}

async function main(): Promise<void> {
  redis.clear();
  process.env.RESEND_API_KEY = "re_test_floor_only_a_stand_in";
  for (const name of ["AWS_SES_ROLE_ARN", "AWS_SES_ACCESS_KEY_ID", "AWS_SES_SECRET_ACCESS_KEY", "AWS_SES_REGION", "AWS_SES_CONFIGURATION_SET", "AWS_SES_TOPIC_ARN", "SENDER_MONTHLY_QUOTA", "VERCEL_OIDC_TOKEN"]) delete process.env[name];

  part("Not used until every setting is there");
  is("with none, Amazon is not there and Resend sends", [isSesConfigured(), isSenderConfigured(), hasResend()], [false, true, true]);
  is("and nothing is found at the address Amazon would post to", (await POST(announce({}))).status, 404);
  process.env.AWS_SES_ACCESS_KEY_ID = "AKIAEXAMPLEEXAMPLE00";
  process.env.AWS_SES_SECRET_ACCESS_KEY = "a-stand-in-secret-for-tests-only-0000000";
  process.env.AWS_SES_REGION = REGION;
  process.env.AWS_SES_CONFIGURATION_SET = "marktmorgen";
  is("without the topic, not yet", isSesConfigured(), false);
  process.env.AWS_SES_TOPIC_ARN = "arn:aws:sns:eu-west-1:123456789012:marktmorgen-email";
  is("a topic in another region than the one email leaves from is not believed", isSesConfigured(), false);
  process.env.AWS_SES_TOPIC_ARN = TOPIC;
  is("all of them", [isSesConfigured(), sesConfig()?.region, sesConfig()?.roleArn], [true, REGION, null]);

  part("An account Amazon is still looking at");
  account = { ProductionAccessEnabled: false, SendingEnabled: true, EnforcementStatus: "HEALTHY", SendQuota: { Max24HourSend: 200, MaxSendRate: 1 } };
  is("a sign-in link is sent", await sendEmail(letter("buyer@example.com", "Your login link")), true);
  is("through Resend, as it always was", [amazon.length, resend.map((m) => m.to)], [0, ["buyer@example.com"]]);
  is("because Amazon said the account may not write to the public yet", (await sesState())?.why, "sandbox");
  is("a batch goes the same way", [await sendBatch([letter("a@example.com"), letter("b@example.com")], "k:sandbox", { by: "company" }), amazon.length, resend.length], ["sent", 0, 3]);
  const askedSoFar = asked;
  await sendEmail(letter("c@example.com"));
  is("and Amazon is not asked again for every email", asked, askedSoFar);

  part("The day Amazon says yes, sending moves by itself");
  account = approved();
  askAgain();
  clear();
  is("the next sign-in link is sent", await sendEmail({ ...letter("buyer@example.com", "Your login link"), replyTo: "owner@example.com", headers: { "List-Unsubscribe": "<https://marktmorgen.com/u>" } }), true);
  is("through Amazon, and not through Resend as well", [amazon.length, resend.length], [1, 0]);
  const one = amazon[0];
  is("signed for Amazon's email service in that region", [/^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLEEXAMPLE00\/\d{8}\/us-east-1\/ses\/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=[0-9a-f]{64}$/.test(one.headers.authorization), /^\d{8}T\d{6}Z$/.test(one.headers["x-amz-date"])], [true, true]);
  is("from, to, reply-to and subject as written", [one.body.FromEmailAddress, (one.body.Destination as { ToAddresses: string[] }).ToAddresses, one.body.ReplyToAddresses, one.subject], ["Marktmorgen <hello@marktmorgen.com>", ["buyer@example.com"], ["owner@example.com"], "Your login link"]);
  const simple = (one.body.Content as { Simple: { Body: { Text: { Data: string }; Html: { Data: string } }; Headers: unknown } }).Simple;
  is("the text and the page, and the header a mail app unsubscribes with", [simple.Body.Text.Data, simple.Body.Html.Data, simple.Headers], ["Hello.", "<p>Hello.</p>", [{ Name: "List-Unsubscribe", Value: "<https://marktmorgen.com/u>" }]]);
  is("under the set whose events come back to us", one.body.ConfigurationSetName, "marktmorgen");
  is("counted as Amazon's, and not against Resend's month", [await sesSentLast24h(), await sentThisMonth()], [1, 4]);

  part("Once means once");
  clear();
  const receipt = { ...letter("buyer@example.com", "Your receipt"), idempotencyKey: "receipt:cs_test_1" };
  is("the same receipt asked for twice", [await sendEmail(receipt), await sendEmail(receipt)], [true, true]);
  is("is sent one time", [amazon.length, resend.length], [1, 0]);

  part("A batch, one email at a time");
  clear();
  const thirty = Array.from({ length: 30 }, (_, i) => ({ ...letter(`reader${i}@example.com`, "News"), tags: { [STORE_TAG]: "a".repeat(32), [LIST_TAG]: "b".repeat(32) } }));
  is("taken", await sendBatch(thirty, "bc:1:0", { by: "company" }), "sent");
  is("all thirty by Amazon, each once", [amazon.length, new Set(amazon.map((a) => a.to)).size, resend.length], [30, 30, 0]);
  is("each carrying whose email it is, for the day one bounces", amazon[0].body.EmailTags, [{ Name: STORE_TAG, Value: "a".repeat(32) }, { Name: LIST_TAG, Value: "b".repeat(32) }]);
  is("the same batch tried again writes to nobody", [await sendBatch(thirty, "bc:1:0", { by: "company" }), amazon.length, resend.length], ["sent", 30, 0]);

  part("No faster than Amazon allows");
  account = approved({ SendQuota: { Max24HourSend: 50_000, MaxSendRate: 14 } });
  askAgain();
  clear();
  const began = Date.now();
  const twenty = Array.from({ length: 20 }, (_, i) => letter(`pace${i}@example.com`));
  is("twenty at fourteen a second", await sendBatch(twenty, "bc:pace", { by: "company" }), "sent");
  is("take two seconds' worth of turns, and all arrive", [Date.now() - began >= 900, amazon.length], [true, 20]);

  part("Too many a second, for a moment");
  account = approved();
  askAgain();
  clear();
  let tries = 0;
  amazonSays = () => {
    tries += 1;
    return tries === 1 ? { status: 429, type: "TooManyRequestsException", message: "Maximum sending rate exceeded." } : { status: 200 };
  };
  is("a sign-in link waits its turn", await sendEmail(letter("hurry@example.com", "Your login link")), true);
  is("and still goes through Amazon", [amazon.length, resend.length, tries], [1, 0, 2]);
  amazonSays = () => ({ status: 200 });

  part("Amazon pauses the account");
  clear();
  amazonSays = () => ({ status: 400, type: "AccountSuspendedException", message: "Sending paused for this account." });
  is("a sign-in link is sent all the same", await sendEmail(letter("buyer@example.com", "Your login link")), true);
  is("through Resend, in the same breath", [amazon.length, resend.filter((m) => m.to === "buyer@example.com").length], [0, 1]);
  is("the site's own inbox is told, through Resend", resend.filter((m) => m.to === SUPPORT).map((m) => m.subject), ["Amazon SES is not sending: email is going out through Resend"]);
  const held = await sesState();
  is("Amazon is left alone for ten minutes", [held?.ready, (held?.hold ?? 0) - Math.floor(Date.now() / 1000) > HOLD_SECONDS - 5], [false, true]);
  tries = 0;
  amazonSays = () => {
    tries += 1;
    return { status: 400, type: "AccountSuspendedException" };
  };
  await sendEmail(letter("next@example.com"));
  await sendBatch([letter("x@example.com"), letter("y@example.com")], "bc:held", { by: "company" });
  is("so the emails after it go straight to Resend, and the inbox is not told twice", [tries, resend.filter((m) => m.to === SUPPORT).length, resend.filter((m) => m.to !== SUPPORT).length], [0, 1, 4]);

  part("Amazon stops halfway through a batch");
  account = approved({ SendQuota: { Max24HourSend: 50_000, MaxSendRate: 5 } });
  askAgain();
  redis.run(["DEL", `nl:ses:told:${new Date().toISOString().slice(0, 10)}`]);
  clear();
  // The first five are taken; from the sixth on, the account is paused.
  amazonSays = () => (amazon.length >= 5 ? { status: 400, type: "SendingPausedException", message: "paused" } : { status: 200 });
  const twelve = Array.from({ length: 12 }, (_, i) => letter(`half${i}@example.com`, "News"));
  is("the batch still counts as sent", await sendBatch(twelve, "bc:half", { by: "company" }), "sent");
  const everyone = [...amazon.map((a) => a.to), ...resend.filter((m) => m.to !== SUPPORT).map((m) => m.to)];
  is("five by Amazon, seven by Resend", [amazon.length, resend.filter((m) => m.to !== SUPPORT).length], [5, 7]);
  is("everyone once, nobody twice", [everyone.length, new Set(everyone).size], [12, 12]);
  is("the seven under a key of their own, not the batch's", resend.find((m) => m.to !== SUPPORT)?.key !== "bc:half", true);
  amazonSays = () => ({ status: 200 });
  askAgain();
  account = approved();
  const before = [amazon.length, resend.length];
  is("and the whole batch tried again writes to nobody, though Amazon is back", [await sendBatch(twelve, "bc:half", { by: "company" }), amazon.length, resend.length], ["sent", ...before]);

  part("An email Amazon will not take for its own sake");
  clear();
  amazonSays = (to) => (to === "odd@example.com" ? { status: 400, type: "BadRequestException", message: "Illegal address" } : { status: 200 });
  is("alone, it is tried with the other sender", [await sendEmail(letter("odd@example.com")), amazon.length, resend.map((m) => m.to)], [true, 0, ["odd@example.com"]]);
  clear();
  is("in a batch, it does not hold up the others", [await sendBatch([letter("fine1@example.com"), letter("odd@example.com"), letter("fine2@example.com")], "bc:odd", { by: "company" }), amazon.map((a) => a.to), resend.length], ["sent", ["fine1@example.com", "fine2@example.com"], 0]);
  is("and Amazon is not left alone over it", (await sesState())?.ready, true);
  amazonSays = () => ({ status: 200 });

  part("Amazon's day");
  redis.clear();
  resendKeys.clear();
  account = approved({ SendQuota: { Max24HourSend: 100, MaxSendRate: 100 } });
  clear();
  is("room for list email is four fifths of Amazon's day, on top of Resend's month", await senderRoom(), listCeiling() + 80);
  const fifty = (n: number) => Array.from({ length: 50 }, (_, i) => letter(`day${n}-${i}@example.com`));
  await sendBatch(fifty(1), "bc:day:1", { by: "company" });
  is("fifty fit, and go by Amazon", [amazon.length, resend.length, await senderRoom()], [50, 0, listCeiling() + 30]);
  await sendBatch(fifty(2), "bc:day:2", { by: "company" });
  is("fifty more do not: they go by Resend, whole, rather than wait", [amazon.length, resend.length], [50, 50]);
  is("and the rest of Amazon's day is still there for a sign-in link", [await sendEmail(letter("buyer@example.com", "Your login link")), amazon.length, resend.length], [true, 51, 50]);

  part("Amazon does not answer");
  account = 500;
  askAgain();
  clear();
  is("email goes through Resend", [await sendEmail(letter("buyer@example.com")), amazon.length, resend.length], [true, 0, 1]);
  const askedDown = asked;
  await sendEmail(letter("buyer2@example.com"));
  is("and Amazon is asked again in a minute, not on every email", asked, askedDown);
  account = 403;
  askAgain();
  is("a key Amazon does not believe is an answer: not usable", [(await sesState())?.ready, (await sesState())?.why], [false, "key"]);

  part("With a role, no key of Amazon's is kept anywhere");
  redis.clear();
  resendKeys.clear();
  account = approved();
  clear();
  delete process.env.AWS_SES_ACCESS_KEY_ID;
  delete process.env.AWS_SES_SECRET_ACCESS_KEY;
  is("with neither a role nor a key, Amazon is not there", isSesConfigured(), false);
  process.env.AWS_SES_ROLE_ARN = "arn:aws:iam::123456789012:role/marktmorgen-email";
  is("the role alone is enough: nothing secret among the settings", [isSesConfigured(), sesConfig()?.roleArn, sesConfig()?.key], [true, "arn:aws:iam::123456789012:role/marktmorgen-email", null]);
  is("a request the host gave no token is sent through Resend", [await sendEmail(letter("buyer@example.com")), amazon.length, resend.length, exchanges.length], [true, 0, 1, 0]);
  is("and Amazon is marked as not usable for want of a key", (await sesState())?.why, "key");

  // The host puts its token on each request it serves, where its own helper reads it.
  const hostGives = (token: string) => {
    (globalThis as Record<symbol, unknown>)[Symbol.for("@vercel/request-context")] = { get: () => ({ headers: { "x-vercel-oidc-token": token } }) };
  };
  hostGives("aGVhZGVy.cGF5bG9hZA.c2lnbmF0dXJl");
  askAgain();
  clear();
  // The minute Amazon is left alone after a refusal has passed.
  const realNow = Date.now;
  let ahead = 61_000;
  Date.now = () => realNow() + ahead;
  is("with the host's token, the next one is sent", await sendEmail(letter("buyer@example.com", "Your login link")), true);
  is("through Amazon", [amazon.length, resend.length], [1, 0]);
  is("after one exchange: the token for the role, and nothing else", exchanges, [{ role: "arn:aws:iam::123456789012:role/marktmorgen-email", token: "aGVhZGVy.cGF5bG9hZA.c2lnbmF0dXJl", action: "AssumeRoleWithWebIdentity" }]);
  const lentHeaders = amazon[0].headers;
  is("signed with the key Amazon lent, and carrying its session", [/Credential=ASIAEXAMPLELENT1\//.test(lentHeaders.authorization), lentHeaders["x-amz-security-token"], /SignedHeaders=content-type;host;x-amz-date;x-amz-security-token,/.test(lentHeaders.authorization)], [true, "session-token-1", true]);
  await sendBatch([letter("a@example.com"), letter("b@example.com"), letter("c@example.com")], "bc:role", { by: "company" });
  is("the same lent key serves the emails after it", [amazon.length, exchanges.length], [4, 1]);
  ahead += 56 * 60_000;
  stsAnswersXml = true;
  await sendEmail(letter("later@example.com"));
  is("near the end of its hour another is borrowed, read from either of Amazon's two answers", [amazon.length, exchanges.length, amazon[4].headers["x-amz-security-token"]], [5, 2, "session-token-2"]);
  stsAnswersXml = false;

  part("A role that does not trust this project");
  process.env.AWS_SES_ROLE_ARN = "arn:aws:iam::123456789012:role/somebody-elses";
  stsRefuses = true;
  askAgain();
  clear();
  is("the email is sent all the same", await sendEmail(letter("buyer@example.com", "Your login link")), true);
  is("through Resend, and Amazon is not asked for a key on every email", [amazon.length, resend.length, exchanges.length], [0, 1, 3]);
  await sendEmail(letter("buyer2@example.com"));
  is("nor asked again within the minute", exchanges.length, 3);
  stsRefuses = false;
  process.env.AWS_SES_ROLE_ARN = "arn:aws:iam::123456789012:role/marktmorgen-email";
  Date.now = realNow;
  delete (globalThis as Record<symbol, unknown>)[Symbol.for("@vercel/request-context")];
  process.env.AWS_SES_ACCESS_KEY_ID = "AKIAEXAMPLEEXAMPLE00";
  process.env.AWS_SES_SECRET_ACCESS_KEY = "a-stand-in-secret-for-tests-only-0000000";
  delete process.env.AWS_SES_ROLE_ARN;

  part("Amazon tells us an email bounced");
  redis.clear();
  account = approved();
  const made = await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  if (!made.ok) throw new Error("no store");
  await ensureStatsId("owner@example.com");
  await ensureListId("owner@example.com");
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, tier: "pro", period: paidPeriod() });
  await setMailSettings("owner@example.com", { fromName: "Harbor Kitchen", address: "1 Main St, Portland, OR 97201" });
  const store = (await storeForEmail("owner@example.com"))!;
  const list = store.listId as string;
  for (const who of ["gone", "angry", "fine"]) await upsertContact(list, `${who}@example.com`, { agreed: true, explicit: true, source: "import" }, ROOM);
  const tags = { "ses:configuration-set": ["marktmorgen"], [STORE_TAG]: [healthId(store)], [LIST_TAG]: [list] };
  const bounce = (to: string, type = "Permanent") => ({ eventType: "Bounce", bounce: { bounceType: type, bounceSubType: "General", bouncedRecipients: [{ emailAddress: to, status: "5.1.1" }] }, mail: { destination: [to], tags } });
  fetched.length = 0;
  const heard = await POST(announce({ event: bounce("gone@example.com") }));
  is("believed, with Amazon's signature from our topic", [heard.status, await heard.json()], [200, { ok: true, result: "counted" }]);
  is("the certificate was read from Amazon's own host", fetched, [`https://sns.${REGION}.amazonaws.com/SimpleNotificationService-abc.pem`]);
  is("the address is off the list, and counted for the store", [await isMailable(list, "gone@example.com"), (await listHealth(healthId(store))).bounced], [false, 1]);
  const spam = await POST(announce({ SignatureVersion: "1", event: { eventType: "Complaint", complaint: { complainedRecipients: [{ emailAddress: "angry@example.com" }] }, mail: { tags } } }));
  is("a spam report is heard the same way, under the older signature too", [(await spam.json()).result, await isMailable(list, "angry@example.com"), (await listHealth(healthId(store))).complained], ["counted", false, 1]);
  const soft = await POST(announce({ event: bounce("fine@example.com", "Transient") }));
  is("a bounce that may yet deliver takes nobody off", [(await soft.json()).result, await isMailable(list, "fine@example.com")], ["ignored", true]);
  is("a delivery, or anything else, is acknowledged and left", await (await POST(announce({ event: { eventType: "Delivery", mail: { tags } } }))).json(), { ok: true });

  part("Only Amazon, and only our topic");
  const refused = async (request: NextRequest) => [(await POST(request)).status, await isMailable(list, "fine@example.com")];
  is("a signature that does not match", await refused(announce({ event: bounce("fine@example.com") }, { sign: false })), [401, true]);
  is("somebody else's topic, signed by Amazon all the same", await refused(announce({ TopicArn: `arn:aws:sns:${REGION}:999999999999:not-ours`, event: bounce("fine@example.com") })), [401, true]);
  fetched.length = 0;
  is("a certificate from anywhere but Amazon", await refused(announce({ SigningCertURL: "https://sns.us-east-1.amazonaws.com.example.net/cert.pem", event: bounce("fine@example.com") })), [401, true]);
  is("is not even fetched", fetched, []);
  is("an announcement two hours old", await refused(announce({ Timestamp: new Date(Date.now() - 2 * 3_600_000).toISOString(), event: bounce("fine@example.com") })), [401, true]);
  const twice = announce({ MessageId: "sns-same", event: bounce("fine@example.com") });
  const body = await twice.clone().text();
  await POST(twice);
  const repeat = new NextRequest("https://marktmorgen.com/api/mail/ses", { method: "POST", headers: { host: "marktmorgen.com", "content-length": String(Buffer.byteLength(body)) }, body });
  is("the same announcement again is acted on once", [await (await POST(repeat)).json(), (await listHealth(healthId(store))).bounced], [{ ok: true }, 2]);

  part("Amazon asks whether we want the topic's announcements");
  fetched.length = 0;
  const link = `https://sns.${REGION}.amazonaws.com/?Action=ConfirmSubscription&TopicArn=${encodeURIComponent(TOPIC)}&Token=abc`;
  const yes = await POST(announce({ Type: "SubscriptionConfirmation", Token: "abc", SubscribeURL: link, Message: "You have chosen to subscribe" }));
  is("answered yes, by opening Amazon's own link", [yes.status, (await yes.json()).result, fetched.includes(link)], [200, "confirmed", true]);
  fetched.length = 0;
  const elsewhere = await POST(announce({ Type: "SubscriptionConfirmation", Token: "abc", SubscribeURL: "https://example.net/confirm", Message: "You have chosen to subscribe" }));
  is("a link anywhere else is not opened", [elsewhere.status, fetched.filter((u) => u.includes("example.net"))], [400, []]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
