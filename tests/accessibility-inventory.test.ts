import { readdirSync,readFileSync } from "node:fs";
import { join } from "node:path";
import { done,is,part } from "./check";
import { generateInventory, routeOfPage } from "../scripts/accessibility-route-inventory.mjs";
const root=process.cwd();
const inventory=JSON.parse(readFileSync(join(root,"docs/accessibility-inventory.json"),"utf8")) as {
 pageTemplates:{source:string}[];layoutTemplates:{source:string}[];boundaryTemplates:{source:string}[];componentSources:string[];apiRouteSources:string[];
};
function walk(folder:string):string[]{
 return readdirSync(join(root,folder),{withFileTypes:true}).flatMap(entry=>{
  const path=folder+"/"+entry.name;
  return entry.isDirectory()?walk(path):[path];
 });
}
const app=walk("app"),components=walk("components");
part("Every source stays visible in the accessibility inventory; inventory is not a pass");
is("all page templates mapped",inventory.pageTemplates.map(row=>row.source).sort(),app.filter(path=>path.endsWith("/page.tsx")).sort());
is("all layout templates mapped",inventory.layoutTemplates.map(row=>row.source).sort(),app.filter(path=>path.endsWith("/layout.tsx")).sort());
is("all error/loading/not-found boundaries mapped",inventory.boundaryTemplates.map(row=>row.source).sort(),app.filter(path=>/(?:error|not-found|loading)\.tsx$/.test(path)).sort());
is("all shared TSX components mapped",[...inventory.componentSources].sort(),components.filter(path=>path.endsWith(".tsx")).sort());
is("all API route sources mapped",[...inventory.apiRouteSources].sort(),app.filter(path=>path.startsWith("app/api/")&&path.endsWith("/route.ts")).sort());
part("Generated route templates retain gaps instead of claiming fixture coverage");
is("generator keeps the checked inventory current",JSON.stringify(generateInventory(root,inventory),null,2)+"\n",readFileSync(join(root,"docs/accessibility-inventory.json"),"utf8"));
is("home route",routeOfPage("app/page.tsx"),{routeTemplate:"/",parameters:[]});
is("dynamic course route",routeOfPage("app/[handle]/course/[product]/[lesson]/page.tsx"),{routeTemplate:"/[handle]/course/[product]/[lesson]",parameters:[{name:"handle",kind:"segment"},{name:"product",kind:"segment"},{name:"lesson",kind:"segment"}]});
is("groups and parallel slots are not URL segments",routeOfPage("app/(public)/@modal/help/page.tsx"),{routeTemplate:"/help",parameters:[]});
is("catch-all route",routeOfPage("app/help/[...parts]/page.tsx"),{routeTemplate:"/help/[...parts]",parameters:[{name:"parts",kind:"catch-all"}]});
is("optional catch-all route",routeOfPage("app/help/[[...parts]]/page.tsx"),{routeTemplate:"/help/[[...parts]]",parameters:[{name:"parts",kind:"optional-catch-all"}]});
for(const source of ["app/api/x/route.ts","elsewhere/page.tsx","app/(.)photo/page.tsx","app/[[broken]/page.tsx"]){
 let refused=false;try{routeOfPage(source);}catch{refused=true;}
 is("ambiguous or non-page source is refused "+source,refused,true);
}
is("source generator never certifies untested pages",generateInventory(root,{...inventory,pageTemplates:[]}).pageTemplates.every((row:{status:string})=>row.status==="AAA review not completed"),true);
done();
