# Exact annual pause generation in funded restart ownership

The first restart owner already reads the annual pause-eligibility marker in its atomic claim, but previously discarded that number. Submission, recovery and activation accepted any later positive marker. A different valid generation could therefore be adopted after the original claim.

The claim now retains the observed annual number in the immutable intent. The detached first-owner acknowledgement validates and freezes it. Submission, bounded recovery and ledger activation compare the current annual marker with that exact number before granting their respective permission. A changed marker refuses without modifying the ledger, consuming a provider-read allowance or authorizing a new POST. Provider-result retention remains evidence retention and is not blocked merely by a later annual-marker change.

The existing financial terms binding includes the annual-source rule, so an old review cannot silently approve the changed protocol. Actual financial review/policies remain null and pauseRestart coverage remains false. Older intents missing this field are held; they are not converted, erased, released or treated as a fresh owner. No existing creator content, paid rights, cancellation or refund is removed.

## Synthetic verification

The wire test covers missing, null, noninteger, nonpositive, future and string annual observations and checks the frozen source. Actual Redis tests change the marker from1799999000 to1799999999 after a valid first claim, independently before submission, recovery and activation. Both values are positive and predate the paid source end; rejection must therefore be caused by generation mismatch, not a missing or invalid marker. Exact ledger snapshots must remain unchanged. Existing missing-marker cases, result-ID retention, duplicate contenders, lost ACK and three lifetime recovery-read limits remain.

Complete new-head CI is required before merge; tests are synthetic and use no real account, payment or message.

## Costs and remaining work

No Redis/provider operation, key, job, retention interval or grant-slot allocation is added. The annual value uses the existing read in each script. The extra serialized field is at most23 bytes, within the unchanged4096-byte permanent intent envelope and its existing submission-result headroom. The17-command ceilings remain. This does not assume incremental CPU or network bytes are zero, and does not approve retained-liability, paid-topology or total supplier cost.

| Contract | Incremental Redis/provider operations | Permanent intent maximum | Funding status |
| --- | --- | --- | --- |
| Store monthly | 0 | Existing4096 bytes | Unknown full costs reject |
| Store annual | 0; annual restart remains refused | Existing4096 bytes | Unknown full costs reject |
| Studio monthly | 0 | Existing4096 bytes | Unknown full costs reject |
| Studio annual | 0; annual restart remains refused | Existing4096 bytes | Unknown full costs reject |
| Scale monthly | 0 | Existing4096 bytes | Unknown full costs reject |
| Scale annual | 0; annual restart remains refused | Existing4096 bytes | Unknown full costs reject |

Before future operation, the full monthly/annual costs, dearest paid price, caps and reserve must be reviewed. MR/TX and100% LLC fixed-cost allocation to Marktmorgen remain binding. Unit worst-case non-loss at100% rights/add-ons and company non-loss from the computed minimum base remain required;60% is the actual monthly company net target. Receiving rates, reserves, exposure and funding are preserved.

This is a wired ownership/authorization correction, not the missing funded Store publication or generation-aware final cleanup. Those must still acknowledge the Store and retain unresolved obligations without a second POST. No sale/opening flag, price, visible limit, commission, language or supplier configuration changes. No functional-counter increment.
