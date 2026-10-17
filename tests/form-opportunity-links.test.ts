import test from "node:test";
import assert from "node:assert/strict";
import { confirmedFormOpportunity, mergeFormOpportunities } from "@/lib/form-deal";
import { filterFormResponses } from "@/lib/form-response-filter";
import { form, responses } from "./form-response-fixture";
const ref=responses[0].opportunityRef;
const record={id:ref.slice(0,10),title:"New inquiry",email:"JOSE@example.com",stage:"lead00",formResponseRef:ref};
test("only the exact acknowledged source becomes a newly linked opportunity",()=>{
  assert.deepEqual(confirmedFormOpportunity(record,ref),{...record,email:"jose@example.com"});
  for(const change of [{id:"wrong00000"},{formResponseRef:"b".repeat(64)},{title:""},{title:4},{email:"bad"},{stage:"invalid-stage"}])
    assert.equal(confirmedFormOpportunity({...record,...change},ref),null);
});
test("missing and malformed conversion acknowledgements cannot hide a response from review",()=>{
  for(const raw of [null,[],true,{}, {...record,formResponseRef:undefined}])assert.equal(confirmedFormOpportunity(raw,ref),null);
  assert.equal(confirmedFormOpportunity(record,"bad"),null);
});
test("newly confirmed links immediately leave the unlinked worklist",()=>{
  const recorded=confirmedFormOpportunity(record,ref)!;
  const known=mergeFormOpportunities([],[recorded]);
  const refs=new Set(known.flatMap(row=>row.formResponseRef?[row.formResponseRef]:[]));
  const pending=filterFormResponses(form,responses,"","",{available:true,filter:"unlinked",refs});
  assert.deepEqual(pending,responses.slice(1));
  assert.equal(filterFormResponses(form,responses,"","",{available:true,filter:"linked",refs})[0],responses[0]);
});
test("refreshed server records replace temporary client facts without duplicate opportunities",()=>{
  const old={...record,email:"jose@example.com"},fresh={...old,title:"Reviewed elsewhere"};
  const existing=Object.freeze([fresh]), recorded=Object.freeze([old,old]);
  const merged=mergeFormOpportunities(existing,recorded);
  assert.deepEqual(merged,[fresh]);assert.equal(merged[0],fresh);
});
test("repeated confirmed acknowledgements add only one new identity",()=>{
  const known=mergeFormOpportunities([],[record,record]);
  assert.equal(known.length,1);assert.equal(known[0].formResponseRef,ref);
});
