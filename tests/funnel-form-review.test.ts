import { readFunnelFormReviews } from "@/lib/funnel-form-review";
import { parseForm } from "@/lib/forms";
import type { Store } from "@/lib/store";
import type { PageFunnel } from "@/lib/page-funnel";
import { store as redis } from "./redis-stub";
import { is, done } from "./check";

async function main() {
  const page = { id: "page000001", title: "Application", slug: "apply", from: 0 };
  const store = { statsId: "chosen-store", sitePages: [page] } as unknown as Store;
  const funnel = { id: "funnel0001", steps: [{ kind: "page", id: page.id }] } as PageFunnel;
  const form = parseForm({ id: "form000001", name: "Application", fields: [{ id: "email0", type: "email", label: "Email", required: true }] })!;
  const block = (formId = form.id, id = "block00001") => ({ id, kind: "form", heading: "Apply", form: formId });
  const saved = (blocks: unknown[], variant?: unknown) => JSON.stringify({ blocks, ...(variant === undefined ? {} : { variant }) });
  let calls: (string | number)[][][] = [];
  let pageReply: unknown[] = [saved([block()])];
  let formReply: unknown[] = [[JSON.stringify(form)]];
  const pipeline = redis.pipeline;
  redis.pipeline = async commands => { calls.push(commands); return commands[0]?.[0] === "GET" ? pageReply : formReply; };
  const review = async (selected = [funnel], current = store) => { calls = []; return readFunnelFormReviews(current, selected); };
  try {
    is("confirmed selected form has no binding issue", (await review()).get(funnel.id), []);
    is("definitions use two batches at most", calls.length, 2);
    is("page reads preserve selected store", calls[0][0][1], "nl:product:page:chosen-store:site-page000001");
    is("form reads preserve selected store", calls[1][0].slice(0, 2), ["HMGET", "nl:forms:chosen-store"]);
    is("no answers are read", calls.flat().some(command => String(command[1]).includes("response")), false);
    await review([funnel, { ...funnel, id: "funnel0002" }]);
    is("shared pages are read once across funnels", calls[0].length, 1);
    is("shared form definitions are read once", calls[1][0].length, 3);
    pageReply = [saved([block("")])];
    const empty = (await review()).get(funnel.id)!;
    is("unselected form is an actionable issue", empty[0].code, "form");
    is("unselected form identifies page step", empty[0].stepIndex, 0);
    is("unselected forms need no definition read", calls.length, 1);
    pageReply = [saved([block()])]; formReply = [[null]];
    is("confirmed missing form is distinguished", (await review()).get(funnel.id)![0].detail.includes("no longer available"), true);
    for (const replies of [[], [null], [[]], [[undefined]], [["{"]], [[JSON.stringify({ ...form, id: "other00001" })]], [["x".repeat(65537)]]]) {
      formReply = replies;
      is("unconfirmed form remains unknown: " + JSON.stringify(replies).slice(0, 80), (await review()).get(funnel.id)![0].code, "forms_unknown");
    }
    formReply = [[JSON.stringify(form)]];
    pageReply = [saved([block()], { blocks: [block("", "block00002")] })];
    const variant = (await review()).get(funnel.id)!;
    is("version B form is reviewed independently", variant[0].title.endsWith("Version B"), true);
    is("variant issue does not claim version A is broken", variant.length, 1);
    for (const reply of [[], [null], ["{"], [saved([{ kind: "unknown", id: "block00001" }])], [saved([block()], "bad")]]) {
      pageReply = reply;
      is("incomplete or malformed page remains unknown", (await review()).get(funnel.id)![0].code, "forms_unknown");
    }
    pageReply = [saved([{ id: "block00001", kind: "text", heading: "Hello", body: "Welcome" }])];
    is("page without form blocks needs no form lookup", (await review()).get(funnel.id), []);
    is("no form lookup for page without forms", calls.length, 1);
    const hidden = { ...store, sitePages: [{ ...page, from: -1 }] } as Store;
    is("hidden page is left to existing visibility review", (await review([funnel], hidden)).get(funnel.id), []);
    is("hidden-only journey needs no definition reads", calls.length, 0);
    is("empty funnel collection needs no reads", (await review([])).size, 0);
    is("empty collection skips storage", calls.length, 0);
    const over = Array.from({ length: 11 }, (_, index) => ({ ...funnel, id: "over" + index }));
    is("oversized inventory stays unknown", (await review(over)).get("over0")![0].code, "forms_unknown");
    is("oversized inventory makes no reads", calls.length, 0);
    pageReply = [saved(Array.from({ length: 21 }, (_, index) => block("form" + String(index).padStart(6, "0"), "block" + String(index).padStart(5, "0"))))];
    formReply = [Array(20).fill(null)];
    const bounded = (await review()).get(funnel.id)!;
    is("definition lookup respects existing form capacity", calls[1][0].length, 22);
    is("unread excess references remain explicitly unknown", bounded.some(issue => issue.code === "forms_unknown" && issue.detail.includes("20 different forms")), true);
    redis.pipeline = async () => { throw new Error("outage"); };
    is("page storage outage is not clean readiness", (await review()).get(funnel.id)![0].code, "forms_unknown");
  } finally { redis.pipeline = pipeline; }
  done();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
