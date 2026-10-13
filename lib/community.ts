/**
 * A store's community: the place where the people who bought from a creator
 * talk to the creator and to each other.
 *
 * Who may come in is decided in lib/community-access.ts, on every request.
 * This file only keeps what they write, and keeps it small and bounded, with
 * every key under the community's own id so nothing here can be reached from
 * another store:
 *
 *   nl:cm:<id>:cfg            the settings: name, spaces, who gets in, pins (JSON)
 *   nl:cm:<id>:seq            a counter; every post takes the next number
 *   nl:cm:<id>:p:<post>       one post (JSON)
 *   nl:cm:<id>:feed           every post, by number (sorted set)
 *   nl:cm:<id>:sp:<space>     the posts of one space, by number (sorted set)
 *   nl:cm:<id>:c:<post>       the comments under one post (hash)
 *   nl:cm:<id>:l:<post>       who liked one post (set of member keys)
 *   nl:cm:<id>:m              everyone who has come in: key -> Member (hash)
 *   nl:cm:<id>:dir            those who chose to be listed, by joining time
 *   nl:cm:<id>:rep            reported posts and comments, newest first
 *   nl:cm:<id>:rep:<target>   who reported one of them, so a report counts once
 *   nl:cm:rl:<id>:<who>:<k>   how much one member did lately, for the limits
 *
 * A member is known by a key made from their address (lib/learn.ts emailKey),
 * and the address itself is kept only in their own record, for the creator's
 * moderation list and for the announcement emails they asked for. No other
 * member ever sees it: the directory shows the name a member chose, and only
 * when they chose to be listed.
 *
 * Feeds are read a page at a time by post number, which is unique and only
 * grows, so a page never repeats or skips a post however many are written
 * while somebody reads.
 *
 * Every limit is in lib/community-text.ts, where the studio reads it too.
 */
import { randomBytes } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { normaliseEmail } from "@/lib/auth";
import { emailKey } from "@/lib/learn";
import {
  COMMUNITY_ID,
  FEED_PAGE,
  ITEM_ID,
  MAX_COMMENTS_PER_POST,
  MAX_COMMUNITY_ABOUT,
  MAX_COMMUNITY_NAME,
  MAX_DISPLAY_NAME,
  MAX_MEMBERS,
  MAX_PINNED,
  MAX_POSTS,
  MAX_REPORT_QUEUE,
  MAX_SPACES,
  MAX_SPACE_ABOUT,
  MAX_SPACE_NAME,
  RATE_LIMITS,
  type RateKind,
  cleanLine,
} from "@/lib/community-text";
import { MAX_ALT_LENGTH } from "@/lib/product-image";

/** The author of what the creator writes. Never a member key, which is hex. */
export const CREATOR = "creator";

export type Space = {
  id: string;
  name: string;
  about: string;
  /** Only the creator starts posts here; members still comment. */
  creatorOnly: boolean;
  /**
   * Only the buyers of these of the community's products, the way an event
   * can be kept for some of them (lib/community-events.ts). Empty means every
   * member. A product named here that no longer opens the community is
   * ignored, so nobody is shut out by a product the creator took off the
   * community's own list.
   */
  only: string[];
};

export type CommunityConfig = {
  name: string;
  about: string;
  /** The products whose buyers are let in (lib/community-access.ts). */
  access: string[];
  spaces: Space[];
  /** The post shown first to everyone, labelled "Start here". */
  start: string | null;
  /** Posts held at the top of the feed, in the order they were pinned. */
  pinned: string[];
  /** Goes up whenever `access` changes, so no answer about it outlives it. */
  v: number;
};

export type Member = {
  /** The key the member is known by. */
  k: string;
  /** Their address: for the creator and for emails they asked for, nobody else. */
  e: string;
  /** The name they chose to be seen by; empty until they choose one. */
  n: string;
  /** Listed in the member directory. */
  dir: boolean;
  /** Asked to be emailed the creator's announcements. */
  mail: boolean;
  at: number;
  seen: number;
  /** May read, may not write. */
  muted: boolean;
  /** Taken out by the creator: not let in, whatever they bought. */
  removed: boolean;
  /** The token in their unsubscribe link, made the first time they are emailed. */
  t: string;
};

export type CommunityImage = { path: string; w: number; h: number; alt: string };

export type Post = {
  id: string;
  /** Its number: the order of the feed. */
  n: number;
  /** The space it was posted in; may name a space since removed. */
  sp: string;
  /** CREATOR or a member key. */
  a: string;
  title: string;
  text: string;
  img: CommunityImage | null;
  at: number;
  /** An announcement is the creator's, labelled so, and may have been emailed. */
  kind: "post" | "announcement";
  /** Hidden by the creator: gone for members, kept for the creator to restore. */
  hid: boolean;
  /**
   * When it was last edited, in seconds, or 0 for never. Shown to everyone
   * who can see the post: a reader deserves to know the words changed after
   * the replies under them were written.
   */
  ed: number;
};

export type Comment = {
  id: string;
  /** The comment this answers, or "" for one straight under the post. */
  parent: string;
  a: string;
  text: string;
  at: number;
  hid: boolean;
  /** When it was last edited, in seconds, or 0 for never. */
  ed: number;
};

const base = (id: string) => `nl:cm:${id}`;
const cfgKey = (id: string) => `${base(id)}:cfg`;
const seqKey = (id: string) => `${base(id)}:seq`;
const postKey = (id: string, post: string) => `${base(id)}:p:${post}`;
const feedKey = (id: string) => `${base(id)}:feed`;
const spaceKey = (id: string, space: string) => `${base(id)}:sp:${space}`;
const commentsKey = (id: string, post: string) => `${base(id)}:c:${post}`;
const likesKey = (id: string, post: string) => `${base(id)}:l:${post}`;
const membersKey = (id: string) => `${base(id)}:m`;
const dirKey = (id: string) => `${base(id)}:dir`;
const reportsKey = (id: string) => `${base(id)}:rep`;
const reportersKey = (id: string, target: string) => `${base(id)}:rep:${target}`;
const rateKey = (id: string, who: string, kind: string) => `nl:cm:rl:${id}:${who}:${kind}`;

/** How long who-reported-what is kept, so the same member cannot report twice. */
const REPORTERS_SECONDS = 90 * 86_400;

export function newItemId(): string {
  return randomBytes(6).toString("hex");
}

const now = () => Math.floor(Date.now() / 1000);

// ------------------------------------------------------------------ settings

/** A new community: one space to start in, and nobody let in until chosen. */
export function freshConfig(storeName: string): CommunityConfig {
  return {
    name: `${storeName} Community`.slice(0, MAX_COMMUNITY_NAME),
    about: "",
    access: [],
    spaces: [{ id: newItemId(), name: "General", about: "", creatorOnly: false, only: [] }],
    start: null,
    pinned: [],
    v: 1,
  };
}

function parseConfig(raw: unknown): CommunityConfig | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<CommunityConfig>;
    const ids = (list: unknown, max: number) =>
      Array.isArray(list) ? [...new Set(list.filter((x): x is string => typeof x === "string"))].slice(0, max) : [];
    const spaces: Space[] = [];
    for (const entry of Array.isArray(value.spaces) ? value.spaces : []) {
      if (!entry || typeof entry !== "object" || !ITEM_ID.test(String(entry.id))) continue;
      const name = cleanLine(entry.name, MAX_SPACE_NAME);
      if (!name) continue;
      spaces.push({
        id: entry.id,
        name,
        about: cleanLine(entry.about, MAX_SPACE_ABOUT),
        creatorOnly: entry.creatorOnly === true,
        // Spaces made before a space could be kept for some buyers have none.
        only: ids(entry.only, 50).filter((p) => p.length <= 40),
      });
      if (spaces.length >= MAX_SPACES) break;
    }
    return {
      name: cleanLine(value.name, MAX_COMMUNITY_NAME) || "Community",
      about: typeof value.about === "string" ? value.about.slice(0, MAX_COMMUNITY_ABOUT) : "",
      access: ids(value.access, 200).filter((id) => id.length <= 40),
      spaces,
      start: typeof value.start === "string" && ITEM_ID.test(value.start) ? value.start : null,
      pinned: ids(value.pinned, MAX_PINNED).filter((id) => ITEM_ID.test(id)),
      v: typeof value.v === "number" && Number.isInteger(value.v) && value.v > 0 ? value.v : 1,
    };
  } catch {
    return null;
  }
}

export async function readConfig(id: string): Promise<CommunityConfig | null> {
  if (!COMMUNITY_ID.test(id) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", cfgKey(id)]]);
  return parseConfig(raw);
}

export async function saveConfig(id: string, config: CommunityConfig): Promise<void> {
  await redisPipeline([["SET", cfgKey(id), JSON.stringify(config)]]);
}

// ------------------------------------------------------------------ members

function parseMember(raw: unknown): Member | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Member>;
    if (typeof v.k !== "string" || typeof v.e !== "string") return null;
    return {
      k: v.k,
      e: v.e,
      n: typeof v.n === "string" ? v.n.slice(0, MAX_DISPLAY_NAME) : "",
      dir: v.dir === true,
      mail: v.mail === true,
      at: typeof v.at === "number" ? v.at : 0,
      seen: typeof v.seen === "number" ? v.seen : 0,
      muted: v.muted === true,
      removed: v.removed === true,
      t: typeof v.t === "string" && /^[0-9a-f]{40}$/.test(v.t) ? v.t : "",
    };
  } catch {
    return null;
  }
}

export function memberKey(email: string): string {
  return emailKey(email);
}

export async function readMember(id: string, key: string): Promise<Member | null> {
  const [raw] = await redisPipeline([["HGET", membersKey(id), key]]);
  return parseMember(raw);
}

export async function readMembers(id: string, keys: string[]): Promise<Map<string, Member>> {
  const out = new Map<string, Member>();
  const unique = [...new Set(keys)].filter((k) => k !== CREATOR);
  if (!unique.length) return out;
  const [rows] = await redisPipeline([["HMGET", membersKey(id), ...unique]]);
  const list = Array.isArray(rows) ? rows : [];
  unique.forEach((key, i) => {
    const member = parseMember(list[i]);
    if (member) out.set(key, member);
  });
  return out;
}

/** Writes a member's record only if it is still exactly what was read. */
const CAS_MEMBER = [
  'local cur = redis.call("HGET", KEYS[1], ARGV[1])',
  "if cur ~= ARGV[2] then return 0 end",
  'redis.call("HSET", KEYS[1], ARGV[1], ARGV[3])',
  // The directory lists only those who asked to be listed and are still here.
  'if ARGV[4] == "1" then redis.call("ZADD", KEYS[2], ARGV[5], ARGV[1]) else redis.call("ZREM", KEYS[2], ARGV[1]) end',
  "return 1",
].join("\n");

/**
 * Changes some of a member's fields on the record as it is now, so a change
 * the member makes never writes back a mute or a removal the creator just
 * undid, or undoes one they just made. Null when there is no record.
 */
async function patchMember(id: string, key: string, change: (member: Member) => Partial<Member>): Promise<Member | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const [raw] = await redisPipeline([["HGET", membersKey(id), key]]);
    const member = parseMember(raw);
    if (!member || typeof raw !== "string") return null;
    const next: Member = { ...member, ...change(member), k: member.k };
    const listed = next.dir && next.n && !next.removed ? "1" : "0";
    const [written] = await redisPipeline([
      ["EVAL", CAS_MEMBER, 2, membersKey(id), dirKey(id), key, raw, JSON.stringify(next), listed, next.at],
    ]);
    if (Number(written) !== 1) continue;
    return next;
  }
  throw new Error("a member's record kept changing");
}

/**
 * The record of someone who has just been let in, made the first time they
 * come and dated each time after, at most once an hour so reading costs no
 * write. Null when the community already holds as many people as it can.
 */
export async function touchMember(id: string, email: string, existing: Member | null): Promise<Member | null> {
  const key = memberKey(email);
  const at = now();
  if (existing) {
    if (at - existing.seen < 3_600) return existing;
    return (await patchMember(id, key, () => ({ seen: at }))) ?? existing;
  }
  const [size] = await redisPipeline([["HLEN", membersKey(id)]]);
  if (Number(size) >= MAX_MEMBERS) return null;
  const member: Member = { k: key, e: normaliseEmail(email), n: "", dir: false, mail: false, at, seen: at, muted: false, removed: false, t: "" };
  // HSETNX: two first visits at once make one record, not two.
  await redisPipeline([["HSETNX", membersKey(id), key, JSON.stringify(member)]]);
  return (await readMember(id, key)) ?? member;
}

/** A member's own choices: the name they are seen by, the directory, the emails. */
export async function setProfile(
  id: string,
  member: Member,
  change: { name: string; dir: boolean; mail: boolean },
): Promise<Member> {
  const name = cleanLine(change.name, MAX_DISPLAY_NAME);
  return (await patchMember(id, member.k, () => ({ n: name, dir: change.dir && Boolean(name), mail: change.mail }))) ?? member;
}

/** Switches a member's announcement emails off (the unsubscribe link) or on. */
export async function setMail(id: string, member: Member, mail: boolean): Promise<Member> {
  return (await patchMember(id, member.k, () => ({ mail }))) ?? member;
}

/** Keeps the unsubscribe token a member's emails carry. */
export async function setMemberToken(id: string, member: Member, token: string): Promise<void> {
  await patchMember(id, member.k, () => ({ t: token }));
}

/** The creator mutes or unmutes, removes or lets back. */
export async function moderateMember(
  id: string,
  key: string,
  change: { muted?: boolean; removed?: boolean },
): Promise<Member | null> {
  return patchMember(id, key, (member) => ({
    muted: change.muted ?? member.muted,
    removed: change.removed ?? member.removed,
  }));
}

/** One page of the member directory: those who chose to be listed, newest first. */
export async function directory(id: string, before: number | null, page: number): Promise<{ members: Member[]; next: number | null }> {
  const max = before === null ? "+inf" : `(${before}`;
  const [raw] = await redisPipeline([["ZREVRANGEBYSCORE", dirKey(id), max, "-inf", "WITHSCORES", "LIMIT", 0, page + 1]]);
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const keys: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    keys.push(flat[i]);
    scores.push(Number(flat[i + 1]));
  }
  const more = keys.length > page;
  const shown = keys.slice(0, page);
  const found = await readMembers(id, shown);
  const members = shown.map((k) => found.get(k)).filter((m): m is Member => Boolean(m && m.dir && m.n && !m.removed));
  return { members, next: more ? scores[page - 1] : null };
}

export async function directorySize(id: string): Promise<number> {
  const [n] = await redisPipeline([["ZCARD", dirKey(id)]]);
  return Number(n) || 0;
}

/**
 * Everyone who has come in, for the creator's list: a page at a time, in the
 * order Redis keeps them. `cursor` is Redis's own, "0" to begin.
 */
export async function memberPage(id: string, cursor: string, count = 200): Promise<{ members: Member[]; next: string; total: number }> {
  const [reply, total] = await redisPipeline([
    ["HSCAN", membersKey(id), cursor, "COUNT", count],
    ["HLEN", membersKey(id)],
  ]);
  if (!Array.isArray(reply) || reply.length < 2) return { members: [], next: "0", total: Number(total) || 0 };
  const flat = Array.isArray(reply[1]) ? (reply[1] as unknown[]) : [];
  const members: Member[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const member = parseMember(flat[i + 1]);
    if (member) members.push(member);
  }
  return { members, next: String(reply[0]), total: Number(total) || 0 };
}

/** Every member who asked for announcement emails and is still here. */
export async function mailableMembers(id: string): Promise<Member[]> {
  const out: Member[] = [];
  let cursor = "0";
  for (let page = 0; page < MAX_MEMBERS / 500 + 10; page += 1) {
    const { members, next } = await memberPage(id, cursor, 1000);
    for (const member of members) if (member.mail && !member.removed) out.push(member);
    cursor = next;
    if (cursor === "0") break;
  }
  return out;
}

// ------------------------------------------------------------------ limits

/** Counts one more of `kind` for this member, and says whether it is allowed. */
export async function within(id: string, who: string, kind: RateKind): Promise<boolean> {
  const { limit, seconds } = RATE_LIMITS[kind];
  const key = rateKey(id, who, kind);
  const [, count] = await redisPipeline([
    ["SET", key, "0", "EX", seconds, "NX"],
    ["INCR", key],
  ]);
  return Number(count) <= limit;
}

// ------------------------------------------------------------------ posts

function parseImage(raw: unknown): CommunityImage | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const side = (n: unknown) => (typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 10_000 ? n : 0);
  if (typeof v.path !== "string" || !side(v.w) || !side(v.h)) return null;
  return {
    path: v.path,
    w: side(v.w),
    h: side(v.h),
    alt: typeof v.alt === "string" ? v.alt.slice(0, MAX_ALT_LENGTH) : "",
  };
}

function parsePost(raw: unknown): Post | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Post>;
    if (typeof v.id !== "string" || !ITEM_ID.test(v.id) || typeof v.a !== "string") return null;
    return {
      id: v.id,
      n: typeof v.n === "number" ? v.n : 0,
      sp: typeof v.sp === "string" ? v.sp : "",
      a: v.a,
      title: typeof v.title === "string" ? v.title : "",
      text: typeof v.text === "string" ? v.text : "",
      img: parseImage(v.img),
      at: typeof v.at === "number" ? v.at : 0,
      kind: v.kind === "announcement" ? "announcement" : "post",
      hid: v.hid === true,
      // Posts written before posts could be edited have none.
      ed: typeof v.ed === "number" ? v.ed : 0,
    };
  } catch {
    return null;
  }
}

export async function readPost(id: string, post: string): Promise<Post | null> {
  if (!ITEM_ID.test(post)) return null;
  const [raw] = await redisPipeline([["GET", postKey(id, post)]]);
  return parsePost(raw);
}

export async function readPosts(id: string, posts: string[]): Promise<Post[]> {
  const ids = posts.filter((p) => ITEM_ID.test(p));
  if (!ids.length) return [];
  const rows = await redisPipeline(ids.map((p) => ["GET", postKey(id, p)]));
  return rows.map(parsePost).filter((p): p is Post => p !== null);
}

export type NewPost = {
  space: string;
  author: string;
  title: string;
  text: string;
  img: CommunityImage | null;
  kind: "post" | "announcement";
};

/** Writes a post. The caller has checked who may, and cleaned what it says. */
export async function createPost(id: string, input: NewPost): Promise<{ ok: true; post: Post } | { ok: false; reason: "full" }> {
  const [count] = await redisPipeline([["ZCARD", feedKey(id)]]);
  if (Number(count) >= MAX_POSTS) return { ok: false, reason: "full" };
  const [n] = await redisPipeline([["INCR", seqKey(id)]]);
  const post: Post = {
    id: newItemId(),
    n: Number(n),
    sp: input.space,
    a: input.author,
    title: input.title,
    text: input.text,
    img: input.img,
    at: now(),
    kind: input.kind,
    hid: false,
    ed: 0,
  };
  await redisPipeline([
    ["SET", postKey(id, post.id), JSON.stringify(post)],
    ["ZADD", feedKey(id), post.n, post.id],
    ["ZADD", spaceKey(id, post.sp), post.n, post.id],
  ]);
  return { ok: true, post };
}

export async function setPostHidden(id: string, post: Post, hidden: boolean): Promise<void> {
  await redisPipeline([["SET", postKey(id, post.id), JSON.stringify({ ...post, hid: hidden })]]);
}

/**
 * Rewrites a post's words, and marks when.
 *
 * Only the words: never the space it is in, never its picture, never who
 * wrote it and never the number that fixes its place in the feed — so a post
 * cannot be edited into somebody else's, or moved somewhere it was never
 * approved for. The caller has checked that this is the author, and has
 * cleaned the text the same way a new post is cleaned.
 *
 * The edit is stamped rather than silent, because people reply to what a post
 * said, and a reader who cannot see that the words changed is being misled by
 * the software rather than by the author.
 */
export async function editPost(id: string, post: Post, input: { title: string; text: string }): Promise<Post> {
  const next: Post = { ...post, title: input.title, text: input.text, ed: now() };
  await redisPipeline([["SET", postKey(id, post.id), JSON.stringify(next)]]);
  return next;
}

/** Takes a post away for good, with its comments, likes and reports. */
export async function deletePost(id: string, post: Post): Promise<void> {
  const [raw] = await redisPipeline([["HKEYS", commentsKey(id, post.id)]]);
  const commentIds = Array.isArray(raw) ? (raw as string[]) : [];
  await redisPipeline([
    ["DEL", postKey(id, post.id), commentsKey(id, post.id), likesKey(id, post.id), reportersKey(id, `p:${post.id}`)],
    ["ZREM", feedKey(id), post.id],
    ["ZREM", spaceKey(id, post.sp), post.id],
    ["ZREM", reportsKey(id), `p:${post.id}`, ...commentIds.map((c) => `c:${post.id}:${c}`)],
  ]);
}

export type FeedPage = { posts: Post[]; next: number | null };

/**
 * One page of posts, newest first: the whole community, or one space.
 * `before` is the number of the last post of the previous page. Hidden posts
 * are left out unless `withHidden`, which is the creator's view.
 */
export async function feed(
  id: string,
  options: { space?: string | null; before?: number | null; withHidden?: boolean; page?: number },
): Promise<FeedPage> {
  const page = options.page ?? FEED_PAGE;
  const key = options.space ? spaceKey(id, options.space) : feedKey(id);
  const max = options.before ? `(${options.before}` : "+inf";
  const [raw] = await redisPipeline([["ZREVRANGEBYSCORE", key, max, "-inf", "WITHSCORES", "LIMIT", 0, page + 1]]);
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const ids: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    ids.push(flat[i]);
    scores.push(Number(flat[i + 1]));
  }
  const more = ids.length > page;
  const posts = (await readPosts(id, ids.slice(0, page))).filter((p) => options.withHidden || !p.hid);
  return { posts, next: more ? scores[page - 1] : null };
}

export async function postCount(id: string): Promise<number> {
  const [n] = await redisPipeline([["ZCARD", feedKey(id)]]);
  return Number(n) || 0;
}

/** How many liked each post, whether this member did, and how many comments each has. */
export async function postNumbers(
  id: string,
  posts: Post[],
  viewer: string | null,
): Promise<Map<string, { likes: number; liked: boolean; comments: number }>> {
  const out = new Map<string, { likes: number; liked: boolean; comments: number }>();
  if (!posts.length) return out;
  const commands: (string | number)[][] = [];
  for (const post of posts) {
    commands.push(["SCARD", likesKey(id, post.id)]);
    commands.push(["SISMEMBER", likesKey(id, post.id), viewer ?? "-"]);
    commands.push(["HLEN", commentsKey(id, post.id)]);
  }
  const rows = await redisPipeline(commands);
  posts.forEach((post, i) => {
    out.set(post.id, {
      likes: Number(rows[i * 3]) || 0,
      liked: rows[i * 3 + 1] === 1 || rows[i * 3 + 1] === "1",
      comments: Number(rows[i * 3 + 2]) || 0,
    });
  });
  return out;
}

/** One like per member per post: a second press takes it back. */
export async function toggleLike(id: string, post: string, who: string): Promise<boolean> {
  const [added] = await redisPipeline([["SADD", likesKey(id, post), who]]);
  if (Number(added) === 1) return true;
  await redisPipeline([["SREM", likesKey(id, post), who]]);
  return false;
}

/** Pins a post to the top, or unpins it. Refused past MAX_PINNED. */
export function withPin(config: CommunityConfig, post: string, pinned: boolean): CommunityConfig | null {
  const rest = config.pinned.filter((p) => p !== post);
  if (!pinned) return { ...config, pinned: rest };
  if (rest.length >= MAX_PINNED) return null;
  return { ...config, pinned: [...rest, post] };
}

// ------------------------------------------------------------------ comments

function parseComment(raw: unknown): Comment | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Comment>;
    if (typeof v.id !== "string" || !ITEM_ID.test(v.id) || typeof v.a !== "string") return null;
    return {
      id: v.id,
      parent: typeof v.parent === "string" && ITEM_ID.test(v.parent) ? v.parent : "",
      a: v.a,
      text: typeof v.text === "string" ? v.text : "",
      at: typeof v.at === "number" ? v.at : 0,
      hid: v.hid === true,
      ed: typeof v.ed === "number" ? v.ed : 0,
    };
  } catch {
    return null;
  }
}

/** Every comment under a post, oldest first. At most MAX_COMMENTS_PER_POST. */
export async function readComments(id: string, post: string): Promise<Comment[]> {
  const [raw] = await redisPipeline([["HGETALL", commentsKey(id, post)]]);
  const out: Comment[] = [];
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) {
      const comment = parseComment(raw[i + 1]);
      if (comment) out.push(comment);
    }
  } else if (raw && typeof raw === "object") {
    for (const value of Object.values(raw as Record<string, string>)) {
      const comment = parseComment(value);
      if (comment) out.push(comment);
    }
  }
  return out.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}

export async function readComment(id: string, post: string, comment: string): Promise<Comment | null> {
  if (!ITEM_ID.test(comment)) return null;
  const [raw] = await redisPipeline([["HGET", commentsKey(id, post), comment]]);
  return parseComment(raw);
}

/**
 * Adds a comment. A reply to a reply is filed under the comment that started
 * the thread: one level of replies, never a staircase.
 */
export async function addComment(
  id: string,
  post: string,
  input: { parent: string; author: string; text: string },
): Promise<{ ok: true; comment: Comment } | { ok: false; reason: "full" | "parent" }> {
  const [size] = await redisPipeline([["HLEN", commentsKey(id, post)]]);
  if (Number(size) >= MAX_COMMENTS_PER_POST) return { ok: false, reason: "full" };
  let parent = "";
  if (input.parent) {
    const above = await readComment(id, post, input.parent);
    if (!above) return { ok: false, reason: "parent" };
    parent = above.parent || above.id;
  }
  const comment: Comment = { id: newItemId(), parent, a: input.author, text: input.text, at: now(), hid: false, ed: 0 };
  await redisPipeline([["HSET", commentsKey(id, post), comment.id, JSON.stringify(comment)]]);
  return { ok: true, comment };
}

/**
 * Rewrites a comment's words, and marks when. Only the words: never who wrote
 * it, and never which comment it answers, so an edit cannot move a reply on
 * to another thread. The caller has checked that this is the author.
 */
export async function editComment(id: string, post: string, comment: Comment, text: string): Promise<Comment> {
  const next: Comment = { ...comment, text, ed: now() };
  await redisPipeline([["HSET", commentsKey(id, post), comment.id, JSON.stringify(next)]]);
  return next;
}

export async function setCommentHidden(id: string, post: string, comment: Comment, hidden: boolean): Promise<void> {
  await redisPipeline([["HSET", commentsKey(id, post), comment.id, JSON.stringify({ ...comment, hid: hidden })]]);
}

/** Deletes a comment, and the replies under it with it. */
export async function deleteComment(id: string, post: string, comment: Comment): Promise<void> {
  const all = comment.parent ? [] : (await readComments(id, post)).filter((c) => c.parent === comment.id);
  const gone = [comment.id, ...all.map((c) => c.id)];
  await redisPipeline([
    ["HDEL", commentsKey(id, post), ...gone],
    ["ZREM", reportsKey(id), ...gone.map((c) => `c:${post}:${c}`)],
    ...gone.map((c) => ["DEL", reportersKey(id, `c:${post}:${c}`)]),
  ]);
}

// ------------------------------------------------------------------ reports

/** What a report points at: "p:<post>" or "c:<post>:<comment>". */
export type ReportTarget = { kind: "post"; post: string } | { kind: "comment"; post: string; comment: string };

export function targetKey(target: ReportTarget): string {
  return target.kind === "post" ? `p:${target.post}` : `c:${target.post}:${target.comment}`;
}

export function parseTarget(raw: string): ReportTarget | null {
  const parts = raw.split(":");
  if (parts[0] === "p" && parts.length === 2 && ITEM_ID.test(parts[1])) return { kind: "post", post: parts[1] };
  if (parts[0] === "c" && parts.length === 3 && ITEM_ID.test(parts[1]) && ITEM_ID.test(parts[2])) {
    return { kind: "comment", post: parts[1], comment: parts[2] };
  }
  return null;
}

/**
 * A member flags a post or a comment for the creator. Counted once per
 * member; the queue keeps the most recent MAX_REPORT_QUEUE.
 */
export async function report(id: string, target: ReportTarget, who: string): Promise<"added" | "again"> {
  const key = targetKey(target);
  const [added] = await redisPipeline([
    ["SADD", reportersKey(id, key), who],
    ["EXPIRE", reportersKey(id, key), REPORTERS_SECONDS],
  ]);
  if (Number(added) !== 1) return "again";
  await redisPipeline([
    ["ZADD", reportsKey(id), Date.now(), key],
    ["ZREMRANGEBYRANK", reportsKey(id), 0, -(MAX_REPORT_QUEUE + 1)],
  ]);
  return "added";
}

export type QueuedReport = { target: ReportTarget; key: string; at: number; count: number };

/** The creator's moderation queue, newest report first. */
export async function reportQueue(id: string, limit = 100): Promise<QueuedReport[]> {
  const [raw] = await redisPipeline([["ZREVRANGEBYSCORE", reportsKey(id), "+inf", "-inf", "WITHSCORES", "LIMIT", 0, limit]]);
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const rows: { key: string; at: number; target: ReportTarget }[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const target = parseTarget(flat[i]);
    if (target) rows.push({ key: flat[i], at: Math.floor(Number(flat[i + 1]) / 1000), target });
  }
  if (!rows.length) return [];
  const counts = await redisPipeline(rows.map((r) => ["SCARD", reportersKey(id, r.key)]));
  return rows.map((r, i) => ({ ...r, count: Math.max(1, Number(counts[i]) || 0) }));
}

/** Takes an item off the queue without touching it: the creator saw nothing wrong. */
export async function dismissReport(id: string, key: string): Promise<void> {
  await redisPipeline([["ZREM", reportsKey(id), key]]);
}

// ------------------------------------------------------------------ spaces

/** Removes a space. Its posts stay, in the whole-community feed. */
export async function dropSpace(id: string, space: string): Promise<void> {
  await redisPipeline([["DEL", spaceKey(id, space)]]);
}
