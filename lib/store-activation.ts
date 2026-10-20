import {KIND} from "@/lib/catalog";
import type {Store} from "@/lib/store";
export type ActivationTiming={state:"waiting"|"published"|"unknown";minutes:number|null;startedAt:string;publishedAt:string};
/** Existing store-registration date; never substitutes product creation for publication or invents historic events. */
export function activationTiming(store:Pick<Store,"createdAt"|"firstOfferPublishedAt"|"activationTracked"|"catalog">,now=Date.now()):ActivationTiming{
 const start=Date.parse(store.createdAt),end=Date.parse(store.firstOfferPublishedAt??"");
 const visible=store.catalog.items.some(item=>(item.kind&KIND.hidden)===0);
 if(!store.activationTracked||!Number.isFinite(start)||start>now)return {state:"unknown",minutes:null,startedAt:store.createdAt,publishedAt:""};
 if(Number.isFinite(end)&&end>=start&&end<=now)return {state:"published",minutes:Math.floor((end-start)/60000),startedAt:store.createdAt,publishedAt:store.firstOfferPublishedAt!};
 if(visible||store.firstOfferPublishedAt)return {state:"unknown",minutes:null,startedAt:store.createdAt,publishedAt:""};
 return {state:"waiting",minutes:Math.floor((now-start)/60000),startedAt:store.createdAt,publishedAt:""};
}
