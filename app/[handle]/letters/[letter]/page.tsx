import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { normaliseHandle, storeForPage } from "@/lib/store";
import { storeRoot } from "@/lib/store-sitemap";
import { speech } from "@/lib/buyer-words";
import { letterWords } from "@/lib/buyer-words/letters";
import { lookStyle } from "@/lib/store-look";
import { isResting } from "@/lib/traffic";
import { StoreResting } from "@/components/store-resting";
import { StoreTracking } from "@/components/store-tracking";
import { bodyHtml } from "@/lib/mail-body";
import { readLetter } from "@/lib/letters";

type Params = { params: Promise<{ handle: string; letter: string }> };

const load = cache(async (raw: string, id: string) => {
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith("@")) return null;
  const store = await storeForPage(normaliseHandle(decoded));
  if (!store || store.suspended) return null;
  const letter = await readLetter(store, id);
  return letter ? { store, letter } : null;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle, letter: id } = await params;
  const found = await load(handle, id);
  if (!found) return { title: "Not found — Marktmorgen" };
  const { store, letter } = found;
  return { title: `${letter.subject} — ${store.name}`, alternates: { canonical: `${storeRoot(store)}/letters/${letter.id}` } };
}

/**
 * One email a store published (lib/letter-rules.ts): its subject and words
 * as they were sent, drawn the way the email drew them, with its links as
 * the creator typed them.
 */
export default async function LetterPage({ params }: Params) {
  const { handle, letter: id } = await params;
  const found = await load(handle, id);
  if (!found) notFound();
  const { store, letter } = found;
  if (await isResting(store)) return <StoreResting store={store} />;
  const say = speech(store);
  const w = letterWords(store.language);
  const date = new Intl.DateTimeFormat(say.lang.locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const sent = new Date(letter.sentAt);
  return (
    <div lang={say.lang.locale} className={`st-page st-theme-${store.look.theme} relative min-h-screen`} style={lookStyle(store.look) as React.CSSProperties}>
      <main id="content" className="relative mx-auto max-w-2xl px-4 pb-16 pt-10 sm:pt-14">
        <article>
          <p className="st-muted text-sm">
            <time dateTime={sent.toISOString()}>{w.sentOn(date.format(sent))}</time>
            {` · ${store.name}`}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl [overflow-wrap:anywhere]">{letter.subject}</h1>
          {/* The email's own drawing (lib/mail-body.ts): every word escaped, only its headings, lists, links, buttons and pictures. */}
          <div className="mt-6 rounded-2xl bg-white p-6 text-[15px] leading-relaxed text-stone-900 [overflow-wrap:anywhere] sm:p-8" dangerouslySetInnerHTML={{ __html: bodyHtml(letter.body, undefined, store.look.accent) }} />
        </article>
        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href={`/@${store.handle}/letters`} className="st-footer-link text-sm font-semibold">
            {w.all}
          </Link>
          <Link href={`/@${store.handle}`} className="st-footer-link text-sm font-semibold">
            {w.visit(store.name)}
          </Link>
        </div>
        <StoreTracking store={store} presence />
      </main>
    </div>
  );
}
