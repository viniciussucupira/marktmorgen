import { contractProtocolInfrastructureCosts } from "@/lib/contract-protocol-cost";
import { is, done, part } from "./check";

// Explicit calendars, including a first/last partial rolling daily window.
// These are whole-call infrastructure comparison bounds, not funded approval.
const month = { functionCalls:320, memoryGbMilliseconds:38_400_000, cpuMilliseconds:320_000,
  redisCommands:1600, transferBytes:20_971_520, retainedBytes:0, retentionMonths:0, storageCopies:1 };
const year = { functionCalls:3670, memoryGbMilliseconds:440_400_000, cpuMilliseconds:3_670_000,
  redisCommands:18350, transferBytes:240_517_120, retainedBytes:0, retentionMonths:0, storageCopies:1 };
const costs = contractProtocolInfrastructureCosts({
 creator_month:{...month}, creator_year:{...year}, pro_month:{...month},
 pro_year:{...year}, scale_month:{...month}, scale_year:{...year},
});
part("Stopped undo comparison keeps all six explicit plan/cycle profiles");
is("all profiles remain required", costs !== null, true);
for (const key of ["creator_month","pro_month","scale_month"] as const) {
 is(key+" independently priced month", costs?.[key].infrastructure.totalMicroUsd, 141314);
}
for (const key of ["creator_year","pro_year","scale_year"] as const) {
 is(key+" independently priced leap-year horizon", costs?.[key].infrastructure.totalMicroUsd, 1620676);
}
is("missing annual profile is unknown, never free", contractProtocolInfrastructureCosts({creator_month:month}), null);
done();
