"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronUp, Route, X } from "lucide-react";
import {
  getDefaultLearningProgress,
  getLearningRouteContext,
  getLearningProgress,
  learningRouteContextChangedEvent,
  learningProgressChangedEvent,
  type LearningRouteContext,
  type LearningProgress,
  type LearningStep,
} from "@/lib/learningProgress";
import { getNextRecommendedAction } from "@/lib/nextAction";
import { useLanguage } from "@/lib/i18n";

const stepLabels: Record<LearningStep, { zh: string; en: string }> = {
  pronunciation: { zh: "发音底座", en: "Pronunciation" },
  "starter-words": { zh: "A0 生存词", en: "Starter words" },
  grammar: { zh: "最小语法", en: "Tiny grammar" },
  lesson: { zh: "课程", en: "Lesson" },
  "word-bubbles": { zh: "单词", en: "Words" },
  "grammar-on-demand": { zh: "小规则", en: "Rule" },
  practice: { zh: "练习", en: "Practice" },
  "scenario-output": { zh: "场景", en: "Scenario" },
  review: { zh: "复习池", en: "Review" },
  complete: { zh: "完成", en: "Complete" },
};

const foundationStepOrder = ["pronunciation", "starter-words", "grammar"] as const satisfies readonly LearningStep[];
const dailyStepOrder = ["lesson", "word-bubbles", "grammar-on-demand", "practice", "scenario-output"] as const satisfies readonly LearningStep[];

const normalizeRoute = (route: string) => {
  try {
    const url = new URL(route, "https://nedpop.local");
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    return `${pathname}${url.search}`;
  } catch {
    return route;
  }
};

const currentBrowserRoute = () =>
  typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`;

const routeUrlFor = (route: string) => new URL(route, "https://nedpop.local");

const normalizeLevel = (value: string | null, fallback: LearningProgress["currentLevel"]) => {
  const upper = value?.toUpperCase();
  return upper === "A0" || upper === "A1" || upper === "A2" || upper === "B1" ? upper : fallback;
};

const normalizeDayParam = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const wordBubbleRouteFor = (level: LearningProgress["currentLevel"], day: number) =>
  `/word-link?level=${level}&day=${day}`;

const completedStepsForCurrentDay = (progress: LearningProgress) =>
  progress.completedStepsByDay[progress.currentLevel]?.[String(progress.currentDay)] ?? [];

const foundationCompletionFor = (progress: LearningProgress): Record<(typeof foundationStepOrder)[number], boolean> => ({
  pronunciation: progress.pronunciationBaseCompleted,
  "starter-words": progress.starterWordsCompleted,
  grammar: progress.grammarBaseCompleted,
});

const routeLearningContextFor = (
  route: string,
  progress: LearningProgress,
  routeContext: LearningRouteContext | null,
): LearningRouteContext | null => {
  const url = routeUrlFor(route);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (pathname === "/word-link") {
    const context = routeContext?.page === "word-link" ? routeContext : null;
    return {
      page: "word-link",
      level: url.searchParams.has("level") ? normalizeLevel(url.searchParams.get("level"), progress.currentLevel) : context?.level ?? progress.currentLevel,
      day: url.searchParams.has("day") ? normalizeDayParam(url.searchParams.get("day"), progress.currentDay) : context?.day ?? progress.currentDay,
    };
  }

  if (pathname === "/scenarios") {
    const context = routeContext?.page === "scenarios" ? routeContext : null;
    return {
      page: "scenarios",
      level: url.searchParams.has("level") ? normalizeLevel(url.searchParams.get("level"), progress.currentLevel) : context?.level ?? progress.currentLevel,
      day: url.searchParams.has("day") ? normalizeDayParam(url.searchParams.get("day"), progress.currentDay) : context?.day ?? progress.currentDay,
    };
  }

  const lessonMatch = pathname.match(/^\/learn\/(a0|a1|a2|b1)-(\d{1,2})$/i);
  if (lessonMatch) {
    return {
      page: "lesson",
      level: normalizeLevel(lessonMatch[1], progress.currentLevel),
      day: normalizeDayParam(lessonMatch[2], progress.currentDay),
    };
  }

  return null;
};

const pageContextFor = (route: string, progress: LearningProgress, routeContext: LearningRouteContext | null) => {
  const url = routeUrlFor(route);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const learningContext = routeLearningContextFor(route, progress, routeContext);

  if (pathname === "/") {
    return {
      zh: "你正在浏览：首页",
      en: "You are browsing: Home",
    };
  }

  if (pathname === "/dashboard") {
    return {
      zh: "你正在浏览：学习首页",
      en: "You are browsing: Dashboard",
    };
  }

  if (pathname === "/pronunciation") {
    return {
      zh: "你正在学习：发音底座",
      en: "You are on: Pronunciation",
    };
  }

  if (pathname === "/rules") {
    const isFoundation = url.searchParams.get("mode") === "foundation";
    return {
      zh: isFoundation ? "你正在学习：最小语法地基" : "你正在浏览：语法规则",
      en: isFoundation ? "You are on: Grammar base" : "You are browsing: Grammar rules",
    };
  }

  if (pathname === "/word-review") {
    return {
      zh: "你正在自由复习：复习池",
      en: "You are reviewing freely: Review pool",
    };
  }

  if (pathname === "/word-link") {
    const level = learningContext?.level ?? progress.currentLevel;
    const day = learningContext?.day ?? progress.currentDay;
    const sameMainDay = level === progress.currentLevel && day === progress.currentDay;
    return {
      zh: sameMainDay
        ? `你正在练今天词：${level} Day ${day} 单词泡泡`
        : `你正在自由练词：${level} Day ${day} 单词泡泡`,
      en: sameMainDay
        ? `You are practicing today's words: ${level} Day ${day}`
        : `You are freely practicing: ${level} Day ${day} word bubbles`,
    };
  }

  if (pathname === "/scenarios") {
    const level = learningContext?.level ?? progress.currentLevel;
    const day = learningContext?.day ?? progress.currentDay;
    return {
      zh: `你正在输出场景：${level} Day ${day}`,
      en: `You are in scenario output: ${level} Day ${day}`,
    };
  }

  const lessonMatch = pathname.match(/^\/learn\/(a0|a1|a2|b1)-(\d{1,2})$/i);
  if (lessonMatch) {
    const level = normalizeLevel(lessonMatch[1], progress.currentLevel);
    const day = normalizeDayParam(lessonMatch[2], progress.currentDay);
    return {
      zh: `你正在学习课程：${level} Day ${day}`,
      en: `You are in lesson: ${level} Day ${day}`,
    };
  }

  return {
    zh: "你正在自由浏览，不会改变主线进度。",
    en: "You are browsing freely. This does not change your main progress.",
  };
};

type RecommendedAction = ReturnType<typeof getNextRecommendedAction>;

const routeMatchesAction = (
  route: string,
  progress: LearningProgress,
  action: RecommendedAction,
  routeContext: LearningRouteContext | null,
) => {
  if (normalizeRoute(action.route) === normalizeRoute(route)) return true;

  const url = routeUrlFor(route);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (action.type === "pronunciation") return pathname === "/pronunciation";
  if (action.type === "grammar") return pathname === "/rules" && url.searchParams.get("mode") === "foundation";
  if (action.type === "review") return pathname === "/word-review";

  if (action.type === "word-bubbles") {
    const learningContext = routeLearningContextFor(route, progress, routeContext);
    const level = learningContext?.page === "word-link" ? learningContext.level : normalizeLevel(url.searchParams.get("level"), progress.currentLevel);
    const day = learningContext?.page === "word-link" ? learningContext.day : normalizeDayParam(url.searchParams.get("day"), progress.currentDay);
    return pathname === "/word-link" && level === progress.currentLevel && day === progress.currentDay;
  }

  if (action.type === "scenario-output") {
    const learningContext = routeLearningContextFor(route, progress, routeContext);
    const level = learningContext?.page === "scenarios" ? learningContext.level : normalizeLevel(url.searchParams.get("level"), progress.currentLevel);
    const day = learningContext?.page === "scenarios" ? learningContext.day : normalizeDayParam(url.searchParams.get("day"), progress.currentDay);
    return pathname === "/scenarios" && level === progress.currentLevel && day === progress.currentDay;
  }

  const lessonMatch = pathname.match(/^\/learn\/(a0|a1|a2|b1)-(\d{1,2})$/i);
  if (!lessonMatch) return false;

  const level = normalizeLevel(lessonMatch[1], progress.currentLevel);
  const day = normalizeDayParam(lessonMatch[2], progress.currentDay);
  const stepParam = url.searchParams.get("step");

  if (level !== progress.currentLevel || day !== progress.currentDay) return false;
  if (action.type === "lesson") return !stepParam;
  if (action.type === "grammar-on-demand") return stepParam === "patterns";
  if (action.type === "practice") return stepParam === "practice";
  return false;
};

export function LearningProgressDock() {
  return (
    <Suspense fallback={null}>
      <LearningProgressDockContent />
    </Suspense>
  );
}

function LearningProgressDockContent() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(() => getDefaultLearningProgress());
  const [routeContext, setRouteContext] = useState<LearningRouteContext | null>(null);
  const [currentRoute, setCurrentRoute] = useState("/");

  useEffect(() => {
    const sync = () => {
      setMounted(true);
      setProgress(getLearningProgress());
      setRouteContext(getLearningRouteContext());
      setCurrentRoute(currentBrowserRoute());
    };
    sync();
    window.addEventListener(learningProgressChangedEvent, sync);
    window.addEventListener(learningRouteContextChangedEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(learningProgressChangedEvent, sync);
      window.removeEventListener(learningRouteContextChangedEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname, searchKey]);

  if (!mounted) return null;

  const action = getNextRecommendedAction(progress);
  const learningContext = routeLearningContextFor(currentRoute, progress, routeContext);
  const isCurrentActionRoute = routeMatchesAction(currentRoute, progress, action, routeContext);
  const actionReason = isCurrentActionRoute
    ? {
        zh: "这页就是主线任务。完成后，这里会自动推荐下一步。",
        en: "This page is the main task. After completion, this will recommend the next step.",
      }
    : { zh: action.reasonZh, en: action.reasonEn };
  const foundationCompletion = foundationCompletionFor(progress);
  const foundationCompleteCount = foundationStepOrder.filter((step) => foundationCompletion[step]).length;
  const foundationComplete = foundationCompleteCount === foundationStepOrder.length;
  const completedToday = completedStepsForCurrentDay(progress);
  const dailyCompleteCount = dailyStepOrder.filter((step) => completedToday.includes(step)).length;
  const progressSteps = foundationComplete ? dailyStepOrder : foundationStepOrder;
  const pageContext = pageContextFor(currentRoute, progress, routeContext);
  const wordBubbleRoute = wordBubbleRouteFor(progress.currentLevel, progress.currentDay);
  const headlineLabel =
    learningContext?.page === "word-link"
      ? language === "zh"
        ? "当前单词："
        : "Current words: "
      : language === "zh"
        ? "主线："
        : "Main path: ";
  const headlineLevel = learningContext?.level ?? progress.currentLevel;
  const headlineDay = learningContext?.day ?? progress.currentDay;
  const headlineIsMain =
    headlineLevel === progress.currentLevel && headlineDay === progress.currentDay;

  const focusCurrentPage = () => {
    setOpen(false);
    window.setTimeout(() => document.querySelector("main")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-white shadow-soft transition hover:bg-ocean"
      >
        <Route size={17} />
        {language === "zh" ? "学习导航" : "Learning Nav"}
        <ChevronUp size={16} />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-[26px] border border-blue-100 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-pop">{language === "zh" ? "学习导航" : "Learning Nav"}</p>
          <h2 className="mt-1 text-xl font-black leading-tight text-ink">
            {headlineLabel}
            {headlineLevel} Day {headlineDay}
          </h2>
          <p className="mt-1 text-xs font-black text-ocean/55">
            {!headlineIsMain
              ? language === "zh"
                ? `主线：${progress.currentLevel} Day ${progress.currentDay}`
                : `Main path: ${progress.currentLevel} Day ${progress.currentDay}`
              : foundationComplete
              ? language === "zh"
                ? `今日进度：${dailyCompleteCount} / ${dailyStepOrder.length}`
                : `Today: ${dailyCompleteCount} / ${dailyStepOrder.length}`
              : language === "zh"
                ? `入门地基：${foundationCompleteCount} / ${foundationStepOrder.length}`
                : `Starter base: ${foundationCompleteCount} / ${foundationStepOrder.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex size-9 items-center justify-center rounded-full bg-skywash text-ocean transition hover:bg-peach"
          aria-label={language === "zh" ? "收起学习导航" : "Collapse learning nav"}
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {progressSteps.map((step) => {
          const complete = foundationComplete
            ? completedToday.includes(step)
            : foundationCompletion[step as (typeof foundationStepOrder)[number]];
          return (
            <span
              key={step}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${
                complete ? "bg-skywash text-ocean" : "bg-slate-50 text-ocean/45 ring-1 ring-blue-100"
              }`}
            >
              {complete ? <CheckCircle2 size={13} /> : <span className="size-2 rounded-full bg-ocean/25" />}
              {stepLabels[step][language]}
            </span>
          );
        })}
      </div>

      <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-ocean/70 ring-1 ring-blue-100">
        {pageContext[language]}
      </p>

      <div className="mt-3 rounded-[22px] bg-peach px-4 py-4">
        <p className="text-xs font-black tracking-[0.14em] text-pop">
          {isCurrentActionRoute
            ? language === "zh"
              ? "当前主线任务"
              : "Current Main Task"
            : language === "zh"
              ? "推荐下一步"
              : "Recommended Next"}
        </p>
        <h3 className="mt-1 text-lg font-black leading-tight text-ink">
          {language === "zh" ? action.labelZh : action.labelEn}
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">
          {language === "zh" ? actionReason.zh : actionReason.en}
        </p>
      </div>

      {isCurrentActionRoute ? (
        <button
          type="button"
          onClick={focusCurrentPage}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean"
        >
          {language === "zh" ? "回到主线任务" : "Back to Main Task"}
          <ArrowRight size={18} />
        </button>
      ) : (
        <Link
          href={action.route}
          onClick={() => setOpen(false)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean"
        >
          {language === "zh" ? "继续主线" : "Continue Main Path"}
          <ArrowRight size={18} />
        </Link>
      )}

      <div className="mt-3 border-t border-blue-100 pt-3">
        <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "自由学习" : "Free Practice"}</p>
        <p className="mt-1 text-xs font-bold leading-5 text-ocean/55">
          {language === "zh"
            ? "多练单词不会改变主线进度，完成任务才会推进。"
            : "Extra word practice will not move the main path; completed tasks do."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={wordBubbleRoute}
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-skywash px-3 py-2.5 text-sm font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
          >
            {language === "zh" ? "练今天词" : "Words"}
          </Link>
          <Link
            href="/word-review"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-slate-50 px-3 py-2.5 text-sm font-black text-ocean ring-1 ring-blue-100 transition hover:bg-skywash"
          >
            {language === "zh" ? "去复习池" : "Review"}
          </Link>
        </div>
      </div>
    </aside>
  );
}
