// Synthetic boundaries for the actual publisher ACK tests; no production coverage is enabled.
export const CURRENT_CONTRACT_FUNDING_POLICY=null;
export const CURRENT_COMMERCIAL_MARGIN_REVIEW=null;
export const CURRENT_PRICE_AND_RIGHTS_SNAPSHOT="synthetic-only";
export const ENDED_INDEX="synthetic:ended",PAYING_INDEX="synthetic:paying",SHARING_INDEX="synthetic:sharing";
export const FINISH=1_900_000_000;
const intent={grant:{id:"ctr_SyntheticRestart",key:"creator_month",statsId:"synthetic",sourceSubscriptionId:"sub_SyntheticSource"},ref:"creator@example.invalid",handle:"synthetic",claim:"claim_Synthetic",paused:JSON.stringify({customer:"cus_Synthetic"}),source:{annual:1}};
const prepared={input:{armed:{intent},subscriptionId:"sub_SyntheticNew",createdSeconds:1,periodStartSeconds:2,periodEndSeconds:FINISH,renews:true,shared:false},policy:null,context:{},binding:"synthetic-binding",startedAt:0,keys:["a","b","c","d"],args:["policy","review",JSON.stringify({sourceGrant:"ctr_SyntheticSource"})]};
export const calls:unknown[][]=[];
const retained=Object.freeze({source:"retained",reserved:100,paused:"retained",due:1,annual:1});
export function evidence(){return {...retained};}
let responses:unknown[]=[];
export function reset(next:unknown[]){responses=next.slice();calls.length=0;}
export function prepareRestartActivation(){return prepared;}
export async function withRestartPublicationRecord<T>(_ref:unknown,_goal:unknown,run:(record:{store:{sid:string};held:{key:string;token:string};owner:string;expected:string;next:string})=>Promise<T>):Promise<T>{
 return run({store:{sid:"synthetic"},held:{key:"synthetic:lock",token:"synthetic"},owner:"synthetic:owner",expected:"source",next:"published"});
}
export async function redisPipeline(commands:unknown[][]):Promise<unknown>{
 calls.push(...commands);
 if(responses.length===0)throw Error("Unexpected extra Redis operation");
 return responses.shift();
}
