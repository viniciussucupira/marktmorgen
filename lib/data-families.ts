/**
 * The key families a store's data room counts, by the start of their names,
 * for the jobs that measure what a store keeps (lib/data-recount.ts).
 *
 * tests/store-data-registry.ts says how every key family the code makes is
 * bounded; that file is the tests', so the code reads these two lists, and
 * tests/data-recount.test.ts fails when they no longer say what the registry
 * says: COUNTED holds every family counted in the room (taken where it is
 * written, or kept by an order), ELSEWHERE every other one (expiring by
 * itself, capped, the company's, or priced by another line). A key belongs
 * to the family whose name is the longest start of its own.
 */

/** Families counted in a store's data room. */
export const COUNTED_FAMILIES: readonly string[] = [
  "nl:ab:", "nl:adsrv:ctx:", "nl:adsrv:sent:", "nl:aff:", "nl:blog:body:", "nl:blog:meta:", "nl:blog:pub:",
  "nl:call:busy:", "nl:call:confirmed:", "nl:callteam:", "nl:callteam:rr:", "nl:catalog:", "nl:cert:",
  "nl:cm:", "nl:cm:unsub:", "nl:course:", "nl:crm:deals:", "nl:crm:v:", "nl:data:", "nl:dc:addr:",
  "nl:dc:mem:", "nl:dc:prod:", "nl:depth:", "nl:erased:", "nl:esync:tags:", "nl:form:r:", "nl:imp:buy:",
  "nl:imp:who:", "nl:inbox:", "nl:inbox:tok:", "nl:intro:c:", "nl:keys:", "nl:lc:", "nl:learn:enr:",
  "nl:lib:", "nl:mail:bc:", "nl:mail:bcs:", "nl:mail:enr:", "nl:mail:flowq", "nl:mail:flows:", "nl:mail:mk:",
  "nl:mail:unsub:", "nl:mv:", "nl:mv:link:", "nl:outreach:", "nl:outreach:stoplink:",
  "nl:payreq:due", "nl:payreq:o:", "nl:payreq:p:", "nl:payreq:r:", "nl:payreq:s:", "nl:person:",
  "nl:pfunnel:done:", "nl:pfunnel:seen:", "nl:pfunnels:", "nl:pkg:", "nl:pkg:s:", "nl:pkg:t:", "nl:pod:", "nl:pod:by:",
  "nl:pod:t:", "nl:preview:", "nl:product:about:", "nl:product:note:", "nl:product:page:",
  "nl:product:pages:", "nl:product:pics:", "nl:recover:off:", "nl:rev:", "nl:rev:all:", "nl:rev:new:",
  "nl:rev:off:", "nl:rev:pay:", "nl:rev:stop:", "nl:rev:sum:", "nl:rev:vis:", "nl:save:", "nl:sblock:uses:",
  "nl:sold:", "nl:stamp:copy:", "nl:stock:", "nl:store:leads:", "nl:stream:cap:", "nl:stream:v:",
  "nl:tier:price:", "nl:upd:last:", "nl:upd:latest:", "nl:upd:off:", "nl:upd:stop:", "nl:watch:last:",
  "nl:wf:held:", "nl:wf:log:", "nl:wf:run:", "nl:wf:runs:", "nl:wl:", "nl:wl:t:", "nl:yearask:",
  "nl:yearly:price:",
];

/** Families bounded some other way, which a measure of the room leaves out. */
export const ELSEWHERE_FAMILIES: readonly string[] = [
  "nl:", "nl:*", "nl:2fa:", "nl:2fa:hold:", "nl:2fa:locked:", "nl:2fa:lockedset:", "nl:2fa:rescue:",
  "nl:2fa:setup:", "nl:ab:paid:", "nl:account:stores:", "nl:adsrv:", "nl:adsrv:last:", "nl:adsrv:sub:",
  "nl:aff:link:", "nl:aff:payday:", "nl:aff:payday:lock", "nl:aff:seen:", "nl:aff:session:", "nl:affhub:",
  "nl:affhub:link:", "nl:affkit:", "nl:ai-spend:v2:{", "nl:ai-spend:v2:{YYYY-MM}", "nl:ai:", "nl:alert:",
  "nl:alert:seen:", "nl:allow:", "nl:api:k:", "nl:api:keys:", "nl:ask:", "nl:ask:a:", "nl:ask:missed:",
  "nl:auth:devices:", "nl:auth:fresh:", "nl:auth:link:", "nl:auth:move:", "nl:auth:rec:",
  "nl:auth:rec:link:", "nl:auth:rec:set:", "nl:auth:rec:until:", "nl:auth:session:", "nl:auth:sessions:",
  "nl:bench:ranges", "nl:bench:s:", "nl:billing:sync:after", "nl:billing:sync:cursor", "nl:busy:",
  "nl:cal:busy:", "nl:cal:cfg:", "nl:cal:err:", "nl:cal:good:", "nl:cal:lock:", "nl:cal:out:", "nl:cal:tok:",
  "nl:call:creator-reminded:", "nl:call:lock:", "nl:call:moved:", "nl:call:reminded:", "nl:call:remindq",
  "nl:call:room:", "nl:card:link:", "nl:card:open:", "nl:card:opens:", "nl:catalog:move:cursor",
  "nl:chatsum:", "nl:cimg:", "nl:cimg:doors", "nl:cimg:n:", "nl:closed:batch", "nl:closed:due", "nl:closed:lock", "nl:closed:walk", "nl:closing:lock", "nl:cm:evmail:",
  "nl:cm:evmailq", "nl:cm:evq", "nl:cm:link:", "nl:cm:mail:", "nl:cm:mailq", "nl:cm:rl:", "nl:confirm:",
  "nl:contract-reserve:v1", "nl:cotrouble:", "nl:cotrouble:mail:", "nl:courses:drip", "nl:courses:lock",
  "nl:creators:responses", "nl:crm:fields:", "nl:crm:stages:", "nl:dc:due", "nl:dc:lock", "nl:dc:ok:",
  "nl:dc:srv:", "nl:dc:state:", "nl:dir:listed", "nl:dir:page", "nl:domain:", "nl:dun:", "nl:dun:card:",
  "nl:dun:cards:", "nl:dun:count:", "nl:dun:cursor", "nl:dun:report:", "nl:erase:ix:", "nl:erase:link:",
  "nl:esync:bad:", "nl:esync:cfg:", "nl:esync:j:", "nl:esync:log:", "nl:esync:q", "nl:esync:seen:",
  "nl:exposure:v1:", "nl:exposure:v1:YYYY-MM", "nl:fair:c:", "nl:firstsale:", "nl:forms:", "nl:free:claim:",
  "nl:free:in:", "nl:free:n:", "nl:free:uses:", "nl:fshare:", "nl:fshare:n:", "nl:fshares:", "nl:fuse:",
  "nl:fuse:m:", "nl:gift:", "nl:gift:pi:", "nl:goal:", "nl:grp:", "nl:grp:pi:", "nl:grp:take:",
  "nl:gsc:conn", "nl:gsc:q:", "nl:gsc:state:", "nl:health:", "nl:heard:done:", "nl:heard:off",
  "nl:hooks:anchor:", "nl:hooks:cfg:", "nl:hooks:d:", "nl:hooks:evt:", "nl:hooks:log:", "nl:hooks:pos",
  "nl:hooks:q", "nl:hooks:stores", "nl:host:claims:", "nl:hostcal:cfg:", "nl:hostcal:err:",
  "nl:hostcal:good:", "nl:hostcal:lock:", "nl:house:seed", "nl:house:seed:lock", "nl:import:",
  "nl:imports:active", "nl:imports:busy:", "nl:imports:cf:", "nl:imports:cf:lock:", "nl:imports:list:",
  "nl:imports:lock", "nl:imports:moved:", "nl:imports:rows:", "nl:inbound:seen:", "nl:join:t:",
  "nl:learn:link:", "nl:learn:paid:", "nl:learn:pass:", "nl:learn:passes:", "nl:learn:rate:addr:",
  "nl:learn:rate:ip:", "nl:leave:", "nl:lib:joined:", "nl:lib:link:", "nl:listed:", "nl:mail-check:last",
  "nl:mail-check:lock", "nl:mail:clk:", "nl:mail:day:", "nl:mail:drafts:", "nl:mail:flowq:lease",
  "nl:mail:flowstats:", "nl:mail:health:", "nl:mail:lock", "nl:mail:paused:", "nl:mail:queue",
  "nl:mail:ramp:", "nl:mail:segs:", "nl:mail:used:", "nl:manage:link:", "nl:manage:opens:",
  "nl:manage:portal:", "nl:meet:conn:", "nl:meet:lock:", "nl:meet:log:", "nl:meet:q", "nl:meet:r:",
  "nl:meet:refresh:", "nl:meet:rf:", "nl:meet:state:", "nl:meet:stores", "nl:meet:test:", "nl:meet:user:",
  "nl:meet:zoomseen:", "nl:member:status:", "nl:metaads:conn:", "nl:metaads:read:", "nl:metaads:reading:",
  "nl:metaads:state:", "nl:metaads:stores", "nl:metaads:user:", "nl:mnum:", "nl:monthly:lock",
  "nl:monthly:sent:", "nl:mv:due", "nl:next:", "nl:next:lock:", "nl:nlink:", "nl:nlink:opens:", "nl:none",
  "nl:nudge:", "nl:nudge:count:", "nl:nudge:cursor", "nl:orders:folders:", "nl:orders:link:", "nl:orders:n:",
  "nl:orders:open:", "nl:orders:seen:", "nl:outreach:stop:all", "nl:pause:", "nl:pause:due",
  "nl:pause:last:", "nl:pay:currencies:", "nl:payreq:lock:", "nl:payreq:stores", "nl:person:find:", "nl:phone:cfg:", "nl:phone:seen:",
  "nl:phone:st:", "nl:pinv:", "nl:pk:", "nl:pk:auth:", "nl:pk:cred:", "nl:pk:reg:", "nl:plan:closing:",
  "nl:plan:closing:after", "nl:plan:ended", "nl:plan:paying", "nl:plans:lock", "nl:plans:pending",
  "nl:pod:n:", "nl:pod:ok:", "nl:pp:", "nl:pp:item:", "nl:pp:open:", "nl:pp:stores", "nl:ppsell:o:",
  "nl:ppsell:own:", "nl:ppsell:paid:", "nl:ppsell:pending:", "nl:ppsell:refunded:", "nl:ppsell:sales:",
  "nl:ppsell:watch:", "nl:pre:", "nl:pre:give:", "nl:pre:jobs", "nl:pre:pi:", "nl:pwyw:", "nl:quiet:at:",
  "nl:quiet:lock", "nl:quiet:seen:", "nl:quiet:sent:", "nl:quiz:usage:", "nl:recent:", "nl:recent:feed:",
  "nl:recount:", "nl:recount:ids", "nl:recount:lock", "nl:recount:state", "nl:recount:sum",
  "nl:recover:asks", "nl:recover:link:", "nl:recover:once:", "nl:recover:sent:", "nl:ref:all", "nl:ref:by:",
  "nl:ref:c:", "nl:ref:code:", "nl:ref:cursor", "nl:ref:list:", "nl:ref:mine:", "nl:ref:mycode:",
  "nl:ref:owed", "nl:remind:", "nl:remind:failed:", "nl:remind:lock", "nl:report:", "nl:report:t:",
  "nl:rev:ask:due", "nl:rev:ask:sent:", "nl:rev:link:", "nl:rev:lock:", "nl:rev:refunds:seen:",
  "nl:rev:refunds:since:", "nl:rev:stores", "nl:rl:", "nl:rl:address:", "nl:rl:aff:addr:",
  "nl:rl:aff:click:", "nl:rl:aff:ip:", "nl:rl:cm:addr:", "nl:rl:cm:ev:", "nl:rl:cm:ip:", "nl:rl:creators:",
  "nl:rl:export:", "nl:rl:free:addr:", "nl:rl:free:ip:", "nl:rl:hooks:test:", "nl:rl:licence:",
  "nl:rl:manage:addr:", "nl:rl:manage:ip:", "nl:rl:orders:addr:", "nl:rl:orders:ip:", "nl:rl:phone:quiet:",
  "nl:rl:phone:test:", "nl:rl:signin:", "nl:rl:team-invite:", "nl:rlm:", "nl:sale:told:", "nl:sblocks:",
  "nl:sender:", "nl:ses:did:", "nl:ses:h:", "nl:ses:once:", "nl:ses:rest:", "nl:ses:state", "nl:ses:told:",
  "nl:share:applied", "nl:share:lock", "nl:share:read-until", "nl:share:stores", "nl:ship:done:",
  "nl:slink:", "nl:slink:store:", "nl:sns:seen:", "nl:sold:lock:", "nl:stamp:problem:", "nl:stats:",
  "nl:stock:lock:", "nl:storage:pending:", "nl:store:before-catalog:", "nl:store:delivery:",
  "nl:store:delivery:over:", "nl:store:folder-owner:", "nl:store:handle:", "nl:store:id:", "nl:store:lock:",
  "nl:store:owner:", "nl:store:owner:*", "nl:store:photo:", "nl:stream:auto:", "nl:stream:autoq",
  "nl:stream:col:", "nl:stream:due", "nl:stream:gone", "nl:stream:lock", "nl:stream:peek:",
  "nl:stripe-check:last", "nl:stripe-check:lock", "nl:sweep:cursor", "nl:tasks:bytes:", "nl:tasks:doors",
  "nl:team:", "nl:team:invite:", "nl:team:lock:", "nl:team:log:", "nl:team:of:", "nl:tier:",
  "nl:traffic:day:", "nl:traffic:folders:", "nl:traffic:n:", "nl:traffic:r:", "nl:traffic:x:", "nl:upd:job:",
  "nl:updq", "nl:upload-budget:v2:{", "nl:upload-budget:v2:{YYYY-MM}", "nl:upsell-slots:", "nl:upsell:",
  "nl:upsell:pending", "nl:usage-watch:told", "nl:vault:up:", "nl:verified:", "nl:verified:cursor",
  "nl:voice:", "nl:voice:lock:", "nl:watch:due", "nl:watch:folders:", "nl:watch:monthly:",
  "nl:watch:opened:", "nl:watch:sec:", "nl:wb:", "nl:wb:cursor", "nl:wb:link:", "nl:wb:n:", "nl:wb:once:",
  "nl:weekly:lock", "nl:weekly:off", "nl:weekly:sent:", "nl:weekly:to:", "nl:wf:abandoned:", "nl:wf:day:",
  "nl:wl:jobs", "nl:wo:due", "nl:wo:n:", "nl:wo:r:", "nl:wo:start:", "nl:yearask:count:",
  "nl:yearask:cursor", "nl:yearly-offer:", "nl:yearly:link:",
];

/** Whether a key belongs to a family the room counts: the longest family name it starts with is one of COUNTED_FAMILIES. */
export function countedInRoom(key: string): boolean {
  let best = "";
  let counted = false;
  for (const name of COUNTED_FAMILIES) if (key.startsWith(name) && name.length > best.length) [best, counted] = [name, true];
  for (const name of ELSEWHERE_FAMILIES) if (key.startsWith(name) && name.length > best.length) [best, counted] = [name, false];
  return counted;
}

/**
 * What becomes of each family when a store closes (added 18 October 2026):
 * its files go on its closing day (lib/plan-closing.ts), and every record it
 * keeps here goes within ERASE_WITHIN_DAYS after (lib/closed-store-data.ts),
 * but for what CLOSING says is kept. tests/closing-families.test.ts fails
 * for a family of tests/store-data-registry.ts that has no rule here, for a
 * rule here that names no family, and for a rule that does not fit how the
 * registry says the family is bounded.
 *
 *   erase    the store's own keys, named by one of its ids (or, `by`, its
 *            address or its key), are deleted by the walk. `rest`: the days
 *            within which any other key of the family (a payment's, a
 *            token's, a person's, which names no store) is gone by itself.
 *   token    named by a token, not by the store: deleted through what the
 *            store's own record of it says (the follower of family `via`,
 *            lib/closed-store-data.ts), and otherwise gone within `rest` days.
 *   expires  names no store and holds none of its content: gone by itself
 *            within `days`.
 *   lapses   a person's own record across stores (lib/joined-stores.ts),
 *            in which the store's id is one member among others: not taken
 *            out buyer by buyer, because once the store is gone the id
 *            points at nothing and is never shown; it runs out by itself
 *            within `days` of being written, priced with what wrote it.
 *   detach   one person's or one account's, across stores: only this
 *            store's member is taken out (by the step `via`).
 *   index    a list of the company's that names stores: this store's
 *            members are taken out by the walk.
 *   company  the company's own record, a person's own sign-in, or the
 *            store's address held back from anyone else: kept, as the
 *            registry says why; `rest` when it is gone by itself.
 */
export type Closing =
  | { how: "erase"; rest?: number; by?: "handle" }
  | { how: "token"; via: string; rest?: number }
  | { how: "expires"; days: number }
  | { how: "lapses"; days: number }
  | { how: "detach"; via: string }
  | { how: "index" }
  | { how: "company"; rest?: number };

const E: Closing = { how: "erase" };
const er = (rest: number): Closing => ({ how: "erase", rest });
const X = (days: number): Closing => ({ how: "expires", days });
const T = (via: string, rest?: number): Closing => ({ how: "token", via, ...(rest ? { rest } : {}) });
const D = (via: string): Closing => ({ how: "detach", via });
const I: Closing = { how: "index" };
const C: Closing = { how: "company" };
const Cr = (rest: number): Closing => ({ how: "company", rest });
/** A person's record across stores: the quarter written in and twelve after (lib/joined-stores.ts, QUARTERS_KEPT), at most 31 days a month. */
const L: Closing = { how: "lapses", days: 13 * 3 * 31 };

export const CLOSING: Readonly<Record<string, Closing>> = {
  "nl:": E, // a meter's records (lib/usage-billing.ts), named by the store's folder; "nl:" alone is no key
  "nl:*": C,
  // ---------------------------------------------------------------- an account's sign-in: a person's, not a store's
  "nl:2fa:": C, "nl:2fa:hold:": C, "nl:2fa:locked:": C, "nl:2fa:lockedset:": C, "nl:2fa:rescue:": C, "nl:2fa:setup:": C,
  "nl:auth:devices:": C, "nl:auth:fresh:": C, "nl:auth:link:": C, "nl:auth:move:": C, "nl:auth:rec:": C, "nl:auth:rec:link:": C,
  "nl:auth:rec:set:": C, "nl:auth:rec:until:": C, "nl:auth:session:": C, "nl:auth:sessions:": C,
  "nl:pk:": C, "nl:pk:auth:": C, "nl:pk:cred:": C, "nl:pk:reg:": C, "nl:rl:address:": C, "nl:rl:signin:": C,
  "nl:account:stores:": D("prepare"),
  // ---------------------------------------------------------------- a-b
  "nl:ab:": E, "nl:ab:paid:": X(40),
  "nl:adsrv:": E, "nl:adsrv:ctx:": X(4), "nl:adsrv:last:": E, "nl:adsrv:sent:": X(3), "nl:adsrv:sub:": X(400),
  "nl:aff:": E, "nl:aff:link:": X(1), "nl:aff:payday:": E, "nl:aff:payday:lock": C, "nl:aff:seen:": X(2), "nl:aff:session:": X(30),
  "nl:affhub:": L, "nl:affhub:link:": Cr(1), "nl:affkit:": E,
  "nl:ai-spend:v2:{": C, "nl:ai-spend:v2:{YYYY-MM}": C, "nl:ai:": E,
  "nl:alert:": E, "nl:alert:seen:": Cr(2), "nl:allow:": E,
  "nl:api:k:": T("prepare"), "nl:api:keys:": E,
  "nl:ask:": E, "nl:ask:a:": X(1), "nl:ask:missed:": E,
  "nl:bench:ranges": C, "nl:bench:s:": Cr(21),
  "nl:billing:sync:after": C, "nl:billing:sync:cursor": C,
  "nl:blog:body:": E, "nl:blog:meta:": E, "nl:blog:pub:": E,
  "nl:busy:": Cr(1),
  // ---------------------------------------------------------------- c
  "nl:cal:busy:": T("nl:cal:cfg:", 1), "nl:cal:cfg:": E, "nl:cal:err:": T("nl:cal:cfg:", 1), "nl:cal:good:": T("nl:cal:cfg:", 1),
  "nl:cal:lock:": T("nl:cal:cfg:", 1), "nl:cal:out:": E, "nl:cal:tok:": T("nl:cal:cfg:"),
  "nl:call:busy:": E, "nl:call:confirmed:": X(430), "nl:call:creator-reminded:": E, "nl:call:lock:": E,
  "nl:call:moved:": X(200), "nl:call:reminded:": X(430), "nl:call:remindq": I, "nl:call:room:": E,
  "nl:callteam:": E, "nl:callteam:rr:": E,
  "nl:card:link:": X(21), "nl:card:open:": E, "nl:card:opens:": X(21),
  "nl:catalog:": E, "nl:catalog:move:cursor": C,
  "nl:cert:": T("nl:course:"),
  "nl:chatsum:": E,
  "nl:cimg:": T("files"), "nl:cimg:doors": C, "nl:cimg:n:": E,
  "nl:closing:lock": C,
  "nl:closed:batch": C, "nl:closed:due": C, "nl:closed:walk": C, "nl:closed:lock": C,
  "nl:cm:": E, "nl:cm:evmail:": X(30), "nl:cm:evmailq": I, "nl:cm:evq": I, "nl:cm:link:": X(1),
  "nl:cm:mail:": X(30), "nl:cm:mailq": I, "nl:cm:rl:": E, "nl:cm:unsub:": T("nl:cm:"),
  "nl:confirm:": X(40),
  "nl:contract-reserve:v1": C,
  "nl:cotrouble:": E, "nl:cotrouble:mail:": E,
  "nl:course:": E, "nl:courses:drip": I, "nl:courses:lock": C,
  "nl:creators:responses": C,
  "nl:crm:deals:": E, "nl:crm:fields:": E, "nl:crm:stages:": E, "nl:crm:v:": E,
  // ---------------------------------------------------------------- d-f
  "nl:data:": E,
  "nl:dc:addr:": E, "nl:dc:due": I, "nl:dc:lock": C, "nl:dc:mem:": E, "nl:dc:ok:": E, "nl:dc:prod:": E, "nl:dc:srv:": E, "nl:dc:state:": X(1),
  "nl:depth:": E,
  "nl:dir:listed": I, "nl:dir:page": Cr(1),
  "nl:domain:": T("prepare"),
  "nl:dun:": E, "nl:dun:card:": E, "nl:dun:cards:": E, "nl:dun:count:": E, "nl:dun:cursor": C, "nl:dun:report:": E,
  "nl:erase:ix:": E, "nl:erase:link:": Cr(1), "nl:erased:": E,
  "nl:esync:bad:": E, "nl:esync:cfg:": E, "nl:esync:j:": T("prepare", 7), "nl:esync:log:": E, "nl:esync:q": I,
  "nl:esync:seen:": X(30), "nl:esync:tags:": E,
  "nl:exposure:v1:": C, "nl:exposure:v1:YYYY-MM": C,
  "nl:fair:c:": E,
  "nl:firstsale:": C,
  "nl:form:r:": E, "nl:forms:": E,
  "nl:free:claim:": T("nl:erase:ix:", 7), "nl:free:in:": Cr(62), "nl:free:n:": C, "nl:free:uses:": X(7),
  "nl:fshare:": T("nl:fshares:"), "nl:fshare:n:": X(62), "nl:fshares:": E, "nl:fuse:": E, "nl:fuse:m:": E,
  // ---------------------------------------------------------------- g-l
  "nl:gift:": er(400), "nl:gift:pi:": X(400),
  "nl:goal:": E,
  "nl:grp:": er(400), "nl:grp:pi:": X(400), "nl:grp:take:": X(30),
  "nl:gsc:conn": C, "nl:gsc:q:": E, "nl:gsc:state:": C,
  "nl:health:": E,
  "nl:heard:done:": X(30), "nl:heard:off": I,
  "nl:hooks:anchor:": E, "nl:hooks:cfg:": E, "nl:hooks:d:": T("prepare", 7), "nl:hooks:evt:": X(30), "nl:hooks:log:": E,
  "nl:hooks:pos": C, "nl:hooks:q": I, "nl:hooks:stores": I,
  "nl:host:claims:": D("prepare"),
  "nl:hostcal:cfg:": D("prepare"), "nl:hostcal:err:": D("prepare"), "nl:hostcal:good:": D("prepare"), "nl:hostcal:lock:": D("prepare"),
  "nl:house:seed": C, "nl:house:seed:lock": C,
  "nl:imp:buy:": E, "nl:imp:who:": E,
  "nl:import:": X(14), "nl:imports:active": I, "nl:imports:busy:": E, "nl:imports:cf:": E, "nl:imports:cf:lock:": E,
  "nl:imports:list:": E, "nl:imports:lock": C, "nl:imports:moved:": E, "nl:imports:rows:": E,
  "nl:inbound:seen:": C,
  "nl:inbox:": E, "nl:inbox:tok:": T("nl:inbox:"),
  "nl:intro:c:": E,
  "nl:join:t:": T("nl:erase:ix:", 7),
  "nl:keys:": E,
  "nl:lc:": E,
  "nl:learn:enr:": E, "nl:learn:link:": X(1), "nl:learn:paid:": E, "nl:learn:pass:": T("nl:learn:passes:", 90), "nl:learn:passes:": E,
  "nl:learn:rate:addr:": X(1), "nl:learn:rate:ip:": X(1),
  "nl:leave:": E,
  "nl:lib:": L, "nl:lib:joined:": L, "nl:lib:link:": X(1),
  "nl:listed:": X(8),
  // ---------------------------------------------------------------- m
  "nl:mail-check:last": C, "nl:mail-check:lock": C,
  "nl:mail:bc:": T("nl:mail:bcs:"), "nl:mail:bcs:": E, "nl:mail:clk:": E, "nl:mail:day:": C, "nl:mail:drafts:": E, "nl:mail:enr:": E,
  "nl:mail:flowq": I, "nl:mail:flowq:lease": I, "nl:mail:flows:": E, "nl:mail:flowstats:": E, "nl:mail:health:": E, "nl:mail:lock": C,
  "nl:mail:mk:": T("nl:store:leads:", 400), "nl:mail:paused:": E, "nl:mail:queue": I, "nl:mail:ramp:": E, "nl:mail:segs:": E,
  "nl:mail:unsub:": T("nl:store:leads:"), "nl:mail:used:": E,
  "nl:manage:link:": X(1), "nl:manage:opens:": X(1), "nl:manage:portal:": E,
  "nl:meet:conn:": E, "nl:meet:lock:": E, "nl:meet:log:": E, "nl:meet:q": I, "nl:meet:r:": E, "nl:meet:refresh:": E, "nl:meet:rf:": E,
  "nl:meet:state:": X(1), "nl:meet:stores": I, "nl:meet:test:": E, "nl:meet:user:": I, "nl:meet:zoomseen:": C,
  "nl:member:status:": E,
  "nl:metaads:conn:": E, "nl:metaads:read:": E, "nl:metaads:reading:": E, "nl:metaads:state:": X(1), "nl:metaads:stores": I, "nl:metaads:user:": I,
  "nl:mnum:": E,
  "nl:monthly:lock": C, "nl:monthly:sent:": Cr(62),
  "nl:mv:": E, "nl:mv:due": I, "nl:mv:link:": T("nl:mv:"),
  // ---------------------------------------------------------------- n-p
  "nl:next:": E, "nl:next:lock:": E,
  "nl:nlink:": E, "nl:nlink:opens:": E,
  "nl:none": C,
  "nl:nudge:": E, "nl:nudge:count:": E, "nl:nudge:cursor": C,
  "nl:orders:folders:": I, "nl:orders:link:": X(1), "nl:orders:n:": E, "nl:orders:open:": E, "nl:orders:seen:": X(45),
  "nl:outreach:": E, "nl:outreach:stop:all": C, "nl:outreach:stoplink:": T("nl:outreach:"),
  "nl:pause:": E, "nl:pause:due": I, "nl:pause:last:": E,
  "nl:pay:currencies:": E,
  "nl:person:": E, "nl:person:find:": X(1),
  "nl:pfunnel:done:": E, "nl:pfunnel:seen:": E, "nl:pfunnels:": E,
  "nl:phone:cfg:": E, "nl:phone:seen:": X(40), "nl:phone:st:": E,
  "nl:pinv:": Cr(30),
  "nl:pkg:": T("nl:pkg:s:"), "nl:pkg:s:": E, "nl:pkg:t:": T("nl:pkg:s:"),
  "nl:plan:closing:": Cr(400), "nl:plan:closing:after": C, "nl:plan:ended": I, "nl:plan:paying": I,
  "nl:plans:lock": C, "nl:plans:pending": I,
  "nl:pod:": E, "nl:pod:by:": E, "nl:pod:n:": X(2), "nl:pod:ok:": E, "nl:pod:t:": T("nl:pod:by:"),
  "nl:pp:": E, "nl:pp:item:": X(400), "nl:pp:open:": E, "nl:pp:stores": I,
  "nl:ppsell:o:": T("nl:ppsell:sales:", 30), "nl:ppsell:own:": E, "nl:ppsell:paid:": T("nl:ppsell:sales:"), "nl:ppsell:pending:": E,
  "nl:ppsell:refunded:": E, "nl:ppsell:sales:": E, "nl:ppsell:watch:": E,
  "nl:pre:": E, "nl:pre:give:": X(1), "nl:pre:jobs": I, "nl:pre:pi:": X(430),
  "nl:preview:": T("prepare", 400),
  "nl:product:about:": E, "nl:product:note:": E, "nl:product:page:": E, "nl:product:pages:": E, "nl:product:pics:": E,
  "nl:pwyw:": E,
  // ---------------------------------------------------------------- q-s
  "nl:quiet:at:": C, "nl:quiet:lock": C, "nl:quiet:seen:": Cr(2), "nl:quiet:sent:": Cr(30),
  "nl:quiz:usage:": E,
  "nl:recent:": E, "nl:recent:feed:": E,
  "nl:recount:": C, "nl:recount:ids": C, "nl:recount:lock": C, "nl:recount:state": C, "nl:recount:sum": C,
  "nl:recover:asks": I, "nl:recover:link:": T("nl:erase:ix:", 400), "nl:recover:off:": E, "nl:recover:once:": E, "nl:recover:sent:": X(15),
  "nl:ref:all": C, "nl:ref:by:": C, "nl:ref:c:": C, "nl:ref:code:": C, "nl:ref:cursor": C, "nl:ref:list:": C, "nl:ref:mine:": C,
  "nl:ref:mycode:": C, "nl:ref:owed": C,
  "nl:remind:": C, "nl:remind:failed:": C, "nl:remind:lock": C,
  "nl:report:": C, "nl:report:t:": C,
  "nl:rev:": E, "nl:rev:all:": E, "nl:rev:ask:due": I, "nl:rev:ask:sent:": X(120), "nl:rev:link:": T("nl:erase:ix:", 60), "nl:rev:lock:": E,
  "nl:rev:new:": E, "nl:rev:off:": E, "nl:rev:pay:": E, "nl:rev:refunds:seen:": E, "nl:rev:refunds:since:": E,
  "nl:rev:stop:": T("nl:erase:ix:", 400), "nl:rev:stores": I, "nl:rev:sum:": E, "nl:rev:vis:": E,
  "nl:rl:": er(1), "nl:rl:aff:addr:": X(1), "nl:rl:aff:click:": X(1), "nl:rl:aff:ip:": X(1), "nl:rl:cm:addr:": X(1), "nl:rl:cm:ev:": E,
  "nl:rl:cm:ip:": X(1), "nl:rl:creators:": C, "nl:rl:export:": E, "nl:rl:free:addr:": X(1), "nl:rl:free:ip:": X(1), "nl:rl:hooks:test:": E,
  "nl:rl:licence:": X(1), "nl:rl:manage:addr:": X(1), "nl:rl:manage:ip:": X(1), "nl:rl:orders:addr:": X(1), "nl:rl:orders:ip:": X(1),
  "nl:rl:phone:quiet:": E, "nl:rl:phone:test:": E, "nl:rl:team-invite:": E,
  "nl:rlm:": er(62),
  "nl:sale:told:": X(40),
  "nl:save:": E,
  "nl:sblock:uses:": E, "nl:sblocks:": E,
  "nl:sender:": C,
  "nl:ses:did:": C, "nl:ses:h:": C, "nl:ses:once:": C, "nl:ses:rest:": C, "nl:ses:state": C, "nl:ses:told:": C,
  "nl:share:applied": I, "nl:share:lock": C, "nl:share:read-until": I, "nl:share:stores": I,
  "nl:ship:done:": X(400),
  "nl:slink:": T("nl:slink:store:"), "nl:slink:store:": E,
  "nl:sns:seen:": C,
  "nl:sold:": E, "nl:sold:lock:": E,
  "nl:stamp:copy:": T("prepare", 400), "nl:stamp:problem:": X(31),
  "nl:stats:": E,
  "nl:stock:": E, "nl:stock:lock:": E,
  "nl:storage:pending:": X(1),
  "nl:store:before-catalog:": T("prepare"), "nl:store:delivery:": E, "nl:store:delivery:over:": I, "nl:store:folder-owner:": E,
  "nl:store:handle:": Cr(30), "nl:store:id:": E, "nl:store:leads:": E, "nl:store:lock:": E, "nl:store:owner:*": C,
  "nl:store:owner:": T("prepare"), "nl:store:photo:": E,
  "nl:stream:auto:": E, "nl:stream:autoq": I, "nl:stream:cap:": E, "nl:stream:col:": E, "nl:stream:due": I, "nl:stream:gone": C,
  "nl:stream:lock": C, "nl:stream:peek:": E, "nl:stream:v:": E,
  "nl:stripe-check:last": C, "nl:stripe-check:lock": C,
  "nl:sweep:cursor": C,
  // ---------------------------------------------------------------- t-z
  "nl:tasks:bytes:": E, "nl:tasks:doors": C,
  "nl:team:": E, "nl:team:invite:": X(7), "nl:team:lock:": E, "nl:team:log:": E, "nl:team:of:": D("prepare"),
  "nl:tier:": X(1), "nl:tier:price:": E,
  "nl:traffic:day:": E, "nl:traffic:folders:": I, "nl:traffic:n:": E, "nl:traffic:r:": E, "nl:traffic:x:": E,
  "nl:upd:job:": X(120), "nl:upd:last:": E, "nl:upd:latest:": E, "nl:upd:off:": E, "nl:upd:stop:": T("nl:erase:ix:", 400), "nl:updq": I,
  "nl:upload-budget:v2:{": C, "nl:upload-budget:v2:{YYYY-MM}": C,
  "nl:upsell-slots:": X(8), "nl:upsell:": X(8), "nl:upsell:pending": I,
  "nl:usage-watch:told": C,
  "nl:vault:up:": X(1),
  "nl:verified:": E, "nl:verified:cursor": C,
  "nl:voice:": E, "nl:voice:lock:": E,
  "nl:watch:due": I, "nl:watch:folders:": I, "nl:watch:last:": E, "nl:watch:monthly:": C, "nl:watch:opened:": E, "nl:watch:sec:": E,
  "nl:wb:": E, "nl:wb:cursor": C, "nl:wb:link:": T("nl:erase:ix:", 60), "nl:wb:n:": E, "nl:wb:once:": E,
  "nl:weekly:lock": C, "nl:weekly:off": I, "nl:weekly:sent:": Cr(14), "nl:weekly:to:": { how: "erase", by: "handle" },
  "nl:wf:abandoned:": X(2), "nl:wf:day:": E, "nl:wf:held:": E, "nl:wf:log:": E, "nl:wf:run:": E, "nl:wf:runs:": E,
  "nl:wl:": E, "nl:wl:jobs": I, "nl:wl:t:": T("nl:erase:ix:", 7),
  "nl:wo:due": I, "nl:wo:n:": E, "nl:wo:r:": E, "nl:wo:start:": E,
  "nl:yearask:": E, "nl:yearask:count:": E, "nl:yearask:cursor": C,
  "nl:yearly-offer:": C, "nl:yearly:link:": X(30), "nl:yearly:price:": E,
};

/**
 * The families whose keys a closing store's follower reads before the walk
 * deletes them (lib/closed-store-data.ts, FOLLOWERS): named here so what they
 * read can be priced without the walk (tests/plan-cost-registry.ts, closure).
 */
export const FOLLOWED_FAMILIES = [
  "nl:cal:cfg:", "nl:cm:", "nl:course:", "nl:erase:ix:", "nl:fshares:", "nl:inbox:", "nl:learn:passes:", "nl:mail:bcs:",
  "nl:mv:", "nl:outreach:", "nl:pkg:s:", "nl:pod:by:", "nl:ppsell:sales:", "nl:slink:store:", "nl:store:leads:",
] as const;

/** The family a key belongs to, by the longest name it starts with; "" for none. */
export function closingFamilyOf(key: string): string {
  let best = "";
  for (const name of Object.keys(CLOSING)) if (key.startsWith(name) && name.length > best.length) best = name;
  return best;
}

/** What becomes of a key when its store closes; a key of no family is left as it is. */
export function closingOf(key: string): Closing | null {
  const family = closingFamilyOf(key);
  return family ? CLOSING[family] : null;
}
