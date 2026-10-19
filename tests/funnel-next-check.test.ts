import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FunnelNextCheck } from "@/components/funnel-next-check";
import { funnelNextCheck, NEXT_CHECK_NOTE } from "@/lib/funnel-next-check";
import type { FunnelLaunchIssue } from "@/lib/funnel-launch-review";
import type { FunnelFinding } from "@/lib/funnel-diagnosis";
import { is, done } from "./check";
const findings:FunnelFinding[]=[
 {code:"too_few",title:"Small sample",detail:"Wait for more readings."},
 {code:"largest_fall",title:"Fall",detail:"Read the button.",stepIndex:1},
 {code:"none_completed",title:"No orders",detail:"Review checkout.",stepIndex:2},
 {code:"unreached",title:"Nobody reached it",detail:"Check navigation.",stepIndex:0},
 {code:"unavailable",title:"Unavailable",detail:"Reload to try again."},
];
const payment:FunnelLaunchIssue={code:"payments",title:"Payments unavailable",detail:"Review the saved connection."};
is("saved launch blockers precede count interpretation",funnelNextCheck([payment],findings).phase,"launch");
is("launch settings preserve the configured issue order",funnelNextCheck([{code:"disabled",title:"Off",detail:"Prepare first."},payment],findings).action,"settings");
is("unknown readings precede optimization suggestions",funnelNextCheck([],findings).phase,"data");
is("unreached steps precede completion and fall checks",funnelNextCheck([],findings.slice(0,4)).stepIndex,0);
is("completion checks precede the largest fall",funnelNextCheck([],findings.slice(0,3)).stepIndex,2);
is("fall precedes small sample",funnelNextCheck([],findings.slice(0,2)).stepIndex,1);
is("small sample remains cautious",funnelNextCheck([],findings.slice(0,1)).phase,"sample");
is("clean saved checks still require customer testing",funnelNextCheck([],[]).phase,"test");
is("no confidence or outcome promised",/forecast|experiment result/.test(NEXT_CHECK_NOTE),true);
const show=(change:Partial<Parameters<typeof FunnelNextCheck>[0]>={})=>renderToStaticMarkup(createElement(FunnelNextCheck,{check:funnelNextCheck([payment],[]),editors:[],locked:false,settingsDisabled:false,onSettings(){},onNavigate(){},...change}));
const finance=show({paymentReview:{available:false,paymentsHref:"/studio?store=chosen#stripe",billingHref:"/studio?store=chosen#billing"}});
is("financial navigation stays in selected store",finance.includes('href="/studio?store=chosen#stripe"')&&finance.includes('href="/studio?store=chosen#billing"'),true);
is("roles without financial access get no payment link",show().includes("href="),false);
const step=funnelNextCheck([],[findings[3]]);
const linked=show({check:step,editors:[{href:"/studio/site?store=chosen&page=p1",label:"Edit page"}],locked:true});
is("step repair keeps its editor and recovery keyboard lock",linked.includes("page=p1")&&linked.includes('aria-disabled="true"')&&linked.includes('tabindex="-1"'),true);
is("missing editor falls back to guarded settings",show({check:step,settingsDisabled:true}).includes('disabled=""'),true);
const quiz=funnelNextCheck([{code:"quiz_product",title:"<script>unsafe</script>",detail:"Draft recommendation",stepIndex:1,formId:"form000001"}],[]);
const quizMarkup=show({check:quiz,formsHref:"/studio/forms?store=chosen"});
is("quiz repair uses the selected store and form",quizMarkup.includes('href="/studio/forms?store=chosen#form-review-form000001"'),true);
is("untrusted title stays escaped",quizMarkup.includes("&lt;script&gt;unsafe&lt;/script&gt;")&&!quizMarkup.includes("<script>unsafe"),true);
is("roles without forms permission get no quiz link",show({check:quiz}).includes("href="),false);
is("the disclosure is keyboard native",quizMarkup.includes("<details")&&quizMarkup.includes("<summary"),true);
done();
