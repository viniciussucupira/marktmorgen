import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { normaliseHandle, storeForPage } from "@/lib/store";
import { lookStyle } from "@/lib/store-look";
import { feed, postNumbers, readMembers, readPosts } from "@/lib/community";
import { accessProducts, communityViewer, visibleSpaces } from "@/lib/community-access";
import { communityFolder } from "@/lib/community-image";
import { announcementReach, canAnnounceByEmail } from "@/lib/community-mail";
import { ITEM_ID } from "@/lib/community-text";
import {
  CommunityBar,
  Gate,
  LINK_NOTICES,
  NOTICES,
  PostCard,
  ticketKind,
} from "@/components/community-parts";
import { CommunityComposer, ConfirmDeletes } from "@/components/community-composer";

type Params = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Community — Nimbus Labs",
  robots: { index: false, follow: false },
};

/** The community's feed: every space, or one, newest first, a page at a time. */
export default async function CommunityPage({ params, searchParams }: Params) {
  const { handle: raw } = await params;
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith("@")) notFound();
  const store = await storeForPage(normaliseHandle(decoded));
  if (!store) notFound();
  const viewer = await communityViewer(store, await cookies());
  if (viewer.state === "off" || !store.community) redirect(`/@${store.handle}`);
  const id = store.community.id;
  const query = await searchParams;
  const word = typeof query.n === "string" ? query.n : "";
  const notice = NOTICES[word] ?? null;

  if (viewer.state !== "in") {
    const products = (await accessProducts(store, viewer.config)).map((p) => ({ id: p.id, title: p.title, kind: ticketKind(p, store.currency) }));
    return (
      <div className={`st-page st-theme-${store.look.theme} relative min-h-screen`} style={lookStyle(store.look) as React.CSSProperties}>
        <CommunityBar store={store} config={viewer.config} tab={null} signedIn={false} />
        <main id="content" className="px-4 pb-16">
          <Gate
            store={store}
            config={viewer.config}
            state={viewer.state}
            email={viewer.state === "out" ? null : viewer.email}
            products={products}
            link={LINK_NOTICES[typeof query.link === "string" ? query.link : ""] ?? (word === "out" ? { title: "Your session here ended", body: "Ask for a new link below." } : null)}
          />
        </main>
      </div>
    );
  }

  const { config, owner, key, canWrite, member } = viewer;
  // Spaces kept for the buyers of some products are not in this list for
  // anybody else, and neither are their posts: the gate is asked here, once,
  // and everything below reads only what came back.
  const spaces = await visibleSpaces(store, config, { owner, email: viewer.email });
  const mineIds = new Set(spaces.map((s) => s.id));
  const askedSpace = typeof query.space === "string" && ITEM_ID.test(query.space) ? query.space : "";
  // A space they may not see answers the same as one that is not there.
  if (askedSpace && !mineIds.has(askedSpace)) redirect(`${`/@${store.handle}/community`}?n=spacelocked`);
  const space = askedSpace ? spaces.find((s) => s.id === askedSpace) ?? null : null;
  const beforeRaw = typeof query.before === "string" ? Number(query.before) : NaN;
  const before = Number.isInteger(beforeRaw) && beforeRaw > 0 ? beforeRaw : null;
  const page = await feed(id, { space: space?.id ?? null, before, withHidden: owner });
  // The Start here post and the pinned ones lead the first page of the whole feed.
  const topIds = !space && !before ? [...new Set([config.start, ...config.pinned].filter((p): p is string => Boolean(p)))] : [];
  const topFound = topIds.length ? await readPosts(id, topIds) : [];
  // The spaces this viewer is gated out of. A post in a space that no longer
  // exists is not one of them, and stays where it always was.
  const shut = new Set(config.spaces.filter((s) => s.only.length && !mineIds.has(s.id)).map((s) => s.id));
  const open = (p: { sp: string }) => !shut.has(p.sp);
  const top = topIds
    .map((t) => topFound.find((p) => p.id === t))
    .filter((p): p is NonNullable<typeof p> => Boolean(p && (owner || !p.hid) && open(p)));
  const stream = page.posts.filter((p) => !topIds.includes(p.id) && open(p));
  const shown = [...top, ...stream];
  const [members, numbers] = await Promise.all([readMembers(id, shown.map((p) => p.a)), postNumbers(id, shown, key)]);
  const reach = owner ? await announcementReach(id) : 0;
  const home = `/@${store.handle}/community`;
  const from = space ? "space" : "feed";
  const openTo = await accessProducts(store, config);

  return (
    <div className={`st-page st-theme-${store.look.theme} relative min-h-screen`} style={lookStyle(store.look) as React.CSSProperties}>
      <ConfirmDeletes />
      <CommunityBar store={store} config={config} tab="feed" signedIn />
      <main id="content" className="mx-auto grid max-w-5xl gap-x-8 px-4 pb-16 pt-6 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Spaces" className="sticky top-24">
            <p className="st-label px-3 text-xs uppercase tracking-[0.08em]">Spaces</p>
            <ul className="mt-2 space-y-0.5">
              <li>
                <Link href={home} aria-current={!space ? "page" : undefined} className="cm-side">All posts</Link>
              </li>
              {spaces.map((s) => (
                <li key={s.id}>
                  <Link href={`${home}?space=${s.id}`} aria-current={space?.id === s.id ? "page" : undefined} className="cm-side">
                    <span className="min-w-0 truncate">{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <nav aria-label="Spaces" className="cm-chips -mx-4 mb-5 px-4 lg:hidden">
            <ul className="flex gap-2">
              <li className="shrink-0">
                <Link href={home} aria-current={!space ? "page" : undefined} className="cm-chip">All posts</Link>
              </li>
              {spaces.map((s) => (
                <li key={s.id} className="shrink-0">
                  <Link href={`${home}?space=${s.id}`} aria-current={space?.id === s.id ? "page" : undefined} className="cm-chip">{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {notice ? (
            <p className={`cm-flash mb-5 ${notice.tone === "warn" ? "cm-flash-warn" : ""}`} role="status">{notice.text}</p>
          ) : null}

          {owner && !store.community.on ? (
            <div className="st-note mb-5 text-sm" role="status">
              <strong>Switched off: only you can see this.</strong>{" "}
              Set it up, then switch it on in the <Link href="/studio/community" className="font-semibold underline underline-offset-4">studio</Link>.
            </div>
          ) : null}
          {owner && openTo.length === 0 ? (
            <div className="st-note mb-5 text-sm" role="status">
              <strong>Nobody can come in yet.</strong>{" "}
              Choose which of your products open it, in the <Link href="/studio/community" className="font-semibold underline underline-offset-4">studio</Link>.
            </div>
          ) : null}
          {member?.muted ? <p className="cm-flash cm-flash-warn mb-5">{NOTICES.muted.text}</p> : null}

          {space ? (
            <div className="mb-5">
              <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">{space.name}</h1>
              {space.about ? <p className="st-muted mt-1">{space.about}</p> : null}
              {space.creatorOnly ? <p className="st-muted mt-1 text-sm">{`Only ${store.name} starts posts here. Everyone can comment.`}</p> : null}
            </div>
          ) : (
            <h1 className="sr-only">{config.name}</h1>
          )}

          {canWrite && !before ? (
            <div className="mb-6">
              <CommunityComposer
                key={space?.id ?? "all"}
                handle={store.handle}
                folder={communityFolder(id)}
                spaces={spaces.map((s) => ({ id: s.id, name: s.name, creatorOnly: s.creatorOnly }))}
                current={space?.id ?? null}
                owner={owner}
                from={from}
                canEmail={owner && canAnnounceByEmail(store)}
                reach={reach}
                named={Boolean(member?.n)}
              />
            </div>
          ) : null}

          {shown.length === 0 ? (
            <div className="st-note text-center">
              <p className="font-bold" style={{ color: "var(--st-text)" }}>{before ? "Nothing older" : "No posts here yet"}</p>
              <p className="mt-1 text-sm">{before ? "That is everything." : canWrite ? "Be the first: say hello, ask something, share a win." : "When somebody posts, it shows up here."}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {shown.map((post) => (
                <li key={post.id}>
                  <PostCard
                    store={store}
                    post={post}
                    config={config}
                    members={members}
                    numbers={numbers.get(post.id)}
                    viewer={{ key, owner, canWrite }}
                    from={from}
                    space={space?.id ?? null}
                  />
                </li>
              ))}
            </ul>
          )}

          {page.next ? (
            <p className="mt-6 text-center">
              <Link href={`${home}?${space ? `space=${space.id}&` : ""}before=${page.next}`} className="cm-pill cm-pill-wide">
                Older posts
              </Link>
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
