import { NoticeForm } from "@/components/admin/NoticeForm";
import { useCollection } from "@/lib/admin/store";
import { MarksEntry } from "@/components/admin/MarksEntry";
import { ExamManager } from "@/components/admin/ExamManager";
import { EnrollmentManager } from "@/components/admin/EnrollmentManager";
import { createFileRoute } from "@tanstack/react-router";
import { getModule } from "@/lib/admin/registry";
import { CrudModule } from "@/components/admin/CrudModule";
import { useLang } from "@/lib/i18n";
import { PublishResultsManager } from "@/components/admin/PublishResultsManager";
import TeacherAccess from "@/pages/admin/TeacherAccess";
import SlidingNews from "@/pages/admin/SlidingNews";
export const Route = createFileRoute("/admin/$module")({
  validateSearch: (search: Record<string, unknown>) => ({
    action: typeof search["action"] === "string" ? (search["action"] as string) : undefined,
  }),
  component: ModulePage,
});

/** Sidebar sub-items pass an action; some map to a pre-applied filter. */
const filterByAction: Record<string, string> = {
  exam: "Exam",
  teacher: "Teacher",
  pending: "Pending",
  due: "Due",
  publish: "Yes",
  promote: "all",
  assign: "all",
  sections: "all",
  merit: "all",
};

function NoticeCreate({
  onClose,
}: {
  onClose: () => void;
}) {
  const mod = getModule("notices")!;
  const { create } = useCollection(mod);

  const handleSave = async (notice: {
    title: {
      en: string;
      bn: string;
    };
    category: string;
    date: string;
    image: string;
  }) => {
    await create({
      title: notice.title,
      category: notice.category,
      date: notice.date,
      image: notice.image,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Add new — Notices
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Publish and manage notice board items.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <NoticeForm
          onSave={handleSave}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

function ModulePage() {
  const { module } = Route.useParams();
  const { action } = Route.useSearch();
  const { tb, t } = useLang();
  const mod = getModule(module);

  if (!mod) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">{t("Module not found", "মডিউল পাওয়া যায়নি")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("Pick a module from the sidebar.", "সাইডবার থেকে একটি মডিউল নির্বাচন করুন।")}
        </p>
      </div>
    );
  }

  const initialFilter = action ? filterByAction[action] : undefined;

  return (
    <div className="space-y-4">
  
        {mod.id === "sliding-news" ? (
          <SlidingNews />
        ):mod.id === "teacher-access" ? (
          <TeacherAccess />
        ) : mod.id === "enrollment" ? (
          <EnrollmentManager />
        ) : mod.id === "exams" ? (
          <ExamManager />
        ) : mod.id === "marks" && action === "publish" ? (
          <PublishResultsManager />
        ) : mod.id === "marks" ? (
          <MarksEntry />
        ) : (
        <>
          <CrudModule
            key={`${mod.id}-${action ?? ""}`}
            mod={mod}
            autoCreate={mod.id === "notices" ? false : action === "new"}
            {...(initialFilter && initialFilter !== "all"
              ? { initialFilter }
              : {})}
          />

          {mod.id === "notices" && action === "new" ? (
            <NoticeCreate
              onClose={() => window.history.back()}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
