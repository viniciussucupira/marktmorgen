import { listSubscriptions } from "@/lib/billing";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY="sk_test_subscription_page_only";
let payload:unknown={data:[],has_more:false};
const requests:{method:string;url:URL}[]=[];
globalThis.fetch=(async(input:string|URL|Request,init?:RequestInit)=>{
  const url=new URL(String(input));
  requests.push({method:init?.method??"GET",url});
  if(url.origin!=="https://api.stripe.com"||url.pathname!=="/v1/subscriptions"||(init?.method??"GET")!=="GET")
    throw new Error("unexpected synthetic subscription-list operation");
  return Response.json(payload);
}) as typeof fetch;

async function main(){
  part("Unknown subscription pages cannot become empty or complete accounts");
  const row={id:"sub_PageObservation01",status:"active"};
  const invalid:unknown[]=[
    null,[],{}, {data:null,has_more:false},{data:{},has_more:false},
    {data:[]},{data:[],has_more:null},{data:[],has_more:"false"},
    {data:[],has_more:true},{data:[null],has_more:false},
    {data:[{}],has_more:false},{data:[{id:"not_a_subscription"}],has_more:false},
    {data:[row,row],has_more:false},
    {data:[{id:"sub_MissingStatus01"}],has_more:false},
    {data:[row,{id:"sub_NullStatus01",status:null}],has_more:false},
    {data:[{id:"sub_UnknownStatus01",status:"future_unknown"}],has_more:false},
    {data:Array.from({length:101},(_,i)=>({id:`sub_OverLimit${String(i).padStart(6,"0")}`})),has_more:false},
  ];
  for(const value of invalid){
    payload=value;requests.length=0;
    let refused=false;
    try{await listSubscriptions("all");}catch{refused=true;}
    is("an ambiguous or unbounded page is refused, not an empty result",refused,true);
    is("no fallback, pagination or mutation is attempted",requests.map(r=>r.method),["GET"]);
    is("the requested page remains bounded",requests[0].url.searchParams.get("limit"),"100");
  }
  part("Explicit empty and valid paginated observations remain available");
  payload={data:[],has_more:false};requests.length=0;
  is("an explicit empty final page is preserved",await listSubscriptions("all"),{data:[],hasMore:false});
  payload={data:[row],has_more:true};requests.length=0;
  is("a valid nonfinal page preserves its rows and cursor obligation",await listSubscriptions("active","sub_PreviousPage01"),{data:[row],hasMore:true});
  is("the existing status and cursor are sent",[
    requests[0].url.searchParams.get("status"),requests[0].url.searchParams.get("starting_after"),
  ],["active","sub_PreviousPage01"]);
  payload={data:[row],has_more:false};
  is("a valid final page is preserved",await listSubscriptions("all"),{data:[row],hasMore:false});
  done();
}
main();
