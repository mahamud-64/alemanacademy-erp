import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
type NoticeFormProps = {
  initialData?: {
    title?: {
      en?: string;
      bn?: string;
    };
    category?: string;
    date?: string;
    image?: string;
  };
  onSave: (notice: {
    title: {
      en: string;
      bn: string;
    };
    category: string;
    date: string;
    image: string;
  }) => void;
  onCancel: () => void;
};

export function NoticeForm({
  initialData,
  onSave,
  onCancel,
}: NoticeFormProps) {
  
  const { t } = useLang();
  const [titleEn, setTitleEn] = useState(initialData?.title?.en ?? "",);
  const [titleBn, setTitleBn] = useState(initialData?.title?.bn ?? "",);
  const [category, setCategory] = useState(initialData?.category ?? "general",);
  const [date, setDate] = useState( initialData?.date ?? "",);
  const [image, setImage] = useState(initialData?.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        setError(
        t(
            "Please select an image file.",
            "অনুগ্রহ করে একটি ছবি নির্বাচন করুন।",
        ),
        );
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        setError(
        t(
            "Image must be smaller than 10 MB.",
            "ছবির আকার ১০ MB-এর কম হতে হবে।",
        ),
        );
        return;
    }

    setError("");
    setImageFile(file);

    // Preview only
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
  };

  const handleSubmit = async () => {
    if (!titleEn.trim() || !titleBn.trim()) {
        setError(
        t(
            "Please enter both English and Bangla titles.",
            "ইংরেজি ও বাংলা উভয় শিরোনাম লিখুন।",
        ),
        );
        return;
    }

    if (!imageFile && !image) {
        setError(
        t(
            "Please upload the notice image.",
            "অনুগ্রহ করে নোটিশের ছবি আপলোড করুন।",
        ),
        );
        return;
    }

    try {
        setUploading(true);
        setError("");

        let imageUrl = image;

        // Upload a newly selected image
        if (imageFile) {
        const extension =
            imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `notice-${Date.now()}.${extension}`;
        const filePath = `notices/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("notice-images")
            .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from("notice-images")
            .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
        }

        onSave({
        title: {
            en: titleEn.trim(),
            bn: titleBn.trim(),
        },
        category,
        date,
        image: imageUrl,
        });
    } catch (error) {
        console.error("Notice image upload failed:", error);

        setError(
        t(
            "Failed to upload notice image. Please try again.",
            "নোটিশের ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।",
        ),
        );
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* English title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          {t("Title — English", "শিরোনাম — ইংরেজি")}
        </label>

        <input
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="Notice title"
        />
      </div>

      {/* Bangla title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          {t("Title — Bangla", "শিরোনাম — বাংলা")}
        </label>

        <input
          value={titleBn}
          onChange={(e) => setTitleBn(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="নোটিশের শিরোনাম"
        />
      </div>

      {/* Category + Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            {t("Category", "ক্যাটাগরি")}
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="general">General</option>
            <option value="exam">Exam</option>
            <option value="admission">Admission</option>
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            {t("Date", "তারিখ")}
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Notice image */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          {t("Notice Image", "নোটিশের ছবি")}
        </label>

        <label
          htmlFor="notice-image-upload"
          className="flex min-h-44 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 transition hover:border-primary hover:bg-primary/5"
        >
          <input
            id="notice-image-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImage}
          />

          {image ? (
            <img
              src={image}
              alt="Notice preview"
              className="max-h-72 w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">
                {t(
                  "Choose Notice Image",
                  "নোটিশের ছবি নির্বাচন করুন",
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG or WEBP · Max 3 MB
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          {t("Cancel", "বাতিল")}
        </button>

        <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          {uploading
            ? t("Uploading...", "আপলোড হচ্ছে...")
            : t("Create", "তৈরি করুন")}
        </button>
      </div>
    </div>
  );
}