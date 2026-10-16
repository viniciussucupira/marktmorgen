import { NextRequest } from "next/server";
import { POST } from "@/app/api/store/crm/route";
import { claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { crmAnswer } from "@/lib/crm-response";
import { CrmValueWriteUnconfirmed, setValue } from "@/lib/crm";
import { type CrmField } from "@/lib/crm-rules";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();
  const person="a".repeat(32), field: CrmField={id:"cust01",name:"Company",type:"text",options:[]};
  const key="nl:crm:v:contact-check:"+field.id;
  const original=redis.pipeline;
  let reply: unknown=[1], applied=false, writes=0;
  redis.pipeline=async commands=>{if (!commands.some(c=>c[0]==="HSET" || c[0]==="HDEL")) return original.call(redis,commands);writes++;if(applied)await original.call(redis,commands);if(reply instanceof Error)throw reply;return reply as unknown[];};
  try {
    part("Contact saves and clears require exact acknowledgements");
    for(const value of ["Acme", ""]) {
      for(const invalid of [null, {}, [], [null], ["1"], [true], [-1], [2], [1,1], new Error("reply lost")]) {
        reply=invalid;writes=0;let uncertain=false;
        try { await setValue("contact-check",person,field,value); } catch(error) { uncertain=error instanceof CrmValueWriteUnconfirmed; }
        is("unknown save or clear stays uncertain",uncertain,true);
        is("unknown save or clear is never retried",writes,1);
      }
      for(const result of [0,1]) { reply=[result];is("numeric acknowledgement confirms save or clear",await setValue("contact-check",person,field,value),true); }
    }
    part("Applied writes with lost replies are not rolled back");
    applied=true;reply=[];writes=0;let uncertain=false;
    try {await setValue("contact-check",person,field,"Acme");}catch(error){uncertain=error instanceof CrmValueWriteUnconfirmed;}
    is("applied value is still uncertain",uncertain,true);
    is("applied value is preserved",(await original.call(redis,[["HGET",key,person]]))[0],"Acme");
    is("applied save is attempted once",writes,1);
    writes=0;uncertain=false;
    try {await setValue("contact-check",person,field,"");}catch(error){uncertain=error instanceof CrmValueWriteUnconfirmed;}
    is("applied clear is still uncertain",uncertain,true);
    is("cleared value is not recreated",(await original.call(redis,[["HGET",key,person]]))[0],null);
    is("applied clear is attempted once",writes,1);
    part("Invalid person and value are refused before storage");
    writes=0;is("invalid person refused",await setValue("contact-check","bad",field,"Acme"),false);
    is("invalid number refused",await setValue("contact-check",person,{...field,type:"number"},"bad"),false);
    is("validation refusals perform no writes",writes,0);
    part("API reports unknown contact writes without claiming success");
    redis.pipeline=original;
    const owner="contact-write-owner@example.com";await claimHandle(owner,"contact-write-check","Contact Check","");await ensureStatsId(owner);
    const sid=(await storeForEmail(owner))!.statsId!;const session=await openSession(owner);
    await original.call(redis,[["SET","nl:crm:fields:"+sid,JSON.stringify([field])]]);
    writes=0;
    redis.pipeline=async commands=>{if(commands.some(c=>c[0]==="HSET" || c[0]==="HDEL")){writes++;await original.call(redis,commands);return [];}return original.call(redis,commands);};
    const response=await POST(new NextRequest("https://marktmorgen.com/api/store/crm",{method:"POST",headers:{"content-type":"application/json",cookie:SESSION_COOKIE+"="+session},body:JSON.stringify({action:"value",field:field.id,person,value:"Acme"})}));
    const body=await response.json();
    is("API exposes uncertain write",[response.status,body.error],[502,"crm_write_unconfirmed"]);
    is("client recognizes recovery state",crmAnswer(response.ok,body),{ok:false,error:"crm_write_unconfirmed"});
    is("route attempts write once",writes,1);
    is("applied contact value remains",(await original.call(redis,[["HGET","nl:crm:v:"+sid+":"+field.id,person]]))[0],"Acme");
  } finally {redis.pipeline=original;}
  done();
}
void main();
