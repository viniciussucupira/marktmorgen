/**
 * Every metered feature's per-store worst month, in one registry (added 17
 * October 2026). tests/plan-cost-model.ts sums COST_LINES into worstCost,
 * which tests/spend-floor.test.ts holds to the owner's 60% after the 27.5%
 * stress tax, and tests/plan-cost-registry.test.ts fails when:
 *
 *   - a line's sources do not hold the constants it names (moved or renamed);
 *   - a counter in the code (withinLimit, withinMonth, countUse) has a scope
 *     that no entry of SCOPES classifies;
 *   - an exported limit or cost constant in lib/ (a name with _PER_DAY,
 *     _MONTHLY, _INCLUDED, WORST_, _LIMITS, _BY_TIER, ALLOWANCE...) is cited by
 *     no line, no open item and no entry of NOT_A_COST.
 *
 * So a feature cannot add a per-use cost without saying where it is counted.
 *
 * Each line is the most one store on a plan can cost in one calendar month
 * at every enforced cap at once, in dollars, from the rates in
 * lib/spend-cost-table.ts and tests/traffic-cost.ts. A request is costed by
 * the call, its CPU, 2 GB of memory for its wall time, its database commands
 * and the bytes it moves through the database; the shapes below are review
 * ceilings stated as such, like the visit's own (tests/traffic-cost.ts).
 * Daily windows that start with their first use can touch 32 windows of a
 * 31-day month; UTC-day and calendar-month counters touch 31 and 1.
 *
 * OPEN lists the per-use costs that no monthly figure bounds yet. They are
 * not in worstCost, so the floor test does not certify them: the owner's rule
 * counts them as failing until each has a figure here.
 */
import { paidStorageBytes } from "@/lib/storage-rules";
import { monthlyEmails, type Tier } from "@/lib/plan";
import { FREE_PAUSE_ABOVE_BYTES } from "@/lib/delivery";
import { PAID_VIDEO_HOURS } from "@/lib/video-admission-rules";
import { TOP_HEIGHT, viewingBytes } from "@/lib/stream-rules";
import { VISITS_INCLUDED } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED } from "@/lib/order-rules";
import { AUTOMATIC_AI_STORE_MICRO_USD } from "@/lib/ai-spend-policy";
import { uploadWorstCostMicroUsd } from "@/lib/upload-budget-policy";
import { DAILY_RUNS_BY_TIER, WORST_COMMANDS_PER_RUN } from "@/lib/flow-limits";
import { IMPORT_ALLOWANCES, IMPORT_MIN_ROWS_PER_UPLOAD, IMPORT_WORST_BYTES_PER_ROW, IMPORT_WORST_COMMANDS_PER_ROW } from "@/lib/import-limits";
import { BATCH_BYTES, MAX_REPORT_ROWS } from "@/lib/imports";
import { MAX_TRIMMED_PAGE_CHARS } from "@/lib/clickfunnels-page";
import { IMPORTS_PER_SHARE_MONTH, MAX_APPLY_PAGES, PREVIEWS_PER_SHARE_MONTH, SHARE_LIMITS } from "@/lib/funnel-share-rules";
import { MAX_SECTION_BYTES } from "@/lib/saved-blocks";
import { MAX_PAGE_BYTES } from "@/lib/sales-page";
import { QUIZ_MONTHLY_SUBMISSIONS } from "@/lib/quiz-usage-rules";
import { TEAM_LIMITS } from "@/lib/team-scheduling-rules";
import { SYNC_SECONDS } from "@/lib/host-calendar";
import { MAX_TEAM } from "@/lib/team";
import {
  UPSTASH_MICRO_USD_PER_GB_MONTH, UPSTASH_MICRO_USD_PER_GB_TRANSFER, UPSTASH_MICRO_USD_PER_MILLION_COMMANDS, VERCEL_CALL_MICRO_USD_PER_MILLION,
  VERCEL_CPU_MICRO_USD_PER_HOUR, VERCEL_FUNCTION_GB, VERCEL_MEMORY_MICRO_USD_PER_GB_HOUR,
} from "@/lib/spend-cost-table";
import { PAGES_PER_VISIT, visitCost } from "./traffic-cost";

export const GB = 1024 * 1024 * 1024;
/** Keeping a file, at the dearest of the three stores one may be in. */
export const STORAGE_PER_GB = 0.023;
/** Sending a file that is sold: nothing, from the store they are kept in. */
export const FILE_DELIVERY_PER_GB = 0;
export const STREAM_STORAGE_PER_GB = 0.02;
export const STREAM_DELIVERY_PER_GB = 0.005;
export const FETCHED_AHEAD = 1.25;
export const PER_EMAIL = 0.0009;
/** An order's pages and jobs, set well over a visit's whole page (tests/traffic-cost.ts). */
export const ORDER_COMPUTE = 0.0003;
/** What one order costs at the most: its confirmation, the email that says it shipped, and its compute. */
export const ORDER_COST = 2 * PER_EMAIL + ORDER_COMPUTE;
/**
 * The other emails nothing counts by the order: sign-in links and a buyer's
 * link to their purchases. Set high, and not enforced by any counter: OPEN
 * item "transactional-email" says so.
 */
export const TRANSACTIONAL: Record<Tier, number> = { creator: 500, pro: 1_000, scale: 2_000 };

const micro = (n: number) => n / 1_000_000;
/** One database command, a byte moved through the database, a byte kept there a month. */
export const COMMAND = micro(UPSTASH_MICRO_USD_PER_MILLION_COMMANDS) / 1_000_000;
export const DB_BYTE = micro(UPSTASH_MICRO_USD_PER_GB_TRANSFER) / 1e9;
export const DB_BYTE_MONTH = micro(UPSTASH_MICRO_USD_PER_GB_MONTH) / 1e9;
const CALL = micro(VERCEL_CALL_MICRO_USD_PER_MILLION) / 1_000_000;
const CPU_SECOND = micro(VERCEL_CPU_MICRO_USD_PER_HOUR) / 3600;
const MEMORY_SECOND = (micro(VERCEL_MEMORY_MICRO_USD_PER_GB_HOUR) * VERCEL_FUNCTION_GB) / 3600;

/** The shapes requests are costed at: wall seconds held at 2 GB, and CPU seconds. Review ceilings, not measurements. */
export const SHAPES = {
  /** A studio read or a small write: the visit model's page (tests/traffic-cost.ts). */
  light: { seconds: 1.3, cpu: 0.1 },
  /** A request that reads a body of up to a megabyte and works through it. */
  heavy: { seconds: 2, cpu: 0.5 },
  /** A request that writes many records: an import's step, a funnel made. */
  write: { seconds: 5, cpu: 1 },
  /** An import's step, which works for up to eight seconds (app/api/store/import, STEP_MS). */
  step: { seconds: 10, cpu: 2 },
} as const;

/** What one request costs: its call, CPU, memory, database commands and the bytes it moves through the database. */
export function request(shape: keyof typeof SHAPES, commands: number, bytes = 0): number {
  const { seconds, cpu } = SHAPES[shape];
  return CALL + cpu * CPU_SECOND + seconds * MEMORY_SECOND + commands * COMMAND + bytes * DB_BYTE;
}

/** One host's calendar read: its commands, and the wait for the calendar, held at 2 GB inside the page that asked. */
export const TEAM_READING = 7 * COMMAND + 1 * MEMORY_SECOND + 0.05 * CPU_SECOND;
/** Commands a view of a team call's page costs: each host's claims, and one MGET of every host's calendar state and connection plus the round-robin counts (lib/team-booking.ts). */
export const TEAM_COMMANDS_PER_HOST_VIEW = 1;
export const TEAM_COMMANDS_PER_VIEW = 2;

/** Windows of a counter that a 31-day month can touch. */
export const DAY_WINDOWS = 32;
export const UTC_DAYS = 31;

/** Historical operating model only: encoded-size assumptions and fetched-ahead factor.
 * This is not a verified bound on provider bytes, replay, invoice rates or taxes. */
export function hourCost(): number {
  const gigabytes = (viewingBytes(3600, TOP_HEIGHT, Number.POSITIVE_INFINITY) / GB) * FETCHED_AHEAD;
  return gigabytes * STREAM_DELIVERY_PER_GB;
}

export type Source = { file: string; names: string[] };
export type CostLine = {
  id: string;
  /** The feature, and the change that added it where it is new. */
  feature: string;
  /** The most one store on this plan costs in a calendar month, in dollars. */
  monthlyUsd: (tier: Tier) => number;
  /** Where the caps and figures it uses are enforced. */
  sources: Source[];
  /** How the figure is worked out. */
  basis: string;
};

const ALL_TIERS_SAME = (usd: number) => () => usd;

export const COST_LINES: CostLine[] = [
  {
    id: "storage",
    feature: "Files and lesson files kept",
    monthlyUsd: (tier) => (paidStorageBytes(tier) / GB) * STORAGE_PER_GB,
    sources: [{ file: "lib/storage-rules.ts", names: ["PAID_STORAGE_BYTES", "paidStorageBytes"] }],
    basis: "The plan's storage, all used, at the dearest store a file may be in.",
  },
  {
    id: "free-delivery",
    feature: "Downloads (sold and free)",
    monthlyUsd: () => (FREE_PAUSE_ABOVE_BYTES / GB) * FILE_DELIVERY_PER_GB,
    sources: [{ file: "lib/delivery.ts", names: ["FREE_PAUSE_ABOVE_BYTES", "DELIVERY_ALLOWANCE_BYTES"] }],
    basis: "Files are sent from a store that charges nothing to send them; the download's request is OPEN item public-requests.",
  },
  {
    id: "video",
    feature: "Lesson video watched",
    monthlyUsd: (tier) => PAID_VIDEO_HOURS[tier] * hourCost(),
    sources: [
      { file: "lib/video-admission-rules.ts", names: ["PAID_VIDEO_HOURS"] },
      { file: "lib/watch-rules.ts", names: ["VIDEO_HOURS_INCLUDED", "VIDEO_SECONDS_INCLUDED", "VIDEO_CENTS_PER_HOUR_OVER"] },
    ],
    basis: "Every admitted hour watched. The legacy invoice line past 400 hours is never reached: admission stops at the plan's hours (tests/plan-cost-registry.test.ts holds it below).",
  },
  {
    id: "visits",
    feature: "Visits, public pages and buyers' pages together (collections #508 and checkout-script cards #518 are visits)",
    monthlyUsd: (tier) => VISITS_INCLUDED[tier] * visitCost(),
    sources: [
      { file: "lib/traffic-rules.ts", names: ["VISITS_INCLUDED", "publicVisitLimit", "BUYER_RESERVE_BPS", "VISIT_CENTS_PER_THOUSAND_OVER"] },
      { file: "lib/traffic.ts", names: ["isResting"] },
    ],
    basis: "The month's figure, every visit made by the heavy visitor a visit is costed as. Nothing is sold past it: public pages rest at 95% and buyers' pages at 100%.",
  },
  {
    id: "orders",
    feature: "Orders (checkouts, carts, offers after paying, PayPal orders, places, free copies)",
    monthlyUsd: (tier) => ORDERS_INCLUDED[tier] * ORDER_COST,
    sources: [
      { file: "lib/order-rules.ts", names: ["ORDERS_INCLUDED", "paidOrdersLimitFor", "freeCopiesLimitFor", "ORDER_CENTS_PER_THOUSAND_OVER"] },
      { file: "lib/order-admission.ts", names: ["ADMIT_ORDERS", "admitOrders"] },
    ],
    basis: "The plan's figure, each order at the most one costs. Nothing is sold past it: new orders are admitted only while the month's orders and the checkouts held from the last day are under the figure.",
  },
  {
    id: "list-email",
    feature: "The monthly emails: list email, sequences and workflows (#507), their notices to the owner, and emails to people brought over on Studio and Scale",
    monthlyUsd: (tier) => monthlyEmails(tier) * PER_EMAIL,
    sources: [
      { file: "lib/plan.ts", names: ["PRO_MONTHLY_EMAILS", "SCALE_MONTHLY_EMAILS", "TRIAL_MONTHLY_EMAILS"] },
      { file: "lib/mail.ts", names: ["reserve", "takeFromMonth"] },
    ],
    basis: "Every monthly email sent, at the most an email costs.",
  },
  {
    id: "transactional-email",
    feature: "Sign-in links and buyers' links to their purchases",
    monthlyUsd: (tier) => TRANSACTIONAL[tier] * PER_EMAIL,
    sources: [{ file: "tests/plan-cost-registry.ts", names: ["TRANSACTIONAL"] }],
    basis: "A figure set high; no counter holds it (OPEN item transactional-email).",
  },
  {
    id: "ai",
    feature: "AI: writing jobs and visitor answers, AI funnel drafts (#517) and every other AI route",
    monthlyUsd: (tier) => micro(AUTOMATIC_AI_STORE_MICRO_USD[tier]),
    sources: [
      { file: "lib/ai-spend-policy.ts", names: ["AUTOMATIC_AI_STORE_MICRO_USD"] },
      { file: "lib/ai-rules.ts", names: ["AI_MONTHLY", "AI_PER_MINUTE"] },
      { file: "lib/answers-rules.ts", names: ["ANSWERS_MONTHLY", "ASKS_PER_DAY"] },
      { file: "lib/ai-request-rules.ts", names: ["AI_REQUEST_LIMITS"] },
      { file: "lib/funnel-ai.ts", names: ["askModel"] },
    ],
    basis: "The automatic monthly AI ceiling, reserved before every call; a funnel draft takes writing jobs from it like any other.",
  },
  {
    id: "uploads",
    feature: "Upload operations",
    monthlyUsd: (tier) => micro(uploadWorstCostMicroUsd(tier)),
    sources: [{ file: "lib/upload-budget-policy.ts", names: ["uploadWorstCostMicroUsd", "PAID_UPLOAD_OPENS"] }],
    basis: "Every upload operation the automatic upload allowance can start.",
  },
  {
    id: "workflows",
    feature: "Workflow runs (#507)",
    monthlyUsd: (tier) => DAILY_RUNS_BY_TIER[tier] * UTC_DAYS * WORST_COMMANDS_PER_RUN * COMMAND,
    sources: [{ file: "lib/flow-limits.ts", names: ["DAILY_RUNS_BY_TIER", "WORST_COMMANDS_PER_RUN", "TRIAL_DAILY_RUNS", "ACTIVE_FLOWS_BY_TIER", "WORKFLOW_LIMITS"] }],
    basis: "Every new run of every UTC day at the run ceiling of commands. Steps run in the five-minute job, whose time the schedule bounds (a company fixed cost); emails and the owner's notices come out of the monthly emails.",
  },
  {
    id: "imports",
    feature: "Imports from another platform: rows, starts, steps, reports, and Store's emails to people brought over",
    monthlyUsd: (tier) => {
      const a = IMPORT_ALLOWANCES[tier];
      const rows = a.rows * (IMPORT_WORST_COMMANDS_PER_ROW * COMMAND + IMPORT_WORST_BYTES_PER_ROW * DB_BYTE);
      const uploads = (a.rows / IMPORT_MIN_ROWS_PER_UPLOAD) * request("heavy", 4, 0);
      const starts = a.starts * request("light", 20);
      const steps = a.steps * request("step", 10);
      const reports = a.reports * request("light", 4, MAX_REPORT_ROWS * 400);
      return rows + uploads + starts + steps + reports + a.movedEmails * PER_EMAIL;
    },
    sources: [
      { file: "lib/import-limits.ts", names: ["IMPORT_ALLOWANCES", "IMPORT_WORST_COMMANDS_PER_ROW", "IMPORT_WORST_BYTES_PER_ROW", "IMPORT_MIN_ROWS_PER_UPLOAD"] },
      { file: "lib/imports.ts", names: ["takeImportRows", "reserveMoved", "IMPORT_LIMITS"] },
      { file: "app/api/store/import/route.ts", names: ["import-start-month", "import-step-month", "import-report-month"] },
    ],
    basis: "Every row of the month at its command and transfer ceiling, every upload at the fewest rows one counts, every start, step and report download; Store's own emails to people brought over (Studio and Scale send theirs from the monthly emails).",
  },
  {
    id: "clickfunnels",
    feature: "Moving from ClickFunnels (#519): dry runs, saved pages read, funnel checks and funnels made",
    monthlyUsd: (tier) => {
      const a = IMPORT_ALLOWANCES[tier];
      return a.checks * request("heavy", 8 + 6, BATCH_BYTES)
        + a.buyerChecks * request("heavy", 506 + 6, BATCH_BYTES)
        + a.pageReads * request("heavy", 4, 2 * MAX_TRIMMED_PAGE_CHARS)
        + a.funnelChecks * request("heavy", 29, 10 * MAX_PAGE_BYTES)
        + a.funnelSaves * request("write", 200, 30 * MAX_PAGE_BYTES);
    },
    sources: [
      { file: "lib/import-limits.ts", names: ["IMPORT_ALLOWANCES"] },
      { file: "app/api/store/import/route.ts", names: ["import-preview-month", "import-preview-buyers-month"] },
      { file: "app/api/store/import/funnel/route.ts", names: ["import-cf-page-month", "import-cf-plan-month", "import-cf-save-month"] },
      { file: "docs/clickfunnels-import.md", names: ["Worst-case commands per call"] },
    ],
    basis: "Each path's monthly figure at docs/clickfunnels-import.md's command ceilings, each request at its shape and the bytes it moves.",
  },
  {
    id: "funnel-share",
    feature: "Sharing and copying funnels, starters and saved sections (#510)",
    monthlyUsd: (tier) => {
      const l = SHARE_LIMITS[tier];
      const kept = (l.shares * 2 * l.bundleBytes + l.savedBlocks * MAX_SECTION_BYTES) * DB_BYTE_MONTH;
      const linkReads = l.shares * (IMPORTS_PER_SHARE_MONTH * request("light", 6, l.bundleBytes) + PREVIEWS_PER_SHARE_MONTH * request("light", 4, 20_000));
      const own = l.importsPerMonth * request("write", 300, l.bundleBytes + 30 * MAX_PAGE_BYTES)
        + l.previewsPerMonth * request("light", 30, 50_000)
        + l.appliesPerMonth * request("write", MAX_APPLY_PAGES * 10, MAX_APPLY_PAGES * 4 * MAX_PAGE_BYTES)
        + l.sharesPerMonth * request("write", 60, 10 * MAX_PAGE_BYTES + 3 * l.bundleBytes)
        + l.exportsPerMonth * request("write", 40, 10 * MAX_PAGE_BYTES + l.bundleBytes);
      return kept + linkReads + own;
    },
    sources: [
      { file: "lib/funnel-share-rules.ts", names: ["SHARE_LIMITS", "IMPORTS_PER_SHARE_MONTH", "PREVIEWS_PER_SHARE_MONTH", "PREVIEWS_PER_STORE_HOUR", "MAX_APPLY_PAGES"] },
      { file: "lib/funnel-share-store.ts", names: ["storeMonthKey", "shareMonthKey"] },
      { file: "lib/saved-blocks.ts", names: ["MAX_SECTION_BYTES"] },
    ],
    basis: "Links and sections kept, every link read by others at its monthly figure, and every import, preview, update from a section, link made and file exported of the month, each page read and written with its earlier version.",
  },
  {
    id: "team-scheduling",
    feature: "Team event types and each host's calendar (#522)",
    monthlyUsd: (tier) => {
      const limits = TEAM_LIMITS[tier];
      // Hosts whose calendars a store's team calls can have read: every host of every team call, at most everybody on the store.
      const hosts = Math.min(limits.eventTypes * limits.hosts, MAX_TEAM + 1);
      const readings = hosts * Math.ceil((UTC_DAYS * 86_400) / SYNC_SECONDS) * TEAM_READING;
      // Every page of every visit after the first a team call's page, each reading each host's claims, state and connection.
      const views = VISITS_INCLUDED[tier] * (PAGES_PER_VISIT - 1) * (limits.hosts * TEAM_COMMANDS_PER_HOST_VIEW + TEAM_COMMANDS_PER_VIEW) * COMMAND;
      return readings + views;
    },
    sources: [
      { file: "lib/team-scheduling-rules.ts", names: ["TEAM_LIMITS", "TRIAL_TEAM_LIMITS", "SETUP_TEAM_LIMITS"] },
      { file: "lib/host-calendar.ts", names: ["SYNC_SECONDS", "STALE_SECONDS", "prefetchHosts"] },
      { file: "lib/team-booking.ts", names: ["prefetchHosts", "readClaims", "rrKey"] },
      { file: "lib/team.ts", names: ["MAX_TEAM"] },
    ],
    basis: "Each host's calendar read at most once a sync interval all month (about seven commands and its wait for the calendar inside the page that asked), and every later page of every visit a team call's page reading each host's claims (one command each), every host's calendar state and connection in one command, and the team's round-robin counts.",
  },
  {
    id: "quizzes",
    feature: "Course quiz submissions",
    monthlyUsd: ALL_TIERS_SAME(QUIZ_MONTHLY_SUBMISSIONS * request("light", 8)),
    sources: [{ file: "lib/quiz-usage-rules.ts", names: ["QUIZ_MONTHLY_SUBMISSIONS"] }],
    basis: "Every submission of the month, a request and its writes.",
  },
  {
    id: "collections",
    feature: "Collections and picks (#508)",
    monthlyUsd: ALL_TIERS_SAME(0),
    sources: [{ file: "app/[handle]/shop/[collection]/page.tsx", names: ["isResting"] }],
    basis: "A collection page is a public page of the store: it rests with them and counts as a visit, so it is inside the visits line.",
  },
  {
    id: "embed",
    feature: "Selling from any website (#518)",
    monthlyUsd: ALL_TIERS_SAME(0),
    sources: [{ file: "lib/embed-open.ts", names: ["isResting", "recordVisit", "OPENS_PER_TEN_MINUTES"] }],
    basis: "Page views load nothing from us; an open of a card counts as a visit and rests with the public pages, so it is inside the visits line, and a checkout from it is an order.",
  },
];

/** Per-use costs that no monthly figure bounds yet: not in worstCost, so nothing here is certified. */
export type OpenItem = { id: string; what: string; names?: string[] };
export const OPEN: OpenItem[] = [
  { id: "public-requests", what: "A visit is counted once a day per person, but the requests a person makes (repeat pages, thanks and review pages, downloads, store search, the cart, checkout opens) are bounded only per connection, not per store." },
  { id: "studio-requests", what: "The studio's own reads and writes (saving products, pages, sections, settings, exports of data) have no monthly figure per store." },
  { id: "transactional-email", what: "Sign-in links, buyers' links to their purchases and other transactional emails are not counted against TRANSACTIONAL by any counter." },
  { id: "rest-api", what: "The REST API (120 requests a minute per key) and its writes (contacts added, products given) are bounded by the day, not the month.", names: ["ADDS_PER_DAY", "GIVES_PER_DAY"] },
  { id: "inbox", what: "The inbox: visitor messages, replies by email and notices to the creator, bounded by the day.", names: ["NEW_PER_DAY", "VISITOR_PER_HOUR"] },
  { id: "creator-email", what: "Emails a store's paths send outside the monthly emails: resending a purchase, contact-form and inbound-mail notices, checkout reminders a buyer asks for, come-back and welcome offers.", names: ["MAX_PER_DAY", "ASKS_PER_STORE_DAY", "ONCE_PER_DAYS"] },
  { id: "buyer-actions", what: "What buyers do inside what they bought: lesson comments, task hand-ins, community posts, events and messages, bounded per person.", names: ["COMMENTS_PER_DAY", "COMMENTS_PER_MINUTE", "EVENT_WRITES_PER_HOUR", "RATE_LIMITS"] },
  { id: "integrations", what: "Calls to other services from the studio (a host's Check now of their calendar, meetings, Zoom, Discord, email platforms, Meta ads, PayPal payouts, affiliate kits, outreach searches, person lookups, the vault, video upload doors, email pictures), bounded by the minute or hour.", names: ["KIT_PER_DAY", "PITCHES_PER_DAY", "OPENS_PER_DAY"] },
  { id: "calls", what: "Booked calls and call packages are not orders: their checkouts and emails are not counted or admitted.", names: ["MAX_RANGES_PER_DAY"] },
  { id: "group-places", what: "A place claimed in a later month from a purchase for several people made earlier counts in the month it is claimed; its purchase held room for all its places only for a day." },
  { id: "free-and-trial", what: "Stores in a free trial or with no plan: their paid orders, buyers' pages and the stores' own use are the funded exposures of docs/funded-exposure-review.md, not a plan's worst month." },
  { id: "database-storage", what: "Store records, contacts, page versions, stats and other data kept in the database have no per-store byte figure (only per-kind caps)." },
  { id: "billing-period", what: "Allowances are by calendar month while a subscription's period starts on any day, so one billing period can touch two calendar months of every allowance." },
  { id: "webhooks", what: "A webhook's first try runs in the request or job that raised the event; retries ride a job with a company-wide bound." },
];

/** Exported limit or cost constants that are not a per-store monthly cost, and why. */
export const NOT_A_COST: Record<string, string> = {
  CENTS_PER_MINUTE: "AI captions are bought at their own price, charged before the work (lib/auto-captions-rules.ts).",
  MAX_PAGES_PER_STORE: "Pages of Stripe sessions the five-minute job reads per store per run: a scheduled job, bounded by its schedule (a company fixed cost).",
  QUIET_PER_HOUR: "Sale notifications to the creator's phone: one per counted order at most, inside the order's compute.",
  VERCEL_CPU_MICRO_USD_PER_HOUR: "A rate, not a cap.",
  ASKS_PER_TEN_MINUTES: "A burst limit under ANSWERS_MONTHLY (line ai).",
  STORE_ASKS_PER_MINUTE: "A burst limit under ANSWERS_MONTHLY (line ai).",
  TRIAL_MONTHLY_EMAILS: "The free trial's emails: a funded exposure (OPEN free-and-trial).",
  DAILY_CAPS: "The choices of a host's own daily booking cap: how many calls a host takes, not a cost.",
};

/** What a scope of a counter in the code is: counted in a line, an abuse guard, or open. */
export type ScopeClass = { line: string } | { open: string } | { guard: string };
const guard = (why: string): ScopeClass => ({ guard: why });
const line = (id: string): ScopeClass => ({ line: id });
const open = (id: string): ScopeClass => ({ open: id });
const ACCOUNT = guard("Sign-in and account security, per address or connection: a company cost per creator account, not per store use.");
const PUBLIC = open("public-requests");

export const SCOPES: Record<string, ScopeClass> = {
  // Counted in a line.
  "import-preview": line("clickfunnels"), "import-preview-month": line("clickfunnels"), "import-preview-buyers-month": line("clickfunnels"),
  "import-cf-page": line("clickfunnels"), "import-cf-page-month": line("clickfunnels"), "import-cf-plan": line("clickfunnels"),
  "import-cf-plan-month": line("clickfunnels"), "import-cf-save": line("clickfunnels"), "import-cf-save-month": line("clickfunnels"),
  "import-start": line("imports"), "import-start-month": line("imports"), "import-step": line("imports"), "import-step-month": line("imports"),
  "import-rows": line("imports"), "import-report": line("imports"), "import-report-month": line("imports"),
  "countUse:shareMonthKey(opened.id": line("funnel-share"), "countUse:storeMonthKey(statsId": line("funnel-share"),
  "countUse:storeMonthKey(store.statsId": line("funnel-share"), "countUse:storeUseKey(statsId": line("funnel-share"), "countUse:key: string": line("funnel-share"),
  ai: line("ai"), ask: line("ai"), "ask-day": line("ai"), "ask-store": line("ai"), "chat-summary": line("ai"),
  "embed-open": line("embed"), checkout: line("orders"), upsell: line("orders"), "group-place": line("orders"),
  "podcast-feed": line("visits"), "<dynamic:allowance[0]>": line("visits"),
  "<dynamic:scope: string>": guard("The definition of withinLimit and withinMonth themselves (lib/request-guard.ts)."),
  // Sign-in and account security.
  join: ACCOUNT, passkey: ACCOUNT, "passkey-change": ACCOUNT, "two-step": ACCOUNT, "two-step-backup": ACCOUNT, "two-step-change": ACCOUNT,
  "two-step-rescue": ACCOUNT, "recovery-address": ACCOUNT, "recovery-address-change": ACCOUNT, "lost-email": ACCOUNT, "lost-email-ip": ACCOUNT,
  "discord-return": ACCOUNT, "metaads-return": ACCOUNT, "meet-return": ACCOUNT, report: guard("Takedown reports, per connection: a company cost."),
  "mail-ses": guard("The email provider's own notices: a company cost."), "mail-inbound": open("creator-email"), "mail-clicked": PUBLIC,
  "stream-hook": guard("The video service's own notices: a company cost."), "zoom-notice": guard("Zoom's own notices: a company cost."),
  "metaads-deauth": guard("Meta's own notices: a company cost."), "outreach-stop": guard("A recipient's stop link: a company cost."),
  // Public requests, per connection.
  "ads-event": PUBLIC, "aff-join": PUBLIC, "aff-open": PUBLIC, "affhub-address": PUBLIC, "affhub-ip": PUBLIC, book: open("calls"), "book-move": open("calls"),
  "cart-read": PUBLIC, "chat-send": open("inbox"), "chat-start": open("inbox"), "come-back": PUBLIC, "contact-ip": open("creator-email"),
  "course-start": PUBLIC, "course-start-order": PUBLIC, "discord-join": PUBLIC, download: PUBLIC, "form-ip": PUBLIC, heard: PUBLIC,
  "join-address": PUBLIC, "join-ip": PUBLIC, "library-address": open("transactional-email"), "library-ip": open("transactional-email"),
  "manage-card": PUBLIC, "manage-card-back": PUBLIC, "manage-leave": PUBLIC, "manage-open": PUBLIC, "move-open": PUBLIC, "numbers-link": open("integrations"),
  "paypal-return": PUBLIC, "podcast-link-address": open("transactional-email"), "podcast-link-ip": open("transactional-email"), preview: PUBLIC,
  "remind-ask": open("creator-email"), review: PUBLIC, "review-order": PUBLIC, "review-view": PUBLIC, "store-search": PUBLIC,
  "thanks-view": PUBLIC, "tier-switch": PUBLIC, tip: PUBLIC, "waitlist-address": PUBLIC, "waitlist-ip": PUBLIC, "welcome-open": PUBLIC,
  "lesson-comment": open("buyer-actions"), "lesson-comment-day": open("buyer-actions"), "task-hand-in": open("buyer-actions"), "task-upload": open("buyer-actions"),
  // Per store, with no monthly figure yet.
  api: open("rest-api"), "api-add": open("rest-api"), "api-give": open("rest-api"),
  "inbox-new": open("inbox"), "inbox-reply": open("inbox"), "inbox-tell": open("inbox"),
  "contact-store": open("creator-email"), "remind-store": open("creator-email"), "resend-sale": open("creator-email"), "resend-store": open("creator-email"),
  "creator-inbound": open("creator-email"),
  "meet-host": open("integrations"), "meet-manage": open("integrations"), "meet-start": open("integrations"), "metaads-start": open("integrations"),
  "discord-connect": open("integrations"), esync: open("integrations"), "paypal-connect": open("integrations"), "paypal-pay": open("integrations"),
  "paypal-sell-connect": open("integrations"), "aff-kit": open("integrations"), "aff-payto": open("integrations"), "outreach-find": open("integrations"),
  "outreach-find-day": open("integrations"), "person-find": open("integrations"), "vault-open": open("integrations"), "vault-sign": open("integrations"),
  "stream-door": open("integrations"), "stream-captions": open("integrations"), "mail-picture": open("integrations"),
  "bundle-picker": open("studio-requests"),
  "host-calendar": open("integrations"),
};
