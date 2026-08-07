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

  const togglePronunciationBase = () => {
    const nextCompleted = !baseCompleted;
    updateLearningProgress({
      pronunciationBaseCompleted: nextCompleted,
      currentStep: nextCompleted ? "starter-words" : "pronunciation",
      lastVisitedRoute: "/pronunciation",
    });
    setBaseCompleted(nextCompleted);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Decode</p>
        <h1 className="mt-3 text-5xl font-black text-ink">{t("pronunciation.title")}</h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
          {language === "zh"
            ? "荷兰语发音先从 26 个字母、长短元音和特殊组合音开始。先听得出、读得出，再进入单词解码。"
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
            onClick={togglePronunciationBase}
            aria-pressed={baseCompleted}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-pop px-5 py-3 text-sm font-black text-ink shadow-soft transition hover:bg-orange-300"
          >
            {baseCompleted
              ? language === "zh"
                ? "取消完成"
                : "Undo complete"
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

      <section className="mt-12 border-t border-blue-100 py-10">
        <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "发音解码" : "Sound decoding"}</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          {language === "zh" ? "为什么需要荷兰语发音解码？" : "Why decode Dutch pronunciation?"}
        </h2>
        <p className="mt-3 max-w-3xl text-base font-bold leading-7 text-ocean/70">
          {language === "zh"
            ? "中文学习者容易按熟悉的字母读 ui、eu、ij，也常听不清 g/ch 等荷兰语声音组合。NedPop 发音解码把单词拆成可听、可辨认的声音，让你先看懂声音结构，再开口跟读。"
            : "Dutch combinations such as ui, eu, ij, and g/ch can be difficult to recognize and reproduce. NedPop breaks words into distinct sounds so learners can see the sound structure before listening and speaking."}
        </p>
      </section>
    </main>
  );
}
