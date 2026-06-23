"use client";

import { useState } from "react";
import type { PluralEntry } from "@/types/course";
import { useLanguage } from "@/lib/i18n";
import { RulePartNavigator } from "@/components/RulePartNavigator";

const pluralRuleCards = [
  {
    titleZh: "-en",
    titleEn: "-en",
    zh: "最常见。很多普通名词直接加 -en。",
    en: "Most common. Many everyday nouns add -en.",
    examples: ["boek → boeken", "afspraak → afspraken", "rekening → rekeningen"],
  },
  {
    titleZh: "-s",
    titleEn: "-s",
    zh: "很多以 -el、-er、-en、-em 或不重读音节结尾的词，常加 -s。",
    en: "Many words ending in -el, -er, -en, -em, or an unstressed syllable often add -s.",
    examples: ["tafel → tafels", "kamer → kamers", "station → stations"],
  },
  {
    titleZh: "'s",
    titleEn: "'s",
    zh: "词尾是清楚的长元音 a/i/o/u/y 时，常用 apostrophe + s。",
    en: "Words ending in a clear long vowel a/i/o/u/y often use apostrophe + s.",
    examples: ["auto → auto's", "menu → menu's", "taxi → taxi's"],
  },
  {
    titleZh: "拼写会变",
    titleEn: "Spelling changes",
    zh: "有些词加复数时，s 会变 z，f 会变 v，或元音长度要保住。",
    en: "Some words change spelling: s can become z, f can become v, or vowel length is preserved.",
    examples: ["huis → huizen", "brief → brieven", "boot → boten"],
  },
];

const explainPlural = (singular: string, plural: string, language: "zh" | "en") => {
  if (plural.includes("'s")) {
    return language === "zh"
      ? "词尾是清楚的长元音，所以用 apostrophe + s。"
      : "The word ends in a clear long vowel, so it uses apostrophe + s.";
  }
  if (plural.endsWith("s") && !plural.endsWith("ens")) {
    return language === "zh"
      ? "这个词结尾适合加 -s，直接作为常用搭配记。"
      : "This ending commonly takes -s; learn it as a frequent pattern.";
  }
  if (singular.includes("s") && plural.includes("z")) {
    return language === "zh"
      ? "加复数时 s 变成 z：huis → huizen。"
      : "The s changes to z in the plural: huis → huizen.";
  }
  if (singular.includes("f") && plural.includes("v")) {
    return language === "zh"
      ? "加复数时 f 可能变成 v。"
      : "The f can change to v in the plural.";
  }
  if (plural.endsWith("en")) {
    return language === "zh"
      ? "这是最常见路线：加 -en。"
      : "This follows the most common route: add -en.";
  }
  return language === "zh" ? "先把这个复数作为高频词块记。" : "Memorize this plural as a high-frequency chunk.";
};

export function PluralTrainer({ patterns }: { patterns: PluralEntry[] }) {
  const { t, language } = useLanguage();
  const [activePart, setActivePart] = useState<"rules" | "words">("rules");

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <h3 className="text-2xl font-black text-ink">{t("label.pluralBuilder")}</h3>
      <p className="mt-3 leading-7 text-ocean/75">
        {language === "zh"
          ? "荷兰语复数要先看单词结尾。不是所有词都加 s，也不是所有词都加 -en。先用结尾规则判断，再用例句确认。"
          : "For Dutch plurals, look at the word ending first. Not every word adds s, and not every word adds -en. Choose by ending, then confirm with examples."}
      </p>
      <div className="mt-4 rounded-[24px] bg-peach p-5">
        <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "核心判断" : "Core check"}</p>
        <p className="mt-2 text-3xl font-black leading-tight text-ink">
          {language === "zh" ? "先看结尾，再选 -en / -s / 's。" : "Check the ending, then choose -en / -s / 's."}
        </p>
      </div>

      <RulePartNavigator
        title={language === "zh" ? "复数生成分成两块" : "Plural builder has two parts"}
        activeId={activePart}
        onSelect={setActivePart}
        items={[
          {
            id: "rules",
            label: language === "zh" ? "先看规则" : "Rules",
            body: language === "zh" ? "先学 -en、-s、's 和拼写变化。" : "Learn -en, -s, 's, and spelling changes.",
          },
          {
            id: "words",
            label: language === "zh" ? "再看词表" : "Word List",
            body: language === "zh" ? "把具体名词复数作为词块确认。" : "Confirm concrete noun plurals as chunks.",
          },
        ]}
      />

      {activePart === "rules" ? (
        <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {pluralRuleCards.map((rule) => (
          <article key={rule.titleEn} className="rounded-2xl bg-skywash p-4">
            <p className="text-2xl font-black text-ink">{language === "zh" ? rule.titleZh : rule.titleEn}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{language === "zh" ? rule.zh : rule.en}</p>
            <div className="mt-3 grid gap-2">
              {rule.examples.map((example) => (
                <p key={example} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-ocean">{example}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-[24px] bg-ink p-5 text-white">
        <p className="text-sm font-black tracking-[0.14em] text-orange-200">{language === "zh" ? "先不要学太深" : "Do not go too deep yet"}</p>
        <p className="mt-2 font-bold leading-7 text-blue-50">
          {language === "zh"
            ? "这一课只学最常见判断。像 kind → kinderen 这种特殊复数，后面单独作为高频词块记。"
            : "This lesson only covers the most common decisions. Special plurals like kind → kinderen will be learned later as high-frequency chunks."}
        </p>
      </div>
        </>
      ) : null}

      {activePart === "words" ? (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {patterns.map((pattern) => (
          <article key={pattern.singular} className="rounded-2xl bg-peach p-4">
            <div className="flex items-center justify-between gap-3 text-xl font-black text-ocean">
              <span>{pattern.singular}</span>
              <span className="text-pop">→</span>
              <span>{pattern.plural}</span>
            </div>
            <p className="mt-4 rounded-2xl bg-white p-3 text-sm font-bold leading-6 text-ocean">
              {explainPlural(pattern.singular, pattern.plural, language)}
            </p>
            <p className="mt-3 text-sm font-black leading-6 text-ink">{pattern.exampleSentence.dutch}</p>
            <p className="mt-1 text-sm font-bold leading-6 text-ocean/65">{pattern.exampleSentence.meaning[language]}</p>
          </article>
        ))}
      </div>
      ) : null}
    </section>
  );
}
