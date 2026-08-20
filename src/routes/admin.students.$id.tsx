import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

type Student = {
  id: string;
  student_id: string;
  student_name: string;
  applying_for: string | null;
  date_of_birth: string | null;
  birth_registration_no: string | null;
  blood_group: string | null;
  gender: string | null;

  father_name: string | null;
  mother_name: string | null;

  permanent_village: string | null;
  permanent_post_office: string | null;
  permanent_upazila: string | null;
  permanent_district: string | null;

  present_village: string | null;
  present_post_office: string | null;
  present_upazila: string | null;
  present_district: string | null;

  nationality: string | null;

  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_profession: string | null;

  phone: string | null;
  email: string | null;
  guardian_address: string | null;

  previous_institution: string | null;
  previous_class: string | null;
  previous_student_no: string | null;
  previous_date: string | null;

  special_requirement: string | null;
  photo_url: string | null;

  academic_year: string | null;
  status: string | null;

  created_at: string;
  updated_at: string;

  application_id: string | null;
};
type Application = {
  id: string;
  application_id: string;
  application_type: string | null;
  student_id: string | null;
  student_name: string | null;
  applying_for: string | null;
  academic_year: string | null;
  status: string | null;
  created_at: string;
};
export const Route = createFileRoute("/admin/students/$id")({
  component: StudentProfilePage,
});

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 text-sm font-bold text-primary">
        {title}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function StudentProfilePage() {
  const { t } = useLang();
  const { id } = Route.useParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStudent = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(
          "Failed to load student:",
          error,
        );

        setError(
          t(
            "Failed to load student information.",
            "শিক্ষার্থীর তথ্য লোড করা যায়নি।",
          ),
        );

        setStudent(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          t(
            "Student not found.",
            "শিক্ষার্থী পাওয়া যায়নি।",
          ),
        );

        setStudent(null);
        setLoading(false);
        return;
      }

        const studentData = data as Student;

        setStudent(studentData);
        const { data: applicationData, error: applicationError } =
            await supabase
                .from("applications")
                .select(
                "id, application_id, application_type, student_id, student_name, applying_for, academic_year, status, created_at"
                )
                .eq("student_id", studentData.student_id)
                .order("created_at", { ascending: false });

            if (applicationError) {
            console.error(
                "Failed to load application history:",
                applicationError
            );
            setApplications([]);
            } else {
            setApplications((applicationData ?? []) as Application[]);
            }
        if (studentData.photo_url) {
        const { data: signedPhoto, error: photoError } =
            await supabase.storage
            .from("student-photos")
            .createSignedUrl(studentData.photo_url, 60 * 60);

        if (photoError) {
            console.error("Failed to load student photo:", photoError);
            setPhotoUrl(null);
        } else {
            setPhotoUrl(signedPhoto.signedUrl);
        }
        } else {
        setPhotoUrl(null);
        }

        setLoading(false);
        };

    void loadStudent();

    return () => {
      mounted = false;
    };
  }, [id, t]);

  if (loading) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t(
            "Loading student...",
            "শিক্ষার্থীর তথ্য লোড হচ্ছে...",
          )}
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link to="/admin/$module" params={{ module: "students" }}>
            <ArrowLeft className="size-4" />
            {t("Back to Students", "শিক্ষার্থী তালিকায় ফিরুন")}
          </Link>
        </Button>

        <div className="surface-card p-8 text-center">
          <p className="text-sm font-semibold text-destructive">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link to="/admin/$module" params={{ module: "students" }}>
            <ArrowLeft className="size-4" />
            {t("Back to Students", "শিক্ষার্থী তালিকায় ফিরুন")}
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-4" />
          {student.academic_year || "—"}
        </div>
      </div>

      {/* Student Header */}
      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={student.student_name}
                    className="size-full object-cover"
                />
                ) : (
                <UserRound className="size-10 text-primary" />
                )}
          </div> 

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("Permanent Student ID", "স্থায়ী স্টুডেন্ট আইডি")}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-primary">
              {student.student_id}
            </h1>

            <p className="mt-1 text-lg font-semibold text-foreground">
              {student.student_name}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {student.applying_for || "—"}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                {student.gender || "—"}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                {student.status || "—"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {student.phone ? (
              <a
                href={`tel:${student.phone}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="size-4" />
                {student.phone}
              </a>
            ) : null}

            {student.email ? (
              <a
                href={`mailto:${student.email}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="size-4" />
                {student.email}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Basic Information */}
      <Section title={t("Personal Information", "ব্যক্তিগত তথ্য")}>
        <Field
          label={t("Student ID", "স্টুডেন্ট আইডি")}
          value={student.student_id}
        />

        <Field
          label={t("Full Name", "পূর্ণ নাম")}
          value={student.student_name}
        />

        <Field
          label={t("Class", "শ্রেণি")}
          value={student.applying_for}
        />

        <Field
          label={t("Date of Birth", "জন্ম তারিখ")}
          value={student.date_of_birth}
        />

        <Field
          label={t("Birth Registration No.", "জন্ম নিবন্ধন নং")}
          value={student.birth_registration_no}
        />

        <Field
          label={t("Blood Group", "রক্তের গ্রুপ")}
          value={student.blood_group}
        />

        <Field
          label={t("Gender", "লিঙ্গ")}
          value={student.gender}
        />

        <Field
          label={t("Nationality", "জাতীয়তা")}
          value={student.nationality}
        />

        <Field
          label={t("Academic Year", "শিক্ষাবর্ষ")}
          value={student.academic_year}
        />

        <Field
          label={t("Status", "অবস্থা")}
          value={student.status}
        />
      </Section>

      {/* Parents */}
      <Section title={t("Parents & Guardian", "পিতা-মাতা ও অভিভাবক")}>
        <Field
          label={t("Father's Name", "পিতার নাম")}
          value={student.father_name}
        />

        <Field
          label={t("Mother's Name", "মাতার নাম")}
          value={student.mother_name}
        />

        <Field
          label={t("Guardian Name", "অভিভাবকের নাম")}
          value={student.guardian_name}
        />

        <Field
          label={t("Guardian Relation", "অভিভাবকের সম্পর্ক")}
          value={student.guardian_relation}
        />

        <Field
          label={t("Guardian Profession", "অভিভাবকের পেশা")}
          value={student.guardian_profession}
        />

        <Field
          label={t("Phone", "ফোন")}
          value={student.phone}
        />

        <Field
          label={t("Email", "ইমেইল")}
          value={student.email}
        />

        <Field
          label={t("Guardian Address", "অভিভাবকের ঠিকানা")}
          value={student.guardian_address}
        />
      </Section>

      {/* Permanent Address */}
      <Section title={t("Permanent Address", "স্থায়ী ঠিকানা")}>
        <Field
          label={t("Village", "গ্রাম")}
          value={student.permanent_village}
        />

        <Field
          label={t("Post Office", "ডাকঘর")}
          value={student.permanent_post_office}
        />

        <Field
          label={t("Upazila", "উপজেলা")}
          value={student.permanent_upazila}
        />

        <Field
          label={t("District", "জেলা")}
          value={student.permanent_district}
        />
      </Section>

      {/* Present Address */}
      <Section title={t("Present Address", "বর্তমান ঠিকানা")}>
        <Field
          label={t("Village", "গ্রাম")}
          value={student.present_village}
        />

        <Field
          label={t("Post Office", "ডাকঘর")}
          value={student.present_post_office}
        />

        <Field
          label={t("Upazila", "উপজেলা")}
          value={student.present_upazila}
        />

        <Field
          label={t("District", "জেলা")}
          value={student.present_district}
        />
      </Section>

      {/* Previous Institution */}
      <Section title={t("Previous Education", "পূর্ববর্তী শিক্ষাগত তথ্য")}>
        <Field
          label={t("Previous Institution", "পূর্ববর্তী প্রতিষ্ঠান")}
          value={student.previous_institution}
        />

        <Field
          label={t("Previous Class", "পূর্ববর্তী শ্রেণি")}
          value={student.previous_class}
        />

        <Field
          label={t("Previous Student No.", "পূর্ববর্তী শিক্ষার্থী নং")}
          value={student.previous_student_no}
        />

        <Field
          label={t("Previous Date", "পূর্ববর্তী তারিখ")}
          value={student.previous_date}
        />
      </Section>

      {/* Additional */}
      <Section title={t("Additional Information", "অতিরিক্ত তথ্য")}>
        <Field
          label={t("Special Requirement", "বিশেষ প্রয়োজন")}
          value={student.special_requirement}
        />

        <Field
          label={t("Created", "তৈরি হয়েছে")}
          value={student.created_at}
        />

        <Field
          label={t("Last Updated", "সর্বশেষ আপডেট")}
          value={student.updated_at}
        />
      </Section>
      <section className="surface-card p-5">
        <div className="flex items-center justify-between gap-3">
            <div>
            <h2 className="text-sm font-bold text-primary">
                {t("Application History", "আবেদন ইতিহাস")}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
                {t(
                "All applications submitted by this student.",
                "এই শিক্ষার্থীর জমা দেওয়া সকল আবেদন।"
                )}
            </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {applications.length}
            </span>
        </div>

        {applications.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
                {t(
                "No application history found.",
                "কোনো আবেদন ইতিহাস পাওয়া যায়নি।"
                )}
            </p>
            </div>
        ) : (
            <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
                <thead>
                <tr className="border-b bg-muted/40 text-left">
                    <th className="px-3 py-3 font-semibold">
                    {t("Application ID", "আবেদন আইডি")}
                    </th>

                    <th className="px-3 py-3 font-semibold">
                    {t("Academic Year", "শিক্ষাবর্ষ")}
                    </th>

                    <th className="px-3 py-3 font-semibold">
                    {t("Class", "শ্রেণি")}
                    </th>

                    <th className="px-3 py-3 font-semibold">
                    {t("Type", "ধরন")}
                    </th>

                    <th className="px-3 py-3 font-semibold">
                    {t("Date", "তারিখ")}
                    </th>

                    <th className="px-3 py-3 font-semibold">
                    {t("Status", "অবস্থা")}
                    </th>
                </tr>
                </thead>

                <tbody>
                {applications.map((application) => (
                    <tr
                    key={application.id}
                    className="border-b last:border-0"
                    >
                    <td className="px-3 py-3 font-semibold text-primary">
                        {application.application_id}
                    </td>

                    <td className="px-3 py-3">
                        {application.academic_year || "—"}
                    </td>

                    <td className="px-3 py-3">
                        {application.applying_for || "—"}
                    </td>

                    <td className="px-3 py-3">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {application.application_type || "—"}
                        </span>
                    </td>

                    <td className="px-3 py-3">
                        {application.created_at
                        ? new Date(
                            application.created_at
                            ).toLocaleDateString("en-GB")
                        : "—"}
                    </td>

                    <td className="px-3 py-3">
                        <span
                        className={
                            application.status === "Approved"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                            : application.status === "Pending"
                                ? "rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700"
                                : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                        }
                        >
                        {application.status || "—"}
                        </span>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </section>
    </div>
  );
}