import { listBroadcastsStrict } from "@/lib/broadcasts";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
const id="1234567890abcdef12345678";
const row={id,listId:"chosen-list",handle:"chosen-store",subject:"Campaign",body:"Content",productId:null,notProductId:null,who:"all",narrow:null,status:"scheduled",createdAt:1,sendAt:2,finishedAt:0,total:3,sent:0,note:"",failures:0,listed:false,tagged:true,test:null};
async function main(){
 const original=redis.pipeline;let replies:unknown[]=[];const calls:(string|number)[][][]=[];
 redis.pipeline=async commands=>{calls.push(commands);const next=replies.shift();if(next instanceof Error)throw next;return next as unknown[];};
 const read=()=>listBroadcastsStrict("chosen-list");
 const rejects=async(label:string)=>{let failed=false;try{await read();}catch{failed=true;}is(label,failed,true);};
 try{
 part("History must be a confirmed snapshot of this store");
 is("no list is empty without a read",await listBroadcastsStrict(null),[]);is("no storage request without a list",calls.length,0);
 replies=[[[]]];is("confirmed empty index",await read(),[]);is("only this list is read",calls[0],[["LRANGE","nl:mail:bcs:chosen-list",0,29]]);
 replies=[[[id]],[JSON.stringify(row)]];is("complete campaign retained",(await read())[0],row);is("record requested by index identity",calls.at(-1),[["GET","nl:mail:bc:"+id]]);
 const legacy={...row} as Partial<typeof row>;delete legacy.who;delete legacy.notProductId;delete legacy.narrow;delete legacy.tagged;delete legacy.test;
 replies=[[[id]],[JSON.stringify(legacy)]];const old=(await read())[0];is("documented legacy audience default",old.who,"all");is("legacy tagging remains unknown/false",old.tagged,false);is("legacy exclusion stays absent",old.notProductId,null);
 for(const status of ["scheduled","sending","sent","waiting","cancelled","failed"]){replies=[[[id]],[JSON.stringify({...row,status})]];is("valid state "+status,(await read())[0].status,status);}
 for(const index of [null,{},[],[null],[{}],[[id,id]],[["wrong"]],[new Array(1)],[Array(31).fill(id)],[[],[]]]){const before=calls.length;replies=[index];await rejects("invalid index stays unavailable "+JSON.stringify(index));is("invalid index never requests guessed records",calls.length-before,1);}
 for(const records of [null,{},[],[null],[JSON.stringify(row),JSON.stringify(row)],new Array(1),["invalid"],["null"],["[]"],["{}"]]){replies=[[[id]],records];await rejects("missing/malformed record stays unavailable "+JSON.stringify(records));}
 for(const bad of [{id:"abcdef1234567890abcdef12"},{listId:"other-list"},{subject:""},{body:3},{handle:" "},{status:"unknown"},{createdAt:-1},{sendAt:"2"},{total:1.5},{sent:4},{failures:-1},{finishedAt:null},{note:undefined},{listed:undefined},{productId:[]},{who:"everyone"},{notProductId:3},{tagged:"yes"},{test:{}},{narrow:[]},{narrow:{minSpent:"0",channel:"",quietDays:0}}]){replies=[[[id]],[JSON.stringify({...row,...bad})]];await rejects("invalid or foreign record is withheld "+JSON.stringify(bad));}
 replies=[new Error("index unavailable")];await rejects("index transport failure is not empty");
 replies=[[[id]],new Error("record unavailable")];await rejects("record transport failure is not empty");
 const other="abcdef1234567890abcdef12";replies=[[[id,other]],[JSON.stringify(row),null]];await rejects("one missing record withholds the partial snapshot");
 for(const limit of [0,-1,101,1.5,NaN]){let failed=false;try{await listBroadcastsStrict("chosen-list",limit);}catch{failed=true;}is("invalid limit refused",failed,true);}
 }finally{redis.pipeline=original;}
 done();
}
void main();
