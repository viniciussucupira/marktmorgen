import { verifyBackupRoundtrip, type BackupObjectStore } from "@/lib/backup-roundtrip";
import { type BackupSnapshot } from "@/lib/backup-codec";
import { done,is,part } from "./check";
const snapshot:BackupSnapshot={version:1,capturedAt:1792640000000,rows:[{key:"nl:synthetic:roundtrip",dump:Buffer.from("synthetic only").toString("base64"),expiresAt:null}]};
const key=Buffer.alloc(32,9);
async function main(){
 const objects=new Map<string,Buffer>(),previous=Buffer.from("previous verified object");objects.set("previous",previous);
 let reads=0,writes=0;
 const store:BackupObjectStore={putNew:async(id,data)=>{writes++;if(objects.has(id))throw Error("duplicate");objects.set(id,Buffer.from(data));},read:async id=>{reads++;return objects.get(id)!;}};
 part("Synthetic write and authenticated read-back");
 const proof=await verifyBackupRoundtrip(snapshot,key,store,65536);
 is("one write",writes,1);is("one bounded read",reads,1);is("key count verified",proof.keys,1);
 is("previous backup unchanged",objects.get("previous")?.equals(previous),true);
 const first=proof.id;
 const second=await verifyBackupRoundtrip(snapshot,key,store,65536);
 is("distinct create-only identities",first!==second.id,true);
 const refuses=async(fn:()=>Promise<unknown>)=>{try{await fn();return false;}catch{return true;}};
 const broken:BackupObjectStore={...store,read:async id=>{const data=Buffer.from(objects.get(id)!);data[data.length-1]^=1;return data;}};
 is("corrupt read-back fails",await refuses(()=>verifyBackupRoundtrip(snapshot,key,broken,65536)),true);
 is("previous retained after failure",objects.get(first)!==undefined&&objects.get("previous")?.equals(previous),true);
 const before=writes;
 is("oversize refused before storage",await refuses(()=>verifyBackupRoundtrip(snapshot,key,store,34)),true);
 is("no write on size failure",writes,before);
 is("unknown read fails",await refuses(()=>verifyBackupRoundtrip(snapshot,key,{...store,read:async()=>{throw Error("synthetic unavailable");}},65536)),true);
 is("no deletion capability",Object.hasOwn(store,"delete"),false);
 done();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
