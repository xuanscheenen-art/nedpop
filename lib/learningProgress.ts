"use client";

export type LearningLevel = "A0" | "A1" | "A2" | "B1";

export type LearningStep =
  | "pronunciation"
  | "starter-words"
  | "grammar"
  | "lesson"
  | "word-bubbles"
  | "grammar-on-demand"
  | "practice"
  | "scenario-output"
  | "review"
  | "complete";

export type CompletedStepsByDay = Partial<Record<LearningLevel, Record<string, LearningStep[]>>>;

export type LearningProgress = {
  pronunciationBaseCompleted: boolean;
  starterWordsCompleted: boolean;
  grammarBaseCompleted: boolean;
  currentLevel: LearningLevel;
  currentDay: number;
  currentStep: LearningStep;
  completedStepsByDay: CompletedStepsByDay;
  lastVisitedRoute: string;
};

export const learningProgressStorageKey = "nedpop.learningProgress";
export const learningProgressChangedEvent = "nedpop.learningProgressChanged";
export const learningRouteContextStorageKey = "nedpop.learningRouteContext";
export const learningRouteContextChangedEvent = "nedpop.learningRouteContextChanged";

export type LearningRouteContext = {
  page: "word-link" | "scenarios" | "lesson";
  level: LearningLevel;
  day: number;
};

const learningLevels = ["A0", "A1", "A2", "B1"] as const;
const learningSteps: LearningStep[] = [
  "pronunciation",
  "starter-words",
  "grammar",
  "lesson",
  "word-bubbles",
  "grammar-on-demand",
  "practice",
  "scenario-output",
  "review",
  "complete",
];

const defaultProgress: LearningProgress = {
  pronunciationBaseCompleted: false,
  starterWordsCompleted: false,
  grammarBaseCompleted: false,
  currentLevel: "A0",
  currentDay: 1,
  currentStep: "pronunciation",
  completedStepsByDay: {},
  lastVisitedRoute: "/",
};

export function getDefaultLearningProgress(): LearningProgress {
  return {
    ...defaultProgress,
    completedStepsByDay: {},
  };
}

const isLearningLevel = (value: unknown): value is LearningLevel =>
  typeof value === "string" && (learningLevels as readonly string[]).includes(value);

const isLearningStep = (value: unknown): value is LearningStep =>
  typeof value === "string" && learningSteps.includes(value as LearningStep);

const normalizeDay = (day: unknown) => {
  const numeric = typeof day === "number" ? day : Number(day);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
};

const nextStepAfter = (step: LearningStep): LearningStep => {
  if (step === "pronunciation") return "starter-words";
  if (step === "starter-words") return "grammar";
  if (step === "grammar") return "lesson";
  if (step === "lesson") return "word-bubbles";
  if (step === "word-bubbles") return "grammar-on-demand";
  if (step === "grammar-on-demand") return "practice";
  if (step === "practice") return "scenario-output";
  if (step === "scenario-output") return "complete";
  if (step === "review") return "complete";
  return step;
};

const sanitizeProgress = (value: unknown): LearningProgress => {
  if (!value || typeof value !== "object") return getDefaultLearningProgress();
  const record = value as Partial<LearningProgress>;
  return {
    pronunciationBaseCompleted: Boolean(record.pronunciationBaseCompleted),
    starterWordsCompleted: Boolean(record.starterWordsCompleted),
    grammarBaseCompleted: Boolean(record.grammarBaseCompleted),
    currentLevel: isLearningLevel(record.currentLevel) ? record.currentLevel : defaultProgress.currentLevel,
    currentDay: normalizeDay(record.currentDay),
    currentStep: isLearningStep(record.currentStep) ? record.currentStep : defaultProgress.currentStep,
    completedStepsByDay: record.completedStepsByDay && typeof record.completedStepsByDay === "object" ? record.completedStepsByDay : {},
    lastVisitedRoute: typeof record.lastVisitedRoute === "string" ? record.lastVisitedRoute : defaultProgress.lastVisitedRoute,
  };
};

const emitProgressChange = (progress: LearningProgress) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(learningProgressChangedEvent, { detail: progress }));
};

const sanitizeRouteContext = (value: unknown): LearningRouteContext | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<LearningRouteContext>;
  if (record.page !== "word-link" && record.page !== "scenarios" && record.page !== "lesson") return null;
  if (!isLearningLevel(record.level)) return null;
  return {
    page: record.page,
    level: record.level,
    day: normalizeDay(record.day),
  };
};

export function getLearningRouteContext(): LearningRouteContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(learningRouteContextStorageKey);
    return sanitizeRouteContext(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
}

export function setLearningRouteContext(context: LearningRouteContext): LearningRouteContext | null {
  const next = sanitizeRouteContext(context);
  if (!next || typeof window === "undefined") return next;
  window.sessionStorage.setItem(learningRouteContextStorageKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(learningRouteContextChangedEvent, { detail: next }));
  return next;
}

export function getLearningProgress(): LearningProgress {
  if (typeof window === "undefined") return getDefaultLearningProgress();
  try {
    const raw = window.localStorage.getItem(learningProgressStorageKey);
    return sanitizeProgress(raw ? JSON.parse(raw) : getDefaultLearningProgress());
  } catch {
    return getDefaultLearningProgress();
  }
}

export function updateLearningProgress(patch: Partial<LearningProgress>): LearningProgress {
  const current = getLearningProgress();
  const next = sanitizeProgress({ ...current, ...patch });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(learningProgressStorageKey, JSON.stringify(next));
    emitProgressChange(next);
  }
  return next;
}

type MarkStepCompleteOptions = {
  advanceCurrent?: boolean;
};

export function markStepComplete(
  level: string,
  day: number,
  step: LearningStep,
  options: MarkStepCompleteOptions = {},
): LearningProgress {
  const current = getLearningProgress();
  const nextStep = nextStepAfter(step);
  const advanceCurrent = options.advanceCurrent ?? true;
  if (!isLearningLevel(level)) {
    return advanceCurrent ? updateLearningProgress({ currentStep: nextStep }) : current;
  }

  const key = String(normalizeDay(day));
  const levelSteps = current.completedStepsByDay[level] ?? {};
  const daySteps = levelSteps[key] ?? [];
  const nextDaySteps = daySteps.includes(step) ? daySteps : [...daySteps, step];

  return updateLearningProgress({
    ...(advanceCurrent
      ? {
          currentLevel: level,
          currentDay: normalizeDay(day),
          currentStep: nextStep,
        }
      : {}),
    completedStepsByDay: {
      ...current.completedStepsByDay,
      [level]: {
        ...levelSteps,
        [key]: nextDaySteps,
      },
    },
  });
}

export function getCurrentStep(): LearningStep {
  return getLearningProgress().currentStep;
}

export function resetLearningProgress(): LearningProgress {
  const next = getDefaultLearningProgress();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(learningProgressStorageKey);
    emitProgressChange(next);
  }
  return next;
}
