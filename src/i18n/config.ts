import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./en-US/translation.json";
import gb from "./gb/translation.json";

export enum Language {
    en = "en-US",
    gb = "gb",
}

export const resources: Record<Language, { translation: any }> = {
    "en-US": {
        translation: en,
    },
    gb: {
        translation: gb,
    },
} as const;

i18n.use(initReactI18next).use(LanguageDetector).init({
    // defaultNS: "translation",
    resources,
    fallbackLng: Language.en,
});

// i18n.languages = Object.values(Language);
// console.log(i18n.language);

export default i18n;
