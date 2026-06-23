import { checkMemoryPathQuality } from "@/lib/checkMemoryPathQuality";
import { generateMemoryPath, type MemoryPathContext } from "@/lib/memoryPathEngine";
import { classifyMemoryPathWord } from "@/lib/memoryPathStrategies";
import type { MemoryPath, MemoryPathStrategy, MemoryPathWordType, WordItem } from "@/types/vocabulary";

export const wordTypeFor = (word: WordItem): MemoryPathWordType => classifyMemoryPathWord(word);

const legacyStrategy = (strategy: MemoryPathStrategy): MemoryPathStrategy =>
  strategy === "compound-word" ? "word-breakdown" : strategy;

export const validateMemoryPath = (path: MemoryPath, word?: WordItem) => {
  const checked = checkMemoryPathQuality(path, word);
  return checked.warnings;
};

export const memoryPathFor = (word: WordItem, context?: MemoryPathContext): MemoryPath => generateMemoryPath(word, context);

export const shouldShowPluralInWordHeader = (word: WordItem) =>
  wordTypeFor(word) !== "language-name" &&
  wordTypeFor(word) !== "country-name" &&
  Boolean(word.plural);

export const stepLabelsForStrategy = (strategy: MemoryPathStrategy, language: "zh" | "en") => {
  const normalizedStrategy = legacyStrategy(strategy);
  const labels = {
    "word-breakdown": ["拆开看", "意思怎么合起来", "使用提醒"],
    "compound-word": ["拆开看", "意思怎么合起来", "使用提醒"],
    "english-bridge": ["英文桥梁", "差异提醒", "使用提醒"],
    "fixed-expression": ["表达功能", "记忆重点", "使用提醒"],
    "meaning-contrast": ["词义对比", "差异提醒", "使用提醒"],
    "word-formation": ["基础词", "词形怎么长出来", "使用提醒"],
    "phrase-based": ["记忆入口", "为什么这样记", "使用提醒"],
    "sentence-based": ["句子功能", "使用提醒"],
    "category-rule": ["先看类别", "类别规则", "别混淆"],
    "no-strong-association": ["不硬编联想", "使用提醒"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  const enLabels = {
    "word-breakdown": ["Break it down", "How the meaning combines", "Usage note"],
    "compound-word": ["Break it down", "How the meaning combines", "Usage note"],
    "english-bridge": ["English bridge", "Difference note", "Usage note"],
    "fixed-expression": ["Expression function", "Memory focus", "Usage note"],
    "meaning-contrast": ["Meaning contrast", "Difference note", "Usage note"],
    "word-formation": ["Base word", "How it is formed", "Usage note"],
    "phrase-based": ["Memory entry", "Why this helps", "Usage note"],
    "sentence-based": ["Sentence role", "Usage note"],
    "category-rule": ["See the category", "Category rule", "Do not mix up"],
    "no-strong-association": ["Do not force it", "Usage note"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  return language === "zh" ? labels[normalizedStrategy] : enLabels[normalizedStrategy];
};
