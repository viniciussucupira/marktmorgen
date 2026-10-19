"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import type { MouseEvent } from "react";
import type { FunnelNextCheck as Check } from "@/lib/funnel-next-check";
import { NEXT_CHECK_NOTE } from "@/lib/funnel-next-check";
import type { FunnelStepEditorLink } from "@/lib/funnel-editor-links";
import type { FunnelPaymentReview } from "@/components/funnel-sharing-review";

export function FunnelNextCheck({check,editors,paymentReview,formsHref,locked,settingsDisabled,onSettings,onNavigate}:{check:Check;editors:readonly(FunnelStepEditorLink|null|undefined)[];paymentReview?:FunnelPaymentReview;formsHref?:string|null;locked:boolean;settingsDisabled:boolean;onSettings:()=>void;onNavigate:(event:MouseEvent<HTMLAnchorElement>)=>void}) {
 const editor=check.action==="forms" && formsHref && check.formId?{href:formsHref+"#form-review-"+encodeURIComponent(check.formId),label:"Review quiz"}:check.action==="step" && check.stepIndex!==undefined?editors[check.stepIndex]:null;
 const actions=check.action==="payments"?[{href:paymentReview?.paymentsHref,label:"Review payments"},{href:paymentReview?.billingHref,label:"Review store plan"}]:editor?[editor]:[];
 return <details className="group mt-4 rounded-xl border border-violet-brand/30 bg-paper p-3" aria-label="Suggested next funnel check">
   <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-2 font-semibold"><Icon name="chevron-down" size={16} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"/><span className="min-w-0 break-words">Next check: {check.title}</span></summary>
   <p className="mt-2 text-sm text-ink-soft">{check.detail}</p>
   {check.action==="settings" || (check.action==="step" && !editor)?<button type="button" className="btn btn-ghost mt-2" disabled={settingsDisabled} onClick={onSettings}>Review funnel settings</button>:null}
   <div className="mt-1 flex flex-wrap gap-3">{actions.map(action=>action.href?<Link key={action.href} href={action.href} prefetch={false} aria-disabled={locked} tabIndex={locked?-1:undefined} onClick={onNavigate} className="inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4 aria-disabled:opacity-40">{action.label}</Link>:null)}</div>
   <p className="mt-2 text-xs text-ink-mute">{NEXT_CHECK_NOTE}</p>
 </details>;
}
