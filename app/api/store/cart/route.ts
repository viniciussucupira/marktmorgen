import { type NextRequest, after } from "next/server";
import { linkOrigin, originFrom } from "@/lib/request-origin";
import { normaliseHandle, storeForHandle } from "@/lib/store";
import { readListings, readProduct } from "@/lib/catalog";
import { canSell, canSellProduct } from "@/lib/store-checkout";
import { cartPrice, createCartCheckout } from "@/lib/cart-checkout";
import { MAX_CART, cartable, dealOff, readCartIds } from "@/lib/cart-rules";
import { readSoldCounts } from "@/lib/sold-count";
import { cartWords } from "@/lib/buyer-words/cart";
import type { Store } from "@/lib/store";
import { salePrice } from "@/lib/store-sale";
import { soonState } from "@/lib/preorders";
import { outOfKeys } from "@/lib/licence-keys";
import { readCountry } from "@/lib/fair-price";
import { formatMoney } from "@/lib/money";
import { LANGUAGES } from "@/lib/store-language";
import { cameFrom } from "@/lib/came-from";
import { channelOfRequest } from "@/lib/visit-channel";
import { affiliateCookieName, attributionFor } from "@/lib/affiliates";
import { viaCookieName } from "@/lib/affiliate-setting";
import { countHit } from "@/lib/visit";
import { clientAddress, fromAnotherSite, limited, withinLimit } from "@/lib/request-guard";
import { productSegment } from "@/lib/product-slug";

/**
 * What a cart holds, as the store has it now (`GET ?handle=&ids=a,b`): each
 * product's name, its address, what it is charged in this visitor's country
 * today, and whether it can still go in a cart. Read when the cart is opened,
 * so it never shows a price the checkout would not charge.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const handle = normaliseHandle((params.get("handle") ?? "").slice(0, 40));
  const ids = readCartIds((params.get("ids") ?? "").split(","));
  const store = handle ? await storeForHandle(handle) : null;
  if (!store) return Response.json({ ok: false, error: "unknown" }, { status: 404 });
  if (!(await withinLimit("cart-read", `${clientAddress(request)}|${store.handle}`, 120, 600))) {
    return Response.json({ ok: false, error: "slow" }, { status: 429 });
  }
  const country = readCountry(request.headers.get("x-vercel-ip-country"));
  const locale = LANGUAGES[store.language].locale;
  const [listings, coming] = await Promise.all([ids.length ? readListings(store, ids) : Promise.resolve([]), soonState(store).catch(() => ({ soon: new Set<string>() }))]);
  const selling = canSell(store);
  const items = ids.flatMap((id) => {
    const product = listings.find((p) => p.id === id);
    if (!product) return [];
    const { cents } = cartPrice(store, product, country);
    return [{ id, title: product.title, href: `/@${store.handle}/p/${productSegment(product)}`, cents, price: formatMoney(cents, store.currency, locale), ok: selling && cartable(product) && !coming.soon.has(id) }];
  });
  const payable = items.filter((item) => item.ok);
  const before = payable.reduce((sum, item) => sum + item.cents, 0);
  // The store's deal for buying more (lib/cart-rules.ts): taken off each line, as the checkout does.
  const deal = dealOff(store.cartDeal, payable.length);
  const total = payable.reduce((sum, item) => sum + salePrice(item.cents, deal), 0);
  const more = store.cartDeal.on && payable.length > 0 && payable.length < store.cartDeal.min ? store.cartDeal.min - payable.length : 0;
  // What the buyers of what is in the cart also bought (lib/also-bought.ts), on a
  // store that shows what was bought: up to two that could go in it too, most bought first.
  const suggest = await suggestions(store, payable.map((item) => ({ id: item.id, title: item.title })), ids, coming.soon, country, locale).catch(() => []);
  return Response.json(
    {
      ok: true,
      items,
      deal: deal > 0 ? { percent: deal, saved: formatMoney(before - total, store.currency, locale) } : null,
      next: more > 0 ? { more, percent: store.cartDeal.percent } : null,
      total: formatMoney(total, store.currency, locale),
      suggest,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

/** How many products the cart suggests at most. */
const MAX_SUGGEST = 2;

async function suggestions(
  store: Store,
  inCart: { id: string; title: string }[],
  ids: string[],
  soon: Set<string>,
  country: string,
  locale: string,
): Promise<{ id: string; title: string; href: string; price: string; why: string; count: number }[]> {
  if (inCart.length === 0 || ids.length >= MAX_CART || !canSell(store)) return [];
  const counts = await readSoldCounts(store);
  if (!counts) return [];
  // Each other product, with the most buyers it shares with anything in the cart.
  const best = new Map<string, { count: number; with: string }>();
  for (const item of inCart) {
    for (const [other, count] of counts.together[item.id] ?? []) {
      if (ids.includes(other) || soon.has(other)) continue;
      if ((best.get(other)?.count ?? 0) < count) best.set(other, { count, with: item.title });
    }
  }
  if (best.size === 0) return [];
  const ranked = [...best.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, MAX_SUGGEST * 3);
  const listed = await readListings(store, ranked.map(([id]) => id));
  const words = cartWords(store.language);
  const out: { id: string; title: string; href: string; price: string; why: string; count: number }[] = [];
  for (const [id, pair] of ranked) {
    const product = listed.find((p) => p.id === id);
    if (!product || !cartable(product) || !canSellProduct(store, product)) continue;
    if (product.keys && (await outOfKeys(store, product).catch(() => true))) continue;
    out.push({
      id,
      title: product.title,
      href: `/@${store.handle}/p/${productSegment(product)}`,
      price: formatMoney(cartPrice(store, product, country).cents, store.currency, locale),
      why: words.suggestWhy(pair.count, pair.with),
      count: pair.count,
    });
    if (out.length >= MAX_SUGGEST) break;
  }
  return out;
}

/**
 * Pays for a cart: a plain form with the store's handle and each product's
 * id (`id`, up to four). Nothing it sends sets a price. Every product is read
 * again and must still go in a cart: published, at one price, sold once,
 * nothing to choose, book, hold or answer first, not coming soon, with keys
 * left if it hands one out. Anything else sends the visitor back to the store
 * with the cart as it was, to look it over.
 */
export async function POST(request: NextRequest) {
  const origin = originFrom(request);
  if (fromAnotherSite(request)) return new Response("forbidden", { status: 403 });
  const away = (path: string) => new Response(null, { status: 303, headers: { Location: `${origin}${path}`, "Cache-Control": "no-store" } });

  let handle = "";
  let ids: string[] = [];
  try {
    const form = await (await limited(request, 4_000)).formData();
    const h = form.get("handle");
    handle = typeof h === "string" ? normaliseHandle(h.slice(0, 40)) : "";
    ids = readCartIds(form.getAll("id"));
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!handle || ids.length === 0) return new Response("Bad request", { status: 400 });
  const store = await storeForHandle(handle);
  if (!store) return new Response("No such store.", { status: 404 });
  if (!(await withinLimit("checkout", `${clientAddress(request)}|${store.handle}`, 20, 600))) return away(`/@${store.handle}?status=slow`);
  if (!canSell(store)) return away(`/@${store.handle}`);

  const products = (await Promise.all(ids.map((id) => readProduct(store, id).catch(() => null)))).filter((p) => p !== null);
  const coming = await soonState(store).catch(() => ({ soon: new Set<string>() }));
  const fit = products.length === ids.length && products.every((p) => cartable(p) && p.fields.length === 0 && !coming.soon.has(p.id));
  if (!fit) return away(`/@${store.handle}?cart=changed#cart`);
  for (const product of products) {
    if (await outOfKeys(store, product).catch(() => false)) return away(`/@${store.handle}?cart=changed#cart`);
  }

  try {
    const via = await attributionFor(store, products[0].id, {
      via: request.cookies.get(viaCookieName(store.handle))?.value,
      session: request.cookies.get(affiliateCookieName(store.handle))?.value,
    }).catch(() => null);
    const opened = await createCartCheckout(store, products, linkOrigin(request, store), {
      country: readCountry(request.headers.get("x-vercel-ip-country")),
      cameFrom: cameFrom(request.headers.get("referer"), new URL(origin).hostname),
        // The channel this sale is credited to: the page's own tags, else the
        // one remembered for this visitor (lib/visit-channel.ts), else direct.
        channel: channelOfRequest(request, store.handle, new URL(origin).hostname),
      via,
    });
    for (const product of products) after(() => countHit(request, store, { kind: "checkout", id: product.id }));
    return new Response(null, { status: 303, headers: { Location: opened.url, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("a cart's checkout failed", error);
    return away(`/@${store.handle}?cart=error#cart`);
  }
}
