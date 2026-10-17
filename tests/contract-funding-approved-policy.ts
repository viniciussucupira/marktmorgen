export * from '../lib/contract-funding-rules';
import type {ContractFundingPolicy} from '../lib/contract-funding-rules';
export let CURRENT_CONTRACT_FUNDING_POLICY:ContractFundingPolicy|null=null;
export const setContractFundingPolicy=(policy:ContractFundingPolicy|null)=>{CURRENT_CONTRACT_FUNDING_POLICY=policy;};
