import {zeroExposureFixture} from './margin-test-fixtures';
import type {ExposureBudgetPolicy,ExposureFundingContext} from '@/lib/exposure-budget-policy';
export function exposureFixture(){const review=zeroExposureFixture();review.cases.trial.maximumMonthlyCases=2;review.cases.trial.worstCase!.costCeilings.ai=100;review.monthlyBudgetCents=200;const context:ExposureFundingContext={termsSnapshot:'TEST_ONLY_TERMS',review};const policy:ExposureBudgetPolicy={reviewId:'exposure_test',termsSnapshot:context.termsSnapshot,review,reservedFundsCents:200,reserveEvidence:'TEST ONLY: hypothetical reserve, not an actual bank balance'};return {context,policy};}
export const fixture=exposureFixture();
