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
        Some of your buyers use a screen reader, which reads your page aloud. This checks the products shown first on your store. It is not a full accessibility review.
      </p>
      {pictures.done ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-ink" data-access-pictures="done">
          <Icon name="check" size={16} className="text-violet-deep" />
          Every product picture shown first on your store has a description.
        </p>
      ) : (
        <div className="mt-5 rounded-2xl bg-paper p-4 ring-1 ring-line" data-access-pictures={pictures.missing.length}>
          <h3 className="font-semibold text-ink">
            {pictures.missing.length === 1 ? "Describe 1 product picture" : `Describe ${pictures.missing.length} product pictures`}
          </h3>
          <p className="mt-1 max-w-[80ch] text-sm text-ink-soft">
            {"A screen reader says the description instead of the picture. Open each product below, and under its picture fill in \"What the picture shows, for people who cannot see it\". If a picture is only decoration, you can leave it empty."}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-ink">
            {pictures.missing.map((title, index) => <li key={`${index}-${title}`}>{title}</li>)}
          </ul>
          <p className="mt-4">
            <Link href="#products" className="btn btn-secondary btn-sm">
              Go to your products to add descriptions
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
