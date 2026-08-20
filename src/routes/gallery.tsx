import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { galleryAlbums, galleryItems } from "@/data/site";
import { PageHero, Section } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery | Al Eman Islamic Academy" },
      {
        name: "description",
        content:
          "Photo albums from Al Eman Islamic Academy — campus, academic activities, events and sports, with album filters and lightbox view.",
      },
      { property: "og:title", content: "Photo Gallery — Al Eman Islamic Academy" },
      { property: "og:description", content: "Campus, classroom, event and sports photography albums." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { t, tb } = useLang();
  const [album, setAlbum] = useState("all");
  const [index, setIndex] = useState<number | null>(null);

  const items = galleryItems.filter((i) => album === "all" || i.albumId === album);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  const active = index === null ? null : items[index];

  return (
    <>
      <PageHero
        crumb={t("Gallery", "গ্যালারি")}
        title={t("Photo Gallery", "ছবির গ্যালারি")}
        subtitle={t(
          "Moments from our classrooms, campus, events and playing fields.",
          "আমাদের শ্রেণিকক্ষ, ক্যাম্পাস, অনুষ্ঠান ও খেলার মাঠের মুহূর্তগুলো।",
        )}
      />

      <Section>
        <div className="flex flex-wrap justify-center gap-2">
          {galleryAlbums.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAlbum(a.id);
                setIndex(null);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                album === a.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {tb(a.label)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
              aria-label={tb(item.caption)}
            >
              <img
                src={item.src}
                alt={tb(item.caption)}
                width={900}
                height={650}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-deep/90 to-transparent p-4 text-left text-xs font-semibold text-primary-foreground">
                {tb(item.caption)}
                <span className="mt-0.5 block text-[10px] font-normal opacity-75">{tb(item.album)}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={tb(active.caption)}
          onClick={() => setIndex(null)}
        >
          <button
            onClick={() => setIndex(null)}
            aria-label={t("Close", "বন্ধ")}
            className="absolute right-4 top-4 rounded-full bg-card/15 p-2 text-primary-foreground hover:bg-card/25"
          >
            <X className="size-5" aria-hidden />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
            }}
            aria-label={t("Previous", "পূর্ববর্তী")}
            className="absolute left-4 rounded-full bg-card/15 p-2 text-primary-foreground hover:bg-card/25"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-h-full max-w-4xl">
            <img src={active.src} alt={tb(active.caption)} className="max-h-[75vh] w-full rounded-xl object-contain" />
            <figcaption className="mt-3 text-center text-sm text-primary-foreground">{tb(active.caption)}</figcaption>
          </figure>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === null ? i : (i + 1) % items.length));
            }}
            aria-label={t("Next", "পরবর্তী")}
            className="absolute right-4 rounded-full bg-card/15 p-2 text-primary-foreground hover:bg-card/25"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}
