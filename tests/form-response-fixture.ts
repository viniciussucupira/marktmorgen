import { parseForm, type FormResponse } from "@/lib/forms";
export const form = parseForm({id:"form000001",name:"Applications",fields:[
  {id:"name00",type:"short",label:"Name",required:true},
  {id:"email0",type:"email",label:"Email"},
  {id:"choice",type:"choice",label:"Focus",options:[{id:"coach0",label:"Coaching"},{id:"write0",label:"Writing"}]}
],outcomes:[{id:"ready0",title:"Pronto",body:"Ready"},{id:"later0",title:"Depois",body:"Later"}]})!;
export type Row = FormResponse & {opportunityRef:string};
export const responses:Row[] = [
  {id:"a".repeat(32),at:1760000000,page:"site-page000001",answers:{name00:"José",email0:"JOSE@example.com",choice:"coach0"},outcome:"ready0",joined:false,opportunityRef:"a".repeat(64)},
  {id:"b".repeat(32),at:1759999900,page:"site-page000001",answers:{name00:"Ana",email0:"ana@example.com",choice:"write0"},outcome:"later0",joined:false,opportunityRef:"b".repeat(64)},
  {id:"c".repeat(32),at:1759999800,page:"site-page000001",answers:{name00:"Lee",email0:"lee@example.com"},outcome:"removed",joined:false,opportunityRef:"c".repeat(64)},
  {id:"d".repeat(32),at:1759999700,page:"site-page000001",answers:{name00:"Sam",email0:"sam@example.com"},outcome:"",joined:false,opportunityRef:"d".repeat(64)}
];
