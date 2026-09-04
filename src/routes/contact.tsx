import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, Facebook, Youtube, MessageCircle } from "lucide-react";
import { z } from "zod";
import emailjs from "@emailjs/browser";
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
  const { lang, t, tb } = useLang();
  const { value: settings } = useSettings();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    const parsed = contactSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );

    if (!parsed.success) {
      const next: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }

      setErrors(next);
      return;
    }

    setErrors({});
    setSent(false);
    setSending(true);

    try {
      await emailjs.send(
        "service_r1kn7go",
        "template_iooyo98",
        {
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
        },
        "MT21jqSAF5CgYh90D",
      );
      await emailjs.send(
        "service_r1kn7go",
        "template_uu41f17",
        {
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
        },
        "MT21jqSAF5CgYh90D",
      );

      setSent(true);
      form.reset();
    }catch (error) {
      console.error(
        "Contact form error:",
        error,
      );

      setErrors({
        form: t(
          "Unable to send your message. Please try again.",
          "বার্তাটি পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        ),
      });
    } finally {
      setSending(false);
    }
  };


  const details = [
    {
      icon: MapPin,
      label: { en: "Address", bn: "ঠিকানা" },
      value: tb(school.fullAddress),
      href: "https://www.google.com/maps/search/?api=1&query=22.50474158324156,91.81068057141144",
      external: true,
    },
    {
      icon: Phone,
      label: { en: "Phone", bn: "ফোন" },
      value: settings.phone,
      href: `tel:${settings.phone}`,
    },
    {
      icon: Mail,
      label: { en: "Email", bn: "ইমেইল" },
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: MessageCircle,
      image: "/icon/whatsapp.png",
      label: { en: "WhatsApp", bn: "হোয়াটসঅ্যাপ" },
      value: "+8801827676737",
      href: "https://wa.me/8801827676737",
      external: true,
    },
    {
      icon: Clock,
      label: { en: "Office hours", bn: "অফিস সময়" },
      value: tb(school.hours),
    },
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
        <div className="grid min-w-0 w-full gap-10 lg:grid-cols-2">
          <div className="min-w-0 w-full">
            <SectionTitle align="left" eyebrow={t("Reach us", "যোগাযোগের তথ্য")} title={t("Our office", "আমাদের অফিস")} />
            <ul className="mt-6 space-y-4">
             {details.map((item) => {
                const content = (
                  <>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="size-7 object-contain"
                        />
                      ) : (
                        <item.icon className="size-5 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-sm font-semibold">
                        {lang === "bn" ? item.label.bn : item.label.en}
                      </p>

                      <p className="min-w-0 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                        {item.value}
                      </p>
                    </div>
                  </>
                );

                return item.href ? (
                  <a
                    key={item.label.en}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="flex w-full min-w-0 items-start gap-4 overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={item.label.en}
                    className="flex w-full min-w-0 items-start gap-4 overflow-hidden rounded-2xl border bg-card p-5"
                  >
                    {content}
                  </div>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center gap-4">
              {/* Facebook */}
              <a
                href={school.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] ring-1 ring-black/5 outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <img
                  src="/icon/facebook.png"
                  alt="Facebook"
                  className="size-9 object-contain"
                />
              </a>
              {/* WhatsApp */}
              <a
                href={school.social.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] ring-1 ring-black/5 outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <img
                  src="/icon/whatsapp.png"
                  alt="WhatsApp"
                  className="size-9 object-contain"
                />
              </a>
              {/* YouTube — kept as it is */}
              <a
                href={school.social.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex size-14 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_4px_14px_rgba(0,0,0,0.10)] ring-1 ring-black/5 outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Youtube className="size-10" aria-hidden />
              </a>
            </div>
          </div>

          <div className="surface-card min-w-0 w-full p-7">
            <h2 className="text-xl font-bold text-primary">{t("Send a message", "বার্তা পাঠান")}</h2>
            {sent ? (
              <div className="mt-5 rounded-lg bg-success/10 p-4 text-sm text-success" role="status">
                {t("Thank you — your message has been received.", "ধন্যবাদ — আপনার বার্তা গৃহীত হয়েছে।")}
              </div>
            ) : null}
            {errors["form"] ? (
              <div className="mt-5 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {errors["form"]}
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
              <ActionButton
                type="submit"
                disabled={sending}
                className="py-3"
              >
                {sending
                  ? t(
                      "Sending...",
                      "পাঠানো হচ্ছে...",
                    )
                  : t(
                      "Send Message",
                      "বার্তা পাঠান",
                    )}
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
