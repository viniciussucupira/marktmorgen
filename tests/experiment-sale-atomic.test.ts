import { noteTestSales, readCounts } from "@/lib/headline-test";
import { redisPipeline, store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const stats = "atomicstats", product = "atomicproduct", test = "test001";
const countsKey = `nl:ab:${stats}:${product}:${test}`;
const row = (id: string, cents = 4900, version = "b") => ({ id, amount_total: cents, currency: "usd", metadata: { product, ab: `${test}:${version}` } });
async function rejected(action: () => Promise<unknown>) {
  try { await action(); return false; } catch { return true; }
}
async function main() {
  redis.clear();
  part("Sale metrics and acknowledgment survive retries together");
  is("concurrent duplicate requests count once", (await Promise.all(Array.from({ length: 32 }, () => noteTestSales(stats, "usd", [row("same")])))).reduce((a,b)=>a+b,0), 1);
  is("distinct checkouts each count", (await Promise.all(Array.from({length:32},(_,i)=>noteTestSales(stats,"usd",[row("distinct"+i)])))).reduce((a,b)=>a+b,0),32);
  let counts = await readCounts(stats, product, test);
  is("all three totals agree", [counts.sb,counts.rb,counts.qb],[33,33*4900,33*4900*4900]);

  const original = redis.pipeline;
  redis.pipeline = () => { throw new Error("synthetic request failed before execution"); };
  try { is("failed transport propagates",await rejected(()=>noteTestSales(stats,"usd",[row("before")])),true); }
  finally { redis.pipeline = original; }
  is("retry after nonexecution counts",await noteTestSales(stats,"usd",[row("before")]),1);

  redis.pipeline = function (...args: Parameters<typeof original>) {
    original.apply(redis,args);
    throw new Error("synthetic response lost after execution");
  };
  try { is("lost response propagates",await rejected(()=>noteTestSales(stats,"usd",[row("lost")])),true); }
  finally { redis.pipeline = original; }
  is("retry after lost response does not duplicate",await noteTestSales(stats,"usd",[row("lost")]),0);
  counts=await readCounts(stats,product,test);
  is("lost response kept all metrics",[counts.sb,counts.rb,counts.qb],[35,35*4900,35*4900*4900]);
  await redisPipeline([["SET","nl:ab:paid:legacy","1","EX",3456000]]);
  is("legacy acknowledgment is respected",await noteTestSales(stats,"usd",[row("legacy")]),0);

  part("Preflight never leaves a claimed partial sale");
  for (const bad of ["NaN","-1","1.5",String(Number.MAX_SAFE_INTEGER)]) {
    redis.clear();
    await redisPipeline([["HSET",countsKey,"sb","2","rb","9800","qb",bad]]);
    is("bad square rejected "+bad,await rejected(()=>noteTestSales(stats,"usd",[row("bad")])),true);
    const values=await redisPipeline([["HMGET",countsKey,"sb","rb","qb"],["EXISTS","nl:ab:paid:bad"]]);
    is("prior totals and missing acknowledgment "+bad,values,[["2","9800",bad],0]);
    is("incomplete totals cannot choose winner "+bad,(await readCounts(stats,product,test)).unavailable,true);
  }
  redis.clear();
  is("unsafe square refused explicitly",await rejected(()=>noteTestSales(stats,"usd",[row("large",100000000)])),true);
  is("unsafe sale leaves no marker",await redisPipeline([["EXISTS","nl:ab:paid:large"]]),[0]);
  is("unsafe totals visibly unavailable",(await readCounts(stats,product,test)).unavailable,true);
  redis.clear();
  await redisPipeline([["SET",countsKey,"wrong-type"]]);
  is("wrong hash type refused",await rejected(()=>noteTestSales(stats,"usd",[row("type")])),true);
  is("wrong type cannot claim checkout",await redisPipeline([["EXISTS","nl:ab:paid:type"]]),[0]);
  redis.clear();
  is("unrelated currency, zero, fractional and malformed rows ignored",await noteTestSales(stats,"usd",[
    {...row("eur"),currency:"eur"},row("zero",0),row("fraction",1.5),
    {...row("badmeta"),metadata:{product,ab:"invalid"}}
  ]),0);
  done();
}
main().catch(error=>{console.error(error);process.exit(1);});
