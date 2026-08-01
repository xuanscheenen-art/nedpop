"use client";

import { LockKeyhole, LogOut, Mail, UserRound, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import {
  authChangedEvent,
  getCachedUser,
  getCurrentUser,
  isReviewerLoginEnabled,
  signInAsReviewer,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  signOut,
  subscribeToAuth,
  type AuthUser,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

type LoginButtonProps = {
  compact?: boolean;
};

type EmailAuthMode = "sign-in" | "sign-up";

export function LoginButton({ compact = false }: LoginButtonProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailAuthMode, setEmailAuthMode] = useState<EmailAuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setNotice("");
    try {
      const { error: signInError } = reviewerLoginActive ? await signInAsReviewer() : await signInWithGoogle();
      if (signInError) setError(signInError.message);
      else setOpen(false);
    } catch (err) {
      setError(language === "zh" ? "登录暂时不可用，请稍后再试。" : "Sign-in is temporarily unavailable. Please try again later.");
    }
  };

  const submitEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (emailAuthMode === "sign-in") {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
          setError(
            signInError.message === "Invalid login credentials"
              ? language === "zh"
                ? "邮箱或密码不正确。"
                : "The email or password is incorrect."
              : signInError.message,
          );
          return;
        }

        setOpen(false);
        setPassword("");
        return;
      }

      const { data, error: signUpError } = await signUpWithEmail(email, password);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        setOpen(false);
        setPassword("");
      } else {
        setNotice(
          language === "zh"
            ? "注册邮件已发送。请打开邮件中的链接确认账号，然后即可登录。"
            : "Check your inbox and confirm your email address, then sign in.",
        );
        setPassword("");
      }
    } catch {
      setError(
        language === "zh"
          ? "认证服务暂时不可用，请稍后再试。"
          : "Authentication is temporarily unavailable. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeEmailAuthMode = (mode: EmailAuthMode) => {
    setEmailAuthMode(mode);
    setError("");
    setNotice("");
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
                  {reviewerLoginActive ? (language === "zh" ? "体验账号" : "Preview access") : language === "zh" ? "NedPop 账号" : "NedPop account"}
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
                  ? "登录后可以保存学习进度，购买的 A1/A2/B1 课程也会绑定到账户。"
                  : "Sign in to save progress. Your A1/A2/B1 purchases are attached to your account."}
            </p>
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{error}</p> : null}
            {notice ? <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-black leading-6 text-emerald-800">{notice}</p> : null}

            {reviewerLoginActive ? (
              <button
                type="button"
                onClick={login}
                className="mt-5 w-full rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean"
              >
                {language === "zh" ? "体验登录" : "Preview sign in"}
              </button>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1" aria-label={language === "zh" ? "邮箱认证方式" : "Email authentication mode"}>
                  <button
                    type="button"
                    onClick={() => changeEmailAuthMode("sign-in")}
                    className={`rounded-md px-3 py-2 text-sm font-black transition ${emailAuthMode === "sign-in" ? "bg-white text-ink shadow-sm" : "text-ocean/60 hover:text-ocean"}`}
                  >
                    {language === "zh" ? "邮箱登录" : "Email sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeEmailAuthMode("sign-up")}
                    className={`rounded-md px-3 py-2 text-sm font-black transition ${emailAuthMode === "sign-up" ? "bg-white text-ink shadow-sm" : "text-ocean/60 hover:text-ocean"}`}
                  >
                    {language === "zh" ? "注册账号" : "Create account"}
                  </button>
                </div>

                <form className="mt-4 space-y-3" onSubmit={submitEmailAuth}>
                  <label className="block">
                    <span className="sr-only">{language === "zh" ? "邮箱" : "Email"}</span>
                    <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/10">
                      <Mail className="shrink-0 text-ocean/50" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        placeholder={language === "zh" ? "邮箱地址" : "Email address"}
                        className="min-w-0 flex-1 bg-transparent py-3 font-bold text-ink outline-none placeholder:text-ocean/35"
                      />
                    </span>
                  </label>
                  <label className="block">
                    <span className="sr-only">{language === "zh" ? "密码" : "Password"}</span>
                    <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/10">
                      <LockKeyhole className="shrink-0 text-ocean/50" size={18} />
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={emailAuthMode === "sign-up" ? "new-password" : "current-password"}
                        minLength={6}
                        required
                        placeholder={language === "zh" ? "密码（至少 6 位）" : "Password (6+ characters)"}
                        className="min-w-0 flex-1 bg-transparent py-3 font-bold text-ink outline-none placeholder:text-ocean/35"
                      />
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isSupabaseConfigured}
                    className="w-full rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:bg-ocean/30"
                  >
                    {isSubmitting
                      ? language === "zh"
                        ? "请稍等..."
                        : "Please wait..."
                      : emailAuthMode === "sign-in"
                        ? language === "zh"
                          ? "登录"
                          : "Sign in"
                        : language === "zh"
                          ? "创建账号"
                          : "Create account"}
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-black text-ocean/45">{language === "zh" ? "或者" : "OR"}</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={login}
                  disabled={!isSupabaseConfigured}
                  className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 font-black text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-ocean/30"
                >
                  {language === "zh" ? "用 Google 登录" : "Continue with Google"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
