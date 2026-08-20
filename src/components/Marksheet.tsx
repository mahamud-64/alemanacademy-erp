import { Download, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { StudentResult } from "@/data/site";
import { downloadPdf, printPage } from "@/lib/pdf";
import logo from "@/assets/logo.png";

export function Marksheet({ result }: { result: StudentResult }) {
  const { t, tb } = useLang();
  const total = result.subjects.reduce((sum, s) => sum + s.marks, 0);
  const average = (total / result.subjects.length).toFixed(2);

  const pdf = () =>
    downloadPdf(`marksheet-${result.studentId}`, "Academic Transcript / Marksheet", [
      { text: "Al Eman Islamic Academy, Chattogram", bold: true, size: 12 },
      { text: `Examination: ${result.exam.en}   Session: ${result.session}`, gap: 22 },
      { text: `Name: ${result.name.en}`, bold: true },
      { text: `Student ID: ${result.studentId}   Roll: ${result.roll}   Reg: ${result.registration}` },
      { text: `Class: ${result.className.en}   Section: ${result.section}` },
      { text: `Father: ${result.fatherName.en}   Mother: ${result.motherName.en}`, gap: 24 },
      { text: "Subject                          Marks     Grade", bold: true },
      ...result.subjects.map((s) => ({
        text: `${s.subject.en.padEnd(32, " ")} ${String(s.marks).padEnd(9, " ")} ${s.grade}`,
      })),
      { text: "", size: 10 },
      { text: `Total: ${total}    Average: ${average}    GPA: ${result.gpa.toFixed(2)}    Grade: ${result.grade}`, bold: true },
      { text: `Position: ${result.position} of ${result.outOf}` },
      { text: "", size: 10 },
      { text: "This is a computer-generated marksheet.", size: 9 },
    ]);

  return (
    <div className="surface-card overflow-hidden">
      <div className="no-print flex flex-wrap justify-end gap-2 border-b border-border p-4">
        <button
          onClick={printPage}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <Printer className="size-3.5" aria-hidden /> {t("Print marksheet", "মার্কশিট প্রিন্ট")}
        </button>
        <button
          onClick={pdf}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Download className="size-3.5" aria-hidden /> {t("Download PDF", "পিডিএফ ডাউনলোড")}
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <header className="flex flex-col items-center gap-3 border-b-2 border-primary pb-5 text-center">
          <img src={logo} alt="" width={64} height={64} loading="lazy" className="size-14" />
          <div>
            <h2 className="text-lg font-bold text-primary">{t("Al Eman Islamic Academy", "আল ঈমান ইসলামিক একাডেমি")}</h2>
            <p className="text-xs text-muted-foreground">Kamal Para, Fotika, Hathazari, Chattogram, Bangladesh ·</p>
            <p className="mt-1.5 text-sm font-semibold text-gold-foreground">{tb(result.exam)}</p>
          </div>
        </header>

        <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {[
            [t("Name", "নাম"), tb(result.name)],
            [t("Class / Section", "শ্রেণি / শাখা"), `${tb(result.className)} — ${result.section}`],
            [t("Student ID", "স্টুডেন্ট আইডি"), result.studentId],
            [t("Roll", "রোল"), result.roll],
            [t("Registration", "রেজিস্ট্রেশন"), result.registration],
            [t("Session", "শিক্ষাবর্ষ"), result.session],
            [t("Father's Name", "পিতার নাম"), tb(result.fatherName)],
            [t("Mother's Name", "মাতার নাম"), tb(result.motherName)],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="min-w-32 font-semibold text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("Subject-wise marks", "বিষয়ভিত্তিক নম্বর")}</caption>
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold">{t("Subject", "বিষয়")}</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">{t("Marks", "নম্বর")}</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">{t("Grade", "গ্রেড")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.subjects.map((s) => (
                <tr key={s.subject.en} className="odd:bg-muted/40">
                  <td className="px-4 py-2.5">{tb(s.subject)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{s.marks}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-primary">{s.grade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-secondary font-semibold">
              <tr>
                <td className="px-4 py-2.5">{t("Total", "মোট")}</td>
                <td className="px-4 py-2.5 text-right">{total}</td>
                <td className="px-4 py-2.5 text-right">{average}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [t("GPA", "জিপিএ"), result.gpa.toFixed(2)],
            [t("Grade", "গ্রেড"), result.grade],
            [t("Position", "মেধাক্রম"), `${result.position} / ${result.outOf}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {t(
            "This is a computer-generated marksheet and does not require a signature.",
            "এটি কম্পিউটারে তৈরি মার্কশিট, স্বাক্ষরের প্রয়োজন নেই।",
          )}
        </p>
      </div>
    </div>
  );
}
