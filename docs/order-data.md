# What an order keeps in the database (18 October 2026)

Since #528 every store has a data room in the database (`lib/store-data-rules.ts`, `DATA_ROOM_BYTES`: 18 MB on Store, 135 MB on Studio, 250 MB on Scale). Until this change every order counted took a fixed `ORDER_DATA_BYTES` (4,608 B) plus `ITEM_DATA_BYTES` (4,352 B) for each product it handed over, for good: the most every record an order could ever leave weighs. A Store's room then held about 2,000 one-product orders, after which new checkouts paused. That would stop a growing creator's sales.

## Each order is charged what it really writes

Every record an order keeps is now written by `lib/order-data.ts` (`orderWrite`), one Lua script (`ORDER_WRITE`) that measures, in Redis, what each command adds and charges exactly that to the room's slot for orders (`o`), in the same atomic step:

- a new key: its name and `ORDER_KEY_BYTES` (96);
- a new field, member or list item: its name, its value and `ORDER_ENTRY_BYTES` (64); a board's (sorted set's) member its name, its 8-byte score and `ORDER_BOARD_ENTRY_BYTES` (128);
- a value made longer: what it grew by; one written the same or shorter: nothing;
- a quarter more of all that, for what Redis's allocator rounds each piece up to, rounded up to `DATA_STEP_BYTES` (16).

Nothing is refused there (a buyer who paid gets everything) and nothing is given back when a value shrinks, so the room looks fuller than it is, never emptier. The checkout still holds the ceiling (`orderDataBytes(items)`) while it is open (`lib/order-admission.ts`), so the room can never be passed by orders paying at once; the hold is let go when the checkout settles.

"Never below what is stored" is checked two ways:

- `scripts/test_order_data_redis.py` (real Redis, in CI) holds the charges at or above Redis's own `MEMORY USAGE ... SAMPLES 0` for every key at every step, through every change of encoding: a hash of 600 fields, hashes of long values, sets and boards of 400 members, 300 expiring keys, values of every allocator size class from 65 B to 20 KB.
- `tests/order-data.test.ts` runs 300 random writes of every kind and holds the total charged at or above the plain bytes kept after each one, and holds the script's numbers to the exported constants.

`tests/store-data-registry.test.ts` fails if a file that keeps what an order leaves (every `kept` or `item` part of `tests/store-data-registry.ts`: 21 files, from contacts and the buyer's library to license keys, community members and podcast access) does not write through `orderWrite`, or if `lib/orders.ts` charges a fixed ceiling again.

### What an order leaves now, measured (tests/order-data.test.ts)

| | Bytes |
|---|---|
| A new buyer's first order of a course: their contact (and the list's own key, once), their place among the store's people, their library entry, the course in their record | 1,552 |
| The same buyer's next order, of another product | 160 |
| The fixed charge before this change, one product | 8,960 |

Parts of the first: the contact and the store's people 912 B, the library 304 B, the course record 336 B; a lifetime affiliate bond, where the store has one, 320 B more.

### What each room holds now

| Plan | Room | Orders at the fixed charge | Orders now, every one a new buyer of a course |
|---|---|---|---|
| Store | 18 MB | 2,008 | 11,597 |
| Studio | 135 MB | 15,066 | 86,984 |
| Scale | 250 MB | 27,901 | 161,082 |

Orders from buyers who bought before cost about a tenth of that, so a store with repeat buyers holds many more. At Store's figure of 200 orders a month, 11,597 new buyers is almost five years of orders with no buyer ever coming back. Nothing about pricing or margins changes: the `database-storage` line already prices every plan's room full every day (`tests/plan-cost-registry.ts`), and the six plan/cycle cases keep the same room above the 60% floor (Store $0.2504 a month and $2.28 a year, Studio $2.02 and $1.02, Scale $5.37 and $1.01).

## A booked call's diary line is let go after the call

A paid call kept its line in the store's diary (`nl:call:busy:`) for good. The diary only makes times unavailable, and Stripe keeps the booking itself, which is what every page and refund reads. So `lib/calls.ts` lets go a line `PAST_CALL_DAYS` (90) days after the call ended, on the first look at the diary, and gives back what the line was charged (`fieldReleaseBytes`, rounded down, never more than it took). The privacy page and the help center say so.

## The one-time count of what stores kept before (lib/data-recount.ts)

What a store wrote before its room existed sits outside the room until it is next written. `app/api/cron/recount` (hourly, until done) walks the whole database once:

1. reads every store's ids (its record, its products, its sequences);
2. reads the database a page of 500 keys at a time and, for each key of a family the room counts (`lib/data-families.ts`, held to the registry by `tests/data-recount.test.ts`), finds the store whose id names it (or, for a link kept under a token, whose id is in its value) and measures it the way `orderWrite` charges;
3. sets each store's room slot `legacy` to what was measured beyond what the room already counts, never below nothing.

It is bounded (45 seconds and 40 pages a run), resumable (each page's sums and the cursor are written in one script, `RECOUNT_PAGE`, only from where the job is, so a run that dies leaves nothing half-added; `scripts/test_data_recount_redis.py` runs two dozen runs of one page at once and adds it once) and idempotent (a slot is set, not added to; once done every run is one read until `RECOUNT_VERSION` changes). Its cost is the company's, once, before release: two database commands for each page of 500 keys and a few for each key a store keeps, a few dollars at the most for a million keys at Upstash's $2 a million commands. Keys that name no store (a mark under a payment's id, an address's library across stores) are left out; their families are bounded on their own in the registry.

## The database stays in one region

Upstash bills what a database keeps once for every copy, a read region included. Every plan prices one copy (`database-storage`, `retained-data`), so a read region would multiply both lines by the copies and spend the 60% without any test noticing. `tests/upstash-single-region.test.ts` fails if the code, the deployment, the jobs or the workflows configure a read region, a replica or a second database address, or bring in a client that reads from replicas. Read regions are switched on only in Upstash's console: the owner must not switch one on before it is priced in `tests/plan-cost-registry.ts`.

## Asked for, and not built here (for the owner)

**Moving orders older than 90 days to R2.** The premise was that each order's record is kept in the database for good. It is not: an order's record (what was bought, what was paid, its receipt, its refunds and disputes) is the payment on the creator's own Stripe account, read every time a receipt, a refund, a download or a course is opened (`lib/refunds.ts`, `lib/purchase-email.ts`, `lib/learn.ts`). What the database keeps per order is, measured above, mostly per buyer and read on the buyer's every visit: their contact on the creator's list (read by every broadcast, segment and export), their library and their place among the store's people (read across stores by address), their course record and access tokens. Moving those to R2 would put a read of R2 in front of access checks and every send, and save at most the course record and the bond, about 300 to 650 B of a new buyer's 1,552, less the index entry each archived buyer would leave (about 135 B). With orders charged what they write, that is not worth a new failure mode on buyers' access. If the owner wants rooms that never fill with buyers, the record to move is the contact list, and that needs its own design (broadcasts, segments and exports reading archived contacts in batches, priced per send).

**Deleting the creator's records at the closing day, keeping the legal minimum in R2 for 7 years: built since (18 October 2026).** A plan that ends closes its store on its closing day; its records are deleted within the hour by a walk of the database, family by family (`lib/closed-store-data.ts`, `CLOSING` in `lib/data-families.ts`), and its sales of the last seven full years and the year it closed are kept compressed in R2 (`lib/closing-archive.ts`), never a buyer's address. docs/funded-exposure-review.md ("What a store keeps in the database after its closing day") has the rule, the prices and the tests.
