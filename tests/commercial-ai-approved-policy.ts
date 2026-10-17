import type { AiSpendPolicy } from '../lib/ai-spend-policy';
export * from '../lib/ai-spend-policy';
/** Synthetic ceilings only; not provider pricing, funding or tax evidence. */
export const CURRENT_AI_SPEND_POLICY: AiSpendPolicy = {
  reviewId:'synthetic_commercial_ai',month:new Date().toISOString().slice(0,7),
  evidence:'TEST ONLY: synthetic commercial gate fixture, not actual funding',
  requestMicroUsd:{'claude-sonnet-5-5':1,'claude-haiku-5-5':1},
  storeMicroUsd:{creator:10000,pro:10000,scale:10000,trial:0,setup:0,ended:0},
  fundedStores:{creator:10000,pro:10000,scale:10000,trial:0,setup:0,ended:0},
  companyMicroUsd:300000000,
};
