import type { NextRequest } from "next/server";
import { setKit, storeForEmail } from "@/lib/store";
import { guardStoreWrite } from "@/lib/store-request";
import { readMoney } from "@/lib/money";
import { MAX_KIT_COUNT, MAX_KIT_RATES } from "@/lib/store-kit";
import { readVerified, refreshVerified, usesVerified } from "@/lib/verified-numbers";

/** A count as typed: "12400", "12,400" or "12.4k" are all the same number. */
function readCount(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isSafeInteger(raw) && raw >= 0 && raw <= MAX_KIT_COUNT ? raw : null;
  if (typeof raw !== "string") return null;
  const text = raw.trim().toLowerCase().replace(/[\s,_']/g, "");
  if (!text) return 0;
  const match = text.match(/^(\d+(?:\.\d+)?)([km])?$/);
  if (!match) return null;
  const value = Math.round(Number(match[1]) * (match[2] === "k" ? 1_000 : match[2] === "m" ? 1_000_000 : 1));
  return Number.isSafeInteger(value) && value <= MAX_KIT_COUNT ? value : null;
}

/**
 * Saves the media kit (lib/store-kit.ts): `{ on, pitch, audience: [{ n,
 * count, views }], facts, rates: [{ t, price }], brands }`, the counts and
 * prices as typed. A count or a price that is not one is refused by where it
 * is, rather than dropped or guessed at. Part of the page.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", 20_000);
  if (!guarded.ok) return guarded.response;
  const { ref, body } = guarded;
  try {
    const store = await storeForEmail(ref);
    if (!store) return Response.json({ ok: false, error: "none" }, { status: 404 });
    const bad: string[] = [];
    const audience = (Array.isArray(body.audience) ? body.audience.slice(0, 20) : []).map((row, i) => {
      const value = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const count = readCount(value.count);
      const views = readCount(value.views ?? "");
      if (count === null) bad.push(`count${i}`);
      if (views === null) bad.push(`views${i}`);
      return { n: value.n, count: count ?? 0, views: views ?? 0 };
    });
    const rates = (Array.isArray(body.rates) ? body.rates.slice(0, MAX_KIT_RATES + 4) : []).map((row, i) => {
      const value = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const typed = typeof value.price === "string" ? value.price.trim().replace(/[\s,]/g, "") : "";
      const cents = typed ? readMoney(typed, store.currency) : null;
      if (typed && (cents === null || cents <= 0 || cents > 100_000_000)) bad.push(`price${i}`);
      return { t: value.t, cents };
    });
    if (bad.length) return Response.json({ ok: false, error: "number", bad }, { status: 400 });
    const saved = await setKit(ref, { on: body.on === true, pitch: body.pitch, audience, facts: body.facts, rates, brands: body.brands, counted: body.counted });
    if (!saved) return Response.json({ ok: false, error: "none" }, { status: 404 });
    // Numbers this site counted, the first time any is shown: read now, then once a day (lib/verified-numbers.ts).
    if (usesVerified(saved) && !(await readVerified(saved).catch(() => null))) await refreshVerified(saved).catch((error) => console.error("reading the counted numbers failed", error));
    return Response.json({ ok: true, kit: saved.kit });
  } catch (error) {
    console.error("saving the media kit failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
