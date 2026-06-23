"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { NounEntry } from "@/types/course";
import { useLanguage } from "@/lib/i18n";
import { RulePartNavigator } from "@/components/RulePartNavigator";

const pluralExamples = [
  ["het boek", "de boeken"],
  ["het huis", "de huizen"],
  ["de afspraak", "de afspraken"],
  ["de rekening", "de rekeningen"],
];

const diminutiveExamples = [
  ["de tafel", "het tafeltje"],
  ["de kop", "het kopje"],
  ["de kamer", "het kamertje"],
  ["het kind", "het kindje"],
];

const peopleAnimalExamples = ["de man", "de vrouw", "de student", "de leraar", "de dokter", "de kat", "de hond"];
const peopleAnimalExceptions = ["het kind", "het meisje", "het paard"];
const languageSportExamples = ["het Nederlands", "het Engels", "het Chinees", "het voetbal", "het tennis"];

const deEndingCards = [
  { ending: "-ing", examples: ["de woning", "de rekening", "de verzekering"] },
  { ending: "-heid", examples: ["de gezondheid", "de vrijheid"] },
  { ending: "-tie / -ie", examples: ["de situatie", "de informatie", "de politie", "de familie"] },
  { ending: "-teit", examples: ["de universiteit", "de kwaliteit"] },
  { ending: "-ij", examples: ["de bakkerij", "de maatschappij"] },
];

const hetEndingCards = [
  { ending: "-ment", examples: ["het document", "het moment", "het appartement"] },
  { ending: "-sel", examples: ["het voedsel", "het kapsel"] },
  { ending: "-isme", examples: ["het toerisme", "het socialisme"] },
];

const compoundExamples = [
  ["het huis", "het ziekenhuis"],
  ["het boek", "het woordenboek"],
  ["de kamer", "de slaapkamer"],
  ["de arts", "de huisarts"],
  ["de kaart", "de treinkaart"],
];

const chunkWords = ["het huis", "het boek", "het werk", "het geld", "het water", "de fiets", "de trein", "de straat", "de school", "de winkel"];

const summaryRows = [
  { clueZh: "复数", clueEn: "Plural nouns", choiceZh: "de", choiceEn: "de", example: "de boeken" },
  { clueZh: "小词 -je", clueEn: "Diminutive -je", choiceZh: "het", choiceEn: "het", example: "het kopje" },
  { clueZh: "人/职业/动物", clueEn: "People/jobs/animals", choiceZh: "多数 de", choiceEn: "usually de", example: "de dokter, de hond" },
  { clueZh: "语言/运动", clueEn: "Languages/sports", choiceZh: "het", choiceEn: "het", example: "het Nederlands, het voetbal" },
  { clueZh: "-ing/-heid/-tie", clueEn: "-ing/-heid/-tie", choiceZh: "多数 de", choiceEn: "usually de", example: "de woning, de informatie" },
  { clueZh: "-ment/-sel", clueEn: "-ment/-sel", choiceZh: "常见 het", choiceEn: "often het", example: "het document, het voedsel" },
  { clueZh: "复合词", clueEn: "Compound nouns", choiceZh: "看最后一个词", choiceEn: "follow the final noun", example: "het ziekenhuis" },
];

const mistakes = [
  { wrong: "het boeken", correct: "de boeken", reasonZh: "复数永远 de。", reasonEn: "Plural nouns always use de." },
  { wrong: "de kopje", correct: "het kopje", reasonZh: "-je 小词通常用 het。", reasonEn: "Diminutives ending in -je usually use het." },
  { wrong: "de ziekenhuis", correct: "het ziekenhuis", reasonZh: "复合词看最后，huis 是 het。", reasonEn: "For compounds, follow the final noun: huis is het." },
  { wrong: "het rekening", correct: "de rekening", reasonZh: "-ing 结尾多半 de。", reasonEn: "Nouns ending in -ing are usually de-words." },
  { wrong: "de Nederlands", correct: "het Nederlands", reasonZh: "语言作为名词常用 het。", reasonEn: "Languages used as nouns usually take het." },
];

const practiceQuestions = [
  { id: "dehet-1", question: "___ boeken", answer: "de", explanationZh: "复数永远 de。", explanationEn: "Plural nouns always use de." },
  { id: "dehet-2", question: "___ kopje", answer: "het", explanationZh: "-je 小词通常用 het。", explanationEn: "Diminutives ending in -je usually use het." },
  { id: "dehet-3", question: "___ rekening", answer: "de", explanationZh: "-ing 结尾多半 de。", explanationEn: "Nouns ending in -ing are usually de-words." },
  { id: "dehet-4", question: "___ document", answer: "het", explanationZh: "-ment 结尾常见 het。", explanationEn: "Nouns ending in -ment often use het." },
  { id: "dehet-5", question: "___ ziekenhuis", answer: "het", explanationZh: "复合词看最后，huis 是 het。", explanationEn: "For compounds, follow the final noun: huis is het." },
  { id: "dehet-6", question: "___ huisarts", answer: "de", explanationZh: "复合词看最后，arts 是 de。", explanationEn: "For compounds, follow the final noun: arts is de." },
  { id: "dehet-7", question: "___ Nederlands", answer: "het", explanationZh: "语言作为名词常用 het。", explanationEn: "Languages used as nouns usually take het." },
];

export function ArticleDetector({ nouns, focusSingular }: { nouns: NounEntry[]; focusSingular?: string }) {
  const { t, language } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activePart, setActivePart] = useState<"rules" | "endings" | "practice" | "checklist">("rules");
  const [audioStatus, setAudioStatus] = useState("");
  const orderedNouns = focusSingular
    ? [...nouns].sort((a, b) => Number(b.singular === focusSingular) - Number(a.singular === focusSingular))
    : nouns;

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioStatus(language === "zh" ? "当前浏览器不支持朗读。" : "This browser does not support speech playback.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const dutchVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("nl"));
    if (dutchVoice) utterance.voice = dutchVoice;
    utterance.lang = "nl-NL";
    utterance.rate = 0.82;
    utterance.onstart = () => setAudioStatus(language === "zh" ? `正在播放：${text}` : `Playing: ${text}`);
    utterance.onend = () => setAudioStatus(language === "zh" ? "播放完成，跟读一遍。" : "Done. Repeat it once.");
    window.speechSynthesis.speak(utterance);
  };

  const AudioButton = ({ text }: { text: string }) => (
    <button
      type="button"
      onClick={() => speakDutch(text)}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
      aria-label={`${language === "zh" ? "播放" : "Play"} ${text}`}
    >
      <Play size={13} />
      {language === "zh" ? "听" : "Play"}
    </button>
  );

  const ExamplePill = ({ text }: { text: string }) => (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2">
      <span className="font-black text-ink">{text}</span>
      <AudioButton text={text} />
    </div>
  );

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm font-black tracking-[0.18em] text-pop">{t("label.articleDetector")}</p>
      <h3 className="mt-3 text-4xl font-black leading-tight text-ink">
        {language === "zh" ? "de 还是 het？先看线索，再背例外" : "de or het? Read the clues before memorizing exceptions"}
      </h3>
      <div className="mt-5 rounded-[28px] bg-ink p-6 text-white">
        <p className="text-lg font-bold leading-9 text-blue-50">
          {language === "zh"
            ? "很多人说 de/het 只能死背。其实不完全对。de/het 不能 100% 靠规则判断，但很多词有明显线索。"
            : "People often say de/het is pure memorization. Not quite. You cannot predict every noun, but many words give strong clues."}
        </p>
        <p className="mt-3 text-lg font-bold leading-9 text-blue-50">
          {language === "zh" ? "先学会看线索，剩下的高频词再背。" : "Learn to spot the clues first, then memorize the high-frequency exceptions."}
        </p>
        <p className="mt-5 rounded-2xl bg-pop p-4 text-3xl font-black leading-tight text-ink">
          {language === "zh" ? "先看词的类型、结尾、是不是复合词。" : "Check the word type, ending, and whether it is a compound."}
        </p>
        {audioStatus ? <p className="mt-4 text-sm font-black text-orange-200">{audioStatus}</p> : null}
      </div>

      <RulePartNavigator
        title={language === "zh" ? "de/het 分成四块" : "de/het has four parts"}
        activeId={activePart}
        onSelect={setActivePart}
        items={[
          {
            id: "rules",
            label: language === "zh" ? "先看大规则" : "Core Rules",
            body: language === "zh" ? "复数、小词、人/职业/动物、语言运动。" : "Plural, diminutives, people/jobs/animals, languages/sports.",
          },
          {
            id: "endings",
            label: language === "zh" ? "词尾和复合词" : "Endings",
            body: language === "zh" ? "看 -ing/-heid/-ment，以及复合词最后一个词。" : "Endings like -ing/-heid/-ment and compound nouns.",
          },
          {
            id: "practice",
            label: language === "zh" ? "错误和练习" : "Practice",
            body: language === "zh" ? "错句对比、立即选择、最后口诀。" : "Mistake contrast, quick quiz, final chant.",
          },
          {
            id: "checklist",
            label: language === "zh" ? "高频词表" : "Checklist",
            body: language === "zh" ? "常用名词和它们的 de/het 线索。" : "Frequent nouns and their de/het hints.",
          },
        ]}
      />

      {activePart !== "checklist" ? (
      <div className="mt-8 grid gap-6">
        {activePart === "rules" ? (
          <>
        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="1" title={language === "zh" ? "复数永远用 de" : "Plural nouns always use de"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh" ? "不管单数是 de 还是 het，只要变成复数，前面都用 de。" : "No matter whether the singular noun uses de or het, the plural form uses de."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {pluralExamples.map(([singular, plural]) => (
              <div key={plural} className="rounded-2xl bg-white p-4">
                <p className="text-lg font-black text-ocean">{singular} →</p>
                <div className="mt-2"><ExamplePill text={plural} /></div>
              </div>
            ))}
          </div>
          <MemoryHook text={language === "zh" ? "一变复数，全都 de。" : "Once it becomes plural, use de."} />
          <MistakeInline wrong="het boeken" correct="de boeken" reason={language === "zh" ? "复数名词用 de。" : "Plural nouns use de."} speakDutch={speakDutch} />
        </section>

        <section className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
          <SectionTitle number="2" title={language === "zh" ? "小词 -je 通常用 het" : "Diminutives ending in -je usually use het"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh"
              ? "荷兰语里表示“小小的”词，通常用 het。常见结尾：-je / -tje / -pje / -etje / -kje。"
              : "Dutch diminutives, words that make something small, usually use het. Common endings: -je / -tje / -pje / -etje / -kje."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {diminutiveExamples.map(([base, small]) => (
              <div key={small} className="rounded-2xl bg-skywash p-4">
                <p className="text-lg font-black text-ocean">{base} →</p>
                <div className="mt-2"><ExamplePill text={small} /></div>
              </div>
            ))}
          </div>
          <MemoryHook text={language === "zh" ? "变小了，用 het。" : "When it becomes small, use het."} />
          <MistakeInline wrong="de kopje" correct="het kopje" reason={language === "zh" ? "-je 小词通常用 het。" : "Diminutives ending in -je usually use het."} speakDutch={speakDutch} />
        </section>

        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="3" title={language === "zh" ? "人、职业、动物多数用 de" : "People, jobs, and animals usually use de"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh"
              ? "表示人、职业、动物的词，多数用 de。这是高概率线索，不是绝对规则。"
              : "Words for people, jobs, and animals are usually de-words. This is a strong clue, not an absolute rule."}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {peopleAnimalExamples.map((item) => <ExamplePill key={item} text={item} />)}
          </div>
          <div className="mt-5 rounded-2xl bg-peach p-4">
            <p className="font-black text-ink">{language === "zh" ? "常见例外：het kind / het meisje / het paard" : "Common exceptions: het kind / het meisje / het paard"}</p>
            <p className="mt-2 font-bold text-ocean/70">
              {language === "zh" ? "人和动物，多数 de；小孩女孩马，要单独记。" : "People and animals usually use de; child, girl, and horse need separate memorization."}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {peopleAnimalExceptions.map((item) => <ExamplePill key={item} text={item} />)}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
          <SectionTitle number="4" title={language === "zh" ? "语言和运动作为名词，常用 het" : "Languages and sports often use het"} />
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {languageSportExamples.map((item) => <ExamplePill key={item} text={item} />)}
          </div>
          <MemoryHook text={language === "zh" ? "语言运动，常用 het。" : "Languages and sports often take het."} />
        </section>
          </>
        ) : null}

        {activePart === "endings" ? (
          <>
        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="5" title={language === "zh" ? "看词尾：很多结尾多半是 de" : "Look at endings: many endings point to de"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh"
              ? "有些词一看结尾，就很可能是 de。注意：多半 / usually，不是 100% 绝对。"
              : "Some endings strongly suggest de. Remember: usually means high probability, not 100% certainty."}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deEndingCards.map((card) => <EndingCard key={card.ending} card={card} speakDutch={speakDutch} />)}
          </div>
          <MemoryHook text={language === "zh" ? "-ing、-heid、-tie，看到多半 de。" : "-ing, -heid, and -tie often point to de."} />
        </section>

        <section className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
          <SectionTitle number="6" title={language === "zh" ? "看词尾：有些结尾常见 het" : "Look at endings: some endings often use het"} />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {hetEndingCards.map((card) => <EndingCard key={card.ending} card={card} speakDutch={speakDutch} />)}
          </div>
          <MemoryHook text={language === "zh" ? "-ment、-sel，常见 het。" : "-ment and -sel often point to het."} />
        </section>

        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="7" title={language === "zh" ? "复合词看最后一个词" : "Compound nouns follow the final noun"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh"
              ? "荷兰语有很多复合词。复合词的 de/het 通常看最后一个核心词。"
              : "Dutch has many compound nouns. The article usually follows the final core noun."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {compoundExamples.map(([base, compound]) => (
              <div key={compound} className="rounded-2xl bg-white p-4">
                <p className="text-lg font-black text-ocean">{base} →</p>
                <div className="mt-2"><ExamplePill text={compound} /></div>
              </div>
            ))}
          </div>
          <MemoryHook text={language === "zh" ? "复合词看最后。" : "For compounds, look at the final noun."} />
          <MistakeInline wrong="de ziekenhuis" correct="het ziekenhuis" reason={language === "zh" ? "ziekenhuis 的最后是 huis，huis 是 het。" : "The final noun in ziekenhuis is huis, and huis is a het-word."} speakDutch={speakDutch} />
        </section>

        <section className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
          <SectionTitle number="8" title={language === "zh" ? "不能判断的高频词，要当词块记" : "For unclear frequent words, memorize the full chunk"} />
          <p className="mt-3 font-bold leading-7 text-ocean/75">
            {language === "zh" ? "有些高频词没有明显线索，直接和 de/het 一起记。" : "Some frequent nouns do not give clear clues. Memorize them together with de or het."}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {chunkWords.map((item) => <ExamplePill key={item} text={item} />)}
          </div>
          <MemoryHook text={language === "zh" ? "不要只背 huis，要背 het huis。不要只背 fiets，要背 de fiets。" : "Do not memorize huis alone; memorize het huis. Do not memorize fiets alone; memorize de fiets."} />
        </section>

        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="9" title={language === "zh" ? "入门总结" : "Beginner summary"} />
          <div className="mt-5 overflow-hidden rounded-[24px] border border-blue-100 bg-white">
            <div className="grid grid-cols-[1fr_1fr_1.2fr] bg-ink px-4 py-3 text-sm font-black text-white">
              <span>{language === "zh" ? "线索" : "Clue"}</span>
              <span>{language === "zh" ? "常见选择" : "Common choice"}</span>
              <span>{language === "zh" ? "例子" : "Example"}</span>
            </div>
            {summaryRows.map((row) => (
              <div key={row.example} className="grid grid-cols-[1fr_1fr_1.2fr] gap-2 border-t border-blue-50 px-4 py-3 text-sm font-bold text-ocean">
                <span className="font-black text-ink">{language === "zh" ? row.clueZh : row.clueEn}</span>
                <span>{language === "zh" ? row.choiceZh : row.choiceEn}</span>
                <span>{row.example}</span>
              </div>
            ))}
          </div>
        </section>
          </>
        ) : null}

        {activePart === "practice" ? (
          <>
        <section className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
          <SectionTitle number="10" title={language === "zh" ? "中文母语者常见错误" : "Common mistakes for Chinese learners"} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {mistakes.map((mistake, index) => (
              <article key={mistake.wrong} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-pop">Mistake {index + 1}</p>
                <p className="mt-2 text-xl font-black text-red-600">✕ {mistake.wrong}</p>
                <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-mint p-3">
                  <p className="text-xl font-black text-ocean">✓ {mistake.correct}</p>
                  <AudioButtonLocal text={mistake.correct} speakDutch={speakDutch} />
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-ocean/70">
                  {language === "zh" ? "原因：" : "Why: "}
                  {language === "zh" ? mistake.reasonZh : mistake.reasonEn}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
          <SectionTitle number="11" title={language === "zh" ? "即时练习" : "Immediate practice"} />
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {practiceQuestions.map((question, index) => {
              const selected = answers[question.id];
              const isCorrect = selected === question.answer;
              const phrase = question.question.replace("___", question.answer);
              return (
                <article key={question.id} className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-pop">Question {index + 1}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-2xl font-black text-ink">{question.question}</p>
                    <AudioButtonLocal text={phrase} speakDutch={speakDutch} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {["de", "het"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                        className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                          selected === option ? (isCorrect ? "bg-mint text-ocean ring-emerald-100" : "bg-peach text-ocean ring-orange-100") : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {selected ? (
                    <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                      {isCorrect
                        ? (language === "zh" ? "对了。" : "Correct.")
                        : (language === "zh" ? `答案：${question.answer}` : `Answer: ${question.answer}`)}{" "}
                      {language === "zh" ? question.explanationZh : question.explanationEn}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] bg-peach p-5">
          <SectionTitle number="12" title={language === "zh" ? "术语小提醒" : "Tiny terminology note"} />
          <p className="mt-3 font-black leading-8 text-ink">
            {language === "zh"
              ? "语法书会把 de/het 叫 grammatical gender / 名词性。你现在先不用管术语，只记判断流程："
              : "Grammar books call de/het grammatical gender. For now, ignore the terminology and remember the decision flow:"}
          </p>
          <p className="mt-4 text-3xl font-black leading-tight text-ink">
            {language === "zh" ? (
              <>复数看 de，<br />小词看 het，<br />词尾找线索，<br />复合词看最后，<br />没线索就和词一起背。</>
            ) : (
              <>Plural means de,<br />diminutive means het,<br />endings give clues,<br />compounds follow the final noun,<br />unclear words become chunks.</>
            )}
          </p>
        </section>
          </>
        ) : null}
      </div>
      ) : null}

      {activePart === "checklist" ? (
      <section className="mt-8 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "高频词检查表" : "High-frequency noun checklist"}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {orderedNouns.map((item) => {
            const isFocus = item.singular === focusSingular;
            return (
              <article key={item.id} className={`rounded-2xl p-4 ${isFocus ? "bg-ink text-white" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className={`text-xl font-black ${isFocus ? "text-white" : "text-ink"}`}>{item.article} {item.singular}</h4>
                    <p className={`mt-1 text-sm font-bold ${isFocus ? "text-blue-50" : "text-ocean/70"}`}>
                      {language === "zh" ? "复数：" : "Plural:"} de {item.plural}
                    </p>
                  </div>
                  <AudioButtonLocal text={`${item.article} ${item.singular}`} speakDutch={speakDutch} />
                </div>
                <p className="mt-4 rounded-2xl bg-skywash p-3 text-sm font-bold leading-6 text-ocean">{item.ruleHint[language]}</p>
              </article>
            );
          })}
        </div>
      </section>
      ) : null}
    </section>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <>
      <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION {number}</p>
      <h4 className="mt-2 text-3xl font-black text-ink">{title}</h4>
    </>
  );
}

function MemoryHook({ text }: { text: string }) {
  return <p className="mt-5 rounded-2xl bg-peach p-4 text-xl font-black leading-8 text-ink">{text}</p>;
}

function MistakeInline({ wrong, correct, reason, speakDutch }: { wrong: string; correct: string; reason: string; speakDutch: (text: string) => void }) {
  const { language } = useLanguage();

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <p className="text-lg font-black text-red-600">✕ {wrong}</p>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-mint p-3">
        <p className="text-lg font-black text-ocean">✓ {correct}</p>
        <AudioButtonLocal text={correct} speakDutch={speakDutch} />
      </div>
      <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">
        {language === "zh" ? "原因：" : "Why: "}
        {reason}
      </p>
    </div>
  );
}

function EndingCard({ card, speakDutch }: { card: { ending: string; examples: string[] }; speakDutch: (text: string) => void }) {
  return (
    <article className="rounded-2xl bg-white p-4">
      <p className="text-2xl font-black text-ink">{card.ending}</p>
      <div className="mt-3 grid gap-2">
        {card.examples.map((example) => (
          <div key={example} className="flex items-center justify-between gap-2 rounded-xl bg-skywash px-3 py-2">
            <span className="font-black text-ocean">{example}</span>
            <AudioButtonLocal text={example} speakDutch={speakDutch} />
          </div>
        ))}
      </div>
    </article>
  );
}

function AudioButtonLocal({ text, speakDutch }: { text: string; speakDutch: (text: string) => void }) {
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => speakDutch(text)}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
      aria-label={`Play ${text}`}
    >
      <Play size={13} />
      {language === "zh" ? "听" : "Play"}
    </button>
  );
}
