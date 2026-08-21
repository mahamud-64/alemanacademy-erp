import {
  Award,
  BookOpen,
  CalendarClock,
  CreditCard,
  Download,
  FileBarChart,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  MonitorPlay,
  School,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Bi } from "@/lib/i18n";

export type AdminNavItem = {
  label: Bi;
  /** module id under /admin/$module, or "" for the dashboard index */
  module: string;
  action?: string;
};

export type AdminNavGroup = {
  label: Bi;
  icon: LucideIcon;
  items: AdminNavItem[];
  direct?: boolean;
};

const bi = (en: string, bn: string): Bi => ({ en, bn });

export const adminNav: AdminNavGroup[] = [
  {
    label: bi("Dashboard", "ড্যাশবোর্ড"),
    icon: LayoutDashboard,
    items: [
      { label: bi("Overview", "সারসংক্ষেপ"), module: "" },
      { label: bi("Recent Activities", "সাম্প্রতিক কার্যক্রম"), module: "activity" },
    ],
  },
  {
    label: bi("Students", "শিক্ষার্থী"),
    icon: GraduationCap,
    items: [
      { label: bi("All Students", "সব শিক্ষার্থী"), module: "students" },
      { label: bi("Add Student", "শিক্ষার্থী যোগ"), module: "students", action: "new" },
      { label: bi( "Student Promotion", "শিক্ষার্থী প্রমোশন",), module: "enrollment", },
    ],
  },
  {
    label: bi("Teachers", "শিক্ষক"),
    icon: Users,
    items: [
      { label: bi("All Teachers", "সব শিক্ষক"), module: "teachers" },
      { label: bi("Add Teacher", "শিক্ষক যোগ"), module: "teachers", action: "new" },
      { label: bi("Assign Classes & Subjects", "শ্রেণি ও বিষয় বরাদ্দ"), module: "teachers", action: "assign" },
    ],
  },
  {
    label: bi("Classes", "শ্রেণি"),
    icon: School,
    items: [
      { label: bi("All Classes", "সব শ্রেণি"), module: "classes" },
      { label: bi("Add Class", "শ্রেণি যোগ"), module: "classes", action: "new" },
      { label: bi("Sections & Session", "শাখা ও শিক্ষাবর্ষ"), module: "classes", action: "sections" },
    ],
  },
  {
    label: bi("Subjects", "বিষয়"),
    icon: BookOpen,
    items: [
      { label: bi("Subject List", "বিষয় তালিকা"), module: "subjects" },
      { label: bi("Add Subject", "বিষয় যোগ"), module: "subjects", action: "new" },
      { label: bi("Assign to Class", "শ্রেণিতে বরাদ্দ"), module: "subjects", action: "assign" },
    ],
  },
  {
    label: bi("Routine", "রুটিন"),
    icon: CalendarClock,
    items: [
      { label: bi("Class Routine", "ক্লাস রুটিন"), module: "routine" },
      { label: bi("Exam Routine", "পরীক্ষার রুটিন"), module: "routine", action: "exam" },
      { label: bi("Teacher Routine", "শিক্ষক রুটিন"), module: "routine", action: "teacher" },
    ],
  },
  {
    label: bi("Examinations", "পরীক্ষা"),
    icon: Award,
    items: [
      { label: bi("Exams", "পরীক্ষাসমূহ"), module: "exams" },
      { label: bi("Marks Entry", "নম্বর এন্ট্রি"), module: "marks" },
      { label: bi("Publish / Edit Results", "ফল প্রকাশ / সম্পাদনা"), module: "marks", action: "publish" },
      { label: bi("Merit List", "মেধা তালিকা"), module: "marks", action: "merit" },
    ],
  },
  {
    label: bi("Fees", "ফি"),
    icon: CreditCard,
    items: [
      { label: bi("Fee Structure", "ফি কাঠামো"), module: "fees" },
      { label: bi("Collect Fees", "ফি আদায়"), module: "fees", action: "new" },
      { label: bi("Due List", "বকেয়া তালিকা"), module: "fees", action: "due" },
    ],
  },
  {
    label: bi("Admissions", "ভর্তি"),
    icon: UserPlus,
    items: [
      { label: bi("Applications", "আবেদনসমূহ"), module: "admissions" },
      { label: bi("New Admission", "নতুন ভর্তি"), module: "admissions", action: "new" },
      { label: bi("Pending Approval", "অনুমোদনের অপেক্ষায়"), module: "admissions", action: "pending" },
    ],
  },
  {
    label: bi("Notices", "নোটিশ"),
    icon: Megaphone,
    items: [
      { label: bi("Manage Notices", "নোটিশ ব্যবস্থাপনা"), module: "notices" },
      { label: bi("Publish Notice", "নোটিশ প্রকাশ"), module: "notices", action: "new" },
      { label: bi("Sliding News", "স্লাইডিং নিউজ",),module: "sliding-news",},
    ],
  },
  {
    label: bi("Downloads", "ডাউনলোড"),
    icon: Download,
    items: [
      { label: bi("All Files", "সব ফাইল"), module: "downloads" },
      { label: bi("Upload File", "ফাইল আপলোড"), module: "downloads", action: "new" },
    ],
  },
  {
    label: bi("Gallery", "গ্যালারি"),
    icon: ImageIcon,
    items: [
      { label: bi("Photo Gallery", "ফটো গ্যালারি"), module: "gallery" },
      { label: bi("Upload Images", "ছবি আপলোড"), module: "gallery", action: "new" },
    ],
  },
  {
    label: bi("Media", "মিডিয়া"),
    icon: MonitorPlay,
    items: [
      { label: bi("All Media", "সব মিডিয়া"), module: "media" },
      { label: bi("Add Media", "মিডিয়া যোগ"), module: "media", action: "new" },
    ],
  },
  {
    label: bi("Reports", "রিপোর্ট"),
    icon: FileBarChart,
    items: [{ label: bi("All Reports", "সব রিপোর্ট"), module: "reports" }],
  },
  {
    label: bi("Website Settings", "ওয়েবসাইট সেটিংস"),
    icon: Settings,
    items: [{ label: bi("Site Configuration", "সাইট কনফিগারেশন"), module: "settings" }],
  },
  {
    label: bi(
      "Teacher Login Access",
      "শিক্ষক লগইন অ্যাক্সেস",
    ),
    icon: Users,
    direct: true,
    items: [
      {
        label: bi(
          "Teacher Login Access",
          "শিক্ষক লগইন অ্যাক্সেস",
        ),
        module: "teacher-access",
      },
    ],
  },
  {
    label: bi("Admin Accounts", "এডমিন অ্যাকাউন্ট"),
    icon: ShieldCheck,
    items: [
      { label: bi("All Admins", "সব এডমিন"), module: "admins" },
      { label: bi("Add Admin", "এডমিন যোগ"), module: "admins", action: "new" },
      { label: bi("Activity Logs", "কার্যক্রম লগ"), module: "activity" },
    ],
  },
  
];
