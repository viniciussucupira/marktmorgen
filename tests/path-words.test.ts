/**
 * Marktmorgen Path never says what it must not (lib/path-rules.ts,
 * FORBIDDEN_PHRASES and FORBIDDEN_MARKS; 18 October 2026). What is checked:
 *
 *   - every word a mission, a level, a reminder or the goal can be drawn
 *     with, for every answer a person can give and every state the facts can
 *     be in, carries no earnings claim ("make money online", "financial
 *     freedom", "replace your job", "passive income", an amount earned), no
 *     other company's mark ("Hero", "Games") and no plan "paying for itself";
 *   - every Path file in the code says none of them either, outside the list
 *     that names them;
 *   - the slogan and the title are the owner's, word for word, and the goal
 *     is only ever the person's own, never a forecast.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  type PathFacts,
  type Audience,
  AUDIENCES,
  MINUTES,
  NO_FACTS,
  LEVELS,
  LEVEL_NAMES,
  PATH_SLOGAN,
  PATH_TITLE,
  dayMissions,
  trafficMissions,
  pathProgress,
  levelRequirement,
  reminderOf,
  goalWords,
  forbiddenIn,
} from "@/lib/path-rules";
import {pathReturnMission,returnReminderOf,RETURN_HEADING,RETURN_PRIVACY_LINE} from "@/lib/path-return-rules";
import {pathGrowthMissions} from "@/lib/path-growth-rules";
import { done, is, part } from "./check";

const root = process.cwd();

part("The words drawn, for every answer and every state");
{
  const states: Partial<PathFacts>[] = [
    {},
    { testMode: true },
    { titlePublished: true, listedProducts: 1, productWithFile: true, testPurchase: "done", socialVisits: 3, postLinks: 2, leads: 1 },
    { testPurchase: "unavailable", realSales: 1, revenueCents: 12_345 },
  ];
  const found = new Set<string>();
  let texts = 0;
  for (const audience of AUDIENCES as readonly Audience[]) {
    for (const minutes of MINUTES) {
      for (const subject of ["", "sourdough"]) {
        for (const state of states) {
          const facts = { ...NO_FACTS, ...state };
          const answers = { audience, minutes, subject, skills: "baking" };
          const missions = [...dayMissions(facts, answers), ...trafficMissions(facts)];
          const progress = pathProgress(facts, answers, 0, 30 * 86_400_000);
          const reminder = reminderOf(progress, { days: 3, restLeft: 2, today: false });
          for (const m of missions) for (const t of [m.title, m.why, m.closesOn, m.place.label, ...m.steps]) {
            texts += 1;
            const bad = forbiddenIn(t);
            if (bad) found.add(`${bad}: ${t}`);
          }
          for (const t of reminder ? [reminder.title, reminder.body] : []) {
            texts += 1;
            const bad = forbiddenIn(t);
            if (bad) found.add(`${bad}: ${t}`);
          }
        }
      }
    }
  }
  for (const level of LEVELS) for (const t of [LEVEL_NAMES[level], levelRequirement(level, "usd"), levelRequirement(level, "jpy")]) {
    texts += 1;
    const bad = forbiddenIn(t);
    if (bad) found.add(`${bad}: ${t}`);
  }
  is("thousands of texts read", texts > 1_000, true);
  is("none says what it must not", [...found], []);
  is("the slogan, word for word", PATH_SLOGAN, "Every step is real. Every sale is yours.");
  is("the title, word for word", PATH_TITLE, "From first light to first sale.");
  is("the levels' names", LEVELS.map((l) => LEVEL_NAMES[l]), ["First Light", "Sunrise", "Morning", "High Sun", "Golden Hour", "Zenith"]);
  is("the goal is the person's own and predicts nothing", goalWords({ goalCents: 300_000, goalCurrency: "usd" }, "usd"), "Your goal: $3,000 a month. It is yours, and nothing here predicts it.");
  is("a goal in another currency is not shown as this one", goalWords({ goalCents: 300_000, goalCurrency: "eur" }, "usd"), "");
}

part("The list catches what it is for");
{
  for (const t of ["Make money online today", "Financial freedom", "replace your job", "Passive income", "Creators earned $5,000", "earn up to $900", "made $1,200 last week", "Kajabi Hero", "Skool Games", "Studio pays for itself from $3,629", "Scale from $7,273"]) is(`caught: ${t}`, forbiddenIn(t) !== null, true);
  for (const t of ["Your first real sale.", "$100 in real sales kept, refunds taken off.", "Make 3 post links"]) is(`allowed: ${t}`, forbiddenIn(t), null);
}

part("Every Path file in the code");
{
  const files: string[] = [];
  const walk = (dir: string, take: (path: string, name: string) => boolean) => {
    if (!existsSync(join(root, dir))) return;
    for (const name of readdirSync(join(root, dir))) {
      const path = join(dir, name);
      if (statSync(join(root, path)).isDirectory()) walk(path, take);
      else if (take(path, name)) files.push(path);
    }
  };
  walk("lib", (_, name) => /^path[-.]/.test(name));
  walk("components", (_, name) => /^path[-.]/.test(name));
  walk("app", (path) => /(^|\/)path(\/|$)/.test(path.replace(/\\/g, "/")) && /\.(ts|tsx)$/.test(path));
  files.push("lib/phone-alerts.ts", "components/phone-alerts-panel.tsx");
  is("the files are found", files.length >= 4, true);
  const bad: string[] = [];
  for (const file of files) {
    let text = readFileSync(join(root, file), "utf8");
    // The list that names the phrases is the one place they are written.
    text = text.replace(/export const FORBIDDEN_PHRASES[\s\S]*?\n\];/, "").replace(/export const FORBIDDEN_MARKS[^\n]*\n/, "");
    // Comments may cite the rule they follow; what is drawn is in the strings.
    const strings = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    const hit = forbiddenIn(strings);
    if (hit) bad.push(`${file}: ${hit}`);
  }
  is("none of them says it", bad, []);
}

part("The documented level list matches the active display names");
{
 const documented=readFileSync(join(root,"docs/marktmorgen-path.md"),"utf8");
 const retired=["Mid","day"].join("");
 is("current name and unchanged threshold documented",documented.includes("Morning $100, High Sun $1,000"),true);
 is("retired display name absent from Path documentation",documented.includes(retired),false);
 is("retired display name absent from every current level",LEVELS.some(level=>LEVEL_NAMES[level].includes(retired)),false);
 is("High Sun remains the fourth level",LEVEL_NAMES[LEVELS[3]],"High Sun");
}
part("All six post-sale missions in every evidence state");
for(const value of [null,false,true] as const){
 const missions=pathGrowthMissions({realSale:true,fileProducts:value===null?null:value?2:0,listEmailSent:value,repeatBuyer:value,postPurchaseOffer:value,buyerReview:value,keptOrders:value===null?null:value?10:0});
 for(const mission of missions)for(const text of [mission.title,mission.why,mission.closesOn,...mission.steps])is("post-sale copy "+mission.id,forbiddenIn(text),null);
}


part("Welcoming return mission copy, privacy and reminder");
{
 const step={day:"2026-10-19",introHash:"a".repeat(64)},now=Date.UTC(2026,9,19,16);
 const texts=[RETURN_HEADING,RETURN_PRIVACY_LINE];
 for(const hash of ["a".repeat(64),"b".repeat(64)])for(const introPublished of [false,true]){
  const mission=pathReturnMission(step,"America/New_York",{introHash:hash,introPublished},now);
  if(!mission)throw Error("No return fixture");
  texts.push(mission.title,mission.why,mission.closesOn,mission.place.label,...mission.steps);
  const reminder=returnReminderOf(mission);if(reminder)texts.push(reminder.title,reminder.body);
 }
 is("return copy has no forbidden claim",texts.map(text=>forbiddenIn(text)).filter(Boolean),[]);
 is("return copy has no absence pressure",texts.some(text=>/missed|behind|failed|lost days/i.test(text)),false);
}

done();
