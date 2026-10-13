import type { NextRequest } from "next/server";
import { hasProduct } from "@/lib/catalog";
import { StoreFullError, setCommunity, storeForEmail } from "@/lib/store";
import { guardStoreWrite, text } from "@/lib/store-request";
import {
  type CommunityConfig,
  deleteComment,
  deletePost,
  dismissReport,
  dropSpace,
  freshConfig,
  moderateMember,
  newItemId,
  parseTarget,
  readComment,
  readConfig,
  readPost,
  saveConfig,
  setCommentHidden,
  setPostHidden,
  withPin,
} from "@/lib/community";
import { forgetTicket } from "@/lib/community-access";
import { dropCommunityImage } from "@/lib/community-files";
import {
  MAX_COMMUNITY_ABOUT,
  MAX_COMMUNITY_NAME,
  MAX_SPACES,
  MAX_SPACE_ABOUT,
  MAX_SPACE_NAME,
  ITEM_ID,
  cleanLine,
  cleanText,
} from "@/lib/community-text";

const ACTIONS = new Set([
  "enable",
  "settings",
  "access",
  "space-add",
  "space-edit",
  "space-move",
  "space-remove",
  "member",
  "dismiss",
  "report-hide",
  "report-delete",
]);

/** What keeps order, as opposed to what sets the community up. */
const MODERATION = new Set(["member", "dismiss", "report-hide", "report-delete"]);

/**
 * Everything the studio changes about the creator's community.
 *
 * `{ action: "enable", on }` switches it on or off (made the first time);
 * `{ action: "settings", name, about }`; `{ action: "access", products }`
 * chooses whose purchases let people in; `space-add`, `space-edit`,
 * `space-move` and `space-remove` look after the spaces; `{ action:
 * "member", key, muted?, removed? }` mutes, takes out or lets back a member;
 * `dismiss`, `report-hide` and `report-delete` clear the moderation queue.
 *
 * The community is always found through the creator's own store, so nothing
 * here can reach anyone else's.
 */
export async function POST(request: NextRequest) {
  // Keeping order is moderation, which Editors and Support do too; setting
  // the community up is the store's settings (lib/team-roles.ts).
  const guarded = await guardStoreWrite(
    request,
    (body) => (MODERATION.has(text(body.action, 20)) ? "community" : "settings"),
    8_000,
  );
  if (!guarded.ok) return guarded.response;
  const { ref, body } = guarded;
  const action = text(body.action, 20);
  if (!ACTIONS.has(action)) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const fail = (error: string, status = 400) => Response.json({ ok: false, error }, { status });

  try {
    let store = await storeForEmail(ref);
    if (!store) return fail("none");

    if (action === "enable") {
      const on = body.on === true;
      store = await setCommunity(ref, on);
      if (!store?.community) return fail("none");
      let config = await readConfig(store.community.id);
      if (!config) {
        config = freshConfig(store.name);
        await saveConfig(store.community.id, config);
      }
      return Response.json({ ok: true, on, config });
    }

    const id = store.community?.id;
    const config = id ? await readConfig(id) : null;
    if (!id || !config) return fail("not_set_up");
    const save = async (next: CommunityConfig) => {
      await saveConfig(id, next);
      return Response.json({ ok: true, config: next });
    };

    if (action === "settings") {
      const name = cleanLine(body.name, MAX_COMMUNITY_NAME);
      if (!name) return fail("name");
      return save({ ...config, name, about: cleanText(body.about, MAX_COMMUNITY_ABOUT) });
    }

    if (action === "access") {
      const wanted = Array.isArray(body.products) ? body.products.filter((p): p is string => typeof p === "string") : [];
      const access = [...new Set(wanted)].filter((p) => hasProduct(store, p));
      // A new version, so no answer kept under the old choice lets anybody in.
      return save({ ...config, access, v: config.v + 1 });
    }

    if (action === "space-add" || action === "space-edit") {
      const name = cleanLine(body.name, MAX_SPACE_NAME);
      if (!name) return fail("space_name");
      const about = cleanLine(body.about, MAX_SPACE_ABOUT);
      const creatorOnly = body.creatorOnly === true;
      // Kept for the buyers of some of the community's own products. Anything
      // that does not open the community is dropped rather than saved, so the
      // list here can never name a product that lets nobody in.
      const asked = Array.isArray(body.only) ? body.only.filter((p): p is string => typeof p === "string") : [];
      const only = [...new Set(asked)].filter((p) => config.access.includes(p)).slice(0, 50);
      if (action === "space-add") {
        if (config.spaces.length >= MAX_SPACES) return fail("too_many");
        return save({ ...config, spaces: [...config.spaces, { id: newItemId(), name, about, creatorOnly, only }] });
      }
      const spaceId = text(body.id, 12);
      if (!config.spaces.some((s) => s.id === spaceId)) return fail("unknown", 404);
      return save({ ...config, spaces: config.spaces.map((s) => (s.id === spaceId ? { ...s, name, about, creatorOnly, only } : s)) });
    }

    if (action === "space-move") {
      const spaceId = text(body.id, 12);
      const at = config.spaces.findIndex((s) => s.id === spaceId);
      if (at < 0) return fail("unknown", 404);
      const to = body.direction === "up" ? at - 1 : at + 1;
      if (to < 0 || to >= config.spaces.length) return Response.json({ ok: true, config });
      const spaces = [...config.spaces];
      [spaces[at], spaces[to]] = [spaces[to], spaces[at]];
      return save({ ...config, spaces });
    }

    if (action === "space-remove") {
      const spaceId = text(body.id, 12);
      if (!config.spaces.some((s) => s.id === spaceId)) return fail("unknown", 404);
      if (config.spaces.length <= 1) return fail("last_space");
      await dropSpace(id, spaceId);
      return save({ ...config, spaces: config.spaces.filter((s) => s.id !== spaceId) });
    }

    if (action === "member") {
      const key = text(body.key, 32);
      if (!/^[0-9a-f]{32}$/.test(key)) return fail("unknown", 404);
      const change: { muted?: boolean; removed?: boolean } = {};
      if (typeof body.muted === "boolean") change.muted = body.muted;
      if (typeof body.removed === "boolean") change.removed = body.removed;
      const member = await moderateMember(id, key, change);
      if (!member) return fail("unknown", 404);
      // Let back in: whatever Stripe said before is asked again.
      if (change.removed === false) await forgetTicket(store, member.e);
      return Response.json({ ok: true, member: { key: member.k, muted: member.muted, removed: member.removed } });
    }

    const reportKey = text(body.key, 40);
    const target = parseTarget(reportKey);
    if (!target) return fail("unknown", 404);
    if (action === "dismiss") {
      await dismissReport(id, reportKey);
      return Response.json({ ok: true });
    }
    const post = await readPost(id, target.post);
    if (!post) {
      await dismissReport(id, reportKey);
      return Response.json({ ok: true });
    }
    if (target.kind === "comment") {
      const comment = ITEM_ID.test(target.comment) ? await readComment(id, post.id, target.comment) : null;
      if (comment) {
        if (action === "report-delete") await deleteComment(id, post.id, comment);
        else await setCommentHidden(id, post.id, comment, true);
      }
    } else if (action === "report-delete") {
      await deletePost(id, post);
      await dropCommunityImage(post.img?.path);
      let next = config;
      if (config.pinned.includes(post.id)) next = withPin(next, post.id, false) ?? next;
      if (config.start === post.id) next = { ...next, start: null };
      if (next !== config) await saveConfig(id, next);
    } else {
      await setPostHidden(id, post, true);
    }
    await dismissReport(id, reportKey);
    return Response.json({ ok: true });
  } catch (error) {
    // Switching the community on is the one change here that writes to the
    // store record, and a record at its ceiling refuses to grow.
    if (error instanceof StoreFullError) return fail("store_full", 409);
    console.error("changing a community failed", action, error);
    return fail("server_error", 500);
  }
}
