import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/content";
import { Field, inputClass } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const tabs = [
  { id: "school", en: "School Information", bn: "স্কুল তথ্য" },
  { id: "contact", en: "Contact & Map", bn: "যোগাযোগ ও ম্যাপ" },
  { id: "homepage", en: "Homepage & Announcement", bn: "হোমপেজ ও ঘোষণা" },
  { id: "seo", en: "SEO & Social", bn: "এসইও ও সোশ্যাল" },
] as const;

type ExtraSettings = {
  facebook: string;
  youtube: string;
  mapUrl: string;
  footerNote: string;
  metaTitle: string;
  metaDescription: string;
};

const extraDefaults: ExtraSettings = {
  facebook: "https://facebook.com/alemanacademy",
  youtube: "https://youtube.com/@alemanacademy",
  mapUrl: "https://maps.google.com/?q=Chattogram",
  footerNote: "© Al Eman Islamic Academy — All rights reserved.",
  metaTitle: "Al Eman Islamic Academy | Chattogram",
  metaDescription: "Committed to Integrating Islamic and Modern Education.",
};

function SettingsPage() {
  const { t } = useLang();
  const { value: settings, update: setSettings, reset } = useSettings();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("school");
  const [extra, setExtra] = useState<ExtraSettings>(extraDefaults);

  return (
    <div className="space-y-5">
      <nav className="flex flex-wrap gap-2">
        {tabs.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            {t(s.en, s.bn)}
          </button>
        ))}
      </nav>

      <div className="surface-card grid gap-5 p-6 sm:grid-cols-2">
        {tab === "school" ? (
          <>
            <Field label={t("School name (EN)", "স্কুলের নাম (ইংরেজি)")}>
              <input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className={inputClass} maxLength={120} />
            </Field>
            <Field label={t("School name (BN)", "স্কুলের নাম (বাংলা)")}>
              <input value={settings.nameBn} onChange={(e) => setSettings({ ...settings, nameBn: e.target.value })} className={inputClass} maxLength={120} />
            </Field>
            <Field label={t("Tagline (EN)", "ট্যাগলাইন (ইংরেজি)")}>
              <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputClass} maxLength={200} />
            </Field>
            <Field label={t("Tagline (BN)", "ট্যাগলাইন (বাংলা)")}>
              <input value={settings.taglineBn} onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })} className={inputClass} maxLength={200} />
            </Field>
          </>
        ) : null}

        {tab === "contact" ? (
          <>
            <Field label={t("Phone", "ফোন")}>
              <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} maxLength={30} />
            </Field>
            <Field label={t("Email", "ইমেইল")}>
              <input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} maxLength={120} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("Address", "ঠিকানা")}>
                <input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} maxLength={200} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("Google Map link", "গুগল ম্যাপ লিংক")}>
                <input value={extra.mapUrl} onChange={(e) => setExtra({ ...extra, mapUrl: e.target.value })} className={inputClass} maxLength={300} />
              </Field>
            </div>
            <Field label={t("Facebook", "ফেসবুক")}>
              <input value={extra.facebook} onChange={(e) => setExtra({ ...extra, facebook: e.target.value })} className={inputClass} maxLength={200} />
            </Field>
            <Field label={t("YouTube", "ইউটিউব")}>
              <input value={extra.youtube} onChange={(e) => setExtra({ ...extra, youtube: e.target.value })} className={inputClass} maxLength={200} />
            </Field>
          </>
        ) : null}

        {tab === "homepage" ? (
          <>
            <div className="sm:col-span-2">
              <Field label={t("Announcement bar (EN)", "ঘোষণা বার (ইংরেজি)")}>
                <input value={settings.marquee} onChange={(e) => setSettings({ ...settings, marquee: e.target.value })} className={inputClass} maxLength={240} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("Announcement bar (BN)", "ঘোষণা বার (বাংলা)")}>
                <input value={settings.marqueeBn} onChange={(e) => setSettings({ ...settings, marqueeBn: e.target.value })} className={inputClass} maxLength={240} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("Footer note", "ফুটার নোট")}>
                <input value={extra.footerNote} onChange={(e) => setExtra({ ...extra, footerNote: e.target.value })} className={inputClass} maxLength={200} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.admissionOpen}
                onChange={(e) => setSettings({ ...settings, admissionOpen: e.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="font-semibold text-foreground">{t("Admission open banner", "ভর্তি চলছে ব্যানার")}</span>
            </label>
          </>
        ) : null}

        {tab === "seo" ? (
          <>
            <div className="sm:col-span-2">
              <Field label={t("Meta title", "মেটা টাইটেল")}>
                <input value={extra.metaTitle} onChange={(e) => setExtra({ ...extra, metaTitle: e.target.value })} className={inputClass} maxLength={70} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("Meta description", "মেটা বিবরণ")}>
                <textarea
                  rows={3}
                  value={extra.metaDescription}
                  onChange={(e) => setExtra({ ...extra, metaDescription: e.target.value })}
                  className={inputClass}
                  maxLength={160}
                />
              </Field>
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button size="sm" onClick={() => toast.success(t("Settings saved.", "সেটিংস সংরক্ষিত হয়েছে।"))}>
            <Save className="size-4" aria-hidden /> {t("Save changes", "সংরক্ষণ")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reset();
              setExtra(extraDefaults);
              toast.success(t("Restored defaults.", "ডিফল্টে ফেরানো হয়েছে।"));
            }}
          >
            <RotateCcw className="size-4" aria-hidden /> {t("Reset to defaults", "ডিফল্টে ফিরুন")}
          </Button>
        </div>
      </div>
    </div>
  );
}
