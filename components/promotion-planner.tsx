"use client";

import { useId, useRef, useState } from "react";
import type { StatsData } from "@/lib/stats";
import { promotionChoices, promotionLink, promotionMedium, type PromotionProduct, type PromotionWindow } from "@/lib/promotion-plan";
import { CAMPAIGN_MEDIA, POST_PLACES, type CampaignMedium } from "@/lib/share-links";
import { formatMoney } from "@/lib/money";
import { channelName } from "@/lib/channel-names";
import { copyCampaignLink } from "@/lib/campaign-copy";

export function PromotionPlanner({ data, range, products }: { data: StatsData; range: PromotionWindow; products: PromotionProduct[] }) {
  const id = useId();
  const plan = promotionChoices(data, range, products);
  const [selected, setSelected] = useState("");
  const [source, setSource] = useState("");
  const [campaign, setCampaign] = useState("promotion-" + (data.days.at(-1)?.date ?? range));
  const [mediumOverride, setMediumOverride] = useState<CampaignMedium | null>(null);
  const [variant, setVariant] = useState("");
  const [copied, setCopied] = useState("");
  const linkInput = useRef<HTMLInputElement>(null);
  const copyRequest = useRef(0);
  const product = plan.products.find(item => item.id === selected) ?? plan.products[0];
  const channel = source || plan.channel;
  const medium = promotionMedium(channel, mediumOverride);
  const link = product ? promotionLink(product, channel, campaign, medium, variant) : "";
  if (!product) return null;
  async function copy() {
    if (!link) return;
    const request = ++copyRequest.current;
    const result = await copyCampaignLink(link, () => request === copyRequest.current ? linkInput.current : null, text => navigator.clipboard.writeText(text));
    if (request !== copyRequest.current || result === "stale" || linkInput.current?.value !== link) return;
    setCopied(result === "copied" ? link : result === "selected" ? "selected:" + link : "failed:" + link);
  }
  return <section className="mt-5 rounded-[16px] bg-gradient-to-br from-violet-50 to-emerald-50 p-4 ring-1 ring-line" aria-labelledby={id + "-title"}>
    <h3 id={id + "-title"} className="text-sm font-bold text-ink">Prepare your next promotion</h3>
    <p className="mt-1 text-sm text-ink-soft">Choose a product and copy a campaign link without leaving your numbers. Nothing is posted or sent for you.</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-ink-soft" htmlFor={id + "-product"}>Product
        <select id={id + "-product"} className="field mt-1 w-full" value={product.id} onChange={event => { setSelected(event.target.value); setCopied(""); }}>
          {plan.products.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-ink-soft" htmlFor={id + "-channel"}>Where you will share it
        <select id={id + "-channel"} className="field mt-1 w-full" value={channel} onChange={event => { setSource(event.target.value); setCopied(""); }}>
          {POST_PLACES.map(place => <option key={place.place} value={place.place}>{place.label}</option>)}
        </select>
      </label>
    </div>
    <p className="mt-2 text-xs text-ink-soft">{plan.known ? "Products are ordered by recorded gross revenue, then page views." : "Paid figures are unavailable. Products are ordered by page views."} This list includes up to 50 published products with recorded activity, not your entire catalog.</p>
    <p className="mt-1 text-xs text-ink-soft">{product.figures ? <>
      {product.figures.views.toLocaleString("en-US")} page views
      {plan.known ? " · " + formatMoney(product.figures.cents, data.currency) + " gross revenue" : ""} in the selected period.
    </> : "No product figures are available in this period."} {plan.channelEvidence ? <>The suggested channel, {channelName(plan.channel)}, is based on store-wide {plan.channelBasis === "sales" ? "gross revenue" : "visits"}; it does not prove this product sold through that channel.</> : "No channel is suggested by measured results; Instagram is the editable starting choice."}</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-ink-soft" htmlFor={id + "-campaign"}>Campaign name
        <input id={id + "-campaign"} className="field mt-1 w-full" maxLength={60} value={campaign} onChange={event => { setCampaign(event.target.value); setCopied(""); }} />
      </label>
      <label className="text-xs font-semibold text-ink-soft" htmlFor={id + "-medium"}>Promotion type
        <select id={id + "-medium"} className="field mt-1 w-full" value={medium} onChange={event => { setMediumOverride(event.target.value as CampaignMedium); setCopied(""); }}>
          {CAMPAIGN_MEDIA.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-ink-soft" htmlFor={id + "-variant"}>Post or ad variant (optional)
        <input id={id + "-variant"} className="field mt-1 w-full" maxLength={60} value={variant} onChange={event => { setVariant(event.target.value); setCopied(""); }} />
      </label>
    </div>
    <label className="mt-3 block text-xs font-semibold text-ink-soft" htmlFor={id + "-link"}>Your campaign link
      <input ref={linkInput} id={id + "-link"} aria-describedby={id + "-copy-status"} className="field mt-1 w-full" readOnly value={link} onFocus={event => event.currentTarget.select()} />
    </label>
    {!link ? <p className="mt-1 text-xs text-ink-soft">Enter a campaign name with letters or numbers to create the link.</p> : null}
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" className="btn btn-primary" disabled={!link} onClick={() => void copy()}>Copy campaign link</button>
      <button type="button" className="btn btn-secondary" onClick={() => document.getElementById("numbers-posts")?.scrollIntoView({ behavior: "smooth", block: "start" })}>See campaign results</button>
    </div>
    <p id={id + "-copy-status"} className="mt-2 text-xs text-ink-soft" role="status">{copied === link && link ? "Campaign link copied." : copied === "selected:" + link ? "The campaign link is selected. Copy it using your keyboard or device menu." : copied === "failed:" + link ? "Select the campaign link above and copy it." : "Share this link, then review its recorded visits and payments in Campaigns. Results are not guaranteed; gross revenue excludes refunds, fees and other costs."}</p>
  </section>;
}
