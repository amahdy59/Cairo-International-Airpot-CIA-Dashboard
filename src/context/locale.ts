import { createContext, useContext } from "react";
import { Language } from "../data";
import { arText } from "../data";

export const LocaleContext = createContext<Language>("en");

export function useLocale() {
  const language = useContext(LocaleContext);
  const tr = (val: string | { en: string; ar: string }): string => {
    if (typeof val === "object" && val !== null) {
      return val[language] ?? val.en ?? "";
    }
    return language === "ar" && arText[val] ? arText[val] : val;
  };
  return { language, tr };
}
