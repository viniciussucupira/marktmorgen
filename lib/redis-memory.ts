/**
 * A Redis that lives in memory, for testing the parts of this codebase whose
 * behaviour only shows up across several commands.
 *
 * Pure functions can be checked by calling them. What cannot be checked that
 * way is a flow: a first message becoming a request, the request being
 * accepted, a decline taking the messages with it and shutting the sender out.
 * Those live in the order of the writes, not in any one function, and the only
 * honest way to check them without two people and two inboxes is to run them
 * against something that behaves like the store they were written for.
 *
 * It implements only the commands this codebase actually uses, and it answers
 * in the shapes Upstash's REST API answers in — a flat array for ZREVRANGE
 * WITHSCORES, null for a missing ZSCORE, the integer 1 or 0 for SISMEMBER.
 * Anything not implemented throws by name rather than quietly returning null,
 * so a test can never pass because a command silently did nothing.
 *
 * This is not a Redis. It is a test double, kept beside the code it doubles so
 * that a command added to one is noticed as missing in the other.
 */

type Entry = string | string[] | Map<string, string> | Set<string> | { score: number; member: string }[];

export class MemoryRedis {
  private data = new Map<string, Entry>();
  /** When a key stops existing, in ms since the epoch. */
  private until = new Map<string, number>();
  /**
   * The clock, so a test can move time rather than wait for it. A cooldown
   * measured in minutes is not a thing to sit through.
   */
  now = () => Date.now();

  /** Moves the clock forward, for a test that has to outlast an expiry. */
  advance(ms: number): void {
    const to = this.now() + ms;
    this.now = () => to;
  }

  /** Everything, thrown away. */
  clear(): void {
    this.data.clear();
    this.until.clear();
    this.now = () => Date.now();
  }

  /** Drops a key whose time is up, before anything reads it. */
  private live(key: string): void {
    const ends = this.until.get(key);
    if (ends !== undefined && this.now() >= ends) {
      this.data.delete(key);
      this.until.delete(key);
    }
  }

  /** For a test to look at what a flow left behind. */
  keys(): string[] {
    return [...this.data.keys()].sort();
  }

  private list(key: string): string[] {
    const held = this.data.get(key);
    if (Array.isArray(held) && (held.length === 0 || typeof held[0] === "string")) return held as string[];
    const made: string[] = [];
    this.data.set(key, made);
    return made;
  }

  private hash(key: string): Map<string, string> {
    const held = this.data.get(key);
    if (held instanceof Map) return held;
    const made = new Map<string, string>();
    this.data.set(key, made);
    return made;
  }

  private set(key: string): Set<string> {
    const held = this.data.get(key);
    if (held instanceof Set) return held;
    const made = new Set<string>();
    this.data.set(key, made);
    return made;
  }

  private zset(key: string): { score: number; member: string }[] {
    const held = this.data.get(key);
    if (Array.isArray(held) && (held.length === 0 || typeof held[0] === "object")) {
      return held as { score: number; member: string }[];
    }
    const made: { score: number; member: string }[] = [];
    this.data.set(key, made);
    return made;
  }

  /** Runs one command, the way redisPipeline runs each of its own. */
  run(command: (string | number)[]): unknown {
    const [rawName, ...rest] = command;
    const name = String(rawName).toUpperCase();
    const key = String(rest[0] ?? "");
    const args = rest.slice(1).map(String);
    this.live(key);

    switch (name) {
      case "EVAL": {
        if (key.startsWith("-- marktmorgen:form-save:v1\n") && args[0] === "1" && args.length === 5) {
          const target = args[1];
          this.live(target);
          const held = this.data.get(target);
          if (held !== undefined && !(held instanceof Map)) throw new Error("WRONGTYPE");
          if (held instanceof Map && !held.has(args[2]) && held.size >= Number(args[4])) return 0;
          this.hash(target).set(args[2], args[3]);
          return 1;
        }
        // Models only the explicitly supported application scripts. Not a Lua interpreter.
        if (key.startsWith("-- marktmorgen:crm-deal-move:v1\n") && args[0] === "1" && args.length === 5) {
          const target = args[1];
          this.live(target);
          const held = this.data.get(target);
          if (held !== undefined && !(held instanceof Map)) throw new Error("WRONGTYPE");
          const current = held instanceof Map ? held.get(args[2]) : undefined;
          if (current === undefined) return 0;
          if (current !== args[3]) return -1;
          this.hash(target).set(args[2], args[4]);
          return 1;
        }
        if (key.startsWith("-- marktmorgen:crm-deal-save:v1\n") && args[0] === "1" && args.length === 5) {
          const target = args[1];
          this.live(target);
          const held = this.data.get(target);
          if (held !== undefined && !(held instanceof Map)) throw new Error("WRONGTYPE");
          if (held instanceof Map && !held.has(args[2]) && held.size >= Number(args[4])) return 0;
          this.hash(target).set(args[2], args[3]);
          return 1;
        }
        if (!key.startsWith("-- marktmorgen:form-opportunity:v1\n") || args[0] !== "1" || args.length !== 5) throw new Error("MemoryRedis: unsupported EVAL");
        const target = args[1];
        this.live(target);
        const held = this.data.get(target);
        if (held !== undefined && !(held instanceof Map)) throw new Error("WRONGTYPE");
        const existing = held instanceof Map ? held.get(args[2]) : undefined;
        if (existing !== undefined) return [0, existing];
        if (held instanceof Map && held.size >= Number(args[4])) return [-1, ""];
        this.hash(target).set(args[2], args[3]);
        return [1, args[3]];
      }
      case "SET": {
        const flags = args.slice(1).map((a) => a.toUpperCase());
        // NX is the whole point of a cooldown: it either takes the key or
        // tells the caller somebody already holds it.
        if (flags.includes("NX") && this.data.has(key)) return null;
        if (flags.includes("XX") && !this.data.has(key)) return null;
        this.data.set(key, args[0]);
        // The index is into `flags`, which starts one past the value, so the
        // seconds have to be read from `flags` too. Reading them from `args`
        // gives NaN, the key never expires, and every test about a cooldown
        // passes for the wrong reason.
        const at = flags.indexOf("EX");
        const seconds = at >= 0 ? Number(flags[at + 1]) : NaN;
        if (Number.isFinite(seconds)) this.until.set(key, this.now() + seconds * 1000);
        else this.until.delete(key);
        return "OK";
      }
      case "EXPIRE":
        if (!this.data.has(key)) return 0;
        this.until.set(key, this.now() + Number(args[0]) * 1000);
        return 1;
      case "TTL": {
        if (!this.data.has(key)) return -2;
        const ends = this.until.get(key);
        if (ends === undefined) return -1;
        return Math.max(0, Math.ceil((ends - this.now()) / 1000));
      }
      case "INCRBY":
      case "DECRBY": {
        // Returns the new total, which is how lib/delivery.ts knows the
        // exact delivery that took a store past its allowance.
        const held = this.data.get(key);
        const by = (Number(args[0]) || 0) * (name === "DECRBY" ? -1 : 1);
        const next = (typeof held === "string" ? Number(held) || 0 : 0) + by;
        this.data.set(key, String(next));
        return next;
      }
      case "INCR":
      case "DECR": {
        const held = this.data.get(key);
        const next = (typeof held === "string" ? Number(held) || 0 : 0) + (name === "DECR" ? -1 : 1);
        this.data.set(key, String(next));
        return next;
      }
      case "GET": {
        const held = this.data.get(key);
        return typeof held === "string" ? held : null;
      }
      case "MGET": {
        // Several keys read at once, each as GET would answer it.
        return rest.map(String).map((name) => {
          this.live(name);
          const held = this.data.get(name);
          return typeof held === "string" ? held : null;
        });
      }
      case "GETDEL": {
        // Read once and gone: what a consent's state is taken with.
        const held = this.data.get(key);
        if (typeof held !== "string") return null;
        this.data.delete(key);
        this.until.delete(key);
        return held;
      }
      case "DEL": {
        // DEL takes several keys.
        let gone = 0;
        for (const one of [key, ...args]) if (this.data.delete(one)) gone += 1;
        return gone;
      }
      case "EXISTS":
        return this.data.has(key) ? 1 : 0;

      case "RPUSH": {
        const list = this.list(key);
        list.push(...args);
        return list.length;
      }
      case "LPUSH": {
        // Each value goes to the front in turn, as Redis does it: the last
        // one named ends up first.
        const list = this.list(key);
        for (const value of args) list.unshift(value);
        return list.length;
      }
      case "LTRIM": {
        const list = this.list(key);
        const [from, to] = [Number(args[0]), Number(args[1])];
        const start = from < 0 ? Math.max(0, list.length + from) : from;
        const end = to < 0 ? list.length + to : to;
        this.data.set(key, list.slice(start, end + 1));
        return "OK";
      }
      case "LRANGE": {
        const list = this.list(key);
        const [from, to] = [Number(args[0]), Number(args[1])];
        const start = from < 0 ? Math.max(0, list.length + from) : from;
        const end = to < 0 ? list.length + to : to;
        return list.slice(start, end + 1);
      }
      case "LLEN":
        return this.data.has(key) ? this.list(key).length : 0;
      case "LINDEX": {
        if (!this.data.has(key)) return null;
        const list = this.list(key);
        const at = Number(args[0]);
        return list[at < 0 ? list.length + at : at] ?? null;
      }

      case "HSET": {
        const hash = this.hash(key);
        for (let i = 0; i + 1 < args.length; i += 2) hash.set(args[i], args[i + 1]);
        return 1;
      }
      case "HSETNX": {
        const hash = this.hash(key);
        if (hash.has(args[0])) return 0;
        hash.set(args[0], args[1]);
        return 1;
      }
      case "HGET":
        return this.hash(key).get(args[0]) ?? null;
      case "HEXISTS":
        return this.hash(key).has(args[0]) ? 1 : 0;
      case "HMGET":
        return args.map((field) => this.hash(key).get(field) ?? null);
      case "HDEL": {
        const hash = this.hash(key);
        let gone = 0;
        for (const field of args) if (hash.delete(field)) gone += 1;
        return gone;
      }
      case "HGETALL": {
        const flat: string[] = [];
        for (const [field, value] of this.hash(key)) flat.push(field, value);
        return flat;
      }
      case "HKEYS":
        return [...this.hash(key).keys()];
      case "HVALS":
        return [...this.hash(key).values()];
      case "HLEN":
        return this.hash(key).size;
      case "SCAN": {
        // SCAN cursor [MATCH pattern] [COUNT n]: here the "key" is the cursor.
        // Every match at once, with the cursor back at "0", as HSCAN does.
        const flags = args.map((a) => a.toUpperCase());
        const at = flags.indexOf("MATCH");
        const pattern = at >= 0 ? args[at + 1] : "*";
        const matcher = new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
        for (const k of [...this.data.keys()]) this.live(k);
        const found = [...this.data.keys()].filter((k) => matcher.test(k));
        return ["0", found];
      }
      case "HSCAN": {
        // HSCAN key cursor [COUNT n]. COUNT is only a hint in Redis, so
        // answering everything at once with the cursor back at "0" is a reply
        // a real server may give; a caller that pages correctly handles both.
        const flat: string[] = [];
        for (const [field, value] of this.hash(key)) flat.push(field, value);
        return ["0", flat];
      }
      case "HINCRBY": {
        const hash = this.hash(key);
        const next = (Number(hash.get(args[0])) || 0) + Number(args[1]);
        hash.set(args[0], String(next));
        return next;
      }

      case "SADD": {
        const set = this.set(key);
        let added = 0;
        for (const one of args) if (!set.has(one)) { set.add(one); added += 1; }
        return added;
      }
      // A count of distinct things, kept by the real one as an estimate in a
      // few kilobytes. Here it is a plain set, so it is exact: what matters
      // to the code that uses it is that something new answers 1.
      case "PFADD": {
        const set = this.set(key);
        let changed = 0;
        for (const one of args) if (!set.has(one)) { set.add(one); changed = 1; }
        return changed;
      }
      case "PFCOUNT": {
        const seen = new Set<string>(this.set(key));
        for (const other of args) for (const one of this.set(other)) seen.add(one);
        return seen.size;
      }
      case "SREM": {
        const set = this.set(key);
        let gone = 0;
        for (const one of args) if (set.delete(one)) gone += 1;
        return gone;
      }
      case "SISMEMBER":
        return this.set(key).has(args[0]) ? 1 : 0;
      case "SMEMBERS":
        return [...this.set(key)];
      case "SCARD":
        return this.set(key).size;
      case "SSCAN":
        // Every member at once, with the cursor back at "0", as SCAN does here.
        return ["0", [...this.set(key)]];
      case "SPOP": {
        const set = this.set(key);
        const first = [...set][0];
        if (first === undefined) return null;
        set.delete(first);
        return first;
      }

      case "ZADD": {
        const z = this.zset(key);
        // "NX": a member already there keeps the score it has.
        const onlyNew = args[0] === "NX";
        const pairs = onlyNew ? args.slice(1) : args;
        for (let i = 0; i + 1 < pairs.length; i += 2) {
          const score = Number(pairs[i]);
          const member = pairs[i + 1];
          const at = z.findIndex((e) => e.member === member);
          if (at >= 0) {
            if (!onlyNew) z[at].score = score;
          } else z.push({ score, member });
        }
        z.sort((a, b) => a.score - b.score || a.member.localeCompare(b.member));
        return 1;
      }
      case "ZREM": {
        const z = this.zset(key);
        let gone = 0;
        for (const member of args) {
          const at = z.findIndex((e) => e.member === member);
          if (at >= 0) { z.splice(at, 1); gone += 1; }
        }
        return gone;
      }
      case "ZREMRANGEBYSCORE": {
        // Inclusive on both ends, as Redis is without "(".
        const z = this.zset(key);
        const low = args[0] === "-inf" ? -Infinity : Number(args[0]);
        const high = args[1] === "+inf" ? Infinity : Number(args[1]);
        let gone = 0;
        for (let i = z.length - 1; i >= 0; i -= 1) {
          if (z[i].score >= low && z[i].score <= high) { z.splice(i, 1); gone += 1; }
        }
        return gone;
      }
      case "ZCARD":
        return this.zset(key).length;
      case "ZSCORE": {
        const found = this.zset(key).find((e) => e.member === args[0]);
        return found ? String(found.score) : null;
      }
      case "ZREMRANGEBYRANK": {
        const z = this.zset(key);
        const [from, to] = [Number(args[0]), Number(args[1])];
        const start = from < 0 ? Math.max(0, z.length + from) : from;
        const end = to < 0 ? z.length + to : to;
        if (end < start) return 0;
        const gone = z.splice(start, end - start + 1);
        return gone.length;
      }
      case "ZCOUNT": {
        const edge = (raw: string) => {
          if (raw === "-inf") return { value: -Infinity, open: false };
          if (raw === "+inf") return { value: Infinity, open: false };
          if (raw.startsWith("(")) return { value: Number(raw.slice(1)), open: true };
          return { value: Number(raw), open: false };
        };
        const from = edge(args[0]);
        const to = edge(args[1]);
        return this.zset(key).filter(
          (e) => (from.open ? e.score > from.value : e.score >= from.value) && (to.open ? e.score < to.value : e.score <= to.value),
        ).length;
      }
      case "ZRANGEBYSCORE": {
        const z = this.zset(key);
        // "(5" means "after 5", which is how the room asks for what is new.
        const edge = (raw: string) => {
          if (raw === "-inf") return { value: -Infinity, open: false };
          if (raw === "+inf") return { value: Infinity, open: false };
          if (raw.startsWith("(")) return { value: Number(raw.slice(1)), open: true };
          return { value: Number(raw), open: false };
        };
        const from = edge(args[0]);
        const to = edge(args[1]);
        const page = z.filter(
          (e) =>
            (from.open ? e.score > from.value : e.score >= from.value) &&
            (to.open ? e.score < to.value : e.score <= to.value),
        );
        const flags = args.map((a) => a.toUpperCase());
        const at = flags.indexOf("LIMIT");
        const limited = at >= 0 ? page.slice(Number(args[at + 1]), Number(args[at + 1]) + Number(args[at + 2])) : page;
        if (flags.includes("WITHSCORES")) return limited.flatMap((e) => [e.member, String(e.score)]);
        return limited.map((e) => e.member);
      }
      case "ZREVRANGEBYSCORE": {
        // Note the order: max first, then min, the reverse of ZRANGEBYSCORE.
        // Getting that round the wrong way gives an empty answer rather than
        // an error, so a search would quietly find nothing and every check
        // about it would pass for the wrong reason.
        const edge = (raw: string) => {
          if (raw === "-inf") return { value: -Infinity, open: false };
          if (raw === "+inf") return { value: Infinity, open: false };
          if (raw.startsWith("(")) return { value: Number(raw.slice(1)), open: true };
          return { value: Number(raw), open: false };
        };
        const to = edge(args[0]);
        const from = edge(args[1]);
        const page = [...this.zset(key)]
          .reverse()
          .filter(
            (e) =>
              (from.open ? e.score > from.value : e.score >= from.value) &&
              (to.open ? e.score < to.value : e.score <= to.value),
          );
        const flags = args.map((a) => a.toUpperCase());
        const at = flags.indexOf("LIMIT");
        const limited = at >= 0 ? page.slice(Number(args[at + 1]), Number(args[at + 1]) + Number(args[at + 2])) : page;
        if (flags.includes("WITHSCORES")) return limited.flatMap((e) => [e.member, String(e.score)]);
        return limited.map((e) => e.member);
      }
      case "ZINTERSTORE": {
        // ZINTERSTORE dest numkeys key... [AGGREGATE MAX]. The destination is
        // `key`; the sources follow the count.
        const howMany = Number(args[0]);
        const sources = args.slice(1, 1 + howMany);
        const flags = args.map((a) => a.toUpperCase());
        const how = flags.indexOf("AGGREGATE") >= 0 ? flags[flags.indexOf("AGGREGATE") + 1] : "SUM";
        const [firstKey, ...restKeys] = sources;
        for (const one of sources) this.live(one);
        const held = new Map<string, number>();
        for (const entry of this.zset(firstKey ?? "")) held.set(entry.member, entry.score);
        for (const other of restKeys) {
          const theirs = new Map(this.zset(other).map((e) => [e.member, e.score]));
          for (const [member, score] of [...held]) {
            const found = theirs.get(member);
            if (found === undefined) {
              held.delete(member);
              continue;
            }
            held.set(member, how === "MAX" ? Math.max(score, found) : how === "MIN" ? Math.min(score, found) : score + found);
          }
        }
        const made = [...held].map(([member, score]) => ({ score, member }));
        made.sort((a, b) => a.score - b.score || a.member.localeCompare(b.member));
        this.data.set(key, made);
        this.until.delete(key);
        // Redis answers with how many are in the set it just made, which is
        // what the search reads its total from.
        return made.length;
      }
      case "ZINCRBY": {
        const z = this.zset(key);
        const by = Number(args[0]);
        const member = args[1];
        const at = z.findIndex((e) => e.member === member);
        const score = (at >= 0 ? z[at].score : 0) + by;
        if (at >= 0) z[at].score = score;
        else z.push({ score, member });
        z.sort((a, b) => a.score - b.score || a.member.localeCompare(b.member));
        this.data.set(key, z);
        return String(score);
      }
      case "ZUNIONSTORE": {
        // ZUNIONSTORE dest numkeys key... — scores summed, as Redis does by default.
        const howMany = Number(args[0]);
        const sources = args.slice(1, 1 + howMany);
        const held = new Map<string, number>();
        for (const one of sources) {
          this.live(one);
          for (const entry of this.zset(one)) held.set(entry.member, (held.get(entry.member) ?? 0) + entry.score);
        }
        const made = [...held].map(([member, score]) => ({ score, member }));
        made.sort((a, b) => a.score - b.score || a.member.localeCompare(b.member));
        this.data.set(key, made);
        this.until.delete(key);
        return made.length;
      }
      case "ZREVRANK": {
        const z = [...this.zset(key)].reverse();
        const at = z.findIndex((e) => e.member === args[0]);
        return at >= 0 ? at : null;
      }
      case "ZREVRANGE": {
        const z = [...this.zset(key)].reverse();
        const [from, to] = [Number(args[0]), Number(args[1])];
        const start = from < 0 ? Math.max(0, z.length + from) : from;
        const end = to < 0 ? z.length + to : to;
        const page = z.slice(start, end + 1);
        if (args.map((a) => a.toUpperCase()).includes("WITHSCORES")) {
          return page.flatMap((e) => [e.member, String(e.score)]);
        }
        return page.map((e) => e.member);
      }

      default:
        throw new Error(`MemoryRedis does not implement ${name}`);
    }
  }

  /** The shape lib/redis.ts exports: one reply per command, in order. */
  pipeline = async (commands: (string | number)[][]): Promise<unknown[]> => commands.map((one) => this.run(one));
}
