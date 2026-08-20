import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Facebook,
  Youtube,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/lib/i18n";
import { school, primaryNav, moreNav } from "@/data/site";
import { useNotices, useSettings } from "@/lib/content";
import { cn } from "@/lib/utils";

type SearchHit = { title: string; to: string; group: string };

export function Header() {
  const { lang, setLang, t, tb } = useLang();
  const { value: settings } = useSettings();
  const { value: notices } = useNotices();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const index = useMemo<SearchHit[]>(() => {
    const pages = [...primaryNav, ...moreNav, { to: "/login", label: { en: "Student Login", bn: "স্টুডেন্ট লগইন" } }];
    return [
      ...pages.map((p) => ({ title: tb(p.label), to: p.to, group: t("Page", "পাতা") })),
      ...notices.map((n) => ({ title: tb(n.title), to: `/notices/${n.id}`, group: t("Notice", "নোটিশ") })),
    ];
  }, [notices, t, tb]);

  const hits = query.trim()
    ? index.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  const navLinkClass = (to: string) =>
    cn(
      "rounded-full px-3 py-2 text-sm font-medium transition-colors",
      pathname === to || (to !== "/" && pathname.startsWith(to))
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:bg-primary/5 hover:text-primary",
    );

  return (
    <header className="no-print sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="hidden bg-primary-deep text-primary-foreground lg:block">
        <div className="container-page flex h-11 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Phone className="size-3.5 text-gold" aria-hidden /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Mail className="size-3.5 text-gold" aria-hidden /> {settings.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-3.5 text-gold" aria-hidden /> {tb(school.address)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href={school.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-primary/40 p-1.5 hover:bg-gold hover:text-gold-foreground">
              <Facebook className="size-3.5" aria-hidden />
            </a>
            <a href={school.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-full bg-primary/40 p-1.5 hover:bg-gold hover:text-gold-foreground">
              <Youtube className="size-3.5" aria-hidden />
            </a>
            <a href={school.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full bg-primary/40 p-1.5 hover:bg-gold hover:text-gold-foreground">
              <MessageCircle className="size-3.5" aria-hidden />
            </a>
            <div className="ml-2 flex overflow-hidden rounded-full bg-primary/40" role="group" aria-label="Language">
              <button
                onClick={() => setLang("en")}
                className={cn("px-3 py-1 font-semibold", lang === "en" && "bg-gold text-gold-foreground")}
              >
                EN
              </button>
              <button
                onClick={() => setLang("bn")}
                className={cn("px-3 py-1 font-semibold font-bn", lang === "bn" && "bg-gold text-gold-foreground")}
              >
                বাং
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label={tb(school.name)}>
            <img src={logo} alt="" width={56} height={56} className="size-12 shrink-0 sm:size-14" />
            <span className="leading-tight">
              <span className="block text-base font-bold text-primary sm:text-lg">
                {lang === "bn" ? settings.nameBn : settings.name}
              </span>
              <span className="block text-xs text-muted-foreground font-bn">{school.name.bn}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {primaryNav.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass(item.to)}>
                {tb(item.label)}
              </Link>
            ))}
            <div className="group relative">
              <button className={cn(navLinkClass("/more"), "inline-flex items-center gap-1")}>
                {t("More", "আরও")} <ChevronDown className="size-3.5" aria-hidden />
              </button>
              <div className="invisible absolute right-0 top-full w-56 translate-y-1 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-[var(--shadow-lift)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {moreNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5 hover:text-primary"
                  >
                    {tb(item.label)}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("Search", "খুঁজুন")}
              aria-expanded={searchOpen}
              className="rounded-full p-2 text-primary hover:bg-primary/5"
            >
              <Search className="size-5" aria-hidden />
            </button>
            <Link
              to="/login"
              className="hidden rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 sm:inline-flex"
            >
              {t("Student Login", "স্টুডেন্ট লগইন")}
            </Link>
            <Link
              to="/admission"
              className="hidden rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground transition-all hover:brightness-105 sm:inline-flex"
            >
              {t("Apply Now", "আবেদন করুন")}
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full p-2 text-primary hover:bg-primary/5 xl:hidden"
              aria-label={t("Menu", "মেনু")}
              aria-expanded={open}
            >
              {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-border bg-card">
            <div className="container-page py-4">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search pages and notices…", "পাতা ও নোটিশ খুঁজুন…")}
                className="w-full rounded-lg border border-input bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-primary"
                aria-label={t("Search", "খুঁজুন")}
              />
              {hits.length > 0 ? (
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {hits.map((hit) => (
                    <li key={`${hit.group}-${hit.to}-${hit.title}`}>
                      <Link to={hit.to} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted">
                        <span>{hit.title}</span>
                        <span className="text-xs text-muted-foreground">{hit.group}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query.trim() ? (
                <p className="mt-3 text-sm text-muted-foreground">{t("No results found.", "কোনো ফলাফল পাওয়া যায়নি।")}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Mobile nav */}
      {open ? (
        <div className="border-b border-border bg-card xl:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile">
            {[...primaryNav, ...moreNav].map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass(item.to)}>
                {tb(item.label)}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link
                to="/login"
                className="flex-1 rounded-full border border-primary px-4 py-2 text-center text-sm font-semibold text-primary"
              >
                {t("Student Login", "স্টুডেন্ট লগইন")}
              </Link>
              <Link
                to="/admission"
                className="flex-1 rounded-full bg-gold px-4 py-2 text-center text-sm font-semibold text-gold-foreground"
              >
                {t("Apply Now", "আবেদন করুন")}
              </Link>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setLang("en")}
                className={cn("flex-1 rounded-full border border-border py-2 text-sm font-semibold", lang === "en" && "bg-primary text-primary-foreground")}
              >
                English
              </button>
              <button
                onClick={() => setLang("bn")}
                className={cn("flex-1 rounded-full border border-border py-2 text-sm font-semibold font-bn", lang === "bn" && "bg-primary text-primary-foreground")}
              >
                বাংলা
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
