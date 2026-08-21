
import { useCallback, useEffect, useMemo,useState,} from "react";
import { AlertTriangle,CheckCircle2,Eye,FileDown,Pencil,  Printer,  Upload,  Users, Trophy, XCircle, Turtle,} from "lucide-react";
import { CLASS_OPTIONS } from "@/lib/admin/classOptions";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { generateFullResultPdf,} from "@/lib/pdf/resultPdf";
import {generateMeritListPdf,} from "@/lib/pdf/meritListPdf";
function getDatabaseClassValue(
  classValue: string,
): string {
  const option = CLASS_OPTIONS.find(
    (item) => item.value === classValue,
  );

  return option?.bn ?? classValue;
}
type Exam = {
  id: string;
  academic_year: string;
  name: string;
  status: string;
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
};

type Mark = {
  id: string;
  enrollment_id: string;
  exam_id: string;
  subject: string;
  marks: number | null;
  is_absent: boolean;
};

type ResultStatus =
  | "draft"
  | "validated"
  | "published";

type ResultRow = {
  enrollment: Enrollment;
  student: Student;
  marks: Record<string, number | null>;
  absent: Record<string, boolean>;
  total: number | null;
  average: number | null;
  grade: string;
  gpa: number | null;
  position: number | null;
  complete: boolean;
};

const YEARS = (() => {
  const currentYear = new Date().getFullYear();

  return [
    String(currentYear - 1),
    String(currentYear),
    String(currentYear + 1),
  ];
})();

const SECTION_OPTIONS = ["A", "B", "C"];

const PASS_MARK = 33;

function getGrade(mark: number): {
  grade: string;
  gpa: number;
} {
  if (mark >= 80) return { grade: "A+", gpa: 5.0 };
  if (mark >= 70) return { grade: "A", gpa: 4.0 };
  if (mark >= 60) return { grade: "A-", gpa: 3.5 };
  if (mark >= 50) return { grade: "B", gpa: 3.0 };
  if (mark >= 40) return { grade: "C", gpa: 2.0 };
  if (mark >= 33) return { grade: "D", gpa: 1.0 };

  return { grade: "F", gpa: 0 };
}

function getClassLabel(
  value: string,
  lang: "en" | "bn",
) {
  const labels: Record<
    string,
    { en: string; bn: string }
  > = {
    Play: {
      en: "Play",
      bn: "প্লে",
    },
    KG: {
      en: "KG",
      bn: "কেজি",
    },
    "Class I": {
      en: "Class I",
      bn: "প্রথম শ্রেণি",
    },
    "Class II": {
      en: "Class II",
      bn: "দ্বিতীয় শ্রেণি",
    },
    "Class III": {
      en: "Class III",
      bn: "তৃতীয় শ্রেণি",
    },
    "Class IV": {
      en: "Class IV",
      bn: "চতুর্থ শ্রেণি",
    },
    "Class V": {
      en: "Class V",
      bn: "পঞ্চম শ্রেণি",
    },
    "Class VI": {
      en: "Class VI",
      bn: "ষষ্ঠ শ্রেণি",
    },
    "Class VII": {
      en: "Class VII",
      bn: "সপ্তম শ্রেণি",
    },
    "Class VIII": {
      en: "Class VIII",
      bn: "অষ্টম শ্রেণি",
    },
    "Class IX": {
      en: "Class IX",
      bn: "নবম শ্রেণি",
    },
    "Class X": {
      en: "Class X",
      bn: "দশম শ্রেণি",
    },
  };

  return labels[value]?.[lang] ?? value;
}

export function PublishResultsManager() {
  const { t, lang } = useLang();

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [academicYear, setAcademicYear] =
    useState(String(new Date().getFullYear()));

  const [className, setClassName] =
    useState("");

  const [section, setSection] =
    useState("A");

  const [examId, setExamId] =
    useState("");

  const [classSubjects, setClassSubjects] =
    useState<string[]>([]);

  const [exams, setExams] =
    useState<Exam[]>([]);

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [marks, setMarks] =
    useState<Mark[]>([]);

  const [loadingExams, setLoadingExams] =
    useState(false);

  const [loadingResults, setLoadingResults] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  const [status, setStatus] =
    useState<ResultStatus>("draft");

  const [publicationId, setPublicationId] =
    useState<string | null>(null);

  const [publishedAt, setPublishedAt] =
    useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<ResultRow | null>(null);
  const [isEditingStudent, setIsEditingStudent] =
    useState(false);

  const [editMarks, setEditMarks] =
    useState<Record<string, string>>({});

  const [savingStudentMarks, setSavingStudentMarks] =
    useState(false);
  const [ generatingFullPdf,setGeneratingFullPdf,] = 
    useState(false);

  const PUBLISH_PASSKEY = "802313";
  
  const [publishDialogOpen, setPublishDialogOpen] =
    useState(false);

  const [publishPasskey, setPublishPasskey] =
    useState("");

  const [publishPasskeyError, setPublishPasskeyError] =
    useState(false);

  const [unpublishDialogOpen, setUnpublishDialogOpen] =
    useState(false);

  const [unpublishPasskey, setUnpublishPasskey] =
    useState("");

  const [unpublishPasskeyError, setUnpublishPasskeyError] =
    useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [unpublishSuccess, setUnpublishSuccess] = useState(false);
  // ---------------------------------------------------------
  // LOAD SUBJECTS FOR SELECTED CLASS
  // ---------------------------------------------------------

    const loadClassSubjects = useCallback(
  async (selectedClass: string) => {
    if (!selectedClass) {
      setClassSubjects([]);
      return;
    }

    const databaseClass =
      getDatabaseClassValue(selectedClass);

    try {
      // 1. Get subjects assigned to this class
      const { data: classSubjectData, error: classSubjectError } =
        await supabase
          .from("class_subjects")
          .select("subject_id, sort_order")
          .eq("class", databaseClass)
          .order("sort_order", {
            ascending: true,
          });

      if (classSubjectError) {
        throw classSubjectError;
      }

      const subjectIds =
        (classSubjectData ?? [])
          .map((row) => row.subject_id)
          .filter(Boolean);

      if (subjectIds.length === 0) {
        setClassSubjects([]);
        return;
      }

      // 2. Get subject names
      const { data: subjectData, error: subjectError } =
        await supabase
          .from("subjects")
          .select("id, name_bn")
          .in("id", subjectIds);

      if (subjectError) {
        throw subjectError;
      }

      // 3. Create ID → Bangla name map
      const subjectMap = new Map(
        (subjectData ?? []).map((subject) => [
          subject.id,
          subject.name_bn,
        ]),
      );

      // 4. Keep the exact class_subjects sort order
      const subjectNames =
        (classSubjectData ?? [])
          .sort(
            (a, b) =>
              a.sort_order - b.sort_order,
          )
          .map(
            (row) =>
              subjectMap.get(row.subject_id) ?? "",
          )
          .filter(Boolean);

      console.log(
        "FINAL SUBJECTS:",
        subjectNames,
      );

      setClassSubjects(subjectNames);
    } catch (error) {
      console.error(
        "Failed to load class subjects:",
        error,
      );

      setClassSubjects([]);

      toast.error(
        t(
          "Unable to load subjects.",
          "বিষয়ের তথ্য লোড করা যায়নি।",
        ),
      );
    }
  },
  [t],
);


  // ---------------------------------------------------------
  // LOAD SUBJECTS WHEN CLASS CHANGES
  // ---------------------------------------------------------

  useEffect(() => {
    void loadClassSubjects(className);
  }, [
    className,
    loadClassSubjects,
  ]);

  // ---------------------------------------------------------
  // LOAD EXAMS
  // ---------------------------------------------------------

  const loadExams = useCallback(async () => {
    setLoadingExams(true);

    try {
      const { data, error } = await supabase
        .from("exams")
        .select(
          "id, academic_year, name, status",
        )
        .eq(
          "academic_year",
          academicYear,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setExams(
        (data ?? []) as Exam[],
      );

      if (
        examId &&
        !(data ?? []).some(
          (exam) => exam.id === examId,
        )
      ) {
        setExamId("");
      }
    } catch (error) {
      console.error(
        "Exam loading error:",
        error,
      );

      toast.error(
        t(
          "Unable to load examinations.",
          "পরীক্ষার তথ্য লোড করা যায়নি।",
        ),
      );
    } finally {
      setLoadingExams(false);
    }
  }, [
    academicYear,
    examId,
    t,
  ]);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  /*
   * ---------------------------------------------------------
   * LOAD CLASS RESULT
   * ---------------------------------------------------------
   */

  const loadResults = async () => {
    if (!academicYear) {
      toast.error(
        t(
          "Select an academic year.",
          "শিক্ষাবর্ষ নির্বাচন করুন।",
        ),
      );
      return;
    }

    if (!className) {
      toast.error(
        t(
          "Select a class.",
          "শ্রেণি নির্বাচন করুন।",
        ),
      );
      return;
    }

    if (!examId) {
      toast.error(
        t(
          "Select an examination.",
          "পরীক্ষা নির্বাচন করুন।",
        ),
      );
      return;
    }

    setLoadingResults(true);
    setLoaded(false);
    try {
      /*
       * 1. Load active enrollments
       */

      let enrollmentQuery =
        supabase
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
            .in("class", [
            className,
            getDatabaseClassValue(className),
            ])
            .eq("status", "active");

      if (section) {
        enrollmentQuery =
          enrollmentQuery.eq(
            "section",
            section,
          );
      }

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await enrollmentQuery;

      if (enrollmentError) {
        throw enrollmentError;
      }

      const enrollmentRows =
        (enrollmentData ?? []) as Enrollment[];

      setEnrollments(enrollmentRows);

      if (enrollmentRows.length === 0) {
        setStudents([]);
        setMarks([]);
        setLoaded(true);

        toast.info(
          t(
            "No students found for this class and section.",
            "এই শ্রেণি ও শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি।",
          ),
        );

        return;
      }

      /*
       * 2. Load students
       */

      const studentIds = [
        ...new Set(
          enrollmentRows.map(
            (item) =>
              item.student_record_id,
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

      if (studentError) {
        throw studentError;
      }

      setStudents(
        (studentData ?? []) as Student[],
      );

      /*
       * 3. Load ALL marks for this
       * examination and these enrollments.
       */

      const enrollmentIds =
        enrollmentRows.map(
          (item) => item.id,
        );

      const {
        data: markData,
        error: markError,
      } = await supabase
        .from("marks")
       .select(
          "id, enrollment_id, exam_id, subject, marks, is_absent",
        )
        .eq("exam_id", examId)
        .in(
          "enrollment_id",
          enrollmentIds,
        );

      if (markError) {
        throw markError;
      }

      setMarks(
        (markData ?? []) as Mark[],
      );

        /*
        * ---------------------------------------------------------
        * Load publication status for this exact:
        *
        * Academic Year + Examination + Class + Section
        * ---------------------------------------------------------
        */

       const {
        data: publicationData,
        error: publicationError,
        } = await supabase
        .from("result_publications")
        .select(
            "id, status, published_at",
        )
        .eq(
            "academic_year",
            academicYear,
        )
        .eq("exam_id", examId)
        .eq("class", className)
        .eq("section", section)
        .maybeSingle();

        if (publicationError) {
        throw publicationError;
        }

        if (publicationData) {
        setPublicationId(
            publicationData.id,
        );

        setStatus(
            publicationData.status as ResultStatus,
        );

        setPublishedAt(
            publicationData.published_at,
        );
        } else {
        /*
        * No publication record means
        * this class result is still Draft.
        */

        setPublicationId(null);
        setStatus("draft");
        setPublishedAt(null);
       }

        setLoaded(true);
    } catch (error) {
      console.error(
        "Result loading error:",
        error,
      );

      toast.error(
        t(
          "Unable to load results.",
          "ফলাফল লোড করা যায়নি।",
        ),
      );
    } finally {
      setLoadingResults(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SUBJECT LIST
   *
   * At this stage the expected subjects are
   * determined from subjects that already have marks
   * entered for this examination/class.
   * ---------------------------------------------------------
   */

    const subjects = classSubjects;

  /*
   * ---------------------------------------------------------
   * BUILD RESULT ROWS
   * ---------------------------------------------------------
   */

  const resultRows = useMemo<ResultRow[]>(() => {
    const studentMap =
      new Map(
        students.map((student) => [
          student.id,
          student,
        ]),
      );

    const marksByEnrollment =
      new Map<
        string,
        Map<
          string,
          {
            marks: number | null;
            is_absent: boolean;
          }
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
      .get(mark.enrollment_id)!
      .set(mark.subject, {
        marks: mark.marks,
        is_absent: mark.is_absent,
      });
    }

    const rows =
      enrollmentDataToRows(
        enrollments,
        studentMap,
        marksByEnrollment,
        subjects,
        t,
      );

    /*
     * Merit position:
     *
     * Higher total = better position.
     *
     * Incomplete students don't receive
     * a merit position.
     */

    const completeRows = rows
      .filter(
        (row) =>
          row.complete &&
          row.total !== null,
      )
      .sort((a, b) => {
        // 1. Higher total marks first
        const totalDifference =
          (b.total ?? 0) - (a.total ?? 0);

        if (totalDifference !== 0) {
          return totalDifference;
        }

        // 2. Same total → lower numeric roll first
        const rollA = Number(a.enrollment.roll);
        const rollB = Number(b.enrollment.roll);

        const aValid = Number.isFinite(rollA);
        const bValid = Number.isFinite(rollB);

        if (aValid && bValid) {
          return rollA - rollB;
        }

        if (aValid && !bValid) {
          return -1;
        }

        if (!aValid && bValid) {
          return 1;
        }

        return String(
          a.enrollment.roll ?? "",
        ).localeCompare(
          String(b.enrollment.roll ?? ""),
        );
      });

    let lastTotal: number | null = null;
    let lastPosition = 0;

    completeRows.forEach((row, index) => {
      const total = row.total ?? 0;

      if (
        lastTotal !== null &&
        total === lastTotal
      ) {
        // Same total → same merit position
        row.position = lastPosition;
      } else {
        row.position = index + 1;
        lastPosition = index + 1;
      }

      lastTotal = total;
    });

    // Incomplete/absent rows never receive merit position
    rows.forEach((row) => {
      if (
        !row.complete ||
        row.total === null
      ) {
        row.position = null;
      }
    });

    return rows;
  }, [
    enrollments,
    students,
    marks,
    subjects,
    t,
  ]);

  /*
   * ---------------------------------------------------------
   * SUMMARY
   * ---------------------------------------------------------
   */

  const summary = useMemo(() => {
    const totalStudents =
      resultRows.length;

    const completed =
      resultRows.filter(
        (row) => row.complete,
      );

    const incomplete =
      resultRows.filter(
        (row) => !row.complete,
      );

    const passed =
      completed.filter(
        (row) =>
          row.average !== null &&
          row.average >= PASS_MARK &&
          row.grade !== "F",
      );

    const aPlus =
      completed.filter(
        (row) => row.grade === "A+",
      );

    const passPercentage =
      completed.length > 0
        ? (passed.length /
            completed.length) *
          100
        : 0;

    const totals =
      completed
        .map(
          (row) => row.total,
        )
        .filter(
          (
            value,
          ): value is number =>
            value !== null,
        );

    const averageGpaValues =
      completed
        .map(
          (row) => row.gpa,
        )
        .filter(
          (
            value,
          ): value is number =>
            value !== null,
        );

    const averageGpa =
      averageGpaValues.length > 0
        ? averageGpaValues.reduce(
            (sum, value) =>
              sum + value,
            0,
          ) /
          averageGpaValues.length
        : 0;

    return {
      totalStudents,
      completed:
        completed.length,
      incomplete:
        incomplete.length,
      passed:
        passed.length,
      aPlus:
        aPlus.length,
      passPercentage,
      highestMark:
        totals.length > 0
          ? Math.max(...totals)
          : null,
      lowestMark:
        totals.length > 0
          ? Math.min(...totals)
          : null,
      averageGpa,
    };
  }, [resultRows]);

  /*
   * ---------------------------------------------------------
   * VALIDATE
   * ---------------------------------------------------------
   */
    const invalidateResultValidation = async () => {
      try {
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

        setStatus("draft");
        setPublishedAt(null);

        return true;
      } catch (error) {
        console.error(
          "Result validation invalidation error:",
          error,
        );

        return false;
      }
    };
    const validateResults = async () => {
    if (!loaded) {
        toast.error(
        t(
            "Load results first.",
            "প্রথমে ফলাফল লোড করুন।",
        ),
        );

        return false;
    }

    if (resultRows.length === 0) {
        toast.error(
        t(
            "There are no students to validate.",
            "যাচাই করার মতো কোনো শিক্ষার্থী নেই।",
        ),
        );

        return false;
    }

    if (summary.incomplete > 0) {
        toast.error(
        t(
            `${summary.incomplete} student(s) have incomplete marks.`,
            `${summary.incomplete} জন শিক্ষার্থীর নম্বর অসম্পূর্ণ।`,
        ),
        );

        return false;
    }

    try {
        const {
        data: userData,
        error: userError,
        } =
        await supabase.auth.getUser();

        if (userError) {
        throw userError;
        }

        /*
        * If this result was already published,
        * don't silently move it back to validated.
        */
        if (status === "published") {
        toast.info(
            t(
            "This result is already published.",
            "এই ফলাফল ইতোমধ্যে প্রকাশিত হয়েছে।",
            ),
        );

        return true;
        }

        const {
        data,
        error,
        } = await supabase
        .from("result_publications")
        .upsert(
            {
            academic_year:
                academicYear,

            exam_id: examId,

            class: className,

            section,

            status: "validated",

            published_at: null,

            published_by: null,
            },
            {
            onConflict:
                "academic_year,exam_id,class,section",
            },
        )
        .select(
            "id, status, published_at",
        )
        .single();

        if (error) {
        throw error;
        }

        setPublicationId(data.id);

        setStatus(
        data.status as ResultStatus,
        );

        setPublishedAt(
        data.published_at,
        );

        toast.success(
        t(
            "Results validated successfully.",
            "ফলাফল সফলভাবে যাচাই করা হয়েছে।",
        ),
        );

        return true;
    } catch (error) {
        console.error(
        "Result validation error:",
        error,
        );

        toast.error(
        t(
            "Unable to validate results.",
            "ফলাফল যাচাই করা যায়নি।",
        ),
        );

        return false;
    }
    };

  /*
   * ---------------------------------------------------------
   * PUBLISH
   *
   * IMPORTANT:
   * This first version only validates the UI flow.
   *
   * We will connect this button to
   * result_publications after creating
   * that table.
   * ---------------------------------------------------------
   */

    const publishResults = async () => {
  if (!loaded) {
    toast.error(
      t(
        "Load results first.",
        "প্রথমে ফলাফল লোড করুন।",
      ),
    );

    return;
  }

  if (summary.incomplete > 0) {
    toast.error(
      t(
        "You cannot publish incomplete results.",
        "অসম্পূর্ণ ফলাফল প্রকাশ করা যাবে না।",
      ),
    );

    return;
  }

  /*
   * Validation is mandatory.
   */

  if (status !== "validated") {
    toast.error(
      t(
        "Validate the results before publishing.",
        "প্রকাশের আগে ফলাফল যাচাই করুন।",
      ),
    );

    return;
  }

  setPublishPasskey("");
  setPublishPasskeyError(false);
  setPublishDialogOpen(true);

  return;

  try {
    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    const user =
      userData.user;

    if (!user) {
      throw new Error(
        "User is not authenticated",
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("result_publications")
      .upsert(
        {
          academic_year:
            academicYear,

          exam_id: examId,

          class: className,

          section,

          status: "published",

          published_at:
            new Date().toISOString(),

          published_by: user.id,
        },
        {
          onConflict:
            "academic_year,exam_id,class,section",
        },
      )
      .select(
        "id, status, published_at",
      )
      .single();

    if (error) {
      throw error;
    }

    setPublicationId(data.id);

    setStatus("published");

    setPublishedAt(
      data.published_at,
    );

    toast.success(
      t(
        "Results published successfully.",
        "ফলাফল সফলভাবে প্রকাশিত হয়েছে।",
      ),
    );
  } catch (error) {
    console.error(
      "Result publishing error:",
      error,
    );

    toast.error(
      t(
        "Unable to publish results.",
        "ফলাফল প্রকাশ করা যায়নি।",
      ),
    );
  }
};
  const confirmPublishResults = async () => {
    if (!/^\d{6}$/.test(publishPasskey)) {
      setPublishPasskeyError(true);
      return;
    }

    if (publishPasskey !== PUBLISH_PASSKEY) {
      setPublishPasskeyError(true);
      return;
    }

    setPublishPasskeyError(false);

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        throw new Error(
          "User is not authenticated",
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from("result_publications")
        .upsert(
          {
            academic_year:
              academicYear,

            exam_id: examId,

            class: className,

            section,

            status: "published",

            published_at:
              new Date().toISOString(),

            published_by: user.id,
          },
          {
            onConflict:
              "academic_year,exam_id,class,section",
          },
        )
        .select(
          "id, status, published_at",
        )
        .single();

      if (error) {
        throw error;
      }

      setStatus("published");
      setPublishedAt(data.published_at);

      setPublishPasskey("");
      setPublishPasskeyError(false);

      // Show success inside the SAME dialog
      setPublishSuccess(true);

      // Close automatically after 1.5 seconds
      setTimeout(() => {
        setPublishSuccess(false);
        setPublishDialogOpen(false);
      }, 1500);

      setPublishPasskey("");

    } catch (error) {
      console.error(
        "Result publishing error:",
        error,
      );

      toast.error(
        t(
          "Unable to publish results.",
          "ফলাফল প্রকাশ করা যায়নি।",
        ),
      );
    }
  };
  /*
   * ---------------------------------------------------------
   * UNPUBLISH
   * ---------------------------------------------------------
   */

    const unpublishResults = async () => {
      if (!loaded) {
        toast.error(
          t(
            "Load results first.",
            "প্রথমে ফলাফল লোড করুন।",
          ),
        );

        return;
      }

      if (status !== "published") {
        toast.error(
          t(
            "Only published results can be unpublished.",
            "শুধুমাত্র প্রকাশিত ফলাফল প্রত্যাহার করা যাবে।",
          ),
        );

        return;
      }

      setUnpublishPasskey("");
      setUnpublishPasskeyError(false);
      setUnpublishDialogOpen(true);
    };

    const confirmUnpublishResults = async () => {
      if (!/^\d{6}$/.test(unpublishPasskey)) {
        setUnpublishPasskeyError(true);
        return;
      }

      if (unpublishPasskey !== PUBLISH_PASSKEY) {
        setUnpublishPasskeyError(true);
        return;
      }

      setUnpublishPasskeyError(false);

      try {
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

        setStatus("draft");
        setPublishedAt(null);

        setUnpublishPasskey("");
        setUnpublishPasskeyError(false);

        // Show success inside the SAME dialog
        setUnpublishSuccess(true);

        // Close automatically after 1.5 seconds
        setTimeout(() => {
          setUnpublishSuccess(false);
          setUnpublishDialogOpen(false);
        }, 1500)
      } catch (error) {
        console.error(
          "Result unpublishing error:",
          error,
        );

        toast.error(
          t(
            "Unable to unpublish results.",
            "ফলাফল প্রত্যাহার করা যায়নি।",
          ),
        );
      }
    };
    /*
   * ---------------------------------------------------------
   * Edit-opening function
   * ---------------------------------------------------------
   */ 
  const startEditingStudent = () => {
    if (!selectedStudent) return;

    const initialValues: Record<string, string> = {};

    for (const subject of subjects) {
      const isAbsent =
        selectedStudent.absent?.[subject] ?? false;

      const value =
        selectedStudent.marks[subject];

      initialValues[subject] = isAbsent
        ? "A"
        : value === null
          ? ""
          : String(value);
    }

    setEditMarks(initialValues);
    setIsEditingStudent(true);
  };
  const saveStudentMarks = async () => {
    if (!selectedStudent) return;

    setSavingStudentMarks(true);

    try {
      for (const subject of subjects) {
        const rawValue =
          editMarks[subject]?.trim() ?? "";

        const existingMark = marks.find(
          (item) =>
            item.enrollment_id ===
              selectedStudent.enrollment.id &&
            item.exam_id === examId &&
            item.subject === subject,
        );

       /*
      * Empty = incomplete / X
      *
      * Keep the marks row, but clear the numeric mark
      * and make sure it is NOT absent.
      */
      if (rawValue === "") {
        if (existingMark) {
          const { error } = await supabase
            .from("marks")
            .update({
              marks: null,
              is_absent: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingMark.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("marks")
            .insert({
              enrollment_id:
                selectedStudent.enrollment.id,
              exam_id: examId,
              subject,
              marks: null,
              is_absent: false,
            });

          if (error) throw error;
        }

        continue;
      }

        /*
        * A / Absent
        */
        const isAbsent =
          rawValue.toUpperCase() === "A" ||
          rawValue.toLowerCase() === "absent";

        if (isAbsent) {
          if (existingMark) {
            const { error } = await supabase
              .from("marks")
              .update({
                marks: null,
                is_absent: true,
                updated_at:
                  new Date().toISOString(),
              })
              .eq("id", existingMark.id);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("marks")
              .insert({
                enrollment_id:
                  selectedStudent.enrollment.id,
                exam_id: examId,
                subject,
                marks: null,
                is_absent: true,
              });

            if (error) throw error;
          }

          continue;
        }

        /*
        * Numeric mark
        */
        if (!/^\d{1,3}$/.test(rawValue)) {
          toast.error(
            t(
              `Invalid mark for ${subject}.`,
              `${subject}-এর নম্বর সঠিক নয়।`,
            ),
          );

          return;
        }

        const numericMark =
          Number(rawValue);

        if (
          !Number.isFinite(numericMark) ||
          numericMark < 0 ||
          numericMark > 100
        ) {
          toast.error(
            t(
              `Mark for ${subject} must be between 0 and 100.`,
              `${subject}-এর নম্বর ০ থেকে ১০০ এর মধ্যে হতে হবে।`,
            ),
          );

          return;
        }

        if (existingMark) {
          const { error } = await supabase
            .from("marks")
            .update({
              marks: numericMark,
              is_absent: false,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", existingMark.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("marks")
            .insert({
              enrollment_id:
                selectedStudent.enrollment.id,
              exam_id: examId,
              subject,
              marks: numericMark,
              is_absent: false,
            });

          if (error) throw error;
        }
      }

      /*
      * Reload the complete class result.
      * This keeps all calculation/ranking logic
      * exactly where it already is.
      */
      await loadResults();

      /*
      * Any mark modification makes the previous
      * validation invalid.
      */
      const invalidated = await invalidateResultValidation();

      if (!invalidated) {
        throw new Error(
          "Marks were saved, but result validation could not be reset.",
        );
      }

      setIsEditingStudent(false);

      toast.success(
        t(
          "Marks updated successfully. Result requires re-validation.",
          "নম্বর আপডেট হয়েছে। ফলাফল পুনরায় যাচাই করতে হবে।",
        ),
      );

      setSelectedStudent(null);
    } catch (error) {
      console.error(
        "Student mark update error:",
        error,
      );

      toast.error(
        t(
          "Unable to update marks.",
          "নম্বর আপডেট করা যায়নি।",
        ),
      );
    } finally {
      setSavingStudentMarks(false);
    }
  };
  const handleFullResultPdf = async () => {
    if (!resultRows.length) {
      toast.error(
        t(
          "No result data available.",
          "কোনো ফলাফলের তথ্য পাওয়া যায়নি।",
        ),
      );

      return;
    }

    if (!subjects.length) {
      toast.error(
        t(
          "No subjects available.",
          "কোনো বিষয় পাওয়া যায়নি।",
        ),
      );

      return;
    }

    setGeneratingFullPdf(true);

    try {
      const currentExam =
        exams.find(
          (exam) =>
            exam.id === examId,
        );

      await generateFullResultPdf({
        resultRows,

        subjects,

        className,

        classLabel:
          getClassLabel(
            className,
            "bn",
          ),

        section,

        examName: exams.find(
          (exam) => exam.id === examId,
        )?.name ?? "",

        academicYear,

        schoolName:
          "আল ইমান ইসলামিক একাডেমি",

        schoolAddress:
          "কামাল পাড়া, যুব সংঘ ভবন (৩য় তলা), হাটহাজারী পৌরসভা, চট্টগ্রাম",

        /*
        * Change this only if your logo is
        * stored somewhere else.
        */

        rowsPerPage: 15,
      });

      toast.success(
        t(
          "Full result PDF downloaded.",
          "পূর্ণ ফলাফল PDF ডাউনলোড হয়েছে।",
        ),
      );
    } catch (error) {
      console.error(
        "Full result PDF generation failed:",
        error,
      );

      toast.error(
        t(
          "Unable to generate full result PDF.",
          "পূর্ণ ফলাফল PDF তৈরি করা যায়নি।",
        ),
      );
    } finally {
      setGeneratingFullPdf(
        false,
      );
    }
  };
  const handleMeritListPdf = async () => {
    try {
      await generateMeritListPdf({
        resultRows,
        className,
        classLabel: getClassLabel(
          className,
          "bn",
        ),
        section,
        examName: exams.find(
          (exam) => exam.id === examId,
        )?.name ?? "",
        academicYear,
        schoolName:
          "আল ইমান ইসলামিক একাডেমি",
        schoolAddress:
          "কামাল পাড়া, যুব সংঘ ভবন (৩য় তলা), হাটহাজারী, চট্টগ্রাম",
      });
    } catch (error) {
      console.error(
        "Merit list PDF generation failed:",
        error,
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-5">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold text-primary">
          {t(
            "Publish / Edit Results",
            "ফলাফল প্রকাশ / সম্পাদনা",
          )}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "Review the complete class result before publishing.",
            "প্রকাশের আগে পুরো শ্রেণির ফলাফল যাচাই করুন।",
          )}
        </p>
      </div>

      {/* Filters */}

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Academic Year */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Academic Year",
                "শিক্ষাবর্ষ",
              )}
            </label>

            <select
              value={academicYear}
              onChange={(event) =>
                setAcademicYear(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              {YEARS.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("Class", "শ্রেণি")}
            </label>

            <select
              value={className}
              onChange={(event) => {
                setClassName(
                  event.target.value,
                );
                setLoaded(false);
              }}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              <option value="">
                {t(
                  "Select class",
                  "শ্রেণি নির্বাচন করুন",
                )}
              </option>

             {CLASS_OPTIONS.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {getClassLabel(option.value, lang)}
                </option>
                ))}
            </select>
          </div>

          {/* Section */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Section",
                "শাখা",
              )}
            </label>

            <select
              value={section}
              onChange={(event) => {
                setSection(
                  event.target.value,
                );
                setLoaded(false);
              }}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              {SECTION_OPTIONS.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Examination */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t(
                "Examination",
                "পরীক্ষা",
              )}
            </label>

            <select
              value={examId}
              onChange={(event) => {
                setExamId(
                  event.target.value,
                );
                setLoaded(false);
              }}
              disabled={loadingExams}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:opacity-50"
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
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={loadResults}
            disabled={loadingResults}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingResults
              ? t(
                  "Loading...",
                  "লোড হচ্ছে...",
                )
              : t(
                  "Load Results",
                  "ফলাফল লোড করুন",
                )}
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            {t(
              "Select the class, section and examination, then load the results.",
              "শ্রেণি, শাখা ও পরীক্ষা নির্বাচন করে ফলাফল লোড করুন।",
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Result header */}

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {getClassLabel(
                    className,
                    lang,
                  )}{" "}
                  — {section}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    exams.find(
                      (exam) =>
                        exam.id ===
                        examId,
                    )?.name
                  }{" "}
                  · {academicYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {t(
                    "Result Status:",
                    "ফলাফলের অবস্থা:",
                  )}
                </span>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    status ===
                    "published"
                      ? "bg-green-100 text-green-700"
                      : status ===
                        "validated"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  {status ===
                  "published"
                    ? t(
                        "Published",
                        "প্রকাশিত",
                      )
                    : status ===
                      "validated"
                    ? t(
                        "Validated",
                        "যাচাইকৃত",
                      )
                    : t(
                        "Draft",
                        "খসড়া",
                      )}
                </span>
              </div>
            </div>
          </div>

          {/* Summary cards */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              icon={
                <Users className="h-5 w-5" />
              }
              title={t(
                "Total Students",
                "মোট শিক্ষার্থী",
              )}
              value={
                summary.totalStudents
              }
            />

            <SummaryCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              title={t(
                "Completed",
                "সম্পূর্ণ",
              )}
              value={
                summary.completed
              }
              detail={`${(
                summary.totalStudents
                  ? (summary.completed /
                      summary.totalStudents) *
                    100
                  : 0
              ).toFixed(2)}%`}
            />

            <SummaryCard
              icon={
                <XCircle className="h-5 w-5" />
              }
              title={t(
                "Incomplete",
                "অসম্পূর্ণ",
              )}
              value={
                summary.incomplete
              }
              danger={
                summary.incomplete > 0
              }
            />

            <SummaryCard
              icon={
                <Trophy className="h-5 w-5" />
              }
              title={t(
                "Passed",
                "উত্তীর্ণ",
              )}
              value={
                summary.passed
              }
              detail={`${summary.passPercentage.toFixed(
                2,
              )}%`}
            />

            <SummaryCard
              icon={
                <Trophy className="h-5 w-5" />
              }
              title={t(
                "A+ Count",
                "A+ সংখ্যা",
              )}
              value={
                summary.aPlus
              }
            />
          </div>

          {/* Main table */}

          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-bold text-primary">
                  {t(
                    "Student-wise Result",
                    "শিক্ষার্থীভিত্তিক ফলাফল",
                  )}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {resultRows.length}{" "}
                  {t(
                    "students",
                    "জন শিক্ষার্থী",
                  )}{" "}
                  · {subjects.length}{" "}
                  {t(
                    "subjects",
                    "টি বিষয়",
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleFullResultPdf}
                  disabled={
                    generatingFullPdf ||
                    !resultRows.length
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00563F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer className="h-4 w-4" />

                  {generatingFullPdf
                    ? t(
                        "Generating...",
                        "তৈরি হচ্ছে...",
                      )
                    : t(
                        "Print Full Result",
                        "পূর্ণ ফলাফল প্রিন্ট",
                      )}
                </button>
                
                <button
                  type="button"
                  onClick={handleMeritListPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#006B4F]/30 bg-white px-5 py-3 text-sm font-semibold text-[#006B4F] shadow-sm transition hover:bg-[#EEF7F2]"
                >
                  <Trophy className="h-4 w-4" />

                  {t(
                    "Leaderboard / Merit List",
                    "লিডারবোর্ড / মেধা তালিকা",
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <FileDown className="h-4 w-4" />
                  {t(
                    "Download PDF",
                    "PDF ডাউনলোড",
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-[11px]">
                <thead className="border-b bg-primary text-primary-foreground">
                  <tr>

                    {/* ROLL */}
                    <th className="w-[55px] px-1.5 py-2 text-center whitespace-nowrap">
                      {t("ROLL", "রোল")}
                    </th>

                    {/* STUDENT */}
                    <th className="w-[130px] px-1.5 py-2 text-left">
                      {t("STUDENT", "শিক্ষার্থী")}
                    </th>

                    {/* ALL SUBJECTS */}
                    {subjects.map((subject) => (
                      <th
                        key={subject}
                        className="w-[64px] px-1 py-2 text-center whitespace-normal leading-tight"
                      >
                        {subject}
                      </th>
                    ))}

                    {/* TOTAL */}
                    <th className="w-[65px] px-1 py-2 text-center whitespace-normal leading-tight">
                      {t("TOTAL", "মোট")}
                    </th>

                    {/* GRADE */}
                    <th className="w-[48px] px-1 py-2 text-center">
                      {t("GRADE", "গ্রেড")}
                    </th>

                    {/* GPA */}
                    <th className="w-[48px] px-1 py-2 text-center">
                      GPA
                    </th>

                    {/* POSITION */}
                    <th className="w-[55px] px-1 py-2 text-center whitespace-normal leading-tight">
                      {t("MERIT", "মেধা")}
                    </th>

                    {/* STATUS */}
                    <th className="w-[85px] px-1 py-2 text-center">
                      {t("STATUS", "অবস্থা")}
                    </th>

                    {/* ACTION */}
                    <th className="w-[45px] px-1 py-2 text-center">
                      {t("ACTION", "দেখুন")}
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {resultRows.map(
                    (row) => (
                      <tr
                        key={
                          row.enrollment.id
                        }
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-3 py-3 font-semibold">
                          {row.enrollment
                            .roll ||
                            "—"}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-semibold">
                            {
                              row.student
                                .student_name
                            }
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {
                              row.student
                                .student_id
                            }
                          </div>
                        </td>

                        {subjects.map((subject) => {
                          const value = row.marks[subject];
                          const absent = row.absent?.[subject] ?? false;

                          return (
                            <td
                              key={`${row.enrollment.id}-${subject}`}
                              className="px-1 py-2 text-center"
                            >
                              {absent ? "A" : value === null ? "X" : value}
                            </td>
                          );
                        })}

                        <td className="px-3 py-3 text-center font-semibold">
                          {row.total ??
                            "X"}
                        </td>

                    

                        <td className="px-3 py-3 text-center font-semibold">
                          {row.grade}
                        </td>

                        <td className="px-3 py-3 text-center">
                          {row.gpa ===
                          null
                            ? "X"
                            : row.gpa.toFixed(
                                2,
                              )}
                        </td>

                        <td className="px-3 py-3 text-center font-semibold">
                          {row.position ??
                            "X"}
                        </td>

                        <td className="px-3 py-3 text-center">
                          {row.complete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {t(
                                "Complete",
                                "সম্পূর্ণ",
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <AlertTriangle className="h-3 w-3" />
                              {t(
                                "Incomplete",
                                "অসম্পূর্ণ",
                              )}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudent(
                                row,
                              )
                            }
                            className="rounded-lg p-2 hover:bg-muted"
                            title={t(
                              "View",
                              "দেখুন",
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}

                  {/* Class average */}

                  {resultRows.length > 0 && (
                    <tr className="bg-muted/40 font-semibold">
                      {/* Roll + Student */}
                      <td
                        colSpan={2}
                        className="px-2 py-3 text-left whitespace-nowrap"
                      >
                        {t(
                          "Class Average",
                          "শ্রেণির গড়",
                        )}
                      </td>

                      {/* Subject averages */}
                      {subjects.map((subject) => {
                        const values = resultRows
                          .map(
                            (row) =>
                              row.marks[subject],
                          )
                          .filter(
                            (
                              value,
                            ): value is number =>
                              value !== null,
                          );

                        const average =
                          values.length > 0
                            ? values.reduce(
                                (sum, value) =>
                                  sum + value,
                                0,
                              ) / values.length
                            : null;

                        return (
                          <td
                            key={`average-${subject}`}
                            className="px-1 py-3 text-center"
                          >
                            {average === null
                              ? "—"
                              : average.toFixed(2)}
                          </td>
                        );
                      })}

                      {/* Total average */}
                      <td className="px-1 py-3 text-center">
                        {(() => {
                          const totals = resultRows
                            .map((row) => row.total)
                            .filter(
                              (
                                value,
                              ): value is number =>
                                value !== null,
                            );

                          if (totals.length === 0) {
                            return "—";
                          }

                          const averageTotal =
                            totals.reduce(
                              (sum, value) =>
                                sum + value,
                              0,
                            ) / totals.length;

                          return averageTotal.toFixed(2);
                        })()}
                      </td>

                      {/* Grade */}
                      <td className="px-1 py-3 text-center">
                        —
                      </td>

                      {/* GPA */}
                      <td className="px-1 py-3 text-center">
                        {summary.averageGpa.toFixed(2)}
                      </td>

                      {/* Merit */}
                      <td className="px-1 py-3 text-center">
                        —
                      </td>

                      {/* Status */}
                      <td className="px-1 py-3 text-center">
                        —
                      </td>

                      {/* View */}
                      <td className="px-1 py-3 text-center">
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance summary */}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-bold text-primary">
                {t(
                  "Class Performance Summary",
                  "শ্রেণির ফলাফল সারাংশ",
                )}
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat
                  label={t(
                    "Average GPA",
                    "গড় GPA",
                  )}
                  value={summary.averageGpa.toFixed(
                    2,
                  )}
                />

                <Stat
                  label={t(
                    "Highest Total",
                    "সর্বোচ্চ মোট",
                  )}
                  value={
                    summary.highestMark ??
                    "—"
                  }
                />

                <Stat
                  label={t(
                    "Lowest Total",
                    "সর্বনিম্ন মোট",
                  )}
                  value={
                    summary.lowestMark ??
                    "—"
                  }
                />

                <Stat
                  label={t(
                    "Pass Rate",
                    "পাসের হার",
                  )}
                  value={`${summary.passPercentage.toFixed(
                    2,
                  )}%`}
                />

                <Stat
                  label={t(
                    "A+ Count",
                    "A+ সংখ্যা",
                  )}
                  value={
                    summary.aPlus
                  }
                />

                <Stat
                  label={t(
                    "Incomplete",
                    "অসম্পূর্ণ",
                  )}
                  value={
                    summary.incomplete
                  }
                />
              </div>
            </div>

            {/* Action center */}

            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-bold text-primary">
                {t(
                  "Action Center",
                  "কার্যক্রম",
                )}
              </h3>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={
                    validateResults
                  }
                  disabled={
                    summary.incomplete >
                    0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />

                  {t(
                    "Validate Results",
                    "ফলাফল যাচাই",
                  )}
                </button>

                {status ===
                "published" ? (
                  <button
                    type="button"
                    onClick={
                      unpublishResults
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Upload className="h-4 w-4" />

                    {t(
                      "Unpublish Results",
                      "ফলাফল প্রত্যাহার",
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      publishResults
                    }
                    disabled={
                      summary.incomplete >
                      0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />

                    {t(
                      "Publish Results",
                      "ফলাফল প্রকাশ",
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Incomplete warning */}

          {summary.incomplete >
            0 && (
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  {t(
                    "Incomplete Results",
                    "অসম্পূর্ণ ফলাফল",
                  )}
                </p>

                <p className="mt-1 text-sm">
                  {t(
                    `${summary.incomplete} student(s) are missing marks. Complete the marks before publishing.`,
                    `${summary.incomplete} জন শিক্ষার্থীর নম্বর অনুপস্থিত। প্রকাশের আগে নম্বর সম্পূর্ণ করুন।`,
                  )}
                </p>
              </div>
            </div>
          )}
        </>
      )}



      {/* =========================================================
          PREMIUM STUDENT RESULT / EDIT MODAL
         ========================================================= */}

    {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStudent(null);
              setIsEditingStudent(false);
            }
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
          >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-6 py-5 text-white">

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-4">

                  {/* Student badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                    <Trophy className="h-6 w-6 text-blue-100" />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                      {t(
                        "Student Result",
                        "শিক্ষার্থীর ফলাফল",
                      )}
                    </p>

                    <h3 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                      {selectedStudent.student.student_name}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                      <span>
                        ID:{" "}
                        <strong className="text-white">
                          {selectedStudent.student.student_id}
                        </strong>
                      </span>

                      <span className="text-white/35">
                        •
                      </span>

                      <span>
                        {t("Roll", "রোল")}:{" "}
                        <strong className="text-white">
                          {selectedStudent.enrollment.roll ??
                            "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setIsEditingStudent(false);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/30 hover:bg-white/15 hover:text-white"
                  aria-label={t(
                    "Close",
                    "বন্ধ করুন",
                  )}
                >
                  <span className="text-xl leading-none">
                    ×
                  </span>
                </button>
              </div>
            </div>

            {/* =====================================================
                BODY
            ===================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70">

              {/* Column header */}
              <div className="sticky top-0 z-10 grid grid-cols-[1fr_100px] border-b border-slate-200 bg-white/95 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 backdrop-blur">
                <span>
                  {t("Subject", "বিষয়")}
                </span>

                <span className="text-right">
                  {t("Marks", "নম্বর")}
                </span>
              </div>

              {/* Subjects */}
              <div className="px-4 py-2 sm:px-6">

                {subjects.map((subject, index) => {

                  const currentAbsent =
                    selectedStudent.absent?.[subject] ??
                    false;

                  const currentValue =
                    selectedStudent.marks[subject];

                  const displayValue =
                    currentAbsent
                      ? "A"
                      : currentValue === null
                        ? "X"
                        : currentValue;

                  return (
                    <div
                      key={subject}
                      className="grid grid-cols-[1fr_100px] items-center border-b border-slate-200 px-2 py-3.5 last:border-b-0"
                    >

                      {/* Subject */}
                      <div className="flex min-w-0 items-center gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-100 shadow-sm">
                          {String(index + 1).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span className="truncate text-sm font-medium text-slate-800 sm:text-[15px]">
                          {subject}
                        </span>
                      </div>

                      {/* Mark / Editor */}
                      <div className="flex justify-end">

                        {isEditingStudent ? (
                          <input
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            value={editMarks[subject] ?? ""}
                            onChange={(event) => {
                            const value = event.currentTarget.value;

                            // Allow clearing the field completely
                            if (value === "") {
                              setEditMarks((current) => ({
                                ...current,
                                [subject]: "",
                              }));
                              return;
                            }

                            // Allow numbers, A, or Absent
                            if (
                              /^\d{0,3}$/.test(value) ||
                              /^[aA]$/.test(value) ||
                              /^absent$/i.test(value)
                            ) {
                              setEditMarks((current) => ({
                                ...current,
                                [subject]: value,
                              }));
                            }
                          }}
                            
                            className={[
                              "h-10 w-20 rounded-xl border bg-white px-2 text-center text-sm font-bold outline-none transition",
                              "focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15",
                              editMarks[subject]?.toUpperCase() === "A"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-slate-300 text-slate-900",
                            ].join(" ")}
                            placeholder="—"
                            aria-label={`${subject} ${t(
                              "marks",
                              "নম্বর",
                            )}`}
                          />
                        ) : (
                          <span
                            className={[
                              "inline-flex min-w-10 items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-bold",
                              currentAbsent
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                                : currentValue === null
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-100",
                            ].join(" ")}
                          >
                            {displayValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ===================================================
                  RESULT SUMMARY
              =================================================== */}

              {!isEditingStudent && (
                <div className="mx-4 mb-5 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 text-slate-900 shadow-sm sm:mx-6">

                  <div className="grid grid-cols-2 divide-x divide-blue-100 sm:grid-cols-4">

                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {t("Total", "মোট")}
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-100">
                        {selectedStudent.total ??
                          "X"}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {t("Grade", "গ্রেড")}
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {selectedStudent.grade}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        GPA
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {selectedStudent.gpa ===
                        null
                          ? "X"
                          : selectedStudent.gpa.toFixed(
                              2,
                            )}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {t("Merit", "মেধা")}
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {selectedStudent.position ??
                          "X"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-300 bg-white px-6 py-4">

              {isEditingStudent ? (
                <>
                  <button
                    type="button"
                    disabled={savingStudentMarks}
                    onClick={() => {
                      setIsEditingStudent(false);
                      setEditMarks({});
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t(
                      "Cancel",
                      "বাতিল",
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={savingStudentMarks}
                    onClick={saveStudentMarks}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingStudentMarks ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t(
                          "Saving...",
                          "সংরক্ষণ হচ্ছে...",
                        )}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {t(
                          "Save Changes",
                          "পরিবর্তন সংরক্ষণ",
                        )}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-500">
                    {t(
                      "Review the marks carefully before publishing.",
                      "প্রকাশের আগে নম্বরগুলো ভালোভাবে যাচাই করুন।",
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={startEditingStudent}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <Pencil className="h-4 w-4" />

                    {t(
                      "Edit Marks",
                      "নম্বর সম্পাদনা",
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
        {/* =========================================================
            PUBLISH CONFIRMATION DIALOG
        ========================================================= */}

        {publishDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-results-title"
          >
            <div className="w-full max-w-md rounded-2xl border border-[#006B4F]/20 bg-white p-6 shadow-2xl">

              {publishSuccess ? (
                /* ================= SUCCESS STATE ================= */
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF7F2]">
                    <CheckCircle2 className="h-9 w-9 text-[#006B4F]" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {t(
                      "Results Published Successfully",
                      "ফলাফল সফলভাবে প্রকাশিত হয়েছে",
                    )}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    {t(
                      "The official results are now published.",
                      "অফিসিয়াল ফলাফল এখন প্রকাশিত হয়েছে।",
                    )}
                  </p>

                  <div className="mt-5 rounded-full bg-[#EEF7F2] px-4 py-1.5 text-xs font-semibold text-[#006B4F]">
                    {t(
                      "Published",
                      "প্রকাশিত",
                    )}
                  </div>

                </div>
              ) : (
                /* ================= CONFIRMATION STATE ================= */
                <>
                  {/* Header */}
                  <div className="mb-5">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF7F2] text-[#006B4F]">
                      <Upload className="h-5 w-5" />
                    </div>

                    <h3
                      id="publish-results-title"
                      className="text-xl font-bold text-slate-900"
                    >
                      {t(
                        "Publish Results?",
                        "ফলাফল প্রকাশ করবেন?",
                      )}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {t(
                        "You are about to publish the official results for this class and examination.",
                        "আপনি এই শ্রেণি ও পরীক্ষার অফিসিয়াল ফলাফল প্রকাশ করতে যাচ্ছেন।",
                      )}
                    </p>
                  </div>

                  {/* Result information */}
                  <div className="mb-5 rounded-xl border border-[#006B4F]/15 bg-[#F7FBF9] p-4">
                    <p className="text-sm font-semibold text-[#006B4F]">
                      {getClassLabel(className, "bn")} — {section}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {exams.find(
                        (exam) => exam.id === examId,
                      )?.name ?? ""}
                      {" · "}
                      {academicYear}
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium leading-6 text-amber-800">
                      {t(
                        "After publishing, any mark change will require re-validation and re-publishing.",
                        "প্রকাশের পরে যেকোনো নম্বর পরিবর্তন করলে পুনরায় যাচাই ও প্রকাশ করতে হবে।",
                      )}
                    </p>
                  </div>

                  {/* Passkey */}
                  <div>
                    <label
                      htmlFor="publish-passkey"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      {t(
                        "6-digit verification passkey",
                        "৬ সংখ্যার যাচাইকরণ পাসকি",
                      )}
                    </label>

                    <input
                      id="publish-passkey"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="off"
                      value={publishPasskey}
                      onChange={(event) => {
                        const value =
                          event.currentTarget.value.replace(
                            /\D/g,
                            "",
                          );

                        setPublishPasskey(value);
                        setPublishPasskeyError(false);
                      }}
                      placeholder="••••••"
                      className={[
                        "h-12 w-full rounded-xl border px-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition",
                        "focus:ring-2 focus:ring-[#006B4F]/20",
                        publishPasskeyError
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-slate-300 bg-white focus:border-[#006B4F]",
                      ].join(" ")}
                    />

                    {publishPasskeyError && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        {t(
                          "Invalid passkey.",
                          "ভুল পাসকি।",
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setPublishDialogOpen(false);
                        setPublishPasskey("");
                        setPublishPasskeyError(false);
                      }}
                      className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t(
                        "Cancel",
                        "বাতিল",
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={confirmPublishResults}
                      disabled={
                        publishPasskey.length !== 6
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#006B4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00563F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Upload className="h-4 w-4" />

                      {t(
                        "Publish Results",
                        "ফলাফল প্রকাশ",
                      )}
                    </button>

                  </div>
                </>
              )}
            </div>
          </div>
        )}
      {/* =========================================================
          UNPUBLISH CONFIRMATION DIALOG
      ========================================================= */}

      {unpublishDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unpublish-results-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">

            {unpublishSuccess ? (
              /* ================= SUCCESS STATE ================= */
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF7F2]">
                  <CheckCircle2 className="h-9 w-9 text-[#006B4F]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {t(
                    "Results Unpublished Successfully",
                    "ফলাফল সফলভাবে প্রত্যাহার করা হয়েছে",
                  )}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t(
                    "The result has returned to Draft and must be validated again.",
                    "ফলাফল Draft অবস্থায় ফিরে গেছে এবং আবার যাচাই করতে হবে।",
                  )}
                </p>

                <div className="mt-5 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
                  {t(
                    "Draft — Re-validation Required",
                    "Draft — পুনরায় যাচাই প্রয়োজন",
                  )}
                </div>

              </div>
            ) : (
              /* ================= CONFIRMATION STATE ================= */
              <>
                {/* Header */}
                <div className="mb-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Upload className="h-5 w-5 rotate-180" />
                  </div>

                  <h3
                    id="unpublish-results-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    {t(
                      "Unpublish Results?",
                      "ফলাফল প্রত্যাহার করবেন?",
                    )}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t(
                      "This will remove the published status from the official result.",
                      "এর ফলে অফিসিয়াল ফলাফল থেকে প্রকাশিত স্ট্যাটাস সরিয়ে দেওয়া হবে।",
                    )}
                  </p>
                </div>

                {/* Result information */}
                <div className="mb-5 rounded-xl border border-red-100 bg-red-50/60 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    {getClassLabel(className, "bn")} — {section}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {exams.find(
                      (exam) => exam.id === examId,
                    )?.name ?? ""}
                    {" · "}
                    {academicYear}
                  </p>
                </div>

                {/* Warning */}
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium leading-6 text-amber-800">
                    {t(
                      "After unpublishing, the result will return to Draft status and must be validated again before it can be published.",
                      "ফলাফল প্রত্যাহার করার পরে এটি Draft অবস্থায় ফিরে যাবে এবং পুনরায় প্রকাশের আগে আবার যাচাই করতে হবে।",
                    )}
                  </p>
                </div>

                {/* Passkey */}
                <div>
                  <label
                    htmlFor="unpublish-passkey"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    {t(
                      "6-digit verification passkey",
                      "৬ সংখ্যার যাচাইকরণ পাসকি",
                    )}
                  </label>

                  <input
                    id="unpublish-passkey"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="off"
                    value={unpublishPasskey}
                    onChange={(event) => {
                      const value =
                        event.currentTarget.value.replace(
                          /\D/g,
                          "",
                        );

                      setUnpublishPasskey(value);
                      setUnpublishPasskeyError(false);
                    }}
                    placeholder="••••••"
                    className={[
                      "h-12 w-full rounded-xl border px-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition",
                      "focus:ring-2 focus:ring-red-500/15",
                      unpublishPasskeyError
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-slate-300 bg-white focus:border-red-500",
                    ].join(" ")}
                  />

                  {unpublishPasskeyError && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {t(
                        "Invalid passkey.",
                        "ভুল পাসকি।",
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setUnpublishDialogOpen(false);
                      setUnpublishPasskey("");
                      setUnpublishPasskeyError(false);
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t(
                      "Cancel",
                      "বাতিল",
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={confirmUnpublishResults}
                    disabled={
                      unpublishPasskey.length !== 6
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Upload className="h-4 w-4 rotate-180" />

                    {t(
                      "Unpublish Results",
                      "ফলাফল প্রত্যাহার",
                    )}
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * HELPER: BUILD RESULT ROWS
 * ============================================================
 */

function enrollmentDataToRows(
  enrollments: Enrollment[],
  studentMap: Map<
    string,
    Student
  >,
  marksByEnrollment: Map<
    string,
    Map<
      string,
      {
        marks: number | null;
        is_absent: boolean;
      }
    >
  >,
  subjects: string[],
  t: (
    en: string,
    bn: string,
  ) => string,
): ResultRow[] {
  return [...enrollments]
    .sort((a, b) => {
      const rollA = Number(a.roll);
      const rollB = Number(b.roll);

      const aValid =
        Number.isFinite(rollA);

      const bValid =
        Number.isFinite(rollB);

      if (aValid && !bValid)
        return -1;

      if (!aValid && bValid)
        return 1;

      if (
        aValid &&
        bValid &&
        rollA !== rollB
      ) {
        return rollA - rollB;
      }

      return String(
        a.roll ?? "",
      ).localeCompare(
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

      const enrollmentMarks =
        marksByEnrollment.get(enrollment.id) ??
        new Map<
          string,
          {
            marks: number | null;
            is_absent: boolean;
          }
        >();

      const rowMarks: Record<
        string,
        number | null
      > = {};

      const rowAbsent: Record<
        string,
        boolean
      > = {};

      let complete = true;
      let hasAbsent = false;
      let hasFail = false;

      let total = 0;
      let gpaSum = 0;

      for (const subject of subjects) {
        const record = enrollmentMarks.get(subject);

        const value = record?.marks ?? null;
        const absent =
          record?.is_absent ?? false;

        rowMarks[subject] = value;
        rowAbsent[subject] = absent;

        // A = Absent
        if (absent) {
          hasAbsent = true;
          complete = false;
          continue;
        }

        // X = mark not entered
        if (value === null) {
          complete = false;
          continue;
        }

        total += value;

        const subjectGrade =
          getGrade(value);

        gpaSum += subjectGrade.gpa;

        if (
          subjectGrade.grade === "F"
        ) {
          hasFail = true;
        }
      }

      if (subjects.length === 0) {
        complete = false;
      }

      // X / incomplete
      if (!complete && !hasAbsent) {
        return {
          enrollment,
          student,
          marks: rowMarks,
          absent: rowAbsent,
          total: null,
          average: null,
          grade: "X" | "",
          gpa: null,
          position: null,
          complete: false,
        };
      }

      // A / absent
      if (hasAbsent) {
        return {
          enrollment,
          student,
          marks: rowMarks,
          absent: rowAbsent,
          total: null,
          average: null,
          grade: "F",
          gpa: 0,
          position: null,
          complete: true,
        };
      }

      // Any subject F
      if (hasFail) {
        return {
          enrollment,
          student,
          marks: rowMarks,
          absent: rowAbsent,
          total,
          average:
            total / subjects.length,
          grade: "F",
          gpa: 0,
          position: null,
          complete: true,
        };
      }

      // Normal result
      const overallGpa =
        subjects.length > 0
          ? gpaSum / subjects.length
          : 0;

      let overallGrade = "F";

      if (overallGpa >= 5) {
        overallGrade = "A+";
      } else if (overallGpa >= 4) {
        overallGrade = "A";
      } else if (overallGpa >= 3.5) {
        overallGrade = "A-";
      } else if (overallGpa >= 3) {
        overallGrade = "B";
      } else if (overallGpa >= 2) {
        overallGrade = "C";
      } else if (overallGpa >= 1) {
        overallGrade = "D";
      }

      return {
        enrollment,
        student,
        marks: rowMarks,
        absent: rowAbsent,
        total,
        average:
          total / subjects.length,
        grade: overallGrade,
        gpa: overallGpa,
        position: null,
        complete: true,
      };
    });
}

/*
 * ============================================================
 * SUMMARY CARD
 * ============================================================
 */

function SummaryCard({
  icon,
  title,
  value,
  detail,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  detail?: string;
  danger?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-card p-5 shadow-sm",
        danger
          ? "border-red-200"
          : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div
          className={[
            "rounded-xl p-2",
            danger
              ? "bg-red-100 text-red-600"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          {icon}
        </div>

        <div
          className={[
            "text-2xl font-bold",
            danger
              ? "text-red-600"
              : "text-primary",
          ].join(" ")}
        >
          {value}
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-muted-foreground">
        {title}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}

/*
 * ============================================================
 * SMALL STAT
 * ============================================================
 */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-primary">
        {value}
      </p>
    </div>
  );
}