"use client";

import { verbUsageFor } from "@/lib/dutchVerbForms";
import { generateExamplesForWord, generatedExampleToExampleSentence } from "@/lib/exampleSentenceGenerator";
import { wordTypeFor } from "@/lib/memoryPath";
import { meaningForUsableSentence } from "@/lib/vocabularySentences";
import type { LocalizedText } from "@/types/course";
import type { ExampleSentence, PhraseChunk, WordBubbleCompletionDraft, WordItem } from "@/types/vocabulary";

const lt = (zh = "", en = ""): LocalizedText => ({ zh, en });

const hasMeaning = (meaning: LocalizedText) => Boolean(meaning.zh.trim() && meaning.en.trim());

const resolvedSentenceMeaning = (dutch: string, fallback?: LocalizedText): LocalizedText => {
  const known = meaningForUsableSentence(dutch);
  return lt(known.zh || fallback?.zh || "", known.en || fallback?.en || "");
};

const phrase = (word: WordItem, dutch: string, zh: string, en: string, sceneZh?: string, sceneEn?: string): PhraseChunk => ({
  id: `${word.id}-suggested-phrase-${dutch.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  level: word.level,
  dutch,
  meaning: lt(zh, en),
  usageScene: lt(sceneZh ?? word.theme, sceneEn ?? word.theme),
  relatedWords: [word.dutch],
  exampleSentence: {
    dutch,
    meaning: lt(zh, en),
  },
  audioText: dutch,
});

const example = (
  word: WordItem,
  dutch: string,
  zh: string,
  en: string,
  type: ExampleSentence["type"] = "scenario",
): ExampleSentence => {
  const meaning = resolvedSentenceMeaning(dutch, lt(zh, en));
  return {
    dutch,
    meaning,
    level: word.level,
    type,
    targetWord: word.dutch,
    grammarFocus: "",
    scenarioTags: word.scenarioTags,
    audioText: dutch,
  };
};

const compoundParts: Record<string, { parts: string; hookZh: string; hookEn: string }> = {
  ziekenhuis: {
    parts: "ziek + huis",
    hookZh: "ziek 是生病，huis 是房子。ziekenhuis 就像 sick house，病人去的地方就是医院。",
    hookEn: "ziek means sick and huis means house. ziekenhuis feels like sick house: hospital.",
  },
  huisarts: {
    parts: "huis + arts",
    hookZh: "huis 是家，arts 是医生。huisarts 是和家庭/住处相关的医生，也就是家庭医生。",
    hookEn: "huis means home and arts means doctor. huisarts is the GP/family doctor.",
  },
  tandarts: {
    parts: "tand + arts",
    hookZh: "tand 是牙，arts 是医生。tandarts 就是牙齿医生：牙医。",
    hookEn: "tand means tooth and arts means doctor. tandarts is a tooth doctor: dentist.",
  },
  aardappel: {
    parts: "aard + appel",
    hookZh: "aard 是土地，appel 是苹果。aardappel 像 earth apple：地里的 apple，就是土豆。",
    hookEn: "aard means earth and appel means apple. aardappel feels like earth apple: potato.",
  },
  sinaasappel: {
    parts: "sinaas + appel",
    hookZh: "sinaasappel 里有 appel，但整体意思是橙子。记住：不是苹果，是橙子。",
    hookEn: "sinaasappel contains appel, but the whole word means orange.",
  },
};

const exactDrafts: Record<string, (word: WordItem) => WordBubbleCompletionDraft> = {
  adres: (word) => ({
    wordId: word.id,
    dutch: word.dutch,
    generatedAt: new Date().toISOString(),
    suggestedMemoryHook: "adres 和 English “address” 很像，但荷兰语少一个 d：address → adres。填表、注册、市政厅都会用到。",
    suggestedEnglishExplanation: "Adres is a practical form/document word. Learners need it for forms, registration, municipality visits, and changing personal details.",
    suggestedEnglishBridge: "adres ≈ address",
    suggestedPronunciationHint: "a 短一点，末尾 s 清楚读出来。不要按英语 address 的重音读。",
    suggestedArticleReason: "het adres。没有明显 de/het 线索，直接和冠词一起记：het adres。",
    suggestedCommonMistake: "❌ de adres\n✅ het adres",
    suggestedPhraseChunks: [phrase(word, "het adres invullen", "填写地址", "to fill in the address", "表格/市政厅", "forms / municipality")],
    suggestedExamples: [
      example(word, "Dit is mijn adres.", "这是我的地址。", "This is my address.", "minimal"),
      example(word, "Ik vul mijn adres in op het formulier.", "我在表格上填写我的地址。", "I fill in my address on the form.", "scenario"),
      example(word, "Ik wil mijn adres veranderen.", "我想更改我的地址。", "I want to change my address.", "output"),
    ],
    suggestedOutputSentence: example(word, "Ik vul mijn adres in op het formulier.", "我在表格上填写我的地址。", "I fill in my address on the form.", "output"),
    suggestedLevelReason: lt("A1/A2 实用个人信息词：填表、市政厅、注册和改地址都会用到。", "A1/A2 practical personal-information word for forms, municipality visits, registration, and address changes."),
    confidence: "high",
    warnings: [],
  }),
};

const usefulNounPhrases: Record<string, { dutch: string; zh: string; en: string }> = {
  afspraak: { dutch: "een afspraak maken", zh: "预约", en: "make an appointment" },
  rekening: { dutch: "de rekening betalen", zh: "付账单", en: "pay the bill" },
  formulier: { dutch: "het formulier invullen", zh: "填写表格", en: "fill in the form" },
  verzekering: { dutch: "de verzekering bellen", zh: "给保险公司打电话", en: "call the insurance company" },
  gemeente: { dutch: "naar de gemeente gaan", zh: "去市政厅", en: "go to the municipality" },
  woning: { dutch: "een woning zoeken", zh: "找住房", en: "look for housing" },
  huisarts: { dutch: "de huisarts bellen", zh: "给家庭医生打电话", en: "call the GP" },
  ziekenhuis: { dutch: "naar het ziekenhuis gaan", zh: "去医院", en: "go to the hospital" },
  trein: { dutch: "de trein nemen", zh: "坐火车", en: "take the train" },
  kaartje: { dutch: "een kaartje kopen", zh: "买票", en: "buy a ticket" },
};

const usefulVerbExamples: Record<string, { phrase: string; zh: string; en: string; examples: [string, string, string][] }> = {
  helpen: {
    phrase: "Kunt u mij helpen?",
    zh: "您能帮我吗？",
    en: "Can you help me?",
    examples: [
      ["Kunt u mij helpen?", "您能帮我吗？", "Can you help me?"],
      ["De medewerker helpt mij.", "工作人员帮我。", "The employee helps me."],
      ["Ik heb hulp nodig.", "我需要帮助。", "I need help."],
    ],
  },
  wonen: {
    phrase: "in Nederland wonen",
    zh: "住在荷兰",
    en: "live in the Netherlands",
    examples: [
      ["Ik woon in Nederland.", "我住在荷兰。", "I live in the Netherlands."],
      ["Waar woon jij?", "你住在哪里？", "Where do you live?"],
      ["Wij wonen in Delft.", "我们住在代尔夫特。", "We live in Delft."],
    ],
  },
  bellen: {
    phrase: "de huisarts bellen",
    zh: "给家庭医生打电话",
    en: "call the GP",
    examples: [
      ["Ik bel de huisarts.", "我给家庭医生打电话。", "I call the GP."],
      ["Kunt u mij terugbellen?", "您可以给我回电话吗？", "Can you call me back?"],
      ["Ik wil vandaag bellen.", "我想今天打电话。", "I want to call today."],
    ],
  },
};

const a0FixedExamples: Record<string, { phrase: [string, string, string]; examples: [string, string, string][] }> = {
  ja: {
    phrase: ["Ja.", "是/对。", "Yes."],
    examples: [
      ["Ja.", "是/对。", "Yes."],
      ["Ja, dat klopt.", "是的，没错。", "Yes, that is correct."],
      ["Ja, graag.", "好的，谢谢/要的。", "Yes, please."],
    ],
  },
  nee: {
    phrase: ["Nee.", "不是/不。", "No."],
    examples: [
      ["Nee.", "不是/不。", "No."],
      ["Nee, dat klopt niet.", "不，那不对。", "No, that is not correct."],
      ["Nee, dank je.", "不用了，谢谢。", "No, thank you."],
    ],
  },
  hallo: {
    phrase: ["Hallo.", "你好。", "Hello."],
    examples: [
      ["Hallo.", "你好。", "Hello."],
      ["Hallo, ik ben Lin.", "你好，我是 Lin。", "Hello, I am Lin."],
      ["Hallo, hoe gaat het?", "你好，你好吗？", "Hello, how are you?"],
    ],
  },
  dag: {
    phrase: ["Dag.", "你好/再见。", "Hello/bye."],
    examples: [
      ["Dag.", "你好/再见。", "Hello/bye."],
      ["Dag, tot ziens.", "再见，回头见。", "Bye, see you."],
      ["Dag, tot morgen.", "再见，明天见。", "Bye, see you tomorrow."],
    ],
  },
  goed: {
    phrase: ["Het gaat goed.", "我很好。", "I am fine."],
    examples: [
      ["Het gaat goed.", "我很好。", "I am fine."],
      ["Goed, dank je.", "很好，谢谢。", "Good, thank you."],
      ["Dat is goed.", "那可以/那很好。", "That is good."],
    ],
  },
  goedemorgen: {
    phrase: ["Goedemorgen.", "早上好。", "Good morning."],
    examples: [
      ["Goedemorgen.", "早上好。", "Good morning."],
      ["Goedemorgen, hoe gaat het?", "早上好，你好吗？", "Good morning, how are you?"],
      ["Goedemorgen, ik ben Lin.", "早上好，我是 Lin。", "Good morning, I am Lin."],
    ],
  },
  goedenavond: {
    phrase: ["Goedenavond.", "晚上好。", "Good evening."],
    examples: [
      ["Goedenavond.", "晚上好。", "Good evening."],
      ["Goedenavond, hoe gaat het?", "晚上好，你好吗？", "Good evening, how are you?"],
      ["Goedenavond, tot ziens.", "晚上好，再见。", "Good evening, goodbye."],
    ],
  },
  "tot ziens": {
    phrase: ["Tot ziens.", "再见。", "See you."],
    examples: [
      ["Tot ziens.", "再见。", "See you."],
      ["Tot ziens, fijne dag.", "再见，祝你今天愉快。", "See you, have a nice day."],
      ["Tot ziens, tot morgen.", "再见，明天见。", "See you, see you tomorrow."],
    ],
  },
  bedankt: {
    phrase: ["Bedankt.", "谢谢。", "Thanks."],
    examples: [
      ["Bedankt.", "谢谢。", "Thanks."],
      ["Bedankt voor uw hulp.", "谢谢您的帮助。", "Thank you for your help."],
      ["Alvast bedankt.", "先谢谢您。", "Thanks in advance."],
    ],
  },
  "dank je": {
    phrase: ["Dank je.", "谢谢你。", "Thank you."],
    examples: [
      ["Dank je.", "谢谢你。", "Thank you."],
      ["Dank je wel.", "非常感谢。", "Thank you very much."],
      ["Dank je voor je hulp.", "谢谢你的帮助。", "Thank you for your help."],
    ],
  },
  alsjeblieft: {
    phrase: ["Alsjeblieft.", "请/给你。", "Please / here you are."],
    examples: [
      ["Alsjeblieft.", "请/给你。", "Please / here you are."],
      ["Een koffie, alsjeblieft.", "一杯咖啡，谢谢。", "A coffee, please."],
      ["Hier, alsjeblieft.", "给你。", "Here you are."],
    ],
  },
};

const levelExampleFor = (word: WordItem): ExampleSentence[] => {
  const fixed = a0FixedExamples[word.dutch.toLowerCase()];
  if (fixed) return fixed.examples.map(([dutch, zh, en], index) => example(word, dutch, zh, en, index === 0 ? "minimal" : "scenario"));

  return generateExamplesForWord(word)
    .filter((item) => item.dutch.trim() && item.meaningZh.trim() && item.meaningEn.trim())
    .map(generatedExampleToExampleSentence)
    .slice(0, 3);
};

const articleReasonFor = (word: WordItem) => {
  if (!word.article) return undefined;
  if (word.dutch.endsWith("je")) return `${word.article} ${word.dutch}。-je 小词通常用 het；如果这里不是 het，就按词典和常用搭配单独记。`;
  if (word.dutch.endsWith("ing")) return `${word.article} ${word.dutch}。-ing 结尾多半是 de，但仍然整块记。`;
  if (word.dutch.includes("huis")) return `${word.article} ${word.dutch}。复合词通常看最后一个核心词；和 ${word.article} ${word.dutch} 一起记。`;
  return `${word.article} ${word.dutch}。没有明显 de/het 线索，直接和冠词一起记：${word.article} ${word.dutch}。`;
};

export function generateWordBubbleCompletionDraft(word: WordItem): WordBubbleCompletionDraft {
  const exact = exactDrafts[word.dutch.toLowerCase()];
  if (exact) return exact(word);

  const type = wordTypeFor(word);
  const compound = compoundParts[word.dutch.toLowerCase()];
  const verb = usefulVerbExamples[word.dutch.toLowerCase()];
  const verbUsage = verbUsageFor(word);
  const nounPhrase = usefulNounPhrases[word.dutch.toLowerCase()];
  const hasUsefulBridge = Boolean(word.englishBridge && !/belongs to|links to/i.test(word.englishBridge));
  const generatedAt = new Date().toISOString();

  let suggestedMemoryHook = "这个词没有特别自然的联想，建议和短语/例句一起记。";
  let suggestedEnglishExplanation = `Use ${word.dutch} in short, practical sentences instead of memorizing it alone.`;
  let suggestedEnglishBridge = hasUsefulBridge ? word.englishBridge : undefined;
  let confidence: WordBubbleCompletionDraft["confidence"] = "low";
  const warnings: string[] = [];

  if (compound) {
    suggestedMemoryHook = `${compound.parts}。${compound.hookZh}`;
    suggestedEnglishExplanation = compound.hookEn;
    confidence = "high";
  } else if (hasUsefulBridge) {
    suggestedMemoryHook = `${word.dutch} 和 English “${word.meaning.en}” 有相似处，可以先借外形记意思，但发音按荷兰语读。`;
    suggestedEnglishExplanation = `${word.dutch} may look familiar in English, but should be pronounced as Dutch.`;
    confidence = "medium";
  } else if (type === "verb" && verb) {
    suggestedMemoryHook = `动词不要只背原形，要背能直接开口的句子：${verb.phrase}`;
    suggestedEnglishExplanation = `This is a verb. Teach it through conjugated usage and one useful sentence first.`;
    confidence = "high";
  } else if (type === "verb" && verbUsage) {
    suggestedMemoryHook = `动词不要只背一个词。先看三格：${verbUsage.ikForm} / ${verbUsage.jijForm} / ${verbUsage.wijForm}。`;
    suggestedEnglishExplanation = `This is a verb. Teach the useful present-tense forms before making sentence cards.`;
    confidence = "medium";
  } else if (type === "noun" && nounPhrase) {
    suggestedMemoryHook = `${word.dutch} 不单独背，先和高频搭配一起记：${nounPhrase.dutch}。`;
    suggestedEnglishExplanation = `This noun is best learned through a common phrase chunk: ${nounPhrase.dutch}.`;
    confidence = "high";
  } else {
    warnings.push("没有强规则命中；建议先用短语和自然例句补齐。");
  }

  const suggestedPhraseChunks = verb
    ? [phrase(word, verb.phrase, verb.zh, verb.en)]
    : type === "verb" && verbUsage
      ? (() => {
          const dutch = verbUsage.examples[0];
          const meaning = resolvedSentenceMeaning(dutch);
          return hasMeaning(meaning) ? [phrase(word, dutch, meaning.zh, meaning.en)] : [];
        })()
    : a0FixedExamples[word.dutch.toLowerCase()]
      ? [phrase(word, ...a0FixedExamples[word.dutch.toLowerCase()].phrase)]
    : nounPhrase
      ? [phrase(word, nounPhrase.dutch, nounPhrase.zh, nounPhrase.en)]
      : word.article
        ? [phrase(word, `${word.article} ${word.dutch}`, word.meaning.zh, word.meaning.en)]
        : [];

  const suggestedExamples = verb
    ? verb.examples.map(([dutch, zh, en], index) => example(word, dutch, zh, en, index === 0 ? "output" : "scenario"))
    : levelExampleFor(word);

  if (!suggestedExamples.length) {
    warnings.push("缺少可靠例句；请在 Creator Studio 手动补 1-3 个真实可用句。");
  }
  if (!suggestedPhraseChunks.length) {
    warnings.push("缺少可靠短语块；请手动补常用搭配，不要只放单词。");
  }

  return {
    wordId: word.id,
    dutch: word.dutch,
    generatedAt,
    suggestedMemoryHook,
    suggestedEnglishExplanation,
    suggestedEnglishBridge,
    suggestedPronunciationHint: word.dutch.includes("ui")
      ? "ui 是荷兰语特殊音，嘴唇圆起来，从前往后滑，不要读成中文“欧”。"
      : word.dutch.includes("ij") || word.dutch.includes("ei")
        ? "ij/ei 是同一个常见荷兰语双元音，注意不要按英语字母逐个读。"
        : "先听整词，再跟读。注意重音和荷兰语元音，不要按英语拼读。",
    suggestedArticleReason: articleReasonFor(word),
    suggestedCommonMistake: word.article ? `❌ ${word.article === "de" ? "het" : "de"} ${word.dutch}\n✅ ${word.article} ${word.dutch}` : undefined,
    suggestedPhraseChunks,
    suggestedExamples,
    suggestedOutputSentence: suggestedExamples[0],
    suggestedLevelReason: lt(
      `${word.level} ${word.theme} 相关词：用于${word.scenarioTags.join("、") || "日常场景"}，先放进短语和句子里掌握。`,
      `${word.level} ${word.theme} word: useful for ${word.scenarioTags.join(", ") || "daily scenarios"}. Learn it through chunks and sentences.`,
    ),
    confidence,
    warnings,
  };
}
