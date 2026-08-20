import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Code2,
  Database,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Palette,
  Phone,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/developer")({
  component: DeveloperPage,
});

function DeveloperPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f6] text-foreground">
      {/* =========================================================
          TOP BAR
          Standalone developer page — no institute header
          ========================================================= */}
      <div className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Code2 className="size-5 text-primary" />

            <span className="text-sm font-bold text-primary">
              Developer Profile
            </span>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            <ArrowLeft className="size-3.5" />
            Back to Website
          </a>
        </div>
      </div>

      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="px-5 pb-12 pt-12 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            About the Developer
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            The person behind the website, digital experience and
            academic management system.
          </p>
        </div>
      </section>

      {/* =========================================================
          PROFILE CARD
          ========================================================= */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">

            {/* Green profile header */}
            <div className="h-24 bg-primary-deep sm:h-28" />

            <div className="-mt-14 px-6 pb-8 text-center sm:px-10">
              {/* Developer avatar */}
              <div className="mx-auto flex size-28 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-primary shadow-md sm:size-32">
                <Code2 className="size-12 sm:size-14" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary sm:text-3xl">
                Al Mahamud Alam
              </h2>

              <p className="mt-1 text-sm font-semibold text-gold">
                Trainee Web Developer &amp; System Designer
              </p>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-5 text-muted-foreground">
                Passionate about building modern, reliable and
                user-friendly digital systems with a focus on
                practical solutions and clean user experiences.
              </p>
            
                
              {/* Social links */}
              <div className="mx-auto mt-6 w-fit space-y-3 text-xs text-foreground">
                {/* Phone */}
                <a
                  href="tel:+8801316977822"
                  className="flex items-center gap-2.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                  <span>+8801316977822</span>
                </a>

                <a
                  href="mailto:almahamudalam@gmail.com"
                  className="flex items-center gap-2.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                  <span>almahamudalam@gmail.com</span>
                </a>
                 <div className="mt-6 flex items-start justify-center gap-5">
                    {/* LinkedIn */}
                    <a
                        href="https://www.linkedin.com/in/almahamudalam"
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col items-center gap-1.5 text-primary"
                    >
                        <span className="inline-flex size-10 items-center justify-center rounded-full border border-border transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <Linkedin className="size-4" aria-hidden />
                        </span>

                        <span className="text-[12.75px] font-[450]">
                        LinkedIn
                        </span>
                    </a>

                    {/* GitHub */}
                    <a
                        href="https://github.com/mahamud-64"
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col items-center gap-1.5 text-primary"
                    >
                        <span className="inline-flex size-10 items-center justify-center rounded-full border border-border transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <Github className="size-4" aria-hidden />
                        </span>

                        <span className="text-[12.75px] font-[450]">
                        GitHub
                        </span>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:almahamudalam@gmail.com"
                        className="group flex flex-col items-center gap-1.5 text-primary"
                    >
                        <span className="inline-flex size-10 items-center justify-center rounded-full border border-border transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <Mail className="size-4" aria-hidden />
                        </span>

                        <span className="text-[12.75px] font-[450]">
                        Email
                        </span>
                    </a>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT
          ========================================================= */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Code2 className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-primary">
                  About the Developer
                </h2>

                <p className="text-xs text-muted-foreground">
                  Building technology with purpose
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                I'm a Computer Science student passionate about building modern, 
                usable and maintainable web applications.
              </p>

              <p>
                This project combines a public-facing educational
                website with an academic management system,
                including student management, examinations,
                results, merit lists, teacher mark entry and
                administrative controls.
              </p>

              <p>
                The goal is to make everyday academic operations
                simpler while providing students, teachers and
                administrators with a clear digital experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* // =========================================================
         // WHAT I BUILT
         // ========================================================= */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              Development
            </p>

            <h2 className="mt-2 text-2xl font-bold text-primary">
              PROJECT HIGHLIGHTS
            </h2>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={<Code2 className="size-5" />}
              title="School Website"
              description="A responsive public website designed for students, guardians and visitors."
            />

            <FeatureCard
              icon={<GraduationCap className="size-5" />}
              title="Student Management"
              description="Student records, enrollment, promotion and academic information management."
            />

            <FeatureCard
              icon={<ServerCog className="size-5" />}
              title="Academic ERP"
              description="Administrative tools for classes, teachers, examinations, marks and results."
            />

            <FeatureCard
              icon={<Database className="size-5" />}
              title="Result Management"
              description="Marks entry, publication control, merit calculation and result presentation."
            />

            <FeatureCard
              icon={<Palette className="size-5" />}
              title="UI/UX Design"
              description="Clean, responsive interfaces designed for desktop and mobile users."
            />

            <FeatureCard
              icon={<ShieldCheck className="size-5" />}
              title="Access Control"
              description="Separate administrative and teacher workflows with controlled access."
            />
          </div>
        </div>
      </section>
      

       {/* // =========================================================
         // SKILLS
         // ========================================================= */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary-deep p-7 text-primary-foreground sm:p-9">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              Core Areas
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Development Focus
            </h2>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {[
              "Web Development",
              "React",
              "TypeScript",
              "UI/UX",
              "Responsive Design",
              "Database Systems",
              "ERP Development",
              "System Design",
            ].map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/90"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
            
      {/* =========================================================
          CONTACT / LINKEDIN
          ========================================================= */}
      <section className="px-5 pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl font-bold text-primary">
            Connect With Me
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Interested in web development, UI/UX or custom
            academic management systems?
          </p>

          <a
            href="https://www.linkedin.com/in/almahamudalam"
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-deep"
          >
            <Linkedin className="size-4" />
            Visit LinkedIn
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>

      {/* =========================================================
          STANDALONE FOOTER
          No institute footer
          ========================================================= */}
      <div className="border-t border-border bg-white px-5 py-5 text-center">
        <p className="text-xs text-foreground">
          Designed &amp; Developed by{" "}
          <span className="font-semibold text-primary">
            Al Mahamud
          </span>
        </p>

        <p className="mt-1 text-[11px] text-foreground/85">
          Web Development • UI/UX • System Design
        </p>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-primary">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}