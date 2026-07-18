import type { CourseLevel, LocalizedText } from "@/types/course";
import type { DailyPackAssignment, DailyWordItem, DailyWordPack, PhraseChunk, SentencePattern, WordItem } from "@/types/vocabulary";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { infinitiveForWord, phraseChunkMeaningFor } from "@/lib/exampleTemplates";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

const levelOrder: CourseLevel[] = ["A0", "A1", "A2", "B1"];
const levelRank: Record<string, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4 };

const levelConfig: Record<
  CourseLevel,
  {
    totalDays: number;
    newPerDay: number;
    reviewPerDay: number;
    recognitionPerDay: number;
    estimatedMinutes: number;
    title: LocalizedText;
    priorityTags: string[];
  }
> = {
  A0: {
    totalDays: 20,
    newPerDay: 9,
    reviewPerDay: 2,
    recognitionPerDay: 0,
    estimatedMinutes: 18,
    title: lt("A0 生存入门", "A0 Starter"),
    priorityTags: ["greeting", "identity", "numbers", "time"],
  },
  A1: {
    totalDays: 50,
    newPerDay: 10,
    reviewPerDay: 3,
    recognitionPerDay: 0,
    estimatedMinutes: 22,
    title: lt("A1 生活基础", "A1 Foundation"),
    priorityTags: ["identity", "time", "family", "housing", "supermarket", "transport", "health", "work"],
  },
  A2: {
    totalDays: 60,
    newPerDay: 10,
    reviewPerDay: 3,
    recognitionPerDay: 2,
    estimatedMinutes: 28,
    title: lt("A2 生活任务", "A2 Practical Life Tasks"),
    priorityTags: ["health", "appointment", "gemeente", "housing", "work", "sick-leave", "transport", "bill", "insurance", "email", "form", "phone-call", "complaint"],
  },
  B1: {
    totalDays: 70,
    newPerDay: 12,
    reviewPerDay: 4,
    recognitionPerDay: 2,
    estimatedMinutes: 35,
    title: lt("B1 独立任务表达", "B1 Independent Task Dutch"),
    priorityTags: ["identity", "health", "neighborhood", "budget", "work", "education", "travel", "environment", "media", "culture", "opinion", "presentation", "reading", "writing", "digital", "tax", "benefits", "safety", "society", "complaint", "bill"],
  },
};

const blockedReviewStatuses = new Set(["too-hard", "duplicate", "not-useful"]);
const abstractA0Tags = new Set(["gemeente", "insurance", "bill", "email", "form", "phone-call", "complaint"]);

function hasPlaceholderMeaning(word: WordItem) {
  return word.meaning.zh.includes("词：") || word.meaning.en.includes(" word: ");
}

function hasUsableLearnerContent(word: WordItem) {
  if (hasPlaceholderMeaning(word)) return false;
  if (!word.exampleSentence.dutch.trim()) return false;
  if (!word.exampleSentence.meaning.zh.trim() || !word.exampleSentence.meaning.en.trim()) return false;
  return true;
}

function isLearnerVisible(word: WordItem) {
  if (blockedReviewStatuses.has(word.reviewStatus)) return false;
  if (!hasUsableLearnerContent(word)) return false;
  return true;
}

function canAppearInLevel(word: WordItem, level: CourseLevel) {
  if (!word.appearsInLevels.includes(level)) return false;
  if (level === "A0" && word.scenarioTags.some((tag) => abstractA0Tags.has(tag))) return false;
  return true;
}

function scoreWord(word: WordItem) {
  const activeScore = word.activeOrPassive === "active" ? 100 : 0;
  const examScore = word.examRelevance === "high" ? 40 : word.examRelevance === "medium" ? 20 : 0;
  const confidenceScore = word.levelConfidence === "high" ? 20 : word.levelConfidence === "medium" ? 10 : 0;
  return activeScore + examScore + confidenceScore;
}

const verbFormMeaningHints = [
  "am/is called",
  "ask",
  "buy",
  "call",
  "click",
  "close",
  "come",
  "do",
  "drink",
  "eat",
  "fill",
  "give",
  "grab",
  "help",
  "learn",
  "listen",
  "live",
  "look",
  "make",
  "open",
  "pay",
  "put",
  "read",
  "say",
  "search",
  "see",
  "sit",
  "sleep",
  "speak",
  "stand",
  "stop",
  "take",
  "walk",
  "wash",
  "work",
  "write",
];

const nounLikeVerbForms = new Set(["antwoord", "werk"]);

function dailyWordKey(word: WordItem) {
  const normalized = word.dutch.toLowerCase();
  const infinitive = infinitiveForWord(word);
  if (!infinitive || infinitive === normalized || word.article || word.dutch.includes(" ")) return normalized;
  const meaning = `${word.meaning.zh} ${word.meaning.en}`.toLowerCase();
  const looksLikeVerb =
    verbFormMeaningHints.some((hint) => meaning.includes(hint)) ||
    (!nounLikeVerbForms.has(normalized) && word.scenarioTags.some((tag) => ["routine", "classroom", "work", "supermarket", "form", "phone-call"].includes(tag)));
  return looksLikeVerb ? infinitive : normalized;
}

function uniqueByDutch(words: WordItem[]) {
  const best = new Map<string, WordItem>();
  words.forEach((word) => {
    const key = dailyWordKey(word);
    const current = best.get(key);
    const currentIsBase = current?.dutch.toLowerCase() === key;
    const wordIsBase = word.dutch.toLowerCase() === key;
    if (
      !current ||
      (wordIsBase && !currentIsBase) ||
      levelRank[word.originalLevel as CourseLevel] < levelRank[current.originalLevel as CourseLevel] ||
      scoreWord(word) > scoreWord(current)
    ) {
      best.set(key, word);
    }
  });
  return Array.from(best.values());
}

function sortForLearning(words: WordItem[], priorityTags: string[]) {
  return [...words].sort((a, b) => {
    const tagA = priorityTags.findIndex((tag) => a.scenarioTags.includes(tag));
    const tagB = priorityTags.findIndex((tag) => b.scenarioTags.includes(tag));
    const normalizedA = tagA === -1 ? 999 : tagA;
    const normalizedB = tagB === -1 ? 999 : tagB;
    if (normalizedA !== normalizedB) return normalizedA - normalizedB;
    return scoreWord(b) - scoreWord(a);
  });
}

function takeThematic(pool: WordItem[], used: Set<string>, theme: string, count: number) {
  const firstPass = pool.filter((word) => !used.has(dailyWordKey(word)) && word.scenarioTags.includes(theme));
  const fallback = pool.filter((word) => !used.has(dailyWordKey(word)) && !firstPass.includes(word));
  const picked = [...firstPass, ...fallback].slice(0, count);
  picked.forEach((word) => used.add(dailyWordKey(word)));
  return picked;
}

function takeCyclic(pool: WordItem[], start: number, count: number, excludedIds = new Set<string>()) {
  if (pool.length === 0 || count <= 0) return [];
  const picked: WordItem[] = [];
  let offset = 0;
  while (picked.length < count && offset < pool.length * 2) {
    const candidate = pool[(start + offset) % pool.length];
    if (candidate && !excludedIds.has(dailyWordKey(candidate)) && !picked.some((word) => dailyWordKey(word) === dailyWordKey(candidate))) {
      picked.push(candidate);
    }
    offset += 1;
  }
  return picked;
}

function dailyItem(word: WordItem, currentPackLevel: CourseLevel, learningRole: DailyWordItem["learningRole"]): DailyWordItem {
  return {
    wordId: word.id,
    dutch: word.dutch,
    article: word.article,
    plural: word.plural,
    meaning: word.meaning,
    learningRole,
    originalLevel: word.originalLevel,
    currentPackLevel,
    memoryHook: word.memoryHook,
    phraseChunks: word.phraseChunks,
    exampleSentence: word.exampleSentence,
    audioText: word.audioText,
    audioSrc: word.audioSrc,
  };
}

function sourceWordFor(item: DailyWordItem, words: WordItem[]) {
  return words.find((word) => word.id === item.wordId || word.dutch === item.dutch);
}

const isTrustedGeneratedExample = (example: GeneratedExample) =>
  example.dutch.trim() &&
  example.meaningZh.trim() &&
  example.meaningEn.trim() &&
  example.confidence !== "low" &&
  !example.needsHumanReview &&
  !(example.qualityIssues?.length);

function safeExamplesFor(item: DailyWordItem, allSourceWords: WordItem[]) {
  const source = sourceWordFor(item, allSourceWords);
  if (!source) return [];
  return generateExamplesForWord(source)
    .filter(isTrustedGeneratedExample)
    .filter((example) => !/^Dit is (?:de|het)\s+[a-zA-ZÀ-ÿ'’.-]+\.?$/i.test(example.dutch))
    .filter((example) => !/^Dit is (heet|ben|heb|wil|kan|dit|dat|dag)\.?$/i.test(example.dutch))
    .filter((example) => !/^Ik (ben|heb|wil|kan)\.?$/i.test(example.dutch));
}

function phraseChunksFor(level: CourseLevel, dayNumber: number, words: DailyWordItem[], allSourceWords: WordItem[]): PhraseChunk[] {
  const seen = new Set<string>();
  return words
    .flatMap((word) => safeExamplesFor(word, allSourceWords).filter((example) => example.phraseChunkUsed?.trim()))
    .filter((example) => {
      const key = example.phraseChunkUsed!.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, level === "B1" ? 7 : level === "A2" ? 6 : 4)
    .map((example, index) => {
      const dutch = example.phraseChunkUsed!;
      const meaning = phraseChunkMeaningFor(dutch) ?? lt("", "");
      return {
        id: `daily-chunk-${level.toLowerCase()}-${dayNumber}-${index + 1}`,
        level,
        dutch,
        meaning,
        usageScene: lt("和今日主题一起练。", "Practice with today's theme."),
        relatedWords: [example.targetWord],
        exampleSentence: { dutch: example.dutch, meaning: lt(example.meaningZh, example.meaningEn) },
        audioText: dutch,
      };
    });
}

function sentencePatternsFor(level: CourseLevel, dayNumber: number, words: DailyWordItem[], allSourceWords: WordItem[]): SentencePattern[] {
  const seen = new Set<string>();
  const examples = words
    .flatMap((word) => safeExamplesFor(word, allSourceWords))
    .filter((example) => {
      const key = example.dutch.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, level === "B1" ? 4 : 3)
    .map((example) => ({
      dutch: example.dutch,
      meaning: lt(example.meaningZh, example.meaningEn),
    }));
  const fallback = examples.length ? examples : [{ dutch: "Ik leer Nederlands.", meaning: lt("我学荷兰语。", "I learn Dutch.") }];
  return fallback.map((example, index) => ({
    id: `daily-pattern-${level.toLowerCase()}-${dayNumber}-${index + 1}`,
    level,
    pattern: example.dutch,
    meaning: lt("今日可输出句型。", "Today's usable sentence pattern."),
    usageScene: lt("把今日词放进句子。", "Put today's words into a sentence."),
    examples: [example],
    commonMistake: lt("不要只背词，要把词放进能说的句子。", "Do not learn isolated words; put them into usable sentences."),
  }));
}

function outputTaskFor(level: CourseLevel, theme: string, examples: string[]) {
  return {
    zh: level === "B1"
      ? `用今日新词和复习词写/说一个 ${theme} 相关的 B1 独立表达句。`
      : level === "A2"
        ? `用今日新词和复习词完成一个 ${theme} 办事情景句。`
        : `用今日新词和复习词说一句 ${theme} 相关的短句。`,
    en: level === "B1"
      ? `Use today's new and review words to write or say one B1 independent-task sentence about ${theme}.`
      : level === "A2"
        ? `Use today's new and review words to complete one practical ${theme} sentence.`
        : `Use today's new and review words to say one short ${theme} sentence.`,
    targetSentenceExamples: examples,
  };
}

function assignmentReason(role: DailyWordItem["learningRole"], word: WordItem, level: CourseLevel): LocalizedText {
  if (role === "review") {
    if (word.originalLevel === level) {
      return lt(`本阶段已学词，在 ${level} 后续日期作为复习/整合词复用。`, `Already introduced in ${level}; reused later in ${level} for review and integration.`);
    }
    return lt(`原始等级 ${word.originalLevel}，在 ${level} 作为累计复习词复用。`, `Original level ${word.originalLevel}; reused in ${level} as cumulative review.`);
  }
  if (role === "recognition") {
    return lt(`适合 ${level} 阅读/听力识别，暂不要求主动输出。`, `Useful for ${level} reading/listening recognition; not active output yet.`);
  }
  return lt(`${word.levelReason.zh}`, `${word.levelReason.en}`);
}

export function generateDailyWordPacks(words: WordItem[]) {
  const sourceWords = uniqueByDutch(words).filter(isLearnerVisible);
  const packs: DailyWordPack[] = [];
  const assignments: DailyPackAssignment[] = [];

  levelOrder.forEach((level) => {
    const config = levelConfig[level];
    const newPool = sortForLearning(
      sourceWords.filter((word) => word.originalLevel === level && word.activeOrPassive === "active" && canAppearInLevel(word, level)),
      config.priorityTags,
    );
    const reviewPool = sortForLearning(
      sourceWords.filter((word) => levelRank[word.originalLevel as CourseLevel] < levelRank[level] && word.activeOrPassive === "active" && canAppearInLevel(word, level)),
      config.priorityTags,
    );
    const recognitionPool = sortForLearning(
      sourceWords.filter((word) => word.originalLevel === level && word.activeOrPassive === "recognition" && canAppearInLevel(word, level)),
      config.priorityTags,
    );
    const usedNew = new Set<string>();
    const usedRecognition = new Set<string>();

    Array.from({ length: config.totalDays }, (_, index) => {
      const dayNumber = index + 1;
      const theme = config.priorityTags[index % config.priorityTags.length];
      const reviewStart = (index * config.reviewPerDay) % Math.max(reviewPool.length, 1);
      const reviewWordsRaw = reviewPool.length
        ? Array.from({ length: config.reviewPerDay }, (_, offset) => reviewPool[(reviewStart + offset) % reviewPool.length]).filter(Boolean)
        : [];
      const newWordsRaw = takeThematic(newPool, usedNew, theme, config.newPerDay);
      const sameLevelReviewRaw = newWordsRaw.length < config.newPerDay
        ? takeCyclic(newPool, dayNumber * config.newPerDay, config.newPerDay - newWordsRaw.length, new Set([...newWordsRaw.map(dailyWordKey), ...reviewWordsRaw.map(dailyWordKey)]))
        : [];
      const recognitionWordsRaw = config.recognitionPerDay ? takeThematic(recognitionPool, usedRecognition, theme, config.recognitionPerDay) : [];

      const newWords = newWordsRaw.map((word) => dailyItem(word, level, "new"));
      const reviewWords = [...reviewWordsRaw, ...sameLevelReviewRaw].map((word) => dailyItem(word, level, "review"));
      const recognitionWords = recognitionWordsRaw.map((word) => dailyItem(word, level, "recognition"));
      const allWords = [...newWords, ...reviewWords, ...recognitionWords];
      const phraseChunks = phraseChunksFor(level, dayNumber, allWords, sourceWords);
      const sentencePatterns = sentencePatternsFor(level, dayNumber, allWords, sourceWords);
      const targetSentenceExamples = sentencePatterns.flatMap((pattern) => pattern.examples.map((example) => example.dutch)).slice(0, 3);
      const packId = `daily-${level.toLowerCase()}-${String(dayNumber).padStart(2, "0")}`;

      packs.push({
        id: packId,
        level,
        dayNumber,
        title: lt(`${config.title.zh} Day ${dayNumber}`, `${config.title.en} Day ${dayNumber}`),
        theme,
        newWords,
        reviewWords,
        recognitionWords,
        phraseChunks,
        sentencePatterns,
        outputTask: outputTaskFor(level, theme, targetSentenceExamples),
        estimatedMinutes: config.estimatedMinutes,
      });

      allWords.forEach((word) => {
        const source = sourceWords.find((item) => item.id === word.wordId);
        assignments.push({
          packId,
          level,
          dayNumber,
          wordId: word.wordId,
          dutch: word.dutch,
          learningRole: word.learningRole,
          reason: source ? assignmentReason(word.learningRole, source, level) : lt("来自每日包生成规则。", "Assigned by daily pack rules."),
        });
      });
    });
  });

  return { packs, assignments };
}
