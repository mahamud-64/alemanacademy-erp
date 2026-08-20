import { useCallback, useEffect, useState } from "react";

/**
 * Thin localStorage-backed store. Every read goes through here so that a real
 * backend (PHP / Laravel / Node / Firebase) can later replace the persistence
 * layer without touching any page component.
 */
export function useLocalStore<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt entries */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* quota / private mode */
      }
    },
    [key],
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(fallback);
  }, [key, fallback]);

  return { value, update, reset, hydrated } as const;
}