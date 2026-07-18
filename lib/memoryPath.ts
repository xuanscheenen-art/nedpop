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
    "word-breakdown": ["记忆钩子", "拆开看", "构词结果"],
    "compound-word": ["记忆钩子", "拆开看", "构词结果"],
    "english-bridge": ["记忆钩子", "英文桥梁", "差异提醒"],
    "fixed-expression": ["记忆钩子", "表达功能", "固定用法"],
    "meaning-contrast": ["记忆钩子", "词义对比", "差异提醒"],
    "word-formation": ["记忆钩子", "基础词", "构词规律"],
    "phrase-based": ["记忆钩子", "整块表达", "整块使用"],
    "sentence-based": ["记忆钩子", "结构接法", "我能说的一句"],
    "category-rule": ["记忆钩子", "类别规则", "区别提醒"],
    "no-strong-association": ["第一画面", "我能说的一句"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  const enLabels = {
    "word-breakdown": ["Memory hook", "Break it down", "Usage note"],
    "compound-word": ["Memory hook", "Break it down", "Usage note"],
    "english-bridge": ["Memory hook", "English bridge", "Difference note"],
    "fixed-expression": ["Memory hook", "Expression function", "Usage note"],
    "meaning-contrast": ["Memory hook", "Meaning contrast", "Difference note"],
    "word-formation": ["Memory hook", "Base word", "How it is formed"],
    "phrase-based": ["Memory hook", "Anchor in a chunk", "Usage anchor", "Use it for"],
    "sentence-based": ["Memory hook", "Usage anchor", "Use it for"],
    "category-rule": ["Memory hook", "Category rule", "Do not mix up"],
    "no-strong-association": ["First scene", "Speakable line"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  return language === "zh" ? labels[normalizedStrategy] : enLabels[normalizedStrategy];
};
