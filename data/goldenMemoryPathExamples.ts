import type { MemoryPath, MemoryPathStrategy, MemoryPathWordType } from "@/types/vocabulary";

export type GoldenMemoryPathExample = {
  word: string;
  strategy: MemoryPathStrategy;
  whyGoodZh: string;
  whyGoodEn: string;
  memoryPath: MemoryPath;
};

const sentence = (dutch: string, meaningZh: string, meaningEn: string) => ({ dutch, meaningZh, meaningEn });

const primaryLabelFor = (strategy: MemoryPathStrategy) => {
  switch (strategy) {
    case "word-breakdown":
    case "compound-word":
      return { zh: "拆开看", en: "Break it down" };
    case "english-bridge":
      return { zh: "英文桥梁", en: "English bridge" };
    case "fixed-expression":
      return { zh: "表达功能", en: "Expression function" };
    case "meaning-contrast":
      return { zh: "词义对比", en: "Meaning contrast" };
    case "word-formation":
      return { zh: "基础词", en: "Base word" };
    case "sentence-based":
      return { zh: "句子功能", en: "Sentence role" };
    case "category-rule":
      return { zh: "先看类别", en: "See the category" };
    case "no-strong-association":
      return { zh: "不硬编联想", en: "Do not force it" };
    case "phrase-based":
    default:
      return { zh: "记忆入口", en: "Memory entry" };
  }
};

const secondLabelFor = (strategy: MemoryPathStrategy) => {
  switch (strategy) {
    case "word-breakdown":
    case "compound-word":
      return { zh: "意思怎么合起来", en: "How the meaning combines" };
    case "english-bridge":
    case "meaning-contrast":
      return { zh: "差异提醒", en: "Difference note" };
    case "fixed-expression":
      return { zh: "记忆重点", en: "Memory focus" };
    case "word-formation":
      return { zh: "词形怎么长出来", en: "How it is formed" };
    case "phrase-based":
      return { zh: "为什么这样记", en: "Why this helps" };
    case "category-rule":
      return { zh: "类别规则", en: "Category rule" };
    case "sentence-based":
    case "no-strong-association":
    default:
      return { zh: "使用提醒", en: "Usage note" };
  }
};

const example = (data: {
  word: string;
  strategy: MemoryPathStrategy;
  wordType?: MemoryPathWordType;
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  hookZh: string;
  hookEn: string;
  usageZh: string;
  usageEn: string;
  output: ReturnType<typeof sentence>;
  whyGoodZh: string;
  whyGoodEn: string;
  phrase?: string;
  phraseZh?: string;
  phraseEn?: string;
  warningZh?: string;
  warningEn?: string;
  parts?: { dutch: string; meaningZh: string; meaningEn: string }[];
  bridge?: string;
}) => {
  const firstLabel = primaryLabelFor(data.strategy);
  const secondLabel = secondLabelFor(data.strategy);
  const usageStepNeeded = !["sentence-based", "category-rule", "no-strong-association"].includes(data.strategy);
  const path: MemoryPath = {
    wordId: `golden-${data.word.toLowerCase()}`,
    dutch: data.word,
    strategy: data.strategy,
    wordType: data.wordType ?? "noun",
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    explanationZh: data.explanationZh,
    explanationEn: data.explanationEn,
    breakdown: data.parts
      ? {
          parts: data.parts,
          noteZh: data.hookZh,
          noteEn: data.hookEn,
        }
      : undefined,
    englishBridge: data.bridge
      ? {
          bridge: data.bridge,
          noteZh: data.hookZh,
          noteEn: data.hookEn,
        }
      : undefined,
    memoryHookZh: data.hookZh,
    memoryHookEn: data.hookEn,
    usageAnchorZh: data.usageZh,
    usageAnchorEn: data.usageEn,
    scenarioAnchor: { zh: data.usageZh, en: data.usageEn },
    phraseChunks: data.phrase ? [{ dutch: data.phrase, meaningZh: data.phraseZh ?? "", meaningEn: data.phraseEn ?? "" }] : [],
    outputSentences: [data.output],
    outputSentence: data.output,
    warningZh: data.warningZh,
    warningEn: data.warningEn,
    steps: [
      {
        labelZh: firstLabel.zh,
        labelEn: firstLabel.en,
        contentZh: data.parts?.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + ") ?? data.bridge ?? data.phrase ?? data.hookZh,
        contentEn: data.parts?.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + ") ?? data.bridge ?? data.phrase ?? data.hookEn,
      },
      { labelZh: secondLabel.zh, labelEn: secondLabel.en, contentZh: data.strategy === "category-rule" ? data.usageZh : data.hookZh, contentEn: data.strategy === "category-rule" ? data.usageEn : data.hookEn },
      ...(usageStepNeeded ? [{ labelZh: "使用提醒", labelEn: "Usage note", contentZh: data.usageZh, contentEn: data.usageEn }] : []),
      ...(data.warningZh || data.warningEn ? [{ labelZh: "别混淆", labelEn: "Do not mix up", contentZh: data.warningZh ?? "", contentEn: data.warningEn ?? "" }] : []),
    ],
    confidence: "high",
    needsHumanReview: false,
  };
  return {
    word: data.word,
    strategy: data.strategy,
    whyGoodZh: data.whyGoodZh,
    whyGoodEn: data.whyGoodEn,
    memoryPath: path,
  } satisfies GoldenMemoryPathExample;
};

export const goldenMemoryPathExamples: GoldenMemoryPathExample[] = [
  example({
    word: "ziekenhuis",
    strategy: "word-breakdown",
    titleZh: "拆词联想",
    titleEn: "Word Breakdown",
    explanationZh: "可以自然拆成 ziek + huis。",
    explanationEn: "It naturally splits into ziek + huis.",
    hookZh: "生病的人去的 house，就是 ziekenhuis。",
    hookEn: "A house for sick people: ziekenhuis.",
    usageZh: "看病、急诊、住院。",
    usageEn: "doctor visits, emergency care, hospital stays.",
    parts: [{ dutch: "ziek", meaningZh: "生病", meaningEn: "sick" }, { dutch: "huis", meaningZh: "房子/家", meaningEn: "house/home" }],
    output: sentence("Ik moet naar het ziekenhuis.", "我必须去医院。", "I have to go to the hospital."),
    whyGoodZh: "拆词真实，使用场景具体，输出句可直接说。",
    whyGoodEn: "Real breakdown, concrete usage, usable output.",
  }),
  example({
    word: "middernacht",
    strategy: "word-breakdown",
    titleZh: "拆词联想",
    titleEn: "Word Breakdown",
    explanationZh: "midden + nacht 能直接解释词义。",
    explanationEn: "midden + nacht directly explains the meaning.",
    hookZh: "夜晚的中间就是午夜。",
    hookEn: "The middle of the night is midnight.",
    usageZh: "说一天里的时间点。",
    usageEn: "time of day.",
    parts: [{ dutch: "midden", meaningZh: "中间", meaningEn: "middle" }, { dutch: "nacht", meaningZh: "夜晚", meaningEn: "night" }],
    output: sentence("Het is middernacht.", "现在是午夜。", "It is midnight."),
    whyGoodZh: "两个小块和中文意思刚好对得上。",
    whyGoodEn: "The parts line up with the meaning.",
  }),
  ...[
    ["aardappel", "aard = 土地 + appel = 苹果，地里的 apple 是土豆。", "Ik koop aardappels.", "我买土豆。", "I buy potatoes."],
    ["tandarts", "tand = 牙齿 + arts = 医生，牙齿医生就是牙医。", "Ik ga naar de tandarts.", "我去看牙医。", "I go to the dentist."],
    ["huisarts", "huis = 家 + arts = 医生，和家庭/住处相关的医生。", "Ik bel de huisarts.", "我给家庭医生打电话。", "I call the GP."],
    ["vliegtuig", "vlieg = 飞 + tuig = 设备，会飞的设备就是飞机。", "Het vliegtuig vertrekt om tien uur.", "飞机十点起飞。", "The plane leaves at ten."],
  ].map(([word, hookZh, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "word-breakdown",
    titleZh: "拆词联想",
    titleEn: "Word Breakdown",
    explanationZh: "用词里真实的小块记。",
    explanationEn: "Use real compound parts.",
    hookZh,
    hookEn: "The parts explain the whole word.",
    usageZh: "日常实用场景。",
    usageEn: "daily practical use.",
    output: sentence(dutch, meaningZh, meaningEn),
    whyGoodZh: "没有假谐音，每个小块都能帮你理解整词。",
    whyGoodEn: "No fake sound trick; parts contribute meaning.",
  })),
  ...[
    ["adres", "adres ≈ address，荷兰语少一个 d。", "Ik vul mijn adres in.", "我填写我的地址。", "I fill in my address."],
    ["eten", "eten ≈ eat，先借 English eat 抓住“吃”，再记完整形式 eten / ik eet。", "Ik eet brood.", "我吃面包。", "I eat bread."],
    ["drinken", "drinken ≈ drink，-en 是荷兰语动词完整形式。", "Ik drink water.", "我喝水。", "I drink water."],
    ["werken", "werken ≈ work，先借 English work 抓住“工作”。", "Ik werk vandaag.", "我今天工作。", "I work today."],
    ["maken", "maken ≈ make，先借 English make 抓住“做/制作”。", "Ik maak een afspraak.", "我预约。", "I make an appointment."],
    ["helpen", "helpen ≈ help，先借 English help 抓住“帮助”。", "Kunt u mij helpen?", "您能帮我吗？", "Can you help me?"],
    ["trein", "trein ≈ train。", "Ik neem de trein.", "我坐火车。", "I take the train."],
    ["water", "water = water，拼写一样但发音不同。", "Ik drink water.", "我喝水。", "I drink water."],
    ["appel", "appel ≈ apple。", "Ik eet een appel.", "我吃一个苹果。", "I eat an apple."],
    ["station", "station = station。", "Ik ben op het station.", "我在车站。", "I am at the station."],
  ].map(([word, hookZh, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "english-bridge",
    titleZh: "英文桥梁",
    titleEn: "English Bridge",
    explanationZh: "先借英文外形记，再回到荷兰语句子。",
    explanationEn: "Use English shape as a hook, then return to Dutch sentences.",
    hookZh,
    hookEn: hookZh,
    bridge: hookZh,
    usageZh: "高频生活场景。",
    usageEn: "common daily use.",
    output: sentence(dutch, meaningZh, meaningEn),
    whyGoodZh: "英文桥具体，不误导语义。",
    whyGoodEn: "Concrete English bridge without semantic drift.",
  })),
  ...[
    ["vrouwelijk", "vrouw 是女人，vrouwelijk 是女性的。", "Dit woord is vrouwelijk.", "这个词是阴性的。", "This word is feminine."],
    ["woning", "wonen 是居住，woning 是住房。", "Ik zoek een woning.", "我找住房。", "I am looking for housing."],
    ["betaling", "betalen 是付款，betaling 是付款这件事。", "De betaling is gelukt.", "付款成功了。", "The payment succeeded."],
    ["verzekering", "verzekeren 是投保，verzekering 是保险。", "Ik heb een verzekering.", "我有保险。", "I have insurance."],
    ["hulp", "helpen 是帮助，hulp 是名词帮助。", "Ik heb hulp nodig.", "我需要帮助。", "I need help."],
    ["werk", "werken 是工作，werk 是工作这件事。", "Ik zoek werk.", "我找工作。", "I am looking for work."],
  ].map(([word, hookZh, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "word-formation",
    titleZh: "词形联想",
    titleEn: "Word Formation",
    explanationZh: "从基础词看它怎么长成新词。",
    explanationEn: "See how the word grows from a base word.",
    hookZh,
    hookEn: hookZh,
    usageZh: "词族理解和真实句子。",
    usageEn: "word family plus real sentence.",
    output: sentence(dutch, meaningZh, meaningEn),
    whyGoodZh: "词族关系真实，并区分词类。",
    whyGoodEn: "Real word-family relation with part-of-speech clarity.",
  })),
  ...[
    ["afspraak", "先记 afspraak maken。", "een afspraak maken", "预约", "make an appointment", "Ik wil graag een afspraak maken.", "我想预约。", "I would like to make an appointment."],
    ["rekening", "先记 rekening betalen。", "een rekening betalen", "付账单", "pay a bill", "Ik betaal de rekening.", "我付账单。", "I pay the bill."],
    ["formulier", "先记 formulier invullen。", "een formulier invullen", "填写表格", "fill in a form", "Ik vul het formulier in.", "我填写表格。", "I fill in the form."],
    ["boodschappen", "先记 boodschappen doen。", "boodschappen doen", "买日用品", "do groceries", "Ik doe boodschappen.", "我买日用品。", "I do groceries."],
  ].map(([word, hookZh, phrase, phraseZh, phraseEn, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "phrase-based",
    titleZh: "搭配优先",
    titleEn: "Phrase First",
    explanationZh: "不要只背释义，先记最常用搭配。",
    explanationEn: "Do not memorize only the gloss; learn the strongest collocation.",
    hookZh,
    hookEn: hookZh,
    usageZh: "办事和日常对话。",
    usageEn: "practical tasks and daily conversation.",
    phrase,
    phraseZh,
    phraseEn,
    output: sentence(dutch, meaningZh, meaningEn),
    whyGoodZh: "搭配是高频用法，能直接输出。",
    whyGoodEn: "The collocation is high-frequency and directly usable.",
  })),
  ...[
    ["maar", "maar 放进对比句里记。", "Ik wil koffie, maar ik heb geen tijd.", "我想喝咖啡，但是我没有时间。", "I want coffee, but I do not have time."],
    ["ook", "ook 表示“也”，看它在句子里的位置。", "Ik wil ook koffie.", "我也想要咖啡。", "I also want coffee."],
    ["nog", "nog 常放进“再一次/还”的句子。", "Kunt u dat nog een keer zeggen?", "您可以再说一遍吗？", "Can you say that one more time?"],
    ["niet", "niet 放进否定句里记。", "Ik begrijp het niet.", "我不明白。", "I do not understand it."],
    ["geen", "geen 放在名词前表示没有/不是一个。", "Ik heb geen tijd.", "我没有时间。", "I have no time."],
  ].map(([word, hookZh, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "sentence-based",
    wordType: "function-word",
    titleZh: "放进句子记",
    titleEn: "Sentence Based",
    explanationZh: "功能词不硬拆，靠句子位置记。",
    explanationEn: "Do not break down function words; learn their sentence role.",
    hookZh,
    hookEn: hookZh,
    usageZh: "句子连接、否定或强调。",
    usageEn: "sentence linking, negation, or emphasis.",
    output: sentence(dutch, meaningZh, meaningEn),
    whyGoodZh: "功能词靠句子功能，不靠假联想。",
    whyGoodEn: "Function words are learned by sentence role, not fake mnemonics.",
  })),
  ...[
    ["Engels", "Engels 是语言名。", "Ik spreek Engels.", "我说英语。", "I speak English."],
    ["Nederlands", "Nederlands 是语言名。", "Ik spreek Nederlands.", "我说荷兰语。", "I speak Dutch."],
    ["januari", "januari 是月份。", "In januari begint het jaar.", "一月是一年的开始。", "The year starts in January."],
    ["maandag", "maandag 是星期词。", "Maandag werk ik.", "星期一我工作。", "On Monday I work."],
    ["rood", "rood 是颜色词。", "Het licht is rood.", "灯是红色的。", "The light is red."],
  ].map(([word, hookZh, dutch, meaningZh, meaningEn]) => example({
    word,
    strategy: "category-rule",
    titleZh: "类别规则",
    titleEn: "Category Rule",
    explanationZh: "先看它属于哪一类。",
    explanationEn: "Start from its category.",
    hookZh,
    hookEn: hookZh,
    usageZh: "按类别放进常用句型。",
    usageEn: "use the category in common sentence patterns.",
    output: sentence(dutch, meaningZh, meaningEn),
    warningZh: word === "Engels" ? "Engelsen 是英国人们，不是 het Engels 的普通复数。" : undefined,
    warningEn: word === "Engels" ? "Engelsen means English people, not the plural of the language word." : undefined,
    whyGoodZh: "类别、规则和输出句一致，不生成错误复数。",
    whyGoodEn: "Category, rule, and output sentence align without wrong plurals.",
  })),
];
