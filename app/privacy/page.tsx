import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { isSesConfigured } from "@/lib/ses";
import { isStreamConfigured } from "@/lib/stream";
import { isVaultConfigured } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Privacy Policy — Marktmorgen",
  description:
    "How Marktmorgen collects, uses, and protects personal information — including the data of buyers in a creator's store, and your GDPR rights.",
};

export default function PrivacyPage() {
  // Named from the day its settings are there, which is the day email can
  // first go through it (lib/email.ts), and not before.
  const amazon = isSesConfigured();
  // Named only while lesson videos are kept there (lib/stream.ts).
  const bunny = isStreamConfigured();
  // Named only while the files creators sell are kept there (lib/vault.ts).
  const cloudflare = isVaultConfigured();
  return (
    <LegalPage title="Privacy Policy" lastUpdated="October 13, 2026">
      <p>
        Marktmorgen (“Marktmorgen,” “we,” “us,” or “our”) is operated by
        Solrenning, an independent software studio. This Privacy Policy
        explains how we collect, use,
        share, and protect personal information when you use our websites and
        products — the Marktmorgen creator store at marktmorgen.com (the
        “Services”).
      </p>
      <p>
        If you have questions about this policy or about your personal data,
        contact us at{" "}
        <a
          href="mailto:support@marktmorgen.com"
          className="text-black underline underline-offset-2 hover:no-underline"
        >
          support@marktmorgen.com
        </a>
        .
      </p>

      <LegalSection title="1. Information we collect">
        <p>We collect the following categories of information:</p>
        <p>
          <strong className="text-black">Account information.</strong> When you
          create an account or subscribe, we collect your email address and any
          other information you choose to provide (such as your name, if
          requested at checkout).
        </p>
        <p>
          <strong className="text-black">Payment information.</strong> Payments
          are processed by Stripe, our payment processor. We do not store your
          full credit or debit card number, CVC, or equivalent payment
          credentials. Stripe may collect billing name, address, and
          payment method details as needed to complete the transaction. We may
          receive limited payment metadata, such as the last four digits of a
          card, payment status, and subscription period.
        </p>
        <p>
          <strong className="text-black">What a creator puts in a store.</strong>{" "}
          If you run a Marktmorgen store, we host what you put in it: your store
          name and description, your photo if you add one, the theme and color
          you choose, your product titles, prices and descriptions, the links
          you put on the page, and the files you upload for delivery to your
          buyers. Your photo is shrunk on your own device before it is sent, is
          shown publicly on your store page and in previews of links to it, and
          is deleted from our storage when you remove or replace it.
        </p>
        <p>
          <strong className="text-black">Buyer information.</strong> When
          someone buys from a creator&apos;s store, we handle the buyer&apos;s
          email address and the details of that order — what was bought, when,
          for how much, and whether the file was delivered — so the sale can be
          completed and the creator can see it. The card details are handled by
          Stripe and never reach us. That buyer information belongs to the
          creator, not to us, and section 4 explains what that means.
        </p>
        <p>
          <strong className="text-black">A confirmation of each purchase.</strong>{" "}
          After a buyer pays, we email them one confirmation on the
          creator&apos;s behalf, under the store&apos;s name, with what they
          bought and how to get back to it; replies go to the creator. What it
          says is read from the payment on the creator&apos;s Stripe account.
          We keep only a mark that it was sent, tied to that checkout, for 40
          days, so it is never sent twice. If a creator asks buyers questions
          at checkout, or asks for a phone number in Stripe&apos;s own phone
          box, the answers are kept with the payment on the creator&apos;s own
          Stripe account, shown to the creator, and for a booked call included
          in the creator&apos;s booking email. For a physical product the
          creator ships, the address you type on Stripe&apos;s page is kept
          the same way and shown to the creator so they can send it; we keep
          only when they marked it as shipped and the tracking link they
          gave, for 400 days, to email you once that it is on its way.
        </p>
        <p>
          <strong className="text-black">An update to something you bought.</strong>{" "}
          A creator on Pro can tell the buyers of one of their products, at
          most once a week, that it was updated and where to get the new
          version. The addresses are read from the creator&apos;s own Stripe
          account when they press send, kept with us only until the email has
          gone out, and not shown to the creator or added to any list. Nobody
          who left that creator&apos;s list is written to. Each email has a
          link that stops these emails from that store; it is kept, tied to
          the address and the store, for 400 days, and pressing it keeps a
          one-way hash of the address for that store for good.
        </p>
        <p>
          <strong className="text-black">A reminder after an unpaid checkout.</strong>{" "}
          Only on stores whose creator switched it on, and only for a buyer who
          agreed on Stripe&apos;s own checkout page to hear from that creator,
          or who, on the page the way back from that checkout leads to, typed
          their address and asked for the reminder themselves: if they leave
          without paying, we email them once, on the creator&apos;s behalf,
          with a link back to the product. For the first, Stripe keeps the
          address and the answer on the creator&apos;s account. For the
          second, the address waits with us for about an hour, until the
          reminder is sent or dropped; it is not shown to the creator and is
          not added to any list. We keep a
          mark that the reminder for that checkout was handled, for two weeks;
          a one-way hash of the address and the product for a week, so nobody
          gets two reminders about the same thing; and the link in the reminder
          that stops them, tied to the address and the store, for 400 days.
          Pressing it keeps a one-way hash of the address for that store for
          good, so that store never sends them a reminder again.
        </p>
        <p>
          <strong className="text-black">A come-back offer.</strong> Only on
          stores whose creator switched it on, and only to somebody who agreed
          to hear from that creator and has not left their list: some days
          after a membership ends, we read from the creator&apos;s Stripe
          account when it ended, which product it was and the address it was
          paid from, and email that address once, on the creator&apos;s behalf,
          with a discount to come back. We keep a mark that the email for that
          membership was handled, for 90 days; a one-way hash of the address
          and the product for 180 days, so nobody gets two such emails about
          the same thing; and the link in the email, tied to the address, the
          product and the offer, for 14 days. It carries the creator&apos;s
          list&apos;s own one-click unsubscribe.
        </p>
        <p>
          <strong className="text-black">Managing a membership.</strong> When
          a member asks for a link to manage or cancel their membership, we use
          the email address they type to look for their membership on the
          creator&apos;s own Stripe account and, if there is one, to email them
          the link. We keep a record that ties that link to their Stripe
          customer for one hour and, to limit abuse, one-way hashes of the
          address and of the network address that asked, also for one hour,
          and nothing else; the page says the same thing whether or not a
          membership was found. When a member switches their membership to
          another of the store&apos;s plans, the change is made on the
          creator&apos;s Stripe account, which keeps the record of it, and we
          email the member a receipt and the creator a note with the
          member&apos;s email address and the two plans. We keep nothing more
          about it.
        </p>
        <p>
          <strong className="text-black">Getting a purchase again.</strong>{" "}
          When a buyer asks a store for what they bought, we use the email
          address they type to look for their paid purchases on the
          creator&apos;s own Stripe account and, if there are any, to email them
          a link to a page that lists them. We keep a record that ties that link
          to the address for 24 hours and, to limit abuse, one-way hashes of
          the address and of the network address that asked, for one hour, and
          nothing else; the list itself is read
          from Stripe each time the page opens, and the page says the same thing
          whether or not a purchase was found.
        </p>
        <p>
          <strong className="text-black">Counting visits to a store.</strong>{" "}
          When a creator&apos;s store page is opened, the page tells us so,
          with the site that sent the visitor or the campaign word in the link.
          To count people rather than page loads we make a one-way fingerprint
          of the day, the store, the visitor&apos;s network address and browser,
          and add it to a counter that keeps only an estimate of how many
          different fingerprints it has seen. The fingerprint and the address
          are not stored, no cookie is set, and the daily counts are kept for
          about thirteen months, with a running all-time total of the same
          counts for as long as the store exists. The creator sees totals,
          never a person.
        </p>
        <p>
          So a creator can see how many people are on their store page right
          now, the first ten characters of that day&apos;s fingerprint are kept
          for up to half an hour, beside the site the visitor came from, and
          then deleted; they cannot be turned back into an address, and the
          creator sees only a count.
        </p>
        <p>
          A creator&apos;s plan covers a number of visits a month, so visits
          are also counted for that, on any page of a store that is opened:
          one for each visitor each day. For this we make a second one-way
          fingerprint, of the day, the store and the visitor&apos;s network
          address (for the newer kind of address, the network it belongs to),
          made with a secret key of our own, and keep its first sixteen
          characters in a list for that store and that day, so that the same
          visitor is not counted twice. The list cannot be turned back into
          addresses, holds nothing else, and is deleted two days later; what
          remains is the store&apos;s count for the month. The address itself
          is not stored, and no cookie is set.
        </p>
        <p>
          <strong className="text-black">Funnels of pages.</strong>{" "}
          When a creator puts pages in order as a funnel, each step that is
          opened tells us so, and so does a sign-up or a payment made on a
          step. To count each person once a step we make a one-way fingerprint
          of the funnel, the store, the visitor&apos;s network address and
          browser, and add it to a counter that keeps only an estimate of how
          many different fingerprints it has seen. The fingerprint and the
          address are not stored, and no cookie is set. The counts begin
          again whenever the funnel&apos;s steps change, and each is deleted
          400 days after the last person counted in it. The creator sees
          totals, never a person.
        </p>
        <p>
          <strong className="text-black">A store&apos;s own people are not counted.</strong>{" "}
          Visits by the store&apos;s owner or a member of its team while signed
          in are left out of its counts. A creator can also mark a browser they
          use, signed in or not, so its visits are left out: that browser keeps
          a cookie named <code>nl_nc</code> for 400 days, holding for each store
          marked only twelve characters of a one-way hash of the store, and
          nothing about the person.
        </p>
        <p>
          <strong className="text-black">Google searches that found a store.</strong>{" "}
          For stores at marktmorgen.com, we read from Google Search Console,
          for our own site, which searches showed each store&apos;s pages, how
          many times, how often they were clicked and where the store stood,
          and show these totals to that store&apos;s creator. They are
          Google&apos;s figures about searches, added up by Google and with rare
          searches left out by it; they say nothing about who searched, and
          nothing about a store&apos;s visitors is sent to Google for them. We
          keep each store&apos;s latest reading for a day, and the access to
          our Search Console sealed.
        </p>
        <p id="ads">
          <strong className="text-black">
            Ad measurement a creator switches on.
          </strong>{" "}
          A creator can add their own Meta, Google, TikTok or Pinterest pixel to
          their store. When they do, and only once it is allowed, that
          store&apos;s pages load that platform&apos;s script, which sets its own cookies and tells
          the platform about page views, checkouts started, requests for free
          products and purchases with their amount, on the creator&apos;s behalf
          and under that platform&apos;s own privacy policy. Visitors in the
          European Economic Area, the United Kingdom, Switzerland or Brazil,
          or whose country we cannot tell, are asked first and nothing loads
          unless they agree; everywhere else the
          pixels load unless the browser sends Global Privacy Control. The
          choice is kept on the visitor&apos;s device for that store, and a link
          at the bottom of its pages changes it. While ad measurement is
          allowed, that store also keeps a cookie of its own saying so, with the
          ad click id the visitor last arrived with (Meta&apos;s fbclid,
          TikTok&apos;s ttclid or Pinterest&apos;s epik), for 30 days; it is
          deleted the moment the choice is no.
        </p>
        <p id="ads-server">
          <strong className="text-black">
            Conversions sent from our server, when a creator sets it up.
          </strong>{" "}
          A creator who has a Meta, TikTok, Google Analytics or Pinterest pixel
          can also give us an access token from their own account with that
          platform. Then, for a visitor who allowed ad measurement on that
          store, as above, we send the platform from our server: each purchase
          once Stripe confirms the payment, each later payment of a membership
          bought that way, and each sign-up for something free, a waitlist or
          the creator&apos;s list (sign-ups are not sent to Google). With each
          we send its id, time, amount, currency and products, whether the
          buyer had paid that creator before, the page, the email address
          hashed with SHA-256, the network address and browser of the request
          that opened the checkout or sent the sign-up (not with a later
          membership payment), and the platform&apos;s own cookies and ad click
          id from that browser. It goes to that platform on the creator&apos;s
          behalf and under its own privacy policy. A visitor who did not allow
          ad measurement is never sent. We keep the token sealed; for four days,
          the request that opened a checkout; for 400 days, the cookies and ad
          click id a membership&apos;s later payments are sent with, never an
          address or browser; for three days (40 for a membership payment) that
          each was sent; and the platform&apos;s last answer for the creator to
          see.
        </p>
        <p id="audience">
          <strong className="text-black">
            Buyers&apos; addresses for an ad audience, when a creator downloads
            them.
          </strong>{" "}
          A creator can download a file of the email addresses of their buyers
          who agreed to hear from them and have not left their list, to upload
          to Meta or TikTok themselves: to stop showing ads to people who
          already bought, or to find people like them. It holds the address and
          nothing else. We make the file when it is asked for and send it
          nowhere; the creator decides whether to upload it, and the platform
          then handles it under its own terms.
        </p>
        <p>
          <strong className="text-black">A checkout that did not open.</strong>{" "}
          When Stripe refuses to open a store&apos;s payment page, we count it
          by the day and keep Stripe&apos;s reason, for 35 days, so the creator
          can see it and is emailed once that day. Nothing about the buyer who
          pressed buy is kept.
        </p>
        <p>
          <strong className="text-black">Why a member cancels.</strong> When a
          member cancels on the page a store&apos;s emails link to, Stripe asks
          why, and keeps their answer and any words they add on the
          creator&apos;s own Stripe account. We read them from there to show
          the creator the reasons added up and the latest words, without the
          member&apos;s name or address beside them, and keep that reading for
          ten minutes. When the creator asks for the month&apos;s summary of
          what customers say, those words, with any email address, phone
          number or web address in them taken out, go to Anthropic&apos;s
          model to be sorted into themes, and the summary is kept for about
          two months.
        </p>
        <p>
          <strong className="text-black">Numbers a creator shares.</strong> A creator can show, on their media
          kit, the visitors and sales of the last 30 days and the countries their buyers are in, as shares; and
          can give somebody a read-only link, with a password and an end date, to their store&apos;s visits,
          sales, channels, products sold and buyers&apos; countries. Both are read once a day and kept for three
          days. Neither ever holds a buyer&apos;s name or address. The password is kept only as a salted hash;
          whoever opens the link with it is remembered in that browser for at most twelve hours by a cookie that
          opens only that link, and the network address it is opened from is used, for ten minutes, only to
          limit wrong passwords.
        </p>
        <p>
          <strong className="text-black">
            Numbers to Slack or Discord, a goal, and the month&apos;s email.
          </strong>{" "}
          A creator can give us a Slack or Discord webhook address; we keep it
          sealed and post there the week&apos;s and the month&apos;s totals,
          channels and notes &mdash; counts and amounts, never a buyer&apos;s
          name or address. If the creator asks, each sale is posted there too,
          as its amount, what was bought and the channel it came from, and so is
          each alert on the store&apos;s numbers; never who bought it. A goal the creator sets for the month is kept as one
          figure. On the 1st of each month the store&apos;s creator is emailed
          the month&apos;s numbers, with the same link to stop it as the weekly
          email.
        </p>
        <p>
          <strong className="text-black">Booking a call.</strong> When someone
          books a paid call, we use the time they picked, their time zone and
          the email address on their Stripe receipt to hold that time while they
          pay, to write the booking down, and to send one confirmation to them
          and one to the creator. So that each can answer the other, the
          buyer&apos;s confirmation has the creator&apos;s email address as the
          address replies go to, and the creator&apos;s has the buyer&apos;s.
          While they pay, a cookie in the buyer&apos;s browser names the
          checkout they opened, for 32 minutes, so that going back to pick
          another time releases the first one. The buyer and the creator are
          each reminded of the booking a day and an hour before, from a queue
          that names the booking and its time, and we keep a mark that each
          reminder was sent for 14 days. If the buyer moves the booking
          to another time from the link in their email, we keep the new time
          and how many times it was moved, tied to that checkout, for 200
          days. The same kind of cookie, for
          the same 32 minutes, is set when someone starts to buy a product sold
          in a limited number, so that pressing buy again hands back the one
          they were holding.
        </p>
        <p>
          <strong className="text-black">Payment plans and sales tax.</strong>{" "}
          When a buyer chooses a payment plan, Stripe keeps their card on the
          creator&apos;s account for the remaining payments, and we keep the
          checkout on a list until the plan has been given its end date, so it
          stops after the last payment. When a creator switches on sales tax,
          Stripe asks the buyer for the address it needs to work the tax out,
          under Stripe&apos;s own privacy policy; we do not keep it.
        </p>
        <p id="podcasts">
          <strong className="text-black">Private podcasts.</strong>{" "}
          When you get the feed of a private podcast you bought, we keep your
          email address with a private feed address made for you, so your
          podcast app can read it. Each time the app reads the feed or fetches
          an episode, we check that your address still holds the podcast, and
          we count those reads to stop a feed from being shared; we do not
          keep which episodes you play. The creator sees neither your feed nor
          what you listen to.
        </p>
        <p id="packages">
          <strong className="text-black">Packages of sessions.</strong>{" "}
          When you buy a package of calls, we keep your email address, which
          payment it was, how many sessions it holds, its last day to book,
          and which bookings were made from it, so you can book the rest from
          the link we email you and see how many are left. A package with a
          last day to book is kept until a year after that day; one with no
          time limit is kept for as long as it can be used. Each session is a
          booking like any other and is kept the same way.
        </p>
        <p id="gifts">
          <strong className="text-black">Gifts.</strong>{" "}
          When you buy something as a gift, we keep the recipient&apos;s email
          address, the name and the message you typed, and which payment it
          was, for about 13 months, so the gift can be handed over, shown on
          their list of purchases and taken back if the payment is refunded.
          We email the recipient once, with your name, your message and a link
          to open it; they are not added to the creator&apos;s list and receive
          nothing else from it unless they ask. You get the receipt. What was
          given is kept under the recipient&apos;s address, like a purchase of
          their own.
        </p>
        <p id="preorders">
          <strong className="text-black">Pre-orders.</strong>{" "}
          When you pre-order something, we keep the email address you paid
          with, when you paid and which payment it was, for about 13 months
          after it last changed, so it can be handed over the day it comes out,
          shown on your list of purchases and taken back if the payment is
          refunded. We email you a receipt with the day it is expected, and
          once more when it comes out, with the way to open it.
        </p>
        <p id="buyer-questions">
          <strong className="text-black">Questions on a product&apos;s page.</strong>{" "}
          Some stores answer questions on their product pages. If you type
          one, your question and what that page already says in public are
          sent to a model run by Anthropic, which writes the answer; nothing
          about you goes with it, and the box says the answer is automatic.
          We keep the answer for a day, so the same question about the same
          page is not asked twice. When the page could not answer, we keep
          the question, the product and the day for up to about four months
          and show them to the store&apos;s creator, so they can see what
          their page is missing; we do not keep who asked. The network
          address your browser connects from is used, for up to a day, only
          to limit how many questions come from one place. Leave personal
          details out of a question: it is read by the model and may be read
          by the creator.
        </p>
        <p id="fair-prices">
          <strong className="text-black">Prices for your country.</strong>{" "}
          Some stores lower their prices for buyers in certain countries. To
          show you the right one, the country your internet connection is in,
          as our host reads it from your network address, is used while the
          page is drawn and when you start paying. It is not stored. When a
          lower price was given, the country and the percentage are written on
          that order on the creator&apos;s own Stripe account, so they can see
          why it cost what it did.
        </p>
        <p id="team-places">
          <strong className="text-black">Bought for several people.</strong>{" "}
          When somebody buys a product for several people, they get a link to
          pass on. If you type your email address on the page it opens, we
          email that address one link, and the address is kept for 24 hours
          with it. If you open the link, we keep your address and when you
          took your place, with the purchase, for about 13 months, so the
          product can be opened on your address, shown on your list of
          purchases and taken back if the payment is refunded. Nobody who
          holds the link is shown who else took a place, only how many are
          left; you are not added to the creator&apos;s list and receive
          nothing else from it unless you ask. What you were given is kept
          under your address, like a purchase of your own.
        </p>
        <p id="waitlists">
          <strong className="text-black">Waitlists.</strong>{" "}
          When you join the waitlist for something a creator has not put on
          sale yet, we keep your email address, when you joined and whether you
          checked the box to hear from the creator otherwise, and we email you a
          button to confirm it. Once it is confirmed, you get one email when the
          product goes on sale; then the waitlist&apos;s addresses are deleted.
          Only if you checked the box is your address added to the
          creator&apos;s list, once confirmed. The creator sees how many people
          are waiting, not who. Unconfirmed sign-ups are kept until the product
          goes on sale, and a link in every waitlist email removes your address
          at any time.
        </p>
        <p>
          <strong className="text-black">Courses.</strong>{" "}
          When someone buys a course, we note the email address they paid with
          and when, so the course opens for them and modules that open over
          time open on the right day. The browser that paid keeps a cookie for
          a day so the course can open right away, and any browser let into
          a course keeps a cookie for 90 days so the student does not have to
          ask again. For each student we keep when they joined, when they last
          opened the course and which lessons they marked done; the creator
          sees this in their studio, and we email the student when a module
          opens for them. A student taken off a course by its creator is kept
          on a list so the course stays closed to them. To check who bought a
          course, we ask the creator&apos;s own Stripe account by email address.
        </p>
        <p id="lesson-comments">
          <strong className="text-black">Comments under lessons.</strong>{" "}
          A student who comments under a lesson chooses a name, and we keep that
          name, what they wrote and when, until they or the creator delete it or
          the course is deleted. The creator and the other students of that
          course see the name and the words; nobody sees the student&apos;s email
          address. When the creator answers a comment, we email the student who
          wrote it, at most once an hour for each lesson. A creator who asked
          for it gets a notification on their phone with the lesson and the
          start of the comment, without the name.
        </p>
        <p>
          <strong className="text-black">A one-click offer after paying.</strong>{" "}
          When a product is followed by a one-click offer, Stripe keeps the
          buyer&apos;s card on the creator&apos;s account for payments the buyer
          makes while present, and a cookie in the buyer&apos;s browser, for two
          hours, lets only that browser take the offer. We keep a record of
          whether the offer was taken, tied to that order, for eight days.
        </p>
        <p id="library">
          <strong className="text-black">Your library.</strong> So that you
          can find everything you bought from creators here in one place
          (marktmorgen.com/library), we keep, for each email address that
          bought something, which stores it bought from: the store&apos;s id
          only, under a one-way hash of the address. Not what you bought, when
          or for how much; each store&apos;s list is read from that
          creator&apos;s own payment records when you open it. It is kept for
          three years after your last purchase. When you ask for your library,
          we email a link that opens it for 24 hours, only if that address
          bought something, and the page says the same either way. The
          creators do not see it.
        </p>
        <p id="affiliate-page">
          <strong className="text-black">Your affiliate programs.</strong> So
          that an affiliate can see every store they promote in one place
          (marktmorgen.com/affiliate), we keep, for each email address that
          joined a store&apos;s affiliate program, which stores it joined: the
          store&apos;s id only, under a one-way hash of the address. Your
          link, where your application stands and your numbers are each
          store&apos;s own, read from that store when you open the page. It is
          kept for three years after you last joined or signed in. When you
          ask for the page, we email a link that opens it for 24 hours, only
          if that address is an affiliate somewhere here, and the page says
          the same either way.
        </p>
        <p>
          <strong className="text-black">
            Free copies, and a creator&apos;s list.
          </strong>{" "}
          When you ask a creator&apos;s store for something they give away for
          free, we collect your email address, what you asked for, when, and
          whether you checked the box saying you want to hear from that creator.
          The box starts empty. We send you one email, with the link to what
          you asked for, and nothing else. When you use that link, your address
          is added to that creator&apos;s list, marked with your choice, and
          the creator can download the list. If you never use the link, the
          request is deleted after 7 days and your address is not added to
          anything. To limit abuse, we also keep a one-way hash of your email
          address, and of your IP address, for one hour.
        </p>
        <p>
          <strong className="text-black">Emails from a creator.</strong> A
          creator on the Pro plan can email the people on their list who agreed
          to hear from them: those who checked the box when they got something
          free or bought, and those the creator imports after confirming that
          each of them agreed. We send those emails on the creator&apos;s
          behalf, under the creator&apos;s name, through our email provider.
          For each one we use your address, the email the creator wrote and a
          random code for your unsubscribe link. We do not put tracking pixels
          in them, and their links are not tracked person by person unless you
          allow it, as set out below. A link to the creator&apos;s own store
          carries a tag naming the email it is in, or one of two subject lines
          when the creator is trying two, each sent to a part of the list
          chosen at random. The tag is the same for everyone who got that
          email or that subject line: it lets the store count visits and sales
          by email, and says nothing about who you are. Which of a
          creator&apos;s automatic emails reach you is decided by what their
          list already holds about you — what you got or bought from them, and
          any labels their import brought or their automatic emails gave you
          (a step can give a label, take one off, or start another of their
          automatic emails) — and never by whether you open an email.
        </p>
        <p id="links">
          <strong className="text-black">Which links you use, only if you allow it.</strong>{" "}
          Where you join a creator&apos;s list, a second box, empty and
          separate from the first, asks whether the creator may see which links
          in their emails you use, so their automatic emails can send you what
          fits. If you check it, we record when. Then, in those automatic
          emails only, each link to the creator&apos;s own store carries one
          more code made from your unsubscribe code, which cannot be turned back
          into it. When such a link opens a page of the store, that page tells
          us which email the link was in, and the code is taken out of the
          address bar. We keep which of those emails you used a link in, for 90
          days after the last one, and the creator&apos;s automatic emails use
          it to decide whether you get a particular email: for example, one
          sent only to those who used the link in the email before, or only to
          those who did not. The creator does not get a list of what you did.
          Nothing is recorded for a link to anywhere else, for a one-off email,
          or for opening an email. Every email that carries the code has a line
          at its foot to stop it: one press, and nothing more is recorded, what
          was recorded is deleted at once, and you stay on the list.
          Unsubscribing stops it too. If you do not check the box, nothing about
          which links you use is recorded, ever. In the European Economic Area
          and the United Kingdom, the legal basis is your consent. Our email provider
          tells us when one of these emails could not be delivered to your
          address for good, or when you report one as spam: we record that,
          and when, for your address on that creator&apos;s list, you are not
          written to by that creator again, and for ten days we keep a one-way
          hash of your address so that it is counted once. When you unsubscribe — one press, from the
          link or your mail app&apos;s own button — we record it and when, and
          you are not written to by that creator again unless you check their
          box again yourself.
        </p>
        <p id="community">
          <strong className="text-black">A creator&apos;s community.</strong>{" "}
          When a creator opens a community on their store, we decide who may
          come in by looking up the email address a person types on the
          creator&apos;s own Stripe account, on that creator&apos;s list for
          something free, or among the buyers the creator brought over from
          another platform, and we email that address a link that works for one
          hour. Using it sets a cookie for that store in their browser for 90
          days, the same one a course uses. For each member we keep their email
          address, the name they choose to be seen by, whether they chose to be
          listed in the member directory and to be emailed announcements, when
          they joined and were last there, and whether the creator muted or
          removed them. We keep what members write: posts, comments, the
          pictures they add, likes, and reports of a post or comment. Posts,
          comments, pictures and likes are seen by the other members and by the
          creator. The directory shows only the chosen name, and only of those
          who asked to be listed. A member&apos;s email address is seen by the
          creator and never by other members. What is written is kept while
          the community exists, until its author or the creator deletes it;
          deleting a post deletes its comments, likes, reports and picture.
          Who reported something is kept for 90 days, so each member&apos;s
          report counts once. The answer about whether someone may come in is
          kept for up to five minutes, a record of each announcement emailed
          and who it went to for up to 60 days, the code in a member&apos;s
          unsubscribe link with their member record, and, to limit abuse, one-way hashes
          of the address and network address that asked for a link for one
          hour.
        </p>
        <p id="live-events">
          <strong className="text-black">Live events in a community.</strong>{" "}
          When a member says they are coming to a creator&apos;s live event
          (an RSVP), we keep that they are coming and when they said so,
          under a one-way key made from their email address, with the event;
          giving the place back removes it. The creator and the people on
          their team see who is coming, with the name and email address the
          community keeps for each member. Reminders a day and an hour before
          go only to members who asked for the community&apos;s emails; a
          move or a cancellation is emailed once to everyone coming. For each
          of those emails we keep a record of it and of who it went to for 30
          days, so it is never sent twice. For an event kept for the buyers
          of some products, the answer to whether a member holds one is
          looked up on the creator&apos;s Stripe account and kept for up to
          five minutes. An event, with the list of who is coming, is kept
          until the creator deletes it once it is over or canceled, or until
          it makes room for a newer one after 500 are kept. When a member
          presses Join here, the event&apos;s video room loads from Jitsi Meet
          inside the page, with the name they chose in the community filled
          in as their name in the room, where the others in it see it. A
          replay is a YouTube, Vimeo or Loom video that loads from that
          service only when a member presses play, and so does a video on a
          creator&apos;s sales page, when a visitor presses play.
        </p>
        <p id="imports">
          <strong className="text-black">
            Moving a store from another platform.
          </strong>{" "}
          A creator can bring spreadsheets from another platform. The file is
          read in their own browser, and we receive only the columns they
          match: for a list, email address, name, labels and consent; for
          products, title, price, description and link; for past buyers,
          email address and product. We keep the rows as they came, which
          rows were already seen, the report of rows not brought in (each
          with its row number, column, reason and value), the buyers still to
          be emailed, and the import&apos;s own record (the file&apos;s name,
          who started it and its counts) for 14 days after the import began,
          and then delete them. Contacts are added to the creator&apos;s list
          only when the creator confirms that the people in the file agreed
          to hear from them; each is marked as imported, with when, and keeps
          the name and labels from the file. An address that unsubscribed from
          that creator is never added back. For each past buyer we keep which
          products they were given, when and by which import, stored against
          a one-way hash of their email address, for as long as the store
          exists; nothing is charged, no receipt is made, and these are never
          counted as sales. When that person opens the store&apos;s list of
          purchases or its community with that address, we use it to look up
          what they were given. If the creator checks it, each past buyer gets
          one email from the store&apos;s name, through our email provider,
          saying what moved and how to open it. We send it on the
          creator&apos;s instruction and on their word that these people
          bought from them and may be told so, which we cannot check against
          the other platform. A store may send up to 20,000 of these in 30
          days, and for that we keep only a count.
        </p>
        <p id="moved-members">
          <strong className="text-black">
            Members moved from another platform.
          </strong>{" "}
          A creator can also bring the members of a membership they ran
          elsewhere: for each, we receive the email address, the membership,
          the date it would next renew there and, for a membership with
          several prices, which one. Nobody is given a membership because of
          it. For each member we keep that address, membership, price and
          date, the import that brought them, a random link of their own, and
          whether they kept the membership here, until the store is deleted;
          the link stops working 30 days after the renewal date. Each member
          gets one email from the store&apos;s name, through our email
          provider, with that link, and one reminder a few days before the
          date if they have not kept it by then. Before the reminder we ask
          the creator&apos;s Stripe account whether that address already holds
          the membership, so somebody who kept it is not written to. We send
          these on the creator&apos;s instruction and on their word that these
          people are their members, which we cannot check against the other
          platform; they count within the same 20,000 in 30 days. Keeping the
          membership is a checkout on the creator&apos;s own Stripe account,
          like any purchase in their store.
        </p>
        <p id="api-writes">
          <strong className="text-black">
            A creator&apos;s own tools, through the API.
          </strong>{" "}
          A creator can give their own tools a key that may also write. With
          it, a tool can put somebody on the creator&apos;s list, on the
          creator&apos;s word in that request that the person agreed to hear
          from them, kept as an imported contact is; change that
          person&apos;s labels; and give or take back a product, kept as a past
          buyer&apos;s is, marked as given through the API. Nobody who
          unsubscribed is added back. When the tool asks, the person gets one
          email from the store&apos;s name, through our email provider, saying
          what they were given, within the same 20,000 in 30 days as the
          emails above. We keep how many of these a store made each day, for a
          day, to hold them to their limits.
        </p>
        <p id="code-links">
          <strong className="text-black">
            Discount codes in a link.
          </strong>{" "}
          When someone opens a store&apos;s page through a link carrying a
          discount code, a cookie named <code>nl_code_</code> followed by the
          store&apos;s address holds that code for seven days, so it applies at
          that store&apos;s checkout without being typed. It holds the code and
          nothing else, and is sent to no other store.
        </p>
        <p id="cart">
          <strong className="text-black">A store&apos;s cart.</strong>{" "}
          What someone adds to a store&apos;s cart is kept in their own
          browser&apos;s storage, under <code>mm-cart:</code> followed by the
          store&apos;s address: the products&apos; ids and nothing else. Those
          ids are sent to us only to show the products&apos; prices when the
          cart is opened and to check out, and are not kept. Nothing in it is
          sent to another store, and it is emptied once they have paid.
        </p>
        <p id="headline-tests">
          <strong className="text-black">
            Tests on product pages.
          </strong>{" "}
          A visitor to a product&apos;s page gets a cookie named{" "}
          <code>nl_ab</code> holding one random number from 0 to 999, for 90
          days, so that when the creator tests two headlines, or two versions
          of the whole page, the same visitor keeps seeing the same one. For
          each test we count how many times each version was seen and how many
          checkouts were opened from it, and nothing about who. Visitors in the
          European Economic Area, the United Kingdom, Switzerland or Brazil, or
          whose country we cannot tell, get no such cookie: they see the first
          version and are not counted.
        </p>
        <p id="channels">
          <strong className="text-black">
            Where a store&apos;s buyers came from.
          </strong>{" "}
          When someone reaches a store&apos;s page from somewhere we can name
          — a link the creator tagged, another site, or the Instagram or
          TikTok app — a cookie named <code>nl_ch_</code> followed by the
          store&apos;s address keeps, for 90 days, the name of that place and
          of the first such place in the last 90 days, with the two dates. If
          they then buy within the window the creator chose (7, 30, 60 or 90
          days after that visit; 30 unless they change it), those names are
          written on the payment in the creator&apos;s own Stripe account, so the creator can see which of
          their channels brought the sale; renewals of a membership carry them
          too. It holds nothing else, identifies nobody, is sent to no other
          store, and we keep no copy. Visitors in the European Economic Area,
          the United Kingdom, Switzerland or Brazil, or whose country we cannot
          tell, and anyone whose browser sends Global Privacy Control, get no
          such cookie: their purchase is credited only by the tags on the page
          they bought from.
        </p>
        <p id="page-depth">
          <strong className="text-black">
            How far a sales page is read.
          </strong>{" "}
          When a visitor leaves a product&apos;s sales page, the page sends the
          id of the furthest of its sections they saw, and we add one to that
          section&apos;s count. On a store&apos;s own page it sends the furthest
          item they saw &mdash; a product, a link or a part of the page &mdash;
          where it stood, and the item they clicked, if any, and we add one to
          that day&apos;s count of it. Each page decides at random to send this
          for one visitor in eight, and for nobody else. On a sales page it can
          also say how far into the page&apos;s video they got, and, where the
          creator turned the question on, which of five answers they tapped
          when asked what was stopping them from buying. No cookie is set and
          nothing about the visitor is sent or kept; the device remembers only
          that the question was asked, so it is not asked again.
        </p>
        <p id="search">
          <strong className="text-black">Searching a store.</strong> When a
          search of a store finds nothing, we count the words searched for on
          that day, so the creator sees what visitors looked for and could not
          find. Only the words are kept, not who searched.
        </p>
        <p id="heard">
          <strong className="text-black">
            Where a buyer heard of a store.
          </strong>{" "}
          After paying, a buyer may be asked one question, which they can skip:
          where they heard of the store. If they answer, we check that the order
          is a paid order of that store, add one to that day&apos;s count of the
          answer and the order&apos;s amount to its total (and, when the
          order had no channel, to a second count and total of the same
          answer, so the creator can see what such sales were put down to),
          and mark the order as
          answered for 30 days so it is counted once. The answer is not kept
          with the order, the buyer or the time, and the creator sees only the
          counts.
        </p>
        <p id="affiliates">
          <strong className="text-black">
            A creator&apos;s affiliate program.
          </strong>{" "}
          When someone follows an affiliate&apos;s link to a store, a cookie
          named <code>nl_via_</code> followed by the store&apos;s address holds
          the affiliate&apos;s code and the time of the click, and the earliest click
          that visitor still carries, for up to 400 days &mdash; the longest any
          browser keeps a cookie; a purchase counts for the affiliate only
          within the window the creator set, measured from whichever of those
          two clicks that creator credits. Visitors in the European Economic Area, the United
          Kingdom, Switzerland or Brazil, or whose country we cannot tell, are
          asked first, because the rules there require consent: the cookie is
          set only if they allow it, and their answer is kept in their browser
          for that store. To count a click once per visitor per day we keep a
          one-way hash of the visitor&apos;s network address and browser for
          two days. When a purchase counts, we note which product, when, what
          was paid before tax and in all, the share it earns, and whether it was
          credited by a click, by a discount code or by the buyer already
          belonging to that affiliate &mdash; and never the buyer&apos;s name or
          email address. Where a creator credits memberships and payment plans,
          the affiliate, the share and the terms ride on the subscription in the
          creator&apos;s own Stripe account, and each payment is read from there
          when the program&apos;s records are opened, not kept by us. When a
          click on an affiliate&apos;s link came from a paid search ad (the
          address carries Google&apos;s or Microsoft&apos;s ad click id, or is
          tagged as paid search), we add one to that affiliate&apos;s count of
          such clicks, and nothing about the visitor. A creator may give one of their own discount codes to
          one affiliate, and then a purchase that used that code counts for them
          with no cookie involved; what we keep for that is which code belongs
          to which affiliate, and nothing about whoever typed it. A creator may
          also ask that a buyer credited to an affiliate stays credited to them
          for every later purchase. Where they have, we keep a one-way hash of
          the buyer&apos;s email address together with the store&apos;s own id,
          and the affiliate it belongs to &mdash; no address, no name and nothing
          about what was bought. The hash cannot be turned back into an address
          or lined up against another store&apos;s, it is never shown to the
          affiliate, and a buyer who asks the creator to be forgotten is removed
          from it. Where a creator lets buyers
          join without applying, a buyer who presses &ldquo;Get my link&rdquo;
          joins with the email address their order was paid with, which we read
          from the creator&apos;s Stripe account for that order. When someone applies to be an
          affiliate, we keep their email address, the note they wrote, their
          code, when they applied and what the creator decided, the PayPal
          address they choose to be paid at, if they give one (we email the
          address they joined with whenever it changes), their clicks
          and sales, and the payments the creator records to them with the
          date and reference the creator types. An affiliate who signs in to
          their page keeps a cookie named <code>nl_aff_</code> followed by the
          store&apos;s address, for 30 days. The creator sees all of this; an
          affiliate sees only their own figures. It is kept with the
          store&apos;s records. We never hold or pay out an affiliate&apos;s
          money: the creator pays them. A creator who pays from their own
          PayPal through us gives us the Client ID and Secret of an app in
          their PayPal Business account; we keep the Secret encrypted, never
          show it again and delete both when they disconnect. Each time they
          pay, we send PayPal each affiliate&apos;s email address, the amount
          and a note, and PayPal sends the money from the creator&apos;s PayPal
          to the affiliate&apos;s, under PayPal&apos;s own privacy policy; we
          keep which PayPal batch and payment paid which affiliate.
        </p>
        <p id="invites">
          <strong className="text-black">Creators inviting creators.</strong>{" "}
          A creator&apos;s studio gives them an invite link for other
          creators. Opening it sets nothing. Pressing &ldquo;Accept the
          invite&rdquo; sets a cookie named <code>nl_invite</code> holding the
          invite&apos;s code, for 60 days, and it is removed when a store is
          made. When the first store of a new account is made with it, we keep
          which store invited which, and when. To add the credit the invite
          earns, we read from our own Stripe account the payments the invited
          account made to us, and keep, for each, the amount credited, its
          date and whether it is on the plan yet. The inviting creator sees the
          invited store&apos;s public name and address, when it was made,
          whether it is in its trial, paying or not, and the credit it earned
          them, and never its email address or what it sells or earns. Kept
          while either store exists.
        </p>
        <p id="calendars">
          <strong className="text-black">Calendars a creator connects.</strong>{" "}
          A creator can give us the private iCal address of up to three of
          their own calendars. We store the address, never show it again once
          saved, and use it only to read when they are busy; we keep only the
          busy times, never a title, guest or place, and each reading for up to
          six hours. The calendar&apos;s provider sees our request for it. A
          creator also gets a private address of their own that lists their
          upcoming calls and sessions with the name and email address of each
          buyer, for the calendar app they subscribe with; replacing that
          address turns the old one off.
        </p>
        <p id="webhooks">
          <strong className="text-black">Webhooks a creator adds.</strong> A
          creator can give us up to five web addresses of their own, such as a
          Zapier or Make hook. When a sale, a change to a membership, a
          confirmed request for something free, a booking, a moved booking or a
          refund happens in their store, we send that address a message with
          its details, which can include the buyer&apos;s name and email
          address, the product and the amount. What happens to it there is the
          creator&apos;s choice and responsibility. We keep each address and its
          signing secret until the creator removes it, a mark of each event
          sent for 30 days so it is never sent twice, and each delivery, with
          the answer the address gave, for up to seven days.
        </p>
        <p id="license-keys">
          <strong className="text-black">License keys.</strong> When a creator
          sells a product with license keys, we keep each key with the sale it
          went to, when, and the buyer&apos;s email address, so the buyer can
          see it again and the creator can see who has it, and whether the
          creator revoked it. Anyone can ask whether a key is valid; the answer
          says nothing about who bought it. Keys are kept with the
          store&apos;s records.
        </p>
        <p id="quizzes">
          <strong className="text-black">
            Course quizzes and certificates.
          </strong>{" "}
          For each student and quiz we keep how many tries they used, their
          last answers, their best mark and whether they passed, with their
          course progress. A certificate keeps the name exactly as the student
          typed it, the course title, the creator&apos;s name, the
          student&apos;s email address and when it was issued or withdrawn.
          Its page shows the name, the course, the creator and the date to
          anyone who has its address, is kept out of search engines, and never
          shows the email address. Certificates are kept for good, so the page
          goes on proving what it says; a withdrawn one says it was withdrawn.
          A student who wants theirs withdrawn asks the creator.
        </p>
        <p id="assignments">
          <strong className="text-black">Course assignments.</strong> When a
          creator gives a lesson an assignment, we keep what each student hands
          in for it: what they wrote, the file they added with its name and
          size, when, how many times, and what the creator wrote back and
          when, with their course progress. The file is kept privately with
          the creator&apos;s store files, where only that student, the creator
          and the creator&apos;s team can download it; a file uploaded and not
          handed in is deleted within about a day, one replaced by a new one
          is deleted at once, and everything is deleted when the creator
          removes the assignment, the lesson or the course. When the creator
          asks AI to draft a reply, the assignment and what the student wrote
          are sent to Anthropic to write it, never the file. A student who
          wants their work deleted asks the creator.
        </p>
        <p id="discord">
          <strong className="text-black">Discord access.</strong> When a
          creator connects their Discord server, a buyer of a product that
          gives roles there can press &ldquo;Join the Discord&rdquo; and agree
          on Discord&apos;s own page. Discord then tells us their Discord
          account&apos;s id and name, and lets us put them in that one server.
          We keep, with the creator&apos;s records, that id and name, the
          address that bought, which of the creator&apos;s products it held
          and which roles it was given, and check every few hours, against
          the creator&apos;s Stripe account, whether it still holds them. We
          do not keep the permission Discord gave beyond that moment, never
          read or send messages there, and never see the buyer&apos;s Discord
          password or email. Once the address holds none of those products,
          the roles are taken back and the record is deleted; it is all
          deleted when the creator disconnects the server.
        </p>
        <p id="stamping">
          <strong className="text-black">Stamped PDFs.</strong> When a creator
          switches on stamping for a product, every page of the PDF a buyer
          downloads carries the buyer&apos;s email address, the date and the
          end of the order number. The stamped copy is made by our own code, is
          kept privately beside the creator&apos;s file so a later download
          gets the same copy, and is deleted with that file; a note of which
          copy belongs to which sale is kept for about 400 days. Anyone the
          buyer passes the file to can read that line.
        </p>
        <p id="teams">
          <strong className="text-black">A store&apos;s team.</strong> A
          creator can invite up to five people to help run a store. For each
          invitation we keep the address it went to, the role, when it was made
          and when it runs out, seven days later; the link in it works once.
          For each member we keep their sign-in address, their role and when
          they joined, and, for each person, which stores they are on, so
          their studio can find them. A store keeps an activity log of its last
          500 lines: when, who (their sign-in address), their role and what
          they did, such as a change they made in the studio, a file they
          downloaded or a change to the team. The owner sees the team and the
          log, and is emailed when someone joins or changes role. The team,
          its invitations and its log are deleted with the store, and a member
          taken off the team or who leaves is removed from it at once.
        </p>
        <p id="signing-in">
          <strong className="text-black">Passkeys and new browsers.</strong> A
          creator can add up to ten passkeys to their account. For each we keep
          only the public half of the key, a counter, the name they gave it,
          the kinds of connection the device reported, whether it is kept in a
          synced keychain, and when it was added and last used; the private
          half never leaves their device. Each is kept until they remove it.
          Signing in with a passkey sets a cookie named <code>nl_pk</code> for
          five minutes, for that one sign-in. Every sign-in also sets a cookie
          named <code>nl_device</code> holding a random code for that browser,
          for 400 days, and we keep a one-way hash of that code with the
          account, up to 100 browsers, until 400 days after the account&apos;s
          last sign-in. When an account that has signed in before signs in from a browser
          it has not used, we email its owner when it happened, how, and the
          browser and system as the browser names them; we do not keep that
          description. In the studio, a cookie named <code>nl_store</code>{" "}
          remembers which of an account&apos;s stores was last open, for a
          year.
        </p>
        <p id="drafts">
          <strong className="text-black">Email drafts.</strong> For each draft
          of an email to a creator&apos;s list we keep its subject, its text,
          who it is meant for, who last saved it (their sign-in address) and
          when, until it is sent or deleted, up to 20 per store.
        </p>
        <p>
          <strong className="text-black">Sending a purchase email again.</strong>{" "}
          A creator, an Admin or Support can have a buyer&apos;s purchase email
          sent again;
          it goes only to the address the buyer paid with, read again from the
          creator&apos;s Stripe account.
        </p>
        <p id="email-platforms">
          <strong className="text-black">
            An email platform a creator connects.
          </strong>{" "}
          A creator can connect their own Mailchimp, Kit, beehiiv or MailerLite
          account with an API key. We encrypt the key before it is stored, keep
          its last four characters to show them, and delete it when they
          disconnect. When someone who agreed to hear from that creator asks
          for something free and confirms it, or buys and agreed, we send that
          platform their email address, their first name when the payment
          carries a name, and the tags the creator chose, to add them to the
          audience, form, publication or group the creator picked. Nobody who
          did not agree is sent, and we then keep no address for them. For
          each person sent we keep a record of how it went, with their address
          and first name, for up to a week, the last 50 of them in the
          creator&apos;s studio, and a one-way hash of each person and event
          for 30 days so nobody is sent twice. What happens on the platform is
          governed by the creator&apos;s own account there and that
          platform&apos;s privacy policy.
        </p>
        <p id="notifications">
          <strong className="text-black">Phone notifications.</strong> When a
          creator or someone on their team turns notifications on for a
          device, we keep what the browser gives us to reach it (its push
          address and keys), a label such as &ldquo;iPhone · Safari,&rdquo; which
          events it wants, when it was added and whose it is, until it is
          removed or the browser turns notifications off, with how the last
          send went. A notification says an amount, a product title or a time,
          never a buyer&apos;s name or email address; it is encrypted for the
          device and passes through the push service of that browser&apos;s
          maker, such as Apple, Google or Mozilla. We keep a mark of each event
          sent for 40 days, so it is never sent twice.
        </p>
        <p id="reviews">
          <strong className="text-black">Reviews.</strong> A buyer can review
          what they paid for. We check the order on the creator&apos;s own
          Stripe account, and keep the stars, the words, the photo if the
          buyer adds one (made smaller on their device before it is sent, and
          kept as a picture file on our storage provider until the review, the
          photo or the product is deleted, or the creator takes the photo
          off), the name the buyer
          chose to show (or &ldquo;Verified buyer&rdquo;), the order reference
          and the payment it came from, when it was written and changed,
          whether the creator hid it or answered it, and whether the payment
          was later refunded. The buyer&apos;s email address is not kept with
          the review and is never shown; the review&apos;s code is a one-way
          hash that includes it, so one buyer has one review per product. The
          review, with the chosen name, is public on the store; its buyer can
          change or delete it, and the creator can hide it but not change it.
          Deleting the product deletes its reviews.
          If the creator switches on the email that asks for a review, we put
          each paid order on a list with when it was paid, send its buyer one
          email on the creator&apos;s behalf, and keep a mark that its buyer
          was asked, for 120 days. The link in that email, tied to the order and
          the address it went to, works for 60 days; its link to stop being
          asked works for 400 days, and pressing it keeps a
          one-way hash of the address for that store for good, so that store
          never asks again.
        </p>
        <p id="video-rooms">
          <strong className="text-black">Video rooms.</strong> When a creator
          chooses a video room for their calls, each booking, or each time of a
          group call or session, gets a Jitsi Meet address with a random name.
          We keep it for 60 days after the call and put it in the booking
          emails, reminders, calendar files, the creator&apos;s bookings feed
          and the buyer&apos;s list of purchases. Jitsi Meet (meet.jit.si) is
          run by 8x8, not by us: whoever opens the room uses that service under
          its own privacy policy, and the first person in may be asked to sign
          in to it with an account such as Google. We send Jitsi
          nothing ourselves. A community&apos;s live event has a room of its
          own, made with the event, as the section on live events describes.
        </p>
        <p id="google-zoom">
          <strong className="text-black">
            Google Calendar or Zoom, if a creator connects it.
          </strong>{" "}
          A creator can connect their own Google Calendar to their store, so
          that an event with a Google Meet link is made on it for each booked
          call set to Google Meet and, if they choose it, for a
          community&apos;s live event. A creator can connect a Zoom account
          in the same way, once Zoom approves our Marketplace listing.
          This section says what happens then. None of it happens unless a
          creator connects one.
          Only the store&apos;s owner and its Admins can connect or disconnect
          it, and the owner is emailed each time.
        </p>
        <p>
          <strong className="text-black">Google.</strong> When a creator
          connects Google Calendar, we ask Google for their account&apos;s
          identity and email address (<code>openid</code>,{" "}
          <code>email</code>), to show which account is connected, and for
          one permission, <code>https://www.googleapis.com/auth/calendar.events</code>.
          We use that permission only to create, change and delete the events
          of calls booked through their store, and of their community&apos;s
          live events, each with a Google Meet link, on their primary
          calendar. We do not read, change or delete any other event, and we
          read nothing else from their calendar or their Google account. What
          we send Google: for a one-to-one call, a title with the product and
          the buyer&apos;s name (or their email address when there is no
          name), a description with the store&apos;s address and the
          buyer&apos;s email address, the time, and the buyer&apos;s email
          address on the event&apos;s guest list; for a group call or a
          session on dates, the product&apos;s title, the time and each
          buyer&apos;s email address on the guest list, up to 200, set so
          that guests do not see one another; for a live event, only its
          title, its time and the address of its page, and no member&apos;s
          name or email address. Google is told not to email anyone about
          these events: the booking emails come from us. When a booking is
          moved the event moves with it, and when it is refunded in full the
          event is deleted or the buyer taken off the guest list.
        </p>
        <p>
          Marktmorgen&apos;s use and transfer of information received from
          Google APIs will adhere to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We use that information
          only to make and keep these meetings, never for advertising; we do
          not sell it, transfer it to anyone else except as needed to provide
          this feature or as the law requires, or use it to train any
          artificial intelligence model; and no person reads it unless the
          creator asks us to for support, it is needed for security, or the
          law requires it.
        </p>
        <p>
          <strong className="text-black">Zoom.</strong> When a creator
          connects Zoom, we ask for permission to create, read, change and
          delete the meetings of the Zoom user who connects, and to read that
          user&apos;s own profile for the name and email address shown in the
          studio. We only change or delete meetings we made, and we do not
          read the user&apos;s other meetings, recordings, chats or
          participant lists. What we send Zoom: for a one-to-one call, a topic with the product and the
          buyer&apos;s name (or their email address when there is no name),
          an agenda with the store&apos;s address and the buyer&apos;s email
          address, and the time; for a group call or a session on dates, the
          product&apos;s title and the time; for a live event, only its
          title, its time and the address of its page. The link that starts
          a meeting as its host is asked of Zoom when the creator presses
          Start, shown to them, and never stored.
        </p>
        <p>
          <strong className="text-black">
            What we keep, and how it ends.
          </strong>{" "}
          For each connection we keep the account&apos;s ID, email address
          and name, when and by whom it was connected, and the access and
          refresh tokens the provider gives us, encrypted at rest; the tokens
          never leave our servers. For each meeting we keep which account made
          it, its ID, link, title and time and, on Google, its guest list,
          until 60 days after the meeting. We keep a short log of problems with a
          connection for 30 days, and each consent in progress for ten
          minutes. When a creator disconnects from the studio, we give the
          token back to Google or Zoom so that access ends on their side too,
          and delete the connection and its tokens; meetings already made
          stay on the creator&apos;s calendar or Zoom account. If the creator
          removes our app from their Zoom account, Zoom tells us and we delete
          every connection that user made, with its tokens, at once. If the
          creator withdraws our access in their Google account, we stop using
          the connection and tell them, and disconnecting deletes it.
        </p>
        <p>
          <strong className="text-black">Usage and technical data.</strong> We
          may collect information such as IP address, browser type, device
          type, pages visited, referring URL, and approximate location derived
          from IP address. This helps us operate, secure, and improve the
          Services.
        </p>
        <p>
          <strong className="text-black">Communications.</strong> If you email
          us, we keep the content of that correspondence and your contact
          details so we can respond.
        </p>
        <p>
          <strong className="text-black">Creator research answers.</strong> If
          you fill in the form at{" "}
          <Link
            href="/creators"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            marktmorgen.com/creators
          </Link>
          , we collect your name, email address, country, the platform where
          you sell, the store or profile link you choose to share, your
          answers, the date you sent them, and the consent choices you checked.
          To limit abuse, we also keep a one-way hash of your IP address for
          one hour; we do not store the IP address itself with your answers.
        </p>
        <p>
          <strong className="text-black">Research outreach.</strong> If we
          contacted you first to ask about your experience as a creator, we
          used business contact details you had made public: your name, your
          business email address or social media profile, your store or
          profile link and, for UK companies, details from the public
          Companies House register. We use them only to send that research message and to
          continue the conversation if you reply. Our legal basis is our
          legitimate interest in understanding what creators need before we
          build a product. You can object at any time by replying
          &ldquo;stop&rdquo; or by emailing us, and we will not contact you
          again.
        </p>
        <p>
          <strong className="text-black">Outreach by creators.</strong> A
          creator can use their studio to prepare one email to a business they
          name: a proposal to sponsor them, to sell their product for a share,
          or to buy from them. For that, a reader that identifies itself as
          MarktmorgenOutreach opens up to four pages of that business&apos;s
          own website, once, and we keep, for that creator&apos;s store only:
          the address the business printed there, the page it was printed on,
          the words around it, the date, the draft, and what became of it
          (sent, answered, or asked to stop). Addresses are taken only from
          the business&apos;s own website and only at its own domain; in the
          United Kingdom, Ireland, France and Sweden only an address that
          names a desk, not a person, can be used. We send none of these
          emails: the creator sends each one from their own mailbox and is its
          sender. Our legal basis is the legitimate interest of that creator,
          and ours, in one relevant business proposal reaching the address a
          business published for being written to. Every such email ends with
          a link that closes your business to that store, or to every store
          here, in one press and for good; and a robots.txt rule for
          MarktmorgenOutreach keeps the reader off your site entirely.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>create and manage your account;</li>
          <li>
            process subscriptions, renewals, cancellations, and refunds, and
            email you before a charge you might not expect: the first one after
            your free trial, and each renewal of a yearly subscription;
          </li>
          <li>
            provide the Services: host your store page, keep the files you sell
            where only you can reach them, and hand a file to a buyer who paid
            you for it;
          </li>
          <li>
            send you a free copy you asked a creator&apos;s store for and, once
            you use the link we sent, add your address to that creator&apos;s
            list with the choice you made;
          </li>
          <li>
            communicate with you about your account, billing, and service
            updates;
          </li>
          <li>
            detect, prevent, and investigate fraud, abuse, and security
            incidents;
          </li>
          <li>comply with legal obligations;</li>
          <li>improve the reliability and quality of the Services; and</li>
          <li>
            if you answered our creator research, read your answers to decide
            what to build next and, only if you checked the matching optional
            box, email you follow-up questions about your answers or tell you
            when we launch a product for creators. Each of these is a separate
            choice, and we contact you only by email.
          </li>
        </ul>
        <p>
          Where the GDPR or similar laws apply, we process personal data on the
          following legal bases: performance of a contract (providing the
          subscription), legitimate interests (security, service improvement,
          and necessary communications), consent (where we ask for it, such as
          the creator research form), and legal
          obligation. You can withdraw consent at any time by emailing us;
          this does not affect processing that happened before you withdrew
          it.
        </p>
      </LegalSection>

      <LegalSection title="3. How we share information">
        <p>We do not sell your personal information.</p>
        <p>We share information only with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-black">Stripe</strong>, our payment
            processor, to charge your subscription and handle refunds;
          </li>
          <li>
            <strong className="text-black">Stripe</strong>, when you buy from a
            creator&apos;s store, because the payment is made into that
            creator&apos;s own Stripe account and Stripe processes the card
            details directly;
          </li>
          <li>
            <strong className="text-black">
              The creator you bought from or asked for something free
            </strong>
            , who receives your email address and the details of your order or
            request, including whether you agreed to hear from them, because it
            is their store;
          </li>
          <li>
            <strong className="text-black">
              The other members of a community you join
            </strong>
            , who see what you post there and the name you chose, never your
            email address;
          </li>
          <li>
            <strong className="text-black">
              The addresses a creator connects
            </strong>
            : a creator&apos;s webhook addresses receive the details of events
            in their store, which can include your name and email address as a
            buyer, and the calendar app a creator subscribes with reads their
            bookings, with each buyer&apos;s name and email address. Affiliates
            never receive buyers&apos; names or email addresses;
          </li>
          <li>
            <strong className="text-black">
              The people on a store&apos;s team
            </strong>
            , who see what that store&apos;s owner lets their role see,
            including buyers&apos; orders and bookings for Admins and Support;
          </li>
          <li>
            <strong className="text-black">
              The email platform a creator connects
            </strong>
            {" "}(Mailchimp, Kit, beehiiv or MailerLite), which receives the
            email address, first name and tags of people who agreed to hear
            from that creator;
          </li>
          <li>
            <strong className="text-black">
              Google or Zoom, when a creator connects their own Google
              Calendar or Zoom account
            </strong>
            , which receive what the section on Google Calendar and Zoom
            lists: for a one-to-one call, the product, its time and the
            buyer&apos;s name and email address; for a group call or a session
            on dates, the product, its time and, on Google only, each buyer&apos;s email address on the guest
            list; for a live event, only its title, time and page;
          </li>
          <li>
            <strong className="text-black">Push services</strong> run by the
            maker of the browser a notification goes to, such as Apple, Google
            or Mozilla, which carry it encrypted;
          </li>
          <li>
            <strong className="text-black">Vercel</strong>, our host, which
            serves the site, stores the files, pictures and videos creators
            upload (Vercel Blob) and, when a creator adds their own domain,
            receives that domain&apos;s name to check its records and issue its
            certificate, and, when a login link is asked for, checks that a
            person&apos;s browser sent the request rather than a program, by
            reading the browser&apos;s answer to a small challenge;
          </li>
          <li>
            <strong className="text-black">Resend</strong>, our email
            provider, which delivers the emails we send, among them login
            links, receipts and booking emails, the links to what you asked for, the links that let
            members, students, affiliates and team members in, the emails that
            ask a buyer for a review, the reminders about a community&apos;s live
            events, the one email a creator may send to buyers they brought
            over from another platform, and the emails a creator sends to their
            list or their community, and which receives the emails written to
            our own addresses, such as support@marktmorgen.com, and passes them
            on to the inbox where we read them;
          </li>
          {amazon ? (
            <li>
              <strong className="text-black">Amazon Web Services</strong>,
              whose email service (Amazon SES) delivers the same emails we
              send, listed under Resend above; Resend delivers them whenever
              Amazon does not. Amazon also tells us when one of those emails
              could not be delivered or was reported as spam, so that the
              address is not written to again;
            </li>
          ) : null}
          {cloudflare ? (
            <li>
              <strong className="text-black">Cloudflare</strong>, whose file
              store (Cloudflare R2) keeps the files a creator sells and
              hands each one to the buyer who is given its address. When a
              file is downloaded it receives the buyer&apos;s network address
              and browser, as any service that sends a file does;
            </li>
          ) : null}
          {bunny ? (
            <li>
              <strong className="text-black">Bunny.net</strong>, whose video
              service (Bunny Stream) keeps the videos a creator uploads to
              their lessons, in the several sizes they are played in, and
              plays them to that creator&apos;s students in its own player on
              the lesson&apos;s page. When a lesson&apos;s video is played it
              receives the student&apos;s network address and browser, as any
              service that plays a video does, and its player keeps in that
              browser where the student stopped, so the video goes on from
              there;
            </li>
          ) : null}
          <li>
            <strong className="text-black">Google</strong>, in whose mail
            service (Gmail) we read and answer the emails you write to us;
          </li>
          <li>
            <strong className="text-black">Upstash</strong>, our database
            provider, which stores the records this policy describes;
          </li>
          <li>
            <strong className="text-black">Anthropic</strong>, whose model
            writes a draft when a creator asks the studio for one (a
            product&apos;s description, a course outline or an email), and
            which receives only what that creator typed into the box for it,
            the product&apos;s name, price and kind, and the store&apos;s
            name; never anything about their buyers, members or list. For an
            Outreach email it receives what the creator typed, the
            creator&apos;s name, the names of their products, and the name and
            description a business gives itself on its own website; never
            the address the email is for. Where a store answers questions on
            its product pages, it also receives the question a visitor typed
            and what that product&apos;s page already says in public, and
            nothing about who asked. When a creator asks for a draft reply to
            a student&apos;s assignment, it receives the assignment and what
            the student wrote for it, never the student&apos;s name, address
            or file. When a creator asks for the month&apos;s summary of what
            their customers say, it receives the words members wrote when
            cancelling, questions a page could not answer, the words of
            reviews and the words searched for on the store that found
            nothing, from the last 90 days, never with a name, and with any
            email address, phone number or web address in them taken out
            first;
          </li>
          <li>
            <strong className="text-black">Unsplash</strong>, which serves the
            photographs on our own pages straight to your browser and so
            receives your network address and browser, as any site that serves
            a picture does;
          </li>
          <li>
            <strong className="text-black">
              The ad platforms a creator adds
            </strong>
            {" "}(Meta, Google, TikTok or Pinterest), whose scripts on that
            store&apos;s pages receive what the section on ad measurement
            lists, only once they are allowed; and
          </li>
          <li>
            <strong className="text-black">
              Professional advisors or authorities
            </strong>
            , when required by law or to protect our rights.
          </li>
        </ul>
        <p>
          Our own service providers (Vercel, Upstash, Resend{amazon ? ", Amazon Web Services" : ""}{bunny ? ", Bunny.net" : ""}{cloudflare ? ", Cloudflare" : ""} and Anthropic) may use the
          information only to provide their services to us or as required by
          law. Stripe, Google for the emails you write to us, the services a
          creator connects and the ad platforms a creator adds handle what they
          receive under their own terms and privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="4. If you buy from a creator’s store">
        <p>
          The store belongs to the creator, not to us. For the personal data of
          that store&apos;s buyers, and of the people who ask it for something
          free, the creator is the controller and Marktmorgen
          is their processor: we handle that data to run the store on
          their behalf and on their instructions, and we do not use it for our
          own purposes, do not sell it, and do not email a creator&apos;s
          buyers or list to market anything of ours.
        </p>
        <p>
          The same is true for the members of a creator&apos;s community, the
          people who apply to their affiliate program, their students&apos;
          quiz answers, handed-in work and certificates, and their buyers&apos; reviews: the
          creator is the controller, and we handle that data on their behalf.
          When a creator connects an email platform, Google Calendar, Zoom or
          a Discord server, or chooses Jitsi Meet for their calls and events, that is the
          creator&apos;s choice, and the data sent or
          used there is governed by the creator&apos;s account and that
          service&apos;s own terms. The same is true when a creator adds an ad
          pixel or asks us to send conversions to an ad platform from our
          server: the creator decides it, the platform receives it under its
          own terms, and the rules for when anything is sent at all are the
          ones in section 1, under ad measurement. So too when a creator
          downloads their buyers&apos; addresses for an ad audience and uploads
          them: that use is the creator&apos;s, under their own privacy notice.
        </p>
        <p>
          In practice this means a request about your data as a buyer — a copy
          of it, a correction, a deletion — is answered by the creator you
          bought from. Write to them first. If you write to us instead, we will
          pass it on and tell you we did.
        </p>
        <p>
          Two things stay ours in that situation: the security of the systems
          the data sits in, and the legal obligations we have to keep records
          of our own, such as fraud prevention and anything the law requires us
          to retain.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>We use cookies and similar technologies to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>keep you logged in;</li>
          <li>remember preferences;</li>
          <li>
            hold a call time or a limited item while a buyer pays, and let a
            buyer into what they bought;
          </li>
          <li>
            credit a sale to the affiliate who sent the buyer, on stores that
            run an affiliate program; and
          </li>
          <li>maintain security.</li>
        </ul>
        <p>
          Signing in sets a cookie named <code>nl_session</code> that keeps
          you logged in for up to 30 days; logging out removes it. Besides the
          short-lived cookies described in section 1, a
          creator&apos;s store may set these, each for that store alone: a pass
          that lets a
          browser into a course or a community, named <code>nl_learn_</code>{" "}
          followed by a code for the store, for 90 days; the code and time of
          an affiliate link a visitor followed, named <code>nl_via_</code>{" "}
          followed by the store&apos;s address, for up to 90 days; and an
          affiliate&apos;s own sign-in, named <code>nl_aff_</code> followed by
          the store&apos;s address, for 30 days. The ad pixels a creator may
          add are described in section 1 and are asked for first where the law
          says so. A creator&apos;s own browser keeps <code>nl_device</code>{" "}
          for 400 days and <code>nl_store</code> for a year, and{" "}
          <code>nl_pk</code> for five minutes while signing in with a
          passkey, as section 1 describes. Opening the Video calls page from
          our listing in Zoom&apos;s Marketplace sets <code>nl_zoom</code>{" "}
          for 30 days: it remembers only that the browser came to connect
          Zoom, so the Zoom option is still there after logging in.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling
          certain cookies may affect logging in or other features. Where required
          by law, we will request consent for non-essential cookies.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          Account and billing records are kept for as long as your account is
          active and as needed for tax, accounting, and legal purposes. Support
          emails are retained as long as
          needed to resolve your request and maintain a reasonable business
          record.
        </p>
        <p>
          The files a creator sells, their lessons&apos; videos and their
          podcast&apos;s episodes are kept until the creator removes them.
          Where a store&apos;s plan has ended and the store keeps more than a
          store with no plan may, they are deleted 30 days after the plan
          ended, after three emails to the store&apos;s owner (Terms of
          Service, section 8).
        </p>
        <p>
          A creator&apos;s list is kept for as long as their store exists, or
          until the creator, or the person on it, asks us to remove an address.
          A request for a free copy whose link is never used is deleted after
          7 days. An address that unsubscribed from a creator stays on that
          list, marked as unsubscribed, so it is never written to again; if you
          ask for it to be deleted entirely instead, it is.
        </p>
        <p>
          A community&apos;s posts, comments, pictures and member records are
          kept while the community exists, until the author or the creator
          deletes them. An affiliate program&apos;s records, license keys and
          the list of who holds them are kept with the store&apos;s records.
          Certificates are kept for good, so their pages keep proving what
          they say. Webhook deliveries are kept for up to seven days, and the
          mark that an event was sent for 30 days. A calendar reading is kept
          for up to six hours, and the calendar address until the creator
          removes it.
        </p>
        <p>
          A store&apos;s team, invitations and activity log are kept until the
          store is deleted, and invitations run out after seven days. Passkeys
          are kept until removed, and the record of the browsers an account
          signed in from until 400 days after its last sign-in. Email drafts are kept until
          sent or deleted. An email platform&apos;s key is kept until the
          creator disconnects it, each record of a person sent there for up to
          a week, and the mark that they were sent for 30 days. A device&apos;s
          notification address is kept until it is removed or turned off.
          Reviews are kept until their buyer deletes them or the creator
          deletes the product. A video room&apos;s address is kept for 60 days after
          its call.
        </p>
        <p>
          A live event and its list of who is coming are kept until the
          creator deletes the event once it is over or canceled, or until it
          makes room after 500 are kept; the record of each event email, for
          30 days. What an import from another platform sends us is deleted 14
          days after it began, except the contacts it added to a list, kept as
          the list is, what past buyers were given and the members invited to
          move, kept for as long as the store exists. A Google Calendar or Zoom connection is kept until the
          creator disconnects it or removes our app, each meeting&apos;s record
          until 60 days after the meeting, and a connection&apos;s problem log
          for 30 days.
        </p>
        <p>
          Creator research answers are kept for up to 24 months from the date
          you sent them, or until you ask us to delete them, whichever comes
          first. They are stored with our database provider (Upstash) on
          infrastructure used by our hosting provider (Vercel).
        </p>
        <p>
          Research outreach records (who we contacted, when, and any reply) are
          kept for up to 24 months from the last contact. If you ask us to
          stop, we keep only your name and contact detail on a do-not-contact
          list, so that we can respect your request.
        </p>
        <p>
          A creator&apos;s Outreach records are kept while their store exists,
          up to 400 at a time, the oldest unanswered ones making room for new
          ones. When a business asks a store, or every store, to stop, we keep
          its domain on that list for good, so that the request holds.
        </p>
      </LegalSection>

      <LegalSection title="7. International transfers">
        <p>
          Marktmorgen serves customers internationally. Your information may
          be processed in the countries where we and our service providers
          operate, which include the United States and may include the
          European Union. Where required, we use appropriate
          safeguards for cross-border transfers. Our database provider,
          Upstash, stores the records this policy describes under its Data
          Processing Addendum, which includes the EU Standard Contractual Clauses, the UK
          Addendum and the EU-U.S. Data Privacy Framework.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights, including under the GDPR">
        <p>
          Depending on your location, you may have the right to access the
          personal data we hold about you; correct inaccurate data; delete your
          data; restrict or object to certain processing; receive a copy of
          your data in a portable format; and withdraw consent where processing
          is based on consent.
        </p>
        <p>
          If you are in the European Economic Area or the United Kingdom, where
          the General Data Protection Regulation (GDPR) or the UK GDPR applies, or in another
          jurisdiction with similar laws, you may exercise these rights by
          emailing{" "}
          <a
            href="mailto:support@marktmorgen.com"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            support@marktmorgen.com
          </a>
          . We will respond within the time required by applicable law,
          typically one month under the GDPR. You also have the right to lodge
          a complaint with your local data protection authority.
        </p>
        <p>
          You may cancel your account and subscription at any time. Cancellation
          and refunds are described in our{" "}
          <Link
            href="/refunds"
            className="text-black underline underline-offset-2 hover:no-underline"
          >
            Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Children’s privacy">
        <p>
          The Services are not directed to children under 18. We do not
          knowingly collect personal information from children. If you believe
          a child has provided us with personal data, contact us and we will
          delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. Security">
        <p>
          We use reasonable technical and organizational measures to protect
          personal information. No method of transmission or storage is
          completely secure. You are responsible for keeping your email
          inbox and any passkeys you add secure, since they are how you sign
          in.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this Privacy Policy from time to time. The “Last
          updated” date at the top of this page will change when we do. We encourage you
          to review this page periodically.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
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
