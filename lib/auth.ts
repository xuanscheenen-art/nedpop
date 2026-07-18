import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export const authChangedEvent = "nedpop:auth-changed";

let cachedUser: AuthUser | null = null;

const reviewerAuthStorageKey = "nedpop.reviewerSignedIn";
const isProductionBuild = process.env.NODE_ENV === "production";
const authRequestTimeoutMs = 2500;

const withAuthTimeout = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => resolve(fallback), authRequestTimeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const reviewerAuthUser: AuthUser = {
  id: "reviewer-local",
  name: "NedPop Preview",
  email: "preview@nedpop.com",
};

export const isReviewerLoginEnabled =
  process.env.NEXT_PUBLIC_ENABLE_REVIEW_LOGIN === "true" && !isProductionBuild && !isSupabaseConfigured;

const getStoredReviewerUser = (): AuthUser | null => {
  if (typeof window === "undefined" || !isReviewerLoginEnabled) return null;
  try {
    return window.localStorage.getItem(reviewerAuthStorageKey) === "1" ? reviewerAuthUser : null;
  } catch {
    return null;
  }
};

const grantReviewerAccess = () => {
  if (typeof window === "undefined") return;
  let accessChanged = false;
  try {
    const nextUnlockedLevels = JSON.stringify(["A1", "A2", "B1"]);
    accessChanged =
      window.localStorage.getItem("nedpop.unlockedLevels") !== nextUnlockedLevels ||
      window.localStorage.getItem("nedpop.accessLevel") !== "bundle";
    if (accessChanged) {
      window.localStorage.setItem("nedpop.unlockedLevels", nextUnlockedLevels);
      window.localStorage.setItem("nedpop.accessLevel", "bundle");
    }
  } catch {
    // The reviewer identity still works for the current page session.
    accessChanged = false;
  }
  if (accessChanged) {
    window.dispatchEvent(new CustomEvent("nedpop:access-level-changed", { detail: { accessLevel: "bundle", unlockedLevels: ["A1", "A2", "B1"] } }));
  }
};

const toAuthUser = (user: User | null): AuthUser | null => {
  if (!user?.email) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
    avatarUrl: user.user_metadata?.avatar_url,
  };
};

const emitAuthChanged = (user: AuthUser | null) => {
  cachedUser = user;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(authChangedEvent, { detail: user }));
  }
};

export function getCachedUser() {
  return cachedUser ?? getStoredReviewerUser();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const reviewerUser = getStoredReviewerUser();
  if (reviewerUser) {
    grantReviewerAccess();
    cachedUser = reviewerUser;
    return reviewerUser;
  }

  if (!isSupabaseConfigured) return null;
  const supabase = getSupabaseBrowserClient();
  const response = await withAuthTimeout(supabase.auth.getUser().catch(() => null), null);
  if (!response) return cachedUser;
  const { data, error } = response;
  if (error) {
    cachedUser = null;
    return null;
  }
  const user = toAuthUser(data.user);
  cachedUser = user;
  return user;
}

export async function signInWithGoogle(next = "/dashboard") {
  if (!isSupabaseConfigured) {
    throw new Error("Sign-in is temporarily unavailable.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
}

export async function signInAsReviewer() {
  if (!isReviewerLoginEnabled || typeof window === "undefined") {
    throw new Error("Preview sign-in is not enabled.");
  }

  window.localStorage.setItem(reviewerAuthStorageKey, "1");
  grantReviewerAccess();
  emitAuthChanged(reviewerAuthUser);
  return { error: null };
}

export async function signOut() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(reviewerAuthStorageKey);
    window.localStorage.removeItem("nedpop.unlockedLevels");
    window.localStorage.removeItem("nedpop.accessLevel");
    window.dispatchEvent(new CustomEvent("nedpop:access-level-changed", { detail: { accessLevel: "free", unlockedLevels: [] } }));
  }

  if (!isSupabaseConfigured) {
    emitAuthChanged(null);
    return;
  }
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
  emitAuthChanged(null);
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseConfigured) return () => undefined;
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = toAuthUser(session?.user ?? null);
    emitAuthChanged(user);
    callback(user);
  });
  return () => data.subscription.unsubscribe();
}
