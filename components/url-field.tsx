"use client";

import { useState } from "react";
import { linkOnLeave } from "@/lib/url-check";

/**
 * A web address field that says what is wrong when the person leaves it
 * (487 [IT4], pattern 1; lib/url-check.ts), never while they are still
 * typing, and offers the address with https:// in one press when that is all
 * it lacks. The message goes as soon as the address is right. The save still
 * checks it on the server; this only says so sooner.
 *
 * The label is the caller's, tied by `id`, so it stays visible.
 */
export function UrlField({
  id,
  value,
  onChange,
  className,
  placeholder = "https://",
  maxLength = 2000,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  className: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const [left, setLeft] = useState(false);
  const shown = left ? linkOnLeave(value) : { problem: null, fix: null };
  const line = `${id}-check`;
  const fix = shown.fix;
  return (
    <>
      <input
        id={id}
        className={className}
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setLeft(true)}
        aria-invalid={shown.problem ? true : undefined}
        aria-describedby={shown.problem ? line : undefined}
      />
      <div id={line} role="status" className="text-sm">
        {shown.problem ? (
          <p className="mt-1 font-semibold text-danger">
            {shown.problem}
            {fix ? (
              <>
                {" "}
                <button type="button" className="inline-flex min-h-11 items-center font-bold text-ink underline underline-offset-4" onClick={() => onChange(fix)}>
                  {`Use ${fix}`}
                </button>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </>
  );
}
