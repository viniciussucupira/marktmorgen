import {KIND,type Item,type Listing} from "@/lib/catalog";
export type PathScriptCatalog={items:readonly Pick<Item,"id"|"kind">[];head:readonly Pick<Listing,"id"|"title"|"hidden">[];inline:readonly Pick<Listing,"id"|"title"|"hidden">[]|null};
import {PATH_SCRIPT_PRODUCTS,PATH_SCRIPT_CANDIDATES,scriptTitle,type ScriptProduct} from "@/lib/path-script-rules";
/** Uses the already-read own-store index and cached listings. No database or provider call. */
export function pathScriptProducts(store:{catalog:PathScriptCatalog}):ScriptProduct[]{
 const own=new Map(store.catalog.items.map(item=>[item.id,item.kind]));
 const found:ScriptProduct[]=[];
 const seen=new Set<string>();
 for(const listing of [...store.catalog.head.slice(0,PATH_SCRIPT_CANDIDATES),...(store.catalog.inline??[]).slice(0,PATH_SCRIPT_CANDIDATES)]){
  const kind=own.get(listing.id);
  if(kind===undefined||(kind&KIND.hidden)!==0||listing.hidden||seen.has(listing.id)||!/^[A-Za-z0-9_-]{1,64}$/.test(listing.id))continue;
  seen.add(listing.id);
  const title=scriptTitle(listing.title);
  if(title)found.push({id:listing.id,title});
  if(found.length===PATH_SCRIPT_PRODUCTS)break;
 }
 return found;
}
