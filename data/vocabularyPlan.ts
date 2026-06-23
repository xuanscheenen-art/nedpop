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
    targetWordRange: "400-500 active words",
    currentWordCount: 450,
    dailyWordCount: "10 active words + review",
    totalDays: 45,
    description: lt("A1 是基础准备层：只保留个人、家庭、时间、购物、交通、住处、学校工作和简单健康的高频主动词。", "A1 is a foundation layer: high-frequency active words for personal details, family, time, shopping, transport, home, school/work, and simple health."),
  },
  {
    level: "A2",
    titleZh: "A2 生活任务",
    titleEn: "A2 Practical Life Tasks",
    targetWordRange: "420-500 practical words",
    currentWordCount: 490,
    dailyWordCount: "10 active words + 0-2 recognition words",
    totalDays: 42,
    cumulativeTargetForA2: "1000-1200 reviewed words",
    description: lt("A2 是生活任务包：围绕医生、市政厅、表格、住房、工作请假、交通延误、账单保险、邮件和电话保留实用主动词；更专业内容先放入 B1 候选。", "A2 is a practical life-task pack: active words for GP, municipality, forms, housing, sick leave, transport delays, bills/insurance, emails, and calls; more specialized content is moved to B1 candidates."),
  },
  {
    level: "B1",
    titleZh: "B1 工作学习任务",
    titleEn: "B1 Work & Study Tasks",
    targetWordRange: "500-700 focused B1 layer words",
    currentWordCount: 560,
    dailyWordCount: "12 active words + review/recognition",
    totalDays: 42,
    description: lt("B1 对齐 Staatsexamen Nt2 Programma I 的方向：工作、mbo 学习、官方文字和日常公共信息。官方 B1 需要约 4000-5000 总词汇量；这里先补 NedPop 的可学习 B1 核心层。", "B1 follows the direction of Staatsexamen Nt2 Programma I: work, mbo study, official texts, and daily public information. Official B1 assumes about 4000-5000 known words overall; this is NedPop's focused learnable B1 layer."),
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
]);

const scenarioTagsFor = (level: CourseLevel, theme: string): string[] => {
  const normalized = theme.toLowerCase();
  const tags: string[] = [];
  if (normalized.includes("greeting")) tags.push("greeting");
  if (normalized.includes("identity") || normalized.includes("introduction") || normalized.includes("self") || normalized.includes("people")) tags.push("identity");
  if (normalized.includes("personal") || normalized.includes("details")) tags.push("personal-info");
  if (normalized.includes("country") || normalized.includes("countries")) tags.push("countries");
  if (normalized.includes("language") || normalized.includes("languages") || normalized.includes("translation")) tags.push("languages");
  if (normalized.includes("number")) tags.push("numbers");
  if (normalized.includes("time") || normalized.includes("date") || normalized.includes("appointment")) tags.push("time");
  if (normalized.includes("family")) tags.push("family");
  if (normalized.includes("supermarket") || normalized.includes("shopping") || normalized.includes("food")) tags.push("supermarket");
  if (normalized.includes("transport") || normalized.includes("train")) tags.push("transport");
  if (normalized.includes("home") || normalized.includes("housing") || normalized.includes("rent")) tags.push("housing");
  if (normalized.includes("health") || normalized.includes("gp") || normalized.includes("pharmacy") || normalized.includes("body")) tags.push("health");
  if (normalized.includes("appointment") || normalized.includes("booking") || normalized.includes("changes")) tags.push("appointment");
  if (normalized.includes("municipality") || normalized.includes("gemeente")) tags.push("gemeente");
  if (normalized.includes("work")) tags.push("work");
  if (normalized.includes("job") || normalized.includes("sollicitatie")) tags.push("work");
  if (normalized.includes("education") || normalized.includes("training") || normalized.includes("study") || normalized.includes("mbo")) tags.push("education");
  if (normalized.includes("writing") || normalized.includes("reading") || normalized.includes("text") || normalized.includes("letter")) tags.push("reading", "writing");
  if (normalized.includes("digital") || normalized.includes("online") || normalized.includes("digi")) tags.push("digital");
  if (normalized.includes("tax") || normalized.includes("benefit") || normalized.includes("money")) tags.push("tax", "benefits", "bill");
  if (normalized.includes("safety") || normalized.includes("law") || normalized.includes("legal")) tags.push("safety", "law");
  if (normalized.includes("community") || normalized.includes("news") || normalized.includes("society")) tags.push("society");
  if (normalized.includes("service")) tags.push("complaint");
  if (normalized.includes("sick")) tags.push("sick-leave");
  if (normalized.includes("insurance")) tags.push("insurance");
  if (normalized.includes("bill") || normalized.includes("payment") || normalized.includes("money")) tags.push("bill");
  if (normalized.includes("email") || normalized.includes("message") || normalized.includes("letter")) tags.push("email");
  if (normalized.includes("form") || normalized.includes("document") || normalized.includes("office")) tags.push("form");
  if (normalized.includes("phone")) tags.push("phone-call");
  if (normalized.includes("complaint") || normalized.includes("problem") || normalized.includes("repair")) tags.push("complaint");
  return Array.from(new Set(tags));
};

const examRelevanceFor = (level: CourseLevel, scenarioTags: string[]): ExamRelevance => {
  if (level === "B1" && scenarioTags.some((tag) => ["work", "education", "reading", "writing", "digital", "tax", "benefits", "safety", "society"].includes(tag))) return "high";
  if (level === "B1" && scenarioTags.some((tag) => practicalScenarioTags.has(tag))) return "medium";
  if (level === "A2" && scenarioTags.some((tag) => practicalScenarioTags.has(tag))) return "high";
  if (level === "A1" && scenarioTags.some((tag) => ["time", "family", "supermarket", "transport", "housing", "health"].includes(tag))) return "medium";
  if (level === "A0" && scenarioTags.some((tag) => ["greeting", "identity", "numbers"].includes(tag))) return "low";
  return level === "A2" ? "medium" : "low";
};

const sourceTagsFor = (level: CourseLevel, generated: boolean, scenarioTags: string[]): SourceTag[] => {
  if (generated) return ["generated"];
  const tags: SourceTag[] = ["manual", "frequency"];
  if (level === "B1") tags.push("staatsexamen-nt2");
  if (level === "A0") tags.push("naar-nederland");
  if (level === "A1") tags.push("nt2-taalmenu");
  if (level === "A2" && scenarioTags.some((tag) => ["appointment", "gemeente", "form", "health", "email", "phone-call"].includes(tag))) {
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
    return lt("B1 工作学习词：用于 Programma I 常见的工作、mbo 学习、官方文字和公共生活信息。", "B1 work/study word for Programma I-style work, mbo study, official texts, and public-life information.");
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

const shouldUseAutomaticNearbyRelations = (level: CourseLevel, theme: string) =>
  level !== "B1" && ![
    "complaints-expanded",
    "email-letter-expanded",
    "legal-safety-expanded",
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

const curatedWordOverrides: Record<
  string,
  Partial<Pick<WordItem, "article" | "plural" | "meaning" | "memoryHook" | "englishBridge" | "phraseChunks" | "relatedWords" | "exampleSentence">>
> = {
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
  const override = curatedWordOverrides[word.dutch];
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
  return normalizeGeneratedContent({
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
    exampleSentence,
    audioText: word.dutch,
  });
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
    exampleSentence:
      override?.exampleSentence ??
      (actionExample
        ? { dutch: actionExample.sentence, meaning: entry.meaning }
        : emptyExampleSentence()),
    audioText: entry.dutch,
  };

  const generatedExample = preferredGeneratedExample(draft);
  const generatedPhrases = generatedPhraseChunksFor(draft);

  return normalizeGeneratedContent({
    ...draft,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : draft.phraseChunks),
    exampleSentence: override?.exampleSentence ?? (generatedExample
      ? {
          dutch: generatedExample.dutch,
          meaning: lt(generatedExample.meaningZh, generatedExample.meaningEn),
        }
      : draft.exampleSentence),
  });
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
    levelConfidence: "medium",
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
    exampleSentence:
      override?.exampleSentence ??
      (actionExample
        ? { dutch: actionExample.sentence, meaning }
        : emptyExampleSentence()),
    audioText: dutch,
  };

  const generatedExample = preferredGeneratedExample(draft);
  const generatedPhrases = generatedPhraseChunksFor(draft);

  return normalizeGeneratedContent({
    ...draft,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : draft.phraseChunks),
    exampleSentence: override?.exampleSentence ?? (generatedExample
      ? {
          dutch: generatedExample.dutch,
          meaning: lt(generatedExample.meaningZh, generatedExample.meaningEn),
        }
      : draft.exampleSentence),
  });
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

const supplementOverrides: Record<
  string,
  Partial<Pick<WordItem, "article" | "plural" | "meaning" | "memoryHook" | "englishBridge" | "phraseChunks" | "relatedWords" | "exampleSentence">>
> = {
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

const makeSupplementWord = (level: CourseLevel, seed: ThemeSeed, word: string, index: number): WordItem => {
  const override = supplementOverrides[word];
  const hasCuratedSeed = Boolean(override || supplementMeaningOverrides[word]);
  const article = override?.article ?? articleFor(word);
  const actionExample = actionExampleFor(word);
  const isAction = Boolean(actionExample);
  const passive =
    (level === "A2" && (word.length > 13 || ["besluit", "bezwaar", "dekking", "vergunning"].includes(word))) ||
    (level === "B1" && (word.length > 22 || word.split(/\s+/).length > 4));
  const scenarioTags = scenarioTagsFor(level, seed.theme);
  const examRelevance = examRelevanceFor(level, scenarioTags);
  const meaning = override?.meaning ?? supplementMeaningOverrides[word] ?? lt(`${seed.zh}词：${word}`, `${seed.en} word: ${word}`);
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
    levelConfidence: hasCuratedSeed ? "medium" : "low",
    sourceTags: sourceTagsFor(level, true, scenarioTags),
    scenarioTags,
    levelReason: hasCuratedSeed ? levelReasonFor(level, scenarioTags, false) : levelReasonFor(level, scenarioTags, true),
    reviewStatus: "approved",
    englishBridge: override?.englishBridge,
    relatedWords: override?.relatedWords ?? (shouldUseAutomaticNearbyRelations(level, seed.theme)
      ? nearbyRelatedWords(seed.words, word)
      : []),
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
      : [];
  const exampleDutch = generatedExample?.dutch ?? draft.exampleSentence.dutch;
  const exampleMeaning = generatedExample ? lt(generatedExample.meaningZh, generatedExample.meaningEn) : draft.exampleSentence.meaning;
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

  return normalizeGeneratedContent({
    ...draft,
    memoryHook: override?.memoryHook ?? defaultMemoryHook,
    phraseChunks: override?.phraseChunks ?? (generatedPhrases.length ? generatedPhrases : fallbackPhraseChunks),
    exampleSentence: override?.exampleSentence ?? {
      dutch: exampleDutch,
      meaning: exampleMeaning,
    },
  });
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

const b1AuditThemePattern = /tax|benefit|energy|legal|safety|job-search|work-contract|workplace|public-health|travel-documents|care-family|education-training|neighborhood-society|practical-reading/i;

const auditLevelReason = (from: string, to: string) =>
  lt(
    `词汇等级审校：从 ${from} 主动词移出，当前更适合 ${to}。A1/A2 日包只保留高频生活和办事主动词。`,
    `Vocabulary level audit: moved out of active ${from}; better suited to ${to}. A1/A2 daily packs keep high-frequency daily and practical active words.`,
  );

const applyVocabularyLevelAudit = (item: WordItem): WordItem => {
  const normalizedDutch = item.dutch.toLowerCase();
  const moveA1ToA2 = item.originalLevel === "A1" && a1ToA2AuditWords.has(normalizedDutch);
  const moveToB1 =
    b1AuditWords.has(normalizedDutch) ||
    b1AuditThemes.has(item.theme) ||
    (item.originalLevel === "A2" && b1AuditThemePattern.test(item.theme));

  if (moveToB1) {
    return {
      ...item,
      originalLevel: "B1",
      appearsInLevels: ["B1"],
      priority: "nice",
      examRelevance: "low",
      levelConfidence: "medium",
      levelReason: auditLevelReason(item.originalLevel, "B1 / later advanced life Dutch"),
    };
  }

  if (moveA1ToA2) {
    return {
      ...item,
      originalLevel: "A2",
      appearsInLevels: ["A2"],
      examRelevance: item.examRelevance === "high" ? "high" : "medium",
      levelReason: auditLevelReason("A1", "A2 practical Dutch"),
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
const a1Items = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "A1"), 450, "A1", a1Themes), 450);
const a2StageItems = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "A2"), 500, "A2", a2Themes), 430, 70);
const b1StageItems = chooseCoreItems(repeatToTarget(baseWordItems.filter((item) => item.originalLevel === "B1"), 560, "B1", b1Themes), 500, 60);
export const b1CandidateWordItems = b1StageItems;
const a2Items = repeatToTarget([...a0Items, ...a1Items, ...a2StageItems], 1100, "A2", a2Themes);

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

const phraseChunksFor = (level: CourseLevel, dayNumber: number, words: WordItem[]): PhraseChunk[] =>
  words.slice(0, level === "A0" ? 3 : 5).map((word, index) => {
    const dutch = primaryUsableSentenceFor(word);
    return {
      id: `chunk-${level.toLowerCase()}-${dayNumber}-${index + 1}`,
      level,
      dutch,
      meaning: lt("", ""),
      usageScene: lt(`和 ${word.theme} 场景一起练。`, `Practice inside the ${word.theme} scene.`),
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
