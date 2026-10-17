import { parseForm, MAX_FORMS } from "@/lib/forms";
import { writeForm, canAddForms, readForm } from "@/lib/form-store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();
  const sid = "form-capacity-test", key = "nl:forms:" + sid;
  const form = parseForm({ id: "formseed00", name: "Questions", fields: [{ id: "name00", type: "short", label: "Name", required: true }] })!;
  for(let n=0;n<MAX_FORMS-1;n++)await redis.pipeline([["HSET",key,"existing"+n,"existing"]]);
  part("Manual editing and setup share a hard form bound");
  const replies=await Promise.all(Array.from({length:64},(_,n)=>writeForm(sid,{...form,id:"form"+String(n).padStart(6,"0")})));
  is("only one concurrent creation takes the last slot",[replies.filter(Boolean).length,(await redis.pipeline([["HLEN",key]]))[0]],[1,MAX_FORMS]);
  is("preflight sees the shared cap",await canAddForms(sid,1),false);
  const id="form"+String(replies.findIndex(Boolean)).padStart(6,"0");
  is("an existing form remains editable at capacity",await writeForm(sid,{...form,id,name:"Edited"}),true);
  is("editing preserves the count",[(await readForm(sid,id))?.name,(await redis.pipeline([["HLEN",key]]))[0]],["Edited",MAX_FORMS]);
  const pipeline=redis.pipeline;
  let failed=false;
  try {redis.pipeline=async commands=>commands.some(c=>c[0]==="EVAL")?[]:pipeline(commands);await writeForm("unknown",{...form,id:"unknown000"});}catch{failed=true;}finally{redis.pipeline=pipeline;}
  is("unacknowledged writes never report success",failed,true);
  for(const raw of [[],[undefined],[true],[-1],[1,2]]) {
    let rejected=false;
    try {redis.pipeline=async()=>raw;await canAddForms(sid,1);}catch{rejected=true;}finally{redis.pipeline=pipeline;}
    is("uncertain capacity cannot authorize setup",rejected,true);
  }
  await redis.pipeline([["HDEL",key,id]]);
  is("deletion frees exactly one form slot",await writeForm(sid,{...form,id:"replacement"}),true);
  is("the cap remains intact",(await redis.pipeline([["HLEN",key]]))[0],MAX_FORMS);
  done();
}
main().catch(error=>{console.error(error);process.exit(1);});
