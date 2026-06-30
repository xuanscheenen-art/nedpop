import { courseLessons } from "@/data/courseLessons";
import { dailyWordPacks } from "@/data/dailyWordPacks";
import type { LearningProgress, LearningStep } from "@/lib/learningProgress";

export type NextActionType =
  | "pronunciation"
  | "starter-words"
  | "grammar"
  | "lesson"
  | "word-bubbles"
  | "grammar-on-demand"
  | "practice"
  | "scenario-output"
  | "review"
  | "next-day";

export type NextRecommendedAction = {
  labelZh: string;
  labelEn: string;
  route: string;
  reasonZh: string;
  reasonEn: string;
  type: NextActionType;
};

const lessonIdFor = (level: string, day: number) => `${level.toLowerCase()}-${String(Math.max(1, day)).padStart(2, "0")}`;
const lessonRouteFor = (level: string, day: number, step?: "patterns" | "practice" | "output") =>
  `/learn/${lessonIdFor(level, day)}${step ? `?step=${step}` : ""}`;
const wordBubbleRouteFor = (level: string, day: number) => `/word-link?level=${level}&day=${day}`;

const completedForDay = (progress: LearningProgress): LearningStep[] => {
  const levelSteps = progress.completedStepsByDay[progress.currentLevel] ?? {};
  return levelSteps[String(progress.currentDay)] ?? [];
};

const lessonFor = (level: string, day: number) =>
  courseLessons.find((lesson) => lesson.level === level && lesson.order === day);

const packFor = (level: string, day: number) =>
  dailyWordPacks.find((pack) => pack.level === level && pack.dayNumber === day);

const wordCountForPack = (level: string, day: number) => {
  const pack = packFor(level, day);
  if (!pack) return 0;
  return pack.newWords.length + pack.reviewWords.length + pack.recognitionWords.length;
};

export function getNextRecommendedAction(progress: LearningProgress): NextRecommendedAction {
  const starterLesson = lessonFor("A0", 1);

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
      labelZh: starterLesson ? `A0 Day 1：${starterLesson.title.zh}` : "A0 Day 1 生存词课程",
      labelEn: starterLesson ? `A0 Day 1: ${starterLesson.title.en}` : "A0 Day 1 Starter Lesson",
      route: "/learn/a0-01",
      reasonZh: starterLesson?.lessonGoal.goal.zh ?? "先学马上能开口的第一批句子。",
      reasonEn: starterLesson?.lessonGoal.goal.en ?? "Learn the first lines you can use right away.",
      type: "starter-words",
    };
  }

  if (!progress.grammarBaseCompleted) {
    return {
      labelZh: "最小语法地基",
      labelEn: "Grammar Base 1",
      route: "/rules?mode=foundation",
      reasonZh: "已经有生存词了，现在只补能立刻用上的最小规则。",
      reasonEn: "You have starter words. Now learn only the rules you can use right away.",
      type: "grammar",
    };
  }

  const level = progress.currentLevel;
  const day = progress.currentDay;
  const done = completedForDay(progress);
  const lesson = lessonFor(level, day);
  const pack = packFor(level, day);

  if (!done.includes("lesson")) {
    return {
      labelZh: lesson ? `${level} Day ${day}：${lesson.title.zh}` : `${level} Day ${day} 每日课程`,
      labelEn: lesson ? `${level} Day ${day}: ${lesson.title.en}` : `${level} Day ${day} Lesson`,
      route: lessonRouteFor(level, day),
      reasonZh: lesson?.lessonGoal.goal.zh ?? "先知道今天主题，再进入单词和练习。",
      reasonEn: lesson?.lessonGoal.goal.en ?? "First learn today's theme, then move into words and practice.",
      type: "lesson",
    };
  }

  if (!done.includes("word-bubbles")) {
    const wordCount = wordCountForPack(level, day);
    return {
      labelZh: pack ? `单词泡泡：${pack.title.zh}` : "今日单词泡泡",
      labelEn: pack ? `Word bubbles: ${pack.title.en}` : "Today's Word Bubbles",
      route: wordBubbleRouteFor(level, day),
      reasonZh: pack
        ? `今天这包有 ${wordCount} 个词，主题是 ${pack.theme}。这是主线词包，完成后才进入今天的小规则。`
        : "你已经知道今天主题了，现在去记核心词。",
      reasonEn: pack
        ? `This pack has ${wordCount} words around ${pack.theme}. Finish the main word pack before today's rule.`
        : "You know today's theme. Now memorize the core words.",
      type: "word-bubbles",
    };
  }

  if (!done.includes("grammar-on-demand")) {
    return {
      labelZh: lesson ? `小规则：${lesson.miniGrammar.title.zh}` : "今日小规则",
      labelEn: lesson ? `Rule: ${lesson.miniGrammar.title.en}` : "Today's Rule",
      route: lessonRouteFor(level, day, "patterns"),
      reasonZh: lesson
        ? `今天只补这一条：${lesson.miniGrammar.pattern}。它服务于这一天的句子，不是重新开一本语法书。`
        : "遇到今天需要的规则再补，不用一口气学完整本语法。",
      reasonEn: lesson
        ? `Add only this pattern today: ${lesson.miniGrammar.pattern}. It supports today's sentences, not a whole grammar book.`
        : "Add the rule needed today instead of studying all grammar upfront.",
      type: "grammar-on-demand",
    };
  }

  if (!done.includes("practice")) {
    const practiceCount = lesson?.practice.length ?? 0;
    return {
      labelZh: lesson ? `练习：${lesson.title.zh}` : "今日练习",
      labelEn: lesson ? `Practice: ${lesson.title.en}` : "Today's Practice",
      route: lessonRouteFor(level, day, "practice"),
      reasonZh: practiceCount
        ? `用 ${practiceCount} 道题确认今天的词、句型和小规则真的能用。`
        : "用几道题确认你真的记住了。",
      reasonEn: practiceCount
        ? `Use ${practiceCount} questions to check today's words, patterns, and rule.`
        : "Use a few questions to check that it stuck.",
      type: "practice",
    };
  }

  if (!done.includes("scenario-output")) {
    return {
      labelZh: lesson ? `场景输出：${lesson.speakOutput.task.zh}` : "场景输出",
      labelEn: lesson ? `Scenario output: ${lesson.speakOutput.task.en}` : "Scenario Output",
      route: `/scenarios?level=${level}&day=${day}`,
      reasonZh: lesson
        ? "把今天的词和句型放进真实任务里说出来，这一步完成后今天才算闭环。"
        : "把今天学的词放进真实场景里说出来。",
      reasonEn: lesson
        ? "Use today's words and patterns in a real task. This closes the day."
        : "Put today's words into a real-life situation.",
      type: "scenario-output",
    };
  }

  const nextDay = day + 1;
  const nextLesson = lessonFor(level, nextDay);

  return {
    labelZh: nextLesson ? `进入 ${level} Day ${nextDay}：${nextLesson.title.zh}` : `进入 ${level} Day ${nextDay}`,
    labelEn: nextLesson ? `Start ${level} Day ${nextDay}: ${nextLesson.title.en}` : `Start ${level} Day ${nextDay}`,
    route: lessonRouteFor(level, nextDay),
    reasonZh: "今天完成了。可以进入下一课，也可以先进复习池巩固。",
    reasonEn: "Today is complete. Move to the next lesson, or review first.",
    type: "next-day",
  };
}
