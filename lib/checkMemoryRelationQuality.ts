import { relationLabels } from "@/lib/relationRules";
import type { MemoryRelation } from "@/types/memoryRelation";
import type { WordItem } from "@/types/vocabulary";

const genericReasonPattern =
  /related word|same level|same day|同一天|同等级|同一个等级|相关词|可以一起记|适合一起记|same vocabulary|同一个实用场景里的高频搭档|useful neighbors in the same practical scenario/i;

const hasSharedRoot = (source: string, target: string) => {
  const a = source.toLowerCase();
  const b = target.toLowerCase();
  if (a.length < 4 || b.length < 4) return false;
  return a.includes(b.slice(0, 4)) || b.includes(a.slice(0, 4));
};

export function checkMemoryRelationQuality(relation: MemoryRelation, sourceWord?: WordItem, targetWord?: WordItem) {
  const issues: string[] = [];
  if (!relation.reasonZh.trim()) issues.push("no reasonZh");
  if (!relation.reasonEn.trim()) issues.push("no reasonEn");
  if (genericReasonPattern.test(`${relation.reasonZh} ${relation.reasonEn}`)) issues.push("generic reason");
  if (relation.relationType === "phrase-collocation" && !relation.examplePhrase?.dutch.trim()) issues.push("phrase-collocation missing examplePhrase");
  if (relation.relationType === "confusion-pair" && !/区别|不要混|confus|different|noun|verb|名词|动词/i.test(`${relation.reasonZh} ${relation.reasonEn}`)) {
    issues.push("confusion-pair missing contrast explanation");
  }
  if (relation.relationType === "same-family" || relation.relationType === "root-family") {
    if (!hasSharedRoot(relation.sourceText, relation.targetText) && !targetWord) issues.push("same-family without clear shared root");
  }
  if (relation.relationType === "scenario-neighbor" && !relation.examplePhrase && !relation.exampleSentence) {
    issues.push("scenario-neighbor missing concrete phrase");
  }
  if (relation.sourceText.toLowerCase() === "engels" && /\bengelsen\b/i.test(relation.targetText + " " + relation.reasonZh + " " + relation.reasonEn)) {
    issues.push("language-name plural error");
  }
  if (relation.strength === "weak" && relation.showToLearner) issues.push("weak relation shown to learner");
  if (relation.confidence === "low" && relation.showToLearner) issues.push("low confidence shown to learner");
  if (!relationLabels[relation.relationType]) issues.push("wrong relation type");

  const shouldShowToLearner = issues.length === 0 && relation.strength !== "weak" && relation.confidence !== "low";
  const needsHumanReview = issues.length > 0 || relation.confidence === "low";

  return {
    issues,
    shouldShowToLearner,
    needsHumanReview,
  };
}

export function relationQualityScore(relation: MemoryRelation) {
  const strength = relation.strength === "strong" ? 3 : relation.strength === "medium" ? 2 : 1;
  const confidence = relation.confidence === "high" ? 3 : relation.confidence === "medium" ? 2 : 1;
  const learner = relation.showToLearner ? 1 : 0;
  return strength * 10 + confidence * 5 + learner;
}
