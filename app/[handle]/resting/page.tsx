import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normaliseHandle, storeForPage } from "@/lib/store";
import { StoreResting } from "@/components/store-resting";
import { speech } from "@/lib/buyer-words";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const decoded = decodeURIComponent((await params).handle);
  const store = decoded.startsWith("@") ? await storeForPage(normaliseHandle(decoded)) : null;
  return { title: `${store ? speech(store).w.restingTitle : "Resting"} — Marktmorgen`, robots: { index: false, follow: false } };
}

/**
 * Where a buyer's own page sends them once the store has used the whole
 * month's visits (lib/traffic.ts, isResting with "buyer"): a course, a
 * lesson or the community. Says that their access is kept and when the page
 * opens again; nothing here is counted.
 */
export default async function RestingPage({ params }: Params) {
  const decoded = decodeURIComponent((await params).handle);
  if (!decoded.startsWith("@")) notFound();
  const store = await storeForPage(normaliseHandle(decoded));
  if (!store) notFound();
  return <StoreResting store={store} buyer />;
}
