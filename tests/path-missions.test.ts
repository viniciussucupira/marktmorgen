import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathMissions } from "@/components/path-missions";
import { dayMissions, trafficMissions, NO_FACTS } from "@/lib/path-rules";
import { done, is, part } from "./check";

const answers = { minutes: 60 as const, audience: "instagram" as const, subject: "<script>alert(1)</script>", skills: "Baking" };
const facts = { ...NO_FACTS, testPurchase: "unavailable" as const, postLinks: 2 };
const missions = [...dayMissions(facts, answers), ...trafficMissions(facts)];
const hrefFor = () => "/studio?store=0123456789abcdef0123456789abcdef#details";
const html = renderToStaticMarkup(createElement(PathMissions, { missions, hrefFor }));

part("Mission guidance never authorizes completion or a live test purchase");
is("partial progress is visible", html.includes("2 of 3 recorded"), true);
is("meter exposes the server's count", html.includes('value="2" max="3"'), true);
is("only open missions have actions", (html.match(/<details/g) || []).length, missions.filter(m => m.state === "open").length);
is("the unavailable test has no payment instructions", html.includes("4242"), false);
is("unavailable test is explained", html.includes("Available only in Stripe test mode"), true);
is("actions preserve the page's store", html.includes('href="' + hrefFor() + '"'), true);
is("no completion field", /<input|<button|<form/.test(html), false);
is("personal words are escaped", html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), true);
is("personal words cannot inject a script", html.includes("<script>"), false);

part("The largest set of instructions stays inside the page's existing response bound");
const longest = { ...answers, subject: "&".repeat(80), skills: "&".repeat(120) };
const allOpen = [...dayMissions(NO_FACTS, longest), ...trafficMissions(NO_FACTS)];
const worst = renderToStaticMarkup(createElement(PathMissions, { missions: allOpen, hrefFor }));
is("bounded mission guidance stays below 30 KB of the page's 70 KB bound", Buffer.byteLength(worst, "utf8") < 30_000, true);
is("native disclosures work without an added script", worst.includes("<script"), false);
part("A recorded test checkout is not delivery verification");
for(const state of ["open","done"] as const){
 const testMission=dayMissions({...NO_FACTS,testMode:true,testPurchase:state},answers)[2];
 const markup=renderToStaticMarkup(createElement(PathMissions,{missions:[testMission],hrefFor}));
 is("checkout state preserved:"+state,testMission.state,state);
 is("recorded and open checkout both disclose manual delivery check:"+state,markup.includes("File access and delivery still need a manual check."),true);
 is("no assertion that the whole journey is proved:"+state,testMission.why.includes("proves the whole way"),false);
 if(state==="open"){
  is("confirm test mode before card entry",testMission.steps[0].includes("Confirm that your store is in Stripe test mode"),true);
  is("live checkout never asks for real card",testMission.steps[0].includes("do not use a real card"),true);
 }
}
done();
