"use client";

import { validationWarningsForExample, type CreatorExampleSentence, type CreatorPhraseChunk, type CreatorWord } from "@/lib/creatorStore";
import { completionIssuesForWord, creatorWordToWordItem, isBlank, isWeakText } from "@/lib/creatorCompletionPipeline";
import { checkGeneratedExample } from "@/lib/checkGeneratedExample";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import type { GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { isKnownBadLearnerLine } from "@/lib/exampleQualityRules";
import { wordTypeFor } from "@/lib/memoryPath";

export type ContentQualitySeverity = "high" | "medium" | "low";

export type ContentQualityCategory =
  | "missing-meaning"
  | "missing-example"
  | "bad-example"
  | "repetitive-template"
  | "scenario-mismatch"
  | "wrong-word-type-template"
  | "language-name-plural-error"
  | "too-hard-for-level"
  | "weak-memory"
  | "phrase-used-as-bubble"
  | "weak-relation"
  | "wrong-relation-type"
  | "random-same-day-relation"
  | "string-similarity-only"
  | "missing-reason"
  | "phrase-chunk"
  | "verb-form"
  | "level-review"
  | "content-fix";

export type ContentQualityIssue = {
  id: string;
  wordId: string;
  dutch: string;
  level: CreatorWord["level"];
  category: ContentQualityCategory;
  severity: ContentQualitySeverity;
  title: string;
  detail: string;
  fixSuggestion: string;
};

const oneWordSentence = (sentence: string) => {
  const normalized = sentence.trim().replace(/[.!?]+$/, "");
  return normalized.split(/\s+/).filter(Boolean).length <= 1;
};

const a0FixedOutputWords = new Set([
  "hallo",
  "dag",
  "dank je",
  "bedankt",
  "tot ziens",
  "ja",
  "nee",
  "alsjeblieft",
  "goedemorgen",
  "goedemiddag",
  "goedenavond",
]);

const isAllowedShortA0Example = (word: CreatorWord, sentence: string) => {
  const normalizedWord = word.dutch.trim().toLowerCase();
  const normalizedSentence = sentence.trim().replace(/[.!?]+$/, "").toLowerCase();
  const wordItem = creatorWordToWordItem(word);
  const type = wordTypeFor(wordItem);
  return (
    word.level === "A0" &&
    (type === "phrase" ||
      word.scenarioTags.includes("greeting") ||
      a0FixedOutputWords.has(normalizedWord) ||
      a0FixedOutputWords.has(normalizedSentence))
  );
};

const hasPlaceholderMeaning = (text: string) =>
  /需要人工|placeholder|真实场景|这个词|该句|这句/i.test(text);

const suspiciousDutchSentence = (sentence: string) =>
  isKnownBadLearnerLine(sentence) ||
  [
    /^Ik zie de minuut\.$/i,
    /^Ik zeg heet\.$/i,
    /^Heb\.$/i,
    /^Wanneer\.$/i,
    /^Kijken\.$/i,
  ].some((pattern) => pattern.test(sentence.trim()));

const generatedExampleForCheck = (word: CreatorWord, example: CreatorExampleSentence, index: number): GeneratedExample => ({
  id: `${word.id}-quality-check-${index}`,
  wordId: word.id,
  targetWord: example.targetWord || word.dutch,
  dutch: example.dutch,
  meaningZh: example.meaning.zh,
  meaningEn: example.meaning.en,
  level: example.level ?? word.level,
  type: example.type ?? "scenario",
  scenarioTags: example.scenarioTags.length ? example.scenarioTags : word.scenarioTags,
  grammarFocus: example.grammarFocus,
  audioText: example.audioText,
  confidence: example.qualityStatus === "usable" ? "high" : "medium",
  needsHumanReview: example.qualityStatus !== "usable",
});

const memoryBubbleIssuesFor = (word: CreatorWord): ContentQualityIssue[] => {
  const issues: ContentQualityIssue[] = [];
  (word.memoryLinks ?? []).forEach((link, index) => {
    const target = link.dutch.trim();
    const reason = `${link.explanation.zh} ${link.explanation.en}`.trim();
    const base = {
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
    };

    if (!reason) {
      issues.push({
        ...base,
        id: `${word.id}-bubble-${index}-missing-reason`,
        category: "missing-reason",
        severity: "high",
        title: "联想泡泡缺少理由",
        detail: target || "空目标",
        fixSuggestion: "补一句具体说明：两个词是什么关系、为什么能帮助记忆。",
      });
    }

    if (/^(de|het|een)\s+/i.test(target) || target.split(/\s+/).filter(Boolean).length > 1 || /[.!?]$/.test(target)) {
      issues.push({
        ...base,
        id: `${word.id}-bubble-${index}-phrase-used-as-bubble`,
        category: "phrase-used-as-bubble",
        severity: "high",
        title: "短语或句子被当成记忆泡泡",
        detail: target,
        fixSuggestion: "记忆泡泡只能填单词；短语放到 Phrase Chunks，句子放到 Example Sentences。",
      });
    }

    if (["phrase-collocation", "usage-chunk", "article-family", "plural-family", "verb-noun-pair"].includes(link.type)) {
      issues.push({
        ...base,
        id: `${word.id}-bubble-${index}-wrong-type`,
        category: "wrong-relation-type",
        severity: "medium",
        title: "联想泡泡关系类型已不适合前台",
        detail: `${target} · ${link.type}`,
        fixSuggestion: "改成 word-family、scenario-word、action-object、state-action、category-member 等词对关系。",
      });
    }

    if (link.strength === "weak" || /相关词|可以一起记|适合一起记|same day|same level|同一天|同等级/i.test(reason)) {
      issues.push({
        ...base,
        id: `${word.id}-bubble-${index}-weak-relation`,
        category: /same day|same level|同一天|同等级/i.test(reason) ? "random-same-day-relation" : "weak-relation",
        severity: "medium",
        title: "联想泡泡关系偏弱",
        detail: `${target} · ${reason || "无理由"}`,
        fixSuggestion: "只保留能说明词族、复合词、同义反义、类别、场景、动作或状态关系的词。",
      });
    }

    if (/looks similar|string similar|长得像|拼写相似|same letters/i.test(reason)) {
      issues.push({
        ...base,
        id: `${word.id}-bubble-${index}-string-only`,
        category: "string-similarity-only",
        severity: "high",
        title: "疑似只靠拼写相似生成关系",
        detail: `${target} · ${reason}`,
        fixSuggestion: "拼写相似不能单独作为同词根/同家族关系；请改为词典确认的关系或隐藏。",
      });
    }
  });
  return issues;
};

const categoryForGeneratedIssue = (issue: string): ContentQualityCategory => {
  if (issue === "language-name-plural-error") return "language-name-plural-error";
  if (issue === "scenario-mismatch") return "scenario-mismatch";
  if (issue.includes("too-hard") || issue.includes("too-formal") || issue.includes("too-abstract") || issue.includes("too-long")) return "too-hard-for-level";
  if (issue.includes("target-word") || issue.includes("known-bad") || issue.includes("wrong-article")) return "wrong-word-type-template";
  if (issue.includes("missing") && issue.includes("meaning")) return "missing-meaning";
  return "bad-example";
};

const phraseIssueFor = (word: CreatorWord, phrase: CreatorPhraseChunk, index: number): ContentQualityIssue[] => {
  const issues: ContentQualityIssue[] = [];
  if (isBlank(phrase.dutch)) {
    issues.push({
      id: `${word.id}-phrase-${index}-missing-dutch`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "phrase-chunk",
      severity: "high",
      title: "短语块没有 Dutch",
      detail: "短语块空着，前台只会显示空壳。",
      fixSuggestion: "补一个真实高频搭配；如果没有好搭配，就删掉这条。",
    });
  }
  if (!isBlank(phrase.dutch) && phrase.dutch.trim().toLowerCase() === word.dutch.trim().toLowerCase()) {
    issues.push({
      id: `${word.id}-phrase-${index}-isolated-word`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "phrase-chunk",
      severity: "low",
      title: "短语块只是单词本身",
      detail: `“${phrase.dutch}”不是短语块。`,
      fixSuggestion: "换成可直接使用的搭配，比如动词短句、冠词+名词、固定表达。",
    });
  }
  if (isBlank(phrase.meaning.zh) || isBlank(phrase.meaning.en)) {
    issues.push({
      id: `${word.id}-phrase-${index}-missing-meaning`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "missing-meaning",
      severity: "high",
      title: "短语块缺中文/英文释义",
      detail: phrase.dutch || word.dutch,
      fixSuggestion: "补齐 zh/en，否则学习者不知道这个短语怎么用。",
    });
  }
  return issues;
};

const exampleIssueFor = (word: CreatorWord, example: CreatorExampleSentence, index: number): ContentQualityIssue[] => {
  const issues: ContentQualityIssue[] = [];
  validationWarningsForExample(example).forEach((warning) => {
    issues.push({
      id: `${word.id}-example-${index}-${warning}`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: warning.includes("meaning") ? "missing-meaning" : "bad-example",
      severity: warning.includes("meaning") || warning.includes("audioText") ? "high" : "medium",
      title: warning,
      detail: example.dutch || "空例句",
      fixSuggestion: "在词卡编辑页补齐或替换这条例句。",
    });
  });

  if (oneWordSentence(example.dutch) && !isAllowedShortA0Example(word, example.dutch)) {
    issues.push({
      id: `${word.id}-example-${index}-one-word`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "bad-example",
      severity: "low",
      title: "例句只有一个词",
      detail: example.dutch,
      fixSuggestion: "例句必须能展示用法；单词本身不算例句。",
    });
  }
  if (hasPlaceholderMeaning(example.meaning.zh) || hasPlaceholderMeaning(example.meaning.en)) {
    issues.push({
      id: `${word.id}-example-${index}-placeholder-meaning`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "missing-meaning",
      severity: "high",
      title: "例句释义像占位文本",
      detail: `${example.dutch} / ${example.meaning.zh}`,
      fixSuggestion: "改成真实中文/英文翻译。",
    });
  }
  if (suspiciousDutchSentence(example.dutch)) {
    issues.push({
      id: `${word.id}-example-${index}-suspicious`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "bad-example",
      severity: "high",
      title: "疑似机械生成坏句子",
      detail: example.dutch,
      fixSuggestion: "不要套模板，按词义、词性和场景重写。",
    });
  }
  const checked = checkGeneratedExample(generatedExampleForCheck(word, example, index), creatorWordToWordItem(word));
  checked.qualityIssues?.forEach((qualityIssue) => {
    if (qualityIssue.includes("missing") && qualityIssue.includes("meaning")) return;
    issues.push({
      id: `${word.id}-example-${index}-${qualityIssue}`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: categoryForGeneratedIssue(qualityIssue),
      severity:
        qualityIssue.includes("known-bad") ||
        qualityIssue.includes("wrong-article") ||
        qualityIssue.includes("language-name-plural-error") ||
        qualityIssue.includes("missing-audio")
          ? "high"
          : checked.confidence === "low"
            ? "medium"
            : "low",
      title: qualityIssue,
      detail: example.dutch || "空例句",
      fixSuggestion: "用例句生成器按词性、搭配、场景和等级重新生成候选。",
    });
  });
  return issues;
};

const verbFormIssuesFor = (word: CreatorWord): ContentQualityIssue[] => {
  const wordItem = creatorWordToWordItem(word);
  const type = wordTypeFor(wordItem);
  if (type !== "verb") return [];

  const usage = verbUsageFor(wordItem);

  const issues: ContentQualityIssue[] = [];
  if (!usage) {
    issues.push({
      id: `${word.id}-verb-no-usage`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "verb-form",
      severity: "medium",
      title: "动词缺少变位说明",
      detail: "动词词卡应该显示完整原形和 ik/jij/wij 用法。",
      fixSuggestion: "补 verbUsage 或在词卡里说明原形、ik、jij、wij 三格。",
    });
    return issues;
  }

  const lowerDutch = word.dutch.toLowerCase();
  const forms = [
    usage.ikForm.replace(/^ik\s+/i, "").split("/")[0].trim(),
    usage.jijForm.replace(/^jij\s+/i, "").split("/")[0].trim(),
    usage.wijForm.replace(/^wij\s+/i, "").split("/")[0].trim(),
  ].map((item) => item.toLowerCase());

  if (forms.includes(lowerDutch) && lowerDutch !== usage.infinitive.toLowerCase()) {
    issues.push({
      id: `${word.id}-verb-form-not-lemma`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "verb-form",
      severity: "medium",
      title: "疑似把动词变位当成单独词",
      detail: `${word.dutch} 是 ${usage.infinitive} 的句中形式之一。`,
      fixSuggestion: `词卡主词建议用 ${usage.infinitive}，把 ${word.dutch} 放在动词用法区。`,
    });
  }
  return issues;
};

export const qualityIssuesForWord = (word: CreatorWord): ContentQualityIssue[] => {
  const issues: ContentQualityIssue[] = [];
  const wordType = wordTypeFor(creatorWordToWordItem(word));

  if (wordType === "noun" && !word.article) {
    issues.push({
      id: `${word.id}-missing-article`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "content-fix",
      severity: "high",
      title: "名词缺 de/het",
      detail: "名词词卡需要显示 de/het，避免前台缺关键信息。",
      fixSuggestion: "补 de 或 het；如果这个词不是名词，请先修正词性来源。",
    });
  }

  completionIssuesForWord(word).forEach((issue, index) => {
    const isMeaningIssue = issue.includes("中文") || issue.includes("英文") || issue.includes("翻译");
    const isExampleIssue = issue.includes("例句");
    issues.push({
      id: `${word.id}-completion-${index}`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: issue.includes("例句缺失") ? "missing-example" : issue.includes("例句") || issue.includes("翻译") ? "missing-meaning" : "content-fix",
      severity: isMeaningIssue ? "high" : isExampleIssue ? "medium" : "low",
      title: issue,
      detail: "词卡基础内容还不完整。",
      fixSuggestion: "用一键补齐生成可用内容，或直接在词卡里编辑。",
    });
  });

  if (isWeakText(word.memoryHook.zh) || isWeakText(word.englishExplanation)) {
    issues.push({
      id: `${word.id}-weak-memory`,
      wordId: word.id,
      dutch: word.dutch,
      level: word.level,
      category: "weak-memory",
      severity: "low",
      title: "记忆路径太弱或太机械",
      detail: word.memoryHook.zh || word.englishExplanation || "空",
      fixSuggestion: "按词性选择：拆词、同词根、同家族、短语搭配、句子功能或不硬编联想。",
    });
  }

  word.phraseChunks.forEach((phrase, index) => issues.push(...phraseIssueFor(word, phrase, index)));
  word.exampleSentences.forEach((example, index) => issues.push(...exampleIssueFor(word, example, index)));
  issues.push(...memoryBubbleIssuesFor(word));
  issues.push(...verbFormIssuesFor(word));

  const unique = new Map<string, ContentQualityIssue>();
  issues.forEach((issue) => unique.set(issue.id, issue));
  return Array.from(unique.values());
};

export const qualityIssuesForWords = (words: CreatorWord[]) => words.flatMap(qualityIssuesForWord);

export const qualitySummaryForWords = (words: CreatorWord[]) => {
  const issues = qualityIssuesForWords(words);
  return {
    totalIssues: issues.length,
    high: issues.filter((issue) => issue.severity === "high").length,
    medium: issues.filter((issue) => issue.severity === "medium").length,
    low: issues.filter((issue) => issue.severity === "low").length,
    affectedWords: new Set(issues.map((issue) => issue.wordId)).size,
  };
};
