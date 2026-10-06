"use client";

import { useLanguage } from "@/lib/i18n";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black tracking-[0.16em] text-pop">Terms</p>
      <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">
        {language === "zh" ? "使用条款" : "Terms of Use"}
      </h1>
      <div className="mt-8 space-y-6 rounded-[30px] border border-blue-100 bg-white p-6 text-base font-bold leading-8 text-ocean/75 shadow-sm sm:p-8">
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "服务内容" : "Our service"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "NedPop 是荷兰语学习辅助工具，提供 A0 到 B1 的课程、单词泡泡、发音解码、语法工具、场景输出和复习功能。"
              : "NedPop is a Dutch learning tool offering A0–B1 courses, word bubbles, pronunciation decoding, grammar tools, scenario-based output, and review features."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "课程权益" : "Course access"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "A0 免费开放。A1、A2、B1 和全能通关包购买后绑定到当前登录账号。请在付款前确认你使用的是自己的账号。"
              : "A0 is available for free. Purchased A1, A2, B1, and All Access packages are linked to the account currently signed in. Please make sure you are using your own account before paying."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "学习结果" : "Learning outcomes"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "NedPop 帮助你更高效地理解、记忆和输出荷兰语，但不承诺任何考试通过结果。考试报名、评分和证书由对应官方机构负责。"
              : "NedPop helps you understand, remember, and use Dutch more effectively, but does not guarantee that you will pass any exam. Exam registration, assessment, and certification are the responsibility of the relevant official organizations."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">{language === "zh" ? "合理使用" : "Acceptable use"}</h2>
          <p className="mt-3">
            {language === "zh"
              ? "请不要批量抓取、复制或转售课程内容。账号权益仅供本人学习使用。"
              : "Do not scrape, reproduce, or resell course content in bulk. Course access is for the account holder’s personal learning only."}
          </p>
        </section>
      </div>
    </main>
  );
}
