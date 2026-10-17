# Affiliate commission campaign labels

The creator's affiliate page passes the recorded source/campaign/content tags into its commission-history view. Older untagged records stay untagged, and partially tagged records keep missing fields explicit. No new tracking, cookies, metadata storage or provider requests are introduced. The existing full export already includes these tags and remains unchanged.

The page still loads at most 100 newest commission entries for display. It passes the recorded list count; the view distinguishes this limit, confirmed empty records and unknown count. Counts describe the recorded book, not complete provider coverage. Existing invoice/refund coverage warnings remain. Positive commission-record summaries separate currencies and credit types. Bonus and second-tier records are not additional purchases. Unsafe sums stay unavailable. No payout calculation, transfer, settlement, tax rule or financial admission changes.

Tests use synthetic records and rendered components, not the live Affiliates page. Its GET invokes settlePayPal, so do not use a live authenticated request as a payment test. In-flight payout availability and other management-read fallbacks remain separate audit items; this UI work does not certify them or the commercial margin.
