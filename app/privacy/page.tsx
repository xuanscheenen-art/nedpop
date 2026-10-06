"use client";

import { useLanguage } from "@/lib/i18n";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black tracking-[0.16em] text-pop">Privacy</p>
      <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">
        {language === "zh" ? "隐私政策" : "Privacy Policy"}
      </h1>
      <div className="mt-8 space-y-6 rounded-[30px] border border-blue-100 bg-white p-6 text-base font-bold leading-8 text-ocean/75 shadow-sm sm:p-8">
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "我们收集什么" : "What we collect"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "NedPop 会保存账号所需的信息，例如邮箱、登录提供方、头像昵称，以及课程权益、学习进度和复习池记录。未登录使用 A0 和发音/语法工具时，部分进度可能只保存在你的浏览器本地。"
              : "NedPop stores information needed for your account, such as your email address, sign-in provider, profile name and image, course access, learning progress, and review-pool records. When you use A0 or the pronunciation and grammar tools without signing in, some progress may be stored only in your browser."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "付款信息" : "Payment information"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "付款由 Stripe 处理。NedPop 不保存完整银行卡号。购买成功后，我们只保存订单、套餐、付款状态和用于解锁课程的必要记录。"
              : "Payments are processed by Stripe. NedPop does not store complete card numbers. After a successful purchase, we retain only the order, package, payment status, and records required to unlock your courses."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "数据用途" : "How we use data"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "这些数据用于登录、恢复学习进度、同步复习池、处理购买权益、改进课程体验和排查账户问题。我们不会出售你的个人数据。"
              : "We use this data to support sign-in, restore learning progress, synchronize the review pool, manage purchased access, improve the course experience, and resolve account issues. We do not sell your personal data."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "联系" : "Contact"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "如需删除账号数据或询问隐私问题，请通过页脚邮箱联系 NedPop。"
              : "To request deletion of your account data or ask a privacy-related question, contact NedPop using the email address in the footer."}
          </p>
        </section>
      </div>
    </main>
  );
}
