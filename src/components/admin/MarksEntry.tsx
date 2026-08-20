import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { CLASS_OPTIONS } from "@/lib/admin/classOptions";
import {
  getHifzSubjects,
  getResultSubjects,
} from "@/lib/admin/resultSubjects";

/* ============================================================
   TYPES
   ============================================================ */

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
};

type Exam = {
  id: string;
  academic_year: string;
  name: string;
  class: string;
  status: "draft" | "published" | string;
};

type MarkRecord = {
  id: string;
  enrollment_id: string;
  exam_id: string;
  subject: string;
  marks: number | null;
  is_absent: boolean;
};

type StudentRow = {
  enrollment: Enrollment;
  student: Student;
  mark: string;
};

export type MarksEntryAssignment = {
  academicYear: string;
  className: string;
  section: string;
  subjects: string[];
};

type MarksEntryProps = {
  mode?: "admin" | "teacher";
  teacherAssignments?: MarksEntryAssignment[];
};

/* ============================================================
   CONSTANTS
   ============================================================ */

const HIFZ_CLASS_VALUE = "হিফজ";

function getDatabaseClassValue(classValue: string): string {
  const option = CLASS_OPTIONS.find(
    (item) => item.value === classValue,
  );

  return option?.bn ?? classValue;
}
const MAX_MARKS = 100;

/* ============================================================
   COMPONENT
   ============================================================ */

export function MarksEntry({
  mode = "admin",
  teacherAssignments = [],
}: MarksEntryProps) {
  const { t, lang } = useLang();
  const isTeacher = mode === "teacher";

  /* ----------------------------------------------------------
     FILTER STATE
     ---------------------------------------------------------- */

  const [academicYear, setAcademicYear] = useState(teacherAssignments[0]?.academicYear ?? "2027");
  const [examId, setExamId] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState(teacherAssignments[0]?.section ?? "A");
  const [subject, setSubject] = useState(teacherAssignments[0]?.subjects?.[0] ?? "");

  /* ----------------------------------------------------------
     DATA STATE
     ---------------------------------------------------------- */

  const [exams, setExams] = useState<Exam[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  /* ----------------------------------------------------------
     UI STATE
     ---------------------------------------------------------- */

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publicationStatus, setPublicationStatus] = useState<"published" | "draft" | null>(null);
  /*
   * One ref per enrollment.
   *
   * This is what allows:
   *
   * Mark Roll 1 → Enter → Roll 2
   */
  const desktopInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

  const mobileInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

  /* ==========================================================
     TEACHER ASSIGNMENTS
     ========================================================== */

      /* ==========================================================
      TEACHER MODE
      ========================================================== */

    /*
    * There is ONE common teacher account.
    *
    * Teachers do not have individual assignments.
    * They use the same existing Marks Entry interface.
    *
    * Admin:
    *   Full Marks Entry access
    *
    * Teacher:
    *   Same Marks Entry interface
    *   No admin panel access
    *
    * Teacher portal itself is controlled by:
    * teacher_portal_settings.is_open
    */

    const teacherYearOptions = useMemo(() => {
      if (!isTeacher) return [];

      return ["2027", "2028", "2026"];
    }, [isTeacher]);

    const teacherClassOptions = useMemo(() => {
      if (!isTeacher) return [];

      return CLASS_OPTIONS.map(
        (item) => item.value,
      );
    }, [isTeacher]);

    const teacherSectionOptions = useMemo(() => {
      if (!isTeacher || !className) return [];

      return ["A"];
    }, [className, isTeacher]);

    const currentTeacherAssignment = null;

    /*
    * Common teacher account is allowed to enter marks
    * when the Teacher Portal is open.
    *
    * The /teacher route already checks:
    * teacher_portal_settings.is_open
    */
    const canTeacherEdit = true;

  /* ==========================================================
     SUBJECTS
     ========================================================== */

  const subjects = useMemo(() => {
    if (!className) return [];

    return className === HIFZ_CLASS_VALUE
      ? [...getHifzSubjects()]
      : [...getResultSubjects(className)];
  }, [className]);

  /* ==========================================================
     LOAD EXAMS
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadExams = async () => {
      setExams([]);
      setExamId("");
      setSubject("");

      const { data, error } = await supabase
        .from("exams")
        .select(
          "id, academic_year, name, status",
        )
        .eq("academic_year", academicYear)
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Exam loading error:", error);

        toast.error(
          t(
            "Unable to load examinations.",
            "পরীক্ষার তথ্য লোড করা যায়নি।",
          ),
        );

        return;
      }

      setExams((data ?? []) as Exam[]);
    };

    void loadExams();

    return () => {
      cancelled = true;
    };
  }, [academicYear, t]);
  const availableExams = exams;
  /* ==========================================================
     LOAD ACTIVE ENROLLMENTS
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadEnrollments = async () => {
      setEnrollments([]);
      setStudents([]);
      setMarks([]);

      if (!className || !academicYear) {
        return;
      }

      setLoadingStudents(true);

      try {
        let query = supabase
          .from("student_enrollments")
          .select(
            `
              id,
              student_record_id,
              academic_year,
              class,
              section,
              roll,
              status
            `,
          )
          .eq("academic_year", academicYear)
          .eq("class", getDatabaseClassValue(className))
          .eq("status", "active");

        /*
         * Only apply section filtering when teacher
         * actually selected a section.
         */
        if (section) {
          query = query.eq("section", section);
        }

        const {
          data: enrollmentData,
          error: enrollmentError,
        } = await query;

        if (cancelled) return;

        if (enrollmentError) {
          throw enrollmentError;
        }

        const enrollmentRows =
          (enrollmentData ?? []) as Enrollment[];

        setEnrollments(enrollmentRows);

        if (enrollmentRows.length === 0) {
          setStudents([]);
          return;
        }

        /* ----------------------------------------------------
           LOAD STUDENTS USING student_record_id → students.id
           ---------------------------------------------------- */

        const studentIds = [
          ...new Set(
            enrollmentRows.map(
              (item) => item.student_record_id,
            ),
          ),
        ];

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            "id, student_id, student_name",
          )
          .in("id", studentIds);

        if (cancelled) return;

        if (studentError) {
          throw studentError;
        }

        setStudents((studentData ?? []) as Student[]);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Enrollment/student loading error:",
          error,
        );

        toast.error(
          t(
            "Unable to load students.",
            "শিক্ষার্থীদের তথ্য লোড করা যায়নি।",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    };

    void loadEnrollments();

    return () => {
      cancelled = true;
    };
  }, [
    academicYear,
    className,
    section,
    t,
  ]);

  /* ==========================================================
     LOAD EXISTING MARKS
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadMarks = async () => {
      setMarks([]);

      if (
        !examId ||
        !subject ||
        enrollments.length === 0
      ) {
        return;
      }

      setLoadingMarks(true);

      try {
        const enrollmentIds = enrollments.map(
          (item) => item.id,
        );

        const {
          data,
          error,
        } = await supabase
          .from("marks")
          .select(
            `
              id,
              enrollment_id,
              exam_id,
              subject,
              marks,
              is_absent
            `,
          )
          .eq("exam_id", examId)
          .eq("subject", subject)
          .in(
            "enrollment_id",
            enrollmentIds,
          );

        if (cancelled) return;

        if (error) {
          throw error;
        }

        setMarks((data ?? []) as MarkRecord[]);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Marks loading error:",
          error,
        );

        toast.error(
          t(
            "Unable to load existing marks.",
            "আগের নম্বর লোড করা যায়নি।",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoadingMarks(false);
        }
      }
    };

    void loadMarks();

    return () => {
      cancelled = true;
    };
  }, [
    examId,
    subject,
    enrollments,
    t,
  ]);
     /* ==========================================================
      LOAD RESULT PUBLICATION STATUS
      ========================================================== */

    useEffect(() => {
      let cancelled = false;

      const loadPublicationStatus = async () => {
        setPublicationStatus(null);

        if (
          !academicYear ||
          !examId ||
          !className ||
          !section
        ) {
          return;
        }

        try {
          const { data, error } = await supabase
            .from("result_publications")
            .select("status")
            .eq("academic_year", academicYear)
            .eq("exam_id", examId)
            .eq("class", className)
            .eq("section", section)
            .maybeSingle();

          if (cancelled) return;

          if (error) {
            console.error(
              "Publication status loading error:",
              error,
            );

            setPublicationStatus(null);
            return;
          }

          setPublicationStatus(
            data?.status === "published"
              ? "published"
              : "draft",
          );
        } catch (error) {
          if (cancelled) return;

          console.error(
            "Publication status error:",
            error,
          );

          setPublicationStatus(null);
        }
      };

      void loadPublicationStatus();

      return () => {
        cancelled = true;
      };
    }, [
      academicYear,
      examId,
      className,
      section,
    ]);
  /* ==========================================================
     BUILD DISPLAY ROWS
     ========================================================== */

  const rows = useMemo<StudentRow[]>(() => {
    const studentMap = new Map(
      students.map((student) => [
        student.id,
        student,
      ]),
    );

    const markMap = new Map(
      marks.map((mark) => [
        mark.enrollment_id,
        mark,
      ]),
    );

    return [...enrollments]
      .sort((a, b) => {
        /*
         * Numeric roll sorting:
         *
         * 1
         * 2
         * 3
         * ...
         * 10
         *
         * instead of:
         *
         * 1
         * 10
         * 2
         */
        const rollA = Number(a.roll);
        const rollB = Number(b.roll);

        const aHasRoll =
          Number.isFinite(rollA);
        const bHasRoll =
          Number.isFinite(rollB);

        /*
         * Students without a roll go to the bottom.
         */
        if (aHasRoll && !bHasRoll) return -1;
        if (!aHasRoll && bHasRoll) return 1;

        if (aHasRoll && bHasRoll) {
          if (rollA !== rollB) {
            return rollA - rollB;
          }
        }

        /*
         * Stable fallback.
         */
        return String(a.roll ?? "").localeCompare(
          String(b.roll ?? ""),
        );
      })
      .map((enrollment) => {
        const student =
          studentMap.get(
            enrollment.student_record_id,
          ) ?? {
            id: enrollment.student_record_id,
            student_id: "",
            student_name: t(
              "Student not found",
              "শিক্ষার্থী পাওয়া যায়নি",
            ),
          };

        const existingMark =
          markMap.get(enrollment.id);

        return {
          enrollment,
          student,
          mark:
            existingMark?.is_absent
              ? "A"
              : existingMark?.marks == null
                ? ""
                : String(existingMark.marks),
        };
      });
  }, [
    enrollments,
    students,
    marks,
    t,
  ]);

  /* ==========================================================
     UPDATE LOCAL MARK
     ========================================================== */

  const updateMark = (
    enrollmentId: string,
    value: string,
  ) => {
    const input = value.trim();

    /*
    * Clear input
    */
    if (input === "") {
      setMarks((current) =>
        current.filter(
          (item) =>
            item.enrollment_id !== enrollmentId,
        ),
      );

      return;
    }

    /*
    * A / Absent
    *
    * Both:
    * A
    * Absent
    *
    * are stored as:
    *
    * marks = null
    * is_absent = true
    */
    if (
      input.toUpperCase() === "A" ||
      input.toLowerCase() === "absent"
    ) {
      setMarks((current) => {
        const existing = current.find(
          (item) =>
            item.enrollment_id ===
            enrollmentId,
        );

        if (existing) {
          return current.map((item) =>
            item.enrollment_id ===
            enrollmentId
              ? {
                  ...item,
                  marks: null,
                  is_absent: true,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            id: `draft-${enrollmentId}`,
            enrollment_id: enrollmentId,
            exam_id: examId,
            subject,
            marks: null,
            is_absent: true,
          },
        ];
      });

      return;
    }

    /*
    * Numbers only
    *
    * Maximum 3 digits.
    */
    if (!/^\d{0,3}$/.test(input)) {
      return;
    }

    const numericValue = Number(input);

    /*
    * Maximum mark = 100
    */
    if (numericValue > MAX_MARKS) {
      return;
    }

    /*
    * Normal numeric mark
    */
    setMarks((current) => {
      const existing = current.find(
        (item) =>
          item.enrollment_id ===
          enrollmentId,
      );

      if (existing) {
        return current.map((item) =>
          item.enrollment_id ===
          enrollmentId
            ? {
                ...item,
                marks: numericValue,
                is_absent: false,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: `draft-${enrollmentId}`,
          enrollment_id: enrollmentId,
          exam_id: examId,
          subject,
          marks: numericValue,
          is_absent: false,
        },
      ];
    });
  };

  /* ==========================================================
     ENTER → NEXT STUDENT
     ========================================================== */

  const handleMarkKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
    layout: "desktop" | "mobile",
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextRow = rows[index + 1];

    if (!nextRow) {
      return;
    }

    const refs =
      layout === "desktop"
        ? desktopInputRefs.current
        : mobileInputRefs.current;

    const nextInput =
      refs[nextRow.enrollment.id];

    if (!nextInput) {
      return;
    }

    nextInput.focus();

    requestAnimationFrame(() => {
      nextInput.select();
    });
  };

    const invalidateResultValidation = async () => {
      const { error } = await supabase
        .from("result_publications")
        .update({
          status: "draft",
          published_at: null,
          published_by: null,
        })
        .eq("academic_year", academicYear)
        .eq("exam_id", examId)
        .eq("class", className)
        .eq("section", section);

      if (error) {
        throw error;
      }
    };


  /* ==========================================================
     SAVE MARKS
     ========================================================== */

  const saveMarks = async () => {
    if (!examId) {
      toast.error(
        t(
          "Select an examination first.",
          "প্রথমে পরীক্ষা নির্বাচন করুন।",
        ),
      );

      return;
    }

    if (!className) {
      toast.error(
        t(
          "Select a class first.",
          "প্রথমে শ্রেণি নির্বাচন করুন।",
        ),
      );

      return;
    }

    if (!subject) {
      toast.error(
        t(
          "Select a subject first.",
          "প্রথমে বিষয় নির্বাচন করুন।",
        ),
      );

      return;
    }

    const marksToSave = marks.filter(
      (item) =>
        item.exam_id === examId &&
        item.subject === subject &&
        (
          item.marks !== null ||
          item.is_absent === true
        ),
    );

    if (marksToSave.length === 0) {
      toast.error(
        t(
          "No marks entered.",
          "কোনো নম্বর দেওয়া হয়নি।",
        ),
      );

      return;
    }

    if (!canTeacherEdit) {
      toast.error(
        t(
          "You are not assigned to this class, section or subject.",
          "এই শ্রেণি, শাখা বা বিষয়ের জন্য আপনার অনুমতি নেই।",
        ),
      );
      return;
    }

    /* --------------------------------------------------------
       PUBLISHED RESULT LOCK
       A published result must be explicitly unpublished by an
       administrator before marks can be changed.
    -------------------------------------------------------- */

    const { data: publication, error: publicationError } = await supabase
      .from("result_publications")
      .select("id, status")
      .eq("academic_year", academicYear)
      .eq("exam_id", examId)
      .eq("class", className)
      .eq("section", section)
      .maybeSingle();

    if (publicationError) {
      console.error("Publication status check error:", publicationError);
      toast.error(
        t(
          "Unable to verify result status.",
          "ফলাফলের অবস্থা যাচাই করা যায়নি।",
        ),
      );
      return;
    }

    if (publication?.status === "published") {
      toast.error(
        t(
          "This result is published and cannot be edited. Ask an administrator to unpublish it first.",
          "এই ফলাফল প্রকাশিত হয়েছে এবং সম্পাদনা করা যাবে না। প্রথমে প্রশাসককে ফলাফল আনপাবলিশ করতে বলুন।",
        ),
      );
      return;
    }

    setSaving(true);

    try {
      /*
       * Use UPSERT.
       *
       * Because the database has:
       *
       * unique(exam_id, enrollment_id, subject)
       *
       * an existing mark will be updated,
       * otherwise a new mark will be inserted.
       */
      const payload = marksToSave.map(
        (item) => ({
          enrollment_id:
            item.enrollment_id,

          exam_id:
            item.exam_id,

          subject:
            item.subject,

          marks:
            item.is_absent
              ? null
              : item.marks,

          is_absent:
            item.is_absent,

          updated_at:
            new Date().toISOString(),
        }),
      );

      const {
        error,
      } = await supabase
        .from("marks")
        .upsert(payload, {
          onConflict:
            "exam_id,enrollment_id,subject",
        });

      if (error) {
        throw error;
      }
      /*
      * Any mark change invalidates the previous
      * result validation.
      *
      * The result must be validated again
      * before it can be published.
      */
      await invalidateResultValidation();
      toast.success(
        t(
          "Marks saved successfully.",
          "নম্বর সফলভাবে সংরক্ষণ হয়েছে।",
        ),
      );

      /*
       * Reload from Supabase.
       *
       * This makes sure the UI represents
       * the actual database state.
       */
      const enrollmentIds =
        enrollments.map(
          (item) => item.id,
        );

      const {
        data,
        error: reloadError,
      } = await supabase
        .from("marks")
        .select(
          `
            id,
            enrollment_id,
            exam_id,
            subject,
            marks,
            is_absent
          `,
        )
        .eq("exam_id", examId)
        .eq("subject", subject)
        .in(
          "enrollment_id",
          enrollmentIds,
        );

      if (reloadError) {
        console.error(
          "Marks reload error:",
          reloadError,
        );

        return;
      }

      setMarks(
        (data ?? []) as MarkRecord[],
      );
    } catch (error) {
      console.error(
        "Marks save error:",
        error,
      );

      toast.error(
        t(
          "Unable to save marks.",
          "নম্বর সংরক্ষণ করা যায়নি।",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     RESET DEPENDENT FIELDS
     ========================================================== */

  const handleClassChange = (
    value: string,
  ) => {
    setClassName(value);
    setExamId("");
    setSubject("");
  };

  const handleSectionChange = (
    value: string,
  ) => {
    setSection(value);
  };

  const handleExamChange = (
    value: string,
  ) => {
    setExamId(value);
    setSubject("");
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="space-y-5">

      {/* ======================================================
          HEADER + FILTERS
          ====================================================== */}

      <div className="surface-card p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-primary">
            {t(
              "Marks Entry",
              "নম্বর এন্ট্রি",
            )}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Enter marks quickly. Press Enter to move to the next student.",
              "দ্রুত নম্বর দিন। Enter চাপলে পরবর্তী শিক্ষার্থীর ঘরে যাবে।",
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* ACADEMIC YEAR */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Academic Year",
                "শিক্ষাবর্ষ",
              )}
            </label>

            <select
              value={academicYear}
              onChange={(event) => {
                setAcademicYear(
                  event.target.value,
                );
                setExamId("");
                setSubject("");
              }}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              {(isTeacher
                ? teacherYearOptions
                : ["2027", "2028", "2026"]
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* CLASS */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Class",
                "শ্রেণি",
              )}
            </label>

            <select
              value={className}
              onChange={(event) =>
                handleClassChange(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              <option value="">
                {t(
                  "Select class",
                  "শ্রেণি নির্বাচন করুন",
                )}
              </option>

              {(isTeacher
                ? CLASS_OPTIONS.filter((item) =>
                    teacherClassOptions.includes(item.value),
                  )
                : CLASS_OPTIONS
              ).map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {lang === "bn"
                    ? item.bn
                    : item.en}
                </option>
              ))}
            </select>
          </div>

          {/* EXAM */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Examination",
                "পরীক্ষা",
              )}
            </label>

            <select
              value={examId}
              onChange={(event) =>
                handleExamChange(
                  event.target.value,
                )
              }
              disabled={!className}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {t(
                  "Select examination",
                  "পরীক্ষা নির্বাচন করুন",
                )}
              </option>

              {availableExams.map(
                (exam) => (
                  <option
                    key={exam.id}
                    value={exam.id}
                  >
                    {exam.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* SECTION ---------------current section selection is deisabled ..but it is full functional for futture work*/}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("Section","শাখা",)}
            </label>

            <select
                value={section}
                disabled={!className}
                onChange={(event) =>
                    handleSectionChange(event.target.value)
                }
                className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
                {(isTeacher
                  ? teacherSectionOptions
                  : ["A"]
                ).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* SUBJECT */}

        <div className="mt-4 max-w-md">
          <label className="mb-1.5 block text-sm font-medium">
            {t(
              "Subject",
              "বিষয়",
            )}
          </label>

          <select
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value,
              )
            }
            disabled={!className}
            className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {t(
                "Select subject",
                "বিষয় নির্বাচন করুন",
              )}
            </option>

            {subjects.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* ======================================================
          MARKS AREA
          ====================================================== */}

      {className &&subject && (

          <div className="surface-card overflow-hidden">

            {/* PUBLISHED RESULT WARNING */}

            {publicationStatus === "published" && (
              <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-5">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden
                />

                <div>
                  <p className="font-semibold">
                    {t(
                      "This result is published and cannot be edited.",
                      "এই ফলাফল প্রকাশিত হয়েছে এবং সম্পাদনা করা যাবে না।",
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    {t(
                      "Ask an administrator to unpublish it first.",
                      "প্রথমে একজন প্রশাসককে ফলাফলটি আনপাবলিশ করতে বলুন।",
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* TOOLBAR */}
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-primary">
                  {subject}
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {rows.length}{" "}
                  {t(
                    "students",
                    "জন শিক্ষার্থী",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={saveMarks}
                disabled={
                saving ||
                loadingStudents ||
                loadingMarks ||
                !examId ||
                publicationStatus === "published"
              }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="size-4" />

                {saving
                  ? t(
                      "Saving...",
                      "সংরক্ষণ হচ্ছে...",
                    )
                  : t(
                      "Save Marks",
                      "নম্বর সংরক্ষণ",
                    )}
              </button>
            </div>

            {/* LOADING */}

            {loadingStudents ||
            loadingMarks ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t(
                  "Loading...",
                  "লোড হচ্ছে...",
                )}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t(
                  "No active students found for this class and section.",
                  "এই শ্রেণি ও শাখায় কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি।",
                )}
              </div>
            ) : (
              <>
                {/* ==================================================
                    DESKTOP TABLE
                    ================================================== */}

                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="w-20 px-4 py-3 text-left font-semibold">
                          {t(
                            "Roll",
                            "রোল",
                          )}
                        </th>

                        <th className="px-4 py-3 text-left font-semibold">
                          {t(
                            "Student",
                            "শিক্ষার্থী",
                          )}
                        </th>

                        <th className="w-48 px-4 py-3 text-left font-semibold">
                          {t(
                            "Marks",
                            "নম্বর",
                          )}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map(
                        (
                          row,
                          index,
                        ) => (
                          <tr
                            key={
                              row
                                .enrollment
                                .id
                            }
                            className="border-b last:border-b-0"
                          >
                            <td className="px-4 py-3">
                              <span className="font-bold text-primary">
                                {row
                                  .enrollment
                                  .roll ||
                                  "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {
                                  row
                                    .student
                                    .student_name
                                }
                              </div>

                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {
                                  row
                                    .student
                                    .student_id
                                }
                              </div>
                            </td>

                            <td className="px-4 py-3">
                            <MarkInput
                              value={row.mark}
                              onChange={(value) =>
                                updateMark(
                                  row.enrollment.id,
                                  value,
                                )
                              }
                              onKeyDown={(event) =>
                                handleMarkKeyDown(
                                  event,
                                  index,
                                  "desktop",
                                )
                              }
                              inputRef={(element) => {
                                desktopInputRefs.current[
                                  row.enrollment.id
                                ] = element;
                              }}
                            />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ==================================================
                    PHONE
                    ================================================== */}

                <div className="divide-y md:hidden">
                  {rows.map(
                    (
                      row,
                      index,
                    ) => {
                      const hasMark =
                        row.mark !== "";

                      return (
                        <div
                          key={
                            row
                              .enrollment
                              .id
                          }
                          className="p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                {t(
                                  "Roll",
                                  "রোল",
                                )}
                              </span>

                              <span className="ml-2 font-bold text-primary">
                                {row
                                  .enrollment
                                  .roll ||
                                  "—"}
                              </span>
                            </div>

                            {hasMark && (
                              <CheckCircle2 className="size-5 text-green-600" />
                            )}
                          </div>

                          <div className="mb-3">
                            <p className="font-semibold">
                              {
                                row
                                  .student
                                  .student_name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {
                                row
                                  .student
                                  .student_id
                              }
                            </p>
                          </div>

                          <MarkInput
                            value={
                              row.mark
                            }
                            onChange={(
                              value,
                            ) =>
                              updateMark(
                                row
                                  .enrollment
                                  .id,
                                value,
                              )
                            }
                            onKeyDown={(
                              event,
                            ) =>
                              handleMarkKeyDown(
                                event,
                                index,
                                "mobile"
                              )
                            }
                            inputRef={(
                              element,
                            ) => {
                              mobileInputRefs.current[
                                row
                                  .enrollment
                                  .id
                              ] =
                                element;
                            }}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
}

/* ============================================================
   MARK INPUT
   ============================================================ */

function MarkInput({
  value,
  onChange,
  onKeyDown,
  inputRef,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  inputRef: (
    element: HTMLInputElement | null,
  ) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCapitalize="characters"
      spellCheck={false}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      onKeyDown={onKeyDown}
      className="h-11 w-full rounded-xl border bg-background px-3 text-lg font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      
      aria-label="Marks or Absent"
    />
  );
}