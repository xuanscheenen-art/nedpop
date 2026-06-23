import { memoryAssociationsFor, type WordAssociation } from "@/lib/wordAssociations";
import type { MemoryLink, MemoryLinkType, WordItem } from "@/types/vocabulary";

const normalizeDutch = (value: string) => value.trim().toLowerCase().replace(/[.!?]+$/g, "");

export const memoryLinkTypeFromAssociation = (association: WordAssociation): MemoryLinkType => {
  const type = association.type;
  if (
    type === "compound-part" ||
    type === "compound-parent" ||
    type === "compound-family" ||
    type === "part-related" ||
    type === "verb-form" ||
    type === "verb-noun-pair" ||
    type === "synonym" ||
    type === "opposite" ||
    type === "time-contrast" ||
    type === "time-category" ||
    type === "comparative-superlative" ||
    type === "category-member" ||
    type === "scenario-word" ||
    type === "action-object" ||
    type === "state-action" ||
    type === "confusion-pair"
  ) {
    return type;
  }
  if (type === "word-family") return "word-family";
  if (type === "english-bridge") return "english-bridge";

  const kind = `${association.kind.zh} ${association.kind.en}`.toLowerCase();
  if (kind.includes("复合") || kind.includes("compound")) return "compound-part";
  if (kind.includes("同义") || kind.includes("synonym")) return "synonym";
  if (kind.includes("反义") || kind.includes("antonym") || kind.includes("opposite")) return "opposite";
  if (kind.includes("英文") || kind.includes("english")) return "similar";
  if (kind.includes("词块") || kind.includes("搭配") || kind.includes("chunk") || kind.includes("collocation")) return "phrase-collocation";
  if (kind.includes("场景") || kind.includes("scene")) return "scenario-neighbor";
  if (kind.includes("动词形式") || kind.includes("verb form")) return "verb-form";
  if (kind.includes("派生") || kind.includes("动词/名词") || kind.includes("derivation")) return "verb-noun-pair";
  if (kind.includes("类别") || kind.includes("category")) return "category-member";
  if (kind.includes("易混") || kind.includes("confusion")) return "confusion-pair";
  if (kind.includes("冠词") || kind.includes("de/het") || kind.includes("article")) return "article-family";
  if (kind.includes("复数") || kind.includes("plural")) return "plural-family";
  if (kind.includes("数字") || kind.includes("number")) return "number-family";
  if (kind.includes("对比") || kind.includes("contrast") || kind.includes("similar")) return "similar";
  return "same-family";
};

export const associationToMemoryLink = (association: WordAssociation): MemoryLink => ({
  dutch: association.dutch,
  type: memoryLinkTypeFromAssociation(association),
  explanation: association.reason,
});

export const isWeakMemoryLink = (link: MemoryLink) => {
  const text = `${link.explanation.zh} ${link.explanation.en}`.trim();
  return (
    !link.dutch.trim() ||
    /^(looks like|means|close to|same as|related to)\b/i.test(link.dutch.trim()) ||
    /^(de|het|een)\s+/i.test(link.dutch.trim()) ||
    /[.!?]$/.test(link.dutch.trim()) ||
    link.dutch.trim().split(/\s+/).length > 1 ||
    !text ||
    /内容后台设置|creator-set|适合放在同一个记忆泡泡|belongs in the same memory bubble|请补充|add why|和当前词一起记|learn with the current word|礼貌表达词组|按对话来回一起记|看病场景词组|按症状、医生、药房一起记/i.test(text)
  );
};

export const mergeMemoryLinks = (existing: MemoryLink[] = [], generated: MemoryLink[] = []) => {
  const seen = new Set<string>();
  const merged: MemoryLink[] = [];

  for (const link of existing) {
    if (isWeakMemoryLink(link)) continue;
    const key = normalizeDutch(link.dutch);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...link, dutch: link.dutch.trim() });
  }

  for (const link of generated) {
    const key = normalizeDutch(link.dutch);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...link, dutch: link.dutch.trim() });
  }

  return merged;
};

export const generateMemoryLinksForWord = (word: WordItem, allWords: WordItem[], limit = 8) =>
  memoryAssociationsFor(word, allWords, limit).map(associationToMemoryLink);

export const shouldAutoFillMemoryLinks = (links: MemoryLink[] | undefined) =>
  !links?.length || links.some(isWeakMemoryLink);
