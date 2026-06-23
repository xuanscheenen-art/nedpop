"use client";

import type { SentencePattern } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function SentenceBlock({ pattern }: { pattern: SentencePattern }) {
  const { language } = useLanguage();

  return (
    <article className="rounded-2xl bg-skywash p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-xl font-black text-ink">{pattern.title[language]}</h4>
          <p className="mt-2 text-sm font-bold leading-6 text-ocean">{pattern.rule[language]}</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-pop">Pattern</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {pattern.visualBlocks.map((block, index) => (
          <span
            key={`${pattern.title}-${block}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm font-black ${
              index === 1 ? "bg-pop text-ink" : "bg-white text-ocean"
            }`}
          >
            <span className="mr-2 text-xs opacity-70">P{index + 1}</span>
            {block}
          </span>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-white p-3 font-black text-ink">{pattern.example.dutch}</p>
      <p className="mt-3 text-sm font-bold leading-6 text-ocean/75">{pattern.explanation[language]}</p>
    </article>
  );
}
