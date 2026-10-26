import test from "node:test";
import assert from "node:assert/strict";
import { WAIT_SECONDS } from "@/lib/waitlist-rules";
import {
  parsePlatformWaitlistEntry, planPlatformWaitlistRequest,
  planPlatformWaitlistConfirmation, planPlatformWaitlistLeave,
  confirmedPlatformWaitlistContact, type WaitlistRequest, type PlatformWaitlistEntry,
} from "@/lib/platform-waitlist-record";
import type { PlatformWaitlistGrant } from "@/lib/waitlist-tokens";
const now=1800000000;
function request(news=false): WaitlistRequest {return {
 email:"  Creator@Example.INVALID ",plan:null,country:null,
 consent:{version:"opening-v1",text:"Email me once when selling opens.\nNo opening date is promised.",
 newsVersion:"news-v1",newsText:"Also send me optional Marktmorgen news.",newsRequested:news},
 explicitRequest:true,now,retainedUntil:now+WAIT_SECONDS,
};}
function pending(news=false){const result=planPlatformWaitlistRequest(request(news),null);assert.ok(result);return result.next;}
const raw=(e:PlatformWaitlistEntry)=>JSON.stringify(e);
function grant(e:PlatformWaitlistEntry,k:"confirm"|"leave"="confirm"):PlatformWaitlistGrant{return {
 scope:"platform_waitlist",version:1,entryId:e.entryId,generation:e.generation,k,
 issuedAt:e.requestedAt,expiresAt:e.requestedAt+60,
};}
test("explicit requests preserve exact offered consent and optional unknown metadata without confirming",()=>{
 const r=request();const result=planPlatformWaitlistRequest(r,null)!;
 assert.equal(result.expected,null);assert.equal(result.next.email,"creator@example.invalid");
 assert.equal(result.next.state,"pending");assert.equal(result.next.confirmedAt,null);
 assert.equal(result.next.plan,null);assert.equal(result.next.country,null);
 assert.deepEqual(result.next.consent,r.consent);
 assert.equal(confirmedPlatformWaitlistContact(raw(result.next),now+1),null);
 assert.deepEqual(parsePlatformWaitlistEntry(raw(result.next)),result.next);
});
test("absent/corrupt/unknown prior reads cannot masquerade as a new enrollment",()=>{
 for(const before of [undefined,42,"","null","{bad","{}"])
  assert.equal(planPlatformWaitlistRequest(request(),before),null);
 assert.equal(planPlatformWaitlistRequest({...request(),explicitRequest:false},null),null);
});
test("email validation is shared and bad metadata, clocks, lifetime or consent refuse",()=>{
 for(const change of [
  {email:"not-an-email"},{plan:"paid"},{country:"BR\nprivate"},
  {now:-1},{now:0.5},{retainedUntil:now},{retainedUntil:now+WAIT_SECONDS+1},
  {consent:{...request().consent,version:""}},{consent:{...request().consent,text:""}},
  {consent:{...request().consent,newsRequested:"yes"}},
 ])assert.equal(planPlatformWaitlistRequest({...request(),...change} as WaitlistRequest,null),null);
});
test("confirmation binds identity, generation, purpose and request time before changing evidence",()=>{
 const e=pending(), before=raw(e), token=grant(e);
 for(const changed of [{entryId:"f".repeat(64)},{generation:"c".repeat(32)},{k:"leave"},{issuedAt:now-1},{expiresAt:now+WAIT_SECONDS+1}])
  assert.equal(planPlatformWaitlistConfirmation(before,{...token,...changed} as PlatformWaitlistGrant,now+1),null);
 const result=planPlatformWaitlistConfirmation(before,token,now+1)!;
 assert.equal(result.expected,before);assert.equal(result.next.state,"confirmed");
 assert.equal(result.next.confirmedAt,now+1);assert.equal(raw(e),before);
 assert.deepEqual(result.next.consent,e.consent);
});
test("confirmation replay preserves the first confirmation timestamp and explicit newsletter choice",()=>{
 const e=pending(), token=grant(e);
 const first=planPlatformWaitlistConfirmation(raw(e),token,now+1)!.next;
 const again=planPlatformWaitlistConfirmation(raw(first),token,now+2)!;
 assert.equal(again.changed,false);assert.deepEqual(again.next,first);
 assert.deepEqual(confirmedPlatformWaitlistContact(raw(first),now+2),{
  email:e.email,confirmedAt:now+1,plan:null,country:null,newsOptIn:false,
 });
 const opted=pending(true);
 const yes=planPlatformWaitlistConfirmation(raw(opted),grant(opted),now+1)!.next;
 assert.equal(confirmedPlatformWaitlistContact(raw(yes),now+2)?.newsOptIn,true);
});
test("leaving pending or confirmed state clears contact metadata and excludes owner-report projection",()=>{
 for(const confirmed of [false,true]){
  let e=pending(true);
  if(confirmed)e=planPlatformWaitlistConfirmation(raw(e),grant(e),now+1)!.next;
  const result=planPlatformWaitlistLeave(raw(e),grant(e,"leave"),now+2)!;
  assert.equal(result.next.state,"left");assert.equal(result.next.email,null);
  assert.equal(result.next.plan,null);assert.equal(result.next.country,null);
  assert.equal(result.next.leftAt,now+2);assert.deepEqual(result.next.consent,e.consent);
  assert.equal(confirmedPlatformWaitlistContact(raw(result.next),now+3),null);
  assert.equal(planPlatformWaitlistConfirmation(raw(result.next),grant(e),now+3),null);
  const again=planPlatformWaitlistLeave(raw(result.next),grant(e,"leave"),now+3)!;
  assert.equal(again.changed,false);assert.equal(again.next.leftAt,now+2);
 }
});
test("fresh re-entry requires explicit request/new generation and never inherits earlier news consent",()=>{
 const e=pending(true), old=grant(e), left=planPlatformWaitlistLeave(raw(e),grant(e,"leave"),now+1)!.next;
 assert.equal(planPlatformWaitlistRequest({...request(),explicitRequest:false,now:now+2},raw(left)),null);
 const next=planPlatformWaitlistRequest({...request(false),now:now+2},raw(left))!.next;
 assert.notEqual(next.generation,e.generation);assert.equal(next.state,"pending");
 assert.equal(next.consent.newsRequested,false);assert.equal(next.confirmedAt,null);
 assert.equal(planPlatformWaitlistConfirmation(raw(next),old,now+3),null);
 assert.equal(planPlatformWaitlistLeave(raw(next),grant(e,"leave"),now+3),null);
 const confirmed=planPlatformWaitlistConfirmation(raw(next),grant(next),now+3)!.next;
 assert.equal(confirmedPlatformWaitlistContact(raw(confirmed),now+4)?.newsOptIn,false);
});
test("pending updates rotate generation while confirmed records are not silently overwritten",()=>{
 const e=pending(), old=grant(e);
 const next=planPlatformWaitlistRequest({...request(),now:now+1,plan:"studio",country:"Brazil"},raw(e))!.next;
 assert.notEqual(next.generation,e.generation);
 assert.equal(planPlatformWaitlistConfirmation(raw(next),old,now+2),null);
 const yes=planPlatformWaitlistConfirmation(raw(next),grant(next),now+2)!.next;
 assert.equal(planPlatformWaitlistRequest({...request(),now:now+3},raw(yes)),null);
 const contact=confirmedPlatformWaitlistContact(raw(yes),now+3)!;
 assert.equal(contact.plan,"studio");assert.equal(contact.country,"Brazil");
});
test("expired records, backwards clocks and mismatched identity never authorize a transition",()=>{
 const e=pending();
 assert.equal(planPlatformWaitlistConfirmation(raw(e),grant(e),now-1),null);
 assert.equal(planPlatformWaitlistLeave(raw(e),grant(e,"leave"),e.retainedUntil),null);
 assert.equal(confirmedPlatformWaitlistContact(raw(e),e.retainedUntil),null);
 assert.equal(planPlatformWaitlistRequest({...request(),email:"other@example.invalid",now:now+1},raw(e)),null);
 assert.equal(planPlatformWaitlistRequest({...request(),now:e.retainedUntil,retainedUntil:e.retainedUntil+60},raw(e)),null);
});
test("consent digest and stored invariants are checked; it is an integrity field, not authentication",()=>{
 const e=pending();
 for(const changed of [
  {...e,consent:{...e.consent,text:"Different consent"}},
  {...e,state:"confirmed"}, {...e,confirmedAt:now+1},
  {...e,email:"OTHER@example.invalid"}, {...e,retainedUntil:now},
  {...e,state:"left",leftAt:now,email:e.email},
 ])assert.equal(parsePlatformWaitlistEntry(JSON.stringify(changed)),null);
 const extra={...e,unexpected:{email:"do-not-copy@example.invalid",approved:true}};
 assert.deepEqual(parsePlatformWaitlistEntry(JSON.stringify(extra)),e);
});
test("transition plans carry the exact previous value for later atomic persistence without writing it",()=>{
 const e=pending(), before=raw(e);
 const confirm=planPlatformWaitlistConfirmation(before,grant(e),now+1)!;
 const leave=planPlatformWaitlistLeave(before,grant(e,"leave"),now+1)!;
 assert.equal(confirm.expected,before);assert.equal(leave.expected,before);
 assert.notEqual(raw(confirm.next),raw(leave.next));assert.equal(raw(e),before);
});
