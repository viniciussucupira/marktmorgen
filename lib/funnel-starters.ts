/**
 * Starter funnels (added 17 October 2026): whole funnels with Marktmorgen's
 * own starting words, in the same file format a creator shares
 * (lib/funnel-bundle.ts), so a starter is previewed, mapped to the
 * creator's products and checked exactly like a shared funnel.
 *
 * The funnel types (lib/funnel-types.ts) make empty pages under a title. A
 * starter goes one step further and writes a first draft of the words:
 * headings, the steps of what happens next, the questions buyers ask. Every
 * sentence is one a creator can say truthfully as it stands, or is a
 * placeholder in [brackets] for what only they know. None states a result,
 * a number, a deadline or what somebody said about them, and the pages
 * arrive kept back from visitors until the creator has made them theirs.
 */
import { BUNDLE_FORMAT, BUNDLE_SCHEMA, type FunnelBundle } from "@/lib/funnel-bundle";

export type FunnelStarter = { id: string; label: string; hint: string; bundle: FunnelBundle };

const nextSteps = (first: { title: string; detail: string }) => ({
  ref: "p2",
  title: "What happens next",
  slug: "what-happens-next",
  target: "",
  style: "plain" as const,
  blocks: [
    { id: "nx01", kind: "hero" as const, headline: "Thank you. Here is what happens next", sub: "", media: "none" as const, video: null },
    {
      id: "nx02",
      kind: "steps" as const,
      heading: "Your next steps",
      items: [
        first,
        { title: "Start here", detail: "[Tell them where to begin and the first thing to do.]" },
        { title: "Get in touch", detail: "[Tell them how to reach you with a question.]" },
      ],
    },
    { id: "nx03", kind: "cta" as const, label: "Visit the store", note: "" },
  ],
});

export const FUNNEL_STARTERS: FunnelStarter[] = [
  {
    id: "guide-signup",
    label: "Free guide, then your first offer",
    hint: "A page about your free guide, the guide's own sign-up page, your first paid product, and a page that says what happens next.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Free guide",
      products: [
        { ref: "x1", label: "Your free guide", wants: "free" },
        { ref: "x2", label: "Your first paid product", wants: "paid" },
      ],
      forms: [],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "product", ref: "x1" },
        { kind: "product", ref: "x2" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Free guide",
          slug: "free-guide",
          target: "x1",
          style: "plain",
          blocks: [
            {
              id: "gs01",
              kind: "hero",
              headline: "A free guide to [your topic]",
              sub: "A short, practical guide you can read in one sitting. It is free: enter your email on the next page and the download link comes to your inbox.",
              media: "none",
              video: null,
              button: true,
            },
            { id: "gs02", kind: "benefits", heading: "What the guide covers", items: ["[The first thing it helps with]", "[The second thing it helps with]", "[The third thing it helps with]"] },
            { id: "gs03", kind: "bio", heading: "", body: "", photo: true },
            {
              id: "gs04",
              kind: "faq",
              heading: "Questions",
              items: [
                { q: "Is it really free?", a: "Yes. You enter your email address and the download link is sent to it." },
                { q: "Will I get other emails?", a: "[Say whether you will email them again, about what, and that they can unsubscribe at any time.]" },
              ],
            },
            { id: "gs05", kind: "cta", label: "Get the free guide", note: "" },
          ],
        },
        nextSteps({ title: "Check your email", detail: "Your download link is on its way. If it is not there in a few minutes, look in your spam or promotions folder." }),
      ],
    },
  },
  {
    id: "recorded-workshop",
    label: "Recorded workshop",
    hint: "A page with a recorded workshop that leads to your program, its sales page, and a page that says what happens next. Recorded, and called recorded.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Recorded workshop",
      products: [{ ref: "x1", label: "The program the workshop leads to", wants: "paid" }],
      forms: [],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "product", ref: "x1" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Free workshop",
          slug: "free-workshop",
          target: "x1",
          style: "bands",
          blocks: [
            { id: "rw01", kind: "hero", headline: "Watch the free workshop: [your topic]", sub: "A recorded workshop of about [length] minutes. Watch it whenever suits you.", media: "none", video: null },
            { id: "rw02", kind: "video", heading: "The workshop", video: null, caption: "" },
            { id: "rw03", kind: "text", heading: "What we cover", body: "- [The first point]\n- [The second point]\n- [The third point]" },
            { id: "rw04", kind: "bio", heading: "", body: "", photo: true },
            { id: "rw05", kind: "cta", label: "See the full program", note: "" },
          ],
        },
        nextSteps({ title: "Check your email", detail: "Your receipt and how to get started are in your inbox." }),
      ],
    },
  },
  {
    id: "coaching-application",
    label: "Coaching application",
    hint: "A page that says who you work with and how, with an application form, and a page that says what happens after applying. You read each application and decide whom to answer.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Coaching application",
      products: [],
      forms: [
        {
          ref: "f1",
          name: "Application",
          fields: [
            { id: "apnm01", type: "short", label: "Your name", required: true, options: [] },
            { id: "apem01", type: "email", label: "Your email", required: true, options: [] },
            { id: "aphl01", type: "long", label: "What would you like help with?", required: true, options: [] },
            { id: "aptr01", type: "long", label: "What have you tried so far?", required: false, options: [] },
          ],
          button: "Send my application",
          doneHeading: "Thank you, your application is in",
          doneBody: "[Tell them when and how you reply to applications.]",
          outcomes: [],
          offerList: false,
        },
      ],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Work with me",
          slug: "work-with-me",
          target: "",
          style: "cards",
          blocks: [
            { id: "ca01", kind: "hero", headline: "Apply to work with me", sub: "[Who you help, and with what.] Answer a few questions so we can both see whether it is a good fit.", media: "none", video: null },
            { id: "ca02", kind: "fit", heading: "Is this for you?", yesLabel: "A good fit if you", noLabel: "Not the right fit if you", yes: ["[Describe who you work best with]"], no: ["[Describe who you are not the right person for]"] },
            {
              id: "ca03",
              kind: "steps",
              heading: "How it works",
              items: [
                { title: "Apply", detail: "Answer the questions on this page. It takes a few minutes." },
                { title: "Talk", detail: "[What happens if it looks like a fit, for example a short call.]" },
                { title: "Start", detail: "[What working together looks like.]" },
              ],
            },
            { id: "ca04", kind: "form", heading: "Your application", form: "f1" },
            {
              id: "ca05",
              kind: "faq",
              heading: "Questions",
              items: [
                { q: "What does it cost?", a: "[Your answer.]" },
                { q: "How do we meet?", a: "[Your answer.]" },
              ],
            },
          ],
        },
        {
          ref: "p2",
          title: "After you apply",
          slug: "after-you-apply",
          target: "",
          style: "plain",
          blocks: [
            { id: "aa01", kind: "hero", headline: "Thank you for applying", sub: "", media: "none", video: null },
            { id: "aa02", kind: "text", heading: "What happens now", body: "[Say when you read applications and how you reply.]" },
            { id: "aa03", kind: "cta", label: "Visit the store", note: "" },
          ],
        },
      ],
    },
  },
  {
    id: "membership",
    label: "Membership, with a page that sells it",
    hint: "A page about your membership, the membership itself, and a page that says what happens after joining.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Membership",
      products: [{ ref: "x1", label: "Your membership", wants: "paid" }],
      forms: [],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "product", ref: "x1" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Membership",
          slug: "membership",
          target: "x1",
          style: "bands",
          blocks: [
            { id: "mb01", kind: "hero", headline: "Join [the name of your membership]", sub: "[Who it is for, and what members get each month.] Members can cancel on their own, at the end of the period they paid for.", media: "none", video: null, button: true },
            { id: "mb02", kind: "benefits", heading: "What members get", items: ["[The first thing members get]", "[The second thing members get]", "[How often something new arrives]"] },
            { id: "mb03", kind: "fit", heading: "Is it for you?", yesLabel: "Right for you if you", noLabel: "Not right for you if you", yes: ["[Describe who it suits]"], no: ["[Describe who it does not suit]"] },
            { id: "mb04", kind: "bio", heading: "", body: "", photo: true },
            {
              id: "mb05",
              kind: "faq",
              heading: "Questions",
              items: [
                { q: "How do I cancel?", a: "Under the membership on this store, press Manage or cancel and follow the emailed link. It ends at the end of the period you paid for." },
                { q: "What happens after I join?", a: "[Tell them where they find everything and what to do first.]" },
              ],
            },
            { id: "mb06", kind: "cta", label: "Join the membership", note: "" },
          ],
        },
        nextSteps({ title: "Check your email", detail: "Your receipt and how to get in are in your inbox." }),
      ],
    },
  },
  {
    id: "course-free-lesson",
    label: "Free lesson, then the course",
    hint: "A page about a free lesson, the lesson's own sign-up page, the full course, and a page that says what happens next.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Free lesson",
      products: [
        { ref: "x1", label: "Your free lesson", wants: "free" },
        { ref: "x2", label: "Your full course", wants: "paid" },
      ],
      forms: [],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "product", ref: "x1" },
        { kind: "product", ref: "x2" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Free lesson",
          slug: "free-lesson",
          target: "x1",
          style: "plain",
          blocks: [
            { id: "fl01", kind: "hero", headline: "A free lesson from [your course]", sub: "The first lesson of the course, free. Enter your email on the next page and the link comes to your inbox.", media: "none", video: null, button: true },
            { id: "fl02", kind: "text", heading: "In this lesson", body: "- [The first thing it covers]\n- [The second thing it covers]" },
            { id: "fl03", kind: "text", heading: "In the full course", body: "[Say what the rest of the course covers, how many lessons it has, and how long it takes.]" },
            { id: "fl04", kind: "bio", heading: "", body: "", photo: true },
            { id: "fl05", kind: "cta", label: "Get the free lesson", note: "" },
          ],
        },
        nextSteps({ title: "Check your email", detail: "Your link is on its way. If it is not there in a few minutes, look in your spam or promotions folder." }),
      ],
    },
  },
  {
    id: "paid-call",
    label: "A paid call",
    hint: "A page about a call with you, the call itself to book and pay for, and a page that says how to prepare.",
    bundle: {
      format: BUNDLE_FORMAT,
      schema: BUNDLE_SCHEMA,
      name: "Paid call",
      products: [{ ref: "x1", label: "Your call", wants: "paid" }],
      forms: [],
      steps: [
        { kind: "page", ref: "p1" },
        { kind: "product", ref: "x1" },
        { kind: "page", ref: "p2" },
      ],
      pages: [
        {
          ref: "p1",
          title: "Book a call",
          slug: "book-a-call",
          target: "x1",
          style: "cards",
          blocks: [
            { id: "pc01", kind: "hero", headline: "A [length]-minute call with me about [your topic]", sub: "[Who it is for, and what you will look at together.] Pick a time that suits you when you book.", media: "none", video: null, button: true },
            {
              id: "pc02",
              kind: "steps",
              heading: "How it works",
              items: [
                { title: "Book", detail: "Choose a time and pay. The meeting link comes with your confirmation." },
                { title: "Prepare", detail: "[Tell them what to bring or send before the call.]" },
                { title: "Talk", detail: "[Say what happens on the call and what they leave with.]" },
              ],
            },
            { id: "pc03", kind: "fit", heading: "Is it for you?", yesLabel: "Book if you", noLabel: "Not the right call if you", yes: ["[Describe who it helps]"], no: ["[Describe who it does not help]"] },
            {
              id: "pc04",
              kind: "faq",
              heading: "Questions",
              items: [
                { q: "Can I move my booking?", a: "[Say whether and until when they can move it.]" },
                { q: "Is it recorded?", a: "[Your answer.]" },
              ],
            },
            { id: "pc05", kind: "cta", label: "Book the call", note: "" },
          ],
        },
        nextSteps({ title: "Check your email", detail: "Your booking, its time and the meeting link are in your inbox." }),
      ],
    },
  },
];

export function funnelStarter(id: unknown): FunnelStarter | null {
  return FUNNEL_STARTERS.find((starter) => starter.id === id) ?? null;
}
