export * from '../lib/commercial-margin';
import {fixture} from './exposure-budget-fixture';
// Only dispatch binding is exercised here, never commercial release approval.
export const CURRENT_PRICE_AND_RIGHTS_SNAPSHOT=fixture.context.termsSnapshot;
export const CURRENT_COMMERCIAL_MARGIN_REVIEW={fundedExposure:fixture.context.review};
