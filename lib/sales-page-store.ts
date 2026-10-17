/**
 * Where a product's page of blocks is kept (lib/sales-page.ts says what it
 * is): one small record per product, under the store's statsId, like the
 * long description.
 *
 * The store's own record says only whether a product has a page (its `page`
 * flag), so the store page — read on every visit — never carries thirty
 * blocks of somebody else's product. The page is read only by the product's
 * own page, the page after a free sign-up and the studio.
 *
 *   nl:product:page:<statsId>:<productId>  -> the page, as JSON
 *   nl:product:pics:<statsId>              -> hash: picture path -> the product whose page shows it
 *   nl:sblock:uses:<statsId>:<section>     -> set: the pages carrying a saved section (lib/saved-block-store.ts),
 *                                             kept with every save
 *   nl:product:pages:<statsId>:<productId> -> list: the page as it was before each of its last
 *                                             five saves, newest first, as "<ms>\n<json>";
 *                                             forgotten 30 days after the last save
 *
 * A page's pictures are files in the store's picture folder
 * (lib/product-image.ts). Each belongs to the one page that first showed it,
 * written down in the hash, so that taking a picture off a page — or removing
 * the product — deletes a file no other page is showing, and never one that
 * another page is.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { EMPTY_PAGE, MAX_STORED_PAGE_BYTES, type SalesPage, parsePage, picturePaths } from "@/lib/sales-page";
import { sectionsOn } from "@/lib/saved-blocks";
import { usesCommands } from "@/lib/saved-block-store";

const pageKey = (statsId: string, productId: string) => `nl:product:page:${statsId}:${productId}`;
const picsKey = (statsId: string) => `nl:product:pics:${statsId}`;
const versionsKey = (statsId: string, productId: string) => `nl:product:pages:${statsId}:${productId}`;

/** How many earlier versions of a page are kept, and for how long after the last save. */
export const MAX_VERSIONS = 5;
export const VERSION_DAYS = 30;

/**
 * Says these pictures are this product's page's. Returns the ones that are
 * not: already shown on another product's page, which keeps them.
 */
export async function claimPictures(statsId: string, productId: string, paths: string[]): Promise<string[]> {
  if (paths.length === 0 || !isRedisConfigured()) return [];
  await redisPipeline(paths.map((path) => ["HSETNX", picsKey(statsId), path, productId]));
  const [owners] = await redisPipeline([["HMGET", picsKey(statsId), ...paths]]);
  const list = Array.isArray(owners) ? owners : [];
  return paths.filter((_, i) => list[i] !== productId);
}

/**
 * Lets go of pictures a page no longer shows. Returns the files to delete:
 * only those this product's page was the one showing.
 */
export async function releasePictures(statsId: string, productId: string, paths: string[]): Promise<string[]> {
  if (paths.length === 0 || !isRedisConfigured()) return [];
  const [owners] = await redisPipeline([["HMGET", picsKey(statsId), ...paths]]);
  const list = Array.isArray(owners) ? owners : [];
  const mine = paths.filter((_, i) => list[i] === productId);
  if (mine.length) await redisPipeline([["HDEL", picsKey(statsId), ...mine]]);
  return mine;
}

/** A product's page, or the empty page when it has none (or it cannot be read). */
export async function readPage(statsId: string | null, productId: string): Promise<SalesPage> {
  if (!statsId || !isRedisConfigured()) return { ...EMPTY_PAGE, blocks: [] };
  const [raw] = await redisPipeline([["GET", pageKey(statsId, productId)]]);
  if (typeof raw !== "string" || !raw || raw.length > MAX_STORED_PAGE_BYTES) return { ...EMPTY_PAGE, blocks: [] };
  try {
    return parsePage(JSON.parse(raw));
  } catch {
    return { ...EMPTY_PAGE, blocks: [] };
  }
}

/** Whether a page has anything the product's page should draw instead of its plain layout. */
export function hasBlocks(page: SalesPage): boolean {
  return page.blocks.length > 0;
}

/** Writes a page, or forgets it when it has no blocks and nothing else set. */
export async function writePage(statsId: string, productId: string, page: SalesPage): Promise<void> {
  const empty = page.blocks.length === 0 && !page.seoTitle && !page.seoDescription && !page.next;
  const json = JSON.stringify(page);
  const [before] = await redisPipeline([["GET", pageKey(statsId, productId)]]);
  const commands: (string | number)[][] = [empty ? ["DEL", pageKey(statsId, productId)] : ["SET", pageKey(statsId, productId), json]];
  // What the page was, kept so a save can be undone from the studio.
  if (typeof before === "string" && before && before !== json && before.length <= MAX_STORED_PAGE_BYTES) {
    const key = versionsKey(statsId, productId);
    commands.push(["LPUSH", key, `${Date.now()}\n${before}`], ["LTRIM", key, 0, MAX_VERSIONS - 1], ["EXPIRE", key, VERSION_DAYS * 86_400]);
  }
  // Which saved sections the page carries, before and after (lib/saved-blocks.ts).
  commands.push(...usesCommands(statsId, productId, sectionsOfRecord(before), empty ? [] : sectionsOn(page)));
  await redisPipeline(commands);
}

/** The saved sections a stored record carries; none when it cannot be read. */
function sectionsOfRecord(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw || raw.length > MAX_STORED_PAGE_BYTES) return [];
  try {
    return sectionsOn(parsePage(JSON.parse(raw)));
  } catch {
    return [];
  }
}

export type PageVersion = { at: number; page: SalesPage };

/** The page as it was before each of its last saves, newest first. */
export async function readVersions(statsId: string | null, productId: string): Promise<PageVersion[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const [list] = await redisPipeline([["LRANGE", versionsKey(statsId, productId), 0, MAX_VERSIONS - 1]]);
  if (!Array.isArray(list)) return [];
  const out: PageVersion[] = [];
  for (const entry of list) {
    if (typeof entry !== "string") continue;
    const cut = entry.indexOf("\n");
    const at = Number(entry.slice(0, cut));
    if (cut < 1 || !Number.isFinite(at)) continue;
    try {
      out.push({ at, page: parsePage(JSON.parse(entry.slice(cut + 1))) });
    } catch {
      // A version that cannot be read is left out, never shown half.
    }
  }
  return out;
}

/** Forgets the page of a product that is gone. Returns the picture files it was the one showing, to delete. */
export async function dropPage(statsId: string | null, productId: string): Promise<string[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const held = await readPage(statsId, productId).catch(() => ({ ...EMPTY_PAGE, blocks: [] }));
  const shown = picturePaths(held);
  await redisPipeline([["DEL", pageKey(statsId, productId), versionsKey(statsId, productId)], ...usesCommands(statsId, productId, sectionsOn(held), [])]);
  return releasePictures(statsId, productId, shown);
}
