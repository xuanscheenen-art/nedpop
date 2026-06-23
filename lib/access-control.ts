import type { CourseLevel } from "@/types/course";
import type { WordItem } from "@/types/vocabulary";

export type PaidCourseLevel = Exclude<CourseLevel, "A0">;
export type UnlockableLevel = PaidCourseLevel;
export type AccessPlan = "free" | "a1" | "a2" | "b1" | "bundle";
export type ProtectedModule = "course" | "word_bubble" | "scenario";
export type PublicModule = "pronunciation" | "grammar" | "exam_practice" | "word_review";
export type TargetModule = ProtectedModule | PublicModule;

export type AccessSubject = {
  signedIn: boolean;
  unlockedLevels: UnlockableLevel[];
};

export type AccessDecision =
  | {
      allowed: true;
      reason: "public-module" | "free-level" | "paid-level-unlocked";
    }
  | {
      allowed: false;
      reason: "login-required";
      requiredLevel?: UnlockableLevel;
    }
  | {
      allowed: false;
      reason: "entitlement-required";
      requiredLevel: UnlockableLevel;
    };

export const paidCourseLevels: UnlockableLevel[] = ["A1", "A2", "B1"];
export const publicModules: PublicModule[] = ["pronunciation", "grammar", "exam_practice", "word_review"];
export const protectedModules: ProtectedModule[] = ["course", "word_bubble", "scenario"];
export const loginRequiredFreeModules: PublicModule[] = ["word_review"];

const planUnlocks: Record<AccessPlan, UnlockableLevel[]> = {
  free: [],
  a1: ["A1"],
  a2: ["A2"],
  b1: ["B1"],
  bundle: ["A1", "A2", "B1"],
};

export function isCourseLevel(value: string | null | undefined): value is CourseLevel {
  return value === "A0" || value === "A1" || value === "A2" || value === "B1";
}

export function isUnlockableLevel(value: string | null | undefined): value is UnlockableLevel {
  return value === "A1" || value === "A2" || value === "B1";
}

export function isProtectedModule(value: string | null | undefined): value is ProtectedModule {
  return value === "course" || value === "word_bubble" || value === "scenario";
}

export function isPublicModule(value: string | null | undefined): value is PublicModule {
  return value === "pronunciation" || value === "grammar" || value === "exam_practice" || value === "word_review";
}

export function isTargetModule(value: string | null | undefined): value is TargetModule {
  return isProtectedModule(value) || isPublicModule(value);
}

export function planToUnlockedLevels(plan: AccessPlan): UnlockableLevel[] {
  return [...planUnlocks[plan]];
}

export function normalizeUnlockedLevels(input: unknown): UnlockableLevel[] {
  if (!Array.isArray(input)) return [];

  return paidCourseLevels.filter((level) => input.includes(level));
}

export function mergeUnlockedLevels(...levelSets: Array<readonly UnlockableLevel[]>): UnlockableLevel[] {
  const merged = new Set<UnlockableLevel>();
  for (const levels of levelSets) {
    for (const level of levels) merged.add(level);
  }
  return paidCourseLevels.filter((level) => merged.has(level));
}

export function accessPlanFromUnlockedLevels(unlockedLevels: readonly UnlockableLevel[]): AccessPlan {
  const normalized = normalizeUnlockedLevels([...unlockedLevels]);
  const hasA1 = normalized.includes("A1");
  const hasA2 = normalized.includes("A2");
  const hasB1 = normalized.includes("B1");

  if (hasA1 && hasA2 && hasB1) return "bundle";
  if (hasB1 && !hasA1 && !hasA2) return "b1";
  if (hasA2 && !hasA1 && !hasB1) return "a2";
  if (hasA1 && !hasA2 && !hasB1) return "a1";
  if (!hasA1 && !hasA2 && !hasB1) return "free";
  return "bundle";
}

export function canAccessLevel(
  targetLevel: CourseLevel,
  subject: AccessSubject,
): boolean {
  if (targetLevel === "A0") return true;
  return subject.signedIn && subject.unlockedLevels.includes(targetLevel);
}

export function decideModuleAccess(params: {
  targetModule: TargetModule;
  targetLevel?: CourseLevel;
  subject: AccessSubject;
}): AccessDecision {
  const { targetModule, targetLevel = "A0", subject } = params;

  if (isPublicModule(targetModule)) {
    if (loginRequiredFreeModules.includes(targetModule) && !subject.signedIn) {
      return { allowed: false, reason: "login-required" };
    }
    return { allowed: true, reason: "public-module" };
  }

  if (targetLevel === "A0") {
    return { allowed: true, reason: "free-level" };
  }

  if (!subject.signedIn) {
    return { allowed: false, reason: "login-required", requiredLevel: targetLevel };
  }

  if (!subject.unlockedLevels.includes(targetLevel)) {
    return { allowed: false, reason: "entitlement-required", requiredLevel: targetLevel };
  }

  return { allowed: true, reason: "paid-level-unlocked" };
}

export function allowedWordLevelsForSubject(subject: AccessSubject): CourseLevel[] {
  return ["A0", ...subject.unlockedLevels];
}

export function canAccessWordLevel(wordLevel: CourseLevel, subject: AccessSubject): boolean {
  return allowedWordLevelsForSubject(subject).includes(wordLevel);
}

export function hasPaidEntitlement(subject: AccessSubject): boolean {
  return subject.signedIn && subject.unlockedLevels.length > 0;
}

export function allowedReviewWordLevelsForSubject(subject: AccessSubject): CourseLevel[] {
  return hasPaidEntitlement(subject) ? ["A0", ...paidCourseLevels] : ["A0"];
}

export function canAccessReviewWordLevel(wordLevel: CourseLevel, subject: AccessSubject): boolean {
  return allowedReviewWordLevelsForSubject(subject).includes(wordLevel);
}

export function filterReviewWordsByAccess<T extends Pick<WordItem, "level">>(
  words: readonly T[],
  subject: AccessSubject,
): T[] {
  const allowedLevels = new Set(allowedReviewWordLevelsForSubject(subject));
  return words.filter((word) => allowedLevels.has(word.level));
}

export function filterWordsByAccess<T extends Pick<WordItem, "level">>(
  words: readonly T[],
  subject: AccessSubject,
): T[] {
  const allowedLevels = new Set(allowedWordLevelsForSubject(subject));
  return words.filter((word) => allowedLevels.has(word.level));
}
