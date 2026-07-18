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
  | "abstract-chinese-explanation"
  | "memory-path-too-long";

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
  /这个词建议通过短语和例句记|建议通过短语和例句记|放进一个真实短句|放进短语和例句|这个词最好通过常用搭配记|先背能直接用的词块|贴在|一看到这块|落回荷兰语|场景卡|这种真实用法|暂时没有强|先给这个词一个生活画面|先放进一个真实短句里记|动词要带动作画面记|钉在|先看见|再想起荷兰语|固定开口方式|这个词适合放在真实生活里|帮助你固定这个词|联想词块|记忆路径生成逻辑|先背这个词，再跟句子读|记忆画面|办事时工作人员会说|荷兰表格里会突然出现|日常办事会撞见它|看医生药房马上用|市政厅表格高频词|超市货架前马上用|公交火车误点会见到|语言课点名常见词|上班请假邮件会出现|租房合同里常见词|落到 .*这个可用词块里|这个搭配把 .*意思直接带出来|时间词按类别记|日历上的一格|属于这一类|按日期、星期或月份的位置来记|先确定它属于星期、月份还是时间单位|可以借英文认意思，但拼写、发音和搭配按荷兰语走|别直接套英语；确认荷兰语里的词义、发音和搭配|Ik zie de (mens|vrouw)|Ik zie het kind|=\s*我看到|put it into a real sentence|common chunks and real sentences|usable phrases and sentences|label attached|scene card|generic|placeholder|manual review|missing memory|missing path|creator/i;

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
        ...(path.outputSentences ?? []).flatMap((sentence) => [sentence.dutch, sentence.meaningZh, sentence.meaningEn]),
        ...(path.phraseChunks ?? []).flatMap((chunk) => [chunk.dutch, chunk.meaningZh, chunk.meaningEn]),
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
    "memory-path-too-long": { zh: "记忆钩子过长，需要删掉重复说明。", en: "The memory hook is too long and should be tightened." },
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
  const hasOutputSentence = Boolean(path.outputSentence?.dutch?.trim() || (path.outputSentences ?? []).some((sentence) => sentence.dutch.trim()));
  const usageText = `${path.usageAnchorZh ?? ""} ${path.usageAnchorEn ?? ""} ${path.scenarioAnchor?.zh ?? ""} ${path.scenarioAnchor?.en ?? ""}`;

  if (genericFillerPattern.test(allText)) issues.push("generic-memory-path");
  if (forcedSoundPattern.test(allText)) issues.push("forced-homophone");
  if (Array.from(path.memoryHookZh ?? "").length > 120) issues.push("memory-path-too-long");
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
  if (path.strategy === "phrase-based" && !(path.phraseChunks ?? []).some((chunk) => chunk.dutch.trim())) {
    issues.push("missing-useful-phrase");
  }
  if (path.strategy === "phrase-based" && path.wordType === "verb") {
    issues.push("wrong-strategy");
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
