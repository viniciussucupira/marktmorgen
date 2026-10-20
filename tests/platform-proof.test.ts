import assert from "node:assert/strict";
import test from "node:test";
import {platformProof,PLATFORM_PROOF_SNAPSHOT,type PlatformProofSnapshot} from "@/lib/platform-proof";
const valid:PlatformProofSnapshot={asOf:"2026-10-20T12:00:00Z",evidenceRef:"synthetic-fixture-only",mode:"live",excludesDemoAndTest:true,counts:{stores:100,sales:1000,activeCreators:50},activeWindowDays:30};
test("actual unknown platform totals stay hidden; exact thresholds never round upward",()=>{
 assert.deepEqual(platformProof(PLATFORM_PROOF_SNAPSHOT),[]);
 assert.deepEqual(platformProof({...valid,counts:{stores:99,sales:999,activeCreators:49}}),[]);
 assert.deepEqual(platformProof(valid).map(row=>row.count),[100,1000,50]);
 assert.deepEqual(platformProof({...valid,counts:{stores:101,sales:null,activeCreators:50.5}}).map(row=>row.count),[101]);
});
test("missing evidence, demo/test, invalid/future/stale dates and invalid thresholds stay hidden",()=>{
 for(const snapshot of [{...valid,evidenceRef:""},{...valid,mode:"test" as "live"},{...valid,excludesDemoAndTest:false as true},{...valid,asOf:"invalid"},{...valid,asOf:"2026-10-21T00:00:00Z"},{...valid,asOf:"2026-01-01T00:00:00Z"}])assert.deepEqual(platformProof(snapshot),[]);
 assert.deepEqual(platformProof(valid,{stores:0,sales:NaN,activeCreators:-1}),[]);
});
