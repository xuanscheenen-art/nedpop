"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, MessageCircle, PencilLine, Sparkles } from "lucide-react";
import type { ScenarioLesson } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

export function ScenarioCard({ scenario }: { scenario: ScenarioLesson }) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-peach/60" />
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="rounded-full bg-peach px-3 py-1 text-xs font-black text-pop">{scenario.level}</span>
            <h3 className="mt-4 text-2xl font-black text-ink">{scenario.title[language]}</h3>
          </div>
          <span className="w-fit rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">{t("label.scenarioTask")}</span>
        </div>

        <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-ocean">{scenario.scenario[language]}</p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-skywash p-4">
            <p className="text-sm font-black text-pop">{t("label.usefulWords")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {scenario.usefulWords.map((word) => (
                <span key={word} className="rounded-full bg-white px-3 py-2 text-sm font-black text-ocean">
                  {word}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-mint p-4">
            <p className="text-sm font-black text-ocean">{t("label.usefulPhrases")}</p>
            <div className="mt-3 space-y-2">
              {scenario.usefulPhrases.map((phrase) => (
                <p key={phrase.dutch} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-ocean">
                  {phrase.dutch}
                </p>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pop px-5 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200 sm:w-auto"
          aria-expanded={isOpen}
        >
          {isOpen ? t("action.collapse") : t("action.openPractice")}
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isOpen ? (
          <div className="mt-5">
            <div className="rounded-2xl bg-ink p-4 text-white">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-200">{t("label.miniDialogue")}</p>
              <div className="mt-4 grid gap-3">
                {scenario.dialogue.map((line, index) => (
                  <div key={`${line.speaker}-${index}`} className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-black text-orange-200">{line.speaker}</p>
                    <p className="mt-1 font-bold leading-7 text-blue-50">{line.dutch}</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-blue-100/80">{line.meaning[language]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black text-pop">
                  <MessageCircle size={16} />
                  {t("label.speakingPractice")}
                </div>
                <p className="mt-3 font-black leading-7 text-ink">{scenario.speakingTask.prompt[language]}</p>
                <div className="mt-3 rounded-2xl bg-skywash p-3">
                  <p className="text-sm font-bold leading-6 text-ocean">{scenario.speakingTask.sampleAnswer.dutch}</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-ocean/60">{scenario.speakingTask.sampleAnswer.meaning[language]}</p>
                </div>
              </div>
              {scenario.writingTask ? (
                <div className="rounded-2xl border border-blue-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-pop">
                    <PencilLine size={16} />
                    {t("label.writingPractice")}
                  </div>
                  <p className="mt-3 font-black leading-7 text-ink">{scenario.writingTask.prompt[language]}</p>
                  <div className="mt-3 rounded-2xl bg-peach p-3">
                    <p className="whitespace-pre-line text-sm font-bold leading-6 text-ocean">{scenario.writingTask.sampleAnswer.dutch}</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-ocean/60">{scenario.writingTask.sampleAnswer.meaning[language]}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl bg-skywash p-4">
                <p className="text-sm font-black text-ink">{t("label.checklist")}</p>
                <div className="mt-3 grid gap-2">
                  {scenario.checklist.map((item) => (
                    <div key={item.en} className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-bold text-ocean">
                      <CheckCircle2 size={16} className="shrink-0 text-pop" />
                      {item[language]}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
                <div className="flex items-center gap-2 text-sm font-black text-pop">
                  <Sparkles size={16} />
                  {t("label.practiceFeedback")}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <p className="rounded-2xl bg-mint p-3 text-sm font-bold leading-6 text-ocean">
                    {t("label.goodSentence")}: {scenario.speakingTask.sampleAnswer.dutch}
                  </p>
                  <p className="rounded-2xl bg-peach p-3 text-sm font-bold leading-6 text-ocean">
                    {t("label.grammarCorrection")}: {scenario.relatedGrammarRuleIds.join(", ")}
                  </p>
                  <p className="rounded-2xl bg-skywash p-3 text-sm font-bold leading-6 text-ocean">
                    {t("label.betterPhrase")}: {scenario.usefulPhrases[0]?.dutch}
                  </p>
                  <p className="rounded-2xl bg-orange-50 p-3 text-sm font-bold leading-6 text-ocean">
                    {t("label.examTip")}: {scenario.learningGoals[0]?.[language]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
