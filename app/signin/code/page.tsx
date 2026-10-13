import { PendingSubmit } from "@/components/pending-submit";
import Link from "next/link";
import { cookies } from "next/headers";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TWO_STEP_COOKIE, heldFor } from "@/lib/two-step";

export const metadata: Metadata = {
  title: "Your code — Marktmorgen",
  description: "The second step of logging in to Marktmorgen.",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, string> = {
  wrong: "That code is not right. Type the six digits your app shows now, or one of your recovery codes.",
  limited: "That is a lot of codes in an hour. Wait a while, then try again, or log in with a passkey.",
  unreadable:
    "Your app's codes cannot be checked right now, after a security change on our side. Use one of your recovery codes, or log in with a passkey, then turn two-step login off and on again.",
};

/**
 * The second step of logging in, for an account with two-step login
 * (lib/two-step.ts): the emailed link has been spent, and the session opens
 * once the code from the authenticator app, or a recovery code, is right.
 */
export default async function CodePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const held = (await cookies()).get(TWO_STEP_COOKIE)?.value ?? "";
  if (!(await heldFor(held))) redirect("/signin?status=expired");
  const status = typeof params.status === "string" ? params.status : "";
  const notice = NOTICES[status] ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <main id="content" className="relative mx-auto max-w-xl px-4 py-16">
        <Link href="/" className="inline-block w-fit rounded-[10px]" aria-label="Marktmorgen, home">
          <Logo />
        </Link>

        <h1 className="t-h1 mt-6">One more step</h1>
        <p className="mt-4 text-lg text-ink-soft">Your link was good. Now type the code your authenticator app shows for Marktmorgen.</p>

        <div className="card mt-8 p-6 sm:p-8">
          {notice ? (
            <p className="notice notice-error mb-5" role="alert">
              {notice}
            </p>
          ) : null}
          <form method="post" action="/api/auth/code" className="space-y-4">
            <label className="block" htmlFor="two-step-code">
              <span className="field-label">Code</span>
              <input
                id="two-step-code"
                name="code"
                className="field mt-2 text-lg tracking-[0.2em]"
                inputMode="text"
                autoComplete="one-time-code"
                autoFocus
                required
                maxLength={20}
                placeholder="123456"
              />
            </label>
            <PendingSubmit label="Log me in" pending="Checking…" className="btn btn-primary btn-lg btn-block" />
          </form>
          <p className="mt-4 text-sm text-ink-soft">
            No phone at hand? Type one of the recovery codes you saved when you turned this on; each works once. Or{" "}
            <Link href="/signin" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
              log in with a passkey
            </Link>
            , which needs no code.
          </p>
        </div>
      </main>
    </div>
  );
}
