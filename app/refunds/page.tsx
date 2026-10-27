import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { REFUND_DAYS, TRIAL_DAYS } from "@/lib/plan";
import { PLANS_ON_SALE } from "@/lib/opening";

export const metadata: Metadata = {
  title: "Refund Policy — Marktmorgen",
  description:
    `Cancel anytime. Your first payment refunded in full on request within ${REFUND_DAYS} days; a yearly plan refunded for the months not yet started, less Stripe's card fee.`,
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="October 17, 2026">
      <p>
        This Refund Policy applies to what you pay Marktmorgen, a product of
        Solrenning, an independent software studio, for the creator store at
        marktmorgen.com: the monthly
        or yearly subscription, on any plan, at the price shown at
        checkout.
      </p>
      <p>
        It does not cover something you bought from a creator&apos;s store.
        That money went straight into that creator&apos;s own Stripe account
        and never passed through us, so the refund is theirs to give. Section 7
        says what to do.
      </p>

      <LegalSection id="cancel" title="1. Cancel anytime">
        <p>
          You may cancel your subscription at any time, for any reason, with no
          questions asked. After you cancel, you will not be charged for future
          billing periods. You will keep access until the end of the period you
          have already paid for, unless you also request a refund as described
          below.
        </p>
        <p>
          To cancel, open your studio and choose &ldquo;Cancel the
          subscription&rdquo; under &ldquo;What you pay us,&rdquo; then
          &ldquo;Yes, cancel it.&rdquo; You can also
          ask us by email, as described in section 4.
        </p>
      </LegalSection>

      <LegalSection id="guarantee" title={`2. ${REFUND_DAYS}-day money-back guarantee on your first payment`}>
        <p>
          If you request a refund within thirty ({REFUND_DAYS}) days of the
          first payment on your account, we will refund that payment in full.
          No reason is required and none will be asked for. The first payment
          is the first charge we make to you, on any plan, monthly or yearly,
          for any of your stores.
        </p>
        <p>
          This guarantee covers what happens once you have actually been
          charged, whether or not you qualified for a trial. An eligible first
          store can receive a {TRIAL_DAYS}-day trial when you choose a plan
          separately in your studio; returning and additional stores may not
          qualify. If a trial applies, cancelling before it ends prevents the
          first plan charge.
        </p>
        <p>
          A refund closes the paid features of the store it was for — your
          checkout, and on Pro the email sending — from the day it is made.
          Everything you built stays where it is, and your own Stripe account,
          its customers and its payout history are untouched: that money was
          never ours to return.
        </p>
        {!PLANS_ON_SALE ? (
          <p>
            Paid plans are not on sale yet. Preparing a store today does not
            start a paid plan or an active trial.
          </p>
        ) : null}
      </LegalSection>
      <LegalSection id="yearly" title="3. Yearly plans: the months you have not started">
        <p>
          A yearly plan can be refunded at any time, not only in its first{" "}
          {REFUND_DAYS} days. We keep the months that have started, each at
          the monthly price of that plan, and the card processing fee Stripe
          charged on the yearly payment, which Stripe does not give back to us
          when a payment is refunded; the rest of what you paid comes back.
          So a yearly plan refunded in its second month costs you two months at
          the monthly price and that fee, and the other ten months come back.
          Its paid features close from the day of the refund.
        </p>
        <p>
          If the yearly payment was your first payment to us and you ask within{" "}
          {REFUND_DAYS} days of it, section 2 applies instead and the whole
          payment comes back.
        </p>
      </LegalSection>
      <LegalSection title="4. How to request a cancellation or refund">
        <p>
          Email{" "}
          <a
            href="mailto:support@marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            support@marktmorgen.com
          </a>{" "}
          from the email address associated with your account. Please include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>the email on the account;</li>
          <li>whether you want to cancel, request a refund, or both; and</li>
          <li>the date of the charge, if you are requesting a refund.</li>
        </ul>
        <p>
          We will confirm by email once your cancellation, refund, or both
          have been processed. Refunds are returned to the original payment method and
          may take several business days to appear, depending on your bank or
          card issuer.
        </p>
      </LegalSection>

      <LegalSection title="5. Renewals and later charges">
        <p>
          A monthly renewal, a charge made when you switch plans and any
          charge after your first payment are not refunded, except where
          applicable consumer law requires it. You may cancel at any time to
          stop future charges and keep access until the end of the period you
          have already paid for. The months of a yearly plan that have not
          started are always refunded, as section 3 says.
        </p>
        <p>
          Why the guarantee is on the first payment: a refund gives back the
          whole month after it has been used, including what that month cost us
          to serve. We offer that once, so you can try the paid plan for real;
          offering it on every month would make every month free for anyone who
          asked, and the plans would have to cost everyone else more.
        </p>
      </LegalSection>
      <LegalSection id="store-assistant" title="5a. The Store assistant add-on">
        <p>
          The Store assistant is a subscription of its own, beside your plan.
          Its payments, the first one included, are not refunded, except where
          applicable consumer law requires it: the money-back guarantee above
          is for your plan&apos;s first payment. You can stop it at any time
          from your studio, and it stays on until the end of the month already
          paid. If your plan ends, it is set to stop at the end of the month
          already paid, and nothing more is charged for it.
        </p>
      </LegalSection>
      <LegalSection title="6. Chargebacks">
        <p>
          If you have a billing issue, please contact us first so we can help.
          Unwarranted chargebacks may result in account suspension.
        </p>
      </LegalSection>

      <LegalSection title="7. If you bought from a creator’s store">
        <p>
          Write to the creator you bought from: reply to the confirmation email
          the store sent you after you paid, and your reply reaches them. Their
          store is theirs: they
          set the terms of the sale, they received the money in their own
          Stripe account, and they are the only one who can return it.
        </p>
        <p>
          If you cannot reach them, write to us at{" "}
          <a
            href="mailto:support@marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            support@marktmorgen.com
          </a>{" "}
          with your order confirmation email. We cannot move money we never held, but we can
          pass your message to the creator and tell you what we did.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update this Refund Policy. The &ldquo;Last updated&rdquo; date at
          the top of this page will change when we do. The policy in effect at the
          time of a charge will apply to that charge.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Marktmorgen
          <br />
          Email:{" "}
          <a
            href="mailto:support@marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            support@marktmorgen.com
          </a>
          <br />
          Website:{" "}
          <a
            href="https://marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            marktmorgen.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
