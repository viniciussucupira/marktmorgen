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
