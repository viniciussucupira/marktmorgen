"use client";

import { useState } from "react";

/** What the two buttons say, in the store's language (lib/buyer-words/courses.ts). */
export type CertificateActionWords = { print: string; copy: string; copied: string; prompt: string; addToLinkedIn: string; shareOnLinkedIn: string; downloadPdf?: string };

const ENGLISH: CertificateActionWords = {
  print: "Print or save as PDF",
  copy: "Copy the link",
  copied: "Link copied",
  prompt: "Copy this link",
  addToLinkedIn: "Add to LinkedIn profile",
  shareOnLinkedIn: "Share on LinkedIn",
};

/**
 * What a student does with a certificate: print it (or save it as a PDF from
 * the print dialog, which every browser offers), share its link, and put it
 * on LinkedIn — on their profile, with this page as the credential, or in a
 * post. Each LinkedIn link opens LinkedIn's own page, filled in, where the
 * student decides; nothing is posted for them.
 */
export function CertificateActions({ url, linkedIn, pdf, words = ENGLISH }: { url: string; linkedIn?: { add: string; share: string }; pdf?: string; words?: CertificateActionWords }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {linkedIn ? (
        <>
          <a href={linkedIn.add} target="_blank" rel="noopener noreferrer" className="btn st-btn">
            {words.addToLinkedIn}
          </a>
          <a href={linkedIn.share} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            {words.shareOnLinkedIn}
          </a>
        </>
      ) : null}
      {pdf ? (
        <a href={pdf} className="btn btn-secondary" download data-pdf>
          {words.downloadPdf ?? "Download PDF"}
        </a>
      ) : null}
      <button type="button" className={linkedIn ? "btn btn-secondary" : "btn st-btn"} onClick={() => window.print()}>
        {words.print}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
          } catch {
            window.prompt(words.prompt, url);
          }
        }}
      >
        <span aria-live="polite">{copied ? words.copied : words.copy}</span>
      </button>
    </div>
  );
}
