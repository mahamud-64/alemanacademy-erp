import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Upload, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";


import {
  ActionButton,
  Field,
  PageHero,
  Section,
  SectionTitle,
  inputClass,
} from "@/components/ui-kit";
// ============================================================
// PREMIUM ADMISSION SUCCESS MODAL
// ============================================================

type AdmissionSuccessModalProps = {
  open: boolean;
  studentName: string;
  applicationId: string;
  onPrint: () => void;
  onDone: () => void;
};

function AdmissionSuccessModal({
  open,
  studentName,
  applicationId,
  onPrint,
  onDone,
}: AdmissionSuccessModalProps) {
  const { t } = useLang();

  const [idChecked, setIdChecked] = useState(false);

  // Reset confirmation whenever a new success modal opens
  useEffect(() => {
    if (open) {
      setIdChecked(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-slate-950/55
        px-4 py-5
        backdrop-blur-[7px]
        sm:px-6 sm:py-8
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="admission-success-title"
    >
      {/* =====================================================
          PREMIUM SUCCESS CARD
      ===================================================== */}

      <div
        className="
          relative
          flex w-full
          max-w-[1080px]
          max-h-[calc(100vh-40px)]
          overflow-hidden

          rounded-[2rem]
          border border-white/80

          bg-[#fffefa]

          shadow-[0_35px_100px_rgba(0,45,32,0.28)]

          animate-[successModalIn_0.5s_cubic-bezier(0.16,1,0.3,1)]

          sm:max-h-[calc(100vh-64px)]
          sm:rounded-[2.25rem]
        "
      >
        {/* =====================================================
            DECORATIVE BACKGROUND
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute inset-0
            overflow-hidden
          "
        >
          {/* Green top glow */}
          <div
            className="
              absolute
              -left-24 -top-28
              h-72 w-72
              rounded-full
              bg-emerald-200/25
              blur-3xl
            "
          />

          {/* Gold glow */}
          <div
            className="
              absolute
              -bottom-32 -right-20
              h-80 w-80
              rounded-full
              bg-amber-200/20
              blur-3xl
            "
          />

          {/* subtle vertical accent */}
          <div
            className="
              absolute left-0 top-0 bottom-0
              hidden w-1.5
              bg-gradient-to-b
              from-[#08734f]
              via-[#0a8a5d]
              to-[#dca72c]
              sm:block
            "
          />
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div
          className="
            relative
            flex w-full
            flex-col
            overflow-y-auto
            overscroll-contain
          "
        >
          {/* =================================================
              DESKTOP / TABLET LAYOUT
          ================================================= */}

          <div
            className="
              grid
              w-full
              grid-cols-1

              lg:grid-cols-[0.82fr_1.18fr]
            "
          >
            {/* =================================================
                LEFT — SUCCESS BRAND AREA
            ================================================= */}

            <div
              className="
                relative
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-9
                text-center

                lg:min-h-[560px]
                lg:border-r
                lg:border-emerald-900/10
                lg:px-10
                lg:py-12
              "
            >
              {/* small gold label */}
              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.24em]
                  text-[#b78618]
                "
              >
                <span className="h-px w-7 bg-[#dca72c]/60" />

                {t(
                  "Admission Application",
                  "ভর্তি আবেদন",
                )}

                <span className="h-px w-7 bg-[#dca72c]/60" />
              </div>

              {/* SUCCESS ICON */}

              <div
                className="
                  relative
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                  rounded-full

                  bg-gradient-to-br
                  from-[#08734f]
                  via-[#07865b]
                  to-[#006341]

                  shadow-[0_18px_45px_rgba(0,115,79,0.28)]

                  animate-[successIconPop_0.65s_cubic-bezier(0.16,1,0.3,1)]
                "
              >
                {/* outer ring */}
                <div
                  className="
                    absolute
                    inset-[-9px]
                    rounded-full
                    border
                    border-emerald-300/40
                  "
                />

                {/* second soft ring */}
                <div
                  className="
                    absolute
                    inset-[-17px]
                    rounded-full
                    border
                    border-emerald-200/20
                  "
                />

                <svg
                  viewBox="0 0 24 24"
                  className="relative h-14 w-14 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 12.5 9.5 17 19 7.5"
                    className="
                      animate-[successCheck_0.5s_0.25s_ease-out_both]
                    "
                  />
                </svg>
              </div>

              {/* Heading */}

              <h2
                id="admission-success-title"
                className="
                  mt-9
                  max-w-md
                  text-2xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-[#075b43]

                  sm:text-3xl

                  lg:text-[2.15rem]
                "
              >
                {t(
                  "Application Submitted Successfully!",
                  "আবেদন সফলভাবে জমা হয়েছে!",
                )}
              </h2>

              {/* decorative line */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                "
              >
                <span className="h-px w-10 bg-emerald-900/10" />

                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full
                    bg-[#dca72c]
                  "
                />

                <span className="h-px w-10 bg-emerald-900/10" />
              </div>

              {/* Thank you */}

              <p className="mt-5 text-base font-semibold text-slate-700">
                {t(
                  "Thank you",
                  "ধন্যবাদ",
                )},{" "}
                <span className="font-extrabold text-[#08734f]">
                  {studentName}
                </span>
                !
              </p>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {t(
                  "Your application has been received successfully. The admission office will contact you shortly.",
                  "আপনার আবেদন সফলভাবে গ্রহণ করা হয়েছে। ভর্তি অফিস শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
                )}
              </p>
            </div>

            {/* =================================================
                RIGHT — APPLICATION DETAILS
            ================================================= */}

            <div
              className="
                flex
                flex-col
                justify-center

                bg-white/55

                px-6
                pb-7
                pt-2

                sm:px-8

                lg:px-10
                lg:py-10
              "
            >
              {/* Application ID */}

              <div
                className="
                  rounded-[1.35rem]
                  border
                  border-emerald-200/70
                  bg-gradient-to-br
                  from-emerald-50/90
                  via-white
                  to-emerald-50/40
                  px-5
                  py-5

                  shadow-[0_8px_30px_rgba(0,100,70,0.06)]

                  sm:px-6
                  sm:py-6
                "
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-[0.2em]
                        text-emerald-700/65
                      "
                    >
                      {t(
                        "Application ID",
                        "আবেদন আইডি",
                      )}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      {t(
                        "Keep this ID for future reference",
                        "ভবিষ্যতের জন্য এই আইডিটি সংরক্ষণ করুন",
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-100
                      text-emerald-700
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="M7 9h10M7 13h6" />
                    </svg>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    flex
                    min-h-[74px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-100
                    bg-white
                  "
                >
                  <span
                    className="
                      text-4xl
                      font-black
                      tracking-[0.18em]
                      text-[#08734f]

                      sm:text-5xl
                    "
                  >
                    {applicationId}
                  </span>
                </div>
              </div>

              {/* Fee warning */}

              <div
                className="
                  mt-4
                  flex
                  gap-3
                  rounded-[1.25rem]
                  border
                  border-amber-200/80
                  bg-gradient-to-r
                  from-amber-50
                  via-[#fffaf0]
                  to-yellow-50
                  p-4
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-amber-100
                    text-amber-600
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M12 3 2.8 20h18.4L12 3Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 9v5M12 17h.01"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-extrabold text-amber-700">
                    {t(
                      "Important — Confirm Your Seat",
                      "গুরুত্বপূর্ণ — আসন নিশ্চিত করুন",
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-900/75 sm:text-sm">
                    {t(
                      "Please pay the admission fee within the specified time to confirm your seat.",
                      "আপনার আসন নিশ্চিত করতে নির্ধারিত সময়ের মধ্যে ভর্তি ফি পরিশোধ করুন।",
                    )}
                  </p>
                </div>
              </div>

              {/* Print */}

              <button
                type="button"
                onClick={onPrint}
                className="
                  group
                  mt-4
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl

                  border
                  border-[#08734f]

                  bg-white

                  px-5

                  text-sm
                  font-extrabold
                  text-[#08734f]

                  shadow-sm

                  transition-all
                  duration-200

                  hover:-translate-y-0.5
                  hover:bg-emerald-50
                  hover:shadow-md

                  active:translate-y-0
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="
                    h-5 w-5
                    transition-transform
                    duration-200
                    group-hover:scale-110
                  "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9V3h12v6" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14h12v7H6z" />
                </svg>

                {t(
                  "Print Application",
                  "আবেদন প্রিন্ট করুন",
                )}
              </button>

              {/* Confirmation */}

              <label
                className={`
                  mt-4
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  px-4
                  py-3.5

                  transition-all
                  duration-200

                  ${
                    idChecked
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={idChecked}
                  onChange={(e) =>
                    setIdChecked(e.target.checked)
                  }
                  className="sr-only"
                />

                <span
                  className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border-2

                    transition-all
                    duration-200

                    ${
                      idChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }
                  `}
                >
                  {idChecked && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 4 4L19 7" />
                    </svg>
                  )}
                </span>

                <span className="text-xs font-semibold leading-5 text-slate-700 sm:text-sm">
                  {t(
                    "I have checked my Application ID before continuing.",
                    "আমি এগিয়ে যাওয়ার আগে আমার আবেদন আইডি যাচাই করেছি।",
                  )}
                </span>
              </label>

              {/* Done */}

              <button
                type="button"
                disabled={!idChecked}
                onClick={onDone}
                className={`
                  mt-4
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  px-6

                  text-sm
                  font-extrabold
                  text-white

                  transition-all
                  duration-300

                  ${
                    idChecked
                      ? "bg-gradient-to-r from-[#006b49] via-[#087b52] to-[#006b49] shadow-[0_10px_28px_rgba(0,107,73,0.22)] hover:-translate-y-0.5 hover:shadow-[0_15px_34px_rgba(0,107,73,0.30)]"
                      : "cursor-not-allowed bg-slate-300"
                  }
                `}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 4 4L19 7" />
                </svg>

                {t(
                  "Done",
                  "সম্পন্ন",
                )}
              </button>

              <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
                {t(
                  "Please keep your Application ID safely for future reference.",
                  "ভবিষ্যতের জন্য আপনার আবেদন আইডিটি নিরাপদে সংরক্ষণ করুন।",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>{`
        @keyframes successModalIn {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(18px);
          }

          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes successIconPop {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }

          65% {
            opacity: 1;
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes successCheck {
          0% {
            stroke-dasharray: 30;
            stroke-dashoffset: 30;
          }

          100% {
            stroke-dasharray: 30;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
export const Route = createFileRoute("/admission")({
  head: () => ({
    meta: [
      {
        title: "Admission 2027 | Al Eman Islamic Academy",
      },
      {
        name: "description",
        content:
          "Apply online for admission to Al Eman Islamic Academy, Chattogram — Play Group to Class X.",
      },
      {
        property: "og:title",
        content: "Admission 2027 — Al Eman Islamic Academy",
      },
      {
        property: "og:description",
        content:
          "Apply online for admission to Al Eman Islamic Academy.",
      },
    ],
  }),
  component: Admission,
});

/* -------------------------------------------------------
   Validation
------------------------------------------------------- */

const applicationSchema = z.object({
    academic_year: z.string().default("2027"),

    student_name: z
      .string()
      .trim()
      .min(2, "Please enter the student's full name")
      .max(100),

    applying_for: z
      .string()
      .trim()
      .min(1, "Please select a class")
      .max(50),

    application_type: z.enum(["new", "old"]),

    father_name: z
      .string()
      .trim()
      .min(2, "Please enter father's name")
      .max(100),

    mother_name: z
      .string()
      .trim()
      .min(2, "Please enter mother's name")
      .max(100),

    date_of_birth: z
      .string()
      .min(1, "Please select date of birth"),

    birth_registration_no: z
      .string()
      .trim()
      .min(5, "Please enter birth registration number")
      .max(30)
      .regex(
        /^[0-9]+$/,
        "Birth registration number must contain digits only",
      ),

    // OPTIONAL
    blood_group: z
      .string()
      .optional(),

    gender: z.enum(["male", "female"], {
      message: "Please select gender",
    }),

    permanent_village: z
      .string()
      .trim()
      .min(1, "Required"),

    permanent_post_office: z
      .string()
      .trim()
      .min(1, "Required"),

    permanent_upazila: z
      .string()
      .trim()
      .min(1, "Required"),

    permanent_district: z
      .string()
      .trim()
      .min(1, "Required"),

    present_same_as_permanent: z.boolean(),

    present_village: z.string().trim().optional(),
    present_post_office: z.string().trim().optional(),
    present_upazila: z.string().trim().optional(),
    present_district: z.string().trim().optional(),

    nationality: z
      .string()
      .trim()
      .min(1, "Please enter nationality")
      .default("Bangladeshi"),

    guardian_name: z
      .string()
      .trim()
      .min(2, "Please enter guardian's name")
      .max(100),

    guardian_relation: z
      .string()
      .trim()
      .min(1, "Please select relationship"),

    // OPTIONAL
    guardian_profession: z
      .string()
      .trim()
      .max(100)
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(
        /^[0-9]+$/,
        "Phone number must contain digits only",
      )
      .min(7)
      .max(20),

    // OPTIONAL
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(255)
      .optional()
      .or(z.literal("")),

    guardian_address: z
      .string()
      .trim()
      .min(5, "Please enter guardian's address")
      .max(500),

    previous_institution: z
      .string()
      .trim()
      .max(200)
      .optional(),

    previous_class: z
      .string()
      .trim()
      .max(50)
      .optional(),

    previous_student_no: z
      .string()
      .trim()
      .max(50)
      .optional(),

    previous_date: z
      .string()
      .optional(),

    special_requirement: z
      .string()
      .trim()
      .max(1000)
      .optional(),

  declaration_accepted: z.boolean().refine(
    (value) => value === true,
    {
      message:
        "You must accept the declaration before submitting",
    },
  ),
  }).superRefine((data, ctx) => {
    if (!data.present_same_as_permanent) {
      if (!data.present_village) {
        ctx.addIssue({
          code: "custom",
          path: ["present_village"],
          message: "Required",
        });
      }

      if (!data.present_post_office) {
        ctx.addIssue({
          code: "custom",
          path: ["present_post_office"],
          message: "Required",
        });
      }

      if (!data.present_upazila) {
        ctx.addIssue({
          code: "custom",
          path: ["present_upazila"],
          message: "Required",
        });
      }

      if (!data.present_district) {
        ctx.addIssue({
          code: "custom",
          path: ["present_district"],
          message: "Required",
        });
      }
    }
  });
/* -------------------------------------------------------
   Options
------------------------------------------------------- */

const classOptions = [
  {
    en: "Play Group",
    bn: "প্লে গ্রুপ",
  },
  {
    en: "Nursery",
    bn: "নার্সারি",
  },
  {
    en: "Class I",
    bn: "প্রথম শ্রেণি",
  },
  {
    en: "Class II",
    bn: "দ্বিতীয় শ্রেণি",
  },
  {
    en: "Class III",
    bn: "তৃতীয় শ্রেণি",
  },
  {
    en: "Class IV",
    bn: "চতুর্থ শ্রেণি",
  },
  {
    en: "Class V",
    bn: "পঞ্চম শ্রেণি",
  },
  {
    en: "Class VI",
    bn: "ষষ্ঠ শ্রেণি",
  },
  {
    en: "Class VII",
    bn: "সপ্তম শ্রেণি",
  },
  {
    en: "Class VIII",
    bn: "অষ্টম শ্রেণি",
  },
  {
    en: "Class IX (Science)",
    bn: "নবম শ্রেণি (বিজ্ঞান)",
  },
  {
    en: "Class IX (Business Studies)",
    bn: "নবম শ্রেণি (ব্যবসায় শিক্ষা)",
  },
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const guardianRelations = [
  "পিতা",
  "মাতা",
  "ভাই",
  "বোন",
  "চাচা",
  "ফুফু",
  "দাদা",
  "দাদি",
  "অন্যান্য",
];



/* -------------------------------------------------------
   Component
------------------------------------------------------- */
/* -------------------------------------------------------
   Component
------------------------------------------------------- */

function Admission() {
const { t, tb } = useLang();

const [errors, setErrors] = useState<Record<string, string>>({});

const [applicationType, setApplicationType] =
  useState<"new" | "old">("new");

const [studentId, setStudentId] = useState("");
const [studentFound, setStudentFound] = useState(false);
const [studentLookupError, setStudentLookupError] = useState("");
const [studentLookupLoading, setStudentLookupLoading] = useState(false);

const [existingStudent, setExistingStudent] = useState<any | null>(null);
const isExistingStudent = applicationType === "old" && studentFound;

const [submitted, setSubmitted] = useState(false);
const [submittedApplicationId, setSubmittedApplicationId] =  useState("");
const [submittedStudentName, setSubmittedStudentName] = useState("");
const [lookupApplicationId, setLookupApplicationId] = useState("");
const [lookupDateOfBirth, setLookupDateOfBirth] = useState("");
const [lookupResult, setLookupResult] = useState<any | null>(null);
const [lookupLoading, setLookupLoading] = useState(false);
const [lookupError, setLookupError] = useState("");
const [sameAddress, setSameAddress] = useState(true);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [photoFile, setPhotoFile] = useState<File | null>(null);
  /* -------------------------------------------------------
     Copy permanent address into present address
  ------------------------------------------------------- */

  useEffect(() => {
    if (!sameAddress) return;

    const form = document.querySelector(
      "#admission-form",
    ) as HTMLFormElement | null;

    if (!form) return;

    const permanentVillage = (
      form.elements.namedItem("permanentVillage") as HTMLInputElement
    )?.value;

    const permanentPostOffice = (
      form.elements.namedItem("permanentPostOffice") as HTMLInputElement
    )?.value;

    const permanentUpazila = (
      form.elements.namedItem("permanentUpazila") as HTMLInputElement
    )?.value;

    const permanentDistrict = (
      form.elements.namedItem("permanentDistrict") as HTMLInputElement
    )?.value;

    const presentVillage = form.elements.namedItem(
      "presentVillage",
    ) as HTMLInputElement | null;

    const presentPostOffice = form.elements.namedItem(
      "presentPostOffice",
    ) as HTMLInputElement | null;

    const presentUpazila = form.elements.namedItem(
      "presentUpazila",
    ) as HTMLInputElement | null;

    const presentDistrict = form.elements.namedItem(
      "presentDistrict",
    ) as HTMLInputElement | null;

    if (presentVillage) presentVillage.value = permanentVillage || "";
    if (presentPostOffice)
      presentPostOffice.value = permanentPostOffice || "";
    if (presentUpazila) presentUpazila.value = permanentUpazila || "";
    if (presentDistrict)
      presentDistrict.value = permanentDistrict || "";
  });
  useEffect(() => {
    const loadExistingStudent = async () => {
      if (!existingStudent) return;

      const lockedFields = [
        "student_name",
        "date_of_birth",
        "birth_registration_no",
        "blood_group",
        "gender",
        "father_name",
        "mother_name",
        "permanent_village",
        "permanent_post_office",
        "permanent_upazila",
        "permanent_district",
        "present_village",
        "present_post_office",
        "present_upazila",
        "present_district",
        "nationality",
        "guardian_name",
        "guardian_relation",
        "guardian_profession",
        "phone",
        "email",
        "guardian_address",
        "previous_institution",
        "previous_class",
        "previous_student_no",
        "previous_date",
        "special_requirement",
      ];

      // Fill existing student information
      lockedFields.forEach((field) => {
        const elements = document.querySelectorAll(
          `[name="${field}"]`,
        );

        elements.forEach((element) => {
          const el = element as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement;

          if (field === "gender") {
            if (
              el instanceof HTMLInputElement &&
              el.type === "radio"
            ) {
              el.checked =
                el.value === existingStudent.gender;
            }
          } else {
            el.value = existingStudent[field] ?? "";
          }
        });
      });

      // Make existing student fields VIEW ONLY
      lockedFields.forEach((field) => {
        const elements = document.querySelectorAll(
          `[name="${field}"]`,
        );

        elements.forEach((element) => {
          const el = element as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement;

          if (
            el instanceof HTMLInputElement &&
            el.type === "radio"
          ) {
            el.style.pointerEvents = "none";
            el.tabIndex = -1;
          } else if (el instanceof HTMLSelectElement) {
            el.style.pointerEvents = "none";
            el.tabIndex = -1;
          } else {
            el.readOnly = true;
          }
        });
      });

      // Existing student photo
      if (existingStudent.photo_url) {
        const { data, error } =
          await supabase.storage
            .from("student-photos")
            .createSignedUrl(
              existingStudent.photo_url,
              3600,
            );

        if (error) {
          console.error(
            "Existing student photo error:",
            error,
          );
        } else {
          setPhotoPreview(data.signedUrl);
        }
      }
    };
    loadExistingStudent();
  }, [existingStudent]);

      /* -------------------------------------------------------
        Photo
      ------------------------------------------------------- */

  const handlePhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoFile(null);

      setErrors((prev) => ({
        ...prev,
        photo:
          "Please select a JPG, PNG, or WebP image.",
      }));

      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setPhotoFile(null);

      setErrors((prev) => ({
        ...prev,
        photo:
          "Photo must be smaller than 1 MB.",
      }));

      return;
    }

    // Keep the actual File for Supabase upload
    setPhotoFile(file);

    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    setPhotoPreview(
      URL.createObjectURL(file),
    );
  };
    const handleApplicationLookup = async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      setLookupError("");
      setLookupResult(null);

      if (!lookupApplicationId.trim()) {
        setLookupError(
          "Please enter your Admission ID.",
        );
        return;
      }

      if (!lookupDateOfBirth) {
        setLookupError(
          "Please enter your Date of Birth.",
        );
        return;
      }

      setLookupLoading(true);

      const { data, error } = await supabase.rpc(
        "lookup_application",
        {
          p_application_id:
            lookupApplicationId.trim(),
          p_date_of_birth:
            lookupDateOfBirth,
        },
      );

      setLookupLoading(false);

      if (error) {
        console.error(
          "Application lookup error:",
          error,
        );

        setLookupError(
          "Unable to search the application. Please try again.",
        );

        return;
      }

      if (!data || data.length === 0) {
        setLookupError(
          "No submitted application was found with this Admission ID and Date of Birth.",
        );

        return;
      }

      setLookupResult(data[0]);
    };    

      /* -------------------------------------------------------
        Submit
      ------------------------------------------------------- */

  const onSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED");
    if (applicationType === "new" && !photoFile) {
      setErrors((prev) => ({
        ...prev,
        photo: "Student photo is required.",
      }));

      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      academic_year: "2027",

      student_name: String(
        formData.get("student_name") ?? "",
      ),

      applying_for: String(
        formData.get("applying_for") ?? "",
      ),

      application_type:
        applicationType === "old"
          ? "old"
          : "new",

      student_id:
        applicationType === "old" && studentFound
          ? studentId.trim()
          : null,

      father_name: String(
        formData.get("father_name") ?? "",
      ),

      mother_name: String(
        formData.get("mother_name") ?? "",
      ),

      date_of_birth: String(
        formData.get("date_of_birth") ?? "",
      ),

      birth_registration_no: String(
        formData.get("birth_registration_no") ?? "",
      ),

      blood_group: String(
        formData.get("blood_group") ?? "",
      ),

      gender:
        formData.get("gender") === "female"
          ? "female"
          : "male",

      permanent_village: String(
        formData.get("permanent_village") ?? "",
      ),

      permanent_post_office: String(
        formData.get("permanent_post_office") ?? "",
      ),

      permanent_upazila: String(
        formData.get("permanent_upazila") ?? "",
      ),

      permanent_district: String(
        formData.get("permanent_district") ?? "",
      ),

      present_same_as_permanent: sameAddress,

      present_village: sameAddress
        ? String(
            formData.get("permanent_village") ?? "",
          )
        : String(
            formData.get("present_village") ?? "",
          ),

      present_post_office: sameAddress
        ? String(
            formData.get("permanent_post_office") ?? "",
          )
        : String(
            formData.get("present_post_office") ?? "",
          ),

      present_upazila: sameAddress
        ? String(
            formData.get("permanent_upazila") ?? "",
          )
        : String(
            formData.get("present_upazila") ?? "",
          ),

      present_district: sameAddress
        ? String(
            formData.get("permanent_district") ?? "",
          )
        : String(
            formData.get("present_district") ?? "",
          ),

      nationality: String(
        formData.get("nationality") ?? "Bangladeshi",
      ),

      guardian_name: String(
        formData.get("guardian_name") ?? "",
      ),

      guardian_relation: String(
        formData.get("guardian_relation") ?? "",
      ),

      guardian_profession: String(
        formData.get("guardian_profession") ?? "",
      ),

      phone: String(
        formData.get("phone") ?? "",
      ),

      email: String(
        formData.get("email") ?? "",
      ),

      guardian_address: String(
        formData.get("guardian_address") ?? "",
      ),

      previous_institution: String(
        formData.get("previous_institution") ?? "",
      ),

      previous_class: String(
        formData.get("previous_class") ?? "",
      ),

      previous_student_no: String(
        formData.get("previous_student_no") ?? "",
      ),

      previous_date: String(
        formData.get("previous_date") ?? "",
      ),

      special_requirement: String(
        formData.get("special_requirement") ?? "",
      ),

      declaration_accepted:
        formData.get("declaration_accepted") === "on",
    };

    const parsed =
      applicationSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        "APPLICATION VALIDATION FAILED:",
        parsed.error.issues,
      );

      const next: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);

        console.error(
          `Field "${key}":`,
          issue.message,
        );

        if (!next[key]) {
          next[key] = issue.message;
        }
      }

      setErrors(next);
      return;
    }

    setErrors({});
    
    // ==========================================
    // STUDENT PHOTO
    // ==========================================

  let photoUrl =
    applicationType === "old" && studentFound
      ? existingStudent?.photo_url ?? null
      : null;

  let photoPath: string | null = null;
  // New student → upload new photo
  if (applicationType === "new") {

    if (!photoFile) {
      setErrors({
        photo: "Student photo is required.",
      });

      return;
    }

    const photoExtension =
      photoFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const uniquePhotoId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    photoPath =
      `applications/${uniquePhotoId}.${photoExtension}`;

    const {
      data: uploadedPhoto,
      error: photoUploadError,
    } = await supabase.storage
      .from("student-photos")
      .upload(
        photoPath,
        photoFile,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: photoFile.type,
        },
      );

    if (photoUploadError) {
      console.error(
        "Photo upload error:",
        photoUploadError,
      );

      setErrors({
        photo:
          "Unable to upload student photo. Please try again.",
      });

      return;
    }

    photoUrl = uploadedPhoto.path;
  }

    // ==========================================
    // GENERATE APPLICATION ID
    // ==========================================

    const {
      data: generatedApplicationId,
      error: applicationIdError,
    } = await supabase.rpc(
      "next_application_id",
    );

    if (
      applicationIdError ||
      !generatedApplicationId
    ) {
      console.error(
        "Application ID generation error:",
        applicationIdError,
      );

      if (photoPath) {
        const { error: cleanupError } =
          await supabase.storage
            .from("student-photos")
            .remove([photoPath]);

        if (cleanupError) {
          console.error(
            "Photo cleanup error:",
            cleanupError,
          );
        }
      }

      setErrors({
        submit:
          "Unable to generate Application ID. Please try again.",
      });

      return;
    }

    // ==========================================
    // SAVE APPLICATION
    // ==========================================

    const { error } = await supabase
      .from("applications")
      .insert({
        ...parsed.data,

        application_type:
          applicationType === "old"
            ? "old"
            : "new",

        student_id:
          applicationType === "old" && studentFound
            ? studentId.trim()
            : null,

        application_id:
          generatedApplicationId,

        photo_url:
          photoUrl,

        status:
          "pending",
      });

    if (error) {
      console.error(
        "Supabase application error:",
        error,
      );

    // ==========================================
    // CLEAN UP UPLOADED PHOTO IF SAVE FAILED
    // ==========================================

    if (photoPath) {
      const { error: cleanupError } =
        await supabase.storage
          .from("student-photos")
          .remove([photoPath]);

      if (cleanupError) {
        console.error(
          "Photo cleanup error:",
          cleanupError,
        );
      }
    }

    setErrors({
      submit:
        "Unable to submit the application. Please try again.",
    });

    return;
  }
    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "APPLICATION SAVED:",
      parsed.data,
    );

    setSubmittedApplicationId(
      generatedApplicationId,
    );

    setSubmittedStudentName(
      parsed.data.student_name,
    );
    setLookupResult({
      ...parsed.data,

      application_id:
        generatedApplicationId,

      photo_url:
        photoUrl,

      status:
        "pending",

      // Needed by the existing print function
      created_at:
        new Date().toISOString(),
    });
    setSubmitted(true);

    form.reset();


    setPhotoFile(null);

    setPhotoPreview(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

      /* -------------------------------------------------------
        UI
      ------------------------------------------------------- */

  const steps = [
    {
      en: "Submit the online application or collect a form from the office.",
      bn: "অনলাইনে আবেদন করুন অথবা অফিস থেকে ফরম সংগ্রহ করুন।",
    },
    {
      en: "Receive a call from the admission desk within two working days.",
      bn: "দুই কর্মদিবসের মধ্যে ভর্তি ডেস্ক থেকে কল পাবেন।",
    },
    {
      en: "Attend the admission test (Class III and above) on the notified date.",
      bn: "নির্ধারিত তারিখে ভর্তি পরীক্ষায় অংশ নিন (তৃতীয় শ্রেণি ও উপরে)।",
    },
    {
      en: "Complete enrolment by paying the admission fee and submitting documents.",
      bn: "ভর্তি ফি পরিশোধ ও কাগজপত্র জমা দিয়ে ভর্তি সম্পন্ন করুন।",
    },
  ];
  
      /* -------------------------------------------------------
                  Bangla print function -----$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
      ------------------------------------------------------- */
    const handlePrintApplication = async () => {
        if (!lookupResult) return;

        const printWindow = window.open("", "_blank", "width=900,height=1000");

        if (!printWindow) {
          alert("প্রিন্ট করার জন্য অনুগ্রহ করে পপ-আপ অনুমতি দিন।");
          return;
        }

        const value = (item: unknown) =>
          item === null || item === undefined || item === "" ? "" : String(item);

        // Splits a raw value into individual boxed digits, e.g. for DOB / birth
        // registration number / mobile number fields that are drawn as a row of
        // separate cells on the original paper form.
        const digitBoxes = (raw: unknown, count: number) => {
          const digits = String(value(raw)).replace(/[^0-9]/g, "").split("");
          let out = "";
          for (let i = 0; i < count; i++) {
            out += `<span class="dbox">${digits[i] ?? ""}</span>`;
          }
          return out;
        };

        const checkbox = (checked: boolean) =>
          `<span class="chk">${checked ? "☑" : "☐"}</span>`;

        const dob = value(lookupResult.date_of_birth);
        const birthReg = value(
          lookupResult.birth_registration_no,
        );
        const phone = value(lookupResult.phone);
        // ==========================================
        // CLASS → BANGLA
        // ==========================================

        const getClassBangla = (classValue: unknown) => {
          const v = String(classValue ?? "")
            .trim()
            .toLowerCase();

          if (v === "play group" || v === "play" || v === "প্লে গ্রুপ" || v === "প্লে") {
            return "প্লে গ্রুপ";
          }

          if (v === "nursery" || v === "নার্সারি") {
            return "নার্সারি";
          }

          if (v === "kg" || v === "কেজি") {
            return "কেজি";
          }

          if (v === "class i" || v === "class 1" || v === "প্রথম শ্রেণি") {
            return "প্রথম শ্রেণি";
          }

          if (v === "class ii" || v === "class 2" || v === "দ্বিতীয় শ্রেণি") {
            return "দ্বিতীয় শ্রেণি";
          }

          if (v === "class iii" || v === "class 3" || v === "তৃতীয় শ্রেণি") {
            return "তৃতীয় শ্রেণি";
          }

          if (v === "class iv" || v === "class 4" || v === "চতুর্থ শ্রেণি") {
            return "চতুর্থ শ্রেণি";
          }

          if (v === "class v" || v === "class 5" || v === "পঞ্চম শ্রেণি") {
            return "পঞ্চম শ্রেণি";
          }

          if (v === "class vi" || v === "class 6" || v === "ষষ্ঠ শ্রেণি") {
            return "ষষ্ঠ শ্রেণি";
          }

          if (v === "class vii" || v === "class 7" || v === "সপ্তম শ্রেণি") {
            return "সপ্তম শ্রেণি";
          }

          if (v === "class viii" || v === "class 8" || v === "অষ্টম শ্রেণি") {
            return "অষ্টম শ্রেণি";
          }

          if (
            v === "class ix (science)" ||
            v === "class 9 (science)" ||
            v === "নবম শ্রেণি (বিজ্ঞান)"
          ) {
            return "নবম শ্রেণি (বিজ্ঞান)";
          }

          if (
            v === "class ix (business studies)" ||
            v === "class 9 (business studies)" ||
            v === "নবম শ্রেণি (ব্যবসায় শিক্ষা)"
          ) {
            return "নবম শ্রেণি (ব্যবসায় শিক্ষা)";
          }

          return String(classValue ?? "");
        };

        const classBangla = getClassBangla(
          lookupResult.applying_for,
        );

        // ==========================================
        // FIXED NATIONALITY
        // ==========================================

        const nationality = "বাংলাদেশী";
        // ==========================================
        // CLASS → DEPARTMENT
        // Play–Class 3 = Noorani
        // Class 4–5 = Ibtedayi
        // Class 6+ = General
        // ==========================================

        const getDepartment = (classValue: unknown) => {
          const v = String(classValue ?? "")
            .trim()
            .toLowerCase();

          // Play Group
          if (
            v === "play group" ||
            v === "প্লে গ্রুপ" ||
            v === "play" ||
            v === "প্লে"
          ) {
            return "noorani";
          }

          // Class I–III
          if (
            v === "class i" ||
            v === "class 1" ||
            v === "প্রথম শ্রেণি" ||
            v === "প্রথম"
          ) {
            return "noorani";
          }

          if (
            v === "class ii" ||
            v === "class 2" ||
            v === "দ্বিতীয় শ্রেণি" ||
            v === "দ্বিতীয়"
          ) {
            return "noorani";
          }

          if (
            v === "class iii" ||
            v === "class 3" ||
            v === "তৃতীয় শ্রেণি" ||
            v === "তৃতীয়"
          ) {
            return "noorani";
          }

          // Class IV–V
          if (
            v === "class iv" ||
            v === "class 4" ||
            v === "চতুর্থ শ্রেণি" ||
            v === "চতুর্থ"
          ) {
            return "ibtedayi";
          }

          if (
            v === "class v" ||
            v === "class 5" ||
            v === "পঞ্চম শ্রেণি" ||
            v === "পঞ্চম"
          ) {
            return "ibtedayi";
          }

          // Class VI–X
          if (
            v === "class vi" ||
            v === "class 6" ||
            v === "ষষ্ঠ শ্রেণি" ||
            v === "ষষ্ঠ" ||

            v === "class vii" ||
            v === "class 7" ||
            v === "সপ্তম শ্রেণি" ||
            v === "সপ্তম" ||

            v === "class viii" ||
            v === "class 8" ||
            v === "অষ্টম শ্রেণি" ||
            v === "অষ্টম" ||

            v === "class ix (science)" ||
            v === "class ix (business studies)" ||
            v === "class 9" ||
            v === "নবম শ্রেণি (বিজ্ঞান)" ||
            v === "নবম শ্রেণি (ব্যবসায় শিক্ষা)" ||
            v === "নবম" ||

            v === "class x" ||
            v === "class 10" ||
            v === "দশম শ্রেণি" ||
            v === "দশম"
          ) {
            return "general";
          }

          return "";
        };

        const department = getDepartment(
          lookupResult.applying_for,
        );

        // ==========================================
        // APPLICATION TYPE
        // Supports current DB values + Bangla
        // ==========================================

        const applicationType = value(
          lookupResult.application_type,
        );

        const isNew = /new|নতুন/i.test(
          applicationType,
        );

        const isOld = /old|পুরাতন/i.test(
          applicationType,
        );

        // ==========================================
        // GENDER
        // ==========================================

        const isMale = /পুরুষ|male/i.test(
          value(lookupResult.gender),
        );

        const isFemale = /মহিলা|female/i.test(
          value(lookupResult.gender),
        );

        // ==========================================
        // SUBMISSION DATE
        // ==========================================

        const submissionDate = lookupResult.created_at
          ? new Date(
              lookupResult.created_at,
            ).toLocaleDateString("en-GB")
          : "";
        // Optional photo support — if your lookupResult ever carries a photo URL,
        // drop the field name in here. Falls back to the original blank photo box.
          const photoPath = value((lookupResult as any).photo_url);

          const {
            data: { user },
          } = await supabase.auth.getUser();

          console.log("CURRENT USER:", user);
          console.log("PHOTO PATH:", photoPath);

          const { data: signedPhoto, error: signedPhotoError } =
            await supabase.storage
              .from("student-photos")
              .createSignedUrl(photoPath, 300);

          if (signedPhotoError) {
            console.error("Photo signed URL error:", signedPhotoError);
          }

          const photoUrl = signedPhoto?.signedUrl ?? "";

          console.log("PHOTO URL:", photoUrl);

        // TODO: paste your school logo's real SVG markup here, replacing this
        // placeholder circle. Keep viewBox proportions so it doesn't distort.
        const LOGO_SVG = `
          <img
            src="/logo.svg"
            alt="Al Eman Islamic Academy Logo"
            style="width:100%;height:100%;object-fit:contain;"
          />
        `;
                printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="bn">
            <head>
              <meta charset="UTF-8" />
              <title>ভর্তি আবেদন - ${value(lookupResult.application_id)}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap" rel="stylesheet">

              <style>
                * { box-sizing: border-box; }

                @page { size: A4; margin: 0; }

                html, body {
                  margin: 0;
                  padding: 0;
                  background: #ffffff;
                }

                body {
                  font-family: "Noto Sans Bengali", "Nirmala UI", "Vrinda", sans-serif;
                  color: #111;
                  font-size: 12.5px;
                  line-height: 1.55;
                }

                .a4-page {
                  width: 210mm;
                  min-height: 297mm;
                  margin: 0 auto;
                  padding: 8mm 9mm 6mm 9mm;
                  background: #e2f3ef;
                }

                /* ---------- CONTRAST HEADER ---------- */

                .header-row {
                  display: grid;
                  grid-template-columns: 1fr 92px 1fr;

                  align-items: center;
                  gap: 8px;

                  background: #006b68;
                  color: #ffffff;

                  border: none;
                  border-bottom: 4px solid #d9b84c;

                  /* Extend header to full A4 width */
                  margin-top: -8mm;
                  margin-left: -9mm;
                  margin-right: -9mm;
                  width: calc(100% + 18mm);

                  /*
                    Keep the header content comfortably
                    inside the full-width header.
                  */
                  padding: 6mm 7mm 5mm 7mm;

                  min-height: 30mm;
                }

                .header-left-bn {
                  text-align: left;
                  align-self: center;
                }

                .header-right-en {
                  text-align: right;
                  align-self: center;
                }
                .school-name-bn {
                  font-size: 20px;
                  font-weight: 800;
                  color: #ffd84a;
                  line-height: 1.15;
                  white-space: nowrap;
                }

                .school-name-ar {
                  font-size: 14px;
                  font-weight: 700;
                  color: #ffffff;
                  line-height: 1.25;
                  white-space: nowrap;
                }

                .school-name-en {
                  font-size: 16px;
                  font-weight: 800;
                  color: #ffffff;
                  letter-spacing: 0.2px;
                  line-height: 1.2;
                  white-space: nowrap;
                }

                .addr-bn,
                .addr-en {
                  font-size: 10px;
                  color: #f1f7f5;
                  margin-top: 2px;
                }

                .estd-bn,
                .estd-en {
                  font-size: 10px;
                  color: #e2efec;
                }

                .contact-bn {
                  font-size: 10px;
                  color: #f1f7f5;
                }

                .header-logo {
                  width: 90px;
                  height: 90px;
                  margin: 0 auto;

                  background: #ffffff;
                  border: 2px solid #d9b84c;
                  border-radius: 50%;

                  display: flex;
                  align-items: center;
                  justify-content: center;

                  overflow: hidden;
                }

                .contact-strip {
                  text-align: center;

                  background: #005653;
                  color: #ffffff;

                  font-size: 10px;

                  border: none;
                  border-bottom: 1px solid #d9b84c;

                  /* Full A4 width */
                  margin-left: -9mm;
                  margin-right: -9mm;
                  width: calc(100% + 18mm);

                  padding: 3px 0 4px 0;
                }
                /* ---------- FORM NO / TITLE / CLASS ROW ---------- */
                .form-meta-row {
                  display: grid;
                  grid-template-columns: 1fr auto 1fr;
                  align-items: start;
                  margin-top: 2px;
                }

                .meta-left,
                .meta-right {
                  font-size: 11px;
                }

                .meta-left {
                  text-align: left;
                }

                .meta-right {
                  text-align: right;
                }

                .meta-field {
                  margin-bottom: 2px;
                  line-height: 1.25;
                }

                .meta-field .box-input {
                  display: inline-block;
                  min-width: 90px;
                  border: 1px solid #111;
                  background: #fff;
                  padding: 1px 6px;
                  margin-left: 3px;
                  font-weight: 600;
                  line-height: 16px;
                  text-align: center;
                }
                .form-title {
                  text-align: center;
                  font-size: 21px;
                  font-weight: 800;
                  color: #a51f2d;
                  padding: 0 10px;
                  white-space: nowrap;
                  line-height: 1.2;
                }

                /* ---------- DEPARTMENT / NEW-OLD ROWS ---------- */
                .dept-row {
                  text-align: center;
                  font-size: 11px;
                  margin-top: 4px;
                  line-height: 1.25;
                }

                .dept-row .opt {
                  margin: 0 5px;
                  white-space: nowrap;
                }
                .newold-row {
                  text-align: center;
                  font-size: 11px;
                  margin-top: 1px;
                  line-height: 1.25;
                }

                .newold-row .opt {
                  margin: 0 8px;
                  white-space: nowrap;
                }
                .chk { font-size: 14px; margin-right: 2px; }

                /* ---------- SALUTATION + PHOTO ---------- */

                .salutation-row {
                  display: grid;
                  grid-template-columns: 1fr 100px;
                  gap: 8px;
                  margin-top: 5px;
                  align-items: start;
                  position: relative;
                }

                .salutation-text {
                  font-size: 12.5px;
                  line-height: 1.65;
                }

                .salutation-text .blank {
                  display: inline-block;
                  min-width: 60px;
                 /* border-bottom: 1px dotted #111; */
                  text-align: center;
                  font-weight: 600;
                }

                /* Passport-size photo */
                .photo-box {
                  width: 100px;
                  height: 120px;
                  border: 1px solid #111;
                  background: #fff;

                  display: flex;
                  align-items: center;
                  justify-content: center;

                  font-size: 11px;
                  color: #999;
                  overflow: hidden;

                  /* Remove photo from normal document flow */
                  position: absolute;
                  right: 0;
                  top: -15px;
                }

                .photo-box img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
                /* ---------- SECTION HEADER ---------- */
                .section-header {
                  margin-top: 7px;
                  font-weight: 700;
                  font-size: 13px;
                  color: #a51f2d;
                  background: #cce9c9;
                  border: none;
                  padding: 3px 8px;
                  line-height: 1.4;
                }

                /* ---------- FIELD ROWS ---------- */
                .field-row {
                  display: flex;
                  align-items: baseline;
                  gap: 4px;
                  margin-top: 3px;
                  font-size: 11.5px;
                  line-height: 1.25;
                  flex-wrap: nowrap;
                }

                .label {
                  font-weight: 600;
                  white-space: nowrap;
                }

                .label.inline {
                  margin-left: 10px;
                }

                .dotted {
                  flex: 1;
                  border-bottom: 1px dotted #333;
                  min-height: 13px;
                  padding: 0 3px;
                  font-weight: 500;
                }

                .dotted.short {
                  flex: 0 0 140px;
                }

                .dotted.mid {
                  flex: 0 0 220px;
                }


                /* ---------- TWO-COLUMN ADDRESS ---------- */
                .two-col {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 2px 16px;
                  margin-top: 3px;
                  font-size: 11.5px;
                }

                .two-col .field-row {
                  margin-top: 0;
                }


                /* ---------- DIGIT BOXES ---------- */
                .dbox-row {
                  display: inline-flex;
                  gap: 1px;
                  margin-left: 2px;
                  vertical-align: middle;
                }

                .dbox {
                  display: inline-block;
                  width: 12px;
                  height: 15px;
                  border: 1px solid #111;
                  text-align: center;
                  font-size: 9.5px;
                  line-height: 14px;
                  background: #fffdf3;
                }


                /* ---------- ADDRESS BLOCK ---------- */
                .addr-block {
                  margin-top: 5px;
                }

                .addr-block-title {
                  font-weight: 700;
                  font-size: 11.5px;
                  margin-bottom: 1px;
                  line-height: 1.25;
                }


                /* ---------- DECLARATION ---------- */
                .declaration-title {
                  text-align: center;
                  font-weight: 800;
                  font-size: 13px;
                  margin-top: -10px;
                  position: relative;
               
                }

                .declaration-title::before,
                .declaration-title::after {
                  content: "";
                  display: inline-block;
                  width: 90px;
                  border-top: 1px solid #111;
                  vertical-align: middle;
                  margin: 0 8px;
                
                }

                .declaration-text {
                  font-size: 13px;
                  margin-top: -5px;
                  text-align: justify;
            
                }

                .sign-right {
                  text-align: right;
                  font-size: 12px;
                  font-weight: 600;
                  margin-top: 0px;
              
                }
                /* ---------- BOTTOM APPROVAL BOXES ---------- */
                .approval-box {
                  display: grid;
                  grid-template-columns: 190px 1fr;
                  border: 1px solid #999;
                  background: #e2ddd2;
                  margin-top: 8px;
                  min-height: 34px;
                }
                .approval-label {
                  background: #1c5fa8;
                  color: #fff;
                  font-weight: 700;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                  padding: 4px 6px;
                }
                .approval-body {
                  font-size: 13px;
                  padding: 6px 10px 4px 8px;
                  display: flex;
                  align-items: flex-end;
                  justify-content: space-between;
                  gap: 15px;
                  line-height: 1.4;
                }
                .approval-body .blank {
                  flex: 1;
                  border-bottom: 1px dotted #333;
                  min-height: 12px;
                }
               .approval-sign {
                  font-size: 10.5px;
                  white-space: nowrap;
                  min-width: 55px;
                  text-align: bottom;
                  border-top: 1px solid #333;
                  padding-top: 3px;
                  margin-left: 12px;
                }

                @media print {
                  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                  .a4-page { margin: 0; }
                }
              </style>
            </head>

            <body>
              <div class="a4-page">

                <div class="header-row">
                  <div class="header-left-bn">
                    <div class="school-name-bn">আল ঈমান ইসলামিক একাডেমি</div>
                    <div class="addr-bn">কামাল পাড়া, ফটিকা, হাটহাজারী পৌরসভা, চট্টগ্রাম।</div>
                    <div class="estd-bn">স্থাপিত:২০১৭ইং</div>
                    <div class="contact-bn">পরিচালক: ০১৮৪০-১৬০৭১৫/ অফিস: ০১৮২৭-৬৭৬৭৩৭</div>
                  </div>

                  <div class="header-logo">${LOGO_SVG}</div>

                  <div class="header-right-en">
                    <div class="school-name-ar">الا يمان اسلاميك اكاديمى</div>
                    <div class="school-name-en">AL EMAN ISLAMIC ACADEMY</div>
                    <div class="addr-en">Kamal Para, Fatika, hathazari Municipality, Chattogram.</div>
                    <div class="estd-en">ESTD:2017</div>
                  </div>
                </div>

                <div class="contact-strip">
                  E-mail:alemanislamicacademy@gmail.com &nbsp;&nbsp; Follow us:facebook.com/allemanbd
                </div>

                <div class="form-meta-row">
                  <div class="meta-left">
                    <div class="meta-field">ফরম নং-<span class="box-input">${value(lookupResult.application_id)}</span></div>
                    <div class="meta-field">তারিখ-<span class="box-input">${submissionDate}  </span></div>
                  </div>
                  <div class="form-title">ভর্তির আবেদন ফরম</div>
                  <div class="meta-right">
                    <div class="meta-field"> শ্রেণি- <span class="box-input">  ${classBangla} </span> </div>
                    <div class="meta-field">শিক্ষাবর্ষ-<span class="box-input">${value(lookupResult.academic_year)}</span></div>
                  </div>
                </div>

                <div class="dept-row">
                  বিভাগ-

                  <span class="opt">
                    ${checkbox(department === "noorani")}
                    নূরানী
                  </span>

                  <span class="opt">
                    ${checkbox(department === "ibtedayi")}
                    ইবতেদায়ী
                  </span>

                  <span class="opt">
                    ${checkbox(false)}
                    নাজেরা
                  </span>

                  <span class="opt">
                    ${checkbox(false)}
                    হেফজ
                  </span>

                  <span class="opt">
                    ${checkbox(false)}
                    মহিলা
                  </span>

                  <span class="opt">
                    ${checkbox(department === "general")}
                    জেনারেল
                  </span>
                </div>

                <div class="newold-row">
                  <span class="opt">${checkbox(isNew)} নতুন</span>
                  <span class="opt">${checkbox(isOld)} পুরাতন</span>
                </div>

                <div class="salutation-row">
                  <div class="salutation-text">
                    বরাবর,<br/>
                    পরিচালক মহোদয়<br/>
                    আসসালামু আলাইকুম ওয়ারাহমাতুল্লাহ<br/>
                    আমি আমার ছেলে/মেয়ে/ভাই/বোনকে আপনার প্রতিষ্ঠানে<span class="blank"> ${department === "noorani" ? "নূরানী" : "ইবতেদায়ী"}</span>
                    বিভাগের <span class="blank">${classBangla}</span>তে ভর্তি করাতে ইচ্ছুক।<br/>
                    অতএব, অনুগ্রহপূর্বক ভর্তির সুযোগদানে বাধিত করলে আপনার নিকট চিরকৃতজ্ঞ থাকবো।
                  </div>
                  <div class="photo-box">
                    ${photoUrl ? `<img src="${photoUrl}" alt="ছবি" />` : "ছবি"}
                  </div>
                </div>

                <div class="section-header">নিম্নে শিক্ষার্থীর বিস্তারিত তথ্য প্রদান করা হলো:</div>

                <div class="field-row">
                  <span class="label">শিক্ষার্থীর নাম:</span>
                  <span class="dotted">${value(lookupResult.student_name)}</span>
                </div>

                <div class="field-row">
                  <span class="label">পিতার নাম:</span>
                  <span class="dotted">${value(lookupResult.father_name)}</span>
                </div>

                <div class="field-row">
                  <span class="label">মাতার নাম:</span>
                  <span class="dotted">${value(lookupResult.mother_name)}</span>
                </div>

                <div class="field-row">
                  <span class="label">জন্ম তারিখ:</span>
                  <span class="dbox-row">${digitBoxes(dob, 8)}</span>
                  <span class="label inline">রক্তের গ্রুপ:</span>
                  <span class="dotted short">${value(lookupResult.blood_group)}</span>
                  <span class="label inline">লিঙ্গ:</span>
                  <span>${checkbox(isMale)} পুরুষ &nbsp; ${checkbox(isFemale)} মহিলা</span>
                </div>

                <div class="field-row">
                  <span class="label">জন্ম নিবন্ধন নম্বর:</span>
                  <span class="dbox-row">${digitBoxes(birthReg, 17)}</span>
                </div>

                <div class="addr-block">
                  <div class="addr-block-title">স্থায়ী ঠিকানা:</div>
                  <div class="two-col">
                    <div class="field-row"><span class="label">প্রযত্নে:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">বাড়ী/বাসা:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">গ্রাম:</span><span class="dotted">${value(lookupResult.permanent_village)}</span></div>
                    <div class="field-row"><span class="label">ওয়ার্ড:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">ডাকঘর:</span><span class="dotted">${value(lookupResult.permanent_post_office)}</span></div>
                    <div class="field-row"><span class="label">উপজেলা:</span><span class="dotted">${value(lookupResult.permanent_upazila)}</span></div>
                    <div class="field-row"><span class="label">জেলা:</span><span class="dotted">${value(lookupResult.permanent_district)}</span></div>
                    <div class="field-row"><span class="label">জাতীয়তা:</span><span class="dotted">${nationality}</span></div>
                  </div>
                </div>

                <div class="addr-block">
                  <div class="addr-block-title">বর্তমান ঠিকানা:</div>
                  <div class="two-col">
                    <div class="field-row"><span class="label">প্রযত্নে:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">বাড়ী/বাসা:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">গ্রাম:</span><span class="dotted">${value(lookupResult.present_village)}</span></div>
                    <div class="field-row"><span class="label">ওয়ার্ড:</span><span class="dotted">&nbsp;</span></div>
                    <div class="field-row"><span class="label">ডাকঘর:</span><span class="dotted">${value(lookupResult.present_post_office)}</span></div>
                    <div class="field-row"><span class="label">উপজেলা:</span><span class="dotted">${value(lookupResult.present_upazila)}</span></div>
                    <div class="field-row"><span class="label">জেলা:</span><span class="dotted">${value(lookupResult.present_district)}</span></div>
                    <div class="field-row"><span class="label">জাতীয়তা:</span><span class="dotted">${nationality}</span></div>
                  </div>
                </div>

                <div class="addr-block">
                  <div class="addr-block-title">স্বীকৃত অভিভাবক:</div>
                  <div class="two-col">
                    <div class="field-row"><span class="label">নাম:</span><span class="dotted">${value(lookupResult.guardian_name)}</span></div>
                    <div class="field-row"><span class="label">পেশা:</span><span class="dotted">${value(lookupResult.guardian_profession)}</span></div>
                    <div class="field-row"><span class="label">অভিভাবকের সাথে সম্পর্ক:</span><span class="dotted">${value(lookupResult.guardian_relation)}</span></div>
                    <div class="field-row"><span class="label">ঠিকানা:</span><span class="dotted">${value(lookupResult.guardian_address)}</span></div>
                  </div>
                  <div class="field-row" style="margin-top:5px;">
                    <span class="label">মোবাইল নম্বর:</span>
                    <span class="dbox-row">${digitBoxes(phone, 11)}</span>
                  </div>
                </div>

                <div class="field-row" style="margin-top:8px;">
                  <span class="label">ইতোপূর্বে যে প্রতিষ্ঠানে পড়েছে:</span>
                  <span class="dotted">${value(lookupResult.previous_institution)}</span>
                </div>

                <div class="field-row">
                  <span class="label">শ্রেণি:</span>
                  <span class="dotted short">${getClassBangla(lookupResult.previous_class)}</span>
                  <span class="label inline">ছাড়পত্র নং:</span>
                  <span class="dotted mid">${value(lookupResult.previous_student_no)}</span>
                  <span class="label inline">তারিখ:</span>
                  <span class="dotted short">${value(lookupResult.previous_date)}</span>
                </div>

                <div class="field-row">
                  <span class="label">শিক্ষার্থীর জটিল কোন সমস্যা থাকলে তার বিবরণ:</span>
                  <span class="dotted">${value(lookupResult.special_requirement)}</span>
                </div>

                <div class="sign-right">শিক্ষার্থীর স্বাক্ষর:</div>

                <div class="declaration-title">অঙ্গীকার</div>
                <div class="declaration-text">
                  আমি অত্র প্রতিষ্ঠানের বর্তমান ও সমসাময়িক সকল আইন-কানুন মেনে চলার অঙ্গিকারে আমার ছেলে/মেয়ে/ভাই/বোনকে
                  ভর্তি করাতে ইচ্ছুক এবং সে বা আমি প্রতিষ্ঠানের আইন-শৃঙ্খলা পরিপন্থি কোন কাজ করলে প্রতিষ্ঠানের গৃহীত
                  সিদ্ধান্ত মেনে নিতে বাধ্য থাকবো।
                </div>
                <div class="sign-right">অভিভাবকের স্বাক্ষর:</div>
                  <div class="approval-box">
                    <div class="approval-label">পরিক্ষকের মন্তব্য:</div>

                    <div class="approval-body">
                      <span>
                        <span class="filled-data">${value(lookupResult.student_name)}</span>
                        কে সার্বিক বিবেচনায়
                        <span class="filled-data">${classBangla}</span>
                        তে ভর্তি করা যেতে পারে।
                      </span>

                      <span class="approval-sign">স্বাক্ষর</span>
                    </div>
                  </div>


                  <div class="approval-box">
                    <div class="approval-label">পরিচালকের অনুমোদন:</div>

                    <div class="approval-body">
                      <span>
                        উক্ত শিক্ষার্থীকে
                        <span class="filled-data">${classBangla}</span>
                        তে ভর্তির অনুমতি দেওয়া হলো।
                      </span>

                      <span class="approval-sign">স্বাক্ষর</span>
                    </div>
                  </div>

              </div>

              <script>
                window.onload = function () {
                  setTimeout(function () {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);

        printWindow.document.close();
      };
  return (
    <>
      <PageHero
        crumb={t("Admission", "ভর্তি")}
        title={t("Admission 2027", "ভর্তি ২০২৭")}
        subtitle={t(
          "Applications are open for Play Group through Class X. Apply online below.",
          "প্লে গ্রুপ থেকে দশম শ্রেণি পর্যন্ত আবেদন চলছে। নিচে অনলাইনে আবেদন করুন।",
        )}
      />
        {/* =========================================================
              HOW TO APPLY — ACADEMY STYLE DROPDOWN
          ========================================================= */}
          <details className="group mx-auto mt-4 max-w-5xl overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

            {/* DROPDOWN HEADER */}
            <summary className="relative flex cursor-pointer list-none items-center justify-center px-6 py-4 text-center outline-none transition-colors hover:bg-primary/[0.03] [&::-webkit-details-marker]:hidden">

              <span className="text-[17px] font-bold text-primary">
                {t(
                  "How to apply",
                  "যেভাবে আবেদন করবেন",
                )}
              </span>

              {/* GOLD ARROW */}
              <span className="ml-2 flex size-6 items-center justify-center rounded-full text-gold transition-transform duration-300 group-open:rotate-180">
                <ChevronDown className="size-5" />
              </span>

              {/* GOLD LINE */}
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-gold/80" />

            </summary>


            {/* DROPDOWN CONTENT */}
            <div className="border-t border-primary/10 bg-[#f8fbf9] px-5 py-6 sm:px-8">

              <div className="grid gap-8 md:grid-cols-2">

                {/* ================= LEFT — STEPS ================= */}
                <div>

                  <ol className="space-y-5">

                    {steps.map((step, index) => (
                      <li
                        key={step.en}
                        className="flex items-start gap-3"
                      >

                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
                          {index + 1}
                        </span>

                        <p className="pt-1 text-sm leading-6 text-muted-foreground">
                          {tb(step)}
                        </p>

                      </li>
                    ))}

                  </ol>

                </div>


                {/* ================= RIGHT — DOCUMENTS ================= */}
                <div>

                  <h3 className="mb-4 text-[15px] font-bold text-gold">
                    {t(
                      "Required documents",
                      "প্রয়োজনীয় কাগজপত্র",
                    )}
                  </h3>

                  <ul className="space-y-3 text-sm text-muted-foreground">

                    {[
                      {
                        en: "Photocopy of birth certificate",
                        bn: "জন্মনিবন্ধনের ফটোকপি",
                      },
                      {
                        en: "Two passport-size photographs",
                        bn: "দুই কপি পাসপোর্ট সাইজ ছবি",
                      },
                      {
                        en: "Transfer certificate from previous school",
                        bn: "পূর্ববর্তী প্রতিষ্ঠানের ছাড়পত্র",
                      },
                      {
                        en: "Guardian's national ID copy",
                        bn: "অভিভাবকের জাতীয় পরিচয়পত্রের কপি",
                      },
                    ].map((document) => (
                      <li
                        key={document.en}
                        className="flex items-start gap-2"
                      >

                        <CheckCircle2
                          className="mt-1 size-4 shrink-0 text-primary"
                          aria-hidden
                        />

                        <span className="leading-6">
                          {tb(document)}
                        </span>

                      </li>
                    ))}

                  </ul>

                </div>

              </div>

            </div>

          </details>
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">

          {/* -------------------------------------------------
             LEFT SIDE
          ------------------------------------------------- */}

          <div className="lg:col-span-2">

              {/* ---------------------------------------------------
                      Previously Submitted section
              --------------------------------------------------- */}

            <Section>
              <SectionTitle
                eyebrow={t(
                  "Previously Submitted",
                  "পূর্বে জমা দেওয়া",
                )}
                title={t(
                  "Previously Submitted Form",
                  "পূর্বে জমা দেওয়া ফর্ম",
                )}
              />

              <div className="mx-auto mt-8 max-w-3xl">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Already submitted an application? Search using your Admission ID and Date of Birth to view your submitted form.",
                      "ইতোমধ্যে আবেদন জমা দিয়েছেন? আপনার জমা দেওয়া ফর্ম দেখতে Admission ID এবং জন্মতারিখ দিয়ে অনুসন্ধান করুন।",
                    )}
                  </p>

                  <form
                    onSubmit={handleApplicationLookup}
                    className="mt-6 grid gap-5 sm:grid-cols-2"
                  >
                    <Field
                      label={t(
                        "Admission ID",
                        "Admission ID",
                      )}
                    >
                      <input
                        type="text"
                        value={lookupApplicationId}
                        onChange={(e) =>
                          setLookupApplicationId(
                            e.target.value,
                          )
                        }
                        placeholder="e.g. APP-1786259048999"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label={t(
                        "Date of Birth",
                        "জন্মতারিখ",
                      )}
                    >
                      <input
                        type="date"
                        value={lookupDateOfBirth}
                        onChange={(e) =>
                          setLookupDateOfBirth(
                            e.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <ActionButton
                        type="submit"
                        className="w-full py-3"
                        disabled={lookupLoading}
                      >
                        {lookupLoading
                          ? t(
                              "Searching...",
                              "অনুসন্ধান করা হচ্ছে...",
                            )
                          : t(
                              "Search & View",
                              "অনুসন্ধান ও দেখুন",
                            )}
                      </ActionButton>
                    </div>
                  </form>

                  {lookupError ? (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {lookupError}
                    </div>
                  ) : null}

                  {lookupResult ? (
                    <div className="mt-6 rounded-2xl border border-primary/20 bg-muted/30 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {t(
                              "Application Found",
                              "আবেদন পাওয়া গেছে",
                            )}
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-foreground">
                            {lookupResult.student_name}
                          </h3>

                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>
                              <strong>
                                {t(
                                  "Admission ID:",
                                  "Admission ID:",
                                )}
                              </strong>{" "}
                              {lookupResult.application_id}
                            </p>

                            <p>
                              <strong>
                                {t(
                                  "Class:",
                                  "শ্রেণি:",
                                )}
                              </strong>{" "}
                              {lookupResult.applying_for}
                            </p>

                            <p>
                              <strong>
                                {t(
                                  "Date of Birth:",
                                  "জন্মতারিখ:",
                                )}
                              </strong>{" "}
                              {lookupResult.date_of_birth}
                            </p>

                            <p>
                              <strong>
                                {t(
                                  "Status:",
                                  "স্ট্যাটাস:",
                                )}
                              </strong>{" "}
                              {lookupResult.status}
                            </p>
                          </div>
                        </div>

                        <ActionButton
                          type="button"
                          className="shrink-0"
                          onClick={handlePrintApplication}
                        >
                          🖨{" "}
                          {t(
                            "Print Application",
                            "আবেদন প্রিন্ট করুন",
                          )}
                        </ActionButton>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Section>
          </div>
           {/* -------------------------------------------------
                  FORM
             ------------------------------------------------- */}

          <div className="lg:col-span-3">

            {/* ==========================================
                APPLICATION TYPE — TOP STATUS SWITCH
            ========================================== */}

            <div className="mb-5">
              <h2 className="mb-3 text-center text-3xl font-bold text-primary">
                {t("Your Status", "আপনার অবস্থা")}
              </h2>

              <div
                className="flex rounded-2xl border border-primary/15 bg-white p-1 shadow-sm"
                role="group"
                aria-label={t(
                  "Application Type",
                  "আবেদনের ধরন",
                )}
              >
                {/* NEW ADMISSION */}
                <button
                  type="button"
                  onClick={() => {
                    setApplicationType("new");
                    setStudentFound(false);
                    setStudentId("");
                    setStudentLookupError("");
                  }}
                  className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    applicationType === "new"
                      ? "bg-primary text-white shadow-sm"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  {t(
                    "New Admission",
                    "নতুন ভর্তি",
                  )}
                </button>

                {/* EXISTING STUDENT */}
                <button
                  type="button"
                  onClick={() => {
                    setApplicationType("old");
                    setStudentFound(false);
                    setStudentLookupError("");
                  }}
                  className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    applicationType === "old"
                      ? "bg-primary text-white shadow-sm"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  {t(
                    "Existing Student",
                    "পুরাতন শিক্ষার্থী",
                  )}
                </button>
              </div>
            </div>

            {/* ==========================================
                APPLICATION CARD
            ========================================== */}

            <div className="surface-card p-7">

              <h2 className="text-xl font-bold text-primary">
                {t(
                  "Online Admission Application",
                  "অনলাইন ভর্তি আবেদন",
                )}
              </h2>

              <p className="mt-1 text-xs text-gold-foreground">
                {t(
                  "Please provide accurate information.",
                  "সঠিক তথ্য প্রদান করুন।",
                )}
              </p>
              
              <AdmissionSuccessModal
                open={submitted}
                studentName={submittedStudentName}
                applicationId={submittedApplicationId}
                onPrint={handlePrintApplication}
                onDone={() => {
                  setSubmitted(false);
                  setSubmittedApplicationId("");
                  setSubmittedStudentName("");
                  setLookupResult(null);
                }}
              />

              <form
                id="admission-form"
                onSubmit={onSubmit}
                className="mt-6 space-y-8"
                noValidate
              >
                <input
                  type="hidden"
                  name="applicationType"
                  value={applicationType}
                />

                  {/*########################### ==========================================
                      1. STUDENT INFORMATION
                    ========================================== */}


                  {/* ==========================================
                      EXISTING STUDENT
                      Show ONLY ID search before student is found
                  ========================================== */}

                  {applicationType === "old" && !studentFound ? (
                    <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.03] p-5 shadow-sm">

                      <div className="mb-4">
                        <h4 className="text-base font-bold text-primary">
                          {t(
                            "Find Existing Student",
                            "পুরাতন শিক্ষার্থী খুঁজুন",
                          )}
                        </h4>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {t(
                            "Enter the student's ID to continue the application.",
                            "আবেদন চালিয়ে যেতে শিক্ষার্থীর আইডি দিন।",
                          )}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">

                        <Field
                          label={t(
                            "Student ID",
                            "শিক্ষার্থী আইডি",
                          )}
                        >
                          <input
                            name="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => {
                              setStudentId(e.target.value);
                              setStudentLookupError("");
                            }}
                            placeholder="AIA-2027-0001"
                            autoComplete="off"
                            className={inputClass}
                          />
                        </Field>

                        <button
                          type="button"
                          onClick={async () => {
                            const id = studentId.trim();

                            if (!id) {
                              setStudentLookupError(
                                t(
                                  "Please enter a Student ID.",
                                  "অনুগ্রহ করে শিক্ষার্থী আইডি দিন।",
                                ),
                              );
                              return;
                            }

                            setStudentLookupError("");
                            setStudentFound(false);
                            setExistingStudent(null);
                            setStudentLookupLoading(true);

                            try {
                              const { data, error } = await supabase.rpc(
                                "find_existing_student",
                                {
                                  p_student_id: id,
                                },
                              );

                              if (error) {
                                console.error("Student lookup error:", error);
                                setStudentLookupError(
                                  t(
                                    "Unable to search student. Please try again.",
                                    "শিক্ষার্থী খুঁজতে সমস্যা হয়েছে।",
                                  ),
                                );
                                return;
                              }

                              if (!data?.found) {
                                setStudentLookupError(
                                  t(
                                    "Student ID was not found.",
                                    "এই শিক্ষার্থী আইডি পাওয়া যায়নি।",
                                  ),
                                );
                                return;
                              }

                              setExistingStudent(data);
                              setStudentFound(true);
                              setStudentLookupError("");
                              setStudentId(data.student_id);

                              // Keep the original saved address relationship
                              setSameAddress(
                                data.present_same_as_permanent ?? false,
                              );
                            } finally {
                              setStudentLookupLoading(false);
                            }
                          }}
                          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                        >
                          {studentLookupLoading
                            ? t("Searching...", "খোঁজা হচ্ছে...")
                            : t("Find Student", "শিক্ষার্থী খুঁজুন")}
                        </button>

                      </div>

                      {studentLookupError ? (
                        <p className="mt-3 text-sm font-medium text-destructive">
                          {studentLookupError}
                        </p>
                      ) : null}

                    </div>
                  ) : null}

                  {/* ==========================================
                      FULL APPLICATION FORM
                      New student OR existing student found
                  ========================================== */}

                  {applicationType === "new" || studentFound ? (
                    <>
                      <section>
                        <h3 className="border-b pb-2 text-lg font-bold text-primary">
                          {t(
                            "1. Student Information",
                            "১. শিক্ষার্থীর তথ্য",
                          )}
                        </h3>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">

                      {/* Student Name */}

                      <Field
                        label={t(
                          "Student's Name",
                          "শিক্ষার্থীর নাম",
                        )}
                        hint={errors.student_name}
                      >
                        <input
                          name="student_name"
                          maxLength={100}
                          required
                          className={inputClass}
                        />
                      </Field>

                      {/* Applying For */}

                      <Field
                        label={t(
                          "Applying For",
                          "যে শ্রেণিতে ভর্তি হতে চান",
                        )}
                        hint={errors.applying_for}
                      >
                       <select
                        name="applying_for"
                        defaultValue=""
                        required
                        className={inputClass}
                      >
                        <option value="" disabled>
                          {t("Select Class", "শ্রেণি নির্বাচন করুন")}
                        </option>

                        {classOptions.map((option) => (
                          <option
                            key={option.en}
                            value={option.bn}
                          >
                            {t(option.en, option.bn)}
                          </option>
                        ))}
                      </select>
                      </Field>

                      {/* Existing Student ID */}

                      {applicationType === "old" && studentFound ? (
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/[0.03] px-4 py-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  "Existing Student ID",
                                  "বর্তমান শিক্ষার্থী আইডি",
                                )}
                              </p>

                              <p className="mt-0.5 font-semibold text-primary">
                                {studentId}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setStudentFound(false);
                                setStudentId("");
                              }}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              {t(
                                "Change ID",
                                "আইডি পরিবর্তন করুন",
                              )}
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Date of Birth */}

                      <Field
                        label={t(
                          "Date of Birth",
                          "জন্ম তারিখ",
                        )}
                        hint={errors.date_of_birth}
                      >
                        <input
                          name="date_of_birth"
                          type="date"
                          required
                          className={inputClass}
                        />
                      </Field>

                      {/* Birth Registration */}

                      <Field
                        label={t(
                          "Birth Registration No.",
                          "জন্ম নিবন্ধন নম্বর",
                        )}
                        hint={errors.birth_registration_no}
                      >
                        <input
                          name="birth_registration_no"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={30}
                          required
                          className={inputClass}
                          onInput={(e) => {
                            e.currentTarget.value = e.currentTarget.value.replace(
                              /[^0-9]/g,
                              "",
                            );
                          }}
                        />
                      </Field>

                      {/* Blood Group */}

                      <Field
                        label={t(
                          "Blood Group",
                          "রক্তের গ্রুপ",
                        )}
                        hint={errors.blood_group}
                      >
                        <select
                          name="blood_group"
                          defaultValue=""
                          className={inputClass}
                        >
                          <option value="">
                            {t(
                              "Select blood group",
                              "রক্তের গ্রুপ নির্বাচন করুন",
                            )}
                          </option>

                          {bloodGroups.map((group) => (
                            <option
                              key={group}
                              value={group}
                            >
                              {group}
                            </option>
                          ))}
                        </select>
                      </Field>

                      {/* Gender */}

                      <Field
                        label={t(
                          "Gender",
                          "লিঙ্গ",
                        )}
                        hint={errors.gender}
                      >
                        <div className="flex gap-6 pt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              defaultChecked
                              readOnly
                              onClick={(e) => {
                                if (applicationType === "old" && studentFound) {
                                  e.preventDefault();
                                }
                              }}
                            />
                            {t("Male", "পুরুষ")}
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              readOnly
                              onClick={(e) => {
                                if (applicationType === "old" && studentFound) {
                                  e.preventDefault();
                                }
                              }}
                            />
                            {t("Female", "মহিলা")}
                          </label>
                        </div>
                      </Field>

                      {/* Photo */}

                      <div className="sm:col-span-2">
                        <Field
                          label={t(
                            "Student Photograph",
                            "শিক্ষার্থীর ছবি",
                          )}
                          hint={errors.photo}
                        >
                          <div className="flex flex-wrap items-center gap-5">

                            <div className="grid size-28 place-items-center overflow-hidden rounded-lg border bg-muted">
                              {photoPreview ? (
                                <img
                                  src={photoPreview}
                                  alt={t(
                                    "Student preview",
                                    "শিক্ষার্থীর ছবি",
                                  )}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <User className="size-10 text-muted-foreground" />
                              )}
                            </div>

                            {!isExistingStudent && (
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                                <Upload className="size-4" />

                                {t(
                                  "Choose Photo",
                                  "ছবি নির্বাচন করুন",
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhoto}
                                  className="hidden"
                                />
                              </label>
                            )}

                            {!isExistingStudent && (
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  "Maximum 1 MB.",
                                  "সর্বোচ্চ ১ MB।",
                                )}
                              </p>
                            )}

                          </div>
                        </Field>
                      </div>

                    </div>
                  </section>
            
                    {/* ==========================================
                      2. PARENTS
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "2. Parents' Information",
                          "২. পিতা-মাতার তথ্য",
                        )}
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <Field
                          label={t(
                            "Father's Name",
                            "পিতার নাম",
                          )}
                          hint={errors.father_name}
                        >
                          <input
                            name="father_name"
                            maxLength={100}
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Mother's Name",
                            "মাতার নাম",
                          )}
                          hint={errors.mother_name}
                        >
                          <input
                            name="mother_name"
                            maxLength={100}
                            required
                            className={inputClass}
                          />
                        </Field>

                      </div>
                    </section>

                    {/* ==========================================
                      3. PERMANENT ADDRESS
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "3. Permanent Address",
                          "৩. স্থায়ী ঠিকানা",
                        )}
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <Field
                          label={t("Village", "গ্রাম")}
                          hint={errors.permanent_village}
                        >
                          <input
                            name="permanent_village"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Post Office",
                            "ডাকঘর",
                          )}
                          hint={errors.permanent_post_office}
                        >
                          <input
                            name="permanent_post_office"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Upazila",
                            "উপজেলা",
                          )}
                          hint={errors.permanent_upazila}
                        >
                          <input
                            name="permanent_upazila"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "District",
                            "জেলা",
                          )}
                          hint={errors.permanent_district}
                        >
                          <input
                            name="permanent_district"
                            required
                            className={inputClass}
                          />
                        </Field>

                      </div>
                    </section>

                    {/* ==========================================
                      4. PRESENT ADDRESS
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "4. Present Address",
                          "৪. বর্তমান ঠিকানা",
                        )}
                      </h3>

                      <label className="mt-4 flex items-center gap-2 text-sm font-medium">
                       <input
                          type="checkbox"
                          checked={sameAddress}
                          disabled={isExistingStudent}
                          onChange={(e) => {
                            if (isExistingStudent) return;
                            setSameAddress(e.target.checked);
                          }}
                        />

                        {t(
                          "Same as permanent address",
                          "স্থায়ী ঠিকানার মতোই",
                        )}
                      </label>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <Field
                          label={t("Village", "গ্রাম")}
                          hint={errors.present_village}
                        >
                          <input
                            name="present_village"
                            disabled={sameAddress}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Post Office",
                            "ডাকঘর",
                          )}
                          hint={errors.present_post_office}
                        >
                          <input
                            name="present_post_office"
                            disabled={sameAddress}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Upazila",
                            "উপজেলা",
                          )}
                          hint={errors.present_upazila}
                        >
                          <input
                            name="present_upazila"
                            disabled={sameAddress}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "District",
                            "জেলা",
                          )}
                          hint={errors.present_district}
                        >
                          <input
                            name="present_district"
                            disabled={sameAddress}
                            className={inputClass}
                          />
                        </Field>

                      </div>
                    </section>

                    {/* ==========================================
                      5. GUARDIAN
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "5. Guardian Information",
                          "৫. অভিভাবকের তথ্য",
                        )}
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <Field
                          label={t(
                            "Guardian's Name",
                            "অভিভাবকের নাম",
                          )}
                          hint={errors.guardian_name}
                        >
                          <input
                            name="guardian_name"
                            maxLength={100}
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Relationship",
                            "সম্পর্ক",
                          )}
                          hint={errors.guardian_relation}
                        >
                          <select
                            name="guardian_relation"
                            defaultValue="Father"
                            className={inputClass}
                          >
                            {guardianRelations.map(
                              (relation) => (
                                <option
                                  key={relation}
                                  value={relation}
                                >
                                  {relation}
                                </option>
                              ),
                            )}
                          </select>
                        </Field>

                        <Field
                          label={t(
                            "Profession",
                            "পেশা",
                          )}
                          hint={errors.guardian_profession}
                        >
                          <input
                            name="guardian_profession"
                            maxLength={100}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Mobile Number",
                            "মোবাইল নম্বর",
                          )}
                          hint={errors.phone}
                        >
                          <input
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={20}
                            required
                            className={inputClass}
                            onInput={(e) => {
                              e.currentTarget.value = e.currentTarget.value.replace(
                                /[^0-9]/g,
                                "",
                              );
                            }}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Email Address",
                            "ইমেইল ঠিকানা",
                          )}
                          hint={errors.email}
                        >
                          <input
                            name="email"
                            type="email"
                            maxLength={255}
                          
                            className={inputClass}
                          />
                        </Field>

                        <div className="sm:col-span-2">
                          <Field
                            label={t(
                              "Guardian's Address",
                              "অভিভাবকের ঠিকানা",
                            )}
                            hint={errors.guardian_address}
                          >
                            <textarea
                              name="guardian_address"
                              rows={3}
                              maxLength={500}
                              required
                              className={inputClass}
                            />
                          </Field>
                        </div>

                       <div className="sm:col-span-2">
                        <Field
                          label={t(
                            "Nationality",
                            "জাতীয়তা",
                          )}
                          hint={errors.nationality}
                        >
                          <input
                            name="nationality"
                            value="বাংলাদেশী"
                            readOnly
                            className={`${inputClass} cursor-not-allowed`}
                            tabIndex={-1}
                            aria-readonly="true"
                          />
                        </Field>
                      </div>

                      </div>
                    </section>

                    {/* ==========================================
                      6. PREVIOUS INSTITUTION
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "6. Previous Institution",
                          "৬. পূর্ববর্তী প্রতিষ্ঠানের তথ্য",
                        )}
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <Field
                          label={t(
                            "Previous Institution",
                            "পূর্ববর্তী প্রতিষ্ঠান",
                          )}
                        >
                          <input
                            name="previous_institution"
                            maxLength={200}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Previous Class",
                            "পূর্ববর্তী শ্রেণি",
                          )}
                        >
                          <input
                            name="previous_class"
                            maxLength={50}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Previous Student No.",
                            "পূর্ববর্তী শিক্ষার্থী নম্বর",
                          )}
                        >
                          <input
                            name="previous_student_no"
                            maxLength={50}
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label={t(
                            "Previous Date",
                            "তারিখ",
                          )}
                        >
                          <input
                            name="previous_date"
                            type="date"
                            className={inputClass}
                          />
                        </Field>

                      </div>
                    </section>

                    {/* ==========================================
                      7. ADDITIONAL INFORMATION
                    ========================================== */}

                    <section>
                      <h3 className="border-b pb-2 text-lg font-bold text-primary">
                        {t(
                          "7. Additional Information",
                          "৭. অতিরিক্ত তথ্য",
                        )}
                      </h3>

                      <div className="mt-5">
                        <Field
                          label={t(
                            "Special Requirement / Student Information",
                            "বিশেষ প্রয়োজন / শিক্ষার্থী সম্পর্কে তথ্য",
                          )}
                        >
                          <textarea
                            name="special_requirement"
                            rows={4}
                            maxLength={1000}
                            className={inputClass}
                            placeholder={t(
                              "Write any important information here...",
                              "প্রয়োজনীয় কোনো তথ্য এখানে লিখুন...",
                            )}
                          />
                        </Field>
                      </div>
                    </section>

                    {/* ==========================================
                      DECLARATION
                    ========================================== */}

                    <section className="rounded-lg border bg-muted/40 p-5">

                      <h3 className="font-bold text-primary">
                        {t(
                          "Declaration",
                          "ঘোষণা",
                        )}
                      </h3>

                      <label className="mt-4 flex items-start gap-3 text-sm leading-6">
                        <input
                          type="checkbox"
                          name="declaration_accepted"
                          required
                          className="mt-1"
                        />

                        <span>
                          {t(
                            "I declare that all information provided in this application is true and correct. I agree to follow the rules and regulations of Al Eman Islamic Academy.",
                            "আমি ঘোষণা করছি যে এই আবেদনে প্রদত্ত সকল তথ্য সঠিক ও সত্য। আমি আল ইমান ইসলামিক একাডেমির সকল নিয়ম ও বিধি মেনে চলতে সম্মত।",
                          )}
                        </span>
                      </label>

                      {errors.declaration_accepted ? (
                        <p className="mt-2 text-sm text-destructive">
                          {errors.declaration_accepted}
                        </p>
                      ) : null}

                    </section>

                    {/* ==========================================
                      SUBMIT
                    ========================================== */}

                    <ActionButton
                      type="submit"
                      className="w-full py-3"
                    >
                      {t(
                        "Submit Application",
                        "আবেদন জমা দিন",
                      )}
                    </ActionButton>
                    </>
                  ) : null}

              </form>
            </div>
          </div>
        </div>
      </Section>
          
      {/* ---------------------------------------------------
                          Previously Submitted section
       --------------------------------------------------- */}

   {/*   <Section>
        <SectionTitle
          eyebrow={t(
            "Previously Submitted",
            "পূর্বে জমা দেওয়া",
          )}
          title={t(
            "Previously Submitted Form",
            "পূর্বে জমা দেওয়া ফর্ম",
          )}
        />

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t(
                "Already submitted an application? Search using your Admission ID and Date of Birth to view your submitted form.",
                "ইতোমধ্যে আবেদন জমা দিয়েছেন? আপনার জমা দেওয়া ফর্ম দেখতে Admission ID এবং জন্মতারিখ দিয়ে অনুসন্ধান করুন।",
              )}
            </p>

            <form
              onSubmit={handleApplicationLookup}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <Field
                label={t(
                  "Admission ID",
                  "Admission ID",
                )}
              >
                <input
                  type="text"
                  value={lookupApplicationId}
                  onChange={(e) =>
                    setLookupApplicationId(
                      e.target.value,
                    )
                  }
                  placeholder="e.g. APP-1786259048999"
                  className={inputClass}
                />
              </Field>

              <Field
                label={t(
                  "Date of Birth",
                  "জন্মতারিখ",
                )}
              >
                <input
                  type="date"
                  value={lookupDateOfBirth}
                  onChange={(e) =>
                    setLookupDateOfBirth(
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <ActionButton
                  type="submit"
                  className="w-full py-3"
                  disabled={lookupLoading}
                >
                  {lookupLoading
                    ? t(
                        "Searching...",
                        "অনুসন্ধান করা হচ্ছে...",
                      )
                    : t(
                        "Search & View",
                        "অনুসন্ধান ও দেখুন",
                      )}
                </ActionButton>
              </div>
            </form>

            {lookupError ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {lookupError}
              </div>
            ) : null}

            {lookupResult ? (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-muted/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t(
                        "Application Found",
                        "আবেদন পাওয়া গেছে",
                      )}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-foreground">
                      {lookupResult.student_name}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>
                          {t(
                            "Admission ID:",
                            "Admission ID:",
                          )}
                        </strong>{" "}
                        {lookupResult.application_id}
                      </p>

                      <p>
                        <strong>
                          {t(
                            "Class:",
                            "শ্রেণি:",
                          )}
                        </strong>{" "}
                        {lookupResult.applying_for}
                      </p>

                      <p>
                        <strong>
                          {t(
                            "Date of Birth:",
                            "জন্মতারিখ:",
                          )}
                        </strong>{" "}
                        {lookupResult.date_of_birth}
                      </p>

                      <p>
                        <strong>
                          {t(
                            "Status:",
                            "স্ট্যাটাস:",
                          )}
                        </strong>{" "}
                        {lookupResult.status}
                      </p>
                    </div>
                  </div>

                  <ActionButton
                    type="button"
                    className="shrink-0"
                    onClick={handlePrintApplication}
                  >
                    🖨{" "}
                    {t(
                      "Print Application",
                      "আবেদন প্রিন্ট করুন",
                    )}
                  </ActionButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Section>
   */}
    </>
  );
}