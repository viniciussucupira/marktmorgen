"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { FunnelLaunchIssue } from "@/lib/funnel-launch-review";
import type { FunnelStepEditorLink } from "@/lib/funnel-editor-links";

export type FunnelPaymentReview = { available: boolean; paymentsHref: string | null; billingHref: string | null };

/** A read-only checklist, with navigation controlled by the editor's existing save guards. */
export function FunnelSharingReview({ issues, editors, paymentReview, locked, settingsDisabled, onSettings, onNavigate }: {
  issues: readonly FunnelLaunchIssue[];
  editors: readonly (FunnelStepEditorLink | null | undefined)[];
  paymentReview?: FunnelPaymentReview;
  locked: boolean;
  settingsDisabled: boolean;
  onSettings: () => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
              <details className="mt-4 rounded-xl border border-line p-3">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">
                  {issues.length ? `Before sharing: ${issues.length} item${issues.length === 1 ? "" : "s"} to review` : "Review before sharing"}
                </summary>
                <p className="mt-2 text-xs text-ink-soft">
                  Saved visibility and store payment availability only. Test forms, consent, each offer, checkout and delivery as a customer. These checks do not verify them or change publication settings.
                </p>
                {issues.length ? (
                  <ul className="mt-3 space-y-3">
                    {issues.map((issue, index) => {
                      const editor = issue.stepIndex === undefined ? null : editors[issue.stepIndex];
                      return (
                        <li key={`${issue.code}-${index}`} className="text-sm">
                          <p className="font-semibold text-ink">{issue.title}</p>
                          <p className="mt-1 text-ink-soft">{issue.detail}</p>
                          {issue.code === "disabled" || issue.code === "empty" ? (
                            <button type="button" className="btn btn-ghost mt-1 min-h-11" disabled={settingsDisabled} onClick={onSettings}>Review funnel settings</button>
                          ) : editor ? (
                            <Link href={editor.href} prefetch={false} aria-label={`${editor.label}: ${issue.title}`} aria-disabled={locked} tabIndex={locked ? -1 : undefined} onClick={onNavigate} className="mt-1 inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4 aria-disabled:opacity-40">{editor.label}</Link>
                          ) : issue.code === "step" ? (
                            <button type="button" className="btn btn-ghost mt-1 min-h-11" disabled={settingsDisabled} onClick={onSettings}>Review the step in settings</button>
                          ) : issue.code === "payments" || issue.code === "payments_unknown" ? (
                            <div className="mt-1 flex flex-wrap gap-3">
                              {[{ href: paymentReview?.paymentsHref, label: "Review payments" }, { href: paymentReview?.billingHref, label: "Review store plan" }].map(action => action.href ? (
                                <Link key={action.label} href={action.href} prefetch={false} aria-disabled={locked} tabIndex={locked ? -1 : undefined} onClick={onNavigate} className="inline-flex min-h-11 items-center font-semibold text-violet-deep underline underline-offset-4 aria-disabled:opacity-40">{action.label}</Link>
                              ) : null)}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="mt-3 text-sm text-ink-soft">No issues found in these saved checks. A successful customer journey still needs to be tested.</p>}
              </details>
  );
}
