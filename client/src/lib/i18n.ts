import { create } from "zustand";
import { persist } from "zustand/middleware";

// Language codes
export type Language = "en" | "es" | "fr" | "de" | "pt" | "ar" | "hi" | "zh";

// Translation structure

// Language configurations
export const languages: Record<
  Language,
  { name: string; nativeName: string; direction: "ltr" | "rtl" }
> = {
  en: { name: "English", nativeName: "En", direction: "ltr" },
  es: { name: "Spanish", nativeName: "Es", direction: "ltr" },
  fr: { name: "French", nativeName: "Fr", direction: "ltr" },
  de: { name: "German", nativeName: "De", direction: "ltr" },
  pt: { name: "Portuguese", nativeName: "Pt", direction: "ltr" },
  ar: { name: "Arabic", nativeName: "Ar", direction: "rtl" },
  hi: { name: "Hindi", nativeName: "Hi", direction: "ltr" },
  zh: { name: "Chinese", nativeName: "Zh", direction: "ltr" },
};

// Import all translation files
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import frTranslations from "./translations/fr.json";
import deTranslations from "./translations/de.json";
import ptTranslations from "./translations/pt.json";
import arTranslations from "./translations/ar.json";
import hiTranslations from "./translations/hi.json";
import zhTranslations from "./translations/zh.json";
import { Translations } from "openai/resources/audio/translations.mjs";

const translations: Record<Language, Translations> = {
  en: enTranslations as unknown as Translations,
  es: esTranslations as unknown as Translations,
  fr: frTranslations as unknown as Translations,
  de: deTranslations as unknown as Translations,
  pt: ptTranslations as unknown as Translations,
  ar: arTranslations as unknown as Translations,
  hi: hiTranslations as unknown as Translations,
  zh: zhTranslations as unknown as Translations,
};

// i18n store
interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string, variables?: Record<string, string | number>) => string;
  translations: Translations;
}

export const useI18n = create<I18nState>()((set, get) => ({
  language: "en",
  translations: translations.en,
  setLanguage: (language: Language) => {
    set({
      language,
      translations: translations[language],
    });
    // Update document direction for RTL languages
    document.documentElement.dir = languages[language].direction;
    document.documentElement.lang = language;
  },
  t: (path: string, variables?: Record<string, string | number>) => {
    const state = get();
    const currentTranslations =
      state.translations ||
      translations[state.language || "en"] ||
      translations.en;
    const keys = path.split(".");
    let value: any = currentTranslations;

    for (const key of keys) {
      value = value?.[key];
      if (!value) break;
    }

    let result = value || path;

    // Handle variable interpolation
    if (variables && typeof result === "string") {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        result = result.replace(regex, String(variables[key]));
      });
    }

    return result;
  },
}));

// Helper hook for translations
export function useTranslation() {
  const { t, language, setLanguage, translations } = useI18n();
  return { t, language, setLanguage, translations, languages };
}
