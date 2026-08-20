export type ClassOption = {
  value: string; // ALWAYS the Bangla value stored in Supabase
  en: string;    // Displayed when website language = English
  bn: string;    // Displayed when website language = Bangla
};

export const CLASS_OPTIONS: ClassOption[] = [
  {
    value: "প্লে",
    en: "Play",
    bn: "প্লে",
  },
  {
    value: "নার্সারি",
    en: "Nursery",
    bn: "নার্সারি",
  },
  {
    value: "প্রথম শ্রেণি",
    en: "Class I",
    bn: "প্রথম শ্রেণি",
  },
  {
    value: "দ্বিতীয় শ্রেণি",
    en: "Class II",
    bn: "দ্বিতীয় শ্রেণি",
  },
  {
    value: "তৃতীয় শ্রেণি",
    en: "Class III",
    bn: "তৃতীয় শ্রেণি",
  },
  {
    value: "চতুর্থ শ্রেণি",
    en: "Class IV",
    bn: "চতুর্থ শ্রেণি",
  },
  {
    value: "পঞ্চম শ্রেণি",
    en: "Class V",
    bn: "পঞ্চম শ্রেণি",
  },
  {
    value: "ষষ্ঠ শ্রেণি",
    en: "Class VI",
    bn: "ষষ্ঠ শ্রেণি",
  },
  {
    value: "সপ্তম শ্রেণি",
    en: "Class VII",
    bn: "সপ্তম শ্রেণি",
  },
  {
    value: "অষ্টম শ্রেণি",
    en: "Class VIII",
    bn: "অষ্টম শ্রেণি",
  },
  {
    value: "নবম শ্রেণি",
    en: "Class IX",
    bn: "নবম শ্রেণি",
  },
  {
    value: "দশম শ্রেণি",
    en: "Class X",
    bn: "দশম শ্রেণি",
  },
];

export function getClassLabel(
  value: string,
  lang: "en" | "bn",
): string {
  const option = CLASS_OPTIONS.find(
    (item) => item.value === value,
  );

  if (!option) return value;

  return lang === "bn" ? option.bn : option.en;
}