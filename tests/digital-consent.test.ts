/**
 * The buyer's yes before digital content is handed over at once (queue item
 * 91 [D2-EU-WITHDRAWAL], lib/digital-consent.ts). The creator's Stripe
 * account is played by a stand-in for `fetch`; nothing real is reached.
 * What is checked, so each fails when it stops being true:
 *
 *   - the sentence holds both things the law asks for, in every language,
 *     and its version moves with its words (the fingerprint);
 *   - the box is a real checkbox, never checked for the buyer, required, with
 *     its label, its note tied by aria-describedby and its error said in text;
 *   - only the checked box with today's version is a yes: a forged form, an
 *     old page or a value other than "yes" opens nothing;
 *   - a checkout for something digital is refused before Stripe is reached
 *     without it, for one product, a cart, an offer by email and PayPal; a
 *     product shipped with nothing digital is not asked;
 *   - with it, "yes", the version and the time are kept on the order and on
 *     the payment, and the confirmation email quotes the sentence;
 *   - the routes send the buyer back to the box, nothing charged;
 *   - every page that pays for something digital draws the box, the offers
 *     after paying ask on their own button, and the policies say so.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
import { addProduct, claimHandle, ensureStatsId, setProductLink, setProductShipping, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readProduct } from "@/lib/catalog";
import { createCheckout } from "@/lib/store-checkout";
import { confirmationFor } from "@/lib/purchase-email";
import { createCartCheckout } from "@/lib/cart-checkout";
import { parseShipping } from "@/lib/shipping";
import {
  CONSENT_FIELD,
  CONSENT_META,
  CONSENT_VERSION_FIELD,
  CONSENT_WORDS_FINGERPRINT,
  DigitalConsentMissing,
  EU_WITHDRAWAL_CONSENT_VERSION,
  consentFromForm,
  consentMetaValue,
  deliversDigitally,
  readConsentMeta,
} from "@/lib/digital-consent";
import { DIGITAL_CONSENT_WORDS } from "@/lib/buyer-words/digital-consent";
import { consentEmailLines } from "@/lib/digital-consent-email";
import { DigitalConsentBox } from "@/components/digital-consent-box";
import { POST as checkoutRoute } from "@/app/api/store/checkout/route";
import { POST as cartRoute } from "@/app/api/store/cart/route";
import { HELP_SECTIONS } from "@/lib/help-content";
import { PERSON_DATA } from "@/lib/person-data";
import { TEST_CONSENT, withConsent } from "./digital-consent-fixture";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

process.env.STRIPE_SECRET_KEY = "sk_test_digital_consent_only";

const sessions: URLSearchParams[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  const method = init?.method ?? "GET";
  if (path === "/checkout/sessions" && method === "POST") {
    sessions.push(new URLSearchParams(String(init?.body)));
    return new Response(JSON.stringify({ id: `cs_test_${"d".repeat(24)}`, url: "https://checkout.stripe.com/c/pay/test" }));
  }
  return new Response(JSON.stringify({ error: { message: `no stand-in for ${method} ${path}` } }), { status: 404 });
}) as typeof fetch;

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

async function refusedWith<T>(open: () => Promise<T>): Promise<string> {
  try {
    await open();
    return "opened";
  } catch (error) {
    return error instanceof DigitalConsentMissing ? "refused for want of the yes" : `other: ${String(error)}`;
  }
}

async function main(): Promise<void> {
  redis.clear();

  part("The words: both things the law asks for, and a version tied to them");
  const order = ["en", "es", "fr", "de", "it", "nl", "pt"] as const;
  is("every language a store speaks", Object.keys(DIGITAL_CONSENT_WORDS), [...order]);
  const fingerprint = createHash("sha256").update(order.map((lang) => DIGITAL_CONSENT_WORDS[lang].box).join("\n")).digest("hex");
  is("the words have not changed without a new version (bump EU_WITHDRAWAL_CONSENT_VERSION and CONSENT_WORDS_FINGERPRINT together)", fingerprint, CONSENT_WORDS_FINGERPRINT);
  const right: Record<(typeof order)[number], RegExp> = {
    en: /right to cancel/,
    es: /derecho de desistimiento/,
    fr: /droit de rétractation/,
    de: /Widerrufsrecht/,
    it: /diritto di recesso/,
    nl: /herroepingsrecht/,
    pt: /direito de livre resolução/,
  };
  is(
    "each says it wants access at once, that the right is lost once access starts, and the 14 days",
    order.map((lang) => [right[lang].test(DIGITAL_CONSENT_WORDS[lang].box), /14/.test(DIGITAL_CONSENT_WORDS[lang].box), DIGITAL_CONSENT_WORDS[lang].box.length < 200]),
    order.map(() => [true, true, true]),
  );
  is("the English is plain: it says who has the right, and that paying needs the box", [/where they live/.test(DIGITAL_CONSENT_WORDS.en.note), /check this box to pay/.test(DIGITAL_CONSENT_WORDS.en.note)], [true, true]);
  is("never told it is fully compliant", order.some((lang) => /compliant|conforme|konform/i.test(JSON.stringify(DIGITAL_CONSENT_WORDS[lang]))), false);

  part("The box");
  const box = renderToStaticMarkup(DigitalConsentBox({ id: "dc-t", lang: "en" }));
  is("a real checkbox with its name and value, required", [/<input[^>]*type="checkbox"/.test(box), box.includes(`name="${CONSENT_FIELD}"`), box.includes('value="yes"'), /<input[^>]*required=""/.test(box)], [true, true, true, true]);
  is("never checked for the buyer", /checked/.test(box), false);
  is("its visible label holds the sentence", /<label for="dc-t"[^>]*>[\s\S]*I want access as soon as it is available/.test(box), true);
  is("a target at least 44 px high", /<label[^>]*class="[^"]*min-h-11/.test(box), true);
  is("the note is tied to it", [box.includes('aria-describedby="dc-t-note"'), box.includes('id="dc-t-note"')], [true, true]);
  is("the version the page shows travels with it", box.includes(`name="${CONSENT_VERSION_FIELD}" value="${EU_WITHDRAWAL_CONSENT_VERSION}"`), true);
  const again = renderToStaticMarkup(DigitalConsentBox({ id: "dc-t", lang: "en", refused: true }));
  is(
    "refused: said in text, announced, tied to the box, and the box marked",
    [again.includes('role="alert"'), again.includes(DIGITAL_CONSENT_WORDS.en.needed), again.includes('aria-describedby="dc-t-error dc-t-note"'), again.includes('aria-invalid="true"')],
    [true, true, true, true],
  );
  is("in the store's language", renderToStaticMarkup(DigitalConsentBox({ id: "x", lang: "de" })).includes("Widerrufsrecht"), true);

  part("Only the checked box with today's version is a yes");
  const form = (pairs: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(pairs)) f.set(k, v);
    return f;
  };
  is("nothing sent: no yes", consentFromForm(form({})), null);
  is("the version without the box: no yes", consentFromForm(form({ [CONSENT_VERSION_FIELD]: EU_WITHDRAWAL_CONSENT_VERSION })), null);
  is("the box without the version (a forged form): no yes", consentFromForm(form({ [CONSENT_FIELD]: "yes" })), null);
  is("a page from before the words changed: no yes", consentFromForm(form({ [CONSENT_FIELD]: "yes", [CONSENT_VERSION_FIELD]: "2020-01-01.1" })), null);
  is("a value other than yes: no yes", consentFromForm(form({ [CONSENT_FIELD]: "on", [CONSENT_VERSION_FIELD]: EU_WITHDRAWAL_CONSENT_VERSION })), null);
  is("checked, today's version: a yes with the time", consentFromForm(withConsent(new FormData()), 1_790_000_123), { version: EU_WITHDRAWAL_CONSENT_VERSION, at: 1_790_000_123 });
  is("kept as yes, version and time, read back the same", readConsentMeta({ [CONSENT_META]: consentMetaValue(TEST_CONSENT) }), TEST_CONSENT);
  is("a value this code did not write is no yes", [readConsentMeta({ dc: "yes" }), readConsentMeta({ dc: "no:2026-10-30.1:1790000000" }), readConsentMeta({})], [null, null, null]);
  is("within Stripe's 500 characters", consentMetaValue(TEST_CONSENT).length <= 40, true);

  part("What is handed over digitally");
  const file = { file: { name: "a.pdf" }, link: null, options: [] };
  is("a file, a link, a course, a podcast, a bundle, a membership", [
    deliversDigitally(file),
    deliversDigitally({ file: null, link: "https://example.com", options: [] }),
    deliversDigitally({ course: { lessons: 3 }, options: [] }),
    deliversDigitally({ podcast: { episodes: 1 }, options: [] }),
    deliversDigitally({ bundle: ["a", "b"], options: [] }),
    deliversDigitally({ recurring: { interval: "month" }, options: [] }),
  ], [true, true, true, true, true, true]);
  is("a product shipped with nothing digital is not", deliversDigitally({ shipping: { cents: 600 }, file: null, link: null, options: [{ id: "o1", file: null, link: null }] }), false);
  is("a booked call (a service) is not", deliversDigitally({ call: { kind: "one" } }), false);

  part("The checkout refuses before Stripe is reached, without the yes");
  const owner = "consent@example.com";
  await claimHandle(owner, "consentshop", "Consent Shop", "");
  await ensureStatsId(owner);
  await setStripeAccount(owner, "acct_1TestConsent001", true);
  await setSubscription(owner, { customerId: "cus_Consent0001", subscriptionId: "sub_Consent0001", active: true, period: paidPeriod() });
  const pdf = await addProduct(owner, "Recipe pack", "", "27", null);
  const guide = await addProduct(owner, "Pantry guide", "", "12", null);
  const book = await addProduct(owner, "Printed cookbook", "", "35", null);
  if (!pdf.ok || !guide.ok || !book.ok) throw new Error("no products");
  await setProductLink(owner, pdf.product.id, "https://example.com/pack");
  await setProductLink(owner, guide.product.id, "https://example.com/guide");
  const shipped = await setProductShipping(owner, book.product.id, parseShipping({ cents: 600, region: "na", note: "" })!);
  is("a physical product is set up", shipped.ok, true);
  let store = (await storeForEmail(owner))!;
  const digital = (await readProduct(store, pdf.product.id))!;
  const second = (await readProduct(store, guide.product.id))!;
  const physical = (await readProduct(store, book.product.id))!;
  const origin = "https://marktmorgen.com";

  is("one product, no yes: refused", await refusedWith(() => createCheckout(store, digital, origin)), "refused for want of the yes");
  is("a yes of another version: refused", await refusedWith(() => createCheckout(store, digital, origin, undefined, { digitalConsent: { ...TEST_CONSENT, version: "2020-01-01.1" } })), "refused for want of the yes");
  is("a yes with no real time: refused", await refusedWith(() => createCheckout(store, digital, origin, undefined, { digitalConsent: { ...TEST_CONSENT, at: 0 } })), "refused for want of the yes");
  is("a gift, no yes: refused", await refusedWith(() => createCheckout(store, digital, origin, undefined, { gift: "g".repeat(16) })), "refused for want of the yes");
  is("a cart, no yes: refused", await refusedWith(() => createCartCheckout(store, [digital, second], origin)), "refused for want of the yes");
  is("none of those reached Stripe", sessions.length, 0);

  part("With the yes: kept on the order and on the payment");
  await createCheckout(store, digital, origin, undefined, { digitalConsent: TEST_CONSENT });
  const one = sessions.at(-1)!;
  is("on the order and on its payment, as yes, version and time", [one.get(`metadata[${CONSENT_META}]`), one.get(`payment_intent_data[metadata][${CONSENT_META}]`)], [consentMetaValue(TEST_CONSENT), consentMetaValue(TEST_CONSENT)]);
  await createCartCheckout(store, [digital, second], origin, { digitalConsent: TEST_CONSENT });
  const cart = sessions.at(-1)!;
  is("a cart keeps it the same way", [cart.get(`metadata[${CONSENT_META}]`), cart.get(`payment_intent_data[metadata][${CONSENT_META}]`)], [consentMetaValue(TEST_CONSENT), consentMetaValue(TEST_CONSENT)]);

  part("A product shipped with nothing digital is not asked");
  const before = sessions.length;
  await createCheckout(store, physical, origin);
  is("it opens without the box", sessions.length, before + 1);
  is("and keeps no yes it was not given", sessions.at(-1)!.get(`metadata[${CONSENT_META}]`), null);

  part("The confirmation email, the durable medium");
  const settled = (meta: Record<string, string>) => ({
    id: `cs_test_${"e".repeat(24)}`,
    status: "complete",
    payment_status: "paid",
    created: Math.floor(Date.now() / 1000),
    amount_total: 2700,
    currency: "usd",
    customer_details: { email: "buyer@example.com" },
    metadata: { store: store.handle, product: digital.id, ...meta },
  });
  const letter = confirmationFor(store, settled({ [CONSENT_META]: consentMetaValue(TEST_CONSENT) }), Date.now() / 1000, [], [digital]);
  is("quotes the sentence, its version, and that the right ended when access started", [letter?.text.includes(DIGITAL_CONSENT_WORDS.en.box), letter?.text.includes(`wording ${EU_WITHDRAWAL_CONSENT_VERSION}`), letter?.text.includes("ended then")], [true, true, true]);
  is("and the day it was given", letter?.text.includes(new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(TEST_CONSENT.at * 1000)), true);
  const without = confirmationFor(store, settled({}), Date.now() / 1000, [], [digital]);
  is("an order with no yes says nothing of one", without?.text.includes("right to cancel"), false);
  is("the line in the store's language", consentEmailLines({ language: "fr", currency: "eur" }, { [CONSENT_META]: consentMetaValue(TEST_CONSENT) }).join(" ").includes("droit de rétractation"), true);
  for (const [file, pattern] of [
    ["lib/purchase-email.ts", /consentEmailLines\(store, meta\)/],
    ["lib/purchase-email.ts", /consentEmailLines\(store, offer\.metadata\)/],
    ["lib/gifts.ts", /consentEmailLines\(store, session\.metadata\)/],
    ["lib/group-buy.ts", /consentEmailLines\(store, input\.session\?\.metadata\)/],
    ["lib/preorders.ts", /consentEmailLines\(store, session\.metadata\)/],
    ["lib/paypal-sales.ts", /consentEmailLines\(store, paid\.meta\)/],
  ] as const) {
    is(`${file} carries the line in its receipt`, pattern.test(read(file)), true);
  }

  part("The routes send the buyer back to the box, nothing charged");
  const post = (path: string, body: FormData) => new NextRequest(`https://marktmorgen.com${path}`, { method: "POST", body, headers: { host: "marktmorgen.com" } });
  const buy = (extra: (f: FormData) => FormData = (f) => f) => {
    const f = new FormData();
    f.set("handle", store.handle);
    f.set("product", digital.id);
    return extra(f);
  };
  let count = sessions.length;
  const noBox = await checkoutRoute(post("/api/store/checkout", buy()));
  is("no box: back to the product's buy box with the reason", [noBox.status, noBox.headers.get("location")], [303, `https://marktmorgen.com/@${store.handle}/p/${digital.id}?consent=needed#buy`]);
  const forged = await checkoutRoute(post("/api/store/checkout", buy((f) => (f.set(CONSENT_FIELD, "yes"), f))));
  is("a forged form with the box and no version: the same", forged.headers.get("location"), `https://marktmorgen.com/@${store.handle}/p/${digital.id}?consent=needed#buy`);
  const gift = await checkoutRoute(post("/api/store/checkout", buy((f) => (f.set("gift_to", "friend@example.com"), f))));
  is("a gift: back to the gift's box, nothing written down", gift.headers.get("location"), `https://marktmorgen.com/@${store.handle}/p/${digital.id}?consent=needed&gift=consent#gift`);
  is("none of them reached Stripe", sessions.length, count);
  const checked = await checkoutRoute(post("/api/store/checkout", buy(withConsent)));
  is("the box checked: on to Stripe, with the yes kept", [checked.headers.get("location"), sessions.length, readConsentMeta(Object.fromEntries([...sessions.at(-1)!].filter(([k]) => k.startsWith("metadata[")).map(([k, v]) => [k.slice(9, -1), v])))?.version], ["https://checkout.stripe.com/c/pay/test", count + 1, EU_WITHDRAWAL_CONSENT_VERSION]);
  count = sessions.length;
  const cartForm = () => {
    const f = new FormData();
    f.set("handle", store.handle);
    f.append("id", digital.id);
    f.append("id", second.id);
    return f;
  };
  store = (await storeForEmail(owner))!;
  const cartNoBox = await cartRoute(post("/api/store/cart", cartForm()));
  is("a cart without the box: back to the cart, said there, nothing charged", [cartNoBox.headers.get("location"), sessions.length], [`https://marktmorgen.com/@${store.handle}?cart=consent#cart`, count]);
  const cartChecked = await cartRoute(post("/api/store/cart", withConsent(cartForm())));
  is("with it: on to Stripe", [cartChecked.headers.get("location"), sessions.length], ["https://checkout.stripe.com/c/pay/test", count + 1]);

  part("Every page that pays for something digital draws the box");
  for (const file of [
    "components/store-product.tsx",
    "components/pick-bundle-form.tsx",
    "components/store-cart.tsx",
    "app/[handle]/renew/[product]/page.tsx",
    "app/[handle]/course/[product]/page.tsx",
    "app/[handle]/free/page.tsx",
    "app/[handle]/move/[product]/page.tsx",
    "app/[handle]/thanks/page.tsx",
  ]) {
    is(`${file} draws it`, read(file).includes("<DigitalConsentBox"), true);
  }
  const product = read("components/store-product.tsx");
  is("the buy box, the gift, the group, the pre-order and PayPal on its own each have one", (product.match(/<DigitalConsentBox/g) ?? []).length, 5);
  is("PayPal beside the card checkout sends the same form, so the same box", /form=\{formId\} formAction="\/api\/store\/paypal\/checkout"/.test(product), true);
  is("a sales page's button for something digital leads to the buy box", /direct \? \{ kind: "checkout"[^}]*\} : \{ kind: "link", href: "#buy" \}/.test(product), true);
  const thanks = read("app/[handle]/thanks/page.tsx");
  is("each offer after paying asks on its own button, and No thanks never needs it", [/dc-offer-\$\{offer\.step\.id\}/.test(thanks), /value="no"\s+formNoValidate/.test(thanks)], [true, true]);
  is("the offer's route reads the box only with a yes", /consent: answer === "yes" \? consent : null/.test(read("app/api/store/upsell/route.ts")), true);
  for (const file of ["app/api/store/welcome/open/route.ts", "app/api/store/come-back/open/route.ts", "app/api/store/move/open/route.ts", "app/api/store/paypal/checkout/route.ts"]) {
    is(`${file} reads the box and passes it on`, /consentFromForm\(form\)/.test(read(file)), true);
  }

  part("The policies, the help and the record of what is kept say so");
  is("Terms", /id="instant-access"[\s\S]*14 days[\s\S]*Each one-click offer after\s+paying asks again/.test(read("app/terms/page.tsx")), true);
  is("Refund policy", /lose a 14-day right to cancel once it starts/.test(read("app/refunds/page.tsx")), true);
  is("Privacy", /id="instant-access"[\s\S]*no new detail about you, no cookie and\s+no tracking/.test(read("app/privacy/page.tsx")), true);
  is("Help", HELP_SECTIONS.some((section) => section.items.some((item) => /check a box about access/.test(item.q))), true);
  is("What is kept about a person", PERSON_DATA.some((entry) => entry.file === "lib/stripe-account.ts" && /start access at once/.test(entry.what)), true);
  is("no page claims full compliance", ["app/terms/page.tsx", "app/refunds/page.tsx", "app/privacy/page.tsx"].some((file) => /fully compliant/i.test(read(file))), false);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
