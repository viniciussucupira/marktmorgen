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
];

export function funnelStarter(id: unknown): FunnelStarter | null {
  return FUNNEL_STARTERS.find((starter) => starter.id === id) ?? null;
}
