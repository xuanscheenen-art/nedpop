"use client";

import { dailyWordPacks as baseDayPacks } from "@/data/dailyWordPacks";
import { courseLessons as baseCourseLessons } from "@/data/courseLessons";
import { wordItems as baseWords } from "@/data/vocabularyPlan";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { articlePhraseFor, inferWordType, infinitiveForWord, phraseChunkMeaningFor, verbFormsForWord } from "@/lib/exampleTemplates";
import { isBadGenericTargetTemplate, isIncompletePhraseChunk, isKnownBadLearnerLine } from "@/lib/exampleQualityRules";
import { memoryPathFor, validateMemoryPath } from "@/lib/memoryPath";
import { hasStaleMemoryPathContent, shouldUseGeneratedMemoryPath } from "@/lib/memoryPathQualityGate";
import type { LocalizedText } from "@/types/course";
import type { CourseLesson } from "@/types/lesson";
import type { DailyWordItem, DailyWordPack, LearningRoleInPack, MemoryLink, MemoryPath, PhraseChunk, SentencePattern, WordItem } from "@/types/vocabulary";

export const WORD_OVERRIDES_KEY = "nedpop.creator.wordOverrides";
export const DAY_PACK_OVERRIDES_KEY = "nedpop.creator.dayPackOverrides";
export const COURSE_LESSON_OVERRIDES_KEY = "nedpop.creator.courseLessonOverrides";
export const LAST_UPDATED_KEY = "nedpop.creator.lastUpdated";
const DAY_PACK_OVERRIDE_VERSION_KEY = "nedpop.creator.dayPackOverrides.version";
const DAY_PACK_OVERRIDE_VERSION = "2026-06-b1-vocabulary-expansion";

const LEGACY_WORDS_KEY = "nedpop.creator.words.v1";
const LEGACY_PACKS_KEY = "nedpop.creator.dayPacks.v1";

const hasLocalStorage = () => {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
};

const safeParse = <T>(value: string | null): T | undefined => {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

export type EditablePhraseChunk = {
  id: string;
  dutch: string;
  meaning: LocalizedText;
  usageScene: LocalizedText;
  audioText: string;
  audioSrc?: string;
};

export type EditableExampleSentence = {
  id: string;
  dutch: string;
  meaning: LocalizedText;
  level: WordItem["level"];
  type: "minimal" | "collocation" | "scenario" | "output" | "contrast" | "mistake-correction";
  targetWord: string;
  grammarFocus: string;
  scenarioTags: string[];
  audioText: string;
  audioSrc?: string;
  qualityStatus: "usable" | "needs-review" | "reject";
};

export type WordContentOverride = Partial<Omit<WordItem, "phraseChunks" | "exampleSentence">> & {
  id: string;
  phraseChunks?: EditablePhraseChunk[];
  exampleSentences?: EditableExampleSentence[];
  memoryPath?: MemoryPath;
  englishExplanation?: string;
  pronunciationHint?: string;
  articleReason?: string;
  commonMistake?: string;
};

export type DayPackWordOverride = {
  wordId: string;
  dutch: string;
  role: LearningRoleInPack;
  originalLevel: WordItem["originalLevel"];
};

export type DayPackContentOverride = Partial<Omit<DailyWordPack, "newWords" | "reviewWords" | "recognitionWords">> & {
  id: string;
  words?: DayPackWordOverride[];
};

export type CourseLessonContentOverride = Partial<CourseLesson> & {
  id: string;
};

export type EffectiveWordBubble = WordItem & {
  phraseChunkDetails: EditablePhraseChunk[];
  exampleSentences: EditableExampleSentence[];
  memoryPath?: MemoryPath;
  englishExplanation?: string;
  pronunciationHint?: string;
  articleReason?: string;
  commonMistake?: string;
  dataSource: "base" | "override" | "merged";
  lastUpdated?: string;
};

export type CreatorContentExport = {
  schemaVersion: 1;
  exportedAt: string;
  app: "nedpop";
  localStorageKeys: {
    wordOverrides: typeof WORD_OVERRIDES_KEY;
    dayPackOverrides: typeof DAY_PACK_OVERRIDES_KEY;
    courseLessonOverrides: typeof COURSE_LESSON_OVERRIDES_KEY;
    lastUpdated: typeof LAST_UPDATED_KEY;
  };
  wordOverrides: Record<string, WordContentOverride>;
  dayPackOverrides: Record<string, DayPackContentOverride>;
  courseLessonOverrides: Record<string, CourseLessonContentOverride>;
  lastUpdated: string | null;
};

export type PublishedCreatorContentSnapshot = {
  schemaVersion: 1;
  exportedAt: string;
  app: "nedpop";
  stats: {
    effectiveWordCount: number;
    effectiveDayPackCount: number;
    effectiveCourseLessonCount: number;
    wordOverrideCount: number;
    dayPackOverrideCount: number;
    courseLessonOverrideCount: number;
    lastUpdated: string | null;
  };
  effectiveWords: WordItem[];
  effectiveDayPacks: DailyWordPack[];
  effectiveCourseLessons: CourseLesson[];
};

const toArray = <T extends { id: string }>(record: Record<string, T> | T[] | undefined) =>
  Array.isArray(record) ? record : Object.values(record ?? {});

const toRecord = <T extends { id: string }>(items: T[]) =>
  items.reduce<Record<string, T>>((record, item) => {
    record[item.id] = item;
    return record;
  }, {});

const readRecord = <T extends { id: string }>(key: string) => {
  if (!hasLocalStorage()) return {};
  const parsed = safeParse<Record<string, T> | T[]>(window.localStorage.getItem(key));
  return toRecord(toArray(parsed));
};

const writeRecord = <T extends { id: string }>(key: string, value: Record<string, T>) => {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
};

const migrateLegacyWords = () => {
  if (!hasLocalStorage() || window.localStorage.getItem(WORD_OVERRIDES_KEY)) return;
  const legacy = safeParse<WordContentOverride[]>(window.localStorage.getItem(LEGACY_WORDS_KEY));
  if (legacy?.length) writeRecord(WORD_OVERRIDES_KEY, toRecord(legacy));
};

const migrateLegacyPacks = () => {
  if (!hasLocalStorage() || window.localStorage.getItem(DAY_PACK_OVERRIDES_KEY)) return;
  const legacy = safeParse<DayPackContentOverride[]>(window.localStorage.getItem(LEGACY_PACKS_KEY));
  if (legacy?.length) writeRecord(DAY_PACK_OVERRIDES_KEY, toRecord(legacy));
};

const ensureDayPackOverrideVersion = () => {
  if (!hasLocalStorage()) return;
  if (window.localStorage.getItem(DAY_PACK_OVERRIDE_VERSION_KEY) === DAY_PACK_OVERRIDE_VERSION) return;
  window.localStorage.removeItem(DAY_PACK_OVERRIDES_KEY);
  window.localStorage.removeItem(LEGACY_PACKS_KEY);
  window.localStorage.setItem(DAY_PACK_OVERRIDE_VERSION_KEY, DAY_PACK_OVERRIDE_VERSION);
  window.localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
};

const sameJson = (left: unknown, right: unknown) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const defaultArticleReason = (word: WordItem) => word.article ? `先整块记 ${word.article} ${word.dutch}。` : "";

const hasMeaningfulPhraseOverride = (override: WordContentOverride, base: WordItem) => {
  if (!override.phraseChunks) return false;
  const sameDutchList = sameJson(override.phraseChunks.map((phrase) => phrase.dutch), base.phraseChunks);
  const hasEditedDetails = override.phraseChunks.some((phrase) =>
    phrase.meaning.zh ||
    phrase.meaning.en ||
    phrase.audioSrc ||
    phrase.usageScene.zh !== base.theme ||
    phrase.usageScene.en !== base.theme
  );
  return !sameDutchList || hasEditedDetails;
};

const hasMeaningfulExampleOverride = (override: WordContentOverride, base: WordItem) => {
  if (!override.exampleSentences) return false;
  if (override.exampleSentences.length !== 1) return true;
  const [example] = override.exampleSentences;
  return (
    example.dutch !== base.exampleSentence.dutch ||
    !sameJson(example.meaning, base.exampleSentence.meaning) ||
    example.type !== "minimal" ||
    example.targetWord !== base.dutch ||
    example.grammarFocus !== "" ||
    !sameJson(example.scenarioTags, base.scenarioTags) ||
    example.audioText !== base.exampleSentence.dutch ||
    example.audioSrc !== base.audioSrc ||
    example.qualityStatus !== (base.exampleSentence.meaning.zh && base.exampleSentence.meaning.en ? "usable" : "needs-review")
  );
};

const isMeaningfulWordOverride = (override: WordContentOverride) => {
  const base = baseWords.find((word) => word.id === override.id || word.dutch === override.id || word.dutch === override.dutch);
  if (!base) return true;

  const scalarKeys = [
    "level",
    "originalLevel",
    "appearsInLevels",
    "dutch",
    "article",
    "plural",
    "meaning",
    "theme",
    "priority",
    "activeOrPassive",
    "examRelevance",
    "levelConfidence",
    "sourceTags",
    "scenarioTags",
    "levelReason",
    "reviewStatus",
    "memoryHook",
    "englishBridge",
    "relatedWords",
    "memoryLinks",
    "audioText",
    "audioSrc",
  ] as const;
  const hasScalarChange = scalarKeys.some((key) => key in override && !sameJson(override[key], base[key]));
  return (
    hasScalarChange ||
    hasMeaningfulPhraseOverride(override, base) ||
    hasMeaningfulExampleOverride(override, base) ||
    Boolean(override.memoryPath) ||
    Boolean(override.englishExplanation) ||
    Boolean(override.pronunciationHint) ||
    Boolean(override.commonMistake) ||
    Boolean(override.articleReason && override.articleReason !== defaultArticleReason(base))
  );
};

const packWordSnapshot = (pack: DailyWordPack) => [
  ...pack.newWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "new" as const, originalLevel: word.originalLevel })),
  ...pack.reviewWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "review" as const, originalLevel: word.originalLevel })),
  ...pack.recognitionWords.map((word) => ({ wordId: word.wordId, dutch: word.dutch, role: "recognition" as const, originalLevel: word.originalLevel })),
];

const isMeaningfulPackOverride = (override: DayPackContentOverride) => {
  const base = baseDayPacks.find((pack) => pack.id === override.id);
  if (!base) return true;
  return (
    ("level" in override && override.level !== base.level) ||
    ("dayNumber" in override && override.dayNumber !== base.dayNumber) ||
    ("title" in override && !sameJson(override.title, base.title)) ||
    ("theme" in override && override.theme !== base.theme) ||
    ("estimatedMinutes" in override && override.estimatedMinutes !== base.estimatedMinutes) ||
    ("outputTask" in override && !sameJson(override.outputTask, base.outputTask)) ||
    (override.words ? !sameJson(override.words, packWordSnapshot(base)) : false) ||
    (override.phraseChunks ? !sameJson(override.phraseChunks, base.phraseChunks) : false) ||
    (override.sentencePatterns ? !sameJson(override.sentencePatterns, base.sentencePatterns) : false)
  );
};

const mergeCourseLesson = (baseLesson: CourseLesson, override?: CourseLessonContentOverride): CourseLesson => {
  if (!override) return baseLesson;
  return {
    ...baseLesson,
    ...override,
    id: baseLesson.id,
    lessonGoal: override.lessonGoal ? { ...baseLesson.lessonGoal, ...override.lessonGoal } : baseLesson.lessonGoal,
    methodMap: override.methodMap ? { ...baseLesson.methodMap, ...override.methodMap } : baseLesson.methodMap,
    soundBase: override.soundBase ? { ...baseLesson.soundBase, ...override.soundBase } : baseLesson.soundBase,
    miniGrammar: override.miniGrammar ? { ...baseLesson.miniGrammar, ...override.miniGrammar } : baseLesson.miniGrammar,
    speakOutput: override.speakOutput ? { ...baseLesson.speakOutput, ...override.speakOutput } : baseLesson.speakOutput,
    review: override.review ? { ...baseLesson.review, ...override.review } : baseLesson.review,
  };
};

const isMeaningfulCourseLessonOverride = (override: CourseLessonContentOverride) => {
  const base = baseCourseLessons.find((lesson) => lesson.id === override.id);
  if (!base) return true;
  const merged = mergeCourseLesson(base, override);
  return !sameJson(merged, base);
};

const compactRecord = <T extends { id: string }>(record: Record<string, T>, isMeaningful: (item: T) => boolean) =>
  Object.fromEntries(Object.entries(record).filter(([, item]) => isMeaningful(item))) as Record<string, T>;

const safeStandaloneWords = new Set([
  "hallo",
  "dag",
  "goedemorgen",
  "goedenavond",
  "goedemiddag",
  "tot ziens",
  "bedankt",
  "dank je",
  "alsjeblieft",
  "sorry",
  "ja",
  "nee",
]);

const learnerInternalCopyPattern =
  /缺少可用|缺少可输出|内容后台|后台设置|后台例句|后台|人工|手动|不要硬|暂时没有|placeholder|manual[- ]review|needs[- ]review|missing (example|phrase|meaning|content|audio)|creator|请补充|暂无|先补一条|还需要|词：|word:|自动扩充|generated expansion/i;

const looksLikeAnalyticGloss = (value?: string) => {
  const text = value?.trim() ?? "";
  if (!text) return false;
  return /(^|[\s，。])[^，。.!?]{1,12}\s[+＋]\s[^，。.!?]{1,12}/.test(text);
};

const looksLikeInternalContentId = (value: string) => {
  const text = value.trim().toLowerCase();
  if (!text) return true;
  if (/^a[0-2]-\d{2}[-_a-z0-9]*$/.test(text)) return true;
  if (/^(lesson|day|pack|unit)-[-_a-z0-9]+$/.test(text)) return true;
  if (/^[a-z]+-\d+[-_a-z0-9]*$/.test(text)) return true;
  if (/\d/.test(text) && /^[a-z0-9_-]+$/.test(text) && text.includes("-")) return true;
  return false;
};

const bodyPartWordsPattern =
  "(arm|been|hoofd|buik|hand|voet|rug|keel|oor|neus|mond|tand|schouder|knie|nek)";
const symptomWordsPattern =
  "(verkouden|hoesten|hoofdpijn|buikpijn|keelpijn|koorts|duizelig|misselijk|moe|benauwd)";

const isUsablePhraseText = (value: string) => {
  const text = value.trim();
  if (!text) return false;
  if (looksLikeInternalContentId(text)) return false;
  if (isIncompletePhraseChunk(text)) return false;
  if (/[.!?]$/.test(text)) return false;
  if (/(?:\.\.\.|…)/.test(text)) return false;
  if (learnerInternalCopyPattern.test(text)) return false;
  if (/\bIk ga naar (uit|hier|daar)\b/i.test(text)) return false;
  if (/\bIk zoek (de|het)\s+(salaris|loonstrook|proeftijd|afwezigheid|herinnering|waterrekening|herstel|verlof|uitzendbureau)\b/i.test(text)) return false;
  if (/\bIk heb (de|het)\s+[a-záéíóúëïöü -]+ nodig\b/i.test(text)) return false;
  if (/\bIk ga naar\s+(rusten|verkouden|hoesten|salaris|loonstrook|proeftijd|afwezigheid|herinnering|waterrekening|herstel|verlof)\b/i.test(text)) return false;
  if (new RegExp(`\\bIk ga naar (de|het)\\s+${bodyPartWordsPattern}\\b`, "i").test(text)) return false;
  if (new RegExp(`\\bIk ga naar\\s+${symptomWordsPattern}\\b`, "i").test(text)) return false;
  if (new RegExp(`\\bIk gebruik (de|het)\\s+${bodyPartWordsPattern}\\b`, "i").test(text)) return false;
  if (new RegExp(`\\bIk heb (de|het)\\s+${bodyPartWordsPattern} nodig\\b`, "i").test(text)) return false;
  if (new RegExp(`\\bWaar is (de|het)\\s+${bodyPartWordsPattern}\\b`, "i").test(text)) return false;
  return true;
};

const isUsableMemoryPhraseChunk = (chunk: MemoryPath["phraseChunks"][number]) =>
  isUsablePhraseText(chunk.dutch) &&
  !looksLikeAnalyticGloss(`${chunk.meaningZh} ${chunk.meaningEn}`) &&
  !learnerInternalCopyPattern.test(`${chunk.meaningZh} ${chunk.meaningEn}`);

const isTargetedMemoryPhraseChunk = (word: WordItem, chunk: MemoryPath["phraseChunks"][number]) =>
  isUsableMemoryPhraseChunk(chunk) && sentenceContainsTargetUse(word, chunk.dutch);

const isUsablePhraseDetail = (phrase: EditablePhraseChunk) =>
  isUsablePhraseText(phrase.dutch) &&
  phrase.meaning.zh.trim() &&
  phrase.meaning.en.trim() &&
  !looksLikeAnalyticGloss(`${phrase.meaning.zh} ${phrase.meaning.en}`) &&
  !learnerInternalCopyPattern.test(`${phrase.meaning.zh} ${phrase.meaning.en} ${phrase.usageScene.zh} ${phrase.usageScene.en}`);

const phraseStringsFromOverride = (override?: WordContentOverride, base?: WordItem) =>
  override?.phraseChunks?.map((phrase) => phrase.dutch).filter(isUsablePhraseText) ??
  base?.phraseChunks.filter(isUsablePhraseText) ??
  [];

const isBadLearnerExample = (word: WordItem, example: EditableExampleSentence) => {
  const dutch = example.dutch.trim();
  const lowerWord = word.dutch.toLowerCase();
  const bare = dutch.replace(/[.!?]$/, "").toLowerCase();
  const text = `${example.meaning.zh} ${example.meaning.en}`;
  const type = inferWordType(word);
  if (!dutch || !example.meaning.zh.trim() || !example.meaning.en.trim()) return true;
  if (looksLikeAnalyticGloss(`${example.meaning.zh} ${example.meaning.en}`)) return true;
  if (learnerInternalCopyPattern.test(`${dutch} ${text}`)) return true;
  if (!sentenceContainsTargetUse(word, dutch)) return true;
  if (isKnownBadLearnerLine(dutch)) return true;
  if (isBadGenericTargetTemplate(word, dutch)) return true;
  if (bare === lowerWord && type !== "phrase" && !safeStandaloneWords.has(lowerWord)) return true;
  if (/^Dit is\s+\w+\.?$/i.test(dutch) && type !== "noun") return true;
  if (/^Dit is dag\.?$/i.test(dutch)) return true;
  if (/^Ik\s+(werken|zijn|hebben|kunnen|willen|moeten|gaan|komen|wonen|leren|kijken|helpen|begrijpen)\b/i.test(dutch)) return true;
  if (/^Dit is (de|het|een)\s+\w+\.?$/i.test(dutch) && word.level !== "A0") return true;
  if (word.dutch.toLowerCase() === "engels" && /\bengelsen\b/i.test(dutch)) return true;
  if (word.article === "het" && new RegExp(`\\bde\\s+${word.dutch}\\b`, "i").test(dutch)) return true;
  if (word.article === "de" && new RegExp(`\\bhet\\s+${word.dutch}\\b`, "i").test(dutch)) return true;
  return false;
};

const editableBaseExampleFor = (word: WordItem): EditableExampleSentence => ({
  id: `${word.id}-base-example`,
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

const generatedEditableExamplesFor = (word: WordItem): EditableExampleSentence[] =>
  generateExamplesForWord(word)
    .filter((example) => !example.needsHumanReview && !(example.qualityIssues?.length) && example.confidence !== "low")
    .filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim())
    .filter((example) => !isBadLearnerExample(word, {
      id: example.id,
      dutch: example.dutch,
      meaning: { zh: example.meaningZh, en: example.meaningEn },
      level: example.level,
      type: example.type,
      targetWord: example.targetWord,
      grammarFocus: example.grammarFocus ?? "",
      scenarioTags: example.scenarioTags,
      audioText: example.audioText,
      qualityStatus: "usable",
    }))
    .map((example) => ({
      id: example.id,
      dutch: example.dutch,
      meaning: { zh: example.meaningZh, en: example.meaningEn },
      level: example.level,
      type: example.type,
      targetWord: example.targetWord,
      grammarFocus: example.grammarFocus ?? "",
      scenarioTags: example.scenarioTags,
      audioText: example.audioText,
      qualityStatus: "usable",
    }));

const isUsableGeneratedExampleForWord = (word: WordItem, example: GeneratedExample) =>
  !example.needsHumanReview &&
  !(example.qualityIssues?.length) &&
  example.confidence !== "low" &&
  !isBadLearnerExample(word, {
    id: example.id,
    dutch: example.dutch,
    meaning: { zh: example.meaningZh, en: example.meaningEn },
    level: example.level,
    type: example.type,
    targetWord: example.targetWord,
    grammarFocus: example.grammarFocus ?? "",
    scenarioTags: example.scenarioTags,
    audioText: example.audioText,
    qualityStatus: "usable",
  });

const fillExampleMeaningFromGenerated = (word: WordItem, example: EditableExampleSentence): EditableExampleSentence => {
  if (example.meaning.zh.trim() && example.meaning.en.trim()) return example;
  const normalizedDutch = example.dutch.trim().toLowerCase().replace(/[.!?]+$/, "");
  const generated = generatedEditableExamplesFor(word).find(
    (item) => item.dutch.trim().toLowerCase().replace(/[.!?]+$/, "") === normalizedDutch,
  );
  if (!generated) return example;
  return {
    ...example,
    meaning: {
      zh: example.meaning.zh.trim() || generated.meaning.zh,
      en: example.meaning.en.trim() || generated.meaning.en,
    },
    qualityStatus: "usable",
  };
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const trimLearnerMeaning = (value: string) => value.trim().replace(/[。.!?]+$/g, "");

const isArticleOnlyPhraseForWord = (word: WordItem, phrase: string) =>
  Boolean(word.article) && new RegExp(`^(de|het|een)\\s+${escapeRegExp(word.dutch)}$`, "i").test(phrase.trim());

const isBareTargetPhraseForWord = (word: WordItem, phrase: string) => {
  if (inferWordType(word) === "phrase") return false;
  const normalizedPhrase = phrase.trim().toLowerCase();
  const forms = [word.dutch, word.plural ?? ""].filter(Boolean).map((value) => value.toLowerCase());
  return forms.some((form) =>
    normalizedPhrase === form ||
    normalizedPhrase === `de ${form}` ||
    normalizedPhrase === `het ${form}` ||
    normalizedPhrase === `een ${form}` ||
    normalizedPhrase === `mijn ${form}` ||
    normalizedPhrase === `uw ${form}`,
  );
};

const phraseDisplayPriority = (word: WordItem, phrase: string) => {
  const normalizedPhrase = phrase.trim().toLowerCase();
  if (isBareTargetPhraseForWord(word, normalizedPhrase)) return 8;
  if (/^(een )?vraag over\b/i.test(normalizedPhrase)) return 6;
  if (/^(de|het|een|mijn|uw)\s+\S+$/i.test(normalizedPhrase)) return 5;
  if (/\b(maken|betalen|lezen|krijgen|gaan|komen|oefenen|inleveren|aanvragen|doorgeven|invullen|ondertekenen|verplaatsen|gebruiken|controleren|bellen|sturen|halen|nemen|zetten|staan|zijn|hebben|worden|doen|vragen)\b/i.test(normalizedPhrase)) return 0;
  if (/\b(op|in|naar|bij|met|voor|over|van)\b/i.test(normalizedPhrase)) return 1;
  return 3;
};

const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const displayPhraseFromGeneratedExample = (word: WordItem, phrase: string, example: GeneratedExample) => {
  const trimmedPhrase = phrase.trim();
  if (!isArticleOnlyPhraseForWord(word, trimmedPhrase)) return trimmedPhrase;

  const sentence = example.dutch.trim().replace(/[.!?]+$/g, "");
  const articlePhrase = articlePhraseFor(word);
  const target = escapeRegExp(articlePhrase);
  const patterns: Array<[RegExp, string]> = [
    [new RegExp(`^Ik heb een vraag over ${target}$`, "i"), `een vraag over ${articlePhrase}`],
    [new RegExp(`^Ik bespreek ${target} met de huisarts$`, "i"), `${articlePhrase} bespreken`],
    [new RegExp(`^Ik bespreek ${target} op het werk$`, "i"), `${articlePhrase} bespreken`],
    [new RegExp(`^Ik vraag naar ${target}$`, "i"), `naar ${articlePhrase} vragen`],
    [new RegExp(`^Ik ga naar ${target}$`, "i"), `naar ${articlePhrase} gaan`],
    [new RegExp(`^Ik moet ${target} betalen$`, "i"), `${articlePhrase} betalen`],
  ];
  const directMatch = patterns.find(([pattern]) => pattern.test(sentence));
  if (directMatch) return directMatch[1];

  const stateMatch = sentence.match(new RegExp(`^${target}\\s+(is|duurt|werkt|staat|begint|komt|vertrekt|stopt|heet|speelt)\\b(.+)?$`, "i"));
  if (stateMatch) return lowerFirst(sentence);

  return trimmedPhrase;
};

const phraseMeaningFromExample = (word: WordItem, phrase: string, example?: GeneratedExample): LocalizedText => {
  const configured = phraseChunkMeaningFor(phrase);
  if (configured?.zh.trim() && configured.en.trim()) return configured;

  const normalizedPhrase = phrase.trim().toLowerCase();
  const normalizedWord = word.dutch.trim().toLowerCase();
  if (normalizedPhrase === normalizedWord && word.meaning.zh.trim() && word.meaning.en.trim()) {
    return word.meaning;
  }

  if (example?.meaningZh.trim() && example.meaningEn.trim()) {
    return {
      zh: trimLearnerMeaning(example.meaningZh),
      en: trimLearnerMeaning(example.meaningEn),
    };
  }

  return {
    zh: `${word.meaning.zh || word.dutch} 的常用短语`,
    en: `common phrase with ${word.meaning.en || word.dutch}`,
  };
};

const generatedPrimaryExampleFor = (word: WordItem) => {
  const [example] = generatedEditableExamplesFor(word);
  return example ? { dutch: example.dutch, meaning: example.meaning } : undefined;
};

const emptyExampleFor = (word: WordItem): WordItem["exampleSentence"] => ({
  dutch: "",
  meaning: { zh: "", en: "" },
});

const safeExampleFor = (word: WordItem, override?: WordContentOverride) => {
  const merged = exampleFromOverride(override, word);
  if (merged) return merged;
  const generated = generatedPrimaryExampleFor(word);
  if (generated) return generated;
  const baseExample = editableBaseExampleFor(word);
  return isBadLearnerExample(word, baseExample) ? emptyExampleFor(word) : word.exampleSentence;
};

const exampleFromOverride = (override?: WordContentOverride, base?: WordItem) => {
  const usable =
    override?.exampleSentences?.find((example) => example.qualityStatus === "usable" && (!base || !isBadLearnerExample(base, example))) ??
    override?.exampleSentences?.find((example) => !base || !isBadLearnerExample(base, example));
  if (usable) return { dutch: usable.dutch, meaning: usable.meaning };
  if (!base) return undefined;
  const generated = generatedPrimaryExampleFor(base);
  if (generated) return generated;
  const baseExample = editableBaseExampleFor(base);
  return isBadLearnerExample(base, baseExample) ? undefined : base.exampleSentence;
};

const phraseDetailsFor = (word: WordItem, override?: WordContentOverride): EditablePhraseChunk[] => {
  const overridePhrases = override?.phraseChunks?.filter(isUsablePhraseDetail);
  if (inferWordType(word) === "number") return [];

  const generatedPhrases = generateExamplesForWord(word)
    .filter((example) => example.phraseChunkUsed?.trim())
    .filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim())
    .filter((example) => isUsableGeneratedExampleForWord(word, example))
    .map((example, index) => {
      const phrase = displayPhraseFromGeneratedExample(word, example.phraseChunkUsed ?? "", example);
      return {
        id: `${word.id}-generated-phrase-${index + 1}`,
        dutch: phrase,
        meaning: phraseMeaningFromExample(word, phrase, example),
        usageScene: {
          zh: example.scenarioTags.join(", ") || word.theme,
          en: example.scenarioTags.join(", ") || word.theme,
        },
        audioText: phrase,
      };
    })
    .filter(isUsablePhraseDetail)
    .sort((a, b) => phraseDisplayPriority(word, a.dutch) - phraseDisplayPriority(word, b.dutch));
  const weakArticleOnlyOverride = Boolean(
    overridePhrases?.length &&
    overridePhrases.every((phrase) => new RegExp(`^(de|het|een)\\s+${word.dutch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i").test(phrase.dutch.trim())),
  );
  if (overridePhrases?.length && !weakArticleOnlyOverride) return overridePhrases;
  if (generatedPhrases.length) return generatedPhrases;

  return [];
};

const exampleDetailsFor = (word: WordItem, override?: WordContentOverride): EditableExampleSentence[] => {
  const overrideExamples = override?.exampleSentences
    ?.map((example) => fillExampleMeaningFromGenerated(word, example))
    .filter((example) => !isBadLearnerExample(word, example));
  if (overrideExamples?.length) return overrideExamples;
  const generatedExamples = generatedEditableExamplesFor(word);
  if (generatedExamples.length) return generatedExamples;
  if (inferWordType(word) === "number") return [];
  const baseExample = editableBaseExampleFor(word);
  return isBadLearnerExample(word, baseExample) ? [] : [baseExample];
};

const memoryPhraseChunksFromDetails = (phrases: EditablePhraseChunk[]): MemoryPath["phraseChunks"] =>
  phrases
    .filter(isUsablePhraseDetail)
    .slice(0, 4)
    .map((phrase) => ({
      dutch: phrase.dutch,
      meaningZh: phrase.meaning.zh,
      meaningEn: phrase.meaning.en,
    }));

const generatedMemoryPhraseChunksFor = (word: WordItem): MemoryPath["phraseChunks"] => {
  const seen = new Set<string>();
  return generateExamplesForWord(word)
    .filter((example) => example.phraseChunkUsed?.trim())
    .filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim())
    .filter((example) => isUsableGeneratedExampleForWord(word, example))
    .filter((example) => {
      const chunk = displayPhraseFromGeneratedExample(word, example.phraseChunkUsed ?? "", example);
      const key = chunk.toLowerCase();
      if (!isUsablePhraseText(chunk) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((example) => {
      const chunk = displayPhraseFromGeneratedExample(word, example.phraseChunkUsed ?? "", example);
      const meaning = phraseMeaningFromExample(word, chunk, example);
      return { dutch: chunk, meaningZh: meaning.zh, meaningEn: meaning.en };
    })
    .sort((a, b) => phraseDisplayPriority(word, a.dutch) - phraseDisplayPriority(word, b.dutch))
    .slice(0, 4);
};

const memoryOutputSentencesFromExamples = (word: WordItem, examples: EditableExampleSentence[]): MemoryPath["outputSentences"] =>
  examples
    .filter((example) => example.qualityStatus !== "reject" && !isBadLearnerExample(word, example))
    .slice(0, 3)
    .map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaning.zh,
      meaningEn: example.meaning.en,
    }));

const standaloneOutputWords = new Set(["hallo", "dag", "ja", "nee", "sorry", "bedankt", "alsjeblieft", "dank je", "tot ziens"]);

const containsDutchToken = (sentence: string, token: string) =>
  new RegExp(`(^|\\W)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(sentence);

const phraseStopTokens = new Set(["de", "het", "een"]);
const dutchTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;
const phraseCoreTokens = (value: string) =>
  Array.from(value.toLowerCase().matchAll(dutchTokenPattern), (match) => match[0])
    .filter((token) => !phraseStopTokens.has(token));

const sentenceContainsPhraseUse = (word: WordItem, sentence: string) => {
  if (containsDutchToken(sentence, word.dutch)) return true;
  const tokens = phraseCoreTokens(word.dutch);
  return tokens.length > 0 && tokens.every((token) => containsDutchToken(sentence, token));
};

const adjectiveEForm = (adjective: string) => {
  const irregular: Record<string, string> = { groot: "grote", oud: "oude", nieuw: "nieuwe", duur: "dure", goedkoop: "goedkope" };
  return irregular[adjective.toLowerCase()] ?? `${adjective}e`;
};

const outputTargetExemptTypes = new Set(["number", "function-word", "language-name", "country-name", "day-month"]);

const sentenceContainsTargetUse = (word: WordItem, sentence: string) => {
  const type = inferWordType(word);
  const lowerWord = word.dutch.toLowerCase();
  if (type === "phrase") return sentenceContainsPhraseUse(word, sentence);
  if (outputTargetExemptTypes.has(type) || safeStandaloneWords.has(lowerWord)) return true;

  if (type === "verb") {
    const forms = verbFormsForWord(word);
    if (!forms) return containsDutchToken(sentence, word.dutch);
    return [forms.infinitive, forms.ik, forms.jij, forms.hij, forms.wij].some((token) => containsDutchToken(sentence, token));
  }

  if (type === "adjective") {
    return [word.dutch, adjectiveEForm(word.dutch)].some((token) => containsDutchToken(sentence, token));
  }

  return [word.dutch, word.plural ?? ""].filter(Boolean).some((token) => containsDutchToken(sentence, token));
};

const isBadMemoryOutputSentence = (word: WordItem, sentence: MemoryPath["outputSentences"][number]) => {
  const dutch = sentence.dutch.trim();
  const zh = sentence.meaningZh.trim();
  const en = sentence.meaningEn.trim();
  const normalizedDutch = dutch.replace(/[.!?]+$/g, "").toLowerCase();
  const normalizedWord = word.dutch.toLowerCase();
  const combinedMeaning = `${zh} ${en}`;

  if (!dutch || !zh || !en) return true;
  if (looksLikeAnalyticGloss(`${zh} ${en}`)) return true;
  if (learnerInternalCopyPattern.test(`${dutch} ${combinedMeaning}`)) return true;
  if (!sentenceContainsTargetUse(word, dutch)) return true;
  if (isKnownBadLearnerLine(dutch)) return true;
  if (isBadGenericTargetTemplate(word, dutch)) return true;
  if (normalizedDutch === normalizedWord && inferWordType(word) !== "phrase" && !standaloneOutputWords.has(normalizedWord)) return true;
  if (word.article && !containsDutchToken(dutch, word.dutch) && !(word.plural && containsDutchToken(dutch, word.plural))) return true;
  if (/^Ik\s+(werken|zijn|hebben|kunnen|willen|moeten|gaan|komen|wonen|leren|kijken|helpen|begrijpen)\b/i.test(dutch)) return true;
  if (word.dutch.toLowerCase() === "engels" && /\bengelsen\b/i.test(dutch)) return true;
  return false;
};

const effectiveMemoryPathFor = (
  word: WordItem,
  phraseChunkDetails: EditablePhraseChunk[],
  exampleSentences: EditableExampleSentence[],
  overrideMemoryPath?: MemoryPath,
): MemoryPath => {
  const lowerWord = word.dutch.toLowerCase();
  const generatedPath = memoryPathFor(word);
  const badOverrideMemoryPath =
    overrideMemoryPath &&
    (
      forceGeneratedMemoryPathWords.has(lowerWord) ||
      generatedPath.wordType === "number" ||
      (safeStandaloneWords.has(lowerWord) && (overrideMemoryPath.wordType === "day-month" || overrideMemoryPath.strategy === "category-rule")) ||
      shouldUseGeneratedMemoryPath(overrideMemoryPath, generatedPath) ||
      overrideMemoryPath.outputSentences.some((sentence) => /^Dit is\s+\w+\.?$/i.test(sentence.dutch)) ||
      learnerInternalCopyPattern.test(`${overrideMemoryPath.explanationZh} ${overrideMemoryPath.memoryHookZh}`) ||
      hasStaleMemoryPathContent(overrideMemoryPath)
    );
  const basePath = badOverrideMemoryPath ? generatedPath : overrideMemoryPath ?? generatedPath;
  if (basePath.wordType === "number") return basePath;

  const phraseChunksFromDetails = memoryPhraseChunksFromDetails(phraseChunkDetails).filter((chunk) => isTargetedMemoryPhraseChunk(word, chunk));
  const generatedPhraseChunks = generatedMemoryPhraseChunksFor(word).filter((chunk) => isTargetedMemoryPhraseChunk(word, chunk));
  const usableBasePhraseChunks = basePath.phraseChunks.filter((chunk) => isTargetedMemoryPhraseChunk(word, chunk));
  const usableBaseOutputSentences = basePath.outputSentences.filter((sentence) => !isBadMemoryOutputSentence(word, sentence));
  const outputSentencesFromExamples = memoryOutputSentencesFromExamples(word, exampleSentences);
  const hasOverridePhraseChunks = !badOverrideMemoryPath && Boolean(overrideMemoryPath?.phraseChunks.some((chunk) => isTargetedMemoryPhraseChunk(word, chunk)));
  const hasOverrideOutputSentences = !badOverrideMemoryPath && Boolean(overrideMemoryPath?.outputSentences.some((sentence) => !isBadMemoryOutputSentence(word, sentence)));

  const phraseChunks = hasOverridePhraseChunks
    ? overrideMemoryPath!.phraseChunks.filter((chunk) => isTargetedMemoryPhraseChunk(word, chunk))
    : phraseChunksFromDetails.length
      ? phraseChunksFromDetails
      : generatedPhraseChunks.length
        ? generatedPhraseChunks
        : usableBasePhraseChunks;
  const outputSentences = hasOverrideOutputSentences
    ? overrideMemoryPath!.outputSentences.filter((sentence) => !isBadMemoryOutputSentence(word, sentence))
    : outputSentencesFromExamples.length
      ? outputSentencesFromExamples
      : usableBaseOutputSentences;
  const nextPath = { ...basePath, phraseChunks, outputSentences };

  return {
    ...nextPath,
    warnings: validateMemoryPath({ ...nextPath, warnings: [] }),
  };
};

export const getBaseWords = () => baseWords;

const knownPluralCorrections: Record<string, string> = {
  app: "apps",
  "digid-app": "DigiD-apps",
  email: "emails",
  "e-mail": "e-mails",
  "e-mailadres": "e-mailadressen",
  bevestigingsmail: "bevestigingsmails",
  voicemail: "voicemails",
  "sms-controle": "sms-controles",
  account: "accounts",
  website: "websites",
  laptop: "laptops",
  centrum: "centra",
  restaurant: "restaurants",
  café: "cafés",
  museum: "musea",
  moeder: "moeders",
  vader: "vaders",
  broer: "broers",
  zus: "zussen",
  zoon: "zonen",
  dochter: "dochters",
  ouders: "ouders",
  man: "mannen",
  vrouw: "vrouwen",
  mens: "mensen",
  vloer: "vloeren",
  vriend: "vrienden",
  vriendin: "vriendinnen",
  persoon: "personen",
  student: "studenten",
  partner: "partners",
  opa: "opa's",
  oma: "oma's",
  baby: "baby's",
  jongen: "jongens",
  meisje: "meisjes",
  buurman: "buurmannen",
  buurvrouw: "buurvrouwen",
  familie: "families",
  gezin: "gezinnen",
  ijs: "ijsjes",
  bril: "brillen",
  kaas: "kazen",
  prijs: "prijzen",
  huurprijs: "huurprijzen",
  wc: "wc's",
  gram: "grammen",
  bewijs: "bewijzen",
  vervoerbewijs: "vervoerbewijzen",
  garantiebewijs: "garantiebewijzen",
  rijbewijs: "rijbewijzen",
  identiteitsbewijs: "identiteitsbewijzen",
  naam: "namen",
  vraag: "vragen",
  raam: "ramen",
  probleem: "problemen",
  systeem: "systemen",
  telefoon: "telefoons",
  station: "stations",
  formulier: "formulieren",
  adres: "adressen",
  document: "documenten",
  moment: "momenten",
  contract: "contracten",
  arm: "armen",
  been: "benen",
  hoofd: "hoofden",
  buik: "buiken",
  hand: "handen",
  voet: "voeten",
  rug: "ruggen",
  keel: "kelen",
  oor: "oren",
  neus: "neuzen",
  mond: "monden",
  tand: "tanden",
};

const knownMeaningCorrections: Record<string, LocalizedText> = {
  hand: { zh: "手", en: "hand" },
  voet: { zh: "脚", en: "foot" },
  arm: { zh: "手臂", en: "arm" },
  been: { zh: "腿", en: "leg" },
  rug: { zh: "背", en: "back" },
  keel: { zh: "喉咙", en: "throat" },
  hoofd: { zh: "头", en: "head" },
  buik: { zh: "肚子", en: "belly / stomach" },
  ziek: { zh: "生病的", en: "sick" },
  beter: { zh: "更好的/好转的", en: "better" },
  pijn: { zh: "疼痛", en: "pain" },
  dokter: { zh: "医生", en: "doctor" },
  huisarts: { zh: "家庭医生", en: "GP" },
  tandarts: { zh: "牙医", en: "dentist" },
  apotheek: { zh: "药房", en: "pharmacy" },
  hoesten: { zh: "咳嗽", en: "to cough" },
  medicijn: { zh: "药", en: "medicine" },
  salaris: { zh: "工资", en: "salary" },
  loonstrook: { zh: "工资单", en: "payslip" },
  proeftijd: { zh: "试用期", en: "probation period" },
  afwezigheid: { zh: "缺勤", en: "absence" },
  waterrekening: { zh: "水费账单", en: "water bill" },
  herinnering: { zh: "提醒/催缴信", en: "reminder" },
  herstel: { zh: "恢复/修复", en: "recovery / repair" },
  verlof: { zh: "请假/休假", en: "leave" },
  uitzendbureau: { zh: "派遣公司", en: "employment agency" },
};

const normalizeEffectiveWord = (word: WordItem): WordItem => ({
  ...word,
  meaning: isGeneratedPlaceholderMeaning(word.meaning) && knownMeaningCorrections[word.dutch.toLowerCase()]
    ? knownMeaningCorrections[word.dutch.toLowerCase()]
    : word.meaning,
  plural: knownPluralCorrections[word.dutch.toLowerCase()] ?? word.plural,
});

const generatedMeaningPattern = /词：|word:|自动扩充|generated expansion|需要人工|placeholder|简单健康词|身体症状词|药房词|办事词|行政词|工作词/i;
const isGeneratedPlaceholderMeaning = (meaning?: LocalizedText) =>
  Boolean(meaning && generatedMeaningPattern.test(`${meaning.zh} ${meaning.en}`));

const weakMemoryLinkReasonPattern =
  /内容后台设置|creator-set|适合放在同一个记忆泡泡|belongs in the same memory bubble|请补充|add why|和当前词一起记|learn with the current word|同等级|同一天|same level|same day|同一个实用场景|useful neighbors|相关词|可以一起记|适合一起记|礼貌表达词组|按对话来回一起记|看病场景词组|按症状、医生、药房一起记/i;

const isContrastMemoryReason = (reason: string) =>
  /区别|不要混|容易混|不同|不是|confus|different|not the same|noun|verb|名词|动词/i.test(reason);

const isUsableMemoryLinkOverride = (word: WordItem, link: MemoryLink) => {
  const dutch = link.dutch.trim();
  const reason = `${link.explanation?.zh ?? ""} ${link.explanation?.en ?? ""}`.trim();
  if (!dutch || !reason || weakMemoryLinkReasonPattern.test(reason)) return false;
  if (/^(looks like|means|close to|same as|related to)\b/i.test(dutch) || /[.!?]$/.test(dutch) || dutch.split(/\s+/).length > 3) return false;
  if ((link.type === "article-family" || link.type === "plural-family") && (!word.article || /\s/.test(word.dutch))) return false;
  if ((link.type === "confusion-pair" || link.type === "similar") && !isContrastMemoryReason(reason)) return false;
  return true;
};

const forceGeneratedMemoryPathWords = new Set([
  "kaart",
  "meisje",
  "naamkaartje",
  "prijskaartje",
  "kaartje",
  "bonnetje",
  "vriend",
  "vriendin",
  "uit",
]);

const isBadMemoryPathOverride = (word: WordItem, memoryPath: MemoryPath) => {
  const generatedPath = memoryPathFor(word);
  return memoryPath.wordType !== generatedPath.wordType ||
  shouldUseGeneratedMemoryPath(memoryPath, generatedPath) ||
  memoryPath.outputSentences.some((sentence) => isBadMemoryOutputSentence(word, sentence)) ||
  memoryPath.phraseChunks.some((chunk) => !isTargetedMemoryPhraseChunk(word, chunk)) ||
  learnerInternalCopyPattern.test(`${memoryPath.explanationZh} ${memoryPath.explanationEn} ${memoryPath.memoryHookZh} ${memoryPath.memoryHookEn}`) ||
  hasStaleMemoryPathContent(memoryPath);
};

const sanitizeWordOverride = (override: WordContentOverride): WordContentOverride | undefined => {
  const base = baseWords.find((word) => word.id === override.id || word.dutch === override.id || word.dutch === override.dutch);
  if (!base) return override;
  const next: WordContentOverride = { ...override, id: base.id };

  if (next.plural && knownPluralCorrections[base.dutch.toLowerCase()]) {
    next.plural = knownPluralCorrections[base.dutch.toLowerCase()];
  }

  if (isGeneratedPlaceholderMeaning(next.meaning)) {
    delete next.meaning;
  }

  if (next.phraseChunks) {
    const cleanPhrases = next.phraseChunks.filter(isUsablePhraseDetail);
    if (cleanPhrases.length) next.phraseChunks = cleanPhrases;
    else delete next.phraseChunks;
  }

  if (next.exampleSentences) {
    const cleanExamples = next.exampleSentences.filter((example) => !isBadLearnerExample(base, example));
    if (cleanExamples.length) next.exampleSentences = cleanExamples;
    else delete next.exampleSentences;
  }

  if (next.memoryLinks) {
    const cleanLinks = next.memoryLinks.filter((link) => isUsableMemoryLinkOverride(base, link));
    if (cleanLinks.length) next.memoryLinks = cleanLinks;
    else delete next.memoryLinks;
  }

  if (next.memoryPath && isBadMemoryPathOverride(base, next.memoryPath)) {
    delete next.memoryPath;
  }

  return isMeaningfulWordOverride(next) ? next : undefined;
};

export const getCreatorWordOverrides = () => {
  migrateLegacyWords();
  const overrides = readRecord<WordContentOverride>(WORD_OVERRIDES_KEY);
  const sanitized = Object.values(overrides).reduce<Record<string, WordContentOverride>>((record, override) => {
    const clean = sanitizeWordOverride(override);
    if (clean) record[clean.id] = clean;
    return record;
  }, {});
  if (hasLocalStorage() && !sameJson(sanitized, overrides)) {
    writeRecord(WORD_OVERRIDES_KEY, sanitized);
  }
  return sanitized;
};

export const saveCreatorWordOverride = (wordId: string, patch: WordContentOverride) => {
  const overrides = getCreatorWordOverrides();
  const id = patch.id || wordId;
  const next = { ...overrides, [id]: { ...overrides[id], ...patch, id } };
  writeRecord(WORD_OVERRIDES_KEY, next);
  return next[id];
};

const effectiveWordFromBase = (baseWord: WordItem, override?: WordContentOverride): WordItem => {
  if (!override) return normalizeEffectiveWord({ ...baseWord, exampleSentence: safeExampleFor(baseWord) });
  const exampleSentence = safeExampleFor(baseWord, override);
  return normalizeEffectiveWord({
    ...baseWord,
    ...override,
    id: baseWord.id,
    phraseChunks: phraseStringsFromOverride(override, baseWord),
    exampleSentence,
  });
};

export const getEffectiveWords = (): WordItem[] => {
  const overrides = getCreatorWordOverrides();
  return baseWords.map((baseWord) => effectiveWordFromBase(baseWord, overrides[baseWord.id] ?? overrides[baseWord.dutch]));
};

export const getEffectiveWordById = (wordId: string) =>
  getEffectiveWords().find((word) => word.id === wordId || word.dutch === wordId);

export const getEffectiveWordBubble = (wordId: string): EffectiveWordBubble | undefined => {
  const overrides = getCreatorWordOverrides();
  const baseWord = baseWords.find((word) => word.id === wordId || word.dutch === wordId);
  if (!baseWord) return undefined;
  const override = overrides[baseWord.id] ?? overrides[baseWord.dutch];
  const effectiveWord = effectiveWordFromBase(baseWord, override);
  const lastUpdated = hasLocalStorage() ? window.localStorage.getItem(LAST_UPDATED_KEY) ?? undefined : undefined;
  const phraseChunkDetails = phraseDetailsFor(effectiveWord, override);
  const exampleSentences = exampleDetailsFor(effectiveWord, override);
  return {
    ...effectiveWord,
    phraseChunkDetails,
    exampleSentences,
    memoryPath: effectiveMemoryPathFor(effectiveWord, phraseChunkDetails, exampleSentences, override?.memoryPath),
    englishExplanation: override?.englishExplanation,
    pronunciationHint: override?.pronunciationHint,
    articleReason: override?.articleReason,
    commonMistake: override?.commonMistake,
    dataSource: override ? "merged" : "base",
    lastUpdated,
  };
};

export const getBaseDayPacks = () => baseDayPacks;

export const getCreatorDayPackOverrides = () => {
  ensureDayPackOverrideVersion();
  migrateLegacyPacks();
  const overrides = readRecord<DayPackContentOverride>(DAY_PACK_OVERRIDES_KEY);
  const compacted = compactRecord(overrides, isMeaningfulPackOverride);
  if (hasLocalStorage() && Object.keys(compacted).length !== Object.keys(overrides).length) {
    writeRecord(DAY_PACK_OVERRIDES_KEY, compacted);
  }
  return compacted;
};

export const saveCreatorDayPackOverride = (packId: string, patch: DayPackContentOverride) => {
  ensureDayPackOverrideVersion();
  const overrides = getCreatorDayPackOverrides();
  const id = patch.id || packId;
  const next = { ...overrides, [id]: { ...overrides[id], ...patch, id } };
  writeRecord(DAY_PACK_OVERRIDES_KEY, next);
  if (hasLocalStorage()) window.localStorage.setItem(DAY_PACK_OVERRIDE_VERSION_KEY, DAY_PACK_OVERRIDE_VERSION);
  return next[id];
};

const wordForDailyEntry = (entry: { wordId?: string; dutch?: string }, words: WordItem[]) => {
  const normalized = entry.dutch?.toLowerCase();
  const infinitive = entry.dutch ? infinitiveForWord(entry.dutch) : undefined;
  return words.find((item) =>
    item.id === entry.wordId ||
    item.dutch === entry.dutch ||
    Boolean(infinitive && item.dutch.toLowerCase() === infinitive) ||
    Boolean(normalized && item.dutch.toLowerCase() === normalized),
  );
};

const hydrateDailyItem = (entry: DailyWordItem, words: WordItem[]): DailyWordItem => {
  const word = wordForDailyEntry(entry, words);
  if (!word) return entry;
  return {
    ...entry,
    dutch: word.dutch,
    article: word.article,
    plural: word.plural,
    meaning: word.meaning,
    originalLevel: word.originalLevel,
    memoryHook: word.memoryHook,
    phraseChunks: word.phraseChunks,
    exampleSentence: word.exampleSentence,
    audioText: word.audioText,
    audioSrc: word.audioSrc,
  };
};

const dailyItemFromPackWord = (entry: DayPackWordOverride, pack: DailyWordPack, words: WordItem[]): DailyWordItem | undefined => {
  const word = wordForDailyEntry(entry, words);
  if (!word) return undefined;
  return {
    wordId: word.id,
    dutch: word.dutch,
    article: word.article,
    plural: word.plural,
    meaning: word.meaning,
    learningRole: entry.role,
    originalLevel: word.originalLevel,
    currentPackLevel: pack.level,
    memoryHook: word.memoryHook,
    phraseChunks: word.phraseChunks,
    exampleSentence: word.exampleSentence,
    audioText: word.audioText,
    audioSrc: word.audioSrc,
  };
};

const mergePack = (basePack: DailyWordPack, override: DayPackContentOverride | undefined, words: WordItem[]): DailyWordPack => {
  const hydratedBase = {
    ...basePack,
    newWords: basePack.newWords.map((word) => hydrateDailyItem(word, words)),
    reviewWords: basePack.reviewWords.map((word) => hydrateDailyItem(word, words)),
    recognitionWords: basePack.recognitionWords.map((word) => hydrateDailyItem(word, words)),
  };
  if (!override) return hydratedBase;

  const merged = { ...hydratedBase, ...override, id: basePack.id } as DailyWordPack;
  if (override.words) {
    const items = override.words
      .map((entry) => dailyItemFromPackWord(entry, merged, words))
      .filter(Boolean) as DailyWordItem[];
    merged.newWords = items.filter((item) => item.learningRole === "new");
    merged.reviewWords = items.filter((item) => item.learningRole === "review");
    merged.recognitionWords = items.filter((item) => item.learningRole === "recognition");
  }
  return merged;
};

export const getEffectiveDayPacks = () => {
  const words = getEffectiveWords();
  const overrides = getCreatorDayPackOverrides();
  return baseDayPacks.map((pack) => mergePack(pack, overrides[pack.id], words));
};

export const getEffectiveDayPackById = (packId: string) =>
  getEffectiveDayPacks().find((pack) => pack.id === packId);

export const getBaseCourseLessons = () => baseCourseLessons;

export const getCreatorCourseLessonOverrides = () => {
  const overrides = readRecord<CourseLessonContentOverride>(COURSE_LESSON_OVERRIDES_KEY);
  const compacted = compactRecord(overrides, isMeaningfulCourseLessonOverride);
  if (hasLocalStorage() && Object.keys(compacted).length !== Object.keys(overrides).length) {
    writeRecord(COURSE_LESSON_OVERRIDES_KEY, compacted);
  }
  return compacted;
};

export const saveCreatorCourseLessonOverride = (lessonId: string, patch: CourseLessonContentOverride) => {
  const overrides = getCreatorCourseLessonOverrides();
  const id = patch.id || lessonId;
  const next = { ...overrides, [id]: { ...overrides[id], ...patch, id } };
  writeRecord(COURSE_LESSON_OVERRIDES_KEY, compactRecord(next, isMeaningfulCourseLessonOverride));
  return next[id];
};

export const getEffectiveCourseLessons = () => {
  const overrides = getCreatorCourseLessonOverrides();
  const merged = baseCourseLessons.map((lesson) => mergeCourseLesson(lesson, overrides[lesson.id]));
  return merged.map((lesson, index, lessons) => ({
    ...lesson,
    previousLessonId: lesson.previousLessonId ?? lessons[index - 1]?.id,
    nextLessonId: lesson.nextLessonId ?? lessons[index + 1]?.id,
  }));
};

export const getEffectiveCourseLessonById = (lessonId: string) =>
  getEffectiveCourseLessons().find((lesson) => lesson.id === lessonId);

export const creatorContentStats = () => {
  const wordOverrides = getCreatorWordOverrides();
  const dayPackOverrides = getCreatorDayPackOverrides();
  const courseLessonOverrides = getCreatorCourseLessonOverrides();
  const lastUpdated = hasLocalStorage() ? window.localStorage.getItem(LAST_UPDATED_KEY) : null;
  return {
    wordOverrideCount: Object.keys(wordOverrides).length,
    dayPackOverrideCount: Object.keys(dayPackOverrides).length,
    courseLessonOverrideCount: Object.keys(courseLessonOverrides).length,
    lastUpdated,
  };
};

export const clearCreatorOverrides = () => {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(WORD_OVERRIDES_KEY);
  window.localStorage.removeItem(DAY_PACK_OVERRIDES_KEY);
  window.localStorage.removeItem(DAY_PACK_OVERRIDE_VERSION_KEY);
  window.localStorage.removeItem(COURSE_LESSON_OVERRIDES_KEY);
  window.localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
};

export const exportCreatorContent = (): CreatorContentExport => {
  const wordOverrides = getCreatorWordOverrides();
  const dayPackOverrides = getCreatorDayPackOverrides();
  const courseLessonOverrides = getCreatorCourseLessonOverrides();
  const lastUpdated = hasLocalStorage() ? window.localStorage.getItem(LAST_UPDATED_KEY) : null;
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: "nedpop",
    localStorageKeys: {
      wordOverrides: WORD_OVERRIDES_KEY,
      dayPackOverrides: DAY_PACK_OVERRIDES_KEY,
      courseLessonOverrides: COURSE_LESSON_OVERRIDES_KEY,
      lastUpdated: LAST_UPDATED_KEY,
    },
    wordOverrides,
    dayPackOverrides,
    courseLessonOverrides,
    lastUpdated,
  };
};

export const importCreatorContent = (payload: unknown) => {
  if (!hasLocalStorage()) return { ok: false, message: "Browser storage is unavailable." };
  const data = payload as Partial<CreatorContentExport>;
  if (data.app !== "nedpop" || data.schemaVersion !== 1) {
    return { ok: false, message: "This file is not a compatible NedPop content export." };
  }
  const wordOverrides = data.wordOverrides ?? {};
  const dayPackOverrides = data.dayPackOverrides ?? {};
  const courseLessonOverrides = data.courseLessonOverrides ?? {};
  writeRecord(WORD_OVERRIDES_KEY, compactRecord(wordOverrides, isMeaningfulWordOverride));
  writeRecord(DAY_PACK_OVERRIDES_KEY, compactRecord(dayPackOverrides, isMeaningfulPackOverride));
  writeRecord(COURSE_LESSON_OVERRIDES_KEY, compactRecord(courseLessonOverrides, isMeaningfulCourseLessonOverride));
  window.localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
  return {
    ok: true,
    message: `Imported ${Object.keys(wordOverrides).length} word overrides, ${Object.keys(dayPackOverrides).length} day pack overrides, and ${Object.keys(courseLessonOverrides).length} lesson overrides.`,
  };
};

export const exportPublishedCreatorContentSnapshot = (): PublishedCreatorContentSnapshot => {
  const stats = creatorContentStats();
  const effectiveWords = getEffectiveWords();
  const effectiveDayPacks = getEffectiveDayPacks();
  const effectiveCourseLessons = getEffectiveCourseLessons();
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: "nedpop",
    stats: {
      effectiveWordCount: effectiveWords.length,
      effectiveDayPackCount: effectiveDayPacks.length,
      effectiveCourseLessonCount: effectiveCourseLessons.length,
      wordOverrideCount: stats.wordOverrideCount,
      dayPackOverrideCount: stats.dayPackOverrideCount,
      courseLessonOverrideCount: stats.courseLessonOverrideCount,
      lastUpdated: stats.lastUpdated,
    },
    effectiveWords,
    effectiveDayPacks,
    effectiveCourseLessons,
  };
};
