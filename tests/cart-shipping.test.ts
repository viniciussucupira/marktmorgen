/**
 * Physical products in the cart, the rules (513 [PF1], unit 1;
 * lib/cart-shipping.ts; added 1 November 2026). Checked: digital only ships
 * nothing; the address countries are the ones every physical product shares;
 * shipping is each product's own amount added together; when nothing is
 * shared, the products to take out are named, never all of them.
 */
import { cartShipping, type CartItem } from "@/lib/cart-shipping";
import { done, is, part } from "./check";

const digital = (id: string): CartItem => ({ id, title: `Guide ${id}`, shipping: null });
const shipped = (id: string, countries: string[], cents = 500): CartItem => ({ id, title: `Box ${id}`, shipping: { countries, cents } });

function main(): void {
  part("What ships, and where");
  is("digital only: nothing ships", cartShipping([digital("a"), digital("b")]), { kind: "none" });
  is("one physical with digital: its own countries and amount", cartShipping([digital("a"), shipped("b", ["US", "CA"], 700)]), { kind: "ships", countries: ["US", "CA"], cents: 700 });
  is("two physical: only the countries both ship to, amounts added", cartShipping([shipped("a", ["US", "CA", "GB"], 500), shipped("b", ["GB", "US"], 300)]), { kind: "ships", countries: ["US", "GB"], cents: 800 });
  is("free shipping counts as nothing", cartShipping([shipped("a", ["US"], 0), shipped("b", ["US"], 450)]), { kind: "ships", countries: ["US"], cents: 450 });
  is("a bad amount never lowers the total", cartShipping([shipped("a", ["US"], -100), shipped("b", ["US"], 450)]).kind === "ships" && (cartShipping([shipped("a", ["US"], -100), shipped("b", ["US"], 450)]) as { cents: number }).cents, 450);

  part("When nothing is shared");
  is("the one that goes elsewhere is named", cartShipping([shipped("a", ["US"]), shipped("b", ["US", "CA"]), shipped("c", ["DE"])]), { kind: "apart", apart: [{ id: "c", title: "Box c" }] });
  is("two apart from the rest: both named", cartShipping([shipped("a", ["US"]), shipped("b", ["US"]), shipped("c", ["DE"]), shipped("d", ["FR"])]), { kind: "apart", apart: [{ id: "c", title: "Box c" }, { id: "d", title: "Box d" }] });
  is("each alone: all but the first named, never all", cartShipping([shipped("a", ["US"]), shipped("b", ["DE"]), shipped("c", ["FR"])]), { kind: "apart", apart: [{ id: "b", title: "Box b" }, { id: "c", title: "Box c" }] });
  is("digital products are never named", cartShipping([digital("x"), shipped("a", ["US"]), shipped("c", ["DE"])]).kind === "apart" && !JSON.stringify(cartShipping([digital("x"), shipped("a", ["US"]), shipped("c", ["DE"])])).includes('"x"'), true);
}

main();
done();
