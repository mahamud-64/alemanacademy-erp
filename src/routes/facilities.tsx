import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { facilities } from "@/data/site";
import { PageHero, Section } from "@/components/ui-kit";

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Science and computer labs, library, prayer hall, transport, medical corner, CCTV security and playground at Al Eman Islamic Academy, Chattogram.",
      },
      { property: "og:title", content: "Campus Facilities — Al Eman Islamic Academy" },
      { property: "og:description", content: "Labs, library, prayer hall, transport, medical corner and more." },
    ],
  }),
  component: Facilities,
});

function Facilities() {
  const { t, tb } = useLang();
  return (
    <>
      <PageHero
        crumb={t("Facilities", "সুবিধাসমূহ")}
        title={t("Campus Facilities", "ক্যাম্পাস সুবিধাসমূহ")}
        subtitle={t(
          "Everything a student needs for a safe, focused and complete school day.",
          "একজন শিক্ষার্থীর নিরাপদ, মনোযোগী ও পূর্ণাঙ্গ শিক্ষাদিনের জন্য প্রয়োজনীয় সবকিছু।",
        )}
      />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <article key={f.icon} className="surface-card p-6">
              <h2 className="text-base font-bold text-primary">{tb(f.title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tb(f.detail)}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
