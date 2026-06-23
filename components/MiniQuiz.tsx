"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { MiniQuiz as MiniQuizQuestion } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function MiniQuiz({ questions }: { questions: MiniQuizQuestion[] }) {
  const { t, language } = useLanguage();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.filter((question, index) => answers[index] === question.answerIndex).length;

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-pop">{t("label.miniQuiz")}</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{t("label.soundRule")}</h2>
        </div>
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-ocean">
          {score}/{questions.length} {t("label.correct")}
        </span>
      </div>
      <div className="mt-6 grid gap-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl bg-skywash p-4">
            <p className="font-black text-ink">{question.question[language]}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {question.options.map((optionText, optionIndex) => {
                const selected = answers[index] === optionIndex;
                const correct = selected && optionIndex === question.answerIndex;
                return (
                  <button
                    key={optionText.en}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                    className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black ring-1 transition ${
                      selected
                        ? correct
                          ? "bg-mint text-ocean ring-emerald-100"
                          : "bg-peach text-ocean ring-orange-100"
                        : "bg-white text-ocean ring-blue-100 hover:bg-peach"
                    }`}
                  >
                    {correct ? <CheckCircle2 size={16} /> : null}
                    {optionText[language]}
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
