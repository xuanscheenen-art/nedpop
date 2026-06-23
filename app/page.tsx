"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarDays, Ear, MessageCircle, Puzzle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const method = [
  { key: "method.decode", detail: { zh: "先读得出来", en: "Read the sounds first" }, icon: Ear },
  { key: "method.link", detail: { zh: "把词变成记忆", en: "Turn words into memory" }, icon: BookOpenCheck },
  { key: "method.rule", detail: { zh: "固定规则反复套", en: "Practice fixed patterns" }, icon: Puzzle },
  { key: "method.speak", detail: { zh: "放进真实场景", en: "Use it in real situations" }, icon: MessageCircle },
] as const;

const usageSteps = [
  {
    title: { zh: "发音解码", en: "Pronunciation decoder" },
    body: {
      zh: "先学 26 个字母和特殊组合音，看到词先能读出来。",
      en: "Start with the 26 letters and special sound combinations so you can read words first.",
    },
    icon: Ear,
  },
  {
    title: { zh: "每日课程", en: "Daily lessons" },
    body: {
      zh: "从 A0 Day 1 开始，每天只学一小包内容。",
      en: "Begin at A0 Day 1 and learn one small pack each day.",
    },
    icon: CalendarDays,
  },
  {
    title: { zh: "单词泡泡", en: "Word bubbles" },
    body: {
      zh: "用记忆路径、词形联想、同类词和例句记住单词。",
      en: "Use memory paths, word-form links, category links, and example sentences to remember words.",
    },
    icon: BookOpenCheck,
  },
  {
    title: { zh: "语法规则", en: "Grammar rules" },
    body: {
      zh: "遇到动词、de/het、复数、词序时，再用规则卡搞懂。",
      en: "When verbs, de/het, plurals, or word order appear, use rule cards to understand them.",
    },
    icon: Puzzle,
  },
  {
    title: { zh: "场景输出", en: "Scenario output" },
    body: {
      zh: "最后进入医生、市政厅、超市、交通等场景，把前面学的说出来。",
      en: "Finally enter GP, municipality, supermarket, transport, and other scenarios to say what you learned.",
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

          <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
            {method.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="rounded-3xl bg-white p-4 ring-1 ring-blue-100">
                  <Icon size={20} className="text-pop" />
                  <p className="mt-3 text-lg font-black text-ink">{t(step.key)}</p>
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
              {language === "zh" ? "怎么使用内德泡泡？" : "How to use NedPop"}
            </h2>
            <p className="mt-4 text-lg font-bold leading-8 text-ocean/70">
              {language === "zh"
                ? "不要一上来就背场景。先会读，再记词，再懂规则，最后才开口用。"
                : "Do not start by memorizing scenarios. First read sounds, then learn words, understand rules, and only then use Dutch out loud."}
            </p>
          </div>

          <ol className="mt-7 grid gap-4 lg:grid-cols-5">
            {usageSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title.zh} className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-blue-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-peach text-pop">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-black text-ocean/40">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black leading-tight text-ink">{step.title[language]}</h3>
                  <p className="mt-3 text-sm font-bold leading-7 text-ocean/70">{step.body[language]}</p>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 rounded-[22px] bg-ink px-5 py-4 text-lg font-black leading-8 text-white">
            {language === "zh"
              ? "场景练习不是入口，是出口。"
              : "Scenario practice is not the entrance. It is the exit."}
          </p>
        </div>
      </section>
    </main>
  );
}
