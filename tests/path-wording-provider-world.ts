import {store as ordinary,redisPipeline as ordinaryPipeline} from "./redis-stub";
import {redisPipeline as moneyPipeline,reset as resetMoney,ledger,opened,calls as monetaryCalls} from "./ai-spend-redis";
export {ordinary,ledger,opened,monetaryCalls};
export const isRedisConfigured=()=>true;
export function reset(){ordinary.clear();resetMoney();}
export async function redisPipeline(commands:(string|number)[][]):Promise<unknown[]>{
 if(commands[0]?.[0]==="EVAL"&&String(commands[0]?.[1]).includes("local function amount"))return moneyPipeline(commands);
 return ordinaryPipeline(commands);
}
