import { sealBackup, openBackup, restoreRows, type BackupSnapshot } from "@/lib/backup-codec";
import { done, is, part } from "./check";
import { isDeepStrictEqual } from "node:util";
const key=Buffer.alloc(32,7),now=1792640000000;
const snapshot:BackupSnapshot={version:1,capturedAt:now,rows:[
 {key:"nl:synthetic:store",dump:Buffer.from("synthetic shop").toString("base64"),expiresAt:null},
 {key:"nl:synthetic:temporary",dump:Buffer.from([0,255,1,2]).toString("base64"),expiresAt:now+1000}
]};
function fails(run:()=>unknown){try{run();return false;}catch{return true;}}
part("Encrypted backup restores synthetic data only");
const encrypted=sealBackup(snapshot,key);
is("authenticated roundtrip",isDeepStrictEqual(openBackup(encrypted,key),snapshot),true);
is("plaintext is not stored",encrypted.includes(Buffer.from("synthetic shop")),false);
is("fresh nonce for every seal",encrypted.equals(sealBackup(snapshot,key)),false);
is("wrong key refused",fails(()=>openBackup(encrypted,Buffer.alloc(32,8))),true);
for(const pos of [0,5,17,33,encrypted.length-1]){
 const changed=Buffer.from(encrypted);changed[pos]^=1;
 is("tampered envelope refused",fails(()=>openBackup(changed,key)),true);
}
is("truncated envelope refused",fails(()=>openBackup(encrypted.subarray(0,30),key)),true);
is("short key refused",fails(()=>sealBackup(snapshot,Buffer.alloc(16))),true);
is("duplicate keys refused",fails(()=>sealBackup({...snapshot,rows:[snapshot.rows[0],snapshot.rows[0]]},key)),true);
is("foreign key refused",fails(()=>sealBackup({...snapshot,rows:[{...snapshot.rows[0],key:"foreign:key"}]},key)),true);
is("invalid dump refused",fails(()=>sealBackup({...snapshot,rows:[{...snapshot.rows[0],dump:"bad!"}]},key)),true);
is("expired capture refused",fails(()=>sealBackup({...snapshot,rows:[{...snapshot.rows[1],expiresAt:now}]},key)),true);
is("restore never extends expired TTL",restoreRows(openBackup(encrypted,key),now+1000).length,1);
const simulated=new Map(restoreRows(openBackup(encrypted,key),now+500).map(row=>[row.key,{dump:row.dump,expiresAt:row.expiresAt}]));
is("all live records restored into simulated database",simulated.size,2);
is("binary value preserved",simulated.get(snapshot.rows[1].key)?.dump,snapshot.rows[1].dump);
is("absolute expiry preserved",simulated.get(snapshot.rows[1].key)?.expiresAt,now+1000);
is("restore clock before snapshot refused",fails(()=>restoreRows(snapshot,now-1)),true);
is("input beyond bound refused",fails(()=>sealBackup({...snapshot,rows:[{...snapshot.rows[0],dump:Buffer.alloc(4*1024*1024).toString("base64")}]},key)),true);
done();
