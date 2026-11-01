"use client";

import { useId, useState } from "react";
import { PREVIEW_LEAVES_OUT, previewLine, previewSpaces } from "@/lib/community-gate";

/**
 * "Which spaces a member sees" (399 [SL3], unit 2; added 1 November 2026):
 * the creator picks products, and the studio says which spaces a member
 * holding exactly those would see, by the rule the real gate uses
 * (lib/community-gate.ts). Worked out here from the community the studio
 * already has: no buyer is read, no route is called, nothing is changed and
 * nobody is told. Shown only when some space is kept for some products.
 */
export function MemberPreview({
  spaces,
  access,
  open,
}: {
  spaces: { id: string; name: string; only: string[] }[];
  access: string[];
  open: { id: string; title: string }[];
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const help = useId();
  if (!open.length || !spaces.some((space) => space.only.length)) return null;
  const shown = previewSpaces(spaces, access, chosen).map((space) => space.name);
  return (
    <section className="mt-6 rounded-[var(--r-md)] bg-paper p-4" aria-labelledby={`${help}-title`}>
      <h3 id={`${help}-title`} className="font-semibold text-ink">Which spaces a member sees</h3>
      <p id={help} className="mt-1 text-sm text-ink-soft">{PREVIEW_LEAVES_OUT}</p>
      <fieldset className="mt-3" aria-describedby={help}>
        <legend className="field-label">A member who bought</legend>
        <div className="mt-2 space-y-1.5">
          {open.map((product) => (
            <label key={product.id} className="flex min-h-11 items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0"
                checked={chosen.includes(product.id)}
                onChange={(e) => setChosen((now) => (e.target.checked ? [...now, product.id] : now.filter((id) => id !== product.id)))}
              />
              <span className="min-w-0 break-words">{product.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-3 text-sm text-ink" aria-live="polite">{previewLine(shown, spaces.length)}</p>
    </section>
  );
}
