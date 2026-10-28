/**
 * The phone number as a question at checkout (lib/checkout-fields.ts, added
 * 11 October 2026). What is checked:
 *
 *   - what the studio sends is read: a phone needs no label and is never
 *     optional, it is asked once at most, and the other questions keep every
 *     rule they had;
 *   - at checkout it is Stripe's own phone box, not a custom field, so the
 *     other questions keep their places in Stripe's list;
 *   - the number the buyer typed is read back with the other answers, for the
 *     sale and the booking email, and nothing is added when none was asked.
 */
import { MAX_CHECKOUT_FIELDS, PHONE_LABEL, applyCheckoutFields, parseFields, readAnswers, readFields } from "@/lib/checkout-fields";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  part("Read from the studio");
  const read = readFields([
    { label: "", type: "phone", optional: true },
    { label: "Name to print on it", type: "text", optional: true },
  ]);
  is("a phone needs no label and is never optional", Array.isArray(read) ? read.map((f) => [f.label, f.type, f.optional]) : read, [[PHONE_LABEL, "phone", false], ["Name to print on it", "text", true]]);
  is("asked once at most", readFields([{ type: "phone" }, { type: "phone" }]), { reason: "phone_twice", at: 1 });
  is("the other questions keep their rules", readFields([{ type: "phone" }, { label: "", type: "text" }]), { reason: "label", at: 1 });
  is("still three questions in all", readFields([{ type: "phone" }, { label: "A", type: "text" }, { label: "B", type: "text" }, { label: "C", type: "text" }]), { reason: "too_many" });
  is("what is stored is read safely too", parseFields([{ label: "x", type: "phone", optional: true }, { label: "y", type: "phone" }]).map((f) => [f.label, f.optional]), [[PHONE_LABEL, false]]);
  is("there is room for it among Stripe's three", MAX_CHECKOUT_FIELDS, 3);

  part("At checkout, Stripe's own phone box");
  const body = new URLSearchParams();
  applyCheckoutFields(body, [
    { label: "Size", type: "dropdown", optional: false, options: ["S", "M"] },
    { label: PHONE_LABEL, type: "phone", optional: false, options: [] },
    { label: "Name to print on it", type: "text", optional: true, options: [] },
  ]);
  is("the phone box is switched on", body.get("phone_number_collection[enabled]"), "true");
  is("and the other questions keep their places in Stripe's list", [body.get("custom_fields[0][label][custom]"), body.get("custom_fields[1][label][custom]"), body.has("custom_fields[2][key]")], ["Size", "Name to print on it", false]);
  const plain = new URLSearchParams();
  applyCheckoutFields(plain, [{ label: "Size", type: "dropdown", optional: false, options: ["S", "M"] }]);
  is("not asked when not chosen", plain.get("phone_number_collection[enabled]"), null);

  part("Read back with the answers");
  const answers = readAnswers({
    custom_fields: [{ label: { custom: "Size" }, type: "dropdown", dropdown: { value: "choice2", options: [{ label: "S", value: "choice1" }, { label: "M", value: "choice2" }] } }],
    customer_details: { email: "ana@example.com", phone: ("+" + "15125550142") },
  });
  is("the number with the other answers", answers, [{ label: "Size", value: "M" }, { label: "Phone", value: ("+" + "15125550142") }]);
  is("nothing added when none was asked", readAnswers({ custom_fields: [], customer_details: { email: "ana@example.com", phone: null } }), []);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
