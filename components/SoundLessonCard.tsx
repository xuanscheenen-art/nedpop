"use client";

import type { SoundLesson } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function SoundLessonCard({
  title,
  sound,
  rule,
  mouthPosition,
  exampleWords,
  exampleSentence,
  commonMistake,
  drill,
  chineseApproximation,
  englishBridge,
  soundAssociation,
  soundStory,
}: SoundLesson) {
  const { t, language } = useLanguage();
  const soundHook =
    soundAssociation?.[language] ?? (language === "zh" ? chineseApproximation : englishBridge) ?? rule[language];

  return (
    <article className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-pop">{sound}</p>
          <h3 className="mt-1 text-2xl font-black text-ink">{title[language]}</h3>
        </div>
        <span className="rounded-full bg-peach px-3 py-1 text-xs font-black text-pop">
          {language === "zh" ? "发音详情" : "Sound detail"}
        </span>
      </div>
      <p className="mt-4 rounded-2xl bg-skywash p-4 font-bold leading-7 text-ocean">{rule[language]}</p>
      {soundStory ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl bg-peach p-4">
            <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "声音感觉" : "Sound feeling"}</p>
            <p className="mt-2 font-black leading-7 text-ink">{soundStory.description[language]}</p>
          </div>
          <div className="rounded-2xl bg-mint p-4">
            <p className="text-xs font-black tracking-[0.14em] text-ocean/70">{language === "zh" ? "记忆动作" : "Memory action"}</p>
            <p className="mt-2 font-bold leading-7 text-ocean">{soundStory.mnemonic[language]}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
            <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "脑内小剧场" : "Mental scene"}</p>
            <p className="mt-2 font-bold leading-7 text-ocean">{soundStory.funFact[language]}</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl bg-peach p-4">
            <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "发音联想" : "Sound hook"}</p>
            <p className="mt-2 font-bold leading-7 text-ocean">{soundHook}</p>
          </div>
          <div className="rounded-2xl bg-mint p-4">
            <p className="text-xs font-black tracking-[0.14em] text-ocean/70">
              {language === "zh" ? "口型校正" : "Mouth check"}
            </p>
            <p className="mt-2 font-bold leading-7 text-ocean">{mouthPosition[language]}</p>
          </div>
        </div>
      )}
      {soundStory ? (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-blue-100">
          <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "口型校正" : "Mouth check"}</p>
          <p className="mt-2 font-bold leading-7 text-ocean">{mouthPosition[language]}</p>
          <p className="mt-3 rounded-xl bg-skywash px-3 py-2 text-sm font-bold leading-6 text-ocean">{soundHook}</p>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black text-ink">{t("label.exampleWords")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exampleWords.map((example) => (
              <span key={example.dutch} className="rounded-full bg-skywash px-3 py-2 text-sm font-black text-ocean">
                {example.dutch}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-ink">{language === "zh" ? "跟读块" : "Repeat chunks"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {drill.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-2 text-sm font-black text-ocean ring-1 ring-blue-100">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 rounded-2xl bg-white p-4 font-bold text-ink ring-1 ring-blue-100">{exampleSentence.dutch}</p>
      <div className="mt-4 rounded-2xl bg-orange-50 p-4">
        <p className="text-sm font-black text-pop">{t("label.commonMistake")}</p>
        <p className="mt-2 leading-7 text-ocean/75">{commonMistake[language]}</p>
      </div>
    </article>
  );
}
