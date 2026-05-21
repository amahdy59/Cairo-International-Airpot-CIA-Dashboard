import { createContext, useContext } from "react";
import { Language } from "../data";
import { arText } from "../data";

export const LocaleContext = createContext<Language>("en");

export function useLocale() {
  const language = useContext(LocaleContext);
  const tr = (key: string): string =>
    language === "ar" && arText[key] ? arText[key] : key;
  return { language, tr };
}
