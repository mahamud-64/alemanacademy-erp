import type { Bi } from "@/lib/i18n";
import {
  defaultDownloads,
  defaultNotices,
  galleryItems,
  portalStudents,
  teachers as teacherSeed,
} from "@/data/site";

/**
 * Central admin module registry. Every module is described declaratively so a
 * real backend (Supabase / Firebase / REST) can later replace `useCollection`
 * without touching any UI component.
 */
export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "bi";

export type ModuleField = {
  key: string;
  label: Bi;
  type: FieldType;
  options?: string[];
  required?: boolean;
};

export type AdminRecord = { id: string } & Record<string, unknown>;

export type ModuleDef = {
  id: string;
  title: Bi;
  group: Bi;
  description: Bi;
  storageKey: string;
  fields: ModuleField[];
  columns: string[];
  filterKey?: string;
  seed: AdminRecord[];
};

const bi = (en: string, bn: string): Bi => ({ en, bn });
const f = (
  key: string,
  en: string,
  bn: string,
  type: FieldType = "text",
  extra: Partial<ModuleField> = {},
): ModuleField => ({ key, label: bi(en, bn), type, ...extra });

const classNames = ["Play", "KG", "Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"];

export const modules: ModuleDef[] = [
  {
    id: "students",

    title: bi(
      "Students",
      "শিক্ষার্থী",
    ),

    group: bi(
      "Students",
      "শিক্ষার্থী",
    ),

    description: bi(
      "Enrolment records, promotion and profiles.",
      "ভর্তি রেকর্ড, প্রমোশন ও প্রোফাইল।",
    ),

    storageKey: "aeia.admin.students",

    fields: [
      f(
        "student_id",
        "Student ID",
        "স্টুডেন্ট আইডি",
        "text",
        { required: true },
      ),

      f(
        "student_name",
        "Student Name",
        "শিক্ষার্থীর নাম",
        "text",
        { required: true },
      ),

      f(
        "class",
        "Class",
        "শ্রেণি",
        "select",
        {
          options: classNames,
          required: true,
        },
      ),

      f(
        "section",
        "Section",
        "শাখা",
        "select",
        {
          options: ["A", "B", "C"],
        },
      ),

      f(
        "roll",
        "Roll",
        "রোল",
        "text",
      ),

      f(
        "gender",
        "Gender",
        "লিঙ্গ",
        "select",
        {
          options: [
            "Male",
            "Female",
          ],
        },
      ),
    ],

    columns: [
      "student_id",
      "student_name",
      "class",
      "section",
      "roll",
      "gender",
    ],

    filterKey: "class",

    // Students come from Supabase.
    // They are NOT seeded through admin_collections.
    seed: [],
  },
  {
    id: "enrollment",

    title: bi(
      "Enrollment & Promotion",
      "এনরোলমেন্ট ও প্রমোশন",
    ),

    group: bi(
      "Students",
      "শিক্ষার্থী",
    ),

    description: bi(
      "Manage academic-year enrollment, class, section, roll and promotion history.",
      "শিক্ষাবর্ষভিত্তিক এনরোলমেন্ট, শ্রেণি, শাখা, রোল ও প্রমোশনের ইতিহাস পরিচালনা করুন।",
    ),

    storageKey: "aeia.admin.enrollment",

    fields: [],

    columns: [],

    filterKey: "",

    seed: [],
  },
  {
    id: "teachers",
    title: bi("Teachers", "শিক্ষক"),
    group: bi("Teachers", "শিক্ষক"),
    description: bi("Faculty records, designations and subject allocation.", "শিক্ষক তালিকা, পদবি ও বিষয় বরাদ্দ।"),
    storageKey: "aeia.admin.teachers",
    fields: [
      f("name", "Name", "নাম", "bi", { required: true }),
      f("role", "Designation", "পদবি", "bi", { required: true }),
      f("subject", "Subject", "বিষয়"),
      f("assignedClass", "Assigned class", "নির্ধারিত শ্রেণি", "select", { options: classNames }),
      f("phone", "Phone", "ফোন"),
      f("detail", "Qualification", "যোগ্যতা", "bi"),
    ],
    columns: ["name", "role", "subject", "assignedClass", "phone"],
    filterKey: "assignedClass",
    seed: teacherSeed.map((t, i) => ({
      id: `tc-${i}`,
      name: t.name,
      role: t.role,
      subject: t.role.en.split("&")[0]?.trim() ?? "",
      assignedClass: classNames[(i % 6) + 5] ?? "Class VI",
      phone: "+880 1300-00000" + i,
      detail: t.detail,
    })),
  },
  {
    id: "classes",
    title: bi("Classes", "শ্রেণি"),
    group: bi("Classes", "শ্রেণি"),
    description: bi("Class list, sections and academic sessions.", "শ্রেণি তালিকা, শাখা ও শিক্ষাবর্ষ।"),
    storageKey: "aeia.admin.classes",
    fields: [
      f("name", "Class name", "শ্রেণির নাম", "bi", { required: true }),
      f("sections", "Sections", "শাখাসমূহ"),
      f("session", "Academic session", "শিক্ষাবর্ষ", "select", { options: ["2025", "2026", "2027"] }),
      f("capacity", "Capacity", "ধারণক্ষমতা", "number"),
      f("teacherInCharge", "Class teacher", "শ্রেণি শিক্ষক"),
    ],
    columns: ["name", "sections", "session", "capacity", "teacherInCharge"],
    filterKey: "session",
    seed: classNames.slice(4).map((c, i) => ({
      id: `cl-${i}`,
      name: bi(c, c),
      sections: i % 2 === 0 ? "A, B" : "A",
      session: "2026",
      capacity: 40,
      teacherInCharge: teacherSeed[i % teacherSeed.length]?.name.en ?? "",
    })),
  },
  {
    id: "subjects",
    title: bi("Subjects", "বিষয়"),
    group: bi("Subjects", "বিষয়"),
    description: bi("Subject catalogue and class assignment.", "বিষয় তালিকা ও শ্রেণিভিত্তিক বরাদ্দ।"),
    storageKey: "aeia.admin.subjects",
    fields: [
      f("name", "Subject", "বিষয়", "bi", { required: true }),
      f("code", "Code", "কোড"),
      f("assignedClass", "Class", "শ্রেণি", "select", { options: classNames }),
      f("type", "Type", "ধরন", "select", { options: ["Compulsory", "Optional", "Religious"] }),
      f("fullMarks", "Full marks", "পূর্ণমান", "number"),
    ],
    columns: ["name", "code", "assignedClass", "type", "fullMarks"],
    filterKey: "assignedClass",
    seed: [
      ["Bangla", "বাংলা", "101"],
      ["English", "ইংরেজি", "107"],
      ["Mathematics", "গণিত", "109"],
      ["Islamic Studies", "ইসলাম শিক্ষা", "111"],
      ["Science", "বিজ্ঞান", "127"],
      ["ICT", "আইসিটি", "154"],
    ].map(([en, bn, code], i) => ({
      id: `sb-${i}`,
      name: bi(en as string, bn as string),
      code: code as string,
      assignedClass: "Class IX",
      type: i === 3 ? "Religious" : "Compulsory",
      fullMarks: 100,
    })),
  },
  {
    id: "routine",
    title: bi("Routine", "রুটিন"),
    group: bi("Routine", "রুটিন"),
    description: bi("Class, exam and teacher routines.", "শ্রেণি, পরীক্ষা ও শিক্ষক রুটিন।"),
    storageKey: "aeia.admin.routine",
    fields: [
      f("type", "Routine type", "রুটিনের ধরন", "select", { options: ["Class", "Exam", "Teacher"], required: true }),
      f("title", "Title", "শিরোনাম", "bi", { required: true }),
      f("targetClass", "Class", "শ্রেণি", "select", { options: classNames }),
      f("day", "Day", "দিন", "select", { options: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] }),
      f("period", "Period / time", "পিরিয়ড / সময়"),
      f("teacher", "Teacher", "শিক্ষক"),
    ],
    columns: ["type", "title", "targetClass", "day", "period", "teacher"],
    filterKey: "type",
    seed: [
      { id: "rt-1", type: "Class", title: bi("Class IX — Weekly routine", "নবম শ্রেণি — সাপ্তাহিক রুটিন"), targetClass: "Class IX", day: "Sunday", period: "1st (8:00–8:45)", teacher: "Md. Ariful Islam" },
      { id: "rt-2", type: "Exam", title: bi("Half-Yearly Exam 2026", "অর্ধবার্ষিক পরীক্ষা ২০২৬"), targetClass: "Class X", day: "Monday", period: "10:00–13:00", teacher: "Exam Committee" },
      { id: "rt-3", type: "Teacher", title: bi("Hifz department duty", "হিফজ বিভাগের দায়িত্ব"), targetClass: "Class VI", day: "Saturday", period: "2nd (8:45–9:30)", teacher: "Hafez Nurul Amin" },
    ],
  },
  {
    id: "exams",
    title: bi("Examinations", "পরীক্ষা"),
    group: bi("Examinations", "পরীক্ষা"),
    description: bi("Exams, marks entry and result publishing.", "পরীক্ষা, নম্বর এন্ট্রি ও ফল প্রকাশ।"),
    storageKey: "aeia.admin.exams",
    fields: [
      f("name", "Exam name", "পরীক্ষার নাম", "bi", { required: true }),
      f("targetClass", "Class", "শ্রেণি", "select", { options: classNames }),
      f("session", "Session", "শিক্ষাবর্ষ", "select", { options: ["2025", "2026", "2027"] }),
      f("startDate", "Start date", "শুরুর তারিখ", "date"),
      f("status", "Status", "অবস্থা", "select", { options: ["Scheduled", "Ongoing", "Published", "Unpublished"] }),
    ],
    columns: ["name", "targetClass", "session", "startDate", "status"],
    filterKey: "status",
    seed: [
      { id: "ex-1", name: bi("Half-Yearly Examination", "অর্ধবার্ষিক পরীক্ষা"), targetClass: "Class IX", session: "2026", startDate: "2026-06-15", status: "Published" },
      { id: "ex-2", name: bi("Annual Examination", "বার্ষিক পরীক্ষা"), targetClass: "Class X", session: "2026", startDate: "2026-11-20", status: "Scheduled" },
      { id: "ex-3", name: bi("First Term Test", "প্রথম সাময়িক পরীক্ষা"), targetClass: "Class VIII", session: "2026", startDate: "2026-03-02", status: "Published" },
    ],
  },
  {
    id: "marks",
    title: bi("Marks & Results", "নম্বর ও ফলাফল"),
    group: bi("Examinations", "পরীক্ষা"),
    description: bi("Marks entry, marksheets and merit list.", "নম্বর এন্ট্রি, মার্কশিট ও মেধা তালিকা।"),
    storageKey: "aeia.admin.marks",
    fields: [
      f("studentId", "Student ID", "স্টুডেন্ট আইডি", "text", { required: true }),
      f("exam", "Exam", "পরীক্ষা"),
      f("subject", "Subject", "বিষয়"),
      f("marks", "Marks", "নম্বর", "number"),
      f("grade", "Grade", "গ্রেড", "select", { options: ["A+", "A", "A-", "B", "C", "D", "F"] }),
      f("published", "Published", "প্রকাশিত", "select", { options: ["Yes", "No"] }),
    ],
    columns: ["studentId", "exam", "subject", "marks", "grade", "published"],
    filterKey: "published",
    seed: [
      { id: "mk-1", studentId: "DEMO2026", exam: "Half-Yearly 2026", subject: "Mathematics", marks: 92, grade: "A+", published: "Yes" },
      { id: "mk-2", studentId: "DEMO2026", exam: "Half-Yearly 2026", subject: "English", marks: 84, grade: "A", published: "Yes" },
      { id: "mk-3", studentId: "AEIA-1102", exam: "Half-Yearly 2026", subject: "Bangla", marks: 78, grade: "A-", published: "No" },
    ],
  },
  {
    id: "fees",
    title: bi("Fees", "ফি"),
    group: bi("Fees", "ফি"),
    description: bi("Fee structure, collection, payment history and dues.", "ফি কাঠামো, আদায়, পেমেন্ট ইতিহাস ও বকেয়া।"),
    storageKey: "aeia.admin.fees",
    fields: [
      f("studentId", "Student ID", "স্টুডেন্ট আইডি"),
      f("head", "Fee head", "ফি খাত", "select", { options: ["Monthly Tuition", "Admission", "Exam Fee", "Transport", "Hostel"] }),
      f("month", "Month", "মাস"),
      f("amount", "Amount (BDT)", "পরিমাণ (টাকা)", "number"),
      f("status", "Status", "অবস্থা", "select", { options: ["Paid", "Due"] }),
      f("paidOn", "Paid on", "পরিশোধের তারিখ", "date"),
    ],
    columns: ["studentId", "head", "month", "amount", "status", "paidOn"],
    filterKey: "status",
    seed: [
      { id: "fe-1", studentId: "DEMO2026", head: "Monthly Tuition", month: "July 2026", amount: 2200, status: "Due", paidOn: "" },
      { id: "fe-2", studentId: "DEMO2026", head: "Exam Fee", month: "July 2026", amount: 600, status: "Due", paidOn: "" },
      { id: "fe-3", studentId: "AEIA-1102", head: "Monthly Tuition", month: "July 2026", amount: 2000, status: "Paid", paidOn: "2026-07-04" },
    ],
  },
  {
    id: "admissions",
    title: bi("Admissions", "ভর্তি"),
    group: bi("Admissions", "ভর্তি"),
    description: bi("Online applications — approve or reject.", "অনলাইন আবেদন — অনুমোদন বা বাতিল।"),
    storageKey: "aeia.admin.admissions",
    fields: [
      f("child", "Child's name", "শিক্ষার্থীর নাম", "text", { required: true }),
      f("applyingFor", "Applying for", "যে শ্রেণিতে", "select", { options: classNames }),
      f("guardian", "Guardian", "অভিভাবক"),
      f("phone", "Phone", "ফোন"),
      f("appliedOn", "Applied on", "আবেদনের তারিখ", "date"),
      f("status", "Status", "অবস্থা", "select", { options: ["Pending", "Approved", "Rejected"] }),
    ],
    columns: ["child", "applyingFor", "guardian", "phone", "appliedOn", "status"],
    filterKey: "status",
    seed: [
      { id: "ad-1", child: "Zayan Mahmud", applyingFor: "Class I", guardian: "Mahmudul Hasan", phone: "+880 1717-112233", appliedOn: "2026-07-28", status: "Pending" },
      { id: "ad-2", child: "Hafsa Tabassum", applyingFor: "Class VI", guardian: "Nazrul Islam", phone: "+880 1811-445566", appliedOn: "2026-07-22", status: "Approved" },
    ],
  },
  {
    id: "notices",
    title: bi("Notices", "নোটিশ"),
    group: bi("Notices", "নোটিশ"),
    description: bi("Publish and manage notice board items.", "নোটিশ প্রকাশ ও ব্যবস্থাপনা।"),
    storageKey: "aeia.notices",
    fields: [
      f("title", "Title", "শিরোনাম", "bi", { required: true }),
      f("category", "Category", "ক্যাটাগরি", "select", { options: ["general", "exam", "admission", "event", "holiday"] }),
      f("date", "Date", "তারিখ", "date"),
      f("body", "Body", "বিবরণ", "bi"),
    ],
    columns: ["title", "category", "date"],
    filterKey: "category",
    seed: defaultNotices as unknown as AdminRecord[],
  },
  {
    id: "downloads",
    title: bi("Downloads", "ডাউনলোড"),
    group: bi("Downloads", "ডাউনলোড"),
    description: bi("Syllabus, routines, prospectus and question papers.", "সিলেবাস, রুটিন, প্রসপেক্টাস ও প্রশ্নপত্র।"),
    storageKey: "aeia.downloads",
    fields: [
      f("title", "Title", "শিরোনাম", "bi", { required: true }),
      f("category", "Category", "ক্যাটাগরি", "bi"),
      f("size", "File size", "ফাইলের আকার"),
      f("updated", "Updated", "হালনাগাদ", "date"),
    ],
    columns: ["title", "category", "size", "updated"],
    seed: defaultDownloads as unknown as AdminRecord[],
  },
  {
    id: "gallery",
    title: bi("Gallery", "গ্যালারি"),
    group: bi("Gallery", "গ্যালারি"),
    description: bi("Albums and photo uploads.", "অ্যালবাম ও ছবি আপলোড।"),
    storageKey: "aeia.admin.gallery",
    fields: [
      f("caption", "Caption", "ক্যাপশন", "bi", { required: true }),
      f("albumId", "Album", "অ্যালবাম", "select", { options: ["academic", "islamic", "sports", "campus", "events"] }),
      f("src", "Image URL", "ছবির লিংক"),
      f("uploaded", "Uploaded", "আপলোডের তারিখ", "date"),
    ],
    columns: ["caption", "albumId", "uploaded"],
    filterKey: "albumId",
    seed: galleryItems.map((g, i) => ({
      id: g.id ?? `gl-${i}`,
      caption: g.caption,
      albumId: g.albumId,
      src: g.src,
      uploaded: "2026-05-1" + (i % 9),
    })),
  },
  {
    id: "media",
    title: bi("Media", "মিডিয়া"),
    group: bi("Media", "মিডিয়া"),
    description: bi("Banners, hero images, sliders, videos, logo and favicon.", "ব্যানার, হিরো ছবি, স্লাইডার, ভিডিও, লোগো ও ফেভিকন।"),
    storageKey: "aeia.admin.media",
    fields: [
      f("name", "Asset name", "অ্যাসেটের নাম", "text", { required: true }),
      f("slot", "Slot", "স্লট", "select", { options: ["Homepage Banner", "Hero Image", "Slider", "Video", "Logo", "Favicon"] }),
      f("url", "URL / path", "ইউআরএল / পাথ"),
      f("updated", "Updated", "হালনাগাদ", "date"),
    ],
    columns: ["name", "slot", "url", "updated"],
    filterKey: "slot",
    seed: [
      { id: "md-1", name: "Campus hero", slot: "Hero Image", url: "/assets/hero.jpg", updated: "2026-07-01" },
      { id: "md-2", name: "School crest", slot: "Logo", url: "/favicon.png", updated: "2026-07-01" },
      { id: "md-3", name: "Admission banner", slot: "Homepage Banner", url: "/assets/banner.jpg", updated: "2026-07-12" },
    ],
  },
  {
    id: "teacher-access",
    title: bi(
      "Teacher Login Access",
      "শিক্ষক লগইন অ্যাক্সেস",
    ),
    group: bi(
      "Teacher Access",
      "শিক্ষক অ্যাক্সেস",
    ),
    description: bi(
      "Control whether teachers can access the mark entry portal.",
      "শিক্ষকরা নম্বর এন্ট্রি পোর্টালে প্রবেশ করতে পারবেন কি না তা নিয়ন্ত্রণ করুন।",
    ),
    storageKey: "aeia.admin.teacher-access",
    fields: [],
    columns: [],
    seed: [],
  },
  {
    id: "admins",
    title: bi("Admin Accounts", "এডমিন অ্যাকাউন্ট"),
    group: bi("Admin Accounts", "এডমিন অ্যাকাউন্ট"),
    description: bi("Administrators, roles and permissions.", "প্রশাসক, ভূমিকা ও অনুমতি।"),
    storageKey: "aeia.admin.admins",
    fields: [
      f("name", "Name", "নাম", "text", { required: true }),
      f("email", "Email", "ইমেইল"),
      f("role", "Role", "ভূমিকা", "select", { options: ["Super Admin", "Academic Admin", "Accounts", "Editor"] }),
      f("status", "Status", "অবস্থা", "select", { options: ["Active", "Suspended"] }),
      f("lastLogin", "Last login", "সর্বশেষ লগইন", "date"),
    ],
    columns: ["name", "email", "role", "status", "lastLogin"],
    filterKey: "role",
    seed: [
      { id: "am-1", name: "Mawlana Abdur Rahman", email: "principal@alemanacademy.edu.bd", role: "Super Admin", status: "Active", lastLogin: "2026-08-06" },
      { id: "am-2", name: "Md. Sakib Hasan", email: "ict@alemanacademy.edu.bd", role: "Editor", status: "Active", lastLogin: "2026-08-05" },
    ],
  },
  {
    id: "activity",
    title: bi("Activity Logs", "কার্যক্রম লগ"),
    group: bi("Admin Accounts", "এডমিন অ্যাকাউন্ট"),
    description: bi("Audit trail of administrative actions.", "প্রশাসনিক কার্যক্রমের অডিট লগ।"),
    storageKey: "aeia.admin.activity",
    fields: [
      f("actor", "Admin", "এডমিন"),
      f("action", "Action", "কার্যক্রম"),
      f("module", "Module", "মডিউল"),
      f("at", "Time", "সময়"),
    ],
    columns: ["actor", "action", "module", "at"],
    filterKey: "module",
    seed: [
      { id: "lg-1", actor: "Super Admin", action: "Published notice", module: "notices", at: "2026-08-06 09:12" },
      { id: "lg-2", actor: "Editor", action: "Uploaded syllabus PDF", module: "downloads", at: "2026-08-05 16:40" },
    ],
  },
];

export function getModule(id: string): ModuleDef | undefined {
  return modules.find((m) => m.id === id);
}
