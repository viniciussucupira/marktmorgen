import type {Product} from "@/lib/store";
export const calls:string[]=[];
export const evidence:{products:Product[];campaigns:unknown[];review:boolean|null;fail:boolean}={products:[],campaigns:[],review:null,fail:false};
export const KIND={hidden:1};
export const isRedisConfigured=()=>true;
export async function readProductsStrict(){calls.push("products");if(evidence.fail)throw new Error("synthetic read refusal");return evidence.products;}
export async function listBroadcastsStrict(){calls.push("campaigns");if(evidence.fail)throw new Error("synthetic read refusal");return evidence.campaigns;}
export async function pathBuyerReview(){calls.push("reviews");if(evidence.fail)throw new Error("synthetic read refusal");return evidence.review;}
