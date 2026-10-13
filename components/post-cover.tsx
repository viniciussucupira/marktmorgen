import type { BlogPost } from "@/lib/blog";

/**
 * The picture at the top of an article.
 *
 * Not a photograph. A stock photo of a laptop on a desk says nothing about
 * what an article contains, and eight of them in a row say even less; these
 * covers are built from two things the post already carries — its own pair of
 * colours and the line it leads with — so every article looks like itself and
 * like this site. The same pair draws the card that gets shared on social
 * media, so an article looks the same wherever it turns up.
 */
export function PostCover({
  post,
  size = "md",
  headings,
  className = "",
}: {
  post: BlogPost;
  size?: "sm" | "md" | "lg";
  /**
   * The article's own section titles. Given these, the plate stops being a
   * coloured rectangle and becomes the front of the article: what is in it,
   * before the first paragraph. Without them it falls back to the kicker
   * alone, which is all a small card has room for anyway.
   */
  headings?: string[];
  className?: string;
}) {
  const inside = headings?.slice(0, 3) ?? [];
  const listed = size !== "sm" && inside.length >= 2;
  const ratio = listed
    ? "aspect-[16/9] sm:aspect-[16/7]"
    : size === "lg"
      ? "aspect-[16/6]"
      : size === "sm"
        ? "aspect-[16/9]"
        : "aspect-[16/8]";
  const kicker = size === "sm" ? "text-[0.6875rem]" : "text-[0.75rem]";

  return (
    <div
      aria-hidden={listed ? undefined : "true"}
      className={`relative isolate overflow-hidden ${ratio} ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${post.from} 0%, ${post.to} 100%)` }}
    >
      {/*
        The article's colours, taken down into the range the rest of the site
        lives in. At full strength a pair like orange and crimson fills a card
        with neon; under a deep blue scrim the same pair still tells one
        article from another across a grid, and nine of them together still
        look like one publication.
      */}
      <span
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(140deg, rgba(13,11,36,0.38) 0%, rgba(13,11,36,0.66) 100%), radial-gradient(28rem 18rem at 88% -10%, rgba(255,255,255,0.3), transparent 62%)",
        }}
      />
      <span
        className="absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 85% 80% at 70% 20%, #000 10%, transparent 72%)",
        }}
      />
      {listed ? (
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
          <p className={`flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-white ${kicker}`}>
            <span className="h-px w-6 shrink-0 bg-white/60" />
            <span className="truncate">{post.kicker}</span>
          </p>
          <ul className="grid gap-1.5 text-[0.875rem] leading-snug text-white/85 sm:text-[0.9375rem]">
            <li className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70">
              What is in it
            </li>
            {inside.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span aria-hidden="true" className="text-white/60">
                  —
                </span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p
          className={`absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3.5 font-semibold uppercase tracking-[0.14em] text-white sm:px-5 ${kicker}`}
        >
          <span className="h-px w-6 shrink-0 bg-white/60" />
          <span className="truncate">{post.kicker}</span>
        </p>
      )}
    </div>
  );
}
