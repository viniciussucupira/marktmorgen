"use client";

import { useEffect } from "react";

// One count per page load, however many times React runs the effect.
const sent = new Set<string>();

function beacon(payload: Record<string, string>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/store/hit", new Blob([body], { type: "text/plain" }))) return;
  } catch {
    // Fall through to fetch.
  }
  fetch("/api/store/hit", { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

/**
 * Tells the store it was opened, and which of its links are followed.
 *
 * No cookie and nothing kept in the browser: the page sends where the visitor
 * came from — the referring site, or the utm_source, utm_medium and
 * utm_campaign tags on the creator's own link — and the server does the rest.
 *
 * On a page of the store other than its front one (`front` false), it says
 * only that the page was opened, so that somebody who arrives by a link
 * straight to a product is a visit too.
 */
export function StoreBeacon({ handle, front = true, product = "" }: { handle: string; front?: boolean; product?: string }) {
  useEffect(() => {
    const key = `${handle}|${location.href}`;
    if (!sent.has(key)) {
      sent.add(key);
      if (front) {
        const query = new URLSearchParams(location.search);
        const tag = (name: string) => (query.get(name) ?? "").slice(0, 60);
        beacon({ h: handle, k: "v", r: document.referrer.slice(0, 500), u: tag("utm_source"), m: tag("utm_medium"), g: tag("utm_campaign") });
      } else {
        // Any other page of the store: only that somebody came (lib/traffic.ts),
        // and on a product's own page, which product: what its sales are measured against.
        beacon(product ? { h: handle, k: "p", p: product } : { h: handle, k: "p" });
      }
    }
    // Which links are followed is counted on the front page, where they are.
    if (!front) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a[data-link]") : null;
      const id = target?.getAttribute("data-link");
      if (id) beacon({ h: handle, k: "l", id });
    };
    // Middle clicks open links too.
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, [handle, front, product]);
  return null;
}

/**
 * Tells a funnel of pages that one of its steps was opened (lib/page-funnel.ts):
 * which funnel, from the mark in the address, and which page or product this
 * is. The server works out the step, counts each person once, and never the
 * store's own people.
 */
export function FunnelBeacon({ handle, funnel, kind, id }: { handle: string; funnel: string; kind: "page" | "product"; id: string }) {
  useEffect(() => {
    const key = `${handle}|${location.href}|funnel`;
    if (sent.has(key)) return;
    sent.add(key);
    beacon({ h: handle, k: "f", f: funnel, t: kind === "page" ? "g" : "p", id });
  }, [handle, funnel, kind, id]);
  return null;
}
