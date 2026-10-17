/**
 * Who may do what in a store's studio, and on which store (lib/team-roles.ts,
 * lib/studio-route.ts resolveAccess, lib/team.ts; ClickFunnels audit F63,
 * added 17 October 2026). The table and the door had no test of their own.
 *
 *   - the four things that decide where money goes and who is let in —
 *     the plan, the Stripe connection, the team and deleting the store — are
 *     the owner's alone; support edits nothing; an editor cannot send to the
 *     list, touch payments, import or download buyers' data;
 *   - a person on one store's team, in one role, is refused what the role
 *     does not have, and is never handed another store: a store they are not
 *     on is "gone", whichever store they own or belong to otherwise;
 *   - taken off the team, they are refused at once;
 *   - the routes that move money or buyers' data name the permission they
 *     need, and every permission a route names is one the table knows.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROLE_PERMISSIONS, TEAM_ROLES, can, isPermission, type Permission } from "@/lib/team-roles";
import { resolveAccess } from "@/lib/studio-route";
import { putMember, removeMember, roleIn } from "@/lib/team";
import { claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { LOCKED_NEEDS } from "@/lib/two-step";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const OWNER_ONLY: Permission[] = ["billing", "payments", "team", "delete"];

function routes(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...routes(rel));
    else if (entry === "route.ts") out.push(rel);
  }
  return out;
}

/** The permissions a route's guard calls name. */
function needs(file: string): string[] {
  const source = readFileSync(join(process.cwd(), file), "utf8");
  const found = new Set<string>();
  for (const call of source.matchAll(/(?:guardStoreWrite|jsonAccess|studioAccess|creatorFrom|studioView)\(([^;]*)/g)) {
    for (const word of call[1].matchAll(/"([a-z]+)"/g)) found.add(word[1]);
  }
  return [...found].filter((w) => isPermission(w) || w === "member").sort();
}

async function main(): Promise<void> {
  redis.clear();

  part("The table");
  for (const role of TEAM_ROLES) {
    is(`${role}: none of the owner's four`, OWNER_ONLY.filter((p) => can(role, p)), []);
  }
  is("the owner has every permission", [...ROLE_PERMISSIONS.owner].length, 16);
  is("support edits nothing", ["settings", "page", "products", "send", "draft", "export", "import", "events"].filter((p) => can("support", p as Permission)), []);
  is("an editor cannot send, export, import or touch settings", ["send", "export", "import", "settings"].filter((p) => can("editor", p as Permission)), []);
  is("whatever two-step login locks after a recovery is beyond an editor and support", LOCKED_NEEDS.filter((p) => can("editor", p as Permission) || can("support", p as Permission)), []);
  is("a word that is not a permission is not one, even on an object's prototype", [isPermission("toString"), isPermission("constructor"), isPermission("send")], [false, false, true]);

  part("The door, store by store");
  await claimHandle("owner-a@example.com", "store-a", "Store A", "");
  await claimHandle("owner-b@example.com", "store-b", "Store B", "");
  await ensureStatsId("owner-a@example.com");
  const a = (await storeForEmail("owner-a@example.com"))!;
  const b = (await storeForEmail("owner-b@example.com"))!;
  is("the team member is added", [await putMember(a, "ed@example.com", "editor"), await putMember(a, "sue@example.com", "support"), await putMember(a, "al@example.com", "admin")], [true, true, true]);
  is("the owner cannot be added as a member of their own store", await putMember(a, "Owner-A@example.com", "admin"), false);
  const door = async (email: string, sid: string, need: Parameters<typeof resolveAccess>[2]) => {
    const result = await resolveAccess(email, { pinned: sid }, need);
    return result.ok ? `${result.access.role}@${result.access.store.handle}` : result.reason;
  };
  is("an editor edits products", await door("ed@example.com", a.sid, "products"), "editor@store-a");
  is("but cannot send to the list", await door("ed@example.com", a.sid, "send"), "forbidden");
  is("nor download buyers' data", await door("ed@example.com", a.sid, "export"), "forbidden");
  is("support reads orders", await door("sue@example.com", a.sid, "orders"), "support@store-a");
  is("but changes no product", await door("sue@example.com", a.sid, "products"), "forbidden");
  is("an admin changes settings", await door("al@example.com", a.sid, "settings"), "admin@store-a");
  is("but not the plan, the Stripe connection, the team or deleting", await Promise.all(OWNER_ONLY.map((p) => door("al@example.com", a.sid, p))), ["forbidden", "forbidden", "forbidden", "forbidden"]);
  is("the owner may do all four", await Promise.all(OWNER_ONLY.map((p) => door("owner-a@example.com", a.sid, p))), OWNER_ONLY.map(() => "owner@store-a"));
  is("a store they are not on is gone, never another store", await door("ed@example.com", b.sid, "products"), "gone");
  is("not even for its owner's neighbour", await door("owner-b@example.com", a.sid, "stats"), "gone");
  is("an id that is not one is gone", await door("ed@example.com", "not-a-store-id", "products"), "gone");
  is("no store named: their own store only", (await resolveAccess("owner-b@example.com", {}, "products")).ok && (await resolveAccess("owner-b@example.com", {}, "products") as { access: { store: { handle: string } } }).access.store.handle, "store-b");
  is("the switcher's cookie naming a store they are not on is only a preference", await resolveAccess("owner-b@example.com", { remembered: a.sid }, "products").then((r) => (r.ok ? r.access.store.handle : r.reason)), "store-b");

  part("Taken off the team");
  is("removed", await removeMember(a, "ed@example.com"), true);
  is("refused at once", [await roleIn(a, "ed@example.com"), await door("ed@example.com", a.sid, "products")], [null, "gone"]);

  part("The routes say what they need");
  const all = [...routes("app/api/store"), ...routes("app/api/billing"), ...routes("app/api/stripe")];
  const expect: Record<string, string[]> = {
    "app/api/store/team/route.ts": ["member", "team"],
    "app/api/store/export/route.ts": ["export", "stats"],
    "app/api/store/import/route.ts": ["import"],
    "app/api/store/leads/route.ts": ["export"],
    "app/api/store/audience/route.ts": ["export"],
    "app/api/store/api-keys/route.ts": ["export"],
    "app/api/store/webhooks/route.ts": ["settings"],
    "app/api/store/affiliates/export/route.ts": ["export"],
    "app/api/store/paypal/connect/route.ts": ["payments"],
    "app/api/store/paypal/disconnect/route.ts": ["payments"],
    "app/api/stripe/connect/route.ts": ["payments"],
    "app/api/stripe/disconnect/route.ts": ["payments"],
    "app/api/billing/checkout/route.ts": ["billing"],
    "app/api/billing/cancel/route.ts": ["billing"],
    "app/api/billing/switch/route.ts": ["billing"],
  };
  for (const [file, want] of Object.entries(expect)) is(`${file.replace("app/api/", "")} needs ${want.join(" and ")}`, needs(file), want);
  const named = all.flatMap((file) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    return [...source.matchAll(/guardStoreWrite\(request, "([a-z]+)"/g)].map((m) => `${file}:${m[1]}`);
  });
  is("every permission a route's guard names is in the table", named.filter((n) => { const word = n.split(":").at(-1) ?? ""; return !isPermission(word) && word !== "member"; }), []);
  is("and there are routes to check", named.length > 50, true);

  done();
}

void main();
