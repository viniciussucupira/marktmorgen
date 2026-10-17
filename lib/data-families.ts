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
  "nl:mail:unsub:", "nl:mv:", "nl:mv:link:", "nl:outreach:", "nl:outreach:stoplink:", "nl:person:",
  "nl:pfunnel:done:", "nl:pfunnel:seen:", "nl:pfunnels:", "nl:pkg:", "nl:pkg:t:", "nl:pod:", "nl:pod:by:",
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
  "nl:chatsum:", "nl:cimg:", "nl:cimg:doors", "nl:cimg:n:", "nl:closing:lock", "nl:cm:evmail:",
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
  "nl:pause:last:", "nl:pay:currencies:", "nl:person:find:", "nl:phone:cfg:", "nl:phone:seen:",
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
