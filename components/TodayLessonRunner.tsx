"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const lessonCopy = {
  zh: {
    title: "今日 10 分钟练习",
    subtitle: "跟着四步走完一小节：先读出来，再记住，再套规则，最后说一句。",
    stepLabel: "步骤",
    questionLabel: "小测一下",
    next: "下一步",
    finish: "完成今天",
    restart: "再练一遍",
    correct: "答对了",
    wrong: "再想一下",
    doneTitle: "今天这节完成了",
    doneBody: "你已经练过 ziekenhuis 的发音、联想、de/het 规则和预约医生场景。",
  },
  en: {
    title: "Today’s 10-minute lesson",
    subtitle: "Move through one small loop: read it, remember it, use the rule, then say it.",
    stepLabel: "Step",
    questionLabel: "Mini check",
    next: "Next step",
    finish: "Finish today",
    restart: "Practice again",
    correct: "Correct",
    wrong: "Try again",
    doneTitle: "Today’s lesson is done",
    doneBody: "You practiced the sound, word link, de/het rule, and GP appointment phrase for ziekenhuis.",
  },
};

const lessonSteps = [
  {
    method: { zh: "解码发音", en: "Decode" },
    title: { zh: "读出 ziekenhuis", en: "Read ziekenhuis" },
    dutch: "ziekenhuis",
    body: {
      zh: "先拆成 ziek + en + huis。注意 huis 里的 ui 是荷兰语特殊音，不要读成中文“欧”。",
      en: "Break it into ziek + en + huis. The ui in huis is a special Dutch sound.",
    },
    focus: ["ziek", "en", "huis"],
    question: { zh: "ziekenhuis 里面最需要注意的发音组合是？", en: "Which sound combo needs attention in ziekenhuis?" },
    options: ["ui", "aa", "oe"],
    answer: 0,
  },
  {
    method: { zh: "联想单词", en: "Link" },
    title: { zh: "把词变成记忆泡泡", en: "Turn the word into a memory bubble" },
    dutch: "ziek + huis = sick house = ziekenhuis",
    body: {
      zh: "ziek 像 sick，huis 是 house。生病的人去的 house，就是医院。",
      en: "ziek connects to sick, and huis means house. A sick house becomes a hospital.",
    },
    focus: ["ziek", "sick", "huis", "house"],
    question: { zh: "ziekenhuis 的意思是？", en: "What does ziekenhuis mean?" },
    options: ["医院", "学校", "火车站"],
    answer: 0,
  },
  {
    method: { zh: "掌握规则", en: "Rule" },
    title: { zh: "为什么是 het ziekenhuis？", en: "Why het ziekenhuis?" },
    dutch: "het huis → het ziekenhuis",
    body: {
      zh: "复合词通常看最后一个词。huis 是 het，所以 ziekenhuis 也是 het。",
      en: "Compound nouns often follow the final noun. huis is het, so ziekenhuis is het too.",
    },
    focus: ["het huis", "het ziekenhuis"],
    question: { zh: "正确说法是哪一个？", en: "Which one is correct?" },
    options: ["het ziekenhuis", "de ziekenhuis", "een ziekenhuis de"],
    answer: 0,
  },
  {
    method: { zh: "场景输出", en: "Speak" },
    title: { zh: "放进预约医生场景", en: "Use it in a GP scenario" },
    dutch: "Ik wil graag een afspraak maken met de huisarts.",
    body: {
      zh: "先不用录音，跟读这一句。目标是能在打电话预约时自然说出来。",
      en: "No recording yet. Read this sentence aloud and use it for making a GP appointment.",
    },
    focus: ["Ik wil graag", "een afspraak maken", "met de huisarts"],
    question: { zh: "预约时最有用的一句是？", en: "Which phrase is useful for making an appointment?" },
    options: ["Ik wil graag een afspraak maken.", "Ik ben een trein.", "Het brood woont hier."],
    answer: 0,
  },
];

export function TodayLessonRunner() {
  const { language } = useLanguage();
  const copy = lessonCopy[language];
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const step = lessonSteps[stepIndex];
  const isCorrect = selected === step.answer;
  const progress = useMemo(() => ((stepIndex + (completed ? 1 : 0)) / lessonSteps.length) * 100, [completed, stepIndex]);

  const moveNext = () => {
    if (stepIndex === lessonSteps.length - 1) {
      setCompleted(true);
      return;
    }

    setStepIndex((current) => current + 1);
    setSelected(null);
  };

  const restart = () => {
    setStepIndex(0);
    setSelected(null);
    setCompleted(false);
  };

  return (
    <section id="today-lesson" className="rounded-[32px] border border-blue-100 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-pop">Decode → Link → Rule → Speak</p>
          <h2 className="mt-3 text-3xl font-black text-ink">{copy.title}</h2>
          <p className="mt-3 max-w-2xl font-bold leading-7 text-ocean/75">{copy.subtitle}</p>
        </div>
        <div className="min-w-44 rounded-2xl bg-skywash p-4">
          <p className="text-sm font-black text-ocean">{copy.stepLabel}</p>
          <p className="mt-1 text-3xl font-black text-ink">
            {Math.min(stepIndex + 1, lessonSteps.length)}/{lessonSteps.length}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-pop transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {completed ? (
        <div className="mt-7 rounded-[28px] bg-mint p-5">
          <div className="flex items-center gap-3 text-ocean">
            <CheckCircle2 size={24} />
            <h3 className="text-2xl font-black">{copy.doneTitle}</h3>
          </div>
          <p className="mt-3 font-bold leading-7 text-ocean/75">{copy.doneBody}</p>
          <button
            type="button"
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-ocean ring-1 ring-emerald-100"
          >
            <RotateCcw size={18} />
            {copy.restart}
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[28px] bg-ink p-5 text-white">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-orange-200">
              {step.method[language]}
            </span>
            <h3 className="mt-4 text-2xl font-black">{step.title[language]}</h3>
            <p className="mt-4 rounded-2xl bg-white px-4 py-4 text-xl font-black leading-8 text-ink">{step.dutch}</p>
            <p className="mt-4 font-bold leading-7 text-blue-50">{step.body[language]}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {step.focus.map((item) => (
                <span key={item} className="rounded-full bg-pop px-3 py-2 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] bg-skywash p-5">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-pop">{copy.questionLabel}</p>
            <h3 className="mt-3 text-xl font-black leading-8 text-ink">{step.question[language]}</h3>
            <div className="mt-5 grid gap-3">
              {step.options.map((option, index) => {
                const isSelected = selected === index;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected(index)}
                    className={`rounded-2xl px-4 py-4 text-left font-black ring-1 transition ${
                      isSelected
                        ? isCorrect
                          ? "bg-mint text-ocean ring-emerald-100"
                          : "bg-peach text-ocean ring-orange-100"
                        : "bg-white text-ocean ring-blue-100 hover:bg-peach"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {selected !== null ? (
              <p className={`mt-4 font-black ${isCorrect ? "text-emerald-700" : "text-pop"}`}>
                {isCorrect ? copy.correct : copy.wrong}
              </p>
            ) : null}
            <button
              type="button"
              onClick={moveNext}
              disabled={!isCorrect}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-4 font-black text-white transition enabled:hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {stepIndex === lessonSteps.length - 1 ? copy.finish : copy.next}
              <ArrowRight size={18} />
            </button>
          </article>
        </div>
      )}
    </section>
  );
}
