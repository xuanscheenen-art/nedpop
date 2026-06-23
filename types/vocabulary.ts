import type { CourseLevel, LocalizedText, PathLevel } from "@/types/course";

export type VocabularyLevel = Exclude<PathLevel, "SoundBase">;

export type LevelConfidence = "high" | "medium" | "low";
export type ActiveOrPassive = "active" | "recognition";
export type ExamRelevance = "high" | "medium" | "low";
export type SourceTag =
  | "duo-inburgering-task"
  | "naar-nederland"
  | "nt2-taalmenu"
  | "staatsexamen-nt2"
  | "dutch-online-academy"
  | "course-preview"
  | "frequency"
  | "manual"
  | "generated";
export type ReviewStatus = "approved" | "needs-review" | "too-easy" | "too-hard" | "duplicate" | "not-useful";

export type MemoryLinkType =
  | "compound-part"
  | "compound-parent"
  | "compound-family"
  | "part-related"
  | "same-family"
  | "root-family"
  | "prefix-suffix-family"
  | "word-family"
  | "synonym"
  | "opposite"
  | "antonym"
  | "similar"
  | "time-contrast"
  | "time-category"
  | "comparative-superlative"
  | "english-bridge"
  | "phrase-collocation"
  | "usage-chunk"
  | "verb-form"
  | "verb-noun-pair"
  | "category-member"
  | "scenario-word"
  | "action-object"
  | "state-action"
  | "scenario-neighbor"
  | "same-scene"
  | "confusion-pair"
  | "derivation"
  | "article-family"
  | "plural-family"
  | "number-family";

export type MemoryLink = {
  dutch: string;
  type: MemoryLinkType;
  explanation: LocalizedText;
  strength?: "strong" | "medium" | "weak";
  showToLearner?: boolean;
  reviewStatus?: "pending" | "approved" | "rejected";
};

export type VocabularyLevelPlan = {
  level: CourseLevel;
  titleZh: string;
  titleEn: string;
  targetWordRange: string;
  currentWordCount: number;
  dailyWordCount: string;
  totalDays: number;
  cumulativeTargetForA2?: string;
  description: LocalizedText;
};

export type WordItem = {
  id: string;
  level: CourseLevel;
  originalLevel: VocabularyLevel;
  appearsInLevels: VocabularyLevel[];
  dutch: string;
  article?: "de" | "het";
  plural?: string;
  meaning: LocalizedText;
  theme: string;
  priority: "must" | "should" | "nice";
  activeOrPassive: ActiveOrPassive;
  examRelevance: ExamRelevance;
  levelConfidence: LevelConfidence;
  sourceTags: SourceTag[];
  scenarioTags: string[];
  levelReason: LocalizedText;
  reviewStatus: ReviewStatus;
  memoryHook: LocalizedText;
  englishBridge?: string;
  phraseChunks: string[];
  relatedWords: string[];
  memoryLinks?: MemoryLink[];
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  audioText: string;
  audioSrc?: string;
};

export type PhraseChunk = {
  id: string;
  level: CourseLevel;
  dutch: string;
  meaning: LocalizedText;
  usageScene: LocalizedText;
  relatedWords: string[];
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  audioText: string;
  audioSrc?: string;
};

export type ExampleSentence = {
  dutch: string;
  meaning: LocalizedText;
  level?: CourseLevel;
  type?: "minimal" | "collocation" | "scenario" | "output" | "contrast" | "mistake-correction";
  targetWord?: string;
  grammarFocus?: string;
  scenarioTags?: string[];
  audioText?: string;
  audioSrc?: string;
};

export type WordBubbleCompletionDraft = {
  wordId: string;
  dutch: string;
  generatedAt: string;
  suggestedMemoryHook?: string;
  suggestedEnglishExplanation?: string;
  suggestedEnglishBridge?: string;
  suggestedPronunciationHint?: string;
  suggestedArticleReason?: string;
  suggestedCommonMistake?: string;
  suggestedPhraseChunks: PhraseChunk[];
  suggestedExamples: ExampleSentence[];
  suggestedOutputSentence?: ExampleSentence;
  suggestedLevelReason?: LocalizedText;
  confidence: "high" | "medium" | "low";
  warnings: string[];
};

export type SentencePattern = {
  id: string;
  level: CourseLevel;
  pattern: string;
  meaning: LocalizedText;
  usageScene: LocalizedText;
  examples: {
    dutch: string;
    meaning: LocalizedText;
  }[];
  commonMistake?: LocalizedText;
};

export type WordDayPack = {
  id: string;
  level: CourseLevel;
  dayNumber: number;
  titleZh: string;
  titleEn: string;
  words: WordItem[];
  phraseChunks: PhraseChunk[];
  sentencePatterns: SentencePattern[];
  outputTask: LocalizedText;
};

export type LearningRoleInPack = "new" | "review" | "recognition";

export type DailyWordItem = {
  wordId: string;
  dutch: string;
  article?: "de" | "het";
  plural?: string;
  meaning: LocalizedText;
  learningRole: LearningRoleInPack;
  originalLevel: VocabularyLevel;
  currentPackLevel: CourseLevel;
  memoryHook?: LocalizedText;
  phraseChunks?: string[];
  exampleSentence?: {
    dutch: string;
    meaning: LocalizedText;
  };
  audioText?: string;
  audioSrc?: string;
};

export type DailyWordPack = {
  id: string;
  level: CourseLevel;
  dayNumber: number;
  title: LocalizedText;
  theme: string;
  newWords: DailyWordItem[];
  reviewWords: DailyWordItem[];
  recognitionWords: DailyWordItem[];
  phraseChunks: PhraseChunk[];
  sentencePatterns: SentencePattern[];
  outputTask: LocalizedText & {
    targetSentenceExamples: string[];
  };
  estimatedMinutes: number;
};

export type DailyPackAssignment = {
  packId: string;
  level: CourseLevel;
  dayNumber: number;
  wordId: string;
  dutch: string;
  learningRole: LearningRoleInPack;
  reason: LocalizedText;
};

export type MemoryPathStrategy =
  | "word-breakdown"
  | "word-formation"
  | "compound-word"
  | "english-bridge"
  | "fixed-expression"
  | "meaning-contrast"
  | "phrase-based"
  | "sentence-based"
  | "category-rule"
  | "no-strong-association";

export type MemoryPathWordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "function-word"
  | "language-name"
  | "country-name"
  | "number"
  | "day-month"
  | "phrase";

export type MemoryPath = {
  wordId?: string;
  dutch?: string;
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  titleZh?: string;
  titleEn?: string;
  explanationZh: string;
  explanationEn: string;
  steps?: {
    labelZh: string;
    labelEn: string;
    contentZh: string;
    contentEn: string;
    dutchExample?: string;
  }[];
  breakdown?: {
    parts: {
      dutch: string;
      meaningZh: string;
      meaningEn: string;
    }[];
    noteZh: string;
    noteEn: string;
  };
  englishBridge?: {
    bridge: string;
    noteZh: string;
    noteEn: string;
  };
  memoryHookZh: string;
  memoryHookEn: string;
  usageAnchorZh?: string;
  usageAnchorEn?: string;
  scenarioAnchor: {
    zh: string;
    en: string;
  };
  phraseChunks: {
    dutch: string;
    meaningZh: string;
    meaningEn: string;
  }[];
  outputSentences: {
    dutch: string;
    meaningZh: string;
    meaningEn: string;
  }[];
  outputSentence?: {
    dutch: string;
    meaningZh: string;
    meaningEn: string;
  };
  warningZh?: string;
  warningEn?: string;
  confidence?: "high" | "medium" | "low";
  needsHumanReview?: boolean;
  qualityIssues?: string[];
  warnings?: {
    zh: string;
    en: string;
  }[];
};
