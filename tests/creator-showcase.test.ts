import assert from "node:assert/strict";
import test from "node:test";
import {creatorShowcase,APPROVED_CREATOR_SHOWCASE,type CreatorShowcasePermission} from "@/lib/creator-showcase";
import {findPage} from "@/lib/site-pages";
const valid:CreatorShowcasePermission={name:"Synthetic permitted creator",href:"/@syntheticfixture",description:"Synthetic fixture, never a public customer record.",permission:{scope:"public-showcase",grantedAt:"2026-10-19",recordedAt:"2026-10-20",evidenceRef:"synthetic-test-only"}};
test("without actual recorded permission only the labeled demo is public",()=>{
 assert.equal(APPROVED_CREATOR_SHOWCASE.length,0);
 assert.deepEqual(creatorShowcase().map(entry=>[entry.name,entry.kind,entry.href]),[["Harbor Kitchen","demo","/demo"]]);
 const page=findPage("proof","creator-showcase");assert.ok(page);assert.match(page.intro,/No listing is a promise/);
});
test("missing, revoked, future, invalid and out-of-scope permission cannot become customer proof",()=>{
 for(const permission of [{...valid.permission,evidenceRef:""},{...valid.permission,revokedAt:"2026-10-20"},{...valid.permission,recordedAt:"2026-10-21"},{...valid.permission,grantedAt:"2026-99-99"},{...valid.permission,grantedAt:"2026-02-30"},{...valid.permission,scope:"private" as "public-showcase"}]){
 assert.equal(creatorShowcase([{...valid,permission}])[0].kind,"demo");
 }
 assert.equal(creatorShowcase([{...valid,href:"https://unapproved.example.test"}])[0].kind,"demo");
 assert.equal(creatorShowcase([valid])[0].permissionRecordedAt,"2026-10-20");
});
