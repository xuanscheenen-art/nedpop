"use client";

import {
  BrainCircuit,
  Check,
  CreditCard,
  LockKeyhole,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { pricingPlans, type PricingPlanId } from "@/data/pricingPlans";
import { authChangedEvent, getCachedUser, getCurrentUser, signInWithGoogle, subscribeToAuth, type AuthUser } from "@/lib/auth";
import { type UserAccess } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";

type PricingSectionProps = {
  compact?: boolean;
  onSelectPlan?: (level: UserAccess) => void;
};

type CheckoutStartResult = "redirecting" | "sign-in-required" | "failed";

export function PricingSection({ compact = false, onSelectPlan }: PricingSectionProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("");
  const autoCheckoutStarted = useRef(false);
  const paymentMethodLabel = language === "zh"
    ? "Stripe 安全结账，实际可用方式以付款页为准"
    : "Secure Stripe Checkout; available methods are shown at checkout";
  const paymentMethods = language === "zh"
    ? ["银行卡", "Apple Pay", "Google Pay", "支付宝", "微信支付"]
    : ["Cards", "Apple Pay", "Google Pay", "Alipay", "WeChat Pay"];
  const learningLoop = [
    {
      icon: Volume2,
      zh: "听懂发音",
      en: "Decode sounds",
    },
    {
      icon: BrainCircuit,
      zh: "记住单词",
      en: "Remember words",
    },
    {
      icon: Sparkles,
      zh: "按需学语法",
      en: "Use grammar",
    },
    {
      icon: MessagesSquare,
      zh: "完成生活任务",
      en: "Handle real tasks",
    },
    {
      icon: RefreshCcw,
      zh: "回到复习池",
      en: "Review again",
    },
  ];

  const startStripeCheckout = useCallback(async (planId: PricingPlanId): Promise<CheckoutStartResult> => {
    const plan = pricingPlans.find((item) => item.id === planId);
    if (!plan || plan.id === "a0-free") return "failed";

    setStatus(language === "zh" ? "正在打开 Stripe 付款页..." : "Opening Stripe Checkout...");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await response.json() as { sessionId?: string; url?: string; error?: string };
      if (response.status === 401) {
        return "sign-in-required";
      }
      if (!response.ok || !data.url) {
        setStatus(data.error ?? (language === "zh" ? "无法创建付款页。" : "Could not create Checkout session."));
        return "failed";
      }
      window.location.assign(data.url);
      return "redirecting";
    } catch (err) {
      setStatus(err instanceof Error ? err.message : (language === "zh" ? "付款入口暂不可用。" : "Checkout is not available."));
      return "failed";
    }
  }, [language]);

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
    if (!user || autoCheckoutStarted.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const planId = params.get("checkout") as PricingPlanId | null;
    const plan = pricingPlans.find((item) => item.id === planId);
    if (!plan || plan.id === "a0-free") return;

    autoCheckoutStarted.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    void startStripeCheckout(plan.id);
  }, [startStripeCheckout, user]);

  const selectPlan = async (level: UserAccess) => {
    setStatus("");
    if (level === "free") {
      if (typeof window !== "undefined") window.location.assign("/dashboard");
      onSelectPlan?.(level);
      return;
    }

    const plan = pricingPlans.find((item) => item.accessLevel === level);
    if (!plan || plan.id === "a0-free") return;

    const checkoutResult = await startStripeCheckout(plan.id);
    if (checkoutResult === "sign-in-required") {
      try {
        setStatus(language === "zh" ? "正在进入安全购买流程..." : "Starting secure purchase...");
        const { error } = await signInWithGoogle(`/pricing?checkout=${plan.id}`);
        if (error) setStatus(error.message);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : (language === "zh" ? "登录服务暂时不可用，请稍后再试。" : "Sign-in is temporarily unavailable. Please try again later."));
      }
    }
    onSelectPlan?.(level);
  };

  return (
    <section className={compact ? "" : "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"}>
      <div>
        <div>
          <p className="text-sm font-black tracking-[0.16em] text-pop">
            {language === "zh" ? "一次购买 · 按级别解锁" : "One-time purchase · Unlock by level"}
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-ink">
            {language === "zh" ? "从听懂，到能在荷兰生活里真正开口" : "From decoding Dutch to using it in real life"}
          </h2>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
            {language === "zh"
              ? "为中文母语者设计的荷兰语学习系统。A0 免费开始；付费课程一次购买、不自动续费，权益绑定你的账户。"
              : "A Dutch learning system designed for Chinese speakers. Start A0 for free; paid courses are one-time purchases with no automatic renewal."}
          </p>
        </div>
      </div>
      <div className="mt-8 border-y border-blue-100 py-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {learningLoop.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.zh} className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-peach text-pop">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-pop">{String(index + 1).padStart(2, "0")}</p>
                  <p className="text-sm font-black leading-5 text-ink">{language === "zh" ? step.zh : step.en}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {status ? <p className="mt-5 rounded-2xl bg-skywash p-4 text-sm font-black leading-6 text-ocean ring-1 ring-blue-100">{status}</p> : null}
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {pricingPlans.map((plan) => {
          const paid = plan.accessLevel !== "free";
          const highlighted = plan.id === "bundle";
          return (
            <article
              key={plan.id}
              className={`flex min-h-[420px] flex-col rounded-[28px] border p-5 shadow-sm ${
                highlighted ? "border-orange-200 bg-ink text-white" : "border-blue-100 bg-white text-ink"
              }`}
            >
              <div className="flex min-h-9 items-start justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black ${highlighted ? "bg-pop text-ink" : "bg-skywash text-ocean"}`}>
                  {highlighted
                    ? language === "zh"
                      ? "最推荐 · Early Access"
                      : "Best value · Early Access"
                    : plan.badge ?? (paid ? (language === "zh" ? "付费包" : "Paid") : (language === "zh" ? "免费" : "Free"))}
                </span>
                {paid ? <LockKeyhole size={18} className={highlighted ? "text-orange-200" : "text-pop"} /> : <Sparkles size={18} className="text-pop" />}
              </div>
              <h3 className="mt-5 text-2xl font-black leading-tight">{language === "zh" ? plan.nameZh : plan.nameEn}</h3>
              {highlighted ? (
                <p className="mt-4 text-sm font-black text-blue-100 line-through">
                  {language === "zh" ? "单买合计 €97" : "€97 when purchased separately"}
                </p>
              ) : null}
              <p className={`mt-4 text-5xl font-black ${highlighted ? "text-white" : "text-ink"}`}>{plan.price}</p>
              {highlighted ? (
                <p className="mt-2 text-sm font-black text-orange-200">
                  {language === "zh" ? "现在省 €38，三个级别全部解锁" : "Save €38 and unlock all three levels"}
                </p>
              ) : null}
              <p className={`mt-3 text-sm font-bold leading-6 ${highlighted ? "text-blue-50" : "text-ocean/65"}`}>
                {plan.loginRequired
                  ? user
                    ? language === "zh"
                      ? "一次购买，不自动续费；自动绑定当前账户。"
                      : "One-time purchase with no auto-renewal; attached to your account."
                    : language === "zh"
                      ? "一次购买，不自动续费；登录后绑定账户。"
                      : "One-time purchase with no auto-renewal; sign in to attach access."
                  : language === "zh"
                    ? "无需登录即可开始。"
                    : "Start without login."}
              </p>
              <ul className="mt-5 grid flex-1 gap-3">
                {plan.features.map((feature) => (
                  <li key={feature.zh} className="flex gap-2 text-sm font-bold leading-6">
                    <Check size={16} className={highlighted ? "mt-1 shrink-0 text-orange-200" : "mt-1 shrink-0 text-pop"} />
                    <span className={highlighted ? "text-blue-50" : "text-ocean/75"}>{feature[language]}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => selectPlan(plan.accessLevel)}
                className={`mt-6 rounded-full px-4 py-3 text-sm font-black transition ${
                  highlighted ? "bg-pop text-ink hover:bg-orange-300" : paid ? "bg-ink text-white hover:bg-ocean" : "bg-skywash text-ocean hover:bg-peach"
                }`}
              >
                {paid
                  ? language === "zh"
                    ? plan.id === "bundle"
                      ? "购买全能包"
                      : `购买 ${plan.unlocks[0]}`
                    : plan.id === "bundle"
                      ? "Buy complete pack"
                      : `Buy ${plan.unlocks[0]}`
                  : language === "zh"
                    ? "开始 A0"
                    : "Start A0"}
              </button>
            </article>
          );
        })}
      </div>
      <div className="mt-7 flex flex-col gap-4 border-t border-blue-100 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck size={21} className="mt-0.5 shrink-0 text-pop" aria-hidden="true" />
          <div>
            <p className="text-sm font-black text-ink">
              {language === "zh" ? "价格清楚，权益跟随账户" : "Clear pricing, account-based access"}
            </p>
            <p className="mt-1 max-w-2xl text-sm font-bold leading-6 text-ocean/65">
              {language === "zh"
                ? "没有订阅和自动续费。付款前可查看使用条款与退款说明。"
                : "No subscription or automatic renewal. Review the terms and refund policy before purchase."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-black text-ocean">
          <a href="/terms" className="underline decoration-blue-200 underline-offset-4 hover:text-pop">
            {language === "zh" ? "使用条款" : "Terms"}
          </a>
          <a href="/refund" className="underline decoration-blue-200 underline-offset-4 hover:text-pop">
            {language === "zh" ? "退款说明" : "Refund policy"}
          </a>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-black leading-6 text-ocean/65">
        <CreditCard size={17} className="text-pop" aria-hidden="true" />
        <span>{paymentMethodLabel}</span>
        {paymentMethods.map((method) => (
          <span key={method} className="rounded-full bg-skywash px-3 py-1 text-ocean">
            {method}
          </span>
        ))}
      </div>
    </section>
  );
}
