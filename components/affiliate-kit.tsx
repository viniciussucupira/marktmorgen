"use client";

import { useId, useState } from "react";
import { affiliatesWords } from "@/lib/buyer-words/affiliates";
import { MAX_KIT_NOTE, type AffiliatePosts } from "@/lib/affiliate-kit-rules";
import type { LanguageCode } from "@/lib/store-language";

const NETWORKS = ["x", "instagram", "linkedin"] as const;

/** One post, in a box the affiliate can edit, with a copy button. */
function Post({ label, text, copy, copied }: { label: string; text: string; copy: string; copied: string }) {
  const id = useId();
  const [value, setValue] = useState(text);
  const [done, setDone] = useState(false);
  return (
    <div className="mt-4">
      <label htmlFor={id} className="st-label">
        {label}
      </label>
      <textarea id={id} rows={8} className="st-field mt-1 text-sm leading-relaxed" value={value} onChange={(event) => setValue(event.target.value)} />
      <button
        type="button"
        className="btn btn-secondary btn-sm mt-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            window.setTimeout(() => setDone(false), 2200);
          } catch {
            // The box can be selected and copied by hand.
          }
        }}
      >
        <span aria-live="polite">{done ? copied : copy}</span>
      </button>
    </div>
  );
}

/** Three posts about one product, drafted for a signed-in affiliate (lib/affiliate-kit.ts). */
export function AffiliateKit({ handle, language, products }: { handle: string; language: LanguageCode; products: { id: string; title: string }[] }) {
  const a = affiliatesWords(language);
  const w = a.kit;
  const id = useId();
  const [product, setProduct] = useState(products[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<AffiliatePosts | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [round, setRound] = useState(0);

  async function write() {
    if (busy || !product) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/store/affiliates/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, product, note }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; posts?: AffiliatePosts; left?: number };
      if (data.ok && data.posts) {
        setPosts(data.posts);
        setLeft(typeof data.left === "number" ? data.left : null);
        setRound((n) => n + 1);
      } else {
        const key = data.error === "day" || data.error === "month" || data.error === "failed" ? data.error : "other";
        setError(w.errors[key]);
      }
    } catch {
      setError(w.errors.other);
    } finally {
      setBusy(false);
    }
  }

  if (!products.length) return null;
  return (
    <section className="mt-8" aria-labelledby={`${id}-h`} data-kit>
      <h2 id={`${id}-h`} className="text-lg font-semibold">
        {w.head}
      </h2>
      <p className="st-muted mt-2 text-sm">{w.intro}</p>
      <label htmlFor={`${id}-p`} className="st-label mt-4 block">
        {w.product}
      </label>
      <select id={`${id}-p`} className="st-field mt-1" value={product} onChange={(event) => setProduct(event.target.value)}>
        {products.map((each) => (
          <option key={each.id} value={each.id}>
            {each.title}
          </option>
        ))}
      </select>
      <label htmlFor={`${id}-n`} className="st-label mt-4 block">
        {w.note}
      </label>
      <textarea
        id={`${id}-n`}
        rows={3} className="st-field mt-1 text-sm"
        maxLength={MAX_KIT_NOTE}
        value={note}
        placeholder={w.notePlaceholder}
        onChange={(event) => setNote(event.target.value)}
      />
      <button type="button" className="btn st-btn mt-3" disabled={busy || !product} aria-busy={busy} onClick={write}>
        {busy ? w.working : w.button}
      </button>
      {error ? (
        <p className="st-note mt-3 text-sm font-semibold" role="alert">
          {error}
        </p>
      ) : null}
      {posts ? (
        <div key={round} data-posts>
          {NETWORKS.map((network) => (
            <Post key={network} label={w.labels[network]} text={posts[network]} copy={a.copy} copied={a.copied} />
          ))}
          {left !== null ? <p className="st-muted mt-3 text-xs">{w.left(left)}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
