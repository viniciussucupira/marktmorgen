export * from '../lib/commercial-margin';
import type {CommercialMarginReview} from '../lib/commercial-margin';
export let CURRENT_COMMERCIAL_MARGIN_REVIEW:CommercialMarginReview|null=null;
export const setContractFinancialReview=(review:CommercialMarginReview|null)=>{CURRENT_COMMERCIAL_MARGIN_REVIEW=review;};
