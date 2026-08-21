import type { Bi } from "@/lib/i18n";

export const school = {
  name: { en: "Al Eman Islamic Academy", bn: "আল ঈমান ইসলামিক একাডেমি" } satisfies Bi,
  tagline: {
    en: "Committed to Integrating Islamic and Modern Education",
    bn: "ইসলামী ও যুগোপযোগী শিক্ষার সমন্বয় সাধনের প্রত্যয়ে.....",
  } satisfies Bi,
  phone: "+8801819802313",
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
    facebook: "https://facebook.com/alemanbd",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me/8801819802313",
  },
  mapEmbed:
    "https://www.google.com/maps/embed?pb=",
};

export type NavItem = { to: string; label: Bi };

export const primaryNav: NavItem[] = [
  { to: "/", label: { en: "Home", bn: "হোম" } },
  { to: "/about", label: { en: "About", bn: "পরিচিতি" } },
  { to: "/academics", label: { en: "Academics", bn: "শিক্ষাক্রম" } },
  { to: "/notices", label: { en: "Notice Board", bn: "নোটিশ বোর্ড" } },
  { to: "/results", label: { en: "Results", bn: "ফলাফল" } },
  { to: "/gallery", label: { en: "Gallery", bn: "গ্যালারি" } },
  { to: "/admission", label: { en: "Admission", bn: "ভর্তি" } },
  { to: "/contact", label: { en: "Contact", bn: "যোগাযোগ" } },
];

export const moreNav: NavItem[] = [
  { to: "/downloads", label: { en: "Downloads", bn: "ডাউনলোড" } },
  { to: "/calendar", label: { en: "Academic Calendar", bn: "শিক্ষা পঞ্জি" } },
  { to: "/routine", label: { en: "Class Routine", bn: "ক্লাস রুটিন" } },
  { to: "/achievements", label: { en: "Achievements", bn: "অর্জন" } },
  { to: "/facilities", label: { en: "Facilities", bn: "সুবিধাসমূহ" } },
];

/* ---------------------------------- Notices --------------------------------- */

export type NoticeCategory = "general" | "exam" | "admission" | "event" | "holiday";

export type Notice = {
  id: string;
  title: Bi;
  body: Bi;
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

export const defaultNotices: Notice[] = [
  {
    id: "n-2026-014",
    category: "admission",
    date: "2026-07-28",
    pinned: true,
    title: {
      en: "Admission open for Academic Year 2027 (Play Group – Class X)",
      bn: "২০২৭ শিক্ষাবর্ষে ভর্তি চলছে (প্লে গ্রুপ – দশম শ্রেণি)",
    },
    body: {
      en: "Applications for the 2027 academic year are now open for Play Group through Class X. Forms may be submitted online through the Admission page or collected from the school office between 9:00 AM and 2:00 PM on working days. The admission test for Classes III–X will be held on 12 September 2026. Required documents: birth certificate photocopy, two passport-size photographs, previous school transfer certificate and the guardian's national ID copy.",
      bn: "২০২৭ শিক্ষাবর্ষের জন্য প্লে গ্রুপ থেকে দশম শ্রেণি পর্যন্ত ভর্তি আবেদন গ্রহণ শুরু হয়েছে। অনলাইনে ভর্তি পাতা থেকে অথবা কর্মদিবসে সকাল ৯টা থেকে দুপুর ২টার মধ্যে অফিস থেকে ফরম সংগ্রহ করা যাবে। তৃতীয় থেকে দশম শ্রেণির ভর্তি পরীক্ষা ১২ সেপ্টেম্বর ২০২৬ তারিখে অনুষ্ঠিত হবে। প্রয়োজনীয় কাগজপত্র: জন্মনিবন্ধন ফটোকপি, দুই কপি পাসপোর্ট সাইজ ছবি, পূর্ববর্তী প্রতিষ্ঠানের ছাড়পত্র এবং অভিভাবকের জাতীয় পরিচয়পত্রের কপি।",
    },
  },
  {
    id: "n-2026-013",
    category: "exam",
    date: "2026-07-20",
    pinned: true,
    title: {
      en: "Half-Yearly Examination 2026 routine published",
      bn: "অর্ধবার্ষিক পরীক্ষা ২০২৬ এর রুটিন প্রকাশিত",
    },
    body: {
      en: "The Half-Yearly Examination will begin on 10 August 2026 and continue until 24 August 2026. Examinations start at 10:00 AM sharp; students must be seated by 9:40 AM with their admit card. The full routine is available in the Download Center as a printable PDF. Students with outstanding fees must clear dues before collecting admit cards.",
      bn: "অর্ধবার্ষিক পরীক্ষা ১০ আগস্ট ২০২৬ থেকে শুরু হয়ে ২৪ আগস্ট ২০২৬ পর্যন্ত চলবে। পরীক্ষা সকাল ১০টায় শুরু হবে; শিক্ষার্থীদের প্রবেশপত্রসহ সকাল ৯টা ৪০ মিনিটের মধ্যে আসন গ্রহণ করতে হবে। সম্পূর্ণ রুটিন ডাউনলোড সেন্টারে পিডিএফ আকারে পাওয়া যাবে। বকেয়া বেতন পরিশোধ সাপেক্ষে প্রবেশপত্র সংগ্রহ করা যাবে।",
    },
  },
  {
    id: "n-2026-012",
    category: "event",
    date: "2026-07-11",
    title: {
      en: "Annual Qirat & Hifz competition — registration closes 5 August",
      bn: "বার্ষিক কিরাত ও হিফজ প্রতিযোগিতা — নিবন্ধন ৫ আগস্ট পর্যন্ত",
    },
    body: {
      en: "Our annual Qirat and Hifz competition will be held in the main auditorium. Students from all sections may register with their class teacher. Three categories: Junior (Class I–III), Intermediate (Class IV–VI) and Senior (Class VII–X). Winners receive certificates, medals and a scholarship on tuition fees.",
      bn: "প্রধান মিলনায়তনে বার্ষিক কিরাত ও হিফজ প্রতিযোগিতা অনুষ্ঠিত হবে। সকল শাখার শিক্ষার্থীরা শ্রেণিশিক্ষকের নিকট নিবন্ধন করতে পারবে। তিনটি বিভাগ: জুনিয়র (১ম–৩য়), ইন্টারমিডিয়েট (৪র্থ–৬ষ্ঠ) ও সিনিয়র (৭ম–১০ম)। বিজয়ীরা সনদ, পদক ও বেতনে বৃত্তি পাবে।",
    },
  },
  {
    id: "n-2026-011",
    category: "holiday",
    date: "2026-06-30",
    title: { en: "Summer & Eid-ul-Adha holiday schedule", bn: "গ্রীষ্মকালীন ও ঈদুল আজহার ছুটির সূচি" },
    body: {
      en: "The academy will remain closed from 4 July to 16 July 2026 for the summer vacation and Eid-ul-Adha. Classes resume on 17 July 2026 at the usual time. The administrative office will stay open on 8 and 12 July for fee collection only.",
      bn: "গ্রীষ্মকালীন ছুটি ও ঈদুল আজহা উপলক্ষে ৪ জুলাই থেকে ১৬ জুলাই ২০২৬ পর্যন্ত একাডেমি বন্ধ থাকবে। ১৭ জুলাই ২০২৬ থেকে যথারীতি ক্লাস শুরু হবে। কেবল বেতন গ্রহণের জন্য ৮ ও ১২ জুলাই অফিস খোলা থাকবে।",
    },
  },
  {
    id: "n-2026-010",
    category: "general",
    date: "2026-06-18",
    title: { en: "Parents' meeting for Classes VI–X", bn: "ষষ্ঠ–দশম শ্রেণির অভিভাবক সভা" },
    body: {
      en: "A parents' meeting will be held on Friday, 26 June 2026 at 10:00 AM in the school hall. Class teachers will discuss half-yearly preparation, attendance and homework performance. Attendance of at least one guardian per student is requested.",
      bn: "আগামী শুক্রবার, ২৬ জুন ২০২৬ সকাল ১০টায় স্কুল হলে অভিভাবক সভা অনুষ্ঠিত হবে। শ্রেণিশিক্ষকগণ অর্ধবার্ষিক প্রস্তুতি, উপস্থিতি ও বাড়ির কাজ নিয়ে আলোচনা করবেন। প্রতি শিক্ষার্থীর পক্ষে অন্তত একজন অভিভাবকের উপস্থিতি কাম্য।",
    },
  },
  {
    id: "n-2025-041",
    category: "exam",
    date: "2025-12-02",
    archived: true,
    title: { en: "Annual Examination 2025 result published", bn: "বার্ষিক পরীক্ষা ২০২৫ এর ফলাফল প্রকাশিত" },
    body: {
      en: "Results of the Annual Examination 2025 have been published. Students may check their marksheet online from the Results page using roll, student ID or registration number.",
      bn: "বার্ষিক পরীক্ষা ২০২৫ এর ফলাফল প্রকাশিত হয়েছে। শিক্ষার্থীরা রোল, স্টুডেন্ট আইডি বা রেজিস্ট্রেশন নম্বর দিয়ে ফলাফল পাতা থেকে মার্কশিট দেখতে পারবে।",
    },
  },
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
  content: string[];
};

export const defaultDownloads: DownloadDoc[] = [
  {
    id: "admission-form",
    title: { en: "Admission Form 2027", bn: "ভর্তি ফরম ২০২৭" },
    description: {
      en: "Printable admission application form for Play Group to Class X.",
      bn: "প্লে গ্রুপ থেকে দশম শ্রেণির জন্য মুদ্রণযোগ্য ভর্তি আবেদন ফরম।",
    },
    category: { en: "Admission", bn: "ভর্তি" },
    size: "182 KB",
    updated: "2026-07-28",
    content: [
      "Session: 2027    Form No: ..............",
      "1. Name of student (English): ..................................",
      "2. Name of student (Bangla): ...................................",
      "3. Date of birth: ......../......../..........  Birth Reg No: ..........",
      "4. Class applied for: ..........  Section: ..........",
      "5. Father's name: ..............................................",
      "6. Mother's name: .............................................",
      "7. Guardian mobile: ..............  E-mail: ..................",
      "8. Present address: ...........................................",
      "9. Previous institution: ......................................",
      "Documents attached: birth certificate, 2 photographs, transfer certificate, guardian NID.",
      "Signature of guardian: ....................   Date: ..............",
      "For office use only: Test date .......  Roll .......  Result .......",
    ],
  },
  {
    id: "prospectus",
    title: { en: "School Prospectus 2026-27", bn: "স্কুল প্রসপেক্টাস ২০২৬-২৭" },
    description: {
      en: "Full introduction to the academy, curriculum, faculty and facilities.",
      bn: "একাডেমি, শিক্ষাক্রম, শিক্ষকমণ্ডলী ও সুবিধাদির সম্পূর্ণ পরিচিতি।",
    },
    category: { en: "General", bn: "সাধারণ" },
    size: "1.4 MB",
    updated: "2026-06-02",
    content: [
      "Al Eman Islamic Academy - Prospectus 2026-27",
      "Established 2017 | Chattogram, Bangladesh",
      "Vision: Committed to integrating Islamic and modern education.",
      "Sections: Play Group, Nursery, KG, Class I-X (Science & Business Studies).",
      "Curriculum: NCTB National Curriculum + Qur'an, Hifz, Arabic and Islamic Studies.",
      "Faculty: 34 full-time teachers, 6 huffaz, 4 lab instructors.",
      "Facilities: science lab, computer lab, library, prayer hall, playground, transport.",
      "Class size: maximum 32 students. Teacher-student ratio 1:18.",
      "Contact: +880 131-697-7822 | alemanislamicacademy@gmail.com",
    ],
  },
  {
    id: "academic-calendar",
    title: { en: "Academic Calendar 2026", bn: "শিক্ষা পঞ্জি ২০২৬" },
    description: {
      en: "Month-by-month term dates, examinations and holidays.",
      bn: "মাসভিত্তিক শিক্ষাবর্ষ, পরীক্ষা ও ছুটির তালিকা।",
    },
    category: { en: "Academic", bn: "শিক্ষা" },
    size: "240 KB",
    updated: "2026-01-05",
    content: [
      "January  - Session opens (02), Book distribution week (05-09)",
      "February - Language Month programme (21), First class test (10-14)",
      "March    - Independence Day observance (26)",
      "April    - Ramadan schedule, Eid-ul-Fitr vacation",
      "May      - Pre half-yearly assessment (18-22)",
      "June     - Parents' meeting (26), Summer vacation begins (04 July)",
      "August   - Half-Yearly Examination (10-24)",
      "September- Admission test (12), Annual sports (25)",
      "October  - Qirat & Hifz competition, Study tour",
      "November - Pre-annual assessment (09-13)",
      "December - Annual Examination (01-15), Result & prize giving (28)",
    ],
  },
  {
    id: "holiday-list",
    title: { en: "Holiday List 2026", bn: "ছুটির তালিকা ২০২৬" },
    description: {
      en: "Official list of government and institutional holidays.",
      bn: "সরকারি ও প্রাতিষ্ঠানিক ছুটির সরকারি তালিকা।",
    },
    category: { en: "Academic", bn: "শিক্ষা" },
    size: "96 KB",
    updated: "2026-01-05",
    content: [
      "21 February - International Mother Language Day",
      "26 March    - Independence Day",
      "14 April    - Bangla New Year",
      "01 May      - May Day",
      "Ramadan / Eid-ul-Fitr vacation - 18 days",
      "04-16 July  - Summer & Eid-ul-Adha vacation",
      "Ashura, Eid-e-Miladunnabi - 1 day each",
      "16 December - Victory Day",
      "Winter vacation - 25-31 December",
    ],
  },
  {
    id: "class-routine",
    title: { en: "Class Routine 2026", bn: "ক্লাস রুটিন ২০২৬" },
    description: {
      en: "Weekly period-wise routine for all classes and sections.",
      bn: "সকল শ্রেণি ও শাখার সাপ্তাহিক পিরিয়ডভিত্তিক রুটিন।",
    },
    category: { en: "Academic", bn: "শিক্ষা" },
    size: "310 KB",
    updated: "2026-01-12",
    content: [
      "Period 1  08:00-08:40 | Period 2 08:45-09:25 | Period 3 09:30-10:10",
      "Assembly & Tilawat 07:45-08:00 daily",
      "Break 10:10-10:35",
      "Period 4  10:35-11:15 | Period 5 11:20-12:00 | Period 6 12:05-12:45",
      "Zuhr prayer 12:45-13:15",
      "Period 7  13:15-13:55 (Class VI-X only)",
      "Friday: closed. Saturday-Thursday: full routine.",
    ],
  },
  {
    id: "exam-routine",
    title: { en: "Half-Yearly Exam Routine 2026", bn: "অর্ধবার্ষিক পরীক্ষার রুটিন ২০২৬" },
    description: {
      en: "Date, subject and time for every class in the half-yearly exam.",
      bn: "অর্ধবার্ষিক পরীক্ষার প্রতিটি শ্রেণির তারিখ, বিষয় ও সময়।",
    },
    category: { en: "Examination", bn: "পরীক্ষা" },
    size: "204 KB",
    updated: "2026-07-20",
    content: [
      "10 Aug - Bangla 1st paper   | 10:00 AM - 12:30 PM",
      "12 Aug - English 1st paper  | 10:00 AM - 12:30 PM",
      "14 Aug - Mathematics        | 10:00 AM - 01:00 PM",
      "17 Aug - Islamic Studies    | 10:00 AM - 12:30 PM",
      "19 Aug - Science            | 10:00 AM - 12:30 PM",
      "21 Aug - Bangladesh & Global Studies | 10:00 AM - 12:30 PM",
      "24 Aug - ICT / Arabic       | 10:00 AM - 12:00 PM",
    ],
  },
  {
    id: "syllabus",
    title: { en: "Syllabus (Class I–X)", bn: "সিলেবাস (১ম–১০ম শ্রেণি)" },
    description: {
      en: "Chapter-wise syllabus distribution for the full session.",
      bn: "পূর্ণ শিক্ষাবর্ষের অধ্যায়ভিত্তিক সিলেবাস বিভাজন।",
    },
    category: { en: "Academic", bn: "শিক্ষা" },
    size: "820 KB",
    updated: "2026-01-12",
    content: [
      "Class I-III : Bangla, English, Mathematics, Religion, Qaida/Qur'an",
      "Class IV-V  : + Bangladesh & Global Studies, Science, Arabic",
      "Class VI-VIII: + ICT, Agriculture, Physical Education, Hifz (optional)",
      "Class IX-X (Science): Physics, Chemistry, Biology, Higher Math",
      "Class IX-X (Business): Accounting, Finance, Business Entrepreneurship",
      "Islamic Studies and Qur'an Tilawat are compulsory for all classes.",
    ],
  },
  {
    id: "fee-structure",
    title: { en: "Fee Structure 2026", bn: "বেতন কাঠামো ২০২৬" },
    description: {
      en: "Admission, monthly tuition, exam and transport charges.",
      bn: "ভর্তি, মাসিক বেতন, পরীক্ষা ও পরিবহন ফি।",
    },
    category: { en: "Fees", bn: "ফি" },
    size: "128 KB",
    updated: "2026-01-05",
    content: [
      "Play Group / Nursery / KG : Admission 4,000 BDT | Monthly 1,100 BDT",
      "Class I-III               : Admission 4,500 BDT | Monthly 1,300 BDT",
      "Class IV-V                : Admission 5,000 BDT | Monthly 1,500 BDT",
      "Class VI-VIII             : Admission 5,500 BDT | Monthly 1,800 BDT",
      "Class IX-X                : Admission 6,500 BDT | Monthly 2,200 BDT",
      "Examination fee (per term): 600 BDT",
      "Transport (optional)      : 900 - 1,600 BDT by route",
      "Sibling discount 10% | Hifz scholarship up to 50%",
    ],
  },
  {
    id: "uniform-guide",
    title: { en: "Uniform Guide", bn: "ইউনিফর্ম নির্দেশিকা" },
    description: {
      en: "Approved uniform, colour codes and grooming standards.",
      bn: "অনুমোদিত ইউনিফর্ম, রঙ ও পরিচ্ছন্নতার নির্দেশনা।",
    },
    category: { en: "General", bn: "সাধারণ" },
    size: "154 KB",
    updated: "2025-11-20",
    content: [
      "Boys : white shirt, deep green trousers, green tie, white cap, black shoes.",
      "Girls: deep green kameez, white salwar, green scarf/hijab, black shoes.",
      "Sports day: white t-shirt with academy monogram and green trousers.",
      "Winter : deep green sweater with monogram only.",
      "ID card must be worn at all times inside the campus.",
    ],
  },
  {
    id: "school-magazine",
    title: { en: "School Magazine — Al Eman Barta", bn: "স্কুল ম্যাগাজিন — আল ঈমান বার্তা" },
    description: {
      en: "Annual magazine with student writing, art and event reports.",
      bn: "শিক্ষার্থীদের লেখা, চিত্রকর্ম ও অনুষ্ঠানের প্রতিবেদনসহ বার্ষিক ম্যাগাজিন।",
    },
    category: { en: "General", bn: "সাধারণ" },
    size: "3.2 MB",
    updated: "2025-12-28",
    content: [
      "Al Eman Barta - Annual Magazine 2025",
      "Message from the Principal",
      "Student essays: 'Adab in daily life', 'My village', 'Science and faith'",
      "Report: Annual sports, Qirat competition, Study tour to Sitakunda",
      "Result highlights: 100% pass, 41 GPA-5 in SSC 2025",
      "Art & calligraphy section",
    ],
  },
];

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
      "Noorani Qaida",
      "Hifz-ul-Quran",
      "Tajweed",
      "Muraja'ah",
      "Arabic",
      "Islamic Studies",
      "NCTB Curriculum"
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
      "Arabic Writing",
      "Kalimah & Masail",
      "Quran & Tajweed",
      "Hadith Sharif",
      "Bangla",
      "English",
      "Mathematics",
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
      "Arabic",
      "Quran & Tajweed",
      "Aqayed & Fiqh",
      "Bangla",
      "English",
      "Mathematics",
      "Science",
      "BGS" 
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
      "Bangla 1st",
      "Bangla 2nd",
      "English 1st",
      "English 2nd", 
      "Mathematics",
      "Science",
      "Arabic",
      "Quran Majeed",
      "Hadith",
      "Nahumir",
      "BGS",
      "ICT",
      "Mufiduth Tawlebeen", 
      "Aqayed & Fiqh"
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
    detail: { en: "English, Mathematics & BGS", bn: "ইংরেজি, গণিত ও বাংলাদেশ ও বিশ্বপরিচয়" },
  },
  {
    name: { en: "Md. Hossain", bn: "মো: হোসাইন" },
    role: { en: "Senior Teacher", bn: "সিনিয়র শিক্ষক" },
    detail: { en: "Bangla & English", bn: "বাংলা ও ইংরেজি" },
  },
  {
    name: { en: "Md. Zakerul Islam", bn: "মো: জাকেরুল ইসলাম" },
    role: { en: "Senior Teacher", bn: "সিনিয়র শিক্ষক" },
    detail: { en: "English, Mathematics, Arabic & Bangla", bn: "ইংরেজি, গণিত, আরবি ও বাংলা" },
  },
  {
    name: { en: "Md. Saif", bn: "মো: সাইফ" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "Bangla", bn: "বাংলা" },
  },
  {
    name: { en: "Md. Najmul Huaq", bn: "মো: নাজমুল হক" },
    role: { en: "Teacher", bn: "শিক্ষক" },
    detail: { en: "Arabic, Bangla & English", bn: "আরবি, বাংলা ও ইংরেজি" },
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
    detail: { en: "Arabic ", bn: "আরবি" },
  },
  {
    name: { en: "Mst. Shanta", bn: "মোছা: শান্তা" },
    role: { en: "Teacher — Girls Department", bn: "শিক্ষিকা — বালিকা বিভাগ" },
    detail: { en: "Mathematics, English & BGS", bn: "গণিত, ইংরেজি ও বাংলাদেশ ও বিশ্বপরিচয়" },
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
  { id: "1", albumId: "campus", album: { en: "Campus", bn: "ক্যাম্পাস" }, caption: { en: "Main academic building", bn: "প্রধান একাডেমিক ভবন" }, src: ""},
  { id: "2", albumId: "academic", album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" }, caption: { en: "Classroom", bn: "ক্লাসরুম" }, src: "https://scontent.fcgp7-1.fna.fbcdn.net/v/t39.30808-6/528687217_1128990365918613_4029171464294472590_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=108&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGKqTIbUiw8TH2ZGDXa2phw99nghgS_Jz332eCGBL8nPbFWhHU28qMabgCL_KhWCTOrrhLXZncUX1oQ1rLb1XRi&_nc_ohc=Ce5plX9HppEQ7kNvwFtZJGc&_nc_oc=AdrSrX44fMFpDzN0nH8jF0zUTMxU7LikXwdQcCZ2ujMc2fax2IN_CU8sCFuuP9ffDV0&_nc_zt=23&_nc_ht=scontent.fcgp7-1.fna&_nc_gid=nT6JehHMgjnp3B9rMGO1lQ&_nc_ss=7b2a8&oh=00_AQFbjbJwf6zgoFTN_lIOwLTaGQVblGxQOTlU3AbauIiZYA&oe=6A7AC0CE" },
  { id: "3", albumId: "academic", album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" }, caption: { en: "Classroom", bn: "ক্লাসরুম" }, src: "https://scontent.fcgp7-2.fna.fbcdn.net/v/t39.30808-6/526581879_1128989929251990_1004640377528100014_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFkDCqEqgogcrYhXmwnVBorm6sw5ji8wzibqzDmOLzDOBWmw_mM8tHM4tMhWPPOX43Yp5uqPQscZf3RCWFbEUp3&_nc_ohc=-Wh6xYcedxUQ7kNvwGp9gYM&_nc_oc=AdpLN8__NTiaiY_ZallVAmPUJbJTM0UXySN3ApYRtEY-4U4O3hbFjD4ZVDy_KFPX-Nk&_nc_zt=23&_nc_ht=scontent.fcgp7-2.fna&_nc_gid=tPUkLUEZP7nDfqO0df39cA&_nc_ss=7b2a8&oh=00_AQF7IudI3NBepEgA1yt4fUTmLbUbvdJQSHX4yC7h7eaulQ&oe=6A7A9921" },
  { id: "4", albumId: "academic", album: { en: "Academic", bn: "শিক্ষা কার্যক্রম" }, caption: { en: "Qur'an tilawat period", bn: "কুরআন তিলাওয়াত পিরিয়ড" }, src: "https://scontent.fcgp7-1.fna.fbcdn.net/v/t39.30808-6/476910411_9371252652940118_3680357462751757352_n.jpg?stp=c0.290.720.720a_dst-jpg_tt6&cstp=mx720x720&ctp=s206x206&_nc_cat=109&ccb=1-7&_nc_sid=50ad20&_nc_eui2=AeHlYF5OKgd5SdpB6DsceZ0bEwHe2dODweMTAd7Z04PB45u1ATbTkElsEjr4zegefcetKgrK1BfKLj6VSdhk2GoD&_nc_ohc=dR1tAB1gEt0Q7kNvwEoIppS&_nc_oc=AdqZfqOIS_4-L59-DBYOakpr7Ad0fLE_JB3KwqxdfrcMPhYq_cTdHsD0Jlz0lJTg96c&_nc_zt=23&_nc_ht=scontent.fcgp7-1.fna&_nc_gid=phDiDaleRWatv9mEkfxMKA&_nc_ss=7b2a8&oh=00_AQEl40F0mWyXLplhfIuXqUwMpFCuIFtmRuihVM3qtRF7gw&oe=6A7AB0F4" },
 // { id: "6", albumId: "events", album: { en: "Events", bn: "অনুষ্ঠান" }, caption: { en: "Annual Qirat competition", bn: "বার্ষিক কিরাত প্রতিযোগিতা" }, src: g("aeia-event-1") },
  { id: "5", albumId: "events", album: { en: "Events", bn: "অনুষ্ঠান" }, caption: { en: "Prize giving ceremony", bn: "পুরস্কার বিতরণী অনুষ্ঠান" }, src: "https://scontent.fcgp7-1.fna.fbcdn.net/v/t39.30808-6/600337738_1241973594620289_6864694349025620938_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x960&ctp=s1280x960&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGITFiL5tKMWM-FjWmYPkLzA9lxnDaFAdsD2XGcNoUB219nhVX6IqwUJeUZUrGx5Evh1Xs7fXJwuLc7CTp-K3K_&_nc_ohc=L7sLtFEGwnMQ7kNvwHK9iOr&_nc_oc=Adp-jmStwA56jNrXLLcytSPT3An9hg6UCiHY9gBeQo1Hr-EpSj1O8qnKXaqt3bWDbcM&_nc_zt=23&_nc_ht=scontent.fcgp7-1.fna&_nc_gid=6qiZ3tLwk9pLd7UWBbbQ9g&_nc_ss=7b2a8&oh=00_AQF98guxuCbNtzD5IpMSjto1iosoFs6CkUPDlaUJh3rP2g&oe=6A7A9F44" },
 // { id: "8", albumId: "events", album: { en: "Events", bn: "অনুষ্ঠান" }, caption: { en: "Language Day observance", bn: "ভাষা দিবস পালন" }, src: g("aeia-event-3") },
 // { id: "9", albumId: "sports", album: { en: "Sports", bn: "ক্রীড়া" }, caption: { en: "Annual sports day", bn: "বার্ষিক ক্রীড়া দিবস" }, src: g("aeia-sporsdt-1") },
 // { id: "10", albumId: "sports", album: { en: "Sports", bn: "ক্রীড়া" }, caption: { en: "Inter-house football final", bn: "আন্তঃহাউস ফুটবল ফাইনাল" }, src: g("aeia-sport-2") },
  { id: "6", albumId: "campus", album: { en: "Campus", bn: "ক্যাম্পাস" }, caption: { en: "Prayer hall", bn: "নামাজের কক্ষ" }, src: "https://scontent.fcgp7-2.fna.fbcdn.net/v/t39.30808-6/728606722_1394860692664911_7871008635944326510_n.jpg?stp=c160.0.960.960a_dst-jpg_tt6&cstp=mx960x960&ctp=s206x206&_nc_cat=105&ccb=1-7&_nc_sid=50ad20&_nc_eui2=AeGkdyJrPqrtljEehyQRqGfP8LhjJ0_seIjwuGMnT-x4iNMSQQyQEwI5kv63f44Ug1Ok9JXwXoOjx6rfA6BSPDwe&_nc_ohc=Fy56li8mH88Q7kNvwGmYUzA&_nc_oc=AdosGwBHtydoH4Mp8g9nqWmRvVKI6C3baX6nl1JBKY1ymz-ab_NcbYigjxJoWZUyqVA&_nc_zt=23&_nc_ht=scontent.fcgp7-2.fna&_nc_gid=HLLNrBahoIY6bqWY3W5EQg&_nc_ss=7b2a8&oh=00_AQFeP1ALeb9JUNRExWvCvHU1AIGU37GOX-qtNenoUXHlOQ&oe=6A7AAC63" },
 // { id: "12", albumId: "sports", album: { en: "Sports", bn: "ক্রীড়া" }, caption: { en: "Badminton championship", bn: "ব্যাডমিন্টন চ্যাম্পিয়নশিপ" }, src: g("aeia-sposrt-3") },
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

