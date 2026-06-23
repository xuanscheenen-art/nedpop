"use client";

import { LogOut, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  authChangedEvent,
  getCachedUser,
  getCurrentUser,
  isReviewerLoginEnabled,
  signInAsReviewer,
  signInWithGoogle,
  signOut,
  subscribeToAuth,
  type AuthUser,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

type LoginButtonProps = {
  compact?: boolean;
};

export function LoginButton({ compact = false }: LoginButtonProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const reviewerLoginActive = isReviewerLoginEnabled && !isSupabaseConfigured;

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

  const login = async () => {
    setError("");
    try {
      const { error: signInError } = reviewerLoginActive ? await signInAsReviewer() : await signInWithGoogle();
      if (signInError) setError(signInError.message);
      else setOpen(false);
    } catch (err) {
      setError(language === "zh" ? "登录暂时不可用，请稍后再试。" : "Sign-in is temporarily unavailable. Please try again later.");
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  if (user) {
    if (compact) {
      const userLabel = user.email;

      return (
        <div className="flex items-center gap-1">
          <span
            className="inline-flex size-10 items-center justify-center rounded-full bg-mint text-ocean ring-1 ring-emerald-100"
            title={userLabel}
            aria-label={userLabel}
          >
            <UserRound size={16} />
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-ocean transition hover:bg-peach"
            aria-label={language === "zh" ? "退出登录" : "Sign out"}
            title={language === "zh" ? "退出登录" : "Sign out"}
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-36 truncate rounded-full bg-mint px-3 py-2 text-xs font-black text-ocean ring-1 ring-emerald-100 sm:inline">
          {user.email}
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-ocean transition hover:bg-peach"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">{language === "zh" ? "退出" : "Sign out"}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${compact ? "size-10 justify-center px-0" : "gap-2 px-4"} inline-flex items-center rounded-full bg-peach py-2 text-sm font-bold text-ocean ring-1 ring-orange-100 transition hover:bg-orange-100`}
        aria-label={language === "zh" ? "登录" : "Sign in"}
      >
        <UserRound size={16} />
        {compact ? null : language === "zh" ? "登录" : "Sign in"}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.16em] text-pop">
                  {reviewerLoginActive ? (language === "zh" ? "体验账号" : "Preview access") : "Google OAuth"}
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-ink">
                  {language === "zh" ? "登录后可保存进度" : "Sign in to save progress"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ocean transition hover:bg-peach"
                aria-label={language === "zh" ? "关闭" : "Close"}
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 font-bold leading-7 text-ocean/70">
              {reviewerLoginActive
                ? language === "zh"
                  ? "使用体验账号可以先查看课程结构和已开放内容，当前设备上的学习进度也会保留。"
                  : "Use preview access to explore the course structure and available content. Progress stays on this device."
                : language === "zh"
                  ? "使用 Google 登录后，可以保存学习进度。A1/A2/B1 购买后会绑定到账户。"
                  : "Sign in with Google to save progress. A1/A2/B1 purchases are attached to your account."}
            </p>
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{error}</p> : null}
            <button
              type="button"
              onClick={login}
              disabled={!isSupabaseConfigured && !reviewerLoginActive}
              className="mt-5 w-full rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:bg-ocean/30"
            >
              {reviewerLoginActive ? (language === "zh" ? "体验登录" : "Preview sign in") : language === "zh" ? "用 Google 登录" : "Continue with Google"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
