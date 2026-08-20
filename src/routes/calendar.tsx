import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { calendarMonths, defaultDownloads } from "@/data/site";
import { downloadPdf, printPage } from "@/lib/pdf";
import { DocCard } from "@/components/DocCard";
import { PageHero, Section, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Academic Calendar 2026 | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Month-by-month academic calendar 2026 for Al Eman Islamic Academy: term dates, examinations, events and holidays, with printable PDF download.",
      },
      { property: "og:title", content: "Academic Calendar 2026 — Al Eman Islamic Academy" },
      { property: "og:description", content: "Term dates, exams, events and holidays for the 2026 session." },
    ],
  }),
  component: AcademicCalendar,
});

function AcademicCalendar() {
  const { t, tb } = useLang();
  const doc = defaultDownloads.find((d) => d.id === "academic-calendar")!;

  return (
    <>
      <PageHero
        crumb={t("Academic Calendar", "শিক্ষা পঞ্জি")}
        title={t("Academic Calendar 2026", "শিক্ষা পঞ্জি ২০২৬")}
        subtitle={t(
          "Key dates for the 2026 session — examinations, events and vacations.",
          "২০২৬ শিক্ষাবর্ষের গুরুত্বপূর্ণ তারিখ — পরীক্ষা, অনুষ্ঠান ও ছুটি।",
        )}
      />

      <Section>
        <div className="no-print mb-8 flex flex-wrap justify-end gap-2">
          <button
            onClick={printPage}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            <Printer className="size-4" aria-hidden /> {t("Print", "প্রিন্ট")}
          </button>
          <button
            onClick={() =>
              downloadPdf("academic-calendar-2026", "Academic Calendar 2026", doc.content.map((c) => ({ text: c })))
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            <Download className="size-4" aria-hidden /> {t("Download PDF", "পিডিএফ ডাউনলোড")}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calendarMonths.map((m) => (
            <article key={m.month.en} className="surface-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">{tb(m.month)}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {m.items.map((item) => (
                  <li key={item.en} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {tb(item)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section muted className="no-print">
        <SectionTitle eyebrow={t("PDF", "পিডিএফ")} title={t("Preview & download", "প্রিভিউ ও ডাউনলোড")} />
        <div className="mx-auto mt-8 max-w-md">
          <DocCard doc={doc} />
        </div>
      </Section>
    </>
  );
}
