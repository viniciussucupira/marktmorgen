import {forbiddenIn,type PathAnswers} from "@/lib/path-rules";
export const PATH_SCRIPT_PRODUCTS=3;
export const PATH_SCRIPT_CANDIDATES=8;
export const SCRIPT_PLATFORMS=["instagram","tiktok","youtube"] as const;
export type ScriptPlatform=typeof SCRIPT_PLATFORMS[number];
export type ScriptProduct={id:string;title:string};
export const SCRIPT_WORDS={
 title:"Post scripts you can adapt",
 intro:"Fixed scripts, without AI. Replace each bracketed cue with something you can show. Review the words and your store page before sharing.",
 product:"Product",platform:"Platform",script:"Script to adapt",
 help:"Copying does not publish a post, send a message or record a mission. Your personal goal and free-text answers are never added.",
 copy:"Copy script",copying:"Copying…",copied:"Script copied. Review it before sharing.",
 selected:"Script selected. Use your device's copy command.",
 unavailable:"Copying is unavailable. You can select the script and copy it yourself.",
 review:"Review products",empty:"Publish a product with a clear name to see fixed post scripts here.",
 bounded:"These choices use up to three published products already loaded with your store. Other products may not be included.",
 prepareShort:"For a short session, prepare one detail you can demonstrate.",
 prepareLong:"With more time, prepare a second example before recording. Keep only details you can verify.",
} as const;
export const PLATFORM_NAMES:Record<ScriptPlatform,string>={instagram:"Instagram",tiktok:"TikTok",youtube:"YouTube"};
/** A published name is quoted, never expanded into an outcome or a customer claim. */
export function scriptTitle(raw:unknown):string|null{
 if(typeof raw!=="string")return null;
 const title=raw.trim(),reading=title.normalize("NFKC");
 if(!title||title.length>160||forbiddenIn(reading)||/[\p{Cc}\p{Cf}\p{Sc}<>\[\]@]/u.test(title)||/https?:|www\.|\b(?:earn\w*|income|profit\w*|revenue|salary|wealth\w*|rich|money|million\w*|billion\w*|guarantee\w*|viral|followers?|double|triple|urgent|scarcity)\b|risk.?free|last chance|today only|limited time|buy now/i.test(reading))return null;
 return title;
}
export function scriptPlatform(audience:PathAnswers["audience"]):ScriptPlatform{
 return SCRIPT_PLATFORMS.includes(audience as ScriptPlatform)?audience as ScriptPlatform:"instagram";
}
export function scriptPreparation(minutes:PathAnswers["minutes"]):string{
 return minutes===15?SCRIPT_WORDS.prepareShort:SCRIPT_WORDS.prepareLong;
}
/** Intentionally receives no goal, private free text, price, buyer or sales figures. */
export function pathPostScript(product:ScriptProduct,platform:ScriptPlatform):string|null{
 const title=scriptTitle(product.title);
 if(!title||!SCRIPT_PLATFORMS.includes(platform))return null;
 const detail="[Show one detail that is actually included in this product or its published page.]";
 const explain="[Describe exactly what you showed, in your own words. Remove this cue before sharing.]";
 const link="[Add a store or post link you have reviewed.]";
 if(platform==="instagram")return [
  "Opening: A closer look at "+title+".",
  "Show: "+detail,
  "Say: "+explain,
  "Closing: Read the product details on my store page.",
  "Caption: A closer look at "+title+". "+link,
 ].join("\n\n");
 if(platform==="tiktok")return [
  "Opening: Here is one detail from "+title+".",
  "Show: "+detail,
  "Say: "+explain,
  "Closing: You can read the product details on my store page.",
  "Caption: One detail from "+title+". "+link,
 ].join("\n\n");
 return [
  "Video title: A closer look at "+title,
  "Opening: Here is "+title+".",
  "Screen: [Show the published product page and read what is included.]",
  "Demonstration: "+detail,
  "Explanation: "+explain,
  "Closing: Read the product details on my store page.",
  "Description: "+link,
 ].join("\n\n");
}
