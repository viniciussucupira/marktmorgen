import { fits, maximumUploadBytes, storageBrakeFor, type StorageUse } from "@/lib/storage-quota";
import { done, is } from "./check";
const GB=1024*1024*1024;
const held=(bytes:number,brake=200*GB):StorageUse=>({bytes,brake,left:Math.max(0,brake-bytes),full:bytes>=brake,available:true});
is("paid store with 1 GB left cannot accept 5 GB",fits(held(199*GB),5*GB),false);
is("paid store can use exactly its remaining 1 GB",fits(held(199*GB),GB),true);
is("signature ceiling shrinks to 1 GB",maximumUploadBytes(held(199*GB),5*GB),GB);
is("empty paid store still keeps the 5 GB file ceiling",maximumUploadBytes(held(0),5*GB),5*GB);
for(const standing of ["paid","trial","none","ended"] as const){
 const brake=storageBrakeFor(standing);
 const room=held(brake-1,brake);
 is(standing+" accepts the final byte",fits(room,1),true);
 is(standing+" rejects one byte past remaining room",fits(room,2),false);
 is(standing+" signature cannot authorize excess",maximumUploadBytes(room,5*GB),1);
 is(standing+" at its limit cannot authorize more",maximumUploadBytes(held(brake,brake),5*GB),0);
 is(standing+" already over limit cannot add a byte",fits(held(brake+1,brake),1),false);
}
for(const size of [0,-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){
 is("invalid file size cannot fit",fits(held(0),size),false);
 is("invalid signature maximum cannot authorize bytes",maximumUploadBytes(held(0),size),0);
}
for(const broken of [
 {...held(0),available:false},
 {...held(0),available:undefined},
 {...held(0),bytes:NaN},
 {...held(0),bytes:-1},
 {...held(0),bytes:0.5},
 {...held(0),brake:0},
 {...held(0),brake:Infinity},
 {...held(0),left:-1},
 {...held(0),left:0.5},
 {...held(0),left:200*GB+1},
 {...held(0),left:200*GB-1},
 {...held(0),full:true},
]){
 const value=broken as StorageUse;
 is("unavailable or inconsistent capacity cannot sign",maximumUploadBytes(value,5*GB),0);
 is("unavailable or inconsistent capacity cannot accept a file",fits(value,1),false);
}
is("zero recorded storage does not bypass unavailable measurement",maximumUploadBytes({...held(0),available:false},5*GB),0);
is("safe large byte values stay within per-file maximum",maximumUploadBytes(held(Number.MAX_SAFE_INTEGER-5,Number.MAX_SAFE_INTEGER),3),3);
is("safe large byte values stay within remaining capacity",maximumUploadBytes(held(Number.MAX_SAFE_INTEGER-5,Number.MAX_SAFE_INTEGER),6),5);
done();
