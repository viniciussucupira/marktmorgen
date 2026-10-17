import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGES } from '../lib/site-pages';
import { feeWords, gumroadSums } from '../lib/fee-words';

 test('Beacons comparison discloses the locked plan shares instead of promising zero on every plan',()=>{
 const page=PAGES.find(p=>p.slug==='beacons')!;
 const table=page.blocks.find(b=>b.kind==='table')!;
 if(table.kind!=='table')throw Error('missing comparison');
 const share=table.rows.find(r=>r[0]==='Cut of each sale')![2];
 assert.equal(share,feeWords().short);assert.match(share,/6\.25%/);assert.match(share,/2\.75%/);
 });
 test('Gumroad comparison distinguishes processing and the monthly volume discount',()=>{
 const page=PAGES.find(p=>p.slug==='gumroad')!;const rendered=JSON.stringify(page);
 assert.match(rendered,/5% \+ \$0\.50/);assert.match(rendered,/\$20,000/);assert.match(rendered,/Discover.*includes processing/);
 assert.doesNotMatch(rendered,/Under about nine/);
 });
 test('worked-example conclusions do not claim Gumroad never discounts larger volumes',()=>{
 for(const live of [true,false]){const copy=gumroadSums(live).gap;assert.match(copy,/\$20,000/);assert.match(copy,/5% \+ \$0\.50/);assert.doesNotMatch(copy,/every sale at any size/);}
 });
