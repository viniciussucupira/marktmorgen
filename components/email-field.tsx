"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EmailSuggestion } from "@/components/email-suggestion";
import { holdForSuggestion } from "@/lib/email-typo";

/**
 * An email field with the "Did you mean …?" line under it (308 [TC1],
 * components/email-suggestion.tsx), for the plain forms of the store pages:
 * it posts what is in it, as the input it replaces did, and keeps its own
 * value only so the suggestion can be offered and used.
 *
 * Pressing send takes the focus off the field and sends at once, so a slip
 * would never be seen there: the first send with a likely slip is held, once,
 * to show the line (holdForSuggestion); sending again sends what was typed,
 * unchanged. Nothing else ever stops the form.
 *
 * `wrapClassName` sizes the field and its line together where the field sat
 * in a row beside a button (for example "min-w-0 flex-1").
 */
export function EmailField({
  id,
  name,
  className,
  wrapClassName,
  language = "en",
  required,
  placeholder,
  autoComplete = "email",
  describedBy,
  defaultValue = "",
  store = true,
}: {
  id?: string;
  name: string;
  className: string;
  wrapClassName?: string;
  language?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  describedBy?: string;
  defaultValue?: string;
  /** The store's own look (st-*) rather than the site's. */
  store?: boolean;
}) {
  const made = useId();
  const field = id ?? `email-${made.replace(/[^A-Za-z0-9_-]/g, "")}`;
  const line = `${field}-suggestion`;
  const [value, setValue] = useState(defaultValue);
  const [left, setLeft] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const shown = useRef("");
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onSubmit = (event: SubmitEvent) => {
      const typed = input.current?.value ?? "";
      if (!holdForSuggestion(typed, shown.current)) return;
      event.preventDefault();
      shown.current = typed;
      setLeft(true);
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);
  return (
    <div className={wrapClassName}>
      <input
        ref={input}
        id={field}
        name={name}
        type="email"
        required={required}
        maxLength={254}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setLeft(true)}
        onInvalid={() => setLeft(true)}
        aria-describedby={describedBy ? `${describedBy} ${line}` : line}
        className={className}
      />
      <EmailSuggestion id={line} inputId={field} value={value} show={left} onUse={setValue} language={language} store={store} />
    </div>
  );
}
