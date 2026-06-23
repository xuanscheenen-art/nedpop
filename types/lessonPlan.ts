import type { Level, LocalizedText } from "@/types/syllabus";

export type LessonPlanLevel = Extract<Level, "A0" | "A1" | "A2" | "B1">;

export type LessonPlanMethodTargets = {
  decode: LocalizedText;
  link: LocalizedText;
  rule: LocalizedText;
  speak: LocalizedText;
};

export type LessonPlan = {
  id: string;
  level: LessonPlanLevel;
  order: number;
  title: LocalizedText;
  learningGoal: LocalizedText;
  coreTheme: LocalizedText;
  targetVocabulary: string[];
  targetSentencePatterns: string[];
  targetGrammarPoints: string[];
  pronunciationFocus: string[];
  scenarioOutput: LocalizedText;
  speakingOutput: LocalizedText;
  writingOutput?: LocalizedText;
  estimatedTimeMinutes: number;
  prerequisites: string[];
  nextLessonId: string | null;
  methodTargets: LessonPlanMethodTargets;
};
