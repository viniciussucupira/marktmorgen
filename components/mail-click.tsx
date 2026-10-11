"use client";

import { useEffect } from "react";

/**
 * On every page of a store: when it was opened through a link in one of the
 * store's sequence emails by somebody who allowed it (lib/mail-clicks.ts),
 * says which email the link was in, and takes the reader's key out of the
 * address bar, so it is not copied on with the address. On every other visit
 * it does nothing at all.
 *
 * Done here, in the page, rather than by sending the link through us first:
 * a mail app checking links for safety fetches them without running a page,
 * so it is not counted as the reader having used one.
 */
export function MailClick() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const key = url.searchParams.get("mk");
    if (key === null) return;
    const campaign = url.searchParams.get("utm_campaign") ?? "";
    url.searchParams.delete("mk");
    window.history.replaceState(window.history.state, "", url.toString());
    if (!/^[0-9a-f]{24}$/.test(key)) return;
    void fetch("/api/mail/clicked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: key, c: campaign.slice(0, 60) }),
      keepalive: true,
    }).catch(() => null);
  }, []);
  return null;
}
