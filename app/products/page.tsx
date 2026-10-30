import { permanentRedirect } from "next/navigation";

/**
 * This page listed Solrenning's products. Hazelsong is no longer offered and
 * Marktmorgen is this site, so the address now leads to the home page
 * (owner, 30 October 2026). Kept as a permanent redirect so links and search
 * results that still point here land somewhere useful instead of a 404.
 */
export default function ProductsPage() {
  permanentRedirect("/");
}
