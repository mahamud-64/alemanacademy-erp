import { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

export function TeacherPortalControl() {
  const { t } = useLang();

  const [isOpen, setIsOpen] =
    useState<boolean | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const loadStatus = async () => {
    setChecking(true);

    const { data, error } =
      await supabase
        .from(
          "teacher_portal_settings",
        )
        .select("is_open")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
      console.error(
        "Teacher portal status error:",
        error,
      );

      toast.error(
        t(
          "Unable to load teacher portal status.",
          "শিক্ষক পোর্টালের অবস্থা লোড করা যায়নি।",
        ),
      );

      setIsOpen(null);
      setChecking(false);
      return;
    }

    setIsOpen(
      data?.is_open === true,
    );

    setChecking(false);
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const togglePortal = async () => {
    if (isOpen === null || loading) {
      return;
    }

    const nextStatus = !isOpen;

    setLoading(true);

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
      console.error(
        "Teacher portal update error:",
        error,
      );

      toast.error(
        t(
          "Unable to change teacher portal status.",
          "শিক্ষক পোর্টালের অবস্থা পরিবর্তন করা যায়নি।",
        ),
      );

      setLoading(false);
      return;
    }

    setIsOpen(nextStatus);

    toast.success(
      nextStatus
        ? t(
            "Teacher mark entry is now open.",
            "শিক্ষকদের নম্বর এন্ট্রি এখন চালু হয়েছে।",
          )
        : t(
            "Teacher mark entry is now closed.",
            "শিক্ষকদের নম্বর এন্ট্রি এখন বন্ধ হয়েছে।",
          ),
    );

    setLoading(false);
  };

  if (checking) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          {t(
            "Loading teacher portal status...",
            "শিক্ষক পোর্টালের অবস্থা লোড হচ্ছে...",
          )}
        </p>
      </div>
    );
  }

  if (isOpen === null) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm font-semibold text-destructive">
          {t(
            "Teacher portal status unavailable.",
            "শিক্ষক পোর্টালের অবস্থা পাওয়া যাচ্ছে না।",
          )}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t(
              "Teacher Mark Entry",
              "শিক্ষক নম্বর এন্ট্রি",
            )}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "Control whether teachers can access the mark entry portal.",
              "শিক্ষকরা নম্বর এন্ট্রি পোর্টালে প্রবেশ করতে পারবেন কি না তা নিয়ন্ত্রণ করুন।",
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={
              isOpen
                ? "rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600"
                : "rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive"
            }
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
          </span>

          <button
            type="button"
            onClick={
              togglePortal
            }
            disabled={loading}
            className={
              isOpen
                ? "inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
                : "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {isOpen ? (
              <Lock className="size-4" />
            ) : (
              <Unlock className="size-4" />
            )}

            {loading
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
      </div>
    </section>
  );
}