"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiAssist } from "@/components/ai-assist";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";
import { NewTab } from "@/components/new-tab";

const MAX_TITLE = 120;
const MAX_BODY = 20_000;

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  title: "Give the post a title.",
  body: "Write the post before saving it.",
  full: "A blog holds up to 200 posts. Delete one first.",
  unknown: "That post is no longer there. Reload the page.",
  none: "This account has no store yet.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

export type EditedPost = { id: string | null; title: string; body: string; product: string | null; draft: boolean; href: string | null };

/**
 * Writing one post of the store's blog (lib/store-blog.ts): a title, the
 * words — plain text, as a product's description is, with "## " for a
 * heading — and, if the creator likes, one of their products to end on.
 * Published, kept as a draft, or deleted from here; a draft is seen by no
 * one but the studio.
 */
export function BlogEditor({ post, products, back }: { post: EditedPost; products: { id: string; title: string }[]; back: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [product, setProduct] = useState(post.product ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(payload: Record<string, unknown>, kind: string) {
    setBusy(kind);
    setError(null);
    try {
      const response = await fetch("/api/store/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; post?: { id: string } };
      if (!data.ok) {
        setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
        return null;
      }
      return data;
    } catch {
      setError(MESSAGES.server_error);
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function save(draft: boolean) {
    const data = await send({ action: "save", id: post.id, title, body, product: product || null, draft }, draft ? "draft" : "publish");
    if (!data) return;
    toast(draft ? "Saved as a draft." : "Published on your blog.");
    router.push(`${back}${back.includes("?") ? "&" : "?"}edit=${data.post?.id ?? ""}`);
    router.refresh();
  }

  async function remove() {
    if (!post.id) return;
    const data = await send({ action: "delete", id: post.id }, "delete");
    if (!data) return;
    toast("Post deleted.");
    router.push(back);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AiAssist<{ title: string; body: string }>
        title="Write a draft with AI"
        hint="A useful post on the topic you give, in your store's language, from your words and what your store sells. It mentions a product only where it fits. It replaces the title and words here; nothing is saved until you press Publish or Save as draft."
        placeholder="What the post is about, who it is for, the points you want in it."
        payload={() => ({ kind: "blog" })}
        onResult={(draft) => {
          setTitle(draft.title.slice(0, MAX_TITLE));
          setBody(draft.body.slice(0, MAX_BODY));
        }}
        done="Drafted. Read it, make it yours, then publish it or keep it as a draft."
      />
      <div>
        <label htmlFor="post-title" className="field-label">
          Title
        </label>
        <input id="post-title" className="field" maxLength={MAX_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label htmlFor="post-body" className="field-label">
          The post
        </label>
        <textarea id="post-body" className="field font-[inherit]" rows={18} maxLength={MAX_BODY} value={body} onChange={(e) => setBody(e.target.value)} aria-describedby="post-body-hint" />
        <p id="post-body-hint" className="field-hint mt-1">
          {`A blank line starts a paragraph, a line starting with “## ” is a heading, one starting with “- ” is a point in a list, and a written-out https address becomes a link. ${(MAX_BODY - body.length).toLocaleString("en-US")} characters left.`}
        </p>
      </div>
      <div>
        <label htmlFor="post-product" className="field-label">
          End on one of your products (optional)
        </label>
        <select id="post-product" className="field" value={product} onChange={(e) => setProduct(e.target.value)}>
          <option value="">None</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <p className="field-hint mt-1">Its card, with today&apos;s picture and price, after the last line. Products among the first 24 on your store page can be shown.</p>
      </div>
      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => void save(false)}>
          {busy === "publish" ? "Publishing…" : post.id && !post.draft ? "Save and keep it published" : "Publish"}
        </button>
        <button type="button" className="btn btn-secondary" disabled={busy !== null} onClick={() => void save(true)}>
          {busy === "draft" ? "Saving…" : post.id && !post.draft ? "Take it off the blog, as a draft" : "Save as draft"}
        </button>
        {post.href ? (
          <a href={post.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            View it
            <Icon name="external" size={15} />
          <NewTab /></a>
        ) : null}
        {post.id ? (
          <button type="button" className="btn btn-ghost ml-auto text-danger" disabled={busy !== null} onClick={() => void remove()}>
            <Icon name="trash" size={15} />
            {busy === "delete" ? "Deleting…" : "Delete"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
