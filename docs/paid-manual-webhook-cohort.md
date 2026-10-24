# Funded manually requested webhook tests

AB(a), 24 October 2026. A new manual webhook test for a marked funded period requires the paid resource cohort after endpoint ownership and the existing ten-per-minute rate guard, before webhook allowance, payload construction, dispatch or delivery-log persistence. Missing financial approval returns unavailable; the owner route maps it to 503 with a retry message. Existing unmarked behavior and published limits remain unchanged.

This is a partial resource component. Automatic first deliveries, retained queued deliveries and their retries still need a bounded retained-obligation design; this change makes no claim to fund or settle those obligations. Endpoint management remains unchanged, including removal. A broad attempt guard would miss manual tests because their attempt already has its allowance taken, and could incorrectly block retained obligations.

The existing synthetic local HTTP test exercises actual sendTest with a persisted funded Store, valid statistics ID and owned endpoint. It asserts unavailable, no HTTP request, no allowance change and no delivery log, and confirms endpoint removal remains accessible. Existing ownership, HMAC, SSRF, rate limit, retries and quota tests remain intact. No real endpoint receives a message.

## Incremental cost envelope before operation

Each admitted observation adds one EVAL: 18 Redis commands on first cohort acknowledgement, 17 for an identical retry. JSON request maximum is 12,288 bytes; this excludes protocol, responses, CPU, transfer and retained storage. The existing permanent cohort field is shared, with no extra key, TTL or release.

Conditional primary-only/no-replica PAYG scenario at USD0.20 per100,000 commands, using all webhook rights (300/1,000/3,000) as observations: Creator USD0.0108 monthly and0.1296 per12 worst months; Pro USD0.036 and0.432; Scale USD0.108 and1.296. These amounts apply separately to both monthly and annual plan intervals; prices69/690,449/4490,999/9990 remain unchanged. Manual tests share webhook rights, but these successful rights do not cap refused attempts, repeated requests, rate-key churn, abuse, queued retries or company-wide costs. Multiple guards on a path must be added together even when their field is shared.

The actual provider price/topology, highest price paid, CPU, transfer, retention, attempt/global ceilings and reserved cash remain unverified and must fail closed. All LLC fixed costs are attributed entirely to Marktmorgen and the most onerous tax reading remains binding. No 60% margin is certified; actual reviews remain null, three coverage flags false and sales closed. No new provider, account, payment, authority submission or real notification is authorized by this component. Full24 checks on the new head plus exact merged tree/parents, production READY, domain and version are required before counting a functional delivery.
