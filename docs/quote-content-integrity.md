# Complete external quotations

Page parsing bounds external quotes at 400 characters. Previously, save validation checked the source link but did not tell the creator when that bound removed the ending. Save validation now refuses an overlong quotation in either page version with quote_length. The editor explains that nothing was saved and asks for a shorter complete quotation from the source. Existing product-page and site-page routes already return pageProblem before saving.

The 400-character storage/rendering bound, source-link requirement, existing records, verified reviews, prices and commercial gates are unchanged. This does not recover endings lost before the fix. No automated rewriting or invented quotation is introduced.

Eight focused pure validation groups cover exact/excess bounds, a critical ending, Unicode, the second page version, short quotes and existing source-link and empty-page behavior. No live browser or external service was used; the full application suite was not run. Installed Next.js 16.3.8 route and client-boundary guides were read before the change.
