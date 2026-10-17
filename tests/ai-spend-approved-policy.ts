export * from '../lib/ai-spend-policy';
export const CURRENT_AI_SPEND_POLICY = {reviewId:'test_review',month:new Date().toISOString().slice(0,7),evidence:'Test fixture only',requestMicroUsd:{'claude-sonnet-5-5':100,'claude-haiku-5-5':20},storeMicroUsd:{creator:300,pro:500,scale:1000,trial:0,setup:0,ended:0},companyMicroUsd:400,fundedStores:{creator:1,pro:0,scale:0,trial:0,setup:0,ended:0}};
