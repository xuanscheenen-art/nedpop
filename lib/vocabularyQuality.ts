import { verbUsageFor } from "@/lib/dutchVerbForms";
import { generateExamplesForWord } from "@/lib/exampleSentenceGenerator";
import { memoryAssociationsFor } from "@/lib/wordAssociations";
import type { WordItem } from "@/types/vocabulary";

export type VocabularyQualityIssue = {
  wordId: string;
  dutch: string;
  severity: "error" | "warning";
  code:
    | "placeholder-meaning"
    | "missing-sentence-meaning"
    | "bare-word-sentence"
    | "missing-association"
    | "suspicious-verb-card"
    | "weak-generic-sentence"
    | "weak-memory-hook"
    | "missing-phrase-chunk"
    | "placeholder-phrase-chunk"
    | "wrong-article"
    | "wrong-plural-long-vowel"
    | "language-name-plural-error"
    | "verb-form-error"
    | "generated-low-confidence";
  message: string;
};

const knownNonVerbEnWords = new Set([
  "schoenen",
  "ouders",
  "kinderen",
  "boodschappen",
  "kosten",
  "gegevens",
  "papieren",
]);

const safeStandaloneWords = new Set(["hallo", "dag", "ja", "nee", "sorry", "bedankt", "alsjeblieft", "alstublieft", "dank je", "dank u", "tot ziens", "goedemorgen", "goedenavond"]);

function isBareWordSentence(word: WordItem, sentence: string) {
  const bare = `${word.dutch.charAt(0).toUpperCase()}${word.dutch.slice(1)}.`;
  return sentence === bare && !safeStandaloneWords.has(word.dutch.toLowerCase());
}

function isWeakGenericSentence(word: WordItem, sentence: string) {
  const escaped = word.dutch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [
    new RegExp(`^Dit is (de|het|een) ${escaped}\\.$`, "i"),
    new RegExp(`^Ik zie (de|het) ${escaped}\\.$`, "i"),
    new RegExp(`^Ik leer ${escaped}\\.$`, "i"),
    new RegExp(`^Ik zeg ${escaped}\\.$`, "i"),
    new RegExp(`^Ik gebruik (de|het) ${escaped}\\.$`, "i"),
    new RegExp(`^Ik heb (de|het|een) ${escaped} nodig\\.$`, "i"),
    new RegExp(`^Ik heb een vraag over (de|het) ${escaped}\\.$`, "i"),
    new RegExp(`^Dat is ${escaped}\\.$`, "i"),
  ].some((pattern) => pattern.test(sentence.trim()));
}

function hasWrongArticle(word: WordItem, sentence: string) {
  if (!word.article) return false;
  const wrong = word.article === "het" ? "de" : "het";
  const escaped = word.dutch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${wrong}\\s+${escaped}\\b`, "i").test(sentence);
}

function hasVerbFormError(sentence: string) {
  return /^Ik\s+(werken|zijn|hebben|kunnen|willen|moeten|gaan|komen|wonen|leren|kijken|helpen|begrijpen|schrijven)\b/i.test(sentence.trim());
}

function hasLongVowelPluralError(word: WordItem) {
  const dutch = word.dutch.toLowerCase();
  const plural = word.plural?.toLowerCase();
  if (!plural) return false;
  if (dutch.endsWith("eem") && plural.endsWith("eemen")) return true;
  if (/(aa|ee|oo|uu)[bcdfghjklmnpqrstvwxz]$/.test(dutch)) {
    const expected = `${dutch.replace(/(aa|ee|oo|uu)([bcdfghjklmnpqrstvwxz])$/, (_, vowel: string, consonant: string) => `${vowel[0]}${consonant}`)}en`;
    return plural === `${dutch}en` && plural !== expected;
  }
  return false;
}

function isWeakMemoryHook(word: WordItem) {
  const text = `${word.memoryHook.zh} ${word.memoryHook.en} ${word.englishBridge ?? ""}`;
  return /等级理由|level reason|belongs to|links to|自动扩充|先放进短语|真实场景句|Do not memorize .* alone|Connect .* to the/i.test(text);
}

function hasOnlyGeneratedSource(word: WordItem) {
  return word.sourceTags.length === 1 && word.sourceTags[0] === "generated";
}

export function validateVocabularyQuality(words: WordItem[]) {
  const issues: VocabularyQualityIssue[] = [];

  words.forEach((word) => {
    const generatedExample = generateExamplesForWord(word).find((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim());
    const effectiveSentence = generatedExample?.dutch ?? word.exampleSentence.dutch;
    const effectiveMeaning = generatedExample
      ? { zh: generatedExample.meaningZh, en: generatedExample.meaningEn }
      : word.exampleSentence.meaning;

    if (word.meaning.zh.includes("词：") || word.meaning.en.includes(" word: ")) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "placeholder-meaning",
        message: "Meaning still looks generated instead of learner-facing.",
      });
    }

    const sentence = effectiveSentence;
    if (isBareWordSentence(word, sentence)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "bare-word-sentence",
        message: "Primary sentence is only the bare word, not a usable Dutch sentence.",
      });
    }

    if (sentence && (!effectiveMeaning.zh.trim() || !effectiveMeaning.en.trim())) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "missing-sentence-meaning",
        message: "Example sentence is missing Chinese or English meaning.",
      });
    }

    if (isWeakGenericSentence(word, sentence)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "weak-generic-sentence",
        message: "Primary sentence is a generic template instead of a useful scene sentence.",
      });
    }

    if (hasWrongArticle(word, sentence)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "wrong-article",
        message: "Example sentence appears to use the wrong de/het article.",
      });
    }

    if (hasLongVowelPluralError(word)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "wrong-plural-long-vowel",
        message: "Plural keeps a doubled long vowel before -en; check forms like probleem → problemen, vraag → vragen.",
      });
    }

    if (word.dutch.toLowerCase() === "engels" && /\bengelsen\b/i.test(sentence)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "language-name-plural-error",
        message: "Engelsen should not be used as the plural path for the language word Engels.",
      });
    }

    if (hasVerbFormError(sentence)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "verb-form-error",
        message: "Example uses an infinitive after ik instead of a conjugated verb form.",
      });
    }

    if (isWeakMemoryHook(word)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "weak-memory-hook",
        message: "Memory hook looks generic or like an audit reason, not a learner-facing association.",
      });
    }

    if (!word.phraseChunks.some((chunk) => chunk.trim() && chunk.trim().toLowerCase() !== word.dutch.toLowerCase())) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "missing-phrase-chunk",
        message: "Word has no useful phrase chunk beyond the bare word.",
      });
    }

    word.phraseChunks.forEach((chunk) => {
      if (/词：|word:|自动扩充|generated expansion|placeholder|manual/i.test(chunk)) {
        issues.push({
          wordId: word.id,
          dutch: word.dutch,
          severity: "warning",
          code: "placeholder-phrase-chunk",
          message: "Phrase chunk contains placeholder/internal text.",
        });
      }
    });

    if (memoryAssociationsFor(word, words, 1).length === 0) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "missing-association",
        message: "No memory association found from curated links, semantic groups, or safe form links.",
      });
    }

    if (knownNonVerbEnWords.has(word.dutch.toLowerCase()) && verbUsageFor(word)) {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "error",
        code: "suspicious-verb-card",
        message: "Known noun/plural is being treated as a verb.",
      });
    }

    if (hasOnlyGeneratedSource(word) && word.levelConfidence === "low") {
      issues.push({
        wordId: word.id,
        dutch: word.dutch,
        severity: "warning",
        code: "generated-low-confidence",
        message: "Word is generated-only with low confidence and should stay out of learner packs until reviewed.",
      });
    }
  });

  return issues;
}

export function vocabularyQualitySummary(words: WordItem[]) {
  const issues = validateVocabularyQuality(words);
  return {
    totalIssues: issues.length,
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    byCode: issues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.code] = (acc[issue.code] ?? 0) + 1;
      return acc;
    }, {}),
    issues,
  };
}
