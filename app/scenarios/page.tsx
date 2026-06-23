"use client";

import { useEffect, useState } from "react";
import { Info, MessageCircle, PencilLine } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { scenarioLessons } from "@/data/scenarioLessons";
import { authChangedEvent, getCurrentUser } from "@/lib/auth";
import { accessLevelChangedEvent, canAccessLevel, getEntitledUnlockedLevels, getUnlockedLevels, type UserUnlockedLevels } from "@/lib/entitlements";
import { useLanguage } from "@/lib/i18n";
import type { CourseLevel } from "@/types/course";

const initialScenario = scenarioLessons.find((scenario) => scenario.level === "A0") ?? scenarioLessons[0];
const scenarioLevels = ["A0", "A1", "A2", "B1"] as const;
const levelCopy: Record<CourseLevel, { zh: string; en: string; noteZh: string; noteEn: string }> = {
  A0: { zh: "生存开口", en: "Survival Start", noteZh: "最短句，先能说出口。", noteEn: "Shortest usable phrases first." },
  A1: { zh: "生活基础", en: "Daily Foundation", noteZh: "日常买东西、交通、住家。", noteEn: "Daily shopping, travel, home life." },
  A2: { zh: "生活任务", en: "Practical Tasks", noteZh: "预约、表格、账单、住房。", noteEn: "Appointments, forms, bills, housing." },
  B1: { zh: "工作学习", en: "Work & Study", noteZh: "解释问题、协商、写正式信息。", noteEn: "Explain, negotiate, and write clearly." },
};

export default function ScenariosPage() {
  const { t, language } = useLanguage();
  const [selectedId, setSelectedId] = useState(initialScenario.id);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(initialScenario.level);
  const [accessLevel, setCurrentAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<CourseLevel | undefined>();
  const selected = scenarioLessons.find((scenario) => scenario.id === selectedId) ?? initialScenario;
  const visibleScenarios = scenarioLessons.filter((scenario) => scenario.level === selectedLevel);

  useEffect(() => {
    let cancelled = false;
    const syncAccess = () => {
      setCurrentAccessLevel(getUnlockedLevels());
      void getEntitledUnlockedLevels().then((levels) => {
        if (!cancelled) setCurrentAccessLevel(levels);
      });
    };
    const syncUser = () => {
      void getCurrentUser().then((user) => {
        if (!cancelled) setSignedIn(Boolean(user));
      });
    };
    syncAccess();
    syncUser();
    window.addEventListener(accessLevelChangedEvent, syncAccess);
    window.addEventListener(authChangedEvent, syncUser);
    window.addEventListener("storage", syncAccess);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(accessLevelChangedEvent, syncAccess);
      window.removeEventListener(authChangedEvent, syncUser);
      window.removeEventListener("storage", syncAccess);
      window.removeEventListener("storage", syncUser);
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const scenario = new URLSearchParams(window.location.search).get("scenario");
    const target = scenarioLessons.find((item) => item.id === scenario);
    if (target) {
      if (!canAccessLevel(target.level, accessLevel, signedIn)) {
        setUpgradeLevel(target.level);
        return;
      }
      setSelectedId(target.id);
      setSelectedLevel(target.level);
    }
  }, [accessLevel, signedIn]);

  const chooseLevel = (level: CourseLevel) => {
    if (!canAccessLevel(level, accessLevel, signedIn)) {
      setUpgradeLevel(level);
      return;
    }
    setSelectedLevel(level);
    const firstInLevel = scenarioLessons.find((scenario) => scenario.level === level);
    if (firstInLevel) setSelectedId(firstInLevel.id);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Speak</p>
        <h1 className="mt-3 text-5xl font-black text-ink">{t("scenarios.title")}</h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
          {language === "zh"
            ? "A0 到 B1 的真实生活任务：先看可直接套用的表达，再读小对话，最后完成口语或写作输出。"
            : "Real-life A0 to B1 tasks: read usable phrases, study a short dialogue, then complete speaking or writing output."}
        </p>
      </section>

      <section className="mb-7 rounded-[28px] bg-peach p-5 ring-1 ring-orange-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-pop">
            <Info size={20} />
          </span>
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "学习顺序提醒" : "Learning order"}</p>
            <p className="mt-2 text-xl font-black leading-8 text-ink">
              {language === "zh"
                ? "场景练习是最后一步。建议先完成对应的每日课程和单词泡泡，再来这里练输出。"
                : "Scenario practice is the final step. Complete the matching daily lesson and word bubbles first, then come here to practice output."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[30px] border border-blue-100 bg-white p-4 shadow-soft">
          <p className="px-2 text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "按等级选择" : "Choose Level"}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {scenarioLevels.map((level) => {
              const isActive = level === selectedLevel;
              const count = scenarioLessons.filter((scenario) => scenario.level === level).length;
              const copy = levelCopy[level];
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => chooseLevel(level)}
                  className={`min-h-[128px] rounded-[22px] p-3 text-left ring-1 transition ${
                    isActive ? "bg-ink text-white ring-ink shadow-soft" : "bg-slate-50 text-ocean ring-blue-100 hover:bg-peach"
                  }`}
                >
                  <span className={`text-sm font-black ${isActive ? "text-orange-200" : "text-pop"}`}>{level}</span>
                  <span className="mt-1 block text-base font-black leading-5">{language === "zh" ? copy.zh : copy.en}</span>
                  <span className={`mt-2 block text-xs font-bold leading-5 ${isActive ? "text-blue-50" : "text-ocean/65"}`}>
                    {language === "zh" ? copy.noteZh : copy.noteEn}
                  </span>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${isActive ? "bg-white/10 text-white" : "bg-white text-ocean"}`}>
                    {count} {language === "zh" ? "张场景卡" : "cards"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-50 p-3 ring-1 ring-blue-100">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-sm font-black tracking-[0.14em] text-pop">{selectedLevel} {language === "zh" ? "场景卡" : "Cards"}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean">{visibleScenarios.length}</span>
            </div>
            <div className="mt-3 grid max-h-[520px] gap-2 overflow-y-auto pr-1">
              {visibleScenarios.map((scenario) => {
                const isActive = scenario.id === selected.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedId(scenario.id)}
                    className={`rounded-2xl px-4 py-3 text-left transition ${
                      isActive ? "bg-ink text-white" : "bg-white text-ocean ring-1 ring-blue-100 hover:bg-skywash"
                    }`}
                  >
                    <span className={isActive ? "text-orange-200 text-xs font-black" : "text-pop text-xs font-black"}>
                      {scenario.level} · {scenario.stage}
                    </span>
                    <span className="mt-1 block text-base font-black">{scenario.title[language]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <article className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-pop">{selected.level} Scenario</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-ink">{selected.title[language]}</h2>
              <p className="mt-3 text-lg font-bold leading-8 text-ocean/70">{selected.scenario[language]}</p>
            </div>
            <span className="w-fit rounded-full bg-peach px-4 py-2 text-sm font-black text-pop">{selected.stage}</span>
          </div>

          <section className="mt-8 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
            <p className="text-sm font-black tracking-[0.14em] text-pop">{t("label.usefulPhrases")}</p>
            <div className="mt-4 grid gap-3">
              {selected.usefulPhrases.map((phrase) => (
                <div key={phrase.dutch} className="rounded-2xl bg-white p-4">
                  <p className="text-xl font-black text-ink">{phrase.dutch}</p>
                  <p className="mt-1 text-sm font-bold text-ocean/60">{phrase.meaning[language]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[28px] bg-ink p-5 text-white">
            <p className="text-sm font-black tracking-[0.14em] text-orange-200">{t("label.miniDialogue")}</p>
            <div className="mt-4 grid gap-3">
            {selected.dialogue.map((line, index) => (
              <div key={`${line.speaker}-${index}`} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-black text-orange-200">{line.speaker}</p>
                <p className="mt-1 text-lg font-black leading-8 text-blue-50">{line.dutch}</p>
                <p className="mt-1 text-sm font-bold leading-6 text-blue-100/80">{line.meaning[language]}</p>
              </div>
            ))}
          </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] bg-skywash p-5">
              <div className="flex items-center gap-2 text-sm font-black text-pop">
                <MessageCircle size={18} />
                {t("label.speakingPractice")}
              </div>
              <p className="mt-4 text-xl font-black leading-8 text-ink">{selected.speakingTask.prompt[language]}</p>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="font-black leading-7 text-ocean">{selected.speakingTask.sampleAnswer.dutch}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-ocean/60">{selected.speakingTask.sampleAnswer.meaning[language]}</p>
              </div>
            </div>
            <div className="rounded-[28px] bg-peach p-5">
              <div className="flex items-center gap-2 text-sm font-black text-pop">
                <PencilLine size={18} />
                {t("label.writingPractice")}
              </div>
              {selected.writingTask ? (
                <>
                  <p className="mt-4 text-xl font-black leading-8 text-ink">{selected.writingTask.prompt[language]}</p>
                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="whitespace-pre-line font-black leading-7 text-ocean">{selected.writingTask.sampleAnswer.dutch}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-ocean/60">{selected.writingTask.sampleAnswer.meaning[language]}</p>
                  </div>
                </>
              ) : (
                <p className="mt-4 rounded-2xl bg-white p-4 font-black leading-7 text-ocean">A0/A1 先练口语句，写作任务之后开放。</p>
              )}
            </div>
          </section>
        </article>
      </section>
      <UpgradeModal open={Boolean(upgradeLevel)} lockedLevel={upgradeLevel} onClose={() => setUpgradeLevel(undefined)} />
    </main>
  );
}
