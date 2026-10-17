# Pending affiliate payout availability

Saved pending PayPal batches are read strictly before creating or exporting a new payout batch. Both supported HGETALL shapes remain valid, including a confirmed empty hash and valid legacy affiliate identifiers. Missing replies, malformed JSON, duplicate keys, unsafe amounts or invalid fields fail the whole read. Original records are never deleted or rewritten by this parser.

The creator page keeps unavailable pending exposure separate from an empty set. New-batch controls and provider totals are hidden while that check is unavailable; the warning explains reloading and preserves saved records and the existing full export. Existing batch APIs and automatic sends re-read pending exposure and fail on an invalid read.

Tests use synthetic storage and mocked provider responses only. No live authenticated Affiliates page is requested, because its GET invokes settlement. This change does not fix uncertain provider dispatch before the open-batch write, settlement write ordering, full affiliate-book coverage, or certify the commercial margin. Those remain separate review items.
