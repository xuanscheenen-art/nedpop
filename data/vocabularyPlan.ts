import { smartWords } from "@/data/smartWords";
import { dutchSyllabus } from "@/data/dutchSyllabus";
import { publicVocabularyAdditions } from "@/data/publicVocabularyAdditions";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { inferWordType, infinitiveForWord } from "@/lib/exampleTemplates";
import { meaningForUsableSentence, primaryUsableSentenceFor, usableSentenceLinesFor } from "@/lib/vocabularySentences";
import type { CourseLevel, LocalizedText, SmartWord } from "@/types/course";
import type { ExamRelevance, PhraseChunk, SentencePattern, SourceTag, VocabularyLevelPlan, WordDayPack, WordItem } from "@/types/vocabulary";
import type { SyllabusVocabularyWord } from "@/types/syllabus";
import type { PublicVocabularyEntry, PublicVocabularyTheme } from "@/data/publicVocabularyAdditions";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

export const vocabularyLevelPlans: VocabularyLevelPlan[] = [
  {
    level: "A0",
    titleZh: "A0 生存入门",
    titleEn: "A0 Starter",
    targetWordRange: "150-200 words",
    currentWordCount: 180,
    dailyWordCount: "8-10",
    totalDays: 20,
    description: lt("A0 是考前预备层：先建立发音、礼貌表达、数字、个人信息和最小生存词库。", "A0 is a pre-exam scaffold: build sounds, polite phrases, numbers, personal details, and the smallest survival vocabulary."),
  },
  {
    level: "A1",
    titleZh: "A1 生活基础",
    titleEn: "A1 Foundation",
    targetWordRange: "600-700 active words",
    currentWordCount: 650,
    dailyWordCount: "10 active words + review",
    totalDays: 65,
    description: lt("A1 是生活基础层：覆盖个人、家庭、时间日期、数字、食物饮料、超市、基础交通、天气、住处、学校工作、简单健康、方向、爱好、基础动词、形容词和常用功能词。", "A1 is the daily-life foundation: personal details, family, time/dates, numbers, food/drinks, supermarket, basic transport, weather, home, school/work, simple health, directions, hobbies, basic verbs, adjectives, and common function words."),
  },
  {
    level: "A2",
    titleZh: "A2 生活任务",
    titleEn: "A2 Practical Life Tasks",
    targetWordRange: "650-750 practical words",
    currentWordCount: 720,
    dailyWordCount: "10 practical words + 0-2 recognition words",
    totalDays: 60,
    cumulativeTargetForA2: "1500-1700 reviewed/recognition words",
    description: lt("A2 是生活任务包：围绕家庭医生、药房、预约、疼痛和药物、市政厅、表格、地址证件、住房搬家、工作请假、交通延误、账单保险、邮件、电话、投诉和求助保留实用词；更专业内容先放入 B1 候选。", "A2 is a practical life-task pack: GP, pharmacy, appointments, pain and medicine, municipality, forms, addresses and documents, housing and moving, sick leave, transport delays, bills/insurance, emails, calls, complaints, and help requests; more specialized content is moved to B1 candidates."),
  },
  {
    level: "B1",
    titleZh: "B1 独立任务表达",
    titleEn: "B1 Independent Task Dutch",
    targetWordRange: "800-950 textbook-aligned B1 words",
    currentWordCount: 880,
    dailyWordCount: "12 active words + review/recognition",
    totalDays: 70,
    description: lt("B1 按公开 NT2 B1 教材/课程主题扩展：自我表达、健康、社区、钱、工作、 opleiding、旅行、环境、媒体、文化艺术、观点讨论、展示会议、正式文字和公共生活任务。这里是 NedPop 的可学习 B1 核心层，不声称为官方必考词表。", "B1 expands around public NT2 B1 textbook/course themes: self-expression, health, neighborhood, money, work, education, travel, environment, media, culture/art, opinion discussion, presentations/meetings, formal texts, and public-life tasks. This is NedPop's learnable B1 core layer, not an official required word list."),
  },
];

const appearsInLevelsFor = (level: CourseLevel) => {
  if (level === "A0") return ["A0", "A1", "A2", "B1"] as const;
  if (level === "A1") return ["A1", "A2", "B1"] as const;
  if (level === "A2") return ["A2", "B1"] as const;
  return ["B1"] as const;
};

const pluralize = (word: string) => {
  const verified: Record<string, string> = {
    huis: "huizen",
    ziekenhuis: "ziekenhuizen",
    stad: "steden",
    kind: "kinderen",
    naam: "namen",
    vraag: "vragen",
    raam: "ramen",
    probleem: "problemen",
    systeem: "systemen",
    appel: "appels",
    aardappel: "aardappels",
    sinaasappel: "sinaasappels",
    appelsap: "appelsappen",
    telefoon: "telefoons",
    station: "stations",
    formulier: "formulieren",
    adres: "adressen",
    document: "documenten",
    moment: "momenten",
    contract: "contracten",
    jas: "jassen",
    trui: "truien",
    broek: "broeken",
    sok: "sokken",
    schoenen: "schoenen",
    arm: "armen",
    been: "benen",
    rug: "ruggen",
    keel: "kelen",
    hoofd: "hoofden",
    buik: "buiken",
    hand: "handen",
    voet: "voeten",
    oor: "oren",
    neus: "neuzen",
    mond: "monden",
    tand: "tanden",
    herhaling: "herhalingen",
  };
  if (verified[word]) return verified[word];
  if (word.endsWith("je")) return `${word}s`;
  if (word.endsWith("ie")) return `${word}s`;
  if (word.endsWith("ing")) return `${word}en`;
  if (word.endsWith("heid")) return `${word}heden`;
  if (/(aa|ee|oo|uu)[bcdfghjklmnpqrstvwxz]$/.test(word)) {
    return `${word.replace(/(aa|ee|oo|uu)([bcdfghjklmnpqrstvwxz])$/, (_, vowel: string, consonant: string) => `${vowel[0]}${consonant}`)}en`;
  }
  if (word.endsWith("s")) return `${word}en`;
  if (word.endsWith("f")) return `${word.slice(0, -1)}ven`;
  return `${word}en`;
};

const emptyExampleSentence = (): WordItem["exampleSentence"] => ({
  dutch: "",
  meaning: lt("", ""),
});

const isTrustedGeneratedExample = (example: GeneratedExample) =>
  example.dutch.trim() &&
  example.meaningZh.trim() &&
  example.meaningEn.trim() &&
  example.confidence !== "low" &&
  !example.needsHumanReview &&
  !(example.qualityIssues?.length);

const normalizeGeneratedContent = (item: WordItem): WordItem => {
  const generated = generateExamplesForWord(item).filter(isTrustedGeneratedExample);
  if (!generated.length) return item;

  const phraseChunks = Array.from(new Set(generated.map((example) => example.phraseChunkUsed?.trim()).filter(Boolean) as string[]));
  const primary = generated[0];
  const oldHook = `${item.memoryHook.zh} ${item.memoryHook.en}`;
  const hasGenericHook = /搭配记忆|基础动作补充|先看这个词最常|放进 .* 场景|put .* into|remember .* in the .* scene/i.test(oldHook);
  const wordType = inferWordType(item);
  const infinitive = wordType === "verb" ? infinitiveForWord(item) : undefined;
  const memoryHook =
    hasGenericHook && wordType === "verb"
      ? lt(
          `把 ${item.dutch} 当动词记：先背 ${primary.phraseChunkUsed ?? primary.dutch}，再整句跟读 ${primary.dutch}`,
          `Treat ${item.dutch} as a verb${infinitive ? ` from ${infinitive}` : ""}: learn the chunk ${primary.phraseChunkUsed ?? primary.dutch}, then repeat ${primary.dutch}`,
        )
      : item.memoryHook;
  return {
    ...item,
    memoryHook,
    phraseChunks: phraseChunks.length ? phraseChunks : item.phraseChunks,
    exampleSentence: {
      dutch: primary.dutch,
      meaning: lt(primary.meaningZh, primary.meaningEn),
    },
  };
};

const commandObjects: Record<string, string> = {
  begin: "nu",
  klik: "hier",
  lees: "de zin",
  luister: "goed",
  open: "de app",
  schrijf: "mijn naam",
  sluit: "de app",
  stop: "nu",
  zeg: "hallo",
};

const routineObjects: Record<string, string> = {
  bellen: "de huisarts",
  drinken: "water",
  eten: "brood",
  koken: "vandaag",
  kijken: "naar het bord",
  leren: "Nederlands",
  lezen: "de zin",
  lopen: "naar huis",
  opstaan: "vroeg",
  slapen: "goed",
  wassen: "mijn handen",
  werken: "vandaag",
  schrijven: "mijn naam",
};

const actionObjectFor = (word: string) => commandObjects[word] ?? routineObjects[word];

const actionExamples: Record<string, { phrase: string; sentence: string; command?: string }> = {
  begin: { phrase: "begin nu", sentence: "Ik begin nu.", command: "Begin nu." },
  bellen: { phrase: "de huisarts bellen", sentence: "Ik bel de huisarts." },
  drinken: { phrase: "water drinken", sentence: "Ik drink water." },
  eten: { phrase: "brood eten", sentence: "Ik eet brood." },
  klik: { phrase: "klik hier", sentence: "Ik klik hier.", command: "Klik hier." },
  koken: { phrase: "vandaag koken", sentence: "Ik kook vandaag." },
  kijken: { phrase: "naar het bord kijken", sentence: "Ik kijk naar het bord." },
  leren: { phrase: "Nederlands leren", sentence: "Ik leer Nederlands." },
  lees: { phrase: "lees de zin", sentence: "Ik lees de zin.", command: "Lees de zin." },
  lezen: { phrase: "de zin lezen", sentence: "Ik lees de zin." },
  luister: { phrase: "luister goed", sentence: "Ik luister goed.", command: "Luister goed." },
  lopen: { phrase: "naar huis lopen", sentence: "Ik loop naar huis." },
  open: { phrase: "open de app", sentence: "Ik open de app.", command: "Open de app." },
  opstaan: { phrase: "vroeg opstaan", sentence: "Ik sta vroeg op." },
  slapen: { phrase: "goed slapen", sentence: "Ik slaap goed." },
  schrijf: { phrase: "schrijf mijn naam", sentence: "Ik schrijf mijn naam.", command: "Schrijf mijn naam." },
  schrijven: { phrase: "mijn naam schrijven", sentence: "Ik schrijf mijn naam." },
  sluit: { phrase: "sluit de app", sentence: "Ik sluit de app.", command: "Sluit de app." },
  stop: { phrase: "stop nu", sentence: "Ik stop nu.", command: "Stop nu." },
  wassen: { phrase: "mijn handen wassen", sentence: "Ik was mijn handen." },
  werken: { phrase: "vandaag werken", sentence: "Ik werk vandaag." },
  zeg: { phrase: "zeg hallo", sentence: "Ik zeg hallo.", command: "Zeg hallo." },
  herhaal: { phrase: "langzaam herhalen", sentence: "Kunt u dat herhalen?", command: "Herhaal, alstublieft." },
  herhalen: { phrase: "langzaam herhalen", sentence: "Kunt u dat herhalen?", command: "Herhaal, alstublieft." },
};

const actionExampleFor = (word: string) => actionExamples[word];

const practicalScenarioTags = new Set([
  "health",
  "appointment",
  "gemeente",
  "housing",
  "work",
  "sick-leave",
  "insurance",
  "bill",
  "email",
  "form",
  "phone-call",
  "complaint",
  "transport",
  "supermarket",
  "time",
  "family",
  "identity",
  "numbers",
  "greeting",
  "education",
  "digital",
  "safety",
  "law",
  "society",
  "reading",
  "writing",
  "tax",
  "benefits",
  "opinion",
  "presentation",
  "relationship",
  "travel",
  "environment",
  "media",
  "culture",
  "participation",
  "budget",
  "bank",
  "customer-service",
  "neighborhood",
]);

const scenarioTagsFor = (level: CourseLevel, theme: string): string[] => {
  const normalized = theme.toLowerCase();
  const tags: string[] = [];
  if (normalized.includes("greeting")) tags.push("greeting");
  if (normalized.includes("identity") || normalized.includes("introduction") || normalized.includes("self") || normalized.includes("people") || normalized.includes("expression")) tags.push("identity");
  if (normalized.includes("personal") || normalized.includes("details")) tags.push("personal-info");
  if (normalized.includes("country") || normalized.includes("countries")) tags.push("countries");
  if (normalized.includes("language") || normalized.includes("languages") || normalized.includes("translation")) tags.push("languages");
  if (normalized.includes("number")) tags.push("numbers");
  if (normalized.includes("time") || normalized.includes("date") || normalized.includes("appointment")) tags.push("time");
  if (normalized.includes("family")) tags.push("family");
  if (normalized.includes("supermarket") || normalized.includes("shopping") || normalized.includes("food")) tags.push("supermarket");
  if (normalized.includes("transport") || normalized.includes("train")) tags.push("transport");
  if (normalized.includes("travel") || normalized.includes("reizen")) tags.push("travel", "transport");
  if (normalized.includes("home") || normalized.includes("housing") || normalized.includes("rent")) tags.push("housing");
  if (normalized.includes("health") || normalized.includes("gp") || normalized.includes("pharmacy") || normalized.includes("body")) tags.push("health");
  if (normalized.includes("appointment") || normalized.includes("booking") || normalized.includes("changes")) tags.push("appointment");
  if (normalized.includes("municipality") || normalized.includes("gemeente")) tags.push("gemeente");
  if (normalized.includes("work")) tags.push("work");
  if (normalized.includes("workplace") || normalized.includes("customer")) tags.push("work", "customer-service");
  if (normalized.includes("job") || normalized.includes("sollicitatie")) tags.push("work");
  if (normalized.includes("education") || normalized.includes("training") || normalized.includes("study") || normalized.includes("mbo")) tags.push("education");
  if (normalized.includes("strategy") || normalized.includes("exam")) tags.push("education", "reading", "writing");
  if (normalized.includes("writing") || normalized.includes("reading") || normalized.includes("text") || normalized.includes("letter")) tags.push("reading", "writing");
  if (normalized.includes("language-output") || normalized.includes("grammar") || normalized.includes("connector")) tags.push("reading", "writing");
  if (normalized.includes("digital") || normalized.includes("online") || normalized.includes("digi")) tags.push("digital");
  if (normalized.includes("tax") || normalized.includes("benefit") || normalized.includes("money")) tags.push("tax", "benefits", "bill", "budget");
  if (normalized.includes("budget") || normalized.includes("bank")) tags.push("budget", "bank", "bill");
  if (normalized.includes("safety") || normalized.includes("law") || normalized.includes("legal")) tags.push("safety", "law");
  if (normalized.includes("community") || normalized.includes("news") || normalized.includes("society") || normalized.includes("neighborhood")) tags.push("society", "neighborhood", "participation");
  if (normalized.includes("relation")) tags.push("relationship", "identity");
  if (normalized.includes("sustainability") || normalized.includes("environment") || normalized.includes("duurzaam")) tags.push("environment", "society");
  if (normalized.includes("media") || normalized.includes("information")) tags.push("media", "reading");
  if (normalized.includes("culture") || normalized.includes("art")) tags.push("culture", "society");
  if (normalized.includes("opinion") || normalized.includes("discussion")) tags.push("opinion", "speaking", "writing");
  if (normalized.includes("presentation") || normalized.includes("meeting")) tags.push("presentation", "speaking", "work", "education");
  if (normalized.includes("service")) tags.push("complaint");
  if (normalized.includes("sick")) tags.push("sick-leave");
  if (normalized.includes("core-daily")) tags.push("time", "supermarket", "routine");
  if (normalized.includes("insurance")) tags.push("insurance");
  if (normalized.includes("bill") || normalized.includes("payment") || normalized.includes("money")) tags.push("bill");
  if (normalized.includes("email") || normalized.includes("message") || normalized.includes("letter")) tags.push("email");
  if (normalized.includes("form") || normalized.includes("document") || normalized.includes("office")) tags.push("form");
  if (normalized.includes("phone")) tags.push("phone-call");
  if (normalized.includes("complaint") || normalized.includes("problem") || normalized.includes("repair")) tags.push("complaint");
  if (normalized.includes("life-task")) tags.push("appointment", "gemeente", "form", "housing", "health", "bill", "phone-call", "help");
  return Array.from(new Set(tags));
};

const examRelevanceFor = (level: CourseLevel, scenarioTags: string[]): ExamRelevance => {
  if (level === "B1" && scenarioTags.some((tag) => ["work", "education", "reading", "writing", "digital", "tax", "benefits", "safety", "society", "opinion", "presentation", "relationship", "travel", "environment", "media", "culture", "participation", "budget", "bank", "customer-service", "neighborhood"].includes(tag))) return "high";
  if (level === "B1" && scenarioTags.some((tag) => practicalScenarioTags.has(tag))) return "medium";
  if (level === "A2" && scenarioTags.some((tag) => practicalScenarioTags.has(tag))) return "high";
  if (level === "A1" && scenarioTags.some((tag) => ["time", "family", "supermarket", "transport", "housing", "health"].includes(tag))) return "medium";
  if (level === "A0" && scenarioTags.some((tag) => ["greeting", "identity", "numbers"].includes(tag))) return "low";
  return level === "A2" ? "medium" : "low";
};

const sourceTagsFor = (level: CourseLevel, generated: boolean, scenarioTags: string[]): SourceTag[] => {
  if (generated) return ["generated"];
  const tags: SourceTag[] = ["manual", "frequency"];
  if (level === "B1") tags.push("staatsexamen-nt2", "nt2-taalmenu");
  if (level === "A0") tags.push("naar-nederland");
  if (level === "A1") tags.push("nt2-taalmenu");
  if (level === "A2" && scenarioTags.some((tag) => ["appointment", "gemeente", "form", "health", "email", "phone-call", "housing", "bill", "insurance", "transport", "complaint", "sick-leave", "work", "help", "digital"].includes(tag))) {
    tags.push("duo-inburgering-task");
  }
  return Array.from(new Set(tags));
};

const levelReasonFor = (level: CourseLevel, scenarioTags: string[], generated: boolean): LocalizedText => {
  const scenarioText = scenarioTags.join(", ");
  if (generated) {
    return lt(
      `扩充词，按 ${level} 的 ${scenarioText} 场景收录；如例句或搭配不自然，进入质量队列修正。`,
      `Expansion word placed in ${level} for ${scenarioText} scenarios; fix via the quality queue if examples or collocations feel unnatural.`,
    );
  }
  if (level === "A0") {
    return lt("A0 生存表达：问候、身份、数字或最小课堂/app 指令，先会听懂和开口。", "A0 survival word for greetings, identity, numbers, or minimal classroom/app commands.");
  }
  if (level === "A1") {
    return lt("A1 日常生活词：用于家庭、时间、超市、交通、住处、学校工作等基础场景。", "A1 daily-life word for family, time, supermarket, transport, home, school, or work basics.");
  }
  if (level === "B1") {
    return lt("B1 教材主题词：用于公开 NT2 B1 教材/课程常见的自我表达、工作、学习、社区、媒体、观点、展示、正式文字和公共生活任务。", "B1 textbook-theme word for public NT2 B1 course themes: self-expression, work, study, neighborhood, media, opinions, presentations, formal texts, and public-life tasks.");
  }
  return lt("A2 实用办事词：用于医生、市政厅、表格、住房、工作、保险、账单、邮件或电话任务。", "A2 practical-task word for GP, municipality, forms, housing, work, insurance, bills, emails, or phone calls.");
};

const nearbyRelatedWords = (words: string[], word: string) => {
  const index = words.indexOf(word);
  if (index < 0) return words.filter((item) => item !== word).slice(0, 6);
  const before = words.slice(Math.max(0, index - 3), index);
  const after = words.slice(index + 1, index + 4);
  return [...before, ...after].filter((item) => item !== word).slice(0, 6);
};

const shouldUseAutomaticNearbyRelations = (_level: CourseLevel, theme: string) =>
  ![
    "complaints-expanded",
    "email-letter-expanded",
  ].includes(theme);

const slugFor = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const looksLikeBadMemoryHook = (value?: LocalizedText) =>
  !value ||
  /A[0-2]-\d{2}/.test(value.zh) ||
  value.zh.includes("一起记。") ||
  value.zh.includes("场景词") ||
  value.zh.includes("不单背");

const looksLikeBadEnglishBridge = (value?: string) =>
  !value || /\blinks to\b/i.test(value) || /\bbelongs to\b/i.test(value) || /\binside an A[0-2]\b/i.test(value);

const fallbackMemoryHookFor = (
  dutch: string,
  meaning: LocalizedText,
  article: "de" | "het" | undefined,
  exampleDutch: string,
): LocalizedText => {
  if (article) {
    return lt(
      `不要只背 ${dutch}，整块记 ${article} ${dutch}，再放进句子：${exampleDutch}`,
      `Do not memorize ${dutch} alone. Remember ${article} ${dutch}, then use it in: ${exampleDutch}`,
    );
  }
  return lt(
    `先把 ${dutch} 当成“${meaning.zh}”的可用词，直接放进句子：${exampleDutch}`,
    `Treat ${dutch} as a usable word for "${meaning.en}" and put it straight into: ${exampleDutch}`,
  );
};

type WordContentOverride = Partial<Pick<WordItem, "article" | "plural" | "meaning" | "theme" | "scenarioTags" | "levelReason" | "memoryHook" | "englishBridge" | "phraseChunks" | "relatedWords" | "memoryLinks" | "exampleSentence">>;

const memoryLink = (
  dutch: string,
  type: NonNullable<WordItem["memoryLinks"]>[number]["type"],
  zh: string,
  en: string,
): NonNullable<WordItem["memoryLinks"]>[number] => ({
  dutch,
  type,
  explanation: lt(zh, en),
});

const applyContentOverride = (item: WordItem, override?: WordContentOverride): WordItem => {
  if (!override) return item;
  return {
    ...item,
    article: override.article ?? item.article,
    plural: override.plural ?? item.plural,
    meaning: override.meaning ?? item.meaning,
    theme: override.theme ?? item.theme,
    scenarioTags: override.scenarioTags ?? item.scenarioTags,
    levelReason: override.levelReason ?? item.levelReason,
    memoryHook: override.memoryHook ?? item.memoryHook,
    englishBridge: override.englishBridge ?? item.englishBridge,
    phraseChunks: override.phraseChunks ?? item.phraseChunks,
    relatedWords: override.relatedWords ?? item.relatedWords,
    memoryLinks: override.memoryLinks ?? item.memoryLinks,
    exampleSentence: override.exampleSentence ?? item.exampleSentence,
  };
};

const curatedWordOverrides: Record<string, WordContentOverride> = {
  boek: {
    article: "het",
    plural: "boeken",
    meaning: lt("书", "book"),
    memoryHook: lt("boek 很像 book，但发音按荷兰语读；背的时候整块记 het boek。", "boek looks like book, but pronounce it in Dutch; remember it as het boek."),
    englishBridge: "boek looks like book.",
    phraseChunks: ["het boek", "een boek lezen", "Ik lees een boek."],
    relatedWords: ["lezen", "pen", "schrift"],
    exampleSentence: { dutch: "Ik lees een boek.", meaning: lt("我读一本书。", "I read a book.") },
  },
  pen: {
    article: "de",
    plural: "pennen",
    meaning: lt("笔", "pen"),
    memoryHook: lt("pen 和 English pen 一样；写名字时会用到。", "pen is the same as English pen; you use it when writing your name."),
    englishBridge: "pen is the same as pen.",
    phraseChunks: ["de pen", "Ik heb een pen nodig.", "Schrijf met de pen."],
    relatedWords: ["schrijven", "boek", "schrift"],
    exampleSentence: { dutch: "Ik heb een pen nodig.", meaning: lt("我需要一支笔。", "I need a pen.") },
  },
  tas: {
    article: "de",
    plural: "tassen",
    meaning: lt("包", "bag"),
    memoryHook: lt("tas 是随身的包；和 boek、pen 一起放进课堂/出门场景。", "tas is a bag you carry; connect it with boek and pen in class or going-out scenes."),
    phraseChunks: ["de tas", "Mijn boek zit in de tas.", "Ik neem mijn tas mee."],
    relatedWords: ["boek", "pen", "jas"],
    exampleSentence: { dutch: "Mijn boek zit in de tas.", meaning: lt("我的书在包里。", "My book is in the bag.") },
  },
  telefoon: {
    article: "de",
    plural: "telefoons",
    meaning: lt("电话/手机", "phone"),
    memoryHook: lt("telefoon 像 telephone；现代生活里常当手机用。", "telefoon looks like telephone; in daily life it often means phone."),
    englishBridge: "telefoon looks like telephone.",
    phraseChunks: ["de telefoon", "Ik pak mijn telefoon.", "Mijn telefoonnummer is ..."],
    relatedWords: ["telefoonnummer", "bellen", "bericht"],
    exampleSentence: { dutch: "Ik pak mijn telefoon.", meaning: lt("我拿我的手机。", "I take my phone.") },
  },
  tafel: {
    article: "de",
    plural: "tafels",
    meaning: lt("桌子", "table"),
    memoryHook: lt("tafel 和 table 是好朋友；家里/教室里都常见。", "tafel and table are close friends; common at home and in class."),
    englishBridge: "tafel is close to table.",
    phraseChunks: ["de tafel", "Het boek ligt op de tafel.", "aan tafel"],
    relatedWords: ["stoel", "boek", "kamer"],
    exampleSentence: { dutch: "Het boek ligt op de tafel.", meaning: lt("书在桌子上。", "The book is on the table.") },
  },
  stoel: {
    article: "de",
    plural: "stoelen",
    meaning: lt("椅子", "chair"),
    memoryHook: lt("stoel 是坐的东西；和 tafel 成对记：桌子和椅子。", "stoel is something you sit on; pair it with tafel: table and chair."),
    phraseChunks: ["de stoel", "Ik zit op de stoel.", "een tafel en een stoel"],
    relatedWords: ["tafel", "kamer"],
    exampleSentence: { dutch: "Ik zit op de stoel.", meaning: lt("我坐在椅子上。", "I sit on the chair.") },
  },
  jas: {
    article: "de",
    plural: "jassen",
    meaning: lt("外套", "coat"),
    memoryHook: lt("天气冷就穿 jas，和 koud 放一起记。", "When it is cold, you wear a jas; connect it with koud."),
    englishBridge: "clothing word for coat/jacket.",
    phraseChunks: ["een jas", "Ik heb een jas aan.", "Mijn jas is blauw."],
    relatedWords: ["trui", "broek", "schoenen", "koud"],
    exampleSentence: { dutch: "Ik heb een jas aan.", meaning: lt("我穿着外套。", "I am wearing a coat.") },
  },
  trui: {
    article: "de",
    plural: "truien",
    meaning: lt("毛衣", "sweater"),
    memoryHook: lt("trui 里的 ui 是荷兰语特殊音，天气冷时和 jas 一起记。", "The ui in trui is a Dutch special sound; connect it with cold-weather clothes."),
    phraseChunks: ["een trui", "Ik draag een trui.", "Mijn trui is warm."],
    relatedWords: ["jas", "broek", "schoenen", "koud"],
    exampleSentence: { dutch: "Ik draag een trui.", meaning: lt("我穿一件毛衣。", "I wear a sweater.") },
  },
  broek: {
    article: "de",
    plural: "broeken",
    meaning: lt("裤子", "pants"),
    memoryHook: lt("broek 是下半身穿的裤子，和 schoenen 放一组。", "broek is clothing for your legs; connect it with schoenen."),
    phraseChunks: ["een broek", "Ik draag een broek.", "Mijn broek is zwart."],
    relatedWords: ["jas", "trui", "schoenen", "sok"],
    exampleSentence: { dutch: "Ik draag een broek.", meaning: lt("我穿裤子。", "I wear pants.") },
  },
  sok: {
    article: "de",
    plural: "sokken",
    meaning: lt("袜子", "sock"),
    memoryHook: lt("sok 和 schoenen 一起记：先袜子，再鞋。", "sok goes with schoenen: socks first, then shoes."),
    phraseChunks: ["een sok", "twee sokken", "Ik draag sokken."],
    relatedWords: ["schoenen", "broek"],
    exampleSentence: { dutch: "Ik draag sokken.", meaning: lt("我穿袜子。", "I wear socks.") },
  },
  schoenen: {
    article: "de",
    plural: "schoenen",
    meaning: lt("鞋", "shoes"),
    memoryHook: lt("schoenen 里的 oe 要按荷兰语读；穿搭场景里和 sokken、broek、jas 一起记。", "The oe in schoenen is a Dutch sound; connect it with socks, pants, and coats."),
    englishBridge: "clothing word for shoes.",
    phraseChunks: ["de schoenen", "Ik draag schoenen.", "Mijn schoenen zijn zwart."],
    relatedWords: ["sok", "broek", "jas", "trui"],
    exampleSentence: { dutch: "Ik draag schoenen.", meaning: lt("我穿鞋。", "I wear shoes.") },
  },
  wanneer: {
    meaning: lt("什么时候", "when"),
    memoryHook: lt("wanneer 专门问时间：什么时候？和 waar（哪里）对比记。", "wanneer asks time: when? Contrast it with waar, where."),
    englishBridge: "wanneer means when.",
    phraseChunks: ["Wanneer kan ik langskomen?", "Wanneer begint de les?", "Wanneer komt de trein?"],
    relatedWords: ["waar", "hoe laat", "tijd", "afspraak"],
    exampleSentence: { dutch: "Wanneer kan ik langskomen?", meaning: lt("我什么时候可以过来？", "When can I come by?") },
  },
  waar: {
    meaning: lt("哪里", "where"),
    memoryHook: lt("waar 问地点；wanneer 问时间。先把 waar/wanneer 分清。", "waar asks place; wanneer asks time. Separate waar/wanneer early."),
    englishBridge: "waar means where.",
    phraseChunks: ["Waar woon jij?", "Waar is het station?", "Waar kom jij vandaan?"],
    relatedWords: ["wanneer", "wie", "wat", "hoe"],
    exampleSentence: { dutch: "Waar is het station?", meaning: lt("车站在哪里？", "Where is the station?") },
  },
  hoeveel: {
    meaning: lt("多少/多少钱", "how much / how many"),
    memoryHook: lt("hoeveel 问数量和价格：多少？多少钱？", "hoeveel asks quantity and price: how many/how much."),
    englishBridge: "hoeveel means how much/how many.",
    phraseChunks: ["Hoeveel kost dit?", "Hoeveel minuten vertraging is er?"],
    relatedWords: ["hoe", "prijs", "minuut", "geld"],
    exampleSentence: { dutch: "Hoeveel kost dit?", meaning: lt("这个多少钱？", "How much does this cost?") },
  },
  morgen: {
    article: "de",
    plural: "morgens",
    meaning: lt("早上/明天", "morning / tomorrow"),
    memoryHook: lt("morgen 有两个常用意思：早上、明天。goedemorgen 里的 morgen 是早上。", "morgen has two common meanings: morning and tomorrow. In goedemorgen it means morning."),
    phraseChunks: ["morgen vroeg", "tot morgen", "Goedemorgen."],
    relatedWords: ["goedemorgen", "middag", "avond", "vandaag"],
    exampleSentence: { dutch: "Tot morgen.", meaning: lt("明天见。", "See you tomorrow.") },
  },
  middag: {
    article: "de",
    plural: "middagen",
    meaning: lt("下午/中午", "afternoon / noon"),
    memoryHook: lt("middag 是一天中间的时间，goedemiddag 就是下午好。", "middag is the middle part of the day; goedemiddag means good afternoon."),
    phraseChunks: ["vanmiddag", "Goedemiddag.", "in de middag"],
    relatedWords: ["goedemiddag", "morgen", "avond"],
    exampleSentence: { dutch: "Goedemiddag.", meaning: lt("下午好。", "Good afternoon.") },
  },
  avond: {
    article: "de",
    plural: "avonden",
    meaning: lt("晚上", "evening"),
    memoryHook: lt("avond 是晚上，goedenavond 就是晚上好。", "avond means evening; goedenavond means good evening."),
    phraseChunks: ["vanavond", "Goedenavond.", "in de avond"],
    relatedWords: ["goedenavond", "morgen", "middag"],
    exampleSentence: { dutch: "Goedenavond.", meaning: lt("晚上好。", "Good evening.") },
  },
  langzaam: {
    meaning: lt("慢一点/慢的", "slowly / slow"),
    memoryHook: lt("听不懂时最有用：langzaam spreken / langzaam herhalen。", "Very useful when you do not understand: langzaam spreken / langzaam herhalen."),
    phraseChunks: ["langzaam spreken", "langzaam herhalen", "Kunt u langzaam spreken?"],
    relatedWords: ["snel", "herhaal", "spreken"],
    exampleSentence: { dutch: "Kunt u langzaam spreken?", meaning: lt("您能慢一点说吗？", "Can you speak slowly?") },
  },
  snel: {
    meaning: lt("快地/快的", "quickly / fast"),
    memoryHook: lt("snel 是快，和 langzaam 成对记。别人说太快时，你需要 langzaam。", "snel means fast; pair it with langzaam. When someone speaks too fast, you need langzaam."),
    phraseChunks: ["te snel", "snel spreken", "De trein is snel."],
    relatedWords: ["langzaam", "trein"],
    exampleSentence: { dutch: "U spreekt te snel.", meaning: lt("您说得太快了。", "You are speaking too fast.") },
  },
  herhaal: {
    meaning: lt("重复", "repeat"),
    memoryHook: lt("herhaal 是“重复一下”的动作，最常用句是 Kunt u dat herhalen?", "herhaal is the action repeat; the most useful sentence is Kunt u dat herhalen?"),
    phraseChunks: ["Kunt u dat herhalen?", "langzaam herhalen", "Herhaal, alstublieft."],
    relatedWords: ["herhaling", "langzaam"],
    exampleSentence: { dutch: "Kunt u dat herhalen?", meaning: lt("您能重复一下吗？", "Can you repeat that?") },
  },
  herhaling: {
    article: "de",
    plural: "herhalingen",
    meaning: lt("重复/复习", "repetition / review"),
    memoryHook: lt("herhaal 是动作，herhaling 是名词：重复、复习。", "herhaal is the action; herhaling is the noun: repetition/review."),
    phraseChunks: ["de herhaling", "een korte herhaling", "Herhaling helpt."],
    relatedWords: ["herhaal", "herhalen"],
    exampleSentence: { dutch: "Herhaling helpt.", meaning: lt("重复练习有帮助。", "Repetition helps.") },
  },
};

const supplementMeaningOverrides: Record<string, LocalizedText> = {
  hand: lt("手", "hand"),
  voet: lt("脚", "foot"),
  arm: lt("手臂", "arm"),
  been: lt("腿", "leg"),
  rug: lt("背", "back"),
  keel: lt("喉咙", "throat"),
  hoofd: lt("头", "head"),
  buik: lt("肚子", "belly / stomach"),
  oor: lt("耳朵", "ear"),
  neus: lt("鼻子", "nose"),
  mond: lt("嘴", "mouth"),
  tand: lt("牙齿", "tooth"),
  verkouden: lt("感冒的", "having a cold"),
  hoesten: lt("咳嗽", "to cough"),
  rusten: lt("休息", "to rest"),
  medicijn: lt("药", "medicine"),
  hoofdpijn: lt("头痛", "headache"),
  buikpijn: lt("肚子痛", "stomach ache"),
  keelpijn: lt("喉咙痛", "sore throat"),
  koorts: lt("发烧", "fever"),
  duizelig: lt("头晕的", "dizzy"),
  misselijk: lt("恶心的", "nauseous"),
  moe: lt("累的", "tired"),
  wond: lt("伤口", "wound"),
  allergie: lt("过敏", "allergy"),
  bloeddruk: lt("血压", "blood pressure"),
  benauwd: lt("胸闷/呼吸困难", "short of breath"),
  salaris: lt("工资", "salary"),
  loonstrook: lt("工资单", "payslip"),
  proeftijd: lt("试用期", "probation period"),
  afwezigheid: lt("缺勤", "absence"),
  uitzendbureau: lt("派遣公司", "employment agency"),
  waterrekening: lt("水费账单", "water bill"),
  herinnering: lt("提醒/催缴信", "reminder"),
  herstel: lt("恢复/修复", "recovery / repair"),
  verlof: lt("请假/休假", "leave"),
  herhaal: lt("重复", "repeat"),
  herhalen: lt("重复", "repeat"),
  herhaling: lt("重复/复习", "repetition / review"),
  langzaam: lt("慢一点/慢的", "slowly / slow"),
  snel: lt("快地/快的", "quickly / fast"),
  tram: lt("电车", "tram"),
  metro: lt("地铁", "metro"),
  route: lt("路线", "route"),
  perron: lt("站台", "platform"),
  auto: lt("汽车", "car"),
  dorp: lt("村镇", "village"),
  sneeuw: lt("雪", "snow"),
  plaats: lt("地方/位置", "place"),
  hobby: lt("爱好", "hobby"),
  muziek: lt("音乐", "music"),
  film: lt("电影", "film"),
  sport: lt("运动", "sport"),
  weekend: lt("周末", "weekend"),
  email: lt("电子邮件", "email"),
  buurman: lt("男邻居", "male neighbor"),
  buurvrouw: lt("女邻居", "female neighbor"),
  vriend: lt("朋友", "friend"),
  vriendin: lt("女性朋友/女友", "female friend / girlfriend"),
  persoon: lt("人", "person"),
  Amsterdam: lt("阿姆斯特丹", "Amsterdam"),
  Rotterdam: lt("鹿特丹", "Rotterdam"),
  Utrecht: lt("乌得勒支", "Utrecht"),
  "Den Haag": lt("海牙", "The Hague"),
  opa: lt("爷爷/外公", "grandfather"),
  oma: lt("奶奶/外婆", "grandmother"),
  trap: lt("楼梯", "stairs"),
  dak: lt("屋顶", "roof"),
  sleutel: lt("钥匙", "key"),
  kopje: lt("小杯子", "small cup"),
  kip: lt("鸡肉/鸡", "chicken"),
  vis: lt("鱼", "fish"),
  banaan: lt("香蕉", "banana"),
  soep: lt("汤", "soup"),
  salade: lt("沙拉", "salad"),
  korting: lt("折扣", "discount"),
  doos: lt("盒子", "box"),
  cent: lt("分", "cent"),
  bedrag: lt("金额", "amount"),
  betaling: lt("付款", "payment"),
  wisselgeld: lt("找零", "change"),
  reis: lt("旅行/行程", "journey / trip"),
  student: lt("学生", "student"),
  China: lt("中国", "China"),
  Nederland: lt("荷兰", "the Netherlands"),
  stad: lt("城市", "city"),
  taal: lt("语言", "language"),
  Chinees: lt("中文", "Chinese"),
  Engels: lt("英语", "English"),
  Nederlands: lt("荷兰语", "Dutch"),
  dag: lt("天/日子", "day"),
  kind: lt("孩子", "child"),
  man: lt("男人/丈夫", "man / husband"),
  vrouw: lt("女人/妻子", "woman / wife"),
  deur: lt("门", "door"),
  geld: lt("钱", "money"),
  kaart: lt("卡/地图", "card / map"),
  rekening: lt("账单/账户", "bill / account"),
  morgen: lt("早上/明天", "morning / tomorrow"),
  middag: lt("下午", "afternoon"),
  avond: lt("晚上", "evening"),
  goedemiddag: lt("下午好", "good afternoon"),
  goedenavond: lt("晚上好", "good evening"),
  controle: lt("检查/复查", "check / follow-up"),
  urgentie: lt("紧急程度", "urgency"),
  dossier: lt("档案", "file / record"),
  voorraad: lt("库存", "stock"),
  gebruik: lt("使用", "use"),
  storing: lt("故障", "malfunction"),
  openstaand: lt("未付的/未处理的", "outstanding / open"),
  terugbetaling: lt("退款/退还", "repayment / refund"),
  verzekeraar: lt("保险公司", "insurer"),
  doorverbinden: lt("转接电话", "connect/transfer a call"),
  bereikbaar: lt("联系得到的", "reachable"),
  tijdstip: lt("时间点", "time slot"),
  datum: lt("日期", "date"),
  verkeerd: lt("错误的/不对的", "wrong"),
  schoolarts: lt("学校医生", "school doctor"),
  wijkteam: lt("社区支持团队", "neighborhood support team"),
  inburgering: lt("融入/入籍融入过程", "integration / civic integration"),
  taalcursus: lt("语言课程", "language course"),
  gemeenteloket: lt("市政服务窗口", "municipal counter"),
  ander: lt("另一个/其他的", "other / another"),
  helaas: lt("很遗憾", "unfortunately"),
  medewerker: lt("工作人员", "employee / staff member"),
  noodgeval: lt("紧急情况", "emergency"),
  steun: lt("支持/帮助", "support"),
  "vorige week": lt("上周", "last week"),
  gebeurd: lt("发生了", "happened"),
  gevallen: lt("摔倒了/落下了", "fallen"),
  gebeld: lt("打过电话了", "called"),
  gekregen: lt("收到/得到了", "received / got"),
  gestuurd: lt("发送了", "sent"),
  betaald: lt("支付了", "paid"),
  verloren: lt("丢失了", "lost"),
  gewacht: lt("等过了", "waited"),
};

const uniqueStrings = (items: Array<string | undefined>) =>
  Array.from(new Set(items.map((item) => item?.trim()).filter(Boolean) as string[]));

const safeGeneratedExamplesFor = (word: WordItem) =>
  generateExamplesForWord(word).filter(isTrustedGeneratedExample);

const preferredGeneratedExample = (word: WordItem) => {
  const examples = safeGeneratedExamplesFor(word);
  return examples.find((example) => example.type === "output") ?? examples.find((example) => example.type === "collocation") ?? examples[0];
};

const generatedPhraseChunksFor = (word: WordItem) =>
  uniqueStrings(safeGeneratedExamplesFor(word).map((example) => example.phraseChunkUsed));

const wordToItem = (word: SmartWord): WordItem => {
  const override = supplementOverrides[word.dutch] ?? curatedWordOverrides[word.dutch];
  const actionExample = actionExampleFor(word.dutch);
  const scenarioTags = scenarioTagsFor(word.level, word.scenarioTags[0] ?? "daily");
  const examRelevance = examRelevanceFor(word.level, scenarioTags);
  const article = override?.article ?? word.article;
  const meaning = override?.meaning ?? word.meaning;
  const phraseChunks = override?.phraseChunks ?? (actionExample
    ? [actionExample.phrase, actionExample.sentence, actionExample.command].filter(Boolean) as string[]
    : ([
        word.commonPhrase?.dutch,
        primaryUsableSentenceFor({
          dutch: word.dutch,
          article,
          phraseChunks: word.commonPhrase?.dutch ? [word.commonPhrase.dutch] : [],
          exampleSentence: override?.exampleSentence ?? word.exampleSentence,
        }),
      ].filter(Boolean) as string[]));
  const exampleSentence = override?.exampleSentence ?? (
    primaryUsableSentenceFor({
      dutch: word.dutch,
      article,
      phraseChunks,
      exampleSentence: word.exampleSentence,
      theme: word.scenarioTags[0],
      scenarioTags,
    })
      ? {
          dutch: primaryUsableSentenceFor({
            dutch: word.dutch,
            article,
            phraseChunks,
            exampleSentence: word.exampleSentence,
            theme: word.scenarioTags[0],
            scenarioTags,
          }),
          meaning: meaningForUsableSentence(primaryUsableSentenceFor({
            dutch: word.dutch,
            article,
            phraseChunks,
            exampleSentence: word.exampleSentence,
            theme: word.scenarioTags[0],
            scenarioTags,
          })),
        }
      : word.exampleSentence
  );
  const memoryHook = override?.memoryHook ??
    (looksLikeBadMemoryHook(lt(word.chineseMemoryHook, word.smartAssociation.en))
      ? fallbackMemoryHookFor(word.dutch, meaning, article, exampleSentence.dutch)
      : lt(word.chineseMemoryHook, word.smartAssociation.en));
  const englishBridge = looksLikeBadEnglishBridge(override?.englishBridge ?? word.englishBridge)
    ? undefined
    : override?.englishBridge ?? word.englishBridge;
  return applyContentOverride(normalizeGeneratedContent({
    id: word.id,
    level: word.level,
    originalLevel: word.level,
    appearsInLevels: [...appearsInLevelsFor(word.level)],
    dutch: word.dutch,
    article,
    plural: override?.plural ?? (article ? pluralize(word.dutch) : undefined),
    meaning,
    theme: word.scenarioTags[0] ?? "daily",
    priority: word.level === "A2" ? "should" : "must",
    activeOrPassive: word.dutch.length > 16 ? "recognition" : "active",
    examRelevance,
    levelConfidence: word.level === "A2" && examRelevance !== "high" ? "medium" : "high",
    sourceTags: sourceTagsFor(word.level, false, scenarioTags),
    scenarioTags,
    levelReason: levelReasonFor(word.level, scenarioTags, false),
    reviewStatus: "approved",
    memoryHook,
    englishBridge,
    phraseChunks,
    relatedWords: override?.relatedWords ?? word.relatedWords,
    memoryLinks: override?.memoryLinks,
    exampleSentence,
    audioText: word.dutch,
  }), override);
};

const syllabusWordToItem = (
  level: CourseLevel,
  theme: { id: string; title: LocalizedText; coreWords: SyllabusVocabularyWord[] },
  entry: SyllabusVocabularyWord,
  index: number,
): WordItem => {
  const override = supplementOverrides[entry.dutch] ?? curatedWordOverrides[entry.dutch];
  const article = override?.article ?? entry.article ?? articleFor(entry.dutch);
  const scenarioTags = scenarioTagsFor(level, theme.id);
  const examRelevance = examRelevanceFor(level, scenarioTags);
  const priority = entry.priority ?? (level === "A2" ? "should" : "must");
  const actionExample = actionExampleFor(entry.dutch);
  const passive =
    level === "A2" &&
    (priority === "nice" || entry.dutch.length > 18 || entry.dutch.includes(" ") || ["bezwaar", "besluit", "dekking", "vergunning"].includes(entry.dutch));

  const draft: WordItem = {
    id: `syllabus-${level.toLowerCase()}-${slugFor(theme.id)}-${index + 1}-${slugFor(entry.dutch)}`,
    level,
    originalLevel: level,
    appearsInLevels: [...appearsInLevelsFor(level)],
    dutch: entry.dutch,
    article,
    plural: override?.plural ?? (article ? pluralize(entry.dutch) : undefined),
    meaning: override?.meaning ?? entry.meaning,
    theme: theme.id,
    priority,
    activeOrPassive: passive ? "recognition" : "active",
    examRelevance,
    levelConfidence: "high",
    sourceTags: sourceTagsFor(level, false, scenarioTags),
    scenarioTags,
    levelReason: levelReasonFor(level, scenarioTags, false),
    reviewStatus: "approved",
    memoryHook:
      override?.memoryHook ??
      (entry.notesForChineseLearners
        ? lt(entry.notesForChineseLearners, `Use ${entry.dutch} in the ${theme.title.en.toLowerCase()} scene.`)
        : article
          ? lt(`整块记 ${article} ${entry.dutch}，再放进 ${theme.title.zh} 场景。`, `Remember ${article} ${entry.dutch} as one chunk, then use it in ${theme.title.en}.`)
          : lt(`把 ${entry.dutch} 放进 ${theme.title.zh} 场景里记。`, `Learn ${entry.dutch} inside the ${theme.title.en} scene.`)),
    englishBridge: override?.englishBridge,
    phraseChunks:
      override?.phraseChunks ??
      (actionExample
        ? uniqueStrings([actionExample.phrase, actionExample.sentence, actionExample.command])
        : article
          ? [`${article} ${entry.dutch}`]
          : []),
    relatedWords: override?.relatedWords ?? nearbyRelatedWords(theme.coreWords.map((word) => word.dutch), entry.dutch),
    memoryLinks: override?.memoryLinks,
    exampleSentence:
      override?.exampleSentence ??
      (actionExample
        ? { dutch: actionExample.sentence, meaning: entry.meaning }
        : emptyExampleSentence()),
    audioText: entry.dutch,
  };

  const generatedExample = preferredGeneratedExample(draft);
  const generatedPhrases = generatedPhraseChunksFor(draft);

  return applyContentOverride(normalizeGeneratedContent({
    ...draft,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : draft.phraseChunks),
    exampleSentence: override?.exampleSentence ?? (generatedExample
      ? {
          dutch: generatedExample.dutch,
          meaning: lt(generatedExample.meaningZh, generatedExample.meaningEn),
        }
      : draft.exampleSentence),
  }), override);
};

const publicAdditionToItem = (
  theme: PublicVocabularyTheme,
  entry: PublicVocabularyEntry,
  index: number,
): WordItem => {
  const [dutch, zh, en, providedArticle] = entry;
  const override = supplementOverrides[dutch] ?? curatedWordOverrides[dutch];
  const article = override?.article ?? providedArticle ?? articleFor(dutch);
  const scenarioTags = scenarioTagsFor(theme.level, theme.theme);
  const examRelevance = examRelevanceFor(theme.level, scenarioTags);
  const actionExample = actionExampleFor(dutch);
  const meaning = override?.meaning ?? lt(zh, en);
  const passive =
    (theme.level === "A2" && (dutch.length > 20 || dutch.includes(" ") && !actionExample)) ||
    (theme.level === "B1" && (dutch.length > 24 || dutch.split(/\s+/).length > 4));

  const draft: WordItem = {
    id: `public-${theme.level.toLowerCase()}-${slugFor(theme.theme)}-${index + 1}-${slugFor(dutch)}`,
    level: theme.level,
    originalLevel: theme.level,
    appearsInLevels: [...appearsInLevelsFor(theme.level)],
    dutch,
    article,
    plural: override?.plural ?? (article ? pluralize(dutch) : undefined),
    meaning,
    theme: theme.theme,
    priority: passive ? "should" : "must",
    activeOrPassive: passive ? "recognition" : "active",
    examRelevance,
    levelConfidence: theme.theme.includes("refinement") && (theme.level === "A1" || theme.level === "A2") ? "high" : "medium",
    sourceTags: sourceTagsFor(theme.level, false, scenarioTags),
    scenarioTags,
    levelReason: theme.level === "B1"
      ? lt(
          `按 Staatsexamen Nt2 Programma I 的工作、学习和日常公共信息范围补入 ${theme.titleZh} 场景。`,
          `Added to the ${theme.titleEn} scene from the Staatsexamen Nt2 Programma I work, study, and public-life scope.`,
        )
      : lt(
          `参考公开 A1/A2 教程主题和词典校正后补入 ${theme.titleZh} 场景。`,
          `Added to the ${theme.titleEn} scene from public A1/A2 tutorial themes with dictionary-style spelling checks.`,
        ),
    reviewStatus: "approved",
    memoryHook:
      override?.memoryHook ??
      (article
        ? lt(`整块记 ${article} ${dutch}，再放进 ${theme.titleZh} 场景。`, `Remember ${article} ${dutch} as one chunk, then use it in ${theme.titleEn}.`)
        : lt(`把 ${dutch} 放进 ${theme.titleZh} 场景里记。`, `Learn ${dutch} inside the ${theme.titleEn} scene.`)),
    englishBridge: override?.englishBridge,
    phraseChunks:
      override?.phraseChunks ??
      (actionExample
        ? uniqueStrings([actionExample.phrase, actionExample.sentence, actionExample.command])
        : article
          ? [`${article} ${dutch}`]
          : []),
    relatedWords: override?.relatedWords ?? (shouldUseAutomaticNearbyRelations(theme.level, theme.theme)
      ? nearbyRelatedWords(theme.entries.map(([word]) => word), dutch)
      : []),
    memoryLinks: override?.memoryLinks,
    exampleSentence:
      override?.exampleSentence ??
      (actionExample
        ? { dutch: actionExample.sentence, meaning }
        : emptyExampleSentence()),
    audioText: dutch,
  };

  const generatedExample = preferredGeneratedExample(draft);
  const generatedPhrases = generatedPhraseChunksFor(draft);

  return applyContentOverride(normalizeGeneratedContent({
    ...draft,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : draft.phraseChunks),
    exampleSentence: override?.exampleSentence ?? (generatedExample
      ? {
          dutch: generatedExample.dutch,
          meaning: lt(generatedExample.meaningZh, generatedExample.meaningEn),
        }
      : draft.exampleSentence),
  }), override);
};

type ThemeSeed = {
  theme: string;
  zh: string;
  en: string;
  words: string[];
};

const a1Themes: ThemeSeed[] = [
  { theme: "self-introduction", zh: "自我介绍", en: "self introduction", words: ["voornaam", "achternaam", "leeftijd", "adres", "telefoon", "email", "student", "buurman", "buurvrouw", "vriend", "vriendin", "persoon"] },
  { theme: "countries-cities-languages", zh: "国家城市语言", en: "countries, cities, languages", words: ["China", "Nederland", "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "stad", "dorp", "taal", "Chinees", "Engels", "Nederlands"] },
  { theme: "time-date", zh: "时间日期", en: "time and date", words: ["uur", "minuut", "dag", "week", "maand", "jaar", "morgen", "avond", "vandaag", "gisteren", "maandag", "vrijdag"] },
  { theme: "family", zh: "家庭", en: "family", words: ["vader", "moeder", "broer", "zus", "zoon", "dochter", "ouders", "kind", "man", "vrouw", "opa", "oma"] },
  { theme: "home-rooms", zh: "家和房间", en: "home and rooms", words: ["kamer", "keuken", "badkamer", "slaapkamer", "deur", "raam", "vloer", "muur", "tuin", "trap", "dak", "sleutel"] },
  { theme: "objects", zh: "基础物品", en: "basic objects", words: ["tafel", "stoel", "bed", "bank", "lamp", "kast", "tas", "boek", "pen", "telefoon", "computer", "kopje"] },
  { theme: "food-drinks", zh: "食物饮料", en: "food and drinks", words: ["brood", "kaas", "melk", "koffie", "thee", "rijst", "kip", "vis", "appel", "aardappel", "sinaasappel", "appelsap", "banaan", "soep", "salade"] },
  { theme: "supermarket", zh: "超市", en: "supermarket", words: ["winkel", "mandje", "kassa", "bon", "prijs", "korting", "zak", "fles", "pak", "doos", "gram", "kilo"] },
  { theme: "money-payment", zh: "钱和付款", en: "money and payment", words: ["geld", "kaart", "pinpas", "contant", "euro", "cent", "rekening", "bedrag", "betaling", "wisselgeld", "goedkoop", "duur"] },
  { theme: "transport", zh: "交通", en: "transport", words: ["bus", "tram", "metro", "trein", "station", "halte", "perron", "fiets", "auto", "kaartje", "reis", "route"] },
  { theme: "weather", zh: "天气和衣服", en: "weather and clothes", words: ["weer", "zon", "regen", "wind", "sneeuw", "koud", "warm", "nat", "droog", "jas", "trui", "broek", "sok", "schoenen"] },
  { theme: "routine", zh: "日常作息", en: "daily routine", words: ["opstaan", "slapen", "eten", "drinken", "werken", "leren", "kijken", "lopen", "koken", "wassen", "lezen", "schrijven", "bellen"] },
  { theme: "school-work", zh: "学校工作", en: "school and work", words: ["les", "klas", "docent", "cursus", "werk", "collega", "baas", "baan", "pauze", "rooster", "taak", "afspraak"] },
  { theme: "health", zh: "简单健康", en: "simple health", words: ["ziek", "beter", "pijn", "hoofd", "buik", "hand", "voet", "dokter", "huisarts", "tandarts", "apotheek", "medicijn"] },
  { theme: "directions", zh: "方向地点", en: "directions and locations", words: ["links", "rechts", "rechtdoor", "naast", "tegenover", "achter", "voor", "boven", "beneden", "dichtbij", "ver", "plaats"] },
  { theme: "preferences", zh: "喜好选择", en: "hobbies and preferences", words: ["leuk", "mooi", "lekker", "makkelijk", "moeilijk", "langzaam", "snel", "graag", "liever", "hobby", "muziek", "film", "sport", "wandelen"] },
  { theme: "appointments", zh: "简单约时间", en: "simple appointments", words: ["tijd", "datum", "morgen", "middag", "avond", "weekend", "komen", "gaan", "wachten", "later", "vroeg", "laat"] },
  { theme: "questions", zh: "基础问答", en: "basic questions", words: ["wie", "wat", "waar", "wanneer", "hoe", "hoeveel", "waarom", "welke", "dit", "dat", "hier", "daar", "herhaal", "herhaling"] },
];

const a2Themes: ThemeSeed[] = [
  { theme: "gp", zh: "家庭医生", en: "GP", words: ["huisarts", "assistente", "spreekuur", "afspraak", "klacht", "onderzoek", "verwijzing", "recept", "wachtkamer", "controle", "urgentie", "dossier"] },
  { theme: "pharmacy", zh: "药房", en: "pharmacy", words: ["apotheek", "medicijn", "tablet", "zalf", "druppels", "bijwerking", "dosis", "receptnummer", "verzekering", "herhaalrecept", "voorraad", "gebruik"] },
  { theme: "body-symptoms", zh: "身体症状", en: "body and symptoms", words: ["hoofdpijn", "buikpijn", "keelpijn", "koorts", "hoesten", "duizelig", "misselijk", "moe", "wond", "allergie", "bloeddruk", "benauwd"] },
  { theme: "municipality", zh: "市政厅", en: "municipality", words: ["gemeente", "balie", "loket", "inschrijving", "verhuizing", "uittreksel", "paspoort", "rijbewijs", "afdeling", "aanvraag", "bewijs", "afspraakbevestiging"] },
  { theme: "forms-documents", zh: "表格文件", en: "forms and documents", words: ["formulier", "handtekening", "geboortedatum", "achternaam", "voornaam", "nationaliteit", "adres", "postcode", "kopie", "bijlage", "document", "verklaring"] },
  { theme: "housing-rent", zh: "住房租房", en: "housing and rent", words: ["woning", "huur", "huurcontract", "borg", "verhuurder", "huurder", "kamer", "servicekosten", "huurtoeslag", "opzegtermijn", "sleuteloverdracht", "bezichtiging"] },
  { theme: "repairs-complaints", zh: "维修投诉", en: "repairs and complaints", words: ["reparatie", "lekkage", "schimmel", "verwarming", "storing", "monteur", "onderhoud", "klacht", "melding", "spoed", "kapot", "overlast"] },
  { theme: "work-sick-leave", zh: "工作请病假", en: "work and sick leave", words: ["ziekmelding", "leidinggevende", "collega", "dienst", "rooster", "verlof", "salaris", "loonstrook", "contract", "proeftijd", "afwezigheid", "herstel"] },
  { theme: "transport-delays", zh: "交通延误", en: "transport delays", words: ["vertraging", "uitval", "perron", "spoor", "overstap", "omleiding", "dienstregeling", "conducteur", "reisinformatie", "kaartcontrole", "boete", "vervangend vervoer"] },
  { theme: "bills-payments", zh: "账单付款", en: "bills and payments", words: ["rekening", "factuur", "bedrag", "betaaldatum", "incasso", "termijn", "aanmaning", "betalingsregeling", "kenmerk", "openstaand", "terugbetaling", "bewijs"] },
  { theme: "insurance", zh: "保险", en: "insurance", words: ["verzekering", "zorgpas", "polis", "premie", "eigen risico", "dekking", "declaratie", "vergoeding", "verzekeraar", "zorgkosten", "pakket", "wijziging"] },
  { theme: "official-letters", zh: "官方信件", en: "official letters", words: ["brief", "bericht", "kenmerk", "reactie", "termijn", "besluit", "bezwaar", "aanvraag", "uitnodiging", "herinnering", "bijlage", "informatie"] },
  { theme: "emails-messages", zh: "邮件消息", en: "emails and messages", words: ["e-mail", "onderwerp", "aanhef", "groet", "antwoord", "bericht", "bijlage", "bevestiging", "vraag", "verzoek", "afzender", "ontvanger"] },
  { theme: "phone-calls", zh: "电话沟通", en: "phone calls", words: ["bellen", "telefoonnummer", "doorverbinden", "wachten", "herhalen", "bericht inspreken", "lijn", "contact", "bereikbaar", "terugbellen", "noteren", "vragen"] },
  { theme: "appointments", zh: "预约", en: "appointments", words: ["afspraak", "beschikbaar", "langskomen", "verplaatsen", "annuleren", "bevestigen", "tijdstip", "datum", "agenda", "wachttijd", "balie", "melding"] },
  { theme: "help", zh: "求助", en: "asking for help", words: ["helpen", "hulp", "probleem", "uitleg", "uitleggen", "advies", "informatie", "formulier", "vraag", "vragen", "antwoord", "oplossing", "medewerker", "klantenservice", "noodgeval", "steun"] },
  { theme: "explaining-problems", zh: "解释问题", en: "explaining problems", words: ["probleem", "oorzaak", "gevolg", "situatie", "fout", "verkeerd", "duidelijk", "onduidelijk", "mogelijk", "nodig", "belangrijk", "dringend"] },
  { theme: "past-events", zh: "过去发生的事", en: "past events", words: ["gisteren", "vorige week", "gebeurd", "gevallen", "gebeld", "gekregen", "gestuurd", "betaald", "vergeten", "gevonden", "verloren", "gewacht"] },
  { theme: "society", zh: "实用荷兰社会", en: "practical Dutch society", words: ["belasting", "toeslag", "opvang", "schoolarts", "wijkteam", "bibliotheek", "inburgering", "taalcursus", "gemeenteloket", "afval", "vergunning", "veiligheid"] },
  { theme: "changes-cancel", zh: "改约取消", en: "changing or canceling", words: ["wijzigen", "annuleren", "verzetten", "bevestigen", "afzeggen", "nieuw", "ander", "later", "eerder", "mogelijk", "helaas", "opnieuw"] },
];

const b1Themes: ThemeSeed[] = publicVocabularyAdditions
  .filter((theme) => theme.level === "B1")
  .map((theme) => ({
    theme: theme.theme,
    zh: theme.titleZh,
    en: theme.titleEn,
    words: theme.entries.map(([word]) => word),
  }));

const articleFor = (word: string): "de" | "het" | undefined => {
  const knownArticles: Record<string, "de" | "het"> = {
    appel: "de",
    aardappel: "de",
    sinaasappel: "de",
    appelsap: "het",
    sap: "het",
    minuut: "de",
    uur: "het",
    morgen: "de",
    middag: "de",
    avond: "de",
    week: "de",
    maand: "de",
    jaar: "het",
    tijd: "de",
    datum: "de",
    jas: "de",
    trui: "de",
    broek: "de",
    sok: "de",
    schoenen: "de",
    boek: "het",
    pen: "de",
    tas: "de",
    telefoon: "de",
    tafel: "de",
    stoel: "de",
    bed: "het",
    lamp: "de",
    kast: "de",
    computer: "de",
    kopje: "het",
    tram: "de",
    metro: "de",
    route: "de",
    perron: "het",
    auto: "de",
    dorp: "het",
    sneeuw: "de",
    plaats: "de",
    hobby: "de",
    muziek: "de",
    film: "de",
    sport: "de",
    weekend: "het",
    email: "de",
    buurman: "de",
    buurvrouw: "de",
    vriend: "de",
    vriendin: "de",
    persoon: "de",
    opa: "de",
    oma: "de",
    trap: "de",
    dak: "het",
    sleutel: "de",
    kip: "de",
    vis: "de",
    banaan: "de",
    soep: "de",
    salade: "de",
    korting: "de",
    doos: "de",
    cent: "de",
    bedrag: "het",
    betaling: "de",
    wisselgeld: "het",
    reis: "de",
    student: "de",
    stad: "de",
    taal: "de",
    dag: "de",
    kind: "het",
    man: "de",
    vrouw: "de",
    deur: "de",
    geld: "het",
    kaart: "de",
    rekening: "de",
    herhaling: "de",
  };
  if (knownArticles[word]) return knownArticles[word];
  if (word.includes(" ")) return undefined;
  if (word.endsWith("je") || word.endsWith("ment") || word.endsWith("sel") || word === "bewijs" || word === "formulier") return "het";
  if (word.endsWith("ing") || word.endsWith("heid") || word.endsWith("tie") || word.endsWith("ie") || word.endsWith("teit")) return "de";
  return undefined;
};

const supplementOverrides: Record<string, WordContentOverride> = {
  planning: {
    article: "de",
    meaning: lt("计划 / 排班", "planning / schedule"),
    theme: "b1-workplace-communication",
    scenarioTags: ["work", "schedule", "workplace"],
    levelReason: lt(
      "B1 职场沟通中常用来说明排班、任务安排和时间协调。",
      "Useful at B1 for workplace schedules, task planning, and coordination.",
    ),
    memoryHook: lt(
      "planning 不要只当英文 planning 记：先连 plan（计划）和 plannen（安排），再放进 werkplanning/rooster 的场景。",
      "Do not learn planning only through English; connect it to plan and plannen, then use it in work schedules.",
    ),
    phraseChunks: ["de planning", "de planning afstemmen", "een planning maken"],
    relatedWords: ["plan", "plannen", "rooster", "taakverdeling", "afstemmen", "werkoverleg"],
    memoryLinks: [
      memoryLink("plan", "verb-noun-pair", "plan 是名词“计划”，planning 是排好的计划/排班。", "plan is the noun plan; planning is the resulting schedule."),
      memoryLink("plannen", "verb-noun-pair", "plannen 是动词“计划/安排”，planning 是安排出来的表。", "plannen is the verb to plan/schedule; planning is the resulting planning."),
      memoryLink("rooster", "scenario-neighbor", "工作或学习里，planning 常落到具体 rooster（排班表/课表）上。", "At work or school, planning often becomes a concrete rooster/schedule."),
      memoryLink("taakverdeling", "scenario-neighbor", "planning 常决定谁做什么，taakverdeling 就是任务怎么分。", "Planning often decides who does what; taakverdeling is the task division."),
      memoryLink("afstemmen", "action-object", "B1 职场里常说 de planning afstemmen：协调计划。", "At B1 workplace level, de planning afstemmen means coordinate the planning."),
    ],
    exampleSentence: { dutch: "Ik stem de planning af met mijn team.", meaning: lt("我和团队协调计划。", "I coordinate the planning with my team.") },
  },
  vakantie: {
    article: "de",
    plural: "vakanties",
    meaning: lt("假期", "holiday / vacation"),
    memoryHook: lt("vakantie 先和 op vakantie gaan、vakantie hebben 一起记：一个是去度假，一个是放假。", "Learn vakantie with op vakantie gaan and vakantie hebben: going on holiday and having time off."),
    phraseChunks: ["op vakantie gaan", "vakantie hebben", "De vakantie begint maandag."],
    relatedWords: ["zomer", "weekend", "vrij", "reizen"],
    memoryLinks: [
      memoryLink("vrij", "scenario-neighbor", "vakantie 常和 vrij 放在一起：不上学/不上班的时间。", "vakantie often connects with vrij: time off from school or work."),
      memoryLink("reizen", "scenario-neighbor", "去外地度假时会用 reizen。", "When going away for a holiday, reizen is nearby."),
    ],
    exampleSentence: { dutch: "Ik heb vakantie.", meaning: lt("我放假。", "I am on holiday.") },
  },
  duwen: {
    meaning: lt("推", "push"),
    memoryHook: lt("门上常见 Duwen/Trekken：duwen 是推，trekken 是拉。先按门口标识记。", "On doors you often see Duwen/Trekken: duwen is push, trekken is pull. Learn it from door signs first."),
    phraseChunks: ["tegen de deur duwen", "Duw tegen de deur.", "duwen en trekken"],
    relatedWords: ["trekken", "deur", "ingang", "uitgang"],
    memoryLinks: [
      memoryLink("trekken", "opposite", "duwen 是推，trekken 是拉，公共标识里常成对出现。", "duwen is push; trekken is pull. They often appear together on public signs."),
      memoryLink("deur", "action-object", "最自然的动作对象是 deur：推门。", "The natural object is deur: push a door."),
    ],
    exampleSentence: { dutch: "Duw tegen de deur.", meaning: lt("推这扇门。", "Push against the door.") },
  },
  trekken: {
    meaning: lt("拉", "pull"),
    memoryHook: lt("门上常见 Duwen/Trekken：trekken 是拉，duwen 是推。先按门口标识记。", "On doors you often see Duwen/Trekken: trekken is pull, duwen is push. Learn it from door signs first."),
    phraseChunks: ["aan de deur trekken", "Trek aan de deur.", "duwen en trekken"],
    relatedWords: ["duwen", "deur", "ingang", "uitgang"],
    memoryLinks: [
      memoryLink("duwen", "opposite", "trekken 是拉，duwen 是推，公共标识里常成对出现。", "trekken is pull; duwen is push. They often appear together on public signs."),
      memoryLink("deur", "action-object", "最自然的动作对象是 deur：拉门。", "The natural object is deur: pull a door."),
    ],
    exampleSentence: { dutch: "Trek aan de deur.", meaning: lt("拉这扇门。", "Pull the door.") },
  },
  volgnummer: {
    article: "het",
    plural: "volgnummers",
    meaning: lt("排队号码", "queue number"),
    memoryHook: lt("volg + nummer：按顺序叫到的号码。办事大厅先看 volgnummer。", "volg + nummer: the number called in order. At a service desk, check your queue number."),
    phraseChunks: ["het volgnummer", "Mijn volgnummer is 34.", "wachten op het volgnummer"],
    relatedWords: ["wachtrij", "aan de beurt", "servicepunt", "informatiebalie"],
    memoryLinks: [
      memoryLink("wachtrij", "scenario-neighbor", "有 volgnummer 通常是因为你在 wachtrij 里等。", "A volgnummer usually belongs to waiting in a queue."),
      memoryLink("aan de beurt", "usage-chunk", "号码叫到时就是 je bent aan de beurt。", "When your number is called, you are aan de beurt."),
    ],
    exampleSentence: { dutch: "Mijn volgnummer is 34.", meaning: lt("我的排队号码是 34。", "My queue number is 34.") },
  },
  wachtrij: {
    article: "de",
    plural: "wachtrijen",
    meaning: lt("队列", "queue"),
    memoryHook: lt("wacht + rij：等待的队伍，就是 wachtrij。", "wacht + rij: a waiting line, a queue."),
    phraseChunks: ["de wachtrij", "in de wachtrij staan", "Er staat een lange wachtrij."],
    relatedWords: ["volgnummer", "aan de beurt", "balie", "servicepunt"],
    memoryLinks: [
      memoryLink("wachten", "compound-part", "wachtrij 里有 wacht：等。", "wachtrij contains wacht: wait."),
      memoryLink("volgnummer", "scenario-neighbor", "排队时常先拿 volgnummer。", "In a queue you often take a volgnummer first."),
    ],
    exampleSentence: { dutch: "Er staat een lange wachtrij bij de balie.", meaning: lt("柜台前排了很长的队。", "There is a long queue at the desk.") },
  },
  sluitingstijd: {
    article: "de",
    plural: "sluitingstijden",
    meaning: lt("关闭时间", "closing time"),
    memoryHook: lt("sluiting + tijd：关门的时间。和 openingstijd 成对记。", "sluiting + tijd: the time something closes. Pair it with openingstijd."),
    phraseChunks: ["de sluitingstijd", "voor sluitingstijd", "De sluitingstijd is vijf uur."],
    relatedWords: ["openingstijd", "tijdstip", "afspraak", "servicepunt"],
    memoryLinks: [
      memoryLink("openingstijd", "opposite", "openingstijd 是开门时间，sluitingstijd 是关门时间。", "openingstijd is opening time; sluitingstijd is closing time."),
      memoryLink("tijd", "compound-part", "sluitingstijd 里的 tijd 就是时间。", "sluitingstijd contains tijd: time."),
    ],
    exampleSentence: { dutch: "De sluitingstijd is vijf uur.", meaning: lt("关闭时间是五点。", "The closing time is five o'clock.") },
  },
  servicepunt: {
    article: "het",
    plural: "servicepunten",
    meaning: lt("服务点", "service point"),
    memoryHook: lt("servicepunt 是办事/求助的地点；先整块记 het servicepunt。", "servicepunt is where you go for service or help; remember het servicepunt."),
    phraseChunks: ["het servicepunt", "naar het servicepunt gaan", "Ik vraag hulp bij het servicepunt."],
    relatedWords: ["informatiebalie", "medewerker", "volgnummer", "formulier"],
    memoryLinks: [
      memoryLink("medewerker", "scenario-neighbor", "在 servicepunt 通常会和 medewerker 说话。", "At a servicepunt you usually speak to a staff member."),
      memoryLink("informatiebalie", "synonym", "servicepunt 和 informatiebalie 都是问事/办事地点。", "servicepunt and informatiebalie are both places to ask for help or information."),
    ],
    exampleSentence: { dutch: "Ik vraag hulp bij het servicepunt.", meaning: lt("我在服务点寻求帮助。", "I ask for help at the service point.") },
  },
  informatiebalie: {
    article: "de",
    plural: "informatiebalies",
    meaning: lt("信息柜台", "information desk"),
    memoryHook: lt("informatie + balie：问信息的柜台。办事大厅里很常见。", "informatie + balie: the desk for asking information. Common in public-service buildings."),
    phraseChunks: ["de informatiebalie", "bij de informatiebalie", "Ik vraag het bij de informatiebalie."],
    relatedWords: ["servicepunt", "balie", "medewerker", "informatie"],
    memoryLinks: [
      memoryLink("informatie", "compound-part", "informatiebalie 里有 informatie：信息。", "informatiebalie contains informatie: information."),
      memoryLink("balie", "compound-part", "informatiebalie 的地点是 balie：柜台。", "The place part in informatiebalie is balie: desk/counter."),
    ],
    exampleSentence: { dutch: "Ik vraag het bij de informatiebalie.", meaning: lt("我在信息柜台询问这件事。", "I ask about it at the information desk.") },
  },
  dinsdag: {
    article: "de",
    plural: "dinsdagen",
    memoryHook: lt("dinsdag 是星期二；和 maandag、woensdag 按一周顺序连起来。", "dinsdag is Tuesday; connect it with maandag and woensdag in week order."),
    phraseChunks: ["op dinsdag", "Dinsdag werk ik.", "tot dinsdag"],
    relatedWords: ["maandag", "woensdag", "week"],
    memoryLinks: [
      memoryLink("maandag", "time-contrast", "星期按顺序记：maandag 后面就是 dinsdag。", "Learn weekdays in order: maandag comes before dinsdag."),
      memoryLink("woensdag", "time-contrast", "dinsdag 后面接 woensdag，一周顺序会帮你开口。", "woensdag follows dinsdag, so week order helps you speak."),
    ],
    exampleSentence: { dutch: "Dinsdag werk ik.", meaning: lt("星期二我工作。", "I work on Tuesday.") },
  },
  woensdag: {
    article: "de",
    plural: "woensdagen",
    memoryHook: lt("woensdag 是星期三；先和 dinsdag、donderdag 夹在一起记。", "woensdag is Wednesday; place it between dinsdag and donderdag."),
    phraseChunks: ["op woensdag", "Woensdag heb ik les.", "tot woensdag"],
    relatedWords: ["dinsdag", "donderdag", "week"],
    memoryLinks: [
      memoryLink("dinsdag", "time-contrast", "woensdag 前一天是 dinsdag。", "The day before woensdag is dinsdag."),
      memoryLink("donderdag", "time-contrast", "woensdag 后一天是 donderdag。", "The day after woensdag is donderdag."),
    ],
    exampleSentence: { dutch: "Woensdag heb ik les.", meaning: lt("星期三我有课。", "I have class on Wednesday.") },
  },
  donderdag: {
    article: "de",
    plural: "donderdagen",
    memoryHook: lt("donderdag 是星期四；和 woensdag、vrijdag 连成工作周后半段。", "donderdag is Thursday; connect it with woensdag and vrijdag."),
    phraseChunks: ["op donderdag", "Donderdag ga ik naar school.", "tot donderdag"],
    relatedWords: ["woensdag", "vrijdag", "week"],
    memoryLinks: [
      memoryLink("woensdag", "time-contrast", "donderdag 前一天是 woensdag。", "woensdag comes before donderdag."),
      memoryLink("vrijdag", "time-contrast", "donderdag 后面是 vrijdag，接近周末。", "vrijdag follows donderdag, close to the weekend."),
    ],
    exampleSentence: { dutch: "Donderdag ga ik naar school.", meaning: lt("星期四我去学校。", "I go to school on Thursday.") },
  },
  zaterdag: {
    article: "de",
    plural: "zaterdagen",
    memoryHook: lt("zaterdag 是星期六；和 zondag 一起当周末泡泡记。", "zaterdag is Saturday; pair it with zondag as weekend words."),
    phraseChunks: ["op zaterdag", "Zaterdag doe ik boodschappen.", "zaterdag en zondag"],
    relatedWords: ["vrijdag", "zondag", "weekend"],
    memoryLinks: [
      memoryLink("zondag", "time-category", "zaterdag 和 zondag 组成 weekend。", "zaterdag and zondag make the weekend."),
      memoryLink("boodschappen doen", "scenario-neighbor", "周六常见任务是 boodschappen doen。", "A common Saturday task is doing groceries."),
    ],
    exampleSentence: { dutch: "Zaterdag doe ik boodschappen.", meaning: lt("星期六我买菜/采购。", "I do groceries on Saturday.") },
  },
  zondag: {
    article: "de",
    plural: "zondagen",
    memoryHook: lt("zondag 是星期日；和 zaterdag 一起记 weekend。", "zondag is Sunday; learn it with zaterdag as weekend."),
    phraseChunks: ["op zondag", "Zondag ben ik thuis.", "zaterdag en zondag"],
    relatedWords: ["zaterdag", "weekend", "thuis"],
    memoryLinks: [
      memoryLink("zaterdag", "time-category", "zaterdag 和 zondag 是最常见的 weekend 组合。", "zaterdag and zondag are the common weekend pair."),
      memoryLink("thuis", "scenario-neighbor", "周日句子常用 thuis：Zondag ben ik thuis。", "Sunday sentences often use thuis: Zondag ben ik thuis."),
    ],
    exampleSentence: { dutch: "Zondag ben ik thuis.", meaning: lt("星期日我在家。", "I am at home on Sunday.") },
  },
  water: {
    article: "het",
    meaning: lt("水", "water"),
    memoryHook: lt("water 和英语 water 很像；A1 先会说 Ik drink water。", "water looks like English water; at A1, start with Ik drink water."),
    englishBridge: "water looks like English water.",
    phraseChunks: ["water drinken", "een glas water", "Ik drink water."],
    relatedWords: ["drinken", "melk", "thee", "brood"],
    memoryLinks: [
      memoryLink("drinken", "action-object", "water 最常接的动作是 drinken。", "The most useful action with water is drinken."),
      memoryLink("melk", "category-member", "water 和 melk 都是 A1 饮料词。", "water and melk are both A1 drink words."),
    ],
    exampleSentence: { dutch: "Ik drink water.", meaning: lt("我喝水。", "I drink water.") },
  },
  ontbijt: {
    article: "het",
    plural: "ontbijten",
    memoryHook: lt("ontbijt 是早餐；先整块记 het ontbijt，再接 eten。", "ontbijt is breakfast; learn het ontbijt, then connect it with eten."),
    phraseChunks: ["het ontbijt", "ontbijt eten", "Ik eet ontbijt."],
    relatedWords: ["lunch", "avondeten", "brood"],
    memoryLinks: [
      memoryLink("lunch", "time-category", "ontbijt、lunch、avondeten 是一天三餐。", "ontbijt, lunch, and avondeten are the meals of the day."),
      memoryLink("brood", "scenario-neighbor", "A1 早餐场景里 brood 很常见。", "brood is common in an A1 breakfast scene."),
    ],
    exampleSentence: { dutch: "Ik eet ontbijt om acht uur.", meaning: lt("我八点吃早餐。", "I eat breakfast at eight.") },
  },
  lunch: {
    article: "de",
    plural: "lunches",
    memoryHook: lt("lunch 和英语一样；荷兰语里常说 de lunch。", "lunch is like English lunch; in Dutch, learn de lunch."),
    englishBridge: "lunch is the same as English lunch.",
    phraseChunks: ["de lunch", "lunch eten", "Ik neem lunch mee."],
    relatedWords: ["ontbijt", "avondeten", "brood"],
    memoryLinks: [
      memoryLink("ontbijt", "time-category", "lunch 在 ontbijt 后面，是午餐。", "lunch comes after ontbijt."),
      memoryLink("meenemen", "action-object", "常用搭配是 lunch meenemen：带午餐。", "A useful chunk is lunch meenemen: bring lunch."),
    ],
    exampleSentence: { dutch: "Ik neem lunch mee naar school.", meaning: lt("我带午餐去学校。", "I bring lunch to school.") },
  },
  avondeten: {
    article: "het",
    plural: "avondetens",
    memoryHook: lt("avond + eten：晚上 + 吃，就是晚饭。", "avond + eten: evening + eating, so dinner."),
    englishBridge: "avond means evening; eten means eat.",
    phraseChunks: ["het avondeten", "avondeten maken", "Ik maak avondeten."],
    relatedWords: ["avond", "eten", "diner"],
    memoryLinks: [
      memoryLink("avond", "compound-part", "avondeten 里有 avond：晚上。", "avondeten contains avond: evening."),
      memoryLink("eten", "compound-part", "avondeten 里有 eten：吃。", "avondeten contains eten: eating."),
    ],
    exampleSentence: { dutch: "Ik maak avondeten.", meaning: lt("我做晚饭。", "I make dinner.") },
  },
  diner: {
    article: "het",
    plural: "diners",
    memoryHook: lt("diner 比 avondeten 稍正式；A1 先会认“晚餐”。", "diner is a little more formal than avondeten; at A1, recognize it as dinner."),
    englishBridge: "diner looks like dinner.",
    phraseChunks: ["het diner", "na het diner", "Ik eet diner thuis."],
    relatedWords: ["avondeten", "lunch", "eten"],
    memoryLinks: [
      memoryLink("avondeten", "synonym", "diner 和 avondeten 都可以指晚饭，avondeten 更日常。", "diner and avondeten can both mean dinner; avondeten is more everyday."),
      memoryLink("lunch", "time-category", "lunch 和 diner 都是一天里的用餐时间。", "lunch and diner are meal times in the day."),
    ],
    exampleSentence: { dutch: "Ik eet diner thuis.", meaning: lt("我在家吃晚餐。", "I eat dinner at home.") },
  },
  boodschappen: {
    meaning: lt("日用品/采购", "groceries / errands"),
    memoryHook: lt("boodschappen 常在超市场景出现；先和 doen 组成 boodschappen doen。", "boodschappen often appears in supermarket scenes; first learn boodschappen doen."),
    phraseChunks: ["boodschappen doen", "Ik doe boodschappen.", "boodschappen in de supermarkt"],
    relatedWords: ["supermarkt", "kopen", "betalen", "pinnen"],
    memoryLinks: [
      memoryLink("supermarkt", "scenario-neighbor", "boodschappen 通常发生在 supermarkt。", "boodschappen often happens at the supermarket."),
      memoryLink("boodschappen doen", "usage-chunk", "最常用整块是 boodschappen doen。", "The most useful chunk is boodschappen doen."),
    ],
    exampleSentence: { dutch: "Ik doe boodschappen in de supermarkt.", meaning: lt("我在超市采购。", "I do groceries at the supermarket.") },
  },
  "boodschappen doen": {
    meaning: lt("买菜/采购", "do groceries"),
    memoryHook: lt("这是整块动作：boodschappen doen，不要拆开硬翻译。", "This is a whole action chunk: boodschappen doen. Do not over-translate it word by word."),
    phraseChunks: ["boodschappen doen", "Ik ga boodschappen doen.", "Zaterdag doe ik boodschappen."],
    relatedWords: ["boodschappen", "supermarkt", "kopen", "betalen"],
    memoryLinks: [
      memoryLink("boodschappen", "compound-part", "boodschappen doen 的核心名词是 boodschappen。", "The key noun in boodschappen doen is boodschappen."),
      memoryLink("kopen", "scenario-neighbor", "采购时会 kopen：买东西。", "When doing groceries, you kopen things."),
    ],
    exampleSentence: { dutch: "Ik ga boodschappen doen.", meaning: lt("我要去买菜/采购。", "I am going to do groceries.") },
  },
  kopen: {
    memoryHook: lt("kopen 是“买”的原形；超市里最常用 Ik koop ...。", "kopen is to buy; in supermarket scenes, Ik koop ... is very common."),
    phraseChunks: ["brood kopen", "Ik koop water.", "Ik wil dit kopen."],
    relatedWords: ["betalen", "prijs", "supermarkt", "boodschappen"],
    memoryLinks: [
      memoryLink("betalen", "action-object", "先 kopen，再 betalen：买了以后付款。", "First kopen, then betalen: buy, then pay."),
      memoryLink("prijs", "scenario-neighbor", "买东西前会看 prijs。", "Before buying, you check the prijs."),
    ],
    exampleSentence: { dutch: "Ik koop water.", meaning: lt("我买水。", "I buy water.") },
  },
  betalen: {
    memoryHook: lt("betalen 是付款；和 pinnen/contant 放在付款泡泡里。", "betalen means to pay; connect it with pinnen and contant."),
    phraseChunks: ["de rekening betalen", "Ik betaal met pin.", "contant betalen"],
    relatedWords: ["pinnen", "contant", "rekening", "kopen"],
    memoryLinks: [
      memoryLink("pinnen", "scenario-neighbor", "betalen met pin = 用银行卡付款。", "betalen met pin means paying by card."),
      memoryLink("rekening", "action-object", "A2 里常说 de rekening betalen。", "At A2, de rekening betalen is a core chunk."),
    ],
    exampleSentence: { dutch: "Ik betaal met pin.", meaning: lt("我刷卡付款。", "I pay by debit card.") },
  },
  pinnen: {
    memoryHook: lt("pinnen 是用 pinpas/银行卡付款或取钱；超市先学 Ik pin。", "pinnen means paying by debit card or withdrawing cash; start with Ik pin in supermarket use."),
    phraseChunks: ["met pin betalen", "Ik wil pinnen.", "Kan ik hier pinnen?"],
    relatedWords: ["pinpas", "betalen", "contant", "kassa"],
    memoryLinks: [
      memoryLink("pinpas", "scenario-neighbor", "pinnen 用的是 pinpas。", "You use a pinpas to pinnen."),
      memoryLink("contant", "opposite", "pinnen 和 contant betalen 是两种付款方式。", "pinnen and contant betalen are two payment methods."),
    ],
    exampleSentence: { dutch: "Kan ik hier pinnen?", meaning: lt("我可以在这里刷卡吗？", "Can I pay by card here?") },
  },
  zoeken: {
    memoryHook: lt("zoeken 是找；A1 常用 Ik zoek ...。", "zoeken means to look for; at A1, Ik zoek ... is very useful."),
    phraseChunks: ["iets zoeken", "Ik zoek de uitgang.", "Wat zoek je?"],
    relatedWords: ["vinden", "waar", "uitgang"],
    memoryLinks: [
      memoryLink("vinden", "state-action", "先 zoeken，找到就是 vinden。", "First zoeken; when you find it, that is vinden."),
      memoryLink("waar", "scenario-neighbor", "找地点时常问 Waar is ...?", "When looking for a place, ask Waar is ...?"),
    ],
    exampleSentence: { dutch: "Ik zoek de uitgang.", meaning: lt("我在找出口。", "I am looking for the exit.") },
  },
  vinden: {
    memoryHook: lt("vinden 是找到，也可以表示“觉得”。A1 先用 Ik vind ...。", "vinden means find, and also think/feel about something. Start with Ik vind ..."),
    phraseChunks: ["iets vinden", "Ik vind de winkel.", "Ik vind het goed."],
    relatedWords: ["zoeken", "goed", "winkel"],
    memoryLinks: [
      memoryLink("zoeken", "state-action", "zoeken 是找，vinden 是找到。", "zoeken is looking; vinden is finding."),
      memoryLink("goed", "usage-chunk", "Ik vind het goed 是常用意见句。", "Ik vind het goed is a useful opinion sentence."),
    ],
    exampleSentence: { dutch: "Ik vind de winkel.", meaning: lt("我找到商店了。", "I find the shop.") },
  },
  maken: {
    memoryHook: lt("maken 是做/制作；A1 常用 eten maken、huiswerk maken。", "maken means make/do; common chunks are eten maken and huiswerk maken."),
    phraseChunks: ["eten maken", "huiswerk maken", "Ik maak een afspraak."],
    relatedWords: ["doen", "afspraak", "eten"],
    memoryLinks: [
      memoryLink("doen", "confusion-pair", "maken 更像“制作/安排”，doen 更像“做一件事”。", "maken is more make/arrange; doen is more do an activity."),
      memoryLink("afspraak", "usage-chunk", "A2 里 een afspraak maken 是核心办事短语。", "At A2, een afspraak maken is a core practical chunk."),
    ],
    exampleSentence: { dutch: "Ik maak avondeten.", meaning: lt("我做晚饭。", "I make dinner.") },
  },
  doen: {
    memoryHook: lt("doen 是最基础的“做”；很多活动直接接 doen。", "doen is the basic verb to do; many activities attach to it."),
    phraseChunks: ["boodschappen doen", "huiswerk doen", "Wat doe je?"],
    relatedWords: ["maken", "boodschappen", "werk"],
    memoryLinks: [
      memoryLink("maken", "confusion-pair", "doen 是做活动，maken 是做出/安排一个东西。", "doen is doing an activity; maken is making or arranging something."),
      memoryLink("boodschappen", "usage-chunk", "boodschappen doen 是必须整块记的 A1 短语。", "boodschappen doen is a must-learn A1 chunk."),
    ],
    exampleSentence: { dutch: "Ik doe boodschappen.", meaning: lt("我采购。", "I do groceries.") },
  },
  lopen: {
    memoryHook: lt("lopen 是走路；交通里和 bus、tram、metro 对比。", "lopen means walk; in transport, contrast it with bus, tram, and metro."),
    phraseChunks: ["naar huis lopen", "Ik loop naar de tram.", "vijf minuten lopen"],
    relatedWords: ["bus", "tram", "metro", "fiets"],
    memoryLinks: [
      memoryLink("tram", "scenario-neighbor", "短距离先 lopen，到站后坐 tram。", "You may walk first, then take the tram."),
      memoryLink("fiets", "scenario-neighbor", "lopen 和 fietsen 都是基础出行方式。", "lopen and fietsen are basic ways to move around."),
    ],
    exampleSentence: { dutch: "Ik loop naar de tram.", meaning: lt("我走路去电车站。", "I walk to the tram.") },
  },
  tram: {
    article: "de",
    plural: "trams",
    memoryHook: lt("tram 是城市电车；和 bus、metro、trein 放进交通泡泡。", "tram is a city tram; connect it with bus, metro, and train."),
    englishBridge: "tram is the same transport word in English.",
    phraseChunks: ["de tram nemen", "Ik neem de tram.", "tram 4"],
    relatedWords: ["bus", "metro", "trein", "halte"],
    memoryLinks: [
      memoryLink("metro", "category-member", "tram 和 metro 都是城市公共交通。", "tram and metro are city public transport."),
      memoryLink("halte", "scenario-neighbor", "坐 tram 要去 halte。", "To take the tram, you go to a halte."),
    ],
    exampleSentence: { dutch: "Ik neem de tram naar school.", meaning: lt("我坐电车去学校。", "I take the tram to school.") },
  },
  metro: {
    article: "de",
    plural: "metro's",
    memoryHook: lt("metro 是地铁；和 tram、bus、trein 按交通类别一起记。", "metro is metro/subway; learn it with tram, bus, and train."),
    englishBridge: "metro is the same as English metro.",
    phraseChunks: ["de metro nemen", "Ik neem de metro.", "met de metro"],
    relatedWords: ["tram", "bus", "trein", "station"],
    memoryLinks: [
      memoryLink("tram", "category-member", "metro 和 tram 都是城市交通。", "metro and tram are both city transport."),
      memoryLink("station", "scenario-neighbor", "metro 和 trein 都会用 station。", "metro and train both connect with station."),
    ],
    exampleSentence: { dutch: "Ik neem de metro naar het centrum.", meaning: lt("我坐地铁去市中心。", "I take the metro to the center.") },
  },
  begrijpen: {
    memoryHook: lt("begrijpen 是理解；听不懂时说 Ik begrijp het niet。", "begrijpen means understand; when you do not understand, say Ik begrijp het niet."),
    phraseChunks: ["Ik begrijp het.", "Ik begrijp het niet.", "Kunt u dat uitleggen?"],
    relatedWords: ["uitleg", "uitleggen", "herhalen"],
    memoryLinks: [
      memoryLink("uitleggen", "state-action", "不 begrijpen 时，可以让别人 uitleggen。", "When you do not begrijpen, ask someone to uitleggen."),
      memoryLink("herhalen", "scenario-neighbor", "听不懂时也常问 Kunt u dat herhalen?", "When you do not understand, you can ask Kunt u dat herhalen?"),
    ],
    exampleSentence: { dutch: "Ik begrijp het niet.", meaning: lt("我不明白。", "I do not understand.") },
  },
  spreken: {
    memoryHook: lt("spreken 是说/讲话；语言能力常说 Nederlands spreken。", "spreken means speak; for language ability, use Nederlands spreken."),
    phraseChunks: ["Nederlands spreken", "Ik spreek een beetje Nederlands.", "langzaam spreken"],
    relatedWords: ["Nederlands", "luisteren", "langzaam"],
    memoryLinks: [
      memoryLink("Nederlands", "action-object", "最常用搭配是 Nederlands spreken。", "A very common chunk is Nederlands spreken."),
      memoryLink("langzaam", "scenario-neighbor", "听不懂时可说 Kunt u langzaam spreken?", "When you do not understand, say Kunt u langzaam spreken?"),
    ],
    exampleSentence: { dutch: "Ik spreek een beetje Nederlands.", meaning: lt("我会说一点荷兰语。", "I speak a little Dutch.") },
  },
  wonen: {
    memoryHook: lt("wonen 是居住；自我介绍里最常用 Ik woon in ...。", "wonen means live/reside; in introductions, use Ik woon in ..."),
    phraseChunks: ["in Nederland wonen", "Ik woon in Utrecht.", "Waar woon je?"],
    relatedWords: ["woon", "huis", "adres"],
    memoryLinks: [
      memoryLink("adres", "scenario-neighbor", "wonen 的实际办事词是 adres。", "The practical admin word connected to wonen is adres."),
      memoryLink("huis", "scenario-neighbor", "wonen 和 huis 都在住处场景。", "wonen and huis both belong to home/housing scenes."),
    ],
    exampleSentence: { dutch: "Ik woon in Utrecht.", meaning: lt("我住在 Utrecht。", "I live in Utrecht.") },
  },
  gezond: {
    memoryHook: lt("gezond 是健康的；和 ziek、beter、koorts 放在简单健康泡泡里。", "gezond means healthy; connect it with ziek, beter, and koorts."),
    phraseChunks: ["gezond eten", "Ik ben gezond.", "gezond blijven"],
    relatedWords: ["ziek", "beter", "koorts", "dokter"],
    memoryLinks: [
      memoryLink("ziek", "opposite", "gezond 和 ziek 是健康状态对比。", "gezond and ziek contrast health states."),
      memoryLink("beter", "state-action", "从 ziek 到 beter，再回到 gezond。", "From ziek to beter, then back to gezond."),
    ],
    exampleSentence: { dutch: "Ik wil gezond blijven.", meaning: lt("我想保持健康。", "I want to stay healthy.") },
  },
  koorts: {
    article: "de",
    meaning: lt("发烧", "fever"),
    memoryHook: lt("koorts 是发烧；A1 能说 Ik heb koorts，A2 再描述给 huisarts。", "koorts is fever; at A1 say Ik heb koorts, at A2 describe it to the GP."),
    phraseChunks: ["koorts hebben", "Ik heb koorts.", "hoge koorts"],
    relatedWords: ["ziek", "dokter", "huisarts", "medicijn"],
    memoryLinks: [
      memoryLink("ziek", "state-action", "koorts 是 ziek 的具体症状。", "koorts is a concrete symptom of being ziek."),
      memoryLink("huisarts", "scenario-neighbor", "A2 看病时会告诉 huisarts：Ik heb koorts。", "In A2 healthcare tasks, you tell the huisarts: Ik heb koorts."),
    ],
    exampleSentence: { dutch: "Ik heb koorts.", meaning: lt("我发烧。", "I have a fever.") },
  },
  stoppen: {
    memoryHook: lt("stoppen 是停止；路上、工作、学习都能用。", "stoppen means stop; use it in travel, work, and study."),
    phraseChunks: ["even stoppen", "Ik stop nu.", "stoppen met werken"],
    relatedWords: ["beginnen", "doorgaan", "werken"],
    memoryLinks: [
      memoryLink("beginnen", "opposite", "beginnen 是开始，stoppen 是停止。", "beginnen is start; stoppen is stop."),
      memoryLink("doorgaan", "opposite", "doorgaan 是继续，stoppen 是停下。", "doorgaan is continue; stoppen is stop."),
    ],
    exampleSentence: { dutch: "Ik stop nu.", meaning: lt("我现在停止。", "I stop now.") },
  },
  proberen: {
    memoryHook: lt("proberen 是尝试；不会也可以说 Ik probeer het。", "proberen means try; even if you cannot yet do it, say Ik probeer het."),
    phraseChunks: ["het proberen", "Ik probeer het.", "proberen te bellen"],
    relatedWords: ["doen", "lukken", "helpen"],
    memoryLinks: [
      memoryLink("doen", "action-object", "proberen 后面常接要做的事情。", "proberen is followed by the thing you try to do."),
      memoryLink("helpen", "scenario-neighbor", "尝试后不行，可以 vragen om hulp。", "If trying does not work, you can ask for help."),
    ],
    exampleSentence: { dutch: "Ik probeer het.", meaning: lt("我试一下。", "I try it.") },
  },
  vertellen: {
    memoryHook: lt("vertellen 是告诉/讲述；A1 先用 Ik vertel ...。", "vertellen means tell; start with Ik vertel ... at A1."),
    phraseChunks: ["iets vertellen", "Ik vertel mijn naam.", "Kunt u dat vertellen?"],
    relatedWords: ["zeggen", "spreken", "uitleggen"],
    memoryLinks: [
      memoryLink("zeggen", "synonym", "zeggen 是说，vertellen 是把信息告诉别人。", "zeggen is say; vertellen is tell someone information."),
      memoryLink("uitleggen", "scenario-neighbor", "vertellen 可以是简单告诉，uitleggen 是解释清楚。", "vertellen can be telling; uitleggen is explaining."),
    ],
    exampleSentence: { dutch: "Ik vertel mijn naam.", meaning: lt("我说出我的名字。", "I tell my name.") },
  },
  weten: {
    memoryHook: lt("weten 是知道；不知道时说 Ik weet het niet。", "weten means know; when you do not know, say Ik weet het niet."),
    phraseChunks: ["Ik weet het.", "Ik weet het niet.", "weet u dat?"],
    relatedWords: ["denken", "begrijpen", "informatie"],
    memoryLinks: [
      memoryLink("denken", "confusion-pair", "weten 是知道，denken 是想/认为。", "weten is know; denken is think."),
      memoryLink("informatie", "scenario-neighbor", "有 informatie 以后才 weet je het。", "With information, you can know it."),
    ],
    exampleSentence: { dutch: "Ik weet het niet.", meaning: lt("我不知道。", "I do not know.") },
  },
  denken: {
    memoryHook: lt("denken 是想/认为；表达意见常用 Ik denk dat ...。", "denken means think; for opinions, use Ik denk dat ..."),
    phraseChunks: ["Ik denk dat ...", "Wat denk je?", "Ik denk aan morgen."],
    relatedWords: ["weten", "vinden", "mening"],
    memoryLinks: [
      memoryLink("weten", "confusion-pair", "denken 是认为，不等于确定知道。", "denken is thinking/opinion, not certain knowing."),
      memoryLink("vinden", "scenario-neighbor", "表达看法时 denken 和 vinden 都常见。", "denken and vinden are both common for opinions."),
    ],
    exampleSentence: { dutch: "Ik denk dat het goed is.", meaning: lt("我觉得这很好。", "I think it is good.") },
  },
  meenemen: {
    memoryHook: lt("meenemen 是带上；办事/看病/上课都常用 Neem uw paspoort mee。", "meenemen means bring/take along; useful for admin, healthcare, and class."),
    phraseChunks: ["iets meenemen", "Ik neem mijn paspoort mee.", "Neem uw kaart mee."],
    relatedWords: ["paspoort", "kaart", "document"],
    memoryLinks: [
      memoryLink("paspoort", "action-object", "办事时常见搭配：paspoort meenemen。", "In admin tasks, paspoort meenemen is a common chunk."),
      memoryLink("document", "scenario-neighbor", "meenemen 经常和 document、bewijs 一起出现。", "meenemen often appears with document and proof words."),
    ],
    exampleSentence: { dutch: "Ik neem mijn paspoort mee.", meaning: lt("我带上我的护照。", "I bring my passport.") },
  },
  dicht: {
    memoryHook: lt("dicht 可以是关着的，也可以是近的；A1 先学 open/dicht。", "dicht can mean closed or near; at A1, start with open/dicht."),
    phraseChunks: ["de deur is dicht", "De winkel is dicht.", "dichtbij"],
    relatedWords: ["open", "deur", "winkel"],
    memoryLinks: [
      memoryLink("open", "opposite", "open 和 dicht 是最常用状态对比。", "open and dicht are a core state contrast."),
      memoryLink("deur", "scenario-neighbor", "门的状态常说 de deur is open/dicht。", "For a door state, say de deur is open/dicht."),
    ],
    exampleSentence: { dutch: "De winkel is dicht.", meaning: lt("商店关门了。", "The shop is closed.") },
  },
  gratis: {
    memoryHook: lt("gratis 是免费；购物、公共服务、活动里很常见。", "gratis means free of charge; common in shopping, services, and events."),
    phraseChunks: ["gratis toegang", "Het is gratis.", "gratis ophalen"],
    relatedWords: ["prijs", "betalen", "goedkoop"],
    memoryLinks: [
      memoryLink("betalen", "opposite", "gratis 的意思是不需要 betalen。", "gratis means you do not need to betalen."),
      memoryLink("prijs", "scenario-neighbor", "看 prijs 时会遇到 gratis。", "When checking price, you may see gratis."),
    ],
    exampleSentence: { dutch: "Het is gratis.", meaning: lt("这是免费的。", "It is free.") },
  },
  eenvoudig: {
    memoryHook: lt("eenvoudig 是简单的；和 moeilijk 对比记。", "eenvoudig means simple; learn it against moeilijk."),
    phraseChunks: ["een eenvoudige vraag", "Het formulier is eenvoudig.", "eenvoudig Nederlands"],
    relatedWords: ["makkelijk", "moeilijk", "formulier"],
    memoryLinks: [
      memoryLink("moeilijk", "opposite", "eenvoudig 和 moeilijk 是难易对比。", "eenvoudig and moeilijk contrast easy and difficult."),
      memoryLink("formulier", "scenario-neighbor", "A2 表格任务里希望 formulier eenvoudig。", "In A2 form tasks, you hope the formulier is simple."),
    ],
    exampleSentence: { dutch: "Het formulier is eenvoudig.", meaning: lt("这个表格很简单。", "The form is simple.") },
  },
  rustig: {
    memoryHook: lt("rustig 是安静/不忙；也可请别人 rustig praten。", "rustig means calm/quiet; you can also ask someone to speak calmly."),
    phraseChunks: ["een rustige straat", "Het is rustig.", "rustig praten"],
    relatedWords: ["druk", "langzaam", "straat"],
    memoryLinks: [
      memoryLink("druk", "opposite", "rustig 和 druk 是场景状态对比。", "rustig and druk contrast how busy a place is."),
      memoryLink("langzaam", "scenario-neighbor", "听不懂时 rustig/langzaam spreken 都有帮助。", "When you do not understand, rustig/langzaam spreken both help."),
    ],
    exampleSentence: { dutch: "Het is rustig in de straat.", meaning: lt("街上很安静。", "It is quiet in the street.") },
  },
  want: {
    memoryHook: lt("want 是因为；A1 用它连接两个短句。", "want means because; at A1, use it to connect two short sentences."),
    phraseChunks: ["Ik blijf thuis, want ik ben ziek.", "want ik heb geen tijd", "want het regent"],
    relatedWords: ["omdat", "daarom", "ziek"],
    memoryLinks: [
      memoryLink("omdat", "synonym", "want 和 omdat 都表示原因；A1 先用 want 连接短句。", "want and omdat both give reasons; at A1, use want to connect short clauses."),
      memoryLink("daarom", "confusion-pair", "want 给原因，daarom 给结果。", "want gives the reason; daarom gives the result."),
    ],
    exampleSentence: { dutch: "Ik blijf thuis, want ik ben ziek.", meaning: lt("我待在家，因为我生病了。", "I stay home because I am sick.") },
  },
  daarom: {
    memoryHook: lt("daarom 是所以/因此；先说原因，再用 daarom 说结果。", "daarom means therefore/so; give a reason, then use daarom for the result."),
    phraseChunks: ["Daarom blijf ik thuis.", "Het regent, daarom neem ik de bus.", "daarom kom ik later"],
    relatedWords: ["want", "omdat", "later"],
    memoryLinks: [
      memoryLink("want", "confusion-pair", "want 后面是原因，daarom 后面是结果。", "want introduces the reason; daarom introduces the result."),
      memoryLink("omdat", "confusion-pair", "omdat 说为什么，daarom 说所以怎样。", "omdat says why; daarom says what follows."),
    ],
    exampleSentence: { dutch: "Het regent, daarom neem ik de bus.", meaning: lt("下雨了，所以我坐公交。", "It is raining, so I take the bus.") },
  },
  ook: {
    memoryHook: lt("ook 是也；A1 很常用，放在短句里记。", "ook means also/too; very common at A1, learn it in short sentences."),
    phraseChunks: ["ik ook", "ook vandaag", "Ik kom ook."],
    relatedWords: ["niet", "nog", "al"],
    memoryLinks: [
      memoryLink("ik", "usage-chunk", "ik ook 是最短、最高频的“我也是”。", "ik ook is the shortest high-frequency way to say me too."),
      memoryLink("niet", "opposite", "ik ook 和 ik niet 是对话里常见对比。", "ik ook and ik niet are common conversational contrasts."),
    ],
    exampleSentence: { dutch: "Ik kom ook.", meaning: lt("我也来。", "I am coming too.") },
  },
  nog: {
    memoryHook: lt("nog 是还/再；常和 tijd、een keer、niet 连用。", "nog means still/another; it often pairs with time, one more, or not yet."),
    phraseChunks: ["nog een keer", "nog niet", "Ik heb nog tijd."],
    relatedWords: ["al", "ook", "tijd"],
    memoryLinks: [
      memoryLink("al", "time-contrast", "al 是已经，nog 是还/再。", "al means already; nog means still/another."),
      memoryLink("tijd", "scenario-neighbor", "Ik heb nog tijd 是很实用的时间句。", "Ik heb nog tijd is a useful time sentence."),
    ],
    exampleSentence: { dutch: "Ik heb nog tijd.", meaning: lt("我还有时间。", "I still have time.") },
  },
  al: {
    memoryHook: lt("al 是已经；和 nog 对比最容易记。", "al means already; contrast it with nog."),
    phraseChunks: ["al klaar", "Ik ben al thuis.", "heb je al betaald?"],
    relatedWords: ["nog", "klaar", "betaald"],
    memoryLinks: [
      memoryLink("nog", "time-contrast", "al 是已经，nog 是还。", "al means already; nog means still."),
      memoryLink("klaar", "usage-chunk", "al klaar = 已经好了/完成了。", "al klaar means already ready/done."),
    ],
    exampleSentence: { dutch: "Ik ben al thuis.", meaning: lt("我已经在家了。", "I am already at home.") },
  },
  apotheek: {
    article: "de",
    plural: "apotheken",
    memoryHook: lt("apotheek 是药房；A2 看病后常去 apotheek 取药。", "apotheek is pharmacy; after a GP visit, you often pick up medicine there."),
    phraseChunks: ["naar de apotheek", "medicijn ophalen", "Ik ga naar de apotheek."],
    relatedWords: ["huisarts", "medicijn", "recept", "tablet"],
    memoryLinks: [
      memoryLink("medicijn", "scenario-neighbor", "apotheek 是拿 medicijn 的地方。", "The apotheek is where you pick up medicine."),
      memoryLink("recept", "scenario-neighbor", "有 recept 才能取某些 medicijnen。", "You need a recept for some medicines."),
    ],
    exampleSentence: { dutch: "Ik ga naar de apotheek om mijn medicijn op te halen.", meaning: lt("我去药房取药。", "I go to the pharmacy to pick up my medicine.") },
  },
  huisartspraktijk: {
    article: "de",
    plural: "huisartspraktijken",
    memoryHook: lt("huisarts + praktijk：家庭医生的诊所。A2 里常用于预约和登记。", "huisarts + praktijk: the GP practice. At A2 it appears in appointments and registration."),
    englishBridge: "huisarts is GP; praktijk is practice/clinic.",
    phraseChunks: ["de huisartspraktijk", "de huisartspraktijk bellen", "ingeschreven bij de huisartspraktijk"],
    relatedWords: ["huisarts", "assistente", "afspraak", "spreekuur"],
    memoryLinks: [
      memoryLink("huisarts", "compound-part", "huisartspraktijk 的核心是 huisarts。", "The core of huisartspraktijk is huisarts."),
      memoryLink("afspraak", "scenario-neighbor", "给 huisartspraktijk 打电话通常是为了 afspraak。", "You often call the huisartspraktijk for an appointment."),
    ],
    exampleSentence: { dutch: "Ik bel de huisartspraktijk voor een afspraak.", meaning: lt("我打电话给家庭医生诊所预约。", "I call the GP practice for an appointment.") },
  },
  printen: {
    memoryHook: lt("printen 是打印；办表格时常和 formulier、kopie、scannen 一起出现。", "printen means print; in form tasks it appears with formulier, kopie, and scannen."),
    englishBridge: "printen is close to print.",
    phraseChunks: ["het formulier printen", "Ik moet dit printen.", "printen en scannen"],
    relatedWords: ["formulier", "scannen", "kopiëren", "printer"],
    memoryLinks: [
      memoryLink("formulier", "action-object", "常用搭配是 formulier printen。", "A common chunk is formulier printen."),
      memoryLink("scannen", "scenario-neighbor", "printen 和 scannen 经常在同一个办事流程里。", "printen and scannen often appear in the same admin flow."),
    ],
    exampleSentence: { dutch: "Ik moet het formulier printen.", meaning: lt("我需要打印表格。", "I need to print the form.") },
  },
  scannen: {
    memoryHook: lt("scannen 是扫描；提交文件时常说 document scannen。", "scannen means scan; when submitting documents, document scannen is common."),
    englishBridge: "scannen is close to scan.",
    phraseChunks: ["een document scannen", "Ik scan mijn paspoort.", "printen en scannen"],
    relatedWords: ["document", "paspoort", "printen", "bijlage"],
    memoryLinks: [
      memoryLink("document", "action-object", "常用搭配是 document scannen。", "A common chunk is document scannen."),
      memoryLink("bijlage", "scenario-neighbor", "扫描后常作为 bijlage 上传或发送。", "After scanning, you often send or upload it as an attachment."),
    ],
    exampleSentence: { dutch: "Ik scan mijn paspoort.", meaning: lt("我扫描我的护照。", "I scan my passport.") },
  },
  kopiëren: {
    memoryHook: lt("kopiëren 是复印/复制；办证件时常要 kopie maken。", "kopiëren means copy; for documents, kopie maken is common."),
    englishBridge: "kopiëren looks like copy.",
    phraseChunks: ["een paspoort kopiëren", "een kopie maken", "Ik kopieer het document."],
    relatedWords: ["kopie", "paspoort", "document", "printen"],
    memoryLinks: [
      memoryLink("kopie", "verb-noun-pair", "kopiëren 是动作，kopie 是结果。", "kopiëren is the action; kopie is the result."),
      memoryLink("paspoort", "action-object", "办事时常见 paspoort kopiëren。", "paspoort kopiëren is common in admin tasks."),
    ],
    exampleSentence: { dutch: "Ik kopieer het document.", meaning: lt("我复印/复制这个文件。", "I copy the document.") },
  },
  stempel: {
    article: "de",
    plural: "stempels",
    memoryHook: lt("stempel 是印章；表格/文件场景里看到即可。", "stempel is a stamp; recognize it in form/document contexts."),
    phraseChunks: ["de stempel", "een stempel zetten", "stempel op het formulier"],
    relatedWords: ["formulier", "handtekening", "document"],
    memoryLinks: [
      memoryLink("handtekening", "scenario-neighbor", "文件上常见 handtekening 和 stempel。", "Documents often use both signature and stamp."),
      memoryLink("formulier", "scenario-neighbor", "stempel 常出现在 formulier/document 场景。", "stempel appears in form/document scenes."),
    ],
    exampleSentence: { dutch: "Er staat een stempel op het formulier.", meaning: lt("表格上有一个印章。", "There is a stamp on the form.") },
  },
  mapje: {
    article: "het",
    plural: "mapjes",
    memoryHook: lt("mapje 是小文件夹；整理表格和证件时会用。", "mapje is a small folder; useful when organizing forms and documents."),
    phraseChunks: ["het mapje", "documenten in een mapje", "Ik doe de kopie in het mapje."],
    relatedWords: ["document", "formulier", "kopie"],
    memoryLinks: [
      memoryLink("document", "scenario-neighbor", "mapje 用来放 document。", "A mapje holds documents."),
      memoryLink("kopie", "scenario-neighbor", "复印件可以放进 mapje。", "Copies can go into a mapje."),
    ],
    exampleSentence: { dutch: "Ik doe de kopie in het mapje.", meaning: lt("我把复印件放进文件夹。", "I put the copy in the folder.") },
  },
  verhuizing: {
    article: "de",
    plural: "verhuizingen",
    memoryHook: lt("verhuizing 是搬家这件事；A2 常见任务是向 gemeente 报告搬家。", "verhuizing is the move/relocation; a common A2 task is reporting it to the municipality."),
    phraseChunks: ["de verhuizing doorgeven", "mijn verhuizing melden", "na de verhuizing"],
    relatedWords: ["verhuisdatum", "nieuw adres", "gemeente", "adreswijziging"],
    memoryLinks: [
      memoryLink("verhuisdatum", "scenario-neighbor", "verhuizing 和 verhuisdatum 常一起出现在搬家申报里。", "verhuizing and verhuisdatum often appear together when reporting a move."),
      memoryLink("nieuw adres", "scenario-neighbor", "搬家任务里最重要的是 nieuw adres。", "The key detail in a move is the new address."),
    ],
    exampleSentence: { dutch: "Ik wil mijn verhuizing doorgeven.", meaning: lt("我想申报我的搬家。", "I want to report my move.") },
  },
  verhuisdatum: {
    article: "de",
    plural: "verhuisdatums",
    memoryHook: lt("verhuisdatum 是搬家日期；表格里常和 nieuw adres 一起填。", "verhuisdatum is moving date; on forms it often appears with new address."),
    phraseChunks: ["de verhuisdatum invullen", "mijn verhuisdatum is ...", "vanaf de verhuisdatum"],
    relatedWords: ["verhuizing", "datum", "nieuw adres"],
    memoryLinks: [
      memoryLink("datum", "compound-part", "verhuisdatum 里有 datum：日期。", "verhuisdatum contains datum: date."),
      memoryLink("verhuizing", "scenario-neighbor", "verhuisdatum 是 verhuizing 的具体日期。", "verhuisdatum is the date of the move."),
    ],
    exampleSentence: { dutch: "Ik vul de verhuisdatum in.", meaning: lt("我填写搬家日期。", "I fill in the moving date.") },
  },
  "nieuw adres": {
    meaning: lt("新地址", "new address"),
    memoryHook: lt("nieuw adres 是搬家后地址；和 oude adres 对比记。", "nieuw adres is the address after moving; contrast it with oude adres."),
    phraseChunks: ["mijn nieuwe adres", "het nieuwe adres invullen", "Wat is uw nieuwe adres?"],
    relatedWords: ["oude adres", "adres", "verhuizing"],
    memoryLinks: [
      memoryLink("oude adres", "opposite", "nieuw adres 和 oude adres 是搬家表格里的对比。", "new address and old address are paired on moving forms."),
      memoryLink("adres", "compound-part", "核心词是 adres：地址。", "The core word is adres: address."),
    ],
    exampleSentence: { dutch: "Ik vul mijn nieuwe adres in.", meaning: lt("我填写我的新地址。", "I fill in my new address.") },
  },
  "oude adres": {
    meaning: lt("旧地址", "old address"),
    memoryHook: lt("oude adres 是搬家前地址；和 nieuw adres 成对出现。", "oude adres is the address before moving; it appears with nieuw adres."),
    phraseChunks: ["mijn oude adres", "het oude adres invullen", "oude en nieuwe adres"],
    relatedWords: ["nieuw adres", "adres", "verhuizing"],
    memoryLinks: [
      memoryLink("nieuw adres", "opposite", "旧地址和新地址是搬家表格里的固定对。", "Old and new address are a fixed pair in moving forms."),
      memoryLink("adres", "compound-part", "oude adres 的中心词仍然是 adres。", "The center word in oude adres is still adres."),
      memoryLink("verhuizing", "scenario-neighbor", "oude adres 用来说明 verhuizing 前住在哪里。", "oude adres tells where you lived before the move."),
    ],
    exampleSentence: { dutch: "Ik schrijf mijn oude adres op.", meaning: lt("我写下我的旧地址。", "I write down my old address.") },
  },
  postadres: {
    article: "het",
    plural: "postadressen",
    memoryHook: lt("postadres 是收信地址；不一定等于 woonadres。", "postadres is mailing address; it is not always the same as woonadres."),
    phraseChunks: ["het postadres", "mijn postadres invullen", "postadres veranderen"],
    relatedWords: ["adres", "brief", "post"],
    memoryLinks: [
      memoryLink("post", "compound-part", "postadres 里有 post：邮件/信件。", "postadres contains post: mail."),
      memoryLink("adres", "compound-part", "postadres 的核心仍然是 adres。", "The core of postadres is adres."),
    ],
    exampleSentence: { dutch: "Ik vul mijn postadres in.", meaning: lt("我填写我的通讯地址。", "I fill in my mailing address.") },
  },
  "inschrijving bevestigen": {
    meaning: lt("确认登记", "confirm registration"),
    memoryHook: lt("这是办事整块：inschrijving 是登记，bevestigen 是确认。", "This is an admin chunk: inschrijving is registration, bevestigen is confirm."),
    phraseChunks: ["inschrijving bevestigen", "Ik bevestig mijn inschrijving.", "bevestiging van inschrijving"],
    relatedWords: ["inschrijving", "bevestigen", "gemeente"],
    memoryLinks: [
      memoryLink("inschrijving", "compound-part", "短语核心任务是 inschrijving：登记。", "The core task is inschrijving: registration."),
      memoryLink("bevestigen", "action-object", "bevestigen 是确认这个动作。", "bevestigen is the action: confirm."),
    ],
    exampleSentence: { dutch: "Ik bevestig mijn inschrijving.", meaning: lt("我确认我的登记。", "I confirm my registration.") },
  },
  "afspraak verplaatsen": {
    meaning: lt("改约", "reschedule an appointment"),
    memoryHook: lt("afspraak verplaatsen 是改约；比单背 verplaatsen 更实用。", "afspraak verplaatsen means reschedule an appointment; the chunk is more useful than the verb alone."),
    phraseChunks: ["afspraak verplaatsen", "Ik wil mijn afspraak verplaatsen.", "naar volgende week verplaatsen"],
    relatedWords: ["afspraak", "verplaatsen", "afspraak annuleren"],
    memoryLinks: [
      memoryLink("afspraak", "compound-part", "要改的是 afspraak。", "The thing being changed is the afspraak."),
      memoryLink("afspraak annuleren", "confusion-pair", "verplaatsen 是换时间，annuleren 是取消。", "verplaatsen changes the time; annuleren cancels."),
    ],
    exampleSentence: { dutch: "Ik wil mijn afspraak verplaatsen.", meaning: lt("我想改约。", "I want to reschedule my appointment.") },
  },
  "afspraak annuleren": {
    meaning: lt("取消预约", "cancel an appointment"),
    memoryHook: lt("afspraak annuleren 是取消预约；和 afspraak verplaatsen 区分。", "afspraak annuleren means cancel an appointment; contrast it with rescheduling."),
    phraseChunks: ["afspraak annuleren", "Ik moet mijn afspraak annuleren.", "de afspraak afzeggen"],
    relatedWords: ["afspraak", "annuleren", "afspraak verplaatsen"],
    memoryLinks: [
      memoryLink("afspraak verplaatsen", "confusion-pair", "annuleren 是取消，verplaatsen 是改时间。", "annuleren cancels; verplaatsen reschedules."),
      memoryLink("afzeggen", "synonym", "afspraak afzeggen 和 afspraak annuleren 意思接近。", "afspraak afzeggen is close to afspraak annuleren."),
    ],
    exampleSentence: { dutch: "Ik moet mijn afspraak annuleren.", meaning: lt("我必须取消我的预约。", "I have to cancel my appointment.") },
  },
  terugbellen: {
    memoryHook: lt("terug + bellen：打回去，就是回电话。", "terug + bellen: call back."),
    englishBridge: "terug means back; bellen means call.",
    phraseChunks: ["kunt u terugbellen?", "Ik bel u terug.", "vandaag terugbellen"],
    relatedWords: ["bellen", "telefoonnummer", "bereikbaar zijn"],
    memoryLinks: [
      memoryLink("bellen", "compound-part", "terugbellen 里有 bellen：打电话。", "terugbellen contains bellen: call."),
      memoryLink("bereikbaar zijn", "scenario-neighbor", "回电话前要确认对方 bereikbaar。", "Before calling back, check whether the person is reachable."),
    ],
    exampleSentence: { dutch: "Kunt u mij vandaag terugbellen?", meaning: lt("您今天能给我回电话吗？", "Can you call me back today?") },
  },
  "bereikbaar zijn": {
    meaning: lt("联系得到/可接通", "be reachable"),
    memoryHook: lt("bereikbaar zijn 是电话/邮件场景的状态：别人能不能联系到你。", "bereikbaar zijn is a phone/email state: whether people can reach you."),
    phraseChunks: ["telefonisch bereikbaar zijn", "Ik ben vandaag bereikbaar.", "niet bereikbaar zijn"],
    relatedWords: ["telefoonnummer", "terugbellen", "contact"],
    memoryLinks: [
      memoryLink("terugbellen", "scenario-neighbor", "如果 iemand bereikbaar is，你可以 terugbellen。", "If someone is reachable, you can call back."),
      memoryLink("telefoonnummer", "scenario-neighbor", "bereikbaar zijn 常和 telefoonnummer 一起出现。", "bereikbaar zijn often goes with telephone number."),
    ],
    exampleSentence: { dutch: "Ik ben vandaag telefonisch bereikbaar.", meaning: lt("我今天电话可以联系到。", "I am reachable by phone today.") },
  },
  klantnummer: {
    article: "het",
    plural: "klantnummers",
    memoryHook: lt("klant + nummer：客户号码；打电话给客服前常要准备。", "klant + nummer: customer number; often needed before calling customer service."),
    englishBridge: "klant means customer; nummer means number.",
    phraseChunks: ["het klantnummer", "mijn klantnummer doorgeven", "Wat is uw klantnummer?"],
    relatedWords: ["klant", "nummer", "kenmerk"],
    memoryLinks: [
      memoryLink("nummer", "compound-part", "klantnummer 的核心是 nummer。", "The core of klantnummer is nummer."),
      memoryLink("kenmerk", "scenario-neighbor", "klantnummer 和 kenmerk 都是办事时要报的编号。", "klantnummer and kenmerk are both reference numbers used in admin tasks."),
    ],
    exampleSentence: { dutch: "Ik geef mijn klantnummer door.", meaning: lt("我报出我的客户号码。", "I give my customer number.") },
  },
  "kenmerk vermelden": {
    meaning: lt("注明编号", "mention the reference"),
    memoryHook: lt("kenmerk vermelden 是邮件/表格任务整块：写上参考编号。", "kenmerk vermelden is an email/form chunk: mention the reference number."),
    phraseChunks: ["het kenmerk vermelden", "Vermeld het kenmerk in uw e-mail.", "kenmerk op de brief"],
    relatedWords: ["kenmerk", "brief", "e-mail"],
    memoryLinks: [
      memoryLink("kenmerk", "compound-part", "kenmerk 是要写上的编号/参考。", "kenmerk is the reference number you mention."),
      memoryLink("e-mail", "scenario-neighbor", "在 e-mail 里常要 kenmerk vermelden。", "In an email, you often need to mention the reference."),
    ],
    exampleSentence: { dutch: "Ik vermeld het kenmerk in mijn e-mail.", meaning: lt("我在邮件里注明编号。", "I mention the reference in my email.") },
  },
  betalingsbewijs: {
    article: "het",
    plural: "betalingsbewijzen",
    memoryHook: lt("betaling + bewijs：付款 + 证明，就是付款证明。", "betaling + bewijs: payment + proof, so proof of payment."),
    phraseChunks: ["het betalingsbewijs", "betalingsbewijs sturen", "Ik stuur het betalingsbewijs."],
    relatedWords: ["betaling", "bewijs", "rekening", "factuur"],
    memoryLinks: [
      memoryLink("betaling", "compound-part", "betalingsbewijs 里有 betaling：付款。", "betalingsbewijs contains betaling: payment."),
      memoryLink("bewijs", "compound-part", "bewijs 是证明；betalingsbewijs 是付款的证明。", "bewijs means proof; betalingsbewijs is proof of payment."),
    ],
    exampleSentence: { dutch: "Ik stuur het betalingsbewijs mee.", meaning: lt("我附上付款证明。", "I send the proof of payment along.") },
  },
  "huur betalen": {
    meaning: lt("付房租", "pay rent"),
    memoryHook: lt("huur betalen 是租房生活核心短语；huur 是租金，betalen 是付款。", "huur betalen is a core renting-life chunk; huur is rent and betalen is pay."),
    phraseChunks: ["huur betalen", "Ik betaal de huur.", "huur per maand"],
    relatedWords: ["huur", "betalen", "rekening"],
    memoryLinks: [
      memoryLink("huur", "compound-part", "要付的是 huur：房租。", "The thing you pay is huur: rent."),
      memoryLink("betalen", "action-object", "betalen 是付款动作。", "betalen is the paying action."),
    ],
    exampleSentence: { dutch: "Ik betaal de huur per maand.", meaning: lt("我每月付房租。", "I pay the rent monthly.") },
  },
  "medicijnen ophalen": {
    meaning: lt("取药", "pick up medicine"),
    memoryHook: lt("medicijnen ophalen 是药房任务整块：去拿药。", "medicijnen ophalen is a pharmacy task chunk: pick up medicines."),
    phraseChunks: ["medicijnen ophalen", "Ik haal mijn medicijnen op.", "bij de apotheek ophalen"],
    relatedWords: ["medicijn", "apotheek", "recept"],
    memoryLinks: [
      memoryLink("apotheek", "scenario-neighbor", "medicijnen ophalen 通常在 apotheek。", "You usually pick up medicines at the pharmacy."),
      memoryLink("recept", "scenario-neighbor", "有些 medicijnen ophalen 需要 recept。", "Some medicines require a prescription."),
    ],
    exampleSentence: { dutch: "Ik haal mijn medicijnen op bij de apotheek.", meaning: lt("我在药房取药。", "I pick up my medicines at the pharmacy.") },
  },
  "pijn aangeven": {
    meaning: lt("说明疼痛", "describe/report pain"),
    memoryHook: lt("pijn aangeven 是看病任务整块：告诉医生哪里痛。", "pijn aangeven is a healthcare task chunk: tell the doctor where it hurts."),
    phraseChunks: ["pijn aangeven", "Ik geef aan waar ik pijn heb.", "pijn in mijn buik"],
    relatedWords: ["pijn", "huisarts", "klacht"],
    memoryLinks: [
      memoryLink("pijn", "compound-part", "pijn aangeven 的核心是 pijn：疼痛。", "The core of pijn aangeven is pijn: pain."),
      memoryLink("huisarts", "scenario-neighbor", "给 huisarts 描述 pijn 是 A2 看病任务。", "Describing pain to the GP is an A2 healthcare task."),
    ],
    exampleSentence: { dutch: "Ik geef aan waar ik pijn heb.", meaning: lt("我说明我哪里疼。", "I indicate where I have pain.") },
  },
  "klacht uitleggen": {
    meaning: lt("说明问题/投诉", "explain the complaint/problem"),
    memoryHook: lt("klacht 可以是症状，也可以是投诉；uitleggen 是解释清楚。", "klacht can be a symptom or complaint; uitleggen means explain clearly."),
    phraseChunks: ["de klacht uitleggen", "Ik leg mijn klacht uit.", "klacht duidelijk uitleggen"],
    relatedWords: ["klacht", "uitleggen", "probleem"],
    memoryLinks: [
      memoryLink("klacht", "compound-part", "要解释的是 klacht：症状/投诉。", "The thing being explained is the klacht."),
      memoryLink("uitleggen", "action-object", "uitleggen 是把问题解释清楚。", "uitleggen means explain the problem clearly."),
    ],
    exampleSentence: { dutch: "Ik leg mijn klacht duidelijk uit.", meaning: lt("我清楚地说明我的问题/症状。", "I explain my complaint clearly.") },
  },
  "formulier opsturen": {
    meaning: lt("寄送表格", "send the form"),
    memoryHook: lt("formulier opsturen 是表格任务整块；可以是邮寄，也可以泛指发送。", "formulier opsturen is a form-task chunk; it can mean send by post or send in."),
    phraseChunks: ["het formulier opsturen", "Ik stuur het formulier op.", "formulier vandaag opsturen"],
    relatedWords: ["formulier", "opsturen", "bijlage"],
    memoryLinks: [
      memoryLink("formulier", "compound-part", "要发送的是 formulier。", "The thing you send is the formulier."),
      memoryLink("bijlage toevoegen", "scenario-neighbor", "发送表格前常要 bijlage toevoegen。", "Before sending a form, you may need to add an attachment."),
      memoryLink("bijlage", "action-object", "formulier opsturen 时，bijlage 是常一起发送的附件。", "When sending a form, a bijlage is an attachment you often send with it."),
    ],
    exampleSentence: { dutch: "Ik stuur het formulier vandaag op.", meaning: lt("我今天寄出/发送表格。", "I send the form today.") },
  },
  "bijlage toevoegen": {
    meaning: lt("添加附件", "add an attachment"),
    memoryHook: lt("bijlage toevoegen 是邮件/表格任务整块：把附件加上。", "bijlage toevoegen is an email/form chunk: add the attachment."),
    phraseChunks: ["een bijlage toevoegen", "Ik voeg de bijlage toe.", "bijlage bij de e-mail"],
    relatedWords: ["bijlage", "e-mail", "formulier"],
    memoryLinks: [
      memoryLink("bijlage", "compound-part", "bijlage 是附件。", "bijlage means attachment."),
      memoryLink("e-mail", "scenario-neighbor", "邮件里常说 bijlage toevoegen。", "In email tasks, bijlage toevoegen is common."),
    ],
    exampleSentence: { dutch: "Ik voeg de bijlage toe aan de e-mail.", meaning: lt("我把附件添加到邮件里。", "I add the attachment to the email.") },
  },
  "hulp vragen": {
    meaning: lt("求助", "ask for help"),
    memoryHook: lt("hulp vragen 是求助整块；比单背 hulp 更能开口。", "hulp vragen is the chunk ask for help; it is more speakable than hulp alone."),
    phraseChunks: ["hulp vragen", "Ik vraag om hulp.", "Kunt u mij helpen?"],
    relatedWords: ["hulp", "helpen", "probleem"],
    memoryLinks: [
      memoryLink("hulp", "compound-part", "hulp vragen 的核心名词是 hulp。", "The core noun in hulp vragen is hulp."),
      memoryLink("helpen", "verb-noun-pair", "hulp 是名词，helpen 是动词。", "hulp is the noun; helpen is the verb."),
    ],
    exampleSentence: { dutch: "Ik vraag om hulp.", meaning: lt("我求助。", "I ask for help.") },
  },
  appel: {
    article: "de",
    plural: "appels",
    meaning: lt("苹果", "apple"),
    memoryHook: lt("appel 很像 apple，先借外形记住意思，发音按荷兰语。", "appel looks like apple, which helps with meaning; pronounce it in Dutch."),
    englishBridge: "appel looks like apple.",
    phraseChunks: ["een appel", "Ik eet een appel.", "twee appels"],
    relatedWords: ["aardappel", "sinaasappel", "appelsap"],
    exampleSentence: { dutch: "Ik eet een appel.", meaning: lt("我吃一个苹果。", "I eat an apple.") },
  },
  aardappel: {
    article: "de",
    plural: "aardappels",
    meaning: lt("土豆", "potato"),
    memoryHook: lt("aard = 土地，appel = apple；地里的 apple，就是土豆。", "aard = earth, appel = apple; an earth apple is a potato."),
    englishBridge: "aardappel literally feels like earth apple.",
    phraseChunks: ["een kilo aardappels", "Ik koop aardappels.", "aardappels koken"],
    relatedWords: ["aard", "appel", "sinaasappel"],
    exampleSentence: { dutch: "Ik koop aardappels.", meaning: lt("我买土豆。", "I buy potatoes.") },
  },
  sinaasappel: {
    article: "de",
    plural: "sinaasappels",
    meaning: lt("橙子", "orange"),
    memoryHook: lt("sinaasappel 里有 appel，先抓住熟悉的 apple，再整体记橙子。", "sinaasappel contains appel; start from apple, then remember orange."),
    englishBridge: "Contains appel, but means orange.",
    phraseChunks: ["een sinaasappel", "Ik koop sinaasappels.", "sinaasappelsap"],
    relatedWords: ["appel", "aardappel", "appelsap"],
    exampleSentence: { dutch: "Ik koop sinaasappels.", meaning: lt("我买橙子。", "I buy oranges.") },
  },
  appelsap: {
    article: "het",
    plural: "appelsappen",
    meaning: lt("苹果汁", "apple juice"),
    memoryHook: lt("appel + sap：苹果 + 汁，就是苹果汁。", "appel + sap: apple + juice."),
    englishBridge: "appel is apple; sap is juice.",
    phraseChunks: ["een glas appelsap", "Ik drink appelsap.", "appelsap drinken"],
    relatedWords: ["appel", "sinaasappel", "water"],
    exampleSentence: { dutch: "Ik drink appelsap.", meaning: lt("我喝苹果汁。", "I drink apple juice.") },
  },
  minuut: {
    article: "de",
    plural: "minuten",
    meaning: lt("分钟", "minute"),
    memoryHook: lt("minuut 很像 minute；和 uur 一起记：60 minuten = 1 uur。", "minuut looks like minute; connect it with uur: 60 minuten = 1 uur."),
    englishBridge: "minuut looks like minute.",
    phraseChunks: ["vijf minuten vertraging", "tien minuten wachten", "Een uur heeft zestig minuten."],
    relatedWords: ["uur", "tijd", "vertraging", "week", "maand", "jaar"],
    exampleSentence: { dutch: "De trein heeft vijf minuten vertraging.", meaning: lt("火车晚点五分钟。", "The train is delayed by five minutes.") },
  },
  uur: {
    article: "het",
    plural: "uren",
    meaning: lt("小时/点钟", "hour / o'clock"),
    memoryHook: lt("uur 是“小时/几点”的核心词；和 minuut 一起记：een uur = 60 minuten。", "uur is the core word for hour/o'clock; connect it with minuut: one hour = 60 minutes."),
    englishBridge: "uur means hour or o'clock.",
    phraseChunks: ["om drie uur", "een uur wachten", "Een uur heeft zestig minuten."],
    relatedWords: ["minuut", "tijd", "morgen", "middag", "avond"],
    exampleSentence: { dutch: "Een uur heeft zestig minuten.", meaning: lt("一小时有六十分钟。", "An hour has sixty minutes.") },
  },
  tijd: {
    article: "de",
    plural: "tijden",
    meaning: lt("时间", "time"),
    memoryHook: lt("tijd 是大概念“时间”，minuut/uur 是具体单位。", "tijd is the big idea of time; minuut and uur are concrete units."),
    englishBridge: "tijd means time.",
    phraseChunks: ["geen tijd", "tijd hebben", "Hoe laat is het?"],
    relatedWords: ["minuut", "uur", "datum"],
    exampleSentence: { dutch: "Vandaag heb ik tijd.", meaning: lt("今天我有时间。", "I have time today.") },
  },
  wanneer: {
    meaning: lt("什么时候", "when"),
    memoryHook: lt("wanneer 专门问时间：什么时候？和 waar（哪里）对比记。", "wanneer asks time: when? Contrast it with waar, where."),
    englishBridge: "wanneer means when.",
    phraseChunks: ["Wanneer kan ik langskomen?", "Wanneer begint de les?", "Wanneer komt de trein?"],
    relatedWords: ["waar", "hoe laat", "tijd", "afspraak"],
    exampleSentence: { dutch: "Wanneer kan ik langskomen?", meaning: lt("我什么时候可以过来？", "When can I come by?") },
  },
  waar: {
    meaning: lt("哪里", "where"),
    memoryHook: lt("waar 问地点；wanneer 问时间。先把 waar/wanneer 分清。", "waar asks place; wanneer asks time. Separate waar/wanneer early."),
    englishBridge: "waar means where.",
    phraseChunks: ["Waar woon jij?", "Waar is het station?", "Waar kom jij vandaan?"],
    relatedWords: ["wanneer", "wie", "wat", "hoe"],
    exampleSentence: { dutch: "Waar is het station?", meaning: lt("车站在哪里？", "Where is the station?") },
  },
  hoeveel: {
    meaning: lt("多少/多少钱", "how much / how many"),
    memoryHook: lt("hoeveel 问数量和价格：多少？多少钱？", "hoeveel asks quantity and price: how many/how much."),
    englishBridge: "hoeveel means how much/how many.",
    phraseChunks: ["Hoeveel kost dit?", "Hoeveel minuten vertraging is er?"],
    relatedWords: ["hoe", "prijs", "minuut", "geld"],
    exampleSentence: { dutch: "Hoeveel kost dit?", meaning: lt("这个多少钱？", "How much does this cost?") },
  },
  morgen: {
    article: "de",
    plural: "morgens",
    meaning: lt("早上/明天", "morning / tomorrow"),
    memoryHook: lt("morgen 有两个常用意思：早上、明天。goedemorgen 里的 morgen 是早上。", "morgen has two common meanings: morning and tomorrow. In goedemorgen it means morning."),
    phraseChunks: ["morgen vroeg", "tot morgen", "Goedemorgen."],
    relatedWords: ["goedemorgen", "middag", "avond", "vandaag"],
    exampleSentence: { dutch: "Tot morgen.", meaning: lt("明天见。", "See you tomorrow.") },
  },
  middag: {
    article: "de",
    plural: "middagen",
    meaning: lt("下午/中午", "afternoon / noon"),
    memoryHook: lt("middag 是一天中间的时间，goedemiddag 就是下午好。", "middag is the middle part of the day; goedemiddag means good afternoon."),
    phraseChunks: ["vanmiddag", "Goedemiddag.", "in de middag"],
    relatedWords: ["goedemiddag", "morgen", "avond"],
    exampleSentence: { dutch: "Goedemiddag.", meaning: lt("下午好。", "Good afternoon.") },
  },
  avond: {
    article: "de",
    plural: "avonden",
    meaning: lt("晚上", "evening"),
    memoryHook: lt("avond 是晚上，goedenavond 就是晚上好。", "avond means evening; goedenavond means good evening."),
    phraseChunks: ["vanavond", "Goedenavond.", "in de avond"],
    relatedWords: ["goedenavond", "morgen", "middag"],
    exampleSentence: { dutch: "Goedenavond.", meaning: lt("晚上好。", "Good evening.") },
  },
  langzaam: {
    meaning: lt("慢一点/慢的", "slowly / slow"),
    memoryHook: lt("听不懂时最有用：langzaam spreken / langzaam herhalen。", "Very useful when you do not understand: langzaam spreken / langzaam herhalen."),
    phraseChunks: ["langzaam spreken", "langzaam herhalen", "Kunt u langzaam spreken?"],
    relatedWords: ["snel", "herhaal", "spreken"],
    exampleSentence: { dutch: "Kunt u langzaam spreken?", meaning: lt("您能慢一点说吗？", "Can you speak slowly?") },
  },
  snel: {
    meaning: lt("快地/快的", "quickly / fast"),
    memoryHook: lt("snel 是快，和 langzaam 成对记。别人说太快时，你需要 langzaam。", "snel means fast; pair it with langzaam. When someone speaks too fast, you need langzaam."),
    phraseChunks: ["te snel", "snel spreken", "De trein is snel."],
    relatedWords: ["langzaam", "trein"],
    exampleSentence: { dutch: "U spreekt te snel.", meaning: lt("您说得太快了。", "You are speaking too fast.") },
  },
  herhaal: {
    meaning: lt("重复", "repeat"),
    memoryHook: lt("herhaal 是“重复一下”的动作，最常用句是 Kunt u dat herhalen?", "herhaal is the action repeat; the most useful sentence is Kunt u dat herhalen?"),
    phraseChunks: ["Kunt u dat herhalen?", "langzaam herhalen", "Herhaal, alstublieft."],
    relatedWords: ["herhaling", "langzaam"],
    exampleSentence: { dutch: "Kunt u dat herhalen?", meaning: lt("您能重复一下吗？", "Can you repeat that?") },
  },
  herhaling: {
    article: "de",
    plural: "herhalingen",
    meaning: lt("重复/复习", "repetition / review"),
    memoryHook: lt("herhaal 是动作，herhaling 是名词：重复、复习。", "herhaal is the action; herhaling is the noun: repetition/review."),
    phraseChunks: ["de herhaling", "een korte herhaling", "Herhaling helpt."],
    relatedWords: ["herhaal", "herhalen"],
    exampleSentence: { dutch: "Herhaling helpt.", meaning: lt("重复练习有帮助。", "Repetition helps.") },
  },
  boek: {
    article: "het",
    plural: "boeken",
    meaning: lt("书", "book"),
    memoryHook: lt("boek 很像 book，但发音按荷兰语读；背的时候整块记 het boek。", "boek looks like book, but pronounce it in Dutch; remember it as het boek."),
    englishBridge: "boek looks like book.",
    phraseChunks: ["het boek", "een boek lezen", "Ik lees een boek."],
    relatedWords: ["lezen", "pen", "schrift"],
    exampleSentence: { dutch: "Ik lees een boek.", meaning: lt("我读一本书。", "I read a book.") },
  },
  pen: {
    article: "de",
    plural: "pennen",
    meaning: lt("笔", "pen"),
    memoryHook: lt("pen 和 English pen 一样；写名字时会用到。", "pen is the same as English pen; you use it when writing your name."),
    englishBridge: "pen is the same as pen.",
    phraseChunks: ["de pen", "Ik heb een pen nodig.", "Schrijf met de pen."],
    relatedWords: ["schrijven", "boek", "schrift"],
    exampleSentence: { dutch: "Ik heb een pen nodig.", meaning: lt("我需要一支笔。", "I need a pen.") },
  },
  tas: {
    article: "de",
    plural: "tassen",
    meaning: lt("包", "bag"),
    memoryHook: lt("tas 是随身的包；和 boek、pen 一起放进课堂/出门场景。", "tas is a bag you carry; connect it with boek and pen in class or going-out scenes."),
    phraseChunks: ["de tas", "Mijn boek zit in de tas.", "Ik neem mijn tas mee."],
    relatedWords: ["boek", "pen", "jas"],
    exampleSentence: { dutch: "Mijn boek zit in de tas.", meaning: lt("我的书在包里。", "My book is in the bag.") },
  },
  telefoon: {
    article: "de",
    plural: "telefoons",
    meaning: lt("电话/手机", "phone"),
    memoryHook: lt("telefoon 像 telephone；现代生活里常当手机用。", "telefoon looks like telephone; in daily life it often means phone."),
    englishBridge: "telefoon looks like telephone.",
    phraseChunks: ["de telefoon", "Ik pak mijn telefoon.", "Mijn telefoonnummer is ..."],
    relatedWords: ["telefoonnummer", "bellen", "bericht"],
    exampleSentence: { dutch: "Ik pak mijn telefoon.", meaning: lt("我拿我的手机。", "I take my phone.") },
  },
  tafel: {
    article: "de",
    plural: "tafels",
    meaning: lt("桌子", "table"),
    memoryHook: lt("tafel 和 table 是好朋友；家里/教室里都常见。", "tafel and table are close friends; common at home and in class."),
    englishBridge: "tafel is close to table.",
    phraseChunks: ["de tafel", "Het boek ligt op de tafel.", "aan tafel"],
    relatedWords: ["stoel", "boek", "kamer"],
    exampleSentence: { dutch: "Het boek ligt op de tafel.", meaning: lt("书在桌子上。", "The book is on the table.") },
  },
  stoel: {
    article: "de",
    plural: "stoelen",
    meaning: lt("椅子", "chair"),
    memoryHook: lt("stoel 是坐的东西；和 tafel 成对记：桌子和椅子。", "stoel is something you sit on; pair it with tafel: table and chair."),
    phraseChunks: ["de stoel", "Ik zit op de stoel.", "een tafel en een stoel"],
    relatedWords: ["tafel", "kamer"],
    exampleSentence: { dutch: "Ik zit op de stoel.", meaning: lt("我坐在椅子上。", "I sit on the chair.") },
  },
  jas: {
    article: "de",
    plural: "jassen",
    meaning: lt("外套", "coat"),
    memoryHook: lt("天气冷就穿 jas，和 koud 放一起记。", "When it is cold, you wear a jas; connect it with koud."),
    englishBridge: "clothing word for coat/jacket.",
    phraseChunks: ["een jas", "Ik heb een jas aan.", "Mijn jas is blauw."],
    relatedWords: ["trui", "broek", "schoenen", "koud"],
    exampleSentence: { dutch: "Ik heb een jas aan.", meaning: lt("我穿着外套。", "I am wearing a coat.") },
  },
  trui: {
    article: "de",
    plural: "truien",
    meaning: lt("毛衣", "sweater"),
    memoryHook: lt("trui 里的 ui 是荷兰语特殊音，天气冷时和 jas 一起记。", "The ui in trui is a Dutch special sound; connect it with cold-weather clothes."),
    phraseChunks: ["een trui", "Ik draag een trui.", "Mijn trui is warm."],
    relatedWords: ["jas", "broek", "schoenen", "koud"],
    exampleSentence: { dutch: "Ik draag een trui.", meaning: lt("我穿一件毛衣。", "I wear a sweater.") },
  },
  broek: {
    article: "de",
    plural: "broeken",
    meaning: lt("裤子", "pants"),
    memoryHook: lt("broek 是下半身穿的裤子，和 schoenen 放一组。", "broek is clothing for your legs; connect it with schoenen."),
    phraseChunks: ["een broek", "Ik draag een broek.", "Mijn broek is zwart."],
    relatedWords: ["jas", "trui", "schoenen", "sok"],
    exampleSentence: { dutch: "Ik draag een broek.", meaning: lt("我穿裤子。", "I wear pants.") },
  },
  sok: {
    article: "de",
    plural: "sokken",
    meaning: lt("袜子", "sock"),
    memoryHook: lt("sok 和 schoenen 一起记：先袜子，再鞋。", "sok goes with schoenen: socks first, then shoes."),
    phraseChunks: ["een sok", "twee sokken", "Ik draag sokken."],
    relatedWords: ["schoenen", "broek"],
    exampleSentence: { dutch: "Ik draag sokken.", meaning: lt("我穿袜子。", "I wear socks.") },
  },
  schoenen: {
    article: "de",
    plural: "schoenen",
    meaning: lt("鞋", "shoes"),
    memoryHook: lt("schoenen 里的 oe 要按荷兰语读；穿搭场景里和 sokken、broek、jas 一起记。", "The oe in schoenen is a Dutch sound; connect it with socks, pants, and coats."),
    englishBridge: "clothing word for shoes.",
    phraseChunks: ["de schoenen", "Ik draag schoenen.", "Mijn schoenen zijn zwart."],
    relatedWords: ["sok", "broek", "jas", "trui"],
    exampleSentence: { dutch: "Ik draag schoenen.", meaning: lt("我穿鞋。", "I wear shoes.") },
  },
};

const syllabusWordItems = dutchSyllabus
  .filter((level): level is (typeof dutchSyllabus)[number] & { level: CourseLevel } => ["A0", "A1", "A2", "B1"].includes(level.level))
  .flatMap((level) =>
    level.vocabularyThemes.flatMap((theme) =>
      theme.coreWords.map((entry, index) => syllabusWordToItem(level.level, theme, entry, index)),
    ),
  );

const publicVocabularyItems = publicVocabularyAdditions.flatMap((theme) =>
  theme.entries.map((entry, index) => publicAdditionToItem(theme, entry, index)),
);

const publicEntryKeyFor = (level: CourseLevel, theme: string, word: string) =>
  `${level}|${theme}|${word.toLowerCase()}`;

const publicEntryLevelKeyFor = (level: CourseLevel, word: string) =>
  `${level}|${word.toLowerCase()}`;

const publicVocabularyEntryByThemeWord = new Map(
  publicVocabularyAdditions.flatMap((theme) =>
    theme.entries.map((entry) => [
      publicEntryKeyFor(theme.level, theme.theme, entry[0]),
      { zh: entry[1], en: entry[2], article: entry[3] },
    ] as const),
  ),
);

const publicVocabularyEntryByLevelWord = new Map(
  publicVocabularyAdditions.flatMap((theme) =>
    theme.entries.map((entry) => [
      publicEntryLevelKeyFor(theme.level, entry[0]),
      { zh: entry[1], en: entry[2], article: entry[3] },
    ] as const),
  ),
);

type KnownVocabularyContent = {
  meaning: LocalizedText;
  article?: "de" | "het";
};

const rememberKnownContent = (
  map: Map<string, KnownVocabularyContent>,
  dutch: string,
  meaning: LocalizedText,
  article?: "de" | "het",
) => {
  const key = dutch.toLowerCase();
  const existing = map.get(key);
  if (!existing || (!existing.article && article)) {
    map.set(key, { meaning, article: article ?? existing?.article });
  }
};

const knownVocabularyContentByWord = (() => {
  const map = new Map<string, KnownVocabularyContent>();
  smartWords.forEach((word) => rememberKnownContent(map, word.dutch, word.meaning, word.article));
  dutchSyllabus.forEach((level) =>
    level.vocabularyThemes.forEach((theme) =>
      theme.coreWords.forEach((entry) => rememberKnownContent(map, entry.dutch, entry.meaning, entry.article)),
    ),
  );
  publicVocabularyAdditions.forEach((theme) =>
    theme.entries.forEach((entry) => rememberKnownContent(map, entry[0], lt(entry[1], entry[2]), entry[3])),
  );
  Object.entries(supplementMeaningOverrides).forEach(([dutch, meaning]) => rememberKnownContent(map, dutch, meaning));
  Object.entries(supplementOverrides).forEach(([dutch, override]) => {
    if (override.meaning) rememberKnownContent(map, dutch, override.meaning, override.article);
  });
  return map;
})();

const titleCaseFirst = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const supplementFallbackExampleFor = (word: WordItem): WordItem["exampleSentence"] => {
  const wordType = inferWordType(word);
  if (wordType === "verb") {
    return {
      dutch: `Ik wil ${word.dutch}.`,
      meaning: lt(`我想${word.meaning.zh}。`, `I want to ${word.meaning.en}.`),
    };
  }
  if (wordType === "adjective") {
    return {
      dutch: `Dat is ${word.dutch}.`,
      meaning: lt(`那很${word.meaning.zh}。`, `That is ${word.meaning.en}.`),
    };
  }
  if (word.article) {
    return emptyExampleSentence();
  }
  if (word.dutch.includes(" ")) {
    return {
      dutch: `${titleCaseFirst(word.dutch)}.`,
      meaning: word.meaning,
    };
  }
  return {
    dutch: `Ik gebruik ${word.dutch} in een zin.`,
    meaning: lt(`我在句子里使用${word.meaning.zh}。`, `I use ${word.meaning.en} in a sentence.`),
  };
};

const makeSupplementWord = (level: CourseLevel, seed: ThemeSeed, word: string, index: number): WordItem => {
  const override = supplementOverrides[word];
  const seedEntry =
    publicVocabularyEntryByThemeWord.get(publicEntryKeyFor(level, seed.theme, word)) ??
    publicVocabularyEntryByLevelWord.get(publicEntryLevelKeyFor(level, word));
  const knownContent = knownVocabularyContentByWord.get(word.toLowerCase());
  const hasCuratedSeed = Boolean(override || supplementMeaningOverrides[word] || seedEntry || knownContent);
  const article = override?.article ?? seedEntry?.article ?? knownContent?.article ?? articleFor(word);
  const actionExample = actionExampleFor(word);
  const isAction = Boolean(actionExample);
  const passive =
    (level === "A2" && (word.length > 13 || ["besluit", "bezwaar", "dekking", "vergunning"].includes(word))) ||
    (level === "B1" && (word.length > 22 || word.split(/\s+/).length > 4));
  const scenarioTags = scenarioTagsFor(level, seed.theme);
  const examRelevance = examRelevanceFor(level, scenarioTags);
  const meaning = override?.meaning ?? supplementMeaningOverrides[word] ?? (seedEntry ? lt(seedEntry.zh, seedEntry.en) : knownContent?.meaning ?? lt(`${seed.zh}词：${word}`, `${seed.en} word: ${word}`));
  const commonFields = {
    id: `vocab-${level.toLowerCase()}-${seed.theme}-${index}-${word.replace(/\s+/g, "-")}`,
    level,
    originalLevel: level,
    appearsInLevels: [...appearsInLevelsFor(level)],
    dutch: word,
    article,
    plural: override?.plural ?? (article ? pluralize(word) : undefined),
    meaning,
    theme: seed.theme,
    priority: passive ? "should" : "must",
    activeOrPassive: passive ? "recognition" : "active",
    examRelevance,
    levelConfidence: seedEntry ? "high" : hasCuratedSeed ? "medium" : "low",
    sourceTags: sourceTagsFor(level, !(seedEntry || knownContent), scenarioTags),
    scenarioTags,
    levelReason: hasCuratedSeed ? levelReasonFor(level, scenarioTags, false) : levelReasonFor(level, scenarioTags, true),
    reviewStatus: "approved",
    englishBridge: override?.englishBridge,
    relatedWords: override?.relatedWords ?? (shouldUseAutomaticNearbyRelations(level, seed.theme)
      ? nearbyRelatedWords(seed.words, word)
      : []),
    memoryLinks: override?.memoryLinks,
    audioText: word,
  } satisfies Omit<WordItem, "memoryHook" | "phraseChunks" | "exampleSentence">;

  const draft: WordItem = {
    ...commonFields,
    memoryHook: override?.memoryHook ?? lt(`先把 ${word} 放进常用搭配里记。`, `Remember ${word} through useful chunks first.`),
    phraseChunks: override?.phraseChunks ?? (isAction ? uniqueStrings([actionExample.phrase, actionExample.sentence, actionExample.command]) : []),
    exampleSentence: override?.exampleSentence ?? {
      ...(isAction ? { dutch: actionExample.sentence, meaning } : emptyExampleSentence()),
    },
  };
  const generatedExample = preferredGeneratedExample(draft);
  const generatedPhrases = generatedPhraseChunksFor(draft);
  const fallbackPhraseChunks = isAction
    ? uniqueStrings([actionExample.phrase, actionExample.sentence, actionExample.command])
    : article
      ? [`${article} ${word}`]
      : [word];
  const fallbackExample = supplementFallbackExampleFor(draft);
  const exampleDutch = generatedExample?.dutch ?? (draft.exampleSentence.dutch || fallbackExample.dutch);
  const exampleMeaning = generatedExample ? lt(generatedExample.meaningZh, generatedExample.meaningEn) : (draft.exampleSentence.meaning.zh ? draft.exampleSentence.meaning : fallbackExample.meaning);
  const defaultMemoryHook = article
    ? lt(
        `先整块记 ${article} ${word}，再跟常用搭配一起记。`,
        `Remember ${article} ${word} as one chunk, then attach it to useful phrases.`,
      )
    : isAction
      ? lt(
          `这是动词，重点看它放进句子后怎么用。`,
          `This is a verb, so focus on how it works inside sentences.`,
        )
      : lt(
          `先把 ${word} 放进能直接说出口的短句里记。`,
          `Remember ${word} inside a sentence you can actually say.`,
        );

  return applyContentOverride(normalizeGeneratedContent({
    ...draft,
    memoryHook: override?.memoryHook ?? defaultMemoryHook,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : fallbackPhraseChunks),
    exampleSentence: override?.exampleSentence ?? {
      dutch: exampleDutch,
      meaning: exampleMeaning,
    },
  }), override);
};

const uniqueWordItemsByDutch = (items: WordItem[]) => {
  const result = new Map<string, WordItem>();
  items.forEach((item) => {
    const key = item.dutch.toLowerCase();
    const existing = result.get(key);
    if (!existing) {
      result.set(key, item);
      return;
    }
    const existingScore = (existing.levelConfidence === "high" ? 3 : existing.levelConfidence === "medium" ? 2 : 1) + (existing.sourceTags.includes("generated") ? 0 : 2);
    const nextScore = (item.levelConfidence === "high" ? 3 : item.levelConfidence === "medium" ? 2 : 1) + (item.sourceTags.includes("generated") ? 0 : 2);
    if (nextScore > existingScore) result.set(key, item);
  });
  return Array.from(result.values());
};

const a1ToA2AuditWords = new Set([
  "geboorteplaats",
  "nationaliteit",
  "burgerlijke staat",
  "gescheiden",
  "mobiel",
  "huisnummer",
  "straatnaam",
  "woonplaats",
  "provincie",
  "vertaling",
  "tolk",
  "overstappen",
  "inchecken",
  "uitchecken",
  "ov-chipkaart",
  "postkantoor",
  "gemeentehuis",
  "ziekenhuis",
  "politiebureau",
  "balie",
  "wachtruimte",
  "parkeerplaats",
  "fietsenstalling",
  "sollicitatie",
  "ervaring",
  "opleiding",
  "verboden",
  "toegestaan",
  "openbaar",
  "privé",
  "nooduitgang",
  "aanmelden",
  "afmelden",
  "wachtwoord",
  "gebruikersnaam",
  "bevestigen",
  "annuleren",
  "formulier",
  "handtekening",
  "printen",
  "scannen",
  "kopiëren",
  "stempel",
  "mapje",
  "vergadering",
  "noteren",
  "afspreken",
  "uitleg",
  "opnieuw",
  "duidelijk",
  "afspraakkaart",
  "zorgkaart",
  "assistente",
  "wachtkamer",
  "apotheek",
  "huisartspraktijk",
  "tablet",
  "zalf",
  "slikken",
  "ademen",
  "vallen",
  "bloeden",
  "pijn doen",
  "gemeente",
  "loket",
  "nummer trekken",
  "brief",
  "bericht",
  "pakket",
  "afval",
  "paspoort",
  "rijbewijs",
  "kwijt",
  "gevonden",
  "meenemen",
  "niveau",
  "pauzeren",
  "doorgaan",
]);

const a2ToA1AuditWords = new Set([
  "boodschappen",
  "gezond",
  "koorts",
  "stoppen",
  "proberen",
  "vertellen",
  "weten",
  "denken",
  "meenemen",
  "dicht",
  "gratis",
  "eenvoudig",
  "rustig",
  "want",
  "daarom",
  "ook",
  "nog",
  "al",
]);

const b1AuditThemes = new Set([
  "work-contract-expanded",
  "job-search-expanded",
  "tax-benefit-expanded",
  "energy-water-expanded",
  "legal-safety-expanded",
  "education-training-expanded",
  "care-family-expanded",
  "travel-documents-expanded",
  "public-health-expanded",
  "workplace-communication-expanded",
  "neighborhood-society-expanded",
  "practical-reading-expanded",
]);

const b1AuditWords = new Set([
  "weduwe",
  "weduwnaar",
  "stationingang",
  "halteplaats",
  "marktkoopman",
  "pleincentrum",
  "waarborgsom",
  "contractduur",
  "huurverlaging",
  "oppervlakte",
  "huurvoorwaarden",
  "meterstand",
  "energieleverancier",
  "internetprovider",
  "stroomstoring",
  "verstopping",
  "geluidsoverlast",
  "arbeidscontract",
  "urencontract",
  "minimumloon",
  "brutoloon",
  "nettoloon",
  "vakantiegeld",
  "ploegendienst",
  "nachtdienst",
  "functioneringsgesprek",
  "arbeidsvoorwaarden",
  "personeelszaken",
  "iban",
  "overschrijving",
  "aanmaningskosten",
  "afschrift",
  "polisblad",
  "verzekerde",
  "zorgverlener",
  "machtiging",
  "inkomensverklaring",
  "belastingdienst",
  "beslistermijn",
  "afwijzing",
  "goedkeuring",
  "zodat",
  "hoewel",
  "voordat",
  "nadat",
  "volgens",
  "daarnaast",
  "bovendien",
  "namelijk",
  "daardoor",
  "berichtgeving",
  "paragraaf",
  "samenvatting",
  "waarschuwingstekst",
  "bestandsgrootte",
  "machtigingscode",
  "beveiliging",
  "privacyverklaring",
  "bevestigingspagina",
]);

const b1AuditThemePattern = /tax|energy|legal|safety|job-search|work-contract|workplace|public-health|travel-documents|care-family|education-training|neighborhood-society|practical-reading/i;

const auditLevelReason = (from: string, to: string) =>
  lt(
    `词汇等级审校：从 ${from} 主动词移出，当前更适合 ${to}。A1/A2 日包只保留高频生活和办事主动词。`,
    `Vocabulary level audit: moved out of active ${from}; better suited to ${to}. A1/A2 daily packs keep high-frequency daily and practical active words.`,
  );

const auditScenarioTagsFor = (item: WordItem, targetLevel: CourseLevel) => {
  const tags = new Set(item.scenarioTags);
  const normalizedDutch = item.dutch.toLowerCase();
  const normalizedTheme = item.theme.toLowerCase();

  if (targetLevel === "A1") {
    if (/boodschappen|kopen|betalen|gratis/.test(normalizedDutch) || normalizedTheme.includes("shopping")) tags.add("supermarket");
    if (/gezond|koorts|ziek|pijn/.test(normalizedDutch) || normalizedTheme.includes("health")) tags.add("health");
    if (/maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|morgen|avond|middag|vandaag|tijd/.test(normalizedDutch)) tags.add("time");
    if (/lopen|stoppen|proberen|vertellen|weten|denken|meenemen/.test(normalizedDutch)) tags.add("routine");
    if (/want|daarom|ook|nog|al/.test(normalizedDutch)) tags.add("function-word");
  }

  if (targetLevel === "A2") {
    if (/huisarts|dokter|apotheek|tablet|zalf|slikken|ademen|bloeden|pijn|medicijn/.test(normalizedDutch) || normalizedTheme.includes("health")) tags.add("health");
    if (/formulier|handtekening|printen|scannen|kopiëren|stempel|mapje/.test(normalizedDutch) || normalizedTheme.includes("office")) tags.add("form");
    if (/gemeente|loket|paspoort|rijbewijs/.test(normalizedDutch) || normalizedTheme.includes("civic")) tags.add("gemeente");
    if (/inchecken|uitchecken|overstappen|ov-chipkaart/.test(normalizedDutch)) tags.add("transport");
    if (/aanmelden|afmelden|wachtwoord|gebruikersnaam|bevestigen|annuleren/.test(normalizedDutch)) tags.add("digital");
  }

  return Array.from(tags);
};

const applyVocabularyLevelAudit = (item: WordItem): WordItem => {
  const normalizedDutch = item.dutch.toLowerCase();
  const moveA1ToA2 = item.originalLevel === "A1" && a1ToA2AuditWords.has(normalizedDutch);
  const moveA2ToA1 = item.originalLevel === "A2" && a2ToA1AuditWords.has(normalizedDutch);
  const moveToB1 =
    b1AuditWords.has(normalizedDutch) ||
    b1AuditThemes.has(item.theme) ||
    (item.originalLevel === "A2" && b1AuditThemePattern.test(item.theme));

  if (moveToB1) {
    const scenarioTags = auditScenarioTagsFor(item, "B1");
    return {
      ...item,
      level: "B1",
      originalLevel: "B1",
      appearsInLevels: [...appearsInLevelsFor("B1")],
      priority: "nice",
      examRelevance: examRelevanceFor("B1", scenarioTags),
      levelConfidence: "medium",
      sourceTags: sourceTagsFor("B1", false, scenarioTags),
      scenarioTags,
      levelReason: auditLevelReason(item.originalLevel, "B1 / later advanced life Dutch"),
    };
  }

  if (moveA1ToA2) {
    const scenarioTags = auditScenarioTagsFor(item, "A2");
    return {
      ...item,
      level: "A2",
      originalLevel: "A2",
      appearsInLevels: [...appearsInLevelsFor("A2")],
      examRelevance: examRelevanceFor("A2", scenarioTags),
      sourceTags: sourceTagsFor("A2", false, scenarioTags),
      scenarioTags,
      levelReason: auditLevelReason("A1", "A2 practical Dutch"),
    };
  }

  if (moveA2ToA1) {
    const scenarioTags = auditScenarioTagsFor(item, "A1");
    return {
      ...item,
      level: "A1",
      originalLevel: "A1",
      appearsInLevels: [...appearsInLevelsFor("A1")],
      priority: "must",
      examRelevance: examRelevanceFor("A1", scenarioTags),
      levelConfidence: "high",
      sourceTags: sourceTagsFor("A1", false, scenarioTags),
      scenarioTags,
      levelReason: auditLevelReason("A2", "A1 daily-life Dutch"),
    };
  }

  return item;
};

const priorityRank = { must: 3, should: 2, nice: 1 } as const;
const relevanceRank = { high: 3, medium: 2, low: 1 } as const;
const confidenceRank = { high: 3, medium: 2, low: 1 } as const;

const coreWordScore = (item: WordItem) =>
  priorityRank[item.priority] * 100 +
  relevanceRank[item.examRelevance] * 30 +
  confidenceRank[item.levelConfidence] * 12 +
  (item.sourceTags.includes("generated") ? 0 : 25) +
  (item.activeOrPassive === "active" ? 20 : 0) -
  Math.max(item.dutch.length - 14, 0);

const chooseCoreItems = (items: WordItem[], activeTarget: number, recognitionTarget = 0) => {
  const sortCore = (entries: WordItem[]) => [...entries].sort((a, b) => coreWordScore(b) - coreWordScore(a));
  const active = sortCore(items.filter((item) => item.activeOrPassive === "active")).slice(0, activeTarget);
  const recognition = recognitionTarget
    ? sortCore(items.filter((item) => item.activeOrPassive === "recognition")).slice(0, recognitionTarget)
    : [];
  return [...active, ...recognition];
};

const repeatToTarget = (items: WordItem[], target: number, level: CourseLevel, themes: ThemeSeed[]) => {
  const result = [...items];
  const usedDutch = new Set(result.map((item) => item.dutch.toLowerCase()));
  let themeIndex = 0;
  while (result.length < target && themeIndex < themes.length) {
    const seed = themes[themeIndex % themes.length];
    seed.words.forEach((word, index) => {
      if (result.length >= target) return;
      const key = word.toLowerCase();
      if (usedDutch.has(key)) return;
      result.push(makeSupplementWord(level, seed, word, index));
      usedDutch.add(key);
    });
    themeIndex += 1;
  }
  return result;
};

const baseWordItems = uniqueWordItemsByDutch([...smartWords.map(wordToItem), ...syllabusWordItems, ...publicVocabularyItems]).map(applyVocabularyLevelAudit);
const a0Items = repeatToTarget(baseWordItems.filter((item) => item.level === "A0"), 180, "A0", a1Themes.slice(0, 6));
const a1Items = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "A1"), 650, "A1", a1Themes), 650);
const a2StageItems = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "A2"), 720, "A2", a2Themes), 580, 140);
const b1StageItems = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "B1"), 920, "B1", b1Themes), 840, 80);
export const b1CandidateWordItems = b1StageItems;
const a2Items = repeatToTarget([...a0Items, ...a1Items, ...a2StageItems], 1550, "A2", a2Themes);

const isActionWord = (word: WordItem) => !word.article && !word.dutch.includes(" ") && Boolean(actionExampleFor(word.dutch));

const buildPatternExamples = (level: CourseLevel, words: WordItem[]) => {
  if (words.length === 0) {
    return [
      { pattern: "Ik leer Nederlands.", dutch: "Ik leer Nederlands.", zh: "我学荷兰语。", en: "I learn Dutch." },
      { pattern: "Ik oefen vandaag.", dutch: "Ik oefen vandaag.", zh: "我今天练习。", en: "I practice today." },
      { pattern: "Ik maak een zin.", dutch: "Ik maak een zin.", zh: "我造一个句子。", en: "I make a sentence." },
    ];
  }

  const noun = words.find((word) => word.article);
  const action = words.find(isActionWord);
  const first = words[0];
  const phrase = words.find((word) => word.phraseChunks.length > 0);

  if (level === "A0") {
    if (action) {
      const actionExample = actionExampleFor(action.dutch);
      return [
        { pattern: actionExample.sentence, dutch: actionExample.sentence, zh: `我练习：${actionExample.sentence}`, en: `Practice: ${actionExample.sentence}` },
        { pattern: actionExample.command ?? actionExample.phrase, dutch: actionExample.command ?? `${actionExample.phrase}.`, zh: `指令/短语：${actionExample.command ?? actionExample.phrase}`, en: `Command/chunk: ${actionExample.command ?? actionExample.phrase}` },
        { pattern: "Ik kan dit zeggen.", dutch: "Ik kan dit zeggen.", zh: "我可以说这个。", en: "I can say this." },
      ];
    }
    if (noun) {
      const lines = [
        noun.exampleSentence.dutch,
        ...usableSentenceLinesFor(noun, 3),
      ]
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line, index, array) => array.indexOf(line) === index)
        .slice(0, 3);

      if (lines.length > 0) {
        return lines.map((dutch) => {
          const meaning = dutch === noun.exampleSentence.dutch ? noun.exampleSentence.meaning : meaningForUsableSentence(dutch);
          return {
            pattern: dutch,
            dutch,
            zh: meaning.zh,
            en: meaning.en,
          };
        });
      }
    }
    return [
      { pattern: "Ik zeg ...", dutch: `Ik zeg ${first.dutch}.`, zh: `我说 ${first.meaning.zh}。`, en: `I say ${first.meaning.en}.` },
      { pattern: "... alstublieft", dutch: `${first.dutch} alstublieft.`, zh: `请说/用 ${first.meaning.zh}。`, en: `${first.meaning.en}, please.` },
      { pattern: "Dat is ...", dutch: `Dat is ${first.dutch}.`, zh: `那是 ${first.meaning.zh}。`, en: `That is ${first.meaning.en}.` },
    ];
  }

  if (level === "A1") {
    if (noun) {
      return usableSentenceLinesFor(noun, 3).map((dutch) => ({
        pattern: dutch,
        dutch,
        zh: meaningForUsableSentence(dutch).zh,
        en: meaningForUsableSentence(dutch).en,
      }));
    }
    if (action) {
      const actionExample = actionExampleFor(action.dutch);
      return [
        { pattern: actionExample.sentence, dutch: actionExample.sentence, zh: `我练习：${actionExample.sentence}`, en: `Practice: ${actionExample.sentence}` },
        { pattern: "Ik doe dit vandaag.", dutch: "Ik doe dit vandaag.", zh: "我今天做这个。", en: "I do this today." },
        { pattern: "Wanneer doe je dit?", dutch: "Wanneer doe je dit?", zh: "你什么时候做这个？", en: "When do you do this?" },
      ];
    }
  }

  if (phrase) {
    const chunk = phrase.phraseChunks[0] ?? phrase.exampleSentence.dutch;
    const practicalSentence = phrase.exampleSentence.dutch;
    return [
      { pattern: "Ik wil graag hulp.", dutch: "Ik wil graag hulp.", zh: "我想要帮助。", en: "I would like help." },
      { pattern: "Kunt u mij helpen met ...?", dutch: `Kunt u mij helpen met ${phrase.dutch}?`, zh: `您能帮我处理${phrase.meaning.zh}吗？`, en: `Can you help me with ${phrase.meaning.en}?` },
      { pattern: chunk, dutch: practicalSentence, zh: `实用例句：${phrase.meaning.zh}。`, en: `Practical example: ${phrase.meaning.en}.` },
    ];
  }

  return [
    { pattern: "Ik leer dit woord.", dutch: "Ik leer dit woord.", zh: "我学习这个词。", en: "I learn this word." },
    { pattern: "Ik zeg dit woord.", dutch: "Ik zeg dit woord.", zh: "我说这个词。", en: "I say this word." },
    { pattern: "Wat betekent ...?", dutch: `Wat betekent ${first.dutch}?`, zh: `${first.meaning.zh}是什么意思？`, en: `What does ${first.meaning.en} mean?` },
  ];
};

const sentencePatternFor = (level: CourseLevel, dayNumber: number, words: WordItem[]): SentencePattern[] =>
  buildPatternExamples(level, words).map((example, index) => ({
    id: `pattern-${level.toLowerCase()}-${dayNumber}-${index + 1}`,
    level,
    pattern: example.pattern,
    meaning: lt("可重复套用的句型。", "Reusable sentence pattern."),
    usageScene: lt("今日输出句。", "Today's output sentence."),
    examples: [{ dutch: example.dutch, meaning: lt(example.zh, example.en) }],
    commonMistake: lt("不要只背词，要把词放进真正能说的句子。", "Do not learn words alone; put them into a sentence you can actually say."),
  }));

const practiceSceneForWord = (word: WordItem): LocalizedText => {
  const tags = [word.theme, ...word.scenarioTags].map((tag) => tag.toLowerCase());
  if (tags.some((tag) => tag.includes("public") || tag.includes("sign"))) return lt("公共标识、入口出口、推拉提示。", "Public signs, entrances/exits, and push/pull notices.");
  if (tags.some((tag) => tag.includes("leisure") || tag.includes("hobby"))) return lt("休闲、爱好、假期和日常活动。", "Leisure, hobbies, holidays, and daily activities.");
  if (tags.some((tag) => tag.includes("transport") || tag.includes("travel"))) return lt("交通、路线、车站和出行。", "Transport, routes, stations, and travel.");
  if (tags.some((tag) => tag.includes("shopping") || tag.includes("supermarket") || tag.includes("food"))) return lt("购物、超市、吃喝和付款。", "Shopping, supermarket, food/drinks, and payment.");
  if (tags.some((tag) => tag.includes("health") || tag.includes("pharmacy") || tag.includes("body"))) return lt("看病、药房、身体不舒服。", "Doctor visits, pharmacy, and illness.");
  if (tags.some((tag) => tag.includes("form") || tag.includes("gemeente") || tag.includes("document"))) return lt("表格、市政厅、文件办理。", "Forms, municipality, and document tasks.");
  if (tags.some((tag) => tag.includes("work") || tag.includes("job"))) return lt("工作、同事、请假和合同。", "Work, colleagues, sick leave, and contracts.");
  if (tags.some((tag) => tag.includes("housing") || tag.includes("rent"))) return lt("住房、租房、搬家和维修。", "Housing, renting, moving, and repairs.");
  if (tags.some((tag) => tag.includes("email") || tag.includes("phone") || tag.includes("letter"))) return lt("邮件、电话和日常沟通。", "Email, phone calls, and daily communication.");
  return lt("日常生活和真实对话。", "Daily life and real conversations.");
};

const phraseChunksFor = (level: CourseLevel, dayNumber: number, words: WordItem[]): PhraseChunk[] =>
  words.slice(0, level === "A0" ? 3 : 5).map((word, index) => {
    const dutch = primaryUsableSentenceFor(word);
    const usageScene = practiceSceneForWord(word);
    return {
      id: `chunk-${level.toLowerCase()}-${dayNumber}-${index + 1}`,
      level,
      dutch,
      meaning: lt("", ""),
      usageScene,
      relatedWords: [word.dutch],
      exampleSentence: word.exampleSentence,
      audioText: dutch,
    };
  });

const daySizeFor = (level: CourseLevel) => {
  if (level === "A0") return 9;
  if (level === "A1") return 10;
  if (level === "B1") return 12;
  return 12;
};
const daysFor = (level: CourseLevel) => vocabularyLevelPlans.find((plan) => plan.level === level)?.totalDays ?? 20;

const makeDayPacks = (level: CourseLevel, items: WordItem[]): WordDayPack[] => {
  const daySize = daySizeFor(level);
  const totalDays = daysFor(level);
  return Array.from({ length: totalDays }, (_, dayIndex) => {
    const start = dayIndex * daySize;
    const words = items.slice(start, start + daySize);
    return {
      id: `${level.toLowerCase()}-word-day-${dayIndex + 1}`,
      level,
      dayNumber: dayIndex + 1,
      titleZh: `${vocabularyLevelPlans.find((plan) => plan.level === level)?.titleZh ?? level} Day ${dayIndex + 1}`,
      titleEn: `${vocabularyLevelPlans.find((plan) => plan.level === level)?.titleEn ?? level} Day ${dayIndex + 1}`,
      words,
      phraseChunks: phraseChunksFor(level, dayIndex + 1, words),
      sentencePatterns: sentencePatternFor(level, dayIndex + 1, words),
      outputTask: lt("用今日核心词、短语块和句型说一句完整句。", "Use today's core words, phrase chunks, and pattern to say one complete sentence."),
    };
  });
};

export const wordDayPacks: WordDayPack[] = [
  ...makeDayPacks("A0", a0Items),
  ...makeDayPacks("A1", a1Items),
  ...makeDayPacks("A2", a2Items),
  ...makeDayPacks("B1", b1StageItems),
];

export const wordItems: WordItem[] = [...a0Items, ...a1Items, ...a2StageItems, ...b1StageItems];
