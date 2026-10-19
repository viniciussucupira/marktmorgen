import Link from "next/link";
import type { Store } from "@/lib/store";
import type { Role } from "@/lib/team-roles";
import { readStudioPathInvitation } from "@/lib/path-studio-reminder";
import { studioPath } from "@/lib/studio-route";
/** One existing record read inside the studio page's reserved requests. */
export async function PathStudioReminder({ store, role }: { store: Pick<Store, "sid">; role: Role }) {
  if (role !== "owner") return null;
  if (!await readStudioPathInvitation(store, role)) return null;
  return <aside className="mt-6 rounded-2xl border border-line bg-white p-5" aria-labelledby="path-studio-reminder-title">
    <h2 id="path-studio-reminder-title" className="text-lg font-semibold">Continue your Path</h2>
    <p className="mt-2 text-ink-soft">Open your Path to read your store&apos;s current facts and choose your next step. Ready when you are.</p>
    <Link className="btn mt-4" href={studioPath(store, "", "path")} prefetch={false}>Open your Path</Link>
  </aside>;
}
