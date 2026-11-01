/**
 * A blog post written and not saved is never lost to a click away
 * (487 [IT4], item 6; added 1 November 2026; docs/ease-patterns-audit.md).
 */
import { readFileSync } from "node:fs";
import { done, is } from "./check";

const editor = readFileSync("components/blog-editor.tsx", "utf8");
is("the blog editor uses the leave guard", editor.includes('import { useLeaveGuard } from "@/components/leave-guard";') && editor.includes("useLeaveGuard(dirty && !done);"), true);
is("unsaved means the title, the text or the product differ from the saved post", editor.includes('const dirty = title !== post.title || body !== post.body || product !== (post.product ?? "");'), true);
is("a save or a delete lets the page go without asking", (editor.match(/setDone\(true\);/g) ?? []).length, 2);
is("and once the saved post comes back, its changes are guarded again", /if \(seen !== post\) \{\s*setSeen\(post\);\s*setDone\(false\);/.test(editor), true);
const faq = readFileSync("components/faq-editor.tsx", "utf8");
is("the FAQ editor asks too, with its own measure of unsaved answers", faq.includes("useLeaveGuard(changed && !saving);") && faq.includes("const changed = JSON.stringify(rows.map"), true);
done();
