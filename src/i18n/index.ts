// src/i18n/index.ts
// Initialise i18next with react-i18next.
// Install: npm install i18next react-i18next
// Import this in src/main.tsx BEFORE rendering the app:
//   import './i18n'

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import ar from "./locales/ar.json";

export type SupportedLocale = "en" | "es" | "fr" | "pt" | "ar";

export const SUPPORTED_LOCALES: { code: SupportedLocale; label: string; dir?: "rtl" }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

const STORAGE_KEY = "wcl-lang";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
      ar: { translation: ar },
    },
    lng: (localStorage.getItem(STORAGE_KEY) as SupportedLocale) ?? "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnNull: false,
  });

/** Change the active locale and persist the choice. */
export function setLocale(locale: SupportedLocale): void {
  i18n.changeLanguage(locale);
  localStorage.setItem(STORAGE_KEY, locale);

  // Handle RTL languages
  const localeInfo = SUPPORTED_LOCALES.find((l) => l.code === locale);
  document.documentElement.dir = localeInfo?.dir === "rtl" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
}

export default i18n;