import ts from "typescript";
export type BritishCopyHit={path:string;line:number;word:string;text:string};
const BRITISH=/\b(?:colour(?:s|ed|ing|ful)?|centres?|centred|centring|organise[ds]?|organising|organisation(?:s|al)?|licence[sd]?|cancelled|cancelling|behaviours?|behavioural|afterwards|untick(?:ed|ing|s)?|tick(?:ed|ing|s)?|catalogues?|grey|fulfil(?:s|ment)?|enrol(?:s|ment)?|labelled|labelling|travelling|modelling)\b/gi;
const UI_ATTRIBUTE=new Set(["alt","title","placeholder","aria-label","aria-description"]);
const UI_PROPERTY=new Set(["label","title","description","hint","body","message","error","notice","subject","why","note","answer","question","text","help","empty","heading","caption","intro","detail","summary"]);
const FOREIGN=new Set(["es","fr","de","it","nl","pt"]);
function nameOf(node:ts.Node|undefined):string{
 if(!node)return "";
 return ts.isIdentifier(node)||ts.isStringLiteral(node)?node.text:"";
}
function stringContainer(node:ts.Node):ts.Node{
 let current=node;
 while(current.parent&&(ts.isTemplateSpan(current.parent)||ts.isTemplateExpression(current.parent)))current=current.parent;
 return current;
}
function testLabel(node:ts.Node):boolean{
 const current=stringContainer(node),parent=current.parent;
 if(!parent||!ts.isCallExpression(parent)||parent.arguments[0]!==current)return false;
 const callee=parent.expression;
 const name=ts.isIdentifier(callee)?callee.text:ts.isPropertyAccessExpression(callee)?callee.name.text:"";
 return ["test","it","describe","part","is"].includes(name);
}
/** Read source syntax only: never evaluate product code or rewrite user data. */
export function britishCopyHits(path:string,source:string):BritishCopyHit[]{
 const file=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,/\.tsx$/.test(path)?ts.ScriptKind.TSX:/\.mjs$/.test(path)?ts.ScriptKind.JS:ts.ScriptKind.TS);
 const hits:BritishCopyHit[]=[];
 const isTest=path.startsWith("tests/");
 const foreignFile=/^lib\/buyer-words\/(?:de|es|fr|it|nl|pt)\.ts$/.test(path);
 if(foreignFile)return hits;
 function visit(node:ts.Node){
  const literal=ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)||ts.isTemplateHead(node)||ts.isTemplateMiddle(node)||ts.isTemplateTail(node)||ts.isJsxText(node);
  if(literal){
   const text=node.text.trim(),parent=node.parent;
   let omit=false,attribute:string|undefined,uiContext=false;
   if(parent&&((ts.isImportDeclaration(parent)||ts.isExportDeclaration(parent))||ts.isLiteralTypeNode(parent)))omit=true;
   if(parent&&(ts.isPropertyAssignment(parent)||ts.isPropertySignature(parent))&&parent.name===node)omit=true;
   for(let ancestor:ts.Node|undefined=parent;ancestor&&!ts.isSourceFile(ancestor);ancestor=ancestor.parent){
    if(ts.isJsxAttribute(ancestor)){attribute=ancestor.name.getText(file);break;}
    if(ts.isVariableDeclaration(ancestor)){
     const name=nameOf(ancestor.name);if(path.startsWith("lib/buyer-words/")&&FOREIGN.has(name)){omit=true;break;}if(/class(?:Name|Names|es)?$/i.test(name))omit=true;
     if(UI_PROPERTY.has(name.toLowerCase())||/(?:label|title|message|heading|caption|text)$/i.test(name))uiContext=true;
    }
    if(ts.isFunctionDeclaration(ancestor)&&UI_PROPERTY.has(nameOf(ancestor.name).toLowerCase()))uiContext=true;
    if(ts.isCallExpression(ancestor)&&["clsx","cx","classNames","cn","twMerge"].includes(nameOf(ancestor.expression)))omit=true;
    if(path.startsWith("lib/buyer-words/")&&ts.isPropertyAssignment(ancestor)&&FOREIGN.has(nameOf(ancestor.name))){omit=true;break;}
   }
   if(attribute!==undefined&&!UI_ATTRIBUTE.has(attribute))omit=true;
   if(isTest&&!testLabel(node))omit=true;
   const property=parent&&ts.isPropertyAssignment(parent)&&parent.initializer===node?nameOf(parent.name):"";
   const jsxChild=parent&&ts.isJsxExpression(parent)&&parent.parent&&(ts.isJsxElement(parent.parent)||ts.isJsxFragment(parent.parent));
   const prose=ts.isJsxText(node)||Boolean(jsxChild)||attribute!==undefined||UI_PROPERTY.has(property)||uiContext||(isTest&&testLabel(node))||/\s/.test(text)||/^[A-Z][a-z]+$/.test(text);
   if(!omit&&prose&&text){
    for(const match of text.matchAll(BRITISH)){
     hits.push({path,line:file.getLineAndCharacterOfPosition(node.getStart(file)).line+1,word:match[0],text:text.slice(0,300)});
    }
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(file);
 return hits;
}
