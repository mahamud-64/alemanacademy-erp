import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

type ExamStatus = "draft" | "published";

type Exam = {
  id: string;
  academic_year: string;
  name: string;
  status: ExamStatus;
  created_at?: string;
  updated_at?: string;
};

type ClassOption = {
  value: string;
  en: string;
  bn: string;
};

const CLASS_OPTIONS: readonly ClassOption[] = [
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
];
const EXAM_PRESETS = [
  {
    value: "প্রথম সাময়িক পরীক্ষা",
    en: "First Term Examination",
  },
  {
    value: "দ্বিতীয় সাময়িক পরীক্ষা",
    en: "Second Term Examination",
  },
  {
    value: "বার্ষিক পরীক্ষা",
    en: "Annual Examination",
  },
] as const;

const STATUS_OPTIONS: readonly ExamStatus[] = [
  "draft",
  "published",
];

const currentYear = new Date().getFullYear();

const YEARS = [
  String(currentYear - 1),
  String(currentYear),
  String(currentYear + 1),
];

function classLabel(value: string, lang: "en" | "bn") {
  const option = CLASS_OPTIONS.find((item) => item.value === value);

  if (!option) return value;

  return lang === "bn" ? option.bn : option.en;
}

function statusLabel(
  status: ExamStatus,
  lang: "en" | "bn",
) {
  const labels = {
    draft: {
      en: "Draft",
      bn: "খসড়া",
    },
    published: {
      en: "Published",
      bn: "প্রকাশিত",
    },
  };

  return labels[status][lang];
}

export function ExamManager() {
  const { t, lang } = useLang();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openForm, setOpenForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [customExamName, setCustomExamName] = useState(false);
  const [form, setForm] = useState({
    name: "",
    academic_year:  String(new Date().getFullYear()),
    status: "draft" as ExamStatus,
  });
  const loadExams = useCallback(async () => {
    setLoading(true);
    const {
        data: { session },
    } = await supabase.auth.getSession();

    console.log("SUPABASE SESSION:", session);
    console.log("SUPABASE USER:", session?.user);
    const { data, error } = await supabase
      .from("exams")
      .select(
        "id, academic_year, name, status, created_at, updated_at",
      )
      .order("academic_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load exams:", error);

      toast.error(
        t(
          "Unable to load examinations.",
          "পরীক্ষার তথ্য লোড করা যায়নি।",
        ),
      );

      setExams([]);
      setLoading(false);
      return;
    }

    setExams((data ?? []) as Exam[]);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  const filteredExams = useMemo(() => {
    const q = query.trim().toLowerCase();

    return exams.filter((exam) => {
      if (
        statusFilter !== "all" &&
        exam.status !== statusFilter
      ) {
        return false;
      }

      if (!q) return true;

      const searchable = [
        exam.name,
        exam.academic_year,,
        exam.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [exams, query, statusFilter]);

    function openCreate() {
        setEditingExam(null);
        setCustomExamName(false);

        setForm({
            name: "",
            academic_year: String(new Date().getFullYear()),
            status: "draft",
        });

        setOpenForm(true);
    }

    function openEdit(exam: Exam) {
      setEditingExam(exam);

      const isPreset = EXAM_PRESETS.some(
        (preset) => preset.value === exam.name,
      );

      setCustomExamName(!isPreset);

      setForm({
        name: exam.name,
        academic_year: exam.academic_year,
        status: exam.status,
      });

      setOpenForm(true);
    }

  async function saveExam() {
    const name = form.name.trim();

    if (!name) {
      toast.error(
        t(
          "Exam name is required.",
          "পরীক্ষার নাম আবশ্যক।",
        ),
      );
      return;
    }


    setSaving(true);

    try {
      if (editingExam) {
        const { data, error } = await supabase
          .from("exams")
          .update({
            name,
            academic_year: form.academic_year,     
            status: form.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingExam.id)
          .select(
            "id, academic_year, name, status, created_at, updated_at",
          )
          .single();

        if (error) throw error;

        setExams((current) =>
          current.map((item) =>
            item.id === editingExam.id
              ? (data as Exam)
              : item,
          ),
        );

        toast.success(
          t(
            "Examination updated successfully.",
            "পরীক্ষা সফলভাবে আপডেট হয়েছে।",
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("exams")
          .insert({
            name,
            academic_year: form.academic_year,
            status: form.status,
          })
          .select(
            "id, academic_year, name, status, created_at, updated_at",
          )
          .single();

        if (error) throw error;

        setExams((current) => [
          data as Exam,
          ...current,
        ]);

        toast.success(
          t(
            "Examination created successfully.",
            "পরীক্ষা সফলভাবে তৈরি হয়েছে।",
          ),
        );
      }

      setOpenForm(false);
      setEditingExam(null);
    } catch (error) {
        console.error("Exam save error:", error);

        const message =
            error instanceof Error
            ? error.message
            : typeof error === "object" &&
                error !== null &&
                "message" in error
                ? String(error.message)
                : String(error);

        console.error("SUPABASE ERROR:", message);

        toast.error(message);
        } finally {
      setSaving(false);
    }
  }

  async function deleteExam() {
    if (!deleteTarget) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setExams((current) =>
        current.filter(
          (item) => item.id !== deleteTarget.id,
        ),
      );

      toast.success(
        t(
          "Examination deleted successfully.",
          "পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।",
        ),
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Exam delete error:", error);

      toast.error(
        t(
          "Unable to delete the examination.",
          "পরীক্ষাটি মুছে ফেলা যায়নি।",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            {t("Examinations", "পরীক্ষাসমূহ")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Create and manage examinations.",
              "পরীক্ষা তৈরি ও পরিচালনা করুন।",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />

          {t("Add Exam", "নতুন পরীক্ষা")}
        </button>
      </div>

      {/* Search / filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder={t(
              "Search examinations...",
              "পরীক্ষা খুঁজুন...",
            )}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="all">
            {t("All statuses", "সব অবস্থা")}
          </option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status, lang)}
            </option>
          ))}
        </select>
      </div>

      {/* Exam list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t(
              "Loading examinations...",
              "পরীক্ষার তথ্য লোড হচ্ছে...",
            )}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t(
                "No examinations found.",
                "কোনো পরীক্ষা পাওয়া যায়নি।",
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    {t("Examination", "পরীক্ষার নাম")}
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    {t("Academic Year", "শিক্ষাবর্ষ")}
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    {t("Status", "অবস্থা")}
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    {t("Actions", "কার্যক্রম")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium">
                      {exam.name}
                    </td>

                    <td className="px-4 py-4">
                      {exam.academic_year}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {statusLabel(exam.status, lang)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(exam)}
                          className="rounded-lg p-2 hover:bg-muted"
                          aria-label={t(
                            "Edit examination",
                            "পরীক্ষা সম্পাদনা করুন",
                          )}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(exam)
                          }
                          className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                          aria-label={t(
                            "Delete examination",
                            "পরীক্ষা মুছুন",
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-semibold text-primary">
                  {editingExam
                    ? t(
                        "Edit Examination",
                        "পরীক্ষা সম্পাদনা",
                      )
                    : t(
                        "Add New Examination",
                        "নতুন পরীক্ষা",
                      )}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    "Manage the examination directly in the exams table.",
                    "পরীক্ষার তথ্য সরাসরি exams টেবিলে সংরক্ষণ হবে।",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {t("Exam Name", "পরীক্ষার নাম")}
                </label>

                {!customExamName ? (
                  <select
                    value={
                      EXAM_PRESETS.some(
                        (exam) => exam.value === form.name,
                      )
                        ? form.name
                        : ""
                    }
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "__custom__") {
                        setCustomExamName(true);

                        setForm((current) => ({
                          ...current,
                          name: "",
                        }));

                        return;
                      }

                      setForm((current) => ({
                        ...current,
                        name: value,
                      }));
                    }}
                    className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
                  >
                    <option value="">
                      {t(
                        "Select exam name",
                        "পরীক্ষার নাম নির্বাচন করুন",
                      )}
                    </option>

                    {EXAM_PRESETS.map((exam) => (
                      <option
                        key={exam.value}
                        value={exam.value}
                      >
                        {t(exam.en, exam.value)}
                      </option>
                    ))}

                    <option value="__custom__">
                      {t(
                        "Custom exam name...",
                        "নিজের পরীক্ষার নাম লিখুন...",
                      )}
                    </option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder={t(
                        "Enter custom exam name",
                        "নিজের পরীক্ষার নাম লিখুন",
                      )}
                      className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setCustomExamName(false);

                        setForm((current) => ({
                          ...current,
                          name: "",
                        }));
                      }}
                      className="rounded-xl border px-3 text-sm hover:bg-muted"
                    >
                      {t("List", "তালিকা")}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {t("Academic Year", "শিক্ষাবর্ষ")}
                </label>

                <select
                  value={form.academic_year}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      academic_year: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {t("Status", "অবস্থা")}
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target
                        .value as ExamStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                disabled={saving}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                {t("Cancel", "বাতিল")}
              </button>

              <button
                type="button"
                onClick={() => void saveExam()}
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving
                  ? t("Saving...", "সংরক্ষণ হচ্ছে...")
                  : editingExam
                    ? t("Save Changes", "পরিবর্তন সংরক্ষণ")
                    : t("Create Exam", "পরীক্ষা তৈরি করুন")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">
              {t(
                "Delete examination?",
                "পরীক্ষাটি মুছে ফেলবেন?",
              )}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                `This will delete "${deleteTarget.name}".`,
                `“${deleteTarget.name}” পরীক্ষা মুছে যাবে।`,
              )}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium"
              >
                {t("Cancel", "বাতিল")}
              </button>

              <button
                type="button"
                onClick={() => void deleteExam()}
                disabled={saving}
                className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground"
              >
                {saving
                  ? t("Deleting...", "মুছে ফেলা হচ্ছে...")
                  : t("Delete", "মুছুন")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}