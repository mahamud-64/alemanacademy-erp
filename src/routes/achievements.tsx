import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { achievements } from "@/data/site";
import { Badge, PageHero, Section } from "@/components/ui-kit";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "SSC results, Qirat and Hifz championships, science fair awards and institutional honours earned by Al Eman Islamic Academy students.",
      },
      { property: "og:title", content: "Achievements — Al Eman Islamic Academy" },
      { property: "og:description", content: "Academic, Qur'anic and co-curricular honours won by our students." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const { t, tb } = useLang();
  return (
    <>
      <PageHero
        crumb={t("Achievements", "অর্জন")}
        title={t("Our Achievements", "আমাদের অর্জন")}
        subtitle={t(
          "Recognition earned by our students in academics, Qur'anic study and co-curricular competition.",
          "শিক্ষা, কুরআন চর্চা ও সহশিক্ষা প্রতিযোগিতায় শিক্ষার্থীদের অর্জিত স্বীকৃতি।",
        )}
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-5">
          {achievements.map((a) => (
            <article key={a.title.en} className="surface-card flex gap-5 p-6">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-foreground">
                <Trophy className="size-6" aria-hidden />
              </span>
              <div>
                <Badge tone="primary">{a.year}</Badge>
                <h2 className="mt-2 text-xl font-bold text-primary leading-tight">{tb(a.title)}</h2>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{tb(a.detail)}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
