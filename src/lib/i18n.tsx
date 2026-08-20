import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn";
export type Bi = { en: string; bn: string };

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Pick the right string for the active language. */
  t: (en: string, bn: string) => string;
  /** Pick from a bilingual object. */
  tb: (value: Bi) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "aeia.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "bn" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (en, bn) => (lang === "bn" ? bn : en),
      tb: (v) => (lang === "bn" ? v.bn : v.en),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
