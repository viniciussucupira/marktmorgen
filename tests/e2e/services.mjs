/**
 * One stand-in, on this computer, for the three outside services the site
 * talks to: the database (Upstash, POST /pipeline), Stripe (/v1/…) and the
 * email sender (Resend, POST /emails). See tests/e2e/run.mjs.
 *
 * The database is the same in-memory one the unit tests use
 * (lib/redis-memory.ts), answered over HTTP in Upstash's shape. Stripe's
 * checkout is the smallest thing that lets a purchase be followed end to
 * end: a checkout that is created is at once a paid one, and its address is
 * the site's own way back, as if the buyer had typed a card and returned.
 * Emails are kept in a list for the test to read: an emailed link is how a
 * gift, or a place in a purchase for several people, is opened.
 *
 * It also serves one page that stands for a creator's own website
 * (GET /site?code=…): the code they copied from the studio, pasted into a
 * page on another address, as it would be on their blog.
 */
import http from "node:http";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export async function startServices(port) {
  const out = mkdtempSync(join(tmpdir(), "nimbus-e2e-"));
  const bundle = join(out, "redis-memory.mjs");
  await build({ entryPoints: [join(root, "lib/redis-memory.ts")], bundle: true, platform: "node", format: "esm", outfile: bundle, logLevel: "error" });
  const { MemoryRedis } = await import(pathToFileURL(bundle).href);

  const redis = new MemoryRedis();
  const sessions = new Map();
  const emails = [];
  const coupons = [];
  const unknown = [];
  const writing = [];
  let counter = 0;
  const blobs = new Map();

  const readBytes = (req) =>
    new Promise((done) => {
      const parts = [];
      req.on("data", (chunk) => parts.push(chunk));
      req.on("end", () => done(Buffer.concat(parts)));
    });
  const read = (req) =>
    new Promise((done) => {
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => done(raw));
    });
  const json = (res, status, body) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://local");
    const path = url.pathname;
    try {
      if (req.method === "GET" && path === "/site") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>A creator's own website</title></head><body style="font-family:sans-serif;padding:24px"><h1>My cooking blog</h1><p>Here is the planner I use every week.</p>${url.searchParams.get("code") ?? ""}</body></html>`);
      }
      if (req.method === "GET" && path === "/fonts/mock.woff2") {
        // The one font file the build is given for every Google font (google-fonts-mock.cjs).
        res.writeHead(200, { "Content-Type": "font/woff2" });
        return res.end(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2")));
      }
      // The file store (Vercel Blob), for what the server writes and deletes
      // itself: kept in memory. Reading a private file back goes to the
      // store's own host, which this does not stand in for.
      if (path.startsWith("/blob-api")) {
        if (req.method === "PUT") {
          const pathname = url.searchParams.get("pathname") ?? path.replace(/^\/blob-api\/?/, "");
          const bytes = await readBytes(req);
          blobs.set(pathname, bytes);
          return json(res, 200, { url: `https://localstore.private.blob.vercel-storage.com/${pathname}`, downloadUrl: "", pathname, contentType: req.headers["x-content-type"] ?? "application/octet-stream", contentDisposition: "inline" });
        }
        if (req.method === "POST" && path.endsWith("/delete")) {
          await read(req);
          return json(res, 200, {});
        }
        return json(res, 404, { error: { code: "not_found", message: "no such file here" } });
      }
      if (req.method === "POST" && path === "/pipeline") {
        const results = [];
        for (const command of JSON.parse(await read(req))) {
          try {
            results.push({ result: (await redis.pipeline([command]))[0] });
          } catch (error) {
            results.push({ error: String(error?.message ?? error) });
          }
        }
        return json(res, 200, results);
      }
      if (req.method === "POST" && path === "/v1/messages") {
        // The writing model: a page's words "translated" by being written in
        // capitals, anything else answered with one plain line.
        const body = JSON.parse(await read(req));
        writing.push(body);
        const system = String(body.system ?? "");
        const text = system.startsWith("You translate the words")
          ? JSON.stringify({ t: JSON.parse(body.messages[0].content).map((s) => String(s).toUpperCase()) })
          : system.startsWith("You write three short posts")
            ? JSON.stringify({ x: "Ten short lessons on knife skills.", instagram: "Ten short lessons.\n\nThe link is in my bio.", linkedin: "I put ten short lessons together." })
          : system.startsWith("You draft the creator's public reply")
            ? JSON.stringify({ reply: "Thank you for baking along, and for saying so." })
          : system.startsWith("A visitor on a creator's store page")
            ? JSON.stringify(
                /moon/i.test(String(body.messages[0].content).split("What the visitor is looking for:").pop() ?? "")
                  ? { picks: [] }
                  : { picks: [{ n: 1, why: "It fits a busy week at home." }, { n: 2, why: "It goes well with it." }] },
              )
          : system.startsWith("You draft the questions and answers on a creator's store page")
            ? JSON.stringify({ items: [{ q: "How do the files arrive?", a: "As a download right after paying, and by email." }, { q: "How do I pay?", a: "With a card on a secure payment page." }] })
          : system.startsWith("Put the user's question into plain English")
            ? "What file can I sell, and how big?"
          : system.startsWith("You answer a creator's question about using Marktmorgen")
            ? JSON.stringify({ answer: "Up to 5 GB, in the formats the help center lists.", used: [1] })
          : system.startsWith("You draft the first version of a creator's store")
            ? JSON.stringify({ bios: ["Weeknight dinners for busy parents.", "Cook once, eat all week."], products: [{ title: "Sunday Meal Planner", summary: "A week of dinners planned on one page.", kind: "download", price: "12" }, { title: "Monthly Menu Club", summary: "A new menu every month.", kind: "membership", price: "7" }], faq: [{ q: "How do I get the planner?", a: "As a download right after paying." }] })
          : system.startsWith("You write the short introduction at the top of a creator's media kit")
            ? JSON.stringify({ pitches: ["I cook weeknight dinners for busy families, and they cook along.", "Recipes for home cooks who plan the week ahead."] })
          : system.startsWith("You write the one line")
            ? JSON.stringify({ lines: ["Weeknight dinners for busy families.", "Recipes and planners for home cooks.", "Cook once, eat all week."] })
            : "A plain line.";
        return json(res, 200, { content: [{ type: "text", text }] });
      }
      if (req.method === "POST" && path === "/emails") {
        emails.push(JSON.parse(await read(req)));
        return json(res, 200, { id: `email_${emails.length}` });
      }
      if (req.method === "POST" && path === "/v1/checkout/sessions") {
        const body = new URLSearchParams(await read(req));
        const metadata = {};
        const lines = new Map();
        for (const [key, value] of body) {
          const meta = key.match(/^metadata\[(.+)\]$/);
          if (meta) metadata[meta[1]] = value;
          const line = key.match(/^line_items\[(\d+)\]\[(quantity)\]$/) ?? key.match(/^line_items\[(\d+)\]\[price_data\]\[(unit_amount)\]$/);
          if (line) lines.set(line[1], { ...(lines.get(line[1]) ?? {}), [line[2]]: Number(value) });
        }
        let amount = 0;
        for (const line of lines.values()) amount += (line.unit_amount ?? 0) * (line.quantity ?? 1);
        // A coupon that takes a set amount off, as an introductory price does, is taken off the first payment.
        const applied = coupons.find((c) => c.id && c.id === body.get("discounts[0][coupon]"));
        if (applied?.amount_off) amount = Math.max(0, amount - Number(applied.amount_off));
        counter += 1;
        const id = `cs_test_local${String(counter).padStart(20, "0")}`;
        sessions.set(id, {
          id,
          object: "checkout.session",
          status: "complete",
          payment_status: "paid",
          mode: body.get("mode") ?? "payment",
          created: Math.floor(Date.now() / 1000),
          amount_total: amount,
          amount_subtotal: amount,
          currency: body.get("line_items[0][price_data][currency]") ?? "usd",
          payment_intent: `pi_local${String(counter).padStart(16, "0")}`,
          metadata,
          customer_details: { email: "buyer@example.com" },
          customer_email: null,
          // What a real checkout would take off, kept for the test to read.
          discount_coupon: body.get("discounts[0][coupon]"),
          // And the language Stripe's page was asked to speak.
          locale: body.get("locale"),
          subscription: null,
          customer: null,
        });
        return json(res, 200, { id, url: (body.get("success_url") ?? "").replace("{CHECKOUT_SESSION_ID}", id) });
      }
      if (req.method === "POST" && path === "/v1/coupons") {
        const body = new URLSearchParams(await read(req));
        coupons.push(Object.fromEntries(body));
        return json(res, 200, { id: body.get("id") ?? `coupon_${coupons.length}`, object: "coupon", percent_off: Number(body.get("percent_off")) });
      }
      const one = path.match(/^\/v1\/checkout\/sessions\/(cs_[A-Za-z0-9_]+)$/);
      if (req.method === "GET" && one) {
        const session = sessions.get(one[1]);
        if (!session) return json(res, 404, { error: { type: "invalid_request_error", message: "No such checkout.session" } });
        const whole = url.searchParams.getAll("expand[]").some((name) => name.startsWith("payment_intent"));
        const intent = { id: session.payment_intent, status: "succeeded", latest_charge: { id: "ch_local", refunded: false, amount_refunded: 0, payment_method_details: { type: "card", card: { brand: "visa" } } } };
        return json(res, 200, whole ? { ...session, payment_intent: intent } : session);
      }
      if (req.method === "GET" && path === "/v1/checkout/sessions") {
        const email = url.searchParams.get("customer_details[email]");
        return json(res, 200, { object: "list", data: [...sessions.values()].filter((s) => !email || s.customer_details.email === email), has_more: false });
      }
      // Everything else Stripe is asked for while a page is drawn is a list with nothing on it.
      // The connected account, as a reminder's switch reads its country (lib/checkout-recovery.ts).
      if (req.method === "GET" && path === "/v1/account") return json(res, 200, { id: "acct_1LocalHarbor0001", object: "account", country: "IE" });
      if (req.method === "GET" && path.startsWith("/v1/")) return json(res, 200, { object: "list", data: [], has_more: false });
      unknown.push(`${req.method} ${path}`);
      return json(res, 404, { error: { type: "invalid_request_error", message: `no stand-in for ${req.method} ${path}` } });
    } catch (error) {
      unknown.push(`${req.method} ${path}: ${error}`);
      return json(res, 500, { error: { message: String(error) } });
    }
  });
  await new Promise((ready) => server.listen(port, "127.0.0.1", ready));
  return {
    emails: () => [...emails],
    checkouts: () => [...sessions.values()],
    coupons: () => [...coupons],
    unknown: () => [...unknown],
    writing: () => [...writing],
    /** What was written to the file store, by its path. */
    blobs: () => new Map(blobs),
    /** The database itself, for a test to read or set what only time or many buyers would make. */
    redis: (commands) => redis.pipeline(commands),
    close: () => new Promise((closed) => server.close(closed)),
  };
}
