# Full liability horizon after delayed activation

AB(a),24October2026. A funding review must now cover the last permitted admission PLUS its maximum activation delay PLUS the complete reviewed paid/trial/pause/refund/closing tail. Previously contractFundingConfiguration checked safe arithmetic including activationDelayDays but compared liabilitiesThrough against a boundary excluding that delay. A grant admitted at the final allowed instant could therefore activate later with less than its full reviewed tail inside the policy horizon.

The monetary quote already includes activationDelayDays in its company allocation; this change preserves that arithmetic, paid rights and prices. The horizon rule is added to CONTRACT_FUNDING_RULES so the immutable configuration binding records the stronger requirement. An existing mismatched ledger is refused, never initialized/reset/migrated/released. Policy archival and retained cleanup still need separate mechanisms; this is not a lifecycle completion or financial certification.

Synthetic tests isolate monthly and annual grant sets, reject the old boundary and one millisecond short of the new boundary, accept the exact new boundary, and retain the full paid/pause/tail coverage. Existing cash quotes/concurrency/activation/resource tests must pass in the full exact-head CI.

## Cost before operation

Store69/690,Studio449/4490,Scale999/9990 USD monthly/annual prices unchanged. For each plan and interval, this patch adds no provider/Redis command, key, TTL, request or persisted receipt field per admission. The existing policy/review binding remains the same-size hash. It adds local arithmetic/comparison and a constant binding description, so CPU/build/provider invoices are not certified zero.

No reserve or liability ceiling is reduced. The additional permitted activation day must be inside the genuine dated liability evidence; unknown cost/tax/retention means rejection. Existing grant quotes already charge the delay in company allocation; this patch does not invent an economic saving. Actual reserve/review evidence remains absent, real policy null, all three lifecycle coverage flags false, sales closed.100%LLCfixed costs, greatest actually charged price, full simultaneous usage and most onerous taxes includingBrazil remain binding; no60%certification.
