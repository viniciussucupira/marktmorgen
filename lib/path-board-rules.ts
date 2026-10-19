import { dayMissions, trafficMissions, type PathAnswers, type PathFacts } from "@/lib/path-rules";

export const PATH_BOARD_ROWS = 20;
/** Conservative charge for one member's shared sorted-set entry and private reverse lookup. */
export const PATH_BOARD_ROOM_BYTES = 2048;
export const PATH_BOARD_JOIN_UNITS = 4;
export type PathBoardEntry = { token: string; score: number; at: number };
export function readPathBoard(raw: unknown): PathBoardEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const value=raw as Record<string,unknown>;
  if (typeof value.token!=="string" || !/^[0-9a-f]{32}$/.test(value.token) || !Number.isSafeInteger(value.score) || Number(value.score)<0 || Number(value.score)>15 || !Number.isSafeInteger(value.at) || Number(value.at)<=0 || Number(value.at)>8_640_000_000_000_000) return null;
  return {token:value.token,score:Number(value.score),at:Number(value.at)};
}
export function pathBoardScore(facts: PathFacts, answers: PathAnswers): number {
  // Count the same fixed set even after traffic suggestions disappear following a sale.
  return [...dayMissions(facts,answers),...trafficMissions(facts)].filter(mission=>mission.state==="done").length;
}
export function pathBoardMember(entry: PathBoardEntry): string { return entry.token+":"+entry.score+":"+entry.at; }
export type PathBoardRow = { token:string; alias:string; score:number; at:number; rank:number; mine:boolean };
export function pathBoardRows(raw: unknown, ownToken: string): PathBoardRow[] {
  if (!Array.isArray(raw)) return [];
  const rows:PathBoardRow[]=[];
  const seen=new Set<string>();
  for(let i=0;i+1<Math.min(raw.length,PATH_BOARD_ROWS*2) && rows.length<PATH_BOARD_ROWS;i+=2) {
    if(typeof raw[i]!=="string" || raw[i].length>64)continue;
    const match=raw[i].match(/^([0-9a-f]{32}):(\d{1,2}):(\d{1,16})$/);
    if(!match)continue;
    const entry=readPathBoard({token:match[1],score:Number(match[2]),at:Number(match[3])});
    if(!entry || Number(raw[i+1])!==entry.score || seen.has(entry.token))continue;
    seen.add(entry.token);
    const previous=rows[rows.length-1];
    rows.push({...entry,alias:"Creator "+entry.token.slice(0,12),rank:previous && previous.score===entry.score?previous.rank:rows.length+1,mine:entry.token===ownToken});
  }
  return rows;
}
