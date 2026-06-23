import {
  accessPlanFromUnlockedLevels,
  canAccessLevel as canAccessLevelForSubject,
  normalizeUnlockedLevels,
  planToUnlockedLevels,
  type AccessPlan,
  type UnlockableLevel,
} from "@/lib/access-control";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CourseLevel } from "@/types/course";
import type { CourseLesson } from "@/types/lesson";

export type UserAccess = AccessPlan;
export type UserUnlockedLevels = UnlockableLevel[];

export const accessLevelStorageKey = "nedpop.accessLevel";
export const unlockedLevelsStorageKey = "nedpop.unlockedLevels";
export const accessLevelChangedEvent = "nedpop:access-level-changed";

const accessLevels: UserAccess[] = ["free", "a1", "a2", "b1", "bundle"];
let memoryUnlockedLevels: UserUnlockedLevels = [];
const isProductionBuild = process.env.NODE_ENV === "production";
const localFallbackRequested =
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_REVIEW_LOGIN === "true";

export const isLocalEntitlementFallbackEnabled =
  localFallbackRequested && !isProductionBuild && !isSupabaseConfigured;

const isUserAccess = (value: string | null): value is UserAccess =>
  Boolean(value && accessLevels.includes(value as UserAccess));

function parseStoredUnlockedLevels(value: string | null): UserUnlockedLevels | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return normalizeUnlockedLevels(parsed);
  } catch {
    return null;
  }
}

function legacyAccessToUnlockedLevels(value: string | null): UserUnlockedLevels {
  return isUserAccess(value) ? planToUnlockedLevels(value) : [];
}

function getStoredUnlockedLevels(): UserUnlockedLevels {
  if (!isLocalEntitlementFallbackEnabled) return [];
  if (typeof window === "undefined") return memoryUnlockedLevels;
  try {
    const storedLevels = parseStoredUnlockedLevels(window.localStorage.getItem(unlockedLevelsStorageKey));
    if (storedLevels) {
      memoryUnlockedLevels = storedLevels;
      return memoryUnlockedLevels;
    }

    const legacyLevels = legacyAccessToUnlockedLevels(window.localStorage.getItem(accessLevelStorageKey));
    memoryUnlockedLevels = legacyLevels;
    if (legacyLevels.length) {
      window.localStorage.setItem(unlockedLevelsStorageKey, JSON.stringify(legacyLevels));
    }
    return memoryUnlockedLevels;
  } catch {
    return memoryUnlockedLevels;
  }
}

export function getUnlockedLevels(): UserUnlockedLevels {
  return getStoredUnlockedLevels();
}

export function getAccessLevel(): UserAccess {
  return accessPlanFromUnlockedLevels(getStoredUnlockedLevels());
}

export function setUnlockedLevels(levels: UserUnlockedLevels) {
  if (typeof window === "undefined") return;
  if (!isLocalEntitlementFallbackEnabled) {
    memoryUnlockedLevels = [];
    window.dispatchEvent(new CustomEvent(accessLevelChangedEvent, { detail: { accessLevel: "free", unlockedLevels: [] } }));
    return;
  }
  memoryUnlockedLevels = normalizeUnlockedLevels(levels);
  const accessLevel = accessPlanFromUnlockedLevels(memoryUnlockedLevels);
  try {
    window.localStorage.setItem(unlockedLevelsStorageKey, JSON.stringify(memoryUnlockedLevels));
    window.localStorage.setItem(accessLevelStorageKey, accessLevel);
  } catch {
    // Keep access state for this page session when browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(accessLevelChangedEvent, { detail: { accessLevel, unlockedLevels: memoryUnlockedLevels } }));
}

export function setAccessLevel(level: UserAccess) {
  setUnlockedLevels(planToUnlockedLevels(level));
}

export async function getEntitledUnlockedLevels(): Promise<UserUnlockedLevels> {
  const localFallback = isLocalEntitlementFallbackEnabled ? getUnlockedLevels() : [];
  if (!isSupabaseConfigured) return localFallback;

  try {
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from("users")
      .select("unlocked_levels")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return [];
    return normalizeUnlockedLevels(data?.unlocked_levels);
  } catch {
    return localFallback;
  }
}

export async function getEntitledAccessLevel(): Promise<UserAccess> {
  return accessPlanFromUnlockedLevels(await getEntitledUnlockedLevels());
}

export function canAccessLevel(
  level: CourseLevel,
  access: UserAccess | UserUnlockedLevels = getUnlockedLevels(),
  signedIn = false,
) {
  const unlockedLevels = Array.isArray(access) ? normalizeUnlockedLevels(access) : planToUnlockedLevels(access);
  return canAccessLevelForSubject(level, { signedIn, unlockedLevels });
}

export function canAccessLesson(
  lesson: Pick<CourseLesson, "level">,
  access: UserAccess | UserUnlockedLevels = getUnlockedLevels(),
  signedIn = false,
) {
  return canAccessLevel(lesson.level, access, signedIn);
}

export function isLessonLocked(
  lesson: Pick<CourseLesson, "level">,
  access: UserAccess | UserUnlockedLevels = getUnlockedLevels(),
  signedIn = false,
) {
  return !canAccessLesson(lesson, access, signedIn);
}
