import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "This link has ended — Marktmorgen", robots: { index: false, follow: false } };

/** Where a short link that was ended, or never was, sends the person (app/l/[code]/route.ts). */
export default function LinkEndedPage() {
  return (
    <main id="content" className="mx-auto max-w-xl px-4 py-16 sm:py-24">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">This link has ended</h1>
        <p className="mt-3 text-ink-soft">The creator who shared it took it back, or it was typed with a letter missing. Check the link in the post, or ask them for a new one.</p>
        <p className="mt-6">
          <Link href="/" className="btn btn-secondary">Go to Marktmorgen</Link>
        </p>
      </div>
    </main>
  );
}
