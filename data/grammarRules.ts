import type { GrammarRule, LocalizedText, MiniQuiz, NounEntry, PluralEntry, SentencePattern, VerbEntry } from "@/types/course";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });
const q = (id: string, zh: string, en: string, answer: string): MiniQuiz => ({
  id,
  question: lt(zh, en),
  options: [lt(answer, answer), lt("另一个形式", "another form"), lt("不确定", "not sure")],
  answerIndex: 0,
  explanation: lt("先看 pattern，再套进句子。", "Look at the pattern, then place it into the sentence."),
});

const rule = (
  id: string,
  level: GrammarRule["level"],
  category: GrammarRule["category"],
  zh: string,
  en: string,
  explanationZh: string,
  explanationEn: string,
  pattern: string,
  exampleDutch: string,
): GrammarRule => ({
  id,
  level,
  category,
  title: lt(zh, en),
  explanation: lt(explanationZh, explanationEn),
  memoryHook: lt("把规则当成固定积木，不要每次重新翻译。", "Treat the rule as a fixed block, not a translation puzzle."),
  pattern,
  examples: [{ dutch: exampleDutch, meaning: lt("看 Dutch 句子里的位置。", "Notice the position in the Dutch sentence.") }],
  commonMistakes: [{ wrong: "Ik werkt.", correct: "Ik werk.", explanation: lt("ik 后面用 stem。", "Use the stem after ik.") }],
  miniQuiz: [q(`${id}-quiz`, `${zh} 怎么用？`, `How do you use ${en}?`, exampleDutch)],
});

export const grammarRules: GrammarRule[] = [
  rule("grammar-a0-ik-ben", "A0", "verb", "基础句：Ik ben ...", "Basic sentence: Ik ben ...", "A0 先用 Ik ben 说身份和状态。", "Use Ik ben for identity and state.", "Ik ben + word", "Ik ben Lin."),
  rule("grammar-a0-zijn", "A0", "verb", "zijn 基础", "zijn basics", "zijn 是“是/在”的核心动词。", "zijn is a core verb for being.", "ik ben / jij bent / hij is", "Ik ben ziek."),
  rule("grammar-a0-hebben", "A0", "verb", "hebben 基础", "hebben basics", "hebben 表示“有”。", "hebben means to have.", "ik heb / jij hebt / hij heeft", "Ik heb een boek."),
  rule("grammar-a0-question", "A0", "word-order", "简单疑问句：Ben jij ...?", "simple question: Ben jij ...?", "把动词放到前面，就能问 yes/no。", "Put the verb first for yes/no questions.", "Verb + subject + rest?", "Ben jij Anna?"),
  rule("grammar-a1-present", "A1", "verb", "规则动词现在时", "regular present tense", "ik 用 stem，jij/hij/zij 加 t，复数用 infinitive。", "ik uses stem; jij/hij/zij add t; plurals use infinitive.", "ik = stem; jij = stem+t; wij = infinitive", "Ik werk. Jij werkt. Wij werken."),
  rule("grammar-a1-v2", "A1", "word-order", "V2 词序", "V2 word order", "限定动词永远在第二位置。", "The finite verb takes position 2.", "position 1 + finite verb + subject + rest", "Morgen ga ik naar school."),
  rule("grammar-a1-article", "A1", "article", "基础 de/het", "basic de/het", "有些词有线索，有些词要靠接触记忆。", "Some articles have clues; others need exposure.", "de/het + noun", "Het huis is groot."),
  rule("grammar-a1-plural", "A1", "plural", "基础复数", "basic plurals", "常见复数是 -en 或 -s。", "Common plurals use -en or -s.", "noun + en/s", "Ik lees twee boeken."),
  rule("grammar-a1-niet-geen", "A1", "negation", "niet / geen", "niet / geen", "geen 用在没有冠词的不定名词前，niet 否定其他信息。", "geen negates indefinite nouns; niet negates other information.", "geen + noun / niet + rest", "Ik heb geen fiets."),
  rule("grammar-a1-time-place", "A1", "word-order", "时间和地点顺序", "time and place order", "基础句里常先时间后地点。", "In basic sentences, time often comes before place.", "time before place", "Ik ga morgen naar school."),
  rule("grammar-a2-modal", "A2", "modal", "情态动词 + 原形", "modal verb + infinitive", "情态动词在第二位，主要动词去句尾。", "The modal is in position 2; the main verb goes to the end.", "subject + modal + rest + infinitive", "Ik wil een afspraak maken."),
  rule("grammar-a2-perfect", "A2", "verb", "完成时基础", "perfect tense basics", "用 hebben/zijn 加过去分词讲已经发生的事。", "Use hebben/zijn plus participle for completed actions.", "heb/ben + participle", "Ik heb gewerkt."),
  rule("grammar-a2-separable", "A2", "separable-verb", "可分动词", "separable verbs", "前缀常移动到句尾。", "The prefix often moves to the end.", "verb + rest + prefix", "Ik bel de huisarts op."),
  rule("grammar-a2-article-patterns", "A2", "article", "更多 de/het pattern", "more de/het patterns", "-ing 多数 de，-je 多数 het，复合词看最后词。", "-ing is often de, -je is usually het, compounds follow the final noun.", "article clue + exposure", "De verzekering is duur."),
  rule("grammar-a2-email", "A2", "word-order", "写一封简单邮件", "writing a simple email", "邮件要有称呼、目的、问题和结尾。", "A simple email needs greeting, purpose, question, and closing.", "greeting + message + closing", "Beste meneer Jansen, ik heb een vraag."),
];

const verb = (
  id: string,
  level: VerbEntry["level"],
  infinitive: string,
  zh: string,
  en: string,
  isIrregular: boolean,
  forms: VerbEntry["presentTense"],
  sentence: string,
): VerbEntry => ({
  id,
  level,
  infinitive,
  meaning: lt(zh, en),
  isIrregular,
  stem: forms.ik,
  presentTense: forms,
  exampleSentence: { dutch: sentence, meaning: lt("荷兰语例句。", "Dutch example sentence.") },
  commonMistake: isIrregular ? lt("不规则动词要作为整块记。", "Memorize irregular verbs as chunks.") : lt("ik 后面不要加 t。", "Do not add t after ik."),
});

export const verbEntries: VerbEntry[] = [
  verb("verb-zijn", "A0", "zijn", "是", "be", true, { ik: "ben", jij: "bent", hijZijHet: "is", wij: "zijn", jullie: "zijn", zij: "zijn" }, "Ik ben ziek."),
  verb("verb-hebben", "A0", "hebben", "有", "have", true, { ik: "heb", jij: "hebt", hijZijHet: "heeft", wij: "hebben", jullie: "hebben", zij: "hebben" }, "Ik heb een afspraak."),
  verb("verb-wonen", "A0", "wonen", "居住", "live", false, { ik: "woon", jij: "woont", hijZijHet: "woont", wij: "wonen", jullie: "wonen", zij: "wonen" }, "Ik woon in Utrecht."),
  verb("verb-komen", "A0", "komen", "来", "come", false, { ik: "kom", jij: "komt", hijZijHet: "komt", wij: "komen", jullie: "komen", zij: "komen" }, "Ik kom uit China."),
  verb("verb-gaan", "A1", "gaan", "去", "go", true, { ik: "ga", jij: "gaat", hijZijHet: "gaat", wij: "gaan", jullie: "gaan", zij: "gaan" }, "Ik ga naar school."),
  verb("verb-maken", "A1", "maken", "做/制作", "make", false, { ik: "maak", jij: "maakt", hijZijHet: "maakt", wij: "maken", jullie: "maken", zij: "maken" }, "Ik maak een afspraak."),
  verb("verb-werken", "A1", "werken", "工作", "work", false, { ik: "werk", jij: "werkt", hijZijHet: "werkt", wij: "werken", jullie: "werken", zij: "werken" }, "Ik werk vandaag."),
  verb("verb-kopen", "A1", "kopen", "买", "buy", false, { ik: "koop", jij: "koopt", hijZijHet: "koopt", wij: "kopen", jullie: "kopen", zij: "kopen" }, "Ik koop brood."),
  verb("verb-kunnen", "A2", "kunnen", "能够", "can", true, { ik: "kan", jij: "kunt/kan", hijZijHet: "kan", wij: "kunnen", jullie: "kunnen", zij: "kunnen" }, "Ik kan Nederlands spreken."),
  verb("verb-moeten", "A2", "moeten", "必须", "must", true, { ik: "moet", jij: "moet", hijZijHet: "moet", wij: "moeten", jullie: "moeten", zij: "moeten" }, "Ik moet een formulier invullen."),
  verb("verb-willen", "A2", "willen", "想要", "want", true, { ik: "wil", jij: "wilt/wil", hijZijHet: "wil", wij: "willen", jullie: "willen", zij: "willen" }, "Ik wil een afspraak maken."),
  verb("verb-opbellen", "A2", "opbellen", "打电话", "call up", false, { ik: "bel op", jij: "belt op", hijZijHet: "belt op", wij: "bellen op", jullie: "bellen op", zij: "bellen op" }, "Ik bel de huisarts op."),
];

export const nounEntries: NounEntry[] = [
  ["noun-huis", "huis", "het", "huizen", "房子", "house", "A1"],
  ["noun-fiets", "fiets", "de", "fietsen", "自行车", "bike", "A1"],
  ["noun-station", "station", "het", "stations", "车站", "station", "A1"],
  ["noun-supermarkt", "supermarkt", "de", "supermarkten", "超市", "supermarket", "A1"],
  ["noun-brood", "brood", "het", "broden", "面包", "bread", "A1"],
  ["noun-trein", "trein", "de", "treinen", "火车", "train", "A1"],
  ["noun-ziekenhuis", "ziekenhuis", "het", "ziekenhuizen", "医院", "hospital", "A2"],
  ["noun-huisarts", "huisarts", "de", "huisartsen", "家庭医生", "GP", "A2"],
  ["noun-afspraak", "afspraak", "de", "afspraken", "预约", "appointment", "A2"],
  ["noun-gemeente", "gemeente", "de", "gemeenten", "市政厅", "municipality", "A2"],
  ["noun-verzekering", "verzekering", "de", "verzekeringen", "保险", "insurance", "A2"],
  ["noun-woning", "woning", "de", "woningen", "住房", "home", "A2"],
  ["noun-rekening", "rekening", "de", "rekeningen", "账单", "bill", "A2"],
].map(([id, singular, article, plural, zh, en, level]) => ({
  id,
  singular,
  article: article as "de" | "het",
  plural,
  meaning: lt(zh, en),
  level: level as NounEntry["level"],
  ruleHint: lt(article === "het" ? "这个词用 het，作为整块记。" : "这个词用 de，注意搭配。", article === "het" ? "This word uses het; learn it as a chunk." : "This word uses de; learn the pair."),
  memoryHook: lt(`${article} ${singular}`, `${article} ${singular}`),
  exampleSentence: { dutch: `${article === "het" ? "Het" : "De"} ${singular} is belangrijk.`, meaning: lt("这是一个简单例句。", "This is a simple example sentence.") },
}));

export const pluralEntries: PluralEntry[] = nounEntries.map((noun) => ({
  id: `plural-${noun.id}`,
  singular: noun.singular,
  plural: noun.plural,
  ruleExplanation: lt("看词尾和常见 pattern，再多接触例子。", "Notice the ending pattern and build exposure."),
  exampleSentence: { dutch: `Ik zie twee ${noun.plural}.`, meaning: lt("我看到两个/多个。", "I see two/multiple items.") },
  miniQuiz: [q(`plural-${noun.id}-quiz`, `${noun.singular} 的复数是什么？`, `What is the plural of ${noun.singular}?`, noun.plural)],
}));

export const sentencePatterns: SentencePattern[] = [
  { id: "sentence-v2-basic", level: "A1", title: lt("V2 基础", "V2 basic order"), rule: lt("限定动词在第二位。", "The finite verb takes position 2."), visualBlocks: ["Ik", "ga", "morgen", "naar school"], example: { dutch: "Ik ga morgen naar school.", meaning: lt("我明天去学校。", "I go to school tomorrow.") }, explanation: lt("Ik 是第一位，ga 是第二位。", "Ik is position 1, ga is position 2.") },
  { id: "sentence-time-first", level: "A1", title: lt("时间放前面", "Time first"), rule: lt("Morgen 第一位时，ga 仍然第二位。", "If Morgen is first, ga still takes position 2."), visualBlocks: ["Morgen", "ga", "ik", "naar school"], example: { dutch: "Morgen ga ik naar school.", meaning: lt("明天我去学校。", "Tomorrow I go to school.") }, explanation: lt("所以 ik 移到 ga 后面。", "So ik moves after ga.") },
  { id: "sentence-modal", level: "A2", title: lt("情态动词", "Modal verb"), rule: lt("主要动词去句尾。", "The main infinitive goes to the end."), visualBlocks: ["Ik", "wil", "een afspraak", "maken"], example: { dutch: "Ik wil een afspraak maken.", meaning: lt("我想预约。", "I want to make an appointment.") }, explanation: lt("wil 第二位，maken 在句尾。", "wil is position 2; maken is at the end.") },
  { id: "sentence-separable", level: "A2", title: lt("可分动词", "Separable verb"), rule: lt("前缀移到句尾。", "The prefix moves to the end."), visualBlocks: ["Ik", "bel", "de huisarts", "op"], example: { dutch: "Ik bel de huisarts op.", meaning: lt("我打电话给家庭医生。", "I call the GP.") }, explanation: lt("opbellen 分开：bel ... op。", "opbellen splits: bel ... op.") },
];

export const grammarMiniQuiz: MiniQuiz[] = [
  q("grammar-quiz-v2", "哪个句子 V2 正确？", "Which sentence uses V2 correctly?", "Morgen ga ik naar school."),
  q("grammar-quiz-article", "哪个 article 正确？", "Which article is correct?", "het ziekenhuis"),
  q("grammar-quiz-plural", "afspraak 的复数是什么？", "What is the plural of afspraak?", "afspraken"),
];
