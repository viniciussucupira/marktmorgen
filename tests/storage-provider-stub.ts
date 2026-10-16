/** Test-only provider answers; production code never imports this module. */
export const storageAnswers: { pages: unknown[]; vault: number | null; video: number | null; fail: boolean } = { pages: [], vault: 0, video: 0, fail: false };
export function resetStorageAnswers(): void { storageAnswers.pages = []; storageAnswers.vault = 0; storageAnswers.video = 0; storageAnswers.fail = false; }
export async function list(): Promise<unknown> {
 if (storageAnswers.fail) throw new Error("TEST: provider unavailable");
 return storageAnswers.pages.shift() ?? { blobs: [], hasMore: false };
}
export async function vaultHeld(): Promise<number | null> { return storageAnswers.vault; }
export async function streamHeld(): Promise<number | null> { return storageAnswers.video; }
const unused = async (): Promise<never> => { throw new Error("TEST: unexpected provider operation"); };
export { unused as deleteVault, unused as headVault, unused as listVault, unused as readVault, unused as vaultUrl, unused as writeVault, unused as head, unused as del, unused as issueSignedToken, unused as presignUrl, unused as get, unused as put };
