/**
 * Official subject mapping for the Result/Marks module.
 *
 * IMPORTANT:
 * - Database class values are ALWAYS stored in Bangla.
 * - These keys must match student_enrollments.class exactly.
 * - Subject names are stored exactly as defined by the school.
 * - Do not mix Hifz subjects with regular class subjects.
 */

export const RESULT_SUBJECTS = {
  "প্লে": [
    "আরবি",
    "বাংলা",
    "গণিত",
    "ইংরেজি",
    "হাদিস শরীফ",
    "কালিমা ও মাসায়িল",
  ],

  "নার্সারি": [
    "আরবি",
    "বাংলা",
    "গণিত",
    "ইংরেজি",
    "হাদিস শরীফ",
    "কালিমা ও মাসায়িল",
  ],

  "প্রথম শ্রেণি": [
    "আরবি লিখা",
    "কুরআন ও তাজবীদ",
    "আদঃ সালাত ও আদঃ মাসনূনাহ",
    "হাদীস শরীফ",
    "কালিমা মাসায়িল ও সাধারণ জ্ঞান",
    "বাংলা",
    "গণিত",
    "ইংরেজি",
  ],

  "দ্বিতীয় শ্রেণি": [
    "আরবি লিখা",
    "বাংলা",
    "গণিত",
    "ইংরেজি",
    "পরিবেশ পরিচিতি ও সাধারণ জ্ঞান",
    "আদঃ সালাত ও আদঃ মাসনূনাহ",
    "হাদিস শরীফ ও আসমাঊল হুসনা",
    "কুরআন মাজীদ ও তাজবীদ",
  ],

  "তৃতীয় শ্রেণি": [
    "আরবি লিখা",
    "গণিত",
    "বাংলা",
    "ইংরেজি",
    "সমাজ বিজ্ঞান ও সাধারণ জ্ঞান",
    "কুরআন মাজীদ ও তাজবীদ",
    "হাদিস শরীফ ও আসমাঊল হুসনা",
    "আদঃ সালাত ও আদঃ মাসনূনাহ",
    "কালিমা মাসায়িল",
  ],

  "চতুর্থ শ্রেণি": [
    "আরবি ১ম",
    "আকাইদ ও ফিকহ",
    "কুরআন ও তাজবিদ",
    "এসো আ. শিখি ও বে. জেওর",
    "সমাজ",
    "বাংলা",
    "ইংরেজি",
    "গণিত",
    "বিজ্ঞান",
  ],

  "পঞ্চম শ্রেণি": [
    "আরবি",
    "আকাইদ ও ফিকহ",
    "কুরআন ও তাজবিদ",
    "এসো আ. শিখি ও বে. জেওর",
    "সমাজ",
    "বাংলা",
    "ইংরেজি",
    "গণিত",
    "বিজ্ঞান",
  ],

  "ষষ্ঠ শ্রেণি": [
    "আরবি ১ম",
    "নাহুমীর",
    "এসো আরবি শিখি",
    "মুফিদুত তালেবীন",
    "আকাইদ ফিকাহ",
    "কুরআন মাজিদ",
    "বাংলা ১ম",
    "বাংলা ২য় পত্র",
    "ইংরেজি ১ম",
    "ইংরেজি ২য় পত্র",
    "গণিত",
    "সমাজ",
    "বিজ্ঞান",
    "আইসিটি",
    "ফিকহুল মুয়াস্সার ও পাঞ্জেগাঞ্জ",
  ],
} as const;


/**
 * Hifz is a separate program/section.
 * Do NOT merge these subjects into regular class subjects.
 */
export const HIFZ_SUBJECTS = [
  "কালিমা ও মাসায়িল",
  "কুরআন মাজীদ, তাজবিদ ও মাখরাজ",
  "আদিয়ায়ে সালাত ও আদিয়ায়ে মাসনূনাহ",
  "বাংলা",
  "গণিত",
  "ইংরেজি",
] as const;


/**
 * Supported regular classes.
 *
 * These are the actual Bangla values stored in Supabase.
 */
export type ResultClass = keyof typeof RESULT_SUBJECTS;


/**
 * Get subjects using the Bangla database class value.
 *
 * Example:
 *
 * getResultSubjects("চতুর্থ শ্রেণি")
 *
 * → [
 *      "আরবি ১ম",
 *      "আকাইদ ও ফিকহ",
 *      ...
 *    ]
 */
export function getResultSubjects(
  className: string,
): readonly string[] {
  return RESULT_SUBJECTS[
    className as ResultClass
  ] ?? [];
}


/**
 * Get Hifz subjects.
 */
export function getHifzSubjects(): readonly string[] {
  return HIFZ_SUBJECTS;
}