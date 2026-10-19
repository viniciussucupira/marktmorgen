import {emptyCatalog,itemOf,productWrites,readProductsStrict,parseProduct} from "@/lib/catalog";
import type {Store} from "@/lib/store";
import {store as redis,redisPipeline} from "./redis-stub";
import {done,is,part} from "./check";
async function main(){
 redis.clear();
 const product=parseProduct({id:"knife00001",title:"Knife guide",priceCents:1000,summary:"A useful guide"});
 if(!product)throw new Error("product fixture");
 const store={catalog:{...emptyCatalog("a".repeat(32)),items:[itemOf(product)]}} as Store;
 part("A strict catalog witness cannot turn damaged data into absence");
 await redisPipeline(productWrites(store.catalog.id!,product));
 is("legitimate absent extras means no configured offer",(await readProductsStrict(store,[product.id]))[0].funnel,null);
 const real=redis.pipeline;
 let refused=false;
 try{
  redis.pipeline=async commands=>{
   const values=await real(commands);
   return values.map((value,index)=>index===1?"{":value);
  };
  try{await readProductsStrict(store,[product.id]);}catch{refused=true;}
  is("malformed extras unavailable",refused,true);
  refused=false;
  redis.pipeline=async()=>[];
  try{await readProductsStrict(store,[product.id]);}catch{refused=true;}
  is("truncated response unavailable",refused,true);
 }finally{redis.pipeline=real;}
 refused=false;
 try{await readProductsStrict(store,["other00001"]);}catch{refused=true;}
 is("unrelated product refused",refused,true);
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
