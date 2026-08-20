import { useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { MarksEntry } from "@/components/admin/MarksEntry";

export const Route = createFileRoute("/teacher")({
  component: TeacherPortal,
});

function TeacherPortal() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  /*
   * ==========================================================
   * CHECK TEACHER SESSION + PORTAL STATUS
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        /*
         * 1. Check authenticated Supabase user
         */

        const {
          data: {
            session,
          },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          await navigate({
            to: "/teacher-login",
          });

          return;
        }

        /*
         * 2. Check whether Admin has opened
         *    the Teacher Mark Entry portal.
         */

        const {
          data,
          error,
        } =
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

        /*
         * 3. Portal closed = immediately deny access.
         */

        if (
          data?.is_open !== true
        ) {
          await supabase.auth.signOut();

          if (!cancelled) {
            toast.error(
              t(
                "Teacher mark entry is currently closed.",
                "শিক্ষকদের নম্বর এন্ট্রি বর্তমানে বন্ধ রয়েছে।",
              ),
            );
          }

          await navigate({
            to: "/teacher-login",
          });

          return;
        }

        /*
         * 4. Everything is okay.
         */

        if (!cancelled) {
          setAllowed(true);
        }
      } catch (error) {
        console.error(
          "Teacher portal access error:",
          error,
        );

        if (!cancelled) {
          toast.error(
            t(
              "Unable to verify teacher access.",
              "শিক্ষক অ্যাক্সেস যাচাই করা যায়নি।",
            ),
          );
        }

        await supabase.auth.signOut();

        await navigate({
          to: "/teacher-login",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate, t]);

  /*
   * ==========================================================
   * ALSO WATCH AUTH SESSION
   *
   * If the teacher logs out elsewhere,
   * immediately leave this page.
   * ==========================================================
   */

  useEffect(() => {
    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (
            event === "SIGNED_OUT" ||
            !session
          ) {
            void navigate({
              to: "/teacher-login",
            });
          }
        },
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  /*
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    toast.success(
      t(
        "Logged out successfully.",
        "সফলভাবে লগআউট হয়েছে।",
      ),
    );

    await navigate({
      to: "/teacher-login",
    });
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t(
              "Checking teacher access...",
              "শিক্ষক অ্যাক্সেস যাচাই করা হচ্ছে...",
            )}
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * ACCESS DENIED
   * ==========================================================
   */

  if (!allowed) {
    return null;
  }

  /*
   * ==========================================================
   * TEACHER PORTAL
   *
   * ONLY THE EXISTING MARKS ENTRY COMPONENT
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* Minimal teacher header */}

        <header className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-primary">
              {t(
                "Teacher Mark Entry",
                "শিক্ষক নম্বর এন্ট্রি",
              )}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {t(
                "Al Eman Islamic Academy",
                "আল ঈমান ইসলামিক একাডেমি",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-destructive/30 hover:text-destructive"
          >
            <LogOut className="size-4" />

            {t(
              "Logout",
              "লগআউট",
            )}
          </button>
        </header>

        {/* ==================================================
            EXISTING MARK ENTRY
            ================================================== */}

        <MarksEntry mode="teacher" />
      </div>
    </main>
  );
}