import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Download,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import logo from "@/assets/logo.png";
import { useLang } from "@/lib/i18n";
//import { school, academicSections, facilities, achievements } from "@/data/site"; -- use it when you want to use facilities---/
import { school, academicSections, achievements } from "@/data/site";
import { useNotices, useSettings } from "@/lib/content";
import { Section, SectionTitle, Badge } from "@/components/ui-kit";
import { SlidingNewsTicker } from "@/components/SlidingNewsTicker";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al Eman Islamic Academy | Islamic & Modern Education, Chattogram" },
      {
        name: "description",
        content:
          "A Chattogram academy blending the national curriculum with Qur'an, Hifz and Arabic. Admission open, online results, notices and student portal.",
      },
      { property: "og:title", content: "Al Eman Islamic Academy | Chattogram" },
      {
        property: "og:description",
        content: "Committed to integrating Islamic and modern education — Play Group to Class X.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { lang, t, tb } = useLang();
  const { value: settings } = useSettings();
  const { value: notices } = useNotices();
  const latest = notices.filter((n) => !n.archived).slice(0, 4);

  const stats = [

  {
    value: { en: "12", bn: "১২" },
    label: { en: "Teachers", bn: "শিক্ষক" },
    icon: GraduationCap,
  },
  {
    value: { en: "4", bn: "৪" },
    label: { en: "Academic Sections", bn: "শিক্ষার স্তর" },
    icon: BookOpen,
  },
  {
    value: { en: "100%", bn: "১০০%" },
    label: { en: "Pass Rate", bn: "পাসের হার" },
    icon: ShieldCheck,
  },
  {
    value: {
    en: `${new Date().getFullYear() - school.established}`,
    bn: `${new Date().getFullYear() - school.established}`,
    },
    label: { en: "Years of Service", bn: "বছরের পথচলা" },
    icon:  CalendarDays,
  },
];

  const quickLinks = [
    { to: "/admission", icon: GraduationCap, label: { en: "Admission", bn: "ভর্তি" } },
    { to: "/results", icon: BookOpen, label: { en: "Results", bn: "ফলাফল" } },
    { to: "/downloads", icon: Download, label: { en: "Downloads", bn: "ডাউনলোড" } },
    { to: "/routine", icon: CalendarDays, label: { en: "Class Routine", bn: "ক্লাস রুটিন" } },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Al Eman Islamic Academy campus courtyard"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-primary-deep/85" />
        <div className="container-page py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {t("Established", "প্রতিষ্ঠিত")} {school.established} 
            </span>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              {lang === "bn" ? settings.taglineBn : settings.tagline}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl">
              {lang === "bn" ? settings.nameBn : settings.name}
            </h1>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground transition-all hover:brightness-105"
              >
                {t("Apply for Admission", "ভর্তির আবেদন")} <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/results"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                {t("Check Results", "ফলাফল দেখুন")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SlidingNewsTicker />

      {/* Quick links */}
      <div className="container-page -mt-0 grid grid-cols-2 gap-4 py-10 sm:grid-cols-4">
        {quickLinks.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="surface-card group flex flex-col items-center gap-3 p-6 text-center transition-transform hover:-translate-y-1"
          >
            <span className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <q.icon className="size-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold">{tb(q.label)}</span>
          </Link>
        ))}
      </div>

      {/* Welcome */}
      <Section muted>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              align="left"
              eyebrow={t("Welcome", "স্বাগতম")}
              title={t("A balanced education for Deen and Dunya", "দ্বীন ও দুনিয়ার ভারসাম্যপূর্ণ শিক্ষা")}
              subtitle={t(
                "We nurture young minds through a balanced blend of Islamic values, Qur’anic learning, language skills, academic education, and character development.",
                "ইসলামী মূল্যবোধ, কুরআন শিক্ষা, ভাষাজ্ঞান, সাধারণ শিক্ষা ও নৈতিক চরিত্র গঠনের সমন্বয়ে আমরা কোমলমতি শিক্ষার্থীদের বিকাশে কাজ করে যাচ্ছি।"
              )}
            />
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {t("More about us", "আমাদের সম্পর্কে আরও")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.value} className="surface-card p-6 text-center">
                <s.icon className="mx-auto size-6 text-gold" aria-hidden />
                <p className="mt-3 text-2xl font-bold text-primary">{tb(s.value)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tb(s.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Academics */}
      <Section>
        <SectionTitle
          eyebrow={t("Academics", "শিক্ষাক্রম")}
          title={t("Sections from Play Group to Class X", "প্লে গ্রুপ থেকে দশম শ্রেণি")}
          subtitle={t(
            "Four carefully structured stages, each combining national curriculum subjects with Qur'anic and Arabic study.",
            "চারটি সুবিন্যস্ত ধাপ, প্রতিটিতেই জাতীয় শিক্ষাক্রমের সাথে কুরআন ও আরবি শিক্ষার সমন্বয়।",
          )}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {academicSections.map((s) => (
            <article key={s.id} className="surface-card flex flex-col p-6">
              <h3 className="text-base font-bold text-primary">{tb(s.name)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tb(s.detail)}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.subjects.slice(0, 4).map((sub) => (
                  <Badge key={sub.en} tone="muted">
                    {tb(sub)}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/academics" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            {t("View full academic programme", "সম্পূর্ণ শিক্ষাক্রম দেখুন")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Section>

      {/* Notices + achievements */}
      <Section muted>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <SectionTitle align="left" eyebrow={t("Notice Board", "নোটিশ বোর্ড")} title={t("Latest notices", "সর্বশেষ নোটিশ")} />
            <ul className="mt-6 min-w-0 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {latest.map((n) => (
                <li key={n.id}>
                  <Link to="/notices/$noticeId" params={{ noticeId: n.id }} className="flex gap-4 p-5 hover:bg-muted/60">
                    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-lg font-bold leading-none">{new Date(n.date).getDate()}</span>
                      <span className="text-[10px] uppercase">
                        {new Date(n.date).toLocaleString("en", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={n.pinned ? "gold" : "muted"}>{n.category}</Badge>
                        {n.pinned ? <Badge tone="primary">{t("Pinned", "পিন করা")}</Badge> : null}
                      </div>
                     <h3 className="mt-1.5 truncate text-sm font-semibold text-foreground">
                        {n.title ? tb(n.title) : t("Notice", "নোটিশ")}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        {n.image ? (
                          <img
                            src={n.image}
                            alt=""
                            className="size-10 shrink-0 rounded-md object-cover"
                          />
                        ) : null}

                        <span className="text-xs text-muted-foreground">
                          {t("View notice", "নোটিশ দেখুন")} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/notices" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {t("All notices", "সব নোটিশ")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div>
            <SectionTitle align="left" eyebrow={t("Achievements", "অর্জন")} title={t("Recent honours", "সাম্প্রতিক সম্মাননা")} />
            <ul className="mt-6 space-y-4">
              {achievements.slice(0, 3).map((a) => (
                <li key={a.title.en} className="surface-card p-5">
                  <Badge tone="gold">{a.year}</Badge>
                  <h3 className="mt-2 text-sm font-bold text-primary">{tb(a.title)}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tb(a.detail)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Facilities */}
      {/*
      <Section>
        <SectionTitle
          eyebrow={t("Campus", "ক্যাম্পাস")}
          title={t("Facilities that support learning", "শিক্ষার সহায়ক সুবিধাসমূহ")}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.slice(0, 8).map((f) => (
            <div key={f.icon} className="surface-card p-5">
              <h3 className="text-sm font-bold text-primary">{tb(f.title)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tb(f.detail)}</p>
            </div>
          ))}
        </div>
      </Section> */}

      {/* CTA */}
      <section className="pattern-emerald">
        <div className="container-page flex flex-col items-center gap-6 py-14 text-center">
          <img src={logo} alt="" width={72} height={72} loading="lazy" className="size-16" />
          <h2 className="max-w-2xl text-2xl font-bold text-primary-foreground sm:text-3xl">
            {t("Admission is open for the 2027 academic year", "২০২৭ শিক্ষাবর্ষের ভর্তি চলছে")}
          </h2>
          <p className="max-w-xl text-sm text-primary-foreground/80">
            {t(
              "Apply online in minutes. Our admission team will contact you within two working days.",
              "কয়েক মিনিটেই অনলাইনে আবেদন করুন। আমাদের ভর্তি টিম দুই কর্মদিবসের মধ্যে যোগাযোগ করবে।",
            )}
          </p>
          <Link
            to="/admission"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground hover:brightness-105"
          >
            {t("Start Application", "আবেদন শুরু করুন")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
