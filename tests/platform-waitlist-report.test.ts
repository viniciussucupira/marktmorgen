import test from "node:test";
import assert from "node:assert/strict";
import { buildPlatformWaitlistReport, type WaitlistReportInput } from "@/lib/platform-waitlist-report";
import { planPlatformWaitlistRequest, planPlatformWaitlistConfirmation, planPlatformWaitlistLeave } from "@/lib/platform-waitlist-record";
import { parseCsv } from "@/lib/csv";
const now=1800000000;
function entry(email="creator@example.invalid",country:string|null=null,at=now-10) {
 const e=planPlatformWaitlistRequest({email,plan:null,country,
  consent:{version:"v1",text:"One opening email.",newsVersion:"v1",newsText:"Optional news.",newsRequested:false},
  explicitRequest:true,now:now-100,retainedUntil:now+1000},null)!.next;
 const token={scope:"platform_waitlist" as const,version:1 as const,entryId:e.entryId,generation:e.generation,
  k:"confirm" as const,issuedAt:e.requestedAt,expiresAt:now+50};
 return {pending:e,confirmed:planPlatformWaitlistConfirmation(JSON.stringify(e),token,at)!.next,token};
}
const raw=(e:unknown)=>JSON.stringify(e);
const input=(records:unknown[]):WaitlistReportInput=>({records,complete:true,now,since:now-10,maxRecords:100,maxCsvBytes:100000});
test("private report counts confirmed contacts, including exact week boundary, without exposing emails in grouped totals",()=>{
 const a=entry("a@example.invalid","Brazil",now-11),b=entry("b@example.invalid",null,now-10);
 const report=buildPlatformWaitlistReport(input([raw(a.confirmed),raw(b.confirmed)]))!;
 assert.equal(report.totalConfirmed,2);assert.equal(report.newConfirmed,1);
 assert.deepEqual(report.byPlan,[{plan:null,count:2}]);
 assert.deepEqual(report.byCountry,[{country:null,count:1},{country:"Brazil",count:1}]);
 assert.deepEqual(parseCsv(report.csv).header,["Email","Confirmation date (UTC)","Intended plan","Country"]);
 assert.equal(parseCsv(report.csv).rows.length,2);
 assert.equal(report.csvBytes,Buffer.byteLength(report.csv,"utf8"));
});
test("pending, withdrawn and expired contacts never appear or inflate counts",()=>{
 const p=entry("pending@example.invalid"),l=entry("left@example.invalid"),x=entry("expired@example.invalid");
 const left=planPlatformWaitlistLeave(raw(l.confirmed),{...l.token,k:"leave"},now-1)!.next;
 const expired={...x.confirmed,retainedUntil:now}; // valid stored record, expired at report time
 const report=buildPlatformWaitlistReport(input([raw(p.pending),raw(left),raw(expired)]))!;
 assert.equal(report.totalConfirmed,0);assert.equal(report.newConfirmed,0);
 assert.deepEqual(report.byPlan,[]);assert.deepEqual(report.byCountry,[]);
 assert.equal(parseCsv(report.csv).rows.length,0);
});
test("CSV reuses formula and quote protection while summary keeps exact self-reported text",()=>{
 const country='=HYPERLINK("example.invalid","name")';
 const e=entry("+creator@example.invalid",country);
 const report=buildPlatformWaitlistReport(input([raw(e.confirmed)]))!;
 const row=parseCsv(report.csv).rows[0];
 assert.equal(row[0],"'"+e.confirmed.email);assert.equal(row[3],"'"+country);
 assert.deepEqual(report.byCountry,[{country,count:1}]);
 assert.ok(report.csv.includes('""example.invalid""'));
});
test("unknown, corrupt, duplicate, future or incomplete snapshots refuse entirely",()=>{
 const e=entry(),r=raw(e.confirmed);
 for(const records of [[r,r],[r,"{}"],[undefined],[r,raw({...e.confirmed,updatedAt:now+1})]])
  assert.equal(buildPlatformWaitlistReport(input(records)),null);
 assert.equal(buildPlatformWaitlistReport({...input([r]),complete:false}),null);
});
test("row and UTF-8 byte limits refuse rather than truncate; exact byte boundary succeeds",()=>{
 const e=entry("unicode@example.invalid","日本");
 const i=input([raw(e.confirmed)]),result=buildPlatformWaitlistReport(i)!;
 assert.equal(buildPlatformWaitlistReport({...i,maxCsvBytes:result.csvBytes-1}),null);
 assert.equal(buildPlatformWaitlistReport({...i,maxCsvBytes:result.csvBytes})?.csv,result.csv);
 assert.equal(buildPlatformWaitlistReport({...input([raw(e.pending),raw(e.confirmed)]),maxRecords:1}),null);
 assert.equal(buildPlatformWaitlistReport({...input([]),maxCsvBytes:1}),null);
});
test("unknown budgets and invalid dates cannot default to unlimited or zero",()=>{
 for(const change of [{maxRecords:0},{maxRecords:10001},{maxRecords:NaN},{maxCsvBytes:Infinity},
  {maxCsvBytes:4194305},{now:-1},{since:now+1},{now:8640000000001},{now:0.5}])
  assert.equal(buildPlatformWaitlistReport({...input([]),...change}),null);
});
test("scan order does not change CSV or grouped totals and input remains untouched",()=>{
 const a=raw(entry("z@example.invalid","Unknown").confirmed),b=raw(entry("a@example.invalid",null).confirmed);
 const rows=[a,b],copy=[...rows];
 assert.deepEqual(buildPlatformWaitlistReport(input(rows)),buildPlatformWaitlistReport(input([b,a])));
 assert.deepEqual(rows,copy);
});
test("empty complete snapshot produces an explicit zero report with header and dates",()=>{
 const report=buildPlatformWaitlistReport(input([]))!;
 assert.equal(report.totalConfirmed,0);assert.equal(report.newConfirmed,0);
 assert.equal(report.generatedAt,new Date(now*1000).toISOString());
 assert.equal(report.since,new Date((now-10)*1000).toISOString());
 assert.equal(report.csv.split("\r\n").length,2);
});
