/**
 * Questions that branch (lib/forms.ts, pathOf; added 13 October 2026). Checked:
 *
 *   - an answer leads only forward, to a question still there, or ends the
 *     form; anything else goes on to the next question;
 *   - the questions asked follow the answers, and those skipped need no
 *     answer and keep none, even when sent;
 *   - an answer that ends a quiz decides its result when it points at one;
 *     otherwise the result is the one most answers point at.
 */
import { END, branches, outcomeOf, parseForm, pathOf, readAnswers } from "@/lib/forms";
import { done, is, part } from "./check";

const raw = {
  id: "branchy001",
  name: "Coaching application",
  fields: [
    { id: "q1aaaa", type: "choice", label: "Have you sold online before?", required: true, options: [{ id: "yes001", label: "Yes", outcome: "res002", next: "q3cccc" }, { id: "no0001", label: "No", outcome: "res001" }, { id: "skip01", label: "Just looking", outcome: "res003", next: END }] },
    { id: "q2bbbb", type: "short", label: "What would you sell?", required: true },
    { id: "q3cccc", type: "choice", label: "How much a month?", required: true, options: [{ id: "low001", label: "Under $1,000", outcome: "res001" }, { id: "hi0001", label: "More", outcome: "res002", next: "q1aaaa" }] },
    { id: "q4dddd", type: "email", label: "Your email", required: true },
    { id: "q5eeee", type: "choices", label: "Where?", required: false, options: [{ id: "ig0001", label: "Instagram", outcome: "", next: "q4dddd" }, { id: "tt0001", label: "TikTok", outcome: "" }] },
  ],
  outcomes: [
    { id: "res001", title: "Start with the basics", body: "", product: "" },
    { id: "res002", title: "Grow what works", body: "", product: "" },
    { id: "res003", title: "Have a look around", body: "", product: "" },
  ],
};

function main(): void {
  part("Only forward, or the end");
  const form = parseForm(raw)!;
  is("a jump forward and an end are kept; a jump back, and one on a many-choice question, are not", [
    form.fields[0].options.map((o) => o.next ?? ""),
    form.fields[2].options.map((o) => o.next ?? ""),
    form.fields[4].options.map((o) => o.next ?? ""),
  ], [["q3cccc", "", END], ["", ""], ["", ""]]);
  is("it branches", [branches(form), branches(parseForm({ ...raw, fields: raw.fields.map((f) => ({ ...f, options: (f.options ?? []).map((o) => ({ ...o, next: "" })) })) })!)], [true, false]);

  part("The questions asked follow the answers");
  const path = (choices: Record<string, string>) => pathOf(form, (id) => choices[id]).map((f) => f.id);
  is("yes skips to the third question", path({ q1aaaa: "yes001" }), ["q1aaaa", "q3cccc", "q4dddd", "q5eeee"]);
  is("no goes on in order", path({ q1aaaa: "no0001" }), ["q1aaaa", "q2bbbb", "q3cccc", "q4dddd", "q5eeee"]);
  is("just looking ends it there", path({ q1aaaa: "skip01" }), ["q1aaaa"]);
  is("before any answer, every question in order", path({}), ["q1aaaa", "q2bbbb", "q3cccc", "q4dddd", "q5eeee"]);

  part("Questions skipped need no answer and keep none");
  const read = (values: Record<string, string[]>) => readAnswers(form, (name) => values[name.replace(/^q_/, "")] ?? []);
  const yes = read({ q1aaaa: ["yes001"], q2bbbb: ["sent anyway"], q3cccc: ["low001"], q4dddd: ["a@example.com"] });
  is("yes: the skipped question is neither asked for nor kept", yes, { ok: true, answers: { q1aaaa: "yes001", q3cccc: "low001", q4dddd: "a@example.com" }, email: "a@example.com" });
  is("no: the second question is asked for", read({ q1aaaa: ["no0001"], q3cccc: ["low001"], q4dddd: ["a@example.com"] }), { ok: false, error: "required", field: "q2bbbb" });
  const looking = read({ q1aaaa: ["skip01"], q4dddd: ["sent@example.com"] });
  is("just looking: nothing after it is asked for or kept", looking, { ok: true, answers: { q1aaaa: "skip01" }, email: "" });

  part("The result");
  is("an answer that ends the quiz decides it", looking.ok ? outcomeOf(form, looking.answers)?.title : "", "Have a look around");
  is("otherwise the one most answers point at, the first on a tie", [
    outcomeOf(form, { q1aaaa: "yes001", q3cccc: "hi0001" })?.title,
    outcomeOf(form, { q1aaaa: "no0001", q2bbbb: "x", q3cccc: "hi0001" })?.title,
    yes.ok ? outcomeOf(form, yes.answers)?.title : "",
  ], ["Grow what works", "Start with the basics", "Start with the basics"]);

  done();
}

main();
