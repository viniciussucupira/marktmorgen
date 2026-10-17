import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FunnelSharingReview } from "@/components/funnel-sharing-review";
import { is, done } from "./check";
const show = (change: Partial<Parameters<typeof FunnelSharingReview>[0]> = {}) => renderToStaticMarkup(createElement(FunnelSharingReview, {
  issues: [], editors: [], locked: false, settingsDisabled: false, onSettings() {}, onNavigate() {}, ...change,
}));
const clean = show();
is("review includes manual verification scope", clean.includes("Test form submissions, consent, each offer, checkout and delivery as a customer"), true);
is("no-issue state does not certify customer journey", clean.includes("A successful customer journey still needs to be tested"), true);
const paymentIssue = { code: "payments" as const, title: "Payments unavailable", detail: "The owner should review payments." };
const owner = show({ issues: [paymentIssue], paymentReview: { available: false, paymentsHref: "/studio?store=chosen#stripe", billingHref: "/studio?store=chosen#billing" } });
is("owner actions preserve selected store", owner.includes('href="/studio?store=chosen#stripe"') && owner.includes('href="/studio?store=chosen#billing"'), true);
const editor = show({ issues: [paymentIssue], paymentReview: { available: false, paymentsHref: null, billingHref: null } });
is("unauthorized role has no financial navigation", editor.includes('href='), false);
const step = show({ issues: [{ code: "step", title: "<script>unsafe</script>", detail: "Kept back", stepIndex: 0 }], editors: [{ href: "/studio/site?store=chosen&page=page1", label: "Edit page" }] });
is("blocked step links to its real editor", step.includes("page=page1") && step.includes("Edit page"), true);
is("untrusted titles stay escaped", step.includes("&lt;script&gt;unsafe&lt;/script&gt;") && !step.includes("<script>unsafe"), true);
const locked = show({ issues: [{ code: "step", title: "Page", detail: "Kept back", stepIndex: 0 }], editors: [{ href: "/studio/site", label: "Edit page" }], locked: true });
is("save recovery removes links from keyboard navigation", locked.includes('aria-disabled="true"') && locked.includes('tabindex="-1"'), true);
const missing = show({ issues: [{ code: "step", title: "Deleted page", detail: "Deleted", stepIndex: 0 }], settingsDisabled: true });
is("missing editor falls back to disabled settings action while drafting", /disabled=""[^>]*>Review the step in settings/.test(missing), true);
done();
