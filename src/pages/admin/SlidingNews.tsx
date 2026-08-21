import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Megaphone,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

type SlidingNewsItem = {
  id: string;
  label_en: string;
  label_bn: string;
  message_en: string;
  message_bn: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
};

type FormState = {
  label_en: string;
  label_bn: string;
  message_en: string;
  message_bn: string;
  link: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  label_en: "Latest",
  label_bn: "সর্বশেষ",
  message_en: "",
  message_bn: "",
  link: "",
  is_active: true,
};

export default function SlidingNews() {
  const { t } = useLang();

  const [items, setItems] = useState<SlidingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  /*
   * ==========================================================
   * LOAD
   * ==========================================================
   */

  const loadItems = async () => {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("sliding_news")
        .select("*")
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Sliding news loading error:",
        error,
      );

      toast.error(
        t(
          "Unable to load sliding news.",
          "স্লাইডিং নিউজ লোড করা যায়নি।",
        ),
      );

      setItems([]);
    } else {
      setItems(
        (data ?? []) as SlidingNewsItem[],
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadItems();
  }, []);

  /*
   * ==========================================================
   * OPEN NEW
   * ==========================================================
   */

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  /*
   * ==========================================================
   * OPEN EDIT
   * ==========================================================
   */

  const openEdit = (
    item: SlidingNewsItem,
  ) => {
    setEditingId(item.id);

    setForm({
      label_en: item.label_en,
      label_bn: item.label_bn,
      message_en: item.message_en,
      message_bn: item.message_bn,
      link: item.link ?? "",
      is_active: item.is_active,
    });

    setShowForm(true);
  };

  /*
   * ==========================================================
   * SAVE
   * ==========================================================
   */

  const saveItem = async () => {
    if (
      !form.message_en.trim() &&
      !form.message_bn.trim()
    ) {
      toast.error(
        t(
          "Enter at least one news message.",
          "কমপক্ষে একটি নিউজ বার্তা লিখুন।",
        ),
      );

      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error } =
          await supabase
            .from("sliding_news")
            .update({
              label_en:
                form.label_en.trim(),
              label_bn:
                form.label_bn.trim(),
              message_en:
                form.message_en.trim(),
              message_bn:
                form.message_bn.trim(),
              link:
                form.link.trim() ||
                null,
              is_active:
                form.is_active,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", editingId);

        if (error) {
          throw error;
        }

        toast.success(
          t(
            "Sliding news updated.",
            "স্লাইডিং নিউজ আপডেট হয়েছে।",
          ),
        );
      } else {
        const nextOrder =
          items.length > 0
            ? Math.max(
                ...items.map(
                  (item) =>
                    item.sort_order,
                ),
              ) + 1
            : 1;

        const { error } =
          await supabase
            .from("sliding_news")
            .insert({
              label_en:
                form.label_en.trim(),
              label_bn:
                form.label_bn.trim(),
              message_en:
                form.message_en.trim(),
              message_bn:
                form.message_bn.trim(),
              link:
                form.link.trim() ||
                null,
              is_active:
                form.is_active,
              sort_order:
                nextOrder,
            });

        if (error) {
          throw error;
        }

        toast.success(
          t(
            "Sliding news added.",
            "স্লাইডিং নিউজ যোগ হয়েছে।",
          ),
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadItems();
    } catch (error) {
      console.error(
        "Sliding news save error:",
        error,
      );

      toast.error(
        t(
          "Unable to save sliding news.",
          "স্লাইডিং নিউজ সংরক্ষণ করা যায়নি।",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  const deleteItem = async (
    id: string,
  ) => {
    const confirmed =
      window.confirm(
        t(
          "Delete this sliding news?",
          "এই স্লাইডিং নিউজটি মুছে ফেলবেন?",
        ),
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("sliding_news")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "Sliding news delete error:",
        error,
      );

      toast.error(
        t(
          "Unable to delete sliding news.",
          "স্লাইডিং নিউজ মুছে ফেলা যায়নি।",
        ),
      );

      return;
    }

    toast.success(
      t(
        "Sliding news deleted.",
        "স্লাইডিং নিউজ মুছে ফেলা হয়েছে।",
      ),
    );

    await loadItems();
  };

  /*
   * ==========================================================
   * TOGGLE ACTIVE
   * ==========================================================
   */

  const toggleActive = async (
    item: SlidingNewsItem,
  ) => {
    const { error } =
      await supabase
        .from("sliding_news")
        .update({
          is_active:
            !item.is_active,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", item.id);

    if (error) {
      toast.error(
        t(
          "Unable to change status.",
          "স্ট্যাটাস পরিবর্তন করা যায়নি।",
        ),
      );

      return;
    }

    await loadItems();
  };

  /*
   * ==========================================================
   * REORDER
   * ==========================================================
   */

  const moveItem = async (
    index: number,
    direction:
      | "up"
      | "down",
  ) => {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const current =
      items[index];

    const target =
      items[targetIndex];

    await Promise.all([
      supabase
        .from("sliding_news")
        .update({
          sort_order:
            target.sort_order,
        })
        .eq("id", current.id),

      supabase
        .from("sliding_news")
        .update({
          sort_order:
            current.sort_order,
        })
        .eq("id", target.id),
    ]);

    await loadItems();
  };

  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t(
              "Sliding News",
              "স্লাইডিং নিউজ",
            )}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Control the announcements shown in the homepage scrolling ticker.",
              "হোমপেজের চলমান নিউজ টিকারে প্রদর্শিত ঘোষণা নিয়ন্ত্রণ করুন।",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="size-4" />

          {t(
            "Add Sliding News",
            "স্লাইডিং নিউজ যোগ করুন",
          )}
        </button>
      </div>

      {/* Form */}

      {showForm ? (
        <div className="surface-card p-6 sm:p-8">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">
                {editingId
                  ? t(
                      "Edit Sliding News",
                      "স্লাইডিং নিউজ সম্পাদনা",
                    )
                  : t(
                      "Add Sliding News",
                      "স্লাইডিং নিউজ যোগ করুন",
                    )}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "English and Bangla messages can be completely different.",
                  "ইংরেজি ও বাংলা বার্তা সম্পূর্ণ আলাদা হতে পারে।",
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            {/* English Label */}

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                {t(
                  "Label (English)",
                  "লেবেল (ইংরেজি)",
                )}
              </span>

              <input
                value={form.label_en}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    label_en:
                      event.target.value,
                  }))
                }
                placeholder="Latest"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            {/* Bangla Label */}

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                {t(
                  "Label (Bangla)",
                  "লেবেল (বাংলা)",
                )}
              </span>

              <input
                value={form.label_bn}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    label_bn:
                      event.target.value,
                  }))
                }
                placeholder="সর্বশেষ"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            {/* English Message */}

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                {t(
                  "Message (English)",
                  "বার্তা (ইংরেজি)",
                )}
              </span>

              <textarea
                value={form.message_en}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message_en:
                      event.target.value,
                  }))
                }
                rows={3}
                placeholder="Second Term Exam routine published"
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            {/* Bangla Message */}

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                {t(
                  "Message (Bangla)",
                  "বার্তা (বাংলা)",
                )}
              </span>

              <textarea
                value={form.message_bn}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message_bn:
                      event.target.value,
                  }))
                }
                rows={3}
                placeholder="দ্বিতীয় সাময়িক পরীক্ষার রুটিন প্রকাশিত হয়েছে"
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            {/* Link */}

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">
                {t(
                  "Link (Optional)",
                  "লিংক (ঐচ্ছিক)",
                )}
              </span>

              <input
                value={form.link}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    link: event.target.value,
                  }))
                }
                placeholder="/results"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

          </div>

          {/* Active */}

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active:
                    event.target.checked,
                }))
              }
              className="size-4 accent-primary"
            />

            <span className="text-sm font-semibold">
              {t(
                "Show this news on homepage",
                "এই নিউজটি হোমপেজে দেখান",
              )}
            </span>
          </label>

          {/* Actions */}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              {t(
                "Cancel",
                "বাতিল",
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                void saveItem()
              }
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Save className="size-4" />

              {saving
                ? t(
                    "Saving...",
                    "সংরক্ষণ হচ্ছে...",
                  )
                : t(
                    "Save",
                    "সংরক্ষণ",
                  )}
            </button>
          </div>
        </div>
      ) : null}

      {/* List */}

      <div className="surface-card overflow-hidden">

        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />

            <h2 className="font-bold text-primary">
              {t(
                "Homepage News",
                "হোমপেজ নিউজ",
              )}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t(
              "Loading...",
              "লোড হচ্ছে...",
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Megaphone className="mx-auto size-10 text-muted-foreground/40" />

            <p className="mt-3 text-sm font-semibold">
              {t(
                "No sliding news yet.",
                "এখনো কোনো স্লাইডিং নিউজ নেই।",
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Add your first homepage announcement.",
                "প্রথম হোমপেজ ঘোষণা যোগ করুন।",
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">

            {items.map(
              (item, index) => (
                <div
                  key={item.id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {item.label_en}
                        </span>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {item.label_bn}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void toggleActive(
                              item,
                            )
                          }
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {item.is_active
                            ? t(
                                "Active",
                                "চালু",
                              )
                            : t(
                                "Hidden",
                                "বন্ধ",
                              )}
                        </button>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {item.message_en}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.message_bn}
                      </p>

                      {item.link ? (
                        <p className="mt-2 text-xs text-primary">
                          → {item.link}
                        </p>
                      ) : null}

                    </div>

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          void moveItem(
                            index,
                            "up",
                          )
                        }
                        disabled={
                          index === 0
                        }
                        className="rounded-lg border border-border p-2 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void moveItem(
                            index,
                            "down",
                          )
                        }
                        disabled={
                          index ===
                          items.length - 1
                        }
                        className="rounded-lg border border-border p-2 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(item)
                        }
                        className="rounded-lg border border-border p-2 text-primary hover:bg-primary/5"
                        title="Edit"
                      >
                        <Edit3 className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteItem(
                            item.id,
                          )
                        }
                        className="rounded-lg border border-destructive/20 p-2 text-destructive hover:bg-destructive/5"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>

                    </div>
                  </div>
                </div>
              ),
            )}

          </div>
        )}
      </div>
    </div>
  );
}