/**
 * Real browser -> actual studio server -> real readSubscription -> persisted
 * Store. Only the external provider is a local stand-in: no app route is
 * intercepted, no payment/account/message is sent, and sales gates stay shut.
 */
export async function checkBillingStudioObservation({ browser, LOCAL, services, fixture, is }) {
  const [original] = await services.redis([["GET", fixture.key]]);
  if (typeof original !== "string") throw new Error("billing observation fixture not stored");
  const before = JSON.parse(original);
  const pauseKey = "nl:pause:" + (before.extra && /^[0-9a-f]{32}$/.test(before.sid) ? "#" + before.sid : before.email);
  const [originalPause] = await services.redis([["GET", pauseKey]]);
  if (originalPause !== null && typeof originalPause !== "string") throw new Error("unexpected synthetic pause fixture type");
  if (!before.subscriptionActive || !before.period) throw new Error("fixture lacks paid rights");
  const rights = (s) => [s.subscriptionId, s.stripeCustomerId, s.subscriptionActive, s.period, s.planEndedAt, s.tier, s.cycle];
  const id = "sub_StudioObservation01";
  const cases = [
    ["missing status", { id }],
    ["null status", { id, status: null }],
    ["unknown status", { id, status: "future_unknown" }],
    ["different canceled identity", { id: "sub_DifferentObservation01", status: "canceled" }],
  ];
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      await context.addCookies([{ name: "nl_session", value: fixture.session, url: LOCAL }]);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(String(error)));
      for (const [name, reply] of [...cases, ["identified cancellation", { id, status: "canceled" }]]) {
        await services.redis([["SET", fixture.key, original]]);
        await services.redis([["SET", pauseKey, "{synthetic-unreadable"]]);
        services.setStudioObservation(reply);
        const response = await page.goto(LOCAL + "/studio?store=" + fixture.sid, { waitUntil: "networkidle", timeout: 120_000 });
        is(width + " " + name + ": studio responds", response?.status(), 200);
        is(width + " " + name + ": actual provider read was made", services.studioObservationReads(), ["/v1/subscriptions/" + id]);
        const [raw] = await services.redis([["GET", fixture.key]]);
        const after = JSON.parse(raw);
        if (name === "identified cancellation") {
          is(width + " cancellation ends the stored plan", [after.subscriptionId, after.subscriptionActive, after.period, Number.isFinite(Date.parse(after.planEndedAt))], [id, false, null, true]);
          is(width + " canceled plan is not described as subscribed", (await page.locator("main").innerText()).includes("Subscribed at "), false);
        } else {
          is(width + " " + name + ": paid rights remain exact", rights(after), rights(before));
        }
        is(width + " " + name + ": unreadable pause is visibly unconfirmed", await page.locator("[data-pause-unconfirmed]").count(), 1);
        is(width + " " + name + ": no new pause offer on unknown evidence", await page.getByText("Take a break instead", {exact:true}).count(), 0);
        is(width + " " + name + ": no checkout form on unknown evidence", await page.locator('form[action^="/api/billing/checkout"]').count(), 0);
        is(width + " " + name + ": raw pause evidence stays unchanged", await services.redis([["GET", pauseKey]]), ["{synthetic-unreadable"]);
        is(width + " " + name + ": studio renders its main task", await page.locator("main").count(), 1);
      }
      await services.redis([["SET", fixture.key, original],["DEL",pauseKey]]);
      services.setStudioObservation({id});
      await page.goto(LOCAL + "/studio?store=" + fixture.sid,{waitUntil:"networkidle",timeout:120_000});
      is(width + ": absent pause still has no disabled offer",await page.getByText("Take a break instead",{exact:true}).count(),0);
      is(width + ": absent pause has no pause form",await page.locator('form[action^="/api/billing/pause"]').count(),0);
      is(width + ": ordinary cancellation remains rendered",await page.getByText("Cancel the subscription",{exact:true}).count(),1);
      is(width + ": browser has no page exception in these cases", errors, []);
    } finally {
      await context.close();
      await services.redis([["SET", fixture.key, original]]);
      if (originalPause === null) await services.redis([["DEL", pauseKey]]);
      else await services.redis([["SET", pauseKey, originalPause]]);
      services.setStudioObservation(null);
    }
  }
}
