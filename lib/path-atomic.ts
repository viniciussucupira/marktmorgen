/** The Path record and its data-room slot change in one Redis operation. */
import { TAKE_DATA } from "@/lib/store-data";
export const PATH_DATA_CHANGE = `local function pathRoom(limit, always, month, size)
  local roomKey = KEYS[1]
  local KEYS = {roomKey}
  local ARGV = {limit, always, month, 's', 'path', size}
${TAKE_DATA}
end`;

/** KEYS room/record; ARGV limit, month, bytes, expected revision, create flag, JSON. */
export const WRITE_PATH = `-- marktmorgen:path-write:v1
${PATH_DATA_CHANGE}
if #KEYS ~= 2 or #ARGV ~= 6 or (ARGV[5] ~= '0' and ARGV[5] ~= '1') then return {-1, 0} end
local old = redis.call('GET', KEYS[2])
if ARGV[5] == '1' then
  if old then return {-2, 0} end
  if ARGV[4] ~= '' then return {-1, 0} end
else
  if not old then return {-2, 0} end
  local ok, record = pcall(cjson.decode, old)
  if not ok or type(record) ~= 'table' or record.v ~= 1 then return {-1, 0} end
  local revision = type(record.r) == 'string' and record.r or ''
  if revision ~= ARGV[4] then return {-2, 0} end
end
local ok, next = pcall(cjson.decode, ARGV[6])
if not ok or type(next) ~= 'table' or next.v ~= 1 or type(next.r) ~= 'string' or #next.r ~= 32 or not string.match(next.r, '^[0-9a-f]+$') or next.r == ARGV[4] then return {-1, 0} end
local taken = pathRoom(ARGV[1], '0', ARGV[2], ARGV[3])
if taken[1] ~= 1 then return taken end
redis.call('SET', KEYS[2], ARGV[6])
return taken`;

/** Deletion and its freed data-room slot are atomic, including repeated deletion. */
export const FORGET_PATH = `-- marktmorgen:path-forget:v1
${PATH_DATA_CHANGE}
if #KEYS ~= 2 or #ARGV ~= 1 then return {-1, 0} end
local taken = pathRoom('0', '1', ARGV[1], '0')
if taken[1] ~= 1 then return taken end
redis.call('DEL', KEYS[2])
return taken`;
