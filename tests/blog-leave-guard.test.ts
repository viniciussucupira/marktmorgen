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
is("and once the saved post comes back, its changes are guarded again", /if \(seen !== post\) \{\s*setSeen\(post\);[\s\S]{0,400}?setDone\(false\);\s*\}/.test(editor), true);
const faq = readFileSync("components/faq-editor.tsx", "utf8");
is("after a save, the editor takes the post as the server kept it, so a tidied space never reads as unsaved", /if \(done\) \{\s*setTitle\(post\.title\);\s*setBody\(post\.body\);\s*setProduct\(post\.product \?\? ""\);/.test(editor), true);
is("the FAQ editor asks too, with its own measure of unsaved answers", faq.includes("useLeaveGuard(changed && !saving);") && faq.includes("const changed = JSON.stringify(rows.map"), true);
is("and takes its rows as they were saved", faq.includes("setRows(expected.map((item, key) => ({ ...item, key })));"), true);
done();
