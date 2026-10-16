import { NextRequest } from "next/server";
import { CrmSchemaReadUnavailable, CrmSchemaWriteUnconfirmed, writeFields, writeStages } from "@/lib/crm";
import { DEFAULT_STAGES, type CrmField } from "@/lib/crm-rules";
import { crmAnswer } from "@/lib/crm-response";
import { claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { POST } from "@/app/api/store/crm/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main(){
  redis.clear();process.env.UPSTASH_REDIS_REST_URL ??= "http://stub";
  let sid="crm-schema";const fk=()=>"nl:crm:fields:"+sid, sk=()=>"nl:crm:stages:"+sid, dk=()=>"nl:crm:deals:"+sid, vk=()=>"nl:crm:v:"+sid+":drop01";
  const oldFields:CrmField[]=[{id:"keep01",name:"Company",type:"text",options:[]},{id:"drop01",name:"Interest",type:"text",options:[]}];const nextFields=oldFields.slice(0,1);
  const oldDeal={id:"abcdefghij",title:"Custom proposal",email:"buyer@example.com",cents:12345,stage:"cust00",note:"Keep this note",nextAction:"Follow up",dueDate:"2026-10-16",assignee:"owner@example.com",createdAt:100,updatedAt:200,futureMetadata:{source:"manual",tags:["keep"]}};
  const kept={...oldDeal,id:"bbbbbbbbbb",stage:"lead00"};const original=redis.pipeline, normal=Symbol("normal");
  let fieldRead:unknown=normal,dealRead:unknown=normal,fieldReply:unknown=normal,stageReply:unknown=normal,moveReply:unknown=normal,apply=false,firstOnly=false;
  let writes:string[][]=[];
  redis.pipeline=async commands=>{
    const read=commands.find(c=>c[0]==="GET" && c[1]===fk() || c[0]==="HGETALL" && c[1]===dk());
    if(read){const result=read[0]==="GET"?fieldRead:dealRead;if(result!==normal){if(result instanceof Error)throw result;return result as unknown[];}}
    const write=commands.find(c=>c[0]==="SET" && [fk(),sk()].includes(String(c[1])) || c[0]==="EVAL" && c[3]===dk());
    if(write){writes.push(commands.map(c=>String(c[0])));const result=write[1]===fk()?fieldReply:write[1]===sk()?stageReply:moveReply;
      if(result!==normal){if(apply)await original.call(redis,firstOnly?commands.slice(0,1):commands);if(result instanceof Error)throw result;return result as unknown[];}}
    return original.call(redis,commands);
  };
  const seed=async()=>{fieldRead=normal;dealRead=normal;fieldReply=normal;stageReply=normal;moveReply=normal;apply=false;firstOnly=false;writes=[];
    await original.call(redis,[["DEL",dk(),vk()],["SET",fk(),JSON.stringify(oldFields)],["SET",sk(),JSON.stringify([...DEFAULT_STAGES,{id:"cust00",name:"Custom",kind:"open"}])],["HSET",vk(),"person","answer"],["HSET",dk(),oldDeal.id,JSON.stringify(oldDeal)],["HSET",dk(),kept.id,JSON.stringify(kept)]]);
  };
  const fails=async(operation:()=>Promise<unknown>,type:typeof CrmSchemaReadUnavailable|typeof CrmSchemaWriteUnconfirmed)=>{try{await operation();return false;}catch(e){return e instanceof type;}};
  try{
    part("Unreadable field definitions cannot authorize replacement or cleanup");
    for(const value of [null,{},[],[undefined],["{"],["null"],["{}"],["[{}]"],[JSON.stringify([oldFields[0],oldFields[0]])],["[]",null],new Error("field read lost")]){
      await seed();fieldRead=value;is("field preflight stays unavailable",await fails(()=>writeFields(sid,nextFields),CrmSchemaReadUnavailable),true);is("no writes after unreadable field schema",writes,[]);is("answers remain intact",(await original.call(redis,[["HGET",vk(),"person"]]))[0],"answer");
    }
    part("Incomplete opportunity snapshots stop stage changes before SET");
    for(const value of [null,{},[],[null],[[],"extra"],[["bad"]],[["bad","{}"]],[[oldDeal.id,"{"]],[[oldDeal.id,JSON.stringify({...oldDeal,id:kept.id})]],[[oldDeal.id,JSON.stringify({...oldDeal,stage:"bad"})]],[[oldDeal.id,JSON.stringify(oldDeal),oldDeal.id,JSON.stringify(oldDeal)]],new Error("deal read lost")]){
      await seed();dealRead=value;is("stage preflight stays unavailable",await fails(()=>writeStages(sid,DEFAULT_STAGES),CrmSchemaReadUnavailable),true);is("no stage or opportunity writes after unavailable snapshot",writes,[]);
    }
    part("All schema and cleanup acknowledgements are required");
    for(const value of [[],["OK"],["OK","1"],["ok",1],["OK",2],["OK",1,null],new Error("field write lost")]){
      await seed();fieldReply=value;is("incomplete field write remains unconfirmed",await fails(()=>writeFields(sid,nextFields),CrmSchemaWriteUnconfirmed),true);is("no repeated field pipeline",writes.length,1);
    }
    for(const value of [[],[true],["ok"],["OK","OK"],new Error("stage write lost")]){
      await seed();stageReply=value;is("stage SET must be confirmed",await fails(()=>writeStages(sid,DEFAULT_STAGES),CrmSchemaWriteUnconfirmed),true);is("no migration after uncertain stage SET",writes,[["SET"]]);
    }
    for(const value of [[],["0"],[2],[0,0],new Error("migration reply lost")]){
      await seed();moveReply=value;is("opportunity moves must be confirmed",await fails(()=>writeStages(sid,DEFAULT_STAGES),CrmSchemaWriteUnconfirmed),true);is("migration is attempted once",writes,[["SET"],["EVAL"]]);
    }
    part("Applied or partial changes are not rolled back or repeated");
    await seed();fieldReply=[];apply=true;firstOnly=true;is("partly applied field pipeline remains uncertain",await fails(()=>writeFields(sid,nextFields),CrmSchemaWriteUnconfirmed),true);is("applied field definitions remain",JSON.parse(String((await original.call(redis,[["GET",fk()]]))[0])),nextFields);is("unapplied cleanup remains untouched",(await original.call(redis,[["HGET",vk(),"person"]]))[0],"answer");is("partial pipeline is not retried",writes.length,1);
    await seed();stageReply=[];apply=true;is("applied stage SET with lost reply is uncertain",await fails(()=>writeStages(sid,DEFAULT_STAGES),CrmSchemaWriteUnconfirmed),true);is("opportunity is not moved after uncertain SET",JSON.parse(String((await original.call(redis,[["HGET",dk(),oldDeal.id]]))[0])).stage,"cust00");
    await seed();moveReply=[];apply=true;is("applied migration with lost reply remains uncertain",await fails(()=>writeStages(sid,DEFAULT_STAGES),CrmSchemaWriteUnconfirmed),true);is("moved snapshot retains every other saved field",JSON.parse(String((await original.call(redis,[["HGET",dk(),oldDeal.id]]))[0])),{...oldDeal,stage:"lead00"});is("migration is not repeated",writes.length,2);
    part("Confirmed writes preserve the intended cleanup and custom-stage move");
    await seed();is("field replacement returns confirmed definitions",await writeFields(sid,nextFields),nextFields);is("removed-field answers are deleted",(await original.call(redis,[["HGET",vk(),"person"]]))[0],null);
    await seed();await original.call(redis,[["DEL",vk()]]);is("confirmed absent answers need no deletion",await writeFields(sid,nextFields),nextFields);
    await seed();is("custom-stage replacement succeeds",await writeStages(sid,DEFAULT_STAGES),DEFAULT_STAGES);is("removed custom stage moves to first open without losing metadata",JSON.parse(String((await original.call(redis,[["HGET",dk(),oldDeal.id]]))[0])),{...oldDeal,stage:"lead00"});is("retained-stage record is byte-for-byte unchanged",(await original.call(redis,[["HGET",dk(),kept.id]]))[0],JSON.stringify(kept));
    part("API and UI retain the prewrite versus uncertain distinction");
    const owner="schema-owner@example.com";await claimHandle(owner,"schema-check","Schema Check","");await ensureStatsId(owner);sid=(await storeForEmail(owner))!.statsId!;const session=await openSession(owner);
    const call=async(body:Record<string,unknown>)=>{const r=await POST(new NextRequest("https://marktmorgen.com/api/store/crm",{method:"POST",headers:{"content-type":"application/json",cookie:SESSION_COOKIE+"="+session},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};};
    await seed();fieldRead=[];const readFailure=await call({action:"fields",fields:nextFields});is("API identifies schema preflight failure",[readFailure.status,readFailure.body.error],[503,"crm_schema_read_unavailable"]);is("client can retry a prewrite read failure",crmAnswer(false,readFailure.body),{ok:false,error:"crm_schema_read_unavailable"});is("prewrite refusal changes no schema",writes,[]);
    await seed();stageReply=[];const writeFailure=await call({action:"stages",stages:DEFAULT_STAGES});is("API identifies uncertain schema change",[writeFailure.status,writeFailure.body.error],[502,"crm_write_unconfirmed"]);is("client uses uncertain-write recovery",crmAnswer(false,writeFailure.body),{ok:false,error:"crm_write_unconfirmed"});
  }finally{redis.pipeline=original;}
  part("Stage migration preserves concurrent deletions and edits");
  await seed();
  try {
    redis.pipeline = async commands => {
      if (commands.some(c => c[0] === "EVAL" && c[3] === dk())) await original.call(redis, [["HDEL", dk(), oldDeal.id]]);
      return original.call(redis, commands);
    };
    is("deletion during migration does not prevent saving stages", await writeStages(sid, DEFAULT_STAGES), DEFAULT_STAGES);
    is("migration never recreates the deleted opportunity", (await original.call(redis, [["HGET", dk(), oldDeal.id]]))[0], null);
    is("migration does not increase opportunity count after deletion", (await original.call(redis, [["HLEN", dk()]]))[0], 1);
  } finally { redis.pipeline = original; }
  await seed();
  const concurrentEdit = { ...oldDeal, note: "Updated by another session", cents: 98765, futureMetadata: { source: "edited", tags: ["new"] } };
  try {
    redis.pipeline = async commands => {
      if (commands.some(c => c[0] === "EVAL" && c[3] === dk())) await original.call(redis, [["HSET", dk(), oldDeal.id, JSON.stringify(concurrentEdit)]]);
      return original.call(redis, commands);
    };
    is("a changed snapshot makes migration explicitly unconfirmed", await fails(() => writeStages(sid, DEFAULT_STAGES), CrmSchemaWriteUnconfirmed), true);
    is("migration preserves every concurrent edit", JSON.parse(String((await original.call(redis, [["HGET", dk(), oldDeal.id]]))[0])), concurrentEdit);
  } finally { redis.pipeline = original; }
  await writeStages(sid, DEFAULT_STAGES);
  is("explicit retry moves the latest record without reverting its edits", JSON.parse(String((await original.call(redis, [["HGET", dk(), oldDeal.id]]))[0])), { ...concurrentEdit, stage: "lead00" });
  done();
}
void main();
