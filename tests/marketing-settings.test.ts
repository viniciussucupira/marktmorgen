import {allowedBy} from "@/lib/ad-events";
import {adsCookieName} from "@/lib/ad-consent";
import assert from "node:assert/strict";
import test from "node:test";
import {pixelSettingsConfirmed,attributionSettingsConfirmed} from "@/lib/marketing-settings-response";
import {NO_PIXELS,pixelChoiceState,needsConsent} from "@/lib/pixels";
const requested={...NO_PIXELS,meta:"123456789012345",google:"G-AB12CD34EF",tiktok:"C4ABCDEFGH1234567890"};
test("marketing settings require exact canonical confirmation, not flags or partial echoes",()=>{
 assert.equal(pixelSettingsConfirmed(true,{ok:true,pixels:requested},requested),true);
 for(const payload of [null,[],{},true,{ok:"true",pixels:requested},{ok:1,pixels:requested},{ok:true,error:"server_error",pixels:requested},{ok:true,error:null,pixels:requested},{ok:true},{ok:true,pixels:{meta:requested.meta}},{ok:true,pixels:{...requested,meta:"999999999999999"}},{ok:true,pixels:{...requested,google:"<script>"}}])assert.equal(pixelSettingsConfirmed(true,payload,requested),false,JSON.stringify(payload));
 assert.equal(pixelSettingsConfirmed(false,{ok:true,pixels:requested},requested),false);
 for(const days of [7,30,60,90])assert.equal(attributionSettingsConfirmed(true,{ok:true,days},days),true);
 for(const payload of [null,{},[],{ok:"true",days:30},{ok:true,days:"30"},{ok:true,days:7},{ok:true,error:"role",days:30},{ok:true,error:null,days:30},{ok:true,days:30.5}])assert.equal(attributionSettingsConfirmed(true,payload,30),false,JSON.stringify(payload));
 assert.equal(attributionSettingsConfirmed(false,{ok:true,days:30},30),false);assert.equal(attributionSettingsConfirmed(true,{ok:true,days:9},9),false);
});
test("GPC refusal overrides even a previously saved yes; consent regions and unknown remain ask-first",()=>{
 for(const choice of ["yes","no",null,undefined,"invalid"])for(const askFirst of [true,false])assert.equal(pixelChoiceState(choice,askFirst,true),"off");
 assert.equal(pixelChoiceState("yes",true,false),"on");assert.equal(pixelChoiceState("no",false,false),"off");
 for(const country of ["BR","GB","DE",null,undefined,"invalid"])assert.equal(needsConsent(country),true);
 assert.equal(pixelChoiceState(null,true,false),"ask");assert.equal(pixelChoiceState(null,false,false),"on");
});

test("server refuses GPC even when a former consent cookie is still present",()=>{
 const store={handle:"synthetic"},cookies={get:(name:string)=>name===adsCookieName(store.handle)?{value:"y"}:undefined};
 assert.equal(allowedBy({cookies,headers:new Headers({"Sec-GPC":"1"})},store),false);
 assert.equal(allowedBy({cookies,headers:new Headers()},store),true);
 assert.equal(allowedBy({cookies:{get:()=>undefined},headers:new Headers()},store),false);
});
