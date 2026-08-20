import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { defaultDownloads, routineDays, routinePeriods } from "@/data/site";
import { downloadPdf, printPage } from "@/lib/pdf";
import { DocCard } from "@/components/DocCard";
import { PageHero, Section, SectionTitle } from "@/components/ui-kit";
import { useState } from "react";

export const Route = createFileRoute("/routine")({
  head: () => ({
    meta: [
      { title: "Class Routine 2026 | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Weekly period-wise class routine for Al Eman Islamic Academy, Saturday to Thursday, with printable and downloadable PDF.",
      },
      { property: "og:title", content: "Class Routine 2026 — Al Eman Islamic Academy" },
      { property: "og:description", content: "Period-wise weekly routine with PDF preview, print and download." },
    ],
  }),
  component: ClassRoutine,
});

function ClassRoutine() {
  const { t, tb } = useLang();
  const doc = defaultDownloads.find((d) => d.id === "class-routine")!;
const classes = [
  { en: "Play", bn: "প্লে" },
  { en: "Nursery", bn: "নার্সারি" },
  { en: "Class 1", bn: "প্রথম শ্রেণি" },
  { en: "Class 2", bn: "দ্বিতীয় শ্রেণি" },
  { en: "Class 3", bn: "তৃতীয় শ্রেণি" },
  { en: "Class 4", bn: "চতুর্থ শ্রেণি" },
  { en: "Class 5", bn: "পঞ্চম শ্রেণি" },
  { en: "Class 6", bn: "ষষ্ঠ শ্রেণি" },
  { en: "Class 7", bn: "সপ্তম শ্রেণি" },
  { en: "Class 8", bn: "অষ্টম শ্রেণি" },
  { en: "Class 9", bn: "নবম শ্রেণি" },
  { en: "Class 10", bn: "দশম শ্রেণি" },
];

 const [selectedClass, setSelectedClass] = useState(classes[0]);
  return (
    <>
      <PageHero
        crumb={t("Class Routine", "ক্লাস রুটিন")}
        title={t("Class Routine 2026", "ক্লাস রুটিন ২০২৬")}
        subtitle={t(
          "Select your class below to view its weekly routine.",
          "নিচে আপনার শ্রেণি নির্বাচন করে সাপ্তাহিক রুটিন দেখুন।",
        )}
      />
      <Section>
        <SectionTitle
          eyebrow={t("Routine", "রুটিন")}
          title={t("Select Your Class", "আপনার শ্রেণি নির্বাচন করুন")}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {classes.map((cls) => (
            <button
              key={cls.en}
              onClick={() => setSelectedClass(cls)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                selectedClass.en === cls.en
                  ? "bg-primary text-white shadow-lg"
                  : "border border-border bg-white text-primary hover:bg-primary/10"
              }`}
            >
              {tb(cls)}
            </button>
          ))}
        </div>
      </Section>
      <Section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary">{tb(selectedClass)} {t("Routine", "রুটিন")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t( "Weekly class routine", "সাপ্তাহিক ক্লাস রুটিন")}
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">{t("Weekly class routine", "সাপ্তাহিক ক্লাস রুটিন")}</caption>
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Day", "দিন")}</th>
                {routinePeriods.map((p) => (
                  <th key={p.time} scope="col" className="px-4 py-3 text-left font-semibold">
                    <span className="block">{tb(p.label)}</span>
                    <span className="block text-[11px] font-normal opacity-80">{p.time}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {routineDays.map((d) => (
                <tr key={d.day.en} className="odd:bg-muted/40">
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-primary">{tb(d.day)}</th>
                  {d.subjects.map((s, i) => (
                    <td key={`${d.day.en}-${i}`} className="px-4 py-3 text-muted-foreground">
                      {s}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
            <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={printPage}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <Printer className="size-4" aria-hidden /> {t("Print", "প্রিন্ট")}
              </button>
              <button
                onClick={() => downloadPdf("class-routine-2026", "Class Routine 2026", doc.content.map((c) => ({ text: c })))}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
              >
                <Download className="size-4" aria-hidden /> {t("Download PDF", "পিডিএফ ডাউনলোড")}
              </button>
            </div>

        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t(
            "Assembly & Tilawat 07:45–08:00 · Break 10:10–10:35 · Zuhr prayer 12:45–13:15 · Friday closed.",
            "সমাবেশ ও তিলাওয়াত ০৭:৪৫–০৮:০০ · বিরতি ১০:১০–১০:৩৫ · জোহর নামাজ ১২:৪৫–১৩:১৫ · শুক্রবার বন্ধ।",
          )}
        </p>
      </Section>

     {/*<Section muted className="no-print">
        <SectionTitle eyebrow={t("PDF", "পিডিএফ")} title={t("Preview & download", "প্রিভিউ ও ডাউনলোড")} />
        <div className="mx-auto mt-8 max-w-md">
          <DocCard doc={doc} />
        </div>
      </Section> */}
    </>
  );
}
