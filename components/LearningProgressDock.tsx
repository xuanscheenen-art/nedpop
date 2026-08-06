"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronUp, LockKeyhole, Route, X } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { authChangedEvent, getCachedUser } from "@/lib/auth";
import { accessLevelChangedEvent, canAccessLevel, getCachedEntitledUnlockedLevels, getVerifiedEntitlement, type UserUnlockedLevels } from "@/lib/entitlements";
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
import type { CourseLevel } from "@/types/course";

const foundationStepOrder = ["pronunciation", "starter-words", "word-bubbles", "grammar"] as const satisfies readonly LearningStep[];
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

const completedStarterSteps = (progress: LearningProgress) => progress.completedStepsByDay.A0?.["1"] ?? [];

const starterWordBubblesCompletedFor = (progress: LearningProgress) => {
  const starterSteps = completedStarterSteps(progress);
  return starterSteps.includes("word-bubbles");
};

const foundationCompletionFor = (progress: LearningProgress): Record<(typeof foundationStepOrder)[number], boolean> => ({
  pronunciation: progress.pronunciationBaseCompleted,
  "starter-words": progress.starterWordsCompleted,
  "word-bubbles": starterWordBubblesCompletedFor(progress),
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

  if (pathname === "/pricing") {
    return {
      zh: "你正在浏览：解锁页",
      en: "You are browsing: Unlock page",
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
    return {
      zh: `你正在练：${level} Day ${day} 单词泡泡`,
      en: `You are practicing: ${level} Day ${day} word bubbles`,
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

type NavigationStepItem = {
  key: LearningStep;
  labelZh: string;
  labelEn: string;
  route: string;
  type: RecommendedAction["type"];
  completed: boolean;
};

const lessonRouteForDock = (level: LearningProgress["currentLevel"], day: number, step?: "patterns" | "practice") =>
  `/learn/${level.toLowerCase()}-${String(Math.max(1, day)).padStart(2, "0")}${step ? `?step=${step}` : ""}`;

const starterSafeActionFor = (progress: LearningProgress): RecommendedAction => {
  if (!progress.pronunciationBaseCompleted) {
    return {
      labelZh: "发音底座",
      labelEn: "Pronunciation Base",
      route: "/pronunciation",
      reasonZh: "先把字母和组合音读顺，看到新词能大概读出来。",
      reasonEn: "Start with letters and sound chunks so words are easier to remember.",
      type: "pronunciation",
    };
  }

  if (!progress.starterWordsCompleted) {
    return {
      labelZh: "A0 Day 1：生存词课程",
      labelEn: "A0 Day 1: Starter Lesson",
      route: "/learn/a0-01",
      reasonZh: "先回到 A0 入门任务，不从定价页或自由浏览页跳到 A1。",
      reasonEn: "Return to the A0 starter task instead of jumping from browsing into A1.",
      type: "starter-words",
    };
  }

  if (!starterWordBubblesCompletedFor(progress)) {
    return {
      labelZh: "A0 Day 1：本日单词泡泡",
      labelEn: "A0 Day 1: Today's Word Bubbles",
      route: "/word-link?level=A0&day=1",
      reasonZh: "A0 Day 1 课程已完成。先把本日词包记住，再去最小语法地基。",
      reasonEn: "A0 Day 1 lesson is done. Memorize today's word pack before the grammar base.",
      type: "word-bubbles",
    };
  }

  if (!progress.grammarBaseCompleted) {
    return {
      labelZh: "最小语法地基",
      labelEn: "Grammar Base",
      route: "/rules?mode=foundation",
      reasonZh: "先补完入门地基，再进入后面的每日主线。",
      reasonEn: "Finish the starter base before moving into later daily tracks.",
      type: "grammar",
    };
  }

  return {
    labelZh: "学习首页",
    labelEn: "Learning Home",
    route: "/dashboard",
    reasonZh: "你正在自由浏览，这里先回学习首页，不把当前页面当成主线进度。",
    reasonEn: "You are browsing freely. Return to the learning home without changing main progress.",
    type: "lesson",
  };
};

const shouldUseFreeBrowseRecommendation = (route: string) => {
  const url = routeUrlFor(route);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  if (pathname === "/" || pathname === "/pricing" || pathname === "/pronunciation") return true;
  if (pathname === "/rules" && url.searchParams.get("mode") !== "foundation") return true;
  return false;
};

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

const lockedLevelForRoute = (
  route: string,
  progress: LearningProgress,
  routeContext: LearningRouteContext | null,
  accessLevel: UserUnlockedLevels,
  signedIn: boolean,
): CourseLevel | null => {
  const learningContext = routeLearningContextFor(route, progress, routeContext);
  if (!learningContext) return null;
  return canAccessLevel(learningContext.level, accessLevel, signedIn) ? null : learningContext.level;
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
  const browserRoute = `${pathname || "/"}${searchKey ? `?${searchKey}` : ""}`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(() => getDefaultLearningProgress());
  const [routeContext, setRouteContext] = useState<LearningRouteContext | null>(null);
  const [accessLevel, setAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<CourseLevel | undefined>();

  useEffect(() => {
    const sync = () => {
      setMounted(true);
      setProgress(getLearningProgress());
      setRouteContext(getLearningRouteContext());
    };
    const syncAuthAndAccess = (forceRefresh = false) => {
      const cachedUser = getCachedUser();
      const cachedLevels = getCachedEntitledUnlockedLevels(cachedUser?.id);
      setSignedIn(Boolean(cachedUser));
      if (cachedLevels && !forceRefresh) {
        setAccessLevel(cachedLevels);
        setAccessReady(true);
        return;
      }

      setAccessReady(false);
      void getVerifiedEntitlement({ forceRefresh })
        .then((entitlement) => {
          setSignedIn(Boolean(entitlement.userId));
          setAccessLevel(entitlement.unlockedLevels);
          setAccessReady(true);
        })
        .catch(() => {
          setAccessReady(false);
        });
    };
    sync();
    syncAuthAndAccess();
    const refreshAuthAndAccess = () => syncAuthAndAccess(true);
    const reuseAuthAndAccess = () => syncAuthAndAccess(false);
    window.addEventListener(learningProgressChangedEvent, sync);
    window.addEventListener(learningRouteContextChangedEvent, sync);
    window.addEventListener(accessLevelChangedEvent, refreshAuthAndAccess);
    window.addEventListener(authChangedEvent, refreshAuthAndAccess);
    window.addEventListener("storage", sync);
    window.addEventListener("storage", reuseAuthAndAccess);
    return () => {
      window.removeEventListener(learningProgressChangedEvent, sync);
      window.removeEventListener(learningRouteContextChangedEvent, sync);
      window.removeEventListener(accessLevelChangedEvent, refreshAuthAndAccess);
      window.removeEventListener(authChangedEvent, refreshAuthAndAccess);
      window.removeEventListener("storage", sync);
      window.removeEventListener("storage", reuseAuthAndAccess);
    };
  }, [pathname, searchKey]);

  if (!mounted) return null;

  const currentRoute = browserRoute;
  const useFreeBrowseRecommendation = shouldUseFreeBrowseRecommendation(currentRoute);
  const action = useFreeBrowseRecommendation ? starterSafeActionFor(progress) : getNextRecommendedAction(progress);
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
  const pageContext = pageContextFor(currentRoute, progress, routeContext);
  const wordBubbleRoute = useFreeBrowseRecommendation ? wordBubbleRouteFor("A0", 1) : wordBubbleRouteFor(progress.currentLevel, progress.currentDay);
  const actionLockedLevel = accessReady ? lockedLevelForRoute(action.route, progress, routeContext, accessLevel, signedIn) : null;
  const wordBubbleLockedLevel = accessReady ? lockedLevelForRoute(wordBubbleRoute, progress, routeContext, accessLevel, signedIn) : null;
  const starterNavigationSteps: NavigationStepItem[] = [
    {
      key: "pronunciation",
      labelZh: "发音底座",
      labelEn: "Pronunciation base",
      route: "/pronunciation",
      type: "pronunciation",
      completed: progress.pronunciationBaseCompleted,
    },
    {
      key: "starter-words",
      labelZh: "A0 Day 1 课程",
      labelEn: "A0 Day 1 lesson",
      route: "/learn/a0-01",
      type: "starter-words",
      completed: progress.starterWordsCompleted,
    },
    {
      key: "word-bubbles",
      labelZh: "A0 Day 1 本日单词泡泡",
      labelEn: "A0 Day 1 word bubbles",
      route: "/word-link?level=A0&day=1",
      type: "word-bubbles",
      completed: starterWordBubblesCompletedFor(progress),
    },
    {
      key: "grammar",
      labelZh: "最小语法地基",
      labelEn: "Tiny grammar base",
      route: "/rules?mode=foundation",
      type: "grammar",
      completed: progress.grammarBaseCompleted,
    },
  ];
  const dailyNavigationSteps: NavigationStepItem[] = [
    {
      key: "lesson",
      labelZh: `${progress.currentLevel} Day ${progress.currentDay} 课程`,
      labelEn: `${progress.currentLevel} Day ${progress.currentDay} lesson`,
      route: lessonRouteForDock(progress.currentLevel, progress.currentDay),
      type: "lesson",
      completed: completedToday.includes("lesson"),
    },
    {
      key: "word-bubbles",
      labelZh: `${progress.currentLevel} Day ${progress.currentDay} 本日单词泡泡`,
      labelEn: `${progress.currentLevel} Day ${progress.currentDay} word bubbles`,
      route: wordBubbleRouteFor(progress.currentLevel, progress.currentDay),
      type: "word-bubbles",
      completed: completedToday.includes("word-bubbles"),
    },
    {
      key: "grammar-on-demand",
      labelZh: `${progress.currentLevel} Day ${progress.currentDay} 本日小规则`,
      labelEn: `${progress.currentLevel} Day ${progress.currentDay} tiny rule`,
      route: lessonRouteForDock(progress.currentLevel, progress.currentDay, "patterns"),
      type: "grammar-on-demand",
      completed: completedToday.includes("grammar-on-demand"),
    },
    {
      key: "practice",
      labelZh: `${progress.currentLevel} Day ${progress.currentDay} 练习`,
      labelEn: `${progress.currentLevel} Day ${progress.currentDay} practice`,
      route: lessonRouteForDock(progress.currentLevel, progress.currentDay, "practice"),
      type: "practice",
      completed: completedToday.includes("practice"),
    },
    {
      key: "scenario-output",
      labelZh: `${progress.currentLevel} Day ${progress.currentDay} 场景输出`,
      labelEn: `${progress.currentLevel} Day ${progress.currentDay} scenario output`,
      route: `/scenarios?level=${progress.currentLevel}&day=${progress.currentDay}`,
      type: "scenario-output",
      completed: completedToday.includes("scenario-output"),
    },
  ];
  const navigationSteps = foundationComplete ? dailyNavigationSteps : starterNavigationSteps;
  const nextOpenStepIndex = navigationSteps.findIndex((step) => !step.completed);
  const headlineLabel = useFreeBrowseRecommendation && !learningContext
    ? language === "zh"
      ? "当前："
      : "Current: "
    : learningContext?.page === "word-link"
      ? language === "zh"
        ? "当前单词："
        : "Current words: "
      : language === "zh"
        ? "主线："
        : "Main path: ";
  const headlineLevel = learningContext?.level ?? progress.currentLevel;
  const headlineDay = learningContext?.day ?? progress.currentDay;
  const headlineTitle = useFreeBrowseRecommendation && !learningContext
    ? language === "zh"
      ? "自由浏览"
      : "Free browsing"
    : `${headlineLevel} Day ${headlineDay}`;
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
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-2.5 text-xs font-black text-white shadow-soft transition hover:bg-ocean"
      >
        <Route size={15} />
        {language === "zh" ? "新手导航" : "Learning Nav"}
        <ChevronUp size={14} />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-3 right-3 z-50 max-h-[min(56vh,28rem)] w-[min(18rem,calc(100vw-0.75rem))] overflow-y-auto rounded-[20px] border border-blue-100 bg-white p-2.5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black tracking-[0.12em] text-pop">{language === "zh" ? "新手导航" : "Learning Nav"}</p>
          <h2 className="mt-0.5 text-base font-black leading-tight text-ink">
            {headlineLabel}
            {headlineTitle}
          </h2>
          <p className="mt-0.5 text-[10px] font-black text-ocean/55">
            {!foundationComplete
              ? language === "zh"
                ? `入门地基：${foundationCompleteCount} / ${foundationStepOrder.length}`
                : `Starter base: ${foundationCompleteCount} / ${foundationStepOrder.length}`
              : useFreeBrowseRecommendation && !learningContext
              ? language === "zh"
                ? "不会改变新手进度"
                : "Does not change starter progress"
              : !headlineIsMain
              ? language === "zh"
                ? `主线：${progress.currentLevel} Day ${progress.currentDay}`
                : `Main path: ${progress.currentLevel} Day ${progress.currentDay}`
              : language === "zh"
                ? `今日进度：${dailyCompleteCount} / ${dailyStepOrder.length}`
                : `Today: ${dailyCompleteCount} / ${dailyStepOrder.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex size-7 items-center justify-center rounded-full bg-skywash text-ocean transition hover:bg-peach"
          aria-label={language === "zh" ? "收起新手导航" : "Collapse learning nav"}
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-2.5 space-y-1">
        <p className="text-[10px] font-black tracking-[0.11em] text-pop">
          {foundationComplete
            ? language === "zh"
              ? "今日顺序"
              : "Today's Flow"
            : language === "zh"
              ? "入门顺序"
              : "Starter Flow"}
        </p>
        {navigationSteps.map((step, index) => {
          const isRecommendedStep = index === nextOpenStepIndex;
          const stepLockedLevel = accessReady ? lockedLevelForRoute(step.route, progress, routeContext, accessLevel, signedIn) : null;
          const stepIsCurrentRoute = normalizeRoute(step.route) === normalizeRoute(currentRoute);
          const statusText = step.completed
            ? language === "zh"
              ? "已完成"
              : "Done"
            : isRecommendedStep
              ? language === "zh"
                ? "建议现在做"
                : "Recommended now"
              : language === "zh"
                ? "稍后"
                : "Later";

          return (
            <div
              key={`${step.key}-${step.route}`}
              className={`rounded-[14px] p-1.5 ring-1 ${
                step.completed
                  ? "bg-skywash text-ocean ring-blue-100"
                  : isRecommendedStep
                    ? "bg-peach text-ink ring-orange-100"
                    : "bg-slate-50 text-ocean/55 ring-blue-100"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                    step.completed ? "bg-white text-ocean" : isRecommendedStep ? "bg-pop text-white" : "bg-white text-ocean/45"
                  }`}
                >
                  {step.completed ? <CheckCircle2 size={11} /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black leading-4 text-current">{language === "zh" ? step.labelZh : step.labelEn}</p>
                  <p className="truncate text-[9px] font-bold leading-3 text-ocean/65">{statusText}</p>
                </div>
              </div>
              {!step.completed && isRecommendedStep ? (
                <div className="mt-1 pl-6">
                  {stepIsCurrentRoute ? (
                    <button
                      type="button"
                      onClick={focusCurrentPage}
                      className="inline-flex items-center justify-center gap-1 rounded-full bg-ink px-2 py-1 text-[10px] font-black text-white transition hover:bg-ocean"
                    >
                      {language === "zh" ? "回到这一步" : "Back here"}
                      <ArrowRight size={12} />
                    </button>
                  ) : stepLockedLevel ? (
                    <button
                      type="button"
                      onClick={() => setUpgradeLevel(stepLockedLevel)}
                      className="inline-flex items-center justify-center gap-1 rounded-full bg-ink px-2 py-1 text-[10px] font-black text-white transition hover:bg-ocean"
                    >
                      <LockKeyhole size={12} />
                      {language === "zh" ? "解锁这一步" : "Unlock"}
                    </button>
                  ) : (
                    <Link
                      href={step.route}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center gap-1 rounded-full bg-ink px-2 py-1 text-[10px] font-black text-white transition hover:bg-ocean"
                    >
                      {language === "zh" ? "去做这一步" : "Go"}
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-1.5 truncate rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold leading-4 text-ocean/65 ring-1 ring-blue-100">
        {pageContext[language]}
      </p>

      <div className="mt-1.5 rounded-[14px] bg-peach px-2 py-1.5">
        <p className="text-[9px] font-black tracking-[0.1em] text-pop">
          {isCurrentActionRoute
            ? language === "zh"
              ? "当前主线任务"
              : "Current Main Task"
            : language === "zh"
              ? "推荐下一步"
              : "Recommended Next"}
        </p>
        <h3 className="mt-0.5 truncate text-[13px] font-black leading-4 text-ink">
          {language === "zh" ? action.labelZh : action.labelEn}
        </h3>
        <p className="mt-0.5 max-h-8 overflow-hidden text-[9px] font-bold leading-4 text-ocean/65">
          {language === "zh" ? actionReason.zh : actionReason.en}
        </p>
      </div>

      {isCurrentActionRoute ? (
        <button
          type="button"
          onClick={focusCurrentPage}
          className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white transition hover:bg-ocean"
        >
          {language === "zh" ? "回到主线任务" : "Back to Main Task"}
          <ArrowRight size={15} />
        </button>
      ) : actionLockedLevel ? (
        <button
          type="button"
          onClick={() => setUpgradeLevel(actionLockedLevel)}
          className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white transition hover:bg-ocean"
        >
          <LockKeyhole size={15} />
          {language === "zh" ? `解锁 ${actionLockedLevel} 主线` : `Unlock ${actionLockedLevel}`}
        </button>
      ) : (
        <Link
          href={action.route}
          onClick={() => setOpen(false)}
          className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white transition hover:bg-ocean"
        >
          {useFreeBrowseRecommendation && action.route === "/dashboard"
            ? language === "zh"
              ? "回学习首页"
              : "Back to Learning Home"
            : language === "zh"
              ? "继续主线"
              : "Continue Main Path"}
          <ArrowRight size={15} />
        </Link>
      )}

      <div className="mt-1.5 border-t border-blue-100 pt-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {wordBubbleLockedLevel ? (
            <button
              type="button"
              onClick={() => setUpgradeLevel(wordBubbleLockedLevel)}
              className="inline-flex items-center justify-center rounded-full bg-skywash px-2 py-1 text-[10px] font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
            >
              {language === "zh" ? "解锁今天词" : "Unlock words"}
            </button>
          ) : (
            <Link
              href={wordBubbleRoute}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-skywash px-2 py-1 text-[10px] font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
            >
              {useFreeBrowseRecommendation
                ? language === "zh"
                  ? "练 A0 词"
                  : "A0 words"
                : language === "zh"
                  ? "练今天词"
                  : "Words"}
            </Link>
          )}
          <Link
            href="/word-review"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black text-ocean ring-1 ring-blue-100 transition hover:bg-skywash"
          >
            {language === "zh" ? "去复习池" : "Review"}
          </Link>
        </div>
      </div>
      <UpgradeModal open={Boolean(upgradeLevel)} lockedLevel={upgradeLevel} onClose={() => setUpgradeLevel(undefined)} />
    </aside>
  );
}
