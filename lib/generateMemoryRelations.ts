import { goldenMemoryRelations } from "@/data/goldenMemoryRelations";
import { checkMemoryRelationQuality, relationQualityScore } from "@/lib/checkMemoryRelationQuality";
import {
  byDutch,
  categoryGroups,
  collocationRules,
  confusionPairs,
  knownCompoundParts,
  oppositePairs,
  relationLabels,
  relationPriority,
  rootFamilies,
  semanticTagGroups,
  scenarioNeighbors,
  synonymPairs,
  visibleTargetExists,
} from "@/lib/relationRules";
import type { MemoryRelation, MemoryRelationType } from "@/types/memoryRelation";
import type { WordItem } from "@/types/vocabulary";

const norm = (value: string) => value.trim().toLowerCase();

function targetId(targetText: string, wordMap: Map<string, WordItem>) {
  return wordMap.get(norm(targetText))?.id;
}

function relationId(source: WordItem, targetText: string, type: MemoryRelationType) {
  return `${source.id}-${type}-${norm(targetText).replace(/[^a-z0-9]+/g, "-")}`;
}

function makeRelation(
  source: WordItem,
  targetText: string,
  relationType: MemoryRelationType,
  wordMap: Map<string, WordItem>,
  data: Partial<Omit<MemoryRelation, "sourceWordId" | "sourceText" | "targetText" | "relationType">> = {},
): MemoryRelation {
  const labels = relationLabels[relationType];
  const relation: MemoryRelation = {
    id: data.id ?? relationId(source, targetText, relationType),
    sourceWordId: source.id,
    sourceText: source.dutch,
    targetWordId: data.targetWordId ?? targetId(targetText, wordMap),
    targetText,
    relationType,
    labelZh: data.labelZh ?? labels.zh,
    labelEn: data.labelEn ?? labels.en,
    reasonZh: data.reasonZh ?? "",
    reasonEn: data.reasonEn ?? "",
    examplePhrase: data.examplePhrase,
    exampleSentence: data.exampleSentence,
    strength: data.strength ?? "medium",
    confidence: data.confidence ?? "medium",
    showToLearner: data.showToLearner ?? true,
    needsHumanReview: data.needsHumanReview ?? false,
    generatedBy: data.generatedBy ?? "rule",
  };
  const quality = checkMemoryRelationQuality(relation, source, relation.targetWordId ? wordMap.get(norm(targetText)) : undefined);
  return {
    ...relation,
    showToLearner: relation.showToLearner && quality.shouldShowToLearner,
    needsHumanReview: relation.needsHumanReview || quality.needsHumanReview,
  };
}

function goldenRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  return (goldenMemoryRelations[norm(source.dutch)] ?? []).map((golden) =>
    makeRelation(source, golden.targetText, golden.relationType, wordMap, {
      ...golden,
      generatedBy: "golden-example",
    }),
  );
}

function compoundRelationsFor(source: WordItem, allWords: WordItem[], wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  const parts = knownCompoundParts[sourceKey] ?? [];
  const partRelations = parts
    .filter((part) => visibleTargetExists(part.part, wordMap))
    .map((part) =>
      makeRelation(source, part.part, "compound-part", wordMap, {
        reasonZh: `${source.dutch} 是由 ${parts.map((item) => item.part).join(" + ")} 拼起来的。先认出 ${part.part} = “${part.zh}”，整词就好记多了。`,
        reasonEn: `${source.dutch} is built from ${parts.map((item) => item.part).join(" + ")}. First spot ${part.part} = "${part.en}", then the full word is easier to remember.`,
        examplePhrase: { dutch: source.dutch, meaningZh: source.meaning.zh, meaningEn: source.meaning.en },
        strength: "strong",
        confidence: "high",
      }),
    );

  const parentRelations = allWords
    .filter((word) => word.id !== source.id)
    .filter((word) => knownCompoundParts[norm(word.dutch)]?.some((part) => norm(part.part) === sourceKey))
    .slice(0, 4)
    .map((word) =>
      makeRelation(source, word.dutch, "compound-parent", wordMap, {
        reasonZh: `${word.dutch} 里也有 ${source.dutch} 这一块。认出共同小块，整组词都更好记。`,
        reasonEn: `${word.dutch} also contains ${source.dutch}. Spot the shared piece and the whole set becomes easier to remember.`,
        examplePhrase: { dutch: word.dutch, meaningZh: word.meaning.zh, meaningEn: word.meaning.en },
        strength: "medium",
        confidence: "high",
      }),
    );

  return [...partRelations, ...parentRelations];
}

function familyRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  return rootFamilies
    .filter((family) => family.map(norm).includes(sourceKey))
    .flatMap((family) =>
      family
        .filter((target) => norm(target) !== sourceKey && wordMap.has(norm(target)))
        .map((target) =>
          makeRelation(source, target, "root-family", wordMap, {
            reasonZh: `${source.dutch} 和 ${target} 属于同一个词根/词族，意思或用法有真实联系。`,
            reasonEn: `${source.dutch} and ${target} belong to the same root family with a real usage connection.`,
            strength: "strong",
            confidence: "high",
          }),
        ),
    );
}

function collocationRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  return (collocationRules[norm(source.dutch)] ?? [])
    .filter((rule) => visibleTargetExists(rule.target, wordMap))
    .map((rule) =>
      makeRelation(source, rule.target, "phrase-collocation", wordMap, {
        reasonZh: `${source.dutch} 常用在「${rule.phrase}」这个搭配里。`,
        reasonEn: `${source.dutch} is commonly used in the chunk "${rule.phrase}".`,
        examplePhrase: { dutch: rule.phrase, meaningZh: rule.zh, meaningEn: rule.en },
        exampleSentence: rule.sentence ? { dutch: rule.sentence, meaningZh: rule.sentenceZh ?? "", meaningEn: rule.sentenceEn ?? "" } : undefined,
        strength: "strong",
        confidence: "high",
      }),
    );
}

function pairRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  const opposite = oppositePairs.flatMap(([a, b, sentenceA, sentenceB]) => {
    if (sourceKey !== norm(a) && sourceKey !== norm(b)) return [];
    const target = sourceKey === norm(a) ? b : a;
    const sourceSentence = sourceKey === norm(a) ? sentenceA : sentenceB;
    const targetSentence = sourceKey === norm(a) ? sentenceB : sentenceA;
    if (!visibleTargetExists(target, wordMap)) return [];
    return makeRelation(source, target, "opposite", wordMap, {
      reasonZh: `${source.dutch} 和 ${target} 是清楚的反义关系，成对记最省力。`,
      reasonEn: `${source.dutch} and ${target} are clear opposites, useful as a pair.`,
      exampleSentence: { dutch: `${sourceSentence} / ${targetSentence}`, meaningZh: "对比句", meaningEn: "contrast sentences" },
      strength: "strong",
      confidence: "high",
    });
  });

  const synonym = synonymPairs.flatMap(([a, b, note]) => {
    if (sourceKey !== norm(a) && sourceKey !== norm(b)) return [];
    const target = sourceKey === norm(a) ? b : a;
    if (!visibleTargetExists(target, wordMap)) return [];
    return makeRelation(source, target, "synonym", wordMap, {
      reasonZh: `${source.dutch} 和 ${target} 意思接近。${note}`,
      reasonEn: `${source.dutch} and ${target} are close in meaning. ${note}`,
      strength: "medium",
      confidence: "high",
    });
  });

  return [...opposite, ...synonym];
}

function categoryRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  return categoryGroups.flatMap((group) => {
    const categoryKey = norm(group.category);
    const memberKeys = group.members.map(norm);
    if (sourceKey === categoryKey) {
      return group.members
        .filter((member) => wordMap.has(norm(member)))
        .slice(0, 5)
        .map((member) =>
          makeRelation(source, member, "category-member", wordMap, {
            reasonZh: group.reasonZh,
            reasonEn: group.reasonEn,
            strength: "strong",
            confidence: "high",
          }),
        );
    }
    if (memberKeys.includes(sourceKey) && wordMap.has(categoryKey)) {
      return [
        makeRelation(source, group.category, "category-member", wordMap, {
          reasonZh: `${source.dutch} 属于「${group.category}」这个类别。${group.reasonZh}`,
          reasonEn: `${source.dutch} belongs to the category "${group.category}". ${group.reasonEn}`,
          strength: "medium",
          confidence: "high",
        }),
      ];
    }
    if (memberKeys.includes(sourceKey)) {
      return group.members
        .filter((member) => norm(member) !== sourceKey && wordMap.has(norm(member)))
        .slice(0, 4)
        .map((member) =>
          makeRelation(source, member, "category-member", wordMap, {
            reasonZh: group.reasonZh,
            reasonEn: group.reasonEn,
            strength: "medium",
            confidence: "high",
          }),
        );
    }
    return [];
  });
}

function scenarioRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  const direct = (scenarioNeighbors[norm(source.dutch)] ?? [])
    .filter((neighbor) => visibleTargetExists(neighbor.target, wordMap))
    .map((neighbor) =>
      makeRelation(source, neighbor.target, "scenario-neighbor", wordMap, {
        reasonZh: neighbor.zh,
        reasonEn: neighbor.en,
        examplePhrase: neighbor.phrase ? { dutch: neighbor.phrase, meaningZh: "", meaningEn: "" } : undefined,
        strength: neighbor.phrase ? "strong" : "medium",
        confidence: "high",
      }),
    );

  const reverse = Object.entries(scenarioNeighbors)
    .filter(([sourceText, neighbors]) => sourceText !== norm(source.dutch) && neighbors.some((neighbor) => norm(neighbor.target) === norm(source.dutch)))
    .filter(([sourceText]) => wordMap.has(sourceText))
    .slice(0, 3)
    .map(([sourceText]) =>
      makeRelation(source, sourceText, "scenario-neighbor", wordMap, {
        reasonZh: `${source.dutch} 和 ${sourceText} 是同一个实用场景里的高频搭档。`,
        reasonEn: `${source.dutch} and ${sourceText} are useful neighbors in the same practical scenario.`,
        strength: "medium",
        confidence: "medium",
      }),
    );

  return [...direct, ...reverse].slice(0, 5);
}

function semanticTagRelationsFor(source: WordItem, allWords: WordItem[], wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  const relations: MemoryRelation[] = [];
  source.scenarioTags.forEach((tag) => {
    const rule = semanticTagGroups[tag];
    if (!rule) return;
    const candidates = allWords
      .filter((word) => word.id !== source.id && norm(word.dutch) !== sourceKey)
      .filter((word) => word.scenarioTags.includes(tag))
      .filter((word) => visibleTargetExists(word.dutch, wordMap))
      .sort((a, b) => {
        const activeDiff = Number(b.activeOrPassive === "active") - Number(a.activeOrPassive === "active");
        if (activeDiff !== 0) return activeDiff;
        const examDiff = (b.examRelevance === "high" ? 2 : b.examRelevance === "medium" ? 1 : 0) - (a.examRelevance === "high" ? 2 : a.examRelevance === "medium" ? 1 : 0);
        if (examDiff !== 0) return examDiff;
        return a.dutch.localeCompare(b.dutch);
      })
      .slice(0, rule.max);

    candidates.forEach((target) => {
      relations.push(makeRelation(source, target.dutch, rule.relation, wordMap, {
        reasonZh: rule.reasonZh,
        reasonEn: rule.reasonEn,
        examplePhrase: rule.relation === "scenario-neighbor"
          ? {
              dutch: `${source.dutch} / ${target.dutch}`,
              meaningZh: `${source.meaning.zh} / ${target.meaning.zh}`,
              meaningEn: `${source.meaning.en} / ${target.meaning.en}`,
            }
          : undefined,
        strength: "medium",
        confidence: "high",
      }));
    });
  });
  return relations;
}

function confusionRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  return confusionPairs.flatMap((pair) => {
    if (sourceKey !== norm(pair.a) && sourceKey !== norm(pair.b)) return [];
    const target = sourceKey === norm(pair.a) ? pair.b : pair.a;
    if (!visibleTargetExists(target, wordMap)) return [];
    return makeRelation(source, target, "confusion-pair", wordMap, {
      reasonZh: pair.reasonZh,
      reasonEn: pair.reasonEn,
      exampleSentence: { dutch: `${pair.sentenceA} / ${pair.sentenceB}`, meaningZh: "对比句", meaningEn: "contrast sentences" },
      strength: "strong",
      confidence: "high",
    });
  });
}

function articleAndSuffixRelationsFor(source: WordItem, allWords: WordItem[], wordMap: Map<string, WordItem>) {
  const sourceKey = norm(source.dutch);
  if (/\s/.test(sourceKey) || !source.article) return [];
  const suffixRules: Array<{ suffix: RegExp; type: MemoryRelationType; zh: string; en: string; article?: "de" | "het" }> = [
    { suffix: /ing$/, type: "article-family", zh: "-ing 结尾多半是 de 词。", en: "-ing words are often de words.", article: "de" },
    { suffix: /heid$/, type: "article-family", zh: "-heid 结尾多半是 de 词。", en: "-heid words are often de words.", article: "de" },
    { suffix: /(tie|ie)$/, type: "article-family", zh: "-tie/-ie 结尾多半是 de 词。", en: "-tie/-ie words are often de words.", article: "de" },
    { suffix: /ment$/, type: "article-family", zh: "-ment 结尾常见 het 词。", en: "-ment words are often het words.", article: "het" },
    { suffix: /(je|tje|pje|etje|kje)$/, type: "article-family", zh: "-je 小词通常是 het。", en: "Diminutives ending in -je are usually het.", article: "het" },
  ];
  const rule = suffixRules.find((item) => item.suffix.test(sourceKey));
  if (!rule) return [];
  return allWords
    .filter((word) => {
      const targetKey = norm(word.dutch);
      return word.id !== source.id && !/\s/.test(targetKey) && Boolean(word.article) && rule.suffix.test(targetKey) && (!rule.article || word.article === rule.article);
    })
    .slice(0, 4)
    .map((word) =>
      makeRelation(source, word.dutch, rule.type, wordMap, {
        reasonZh: `${source.dutch} 和 ${word.dutch} 有同样的词尾线索：${rule.zh}`,
        reasonEn: `${source.dutch} and ${word.dutch} share the same suffix clue: ${rule.en}`,
        strength: "medium",
        confidence: "high",
      }),
    );
}

function bridgeTargetFrom(value: string) {
  const bridge = value.trim();
  const patterns = [
    /(?:looks like|close to|very close to|related to|same as|same spelling as)\s+([a-z][a-z -]*)/i,
    /(?:means|mean)\s+([a-z][a-z -]*)/i,
    /≈\s*([a-z][a-z -]*)/i,
    /^([a-z][a-z -]*)\s*(?:=|≈)/i,
  ];
  const match = patterns.map((pattern) => bridge.match(pattern)?.[1]).find(Boolean);
  const target = (match ?? bridge)
    .replace(/[.;:!?].*$/g, "")
    .replace(/\bbut\b.*$/i, "")
    .replace(/\bwhen\b.*$/i, "")
    .trim()
    .toLowerCase();
  if (!target || target.length > 24 || /\b(word|meaning|noun|verb|clothing|bridge|chunk)\b/i.test(target)) return undefined;
  return target;
}

function englishBridgeRelationsFor(source: WordItem, wordMap: Map<string, WordItem>) {
  return [];
}

function pluralFamilyRelationsFor(source: WordItem, allWords: WordItem[], wordMap: Map<string, WordItem>) {
  if (!source.plural) return [];
  const reliablePluralWords = new Set([
    "boek",
    "huis",
    "ziekenhuis",
    "afspraak",
    "rekening",
    "woning",
    "gemeente",
    "fiets",
    "trein",
    "kamer",
    "tafel",
    "stoel",
    "arm",
    "been",
    "rug",
    "keel",
    "hoofd",
    "buik",
    "hand",
    "voet",
    "appel",
    "aardappel",
    "sinaasappel",
    "jas",
    "broek",
    "sok",
  ]);
  if (!reliablePluralWords.has(norm(source.dutch))) return [];
  const plural = norm(source.plural);
  const rule =
    plural.endsWith("en") ? "plural-en" :
    plural.endsWith("s") ? "plural-s" :
    plural.includes("'s") ? "plural-apostrophe-s" :
    "";
  if (!rule) return [];
  return allWords
    .filter((word) => word.id !== source.id && word.plural)
    .filter((word) => reliablePluralWords.has(norm(word.dutch)))
    .filter((word) => {
      const targetPlural = norm(word.plural ?? "");
      if (rule === "plural-en") return targetPlural.endsWith("en");
      if (rule === "plural-s") return targetPlural.endsWith("s") && !targetPlural.includes("'s");
      return targetPlural.includes("'s");
    })
    .slice(0, 3)
    .map((word) =>
      makeRelation(source, word.dutch, "plural-family", wordMap, {
        reasonZh: `${source.dutch} → ${source.plural}，${word.dutch} → ${word.plural}，复数规则相似。`,
        reasonEn: `${source.dutch} → ${source.plural}, ${word.dutch} → ${word.plural}; they share a plural pattern.`,
        strength: "medium",
        confidence: "medium",
      }),
    );
}

function dedupeAndSort(relations: MemoryRelation[]) {
  const best = new Map<string, MemoryRelation>();
  for (const relation of relations) {
    if (relation.relationType === "english-bridge") continue;
    if (norm(relation.sourceText) === norm(relation.targetText)) continue;
    const key = `${relation.relationType}:${norm(relation.targetText)}`;
    const current = best.get(key);
    if (!current || relationQualityScore(relation) > relationQualityScore(current) || relation.generatedBy === "golden-example") {
      best.set(key, relation);
    }
  }
  return [...best.values()].sort((a, b) => {
    const priorityDiff = relationPriority.indexOf(a.relationType) - relationPriority.indexOf(b.relationType);
    if (priorityDiff !== 0) return priorityDiff;
    return relationQualityScore(b) - relationQualityScore(a);
  });
}

export function generateMemoryRelationsForWord(word: WordItem, allWords: WordItem[]): MemoryRelation[] {
  const wordMap = byDutch(allWords);
  const relations = [
    ...goldenRelationsFor(word, wordMap),
    ...compoundRelationsFor(word, allWords, wordMap),
    ...familyRelationsFor(word, wordMap),
    ...collocationRelationsFor(word, wordMap),
    ...pairRelationsFor(word, wordMap),
    ...categoryRelationsFor(word, wordMap),
    ...semanticTagRelationsFor(word, allWords, wordMap),
    ...scenarioRelationsFor(word, wordMap),
    ...confusionRelationsFor(word, wordMap),
    ...articleAndSuffixRelationsFor(word, allWords, wordMap),
    ...pluralFamilyRelationsFor(word, allWords, wordMap),
    ...englishBridgeRelationsFor(word, wordMap),
  ];

  return dedupeAndSort(relations);
}

export function generateLearnerMemoryRelationsForWord(word: WordItem, allWords: WordItem[], limit = 6): MemoryRelation[] {
  return generateMemoryRelationsForWord(word, allWords)
    .filter((relation) => relation.showToLearner)
    .slice(0, limit);
}

export function generateAllMemoryRelations(words: WordItem[]) {
  return words.flatMap((word) => generateMemoryRelationsForWord(word, words));
}
