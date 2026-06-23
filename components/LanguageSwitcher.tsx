"use client";

import { useLanguage, type Language } from "@/lib/i18n";

const languageLabels = {
  zh: "中文",
  en: "EN",
} satisfies Record<Language, string>;

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex rounded-full bg-skywash p-1">
      {(["zh", "en"] as Language[]).map((item) => (
        <button
          key={item}
          onClick={() => setLanguage(item)}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            language === item ? "bg-ink text-white shadow-sm" : "text-ocean hover:bg-white"
          }`}
        >
          {languageLabels[item]}
        </button>
      ))}
    </div>
  );
}
