import {CONTRACT_KEYS,CONTRACT_FUNDING_RULES,canonicalFinancialSnapshot,type ContractKey} from "@/lib/contract-funding-rules";
import {PUBLISHED_PLAN_PRICES} from "@/lib/plan";
import {protocolInfrastructureMicroUsd,type ProtocolInfrastructureBounds} from "@/lib/spend-cost-table";

export type ContractProtocolInfrastructureCosts = Record<ContractKey,{
 contractKey:ContractKey;
 paidMonths:number;
 publishedPriceCents:number;
 infrastructure:{baseMicroUsd:number;providerAllowanceMicroUsd:number;totalMicroUsd:number};
 infrastructureCents:number;
}>;

/** All six plan/cycle profiles must be supplied as own finite data. Each
 * profile covers its whole proposed obligation, including its liability tail.
 * Annual profiles are never inferred by averaging or multiplying a monthly
 * profile; their explicit operations and retention are priced independently.
 * paidMonths is contract metadata, not verification of the supplied horizon.
 * This is an infrastructure comparison, not total cost, funded cash, a margin
 * assessment, an approved retention policy or permission to operate.
 */
export function contractProtocolInfrastructureCosts(input:unknown):ContractProtocolInfrastructureCosts|null {
 const encoded=canonicalFinancialSnapshot(input);
 if(!encoded)return null;
 const profiles=JSON.parse(encoded) as Record<string,unknown>|null;
 if(!profiles||typeof profiles!=="object"||Array.isArray(profiles)||
    Object.keys(profiles).length!==CONTRACT_KEYS.length||
    Object.keys(profiles).some(key=>!CONTRACT_KEYS.includes(key as ContractKey)))return null;
 const result={} as ContractProtocolInfrastructureCosts;
 for(const key of CONTRACT_KEYS){
  if(!Object.hasOwn(profiles,key))return null;
  const cost=protocolInfrastructureMicroUsd(profiles[key] as ProtocolInfrastructureBounds);
  if(!cost)return null;
  const [tier,cycle]=key.split("_") as ["creator"|"pro"|"scale","month"|"year"];
  result[key]={
   contractKey:key,
   paidMonths:CONTRACT_FUNDING_RULES.paidMonths[cycle],
   publishedPriceCents:PUBLISHED_PLAN_PRICES[tier][cycle],
   infrastructure:cost,
   infrastructureCents:Number((BigInt(cost.totalMicroUsd)+BigInt(9_999))/BigInt(10_000)),
  };
 }
 return result;
}
