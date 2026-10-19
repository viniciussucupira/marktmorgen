import type { Mission, Place } from "@/lib/path-rules";

/** Uses only the page's verified facts. Native disclosures need no browser script. */
export function PathMissions({ missions, hrefFor }: { missions: readonly Mission[]; hrefFor: (place: Place) => string }) {
  return (
    <section className="mt-8" aria-labelledby="path-missions">
      <h2 id="path-missions" className="t-h3">Your missions</h2>
      <p className="mt-3 text-ink-soft">Open a mission for its steps. Your store&apos;s records decide when it is complete.</p>
      <ul className="mt-4 grid gap-3">
        {missions.map((mission) => (
          <li key={mission.id} className="rounded-xl border border-line bg-white p-4">
            <h3 className="font-semibold">{mission.title}</h3>
            <p className="mt-1 text-sm">{mission.state === "done" ? "Recorded" : mission.state === "unavailable" ? "Available only in Stripe test mode; continue with the other missions." : "Ready when you are"}</p>
            {mission.progress ? (
              <div className="mt-3">
                <p className="text-sm">{mission.progress.now.toLocaleString("en-US")} of {mission.progress.of.toLocaleString("en-US")} recorded</p>
                <progress className="mt-2 h-2 w-full accent-violet-700" value={mission.progress.now} max={mission.progress.of} aria-label={mission.title + ": recorded progress"} />
              </div>
            ) : null}
            <p className="mt-2 text-sm text-ink-soft">{mission.closesOn}</p>
            {mission.state === "open" ? (
              <details className="mt-3">
                <summary className="cursor-pointer py-3 font-semibold">View steps for {mission.title}</summary>
                <p className="mt-3">{mission.why}</p>
                <ol className="mt-4 list-decimal space-y-2 pl-6">{mission.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <a className="btn mt-4" href={hrefFor(mission.place)}>{mission.place.label}</a>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
