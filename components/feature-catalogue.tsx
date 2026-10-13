"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icons";

export type CatalogueItem = {
  slug: string;
  label: string;
  description: string;
  icon: IconName;
  group: string;
  plan: string;
  status: "live" | "building" | "proof";
  statusLabel: string;
};

export type CatalogueGroup = { key: string; title: string; line: string };

const STATUS_CLASS = {
  live: "tag tag-live",
  building: "tag tag-next",
  proof: "tag",
} as const;

/**
 * Every feature on one page, narrowed by the thing a creator came to do.
 *
 * Twenty cards in five headed blocks is a catalogue you scroll past; the same
 * twenty with a filter on top is a catalogue you use. The filter hides
 * nothing permanently — "All" is the state the page opens in, and every card
 * is in the HTML either way, so search engines and a browser without
 * JavaScript still see the whole list.
 */
export function FeatureCatalogue({
  items,
  groups,
}: {
  items: CatalogueItem[];
  groups: CatalogueGroup[];
}) {
  const [group, setGroup] = useState<string>("all");
  const shown = group === "all" ? items : items.filter((i) => i.group === group);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="seg max-w-full overflow-x-auto" role="group" aria-label="Filter the features">
          <button
            type="button"
            className="seg-item"
            aria-pressed={group === "all"}
            onClick={() => setGroup("all")}
          >
            All
            <span className="text-[0.8125rem] font-semibold opacity-70">{items.length}</span>
          </button>
          {groups.map((g) => {
            const n = items.filter((i) => i.group === g.key).length;
            if (n === 0) return null;
            return (
              <button
                key={g.key}
                type="button"
                className="seg-item"
                aria-pressed={group === g.key}
                onClick={() => setGroup(g.key)}
              >
                {g.title}
                <span className="text-[0.8125rem] font-semibold opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-ink-mute" aria-live="polite">
          {group === "all"
            ? `${items.length} features, each with its own page`
            : groups.find((g) => g.key === group)?.line}
        </p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/platform/${p.slug}`}
              className="card card-hover group flex h-full flex-col p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="icon-tile">
                  <Icon name={p.icon} size={22} />
                </span>
                <span className="flex flex-wrap justify-end gap-1.5">
                  <span className={STATUS_CLASS[p.status]}>{p.statusLabel}</span>
                </span>
              </span>
              <span className="mt-5 block text-[1.125rem] font-semibold text-ink">{p.label}</span>
              <span className="mt-1.5 block flex-1 text-[0.9375rem] text-ink-soft">{p.description}</span>
              <span className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-[0.8125rem] font-medium text-ink-mute">{p.plan}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-deep">
                  How it works
                  <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
