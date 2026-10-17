import { readFunnelSetupResult } from "@/lib/funnel-setup-response";
import { done, is, part } from "./check";
async function main() {
  const page = { id: "abcdef0123", title: "Application" };
  const value = { ok: true, funnel: { id: "abcdef1234", on: false }, pages: [page] };
  part("Only complete disabled setup acknowledgements confirm creation");
  is("complete result provides exact links", readFunnelSetupResult(value, 1), { funnelId: value.funnel.id, pages: [page] });
  is("a product-only setup can confirm without new pages", readFunnelSetupResult({ ...value, pages: [] }, 0), { funnelId: value.funnel.id, pages: [] });
  for (const raw of [null, [], {}, { ...value, ok: false }, { ...value, ok: "true" }, { ...value, error: "form_draft" }, { ...value, funnel: null }, { ...value, funnel: { id: "invalid", on: false } }, { ...value, funnel: { id: value.funnel.id, on: true } }, { ...value, funnel: { id: value.funnel.id } }, { ...value, pages: null }, { ...value, pages: [] }, { ...value, pages: [null] }, { ...value, pages: [{ ...page, id: "bad" }] }, { ...value, pages: [{ ...page, title: " " }] }, { ...value, pages: [{ ...page, title: "x".repeat(201) }] }]) is("malformed or contradictory result retains uncertain recovery", readFunnelSetupResult(raw, 1), null);
  is("duplicate page references are refused", readFunnelSetupResult({ ...value, pages: [page, page] }, 2), null);
  is("unexpected extra pages cannot confirm this setup", readFunnelSetupResult({ ...value, pages: [page, { ...page, id: "abcdef0124" }] }, 1), null);
  for (const count of [-1, 1.5, 100, NaN]) is("unbounded expected page count is refused", readFunnelSetupResult(value, count), null);
  done();
}
void main();
