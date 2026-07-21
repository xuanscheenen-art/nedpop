"use client";

import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Ear, LockKeyhole, MessageCircle, Pencil, Play, Puzzle, Sparkles, Target } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { authChangedEvent, getCachedUser, getCurrentUser } from "@/lib/auth";
import { getBaseCourseLessons, getEffectiveCourseLessons } from "@/lib/contentStore";
import { accessLevelChangedEvent, canAccessLesson, getEntitledUnlockedLevels, getUnlockedLevels, type UserUnlockedLevels } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";
import { getLearningProgress, learningProgressChangedEvent, markStepComplete, updateLearningProgress, type LearningLevel } from "@/lib/learningProgress";
import type { CourseLevel } from "@/types/course";
import type { CourseLessonPracticeItem } from "@/types/lesson";

const practiceLabels: Record<CourseLessonPracticeItem["type"], { zh: string; en: string }> = {
  "match-word": { zh: "看意思选词", en: "Meaning to word" },
  "choose-correct-phrase": { zh: "看中文选句子", en: "Meaning to sentence" },
  "fill-blank": { zh: "补全句子", en: "Complete sentence" },
  "sentence-builder": { zh: "句子拼装", en: "Sentence builder" },
  "say-it-yourself": { zh: "跟读检查", en: "Repeat check" },
};

const lessonSteps = [
  { id: "goal", zh: "目标", en: "Goal", icon: Target },
  { id: "sound", zh: "发音", en: "Sound", icon: Ear },
  { id: "words", zh: "单词", en: "Words", icon: Sparkles },
  { id: "patterns", zh: "句型", en: "Patterns", icon: Puzzle },
  { id: "repeat", zh: "跟读", en: "Repeat", icon: Play },
  { id: "practice", zh: "练习", en: "Practice", icon: Pencil },
  { id: "output", zh: "输出", en: "Output", icon: MessageCircle },
] as const;

type LessonStepId = (typeof lessonSteps)[number]["id"];

const methodLabels = {
  decode: { zh: "先听会读", en: "Hear and read" },
  link: { zh: "放进记忆", en: "Make it memorable" },
  rule: { zh: "套进句型", en: "Use the pattern" },
  speak: { zh: "说出来", en: "Say it" },
} as const;

const cleanMethodText = (value: string) =>
  value
    .replace(/^(Decode|Link|Rule|Speak)\s*:\s*/i, "")
    .replace(/^(解码|联想|规则|输出|开口)\s*[:：]\s*/i, "")
    .trim();

const goalPurposeText = (value: string) =>
  value
    .replace(/^学完后你可以说[:：]\s*/i, "")
    .replace(/^After this lesson you can say[:：]\s*/i, "")
    .replace(/^用\s*\d+\s*个.*?。?$/, "先知道这节课要解决什么问题，具体句子放到后面的步骤里学。")
    .trim();

const normalizePracticeSentence = (value: string) =>
  value
    .trim()
    .replace(/\s+([.!?])/g, "$1")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const displayBuiltSentence = (parts: string[]) => parts.join(" ").replace(/\s+([.!?])/g, "$1");

export default function LearnLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { language } = useLanguage();
  const [lessons, setLessons] = useState(() => getBaseCourseLessons());
  const lesson = lessons.find((item) => item.id === lessonId);
  const [stepIndex, setStepIndex] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [starterBaseCompleted, setStarterBaseCompleted] = useState(false);
  const [foundationGrammarCompleted, setFoundationGrammarCompleted] = useState(false);
  const [grammarOnDemandComplete, setGrammarOnDemandComplete] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [builtAnswers, setBuiltAnswers] = useState<Record<string, string[]>>({});
  const [activePracticeType, setActivePracticeType] = useState<CourseLessonPracticeItem["type"] | null>(null);
  const [audioStatus, setAudioStatus] = useState("");
  const [accessLevel, setCurrentAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<CourseLevel | undefined>();
  const [upgradeLessonId, setUpgradeLessonId] = useState<string | undefined>();

  useEffect(() => {
    try {
      setLessons(getEffectiveCourseLessons());
    } catch {
      setLessons(getBaseCourseLessons());
    }
    let cancelled = false;
    const syncAuthAndAccess = () => {
      setAccessReady(false);
      setSignedIn(Boolean(getCachedUser()));
      setCurrentAccessLevel(getUnlockedLevels());
      void getCurrentUser().then(async (user) => {
        if (cancelled) return;
        setSignedIn(Boolean(user));
        setCurrentAccessLevel(getUnlockedLevels());
        const level = await getEntitledUnlockedLevels();
        if (!cancelled) {
          setCurrentAccessLevel(level);
          setAccessReady(true);
        }
      });
    };
    syncAuthAndAccess();
    window.addEventListener(accessLevelChangedEvent, syncAuthAndAccess);
    window.addEventListener(authChangedEvent, syncAuthAndAccess);
    window.addEventListener("storage", syncAuthAndAccess);
    return () => {
      window.removeEventListener(accessLevelChangedEvent, syncAuthAndAccess);
      window.removeEventListener(authChangedEvent, syncAuthAndAccess);
      window.removeEventListener("storage", syncAuthAndAccess);
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const requestedStep = new URLSearchParams(queryString).get("step");
    if (requestedStep === "practice") {
      const targetIndex = lessonSteps.findIndex((step) => step.id === "practice");
      if (targetIndex >= 0) setStepIndex(targetIndex);
    }
    if (requestedStep === "patterns") {
      const targetIndex = lessonSteps.findIndex((step) => step.id === "patterns");
      if (targetIndex >= 0) setStepIndex(targetIndex);
    }
    if (requestedStep === "output") {
      const targetIndex = lessonSteps.findIndex((step) => step.id === "output");
      if (targetIndex >= 0) setStepIndex(targetIndex);
    }
  }, [queryString]);

  useEffect(() => {
    const syncLearningProgress = () => {
      if (!lesson) return;
      const progress = getLearningProgress();
      const daySteps = progress.completedStepsByDay[lesson.level as LearningLevel]?.[String(lesson.order)] ?? [];
      setLessonComplete(daySteps.includes("lesson"));
      setStarterBaseCompleted(progress.starterWordsCompleted);
      setFoundationGrammarCompleted(progress.grammarBaseCompleted);
      setGrammarOnDemandComplete(daySteps.includes("grammar-on-demand"));
      setPracticeComplete(daySteps.includes("practice"));
    };
    syncLearningProgress();
    window.addEventListener(learningProgressChangedEvent, syncLearningProgress);
    window.addEventListener("storage", syncLearningProgress);
    return () => {
      window.removeEventListener(learningProgressChangedEvent, syncLearningProgress);
      window.removeEventListener("storage", syncLearningProgress);
    };
  }, [lesson]);

  if (!lesson) {
    notFound();
  }

  const locked = accessReady && !canAccessLesson(lesson, accessLevel, signedIn);
  const openUpgrade = (level: CourseLevel, targetLessonId = lesson.id) => {
    setUpgradeLevel(level);
    setUpgradeLessonId(targetLessonId);
  };

  const closeUpgrade = () => {
    setUpgradeLevel(undefined);
    setUpgradeLessonId(undefined);
  };

  if (!accessReady && lesson.level !== "A0") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-pop">
            <ArrowLeft size={16} />
            {language === "zh" ? "返回学习首页" : "Back to dashboard"}
          </Link>
          <div className="mt-8 rounded-[28px] bg-skywash p-6 ring-1 ring-blue-100">
            <p className="text-sm font-black tracking-[0.16em] text-pop">
              {language === "zh" ? "正在检查访问权限" : "Checking access"}
            </p>
            <h1 className="mt-3 text-3xl font-black text-ink">{lesson.title[language]}</h1>
            <p className="mt-3 font-bold leading-7 text-ocean/70">
              {language === "zh" ? "正在确认你的课程权益，请稍等。" : "Checking your course access. Please wait."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (locked) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-soft sm:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-pop">
            <ArrowLeft size={16} />
            {language === "zh" ? "返回学习首页" : "Back to dashboard"}
          </Link>
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div className="rounded-[28px] bg-peach p-6 text-ocean ring-1 ring-orange-100">
              <LockKeyhole size={34} className="text-pop" />
              <p className="mt-5 text-6xl font-black">{lesson.level}</p>
              <p className="mt-2 text-sm font-black tracking-[0.16em] text-pop">
                {language === "zh" ? "付费权益" : "Paid access"}
              </p>
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-pop">{lesson.level} · {lesson.order}</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-ink">{lesson.title[language]}</h1>
              <p className="mt-4 text-lg font-bold leading-8 text-ocean/70">
                {language === "zh"
                  ? "A0 可以免登录学习。A1/A2/B1 需要登录并购买对应课程包。"
                  : "A0 is available without login. A1/A2/B1 require sign-in and the matching paid course pack."}
              </p>
              <p className="mt-3 rounded-2xl bg-peach px-4 py-3 text-sm font-black leading-6 text-ocean">
                {language === "zh"
                  ? "这个级别会把生活、政务、工作学习任务拆成可直接套用的小块。"
                  : "This level breaks real-life, admin, work, and study tasks into ready-to-use chunks."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openUpgrade(lesson.level, lesson.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white"
                >
                  <LockKeyhole size={18} />
                  {language === "zh" ? "查看解锁选项" : "View unlock options"}
                </button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-skywash px-5 py-3 font-black text-ocean ring-1 ring-blue-100"
                >
                  {language === "zh" ? "查看价格" : "View pricing"}
                </Link>
              </div>
            </div>
          </div>
        </section>
        <UpgradeModal
          open={Boolean(upgradeLevel)}
          lockedLevel={upgradeLevel}
          continueHref={upgradeLessonId ? `/learn/${upgradeLessonId}` : undefined}
          onClose={closeUpgrade}
        />
      </main>
    );
  }

  const currentStep = lessonSteps[stepIndex];
  const previousLesson = lesson.previousLessonId ? lessons.find((item) => item.id === lesson.previousLessonId) : undefined;
  const nextLesson = lesson.nextLessonId ? lessons.find((item) => item.id === lesson.nextLessonId) : undefined;
  const progress = Math.round(((stepIndex + 1) / lessonSteps.length) * 100);
  const lessonsByLevel = (["A0", "A1", "A2", "B1"] as const).map((level) => ({
    level,
    lessons: lessons.filter((item) => item.level === level),
  }));
  const currentLevelLessons = lessons.filter((item) => item.level === lesson.level);
  const currentLessonIndexInLevel = currentLevelLessons.findIndex((item) => item.id === lesson.id);
  const isNumberLesson = lesson.id === "a0-05";
  const numberWordGroups = [
    {
      title: language === "zh" ? "0-10：先打底" : "0-10: the base",
      words: ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"],
    },
    {
      title: language === "zh" ? "11-20：第二组" : "11-20: second group",
      words: ["elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien", "twintig"],
    },
    {
      title: language === "zh" ? "30-100：整十数" : "30-100: tens",
      words: ["dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig", "honderd"],
    },
  ].map((group) => ({
    ...group,
    items: group.words
      .map((word) => lesson.targetWords.find((item) => item.dutch.toLowerCase() === word))
      .filter((item): item is (typeof lesson.targetWords)[number] => Boolean(item)),
  }));

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioStatus(language === "zh" ? "当前浏览器不支持朗读。" : "This browser does not support speech playback.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("nl"));
    if (dutchVoice) utterance.voice = dutchVoice;
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.onstart = () => setAudioStatus(language === "zh" ? `正在播放：${text}` : `Playing: ${text}`);
    utterance.onend = () => setAudioStatus(language === "zh" ? "播放完成，跟读一遍。" : "Done. Repeat it once.");
    utterance.onerror = () => setAudioStatus(language === "zh" ? "没有播出来。请检查浏览器语音权限或系统语音。" : "Audio did not play. Check browser or system speech settings.");
    window.speechSynthesis.speak(utterance);
  };

  const AudioButton = ({ text, label, className = "" }: { text: string; label?: string; className?: string }) => (
    <button
      type="button"
      onClick={() => speakDutch(text)}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach ${className}`}
      aria-label={`${language === "zh" ? "播放" : "Play"} ${text}`}
    >
      <Play size={15} />
      {label ?? (language === "zh" ? "听一遍" : "Play")}
    </button>
  );

  const goNext = () => setStepIndex((current) => Math.min(current + 1, lessonSteps.length - 1));
  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0));
  const openStep = (id: LessonStepId) => setStepIndex(lessonSteps.findIndex((step) => step.id === id));
  const practiceGroups = [
    {
      type: "match-word" as const,
      title: language === "zh" ? "1. 看意思选词" : "1. Meaning to word",
      description: language === "zh" ? "先确认本课核心词能不能认出来。" : "First check whether you recognize the core words.",
    },
    {
      type: "choose-correct-phrase" as const,
      title: language === "zh" ? "2. 看中文选句子" : "2. Meaning to sentence",
      description: language === "zh" ? "再把词放进完整句子里理解。" : "Then understand the words inside full sentences.",
    },
    {
      type: "fill-blank" as const,
      title: language === "zh" ? "3. 补全句子" : "3. Complete sentence",
      description: language === "zh" ? "最后自己补出关键位置。" : "Finally fill the key slot yourself.",
    },
    {
      type: "sentence-builder" as const,
      title: language === "zh" ? "4. 句子拼装" : "4. Sentence builder",
      description: language === "zh" ? "把词块排成一句完整荷兰语。" : "Put word chunks into a full Dutch sentence.",
    },
  ].map((group) => ({
    ...group,
    items: lesson.practice.filter((item) => item.type === group.type),
  })).filter((group) => group.items.length > 0);
  const activePracticeGroup =
    practiceGroups.find((group) => group.type === activePracticeType) ?? practiceGroups[0];
  const lessonPurpose = lesson.lessonGoal.purpose?.[language] ?? goalPurposeText(lesson.lessonGoal.canSayAfter[language]);
  const lessonFlowComplete = lessonComplete && grammarOnDemandComplete && practiceComplete;
  const isStarterLesson = lesson.level === "A0" && lesson.order === 1;
  const wordBubbleRoute = `/word-link?level=${lesson.level}&day=${lesson.order}`;
  const shouldOpenFoundationAfterLesson = isStarterLesson && !foundationGrammarCompleted;
  const nextLessonAccessible = nextLesson ? canAccessLesson(nextLesson, accessLevel, signedIn) : false;
  const completeLessonFlow = () => {
    markStepComplete(lesson.level, lesson.order, "lesson");
    markStepComplete(lesson.level, lesson.order, "grammar-on-demand");
    markStepComplete(lesson.level, lesson.order, "practice");
    if (isStarterLesson && !starterBaseCompleted) {
      updateLearningProgress({
        starterWordsCompleted: true,
        currentLevel: "A0",
        currentDay: 1,
        currentStep: "word-bubbles",
        lastVisitedRoute: "/learn/a0-01",
      });
      setStarterBaseCompleted(true);
    }
    setLessonComplete(true);
    setGrammarOnDemandComplete(true);
    setPracticeComplete(true);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-blue-100 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-pop">
              <ArrowLeft size={16} />
              {language === "zh" ? "返回学习首页" : "Back to dashboard"}
            </Link>
            <p className="mt-5 text-sm font-black tracking-[0.18em] text-pop">
              {lesson.level} · {lesson.order} · {lesson.lessonGoal.estimatedMinutes} min
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-ink sm:text-5xl">{lesson.title[language]}</h1>
          </div>
          <div className="rounded-[24px] bg-skywash p-4 ring-1 ring-blue-100 lg:min-w-64">
            <p className="text-sm font-black text-pop">{language === "zh" ? "当前步骤" : "Current step"}</p>
            <p className="mt-1 text-2xl font-black text-ink">{currentStep[language]}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-pop transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-black text-ocean/60">{stepIndex + 1}/{lessonSteps.length}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {lessonSteps.map((step, index) => {
            const Icon = step.icon;
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => openStep(step.id)}
                className={`flex min-w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black ring-1 transition ${
                  active ? "bg-ink text-white ring-ink" : done ? "bg-mint text-ocean ring-emerald-100" : "bg-white text-ocean ring-blue-100"
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                {step[language]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 min-h-[560px] rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
        {currentStep.id === "goal" ? (
          <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "本课目标" : "Lesson goal"}</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-ink">{lesson.lessonGoal.goal[language]}</h2>
              <p className="mt-5 text-xl font-bold leading-9 text-ocean/70">{lessonPurpose}</p>
            </div>
            <div className="rounded-[30px] bg-ink p-6 text-white">
              <p className="text-sm font-black tracking-[0.16em] text-orange-200">{language === "zh" ? "今天怎么学" : "How this lesson works"}</p>
              <div className="mt-5 grid gap-3">
                {(["decode", "link", "rule", "speak"] as const).map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-black tracking-[0.12em] text-orange-200">{methodLabels[item][language]}</p>
                    <p className="mt-1 font-bold leading-6 text-blue-50">{cleanMethodText(lesson.methodMap[item][language])}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {currentStep.id === "sound" ? (
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "先会听，再跟读" : "Hear first, then repeat"}</p>
            <h2 className="mt-3 text-4xl font-black text-ink">{language === "zh" ? "本课发音底座" : "Sound base for this lesson"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {lesson.soundBase.pronunciationHints.map((item) => (
                <div key={item.dutch} className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-4xl font-black text-ink">{item.dutch}</p>
                      <p className="mt-2 rounded-full bg-peach px-3 py-1 text-sm font-black text-pop">{item.sound}</p>
                    </div>
                    <AudioButton text={item.audioText} label={language === "zh" ? "听" : "Play"} />
                  </div>
                  <p className="mt-4 font-bold leading-7 text-ocean/70">{item.hint[language]}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm font-black text-pop">{audioStatus}</p>
          </div>
        ) : null}

        {currentStep.id === "words" ? (
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">
              {isNumberLesson ? (language === "zh" ? "这节课只练数字本身" : "This lesson practices numbers only") : language === "zh" ? "一次只记本课核心词" : "Only learn this lesson's words"}
            </p>
            <h2 className="mt-3 text-4xl font-black text-ink">{isNumberLesson ? (language === "zh" ? "数字表" : "Number map") : language === "zh" ? "目标词" : "Target words"}</h2>
            {isNumberLesson ? (
              <div className="mt-6 grid gap-5">
                <div className="rounded-[28px] bg-peach p-5 ring-1 ring-orange-100">
                  <p className="text-xl font-black leading-8 text-ink">
                    {language === "zh" ? "这一课先不用例句。目标是：听到数字能认出来，看到数字能读出来。" : "No example sentences in this lesson. Goal: recognize numbers by ear and read them aloud."}
                  </p>
                </div>
                {numberWordGroups.map((group) => (
                  <section key={group.title} className="rounded-[30px] bg-slate-50 p-5 ring-1 ring-blue-100">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <h3 className="text-2xl font-black text-ink">{group.title}</h3>
                      <p className="text-sm font-black text-ocean/55">
                        {group.items.length} {language === "zh" ? "个数字" : "numbers"}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.items.map((word) => (
                        <article key={word.dutch} className="flex min-h-32 flex-col justify-between rounded-[22px] bg-white p-4 ring-1 ring-blue-100">
                          <div>
                            <h4 className="break-words text-3xl font-black leading-tight text-ink">{word.dutch}</h4>
                            <p className="mt-2 text-sm font-black text-pop">{word.meaning[language]}</p>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <AudioButton text={word.audioText} label={language === "zh" ? "听" : "Play"} className="px-4" />
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {lesson.targetWords.map((word) => (
                  <article key={word.dutch} className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-4xl font-black text-ink">{word.dutch}</h3>
                        <p className="mt-1 text-lg font-black text-pop">{word.meaning[language]}</p>
                      </div>
                      <AudioButton text={word.audioText} label={language === "zh" ? "听单词" : "Word"} />
                    </div>
                    <p className="mt-4 font-bold leading-7 text-ocean/70">{word.pronunciationHint[language]}</p>
                    {word.memoryHook ? <p className="mt-3 rounded-2xl bg-peach p-3 font-black leading-7 text-ink">{word.memoryHook[language]}</p> : null}
                    {word.formExamples?.length ? (
                      <div className="mt-3 rounded-2xl bg-skywash p-3 ring-1 ring-blue-100">
                        <p className="text-xs font-black tracking-[0.12em] text-pop">{language === "zh" ? "动词放进句子后" : "Verb in sentences"}</p>
                        <p className="mt-2 text-sm font-black text-ink">
                          {language === "zh" ? "完整形式：" : "Base form: "}
                          <span className="text-pop">{word.baseForm ?? word.dutch}</span>
                        </p>
                        {word.usageNote ? <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{word.usageNote[language]}</p> : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {word.formExamples.map((example) => (
                            <span key={example} className="rounded-full bg-white px-3 py-1 text-sm font-black text-ocean ring-1 ring-blue-100">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="font-black text-ink">{word.exampleSentence.dutch}</p>
                      <p className="mt-1 text-sm font-bold text-ocean/60">{word.exampleSentence.meaning[language]}</p>
                      <div className="mt-3">
                        <AudioButton text={word.exampleSentence.audioText} label={language === "zh" ? "听例句" : "Sentence"} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {currentStep.id === "patterns" ? (
          <div>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "只学今天用得到的句型" : "Only today's useful pattern"}</p>
                <h2 className="mt-3 text-4xl font-black text-ink">{language === "zh" ? "今日小规则" : "Today's rule"}</h2>
                <div className="mt-6 grid gap-4">
                  {lesson.sentencePatterns.map((pattern) => (
                    <article key={pattern.dutchPattern} className="rounded-[26px] bg-skywash p-5">
                      <h3 className="text-2xl font-black text-ink">{pattern.dutchPattern}</h3>
                      <p className="mt-2 font-bold leading-7 text-ocean/70">{pattern.explanation[language]}</p>
                      <div className="mt-4 grid gap-2">
                        {pattern.examples.map((example) => (
                          <div key={example.dutch} className="rounded-2xl bg-white p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-black text-ink">{example.dutch}</p>
                              <AudioButton text={example.audioText} label={language === "zh" ? "听" : "Play"} />
                            </div>
                            <p className="text-sm font-bold text-ocean/60">{example.meaning[language]}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm font-black leading-6 text-pop">{pattern.commonMistake[language]}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="rounded-[30px] bg-ink p-6 text-white">
                <p className="text-sm font-black tracking-[0.16em] text-orange-200">{language === "zh" ? "迷你语法" : "Mini grammar"}</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">{lesson.miniGrammar.title[language]}</h3>
                <p className="mt-4 rounded-[22px] bg-white p-4 text-2xl font-black text-ink">{lesson.miniGrammar.pattern}</p>
                <p className="mt-4 font-bold leading-8 text-blue-50">{lesson.miniGrammar.explanation[language]}</p>
                <div className="mt-5 grid gap-2">
                  {lesson.miniGrammar.examples.map((example) => (
                    <div key={example.dutch} className="flex flex-col gap-2 rounded-2xl bg-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-black text-blue-50">{example.dutch}</p>
                      <AudioButton text={example.audioText} label={language === "zh" ? "听" : "Play"} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep.id === "repeat" ? (
          <div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "跟读" : "Listen and repeat"}</p>
                <h2 className="mt-3 text-3xl font-black text-ink">{language === "zh" ? "一句一句点，一句一句读" : "Tap one line, repeat one line"}</h2>
                <div className="mt-5 grid gap-3">
                  {lesson.listenAndRepeat.map((item) => (
                    <div key={item.dutch} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                      <p className="text-lg font-black text-ink">{item.dutch}</p>
                      <AudioButton text={item.audioText} label={language === "zh" ? "跟读" : "Repeat"} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "微对话" : "Micro dialogue"}</p>
                <h2 className="mt-3 text-3xl font-black text-ink">{language === "zh" ? "短到可以马上模仿" : "Short enough to copy now"}</h2>
                <div className="mt-5 grid gap-3">
                  {lesson.microDialogue.map((line, index) => (
                    <div key={`${line.speaker}-${index}`} className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black text-pop">{line.speaker}</p>
                      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-lg font-black text-ink">{line.dutch}</p>
                        <AudioButton text={line.audioText} label={language === "zh" ? "听" : "Play"} />
                      </div>
                      <p className="text-sm font-bold text-ocean/60">{line.meaning[language]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep.id === "practice" ? (
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "现在开始动手" : "Now do something"}</p>
            <h2 className="mt-3 text-4xl font-black text-ink">{language === "zh" ? "练习" : "Practice"}</h2>
            <p className="mt-3 max-w-2xl text-lg font-bold leading-8 text-ocean/65">
              {language === "zh"
                ? "按顺序完成练习。每次只显示一组题，做完再切到下一组。"
                : "Work through the practice in order. One group is shown at a time."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {practiceGroups.map((group, index) => {
                const active = activePracticeGroup?.type === group.type;
                return (
                  <button
                    key={group.type}
                    type="button"
                    onClick={() => setActivePracticeType(group.type)}
                    className={`rounded-[24px] p-4 text-left ring-1 transition ${
                      active ? "bg-ink text-white ring-ink" : "bg-slate-50 text-ocean ring-blue-100 hover:bg-skywash"
                    }`}
                  >
                    <p className={`text-xs font-black tracking-[0.14em] ${active ? "text-orange-200" : "text-pop"}`}>
                      {language === "zh" ? `第 ${index + 1} 组` : `Group ${index + 1}`}
                    </p>
                    <p className="mt-2 text-lg font-black leading-6">{practiceLabels[group.type][language]}</p>
                    <p className={`mt-2 text-sm font-bold leading-6 ${active ? "text-blue-50" : "text-ocean/60"}`}>
                      {group.items.length} {language === "zh" ? "题" : "items"}
                    </p>
                  </button>
                );
              })}
            </div>

            {activePracticeGroup ? (
              <div className="mt-6 grid gap-6">
                <section className="rounded-[30px] bg-slate-50 p-5 ring-1 ring-blue-100">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-ink">{activePracticeGroup.title}</h3>
                      <p className="mt-1 font-bold leading-7 text-ocean/60">{activePracticeGroup.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
                      {activePracticeGroup.items.length} {language === "zh" ? "题" : "items"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {activePracticeGroup.items.map((item) => {
                      const selected = answers[item.id];
                      const typed = typedAnswers[item.id] ?? "";
                      const built = builtAnswers[item.id] ?? [];
                      const isTypedCorrect = typed.trim().toLowerCase() === item.answer.toLowerCase();
                      const normalizedBuilt = normalizePracticeSentence(displayBuiltSentence(built));
                      const normalizedBuilderAnswer = normalizePracticeSentence(item.answer);
                      const isBuiltCorrect = normalizedBuilt === normalizedBuilderAnswer;
                      const isCorrect = selected === item.answer;
                      const builderSlotCount = item.type === "sentence-builder" ? (item.options?.length ?? item.answer.replace(/[.!?]+$/g, "").split(/\s+/).filter(Boolean).length) : 0;
                      const isBuilderComplete = item.type === "sentence-builder" && builderSlotCount > 0 && built.length === builderSlotCount;
                      const availableBuilderOptions = (item.options ?? []).filter((option, optionIndex) => {
                        const usedCount = built.filter((part) => part === option).length;
                        const optionCountBefore = (item.options ?? []).slice(0, optionIndex + 1).filter((part) => part === option).length;
                        return usedCount < optionCountBefore;
                      });
                      return (
                        <article key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-blue-100">
                          <p className="text-xs font-black tracking-[0.14em] text-pop">{practiceLabels[item.type][language]}</p>
                          <h4 className="mt-2 font-black leading-7 text-ink">{item.prompt[language]}</h4>
                          {item.type === "sentence-builder" ? (
                            <div className="mt-4 grid gap-4">
                              <div className="rounded-[22px] bg-skywash p-3 ring-1 ring-blue-100">
                                <p className="text-xs font-black tracking-[0.14em] text-ocean/55">
                                  {language === "zh" ? "先放进槽位" : "Build in the slots"}
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                  {Array.from({ length: builderSlotCount }).map((_, slotIndex) => {
                                    const part = built[slotIndex];
                                    return part ? (
                                      <button
                                        key={`${item.id}-slot-${slotIndex}`}
                                        type="button"
                                        onClick={() => {
                                          setBuiltAnswers((current) => ({ ...current, [item.id]: built.filter((_, partIndex) => partIndex !== slotIndex) }));
                                          setAnswers((current) => {
                                            const next = { ...current };
                                            delete next[item.id];
                                            return next;
                                          });
                                        }}
                                        className="min-h-14 rounded-2xl bg-white px-4 py-3 text-left font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
                                      >
                                        <span className="mr-2 text-xs text-pop">{slotIndex + 1}</span>
                                        {part}
                                      </button>
                                    ) : (
                                      <div
                                        key={`${item.id}-slot-${slotIndex}`}
                                        className="flex min-h-14 items-center rounded-2xl border border-dashed border-blue-200 bg-white/70 px-4 py-3 text-sm font-black text-ocean/45"
                                      >
                                        {language === "zh" ? `第 ${slotIndex + 1} 个词块` : `Chunk ${slotIndex + 1}`}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-black tracking-[0.14em] text-pop">{language === "zh" ? "可选词块" : "Available chunks"}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {availableBuilderOptions.map((option, optionIndex) => (
                                    <button
                                      key={`${option}-${optionIndex}`}
                                      type="button"
                                      onClick={() => {
                                        setBuiltAnswers((current) => ({ ...current, [item.id]: [...(current[item.id] ?? []), option] }));
                                        setAnswers((current) => {
                                          const next = { ...current };
                                          delete next[item.id];
                                          return next;
                                        });
                                      }}
                                      className="rounded-full bg-white px-4 py-2 font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                  {!availableBuilderOptions.length ? (
                                    <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-ocean/55">
                                      {language === "zh" ? "词块已放完，可以检查。" : "All chunks placed. Check it."}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                  type="button"
                                  disabled={!isBuilderComplete}
                                  onClick={() => setAnswers((current) => ({ ...current, [item.id]: displayBuiltSentence(built) }))}
                                  className={`rounded-2xl px-4 py-3 font-black text-white ${
                                    isBuilderComplete ? "bg-ink" : "cursor-not-allowed bg-ocean/30"
                                  }`}
                                >
                                  {language === "zh" ? "检查句子" : "Check sentence"}
                                </button>
                                <button
                                  type="button"
                                  disabled={!built.length}
                                  onClick={() => {
                                    setBuiltAnswers((current) => ({ ...current, [item.id]: built.slice(0, -1) }));
                                    setAnswers((current) => {
                                      const next = { ...current };
                                      delete next[item.id];
                                      return next;
                                    });
                                  }}
                                  className="rounded-2xl bg-slate-100 px-4 py-3 font-black text-ocean disabled:cursor-not-allowed disabled:text-ocean/35"
                                >
                                  {language === "zh" ? "撤回一个" : "Undo one"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBuiltAnswers((current) => ({ ...current, [item.id]: [] }));
                                    setAnswers((current) => {
                                      const next = { ...current };
                                      delete next[item.id];
                                      return next;
                                    });
                                  }}
                                  className="rounded-2xl bg-slate-100 px-4 py-3 font-black text-ocean"
                                >
                                  {language === "zh" ? "清空重排" : "Reset"}
                                </button>
                              </div>

                              {answers[item.id] ? (
                                <div className={`rounded-2xl p-3 text-sm font-black ${isBuiltCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                                  {isBuiltCorrect
                                    ? (language === "zh" ? `对了：${item.answer}` : `Correct: ${item.answer}`)
                                    : (language === "zh" ? "顺序还不对。点击槽位里的词块可以拿下来，再重新排。" : "The order is not right yet. Tap a placed chunk to remove it and reorder.")}
                                </div>
                              ) : null}

                              {answers[item.id] && isBuiltCorrect && item.audioText ? (
                                <AudioButton text={item.audioText} label={language === "zh" ? "听完整句" : "Play full sentence"} />
                              ) : null}
                            </div>
                          ) : item.options ? (
                            <div className="mt-4 grid gap-2">
                              {item.options.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
                                  className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                                    selected === option ? (isCorrect ? "bg-mint text-ocean ring-emerald-100" : "bg-peach text-ocean ring-orange-100") : "bg-slate-50 text-ocean ring-blue-100 hover:bg-skywash"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                              {selected ? <p className={`rounded-2xl p-3 text-sm font-black ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>{isCorrect ? (language === "zh" ? "对了，可以跟读。" : "Correct. Repeat it.") : (language === "zh" ? "还不对，再看意思选一次。" : "Not yet. Read the meaning and try again.")}</p> : null}
                            </div>
                          ) : item.type === "fill-blank" ? (
                            <div className="mt-4 grid gap-3">
                              <input
                                value={typed}
                                onChange={(event) => setTypedAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
                                className="rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 font-black text-ink outline-none focus:border-pop"
                                placeholder={language === "zh" ? "输入答案" : "Type your answer"}
                              />
                              <button
                                type="button"
                                onClick={() => setAnswers((current) => ({ ...current, [item.id]: typed }))}
                                className="rounded-2xl bg-ink px-4 py-3 font-black text-white"
                              >
                                {language === "zh" ? "检查答案" : "Check answer"}
                              </button>
                              {answers[item.id] ? <p className={`rounded-2xl p-3 text-sm font-black ${isTypedCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>{isTypedCorrect ? (language === "zh" ? "对了。" : "Correct.") : (language === "zh" ? "还不对，再试一次。" : "Not yet. Try again.")}</p> : null}
                            </div>
                          ) : (
                            <p className="mt-4 rounded-2xl bg-skywash p-4 font-black text-ocean">{item.answer}</p>
                          )}
                          {item.audioText && answers[item.id] && item.type !== "sentence-builder" ? (
                            <div className="mt-3">
                              <AudioButton text={item.audioText} label={language === "zh" ? "听一遍" : "Play it"} />
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === "output" ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "最后只做输出" : "Final action: output"}</p>
              <h2 className="mt-3 text-4xl font-black text-ink">{language === "zh" ? "说出来" : "Speak it"}</h2>
              <p className="mt-4 text-xl font-black leading-9 text-ocean/75">{lesson.speakOutput.task[language]}</p>
              <div className="mt-6 rounded-[28px] bg-peach p-5">
                <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "参考输出" : "Sample output"}</p>
                <p className="mt-3 text-3xl font-black leading-10 text-ink">{lesson.speakOutput.sampleAnswer.dutch}</p>
                <p className="mt-2 font-bold text-ocean/65">{lesson.speakOutput.sampleAnswer.meaning[language]}</p>
                <div className="mt-4">
                  <AudioButton text={lesson.speakOutput.sampleAnswer.audioText} label={language === "zh" ? "听参考输出" : "Play sample"} />
                </div>
              </div>
            </div>
            <div className="rounded-[30px] bg-slate-50 p-5 ring-1 ring-blue-100">
              <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "复习卡" : "Review card"}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-pop">{language === "zh" ? "3 个词" : "3 words"}</p>
                  <p className="mt-2 font-black text-ink">{lesson.review.words.join(" / ")}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-pop">{language === "zh" ? "2 个句型" : "2 patterns"}</p>
                  <p className="mt-2 font-black text-ink">{lesson.review.sentencePatterns.join(" / ")}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-pop">{language === "zh" ? "1 个小输出" : "1 tiny output"}</p>
                  <p className="mt-2 font-black text-ink">{lesson.review.tinyOutput[language]}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <nav className="sticky bottom-3 z-10 mt-5 rounded-[28px] border border-blue-100 bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 font-black text-ocean disabled:opacity-40"
          >
            <ArrowLeft size={18} />
            {language === "zh" ? "本课上一步" : "Previous in lesson"}
          </button>
          <p className="text-center text-sm font-black text-pop">{audioStatus}</p>
          {stepIndex < lessonSteps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-pop px-5 py-3 font-black text-ink"
            >
              {language === "zh" ? "继续本课" : "Continue lesson"}
              <ArrowRight size={18} />
            </button>
          ) : lessonFlowComplete ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link href={wordBubbleRoute} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white">
                {language === "zh" ? "本日单词泡泡" : "Today's word bubbles"}
                <ArrowRight size={18} />
              </Link>
              {shouldOpenFoundationAfterLesson ? (
                <Link href="/rules?mode=foundation" className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-5 py-3 font-black text-ocean ring-1 ring-blue-100">
                  {language === "zh" ? "去最小语法地基" : "Open Grammar Base 1"}
                  <ArrowRight size={18} />
                </Link>
              ) : nextLesson ? (
                nextLessonAccessible ? (
                  <Link href={`/learn/${nextLesson.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-5 py-3 font-black text-ocean ring-1 ring-blue-100">
                    {language === "zh" ? "进入下一课" : "Open next lesson"}
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUpgrade(nextLesson.level, nextLesson.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-5 py-3 font-black text-ocean ring-1 ring-blue-100"
                  >
                    <LockKeyhole size={18} />
                    {language === "zh" ? "解锁下一课" : "Unlock next lesson"}
                  </button>
                )
              ) : (
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-5 py-3 font-black text-ocean ring-1 ring-blue-100">
                  {language === "zh" ? "回课程总览" : "Back to courses"}
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={completeLessonFlow}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white"
            >
              <CheckCircle2 size={18} />
              {language === "zh" ? "完成输出" : "Finish output"}
            </button>
          )}
        </div>
      </nav>

      <section className="mt-7 rounded-[30px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "课程路线" : "Course path"}</p>
            <h2 className="mt-2 text-3xl font-black text-ink">
              {lesson.level} {language === "zh" ? "第" : "Lesson"} {currentLessonIndexInLevel + 1}/{currentLevelLessons.length}
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {previousLesson ? (
            canAccessLesson(previousLesson, accessLevel, signedIn) ? (
              <Link href={`/learn/${previousLesson.id}`} className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-blue-100 transition hover:bg-skywash">
                <p className="text-xs font-black tracking-[0.12em] text-ocean/50">{language === "zh" ? "上一课" : "Previous"}</p>
                <p className="mt-2 font-black leading-6 text-ocean">{previousLesson.title[language]}</p>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openUpgrade(previousLesson.level, previousLesson.id)}
                className="rounded-[24px] bg-slate-50 p-4 text-left ring-1 ring-orange-100 transition hover:bg-peach"
              >
                <p className="inline-flex items-center gap-2 text-xs font-black tracking-[0.12em] text-pop">
                  <LockKeyhole size={14} />
                  {language === "zh" ? "上一课已锁定" : "Previous locked"}
                </p>
                <p className="mt-2 font-black leading-6 text-ocean">{previousLesson.title[language]}</p>
              </button>
            )
          ) : (
            <div className="rounded-[24px] bg-slate-50 p-4 text-ocean/40 ring-1 ring-blue-100">
              <p className="text-xs font-black tracking-[0.12em]">{language === "zh" ? "上一课" : "Previous"}</p>
              <p className="mt-2 font-black">{language === "zh" ? "这是第一课" : "This is the first lesson"}</p>
            </div>
          )}

          <div className="rounded-[24px] bg-ink p-4 text-white">
            <p className="text-xs font-black tracking-[0.12em] text-orange-200">{language === "zh" ? "当前课" : "Current"}</p>
            <p className="mt-2 font-black leading-6">{lesson.title[language]}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-pop" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {nextLesson ? (
            canAccessLesson(nextLesson, accessLevel, signedIn) ? (
              <Link href={`/learn/${nextLesson.id}`} className="rounded-[24px] bg-peach p-4 ring-1 ring-orange-100 transition hover:bg-orange-100">
                <p className="text-xs font-black tracking-[0.12em] text-pop">{language === "zh" ? "下一课" : "Next"}</p>
                <p className="mt-2 font-black leading-6 text-ink">{nextLesson.title[language]}</p>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openUpgrade(nextLesson.level, nextLesson.id)}
                className="rounded-[24px] bg-peach p-4 text-left ring-1 ring-orange-100 transition hover:bg-orange-100"
              >
                <p className="inline-flex items-center gap-2 text-xs font-black tracking-[0.12em] text-pop">
                  <LockKeyhole size={14} />
                  {language === "zh" ? "下一课已锁定" : "Next locked"}
                </p>
                <p className="mt-2 font-black leading-6 text-ink">{nextLesson.title[language]}</p>
              </button>
            )
          ) : (
            <Link href="/dashboard" className="rounded-[24px] bg-mint p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-black tracking-[0.12em] text-ocean/60">{language === "zh" ? "完成" : "Done"}</p>
              <p className="mt-2 font-black leading-6 text-ocean">{language === "zh" ? "回到学习首页" : "Back to dashboard"}</p>
            </Link>
          )}
        </div>

        <details className="group mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-blue-100">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-2 py-2 font-black text-ocean outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-pop/35 [&::-webkit-details-marker]:hidden">
            <span>{language === "zh" ? "A0-B1 课程目录" : "A0-B1 lesson index"}</span>
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pop text-white shadow-sm transition-transform group-open:rotate-180"
              aria-label={language === "zh" ? "展开课程目录" : "Open lesson index"}
            >
              <ChevronDown size={20} aria-hidden="true" />
            </span>
          </summary>
          <div className="mt-5 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {lessonsByLevel.map((group) => (
              <div key={group.level}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black text-ink">{group.level}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
                    {group.lessons.length} {language === "zh" ? "课" : "lessons"}
                  </span>
                </div>
                <ol className="mt-3 grid gap-2">
                  {group.lessons.map((item, index) => {
                    const itemLocked = !canAccessLesson(item, accessLevel, signedIn);
                    return (
                      <li key={item.id}>
                        {itemLocked ? (
                          <button
                            type="button"
                            onClick={() => openUpgrade(item.level, item.id)}
                            className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left text-ocean ring-1 ring-orange-100 transition hover:bg-peach"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach text-sm font-black text-ocean">
                              {index + 1}
                            </span>
                            <span className="font-black leading-6">{item.title[language]}</span>
                            <LockKeyhole size={15} className="text-pop" />
                          </button>
                        ) : (
                          <Link
                            href={`/learn/${item.id}`}
                            className={`grid grid-cols-[2.5rem_1fr] items-center gap-3 rounded-2xl px-3 py-2 transition ${
                              item.id === lesson.id ? "bg-ink text-white" : "bg-white text-ocean ring-1 ring-blue-100 hover:bg-skywash"
                            }`}
                          >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${item.id === lesson.id ? "bg-pop text-ink" : "bg-skywash text-ocean"}`}>
                              {index + 1}
                            </span>
                            <span className="font-black leading-6">{item.title[language]}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </details>
      </section>
      <UpgradeModal
        open={Boolean(upgradeLevel)}
        lockedLevel={upgradeLevel}
        continueHref={upgradeLessonId ? `/learn/${upgradeLessonId}` : undefined}
        onClose={closeUpgrade}
      />
    </main>
  );
}
