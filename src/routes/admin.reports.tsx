import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { getModule } from "@/lib/admin/registry";
import { useCollection } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

function ReportCard({ title, rows }: { title: string; rows: { label: string; value: string | number }[] }) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-sm font-bold text-primary">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
            <dt className="truncate text-muted-foreground">{r.label}</dt>
            <dd className="shrink-0 font-semibold text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReportsPage() {
  const { t } = useLang();
  const students = useCollection(getModule("students")!);
  const teachers = useCollection(getModule("teachers")!);
  const marks = useCollection(getModule("marks")!);
  const fees = useCollection(getModule("fees")!);

  const paid = fees.rows.filter((r) => r["status"] === "Paid");
  const due = fees.rows.filter((r) => r["status"] === "Due");
  const sum = (list: typeof fees.rows) => list.reduce((acc, r) => acc + Number(r["amount"] ?? 0), 0);
  const avgMarks = marks.rows.length
    ? Math.round(marks.rows.reduce((a, r) => a + Number(r["marks"] ?? 0), 0) / marks.rows.length)
    : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ReportCard
        title={t("Student Report", "শিক্ষার্থী রিপোর্ট")}
        rows={[
          { label: t("Total students", "মোট শিক্ষার্থী"), value: students.rows.length },
          { label: t("Boys", "ছাত্র"), value: students.rows.filter((r) => r["gender"] === "Boy").length },
          { label: t("Girls", "ছাত্রী"), value: students.rows.filter((r) => r["gender"] === "Girl").length },
        ]}
      />
      <ReportCard
        title={t("Teacher Report", "শিক্ষক রিপোর্ট")}
        rows={[
          { label: t("Total teachers", "মোট শিক্ষক"), value: teachers.rows.length },
          { label: t("Classes covered", "শ্রেণি কাভার"), value: new Set(teachers.rows.map((r) => r["assignedClass"])).size },
        ]}
      />
      <ReportCard
        title={t("Result Analysis", "ফলাফল বিশ্লেষণ")}
        rows={[
          { label: t("Marks entries", "নম্বর এন্ট্রি"), value: marks.rows.length },
          { label: t("Published", "প্রকাশিত"), value: marks.rows.filter((r) => r["published"] === "Yes").length },
          { label: t("Average marks", "গড় নম্বর"), value: avgMarks },
        ]}
      />
      <ReportCard
        title={t("Fee Collection Report", "ফি আদায় রিপোর্ট")}
        rows={[
          { label: t("Collected (BDT)", "আদায় (টাকা)"), value: sum(paid).toLocaleString() },
          { label: t("Outstanding (BDT)", "বকেয়া (টাকা)"), value: sum(due).toLocaleString() },
          { label: t("Due invoices", "বকেয়া বিল"), value: due.length },
        ]}
      />
    </div>
  );
}
