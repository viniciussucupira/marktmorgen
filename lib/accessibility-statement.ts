/**
 * What the public page /accessibility says (310 [AX2] §6, DA1), taken from
 * the records instead of typed again: the gaps and the review counts from
 * docs/accessibility-inventory.json, and the tests that run on every change
 * from the CI's own workflows, each tied by tests/accessibility-statement.test.ts
 * to the file that runs it. The page never says more than these prove: no
 * conformity, certification or comparison is claimed (AX274 Part A, item 7).
 */
import inventory from "@/docs/accessibility-inventory.json";

/** A test that runs in the CI on every change, in the words the page uses, and where it runs. */
export type AccessibilityCheck = {
  name: string;
  what: string;
  /** The workflow that runs it. */
  workflow: string;
  /** The test script it runs, when the proof is in the script. */
  script?: string;
  /** Text that must be in the workflow or the script for the page's words to stay true. */
  proof: string[];
};

export const ACCESSIBILITY_CHECKS: readonly AccessibilityCheck[] = [
  {
    name: "Public pages",
    what: "The home page, the price list and the sign-in page, at five screen widths from 320 to 1920 pixels, in Chromium, Firefox and WebKit, with automated checks for the enhanced level, plus wider text spacing, reduced motion, high contrast (forced colors) and narrow-screen reflow.",
    workflow: ".github/workflows/accessibility-public-matrix.yml",
    script: "tests/e2e/accessibility-public-matrix.mjs",
    proof: ["browser: [chromium, firefox, webkit]", '["/","/pricing","/signin"]', "[320,390,768,1280,1920]", '"text-spacing","reduced-motion","forced-colors","reflow-320"'],
  },
  {
    name: "Signing up",
    what: "The sign-up steps, in Chromium, Firefox and WebKit.",
    workflow: ".github/workflows/accessibility-signup-actions.yml",
    proof: ["browser: [chromium, firefox, webkit]"],
  },
  {
    name: "The studio",
    what: "Main studio pages and their states, in Chromium, Firefox and WebKit.",
    workflow: ".github/workflows/accessibility-studio-matrix.yml",
    proof: ["browser: [chromium, firefox, webkit]"],
  },
  {
    name: "Products",
    what: "Creating and editing a product, in Chromium, Firefox and WebKit.",
    workflow: ".github/workflows/accessibility-product-actions.yml",
    proof: ["browser: [chromium, firefox, webkit]"],
  },
  {
    name: "Buying",
    what: "What a buyer does on a store, in Chromium, Firefox and WebKit.",
    workflow: ".github/workflows/accessibility-buyer-actions.yml",
    proof: ["browser: [chromium, firefox, webkit]"],
  },
  {
    name: "A real screen reader",
    what: "A short trial with NVDA on Windows and VoiceOver on a Mac: it opens the sign-in and log-in pages and checks what the reader says for their main heading.",
    workflow: ".github/workflows/accessibility-real-readers.yml",
    script: "tooling/screen-reader/entry-pilot.mjs",
    proof: ["os: [windows-latest, macos-latest]", 'path:"/signin"', 'path:"/signin?to=login"', "nvda", "voiceOver"],
  },
];

type Inventory = { openWork: { area: string; status: string }[]; pageTemplates: { status: string }[] };

/** Every open item the inventory records, as it records it. */
export function accessibilityGaps(): { area: string; status: string }[] {
  return (inventory as Inventory).openWork.map((item) => ({ area: item.area, status: item.status }));
}

/** How many page templates the inventory lists, and how many it records as fully reviewed for the enhanced level. */
export function reviewCounts(): { total: number; reviewed: number } {
  const templates = (inventory as Inventory).pageTemplates;
  return { total: templates.length, reviewed: templates.filter((t) => /^AAA review (completed|done)$/i.test(t.status)).length };
}
