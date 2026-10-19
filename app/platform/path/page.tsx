import type { Metadata } from "next";
import { TopicPageView } from "@/components/topic-page";
export const metadata: Metadata={title:"Marktmorgen Path — From first light to first sale",description:"A practical next mission, verified by your store's records."};
export default function PathFeaturePage(){
 return <TopicPageView page={{
  slug:"path",section:"platform",eyebrow:"Marktmorgen Path",title:"From first light",highlight:"to first sale.",
  intro:"Every step is real. Every sale is yours. Turn setting up your store, sharing your work and listening to customers into practical missions. Your store records the progress.",
  badge:{label:"In your studio",tone:"live"},accent:"from-violet-brand to-pink-brand",plan:"creator",
  blocks:[
   {kind:"how",title:"A next step you can act on",items:[
    {title:"Begin with your own answers",body:"Choose your subject, skills, available time and audience. A monthly goal is optional, personal and never a forecast."},
    {title:"Follow the store facts",body:"Publish your store, offer a product, check delivery in Stripe test mode, share post links, welcome a lead and work toward a real sale. Missions are recorded from store data."},
    {title:"Return at your pace",body:"Keep your reached level. Sundays and two weekly rest days are built into check-in streaks. A live store skips the test-purchase mission."}
   ]},
   {kind:"limits",title:"What Path will not do",items:[
    "It will not predict or promise sales or income.",
    "It will not mark a mission complete because a box was checked.",
    "It will not ask you to buy from your own live store.",
    "It will not send marketing emails on your behalf or spend AI credits automatically.",
    "It will not publish your personal answers, goal or revenue.",
    "It cannot count an order it cannot verify. Readings can be delayed; their timestamps appear in your Path."
   ]},
   {kind:"note",title:"Included across plans and trial",body:"Path uses your existing studio allowance. Opening the page refreshes eligible readings at most once every ten minutes, after reserving their allowance. When no room remains, the last reading is shown."}
  ]
 }}/>;
}
