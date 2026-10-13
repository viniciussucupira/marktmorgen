import Link from "next/link";
import { photoUrl } from "@/lib/photo-limits";
import { isFree, type Listing, type Store } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { CREATOR, type CommunityConfig, type Member, type Post } from "@/lib/community";
import { communityImageFile } from "@/lib/community-image";
import { initialOf, segments, whenWords } from "@/lib/community-text";

/**
 * The pieces every community page is made of: the bar across the top, a
 * member's badge, a post's text with its links, a post in the feed, and the
 * small forms behind every button.
 *
 * Everything a member wrote reaches the page as text through React, which
 * escapes it; the only thing turned into markup is a web address that
 * lib/community-text.ts has already checked is an ordinary http or https one.
 * Every button is a plain form, so the community works before, and without,
 * any script.
 */

export const NOTICES: Record<string, { text: string; tone?: "warn" }> = {
  posted: { text: "Posted." },
  announced: { text: "Posted, and the email to members who asked for announcements is on its way." },
  noemail: { text: "Posted. It was not emailed: emailing announcements is part of Pro, with your email settings filled in.", tone: "warn" },
  noreaders: { text: "Posted. Nobody has asked for announcement emails yet, so none were sent." },
  commented: { text: "Comment added." },
  edited: { text: "Saved. It is marked as edited, so nobody is replying to words that quietly changed." },
  notyours: { text: "Only the person who wrote it can rewrite it.", tone: "warn" },
  liked: { text: "Like updated." },
  reported: { text: "Reported. The creator sees it in their moderation queue; nobody else is told who reported it." },
  deleted: { text: "Deleted." },
  hidden: { text: "Hidden from members. You can still see it, and show it again." },
  shown: { text: "Shown to members again." },
  pinned: { text: "Pinned to the top." },
  unpinned: { text: "Unpinned." },
  start: { text: "This is now the Start here post." },
  unstart: { text: "No longer the Start here post." },
  "muted-member": { text: "Muted. They can read, and cannot post, comment or like until you unmute them." },
  "unmuted-member": { text: "Unmuted." },
  saved: { text: "Saved." },
  empty: { text: "Write something first.", tone: "warn" },
  links: { text: "That has more web addresses than a post or comment may carry. Take a few out.", tone: "warn" },
  slow: { text: "That is a lot in a short time. Wait a little, then try again.", tone: "warn" },
  name: { text: "Choose the name other members see you by, then post.", tone: "warn" },
  image: { text: "That picture could not be checked. Try a JPEG, PNG or WebP.", tone: "warn" },
  creatoronly: { text: "Only the creator starts posts in that space. You can still comment.", tone: "warn" },
  muted: { text: "The creator has muted you here: you can read, and cannot post, comment or like.", tone: "warn" },
  full: { text: "This community has as many members as it can hold, so there is no member record for you: you can read, but cannot post, comment, like or save your choices. Tell the creator.", tone: "warn" },
  fullposts: { text: "This community holds as many posts as it can. The creator can delete old ones to make room.", tone: "warn" },
  fullcomments: { text: "This post has as many comments as one post holds.", tone: "warn" },
  pinfull: { text: "Three posts are pinned already. Unpin one first.", tone: "warn" },
  gone: { text: "That is not there anymore.", tone: "warn" },
  forbidden: { text: "That is not yours to change.", tone: "warn" },
  going: { text: "You are going. The way in shows on this page 15 minutes before the start." },
  goingnomail: { text: "You are going. The way in shows on this page 15 minutes before the start. For reminder emails a day and an hour before, check the “Email me” box on your You page." },
  notgoing: { text: "Your RSVP is canceled." },
  eventfull: { text: "Every place is taken. If somebody cancels, a place opens here again.", tone: "warn" },
  eventcancelled: { text: "This event was canceled.", tone: "warn" },
  eventover: { text: "This event is over.", tone: "warn" },
  eventlocked: { text: "This event is for members who have one of the products named on it.", tone: "warn" },
  host: { text: "You host this event, so there is no place for you to take.", tone: "warn" },
  nospace: { text: "There is no space to post in yet.", tone: "warn" },
  spacelocked: { text: "That space is for members who have one of the products it is kept for.", tone: "warn" },
  out: { text: "Your session here ended. Ask for a new link below.", tone: "warn" },
  off: { text: "This community is closed right now.", tone: "warn" },
  error: { text: "Something went wrong on our side. Nothing was changed; try again in a moment.", tone: "warn" },
};

export const LINK_NOTICES: Record<string, { title: string; body: string }> = {
  sent: {
    title: "Check your inbox",
    body: "If that address has something that opens this community, a link to come in is on its way. It works for one hour.",
  },
  email: { title: "That address does not look right", body: "Check it and try again." },
  limited: { title: "Too many requests", body: "Wait a little, then ask again." },
  error: { title: "The email could not be sent", body: "Nothing is lost. Try again in a moment." },
};

/** What a product that opens the community is, in a few words. */
export function ticketKind(product: Listing, currency: string): string {
  if (isFree(product)) return "Free";
  const price = formatMoney(product.priceCents, currency);
  if (product.recurring) return `Membership · ${price}`;
  if (product.course) return `Course · ${price}`;
  if (product.call) return `Call · ${price}`;
  return price;
}

/** The picture's address: through the route that checks who is asking. */
export function communityImageUrl(store: Store, path: string): string {
  return `/api/store/community/image?h=${encodeURIComponent(store.handle)}&f=${communityImageFile(path)}`;
}

export type Tab = "feed" | "events" | "members" | "you";

/** The bar across the top of every community page. */
export function CommunityBar({
  store,
  config,
  tab,
  signedIn,
}: {
  store: Store;
  config: CommunityConfig;
  tab: Tab | null;
  signedIn: boolean;
}) {
  const home = `/@${store.handle}/community`;
  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: "feed", label: "Feed", href: home },
    { id: "events", label: "Events", href: `${home}/events` },
    { id: "members", label: "Members", href: `${home}/members` },
    { id: "you", label: "You", href: `${home}/you` },
  ];
  return (
    <header className="cm-bar relative z-30 sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href={`/@${store.handle}`} className="cm-home flex min-w-0 flex-1 items-center gap-3 rounded-xl">
          {store.photoId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(store.photoId)} alt="" width={40} height={40} className="st-avatar !mx-0 shrink-0" style={{ width: 40, height: 40 }} />
          ) : (
            <span aria-hidden="true" className="st-avatar st-avatar-initial !mx-0 shrink-0" style={{ width: 40, height: 40, fontSize: "1.05rem" }}>
              {initialOf(store.name)}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[0.95rem] font-bold leading-tight">{config.name}</span>
            <span className="st-muted block truncate text-xs font-semibold">{`by ${store.name} · back to the store`}</span>
          </span>
        </Link>
        {signedIn ? (
          <nav aria-label="Community" className="w-full sm:w-auto">
            <ul className="flex gap-1">
              {tabs.map((t) => (
                <li key={t.id} className="flex-1 sm:flex-none">
                  <Link href={t.href} aria-current={tab === t.id ? "page" : undefined} className="cm-tab">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

/** A round badge with a member's first letter, or the creator's photo. */
export function Face({ store, author, name, size = 40 }: { store: Store; author: string; name: string; size?: number }) {
  if (author === CREATOR && store.photoId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl(store.photoId)} alt="" width={size} height={size} className="cm-face" style={{ width: size, height: size }} />
    );
  }
  return (
    <span aria-hidden="true" className={`cm-face ${author === CREATOR ? "cm-face-creator" : ""}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {initialOf(name)}
    </span>
  );
}

/** The name an author is shown by: the store's for the creator, a member's chosen one, or "A member". */
export function authorName(store: Store, author: string, members: Map<string, Member>): string {
  if (author === CREATOR) return store.name;
  return members.get(author)?.n || "A member";
}

/** A member's words, with their web addresses as links and their line breaks kept. */
export function PostText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`cm-text ${className}`}>
      {segments(text).map((part, i) =>
        part.kind === "link" ? (
          <a key={i} href={part.href} target="_blank" rel="nofollow ugc noopener noreferrer">
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

/** The hidden fields every community form carries. */
export function Carry({
  store,
  action,
  post,
  from,
  space,
  extra,
}: {
  store: Store;
  action: string;
  post?: string;
  from: "feed" | "space" | "post" | "you";
  space?: string | null;
  /** Anything else the action needs, such as which comment it acts on. */
  extra?: Record<string, string>;
}) {
  return (
    <>
      <input type="hidden" name="handle" value={store.handle} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="from" value={from} />
      {post ? <input type="hidden" name="post" value={post} /> : null}
      {space ? <input type="hidden" name="space" value={space} /> : null}
      {extra ? Object.entries(extra).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />) : null}
    </>
  );
}

/** One button that is a whole form. */
export function ActButton({
  store,
  action,
  post,
  from,
  space,
  extra,
  children,
  className = "cm-menu-item",
  confirm,
}: {
  store: Store;
  action: string;
  post?: string;
  from: "feed" | "space" | "post" | "you";
  space?: string | null;
  extra?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
}) {
  return (
    <form action="/api/store/community" method="post" data-confirm={confirm}>
      <Carry store={store} action={action} post={post} from={from} space={space} />
      {extra ? Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}

function Bubble() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

/** A creator badge: what tells every member who the creator is. */
export function CreatorBadge() {
  return <span className="cm-badge cm-badge-creator">Creator</span>;
}

const CUT = 600;

/** One post, in a feed or on its own page. */
export function PostCard({
  store,
  post,
  config,
  members,
  numbers,
  viewer,
  from,
  space,
  full = false,
}: {
  store: Store;
  post: Post;
  config: CommunityConfig;
  members: Map<string, Member>;
  numbers: { likes: number; liked: boolean; comments: number } | undefined;
  viewer: { key: string; owner: boolean; canWrite: boolean };
  from: "feed" | "space" | "post";
  space?: string | null;
  full?: boolean;
}) {
  const home = `/@${store.handle}/community`;
  const name = authorName(store, post.a, members);
  const place = config.spaces.find((s) => s.id === post.sp);
  const long = !full && post.text.length > CUT;
  const shown = long ? `${post.text.slice(0, CUT).replace(/\s+\S*$/, "")}…` : post.text;
  const pinned = config.pinned.includes(post.id);
  const start = config.start === post.id;
  const mine = post.a === viewer.key;
  const likes = numbers?.likes ?? 0;
  const comments = numbers?.comments ?? 0;
  const link = `${home}/post/${post.id}`;
  const labelId = `post-title-${post.id}`;
  const authorMuted = post.a !== CREATOR && members.get(post.a)?.muted;

  return (
    <article id={`post-${post.id}`} aria-labelledby={labelId} className={`st-card cm-post scroll-mt-28 p-5 sm:p-6 ${post.hid ? "cm-hidden" : ""}`}>
      <header className="flex items-start gap-3">
        <Face store={store} author={post.a} name={name} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] font-bold leading-tight">
            <span className="min-w-0 break-words">{name}</span>
            {post.a === CREATOR ? <CreatorBadge /> : null}
          </p>
          <p className="st-muted mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm">
            {place ? (
              <>
                <Link href={`${home}?space=${place.id}`} className="cm-quiet-link">{place.name}</Link>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <time dateTime={new Date(post.at * 1000).toISOString()}>{whenWords(post.at)}</time>
            {post.ed ? (
              <>
                <span aria-hidden="true">·</span>
                {/* Said out loud, because people reply to what a post said. */}
                <span title={`Edited ${whenWords(post.ed)}`}>Edited</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      {start || pinned || post.kind === "announcement" || post.hid ? (
        <p className="mt-3 flex flex-wrap gap-1.5">
          {start ? <span className="cm-badge cm-badge-accent">Start here</span> : null}
          {pinned ? <span className="cm-badge">Pinned</span> : null}
          {post.kind === "announcement" ? <span className="cm-badge cm-badge-accent">Announcement</span> : null}
          {post.hid ? <span className="cm-badge cm-badge-warn">Hidden from members</span> : null}
        </p>
      ) : null}

      <h2 id={labelId} className={`font-display mt-3 break-words text-lg font-semibold leading-snug tracking-[-0.01em] sm:text-xl ${post.title ? "" : "sr-only"}`}>
        {full ? post.title || `A post by ${name}` : <Link href={link} className="st-title-link">{post.title || `A post by ${name}`}</Link>}
      </h2>
      {shown ? <PostText text={shown} className="mt-2" /> : null}
      {long ? (
        <p className="mt-2 text-sm font-semibold">
          <Link href={link} className="cm-quiet-link underline underline-offset-4">Read the whole post</Link>
        </p>
      ) : null}
      {post.img ? (
        // A plain img: the picture is already shrunk and is served through a
        // route that checks who is asking, which an optimiser would bypass.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={communityImageUrl(store, post.img.path)}
          alt={post.img.alt}
          width={post.img.w}
          height={post.img.h}
          loading="lazy"
          decoding="async"
          className="cm-img mt-4"
        />
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        {viewer.canWrite ? (
          <ActButton
            store={store}
            action="like"
            post={post.id}
            from={from}
            space={space}
            className={`cm-pill ${numbers?.liked ? "cm-pill-on" : ""}`}
          >
            <Heart filled={Boolean(numbers?.liked)} />
            <span aria-hidden="true">{likes}</span>
            <span className="sr-only">{`${numbers?.liked ? "Unlike" : "Like"} this post, ${likes} ${likes === 1 ? "like" : "likes"}`}</span>
          </ActButton>
        ) : (
          <span className="cm-pill cm-pill-still">
            <Heart filled={false} />
            <span aria-hidden="true">{likes}</span>
            <span className="sr-only">{`${likes} ${likes === 1 ? "like" : "likes"}`}</span>
          </span>
        )}
        {full ? (
          <a href="#comments" className="cm-pill">
            <Bubble />
            <span>{`${comments} ${comments === 1 ? "comment" : "comments"}`}</span>
          </a>
        ) : (
          <Link href={`${link}#comments`} className="cm-pill">
            <Bubble />
            <span>{comments === 0 ? "Comment" : `${comments} ${comments === 1 ? "comment" : "comments"}`}</span>
          </Link>
        )}

        {viewer.canWrite ? (
          <details className="cm-menu ml-auto">
            <summary className="cm-pill" aria-label="More for this post">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </summary>
            <div className="cm-menu-list" role="group" aria-label="Post actions">
              {viewer.owner ? (
                <>
                  <ActButton store={store} action={pinned ? "unpin" : "pin"} post={post.id} from={from} space={space}>
                    {pinned ? "Unpin" : "Pin to the top"}
                  </ActButton>
                  <ActButton store={store} action={start ? "unstart" : "start"} post={post.id} from={from} space={space}>
                    {start ? "No longer Start here" : "Make it Start here"}
                  </ActButton>
                  <ActButton store={store} action={post.hid ? "unhide" : "hide"} post={post.id} from={from} space={space}>
                    {post.hid ? "Show to members" : "Hide from members"}
                  </ActButton>
                  {post.a !== CREATOR ? (
                    <ActButton store={store} action={authorMuted ? "unmute" : "mute"} post={post.id} from={from} space={space}>
                      {authorMuted ? `Unmute ${name}` : `Mute ${name}`}
                    </ActButton>
                  ) : null}
                </>
              ) : !mine ? (
                <ActButton store={store} action="report" post={post.id} from={from} space={space}>
                  Report to the creator
                </ActButton>
              ) : null}
              {mine ? (
                <Link href={`${link}?edit=post`} className="cm-menu-item">
                  Edit the post
                </Link>
              ) : null}
              {viewer.owner || mine ? (
                <ActButton store={store} action="delete" post={post.id} from={from} space={space} className="cm-menu-item cm-danger" confirm="Delete this post, with its comments, for good?">
                  Delete the post
                </ActButton>
              ) : null}
            </div>
          </details>
        ) : null}
      </footer>
    </article>
  );
}

/** The panel shown to somebody who is not in: what opens it, and how to come in. */
export function Gate({
  store,
  config,
  state,
  email,
  products,
  link,
}: {
  store: Store;
  config: CommunityConfig;
  state: "out" | "closed" | "removed";
  email: string | null;
  products: { id: string; title: string; kind: string }[];
  link: { title: string; body: string } | null;
}) {
  return (
    <div className="st-card mx-auto mt-8 max-w-xl p-6 sm:p-8">
      <p className="st-label">Community</p>
      <h1 className="font-display mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">{config.name}</h1>
      {config.about ? <PostText text={config.about} className="st-muted mt-3 leading-relaxed" /> : null}

      {link ? (
        <div className="st-note mt-6" role="status">
          <p className="font-bold" style={{ color: "var(--st-text)" }}>{link.title}</p>
          <p className="mt-1 text-sm">{link.body}</p>
        </div>
      ) : null}

      {state === "removed" ? (
        <div className="st-note mt-6" role="status">
          <p className="font-bold" style={{ color: "var(--st-text)" }}>{`${store.name} has taken you out of this community`}</p>
          <p className="mt-1 text-sm">{`Signed in as ${email}. What you bought is untouched; only the community is closed to this address.`}</p>
        </div>
      ) : state === "closed" ? (
        <div className="st-note mt-6" role="status">
          <p className="font-bold" style={{ color: "var(--st-text)" }}>Nothing that opens it yet</p>
          <p className="mt-1 text-sm">
            {`${email} has nothing from ${store.name} that opens this community, or a membership that did has stopped. If you used another address, ask for a link with it below.`}
          </p>
        </div>
      ) : null}

      {state !== "removed" && products.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold">Open to everyone who has</p>
          <ul className="mt-2 space-y-2">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/@${store.handle}/p/${p.id}`} className="cm-row">
                  <span className="min-w-0 break-words font-semibold">{p.title}</span>
                  <span className="st-muted shrink-0 text-sm">{p.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state !== "removed" ? (
        <form action="/api/store/community/link" method="post" className="mt-6 rounded-2xl px-5 py-4" style={{ border: "1px solid var(--st-line)" }}>
          <input type="hidden" name="handle" value={store.handle} />
          <label htmlFor="community-email" className="st-label">{state === "closed" ? "Try another address" : "Already a member?"}</label>
          <p className="st-muted mt-1 text-sm">Type the address you used to buy or sign up, and a link to come in on this device is sent there. No password.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input id="community-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="st-field min-w-0 flex-1" />
            <button type="submit" className="btn st-btn">Send me the link</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
