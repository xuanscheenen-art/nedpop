import type { CourseLevel } from "@/types/course";

export type MemoryRelationType =
  | "compound-part"
  | "compound-parent"
  | "same-family"
  | "root-family"
  | "prefix-suffix-family"
  | "synonym"
  | "opposite"
  | "phrase-collocation"
  | "verb-form"
  | "verb-noun-pair"
  | "category-member"
  | "scenario-neighbor"
  | "confusion-pair"
  | "english-bridge"
  | "article-family"
  | "plural-family";

export type MemoryRelation = {
  id: string;
  sourceWordId: string;
  sourceText: string;
  targetWordId?: string;
  targetText: string;
  relationType: MemoryRelationType;
  labelZh: string;
  labelEn: string;
  reasonZh: string;
  reasonEn: string;
  examplePhrase?: {
    dutch: string;
    meaningZh: string;
    meaningEn: string;
  };
  exampleSentence?: {
    dutch: string;
    meaningZh: string;
    meaningEn: string;
  };
  strength: "strong" | "medium" | "weak";
  confidence: "high" | "medium" | "low";
  showToLearner: boolean;
  needsHumanReview: boolean;
  generatedBy: "rule" | "golden-example" | "manual" | "candidate";
};

export type MemoryRelationFilters = {
  level?: CourseLevel | "all";
  relationType?: MemoryRelationType | "all";
  strength?: MemoryRelation["strength"] | "all";
  confidence?: MemoryRelation["confidence"] | "all";
  showToLearner?: "all" | "yes" | "no";
  needsHumanReview?: "all" | "yes" | "no";
  query?: string;
};
