"use client";
import {useState} from "react";
import Link from "next/link";
import {useLeaveGuard} from "@/components/leave-guard";
import {formatMoney} from "@/lib/money";
import {proposeOfferPlan,type OfferPlanningProduct,type OfferPlanningCandidate} from "@/lib/offer-planning";
export function OfferPlanning({products,candidates,currency,storeId,initialProduct,oneClickAvailable,pageAvailable}:{products:OfferPlanningProduct[];candidates:OfferPlanningCandidate[];currency:string;storeId:string;initialProduct:string;oneClickAvailable:boolean;pageAvailable:boolean}){
 const [productId,setProductId]=useState(products.some(p=>p.id===initialProduct&&p.eligible)?initialProduct:products.find(p=>p.eligible)?.id||""),[decision,setDecision]=useState<"review"|"accepted"|"dismissed">("review"),[draft,setDraft]=useState(""),[copyState,setCopyState]=useState("");
 useLeaveGuard(decision==="accepted"&&draft.trim().length>0);
 const plan=proposeOfferPlan({productId,products,candidates,oneClickAvailable,pageAvailable});
 const money=(cents:number)=>formatMoney(cents,currency);
 function accept(){if(!plan)return;setDecision("accepted");setCopyState("");setDraft([plan.product.title,"Starting price reference: "+money(plan.priceCents),plan.basis==="own-category"?"Rule: lower-middle observed price from "+plan.comparisonCount+" other eligible items in the same coarse catalog category.":"Rule: no eligible comparison; keep the current price as the starting point.",...plan.steps.map((step,index)=>(index+1)+". "+step),...plan.conditions].join("\n\n"));}
 return <section aria-labelledby="offer-planning-title" className="card mt-8 p-5 sm:p-8" data-offer-planning>
 <p className="eyebrow">Price and offer copilot</p><h2 id="offer-planning-title" className="mt-3 text-xl font-semibold">Plan an offer you can explain</h2>
 <p className="mt-3 max-w-3xl text-ink-soft">Use your own catalog and the rules below to choose a starting point. This planner makes no AI or service request. It does not predict sales, recommend a profit margin or change a price or funnel.</p>
 <label className="mt-5 block max-w-xl"><span className="field-label">Product to plan</span><select className="field mt-2" value={productId} onChange={event=>{setProductId(event.target.value);setDecision("review");setDraft("");setCopyState("");}}>
 {products.some(p=>p.eligible)?products.filter(p=>p.eligible).map(p=><option key={p.id} value={p.id}>{p.title}</option>):<option value="">No eligible one-off product</option>}</select></label>
 {!plan?<p role="status" className="mt-4 text-sm text-ink-soft">No published one-off product with a confirmed price is available. Review your catalog first; this does not mean a price of zero.</p>:decision==="dismissed"?<div className="mt-4"><p role="status">Suggestion dismissed. Your current prices and funnels are unchanged.</p><button type="button" className="btn btn-secondary mt-3" onClick={()=>setDecision("review")}>Review the suggestion again</button></div>:<>
 <div className="mt-5 grid gap-6 lg:grid-cols-2"><div><h3 className="font-semibold">Starting price reference: {money(plan.priceCents)}</h3>
 <p className="mt-2 text-sm text-ink-soft">Current price: {money(plan.product.priceCents)}.</p>
 <p className="mt-3 text-sm text-ink-soft">{plan.basis==="own-category"?"Rule: use the lower-middle observed price from "+plan.comparisonCount+" other published one-off items in your own "+plan.product.category+" category. This is a coarse comparison; the contents may differ.":"No eligible comparison is available. Keep the current price as the reference; do not invent a market price."}</p>
 {plan.observedRange?<p className="mt-2 text-sm text-ink-soft">Observed range: {money(plan.observedRange[0])} to {money(plan.observedRange[1])}. No competitor or outside pricing data is used.</p>:null}
 </div><div><h3 className="font-semibold">Suggested review structure</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">{plan.steps.map(step=><li key={step}>{step}</li>)}</ol></div></div>
 <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-ink-soft">{plan.conditions.map(condition=><li key={condition}>{condition}</li>)}</ul>
 {decision==="review"?<div className="mt-5 flex flex-wrap gap-3"><button type="button" className="btn btn-primary" onClick={accept}>Accept as unsaved plan</button><button type="button" className="btn btn-secondary" onClick={()=>setDecision("dismissed")}>Reject suggestion</button></div>:<div className="mt-5">
 <label className="block"><span className="field-label">Your unsaved offer plan</span><textarea className="field mt-2 min-h-64" maxLength={12000} value={draft} onChange={event=>setDraft(event.target.value)}/></label>
 <p role="status" className="mt-3 text-sm text-ink-soft">Accepted into this page only. Copy it before leaving; nothing has been saved, published or enabled.</p>
 <div className="mt-3 flex flex-wrap gap-3"><button type="button" className="btn btn-secondary" onClick={async()=>{try{await navigator.clipboard.writeText(draft);setCopyState("Plan copied.");}catch{setCopyState("The plan could not be copied. Select its text and copy it yourself.");}}}>Copy my plan</button><button type="button" className="btn btn-ghost" onClick={()=>{setDecision("dismissed");setDraft("");}}>Discard this plan</button></div>
 {copyState?<p role="status" className="mt-2 text-sm text-ink-soft">{copyState}</p>:null}
 <Link href={"/studio?store="+encodeURIComponent(storeId)+"#products"} prefetch={false} className="link mt-3 inline-flex min-h-11 items-center">Review the product in your studio</Link>
 </div>}</>}
 </section>;
}
