import {NextRequest} from "next/server";
import {POST} from "@/app/api/store/path/route";
import {POST as beforeWording} from "./fixtures/path-before-wording";
import {state} from "./path-wording-route-world";
import {done,is,part} from "./check";
const request=()=>new NextRequest("https://local.example/api/store/path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(state.body)});
async function main(){
 part("The actual previous route refuses the new action; the updated route handles it");
 state.body={action:"wording",mission:"title",source:"forged browser fact",text:"forged completion"};
 is("negative control before implementation",(await beforeWording(request())).status,400);
 const response=await POST(request());const data=await response.json();
 is("current action is handled",response.status,200);
 is("response remains private",response.headers.get("Cache-Control"),"no-store");
 is("source comes from the own server reading",data.source,state.source.step);
 is("no client prompt or facts are forwarded",(state.asked[0] as {source:unknown}).source,state.source);
 is("reply cannot record completion",Object.hasOwn(data,"complete"),false);
 state.role="editor";is("owner permission still required",(await POST(request())).status,403);state.role="owner";
 state.body={action:"wording",mission:"other-store-mission"};is("stale or wrong mission refuses",(await POST(request())).status,409);
 state.body={action:"wording",mission:"title"};state.record=false;is("missing Path refuses",(await POST(request())).status,409);state.record=true;
 state.limited=true;is("existing AI burst guard is retained",(await POST(request())).status,429);
 is("only the admitted own-source request reached the writer",state.asked.length,1);
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
