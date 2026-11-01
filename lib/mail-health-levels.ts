/**
 * How a store's email is doing, said to the creator before anything pauses
 * (599 [KB20], unit 1; added 1 November 2026).
 *
 * The pause itself is lib/mail-health.ts: over HEALTH_WINDOW_DAYS days, at
 * least BOUNCE_FLOOR bounces and BOUNCE_RATE of what was sent, or at least
 * COMPLAINT_FLOOR spam reports and COMPLAINT_RATE of it, pauses the list's
 * email for PAUSE_DAYS days. Nothing here changes those lines or loosens any
 * of them: it reads the same seven days and says how near each one is, so a
 * creator hears "close" before they hear "paused".
 *
 *   fine     under half of the line on both counts
 *   watch    half of the line or more, in the number and in the share
 *   near     four fifths of the line or more, in the number and in the share
 *   over     at the line: the next send is paused (overTheLine)
 *
 * Browser-safe: plain data and pure functions over the rules' own numbers.
 */
import { BOUNCE_FLOOR, BOUNCE_RATE, COMPLAINT_FLOOR, COMPLAINT_RATE, HEALTH_WINDOW_DAYS, PAUSE_DAYS } from "@/lib/mail-health-rules";

export type HealthCounts = { sent: number; bounced: number; complained: number };
export type HealthLevel = "fine" | "watch" | "near" | "over";
export type HealthMeasure = "bounces" | "complaints";

const ORDER: HealthLevel[] = ["fine", "watch", "near", "over"];

function levelOf(count: number, sent: number, floor: number, rate: number): HealthLevel {
  if (sent <= 0 || count <= 0) return "fine";
  const share = count / sent;
  const reached = (part: number) => count >= floor * part && share >= rate * part;
  return reached(1) ? "over" : reached(0.8) ? "near" : reached(0.5) ? "watch" : "fine";
}

/** Each measure's level, and the worse of the two. */
export function healthLevels(health: HealthCounts): { bounces: HealthLevel; complaints: HealthLevel; worst: HealthLevel; measure: HealthMeasure | null } {
  const bounces = levelOf(health.bounced, health.sent, BOUNCE_FLOOR, BOUNCE_RATE);
  const complaints = levelOf(health.complained, health.sent, COMPLAINT_FLOOR, COMPLAINT_RATE);
  const worst = ORDER[Math.max(ORDER.indexOf(bounces), ORDER.indexOf(complaints))];
  // Bounces first, as the pause looks at them first.
  const measure = worst === "fine" ? null : ORDER.indexOf(bounces) >= ORDER.indexOf(complaints) ? "bounces" : "complaints";
  return { bounces, complaints, worst, measure };
}

const share = (part: number, whole: number) => (whole > 0 ? `${((part / whole) * 100).toFixed(part / whole < 0.01 ? 2 : 1)}%` : "0%");

/** The last days' numbers, in a sentence. */
export function healthLine(health: HealthCounts): string {
  if (health.sent <= 0) return `No email went to your list in the last ${HEALTH_WINDOW_DAYS} days.`;
  return `In the last ${HEALTH_WINDOW_DAYS} days: ${health.sent.toLocaleString("en-US")} sent, ${health.bounced.toLocaleString("en-US")} to addresses that do not exist (${share(health.bounced, health.sent)}), ${health.complained.toLocaleString("en-US")} reported as spam (${share(health.complained, health.sent)}).`;
}

/** What the level means and what to do, in plain words. */
export function healthAdvice(level: HealthLevel, measure: HealthMeasure | null): { title: string; text: string } {
  if (level === "fine" || !measure) return { title: "Your email is healthy", text: "Nothing to do. Keep writing to people who asked to hear from you." };
  const what =
    measure === "bounces"
      ? "Some of your emails go to addresses that do not exist. This usually comes from a list brought in from somewhere else."
      : "Some people mark your emails as spam. This usually means they did not expect to hear from you.";
  const fix =
    measure === "bounces"
      ? "Before your next email, take off the list addresses you brought in long ago and never wrote to here."
      : "Write only to people who asked, say who you are at the top, and keep the unsubscribe link easy to find.";
  if (level === "over") return { title: "Your next email to your list will pause", text: `${what} At this level, email to your list pauses for ${PAUSE_DAYS} days and then goes on by itself. ${fix}` };
  if (level === "near") return { title: "Close to a pause", text: `${what} A little more and email to your list pauses for ${PAUSE_DAYS} days. ${fix}` };
  return { title: "Worth a look", text: `${what} You are at half the level that pauses email to your list. ${fix}` };
}

/** Said under the numbers: reports reach us only from providers that send them. */
export const HEALTH_NOTE =
  "Spam reports reach us only from email providers that send them back to the sender, so a low number here is not a promise that nobody reported you. Login links, receipts and files are never paused.";
