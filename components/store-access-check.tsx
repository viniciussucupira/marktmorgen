import Link from "next/link";
import { Icon } from "@/components/icons";
import { type AccessCheck, ACCESS_DONE_FOR_YOU } from "@/lib/store-access-check";

/**
 * "Can everyone use your store?" in the studio (98 [D2-COMPLIANCE-REVIEW]
 * unit 1, lib/store-access-check.ts): product pictures with no description,
 * by name, with where to add one, and what every store already gets. It never
 * changes the creator's words; the creator writes each description.
 */
export function StoreAccessCheck({ check }: { check: AccessCheck | null }) {
  if (!check) return null;
  const { pictures } = check;
  return (
    <section aria-labelledby="access-check-title" className="card mt-8 p-6 sm:p-8">
      <h2 id="access-check-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Can everyone use your store?
      </h2>
      <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
        Some of your buyers may use a screen reader, which reads your page aloud. This checks the products on the first page of your store. It is not a full accessibility review.
      </p>
      {pictures.unchecked > 0 ? (
        <p className="mt-5 max-w-[80ch] text-sm text-ink" data-access-unchecked={pictures.unchecked}>
          {pictures.unchecked === 1
            ? "1 product on your first page could not be checked here. Open it in Products to see its picture description."
            : `${pictures.unchecked} products on your first page could not be checked here. Open them in Products to see their picture descriptions.`}
        </p>
      ) : null}
      {pictures.done ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-ink" data-access-pictures="done">
          <Icon name="check" size={16} className="text-violet-deep" />
          Every product picture on the first page of your store has a description.
        </p>
      ) : pictures.missing.length === 0 ? null : (
        <div className="mt-5 rounded-2xl bg-paper p-4 ring-1 ring-line" data-access-pictures={pictures.missing.length}>
          <h3 className="font-semibold text-ink">
            {pictures.missing.length === 1 ? "1 product picture has no description" : `${pictures.missing.length} product pictures have no description`}
          </h3>
          <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
            {"A screen reader says the description instead of the picture. Check each of these products in Products: under its picture, fill in \"What the picture shows, for people who cannot see it\". If a picture only decorates the title, an empty description is right, and you can leave it."}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-ink">
            {pictures.missing.map((title, index) => <li key={`${index}-${title}`}>{title}</li>)}
          </ul>
          <p className="mt-4">
            <Link href="#products" className="btn btn-secondary btn-sm">
              Go to your products to check descriptions
              <Icon name="arrow-right" size={16} />
            </Link>
          </p>
        </div>
      )}
      <h3 className="mt-6 font-semibold text-ink">Done for you on every store</h3>
      <ul className="mt-2 space-y-2">
        {ACCESS_DONE_FOR_YOU.map((line) => (
          <li key={line} className="flex max-w-[80ch] items-start gap-2 text-sm text-ink">
            <Icon name="check" size={16} className="mt-0.5 shrink-0 text-violet-deep" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
