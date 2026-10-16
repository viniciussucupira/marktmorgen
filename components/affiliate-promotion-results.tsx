import type { Book } from "@/lib/affiliates";
import { affiliatePromotionRows } from "@/lib/affiliate-promotion";
import { formatMoney } from "@/lib/money";

export function AffiliatePromotionResults({ book }: { book: Book }) {
  const complete = book.refundsChecked && book.invoicesChecked;
  if (!complete) return <section className="mt-8"><h2 className="text-lg font-semibold">Your posts and campaign links</h2><p className="st-muted mt-2 text-sm">Campaign earnings wait until the invoice and refund readings are complete.</p></section>;
  const rows = affiliatePromotionRows(book.lines);
  if (!rows.length) return null;
  return <section className="mt-8" aria-labelledby="affiliate-promotion-results">
    <h2 id="affiliate-promotion-results" className="text-lg font-semibold">Your posts and campaign links</h2>
    <p className="st-muted mt-2 text-sm">Recorded checkout or subscription campaign labels, not a reconstructed journey. Older or untagged purchases remain unlabelled. Records are purchases and renewals, not unique buyers or clicks. Commission is after recorded refunds, before payout.</p>
    <div className="mt-3 overflow-x-auto" role="region" tabIndex={0} aria-label="Commission by campaign and post">
      <table className="w-full text-left text-sm">
        <thead><tr><th scope="col" className="py-2">Channel</th><th scope="col" className="px-3">Campaign</th><th scope="col" className="px-3">Post / variant</th><th scope="col" className="px-3 text-right">Paid records</th><th scope="col" className="pl-3 text-right">Commission</th></tr></thead>
        <tbody>{rows.slice(0,50).map(row=><tr key={JSON.stringify([row.currency,row.promotion])} className="border-t" style={{borderColor:"var(--st-line)"}}>
          <td className="py-2">{row.promotion?.source || "Unlabelled"}</td><td className="px-3">{row.promotion?.campaign || "Unlabelled"}</td><td className="px-3">{row.promotion?.content || "Unlabelled"}</td><td className="px-3 text-right tabular-nums">{row.paidRecords.toLocaleString("en-US")}</td><td className="pl-3 text-right tabular-nums">{formatMoney(row.commission,row.currency)} <span className="st-muted">{row.currency.toUpperCase()}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="st-muted mt-2 text-xs">Showing {Math.min(50,rows.length)} of {rows.length} campaign groups. Currencies remain separate. Bonuses, partner shares and second-tier earnings stay in the earnings list below.</p>
  </section>;
}
