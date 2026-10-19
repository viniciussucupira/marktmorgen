# Refreshing experiment results without leaving the editor

Running headline and whole-page tests expose one Refresh results button. It rereads
the existing owner/products-authorized API, subject to the existing studio meter.
There is no polling, timer, new endpoint, AI call, saved setting or allowance.
The button is disabled while the request is pending.

Refresh clears the old result before requesting, so a stale winner is not displayed
as current during loading or failure. Loading/failure status remains accessible.
Abort cleanup and the existing live guard prevent an obsolete response from
updating a changed/unmounted result. The request does not save or reload the page,
so local headline and page edits remain in place.

Malformed readings still fail closed, and the gross-payment disclosure remains.
Browser tests at390/1280 check transient503, a delayed successful retry, hidden
old winner, disabled duplicate activation, exactly one request per click,
retained unsaved headline, no page writes, stable URL, keyboard access and44px
target. Existing saved-malformed/allocation/recovery, payment basis, Path and
privacy scenarios remain. Only synthetic services/data are used.
