/** All sale totals and the retry marker move together. Preflight precedes every metric write.
 * Unsafe data leaves a bounded invalid flag, so readers cannot choose a winner from incomplete totals.
 * At most 8 Redis commands including EVAL; no new keys or retention windows.
 */
export const RECORD_TEST_SALE = `-- marktmorgen:ab-sale:v1
if #KEYS ~= 2 or #ARGV ~= 3 then return -1 end
local kind = redis.call('TYPE', KEYS[1]).ok
local mark = redis.call('TYPE', KEYS[2]).ok
if kind ~= 'none' and kind ~= 'hash' then return -1 end
if mark ~= 'none' and mark ~= 'string' then return -1 end
if mark == 'string' then return 0 end
local version = ARGV[1]
if version ~= 'a' and version ~= 'b' then return -1 end
local max = 9007199254740991
local function integer(raw)
  if type(raw) ~= 'string' or not string.match(raw, '^%d+$') then return nil end
  local value = tonumber(raw)
  if not value or value > max then return nil end
  return value
end
local cents = integer(ARGV[2])
local square = integer(ARGV[3])
local function unavailable()
  redis.call('HSET', KEYS[1], 'invalid', '1')
  redis.call('EXPIRE', KEYS[1], 34560000)
  return -1
end
if not cents or cents < 1 or not square or square < 1 then return unavailable() end
local fields = {'s' .. version, 'r' .. version, 'q' .. version}
local old = redis.call('HMGET', KEYS[1], unpack(fields))
local add = {1, cents, square}
local values = {}
for i = 1, 3 do
  local value = old[i] == false and 0 or integer(old[i])
  if not value or value > max - add[i] then return unavailable() end
  values[i] = string.format('%.0f', value + add[i])
end
redis.call('HSET', KEYS[1], fields[1], values[1], fields[2], values[2], fields[3], values[3])
redis.call('EXPIRE', KEYS[1], 34560000)
redis.call('SET', KEYS[2], '1', 'EX', 3456000)
return 1`;
