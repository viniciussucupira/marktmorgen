/**
 * A sales page kept from visitors while it is worked on (lib/sales-page.ts,
 * hidden, livePage). Checked: it is kept only when asked for in so many
 * words; visitors get no blocks, title or description from it; and the
 * product page, the answer box, a page test's counting and the page
 * after a free sign-up all go by it.
 */
import { readFileSync } from "node:fs";
import { livePage, pageShown, parsePage } from "@/lib/sales-page";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  part("What a page keeps");
  const page = (hidden: unknown) => parsePage({ blocks: [{ id: "text0001", kind: "text", heading: "Why", body: "Because." }], seoTitle: "Draft title", hidden });
  is("hidden only when said so", [page(true).hidden, page("yes").hidden, page(undefined).hidden], [true, false, false]);
  part("What visitors are shown");
  is("a hidden page: no blocks, no title of its own", [livePage(page(true)).blocks.length, livePage(page(true)).seoTitle], [0, ""]);
  is("a shown one, as it is", livePage(page(false)).blocks.length, 1);
  part("Shown by itself at a moment");
  const at = 1_900_000_000;
  const timed = parsePage({ blocks: [{ id: "text0001", kind: "text", heading: "Why", body: "Because." }], hidden: true, showFrom: at });
  is("hidden before it", [pageShown(timed, at - 1), livePage(timed, at - 1).blocks.length], [false, 0]);
  is("shown from it, with nobody switching it on", [pageShown(timed, at), livePage(timed, at).blocks.length], [true, 1]);
  is("a moment only on a hidden page", parsePage({ blocks: [], hidden: false, showFrom: at }).showFrom, 0);
  is("and only a moment a clock can hold", [parsePage({ blocks: [], hidden: true, showFrom: "soon" }).showFrom, parsePage({ blocks: [], hidden: true, showFrom: 12 }).showFrom], [0, 0]);

  part("Everything that reads the page goes by it");
  is("the product page", readFileSync("app/[handle]/p/[product]/page.tsx", "utf8").includes("livePage(page, saleClock())"), true);
  is("the answer box", readFileSync("app/api/store/ask/route.ts", "utf8").includes("pageShown(page) ? page : null"), true);
  is("a page test's counting", readFileSync("app/api/store/checkout/route.ts", "utf8").includes("if (page && test && pageShown(page))"), true);
  is("the page after a free sign-up", readFileSync("app/[handle]/free/page.tsx", "utf8").includes("page?.next && pageShown(page)"), true);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
