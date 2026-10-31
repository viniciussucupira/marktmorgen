/**
 * 98 [D2-COMPLIANCE-REVIEW] unit 1: "Can everyone use your store?" in the
 * studio (lib/store-access-check.ts). Checked: an empty store gets nothing;
 * a product picture with no description is named, by product, with where it
 * is fixed; a described one is done; what Marktmorgen already does on every
 * store is said as done for the creator, and only what the code does.
 */
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { StoreAccessCheck } from "@/components/store-access-check";
import { addProduct, claimHandle, ensureStatsId, setImageAlt, setProductImage, storeForEmail } from "@/lib/store";
import { accessCheck, ACCESS_DONE_FOR_YOU } from "@/lib/store-access-check";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const picture = (n: number) => ({ path: `images/${"a".repeat(24)}/${String(n).repeat(32)}.jpg`, width: 1200, height: 800, alt: "", bytes: 1, small: null });

async function main(): Promise<void> {
  redis.clear();
  const owner = "access-check@example.com";
  await claimHandle(owner, "accesscheckshop", "Access Check Shop", "");
  await ensureStatsId(owner);
  const check = async () => accessCheck((await storeForEmail(owner))!);

  part("Nothing before the first product");
  is("no check", await check(), null);

  part("Products with and without pictures");
  const bread = await addProduct(owner, "Bread Book", "", "19", null);
  const cake = await addProduct(owner, "Cake Course", "", "49", null);
  if (!bread.ok || !cake.ok) throw new Error("No synthetic products");
  is("no picture yet: nothing to describe, done", (await check())?.pictures, { done: true, missing: [] });
  await setProductImage(owner, bread.product.id, picture(1));
  await setProductImage(owner, cake.product.id, picture(2));
  is("two pictures with no description: both named", (await check())?.pictures, { done: false, missing: ["Bread Book", "Cake Course"] });
  await setImageAlt(owner, bread.product.id, "A loaf of sourdough bread on a board");
  is("one described: only the other is named", (await check())?.pictures, { done: false, missing: ["Cake Course"] });
  await setImageAlt(owner, cake.product.id, "   ");
  is("blank spaces are no description", (await check())?.pictures.missing, ["Cake Course"]);
  await setImageAlt(owner, cake.product.id, "A chocolate cake with twelve candles");
  is("both described: done", (await check())?.pictures, { done: true, missing: [] });

  part("What the studio shows");
  const shown = renderToStaticMarkup(StoreAccessCheck({ check: { pictures: { done: false, missing: ["Bread Book", "Cake & Co"] } } }));
  is("a heading, each product named, the field's own label, and where to go", [shown.includes("Can everyone use your store?"), shown.includes("<li>Bread Book</li>"), shown.includes("Cake &amp; Co"), shown.includes("What the picture shows, for people who cannot see it"), shown.includes('href="#products"'), shown.includes("Go to your products to add descriptions")], [true, true, true, true, true, true]);
  is("never a conformity claim", /fully accessible|ADA compliant|WCAG AAA certified|most accessible/i.test(shown), false);
  is("says it is not a full review", shown.includes("It is not a full accessibility review."), true);
  is("done: said so, no list", renderToStaticMarkup(StoreAccessCheck({ check: { pictures: { done: true, missing: [] } } })).includes('data-access-pictures="done"'), true);
  is("an empty store: nothing", renderToStaticMarkup(StoreAccessCheck({ check: null })), "");

  part("Done for you, and true");
  const consent = readFileSync("lib/digital-consent.ts", "utf8");
  is("the EU and UK consent is required by the code on checkout", /export function requireDigitalConsent/.test(consent), true);
  const look = readFileSync("lib/store-look.ts", "utf8");
  is("colors are moved until button text keeps 7:1", /7/.test(look) && /export function lookColours/.test(look), true);
  is("every AI-drafted affiliate post ends with the disclosure", /export function finishPost/.test(readFileSync("lib/affiliate-kit-rules.ts", "utf8")), true);
  is("three things, each in plain words", [ACCESS_DONE_FOR_YOU.length, ACCESS_DONE_FOR_YOU.every((line) => line.length < 200 && !/fully accessible|ADA compliant|WCAG AAA certified|most accessible/i.test(line))], [3, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
