import {hasPathReturnGap,localDay,pathProgress,NO_FACTS} from "@/lib/path-rules";
import {pathReturnMission,readReturnStep,returnReminderOf} from "@/lib/path-return-rules";
import {done,is,part} from "./check";
const answers={minutes:30 as const,audience:"instagram" as const,subject:"bread",skills:"baking"};
part("Return uses saved creator-local dates");
const midnights=[
 ["America/Los_Angeles","2026-10-09T06:59:00Z","2026-10-09T07:01:00Z"],
 ["America/New_York","2026-10-09T03:59:00Z","2026-10-09T04:01:00Z"],
 ["Europe/London","2026-10-08T22:59:00Z","2026-10-08T23:01:00Z"],
 ["Europe/Berlin","2026-10-08T21:59:00Z","2026-10-08T22:01:00Z"],
 ["Australia/Sydney","2026-10-08T12:59:00Z","2026-10-08T13:01:00Z"],
];
for(const [zone,before,after] of midnights){
 const a=Date.parse(before),b=Date.parse(after);
 is(zone+" before midnight",localDay(zone,a),"2026-10-08");
 is(zone+" after midnight",localDay(zone,b),"2026-10-09");
 is(zone+" six dates",hasPathReturnGap(["2026-10-02"],zone,a),false);
 is(zone+" seven dates",hasPathReturnGap(["2026-10-02"],zone,b),true);
 is(zone+" Path day advances at midnight",pathProgress(NO_FACTS,{...answers,timeZone:zone},a,b).dayOnPath,2);
}
const transitions=[
 ["America/Los_Angeles","2026-03-03T16:00Z","2026-03-10T15:00Z",167],
 ["America/New_York","2026-03-03T13:00Z","2026-03-10T12:00Z",167],
 ["Europe/London","2026-03-24T08:00Z","2026-03-31T07:00Z",167],
 ["Europe/Berlin","2026-03-24T07:00Z","2026-03-31T06:00Z",167],
 ["Australia/Sydney","2026-10-01T22:00Z","2026-10-08T21:00Z",167],
 ["America/Los_Angeles","2026-10-27T15:00Z","2026-11-03T16:00Z",169],
 ["America/New_York","2026-10-27T12:00Z","2026-11-03T13:00Z",169],
 ["Europe/London","2026-10-20T07:00Z","2026-10-27T08:00Z",169],
 ["Europe/Berlin","2026-10-20T06:00Z","2026-10-27T07:00Z",169],
 ["Australia/Sydney","2026-03-31T21:00Z","2026-04-07T22:00Z",169],
] as const;
for(const [zone,start,end,hours] of transitions){
 const a=Date.parse(start),b=Date.parse(end);
 is(zone+" elapsed "+hours,(b-a)/3600000,hours);
 is(zone+" seven dates across DST "+hours,hasPathReturnGap([localDay(zone,a)],zone,b),true);
 is(zone+" Path calendar day across DST "+hours,pathProgress(NO_FACTS,{...answers,timeZone:zone},a,b).dayOnPath,8);
}
const now=Date.parse("2026-10-09T16:00Z"),zone="America/New_York";
is("no history",hasPathReturnGap([],zone,now),false);
is("today is present",hasPathReturnGap(["2026-10-02","2026-10-09"],zone,now),false);
is("duplicates and order",hasPathReturnGap(["2026-10-01","2026-10-02","2026-10-01"],zone,now),true);
for(const days of [["2026-02-30"],["not-a-date"],["2026-10-10"],["2026-10-02","bad"]])is("invalid history "+days.join(","),hasPathReturnGap(days,zone,now),false);
is("invalid zone",hasPathReturnGap(["2026-10-02"],"invalid",now),false);
is("invalid clock",hasPathReturnGap(["2026-10-02"],zone,NaN),false);
part("Only the current published introduction can complete the small return step");
const step={day:"2026-10-09",introHash:"a".repeat(64)};
const facts={introHash:step.introHash,introPublished:true};
is("strict round trip",readReturnStep({...step,done:true}),step);
for(const value of [null,[],{}, {...step,day:"2026-02-30"},{...step,introHash:"raw biography"}])is("malformed marker",readReturnStep(value),null);
const mission=pathReturnMission(step,zone,facts,now);
is("opening does not close",mission?.state,"open");
is("unchanged save does not close",pathReturnMission(step,zone,{...facts},now)?.state,"open");
is("empty publication does not close",pathReturnMission(step,zone,{introHash:"b".repeat(64),introPublished:false},now)?.state,"open");
is("changed published introduction closes",pathReturnMission(step,zone,{introHash:"b".repeat(64),introPublished:true},now)?.state,"done");
is("invalid witness does not close",pathReturnMission(step,zone,{introHash:"bad",introPublished:true},now)?.state,"open");
is("next local day quietly retires",pathReturnMission(step,zone,facts,now+86400000),null);
is("first visit has no invented return",pathReturnMission(undefined,zone,facts,now),null);
is("explicit opening during quiet hours is allowed",pathReturnMission(step,zone,facts,Date.parse("2026-10-09T05:00Z"))?.state,"open");
is("pending reminder is welcoming",returnReminderOf(mission)?.body.includes("Welcome back."),true);
is("completed step has no return reminder",returnReminderOf(pathReturnMission(step,zone,{introHash:"b".repeat(64),introPublished:true},now)),null);
is("no guilt in mission or reminder",/missed|behind|failed|lost days/i.test(JSON.stringify([mission,returnReminderOf(mission)])),false);
done();
