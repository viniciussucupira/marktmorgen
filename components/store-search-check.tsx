import Link from "next/link";
import { Icon } from "@/components/icons";
import { type SearchCheck, SEARCH_DONE_FOR_YOU } from "@/lib/store-search-check";

/**
 * "Can people find your store?" in the studio (248 [ST1], lib/store-search-check.ts):
 * the store's search description, whether it is shown to search engines at
 * all, and the products on its first page with no summary, each with where
 * to fix it. It never changes the creator's words and promises no place in
 * search results.
 */
export function StoreSearchCheck({ check }: { check: SearchCheck }) {
  const { summaries } = check;
  return (
    <section aria-labelledby="search-check-title" className="card mt-8 p-6 sm:p-8">
      <h2 id="search-check-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Can people find your store?
      </h2>
      <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
        This checks what search engines like Google are given about your store and the products on its first page. It cannot say where you will show up in results; nobody can promise that.
      </p>

      {check.indexed ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-ink" data-search-indexed="yes">
          <Icon name="check" size={16} className="text-violet-deep" />
          Your store is open to search engines.
        </p>
      ) : (
        <p className="mt-5 max-w-[80ch] text-sm text-ink" data-search-indexed="no">
          Your store is kept out of search results until it has a product or a link on it, so an empty page is never what people find.
        </p>
      )}

      {check.description ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink" data-search-description="yes">
          <Icon name="check" size={16} className="text-violet-deep" />
          The line under your store&apos;s name is what search engines show under its title.
        </p>
      ) : (
        <div className="mt-5 rounded-2xl bg-paper p-4 ring-1 ring-line" data-search-description="no">
          <h3 className="font-semibold text-ink">Your store has no description yet</h3>
          <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
            Search engines show a short description under your store&apos;s name. Without one, they get a general sentence. Write a line under your name that says who your store is for and what they find there.
          </p>
          <p className="mt-4">
            <Link href="#details" className="btn btn-secondary btn-sm">
              Go to your store details to write it
              <Icon name="arrow-right" size={16} />
            </Link>
          </p>
        </div>
      )}

      {summaries.missing.length ? (
        <div className="mt-5 rounded-2xl bg-paper p-4 ring-1 ring-line" data-search-summaries={summaries.missing.length}>
          <h3 className="font-semibold text-ink">
            {summaries.missing.length === 1 ? "1 product has no summary" : `${summaries.missing.length} products have no summary`}
          </h3>
          <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
            {"A product's one-line summary is what search engines show under its name, unless its sales page has a search description of its own. Check each of these in Products."}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-ink [overflow-wrap:anywhere]">
            {summaries.missing.map((title, index) => <li key={`${index}-${title}`}>{title}</li>)}
          </ul>
          <p className="mt-4">
            <Link href="#products" className="btn btn-secondary btn-sm">
              Go to your products to add summaries
              <Icon name="arrow-right" size={16} />
            </Link>
          </p>
        </div>
      ) : check.indexed && summaries.unchecked === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink" data-search-summaries="done">
          <Icon name="check" size={16} className="text-violet-deep" />
          Every product on the first page of your store has a summary.
        </p>
      ) : null}
      {summaries.unchecked > 0 ? (
        <p className="mt-3 max-w-[80ch] text-sm text-ink" data-search-unchecked={summaries.unchecked}>
          {summaries.unchecked === 1 ? "1 product on your first page could not be checked here. Open it in Products to see its summary." : `${summaries.unchecked} products on your first page could not be checked here. Open them in Products to see their summaries.`}
        </p>
      ) : null}

      <h3 className="mt-6 font-semibold text-ink">Done for you on every store</h3>
      <ul className="mt-2 space-y-2">
        {SEARCH_DONE_FOR_YOU.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-ink-soft">
            <Icon name="check" size={16} className="mt-0.5 shrink-0 text-violet-deep" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
