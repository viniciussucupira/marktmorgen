# Team event types and two-way calendar sync for hosts

Covers ClickFunnels audit capabilities F40 (team event types) and F41 (calendar sync and booking rules). Code: `lib/team-scheduling-rules.ts` (rules, client-safe), `lib/team-booking.ts` (who is free, who gets the booking), `lib/host-claims.ts` (atomic claims), `lib/host-calendar.ts` (each host's calendar), with the booking flow in `lib/calls.ts`.

## What a creator gets

- A call with weekly hours and one person per time can be a team event type: **round robin** (each booking goes to a free host, the one with the fewest bookings of that event so far, then the fewest team calls coming up, then by address) or **collective** (only times all hosts are free are offered, and every host is claimed).
- Hosts are the store's owner and the people on its team now (`lib/team.ts`); someone taken off the team stops being offered at the next booking.
- Each host has their own week in their own time zone (up to two stretches a day), their own gap between calls, notice, and a daily cap of team calls counted in their own day. The call's own notice, gap and horizon still apply; the stricter one wins. Daylight saving is resolved by the time zone database at the exact instant (`zonedToUtc`), as for every call.
- A buyer who moves a team booking keeps its host(s): only their free times are offered, and the claim moves in one step.

## Never booked twice

Every hold and booking of a team call is also written into each host's own claims list, `nl:host:claims:<host id>`, by the Lua script `CLAIM_HOST_TIMES`. The script checks the host's gap and daily cap and writes in one step; a collective claim writes every host or none. The host id is a hash of the sign-in address, so the list is the person's across every store: two stores' separate locks cannot both hold the same person for one time. Held claims expire with their checkout (plus ten minutes); paid ones stay until two days after the call; a hold given back, a full refund (read by the booking page and by the five-minute job) or a move releases or moves the claim. `scripts/test_host_claims_redis.py` runs the actual script against a real Redis in CI (64 concurrent holds of one hour leave one claim; racing collective claims never double-book; refusals write nothing).

## Each host's calendar

A host sets their calendar once, for every store they host on, under **Your calendar** in the studio (`/studio/calendar`, any role):

- **Google Calendar (two-way)**: their own OAuth connection (`nl:meet:conn:hosts:google:h:<host id>`, sealed like the store's). Busy times come from Google's free/busy query on the calendars they tick (primary when none), in 30-day pieces, 92 days ahead; never titles, guests or places. Each team booking they host is written with a Google Meet link to the calendar they choose (other collective hosts on the guest list, Google emails nobody), moved on reschedule and deleted on a full refund, through the existing meeting records and retries (`lib/meet-links.ts`). A call set to Zoom keeps making its Zoom meeting on the store's account.
- **A private iCal address**: the existing ICS reader (`readFeed`), sealed at rest. The fallback.
- **None**: only Marktmorgen bookings block them.

A reading is reused for five minutes and asked again by one request at a time, only while someone looks at a booking page or the host presses Check now. If the last good reading is more than 20 minutes old, or the calendar cannot be read, the Google permission is missing, or Google sync is switched off, **that host is blocked**: none of their times are offered while the other hosts' stay open. The host's page and the team editor show the state and the last successful sync.

## Google scopes, and what the owner must do

The store's existing connection asks for `openid email https://www.googleapis.com/auth/calendar.events` and is unchanged. A team host's own connection asks for those plus exactly two:

| Scope | Why | Google's description |
|---|---|---|
| `https://www.googleapis.com/auth/calendar.freebusy` | read when the host is busy, never what | View your availability in your calendars |
| `https://www.googleapis.com/auth/calendar.calendarlist.readonly` | list the host's calendars so they pick which are read and which one is written to | See the list of Google calendars you're subscribed to |

Writing the booked event uses the `calendar.events` scope the app already has. Google's `freebusy.query` accepts `calendar.freebusy` (source: developers.google.com/workspace/calendar/v3/reference/freebusy/query).

Owner steps (the code stays off until the last one):

1. Google Cloud console → the project of the existing Marktmorgen OAuth client → **Google Auth Platform → Data access** (older consoles: **APIs & Services → OAuth consent screen → Edit app → Scopes**).
2. **Add or remove scopes** → add `.../auth/calendar.freebusy` and `.../auth/calendar.calendarlist.readonly` (filter by "Google Calendar API"), then **Update** and **Save**.
3. If the app is in production and verified, Google asks for the changed scopes to be verified again: submit it with the same justification as above (team hosts' availability and calendar choice; no event content is read). Until approved, Google shows unverified-app warnings to new hosts.
4. In Vercel → project → Settings → Environment Variables, add `GOOGLE_CALENDAR_SYNC_SCOPES` = `1` for Production, and redeploy.

**Done on 17 Oct 2026** (owner authorized it in conversation): both scopes were added under Google Auth Platform → Data access of the project "Nimbus Labs" (`nimbus-labs-509912`, owned by the owner's Google account); Google lists both as non-sensitive, so no new verification was required. `GOOGLE_CALENDAR_SYNC_SCOPES=1` was added to the Vercel project for Production as a Config variable, and this commit's deployment is the redeploy that reads it.

While the variable is unset, hosts are offered only the iCal address, the studio says why, and a host who had chosen Google is blocked (never read without permission). A host who unchecks the free/busy box on Google's page is told so and blocked until they connect again with it.

## Limits per plan (enforced on save and at every booking)

| Plan | Team event types | Hosts per event type |
|---|---:|---:|
| Store (and its free trial) | 1 | 2 |
| Studio | 5 | 4 |
| Scale | 10 | 6 |
| No plan running | 0 | 0 |

After a downgrade the oldest team event types, and the first hosts on each, stay on; the rest are closed for booking, never deleted.

## Cost reasoning

Google Calendar API calls carry no per-call charge (project quota only; a quota refusal is a failure and blocks the host, never a free slot). Per host, a reading is made at most every five minutes and only while a booking page is viewed (page views are already counted against the plan's visits): at most 288 readings a day, each up to four free/busy requests and about seven Redis commands: about 60,000 Redis commands a host a month in the worst case, roughly $0.12 at Upstash's $0.20 per 100,000. Reading the kept state on each booking page view adds three commands a host to a view already counted as a visit. A store has at most six people, and the per-plan host numbers bound how many are read for its team calls. Bookings send the same number of emails as before (one to the buyer, one creator-side email addressed to the owner when they host, otherwise to the host), so the order allowance's per-order email cost is unchanged. None of this certifies the 60% margin rule; it adds no unbounded cost.

## Not included (follow-ups)

- Ordinary (non-team) calls do not claim the owner's time across stores; a creator who hosts on another store's team sees that store's team bookings, not their own store's ordinary calls, in the other store's claims. Inside one store, ordinary calls block the owner as a host.
- Reminders a day and an hour before still go to the store's address and list everyone booked; host-addressed reminders and per-host email are not built.
- A moved team booking keeps its host; reassigning to another host on move is not built.
- Microsoft (Outlook) OAuth sync is not built; Outlook works through its published iCal address.
- The store-level iCal feeds keep their earlier behavior for ordinary calls (last good reading used for up to six hours).
