"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { BookOpenText, CheckCircle2, Clock3, ExternalLink, FileText, Headphones, Mic, ShieldCheck, Volume2 } from "lucide-react";
import {
  defaultDuoExamPracticeLevel,
  duoExamPracticeLevels,
  type DuoPracticeLevel,
  type DuoPracticeSection,
} from "@/data/duoExamPractice";
import { useLanguage } from "@/lib/i18n";

const sectionIcons: Record<DuoPracticeSection["id"], typeof FileText> = {
  writing: FileText,
  speaking: Mic,
  listening: Headphones,
  reading: BookOpenText,
  knm: ShieldCheck,
};

function openLabel(kind: "pdf" | "online", language: "zh" | "en") {
  if (kind === "pdf") {
    return language === "zh" ? "打开官方 PDF" : "Open official PDF";
  }

  return language === "zh" ? "打开官方练习" : "Open official practice";
}

function attemptsCountLabel(count: number, language: "zh" | "en") {
  return language === "zh" ? `${count} 个入口` : `${count} ${count === 1 ? "entry" : "entries"}`;
}

function getLevelFromUrl(): DuoPracticeLevel {
  if (typeof window === "undefined") return defaultDuoExamPracticeLevel;

  const level = new URLSearchParams(window.location.search).get("level")?.toUpperCase();
  return duoExamPracticeLevels.find((item) => item.level === level)?.level ?? defaultDuoExamPracticeLevel;
}

export default function ExamPracticePage() {
  const { language } = useLanguage();
  const [selectedLevelId, setSelectedLevelId] = useState<DuoPracticeLevel>(defaultDuoExamPracticeLevel);
  const selectedLevel = duoExamPracticeLevels.find((level) => level.level === selectedLevelId) ?? duoExamPracticeLevels[0];

  useEffect(() => {
    const syncSelectedLevel = () => setSelectedLevelId(getLevelFromUrl());
    const syncVisibleLevel = () => {
      if (!document.hidden) syncSelectedLevel();
    };

    syncSelectedLevel();
    window.addEventListener("popstate", syncSelectedLevel);
    window.addEventListener("pageshow", syncSelectedLevel);
    window.addEventListener("focus", syncSelectedLevel);
    document.addEventListener("visibilitychange", syncVisibleLevel);

    return () => {
      window.removeEventListener("popstate", syncSelectedLevel);
      window.removeEventListener("pageshow", syncSelectedLevel);
      window.removeEventListener("focus", syncSelectedLevel);
      document.removeEventListener("visibilitychange", syncVisibleLevel);
    };
  }, []);

  const selectLevel = (level: DuoPracticeLevel) => {
    setSelectedLevelId(level);
    window.history.replaceState(null, "", `/exam-practice?level=${level}`);
  };

  const openExternalPractice = (event: MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">DUO EXAM RESOURCES</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
              {language === "zh" ? "考试练习资源" : "Exam Practice Resources"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
              {language === "zh"
                ? "这里整理官方公开练习入口，并把考试常见任务拆成可先练的小卡片。官方题目仍然在 DUO / Staatsexamen 练习环境里完成。"
                : "This page gathers official public practice entries and breaks common exam tasks into smaller drills. Official tasks still happen in the DUO / Staatsexamen practice environment."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {duoExamPracticeLevels.map((level) => {
                const isActive = level.level === selectedLevel.level;
                return (
                  <button
                    key={level.level}
                    type="button"
                    onClick={() => selectLevel(level.level)}
                    className={`rounded-full px-5 py-3 text-sm font-black transition ${
                      isActive
                        ? "bg-ink text-white"
                        : level.status === "ready"
                          ? "bg-skywash text-ocean hover:bg-blue-100"
                          : "bg-slate-100 text-ocean/60 hover:bg-blue-50"
                    }`}
                  >
                    {level.level}
                    {level.status === "planned" ? (
                      <span className={isActive ? "ml-2 text-orange-200" : "ml-2 text-pop"}>
                        {language === "zh" ? "待接入" : "planned"}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-skywash p-5 ring-1 ring-blue-100">
            <p className="text-sm font-black text-pop">{language === "zh" ? "官方总入口" : "Official portals"}</p>
            <div className="mt-3 grid gap-2">
              {selectedLevel.officialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => openExternalPractice(event, link.url)}
                  className="inline-flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-ocean ring-1 ring-blue-100 transition hover:bg-blue-50"
                >
                  {link.label}
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-pop">{selectedLevel.level}</p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">{selectedLevel.title[language]}</h2>
            <p className="mt-3 max-w-3xl text-base font-bold leading-8 text-ocean/70">{selectedLevel.subtitle[language]}</p>
          </div>
          <span className="w-fit rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
            {selectedLevel.sections.reduce((total, section) => total + section.attempts.length, 0)}
            {language === "zh" ? " 个资源" : " resources"}
          </span>
        </div>

        {selectedLevel.sections.length === 0 ? (
          <div className="mt-6 rounded-[28px] bg-slate-50 p-6 text-base font-bold leading-8 text-ocean/70 ring-1 ring-blue-100">
            {selectedLevel.emptyState[language]}
          </div>
        ) : (
          <div className="mt-7 grid gap-6">
            {selectedLevel.sections.map((section) => {
              const Icon = sectionIcons[section.id];
              const hasSingleAttempt = section.attempts.length === 1;
              return (
                <section key={section.id} className="rounded-[30px] bg-slate-50 p-5 ring-1 ring-blue-100 sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr] lg:items-end">
                    <div className="flex items-start gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-peach text-pop">
                        <Icon size={26} />
                      </span>
                      <div>
                        <p className="text-sm font-black tracking-[0.18em] text-pop">{section.dutchTitle}</p>
                        <h3 className="mt-1 text-3xl font-black text-ink">{section.title[language]}</h3>
                        <p className="mt-3 max-w-3xl text-base font-bold leading-7 text-ocean/70">
                          {section.summary[language]}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-peach p-4">
                      <p className="text-sm font-black text-pop">{language === "zh" ? "考试事实" : "Exam fact"}</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-ocean">{section.examFact[language]}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-black tracking-[0.16em] text-pop">
                      {language === "zh" ? "官方入口" : "Official Entry"}
                    </p>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100">
                      {attemptsCountLabel(section.attempts.length, language)}
                    </span>
                  </div>

                  <div className={`mt-3 grid gap-4 ${hasSingleAttempt ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                    {section.attempts.map((attempt) => (
                      <article
                        key={attempt.id}
                        className={`rounded-[26px] bg-white p-5 ring-1 ring-blue-100 ${
                          hasSingleAttempt ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end" : "flex h-full flex-col"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-black text-pop">{attempt.sourceLabel}</p>
                          <h4
                            className={`mt-2 font-black leading-tight text-ink ${
                              hasSingleAttempt ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                            }`}
                          >
                            {attempt.title[language]}
                          </h4>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {attempt.focus.map((item) => (
                              <span
                                key={item.en}
                                className="rounded-full bg-skywash px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100"
                              >
                                {item[language]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={`flex flex-col gap-3 ${hasSingleAttempt ? "lg:min-w-64 lg:items-end" : "mt-auto"}`}>
                          <div className="flex flex-wrap gap-2 text-xs font-black text-ocean/65 lg:justify-end">
                            <span className="rounded-full bg-slate-50 px-3 py-2 ring-1 ring-blue-100">
                              {attempt.kind === "pdf" ? "PDF" : language === "zh" ? "在线练习" : "online"}
                            </span>
                            {attempt.durationMinutes ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-2 ring-1 ring-blue-100">
                                <Clock3 size={14} />
                                {attempt.durationMinutes} min
                              </span>
                            ) : null}
                          </div>
                          <a
                            href={attempt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => openExternalPractice(event, attempt.url)}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white shadow-soft transition hover:bg-ocean lg:w-auto lg:min-w-56"
                          >
                            {openLabel(attempt.kind, language)}
                            <ExternalLink size={17} />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>

                  {section.practiceTasks?.length ? (
                    <div className="mt-7">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm font-black tracking-[0.16em] text-pop">
                            {language === "zh" ? "B1 题型拆练" : "B1 Task Drills"}
                          </p>
                          <h4 className="mt-1 text-2xl font-black text-ink">
                            {language === "zh" ? "先把考试任务拆小练" : "Practice the task shape first"}
                          </h4>
                        </div>
                        <p className="max-w-xl text-sm font-bold leading-6 text-ocean/60">
                          {language === "zh"
                            ? "这些是 NedPop 原创练习，按官方 B1 题型和场景设计，不是官方原题。"
                            : "These are original NedPop drills aligned to official B1 task types and contexts, not official exam items."}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        {section.practiceTasks.map((task) => (
                          <article key={task.id} className="flex h-full flex-col rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black tracking-[0.14em] text-pop">{task.kindLabel[language]}</p>
                                <h5 className="mt-2 text-2xl font-black leading-tight text-ink">{task.title[language]}</h5>
                              </div>
                              <span className="rounded-full bg-peach px-3 py-2 text-xs font-black text-pop">
                                B1
                              </span>
                            </div>

                            <p className="mt-4 text-sm font-bold leading-7 text-ocean/70">{task.scenario[language]}</p>

                            <div className="mt-4 rounded-2xl bg-skywash p-4 ring-1 ring-blue-100">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-black leading-6 text-ink">{task.inputText}</p>
                                <button
                                  type="button"
                                  onClick={() => speakDutch(task.inputText)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100 transition hover:bg-blue-50"
                                >
                                  <Volume2 size={15} />
                                  {language === "zh" ? "听" : "Play"}
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl bg-peach p-4">
                              <p className="text-xs font-black tracking-[0.12em] text-pop">
                                {language === "zh" ? "任务" : "Task"}
                              </p>
                              <p className="mt-2 text-sm font-black leading-6 text-ocean">{task.question[language]}</p>
                            </div>

                            {task.sampleDutch ? (
                              <div className="mt-4 rounded-2xl bg-ink p-4 text-white">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-xs font-black tracking-[0.12em] text-orange-200">
                                    {language === "zh" ? "可用答案骨架" : "Usable answer frame"}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => speakDutch(task.sampleDutch ?? "")}
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-black text-ocean transition hover:bg-blue-50"
                                  >
                                    <Volume2 size={15} />
                                    {language === "zh" ? "听" : "Play"}
                                  </button>
                                </div>
                                <p className="mt-3 text-base font-black leading-7">{task.sampleDutch}</p>
                                {task.sampleMeaning ? (
                                  <p className="mt-2 text-sm font-bold leading-6 text-blue-100">{task.sampleMeaning[language]}</p>
                                ) : null}
                              </div>
                            ) : null}

                            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-blue-100">
                              <p className="text-xs font-black tracking-[0.12em] text-pop">
                                {language === "zh" ? "答案方向" : "Answer Direction"}
                              </p>
                              <p className="mt-2 text-sm font-black leading-6 text-ocean">{task.answerGuide[language]}</p>
                            </div>

                            <div className="mt-4 grid gap-2">
                              {task.checklist.map((item) => (
                                <div key={item.en} className="flex items-start gap-2 text-sm font-bold leading-6 text-ocean/70">
                                  <CheckCircle2 className="mt-0.5 shrink-0 text-pop" size={17} />
                                  <span>{item[language]}</span>
                                </div>
                              ))}
                            </div>

                            <p className="mt-auto pt-4 text-xs font-bold leading-5 text-ocean/50">{task.sourceAlignment[language]}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
