import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Pricing} from '../components/home-parts';
import TermsPage from '../app/terms/page';
import {HELP_SECTIONS} from '../lib/help-content';
import {FEATURE_PAGES} from '../lib/feature-pages';
import {paidVideoWords} from '../lib/video-admission-rules';
const text = (component: Parameters<typeof createElement>[0]) => renderToStaticMarkup(createElement(component)).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
test('actual pricing discloses every plan playback threshold',()=>{
 const copy=text(Pricing);assert.ok(copy.includes(paidVideoWords()),copy.slice(-4000));
 assert.doesNotMatch(copy,/400 watched hours/);
});
test('actual terms disclose paid, trial and setup playback separately',()=>{
 const copy=text(TermsPage);assert.ok(copy.includes(paidVideoWords()));
 assert.ok(/Free trials have 1 hour a month/.test(copy),copy.slice(copy.indexOf("Lesson video."),copy.indexOf("Lesson video.")+900));
 assert.ok(/threshold is 15 minutes/.test(copy),copy.slice(copy.indexOf("Lesson video."),copy.indexOf("Lesson video.")+900));
 assert.doesNotMatch(copy,/free trials have 400/);
});
test('help and course descriptions match admission instead of legacy invoice rights',()=>{
 for(const content of [HELP_SECTIONS,FEATURE_PAGES]){
   const copy=JSON.stringify(content);assert.ok(copy.includes(paidVideoWords()));
   assert.match(copy,/1 hour.*free trial|1 hour in the free trial/);
   assert.match(copy,/15 minutes/);
   assert.doesNotMatch(copy,/400 watched hours|400 hours a month in the free trial/);
 }
});
