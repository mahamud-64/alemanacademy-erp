import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useDownloads } from "@/lib/content";
import { DocCard } from "@/components/DocCard";
import { PageHero, Section, inputClass } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Download Center | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Download the admission form, prospectus, academic calendar, holiday list, class routine, exam routine, syllabus, fee structure, uniform guide and school magazine as PDF.",
      },
      { property: "og:title", content: "Download Center — Al Eman Islamic Academy" },
      { property: "og:description", content: "Every school document as a previewable, printable PDF." },
    ],
  }),
  component: Downloads,
});

function Downloads() {
  const { t, tb } = useLang();
  const { value: docs } = useDownloads();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Map<string, string>();
    docs.forEach((d) => set.set(d.category.en, tb(d.category)));
    return [["all", t("All", "সব")] as const, ...Array.from(set.entries())];
  }, [docs, t, tb]);

  const filtered = docs.filter((d) => {
    const matchCat = category === "all" || d.category.en === category;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q || tb(d.title).toLowerCase().includes(q) || tb(d.description).toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <>
      <PageHero
        crumb={t("Downloads", "ডাউনলোড")}
        title={t("Download Center", "ডাউনলোড সেন্টার")}
        subtitle={t(
          "Every official document as a PDF — preview it in the browser, print it, or download it.",
          "প্রতিটি অফিসিয়াল ডকুমেন্ট পিডিএফ আকারে — ব্রাউজারে প্রিভিউ, প্রিন্ট বা ডাউনলোড করুন।",
        )}
      />

      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={80}
              placeholder={t("Search documents…", "ডকুমেন্ট খুঁজুন…")}
              aria-label={t("Search documents", "ডকুমেন্ট খুঁজুন")}
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  category === id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("No documents match your search.", "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ডকুমেন্ট নেই।")}
          </p>
        ) : null}
      </Section>
    </>
  );
}
