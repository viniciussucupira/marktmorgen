# The buyer's language and currency at checkout (22 [E5], with 208 [SH5] and 393 [CX4])

Design written by Claude 2 on 1 November 2026, from the code on main. Nothing is built by this document. It records what exists, what Stripe's own pages say (read that day), the parts of E5, how they meet 208 [SH5] and 393 [CX4], and the units, so nothing is built twice.

## What E5 asks

- The checkout uses the browser's language, among the languages the store already offers.
- Prices in several currencies, set by the creator, with no automatic conversion and no exchange cost for the platform.

## What exists

| Piece | Where | Today |
| --- | --- | --- |
| A store's language | `store.language`, `lib/store-language.ts` (7 languages), the buyer words in `lib/buyer-words` | **One language per store.** Every page of the store, its emails and its checkout speak it. Stripe's Checkout is opened in it (`locale: LANGUAGES[store.language].stripe`, `lib/store-checkout.ts`). |
| A store's currency | `store.currency`, `lib/money.ts` (each currency's rules: decimals, minimum charge, price range) | **One currency per store.** Every checkout sends `price_data[currency]: store.currency` with the product's amount. About 115 files read `store.currency`: orders, refunds, receipts, reports, the Path's money, payouts and exports. |
| Site languages | `docs/site-languages.md` | Translating the platform has an approved design and a deferred launch, with gates. |

## Part 1: the checkout's language

A store offers one language, so "the browser's language among the store's" is the store's language, and that is what Checkout already opens in. **Nothing is missing today.** The part becomes real only when a store can offer more than one language, which is not built and is not on sale (`docs/site-languages.md`). At that point the checkout takes the buyer's choice of the store's languages. It does not take Stripe's own browser detection (`locale: "auto"`), which could open Checkout in a language the store does not speak. Stripe's reference for `locale` was not re-read in this session; check it then.

## Part 2: prices in several currencies

What Stripe's page "Manual currency prices" (docs.stripe.com/payments/checkout/localize-prices/manual-currency-prices, Stripe-hosted variant, read on 1 November 2026) says:

- A Price can carry other currencies in `currency_options`, each with its own amount set by the seller. Checkout "automatically handles currency localization", by the customer's location, unless the session names a currency.
- Localization needs every price, shipping rate and discount in the session (and an upsell's price) to have that currency. With Stripe Tax, the `tax_behavior` must be set for that currency. Otherwise the session falls back to the default currency.
- It is not available for sessions that use manual tax rates or `payment_intent_data.application_fee_amount`.
- Stripe "recommends using Adaptive Pricing instead", and manual prices override Adaptive Pricing for their currencies.
- Fees: Stripe's standard fees apply, including "Currency conversion fee", on automatically converted transactions.

What that means here:

- **A Price object, not `price_data`.** The checkout builds each line with `price_data`, but manual currency prices live on a Price. So a product with other currencies needs a Price on the creator's own account, made by the code the way the platform's own prices are made under their lookup key (`ensurePrice`, `lib/billing.ts`). It is remade when the creator changes an amount.
- **Every line must carry the currency, or none localizes.** That covers the order bump, the offers after paying, discounts and shipping. One line without the currency sends the whole session back to the default.
- **No exchange cost for the platform.** These are direct charges on the creator's account. A conversion fee, where Stripe charges one, falls on that account, never on Marktmorgen's. The creator is told so beside the field.
- **Commission.** The restriction on `application_fee_amount` matters only if a commission ever goes live through an application fee. Today `COMMISSION_LIVE` is false. Recorded here so that day does not silently stop localization.
- **The money everywhere else.** Orders, refunds, receipts, reports, the Path's money, exports and payouts read one currency per store today. An order paid in another currency must carry its own currency all the way through. It must never be added to the store's totals as if it were the store's currency, and no conversion may be made up to add it. This is most of the work, and its own unit.

## How it meets 208 [SH5] and 393 [CX4]

- **208 [SH5]** studies Stripe's automatic conversion (Adaptive Pricing): who pays the conversion fee, where it works and what happens on refunds. It is built only if the fee falls on the buyer or the creator and the creator can switch it on and off. Manual prices (E5) and Adaptive Pricing are two ways to the same screen. The manual price wins for its currency. The study comes first, because if Adaptive Pricing passes SH5's conditions, E5's manual prices are only the creator's own overrides on top of it.
- **393 [CX4]** asks for a price per **country**, beyond per currency. `currency_options` picks by currency, so two countries that share the euro get one price. A price per country needs the country detected by our own code and the price chosen before the session, with an honest note to the buyer, which is CX4's own work. The model below keeps room for it: an amount per currency now, per country later.

## Units (tests first)

0. **This design**, and 208 [SH5]'s study from Stripe's official pages (Adaptive Pricing with direct charges on Standard accounts: fee, countries, refunds).
1. **The product's other currencies.**
   - `currencyPrices` on a product: currency to amount, each held to that currency's own range (`priceInRange`, `lib/money.ts`), and only currencies Stripe offers on the creator's account.
   - The editor shows them under the main price, with the conversion-fee note.
   - Nothing changes at checkout yet.
2. **The checkout.**
   - A product with other currencies is sold through a Price with `currency_options` on the creator's account, made and remade by the code, and every other line of the session carries the same currencies or the session is not localized.
   - Stripe Tax's `tax_behavior` is set per currency.
   - The thanks page and the sweep read the session's own currency.
3. **The money everywhere else.** Every reader of `store.currency` that adds or shows an order's amount takes the order's own currency. Totals are shown per currency, never converted. Each reader gets a test.
4. **The language part**, when a store can offer several languages.
5. **393 [CX4]**, the price per country, on the same model.

## Cost and margin

- No new supplier and no platform exchange cost.
- Each Price made on a creator's account is a Stripe request inside the checkout's existing request budget.
- The extra per-product amounts are a few bytes inside the product's record, which is within the store's data room.
- Unit 1 states the bytes and the requests; unknown fails.

## Accessibility for every unit

- Each unit's PR carries its own Acessibilidade section (AX274).
- The currency fields are labelled with the currency's name and code.
- A buyer is never shown a converted amount we made up: only the creator's own amounts, or Stripe's on its own page.
