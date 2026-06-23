import { relationLexicons } from "@/data/relationLexicons";
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
  return (relationLexicons.compoundParts[analysis.normalizedForm] ?? [])
    .map((part) => partFor(part, words))
    .filter(Boolean) as FormationPart[];
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
  const safeParts = explicitParts.length ? [] : safeSplitPartsFor(analysis, allWords);
  const evidence: MemoryBubbleCandidate["evidence"] = explicitParts.length ? "lexicon" : "safe-rule";
  const partCandidates = uniqueParts(explicitParts.length ? explicitParts : safeParts)
    .map((part) => candidateForPart(analysis, part, evidence));

  return [
    ...partCandidates,
    ...timeRelationsFor(analysis, allWords),
  ];
}

export function analyzeWordFormation(word: WordItem, allWords: WordItem[]): MemoryBubbleCandidate[] {
  return analyzeWordFormationFromAnalysis(analyzeWord(word, allWords), allWords);
}
