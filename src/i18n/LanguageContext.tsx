"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "./en.json";
import hi from "./hi.json";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
}

const dictionaries = {
  en,
  hi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lantern_lang") as Language;
      if (saved === "en" || saved === "hi") {
        setLanguageState(saved);
      }
    } catch {
      // localStorage unavailable during SSR or restricted env
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("lantern_lang", lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const t = (path: string, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    const parts = path.split(".");
    let current: unknown = dict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Fallback to English dictionary if not found in current language
        let fallbackCurrent: unknown = dictionaries.en;
        for (const fbPart of parts) {
          if (fallbackCurrent && typeof fallbackCurrent === "object" && fbPart in (fallbackCurrent as Record<string, unknown>)) {
            fallbackCurrent = (fallbackCurrent as Record<string, unknown>)[fbPart];
          } else {
            fallbackCurrent = undefined;
            break;
          }
        }
        if (typeof fallbackCurrent === "string") {
          return fallbackCurrent;
        }
        return fallback || path;
      }
    }

    if (typeof current === "string") {
      return current;
    }
    return fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
