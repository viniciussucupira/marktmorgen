# CRM editing and selection recovery

Opening the existing New deal/Edit form moves focus to its title after the user action. The effect depends only on the active record identity, so typing in the editor or switching Board/Agenda does not continually take focus. Closing and reopening the editor focuses it again.

Clear selection resets search, responsible teammate and action filter, and restores the default order for the current view (current order in Board; earliest date in Agenda). It leaves the current view, deal/stage/field drafts, saved records and the whole-board summary intact. No save, message, export or new read is triggered. Pending writes and unconfirmed-write restrictions remain unchanged.

These are client-only usability changes within the existing authorized CRM. Automated regressions/build and static rendering are separate from authenticated browser interaction; the browser broker was unavailable during this delivery.
