/** A plan suggestion only from measured use, never from a sales forecast. */
export function pathPlanLine(used: number, limit: number): string | null {
 if(!Number.isSafeInteger(used)||!Number.isSafeInteger(limit)||used<0||limit<=0||used/limit<0.9)return null;
 return `You have used ${used.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")} studio requests this window. Review plans if you need more room.`;
}
