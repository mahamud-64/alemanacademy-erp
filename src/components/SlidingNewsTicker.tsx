import { useEffect, useRef, useState } from "react";
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

  const [items, setItems] = useState<SlidingNewsItem[]>([]);
  const [repeatCount, setRepeatCount] = useState(2);

  const tickerContainerRef =
    useRef<HTMLDivElement>(null);

  const tickerGroupRef =
    useRef<HTMLDivElement>(null);

  // Load news from Supabase
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

  /*
   * Dynamically calculate how many times
   * the news sequence needs to be repeated.
   *
   * This runs for:
   * - 1 news item
   * - 2 news items
   * - 3 news items
   * - any number of news items
   *
   * It also recalculates when the screen
   * width changes.
   */
  useEffect(() => {
    const container = tickerContainerRef.current;
    const group = tickerGroupRef.current;

    if (!container || !group || items.length === 0) {
      return;
    }

    const updateRepeatCount = () => {
      const containerWidth = container.clientWidth;
      const groupWidth = group.scrollWidth;

      if (!containerWidth || !groupWidth) {
        return;
      }

      const needed = Math.ceil(
        containerWidth / groupWidth,
      );

      setRepeatCount(
        Math.max(2, needed + 1),
      );
    };

    // Initial calculation
    updateRepeatCount();

    // Recalculate when dimensions change
    const observer = new ResizeObserver(
      updateRepeatCount,
    );

    observer.observe(container);
    observer.observe(group);

    return () => {
      observer.disconnect();
    };
  }, [items, lang]);

  if (items.length === 0) {
    return null;
  }

  /*
   * Render one complete news sequence.
   *
   * repeatCount is calculated dynamically
   * based on the available screen width.
   */
  const renderNewsSequence = (
    copy: string,
  ) => {
    return (
      <div className="flex shrink-0">
        {Array.from(
          { length: repeatCount },
          () => items,
        )
          .flat()
          .map((item, index) => {
            const message =
              lang === "bn"
                ? item.message_bn
                : item.message_en;

            const content = (
              <span className="inline-flex shrink-0 items-center whitespace-nowrap px-8 text-base">
                {message}

                <span className="ml-8 text-primary/40">
                  •
                </span>
              </span>
            );

            if (item.link) {
              return (
                <Link
                  key={`${copy}-${item.id}-${index}`}
                  to={item.link}
                  className="shrink-0"
                >
                  {content}
                </Link>
              );
            }

            return (
              <span
                key={`${copy}-${item.id}-${index}`}
                className="shrink-0"
              >
                {content}
              </span>
            );
          })}
      </div>
    );
  };

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

        {/* Moving news area */}
        <div
          ref={tickerContainerRef}
          className="min-w-0 flex-1 overflow-hidden"
        >
          <div className="sliding-news-track">

            {/* First sequence */}
            <div
              ref={tickerGroupRef}
              className="flex shrink-0"
            >
              {renderNewsSequence("first")}
            </div>

            {/* Exact duplicate */}
            {renderNewsSequence("second")}

          </div>
        </div>
      </div>
    </div>
  );
}