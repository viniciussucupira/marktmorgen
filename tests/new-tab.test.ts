/**
 * A link that opens a new tab says so, in the store's language (WCAG G201).
 *
 * The words are written twice: in lib/new-tab-words.ts, for a link drawn with
 * its store's language in hand, and in app/globals.css, as generated content
 * for a link drawn without it. These hold the two copies to each other, and
 * hold every link in the code that opens a new tab to carrying the note.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { newTabWords } from "@/lib/new-tab-words";
import { LANGUAGE_CODES } from "@/lib/store-language";

const root = process.cwd();
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("the stylesheet says the same words as lib/new-tab-words.ts, in every language", () => {
  for (const code of LANGUAGE_CODES) {
    const rule = code === "en" ? ".new-tab-note:empty::after" : `:lang(${code}) .new-tab-note:empty::after`;
    const found = css.match(new RegExp(`${rule.replace(/[.*+?^${}()|[\]\\:]/g, "\\$&")} \\{ content: " ([^"]+)"; \\}`));
    assert.ok(found, `${code}: no rule`);
    assert.equal(found[1], newTabWords(code), code);
  }
});

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (path.endsWith(".tsx")) yield path;
  }
}

test("every link that opens a new tab carries the note", () => {
  const missing: string[] = [];
  for (const dir of ["app", "components"]) {
    for (const path of files(join(root, dir))) {
      const text = readFileSync(path, "utf8");
      for (const m of text.matchAll(/<(a|Link)\b[^>]*?target="_blank"/g)) {
        const close = text.indexOf(`</${m[1]}>`, m.index);
        const body = text.slice(m.index, close);
        if (!/<NewTab\b/.test(body) && !/newTab|new tab/i.test(body)) missing.push(`${path.slice(root.length + 1)}:${text.slice(0, m.index).split("\n").length}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});
