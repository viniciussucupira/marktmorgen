/** Shared pure rules. No server operations or private configuration. */
import type { Product } from "./catalog";
export type { Product } from "./catalog";
export { MAX_PRODUCTS, MAX_SUMMARY_LENGTH, MAX_TITLE_LENGTH } from "./catalog-rules";
export const MAX_NAME_LENGTH = 60;

export const MAX_BIO_LENGTH = 160;

export const MAX_ADDRESSES = 10;

export function isFree(product: Pick<Product, "priceCents">): boolean {
  return product.priceCents === 0;
}

export type StoreJoin = { on: boolean; heading: string; line: string };

export const MAX_JOIN_HEADING = 60;

export const MAX_JOIN_LINE = 200;

export function parseJoin(raw: unknown): StoreJoin {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const line = (text: unknown, max: number) => (typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, max) : "");
  return { on: value.on === true, heading: line(value.heading, MAX_JOIN_HEADING), line: line(value.line, MAX_JOIN_LINE) };
}
