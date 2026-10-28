import assert from "node:assert/strict";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import UnsubscribePage from "@/app/unsubscribe/page";
import { claimHandle, ensureListId, setLanguage, storeForEmail } from "@/lib/store";
import { tokensFor, unsubscribe, upsertContact } from "@/lib/contacts";
import { stopCounting } from "@/lib/mail-clicks";
import { LANGUAGE_CODES } from "@/lib/store-language";
import { store as redis } from "./redis-stub";
import { ROOM } from "./data-room";

// Resolve actual async server children; no live request, token or mail.
async function settle(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(settle));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (typeof element.type === "function") {
    return settle(await (element.type as (props: unknown) => ReactNode | Promise<ReactNode>)(element.props));
  }
  return "children" in element.props ? cloneElement(element, undefined, await settle(element.props.children)) : element;
}
async function show(query: Record<string,string>) {
  return renderToStaticMarkup(await settle(await UnsubscribePage({searchParams:Promise.resolve(query)})));
}
async function main() {
  redis.clear();
  globalThis.fetch = (async () => { throw new Error("Unexpected external request"); }) as typeof fetch;
  const owner="unsubscribe-render@example.test", email="reader@example.test";
  await claimHandle(owner,"unsubscribe-render","Synthetic Store","");
  await ensureListId(owner);
  const store=(await storeForEmail(owner))!;
  assert.ok(store.listId);
  await upsertContact(store.listId,email,{agreed:true,explicit:true,source:"import",clicks:true},ROOM);
  const token=(await tokensFor(store.listId,[email],store.handle)).get(email);
  assert.ok(token);
  for (const language of LANGUAGE_CODES) {
    await setLanguage(owner,language);
    for (const key of ["t","l"]) {
      const html=await show({[key]:token,done:"1"});
      assert.match(html,/<form /,"URL alone must not claim opt-out");
      assert.ok(html.includes("/api/mail/unsubscribe?"+key+"="+token));
    }
  }
  await stopCounting(token);
  assert.doesNotMatch(await show({l:token}),/<form /,"persisted counting opt-out confirms without URL flag");
  assert.match(await show({t:token,done:"1"}),/<form /,"counting opt-out must not unsubscribe the list");
  await unsubscribe(token);
  for (const done of ["0","1"]) assert.doesNotMatch(await show({t:token,done}),/<form /,"persisted list opt-out ignores URL status");
  const unknown=await show({t:"f".repeat(40),done:"1"});
  assert.doesNotMatch(unknown,/<form /);
  assert.ok(!unknown.includes(email));
  console.log("Unsubscribe persisted-state rendering: existing languages, forged confirmation, independent opt-ins and actual suppression passed.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
