// This alias is used only by restart-activation-ack.test.ts.
// Production falsecoverage and the separate refusal-before-IO test remain intact.
export * from '../lib/contract-funding-rules';
export const CONTRACT_ADMISSION_COVERAGE={checkout:true,planSwitch:true,pauseRestart:true,resourceAllocations:false,renewals:false,settlementAndReserveReconciliation:false} as const;
