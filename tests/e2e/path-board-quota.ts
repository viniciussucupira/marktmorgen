/** Exhaust only the disposable browser fixture's monthly studio allowance. */
import {storeForEmail} from "@/lib/store";
import {allowanceFor} from "@/lib/store-allowance-rules";
import {allowanceUsed,takeAllowance} from "@/lib/store-allowance";
async function main(){
 const store=await storeForEmail("owner@example.com");if(!store)throw Error("missing synthetic owner");
 const cap=allowanceFor(store,"studio");
 const used=await allowanceUsed(store,"studio");
 if(cap>used && !(await takeAllowance(store,"studio",cap-used)).ok)throw Error("quota setup refused");
 if((await takeAllowance(store,"studio",1)).ok)throw Error("monthly quota was not exhausted");
}
main().catch(error=>{console.error(error);process.exit(1)});
