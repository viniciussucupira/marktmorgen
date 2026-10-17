# Provisional list-email capacity and reservation confirmation

Studio has 5,000 list-email attempts per UTC calendar month and Scale 10,000; Store retains no list-email entitlement. The free-trial ceiling remains 1,000, subject to the separate funded acquisition review. Campaigns, sequences and the other existing list-mail callers read the same monthlyAllowance function. All locked prices, commissions and annual discounts remain unchanged.

The initial engineering allocation for this resource is 4% of annual subscription revenue recognized monthly. At Resend's public $0.90 per full 1,000-email overage bucket, 5,000 attempts cost $4.50 and 10,000 $9.00 in variable sending charges. These amounts exclude the paid sender subscription, tax, domains, inbound email, other messages, compute, retries outside this path, and any different account contract. Free-tier capacity is not assumed. SES may cost differently, but its availability is not used to justify an optimistic bound.

Sources checked 2026-10-16:
- https://resend.com/pricing
- https://resend.com/changelog/pay-as-you-go-pricing

## Confirmation before dispatch

The monthly reservation now rejects noninteger, negative and excessive counts before provider/ledger work. Both monthly and daily counter responses and both expiry acknowledgements must be present and valid. Missing, corrupt, partial or ambiguous responses return unavailable; the send loop waits for retry without dispatching. An ambiguous acknowledgement can still have consumed capacity, so the request does not refund it.

After a provider dispatch returns a retry/refusal outcome, this path retains the attempted capacity: a lost response does not prove that no message was accepted or charged. Only portions filtered out before dispatch are returned. Provider retries consume additional monthly capacity. This rule is disclosed to users.

## Remaining exposure

This is not a complete persistent company-spend ledger. Counter loss, transactional messages outside this list path, supplier metadata freshness, account-wide concurrency, other release callers, fixed provider fees and higher real tariffs still require review. The global sender reader and other sending paths have separate historical fallbacks. No all-tax 60% margin or real funded acquisition policy is certified here.
