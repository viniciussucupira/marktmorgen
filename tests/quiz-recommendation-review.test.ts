import { readFunnelFormReviews } from "@/lib/funnel-form-review";
import { parseForm } from "@/lib/forms";
import { KIND } from "@/lib/catalog";
import type { Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { store as redis } from "./redis-stub";
import { is, done } from "./check";

async function main() {
  const page = { id: "page000001", title: "Find your course", slug: "quiz", from: 0 };
  const base = { statsId: "chosen-store", sitePages: [page], catalog: { items: [{ id: "product001", kind: KIND.paid }] } } as unknown as Store;
  const funnel = { id: "funnel0001", steps: [{ kind: "page", id: page.id }] } as PageFunnel;
  const form = parseForm({ id: "form000001", name: "Course quiz", fields: [{ id: "email0", type: "email", label: "Email" }], outcomes: [{ id: "result", title: "Your course", product: "product001" }] })!;
  const block = (formId = form.id, heading = "Quiz", id = "block00001") => ({ id, kind: "form", heading, form: formId });
  let pageValue = JSON.stringify({ blocks: [block()] });
  let formValues: unknown[] = [JSON.stringify(form)];
  let commands: (string | number)[][][] = [];
  const pipeline = redis.pipeline;
  redis.pipeline = async batch => { commands.push(batch); return batch[0][0] === "GET" ? [pageValue] : [formValues]; };
  const review = async (store = base) => { commands = []; return (await readFunnelFormReviews(store, [funnel])).get(funnel.id)!; };
  try {
    is("existing published recommendation passes presence check", await review(), []);
    is("quiz review adds no lookup batch", commands.length, 2);
    is("recommendations do not trigger product reads", commands.flat().some(command => String(command[1]).includes("listing")), false);
    const removed = { ...base, catalog: { items: [] } } as unknown as Store;
    const missing = await review(removed);
    is("missing recommended product is reported", missing[0].code, "quiz_product");
    is("finding identifies the actual form", missing[0].formId, form.id);
    is("finding identifies quiz result", missing[0].title.includes("Your course"), true);
    const draft = { ...base, catalog: { items: [{ id: "product001", kind: KIND.paid | KIND.hidden }] } } as unknown as Store;
    is("draft recommendation is reported", (await review(draft))[0].detail.includes("draft"), true);
    const unknown = { ...base, catalog: undefined } as unknown as Store;
    is("missing catalog data is unknown, not deleted", (await review(unknown))[0].code, "quiz_unknown");
    for (const kind of [-1, NaN, 2 ** 40]) {
      const corrupt = { ...base, catalog: { items: [{ id: "product001", kind }] } } as unknown as Store;
      is("invalid indexed kind remains unknown", (await review(corrupt))[0].code, "quiz_unknown");
    }
    const duplicate = { ...base, catalog: { items: [{ id: "product001", kind: KIND.paid }, { id: "product001", kind: KIND.hidden }] } } as unknown as Store;
    is("ambiguous catalog identity remains unknown", (await review(duplicate))[0].code, "quiz_unknown");
    formValues = [JSON.stringify({ ...form, outcomes: [{ ...form.outcomes[0], product: "" }] })];
    is("an optional recommendation is not required", await review(unknown), []);
    formValues = [JSON.stringify(form)];
    pageValue = JSON.stringify({ blocks: [block(), block(form.id, "Repeated", "block00002")] });
    is("repeated blocks do not duplicate quiz finding", (await review(removed)).length, 1);
    pageValue = JSON.stringify({ blocks: [block()], variant: { blocks: [block(form.id, "Alternate", "block00002")] } });
    const variants = await review(removed);
    is("both saved variants are checked", variants.some(issue => issue.title.includes("Version A")) && variants.some(issue => issue.title.includes("Version B")), true);
    is("variant review still shares form lookup", commands[1][0].length, 3);
    pageValue = JSON.stringify({ blocks: [block()] }); formValues = [undefined];
    const unavailable = await review(removed);
    is("unread form never produces a product deletion finding", unavailable.some(issue => issue.code === "quiz_product"), false);
    const outcomes = Array.from({ length: 6 }, (_, index) => ({ id: "out00" + index, title: "Result " + index, body: "", product: "missing001" }));
    const second = { ...form, id: "form000002", outcomes };
    pageValue = JSON.stringify({ blocks: [block(), block(second.id, "Other quiz", "block00002")] });
    formValues = [JSON.stringify({ ...form, outcomes }), JSON.stringify(second)];
    const many = await review(removed);
    is("displayed findings remain bounded", many.length, 9);
    is("additional findings are explicitly disclosed", many[8].detail.includes("4 additional quiz findings"), true);
    is("overflow still links to a real affected form", many[8].formId, second.id);
  } finally { redis.pipeline = pipeline; }
  done();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
