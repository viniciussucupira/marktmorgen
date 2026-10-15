"use client";

import { useState } from "react";

export type ReportCsv = string | (() => string);

/** Resolve the current report only on demand and release browser download resources. */
export function downloadReportFile(csv:ReportCsv,filename:string) {
  let url:string|undefined;
  let link:HTMLAnchorElement|undefined;
  try {
    const contents=typeof csv==="function"?csv():csv;
    url=URL.createObjectURL(new Blob([contents],{type:"text/csv;charset=utf-8"}));
    link=document.createElement("a");
    link.href=url;
    link.download=filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link?.remove();
    // Keep the URL alive until the browser has started consuming the file.
    if(url){const created=url;setTimeout(()=>URL.revokeObjectURL(created),1000);}
  }
}

export function ReportDownload({ csv, filename, children }: { csv: ReportCsv; filename: string; children?: React.ReactNode }) {
  const [error, setError] = useState(false);
  function download() {
    try {
      setError(false);
      downloadReportFile(csv,filename);
    } catch {
      setError(true);
    }
  }
  return <div className="mt-3">
    <button type="button" className="btn btn-secondary btn-sm" onClick={download}>{children}</button>
    {error ? <p className="mt-1 text-xs text-danger" role="alert">The file could not be downloaded. Try again.</p> : null}
  </div>;
}
