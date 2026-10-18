/**
 * lib/blob.ts for the security journeys (scripts/security-redis.mjs): the file
 * store is another company's, and a journey must not reach it. Every call is
 * recorded in `blobCalls`, for a journey to count, and is answered as a store
 * with no such file would answer: `get` and `head` with nothing; the rest
 * refuse, since no journey writes a file.
 */
export const blobCalls: string[] = [];

export async function get(pathname: string): Promise<null> {
  blobCalls.push(`get ${pathname}`);
  return null;
}

export async function head(pathname: string): Promise<null> {
  blobCalls.push(`head ${pathname}`);
  return null;
}

function refused(name: string): never {
  blobCalls.push(name);
  throw new Error(`the file store is not reached in this check: ${name}`);
}

export const del = async () => refused("del");
export const list = async () => refused("list");
export const put = async () => refused("put");
export const issueSignedToken = async () => refused("issueSignedToken");
export const presignUrl = async () => refused("presignUrl");
