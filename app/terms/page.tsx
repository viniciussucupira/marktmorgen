import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { isDomainsConfigured } from "@/lib/domains";
import { formatMoney } from "@/lib/money";
import { PRO_MONTHLY_EMAILS, REFUND_DAYS, SCALE_MONTHLY_EMAILS, TRIAL_MONTHLY_EMAILS, PLAN_TITLES } from "@/lib/plan";
import { healthRuleWords } from "@/lib/mail-health-rules";
import { DELIVERY_ALLOWANCE_BYTES, FREE_PAUSE_ABOVE_BYTES, bytesWords } from "@/lib/delivery";
import { VIDEO_CENTS_PER_HOUR_OVER, VIDEO_HOURS_INCLUDED, centsWords } from "@/lib/watch-rules";
import { SETUP_STORAGE_BYTES, SETUP_VIDEO_HOURS, TRIAL_STORAGE_BYTES } from "@/lib/plan-standing";
import { CLOSING_DAYS, WARN_MONTH_DAYS, WARN_WEEK_DAYS } from "@/lib/plan-closing-rules";
import { ROOM_IDLE_PARTS, ROOM_LIVE_PARTS, SETUP_VISITS, TRIAL_VISITS, VISITS_INCLUDED, VISIT_CENTS_PER_THOUSAND_OVER, countWords, partsWords } from "@/lib/traffic-rules";
import { ROOM_GRANT_MINUTES } from "@/lib/chat-pace";
import { STORAGE_BRAKE_BYTES, storageWords } from "@/lib/storage-quota";
import { INVITE_BONUS_CENTS, INVITE_HOLD_DAYS, INVITE_SHARE_PERCENT } from "@/lib/creator-invite-rules";

export const metadata: Metadata = {
  title: "Terms of Service — Marktmorgen",
  description:
    "Terms of Service for Marktmorgen: the creator store at marktmorgen.com, what a creator is responsible for when they sell through it, and how payment works.",
};

export default function TermsPage() {
  const domains = isDomainsConfigured();
  return (
    <LegalPage title="Terms of Service" lastUpdated="October 11, 2026">
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the
        websites, products, and subscription services operated by Solrenning
        under the name Marktmorgen (“Marktmorgen,” “we,” “us,” or “our”). They
        cover this website and the Marktmorgen creator store (collectively,
        the “Services”).
      </p>
      <p>
        Solrenning is an independent software studio. We sell software to
        customers worldwide. By creating an account, purchasing a subscription,
        or otherwise using the Services, you agree to these Terms. If you do
        not agree, do not use the Services.
      </p>

      <LegalSection title="1. Eligibility and accounts">
        <p>
          You must be at least 18 years old, or the age of majority in your
          jurisdiction if that is higher, to use the Services. By using the Services, you confirm
          that you meet this requirement.
        </p>
        <p>
          You are responsible for providing accurate account information and for
          keeping your email inbox and any passkeys you add secure, since they
          are how you sign in. You are also responsible
          for all activity that occurs under your account. Notify us promptly at{" "}
          <a
            href="mailto:support@marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            support@marktmorgen.com
          </a>{" "}
          if you believe your account has been compromised.
        </p>
        <p>
          <strong className="text-black">Several stores and a team.</strong>{" "}
          One account may run up to five stores. Each store is a subscription
          of its own; the free trial applies to an account&apos;s first store
          only. The owner of a store may invite up to five people to its team.
          Team members sign in with their own email address and act on the
          owner&apos;s behalf, within the role the owner gives them: what they
          do in the studio is done for the owner, and the owner remains
          responsible for the store and for what the team does in it under
          these Terms. Only the owner pays for the store, connects its Stripe
          account, manages its team and deletes it.
        </p>
        <p>
          We may suspend or terminate accounts that violate these Terms or that
          we reasonably believe pose a risk to the Services, other users, or
          our operations.
        </p>
      </LegalSection>

      <LegalSection title="2. The Services">
        <p>
          <strong className="text-black">The Marktmorgen creator store.</strong> A
          hosted store page where a creator sells digital files, courses,
          memberships and calls, and can run a community for their buyers and
          an affiliate program. The buyer pays into the creator&apos;s own connected Stripe
          account, and the file is delivered as soon as the payment clears.
          Marktmorgen takes 0% of a creator&apos;s sales; what we charge a
          creator is a subscription for the store itself.
        </p>
        <p>
          Creator stores are open. Taking a store address, building the page and
          connecting a Stripe account are free. Taking a card on that page
          requires a paid subscription, which, on an account&apos;s first
          store, begins with a free trial of 14 days, and which renews every month or every year, whichever you chose,
          at the price shown on the home page until it is canceled. The price
          and the payment provider are shown before any card is asked for, and
          these Terms apply to that subscription. We email you at least seven
          days before the first charge after the trial, and, on a yearly
          subscription, between 15 and 45 days before each renewal, with the
          date, the amount and how to cancel.
        </p>
        <p>
          We may update, improve, or discontinue features. When practical, we
          will provide reasonable notice of material changes. Except for a
          creator store used as described in section 3, the Services are
          provided for your personal or internal business use. You may not
          resell, sublicense, or offer the Services to third parties as your
          own product without our prior written permission.
        </p>
      </LegalSection>

      <LegalSection title="3. Selling through a Marktmorgen store">
        <p>
          This section applies if you use Marktmorgen to sell to your own buyers.
        </p>
        <p>
          <strong className="text-black">You are the seller.</strong> Each sale
          made through your store is a contract between you and your buyer.
          Marktmorgen is not a party to it, is not the merchant of record for
          it, and does not sell your products to anyone.
        </p>
        <p>
          <strong className="text-black">The money is never ours.</strong>{" "}
          Payments are made into your own Stripe account through Stripe direct
          charges. We never hold, route, or take a cut of your sales revenue.
          Payouts follow the schedule and settings of your own Stripe account,
          and your relationship with Stripe is governed by your agreement with
          Stripe, not by these Terms.
        </p>
        <p>
          <strong className="text-black">What you are responsible for.</strong>{" "}
          The product you sell and its description and price; having the rights
          to everything you upload and sell; answering your own buyers;
          refunds, disputes, and chargebacks on your own sales; and any tax you
          owe on your sales, including sales tax, VAT, or GST where it applies
          to you. If you run an affiliate program, paying your affiliates what
          you agreed is yours too: we keep the record, and we never hold or
          pay out that money. If you run a community, what is posted in it is
          yours to moderate, and the rules in section 4 apply to it.
        </p>
        <p>
          <strong className="text-black">Reviews.</strong> Reviews on your
          store come only from buyers whose payment your Stripe account
          confirms. You may answer a review and hide one. You may not offer
          anything in return for a review, or present as a review anything a
          buyer did not write. A hidden review still counts
          in your average, and your page says how many are hidden.
        </p>
        <p>
          <strong className="text-black">Services you choose to connect.</strong>{" "}
          If you connect an email platform (Mailchimp, Kit, beehiiv or
          MailerLite), your Google Calendar or, once it is offered, your Zoom
          account, or choose Jitsi Meet rooms or your own meeting link for
          your calls and live events, that is your choice. Those services are run by third parties under their own
          terms and privacy policies, your account with them is yours, and we
          are not responsible for what they do or for their availability.
          Send to an email platform only people who agreed to hear from you;
          the Services send only those who did. A meeting made on your Google
          or Zoom account is yours: it stays there if you disconnect, and
          what that service does with it is between you and them.
        </p>
        <p>
          <strong className="text-black">
            Ad pixels, and purchases sent to ad platforms.
          </strong>{" "}
          When you add a Meta, Google, TikTok or Pinterest pixel to your store,
          or give us an access token so that purchases are also sent to Meta or
          TikTok from our server, you are instructing us to send that data to
          that platform on your behalf, and you are responsible for doing so
          lawfully. That means telling your visitors and buyers about it in your
          own privacy notice, giving any notice or opt-out link the law where
          you or they are requires, and following that platform&apos;s own
          terms for its business tools, which you accept with that platform.
          The Services do their part: where the law asks for consent first
          (the European Economic Area, the United Kingdom, Switzerland and
          Brazil, and any country we cannot tell) nothing is sent unless the
          visitor agrees; a browser that sends Global Privacy Control is never
          sent; a link at the foot of your pages changes the choice; and an
          email address is sent only hashed. Do not use these tools for a
          store aimed at children, or to send anything that reveals a
          person&apos;s health, beliefs or other sensitive matters. We may
          switch them off for a store that misuses them.
        </p>
        <p>
          <strong className="text-black">
            Your buyers&apos; addresses for ad audiences.
          </strong>{" "}
          The file of buyers for ad audiences holds the addresses of buyers who
          agreed to hear from you and have not left your list. Uploading it to
          an ad platform is your decision and yours to answer for: do it only
          where your buyers&apos; permission and your own privacy notice cover
          that use, which in some places means having asked for it in so many
          words, and follow that platform&apos;s terms for customer lists. We
          do not send the file anywhere ourselves.
        </p>
        <p>
          <strong className="text-black">Slack and Discord.</strong> When you
          give us a Slack or Discord webhook address, you ask us to post your
          store&apos;s weekly and monthly numbers there. Anyone who can read
          that channel reads them, so choose it as you would choose who gets
          the email; what that service does with them is between you and it.
        </p>
        <p>
          <strong className="text-black">Questions your store asks.</strong>{" "}
          If you leave on the question after paying (&ldquo;where did you hear
          about us?&rdquo;), or turn on the question on your sales pages
          (&ldquo;is anything stopping you from buying?&rdquo;), the answers are
          counted for your numbers and kept with nothing that identifies the
          person who gave them. Use them to improve your store, not to contact
          or single out anyone.
        </p>
        <p>
          <strong className="text-black">
            Bringing a store from another platform.
          </strong>{" "}
          When you import contacts, you confirm, and are responsible for it
          being true, that every person in the file agreed to receive your
          emails, and that you may lawfully give us their details. When you
          import past buyers, you confirm that each person bought what the
          file says from you, that you have the right to give it to them
          here, and, if you ask us to email them, that you may tell them so.
          We check the file&apos;s format, not the truth of it, and we may
          switch off imports or email for a store that misuses them.
        </p>
        <p>
          <strong className="text-black">What you may not sell.</strong>{" "}
          Anything unlawful; anything that infringes someone else&apos;s rights;
          sexual content; anything that misleads your buyer about what they are
          paying for; and anything that falls under the list of restricted
          businesses published by Stripe, since your payments run through
          Stripe.
        </p>
        <p>
          We may remove a product or suspend a store that breaks this section.
          Doing so does not affect the money already in your own Stripe
          account.
        </p>
        <p>
          The same goes for the links on your page and anything played on it:
          link to, and play, only videos, music and podcasts that are yours or
          that their owner published on that service. When someone tells us
          that content on your store infringes their copyright or is illegal,
          we follow our{" "}
          <Link href="/copyright" className="text-black underline underline-offset-2 hover:no-underline">
            Copyright and Takedown Policy
          </Link>
          : we may take the content down, we tell you and how to answer, and we
          switch off the pages and sales of a store that is the subject of
          repeated valid notices. Your buyers keep what they already bought.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            use the Services for unlawful, harmful, fraudulent, or abusive
            purposes;
          </li>
          <li>
            attempt to reverse engineer, disrupt, overload, or interfere with
            the Services;
          </li>
          <li>
            submit content that infringes another person’s rights or that
            contains malware;
          </li>
          <li>
            circumvent usage limits, payment requirements, or security
            measures; or
          </li>
          <li>
            upload or sell anything you do not have the right to distribute.
          </li>
        </ul>
        <p>
          If you email your list through the Services, you also agree to write
          only to people who agreed to hear from you; never to import an
          address that was bought, rented, borrowed or collected without that
          agreement; to give a true postal address where you can be reached,
          which we print at the bottom of each email; to write subject lines that
          are not misleading; and to follow the laws on commercial email that
          apply to you and to your readers, including the CAN-SPAM Act in the
          United States. Every email carries an unsubscribe link that we honor
          permanently, and you may not ask anyone to do more than click it. An
          address that cannot be delivered to, or whose owner reports an email
          as spam, is taken off your list automatically and is not written to
          again. {healthRuleWords()}
        </p>
        <p>
          If you use Outreach to write to a business, you are the sender of
          that email: it leaves from your own mailbox, under your own name. You
          agree to send it only to the business address the studio found for
          it, with the closing lines the studio adds left as they are; to send
          what you have read and stand behind, with nothing in it that is
          untrue; never to use it to write to a private person, or to a list;
          to stop writing to a business the moment it asks, and to record it
          in your studio; and to follow your mail provider&apos;s rules and the
          laws on commercial email that apply to you and to the business you
          write to. The studio refuses what it can tell is not allowed, but it
          is not legal advice, and what you send is yours to answer for.
        </p>
        <p>
          We may investigate suspected violations and take action, including
          pausing a send, switching off email for a store, or suspending or
          terminating your account.
        </p>
      </LegalSection>

      <LegalSection id="fair-use" title="5. What the subscription covers">
        <p>
          The published limits are the ones in your studio and on our pricing
          page: the number of products a store may list, the size of a single
          file, how many emails a month a plan may send,{" "}
          {bytesWords(DELIVERY_ALLOWANCE_BYTES)} of downloads a month per
          store, {VIDEO_HOURS_INCLUDED} hours of lesson video watched a
          month per store, and the visits to your store a month that your
          plan covers. You can see every one of them while you use the
          Services.
          None of them is hidden in this document and then discovered by being
          enforced against you.
        </p>
        <p>
          We do not stop a download because a store has passed that figure.
          Somebody paid you for that file, and cutting your buyer off to
          protect our costs would be taking money for a sale and then not
          completing it. A paid download is never refused, at any number.
        </p>
        <p>
          Nothing is charged for downloads, inside that figure or past it.
        </p>
        <p>
          Two things here are billed by use: lesson video, and visits to
          your store. Each is covered up to a published figure and charged
          past it, rather than limited, so that nobody you sold to is cut off
          and your store is never taken down for being busy.
        </p>
        <p>
          Lesson video is
          measured by the time your students spend watching your lesson
          videos, as the video player counts it, added up across your store
          for each calendar month and read about once an hour. Your plan
          covers {VIDEO_HOURS_INCLUDED} hours a month. Past that, video is
          charged rather than limited: {centsWords(VIDEO_CENTS_PER_HOUR_OVER)}{" "}
          for each hour watched above {VIDEO_HOURS_INCLUDED} in a calendar
          month, counted to the second and rounded down to the cent, added to
          your next subscription invoice on the card you already pay with. On
          a plan paid by the year, those lines are invoiced monthly. A student
          is never cut off because a store has passed its hours.
        </p>
        <p>
          You are emailed automatically the first time a month&apos;s
          watching passes the hours your plan covers, with your own figure in
          it, and the same figure is in your studio at any time. A month in
          which you stay inside them costs nothing beyond your plan.
        </p>
        <p>
          A store with no paid plan has nothing a charge can be added to, so
          its lesson videos are paused past its hours until the plan is paid
          or the month turns: {VIDEO_HOURS_INCLUDED} hours a month in the
          free trial, and {SETUP_VIDEO_HOURS} hours a month before a plan is
          started and after one has ended. Nothing is charged for those
          hours, and everything else in a course stays open.
        </p>
        <p>
          A visit is one person opening your store on one day, however many
          of its pages they look at. People are told apart by the network
          address they come from, and by nothing kept in their browser. You
          are never counted when you are signed in, and neither is a robot
          that says it is one. Your plan covers a number of visits in each
          calendar month: {countWords(VISITS_INCLUDED.creator)} on{" "}
          {PLAN_TITLES.creator}, {countWords(VISITS_INCLUDED.pro)} on{" "}
          {PLAN_TITLES.pro}, and {countWords(VISITS_INCLUDED.scale)} on{" "}
          {PLAN_TITLES.scale}. Past that, visits are charged rather than
          limited: {centsWords(VISIT_CENTS_PER_THOUSAND_OVER)} for each
          thousand visits above your plan&apos;s figure in a calendar month,
          counted to the visit and rounded down to the cent, added to your
          next subscription invoice the same way video is. A store that pays
          is never taken down because it has passed its visits, and you are
          emailed automatically the first time a month passes them, with your
          own figure in it.
        </p>
        <p>
          A buyer who comes back is a visit like anybody else: a student or
          a member who opens a course or your community on a day is that
          day&apos;s visit, once. Two things a buyer&apos;s device does by
          itself are counted for what they cost. A subscriber to a private
          podcast is one visit on each day their podcast app checks for
          episodes, however often it checks. And your community&apos;s live
          room, which checks for new messages for as long as it is open in
          front of a member, counts for each member by the{" "}
          {ROOM_GRANT_MINUTES} minutes it is open: {partsWords(ROOM_LIVE_PARTS)}{" "}
          visits while people are talking, when it checks every few seconds,
          and {partsWords(ROOM_IDLE_PARTS)} of a visit while the room is
          quiet. A room in a background tab, or one nobody has touched for a
          while, checks nothing and counts nothing, and you are never
          counted in your own room.
        </p>
        <p>
          A store with no paid plan has nothing a charge can be added to, so
          its public pages rest past its visits until the plan is paid or the
          month turns: {countWords(TRIAL_VISITS)} visits a month in the free
          trial, and {countWords(SETUP_VISITS)} a month before a plan is
          started and after one has ended. A visitor to a resting store is
          told the page will be open again soon. Nothing is charged for those
          visits, and what a buyer already has is never part of the rest:
          orders, downloads, lessons, podcasts and memberships stay open. The
          live room of such a store stops checking by itself and shows new
          messages when a member asks for them.
        </p>
        <p>
          What we ask in return is that the Services are used to sell your own
          work to your own audience, and not as general file hosting, a
          content delivery network, a backup service, or a way to distribute
          very large files at a scale the subscription does not cover.
        </p>
        <p>
          If your store passes the download allowance in a month, our system
          emails you the next morning with your own figure in it. That notice
          is automatic: it does not wait for anybody here to notice, and it
          reaches you whether or not we are looking. Your studio shows the
          same number at any time.
        </p>
        <p>
          Two things happen on their own, and neither touches a buyer. Free
          copies — files given away rather than bought — pause for the rest
          of the month once a store has sent out{" "}
          {bytesWords(FREE_PAUSE_ABOVE_BYTES)} in that month, and resume when
          the month turns; anything anyone has bought is unaffected. And new
          uploads stop once a store holds as much as it may:{" "}
          {storageWords(STORAGE_BRAKE_BYTES)} on a paid plan, which is far
          more than a storefront needs,{" "}
          {storageWords(TRIAL_STORAGE_BYTES)} in a plan&apos;s free trial, and{" "}
          {storageWords(SETUP_STORAGE_BYTES)} for a store with no plan, before
          one is started or after one has ended. That asks you to remove
          something before adding more and changes nothing about what is
          already there or already sold. A store that holds more than its
          figure when its plan ends cannot add to it, and section 8 says how
          long it keeps what it holds.
        </p>
        <p>
          Beyond those, we may limit or suspend a store only if use far above
          the published allowances continues after that notice has been sent
          and you have had a reasonable time to answer, or where the use is
          plainly abusive or unlawful. We will not do it silently, and never
          in the middle of delivering something a buyer has already paid for.
        </p>
      </LegalSection>

      <LegalSection title="6. Subscriptions and payment">
        <p>
          A creator store subscription is charged at the price shown at
          checkout, and these Terms apply to it. The sales a
          creator makes are not ours: they run through that creator&apos;s own
          Stripe account, as described in section 3.
        </p>
        <p>
          Payment is processed by Stripe, our payment provider. We do not
          store full payment card numbers. Prices are in United States dollars
          unless otherwise stated. You are responsible for any applicable
          taxes.
        </p>
        <p>
          We may change subscription prices. If we do, we will provide notice
          before the new price applies to a future billing period. The new
          price will not apply to a period you have already paid for.
        </p>
        <p>
          There are three plans. Marktmorgen, at $29 a month or $300 a year,
          includes everything you need to sell. Marktmorgen Pro, at $99 a month or $948
          a year, adds email to your list{domains ? " and your store on a domain you own" : ""},
          with up to {PRO_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month,
          counted together for one-off emails, sequences, community
          announcements and the emails that ask buyers for a review; during
          the free
          trial a store may send up to {TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month, and the full
          number opens with the first payment. Emails not sent in a month do
          not carry over, and emails beyond a month&apos;s allowance wait for
          the next month. Marktmorgen Scale, at $249 a month or $2,388 a year,
          is Marktmorgen Pro with up to{" "}
          {SCALE_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month, counted
          the same way.
        </p>
        {domains ? (
          <p>
            A domain you add stays yours: you keep it where you bought it and
            keep its settings. While your store is on Pro it opens your store;
            when Pro ends, its visitors are sent to your marktmorgen.com
            address, and you can take the domain off at any time.
          </p>
        ) : null}
        <p>
          You may switch between monthly and yearly billing, and between the
          plans, from your studio.
          A switch that costs more is charged when you make it, less the unused
          part of the period you already paid for. A switch that costs less
          leaves the unused part as credit on your account, applied to your
          next charges until it is used up. Credit is not paid out in cash,
          except where a refund applies under our Refund Policy.
        </p>
      </LegalSection>

      <LegalSection title="7. Creator invites" id="invites">
        <p>
          Your studio gives you a link to invite other creators. When someone
          accepts your invite and then makes the first store of a new
          account, that store counts as invited by you. It does not count if
          the account belongs to you, if it had paid us before it was invited,
          or if another invite was accepted for it first.
        </p>
        <p>
          For every payment an invited account makes to us for its stores,
          we add {INVITE_SHARE_PERCENT}% of the amount actually paid, less any
          refund or credit given back on it, as credit on your account,{" "}
          {INVITE_HOLD_DAYS} days after the payment. After its first payment,
          the invited account gets {formatMoney(INVITE_BONUS_CENTS, "usd")} of
          credit on its own account, at the same time. Credit is applied by
          our payment provider to your next charges until it is used up. It is
          not paid out in cash, cannot be transferred, and is not refunded if
          you cancel.
        </p>
        <p>
          We may withhold or reverse credit earned through abuse, such as
          invites to accounts you control, and we may change or end this
          program for payments made after we give notice; credit already added
          stays yours.
        </p>
      </LegalSection>

      <LegalSection title="8. Cancellation">
        <p>
          You may cancel your subscription at any time, for any reason. After
          you cancel, you will not be charged for future billing periods. You
          will retain access until the end of the period you have already paid
          for, unless a refund applies under our Refund Policy.
        </p>
        <p>
          When a plan ends, the store stays: its page, its products and their
          prices, its lessons&rsquo; text and quizzes, its contacts and its
          orders are kept, and buyers go on downloading what they bought. A
          store that keeps {storageWords(SETUP_STORAGE_BYTES)} or less of
          files and lesson videos, the room a store with no plan has (section
          5), is not affected in any other way.
        </p>
        <p>
          A store that keeps more than that when its plan ends has a date.{" "}
          {CLOSING_DAYS} days after the plan ended, what the store keeps is
          removed: the files its products hand over, its lessons&rsquo; videos and downloads, and its
          podcast&rsquo;s episodes. From that day, buyers can no longer download those files or watch those videos,
          so a creator who has sold them should start a plan again or give
          buyers another way to what they bought before then. We email the
          store&rsquo;s owner when the plan ends, {WARN_MONTH_DAYS} days before that day and {WARN_WEEK_DAYS} days before it,
          each time with the date, and what a store keeps is never removed sooner than a week after the last of those emails.
          Starting a plan again, or deleting enough for the store to keep{" "}
          {storageWords(SETUP_STORAGE_BYTES)} or less, before that day stops
          it. Nothing else is removed, and a file can be put back on a product
          and a video on a lesson once a plan is started again.
        </p>
      </LegalSection>

      <LegalSection title="9. Refunds">
        <p>
          Refunds of what you pay <em>us</em> are governed by our{" "}
          <Link
            href="/refunds"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            Refund Policy
          </Link>
          . In summary, every charge is refunded in full on request within
          {REFUND_DAYS} days of that charge, for any reason or none.
        </p>
        <p>
          A refund on something you bought from a creator&apos;s store is a
          matter between you and that creator, who received your money in their
          own Stripe account and sets their own refund terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          Marktmorgen and its licensors own all rights in the Services,
          including the software, branding, design, and documentation. These
          Terms do not grant you any right to use our name, logos, or
          trademarks except as needed to identify the Services.
        </p>
        <p>
          You retain ownership of what you submit to the Services (“User
          Content”) — the files, images, text and descriptions you upload to
          your store. You grant Marktmorgen a limited license to host, store
          and deliver User Content solely to provide the Services: to show your
          store page to the people you send there, and to hand a file to the
          buyer who paid you for it. We do not use your files or your store&apos;s
          text to train anything, and we do not sell or license them to anyone.
        </p>
        <p>
          That license lasts as long as you keep the content on Marktmorgen. When you
          remove a product or close your store, it ends for the content removed.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimer of warranties">
        <p>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT. We do not warrant that the Services will be
          uninterrupted, secure, or error-free.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MARKTMORGEN AND
          ITS OWNERS, OFFICERS, AND CONTRACTORS WILL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
          SERVICES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE
          SERVICES WILL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE THREE (3)
          MONTHS BEFORE THE CLAIM AROSE, OR US$50, WHICHEVER IS GREATER. Money
          a buyer paid into a creator&apos;s own Stripe account was never paid
          to us and is not part of that amount.
        </p>
        <p>
          Some jurisdictions do not allow certain limitations. In those cases,
          our liability is limited to the maximum extent permitted by law.
          Nothing in these Terms limits liability that cannot be limited under
          applicable mandatory law, including liability for fraud or willful
          misconduct.
        </p>
      </LegalSection>

      <LegalSection title="13. Indemnification">
        <p>
          You agree to indemnify and hold Marktmorgen harmless from claims
          arising out of your User Content, the products you sell through a
          Marktmorgen store, your use of the Services, or your violation of these
          Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="14. Termination">
        <p>
          We may suspend or terminate your access if you breach these Terms, if
          required by law, or if we discontinue the Services. Upon termination,
          your right to use the Services ends. Sections that by their nature
          should survive — including intellectual property, disclaimers,
          limitation of liability, and governing law — will survive.
        </p>
        <p>
          Before we suspend or close a store, we email its owner the reason
          and give them a chance to answer, unless the law, or an urgent risk
          to buyers, other users or the Services, requires us to act at once;
          in that case we email the reason as soon as we can. If we discontinue
          the Services, we give at least 30 days&apos; notice by email.
        </p>
      </LegalSection>

      <LegalSection title="15. Changes to these Terms">
        <p>
          We may update these Terms from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page will change when we do. Material changes
          will be posted on this page. Continued use of the Services after
          changes take effect constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="16. Governing law">
        <p>
          These Terms are governed by the laws of the Federative Republic of
          Brazil, without regard to conflict-of-law rules. Courts located in
          Brazil will have exclusive jurisdiction, except that you may have
          additional mandatory consumer rights in your country of residence.
        </p>
      </LegalSection>

      <LegalSection title="17. Contact">
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
