import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, MessageCircle, Phone, Mail, MapPin, Send } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/lib/i18n";
import { school, primaryNav, moreNav } from "@/data/site";
import { useSettings } from "@/lib/content";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export function Footer() {
  const { lang, t, tb } = useLang();
  const { value: settings } = useSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="no-print mt-auto bg-primary-deep text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={48} height={48} loading="lazy" className="size-12" />
            
            <span className="leading-tight">
              <span className="block font-bold">{lang === "bn" ? settings.nameBn : settings.name}</span>
              <span className="block text-xs text-primary-foreground/70 font-bn">{school.name.bn}</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            {lang === "bn" ? settings.taglineBn : settings.tagline}
          </p>
          <p className="mt-3 text-xs text-primary-foreground/60">
            {t("Established", "প্রতিষ্ঠিত")} {school.established}
          </p>
          <div className="mt-4 flex gap-2">
            <a href={school.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-primary/40 p-2 hover:bg-gold hover:text-gold-foreground">
              <Facebook className="size-4" aria-hidden />
            </a>
            <a href={school.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-full bg-primary/40 p-2 hover:bg-gold hover:text-gold-foreground">
              <Youtube className="size-4" aria-hidden />
            </a>
            <a href={school.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full bg-primary/40 p-2 hover:bg-gold hover:text-gold-foreground">
              <MessageCircle className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:contents">
        <nav aria-label={t("Quick links", "দ্রুত লিংক")}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">{t("Quick Links", "দ্রুত লিংক")}</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-gold">
                  {tb(item.label)}
                </Link>
              </li>
            ))}
          </ul>
          
        </nav>

        <nav aria-label={t("Resources", "রিসোর্স")}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">{t("Resources", "রিসোর্স")}</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {moreNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-gold">
                  {tb(item.label)}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="hover:text-gold">
                {t("Student Portal", "স্টুডেন্ট পোর্টাল")}
              </Link>
            </li>
            <li className="pt-2">
              <PWAInstallButton className="border-gold text-gold hover:bg-gold/10" />
            </li>
          </ul>
        </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">{t("Contact", "যোগাযোগ")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              {tb(school.fullAddress)}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <a href={`tel:${settings.phone}`} className="hover:text-gold">{settings.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <a href={`mailto:${settings.email}`} className="hover:text-gold">{settings.email}</a>
            </li>
          </ul>

          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return;
              setSubscribed(true);
              setEmail("");
            }}
          >
            <label htmlFor="newsletter" className="block text-xs font-semibold uppercase tracking-wider text-gold">
              {t("Newsletter", "নিউজলেটার")}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="newsletter"
                type="email"
                required
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Your email", "আপনার ইমেইল")}
                className="w-full rounded-full bg-primary/40 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                type="submit"
                aria-label={t("Subscribe", "সাবস্ক্রাইব")}
                className="rounded-full bg-gold p-2.5 text-gold-foreground hover:brightness-105"
              >
                <Send className="size-4" aria-hidden />
              </button>
            </div>
            {subscribed ? (
              <p className="mt-2 text-xs text-gold">{t("Thank you for subscribing!", "সাবস্ক্রাইব করার জন্য ধন্যবাদ!")}</p>
            ) : null}
          </form>
        </div>
      </div>
        {/* CENTERED DEVELOPER CREDIT */}
      <div className="flex justify-center px-4 pb-8 text-center lg:-translate-y-[5mm]">
        <a
          href="/developer"
        // target="_blank"
        // rel="noreferrer"
          className="inline-block cursor-pointer text-center transition-opacity hover:opacity-80"
        >
          <span className="block text-sm font-semibold text-gold underline underline-offset-4">
            Designed &amp; Developed by Al Mahamud
          </span>

          <span className="mt-1 block text-xs text-primary-foreground/65">
            Web Development • UI/UX • System Design
          </span>
        </a>
      </div>

      <div className="border-t border-primary/30">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/65 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {lang === "bn" ? settings.nameBn : settings.name}.{" "}
            {t("All rights reserved.", "All rights reserved")}
          </p>
          <p>{t("Designed for excellence in Deen and Dunya.", "Designed for excellence in Deen and Dunya.")}</p>
        </div>
      </div>
    </footer>
  );
}
