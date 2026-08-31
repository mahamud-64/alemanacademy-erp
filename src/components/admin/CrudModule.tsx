import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { Pencil,Plus, Search, Trash2, Inbox, RotateCcw, Eye,} from "lucide-react";
import { toast } from "sonner";
import type { AdminRecord, ModuleDef, ModuleField } from "@/lib/admin/registry";
import { useCollection } from "@/lib/admin/store";
import { useLang, type Bi } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function isBi(v: unknown): v is Bi {
  return !!v && typeof v === "object" && "en" in (v as Record<string, unknown>);
}

function toText(v: unknown, lang: "en" | "bn"): string {
  if (v == null) return "";
  if (isBi(v)) return lang === "bn" ? v.bn : v.en;
  return String(v);
}

function emptyDraft(fields: ModuleField[]): Record<string, unknown> {
  const draft: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "bi") draft[field.key] = { en: "", bn: "" };
    else if (field.type === "number") draft[field.key] = 0;
    else if (field.type === "select") draft[field.key] = field.options?.[0] ?? "";
    else draft[field.key] = "";
  }
  return draft;
}
const STUDENT_EDIT_FIELDS = [
  ["student_name", "Student's Name", "শিক্ষার্থীর নাম"],
  ["applying_for", "Class", "শ্রেণি"],
  ["section", "Section", "শাখা"],
  ["roll", "Roll", "রোল"],
  ["date_of_birth", "Date of Birth", "জন্ম তারিখ"],
  ["birth_registration_no", "Birth Registration No.", "জন্ম নিবন্ধন নম্বর"],
  ["blood_group", "Blood Group", "রক্তের গ্রুপ"],
  ["gender", "Gender", "লিঙ্গ"],

  ["father_name", "Father's Name", "পিতার নাম"],
  ["mother_name", "Mother's Name", "মাতার নাম"],
  ["guardian_name", "Guardian Name", "অভিভাবকের নাম"],
  ["guardian_relation", "Guardian Relation", "অভিভাবকের সম্পর্ক"],
  ["guardian_profession", "Guardian Profession", "অভিভাবকের পেশা"],
  ["phone", "Phone", "ফোন"],
  ["email", "Email", "ইমেইল"],
  ["guardian_address", "Guardian Address", "অভিভাবকের ঠিকানা"],

  ["permanent_village", "Permanent Village", "স্থায়ী গ্রাম"],
  ["permanent_post_office", "Permanent Post Office", "স্থায়ী ডাকঘর"],
  ["permanent_upazila", "Permanent Upazila", "স্থায়ী উপজেলা"],
  ["permanent_district", "Permanent District", "স্থায়ী জেলা"],

  ["present_village", "Present Village", "বর্তমান গ্রাম"],
  ["present_post_office", "Present Post Office", "বর্তমান ডাকঘর"],
  ["present_upazila", "Present Upazila", "বর্তমান উপজেলা"],
  ["present_district", "Present District", "বর্তমান জেলা"],

  ["nationality", "Nationality", "জাতীয়তা"],
  ["previous_institution", "Previous Institution", "পূর্ববর্তী প্রতিষ্ঠান"],
  ["previous_class", "Previous Class", "পূর্ববর্তী শ্রেণি"],
  ["previous_student_no", "Previous Student ID", "পূর্ববর্তী শিক্ষার্থী আইডি"],
  ["previous_date", "Previous Date", "পূর্ববর্তী তারিখ"],

  ["special_requirement", "Special Requirement", "বিশেষ প্রয়োজন"],
  ["academic_year", "Academic Year", "শিক্ষাবর্ষ"],
  ["status", "Status", "অবস্থা"],
] as const;

function studentValue(
  draft: Record<string, unknown>,
  key: string,
) {
  return String(draft[key] ?? "");
}
export function CrudModule({
  mod,
  autoCreate,
  initialFilter,
}: {
  mod: ModuleDef;
  autoCreate?: boolean;
  initialFilter?: string;
}) {
  const { t, tb, lang } = useLang();
  const { rows, loading, busy, create, save, remove, reset } = useCollection(mod);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter ?? "all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(() => emptyDraft(mod.fields));
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminRecord | null>(null);
  const [pendingSave, setPendingSave] = useState(false);
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState("");
  const [studentRows, setStudentRows] = useState<AdminRecord[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  
  const loadStudentRows = async () => {
    setStudentLoading(true);

    try {
      const {
        data: students,
        error: studentsError,
      } = await supabase
        .from("students")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (studentsError) {
        throw studentsError;
      }

      const {
        data: enrollments,
        error: enrollmentError,
      } = await supabase
        .from("student_enrollments")
        .select(
          "id, student_record_id, academic_year, class, section, roll, status",
        )
        .eq("status", "active");

      if (enrollmentError) {
        throw enrollmentError;
      }

      const enrollmentMap = new Map(
        (enrollments ?? []).map(
          (enrollment) => [
            enrollment.student_record_id,
            enrollment,
          ],
        ),
      );

      const mergedRows: AdminRecord[] =
        (students ?? []).map((student) => {
          const enrollment =
            enrollmentMap.get(student.id);

          return {
            id: student.id,

            // REAL students columns
            student_id:
              student.student_id ?? "",

            student_name:
              student.student_name ?? "",

            gender:
              student.gender ?? "",

            // REAL enrollment columns
            class:
              enrollment?.class ?? "",

            section:
              enrollment?.section ?? "",

            roll:
              enrollment?.roll ?? "",

            academic_year:
              enrollment?.academic_year ?? "",

            status:
              enrollment?.status ?? "",
          };
        });

      setStudentRows(mergedRows);
    } catch (error) {
      console.error(
        "Failed to load students:",
        error,
      );

      setStudentRows([]);

      toast.error(
        t(
          "Unable to load students.",
          "শিক্ষার্থীদের তথ্য লোড করা যায়নি।",
        ),
      );
    } finally {
      setStudentLoading(false);
    }
  };
  useEffect(() => {
    setQuery("");
    setPage(1);
    setFilter(initialFilter ?? "all");
    if (autoCreate) {
      setEditing(null);
      setDraft(emptyDraft(mod.fields));
      setOpen(true);
    } else {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.id, autoCreate, initialFilter]);
  useEffect(() => {
    if (mod.id === "students") {
      void loadStudentRows();
    }
  }, [mod.id]);
  const listRows =
  mod.id === "students"
    ? studentRows
    : rows;
  const filterOptions = useMemo(() => {
    if (!mod.filterKey) return [];
    const set = new Set<string>();
    for (const row of listRows) {
      const v = toText(row[mod.filterKey], "en");
      if (v) set.add(v);
    }
    return [...set].sort();
  }, [listRows, mod.filterKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listRows.filter((row) => {
      if (mod.filterKey && filter !== "all" && toText(row[mod.filterKey], "en").toLowerCase() !== filter.toLowerCase())
        return false;
      if (!q) return true;
      return mod.fields.some((field) => {
        const v = row[field.key];
        return isBi(v)
          ? `${v.en} ${v.bn}`.toLowerCase().includes(q)
          : String(v ?? "").toLowerCase().includes(q);
      });
    });
  }, [listRows, query, filter, mod]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft(mod.fields));
    setStudentPhotoFile(null);
    setStudentPhotoPreview("");
    setPendingSave(false);
    if (mod.id === "students") {
      void loadStudentRows();
    }
    setOpen(true);
  };
  const handleNoticeSave = async (notice: {
    title: {
      en: string;
      bn: string;
    };
    category: string;
    date: string;
    image: string;
  }) => {
    setSubmitting(true);

    try {
      await create({
        title: notice.title,
        category: notice.category,
        date: notice.date,
        image: notice.image,
      });

      toast.success(
        t(
          "Notice published successfully.",
          "নোটিশ সফলভাবে প্রকাশিত হয়েছে।",
        ),
      );

      setOpen(false);
    } catch (error) {
      console.error("Notice save error:", error);

      toast.error(
        t(
          "Unable to publish notice.",
          "নোটিশ প্রকাশ করা যায়নি।",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };
  const openEdit = async (row: AdminRecord) => {
    if (mod.id !== "students") {
      setEditing(row);
      setDraft({ ...row });
      setOpen(true);
      return;
    }

    const studentId = String(
      row.student_id ?? "",
    ).trim();

    if (!studentId) {
      toast.error(
        t(
          "Student ID could not be found.",
          "শিক্ষার্থী আইডি পাওয়া যায়নি।",
        ),
      );
      return;
    }

    setSubmitting(true);

    try {
      // Load the real student record
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error(
          t(
            "Student record was not found.",
            "শিক্ষার্থীর রেকর্ড পাওয়া যায়নি।",
          ),
        );
        return;
      }

      // Load this student's current enrollment
      const {
        data: enrollment,
        error: enrollmentError,
      } = await supabase
        .from("student_enrollments")
        .select(
          "id, student_record_id, academic_year, class, section, roll, status",
        )
        .eq("student_record_id", data.id)
        .eq("status", "active")
        .order("academic_year", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (enrollmentError) {
        console.error(
          "Failed to load enrollment:",
          enrollmentError,
        );
        throw enrollmentError;
      }

      console.log(
        "FULL STUDENT:",
        data,
      );

      console.log(
        "CURRENT ENROLLMENT:",
        enrollment,
      );

      setEditing(data as AdminRecord);

      // Student information
      setDraft({
        ...(data as AdminRecord),

        class:
          enrollment?.class ?? "",

        section:
          enrollment?.section ?? "",

        roll:
          enrollment?.roll ?? "",

        academic_year:
          enrollment?.academic_year ??
          data.academic_year ??
          "",

        status:
          enrollment?.status ??
          data.status ??
          "",
      });

      setStudentPhotoFile(null);

      // Load photo
      let photoPreview = "";

      if (
        typeof data.photo_url === "string" &&
        data.photo_url.trim()
      ) {
        const {
          data: signedPhoto,
          error: photoError,
        } = await supabase.storage
          .from("student-photos")
          .createSignedUrl(
            data.photo_url,
            3600,
          );

        if (photoError) {
          console.error(
            "Student photo error:",
            photoError,
          );
        } else {
          photoPreview =
            signedPhoto?.signedUrl ?? "";
        }
      }

      setStudentPhotoPreview(photoPreview);

      setPendingSave(false);
      setOpen(true);
    } catch (error) {
      console.error(
        "Student edit load error:",
        error,
      );

      toast.error(
        t(
          "Unable to load student information.",
          "শিক্ষার্থীর তথ্য লোড করা যায়নি।",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (mod.id === "students") {
      if (!studentValue(draft, "student_name").trim()) {
        toast.error(
          t(
            "Student name is required.",
            "শিক্ষার্থীর নাম আবশ্যক।",
          ),
        );
        return;
      }

      if (!studentValue(draft, "class").trim()) {
        toast.error(
          t(
            "Class is required.",
            "শ্রেণি আবশ্যক।",
          ),
        );
        return;
      }

      if (editing) {
        setPendingSave(true);
        return;
      }

      await performStudentSave();
      return;
    }

    const missing = mod.fields.find((field) => {
      if (!field.required) return false;

      const v = draft[field.key];

      return isBi(v)
        ? !v.en.trim()
        : !String(v ?? "").trim();
    });

    if (missing) {
      toast.error(
        t("Please fill in", "পূরণ করুন") +
          ": " +
          tb(missing.label),
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editing) {
        await save({
          ...(draft as AdminRecord),
          id: editing.id,
        });

        toast.success(
          t(
            "Record updated successfully.",
            "রেকর্ড হালনাগাদ হয়েছে।",
          ),
        );
      } else {
        await create(draft);

        toast.success(
          t(
            "Record created successfully.",
            "নতুন রেকর্ড যোগ হয়েছে।",
          ),
        );
      }

      setOpen(false);
    } catch {
      toast.error(
        t(
          "Something went wrong. Please try again.",
          "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };
  const performStudentSave = async () => {
    setSubmitting(true);

    try {
      let photoPath = studentValue(
        draft,
        "photo_url",
      );

      if (studentPhotoFile) {
        const extension =
          studentPhotoFile.name.split(".").pop() ||
          "jpg";

        const filePath =
          `students/${studentValue(
            draft,
            "student_id",
          )}-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("student-photos")
            .upload(filePath, studentPhotoFile, {
              upsert: false,
              contentType: studentPhotoFile.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        photoPath = filePath;
      }

      const studentData = {
        student_id: studentValue(draft, "student_id"),
        student_name: studentValue(draft, "student_name"),

        date_of_birth:
          studentValue(draft, "date_of_birth") || null,
        birth_registration_no:
          studentValue( draft, "birth_registration_no",),
        blood_group:
          studentValue(draft, "blood_group"),
        gender: 
          studentValue(draft, "gender"),
        father_name:
          studentValue(draft, "father_name"),
        mother_name:
          studentValue(draft, "mother_name"),
        guardian_name:
          studentValue(draft, "guardian_name"),
        guardian_relation:
          studentValue(draft, "guardian_relation"),
        guardian_profession:
          studentValue(draft, "guardian_profession"),
        phone: 
          studentValue(draft, "phone"),
        email:
          studentValue(draft, "email"),
        guardian_address:
          studentValue(draft, "guardian_address"),
        permanent_village:
          studentValue(draft, "permanent_village"),
        permanent_post_office:
          studentValue( draft, "permanent_post_office",),
        permanent_upazila:
          studentValue(draft, "permanent_upazila"),
        permanent_district:
          studentValue(  draft, "permanent_district",),
        present_village:
          studentValue(draft, "present_village"),
        present_post_office:
          studentValue(draft, "present_post_office",),
        present_upazila:
          studentValue(draft, "present_upazila"),
        present_district:
          studentValue(draft,  "present_district", ),

        nationality:
          studentValue(draft, "nationality"),

        previous_institution:
          studentValue(
            draft,
            "previous_institution",
          ),
        previous_class:
          studentValue(draft, "previous_class"),
        previous_student_no:
          studentValue(
            draft,
            "previous_student_no",
          ),
        previous_date:
          studentValue(draft, "previous_date") ||
          null,

        special_requirement:
          studentValue(
            draft,
            "special_requirement",
          ),

        academic_year:
          studentValue(draft, "academic_year"),

        status:
          studentValue(draft, "status"),

        photo_url: photoPath || null,

        updated_at: new Date().toISOString(),
      };

      if (editing) {
        // ==========================================
        // 1. SAVE PERMANENT STUDENT INFORMATION
        // ==========================================

        const { error: studentError } =
          await supabase
            .from("students")
            .update(studentData)
            .eq("id", editing.id);

        if (studentError) {
          throw studentError;
        }

        // ==========================================
        // 2. SAVE CURRENT ENROLLMENT INFORMATION
        // ==========================================

        const { data: currentEnrollment, error: enrollmentLoadError } =
          await supabase
            .from("student_enrollments")
            .select("id")
            .eq("student_record_id", editing.id)
            .eq("status", "active")
            .order("academic_year", {
              ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (enrollmentLoadError) {
          throw enrollmentLoadError;
        }

        if (currentEnrollment) {
          // Update existing enrollment
          const { error: enrollmentError } =
            await supabase
              .from("student_enrollments")
              .update({
                academic_year:
                  studentValue(
                    draft,
                    "academic_year",
                  ),

                class:
                  studentValue(
                    draft,
                    "class",
                  ),

                section:
                  studentValue(
                    draft,
                    "section",
                  ) || null,

                roll:
                  studentValue(
                    draft,
                    "roll",
                  ) || null,

                status:
                  studentValue(
                    draft,
                    "status",
                  ) || "active",

                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                currentEnrollment.id,
              );

          if (enrollmentError) {
            throw enrollmentError;
          }
        } else {
          // No enrollment exists yet → create one
          const { error: enrollmentError } =
            await supabase
              .from("student_enrollments")
              .insert({
                student_record_id:
                  editing.id,

                academic_year:
                  studentValue(
                    draft,
                    "academic_year",
                  ),

                class:
                  studentValue(
                    draft,
                    "class",
                  ),

                section:
                  studentValue(
                    draft,
                    "section",
                  ) || null,

                roll:
                  studentValue(
                    draft,
                    "roll",
                  ) || null,

                status:
                  studentValue(
                    draft,
                    "status",
                  ) || "active",

                enrolled_at:
                  new Date().toISOString(),
              });

          if (enrollmentError) {
            throw enrollmentError;
          }
        }

        toast.success(
          t(
            "Student and enrollment updated successfully.",
            "শিক্ষার্থী ও এনরোলমেন্ট সফলভাবে হালনাগাদ হয়েছে।",
          ),
        );
      } else {
        const { error } = await supabase
          .from("students")
          .insert(studentData);

        if (error) throw error;

        toast.success(
          t(
            "Student added successfully.",
            "শিক্ষার্থী সফলভাবে যোগ হয়েছে।",
          ),
        );
      }

      setPendingSave(false);
      setStudentPhotoFile(null);
      setStudentPhotoPreview("");
      setOpen(false);
    } catch (error) {
      console.error("Student save error:", error);

      toast.error(
        t(
          "Unable to save student.",
          "শিক্ষার্থীর তথ্য সংরক্ষণ করা যায়নি।",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      toast.success(t("Record deleted.", "রেকর্ড মুছে ফেলা হয়েছে।"));
      setPendingDelete(null);
    } catch {
      toast.error(t("Unable to delete this record. Please try again.", "রেকর্ডটি মুছতে ব্যর্থ। আবার চেষ্টা করুন।"));
    } finally {
      setDeleting(false);
    }
  };

  const columnLabel = (key: string) => {
    if (mod.id === "fees") {
      if (key === "fee_head") {
        return t("Fee", "ফি");
      }

      if (key === "is_active") {
        return t("Status", "অবস্থা");
      }
    }

    const field = mod.fields.find(
      (x) => x.key === key,
    );

    return field ? tb(field.label) : key;
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("Search…", "খুঁজুন…")}
              aria-label={t("Search records", "রেকর্ড খুঁজুন")}
              className="pl-9"
            />
          </div>
          {mod.filterKey ? (
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              aria-label={t("Filter", "ফিল্টার")}
              className="h-9 shrink-0 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{t("All", "সব")}</option>
              {filterOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={resetting || loading}
            onClick={async () => {
              setResetting(true);
              try {
                await reset();
                toast.success(t("Restored default data to the database.", "ডাটাবেসে ডিফল্ট ডেটা পুনরুদ্ধার হয়েছে।"));
              } catch {
                toast.error(t("Unable to reset this module. Please try again.", "রিসেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"));
              } finally {
                setResetting(false);
              }
            }}
          >
            <RotateCcw className="size-4" aria-hidden /> {t("Reset", "রিসেট")}
          </Button>
          <Button size="sm" onClick={openCreate} disabled={busy}>
            <Plus className="size-4" aria-hidden /> {t("Add new", "নতুন যোগ")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="surface-card overflow-hidden">
        {(mod.id === "students"
        ? studentLoading
        : loading) ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Inbox className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-semibold text-foreground">{t("No records found", "কোনো রেকর্ড নেই")}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {t("Try a different search, or create the first record.", "অন্যভাবে খুঁজুন, অথবা প্রথম রেকর্ডটি যোগ করুন।")}
            </p>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> {t("Add new", "নতুন যোগ")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {mod.columns.map((key) => (
                    <TableHead key={key} className="whitespace-nowrap">
                      {columnLabel(key)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">{t("Actions", "কার্যক্রম")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.id}>
                    {mod.columns.map((key, idx) => (
                      <TableCell key={key} className={cn("max-w-[16rem] truncate", idx === 0 && "font-medium text-foreground")}>
                        {toText(row[key], lang)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {mod.id === "students" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("View student", "শিক্ষার্থী দেখুন")}
                            onClick={() => {
                              window.location.href = `/admin/students/${row.id}`;
                            }}
                          >
                            <Eye className="size-4" aria-hidden />
                          </Button>
                        ) : null}

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("Edit", "সম্পাদনা")}
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("Delete", "মুছুন")}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(row)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {t("Showing", "দেখানো হচ্ছে")} {(current - 1) * PAGE_SIZE + 1}–
            {Math.min(current * PAGE_SIZE, filtered.length)} {t("of", "এর মধ্যে")} {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              {t("Previous", "পূর্ববর্তী")}
            </Button>
            <span className="px-1 font-semibold text-foreground">
              {current} / {pageCount}
            </span>
            <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
              {t("Next", "পরবর্তী")}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Create / edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("Edit record", "রেকর্ড সম্পাদনা") : t("Add new", "নতুন যোগ")} — {tb(mod.title)}
            </DialogTitle>
            <DialogDescription>{tb(mod.description)}</DialogDescription>
          </DialogHeader>
          {mod.id === "notices" && !editing ? (
            <NoticeForm
              onSave={(notice) => void handleNoticeSave(notice)}
              onCancel={() => setOpen(false)}
            />
          ) : mod.id === "students" ? (
  <div className="space-y-6">
    {/* PHOTO */}
    <section className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t("Student Photo", "শিক্ষার্থীর ছবি")}
      </h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {studentPhotoPreview ? (
          <img
            src={studentPhotoPreview}
            alt={t(
              "Student photo",
              "শিক্ষার্থীর ছবি",
            )}
            className="h-36 w-28 rounded-xl border object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-36 w-28 items-center justify-center rounded-xl border border-dashed bg-muted text-xs text-muted-foreground">
            {t("No photo", "ছবি নেই")}
          </div>
        )}

        <div>
          <Label
            htmlFor="student-photo"
            className="mb-2 inline-block"
          >
            {t(
              "Change Photo",
              "ছবি পরিবর্তন করুন",
            )}
          </Label>

          <Input
            id="student-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file =
                e.target.files?.[0] ?? null;

              setStudentPhotoFile(file);

              if (file) {
                const preview =
                  URL.createObjectURL(file);

                setStudentPhotoPreview(preview);
              }
            }}
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {t(
              "JPG, PNG or WebP",
              "JPG, PNG অথবা WebP",
            )}
          </p>
        </div>
      </div>
    </section>

    {/* STUDENT INFORMATION */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "1. Student Information",
          "১. শিক্ষার্থীর তথ্য",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Student ID */}
        <div className="grid gap-1.5">
          <Label>
            {t(
              "Student ID",
              "শিক্ষার্থী আইডি",
            )}
            <span className="text-destructive">
              {" "}*
            </span>
          </Label>

          <Input
            value={studentValue(
              draft,
              "student_id",
            )}
            disabled={!!editing}
            readOnly={!!editing}
            onChange={(e) =>
              setDraft({
                ...draft,
                student_id: e.target.value,
              })
            }
          />

          {editing ? (
            <p className="text-[11px] text-muted-foreground">
              {t(
                "Student ID cannot be changed.",
                "শিক্ষার্থী আইডি পরিবর্তন করা যাবে না।",
              )}
            </p>
          ) : null}
        </div>

        {[
          ["student_name", "Student's Name", "শিক্ষার্থীর নাম"],
          ["class", "Class", "শ্রেণি"],
          ["section", "Section", "শাখা"],
          ["roll", "Roll", "রোল"],
          ["date_of_birth", "Date of Birth", "জন্ম তারিখ"],
          ["birth_registration_no", "Birth Registration No.", "জন্ম নিবন্ধন নম্বর"],
          ["blood_group", "Blood Group", "রক্তের গ্রুপ"],
          ["gender", "Gender", "লিঙ্গ"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label htmlFor={`student-${key}`}>
              {t(en, bn)}
            </Label>

            {key === "gender" ? (
              <select
                id={`student-${key}`}
                value={studentValue(
                  draft,
                  key,
                )}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]: e.target.value,
                  })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {t("Select", "নির্বাচন করুন")}
                </option>
                <option value="Male">
                  {t("Male", "পুরুষ")}
                </option>
                <option value="Female">
                  {t("Female", "মহিলা")}
                </option>
              </select>
            ) : (
              <Input
                id={`student-${key}`}
                type={
                  key === "date_of_birth"
                    ? "date"
                    : "text"
                }
                value={studentValue(
                  draft,
                  key,
                )}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]: e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>
    </section>

    {/* PARENTS & GUARDIAN */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "2. Parents & Guardian",
          "২. পিতা-মাতা ও অভিভাবক",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["father_name", "Father's Name", "পিতার নাম"],
          ["mother_name", "Mother's Name", "মাতার নাম"],
          ["guardian_name", "Guardian Name", "অভিভাবকের নাম"],
          ["guardian_relation", "Guardian Relation", "অভিভাবকের সম্পর্ক"],
          ["guardian_profession", "Guardian Profession", "অভিভাবকের পেশা"],
          ["phone", "Phone", "ফোন"],
          ["email", "Email", "ইমেইল"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label htmlFor={`student-${key}`}>
              {t(en, bn)}
            </Label>

            <Input
              id={`student-${key}`}
              type={
                key === "email"
                  ? "email"
                  : "text"
              }
              value={studentValue(
                draft,
                key,
              )}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}

        <div className="grid gap-1.5 sm:col-span-2">
          <Label>
            {t(
              "Guardian Address",
              "অভিভাবকের ঠিকানা",
            )}
          </Label>

          <Textarea
            rows={3}
            value={studentValue(
              draft,
              "guardian_address",
            )}
            onChange={(e) =>
              setDraft({
                ...draft,
                guardian_address:
                  e.target.value,
              })
            }
          />
        </div>
      </div>
    </section>

    {/* PERMANENT ADDRESS */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "3. Permanent Address",
          "৩. স্থায়ী ঠিকানা",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["permanent_village", "Village", "গ্রাম"],
          ["permanent_post_office", "Post Office", "ডাকঘর"],
          ["permanent_upazila", "Upazila", "উপজেলা"],
          ["permanent_district", "District", "জেলা"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label>{t(en, bn)}</Label>
            <Input
              value={studentValue(
                draft,
                key,
              )}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>
    </section>

    {/* PRESENT ADDRESS */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "4. Present Address",
          "৪. বর্তমান ঠিকানা",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["present_village", "Village", "গ্রাম"],
          ["present_post_office", "Post Office", "ডাকঘর"],
          ["present_upazila", "Upazila", "উপজেলা"],
          ["present_district", "District", "জেলা"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label>{t(en, bn)}</Label>
            <Input
              value={studentValue(
                draft,
                key,
              )}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>
    </section>

    {/* PREVIOUS EDUCATION */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "5. Previous Education",
          "৫. পূর্ববর্তী শিক্ষার তথ্য",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["previous_institution", "Previous Institution", "পূর্ববর্তী প্রতিষ্ঠান"],
          ["previous_class", "Previous Class", "পূর্ববর্তী শ্রেণি"],
          ["previous_student_no", "Previous Student ID", "পূর্ববর্তী শিক্ষার্থী আইডি"],
          ["previous_date", "Previous Date", "পূর্ববর্তী তারিখ"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label>{t(en, bn)}</Label>

            <Input
              type={
                key === "previous_date"
                  ? "date"
                  : "text"
              }
              value={studentValue(
                draft,
                key,
              )}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>
    </section>

    {/* OTHER INFORMATION */}
    <section className="rounded-2xl border p-5">
      <h3 className="mb-4 text-base font-bold text-primary">
        {t(
          "6. Other Information",
          "৬. অন্যান্য তথ্য",
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["nationality", "Nationality", "জাতীয়তা"],
          ["academic_year", "Academic Year", "শিক্ষাবর্ষ"],
          ["status", "Status", "অবস্থা"],
        ].map(([key, en, bn]) => (
          <div key={key} className="grid gap-1.5">
            <Label>{t(en, bn)}</Label>

            <Input
              value={studentValue(
                draft,
                key,
              )}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}

        <div className="grid gap-1.5 sm:col-span-2">
          <Label>
            {t(
              "Special Requirement",
              "বিশেষ প্রয়োজন",
            )}
          </Label>

          <Textarea
            rows={3}
            value={studentValue(
              draft,
              "special_requirement",
            )}
            onChange={(e) =>
              setDraft({
                ...draft,
                special_requirement:
                  e.target.value,
              })
            }
          />
        </div>
      </div>
    </section>
  </div>
) : (
  <div className="grid gap-4 sm:grid-cols-2">
    {mod.fields.map((field) => {
      const value = draft[field.key];
      const id = `f-${field.key}`;

      return (
        <div
          key={field.key}
          className={cn(
            "grid gap-1.5",
            field.type === "textarea" && "sm:col-span-2",
          )}
        >
          <Label htmlFor={id}>
            {tb(field.label)}
            {field.required ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </Label>

          {field.type === "bi" ? (
            <div className="grid gap-2">
              <Input
                id={id}
                value={isBi(value) ? value.en : ""}
                placeholder="English"
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [field.key]: {
                      en: e.target.value,
                      bn: isBi(value) ? value.bn : "",
                    },
                  })
                }
              />

              <Input
                value={isBi(value) ? value.bn : ""}
                placeholder="বাংলা"
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [field.key]: {
                      en: isBi(value) ? value.en : "",
                      bn: e.target.value,
                    },
                  })
                }
              />
            </div>
          ) : field.type === "textarea" ? (
            <Textarea
              id={id}
              rows={3}
              value={String(value ?? "")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [field.key]: e.target.value,
                })
              }
            />
          ) : field.type === "select" ? (
            <select
              id={id}
              value={String(value ?? "")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [field.key]: e.target.value,
                })
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {(field.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={id}
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : "text"
              }
              value={String(value ?? "")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [field.key]:
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          )}
        </div>
      );
    })}
  </div>
)}
          {mod.id !== "notices" ? (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                {t("Cancel", "বাতিল")}
              </Button>
              <Button onClick={() => void submit()} disabled={submitting}>
                {submitting
                  ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                  : editing
                    ? t("Save changes", "সংরক্ষণ")
                    : t("Create", "তৈরি করুন")}
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete this record?", "রেকর্ডটি মুছে ফেলবেন?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "This action cannot be undone. The record will be permanently removed.",
                "এই কাজটি ফেরানো যাবে না। রেকর্ডটি স্থায়ীভাবে মুছে যাবে।",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("Cancel", "বাতিল")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t("Deleting…", "মুছে ফেলা হচ্ছে…") : t("Delete", "মুছুন")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
            {/*------ Save confirmation --------------------*/}
      <AlertDialog
        open={pendingSave}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setPendingSave(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                "Confirm changes?",
                "পরিবর্তন নিশ্চিত করবেন?",
              )}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {t(
                "Are you sure you want to save these changes to this student's profile?",
                "আপনি কি নিশ্চিত যে এই শিক্ষার্থীর প্রোফাইলে এই পরিবর্তনগুলো সংরক্ষণ করতে চান?",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t("Cancel", "বাতিল")}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void performStudentSave();
              }}
              disabled={submitting}
            >
              {submitting
                ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                : t("Confirm & Save", "নিশ্চিত করুন ও সংরক্ষণ করুন")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
