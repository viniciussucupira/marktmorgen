export const isAiBudgetConfigured=()=>true;
export const aiBudgetScopeFor=()=> 'trial' as const;
export let spendCalls=0;
export const resetSpend=()=>{spendCalls=0;};
export const reserveAiSpend=async()=>{spendCalls++;return true;};
