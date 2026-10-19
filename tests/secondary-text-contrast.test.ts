import { readFileSync } from "node:fs";
import { join } from "node:path";
import { done,is,part } from "./check";
const css=readFileSync(join(process.cwd(),"app/globals.css"),"utf8");
function token(name:string):string{
  const value=css.match(new RegExp("--"+name+":\\s*(#[0-9a-fA-F]{6})"))?.[1];
  if(!value)throw Error("Missing colour token "+name);
  return value;
}
function luminance(hex:string):number {
  const values=(hex.slice(1).match(/../g)??[]).map(value=>parseInt(value,16)/255).map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4);
  return values[0]*0.2126+values[1]*0.7152+values[2]*0.0722;
}
function contrast(a:string,b:string):number{
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
part("Secondary text exceeds7:1 on the selected flat light palette");
for(const name of ["ink-soft","ink-mute"]){
  for(const background of ["paper","sand","sand-deep","lilac","lilac-deep","sky-soft","mint-soft","amber-soft","danger-soft"]){
    const ratio=contrast(token(name),token(background));
    is(name+" on "+background+" has7.25:1 reserve ("+ratio.toFixed(3)+")",ratio>=7.25,true);
  }
  is(name+" on white exceeds7.25:1",contrast(token(name),"#ffffff")>=7.25,true);
}
const placeholder=css.match(/\.field::placeholder\s*\{([^}]+)\}/)?.[1]??"";
is("placeholder uses readable secondary text",/color:\s*var\(--ink-mute\)/.test(placeholder),true);
is("placeholder is not faded by browser defaults",/opacity:\s*1\s*;/.test(placeholder),true);
part("Shared success copy uses a distinct enhanced-contrast token");
is("success copy exceeds7.25:1 on mint-soft",contrast(token("mint-text"),token("mint-soft"))>=7.25,true);
is("former success text fails the enhanced floor",contrast(token("mint-deep"),token("mint-soft"))<7,true);
is("existing semantic action token is preserved",token("mint-deep"),"#0b6a4d");
for(const name of ["tag-live","notice-success"]){
  const rule=css.match(new RegExp("\\."+name+"\\s*\\{([^}]+)\\}"))?.[1]??"";
  is(name+" keeps its success surface",/background:\s*var\(--mint-soft\)/.test(rule),true);
  is(name+" uses enhanced success text",/color:\s*var\(--mint-text\)/.test(rule),true);
}
done();
