import { isAiSupplierSpendConfigured, readAiSupplierPolicy, reserveAiSupplierSpend, type AiSupplierPolicy } from "@/lib/ai-supplier-spend";
import { askModel, isAiConfigured } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main() {
  const saved = process.env.AI_SUPPLIER_SPEND_POLICY;
  const savedKey = process.env.ANTHROPIC_API_KEY;
  const now = Date.now(), period = new Date(now).toISOString().slice(0, 7);
  const key = `nl:spend:anthropic:${period}`;
  const policy: AiSupplierPolicy = { period, currency: "USD", unit: "microUSD", budgetMicroUsd: 10, validUntil: now + 3_600_000, evidence: "Synthetic cap", boundsConfirmed: true, models: [{ model: "claude-sonnet-5-5", maxOutputTokens: 1000, maxRequestBytes: 10_000, upperBoundMicroUsd: 3, evidence: "Synthetic request bound" }, { model: "claude-haiku-5-5", maxOutputTokens: 1000, maxRequestBytes: 10_000, upperBoundMicroUsd: 4, evidence: "Synthetic request bound" }] };
  const input = { model: policy.models[0].model, maxOutputTokens: 100, requestBytes: 100 };
  const original = redis.pipeline, normal = Symbol("normal");
  let reply: unknown = normal, apply = false, calls = 0, writes = 0, refunds = 0, expires = 0, providerMode = "ok";
  let changePolicy = false;
  redis.pipeline = async commands => {
    if (commands.some(c => c[0] === "DECR" || c[0] === "DECRBY")) refunds++;
    if (commands.some(c => c[0] === "EXPIRE")) expires++;
    if (commands.some(c => c[0] === "INCRBY" && c[1] === key)) {
      writes++;
      if (changePolicy) process.env.AI_SUPPLIER_SPEND_POLICY = JSON.stringify({ ...policy, budgetMicroUsd: 5 });
      if (reply !== normal) {
        if (apply) await original.call(redis, commands);
        if (reply instanceof Error) throw reply;
        return reply as unknown[];
      }
    }
    return original.call(redis, commands);
  };
  globalThis.fetch = (async (url: string | URL | Request) => {
    if (new URL(String(url)).hostname !== "api.anthropic.com") return new Response("not found", { status: 404 });
    calls++;
    if (providerMode === "throw") throw Error("lost provider response");
    if (providerMode === "refuse") return new Response("synthetic refusal", { status: 529 });
    return new Response(JSON.stringify({ content: [{ type: "text", text: "Synthetic answer" }] }));
  }) as typeof fetch;
  const reset = async () => {
    await original.call(redis, [["DEL", key]]);
    process.env.AI_SUPPLIER_SPEND_POLICY = JSON.stringify(policy);
    process.env.ANTHROPIC_API_KEY = "sk-ant-spend-synthetic-not-real-00000";
    reply = normal; apply = changePolicy = false; calls = writes = refunds = expires = 0; providerMode = "ok";
  };
  try {
    part("Evidence, basis, models and expiry are mandatory");
    is("valid policy", readAiSupplierPolicy(JSON.stringify(policy), now), policy);
    for (const bad of [undefined, "", "{", "null", "[]", "true", JSON.stringify({ ...policy, period: "2020-01" }), JSON.stringify({ ...policy, currency: "EUR" }), JSON.stringify({ ...policy, unit: "cents" }), JSON.stringify({ ...policy, budgetMicroUsd: -1 }), JSON.stringify({ ...policy, budgetMicroUsd: 1.5 }), JSON.stringify({ ...policy, budgetMicroUsd: Number.MAX_SAFE_INTEGER + 1 }), JSON.stringify({ ...policy, validUntil: now }), JSON.stringify({ ...policy, boundsConfirmed: false }), JSON.stringify({ ...policy, evidence: " " }), JSON.stringify({ ...policy, models: [] }), JSON.stringify({ ...policy, models: [null] }), JSON.stringify({ ...policy, models: [policy.models[0], policy.models[0]] }), ...["maxOutputTokens", "maxRequestBytes", "upperBoundMicroUsd"].map(field => JSON.stringify({ ...policy, models: [{ ...policy.models[0], [field]: 0 }] })), JSON.stringify({ ...policy, models: [{ ...policy.models[0], evidence: "" }] })]) {
      await reset();
      if (bad === undefined) delete process.env.AI_SUPPLIER_SPEND_POLICY; else process.env.AI_SUPPLIER_SPEND_POLICY = bad;
      is("invalid policy unconfigured", isAiSupplierSpendConfigured(now), false);
      is("invalid policy calls no model", await askModel("System", "Prompt", 100, input.model), null);
      is("no reservation/provider with invalid policy", [writes, calls], [0, 0]);
    }
    await reset(); process.env.AI_SUPPLIER_SPEND_POLICY = JSON.stringify({ ...policy, budgetMicroUsd: 0 });
    is("zero budget disables writing availability", isAiConfigured(), false);
    is("zero budget refuses provider work", await askModel("System", "Prompt", 100, input.model), null);

    part("Uncertain or lost money reservations never authorize a provider");
    for (const bad of [null, [], ["3"], [true], [0], [-1], [1], [2.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], [3, 3], new Error("lost Redis response")]) {
      await reset(); reply = bad; apply = true;
      is("unknown reservation denies provider", await askModel("System", "Prompt", 100, input.model), null);
      is("one attempt, no provider/refund/expiry", [writes, calls, refunds, expires], [1, 0, 0, 0]);
      is("possibly applied money remains reserved", (await original.call(redis, [["GET", key]]))[0], "3");
    }
    part("A real provider path cannot exceed the declared shared cap");
    await reset();
    for (let i = 0; i < 3; i++) is("within cap returns model result", await askModel("System", "Prompt", 100, input.model), "Synthetic answer");
    is("fourth request exceeds cap", await askModel("System", "Prompt", 100, input.model), null);
    is("only three provider calls", calls, 3);
    is("all reservations retained including refused excess", (await original.call(redis, [["GET", key]]))[0], "12");
    await reset();
    is("first model reserves", await reserveAiSupplierSpend(input, () => now), true);
    is("second model shares budget", await reserveAiSupplierSpend({ ...input, model: policy.models[1].model }, () => now), true);
    is("another second-model call exceeds shared budget", await reserveAiSupplierSpend({ ...input, model: policy.models[1].model }, () => now), false);
    is("model override cannot reset key", (await original.call(redis, [["GET", key]]))[0], "11");
    await reset();
    const results = await Promise.all(Array.from({ length: 30 }, () => reserveAiSupplierSpend(input, () => now)));
    is("concurrent reservations authorize only affordable calls", results.filter(Boolean).length, 3);
    is("no money is automatically refunded or expired", [refunds, expires], [0, 0]);

    part("Failure is not evidence of zero provider cost");
    for (const mode of ["refuse", "throw"]) {
      await reset(); providerMode = mode;
      await askModel("System", "Prompt", 100, input.model).catch(() => null);
      is("failed provider keeps money reservation", [(await original.call(redis, [["GET", key]]))[0], calls, refunds], ["3", 1, 0]);
    }
    part("Unknown model and oversized requests fail before charging");
    await reset();
    for (const candidate of [{ ...input, model: "claude-unknown-1" }, { ...input, maxOutputTokens: 0 }, { ...input, maxOutputTokens: 1001 }, { ...input, maxOutputTokens: 1.5 }, { ...input, requestBytes: 10001 }, { ...input, requestBytes: 0 }]) is("outside reviewed bounds denied", await reserveAiSupplierSpend(candidate, () => now), false);
    is("request rejection writes nothing", writes, 0);
    is("serialized oversized prompt never reaches provider", await askModel("System", "x".repeat(10_000), 100, input.model), null);
    is("oversized request reserves nothing", [writes, calls], [0, 0]);
    await reset(); changePolicy = true;
    is("policy change while awaiting reservation denies work", await reserveAiSupplierSpend(input, () => now), false);
    is("changed-policy reservation stays held", (await original.call(redis, [["GET", key]]))[0], "3");
    await reset(); let timeReads = 0;
    is("expiry during reservation denies work", await reserveAiSupplierSpend(input, () => timeReads++ === 0 ? now : policy.validUntil), false);
    is("expired request reservation stays held", (await original.call(redis, [["GET", key]]))[0], "3");
  } finally {
    redis.pipeline = original;
    if (saved === undefined) delete process.env.AI_SUPPLIER_SPEND_POLICY; else process.env.AI_SUPPLIER_SPEND_POLICY = saved;
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = savedKey;
  }
  done();
}
void main();
