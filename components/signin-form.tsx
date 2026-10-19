"use client";

import { useEffect, useState } from "react";
import { initBotId } from "botid/client/core";
import { Icon } from "@/components/icons";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const MESSAGES: Record<string, string> = {
  invalid_email: "That does not look like an email address.",
  rate_limited:
    "That is a lot of tries from one place. Wait an hour and try again.",
  unavailable:
    "Logging in is not switched on yet, so nothing was sent. Write to us and we will tell you when it is.",
  server_error: "Something went wrong on our side. Try again in a moment.",
  unconfirmed:
    "We could not confirm this browser, so nothing was sent. Reload the page and try again. If it keeps happening, write to support@marktmorgen.com.",
};

/**
 * The browser's own fetch, kept from before the challenge below wraps it.
 *
 * The form emails whatever address is typed into it, so the server asks the
 * host whether a person's browser sent the request (lib/bot-check.ts). The
 * host's answer needs a challenge solved here: this wraps fetch so that the
 * one request to /api/auth/request carries the solution, and loads the
 * challenge only when that request is made. If the challenge cannot load,
 * the request goes out unwrapped and the server says what happened, rather
 * than the form failing with no reason given.
 */
let plainFetch: typeof fetch | null = null;

function startChallenge() {
  if (plainFetch || process.env.NODE_ENV !== "production") return;
  plainFetch = window.fetch.bind(window);
  initBotId({ protect: [{ path: "/api/auth/request", method: "POST" }] });
}

/** The shape of an address, checked as the person types; the server checks it again. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_AFTER_SECONDS = 30;

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [touched, setTouched] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(startChallenge, []);

  // The count before "Send it again" opens, one second at a time.
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const trimmed = email.trim();
  const shapeProblem =
    touched && trimmed.length > 0 && !LOOKS_LIKE_EMAIL.test(trimmed)
      ? "Check the address: it needs an @ and a domain, like you@example.com."
      : null;

  async function send() {
    setState({ kind: "sending" });

    try {
      const ask = (how: typeof fetch) =>
        how("/api/auth/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, website }),
        });
      const response = await ask(fetch).catch((error: unknown) => {
        if (!plainFetch) throw error;
        return ask(plainFetch);
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setState({ kind: "sent" });
        setWait(RESEND_AFTER_SECONDS);
        return;
      }
      setState({
        kind: "error",
        message: MESSAGES[data.error ?? ""] ?? MESSAGES.server_error,
      });
    } catch {
      setState({ kind: "error", message: MESSAGES.server_error });
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state.kind === "sending") return;
    setTouched(true);
    if (!LOOKS_LIKE_EMAIL.test(trimmed)) {
      setState({ kind: "error", message: trimmed ? "Check the address: it needs an @ and a domain, like you@example.com." : "Type your email first." });
      return;
    }
    await send();
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint-soft text-mint-deep">
          <Icon name="mail" size={24} />
        </span>
        <p className="mt-4 text-xl font-semibold text-ink">Check that inbox</p>
        <p className="mt-2 text-ink-soft">
          If <span className="font-medium text-ink">{email}</span> can log in, the link is on its way from Marktmorgen.
          It works once and stops working in 15 minutes.
        </p>
        <p className="mt-3 text-sm text-ink-soft">Not there within a minute? Look in spam or promotions.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => void send()} disabled={wait > 0} className="btn btn-secondary btn-sm">
            {wait > 0 ? `Send it again in ${wait}s` : "Send it again"}
          </button>
          <button type="button" onClick={() => setState({ kind: "idle" })} className="btn btn-ghost btn-sm">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="signin-email" className="field-label">
          Your email
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          onBlur={() => setTouched(true)}
          placeholder="you@example.com"
          aria-invalid={state.kind === "error" || shapeProblem ? true : undefined}
          aria-describedby={state.kind === "error" ? "signin-error" : shapeProblem ? "signin-hint" : undefined}
          className="field mt-2"
        />
        {shapeProblem && state.kind !== "error" ? (
          <p id="signin-hint" className="mt-2 text-sm text-danger-text">
            {shapeProblem}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people, irresistible to robots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="signin-website">Website</label>
        <input
          id="signin-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {state.kind === "error" ? (
        <p id="signin-error" className="notice notice-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="btn btn-primary btn-lg btn-block"
      >
        {state.kind === "sending" ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending
          </>
        ) : (
          "Email me a link"
        )}
      </button>

      <p className="text-sm text-ink-mute">
        No password. We send a link that works once, and we answer the same way
        whether or not that address has an account.
      </p>
    </form>
  );
}
