import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normaliseHandle, storeForPage } from "@/lib/store";
import { lookStyle } from "@/lib/store-look";
import { speech } from "@/lib/buyer-words";
import { formWords } from "@/lib/buyer-words/form";
import { funnelWords } from "@/lib/buyer-words/funnel";
import { readForm } from "@/lib/form-store";
import { readListing } from "@/lib/catalog";
import { productPath } from "@/components/store-product";
import { funnelMark } from "@/lib/page-funnel";
import { funnelHere } from "@/lib/page-funnel-store";
import { PlainText } from "@/components/sales-blocks";

type Params = {
  params: Promise<{ handle: string; form: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const pick = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);
  const store = decoded.startsWith("@") ? await storeForPage(normaliseHandle(decoded)).catch(() => null) : null;
  return { title: `${formWords(store?.language).doneHeading} — ${store?.name ?? "Marktmorgen"}`, robots: { index: false, follow: false } };
}

/**
 * After a form is sent (app/api/store/form): the quiz's result when it has
 * one, with the creator's product for it, or the form's own thank-you; that
 * the list's email is on its way when they asked for it; and, on a step of a
 * funnel, the way on to the next one. Nothing here is personal: the result
 * is named in the address, and anyone who opens it sees what a quiz says
 * for that result, nothing of anybody's answers.
 */
export default async function FormDonePage({ params, searchParams }: Params) {
  const { handle, form: formId } = await params;
  const query = await searchParams;
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) notFound();
  const store = await storeForPage(normaliseHandle(decoded));
  if (!store || store.suspended) notFound();
  const form = await readForm(store.statsId, formId).catch(() => null);
  if (!form) notFound();
  const w = formWords(store.language);
  const { lang } = speech(store);
  const outcome = form.outcomes.find((o) => o.id === pick(query.r)) ?? null;
  const product = outcome?.product ? await readListing(store, outcome.product).catch(() => null) : null;
  const shown = product && !product.hidden ? product : null;
  const page = store.sitePages.find((p) => p.id === pick(query.p)) ?? null;
  const here = page ? await funnelHere(store, funnelMark(pick(query.f)), "page", page.id).catch(() => null) : null;

  return (
    <div lang={lang.locale} className={`st-page st-theme-${store.look.theme} relative min-h-screen overflow-hidden`} style={lookStyle(store.look) as React.CSSProperties}>
      <main id="content" className="relative mx-auto max-w-xl px-4 py-16" data-form-done={form.id}>
        <div className="st-card p-7 sm:p-10">
          {outcome ? (
            <>
              <p className="st-price text-sm">{w.result}</p>
              <h1 className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{outcome.title}</h1>
              {outcome.body ? <PlainText text={outcome.body} className="st-muted mt-4 text-lg" /> : null}
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{form.doneHeading || w.doneHeading}</h1>
              {form.doneBody ? <PlainText text={form.doneBody} className="st-muted mt-4 text-lg" /> : <p className="st-muted mt-4 text-lg">{w.doneBody(store.name)}</p>}
            </>
          )}
          {pick(query.j) === "1" ? <p className="notice notice-success mt-6 text-sm">{w.confirmSent}</p> : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {here?.next ? (
              <Link href={here.next} className="btn st-btn btn-lg">
                {funnelWords(store.language).next}
              </Link>
            ) : shown ? (
              <Link href={productPath(store, shown)} className="btn st-btn btn-lg">
                {`${w.seeProduct}: ${shown.title}`}
              </Link>
            ) : null}
            {here?.next && shown ? (
              <Link href={productPath(store, shown)} className="st-footer-link text-sm font-semibold">
                {`${w.seeProduct}: ${shown.title}`}
              </Link>
            ) : null}
            <Link href={`/@${store.handle}`} className="st-footer-link text-sm font-semibold">
              {w.backTo(store.name)}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
