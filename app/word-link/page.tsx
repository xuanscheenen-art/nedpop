"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, LockKeyhole, Play, Sparkles } from "lucide-react";
import { NextStepCard } from "@/components/NextStepCard";
import { UpgradeModal } from "@/components/UpgradeModal";
import { vocabularyLevelPlans } from "@/data/vocabularyPlan";
import { authChangedEvent, getCurrentUser } from "@/lib/auth";
import { getBaseCourseLessons, getBaseDayPacks, getBaseWords, getEffectiveDayPacks, getEffectiveWordBubble, getEffectiveWords, type EffectiveWordBubble } from "@/lib/contentStore";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import { accessLevelChangedEvent, canAccessLevel, getEntitledUnlockedLevels, getUnlockedLevels, type UserUnlockedLevels } from "@/lib/entitlements";
import { isBadGenericTargetTemplate, isKnownBadLearnerLine } from "@/lib/exampleQualityRules";
import { useLanguage } from "@/lib/i18n";
import { fetchServerLearnedWords, readLearnedWords, syncLearnedWordToServer, writeLearnedWords } from "@/lib/learnerProgress";
import { getDefaultLearningProgress, getLearningProgress, learningProgressChangedEvent, markStepComplete, setLearningRouteContext, updateLearningProgress, type LearningProgress } from "@/lib/learningProgress";
import { memoryPathFor, shouldShowPluralInWordHeader, stepLabelsForStrategy, wordTypeFor } from "@/lib/memoryPath";
import { memoryAssociationsFor, type WordAssociation } from "@/lib/wordAssociations";
import type { CourseLevel, LocalizedText } from "@/types/course";
import type { DailyWordItem, DailyWordPack, WordItem } from "@/types/vocabulary";

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

const levelSettings: Record<
  CourseLevel,
  {
    title: LocalizedText;
    focus: LocalizedText;
    dailyLoad: LocalizedText;
    daySize: number;
    estimatedMinutes: number;
    targetSentence: string;
    outputTask: LocalizedText;
    reviewLine: LocalizedText;
  }
> = {
  A0: {
    title: text("A0 生存入门", "A0 Starter"),
    focus: text("从零开始，先学能马上开口的生存词和自我介绍词。", "Start from zero with survival words and self-introduction words."),
    dailyLoad: text("每天 8-10 个词 / 15-20 分钟", "8-10 words per day / 15-20 min"),
    daySize: 10,
    estimatedMinutes: 18,
    targetSentence: "Hallo. Mijn naam is Lin. Ik kom uit China.",
    outputTask: text("用今天这页词说一个很短的 A0 句子。", "Use today's page to say one very short A0 sentence."),
    reviewLine: text("A0 要慢慢铺底，不跳级。先把最常用的词说顺。", "A0 builds the base slowly. Do not jump levels. Make the most common words speakable first."),
  },
  A1: {
    title: text("A1 生活基础", "A1 Foundation"),
    focus: text("围绕日常生活分页：时间、家庭、家、超市、交通、天气、工作学校。", "Page through daily life: time, family, home, supermarket, transport, weather, work and school."),
    dailyLoad: text("每天 10 个主动词 + 复习 / 20-25 分钟", "10 active words + review per day / 20-25 min"),
    daySize: 10,
    estimatedMinutes: 22,
    targetSentence: "Ik ga naar de supermarkt. Ik koop brood en water.",
    outputTask: text("用今天这页词说 2 句日常生活句。", "Use today's page to say two daily-life sentences."),
    reviewLine: text("A1 不是一天学完，是每天一页，把生活词慢慢连成句子。", "A1 is not one day. It is one page per day, slowly connecting life words into sentences."),
  },
  A2: {
    title: text("A2 生活任务", "A2 Practical Life Tasks"),
    focus: text("按真实任务分页：医生、市政厅、住房、工作、交通、账单、保险、邮件。", "Page through real tasks: GP, municipality, housing, work, transport, bills, insurance, emails."),
    dailyLoad: text("每天 10 个主动词 + 0-2 个识别词 / 25-30 分钟", "10 active words + 0-2 recognition words per day / 25-30 min"),
    daySize: 12,
    estimatedMinutes: 28,
    targetSentence: "Ik wil graag een afspraak maken met de huisarts.",
    outputTask: text("用今天这页词完成一个 A2 办事情景句。", "Use today's page to complete one A2 practical task sentence."),
    reviewLine: text("A2 要按场景多天推进，不是背一张词表。", "A2 moves through scenarios over many days. It is not one vocabulary sheet."),
  },
  B1: {
    title: text("B1 独立任务表达", "B1 Independent Task Dutch"),
    focus: text("按公开 B1 教材主题分页：自我表达、健康、社区、钱、工作、opleiding、旅行、环境、媒体、文化、观点和正式文字。", "Page through public B1 textbook themes: self-expression, health, neighborhood, money, work, education, travel, environment, media, culture, opinions, and formal texts."),
    dailyLoad: text("每天 12 个主动词 + 复习/识别词 / 30-40 分钟", "12 active words + review/recognition per day / 30-40 min"),
    daySize: 12,
    estimatedMinutes: 35,
    targetSentence: "Volgens de brief moet ik binnen twee weken reageren.",
    outputTask: text("用今天这页词写或说一个 B1 独立表达句。", "Use today's page to write or say one B1 independent-task sentence."),
    reviewLine: text("B1 是累计词汇层：A0-A2 继续复习，同时加入教材常见的长文本、观点、展示、工作学习和公共生活表达。", "B1 is cumulative: keep reviewing A0-A2 while adding textbook-style longer texts, opinions, presentations, work/study, and public-life language."),
  },
};

const courseLevels: CourseLevel[] = ["A0", "A1", "A2", "B1"];

const levelTargetValue = (level: CourseLevel, language: "zh" | "en") => {
  const copy: Record<CourseLevel, LocalizedText> = {
    A0: text("150-200 词", "150-200 words"),
    A1: text("600-700 词", "600-700 words"),
    A2: text("650-750 词", "650-750 words"),
    B1: text("800-950 词", "800-950 words"),
  };
  return copy[level][language];
};

const levelDailyValue = (level: CourseLevel, language: "zh" | "en", plan: (typeof vocabularyLevelPlans)[number]) => {
  const copy: Record<CourseLevel, LocalizedText> = {
    A0: text(`8-10 个新词 / 约 ${plan.totalDays} 天`, `8-10 new words / about ${plan.totalDays} days`),
    A1: text(`10 个主动词 + A0 复习 / 约 ${plan.totalDays} 天`, `10 active words + A0 review / about ${plan.totalDays} days`),
    A2: text(`10 个生活任务词 + A0/A1 复习 / 约 ${plan.totalDays} 天`, `10 practical-task words + A0/A1 review / about ${plan.totalDays} days`),
    B1: text(`12 个主动词 + A0-A2 复习 / 约 ${plan.totalDays} 天`, `12 active words + A0-A2 review / about ${plan.totalDays} days`),
  };
  return copy[level][language];
};

const packWordsFor = (pack: DailyWordPack) => [...pack.newWords, ...pack.reviewWords, ...pack.recognitionWords];

const initialPacks = getBaseDayPacks();
const initialWords = getBaseWords();
const initialFirstPack = initialPacks[0];
const initialFirstWordId = packWordsFor(initialFirstPack)[0]?.wordId ?? initialWords[0]?.id;
const learnerInternalCopyPattern =
  /缺少可用|缺少可输出|内容后台|后台设置|后台例句|后台|人工|手动|不要硬|暂时没有|placeholder|manual|missing|creator|请补充|暂无|先补一条|还需要/i;

const looksLikeLearnerInternalId = (value: string) => {
  const textValue = value.trim().toLowerCase();
  if (!textValue) return true;
  if (/^a[0-2]-\d{2}[-_a-z0-9]*$/.test(textValue)) return true;
  if (/^(lesson|day|pack|unit)-[-_a-z0-9]+$/.test(textValue)) return true;
  if (/^[a-z0-9_-]+$/i.test(textValue) && /\d/.test(textValue) && textValue.includes("-")) return true;
  return false;
};

const isLearnerVisibleText = (value?: string) => {
  const textValue = value?.trim() ?? "";
  if (!textValue) return false;
  if (learnerInternalCopyPattern.test(textValue)) return false;
  if (looksLikeLearnerInternalId(textValue)) return false;
  return true;
};

const looksLikeAnalyticGloss = (value?: string) => {
  const textValue = value?.trim() ?? "";
  if (!textValue) return false;
  return /(^|[\s，。])[^，。.!?]{1,12}\s[+＋]\s[^，。.!?]{1,12}/.test(textValue);
};

const isLearnerVisibleTranslation = (value?: string) =>
  isLearnerVisibleText(value) && !looksLikeAnalyticGloss(value);

const isSafeLearnerLine = (value?: string) => {
  const textValue = value?.trim() ?? "";
  if (!isLearnerVisibleText(textValue)) return false;
  return !isKnownBadLearnerLine(textValue);
};

const containsDutchToken = (sentence: string, token: string) =>
  new RegExp(`(^|\\W)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(sentence);

const phraseStopTokens = new Set(["de", "het", "een"]);
const dutchTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;
const phraseCoreTokens = (value: string) =>
  Array.from(value.toLowerCase().matchAll(dutchTokenPattern), (match) => match[0])
    .filter((token) => !phraseStopTokens.has(token));

const adjectiveEForm = (adjective: string) => {
  const irregular: Record<string, string> = { groot: "grote", oud: "oude", nieuw: "nieuwe", duur: "dure", goedkoop: "goedkope" };
  return irregular[adjective.toLowerCase()] ?? `${adjective}e`;
};

const verbStemOverrides: Record<string, string[]> = {
  is: ["is", "ben", "bent", "zijn"],
  weten: ["weet"],
  nemen: ["neem"],
  meenemen: ["neem"],
  geven: ["geef"],
  lezen: ["lees"],
  spreken: ["spreek"],
  komen: ["kom"],
  gaan: ["ga"],
  doen: ["doe"],
  zien: ["zie"],
  zijn: ["ben", "bent", "is", "zijn"],
  hebben: ["heb", "hebt", "heeft", "hebben"],
  douchen: ["douche", "doucht"],
  eindigen: ["eindig", "eindigt"],
  proberen: ["probeer", "probeert"],
  dragen: ["draag", "draagt"],
  halen: ["haal", "haalt"],
  spelen: ["speel", "speelt"],
  horen: ["hoor", "hoort"],
  schoonmaken: ["maak", "maakt", "schoon"],
  afdrogen: ["droog", "droogt", "af"],
  aanraken: ["raak", "raakt", "aan"],
  achterlaten: ["laat", "achter"],
  klaarmaken: ["maak", "klaar"],
  bijvoegen: ["voeg", "voegt", "bij"],
  doorverwijzen: ["verwijs", "verwijst", "door"],
  thuisblijven: ["blijf", "blijft", "thuis"],
  omreizen: ["reis", "reist", "om"],
  doorsturen: ["stuur", "stuurt", "door"],
  afhalen: ["haal", "haalt", "af"],
  uitschrijven: ["schrijf", "schrijft", "uit"],
  repareren: ["repareer", "repareert"],
};

const separableVerbPrefixes = ["terug", "mee", "aan", "op", "uit", "in", "af", "door", "over", "weg"];

const simpleDutchVerbStem = (infinitive: string) => {
  const lower = infinitive.toLowerCase();
  const override = verbStemOverrides[lower];
  if (override?.length) return override;
  if (!lower.endsWith("en") || lower.length <= 4) return [lower];
  let stem = lower.slice(0, -2);
  if (/([bcdfghjklmnpqrstvwxz])\1$/i.test(stem)) stem = stem.slice(0, -1);
  const forms = new Set([stem]);
  if (lower.endsWith("chen")) forms.add(`${stem}e`);
  if (!stem.endsWith("t")) forms.add(`${stem}t`);
  return Array.from(forms);
};

const verbDisplayForms = (dutch: string, usage?: ReturnType<typeof verbUsageFor>) => {
  const lower = dutch.toLowerCase();
  const forms = new Set<string>([dutch]);
  if (usage) {
    [usage.infinitive, usage.ikForm, usage.jijForm, usage.wijForm, ...usage.examples].forEach((form) => {
      form.split("/").forEach((part) => {
        const trimmed = part.trim().replace(/[.!?]+$/g, "");
        if (!trimmed) return;
        forms.add(trimmed);
        const tokens = phraseCoreTokens(trimmed);
        const lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.length >= 2) forms.add(lastToken);
      });
    });
  }
  simpleDutchVerbStem(lower).forEach((stem) => forms.add(stem));
  return Array.from(forms).filter(Boolean);
};

const separableVerbParts = (dutch: string) => {
  const lower = dutch.toLowerCase();
  const prefix = separableVerbPrefixes.find((item) => lower.startsWith(item) && lower.length > item.length + 3);
  if (!prefix) return undefined;
  const base = lower.slice(prefix.length);
  return {
    prefix,
    stems: simpleDutchVerbStem(base),
  };
};

function AudioButton({ text: audioText, label = "听音" }: { text: string; label?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(audioText);
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={play}
      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-ink ring-1 ring-blue-100 transition hover:bg-peach"
    >
      <Play size={15} fill="currentColor" />
      {isPlaying ? "播放中" : label}
    </button>
  );
}

const constellationPositions = [
  { x: 50, y: 14 },
  { x: 76, y: 24 },
  { x: 84, y: 50 },
  { x: 72, y: 76 },
  { x: 50, y: 86 },
  { x: 28, y: 76 },
  { x: 16, y: 50 },
  { x: 24, y: 24 },
];

const memoryBubbleStyleByType: Record<string, { card: string; pill: string; line: string }> = {
  "compound-part": {
    card: "border-orange-200 bg-orange-50/95 shadow-orange-100/80 hover:bg-orange-50",
    pill: "bg-orange-100 text-orange-700",
    line: "border-orange-300",
  },
  "compound-parent": {
    card: "border-orange-200 bg-orange-50/95 shadow-orange-100/80 hover:bg-orange-50",
    pill: "bg-orange-100 text-orange-700",
    line: "border-orange-300",
  },
  "compound-family": {
    card: "border-orange-200 bg-orange-50/95 shadow-orange-100/80 hover:bg-orange-50",
    pill: "bg-orange-100 text-orange-700",
    line: "border-orange-300",
  },
  "part-related": {
    card: "border-orange-200 bg-orange-50/95 shadow-orange-100/80 hover:bg-orange-50",
    pill: "bg-orange-100 text-orange-700",
    line: "border-orange-300",
  },
  "same-family": {
    card: "border-sky-200 bg-skywash/95 shadow-blue-100/80 hover:bg-skywash",
    pill: "bg-sky-100 text-ocean",
    line: "border-sky-300",
  },
  "word-family": {
    card: "border-sky-200 bg-skywash/95 shadow-blue-100/80 hover:bg-skywash",
    pill: "bg-sky-100 text-ocean",
    line: "border-sky-300",
  },
  "root-family": {
    card: "border-sky-200 bg-skywash/95 shadow-blue-100/80 hover:bg-skywash",
    pill: "bg-sky-100 text-ocean",
    line: "border-sky-300",
  },
  "prefix-suffix-family": {
    card: "border-cyan-200 bg-cyan-50/95 shadow-cyan-100/80 hover:bg-cyan-50",
    pill: "bg-cyan-100 text-cyan-700",
    line: "border-cyan-300",
  },
  synonym: {
    card: "border-emerald-200 bg-emerald-50/95 shadow-emerald-100/80 hover:bg-emerald-50",
    pill: "bg-emerald-100 text-emerald-700",
    line: "border-emerald-300",
  },
  opposite: {
    card: "border-rose-200 bg-rose-50/95 shadow-rose-100/80 hover:bg-rose-50",
    pill: "bg-rose-100 text-rose-700",
    line: "border-rose-300",
  },
  "time-contrast": {
    card: "border-rose-200 bg-rose-50/95 shadow-rose-100/80 hover:bg-rose-50",
    pill: "bg-rose-100 text-rose-700",
    line: "border-rose-300",
  },
  "english-bridge": {
    card: "border-slate-200 bg-slate-50/95 shadow-slate-100/80 hover:bg-slate-50",
    pill: "bg-slate-100 text-slate-700",
    line: "border-slate-300",
  },
  "action-object": {
    card: "border-lime-200 bg-lime-50/95 shadow-lime-100/80 hover:bg-lime-50",
    pill: "bg-lime-100 text-lime-700",
    line: "border-lime-300",
  },
  "state-action": {
    card: "border-emerald-200 bg-emerald-50/95 shadow-emerald-100/80 hover:bg-emerald-50",
    pill: "bg-emerald-100 text-emerald-700",
    line: "border-emerald-300",
  },
  "verb-noun-pair": {
    card: "border-lime-200 bg-lime-50/95 shadow-lime-100/80 hover:bg-lime-50",
    pill: "bg-lime-100 text-lime-700",
    line: "border-lime-300",
  },
  "category-member": {
    card: "border-cyan-200 bg-cyan-50/95 shadow-cyan-100/80 hover:bg-cyan-50",
    pill: "bg-cyan-100 text-cyan-700",
    line: "border-cyan-300",
  },
  "time-category": {
    card: "border-cyan-200 bg-cyan-50/95 shadow-cyan-100/80 hover:bg-cyan-50",
    pill: "bg-cyan-100 text-cyan-700",
    line: "border-cyan-300",
  },
  "scenario-word": {
    card: "border-cyan-200 bg-cyan-50/95 shadow-cyan-100/80 hover:bg-cyan-50",
    pill: "bg-cyan-100 text-cyan-700",
    line: "border-cyan-300",
  },
  "comparative-superlative": {
    card: "border-rose-200 bg-rose-50/95 shadow-rose-100/80 hover:bg-rose-50",
    pill: "bg-rose-100 text-rose-700",
    line: "border-rose-300",
  },
  "confusion-pair": {
    card: "border-yellow-200 bg-yellow-50/95 shadow-yellow-100/80 hover:bg-yellow-50",
    pill: "bg-yellow-100 text-yellow-700",
    line: "border-yellow-300",
  },
  "article-family": {
    card: "border-teal-200 bg-teal-50/95 shadow-teal-100/80 hover:bg-teal-50",
    pill: "bg-teal-100 text-teal-700",
    line: "border-teal-300",
  },
  "article-pattern": {
    card: "border-teal-200 bg-teal-50/95 shadow-teal-100/80 hover:bg-teal-50",
    pill: "bg-teal-100 text-teal-700",
    line: "border-teal-300",
  },
  "plural-family": {
    card: "border-amber-200 bg-amber-50/95 shadow-amber-100/80 hover:bg-amber-50",
    pill: "bg-amber-100 text-amber-700",
    line: "border-amber-300",
  },
  "plural-pattern": {
    card: "border-amber-200 bg-amber-50/95 shadow-amber-100/80 hover:bg-amber-50",
    pill: "bg-amber-100 text-amber-700",
    line: "border-amber-300",
  },
  "verb-conjugation": {
    card: "border-teal-200 bg-teal-50/95 shadow-teal-100/80 hover:bg-teal-50",
    pill: "bg-teal-100 text-teal-700",
    line: "border-teal-300",
  },
  "verb-form": {
    card: "border-teal-200 bg-teal-50/95 shadow-teal-100/80 hover:bg-teal-50",
    pill: "bg-teal-100 text-teal-700",
    line: "border-teal-300",
  },
};

const memoryBubbleTypeOrder = [
  "compound-part",
  "compound-family",
  "part-related",
  "verb-form",
  "verb-noun-pair",
  "word-family",
  "synonym",
  "opposite",
  "time-contrast",
  "comparative-superlative",
  "category-member",
  "time-category",
  "scenario-word",
  "action-object",
  "state-action",
  "confusion-pair",
  "english-bridge",
  "compound-parent",
];

function centerBubbleWordClass(word: string) {
  const compactLength = word.replace(/[\s-]/g, "").length;
  const isPhrase = /\s/.test(word.trim());
  if (isPhrase) {
    if (compactLength <= 12) return "text-2xl leading-7 sm:text-3xl sm:leading-8";
    if (compactLength <= 18) return "text-xl leading-6 sm:text-2xl sm:leading-7";
    return "text-base leading-5 sm:text-xl sm:leading-6";
  }
  if (compactLength <= 7) return "text-3xl leading-8 sm:text-4xl sm:leading-9";
  if (compactLength <= 9) return "text-2xl leading-7 sm:text-3xl sm:leading-8";
  if (compactLength <= 11) return "text-[20px] leading-6 sm:text-[26px] sm:leading-7";
  if (compactLength <= 13) return "text-[16px] leading-5 sm:text-[22px] sm:leading-6";
  if (compactLength <= 16) return "text-[13px] leading-4 sm:text-[18px] sm:leading-5";
  if (compactLength <= 20) return "text-[10px] leading-4 sm:text-[15px] sm:leading-4";
  return "text-[8px] leading-3 sm:text-[12px] sm:leading-4";
}

function centerBubbleWordWrapClass(word: string) {
  const compactLength = word.replace(/[\s-]/g, "").length;
  const isPhrase = /\s/.test(word.trim());
  if (isPhrase) return "max-w-[7.75rem] whitespace-normal break-normal sm:max-w-[9.25rem]";
  if (compactLength <= 11) return "max-w-[8rem] whitespace-nowrap sm:max-w-[9.75rem]";
  if (compactLength <= 16) return "max-w-[8.25rem] whitespace-nowrap sm:max-w-[10rem]";
  return "max-w-[8.5rem] whitespace-nowrap sm:max-w-[10.5rem]";
}

function outerBubbleWordClass(word: string) {
  const compactLength = word.replace(/[\s-]/g, "").length;
  const isPhrase = /\s/.test(word.trim());
  if (isPhrase) {
    if (compactLength <= 16) return "whitespace-normal break-normal text-sm leading-5 sm:text-[15px]";
    return "whitespace-normal break-normal text-xs leading-4 sm:text-sm";
  }
  if (compactLength <= 10) return "whitespace-nowrap text-base leading-5 sm:text-lg";
  if (compactLength <= 14) return "whitespace-nowrap text-sm leading-5 sm:text-[15px]";
  if (compactLength <= 18) return "whitespace-nowrap text-[11px] leading-4 sm:text-[13px]";
  if (compactLength <= 22) return "whitespace-nowrap text-[9px] leading-3 sm:text-[11px]";
  return "whitespace-nowrap text-[8px] leading-3 sm:text-[10px]";
}

function MemoryLinkConstellation({
  centerWord,
  links,
  language,
  onSelect,
}: {
  centerWord: string;
  links: WordAssociation[];
  language: "zh" | "en";
  onSelect: (word: WordAssociation) => void;
}) {
  const visibleLinks = links.slice(0, 8);
  const centerWordClass = centerBubbleWordClass(centerWord);
  const centerWordWrapClass = centerBubbleWordWrapClass(centerWord);
  if (!visibleLinks.length) {
    return (
      <div className="rounded-[28px] bg-slate-50 p-5 font-bold text-ocean/65">
        {language === "zh"
          ? "这个表达先按短语和例句记，比硬凑联想更稳。"
          : "Learn this item through chunks and example sentences instead of forcing a weak link."}
      </div>
    );
  }

  return (
    <div className="relative min-h-[620px] overflow-visible rounded-[34px] border border-blue-100 bg-[radial-gradient(circle_at_center,_#fffaf2_0,_#fffefb_36%,_#eef7ff_100%)] p-4 shadow-inner sm:min-h-[590px]">
      <div className="pointer-events-none absolute left-[8%] top-[12%] size-16 rounded-full bg-orange-100/45 blur-xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[10%] size-20 rounded-full bg-blue-100/55 blur-2xl" />
      <div className="pointer-events-none absolute right-[28%] top-[18%] size-10 rounded-full bg-white/80" />
      <div className="pointer-events-none absolute bottom-[20%] left-[22%] size-8 rounded-full bg-white/70" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="memory-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffb36b" />
          </marker>
        </defs>
        {visibleLinks.map((link, index) => {
          const point = constellationPositions[index % constellationPositions.length];
          const endX = 50 + (point.x - 50) * 0.34;
          const endY = 50 + (point.y - 50) * 0.34;
          const controlX = 50 + (point.x - 50) * 0.52;
          const controlY = 50 + (point.y - 50) * 0.18;
          return (
            <path
              key={`${link.dutch}-${index}`}
              d={`M ${point.x} ${point.y} Q ${controlX} ${controlY} ${endX} ${endY}`}
              fill="none"
              stroke="#ffb36b"
              strokeWidth="0.7"
              strokeLinecap="round"
              markerEnd="url(#memory-arrow)"
              opacity="0.7"
            />
          );
        })}
      </svg>

      <div data-testid="memory-center-bubble" className="absolute left-1/2 top-[50%] z-10 grid size-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-center text-white shadow-[0_24px_70px_rgba(13,43,83,0.24)] ring-[10px] ring-white/90 sm:size-44 sm:ring-[12px]">
        <div className="w-full px-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-peach">{language === "zh" ? "当前词" : "Center"}</p>
          <p data-testid="memory-center-word" className={`mx-auto mt-1 overflow-hidden font-black ${centerWordWrapClass} ${centerWordClass}`}>
            {centerWord}
          </p>
        </div>
      </div>

      {visibleLinks.map((link, index) => {
        const point = constellationPositions[index % constellationPositions.length];
        const outerWordClass = outerBubbleWordClass(link.dutch);
        const tone = memoryBubbleStyleByType[link.type] ?? memoryBubbleStyleByType["scenario-word"];
        const typeLabel = link.kind[language];
        const reason = link.reason[language];
        const isExtension = link.isExtensionWord ?? link.isExtensionTarget ?? false;
        return (
          <button
            key={`${link.dutch}-${link.kind.zh}-${index}`}
            type="button"
            onClick={() => onSelect(link)}
            disabled={!link.wordId && !isExtension}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            className={`group absolute z-20 grid min-h-24 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[36px] border px-3 py-3 text-center shadow-lg transition hover:z-30 hover:-translate-y-[calc(50%+4px)] hover:scale-[1.06] hover:shadow-xl focus-visible:z-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pop/20 disabled:cursor-default sm:w-40 ${tone.card}`}
          >
            <span className={`mb-1 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-black shadow-sm ${tone.pill}`}>
              {typeLabel}
            </span>
            <span className={`block max-w-full overflow-hidden font-black text-ink ${outerWordClass}`}>
              {link.dutch}
            </span>
            {link.meaning?.[language] ? (
              <span className="mt-0.5 block max-w-full break-words text-xs font-black leading-4 text-ocean/60 [overflow-wrap:anywhere]">{link.meaning[language]}</span>
            ) : null}
            {isExtension ? (
              <span className="mt-1 inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-ocean">
                {language === "zh" ? "扩展词" : "Extension"}
              </span>
            ) : null}
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 w-64 max-w-[72vw] -translate-x-1/2 rounded-3xl border border-blue-100 bg-white/95 p-4 text-left opacity-0 shadow-2xl shadow-blue-100/70 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-black ${tone.pill}`}>
                {language === "zh" ? `怎么记：${typeLabel}` : `Memory clue: ${typeLabel}`}
              </span>
              <span className="mt-1 block text-sm font-black leading-5 text-ink">{link.dutch}</span>
              {link.meaning?.[language] ? (
                <span className="mt-0.5 block text-xs font-bold text-ocean/65">{link.meaning[language]}</span>
              ) : null}
              <span className={`mt-3 block border-l-4 pl-3 text-xs font-bold leading-5 text-ocean/75 ${tone.line}`}>{reason}</span>
              {link.wordId ? (
                <span className="mt-3 inline-flex rounded-full bg-skywash px-2 py-1 text-[10px] font-black text-ocean">
                  {language === "zh" ? "点开看这个词" : "Open this word"}
                </span>
              ) : isExtension ? (
                <span className="mt-3 inline-flex rounded-full bg-skywash px-2 py-1 text-[10px] font-black text-ocean">
                  {language === "zh" ? "点开看解释" : "Open the note"}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function getPackProgress(pack: DailyWordPack, learnedWords: Record<string, boolean>) {
  const words = packWordsFor(pack);
  const learnedCount = words.filter((word) => learnedWords[word.wordId]).length;
  return words.length ? Math.round((learnedCount / words.length) * 100) : 0;
}

function wordSourceFor(item: DailyWordItem | null | undefined, allWords: WordItem[]) {
  return allWords.find((word) => word.id === item?.wordId) ?? allWords.find((word) => word.dutch === item?.dutch) ?? allWords[0];
}

function roleLabel(role: DailyWordItem["learningRole"], language: "zh" | "en") {
  if (role === "new") return language === "zh" ? "新词" : "New";
  if (role === "review") return language === "zh" ? "累计复习" : "Cumulative Review";
  return language === "zh" ? "识别" : "Recognition";
}

function roleClass(role: DailyWordItem["learningRole"]) {
  if (role === "new") return "bg-pop text-white";
  if (role === "review") return "bg-peach text-pop";
  return "bg-skywash text-ocean";
}

const subjectPronouns = new Set(["ik", "jij", "je", "u", "hij", "zij", "ze", "wij", "we", "jullie"]);
const possessivePronouns = new Set(["mijn", "jouw", "uw", "zijn", "haar", "ons", "onze", "hun"]);
const articleWords = new Set(["de", "het", "een"]);
const questionWords = new Set(["wie", "wat", "waar", "wanneer", "hoe", "hoeveel", "waarom"]);

function wordKindFor(word: WordItem, language: "zh" | "en", verbUsage?: ReturnType<typeof verbUsageFor>) {
  const lower = word.dutch.toLowerCase();

  if (subjectPronouns.has(lower)) {
    return {
      label: language === "zh" ? "主语代词" : "Subject Pronoun",
      tone: "bg-mint text-ocean ring-emerald-100",
      note: language === "zh" ? "可以放在句子前面做主语：ik kom, jij heet..." : "Can stand as the subject: ik kom, jij heet...",
    };
  }

  if (possessivePronouns.has(lower)) {
    return {
      label: language === "zh" ? "物主词/代词" : "Possessive",
      tone: "bg-skywash text-ocean ring-blue-100",
      note: language === "zh" ? "表示“我的/你的/他的”等，通常放在名词前。" : "Means my/your/his etc., usually before a noun.",
    };
  }

  if (articleWords.has(lower)) {
    return {
      label: language === "zh" ? "冠词" : "Article",
      tone: "bg-peach text-pop ring-orange-100",
      note: language === "zh" ? "放在名词前面，和名词一起当词块记。" : "Goes before a noun; learn it as a chunk with the noun.",
    };
  }

  if (questionWords.has(lower)) {
    return {
      label: language === "zh" ? "疑问词" : "Question Word",
      tone: "bg-skywash text-ocean ring-blue-100",
      note: language === "zh" ? "用来提问，重点记它能问什么信息。" : "Used for questions; learn what information it asks for.",
    };
  }

  const type = wordTypeFor(word);
  if (type === "verb") {
    const isVerbForm = Boolean(verbUsage && verbUsage.infinitive.toLowerCase() !== lower);
    return {
      label: language === "zh" ? (isVerbForm ? "动词形式" : "动词") : (isVerbForm ? "Verb Form" : "Verb"),
      tone: "bg-ink text-white ring-ink",
      note: verbUsage
        ? language === "zh"
          ? `${isVerbForm ? `${word.dutch} 是 ${verbUsage.infinitive} 的一个形式。` : `完整形式：${verbUsage.infinitive}。`}放进句子后看主语：${verbUsage.ikForm} / ${verbUsage.jijForm} / ${verbUsage.wijForm}。`
          : `${isVerbForm ? `${word.dutch} is a form of ${verbUsage.infinitive}.` : `Base form: ${verbUsage.infinitive}.`} In a sentence, check the subject: ${verbUsage.ikForm} / ${verbUsage.jijForm} / ${verbUsage.wijForm}.`
        : language === "zh"
          ? "这是动词。不要只背一个词形，要看它放进句子后怎么用。"
          : "This is a verb. Do not memorize only one form; learn how it works in a sentence.",
    };
  }

  if (type === "noun") {
    return {
      label: language === "zh" ? "名词" : "Noun",
      tone: "bg-peach text-pop ring-orange-100",
      note: language === "zh"
        ? `${word.article ? `先记 ${word.article} ${word.dutch}` : `先记 ${word.dutch}`}，再看它最常出现在哪些短语里。`
        : `${word.article ? `Learn ${word.article} ${word.dutch}` : `Learn ${word.dutch}`} first, then check its natural phrase chunks.`,
    };
  }

  if (type === "adjective") {
    return {
      label: language === "zh" ? "形容词" : "Adjective",
      tone: "bg-amber-50 text-pop ring-orange-100",
      note: language === "zh" ? "用来描述人或东西。放在名词前时，后面可能要加 -e。" : "Describes a person or thing. Before a noun, it may need -e.",
    };
  }

  if (type === "adverb") {
    return {
      label: language === "zh" ? "副词" : "Adverb",
      tone: "bg-skywash text-ocean ring-blue-100",
      note: language === "zh" ? "常用来补充地点、时间或方式。" : "Often adds place, time, or manner.",
    };
  }

  if (type === "language-name") {
    return {
      label: language === "zh" ? "语言名" : "Language Name",
      tone: "bg-mint text-ocean ring-emerald-100",
      note: language === "zh" ? "表示一门语言，可以说 Ik spreek ... / Ik leer ..." : "Names a language; use it in Ik spreek ... / Ik leer ...",
    };
  }

  if (type === "country-name") {
    return {
      label: language === "zh" ? "国家名" : "Country Name",
      tone: "bg-mint text-ocean ring-emerald-100",
      note: language === "zh" ? "表示国家，常和 uit / in 一起用。" : "Names a country, often used with uit / in.",
    };
  }

  if (type === "number") {
    return {
      label: language === "zh" ? "数字" : "Number",
      tone: "bg-peach text-pop ring-orange-100",
      note: language === "zh" ? "数字先练听、读、顺序和识别。" : "Practice hearing, reading, order, and recognition.",
    };
  }

  if (type === "day-month") {
    return {
      label: language === "zh" ? "时间词" : "Time Word",
      tone: "bg-skywash text-ocean ring-blue-100",
      note: language === "zh" ? "表示星期、月份或时间单位。" : "Names a weekday, month, or time unit.",
    };
  }

  if (type === "phrase") {
    return {
      label: language === "zh" ? "短语" : "Phrase",
      tone: "bg-ink text-white ring-ink",
      note: language === "zh" ? "这不是单个词，直接当可用词块记。" : "This is not a single word; learn it as a usable chunk.",
    };
  }

  return {
    label: language === "zh" ? "功能词" : "Function Word",
    tone: "bg-skywash text-ocean ring-blue-100",
    note: language === "zh" ? "靠句子位置和搭配来记，不要硬拆。" : "Learn it through sentence position and chunks.",
  };
}

function strategyBadgeLabel(strategy: string, wordType: string, language: "zh" | "en") {
  if (wordType === "number") return language === "zh" ? "数字" : "Number";
  if (strategy === "word-breakdown") return language === "zh" ? "拆词联想" : "Word Breakdown";
  if (strategy === "compound-word") return language === "zh" ? "拆词联想" : "Compound";
  if (strategy === "english-bridge") return language === "zh" ? "英文桥梁" : "English Bridge";
  if (strategy === "fixed-expression") return language === "zh" ? "固定表达" : "Fixed Expression";
  if (strategy === "meaning-contrast") return language === "zh" ? "词义对比" : "Meaning Contrast";
  if (strategy === "word-formation") return language === "zh" ? "词形联想" : "Word Formation";
  if (strategy === "phrase-based") return language === "zh" ? "联想词块" : "Hooked Phrase";
  if (strategy === "sentence-based") return language === "zh" ? "句子记忆" : "Sentence Based";
  if (strategy === "category-rule") return language === "zh" ? "类别规则" : "Category Rule";
  return language === "zh" ? "场景联想" : "Scene Hook";
}

function normalizeDutchLine(line: string) {
  return line.trim().toLowerCase().replace(/[.!?]+$/g, "");
}

function isSameDutchLine(a: string | undefined, b: string | undefined) {
  if (!a || !b) return false;
  return normalizeDutchLine(a) === normalizeDutchLine(b);
}

const matchesWordQuery = (word: { id?: string; wordId?: string; dutch: string }, query: string | null | undefined) =>
  Boolean(query) && (
    word.id === query ||
    word.wordId === query ||
    normalizeDutchLine(word.dutch) === normalizeDutchLine(query ?? "")
  );

function WordLinkContent() {
  const { language } = useLanguage();
  const [queryParams, setQueryParams] = useState<{ word: string | null; debugContent: string | null; level: string | null; day: string | null }>({
    word: null,
    debugContent: null,
    level: null,
    day: null,
  });
  const wordParam = queryParams.word;
  const debugContentParam = queryParams.debugContent;
  const levelParam = queryParams.level;
  const dayParam = queryParams.day;
  const [effectivePacks, setEffectivePacks] = useState<DailyWordPack[]>(() => initialPacks);
  const [effectiveWords, setEffectiveWords] = useState<WordItem[]>(() => initialWords);
  const [activePackId, setActivePackId] = useState(initialFirstPack.id);
  const [selectedId, setSelectedId] = useState(initialFirstWordId);
  const [learnedWords, setLearnedWords] = useState<Record<string, boolean>>({});
  const [learningProgress, setLearningProgress] = useState<LearningProgress>(() => getDefaultLearningProgress());
  const [debugContent, setDebugContent] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [extensionPanel, setExtensionPanel] = useState<WordAssociation | null>(null);
  const [accessLevel, setCurrentAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<CourseLevel | undefined>();

  useEffect(() => {
    let cancelled = false;
    const syncAccess = () => {
      setCurrentAccessLevel(getUnlockedLevels());
      void getEntitledUnlockedLevels().then((level) => {
        if (!cancelled) setCurrentAccessLevel(level);
      });
    };
    const syncUser = () => {
      void getCurrentUser().then((user) => {
        if (!cancelled) setSignedIn(Boolean(user));
      });
    };
    syncAccess();
    syncUser();
    window.addEventListener(accessLevelChangedEvent, syncAccess);
    window.addEventListener(authChangedEvent, syncUser);
    window.addEventListener("storage", syncAccess);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(accessLevelChangedEvent, syncAccess);
      window.removeEventListener(authChangedEvent, syncUser);
      window.removeEventListener("storage", syncAccess);
      window.removeEventListener("storage", syncUser);
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let lastSearch = "";
    const syncQueryParams = () => {
      if (window.location.search === lastSearch) return;
      lastSearch = window.location.search;
      const params = new URLSearchParams(window.location.search);
      setQueryParams({
        word: params.get("word"),
        debugContent: params.get("debugContent"),
        level: params.get("level"),
        day: params.get("day"),
      });
    };
    syncQueryParams();
    const interval = window.setInterval(syncQueryParams, 250);
    window.addEventListener("popstate", syncQueryParams);
    window.addEventListener("focus", syncQueryParams);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("popstate", syncQueryParams);
      window.removeEventListener("focus", syncQueryParams);
    };
  }, []);

  useEffect(() => {
    const syncLearningProgress = () => setLearningProgress(getLearningProgress());
    window.addEventListener(learningProgressChangedEvent, syncLearningProgress);
    window.addEventListener("storage", syncLearningProgress);
    return () => {
      window.removeEventListener(learningProgressChangedEvent, syncLearningProgress);
      window.removeEventListener("storage", syncLearningProgress);
    };
  }, []);

  useEffect(() => {
    const nextPacks = getEffectiveDayPacks();
    const nextWords = getEffectiveWords();
    setEffectivePacks(nextPacks);
    setEffectiveWords(nextWords);
    setLearnedWords(readLearnedWords());
    void fetchServerLearnedWords().then((serverWords) => {
      if (!Object.keys(serverWords).length) return;
      setLearnedWords((current) => {
        const next = { ...current, ...serverWords };
        writeLearnedWords(next);
        return next;
      });
    });
    setContentReady(true);

    setDebugContent(debugContentParam === "true");
    const requestedLevel = courseLevels.find((level) => level === levelParam);
    const requestedDay = Number(dayParam);
    const requestedPack = requestedLevel
      ? nextPacks.find((item) =>
          item.level === requestedLevel &&
          item.dayNumber === (Number.isFinite(requestedDay) && requestedDay > 0 ? Math.floor(requestedDay) : 1)
        )
      : undefined;
    if (requestedPack && !wordParam) {
      if (!canAccessLevel(requestedPack.level, accessLevel, signedIn)) {
        setUpgradeLevel(requestedPack.level);
        return;
      }
      setActivePackId(requestedPack.id);
      setSelectedId(packWordsFor(requestedPack)[0]?.wordId ?? initialFirstWordId);
      return;
    }

    const baseTarget = initialWords.find((item) => matchesWordQuery(item, wordParam));
    const target = nextWords.find((item) =>
      matchesWordQuery(item, wordParam) ||
      (baseTarget ? item.id === baseTarget.id : false)
    );
    const pack = nextPacks.find((item) => packWordsFor(item).some((word) =>
      word.wordId === target?.id ||
      word.dutch === target?.dutch ||
      word.wordId === baseTarget?.id ||
      matchesWordQuery(word, wordParam)
    ));
    const dailyTarget = pack ? packWordsFor(pack).find((word) =>
      word.wordId === target?.id ||
      word.dutch === target?.dutch ||
      word.wordId === baseTarget?.id ||
      matchesWordQuery(word, wordParam)
    ) : undefined;
    if (!target && !dailyTarget) return;

    if (pack) {
      if (!canAccessLevel(pack.level, accessLevel, signedIn)) {
        setUpgradeLevel(pack.level);
        return;
      }
      setActivePackId(pack.id);
    }
    setSelectedId(target?.id ?? dailyTarget?.wordId ?? initialFirstWordId);
  }, [accessLevel, dayParam, debugContentParam, levelParam, signedIn, wordParam]);

  const firstPack = effectivePacks[0] ?? initialFirstPack;
  const activePack = effectivePacks.find((pack) => pack.id === activePackId) ?? firstPack;
  const activePlan = vocabularyLevelPlans.find((plan) => plan.level === activePack.level) ?? vocabularyLevelPlans[0];
  const levelPacks = effectivePacks.filter((pack) => pack.level === activePack.level);
  const activeDayIndex = Math.max(levelPacks.findIndex((pack) => pack.id === activePack.id), 0);
  const matchingLessonId = useMemo(
    () => getBaseCourseLessons().find((lesson) => lesson.level === activePack.level && lesson.order === activePack.dayNumber)?.id,
    [activePack.dayNumber, activePack.level],
  );

  useEffect(() => {
    setLearningRouteContext({
      page: "word-link",
      level: activePack.level,
      day: activePack.dayNumber,
    });
  }, [activePack.dayNumber, activePack.level]);
  const packWords = packWordsFor(activePack);
  const selectedDailyInPack = packWords.find((word) => word.wordId === selectedId || word.dutch === selectedId);
  const selectedFromState = effectiveWords.find((word) => word.id === selectedId) ?? effectiveWords.find((word) => word.dutch === selectedId);
  const selected = selectedFromState ?? wordSourceFor(selectedDailyInPack ?? packWords[0], effectiveWords);
  const selectedBubble = useMemo<EffectiveWordBubble | undefined>(() => contentReady ? getEffectiveWordBubble(selected.id) : undefined, [contentReady, selected.id]);
  const selectedDaily = selectedDailyInPack ?? {
    wordId: selected.id,
    dutch: selected.dutch,
    article: selected.article,
    plural: selected.plural,
    meaning: selected.meaning,
    learningRole: selected.originalLevel === activePack.level ? "new" as const : "review" as const,
    originalLevel: selected.originalLevel,
    currentPackLevel: activePack.level,
    memoryHook: selected.memoryHook,
    phraseChunks: selected.phraseChunks,
    exampleSentence: selected.exampleSentence,
    audioText: selected.audioText,
    audioSrc: selected.audioSrc,
  };
  const selectedIndex = packWords.findIndex((word) => word.wordId === selectedDailyInPack?.wordId);
  const progress = getPackProgress(activePack, learnedWords);
  const selectedWordType = wordTypeFor(selected);
  const memoryPath = useMemo(
    () => selectedBubble?.memoryPath ?? memoryPathFor(selected, {
      allWords: effectiveWords,
      phraseChunks: activePack.phraseChunks,
      examples: selectedBubble?.exampleSentences,
    }),
    [activePack.phraseChunks, effectiveWords, selected, selectedBubble?.exampleSentences, selectedBubble?.memoryPath],
  );
  const selectedVerb = useMemo(() => verbUsageFor(selected), [selected]);
  const selectedSentenceMatchesWord = (dutch: string) => {
    if (memoryPath.outputSentences.some((sentence) => isSameDutchLine(sentence.dutch, dutch))) return true;
    if (selectedWordType === "phrase") {
      if (containsDutchToken(dutch, selected.dutch)) return true;
      const tokens = phraseCoreTokens(selected.dutch);
      return tokens.length > 0 && tokens.every((token) => containsDutchToken(dutch, token));
    }
    if (["number", "function-word", "language-name", "country-name", "day-month"].includes(selectedWordType)) return true;
    const selectedLooksLikeVerb = selectedWordType === "verb" || (!selected.article && selected.dutch.toLowerCase().endsWith("en"));
    if (selectedLooksLikeVerb && selectedVerb) {
      const forms = verbDisplayForms(selected.dutch, selectedVerb);
      const parts = separableVerbParts(selected.dutch);
      return forms.some((form) => containsDutchToken(dutch, form)) ||
        Boolean(parts && containsDutchToken(dutch, parts.prefix) && parts.stems.some((stem) => containsDutchToken(dutch, stem)));
    }
    if (selectedLooksLikeVerb) {
      const forms = verbDisplayForms(selected.dutch);
      const parts = separableVerbParts(selected.dutch);
      return forms.some((form) => containsDutchToken(dutch, form)) ||
        Boolean(parts && containsDutchToken(dutch, parts.prefix) && parts.stems.some((stem) => containsDutchToken(dutch, stem)));
    }
    if (selectedWordType === "adjective") {
      return [selected.dutch, adjectiveEForm(selected.dutch)].some((form) => containsDutchToken(dutch, form));
    }
    return [selected.dutch, selected.plural ?? ""].filter(Boolean).some((form) => containsDutchToken(dutch, form));
  };
  const isWeakGenericExampleForSelected = (dutch: string) => {
    const target = selected.dutch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!target) return false;
    const text = dutch.trim();
    if (isBadGenericTargetTemplate(selected, text)) return true;
    if (selectedWordType === "adjective" && new RegExp(`^Dat is ${target}\\.?$`, "i").test(text)) return true;
    return new RegExp(`^Dit is (de|het)\\s+${target}\\.?$`, "i").test(text);
  };
  const isDisplayPhraseChunk = (dutch: string) => {
    const text = dutch.trim();
    if (!isLearnerVisibleText(text) || !selectedSentenceMatchesWord(text)) return false;
    if (/[.!?]$/.test(text)) return false;
    return !/^(ik|jij|je|u|hij|zij|ze|wij|we|jullie|dat|dit)\b/i.test(text);
  };
  const isNumberMemoryPath = memoryPath.wordType === "number";
  const memoryStepLabels = stepLabelsForStrategy(memoryPath.strategy, language);
  const visibleMemoryPhraseChunks = memoryPath.phraseChunks.filter((chunk) => isDisplayPhraseChunk(chunk.dutch));
  const visibleMemoryOutputSentences = memoryPath.outputSentences.filter((sentence) =>
    isSafeLearnerLine(sentence.dutch) &&
    selectedSentenceMatchesWord(sentence.dutch) &&
    isLearnerVisibleTranslation(language === "zh" ? sentence.meaningZh : sentence.meaningEn)
  );
  const visibleExampleSentences = (selectedBubble?.exampleSentences ?? []).filter((example) =>
    example.qualityStatus !== "reject" &&
    isSafeLearnerLine(example.dutch) &&
    !isWeakGenericExampleForSelected(example.dutch) &&
    selectedSentenceMatchesWord(example.dutch) &&
    isLearnerVisibleTranslation(example.meaning[language])
  );
  const visiblePhraseChunkDetails = (selectedBubble?.phraseChunkDetails ?? []).filter((chunk) =>
    isDisplayPhraseChunk(chunk.dutch)
  );
  const memoryExplanation = language === "zh" ? memoryPath.explanationZh : memoryPath.explanationEn;
  const firstPhraseChunk = visibleMemoryPhraseChunks[0];
  const fallbackOutputSentence = visibleExampleSentences[0]
    ? {
        dutch: visibleExampleSentences[0].dutch,
        meaningZh: visibleExampleSentences[0].meaning.zh,
        meaningEn: visibleExampleSentences[0].meaning.en,
      }
    : undefined;
  const firstOutputSentence = visibleMemoryOutputSentences[0] ?? fallbackOutputSentence;
  const visibleOutputPatternSentences = [
    ...visibleMemoryOutputSentences,
    ...visibleExampleSentences.map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaning.zh,
      meaningEn: example.meaning.en,
    })),
  ].filter((sentence, index, sentences) =>
    sentences.findIndex((item) => isSameDutchLine(item.dutch, sentence.dutch)) === index,
  );
  const hasOutputSentence = Boolean(firstOutputSentence);
  const engineMemorySteps = memoryPath.steps?.length
    ? memoryPath.steps.map((step) => ({
        label: language === "zh" ? step.labelZh : step.labelEn,
        value: language === "zh" ? step.contentZh : step.contentEn,
      }))
    : undefined;
  const rawMemorySteps = engineMemorySteps ?? (isNumberMemoryPath
    ? [
        {
          label: language === "zh" ? "数字本身" : "Number",
          value: `${selected.dutch} = ${selected.meaning[language]}`,
        },
        {
          label: language === "zh" ? "学习方式" : "How to Learn",
          value: language === "zh" ? memoryPath.memoryHookZh : memoryPath.memoryHookEn,
        },
      ]
    : [
        {
          label: memoryStepLabels[0],
          value: memoryPath.breakdown
            ? `${memoryPath.breakdown.parts.map((part) => `${part.dutch} = ${language === "zh" ? part.meaningZh : part.meaningEn}`).join(" + ")}`
            : memoryPath.englishBridge?.bridge ?? memoryExplanation,
        },
        {
          label: memoryStepLabels[1],
          value: language === "zh" ? memoryPath.memoryHookZh : memoryPath.memoryHookEn,
        },
        {
          label: memoryStepLabels[2] ?? (language === "zh" ? "使用提醒" : "Usage note"),
          value: visibleMemoryPhraseChunks.length
            ? visibleMemoryPhraseChunks.slice(0, 3).map((phrase) => `${phrase.dutch}${phrase.meaningZh ? ` = ${language === "zh" ? phrase.meaningZh : phrase.meaningEn}` : ""}`).join(" / ")
            : (language === "zh" ? memoryPath.scenarioAnchor.zh : memoryPath.scenarioAnchor.en),
        },
      ]);
  const memorySteps = rawMemorySteps.filter((step) => isLearnerVisibleText(step.value));

  const relatedWords = useMemo(() => memoryAssociationsFor(selected, effectiveWords, 8), [selected, effectiveWords]);
  const selectedWordKind = wordKindFor(selected, language, selectedVerb);
  const levelLocked = (level: CourseLevel) => !canAccessLevel(level, accessLevel, signedIn);

  useEffect(() => {
    setExtensionPanel(null);
  }, [selected.id]);

  const isLastWordInPack = selectedIndex >= packWords.length - 1;
  const hasNextDay = activeDayIndex < levelPacks.length - 1;
  const isDayComplete = packWords.length > 0 && packWords.every((word) => learnedWords[word.wordId]);
  const isStarterWordsPack = activePack.level === "A0" && activePack.dayNumber === 1;
  const dayCompleteRoute = isStarterWordsPack && !learningProgress.grammarBaseCompleted
    ? "/rules?mode=foundation"
    : matchingLessonId
      ? `/learn/${matchingLessonId}?step=patterns`
      : "/dashboard";

  useEffect(() => {
    if (!isDayComplete) return;
    const currentProgress = getLearningProgress();
    if (activePack.level === "A0" && activePack.dayNumber === 1 && !currentProgress.starterWordsCompleted) {
      markStepComplete(activePack.level, activePack.dayNumber, "starter-words");
      updateLearningProgress({
        starterWordsCompleted: true,
        currentLevel: "A0",
        currentDay: 1,
        currentStep: currentProgress.grammarBaseCompleted ? "lesson" : "grammar",
        lastVisitedRoute: "/word-link?level=A0&day=1",
      });
      return;
    }
    markStepComplete(activePack.level, activePack.dayNumber, "word-bubbles", {
      advanceCurrent: currentProgress.currentLevel === activePack.level && currentProgress.currentDay === activePack.dayNumber,
    });
  }, [activePack.dayNumber, activePack.level, isDayComplete]);

  const toggleLearnedWord = (wordId: string) => {
    setLearnedWords((current) => {
      const learned = !current[wordId];
      const next = { ...current, [wordId]: learned };
      writeLearnedWords(next);
      void syncLearnedWordToServer(wordId, learned);
      return next;
    });
  };

  const moveWord = (direction: -1 | 1) => {
    if (selectedIndex < 0) {
      const next = packWords[0];
      if (next) setSelectedId(next.wordId);
      return;
    }
    const nextIndex = Math.min(Math.max(selectedIndex + direction, 0), packWords.length - 1);
    const next = packWords[nextIndex];
    if (next) setSelectedId(next.wordId);
  };

  const openPack = (pack: DailyWordPack) => {
    if (levelLocked(pack.level)) {
      setUpgradeLevel(pack.level);
      return;
    }
    setActivePackId(pack.id);
    setSelectedId(packWordsFor(pack)[0]?.wordId ?? effectiveWords[0]?.id);
  };

  const openLevel = (level: CourseLevel) => {
    if (levelLocked(level)) {
      setUpgradeLevel(level);
      return;
    }
    const pack = effectivePacks.find((item) => item.level === level);
    if (pack) openPack(pack);
  };

  const moveDay = (direction: -1 | 1) => {
    const nextPack = levelPacks[Math.min(Math.max(activeDayIndex + direction, 0), levelPacks.length - 1)];
    if (nextPack) openPack(nextPack);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="text-sm font-black tracking-[0.18em] text-pop">Word Link</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
            {language === "zh" ? "每日单词泡泡包" : "Daily Word Bubble Pack"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-ocean/70">
            {language === "zh"
              ? "先选等级，再一天一页。每页只学当天词量：听发音、拆词、找真实关联，最后说出一句能用的话。"
              : "Choose a level first, then study one page per day: hear it, break it down, connect it, then say one usable line."}
          </p>
        </div>
        <div className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-pop">{activePack.level}</p>
              <p className="mt-1 text-2xl font-black text-ink">
                Day {activePack.dayNumber} / {activePlan.totalDays}
              </p>
            </div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-skywash">
              <div className="h-full rounded-full bg-pop transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-peach px-4 py-2 text-sm font-black text-pop">
              <Clock3 size={16} />
              {activePack.estimatedMinutes} min
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {courseLevels.map((level) => {
          const setting = levelSettings[level];
          const plan = vocabularyLevelPlans.find((item) => item.level === level) ?? vocabularyLevelPlans[0];
          const isActive = activePack.level === level;
          const isLocked = levelLocked(level);
          const lockedBadge = level === "B1"
            ? language === "zh" ? "登录" : "Sign in"
            : language === "zh" ? "付费" : "Paid";
          const lockedLine = level === "B1"
            ? language === "zh" ? "登录后学习" : "Sign in to study"
            : language === "zh" ? "登录 + 付费解锁后学习" : "Sign in + unlock to study";
          return (
            <button
              key={level}
              type="button"
              onClick={() => openLevel(level)}
              className={`rounded-[22px] border p-4 text-left transition ${
                isActive
                  ? "border-ink bg-ink text-white shadow-soft"
                  : "border-blue-100 bg-white text-ink hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-black ${isActive ? "text-orange-200" : "text-pop"}`}>{level}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${isActive ? "bg-white/10" : "bg-skywash text-ocean"}`}>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1">
                      <LockKeyhole size={12} />
                      {lockedBadge}
                    </span>
                  ) : (
                    language === "zh" ? `${plan.totalDays} 天` : `${plan.totalDays} days`
                  )}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-black leading-6">{setting.title[language]}</h2>
              <p className="mt-3 text-sm font-black leading-6">
                <span className={isActive ? "text-orange-100" : "text-pop"}>
                  {language === "zh" ? "目标词量：" : "Target words:"}
                </span>{" "}
                <span className={isActive ? "text-white" : "text-ink"}>{levelTargetValue(level, language)}</span>
              </p>
              <p className="mt-2 text-sm font-bold leading-6">
                <span className={isActive ? "text-orange-100" : "text-pop"}>
                  {language === "zh" ? "每日安排：" : "Daily plan:"}
                </span>{" "}
                <span className={isActive ? "text-white/75" : "text-ocean/65"}>{levelDailyValue(level, language, plan)}</span>
              </p>
              <p className={`mt-3 text-sm font-black ${isActive ? "text-white" : "text-ocean"}`}>
                {isLocked
                  ? lockedLine
                  : language === "zh"
                    ? "每日词包学习"
                    : "daily word packs"}
              </p>
            </button>
          );
        })}
      </section>

      <section className="mb-7 rounded-[28px] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-pop">{language === "zh" ? "当前等级分页" : "Current Level Pages"}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">
              {levelSettings[activePack.level].title[language]} · Day {activePack.dayNumber} / {activePlan.totalDays}
            </h2>
            <p className="mt-2 font-bold text-ocean/65">
              {language === "zh"
                ? `今日新词 ${activePack.newWords.length} · 累计复习 ${activePack.reviewWords.length} · 识别词 ${activePack.recognitionWords.length} · 今日短语块 ${activePack.phraseChunks.length} · 今日句型 ${activePack.sentencePatterns.length}`
                : `${activePack.newWords.length} new · ${activePack.reviewWords.length} review · ${activePack.recognitionWords.length} recognition · ${activePack.phraseChunks.length} chunks · ${activePack.sentencePatterns.length} patterns`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => moveDay(-1)}
              disabled={activeDayIndex <= 0}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-3 font-black text-ink transition hover:bg-skywash disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={18} />
              {language === "zh" ? "上一天" : "Previous Day"}
            </button>
            <button
              type="button"
              onClick={() => moveDay(1)}
              disabled={activeDayIndex >= levelPacks.length - 1}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 font-black text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-40"
            >
              {language === "zh" ? "下一天" : "Next Day"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {levelPacks.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => openPack(pack)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                pack.id === activePack.id ? "bg-pop text-white" : "bg-skywash text-ocean hover:bg-peach"
              }`}
            >
              Day {pack.dayNumber}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[26px] border border-blue-100 bg-white p-4 shadow-sm lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-pop">{language === "zh" ? "今天这包词" : "Today's Pack"}</p>
              <h2 className="mt-1 text-xl font-black leading-6 text-ink">{activePack.title[language]}</h2>
            </div>
            <span className="rounded-full bg-skywash px-3 py-1 text-sm font-black text-ocean">{packWords.length} words</span>
          </div>

          <div className="mt-4 max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {packWords.map((word, index) => {
              const isSelected = selectedDaily?.wordId === word.wordId;
              const isLearned = learnedWords[word.wordId];

              return (
                <button
                  key={`${word.wordId}-${word.learningRole}`}
                  type="button"
                  onClick={() => setSelectedId(word.wordId)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                    isSelected ? "border-ink bg-skywash" : "border-blue-100 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${isLearned ? "bg-pop text-white" : "bg-peach text-pop"}`}>
                      {isLearned ? <Check size={16} /> : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-ink">{word.dutch}</p>
                      <p className="truncate text-xs font-bold text-ocean/65">
                        {word.meaning[language]}
                        {word.learningRole === "review" ? ` · ${language === "zh" ? "原始等级" : "original"} ${word.originalLevel}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ${roleClass(word.learningRole)}`}>
                    {roleLabel(word.learningRole, language)}
                  </span>
                </button>
              );
            })}
          </div>

        </aside>

        <div className="space-y-6">
          <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "当前单词" : "Current Word"}</p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <h2 className="text-5xl font-black leading-none text-ink sm:text-6xl">{selected.dutch}</h2>
                  <span className={`mb-1 rounded-full px-4 py-2 text-sm font-black ring-1 ${selectedWordKind.tone}`}>
                    {selectedWordKind.label}
                  </span>
                  {selected.article ? (
                    <span className="mb-1 rounded-full bg-peach px-4 py-2 text-lg font-black text-pop">{selected.article}</span>
                  ) : null}
                  {shouldShowPluralInWordHeader(selected) ? (
                    <span className="mb-1 rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">plural: {selected.plural}</span>
                  ) : null}
                </div>
                <p className="mt-4 text-2xl font-black text-ocean">
                  {selected.meaning.zh} <span className="text-ocean/30">/</span> {selected.meaning.en}
                </p>
                <p className="mt-3 max-w-3xl rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black leading-6 text-ocean">
                  {selectedWordKind.note}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDaily ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${roleClass(selectedDaily.learningRole)}`}>
                      {roleLabel(selectedDaily.learningRole, language)}
                      {selectedDaily.learningRole === "review" ? ` · ${language === "zh" ? "原始等级" : "original"} ${selectedDaily.originalLevel}` : ""}
                    </span>
                  ) : null}
                </div>
              </div>
              <AudioButton text={selected.audioText} label={language === "zh" ? "听单词" : "Hear Word"} />
            </div>

            {selectedBubble && (selectedBubble.pronunciationHint || selectedBubble.articleReason || selectedBubble.commonMistake) ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {selectedBubble.pronunciationHint ? (
                  <div className="rounded-2xl bg-skywash p-4">
                    <p className="text-xs font-black tracking-[0.1em] text-pop">{language === "zh" ? "发音提示" : "Pronunciation Hint"}</p>
                    <p className="mt-2 font-bold leading-6 text-ink">{selectedBubble.pronunciationHint}</p>
                  </div>
                ) : null}
                {selectedBubble.articleReason ? (
                  <div className="rounded-2xl bg-skywash p-4">
                    <p className="text-xs font-black tracking-[0.1em] text-pop">de/het</p>
                    <p className="mt-2 font-bold leading-6 text-ink">{selectedBubble.articleReason}</p>
                  </div>
                ) : null}
                {selectedBubble.commonMistake ? (
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <p className="text-xs font-black tracking-[0.1em] text-rose-600">{language === "zh" ? "易错点" : "Common Mistake"}</p>
                    <p className="mt-2 font-bold leading-6 text-ink">{selectedBubble.commonMistake}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-7">
              <div className="rounded-[24px] border border-orange-100 bg-peach/55 p-5 md:col-span-2">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "记忆路径" : "Memory Path"}</p>
                    <h3 className="mt-2 text-2xl font-black leading-8 text-ink">
                      {selected.dutch}
                      <span className="mx-2 text-pop">→</span>
                      {selected.meaning.zh}
                      <span className="mx-2 text-ocean/30">/</span>
                      {selected.meaning.en}
                    </h3>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-2xl bg-white px-4 py-3 text-sm font-black leading-6 text-ocean shadow-sm">
                    {strategyBadgeLabel(memoryPath.strategy, memoryPath.wordType, language)}
                  </div>
                </div>

                {isLearnerVisibleText(memoryExplanation) ? (
                  <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold leading-6 text-ocean">
                    {memoryExplanation}
                  </p>
                ) : null}

                {memorySteps.length ? (
                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {memorySteps.map((step, index) => (
                      <div key={`${step.label}-${index}`} className="flex gap-3 rounded-2xl bg-white/85 p-4 shadow-sm">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-sm font-black text-pop">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black tracking-[0.08em] text-pop">{step.label}</p>
                          <p className="mt-1 break-words text-base font-bold leading-7 text-ink">{step.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {debugContent && memoryPath.warnings?.length ? (
                  <div className="mt-4 space-y-2">
                    {memoryPath.warnings.map((warning) => (
                      <p key={warning.zh} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
                        {language === "zh" ? warning.zh : warning.en}
                      </p>
                    ))}
                  </div>
                ) : null}

              </div>
            </div>

            {!isNumberMemoryPath && hasOutputSentence && firstOutputSentence ? (
            <div className="mt-5 rounded-[24px] bg-ink p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-orange-200">{language === "zh" ? "我能说的一句" : "One Sentence I Can Say"}</p>
                <AudioButton text={firstOutputSentence.dutch} label={language === "zh" ? "听句子" : "Hear Sentence"} />
              </div>
              <p className="mt-4 text-2xl font-black leading-9">{firstOutputSentence.dutch}</p>
              <p className="mt-2 font-bold leading-7 text-white/70">{language === "zh" ? firstOutputSentence.meaningZh : firstOutputSentence.meaningEn}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(visiblePhraseChunkDetails.length || visibleMemoryPhraseChunks.length) ? (
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-black text-orange-200">{language === "zh" ? "今日短语块" : "Phrase Chunks"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(visiblePhraseChunkDetails.length
                        ? visiblePhraseChunkDetails.map((chunk) => chunk.dutch)
                        : visibleMemoryPhraseChunks.map((chunk) => chunk.dutch)
                      ).slice(0, 4).map((chunk) => (
                        <span key={chunk} className="rounded-full bg-white px-3 py-1 text-sm font-black text-ink">
                          {chunk}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-black text-orange-200">{language === "zh" ? "相关句型" : "Related Patterns"}</p>
                  <div key={`${selected.id}-patterns`} className="mt-3 space-y-2">
                    {visibleOutputPatternSentences.slice(0, 3).map((pattern) => (
                      <p key={pattern.dutch} className="font-black leading-6 text-white">{pattern.dutch}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            ) : null}

            {selectedVerb ? (
              <div className="mt-5 rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black tracking-[0.14em] text-pop">
                      {language === "zh" ? "动词用法" : "Verb Forms"}
                    </p>
                    <h3 className="mt-2 text-3xl font-black text-ink">{selectedVerb.infinitive}</h3>
                    <p className="mt-2 max-w-2xl font-bold leading-7 text-ocean/70">{selectedVerb.rule[language]}</p>
                  </div>
                  <div className="rounded-2xl bg-peach px-4 py-3 text-sm font-black leading-6 text-pop">
                    {language === "zh" ? "先看主语，再变动词" : "Look at the subject first"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { label: language === "zh" ? "我" : "I", form: selectedVerb.ikForm, hint: language === "zh" ? "ik：去掉 -en" : "ik: remove -en" },
                    { label: language === "zh" ? "你/他/她/它/您" : "you/he/she/it/u", form: selectedVerb.jijForm, hint: language === "zh" ? "单数主语：通常加 t" : "singular subjects: usually add t" },
                    { label: language === "zh" ? "我们/你们/他们" : "we/you all/they", form: selectedVerb.wijForm, hint: language === "zh" ? "复数：用原本的样子" : "plural: use the base form" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-skywash p-4">
                      <p className="text-xs font-black tracking-[0.1em] text-pop">{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-ink">{item.form}</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-ocean/65">{item.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-pop">{language === "zh" ? "记忆口诀" : "Memory Rule"}</p>
                  <p className="mt-2 text-lg font-black leading-8 text-ink">{selectedVerb.hint[language]}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedVerb.examples.map((example) => (
                      <span key={example} className="rounded-full bg-white px-3 py-1 text-sm font-black text-ocean ring-1 ring-blue-100">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveWord(-1)}
                  disabled={selectedIndex <= 0}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-3 font-black text-ink transition hover:bg-skywash disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={18} />
                  {language === "zh" ? "上一个" : "Previous"}
                </button>
                <button
                  type="button"
                  onClick={() => moveWord(1)}
                  disabled={selectedIndex >= packWords.length - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-3 font-black text-ink transition hover:bg-skywash disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {language === "zh" ? "下一个" : "Next"}
                  <ArrowRight size={18} />
                </button>
                {hasNextDay && isLastWordInPack && !isDayComplete ? (
                  <button
                    type="button"
                    onClick={() => moveDay(1)}
                    className="inline-flex items-center gap-2 rounded-full bg-pop px-5 py-3 font-black text-white shadow-sm transition hover:bg-orange-400"
                  >
                    {language === "zh" ? "进入下一天" : "Start Next Day"}
                    <ArrowRight size={18} />
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => toggleLearnedWord(selectedDaily?.wordId ?? selected.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-black transition ${
                  learnedWords[selectedDaily?.wordId ?? selected.id] ? "bg-pop text-white" : "bg-ink text-white hover:bg-ocean"
                }`}
              >
                <CheckCircle2 size={19} />
                {learnedWords[selectedDaily?.wordId ?? selected.id] ? (language === "zh" ? "已记住" : "Learned") : language === "zh" ? "我记住了" : "Mark Learned"}
              </button>
            </div>
            {isDayComplete ? (
              <div className="mt-5">
                <NextStepCard
                  eyebrow={language === "zh" ? "学习接力" : "Learning handoff"}
                  currentLabel={language === "zh" ? "今日单词已完成" : "Today's words complete"}
                  title={
                    isStarterWordsPack && !learningProgress.grammarBaseCompleted
                      ? language === "zh"
                        ? "下一步：最小语法地基"
                        : "Next: Grammar Base 1"
                      : language === "zh"
                        ? "下一步：今日小规则"
                        : "Next: today's rule"
                  }
                  reason={
                    isStarterWordsPack && !learningProgress.grammarBaseCompleted
                      ? language === "zh"
                        ? "你已经用一小包生存词开口了，现在补 ik ben、jij bent、Waar woon je 这些最小规则。"
                        : "You have used a tiny starter pack. Now add ik ben, jij bent, and Waar woon je."
                      : language === "zh"
                        ? "遇到今天需要的规则再补，不用一口气学完整本语法。"
                        : "Add the rule needed today instead of studying all grammar upfront."
                  }
                  buttonLabel={
                    isStarterWordsPack && !learningProgress.grammarBaseCompleted
                      ? language === "zh"
                        ? "去最小语法"
                        : "Open Grammar Base 1"
                      : language === "zh"
                        ? "看今日小规则"
                        : "Open today's rule"
                  }
                  route={dayCompleteRoute}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-full bg-peach text-pop">
                    <Sparkles size={18} />
                  </span>
                  <h2 className="text-2xl font-black text-ink">{language === "zh" ? "记忆关联泡泡" : "Memory Link Bubbles"}</h2>
                </div>
                <p className="mt-2 max-w-3xl font-bold leading-7 text-ocean/65">
                  {language === "zh"
                    ? "悬停看一句解释，点开能看的关联词；这里只放真的能帮你记住的关系。"
                    : "Hover for a memory clue. Open linked words when they are in the course vocabulary."}
                </p>
              </div>
              {relatedWords.length ? (
                <span className="w-fit rounded-full bg-skywash px-3 py-1 text-xs font-black text-ocean">
                  {relatedWords.length} {language === "zh" ? "个关联" : "links"}
                </span>
              ) : null}
            </div>

            <div className="mt-5">
              <MemoryLinkConstellation
                centerWord={selected.dutch}
                links={relatedWords}
                language={language}
                onSelect={(word) => {
                  if (word.wordId) {
                    setExtensionPanel(null);
                    setSelectedId(word.wordId);
                    return;
                  }
                  if (word.isExtensionWord ?? word.isExtensionTarget) {
                    setExtensionPanel(word);
                  }
                }}
              />
              {extensionPanel ? (
                <div className="mt-4 rounded-[24px] border border-blue-100 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black tracking-[0.14em] text-pop">
                        {language === "zh" ? "扩展词 / 识别即可" : "Extension / Recognition"}
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{extensionPanel.dutch}</h3>
                      {extensionPanel.meaning?.[language] ? (
                        <p className="mt-1 font-black text-ocean/70">{extensionPanel.meaning[language]}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
                      {extensionPanel.kind[language]}
                    </span>
                  </div>
                  <p className="mt-4 border-l-4 border-orange-300 pl-4 font-bold leading-7 text-ocean/75">
                    {extensionPanel.reason[language]}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

        </div>
      </section>
      <UpgradeModal open={Boolean(upgradeLevel)} lockedLevel={upgradeLevel} onClose={() => setUpgradeLevel(undefined)} />
    </main>
  );
}

export default function WordLinkPage() {
  return <WordLinkContent />;
}
