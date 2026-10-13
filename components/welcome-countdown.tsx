"use client";

import { useEffect, useState } from "react";
import { leftWords } from "@/lib/welcome-offer";

/**
 * The time left on a person's welcome offer (lib/welcome-offer.ts), counted
 * down every second, and the moment it ends in the visitor's own time. When
 * it reaches the end the page is read again, so the button goes.
 */
export function WelcomeCountdown({ until, left, untilWords, locale }: { until: number; left: string; untilWords: string; locale: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const seconds = Math.floor(Date.now() / 1000);
      setNow(seconds);
      if (seconds >= until) window.location.reload();
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [until]);
  const when = new Date(until * 1000).toLocaleString(locale, { month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const shown = now === null ? null : leftWords(until, now);
  return (
    <>
      <p className="st-muted mt-2 text-sm" suppressHydrationWarning>
        {untilWords.replace("{when}", when)}
      </p>
      {shown ? (
        <p className="mt-3 font-display text-2xl font-semibold tabular-nums" role="timer" aria-live="off" data-welcome-left>
          <span className="st-muted mr-1 text-sm font-normal">{left}</span>{" "}
          {shown}
        </p>
      ) : null}
    </>
  );
}
