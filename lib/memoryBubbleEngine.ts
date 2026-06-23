import { generateAllRuleCandidates } from "@/lib/memoryBubbleRules";
import { filterLearnerBubbles, groupMemoryBubbles, scoreMemoryBubble } from "@/lib/memoryBubbleFilters";
import { analyzeWord } from "@/lib/wordAnalysis";
import type { CourseLevel } from "@/types/course";
import type { WordItem } from "@/types/vocabulary";

export type RelationSource = "rule" | "seed" | "manual" | "candidate";

export type MemoryBubbleRelationType =
  | "word-family"
  | "verb-form"
  | "verb-noun-pair"
  | "compound-part"
  | "compound-parent"
  | "compound-family"
  | "part-related"
  | "synonym"
  | "opposite"
  | "time-contrast"
  | "comparative-superlative"
  | "category-member"
  | "time-category"
  | "scenario-word"
  | "action-object"
  | "state-action"
  | "confusion-pair"
  | "english-bridge";

export type MemoryBubbleRelationGroup =
  | "词形联想"
  | "组成部分"
  | "动词形式"
  | "同词族"
  | "反义/对比"
  | "时间对照"
  | "比较级/最高级"
  | "同类别"
  | "时间相关"
  | "同场景"
  | "动作相关"
  | "状态相关"
  | "易混词"
  | "英文桥梁";

export const memoryBubbleRelationLabels: Record<MemoryBubbleRelationType, { zh: string; en: string; groupZh: MemoryBubbleRelationGroup; groupEn: string }> = {
  "compound-part": { zh: "词里小块", en: "Word Piece", groupZh: "组成部分", groupEn: "Parts" },
  "compound-parent": { zh: "同组拼词", en: "Compound Set", groupZh: "组成部分", groupEn: "Parts" },
  "compound-family": { zh: "同组拼词", en: "Compound Set", groupZh: "组成部分", groupEn: "Parts" },
  "part-related": { zh: "短语小块", en: "Phrase Piece", groupZh: "组成部分", groupEn: "Parts" },
  "word-family": { zh: "同词根 / 同家族", en: "Word Family", groupZh: "同词族", groupEn: "Word Family" },
  "verb-form": { zh: "动词形式", en: "Verb Form", groupZh: "动词形式", groupEn: "Verb Forms" },
  "verb-noun-pair": { zh: "词族联想", en: "Verb/Noun Pair", groupZh: "同词族", groupEn: "Word Family" },
  synonym: { zh: "同义词", en: "Synonym", groupZh: "词形联想", groupEn: "Word Links" },
  opposite: { zh: "反义/对比", en: "Opposite/Contrast", groupZh: "反义/对比", groupEn: "Contrast" },
  "time-contrast": { zh: "时间对照", en: "Time Contrast", groupZh: "时间对照", groupEn: "Time Contrast" },
  "comparative-superlative": { zh: "比较级 / 最高级", en: "Comparative", groupZh: "比较级/最高级", groupEn: "Comparative" },
  "category-member": { zh: "同类别", en: "Category", groupZh: "同类别", groupEn: "Category" },
  "time-category": { zh: "时间相关", en: "Time Related", groupZh: "时间相关", groupEn: "Time Related" },
  "scenario-word": { zh: "同场景", en: "Scenario Word", groupZh: "同场景", groupEn: "Scenario" },
  "action-object": { zh: "动作相关", en: "Action Link", groupZh: "动作相关", groupEn: "Action" },
  "state-action": { zh: "状态相关", en: "State Link", groupZh: "状态相关", groupEn: "State" },
  "confusion-pair": { zh: "易混词", en: "Confusion Pair", groupZh: "易混词", groupEn: "Confusion" },
  "english-bridge": { zh: "英文桥梁", en: "English Bridge", groupZh: "英文桥梁", groupEn: "English Bridge" },
};

export type MemoryBubbleCandidate = {
  sourceWordId: string;
  sourceText: string;
  targetWordId?: string;
  targetText: string;
  targetMeaning?: {
    zh: string;
    en: string;
  };
  targetExistsInVocabulary?: boolean;
  isExtensionWord?: boolean;
  isExtensionTarget?: boolean;
  relationType: MemoryBubbleRelationType;
  source: RelationSource;
  evidence: "lexicon" | "safe-rule" | "manual" | "candidate";
  reasonZh: string;
  reasonEn: string;
  strength: "strong" | "medium" | "weak";
  confidence: "high" | "medium" | "low";
  showToLearner: boolean;
  sourceLevel?: CourseLevel;
  targetLevel?: CourseLevel;
};

export type ScoredMemoryBubbleCandidate = MemoryBubbleCandidate & {
  score: number;
  rejectReason?: string;
};

export type MemoryBubble = ScoredMemoryBubbleCandidate & {
  id: string;
  labelZh: string;
  labelEn: string;
  groupZh: MemoryBubbleRelationGroup;
  groupEn: string;
  relationSource: RelationSource;
  needsHumanReview: boolean;
  validation?: {
    isValid: boolean;
    shouldShowToLearner: boolean;
    needsHumanReview: boolean;
    issues: string[];
  };
};

export type MemoryRelationType = MemoryBubbleRelationType;
export type MemoryRelationCandidate = MemoryBubble;

export type MemoryBubbleContext = {
  pageContext?: "word-link" | "grammar" | "creator";
  limit?: number;
};

const slug = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function hydrateBubble(candidate: ScoredMemoryBubbleCandidate): MemoryBubble {
  const label = memoryBubbleRelationLabels[candidate.relationType];
  const issues = candidate.rejectReason ? [candidate.rejectReason] : [];
  const targetExistsInVocabulary = candidate.targetExistsInVocabulary ?? Boolean(candidate.targetWordId);
  const isExtensionWord = candidate.isExtensionWord ?? candidate.isExtensionTarget ?? Boolean(candidate.targetMeaning && !candidate.targetWordId);
  return {
    ...candidate,
    targetExistsInVocabulary,
    isExtensionWord,
    isExtensionTarget: candidate.isExtensionTarget ?? isExtensionWord,
    id: `${candidate.sourceWordId}-${candidate.relationType}-${slug(candidate.targetText)}`,
    labelZh: label.zh,
    labelEn: label.en,
    groupZh: label.groupZh,
    groupEn: label.groupEn,
    relationSource: candidate.source,
    needsHumanReview: Boolean(candidate.rejectReason) || candidate.source === "candidate" || candidate.score < 70,
    validation: {
      isValid: !candidate.rejectReason,
      shouldShowToLearner: !candidate.rejectReason && candidate.score >= 70,
      needsHumanReview: Boolean(candidate.rejectReason) || candidate.source === "candidate" || candidate.score < 70,
      issues,
    },
  };
}

export function generateMemoryBubbleCandidates(word: WordItem, allWords: WordItem[]) {
  const analysis = analyzeWord(word, allWords);
  return generateAllRuleCandidates(analysis, allWords);
}

export function generateMemoryBubbles(word: WordItem, allWords: WordItem[], context: MemoryBubbleContext = {}) {
  const candidates = generateMemoryBubbleCandidates(word, allWords);
  const limit = context.limit ?? 8;
  const selected = context.pageContext === "creator"
    ? candidates.map(scoreMemoryBubble).sort((a, b) => b.score - a.score)
    : filterLearnerBubbles(candidates, limit);
  return selected.map(hydrateBubble);
}

export function generateMemoryBubblesForAllWords(words: WordItem[]) {
  return words.flatMap((word) => generateMemoryBubbles(word, words, { pageContext: "creator" }));
}

export function generateGroupedMemoryBubbles(word: WordItem, allWords: WordItem[], context: MemoryBubbleContext = {}) {
  return groupMemoryBubbles(generateMemoryBubbles(word, allWords, context));
}
