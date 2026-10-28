/**
 * The scroll animation may never be the reason a page is blank.
 *
 * Everything with `.reveal` on it starts at opacity 0, but only once a
 * script has written data-reveal="on" at the top of the body. For years the
 * thing that brought those sections back was a React effect, which does not
 * run until the bundle has downloaded, parsed and hydrated. Between the
 * first paint and that moment the visitor has a header and nothing under
 * it — and on a phone on mobile data that gap is seconds long, which is
 * exactly the "animations hiding content until the visitor scrolls" the
 * brief rules out.
 *
 * The fix is that the observer now starts in plain script at the end of the
 * body, so it runs as soon as the HTML is parsed. These checks hold the two
 * halves together: the hiding is never shipped without the showing, and the
 * showing is never moved back behind hydration.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { REVEAL_WATCH } from "@/lib/reveal-scripts";

const layout = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
// The two scripts themselves live beside their hashes (lib/reveal-scripts.ts); the layout writes them.
const scripts = readFileSync(join(process.cwd(), "lib/reveal-scripts.ts"), "utf8");

test("nothing is hidden unless a script is there to show it again", () => {
  // The stylesheet may only hide behind the attribute, never on .reveal itself.
  const bare = /^\s*\.reveal\s*\{[^}]*opacity:\s*0/m.test(css);
  assert.equal(
    bare,
    false,
    "app/globals.css hides .reveal without the data-reveal attribute in front of it, " +
      "so a browser that never ran the script would get a blank page.",
  );
  assert.match(
    css,
    /:root\[data-reveal="on"\]\s*\.reveal\s*\{[\s\S]*?opacity:\s*0/,
    "the hidden state should be spelled with :root[data-reveal=\"on\"] in front of it",
  );
});

test("the observer starts in the document, not in a React effect", () => {
  assert.match(
    scripts,
    /new IntersectionObserver/,
    "app/layout.tsx should start the reveal observer in plain script; without it " +
      "every section stays hidden until the bundle hydrates.",
  );
  // The first script only asks whether the browser HAS an IntersectionObserver;
  // the one that matters is where it makes one.
  assert.match(scripts, /REVEAL_ON = [^;]*setAttribute\("data-reveal","on"\)/, "the first script is the one that hides them");
  assert.match(scripts, /REVEAL_WATCH =[\s\S]*new IntersectionObserver/, "the second is the one that shows them");
  const hide = layout.indexOf("__html: REVEAL_ON");
  const show = layout.indexOf("__html: REVEAL_WATCH");
  assert.ok(hide > -1 && show > hide, "the script that shows sections must come after the one that hides them");
  assert.ok(
    show > layout.indexOf("{children}"),
    "the observer script must sit after {children}, or the sections it looks for are not parsed yet",
  );
});

test("whatever is already on screen is shown without waiting to be observed", () => {
  assert.match(
    scripts,
    /getBoundingClientRect\(\)\.top</,
    "the script should show in-view sections straight away rather than leaving the " +
      "first screen to the observer",
  );
});

test("a throw anywhere in it un-hides the page", () => {
  assert.match(
    scripts,
    /catch\(e\)\{try\{document\.documentElement\.removeAttribute\("data-reveal"\)/,
    "if the reveal script fails it must take the attribute off, so the page is simply all there",
  );
});

test("initial reveal reads all geometry before class writes and still observes below-fold content", () => {
  const events: string[] = [];
  let notify: (entries: { target: unknown; isIntersecting: boolean }[]) => void = () => {};
  const node = (name: string, top: number) => ({
    name,
    getBoundingClientRect: () => { events.push("read:" + name); return { top }; },
    classList: { add: (value: string) => events.push("show:" + name + ":" + value) },
  });
  const first = node("first", 0), second = node("second", 50), later = node("later", 900);
  class Observer {
    constructor(callback: typeof notify) { notify = callback; }
    observe(n: typeof first) { events.push("observe:" + n.name); }
    unobserve(n: typeof first) { events.push("unobserve:" + n.name); }
  }
  runInNewContext(REVEAL_WATCH, {
    window: { innerHeight: 800 }, IntersectionObserver: Observer,
    document: { documentElement: { getAttribute: () => "on", removeAttribute: () => events.push("fallback") },
      querySelectorAll: () => [first, second, later] },
  });
  assert.deepEqual(events, ["read:first", "read:second", "read:later", "show:first:is-in", "show:second:is-in", "observe:later"]);
  notify([{ target: later, isIntersecting: true }]);
  assert.deepEqual(events.slice(-2), ["show:later:is-in", "unobserve:later"]);
});

test("geometry failure removes the hiding attribute rather than leaving an unreadable page", () => {
  const removed: string[] = [];
  runInNewContext(REVEAL_WATCH, {
    window: { innerHeight: 800 }, IntersectionObserver: class { observe() {} unobserve() {} },
    document: { documentElement: { getAttribute: () => "on", removeAttribute: (name: string) => removed.push(name) },
      querySelectorAll: () => [{ getBoundingClientRect: () => { throw Error("Unavailable geometry"); } }] },
  });
  assert.deepEqual(removed, ["data-reveal"]);
});
