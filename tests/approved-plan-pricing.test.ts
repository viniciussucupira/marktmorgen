import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Pricing } from "@/components/home-parts";
import { COMMISSION_BPS, COMMISSION_LIVE, COMMISSION_PLANS_PUBLISHED, PLAN_PRICES, PLAN_TITLES, PRICES_WITHOUT_COMMISSION, PUBLISHED_PLAN_PRICES, TIERS, publishedPriceWords, publishedYearSaving } from "@/lib/plan";
import { feeWords, planPriceWords } from "@/lib/fee-words";
import { planOf } from "@/lib/billing";
import { shareBps } from "@/lib/platform-share";
import { PLANS_ON_SALE } from "@/lib/opening";
import { commercialMarginReady } from "@/lib/commercial-margin";
import { done, is } from "./check";
is("published names",PLAN_TITLES,{creator:"Store",pro:"Studio",scale:"Scale"});
is("published monthly cents",TIERS.map(t=>PUBLISHED_PLAN_PRICES[t].month),[2200,14900,34900]);
is("published annual cents",TIERS.map(t=>PUBLISHED_PLAN_PRICES[t].year),[22000,149000,349000]);
is("configured percentages",COMMISSION_BPS,{creator:625,pro:275,scale:0});
is("annual savings",TIERS.map(publishedYearSaving),[4400,29800,69800]);
for(const tier of TIERS){
 is(tier+" annual buys twelve months for ten monthly payments",PUBLISHED_PLAN_PRICES[tier].year,PUBLISHED_PLAN_PRICES[tier].month*10);
 is(tier+" annual quote retains the configured sales fee",planPriceWords(tier,"year"),planPriceWords(tier,"year",true));
 for(const cycle of ["month","year"] as const){
  const legacy=planOf({items:{data:[{price:{unit_amount:PRICES_WITHOUT_COMMISSION[tier][cycle],recurring:{interval:cycle}}}]}});
  is(tier+" legacy "+cycle+" retains identity and no commission contract",[legacy.tier,legacy.cycle,legacy.shared],[tier,cycle,false]);
  const offered=planOf({items:{data:[{price:{unit_amount:PUBLISHED_PLAN_PRICES[tier][cycle],recurring:{interval:cycle}}}]}});
  is(tier+" proposed "+cycle+" is recognized",[offered.tier,offered.cycle],[tier,cycle]);
 }
}
is("Store annual display",publishedPriceWords("creator","year"),"$220 a year");
is("Studio annual display",publishedPriceWords("pro","year"),"$1,490 a year");
is("Scale annual display",publishedPriceWords("scale","year"),"$3,490 a year");
is("offer publication enabled",COMMISSION_PLANS_PUBLISHED,true);
is("offer publication does not enable fee collection",COMMISSION_LIVE,false);
is("existing operational prices preserved",PLAN_PRICES,PRICES_WITHOUT_COMMISSION);
is("actual sales fee remains disabled",shareBps({shared:true,subscriptionActive:true,trialEnds:0,tier:"creator"}),0);
is("legacy sales never acquire a fee from publication",shareBps({shared:false,subscriptionActive:true,trialEnds:0,tier:"creator"},Date.now()/1000,true),0);
is("public fee wording follows approved offer",feeWords().takes,feeWords(true).takes);
is("historical wording remains selectable",feeWords(false).editor,"Marktmorgen takes no cut of the sale.");
is("pricing approval is not margin certification",commercialMarginReady(),false);
is("commercial sales remain closed",PLANS_ON_SALE,false);
const html=renderToStaticMarkup(createElement(Pricing));
for(const name of ["Store","Studio","Scale"]) is(name+" appears as a plan",html.includes(">"+name+"</p>"),true);
for(const rate of ["6.25% of sales","2.75% of sales","0% of sales"]) is(rate+" is visible",html.includes(rate),true);
for(const tier of TIERS) is(tier+" setup link preserves the selected plan",html.includes("plan="+tier+"&amp;billing=month"),true);
is("all three plans say sales are not open",(html.match(/Not yet\. Marktmorgen is still being built/g)??[]).length,3);
is("no blanket zero-fee claim",html.includes("We take none of it"),false);
done();
