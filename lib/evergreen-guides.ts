import type {BlogPost,BlogBlock} from "@/lib/blog";

/** Evergreen guides built from existing product behavior, not earnings forecasts. */
export const EVERGREEN_GUIDES:BlogPost[]=[
  {
    "slug": "plan-an-online-course-before-you-record",
    "title": "Plan an online course before you record it",
    "category": "Courses",
    "excerpt": "Turn a specific teaching promise into lessons, access rules, practice and a buyer support plan before recording a library.",
    "kicker": "Course planning and delivery",
    "from": "#145b67",
    "to": "#313080",
    "faq": [
      {
        "q": "Do I need to record every lesson before describing the course?",
        "a": "You need an honest description of what exists, what a buyer receives and any release schedule. Do not describe unfinished material as immediately available."
      },
      {
        "q": "Does a course certificate prove a professional qualification?",
        "a": "A completion certificate records the configured course requirements. It does not establish an accredited qualification or guarantee a learner's outcome."
      },
      {
        "q": "Can anyone with a lesson link open paid material?",
        "a": "A paid lesson still uses the store's purchase or membership access checks. Test both an allowed learner and a person without access in a synthetic environment."
      }
    ],
    "body": [
      {
        "type": "p",
        "text": "A course starts with a teaching decision: what should a learner be able to attempt after one useful section? That question is more concrete than how many hours of video you can record. A long library with no route through it gives the buyer more material to organize. Begin with one audience, one starting point and one task you can actually teach. Write the boundaries as carefully as the promise: required tools, prior knowledge, language and what the course will not cover."
      },
      {
        "type": "h2",
        "text": "Build the course around a worked task"
      },
      {
        "type": "p",
        "text": "For a spreadsheet course, a useful task could be organizing a small stock list and checking a reorder column. That is an example of scope, not a claim about what your buyers will achieve. List the decisions a learner must make, then turn each decision into a lesson with an example and a small exercise. Keep reference material separate from the main route so a returning learner can find a formula without replaying an introduction."
      },
      {
        "type": "steps",
        "items": [
          {
            "title": "Write the starting point",
            "text": "Describe what the learner already needs: the relevant software, a practice file and the ability to open it. If an example requires a paid external tool, disclose that before checkout."
          },
          {
            "title": "Choose a checkable piece of work",
            "text": "Show the expected shape of the exercise, the inputs provided and a way to compare the learner's work. A quiz can check an answer; it cannot demonstrate every practical skill."
          },
          {
            "title": "Map the lessons",
            "text": "Put the prerequisite before the task that depends on it. Name lessons by the work they help a learner do, then add optional background or reference sections."
          },
          {
            "title": "Review a complete sample",
            "text": "Follow one lesson on a phone and a computer. Check that the video, text, supporting file and exercise all refer to the same version of the example."
          }
        ]
      },
      {
        "type": "h2",
        "text": "Separate material, access and personal support"
      },
      {
        "type": "p",
        "text": "The content is only one part of the offer. A buyer also needs to know when access begins, whether lessons release at once or over time, how long access lasts, and what happens if the course is connected to a membership. A scheduled lesson and an available lesson are different states. Describe the release pattern in the sales page and confirm it in the course configuration rather than relying on a welcome message to explain it later."
      },
      {
        "type": "p",
        "text": "Personal feedback is a separate commitment. State whether you review exercises, where questions go and what kind of response the purchase includes. Do not imply that a course contains private coaching merely because there is a contact form. If you offer a paid call alongside the material, show its booking terms separately. Keep learner records and submitted work within the store's access and privacy controls."
      },
      {
        "type": "h2",
        "text": "Test the learner's route, including the closed doors"
      },
      {
        "type": "ul",
        "items": [
          "Open the introduction as an entitled learner and confirm that the correct supporting file arrives.",
          "Try a lesson that is not released yet and check that the page explains the state without exposing the material.",
          "Check a person without purchase access. A copied URL must not act as an entitlement.",
          "For membership access, use synthetic active and ended states. Do not cancel a real learner's subscription as a test.",
          "Check captions or text alternatives you actually provide, readable exercise files and keyboard access to lesson controls."
        ]
      },
      {
        "type": "p",
        "text": "Marktmorgen's existing course access uses payment or membership records and a proved learner address. Opening a lesson is not a public SEO page: it must keep those checks. The public course page should explain the material, prerequisites and access terms without revealing private student records. A completion certificate should say what it records; it should not be described as a regulated qualification without separate evidence."
      },
      {
        "type": "h2",
        "text": "Publish an offer you can maintain"
      },
      {
        "type": "p",
        "text": "Before making the offer available, keep a simple maintenance note: which software version the example uses, which file is current and how buyers can report a broken lesson. When you update an exercise, check the related quiz and reference material too. Prefer one coherent example over several versions that contradict each other. None of this predicts demand; it makes the work and access a buyer is choosing easier to inspect."
      },
      {
        "type": "links",
        "items": [
          {
            "label": "Course features and requirements",
            "href": "/platform/courses"
          },
          {
            "label": "Quizzes and completion certificates",
            "href": "/platform/quizzes-and-certificates"
          },
          {
            "label": "Offer a separate paid session",
            "href": "/platform/calls"
          },
          {
            "label": "Plan ongoing membership access",
            "href": "/blog/plan-a-membership-you-can-deliver"
          }
        ]
      }
    ],
    "date": "2026-10-20",
    "readMinutes": 4
  },
  {
    "slug": "plan-a-membership-you-can-deliver",
    "title": "Plan a membership you can keep delivering",
    "category": "Community",
    "excerpt": "Separate the recurring promise, access period, renewal terms and cancellation route before inviting people into an ongoing offer.",
    "kicker": "An ongoing offer with clear boundaries",
    "from": "#1f6b53",
    "to": "#145b67",
    "faq": [
      {
        "q": "Is a membership the same as a one-time course purchase?",
        "a": "No. A membership has recurring terms and an access period. A one-time purchase and recurring access should be described separately."
      },
      {
        "q": "Can I promise that members will stay or get a financial result?",
        "a": "No. Explain the material, access and support you provide. Retention and individual outcomes are not guaranteed by a membership feature."
      },
      {
        "q": "Should a free email sign-up automatically become paid membership?",
        "a": "No. An email opt-in is not agreement to a recurring payment. The buyer must review and accept the paid terms through the supported checkout."
      }
    ],
    "body": [
      {
        "type": "p",
        "text": "A membership is a promise you repeat. Before choosing a monthly theme or a community name, list what must still happen when the first launch is over: preparing material, answering the questions included in the offer, moderating the space and maintaining access. Separate those commitments from optional extras. An offer that depends on you being available every hour is different from a library with a scheduled discussion."
      },
      {
        "type": "h2",
        "text": "Define a repeatable unit of value"
      },
      {
        "type": "p",
        "text": "Take a drawing practice group as an example. Its recurring unit could be a new exercise and a scheduled group discussion, with a library of earlier exercises while membership remains active. That describes a format, not an improvement guarantee. State whether individual critique is included, how work is submitted and whether there is a limit on what you review. A vague promise of unlimited support can create a commitment that the delivery plan does not support."
      },
      {
        "type": "steps",
        "items": [
          {
            "title": "Write the recurring offer",
            "text": "Name the material or activity, its release pattern and the support included. Separate a promised live event from an optional informal conversation."
          },
          {
            "title": "Set access boundaries",
            "text": "Explain what opens when membership starts, what remains available between releases and what changes when the membership ends. Keep access wording consistent with the configured product."
          },
          {
            "title": "Explain the recurring payment",
            "text": "State the amount, currency, interval and any eligible trial or introductory conditions. A monthly equivalent of an annual bill is not a monthly purchase price."
          },
          {
            "title": "Make leaving understandable",
            "text": "Point members to the existing cancellation and access information. A retention offer must be a real choice, with a clear way to continue the cancellation."
          }
        ]
      },
      {
        "type": "h2",
        "text": "Plan the community work separately"
      },
      {
        "type": "p",
        "text": "A discussion space needs more than an empty feed. Write a short welcome that tells a member where to start, where a question belongs and what is suitable to post. Define the moderation boundaries and the route for reporting a problem. Avoid promising a particular level of participation: a community feature can hold a conversation, but it cannot guarantee that people contribute."
      },
      {
        "type": "p",
        "text": "If live sessions are part of the membership, describe their schedule and the replay policy only as they are actually configured. Do not call an event recording a permanent library item unless that is the access you provide. A member may join in another time zone or need a text alternative, so check whether the information they need is available without attending at a particular hour."
      },
      {
        "type": "h2",
        "text": "Keep marketing consent distinct from membership access"
      },
      {
        "type": "p",
        "text": "A recurring purchase does not give blanket permission for every marketing message. Keep the buyer's delivery or account notices distinct from promotional email, and respect the store's existing consent settings. Exported addresses are not a new permission source. If you create a members-only promotion, explain who can receive it and what is being offered rather than assuming every member asked to hear about another product."
      },
      {
        "type": "h2",
        "text": "Review the first complete access cycle"
      },
      {
        "type": "ul",
        "items": [
          "Use synthetic records to check a new member's starting page, available material and renewal wording.",
          "Check an ended-access state without changing a real buyer's account. The page should explain the relevant next step.",
          "Follow the cancellation route and distinguish stopping a future renewal from any refund policy.",
          "Check what happens to a member's posts and account data under the published privacy and community rules.",
          "Review the workload you promised against the material and moderation process you can actually maintain."
        ]
      },
      {
        "type": "p",
        "text": "Measure the records you have rather than turning one good week into a retention claim. A renewal total does not explain why somebody stayed, and a cancellation reason is what that person chose to tell you. Keep changes small enough that you can review them: clarify one onboarding step, fix a broken exercise or make an access rule easier to find. The goal is a coherent recurring offer, not a promised retention percentage."
      },
      {
        "type": "links",
        "items": [
          {
            "label": "Membership configuration and terms",
            "href": "/platform/memberships"
          },
          {
            "label": "Community access and moderation",
            "href": "/platform/community"
          },
          {
            "label": "Live events and replay scope",
            "href": "/platform/live-events"
          },
          {
            "label": "Plan a course inside the offer",
            "href": "/blog/plan-an-online-course-before-you-record"
          }
        ]
      }
    ],
    "date": "2026-10-20",
    "readMinutes": 4
  },
  {
    "slug": "sell-paid-sessions-with-clear-booking-terms",
    "title": "Sell paid sessions with clear booking terms",
    "category": "Getting started",
    "excerpt": "Define the session, availability, time zone, payment and rescheduling rules before publishing a calendar.",
    "kicker": "A booking is a delivery commitment",
    "from": "#6d4aff",
    "to": "#303d80",
    "faq": [
      {
        "q": "Does showing a time mean a booking is paid and confirmed?",
        "a": "No. Availability, payment and booking confirmation are separate states. Use the supported confirmation flow and check the final booking record."
      },
      {
        "q": "Can I promise any meeting provider will work for every booking?",
        "a": "No. Meeting links depend on the provider, connection and existing booking rules. State the format you can actually provide and review connection failures."
      },
      {
        "q": "Can a session package ignore the original purchase terms?",
        "a": "No. State the session count, expiry if any, and booking rules before purchase. Existing buyers keep the terms attached to what they bought."
      }
    ],
    "body": [
      {
        "type": "p",
        "text": "A paid session sells time and a defined piece of work. Start with what the buyer brings and what happens during the appointment. For a portfolio review, that might mean a fixed-length discussion of a submitted selection, followed by the notes you explicitly include. It does not automatically include unlimited revisions, written consulting or a guaranteed job outcome. A calendar cannot repair an unclear scope after the buyer has paid."
      },
      {
        "type": "h2",
        "text": "Describe the session before the calendar"
      },
      {
        "type": "p",
        "text": "Write a short agenda and a preparation list. If you need a file or a question before the meeting, explain when and how the buyer provides it. Keep personal information limited to what the session needs. A preparation form should not become a request for sensitive information simply because a field can be added. Tell the buyer what they receive afterward, and avoid implying that a recording is included unless you actually provide one with the necessary consent."
      },
      {
        "type": "steps",
        "items": [
          {
            "title": "Choose the format",
            "text": "Distinguish a private appointment from a group session or a scheduled live event. State the duration and the number of people the offer is for."
          },
          {
            "title": "Set workable availability",
            "text": "Configure the time zone, working periods and notice rules you can honor. Leave room for preparation and overruns rather than publishing every gap in your day."
          },
          {
            "title": "State the change policy",
            "text": "Explain the supported rescheduling route and the cancellation or refund terms that apply. Do not promise a change rule the booking system cannot perform."
          },
          {
            "title": "Check payment and confirmation",
            "text": "Follow the provider's synthetic flow, then inspect the booking record and delivery of the meeting information. A successful calendar click is not proof of a paid booking."
          }
        ]
      },
      {
        "type": "h2",
        "text": "Treat time zones as part of the offer"
      },
      {
        "type": "p",
        "text": "A buyer should understand the appointment in their own context while you keep the schedule in the time zone you configured. Check a synthetic booking from another zone and review the displayed date as well as the hour. Daylight-saving transitions and a buyer's travel can make an informal message ambiguous. Refer to the booking's stated time and zone rather than replacing the record with a casually converted hour."
      },
      {
        "type": "h2",
        "text": "Connect calendars and meeting providers carefully"
      },
      {
        "type": "p",
        "text": "A connected calendar can help exclude busy periods that the integration can read. It is still a connection with a state: a missing feed, stale connection or unsupported calendar detail must not be described as a complete view of your life. Review the relevant provider and booking requirements before offering a time. Keep a clear support route for a buyer whose meeting link has not been created."
      },
      {
        "type": "p",
        "text": "If the session uses a provider-created meeting, check the actual connection and failure behavior. If you use your own room link, make sure it is the right one for the offer. Do not expose another buyer's private appointment details. The fact that a provider appears in a feature page does not mean it is configured on your store or that every account is eligible for every option."
      },
      {
        "type": "h2",
        "text": "Packages need their own plain-language terms"
      },
      {
        "type": "p",
        "text": "Several sessions sold together introduce another decision: how the buyer uses them. State how many sessions the package contains, whether there is an expiry and which scheduling rules still apply. Keep an existing buyer's purchased terms intact when you later edit the package. Do not treat an unused session as a completed appointment or an expired allowance as a new payment."
      },
      {
        "type": "ul",
        "items": [
          "Check a phone-sized calendar and keyboard navigation before publishing the offer.",
          "Use synthetic details to inspect unavailable and conflicting times as well as a successful booking.",
          "Verify the meeting information in the final confirmation, without creating a real external appointment for a test.",
          "Keep the session scope, rescheduling instructions and support route beside the product terms.",
          "Separate paid appointments from any course, membership or follow-up product that has different access conditions."
        ]
      },
      {
        "type": "p",
        "text": "After launch, distinguish booked appointments, completed sessions and paid amounts. They answer different questions. A full calendar does not establish profit once preparation, provider fees, refunds and taxes are considered, and a quiet week does not identify a cause by itself. Use actual booking and payment records to decide what needs clarification; do not replace missing evidence with a forecast."
      },
      {
        "type": "links",
        "items": [
          {
            "label": "Paid call and booking features",
            "href": "/platform/calls"
          },
          {
            "label": "Calendar connection requirements",
            "href": "/platform/calendar-sync"
          },
          {
            "label": "Memberships and recurring access",
            "href": "/platform/memberships"
          },
          {
            "label": "Store setup and availability",
            "href": "/signin"
          }
        ]
      }
    ],
    "date": "2026-10-20",
    "readMinutes": 4
  },
  {
    "slug": "start-a-creator-affiliate-program-with-clear-terms",
    "title": "Start a creator affiliate program with clear terms",
    "category": "Marketing and audience",
    "excerpt": "Define the offer, disclosure, attribution and payout responsibilities before asking a partner to promote a product.",
    "kicker": "A relationship with inspectable terms",
    "from": "#8d3352",
    "to": "#56347b",
    "faq": [
      {
        "q": "Is a tracked link a guarantee that an affiliate caused a sale?",
        "a": "No. It records the attribution available under the program's rules. Consent, coupons, missing tags and the configured attribution window affect what can be recorded."
      },
      {
        "q": "Can I describe pending commission as paid earnings?",
        "a": "No. Keep pending, cleared, refunded and paid states distinct. A calculated commission or payout reminder is not proof that money reached the affiliate."
      },
      {
        "q": "May an affiliate invent customer results to promote my product?",
        "a": "No. Give partners the actual product facts, permitted materials and a clear commission disclosure. Do not supply invented testimonials or guaranteed outcome claims."
      }
    ],
    "body": [
      {
        "type": "p",
        "text": "An affiliate program lets another person promote a specific offer under agreed terms. The first job is deciding whether you can explain that relationship clearly: what the product contains, who it is for, what a buyer pays and when a partner becomes entitled to a commission. A link by itself does not answer those questions. Start with a small set of product facts and program terms that both sides can inspect."
      },
      {
        "type": "h2",
        "text": "Define the product and the responsibility"
      },
      {
        "type": "p",
        "text": "A partner needs to know the actual product, not just a promise of a percentage. Give them a description of the delivered files, lessons, access or session, along with the current product page. State which claims and images they may use. A permission to promote a product is not permission to reuse a buyer's identity, private message or result. If you do not have evidence for a result claim, do not put it in the promotional materials."
      },
      {
        "type": "steps",
        "items": [
          {
            "title": "Choose the eligible offer",
            "text": "Select real products and write down their current terms. Explain whether different product types, renewals or special prices have different commission treatment."
          },
          {
            "title": "State the commission conditions",
            "text": "Describe the basis used, the clearing process, refund treatment and who funds and pays the affiliate. Keep the amount owed distinct from a payout completed."
          },
          {
            "title": "Prepare accurate materials",
            "text": "Supply accurate product facts and a visible statement of the affiliate relationship. Do not make the partner create urgency or testimonials that the product cannot support."
          },
          {
            "title": "Review the attribution path",
            "text": "Use synthetic tagged links or assigned coupons to check the record produced. Keep cookie consent and the existing attribution rules in place rather than treating tracking as unconditional."
          }
        ]
      },
      {
        "type": "h2",
        "text": "Explain what tracking can establish"
      },
      {
        "type": "p",
        "text": "A checkout may carry a link tag, a coupon or another attribution record supported by the program. Those records are useful, but they are not a complete history of why a person bought. A buyer can arrive on more than one device, decline tracking or return without a tag. Explain the rule used to credit the record and leave unknown attribution unknown. Do not repair a missing record with an invented story about the buyer's journey."
      },
      {
        "type": "p",
        "text": "Keep campaign names practical: a product, a channel and a particular piece of material are easier to review than several unrelated promotions sharing one label. If a partner has more than one campaign link, clarify whether the reporting describes the checkout record or a later subscription payment. A missing label on older activity is a limitation to explain, not a reason to move revenue into a convenient campaign."
      },
      {
        "type": "h2",
        "text": "Make payout status understandable"
      },
      {
        "type": "p",
        "text": "Refunds and disputes can change what is payable. Your program terms should explain the clearing process and the information needed for payment. A payout scheduled by a tool, a reminder to the creator and a payment confirmed by a provider are different events. Show the state the system actually knows. Do not describe a pending commission as money the partner has received."
      },
      {
        "type": "p",
        "text": "Marktmorgen creators fund and pay their own affiliates under their program terms. This is separate from the platform's own pricing and any referral program. Optional payout providers have their own configuration and cost conditions. Review those conditions before enabling an operation; a percentage on a settings page does not certify your net margin after processing, refunds, taxes and all other costs."
      },
      {
        "type": "h2",
        "text": "Review the relationship before expanding it"
      },
      {
        "type": "ul",
        "items": [
          "Read the product page and partner materials side by side; correct any claim that changed with the offer.",
          "Check that a commission disclosure is visible where the promotion is made.",
          "Use synthetic records to follow a credited sale, a refund and a pending payout state without sending a real payment.",
          "Confirm that exported records and partner access reveal only the information their role is allowed to see.",
          "Review the actual attributed records and the workload before adding more partners. No link feature guarantees a supply of buyers."
        ]
      },
      {
        "type": "p",
        "text": "A useful program can be small and clear. The product, attribution rule, permitted materials and payment responsibility should remain understandable when somebody returns after a month away. Improve an unclear term or a broken link before turning one attributed purchase into a claim about future earnings. The program is an agreement and a reporting process, not an income forecast."
      },
      {
        "type": "links",
        "items": [
          {
            "label": "Affiliate features and payout scope",
            "href": "/platform/affiliates"
          },
          {
            "label": "Recorded sales and attribution",
            "href": "/platform/insights"
          },
          {
            "label": "Campaign workflow",
            "href": "/grow-sales"
          },
          {
            "label": "Plan the product page first",
            "href": "/blog/product-page-that-sells-a-file"
          }
        ]
      }
    ],
    "date": "2026-10-20",
    "readMinutes": 4
  }
];
export const DIGITAL_FILE_GUIDE_EXTRA:BlogBlock[]=[
  {
    "type": "h2",
    "text": "Check the file a buyer will actually receive"
  },
  {
    "type": "p",
    "text": "Keep one version of the deliverable that matches the product description. Open the actual file on the devices and software you say it supports; do not test only the editable source you used to create it. If the download contains several files, give them useful names and include a short starting note. Explain any external software, printing requirement or license boundary before purchase, especially when the buyer cannot inspect the complete file in advance."
  },
  {
    "type": "h2",
    "text": "Walk through failure as well as delivery"
  },
  {
    "type": "steps",
    "items": [
      {
        "title": "Use the supported test environment",
        "text": "Check the complete product, checkout confirmation and access route with synthetic details and a test payment method. Do not use a real customer's purchase as a test fixture."
      },
      {
        "title": "Check access from another browser",
        "text": "Follow the existing purchase-access process instead of assuming that a copied file URL is a permanent login. A buyer needs a clear way to return without exposing another person's record."
      },
      {
        "title": "Inspect the no-access states",
        "text": "Check an unpaid or incomplete checkout, a missing file and the relevant refund state. An error should explain the next step without claiming that an unconfirmed payment succeeded."
      },
      {
        "title": "Review the public description",
        "text": "Make sure the format, included material, compatibility and support terms still match the delivered version. A thumbnail or example image is not the complete product."
      }
    ]
  },
  {
    "type": "h2",
    "text": "Keep the offer and the ongoing work separate"
  },
  {
    "type": "p",
    "text": "A paid file can be a complete one-time deliverable. It does not automatically include future custom work, private lessons or unlimited updates. If you provide revisions or a support period, state what that means in concrete terms. Keep a route for reporting a corrupt file or inaccessible format, and describe the actual refund policy without inventing a guarantee of the buyer's results."
  },
  {
    "type": "p",
    "text": "When reviewing the offer later, keep visits, paid orders, refunds and costs separate. A download count is not a new sale, and the price paid is not net profit. Use the records your store actually has rather than adding an estimated conversion result to a product page. If an example or testimonial belongs to another person, obtain the necessary permission before presenting it as evidence."
  },
  {
    "type": "links",
    "items": [
      {
        "label": "Instant delivery and access requirements",
        "href": "/platform/instant-delivery"
      },
      {
        "label": "Product page features",
        "href": "/platform/sales-pages"
      },
      {
        "label": "Plan an online course",
        "href": "/blog/plan-an-online-course-before-you-record"
      },
      {
        "label": "Paid sessions with booking terms",
        "href": "/blog/sell-paid-sessions-with-clear-booking-terms"
      }
    ]
  }
];
export const DIGITAL_FILE_GUIDE_FAQ=[
  {
    "q": "Does a download count prove a new sale?",
    "a": "No. A buyer may return to a purchase. Read paid orders, access events and refunds as different records."
  },
  {
    "q": "Should I promise a buyer a result from using my file?",
    "a": "Describe the file's real contents, format, compatibility and support. Do not turn a product description into an unsupported outcome guarantee."
  },
  {
    "q": "Can I test the product without a real payment?",
    "a": "Use the supported synthetic environment and payment-provider test mode. Check confirmation and delivery without charging a real card or changing a real buyer's account."
  }
];
export const CREATOR_GUIDE_SLUGS=["sell-a-digital-file-from-your-bio","plan-an-online-course-before-you-record","plan-a-membership-you-can-deliver","sell-paid-sessions-with-clear-booking-terms","start-a-creator-affiliate-program-with-clear-terms"] as const;
