# HT2 — the existing platform page as a creator journey

Owner HT2, queue item184. Reorganizes the existing /platform route; no parallel solutions page or duplicate catalog.

A static ordered introduction follows Create → Charge → Deliver → Sell more → Automate → Grow. Each stage links to existing pages in lib/feature-pages.ts. The existing FeatureCatalogue, its catalog anchor and the creator links stay in place. Catalog browsing remains directly reachable from the journey.

The page names existing code paths and links to their requirements, including Stripe processing fees, availability, plan limits, recipient consent, spending caps and domain prerequisites. A visible notice says paid selling is closed while PLANS_ON_SALE is false. The journey activates no product, workflow, email, payment or integration and promises no additional sales or forecast.

Static text/layout/data only: same route/assets/services, no additional provider or account read, no new model call, stored record or runtime operation. Feature links disable prefetch. All prices, visible allowances, commissions, tax/art9a/commercial/opening gates remain unchanged; no general margin certification.

Unit coverage resolves every journey slug against existing feature pages and fixes the intended six-stage order. Synthetic local browser checks at390/1280 cover links/GET200 destinations, keyboard focus/target sizes, retained catalog/creator choices, the catalog anchor, closed-sale notice, overflow, axe and no API write. No real account, signup, checkout, message or payment. Full final-head CI and exact production proof are still required before publication.
