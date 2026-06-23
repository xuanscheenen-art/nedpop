"use client";

import {
  exampleStatusFor,
  type CreatorExampleSentence,
  type CreatorPhraseChunk,
  type CreatorWord,
} from "@/lib/creatorStore";
import { generateExamplesForWord, generatedExampleToExampleSentence } from "@/lib/exampleSentenceGenerator";
import { generateWordBubbleCompletionDraft } from "@/lib/wordBubbleCompletion";
import { meaningForUsableSentence } from "@/lib/vocabularySentences";
import type { ExampleSentence, PhraseChunk, WordBubbleCompletionDraft, WordItem } from "@/types/vocabulary";

export type CompletionChange = {
  field: string;
  label: string;
  action: "filled" | "added" | "merged";
};

export type CompletionResult = {
  word: CreatorWord;
  draft: WordBubbleCompletionDraft;
  changes: CompletionChange[];
};

export const isBlank = (value?: string) => !value?.trim();

export const isWeakText = (value?: string) =>
  isBlank(value) ||
  /放进一个真实短句|put it into a real sentence|links to|belongs to|没有特别自然|自动扩充词|需要人工补/i.test(value ?? "");

const completeMeaning = (dutch: string, meaning: { zh: string; en: string }) => {
  const known = meaningForUsableSentence(dutch);
  return {
    zh: isBlank(meaning.zh) ? known.zh : meaning.zh,
    en: isBlank(meaning.en) ? known.en : meaning.en,
  };
};

export const creatorWordToWordItem = (word: CreatorWord): WordItem => ({
  ...word,
  phraseChunks: word.phraseChunks.map((phrase) => phrase.dutch).filter(Boolean),
  exampleSentence: word.exampleSentences[0]
    ? {
        dutch: word.exampleSentences[0].dutch,
        meaning: word.exampleSentences[0].meaning,
      }
    : {
        dutch: word.dutch,
        meaning: word.meaning,
      },
});

export const phraseFromSuggestion = (word: CreatorWord, suggestion: PhraseChunk): CreatorPhraseChunk => ({
  id: `${word.id}-completion-phrase-${suggestion.dutch.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`,
  dutch: suggestion.dutch,
  meaning: suggestion.meaning,
  usageScene: suggestion.usageScene,
  audioText: suggestion.audioText,
  audioSrc: suggestion.audioSrc,
});

export const exampleFromSuggestion = (word: CreatorWord, suggestion: ExampleSentence): CreatorExampleSentence => ({
  id: `${word.id}-completion-example-${suggestion.dutch.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`,
  dutch: suggestion.dutch,
  meaning: completeMeaning(suggestion.dutch, suggestion.meaning),
  level: suggestion.level ?? word.level,
  type: suggestion.type ?? "scenario",
  targetWord: suggestion.targetWord ?? word.dutch,
  grammarFocus: suggestion.grammarFocus ?? "",
  scenarioTags: suggestion.scenarioTags ?? word.scenarioTags,
  audioText: suggestion.audioText ?? suggestion.dutch,
  audioSrc: suggestion.audioSrc,
  qualityStatus: completeMeaning(suggestion.dutch, suggestion.meaning).zh && completeMeaning(suggestion.dutch, suggestion.meaning).en ? "usable" : "needs-review",
});

export const exampleSuggestionsForWord = (word: CreatorWord): ExampleSentence[] =>
  generateExamplesForWord(creatorWordToWordItem(word), { existingExamples: word.exampleSentences })
    .filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim())
    .map(generatedExampleToExampleSentence);

export const completionDraftForWord = (word: CreatorWord): WordBubbleCompletionDraft => {
  const draft = generateWordBubbleCompletionDraft(creatorWordToWordItem(word));
  const suggestedExamples = exampleSuggestionsForWord(word);
  return suggestedExamples.length
    ? { ...draft, suggestedExamples, suggestedOutputSentence: undefined }
    : draft;
};

export const completionIssuesForWord = (word: CreatorWord) => {
  const issues: string[] = [];
  if (isWeakText(word.memoryHook.zh)) issues.push("缺记忆钩子");
  if (isWeakText(word.englishExplanation)) issues.push("缺英文解释");
  if (isWeakText(word.pronunciationHint)) issues.push("缺发音提示");
  if (word.article && isWeakText(word.articleReason)) issues.push("缺冠词理由");
  if (word.article && isWeakText(word.commonMistake)) issues.push("缺常见错误");
  if (!word.phraseChunks.length) issues.push("缺短语块");
  if (word.phraseChunks.some((phrase) => isBlank(phrase.meaning.zh) || isBlank(phrase.meaning.en))) issues.push("短语块缺翻译");
  if (exampleStatusFor(word) !== "complete") issues.push("例句缺失或不完整");
  if (word.exampleSentences.some((example) => isBlank(example.meaning.zh) || isBlank(example.meaning.en))) issues.push("例句缺翻译");
  if (isWeakText(word.levelReason.zh)) issues.push("缺等级理由");
  return issues;
};

const mergePhrase = (word: CreatorWord, phrases: CreatorPhraseChunk[], suggestion: PhraseChunk) => {
  const existingIndex = phrases.findIndex((phrase) => phrase.dutch.trim().toLowerCase() === suggestion.dutch.trim().toLowerCase());
  if (existingIndex === -1) {
    return {
      phrases: [...phrases, phraseFromSuggestion(word, suggestion)],
      changed: true,
      action: "added" as const,
    };
  }

  const existing = phrases[existingIndex];
  const merged: CreatorPhraseChunk = {
    ...existing,
    meaning: {
      zh: isBlank(existing.meaning.zh) ? suggestion.meaning.zh : existing.meaning.zh,
      en: isBlank(existing.meaning.en) ? suggestion.meaning.en : existing.meaning.en,
    },
    usageScene: {
      zh: isBlank(existing.usageScene.zh) ? suggestion.usageScene.zh : existing.usageScene.zh,
      en: isBlank(existing.usageScene.en) ? suggestion.usageScene.en : existing.usageScene.en,
    },
    audioText: isBlank(existing.audioText) ? suggestion.audioText : existing.audioText,
    audioSrc: existing.audioSrc ?? suggestion.audioSrc,
  };

  if (JSON.stringify(existing) === JSON.stringify(merged)) {
    return { phrases, changed: false, action: "merged" as const };
  }

  return {
    phrases: phrases.map((phrase, index) => (index === existingIndex ? merged : phrase)),
    changed: true,
    action: "merged" as const,
  };
};

const mergeExample = (word: CreatorWord, examples: CreatorExampleSentence[], suggestion: ExampleSentence) => {
  const existingIndex = examples.findIndex((example) => example.dutch.trim().toLowerCase() === suggestion.dutch.trim().toLowerCase());
  if (existingIndex === -1) {
    return {
      examples: [...examples, exampleFromSuggestion(word, suggestion)],
      changed: true,
      action: "added" as const,
    };
  }

  const existing = examples[existingIndex];
  const suggestionMeaning = completeMeaning(suggestion.dutch, suggestion.meaning);
  const mergedMeaning = {
    zh: isBlank(existing.meaning.zh) ? suggestionMeaning.zh : existing.meaning.zh,
    en: isBlank(existing.meaning.en) ? suggestionMeaning.en : existing.meaning.en,
  };
  const merged: CreatorExampleSentence = {
    ...existing,
    meaning: mergedMeaning,
    level: existing.level ?? suggestion.level ?? word.level,
    type: existing.type ?? suggestion.type ?? "scenario",
    targetWord: existing.targetWord || suggestion.targetWord || word.dutch,
    grammarFocus: existing.grammarFocus || suggestion.grammarFocus || "",
    scenarioTags: existing.scenarioTags.length ? existing.scenarioTags : suggestion.scenarioTags ?? word.scenarioTags,
    audioText: isBlank(existing.audioText) ? suggestion.audioText ?? suggestion.dutch : existing.audioText,
    audioSrc: existing.audioSrc ?? suggestion.audioSrc,
    qualityStatus: existing.qualityStatus === "reject"
      ? existing.qualityStatus
      : mergedMeaning.zh && mergedMeaning.en
        ? "usable"
        : existing.qualityStatus,
  };

  if (JSON.stringify(existing) === JSON.stringify(merged)) {
    return { examples, changed: false, action: "merged" as const };
  }

  return {
    examples: examples.map((example, index) => (index === existingIndex ? merged : example)),
    changed: true,
    action: "merged" as const,
  };
};

export const applyCompletionDraftToWord = (word: CreatorWord, draft: WordBubbleCompletionDraft): CompletionResult => {
  let next: CreatorWord = { ...word };
  const changes: CompletionChange[] = [];

  const fillText = <K extends keyof CreatorWord>(key: K, value: CreatorWord[K] | undefined, label: string) => {
    if (value === undefined || value === null) return;
    const current = next[key];
    if (typeof current === "string" && typeof value === "string" && isWeakText(current) && !isBlank(value)) {
      next = { ...next, [key]: value };
      changes.push({ field: String(key), label, action: "filled" });
    }
  };

  if (isWeakText(next.memoryHook.zh) && draft.suggestedMemoryHook) {
    next = { ...next, memoryHook: { ...next.memoryHook, zh: draft.suggestedMemoryHook } };
    changes.push({ field: "memoryHook.zh", label: "记忆钩子", action: "filled" });
  }
  fillText("englishExplanation", draft.suggestedEnglishExplanation, "英文解释");
  fillText("englishBridge", draft.suggestedEnglishBridge, "记忆提示");
  fillText("pronunciationHint", draft.suggestedPronunciationHint, "发音提示");
  fillText("articleReason", draft.suggestedArticleReason, "冠词理由");
  fillText("commonMistake", draft.suggestedCommonMistake, "常见错误");

  if (isWeakText(next.levelReason.zh) && draft.suggestedLevelReason) {
    next = { ...next, levelReason: draft.suggestedLevelReason };
    changes.push({ field: "levelReason", label: "等级理由", action: "filled" });
  }

  draft.suggestedPhraseChunks.forEach((suggestion) => {
    const result = mergePhrase(next, next.phraseChunks, suggestion);
    if (result.changed) {
      next = { ...next, phraseChunks: result.phrases };
      changes.push({ field: "phraseChunks", label: suggestion.dutch, action: result.action });
    }
  });

  draft.suggestedExamples.forEach((suggestion) => {
    const result = mergeExample(next, next.exampleSentences, suggestion);
    if (result.changed) {
      next = { ...next, exampleSentences: result.examples };
      changes.push({ field: "exampleSentences", label: suggestion.dutch, action: result.action });
    }
  });

  if (draft.suggestedOutputSentence) {
    const result = mergeExample(next, next.exampleSentences, draft.suggestedOutputSentence);
    if (result.changed) {
      next = { ...next, exampleSentences: result.examples };
      changes.push({ field: "exampleSentences", label: draft.suggestedOutputSentence.dutch, action: result.action });
    }
  }

  return { word: next, draft, changes };
};

export const completeMissingFieldsForWord = (word: CreatorWord): CompletionResult => {
  const draft = completionDraftForWord(word);
  return applyCompletionDraftToWord(word, draft);
};
