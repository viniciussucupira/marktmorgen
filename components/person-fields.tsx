"use client";

import { useRef, useState } from "react";
import { crmAnswer } from "@/lib/crm-response";
import { toast } from "@/components/toast";
import { type CrmField, MAX_FIELD_VALUE } from "@/lib/crm-rules";

/**
 * The store's own fields for one person (lib/crm-rules.ts), each saved as
 * soon as it is changed and left: their company, a date, which offer
 * interests them. Seen only by whoever may read orders.
 */
export function PersonFields({ person, fields, initial }: { person: string; fields: CrmField[]; initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);

  const writing = useRef(false);
  const uncertain = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function save(field: CrmField, value: string) {
    if (writing.current || uncertain.current) return;
    if ((saved[field.id] ?? "") === value) return;
    writing.current = true;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/store/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "value", person, field: field.id, value }),
      });
      const answer = crmAnswer(response.ok, await response.json().catch(() => null));
      if (answer.ok) {
        setSaved((s) => ({ ...s, [field.id]: value }));
        toast(`${field.name} saved.`);
        return;
      }
      if (answer.error === "crm_write_unconfirmed") {
        uncertain.current = true;
        setMessage("This change could not be confirmed and may already be saved. Keep a copy of your values, then reload and check the contact before trying again. Saving is paused until you reload.");
      } else {
        setMessage(answer.error === "value" ? "This field cannot keep that value. Your entry is still here; correct it and try again." : "This change was refused. Your entry is still here; check your access and try again.");
      }
    } catch {
      uncertain.current = true;
      setMessage("The connection ended before this change could be confirmed. Keep a copy of your values, then reload and check the contact before trying again. Saving is paused until you reload.");
    } finally {
      writing.current = false;
      setPending(false);
    }
  }

  return (
    <div className="mt-4">
      {message ? <p className="notice notice-warn mb-4" role="status">{message}</p> : null}
      {pending ? <p role="status" className="mb-2 text-sm">Saving contact field…</p> : null}
      <fieldset disabled={pending} aria-busy={pending} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Contact fields</legend>
      {fields.map((field) => {
        const id = `pf-${field.id}`;
        const value = values[field.id] ?? "";
        const change = (next: string) => setValues((v) => ({ ...v, [field.id]: next }));
        return (
          <label key={field.id} htmlFor={id} className="block">
            <span className="field-label">{field.name}</span>
            {field.type === "choice" ? (
              <select
                id={id}
                className="field mt-2"
                value={value}
                onChange={(e) => {
                  change(e.target.value);
                  void save(field, e.target.value);
                }}
              >
                <option value="">Not set</option>
                {field.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                className="field mt-2"
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                inputMode={field.type === "number" ? "decimal" : undefined}
                maxLength={MAX_FIELD_VALUE}
                value={value}
                onChange={(e) => change(e.target.value)}
                onBlur={(e) => void save(field, e.target.value)}
              />
            )}
          </label>
        );
      })}
      </fieldset>
    </div>
  );
}
