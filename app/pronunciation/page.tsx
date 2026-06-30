"use client";

import { useEffect, useState } from "react";
import { InteractiveWordDecoder } from "@/components/InteractiveWordDecoder";
import { NextStepCard } from "@/components/NextStepCard";
import { PronunciationSoundBoard } from "@/components/PronunciationSoundBoard";
import { decoderExamples, soundCombinations } from "@/data/soundLessons";
import { useLanguage } from "@/lib/i18n";
import { getLearningProgress, updateLearningProgress } from "@/lib/learningProgress";

export default function PronunciationPage() {
  const { t, language } = useLanguage();
  const [initialWord, setInitialWord] = useState("ziekenhuis");
  const [baseCompleted, setBaseCompleted] = useState(false);

  useEffect(() => {
    const word = new URLSearchParams(window.location.search).get("word");
    if (word) {
      setInitialWord(word);
    }
    setBaseCompleted(getLearningProgress().pronunciationBaseCompleted);
  }, []);

  const completePronunciationBase = () => {
    updateLearningProgress({
      pronunciationBaseCompleted: true,
      currentStep: "starter-words",
      lastVisitedRoute: "/pronunciation",
    });
    setBaseCompleted(true);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Decode</p>
        <h1 className="mt-3 text-5xl font-black text-ink">{t("pronunciation.title")}</h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
          {language === "zh"
            ? "零基础先从 26 个字母、长短元音和特殊组合音开始。听得出、读得出，后面才进入单词解码。"
            : "Start from the 26 letters, long and short vowels, and special sound combinations. Once learners can hear and read them, they move into word decoding."}
        </p>
      </section>

      <PronunciationSoundBoard />

      <section className="mt-8 rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "发音底座" : "Pronunciation base"}</p>
            <h2 className="mt-2 text-2xl font-black text-ink">
              {language === "zh" ? "字母和组合音先过一遍" : "Finish the sound base first"}
            </h2>
            <p className="mt-2 text-sm font-bold leading-6 text-ocean/65">
              {language === "zh"
                ? "能听、能读这些核心声音后，先用一小包生存词开口，再补最小语法。"
                : "Once these core sounds feel readable, use a tiny starter word pack before adding grammar."}
            </p>
          </div>
          <button
            type="button"
            onClick={completePronunciationBase}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-pop px-5 py-3 text-sm font-black text-ink shadow-soft transition hover:bg-orange-300"
          >
            {baseCompleted
              ? language === "zh"
                ? "已完成"
                : "Completed"
              : language === "zh"
                ? "完成发音底座"
                : "Mark complete"}
          </button>
        </div>
        {baseCompleted ? (
          <NextStepCard
            eyebrow={language === "zh" ? "学习接力" : "Learning handoff"}
            currentLabel={language === "zh" ? "发音底座已完成" : "Pronunciation complete"}
            title={language === "zh" ? "下一步：A0 Day 1 生存词课程" : "Next: A0 Day 1 Starter Lesson"}
            reason={language === "zh" ? "你已经能粗略读词了，现在进入第一课，用 Ik ben、Ik heet、Ik leer Nederlands 开口。" : "You can roughly read words now. Start the first lesson with Ik ben, Ik heet, and Ik leer Nederlands."}
            buttonLabel={language === "zh" ? "进入 A0 Day 1" : "Open A0 Day 1"}
            route="/learn/a0-01"
          />
        ) : null}
      </section>

      <section className="mt-10">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Word Decoder</p>
        <h2 className="mt-3 text-3xl font-black text-ink">{language === "zh" ? "第二步：把声音放进单词里" : "Step 2: Put sounds into words"}</h2>
      </section>

      <InteractiveWordDecoder key={initialWord} decoderExamples={decoderExamples} soundCombinations={soundCombinations} initialWord={initialWord} />
    </main>
  );
}
