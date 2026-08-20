import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Download,
  GraduationCap,
  Award,
  Megaphone,
  School,
  UserPlus,
  Users,
  Activity,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getModule } from "@/lib/admin/registry";
import { useCollection } from "@/lib/admin/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  loading: boolean;
}) {
  return (
    <div className="surface-card flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        {loading ? (
          <Skeleton className="mt-1 h-6 w-12" />
        ) : (
          <p className="text-xl font-bold text-foreground">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

type DashboardStudent = {
  gender: string | null;
};

type DashboardApplication = {
  id: string;
  application_id: string | null;
  student_name: string | null;
  applying_for: string | null;
  status: string | null;
  academic_year: string | null;
  created_at: string;
};

function AdminDashboard() {
  const { t, tb, lang } = useLang();

  // ========================================================
  // EXISTING ADMIN COLLECTIONS
  // Keep these for modules that we have NOT migrated yet.
  // ========================================================

  const teachers = useCollection(getModule("teachers")!);
  const classes = useCollection(getModule("classes")!);
  const subjects = useCollection(getModule("subjects")!);
  const notices = useCollection(getModule("notices")!);
  const downloads = useCollection(getModule("downloads")!);
  const marks = useCollection(getModule("marks")!);
  const activity = useCollection(getModule("activity")!);

  // ========================================================
  // REAL SUPABASE DASHBOARD DATA
  // ========================================================

  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [applications, setApplications] = useState<
    DashboardApplication[]
  >([]);

  const [studentsLoading, setStudentsLoading] =
    useState(true);

  const [applicationsLoading, setApplicationsLoading] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState("");

  // ========================================================
  // LOAD STUDENTS FROM SUPABASE
  // ========================================================

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      setStudentsLoading(true);

      const { data, error } = await supabase
        .from("students")
        .select("gender");

      if (error) {
        console.error(
          "Dashboard students query failed:",
          error,
        );

        if (mounted) {
          setDashboardError(
            t(
              "Some dashboard data could not be loaded.",
              "ড্যাশবোর্ডের কিছু তথ্য লোড করা যায়নি।",
            ),
          );
        }

        setStudentsLoading(false);
        return;
      }

      if (mounted) {
        setStudents(
          (data ?? []) as DashboardStudent[],
        );

        setStudentsLoading(false);
      }
    };

    void loadStudents();

    return () => {
      mounted = false;
    };
  }, [t]);

  // ========================================================
  // LOAD APPLICATIONS FROM SUPABASE
  // ========================================================

  useEffect(() => {
    let mounted = true;

    const loadApplications = async () => {
      setApplicationsLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
            id,
            application_id,
            student_name,
            applying_for,
            status,
            academic_year,
            created_at
          `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(6);

      if (error) {
        console.error(
          "Dashboard applications query failed:",
          error,
        );

        if (mounted) {
          setDashboardError(
            t(
              "Some dashboard data could not be loaded.",
              "ড্যাশবোর্ডের কিছু তথ্য লোড করা যায়নি।",
            ),
          );
        }

        setApplicationsLoading(false);
        return;
      }

      if (mounted) {
        setApplications(
          (data ?? []) as DashboardApplication[],
        );

        setApplicationsLoading(false);
      }
    };

    void loadApplications();

    return () => {
      mounted = false;
    };
  }, [t]);

  // ========================================================
  // REAL STUDENT COUNTS
  // ========================================================

  const totalStudents = students.length;

  const boys = students.filter((student) =>
    /male|boy|পুরুষ|ছাত্র/i.test(
      String(student.gender ?? ""),
    ),
  ).length;

  const girls = students.filter((student) =>
    /female|girl|মহিলা|ছাত্রী/i.test(
      String(student.gender ?? ""),
    ),
  ).length;

  // ========================================================
  // REAL APPLICATION COUNTS
  // ========================================================

  const pendingApplications = applications.filter(
    (application) =>
      String(application.status ?? "")
        .trim()
        .toLowerCase() === "pending",
  );

  // ========================================================
  // EXISTING RESULT COUNT
  // ========================================================

  const published = marks.rows.filter(
    (r) => r["published"] === "Yes",
  ).length;

  // ========================================================
  // STATISTICS
  // ========================================================

  const stats = [
    {
      label: t(
        "Total Students",
        "মোট শিক্ষার্থী",
      ),
      value: totalStudents,
      icon: GraduationCap,
      loading: studentsLoading,
    },

    {
      label: t("Boys", "ছাত্র"),
      value: boys,
      icon: Users,
      loading: studentsLoading,
    },

    {
      label: t("Girls", "ছাত্রী"),
      value: girls,
      icon: Users,
      loading: studentsLoading,
    },

    {
      label: t("Teachers", "শিক্ষক"),
      value: teachers.rows.length,
      icon: Users,
      loading: teachers.loading,
    },

    {
      label: t("Classes", "শ্রেণি"),
      value: classes.rows.length,
      icon: School,
      loading: classes.loading,
    },

    {
      label: t("Subjects", "বিষয়"),
      value: subjects.rows.length,
      icon: BookOpen,
      loading: subjects.loading,
    },

    {
      label: t("Notices", "নোটিশ"),
      value: notices.rows.length,
      icon: Megaphone,
      loading: notices.loading,
    },

    {
      label: t("Downloads", "ডাউনলোড"),
      value: downloads.rows.length,
      icon: Download,
      loading: downloads.loading,
    },

    {
      label: t(
        "Published Results",
        "প্রকাশিত ফলাফল",
      ),
      value: published,
      icon: Award,
      loading: marks.loading,
    },
  ];

  // ========================================================
  // QUICK ACTIONS
  // ========================================================

  const quickActions = [
    {
      label: t(
        "Add Student",
        "শিক্ষার্থী যোগ",
      ),
      module: "students",
      icon: GraduationCap,
    },

    {
      label: t(
        "Add Teacher",
        "শিক্ষক যোগ",
      ),
      module: "teachers",
      icon: Users,
    },

    {
      label: t(
        "Publish Notice",
        "নোটিশ প্রকাশ",
      ),
      module: "notices",
      icon: Megaphone,
    },

    {
      label: t(
        "Upload File",
        "ফাইল আপলোড",
      ),
      module: "downloads",
      icon: Download,
    },

    {
      label: t(
        "New Admission",
        "নতুন ভর্তি",
      ),
      module: "admissions",
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ==================================================
          DASHBOARD ERROR
      ================================================== */}

      {dashboardError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {dashboardError}
        </div>
      ) : null}

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <section>
        <h2 className="mb-3 text-sm font-bold text-primary">
          {t(
            "Statistics",
            "পরিসংখ্যান",
          )}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              loading={s.loading}
            />
          ))}
        </div>
      </section>

      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <section>
        <h2 className="mb-3 text-sm font-bold text-primary">
          {t(
            "Quick Actions",
            "দ্রুত কার্যক্রম",
          )}
        </h2>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button
              key={a.label}
              asChild
              variant="outline"
              size="sm"
            >
              {a.module === "admissions" ? (
                <Link to="/admin/admissions">
                  <a.icon
                    className="size-4"
                    aria-hidden
                  />

                  {a.label}
                </Link>
              ) : (
                <Link
                  to="/admin/$module"
                  params={{
                    module: a.module,
                  }}
                  search={{
                    action: "new",
                  }}
                >
                  <a.icon
                    className="size-4"
                    aria-hidden
                  />

                  {a.label}
                </Link>
              )}
            </Button>
          ))}
        </div>
      </section>

      {/* ==================================================
          RECENT ACTIVITIES + PENDING ADMISSIONS
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ------------------------------------------------
            RECENT ACTIVITIES
        ------------------------------------------------ */}

        <section className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-primary">
            <Activity
              className="size-4"
              aria-hidden
            />

            {t(
              "Recent Activities",
              "সাম্প্রতিক কার্যক্রম",
            )}
          </h2>

          <ul className="mt-4 space-y-3">
            {activity.rows
              .slice(0, 6)
              .map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {String(
                        row["action"] ?? "",
                      )}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {String(
                        row["actor"] ?? "",
                      )}

                      {" · "}

                      {String(
                        row["module"] ?? "",
                      )}
                    </p>
                  </div>

                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {String(
                      row["at"] ?? "",
                    )}
                  </span>
                </li>
              ))}

            {activity.rows.length === 0 ? (
              <li className="text-xs text-muted-foreground">
                {t(
                  "No activity yet.",
                  "এখনো কোনো কার্যক্রম নেই।",
                )}
              </li>
            ) : null}
          </ul>
        </section>

        {/* ------------------------------------------------
            PENDING ADMISSIONS
        ------------------------------------------------ */}

        <section className="surface-card p-5">
          <h2 className="text-sm font-bold text-primary">
            {t(
              "Pending Admissions",
              "অপেক্ষমাণ ভর্তি আবেদন",
            )}
          </h2>

          <ul className="mt-4 space-y-3">

            {applicationsLoading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : pendingApplications.length === 0 ? (
              <li className="text-xs text-muted-foreground">
                {t(
                  "No pending applications.",
                  "কোনো অপেক্ষমাণ আবেদন নেই।",
                )}
              </li>
            ) : (
              pendingApplications
                .slice(0, 6)
                .map((application) => (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {application.student_name ??
                          "-"}
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        {application.application_id ??
                          "-"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {application.applying_for ??
                        "-"}
                    </span>
                  </li>
                ))
            )}

          </ul>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="mt-4"
          >
            <Link to="/admin/admissions">
              {t(
                "Review applications",
                "আবেদন পর্যালোচনা",
              )}
            </Link>
          </Button>
        </section>

      </div>

      {/* ==================================================
          LATEST NOTICES
      ================================================== */}

      <section className="surface-card p-5">
        <h2 className="text-sm font-bold text-primary">
          {t(
            "Latest Notices",
            "সর্বশেষ নোটিশ",
          )}
        </h2>

        <ul className="mt-4 space-y-2">
          {notices.rows
            .slice(0, 5)
            .map((row) => {
              const title = row["title"] as
                | {
                    en: string;
                    bn: string;
                  }
                | undefined;

              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate text-foreground">
                    {title
                      ? lang === "bn"
                        ? title.bn
                        : title.en
                      : ""}
                  </span>

                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {String(
                      row["date"] ?? "",
                    )}
                  </span>
                </li>
              );
            })}
        </ul>

        <p className="mt-4 text-[11px] text-muted-foreground">
          {tb({
            en: "Student and admission data are now connected to the Supabase ERP database. Other admin modules will be migrated progressively.",
            bn: "শিক্ষার্থী ও ভর্তি তথ্য এখন Supabase ERP ডাটাবেসের সাথে সংযুক্ত। অন্যান্য এডমিন মডিউল ধাপে ধাপে সংযুক্ত করা হবে।",
          })}
        </p>
      </section>

    </div>
  );
}