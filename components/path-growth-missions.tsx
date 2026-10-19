import type {PathGrowthMission} from "@/lib/path-growth-rules";
export function PathGrowthMissions({missions,hrefFor,read,moneyAt}:{missions:readonly PathGrowthMission[];hrefFor:(destination:PathGrowthMission["destination"])=>string;read:boolean;moneyAt:number|null}){
 if(!missions.length)return null;
 return <section className="mt-8" aria-labelledby="path-growth-title">
  <h2 id="path-growth-title" className="t-h3">After your first sale</h2>
  <p className="mt-3 text-ink-soft">Choose a useful next step. Your own store records decide what is recorded; opening these instructions changes nothing.</p>
  <p className="mt-3 text-sm text-ink-soft">{read?"Available catalogue, campaign and review evidence was requested during this visit.":"Additional records could not be checked now."} {moneyAt?"Stripe checkout and refund reading: "+new Date(moneyAt).toISOString()+".":"Stripe checkout and refund evidence is not available in this reading."}</p>
  <p className="mt-2 text-sm text-ink-soft">Checking these records uses eight requests from your existing studio allowance. Reads cover up to eight published products, three recent campaigns and three recent reviews. An inconclusive reading does not count as completion. Some older review records do not show whether their payment was live.</p>
  <ul className="mt-4 grid gap-3">
   {missions.map(mission=><li key={mission.id} className="rounded-xl border border-line bg-white p-4">
    <h3 className="font-semibold">{mission.title}</h3>
    <p className="mt-1 text-sm">{mission.state==="done"?"Recorded":mission.state==="unknown"?"Not verified in this reading.":"Ready when you are"}</p>
    <p className="mt-2 text-sm text-ink-soft">{mission.closesOn}</p>
    {mission.state!=="done"?<details className="mt-3">
     <summary className="flex min-h-11 cursor-pointer items-center font-semibold">View steps for {mission.title}</summary>
     <p className="mt-3">{mission.why}</p>
     <ol className="mt-3 list-decimal space-y-2 pl-5">{mission.steps.map(step=><li key={step}>{step}</li>)}</ol>
     <a className="btn mt-4" href={hrefFor(mission.destination)}>Review this in your studio</a>
    </details>:null}
   </li>)}
  </ul>
 </section>;
}
