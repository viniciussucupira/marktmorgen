"use client";

import { usePathname } from "next/navigation";

const products = [
  [
    "Hazelsong",
    "https://hazelsong.com/",
    "Collect customer testimonials for your business."
  ]
];

export default function MoreFromUs() {
  const pathname = usePathname() || "/";
  // Keep purchase, account, recovery, and customer-facing flows focused.
  if (/^\/(checkout|subscription|restore|access|activate|signin|sign-in|welcome|join|team|studio|dashboard|start|thanks|success|recover|f|s|wall|embed|add|save)(\/|$)/.test(pathname) || pathname === "/products") return null;

  return (
    <nav aria-label="More from us" style={{ borderTop: "1px solid currentColor", padding: "20px 0", marginTop: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600 }}>More from us</h2>
        <a href="https://marktmorgen.com/products" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 13, textDecoration: "underline", textUnderlineOffset: 4 }}>Explore all our products <span aria-hidden="true" style={{ marginLeft: 6 }}>→</span></a>
      </div>
      <ul className="grid grid-cols-1 gap-x-7 gap-y-2 sm:grid-cols-2 lg:grid-cols-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {products.map(([name, href, description]) => (
          <li key={href}>
            <a href={href} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ display: "block", minHeight: 44, padding: "6px 0", fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>{name} <span aria-hidden="true">↗</span></span>
              <span style={{ display: "block", opacity: 0.8 }}>{description}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
