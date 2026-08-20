import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createFileRoute } from "@tanstack/react-router";

import {
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { ActionButton } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/admissions")({
  component: AdmissionsPage,
});

type Application = Record<string, unknown> & {
  id: string;

  application_id?: string | null;
  application_type?: string | null;

  student_id?: string | null;
  student_name?: string | null;
  applying_for?: string | null;

  date_of_birth?: string | null;
  birth_registration_no?: string | null;
  blood_group?: string | null;
  gender?: string | null;

  father_name?: string | null;
  mother_name?: string | null;

  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_address?: string | null;

  email?: string | null;

  previous_institution?: string | null;
  previous_class?: string | null;
  previous_student_no?: string | null;
  previous_date?: string | null;

  special_requirement?: string | null;

  photo_url?: string | null;

  academic_year?: string | null;
  status?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  present_same_as_permanent?: boolean | null;
  declaration_accepted?: boolean | null;
};

type StatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected";

/* =========================================================
   HELPERS
========================================================= */

function text(value: unknown): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function formatDate(value: unknown): string {
  const raw = text(value);

  if (!raw) {
    return "—";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString("en-GB");
}

function formatDateTime(value: unknown): string {
  const raw = text(value);

  if (!raw) {
    return "—";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeStatus(value: unknown): string {
  return text(value)
    .trim()
    .toLowerCase();
}

function formatValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

/* =========================================================
   MAIN PAGE
========================================================= */

function AdmissionsPage() {
  const { t } = useLang();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [selected, setSelected] =
    useState<Application | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD APPLICATIONS
  ======================================================= */

  const loadApplications =
    useCallback(async () => {
      setError("");

      const {
        data,
        error: queryError,
      } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        console.error(
          "Admissions load error:",
          queryError,
        );

        setError(
          t(
            "Unable to load admission applications.",
            "ভর্তি আবেদনগুলো লোড করা যায়নি।",
          ),
        );

        setApplications([]);
        setLoading(false);
        setRefreshing(false);

        return;
      }

      setApplications(
        (data ?? []) as Application[],
      );

      setLoading(false);
      setRefreshing(false);
    }, [t]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredApplications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return applications.filter(
        (application) => {
          const applicationStatus =
            normalizeStatus(
              application.status,
            );

          if (
            status !== "all" &&
            applicationStatus !== status
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable = [
            application.application_id,
            application.student_name,
            application.applying_for,
            application.father_name,
            application.mother_name,
            application.guardian_name,
            application.guardian_phone,
            application.email,
            application.phone,
          ]
            .map(text)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query,
          );
        },
      );
    }, [
      applications,
      search,
      status,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      all: applications.length,

      pending:
        applications.filter(
          (item) =>
            normalizeStatus(
              item.status,
            ) === "pending",
        ).length,

      approved:
        applications.filter(
          (item) =>
            normalizeStatus(
              item.status,
            ) === "approved",
        ).length,

      rejected:
        applications.filter(
          (item) =>
            normalizeStatus(
              item.status,
            ) === "rejected",
        ).length,
    };
  }, [applications]);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    application: Application,
    nextStatus: "approved" | "rejected",
    ) => {
    if (actionLoading) {
        return;
    }

    setActionLoading(true);
    setError("");

    try {
        // ========================================================
        // APPROVE
        // ========================================================
        //
        // Approval MUST go through the secure database function.
        //
        // We do NOT directly update applications.status here.
        //
        // The database function handles:
        //
        // 1. Admin authorization
        // 2. Application locking
        // 3. Duplicate protection
        // 4. Student ID generation
        // 5. Student creation
        // 6. Application approval
        //
        // All inside one database transaction.
        //
        // ========================================================

        if (nextStatus === "approved") {
        const {
            data,
            error: rpcError,
        } = await supabase.rpc(
            "approve_admission_application",
            {
            p_application_id: application.id,
            },
        );

        if (rpcError) {
            console.error(
            "Admission approval failed:",
            rpcError,
            );

            setError(
            t(
                "Unable to approve this application.",
                "এই আবেদনটি অনুমোদন করা যায়নি।",
            ),
            );

            return;
        }

        // The RPC returns the newly created student.
        const student = data as {
            student_id?: string;
            application_id?: string;
        };

        // Update the currently displayed application
        // without requiring a full page reload.
        const updatedApplication: Application = {
            ...application,

            status: "approved",

            student_id:
            student?.student_id ??
            application.student_id ??
            null,
        };

        setApplications((current) =>
            current.map((item) =>
            item.id === application.id
                ? updatedApplication
                : item,
            ),
        );

        setSelected(
            updatedApplication,
        );

        return;
        }


        // ========================================================
        // REJECT
        // ========================================================
        //
        // Rejection does NOT create a student.
        //
        // It simply changes the application status.
        //
        // The original application remains preserved.
        //
        // ========================================================

        if (nextStatus === "rejected") {
        const {
            error: rejectError,
        } = await supabase
            .from("applications")
            .update({
            status: "rejected",
            })
            .eq("id", application.id);

        if (rejectError) {
            console.error(
            "Application rejection failed:",
            rejectError,
            );

            setError(
            t(
                "Unable to reject this application.",
                "এই আবেদনটি বাতিল করা যায়নি।",
            ),
            );

            return;
        }

        const updatedApplication: Application = {
            ...application,
            status: "rejected",
        };

        setApplications((current) =>
            current.map((item) =>
            item.id === application.id
                ? updatedApplication
                : item,
            ),
        );

        setSelected(
            updatedApplication,
        );
        }
    } catch (error) {
        console.error(
        "Unexpected admission status error:",
        error,
        );

        setError(
        t(
            "Something went wrong. Please try again.",
            "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
        ),
        );
    } finally {
        setActionLoading(false);
    }
    };

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    await loadApplications();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">
            {t(
              "Admissions",
              "ভর্তি",
            )}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Manage real admission applications from Supabase.",
              "Supabase থেকে আসা ভর্তি আবেদন পরিচালনা করুন।",
            )}
          </p>
        </div>

        <ActionButton
          type="button"
          onClick={() =>
            void refresh()
          }
          disabled={refreshing}
          className="inline-flex items-center gap-2"
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}

          {t(
            "Refresh",
            "রিফ্রেশ",
          )}
        </ActionButton>
      </div>

      {/* ERROR */}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {/* STATUS CARDS */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <StatusCard
          label={t(
            "All",
            "সব",
          )}
          value={counts.all}
          active={
            status === "all"
          }
          onClick={() =>
            setStatus("all")
          }
        />

        <StatusCard
          label={t(
            "Pending",
            "অপেক্ষমাণ",
          )}
          value={counts.pending}
          active={
            status === "pending"
          }
          onClick={() =>
            setStatus("pending")
          }
        />

        <StatusCard
          label={t(
            "Approved",
            "অনুমোদিত",
          )}
          value={counts.approved}
          active={
            status === "approved"
          }
          onClick={() =>
            setStatus("approved")
          }
        />

        <StatusCard
          label={t(
            "Rejected",
            "বাতিল",
          )}
          value={counts.rejected}
          active={
            status === "rejected"
          }
          onClick={() =>
            setStatus("rejected")
          }
        />

      </div>

      {/* SEARCH */}

      <div className="surface-card p-4">
        <div className="relative">

          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder={t(
              "Search application ID, student, guardian or phone...",
              "আবেদন আইডি, শিক্ষার্থী, অভিভাবক বা ফোন দিয়ে খুঁজুন...",
            )}
            className="w-full rounded-xl border border-primary/10 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />

        </div>
      </div>

      {/* TABLE */}

      <div className="surface-card overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">

            <Loader2 className="size-5 animate-spin" />

            {t(
              "Loading applications...",
              "আবেদনগুলো লোড হচ্ছে...",
            )}

          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">

            <FileText className="mx-auto size-10 text-muted-foreground/50" />

            <p className="mt-3 font-semibold">
              {t(
                "No applications found.",
                "কোনো আবেদন পাওয়া যায়নি।",
              )}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "Try changing the search or status filter.",
                "সার্চ অথবা স্ট্যাটাস ফিল্টার পরিবর্তন করুন।",
              )}
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-sm">

              <thead>
                <tr className="border-b bg-primary/[0.04] text-left">

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Application",
                      "আবেদন",
                    )}
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Student",
                      "শিক্ষার্থী",
                    )}
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Class",
                      "শ্রেণি",
                    )}
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Phone",
                      "ফোন",
                    )}
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Applied",
                      "আবেদনের তারিখ",
                    )}
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    {t(
                      "Status",
                      "অবস্থা",
                    )}
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    {t(
                      "Action",
                      "কার্যক্রম",
                    )}
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredApplications.map(
                  (application) => (
                    <tr
                      key={
                        application.id
                      }
                      className="border-b last:border-b-0 hover:bg-primary/[0.025]"
                    >

                      <td className="px-4 py-4">
                        <div className="font-semibold text-primary">
                          {text(
                            application.application_id,
                          ) || "—"}
                        </div>

                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {text(
                            application.id,
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold">
                          {text(
                            application.student_name,
                          ) || "—"}
                        </div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {text(
                            application.application_type,
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {text(
                          application.applying_for,
                        ) || "—"}
                      </td>

                      <td className="px-4 py-4">
                        {text(
                          application.guardian_phone,
                        ) ||
                          text(
                            application.phone,
                          ) ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(
                          application.created_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={text(
                            application.status,
                          )}
                        />
                      </td>

                      <td className="px-4 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            setSelected(
                              application,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                        >
                          <Eye className="size-3.5" />

                          {t(
                            "View",
                            "দেখুন",
                          )}
                        </button>

                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* DETAILS */}

      {selected ? (
        <ApplicationDetails
          application={selected}
          loading={actionLoading}
          onClose={() =>
            setSelected(null)
          }
          onApprove={() =>
            void updateStatus(
              selected,
              "approved",
            )
          }
          onReject={() =>
            void updateStatus(
              selected,
              "rejected",
            )
          }
        />
      ) : null}

    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "surface-card p-4 text-left transition",
        active
          ? "border-primary bg-primary/[0.06] shadow-sm"
          : "hover:border-primary/30",
      ].join(" ")}
    >
      <div className="text-xs font-semibold text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold text-primary">
        {value}
      </div>
    </button>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "approved"
  ) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Approved
      </span>
    );
  }

  if (
    normalized === "rejected"
  ) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      Pending
    </span>
  );
}

/* =========================================================
   APPLICATION DETAILS
========================================================= */

    function ApplicationDetails({
    application,
    loading,
    onClose,
    onApprove,
    onReject,
    }: {
    application: Application;
    loading: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    }) {
    const { t } = useLang();

    const [photoUrl, setPhotoUrl] = useState("");
    const [photoLoading, setPhotoLoading] = useState(false);

    /* =========================================================
        LOAD SIGNED STUDENT PHOTO
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadPhoto = async () => {
        const path = text(application.photo_url).trim();

        if (!path) {
            setPhotoUrl("");
            setPhotoLoading(false);
            return;
        }

        setPhotoLoading(true);

        const { data, error } = await supabase.storage
            .from("student-photos")
            .createSignedUrl(path, 300);

        if (cancelled) {
            return;
        }

        if (error) {
            console.error(
            "Admin application photo error:",
            error,
            );

            setPhotoUrl("");
        } else {
            setPhotoUrl(data?.signedUrl ?? "");
        }

        setPhotoLoading(false);
        };

        void loadPhoto();

        return () => {
        cancelled = true;
        };
    }, [application.photo_url]);

    /* =========================================================
        FIELDS ALREADY SHOWN IN STRUCTURED SECTIONS

        Future database columns are still handled automatically
        below under "Additional application data".
    ========================================================= */

    const structuredFields = new Set([
        "id",
        "application_id",
        "application_type",

        "student_id",
        "student_name",
        "applying_for",

        "date_of_birth",
        "birth_registration_no",
        "blood_group",
        "gender",

        "father_name",
        "mother_name",

        "guardian_name",
        "guardian_phone",
        "guardian_address",

        "email",
        "phone",

        "previous_institution",
        "previous_class",
        "previous_student_no",
        "previous_date",

        "special_requirement",

        "photo_url",

        "academic_year",
        "status",

        "created_at",
        "updated_at",

        "present_same_as_permanent",
        "declaration_accepted",
    ]);

    const additionalFields = Object.entries(
        application,
    ).filter(([key]) => !structuredFields.has(key));

    const currentStatus = normalizeStatus(
        application.status,
    );

    return (
        <div className="fixed inset-0 z-50">
        {/* =====================================================
            BACKDROP
        ===================================================== */}

        <button
            type="button"
            aria-label="Close application details"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        />

        {/* =====================================================
            DRAWER

            Mobile  → full width
            Desktop → wide but controlled
        ===================================================== */}

        <aside className="absolute inset-y-0 right-0 flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
            {/* ===================================================
                HEADER
            =================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground sm:text-xs">
                {t(
                    "Admission Application",
                    "ভর্তি আবেদন",
                )}
                </p>

                <h3 className="truncate text-base font-bold text-primary sm:text-lg">
                {text(application.application_id) ||
                    "Application"}
                </h3>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="ml-3 shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close"
            >
                <XCircle className="size-5" />
            </button>
            </div>

            {/* ===================================================
                CONTENT
            =================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-5">
            {/* =================================================
                STUDENT INFORMATION

                SPECIAL SECTION:
                Photo + student information stay together.

                On desktop this does NOT become a 2-column
                information section.
            ================================================= */}

            <section className="rounded-2xl border border-primary/10 bg-white p-4 sm:p-5">
                <h3 className="mb-4 text-base font-bold text-primary">
                {t(
                    "Student Information",
                    "শিক্ষার্থীর তথ্য",
                )}
                </h3>

                <div className="grid gap-5 md:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[165px_minmax(0,1fr)]">
                {/* =================================================
                    PHOTO
                ================================================= */}

               <div className="flex justify-center md:justify-start">
                    {photoLoading ? (
                        <div className="flex h-[7cm] w-[5.5cm] items-center justify-center rounded-xl border border-primary/10 bg-muted">
                        <Loader2 className="size-5 animate-spin" />
                        </div>
                    ) : photoUrl ? (
                        <img
                        src={photoUrl}
                        alt={
                            text(application.student_name) ||
                            "Student photo"
                        }
                        className="h-[7cm] w-[5.5cm] rounded-xl border border-black/10 object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-[7cm] w-[5.5cm] items-center justify-center rounded-xl border border-dashed border-black/15 bg-muted text-xs text-muted-foreground">
                        {t(
                            "No photo",
                            "ছবি নেই",
                        )}
                        </div>
                    )}
                    </div>
                {/* =================================================
                    STUDENT DETAILS

                    Same-line label + value.
                ================================================= */}

                <div className="min-w-0">
                    <InfoRow
                        label={t(
                        "Student name",
                        "শিক্ষার্থীর নাম",
                        )}
                        value={application.student_name}
                    />

                    <InfoRow
                        label={t(
                        "Applying for",
                        "যে শ্রেণিতে",
                        )}
                        value={formatApplyingClass(
                        application.applying_for,
                        )}
                    />

                    <InfoRow
                        label={t(
                        "Application type",
                        "আবেদনের ধরন",
                        )}
                        value={formatApplicationType(
                        application.application_type,
                        )}
                    />

                    <InfoRow
                        label={t(
                        "Date of birth",
                        "জন্ম তারিখ",
                        )}
                        value={formatDate(
                        application.date_of_birth,
                        )}
                    />

                    <InfoRow
                        label={t(
                        "Gender",
                        "লিঙ্গ",
                        )}
                        value={formatGender(
                        application.gender,
                        )}
                    />

                    <InfoRow
                        label={t(
                        "Blood group",
                        "রক্তের গ্রুপ",
                        )}
                        value={application.blood_group}
                    />

                    <InfoRow
                        label={t(
                        "Birth registration",
                        "জন্মনিবন্ধন",
                        )}
                        value={
                        application.birth_registration_no
                        }
                    />

                    <InfoRow
                        label={t(
                        "Student ID",
                        "শিক্ষার্থী আইডি",
                        )}
                        value={application.student_id}
                    />

                    <InfoRow
                        label={t(
                            "Mobile",
                            "মোবাইল",
                        )}
                        value={
                            text(application.guardian_phone) ||
                            text(application.phone)
                        }
                        />
                    </div>
                </div>
            </section>

            {/* =================================================
                DESKTOP TWO-COLUMN AREA

                Parent/Guardian
                +
                Previous Education
            ================================================= */}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {/* =================================================
                    PARENT / GUARDIAN
                ================================================= */}

                <DetailsSection
                title={t(
                    "Parent / guardian information",
                    "অভিভাবকের তথ্য",
                )}
                >
                <InfoRow
                    label={t(
                    "Father",
                    "পিতা",
                    )}
                    value={application.father_name}
                />

                <InfoRow
                    label={t(
                    "Mother",
                    "মাতা",
                    )}
                    value={application.mother_name}
                />

                <InfoRow
                    label={t(
                    "Guardian",
                    "অভিভাবক",
                    )}
                    value={application.guardian_name}
                />

                <InfoRow
                    label={t(
                        "Mobile",
                        "মোবাইল",
                    )}
                    value={
                        text(application.guardian_phone) ||
                        text(application.phone)
                    }
                    />

                <InfoRow
                    label={t(
                    "Email",
                    "ইমেইল",
                    )}
                    value={application.email}
                />

                <InfoRow
                    label={t(
                    "Guardian address",
                    "অভিভাবকের ঠিকানা",
                    )}
                    value={application.guardian_address}
                    multiline
                />
                </DetailsSection>

                {/* =================================================
                    PREVIOUS EDUCATION
                ================================================= */}

                <DetailsSection
                title={t(
                    "Previous education",
                    "পূর্ববর্তী শিক্ষার তথ্য",
                )}
                >
                <InfoRow
                    label={t(
                    "Previous institution",
                    "পূর্ববর্তী প্রতিষ্ঠান",
                    )}
                    value={
                    application.previous_institution
                    }
                />

                <InfoRow
                    label={t(
                        "Previous class",
                        "পূর্ববর্তী শ্রেণি",
                    )}
                    value={formatPreviousClass(
                        application.previous_class,
                    )}
                    />
                <InfoRow
                    label={t(
                    "Previous student ID",
                    "পূর্ববর্তী শিক্ষার্থী আইডি",
                    )}
                    value={
                    application.previous_student_no
                    }
                />

                <InfoRow
                    label={t(
                    "Previous date",
                    "পূর্ববর্তী তারিখ",
                    )}
                    value={
                    application.previous_date
                        ? formatDate(
                            application.previous_date,
                        )
                        : null
                    }
                />
                </DetailsSection>
            </div>

            {/* =================================================
                SECOND DESKTOP TWO-COLUMN AREA

                Other Information
                +
                Application Information
            ================================================= */}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {/* =================================================
                    OTHER INFORMATION
                ================================================= */}

                <DetailsSection
                title={t(
                    "Other information",
                    "অন্যান্য তথ্য",
                )}
                >
                <InfoRow
                    label={t(
                    "Special requirement",
                    "বিশেষ প্রয়োজন",
                    )}
                    value={
                    application.special_requirement
                    }
                    multiline
                />

                <InfoRow
                    label={t(
                    "Academic year",
                    "শিক্ষাবর্ষ",
                    )}
                    value={application.academic_year}
                />

                <InfoRow
                    label={t(
                    "Present same as permanent",
                    "বর্তমান ঠিকানা স্থায়ী ঠিকানার মতো",
                    )}
                    value={
                    application.present_same_as_permanent
                    }
                />

                <InfoRow
                    label={t(
                    "Declaration accepted",
                    "ঘোষণা গ্রহণ করা হয়েছে",
                    )}
                    value={
                    application.declaration_accepted
                    }
                />
                </DetailsSection>

                {/* =================================================
                    APPLICATION INFORMATION
                ================================================= */}

                <DetailsSection
                title={t(
                    "Application information",
                    "আবেদনের তথ্য",
                )}
                >
                <InfoRow
                    label="Application ID"
                    value={
                    application.application_id
                    }
                />

                <InfoRow
                    label="Database ID"
                    value={application.id}
                />

                <InfoRow
                    label={t(
                    "Status",
                    "অবস্থা",
                    )}
                    value={application.status}
                />

                <InfoRow
                    label={t(
                    "Submitted",
                    "জমা দেওয়া হয়েছে",
                    )}
                    value={
                    application.created_at
                        ? formatDateTime(
                            application.created_at,
                        )
                        : null
                    }
                />

                <InfoRow
                    label={t(
                    "Last updated",
                    "সর্বশেষ আপডেট",
                    )}
                    value={
                    application.updated_at
                        ? formatDateTime(
                            application.updated_at,
                        )
                        : null
                    }
                />
                </DetailsSection>
            </div>

            {/* =================================================
                ADDITIONAL DATABASE FIELDS

                Important:
                If we add another column to applications later,
                it will still appear here automatically.
            ================================================= */}

            {additionalFields.length > 0 ? (
                <div className="mt-4">
                <DetailsSection
                    title={t(
                    "Additional application data",
                    "অতিরিক্ত আবেদনের তথ্য",
                    )}
                >
                    <div className="grid gap-x-5 lg:grid-cols-2">
                    {additionalFields.map(
                        ([key, value]) => (
                        <InfoRow
                            key={key}
                            label={formatFieldName(
                            key,
                            )}
                            value={formatDynamicValue(
                            key,
                            value,
                            )}
                            multiline={
                            typeof value ===
                                "string" &&
                            value.length > 80
                            }
                        />
                        ),
                    )}
                    </div>
                </DetailsSection>
                </div>
            ) : null}

            {/* =================================================
                STORAGE PATH

                Keep this available for technical/admin
                verification, but compact.
            ================================================= */}

            {application.photo_url ? (
                <div className="mt-4">
                <DetailsSection
                    title={t(
                    "Uploaded photo",
                    "আপলোড করা ছবি",
                    )}
                >
                    <InfoRow
                    label={t(
                        "Storage path",
                        "স্টোরেজ পাথ",
                    )}
                    value={application.photo_url}
                    multiline
                    />
                </DetailsSection>
                </div>
            ) : null}

            {/* Extra bottom space so content isn't hidden
                behind the fixed action bar on mobile. */}
            <div className="h-2" />
            </div>

            {/* ===================================================
                ACTION BAR
            =================================================== */}

            <div className="shrink-0 border-t bg-white p-3 sm:p-4">
            {currentStatus === "pending" ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* REJECT */}

                <button
                    type="button"
                    onClick={onReject}
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:gap-2 sm:px-4"
                >
                    {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                    ) : (
                    <XCircle className="size-4" />
                    )}

                    {t(
                    "Reject",
                    "বাতিল করুন",
                    )}
                </button>

                {/* APPROVE */}

                <button
                    type="button"
                    onClick={onApprove}
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:gap-2 sm:px-4"
                >
                    {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                    ) : (
                    <CheckCircle2 className="size-4" />
                    )}

                    {t(
                    "Approve",
                    "অনুমোদন করুন",
                    )}
                </button>
                </div>
            ) : (
                <div className="rounded-xl bg-muted px-4 py-3 text-center text-sm font-semibold">
                {currentStatus === "approved"
                    ? t(
                        "This application is already approved.",
                        "এই আবেদনটি ইতিমধ্যে অনুমোদিত।",
                    )
                    : t(
                        "This application is rejected.",
                        "এই আবেদনটি বাতিল করা হয়েছে।",
                    )}
                </div>
            )}
            </div>
        </aside>
        </div>
    );
    }

    /* =========================================================
    INFO ROW

    Desktop:
    label | value

    Mobile:
    still label | value

    This prevents the:
    "শিক্ষার্থীর নাম"
    "আল মাহামুদ আলম"

    two-line wasteful layout.
    ========================================================= */

    function InfoRow({
    label,
    value,
    multiline = false,
    }: {
    label: string;
    value: unknown;
    multiline?: boolean;
    }) {
    return (
        <div
        className={[
            "grid grid-cols-[115px_minmax(0,1fr)] items-start gap-2 border-b border-black/5 py-2.5 last:border-b-0",
            "sm:grid-cols-[145px_minmax(0,1fr)] sm:gap-3",
        ].join(" ")}
        >
        <div className="min-w-0 text-xs font-semibold leading-5 text-muted-foreground sm:text-sm">
            {label}:
        </div>

        <div
            className={[
            "min-w-0 break-words text-sm font-medium leading-5 text-foreground",
            multiline
                ? "whitespace-pre-wrap"
                : "",
            ].join(" ")}
        >
            {formatValue(value)}
        </div>
        </div>
    );
    }
    function formatPreviousClass(
        value: unknown,
        ): string {
        const raw = String(value ?? "").trim();

        const classMap: Record<string, string> = {
            "1": "প্রথম শ্রেণি",
            "01": "প্রথম শ্রেণি",
            "2": "দ্বিতীয় শ্রেণি",
            "02": "দ্বিতীয় শ্রেণি",
            "3": "তৃতীয় শ্রেণি",
            "03": "তৃতীয় শ্রেণি",
            "4": "চতুর্থ শ্রেণি",
            "04": "চতুর্থ শ্রেণি",
            "5": "পঞ্চম শ্রেণি",
            "05": "পঞ্চম শ্রেণি",
            "6": "ষষ্ঠ শ্রেণি",
            "06": "ষষ্ঠ শ্রেণি",
            "7": "সপ্তম শ্রেণি",
            "07": "সপ্তম শ্রেণি",
            "8": "অষ্টম শ্রেণি",
            "08": "অষ্টম শ্রেণি",
            "9": "নবম শ্রেণি",
            "09": "নবম শ্রেণি",
            "10": "দশম শ্রেণি",
        };

        return classMap[raw] ?? (raw || "—");
        }
    function formatApplyingClass(
        value: unknown,
        ): string {
        const raw = String(value ?? "").trim();

        if (!raw) return "—";

        const classMap: Record<string, string> = {
            "Class I": "প্রথম শ্রেণি",
            "Class II": "দ্বিতীয় শ্রেণি",
            "Class III": "তৃতীয় শ্রেণি",
            "Class IV": "চতুর্থ শ্রেণি",
            "Class V": "পঞ্চম শ্রেণি",
            "Class VI": "ষষ্ঠ শ্রেণি",
            "Class VII": "সপ্তম শ্রেণি",
            "Class VIII": "অষ্টম শ্রেণি",
            "Class IX": "নবম শ্রেণি",
            "Class X": "দশম শ্রেণি",
        };

        const scienceMatch = raw.match(
            /^Class\s+(IX|X)\s*\(Science\)$/i,
        );

        if (scienceMatch) {
            const base = classMap[
            `Class ${scienceMatch[1].toUpperCase()}`
            ];

            return `${base} (বিজ্ঞান)`;
        }

        const artsMatch = raw.match(
            /^Class\s+(VI|VII|VIII|IX|X)\s*\(Arts\)$/i,
        );

        if (artsMatch) {
            const base = classMap[
            `Class ${artsMatch[1].toUpperCase()}`
            ];

            return `${base} (মানবিক)`;
        }

        const commerceMatch = raw.match(
            /^Class\s+(VI|VII|VIII|IX|X)\s*\((Commerce|Business)\)$/i,
        );

        if (commerceMatch) {
            const base = classMap[
            `Class ${commerceMatch[1].toUpperCase()}`
            ];

            return `${base} (ব্যবসায় শিক্ষা)`;
        }

        return classMap[raw] ?? raw;
        }

        function formatApplicationType(
        value: unknown,
        ): string {
        const raw = String(value ?? "").trim();

        if (!raw) return "—";

        const map: Record<string, string> = {
            new: "নতুন",
            old: "পুরাতন",
            transfer: "স্থানান্তর",
        };

        return map[raw.toLowerCase()] ?? raw;
        }

        function formatGender(
        value: unknown,
        ): string {
        const raw = String(value ?? "").trim();

        if (!raw) return "—";

        const map: Record<string, string> = {
            male: "পুরুষ",
            female: "মহিলা",
            other: "অন্যান্য",
        };

        return map[raw.toLowerCase()] ?? raw;
        }
    /* =========================================================
    DETAILS SECTION
    ========================================================= */

    function DetailsSection({
    title,
    children,
    }: {
    title: string;
    children: React.ReactNode;
    }) {
    return (
        <section className="rounded-2xl border border-primary/10 bg-white p-4 sm:p-5">
        <h4 className="mb-3 text-sm font-bold text-primary sm:text-base">
            {title}
        </h4>

        <div>{children}</div>
        </section>
    );
    }

    /* =========================================================
    DYNAMIC FIELD NAME
    ========================================================= */

    function formatFieldName(key: string): string {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
        );
    }

    /* =========================================================
    DYNAMIC VALUE FORMATTER
    ========================================================= */

    function formatDynamicValue(
    key: string,
    value: unknown,
    ): string {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (
        key.includes("date") &&
        typeof value === "string"
    ) {
        return formatDate(value);
    }

    if (
        key.endsWith("_at") &&
        typeof value === "string"
    ) {
        return formatDateTime(value);
    }

    if (typeof value === "object") {
        try {
        return JSON.stringify(
            value,
            null,
            2,
        );
        } catch {
        return String(value);
        }
    }

    return String(value);
    }