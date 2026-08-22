import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/lib/i18n";
import { useStudentAuth } from "@/lib/auth";
import { ActionButton, Field, Section, inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Student Login | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Secure student portal login for Al Eman Islamic Academy — check results, routine, attendance, homework, fees, notices and downloads.",
      },
      { property: "og:title", content: "Secure Student Login — Al Eman Islamic Academy" },
      { property: "og:description", content: "Access results, attendance, homework, fees and downloads." },
    ],
  }),
  component: Login,
});

function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { login } = useStudentAuth();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(studentId, password)) {
      void navigate({ to: "/dashboard" });
      return;
    }
    setError(t("Invalid student ID or password.", "ভুল স্টুডেন্ট আইডি বা পাসওয়ার্ড।"));
  };

  return (
    <Section>
 
      <div className="mx-auto max-w-md text-center">
      
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          <ShieldCheck className="size-4" aria-hidden /> {t("Student Portal", "স্টুডেন্ট পোর্টাল")}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-foreground">{t("Secure Student Login", "নিরাপদ স্টুডেন্ট লগইন")}</h1>
        {/*<p className="mt-3 text-sm text-muted-foreground">
          {t("Check results, routine, attendance, fees and more.", "ফলাফল, রুটিন, উপস্থিতি, বেতনসহ আরও অনেক কিছু দেখুন।")}{" "}
        </p>*/}
            <p className="mt-3  text-lg font-semibold text-red-600 dark:text-red-400">
            {t(
              "This feature is currently unavailable. Please check back later.",
              "এই ফিচারটি বর্তমানে উপলব্ধ নয়। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
            )}
          </p>
      </div>
      <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-sm surface-card p-7">
        <img src={logo} alt="" width={56} height={56} loading="lazy" className="mx-auto size-12" />
        <div className="mt-6 grid gap-5">
          <Field label={t("Student ID", "স্টুডেন্ট আইডি")}>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              maxLength={30}
              autoComplete="username"
              required
              className={inputClass}
              placeholder="DEMO2026"
            />
          </Field>
          <Field label={t("Password", "পাসওয়ার্ড")}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={60}
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </Field>
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <ActionButton type="submit" className="w-full py-3">
            <LogIn className="size-4" aria-hidden /> {t("Log In", "লগ ইন")}
          </ActionButton>
          <p className="text-xs text-muted-foreground">
            {t("Forgot your password? Contact the school office.", "পাসওয়ার্ড ভুলে গেছেন? স্কুল অফিসে যোগাযোগ করুন।")}
          </p>
        </div>
      </form>
    </Section>
  );
}
