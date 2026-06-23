export type LocalizedText = {
  zh: string;
  en: string;
};

export type CourseLevel = "A0" | "A1" | "A2" | "B1";
export type PathLevel = CourseLevel | "B2" | "SoundBase";

export type MiniQuiz = {
  id: string;
  question: LocalizedText;
  options: LocalizedText[];
  answerIndex: number;
  explanation: LocalizedText;
};

export type SoundLesson = {
  id: string;
  level: CourseLevel;
  title: LocalizedText;
  sound: string;
  category: "alphabet" | "vowel" | "vowel-combination" | "consonant" | "ending" | "stress";
  rule: LocalizedText;
  mouthPosition: LocalizedText;
  chineseApproximation?: string;
  englishBridge?: string;
  soundAssociation?: LocalizedText;
  soundStory?: {
    description: LocalizedText;
    mnemonic: LocalizedText;
    funFact: LocalizedText;
  };
  exampleWords: {
    dutch: string;
    meaning: LocalizedText;
    highlight: string;
  }[];
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  commonMistake: LocalizedText;
  drill: string[];
  miniQuiz: MiniQuiz[];
};

export type SmartWord = {
  id: string;
  level: CourseLevel;
  dutch: string;
  article?: "de" | "het";
  meaning: LocalizedText;
  wordBreakdown: LocalizedText;
  smartAssociation: LocalizedText;
  chineseMemoryHook: string;
  englishBridge?: string;
  soundHint?: LocalizedText;
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  commonPhrase?: {
    dutch: string;
    meaning: LocalizedText;
  };
  commonMistake?: LocalizedText;
  relatedWords: string[];
  scenarioTags: string[];
  miniQuiz: MiniQuiz[];
};

export type GrammarRule = {
  id: string;
  level: CourseLevel;
  title: LocalizedText;
  category: "verb" | "article" | "plural" | "word-order" | "modal" | "separable-verb" | "negation";
  explanation: LocalizedText;
  memoryHook: LocalizedText;
  pattern?: string;
  examples: {
    dutch: string;
    meaning: LocalizedText;
    note?: LocalizedText;
  }[];
  commonMistakes: {
    wrong: string;
    correct: string;
    explanation: LocalizedText;
  }[];
  miniQuiz: MiniQuiz[];
};

export type VerbEntry = {
  id: string;
  infinitive: string;
  meaning: LocalizedText;
  level: CourseLevel;
  isIrregular: boolean;
  stem?: string;
  presentTense: {
    ik: string;
    jij: string;
    hijZijHet: string;
    wij: string;
    jullie: string;
    zij: string;
  };
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  commonMistake?: LocalizedText;
};

export type NounEntry = {
  id: string;
  singular: string;
  article: "de" | "het";
  plural: string;
  meaning: LocalizedText;
  level: CourseLevel;
  ruleHint: LocalizedText;
  memoryHook?: LocalizedText;
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
};

export type PluralEntry = {
  id: string;
  singular: string;
  plural: string;
  ruleExplanation: LocalizedText;
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
  };
  miniQuiz: MiniQuiz[];
};

export type SentencePattern = {
  id: string;
  level: CourseLevel;
  title: LocalizedText;
  rule: LocalizedText;
  visualBlocks: string[];
  example: {
    dutch: string;
    meaning: LocalizedText;
  };
  explanation: LocalizedText;
};

export type SpeakingTask = {
  prompt: LocalizedText;
  usefulPhrases: string[];
  sampleAnswer: {
    dutch: string;
    meaning: LocalizedText;
  };
};

export type WritingTask = {
  prompt: LocalizedText;
  requiredInfo: LocalizedText[];
  sampleAnswer: {
    dutch: string;
    meaning: LocalizedText;
  };
};

export type ScenarioLesson = {
  id: string;
  level: CourseLevel;
  title: LocalizedText;
  scenario: LocalizedText;
  stage: "starter" | "foundation" | "bridge";
  learningGoals: LocalizedText[];
  usefulWords: string[];
  usefulPhrases: {
    dutch: string;
    meaning: LocalizedText;
  }[];
  dialogue: {
    speaker: string;
    dutch: string;
    meaning: LocalizedText;
  }[];
  speakingTask: SpeakingTask;
  writingTask?: WritingTask;
  checklist: LocalizedText[];
  relatedSoundLessonIds: string[];
  relatedSmartWordIds: string[];
  relatedGrammarRuleIds: string[];
};

export type LearningPathStage = {
  id: string;
  level: PathLevel;
  title: LocalizedText;
  goal: LocalizedText;
  description: LocalizedText;
  modules: {
    id: string;
    title: LocalizedText;
    type: "decode" | "link" | "rule" | "speak";
    lessonIds: string[];
  }[];
};
