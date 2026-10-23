import { lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DEEMED_SUPPLIER_RECORDS, deemedSupplierReady, type DeemedSupplierRecord } from "@/lib/deemed-supplier";
import { PLANS_ON_SALE } from "@/lib/opening";
import { done, is, part } from "./check";

type File = { regular: boolean; text: string };
type Read = (path: string) => File | undefined;
const sourcePath = /^(?:app|lib|components|scripts)\/[A-Za-z0-9_./-]+\.(?:ts|tsx|mjs)$/;
const testPath = /^tests\/[A-Za-z0-9_-]+\.test\.ts$/;
function paths(value: string): string[] {
  return value.trim().split(/[\s,]+/).filter(Boolean);
}
function safe(path: string): boolean {
  return path.length <= 240 && !path.split("/").some(part => part === "." || part === "..") && !path.includes("\\");
}
/** CI integrity only: file references are not proof of tax-law completeness. */
function evidenceProblems(record: Pick<DeemedSupplierRecord, "implementedIn" | "evidence">, read: Read): string[] {
  const problems: string[] = [];
  const sources = paths(record.implementedIn);
  const tests = paths(record.evidence);
  if (!sources.length) problems.push("implementation paths missing");
  if (!tests.length) problems.push("test paths missing");
  const testTexts: string[] = [];
  for (const path of tests) {
    if (!safe(path) || !testPath.test(path)) {
      problems.push("invalid test path: " + path);
      continue;
    }
    const file = read(path);
    if (!file?.regular) problems.push("test file missing: " + path);
    else testTexts.push(file.text);
  }
  for (const path of sources) {
    if (!safe(path) || !sourcePath.test(path)) {
      problems.push("invalid implementation path: " + path);
      continue;
    }
    if (!read(path)?.regular) problems.push("implementation file missing: " + path);
    const sourceModule = path.replace(/\.(?:ts|tsx|mjs)$/, "");
    const references = [path, "@/" + sourceModule, "../" + sourceModule];
    if (!testTexts.some(text => references.some(ref => text.includes('"' + ref + '"') || text.includes("'" + ref + "'")))) {
      problems.push("implementation has no referenced test: " + path);
    }
  }
  return problems;
}

const read: Read = path => {
  try {
    const absolute = join(process.cwd(), path);
    const stat = lstatSync(absolute);
    return { regular: stat.isFile() && !stat.isSymbolicLink(), text: stat.isFile() && !stat.isSymbolicLink() ? readFileSync(absolute, "utf8") : "" };
  } catch {
    return undefined;
  }
};

part("Actual tax-treatment records need existing source and executed test files");
for (const record of DEEMED_SUPPLIER_RECORDS) {
  is(record.jurisdiction + " has actual implementation/test references", evidenceProblems(record, read), []);
}
is("no treatment is invented by evidence validation", [DEEMED_SUPPLIER_RECORDS.length, deemedSupplierReady(), PLANS_ON_SALE], [0, false, false]);

part("The CI evidence validator rejects missing or unrelated references");
const files: Record<string, File> = {
  "lib/example.ts": { regular: true, text: "export const example = true;" },
  "lib/second.ts": { regular: true, text: "export const second = true;" },
  "tests/example.test.ts": { regular: true, text: 'import { example } from "@/lib/example";' },
  "tests/second.test.ts": { regular: true, text: 'import { second } from "../lib/second";' },
  "tests/unrelated.test.ts": { regular: true, text: 'import { other } from "@/lib/other";' },
  "lib/directory.ts": { regular: false, text: "" },
  "tests/directory.test.ts": { regular: false, text: "" },
};
let reads = 0;
const fixture: Read = path => { reads += 1; return files[path]; };
const valid = { implementedIn: "lib/example.ts", evidence: "tests/example.test.ts" };
is("existing referenced source and auto-discovered test", evidenceProblems(valid, fixture), []);
is("all declared implementation files have tests", evidenceProblems({ implementedIn: "lib/example.ts, lib/second.ts", evidence: "tests/example.test.ts tests/second.test.ts" }, fixture), []);
for (const [label, record] of [
  ["missing source", { ...valid, implementedIn: "lib/missing.ts" }],
  ["missing test", { ...valid, evidence: "tests/missing.test.ts" }],
  ["unrelated test", { ...valid, evidence: "tests/unrelated.test.ts" }],
  ["one source untested", { implementedIn: "lib/example.ts lib/second.ts", evidence: valid.evidence }],
  ["source directory", { ...valid, implementedIn: "lib/directory.ts" }],
  ["test directory", { ...valid, evidence: "tests/directory.test.ts" }],
  ["no implementation", { ...valid, implementedIn: "" }],
  ["no evidence", { ...valid, evidence: "" }],
  ["prose is not a file", { ...valid, evidence: "all tests passed" }],
  ["nonexecuted test helper", { ...valid, evidence: "tests/example.ts" }],
] as const) {
  is(label + " cannot support a real record", evidenceProblems(record, fixture).length > 0, true);
}
for (const path of ["/lib/example.ts", "../lib/example.ts", "lib/../example.ts", "C:/lib/example.ts", "lib\\example.ts"]) {
  reads = 0;
  is("unsafe implementation rejected", evidenceProblems({ implementedIn: path, evidence: "" }, fixture).some(p => p.startsWith("invalid implementation path:")), true);
  is("unsafe path is never read", reads, 0);
}
for (const path of ["../tests/example.test.ts", "tests/../example.test.ts", "/tests/example.test.ts", "tests/nested/example.test.ts"]) {
  is("unsafe or non-auto-discovered test path rejected", evidenceProblems({ ...valid, evidence: path }, fixture).some(p => p.startsWith("invalid test path:")), true);
}
is("actual existing repository files can be checked without a tax record", evidenceProblems({ implementedIn: "lib/deemed-supplier.ts", evidence: "tests/tax-gate.test.ts" }, read), []);
done();
