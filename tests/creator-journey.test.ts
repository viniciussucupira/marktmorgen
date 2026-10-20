import assert from "node:assert/strict";
import test from "node:test";
import { CREATOR_JOURNEY } from "@/lib/creator-journey";
import { FEATURE_PAGES } from "@/lib/feature-pages";
test("creator journey follows the owner's six stages and resolves to existing feature pages",()=>{
 assert.deepEqual(CREATOR_JOURNEY.map(stage=>stage.title),["Create","Charge","Deliver","Sell more","Automate","Grow"]);
 assert.equal(new Set(CREATOR_JOURNEY.map(stage=>stage.id)).size,6);
 for(const stage of CREATOR_JOURNEY){assert.ok(stage.body.length>50);assert.ok(stage.features.length>0);for(const feature of stage.features){const page=FEATURE_PAGES.find(page=>page.section==="platform"&&page.slug===feature.slug);assert.ok(page,feature.slug);assert.ok(feature.label.length>3);}}
});
