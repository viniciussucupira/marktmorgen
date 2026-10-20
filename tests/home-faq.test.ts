import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeQuestions, HOME_QUESTIONS } from '../lib/home-faq';

test('FAQ capability data describes the server-provided PayPal availability',()=>{
 const without=homeQuestions(false).find(x=>x.q.includes('Stan'))!.a;
 const withPayPal=homeQuestions(true).find(x=>x.q.includes('Stan'))!.a;
 assert.match(without,/PayPal at checkout/);assert.doesNotMatch(withPayPal,/PayPal at checkout/);
});
test('callers without deployment capabilities use the conservative FAQ default',()=>{
 assert.deepEqual(HOME_QUESTIONS,homeQuestions(false));
 assert.deepEqual(homeQuestions(),homeQuestions(false));
});

test("FAQ preserves implemented meeting-provider capability with connection conditions",()=>{
 const answer=homeQuestions(false).find(question=>question.q.includes("Stan"))!.a;
 assert.doesNotMatch(answer,/Zoom links made for each booking and webinar/);
 assert.match(answer,/Google Meet and Zoom links for supported connected accounts/);
 assert.match(answer,/provider availability and connection requirements/);
});

import { decisionQuestions } from "@/lib/home-faq";
import { PRICING_QUESTIONS } from "@/lib/pricing-page-data";
import { PLAN_TITLES,publishedPriceWords } from "@/lib/plan";
test("six decision questions share exact answers on home and pricing",()=>{
 const items=decisionQuestions();assert.equal(items.length,6);assert.equal(homeQuestions().length,11);
 for(const item of items){assert.deepEqual(homeQuestions().find(q=>q.q===item.q),item);assert.deepEqual(PRICING_QUESTIONS.find(q=>q.q===item.q),item);assert.ok(item.links?.length);}
 const cost=items[0].a;for(const tier of ["creator","pro","scale"] as const){assert.ok(cost.includes(PLAN_TITLES[tier]));for(const cycle of ["month","year"] as const)assert.ok(cost.includes(publishedPriceWords(tier,cycle)));}
 assert.match(cost,/not open yet/);
});
test("FAQ does not invent a migration, support SLA or setup-time promise",()=>{
 const items=decisionQuestions();
 assert.match(items[1].a,/renew|cancel/);assert.ok(items[1].links?.some(l=>l.href==="/terms#closing"));
 assert.ok(items[2].links?.some(l=>l.href==="/platform/switching-to-marktmorgen"));assert.match(items[2].a,/do not automatically move/);assert.match(items[2].a,/consenting contacts/);
 assert.ok(items[3].links?.some(l=>l.href==="/developers"));assert.match(items[3].a,/no native Marktmorgen app/);assert.match(items[3].a,/every plan/);
 assert.match(items[4].a,/support@marktmorgen.com/);assert.match(items[4].a,/do not publish a guaranteed response time/);
 assert.match(items[5].a,/no measured setup-time promise/);assert.ok(items[5].links?.some(l=>l.href==="/demo"));
});
