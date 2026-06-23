export type Level = "A0" | "A1" | "A2" | "B1" | "B2";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type SyllabusPriority = "must" | "should" | "nice";

export type SyllabusVocabularyWord = {
  dutch: string;
  article?: "de" | "het";
  meaning: LocalizedText;
  priority: SyllabusPriority;
  notesForChineseLearners?: string;
};

export type SyllabusVocabularyTheme = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  coreWords: SyllabusVocabularyWord[];
};

export type SyllabusSentencePattern = {
  id: string;
  pattern: string;
  meaning: LocalizedText;
  examples: {
    dutch: string;
    meaning: LocalizedText;
  }[];
  usageScene: LocalizedText;
};

export type SyllabusGrammarPoint = {
  id: string;
  title: LocalizedText;
  explanation: LocalizedText;
  examples: {
    dutch: string;
    meaning: LocalizedText;
  }[];
  priority: SyllabusPriority;
  notesForChineseLearners?: string;
};

export type SyllabusPronunciationPoint = {
  id: string;
  title: LocalizedText;
  sounds: string[];
  exampleWords: string[];
  notesForChineseLearners: string;
};

export type SyllabusScenarioTask = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  usefulPatterns: string[];
  outputType: ("speaking" | "writing" | "reading" | "listening")[];
};

export type SyllabusLevel = {
  level: Level;
  title: LocalizedText;
  goal: LocalizedText;
  canDo: LocalizedText[];
  vocabularyThemes: SyllabusVocabularyTheme[];
  sentencePatterns: SyllabusSentencePattern[];
  grammarPoints: SyllabusGrammarPoint[];
  pronunciationPoints: SyllabusPronunciationPoint[];
  scenarioTasks: SyllabusScenarioTask[];
  speakingOutputTasks: LocalizedText[];
  writingOutputTasks: LocalizedText[];
  readingTaskTypes: LocalizedText[];
  listeningTaskTypes: LocalizedText[];
  examRelevance: LocalizedText;
  notesForChineseLearners: LocalizedText;
};
