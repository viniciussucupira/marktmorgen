import { crmAnswer } from "@/lib/crm-response";
import { done, is, part } from "./check";
const uncertain = { ok: false, error: "crm_write_unconfirmed" };
part("Only explicit successful HTTP confirms a CRM operation");
is("confirmed successful response",crmAnswer(true,{ok:true}),{ok:true});
is("result fields do not change the success contract",crmAnswer(true,{ok:true,deal:{id:"sample"}}),{ok:true});
for(const invalid of [null,undefined,[],{},true,"ok",{ok:"true"},{ok:1},{ok:null},{ok:false},{ok:true,error:null},{ok:true,error:undefined},{ok:false,error:"server_error"},{ok:false,error:"constructor"},{ok:false,error:"future_error"},Object.create({ok:true})]) is("malformed or uncertain result retains recovery",crmAnswer(true,invalid),uncertain);
is("HTTP failure overrides success flag",crmAnswer(false,{ok:true}),uncertain);
is("transport/JSON failure is uncertain",crmAnswer(false,null),uncertain);
part("Known prewrite refusals remain actionable without claiming rollback");
for(const error of ["title","followup","date","assignee","stage","full","unknown","fields","stages","value","invalid","role","origin","signed_out","locked","store_gone","none","unavailable","bad_request","forbidden"]){
  is("known refusal on failed HTTP "+error,crmAnswer(false,{ok:false,error}),{ok:false,error});
  is("known refusal on successful HTTP "+error,crmAnswer(true,{ok:false,error}),{ok:false,error});
}
for(const key of ["deal","fields","stages"]) {
  is("contradictory result cannot be treated as a prewrite refusal",crmAnswer(false,{ok:false,error:"title",[key]:{}}),uncertain);
  is("even an undefined result property stays contradictory",crmAnswer(false,{ok:false,error:"title",[key]:undefined}),uncertain);
}
is("inherited refusal is not accepted",crmAnswer(false,Object.create({ok:false,error:"title"})),uncertain);
done();
