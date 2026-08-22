import { useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import {
  ActionButton,
  Field,
  PageHero,
  Section,
  inputClass,
} from "@/components/ui-kit";

export const Route = createFileRoute(
  "/teacher-login",
)({
  head: () => ({
    meta: [
      {
        title:
          "Teacher Login | Al Eman Islamic Academy",
      },
      {
        name: "description",
        content:
          "Secure teacher login for mark entry.",
      },
    ],
  }),

  component: TeacherLogin,
});

function TeacherLogin() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [portalOpen, setPortalOpen] =
    useState<boolean | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * CHECK TEACHER PORTAL STATUS
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    const checkPortalStatus =
      async () => {
        const { data, error } =
          await supabase
            .from(
              "teacher_portal_settings",
            )
            .select("is_open")
            .eq("id", 1)
            .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error(
            "Teacher portal status error:",
            error,
          );

          setPortalOpen(false);
          return;
        }

        setPortalOpen(
          data?.is_open === true,
        );
      };

    void checkPortalStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ==========================================================
   * LOGIN
   * ==========================================================
   */

  const handleLogin = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    /*
     * Do not allow login if Admin has closed
     * the teacher portal.
     */

    const {
      data: portalData,
      error: portalError,
    } = await supabase
      .from(
        "teacher_portal_settings",
      )
      .select("is_open")
      .eq("id", 1)
      .maybeSingle();

    if (portalError) {
      console.error(
        "Portal status check failed:",
        portalError,
      );

      setError(
        t(
          "Unable to check teacher access. Please try again.",
          "শিক্ষক অ্যাক্সেস যাচাই করা যায়নি। আবার চেষ্টা করুন।",
        ),
      );

      return;
    }

    if (
      portalData?.is_open !== true
    ) {
      setPortalOpen(false);

      setError(
        t(
          "Teacher mark entry is currently closed.",
          "শিক্ষকদের নম্বর এন্ট্রি বর্তমানে বন্ধ রয়েছে।",
        ),
      );

      return;
    }

    if (!email.trim()) {
      setError(
        t(
          "Please enter your email.",
          "আপনার ইমেইল লিখুন।",
        ),
      );

      return;
    }

    if (!password) {
      setError(
        t(
          "Please enter your password.",
          "আপনার পাসওয়ার্ড লিখুন।",
        ),
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * ======================================================
       * SUPABASE AUTH
       *
       * The password is NEVER stored in this code.
       * ======================================================
       */

      const {
        data,
        error: authError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          },
        );

      if (authError) {
        throw authError;
      }

      if (!data.session) {
        throw new Error(
          "No authentication session returned.",
        );
      }

      /*
       * Check portal status one more time after
       * authentication to prevent access if Admin
       * closed the portal during login.
       */

      const {
        data: finalPortalData,
        error:
          finalPortalError,
      } = await supabase
        .from(
          "teacher_portal_settings",
        )
        .select("is_open")
        .eq("id", 1)
        .maybeSingle();

      if (finalPortalError) {
        await supabase.auth.signOut();

        throw finalPortalError;
      }

      if (
        finalPortalData?.is_open !== true
      ) {
        await supabase.auth.signOut();

        setPortalOpen(false);

        setError(
          t(
            "Teacher mark entry is currently closed.",
            "শিক্ষকদের নম্বর এন্ট্রি বর্তমানে বন্ধ রয়েছে।",
          ),
        );

        return;
      }

      toast.success(
        t(
          "Login successful.",
          "লগইন সফল হয়েছে।",
        ),
      );

      await navigate({
        to: "/teacher",
      });
    } catch (error) {
      console.error(
        "Teacher authentication error:",
        error,
      );

      setError(
        t(
          "Invalid email or password.",
          "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * CHECKING PORTAL
   * ==========================================================
   */

  if (portalOpen === null) {
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
   * PORTAL CLOSED
   * ==========================================================
   */

  if (!portalOpen) {
    return (
      <>
        <PageHero
          crumb={t(
            "Teacher Login",
            "শিক্ষক লগইন",
          )}
          title={t(
            "Teacher Login",
            "শিক্ষক লগইন",
          )}
          subtitle={t(
            "Teacher access is currently unavailable.",
            "শিক্ষক অ্যাক্সেস বর্তমানে বন্ধ রয়েছে।",
          )}
        />

        <Section>
          <div className="mx-auto max-w-md">
            <div className="surface-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <LockKeyhole className="size-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-foreground">
                {t(
                  "Teacher Login Closed",
                  "শিক্ষক লগইন বন্ধ",
                )}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "The administrator has temporarily closed teacher access.",
                  "প্রশাসক সাময়িকভাবে শিক্ষক অ্যাক্সেস বন্ধ রেখেছেন।",
                )}
              </p>
            </div>
          </div>
        </Section>
      </>
    );
  }

  /*
   * ==========================================================
   * LOGIN FORM
   * ==========================================================
   */

  return (
    <>
      <PageHero
        crumb={t(
          "Teacher Login",
          "শিক্ষক লগইন",
        )}
        title={t(
          "Teacher Login",
          "শিক্ষক লগইন",
        )}
        subtitle={t(
          "Log in with your teacher account to access the portal.",
          "আপনার শিক্ষক অ্যাকাউন্ট দিয়ে লগইন করে পোর্টালে প্রবেশ করুন।",
        )}
      />

      <Section>
        <div className="mx-auto max-w-md">
          <form
            onSubmit={handleLogin}
            className="surface-card p-7 sm:p-8"
          >
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="size-7" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-primary">
                {t(
                  "Teacher Portal",
                  "শিক্ষক পোর্টাল",
                )}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Secure access for authorized teachers",
                  "শিক্ষকদের জন্য সুরক্ষিত লগইন ব্যবস্থা",
                )}
              </p>
            </div>

            <div className="space-y-5">
              <Field
                label={t(
                  "Email",
                  "ইমেইল",
                )}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                  placeholder="teacher@example.com"
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </Field>

              <Field
                label={t(
                  "Password",
                  "পাসওয়ার্ড",
                )}
              >
                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    className={`${inputClass} pr-11`}
                    placeholder={t(
                      "Enter password",
                      "পাসওয়ার্ড লিখুন",
                    )}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
            </div>

            {error ? (
              <p
                className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <ActionButton
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5"
            >
              <LogIn className="size-4" />

              {loading
                ? t(
                    "Signing in...",
                    "লগইন হচ্ছে...",
                  )
                : t(
                    "Teacher Login",
                    "শিক্ষক লগইন",
                  )}
            </ActionButton>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {t(
                "Use the teacher account provided by the administrator.",
                "প্রশাসকের দেওয়া শিক্ষক অ্যাকাউন্ট ব্যবহার করুন।",
              )}
            </p>
          </form>
        </div>
      </Section>
    </>
  );
}