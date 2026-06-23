import { relationLexicons } from "@/data/relationLexicons";
import { checkMemoryPathQuality } from "@/lib/checkMemoryPathQuality";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { phraseChunkMeaningFor } from "@/lib/exampleTemplates";
import {
  classifyMemoryPathWord,
  compoundBreakdowns,
  countryNames,
  dayMonthWords,
  englishBridgeSeeds,
  fixedExpressionSeeds,
  functionWordSeeds,
  fixedOutputSentences,
  functionWords,
  greetingPhraseWords,
  languageNames,
  lexicalMeaningFor,
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
  /^Dit is (heet|ben|heb|wil|kan|dit|dat|dag)\.?$/i,
  /^Ik (ben|heb|wil|kan)\.?$/i,
  /^Ik ga naar (uit|hier|daar)\.?$/i,
  /^Kunt u mij hulp\??$/i,
];

const isUsableOutput = (sentence: { dutch: string; meaningZh?: string; meaningEn?: string }) =>
  Boolean(sentence.dutch.trim() && sentence.meaningZh?.trim() && sentence.meaningEn?.trim()) &&
  !badOutputPatterns.some((pattern) => pattern.test(sentence.dutch.trim()));

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

const preferredMemoryPhraseChunks: Record<string, string[]> = {
  open: ["open de app"],
  auto: ["met de auto"],
  halte: ["naar de halte gaan"],
  station: ["naar het station gaan"],
  bus: ["de bus nemen"],
  trein: ["de trein nemen"],
  fiets: ["met de fiets"],
};

function cleanPhraseChunks(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const fromPreferred = (preferredMemoryPhraseChunks[key] ?? [])
    .filter((chunk) => textContainsTargetUse(word, chunk))
    .map(localizedPhrase);
  const fromContext = (context.phraseChunks ?? [])
    .filter((chunk) => (
      chunk.relatedWords.map(normalizeWordText).includes(key) ||
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
      normalizeWordText(chunk) !== key &&
      chunk !== `${word.dutch}.` &&
      textContainsTargetUse(word, chunk)
    )
    .map(localizedPhrase);

  return [...fromPreferred, ...fromContext, ...fromWord]
    .filter((chunk, index, chunks) => chunks.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(chunk.dutch)) === index)
    .slice(0, 4);
}

function generatedSentenceCandidates(word: WordItem, context: MemoryPathContext) {
  const existing = (context.examples ?? []).map((example) => ({
    dutch: example.dutch,
    meaningZh: example.meaning.zh,
    meaningEn: example.meaning.en,
  }));
  const generated = generateExamplesForWord(word, { existingExamples: context.examples })
    .filter((example: GeneratedExample) => example.confidence !== "low" && !example.needsHumanReview && !(example.qualityIssues?.length))
    .map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaningZh,
      meaningEn: example.meaningEn,
    }));
  const fallback = {
    dutch: word.exampleSentence.dutch,
    meaningZh: word.exampleSentence.meaning.zh,
    meaningEn: word.exampleSentence.meaning.en,
  };

  return [...existing, ...generated, fallback]
    .filter(isUsableOutput)
    .filter((sentence) => textContainsTargetUse(word, sentence.dutch))
    .filter((sentence, index, sentences) => sentences.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(sentence.dutch)) === index);
}

function outputSentenceFor(word: WordItem, context: MemoryPathContext) {
  const fixed = fixedOutputSentences[normalizeWordText(word.dutch)];
  if (fixed) return fixed;
  return generatedSentenceCandidates(word, context)[0];
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
  const bridgeStopWords = new Set(["looks", "like", "same", "english", "bridge", "close", "means", "meaning", "spelling", "sounds", "sound"]);
  const fromBridge = (word.englishBridge ?? "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .map(normalizeBridgeToken)
    .filter((part) => part.length >= 3 && !bridgeStopWords.has(part));

  return [...fromMeaning, ...fromBridge]
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

  if (path.strategy === "word-breakdown" || path.strategy === "compound-word") {
    return [
      {
        labelZh: "拆开看",
        labelEn: "Break it down",
        contentZh: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + ") ?? "",
        contentEn: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + ") ?? "",
      },
      { labelZh: "意思怎么合起来", labelEn: "How the meaning combines", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "english-bridge") {
    return [
      { labelZh: "英文桥梁", labelEn: "English bridge", contentZh: path.englishBridge?.bridge ?? "", contentEn: path.englishBridge?.bridge ?? "" },
      { labelZh: "差异提醒", labelEn: "Difference note", contentZh: path.englishBridge?.noteZh ?? "", contentEn: path.englishBridge?.noteEn ?? "" },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "word-formation") {
    const formation = path.formation;
    return [
      { labelZh: "基础词", labelEn: "Base word", contentZh: formation ? `${formation.base.dutch} = ${formation.base.meaningZh}` : "", contentEn: formation ? `${formation.base.dutch} = ${formation.base.meaningEn}` : "" },
      { labelZh: "词形怎么长出来", labelEn: "How it is formed", contentZh: formation ? `${formation.formed.dutch} = ${formation.formed.meaningZh}` : "", contentEn: formation ? `${formation.formed.dutch} = ${formation.formed.meaningEn}` : "" },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "fixed-expression") {
    return [
      { labelZh: "表达功能", labelEn: "Expression function", contentZh: path.fixedExpression?.functionZh ?? path.memoryHookZh, contentEn: path.fixedExpression?.functionEn ?? path.memoryHookEn },
      { labelZh: "记忆重点", labelEn: "Memory focus", contentZh: path.fixedExpression?.noteZh ?? path.memoryHookZh, contentEn: path.fixedExpression?.noteEn ?? path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "meaning-contrast") {
    return [
      { labelZh: "词义对比", labelEn: "Meaning contrast", contentZh: path.meaningContrast?.comparisonZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.comparisonEn ?? path.memoryHookEn },
      { labelZh: "差异提醒", labelEn: "Difference note", contentZh: path.meaningContrast?.noteZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.noteEn ?? path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "sentence-based") {
    if (path.functionWord) {
      return [
        { labelZh: "句子位置", labelEn: "Sentence position", contentZh: path.functionWord.functionZh, contentEn: path.functionWord.functionEn },
        { labelZh: "搭配框架", labelEn: "Pattern frame", contentZh: path.functionWord.noteZh, contentEn: path.functionWord.noteEn },
        { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
      ];
    }
    return [
      { labelZh: "句子功能", labelEn: "Sentence role", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  if (path.strategy === "category-rule") {
    return [
      { labelZh: "先看类别", labelEn: "See the category", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "类别规则", labelEn: "Category rule", contentZh: path.usageZh, contentEn: path.usageEn },
      ...(path.warningZh || path.warningEn
        ? [{ labelZh: "别混淆", labelEn: "Do not mix up", contentZh: path.warningZh ?? "", contentEn: path.warningEn ?? "" }]
        : []),
    ];
  }

  if (path.strategy === "no-strong-association") {
    return [
      { labelZh: "不硬编联想", labelEn: "Do not force it", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
    ];
  }

  return [
    { labelZh: "记忆入口", labelEn: "Memory entry", contentZh: phraseContentZh, contentEn: phraseContentEn },
    { labelZh: "为什么这样记", labelEn: "Why this helps", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
    { labelZh: "使用提醒", labelEn: "Usage note", contentZh: path.usageZh, contentEn: path.usageEn },
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
    memoryHookZh: data.memoryHookZh,
    memoryHookEn: data.memoryHookEn,
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
    memoryHookZh: data.memoryHookZh,
    memoryHookEn: data.memoryHookEn,
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

  const bridge = englishBridgeFor(word);
  if (bridge && !phraseLike(word.dutch)) {
    return buildPath(word, context, {
      strategy: "english-bridge",
      wordType,
      titleZh: "英文桥梁",
      titleEn: "English Bridge",
      explanationZh: "这个词可以先借英文外形记住，再放回荷兰语句子里使用。",
      explanationEn: "Use the English-looking form as a hook, then learn it in Dutch sentences.",
      englishBridge: bridge,
      memoryHookZh: bridge.noteZh,
      memoryHookEn: bridge.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: englishBridgeSeeds[key] ? "high" : "medium",
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

  if (phraseBasedWords.has(key) || greetingPhraseWords.has(key) || cleanPhraseChunks(word, context).length >= 1) {
    return buildPath(word, context, {
      strategy: "phrase-based",
      wordType,
      titleZh: wordType === "phrase" ? "固定表达整块记" : "搭配优先",
      titleEn: wordType === "phrase" ? "Fixed Expression" : "Phrase First",
      explanationZh: wordType === "phrase" ? "这是固定表达，重点是整块听读，直接拿去说。" : "不要只背单词释义，先记最常用搭配。",
      explanationEn: wordType === "phrase" ? "This is a fixed expression. Learn it as a whole chunk." : "Do not memorize only the gloss; learn the strongest collocation first.",
      memoryHookZh: cleanPhraseChunks(word, context)[0]?.dutch ? `先记 ${cleanPhraseChunks(word, context)[0].dutch}，这个搭配能固定词义和使用场景。` : "先记最常见搭配，用搭配固定词义和使用场景。",
      memoryHookEn: cleanPhraseChunks(word, context)[0]?.dutch ? `Start with ${cleanPhraseChunks(word, context)[0].dutch}; the chunk anchors meaning and context.` : "Learn the common chunk first; it anchors meaning and context.",
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: phraseBasedWords.has(key) || greetingPhraseWords.has(key) ? "high" : "medium",
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
      memoryHookZh: wordType === "verb" ? "动词不要只背原形，要跟一个能说出口的句子一起记。" : "先记一句真实对比句或功能句，位置比拆词更重要。",
      memoryHookEn: wordType === "verb" ? "Do not memorize only the base form; anchor it in one usable sentence." : "Remember the word in a real sentence; position matters more than breakdown.",
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: fixedOutputSentences[key] ? "high" : "medium",
    });
  }

  return buildPath(word, context, {
    strategy: "no-strong-association",
    wordType,
    titleZh: "不硬编联想",
    titleEn: "No Forced Association",
    explanationZh: "这个词没有特别自然的拆词、英文桥梁或词义对比，记忆路径只保留使用提醒。",
    explanationEn: "This word has no natural breakdown, English bridge, or meaning contrast; keep the path to usage notes.",
    memoryHookZh: "不硬编联想，优先记住它属于哪个场景、和哪些表达一起出现。",
    memoryHookEn: "Do not force a mnemonic; remember its scene and natural neighboring expressions.",
    usageZh: usage.zh,
    usageEn: usage.en,
    confidence: "low",
  });
}
