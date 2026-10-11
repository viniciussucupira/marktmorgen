"use client";

import { useEffect } from "react";
import { READ_SAMPLE } from "@/lib/page-read-sample";

/** Sends a page's reading to /api/store/read, by beacon where the browser has one. */
export function sendRead(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.("/api/store/read", new Blob([body], { type: "text/plain" }))) return;
  } catch {}
  fetch("/api/store/read", { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

/**
 * Sends, once, the id of the furthest block of a sales page this visitor saw
 * (lib/page-depth.ts), when they leave the page or switch away from it — for
 * one visitor in READ_SAMPLE, chosen here at random, so the measure stays
 * inside what a visit costs (lib/page-read.ts). Nothing else: no cookie, no
 * time on page, nothing about the visitor.
 */
export function PageDepth({ token, product }: { token: string; product: string }) {
  useEffect(() => {
    if (!token || Math.random() * READ_SAMPLE >= 1) return;
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-block]")];
    if (blocks.length === 0 || typeof IntersectionObserver === "undefined") return;
    let furthest = -1;
    let sent = false;
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const at = blocks.indexOf(entry.target as HTMLElement);
          if (at > furthest) furthest = at;
        }
      },
      { threshold: 0.4 },
    );
    blocks.forEach((block) => watch.observe(block));
    const send = () => {
      if (sent || furthest < 0) return;
      sent = true;
      sendRead({ t: token, k: "d", p: product, b: blocks[furthest].dataset.block ?? "" });
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", send);
    return () => {
      watch.disconnect();
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", send);
    };
  }, [token, product]);
  return null;
}
