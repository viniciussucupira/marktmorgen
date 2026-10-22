import test from "node:test";
import assert from "node:assert/strict";
import {agreementReply,type AgreementAction} from "../lib/agreement-reply";
const id="a".repeat(32);
test("HTTP errors and unverified agreement receipts never confirm actions",()=>{
 for(const action of ["create","revise","read","resend","copy","withdraw","delete"] as AgreementAction[]){
  for(const value of [null,[],true,"ok",{}, {ok:1},Object.create({ok:true}),{ok:false}])assert.equal(agreementReply(true,value,action).ok,false);
  assert.equal(agreementReply(false,{ok:true,id,sent:true},action).ok,false);
 }
});
test("email actions require explicit send outcome and saved actions require valid ID",()=>{
 for(const action of ["create","revise","resend","copy"] as AgreementAction[]){
  for(const sent of [undefined,null,0,1,"false"])assert.equal(agreementReply(true,{ok:true,id,sent},action).ok,false);
  for(const sent of [false,true])assert.equal(agreementReply(true,{ok:true,id,sent},action).sent,sent);
 }
 for(const action of ["create","revise"] as AgreementAction[])for(const bad of [undefined,null,"bad","b".repeat(31)])assert.equal(agreementReply(true,{ok:true,id:bad,sent:true},action).ok,false);
 assert.equal(agreementReply(true,Object.assign(Object.create({sent:true}),{ok:true,id}),"create").ok,false);
});
test("non-email confirmations preserve own data and bound refusal message",()=>{
 for(const action of ["withdraw","delete","read"] as AgreementAction[])assert.equal(agreementReply(true,{ok:true},action).ok,true);
 assert.equal(agreementReply(false,{ok:true,message:"x".repeat(1000)},"delete").message?.length,600);
 assert.equal(agreementReply(false,Object.create({message:"inherited"}),"delete").message,undefined);
});
