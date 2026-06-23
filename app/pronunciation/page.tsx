"use client";

import { useEffect, useState } from "react";
import { InteractiveWordDecoder } from "@/components/InteractiveWordDecoder";
import { PronunciationSoundBoard } from "@/components/PronunciationSoundBoard";
import { decoderExamples, soundCombinations } from "@/data/soundLessons";
import { useLanguage } from "@/lib/i18n";

export default function PronunciationPage() {
  const { t, language } = useLanguage();
  const [initialWord, setInitialWord] = useState("ziekenhuis");

  useEffect(() => {
    const word = new URLSearchParams(window.location.search).get("word");
    if (word) {
      setInitialWord(word);
    }
  }, []);

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

      <section className="mt-10">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Word Decoder</p>
        <h2 className="mt-3 text-3xl font-black text-ink">{language === "zh" ? "第二步：把声音放进单词里" : "Step 2: Put sounds into words"}</h2>
      </section>

      <InteractiveWordDecoder key={initialWord} decoderExamples={decoderExamples} soundCombinations={soundCombinations} initialWord={initialWord} />
    </main>
  );
}
