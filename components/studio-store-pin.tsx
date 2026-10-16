"use client";

import { createContext, useContext, useState } from "react";

/** The header every studio request carries (lib/studio-route.ts, PIN_HEADER). */
const PIN_HEADER = "x-nimbus-store";

let pinned = "";
let installed = false;

/**
 * Makes every request this page sends to our own API say which store the
 * page was drawn for. Installed once per page, before any child asks for
 * anything, and it only ever adds the header to requests for this site's
 * /api/, never to anything sent elsewhere.
 */
function pinTo(sid: string): void {
  pinned = sid;
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, window.location.href);
      if (pinned && url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has(PIN_HEADER)) headers.set(PIN_HEADER, pinned);
        return original(input, { ...init, headers });
      }
    } catch {
      // A URL that cannot be read is sent as it was.
    }
    return original(input, init);
  };
}

const StoreContext = createContext("");

/**
 * Wraps a studio page: says which store it was drawn for to everything
 * inside it (useStudioStore), and to every request it makes.
 *
 * Two tabs open on two stores therefore keep acting on their own store each,
 * whatever was chosen in the switcher since.
 */
export function StudioStorePin({ sid, children }: { sid: string; children: React.ReactNode }) {
  // Set while drawing, not after: a child that asks the server for something
  // as soon as it appears must already carry the store.
  useState(() => pinTo(sid));
  if (typeof window !== "undefined" && pinned !== sid) pinTo(sid);
  // A new store must not inherit drafts, selections or dialog state from the previous one.
  return <StoreContext.Provider key={sid} value={sid}>{children}</StoreContext.Provider>;
}

/** The id of the store this studio page is for, or "" outside one. */
export function useStudioStore(): string {
  return useContext(StoreContext);
}

/** A link inside the studio, kept on the same store. */
export function useStudioHref(): (path: string) => string {
  const sid = useStudioStore();
  return (path: string) => {
    if (!sid) return path;
    const [base, hash = ""] = path.split("#");
    const joined = `${base}${base.includes("?") ? "&" : "?"}store=${sid}`;
    return hash ? `${joined}#${hash}` : joined;
  };
}

/** For a plain form inside the studio: sends the store along with it. */
export function StoreField() {
  const sid = useStudioStore();
  return sid ? <input type="hidden" name="store" value={sid} /> : null;
}
