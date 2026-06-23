"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { MiniQuiz } from "@/types/course";

export function GrammarQuiz({ questions }: { questions: MiniQuiz[] }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const score = questions.filter((question, index) => answers[index] === question.options[question.answerIndex]?.en).length;

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-pop">{t("label.miniQuiz")}</p>
          <h3 className="mt-2 text-2xl font-black text-ink">{t("rules.quizBody")}</h3>
        </div>
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-ocean">
          {score}/{questions.length} {t("label.correct")}
        </span>
      </div>
      <div className="mt-6 grid gap-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl bg-skywash p-4">
            <p className="font-black text-ink">{question.question.zh}</p>
            <div className="mt-4 grid gap-2 lg:grid-cols-3">
              {question.options.map((optionText) => {
                const option = optionText.en;
                const selected = answers[index] === option;
                const correct = selected && option === question.options[question.answerIndex]?.en;
                return (
                  <button
                    key={option}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black ring-1 transition ${
                      selected
                        ? correct
                          ? "bg-mint text-ocean ring-emerald-100"
                          : "bg-peach text-ocean ring-orange-100"
                        : "bg-white text-ocean ring-blue-100 hover:bg-peach"
                    }`}
                  >
                    {correct ? <CheckCircle2 size={16} /> : null}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
