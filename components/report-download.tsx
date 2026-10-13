"use client";

import { useState } from "react";

export function ReportDownload({ csv, filename, children }: { csv: string; filename: string; children?: React.ReactNode }) {
  const [error, setError] = useState(false);
  function download() {
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      setError(false);
      url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
    } catch {
      setError(true);
    } finally {
      link?.remove();
      // Keep the URL alive until the browser has started consuming the file.
      if (url) { const created = url; setTimeout(() => URL.revokeObjectURL(created), 1000); }
    }
  }
  return <div className="mt-3">
    <button type="button" className="btn btn-secondary btn-sm" onClick={download}>{children}</button>
    {error ? <p className="mt-1 text-xs text-danger" role="alert">The file could not be downloaded. Try again.</p> : null}
  </div>;
}
