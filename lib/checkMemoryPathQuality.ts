import { classifyMemoryPathWord } from "@/lib/memoryPathStrategies";
import type { MemoryPath, WordItem } from "@/types/vocabulary";

export type MemoryPathQualityIssue =
  | "missing-memory-path"
  | "generic-memory-path"
  | "wrong-strategy"
  | "fake-breakdown"
  | "weak-english-bridge"
  | "forced-homophone"
  | "missing-output-sentence"
  | "missing-usage-scenario"
  | "missing-useful-phrase"
  | "category-rule-error"
  | "abstract-chinese-explanation";

export type MemoryPathQualityResult = {
  issues: MemoryPathQualityIssue[];
  confidence: "high" | "medium" | "low";
  needsHumanReview: boolean;
  warnings: {
    zh: string;
    en: string;
  }[];
};

const genericFillerPattern =
  /这个词建议通过短语和例句记|建议通过短语和例句记|放进一个真实短句|放进短语和例句|这个词最好通过常用搭配记|先背能直接用的词块|贴在|小标签|一看到这块|落回荷兰语|场景卡|这种真实用法|暂时没有强|put it into a real sentence|common chunks and real sentences|usable phrases and sentences|label attached|scene card|generic|placeholder|manual review|missing memory|missing path|creator/i;

const forcedSoundPattern = /谐音|听起来像|sounds like|homophone/i;
const abstractChinesePattern = /场景里记|整块记|常用搭配|真实句子/i;

const textFor = (path?: MemoryPath) =>
  path
    ? [
        path.titleZh,
        path.titleEn,
        path.explanationZh,
        path.explanationEn,
        path.memoryHookZh,
        path.memoryHookEn,
        path.usageAnchorZh,
        path.usageAnchorEn,
        path.warningZh,
        path.warningEn,
        ...(path.steps ?? []).flatMap((step) => [step.contentZh, step.contentEn, step.dutchExample ?? ""]),
      ].filter(Boolean).join(" ")
    : "";

const teachingTextFor = (path?: MemoryPath) =>
  path
    ? [
        path.titleZh,
        path.titleEn,
        path.explanationZh,
        path.explanationEn,
        path.memoryHookZh,
        path.memoryHookEn,
        path.usageAnchorZh,
        path.usageAnchorEn,
        path.outputSentence?.dutch,
        path.outputSentence?.meaningZh,
        path.outputSentence?.meaningEn,
        ...path.outputSentences.flatMap((sentence) => [sentence.dutch, sentence.meaningZh, sentence.meaningEn]),
        ...path.phraseChunks.flatMap((chunk) => [chunk.dutch, chunk.meaningZh, chunk.meaningEn]),
        ...(path.steps ?? [])
          .filter((step) => step.labelZh !== "别混淆" && step.labelEn !== "Do not mix up")
          .flatMap((step) => [step.labelZh, step.labelEn, step.contentZh, step.contentEn, step.dutchExample ?? ""]),
      ].filter(Boolean).join(" ")
    : "";

function issueWarning(issue: MemoryPathQualityIssue) {
  const messages: Record<MemoryPathQualityIssue, { zh: string; en: string }> = {
    "missing-memory-path": { zh: "缺少记忆路径。", en: "Missing memory path." },
    "generic-memory-path": { zh: "记忆路径含泛泛填充文案。", en: "Memory path contains generic filler." },
    "wrong-strategy": { zh: "记忆策略和词类不匹配。", en: "Memory strategy does not match word type." },
    "fake-breakdown": { zh: "拆词策略缺少可信部件。", en: "Breakdown strategy lacks credible parts." },
    "weak-english-bridge": { zh: "英文桥梁不够具体或可能误导。", en: "English bridge is weak or misleading." },
    "forced-homophone": { zh: "不要用强行谐音。", en: "Forced homophone detected." },
    "missing-output-sentence": { zh: "缺少可输出句。", en: "Missing output sentence." },
    "missing-usage-scenario": { zh: "缺少具体使用场景。", en: "Missing usage scenario." },
    "missing-useful-phrase": { zh: "搭配型策略缺少可用搭配。", en: "Phrase-based strategy lacks a useful phrase." },
    "category-rule-error": { zh: "类别规则可能误导。", en: "Category rule may be misleading." },
    "abstract-chinese-explanation": { zh: "中文解释太抽象，需要更具体。", en: "Chinese explanation is too abstract." },
  };
  return messages[issue];
}

function uniqueIssues(issues: MemoryPathQualityIssue[]) {
  return Array.from(new Set(issues));
}

export function checkMemoryPathQuality(path: MemoryPath | undefined, word?: WordItem): MemoryPathQualityResult {
  const issues: MemoryPathQualityIssue[] = [];
  if (!path) {
    issues.push("missing-memory-path");
    return {
      issues,
      confidence: "low",
      needsHumanReview: true,
      warnings: issues.map(issueWarning),
    };
  }

  const allText = textFor(path);
  const teachingText = teachingTextFor(path);
  const expectedWordType = word ? classifyMemoryPathWord(word) : path.wordType;
  const hasOutputSentence = Boolean(path.outputSentence?.dutch?.trim() || path.outputSentences.some((sentence) => sentence.dutch.trim()));
  const usageText = `${path.usageAnchorZh ?? ""} ${path.usageAnchorEn ?? ""} ${path.scenarioAnchor?.zh ?? ""} ${path.scenarioAnchor?.en ?? ""}`;

  if (genericFillerPattern.test(allText)) issues.push("generic-memory-path");
  if (forcedSoundPattern.test(allText)) issues.push("forced-homophone");
  if (path.wordType !== expectedWordType) issues.push("wrong-strategy");
  if (!hasOutputSentence && path.wordType !== "number") issues.push("missing-output-sentence");
  if (!usageText.trim()) issues.push("missing-usage-scenario");
  if ((path.strategy === "word-breakdown" || path.strategy === "compound-word") && (!path.breakdown || path.breakdown.parts.length < 2)) {
    issues.push("fake-breakdown");
  }
  if (path.strategy === "english-bridge") {
    const bridge = `${path.englishBridge?.bridge ?? ""} ${path.englishBridge?.noteZh ?? ""} ${path.englishBridge?.noteEn ?? ""}`;
    if (!bridge.trim() || bridge.length < 8 || /≈\s*$/.test(bridge)) issues.push("weak-english-bridge");
  }
  if (path.strategy === "phrase-based" && !path.phraseChunks.some((chunk) => chunk.dutch.trim() && chunk.dutch !== path.dutch)) {
    issues.push("missing-useful-phrase");
  }
  if (path.strategy === "sentence-based" && !hasOutputSentence) issues.push("missing-output-sentence");
  if (path.strategy === "category-rule" && /Engelsen|Nederlanders|Chinezen/.test(teachingText)) issues.push("category-rule-error");
  if (abstractChinesePattern.test(path.memoryHookZh) && !path.breakdown && !path.englishBridge && path.strategy !== "sentence-based") {
    issues.push("abstract-chinese-explanation");
  }

  const deduped = uniqueIssues(issues);
  const confidence = deduped.length === 0
    ? path.confidence ?? "high"
    : deduped.length <= 2
      ? "medium"
      : "low";

  return {
    issues: deduped,
    confidence,
    needsHumanReview: deduped.length > 0 || path.needsHumanReview === true || confidence === "low",
    warnings: deduped.map(issueWarning),
  };
}
