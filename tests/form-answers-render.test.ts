import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormAnswers } from "@/components/form-answers";
import { form, responses } from "./form-response-fixture";
const show=(options:Partial<Parameters<typeof FormAnswers>[0]>={})=>renderToStaticMarkup(createElement(FormAnswers,{form,latest:responses,total:200,canReview:true,blocked:false,existingDeals:[],existingDealsAvailable:true,onReview(){},...options}));
test("answer review exposes labeled filters and distinct selected download",()=>{
  const html=show();assert.match(html,/Search loaded answers/);assert.match(html,/Quiz result/);
  assert.match(html,/Download shown answers/);assert.match(html,/Showing 4 of 4 loaded answers/);
  assert.match(html,/Only the newest 4 of 200 kept answers are loaded/);
  assert.match(html,/Search and filters apply to these loaded answers/);
});
test("roles without CRM review never receive its actions",()=>{
  const html=show({canReview:false});assert.doesNotMatch(html,/Review as opportunity|View opportunity|>CRM</);
});
test("linked responses show the existing opportunity action",()=>{
  const html=show({existingDeals:[{id:"opportunity",title:"Linked",email:"jose@example.com",stage:"new",formResponseRef:responses[0].opportunityRef}]});
  assert.match(html,/View opportunity/);
});
test("empty loaded responses disable the selected download",()=>{
  const html=show({latest:[],total:0});assert.match(html,/disabled=""[^>]*>Download shown answers/);
  assert.match(html,/No loaded answers match/);
});
test("response values remain escaped in the table",()=>{
  const row={...responses[0],answers:{...responses[0].answers,name00:"<script>alert(1)</script>"}};
  const html=show({latest:[row]});assert.match(html,/&lt;script&gt;alert/);assert.doesNotMatch(html,/<script>alert/);
});
test("missing server response reference cannot expose a working conversion action",()=>{
  const html=show({latest:[{...responses[0],opportunityRef:undefined}]});
  assert.match(html,/disabled=""[^>]*>Review as opportunity/);
});

test("CRM link controls distinguish confirmed data from an unavailable read",()=>{
  const ready=show();assert.match(ready,/Opportunity link/);assert.match(ready,/With linked opportunity/);assert.match(ready,/Without linked opportunity/);
  const unknown=show({existingDealsAvailable:false});
  assert.match(unknown,/Opportunity links could not be checked/);
  assert.match(unknown,/disabled=""[^>]*>Review as opportunity/);
  assert.match(unknown,/José/);assert.match(unknown,/Download shown answers/);
});
test("CRM filters are omitted for roles that cannot review opportunities",()=>{
  assert.doesNotMatch(show({canReview:false}),/Opportunity link|With linked opportunity/);
});
