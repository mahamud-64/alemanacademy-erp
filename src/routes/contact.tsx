import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, Facebook, Youtube, MessageCircle } from "lucide-react";
import { z } from "zod";
import { useLang } from "@/lib/i18n";
import { school } from "@/data/site";
import { useSettings } from "@/lib/content";
import { ActionButton, Field, PageHero, Section, SectionTitle, inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Contact Al Eman Islamic Academy, Hathazari, Chattogram — phone, email, office hours, location map and online enquiry form.",
      },
      { property: "og:title", content: "Contact — Al Eman Islamic Academy" },
      { property: "og:description", content: "Phone, email, office hours, map and enquiry form." },
    ],
  }),
  component: Contact,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  subject: z.string().trim().min(2, "Please enter a subject").max(150),
  message: z.string().trim().min(5, "Please write your message").max(1000),
});

function Contact() {
  const { t, tb } = useLang();
  const { value: settings } = useSettings();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSent(true);
    // Backend hook: POST parsed.data to /api/contact when the server is connected.
    e.currentTarget.reset();
  };

  const details = [
    { icon: MapPin, label: { en: "Address", bn: "ঠিকানা" }, value: tb(school.fullAddress) },
    { icon: Phone, label: { en: "Phone", bn: "ফোন" }, value: settings.phone },
    { icon: Mail, label: { en: "Email", bn: "ইমেইল" }, value: settings.email },
    { icon: MessageCircle, label: { en: "WhatsApp", bn: "হোয়াটসঅ্যাপ" }, value: "+8801319802313" },
    { icon: Clock, label: { en: "Office hours", bn: "অফিস সময়" }, value: tb(school.hours) },
  ];

  return (
    <>
      <PageHero
        crumb={t("Contact", "যোগাযোগ")}
        title={t("Contact Us", "যোগাযোগ করুন")}
        subtitle={t(
          "Visit our campus or send us a message — we reply within one working day.",
          "আমাদের ক্যাম্পাসে আসুন অথবা বার্তা পাঠান — এক কর্মদিবসের মধ্যে উত্তর দেওয়া হয়।",
        )}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle align="left" eyebrow={t("Reach us", "যোগাযোগের তথ্য")} title={t("Our office", "আমাদের অফিস")} />
            <ul className="mt-6 space-y-4">
              {details.map((d) => (
                <li key={d.label.en} className="surface-card flex gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <d.icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold-foreground">{tb(d.label)}</p>
                    <p className="mt-0.5 text-sm text-foreground">{d.value}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2">
              <a href={school.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-primary-foreground">
                <Facebook className="size-4" aria-hidden />
              </a>
              <a href={school.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-primary-foreground">
                <Youtube className="size-4" aria-hidden />
              </a>
              <a href={school.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <div className="surface-card p-7">
            <h2 className="text-xl font-bold text-primary">{t("Send a message", "বার্তা পাঠান")}</h2>
            {sent ? (
              <div className="mt-5 rounded-lg bg-success/10 p-4 text-sm text-success" role="status">
                {t("Thank you — your message has been received.", "ধন্যবাদ — আপনার বার্তা গৃহীত হয়েছে।")}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
              <Field label={t("Your Name", "আপনার নাম")} hint={errors["name"]}>
                <input name="name" maxLength={100} required className={inputClass} />
              </Field>
              <Field label={t("Email Address", "ইমেইল ঠিকানা")} hint={errors["email"]}>
                <input name="email" type="email" maxLength={255} required className={inputClass} />
              </Field>
              <Field label={t("Subject", "বিষয়")} hint={errors["subject"]}>
                <input name="subject" maxLength={150} required className={inputClass} />
              </Field>
              <Field label={t("Message", "বার্তা")} hint={errors["message"]}>
                <textarea name="message" rows={5} maxLength={1000} required className={inputClass} />
              </Field>
              <ActionButton type="submit" className="py-3">
                {t("Send Message", "বার্তা পাঠান")}
              </ActionButton>
            </form>
          </div>
        </div>
      </Section>

      <Section muted>
        <SectionTitle eyebrow={t("Location", "লোকেশন")} title={t("Find us on the map", "মানচিত্রে আমাদের খুঁজুন")} />
        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <iframe
            src={school.mapEmbed}
            title={t("Academy location map", "একাডেমির অবস্থান মানচিত্র")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full"
          />
        </div>
      </Section>
    </>
  );
}
