import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { es } from "../i18n/es";
import { en } from "../i18n/en";
import type { Translations } from "../i18n/es";

type Language = "es" | "en";
type FontSize = "sm" | "md" | "lg";

interface SettingsContextType {
  language: Language;
  fontSize: FontSize;
  t: Translations;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const translations: Record<Language, Translations> = { es, en };

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("language") as Language) ?? "es"
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem("fontSize") as FontSize) ?? "md"
  );

  useEffect(() => {
    document.body.classList.remove("font-size-sm", "font-size-md", "font-size-lg");
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("fontSize", size);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        fontSize,
        t: translations[language],
        setLanguage,
        setFontSize,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
