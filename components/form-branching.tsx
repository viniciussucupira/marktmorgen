"use client";

import { useEffect, useRef } from "react";
import { type FormDef, pathOf } from "@/lib/forms";

/**
 * Shows only the questions a person's answers lead to (lib/forms.ts, pathOf),
 * as they answer: a skipped question is hidden and its inputs switched off,
 * so the browser neither asks for nor sends it. Without JavaScript every
 * question shows, and the server applies the same rule to what arrives.
 */
export function FormBranching({ form }: { form: Pick<FormDef, "fields" | "outcomes"> & { id: string } }) {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = mark.current?.closest("form");
    if (!el) return;
    const apply = () => {
      const data = new FormData(el);
      const shown = new Set(pathOf(form as FormDef, (id) => String(data.get(`q_${id}`) ?? "") || undefined).map((f) => f.id));
      for (const field of form.fields) {
        const box = el.querySelector<HTMLElement>(`[data-field="${field.id}"]`);
        if (!box) continue;
        const on = shown.has(field.id);
        box.hidden = !on;
        box.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((input) => {
          input.disabled = !on;
        });
      }
    };
    apply();
    el.addEventListener("change", apply);
    return () => el.removeEventListener("change", apply);
  }, [form]);
  return <span ref={mark} hidden />;
}
