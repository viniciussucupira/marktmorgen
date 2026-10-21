# Microsoft Teams paid-call integration — preparation, disabled

Checked 21 October 2026. Item203 is not complete. No account, application registration, consent, provider request, payment or submission has occurred. No public page offers Teams. TEAMS_APPROVED remains false; there is no environment or reviewer override.

## Reuse and implemented boundary

The existing Google/Zoom connection, encrypted record, booking, cancellation and calendar flow must be reused. Their persisted identifiers stay unchanged. lib/microsoft-teams-policy.ts adds pure capability validation, store/connection ownership checks for persisted Graph event IDs, UTC payload validation and a stable transactionId. Unit tests cover personal-account refusal, missing calendar capability, cross-store/connection refusal, opaque path encoding, invalid timing and retries without attendee invitations. These helpers are preparation; they are not a connected provider, OAuth implementation or completed end-to-end booking flow.

A future adapter must use Graph v1.0 /me/calendar and /me/events only. Require an organizational account and allowedOnlineMeetingProviders containing teamsForBusiness; never infer entitlement from an address or plan name. Unsupported/personal accounts retain the existing Google option. Do not request tenant-wide application calendar access, group calendars, onlineMeetings permissions, directory administration or consent-grant deletion just to disconnect.

## Remaining implementation gates

- Authorization code with state, PKCE S256 and verified issuer/audience/nonce/expiry, organizational tenant restrictions and exact callback; least delegated calendar scope plus required identity/offline scopes. Exact final scopes must be checked against the completed adapter.
- Encrypt credentials through the existing mechanism. Refresh under the existing lock; invalidate stale pending operations when disconnecting. Delete local credentials immediately. Explain separately how the user revokes consent in Microsoft; local deletion is not instant provider-wide token revocation.
- Confirm capability before creating a calendar event. Persist retry identity before a request; persist returned event ID and connection/store ownership before any move/delete. Never accept an arbitrary browser event ID as authorization.
- Reuse existing booking time-zone arithmetic, transaction/lock ownership and refund/move behavior. Fixed allowlisted Microsoft hosts, no redirects, bounded response/request time and integration allowances for every initial call/retry/refresh.
- Test the full OAuth/create/move/cancel/disconnect/refusal flow against local fake Microsoft services only. Keep attendees empty in synthetic tests; send no external invite or message.
- Preserve Google/Zoom identifiers and all buyer languages. No Teams UI or public claim while off.

## Costs and launch refusal

Microsoft says Teams APIs stopped being metered on25August2025. That does not establish zero license, infrastructure, storage, retry, email, currency, tax or support cost. The licensed organizational creator must supply the necessary Microsoft entitlement; platform eligibility and any platform-paid license remain unapproved/unknown.

For each Store/Studio/Scale month and annual equivalent, calculate:
incremental worst-month cost = bounded event operations × highest verified request cost + bounded refresh/retries + encrypted-record reads/writes/storage + delivery cost + tax/FX/payment exposure + priced reserve.
Annual prepaid revenue must be allocated across twelve months; all rights must be used in the worst month. Fit within existing integration/request/storage/email ceilings or refuse before the cost. No visible limit, price or commission changes here.

| Plan | Monthly price | Annual price | Incremental monthly/annual cost | Result |
| --- | ---: | ---: | --- | --- |
| Store |69USD|690USD|Unknown until adapter bounds and highest prices are priced|Fail closed |
| Studio |449USD|4490USD|Unknown until adapter bounds and highest prices are priced|Fail closed |
| Scale |999USD|9990USD|Unknown until adapter bounds and highest prices are priced|Fail closed |

The most expensive Brazil/US tax interpretation remains binding. At least60% net per isolated client at100% entitlement use and consolidated is mandatory; current unfavorable tax reading remains a launch failure. Unknown never equals zero. No certified margin or earnings promise. No operation or feature activation is approved by this document.

## Owner-only prerequisites

The owner handles the LLC/legal identity, Entra work/school tenant and app registration, verified custom/publisher domain, organizational CPP/PGA PartnerID verification, required administrator roles/MFA and acceptance of any terms. Publisher verification is identity verification, not an application security certificate or automatic tenant consent. The owner must configure the exact callback, consent and credentials only after the complete code, fake tests, costs and commercial/tax review are ready. No account/terms/submission is performed by the agent.

## Official references

All checked21October2026; recheck before implementation or activation:
- https://learn.microsoft.com/en-us/graph/outlook-calendar-online-meetings — default calendar capability and Teams online events.
- https://learn.microsoft.com/en-us/graph/api/calendar-post-events?view=graph-rest-1.0 — event creation and delegated permissions.
- https://learn.microsoft.com/en-us/graph/metered-api-list — metering change; no assumption of free total operation.
- https://learn.microsoft.com/en-us/entra/identity-platform/publisher-verification-overview — organizational verification prerequisites.
- https://learn.microsoft.com/graph/api/oauth2permissiongrant-delete?view=graph-rest-1.0 — broad grant-delete permission and access-token lifetime caveat.
- https://learn.microsoft.com/entra/identity-platform/howto-update-permissions — user/admin consent-management distinction.

Status: foundation under verification; not “ready and disabled” until adapter, full synthetic flows and cost gates are completed.

## Graph transport increment — 21 October 2026

lib/microsoft-teams-graph.ts now prepares default-calendar capability/create and owned-event move/delete operations. Production network access is blocked by TEAMS_APPROVED=false before allowance reservation. Only an explicit127.0.0.1 fixture in a non-production process is accepted for synthetic verification; arbitrary endpoints and production loopback overrides are refused. Each actual request requires an allowance reservation, has8s timeout,1MB streamed response bound, no redirect following, no automatic retries and no provider-body/token error disclosure. Caller integration must supply the real store allowance and encrypted connection token; those connections/routes are not implemented here.

Moves patch only start/end, preserving the provider meeting body/blob and attendees. Synthetic creation has no attendees, and tests send no external invitation. Official update/delete documentation checked21October2026:
- https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/api/event-delete?view=graph-rest-1.0

These endpoints may notify existing attendees when used for a real meeting. That behavior must be explained and checked in the future creator-approved booking lifecycle; no claim of notification-free production deletion is made. OAuth, credential lifecycle, connection binding, real allowance wiring and end-to-end booking are still incomplete. All cost/license/tax gates above remain failing or unknown, not zero. No activation or functional-delivery count.

## Authorization-state cryptography increment — 21 October 2026

A pure helper now generates random32byte state and nonce plus48byte PKCE verifier/S256 challenge. The pending envelope is sealed by the existing AES256GCM secret box, bound to the state, store, hashed signed-in session and hashed actor, and expires after600seconds. Tests cover wrong store/session/actor/state, tampering, expiry and future-time refusal. No provider request, new callback or public offer exists.

This helper does not consume state or grant permission. The eventual connection flow must atomically GETDEL the server-side envelope once, recheck the actor's current settings permission on that store, verify the Microsoft OIDC signature/issuer/audience/nonce and organizational tenant, and only then save an encrypted connection. None of those missing integration checks may be inferred from these pure cryptography tests. Production approval remains false; no environment override or account operation is added.

Protocol reference checked21October2026: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow . Microsoft recommends a supported authentication library; the final adapter/library choice and its bounded requests/security review remain open. No raw hand-written token verifier is approved by this increment.

## Atomic pending-state repository — 21 October 2026

The unconnected pending-state helper stores only the sealed envelope with NX/EX600, after injected current-settings permission and funding checks. Callback consumption uses atomic GETDEL before opening; wrong session/actor, expiry or revoked permission burns the pending state and refuses. Tests exercise simultaneous consumption, replay, session mismatch, permission revocation, insufficient funding and Redis TTL against the existing memory Redis.

This is not a live callback. Future routes must still enforce TEAMS_APPROVED=false, authenticated identity, origin/rate limits and the real store allowance before calling these helpers. Injected checks are not permission proof until wired to the existing authorization/budget services. OIDC verification and encrypted connection/refresh/disconnect/booking integration remain incomplete. No provider request or activation.

Pending state storage correction: the sealed envelope is refused above2048bytes; tests/store-data-registry.ts accounts4096bytes including key/Redis overhead for each reserved integration operation and at most one day retention (actualTTL600seconds). The inactive helper still requires real allowance wiring before a production route; unknown total operation cost and the most expensive tax reading continue to fail closed. Prior registry/WebKit failures are preserved in the queue; full corrected-head CI is required.
