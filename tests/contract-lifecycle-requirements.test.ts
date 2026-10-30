import assert from "node:assert/strict";
import {contractLifecycleReady,CONTRACT_ADMISSION_COVERAGE,CORE_CONTRACT_ADMISSION_KEYS} from "@/lib/contract-funding-rules";
import {commercialPlansMayOpen} from "@/lib/commercial-margin";
import {PLAN_BREAKS_ENABLED} from "@/lib/plan-pause-rules";
import {done,is,part} from "./check";
part("Opening requires every essential lifecycle; optional OFF never invents proof");
const core={checkout:true,planSwitch:true,resourceAllocations:true,renewals:true,settlementAndReserveReconciliation:true,pauseRestart:false};
is("disabled optional facility needs no false certification",contractLifecycleReady(core,false),true);
is("enabling optional facility requires its evidence",contractLifecycleReady(core,true),false);
is("covered enabled facility may pass lifecycle only",contractLifecycleReady({...core,pauseRestart:true},true),true);
for(const key of CORE_CONTRACT_ADMISSION_KEYS){
 is("essential false never waived: "+key,contractLifecycleReady({...core,[key]:false},false),false);
 const missing={...core} as Record<string,unknown>;delete missing[key];
 is("essential absence never waived: "+key,contractLifecycleReady(missing,false),false);
}
for(const enabled of [null,"false",0,{},[]])is("unknown optional switch refuses "+String(enabled),contractLifecycleReady(core,enabled),false);
let touched=0;
const getter={...core};Object.defineProperty(getter,"renewals",{enumerable:true,get(){touched++;return true;}});
is("accessor evidence refuses",contractLifecycleReady(getter,false),false);
is("accessor is not invoked",touched,0);
for(const bad of [null,[],{...core,renewals:"true"},{...core,extra:true},Object.assign(Object.create({renewals:true}),{checkout:true})])is("malformed evidence refuses",contractLifecycleReady(bad,false),false);
is("real optional switch stays off",PLAN_BREAKS_ENABLED,false);
is("real pause coverage remains false",CONTRACT_ADMISSION_COVERAGE.pauseRestart,false);
is("real incomplete core lifecycle stays closed",contractLifecycleReady(),false);
is("no real financial review opens sales",commercialPlansMayOpen(true),false);
is("no opening request cannot open sales",commercialPlansMayOpen(false),false);
assert.equal(CONTRACT_ADMISSION_COVERAGE.renewals,false);
done();
