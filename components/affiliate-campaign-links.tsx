"use client";

import { useId, useState } from "react";
import { SharePanel } from "@/components/share-panel";

export function AffiliateCampaignLinks({ products }: { products: { id: string; title: string; url: string }[] }) {
  const id=useId();
  const [selected,setSelected]=useState("");
  const product=products.find(item=>item.id===selected)??products[0];
  if(!product)return null;
  return <details className="mt-6 rounded-xl border p-4" style={{borderColor:"var(--st-line)"}}>
    <summary className="cursor-pointer text-sm font-semibold">Create a link for a product, post or ad</summary>
    <p className="st-muted mt-2 text-sm">Keep your affiliate code on the link and name each campaign and post variant. These labels appear with recorded commissions when available. A link does not guarantee attribution: consent, program terms and the buyer&apos;s checkout still apply. If the creator assigned you a coupon, it is an alternative when cookies are declined. Include a clear commission disclosure wherever you share.</p>
    <label htmlFor={id} className="st-label mt-3">Product<select id={id} className="field mt-1 w-full" value={product.id} onChange={event=>setSelected(event.target.value)}>{products.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <p className="st-muted mb-3 mt-1 text-xs">Published commission-earning products already loaded on this page, up to 60. This is not the entire catalog.</p>
    <SharePanel key={product.id} url={product.url} title={product.title + ". Affiliate link: I earn a commission if you buy through it."} what="affiliate product" />
  </details>;
}
