"use client";

import { Check, CreditCard, LockKeyhole, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { pricingPlans, type PricingPlanId } from "@/data/pricingPlans";
import { authChangedEvent, getCachedUser, getCurrentUser, signInWithGoogle, subscribeToAuth, type AuthUser } from "@/lib/auth";
import { type UserAccess } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";

type PricingSectionProps = {
  compact?: boolean;
  onSelectPlan?: (level: UserAccess) => void;
};

export function PricingSection({ compact = false, onSelectPlan }: PricingSectionProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("");
  const autoCheckoutStarted = useRef(false);
  const paymentMethodLabel = language === "zh"
    ? "可在 Stripe 后台启用，具体以结账页实际显示为准："
    : "Enable in Stripe Dashboard; actual Checkout options may vary:";
  const paymentMethods = language === "zh"
    ? ["银行卡", "Apple Pay", "Google Pay", "支付宝", "微信支付"]
    : ["Cards", "Apple Pay", "Google Pay", "Alipay", "WeChat Pay"];

  const startStripeCheckout = useCallback(async (planId: PricingPlanId) => {
    const plan = pricingPlans.find((item) => item.id === planId);
    if (!plan || plan.id === "a0-free") return;

    setStatus(language === "zh" ? "正在打开 Stripe 付款页..." : "Opening Stripe Checkout...");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await response.json() as { sessionId?: string; url?: string; error?: string };
      if (!response.ok || !data.url) {
        setStatus(data.error ?? (language === "zh" ? "无法创建付款页。" : "Could not create Checkout session."));
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : (language === "zh" ? "付款入口暂不可用。" : "Checkout is not available."));
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

    if (!user) {
      try {
        setStatus(language === "zh" ? "正在进入安全购买流程..." : "Starting secure purchase...");
        const { error } = await signInWithGoogle(`/pricing?checkout=${plan.id}`);
        if (error) setStatus(error.message);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : (language === "zh" ? "登录服务暂时不可用，请稍后再试。" : "Sign-in is temporarily unavailable. Please try again later."));
      }
    } else {
      void startStripeCheckout(plan.id);
    }
    onSelectPlan?.(level);
  };

  return (
    <section className={compact ? "" : "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"}>
      <div>
        <div>
          <p className="text-sm font-black tracking-[0.16em] text-pop">
            {language === "zh" ? "价格和解锁" : "Pricing and access"}
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-ink">
            {language === "zh" ? "A0 免费，A1/A2/B1 按级别解锁" : "A0 is free. A1/A2/B1 unlock by level."}
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-ocean/70">
            {language === "zh"
              ? "A0 不用登录即可开始。A1/A2/B1 购买后会绑定账户，并解锁对应级别。"
              : "Start A0 without logging in. A1/A2/B1 purchases attach to your account and unlock the matching level."}
          </p>
        </div>
      </div>
      {status ? <p className="mt-5 rounded-2xl bg-skywash p-4 text-sm font-black leading-6 text-ocean ring-1 ring-blue-100">{status}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 text-sm font-black leading-6 text-ocean ring-1 ring-blue-100">
        <CreditCard size={18} className="text-pop" />
        <span>{paymentMethodLabel}</span>
        {paymentMethods.map((method) => (
          <span key={method} className="rounded-full bg-skywash px-3 py-1 text-xs text-ocean">
            {method}
          </span>
        ))}
      </div>
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
                  {plan.badge ?? (paid ? (language === "zh" ? "付费包" : "Paid") : (language === "zh" ? "免费" : "Free"))}
                </span>
                {paid ? <LockKeyhole size={18} className={highlighted ? "text-orange-200" : "text-pop"} /> : <Sparkles size={18} className="text-pop" />}
              </div>
              <h3 className="mt-5 text-2xl font-black leading-tight">{language === "zh" ? plan.nameZh : plan.nameEn}</h3>
              <p className={`mt-4 text-5xl font-black ${highlighted ? "text-white" : "text-ink"}`}>{plan.price}</p>
              <p className={`mt-3 text-sm font-bold leading-6 ${highlighted ? "text-blue-50" : "text-ocean/65"}`}>
                {plan.loginRequired
                  ? user
                    ? language === "zh"
                      ? "购买后自动绑定当前账户。"
                      : "Access will attach to your signed-in account."
                    : language === "zh"
                      ? "点击购买，系统会把课程绑定到你的账户。"
                      : "Buy now; access will be attached to your account."
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
    </section>
  );
}
