import { copyOf } from "@/lib/mail-reuse";
import { confirmedMailCopy } from "@/lib/mail-response";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  const id = "111111111111111111111111";
  const key = "nl:mail:bc:" + id;
  const store = { listId: "copy-audience" } as Store;
  const base = { id, listId: store.listId, subject: "Original", body: "Original text", productId: "included", who: "all", notProductId: null, narrow: null };
  const filters = [null, { minSpent: 2550, channel: "newsletter", quietDays: 30 }, { minSpent: 100000000, channel: "", quietDays: 365 }];
  part("Storage to confirmed copy keeps every audience restriction");
  for (const who of ["all", "buyers", "leads"]) for (const notProductId of [null, "excluded"]) for (const narrow of filters) {
    const record = { ...base, who, notProductId, narrow };
    await redis.pipeline([["SET", key, JSON.stringify(record)]]);
    const expected = { subject: base.subject, body: base.body, productId: base.productId, who, notProductId, narrow };
    const copy = await copyOf(store, id);
    is("server copy retains all restrictions", copy, expected);
    is("client confirmation retains all restrictions", confirmedMailCopy({ ok: true, copy }), expected);
    is("copying does not alter the saved campaign", (await redis.pipeline([["GET", key]]))[0], JSON.stringify(record));
  }
  part("Incomplete audience data never replaces a current draft");
  const valid = { subject: "Original", body: "Original text", productId: null, who: "leads", notProductId: "excluded", narrow: filters[1] };
  for (const changed of [{ notProductId: undefined }, { notProductId: "" }, { notProductId: [] }, { notProductId: 1 }, { narrow: undefined }, { narrow: [] }, { narrow: "filter" }, { narrow: {} }, { narrow: { ...filters[1], minSpent: "2550" } }, { narrow: { ...filters[1], minSpent: -1 } }, { narrow: { ...filters[1], minSpent: 2550.5 } }, { narrow: { ...filters[1], minSpent: 100000001 } }, { narrow: { ...filters[1], channel: " Newsletter " } }, { narrow: { ...filters[1], channel: "invalid channel" } }, { narrow: { ...filters[1], quietDays: 31 } }, { narrow: { ...filters[1], quietDays: "30" } }]) {
    is("missing or malformed restrictions refuse the copy", confirmedMailCopy({ ok: true, copy: { ...valid, ...changed } }), null);
  }
  for (const field of ["minSpent", "channel", "quietDays"]) {
    const incomplete: Record<string, unknown> = { ...filters[1] };
    delete incomplete[field];
    is("every narrowing field is required", confirmedMailCopy({ ok: true, copy: { ...valid, narrow: incomplete } }), null);
  }
  part("Legacy defaults and ownership stay safe");
  await redis.pipeline([["SET", key, JSON.stringify({ ...base, notProductId: undefined, narrow: undefined, who: undefined })]]);
  is("legacy campaigns explicitly confirm no additional filters", await copyOf(store, id), { subject: base.subject, body: base.body, productId: base.productId, who: "all", notProductId: null, narrow: null });
  is("other stores cannot copy the campaign", await copyOf({ ...store, listId: "foreign" }, id), null);
  await redis.pipeline([["SET", key, JSON.stringify({ ...base, id: "222222222222222222222222" })]]);
  is("a mismatched stored identity cannot be copied", await copyOf(store, id), null);
  is("an invalid requested identity cannot be copied", await copyOf(store, "bad"), null);
  done();
}
void main();
