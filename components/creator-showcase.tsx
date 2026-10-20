import {platformProof,PLATFORM_PROOF_SNAPSHOT} from "@/lib/platform-proof";
import Link from "next/link";
import {CREATOR_SHOWCASE,SHOWCASE_REVIEWED_AT} from "@/lib/creator-showcase";
/** Public proof from the permission registry; demo-only until a real listing is authorized. */
export function CreatorShowcase(){
 const demoOnly=CREATOR_SHOWCASE.every(entry=>entry.kind==="demo");
 return <section aria-labelledby="creator-showcase-title" className="section border-y border-line bg-paper" data-creator-showcase>
 <div className="container-page"><h2 id="creator-showcase-title" className="t-h2">See a store in action</h2>
 <p className="mt-4 max-w-3xl text-ink-soft">{demoOnly?"There are no real creator listings with recorded permission here yet. Explore our clearly labeled demo instead.":"These creators have given recorded permission for this listing. A listing is not an earnings or sales claim."}</p>
 <ul className="mt-7 grid gap-5 md:grid-cols-2">{CREATOR_SHOWCASE.map(entry=><li key={entry.href} className="card p-6">
 <p className="text-sm font-semibold text-violet-deep">{entry.kind==="demo"?"Demo — fictional store":"Creator — permission recorded "+entry.permissionRecordedAt}</p>
 <h3 className="mt-3 text-xl font-semibold">{entry.name}</h3><p className="mt-3 text-ink-soft">{entry.description}</p>
 <Link href={entry.href} prefetch={false} className="link mt-4 inline-flex min-h-11 items-center">{entry.kind==="demo"?"Open the demo store":"Open this creator's store"}</Link>
 </li>)}</ul>
 <p className="mt-5 text-sm text-ink-soft">Listing review: {SHOWCASE_REVIEWED_AT}. No names, portraits, quotes or results are used as customer proof without permission.</p>
 <Link href="/proof/creator-showcase" prefetch={false} className="link mt-3 inline-flex min-h-11 items-center">About these store listings</Link>
 </div></section>;
}

/** Completely absent until a dated, audited, live snapshot reaches each configured floor. */
export function PlatformProof(){
 const figures=platformProof(PLATFORM_PROOF_SNAPSHOT);if(!figures.length)return null;
 return <section aria-labelledby="platform-proof-title" className="section border-b border-line" data-platform-proof><div className="container-page">
 <h2 id="platform-proof-title" className="t-h2">Measured on Marktmorgen</h2><dl className="mt-7 grid gap-6 sm:grid-cols-3">{figures.map(figure=><div key={figure.key}><dt className="text-ink-soft">{figure.label}</dt><dd className="mt-2 text-3xl font-semibold">{figure.count.toLocaleString("en-US")}</dd><dd className="mt-2 text-sm text-ink-soft">Counted <time dateTime={figure.asOf}>{figure.asOf}</time>. Demo and test records excluded.</dd></div>)}</dl>
 </div></section>;
}
