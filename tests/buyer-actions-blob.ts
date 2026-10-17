/** The file store as tests/buyer-actions.test.ts sees it: a set of paths, and what was deleted from it. */
export const files = new Set<string>();
export const deleted: string[] = [];
export let failDeletes = false;
export function setFailDeletes(on: boolean): void {
  failDeletes = on;
}
export async function del(pathnames: string | string[]): Promise<void> {
  if (failDeletes) throw new Error("the file store is down");
  for (const path of Array.isArray(pathnames) ? pathnames : [pathnames]) {
    files.delete(path);
    deleted.push(path);
  }
}
export async function head(path: string): Promise<{ size: number; contentType: string }> {
  if (!files.has(path)) throw new Error("not found");
  return { size: 1000, contentType: "image/jpeg" };
}
export async function get(): Promise<null> {
  return null;
}
