import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { API_PAGE } from "@/lib/api-read";
import { API_RATE } from "@/lib/api-guard";
import { MAX_KEYS } from "@/lib/api-key-rules";
import { ADDS_PER_DAY, GIVES_PER_DAY } from "@/lib/api-write";

export const metadata: Metadata = {
  title: "Developers — Marktmorgen",
  description:
    "The Marktmorgen API: read your list, members, course students, affiliates, bookings and numbers from your own tools, and add people to your list, label them and give them products, with keys you make in your studio. On every plan.",
};

/**
 * Every address the API answers, and exactly what it returns.
 *
 * Nothing on this page is written ahead of the code. Each section is one
 * route under app/api/v1, and each example response is the shape
 * lib/api-read.ts builds, field for field — a field that is not here is not
 * sent. When an address is added, it is added here in the same change.
 */
function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-[12px] bg-[#15112e] p-4 text-[0.8125rem] leading-relaxed text-[#ece9ff]">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({ path, method = "GET", children }: { path: string; method?: "GET" | "POST" | "DELETE"; children: React.ReactNode }) {
  return (
    <p>
      <code className="rounded-md bg-lilac px-2 py-1 font-mono text-[0.875rem] font-semibold text-violet-ink">{`${method} ${path}`}</code>{" "}
      {children}
    </p>
  );
}

const BASE = "https://marktmorgen.com/api/v1";

export default function DevelopersPage() {
  return (
    <LegalPage title="Developers" eyebrow="For your own tools" effective={null} legalNav={false} lastUpdated="October 12, 2026">
      <p>
        Read your store from your own tools: your list, your community&apos;s members, a course&apos;s students, your
        affiliates and your bookings; and, with a key made to write, add people to your list, label them, and give or
        take back products. Every plan has it. To be told when something happens instead, use{" "}
        <Link href="/help#can-i-connect-zapier-make-or-my-own-server" className="text-black underline underline-offset-2 hover:no-underline">
          webhooks
        </Link>
        .
      </p>

      <LegalSection title="Keys">
        <p>
          {`Make a key in your studio, under API keys. It is shown once, when you make it, and never again: we keep only a fingerprint of it. A store can have ${MAX_KEYS} keys; each shows when it was last used, and revoking one refuses the very next request made with it.`}
        </p>
        <p>
          A key reads, and changes nothing, unless you check &quot;It can also write&quot; when you make it. That choice is
          the key&apos;s for good: a key made to read stays one that reads, and every key made before writing existed
          reads only. A key that reads only gets 403 <code className="font-mono">read_only</code> from the addresses that
          write. Only the store&apos;s owner and Admins can make a key that writes.
        </p>
        <p>Send it on every request:</p>
        <Code>{`curl ${BASE}/store \\
  -H "Authorization: Bearer nl_live_…"`}</Code>
        <p>
          A key belongs to one store and reads only that store. Keep it on a server, in Zapier or in Make — never in a web
          page, where anybody who opens the page could copy it. The API sends no CORS headers, so a browser refuses to
          use one.
        </p>
      </LegalSection>

      <LegalSection title="Answers, pages and limits">
        <p>
          Every answer is JSON. A list comes as <code className="font-mono">data</code>, and a long list comes a page at a
          time with <code className="font-mono">next</code>: send it back as <code className="font-mono">?cursor=</code> for
          the next page, until it is <code className="font-mono">null</code>.
          {` A page holds up to ${API_PAGE} rows. Times are ISO 8601, in UTC. Amounts are in the currency's smallest unit — cents for dollars.`}
        </p>
        <p>
          {`Each key may make ${API_RATE} requests a minute. Past that, the answer is 429 with `}
          <code className="whitespace-nowrap font-mono">Retry-After: 60</code>.
        </p>
        <Code>{`401  {"error": "unauthorized", "message": "Send your API key as: Authorization: Bearer nl_live_…"}
429  {"error": "rate_limited", "message": "At most ${API_RATE} requests a minute per key. Try again in a minute."}
502  {"error": "unavailable", "message": "… could not be read just now. Try again in a moment."}`}</Code>
        <p>A missing, mistyped and revoked key all get the same 401.</p>
      </LegalSection>

      <LegalSection title="Store">
        <Endpoint path="/api/v1/store">Which store the key reads. The first call to make, to check a key works.</Endpoint>
        <Code>{`{
  "data": { "handle": "harbor", "name": "Harbor Kitchen", "currency": "usd" }
}`}</Code>
      </LegalSection>

      <LegalSection title="Products">
        <Endpoint path="/api/v1/products">Every product, in the order your store shows them, drafts included.</Endpoint>
        <Code>{`{
  "data": [
    {
      "id": "k3j9x2p1ab",
      "title": "The 7-Day Reset",
      "price": 700,
      "currency": "usd",
      "kind": "one_time",
      "interval": null,
      "hidden": false,
      "url": "https://marktmorgen.com/@harbor/p/k3j9x2p1ab"
    }
  ],
  "next": null
}`}</Code>
        <p>
          <code className="font-mono">kind</code> is one of <code className="font-mono">one_time</code>,{" "}
          <code className="font-mono">free</code>, <code className="font-mono">membership</code>,{" "}
          <code className="font-mono">course</code> or <code className="font-mono">call</code>.{" "}
          <code className="font-mono">interval</code> is set for a membership.
        </p>
      </LegalSection>

      <LegalSection title="Leads">
        <Endpoint path="/api/v1/leads">
          Your list: everybody who asked for something free, bought, or came in with an import — the same rows as the
          CSV export in your studio. Add <code className="font-mono">?agreed=true</code> for only those who agreed to hear
          from you and have not unsubscribed: the ones it is fair to email.
        </Endpoint>
        <Code>{`{
  "data": [
    {
      "email": "dana@example.com",
      "name": null,
      "agreed": true,
      "agreed_at": "2026-09-12T14:03:22.000Z",
      "unsubscribed": false,
      "unsubscribed_at": null,
      "first_at": "2026-09-12T14:03:22.000Z",
      "last_at": "2026-09-20T09:41:10.000Z",
      "products": ["Free Pantry Guide", "The 7-Day Reset"],
      "product_ids": ["p8w2m4q9zz", "k3j9x2p1ab"],
      "tags": [],
      "source": "free"
    }
  ],
  "next": "1840"
}`}</Code>
      </LegalSection>

      <LegalSection title="Members">
        <Endpoint path="/api/v1/members">
          Everybody who has come into your community, as your own member list shows them. 404 with{" "}
          <code className="font-mono">no_community</code> when the store has none.
        </Endpoint>
        <Code>{`{
  "data": [
    {
      "email": "dana@example.com",
      "name": "Dana Ortiz",
      "handle": "danaortiz",
      "listed": true,
      "announcements": true,
      "muted": false,
      "removed": false,
      "joined_at": "2026-09-14T18:22:05.000Z",
      "last_seen_at": "2026-09-29T21:10:44.000Z"
    }
  ],
  "next": null
}`}</Code>
      </LegalSection>

      <LegalSection title="Students">
        <Endpoint path="/api/v1/students?product=<id>">
          Everybody who has opened one course, with how far they got, the most recently active first, up to 500.{" "}
          <code className="font-mono">product</code> is the course product&apos;s id, from Products.
        </Endpoint>
        <Code>{`{
  "total": 1,
  "data": [
    {
      "email": "dana@example.com",
      "lessons_done": 7,
      "lessons_total": 12,
      "started_at": "2026-09-15T10:00:00.000Z",
      "last_seen_at": "2026-09-29T08:15:31.000Z",
      "blocked": false
    }
  ]
}`}</Code>
      </LegalSection>

      <LegalSection title="Numbers">
        <Endpoint path="/api/v1/stats">
          Your numbers for the last 7, 30 and 90 days, the same ones your studio shows: visitors, checkouts, sales and
          revenue, each channel from visit to sale, and page views by country and by device.
        </Endpoint>
        <Code>{`{
  "data": {
    "currency": "usd",
    "sales": "ok",
    "days": {
      "last_7_days": {
        "visitors": 412,
        "page_views": 655,
        "checkouts": 31,
        "sales": 9,
        "revenue": 26100,
        "channels": [
          { "channel": "instagram", "visits": 240, "checkouts": 19, "signups": 4, "sales": 6, "revenue": 17400 }
        ],
        "countries": [{ "country": "US", "views": 388 }],
        "devices": [{ "device": "mobile", "views": 521 }],
        "previous": { "visitors": 335, "page_views": 540, "checkouts": 24, "sales": 7, "revenue": 20300 },
        "refunded": 2900,
        "sales_by_country": [{ "country": "US", "sales": 5, "revenue": 14500 }],
        "ads": [{ "ad": "reel-b", "channel": "instagram", "campaign": "launch", "sales": 3, "revenue": 8700 }]
      },
      "last_30_days": { "...": "the same fields" },
      "last_90_days": { "...": "the same fields" }
    }
  }
}`}</Code>
        <p>
          Money is in the smallest unit of your store&apos;s currency, before Stripe&apos;s fee. <code className="font-mono">sales</code>{" "}
          and <code className="font-mono">revenue</code> are <code className="font-mono">null</code> when Stripe could not be read
          (<code className="font-mono">&quot;sales&quot;: &quot;error&quot;</code>) or is not connected yet (<code className="font-mono">&quot;none&quot;</code>).
          A <code className="font-mono">channel</code> of <code className="font-mono">direct</code> is a visit or sale from nowhere
          the store could name. <code className="font-mono">previous</code> is the same number of days just before, to compare
          with; its <code className="font-mono">sales</code> and <code className="font-mono">revenue</code> are{" "}
          <code className="font-mono">null</code> when Stripe could not be read that far back in full.
        </p>
      </LegalSection>

      <LegalSection title="Ask your AI assistant">
        <p>
          Marktmorgen is also an MCP server, so an assistant that speaks the Model Context Protocol — Claude, ChatGPT,
          Cursor and others — can answer questions like &quot;which channel made me money this month?&quot; from your own
          numbers. Add it as a remote server at <code className="font-mono">https://marktmorgen.com/api/mcp</code>, with
          the header <code className="font-mono">Authorization: Bearer nl_live_…</code> and one of your keys.
        </p>
        <p>
          It can read three things: your numbers (the same as <code className="font-mono">/api/v1/stats</code>), your
          products, and which store the key belongs to. It changes nothing, and it does not read your buyers&apos;,
          subscribers&apos; or affiliates&apos; addresses: what an assistant reads is kept by whoever runs the assistant,
          and the people on your list did not agree to that. The endpoints above are where your own tools read them.
        </p>
      </LegalSection>

      <LegalSection title="Affiliates">
        <Endpoint path="/api/v1/affiliates">
          Every affiliate, with what they earned, were paid and are owed — the numbers on your affiliates page.
        </Endpoint>
        <Code>{`{
  "currency": "usd",
  "refunds_checked": true,
  "data": [
    {
      "id": "0123456789ab",
      "email": "sara@example.com",
      "code": "sara",
      "status": "approved",
      "applied_at": "2026-09-02T16:40:12.000Z",
      "clicks": 214,
      "sales": 9,
      "earned": 18900,
      "paid": 12000,
      "owed": 6900,
      "payable": 4200,
      "waiting": 2700
    }
  ]
}`}</Code>
        <p>
          <code className="font-mono">payable</code> is what can be paid today; <code className="font-mono">waiting</code>{" "}
          is still inside the wait you set before a sale can be paid. When <code className="font-mono">refunds_checked</code>{" "}
          is <code className="font-mono">false</code>, Stripe could not be asked about refunds just now and the amounts may
          be high: read again before paying anyone from them.
        </p>
      </LegalSection>

      <LegalSection title="Bookings">
        <Endpoint path="/api/v1/bookings">
          Paid calls and seats in live sessions, each at the time it is booked for now — a booking its buyer moved is at
          its new time.
        </Endpoint>
        <Code>{`{
  "data": [
    {
      "id": "cs_live_a1B2c3…",
      "product_id": "c9v7n2k4ww",
      "title": "30-minute strategy call",
      "email": "dana@example.com",
      "name": "Dana Ortiz",
      "starts_at": "2026-10-03T15:00:00.000Z",
      "ends_at": "2026-10-03T15:30:00.000Z",
      "buyer_time_zone": "America/New_York",
      "moved": 0,
      "amount": 9900,
      "currency": "usd",
      "answers": [{ "label": "What should we cover?", "value": "Pricing my first course" }]
    }
  ]
}`}</Code>
      </LegalSection>

      <LegalSection title="Writing: your list">
        <Endpoint method="POST" path="/api/v1/leads">
          Puts somebody on your list, as someone who agreed to hear from you. Send{" "}
          <code className="font-mono">agreed: true</code>, your word that they did: nobody is added without it, and
          nobody who unsubscribed from your list is ever added back, whatever is sent. Somebody new starts the sequences
          that start when somebody joins your list; a label they come with starts the sequences that label starts.
        </Endpoint>
        <Code>{`curl -X POST ${BASE}/leads \\
  -H "Authorization: Bearer nl_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dana@example.com", "name": "Dana Ortiz", "tags": ["webinar"], "agreed": true}'

200  {"data": {"email": "dana@example.com", "status": "added"}}
200  {"data": {"email": "dana@example.com", "status": "already"}}
400  {"error": "consent", "message": "Send agreed: true, …"}
409  {"error": "unsubscribed", "message": "This person unsubscribed from your list, so they are not added back."}`}</Code>
        <Endpoint method="POST" path="/api/v1/leads/labels">
          Adds and takes away labels of somebody already on your list. A label added starts the sequences it starts in
          your studio.
        </Endpoint>
        <Code>{`{"email": "dana@example.com", "add": ["vip"], "remove": ["webinar"]}

200  {"data": {"email": "dana@example.com", "labels": ["vip"]}}
404  {"error": "not_on_list", "message": "Nobody with this address is on your list."}`}</Code>
        <p>{`A store may add ${ADDS_PER_DAY.toLocaleString("en-US")} new people a day through the API; past that, 429 daily_limit until the next day.`}</p>
      </LegalSection>

      <LegalSection title="Writing: giving a product">
        <Endpoint method="POST" path="/api/v1/access">
          Gives a product to an address with no payment, as an import of past buyers does: a file, a link, a course, a
          podcast or a bundle, by its id or its exact name. They open it from your store&apos;s list of purchases with
          that address, where it shows as given by your store, not as a sale; it is not counted in your numbers, sent to
          webhooks or credited to an affiliate. Send <code className="font-mono">notify: true</code> and they get one email
          from your store&apos;s name saying so, in your store&apos;s language, while your plan is running.
        </Endpoint>
        <Code>{`{"email": "dana@example.com", "product": "k3j9x2p1ab", "notify": true}

200  {"data": {"email": "dana@example.com", "product": "k3j9x2p1ab", "status": "given", "emailed": true}}
200  {"data": {"email": "dana@example.com", "product": "k3j9x2p1ab", "status": "already", "emailed": false}}
409  {"error": "cannot_give", "message": "Memberships, calls and products with several prices cannot be given this way."}`}</Code>
        <Endpoint method="DELETE" path="/api/v1/access">
          Takes back a product the API gave, with the same body. Only what the API gave: a sale, an import, a gift or a
          purchase paid with PayPal is not the API&apos;s to take, and gets 404{" "}
          <code className="font-mono">not_given_here</code>.
        </Endpoint>
        <Code>{`{"email": "dana@example.com", "product": "k3j9x2p1ab"}

200  {"data": {"email": "dana@example.com", "product": "k3j9x2p1ab", "status": "taken_back"}}`}</Code>
        <p>{`A store may give ${GIVES_PER_DAY.toLocaleString("en-US")} products a day through the API. A body is JSON of up to 4,000 bytes.`}</p>
      </LegalSection>

      <LegalSection title="Sales and refunds">
        <p>
          Sales, subscriptions and refunds are charged on your own Stripe account, so Stripe&apos;s own API is where to
          read them, with your own Stripe key. To be told about each one as it happens, add a webhook in your studio.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
