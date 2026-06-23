"use client";

import { qualityIssuesForWord, qualityIssuesForWords, type ContentQualityIssue } from "@/lib/contentQuality";
import {
  creatorWordToWordItem,
  exampleFromSuggestion,
  phraseFromSuggestion,
  isBlank,
  isWeakText,
} from "@/lib/creatorCompletionPipeline";
import { generateExamplesForWord, generatedExampleToExampleSentence } from "@/lib/exampleSentenceGenerator";
import type { CreatorExampleSentence, CreatorPhraseChunk, CreatorWord } from "@/lib/creatorStore";
import { memoryPathFor, validateMemoryPath, wordTypeFor } from "@/lib/memoryPath";
import { generateWordBubbleCompletionDraft } from "@/lib/wordBubbleCompletion";
import type { LocalizedText } from "@/types/course";

export type RepairSuggestion = {
  id: string;
  wordId: string;
  issueId: string;
  issueType: string;
  targetField:
    | "memoryPath"
    | "exampleSentences"
    | "phraseChunks"
    | "commonMistake"
    | "articleReason"
    | "pronunciationHint"
    | "meaning"
    | "levelReason";
  before: unknown;
  suggestedPatch: Partial<CreatorWord>;
  confidence: "high" | "medium" | "low";
  reasonZh: string;
  needsHumanReview: boolean;
};

const lt = (zh = "", en = ""): LocalizedText => ({ zh, en });

const weakOrMissingMeaning = (meaning?: LocalizedText) =>
  !meaning?.zh?.trim() ||
  !meaning?.en?.trim() ||
  /需要人工|placeholder|真实场景|这个词|这句|该句/i.test(`${meaning.zh} ${meaning.en}`);

const oneWordSentence = (sentence: string) =>
  sentence.trim().replace(/[.!?]+$/, "").split(/\s+/).filter(Boolean).length <= 1;

const knownBadDutchSentence = (sentence: string) =>
  [
    /^Ik zie de minuut\.$/i,
    /^Ik zeg heet\.$/i,
    /^Heb\.$/i,
    /^Wanneer\.$/i,
    /^Kijken\.$/i,
    /^Spreek jij de supermarkt\?$/i,
    /^Ik spreek geen water\.$/i,
    /^Het is tegenover een afspraak\.$/i,
    /^Ik heb een afspraak\.$/i,
    /^Ik ben een afspraak\.$/i,
  ].some((pattern) => pattern.test(sentence.trim()));

const isBadExample = (word: CreatorWord, example: CreatorExampleSentence) => {
  const lowerWord = word.dutch.toLowerCase();
  const bare = example.dutch.trim().replace(/[.!?]+$/, "").toLowerCase();
  const standaloneAllowed = new Set(["hallo", "dag", "ja", "nee", "goedemorgen", "goedenavond", "bedankt", "alsjeblieft", "tot ziens"]);
  if (weakOrMissingMeaning(example.meaning)) return true;
  if (!example.audioText.trim()) return true;
  if (knownBadDutchSentence(example.dutch)) return true;
  if (oneWordSentence(example.dutch) && !standaloneAllowed.has(lowerWord)) return true;
  if (bare === lowerWord && !standaloneAllowed.has(lowerWord)) return true;
  return false;
};

const isBadPhrase = (word: CreatorWord, phrase: CreatorPhraseChunk) =>
  isBlank(phrase.dutch) ||
  phrase.dutch.trim().toLowerCase() === word.dutch.trim().toLowerCase() ||
  weakOrMissingMeaning(phrase.meaning);

const uniqueByDutch = <T extends { dutch: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.dutch.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const confidenceFor = (word: CreatorWord, issue: ContentQualityIssue, hasStrongDraft: boolean): RepairSuggestion["confidence"] => {
  if (hasStrongDraft && word.levelConfidence !== "low") return "high";
  if (hasStrongDraft) return "medium";
  if (word.levelConfidence === "low" || word.sourceTags.every((tag) => tag === "generated")) return "low";
  return "medium";
};

const phrasePatchFor = (word: CreatorWord) => {
  const draft = generateWordBubbleCompletionDraft(creatorWordToWordItem(word));
  const suggested = draft.suggestedPhraseChunks.map((phrase) => phraseFromSuggestion(word, phrase));
  const existingGood = word.phraseChunks.filter((phrase) => !isBadPhrase(word, phrase));
  return {
    patch: { phraseChunks: uniqueByDutch([...existingGood, ...suggested]) },
    confidence: draft.confidence,
    hasStrongDraft: suggested.length > 0,
  };
};

const examplePatchFor = (word: CreatorWord) => {
  const draft = generateWordBubbleCompletionDraft(creatorWordToWordItem(word));
  const generated = generateExamplesForWord(creatorWordToWordItem(word), { existingExamples: word.exampleSentences })
    .filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim())
    .map(generatedExampleToExampleSentence);
  const suggestedSource = generated.length
    ? generated
    : [...draft.suggestedExamples, ...(draft.suggestedOutputSentence ? [draft.suggestedOutputSentence] : [])];
  const suggested = suggestedSource
    .map((example) => exampleFromSuggestion(word, example))
    .filter((example) => !isBadExample(word, example));
  const existingGood = word.exampleSentences.filter((example) => !isBadExample(word, example));
  return {
    patch: { exampleSentences: uniqueByDutch([...existingGood, ...suggested]) },
    confidence: draft.confidence,
    hasStrongDraft: suggested.length > 0,
  };
};

const articleReasonFor = (word: CreatorWord) => {
  if (!word.article) return "";
  const dutch = word.dutch.toLowerCase();
  if (dutch.endsWith("je") || dutch.endsWith("tje") || dutch.endsWith("pje") || dutch.endsWith("etje") || dutch.endsWith("kje")) {
    return `${word.article} ${word.dutch}。-je/-tje/-pje 这类“小词”通常用 het；这个词要和冠词一起记。`;
  }
  if (dutch.endsWith("ing")) return `${word.article} ${word.dutch}。-ing 结尾的名词多半用 de，但不是百分百规则，所以仍然整块记。`;
  if (dutch.endsWith("tie") || dutch.endsWith("ie")) return `${word.article} ${word.dutch}。-tie/-ie 结尾的名词多半用 de，先当线索，再和冠词一起背。`;
  if (dutch.includes("huis")) return `${word.article} ${word.dutch}。复合词通常看最后一个核心词；这里跟 ${word.article} ${word.dutch} 一起记。`;
  return `${word.article} ${word.dutch}。没有明显规则，建议和冠词一起记。`;
};

const meaningPatchFor = (word: CreatorWord) => {
  const draft = generateWordBubbleCompletionDraft(creatorWordToWordItem(word));
  const exampleMeaning = draft.suggestedExamples.find((example) => example.meaning.zh && example.meaning.en)?.meaning;
  return {
    meaning: {
      zh: word.meaning.zh.trim() || exampleMeaning?.zh?.replace(/^这是|。$/g, "") || word.dutch,
      en: word.meaning.en.trim() || exampleMeaning?.en?.replace(/^This is |\.$/g, "") || word.dutch,
    },
  };
};

const targetForIssue = (issue: ContentQualityIssue): RepairSuggestion["targetField"] => {
  const text = `${issue.id} ${issue.title} ${issue.detail}`.toLowerCase();
  if (issue.category === "weak-memory") return "memoryPath";
  if (issue.category === "phrase-chunk") return "phraseChunks";
  if (
    issue.category === "bad-example" ||
    issue.category === "missing-example" ||
    issue.category === "repetitive-template" ||
    issue.category === "scenario-mismatch" ||
    issue.category === "wrong-word-type-template" ||
    issue.category === "language-name-plural-error" ||
    issue.category === "too-hard-for-level"
  ) return "exampleSentences";
  if (issue.category === "verb-form") return "exampleSentences";
  if (text.includes("phrase") || text.includes("短语")) return "phraseChunks";
  if (text.includes("example") || text.includes("例句")) return "exampleSentences";
  if (text.includes("article") || text.includes("冠词")) return "articleReason";
  if (text.includes("pronunciation") || text.includes("发音")) return "pronunciationHint";
  if (text.includes("等级")) return "levelReason";
  return "meaning";
};

export const generateRepairSuggestionForIssue = (word: CreatorWord, issue: ContentQualityIssue): RepairSuggestion => {
  const targetField = targetForIssue(issue);
  const wordItem = creatorWordToWordItem(word);
  const draft = generateWordBubbleCompletionDraft(wordItem);
  let suggestedPatch: Partial<CreatorWord> = {};
  let before: unknown = undefined;
  let hasStrongDraft = true;
  let reasonZh = "根据质量问题生成一个定向修复 patch，接受后会写入本地覆盖层。";

  if (targetField === "exampleSentences") {
    const result = examplePatchFor(word);
    suggestedPatch = result.patch;
    before = word.exampleSentences;
    hasStrongDraft = result.hasStrongDraft;
    reasonZh = "为缺失/坏例句生成符合等级的可用例句：A0 极短，A1 日常，A2 办事场景。";
  } else if (targetField === "phraseChunks") {
    const result = phrasePatchFor(word);
    suggestedPatch = result.patch;
    before = word.phraseChunks;
    hasStrongDraft = result.hasStrongDraft;
    reasonZh = "按词性生成真实搭配：名词用冠词/动词搭配，动词用变位短句，语言名用 spreken/leren。";
  } else if (targetField === "memoryPath") {
    const memoryPath = memoryPathFor(wordItem);
    const warnings = validateMemoryPath(memoryPath);
    suggestedPatch = {
      memoryPath,
      memoryHook: {
        zh: memoryPath.memoryHookZh,
        en: memoryPath.memoryHookEn,
      },
      englishExplanation: memoryPath.explanationEn,
    };
    before = {
      memoryPath: word.memoryPath,
      memoryHook: word.memoryHook,
      englishExplanation: word.englishExplanation,
    };
    hasStrongDraft = warnings.length === 0 || warnings.every((warning) => !/误导|generic|填充/.test(`${warning.zh} ${warning.en}`));
    reasonZh = `按 wordType=${wordTypeFor(wordItem)} 重新选择记忆策略，避免硬拆、误导复数或泛泛废话。`;
  } else if (targetField === "articleReason") {
    suggestedPatch = { articleReason: articleReasonFor(word) };
    before = word.articleReason;
    reasonZh = "如果有 de/het 线索就解释线索；没有线索就明确说和冠词一起记。";
  } else if (targetField === "commonMistake") {
    suggestedPatch = { commonMistake: draft.suggestedCommonMistake ?? word.commonMistake };
    before = word.commonMistake;
    hasStrongDraft = Boolean(draft.suggestedCommonMistake);
    reasonZh = "补一个和词性或冠词相关的常见错误。";
  } else if (targetField === "pronunciationHint") {
    suggestedPatch = { pronunciationHint: draft.suggestedPronunciationHint };
    before = word.pronunciationHint;
    hasStrongDraft = Boolean(draft.suggestedPronunciationHint);
    reasonZh = "补发音提示，优先指出特殊音或整词跟读方式。";
  } else if (targetField === "levelReason") {
    suggestedPatch = { levelReason: draft.suggestedLevelReason ?? lt(`${word.level} 实用词，用于当前课程场景。`, `${word.level} practical word for the current course scenario.`) };
    before = word.levelReason;
    reasonZh = "补等级理由，说明为什么放在当前阶段。";
  } else {
    suggestedPatch = meaningPatchFor(word);
    before = word.meaning;
    hasStrongDraft = Boolean(word.meaning.zh || word.meaning.en);
    reasonZh = "补缺失释义；若无法可靠推断，会标成低置信度并进入质量队列。";
  }

  const confidence = confidenceFor(word, issue, hasStrongDraft);

  return {
    id: `${issue.id}-${targetField}-repair`,
    wordId: word.id,
    issueId: issue.id,
    issueType: issue.category,
    targetField,
    before,
    suggestedPatch,
    confidence,
    reasonZh,
    needsHumanReview: confidence !== "high" || issue.severity === "high",
  };
};

export const generateRepairSuggestionsForWords = (words: CreatorWord[], issues = qualityIssuesForWords(words)) => {
  const wordsById = new Map(words.map((word) => [word.id, word]));
  return issues
    .map((issue) => {
      const word = wordsById.get(issue.wordId);
      return word ? generateRepairSuggestionForIssue(word, issue) : undefined;
    })
    .filter(Boolean) as RepairSuggestion[];
};

export const applyRepairSuggestionToWord = (word: CreatorWord, suggestion: RepairSuggestion): CreatorWord => ({
  ...word,
  ...suggestion.suggestedPatch,
  id: word.id,
});

export const unresolvedIssuesForSuggestion = (word: CreatorWord, suggestion: RepairSuggestion) =>
  qualityIssuesForWord(applyRepairSuggestionToWord(word, suggestion)).filter((issue) => issue.id === suggestion.issueId);
