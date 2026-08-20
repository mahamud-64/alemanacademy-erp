import { useState } from "react";
import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/auth";
import { ActionButton, Field, inputClass } from "@/components/ui-kit";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getModule } from "@/lib/admin/registry";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin ERP | Al Eman Islamic Academy" },
      {
        name: "description",
        content: "School ERP dashboard to manage students, teachers, classes, exams, fees, notices and site settings.",
      },
      { property: "og:title", content: "Admin ERP — Al Eman Islamic Academy" },
      { property: "og:description", content: "Manage the whole school from one dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function useCrumb() {
  const { tb, t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = pathname.replace(/^\/admin\/?/, "");
  if (!slug) return { title: t("Dashboard Overview", "ড্যাশবোর্ড সারসংক্ষেপ"), crumb: t("Overview", "সারসংক্ষেপ") };
  if (slug === "settings") return { title: t("Website Settings", "ওয়েবসাইট সেটিংস"), crumb: t("Settings", "সেটিংস") };
  if (slug === "reports") return { title: t("Reports", "রিপোর্ট"), crumb: t("Reports", "রিপোর্ট") };
  const mod = getModule(slug);
  const label = mod ? tb(mod.title) : slug;
  return { title: label, crumb: label };
}

function AdminLayout() {
  const { t, lang, setLang } = useLang();
  const { authed, ready, login, logout } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const { title, crumb } = useCrumb();

  if (!ready) return null;

/**
 * Variant C — Slate Teal (muted card-on-card, left-aligned title)
 * Matches the reference: soft blue-grey backdrop, darker slate card,
 * pill fields, dark pill button, decorative circle behind the card.
 * Logic, state, t() strings, Field/ActionButton/inputClass usage:
 * all identical to the original — only classNames/layout changed.
 */

if (!authed) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-5">
      {/* decorative backdrop circle -- purely visual, matches the reference */}
      
      <span className="pointer-events-none absolute -left-24 -top-24 h-100 w-100 rounded-full border-[20px] border-[#7f97a0]" />
      
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          setError("");
          setLoggingIn(true);

          const success = await login(email, password);

          if (!success) {
            setError(
              t("Invalid email or password.", "Invalid email or password")
            );
          }

          setLoggingIn(false);
        }}
        className="relative z-10 w-full max-w-[300px] rounded-[28px] bg-[#5a7078] p-7 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]
                   sm:max-w-sm sm:p-8"
      >
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          {t("Admin Panel", "Admin Panel")}
        </h1>

        <p className="mt-1.5 text-[13px] text-[#c7d3d6] sm:text-sm">
          {t("Sign in to continue.", "Sign in to continue.")}
        </p>

        <div className="mt-6 space-y-3.5 sm:mt-7 sm:space-y-4">
          <Field label={t("Email", "Email")}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-[#4c6069] px-5 py-2.5 text-sm text-white
                         outline-none placeholder:text-[#a9b8bc] transition-colors
                         focus:border-white/30 focus:bg-[#42535b] sm:py-3 sm:text-[15px]"
              autoComplete="username"
              placeholder={t("Enter your Email", "Enter your Email")}
              required
            />
          </Field>

          <Field label={t("Password", "Password")}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-[#4c6069] px-5 py-2.5 text-sm text-white
                         outline-none placeholder:text-[#a9b8bc] transition-colors
                         focus:border-white/30 focus:bg-[#42535b] sm:py-3 sm:text-[15px]"
              autoComplete="current-password"
              placeholder={t("Enter your Password","Enter your Password")}
              required
            />
          </Field>

          {error ? (
            <p className="rounded-full bg-[#3a2426] px-4 py-2 text-center text-xs font-medium text-[#ff9d90] sm:text-sm">
              {error}
            </p>
          ) : null}

          <ActionButton
            type="submit"
            className="w-full rounded-full bg-[#1c2b30] py-2.5 text-sm font-semibold text-white
                       transition-colors hover:bg-[#141f23] sm:py-3 sm:text-[15px]"
            disabled={loggingIn}
          >
            {loggingIn
              ? t("Loging in...", "Loging in...")
              : t("Log in", "Log in")}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
  return (
    <SidebarProvider>
      <div className="flex min-h-[80vh] w-full bg-muted/40">
        <AdminSidebar onLogout={logout} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-3 py-3 backdrop-blur sm:px-6">
            <SidebarTrigger className="shrink-0" />

            <div className="min-w-0">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
                  <Home className="size-3" aria-hidden />
                  {t("Site", "সাইট")}
                </Link>

                <span>/</span>

                <Link to="/admin" className="hover:text-primary">
                  {t("Admin", "এডমিন")}
                </Link>

                <span>/</span>

                <span className="truncate text-foreground">{crumb}</span>
              </nav>

              <h1 className="truncate text-base font-bold text-primary sm:text-lg">
                {title}
              </h1>
            </div>

            {/* Language Switch */}
            <div className="ml-auto flex rounded-xl border border-primary/15 bg-white p-1 shadow-sm" role="group"aria-label="Language">
              <button
                onClick={() => setLang("en")}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                  lang === "en"
                    ? "bg-primary text-white shadow-sm"
                    : "text-primary hover:bg-primary/10"
                )}
              >
                EN
              </button>

              <button
                onClick={() => setLang("bn")}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold font-bn transition-all duration-200",
                  lang === "bn"
                    ? "bg-primary text-white shadow-sm"
                    : "text-primary hover:bg-primary/10"
                )}
              >
                বাং
              </button>
            </div>
          </header>
          <div className="min-w-0 flex-1 p-3 sm:p-6">
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}
