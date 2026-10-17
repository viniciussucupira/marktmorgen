/**
 * A store with a paid Scale plan, for the tests that write what takes room
 * in a store's data room (lib/store-data.ts): its room is large, so nothing
 * a test writes is refused unless the test means it to be.
 */
import type { DataStore } from "@/lib/store-data";

export const ROOM: DataStore = { sid: "room-test-store", tier: "scale", subscriptionActive: true, subscriptionId: "sub_room_test", trialEnds: 0, planEndedAt: "" };

/** Whether a pipeline only counts the data room: what a test of another script's replies lets through as it is. */
export function roomOnly(commands: (string | number)[][]): boolean {
  return commands.length > 0 && commands.every((command) => command[0] === "EVAL" && String(command[1]).startsWith("-- marktmorgen:store-data:"));
}
