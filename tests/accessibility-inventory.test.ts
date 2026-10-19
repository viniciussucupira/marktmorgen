import { readdirSync,readFileSync } from "node:fs";
import { join } from "node:path";
import { done,is,part } from "./check";
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
done();
