"use client";

import { useMemo, useState } from "react";
import { Search, Volume2 } from "lucide-react";
import type { DecoderExamples } from "@/data/soundLessons";
import { useLanguage } from "@/lib/i18n";

type DecodedChunk = {
  text: string;
  match: boolean;
  soundKey?: string;
};

const sandboxSounds = [
  "sch",
  "sj",
  "tj",
  "ij",
  "ei",
  "oe",
  "ui",
  "eu",
  "ou",
  "au",
  "ai",
  "ie",
  "aa",
  "ee",
  "oo",
  "uu",
  "ch",
  "ng",
  "nk",
  "en",
  "g",
  "v",
  "w",
  "r",
];

const soundAliases: Record<string, string> = {
  ei: "ij / ei",
  ij: "ij / ei",
  ou: "ou / au",
  au: "ou / au",
  ch: "g / ch",
  g: "g / ch",
  sj: "sj / tj",
  tj: "sj / tj",
  en: "-en",
};

const soundPointRules: Record<string, { zh: string; en: string }> = {
  aa: {
    zh: "aa：张大嘴，长一点，像医生检查喉咙时的“大啊”。",
    en: "aa: open wide and hold it, like a doctor-checkup aa.",
  },
  ee: {
    zh: "ee：嘴角微笑拉开，声音稳定，不要读成英文字母 E。",
    en: "ee: light smile shape, steady sound; avoid the English letter E.",
  },
  ie: {
    zh: "ie：嘴角往两边拉，像拍照假笑的长“衣”。",
    en: "ie: pull the mouth corners wide, like a photo-smile ee.",
  },
  oo: {
    zh: "oo：嘴唇向前缩成圆洞，长长地“哦——”。",
    en: "oo: push the lips forward into a round hole and hold it.",
  },
  uu: {
    zh: "uu：嘴唇像“吁”，舌头像“衣”，别读成 English you。",
    en: "uu: rounded lips with an ee tongue position; do not say English you.",
  },
  "ij / ei": {
    zh: "ij/ei：两个现代发音一样，从“啊”快速滑向“哎”。",
    en: "ij/ei: same modern sound; glide quickly from open ah toward ay.",
  },
  oe: {
    zh: "oe：稳定的圆唇“乌”，不是“欧”。",
    en: "oe: steady rounded oo, not English oh.",
  },
  ui: {
    zh: "ui：先“呃”，再把嘴唇收圆，是荷兰语高难音。",
    en: "ui: start with uh, then round the lips; a key Dutch challenge sound.",
  },
  eu: {
    zh: "eu：前舌 + 圆唇，像“呃”被挤进小圆管。",
    en: "eu: front tongue plus rounded lips, like uh through a small round tube.",
  },
  "ou / au": {
    zh: "ou/au：从“啊”滑到圆嘴，像更夸张的 how/嗷。",
    en: "ou/au: glide from open ah into rounded lips, close to a strong how/ow.",
  },
  ai: {
    zh: "ai：少见组合，嘴角拉宽，比普通“哎”更扁。",
    en: "ai: rare chunk; wider and flatter than a normal ay.",
  },
  "g / ch": {
    zh: "g/ch：喉咙后部摩擦，气流要刮出来，不是 English go 的 g。",
    en: "g/ch: back-of-throat friction, not the hard g in English go.",
  },
  "sj / tj": {
    zh: "sj/tj：sj 像短促 sh；tj 常在 -tje 里，轻、短、快。",
    en: "sj/tj: sj is a clipped sh; tj is light and quick, often in -tje.",
  },
  sch: {
    zh: "sch：先 s，再接荷兰语 ch，一口气连起来。",
    en: "sch: say s, then Dutch ch, connected as one movement.",
  },
  "-en": {
    zh: "-en：词尾放轻，很多时候最后 n 不要重读。",
    en: "-en: keep the ending light; final n is often reduced.",
  },
  ng: {
    zh: "ng：像 English sing 结尾，不要后面再加硬 g。",
    en: "ng: like the end of English sing; do not add a hard g.",
  },
  nk: {
    zh: "nk：先 ng 的舌位，最后轻轻放出 k。",
    en: "nk: start like ng, then release a light k.",
  },
  v: {
    zh: "v：上牙轻碰下唇，带一点摩擦。",
    en: "v: upper teeth touch lower lip with light friction.",
  },
  w: {
    zh: "w：上牙轻碰下唇再发短“乌”，不是松弛 English w。",
    en: "w: light teeth-lip contact plus a short oo, not loose English w.",
  },
  r: {
    zh: "r：可以舌尖颤，也可以偏喉音，重点是别吞掉。",
    en: "r: tongue-tip or throat r can work; keep it audible.",
  },
};

const normalizeSoundKey = (sound: string) => soundAliases[sound] ?? sound;

function decodeWord(word: string, combinations: string[]) {
  const lower = word.toLowerCase().trim();
  const soundList = Array.from(new Set([...combinations, ...sandboxSounds]))
    .map((sound) => sound.toLowerCase())
    .sort((a, b) => b.length - a.length);
  const chunks: DecodedChunk[] = [];
  let index = 0;

  while (index < lower.length) {
    const matched = soundList.find((sound) => {
      if (!lower.startsWith(sound, index)) return false;
      if (sound === "en") return index + sound.length === lower.length;
      return true;
    });
    if (matched) {
      chunks.push({
        text: lower.slice(index, index + matched.length),
        match: true,
        soundKey: normalizeSoundKey(matched),
      });
      index += matched.length;
    } else {
      chunks.push({ text: lower[index], match: false });
      index += 1;
    }
  }

  return chunks;
}

function uniqueSoundKeys(chunks: DecodedChunk[]) {
  return Array.from(new Set(chunks.flatMap((chunk) => (chunk.soundKey ? [chunk.soundKey] : []))));
}

export function InteractiveWordDecoder({
  decoderExamples,
  soundCombinations,
  initialWord = "ziekenhuis",
}: {
  decoderExamples: DecoderExamples;
  soundCombinations: string[];
  initialWord?: string;
}) {
  const { t, language } = useLanguage();
  const [word, setWord] = useState(initialWord);
  const [voiceStatus, setVoiceStatus] = useState("");
  const chunks = useMemo(() => decodeWord(word, soundCombinations), [word, soundCombinations]);
  const soundKeys = useMemo(() => uniqueSoundKeys(chunks), [chunks]);
  const pronunciationHints = soundKeys
    .map((key) => soundPointRules[key]?.[language])
    .filter((hint): hint is string => Boolean(hint));
  const supportedWords = Object.keys(decoderExamples);
  const hasHighlightedChunks = chunks.some((chunk) => chunk.match);

  const sandboxHint =
    language === "zh"
      ? "这里不解释词义，只帮你先把词读出来。例句和词义去每日单词泡泡里看。"
      : "This tool does not explain meanings. It helps you read the word first; examples and meanings live in Word Bubbles.";

  const speakDutchWord = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) {
      setVoiceStatus(language === "zh" ? "先输入一个词。" : "Type a word first.");
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceStatus(language === "zh" ? "当前浏览器不支持朗读。" : "This browser does not support speech playback.");
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    utterance.pitch = 1;

    const voices = synth.getVoices();
    const dutchVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("nl")) ??
      voices.find((voice) => voice.name.toLowerCase().includes("dutch"));

    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    utterance.onstart = () => setVoiceStatus(language === "zh" ? `正在朗读：${cleanText}` : `Playing: ${cleanText}`);
    utterance.onend = () => setVoiceStatus("");
    utterance.onerror = () =>
      setVoiceStatus(
        language === "zh"
          ? "朗读没有播出来，请再点一次或检查浏览器声音。"
          : "Speech did not play. Click again or check browser sound.",
      );

    setVoiceStatus(language === "zh" ? `准备朗读：${cleanText}` : `Preparing: ${cleanText}`);
    synth.speak(utterance);
  };

  return (
    <section className="rounded-[32px] bg-ink p-5 text-white shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-200">{t("pronunciation.wordDecoder")}</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t("pronunciation.inputTitle")}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-blue-50">
            {t("pronunciation.inputHelp")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => speakDutchWord(word)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-ink transition hover:bg-peach"
          >
            <Volume2 size={18} className="text-pop" />
            {language === "zh" ? "听这个词" : "Hear this word"}
          </button>
          <span className="text-xs font-bold text-blue-100">
            {voiceStatus || (language === "zh" ? "浏览器内置荷兰语朗读" : "Built-in browser Dutch voice")}
          </span>
        </div>
      </div>

      <label className="mt-7 flex items-center gap-3 rounded-full bg-white px-4 py-3 text-ink">
        <Search size={20} className="shrink-0 text-pop" />
        <input
          value={word}
          onChange={(event) => setWord(event.target.value)}
          onInput={(event) => setWord(event.currentTarget.value)}
          className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none"
          placeholder="Try: afspraak, trein, goed..."
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="flex items-center rounded-full bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-200">
          {language === "zh" ? "试读例词" : "Try examples"}
        </span>
        {supportedWords.map((item) => (
          <button
            key={item}
            onClick={() => setWord(item)}
            className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-blue-50 transition hover:bg-white/20"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-7 rounded-[24px] bg-white/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-200">{t("label.highlightedChunks")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {chunks.map((chunk, index) => (
            <span
              key={`${chunk.text}-${index}`}
              className={`rounded-2xl px-4 py-3 text-lg font-black ${
                chunk.match ? "bg-pop text-ink" : "bg-white/10 text-white"
              }`}
            >
              {chunk.text}
            </span>
          ))}
        </div>
        {!hasHighlightedChunks ? (
          <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold leading-6 text-blue-50">
            {language === "zh"
              ? "这个词没有明显特殊音块。先听整体，再按字母顺读。"
              : "No obvious special chunk detected. Listen to the whole word first, then read it letter by letter."}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 text-ink">
          <p className="text-sm font-black text-pop">{t("label.pronunciationHints")}</p>
          <div className="mt-3 space-y-2">
            {(pronunciationHints.length
              ? pronunciationHints
              : [
                  language === "zh"
                    ? "先点“听这个词”，听整体重音和节奏。"
                    : "Click “Hear this word” first and listen for the whole rhythm.",
                  language === "zh"
                    ? "没有高亮不代表不能练，只代表这个词没有明显特殊组合音。"
                    : "No highlight does not mean no practice; it just means there is no obvious special chunk.",
                ]
            ).map((hint) => (
              <p key={hint} className="text-sm font-bold leading-6 text-ocean">
                {hint}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-ink">
          <p className="text-sm font-black text-pop">{language === "zh" ? "相关发音点" : "Related sound points"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(soundKeys.length ? soundKeys : [language === "zh" ? "基础字母音" : "Basic letter sounds"]).map((lesson) => (
              <span key={lesson} className="rounded-full bg-skywash px-3 py-2 text-sm font-black text-ocean">
                {lesson}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-ink">
          <p className="text-sm font-black text-pop">{language === "zh" ? "跟读建议" : "Repeat plan"}</p>
          <div className="mt-3 space-y-2 text-sm font-bold leading-6 text-ocean">
            <p>{language === "zh" ? "1. 先听一遍完整词。" : "1. Listen to the whole word once."}</p>
            <p>{language === "zh" ? "2. 盯住橙色音块，慢读两遍。" : "2. Watch the orange chunks and read slowly twice."}</p>
            <p>{language === "zh" ? "3. 最后不看拆分，直接读完整词。" : "3. Then read the full word without the split view."}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold leading-6 text-blue-50">
        {sandboxHint}
      </p>
    </section>
  );
}
