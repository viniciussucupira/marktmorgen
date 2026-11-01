/**
 * The free students' video ceiling (541 [FC4], unit 1,
 * lib/free-course-video-rules.ts; added 1 November 2026). Checked: the
 * owner's 20% maximum, the creator's lower choice and nothing above it; the
 * seconds from the plan's own; both ceilings before a free lesson's video;
 * anything unknown frames nothing; plain words for the studio.
 */
import { FREE_VIDEO_MAX_PERCENT, freeVideoAdmission, freeVideoSeconds, freeVideoWords, readFreeVideoPercent } from "@/lib/free-course-video-rules";
import { PAID_VIDEO_HOURS, paidVideoSeconds } from "@/lib/video-admission-rules";
import { done, is, part } from "./check";

part("The owner's maximum and the creator's choice");
is("20% at most, by the owner's decision of 1 November 2026", FREE_VIDEO_MAX_PERCENT, 20);
is("a lower choice is kept", [readFreeVideoPercent(10), readFreeVideoPercent("5"), readFreeVideoPercent(0)], [10, 5, 0]);
is("nothing above the maximum", [readFreeVideoPercent(21), readFreeVideoPercent(100), readFreeVideoPercent("80")], [20, 20, 20]);
is("anything that is not a whole percent is none at all, never more", [readFreeVideoPercent(-1), readFreeVideoPercent(12.5), readFreeVideoPercent("lots"), readFreeVideoPercent(null), readFreeVideoPercent("")], [0, 0, 0, 0, 0]);

part("The seconds, from the plan's own");
is("Studio's 32 hours at 20%: 6.4 hours", freeVideoSeconds(paidVideoSeconds("pro"), 20), Math.floor(PAID_VIDEO_HOURS.pro * 3600 * 0.2));
is("at the most, a fifth of each plan, so four fifths stay for students who paid", (["creator", "pro", "scale"] as const).every((tier) => freeVideoSeconds(paidVideoSeconds(tier), 100)! * 5 <= paidVideoSeconds(tier)), true);
is("rounded down", freeVideoSeconds(7, 20), 1);
is("a plan limit not known: none", [freeVideoSeconds(null, 20), freeVideoSeconds(-5, 20), freeVideoSeconds(1.5, 20)], [null, null, null]);

part("Before a free lesson's video");
const plan = paidVideoSeconds("pro");
const cap = freeVideoSeconds(plan, 20)!;
is("room in both: it plays", freeVideoAdmission({ planSeconds: plan, percent: 20, watchedAll: 1000, watchedFree: cap - 1 }), "play");
is("the free students' ceiling reached: paused, though the plan has room", freeVideoAdmission({ planSeconds: plan, percent: 20, watchedAll: cap, watchedFree: cap }), "paused");
is("the plan's month used by students who paid: paused too", freeVideoAdmission({ planSeconds: plan, percent: 20, watchedAll: plan, watchedFree: 0 }), "paused");
is("a creator who chose 0%: never plays", freeVideoAdmission({ planSeconds: plan, percent: 0, watchedAll: 0, watchedFree: 0 }), "paused");
is("a figure that could not be read: nothing framed", [freeVideoAdmission({ planSeconds: plan, percent: 20, watchedAll: null, watchedFree: 0 }), freeVideoAdmission({ planSeconds: plan, percent: 20, watchedAll: 0, watchedFree: null }), freeVideoAdmission({ planSeconds: null, percent: 20, watchedAll: 0, watchedFree: 0 })], ["unknown", "unknown", "unknown"]);

part("In the studio's words");
is("the hours a choice gives", freeVideoWords(plan, 20), "Students of free courses can watch up to 6.4 hours of video a month, 20% of your plan's. The rest stays for students who paid.");
is("none", freeVideoWords(plan, 0), "Students of free courses see each lesson's text and files, without the video.");
is("one hour, singular", freeVideoWords(5 * 3600, 20), "Students of free courses can watch up to 1 hour of video a month, 20% of your plan's. The rest stays for students who paid.");
done();
