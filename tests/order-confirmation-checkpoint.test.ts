import assert from "node:assert/strict";
import { createConnection } from "node:net";
import { test } from "node:test";
import { prepareOrderConfirmationSettlement, commitOrderConfirmationSettlement } from "@/lib/orders";
import { unseal } from "@/lib/secret-box";
import type { Store } from "@/lib/store";
import { admitOrders } from "@/lib/order-admission";
import { store as redis } from "./redis-stub";

type Command = (string | number)[];
const at = Date.UTC(2026, 9, 31, 23, 30);
const hour = Math.floor(at / 3_600_000);
const reference = "checkout:cs_test_confirmationCheckpoint01";
const store = () => ({ email: "checkpoint@example.test", sid: "", statsId: "synthetic_checkpoint", handle: "checkpoint", extra: false, shared: false,
  subscriptionActive: true, subscriptionId: "sub_SyntheticCheckpoint", trialEnds: 0, tier: "creator", planEndedAt: "", cycle: "month",
  period: { start: Date.UTC(2026,9,20)/1000, end: Date.UTC(2026,10,20)/1000, renews: true } }) as Store;
const clock = { now: () => at };
async function acknowledgedAdmission(s=store(), n=1, items=2, admissionAt=at) {
  const prior=redis.pipeline;redis.pipeline=async()=>[1];
  try{return await admitOrders(s,n,admissionAt,items);}finally{redis.pipeline=prior;}
}
const prepare = async (s=store(), ref=reference) => prepareOrderConfirmationSettlement(s,ref,await acknowledgedAdmission(s),clock);

test("snapshot captures the original hour, window and explicit share before payment",async()=>{
  const sourceStore=store(),admission=await acknowledgedAdmission(sourceStore);
  // A billing update after admission must not move this order's accounting.
  sourceStore.period={start:Date.UTC(2026,10,20)/1000,end:Date.UTC(2026,11,20)/1000,renews:true};
  const token=await prepareOrderConfirmationSettlement(sourceStore,reference,admission,clock); assert.ok(token);
  const opened=unseal(token,`order-confirmation-settlement|${reference}`); assert.equal(opened.ok,true);
  if(!opened.ok) throw Error("Expected synthetic snapshot");
  const source=JSON.parse(opened.value);
  assert.equal(source.window,"2026-10-20"); assert.equal(source.month,"2026-10");
  assert.equal(source.hour,hour); assert.equal(source.share,0); assert.equal(source.captured,at);
  assert.ok(source.until>at+400*86_400_000);
  const renewed={...store(), shared:true, tier:"scale", period:{start:Date.UTC(2026,10,20)/1000,end:Date.UTC(2026,11,20)/1000,renews:true}} as Store;
  let commands: Command[]=[];
  const result=await commitOrderConfirmationSettlement(renewed,reference,token,1500,{now:()=>at+73*3_600_000,pipeline:async c=>{commands=c;return[1];}});
  assert.equal(result,"committed"); assert.equal(commands.length,1);
  assert.match(String(commands[0][4]),/:2026-10-20$/);
  assert.match(String(commands[0][7]),/:2026-10$/);
  assert.equal(commands[0][10],String(hour)); assert.equal(commands[0][12],1);
});

test("missing original share/window/admission evidence does not manufacture a snapshot",async()=>{
  const missingShare={...store()} as Partial<Store>; delete missingShare.shared;
  assert.equal(await prepare(missingShare as Store),null);
  assert.equal(await prepare({...store(),period:null}),null);
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference,{ok:true,hour:hour-1},clock),null);
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference,{ok:true,hour:null},clock),null);
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference,{ok:false,reason:"unavailable"},clock),null);
  let getters=0;
  const accessor=Object.defineProperty({...store()},"shared",{get(){getters++;return false;}});
  assert.equal(await prepare(accessor),null); assert.equal(getters,0);
  const admission=Object.defineProperty({ok:true},"hour",{get(){getters++;return hour;}});
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference,admission as never,clock),null); assert.equal(getters,0);
  const real=await acknowledgedAdmission();
  assert.ok(await prepareOrderConfirmationSettlement(store(),reference,real,clock));
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference+"other",real,clock),null);
  assert.equal(await prepareOrderConfirmationSettlement(store(),reference,await acknowledgedAdmission(store(),2),clock),null);
  const previous=redis.pipeline;redis.pipeline=async()=>["1"];
  try {
    const uncertain=await admitOrders(store(),1,at,2);
    assert.deepEqual(uncertain,{ok:false,reason:"unavailable"});
    assert.equal(await prepareOrderConfirmationSettlement(store(),reference,uncertain,clock),null);
  } finally {redis.pipeline=previous;}
});

test("unknown ACK never claims settlement, and replay uses an identical receipt",async()=>{
  const token=await prepare(); assert.ok(token); let first:Command|undefined;
  assert.equal(await commitOrderConfirmationSettlement(store(),reference,token,1500,{...clock,pipeline:async c=>{first=c[0];throw Error("Lost ACK after commit");}}),"unknown");
  assert.equal(await commitOrderConfirmationSettlement(store(),reference,token,1500,{now:()=>at+73*3_600_000,pipeline:async c=>{
    assert.deepEqual(c[0].slice(0,-2),first!.slice(0,-2)); return[2];
  }}),"already");
  let getters=0;
  const bad:unknown[]=[undefined,null,[],["1"],[true],[[1]],[1,1],new Array(1),Object.defineProperty(new Array(1),"0",{get(){getters++;return 1;}})];
  for(const reply of bad) assert.equal(await commitOrderConfirmationSettlement(store(),reference,token,1500,{...clock,pipeline:async()=>reply as unknown[]}),"unknown");
  assert.equal(getters,0);
});

test("unbound or expired source refuses without IO, even after the receipt expires",async()=>{
  const token=await prepare(); assert.ok(token); let calls=0;
  const pipeline=async()=>{calls++;return[1];};
  assert.equal(await commitOrderConfirmationSettlement(store(),reference,token.slice(0,-8)+"AAAAAAAA",1500,{...clock,pipeline}),"unknown","changed authentication tag");
  assert.equal(await commitOrderConfirmationSettlement(store(),reference+"other",token,1500,{...clock,pipeline}),"unknown","other source");
  assert.equal(await commitOrderConfirmationSettlement({...store(),email:"other@example.test"},reference,token,1500,{...clock,pipeline}),"unknown","other owner");
  assert.equal(await commitOrderConfirmationSettlement(store(),reference,token,1500,{now:()=>at+800*86_400_000,pipeline}),"unknown");
  assert.equal(await commitOrderConfirmationSettlement(store(),reference,token,NaN,{...clock,pipeline}),"unknown");
  let getters=0;
  const accessor=Object.defineProperty({...store()},"email",{get(){getters++;return "checkpoint@example.test";}});
  assert.equal(await commitOrderConfirmationSettlement(accessor,reference,token,1500,{...clock,pipeline}),"unknown");
  assert.equal(getters,0);
  assert.equal(calls,0);
});

/** Disposable loopback only. This transport exercises the production TS
 * preparation/commit functions and actual Lua together; no account or sender.
 */
async function localPipeline(commands:Command[]):Promise<unknown[]> {
  const port=Number(process.env.MARKTMORGEN_CONFIRMATION_REDIS_PORT);
  if(process.env.MARKTMORGEN_REDIS_INTEGRATION!=="1" || !Number.isInteger(port) || port<1024 || port>65535) throw Error("Dedicated disposable loopback Redis required");
  const encoded=commands.map(c=>`*${c.length}\r\n`+c.map(v=>{const s=String(v);return `$${Buffer.byteLength(s)}\r\n${s}\r\n`;}).join("")).join("");
  return new Promise((resolve,reject)=>{
    const socket=createConnection({host:"127.0.0.1",port});let buffer=Buffer.alloc(0);
    const parse=(start:number):{value:unknown;end:number}|null=>{
      const eol=buffer.indexOf("\r\n",start);if(eol<0)return null;
      const kind=String.fromCharCode(buffer[start]),text=buffer.toString("utf8",start+1,eol),next=eol+2;
      if(kind==="+")return{value:text,end:next};
      if(kind==="-")throw Error(text);
      if(kind===":")return{value:Number(text),end:next};
      if(kind==="$"){const n=Number(text);if(n===-1)return{value:null,end:next};if(buffer.length<next+n+2)return null;return{value:buffer.toString("utf8",next,next+n),end:next+n+2};}
      if(kind==="*"){const n=Number(text);if(n===-1)return{value:null,end:next};const out=[];let cursor=next;for(let i=0;i<n;i++){const item=parse(cursor);if(!item)return null;out.push(item.value);cursor=item.end;}return{value:out,end:cursor};}
      throw Error("Invalid disposable Redis reply");
    };
    socket.setTimeout(5000,()=>socket.destroy(Error("Disposable Redis timed out")));
    socket.on("error",reject);socket.on("connect",()=>socket.write(encoded));
    socket.on("data",chunk=>{buffer=Buffer.concat([buffer,chunk]);try{const replies=[];let cursor=0;for(let i=0;i<commands.length;i++){const item=parse(cursor);if(!item)return;replies.push(item.value);cursor=item.end;}socket.end();resolve(replies);}catch(e){socket.destroy();reject(e);}});
  });
}

if(process.env.MARKTMORGEN_REDIS_INTEGRATION==="1") test("production TS plus real Redis keeps the other order's hold after a lost ACK and 73h",async()=>{
  const realAt=Date.now(), realClock={now:()=>realAt},realHour=Math.floor(realAt/3_600_000);
  const source={...store(),period:{start:Math.floor(realAt/1000)-10*86400,end:Math.floor(realAt/1000)+20*86400,renews:true}};
  const ref=`checkout:cs_test_realCheckpoint${process.pid}`;
  let admissionKeys:string[]=[];
  const previous=redis.pipeline;
  redis.pipeline=async commands=>{
    if(admissionKeys.length===0) {
      assert.equal(commands[0][0],"EVAL");admissionKeys=commands[0].slice(3,7).map(String);
      await localPipeline([["DEL",...admissionKeys]]);
    }
    return localPipeline(commands);
  };
  let token:string|null, second:Awaited<ReturnType<typeof admitOrders>>;
  try {
    const admitted=await admitOrders(source,1,realAt,2);
    assert.equal(admitted.ok,true);
    second=await admitOrders(source,1,realAt,2);assert.equal(second.ok,true);
    token=await prepareOrderConfirmationSettlement(source,ref,admitted,realClock);
  } finally {redis.pipeline=previous;}
  assert.ok(token);
  let command:Command|undefined;
  await commitOrderConfirmationSettlement(source,ref,token,1500,{...realClock,pipeline:async c=>{command=c[0];return[-1];}});
  assert.ok(command);const keys=command.slice(3,9).map(String),bytes=Number(command[11]);
  let secondKeys:string[]=[];
  try {
    assert.deepEqual(await localPipeline([["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]),["2",String(2*bytes)]);
    assert.equal(await commitOrderConfirmationSettlement(source,ref,token,1500,{...realClock,pipeline:async c=>{await localPipeline(c);throw Error("Synthetic ACK lost");}}),"unknown");
    const before=await localPipeline([["GET",keys[1]],["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]);
    assert.deepEqual(before,["1","1",String(bytes)]);
    assert.equal(await commitOrderConfirmationSettlement(source,ref,token,1500,{now:()=>realAt+73*3_600_000,pipeline:localPipeline}),"already");
    assert.deepEqual(await localPipeline([["GET",keys[1]],["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]),before);
    assert.equal(await commitOrderConfirmationSettlement(source,ref,token,1501,{...realClock,pipeline:localPipeline}),"unknown");
    assert.deepEqual(await localPipeline([["GET",keys[1]],["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]),before);
    // A third order is still held when B fails after all accounting effects.
    // Its hold must survive every retry of B's uncertain intent.
    redis.pipeline=localPipeline;
    try {assert.equal((await admitOrders(source,1,realAt,2)).ok,true);}finally{redis.pipeline=previous;}
    const secondRef=ref+"B",secondToken=await prepareOrderConfirmationSettlement(source,secondRef,second!,realClock);assert.ok(secondToken);
    assert.equal(await commitOrderConfirmationSettlement(source,secondRef,secondToken,1500,{...realClock,pipeline:async c=>{
      secondKeys=c[0].slice(3,9).map(String);
      const fault=c.map(row=>[...row]);
      const finish="redis.call('SET',KEYS[1],receipt,'PXAT',untilAt)";
      assert.ok(String(fault[0][1]).includes(finish));
      fault[0][1]=String(fault[0][1]).replace(finish,"error('synthetic TS partial settlement'); "+finish);
      return localPipeline(fault);
    }}),"unknown");
    const partial=await localPipeline([["GET",keys[1]],["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]);
    assert.deepEqual(partial,["2","1",String(bytes)]);
    assert.match(String((await localPipeline([["GET",secondKeys[0]]]))[0]),/^oci:/);
    assert.equal(await commitOrderConfirmationSettlement(source,secondRef,secondToken,1500,{now:()=>realAt+73*3_600_000,pipeline:localPipeline}),"unknown");
    assert.deepEqual(await localPipeline([["GET",keys[1]],["HGET",keys[2],String(realHour)],["HGET",keys[3],String(realHour)]]),partial);
  } finally {await localPipeline([["DEL",...keys,...admissionKeys,...secondKeys]]);}
});
