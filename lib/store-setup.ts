/**
 * Keeping what a creator chose from the AI's first draft of their store
 * (lib/ai.ts, writeStoreSetup; added 10 October 2026). The line goes under
 * the name; the questions go onto the page only when it has none yet; each
 * product is put up as a draft — never on sale until the creator adds what
 * it hands over and publishes it. A membership is made monthly; a course or
 * a call starts as a draft the creator turns into one from its own editor.
 */
import { MAX_BIO_LENGTH, type Store, addProduct, setFaq, updateDetails } from "@/lib/store";
import { parseFaq } from "@/lib/store-faq";

export type SetupKept = { bio: boolean; products: number; faq: boolean; refused: string[] };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

export async function keepStoreSetup(ref: string, store: Store, body: Record<string, unknown>): Promise<SetupKept> {
  const done: SetupKept = { bio: false, products: 0, faq: false, refused: [] };
  const bio = text(body.bio, MAX_BIO_LENGTH * 2).trim().slice(0, MAX_BIO_LENGTH);
  if (bio) done.bio = (await updateDetails(ref, store.name, bio)).ok;
  for (const raw of Array.isArray(body.products) ? body.products.slice(0, 3) : []) {
    const p = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const title = text(p.title, 120);
    if (!title.trim()) continue;
    const membership = p.kind === "membership";
    const made = await addProduct(ref, title, text(p.summary, 200), text(p.price, 20), membership ? { interval: "month", trialDays: 0, payments: 0 } : null, null, true);
    if (!made.ok) {
      done.refused.push(title.trim());
      continue;
    }
    done.products += 1;
  }
  const faq = parseFaq(body.faq);
  if (faq.length && store.faq.length === 0) done.faq = Boolean(await setFaq(ref, faq));
  return done;
}
