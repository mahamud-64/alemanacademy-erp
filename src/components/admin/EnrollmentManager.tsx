import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Pencil, Search, GraduationCap, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
type Student = {
  id: string;
  student_id: string;
  student_name: string;
};

type Enrollment = {
  id: string;
  student_record_id: string;
  academic_year: string;
  class: string;
  section: string | null;
  roll: string | null;
  status: string;
  enrolled_at: string | null;
};

type EnrollmentManagerProps = {
  studentId?: string;
};

const CLASS_OPTIONS = [
  { value: "Play", en: "Play", bn: "প্লে" },
  { value: "KG", en: "KG", bn: "কেজি" },
  { value: "Class I", en: "Class I", bn: "প্রথম শ্রেণি" },
  { value: "Class II", en: "Class II", bn: "দ্বিতীয় শ্রেণি" },
  { value: "Class III", en: "Class III", bn: "তৃতীয় শ্রেণি" },
  { value: "Class IV", en: "Class IV", bn: "চতুর্থ শ্রেণি" },
  { value: "Class V", en: "Class V", bn: "পঞ্চম শ্রেণি" },
  { value: "Class VI", en: "Class VI", bn: "ষষ্ঠ শ্রেণি" },
  { value: "Class VII", en: "Class VII", bn: "সপ্তম শ্রেণি" },
  { value: "Class VIII", en: "Class VIII", bn: "অষ্টম শ্রেণি" },
  { value: "Class IX", en: "Class IX", bn: "নবম শ্রেণি" },
  { value: "Class X", en: "Class X", bn: "দশম শ্রেণি" },
] as const;

export function EnrollmentManager({
  studentId,
}: EnrollmentManagerProps) {
  const { t, lang } = useLang();
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [editingEnrollment, setEditingEnrollment] =
    useState<Enrollment | null>(null);

  const [openForm, setOpenForm] = useState(false);

  const [form, setForm] = useState({
    academic_year: "2027",
    class: "",
    section: "",
    roll: "",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        { data: studentData, error: studentError },
        { data: enrollmentData, error: enrollmentError },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id, student_id, student_name")
          .order("student_id", { ascending: true }),

        supabase
          .from("student_enrollments")
          .select(
            "id, student_record_id, academic_year, class, section, roll, status, enrolled_at",
          )
          .order("academic_year", { ascending: false }),
      ]);

      if (studentError) throw studentError;
      if (enrollmentError) throw enrollmentError;

      setStudents((studentData ?? []) as Student[]);
      setEnrollments((enrollmentData ?? []) as Enrollment[]);
    } catch (error) {
      console.error("Enrollment load error:", error);

      toast.error(
        "Unable to load enrollment data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  /* =========================================================
     OPTIONAL: OPEN A SPECIFIC STUDENT
  ========================================================= */

  useEffect(() => {
    if (!studentId || students.length === 0) return;

    const student = students.find(
      (item) => item.id === studentId,
    );

    if (student) {
      setSelectedStudent(student);
    }
  }, [studentId, students]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return students;

    return students.filter((student) =>
      [
        student.student_id,
        student.student_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [students, search]);

  /* =========================================================
     GET ENROLLMENTS FOR SELECTED STUDENT
  ========================================================= */

  const studentEnrollments = useMemo(() => {
    if (!selectedStudent) return [];

    return enrollments
      .filter(
        (item) =>
          item.student_record_id === selectedStudent.id,
      )
      .sort(
        (a, b) =>
          Number(b.academic_year) -
          Number(a.academic_year),
      );
  }, [enrollments, selectedStudent]);

  const activeEnrollment =
    studentEnrollments.find(
      (item) => item.status === "active",
    ) ?? studentEnrollments[0];

  /* =========================================================
     OPEN NEW ENROLLMENT
  ========================================================= */

  const openNewEnrollment = () => {
    setEditingEnrollment(null);

    setForm({
      academic_year:
        activeEnrollment?.academic_year ?? "2027",
      class: activeEnrollment?.class ?? "",
      section: "",
      roll: "",
    });

    setOpenForm(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditEnrollment = (
    enrollment: Enrollment,
  ) => {
    setEditingEnrollment(enrollment);

    setForm({
      academic_year: enrollment.academic_year ?? "",
      class: enrollment.class ?? "",
      section: enrollment.section ?? "",
      roll: enrollment.roll ?? "",
    });

    setOpenForm(true);
  };

  /* =========================================================
     SAVE ENROLLMENT
  ========================================================= */

  const saveEnrollment = async () => {
    if (!selectedStudent) return;

    if (!form.academic_year.trim()) {
      toast.error("Academic year is required.");
      return;
    }

    if (!form.class.trim()) {
      toast.error("Class is required.");
      return;
    }

    setSaving(true);

    try {
      /* =====================================================
         EDIT EXISTING ENROLLMENT
      ===================================================== */

      if (editingEnrollment) {
        const { error } = await supabase
          .from("student_enrollments")
          .update({
            academic_year:
              form.academic_year.trim(),

            class: form.class.trim(),

            section:
              form.section.trim() || null,

            roll:
              form.roll.trim() || null,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", editingEnrollment.id);

        if (error) throw error;

        toast.success(
          "Enrollment updated successfully.",
        );
      }

      /* =====================================================
         CREATE NEW ENROLLMENT
      ===================================================== */

      else {
        /*
         * First make previous active enrollment inactive.
         *
         * We do NOT delete it.
         * This preserves the student's history.
         */

        const { error: deactivateError } =
          await supabase
            .from("student_enrollments")
            .update({
              status: "inactive",
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "student_record_id",
              selectedStudent.id,
            )
            .eq("status", "active");

        if (deactivateError) {
          throw deactivateError;
        }

        /* Create new enrollment */

        const { error: insertError } =
          await supabase
            .from("student_enrollments")
            .insert({
              student_record_id:
                selectedStudent.id,

              academic_year:
                form.academic_year.trim(),

              class:
                form.class.trim(),

              section:
                form.section.trim() || null,

              roll:
                form.roll.trim() || null,

              status: "active",

              enrolled_at:
                new Date().toISOString(),
            });

        if (insertError) {
          throw insertError;
        }

        toast.success(
          "Student enrolled successfully.",
        );
      }

      setOpenForm(false);
      setEditingEnrollment(null);

      await loadData();
    } catch (error) {
      console.error(
        "Enrollment save error:",
        error,
      );

      toast.error(
        "Unable to save enrollment.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-5">
      {/* =====================================================
          STUDENT SEARCH
      ===================================================== */}

      <div className="rounded-2xl border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />

          <div>
            <h2 className="font-bold text-primary">
              {t(
                  "Enrollment & Promotion",
                  "এনরোলমেন্ট ও প্রমোশন",
                )}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t(
                "Manage academic-year enrollment, class, section and roll.",
                "শিক্ষাবর্ষ অনুযায়ী শ্রেণি, শাখা ও রোল পরিচালনা করুন।",
              )}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={t(
              "Search Student ID or name...",
              "স্টুডেন্ট আইডি বা নাম দিয়ে খুঁজুন...",
            )}
            className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 outline-none focus:border-primary"
          />
        </div>

        {/* Student results */}

        {search.trim() && (
          <div className="mt-2 max-h-60 overflow-auto rounded-xl border">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No student found.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(student);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 hover:bg-primary/5"
                >
                  <div>
                    <p className="font-semibold">
                      {student.student_name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Student ID:{" "}
                      {student.student_id}
                    </p>
                  </div>

                  <span className="text-xs text-primary">
                    Select
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          SELECTED STUDENT
      ===================================================== */}

      {selectedStudent && (
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Student
              </p>

              <h2 className="text-lg font-bold">
                {selectedStudent.student_name}
              </h2>

              <p className="text-sm text-primary">
                {selectedStudent.student_id}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedStudent(null)
              }
              className="rounded-lg p-2 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* =================================================
              CURRENT ENROLLMENT
          ================================================= */}

          {activeEnrollment ? (
            <div className="mt-5 rounded-xl border bg-primary/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-primary">
                  Current Enrollment
                </h3>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {activeEnrollment.status}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <Info
                  label="Academic Year"
                  value={
                    activeEnrollment.academic_year
                  }
                />

                <Info
                  label="Class"
                  value={activeEnrollment.class}
                />

                <Info
                  label="Section"
                  value={
                    activeEnrollment.section || "—"
                  }
                />

                <Info
                  label="Roll"
                  value={
                    activeEnrollment.roll || "—"
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openEditEnrollment(
                      activeEnrollment,
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Enrollment
                </button>

                <button
                  type="button"
                  onClick={openNewEnrollment}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Promote / New Enrollment
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                This student has no enrollment record.
              </p>

              <button
                type="button"
                onClick={openNewEnrollment}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Create Enrollment
              </button>
            </div>
          )}

          {/* =================================================
              ENROLLMENT HISTORY
          ================================================= */}

          {studentEnrollments.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-bold">
                Enrollment History
              </h3>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-4 py-3">
                        {t("Academic Year", "শিক্ষাবর্ষ")}
                      </th>

                      <th className="px-4 py-3">
                        {t("Class", "শ্রেণি")}
                      </th>

                      <th className="px-4 py-3">
                        {t("Section", "শাখা")}
                      </th>

                      <th className="px-4 py-3">
                        {t("Roll", "রোল")}
                      </th>

                      <th className="px-4 py-3">
                        {t("Status", "অবস্থা")}
                      </th>

                      <th className="px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {studentEnrollments.map(
                      (enrollment) => (
                        <tr
                          key={enrollment.id}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            {enrollment.academic_year}
                          </td>

                          <td className="px-4 py-3">
                            {enrollment.class}
                          </td>

                          <td className="px-4 py-3">
                            {enrollment.section ||
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            {enrollment.roll ||
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={
                                enrollment.status ===
                                "active"
                                  ? "rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                                  : "rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600"
                              }
                            >
                              {enrollment.status}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                openEditEnrollment(
                                  enrollment,
                                )
                              }
                              className="rounded-lg p-2 hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      {openForm && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editingEnrollment
                    ? "Edit Enrollment"
                    : "Promote / New Enrollment"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedStudent.student_name} ·{" "}
                  {selectedStudent.student_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpenForm(false)
                }
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Academic year */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Academic Year
                </label>

                <input
                  value={form.academic_year}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      academic_year:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-primary"
                  placeholder="2027"
                />
              </div>

              {/* Class */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Class
                </label>

                <select
                  value={form.class}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      class: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  <option value="">
                    {t("Select class", "শ্রেণি নির্বাচন করুন")}
                  </option>

                  {CLASS_OPTIONS.map((item) => (
                    <option
                      key={item.value}
                      value={item.bn}
                    >
                      {lang === "bn" ? item.bn : item.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Section
                </label>

                <select
                  value={form.section}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      section: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  <option value="">
                    No section
                  </option>

                  <option value="A">
                    A
                  </option>

                  <option value="B">
                    B
                  </option>

                  <option value="C">
                    C
                  </option>
                </select>
              </div>

              {/* Roll */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Roll
                </label>

                <input
                  value={form.roll}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      roll: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-primary"
                  placeholder="Enter roll"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setOpenForm(false)
                }
                className="rounded-xl border px-4 py-2.5 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={saveEnrollment}
                className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingEnrollment
                    ? "Save Changes"
                    : "Create Enrollment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty initial state */}

      {!selectedStudent && !loading && (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-3 font-semibold">
            Select a student
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Search by Student ID or student name to
            manage enrollment.
          </p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
          Loading enrollment data...
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   SMALL INFO COMPONENT
=========================================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}