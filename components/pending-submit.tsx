"use client";

import { useState } from "react";

/**
 * A submit button that says it is working once pressed, for a plain HTML form
 * that posts to a route and leaves the page.
 *
 * On a slow phone the next page can take a few seconds to arrive, and a
 * button that looks the same after the tap gets tapped again. Here the tap
 * still submits the form the browser's own way — nothing is intercepted, and
 * without JavaScript it is an ordinary button — but the button shows a spinner
 * and the words of what is happening, and a second tap is ignored.
 */
export function PendingSubmit({ label, pending, className }: { label: string; pending: string; className: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="submit"
      className={className}
      aria-busy={busy}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        // Native validation can cancel a click before it submits. Keep the
        // button available so the person can correct a required field and retry.
        const button = event.currentTarget;
        if (button.form && !button.formNoValidate && !button.form.noValidate && !button.form.checkValidity()) return;
        // Set after the browser has taken the submit, so the form still sends.
        setTimeout(() => setBusy(true), 0);
      }}
    >
      {busy ? (
        <>
          <span className="spinner" aria-hidden="true" /> {pending}
        </>
      ) : (
        label
      )}
    </button>
  );
}
