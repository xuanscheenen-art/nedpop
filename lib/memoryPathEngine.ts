import { relationLexicons } from "@/data/relationLexicons";
import { checkMemoryPathQuality } from "@/lib/checkMemoryPathQuality";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { badGenericTargetTemplateIssue, isBroadGenericQuestionTemplate, isKnownBadLearnerLine } from "@/lib/exampleQualityRules";
import { phraseChunkMeaningFor } from "@/lib/exampleTemplates";
import {
  classifyMemoryPathWord,
  compoundBreakdowns,
  countryNames,
  dayMonthWords,
  englishBridgeSeeds,
  fixedExpressionSeeds,
  functionWordSeeds,
  funMemorySeeds,
  fixedOutputSentences,
  functionWords,
  greetingPhraseWords,
  languageNames,
  lexicalMeaningFor,
  memoryPhraseSeeds,
  numberWords,
  phraseBasedWords,
  phraseMeaningForMemoryPath,
  usageAnchorFor,
  wordFormationSeeds,
  type EnglishBridgeSeed,
  type FixedExpressionSeed,
  type FunctionWordSeed,
  type MemoryPathPart,
  type SeededBreakdown,
  type WordFormationSeed,
} from "@/lib/memoryPathStrategies";
import { normalizeWordText } from "@/lib/wordAnalysis";
import type { WordAssociation } from "@/lib/wordAssociations";
import type { ExampleSentence, MemoryPath, MemoryPathStrategy, MemoryPathWordType, PhraseChunk, WordItem } from "@/types/vocabulary";

export type MemoryPathContext = {
  allWords?: WordItem[];
  memoryBubbles?: WordAssociation[];
  phraseChunks?: PhraseChunk[];
  examples?: ExampleSentence[];
};

type MeaningContrast = {
  peers: MemoryPathPart[];
  comparisonZh: string;
  comparisonEn: string;
  noteZh: string;
  noteEn: string;
};

const meaningContrastNotes: Record<string, Omit<MeaningContrast, "peers">> = {
  goed: {
    comparisonZh: "goed = 最通用的“好/顺利”；prima / fijn / oké 是相近但语气不同。",
    comparisonEn: "goed is the broad good / going well word; prima / fijn / oké are nearby but differ in tone.",
    noteZh: "prima 更像“可以/挺好”，fijn 偏“舒服/愉快”，oké 偏“可以/没问题”。",
    noteEn: "prima is more fine / good enough, fijn is pleasant / nice, and oké is neutral okay / no problem.",
  },
  prima: {
    comparisonZh: "prima = “挺好/可以/没问题”；和 goed / fijn / oké 放在一起比较。",
    comparisonEn: "prima means fine / good enough / no problem; compare it with goed / fijn / oké.",
    noteZh: "goed 最通用，fijn 偏感受舒服/愉快，oké 更中性；prima 通常比 oké 更积极一点。",
    noteEn: "goed is the broadest, fijn feels pleasant, oké is more neutral; prima is usually a little more positive than oké.",
  },
  fijn: {
    comparisonZh: "fijn = “舒服/愉快/好”；和 goed / prima / oké 都近义，但更强调感受。",
    comparisonEn: "fijn means pleasant / nice / fine; it is close to goed / prima / oké but focuses more on feeling.",
    noteZh: "说体验、安排、消息让人舒服时用 fijn；普通“好”仍然先用 goed。",
    noteEn: "Use fijn for pleasant feelings, plans, or news; use goed for the broad ordinary good.",
  },
  "oké": {
    comparisonZh: "oké = “可以/好的/没问题”；比 prima 更中性。",
    comparisonEn: "oké means okay / fine / no problem; it is more neutral than prima.",
    noteZh: "确认安排时 oké 很自然；评价很积极时可用 prima 或 goed。",
    noteEn: "oké is natural for confirming; use prima or goed for a more positive evaluation.",
  },
  oke: {
    comparisonZh: "oké = “可以/好的/没问题”；oke 是无重音写法。",
    comparisonEn: "oké means okay / fine / no problem; oke is the unaccented spelling.",
    noteZh: "学习时按 oké 记；语气比 prima 更中性。",
    noteEn: "Learn it as oké; its tone is more neutral than prima.",
  },
};

const badOutputPatterns = [
  /^Dit is (de|het)\s+[a-zA-ZÀ-ÿ'’.-]+\.?$/i,
  /^(de|het|een)\s+[a-zA-ZÀ-ÿ'’.-]+\.?$/i,
  /\b(ik|jij|je|u|hij|zij|ze|wij|we|jullie)\s+\1\b/i,
];

const looksLikeAnalyticGloss = (value?: string) => {
  const text = value?.trim() ?? "";
  if (!text) return false;
  return /(^|[\s，。])[^，。.!?]{1,12}\s[+＋]\s[^，。.!?]{1,12}/.test(text);
};

const isUsableOutput = (word: WordItem, sentence: { dutch: string; meaningZh?: string; meaningEn?: string }) =>
  Boolean(sentence.dutch.trim() && sentence.meaningZh?.trim() && sentence.meaningEn?.trim()) &&
  !looksLikeAnalyticGloss(sentence.meaningZh) &&
  !looksLikeAnalyticGloss(sentence.meaningEn) &&
  !isKnownBadLearnerLine(sentence.dutch.trim()) &&
  !badOutputPatterns.some((pattern) => pattern.test(sentence.dutch.trim())) &&
  !badGenericTargetTemplateIssue(word, sentence.dutch.trim());

const isWeakGenericOutput = isBroadGenericQuestionTemplate;

const phraseLike = (value: string) => value.trim().split(/\s+/).filter(Boolean).length > 1;

const targetUseExemptTypes = new Set<MemoryPathWordType>(["number", "function-word", "language-name", "country-name", "day-month"]);
const phraseStopTokens = new Set(["de", "het", "een"]);
const dutchTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;

const containsDutchToken = (sentence: string, token: string) =>
  Boolean(token.trim()) &&
  new RegExp(`(^|\\W)${token.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(sentence);

const phraseCoreTokens = (value: string) =>
  Array.from(value.toLowerCase().matchAll(dutchTokenPattern), (match) => match[0])
    .filter((token) => !phraseStopTokens.has(token));

function textContainsPhraseUse(word: WordItem, text: string) {
  const phrase = word.dutch.trim();
  if (!phrase) return false;
  if (containsDutchToken(text, phrase)) return true;

  const tokens = phraseCoreTokens(phrase);
  return tokens.length > 0 && tokens.every((token) => containsDutchToken(text, token));
}

const adjectiveEForm = (adjective: string) => {
  const irregular: Record<string, string> = { groot: "grote", oud: "oude", nieuw: "nieuwe", duur: "dure", goedkoop: "goedkope" };
  return irregular[normalizeWordText(adjective)] ?? `${adjective}e`;
};

function targetFormsFor(word: WordItem) {
  const wordType = classifyMemoryPathWord(word);
  const forms = new Set([word.dutch, word.plural ?? ""]);

  if (wordType === "verb") {
    const verb = verbUsageFor(word);
    if (verb) {
      [verb.infinitive, verb.ikForm, verb.jijForm, verb.wijForm].forEach((form) => {
        form.split("/").forEach((part) => {
          const trimmed = part.trim();
          if (!trimmed) return;
          forms.add(trimmed);
          const lastToken = trimmed.split(/\s+/).pop();
          if (lastToken && lastToken.length >= 3) forms.add(lastToken);
        });
      });
    }
  }

  if (wordType === "adjective") forms.add(adjectiveEForm(word.dutch));

  return Array.from(forms).filter(Boolean);
}

function textContainsTargetUse(word: WordItem, text: string) {
  const wordType = classifyMemoryPathWord(word);
  if (wordType === "phrase") return textContainsPhraseUse(word, text);
  if (targetUseExemptTypes.has(wordType)) return true;
  return targetFormsFor(word).some((form) => containsDutchToken(text, form));
}

function localizedPhrase(chunk: string) {
  const seeded = phraseMeaningForMemoryPath(chunk);
  const generated = phraseChunkMeaningFor(chunk);
  return {
    dutch: chunk,
    meaningZh: seeded.zh || generated?.zh || "",
    meaningEn: seeded.en || generated?.en || "",
  };
}

const localizedMemoryPhraseSeed = (seed: { dutch: string; meaningZh: string; meaningEn: string }) => ({
  dutch: seed.dutch,
  meaningZh: seed.meaningZh,
  meaningEn: seed.meaningEn,
});

const preferredMemoryPhraseChunks: Record<string, string[]> = {
  open: ["open de app"],
  auto: ["met de auto"],
  halte: ["naar de halte gaan"],
  station: ["naar het station gaan"],
  bus: ["de bus nemen"],
  trein: ["de trein nemen"],
  fiets: ["met de fiets"],
};

const normalizeChunkText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

const looksLikePlaceholderChunk = (value: string) => /(?:\.\.\.|…)/.test(value);

function isBareTargetChunk(word: WordItem, chunk: string) {
  if (word.dutch.trim().split(/\s+/).length > 1) return false;
  const normalizedChunk = normalizeChunkText(chunk);
  const normalizedTarget = normalizeChunkText(word.dutch);
  const articleChunk = word.article ? `${word.article} ${normalizedTarget}` : "";
  return normalizedChunk === normalizedTarget || normalizedChunk === articleChunk;
}

function fallbackPhraseMeaningFor(word: WordItem, chunk: string, allWords: WordItem[]) {
  const key = normalizeWordText(word.dutch);
  const tokens = phraseCoreTokens(chunk);
  const tokenMeanings = tokens
    .map((token) => {
      const meaning = normalizeWordText(token) === key ? word.meaning : lexicalMeaningFor(token, allWords);
      if (!meaning?.zh || !meaning.en) return undefined;
      return {
        zh: meaning.zh.split(/[\/,;，；、]/)[0].trim(),
        en: meaning.en.split(/[\/,;]|\bor\b/)[0].trim(),
      };
    })
    .filter(Boolean) as { zh: string; en: string }[];

  const uniqueMeanings = tokenMeanings.filter((meaning, index, meanings) =>
    meanings.findIndex((item) => item.zh === meaning.zh && item.en === meaning.en) === index,
  );

  if (uniqueMeanings.length >= 2) {
    return {
      zh: `含「${primaryMeaning(word, "zh")}」的常用短语`,
      en: `common chunk with "${primaryMeaning(word, "en")}"`,
    };
  }
  if (uniqueMeanings.length === 1) {
    return {
      zh: `和「${uniqueMeanings[0].zh}」一起用`,
      en: `chunk with "${uniqueMeanings[0].en}"`,
    };
  }

  return {
    zh: `和「${primaryMeaning(word, "zh")}」一起用`,
    en: `chunk with "${primaryMeaning(word, "en")}"`,
  };
}

function cleanPhraseChunks(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const allWords = context.allWords ?? [word];
  const fromSeed = (memoryPhraseSeeds[key] ?? [])
    .filter((chunk) => textContainsTargetUse(word, chunk.dutch))
    .map(localizedMemoryPhraseSeed);
  const fromPreferred = (preferredMemoryPhraseChunks[key] ?? [])
    .filter((chunk) => textContainsTargetUse(word, chunk))
    .map(localizedPhrase);
  const fromContext = (context.phraseChunks ?? [])
    .filter((chunk) => !looksLikePlaceholderChunk(chunk.dutch) && (
      (Array.isArray(chunk.relatedWords) && chunk.relatedWords.map(normalizeWordText).includes(key)) ||
      textContainsTargetUse(word, chunk.dutch)
    ) && textContainsTargetUse(word, chunk.dutch))
    .map((chunk) => ({
      dutch: chunk.dutch,
      meaningZh: chunk.meaning.zh,
      meaningEn: chunk.meaning.en,
    }));
  const fromWord = word.phraseChunks
    .filter((chunk) =>
      chunk &&
      !looksLikePlaceholderChunk(chunk) &&
      normalizeWordText(chunk) !== key &&
      chunk !== `${word.dutch}.` &&
      textContainsTargetUse(word, chunk)
    )
    .map(localizedPhrase);

  const uniqueChunks = [...fromSeed, ...fromPreferred, ...fromContext, ...fromWord]
    .filter((chunk, index, chunks) => chunks.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(chunk.dutch)) === index);
  const chunksWithWordMeanings = uniqueChunks.map((chunk) => {
    if (chunk.meaningZh && chunk.meaningEn) {
      return chunk;
    }
    if (normalizeChunkText(chunk.dutch) !== normalizeChunkText(word.exampleSentence.dutch)) {
      const fallback = fallbackPhraseMeaningFor(word, chunk.dutch, allWords);
      return {
        ...chunk,
        meaningZh: fallback.zh,
        meaningEn: fallback.en,
      };
    }
    return {
      ...chunk,
      meaningZh: word.exampleSentence.meaning.zh,
      meaningEn: word.exampleSentence.meaning.en,
    };
  });
  const usefulChunks = chunksWithWordMeanings.filter((chunk) => !isBareTargetChunk(word, chunk.dutch));

  return (usefulChunks.length ? usefulChunks : chunksWithWordMeanings).slice(0, 4);
}

function generatedSentenceCandidates(word: WordItem, context: MemoryPathContext) {
  const existing = (context.examples ?? []).map((example) => ({
    dutch: example.dutch,
    meaningZh: example.meaning.zh,
    meaningEn: example.meaning.en,
    trustedTargetUse: false,
    sourceRank: 0,
  }));
  const generated = generateExamplesForWord(word, { existingExamples: context.examples })
    .filter((example: GeneratedExample) => example.confidence !== "low" && !example.needsHumanReview && !(example.qualityIssues?.length))
    .map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaningZh,
      meaningEn: example.meaningEn,
      trustedTargetUse: true,
      sourceRank: 2,
    }));
  const fallback = {
    dutch: word.exampleSentence.dutch,
    meaningZh: word.exampleSentence.meaning.zh,
    meaningEn: word.exampleSentence.meaning.en,
    trustedTargetUse: true,
    sourceRank: 1,
  };

  return [...existing, ...generated, fallback]
    .filter((sentence) => isUsableOutput(word, sentence))
    .filter((sentence) => sentence.trustedTargetUse || textContainsTargetUse(word, sentence.dutch))
    .filter((sentence, index, sentences) => sentences.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(sentence.dutch)) === index)
    .sort((a, b) => {
      const weakDiff = Number(isWeakGenericOutput(a.dutch)) - Number(isWeakGenericOutput(b.dutch));
      if (weakDiff) return weakDiff;
      return a.sourceRank - b.sourceRank;
    });
}

const exactScenarioOutputs: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  gemeente: { dutch: "Ik moet naar de gemeente.", meaningZh: "我必须去市政厅。", meaningEn: "I have to go to the municipality." },
  vandaag: { dutch: "Ik kom vandaag.", meaningZh: "我今天来。", meaningEn: "I am coming today." },
  morgen: { dutch: "Ik kom morgen.", meaningZh: "我明天来。", meaningEn: "I am coming tomorrow." },
  gisteren: { dutch: "Ik was gisteren thuis.", meaningZh: "我昨天在家。", meaningEn: "I was at home yesterday." },
  straks: { dutch: "Ik kom straks.", meaningZh: "我一会儿来。", meaningEn: "I will come soon." },
  meteen: { dutch: "Ik kom meteen.", meaningZh: "我马上来。", meaningEn: "I will come immediately." },
  daarna: { dutch: "Daarna ga ik naar huis.", meaningZh: "之后我回家。", meaningEn: "After that I go home." },
  eerst: { dutch: "Eerst betaal ik.", meaningZh: "我先付款。", meaningEn: "First I pay." },
  laatst: { dutch: "Ik was laatst ziek.", meaningZh: "我最近生病了。", meaningEn: "I was sick recently." },
  thuis: { dutch: "Ik ben thuis.", meaningZh: "我在家。", meaningEn: "I am at home." },
  pinnen: { dutch: "Kan ik hier pinnen?", meaningZh: "我可以在这里刷卡吗？", meaningEn: "Can I pay by card here?" },
  oefenen: { dutch: "Ik oefen Nederlands.", meaningZh: "我练习荷兰语。", meaningEn: "I practise Dutch." },
  weten: { dutch: "Ik weet het.", meaningZh: "我知道。", meaningEn: "I know." },
  denken: { dutch: "Ik denk aan morgen.", meaningZh: "我在想明天。", meaningEn: "I am thinking about tomorrow." },
  vertellen: { dutch: "Ik vertel mijn naam.", meaningZh: "我说出我的名字。", meaningEn: "I tell my name." },
  vinden: { dutch: "Ik vind het goed.", meaningZh: "我觉得可以。", meaningEn: "I think it is good." },
  meenemen: { dutch: "Ik neem mijn tas mee.", meaningZh: "我带上我的包。", meaningEn: "I take my bag with me." },
  ontbreken: { dutch: "Er ontbreekt een document.", meaningZh: "缺少一份文件。", meaningEn: "A document is missing." },
  handleiding: { dutch: "Ik lees de handleiding.", meaningZh: "我读说明书。", meaningEn: "I read the manual." },
  familie: { dutch: "Mijn familie woont hier.", meaningZh: "我的家人住在这里。", meaningEn: "My family lives here." },
  dokter: { dutch: "Ik ga naar de dokter.", meaningZh: "我去看医生。", meaningEn: "I go to the doctor." },
  rust: { dutch: "Ik neem even rust.", meaningZh: "我休息一下。", meaningEn: "I take a short rest." },
  week: { dutch: "Deze week heb ik tijd.", meaningZh: "这周我有时间。", meaningEn: "I have time this week." },
  maand: { dutch: "Deze maand betaal ik de huur.", meaningZh: "这个月我付房租。", meaningEn: "This month I pay the rent." },
  jaar: { dutch: "Dit jaar leer ik Nederlands.", meaningZh: "今年我学荷兰语。", meaningEn: "This year I learn Dutch." },
  "elke week": { dutch: "Ik oefen elke week.", meaningZh: "我每周练习。", meaningEn: "I practise every week." },
  "per maand": { dutch: "Ik betaal per maand.", meaningZh: "我按月付款。", meaningEn: "I pay per month." },
  ochtend: { dutch: "Ik werk in de ochtend.", meaningZh: "我上午工作。", meaningEn: "I work in the morning." },
  namiddag: { dutch: "Ik kom in de namiddag.", meaningZh: "我下午晚些时候来。", meaningEn: "I come in the late afternoon." },
  nacht: { dutch: "Ik slaap in de nacht.", meaningZh: "我夜里睡觉。", meaningEn: "I sleep at night." },
  middernacht: { dutch: "Ik slaap om middernacht.", meaningZh: "我午夜时在睡觉。", meaningEn: "I sleep at midnight." },
  middagpauze: { dutch: "Ik heb middagpauze.", meaningZh: "我有午休。", meaningEn: "I have a lunch break." },
  werkdag: { dutch: "Vandaag is een werkdag.", meaningZh: "今天是工作日。", meaningEn: "Today is a workday." },
  feestdag: { dutch: "Vandaag is een feestdag.", meaningZh: "今天是节日/假日。", meaningEn: "Today is a holiday." },
  verjaardag: { dutch: "Vandaag is mijn verjaardag.", meaningZh: "今天是我的生日。", meaningEn: "Today is my birthday." },
  kalender: { dutch: "De afspraak staat in de kalender.", meaningZh: "预约在日历里。", meaningEn: "The appointment is in the calendar." },
  voetbal: { dutch: "Ik speel voetbal.", meaningZh: "我踢足球。", meaningEn: "I play football." },
  tennis: { dutch: "Ik speel tennis.", meaningZh: "我打网球。", meaningEn: "I play tennis." },
  televisie: { dutch: "Ik kijk televisie.", meaningZh: "我看电视。", meaningEn: "I watch television." },
  camera: { dutch: "Ik gebruik de camera.", meaningZh: "我使用相机。", meaningEn: "I use the camera." },
};

const capitalizedDutch = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function outputFromSentenceLikePhrase(word: WordItem, context: MemoryPathContext) {
  const sentenceChunk = cleanPhraseChunks(word, context).find((chunk) =>
    /^(Ik|Jij|Je|U|Hij|Zij|Ze|Wij|We|De|Het|Mijn|Uw|Dit|Dat|Er|Kan|Kunt|Mag|Moet|Waar|Wat|Hoe)\b/.test(chunk.dutch.trim()),
  );
  if (!sentenceChunk?.dutch) return undefined;

  const dutch = /[.!?]$/.test(sentenceChunk.dutch.trim()) ? sentenceChunk.dutch.trim() : `${sentenceChunk.dutch.trim()}.`;
  const sameAsWordExample = normalizeChunkText(dutch) === normalizeChunkText(word.exampleSentence.dutch);
  const meaningZh = sentenceChunk.meaningZh || (sameAsWordExample ? word.exampleSentence.meaning.zh : "");
  const meaningEn = sentenceChunk.meaningEn || (sameAsWordExample ? word.exampleSentence.meaning.en : "");
  if (!meaningZh || !meaningEn) return undefined;
  return { dutch, meaningZh, meaningEn, trustedTargetUse: true };
}

function scenarioOutputSentenceFor(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const exact = exactScenarioOutputs[key];
  if (exact) return { ...exact, trustedTargetUse: true };

  const fromPhrase = outputFromSentenceLikePhrase(word, context);
  if (fromPhrase && isUsableOutput(word, fromPhrase) && !isWeakGenericOutput(fromPhrase.dutch)) return fromPhrase;

  const wordType = classifyMemoryPathWord(word);
  const tags = [word.theme, ...word.scenarioTags].map(normalizeWordText).join(" ");
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const articlePhrase = articleWord(word);

  if (wordType === "language-name") {
    const language = capitalizedDutch(word.dutch);
    return {
      dutch: `Ik spreek ${language}.`,
      meaningZh: `我说${zh}。`,
      meaningEn: `I speak ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "country-name") {
    const country = capitalizedDutch(word.dutch);
    return {
      dutch: `Ik kom uit ${country}.`,
      meaningZh: `我来自${zh}。`,
      meaningEn: `I come from ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "verb") {
    const verb = verbUsageFor(word);
    const ikForm = verb?.ikForm.split("/")[0]?.trim();
    if (ikForm) {
      const dutch = /^ik\b/i.test(ikForm) ? `${capitalizedDutch(ikForm)}.` : `Ik ${ikForm}.`;
      return {
        dutch,
        meaningZh: `我${zh}。`,
        meaningEn: `I ${en}.`,
        trustedTargetUse: true,
      };
    }
  }

  if (wordType === "adjective") {
    return {
      dutch: `Dat is ${word.dutch}.`,
      meaningZh: `那是${zh}的。`,
      meaningEn: `That is ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "adverb") {
    return {
      dutch: `Ik kom ${word.dutch}.`,
      meaningZh: `我${zh}来。`,
      meaningEn: `I come ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "noun") {
    if (tags.includes("food") || tags.includes("supermarket")) {
      return { dutch: `Ik koop ${articlePhrase}.`, meaningZh: `我买${zh}。`, meaningEn: `I buy the ${en}.`, trustedTargetUse: true };
    }
    if (tags.includes("clothes")) {
      return { dutch: `Ik draag ${articlePhrase}.`, meaningZh: `我穿/戴${zh}。`, meaningEn: `I wear the ${en}.`, trustedTargetUse: true };
    }
    if (tags.includes("money") || tags.includes("payment")) {
      if (["pinpas", "bankpas", "creditcard"].includes(key)) {
        return { dutch: `Ik betaal met ${articlePhrase}.`, meaningZh: `我用${zh}付款。`, meaningEn: `I pay with the ${en}.`, trustedTargetUse: true };
      }
      return undefined;
    }
    if (tags.includes("time")) {
      return undefined;
    }
    return undefined;
  }

  return undefined;
}

function outputSentenceFor(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const fixed = fixedOutputSentences[key];
  if (fixed && isUsableOutput(word, fixed) && !isWeakGenericOutput(fixed.dutch)) return fixed;
  const exact = exactScenarioOutputs[key];
  if (exact && isUsableOutput(word, exact) && !isWeakGenericOutput(exact.dutch)) return { ...exact, trustedTargetUse: true };
  const scenario = scenarioOutputSentenceFor(word, context);
  if (scenario && isUsableOutput(word, scenario) && !isWeakGenericOutput(scenario.dutch)) return scenario;
  const candidates = generatedSentenceCandidates(word, context);
  const nonGeneric = candidates.find((sentence) => !isWeakGenericOutput(sentence.dutch));
  if (nonGeneric) return nonGeneric;
  return undefined;
}

function dynamicBreakdownFor(word: WordItem, allWords: WordItem[]): SeededBreakdown | undefined {
  const key = normalizeWordText(word.dutch);
  const parts = relationLexicons.compoundParts[key];
  if (!parts || parts.length < 2) return undefined;
  const breakdownParts = parts
    .map((part) => {
      const meaning = lexicalMeaningFor(part, allWords);
      if (!meaning) return undefined;
      return {
        dutch: part,
        meaningZh: meaning.zh,
        meaningEn: meaning.en,
      };
    })
    .filter(Boolean) as SeededBreakdown["parts"];
  if (breakdownParts.length < 2) return undefined;
  return {
    parts: breakdownParts,
    noteZh: `${word.dutch} 是由 ${breakdownParts.map((part) => part.dutch).join(" + ")} 拼起来的。先认出这些小块，整词就不用死背。`,
    noteEn: `${word.dutch} is built from ${breakdownParts.map((part) => part.dutch).join(" + ")}. Spot these pieces first, then the whole word is easier to remember.`,
  };
}

function englishBridgeFor(word: WordItem) {
  const key = normalizeWordText(word.dutch);
  const seeded = englishBridgeSeeds[key];
  if (seeded) return seeded;
  const primaryEnglish = normalizeWordText(word.meaning.en.split(/[\/,;]/)[0] ?? "");
  const dynamic = dynamicEnglishBridgeFor(word, key);
  if (dynamic) return dynamic;
  if (!word.englishBridge?.trim()) return undefined;
  const looksLikeMeaning =
    primaryEnglish.length >= 3 &&
    (
      key === primaryEnglish ||
      key.startsWith(primaryEnglish.slice(0, 4)) ||
      primaryEnglish.startsWith(key.slice(0, 4))
    );
  if (!looksLikeMeaning) return undefined;
  if (/sounds like|谐音|听起来像/i.test(word.englishBridge)) return undefined;
  return {
    bridge: word.englishBridge,
    noteZh: "只借英文外形做第一步提示，真正使用还要放回荷兰语句子。",
    noteEn: "Use the English-looking form only as a first hook; still learn it in Dutch sentences.",
  };
}

function normalizeBridgeToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function englishMeaningCandidates(word: WordItem) {
  const fromMeaning = word.meaning.en
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .split(/[\/,;]|\bor\b/)
    .map((part) => part.trim())
    .filter((part) => part && !part.includes(" "))
    .map(normalizeBridgeToken)
    .filter((part) => part.length >= 3);

  return fromMeaning
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .slice(0, 4);
}

function dutchBridgeCandidates(key: string) {
  const normalized = normalizeBridgeToken(key);
  const forms = [normalized];
  if (normalized.endsWith("en") && normalized.length > 4) forms.push(normalized.slice(0, -2));
  if (normalized.endsWith("t") && normalized.length > 4) forms.push(normalized.slice(0, -1));
  return forms.filter((form, index) => form.length >= 3 && forms.indexOf(form) === index);
}

function boundedEditDistance(a: string, b: string, maxDistance: number) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function isSafeEnglishBridgeMatch(dutchForm: string, english: string) {
  if (dutchForm === english) return true;
  if (dutchForm.endsWith("e") && dutchForm.slice(0, -1) === english) return true;
  if (dutchForm.endsWith("ie") && english.endsWith("y") && dutchForm.slice(0, -2) === english.slice(0, -1)) return true;
  if (dutchForm.length >= 4 && english.length >= 4) {
    if (dutchForm.startsWith(english.slice(0, 4)) || english.startsWith(dutchForm.slice(0, 4))) return true;
  }
  if (dutchForm[0] !== english[0]) return false;
  if (Math.min(dutchForm.length, english.length) >= 3 && boundedEditDistance(dutchForm, english, 1) <= 1) return true;
  return false;
}

function dynamicEnglishBridgeFor(word: WordItem, key: string): EnglishBridgeSeed | undefined {
  const english = englishMeaningCandidates(word).find((candidate) =>
    dutchBridgeCandidates(key).some((form) => isSafeEnglishBridgeMatch(form, candidate)),
  );
  if (!english) return undefined;
  const isVerbInfinitive = classifyMemoryPathWord(word) === "verb" && key.endsWith("en");
  return {
    bridge: `${word.dutch} ≈ ${english}`,
    noteZh: isVerbInfinitive
      ? `${word.dutch} 可以先借 English ${english} 抓住意思；-en 是荷兰语动词完整形式。`
      : `${word.dutch} 和 English ${english} 很近，先借英文抓住意思，再按荷兰语发音记。`,
    noteEn: isVerbInfinitive
      ? `Use English ${english} as the meaning hook; -en is the Dutch infinitive ending.`
      : `${word.dutch} is close to English ${english}; use English as the meaning hook, then pronounce it in Dutch.`,
  };
}

function meaningContrastFor(word: WordItem, allWords: WordItem[]): MeaningContrast | undefined {
  const key = normalizeWordText(word.dutch);
  const group = relationLexicons.synonyms.find((items) => items.some((item) => normalizeWordText(item) === key));
  if (!group) return undefined;
  const peers = group
    .filter((item) => normalizeWordText(item) !== key)
    .map((item) => {
      const meaning = lexicalMeaningFor(item, allWords);
      if (!meaning) return undefined;
      return {
        dutch: item,
        meaningZh: meaning.zh,
        meaningEn: meaning.en,
      };
    })
    .filter(Boolean) as MemoryPathPart[];
  const usefulPeers = peers.slice(0, 3);
  if (usefulPeers.length < 2) return undefined;
  const peerWords = usefulPeers.map((peer) => peer.dutch).join(" / ");
  const seeded = meaningContrastNotes[key];
  return {
    peers: usefulPeers,
    comparisonZh: seeded?.comparisonZh ?? `${word.dutch} ≈ ${peerWords}`,
    comparisonEn: seeded?.comparisonEn ?? `${word.dutch} ≈ ${peerWords}`,
    noteZh: seeded?.noteZh ?? `${word.dutch} 和 ${peerWords} 在词典里属于相近意思，先按词义范围对比，不靠发音硬记。`,
    noteEn: seeded?.noteEn ?? `${word.dutch} belongs near ${peerWords} in dictionary meaning; learn the meaning range, not a sound trick.`,
  };
}

function categoryDetailsFor(word: WordItem, wordType: MemoryPathWordType) {
  const key = normalizeWordText(word.dutch);
  if (languageNames.has(key)) {
    return {
      titleZh: "语言名按类别记",
      titleEn: "Language Name",
      explanationZh: `${word.dutch} 是语言名，先放进 spreken / leren 这类句子里记。`,
      explanationEn: `${word.dutch} is a language name. Learn it with spreken / leren patterns.`,
      hookZh: `把 ${word.dutch} 当作“一门语言”记。`,
      hookEn: `Remember ${word.dutch} as a language name.`,
      usageZh: "语言能力、学习、翻译或沟通。",
      usageEn: "language ability, learning, translation, or communication.",
      warningZh: key === "engels" ? "Engelsen 是英国人们，不是 het Engels 的普通复数。" : undefined,
      warningEn: key === "engels" ? "Engelsen means English people, not a normal plural of the language word." : undefined,
    };
  }
  if (countryNames.has(key)) {
    return {
      titleZh: "国家名按地点句型记",
      titleEn: "Country Name",
      explanationZh: `${word.dutch} 是国家名，常放在 in / uit 后面。`,
      explanationEn: `${word.dutch} is a country name, often used after in / uit.`,
      hookZh: `先记地点句型：uit ${word.dutch} / in ${word.dutch}。`,
      hookEn: `Start with place chunks: uit ${word.dutch} / in ${word.dutch}.`,
      usageZh: "介绍来自哪里、住在哪里。",
      usageEn: "saying where you come from or live.",
    };
  }
  if (numberWords.has(key)) {
    return {
      titleZh: "数字按顺序和听辨记",
      titleEn: "Number Word",
      explanationZh: "这是数字词，重点是听懂、读准、放进号码或数量里。",
      explanationEn: "This is a number word. Focus on recognition, pronunciation, and numbers/amounts.",
      hookZh: "数字不硬拆，按顺序分组听读。",
      hookEn: "Do not force a breakdown; learn it in number order.",
      usageZh: "电话号码、门牌号、价格、数量。",
      usageEn: "phone numbers, house numbers, prices, and quantities.",
    };
  }
  if (dayMonthWords.has(key)) {
    return {
      titleZh: "时间词按类别记",
      titleEn: "Time Category",
      explanationZh: `${word.dutch} 是时间词，放进日期、星期或月份句子里记。`,
      explanationEn: `${word.dutch} is a time word; learn it in dates, weekdays, or month sentences.`,
      hookZh: "先确定它属于星期、月份还是时间单位。",
      hookEn: "First place it in weekday, month, or time-unit categories.",
      usageZh: "约时间、填日期、说日程。",
      usageEn: "appointments, dates, and schedules.",
    };
  }
  if (wordType === "adjective" && ["rood", "blauw", "groen", "geel", "zwart", "wit"].includes(key)) {
    return {
      titleZh: "颜色词按类别记",
      titleEn: "Color Word",
      explanationZh: `${word.dutch} 是颜色词，先放进“东西是什么颜色”的句子里。`,
      explanationEn: `${word.dutch} is a color word; learn it in color-description sentences.`,
      hookZh: "颜色词先按颜色组一起听读。",
      hookEn: "Learn color words as a color group.",
      usageZh: "描述物品、衣服、交通灯。",
      usageEn: "describing objects, clothes, and traffic lights.",
    };
  }
  return undefined;
}

const trimPeriod = (value: string) => value.trim().replace(/[。.!?]+$/g, "");

const primaryMeaning = (word: WordItem, language: "zh" | "en") => {
  const value = word.meaning[language] || (language === "zh" ? word.meaning.en : word.meaning.zh) || word.dutch;
  return value
    .split(/[\/,;，；、]|\bor\b/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? value.trim();
};

const articleWord = (word: WordItem) => word.article ? `${word.article} ${word.dutch}` : word.dutch;

const lineAnchor = (
  phraseChunks: MemoryPath["phraseChunks"],
  output: MemoryPath["outputSentence"] | undefined,
  language: "zh" | "en",
) => {
  if (output?.dutch) {
    const meaning = language === "zh" ? output.meaningZh : output.meaningEn;
    return meaning ? `${output.dutch} = ${meaning}` : output.dutch;
  }
  const phrase = phraseChunks[0];
  if (phrase?.dutch) {
    const meaning = language === "zh" ? phrase.meaningZh : phrase.meaningEn;
    return meaning ? `${phrase.dutch} = ${meaning}` : phrase.dutch;
  }
  return "";
};

const weakMemoryHookPattern =
  /贴在|小标签|一看到这块|落回荷兰语|场景卡|真实用法|放进短语和例句|短语和例句|常用搭配|直接放进句子|能说出口|具体场景抓住|暂时没有强|placeholder|manual review|generic/i;

function learnerHookFromWord(word: WordItem) {
  const zh = word.memoryHook?.zh?.trim();
  const en = word.memoryHook?.en?.trim();
  if (!zh || !en) return undefined;
  const combined = `${zh} ${en}`;
  if (weakMemoryHookPattern.test(combined)) return undefined;
  if (zh.length < 8 || en.length < 8) return undefined;
  return { zh, en };
}

function practicalImageHookForWord(word: WordItem, wordType: MemoryPathWordType, output: MemoryPath["outputSentence"] | undefined, phraseChunks: MemoryPath["phraseChunks"], usage: { zh: string; en: string }) {
  const key = normalizeWordText(word.dutch);
  const lineZh = lineAnchor(phraseChunks, output, "zh");
  const lineEn = lineAnchor(phraseChunks, output, "en");
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const sceneZh = trimPeriod(usage.zh);
  const sceneEn = trimPeriod(usage.en);

  if (["vandaag", "gisteren", "morgen", "overmorgen"].includes(key)) {
    return {
      zh: `${word.dutch} 先放进时间轴，而不是单独背：gisteren ← vandaag → morgen → overmorgen。它在这条线上占哪一格，意思就出来了。`,
      en: `Put ${word.dutch} on a timeline, not in isolation: gisteren <- vandaag -> morgen -> overmorgen. Its slot gives the meaning.`,
    };
  }

  if (wordType === "verb") {
    return {
      zh: lineZh
        ? `把 ${word.dutch} 拍成一个短动作镜头：先看到人正在做这件事，再开口说「${lineZh}」。`
        : `把 ${word.dutch} 拍成一个短动作镜头：脑子里先有人正在“${meaningZh}”，再记它会随主语变形。`,
      en: lineEn
        ? `Turn ${word.dutch} into a short action shot, then say "${lineEn}".`
        : `Turn ${word.dutch} into a short action shot: someone is doing "${meaningEn}", then learn the verb forms.`,
    };
  }

  if (wordType === "adverb") {
    return {
      zh: lineZh
        ? `${word.dutch} 像给句子调时间、地点或方式的小拨片；先听它把「${lineZh}」这句话推到哪个位置。`
        : `${word.dutch} 像句子里的小拨片，负责告诉你“什么时候、哪里、怎样”。`,
      en: lineEn
        ? `${word.dutch} works like a small dial for time, place, or manner; see what it does in "${lineEn}".`
        : `${word.dutch} is a small dial in the sentence for when, where, or how.`,
    };
  }

  if (wordType === "phrase") {
    return {
      zh: `${word.dutch} 直接当一整句小口令记：遇到${sceneZh}，整块说出来，不拆碎。`,
      en: `Learn ${word.dutch} as a ready mini-line: in ${sceneEn}, say the whole chunk.`,
    };
  }

  if (wordType === "noun") {
    return {
      zh: `${articleWord(word)} 先变成脑中一张实物/场所照片：看到“${meaningZh}”这件东西或地方，再把荷兰语名字贴上去。`,
      en: `Turn ${articleWord(word)} into a concrete object/place photo first: see "${meaningEn}", then attach the Dutch name.`,
    };
  }

  if (wordType === "adjective") {
    return {
      zh: `${word.dutch} 要黏在一个状态画面上：人、东西或情况正在“${meaningZh}”，这个词才有感觉。`,
      en: `${word.dutch} should stick to a state picture: a person, thing, or situation is "${meaningEn}".`,
    };
  }

  return {
    zh: `${word.dutch} 先连到${sceneZh || meaningZh}这个具体画面，再用一句短句把它固定住。`,
    en: `Connect ${word.dutch} to the concrete picture of ${sceneEn || meaningEn}, then fix it with one short line.`,
  };
}

function scenarioHookForWord(word: WordItem, wordType: MemoryPathWordType, output: MemoryPath["outputSentence"] | undefined, phraseChunks: MemoryPath["phraseChunks"], usage: { zh: string; en: string }) {
  const learnerHook = learnerHookFromWord(word);
  if (learnerHook) return learnerHook;

  const lineZh = lineAnchor(phraseChunks, output, "zh");
  const lineEn = lineAnchor(phraseChunks, output, "en");
  const sceneZh = trimPeriod(usage.zh);
  const sceneEn = trimPeriod(usage.en);
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");

  if (lineZh && wordType === "verb") {
    return {
      zh: `把 ${word.dutch} 拍成一个动作镜头：${lineZh}`,
      en: `Turn ${word.dutch} into an action shot: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "adjective") {
    return {
      zh: `把 ${word.dutch} 黏到一个状态画面上：${lineZh}`,
      en: `Stick ${word.dutch} to a state picture: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "adverb") {
    return {
      zh: `把 ${word.dutch} 当作句子里的时间、地点或方式开关：${lineZh}`,
      en: `Treat ${word.dutch} as a time, place, or manner switch in the sentence: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "function-word") {
    return {
      zh: `把 ${word.dutch} 当作句子里的小开关，先看它怎么改变一句话：${lineZh}`,
      en: `Treat ${word.dutch} as a small sentence switch; first see how it changes one line: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "phrase") {
    return {
      zh: `${word.dutch} 当整块小口令记，场景一到就直接说：${lineZh}`,
      en: `Learn ${word.dutch} as a complete mini-line; when the scene comes, say it: ${lineEn}`,
    };
  }
  if (lineZh) {
    return {
      zh: `给 ${word.dutch} 一个小画面：${articleWord(word)} 出现在「${lineZh}」里，${meaningZh} 和用法一起记。`,
      en: `Give ${word.dutch} a small scene: ${articleWord(word)} appears in "${lineEn}", so ${meaningEn} and use stay together.`,
    };
  }

  return practicalImageHookForWord(word, wordType, output, phraseChunks, { zh: sceneZh, en: sceneEn });
}

function interestingHookFor(word: WordItem, path: {
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  formation?: WordFormationSeed;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  phraseChunks: MemoryPath["phraseChunks"];
  output?: MemoryPath["outputSentence"];
}) {
  const key = normalizeWordText(word.dutch);
  const seeded = funMemorySeeds[key];
  if (seeded) {
    return {
      zh: seeded.hookZh,
      en: seeded.hookEn,
    };
  }
  const learnerHook = learnerHookFromWord(word);

  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const usage = { zh: path.usageZh, en: path.usageEn };
  const sceneZh = trimPeriod(path.usageZh);
  const sceneEn = trimPeriod(path.usageEn);
  const lineZh = lineAnchor(path.phraseChunks, path.output, "zh");
  const lineEn = lineAnchor(path.phraseChunks, path.output, "en");

  if (path.strategy === "word-breakdown" && path.breakdown?.parts.length) {
    return {
      zh: path.breakdown.noteZh,
      en: path.breakdown.noteEn,
    };
  }

  if (path.strategy === "english-bridge" && path.englishBridge?.bridge) {
    return {
      zh: lineZh
        ? `先借 ${path.englishBridge.bridge} 抓外形和意思，再用「${lineZh}」校准荷兰语用法。`
        : `先借 ${path.englishBridge.bridge} 当外形钩子，但开口时按荷兰语词形和场景用。`,
      en: lineEn
        ? `Use ${path.englishBridge.bridge} as the shape hook, then calibrate the Dutch use with "${lineEn}".`
        : `Use ${path.englishBridge.bridge} as the shape hook, but use the Dutch form in context.`,
    };
  }

  if (path.strategy === "word-formation" && path.formation) {
    return {
      zh: path.formation.noteZh,
      en: path.formation.noteEn,
    };
  }

  if (path.strategy === "fixed-expression" && path.fixedExpression) {
    return {
      zh: `${word.dutch} 像一句小口令：遇到${sceneZh}，直接把这句拿出来。`,
      en: `${word.dutch} works like a small ready phrase: in ${sceneEn}, pull it out directly.`,
    };
  }

  if (path.strategy === "meaning-contrast" && path.meaningContrast) {
    const peersZh = path.meaningContrast.peers.map((peer) => peer.dutch).join(" / ");
    return {
      zh: `把 ${word.dutch} 和 ${peersZh} 排成一排，只抓它自己的语气：${path.meaningContrast.comparisonZh}`,
      en: `Line ${word.dutch} up with ${peersZh} and focus on its own shade: ${path.meaningContrast.comparisonEn}`,
    };
  }

  if (path.strategy === "category-rule") {
    if (path.wordType === "number") {
      return {
        zh: `把 ${word.dutch} 想成号码牌或价格牌上的一格：先听清，再读出来。`,
        en: `Picture ${word.dutch} as one slot on a phone number or price tag: hear it clearly, then say it.`,
      };
    }
    if (path.wordType === "day-month") {
      return {
        zh: `把 ${word.dutch} 放进日历上的一个格子，约时间、填日期时就会用到。`,
        en: `Put ${word.dutch} into a calendar square; it appears when making appointments or writing dates.`,
      };
    }
    if (path.wordType === "country-name") {
      return {
        zh: `把 ${word.dutch} 放到地图上，再连到 in ${word.dutch} / uit ${word.dutch}。`,
        en: `Place ${word.dutch} on the map, then connect it to in ${word.dutch} / uit ${word.dutch}.`,
      };
    }
    if (path.wordType === "language-name") {
      return {
        zh: `把 ${word.dutch} 放进语言按钮：Ik spreek ${word.dutch}. / Ik leer ${word.dutch}.`,
        en: `Put ${word.dutch} on a language button: Ik spreek ${word.dutch}. / Ik leer ${word.dutch}.`,
      };
    }
    return {
      zh: `把 ${word.dutch} 先放进同一类词的抽屉里：${path.memoryHookZh}`,
      en: `Put ${word.dutch} into its word-category drawer first: ${path.memoryHookEn}`,
    };
  }

  if (path.strategy === "phrase-based") {
    if (learnerHook) return learnerHook;
    const phrase = path.phraseChunks[0];
    if (phrase?.dutch) {
      return {
        zh: `${word.dutch} 先不要孤零零背：抓住「${phrase.dutch}」里最有画面的动作或物件，再把 ${meaningZh} 绑到这个画面上。`,
        en: `Do not learn ${word.dutch} alone: use the most visual action or object in "${phrase.dutch}" and bind ${meaningEn} to that picture.`,
      };
    }
    return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
  }

  if (path.strategy === "sentence-based") {
    if (learnerHook) return learnerHook;
    if (path.functionWord) {
      return {
        zh: `把 ${word.dutch} 当作句子里的小机关：${path.functionWord.functionZh}`,
        en: `Treat ${word.dutch} as a small mechanism inside the sentence: ${path.functionWord.functionEn}`,
      };
    }
    return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
  }

  return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
}

function stepsFor(path: {
  strategy: MemoryPathStrategy;
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  formation?: WordFormationSeed;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  phraseChunks: MemoryPath["phraseChunks"];
  output?: MemoryPath["outputSentence"];
  warningZh?: string;
  warningEn?: string;
}) {
  const phraseContentZh = path.phraseChunks[0]?.dutch
    ? `${path.phraseChunks[0].dutch}${path.phraseChunks[0].meaningZh ? ` = ${path.phraseChunks[0].meaningZh}` : ""}`
    : path.memoryHookZh;
  const phraseContentEn = path.phraseChunks[0]?.dutch
    ? `${path.phraseChunks[0].dutch}${path.phraseChunks[0].meaningEn ? ` = ${path.phraseChunks[0].meaningEn}` : ""}`
    : path.memoryHookEn;
  const outputContentZh = path.output?.dutch
    ? `${path.output.dutch}${path.output.meaningZh ? ` = ${path.output.meaningZh}` : ""}`
    : path.memoryHookZh;
  const outputContentEn = path.output?.dutch
    ? `${path.output.dutch}${path.output.meaningEn ? ` = ${path.output.meaningEn}` : ""}`
    : path.memoryHookEn;

  if (path.strategy === "word-breakdown" || path.strategy === "compound-word") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      {
        labelZh: "拆开看",
        labelEn: "Break it down",
        contentZh: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + ") ?? "",
        contentEn: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + ") ?? "",
      },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "english-bridge") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "英文桥梁", labelEn: "English bridge", contentZh: path.englishBridge?.bridge ?? "", contentEn: path.englishBridge?.bridge ?? "" },
      { labelZh: "差异提醒", labelEn: "Difference note", contentZh: path.englishBridge?.noteZh ?? "", contentEn: path.englishBridge?.noteEn ?? "" },
    ];
  }

  if (path.strategy === "word-formation") {
    const formation = path.formation;
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "基础词", labelEn: "Base word", contentZh: formation ? `${formation.base.dutch} = ${formation.base.meaningZh}` : "", contentEn: formation ? `${formation.base.dutch} = ${formation.base.meaningEn}` : "" },
      { labelZh: "词形怎么长出来", labelEn: "How it is formed", contentZh: formation ? `${formation.formed.dutch} = ${formation.formed.meaningZh}` : "", contentEn: formation ? `${formation.formed.dutch} = ${formation.formed.meaningEn}` : "" },
    ];
  }

  if (path.strategy === "fixed-expression") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "表达功能", labelEn: "Expression function", contentZh: path.fixedExpression?.functionZh ?? path.memoryHookZh, contentEn: path.fixedExpression?.functionEn ?? path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "meaning-contrast") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "词义对比", labelEn: "Meaning contrast", contentZh: path.meaningContrast?.comparisonZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.comparisonEn ?? path.memoryHookEn },
      { labelZh: "差异提醒", labelEn: "Difference note", contentZh: path.meaningContrast?.noteZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.noteEn ?? path.memoryHookEn },
    ];
  }

  if (path.strategy === "sentence-based") {
    if (path.functionWord) {
      return [
        { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        { labelZh: "句子位置", labelEn: "Sentence position", contentZh: path.functionWord.functionZh, contentEn: path.functionWord.functionEn },
        { labelZh: "使用场景", labelEn: "Use it for", contentZh: path.usageZh, contentEn: path.usageEn },
      ];
    }
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "能说一句", labelEn: "Say one line", contentZh: outputContentZh, contentEn: outputContentEn },
      { labelZh: "使用场景", labelEn: "Use it for", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "phrase-based") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "落到词块", labelEn: "Anchor in a chunk", contentZh: phraseContentZh, contentEn: phraseContentEn },
      { labelZh: "能说一句", labelEn: "Say one line", contentZh: outputContentZh, contentEn: outputContentEn },
      { labelZh: "使用场景", labelEn: "Use it for", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "category-rule") {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "类别规则", labelEn: "Category rule", contentZh: path.usageZh, contentEn: path.usageEn },
      ...(path.warningZh || path.warningEn
        ? [{ labelZh: "别混淆", labelEn: "Do not mix up", contentZh: path.warningZh ?? "", contentEn: path.warningEn ?? "" }]
        : []),
    ];
  }

  if (path.strategy === "no-strong-association") {
    return [
      { labelZh: "场景联想", labelEn: "Scene hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "使用场景", labelEn: "Use it for", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  return [
    { labelZh: "先抓入口", labelEn: "Start here", contentZh: phraseContentZh, contentEn: phraseContentEn },
    { labelZh: "放进一句话", labelEn: "Put it in a line", contentZh: outputContentZh, contentEn: outputContentEn },
    { labelZh: "使用场景", labelEn: "Use it for", contentZh: path.usageZh, contentEn: path.usageEn },
  ];
}

function buildPath(word: WordItem, context: MemoryPathContext, data: {
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  confidence: "high" | "medium" | "low";
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  formation?: WordFormationSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  warningZh?: string;
  warningEn?: string;
}) {
  const phraseChunks = cleanPhraseChunks(word, context);
  const output = outputSentenceFor(word, context);
  const interestingHook = interestingHookFor(word, {
    strategy: data.strategy,
    wordType: data.wordType,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    fixedExpression: data.fixedExpression,
    formation: data.formation,
    meaningContrast: data.meaningContrast,
    functionWord: data.functionWord,
    memoryHookZh: data.memoryHookZh,
    memoryHookEn: data.memoryHookEn,
    usageZh: data.usageZh,
    usageEn: data.usageEn,
    phraseChunks,
    output,
  });
  const basePath: MemoryPath = {
    wordId: word.id,
    dutch: word.dutch,
    strategy: data.strategy,
    wordType: data.wordType,
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    explanationZh: data.explanationZh,
    explanationEn: data.explanationEn,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    memoryHookZh: interestingHook.zh,
    memoryHookEn: interestingHook.en,
    usageAnchorZh: data.usageZh,
    usageAnchorEn: data.usageEn,
    scenarioAnchor: { zh: data.usageZh, en: data.usageEn },
    phraseChunks,
    outputSentences: output ? [output] : [],
    outputSentence: output,
    warningZh: data.warningZh,
    warningEn: data.warningEn,
    confidence: data.confidence,
    needsHumanReview: false,
  };

  const steps = stepsFor({
    strategy: data.strategy,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    fixedExpression: data.fixedExpression,
    formation: data.formation,
    meaningContrast: data.meaningContrast,
    functionWord: data.functionWord,
    memoryHookZh: interestingHook.zh,
    memoryHookEn: interestingHook.en,
    usageZh: data.usageZh,
    usageEn: data.usageEn,
    phraseChunks,
    output,
    warningZh: data.warningZh,
    warningEn: data.warningEn,
  });
  const checked = checkMemoryPathQuality({ ...basePath, steps }, word);

  return {
    ...basePath,
    steps,
    confidence: checked.confidence,
    needsHumanReview: checked.needsHumanReview,
    qualityIssues: checked.issues,
    warnings: checked.warnings,
  };
}

export function generateMemoryPath(word: WordItem, context: MemoryPathContext = {}): MemoryPath {
  const allWords = context.allWords ?? [word];
  const wordType = classifyMemoryPathWord(word);
  const key = normalizeWordText(word.dutch);
  const usage = usageAnchorFor(word);

  const category = categoryDetailsFor(word, wordType);
  if (category && (wordType === "language-name" || wordType === "country-name" || wordType === "number" || wordType === "day-month" || wordType === "adjective")) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: category.titleZh,
      titleEn: category.titleEn,
      explanationZh: category.explanationZh,
      explanationEn: category.explanationEn,
      memoryHookZh: category.hookZh,
      memoryHookEn: category.hookEn,
      usageZh: category.usageZh,
      usageEn: category.usageEn,
      warningZh: category.warningZh,
      warningEn: category.warningEn,
      confidence: "high",
    });
  }

  const breakdown = compoundBreakdowns[key] ?? dynamicBreakdownFor(word, allWords);
  if (breakdown) {
    const usageFromBreakdown = usageAnchorFor(word, { zh: breakdown.usageZh, en: breakdown.usageEn });
    return buildPath(word, context, {
      strategy: "word-breakdown",
      wordType,
      titleZh: "拆词联想",
      titleEn: "Word Breakdown",
      explanationZh: "这个词可以自然拆开看，拆完之后意思更容易记。",
      explanationEn: "This word can be meaningfully split, which makes it easier to remember.",
      breakdown,
      memoryHookZh: breakdown.noteZh,
      memoryHookEn: breakdown.noteEn,
      usageZh: usageFromBreakdown.zh,
      usageEn: usageFromBreakdown.en,
      confidence: "high",
    });
  }

  const contrast = meaningContrastFor(word, allWords);
  if (contrast && wordType === "adjective") {
    return buildPath(word, context, {
      strategy: "meaning-contrast",
      wordType,
      titleZh: "词义对比",
      titleEn: "Meaning Contrast",
      explanationZh: "这个词适合和词典近义词放在一起比较，不需要硬编短句记忆路径。",
      explanationEn: "This word is best learned by comparing nearby dictionary meanings, without forcing a sentence into the memory path.",
      meaningContrast: contrast,
      memoryHookZh: contrast.noteZh,
      memoryHookEn: contrast.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: "high",
    });
  }

  const formation = wordFormationSeeds[key];
  if (formation) {
    return buildPath(word, context, {
      strategy: "word-formation",
      wordType,
      titleZh: "词形联想",
      titleEn: "Word Formation",
      explanationZh: "这个词适合从基础词出发，记它怎么长成新词。",
      explanationEn: "This word is best remembered from its base word and formation.",
      formation,
      memoryHookZh: formation.noteZh,
      memoryHookEn: formation.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: "high",
      warningZh: key === "hulp" ? "Kunt u mij helpen? 用的是动词 helpen，不是名词 hulp。" : undefined,
      warningEn: key === "hulp" ? "Kunt u mij helpen? uses the verb helpen, not the noun hulp." : undefined,
    });
  }

  const bridge = englishBridgeFor(word);
  if (bridge && !phraseLike(word.dutch)) {
    return buildPath(word, context, {
      strategy: "english-bridge",
      wordType,
      titleZh: "英文桥梁",
      titleEn: "English Bridge",
      explanationZh: "这个词可以先借英文外形记住，再用荷兰语句子校准。",
      explanationEn: "Use the English-looking form as a hook, then calibrate it in Dutch sentences.",
      englishBridge: bridge,
      memoryHookZh: bridge.noteZh,
      memoryHookEn: bridge.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: englishBridgeSeeds[key] ? "high" : "medium",
    });
  }

  const fixedExpression = fixedExpressionSeeds[key];
  if (fixedExpression) {
    return buildPath(word, context, {
      strategy: "fixed-expression",
      wordType,
      titleZh: fixedExpression.titleZh,
      titleEn: fixedExpression.titleEn,
      explanationZh: fixedExpression.explanationZh,
      explanationEn: fixedExpression.explanationEn,
      fixedExpression,
      memoryHookZh: fixedExpression.functionZh,
      memoryHookEn: fixedExpression.functionEn,
      usageZh: fixedExpression.usageZh,
      usageEn: fixedExpression.usageEn,
      warningZh: fixedExpression.warningZh,
      warningEn: fixedExpression.warningEn,
      confidence: "high",
    });
  }

  const functionWord = functionWordSeeds[key];
  if (functionWord) {
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: functionWord.titleZh,
      titleEn: functionWord.titleEn,
      explanationZh: functionWord.explanationZh,
      explanationEn: functionWord.explanationEn,
      functionWord,
      memoryHookZh: functionWord.functionZh,
      memoryHookEn: functionWord.functionEn,
      usageZh: functionWord.usageZh,
      usageEn: functionWord.usageEn,
      confidence: "high",
    });
  }

  const phraseChunksForDecision = cleanPhraseChunks(word, context);
  if (phraseBasedWords.has(key) || greetingPhraseWords.has(key) || phraseChunksForDecision.length >= 1) {
    const firstPhrase = phraseChunksForDecision[0];
    const seededPhrase = Boolean(memoryPhraseSeeds[key]?.length);
    const funSeed = funMemorySeeds[key];
    return buildPath(word, context, {
      strategy: "phrase-based",
      wordType,
      titleZh: wordType === "phrase" ? "固定表达" : "联想词块",
      titleEn: wordType === "phrase" ? "Fixed Expression" : "Hooked Phrase",
      explanationZh: firstPhrase
        ? `先给 ${word.dutch} 一个能想起来的画面，再用 ${firstPhrase.dutch} 固定开口方式。`
        : "这是固定表达，重点是能听懂并直接说出来。",
      explanationEn: firstPhrase
        ? `Give ${word.dutch} a memorable picture first, then anchor it in a chunk such as ${firstPhrase.dutch}.`
        : "This is a fixed expression; focus on recognizing it and saying it directly.",
      memoryHookZh: funSeed?.hookZh ?? (firstPhrase
        ? `${word.dutch} 先连到一个具体画面，再落到 ${firstPhrase.dutch} 这个可说的词块。`
        : `${word.dutch} 先作为一个完整表达来听读。`),
      memoryHookEn: funSeed?.hookEn ?? (firstPhrase
        ? `Connect ${word.dutch} to a concrete picture first, then anchor it in the usable chunk ${firstPhrase.dutch}.`
        : `Learn ${word.dutch} as a complete expression first.`),
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: funSeed || seededPhrase || phraseBasedWords.has(key) || greetingPhraseWords.has(key) ? "high" : "medium",
    });
  }

  if (wordType === "function-word" || wordType === "adverb" || wordType === "verb" || functionWords.has(key)) {
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: "放进句子记",
      titleEn: "Sentence Based",
      explanationZh: wordType === "verb" ? "这是动词，重点是看它在句子里怎么用。" : "这是功能词/抽象词，不硬拆，放进固定句子里记。",
      explanationEn: wordType === "verb" ? "This is a verb. Learn how it behaves in sentences." : "This is a function/abstract word. Learn it inside sentences.",
      memoryHookZh: wordType === "verb" ? "动词先拍成动作镜头，再看主语让它怎么变形。" : "先抓它在句子里负责的开关作用，再用一句短句固定。",
      memoryHookEn: wordType === "verb" ? "Turn the verb into an action shot first, then see how the subject changes its form." : "First catch what switch it controls in a sentence, then fix it with one short line.",
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: fixedOutputSentences[key] ? "high" : "medium",
    });
  }

  return buildPath(word, context, {
    strategy: "sentence-based",
    wordType,
    titleZh: "场景句子联想",
    titleEn: "Scene Sentence Hook",
    explanationZh: "先给这个词一个生活画面，再用一句可说出口的话把它固定住。",
    explanationEn: "Give the word a daily-life scene first, then anchor it in one speakable line.",
    memoryHookZh: "先把词变成一张能看见的生活画面，再配一句短句。",
    memoryHookEn: "First turn the word into a visible daily-life picture, then pair it with one short line.",
    usageZh: usage.zh,
    usageEn: usage.en,
    confidence: "medium",
  });
}
