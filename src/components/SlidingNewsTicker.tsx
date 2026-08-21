import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Link } from "@tanstack/react-router";

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

export function SlidingNewsTicker() {
  const { lang } = useLang();

  const [items, setItems] =
    useState<SlidingNewsItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      const { data, error } = await supabase
        .from("sliding_news")
        .select(
          "id,label_en,label_bn,message_en,message_bn,link,is_active,sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Sliding news loading error:",
          error,
        );
        return;
      }

      if (!cancelled) {
        setItems(
          (data ?? []) as SlidingNewsItem[],
        );
      }
    };

    // Initial load
    void loadNews();

    // Listen for database changes
    const channel = supabase
      .channel("sliding-news-homepage")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sliding_news",
        },
        () => {
          void loadNews();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  /*
   * If there is only one news item,
   * repeat it several times so the ticker
   * never looks empty.
   *
   * If there are multiple items,
   * duplicate the complete sequence once
   * for a seamless loop.
   */
  const tickerItems =
    items.length === 1
      ? Array(8).fill(items[0])
      : [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-border bg-[#F8F0DC]">
      <div className="flex min-h-11 items-center">

        {/* Fixed Latest badge */}

        <div className="relative z-10 shrink-0 bg-[#F8F0DC] px-4 sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            <Megaphone className="size-3.5" />

            {lang === "bn"
              ? items[0]?.label_bn
              : items[0]?.label_en}
          </span>
        </div>

        {/* Moving area */}

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="sliding-news-track">

            {tickerItems.map(
              (item, index) => {
                const message =
                  lang === "bn"
                    ? item.message_bn
                    : item.message_en;

                const content = (
                  <span className="inline-flex shrink-0 items-center whitespace-nowrap px-8 text-base text-normal">
                    {message}

                    <span className="ml-8 text-primary/40">
                      •
                    </span>
                  </span>
                );

                if (item.link) {
                  return (
                    <Link
                      key={`${item.id}-${index}`}
                      to={item.link}
                      className="shrink-0"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <span
                    key={`${item.id}-${index}`}
                  >
                    {content}
                  </span>
                );
              },
            )}

          </div>
        </div>
      </div>
    </div>
  );
}