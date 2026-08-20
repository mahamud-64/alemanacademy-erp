import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { noticeCategories } from "@/data/site";
import { useNotices } from "@/lib/content";
import { Badge, PageHero, Section, inputClass } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notices/")({
  head: () => ({
    meta: [
      { title: "Notice Board | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Latest school notices from Al Eman Islamic Academy — admission, examination, events and holidays, with category filter, search and archive.",
      },
      { property: "og:title", content: "Notice Board — Al Eman Islamic Academy" },
      { property: "og:description", content: "Admission, exam, event and holiday notices with search and archive." },
    ],
  }),
  component: NoticeBoard,
});

function NoticeBoard() {
  const { t, tb } = useLang();
  const { value: notices } = useNotices();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [showArchive, setShowArchive] = useState(false);

  const filtered = notices
    .filter((n) => (showArchive ? n.archived : !n.archived))
    .filter((n) => category === "all" || n.category === category)
    .filter((n) => {
      const q = query.trim().toLowerCase();
      return !q || tb(n.title).toLowerCase().includes(q) || tb(n.body).toLowerCase().includes(q);
    })
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));

  return (
    <>
      <PageHero
        crumb={t("Notice Board", "নোটিশ বোর্ড")}
        title={t("Notice Board", "নোটিশ বোর্ড")}
        subtitle={t(
          "All official announcements from the academy, sorted with pinned notices first.",
          "একাডেমির সকল অফিসিয়াল ঘোষণা, পিন করা নোটিশ সবার উপরে।",
        )}
      />

      <Section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {noticeCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  category === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {tb(c.label)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={80}
                placeholder={t("Search notices…", "নোটিশ খুঁজুন…")}
                aria-label={t("Search notices", "নোটিশ খুঁজুন")}
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <button
              onClick={() => setShowArchive((v) => !v)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold",
                showArchive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
              )}
            >
              {t("Archive", "আর্কাইভ")}
            </button>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {filtered.map((n) => (
            <li key={n.id}>
              <Link
                to="/notices/$noticeId"
                params={{ noticeId: n.id }}
                className="surface-card flex flex-col gap-4 p-6 transition-transform hover:-translate-y-0.5 sm:flex-row"
              >
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-xl font-bold leading-none">{new Date(n.date).getDate()}</span>
                  <span className="text-[10px] uppercase">
                    {new Date(n.date).toLocaleString("en", { month: "short" })} {new Date(n.date).getFullYear()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="muted">{n.category}</Badge>
                    {n.pinned ? <Badge tone="gold">{t("Pinned", "পিন করা")}</Badge> : null}
                    {n.archived ? <Badge tone="muted">{t("Archived", "আর্কাইভড")}</Badge> : null}
                    <span className="text-[11px] text-muted-foreground">#{n.id}</span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-foreground">{tb(n.title)}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{tb(n.body)}</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-primary">
                    {t("Read full notice →", "সম্পূর্ণ নোটিশ পড়ুন →")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("No notices found for this filter.", "এই ফিল্টারে কোনো নোটিশ পাওয়া যায়নি।")}
          </p>
        ) : null}
      </Section>
    </>
  );
}
