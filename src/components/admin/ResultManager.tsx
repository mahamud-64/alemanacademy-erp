import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileImage,
  FileText,
  Loader2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type ResultFile = {
  id: string;
  academic_year: string;
  exam_name: string;
  class_name: string;
  file_url: string;
  file_path: string;
  file_type: "pdf" | "jpeg" | "jpg";
  publication_at: string;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
};

const CLASS_OPTIONS = [
  "Play",
  "Nursery",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Hifz",
];

const BUCKET = "result-temp";

function getFileType(file: File): "pdf" | "jpeg" | "jpg" | null {
  const type = file.type.toLowerCase();

  if (type === "application/pdf") {
    return "pdf";
  }

  if (type === "image/jpeg") {
    return "jpeg";
  }

  if (type === "image/jpg") {
    return "jpg";
  }

  return null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ResultManager() {
  const { t } = useLang();

  const [rows, setRows] = useState<ResultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [academicYear, setAcademicYear] = useState(
    String(new Date().getFullYear()),
  );

  const [examName, setExamName] = useState(
    "2nd Term Examination",
  );

  const [publicationAt, setPublicationAt] = useState("");

  const [className, setClassName] = useState(
    CLASS_OPTIONS[0]!,
  );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ============================================================
  // LOAD
  // ============================================================

  const loadResults = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("result_temp_files")
      .select("*")
      .order("publication_at", {
        ascending: false,
      })
      .order("class_name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Result temp loading error:",
        error,
      );

      toast.error(
        t(
          "Unable to load result files.",
          "ফলাফলের ফাইল লোড করা যায়নি।",
        ),
      );

      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as ResultFile[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadResults();
  }, []);

  // ============================================================
  // SELECT FILE
  // ============================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileType = getFileType(file);

    if (!fileType) {
      toast.error(
        t(
          "Only PDF and JPEG files are allowed.",
          "শুধুমাত্র PDF এবং JPEG ফাইল অনুমোদিত।",
        ),
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        t(
          "Maximum file size is 20 MB.",
          "সর্বোচ্চ ফাইল সাইজ ২০ MB।",
        ),
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // ============================================================
  // UPLOAD
  // ============================================================

  const handleUpload = async () => {
    if (!academicYear.trim()) {
      toast.error(
        t(
          "Enter the academic year.",
          "শিক্ষাবর্ষ লিখুন।",
        ),
      );
      return;
    }

    if (!examName.trim()) {
      toast.error(
        t(
          "Enter the examination name.",
          "পরীক্ষার নাম লিখুন।",
        ),
      );
      return;
    }

    if (!publicationAt) {
      toast.error(
        t(
          "Select the publication date and time.",
          "প্রকাশের তারিখ ও সময় নির্বাচন করুন।",
        ),
      );
      return;
    }

    if (!selectedFile) {
      toast.error(
        t(
          "Select a PDF or JPEG file.",
          "একটি PDF অথবা JPEG ফাইল নির্বাচন করুন।",
        ),
      );
      return;
    }

    const fileType = getFileType(selectedFile);

    if (!fileType) {
      return;
    }

    setUploading(true);

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

      const safeYear = slugify(academicYear);
      const safeExam = slugify(examName);
      const safeClass = slugify(className);

      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() ??
        fileType;

      const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const filePath =
        `${safeYear}/${safeExam}/${safeClass}/${uniqueName}`;

      // --------------------------------------------------------
      // Upload file
      // --------------------------------------------------------

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            filePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                selectedFile.type,
            },
          );

      if (uploadError) {
        throw uploadError;
      }

      // --------------------------------------------------------
      // Public URL
      // --------------------------------------------------------

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      const fileUrl =
        publicUrlData.publicUrl;

      // --------------------------------------------------------
      // Deactivate previous result for the same class/exam
      // --------------------------------------------------------

      await supabase
        .from("result_temp_files")
        .update({
          is_active: false,
        })
        .eq(
          "academic_year",
          academicYear.trim(),
        )
        .eq(
          "exam_name",
          examName.trim(),
        )
        .eq(
          "class_name",
          className,
        );

      // --------------------------------------------------------
      // Insert new result
      // --------------------------------------------------------

      const {
        data,
        error: insertError,
      } = await supabase
        .from("result_temp_files")
        .insert({
          academic_year:
            academicYear.trim(),

          exam_name:
            examName.trim(),

          class_name:
            className,

          file_url:
            fileUrl,

          file_path:
            filePath,

          file_type:
            fileType,

          publication_at:
            new Date(publicationAt).toISOString(),

          is_published:
            false,

          is_active:
            true,

          created_by:
            user.id,
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      setRows((current) => [
        data as ResultFile,
        ...current.filter(
          (row) =>
            !(
              row.academic_year ===
                academicYear.trim() &&
              row.exam_name ===
                examName.trim() &&
              row.class_name ===
                className
            ),
        ),
      ]);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        t(
          "Result uploaded successfully.",
          "ফলাফল সফলভাবে আপলোড হয়েছে।",
        ),
      );
    } catch (error) {
      console.error(
        "Result upload error:",
        error,
      );

      toast.error(
        t(
          "Unable to upload result.",
          "ফলাফল আপলোড করা যায়নি।",
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // PUBLISH / UNPUBLISH
  // ============================================================

  const togglePublished = async (
    row: ResultFile,
  ) => {
    setBusyId(row.id);

    const next =
      !row.is_published;

    const { error } = await supabase
      .from("result_temp_files")
      .update({
        is_published: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (error) {
      console.error(
        "Result publish update error:",
        error,
      );

      toast.error(
        t(
          "Unable to update publication status.",
          "প্রকাশের অবস্থা পরিবর্তন করা যায়নি।",
        ),
      );

      setBusyId(null);
      return;
    }

    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? {
              ...item,
              is_published: next,
            }
          : item,
      ),
    );

    toast.success(
      next
        ? t(
            "Result published.",
            "ফলাফল প্রকাশিত হয়েছে।",
          )
        : t(
            "Result unpublished.",
            "ফলাফল প্রত্যাহার করা হয়েছে।",
          ),
    );

    setBusyId(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteResult = async (
    row: ResultFile,
  ) => {
    const confirmed =
      window.confirm(
        t(
          `Delete ${row.class_name} result?`,
          `${row.class_name} এর ফলাফল মুছে ফেলবেন?`,
        ),
      );

    if (!confirmed) {
      return;
    }

    setBusyId(row.id);

    try {
      // Delete storage file
      const {
        error: storageError,
      } = await supabase.storage
        .from(BUCKET)
        .remove([row.file_path]);

      if (storageError) {
        console.warn(
          "Storage delete warning:",
          storageError,
        );
      }

      // Delete database row
      const { error } =
        await supabase
          .from("result_temp_files")
          .delete()
          .eq("id", row.id);

      if (error) {
        throw error;
      }

      setRows((current) =>
        current.filter(
          (item) => item.id !== row.id,
        ),
      );

      toast.success(
        t(
          "Result deleted.",
          "ফলাফল মুছে ফেলা হয়েছে।",
        ),
      );
    } catch (error) {
      console.error(
        "Result delete error:",
        error,
      );

      toast.error(
        t(
          "Unable to delete result.",
          "ফলাফল মুছে ফেলা যায়নি।",
        ),
      );
    } finally {
      setBusyId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          {t(
            "Results Management",
            "ফলাফল ব্যবস্থাপনা",
          )}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "Upload and manage PDF/JPEG results for the public Result page.",
            "পাবলিক Result পেজের জন্য PDF/JPEG ফলাফল আপলোড ও পরিচালনা করুন।",
          )}
        </p>
      </div>

      {/* ======================================================
          UPLOAD CARD
      ====================================================== */}

      <div className="surface-card rounded-2xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-bold text-foreground">
            {t(
              "Add Result File",
              "ফলাফলের ফাইল যোগ করুন",
            )}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "Upload one result file for a class.",
              "একটি শ্রেণির জন্য একটি ফলাফলের ফাইল আপলোড করুন।",
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Academic Year */}

          <div className="grid gap-1.5">
            <label
              htmlFor="result-academic-year"
              className="text-sm font-medium"
            >
              {t(
                "Academic Year",
                "শিক্ষাবর্ষ",
              )}
            </label>

            <input
              id="result-academic-year"
              value={academicYear}
              onChange={(e) =>
                setAcademicYear(e.target.value)
              }
              placeholder="2026"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Examination */}

          <div className="grid gap-1.5">
            <label
              htmlFor="result-exam-name"
              className="text-sm font-medium"
            >
              {t(
                "Examination",
                "পরীক্ষা",
              )}
            </label>

            <input
              id="result-exam-name"
              value={examName}
              onChange={(e) =>
                setExamName(e.target.value)
              }
              placeholder="2nd Term Examination"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Class */}

          <div className="grid gap-1.5">
            <label
              htmlFor="result-class"
              className="text-sm font-medium"
            >
              {t(
                "Class",
                "শ্রেণি",
              )}
            </label>

            <select
              id="result-class"
              value={className}
              onChange={(e) =>
                setClassName(e.target.value)
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CLASS_OPTIONS.map(
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

          {/* Publication */}

          <div className="grid gap-1.5">
            <label
              htmlFor="result-publication"
              className="text-sm font-medium"
            >
              {t(
                "Publication Date & Time",
                "প্রকাশের তারিখ ও সময়",
              )}
            </label>

            <input
              id="result-publication"
              type="datetime-local"
              value={publicationAt}
              onChange={(e) =>
                setPublicationAt(
                  e.target.value,
                )
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* File */}

        <div className="mt-4">
          <label
            htmlFor="result-file"
            className="mb-1.5 block text-sm font-medium"
          >
            {t(
              "Result File",
              "ফলাফলের ফাইল",
            )}
          </label>

          <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-5">
            <input
              ref={fileInputRef}
              id="result-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              onChange={handleFileChange}
              className="block w-full text-sm"
            />

            {selectedFile ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-background p-3 text-sm">
                {getFileType(
                  selectedFile,
                ) === "pdf" ? (
                  <FileText className="size-5 text-primary" />
                ) : (
                  <FileImage className="size-5 text-primary" />
                )}

                <span className="min-w-0 flex-1 truncate">
                  {selectedFile.name}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    if (
                      fileInputRef.current
                    ) {
                      fileInputRef.current.value =
                        "";
                    }
                  }}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <XCircle className="size-4" />
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {t(
                  "Allowed: PDF, JPG, JPEG • Maximum 2 MB",
                  "অনুমোদিত: PDF, JPG, JPEG • সর্বোচ্চ ২ MB",
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={() =>
              void handleUpload()
            }
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t(
                  "Uploading...",
                  "আপলোড হচ্ছে...",
                )}
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {t(
                  "Upload Result",
                  "ফলাফল আপলোড করুন",
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ======================================================
          RESULT LIST
      ====================================================== */}

      <div className="surface-card overflow-hidden rounded-2xl">
        <div className="border-b border-border p-5">
          <h2 className="font-bold text-foreground">
            {t(
              "Uploaded Results",
              "আপলোড করা ফলাফল",
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t(
                "No result files uploaded yet.",
                "এখনও কোনো ফলাফলের ফাইল আপলোড করা হয়নি।",
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => {
              const publicationDate =
                new Date(
                  row.publication_at,
                );

              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      {row.file_type ===
                      "pdf" ? (
                        <FileText className="size-5" />
                      ) : (
                        <FileImage className="size-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {row.class_name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.exam_name} •{" "}
                        {row.academic_year}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {publicationDate.toLocaleString()}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={
                            row.is_published
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                              : "rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
                          }
                        >
                          {row.is_published
                            ? t(
                                "Published",
                                "প্রকাশিত",
                              )
                            : t(
                                "Hidden",
                                "গোপন",
                              )}
                        </span>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {row.file_type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={
                          row.file_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="mr-1.5 size-4" />
                        {t(
                          "Preview",
                          "প্রিভিউ",
                        )}
                      </a>
                    </Button>

                    <Button
                      type="button"
                      variant={
                        row.is_published
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                      disabled={
                        busyId === row.id
                      }
                      onClick={() =>
                        void togglePublished(
                          row,
                        )
                      }
                    >
                      {busyId === row.id ? (
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                      ) : row.is_published ? (
                        <XCircle className="mr-1.5 size-4" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 size-4" />
                      )}

                      {row.is_published
                        ? t(
                            "Unpublish",
                            "প্রত্যাহার",
                          )
                        : t(
                            "Publish",
                            "প্রকাশ করুন",
                          )}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={
                        busyId === row.id
                      }
                      onClick={() =>
                        void deleteResult(
                          row,
                        )
                      }
                    >
                      <Trash2 className="mr-1.5 size-4" />
                      {t(
                        "Delete",
                        "মুছে ফেলুন",
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}