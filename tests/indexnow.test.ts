/**
 * IndexNow (lib/indexnow.ts): the site tells Bing and the other IndexNow
 * engines about its own pages, once each. What is checked:
 *
 *   - the key file at the site's root holds exactly the key the requests name;
 *   - only the sitemap's own addresses are sent, so no store and no noindex page;
 *   - an address is sent once, and again only if the engine refused it;
 *   - the job is scheduled, keeps to production and is the company's to start.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { INDEXNOW_ENDPOINT, INDEXNOW_KEY, announceNewPages, indexNowBody, sitemapUrls } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/site-url";
import { done, is, part } from "./check";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

type Sent = { url: string; body: { host: string; key: string; keyLocation: string; urlList: string[] } };

function engine(statuses: number[]) {
  const sent: Sent[] = [];
  const send = (async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({ url: String(input), body: JSON.parse(String(init?.body)) });
    return new Response(null, { status: statuses.shift() ?? 200 });
  }) as typeof fetch;
  return { sent, send };
}

async function main() {
  part("The key the engines fetch");
  is("the key file at the root holds the key, and nothing else", read(`public/${INDEXNOW_KEY}.txt`).trim(), INDEXNOW_KEY);
  is("the key is the protocol's shape", /^[a-f0-9]{32}$/.test(INDEXNOW_KEY), true);
  is("each request names the site, the key and where it is served", indexNowBody(["x"]), {
    host: "marktmorgen.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: ["x"],
  });

  part("Only the site's own sitemap");
  const urls = sitemapUrls();
  is("every address is on marktmorgen.com", urls.every((u) => new URL(u).host === "marktmorgen.com"), true);
  is("the home page and an article are among them", [urls.includes(`${SITE_URL}/`), urls.some((u) => u.startsWith(`${SITE_URL}/blog/`))], [true, true]);
  is("no studio, sign-in or noindex page is sent", urls.filter((u) => /\/(studio|signin|report|library|affiliate-programs)(\/|$)/.test(new URL(u).pathname)), []);
  is("no address twice", new Set(urls).size, urls.length);

  part("Each address once");
  const refused = engine([403]);
  is("a refusal is reported and nothing is remembered", await announceNewPages(refused.send), { ok: false, reason: "refused", status: 403 });
  const down = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  is("an engine that does not answer is an unavailable run, not a crash", await announceNewPages(down), { ok: false, reason: "unavailable" });
  const first = engine([202]);
  is("the next day every address is sent", await announceNewPages(first.send), { ok: true, announced: urls.length });
  is("to the shared endpoint, all in one request", [first.sent.length, first.sent[0]?.url, first.sent[0]?.body.urlList.length], [1, INDEXNOW_ENDPOINT, urls.length]);
  const again = engine([200]);
  is("the day after, nothing is sent again", [await announceNewPages(again.send), again.sent.length], [{ ok: true, announced: 0 }, 0]);

  part("The job");
  const crons = (JSON.parse(read("vercel.json")) as { crons: { path: string; schedule: string }[] }).crons;
  is("it runs once a day", crons.find((c) => c.path === "/api/cron/indexnow")?.schedule, "50 13 * * *");
  const job = read("app/api/cron/indexnow/route.ts");
  is("only Vercel's call starts it, and only production announces", [/cronAllowed\(request\)/.test(job), /VERCEL_ENV !== "production"/.test(job)], [true, true]);

  done();
}

void main();
