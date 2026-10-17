"use client";

import { useEffect } from "react";
import type { FrameMessage } from "@/lib/embed-sites";

/**
 * What a frame opened by the checkout script tells the page that opened it
 * (lib/embed-sdk.ts turns each into an event there).
 *
 * Only ever to `to`, one origin the page checked against the store's listed
 * sites (lib/embed-sites.ts listedSite) before drawing this: the browser
 * delivers a message to that origin or drops it, so a page on any other
 * address hears nothing, whatever frames it. Nothing is taken from the page
 * that opened it: this listens to no message.
 *
 *   ready     on arrival, with the height the card asks for
 *   checkout  when the buy button's form is sent (it opens Stripe in a new tab)
 *   optin     on the sign-up form's answer page, with what happened
 *   close     when Escape is pressed inside the frame
 */
export function EmbedMessenger({ to, height, status }: { to: string; height?: number; status?: string }) {
  useEffect(() => {
    if (window.parent === window) return;
    const say = (type: FrameMessage, more: Record<string, unknown> = {}) => {
      try {
        window.parent.postMessage({ marktmorgen: 1, type, ...more }, to);
      } catch {
        // A parent that is gone hears nothing; the frame still works.
      }
    };
    say("ready", height ? { height } : {});
    if (status) say("optin", { status });
    const sent = (event: Event) => {
      const form = event.target;
      if (form instanceof HTMLFormElement && form.hasAttribute("data-checkout")) say("checkout");
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") say("close");
    };
    document.addEventListener("submit", sent);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("submit", sent);
      document.removeEventListener("keydown", key);
    };
  }, [to, height, status]);
  return null;
}
