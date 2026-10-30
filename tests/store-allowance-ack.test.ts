import assert from "node:assert/strict";
import {takeAllowance} from "@/lib/store-allowance";
import {paidPeriod} from "./billing-period-fixture";
import {store as redis} from "./redis-stub";
import {done,is,part} from "./check";
let visited=0,sequence=0;
const cases:[string,()=>unknown][]=[
 ["lost",()=>[]],["short",()=>["OK"]],["string count",()=>["OK","1"]],["boolean count",()=>["OK",true]],
 ["unknown SET",()=>[true,1]],["infinite",()=>["OK",Infinity]],["fractional",()=>["OK",1.5]],["zero",()=>["OK",0]],
 ["extra member",()=>["OK",1,1]],["inherited",()=>{const a=new Array(2);a[0]="OK";Object.setPrototypeOf(a,{1:1});return a;}],
 ["accessor",()=>{const a=["OK",1];Object.defineProperty(a,"1",{get(){visited++;return 1;}});return a;}],
 ["extra property",()=>Object.assign(["OK",1],{extra:true})],
 ["symbol",()=>Object.assign(["OK",1],{[Symbol("unknown")]:true})],
];
async function main(){
 part("Actual paid resource allowance requires confirmed finite consumption");
 const pipeline=redis.pipeline;
 for(const [name,shape]of cases){
  const owner={sid:String(++sequence).padStart(32,"0"),handle:"counterack"+sequence,statsId:null,tier:"creator" as const,cycle:"month" as const,subscriptionId:"sub_CounterAck0001",subscriptionActive:true,trialEnds:0,planEndedAt:"",period:paidPeriod()};
  let calls=0,key="",commands=0;
  redis.pipeline=async input=>{
   calls++;commands+=input.length;
   const reply=await pipeline(input);
   if(input.some(c=>c[0]==="INCRBY")){key=String(input[0][1]);return shape() as never;}
   return reply;
  };
  let result;try{result=await takeAllowance(owner,"studio");}finally{redis.pipeline=pipeline;}
  is("uncertain reply refuses: "+name,result.ok,false);
  is("exactly one two-command admission: "+name,[calls,commands],[1,2]);
  is("committed use retained: "+name,await pipeline([["GET",key]]),["1"]);
  const next=await takeAllowance(owner,"studio");
  assert.equal(next.ok,true,"later confirmed use recovers without releasing uncertain use: "+name);
  is("next confirmation counts both uses: "+name,await pipeline([["GET",key]]),["2"]);
 }
 is("no getter invoked",visited,0);
 done();
}
main().catch(e=>{console.error(e);process.exit(1);});
