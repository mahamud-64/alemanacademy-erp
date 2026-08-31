import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useStudentAuth } from "@/lib/auth";
import { resultsDb } from "@/data/site";
import { Marksheet } from "@/components/Marksheet";

import { Badge, Section, inputClass } from "@/components/ui-kit";
import { routineDays, routinePeriods } from "@/data/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Student portal dashboard: profile, attendance, homework, fee status, notices, class routine and examination results.",
      },
      { property: "og:title", content: "Student Dashboard — Al Eman Islamic Academy" },
      { property: "og:description", content: "Profile, attendance, homework, fees, notices, routine and results." },
    ],
  }),
  component: Dashboard,
});

const tabs = [
  { id: "profile", label: { en: "Profile", bn: "প্রোফাইল" } },
  { id: "attendance", label: { en: "Attendance", bn: "উপস্থিতি" } },
  { id: "homework", label: { en: "Homework", bn: "বাড়ির কাজ" } },
  { id: "fees", label: { en: "Fee Status", bn: "বেতন" } },
  { id: "results", label: { en: "Results", bn: "ফলাফল" } },
  { id: "routine", label: { en: "Routine", bn: "রুটিন" } },
  { id: "notices", label: { en: "Notices", bn: "নোটিশ" } },
] as const;

function Dashboard() {
  const { t, tb } = useLang();
  const navigate = useNavigate();
  const { student, ready, logout } = useStudentAuth();
  const { value: notices } = useNotices();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("profile");

  if (!ready) {
    return (
      <Section>
        <p className="text-center text-sm text-muted-foreground">{t("Loading…", "লোড হচ্ছে…")}</p>
      </Section>
    );
  }

  if (!student) {
    return (
      <Section>
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-bold text-primary">{t("Please log in", "অনুগ্রহ করে লগ ইন করুন")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Your session has ended or you are not signed in.", "আপনার সেশন শেষ হয়েছে অথবা আপনি লগইন করা নেই।")}
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {t("Go to login", "লগইনে যান")}
          </Link>
        </div>
      </Section>
    );
  }

  const result = resultsDb.find((r) => r.studentId === student.studentId);
  const totalDue = student.fees.filter((f) => f.status === "due").reduce((s, f) => s + f.amount, 0);
  const presentDays = student.attendance.reduce((s, a) => s + a.present, 0);
  const totalDays = student.attendance.reduce((s, a) => s + a.total, 0);
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  return (
    <Section>
      <header className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {tb(student.name).charAt(0)}
          </span>
          <div>
            <h1 className="text-lg font-bold text-foreground">{tb(student.name)}</h1>
            <p className="text-xs text-muted-foreground">
              {tb(student.className)} · {t("Section", "শাখা")} {student.section} · {t("Roll", "রোল")} {student.roll} ·{" "}
              {student.studentId}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
        >
          <LogOut className="size-4" aria-hidden /> {t("Logout", "লগ আউট")}
        </button>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          [t("Attendance", "উপস্থিতি"), `${attendanceRate}%`],
          [t("Pending homework", "অসম্পূর্ণ কাজ"), String(student.homework.filter((h) => h.status === "pending").length)],
          [t("Outstanding fees", "বকেয়া বেতন"), `৳ ${totalDue.toLocaleString()}`],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label={t("Portal sections", "পোর্টাল বিভাগ")}>
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            {tb(item.label)}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "profile" ? (
          <dl className="surface-card grid gap-x-6 gap-y-3 p-6 text-sm sm:grid-cols-2">
            {[
              [t("Full name", "পূর্ণ নাম"), tb(student.name)],
              [t("Class / Section", "শ্রেণি / শাখা"), `${tb(student.className)} — ${student.section}`],
              [t("Roll", "রোল"), student.roll],
              [t("Registration", "রেজিস্ট্রেশন"), student.registration],
              [t("Guardian", "অভিভাবক"), tb(student.guardian)],
              [t("Guardian phone", "অভিভাবকের ফোন"), student.guardianPhone],
              [t("Blood group", "রক্তের গ্রুপ"), student.bloodGroup],
              [t("Address", "ঠিকানা"), tb(student.address)],
              [t("Admitted on", "ভর্তির তারিখ"), new Date(student.admittedOn).toLocaleDateString("en-GB")],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="min-w-36 font-semibold text-muted-foreground">{label}</dt>
                <dd className="font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {tab === "attendance" ? (
          <div className="surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Month", "মাস")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">{t("Present", "উপস্থিত")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">{t("Working days", "কর্মদিবস")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.attendance.map((a) => (
                  <tr key={a.month.en} className="odd:bg-muted/40">
                    <td className="px-4 py-2.5">{tb(a.month)}</td>
                    <td className="px-4 py-2.5 text-right">{a.present}</td>
                    <td className="px-4 py-2.5 text-right">{a.total}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-primary">
                      {Math.round((a.present / a.total) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "homework" ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {student.homework.map((h) => (
              <li key={h.task.en} className="surface-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="primary">{tb(h.subject)}</Badge>
                  <Badge tone={h.status === "submitted" ? "success" : "danger"}>
                    {h.status === "submitted" ? t("Submitted", "জমা দেওয়া") : t("Pending", "বাকি")}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-foreground">{tb(h.task)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("Due", "শেষ তারিখ")}: {new Date(h.due).toLocaleDateString("en-GB")}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "fees" ? (
          <div className="surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Item", "খাত")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">{t("Amount", "পরিমাণ")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">{t("Status", "অবস্থা")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.fees.map((f) => (
                  <tr key={f.month.en} className="odd:bg-muted/40">
                    <td className="px-4 py-2.5">
                      {tb(f.month)}
                      {f.paidOn ? (
                        <span className="block text-[11px] text-muted-foreground">
                          {t("Paid on", "পরিশোধ")} {new Date(f.paidOn).toLocaleDateString("en-GB")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right">৳ {f.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge tone={f.status === "paid" ? "success" : "danger"}>
                        {f.status === "paid" ? t("Paid", "পরিশোধিত") : t("Due", "বকেয়া")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "results" ? (
          result ? (
            <Marksheet result={result} />
          ) : (
            <p className="text-sm text-muted-foreground">{t("No result published yet.", "এখনো কোনো ফলাফল প্রকাশিত হয়নি।")}</p>
          )
        ) : null}

        {tab === "routine" ? (
          <div className="surface-card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
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
          </div>
        ) : null}

        {tab === "notices" ? (
          <ul className="space-y-3">
            {notices
              .filter((n) => !n.archived)
              .map((n) => (
                <li key={n.id}>
                  <Link to="/notices/$noticeId" params={{ noticeId: n.id }} className="surface-card block p-5 hover:bg-muted/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="muted">{n.category}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(n.date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{tb(n.title)}</p>
                  </Link>
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        {t(
          "Portal data is demo content stored in your browser. Connect a backend to serve live student records securely.",
          "পোর্টালের তথ্য আপনার ব্রাউজারে সংরক্ষিত ডেমো ডেটা। প্রকৃত শিক্ষার্থী তথ্যের জন্য ব্যাকএন্ড সংযুক্ত করুন।",
        )}
      </p>
      <input type="hidden" className={inputClass} />
    </Section>
  );
}
