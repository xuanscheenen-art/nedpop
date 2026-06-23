import { relationLexicons } from "@/data/relationLexicons";
import { inferWordType, infinitiveForWord, type WordType } from "@/lib/exampleTemplates";
import type { WordItem } from "@/types/vocabulary";

export type WordAnalysis = {
  word: WordItem;
  wordType: WordType;
  baseForm: string;
  normalizedForm: string;
  article?: "de" | "het";
  plural?: string;
  scenarioTags: string[];
  categoryTags: string[];
  possibleCompoundParts: string[];
  derivationHints: string[];
};

const norm = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^(de|het|een)\s+/i, "")
    .replace(/[.!?]+$/g, "");

const categoryTagByScenario: Record<string, string> = {
  appointment: "gemeente",
  bill: "payment",
  classroom: "work",
  complaint: "complaint",
  directions: "transport",
  family: "family",
  food: "food-drink",
  email: "email",
  form: "form",
  gemeente: "gemeente",
  health: "health",
  housing: "housing",
  identity: "personal-info",
  countries: "countries",
  country: "countries",
  language: "language",
  insurance: "payment",
  languages: "language",
  money: "payment",
  numbers: "numbers",
  payment: "payment",
  "personal-info": "personal-info",
  phone: "contact",
  "phone-call": "contact",
  shopping: "shopping",
  "sick-leave": "sick-leave",
  supermarket: "shopping",
  time: "time",
  transport: "transport",
  work: "work",
};

const derivationAffixes = ["lijk", "heid", "ing", "er", "aar", "baar", "ge-", "ver-", "ont-", "be-"];

function compoundPartsFromLexicon(normalized: string) {
  return relationLexicons.compoundParts[normalized] ?? [];
}

function compoundPartsFromVocabulary(normalized: string, allWords: WordItem[]) {
  const known = new Set([
    ...allWords.map((word) => norm(word.dutch)),
    ...relationLexicons.knownMorphemes.map(norm),
  ]);
  const parts: string[] = [];
  for (let index = 3; index <= normalized.length - 3; index += 1) {
    const left = normalized.slice(0, index);
    const right = normalized.slice(index);
    if (known.has(left) && known.has(right)) {
      parts.push(left, right);
      break;
    }
  }
  return parts;
}

function categoryTagsFor(normalized: string, scenarioTags: string[]) {
  const tags = new Set<string>();
  scenarioTags.forEach((tag) => {
    const mapped = categoryTagByScenario[tag] ?? categoryTagByScenario[tag.toLowerCase()];
    if (mapped) tags.add(mapped);
  });
  relationLexicons.categories.forEach((category) => {
    if (category.heads.map(norm).includes(normalized) || category.members.map(norm).includes(normalized)) {
      category.tags.forEach((tag) => tags.add(tag));
      tags.add(category.id);
    }
  });
  return Array.from(tags);
}

function derivationHintsFor(normalized: string) {
  return derivationAffixes.filter((affix) =>
    affix.endsWith("-")
      ? normalized.startsWith(affix.replace("-", ""))
      : normalized.endsWith(affix),
  );
}

export function analyzeWord(word: WordItem, allWords: WordItem[]): WordAnalysis {
  const normalizedForm = norm(word.dutch);
  const wordType = inferWordType(word);
  return {
    word,
    wordType,
    baseForm: wordType === "verb" ? infinitiveForWord(word) ?? normalizedForm : normalizedForm,
    normalizedForm,
    article: word.article,
    plural: word.plural,
    scenarioTags: word.scenarioTags,
    categoryTags: categoryTagsFor(normalizedForm, word.scenarioTags),
    possibleCompoundParts: Array.from(new Set([
      ...compoundPartsFromLexicon(normalizedForm),
      ...compoundPartsFromVocabulary(normalizedForm, allWords),
    ])),
    derivationHints: derivationHintsFor(normalizedForm),
  };
}

export const normalizeWordText = norm;
