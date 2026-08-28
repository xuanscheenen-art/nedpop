"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  Ear,
  Network,
  Puzzle,
  Search,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const content = {
  zh: {
    heroTitle: "先搞懂，再记住。",
    heroLines: [
      "NedPop（内德泡泡）是为中文学习者设计的荷兰语学习平台。",
      "我们不想让学习从一张陌生的单词表开始。",
      "先知道荷兰语怎么读、句子怎么运作，再去记单词。理解得越多，记忆就越有抓手。",
    ],
    heroPath: [["01", "怎么读", "发音"], ["02", "怎么运作", "语法"], ["03", "怎么记住", "词汇"]],
    orderLabel: "学习顺序",
    orderTitle: "学习不是三个平行入口。",
    orderIntro: "先建立声音，再理解规则，最后让词汇真正留下来。",
    open: "进入",
    learningSteps: [
      { number: "01", name: "发音解码", headline: "先知道它怎么读。", description: "从26个字母、长短元音和特殊声音组合开始，逐渐建立荷兰语的声音规律。", href: "/pronunciation", icon: Ear },
      { number: "02", name: "语法规则", headline: "再知道它为什么这么说。", description: "理解 de/het、动词变化、单复数和词序，让句子不再只是需要死记的字符串。", href: "/rules", icon: Puzzle },
      { number: "03", name: "每日单词泡泡", headline: "然后，开始真正记单词。", description: "具备基础发音和语法认知之后，再逐渐积累真实荷兰语词汇。", href: "/word-link", icon: BookOpenCheck },
    ],
    memoryLabel: "记忆路径",
    memoryTitle: "一个单词，不只有一种记法。",
    memoryIntro: "不同单词适合不同的连接方式。英文桥梁、拆词与词根、复合词关系、已知词联想、词族关系、同义与反义，都会在真正有帮助时出现。",
    memoryNote: "NedPop 不是要求你硬记，而是在帮你找到这个词为什么能被记住。",
    memorySteps: [
      { label: "陌生词", value: "ziekenhuis" },
      { label: "发现可以拆开的部分", value: "ziek + huis" },
      { label: "连接已经认识的词", value: "sick + house" },
      { label: "建立含义联系", value: "生病的人去的房子" },
      { label: "记住", value: "医院" },
    ],
    linksLabel: "单词关联泡泡",
    linksTitle: "单词不是孤立存在的。",
    linksIntro: "一个词会连接到组成它的词、同词根词、复合词、近义词、反义词和相关场景。连接越清楚，词汇网络就越稳。",
    centerMeaning: "医院",
    wordLinks: [
      { label: "组成它的词", word: "ziek", meaning: "生病的" },
      { label: "组成它的词", word: "huis", meaning: "房子" },
      { label: "同词根词", word: "ziekte", meaning: "疾病" },
      { label: "复合词", word: "huisarts", meaning: "家庭医生" },
      { label: "近义关联", word: "kliniek", meaning: "诊所" },
      { label: "相关场景", word: "afspraak", meaning: "预约" },
    ],
    finalTitle: "先理解，再建立连接，最后真正记住。",
    finalIntro: "发音、语法和记忆方法最终服务于完整的 A0–B1 学习路径。NedPop 不只提供零散工具，也提供系统学习内容。",
    start: "开始学习",
    resources: "免费学习资源",
    resourcesIntro: "随时打开，查清楚再继续学。",
    publicTools: [{ name: "发音解码", href: "/pronunciation" }, { name: "语法规则", href: "/rules" }, { name: "单词变形表", href: "/special-forms" }],
  },
  en: {
    heroTitle: "Understand first. Remember for real.",
    heroLines: [
      "NedPop is a Dutch learning platform designed for Chinese-speaking learners.",
      "We do not want learning to begin with an unfamiliar word list.",
      "First understand how Dutch sounds and how its sentences work, then learn the words. The more you understand, the more memory has to hold on to.",
    ],
    heroPath: [["01", "How it sounds", "Pronunciation"], ["02", "How it works", "Grammar"], ["03", "How it sticks", "Vocabulary"]],
    orderLabel: "Learning order",
    orderTitle: "Learning is not three parallel entrances.",
    orderIntro: "Build the sound system first, understand the rules next, then make vocabulary stick.",
    open: "Explore",
    learningSteps: [
      { number: "01", name: "Pronunciation Decoder", headline: "First, know how it sounds.", description: "Start with 26 letters, long and short vowels, and special sound combinations to build an ear for Dutch.", href: "/pronunciation", icon: Ear },
      { number: "02", name: "Grammar Rules", headline: "Then, know why it is said that way.", description: "Understand de/het, verb forms, singular and plural, and word order, so sentences stop feeling like strings to memorize.", href: "/rules", icon: Puzzle },
      { number: "03", name: "Daily Word Bubbles", headline: "Then, start truly learning words.", description: "Once pronunciation and grammar have a foundation, gradually build real Dutch vocabulary.", href: "/word-link", icon: BookOpenCheck },
    ],
    memoryLabel: "Memory paths",
    memoryTitle: "One word does not have only one way to be remembered.",
    memoryIntro: "Different words call for different connections. English bridges, roots, compounds, familiar words, word families, synonyms and antonyms appear only when they genuinely help.",
    memoryNote: "NedPop does not ask you to memorize harder. It helps you find why a word can be remembered.",
    memorySteps: [
      { label: "An unfamiliar word", value: "ziekenhuis" },
      { label: "Find the parts", value: "ziek + huis" },
      { label: "Connect familiar words", value: "sick + house" },
      { label: "Build the meaning", value: "a house for sick people" },
      { label: "Remember", value: "hospital" },
    ],
    linksLabel: "Word association bubbles",
    linksTitle: "Words do not exist in isolation.",
    linksIntro: "A word can connect to its parts, roots, compounds, near-synonyms, opposites and real-life contexts. Clearer links build a stronger vocabulary network.",
    centerMeaning: "hospital",
    wordLinks: [
      { label: "Word part", word: "ziek", meaning: "sick" },
      { label: "Word part", word: "huis", meaning: "house" },
      { label: "Same root", word: "ziekte", meaning: "illness" },
      { label: "Compound", word: "huisarts", meaning: "general practitioner" },
      { label: "Related meaning", word: "kliniek", meaning: "clinic" },
      { label: "Related context", word: "afspraak", meaning: "appointment" },
    ],
    finalTitle: "Understand first, build connections next, then truly remember.",
    finalIntro: "Pronunciation, grammar and memory methods all support a complete A0–B1 learning path. NedPop offers structured learning as well as focused tools.",
    start: "Start learning",
    resources: "Free learning tools",
    resourcesIntro: "Open one whenever you need to understand something before moving on.",
    publicTools: [{ name: "Pronunciation Decoder", href: "/pronunciation" }, { name: "Grammar Rules", href: "/rules" }, { name: "Word Forms", href: "/special-forms" }],
  },
} as const;

export default function AboutPage() {
  const { language } = useLanguage();
  const copy = content[language];
  const { learningSteps, memorySteps, wordLinks, publicTools } = copy;
  return (
    <main className="overflow-hidden bg-white">
      <section className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl content-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="relative z-10 self-center">
          <p className="text-sm font-black tracking-[0.18em] text-pop">NedPop 内德泡泡</p>
          <h1 className="mt-5 break-keep text-5xl font-black leading-tight text-ink sm:text-6xl">{copy.heroTitle}</h1>
          <div className="mt-7 max-w-2xl space-y-4 text-lg font-bold leading-8 text-ocean/75 sm:text-xl sm:leading-9">
            {copy.heroLines.map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center self-center py-8">
          <div className="absolute inset-x-8 top-1/2 h-2 -translate-y-1/2 rounded-full bg-peach sm:inset-x-16" />
          <div className="relative grid w-full grid-cols-3 items-center gap-3 sm:gap-5">
            {copy.heroPath.map(([number, question, answer], index) => (
              <div
                key={number}
                className={`flex aspect-square min-w-0 flex-col items-center justify-center rounded-full border-8 border-white px-2 text-center shadow-soft sm:border-[12px] ${
                  index === 2 ? "bg-pop text-ink" : "bg-ink text-white"
                }`}
              >
                <span className={`text-xs font-black sm:text-sm ${index === 2 ? "text-ink/60" : "text-orange-200"}`}>
                  {number}
                </span>
                <span className="mt-2 text-base font-black leading-tight sm:text-2xl">{question}</span>
                <span className={`mt-2 text-xs font-bold sm:text-sm ${index === 2 ? "text-ink/70" : "text-blue-100"}`}>
                  {answer}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black tracking-[0.18em] text-pop">{copy.orderLabel}</p>
          <h2 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{copy.orderTitle}</h2>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">{copy.orderIntro}</p>

          <ol className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
            {learningSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="contents">
                  <Link
                    href={step.href}
                    className="group flex min-h-72 flex-col rounded-[28px] border border-blue-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-orange-200 sm:p-8"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-black tracking-[0.15em] text-pop">{step.number}</span>
                      <span className="flex size-11 items-center justify-center rounded-full bg-peach text-pop">
                        <Icon size={21} />
                      </span>
                    </div>
                    <p className="mt-8 text-sm font-black text-ocean/55">{step.name}</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-ink">{step.headline}</h3>
                    <p className="mt-4 flex-1 font-bold leading-7 text-ocean/70">{step.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-black text-ocean">
                      {language === "zh" ? `${copy.open}${step.name}` : `${copy.open} ${step.name}`}
                      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                  {index < learningSteps.length - 1 ? (
                    <div className="flex items-center justify-center py-1 text-pop lg:px-1" aria-hidden="true">
                      <ArrowDown className="lg:hidden" />
                      <ArrowRight className="hidden lg:block" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">{copy.memoryLabel}</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">{copy.memoryTitle}</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-ocean/70">{copy.memoryIntro}</p>
            <p className="mt-6 rounded-2xl border-l-4 border-pop bg-peach/55 px-5 py-4 text-lg font-black leading-8 text-ink">
              {copy.memoryNote}
            </p>
          </div>

          <div className="rounded-[32px] bg-ink p-5 shadow-soft sm:p-8">
            <ol className="grid gap-3">
              {memorySteps.map((step, index) => (
                <li key={step.label} className="grid grid-cols-[42px_1fr] items-center gap-3 sm:grid-cols-[48px_1fr]">
                  <span className="flex size-10 items-center justify-center rounded-full bg-pop text-sm font-black text-ink sm:size-12">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={`rounded-2xl px-5 py-4 ${index === memorySteps.length - 1 ? "bg-pop" : "bg-white/10"}`}>
                    <p className={`text-xs font-black ${index === memorySteps.length - 1 ? "text-ink/60" : "text-orange-200"}`}>
                      {step.label}
                    </p>
                    <p className={`mt-1 text-xl font-black ${index === memorySteps.length - 1 ? "text-ink" : "text-white"}`}>
                      {step.value}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-skywash py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">{copy.linksLabel}</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">{copy.linksTitle}</h2>
            <p className="mt-5 max-w-xl text-lg font-bold leading-8 text-ocean/70">{copy.linksIntro}</p>
          </div>

          <div className="relative min-h-[590px] rounded-[36px] border border-blue-100 bg-white p-5 shadow-soft sm:p-8">
            <div className="absolute left-1/2 top-1/2 z-10 flex size-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[10px] border-white bg-ink text-center text-white shadow-soft sm:size-52">
              <Network size={22} className="text-orange-200" />
              <span className="mt-3 text-2xl font-black sm:text-3xl">ziekenhuis</span>
              <span className="mt-1 text-sm font-bold text-blue-100">{copy.centerMeaning}</span>
            </div>
            <div className="grid h-full min-h-[525px] grid-cols-2 content-between gap-5 sm:grid-cols-3">
              {wordLinks.map((link, index) => (
                <div
                  key={`${link.label}-${link.word}`}
                  className={`relative z-20 self-center rounded-[24px] border p-4 text-center shadow-soft sm:p-5 ${
                    index < 2 ? "border-orange-200 bg-peach/65" : "border-cyan-200 bg-cyan-50"
                  } ${index === 4 ? "sm:col-start-1" : ""}`}
                >
                  <p className="text-xs font-black text-ocean/55">{link.label}</p>
                  <p className="mt-2 text-xl font-black text-ink sm:text-2xl">{link.word}</p>
                  <p className="mt-1 text-sm font-bold text-ocean/60">{link.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[36px] bg-ink p-7 text-white shadow-soft sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-orange-200">A0 → B1</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{copy.finalTitle}</h2>
            <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-blue-100">{copy.finalIntro}</p>
          </div>
          <Link
            href="/pronunciation"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pop px-6 py-3 font-black text-ink transition hover:-translate-y-0.5 hover:bg-orange-300"
          >
            {copy.start}
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-blue-100 pt-9 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black tracking-[0.15em] text-pop">
              <Sparkles size={17} />
              {copy.resources}
            </p>
            <p className="mt-2 font-bold text-ocean/65">{copy.resourcesIntro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {publicTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-3 font-black text-ocean shadow-soft transition hover:border-orange-200 hover:text-ink"
              >
                <Search size={16} className="text-pop" />
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
