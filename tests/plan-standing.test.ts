/**
 * What a store may keep and play, by where it stands with its plan
 * (lib/plan-standing.ts).
 *
 * Opening a store costs nothing and asks for nothing but an email address.
 * Until this was written, such a store had the room of one that pays: two
 * hundred gigabytes kept, and four hundred hours of lesson video watched a
 * month. Nothing was set against either, so a free store address was a free
 * video host, for as long as anybody cared to use it as one.
 *
 * These hold the three things that close it: a store is read as paid, in
 * its trial, never started or ended from what its record says; each of
 * those has its own room; and the day a plan ends is written down once.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLANS_ON_SALE } from "@/lib/opening";
import { SETUP_STORAGE_BYTES, SETUP_VIDEO_HOURS, SETUP_VIDEO_SECONDS, TRIAL_STORAGE_BYTES, standingOf, storageRefusal, videoLimitFor } from "@/lib/plan-standing";
import { STORAGE_BRAKE_BYTES, fits, storageBrakeFor, storageUsed, storageWords } from "@/lib/storage-quota";
import { claimHandle, setSubscription, storeForEmail } from "@/lib/store";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { VIDEO_HOURS_INCLUDED, VIDEO_SECONDS_INCLUDED, canBeCharged } from "@/lib/watch-rules";
import { done, is, part } from "./check";

const GB = 1024 * 1024 * 1024;
const NOW = 1_800_000_000;
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

async function main(): Promise<void> {
  part("Where a store stands");
  const never = { subscriptionActive: false, subscriptionId: null, stripeCustomerId: null, trialEnds: 0, planEndedAt: "" };
  const trial = { subscriptionActive: true, subscriptionId: "sub_Trial00001", stripeCustomerId: "cus_Trial00001", trialEnds: NOW + 86_400, planEndedAt: "" };
  const paid = { ...trial, trialEnds: NOW - 86_400 };
  const ended = { ...paid, subscriptionActive: false, planEndedAt: "2026-10-01T00:00:00.000Z" };
  is("a store that never started a plan", standingOf(never, NOW), "none");
  is("one inside a plan's free days", standingOf(trial, NOW), "trial");
  is("one that pays", standingOf(paid, NOW), "paid");
  is("one whose plan is over", standingOf(ended, NOW), "ended");
  is("a plan that is not running has ended, even where the day was never written down", standingOf({ ...ended, planEndedAt: "" }, NOW), "ended");
  is("the store this site runs itself pays nobody and stands as paid", standingOf({ ...never, subscriptionActive: true }, NOW), "paid");
  is("only a store that pays, with a subscription behind it, can have an hour added to an invoice", [canBeCharged(paid, NOW), canBeCharged(trial, NOW), canBeCharged(ended, NOW), canBeCharged({ ...never, subscriptionActive: true }, NOW)], [true, false, false, false]);

  part("How long its video may be watched in a month");
  is("a store that pays is never paused: its hours past the plan are charged", videoLimitFor(paid, NOW), null);
  is("nor is the store this site runs itself", videoLimitFor({ ...never, subscriptionActive: true }, NOW), null);
  is("a trial plays for the hours a plan covers", videoLimitFor(trial, NOW), VIDEO_SECONDS_INCLUDED);
  is("a store with no plan, before one or after one, for a few", [videoLimitFor(never, NOW), videoLimitFor(ended, NOW)], [SETUP_VIDEO_SECONDS, SETUP_VIDEO_SECONDS]);
  is("which is far less than a plan's", SETUP_VIDEO_HOURS * 10 <= VIDEO_HOURS_INCLUDED, true);
  is("and costs us cents: ten hours at the most an hour can cost", SETUP_VIDEO_HOURS * 0.0144 < 0.2, true);

  part("How much it may keep");
  is("a paid plan has the brake every plan has", storageBrakeFor("paid"), STORAGE_BRAKE_BYTES);
  is("a trial has a quarter of it", [storageBrakeFor("trial"), TRIAL_STORAGE_BYTES], [50 * GB, 50 * GB]);
  is("a store with no plan has five gigabytes, before one or after one", [storageBrakeFor("none"), storageBrakeFor("ended"), SETUP_STORAGE_BYTES], [5 * GB, 5 * GB, 5 * GB]);
  is("which is twelve cents a month at the dearest rate a file is kept at", ((SETUP_STORAGE_BYTES / GB) * 0.023).toFixed(3), "0.115");
  is("and a trial that keeps all it may costs us little over a dollar a month", (TRIAL_STORAGE_BYTES / GB) * 0.023 < 1.2, true);
  const empty = await storageUsed("0123456789abcdef0123456789abcdef", storageBrakeFor("none"));
  is("unavailable storage is not treated as an empty store", [empty.brake, empty.available, empty.left], [5 * GB, false, 0]);
  is("unavailable storage cannot authorize an upload", fits(empty, 5 * GB), false);
  is("one that would take a store with no plan past its figure is not", fits(empty, 5 * GB + 1), false);
  const half = { bytes: 3 * GB, brake: 5 * GB, left: 2 * GB, full: false, available: true };
  is("it is what is left that a file has to fit in", [fits(half, 2 * GB), fits(half, 2 * GB + 1), fits({ ...half, brake: 50 * GB, left: 47 * GB }, 5 * GB)], [true, false, true]);
  const over = { bytes: 80 * GB, brake: 5 * GB, left: 0, full: true, available: true };
  is("a store that held more when its plan ended cannot add to it", [fits(over, 1), over.full], [false, true]);
  const nearly = { bytes: 199 * GB, brake: STORAGE_BRAKE_BYTES, left: GB, full: false, available: true };
  is("paid uploads must fit the confirmed remaining room", [fits(nearly, GB), fits(nearly, 5 * GB), fits({ ...nearly, bytes: 200 * GB, left: 0, full: true }, 1)], [true, false, false]);

  part("What an upload is told");
  is("each standing has its own word", [storageRefusal("paid"), storageRefusal("trial"), storageRefusal("none"), storageRefusal("ended")], ["storage_full", "storage_trial", "storage_setup", "storage_setup"]);
  is("and the studio has a sentence for each", ["storage_full", "storage_trial", "storage_setup"].map((word) => typeof STUDIO_MESSAGES[word] === "string" && STUDIO_MESSAGES[word].length > 40), [true, true, true]);
  is("with the figures the doors hold a store to", [STUDIO_MESSAGES.storage_trial.includes("up to 50 GB") && STUDIO_MESSAGES.storage_trial.includes("200 GB"), STUDIO_MESSAGES.storage_setup.includes("up to 5 GB"), storageWords(STORAGE_BRAKE_BYTES)], [true, true, "200 GB"]);
  is("a store is not told to start a plan while none can be started", STUDIO_MESSAGES.storage_setup.includes("Start your plan"), PLANS_ON_SALE);
  for (const [name, path] of [["files", "app/api/store/vault/route.ts"], ["lesson videos", "app/api/store/stream/route.ts"]] as const) {
    const door = read(path);
    is(`the door for ${name} measures a store against its own figure and holds a file to what is left`, [/storageUsed\(folder, storageBrakeFor\(standing\)\)/.test(door), /!fits\(held, bytes\)/.test(door), /storageRefusal\(standing\)/.test(door)], [true, true, true]);
  }

  part("The day a plan ends is written down once");
  await claimHandle("ana@example.com", "ana", "ana", "");
  is("a new store has no such day, and stands as never started", [(await storeForEmail("ana@example.com"))?.planEndedAt, standingOf((await storeForEmail("ana@example.com"))!)], ["", "none"]);
  await setSubscription("ana@example.com", { active: false });
  is("looking at a store that never started a plan does not end one", (await storeForEmail("ana@example.com"))?.planEndedAt, "");
  await setSubscription("ana@example.com", { customerId: "cus_Ana0001", subscriptionId: "sub_Ana0001", active: true, trialEnds: Math.floor(Date.now() / 1000) + 86_400 });
  is("a plan that starts leaves it empty", [(await storeForEmail("ana@example.com"))?.planEndedAt, standingOf((await storeForEmail("ana@example.com"))!)], ["", "trial"]);
  await setSubscription("ana@example.com", { active: false, trialEnds: 0 });
  const first = (await storeForEmail("ana@example.com"))?.planEndedAt ?? "";
  is("the first time it is seen to be over, the day is written", [first !== "" && !Number.isNaN(Date.parse(first)), standingOf((await storeForEmail("ana@example.com"))!)], [true, "ended"]);
  await new Promise((resolve) => setTimeout(resolve, 5));
  await setSubscription("ana@example.com", { active: false });
  is("and seen again, it is the same day", (await storeForEmail("ana@example.com"))?.planEndedAt, first);
  await setSubscription("ana@example.com", { active: true });
  is("a plan that runs again wipes it", [(await storeForEmail("ana@example.com"))?.planEndedAt, standingOf((await storeForEmail("ana@example.com"))!)], ["", "paid"]);

  part("What the pages say");
  const terms = read("app/terms/page.tsx");
  is("the Terms give all three figures for what a store may keep, from where the doors read them", [/storageWords\(STORAGE_BRAKE_BYTES\)/.test(terms), /storageWords\(TRIAL_STORAGE_BYTES\)/.test(terms), /storageWords\(SETUP_STORAGE_BYTES\)/.test(terms)], [true, true, true]);
  is("and both figures for video with no paid plan", [/\{VIDEO_HOURS_INCLUDED\} hours a month in the\s+free trial/.test(terms), /\{SETUP_VIDEO_HOURS\} hours a month before a plan is\s+started and after one has ended/.test(terms)], [true, true]);
  is("and that a store holding more when its plan ends cannot add to it, with where its date is said", /cannot add to it, and section 8 says how\s+long it keeps what it holds/.test(terms), true);
  const help = read("lib/help-content.ts");
  is("the help pages give the same figures", [help.includes(`In a plan's free trial it holds ${storageWords(TRIAL_STORAGE_BYTES)}`), help.includes(`holds ${storageWords(SETUP_STORAGE_BYTES)}.`), help.includes(`${VIDEO_HOURS_INCLUDED} hours a month in the free trial, and ${SETUP_VIDEO_HOURS} hours a month before a plan starts and after one ends`)], [true, true, true]);
  is("so does the page about courses", read("lib/feature-pages.ts").includes(`${VIDEO_HOURS_INCLUDED} hours a month in the free trial, and ${SETUP_VIDEO_HOURS} hours a month before a plan starts and after one ends`), true);
  const studio = read("app/studio/page.tsx");
  is("the studio shows a store its own figures", [/storageBrakeFor\(standing\)/.test(studio), /videoLimitFor\(store\)/.test(studio), /SETUP_VIDEO_HOURS/.test(studio)], [true, true, true]);
  is("and the lesson page pauses by the store's own hours", /lessonVideo\(lesson\.video, videoLimitFor\(store\)\)/.test(read("app/[handle]/course/[product]/[lesson]/page.tsx")), true);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
