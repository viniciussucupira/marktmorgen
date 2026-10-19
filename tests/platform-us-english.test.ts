import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
import {britishCopyHits} from "./us-english-source";
import {done,is,part} from "./check";
part("American English guard distinguishes prose from compatibility identifiers");
for(const source of ['const label="Colour";','const label="colour";','const node=<p>{"colour"}</p>;','const thing={hint:"Choose a colour",body:"The plan was cancelled."};','const node=<p>Tick this box afterwards.</p>;','const node=<input aria-label="Untick this box"/>;','const line=\`The request was cancelled for \${name}\`']){
 is("displayed British sample is rejected",britishCopyHits("components/sample.tsx",source).length>0,true);
}
for(const source of ['const className="sp-tick text-sm";','const node=clsx("sp-tick text-sm");','// colour centre cancelled\nconst value=1;','import {read} from "@/lib/licence-keys";','type State="cancelled"|"active"; const status="cancelled";','const event={cancelled:true};','const node=<div className="sp-tick text-sm" aria-labelledby="catalogue-title"/>;','const map={cancelled:"Canceled",cancelling:"Canceling"};']){
 is("legacy technical syntax is preserved",britishCopyHits("components/sample.tsx",source),[]);
}
is("existing non-English buyer copy is outside this policy",britishCopyHits("lib/buyer-words/fr.ts",'export const text="Centre";'),[]);
is("mixed buyer dictionaries retain other languages",britishCopyHits("lib/buyer-words/sample.ts",'const words={en:{label:"Center"},fr:{label:"Centre"}};'),[]);
is("separate foreign buyer declarations remain unchanged",britishCopyHits("lib/buyer-words/sample.ts",'const fr={label:"Centre"}; const en={label:"Center"};'),[]);
is("American prose passes",britishCopyHits("components/sample.tsx",'const item={label:"Color",hint:"Colored labels use color, colors and colorful details. Select a checkbox. Your plan was canceled afterward."};'),[]);
is("single-word test title is also checked",britishCopyHits("tests/sample.test.ts",'test("colour",()=>{});').length,1);
is("test output titles are also platform-maintained text",britishCopyHits("tests/sample.test.ts",'is("colour choice",actual,true);').length,1);
is("test data can exercise a forbidden sample",britishCopyHits("tests/sample.test.ts",'const sample="Choose a colour"; is("British sample",scan(sample),true);'),[]);
for(const word of ["colour","centre","organise","licence","cancelled","behaviour","afterwards","tick","untick"]){
 is("each requested British form is rejected",britishCopyHits("components/sample.tsx",'const entry={label:"'+word+'"};').length,1);
}
for(const word of ["color","center","organize","license","canceled","behavior","afterward","select","check"]){
 is("American counterpart passes",britishCopyHits("components/sample.tsx",'const entry={label:"'+word+'"};'),[]);
}
part("All current app, component, library and test-diagnostic sources");
const root=process.cwd(),paths:string[]=[];
function walk(relative:string){for(const entry of readdirSync(join(root,relative),{withFileTypes:true})){const path=relative+"/"+entry.name;if(entry.isDirectory())walk(path);else if(/\.(?:tsx?|mjs)$/.test(path))paths.push(path);}}
for(const directory of ["app","components","lib","tests"])walk(directory);
is("real source inventory is scanned",paths.length>1000,true);
const hits=paths.flatMap(path=>britishCopyHits(path,readFileSync(join(root,path),"utf8")));
for(const hit of hits.slice(0,120))console.log(hit.path+":"+hit.line+" ["+hit.word+"] "+hit.text.replace(/\s+/g," ").slice(0,220));
is("platform prose and diagnostic titles use American spelling",hits.length,0);
done();
