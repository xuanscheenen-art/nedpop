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
    "word-breakdown": ["趣味联想", "拆开看", "使用提醒"],
    "compound-word": ["趣味联想", "拆开看", "使用提醒"],
    "english-bridge": ["趣味联想", "英文桥梁", "差异提醒"],
    "fixed-expression": ["趣味联想", "表达功能", "使用提醒"],
    "meaning-contrast": ["趣味联想", "词义对比", "差异提醒"],
    "word-formation": ["趣味联想", "基础词", "词形怎么长出来"],
    "phrase-based": ["趣味联想", "落到词块", "能说一句", "使用场景"],
    "sentence-based": ["趣味联想", "能说一句", "使用场景"],
    "category-rule": ["趣味联想", "类别规则", "别混淆"],
    "no-strong-association": ["场景联想", "使用场景"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  const enLabels = {
    "word-breakdown": ["Memory hook", "Break it down", "Usage note"],
    "compound-word": ["Memory hook", "Break it down", "Usage note"],
    "english-bridge": ["Memory hook", "English bridge", "Difference note"],
    "fixed-expression": ["Memory hook", "Expression function", "Usage note"],
    "meaning-contrast": ["Memory hook", "Meaning contrast", "Difference note"],
    "word-formation": ["Memory hook", "Base word", "How it is formed"],
    "phrase-based": ["Memory hook", "Anchor in a chunk", "Say one line", "Use it for"],
    "sentence-based": ["Memory hook", "Say one line", "Use it for"],
    "category-rule": ["Memory hook", "Category rule", "Do not mix up"],
    "no-strong-association": ["Scene hook", "Use it for"],
  } satisfies Record<MemoryPathStrategy, string[]>;

  return language === "zh" ? labels[normalizedStrategy] : enLabels[normalizedStrategy];
};
