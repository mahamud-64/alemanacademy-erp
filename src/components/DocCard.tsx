import { useEffect, useState } from "react";
import { Download, Eye, FileText, Printer, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { DownloadDoc } from "@/data/site";
import { downloadPdf, pdfObjectUrl } from "@/lib/pdf";
import { Badge } from "@/components/ui-kit";

export function DocCard({ doc }: { doc: DownloadDoc }) {
  const { t, tb } = useLang();
  const [preview, setPreview] = useState<string | null>(null);

  const isImage =
    doc.id === "admission-form" || Boolean(doc.image);

  const imageUrl =
    doc.id === "admission-form"
      ? "/admission-form.png"
      : doc.image;

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const lines = [
    { text: tb(doc.description), size: 11, gap: 24 },
    ...(doc.content ?? []).map((line) => ({
      text: line,
      size: 11,
    })),
    { text: "", size: 11 },
    {
      text: "Al Eman Islamic Academy | alemanislamicacademy@gmail.com",
      size: 9,
    },
  ];

  const openPreview = () => {
    if (isImage && imageUrl) {
      setPreview(imageUrl);
      return;
    }

    setPreview(pdfObjectUrl(doc.title.en, lines));
  };

  const handleDownload = () => {
    if (isImage && imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${doc.title.en}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    downloadPdf(doc.id, doc.title.en, lines);
  };

  return (
    <>
      <article className="surface-card flex flex-col p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <FileText className="size-5" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">
              {tb(doc.title)}
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {tb(doc.description)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Badge tone="muted">{tb(doc.category)}</Badge>

          <span>
            {isImage ? "PNG" : "PDF"} · {doc.size}
          </span>

          <span aria-hidden>·</span>

          <span>
            {t("Updated", "হালনাগাদ")}{" "}
            {new Date(doc.updated).toLocaleDateString("en-GB")}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            <Eye className="size-3.5" aria-hidden />
            {t("Preview", "প্রিভিউ")}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            <Download className="size-3.5" aria-hidden />
            {t("Download", "ডাউনলোড")}
          </button>
        </div>
      </article>

      {preview ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={tb(doc.title)}
          onClick={() => setPreview(null)}
        >
          <div
            className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-bold text-primary">
                {tb(doc.title)}
              </h2>

              <div className="flex items-center gap-2">
                {!isImage && (
                  <button
                    type="button"
                    onClick={() => {
                      window.open(preview, "_blank")?.print();
                    }}
                    aria-label={t("Print", "প্রিন্ট")}
                    className="rounded-full p-2 text-primary hover:bg-primary/5"
                  >
                    <Printer className="size-4" aria-hidden />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label={t("Download", "ডাউনলোড")}
                  className="rounded-full p-2 text-primary hover:bg-primary/5"
                >
                  <Download className="size-4" aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  aria-label={t("Close", "বন্ধ")}
                  className="rounded-full p-2 text-primary hover:bg-primary/5"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            {isImage ? (
              <div className="flex flex-1 items-center justify-center overflow-auto bg-muted p-4">
                <div
                  className="bg-white shadow-lg"
                  style={{
                    width: "min(100%, 794px)",
                    minHeight: "1123px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                >
                  <img
                    src={preview}
                    alt={tb(doc.title)}
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <iframe
                src={preview}
                title={tb(doc.title)}
                className="flex-1 bg-muted"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}