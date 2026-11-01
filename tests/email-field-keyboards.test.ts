/**
 * The right keyboard and autofill on every email field (487 [IT4], item 2;
 * added 1 November 2026; docs/ease-patterns-audit.md).
 *
 * An email field opens the email keyboard by its type. What it may fill in
 * by itself depends on whose address it is: the person's own address takes
 * autocomplete="email" (or "username" where it signs in), and someone
 * else's address (a deal's contact, who a store moves to, someone on the
 * list) takes "off", so the browser never offers the creator's own address
 * there. Every <input type="email"> in the app says which it is.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { done, is } from "./check";

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (path.endsWith(".tsx")) out.push(path);
  }
  return out;
};

// Held by another open PR (Codex, #1502) on 1 November 2026: its "Move to" field is fixed when that file is free.
const WAITING = new Set(["app/studio/page.tsx"]);

const missing: string[] = [];
let fields = 0;
for (const file of [...walk("app"), ...walk("components")]) {
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/<input\b[^>]*?type="email"[^>]*?\/?>/gs)) {
    fields += 1;
    if (/autoComplete=/.test(m[0]) || WAITING.has(file)) continue;
    missing.push(`${file}:${source.slice(0, m.index).split("\n").length}`);
  }
}
is("there are email fields to check", fields > 10, true);
is("every email field says whose address it is (autocomplete)", missing, []);
is("someone else's address never offers the creator's own", ["components/form-response-deal.tsx", "components/deals-board.tsx", "components/workflow-tools.tsx"].every((f) => /type="email" autoComplete="off"/.test(readFileSync(f, "utf8"))), true);
done();
