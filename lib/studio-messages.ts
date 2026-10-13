/**
 * What every studio form says when the store's own checks turn a change
 * away (lib/studio-route.ts): each form's own words for these come first.
 */
import { PLANS_ON_SALE } from "@/lib/opening";
import { SETUP_STORAGE_BYTES, TRIAL_STORAGE_BYTES } from "@/lib/plan-standing";

const GB = 1024 * 1024 * 1024;
const SETUP_GB = SETUP_STORAGE_BYTES / GB;
const TRIAL_GB = TRIAL_STORAGE_BYTES / GB;
/** What every paid plan holds (lib/storage-quota.ts, which cannot be read from a browser; tests/plan-standing.test.ts holds the two together). */
const PAID_GB = 200;

export const STUDIO_MESSAGES: Record<string, string> = {
  role: "Your role on this store does not include this. The store's owner can change your role.",
  // A session let in without its second step (lib/two-step.ts LOCKED_NEEDS).
  locked: "You got in without your second step, so this is locked until two-step login turns off. The date is at the top of your studio.",
  store_gone: "This store was deleted, or you are no longer on its team. Reload the page to see your stores.",
  // What an upload of a file that is sold can be told (lib/sold-file-upload.ts).
  storage_full: "Your store is holding as much as one store can hold. Delete a file you no longer sell to make room — nothing already bought is affected.",
  // The same, for a store that is not on a paid plan yet (lib/plan-standing.ts).
  storage_trial: `During the free trial a store holds up to ${TRIAL_GB} GB, and this file does not fit in what is left. It becomes ${PAID_GB} GB with your first payment. Until then, delete a file you do not need to make room.`,
  storage_setup: PLANS_ON_SALE
    ? `A store without a plan holds up to ${SETUP_GB} GB, and this file does not fit in what is left. Start your plan to add more: the free trial holds ${TRIAL_GB} GB.`
    : `A store holds up to ${SETUP_GB} GB until its plan starts, and this file does not fit in what is left. Plans are not on sale yet; until they are, delete a file you do not need to make room.`,
  upload_stopped: "The upload stopped before the end, and could not go on. Check your connection and upload the file again.",
  slow_down: "That is a lot of uploads in one hour. Try again a little later.",
  files_unavailable: "Files cannot be taken in just now. Try again in a few minutes.",
};
