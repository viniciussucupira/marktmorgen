import { DEFAULT_ATTEMPTS, MAX_ATTEMPTS, parseQuiz, readQuiz, saveQuiz, readQuizFor, submitQuiz, type Quiz } from "@/lib/quiz";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const input = { passPercent: 70, required: true, questions: [{ text: "Which is correct?", choices: ["Yes", "No"], correct: [0], explanation: "Yes." }] };
function quiz(attempts: unknown, existing: Quiz | null = null): Quiz {
  const r = readQuiz({ ...input, attempts }, existing);
  if (!r.ok) throw new Error(r.reason);
  return r.quiz;
}
async function main() {
  redis.clear();
  part("Finite new quizzes");
  for (const attempts of [undefined, null, "", "  "]) is("blank uses the finite default", quiz(attempts).attempts, DEFAULT_ATTEMPTS);
  for (const attempts of [0, "0", -1, 11, 1.5, "no limit"]) is("invalid or unbounded limit rejected", readQuiz({ ...input, attempts }).ok, false);
  is("minimum accepted", quiz(1).attempts, 1);
  is("maximum accepted", quiz(MAX_ATTEMPTS).attempts, MAX_ATTEMPTS);
  const legacy = { ...quiz(3), attempts: 0 };
  part("Existing settings");
  is("legacy stored zero remains readable", parseQuiz(JSON.stringify(legacy))?.attempts, 0);
  for (const attempts of [undefined, null, -1, 11, "bad"]) is("invalid stored attempts do not become unbounded", parseQuiz(JSON.stringify({ ...legacy, attempts })), null);
  is("existing zero retained explicitly", quiz(0, legacy).attempts, 0);
  is("old editor blank retains the legacy setting", quiz("", legacy).attempts, 0);
  is("legacy can choose a finite limit", quiz(2, legacy).attempts, 2);
  is("finite quiz cannot gain an unbounded setting", readQuiz({ ...input, attempts: 0 }, quiz(3)).ok, false);
  const finite = quiz(2);
  await saveQuiz("a".repeat(32), "lesson000001", finite);
  is("finite limit survives storage", (await readQuizFor("a".repeat(32), "lesson000001"))?.attempts, 2);
  part("Actual submissions respect the limit");
  const wrong = { [finite.questions[0].id]: [1] };
  is("first try accepted", (await submitQuiz("a".repeat(32), "lesson000001", "learner", finite, wrong)).ok, true);
  is("second try accepted", (await submitQuiz("a".repeat(32), "lesson000001", "learner", finite, wrong)).ok, true);
  const blocked = await submitQuiz("a".repeat(32), "lesson000001", "learner", finite, wrong);
  is("third try rejected", blocked.ok ? "accepted" : blocked.reason, "no_tries");
  const fresh = await submitQuiz("a".repeat(32), "lesson000001", "another", finite, wrong);
  is("another learner has their own allowance", fresh.ok ? fresh.attempt.used : null, 1);
  await saveQuiz("a".repeat(32), "legacy000001", legacy);
  const old = (await readQuizFor("a".repeat(32), "legacy000001"))!;
  for (let i = 0; i < 4; i++) await submitQuiz("a".repeat(32), "legacy000001", "legacy-learner", old, { [old.questions[0].id]: [1] });
  const continued = await submitQuiz("a".repeat(32), "legacy000001", "legacy-learner", old, { [old.questions[0].id]: [1] });
  is("legacy allowance is not retroactively capped", continued.ok ? continued.attempt.used : null, 5);
  done();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
