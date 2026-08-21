import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Loader2,
  Printer,
  Search,
  Trophy,
  UserRound,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { CLASS_OPTIONS } from "@/lib/admin/classOptions";
import {
  type MeritListRow,
} from "@/lib/pdf/meritListPdf";

import {
  ActionButton,
  Field,
  PageHero,
  Section,
  inputClass,
} from "@/components/ui-kit";

import logo from "@/assets/logo.png";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      {
        title:
          "Results | Al Eman Islamic Academy",
      },
      {
        name: "description",
        content:
          "View published examination results, class merit lists and individual student results.",
      },
      {
        property: "og:title",
        content:
          "Results — Al Eman Islamic Academy",
      },
      {
        property: "og:description",
        content:
          "View published examination results, class merit lists and individual student results.",
      },
    ],
  }),

  component: Results,
});

/* ============================================================
   TYPES
============================================================ */

type Exam = {
  id: string;
  academic_year: string;
  name: string;
  status?: string;
};

type Publication = {
  id: string;
  academic_year: string;
  exam_id: string;
  class: string;
  section: string | null;
  status:
    | "draft"
    | "validated"
    | "published";
  published_at: string | null;
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

type Student = {
  id: string;
  student_id: string;
  student_name: string;
  date_of_birth?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
};

type Mark = {
  id: string;
  enrollment_id: string;
  exam_id: string;
  subject: string;
  marks: number | null;
  is_absent: boolean;
};

type SubjectInfo = {
  id: string;
  name_bn: string;
  name_en?: string | null;
  sort_order: number;
};

/* ============================================================
   HELPERS
============================================================ */

function getDatabaseClassValue(
  classValue: string,
): string {
  const option = CLASS_OPTIONS.find(
    (item) =>
      item.value === classValue,
  );

  return option?.bn ?? classValue;
}

function getClassLabel(
  classValue: string,
  lang: "en" | "bn",
): string {
  const option = CLASS_OPTIONS.find(
    (item) =>
      item.value === classValue,
  );

  if (!option) {
    return classValue;
  }

  return option[lang];
}

/* ============================================================
   GRADE
============================================================ */

function getGradeFromMark(
  mark: number,
) {
  if (mark >= 80) {
    return {
      grade: "A+",
      gpa: 5,
    };
  }

  if (mark >= 70) {
    return {
      grade: "A",
      gpa: 4,
    };
  }

  if (mark >= 60) {
    return {
      grade: "A-",
      gpa: 3.5,
    };
  }

  if (mark >= 50) {
    return {
      grade: "B",
      gpa: 3,
    };
  }

  if (mark >= 40) {
    return {
      grade: "C",
      gpa: 2,
    };
  }

  if (mark >= 33) {
    return {
      grade: "D",
      gpa: 1,
    };
  }

  return {
    grade: "F",
    gpa: 0,
  };
}

function formatDobForInput(
  value: string,
) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return value;
}

function normalizeDob(
  value: string,
) {
  return value.trim().toLowerCase();
}

/* ============================================================
   INDIVIDUAL RESULT TYPE
============================================================ */

type IndividualResultData = {
  student: Student;
  enrollment: Enrollment;
  exam: Exam;
  academicYear: string;
  className: string;
  section: string;
  subjects: {
    name: string;
    marks: number | null;
    absent: boolean;
    grade: string;
  }[];
  total: number;
  average: number;
  gpa: number;
  grade: string;
  position: number | null;
  outOf: number;
};

/* ============================================================
   RESULTS PAGE
============================================================ */

function Results() {
  const { t, tb, lang } = useLang();

  /*
   * ----------------------------------------------------------
   * FILTERS
   * ----------------------------------------------------------
   */

  const [academicYear, setAcademicYear] =
    useState("");

  const [examId, setExamId] =
    useState("");

  const [className, setClassName] =
    useState("");

  /*
   * ----------------------------------------------------------
   * PUBLICATION / EXAM
   * ----------------------------------------------------------
   */

  const [publications, setPublications] =
    useState<Publication[]>([]);

  const [exams, setExams] =
    useState<Exam[]>([]);

  /*
   * ----------------------------------------------------------
   * VIEW SWITCH
   * ----------------------------------------------------------
   */

  const [activeView, setActiveView] =
    useState<
      "leaderboard" | "individual"
    >("leaderboard");

  /*
   * ----------------------------------------------------------
   * LEADERBOARD
   * ----------------------------------------------------------
   */

  const [resultRows, setResultRows] =
    useState<MeritListRow[]>([]);

  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  /*
   * ----------------------------------------------------------
   * INDIVIDUAL
   * ----------------------------------------------------------
   */

  const [studentId, setStudentId] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [individualResult, setIndividualResult] =
    useState<IndividualResultData | null>(
      null,
    );

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  const [loadingPublications, setLoadingPublications] =
    useState(true);

  const [loadingExams, setLoadingExams] =
    useState(false);

  const [loadingLeaderboard, setLoadingLeaderboard] =
    useState(false);

  const [loadingIndividual, setLoadingIndividual] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ----------------------------------------------------------
   * MARKSHEET REF
   * ----------------------------------------------------------
   */

  const marksheetRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /* ==========================================================
     NATIVE PRINT STYLES
     Print real HTML/text instead of converting the result to
     a canvas image. This keeps PDF output sharp and printable.
  ========================================================== */

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "results-print-styles";
    style.textContent = `
      @page {
        size: A4;
        margin: 10mm;
      }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }

        body * {
          visibility: hidden !important;
        }

        .results-print-area,
        .results-print-area * {
          visibility: visible !important;
        }

        .results-print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .no-print,
        .no-print * {
          display: none !important;
        }

        table {
          width: 100% !important;
          min-width: 0 !important;
          border-collapse: collapse !important;
        }

        thead {
          display: table-header-group !important;
        }

        tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        img {
          max-width: 100% !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }

        * {
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }

        .overflow-x-auto {
          overflow: visible !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  /* ==========================================================
     LOAD PUBLISHED RESULTS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadPublishedResults =
      async () => {
        setLoadingPublications(true);
        setError("");

        try {
          const {
            data,
            error: publicationError,
          } = await supabase
            .from("result_publications")
            .select(
              `
                id,
                academic_year,
                exam_id,
                class,
                section,
                status,
                published_at
              `,
            )
            .eq(
              "status",
              "published",
            )
            .order(
              "academic_year",
              {
                ascending: false,
              },
            );

          if (publicationError) {
            throw publicationError;
          }

          if (!cancelled) {
            setPublications(
              (data ??
                []) as Publication[],
            );
          }
        } catch (err) {
          console.error(
            "Published results error:",
            err,
          );

          if (!cancelled) {
            setError(
              t(
                "Unable to load published results.",
                "প্রকাশিত ফলাফল লোড করা যায়নি।",
              ),
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingPublications(
              false,
            );
          }
        }
      };

    void loadPublishedResults();

    return () => {
      cancelled = true;
    };
  }, [t]);

  /* ==========================================================
     AVAILABLE YEARS
  ========================================================== */

  const availableYears =
    useMemo(() => {
      return [
        ...new Set(
          publications.map(
            (item) =>
              String(
                item.academic_year,
              ),
          ),
        ),
      ];
    }, [publications]);

  /* ==========================================================
     DEFAULT YEAR
  ========================================================== */

  useEffect(() => {
    const firstYear =
      availableYears[0];

    if (
      !academicYear &&
      firstYear
    ) {
      setAcademicYear(
        firstYear,
      );
    }
  }, [
    academicYear,
    availableYears,
  ]);

  /* ==========================================================
     LOAD EXAMS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadExams =
      async () => {
        setExamId("");
        setClassName("");
        setResultRows([]);
        setSelectedPublication(
          null,
        );
        setIndividualResult(
          null,
        );

        if (!academicYear) {
          setExams([]);
          return;
        }

        setLoadingExams(true);

        try {
          const publishedExamIds =
            [
              ...new Set(
                publications
                  .filter(
                    (item) =>
                      String(
                        item.academic_year,
                      ) ===
                      academicYear,
                  )
                  .map(
                    (item) =>
                      item.exam_id,
                  ),
              ),
            ];

          if (
            publishedExamIds.length ===
            0
          ) {
            setExams([]);
            return;
          }

          const {
            data,
            error: examError,
          } = await supabase
            .from("exams")
            .select(
              "id, academic_year, name, status",
            )
            .eq(
              "academic_year",
              academicYear,
            )
            .in(
              "id",
              publishedExamIds,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            );

          if (examError) {
            throw examError;
          }

          if (!cancelled) {
            setExams(
              (data ??
                []) as Exam[],
            );
          }
        } catch (err) {
          console.error(
            "Exams error:",
            err,
          );

          if (!cancelled) {
            setError(
              t(
                "Unable to load examinations.",
                "পরীক্ষার তথ্য লোড করা যায়নি।",
              ),
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingExams(
              false,
            );
          }
        }
      };

    void loadExams();

    return () => {
      cancelled = true;
    };
  }, [
    academicYear,
    publications,
    t,
  ]);

  /* ==========================================================
     AVAILABLE CLASSES
  ========================================================== */

  const availableClasses =
    useMemo(() => {
      if (
        !academicYear ||
        !examId
      ) {
        return [];
      }

      return [
        ...new Set(
          publications
            .filter(
              (item) =>
                String(
                  item.academic_year,
                ) ===
                  academicYear &&
                item.exam_id ===
                  examId &&
                item.status ===
                  "published",
            )
            .map(
              (item) =>
                item.class,
            ),
        ),
      ];
    }, [
      academicYear,
      examId,
      publications,
    ]);

  const selectedExam =
    exams.find(
      (exam) =>
        exam.id === examId,
    );

  /* ==========================================================
     LOAD CLASS SUBJECTS
  ========================================================== */

  const loadClassSubjects =
    async (
      databaseClass: string,
    ): Promise<SubjectInfo[]> => {
      const {
        data,
        error,
      } = await supabase
        .from("class_subjects")
        .select(
          `
            subject_id,
            sort_order,
            subjects (
              id,
              name_bn,
              name_en
            )
          `,
        )
        .eq(
          "class",
          databaseClass,
        )
        .order(
          "sort_order",
          {
            ascending: true,
          },
        );

      if (error) {
        throw error;
      }

      return (
        (data ?? []) as Array<{
          subject_id: string;
          sort_order: number;
          subjects:
            | {
                id: string;
                name_bn: string;
                name_en:
                  | string
                  | null;
              }
            | {
                id: string;
                name_bn: string;
                name_en:
                  | string
                  | null;
              }[]
            | null;
        }>
      )
        .map((row) => {
          const subject =
            Array.isArray(
              row.subjects,
            )
              ? row.subjects[0]
              : row.subjects;

          if (!subject) {
            return null;
          }

          return {
            id: subject.id,
            name_bn:
              subject.name_bn,
            name_en:
              subject.name_en,
            sort_order:
              row.sort_order,
          };
        })
        .filter(
          (
            item,
          ): item is SubjectInfo =>
            item !== null,
        )
        .sort(
          (a, b) =>
            a.sort_order -
            b.sort_order,
        );
    };

  /* ==========================================================
     LOAD ENROLLMENTS
  ========================================================== */

  const loadClassEnrollments =
    async (
      databaseClass: string,
    ): Promise<Enrollment[]> => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "student_enrollments",
        )
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
        .eq(
          "academic_year",
          academicYear,
        )
        .eq(
          "class",
          databaseClass,
        )
        .eq(
          "status",
          "active",
        );

      if (error) {
        throw error;
      }

      return (
        (data ??
          []) as Enrollment[]
      );
    };

  /* ==========================================================
     BUILD LEADERBOARD
  ========================================================== */

  const handleViewLeaderboard =
    async () => {
      setError("");
      setActiveView(
        "leaderboard",
      );
      setResultRows([]);
      setSelectedPublication(
        null,
      );

      if (!academicYear) {
        setError(
          t(
            "Please select an academic year.",
            "শিক্ষাবর্ষ নির্বাচন করুন।",
          ),
        );
        return;
      }

      if (!examId) {
        setError(
          t(
            "Please select an examination.",
            "পরীক্ষা নির্বাচন করুন।",
          ),
        );
        return;
      }

      if (!className) {
        setError(
          t(
            "Please select a class.",
            "শ্রেণি নির্বাচন করুন।",
          ),
        );
        return;
      }

      const classPublications =
        publications.filter(
          (item) =>
            String(
              item.academic_year,
            ) === academicYear &&
            item.exam_id ===
              examId &&
            item.class ===
              className &&
            item.status ===
              "published",
        );

      if (
        classPublications.length ===
        0
      ) {
        setError(
          t(
            "This class result has not been published yet.",
            "এই শ্রেণির ফলাফল এখনো প্রকাশিত হয়নি।",
          ),
        );
        return;
      }

      setLoadingLeaderboard(
        true,
      );

      try {
        const databaseClass =
          getDatabaseClassValue(
            className,
          );

        const [
          enrollments,
          subjectList,
        ] = await Promise.all([
          loadClassEnrollments(
            databaseClass,
          ),
          loadClassSubjects(
            databaseClass,
          ),
        ]);

        if (
          enrollments.length ===
          0
        ) {
          setError(
            t(
              "No students found for this class.",
              "এই শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি।",
            ),
          );
          return;
        }

        if (
          subjectList.length ===
          0
        ) {
          setError(
            t(
              "No subjects are assigned to this class.",
              "এই শ্রেণির জন্য কোনো বিষয় বরাদ্দ নেই।",
            ),
          );
          return;
        }

        const studentIds =
          enrollments.map(
            (item) =>
              item.student_record_id,
          );

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            `
              id,
              student_id,
              student_name,
              date_of_birth,
              father_name,
              mother_name
            `,
          )
          .in(
            "id",
            studentIds,
          );

        if (studentError) {
          throw studentError;
        }

        const students =
          (studentData ??
            []) as Student[];

        const studentMap =
          new Map(
            students.map(
              (student) => [
                student.id,
                student,
              ],
            ),
          );

        const enrollmentIds =
          enrollments.map(
            (item) =>
              item.id,
          );

        const {
          data: markData,
          error: markError,
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
          .eq(
            "exam_id",
            examId,
          )
          .in(
            "enrollment_id",
            enrollmentIds,
          );

        if (markError) {
          throw markError;
        }

        const marks =
          (markData ??
            []) as Mark[];

        const marksByEnrollment =
          new Map<
            string,
            Map<
              string,
              Mark
            >
          >();

        for (const mark of marks) {
          if (
            !marksByEnrollment.has(
              mark.enrollment_id,
            )
          ) {
            marksByEnrollment.set(
              mark.enrollment_id,
              new Map(),
            );
          }

          marksByEnrollment
            .get(
              mark.enrollment_id,
            )!
            .set(
              mark.subject,
              mark,
            );
        }

        /*
         * Subject keys can be stored as
         * subject names in the marks table.
         */

        const rows: MeritListRow[] =
          enrollments.map(
            (enrollment) => {
              const student =
                studentMap.get(
                  enrollment.student_record_id,
                );

              const subjectMarks =
                marksByEnrollment.get(
                  enrollment.id,
                ) ??
                new Map();

              const rowMarks: Record<
                string,
                number | null
              > = {};

              const rowAbsent: Record<
                string,
                boolean
              > = {};

              let total = 0;

              let gpaSum = 0;

              let complete = true;

              let hasFail = false;

              for (const subject of subjectList) {
                /*
                 * Try subject name in the same
                 * form used by marks table.
                 */

                const keyBn =
                  subject.name_bn;

                const keyEn =
                  subject.name_en ??
                  "";

                const mark =
                  subjectMarks.get(
                    keyBn,
                  ) ??
                  subjectMarks.get(
                    keyEn,
                  );

                const value =
                  mark?.marks ??
                  null;

                const absent =
                  mark?.is_absent ===
                  true;

                rowMarks[
                  keyBn
                ] = value;

                rowAbsent[
                  keyBn
                ] = absent;

                if (
                  absent ||
                  value === null
                ) {
                  complete = false;
                  continue;
                }

                total += value;

                const gradeInfo =
                  getGradeFromMark(
                    value,
                  );

                gpaSum +=
                  gradeInfo.gpa;

                if (
                  gradeInfo.grade ===
                  "F"
                ) {
                  hasFail = true;
                }
              }

              if (!complete) {
                return {
                  enrollment: {
                    id:
                      enrollment.id,
                    roll:
                      enrollment.roll,
                  },

                  student: {
                    student_id:
                      student?.student_id ??
                      "",
                    student_name:
                      student?.student_name ??
                      "X",
                  },

                  marks:
                    rowMarks,

                  absent:
                    rowAbsent,

                  total: null,

                  grade: "X",

                  gpa: null,

                  position: null,

                  complete: false,
                };
              }

              const gpa =
                hasFail
                  ? 0
                  : Number(
                      (
                        gpaSum /
                        subjectList.length
                      ).toFixed(2),
                    );

              const average =
                total /
                subjectList.length;

              const overallGrade =
                hasFail
                  ? "F"
                  : getGradeFromMark(
                      average,
                    ).grade;

              return {
                enrollment: {
                  id:
                    enrollment.id,
                  roll:
                    enrollment.roll,
                },

                student: {
                  student_id:
                    student?.student_id ??
                    "",
                  student_name:
                    student?.student_name ??
                    "X",
                },

                marks:
                  rowMarks,

                absent:
                  rowAbsent,

                total,

                grade:
                  overallGrade,

                gpa,

                position: null,

                complete: true,
              };
            },
          );

        /*
         * ======================================================
         * MERIT CALCULATION
         *
         * 1. Higher GPA
         * 2. If GPA equal → higher total
         * 3. If GPA + total equal → lower current roll
         * ======================================================
         */

        const meritOrder =
          rows
            .filter(
              (row) =>
                row.complete &&
                row.total !== null,
            )
            .sort(
              (a, b) => {
                const gpaA =
                  a.gpa ?? 0;

                const gpaB =
                  b.gpa ?? 0;

                if (
                  gpaA !==
                  gpaB
                ) {
                  return (
                    gpaB - gpaA
                  );
                }

                const totalA =
                  a.total ?? 0;

                const totalB =
                  b.total ?? 0;

                if (
                  totalA !==
                  totalB
                ) {
                  return (
                    totalB -
                    totalA
                  );
                }

                const rollA =
                  Number(
                    a.enrollment
                      .roll,
                  );

                const rollB =
                  Number(
                    b.enrollment
                      .roll,
                  );

                return (
                  rollA - rollB
                );
              },
            );

        /*
         * Same GPA + same total = same merit.
         */

        let lastGpa:
          | number
          | null = null;

        let lastTotal:
          | number
          | null = null;

        let lastPosition = 0;

        meritOrder.forEach(
          (row, index) => {
            const gpa =
              row.gpa ?? 0;

            const total =
              row.total ?? 0;

            if (
              lastGpa !== null &&
              lastTotal !== null &&
              gpa ===
                lastGpa &&
              total ===
                lastTotal
            ) {
              row.position =
                lastPosition;
            } else {
              row.position =
                index + 1;

              lastPosition =
                index + 1;
            }

            lastGpa = gpa;
            lastTotal = total;
          },
        );

        /*
         * ======================================================
         * DISPLAY ORDER
         *
         * ALWAYS CURRENT CLASS ROLL ASCENDING.
         *
         * This is separate from merit calculation.
         * ======================================================
         */

        const incompleteRows =
          rows.filter(
            (row) =>
              !row.complete ||
              row.total === null,
          );

        const displayRows = [
          ...meritOrder,
          ...incompleteRows,
        ].sort(
          (a, b) => {
            const rollA =
              Number(
                a.enrollment
                  .roll,
              );

            const rollB =
              Number(
                b.enrollment
                  .roll,
              );

            const validA =
              Number.isFinite(
                rollA,
              );

            const validB =
              Number.isFinite(
                rollB,
              );

            if (
              validA &&
              validB
            ) {
              return (
                rollA - rollB
              );
            }

            if (
              validA &&
              !validB
            ) {
              return -1;
            }

            if (
              !validA &&
              validB
            ) {
              return 1;
            }

            return String(
              a.enrollment
                .roll ??
                "",
            ).localeCompare(
              String(
                b.enrollment
                  .roll ??
                  "",
              ),
            );
          },
        );

        const sectionValues =
          [
            ...new Set(
              classPublications
                .map(
                  (item) =>
                    item.section,
                )
                .filter(Boolean),
            ),
          ];

        const combinedSection =
          sectionValues.length ===
          1
            ? sectionValues[0] ??
              ""
            : "";

        setSelectedPublication({
          ...classPublications[0],
          section:
            combinedSection,
        });

        setResultRows(
          displayRows,
        );
      } catch (err) {
        console.error(
          "Leaderboard error:",
          err,
        );

        setError(
          t(
            "Unable to load the leaderboard.",
            "লিডারবোর্ড লোড করা যায়নি।",
          ),
        );
      } finally {
        setLoadingLeaderboard(
          false,
        );
      }
    };

  /* ==========================================================
     PRINT / SAVE LEADERBOARD AS PDF
     Uses the browser native print engine so text stays sharp.
  ========================================================== */

  const handleDownloadLeaderboardPdf = () => {
    if (!resultRows.length || !selectedPublication) {
      return;
    }

    window.print();
  };

  /* ==========================================================
     INDIVIDUAL RESULT
  ========================================================== */

  const handleIndividualResult =
    async () => {
      setError("");
      setIndividualResult(
        null,
      );

      const id =
        studentId.trim();

      const dob =
        dateOfBirth.trim();

      if (!id) {
        setError(
          t(
            "Please enter Student ID.",
            "স্টুডেন্ট আইডি লিখুন।",
          ),
        );
        return;
      }

      if (!dob) {
        setError(
          t(
            "Please enter Date of Birth.",
            "জন্ম তারিখ লিখুন।",
          ),
        );
        return;
      }

      if (!academicYear) {
        setError(
          t(
            "Please select an academic year first.",
            "প্রথমে শিক্ষাবর্ষ নির্বাচন করুন।",
          ),
        );
        return;
      }

      if (!examId) {
        setError(
          t(
            "Please select an examination first.",
            "প্রথমে পরীক্ষা নির্বাচন করুন।",
          ),
        );
        return;
      }

      setLoadingIndividual(
        true,
      );

      try {
        /*
         * ------------------------------------------------------
         * FIND STUDENT
         * ------------------------------------------------------
         */

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            `
              id,
              student_id,
              student_name,
              date_of_birth,
              father_name,
              mother_name
            `,
          )
          .eq(
            "student_id",
            id,
          )
          .maybeSingle();

        if (studentError) {
          throw studentError;
        }

        if (!studentData) {
          setError(
            t(
              "No student found with this Student ID.",
              "এই স্টুডেন্ট আইডিতে কোনো শিক্ষার্থী পাওয়া যায়নি।",
            ),
          );
          return;
        }

        const student =
          studentData as Student;

        /*
         * ------------------------------------------------------
         * VERIFY DOB
         * ------------------------------------------------------
         */

        if (
          normalizeDob(
            String(
              student.date_of_birth ??
                "",
            ),
          ) !==
          normalizeDob(
            formatDobForInput(
              dob,
            ),
          )
        ) {
          setError(
            t(
              "Student ID and Date of Birth do not match.",
              "স্টুডেন্ট আইডি ও জন্ম তারিখ মিলছে না।",
            ),
          );
          return;
        }

        /*
         * ------------------------------------------------------
         * CHECK PUBLISHED RESULT
         * ------------------------------------------------------
         */

        const studentPublication =
          publications.find(
            (item) =>
              String(
                item.academic_year,
              ) ===
                academicYear &&
              item.exam_id ===
                examId &&
              item.status ===
                "published" &&
              (!className ||
                item.class ===
                  className),
          );

        if (
          !studentPublication
        ) {
          setError(
            t(
              "This examination result has not been published.",
              "এই পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি।",
            ),
          );
          return;
        }

        /*
         * ------------------------------------------------------
         * FIND ENROLLMENT
         * ------------------------------------------------------
         */

        const databaseClass =
          getDatabaseClassValue(
            studentPublication.class,
          );

        const {
          data: enrollmentData,
          error: enrollmentError,
        } = await supabase
          .from(
            "student_enrollments",
          )
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
          .eq(
            "student_record_id",
            student.id,
          )
          .eq(
            "academic_year",
            academicYear,
          )
          .eq(
            "class",
            databaseClass,
          )
          .eq(
            "status",
            "active",
          )
          .maybeSingle();

        if (enrollmentError) {
          throw enrollmentError;
        }

        if (!enrollmentData) {
          setError(
            t(
              "No active enrollment found for this student.",
              "এই শিক্ষার্থীর সক্রিয় এনরোলমেন্ট পাওয়া যায়নি।",
            ),
          );
          return;
        }

        const enrollment =
          enrollmentData as Enrollment;

        /*
         * ------------------------------------------------------
         * SUBJECTS
         * ------------------------------------------------------
         */

        const subjectList =
          await loadClassSubjects(
            databaseClass,
          );

        /*
         * ------------------------------------------------------
         * MARKS
         * ------------------------------------------------------
         */

        const {
          data: markData,
          error: markError,
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
          .eq(
            "exam_id",
            examId,
          )
          .eq(
            "enrollment_id",
            enrollment.id,
          );

        if (markError) {
          throw markError;
        }

        const marks =
          (markData ??
            []) as Mark[];

        const markMap =
          new Map<
            string,
            Mark
          >();

        for (const mark of marks) {
          markMap.set(
            mark.subject,
            mark,
          );
        }

        /*
         * ------------------------------------------------------
         * INDIVIDUAL SUBJECT RESULTS
         * ------------------------------------------------------
         */

        let total = 0;
        let gpaSum = 0;
        let hasFail = false;
        let complete = true;

        const subjects =
          subjectList.map(
            (subject) => {
              const mark =
                markMap.get(
                  subject.name_bn,
                ) ??
                markMap.get(
                  subject.name_en ??
                    "",
                );

              const value =
                mark?.marks ??
                null;

              const absent =
                mark?.is_absent ===
                true;

              if (
                absent ||
                value === null
              ) {
                complete = false;

                return {
                  name:
                    lang === "bn"
                      ? subject.name_bn
                      : subject.name_en ??
                        subject.name_bn,

                  marks: null,

                  absent: true,

                  grade: "X",
                };
              }

              total += value;

              const gradeInfo =
                getGradeFromMark(
                  value,
                );

              gpaSum +=
                gradeInfo.gpa;

              if (
                gradeInfo.grade ===
                "F"
              ) {
                hasFail = true;
              }

              return {
                name:
                  lang === "bn"
                    ? subject.name_bn
                    : subject.name_en ??
                      subject.name_bn,

                marks: value,

                absent: false,

                grade:
                  gradeInfo.grade,
              };
            },
          );

        /*
         * ------------------------------------------------------
         * OVERALL RESULT
         * ------------------------------------------------------
         */

        if (!complete) {
          setError(
            t(
              "This student's result is incomplete.",
              "এই শিক্ষার্থীর ফলাফল অসম্পূর্ণ।",
            ),
          );
          return;
        }

        const average =
          total /
          subjectList.length;

        const gpa =
          hasFail
            ? 0
            : Number(
                (
                  gpaSum /
                  subjectList.length
                ).toFixed(2),
              );

        const overallGrade =
          hasFail
            ? "F"
            : getGradeFromMark(
                average,
              ).grade;

        /*
         * ------------------------------------------------------
         * GET CLASS LEADERBOARD FOR POSITION
         * ------------------------------------------------------
         *
         * We use the exact same merit rules:
         *
         * GPA ↓
         * Total ↓
         * Roll ↑
         * ------------------------------------------------------
         */

        const classEnrollments =
          await loadClassEnrollments(
            databaseClass,
          );

        const classEnrollmentIds =
          classEnrollments.map(
            (item) =>
              item.id,
          );

        const {
          data: classMarkData,
          error:
            classMarkError,
        } = await supabase
          .from("marks")
          .select(
            `
              enrollment_id,
              subject,
              marks,
              is_absent
            `,
          )
          .eq(
            "exam_id",
            examId,
          )
          .in(
            "enrollment_id",
            classEnrollmentIds,
          );

        if (classMarkError) {
          throw classMarkError;
        }

        const classMarks =
          (classMarkData ??
            []) as Array<{
              enrollment_id: string;
              subject: string;
              marks: number | null;
              is_absent: boolean;
            }>;

        const classMarkMap =
          new Map<
            string,
            Map<
              string,
              {
                marks:
                  | number
                  | null;
                is_absent: boolean;
              }
            >
          >();

        for (const mark of classMarks) {
          if (
            !classMarkMap.has(
              mark.enrollment_id,
            )
          ) {
            classMarkMap.set(
              mark.enrollment_id,
              new Map(),
            );
          }

          classMarkMap
            .get(
              mark.enrollment_id,
            )!
            .set(mark.subject, {
              marks: mark.marks,
              is_absent:
                mark.is_absent,
            });
        }

        const classRankRows =
          classEnrollments
            .map(
              (item) => {
                const map =
                  classMarkMap.get(
                    item.id,
                  ) ??
                  new Map();

                let studentTotal =
                  0;

                let studentGpaSum =
                  0;

                let studentComplete =
                  true;

                let studentHasFail =
                  false;

                for (const subject of subjectList) {
                  const mark =
                    map.get(
                      subject.name_bn,
                    ) ??
                    map.get(
                      subject.name_en ??
                        "",
                    );

                  const value =
                    mark?.marks ??
                    null;

                  const absent =
                    mark?.is_absent ===
                    true;

                  if (
                    absent ||
                    value === null
                  ) {
                    studentComplete =
                      false;
                    continue;
                  }

                  studentTotal +=
                    value;

                  const info =
                    getGradeFromMark(
                      value,
                    );

                  studentGpaSum +=
                    info.gpa;

                  if (
                    info.grade ===
                    "F"
                  ) {
                    studentHasFail =
                      true;
                  }
                }

                if (
                  !studentComplete
                ) {
                  return {
                    enrollment:
                      item,
                    total: null,
                    gpa: null,
                  };
                }

                return {
                  enrollment:
                    item,
                  total:
                    studentTotal,
                  gpa:
                    studentHasFail
                      ? 0
                      : Number(
                          (
                            studentGpaSum /
                            subjectList.length
                          ).toFixed(
                            2,
                          ),
                        ),
                };
              },
            )
            .filter(
              (
                item,
              ) =>
                item.total !==
                  null &&
                item.gpa !== null,
            )
            .sort(
              (a, b) => {
                const gpaDiff =
                  (b.gpa ??
                    0) -
                  (a.gpa ??
                    0);

                if (
                  gpaDiff !==
                  0
                ) {
                  return gpaDiff;
                }

                const totalDiff =
                  (b.total ??
                    0) -
                  (a.total ??
                    0);

                if (
                  totalDiff !==
                  0
                ) {
                  return totalDiff;
                }

                return (
                  Number(
                    a.enrollment
                      .roll,
                  ) -
                  Number(
                    b.enrollment
                      .roll,
                  )
                );
              },
            );

        const targetIndex =
          classRankRows.findIndex(
            (item) =>
              item.enrollment.id ===
              enrollment.id,
          );

        let position:
          | number
          | null =
          targetIndex >= 0
            ? targetIndex + 1
            : null;

        /*
         * Same GPA + total = same merit.
         */

        if (
          targetIndex >= 0
        ) {
          const target =
            classRankRows[
              targetIndex
            ];

          if (
            target
          ) {
            const sameEarlier =
              classRankRows.findIndex(
                (item) =>
                  item.gpa ===
                    target.gpa &&
                  item.total ===
                    target.total,
              );

            if (
              sameEarlier >=
                0
            ) {
              position =
                sameEarlier +
                1;
            }
          }
        }

        setIndividualResult({
          student,

          enrollment,

          exam:
            selectedExam ??
            ({
              id: examId,
              academic_year:
                academicYear,
              name: "",
            } as Exam),

          academicYear,

          className:
            studentPublication.class,

          section:
            enrollment.section ??
            "",

          subjects,

          total,

          average,

          gpa,

          grade:
            overallGrade,

          position,

          outOf:
            classRankRows.length,
        });
      } catch (err) {
        console.error(
          "Individual result error:",
          err,
        );

        setError(
          t(
            "Unable to load the individual result.",
            "ব্যক্তিগত ফলাফল লোড করা যায়নি।",
          ),
        );
      } finally {
        setLoadingIndividual(
          false,
        );
      }
    };

  /* ==========================================================
     PRINT INDIVIDUAL RESULT
  ========================================================== */

  const handlePrintIndividual =
    () => {
      window.print();
    };

  /* ==========================================================
     PRINT / SAVE INDIVIDUAL RESULT AS PDF
     Uses the browser native print engine.
  ========================================================== */

  /* ==========================================================
     INDIVIDUAL MARKSHEET
     SAME STYLE AS THE SUPPLIED MARKSHEET
  ========================================================== */

  const IndividualMarksheet =
    individualResult
      ? () => (
          <div
            ref={marksheetRef}
            className="results-print-area overflow-hidden bg-white"
          >
            {/* HEADER */}

            <header className="flex flex-col items-center gap-3 border-b-2 border-primary pb-5 text-center">
              <img
                src={logo}
                alt=""
                width={64}
                height={64}
                className="size-14"
              />

              <div>
                <h2 className="text-lg font-bold text-primary">
                  {t(
                    "Al Eman Islamic Academy",
                    "আল ঈমান ইসলামিক একাডেমি",
                  )}
                </h2>

                <p className="text-xs text-muted-foreground">
                  Kamal Para, Fotika,
                  Hathazari,
                  Chattogram,
                  Bangladesh
                </p>

                <p className="mt-1.5 text-sm font-semibold text-gold-foreground">
                  {
                    individualResult
                      .exam.name
                  }
                </p>
              </div>
            </header>

            {/* STUDENT INFORMATION */}

            <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                [
                  t(
                    "Name",
                    "নাম",
                  ),
                  individualResult
                    .student
                    .student_name,
                ],

                [
                  t(
                    "Class / Section",
                    "শ্রেণি / শাখা",
                  ),
                  `${getClassLabel(
                    individualResult.className,
                    "bn",
                  )} — ${
                    individualResult.section ||
                    "X"
                  }`,
                ],

                [
                  t(
                    "Father's Name",
                    "পিতার নাম",
                  ),
                  individualResult
                    .student
                    .father_name ??
                    "X",
                ],
                [
                  t(
                    "Student ID",
                    "স্টুডেন্ট আইডি",
                  ),
                  individualResult
                    .student
                    .student_id,
                ],
                [
                  t(
                    "Mother's Name",
                    "মাতার নাম",
                  ),
                  individualResult
                    .student
                    .mother_name ??
                    "X",
                ],

                [
                  t(
                    "Roll",
                    "রোল",
                  ),
                  individualResult
                    .enrollment
                    .roll ??
                    "X",
                ],

                [
                  t(
                    "Session",
                    "শিক্ষাবর্ষ",
                  ),
                  individualResult
                    .academicYear,
                ],

              ].map(
                ([label, value]) => (
                  <div
                    key={label}
                    className="flex gap-2"
                  >
                    <dt className="min-w-32 font-semibold text-muted-foreground">
                      {label}
                    </dt>

                    <dd className="font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ),
              )}
            </dl>

            {/* SUBJECT TABLE */}

            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  {t(
                    "Subject-wise marks",
                    "বিষয়ভিত্তিক নম্বর",
                  )}
                </caption>

                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">
                      {t(
                        "Subject",
                        "বিষয়",
                      )}
                    </th>

                    <th className="px-4 py-2.5 text-right font-semibold">
                      {t(
                        "Marks",
                        "নম্বর",
                      )}
                    </th>

                    <th className="px-4 py-2.5 text-right font-semibold">
                      {t(
                        "Grade",
                        "গ্রেড",
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {individualResult.subjects.map(
                    (
                      subject,
                      index,
                    ) => (
                      <tr
                        key={`${subject.name}-${index}`}
                        className="odd:bg-muted/40"
                      >
                        <td className="px-4 py-2.5">
                          {
                            subject.name
                          }
                        </td>

                        <td className="px-4 py-2.5 text-right font-medium">
                          {subject.marks ??
                            "X"}
                        </td>

                        <td className="px-4 py-2.5 text-right font-semibold text-primary">
                          {
                            subject.grade
                          }
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>

                <tfoot className="bg-secondary font-semibold">
                  <tr>
                    <td className="px-4 py-2.5">
                      {t(
                        "Total",
                        "মোট",
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      {
                        individualResult.total
                      }
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      {individualResult.average.toFixed(
                        2,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SUMMARY CARDS */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                [
                  t(
                    "GPA",
                    "জিপিএ",
                  ),
                  individualResult.gpa.toFixed(
                    2,
                  ),
                ],

                [
                  t(
                    "Grade",
                    "গ্রেড",
                  ),
                  individualResult.grade,
                ],

                [
                  t(
                    "Position",
                    "মেধাক্রম",
                  ),
                  individualResult.position !==
                  null
                    ? `${individualResult.position} / ${individualResult.outOf}`
                    : "X",
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-primary/5 p-4 text-center"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>

                    <p className="mt-1 text-xl font-bold text-primary">
                      {value}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              {t(
                "This is a computer-generated marksheet and does not require a signature.",
                "এটি কম্পিউটারে তৈরি মার্কশিট, স্বাক্ষরের প্রয়োজন নেই।",
              )}
            </p>
          </div>
        )
      : null;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <PageHero
        crumb={t(
          "Results",
          "ফলাফল",
        )}
        title={t(
          "Examination Results",
          "পরীক্ষার ফলাফল",
        )}
        subtitle={t(
          "View published class merit lists or find an individual student result.",
          "প্রকাশিত মেধা তালিকা দেখুন অথবা একজন শিক্ষার্থীর ব্যক্তিগত ফলাফল খুঁজুন।",
        )}
      />

      <Section>
        {/* ====================================================
            MOBILE VIEW SWITCH
            Desktop keeps both panels visible side-by-side.
        ==================================================== */}

        <div className="mx-auto mb-5 max-w-7xl lg:hidden">
          <div className="grid grid-cols-2 rounded-2xl border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setActiveView("leaderboard");
                setIndividualResult(null);
                setError("");
              }}
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                activeView === "leaderboard"
                  ? "bg-[#006B4F] text-white shadow-sm"
                  : "text-[#006B4F] hover:bg-[#EEF7F2]"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Trophy className="size-4" />
                {t("Leaderboard", "লিডারবোর্ড")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("individual");
                setResultRows([]);
                setSelectedPublication(null);
                setError("");
              }}
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                activeView === "individual"
                  ? "bg-[#006B4F] text-white shadow-sm"
                  : "text-[#006B4F] hover:bg-[#EEF7F2]"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <UserRound className="size-4" />
                {t("Individual", "ব্যক্তিগত")}
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================
            TWO INDEPENDENT RESULT PANELS
            Desktop: side-by-side
            Phone: selected panel only
        ==================================================== */}

        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">

          {/* ==================================================
              LEADERBOARD PANEL
          ================================================== */}

          <div
            className={`${
              activeView === "leaderboard"
                ? "block"
                : "hidden lg:block"
            }`}
          >
            <div className="surface-card overflow-hidden">
              {/* PANEL HEADER */}

              <div className="border-b border-border px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F2] text-[#006B4F]">
                    <Trophy className="size-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-primary">
                      {t(
                        "Leaderboard / Merit List",
                        "লিডারবোর্ড / মেধা তালিকা",
                      )}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {t(
                        "Select year, examination and class.",
                        "শিক্ষাবর্ষ, পরীক্ষা ও শ্রেণি নির্বাচন করুন।",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* LEADERBOARD FILTERS */}

              <div className="p-5 sm:p-7">
                <div className="grid gap-5">

                  <Field
                    label={t(
                      "Academic Year",
                      "শিক্ষাবর্ষ",
                    )}
                  >
                    <select
                      value={academicYear}
                      onChange={(event) => {
                        setAcademicYear(event.target.value);
                        setExamId("");
                        setClassName("");
                        setResultRows([]);
                        setSelectedPublication(null);
                        setIndividualResult(null);
                        setError("");
                      }}
                      className={inputClass}
                      disabled={loadingPublications}
                    >
                      <option value="">
                        {t(
                          "Select year",
                          "শিক্ষাবর্ষ নির্বাচন করুন",
                        )}
                      </option>

                      {availableYears.map((year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={t(
                      "Examination",
                      "পরীক্ষা",
                    )}
                  >
                    <select
                      value={examId}
                      onChange={(event) => {
                        setExamId(event.target.value);
                        setClassName("");
                        setResultRows([]);
                        setSelectedPublication(null);
                        setIndividualResult(null);
                        setError("");
                      }}
                      className={inputClass}
                      disabled={!academicYear || loadingExams}
                    >
                      <option value="">
                        {loadingExams
                          ? t(
                              "Loading...",
                              "লোড হচ্ছে...",
                            )
                          : t(
                              "Select examination",
                              "পরীক্ষা নির্বাচন করুন",
                            )}
                      </option>

                      {exams.map((exam) => (
                        <option
                          key={exam.id}
                          value={exam.id}
                        >
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={t(
                      "Class",
                      "শ্রেণি",
                    )}
                  >
                    <select
                      value={className}
                      onChange={(event) => {
                        setClassName(event.target.value);
                        setResultRows([]);
                        setSelectedPublication(null);
                        setIndividualResult(null);
                        setError("");
                      }}
                      className={inputClass}
                      disabled={!examId}
                    >
                      <option value="">
                        {t(
                          "Select class",
                          "শ্রেণি নির্বাচন করুন",
                        )}
                      </option>

                      {availableClasses.map((value) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {getClassLabel(
                            value,
                            lang === "bn" ? "bn" : "en",
                          )}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <ActionButton
                  type="button"
                  onClick={() => void handleViewLeaderboard()}
                  disabled={
                    loadingLeaderboard ||
                    !academicYear ||
                    !examId ||
                    !className
                  }
                  className="mt-6 w-full py-3.5"
                >
                  {loadingLeaderboard ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trophy className="size-4" />
                  )}

                  {loadingLeaderboard
                    ? t(
                        "Loading...",
                        "লোড হচ্ছে...",
                      )
                    : t(
                        "View Leaderboard",
                        "লিডারবোর্ড দেখুন",
                      )}
                </ActionButton>

                {error && activeView === "leaderboard" ? (
                  <p
                    className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            {/* LEADERBOARD RESULT */}

            {resultRows.length ? (
              <div className="results-print-area mt-6 overflow-hidden rounded-2xl border border-[#006B4F]/15 bg-white shadow-lg">

                <div className="flex flex-col gap-4 bg-[#006B4F] px-5 py-6 text-white sm:px-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                      <Award className="size-5" />

                      <span className="text-xs font-bold uppercase tracking-[0.14em]">
                        {t(
                          "Official Leaderboard",
                          "অফিসিয়াল মেধা তালিকা",
                        )}
                      </span>
                    </div>

                    <h2 className="mt-2 text-2xl font-black">
                      {getClassLabel(
                        selectedPublication?.class ?? className,
                        "bn",
                      )}

                      {selectedPublication?.section
                        ? ` — ${selectedPublication.section}`
                        : ""}
                    </h2>

                    <p className="mt-1 text-sm text-white/75">
                      {selectedExam?.name} · {academicYear}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadLeaderboardPdf}
                    className="no-print inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#B9962E]"
                  >
                    <Printer className="size-4" />
                    {t(
                      "Print / Save as PDF",
                      "প্রিন্ট / PDF হিসেবে সংরক্ষণ",
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px]">
                    <thead className="bg-[#EEF7F2] text-[#00563F]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-bold">
                          {t("SL", "ক্রম")}
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold">
                          {t("Student", "পরীক্ষার্থীর নাম")}
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold">
                          {t("Total", "সর্বমোট")}
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold">
                          {t("Grade", "গ্রেড")}
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold">
                          GPA
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold">
                          {t("Merit", "মেধাক্রম")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {resultRows.map((row, index) => (
                        <tr
                          key={row.enrollment.id}
                          className="border-t border-slate-100 transition hover:bg-[#F7FBF8]"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">
                              {row.student.student_name}
                            </div>

                            <div className="mt-0.5 text-xs text-slate-400">
                              {row.student.student_id
                                ? `ID: ${row.student.student_id} · `
                                : ""}

                              {t("Roll", "রোল")}:{" "}
                              {row.enrollment.roll ?? "X"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center text-base font-black text-[#006B4F]">
                            {row.total ?? "X"}
                          </td>

                          <td className="px-5 py-4 text-center font-bold">
                            {row.grade}
                          </td>

                          <td className="px-5 py-4 text-center font-semibold">
                            {row.gpa !== null
                              ? row.gpa.toFixed(2)
                              : "X"}
                          </td>

                          <td className="px-5 py-4 text-center">
                            {row.position !== null ? (
                              <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-[#EEF7F2] px-3 py-1 font-black text-[#006B4F]">
                                {row.position}
                              </span>
                            ) : (
                              <span className="font-semibold text-slate-400">
                                X
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="surface-card mt-6 p-8 text-center sm:p-10">
                <Trophy className="mx-auto h-10 w-10 text-[#006B4F]/40" />

                <h3 className="mt-4 text-lg font-bold text-primary">
                  {t(
                    "View the class leaderboard",
                    "ক্লাস লিডারবোর্ড দেখুন",
                  )}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {t(
                    "Select the year, examination and class above, then click the button.",
                    "উপরে শিক্ষাবর্ষ, পরীক্ষা ও শ্রেণি নির্বাচন করে বোতামে ক্লিক করুন।",
                  )}
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              INDIVIDUAL RESULT PANEL
          ================================================== */}

          <div
            className={`${
              activeView === "individual"
                ? "block"
                : "hidden lg:block"
            }`}
          >
            <div className="surface-card overflow-hidden">
              {/* PANEL HEADER */}

              <div className="border-b border-border px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F2] text-[#006B4F]">
                    <UserRound className="size-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-primary">
                      {t(
                        "Individual Result",
                        "ব্যক্তিগত ফলাফল",
                      )}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {t(
                        "Enter Student ID and Date of Birth.",
                        "স্টুডেন্ট আইডি ও জন্ম তারিখ দিন।",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {/* INDIVIDUAL YEAR / EXAM */}

                <div className="grid gap-5">
                  <Field
                    label={t(
                      "Academic Year",
                      "শিক্ষাবর্ষ",
                    )}
                  >
                    <select
                      value={academicYear}
                      onChange={(event) => {
                        setAcademicYear(event.target.value);
                        setExamId("");
                        setClassName("");
                        setResultRows([]);
                        setSelectedPublication(null);
                        setIndividualResult(null);
                        setError("");
                      }}
                      className={inputClass}
                      disabled={loadingPublications}
                    >
                      <option value="">
                        {t(
                          "Select year",
                          "শিক্ষাবর্ষ নির্বাচন করুন",
                        )}
                      </option>

                      {availableYears.map((year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={t(
                      "Examination",
                      "পরীক্ষা",
                    )}
                  >
                    <select
                      value={examId}
                      onChange={(event) => {
                        setExamId(event.target.value);
                        setClassName("");
                        setResultRows([]);
                        setSelectedPublication(null);
                        setIndividualResult(null);
                        setError("");
                      }}
                      className={inputClass}
                      disabled={!academicYear || loadingExams}
                    >
                      <option value="">
                        {loadingExams
                          ? t(
                              "Loading...",
                              "লোড হচ্ছে...",
                            )
                          : t(
                              "Select examination",
                              "পরীক্ষা নির্বাচন করুন",
                            )}
                      </option>

                      {exams.map((exam) => (
                        <option
                          key={exam.id}
                          value={exam.id}
                        >
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label={t(
                        "Student ID",
                        "স্টুডেন্ট আইডি",
                      )}
                    >
                      <input
                        value={studentId}
                        onChange={(event) =>
                          setStudentId(event.target.value)
                        }
                        className={inputClass}
                        maxLength={40}
                        placeholder="27-001"
                        autoComplete="off"
                      />
                    </Field>

                    <Field
                      label={t(
                        "Date of Birth",
                        "জন্ম তারিখ",
                      )}
                    >
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) =>
                          setDateOfBirth(event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <ActionButton
                  type="button"
                  onClick={() =>
                    void handleIndividualResult()
                  }
                  disabled={
                    loadingIndividual ||
                    !studentId ||
                    !dateOfBirth
                  }
                  className="mt-6 w-full py-3.5"
                >
                  {loadingIndividual ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}

                  {loadingIndividual
                    ? t(
                        "Checking...",
                        "যাচাই হচ্ছে...",
                      )
                    : t(
                        "View Individual Result",
                        "ব্যক্তিগত ফলাফল দেখুন",
                      )}
                </ActionButton>

                {error && activeView === "individual" ? (
                  <p
                    className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            {/* INDIVIDUAL RESULT */}

            {individualResult ? (
              <div className="mx-auto mt-6 max-w-4xl">
                <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handlePrintIndividual}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    <Printer className="size-3.5" />
                    {t(
                      "Print / Save as PDF",
                      "প্রিন্ট / PDF হিসেবে সংরক্ষণ",
                    )}
                  </button>
                </div>

                <div className="surface-card overflow-hidden p-6 sm:p-8">
                  <IndividualMarksheet />
                </div>
              </div>
            ) : (
              <div className="surface-card mt-6 p-8 text-center sm:p-10">
                <UserRound className="mx-auto h-10 w-10 text-[#006B4F]/40" />

                <h3 className="mt-4 text-lg font-bold text-primary">
                  {t(
                    "Find an individual result",
                    "ব্যক্তিগত ফলাফল খুঁজুন",
                  )}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {t(
                    "Choose the year and examination, then enter Student ID and Date of Birth.",
                    "শিক্ষাবর্ষ ও পরীক্ষা নির্বাচন করে স্টুডেন্ট আইডি এবং জন্ম তারিখ দিন।",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
