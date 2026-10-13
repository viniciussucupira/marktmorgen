"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import type { CommunityConfig, Space } from "@/lib/community";
import {
  MAX_COMMENTS_PER_POST,
  MAX_COMMENT_TEXT,
  MAX_COMMUNITY_ABOUT,
  MAX_COMMUNITY_NAME,
  MAX_MEMBERS,
  MAX_PINNED,
  MAX_POSTS,
  MAX_POST_TEXT,
  MAX_SPACES,
  MAX_SPACE_ABOUT,
  MAX_SPACE_NAME,
  RATE_LIMITS,
  MAX_EVENT_CAP,
  MAX_UPCOMING_EVENTS,
} from "@/lib/community-text";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

export type QueueRow = {
  key: string;
  kind: "post" | "comment";
  count: number;
  at: number;
  text: string;
  author: string;
  authorEmail: string;
  hidden: boolean;
  href: string;
};

export type StudioMember = {
  key: string;
  email: string;
  name: string;
  joined: number;
  seen: number;
  muted: boolean;
  removed: boolean;
  listed: boolean;
  mail: boolean;
};

type ProductChoice = { id: string; title: string; free: boolean; kind: string };

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  name: "Give the community a name.",
  space_name: "Give the space a name.",
  too_many: `A community holds up to ${MAX_SPACES} spaces.`,
  last_space: "A community needs at least one space. Add another before removing this one.",
  not_set_up: "Set the community up first.",
  unknown: "That is not there anymore. Reload the page.",
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  unavailable: "Stores are not switched on yet, so nothing was saved.",
  invalid: "That could not be read. Nothing was changed.",
  store_full: "Your store has reached the most it can hold. Remove something, or shorten a long list of choices, first.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

type Answer = { ok?: boolean; error?: string; config?: CommunityConfig };

async function send(payload: Record<string, unknown>): Promise<Answer> {
  try {
    const response = await fetch("/api/store/community/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await response.json().catch(() => ({ ok: false, error: "server_error" }))) as Answer;
  } catch {
    return { ok: false, error: "server_error" };
  }
}

function day(seconds: number): string {
  if (!seconds) return "—";
  return new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const small = "inline-flex min-h-6 items-center text-sm font-semibold text-ink-soft underline underline-offset-4 transition hover:text-violet-deep disabled:no-underline disabled:opacity-40";

/** Everything the creator sets about their community, in the studio. */
export function CommunityStudio({
  handle,
  address,
  on,
  config,
  products,
  queue,
  members,
  totals,
  canEmail,
  canSettings = true,
  isOwner = true,
  events = null,
}: {
  handle: string;
  address: string;
  on: boolean;
  config: CommunityConfig | null;
  products: ProductChoice[];
  queue: QueueRow[];
  members: StudioMember[];
  totals: { members: number; listed: number; posts: number; reach: number };
  canEmail: boolean;
  /**
   * Whether this person may set the community up (lib/team-roles.ts,
   * "settings"). Without it, only the reports and the members are shown:
   * moderating, which Editors and Support do too.
   */
  canSettings?: boolean;
  /** The store's owner, who also moderates from inside the community itself. */
  isOwner?: boolean;
  /** The live events section (components/community-events-studio.tsx), drawn after the basics. */
  events?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ where: string; text: string } | null>(null);

  async function run(where: string, payload: Record<string, unknown>, done: string): Promise<Answer> {
    setBusy(where);
    setError(null);
    const answer = await send(payload);
    setBusy(null);
    if (!answer.ok) {
      setError({ where, text: MESSAGES[answer.error ?? ""] ?? MESSAGES.server_error });
      return answer;
    }
    toast(done);
    router.refresh();
    return answer;
  }

  const problem = (where: string) =>
    error?.where === where ? (
      <p className="notice notice-error mt-4" role="alert">{error.text}</p>
    ) : null;

  if (!config && !canSettings) {
    return (
      <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-none-title">
        <h2 id="cm-none-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">No community yet</h2>
        <p className="mt-2 text-ink-soft">The store&apos;s owner or an Admin sets it up. Once it has members, reports and members show up here to moderate.</p>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-start-title">
        <h2 id="cm-start-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Set up your community</h2>
        <p className="mt-2 text-ink-soft">
          It starts switched off, with one space called General, and nobody let in. Choose which products open it,
          add spaces, write a first post, then switch it on. Only you can see it until then.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          aria-busy={busy === "start"}
          disabled={busy !== null}
          onClick={() => run("start", { action: "enable", on: false }, "Community set up. It is switched off until you say.")}
        >
          {busy === "start" ? "Setting up…" : "Set it up"}
        </button>
        {problem("start")}
      </section>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-x-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {canSettings ? (
          <>
            <Basics handle={handle} address={address} on={on} config={config} busy={busy} run={run} problem={problem} totals={totals} canEmail={canEmail} />
            {events}
            <Access config={config} products={products} busy={busy} run={run} problem={problem} />
            <Spaces config={config} products={products} busy={busy} run={run} problem={problem} />
          </>
        ) : (
          events
        )}
        <Queue queue={queue} busy={busy} run={run} problem={problem} isOwner={isOwner} />
        <Members members={members} total={totals.members} busy={busy} run={run} problem={problem} />
      </div>
      <Limits />
    </div>
  );
}

type Runner = (where: string, payload: Record<string, unknown>, done: string) => Promise<Answer>;
type Problem = (where: string) => React.ReactNode;

function Basics({
  handle,
  address,
  on,
  config,
  busy,
  run,
  problem,
  totals,
  canEmail,
}: {
  handle: string;
  address: string;
  on: boolean;
  config: CommunityConfig;
  busy: string | null;
  run: Runner;
  problem: Problem;
  totals: { members: number; listed: number; posts: number; reach: number };
  canEmail: boolean;
}) {
  const [name, setName] = useState(config.name);
  const [about, setAbout] = useState(config.about);
  const [copied, setCopied] = useState(false);
  const changed = name.trim() !== config.name || about.trim() !== config.about;
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="cm-basics-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cm-basics-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Your community</h2>
        <span className={`tag ${on ? "tag-live" : ""}`}>{on ? "On" : "Off"}</span>
      </div>
      <p className="mt-2 text-ink-soft">
        {on
          ? "Open to everyone who holds one of the products you chose below. Your store page shows the way in."
          : "Switched off: only you can open it, and your store page does not mention it."}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[var(--r-sm)] bg-sand p-3">
          <p className="text-xl font-semibold tabular-nums">{totals.members}</p>
          <p className="text-xs text-ink-soft">have come in</p>
        </div>
        <div className="rounded-[var(--r-sm)] bg-sand p-3">
          <p className="text-xl font-semibold tabular-nums">{totals.posts}</p>
          <p className="text-xs text-ink-soft">posts</p>
        </div>
        <div className="rounded-[var(--r-sm)] bg-sand p-3">
          <p className="text-xl font-semibold tabular-nums">{totals.reach}</p>
          <p className="text-xs text-ink-soft">want the community&apos;s emails</p>
        </div>
      </div>
      {!canEmail ? (
        <p className="mt-3 text-sm text-ink-soft">
          Announcements show in the community on every plan. Emailing them is part of Pro, from your Email settings, and
          counts toward its monthly emails.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={on ? "btn btn-secondary" : "btn btn-primary"}
          aria-busy={busy === "toggle"}
          disabled={busy !== null}
          onClick={() => run("toggle", { action: "enable", on: !on }, on ? "Community switched off." : "Community switched on.")}
        >
          {on ? "Switch it off" : "Switch it on"}
        </button>
        <a href={`/@${handle}/community`} className="btn btn-ghost">Open it</a>
      </div>
      {problem("toggle")}

      <p className="mt-5 text-sm font-bold text-ink">Its address</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 break-all rounded-[8px] bg-paper px-3 py-2 font-mono text-[0.9375rem] text-violet-deep ring-1 ring-line">{address}</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2200);
            } catch {
              setCopied(false);
            }
          }}
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        On your own domain it is also at /community. To sell access on its own, make a membership whose delivery link is
        this address, and check it below.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (changed) run("basics", { action: "settings", name, about }, "Saved.");
        }}
      >
        <div>
          <label htmlFor="cm-name" className="field-label">Name</label>
          <input id="cm-name" className="field mt-1" maxLength={MAX_COMMUNITY_NAME} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cm-about" className="field-label">What it is, for people who are not in yet</label>
          <textarea id="cm-about" className="field mt-1 min-h-[5rem]" maxLength={MAX_COMMUNITY_ABOUT} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Weekly threads, answers from me, and people doing the same thing as you." />
        </div>
        <button type="submit" className="btn btn-secondary" aria-busy={busy === "basics"} disabled={!changed || busy !== null}>Save</button>
      </form>
      {problem("basics")}
    </section>
  );
}

function Access({
  config,
  products,
  busy,
  run,
  problem,
}: {
  config: CommunityConfig;
  products: ProductChoice[];
  busy: string | null;
  run: Runner;
  problem: Problem;
}) {
  const [chosen, setChosen] = useState<Set<string>>(new Set(config.access));
  const changed = chosen.size !== config.access.length || config.access.some((id) => !chosen.has(id));
  const paid = products.filter((p) => !p.free);
  const free = products.filter((p) => p.free);
  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChosen(next);
  };
  const box = (p: ProductChoice) => (
    <li key={p.id}>
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[var(--r-sm)] px-2 py-2 hover:bg-paper">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={chosen.has(p.id)} onChange={() => toggle(p.id)} />
        <span className="min-w-0">
          <span className="block break-words font-semibold text-ink">{p.title}</span>
          <span className="block text-sm text-ink-soft">{p.kind}</span>
        </span>
      </label>
    </li>
  );
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-access-title">
      <h2 id="cm-access-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Who gets in</h2>
      <p className="mt-2 text-ink-soft">
        Anyone whose address bought one of the products you check. Checked against your Stripe account as they come in,
        and again every few minutes while they are here: a refund, or a membership that is canceled or stops being
        paid, closes the door within five minutes.
      </p>
      {products.length === 0 ? (
        <p className="mt-4 rounded-[var(--r-md)] bg-sand p-4 text-sm text-ink-soft">Add a product first: people come in by buying one.</p>
      ) : (
        <>
          {paid.length ? (
            <fieldset className="mt-4">
              <legend className="field-label">Paid products</legend>
              <ul className="mt-1 space-y-0.5">{paid.map(box)}</ul>
            </fieldset>
          ) : null}
          {free.length ? (
            <fieldset className="mt-4">
              <legend className="field-label">Free products (optional)</legend>
              <p className="mt-1 text-sm text-ink-soft">Only addresses that used the link we emailed them count, so nobody gets in by typing a stranger&apos;s address.</p>
              <ul className="mt-1 space-y-0.5">{free.map(box)}</ul>
            </fieldset>
          ) : null}
          <button
            type="button"
            className="btn btn-primary mt-4"
            aria-busy={busy === "access"}
            disabled={!changed || busy !== null}
            onClick={() => run("access", { action: "access", products: [...chosen] }, chosen.size ? "Saved. Access is checked again from now." : "Saved. Nobody can come in now.")}
          >
            Save who gets in
          </button>
        </>
      )}
      {problem("access")}
    </section>
  );
}

function SpaceRow({
  space,
  first,
  last,
  only,
  busy,
  run,
  open,
}: {
  space: Space;
  first: boolean;
  last: boolean;
  only: boolean;
  busy: string | null;
  run: Runner;
  /** The products that open the community: what a space may be kept for. */
  open: { id: string; title: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(space.name);
  const [about, setAbout] = useState(space.about);
  const [creatorOnly, setCreatorOnly] = useState(space.creatorOnly);
  // Named for what it is, because this component already has an `only` prop
  // that means "this is the only space".
  const [keptFor, setKeptFor] = useState<string[]>(space.only);
  const where = `space-${space.id}`;
  const kept = open.filter((p) => space.only.includes(p.id));
  return (
    <li className="py-3">
      {editing ? (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const answer = await run(where, { action: "space-edit", id: space.id, name, about, creatorOnly, only: keptFor }, "Space saved.");
            if (answer.ok) setEditing(false);
          }}
        >
          <div>
            <label htmlFor={`${where}-name`} className="field-label">Name</label>
            <input id={`${where}-name`} className="field mt-1" maxLength={MAX_SPACE_NAME} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${where}-about`} className="field-label">One line about it</label>
            <input id={`${where}-about`} className="field mt-1" maxLength={MAX_SPACE_ABOUT} value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>
          <label className="flex min-h-6 items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5" checked={creatorOnly} onChange={(e) => setCreatorOnly(e.target.checked)} />
            Only I start posts here (members still comment)
          </label>
          <OnlyPicker open={open} only={keptFor} setOnly={setKeptFor} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy !== null}>Save</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="break-words font-semibold text-ink">
              {space.name}
              {space.creatorOnly ? <span className="tag ml-2 align-middle">Only you post</span> : null}
              {kept.length ? (
                <span className="tag ml-2 align-middle">{`Buyers of ${kept.length === 1 ? kept[0].title : `${kept.length} products`}`}</span>
              ) : null}
            </p>
            {space.about ? <p className="text-sm text-ink-soft">{space.about}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-3">
            <button type="button" className={small} disabled={first || busy !== null} onClick={() => run(where, { action: "space-move", id: space.id, direction: "up" }, "Moved up.")}>
              Up<span className="sr-only">{` ${space.name}`}</span>
            </button>
            <button type="button" className={small} disabled={last || busy !== null} onClick={() => run(where, { action: "space-move", id: space.id, direction: "down" }, "Moved down.")}>
              Down<span className="sr-only">{` ${space.name}`}</span>
            </button>
            <button type="button" className={small} disabled={busy !== null} onClick={() => setEditing(true)}>
              Edit<span className="sr-only">{` ${space.name}`}</span>
            </button>
            <button
              type="button"
              className={small}
              disabled={only || busy !== null}
              onClick={() => {
                if (window.confirm(`Remove the space "${space.name}"? Its posts stay, under All posts.`)) {
                  run(where, { action: "space-remove", id: space.id }, "Space removed. Its posts are still under All posts.");
                }
              }}
            >
              Remove<span className="sr-only">{` ${space.name}`}</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * The products a space may be kept for: only those that already open the
 * community, because a space kept for a product that lets nobody in would
 * shut everybody out.
 */
function OnlyPicker({
  open,
  only,
  setOnly,
}: {
  open: { id: string; title: string }[];
  only: string[];
  setOnly: (next: string[]) => void;
}) {
  if (!open.length) return null;
  return (
    <fieldset>
      <legend className="field-label">Keep it for the buyers of</legend>
      <p className="mt-1 text-xs text-ink-soft">
        Leave every box empty and the space is for every member. Tick one or more and only members who have one of them see
        the space, its posts and its address — everybody else sees no sign of it.
      </p>
      <div className="mt-2 space-y-1.5">
        {open.map((product) => (
          <label key={product.id} className="flex min-h-6 items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0"
              checked={only.includes(product.id)}
              onChange={(e) => setOnly(e.target.checked ? [...only, product.id] : only.filter((p) => p !== product.id))}
            />
            <span className="min-w-0 break-words">{product.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Spaces({
  config,
  products,
  busy,
  run,
  problem,
}: {
  config: CommunityConfig;
  products: ProductChoice[];
  busy: string | null;
  run: Runner;
  problem: Problem;
}) {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [creatorOnly, setCreatorOnly] = useState(false);
  const [only, setOnly] = useState<string[]>([]);
  const open = products.filter((p) => config.access.includes(p.id)).map((p) => ({ id: p.id, title: p.title }));
  const full = config.spaces.length >= MAX_SPACES;
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-spaces-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cm-spaces-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Spaces</h2>
        <span className="tag">{`${config.spaces.length} of ${MAX_SPACES}`}</span>
      </div>
      <p className="mt-2 text-ink-soft">
        Where posts go: Introductions, Wins, Questions, one per module of a course. Members see them in this order.
      </p>
      <ul className="mt-3 divide-y divide-line">
        {config.spaces.map((space, i) => (
          <SpaceRow
            key={`${space.id}-${space.name}-${space.about}-${space.creatorOnly}`}
            space={space}
            first={i === 0}
            last={i === config.spaces.length - 1}
            only={config.spaces.length <= 1}
            busy={busy}
            run={run}
            open={open}
          />
        ))}
      </ul>
      {config.spaces.map((s) => <div key={s.id}>{problem(`space-${s.id}`)}</div>)}

      {!full ? (
        <form
          className="mt-5 rounded-[var(--r-md)] bg-paper p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const answer = await run("space-add", { action: "space-add", name, about, creatorOnly, only }, "Space added.");
            if (answer.ok) {
              setName("");
              setAbout("");
              setCreatorOnly(false);
              setOnly([]);
            }
          }}
        >
          <p className="field-label">Add a space</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <label htmlFor="cm-space-name" className="sr-only">Name of the new space</label>
              <input id="cm-space-name" className="field" maxLength={MAX_SPACE_NAME} placeholder="Name, like Wins" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="cm-space-about" className="sr-only">One line about the new space</label>
              <input id="cm-space-about" className="field" maxLength={MAX_SPACE_ABOUT} placeholder="One line about it (optional)" value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>
          </div>
          <label className="mt-3 flex min-h-6 items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5" checked={creatorOnly} onChange={(e) => setCreatorOnly(e.target.checked)} />
            Only I start posts here (members still comment)
          </label>
          <div className="mt-3">
            <OnlyPicker open={open} only={only} setOnly={setOnly} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm mt-3" aria-busy={busy === "space-add"} disabled={busy !== null}>Add space</button>
        </form>
      ) : null}
      {problem("space-add")}
    </section>
  );
}

function Queue({
  queue,
  busy,
  run,
  problem,
  isOwner,
}: {
  queue: QueueRow[];
  busy: string | null;
  run: Runner;
  problem: Problem;
  isOwner: boolean;
}) {
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-queue-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cm-queue-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Reported</h2>
        <span className={`tag ${queue.length ? "tag-brand" : ""}`}>{queue.length ? `${queue.length} waiting` : "Nothing waiting"}</span>
      </div>
      <p className="mt-2 text-ink-soft">
        {isOwner
          ? "Posts and comments members reported. Nobody is told who reported what. You can also hide, delete or mute from the ⋯ menu on any post."
          : "Posts and comments members reported. Nobody is told who reported what."}
      </p>
      {queue.length === 0 ? (
        <p className="mt-4 rounded-[var(--r-md)] bg-sand p-4 text-sm text-ink-soft">No reports. When a member reports something, it waits here.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {queue.map((row) => (
            <li key={row.key} className="rounded-[var(--r-md)] border border-line p-4">
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">{row.kind === "post" ? "Post" : "Comment"}</span>
                {` by ${row.author}`}
                {row.authorEmail ? <span className="break-all">{` (${row.authorEmail})`}</span> : null}
                {` · reported ${row.count === 1 ? "once" : `${row.count} times`}, last on ${day(row.at)}`}
                {row.hidden ? " · already hidden" : ""}
              </p>
              <p className="mt-2 break-words text-ink">{row.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <a href={row.href} className={small}>See it</a>
                {!row.hidden ? (
                  <button type="button" className={small} disabled={busy !== null} onClick={() => run(`q-${row.key}`, { action: "report-hide", key: row.key }, "Hidden from members.")}>
                    Hide it
                  </button>
                ) : null}
                <button
                  type="button"
                  className={small}
                  disabled={busy !== null}
                  onClick={() => {
                    if (window.confirm("Delete it for good?")) run(`q-${row.key}`, { action: "report-delete", key: row.key }, "Deleted.");
                  }}
                >
                  Delete it
                </button>
                <button type="button" className={small} disabled={busy !== null} onClick={() => run(`q-${row.key}`, { action: "dismiss", key: row.key }, "Dismissed. It stays as it was.")}>
                  Nothing wrong
                </button>
              </div>
              {problem(`q-${row.key}`)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Members({
  members,
  total,
  busy,
  run,
  problem,
}: {
  members: StudioMember[];
  total: number;
  busy: string | null;
  run: Runner;
  problem: Problem;
}) {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const shown = q ? members.filter((m) => m.email.includes(q) || m.name.toLowerCase().includes(q)) : members;
  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="cm-members-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cm-members-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Members</h2>
        <span className="tag">{`${total} ${total === 1 ? "has" : "have"} come in`}</span>
      </div>
      <p className="mt-2 text-ink-soft">
        Everyone who has opened the community, most recently here first. Their addresses are shown to you, never to other
        members. Muting lets someone read without posting; taking them out closes it to their address, whatever they bought.
      </p>
      {members.length > 8 ? (
        <div className="mt-4">
          <label htmlFor="cm-member-filter" className="sr-only">Find a member by name or address</label>
          <input id="cm-member-filter" className="field" placeholder="Find by name or address" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      ) : null}
      {members.length === 0 ? (
        <p className="mt-4 rounded-[var(--r-md)] bg-sand p-4 text-sm text-ink-soft">Nobody has come in yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {shown.map((m) => (
            <li key={m.key} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-ink">
                    {m.name || <span className="font-normal italic text-ink-mute">No name chosen</span>}
                    {m.removed ? <span className="tag ml-2 align-middle">Taken out</span> : m.muted ? <span className="tag ml-2 align-middle">Muted</span> : null}
                  </p>
                  <p className="break-all text-sm text-ink-soft">{m.email}</p>
                  <p className="text-xs text-ink-mute">
                    {`Joined ${day(m.joined)} · last here ${day(m.seen)}${m.listed ? " · in the directory" : ""}${m.mail ? " · wants the community's emails" : ""}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3">
                  {!m.removed ? (
                    <button type="button" className={small} disabled={busy !== null} onClick={() => run(`m-${m.key}`, { action: "member", key: m.key, muted: !m.muted }, m.muted ? "Unmuted." : "Muted.")}>
                      {m.muted ? "Unmute" : "Mute"}<span className="sr-only">{` ${m.email}`}</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={small}
                    disabled={busy !== null}
                    onClick={() => {
                      if (m.removed || window.confirm(`Take ${m.email} out of the community? Their posts stay until you delete them.`)) {
                        run(`m-${m.key}`, { action: "member", key: m.key, removed: !m.removed }, m.removed ? "Let back in." : "Taken out.");
                      }
                    }}
                  >
                    {m.removed ? "Let back in" : "Take out"}<span className="sr-only">{` ${m.email}`}</span>
                  </button>
                </div>
              </div>
              {problem(`m-${m.key}`)}
            </li>
          ))}
        </ul>
      )}
      {total > members.length ? (
        <p className="mt-3 text-sm text-ink-soft">{`Showing the ${members.length} most recently here, of ${total}.`}</p>
      ) : null}
    </section>
  );
}

function Limits() {
  const rows: [string, string][] = [
    ["Spaces", `${MAX_SPACES}`],
    ["Posts in the community", MAX_POSTS.toLocaleString("en-US")],
    ["A post", `${MAX_POST_TEXT.toLocaleString("en-US")} characters, and one picture up to 1 MB`],
    ["Comments under one post", `${MAX_COMMENTS_PER_POST}, each up to ${MAX_COMMENT_TEXT.toLocaleString("en-US")} characters, one level of replies`],
    ["Pinned posts", `${MAX_PINNED}, plus one Start here post`],
    ["Members", MAX_MEMBERS.toLocaleString("en-US")],
    ["Live events", `${MAX_UPCOMING_EVENTS} coming up at a time, up to ${MAX_EVENT_CAP.toLocaleString("en-US")} places each or no cap; past ones kept with their replays`],
  ];
  return (
    <aside className="card mt-8 p-6 sm:p-8 lg:sticky lg:top-24" aria-labelledby="cm-limits-title">
      <h2 id="cm-limits-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">Limits, and what stops spam</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="font-semibold text-ink">{k}</dt>
            <dd className="text-ink-soft">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm font-semibold text-ink">Each member, at most</p>
      <ul className="mt-2 space-y-1 text-sm text-ink-soft">
        {Object.values(RATE_LIMITS).map((limit) => (
          <li key={limit.words}>{limit.words}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-soft">
        You are never limited. Everything members write is shown as plain text: web addresses become links, and nothing
        else they type can change the page. Pictures are checked by their contents, not their name.
      </p>
    </aside>
  );
}
