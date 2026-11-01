/**
 * The right keyboard and autofill on every email field (487 [IT4], item 2;
 * added 1 November 2026; docs/ease-patterns-audit.md).
 *
 * An email field opens the email keyboard by its type. What it may fill in
 * by itself depends on whose address it is: the person's own address takes
 * autocomplete="email", and someone else's address (a deal's contact, who a
 * store moves to, someone on the list) takes "off", so the browser is not
 * asked to offer the creator's own address there. Every email <input>, and
 * every <EmailField> (whose own default is "email"), says which it is.
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

/** Each tag of these names, whole: braces counted, so an arrow's "=>" inside it never ends it. */
function tags(source: string, name: string): { tag: string; line: number }[] {
  const out: { tag: string; line: number }[] = [];
  for (const m of source.matchAll(new RegExp(`<${name}\\b`, "g"))) {
    let depth = 0;
    let i = m.index ?? 0;
    for (; i < source.length; i += 1) {
      const c = source[i];
      if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
      else if (c === ">" && depth === 0) break;
    }
    out.push({ tag: source.slice(m.index, i + 1), line: source.slice(0, m.index).split("\n").length });
  }
  return out;
}

const isEmail = (tag: string) => /\btype=(?:"email"|'email'|\{[^}]*["']email["'][^}]*\})/.test(tag);

// Held by another open PR (Codex, #1502) on 1 November 2026: only its "Move to" field (name="email") waits.
const waiting = (file: string, tag: string) => file === "app/studio/page.tsx" && /name="email"/.test(tag);

const missing: string[] = [];
let inputs = 0;
let components = 0;
let waited = 0;
for (const file of [...walk("app"), ...walk("components")]) {
  const source = readFileSync(file, "utf8");
  for (const { tag, line } of tags(source, "input")) {
    if (!isEmail(tag)) continue;
    inputs += 1;
    if (/\bautoComplete=/.test(tag)) continue;
    if (waiting(file, tag)) waited += 1;
    else missing.push(`${file}:${line}`);
  }
  if (file === "components/email-field.tsx") continue;
  for (const { tag, line } of tags(source, "EmailField")) {
    components += 1;
    if (!/\bautoComplete=/.test(tag)) missing.push(`${file}:${line} (EmailField)`);
  }
}
is("the email fields the audit counted: 25 inputs (two with a type chosen in code) and 17 EmailFields", [inputs, components], [25, 17]);
is("every one says whose address it is (autocomplete)", missing, []);
is("only the one field held by the other PR waits", waited, 1);
is("someone else's address is not offered the creator's own", ["components/form-response-deal.tsx", "components/deals-board.tsx", "components/workflow-tools.tsx"].every((f) => /type="email" autoComplete="off"/.test(readFileSync(f, "utf8"))), true);
done();
