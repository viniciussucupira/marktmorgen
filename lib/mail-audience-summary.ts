/** Saved audience criteria, without claiming current membership or actual delivery. */
export type MailAudienceSelection = {
  who?: "all" | "buyers" | "leads";
  productId: string | null;
  notProductId?: string | null;
};

export function mailAudienceWords(audience: MailAudienceSelection, products: readonly { id: string; title: string }[]): string {
  const title = (id: string) => {
    const name = products.find(product => product.id === id)?.title.trim();
    return name ? "“" + name + "”" : "product with unavailable title (ID: " + id + ")";
  };
  const parts = [audience.who === "buyers" ? "Buyers eligible to receive emails" : audience.who === "leads" ? "People who have not bought and are eligible to receive emails" : "Everyone eligible to receive emails"];
  if (audience.productId) parts.push("only people who have " + title(audience.productId));
  if (audience.notProductId) parts.push("excluding people who have " + title(audience.notProductId));
  return parts.join("; ") + ".";
}
