import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

export default function TeacherAccess() {
  const { t } = useLang();

  const [isOpen, setIsOpen] =
    useState<boolean | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * ==========================================================
   * LOAD CURRENT STATUS
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const { data, error } =
          await supabase
            .from(
              "teacher_portal_settings",
            )
            .select("is_open")
            .eq("id", 1)
            .maybeSingle();

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setIsOpen(
            data?.is_open === true,
          );
        }
      } catch (error) {
        console.error(
          "Teacher portal status error:",
          error,
        );

        if (!cancelled) {
          toast.error(
            t(
              "Unable to load teacher login status.",
              "শিক্ষক লগইন স্ট্যাটাস লোড করা যায়নি।",
            ),
          );

          setIsOpen(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [t]);

  /*
   * ==========================================================
   * CHANGE STATUS
   * ==========================================================
   */

  const toggleAccess = async () => {
    if (
      isOpen === null ||
      saving
    ) {
      return;
    }

    const nextStatus = !isOpen;

    setSaving(true);

    try {
      const { error } =
        await supabase
          .from(
            "teacher_portal_settings",
          )
          .update({
            is_open: nextStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", 1);

      if (error) {
        throw error;
      }

      setIsOpen(nextStatus);

      toast.success(
        nextStatus
          ? t(
              "Teacher login is now open.",
              "শিক্ষক লগইন এখন চালু হয়েছে।",
            )
          : t(
              "Teacher login is now closed.",
              "শিক্ষক লগইন এখন বন্ধ হয়েছে।",
            ),
      );
    } catch (error) {
      console.error(
        "Teacher portal update error:",
        error,
      );

      toast.error(
        t(
          "Unable to change teacher login status.",
          "শিক্ষক লগইন স্ট্যাটাস পরিবর্তন করা যায়নি।",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="surface-card p-8">
        <p className="text-sm text-muted-foreground">
          {t(
            "Loading teacher access...",
            "শিক্ষক অ্যাক্সেস লোড হচ্ছে...",
          )}
        </p>
      </div>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (isOpen === null) {
    return (
      <div className="surface-card border-destructive/20 p-8">
        <p className="text-sm font-semibold text-destructive">
          {t(
            "Teacher login status could not be loaded.",
            "শিক্ষক লগইন স্ট্যাটাস লোড করা যায়নি।",
          )}
        </p>
      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-primary">
          {t(
            "Teacher Login Access",
            "শিক্ষক লগইন অ্যাক্সেস",
          )}
        </h1>

        <p className="mt-1 text-xm text-muted-foreground">
          {t(
            "Control whether teachers can access the mark entry portal.",
            "শিক্ষকরা নম্বর এন্ট্রি পোর্টালে প্রবেশ করতে পারবেন কি না তা নিয়ন্ত্রণ করুন।",
          )}
        </p>
      </div>

      {/* Control Card */}

      <div className="surface-card max-w-3xl p-6 sm:p-8">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Status */}

          <div className="flex items-center gap-4">

            <div
              className={[
                "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                isOpen
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              {isOpen ? (
                <Unlock className="size-7" />
              ) : (
                <Lock className="size-7" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t(
                  "Teacher Login Status",
                  "শিক্ষক লগইন স্ট্যাটাস",
                )}
              </p>

              <p
                className={[
                  "mt-1 text-xl font-bold",
                  isOpen
                    ? "text-emerald-600"
                    : "text-destructive",
                ].join(" ")}
              >
                {isOpen
                  ? t(
                      "OPEN",
                      "চালু",
                    )
                  : t(
                      "CLOSED",
                      "বন্ধ",
                    )}
              </p>
            </div>

          </div>

          {/* Toggle Button */}

          <button
            type="button"
            onClick={toggleAccess}
            disabled={saving}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isOpen
                ? "border border-destructive/30 text-destructive hover:bg-destructive/5"
                : "bg-primary text-primary-foreground hover:bg-primary-deep",
            ].join(" ")}
          >
            {isOpen ? (
              <Lock className="size-4" />
            ) : (
              <Unlock className="size-4" />
            )}

            {saving
              ? t(
                  "Updating...",
                  "পরিবর্তন হচ্ছে...",
                )
              : isOpen
                ? t(
                    "Close Teacher Login",
                    "শিক্ষক লগইন বন্ধ করুন",
                  )
                : t(
                    "Open Teacher Login",
                    "শিক্ষক লগইন চালু করুন",
                  )}
          </button>

        </div>

        {/* Information */}

        <div className="mt-6 rounded-xl bg-primary/5 p-4">

          <div className="flex gap-3">

            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />

            <div>

              <p className="text-sm font-semibold text-primary">
                {isOpen
                  ? t(
                      "Teacher login is currently available.",
                      "শিক্ষক লগইন বর্তমানে চালু আছে।",
                    )
                  : t(
                      "Teacher login is currently unavailable.",
                      "শিক্ষক লগইন বর্তমানে বন্ধ আছে।",
                    )}
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isOpen
                  ? t(
                      "Teachers can sign in using the common teacher account and access the existing Marks Entry section.",
                      "শিক্ষকরা সাধারণ শিক্ষক অ্যাকাউন্ট দিয়ে লগইন করে বিদ্যমান নম্বর এন্ট্রি বিভাগ ব্যবহার করতে পারবেন।",
                    )
                  : t(
                      "Teachers cannot access the teacher portal until you open it again.",
                      "আপনি আবার চালু না করা পর্যন্ত শিক্ষকরা শিক্ষক পোর্টালে প্রবেশ করতে পারবেন না।",
                    )}
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}