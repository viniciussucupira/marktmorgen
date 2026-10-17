import { test } from "node:test";
import { strict as assert } from "node:assert";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AffiliateStudio } from "@/components/affiliate-studio";
import { parseAffiliateSetting } from "@/lib/affiliate-setting";
const row = {
  affiliate: {id:"legacy-affiliate",email:"affiliate@example.com",code:"reader",status:"approved",appliedAt:1,decidedAt:2,note:""},
  clicks:1,sales:1,earned:1000,paid:0,owed:1000,waiting:0,payable:1000,
};
function render(checked: boolean) {
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, {value: {} as never},
    createElement(AffiliateStudio, {
      handle:"example",setting:parseAffiliateSetting({enabled:true}),products:[],
      rows:[row] as never,lines:[],payouts:[],refundsChecked:true,today:"2026-10-17",
      pendingPayoutsChecked:checked,payPanel:createElement("span",null,"Provider controls"),
    })));
}
test("unknown pending exposure hides new-batch controls without hiding recovery export", () => {
  const html=render(false);
  assert.match(html,/Pending payments could not be checked/);
  assert.doesNotMatch(html,/Provider controls|Pay everyone at once|PayPal Payouts file|I have paid this batch/);
  assert.match(html,/Download everything/);
  assert.match(html,/affiliate@example.com/);
});
test("confirmed pending exposure restores existing batch controls", () => {
  const html=render(true);
  assert.doesNotMatch(html,/Pending payments could not be checked/);
  assert.match(html,/Provider controls/);
  assert.match(html,/Pay everyone at once/);
  assert.match(html,/PayPal Payouts file/);
});
