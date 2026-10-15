import { ReportDownload, downloadReportFile } from "@/components/report-download";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is, part } from "./check";
async function main(){
 part("Rendering a download never builds the report");
 let calls=0;
 let current="first";
 const generate=()=>{calls++;return "selection,value\r\n"+current+",10\r\n";};
 const render=()=>renderToStaticMarkup(createElement(ReportDownload,{csv:generate,filename:"report.csv"},"Download selected rows"));
 is("download button renders",render().includes("Download selected rows"),true);
 render();
 is("repeated rendering does no CSV work",calls,0);
 is("a failing producer is not run during rendering",renderToStaticMarkup(createElement(ReportDownload,{csv:()=>{throw Error("not requested");},filename:"report.csv"})).includes("<button"),true);
 is("existing string reports still render",renderToStaticMarkup(createElement(ReportDownload,{csv:"a,b\r\n",filename:"legacy.csv"})).includes("<button"),true);
 const documentBefore=Object.getOwnPropertyDescriptor(globalThis,"document");
 const timeoutBefore=Object.getOwnPropertyDescriptor(globalThis,"setTimeout")!;
 const createBefore=Object.getOwnPropertyDescriptor(URL,"createObjectURL")!;
 const revokeBefore=Object.getOwnPropertyDescriptor(URL,"revokeObjectURL")!;
 type Link={href:string;download:string;clicked:boolean;removed:boolean;appended:boolean;click:()=>void;remove:()=>void};
 const links:Link[]=[];const blobs:Blob[]=[];const revoked:string[]=[];const timers:{callback:()=>void;delay:number}[]=[];
 let clickFailure=false,urlFailure=false,appendFailure=false;
 Object.defineProperty(globalThis,"document",{configurable:true,value:{
  createElement:(tag:string)=>{if(tag!=="a")throw Error("Unexpected element");const link:Link={href:"",download:"",clicked:false,removed:false,appended:false,click(){this.clicked=true;if(clickFailure)throw Error("Click failed");},remove(){this.removed=true;}};links.push(link);return link;},
  body:{appendChild:(link:Link)=>{if(appendFailure)throw Error("Append failed");link.appended=true;}},
 }});
 Object.defineProperty(URL,"createObjectURL",{configurable:true,value:(blob:Blob)=>{if(urlFailure)throw Error("URL failed");blobs.push(blob);return "blob:test-"+blobs.length;}});
 Object.defineProperty(URL,"revokeObjectURL",{configurable:true,value:(url:string)=>{revoked.push(url);}});
 Object.defineProperty(globalThis,"setTimeout",{configurable:true,value:(callback:()=>void,delay:number)=>{timers.push({callback,delay});return 1;}});
 const flush=()=>{for(const timer of timers.splice(0))timer.callback();};
 try{
  part("A requested download resolves current content once and cleans up");
  current="second";
  downloadReportFile(generate,"selected.csv");
  is("producer runs once per requested download",calls,1);
  is("current selection exported",await blobs[0].text(),"selection,value\r\nsecond,10\r\n");
  is("UTF-8 CSV content type",blobs[0].type,"text/csv;charset=utf-8");
  is("filename assigned",links[0].download,"selected.csv");
  is("download link uses allocated URL",links[0].href,"blob:test-1");
  is("link appended and clicked",links[0].appended&&links[0].clicked,true);
  is("temporary link removed",links[0].removed,true);
  is("URL stays alive until browser consumes it",revoked.length,0);
  is("URL release delayed",timers[0].delay,1000);
  flush();
  is("URL released after delay",revoked,["blob:test-1"]);
  current="third";downloadReportFile(generate,"next.csv");
  is("each request rebuilds its current snapshot",calls,2);
  is("new request does not reuse stale bytes",await blobs[1].text(),"selection,value\r\nthird,10\r\n");
  flush();
  const legacy="\uFEFFa,b\r\n1,2\r\n";
  downloadReportFile(legacy,"legacy.csv");
  is("existing string bytes preserved",Array.from(new Uint8Array(await blobs[2].arrayBuffer())),Array.from(new TextEncoder().encode(legacy)));
  flush();
  part("Failures propagate without leaving temporary download resources");
  const beforeBlobs=blobs.length,beforeLinks=links.length;
  let failed=false;
  try{downloadReportFile(()=>{throw Error("Generation failed");},"bad.csv");}catch{failed=true;}
  is("generation error reaches UI handler",failed,true);
  is("generation failure creates no resources",[blobs.length,links.length],[beforeBlobs,beforeLinks]);
  clickFailure=true;failed=false;
  try{downloadReportFile(generate,"click.csv");}catch{failed=true;}
  is("click failure reaches UI handler",failed,true);
  is("failed click removes link",links.at(-1)!.removed,true);
  is("failed click schedules URL cleanup",timers.length,1);
  const failedUrl=links.at(-1)!.href;flush();
  is("failed click releases its URL",revoked.at(-1),failedUrl);
  clickFailure=false;appendFailure=true;failed=false;
  try{downloadReportFile("a,b","append.csv");}catch{failed=true;}
  is("append failure reaches handler",failed,true);
  is("append failure removes temporary link",links.at(-1)!.removed,true);
  flush();appendFailure=false;urlFailure=true;failed=false;
  const beforeUrlLinks=links.length;
  try{downloadReportFile(generate,"url.csv");}catch{failed=true;}
  is("URL failure reaches handler",failed,true);
  is("URL failure creates no link",links.length,beforeUrlLinks);
  urlFailure=false;downloadReportFile("retry,ok","retry.csv");
  is("retry remains possible",links.at(-1)!.clicked,true);
  flush();
  is("every allocated URL eventually released",revoked.length,blobs.length);
 }finally{
  Object.defineProperty(URL,"createObjectURL",createBefore);
  Object.defineProperty(URL,"revokeObjectURL",revokeBefore);
  Object.defineProperty(globalThis,"setTimeout",timeoutBefore);
  if(documentBefore)Object.defineProperty(globalThis,"document",documentBefore);
  else Reflect.deleteProperty(globalThis,"document");
 }
 done();
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
