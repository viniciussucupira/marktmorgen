import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { sealBackup, openBackup, type BackupSnapshot } from "@/lib/backup-codec";

/** Injected synthetic storage contract only. No production adapter or scheduler. */
export type BackupObjectStore = {
 putNew: (id:string, bytes:Uint8Array)=>Promise<void>;
 read: (id:string, maxBytes:number)=>Promise<Uint8Array>;
};
export type VerifiedBackup = { id:string; keys:number; bytes:number };
export async function verifyBackupRoundtrip(snapshot:BackupSnapshot,key:Uint8Array,store:BackupObjectStore,maxBytes:number):Promise<VerifiedBackup>{
 if(!Number.isSafeInteger(maxBytes)||maxBytes<34||maxBytes>4*1024*1024+65536)throw new Error("Invalid backup bound");
 const sealed=sealBackup(snapshot,key);
 if(sealed.length>maxBytes)throw new Error("Backup exceeds object bound");
 // Unique create-only identity; this API has no delete/overwrite/retention method.
 // Failed verification leaves every previous verified object intact.
 const id=randomUUID();
 await store.putNew(id,sealed);
 const read=await store.read(id,maxBytes);
 if(read.byteLength>maxBytes)throw new Error("Backup read exceeds bound");
 const restored=openBackup(read,key);
 if(!isDeepStrictEqual(restored,snapshot))throw new Error("Backup read-back mismatch");
 return{id,keys:restored.rows.length,bytes:read.byteLength};
}
