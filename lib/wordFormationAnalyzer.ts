import { relationLexicons } from "@/data/relationLexicons";
import { compoundBreakdowns } from "@/lib/memoryPathStrategies";
import type { MemoryBubbleCandidate, MemoryBubbleRelationType } from "@/lib/memoryBubbleEngine";
import { analyzeWord, normalizeWordText, type WordAnalysis } from "@/lib/wordAnalysis";
import type { WordItem } from "@/types/vocabulary";

type FormationPart = {
  text: string;
  normalized: string;
  meaning?: {
    zh: string;
    en: string;
  };
  word?: WordItem;
};

const connectors = ["", "s", "e", "en", "er"];

const extensionMeaningFor = (value: string) => relationLexicons.baseMorphemes[normalizeWordText(value)];

const wordMapFor = (words: WordItem[]) => new Map(words.map((word) => [normalizeWordText(word.dutch), word]));

const suffixMeanings = {
  heid: {
    zh: "-heid 是抽象名词后缀，把形容词变成“某种状态/性质”，很像英语 -ness/-ity。",
    en: "-heid is an abstract noun suffix, turning an adjective into a state or quality, like English -ness/-ity.",
  },
  baarheid: {
    zh: "-baarheid 里有 -baar + -heid，意思常接近英语 -ability：可……性。",
    en: "-baarheid combines -baar and -heid, often close to English -ability: the quality of being able to be ...",
  },
  baar: {
    zh: "-baar 常把动作变成“可……的”，很像英语 -able/-ible。",
    en: "-baar often turns an action into 'able to be ...', like English -able/-ible.",
  },
};

const numberBaseMeanings: Record<string, { zh: string; en: string }> = {
  nul: { zh: "零", en: "zero" },
  een: { zh: "一", en: "one" },
  twee: { zh: "二", en: "two" },
  drie: { zh: "三", en: "three" },
  vier: { zh: "四", en: "four" },
  vijf: { zh: "五", en: "five" },
  zes: { zh: "六", en: "six" },
  zeven: { zh: "七", en: "seven" },
  acht: { zh: "八", en: "eight" },
  negen: { zh: "九", en: "nine" },
  tien: { zh: "十", en: "ten" },
  elf: { zh: "十一", en: "eleven" },
  twaalf: { zh: "十二", en: "twelve" },
  twintig: { zh: "二十", en: "twenty" },
  dertig: { zh: "三十", en: "thirty" },
  veertig: { zh: "四十", en: "forty" },
  vijftig: { zh: "五十", en: "fifty" },
  zestig: { zh: "六十", en: "sixty" },
  zeventig: { zh: "七十", en: "seventy" },
  tachtig: { zh: "八十", en: "eighty" },
  negentig: { zh: "九十", en: "ninety" },
  honderd: { zh: "一百", en: "hundred" },
  en: { zh: "数字连接词：和", en: "number connector: and" },
  "-tig": { zh: "整十后缀：几十", en: "tens suffix" },
};

const simpleNumberFamilies: Record<string, { targets: string[]; noteZh: string; noteEn: string }> = {
  nul: {
    targets: ["een"],
    noteZh: "nul 是数字序列的起点，和 een 一起先定位 0/1。",
    noteEn: "nul starts the number sequence; pair it with een to anchor zero/one.",
  },
  twee: {
    targets: ["twaalf", "twintig"],
    noteZh: "twee 到十二是特殊形 twaalf，到二十是特殊整十 twintig。",
    noteEn: "twee becomes the special teen twaalf and the special tens word twintig.",
  },
  drie: {
    targets: ["dertien", "dertig"],
    noteZh: "drie 到十几/几十会变成 der-：dertien、dertig。",
    noteEn: "drie changes to der- in teens/tens: dertien and dertig.",
  },
  vier: {
    targets: ["veertien", "veertig"],
    noteZh: "vier 到十几/几十会变成 veer-：veertien、veertig。",
    noteEn: "vier changes to veer- in teens/tens: veertien and veertig.",
  },
  vijf: {
    targets: ["vijftien", "vijftig"],
    noteZh: "vijf 保留词根，十几接 tien，几十接 -tig。",
    noteEn: "vijf keeps its root; teens take tien, tens take -tig.",
  },
  zes: {
    targets: ["zestien", "zestig"],
    noteZh: "zes 保留词根，十几接 tien，几十接 -tig。",
    noteEn: "zes keeps its root; teens take tien, tens take -tig.",
  },
  zeven: {
    targets: ["zeventien", "zeventig"],
    noteZh: "zeven 保留词根，十几接 tien，几十接 -tig。",
    noteEn: "zeven keeps its root; teens take tien, tens take -tig.",
  },
  acht: {
    targets: ["achttien", "tachtig"],
    noteZh: "acht 的十几是 achttien，八十特殊写 tachtig。",
    noteEn: "acht gives achttien for eighteen; eighty has the special form tachtig.",
  },
  negen: {
    targets: ["negentien", "negentig"],
    noteZh: "negen 保留词根，十几接 tien，几十接 -tig。",
    noteEn: "negen keeps its root; teens take tien, tens take -tig.",
  },
  tien: {
    targets: ["elf", "twaalf", "dertien"],
    noteZh: "tien 是十几数的核心；elf/twaalf 是特殊形，dertien 开始更像“数字 + tien”。",
    noteEn: "tien anchors teen numbers; elf/twaalf are special, while dertien onward shows the number + tien pattern.",
  },
  elf: {
    targets: ["tien", "twaalf"],
    noteZh: "elf 是特殊十几，先和 tien/twaalf 放在同一组认。",
    noteEn: "elf is a special teen; group it with tien/twaalf first.",
  },
  twaalf: {
    targets: ["tien", "elf"],
    noteZh: "twaalf 是特殊十几，先和 tien/elf 放在同一组认。",
    noteEn: "twaalf is a special teen; group it with tien/elf first.",
  },
  honderd: {
    targets: ["tien"],
    noteZh: "honderd 是更大的计数单位，先从 tien 往上扩到 honderd。",
    noteEn: "honderd is a larger counting unit; extend upward from tien to honderd.",
  },
};

const teenNumberParts: Record<string, { unit: string; familyTen?: string; noteZh: string; noteEn: string }> = {
  dertien: {
    unit: "drie",
    familyTen: "dertig",
    noteZh: "drie 在十三/三十里常变成 der-，再接 tien/tig。",
    noteEn: "drie often changes to der- in thirteen/thirty, then takes tien/tig.",
  },
  veertien: {
    unit: "vier",
    familyTen: "veertig",
    noteZh: "vier 在十四/四十里变成 veer-，再接 tien/tig。",
    noteEn: "vier changes to veer- in fourteen/forty, then takes tien/tig.",
  },
  vijftien: {
    unit: "vijf",
    familyTen: "vijftig",
    noteZh: "vijf 保留词根：vijftien 是十五，vijftig 是五十。",
    noteEn: "vijf keeps the same root: vijftien is fifteen, vijftig is fifty.",
  },
  zestien: {
    unit: "zes",
    familyTen: "zestig",
    noteZh: "zes 保留词根：zestien 是十六，zestig 是六十。",
    noteEn: "zes keeps the same root: zestien is sixteen, zestig is sixty.",
  },
  zeventien: {
    unit: "zeven",
    familyTen: "zeventig",
    noteZh: "zeven 保留词根：zeventien 是十七，zeventig 是七十。",
    noteEn: "zeven keeps the same root: zeventien is seventeen, zeventig is seventy.",
  },
  achttien: {
    unit: "acht",
    familyTen: "tachtig",
    noteZh: "acht 到八十会变成特殊的 tachtig；十八还是 acht + tien。",
    noteEn: "acht becomes the special tens form tachtig; eighteen is still acht + tien.",
  },
  negentien: {
    unit: "negen",
    familyTen: "negentig",
    noteZh: "negen 保留词根：negentien 是十九，negentig 是九十。",
    noteEn: "negen keeps the same root: negentien is nineteen, negentig is ninety.",
  },
};

const tenNumberParts: Record<string, { unit?: string; noteZh: string; noteEn: string }> = {
  twintig: {
    unit: "twee",
    noteZh: "twintig 是二十的特殊整十形式，不是直接 twee + tig。",
    noteEn: "twintig is a special tens form for twenty, not plain twee + tig.",
  },
  dertig: {
    unit: "drie",
    noteZh: "drie 到三十变成 der-，写 dertig。",
    noteEn: "drie changes to der- in thirty: dertig.",
  },
  veertig: {
    unit: "vier",
    noteZh: "vier 到四十变成 veer-，写 veertig。",
    noteEn: "vier changes to veer- in forty: veertig.",
  },
  vijftig: {
    unit: "vijf",
    noteZh: "vijf + -tig 这条整十线索对应五十。",
    noteEn: "vijf + -tig gives the tens clue for fifty.",
  },
  zestig: {
    unit: "zes",
    noteZh: "zes + -tig 这条整十线索对应六十。",
    noteEn: "zes + -tig gives the tens clue for sixty.",
  },
  zeventig: {
    unit: "zeven",
    noteZh: "zeven + -tig 这条整十线索对应七十。",
    noteEn: "zeven + -tig gives the tens clue for seventy.",
  },
  tachtig: {
    unit: "acht",
    noteZh: "tachtig 是八十的特殊写法，不写 achttig。",
    noteEn: "tachtig is the special spelling for eighty, not achttig.",
  },
  negentig: {
    unit: "negen",
    noteZh: "negen + -tig 这条整十线索对应九十。",
    noteEn: "negen + -tig gives the tens clue for ninety.",
  },
};

const compoundNumberUnitPrefixes = [
  { prefix: "eenen", unit: "een" },
  { prefix: "tweeën", unit: "twee" },
  { prefix: "drieën", unit: "drie" },
  { prefix: "vieren", unit: "vier" },
  { prefix: "vijfen", unit: "vijf" },
  { prefix: "zesen", unit: "zes" },
  { prefix: "zevenen", unit: "zeven" },
  { prefix: "achten", unit: "acht" },
  { prefix: "negenen", unit: "negen" },
] as const;

const numberTenWords = Object.keys(tenNumberParts);

const baarBaseHints: Record<string, { target: string; meaning: { zh: string; en: string } }> = {
  bereikbaar: { target: "bereiken", meaning: { zh: "到达 / 联系到", en: "reach" } },
  beschikbaar: { target: "beschikken", meaning: { zh: "可支配 / 可用", en: "have available" } },
  betrouwbaar: { target: "vertrouwen", meaning: { zh: "信任", en: "trust" } },
  bruikbaar: { target: "gebruiken", meaning: { zh: "使用", en: "use" } },
  eetbaar: { target: "eten", meaning: { zh: "吃", en: "eat" } },
  hoorbaar: { target: "horen", meaning: { zh: "听见", en: "hear" } },
  leefbaar: { target: "leven", meaning: { zh: "生活 / 活着", en: "live" } },
  leesbaar: { target: "lezen", meaning: { zh: "读", en: "read" } },
  merkbaar: { target: "merken", meaning: { zh: "注意到 / 察觉", en: "notice" } },
  zichtbaar: { target: "zien", meaning: { zh: "看见", en: "see" } },
};

const baarAdjectiveMeanings: Record<string, { zh: string; en: string }> = {
  bereikbaar: { zh: "联系得到的 / 可到达的", en: "reachable" },
  beschikbaar: { zh: "可用的 / 有空的", en: "available" },
  betrouwbaar: { zh: "可信赖的", en: "reliable" },
  bruikbaar: { zh: "可用的", en: "usable" },
  eetbaar: { zh: "可食用的", en: "edible" },
  hoorbaar: { zh: "听得见的", en: "audible" },
  leefbaar: { zh: "宜居的 / 适合生活的", en: "liveable" },
  leesbaar: { zh: "可读的", en: "readable" },
  merkbaar: { zh: "可察觉的", en: "noticeable" },
  zichtbaar: { zh: "看得见的", en: "visible" },
};

const heidBaseMeanings: Record<string, { zh: string; en: string }> = {
  aanwezig: { zh: "在场的 / 存在的", en: "present" },
  afwezig: { zh: "缺席的 / 不在的", en: "absent" },
  benauwd: { zh: "喘不过气的 / 憋闷的", en: "short of breath / stuffy" },
  duurzaam: { zh: "可持续的", en: "sustainable" },
  gezond: { zh: "健康的", en: "healthy" },
  persoonlijk: { zh: "个人的 / 性格上的", en: "personal" },
  veilig: { zh: "安全的", en: "safe" },
  verantwoordelijk: { zh: "负责的", en: "responsible" },
  vaardig: { zh: "熟练的 / 有技能的", en: "skilled" },
};

const safePartKeysFor = (words: WordItem[]) => {
  const keys = Array.from(new Set([
    ...Object.keys(relationLexicons.baseMorphemes),
    ...relationLexicons.knownMorphemes,
    ...words
      .map((word) => normalizeWordText(word.dutch))
      .filter((word) => word.length >= 3 && !word.includes(" ")),
  ]))
    .filter((part) => part.length >= 3)
    .sort((a, b) => b.length - a.length);
  return {
    keys,
    keySet: new Set(keys),
  };
};

const isKnownPart = (part: string, known: Set<string>) =>
  known.has(part) && Boolean(extensionMeaningFor(part) || part.length >= 3);

function partFor(value: string, words: WordItem[]): FormationPart | undefined {
  const normalized = normalizeWordText(value);
  const word = wordMapFor(words).get(normalized);
  const meaning = word?.meaning ?? extensionMeaningFor(normalized);
  if (!meaning) return undefined;
  return {
    text: word?.dutch ?? value,
    normalized,
    meaning,
    word,
  };
}

function explicitPartsFor(analysis: WordAnalysis, words: WordItem[]) {
  const lexiconParts = (relationLexicons.compoundParts[analysis.normalizedForm] ?? [])
    .map((part) => partFor(part, words))
    .filter(Boolean) as FormationPart[];
  if (lexiconParts.length) return lexiconParts;

  return (compoundBreakdowns[analysis.normalizedForm]?.parts ?? [])
    .map((part) => {
      const normalized = normalizeWordText(part.dutch);
      const word = wordMapFor(words).get(normalized);
      return {
        text: word?.dutch ?? part.dutch,
        normalized,
        meaning: word?.meaning ?? { zh: part.meaningZh, en: part.meaningEn },
        word,
      };
    })
    .filter((part) => part.normalized) as FormationPart[];
}

function safeSplitPartsFor(analysis: WordAnalysis, words: WordItem[]) {
  const normalized = analysis.normalizedForm;
  if (normalized.length < 6 || normalized.includes(" ")) return [];

  const { keySet } = safePartKeysFor(words);
  const best: string[][] = [];

  for (let split = 3; split <= normalized.length - 3; split += 1) {
    for (const connector of connectors) {
      const rightStart = split + connector.length;
      if (rightStart > normalized.length - 3) continue;
      if (connector && normalized.slice(split, rightStart) !== connector) continue;
      const left = normalized.slice(0, split);
      const right = normalized.slice(rightStart);
      if (left === normalized || right === normalized) continue;
      if (left === right && left.length < 5) continue;
      if (isKnownPart(left, keySet) && isKnownPart(right, keySet)) {
        best.push([left, right]);
      }
    }
  }

  const sorted = best
    .filter((parts) => parts.every((part) => extensionMeaningFor(part) || wordMapFor(words).has(part)))
    .sort((a, b) => {
      const lengthDiff = b.join("").length - a.join("").length;
      if (lengthDiff) return lengthDiff;
      return a.length - b.length;
    });

  const selected = sorted[0] ?? [];
  return selected
    .map((part) => partFor(part, words))
    .filter(Boolean) as FormationPart[];
}

function uniqueParts(parts: FormationPart[]) {
  const seen = new Set<string>();
  return parts.filter((part) => {
    if (seen.has(part.normalized)) return false;
    seen.add(part.normalized);
    return true;
  });
}

function relationReasonFor(analysis: WordAnalysis, part: FormationPart) {
  const seeded = relationLexicons.compoundPartReasons[analysis.normalizedForm]?.[part.normalized];
  if (seeded) return seeded;
  const meaningZh = part.meaning?.zh ?? part.text;
  const meaningEn = part.meaning?.en ?? part.text;
  return {
    zh: `${analysis.word.dutch} 里能看见 ${part.text} 这一小块，意思是“${meaningZh}”。先抓住这块，再记整词。`,
    en: `${analysis.word.dutch} contains the small piece ${part.text}, meaning "${meaningEn}". Catch that piece first, then remember the whole word.`,
  };
}

function candidateForPart(analysis: WordAnalysis, part: FormationPart, evidence: MemoryBubbleCandidate["evidence"]): MemoryBubbleCandidate {
  const reason = relationReasonFor(analysis, part);
  return {
    sourceWordId: analysis.word.id,
    sourceText: analysis.word.dutch,
    targetWordId: part.word?.id,
    targetText: part.text,
    targetMeaning: part.meaning,
    targetExistsInVocabulary: Boolean(part.word),
    isExtensionWord: !part.word,
    isExtensionTarget: !part.word,
    relationType: "compound-part",
    source: evidence === "lexicon" ? "seed" : "rule",
    evidence,
    reasonZh: reason.zh,
    reasonEn: reason.en,
    strength: "strong",
    confidence: "high",
    showToLearner: true,
    sourceLevel: analysis.word.level,
    targetLevel: part.word?.level,
  };
}

function candidateForFormationTarget(
  analysis: WordAnalysis,
  words: WordItem[],
  targetText: string,
  targetMeaning: { zh: string; en: string } | undefined,
  reason: { zh: string; en: string },
  options: Partial<Pick<MemoryBubbleCandidate, "relationType" | "source" | "evidence" | "strength">> = {},
): MemoryBubbleCandidate | undefined {
  const targetKey = normalizeWordText(targetText);
  const targetWord = wordMapFor(words).get(targetKey);
  const meaning = targetWord?.meaning ?? targetMeaning ?? extensionMeaningFor(targetKey);
  if (!meaning) return undefined;
  return {
    sourceWordId: analysis.word.id,
    sourceText: analysis.word.dutch,
    targetWordId: targetWord?.id,
    targetText,
    targetMeaning: meaning,
    targetExistsInVocabulary: Boolean(targetWord),
    isExtensionWord: !targetWord,
    isExtensionTarget: !targetWord,
    relationType: options.relationType ?? "compound-part",
    source: options.source ?? "rule",
    evidence: options.evidence ?? "safe-rule",
    reasonZh: reason.zh,
    reasonEn: reason.en,
    strength: options.strength ?? "strong",
    confidence: "high",
    showToLearner: true,
    sourceLevel: analysis.word.level,
    targetLevel: targetWord?.level,
  };
}

function suffixFormationCandidatesFor(analysis: WordAnalysis, words: WordItem[]) {
  const source = analysis.normalizedForm;
  const sourceText = analysis.word.dutch;
  const candidates: MemoryBubbleCandidate[] = [];

  if (source.endsWith("heid") && source !== "overheid") {
    const base = source.slice(0, -"heid".length);
    const suffix = source.endsWith("baarheid") ? suffixMeanings.baarheid : suffixMeanings.heid;
    const baseReason = source.endsWith("baarheid")
      ? {
          zh: `${sourceText} 可以先拆成 ${base} + -heid；${suffix.zh}`,
          en: `${sourceText} can first be read as ${base} + -heid. ${suffix.en}`,
        }
      : {
          zh: `${sourceText} 可以先拆成 ${base} + -heid；${suffix.zh}`,
          en: `${sourceText} can first be read as ${base} + -heid. ${suffix.en}`,
        };
    const baseCandidate = candidateForFormationTarget(
      analysis,
      words,
      base,
      heidBaseMeanings[base] ?? baarAdjectiveMeanings[base],
      baseReason,
    );
    if (baseCandidate) candidates.push(baseCandidate);
    const suffixCandidate = candidateForFormationTarget(
      analysis,
      words,
      source.endsWith("baarheid") ? "-baarheid" : "-heid",
      suffix,
      {
        zh: `${sourceText} 里的 ${source.endsWith("baarheid") ? "-baarheid" : "-heid"} 是后缀，不是随便硬背整词。${suffix.zh}`,
        en: `${sourceText} contains the suffix ${source.endsWith("baarheid") ? "-baarheid" : "-heid"}; do not memorize the whole word as a random block. ${suffix.en}`,
      },
    );
    if (suffixCandidate) candidates.push(suffixCandidate);
  }

  if (source.endsWith("baar") && source !== "openbaar") {
    const suffixCandidate = candidateForFormationTarget(
      analysis,
      words,
      "-baar",
      suffixMeanings.baar,
      {
        zh: `${sourceText} 里的 -baar 是“可……的”后缀，先抓这个规律。`,
        en: `${sourceText} contains the suffix -baar, meaning able to be ...; catch this pattern first.`,
      },
    );
    if (suffixCandidate) candidates.push(suffixCandidate);
    const baseHint = baarBaseHints[source];
    if (baseHint) {
      const baseCandidate = candidateForFormationTarget(
        analysis,
        words,
        baseHint.target,
        baseHint.meaning,
        {
          zh: `${sourceText} 可以从 ${baseHint.target} 这条动作线索接过去：加 -baar 后变成“可……的”。`,
          en: `${sourceText} can be linked back to ${baseHint.target}; adding -baar turns it into 'able to be ...'.`,
        },
      );
      if (baseCandidate) candidates.push(baseCandidate);
    }
  }

  return candidates;
}

function numberPieceCandidate(
  analysis: WordAnalysis,
  words: WordItem[],
  targetText: string,
  reason: { zh: string; en: string },
) {
  return candidateForFormationTarget(
    analysis,
    words,
    targetText,
    numberBaseMeanings[targetText],
    reason,
    { relationType: "compound-part", evidence: "safe-rule", source: "rule", strength: "strong" },
  );
}

function numberFamilyCandidate(
  analysis: WordAnalysis,
  words: WordItem[],
  targetText: string,
  reason: { zh: string; en: string },
) {
  return candidateForFormationTarget(
    analysis,
    words,
    targetText,
    numberBaseMeanings[targetText],
    reason,
    { relationType: "word-family", evidence: "safe-rule", source: "rule", strength: "strong" },
  );
}

function numberFormationCandidatesFor(analysis: WordAnalysis, words: WordItem[]) {
  const source = analysis.normalizedForm;
  const sourceText = analysis.word.dutch;
  const candidates: MemoryBubbleCandidate[] = [];

  const simpleFamily = simpleNumberFamilies[source];
  if (simpleFamily) {
    simpleFamily.targets.forEach((target) => {
      const familyCandidate = numberFamilyCandidate(analysis, words, target, {
        zh: `${sourceText} 的数字词族线索：${simpleFamily.noteZh}`,
        en: `Number-family clue for ${sourceText}: ${simpleFamily.noteEn}`,
      });
      if (familyCandidate) candidates.push(familyCandidate);
    });
  }

  const teen = teenNumberParts[source];
  if (teen) {
    const unitCandidate = numberPieceCandidate(analysis, words, teen.unit, {
      zh: `${sourceText} 先看前半截：${teen.noteZh}`,
      en: `First read the front part of ${sourceText}: ${teen.noteEn}`,
    });
    if (unitCandidate) candidates.push(unitCandidate);

    const tienCandidate = numberPieceCandidate(analysis, words, "tien", {
      zh: `${sourceText} 属于十几数，核心尾巴是 tien（十）。`,
      en: `${sourceText} is a teen number, with tien (ten) as its core ending.`,
    });
    if (tienCandidate) candidates.push(tienCandidate);

    if (teen.familyTen) {
      const familyCandidate = numberFamilyCandidate(analysis, words, teen.familyTen, {
        zh: `${sourceText} 和 ${teen.familyTen} 共用同一条数字词根：十几用 tien，整十用 -tig。`,
        en: `${sourceText} and ${teen.familyTen} share the same number root: teens use tien, tens use -tig.`,
      });
      if (familyCandidate) candidates.push(familyCandidate);
    }
    return candidates;
  }

  const ten = tenNumberParts[source];
  if (ten) {
    if (ten.unit) {
      const unitCandidate = numberPieceCandidate(analysis, words, ten.unit, {
        zh: `${sourceText} 先连回基础数字 ${ten.unit}：${ten.noteZh}`,
        en: `${sourceText} first links back to the base number ${ten.unit}: ${ten.noteEn}`,
      });
      if (unitCandidate) candidates.push(unitCandidate);
    }
    const suffixCandidate = numberPieceCandidate(analysis, words, "-tig", {
      zh: `${sourceText} 是整十数；-tig 负责“几十”这层结构，遇到变形再特别记。`,
      en: `${sourceText} is a tens number; -tig carries the tens pattern, with spelling changes learned separately.`,
    });
    if (suffixCandidate) candidates.push(suffixCandidate);
    return candidates;
  }

  const compoundTen = numberTenWords.find((tenWord) => source.endsWith(tenWord));
  const unitPrefix = compoundTen
    ? compoundNumberUnitPrefixes.find((entry) => source === `${entry.prefix}${compoundTen}`)
    : undefined;
  if (compoundTen && unitPrefix) {
    const unitCandidate = numberPieceCandidate(analysis, words, unitPrefix.unit, {
      zh: `${sourceText} 是“个位 + en + 十位”：先抓个位 ${unitPrefix.unit}。`,
      en: `${sourceText} follows ones + en + tens: first catch the ones part ${unitPrefix.unit}.`,
    });
    if (unitCandidate) candidates.push(unitCandidate);
    const connectorCandidate = numberPieceCandidate(analysis, words, "en", {
      zh: `${sourceText} 中间的 en 是数字连接词，相当于“个位和十位之间的 +”。`,
      en: `The en in ${sourceText} is the number connector between ones and tens.`,
    });
    if (connectorCandidate) candidates.push(connectorCandidate);
    const tenCandidate = numberPieceCandidate(analysis, words, compoundTen, {
      zh: `${sourceText} 最后落到整十 ${compoundTen}；荷兰语几十几先说个位，再说十位。`,
      en: `${sourceText} ends with the tens word ${compoundTen}; Dutch compound numbers say ones before tens.`,
    });
    if (tenCandidate) candidates.push(tenCandidate);
  }

  return candidates;
}

function timeRelationCandidate(
  analysis: WordAnalysis,
  target: FormationPart,
  relationType: Extract<MemoryBubbleRelationType, "time-contrast" | "time-category">,
  reason: { zh: string; en: string },
): MemoryBubbleCandidate {
  return {
    sourceWordId: analysis.word.id,
    sourceText: analysis.word.dutch,
    targetWordId: target.word?.id,
    targetText: target.text,
    targetMeaning: target.meaning,
    targetExistsInVocabulary: Boolean(target.word),
    isExtensionWord: !target.word,
    isExtensionTarget: !target.word,
    relationType,
    source: "seed",
    evidence: "lexicon",
    reasonZh: reason.zh,
    reasonEn: reason.en,
    strength: relationType === "time-contrast" ? "strong" : "medium",
    confidence: "high",
    showToLearner: true,
    sourceLevel: analysis.word.level,
    targetLevel: target.word?.level,
  };
}

function timeRelationsFor(analysis: WordAnalysis, words: WordItem[]) {
  const source = analysis.normalizedForm;
  const dayParts = relationLexicons.timeRelations.dayParts.map(normalizeWordText);
  if (!dayParts.includes(source)) return [];

  const contrastRelations = relationLexicons.timeRelations.contrasts.flatMap(([a, b, reasonZh, reasonEn]) => {
    const left = normalizeWordText(a);
    const right = normalizeWordText(b);
    if (source !== left && source !== right) return [];
    const targetText = source === left ? b : a;
    const target = partFor(targetText, words);
    if (!target) return [];
    return timeRelationCandidate(analysis, target, "time-contrast", { zh: reasonZh, en: reasonEn });
  });

  const categoryRelations = relationLexicons.timeRelations.dayParts
    .filter((part) => normalizeWordText(part) !== source)
    .map((part) => partFor(part, words))
    .filter(Boolean)
    .slice(0, 5)
    .map((target) => timeRelationCandidate(
      analysis,
      target as FormationPart,
      "time-category",
      {
        zh: `${target!.text} 和 ${analysis.word.dutch} 都是一天里的时间词。`,
        en: `${target!.text} and ${analysis.word.dutch} are both time-of-day words.`,
      },
    ));

  return [...contrastRelations, ...categoryRelations];
}

export function analyzeWordFormationFromAnalysis(analysis: WordAnalysis, allWords: WordItem[]): MemoryBubbleCandidate[] {
  const explicitParts = explicitPartsFor(analysis, allWords);
  const safeParts = explicitParts.length || analysis.wordType === "verb" ? [] : safeSplitPartsFor(analysis, allWords);
  const evidence: MemoryBubbleCandidate["evidence"] = explicitParts.length ? "lexicon" : "safe-rule";
  const partCandidates = uniqueParts(explicitParts.length ? explicitParts : safeParts)
    .map((part) => candidateForPart(analysis, part, evidence));

  return [
    ...suffixFormationCandidatesFor(analysis, allWords),
    ...numberFormationCandidatesFor(analysis, allWords),
    ...partCandidates,
    ...timeRelationsFor(analysis, allWords),
  ];
}

export function analyzeWordFormation(word: WordItem, allWords: WordItem[]): MemoryBubbleCandidate[] {
  return analyzeWordFormationFromAnalysis(analyzeWord(word, allWords), allWords);
}
