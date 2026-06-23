"use client";

import { AlertCircle, Link2, MessageCircle, Volume2 } from "lucide-react";
import type { SmartWord } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function SmartWordBubbleCard({ word, featured = false }: { word: SmartWord; featured?: boolean }) {
  const { t, language } = useLanguage();

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6 ${
        featured ? "lg:p-8" : ""
      }`}
    >
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-peach/60" />
      <div className="absolute bottom-8 right-8 size-10 rounded-full bg-mint" />
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-pop">{word.scenarioTags[0] ?? "word"}</p>
            <h3 className={`${featured ? "text-4xl" : "text-2xl"} mt-2 font-black text-ink`}>{word.dutch}</h3>
            <p className="mt-2 text-lg font-bold text-ocean/75">
              {word.meaning.en} · {word.meaning.zh}
            </p>
          </div>
          <span className="w-fit rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
            {word.wordBreakdown[language]}
          </span>
        </div>

        <p className="mt-5 rounded-2xl bg-peach p-4 text-lg font-black leading-8 text-ocean">
          {word.smartAssociation[language]}
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-skywash p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-pop">{t("label.memoryHook")}</p>
            <p className="mt-2 leading-7 text-ocean">{word.chineseMemoryHook}</p>
          </div>
          <div className="rounded-2xl bg-mint p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-ocean/70">{t("label.englishBridge")}</p>
            <p className="mt-2 leading-7 text-ocean">{word.englishBridge ?? word.smartAssociation.en}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <div className="flex items-center gap-2 text-sm font-black text-pop">
              <Volume2 size={16} />
              {t("label.soundRule")}
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-ocean">{word.soundHint?.[language] ?? word.dutch}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <div className="flex items-center gap-2 text-sm font-black text-pop">
              <MessageCircle size={16} />
              {t("label.usefulPhrase")}
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-ocean">{word.commonPhrase?.dutch ?? word.exampleSentence.dutch}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <div className="flex items-center gap-2 text-sm font-black text-pop">
              <AlertCircle size={16} />
              {t("label.commonMistake")}
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-ocean">{word.commonMistake?.[language] ?? "-"}</p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl bg-ink p-4 font-bold leading-7 text-white">{word.exampleSentence.dutch}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {word.relatedWords.map((related) => (
            <span key={related} className="inline-flex items-center gap-2 rounded-full bg-skywash px-3 py-2 text-sm font-black text-ocean">
              <Link2 size={14} />
              {related}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
