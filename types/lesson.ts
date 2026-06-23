import type { CourseLevel, LocalizedText } from "@/types/course";

export type PracticeType = "match-word" | "choose-correct-phrase" | "fill-blank" | "sentence-builder" | "say-it-yourself";

export type AudioItem = {
  dutch: string;
  audioText: string;
  audioSrc: string;
};

export type CourseLessonGoal = {
  goal: LocalizedText;
  estimatedMinutes: number;
  canSayAfter: LocalizedText;
  purpose?: LocalizedText;
};

export type CourseLessonSoundHint = AudioItem & {
  sound: string;
  hint: LocalizedText;
};

export type CourseLessonTargetWord = AudioItem & {
  dutch: string;
  meaning: LocalizedText;
  pronunciationHint: LocalizedText;
  memoryHook?: LocalizedText;
  usageNote?: LocalizedText;
  baseForm?: string;
  formExamples?: string[];
  exampleSentence: {
    dutch: string;
    meaning: LocalizedText;
    audioText: string;
    audioSrc: string;
  };
};

export type CourseLessonSentencePattern = {
  dutchPattern: string;
  explanation: LocalizedText;
  examples: {
    dutch: string;
    meaning: LocalizedText;
    audioText: string;
    audioSrc: string;
  }[];
  commonMistake: LocalizedText;
};

export type CourseLessonMiniGrammar = {
  title: LocalizedText;
  explanation: LocalizedText;
  pattern: string;
  examples: AudioItem[];
};

export type CourseLessonDialogueLine = AudioItem & {
  speaker: string;
  meaning: LocalizedText;
};

export type CourseLessonPracticeItem = {
  id: string;
  type: PracticeType;
  prompt: LocalizedText;
  options?: string[];
  answer: string;
  audioText?: string;
  audioSrc?: string;
};

export type CourseLessonReview = {
  words: string[];
  sentencePatterns: string[];
  tinyOutput: LocalizedText;
};

export type CourseLessonMethodMap = {
  decode: LocalizedText;
  link: LocalizedText;
  rule: LocalizedText;
  speak: LocalizedText;
};

export type CourseLesson = {
  id: string;
  lessonPlanId: string;
  level: CourseLevel;
  order: number;
  title: LocalizedText;
  methodMap: CourseLessonMethodMap;
  lessonGoal: CourseLessonGoal;
  soundBase: {
    pronunciationHints: CourseLessonSoundHint[];
  };
  targetWords: CourseLessonTargetWord[];
  sentencePatterns: CourseLessonSentencePattern[];
  miniGrammar: CourseLessonMiniGrammar;
  listenAndRepeat: AudioItem[];
  microDialogue: CourseLessonDialogueLine[];
  practice: CourseLessonPracticeItem[];
  speakOutput: {
    task: LocalizedText;
    sampleAnswer: {
      dutch: string;
      meaning: LocalizedText;
      audioText: string;
      audioSrc: string;
    };
  };
  writingTask?: LocalizedText;
  review: CourseLessonReview;
  previousLessonId?: string;
  nextLessonId?: string;
};
