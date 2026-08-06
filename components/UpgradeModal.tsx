"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pricingPositioningNote } from "@/data/pricingPlans";
import {
  authChangedEvent,
  getCachedUser,
  getCurrentUser,
  isReviewerLoginEnabled,
  signInAsReviewer,
  signInWithGoogle,
  subscribeToAuth,
  type AuthUser,
} from "@/lib/auth";
import { accessLevelChangedEvent, canAccessLevel, getCachedEntitledUnlockedLevels, getVerifiedEntitlement, type UserUnlockedLevels } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CourseLevel } from "@/types/course";

type UpgradeModalProps = {
  open: boolean;
  lockedLevel?: CourseLevel;
  continueHref?: string;
  onClose: () => void;
};

export function UpgradeModal({ open, lockedLevel, continueHref, onClose }: UpgradeModalProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessLevel, setAccessLevel] = useState<UserUnlockedLevels>([]);
  const [accessReady, setAccessReady] = useState(false);
  const [entitledUserId, setEntitledUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getCachedUser());
    void getCurrentUser().then(setUser);
    const unsubscribe = subscribeToAuth(setUser);
    const syncUser = () => {
      void getCurrentUser().then(setUser);
    };
    window.addEventListener(authChangedEvent, syncUser);
    return () => {
      unsubscribe();
      window.removeEventListener(authChangedEvent, syncUser);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncAccess = (forceRefresh = false) => {
      const cachedUser = getCachedUser();
      const cachedLevels = getCachedEntitledUnlockedLevels(cachedUser?.id);
      if (cachedLevels && !forceRefresh) {
        setAccessLevel(cachedLevels);
        setEntitledUserId(cachedUser?.id ?? null);
        setAccessReady(true);
        return;
      }

      setAccessReady(false);
      void getVerifiedEntitlement({ forceRefresh })
        .then((entitlement) => {
          if (cancelled) return;
          setAccessLevel(entitlement.unlockedLevels);
          setEntitledUserId(entitlement.userId);
          setAccessReady(true);
        })
        .catch(() => {
          if (!cancelled) setAccessReady(false);
        });
    };
    syncAccess();
    const refreshAccess = () => syncAccess(true);
    const reuseAccess = () => syncAccess(false);
    window.addEventListener(accessLevelChangedEvent, refreshAccess);
    window.addEventListener("storage", reuseAccess);
    return () => {
      cancelled = true;
      window.removeEventListener(accessLevelChangedEvent, refreshAccess);
      window.removeEventListener("storage", reuseAccess);
    };
  }, []);

  if (!open) return null;

  if (!accessReady) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-soft">
          <p className="text-sm font-black tracking-[0.16em] text-pop">
            {language === "zh" ? "正在确认课程权益" : "Checking course access"}
          </p>
          <p className="mt-3 font-bold leading-7 text-ocean/70">
            {language === "zh" ? "确认完成前不会显示锁定状态。" : "The course will not be shown as locked until access is confirmed."}
          </p>
        </div>
      </div>
    );
  }

  const reviewerLoginActive = isReviewerLoginEnabled && !isSupabaseConfigured;
  const accessUnlocked = lockedLevel
    ? canAccessLevel(lockedLevel, accessLevel, Boolean(entitledUserId || user))
    : accessLevel.length > 0;

  const handleLogin = async () => {
    setError("");
    try {
      const { error: signInError } = reviewerLoginActive ? await signInAsReviewer() : await signInWithGoogle();
      if (signInError) setError(signInError.message);
      else if (reviewerLoginActive) onClose();
    } catch (err) {
      setError(language === "zh" ? "登录暂时不可用，请稍后再试。" : "Sign-in is temporarily unavailable. Please try again later.");
    }
  };

  const handleContinue = () => {
    onClose();
    if (continueHref) router.push(continueHref);
  };

  if (accessUnlocked) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-pop">
                {reviewerLoginActive
                  ? language === "zh"
                    ? "开始体验"
                    : "Start your preview"
                  : language === "zh"
                    ? "已解锁全部内容"
                    : "All content unlocked"}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-ink">
                {language === "zh" ? "已解锁，可继续学习" : "Unlocked. Continue learning."}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ocean transition hover:bg-peach"
              aria-label={language === "zh" ? "关闭" : "Close"}
            >
              <X size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="mt-5 w-full rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean"
          >
            {language === "zh" ? "继续学习" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-[30px] bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-pop">
              {lockedLevel ? `${lockedLevel} ${language === "zh" ? "已锁定" : "locked"}` : language === "zh" ? "升级解锁" : "Upgrade access"}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink">
              {language === "zh"
                ? `${lockedLevel ?? "A1/A2/B1"} 需要登录和付费权益`
                : `${lockedLevel ?? "A1/A2/B1"} requires login and paid access`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ocean transition hover:bg-peach"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-[24px] bg-slate-50 p-4 ring-1 ring-blue-100">
          <p className="font-black leading-7 text-ocean">
            {language === "zh"
              ? "登录后可保存进度。A1/A2/B1 购买后会绑定到你的账户。"
              : "Sign in to save progress. A1/A2/B1 purchases are attached to your account."}
          </p>
          <p className="rounded-2xl bg-peach p-3 text-sm font-black leading-6 text-ocean">{pricingPositioningNote[language]}</p>
        </div>

        <div className="mt-5 rounded-[24px] bg-skywash p-4 ring-1 ring-blue-100">
          {user ? (
            <p className="font-black leading-7 text-ocean">
              {language === "zh" ? "已登录：" : "Signed in: "}
              <span className="text-ink">{user.email}</span>
            </p>
          ) : (
            <div className="grid gap-3">
              <p className="font-black text-ocean">
                {reviewerLoginActive
                  ? language === "zh"
                    ? "体验账号可先查看已开放课程内容。"
                    : "Preview access lets you explore available course content."
                  : language === "zh"
                    ? "购买后课程会绑定到账户。"
                    : "Purchases attach course access to your account."}
              </p>
              {error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{error}</p> : null}
              <button
                type="button"
                onClick={handleLogin}
                disabled={!isSupabaseConfigured && !reviewerLoginActive}
                className="rounded-full bg-ink px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-ocean/30"
              >
                {reviewerLoginActive ? (language === "zh" ? "体验登录" : "Preview sign in") : language === "zh" ? "用 Google 登录" : "Continue with Google"}
              </button>
            </div>
          )}
        </div>

        {user ? (
          <div className="mt-5 grid gap-3">
            {reviewerLoginActive ? (
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-[20px] bg-ink px-4 py-4 text-center text-sm font-black text-white transition hover:bg-ocean"
              >
                {language === "zh" ? "继续学习" : "Continue learning"}
              </button>
            ) : (
              <a href="/pricing" className="rounded-[20px] bg-ink px-4 py-4 text-center text-sm font-black text-white transition hover:bg-ocean">
                {language === "zh" ? "查看付费包" : "View paid packs"}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
