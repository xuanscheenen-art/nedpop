import {
  accessPlanFromUnlockedLevels,
  canAccessLevel as canAccessLevelForSubject,
  mergeUnlockedLevels,
  normalizeUnlockedLevels,
  planToUnlockedLevels,
  type AccessPlan,
  type UnlockableLevel,
} from "@/lib/access-control";
import { getCachedUser } from "@/lib/auth";
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
const verifiedUnlockedLevelsByUser = new Map<string, UserUnlockedLevels>();
const entitlementRequestsByUser = new Map<string, Promise<UserUnlockedLevels>>();
const isProductionBuild = process.env.NODE_ENV === "production";
const localFallbackRequested =
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_REVIEW_LOGIN === "true";
const entitlementRequestTimeoutMs = 2500;

const withEntitlementTimeout = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => resolve(fallback), entitlementRequestTimeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

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

export function getCachedEntitledUnlockedLevels(userId: string | null | undefined): UserUnlockedLevels | null {
  if (!userId) return null;
  const levels = verifiedUnlockedLevelsByUser.get(userId);
  return levels ? [...levels] : null;
}

export function cacheEntitledUnlockedLevels(userId: string, levels: UserUnlockedLevels) {
  verifiedUnlockedLevelsByUser.set(userId, normalizeUnlockedLevels(levels));
}

export type VerifiedEntitlement = {
  userId: string | null;
  unlockedLevels: UserUnlockedLevels;
};

type EntitlementOptions = {
  forceRefresh?: boolean;
};

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

async function queryEntitledUnlockedLevels(userId: string): Promise<UserUnlockedLevels> {
  const cachedRequest = entitlementRequestsByUser.get(userId);
  if (cachedRequest) return cachedRequest;

  const request = (async () => {
    const supabase = getSupabaseBrowserClient();
    const entitlementResponse = await withEntitlementTimeout(
      Promise.resolve(
        supabase
          .from("users")
          .select("unlocked_levels")
          .eq("id", userId)
          .maybeSingle(),
      ).catch(() => null),
      null,
    );
    if (!entitlementResponse) throw new Error("ENTITLEMENT_REQUEST_TIMEOUT");

    const { data, error } = entitlementResponse;
    if (error) throw error;

    const levels = normalizeUnlockedLevels(data?.unlocked_levels);
    cacheEntitledUnlockedLevels(userId, levels);
    return [...levels];
  })();

  entitlementRequestsByUser.set(userId, request);
  try {
    return await request;
  } finally {
    if (entitlementRequestsByUser.get(userId) === request) {
      entitlementRequestsByUser.delete(userId);
    }
  }
}

export async function getVerifiedEntitlement(options: EntitlementOptions = {}): Promise<VerifiedEntitlement> {
  const localFallback = isLocalEntitlementFallbackEnabled ? getUnlockedLevels() : [];
  if (!isSupabaseConfigured) {
    const localUser = getCachedUser();
    return { userId: localUser?.id ?? null, unlockedLevels: localFallback };
  }

  const cachedUser = getCachedUser();
  if (cachedUser) {
    const cachedLevels = getCachedEntitledUnlockedLevels(cachedUser.id);
    if (cachedLevels && !options.forceRefresh) {
      return { userId: cachedUser.id, unlockedLevels: cachedLevels };
    }
    return {
      userId: cachedUser.id,
      unlockedLevels: mergeUnlockedLevels(localFallback, await queryEntitledUnlockedLevels(cachedUser.id)),
    };
  }

  const supabase = getSupabaseBrowserClient();
  const userResponse = await withEntitlementTimeout(supabase.auth.getUser().catch(() => null), null);
  if (!userResponse) throw new Error("AUTH_REQUEST_TIMEOUT");
  const { data: userData, error: userError } = userResponse;
  if (userError) throw userError;

  const user = userData.user;
  if (!user) return { userId: null, unlockedLevels: localFallback };

  const cachedLevels = getCachedEntitledUnlockedLevels(user.id);
  if (cachedLevels && !options.forceRefresh) {
    return { userId: user.id, unlockedLevels: cachedLevels };
  }
  return {
    userId: user.id,
    unlockedLevels: mergeUnlockedLevels(localFallback, await queryEntitledUnlockedLevels(user.id)),
  };
}

export async function getEntitledUnlockedLevels(options: EntitlementOptions = {}): Promise<UserUnlockedLevels> {
  const localFallback = isLocalEntitlementFallbackEnabled ? getUnlockedLevels() : [];
  try {
    return (await getVerifiedEntitlement(options)).unlockedLevels;
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
  const hasLocalPreviewAccess = isLocalEntitlementFallbackEnabled && unlockedLevels.length > 0;
  return canAccessLevelForSubject(level, { signedIn: signedIn || hasLocalPreviewAccess, unlockedLevels });
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
