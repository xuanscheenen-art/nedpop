import { relationLexicons } from "@/data/relationLexicons";
import { generateRelationsForWord, type MemoryRelationType, type RelationSource } from "@/lib/relationEngine";
import type { LocalizedText } from "@/types/course";
import type { MemoryLink, MemoryLinkType, WordItem } from "@/types/vocabulary";

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export type WordAssociation = {
  dutch: string;
  wordId?: string;
  meaning?: LocalizedText;
  targetExistsInVocabulary?: boolean;
  isExtensionWord?: boolean;
  isExtensionTarget?: boolean;
  source?: RelationSource | "extension";
  type: MemoryRelationType;
  kind: LocalizedText;
  reason: LocalizedText;
};

const relationFallbackLabels: Record<MemoryRelationType, LocalizedText> = {
  "compound-part": text("词里小块", "Word Piece"),
  "compound-parent": text("同组拼词", "Compound Set"),
  "compound-family": text("同组拼词", "Compound Set"),
  "part-related": text("短语小块", "Phrase Piece"),
  "word-family": text("同词族", "Word Family"),
  "verb-form": text("动词形式", "Verb Form"),
  "verb-noun-pair": text("词族联想", "Verb/Noun Pair"),
  synonym: text("同义词", "Synonym"),
  opposite: text("反义/对比", "Opposite/Contrast"),
  "time-contrast": text("时间对照", "Time Contrast"),
  "comparative-superlative": text("比较级 / 最高级", "Comparative"),
  "time-category": text("时间相关", "Time Related"),
  "scenario-word": text("同场景", "Scenario Word"),
  "action-object": text("动作相关", "Action Link"),
  "state-action": text("状态 → 动作", "State to Action"),
  "category-member": text("同类别", "Category"),
  "confusion-pair": text("易混词", "Confusion Pair"),
  "english-bridge": text("英文桥梁", "English Bridge"),
};

const legacyTypeMap: Record<MemoryLinkType, MemoryRelationType> = {
  "compound-part": "compound-part",
  "compound-parent": "compound-parent",
  "compound-family": "compound-family",
  "part-related": "part-related",
  "same-family": "word-family",
  "root-family": "word-family",
  "prefix-suffix-family": "word-family",
  "word-family": "word-family",
  "verb-form": "verb-form",
  synonym: "synonym",
  opposite: "opposite",
  antonym: "opposite",
  similar: "confusion-pair",
  "time-contrast": "time-contrast",
  "time-category": "time-category",
  "comparative-superlative": "comparative-superlative",
  "english-bridge": "english-bridge",
  "phrase-collocation": "scenario-word",
  "usage-chunk": "scenario-word",
  "verb-noun-pair": "verb-noun-pair",
  "category-member": "category-member",
  "scenario-neighbor": "scenario-word",
  "same-scene": "scenario-word",
  "confusion-pair": "confusion-pair",
  derivation: "word-family",
  "article-family": "scenario-word",
  "plural-family": "scenario-word",
  "number-family": "category-member",
  "scenario-word": "scenario-word",
  "action-object": "action-object",
  "state-action": "state-action",
};

const weakManualReasonPattern =
  /内容后台设置|creator-set|适合放在同一个记忆泡泡|belongs in the same memory bubble|请补充|add why|和当前词一起记|learn with the current word|同等级|同一天|same level|same day|同一个实用场景|useful neighbors|相关词|可以一起记|适合一起记|礼貌表达词组|按对话来回一起记|看病场景词组|按症状、医生、药房一起记/i;

const normalizeDutch = (value: string) => value.trim().toLowerCase().replace(/[.!?]+$/g, "");
const phraseTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;
const phraseComponentKind = text("短语组成", "Phrase Part");
const phraseComponentStopwords = new Set(["de", "het", "een"]);
const phraseComponentMeanings: Record<string, Record<string, LocalizedText>> = {
  "een beetje": {
    een: text("一个 / 一点里的“一”", "one / the one in a little"),
    beetje: text("小点 / 一点", "little bit"),
  },
};
const looseGeneratedRelationTypes = new Set<MemoryRelationType>(["category-member", "scenario-word", "action-object", "state-action"]);
const technicalReasonPattern =
  /安全拆出|安全回到|意思部件|核心部件|真实词根\/部件|语义桶|校验|显式关联词|规则筛选|component word|meaningful part|safely links|passed the semantic bucket|role-aware/i;

const looksLikeExplanationTarget = (value: string) =>
  /^(looks like|means|close to|same as|related to)\b/i.test(value.trim()) ||
  /^(de|het|een)\s+/i.test(value.trim()) ||
  /[.!?]$/.test(value.trim()) ||
  value.trim().split(/\s+/).length > 1;

const isContrastReason = (reason: string) =>
  /区别|不要混|容易混|不同|不是|confus|different|not the same|noun|verb|名词|动词/i.test(reason);

const isUsefulManualLink = (source: WordItem, link: MemoryLink) => {
  if (link.type === "english-bridge") return false;
  const reason = `${link.explanation?.zh ?? ""} ${link.explanation?.en ?? ""}`.trim();
  if (!link.dutch.trim() || looksLikeExplanationTarget(link.dutch) || !reason || weakManualReasonPattern.test(reason)) return false;
  if ((link.type === "article-family" || link.type === "plural-family") && (!source.article || /\s/.test(source.dutch))) return false;
  if ((link.type === "confusion-pair" || link.type === "similar") && !isContrastReason(reason)) return false;
  return true;
};

function manualRelationTypeFor(link: MemoryLink): MemoryRelationType {
  const reason = `${link.explanation?.zh ?? ""} ${link.explanation?.en ?? ""}`.toLowerCase();
  if (/ik\/命令形式|命令形式|imperative form|ik form/.test(reason)) return "verb-form";
  if (/名词.*动词|动词.*名词|noun.*verb|verb.*noun/.test(reason)) return "verb-noun-pair";
  return legacyTypeMap[link.type] ?? "word-family";
}

function manualLinksFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return (selected.memoryLinks ?? [])
    .filter((link) => isUsefulManualLink(selected, link))
    .map((link) => {
      const relationType = manualRelationTypeFor(link);
      const match = wordByDutch.get(normalizeDutch(link.dutch));
      return {
        dutch: link.dutch,
        wordId: match?.id,
        meaning: match?.meaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: false,
        isExtensionTarget: false,
        source: "manual",
        type: relationType,
        kind: relationFallbackLabels[relationType],
        reason: link.explanation,
      };
    });
}

function phraseComponentReasonFor(sourceKey: string, token: string, targetText: string, sourceText: string) {
  if (sourceKey === "een beetje" && token === "een") {
    return text(
      "een 在这里不用当冠词硬背，先把它看成“一点点”里的“一”。",
      "In een beetje, read een as the one/a piece inside a little bit rather than overthinking the article.",
    );
  }
  if (sourceKey === "een beetje" && token === "beetje") {
    return text(
      "beetje 是“小点/一点”。een + beetje 合起来，就是“一点点”。",
      "beetje means little bit. een + beetje gives you a little bit.",
    );
  }
  return text(
    `${sourceText} 里有 ${targetText} 这一小块。先认出它，再把整块短语拿去用。`,
    `${sourceText} contains the small piece ${targetText}. Recognize it first, then use the whole phrase as a chunk.`,
  );
}

function phraseComponentAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const sourceKey = normalizeDutch(sourceText);
  const explicitComponents = phraseComponentMeanings[sourceKey] ?? {};
  const tokens = Array.from(sourceText.matchAll(phraseTokenPattern), (match) => normalizeDutch(match[0]))
    .filter(Boolean);
  const uniqueTokens = Array.from(new Set(tokens));
  if (uniqueTokens.length < 2) return [];

  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return uniqueTokens.flatMap((token) => {
    if (phraseComponentStopwords.has(token) && !explicitComponents[token]) return [];
    const match = wordByDutch.get(token);
    const extensionMeaning = explicitComponents[token] ?? relationLexicons.baseMorphemes[token as keyof typeof relationLexicons.baseMorphemes];
    if (!match && !extensionMeaning) return [];

    const targetText = match?.dutch ?? token;
    const targetMeaning = explicitComponents[token] ?? match?.meaning ?? extensionMeaning;
    const targetExists = Boolean(match);
    return [{
      dutch: targetText,
      wordId: match?.id,
      meaning: targetMeaning,
      targetExistsInVocabulary: targetExists,
      isExtensionWord: !targetExists,
      isExtensionTarget: !targetExists,
      source: targetExists ? "rule" : "extension",
      type: "part-related",
      kind: phraseComponentKind,
      reason: phraseComponentReasonFor(sourceKey, token, targetText, sourceText),
    } satisfies WordAssociation];
  });
}

function learnerReasonFor(source: WordItem, association: Pick<WordAssociation, "dutch" | "meaning" | "type" | "reason">): LocalizedText {
  const original = association.reason;
  const reasonText = `${original.zh} ${original.en}`;
  if (!technicalReasonPattern.test(reasonText)) return original;

  const target = association.dutch;
  const targetZh = association.meaning?.zh ? `（${association.meaning.zh}）` : "";
  const targetEn = association.meaning?.en ? ` (${association.meaning.en})` : "";
  const sourceText = source.dutch;

  switch (association.type) {
    case "compound-part":
    case "part-related":
      return text(
        `${sourceText} 里能看见 ${target}${targetZh} 这一小块。先抓住这块，再记整个词或短语。`,
        `${sourceText} contains the small piece ${target}${targetEn}. Catch that piece first, then remember the whole word or phrase.`,
      );
    case "compound-family":
    case "compound-parent":
      return text(
        `${sourceText} 和 ${target} 是同一组拼出来的词。认出共同的小块，整组都更好记。`,
        `${sourceText} and ${target} belong to the same compound-word set. Spot the shared piece and the set becomes easier to remember.`,
      );
    case "word-family":
    case "verb-noun-pair":
      return text(
        `${sourceText} 和 ${target} 像一组亲戚词，词形或意思有明显关系，放在一起记更稳。`,
        `${sourceText} and ${target} are word-family relatives. Their form or meaning connects, so learning them together helps.`,
      );
    case "scenario-word":
    case "category-member":
      return text(
        `${sourceText} 和 ${target} 常在同一个生活场景里碰到。把它们当一组实用词记。`,
        `${sourceText} and ${target} often appear in the same real-life situation. Learn them as a practical set.`,
      );
    case "action-object":
      return text(
        `${sourceText} 做动作时，常会带到 ${target}。按“动作 + 对象”一起记。`,
        `${sourceText} often connects with ${target}. Learn it as an action plus object pair.`,
      );
    case "state-action":
      return text(
        `${sourceText} 和 ${target} 一个像状态，一个像处理动作，放在一起更容易开口用。`,
        `${sourceText} and ${target} connect as a state and a related action, useful for speaking.`,
      );
    default:
      return text(
        `${sourceText} 和 ${target} 有真实用法上的关系，放在一起记更容易想起来。`,
        `${sourceText} and ${target} have a real usage connection, so learning them together makes recall easier.`,
      );
  }
}

function dedupeAssociations(associations: WordAssociation[], limit: number) {
  const seen = new Set<string>();
  const result: WordAssociation[] = [];
  for (const association of associations) {
    const normalized = normalizeDutch(association.dutch);
    const key = normalized;
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(association);
    if (result.length >= limit) break;
  }
  return result;
}

const suppressLooseGeneratedRelationsFor = (word: WordItem) =>
  word.dutch.trim().split(/\s+/).filter(Boolean).length > 1;

const isLooseGeneratedAssociation = (association: WordAssociation) =>
  looseGeneratedRelationTypes.has(association.type) && association.source !== "manual";

export function memoryAssociationsFor(selected: WordItem, words: WordItem[], limit = 8): WordAssociation[] {
  const shouldHideAdvancedTargets = selected.originalLevel !== "B1" && selected.originalLevel !== "B2";
  const hiddenAdvancedTargets = new Set(
    shouldHideAdvancedTargets
      ? words
          .filter((word) => word.originalLevel === "B1" || word.originalLevel === "B2")
          .map((word) => normalizeDutch(word.dutch))
      : [],
  );
  const associationWords = selected.originalLevel === "B1" || selected.originalLevel === "B2"
    ? words
    : words.filter((word) => word.originalLevel !== "B1" && word.originalLevel !== "B2");
  const wordByDutch = new Map(associationWords.map((word) => [normalizeDutch(word.dutch), word]));
  const generated = generateRelationsForWord(selected, associationWords, { pageContext: "word-link" })
    .map((relation) => {
      const match = relation.targetWordId
        ? associationWords.find((word) => word.id === relation.targetWordId)
        : wordByDutch.get(normalizeDutch(relation.targetText));
      const source: RelationSource | "extension" = (relation.isExtensionWord ?? relation.isExtensionTarget) ? "extension" : relation.relationSource;
      const association = {
        dutch: relation.targetText,
        wordId: match?.id,
        meaning: match?.meaning ?? relation.targetMeaning,
        targetExistsInVocabulary: relation.targetExistsInVocabulary ?? Boolean(match),
        isExtensionWord: relation.isExtensionWord ?? relation.isExtensionTarget,
        isExtensionTarget: relation.isExtensionTarget ?? relation.isExtensionWord,
        source,
        type: relation.relationType,
        kind: relationFallbackLabels[relation.relationType],
        reason: text(relation.reasonZh, relation.reasonEn),
      };
      return {
        ...association,
        reason: learnerReasonFor(selected, association),
      };
    });
  const suppressLooseGeneratedRelations = suppressLooseGeneratedRelationsFor(selected);
  const visibleAssociations = [...generated, ...phraseComponentAssociationsFor(selected, associationWords), ...manualLinksFor(selected, associationWords)]
    .filter((association) => !(suppressLooseGeneratedRelations && isLooseGeneratedAssociation(association)))
    .filter((association) => !hiddenAdvancedTargets.has(normalizeDutch(association.dutch)));
  return dedupeAssociations(visibleAssociations, limit);
}
