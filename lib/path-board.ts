import { redisPipeline } from "@/lib/redis";
import { PATH_BOARD_ROWS, pathBoardRows, type PathBoardRow } from "@/lib/path-board-rules";
export const PATH_BOARD_KEY = "nl:path:board:v1";
export const PATH_BOARD_OWNERS_KEY = "nl:path:board:owners:v1";
/** One bounded read. Shared output has no store id, name, answers, level or money. */
export async function readPathBoardRows(token: string): Promise<PathBoardRow[]> {
  const [raw]=await redisPipeline([["ZREVRANGE",PATH_BOARD_KEY,0,PATH_BOARD_ROWS-1,"WITHSCORES"]]);
  if(!Array.isArray(raw))throw new Error("The mission board could not be read");
  return pathBoardRows(raw,token);
}

/** Shared entries were metered atomically from their first write; never walk this global index in the legacy recount. */
export const isPathBoardSharedKey=(key:string)=>key===PATH_BOARD_KEY || key===PATH_BOARD_OWNERS_KEY;
