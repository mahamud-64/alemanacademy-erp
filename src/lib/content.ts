import { useEffect, useState } from "react";
import { useLocalStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
  defaultDownloads,
  defaultSettings,
  type DownloadDoc,
  type Notice,
  type SiteSettings,
} from "@/data/site";

/**
 * Read-only, public-facing view of an admin_collections module. No auth
 * required — the "notices" and "downloads" module_ids are readable by
 * anyone via the "Public can read published content" RLS policy (see
 * supabase/admin_backend_migration.sql). Falls back to the bundled seed
 * data if the table is empty or unreachable, so the site never renders
 * blank while Supabase warms up.
 */
function usePublicCollection<T extends { id: string }>(moduleId: string, fallback: T[]) {
  const [value, setValue] = useState<T[]>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("admin_collections")
        .select("record_id, data")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(`Failed to load public "${moduleId}" content:`, error);
        setHydrated(true);
        return;
      }

      if (data && data.length > 0) {
        setValue(
          data.map((row) => ({ ...(row.data as Record<string, unknown>), id: row.record_id }) as T),
        );
      }

      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  return { value, hydrated } as const;
}

/** Notices published from the admin panel (Admin → Notices). */
export function useNotices() {
  return usePublicCollection<Notice>("notices", []);
}

/** Files published from the admin panel (Admin → Downloads). */
export function useDownloads() {
  return usePublicCollection<DownloadDoc>("downloads", defaultDownloads);
}

/** Site settings — still local to this browser; not part of the module registry. */
export function useSettings() {
  return useLocalStore<SiteSettings>("aeia.settings", defaultSettings);
}
