import { done, is, part } from "./check";
import { store as redis } from "./redis-stub";
import { doneKey, readShipped } from "@/lib/shipments";

async function main(): Promise<void> {
  const originalPipeline=redis.pipeline;
  const originalFetch=globalThis.fetch;
  const id="cs_test_shipmentreadproof01", other="cs_test_shipmentreadproof02";
  const shipped={at:1_790_000_000,tracking:"https://example.test/tracking"};
  let reply: unknown=[null];
  let requests=0,providerCalls=0;
  globalThis.fetch=(async()=>{providerCalls++;throw Error("No provider request is allowed");}) as typeof fetch;
  redis.pipeline=async(commands)=>{
    requests++;
    is("shipment reads only the requested key",commands,[["GET",doneKey(id)]]);
    return reply as unknown[];
  };
  try {
    part("Unknown shipment state is never read as unmarked");
    const bad:unknown[]=[null,[],[undefined],[false],[0],[{}],[""],["not JSON"],["null"],["[]"],["{}"],
      [JSON.stringify({at:shipped.at,tracking:"javascript:alert(1)"})],[null,null]];
    for(const value of bad){
      reply=value;
      const before=requests;
      let refused=false;
      try{await readShipped([id]);}catch{refused=true;}
      is("unreadable or incomplete status is refused",refused,true);
      is("a refused read makes no retry",requests-before,1);
    }
    reply=[null];
    is("explicit missing key means unmarked",(await readShipped([id])).size,0);
    reply=[JSON.stringify(shipped)];
    is("readable stored shipment stays intact",(await readShipped([id])).get(id),shipped);
    const beforeEmpty=requests;
    is("no physical orders need no status read",(await readShipped([])).size,0);
    is("empty read does not issue a command",requests,beforeEmpty);

    redis.pipeline=async(commands)=>{
      requests++;
      is("batch remains one read per requested order",commands,[["GET",doneKey(id)],["GET",doneKey(other)]]);
      return [JSON.stringify(shipped)];
    };
    let partial=false;
    try{await readShipped([id,other]);}catch{partial=true;}
    is("a partial batch cannot supply partial shipment certainty",partial,true);
    is("reading status never contacts an email or payment provider",providerCalls,0);
    done();
  } finally {
    redis.pipeline=originalPipeline;
    globalThis.fetch=originalFetch;
  }
}
void main();
