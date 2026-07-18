import type { MemoryBubbleCandidate, MemoryBubbleRelationType, ScoredMemoryBubbleCandidate } from "@/lib/memoryBubbleEngine";
import { normalizeWordText } from "@/lib/wordAnalysis";

const relationPriority: MemoryBubbleRelationType[] = [
  "compound-part",
  "compound-family",
  "part-related",
  "pronoun-family",
  "verb-form",
  "verb-noun-pair",
  "word-family",
  "synonym",
  "opposite",
  "time-contrast",
  "comparative-superlative",
  "semantic-series",
  "confusion-pair",
  "category-member",
  "time-category",
  "action-object",
  "state-action",
  "scenario-word",
  "compound-parent",
  "english-bridge",
];

const evidenceScore: Record<MemoryBubbleCandidate["evidence"], number> = {
  lexicon: 36,
  "safe-rule": 30,
  manual: 34,
  candidate: 8,
};

const specificityScore: Record<MemoryBubbleRelationType, number> = {
  "compound-part": 30,
  "compound-parent": 14,
  "compound-family": 18,
  "part-related": 22,
  "pronoun-family": 26,
  "verb-form": 25,
  "verb-noun-pair": 24,
  "word-family": 23,
  synonym: 22,
  opposite: 23,
  "time-contrast": 23,
  "comparative-superlative": 22,
  "semantic-series": 21,
  "category-member": 18,
  "time-category": 19,
  "scenario-word": 6,
  "action-object": 8,
  "state-action": 8,
  "confusion-pair": 23,
  "english-bridge": 0,
};

const levelOrder = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 } as Record<string, number>;

function phraseLike(target: string) {
  return (
    target.trim().split(/\s+/).filter(Boolean).length > 1 ||
    /[.!?]$/.test(target.trim()) ||
    /^(de|het|een)\s+/i.test(target.trim())
  );
}

function levelFitScore(candidate: MemoryBubbleCandidate) {
  if (!candidate.sourceLevel || !candidate.targetLevel) return 12;
  const sourceLevel = levelOrder[candidate.sourceLevel] ?? 0;
  const targetLevel = levelOrder[candidate.targetLevel] ?? sourceLevel;
  if (targetLevel <= sourceLevel) return 14;
  if (targetLevel === sourceLevel + 1) return 10;
  return 3;
}

function isBroadFallbackBubble(candidate: MemoryBubbleCandidate) {
  return (
    candidate.evidence === "safe-rule" &&
    candidate.source === "rule" &&
    (candidate.relationType === "category-member" || candidate.relationType === "scenario-word")
  );
}

const highSignalRelationTypes = new Set<MemoryBubbleRelationType>([
  "compound-part",
  "compound-parent",
  "compound-family",
  "part-related",
  "pronoun-family",
  "verb-form",
  "verb-noun-pair",
  "word-family",
  "synonym",
  "opposite",
  "time-contrast",
  "comparative-superlative",
  "confusion-pair",
]);

const looseUsageRelationTypes = new Set<MemoryBubbleRelationType>([
  "scenario-word",
  "action-object",
  "state-action",
]);

function isHighSignalBubble(candidate: ScoredMemoryBubbleCandidate) {
  return highSignalRelationTypes.has(candidate.relationType);
}

function isLooseUsageBubble(candidate: ScoredMemoryBubbleCandidate) {
  return looseUsageRelationTypes.has(candidate.relationType);
}

export function hardRejectMemoryBubble(candidate: MemoryBubbleCandidate) {
  const text = `${candidate.reasonZh} ${candidate.reasonEn}`;
  if (!candidate.reasonZh.trim()) return "missing-reason";
  if (candidate.relationType === "english-bridge") return "english-bridge-hidden-from-bubbles";
  if (looseUsageRelationTypes.has(candidate.relationType)) return "usage-path-hidden-from-bubbles";
  if (
    /真实用法|用法落点|第一生活画面|第一画面|生活画面|动作搭配|动作落到|自然短语|常见搭配|具体话里的位置|先看一句具体话|先看一段具体话|first life scene|real usage|usage anchor|action chunk|natural phrase|common chunk/i.test(text)
  ) {
    return "memory-path-note-hidden-from-bubbles";
  }
  if (phraseLike(candidate.targetText)) return "phrase-used-as-bubble";
  if (/same day|same level|同一天|同等级/i.test(text)) return "random-same-day-relation";
  if (/article|plural|de\/het|冠词|复数/i.test(text) && candidate.evidence === "candidate") return "grammar-only-relation";
  if (/looks similar|string similar|长得像|拼写相似|same letters/i.test(text)) return "string-similarity-only";
  if (candidate.relationType === "word-family" && candidate.evidence === "candidate") return "same-family-without-evidence";
  if (candidate.source === "candidate") return "candidate-unapproved";
  return undefined;
}

export function scoreMemoryBubble(candidate: MemoryBubbleCandidate): ScoredMemoryBubbleCandidate {
  const rejectReason = hardRejectMemoryBubble(candidate);
  const relationEvidence = evidenceScore[candidate.evidence];
  const semanticUsefulness = candidate.strength === "strong" ? 18 : candidate.strength === "medium" ? 12 : 4;
  const relationSpecificity = specificityScore[candidate.relationType];
  const levelFit = levelFitScore(candidate);
  const relationTypeCorrectness = rejectReason ? 0 : 8;
  const hasReasonZh = candidate.reasonZh.trim() ? 6 : 0;
  const score = rejectReason
    ? 0
    : Math.min(100, relationEvidence + semanticUsefulness + relationSpecificity + levelFit + relationTypeCorrectness + hasReasonZh);
  return { ...candidate, score, rejectReason };
}

export function filterLearnerBubbles(candidates: MemoryBubbleCandidate[], limit = 8) {
  const seen = new Set<string>();
  const relationCounts = new Map<MemoryBubbleRelationType, number>();
  let broadFallbackCount = 0;
  const scored = candidates
    .map(scoreMemoryBubble)
    .filter((candidate) =>
      candidate.score >= 70 &&
      candidate.strength !== "weak" &&
      candidate.confidence !== "low" &&
      candidate.showToLearner &&
      !candidate.rejectReason,
    );
  const highSignalCount = scored.filter(isHighSignalBubble).length;
  const looseUsageLimit = highSignalCount >= 1 ? 0 : 2;
  let looseUsageCount = 0;

  return scored
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff) return scoreDiff;
      return relationPriority.indexOf(a.relationType) - relationPriority.indexOf(b.relationType);
    })
    .filter((candidate) => {
      const key = normalizeWordText(candidate.targetText);
      if (!key || normalizeWordText(candidate.sourceText) === key || seen.has(key)) return false;
      const relationCount = relationCounts.get(candidate.relationType) ?? 0;
      if (isLooseUsageBubble(candidate) && looseUsageCount >= looseUsageLimit) return false;
      if (candidate.relationType === "scenario-word" && relationCount >= 3) return false;
      if (candidate.relationType === "category-member" && relationCount >= 6) return false;
      if (candidate.relationType === "time-category" && relationCount >= 3) return false;
      if (isBroadFallbackBubble(candidate) && broadFallbackCount >= 2) return false;
      seen.add(key);
      relationCounts.set(candidate.relationType, relationCount + 1);
      if (isBroadFallbackBubble(candidate)) broadFallbackCount += 1;
      if (isLooseUsageBubble(candidate)) looseUsageCount += 1;
      return true;
    })
    .slice(0, limit);
}

export function groupMemoryBubbles<T extends { relationType: MemoryBubbleRelationType }>(bubbles: T[]) {
  return relationPriority
    .map((type) => ({ type, bubbles: bubbles.filter((bubble) => bubble.relationType === type) }))
    .filter((group) => group.bubbles.length);
}
