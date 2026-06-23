"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Ear, LockKeyhole, MessageCircle, Puzzle } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { firstCourseLessonId } from "@/data/courseLessons";
import { authChangedEvent, getCurrentUser } from "@/lib/auth";
import { getBaseCourseLessons, getEffectiveCourseLessons } from "@/lib/contentStore";
import { accessLevelChangedEvent, canAccessLesson, canAccessLevel, getEntitledUnlockedLevels, getUnlockedLevels, type UserUnlockedLevels } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";
import type { CourseLevel } from "@/types/course";

const courseLevelOrder = ["A0", "A1", "A2", "B1"] as const;

const levelSummaries = {
  A0: {
    title: { zh: "A0 零基础生存入门", en: "A0 Survival Starter" },
    note: { zh: "先把问候、姓名、数字、听不懂求重复这些最小表达打牢。", en: "Start with greetings, name, numbers, and repair phrases." },
  },
  A1: {
    title: { zh: "A1 生活基础", en: "A1 Daily Foundation" },
    note: { zh: "个人信息、家庭、购物、交通、时间、地点和基础日常表达。", en: "Personal info, family, shopping, transport, time, places, and daily basics." },
  },
  A2: {
    title: { zh: "A2 生活任务", en: "A2 Practical Life Tasks" },
    note: { zh: "按真实生活任务组织：预约、表格、信件、电话、工作、住房、交通。", en: "Practical Dutch for appointments, forms, letters, calls, work, housing, and travel." },
  },
  B1: {
    title: { zh: "B1 工作学习任务", en: "B1 Work & Study Tasks" },
    note: { zh: "工作、mbo 学习、官方文字、投诉、观点表达和综合输出。", en: "Work, mbo study, official texts, complaints, opinions, and integrated output." },
  },
} as const;

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [lessons, setLessons] = useState(() => getBaseCourseLessons());
  const [accessLevel, setCurrentAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<CourseLevel | undefined>();
  const currentLesson = lessons.find((lesson) => lesson.id === firstCourseLessonId) ?? lessons[0];
  const nextLesson = currentLesson.nextLessonId ? lessons.find((lesson) => lesson.id === currentLesson.nextLessonId) : undefined;
  const lessonsByLevel = useMemo(
    () =>
      courseLevelOrder.map((level) => ({
        level,
        lessons: lessons.filter((lesson) => lesson.level === level),
      })),
    [lessons],
  );
  const learningBubbles = useMemo(
    () => [
      { id: "sounds", label: { zh: "发音", en: "Sounds" }, href: "/pronunciation", icon: Ear, note: currentLesson.soundBase.pronunciationHints.map((item) => item.sound).join(" / ") },
      { id: "words", label: { zh: "单词", en: "Words" }, href: "/word-link", icon: BookOpenCheck, note: currentLesson.targetWords.slice(0, 3).map((item) => item.dutch).join(" / ") },
      { id: "rules", label: { zh: "语法", en: "Rules" }, href: "/rules", icon: Puzzle, note: currentLesson.miniGrammar.pattern },
      { id: "scenarios", label: { zh: "场景", en: "Scenarios" }, href: "/scenarios", icon: MessageCircle, note: currentLesson.speakOutput.sampleAnswer.dutch },
    ],
    [currentLesson],
  );
  const currentLevelLessonCount = lessonsByLevel.find((group) => group.level === currentLesson.level)?.lessons.length ?? 0;
  const currentLevelTitle = levelSummaries[currentLesson.level].title[language].replace(/^(A[0-2]|B1)\s+/, "");
  const currentLevelAccessLabel =
    currentLesson.level === "A0"
      ? language === "zh"
        ? "免费开放"
        : "FREE"
      : canAccessLevel(currentLesson.level, accessLevel, signedIn)
        ? language === "zh"
          ? "已解锁"
          : "UNLOCKED"
        : language === "zh"
          ? "需解锁"
          : "LOCKED";

  useEffect(() => {
    setCurrentAccessLevel(getUnlockedLevels());
    try {
      setLessons(getEffectiveCourseLessons());
    } catch {
      setLessons(getBaseCourseLessons());
    }
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
    syncUser();
    syncAccess();
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

  const openUpgrade = (level: CourseLevel) => setUpgradeLevel(level);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <div className="flex min-h-64 flex-col justify-between rounded-[28px] bg-ink p-8 text-white sm:min-h-72 lg:h-full">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black tracking-[0.16em] text-orange-200">
                  {language === "zh" ? "当前课程" : "CURRENT COURSE"}
                </p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-50 ring-1 ring-white/15">
                  {currentLevelAccessLabel}
                </span>
              </div>
              <p className="mt-8 text-7xl font-black leading-none tracking-normal">{currentLesson.level}</p>
              <h2 className="mt-5 text-2xl font-black leading-tight text-white">{currentLevelTitle}</h2>
              <p className="mt-3 max-w-sm text-sm font-bold leading-6 text-blue-100/80">
                {levelSummaries[currentLesson.level].note[language]}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-5">
              <div>
                <p className="text-xs font-black tracking-[0.12em] text-blue-100/60">
                  {language === "zh" ? "课程数" : "LESSONS"}
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {currentLevelLessonCount}
                  <span className="ml-1 text-sm text-blue-100/70">{language === "zh" ? "课" : ""}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-black tracking-[0.12em] text-blue-100/60">
                  {language === "zh" ? "当前任务" : "CURRENT"}
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {language === "zh" ? `第 ${currentLesson.order} 课` : `Lesson ${currentLesson.order}`}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "今日学习任务" : "TODAY’S LESSON"}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">{currentLesson.title[language]}</h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-ocean/70">{currentLesson.lessonGoal.goal[language]}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <p className="rounded-2xl bg-skywash px-4 py-3 text-sm font-black leading-6 text-ocean">
                {language === "zh" ? "A0 可免登录开始。登录后可保存进度。" : "A0 starts without login. Sign in later to save progress."}
              </p>
              <p className="rounded-2xl bg-peach px-4 py-3 text-sm font-black leading-6 text-ocean">
                {language === "zh" ? "A1/A2/B1 付费解锁需要账户，购买后自动绑定课程权益。" : "A1/A2/B1 paid access requires an account; purchases attach course access."}
              </p>
            </div>
            <Link
              href={`/learn/${currentLesson.id}`}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-pop px-6 py-4 font-black text-ink shadow-soft transition hover:bg-orange-300"
            >
              {t("dashboard.continue")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-3 sm:grid-cols-4">
        {learningBubbles.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-skywash text-pop transition group-hover:bg-peach">
                <Icon size={22} />
              </div>
              <p className="mt-4 text-2xl font-black text-ink">{item.label[language]}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-ocean/65">{item.note}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-7 rounded-[30px] bg-slate-50 p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">{t("dashboard.suggestedLesson")}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{nextLesson?.title[language] ?? currentLesson.title[language]}</h2>
            <p className="mt-2 font-bold leading-7 text-ocean/70">
              {nextLesson
                ? nextLesson.lessonGoal.goal[language]
                : language === "zh"
                  ? "这条学习线已经到最后一课。"
                  : "This learning path is complete."}
            </p>
          </div>
          <Link
            href={`/learn/${nextLesson?.id ?? currentLesson.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white"
          >
            {language === "zh" ? "进入下一课" : "Open next lesson"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="mt-7 rounded-[30px] border border-blue-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "课程目录" : "Course index"}</p>
          <h2 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "A0 到 B1 课程总览" : "A0 to B1 Course Index"}</h2>
            <p className="mt-3 max-w-2xl text-sm font-black leading-6 text-ocean/60">
              {language === "zh"
                ? "A0 免费。A1/A2/B1 按级别解锁，重点是日常生活、政务、工作学习里的真实任务。"
                : "A0 is free. A1/A2/B1 unlock by level and focus on real daily-life, admin, work, and study tasks."}
            </p>
          </div>
          <span className="rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
            {lessons.length} {language === "zh" ? "课" : "lessons"}
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {lessonsByLevel.map((group) => (
            <section key={group.level} className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-blue-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black tracking-[0.14em] text-pop">{group.level}</p>
                  <h3 className={`${language === "zh" ? "text-2xl" : "text-[1.65rem]"} mt-1 font-black leading-tight text-ink`}>
                    {levelSummaries[group.level].title[language]}
                  </h3>
                </div>
                <span className={`inline-flex min-w-[5.75rem] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-black ring-1 ${
                  canAccessLevel(group.level, accessLevel, signedIn) ? "bg-white text-ocean ring-blue-100" : "bg-peach text-ocean ring-orange-100"
                }`}>
                  {canAccessLevel(group.level, accessLevel, signedIn) ? null : <LockKeyhole size={12} />}
                  {group.lessons.length} {language === "zh" ? "课" : "lessons"}
                </span>
              </div>
              <p className={`${language === "zh" ? "min-h-14 leading-7" : "min-h-20 leading-6"} mt-3 text-sm font-bold text-ocean/65`}>
                {levelSummaries[group.level].note[language]}
              </p>
              {group.lessons[0] ? (
                canAccessLesson(group.lessons[0], accessLevel, signedIn) ? (
                  <Link
                    href={`/learn/${group.lessons[0].id}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-white"
                  >
                    {language === "zh" ? "进入本级" : "Start level"}
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUpgrade(group.level)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-peach px-4 py-3 text-sm font-black text-ocean ring-1 ring-orange-100"
                  >
                    <LockKeyhole size={16} />
                    {language === "zh" ? "解锁本级" : "Unlock level"}
                  </button>
                )
              ) : null}
              <ol className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1">
                {group.lessons.map((lesson, index) => {
                  const locked = !canAccessLesson(lesson, accessLevel, signedIn);
                  return (
                    <li key={lesson.id}>
                      {locked ? (
                        <button
                          type="button"
                          onClick={() => openUpgrade(lesson.level)}
                          className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left text-ocean ring-1 ring-orange-100 transition hover:bg-peach"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach text-xs font-black text-ocean">
                            {index + 1}
                          </span>
                          <span className={`${language === "zh" ? "text-sm leading-6" : "text-[13px] leading-5"} min-w-0 font-black`}>
                            {lesson.title[language]}
                          </span>
                          <LockKeyhole size={15} className="text-pop" />
                        </button>
                      ) : (
                        <Link
                          href={`/learn/${lesson.id}`}
                          className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-white px-3 py-3 text-ocean ring-1 ring-blue-100 transition hover:bg-skywash"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-skywash text-xs font-black text-ocean">
                            {index + 1}
                          </span>
                          <span className={`${language === "zh" ? "text-sm leading-6" : "text-[13px] leading-5"} min-w-0 font-black`}>
                            {lesson.title[language]}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </section>
      <UpgradeModal open={Boolean(upgradeLevel)} lockedLevel={upgradeLevel} onClose={() => setUpgradeLevel(undefined)} />
    </main>
  );
}
