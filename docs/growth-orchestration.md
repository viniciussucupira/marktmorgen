# Growth orchestration: first implementation

This increment connects existing product capabilities. It does not claim that every feature from the ClickFunnels benchmark has been implemented.

## Delivered

- /studio/growth: four goal-based plans using existing products, pages, funnels, forms, email, buyers and reports. Links respect the current role and carry the selected store.
- CRM: optional next action, UTC calendar date and responsible teammate. Existing deal records remain readable. Overdue, today, upcoming and unplanned filters exclude won/lost deals. No messages or payments are triggered.
- Assignment validates the owner or current teammates with orders permission. A former assignee does not prevent an existing opportunity from moving stages.
- Funnel review: unavailable configured steps, insufficient traffic and inconsistent estimated counts. Numerical observations are descriptive and never infer causes, revenue uplift or statistical significance. Rates are unavailable for missing, negative, infinite or impossible estimates. Independent counts never claim that the same visitors moved from the first step to the last.
- The CRM initializes records using the selected store reference, including secondary stores.
- Date fields reject normalized overflow dates such as February 30.
- Product checks run lint, the existing behavior suite and a production build on pull requests and main. Actions are pinned; the job uses read-only repository permission and no production secrets.

## Saved paid-offer checks

The funnel editor and growth workspace now reuse canSell, canSellProduct, paypalReady, canGiveProduct and bundleReady. They flag unavailable store payments, offers without configured delivery, free sign-ups that fail the public eligibility rule, and bundles without enough eligible items. PayPal-only offers are accepted when the public product page would accept them. The check reads only the selected store and never creates payment sessions, sends email, fetches external links or changes products. Failed reads are explicitly unknown.

This is a configuration review, not a live checkout or delivery test. Actual sign-up/email delivery, stock and license availability, provider health, external link health, and actual file access remain manual release checks.

## Verification

The new regression file covers date validation, queue membership, descriptive funnel observations, role-filtered plans, route validation, cross-site rejection, pinned-store isolation, multi-store writes and teammate eligibility. Existing CRM and page-funnel regressions must pass too.

Calendar dates currently use an explicitly labelled UTC day. Store-local timezone preferences remain a follow-up requirement.

## Remaining product work

Audit the existing implementations of every benchmark item before replacing them. Next priorities are a full journey preflight that validates delivery and payment capabilities, versioned workflows and publication, contextual AI creation of complete operations, controlled experiments, and validated predictive models. This change supplies practical guidance and descriptive review; it does not introduce autonomous optimization or predict revenue/churn.

Before production release: require successful CI, validate authenticated desktop/mobile flows, and verify that role-based visibility matches the current permissions table. No deployment settings, prices, payment destinations or campaign opt-ins are changed by this increment.
