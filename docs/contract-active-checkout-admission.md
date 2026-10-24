# A funded active contract cannot open another Checkout

Opening-block AB(a) remains in progress. Activation clears the original pending lock while retaining active:<store> and its immutable receipt. The new-enrollment cash reservation previously checked only pending/nonce/cash/slots; a second Checkout could therefore reserve another obligation after activation if another caller missed the paying subscription.

The production Lua now rejects checkout admission whenever an active binding already exists, atomically before changing any field. It validates the explicit action and its receipt prefix together, so a checkout receipt cannot label itself as a switch to bypass that guard. The existing separate switch action can reserve its full additional liability while retaining the active binding and original receipt; it still has its own unfinished activation/renewal/reconciliation lifecycle. No reserve, slot, active marker or legal right is released on rejection. Deleting or replacing active records is not added.

The rule is included in CONTRACT_FUNDING_RULES and its financial/terms binding; a stale policy cannot approve a changed admission protocol. All actual financial policies remain null and sales stay closed. The three incomplete coverage flags stay false.

## Cost and verification boundary

The successful checkout reservation adds one HEXISTS against the existing hash. Its conservative command-work bound is15 including EVAL; switch reservation skips that extra read. Existing first-activation bound14 is unchanged. CI INFO commandstats must measure15 for a successful checkout reservation, including internal Lua commands; it must not count only the outer EVAL. This is an assertion awaiting full new-head CI, not a claimed observation.

Total incremental monthly and annual cost for each Store/Studio/Scale and both intervals is unknown and rejected until enforced monthly caller budgets, actual supplier replication, CPU, transfer and retention are proved. A per-command component alone does not establish a complete worst month. Actual null policy refuses before Redis; no new real supplier operation is authorized and no cost ceiling, price, printed limit or margin assumption is reduced. There is no new key or persistent field.

Synthetic unit tests submit64 new checkout nonces after one activation and require every attempt to refuse without changing any field. A separately funded switch retains both receipts and all principal. Existing disposable loopback Redis CI repeats the actual Lua refusal, action/receipt mismatch rejection, unchanged fields, successful separate switch and command measurement. Existing activation concurrency and custody tests remain. Full new-head CI is required before incorporation.

This does not finish resource admission, current-term authorization, renewal, pause, legacy migration or settlementAndReserveReconciliation. No real60% margin is certified.
