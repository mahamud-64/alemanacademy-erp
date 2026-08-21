import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useNotices } from "@/lib/content";
import { downloadPdf, printPage } from "@/lib/pdf";
import { Badge, Section } from "@/components/ui-kit";

export const Route = createFileRoute("/notices/$noticeId")({
  head: () => ({
    meta: [
      { title: "Notice Details | Al Eman Islamic Academy" },
      {
        name: "description",
        content: "Full text of an official notice from Al Eman Islamic Academy, with print, share and PDF download.",
      },
      { property: "og:title", content: "Notice Details — Al Eman Islamic Academy" },
      { property: "og:description", content: "Read, print, share or download this school notice." },
    ],
  }),
  component: NoticeDetails,
});

function NoticeDetails() {
  const { noticeId } = useParams({ from: "/notices/$noticeId" });
  const { t, tb } = useLang();
  const { value: notices } = useNotices();
  const [copied, setCopied] = useState(false);
  const notice = notices.find((n) => n.id === noticeId);

  if (!notice) {
    return (
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-bold text-primary">{t("Notice not found", "নোটিশ পাওয়া যায়নি")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("This notice may have been removed or archived.", "নোটিশটি মুছে ফেলা বা আর্কাইভ করা হতে পারে।")}
          </p>
          <Link to="/notices" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            {t("Back to notice board", "নোটিশ বোর্ডে ফিরুন")}
          </Link>
        </div>
      </Section>
    );
  }

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tb(notice.title), url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const others = notices.filter((n) => n.id !== notice.id).slice(0, 4);

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <Link to="/notices" className="no-print inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> {t("All notices", "সব নোটিশ")}
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="gold">{notice.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(notice.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
           
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-snug text-foreground sm:text-3xl">{tb(notice.title)}</h1>

          <div className="no-print mt-5 flex flex-wrap gap-2">
            <button
              onClick={printPage}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              <Printer className="size-3.5" aria-hidden /> {t("Print", "প্রিন্ট")}
            </button>
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              <Share2 className="size-3.5" aria-hidden /> {copied ? t("Link copied", "লিংক কপি হয়েছে") : t("Share", "শেয়ার")}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              <Download className="size-3.5" aria-hidden />
              {t("Download / Print", "ডাউনলোড / প্রিন্ট")}
            </button>
          </div>

          <div className="mt-7 surface-card p-4 sm:p-6">
            {notice.image ? (
              <img
                src={notice.image}
                alt={tb(notice.title)}
                className="mx-auto h-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t(
                  "Notice image is not available.",
                  "নোটিশের ছবি পাওয়া যায়নি।",
                )}
              </div>
            )}
          </div>
        </article>

        <aside className="no-print">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold">{t("Other notices", "অন্যান্য নোটিশ")}</h2>
          <ul className="mt-4 space-y-3">
            {others.map((n) => (
              <li key={n.id}>
                <Link to="/notices/$noticeId" params={{ noticeId: n.id }} className="surface-card block p-4 hover:bg-muted/60">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("en-GB")}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-foreground">{tb(n.title)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  );
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}
