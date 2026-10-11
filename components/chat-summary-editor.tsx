"use client";

import { useState } from "react";
import { toast } from "@/components/toast";
import type { ChatKind } from "@/lib/chat-summary";

const ANSWERS: Record<string, string> = {
  invalid: "That is not a Slack or Discord webhook address. It starts with https://hooks.slack.com/services/ or https://discord.com/api/webhooks/.",
  refused: "The channel did not take a first message at that address. Check it was copied whole and the webhook is still on.",
  rate_limited: "That is a lot of tries in an hour. Try again later.",
};

/** Where the weekly and monthly numbers are posted (lib/chat-summary.ts), for whoever may change settings. */
export function ChatSummaryEditor({ kind: given }: { kind: ChatKind | null }) {
  const [kind, setKind] = useState(given);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(value: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/store/chat-summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: value }) });
      const answer = (await response.json().catch(() => ({}))) as { ok?: boolean; result?: string; error?: string };
      if (answer.ok) {
        setKind(answer.result === "saved" ? (value.includes("slack") ? "slack" : "discord") : null);
        setUrl("");
        toast(answer.result === "saved" ? "Saved: a first message was posted to the channel" : "No longer posted");
      } else {
        toast(ANSWERS[answer.error ?? ""] ?? "That did not save. Try again in a moment.");
      }
    } catch {
      toast("That did not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-sm font-bold text-ink">Post the numbers to Slack or Discord</p>
      <p className="mt-1 text-xs text-ink-soft">
        {kind
          ? `The week's numbers go to your ${kind === "slack" ? "Slack" : "Discord"} channel every Monday, and the month's on the 1st. Stopping the emails does not stop these.`
          : "The week's numbers every Monday and the month's on the 1st, in the channel your team already reads. Paste an incoming webhook address: in Slack, Apps, Incoming Webhooks; in Discord, Server settings, Integrations, Webhooks."}
      </p>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          save(url.trim());
        }}
      >
        <label className="min-w-0 flex-1 text-sm">
          <span className="field-label">{kind ? "A different webhook address" : "Webhook address"}</span>
          <input
            className="field mt-1 py-2"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            autoComplete="off"
            required
          />
        </label>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          Save
        </button>
        {kind ? (
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => save("")}>
            Stop posting
          </button>
        ) : null}
      </form>
    </div>
  );
}
