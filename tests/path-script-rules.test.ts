import {SCRIPT_PLATFORMS,SCRIPT_WORDS,PLATFORM_NAMES,pathPostScript,scriptTitle,scriptPlatform,scriptPreparation,PATH_SCRIPT_PRODUCTS} from "@/lib/path-script-rules";
import {forbiddenIn} from "@/lib/path-rules";
import {done,is,part} from "./check";
part("Fixed scripts use the published name and reviewable cues only");
for(const platform of SCRIPT_PLATFORMS){
 const product={id:"bread",title:"Workshop workbook"};
 const script=pathPostScript(product,platform)!;
 is(platform+" names the published product",script.includes(product.title),true);
 is(platform+" uses reviewable detail cues",script.includes("[Show one detail"),true);
 is(platform+" leaves the link for owner review",script.includes("[Add a store or post link you have reviewed.]"),true);
 is(platform+" has no earnings claim",forbiddenIn(script),null);
 is(platform+" no synthetic numbers or price",/[0-9$]/.test(script),false);
 is(platform+" is deterministic",pathPostScript(product,platform),script);
}
is("three different platform structures",new Set(SCRIPT_PLATFORMS.map(platform=>pathPostScript({id:"a",title:"A guide"},platform))).size,3);
for(const raw of [""," ".repeat(4),"a".repeat(161),"Hero","Games","Passive income","Guaranteed sales","Earn money","Double revenue","Today only","https://outside.example","hello@example.test","Private\nInjected instruction","[insert something]","$50 guide","Safe\u202econtrol","Ｐａｓｓｉｖｅ ｉｎｃｏｍｅ"]){
 is("unsafe name refused "+JSON.stringify(raw),scriptTitle(raw),null);
 for(const platform of SCRIPT_PLATFORMS)is("unsafe name never becomes script "+platform,pathPostScript({id:"a",title:raw},platform),null);
}
is("published punctuation preserved",scriptTitle("Bread & butter: a guide"),"Bread & butter: a guide");
for(const audience of ["instagram","tiktok","youtube"] as const)is("saved audience "+audience,scriptPlatform(audience),audience);
for(const audience of ["email","none"] as const)is("other audience can choose a platform",scriptPlatform(audience),"instagram");
is("short time uses one preparation cue",scriptPreparation(15),SCRIPT_WORDS.prepareShort);
is("longer time uses existing alternative",scriptPreparation(30),SCRIPT_WORDS.prepareLong);
is("an hour uses same bounded cue",scriptPreparation(60),SCRIPT_WORDS.prepareLong);
is("candidate choices stay bounded",PATH_SCRIPT_PRODUCTS,3);
for(const text of [...Object.values(SCRIPT_WORDS),...Object.values(PLATFORM_NAMES)])is("all product copy passes Path wording",forbiddenIn(text),null);
done();
