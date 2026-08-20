import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { academicSections } from "@/data/site";
import { Badge, PageHero, Section, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Curriculum from Play Group to Class X: NCTB national curriculum combined with Qur'an, Hifz, Arabic and Islamic studies, plus grading and assessment policy.",
      },
      { property: "og:title", content: "Academics — Al Eman Islamic Academy" },
      { property: "og:description", content: "Sections, subjects, assessment and grading at Al Eman Islamic Academy." },
    ],
  }),
  component: Academics,
});

const grading = [
  { range: "80–100", gp: "5.00", grade: "A+" },
  { range: "70–79", gp: "4.00", grade: "A" },
  { range: "60–69", gp: "3.50", grade: "A-" },
  { range: "50–59", gp: "3.00", grade: "B" },
  { range: "40–49", gp: "2.00", grade: "C" },
  { range: "33–39", gp: "1.00", grade: "D" },
  { range: "0–32", gp: "0.00", grade: "F" },
];

function Academics() {
  const { t, tb } = useLang();

  return (
    <>
      <PageHero
        crumb={t("Academics", "শিক্ষাক্রম")}
        title={t("Academic Programme", "শিক্ষা কার্যক্রম")}
        subtitle={t(
          "National curriculum excellence combined with a strong Qur'anic and Arabic foundation.",
          "জাতীয় শিক্ষাক্রমের উৎকর্ষের সাথে শক্তিশালী কুরআনি ও আরবি ভিত্তি।",
        )}
      />

      <Section>
        <div className="space-y-6">
          {academicSections.map((s) => (
            <article key={s.id} className="surface-card grid gap-5 p-7 md:grid-cols-3">
              <div>
                <h2 className="text-lg font-bold text-primary">{tb(s.name)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tb(s.detail)}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold">{t("Subjects", "বিষয়সমূহ")}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.subjects.map((sub) => (
                    <Badge key={sub.en} tone="muted">
                      {tb(sub)}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section muted>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle align="left" eyebrow={t("Assessment", "মূল্যায়ন")} title={t("How we assess", "মূল্যায়ন পদ্ধতি")} />
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[

                { en: "First Term Examination in May, Second Term Examination in August and Annual Examination in December.", bn: "মে মাসে প্রথম সাময়িক পরীক্ষা, আগস্টে দ্বিতীয় সাময়িক পরীক্ষা এবং ডিসেম্বরে বার্ষিক পরীক্ষা।" },
                { en: "Continuous assessment of Qur'an tilawat, Hifz and adab.", bn: "কুরআন তিলাওয়াত, হিফজ ও আদবের ধারাবাহিক মূল্যায়ন।" },
          //    { en: "Practical assessment for Science and ICT from Class VI.", bn: "ষষ্ঠ শ্রেণি থেকে বিজ্ঞান ও আইসিটির ব্যবহারিক মূল্যায়ন।" },
                { en: "Results are published online and in printable marksheet format.", bn: "ফলাফল অনলাইনে ও মুদ্রণযোগ্য মার্কশিট আকারে প্রকাশিত হয়।" },
              ].map((item) => (
                <li key={item.en} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {tb(item)}
                </li>
              ))}
            </ul>
            <Link to="/results" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
              {t("Check published results →", "প্রকাশিত ফলাফল দেখুন →")}
            </Link>
          </div>

          <div>
            <SectionTitle align="left" eyebrow={t("Grading", "গ্রেডিং")} title={t("Grading scale", "গ্রেডিং স্কেল")} />
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Marks", "নম্বর")}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Grade", "গ্রেড")}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">{t("Grade Point", "গ্রেড পয়েন্ট")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {grading.map((g) => (
                    <tr key={g.grade}>
                      <td className="px-4 py-2.5">{g.range}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary">{g.grade}</td>
                      <td className="px-4 py-2.5">{g.gp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
