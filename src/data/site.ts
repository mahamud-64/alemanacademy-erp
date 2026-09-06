import type { Bi } from "@/lib/i18n";

export const school = {
  name: { en: "Al Eman Islamic Academy", bn: "আল ঈমান ইসলামিক একাডেমি" } satisfies Bi,
  tagline: {
    en: "Committed to Integrating Islamic and Modern Education",
    bn: "ইসলামী ও যুগোপযোগী শিক্ষার সমন্বয় সাধনের প্রত্যয়ে.....",
  } satisfies Bi,
  phone: "+8801840-160715",
  email: "alemanislamicacademy@gmail.com",
  address: {
    en: "Kamal Para, Fotika, Hathazari Municipality, Chattogram, Bangladesh",
    bn: "কামাল পাড়া, ফটিকা, হাটহাজারী পৌরসভা, চট্টগ্রাম। বাংলাদেশ",
  } satisfies Bi,
  fullAddress: {
    en: `Unit–01 >> Kamal Para Jubo Sangha Building (3rd Floor)
Unit–02 >> Chowdhury Manzil, Beside Khansama Mosque, Kamal Para, Fotika, Hathazari Municipality, Chattogram.`,
    bn: `ইউনিট–০১ >> কামাল পাড়া যুব সংঘ ভবন (৩য় তলা)
ইউনিট–০২ >> চৌধুরী মঞ্জিল, খাঁনসামা মসজিদ সংলগ্ন, কামাল পাড়া, ফটিকা, হাটহাজারী পৌরসভা, চট্টগ্রাম।`,
  } satisfies Bi,
  established: 2017,

  hours: { en: "Sat – Thu, 8:00 AM – 4:00 PM", bn: "শনি – বৃহস্পতি, সকাল ৮টা – বিকাল ৪টা" } satisfies Bi,
  social: {
    facebook: "https://facebook.com/allemanbd",
    youtube: "https://www.youtube.com/@alemanbd",
    whatsapp: "https://wa.me/8801827676737",
  },
  mapEmbed:"https://www.google.com/maps?q=22.50474158324156,91.81068057141144&output=embed",
};

export type NavItem = { to: string; label: Bi };

export const primaryNav: NavItem[] = [
  { to: "/", label: { en: "Home", bn: "হোম" } },
  { to: "/about", label: { en: "About", bn: "পরিচিতি" } },
  { to: "/academics", label: { en: "Academics", bn: "শিক্ষাক্রম" } },
  { to: "/notices", label: { en: "Notice", bn: "নোটিশ বোর্ড" } },
  { to: "/resultTemp", label: { en: "Results", bn: "ফলাফল" } },
  { to: "/gallery", label: { en: "Gallery", bn: "গ্যালারি" } },
  { to: "/admission", label: { en: "Admission", bn: "ভর্তি" } },
  { to: "/contact", label: { en: "Contact", bn: "যোগাযোগ" } },
];

export const moreNav: NavItem[] = [
  { to: "/calendar", label: { en: "Academic Calendar", bn: "শিক্ষা পঞ্জি" } },
  { to: "/routine", label: { en: "Class Routine", bn: "ক্লাস রুটিন" } },
  { to: "/achievements", label: { en: "Achievements", bn: "অর্জন" } },
];

/* ---------------------------------- Notices --------------------------------- */

export type NoticeCategory = "general" | "exam" | "admission" | "event" | "holiday";

export type Notice = {
  id: string;
  title: Bi;
  image: string;
  category: NoticeCategory;
  date: string; // ISO
  pinned?: boolean;
  archived?: boolean;
};

export const noticeCategories: { id: NoticeCategory | "all"; label: Bi }[] = [
  { id: "all", label: { en: "All", bn: "সব" } },
  { id: "general", label: { en: "General", bn: "সাধারণ" } },
  { id: "exam", label: { en: "Examination", bn: "পরীক্ষা" } },
  { id: "admission", label: { en: "Admission", bn: "ভর্তি" } },
  { id: "event", label: { en: "Event", bn: "অনুষ্ঠান" } },
  { id: "holiday", label: { en: "Holiday", bn: "ছুটি" } },
];


export const defaultSettings: SiteSettings = {
  name: school.name.en,
  nameBn: school.name.bn,
  tagline: school.tagline.en,
  taglineBn: school.tagline.bn,
  phone: school.phone,
  email: school.email,
  address: school.address.en,
  admissionOpen: true,

  // Keep these for compatibility with the existing settings system
  marquee: "Second Term Exam routine published · Results available online",
  marqueeBn:
    "দ্বিতীয় সাময়িকপরীক্ষার রুটিন প্রকাশিত · অনলাইনে ফলাফল দেখুন",
};
/* --------------------------------- Downloads -------------------------------- */

export type DownloadDoc = {
  id: string;
  title: Bi;
  description: Bi;
  category: Bi;
  size: string;
  updated: string;

  /** Text body rendered into the generated PDF. */
  content?: string[];

  /** Optional image used for image-based documents. */
  image?: string;
};

/* ---------------------------------- Results --------------------------------- */

export type SubjectMark = { subject: Bi; marks: number; grade: string };

export type StudentResult = {
  studentId: string;
  roll: string;
  registration: string;
  name: Bi;
  fatherName: Bi;
  motherName: Bi;
  className: Bi;
  section: string;
  session: string;
  exam: Bi;
  subjects: SubjectMark[];
  gpa: number;
  grade: string;
  position: number;
  outOf: number;
};

export const resultsDb: StudentResult[] = [
  {
    studentId: "DEMO2026",
    roll: "07",
    registration: "REG-2026-0407",
    name: { en: "Muhammad Fayaj Hossain", bn: "মুহাম্মদ ফায়াজ হোসেন" },
    fatherName: { en: "Abdul Karim", bn: "আব্দুল করিম" },
    motherName: { en: "Rahima Begum", bn: "রহিমা বেগম" },
    className: { en: "Class IX", bn: "নবম শ্রেণি" },
    section: "A",
    session: "2026",
    exam: { en: "Half-Yearly Examination 2026", bn: "অর্ধবার্ষিক পরীক্ষা ২০২৬" },
    subjects: [
      { subject: { en: "Bangla", bn: "বাংলা" }, marks: 84, grade: "A+" },
      { subject: { en: "English", bn: "ইংরেজি" }, marks: 79, grade: "A" },
      { subject: { en: "Mathematics", bn: "গণিত" }, marks: 92, grade: "A+" },
      { subject: { en: "Physics", bn: "পদার্থবিজ্ঞান" }, marks: 88, grade: "A+" },
      { subject: { en: "Chemistry", bn: "রসায়ন" }, marks: 81, grade: "A+" },
      { subject: { en: "Biology", bn: "জীববিজ্ঞান" }, marks: 77, grade: "A" },
      { subject: { en: "Islamic Studies", bn: "ইসলাম শিক্ষা" }, marks: 95, grade: "A+" },
      { subject: { en: "ICT", bn: "তথ্য ও যোগাযোগ প্রযুক্তি" }, marks: 90, grade: "A+" },
    ],
    gpa: 4.83,
    grade: "A+",
    position: 2,
    outOf: 48,
  },
  {
    studentId: "AEIA2410",
    roll: "12",
    registration: "REG-2026-0512",
    name: { en: "Ayesha Siddika", bn: "আয়েশা সিদ্দিকা" },
    fatherName: { en: "Mizanur Rahman", bn: "মিজানুর রহমান" },
    motherName: { en: "Nasrin Akter", bn: "নাসরিন আক্তার" },
    className: { en: "Class VIII", bn: "অষ্টম শ্রেণি" },
    section: "B",
    session: "2026",
    exam: { en: "Half-Yearly Examination 2026", bn: "অর্ধবার্ষিক পরীক্ষা ২০২৬" },
    subjects: [
      { subject: { en: "Bangla", bn: "বাংলা" }, marks: 90, grade: "A+" },
      { subject: { en: "English", bn: "ইংরেজি" }, marks: 86, grade: "A+" },
      { subject: { en: "Mathematics", bn: "গণিত" }, marks: 78, grade: "A" },
      { subject: { en: "Science", bn: "বিজ্ঞান" }, marks: 83, grade: "A+" },
      { subject: { en: "Islamic Studies", bn: "ইসলাম শিক্ষা" }, marks: 97, grade: "A+" },
      { subject: { en: "Arabic", bn: "আরবি" }, marks: 93, grade: "A+" },
      { subject: { en: "BGS", bn: "বাংলাদেশ ও বিশ্বপরিচয়" }, marks: 80, grade: "A+" },
    ],
    gpa: 4.86,
    grade: "A+",
    position: 1,
    outOf: 44,
  },
  {
    studentId: "AEIA2287",
    roll: "23",
    registration: "REG-2026-0323",
    name: { en: "Tanvir Ahmed", bn: "তানভীর আহমেদ" },
    fatherName: { en: "Shahjahan Miah", bn: "শাহজাহান মিয়া" },
    motherName: { en: "Salma Khatun", bn: "সালমা খাতুন" },
    className: { en: "Class X", bn: "দশম শ্রেণি" },
    section: "A",
    session: "2026",
    exam: { en: "Half-Yearly Examination 2026", bn: "অর্ধবার্ষিক পরীক্ষা ২০২৬" },
    subjects: [
      { subject: { en: "Bangla", bn: "বাংলা" }, marks: 72, grade: "A" },
      { subject: { en: "English", bn: "ইংরেজি" }, marks: 68, grade: "A-" },
      { subject: { en: "Mathematics", bn: "গণিত" }, marks: 75, grade: "A" },
      { subject: { en: "Physics", bn: "পদার্থবিজ্ঞান" }, marks: 70, grade: "A" },
      { subject: { en: "Chemistry", bn: "রসায়ন" }, marks: 66, grade: "A-" },
      { subject: { en: "Islamic Studies", bn: "ইসলাম শিক্ষা" }, marks: 88, grade: "A+" },
    ],
    gpa: 4.17,
    grade: "A",
    position: 11,
    outOf: 52,
  },
];

/* ------------------------------- Student portal ------------------------------ */

export type PortalStudent = {
  studentId: string;
  password: string;
  name: Bi;
  className: Bi;
  section: string;
  roll: string;
  registration: string;
  guardian: Bi;
  guardianPhone: string;
  bloodGroup: string;
  address: Bi;
  admittedOn: string;
  attendance: { month: Bi; present: number; total: number }[];
  homework: { subject: Bi; task: Bi; due: string; status: "pending" | "submitted" }[];
  fees: { month: Bi; amount: number; status: "paid" | "due"; paidOn?: string }[];
};

export const portalStudents: PortalStudent[] = [
  {
    studentId: "DEMO2026",
    password: "demo123",
    name: { en: "Muhammad Fayaj Hossain", bn: "মুহাম্মদ ফায়াজ হোসেন" },
    className: { en: "Class IX", bn: "নবম শ্রেণি" },
    section: "A",
    roll: "07",
    registration: "REG-2026-0407",
    guardian: { en: "Abdul Karim", bn: "আব্দুল করিম" },
    guardianPhone: "+880 1712-000000",
    bloodGroup: "B+",
    address: { en: "Panchlaish, Chattogram", bn: "পাঁচলাইশ, চট্টগ্রাম" },
    admittedOn: "2019-01-05",
    attendance: [
      { month: { en: "March", bn: "মার্চ" }, present: 22, total: 24 },
      { month: { en: "April", bn: "এপ্রিল" }, present: 18, total: 20 },
      { month: { en: "May", bn: "মে" }, present: 23, total: 25 },
      { month: { en: "June", bn: "জুন" }, present: 21, total: 24 },
      { month: { en: "July", bn: "জুলাই" }, present: 19, total: 21 },
    ],
    homework: [
      {
        subject: { en: "Mathematics", bn: "গণিত" },
        task: { en: "Exercise 7.3 — problems 1 to 12", bn: "অনুশীলনী ৭.৩ — ১ থেকে ১২ নম্বর" },
        due: "2026-08-09",
        status: "pending",
      },
      {
        subject: { en: "English", bn: "ইংরেজি" },
        task: { en: "Write a paragraph on 'Digital Bangladesh'", bn: "'ডিজিটাল বাংলাদেশ' নিয়ে অনুচ্ছেদ লিখো" },
        due: "2026-08-08",
        status: "pending",
      },
      {
        subject: { en: "Islamic Studies", bn: "ইসলাম শিক্ষা" },
        task: { en: "Memorise Surah Al-Mulk verses 1–15", bn: "সূরা আল-মুলক ১–১৫ আয়াত মুখস্থ" },
        due: "2026-08-06",
        status: "submitted",
      },
      {
        subject: { en: "Physics", bn: "পদার্থবিজ্ঞান" },
        task: { en: "Lab report: measuring density", bn: "ল্যাব রিপোর্ট: ঘনত্ব নির্ণয়" },
        due: "2026-08-11",
        status: "pending",
      },
    ],
    fees: [
      { month: { en: "March 2026", bn: "মার্চ ২০২৬" }, amount: 2200, status: "paid", paidOn: "2026-03-06" },
      { month: { en: "April 2026", bn: "এপ্রিল ২০২৬" }, amount: 2200, status: "paid", paidOn: "2026-04-04" },
      { month: { en: "May 2026", bn: "মে ২০২৬" }, amount: 2200, status: "paid", paidOn: "2026-05-05" },
      { month: { en: "June 2026", bn: "জুন ২০২৬" }, amount: 2200, status: "paid", paidOn: "2026-06-07" },
      { month: { en: "July 2026", bn: "জুলাই ২০২৬" }, amount: 2200, status: "due" },
      { month: { en: "Exam fee (Half-Yearly)", bn: "পরীক্ষা ফি (অর্ধবার্ষিক)" }, amount: 600, status: "due" },
    ],
  },
];

/* --------------------------------- Academics -------------------------------- */
export const academicSections = [
  {
    id: "hifz",
    name: {
      en: "International Hifz Department (Boys & Girls)",
      bn: "ইন্টারন্যাশনাল হিফজ বিভাগ (বালক–বালিকা)"
    },
    detail: {
      en: "A complete non-residential Hifz program with Noorani Qaida, Tajweed, daily revision (Muraja'ah), Islamic studies, and regular academic education.",
      bn: "নূরানী কায়দা, তাজবিদ, নিয়মিত মুরাজাআহ, ইসলামী শিক্ষা ও সাধারণ শিক্ষার সমন্বয়ে অনাবাসিক পূর্ণাঙ্গ হিফজ কার্যক্রম।"
    },
    subjects: [
      { en: "Hifz-ul-Quran", bn: "হিফজুল কুরআন" },
      { en: "Tajweed and Makhraj", bn: "তাজবীদ ও মাখরাজ" },
      { en: "Kalimah & Masail", bn: "কালিমা ও মাসায়েল" },
      { en: "Bangla", bn: "বাংলা" },
      { en: "English", bn: "ইংরেজি" },
      { en: "Mathematics", bn: "গণিত" }
    ]
  },

  {
    id: "noorani",
    name: {
      en: "Noorani (Play – Class 3)",
      bn: "নূরানী বিভাগ (প্লে – তৃতীয় শ্রেণি)"
    },
    detail: {
      en: "Early childhood education combining Noorani Qaida, Quran reading, Bangla, English, Mathematics and moral education in a child-friendly environment.",
      bn: "শিশুবান্ধব পরিবেশে নূরানী কায়দা, কুরআন শিক্ষা, বাংলা, ইংরেজি, গণিত ও নৈতিক শিক্ষার সমন্বিত পাঠদান।"
    },
    subjects: [
      { en: "Arabic Writing", bn: "আরবি লেখা" },
      { en: "Kalimah & Masail", bn: "কালিমা ও মাসায়েল" },
      { en: "Quran & Tajweed", bn: "কুরআন ও তাজবিদ" },
      { en: "Hadith Sharif", bn: "হাদিস শরিফ" },
      { en: "Bangla", bn: "বাংলা" },
      { en: "English", bn: "ইংরেজি" },
      { en: "Mathematics", bn: "গণিত" }
    ]
  },

  {
    id: "ebtedayi",
    name: {
      en: "Ebtedayi (Class 4 – Class 5)",
      bn: "ইবতেদায়ী বিভাগ (চতুর্থ – পঞ্চম শ্রেণি)"
    },
    detail: {
      en: "National curriculum integrated with Arabic language, Quran recitation, Islamic education and character development.",
      bn: "জাতীয় শিক্ষাক্রমের পাশাপাশি আরবি ভাষা, কুরআন তিলাওয়াত, ইসলামী শিক্ষা ও নৈতিক চরিত্র গঠনের বিশেষ ব্যবস্থা।"
    },
    subjects: [
      { en: "Arabic", bn: "আরবি" },
      { en: "Quran & Tajweed", bn: "কুরআন ও তাজবিদ" },
      { en: "Aqayed & Fiqh", bn: "আকাইদ ও ফিকহ" },
      { en: "Bangla", bn: "বাংলা" },
      { en: "English", bn: "ইংরেজি" },
      { en: "Mathematics", bn: "গণিত" },
      { en: "Science", bn: "বিজ্ঞান" },
      { en: "BGS", bn: "বাংলাদেশ ও বিশ্বপরিচয়" }
    ]
  },

  {
    id: "women",
    name: {
      en: "Women's (Class 6 – 10)",
      bn: "মহিলা বিভাগ (৬ষ্ঠ – পর্যায়ক্রমে ১০ম শ্রেণি)"
    },
    detail: {
      en: "A dedicated Islamic and academic education program for female students with separate classrooms, qualified teachers and a safe learning environment.",
      bn: "নারী শিক্ষার্থীদের জন্য পৃথক শ্রেণিকক্ষ এবং নিরাপদ পরিবেশে ইসলামী ও সাধারণ শিক্ষার সমন্বিত কার্যক্রম।"
    },
    subjects: [
      { en: "Bangla 1st", bn: "বাংলা ১ম পত্র" },
      { en: "Bangla 2nd", bn: "বাংলা ২য় পত্র" },
      { en: "English 1st", bn: "ইংরেজি ১ম পত্র" },
      { en: "English 2nd", bn: "ইংরেজি ২য় পত্র" },
      { en: "Mathematics", bn: "গণিত" },
      { en: "Science", bn: "বিজ্ঞান" },
      { en: "Arabic", bn: "আরবি" },
      { en: "Quran Majeed", bn: "কুরআন মাজীদ" },
      { en: "Hadith", bn: "হাদিস" },
      { en: "Nahumir", bn: "নাহুমির" },
      { en: "BGS", bn: "বাংলাদেশ ও বিশ্বপরিচয়" },
      { en: "ICT", bn: "তথ্য ও যোগাযোগ প্রযুক্তি" },
      { en: "Mufiduth Tawlebeen", bn: "মুফিদুত তালেবীন" },
      { en: "Aqayed & Fiqh", bn: "আকাইদ ও ফিকহ" }
    ]
  }
];
export const teachers = [
  {
    name: { en: "Mohammed Fakhruddin Babar", bn: "মুহাম্মদ ফখরুদ্দিন বাবর" },
    role: { en: "Founder & Director", bn: "প্রতিষ্ঠাতা পরিচালক" },
    detail: { en: "M.B.A.", bn: "এম.বি.এ." },
  },
  {
    name: { en: "Md. Kurshedul Alam", bn: "মো: খুরশেদুল আলম" },
    role: { en: "Senior Teacher", bn: "সিনিয়র শিক্ষক" },
    detail: { en: "BGS, Mathematics & General Knowledge", bn: "বাংলাদেশ ও বিশ্বপরিচয়, গণিত ও সাধারণ জ্ঞান" },
  },
  {
    name: { en: "Md. Hossain", bn: "মো: হোসাইন" },
    role: { en: "Senior Teacher", bn: "সিনিয়র শিক্ষক" },
    detail: { en: "Bangla, Mathematics & English", bn: "বাংলা, গণিত ও ইংরেজি" },
  },
  {
    name: { en: "Md. Zakerul Islam", bn: "মো: জাকেরুল ইসলাম" },
    role: { en: "Senior Teacher", bn: "সিনিয়র শিক্ষক" },
    detail: { en: "English, Mathematics, Arabic & Bangla", bn: "ইংরেজি, গণিত, আরবি ও বাংলা" },
  },
  {
    name: { en: "Md. Saif", bn: "মো: সাইফ" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "Bangla & English", bn: "বাংলা ও ইংরেজি" },
  },
  {
    name: { en: "Md. Najmul Huaq", bn: "মো: নাজমুল হক" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "Arabic, Bangla & Mathematics", bn: "আরবি, বাংলা ও গণিত" },
  },
  {
    name: { en: "Md. Sirajul Munir", bn: "মো: সিরাজুল মুনির" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "Bangla, English & Mathematics", bn: "বাংলা, ইংরেজি ও গণিত" },
  },
  {
    name: { en: "Md. Maruf Hossain", bn: "মো: মারুফ হোসাইন" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "General Knowledge, BGS & Science", bn: "সাধারণ জ্ঞান, বাংলাদেশ ও বিশ্বপরিচয় ও বিজ্ঞান" },
  },
  {
    name: { en: "Mst. Naima", bn: "মোছা: নাঈমা" },
    role: { en: "Teacher — Girls Department", bn: "শিক্ষিকা — বালিকা বিভাগ" },
    detail: { en: "Arabic, Aqayed Fiqh ", bn: "আরবি, আকাইদ ফিকাহ" },
  },
  {
    name: { en: "Mst. Shanta", bn: "মোছা: শান্তা" },
    role: { en: "Teacher — Girls Department", bn: "শিক্ষিকা — বালিকা বিভাগ" },
    detail: { en: "Science, English & BGS", bn: "বিজ্ঞান, ইংরেজি ও বাংলাদেশ ও বিশ্বপরিচয়" },
  },
  {
    name: { en: "Hafeez Mawlana Osama", bn: "হাফেজ মাওলানা উসামা" },
    role: { en: "Hifz Instructor", bn: "হিফজ শিক্ষক" },
    detail: { en: "Hifz Department", bn: "হিফজ বিভাগ" },
  },
  {
    name: { en: "Hafeez Mawlana Nayeem Uddin", bn: "হাফেজ মাওলানা নাঈম উদ্দিন" },
    role: { en: "Hifz Instructor", bn: "হিফজ শিক্ষক" },
    detail: { en: "Hifz Department", bn: "হিফজ বিভাগ" },
  },
];


export const achievements = [
    {
      year: "2025",
    title: {
        en: "🏆 Three Students Ranked in Bangladesh Top 20",
        bn: "🏆 সারা বাংলাদেশে সেরা ২০-এ আমাদের ৩ শিক্ষার্থী",
      },
      detail: {
        en: "In the 2025 Central Board Examination under the Noorani Ta'limul Quran Board, Chattogram, our academy proudly secured 11th, 16th, and 18th positions in the Bangladesh Merit List. 20 students achieved A+ (GPA-5.00), maintaining a remarkable 100% pass rate.",
        bn: "নূরানী তা'লীমুল কোরআন বোর্ড চট্টগ্রামের অধীনে ২০২৫ সালের কেন্দ্রীয় সনদ পরীক্ষায়, সারা বাংলাদেশে মেধা তালিকায় ১১তম, ১৬তম ও ১৮তম স্থান অর্জন এবং  ২০ জন শিক্ষার্থী এ+ (জিপিএ-৫.০০) সহ শতভাগ  শিক্ষার্থী উত্তীর্ণ হয় ।",
      },
    },
    {
    year: "2025",
    title: {
      en: "100% Success with 20 A+ (GPA-5.00) Achievers",
      bn: "শতভাগ সাফল্যের সাথে ২০ জন এ+ (জিপিএ-৫.০০) অর্জনকারী",
    },
    detail: {
      en: "In the 2025 Central Board Examination under the Noorani Ta'limul Quran Board, Chattogram, all 20 students of the academy achieved A+ (GPA-5.00), maintaining an outstanding 100% success rate.",
      bn: "নূরানী তা'লীমুল কোরআন বোর্ড চট্টগ্রামের অধীনে ২০২৫ সালের কেন্দ্রীয় সনদ পরীক্ষায় একাডেমির ২০ জন কৃতি শিক্ষার্থী এ+ (জিপিএ-৫.০০) অর্জন করে এবং শতভাগ সাফল্যের সাথে উত্তীর্ণ হয়।",
    },
  },
  {
    year: "2024",
    title: {
      en: "🏆 Two Students Ranked in Bangladesh Top 20 Merit List",
      bn: "🏆 সারা বাংলাদেশের টপ ২০ মেধা তালিকায় আমাদের ২ শিক্ষার্থী",
    },
    detail: {
      en: "In the 2024 Central Board Examination under the Noorani Ta'limul Quran Board, Chattogram, Al Eman Islamic Academy proudly secured 14rd and 16rd positions in the Bangladesh Merit List, 10 students achieved A+ (GPA-5.00) and maintaining an outstanding 100% pass rate.",
      bn: "নূরানী তা'লীমুল কোরআন বোর্ড চট্টগ্রামের অধীনে ২০২৪ সালের কেন্দ্রীয় সনদ পরীক্ষায় আল ঈমান ইসলামিক একাডেমি সারা বাংলাদেশের মেধা তালিকায় ১৪তম ও ১৬তম স্থান অর্জন করে গৌরবের স্বাক্ষর রাখে। এছাড়াও, একাডেমির ১০ জন শিক্ষার্থী এ+ (জিপিএ-৫.০০) অর্জন করে এবং শতভাগ সাফল্যের সাথে উত্তীর্ণ হয়।",
    },
  },
  {
    year: "2024",
    title: {
      en: "🌟 100% Success with 10 A+ (GPA-5.00) Achievers",
      bn: "🌟 শতভাগ সাফল্যের সাথে ১০ জন এ+ (জিপিএ-৫.০০) অর্জনকারী",
    },
    detail: {
      en: "In the 2024 Central Board Examination under the Noorani Ta'limul Quran Board, Chattogram, all 10 students achieved A+ (GPA-5.00), maintaining a remarkable 100% success rate.",
      bn: "নূরানী তা'লীমুল কোরআন বোর্ড চট্টগ্রামের অধীনে ২০২৪ সালের কেন্দ্রীয় সনদ পরীক্ষায় একাডেমির ১০ জন শিক্ষার্থী এ+ (জিপিএ-৫.০০) অর্জন করে এবং শতভাগ সাফল্যের সাথে উত্তীর্ণ হয়।",
    },
  },
];

export const facilities = []
 /*
  {
    icon: "flask",
    title: { en: "Science Laboratory", bn: "বিজ্ঞান গবেষণাগার" },
    detail: {
      en: "Fully equipped physics, chemistry and biology labs with trained instructors.",
      bn: "প্রশিক্ষিত ল্যাব সহকারীসহ পূর্ণাঙ্গ পদার্থ, রসায়ন ও জীববিজ্ঞান ল্যাব।",
    },
  },
  {
    icon: "monitor",
    title: { en: "Computer Lab", bn: "কম্পিউটার ল্যাব" },
    detail: {
      en: "40 workstations with broadband internet for ICT and coding classes.",
      bn: "আইসিটি ও কোডিং ক্লাসের জন্য ব্রডব্যান্ডসহ ৪০টি ওয়ার্কস্টেশন।",
    },
  },
  {
    icon: "book",
    title: { en: "Library", bn: "পাঠাগার" },
    detail: {
      en: "Over 6,000 titles in Bangla, English and Arabic with a quiet reading room.",
      bn: "শান্ত পাঠকক্ষসহ বাংলা, ইংরেজি ও আরবি ভাষায় ৬,০০০+ বই।",
    },
  },
  {
    icon: "moon",
    title: { en: "Prayer Hall", bn: "নামাজের কক্ষ" },
    detail: {
      en: "Separate prayer spaces for boys and girls with congregational Zuhr daily.",
      bn: "ছাত্র-ছাত্রীদের জন্য পৃথক নামাজের স্থান, প্রতিদিন জামাতে জোহর।",
    },
  },
  {
    icon: "bus",
    title: { en: "Transport", bn: "পরিবহন" },
    detail: {
      en: "Six bus routes covering Panchlaish, Nasirabad, Chawkbazar and Muradpur.",
      bn: "পাঁচলাইশ, নাসিরাবাদ, চকবাজার ও মুরাদপুর জুড়ে ছয়টি বাস রুট।",
    },
  },
  {
    icon: "heart",
    title: { en: "Medical Corner", bn: "মেডিকেল কর্নার" },
    detail: {
      en: "On-campus first-aid room with a visiting physician twice a week.",
      bn: "সপ্তাহে দুইদিন চিকিৎসকসহ ক্যাম্পাসে প্রাথমিক চিকিৎসা কক্ষ।",
    },
  },
  {
    icon: "shield",
    title: { en: "CCTV Security", bn: "সিসিটিভি নিরাপত্তা" },
    detail: {
      en: "24/7 monitored campus with controlled entry and guardian pick-up passes.",
      bn: "২৪/৭ পর্যবেক্ষণ, নিয়ন্ত্রিত প্রবেশ ও অভিভাবক পিক-আপ পাস।",
    },
  },
  {
    icon: "trophy",
    title: { en: "Playground", bn: "খেলার মাঠ" },
    detail: {
      en: "Cricket, football and badminton facilities with weekly coaching.",
      bn: "সাপ্তাহিক কোচিংসহ ক্রিকেট, ফুটবল ও ব্যাডমিন্টনের ব্যবস্থা।",
    },
  },
];
*/
/* ---------------------------------- Routine --------------------------------- */

export const routinePeriods = [
  { time: "08:00 – 08:40", label: { en: "Period 1", bn: "১ম পিরিয়ড" } },
  { time: "08:45 – 09:25", label: { en: "Period 2", bn: "২য় পিরিয়ড" } },
  { time: "09:30 – 10:10", label: { en: "Period 3", bn: "৩য় পিরিয়ড" } },
  { time: "10:35 – 11:15", label: { en: "Period 4", bn: "৪র্থ পিরিয়ড" } },
  { time: "11:20 – 12:00", label: { en: "Period 5", bn: "৫ম পিরিয়ড" } },
  { time: "12:05 – 12:45", label: { en: "Period 6", bn: "৬ষ্ঠ পিরিয়ড" } },
];

export const routineDays: { day: Bi; subjects: string[] }[] = [
  { day: { en: "Saturday", bn: "শনিবার" }, subjects: ["Qur'an", "Bangla", "Mathematics", "English", "ICT"] },
  { day: { en: "Sunday", bn: "রবিবার" }, subjects: ["Qur'an", "English", , "Mathematics", "Bangla"] },
  { day: { en: "Monday", bn: "সোমবার" }, subjects: ["Qur'an", "Mathematics", "Islamic Studies", "English", "BGS"] },
  { day: { en: "Tuesday", bn: "মঙ্গলবার" }, subjects: ["Qur'an", "Bangla", "Arabic", "Mathematics"] },
  { day: { en: "Wednesday", bn: "বুধবার" }, subjects: ["Qur'an", "ICT", "English", "Islamic Studies",  "Games"] },
  { day: { en: "Thursday", bn: "বৃহস্পতিবার" }, subjects: ["Qur'an", "Bangla", "Mathematics", "Arabic", "Library", "Assembly"] },
];

export const calendarMonths: { month: Bi; items: Bi[] }[] = [
  {
    month: { en: "January", bn: "জানুয়ারি" },
    items: [
      { en: "02 — Session begins", bn: "০২ — শিক্ষাবর্ষ শুরু" },
      { en: "05–09 — Book distribution week", bn: "০৫–০৯ — বই বিতরণ সপ্তাহ" },
    ],
  },
  {
    month: { en: "February", bn: "ফেব্রুয়ারি" },
    items: [
      { en: "10–14 — First class test", bn: "১০–১৪ — প্রথম শ্রেণি পরীক্ষা" },
      { en: "21 — Language Martyrs' Day", bn: "২১ — শহীদ দিবস" },
    ],
  },
  {
    month: { en: "March", bn: "মার্চ" },
    items: [{ en: "26 — Independence Day programme", bn: "২৬ — স্বাধীনতা দিবস অনুষ্ঠান" }],
  },
  {
    month: { en: "April", bn: "এপ্রিল" },
    items: [
      { en: "Ramadan short schedule", bn: "রমজানের সংক্ষিপ্ত সূচি" },
      { en: "Eid-ul-Fitr vacation", bn: "ঈদুল ফিতরের ছুটি" },
    ],
  },
  {
    month: { en: "May", bn: "মে" },
    items: [{ en: "12–22 — First Term Examination ", bn: "১২–২২ — প্রথম সাময়িক পরীক্ষা" }],
  },
  {
    month: { en: "June", bn: "জুন" },
    items: [{ en: "26 — Parents' meeting", bn: "২৬ — অভিভাবক সভা" }],
  },
  {
    month: { en: "July", bn: "জুলাই" },
    items: [{ en: "04–16 — Summer & Eid-ul-Adha vacation", bn: "০৪–১৬ — গ্রীষ্ম ও ঈদুল আজহার ছুটি" }],
  },
  {
    month: { en: "August", bn: "আগস্ট" },
    items: [{ en: "10–24 — Second Term Examination in", bn: "১০–২৪ — দ্বিতীয় সাময়িক পরীক্ষা" }],
  },
  {
    month: { en: "September", bn: "সেপ্টেম্বর" },
    items: [
      { en: "12 — Admission test", bn: "১২ — ভর্তি পরীক্ষা" },
      { en: "25 — Annual sports", bn: "২৫ — বার্ষিক ক্রীড়া" },
    ],
  },
  {
    month: { en: "October", bn: "অক্টোবর" },
    items: [{ en: "Qirat & Hifz competition, study tour", bn: "কিরাত ও হিফজ প্রতিযোগিতা, শিক্ষা সফর" }],
  },
  {
    month: { en: "November", bn: "নভেম্বর" },
    items: [{ en: "09–13 — Pre-annual assessment", bn: "০৯–১৩ — প্রাক-বার্ষিক মূল্যায়ন" }],
  },
  {
    month: { en: "December", bn: "ডিসেম্বর" },
    items: [
      { en: "01–15 — Annual Examination", bn: "০১–১৫ — বার্ষিক পরীক্ষা" },
      { en: "28 — Result & prize giving", bn: "২৮ — ফলাফল ও পুরস্কার বিতরণ" },
    ],
  },
];

/* ---------------------------------- Gallery --------------------------------- */

export type GalleryItem = { id: string; album: Bi; albumId: string; caption: Bi; src: string };

const g = (seed: string) => `https://picsum.photos/seed/${seed}/900/650`;

export const galleryAlbums: { id: string; label: Bi }[] = [
  { id: "all", label: { en: "All", bn: "সব" } },
  { id: "campus", label: { en: "Campus", bn: "ক্যাম্পাস" } },
  { id: "academic", label: { en: "Academic", bn: "শিক্ষা কার্যক্রম" } },
  { id: "events", label: { en: "Events", bn: "অনুষ্ঠান" } },
  { id: "sports", label: { en: "Sports", bn: "ক্রীড়া" } },
];

export const galleryItems: GalleryItem[] = [
  /*{
    id: "1",
    albumId: "campus",
    album: { en: "Campus", bn: "ক্যাম্পাস" },
    caption: {
      en: "Main academic building",
      bn: "প্রধান একাডেমিক ভবন",
    },
    src: "/gallery/campus.jpg",
  },*/
  {
    id: "2",
    albumId: "academic",
    album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" },
    caption: {
      en: "Classroom",
      bn: "ক্লাসরুম",
    },
    src: "/gallery/classroom.jpg",
  },
  {
    id: "3",
    albumId: "academic",
    album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" },
    caption: {
      en: "Classroom",
      bn: "ক্লাসরুম",
    },
    src: "/gallery/classroom.jpg",
  },
  /*{
    id: "4",
    albumId: "academic",
    album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" },
    caption: {
      en: "Qur'an tilawat period",
      bn: "কুরআন তিলাওয়াত পিরিয়ড",
    },
    src: "/gallery/quran.jpg",
  },*/
  {
    id: "5",
    albumId: "events",
    album: { en: "Events", bn: "অনুষ্ঠান" },
    caption: {
      en: "Prize giving ceremony",
      bn: "পুরস্কার বিতরণী অনুষ্ঠান",
    },
    src: "/gallery/1.jpg",
  },
 /* {
    id: "6",
    albumId: "campus",
    album: { en: "Campus", bn: "ক্যাম্পাস" },
    caption: {
      en: "Prayer hall",
      bn: "নামাজের কক্ষ",
    },
    src: "/gallery/prayer-hall.jpg",
  },*/
];

/* ----------------------------- Site settings -------------------------------- */

export type SiteSettings = {
  whatsapp: any;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  phone: string;
  email: string;
  address: string;
  admissionOpen: boolean;
  marquee: string;
  marqueeBn: string;
};

