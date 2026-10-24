import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Source route only: no synthetic URL, fixture or accessibility pass is inferred. */
export function routeOfPage(source) {
  if (typeof source !== "string" || !source.startsWith("app/") || !source.endsWith("/page.tsx")) throw Error("Expected an app page source");
  const segments = source.slice(4, -9).split("/").filter(Boolean);
  if (segments.some(segment => segment.startsWith("(.)") || segment.startsWith("(..)") || segment.startsWith("(...)"))) throw Error("Intercepted route requires explicit review");
  const parts = segments.filter(segment => !segment.startsWith("@") && !/^\([^/]+\)$/.test(segment));
  const parameters = parts.filter(segment => segment.startsWith("[")).map(segment => {
    let match = /^\[\[\.\.\.([A-Za-z0-9_]+)\]\]$/.exec(segment);
    if (match) return { name: match[1], kind: "optional-catch-all" };
    match = /^\[\.\.\.([A-Za-z0-9_]+)\]$/.exec(segment);
    if (match) return { name: match[1], kind: "catch-all" };
    match = /^\[([A-Za-z0-9_]+)\]$/.exec(segment);
    if (match) return { name: match[1], kind: "segment" };
    throw Error("Unrecognized dynamic route segment");
  });
  return { routeTemplate: "/" + parts.join("/"), parameters };
}

export function generateInventory(root, previous) {
  const walk = folder => readdirSync(join(root, folder), { withFileTypes: true }).flatMap(entry => {
    const source = folder + "/" + entry.name;
    return entry.isDirectory() ? walk(source) : [source];
  }).sort();
  const app = walk("app"), components = walk("components");
  const rows = (key, sources, routes = false) => sources.map(source => {
    const old = previous[key].find(row => row.source === source);
    return { ...(old ?? { source, status: "AAA review not completed" }), ...(routes ? routeOfPage(source) : {}) };
  });
  return {
    ...previous,
    pageTemplates: rows("pageTemplates", app.filter(source => source.endsWith("/page.tsx")), true),
    layoutTemplates: rows("layoutTemplates", app.filter(source => source.endsWith("/layout.tsx"))),
    boundaryTemplates: rows("boundaryTemplates", app.filter(source => /(?:error|not-found|loading)\.tsx$/.test(source))),
    componentSources: components.filter(source => source.endsWith(".tsx")),
    apiRouteSources: app.filter(source => source.startsWith("app/api/") && source.endsWith("/route.ts")),
    routeInventory: {
      generator: "scripts/accessibility-route-inventory.mjs",
      scope: "Source templates and parameter shapes only. Existing review status is preserved; a route is not an exercised fixture or a passing accessibility test.",
      pageTemplates: app.filter(source => source.endsWith("/page.tsx")).length,
    },
  };
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/accessibility-route-inventory.mjs")) {
  const root = process.cwd(), path = join(root, "docs/accessibility-inventory.json");
  const original = readFileSync(path, "utf8");
  const generated = JSON.stringify(generateInventory(root, JSON.parse(original)), null, 2) + "\n";
  if (process.argv.includes("--write")) writeFileSync(path, generated);
  else if (original !== generated) {
    console.error("Accessibility inventory is stale. Regenerate with node scripts/accessibility-route-inventory.mjs --write and review new routes and gaps.");
    process.exitCode = 1;
  }
}
