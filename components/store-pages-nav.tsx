import Link from "next/link";
import type { Store } from "@/lib/store";
import { blockWords } from "@/lib/buyer-words/blocks";
import { pageOut } from "@/lib/site-page-rules";

/**
 * The menu of a store's own pages (lib/site-page-rules.ts), at the top of
 * the store and of each of those pages: the ones the creator put in it that
 * are out now. Read from the store's record alone, so it costs nothing more.
 */
export function StorePagesNav({ store, current = null, home = false }: { store: Store; current?: string | null; home?: boolean }) {
  const shown = store.sitePages.filter((page) => page.nav && pageOut(page));
  if (!shown.length) return null;
  const w = blockWords(store.language);
  return (
    <nav aria-label={w.pagesMenu} className="st-pages-nav" data-store-pages>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {home ? (
          <li>
            <Link href={`/@${store.handle}`} className="st-pages-link">
              {store.name}
            </Link>
          </li>
        ) : null}
        {shown.map((page) => (
          <li key={page.id}>
            <Link href={`/@${store.handle}/${page.slug}`} prefetch={false} aria-current={page.id === current ? "page" : undefined} className="st-pages-link">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
