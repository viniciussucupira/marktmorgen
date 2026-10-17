import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UsageMeter } from '@/components/usage-meter';
const format=(n:number)=>n+' visits';
const render=(used:number|null,limit=100)=>renderToStaticMarkup(createElement(UsageMeter,{label:'Visits this month',used,limit,format,unavailable:'Measurement unavailable; new admission paused.'}));
test('unknown usage has a status message without a false zero or progress value',()=>{
 const html=render(null);assert.match(html,/role="status"/);assert.match(html,/new admission paused/);assert.match(html,/100 visits/);assert.doesNotMatch(html,/progressbar|aria-valuenow|0 visits of/);
});
test('acknowledged zero remains a real zero with an accessible zero progress value',()=>{
 const html=render(0);assert.match(html,/0 visits/);assert.match(html,/aria-valuenow="0"/);assert.match(html,/width:0%/);assert.doesNotMatch(html,/role="status"/);
});
test('invalid counters are unavailable, never rendered as valid balances',()=>{
 for(const used of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){const html=render(used);assert.match(html,/role="status"/);assert.doesNotMatch(html,/progressbar|aria-valuenow/);}
});
test('invalid thresholds do not invent a zero allowance',()=>{
 for(const limit of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){const html=render(0,limit);assert.match(html,/threshold could not be verified/);assert.doesNotMatch(html,/Monthly threshold: 0|progressbar/);}
});
test('recorded overuse remains visible while progress stays within accessible bounds',()=>{
 const html=render(150);assert.match(html,/150 visits/);assert.match(html,/aria-valuenow="100"/);assert.match(html,/width:100%/);
});
test('a verified zero threshold is exhausted rather than dividing by zero',()=>{
 const html=render(0,0);assert.match(html,/aria-valuenow="100"/);assert.doesNotMatch(html,/NaN|Infinity/);
});
