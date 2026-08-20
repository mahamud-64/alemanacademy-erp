import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, HeartHandshake } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { school, teachers } from "@/data/site";
import { PageHero, Section, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "History, mission, vision and faculty of Al Eman Islamic Academy — an Islamic and modern education institution in Chattogram since 2008.",
      },
      { property: "og:title", content: "About Al Eman Islamic Academy" },
      { property: "og:description", content: "Our history, mission, vision, leadership and teaching faculty." },
    ],
  }),
  component: About,
});

function About() {
  const { t, tb } = useLang();

  const pillars = [
    {
      icon: Eye,
      title: { en: "Our Vision", bn: "আমাদের লক্ষ্য" },
      body: {
        en: "To build an ideal educational institution based on the Qur'an and Sunnah, nurturing students with modern knowledge, Islamic values, and exemplary character to serve society and the Ummah.",
        bn: "কুরআন ও সুন্নাহর আলোকে এমন একটি আদর্শ শিক্ষা প্রতিষ্ঠান গড়ে তোলা, যেখানে শিক্ষার্থীরা আধুনিক জ্ঞান, ইসলামী মূল্যবোধ ও উত্তম চরিত্রে সমৃদ্ধ হয়ে দেশ, জাতি ও উম্মাহর কল্যাণে আত্মনিয়োগ করবে।",
      },
    },
    {
      icon: Target,
      title: { en: "Our Mission", bn: "আমাদের উদ্দেশ্য" },
      body: {
        en: "To provide quality Hifz, Noorani, Ibtedayi, and general education in an integrated curriculum that develops students intellectually, morally, and spiritually in the light of the Qur'an and Sunnah.",
        bn: "আন্তর্জাতিক মানের হিফজ, নূরানী, ইবতেদায়ী ও সাধারণ শিক্ষার সমন্বয়ে শিক্ষার্থীদের কুরআন-সুন্নাহর আদর্শে গড়ে তোলা এবং তাদের নৈতিক, বুদ্ধিবৃত্তিক ও সামাজিক বিকাশ নিশ্চিত করা।",
      },
    },
    {
      icon: HeartHandshake,
      title: { en: "Our Values", bn: "আমাদের মূল্যবোধ" },
      body: {
        en: "We cultivate Taqwa (God-consciousness), honesty, discipline, respect, responsibility, patriotism, and compassion, inspiring students to uphold Islamic values throughout their lives..",
        bn: "আল্লাহভীতি, সততা, শৃঙ্খলা, আদব-আখলাক, দায়িত্ববোধ, দেশপ্রেম ও মানবসেবার চেতনায় শিক্ষার্থীদের গড়ে তোলা এবং আজীবন ইসলামী মূল্যবোধ অনুসরণে উদ্বুদ্ধ করা।",
      },
    },
  ];

  const milestones = [
    { year: "2017", text: { en: "Founded with 50 students in a rented building at Hathazari.", bn: "হাঠাজারিতে ভাড়া ভবনে ৫০ জন শিক্ষার্থী নিয়ে যাত্রা শুরু।" } },
    { year: "2012", text: { en: "Recognised by the Board of Intermediate & Secondary Education, Chattogram.", bn: "মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রাম কর্তৃক স্বীকৃতি লাভ।" } },
    { year: "2016", text: { en: "New four-storey academic building and science laboratories opened.", bn: "নতুন চারতলা একাডেমিক ভবন ও বিজ্ঞানাগার উদ্বোধন।" } },
    { year: "2025", text: { en: "🏆 Three Students Ranked in Bangladesh Top 20, 20 A+ and 100% pass rate.", bn: "🏆 সারা বাংলাদেশে সেরা ২০-এ আমাদের ৩ শিক্ষার্থী, ২০ জন শিক্ষার্থী এ+ সহ শতভাগ  শিক্ষার্থী উত্তীর্ণ হয় " } },
    { year: "2026", text: { en: "Digital result system introduced.", bn: "ডিজিটাল ফলাফল ব্যবস্থা চালু।" } },
  ];

  return (
    <>
      <PageHero
        crumb={t("About", "পরিচিতি")}
        title={t("About Our Academy", "আমাদের একাডেমি পরিচিতি")}
        subtitle={t(
          "Serving Chattogram since 2017 with an education that honours both revelation and reason.",
          "২০১৭ সাল থেকে  ও যুক্তির সমন্বয়ে চট্টগ্রামে শিক্ষা সেবা প্রদান করে আসছি।",
        )}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title.en} className="surface-card p-7">
              <p.icon className="size-7 text-gold" aria-hidden />
              <h2 className="mt-4 text-lg font-bold text-primary">{tb(p.title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tb(p.body)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section muted>
        <SectionTitle
          eyebrow={t("Advisor's Message", "উপদেষ্টার বাণী")}
          title={t("A word from our Advisor", "উপদেষ্টার পক্ষ থেকে")}
        />

        <blockquote className="mx-auto mt-8 max-w-3xl surface-card p-8 text-center">
          <p className="text-base md:text-lg leading-8 text-muted-foreground">
            {t(
              "“Education is not only about academic excellence but also about building strong moral character and Islamic values. At Al Eman Islamic Academy, we strive to nurture students who are knowledgeable, disciplined, compassionate, and prepared to contribute positively to society. I encourage every parent to work together with us in shaping the future generation.”",
              "“শিক্ষা শুধু একাডেমিক উৎকর্ষ অর্জনের বিষয় নয়; এটি উত্তম চরিত্র, নৈতিকতা এবং ইসলামী মূল্যবোধ গড়ে তোলারও একটি প্রক্রিয়া। আল ইমান ইসলামিক একাডেমিতে আমরা এমন শিক্ষার্থী গড়ে তুলতে প্রতিশ্রুতিবদ্ধ, যারা জ্ঞানী, শৃঙ্খলাবদ্ধ, মানবিক এবং সমাজের জন্য কল্যাণকর ভূমিকা রাখতে সক্ষম হবে। ভবিষ্যৎ প্রজন্ম গঠনে আমরা সকল অভিভাবকের আন্তরিক সহযোগিতা কামনা করি।”",
            )}
          </p>

          <footer className="mt-6 text-lg font-bold text-primary">
            {t("Maulana Ismail Khan", "মাওলানা ইসমাঈল খান সাহেব")}
            <br />
            <span className="block text-xs font-normal text-muted-foreground whitespace-pre-line">
  {t(
    "Chief Advisor, Al Eman Islamic Academy\nSenior Teacher, Mekhal Hamiyus Sunnah Madrasah",
    "প্রধান উপদেষ্টা, আল ঈমান ইসলামিক একাডেমি\nসিনিয়র শিক্ষক, মেখল হামিউস সুন্নাহ মাদ্রাসা"
  )}
</span>
          </footer>
        </blockquote>
      </Section>

      <Section muted>
        <SectionTitle
          eyebrow={t("Principal's Message", "অধ্যক্ষের বাণী")}
          title={t("A word from our Principal", "অধ্যক্ষের পক্ষ থেকে")}
        />
        <blockquote className="mx-auto mt-8 max-w-3xl surface-card p-8 text-center">
          <p className="text-base md:text-lg leading-8 text-muted-foreground">
            {t(
              "\u201cQuality education is the backbone of a nation. Islam places particular emphasis on the pursuit of knowledge. Once, the Muslim community set remarkable examples in education, learning, and scientific advancement before the world. However, with the passage of time, that position has weakened considerably. The key to overcoming this situation is proper education, moral values, and awareness. With this vision, Al Iman Islamic Academy was established. Our aim is to nurture a generation that is creative, morally upright, principled, and patriotic by combining religious and secular education. With the responsible participation of parents and the sincere efforts of our teachers, we are committed to building a modern, quality, and ideal educational institution.\u201d",
              "\u201cসু-শিক্ষা জাতির মেরুদণ্ড। বিশেষ করে ইসলাম ধর্মে জ্ঞান অর্জনের ওপর বিশেষ গুরুত্ব দেওয়া হয়েছে। মুসলিম জাতি একসময় শিক্ষা, দীক্ষা, জ্ঞান-বিজ্ঞানে বিশ্ব দরবারে অনন্য দৃষ্টান্ত স্থাপন করেছিল। কিন্তু সময়ের পরিবর্তনে আজ সেই অবস্থান অনেকটাই দুর্বল হয়েছে। এ অবস্থা থেকে উত্তরণের প্রধান পথ হলো সঠিক শিক্ষা, নৈতিকতা ও সচেতনতা। এই লক্ষ্যেই আল ইমান ইসলামিক একাডেমি প্রতিষ্ঠিত হয়েছে। আমাদের উদ্দেশ্য হলো ধর্মীয় ও জাগতিক শিক্ষার সমন্বয়ে সৃজনশীল, নৈতিক, আদর্শবান ও দেশপ্রেমিক প্রজন্ম গড়ে তোলা। অভিভাবকদের দায়িত্বশীল অংশগ্রহণ ও শিক্ষকদের আন্তরিক প্রচেষ্টায় আমরা একটি যুগোপযোগী, মানসম্মত ও আদর্শ শিক্ষা-প্রতিষ্ঠান গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।।\u201d",
            )}
          </p>
          <footer className="mt-6 text-lg font-bold text-primary">
            {t("Mohammad Fokhruddin Babar", "মোহাম্মদ ফখরুদ্দিন বাবর")}<br />
            <span className="block text-xs font-normal text-muted-foreground">{t("Principal", "অধ্যক্ষ")}</span>
          </footer>
        </blockquote>
      </Section>

      <Section>
        <SectionTitle eyebrow={t("History", "ইতিহাস")} title={t("Our journey", "আমাদের পথচলা")} />
        <ol className="mx-auto mt-10 max-w-3xl border-l-2 border-primary/20 pl-6">
          {milestones.map((m) => (
            <li key={m.year} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[31px] top-1 size-4 rounded-full border-2 border-card bg-gold" />
              <p className="text-base font-bold text-primary">{m.year}</p>
              <p className="text-base font-semibold text-black-foreground">{tb(m.text)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section muted>
        <SectionTitle
          eyebrow={t("Faculty", "শিক্ষকমণ্ডলী")}
          title={t("Our teachers", "আমাদের শিক্ষকবৃন্দ")}
          subtitle={t(
            "full-time teachers and haffeeez serve our students.",
            "পূর্ণকালীন শিক্ষক এবং হাফেজ শিক্ষার্থীদের সেবায় নিয়োজিত।",
          )}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.name.en} className="surface-card flex items-start gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-base font-bold text-primary">
                {teacher.name.en.split(" ").slice(-1)[0]?.[0]}
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">{tb(teacher.name)}</h3>
                <p className="text-sm font-semibold text-gold-foreground">{tb(teacher.role)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tb(teacher.detail)}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle
          eyebrow={t("Parents", "অভিভাবক")}
          title={t("Parent information", "অভিভাবক তথ্য")}
        />
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            { q: { en: "School hours", bn: "স্কুল সময়" }, a: school.hours },
            {
              q: { en: "Attendance policy", bn: "উপস্থিতি নীতি" },
              a: { en: "A minimum of 80% attendance is required to sit for term examinations.", bn: "সাময়িক পরীক্ষায় অংশগ্রহণের জন্য ন্যূনতম ৮০% উপস্থিতি আবশ্যক।" },
            },
            {
              q: { en: "Fee payment", bn: "বেতন পরিশোধ" },
              a: { en: "Monthly tuition is payable by the 10th of each month at the office or via mobile banking.", bn: "প্রতি মাসের ১০ তারিখের মধ্যে অফিসে অথবা মোবাইল ব্যাংকিং-এ বেতন পরিশোধযোগ্য।" },
            },
            {
              q: { en: "Guardian contact", bn: "অভিভাবক যোগাযোগ" },
              a: { en: "Class teachers are available for guardians every working day, 9:00–12:00 PM.", bn: "প্রতি কর্মদিবস সকাল ৯টা–১২টা শ্রেণিশিক্ষকগণ অভিভাবকদের জন্য উপস্থিত থাকেন।" },
            },
          ].map((item) => (
            <div key={item.q.en} className="surface-card p-5">
              <h3 className="text-base font-bold text-primary">{tb(item.q)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tb(item.a)}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
