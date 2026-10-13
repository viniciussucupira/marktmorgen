"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";

type MenuItem = {
  label: string;
  description: string;
  href: string;
  icon: IconName;
};

type Menu = {
  id: string;
  label: string;
  blurb: string;
  feature: { title: string; body: string; href: string; cta: string };
  items: MenuItem[];
  /** A long menu, shown in labelled columns. Its items are the groups' items. */
  groups?: { label: string; items: MenuItem[] }[];
};

const item = (label: string, description: string, href: string, icon: IconName): MenuItem => ({ label, description, href, icon });

/* The feature pages, in the groups the features page uses. */
const PRODUCT_GROUPS: { label: string; items: MenuItem[] }[] = [
  {
    label: "Sell",
    items: [
      item("Store page", "Your photo, links and products at one address.", "/platform/store-page", "store"),
      item("Price options", "Up to three prices on one product.", "/platform/price-options", "tag"),
      item("Courses", "Video lessons that open over time.", "/platform/courses", "book"),
      item("Memberships", "Paid every week, month or year.", "/platform/memberships", "repeat"),
      item("Paid calls", "Booked in their time zone, paid first.", "/platform/calls", "calendar"),
    ],
  },
  {
    label: "Get paid",
    items: [
      item("Your own Stripe", "The money lands in your account.", "/platform/your-stripe", "bank"),
      item("Checkout tools", "Codes, add-ons, instalments, tax.", "/platform/checkout", "percent"),
    ],
  },
  {
    label: "Deliver and grow",
    items: [
      item("Instant delivery", "On screen when paid, back by email.", "/platform/instant-delivery", "bolt"),
      item("Numbers and pixels", "Visits, sources, sales, ad pixels.", "/platform/insights", "chart"),
      item("Email to your list", "Broadcasts and sequences. Pro.", "/platform/email", "mail"),
      item("Your own domain", "shop.yourname.com. Pro.", "/platform/domain", "globe"),
    ],
  },
];

export const MENUS: Menu[] = [
  {
    id: "product",
    label: "Product",
    blurb: "Everything a link-in-bio store needs, each with its own page and its honest limits.",
    feature: {
      title: "The live demo store",
      body: "Pick a plan, pay with a Stripe test card, get the file. The same path your buyer takes.",
      href: "/demo",
      cta: "Open the demo",
    },
    items: PRODUCT_GROUPS.flatMap((g) => g.items),
    groups: PRODUCT_GROUPS,
  },
  {
    id: "creators",
    label: "Creators",
    blurb: "For people who sell what they know.",
    feature: {
      title: "Tell us what you sell",
      body: "Eight questions, two minutes. We read every answer and build from them.",
      href: "/creators",
      cta: "Answer the questions",
    },
    items: [
      {
        label: "Coaches and teachers",
        description: "Worksheets, programmes, paid calls.",
        href: "/for/coaches",
        icon: "cap",
      },
      {
        label: "Cooks and nutritionists",
        description: "Meal plans, grocery lists, recipe packs.",
        href: "/for/cooks",
        icon: "utensils",
      },
      {
        label: "Fitness creators",
        description: "Programmes, challenges, form checks.",
        href: "/for/fitness",
        icon: "dumbbell",
      },
      {
        label: "Designers and photographers",
        description: "Presets, templates, brush packs.",
        href: "/for/designers",
        icon: "palette",
      },
    ],
  },
  {
    id: "why",
    label: "Why Nimbus",
    blurb: "See it working, and see the numbers, before you believe a word.",
    feature: {
      title: "Compared with Stan",
      body: "Side by side, row by row, with the date each row was checked.",
      href: "/proof/compare",
      cta: "See the comparison",
    },
    items: [
      {
        label: "Feature by feature",
        description: "Everything Stan has, and where we stand on each.",
        href: "/proof/everything",
        icon: "list",
      },
      {
        label: "Compared with Gumroad",
        description: "What 10% of every sale costs over a year.",
        href: "/proof/gumroad",
        icon: "calculator",
      },
      {
        label: "Compared with Beacons",
        description: "What their 9% costs, and when they win.",
        href: "/proof/beacons",
        icon: "scale",
      },
      {
        label: "Speed test",
        description: "Why a slow store costs you sales.",
        href: "/proof/speed",
        icon: "gauge",
      },
      {
        label: "What we never do",
        description: "Our answer to what creators complain about.",
        href: "/proof/promises",
        icon: "handshake",
      },
      {
        label: "Our mission",
        description: "Who builds this, and what is still missing.",
        href: "/mission",
        icon: "target",
      },
    ],
  },
];

const PLAIN_LINKS = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByClick = useRef(false);

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) toggleRef.current?.focus();
        closeAll();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [closeAll, drawerOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    if (drawerOpen) drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const hoverOpen = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (window.matchMedia("(hover: hover)").matches) {
      openedByClick.current = false;
      setOpenMenu(id);
    }
  };

  // A pointer that hovers already opened the panel, so the first click must
  // not close it again. Only a click on an open, click-opened panel closes it.
  const clickMenu = (id: string) => {
    setOpenMenu((cur) => {
      if (cur === id && openedByClick.current) {
        openedByClick.current = false;
        return null;
      }
      openedByClick.current = true;
      return id;
    });
  };

  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  const keepOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <div className="sticky top-0 z-50">
      {/* A keyboard user can jump the whole menu in one key press. */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-[10px] focus:bg-white focus:px-4 focus:py-2.5 focus:font-semibold focus:text-violet-deep focus:shadow-lg"
      >
        Skip to the page content
      </a>

      <div
        ref={headerRef}
        onMouseLeave={hoverClose}
        className={`relative border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || drawerOpen
            ? "border-line bg-white/92 shadow-[0_1px_0_rgba(21,17,46,0.02),0_8px_24px_-18px_rgba(21,17,46,0.25)] backdrop-blur-xl"
            : "border-transparent bg-paper/80 backdrop-blur-md"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            onClick={closeAll}
            className="shrink-0 rounded-[10px] py-1 pr-1"
            aria-label="Nimbus Labs, home"
          >
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex" onMouseEnter={keepOpen}>
            {MENUS.map((menu) => (
              <button
                key={menu.id}
                type="button"
                aria-expanded={openMenu === menu.id}
                aria-controls={`menu-${menu.id}`}
                onMouseEnter={() => hoverOpen(menu.id)}
                onClick={() => clickMenu(menu.id)}
                className={`flex h-10 items-center gap-1 rounded-[10px] px-3.5 text-[0.9375rem] font-medium transition-colors ${
                  openMenu === menu.id ? "bg-sand text-ink" : "text-ink-soft hover:bg-sand hover:text-ink"
                }`}
              >
                {menu.label}
                <Icon
                  name="chevron-down"
                  size={16}
                  className={`transition-transform duration-200 ${openMenu === menu.id ? "rotate-180" : ""}`}
                />
              </button>
            ))}
            {PLAIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => setOpenMenu(null)}
                className="flex h-10 items-center rounded-[10px] px-3.5 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:bg-sand hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/signin"
              className="hidden h-10 items-center rounded-[10px] px-3.5 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:bg-sand hover:text-ink sm:flex"
            >
              Sign in
            </Link>
            {/* Under 360px the header has room for the logo and the menu only;
                the drawer and the hero both carry the same button. */}
            <span className="hidden min-[360px]:block">
              <Link href="/signin" className="btn btn-primary btn-sm">
                <span className="hidden min-[400px]:inline">Start your store</span>
                <span className="min-[400px]:hidden">Get started</span>
              </Link>
            </span>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="grid h-11 w-11 place-items-center rounded-[10px] text-ink transition-colors hover:bg-sand lg:hidden"
            >
              <span className="sr-only">{drawerOpen ? "Close the menu" : "Open the menu"}</span>
              <Icon name={drawerOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Desktop panel: sits under the header, as wide as the content. */}
        {MENUS.filter((menu) => openMenu === menu.id).map((menu) => (
          <div
            key={menu.id}
            id={`menu-${menu.id}`}
            onMouseEnter={keepOpen}
            className="absolute inset-x-0 top-full hidden lg:block"
          >
            <div className="container-page">
              <div
                className={`nb-pop mx-auto mt-2 grid ${menu.groups ? "max-w-6xl grid-cols-[15rem_1fr]" : "max-w-4xl grid-cols-[17rem_1fr]"} overflow-hidden rounded-[var(--r-lg)] border border-line bg-white shadow-[var(--shadow-lg)]`}
              >
                <div className="surface-night on-dark flex flex-col justify-between p-6">
                  <div>
                    <p className="eyebrow">{menu.label}</p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/80">{menu.blurb}</p>
                  </div>
                  <Link href={menu.feature.href} onClick={closeAll} className="group mt-6 block rounded-[var(--r-md)] border border-white/12 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.1]">
                    <span className="block font-semibold text-white">{menu.feature.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/70">{menu.feature.body}</span>
                    <span className="link-arrow on-dark mt-3 text-sm">
                      {menu.feature.cta}
                      <Icon name="arrow-right" size={16} className="arrow" />
                    </span>
                  </Link>
                </div>
                {menu.groups ? (
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <p className="px-3 pb-1 pt-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">{group.label}</p>
                          <ul className="grid gap-0.5">
                            {group.items.map((entry) => (
                              <li key={entry.href}>
                                <Link
                                  href={entry.href}
                                  onClick={closeAll}
                                  className="flex gap-3 rounded-[var(--r-md)] px-3 py-2.5 transition-colors hover:bg-paper"
                                >
                                  <span className="icon-tile icon-tile-sm">
                                    <Icon name={entry.icon} size={18} />
                                  </span>
                                  <span>
                                    <span className="block font-semibold text-ink">{entry.label}</span>
                                    <span className="mt-0.5 block text-sm leading-snug text-ink-mute">{entry.description}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/platform"
                      onClick={closeAll}
                      className="mx-3 mb-1 mt-2 flex items-center justify-between rounded-[var(--r-md)] bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sand"
                    >
                      Every feature on one page, with the plan each is on
                      <Icon name="arrow-right" size={16} className="text-violet-deep" />
                    </Link>
                  </div>
                ) : (
                <ul className="grid content-start gap-1 p-3 sm:grid-cols-2">
                  {menu.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeAll}
                        className="flex h-full gap-3 rounded-[var(--r-md)] p-3 transition-colors hover:bg-paper"
                      >
                        <span className="icon-tile icon-tile-sm">
                          <Icon name={item.icon} size={18} />
                        </span>
                        <span>
                          <span className="block font-semibold text-ink">{item.label}</span>
                          <span className="mt-0.5 block text-sm leading-snug text-ink-mute">{item.description}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile menu: its own layout, not the desktop one squeezed. */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={`fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-white lg:hidden ${drawerOpen ? "" : "hidden"}`}
      >
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
          {MENUS.map((menu) => (
            <section key={menu.id} className="border-b border-line py-4">
              <p className="px-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                {menu.label}
              </p>
              <ul className="mt-2">
                {[
                  { label: menu.feature.title, description: menu.feature.body, href: menu.feature.href, icon: "sparkle" as IconName },
                  ...(menu.groups ? [{ label: "Every feature", description: "", href: "/platform", icon: "list" as IconName }] : []),
                  ...menu.items,
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeAll}
                      className="flex min-h-[52px] items-center gap-3 rounded-[var(--r-md)] px-2 py-2 active:bg-sand"
                    >
                      <span className="icon-tile icon-tile-sm">
                        <Icon name={item.icon} size={18} />
                      </span>
                      <span className="font-medium text-ink">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <ul className="py-3">
            {[...PLAIN_LINKS, { href: "/help", label: "Help centre" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={closeAll} className="flex min-h-[52px] items-center rounded-[var(--r-md)] px-2 font-medium text-ink active:bg-sand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-2 border-t border-line bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link href="/signin" onClick={closeAll} className="btn btn-primary btn-lg btn-block">
            Start your store
          </Link>
          <Link href="/signin" onClick={closeAll} className="btn btn-ghost btn-block">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
