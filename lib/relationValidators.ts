import type { MemoryRelationCandidate, MemoryRelationType } from "@/lib/relationEngine";
import type { WordItem } from "@/types/vocabulary";

export type RelationIssueCode =
  | "weak-string-similarity"
  | "wrong-relation-type"
  | "missing-reason"
  | "phrase-used-as-bubble"
  | "unrelated-category"
  | "same-day-random"
  | "language-name-plural-error"
  | "string-similarity-only"
  | "random-same-day-relation";

export type ValidationResult = {
  isValid: boolean;
  shouldShowToLearner: boolean;
  needsHumanReview: boolean;
  issues: RelationIssueCode[];
};

const wordFamilyTypes = new Set<MemoryRelationType>(["word-family", "verb-form", "verb-noun-pair"]);
const genericReasonPattern = /相关词|可以一起记|适合一起记|same level|same day|memory bubble/i;

const looksLikeOnlyStringSimilarity = (candidate: MemoryRelationCandidate) =>
  candidate.source === "candidate" &&
  wordFamilyTypes.has(candidate.relationType) &&
  /looks similar|string similar|相似|长得像|same letters/i.test(`${candidate.reasonZh} ${candidate.reasonEn}`);

const looksLikePhraseBubble = (candidate: MemoryRelationCandidate) =>
  candidate.relationType !== "english-bridge" &&
  (
    candidate.targetText.trim().split(/\s+/).filter(Boolean).length > 1 ||
    /[.!?]$/.test(candidate.targetText.trim()) ||
    /^(de|het|een)\s+/i.test(candidate.targetText.trim())
  );

const isLanguagePluralProblem = (source: WordItem, target?: WordItem) =>
  Boolean(
    source.scenarioTags.includes("languages") &&
      target &&
      /en$|ers$|ren$/i.test(target.dutch) &&
      /people|person|人|民族|复数/i.test(`${target.meaning.en} ${target.meaning.zh}`),
  );

export function validateRelationCandidate(
  candidate: MemoryRelationCandidate,
  sourceWord: WordItem,
  targetWord?: WordItem,
): ValidationResult {
  const issues: RelationIssueCode[] = [];

  if (!candidate.reasonZh.trim() || !candidate.reasonEn.trim() || genericReasonPattern.test(`${candidate.reasonZh} ${candidate.reasonEn}`)) issues.push("missing-reason");
  if (looksLikeOnlyStringSimilarity(candidate)) issues.push("string-similarity-only");
  if (looksLikePhraseBubble(candidate)) issues.push("phrase-used-as-bubble");
  if (isLanguagePluralProblem(sourceWord, targetWord)) issues.push("language-name-plural-error");
  if ((candidate.relationType === "category-member" || candidate.relationType === "scenario-word") && candidate.source === "candidate") issues.push("unrelated-category");
  if (/same day|same level|同一天|同等级/i.test(`${candidate.reasonZh} ${candidate.reasonEn}`)) issues.push("random-same-day-relation");
  if (candidate.confidence === "low" && candidate.showToLearner) issues.push("wrong-relation-type");

  const fatal = issues.some((issue) =>
    [
      "string-similarity-only",
      "missing-reason",
      "phrase-used-as-bubble",
      "unrelated-category",
      "random-same-day-relation",
      "language-name-plural-error",
    ].includes(issue),
  );

  return {
    isValid: !fatal,
    shouldShowToLearner: !fatal && candidate.confidence !== "low" && candidate.strength !== "weak",
    needsHumanReview: candidate.needsHumanReview || issues.length > 0 || candidate.source === "candidate",
    issues,
  };
}
