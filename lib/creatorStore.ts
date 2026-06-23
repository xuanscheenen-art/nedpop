"use client";

import { dailyWordPacks } from "@/data/dailyWordPacks";
import { wordItems } from "@/data/vocabularyPlan";
import {
  clearCreatorOverrides,
  getEffectiveDayPacks,
  getEffectiveCourseLessons,
  getEffectiveWords,
  getCreatorCourseLessonOverrides,
  getCreatorWordOverrides,
  saveCreatorCourseLessonOverride,
  saveCreatorDayPackOverride,
  saveCreatorWordOverride,
  type CourseLessonContentOverride,
  type WordContentOverride,
} from "@/lib/contentStore";
import type { CourseLevel, LocalizedText } from "@/types/course";
import type { CourseLesson, CourseLessonPracticeItem } from "@/types/lesson";
import type {
  ActiveOrPassive,
  DailyWordPack,
  ExamRelevance,
  LevelConfidence,
  LearningRoleInPack,
  PhraseChunk,
  ReviewStatus,
  SentencePattern,
  SourceTag,
  VocabularyLevel,
  WordItem,
  MemoryPath,
} from "@/types/vocabulary";

const lt = (zh = "", en = ""): LocalizedText => ({ zh, en });

export type ExampleQualityStatus = "usable" | "needs-review" | "reject";
export type ExampleType = "minimal" | "collocation" | "scenario" | "output" | "contrast" | "mistake-correction";
export type ExampleStatus = "complete" | "missing-examples" | "incomplete" | "rejected";
export type PackCompletenessStatus = "complete" | "missing examples" | "needs content";

export type CreatorExampleSentence = {
  id: string;
  dutch: string;
  meaning: LocalizedText;
  level: CourseLevel;
  type: ExampleType;
  targetWord: string;
  grammarFocus: string;
  scenarioTags: string[];
  audioText: string;
  audioSrc?: string;
  qualityStatus: ExampleQualityStatus;
};

export type CreatorPhraseChunk = {
  id: string;
  dutch: string;
  meaning: LocalizedText;
  usageScene: LocalizedText;
  audioText: string;
  audioSrc?: string;
};

export type CreatorWord = Omit<WordItem, "phraseChunks" | "exampleSentence"> & {
  phraseChunks: CreatorPhraseChunk[];
  exampleSentences: CreatorExampleSentence[];
  memoryPath?: MemoryPath;
  englishExplanation: string;
  pronunciationHint: string;
  articleReason: string;
  commonMistake: string;
};

export type CreatorDayWord = {
  wordId: string;
  dutch: string;
  role: LearningRoleInPack;
  originalLevel: VocabularyLevel;
};

export type CreatorDayPack = Omit<DailyWordPack, "newWords" | "reviewWords" | "recognitionWords" | "phraseChunks" | "sentencePatterns"> & {
  words: CreatorDayWord[];
  phraseChunks: PhraseChunk[];
  sentencePatterns: SentencePattern[];
};

export type CreatorCourseLesson = CourseLesson;

const toCreatorExample = (word: WordItem): CreatorExampleSentence => ({
  id: `${word.id}-example-1`,
  dutch: word.exampleSentence.dutch,
  meaning: word.exampleSentence.meaning,
  level: word.level,
  type: "minimal",
  targetWord: word.dutch,
  grammarFocus: "",
  scenarioTags: word.scenarioTags,
  audioText: word.exampleSentence.dutch,
  audioSrc: word.audioSrc,
  qualityStatus: word.exampleSentence.meaning.zh && word.exampleSentence.meaning.en ? "usable" : "needs-review",
});

const toCreatorPhrase = (word: WordItem, phrase: string, index: number): CreatorPhraseChunk => ({
  id: `${word.id}-phrase-${index + 1}`,
  dutch: phrase,
  meaning: lt("", ""),
  usageScene: lt(word.theme, word.theme),
  audioText: phrase,
});

const toCreatorWord = (word: WordItem, override?: WordContentOverride): CreatorWord => {
  return {
  ...word,
  phraseChunks: override?.phraseChunks ?? word.phraseChunks.map((phrase, index) => toCreatorPhrase(word, phrase, index)),
  exampleSentences: override?.exampleSentences ?? [toCreatorExample(word)],
  memoryPath: override?.memoryPath,
  englishExplanation: override?.englishExplanation ?? "",
  pronunciationHint: override?.pronunciationHint ?? "",
  articleReason: override?.articleReason ?? (word.article ? `先整块记 ${word.article} ${word.dutch}。` : ""),
  commonMistake: override?.commonMistake ?? "",
  };
};

const toCreatorPack = (pack: DailyWordPack): CreatorDayPack => ({
  id: pack.id,
  level: pack.level,
  dayNumber: pack.dayNumber,
  title: pack.title,
  theme: pack.theme,
  words: [
    ...pack.newWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "new" as const, originalLevel: word.originalLevel })),
    ...pack.reviewWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "review" as const, originalLevel: word.originalLevel })),
    ...pack.recognitionWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "recognition" as const, originalLevel: word.originalLevel })),
  ],
  phraseChunks: pack.phraseChunks,
  sentencePatterns: pack.sentencePatterns,
  outputTask: pack.outputTask,
  estimatedMinutes: pack.estimatedMinutes,
});

const initialWords = () => {
  const overrides = getCreatorWordOverrides();
  return getEffectiveWords().map((word) => toCreatorWord(word, overrides[word.id] ?? overrides[word.dutch]));
};
const initialPacks = () => getEffectiveDayPacks().map(toCreatorPack);
const initialLessons = () => getEffectiveCourseLessons();

export const getWords = (): CreatorWord[] => {
  return initialWords();
};

export const getWordById = (wordId: string): CreatorWord | undefined =>
  getWords().find((word) => word.id === wordId || word.dutch === wordId);

export const updateWord = (wordId: string, patch: Partial<CreatorWord>) => {
  const current = getWordById(wordId);
  if (!current) return undefined;
  const next = { ...current, ...patch, id: current.id };
  saveCreatorWordOverride(current.id, next);
  return getWordById(current.id);
};

export const getDayPacks = (): CreatorDayPack[] => {
  return initialPacks();
};

export const updateDayPack = (packId: string, patch: Partial<CreatorDayPack>) => {
  const current = getDayPacks().find((pack) => pack.id === packId);
  if (!current) return undefined;
  const next = { ...current, ...patch, id: current.id };
  saveCreatorDayPackOverride(current.id, next);
  return getDayPacks().find((pack) => pack.id === current.id);
};

export const getCourseLessons = (): CreatorCourseLesson[] => {
  return initialLessons();
};

export const getCourseLessonById = (lessonId: string): CreatorCourseLesson | undefined =>
  getCourseLessons().find((lesson) => lesson.id === lessonId);

export const updateCourseLesson = (lessonId: string, patch: Partial<CreatorCourseLesson>) => {
  const current = getCourseLessonById(lessonId);
  if (!current) return undefined;
  const next = { ...current, ...patch, id: current.id };
  saveCreatorCourseLessonOverride(current.id, next as CourseLessonContentOverride);
  return getCourseLessonById(current.id);
};

export const courseLessonOverrideExists = (lessonId: string) => Boolean(getCreatorCourseLessonOverrides()[lessonId]);

export const resetCreatorEdits = () => {
  clearCreatorOverrides();
};

export const exampleStatusFor = (word: CreatorWord): ExampleStatus => {
  if (!word.exampleSentences.length) return "missing-examples";
  if (word.exampleSentences.some((example) => example.qualityStatus === "reject")) return "rejected";
  if (
    word.exampleSentences.some(
      (example) =>
        example.qualityStatus === "needs-review" ||
        !example.dutch.trim() ||
        !example.meaning.zh.trim() ||
        !example.meaning.en.trim() ||
        !example.audioText.trim(),
    )
  ) return "incomplete";
  return "complete";
};

export const validationWarningsForExample = (example: CreatorExampleSentence) => {
  const warnings: string[] = [];
  if (!example.meaning.zh.trim()) warnings.push("missing Chinese meaning");
  if (!example.meaning.en.trim()) warnings.push("missing English meaning");
  if (!example.audioText.trim()) warnings.push("missing audioText");
  if (example.targetWord && !example.dutch.toLowerCase().includes(example.targetWord.toLowerCase())) warnings.push("target word not present");
  const wordCount = example.dutch.split(/\s+/).filter(Boolean).length;
  if (example.level === "A0" && wordCount > 7) warnings.push("A0 sentence too hard");
  if (example.level === "A1" && /(bezwaar|vergoeding|machtiging|aanmaning|vergunning)/i.test(example.dutch)) warnings.push("A1 sentence too formal");
  if (example.level === "A2" && /(maatschappij|beleid|argument|abstract)/i.test(example.dutch)) warnings.push("A2 sentence too abstract");
  if (wordCount > 14) warnings.push("sentence too long for level");
  return warnings;
};

export const packStatusFor = (pack: CreatorDayPack, words = getWords()): PackCompletenessStatus => {
  const packWords = pack.words.map((entry) => words.find((word) => word.id === entry.wordId)).filter(Boolean) as CreatorWord[];
  if (packWords.some((word) => exampleStatusFor(word) !== "complete")) return "missing examples";
  if (!pack.phraseChunks.length || !pack.sentencePatterns.length) return "needs content";
  return "complete";
};

export const wordPackAssignmentsFor = (wordId: string, packs = getDayPacks()) =>
  packs
    .filter((pack) => pack.words.some((word) => word.wordId === wordId))
    .map((pack) => {
      const entry = pack.words.find((word) => word.wordId === wordId);
      return `${pack.level} Day ${pack.dayNumber} · ${entry?.role ?? "new"}`;
    });

export type CreatorWordPatch = Partial<Pick<
  CreatorWord,
  | "dutch"
  | "article"
  | "plural"
  | "level"
  | "originalLevel"
  | "appearsInLevels"
  | "activeOrPassive"
  | "examRelevance"
  | "levelConfidence"
  | "scenarioTags"
  | "sourceTags"
  | "levelReason"
  | "reviewStatus"
  | "meaning"
  | "memoryHook"
  | "englishBridge"
  | "englishExplanation"
  | "pronunciationHint"
  | "articleReason"
  | "commonMistake"
>>;

export const creatorOptions = {
  levels: ["A0", "A1", "A2"] as CourseLevel[],
  articles: ["", "de", "het"],
  activeOrPassive: ["active", "recognition"] as ActiveOrPassive[],
  examRelevance: ["high", "medium", "low"] as ExamRelevance[],
  levelConfidence: ["high", "medium", "low"] as LevelConfidence[],
  reviewStatus: ["approved", "needs-review", "too-easy", "too-hard", "duplicate", "not-useful"] as ReviewStatus[],
  sourceTags: ["duo-inburgering-task", "naar-nederland", "nt2-taalmenu", "dutch-online-academy", "course-preview", "frequency", "manual", "generated"] as SourceTag[],
  exampleTypes: ["minimal", "collocation", "scenario", "output", "contrast", "mistake-correction"] as ExampleType[],
  exampleQuality: ["usable", "needs-review", "reject"] as ExampleQualityStatus[],
  practiceTypes: ["match-word", "choose-correct-phrase", "fill-blank", "sentence-builder", "say-it-yourself"] as CourseLessonPracticeItem["type"][],
  roles: ["new", "review", "recognition"] as LearningRoleInPack[],
};
