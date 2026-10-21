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
