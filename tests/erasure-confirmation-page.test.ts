import assert from "node:assert/strict";
import { isValidElement, type ReactNode } from "react";
import DeletePage from "@/app/privacy/delete/page";
import { makeErasureReceipt } from "@/lib/erasure-receipt";

function inspect(node: ReactNode, result = { asks: 0, text: "" }): typeof result {
  if (Array.isArray(node)) { for (const child of node) inspect(child, result); return result; }
  if (typeof node === "string" || typeof node === "number") { result.text += String(node); return result; }
  if (!isValidElement<{children?:ReactNode; action?:string}>(node)) return result;
  if (node.type === "form" && node.props.action === "/api/privacy/erase") result.asks++;
  // Inspect the actual server page's chosen branch, without executing client navigation hooks.
  inspect(node.props.children, result);
  return result;
}
async function main() {
  const previous = process.env.NIMBUS_DATA_KEY;
  process.env.NIMBUS_DATA_KEY = "synthetic-erasure-render-key-32-characters";
  globalThis.fetch = (async()=>{throw new Error("Unexpected external request");}) as typeof fetch;
  const show = async(query:Record<string,string|undefined>) => inspect(await DeletePage({searchParams:Promise.resolve(query)}));
  try {
    for (const query of [{status:"done",n:"999"}, {status:"done",n:"-1",receipt:"forged"}, {status:"more",n:"3"}]) {
      const result=await show(query);
      assert.equal(result.asks,1,"unverified URL must retain request form");
      assert.ok(!result.text.includes("Done. You were deleted"));
      assert.ok(result.text.includes("cannot confirm"));
    }
    const receipt=makeErasureReceipt("done",2,"a".repeat(64));
    assert.ok(receipt);
    const verified=await show({status:"done",n:"999",receipt});
    assert.equal(verified.asks,0);
    assert.ok(verified.text.includes("deleted from 2 stores"));
    assert.ok(!verified.text.includes("999"));
    assert.ok(!verified.text.includes("owner was told"));
    assert.ok(!verified.text.includes("each owner was told"));
    const changed=await show({status:"done",receipt:receipt+"x"});
    assert.equal(changed.asks,1);
    assert.ok(!changed.text.includes("Done. You were deleted"));
    console.log("Erasure page: forged completion retains request form; verified server count overrides URL; tampered receipt refused; no external work.");
  } finally {
    if(previous===undefined) delete process.env.NIMBUS_DATA_KEY; else process.env.NIMBUS_DATA_KEY=previous;
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
