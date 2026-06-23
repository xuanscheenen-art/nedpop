"use client";

import type { SmartWord } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function RelatedWordNetwork({
  featuredWord,
  words,
  extraNodes = [],
}: {
  featuredWord: SmartWord;
  words: SmartWord[];
  extraNodes?: string[];
}) {
  const { t } = useLanguage();
  const nodes = Array.from(new Set([featuredWord.dutch, ...featuredWord.relatedWords, ...extraNodes]));

  return (
    <section className="rounded-[32px] border border-blue-100 bg-skywash p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-pop">{t("wordLink.network")}</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{t("label.relatedWords")}</h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-ocean/70">
          Visual links show how one useful word opens nearby words for the same real-life situation.
        </p>
      </div>

      <div className="relative mt-8 min-h-[360px] overflow-hidden rounded-[28px] bg-white p-4 sm:p-8">
        <div className="absolute left-1/2 top-1/2 hidden h-px w-[72%] -translate-x-1/2 bg-blue-100 md:block" />
        <div className="absolute left-1/2 top-[18%] hidden h-[64%] w-px -translate-x-1/2 bg-blue-100 md:block" />
        <div className="relative grid min-h-[320px] place-items-center gap-4 md:grid-cols-3">
          {nodes.map((node, index) => {
            const active = node === featuredWord.dutch;
            const word = words.find((item) => item.dutch === node);
            return (
              <div
                key={node}
                className={`z-10 flex min-h-24 w-full max-w-[230px] flex-col items-center justify-center rounded-full px-5 py-4 text-center shadow-soft ring-1 ${
                  active ? "bg-ink text-white ring-ink" : "bg-white text-ocean ring-blue-100"
                } ${index % 2 === 0 ? "md:translate-y-8" : "md:-translate-y-8"}`}
              >
                <span className="text-lg font-black">{node}</span>
                {word ? <span className={`mt-1 text-xs font-bold ${active ? "text-blue-100" : "text-ocean/60"}`}>{word.meaning.en}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
