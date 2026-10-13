"use client";

import { useState } from "react";
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

  async function save(field: CrmField, value: string) {
    if ((saved[field.id] ?? "") === value) return;
    try {
      const response = await fetch("/api/store/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "value", person, field: field.id, value }),
      });
      const answer = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (answer.ok) {
        setSaved((s) => ({ ...s, [field.id]: value }));
        toast(`${field.name} saved.`);
        return;
      }
      toast(answer.error === "value" ? `That is not a ${field.type === "number" ? "number" : field.type === "date" ? "date" : "value"} ${field.name} can keep.` : "That did not save. Try again in a moment.");
    } catch {
      toast("That did not save. Check your connection and try again.");
    }
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
