"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { NewTab } from "@/components/new-tab";

/**
 * Sharing an article: the address copied to the clipboard, or handed to one
 * of the two places our readers use. No tracking scripts, no counters, no
 * invented share numbers — just links.
 */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const x = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-line pt-8">
      <p className="mr-1 font-semibold text-ink">Share this</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
          } catch {
            /* A browser that refuses the clipboard: the two links still work. */
          }
        }}
        className="btn btn-secondary btn-sm"
      >
        <Icon name={copied ? "check" : "link"} size={16} />
        <span aria-live="polite">{copied ? "Link copied" : "Copy the link"}</span>
      </button>
      <a href={x} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
        Share on X
        <Icon name="arrow-up-right" size={16} />
      <NewTab /></a>
      <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
        Share on LinkedIn
        <Icon name="arrow-up-right" size={16} />
      <NewTab /></a>
    </div>
  );
}
