"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Ear, MessageCircle, Puzzle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const method = [
  {
    title: { zh: "发音底座", en: "Pronunciation" },
    detail: { zh: "先读得出来", en: "Read words first" },
    icon: Ear,
  },
  {
    title: { zh: "A0 Day 1", en: "A0 Day 1" },
    detail: { zh: "先能开口", en: "Say starter lines" },
    icon: MessageCircle,
  },
  {
    title: { zh: "最小语法", en: "Tiny grammar" },
    detail: { zh: "只学立刻能用的", en: "Only what you need now" },
    icon: Puzzle,
  },
  {
    title: { zh: "每日泡泡", en: "Daily bubbles" },
    detail: { zh: "每天扩一点词", en: "Grow words daily" },
    icon: BookOpenCheck,
  },
  {
    title: { zh: "遇到再补", en: "Rules on demand" },
    detail: { zh: "规则跟着课程走", en: "Add rules when needed" },
    icon: Puzzle,
  },
  {
    title: { zh: "场景输出", en: "Scenario output" },
    detail: { zh: "最后说出来", en: "Use it out loud" },
    icon: MessageCircle,
  },
] as const;

const usageSteps = [
  {
    title: { zh: "发音底座", en: "Sound base" },
    body: {
      zh: "先学字母和组合音，看到新词能自己读。",
      en: "Learn letters and sound chunks so you can read new words yourself.",
    },
    icon: Ear,
  },
  {
    title: { zh: "A0 Day 1 生存词", en: "A0 Day 1 starter" },
    body: {
      zh: "在第一课里用 ik、ben、woon、kom、naam 这些小词说出第一批句子。",
      en: "Inside Lesson 1, use ik, ben, woon, kom, and naam to say your first lines.",
    },
    icon: MessageCircle,
  },
  {
    title: { zh: "最小语法地基", en: "Grammar Base 1" },
    body: {
      zh: "只学 zijn、hebben、基础词序和简单问题。",
      en: "Learn only zijn, hebben, basic word order, and simple questions.",
    },
    icon: Puzzle,
  },
  {
    title: { zh: "每日单词泡泡", en: "Daily word bubbles" },
    body: {
      zh: "每天学一小包词，用记忆路径、联想泡泡和例句记住。",
      en: "Learn one small word pack each day with memory paths, links, and examples.",
    },
    icon: BookOpenCheck,
  },
  {
    title: { zh: "遇到再补语法", en: "Grammar on demand" },
    body: {
      zh: "课程遇到 de/het、复数、niet/geen、完成式时再补规则。",
      en: "Add de/het, plurals, niet/geen, and perfect tense when lessons need them.",
    },
    icon: Puzzle,
  },
  {
    title: { zh: "场景输出", en: "Scenario output" },
    body: {
      zh: "最后把词放进医生、市政厅、超市、交通等场景里说出来。",
      en: "Then use those words in GP, municipality, supermarket, and transport scenarios.",
    },
    icon: MessageCircle,
  },
] as const;

export default function LandingPage() {
  const { t, language } = useLanguage();

  return (
    <main className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-68px)] max-w-6xl content-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="self-center">
          <p className="text-sm font-black tracking-[0.18em] text-pop">Dutch from zero</p>
          <h1 className="mt-5 text-6xl font-black leading-none text-ink sm:text-7xl">{t("landing.title")}</h1>
          <p className="mt-6 text-3xl font-black leading-tight text-ocean">{t("landing.subtitle")}</p>
          <p className="mt-5 max-w-xl text-xl font-bold leading-9 text-ocean/70">
            {t("landing.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-black text-white shadow-soft transition hover:bg-ocean"
            >
              {t("landing.cta.start")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/pronunciation"
              className="inline-flex items-center justify-center rounded-full bg-skywash px-6 py-4 font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
            >
              {t("landing.cta.decoder")}
            </Link>
          </div>
        </div>

        <div className="relative self-center rounded-[34px] border border-blue-100 bg-slate-50 p-5 shadow-soft sm:p-7">
          <div className="absolute right-8 top-8 size-16 rounded-full bg-peach/70" />
          <div className="absolute bottom-10 right-24 size-8 rounded-full bg-mint" />
          <p className="relative text-sm font-black tracking-[0.16em] text-pop">{t("landing.exampleLink")}</p>
          <div className="relative mt-5 rounded-[28px] bg-white p-6 ring-1 ring-blue-100">
            <p className="text-5xl font-black text-ink">ziekenhuis</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xl font-black text-ocean">
              <span className="rounded-full bg-skywash px-4 py-2">ziek</span>
              <span className="text-pop">+</span>
              <span className="rounded-full bg-skywash px-4 py-2">huis</span>
              <span className="text-pop">=</span>
              <span className="rounded-full bg-peach px-4 py-2">sick house</span>
            </div>
            <div className="mt-6 rounded-3xl bg-ink p-5 text-white">
              <p className="text-sm font-black text-orange-200">Memory result</p>
              <p className="mt-2 text-3xl font-black">{language === "zh" ? "医院 / hospital" : "hospital"}</p>
              <p className="mt-3 font-bold leading-7 text-blue-50">
                {language === "zh"
                  ? "生病的人去的 house，就是 ziekenhuis。"
                  : "A house for people who are sick: that is ziekenhuis."}
              </p>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {method.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title.zh} className="rounded-3xl bg-white p-4 ring-1 ring-blue-100">
                  <Icon size={20} className="text-pop" />
                  <p className="mt-3 text-lg font-black text-ink">{step.title[language]}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-ocean/65">{step.detail[language]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black tracking-[0.18em] text-pop">Learning flow</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink">
              {language === "zh" ? "先按这个顺序学" : "Learn in this order"}
            </h2>
            <p className="mt-4 text-lg font-bold leading-8 text-ocean/70">
              {language === "zh"
                ? "先会读。再用一小包生存词开口。然后学最小语法地基。之后每天靠单词泡泡扩词汇，遇到规则再补语法。最后进入场景输出。"
                : "Read first. Say starter lines with a tiny word pack. Add the smallest grammar base. Then grow words through daily bubbles, add rules when needed, and finish with scenario output."}
            </p>
          </div>

          <ol className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {usageSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title.zh} className="rounded-[22px] bg-slate-50 p-4 ring-1 ring-blue-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-peach text-pop">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-black text-ocean/40">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-black leading-tight text-ink">{step.title[language]}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{step.body[language]}</p>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 rounded-[22px] bg-ink px-5 py-4 text-lg font-black leading-8 text-white">
            {language === "zh"
              ? "先打地基，再每天学，最后开口用。"
              : "Build the base first, learn a little each day, then use it out loud."}
          </p>
        </div>
      </section>
    </main>
  );
}
