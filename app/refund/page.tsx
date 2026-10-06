"use client";

import { useLanguage } from "@/lib/i18n";

export default function RefundPage() {
  const { language } = useLanguage();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black tracking-[0.16em] text-pop">Refunds</p>
      <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">
        {language === "zh" ? "退款说明" : "Refund Policy"}
      </h1>
      <div className="mt-8 space-y-6 rounded-[30px] border border-blue-100 bg-white p-6 text-base font-bold leading-8 text-ocean/75 shadow-sm sm:p-8">
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "适用范围" : "Scope"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "NedPop 的 A1、A2、B1 和全能通关包是数字学习内容。付款成功后课程会绑定到你的登录账号。"
              : "NedPop’s A1, A2, B1, and All Access packages are digital learning products. After successful payment, course access is linked to your signed-in account."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "申请方式" : "How to request help"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "如果你买错套餐、重复付款，或付款后没有正确解锁，请通过页脚邮箱联系 NedPop，并附上登录邮箱、购买套餐和付款时间。"
              : "If you purchased the wrong package, were charged twice, or did not receive the correct access after payment, contact NedPop using the email address in the footer. Include your sign-in email, purchased package, and payment time."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "处理原则" : "How requests are handled"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "我们会优先修复未解锁或重复扣款问题。符合退款条件的订单会通过原支付方式退回。你的法定消费者权利不受本说明影响。"
              : "We prioritize unresolved access and duplicate-charge issues. Eligible refunds are returned to the original payment method. This policy does not affect your statutory consumer rights."}
          </p>
        </section>
      </div>
    </main>
  );
}
