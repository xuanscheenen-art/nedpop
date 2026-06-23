import type {
  Level,
  LocalizedText,
  SyllabusGrammarPoint,
  SyllabusLevel,
  SyllabusPriority,
  SyllabusScenarioTask,
  SyllabusSentencePattern,
  SyllabusVocabularyTheme,
  SyllabusVocabularyWord,
} from "@/types/syllabus";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

const word = (
  dutch: string,
  zh: string,
  en: string,
  priority: SyllabusPriority = "must",
  article?: "de" | "het",
  notesForChineseLearners?: string,
): SyllabusVocabularyWord => ({
  dutch,
  article,
  meaning: lt(zh, en),
  priority,
  notesForChineseLearners,
});

type WordTuple = [string, string, string] | [string, string, string, SyllabusPriority] | [string, string, string, SyllabusPriority, "de" | "het"] | [string, string, string, SyllabusPriority, "de" | "het", string];

const words = (items: WordTuple[]) =>
  items.map(([dutch, zh, en, priority, article, notes]) => word(dutch, zh, en, priority, article, notes));

const theme = (
  id: string,
  zh: string,
  en: string,
  descriptionZh: string,
  descriptionEn: string,
  coreWords: SyllabusVocabularyWord[],
): SyllabusVocabularyTheme => ({
  id,
  title: lt(zh, en),
  description: lt(descriptionZh, descriptionEn),
  coreWords,
});

const pattern = (
  id: string,
  patternText: string,
  zh: string,
  en: string,
  examples: Array<[string, string, string]>,
  sceneZh: string,
  sceneEn: string,
): SyllabusSentencePattern => ({
  id,
  pattern: patternText,
  meaning: lt(zh, en),
  examples: examples.map(([dutch, exampleZh, exampleEn]) => ({ dutch, meaning: lt(exampleZh, exampleEn) })),
  usageScene: lt(sceneZh, sceneEn),
});

const grammar = (
  id: string,
  zh: string,
  en: string,
  explanationZh: string,
  explanationEn: string,
  examples: Array<[string, string, string]>,
  priority: SyllabusPriority = "must",
  notesForChineseLearners?: string,
): SyllabusGrammarPoint => ({
  id,
  title: lt(zh, en),
  explanation: lt(explanationZh, explanationEn),
  examples: examples.map(([dutch, exampleZh, exampleEn]) => ({ dutch, meaning: lt(exampleZh, exampleEn) })),
  priority,
  notesForChineseLearners,
});

const scenario = (
  id: string,
  zh: string,
  en: string,
  descriptionZh: string,
  descriptionEn: string,
  usefulPatterns: string[],
  outputType: SyllabusScenarioTask["outputType"],
): SyllabusScenarioTask => ({
  id,
  title: lt(zh, en),
  description: lt(descriptionZh, descriptionEn),
  usefulPatterns,
  outputType,
});

const basePronunciation = [
  {
    id: "pron-alphabet",
    title: lt("字母和拼读意识", "Alphabet and decoding mindset"),
    sounds: ["alphabet"],
    exampleWords: ["ik", "naam", "boek"],
    notesForChineseLearners: "先把荷兰语当作拼读系统，不要用英语字母名读每个词。",
  },
  {
    id: "pron-long-short-vowels",
    title: lt("短元音和长元音", "Short and long vowels"),
    sounds: ["a/aa", "e/ee", "i/ie", "o/oo", "u/uu"],
    exampleWords: ["man", "maan", "bed", "been", "ik", "fiets", "kop", "koop", "bus", "uur"],
    notesForChineseLearners: "长短音会改变词义，先夸张地区分，再自然缩短。",
  },
  {
    id: "pron-vowel-teams",
    title: lt("组合元音", "Vowel combinations"),
    sounds: ["ei/ij", "oe", "ui", "eu"],
    exampleWords: ["trein", "ijs", "goed", "huis", "leuk"],
    notesForChineseLearners: "oe 不读“欧”；ui/eu 是中文里没有的圆唇音，要作为重点。",
  },
  {
    id: "pron-g-sch-en",
    title: lt("g/ch, sch 和 -en", "g/ch, sch, and -en"),
    sounds: ["g/ch", "sch", "-en"],
    exampleWords: ["goed", "graag", "school", "schrijven", "wonen"],
    notesForChineseLearners: "g/ch 不等于英语 g；sch 不是 sh；-en 结尾常弱读。",
  },
];

const a0Themes = [
  theme(
    "a0-greetings",
    "打招呼",
    "Greetings",
    "建立最小社交入口。",
    "Build the smallest social entry point.",
    words([
      ["hallo", "你好", "hello"],
      ["dag", "你好/再见", "hello/bye"],
      ["goedemorgen", "早上好", "good morning", "should"],
      ["goedenavond", "晚上好", "good evening", "nice"],
      ["tot ziens", "再见", "see you", "should"],
      ["dank je", "谢谢", "thank you"],
      ["alsjeblieft", "请/给你", "please/here you are"],
    ]),
  ),
  theme(
    "a0-basic-response",
    "是否和基础回应",
    "Yes/no and basic response",
    "能回答最短问题。",
    "Answer very short questions.",
    words([
      ["ja", "是/对", "yes"],
      ["nee", "不/不是", "no"],
      ["goed", "好", "good"],
      ["slecht", "不好", "bad"],
      ["oké", "好的", "okay"],
      ["klopt", "对", "correct"],
      ["niet", "不", "not"],
    ]),
  ),
  theme(
    "a0-identity-place",
    "身份、国家和城市",
    "Identity, country, and city",
    "完成最基础自我介绍。",
    "Complete basic self-introduction.",
    words([
      ["ik", "我", "I"],
      ["jij", "你", "you"],
      ["u", "您", "formal you"],
      ["naam", "名字", "name", "must", "de"],
      ["heet", "叫", "am/is called"],
      ["ben", "是", "am"],
      ["woon", "住", "live"],
      ["kom", "来/来自", "come"],
      ["China", "中国", "China"],
      ["Nederland", "荷兰", "the Netherlands", "must", "het"],
      ["stad", "城市", "city", "should", "de"],
      ["land", "国家", "country", "should", "het"],
    ]),
  ),
  theme(
    "a0-numbers-daily",
    "数字和基础日常词",
    "Numbers and basic daily words",
    "建立 A1 前的最小词库。",
    "Build the minimum vocabulary before A1.",
    words([
      ["nul", "零", "zero"],
      ["een", "一/一个", "one/a"],
      ["twee", "二", "two"],
      ["drie", "三", "three"],
      ["vier", "四", "four"],
      ["vijf", "五", "five"],
      ["zes", "六", "six"],
      ["zeven", "七", "seven"],
      ["acht", "八", "eight"],
      ["negen", "九", "nine"],
      ["tien", "十", "ten"],
      ["elf", "十一", "eleven", "should"],
      ["twaalf", "十二", "twelve", "should"],
      ["twintig", "二十", "twenty", "should"],
      ["huis", "房子/家", "house/home", "should", "het"],
      ["water", "水", "water", "should", "het"],
      ["boek", "书", "book", "should", "het"],
    ]),
  ),
];

const a1Themes = [
  theme("a1-time", "数字、时间和日期", "Numbers, time, and dates", "处理日常时间信息。", "Handle daily time information.", words([
    ["uur", "点/小时", "hour", "must", "het"], ["tijd", "时间", "time", "must", "de"], ["vandaag", "今天", "today"], ["morgen", "明天/早上", "tomorrow/morning"], ["gisteren", "昨天", "yesterday"], ["maandag", "周一", "Monday"], ["dinsdag", "周二", "Tuesday"], ["woensdag", "周三", "Wednesday"], ["donderdag", "周四", "Thursday"], ["vrijdag", "周五", "Friday"], ["zaterdag", "周六", "Saturday"], ["zondag", "周日", "Sunday"], ["week", "周", "week", "must", "de"], ["maand", "月", "month", "must", "de"], ["jaar", "年", "year", "must", "het"], ["half", "半", "half"], ["kwart", "一刻钟", "quarter", "should", "het"],
  ])),
  theme("a1-family", "家庭", "Family", "介绍家庭成员和关系。", "Talk about family members and relationships.", words([
    ["familie", "家庭/家人", "family", "must", "de"], ["moeder", "妈妈", "mother", "must", "de"], ["vader", "爸爸", "father", "must", "de"], ["ouders", "父母", "parents"], ["broer", "兄弟", "brother", "must", "de"], ["zus", "姐妹", "sister", "must", "de"], ["kind", "孩子", "child", "must", "het"], ["zoon", "儿子", "son", "should", "de"], ["dochter", "女儿", "daughter", "should", "de"], ["man", "丈夫/男人", "husband/man", "should", "de"], ["vrouw", "妻子/女人", "wife/woman", "should", "de"], ["vriend", "朋友", "friend", "should", "de"], ["vriendin", "女朋友/女性朋友", "girlfriend/female friend", "should", "de"],
  ])),
  theme("a1-food-shopping", "食物、饮料和超市", "Food, drinks, and supermarket", "完成简单购买和价格问题。", "Buy simple items and ask prices.", words([
    ["eten", "吃/食物", "eat/food"], ["drinken", "喝", "drink"], ["brood", "面包", "bread", "must", "het"], ["kaas", "奶酪", "cheese", "must", "de"], ["melk", "牛奶", "milk", "should", "de"], ["koffie", "咖啡", "coffee", "must", "de"], ["thee", "茶", "tea", "must", "de"], ["appel", "苹果", "apple", "should", "de"], ["rijst", "米饭", "rice", "should", "de"], ["kip", "鸡肉", "chicken", "should", "de"], ["groente", "蔬菜", "vegetable", "must", "de"], ["fruit", "水果", "fruit", "must", "het"], ["supermarkt", "超市", "supermarket", "must", "de"], ["winkel", "商店", "shop", "must", "de"], ["geld", "钱", "money", "must", "het"], ["euro", "欧元", "euro", "must", "de"], ["prijs", "价格", "price", "should", "de"], ["kopen", "买", "buy"],
  ])),
  theme("a1-transport-home-weather", "交通、住址和天气", "Transport, address, and weather", "处理出行、住址和天气闲聊。", "Handle transport, address, and weather talk.", words([
    ["trein", "火车", "train", "must", "de"], ["bus", "公交", "bus", "must", "de"], ["fiets", "自行车", "bike", "must", "de"], ["auto", "汽车", "car", "should", "de"], ["station", "车站", "station", "must", "het"], ["halte", "站点", "stop", "should", "de"], ["kaartje", "票", "ticket", "should", "het"], ["straat", "街道", "street", "must", "de"], ["adres", "地址", "address", "must", "het"], ["postcode", "邮编", "postcode", "should", "de"], ["huis", "房子", "house", "must", "het"], ["kamer", "房间", "room", "should", "de"], ["deur", "门", "door", "should", "de"], ["weer", "天气", "weather", "must", "het"], ["zon", "太阳", "sun", "should", "de"], ["regen", "雨", "rain", "should", "de"], ["koud", "冷", "cold"], ["warm", "暖/热", "warm"], ["mooi", "好看的/好的", "nice"], ["slecht", "坏的", "bad"],
  ])),
  theme("a1-work-school-routine", "学校、工作和日常", "School, work, and daily routine", "描述一天和基础身份。", "Describe a day and basic role.", words([
    ["school", "学校", "school", "must", "de"], ["werk", "工作", "work", "must", "het"], ["student", "学生", "student", "must", "de"], ["leraar", "老师", "teacher", "should", "de"], ["baan", "工作", "job", "should", "de"], ["werken", "工作", "work"], ["leren", "学习", "learn"], ["slapen", "睡觉", "sleep"], ["staan op", "起床", "get up"], ["gaan", "去", "go"], ["komen", "来", "come"], ["wonen", "住", "live"], ["hebben", "有", "have"], ["zijn", "是/在", "be"], ["willen", "想要", "want"], ["zoeken", "寻找", "look for"], ["nemen", "拿/乘坐", "take"], ["vinden", "觉得", "find/think"], ["leuk", "有趣/好", "nice/fun"], ["moe", "累", "tired"],
  ])),
];

export const dutchSoundBase = {
  id: "sound-base",
  title: lt("发音底座", "Sound Base"),
  goal: lt(
    "作为 A0-A1 全程可回看的发音参考和练习系统，不把发音当成唯一第一课。",
    "A reference and practice system that supports A0-A1 throughout; pronunciation is not treated as the only first lesson.",
  ),
  modules: [
    {
      id: "sound-base-alphabet",
      title: lt("26 个字母", "Alphabet"),
      items: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    },
    {
      id: "sound-base-vowels",
      title: lt("元音和组合元音", "Vowels and vowel combinations"),
      items: ["a/aa", "e/ee", "i/ie", "o/oo", "u/uu", "ei/ij", "oe", "ui", "eu", "au/ou"],
    },
    {
      id: "sound-base-consonants",
      title: lt("辅音组合", "Consonant combinations"),
      items: ["g/ch", "sch", "ng/nk", "v/w", "r"],
    },
    {
      id: "sound-base-practice",
      title: lt("口型、例词、音频和解码器", "Mouth position, examples, audio, and decoder"),
      items: ["mouth position", "example words", "audio playback", "word decoder"],
    },
  ],
};

const a0StarterUnits = [
  theme("a0-01-greetings-politeness", "A0-01 打招呼和礼貌表达", "A0-01 Greetings and politeness", "学会最小社交入口：你好、再见、谢谢、请。", "Learn the smallest social entry: hello, goodbye, thanks, please.", words([
    ["hallo", "你好", "hello"], ["dag", "你好/再见", "hello/bye"], ["goedemorgen", "早上好", "good morning"], ["goedenavond", "晚上好", "good evening", "should"], ["tot ziens", "再见", "see you"], ["dank je", "谢谢", "thank you"], ["bedankt", "谢谢", "thanks"], ["alsjeblieft", "请/给你", "please/here you are"], ["sorry", "抱歉", "sorry"], ["ja", "是", "yes"], ["nee", "不", "no"],
  ])),
  theme("a0-02-name", "A0-02 我叫什么名字", "A0-02 My name", "能说姓名并询问别人名字。", "Say your name and ask another person's name.", words([
    ["ik", "我", "I"], ["jij", "你", "you"], ["u", "您", "formal you"], ["naam", "名字", "name", "must", "de"], ["heet", "叫", "am/is called"], ["ben", "是", "am"], ["mijn", "我的", "my"], ["jouw", "你的", "your"], ["wie", "谁", "who"], ["wat", "什么", "what"],
  ])),
  theme("a0-03-origin-home", "A0-03 我来自哪里、住在哪里", "A0-03 Where I come from and live", "能说来源国家和居住城市。", "Say country of origin and city of residence.", words([
    ["kom", "来/来自", "come"], ["uit", "从/来自", "from"], ["woon", "住", "live"], ["in", "在……里", "in"], ["China", "中国", "China"], ["Nederland", "荷兰", "the Netherlands", "must", "het"], ["stad", "城市", "city", "should", "de"], ["land", "国家", "country", "should", "het"], ["hier", "这里", "here"], ["daar", "那里", "there"],
  ])),
  theme("a0-04-languages", "A0-04 我会/不会说什么语言", "A0-04 Languages I speak", "能说会不会说中文、英文、荷兰语。", "Say whether you speak Chinese, English, or Dutch.", words([
    ["spreek", "说", "speak"], ["spreken", "说", "speak"], ["Nederlands", "荷兰语", "Dutch", "must", "het"], ["Chinees", "中文", "Chinese", "must", "het"], ["Engels", "英语", "English", "must", "het"], ["een beetje", "一点点", "a little"], ["goed", "好", "good"], ["niet", "不", "not"], ["begrijp", "理解", "understand"], ["taal", "语言", "language", "should", "de"],
  ])),
  theme("a0-05-numbers-0-20", "A0-05 数字 0-20", "A0-05 Numbers 0-20", "建立数字、电话号码和价格前的基础。", "Build the base for numbers, phone numbers, and prices.", words([
    ["nul", "零", "zero"], ["een", "一/一个", "one/a"], ["twee", "二", "two"], ["drie", "三", "three"], ["vier", "四", "four"], ["vijf", "五", "five"], ["zes", "六", "six"], ["zeven", "七", "seven"], ["acht", "八", "eight"], ["negen", "九", "nine"], ["tien", "十", "ten"], ["elf", "十一", "eleven"], ["twaalf", "十二", "twelve"], ["dertien", "十三", "thirteen"], ["veertien", "十四", "fourteen"], ["vijftien", "十五", "fifteen"], ["zestien", "十六", "sixteen"], ["zeventien", "十七", "seventeen"], ["achttien", "十八", "eighteen"], ["negentien", "十九", "nineteen"], ["twintig", "二十", "twenty"],
  ])),
  theme("a0-06-this-that", "A0-06 这是/那是什么", "A0-06 This/that and what is it", "能指认最基础物品。", "Identify very basic objects.", words([
    ["dit", "这个", "this"], ["dat", "那个", "that"], ["is", "是", "is"], ["wat", "什么", "what"], ["het", "它/这个", "it/the"], ["boek", "书", "book", "must", "het"], ["pen", "笔", "pen", "should", "de"], ["tas", "包", "bag", "should", "de"], ["huis", "房子/家", "house/home", "should", "het"], ["water", "水", "water", "should", "het"],
  ])),
  theme("a0-07-have-no-have", "A0-07 我有/我没有", "A0-07 I have / I don't have", "能说自己有没有基础物品。", "Say whether you have basic objects.", words([
    ["heb", "有", "have"], ["hebben", "有", "have"], ["geen", "没有/不是一个", "no/not any"], ["wel", "确实/有", "do/indeed"], ["telefoon", "电话", "phone", "should", "de"], ["fiets", "自行车", "bike", "should", "de"], ["kaart", "卡/地图", "card/map", "should", "de"], ["geld", "钱", "money", "should", "het"], ["vraag", "问题", "question", "should", "de"], ["probleem", "问题", "problem", "should", "het"],
  ])),
  theme("a0-08-repeat-help", "A0-08 我听不懂，请重复", "A0-08 I don't understand, please repeat", "能在听不懂时求助。", "Ask for help when you do not understand.", words([
    ["begrijp", "理解", "understand"], ["niet", "不", "not"], ["herhaal", "重复", "repeat"], ["langzaam", "慢一点", "slowly"], ["alstublieft", "请", "please"], ["sorry", "抱歉", "sorry"], ["help", "帮助", "help"], ["kunt u", "您可以吗", "can you"], ["nog een keer", "再一次", "one more time"], ["zeggen", "说", "say"],
  ])),
  theme("a0-09-sound-review", "A0-09 基础发音复习：oe / ui / eu / ij", "A0-09 Sound review: oe / ui / eu / ij", "把发音底座放回常用词里复习。", "Review the Sound Base inside useful words.", words([
    ["goed", "好", "good"], ["boek", "书", "book", "must", "het"], ["huis", "房子", "house", "must", "het"], ["uit", "出/从", "out/from"], ["leuk", "有趣/好", "nice/fun"], ["deur", "门", "door", "should", "de"], ["trein", "火车", "train", "should", "de"], ["ijs", "冰", "ice", "should", "het"], ["kijk", "看", "look"], ["blij", "高兴", "happy"],
  ])),
  theme("a0-10-first-introduction", "A0-10 A0 综合小场景：第一次介绍自己", "A0-10 First self-introduction", "把姓名、来源、住处、语言合成 20-30 秒输出。", "Combine name, origin, residence, and languages into a 20-30 second output.", words([
    ["hallo", "你好", "hello"], ["ik", "我", "I"], ["heet", "叫", "am called"], ["kom uit", "来自", "come from"], ["woon in", "住在", "live in"], ["spreek", "说", "speak"], ["een beetje", "一点", "a little"], ["Nederlands", "荷兰语", "Dutch", "must", "het"], ["dank je", "谢谢", "thank you"], ["tot ziens", "再见", "see you"],
  ])),
];

const a1FoundationUnits = [
  theme("a1-01-personal-info", "A1-01 我的日常信息", "A1-01 My daily information", "姓名、年龄、电话、地址和基础身份。", "Name, age, phone, address, and basic identity.", words([["voornaam", "名", "first name", "must", "de"], ["achternaam", "姓", "last name", "must", "de"], ["leeftijd", "年龄", "age", "must", "de"], ["adres", "地址", "address", "must", "het"], ["telefoonnummer", "电话号码", "phone number", "must", "het"], ["e-mail", "邮箱", "email", "must", "de"], ["postcode", "邮编", "postcode", "should", "de"], ["geboortedatum", "出生日期", "date of birth", "should", "de"]])),
  theme("a1-02-time-date", "A1-02 时间和日期", "A1-02 Time and date", "时间、星期、月份和约定。", "Time, days, months, and appointments.", words([["uur", "点/小时", "hour", "must", "het"], ["tijd", "时间", "time", "must", "de"], ["vandaag", "今天", "today"], ["morgen", "明天", "tomorrow"], ["gisteren", "昨天", "yesterday"], ["week", "周", "week", "must", "de"], ["maand", "月", "month", "must", "de"], ["jaar", "年", "year", "must", "het"], ["maandag", "周一", "Monday"], ["vrijdag", "周五", "Friday"]])),
  theme("a1-03-family", "A1-03 家庭成员", "A1-03 Family members", "介绍家庭成员和关系。", "Introduce family members and relationships.", words([["familie", "家人/家庭", "family", "must", "de"], ["moeder", "妈妈", "mother", "must", "de"], ["vader", "爸爸", "father", "must", "de"], ["ouders", "父母", "parents"], ["broer", "兄弟", "brother", "must", "de"], ["zus", "姐妹", "sister", "must", "de"], ["kind", "孩子", "child", "must", "het"], ["zoon", "儿子", "son", "should", "de"], ["dochter", "女儿", "daughter", "should", "de"], ["partner", "伴侣", "partner", "should", "de"]])),
  theme("a1-04-home-rooms", "A1-04 我的家和房间", "A1-04 My home and rooms", "描述住处和房间。", "Describe home and rooms.", words([["huis", "房子", "house", "must", "het"], ["kamer", "房间", "room", "must", "de"], ["keuken", "厨房", "kitchen", "should", "de"], ["badkamer", "浴室", "bathroom", "should", "de"], ["slaapkamer", "卧室", "bedroom", "should", "de"], ["deur", "门", "door", "should", "de"], ["raam", "窗", "window", "should", "het"], ["tafel", "桌子", "table", "should", "de"], ["stoel", "椅子", "chair", "should", "de"], ["groot", "大的", "big"]])),
  theme("a1-05-food-drink", "A1-05 食物和饮料", "A1-05 Food and drinks", "基础饮食词和喜好。", "Basic food words and preferences.", words([["brood", "面包", "bread", "must", "het"], ["kaas", "奶酪", "cheese", "must", "de"], ["melk", "牛奶", "milk", "should", "de"], ["water", "水", "water", "must", "het"], ["koffie", "咖啡", "coffee", "must", "de"], ["thee", "茶", "tea", "must", "de"], ["appel", "苹果", "apple", "should", "de"], ["rijst", "米饭", "rice", "should", "de"], ["eten", "吃", "eat"], ["drinken", "喝", "drink"]])),
  theme("a1-06-supermarket", "A1-06 在超市买东西", "A1-06 Buying things at the supermarket", "询问价格、选择和付款。", "Ask prices, choose items, and pay.", words([["supermarkt", "超市", "supermarket", "must", "de"], ["winkel", "商店", "shop", "must", "de"], ["prijs", "价格", "price", "must", "de"], ["euro", "欧元", "euro", "must", "de"], ["geld", "钱", "money", "must", "het"], ["kopen", "买", "buy"], ["nemen", "拿/买", "take"], ["zoeken", "找", "look for"], ["duur", "贵", "expensive"], ["goedkoop", "便宜", "cheap"]])),
  theme("a1-07-transport", "A1-07 交通和车站", "A1-07 Transport and station", "火车、公交、自行车和站点。", "Train, bus, bike, and stations.", words([["trein", "火车", "train", "must", "de"], ["bus", "公交", "bus", "must", "de"], ["fiets", "自行车", "bike", "must", "de"], ["auto", "汽车", "car", "should", "de"], ["station", "车站", "station", "must", "het"], ["halte", "站点", "stop", "should", "de"], ["kaartje", "票", "ticket", "should", "het"], ["spoor", "站台/轨道", "platform/track", "should", "het"], ["gaan", "去", "go"], ["komen", "来", "come"]])),
  theme("a1-08-weather-clothes", "A1-08 天气和衣服", "A1-08 Weather and clothes", "天气描述和基础穿着。", "Weather descriptions and basic clothing.", words([["weer", "天气", "weather", "must", "het"], ["zon", "太阳", "sun", "should", "de"], ["regen", "雨", "rain", "should", "de"], ["wind", "风", "wind", "should", "de"], ["koud", "冷", "cold"], ["warm", "暖/热", "warm"], ["jas", "外套", "coat", "should", "de"], ["broek", "裤子", "pants", "should", "de"], ["schoenen", "鞋", "shoes"], ["mooi", "好看的/好的", "nice"]])),
  theme("a1-09-school-work", "A1-09 学校和工作", "A1-09 School and work", "说学习和工作身份。", "Talk about study and work roles.", words([["school", "学校", "school", "must", "de"], ["werk", "工作", "work", "must", "het"], ["student", "学生", "student", "must", "de"], ["leraar", "老师", "teacher", "should", "de"], ["collega", "同事", "colleague", "should", "de"], ["baan", "工作", "job", "should", "de"], ["werken", "工作", "work"], ["leren", "学习", "learn"], ["wonen", "住", "live"], ["Nederlandse les", "荷兰语课", "Dutch lesson"]])),
  theme("a1-10-routine", "A1-10 日常作息", "A1-10 Daily routine", "描述一天做什么。", "Describe what you do in a day.", words([["opstaan", "起床", "get up"], ["slapen", "睡觉", "sleep"], ["eten", "吃", "eat"], ["drinken", "喝", "drink"], ["werken", "工作", "work"], ["leren", "学习", "learn"], ["kijken", "看", "watch/look"], ["lezen", "读", "read"], ["schrijven", "写", "write"], ["elke dag", "每天", "every day"]])),
  theme("a1-11-simple-health", "A1-11 简单身体不舒服", "A1-11 Simple health discomfort", "表达简单不舒服。", "Express simple discomfort.", words([["ziek", "生病", "sick"], ["moe", "累", "tired"], ["pijn", "疼", "pain", "should", "de"], ["hoofdpijn", "头疼", "headache", "should", "de"], ["buikpijn", "肚子疼", "stomachache", "should", "de"], ["beter", "好一点", "better"], ["slecht", "不好", "bad"], ["dokter", "医生", "doctor", "should", "de"], ["water", "水", "water", "must", "het"], ["rust", "休息", "rest", "should", "de"]])),
  theme("a1-12-directions-place", "A1-12 问路和地点", "A1-12 Directions and places", "问地点、方向和位置。", "Ask places, directions, and location.", words([["waar", "哪里", "where"], ["hier", "这里", "here"], ["daar", "那里", "there"], ["links", "左边", "left"], ["rechts", "右边", "right"], ["rechtdoor", "直走", "straight ahead"], ["straat", "街道", "street", "must", "de"], ["plein", "广场", "square", "should", "het"], ["naast", "旁边", "next to"], ["voor", "前面/为", "in front of/for"]])),
  theme("a1-13-likes-choices", "A1-13 喜好和选择", "A1-13 Likes and choices", "表达喜欢、不喜欢和选择。", "Express likes, dislikes, and choices.", words([["leuk", "有趣/好", "nice/fun"], ["lekker", "好吃", "tasty"], ["mooi", "好看", "beautiful/nice"], ["graag", "喜欢/愿意", "gladly"], ["liever", "更愿意", "rather"], ["kiezen", "选择", "choose"], ["vinden", "觉得", "find/think"], ["willen", "想要", "want"], ["of", "或者/是否", "or/whether"], ["maar", "但是", "but"]])),
  theme("a1-14-simple-appointment", "A1-14 简单约时间", "A1-14 Simple appointment", "约一个简单时间。", "Make a simple appointment time.", words([["afspraak", "预约/约定", "appointment", "should", "de"], ["wanneer", "什么时候", "when"], ["morgen", "明天", "tomorrow"], ["vandaag", "今天", "today"], ["om", "在……点", "at"], ["uur", "点/小时", "hour", "must", "het"], ["kan", "可以", "can"], ["komen", "来", "come"], ["bellen", "打电话", "call"], ["later", "晚点", "later"]])),
  theme("a1-15-review", "A1-15 A1 综合复习", "A1-15 A1 review", "整合个人信息、购物、交通、时间和喜好。", "Combine personal info, shopping, transport, time, and preferences.", words([["informatie", "信息", "information", "should", "de"], ["vraag", "问题", "question", "must", "de"], ["antwoord", "回答", "answer", "should", "het"], ["zin", "句子", "sentence", "should", "de"], ["tekst", "文本", "text", "should", "de"], ["gesprek", "对话", "conversation", "should", "het"], ["luisteren", "听", "listen"], ["spreken", "说", "speak"], ["oefenen", "练习", "practice"], ["herhalen", "重复", "repeat"]])),
];

const a0StarterPatterns = [
  pattern("a0-p-hello", "Hallo. / Dag.", "你好。/ 再见。", "Hello. / Bye.", [["Hallo, ik ben Lin.", "你好，我是 Lin。", "Hello, I am Lin."]], "打招呼", "Greeting"),
  pattern("a0-p-thanks", "Dank je. / Alsjeblieft.", "谢谢。/ 请。", "Thank you. / Please.", [["Dank je, tot ziens.", "谢谢，再见。", "Thanks, see you."]], "礼貌表达", "Politeness"),
  pattern("a0-p-ik-heet", "Ik heet ...", "我叫……", "My name is ...", [["Ik heet Anna.", "我叫 Anna。", "My name is Anna."]], "说名字", "Name"),
  pattern("a0-p-mijn-naam", "Mijn naam is ...", "我的名字是……", "My name is ...", [["Mijn naam is Li.", "我的名字是 Li。", "My name is Li."]], "正式一点说名字", "Saying name"),
  pattern("a0-p-kom-uit", "Ik kom uit ...", "我来自……", "I come from ...", [["Ik kom uit China.", "我来自中国。", "I come from China."]], "来源", "Origin"),
  pattern("a0-p-woon-in", "Ik woon in ...", "我住在……", "I live in ...", [["Ik woon in Leiden.", "我住在 Leiden。", "I live in Leiden."]], "居住地", "Residence"),
  pattern("a0-p-spreek", "Ik spreek ...", "我说……", "I speak ...", [["Ik spreek Chinees.", "我说中文。", "I speak Chinese."]], "语言", "Languages"),
  pattern("a0-p-spreek-niet", "Ik spreek geen ...", "我不会说……", "I do not speak ...", [["Ik spreek geen Nederlands.", "我不会说荷兰语。", "I do not speak Dutch."]], "语言能力", "Language ability"),
  pattern("a0-p-een-beetje", "Ik spreek een beetje ...", "我会说一点……", "I speak a little ...", [["Ik spreek een beetje Engels.", "我会说一点英语。", "I speak a little English."]], "降低难度", "Hedging ability"),
  pattern("a0-p-number", "Mijn nummer is ...", "我的号码是……", "My number is ...", [["Mijn nummer is zes.", "我的号码是六。", "My number is six."]], "数字", "Numbers"),
  pattern("a0-p-this-is", "Dit is ...", "这是……", "This is ...", [["Dit is een boek.", "这是一本书。", "This is a book."]], "指认物品", "Identifying objects"),
  pattern("a0-p-what-is", "Wat is dat?", "那是什么？", "What is that?", [["Wat is dat? Dat is water.", "那是什么？那是水。", "What is that? That is water."]], "询问物品", "Asking what something is"),
  pattern("a0-p-have", "Ik heb ...", "我有……", "I have ...", [["Ik heb een fiets.", "我有一辆自行车。", "I have a bike."]], "拥有", "Possession"),
  pattern("a0-p-no-have", "Ik heb geen ...", "我没有……", "I do not have ...", [["Ik heb geen telefoon.", "我没有电话。", "I do not have a phone."]], "没有", "No possession"),
  pattern("a0-p-repeat", "Ik begrijp het niet. Kunt u dat herhalen?", "我听不懂。您能重复吗？", "I don't understand. Can you repeat that?", [["Sorry, ik begrijp het niet.", "抱歉，我听不懂。", "Sorry, I don't understand."]], "求助", "Asking for help"),
  pattern("a0-p-intro", "Hallo, ik heet ... Ik kom uit ... Ik woon in ...", "你好，我叫……我来自……我住在……", "Hello, my name is ... I come from ... I live in ...", [["Hallo, ik heet Lin. Ik kom uit China. Ik woon in Delft.", "你好，我叫 Lin。我来自中国。我住在 Delft。", "Hello, my name is Lin. I come from China. I live in Delft."]], "综合介绍", "Integrated intro"),
];

const a0StarterGrammar = [
  grammar("a0-g-pronouns", "人称代词 ik/jij/u", "Personal pronouns ik/jij/u", "先区分我、你、您。", "First distinguish I, informal you, and formal you.", [["Ik ben Lin.", "我是 Lin。", "I am Lin."]], "must"),
  grammar("a0-g-zijn", "zijn 最小用法", "Minimal zijn", "只先记 ik ben, jij bent, u bent。", "Only memorize ik ben, jij bent, u bent first.", [["Ik ben nieuw.", "我是新来的。", "I am new."]], "must"),
  grammar("a0-g-heten", "heten 说名字", "heten for names", "Ik heet ... 是“我叫……”。", "Ik heet ... means my name is ...", [["Ik heet Anna.", "我叫 Anna。", "My name is Anna."]], "must"),
  grammar("a0-g-komen-wonen", "komen uit / wonen in", "komen uit / wonen in", "来源用 uit，居住地用 in。", "Use uit for origin and in for residence.", [["Ik kom uit China. Ik woon in Leiden.", "我来自中国。我住在 Leiden。", "I come from China. I live in Leiden."]], "must"),
  grammar("a0-g-spreken", "spreken 语言表达", "spreken for languages", "语言名用 Nederlands/Chinees/Engels。", "Use Nederlands/Chinees/Engels for language names.", [["Ik spreek een beetje Nederlands.", "我说一点荷兰语。", "I speak a little Dutch."]], "must"),
  grammar("a0-g-geen", "geen 表示没有/不会", "geen for none/no", "Ik heb geen ... / Ik spreek geen ...", "Use Ik heb geen ... / Ik spreek geen ...", [["Ik heb geen fiets.", "我没有自行车。", "I do not have a bike."]], "must"),
  grammar("a0-g-dit-dat", "dit/dat 指示", "dit/dat demonstratives", "dit 是这个，dat 是那个。", "dit is this; dat is that.", [["Dit is een boek.", "这是一本书。", "This is a book."]], "must"),
  grammar("a0-g-simple-question", "最小疑问句", "Minimal questions", "先学 Wat is dat? / Wie ben jij?", "First learn Wat is dat? / Wie ben jij?", [["Wat is dat?", "那是什么？", "What is that?"]], "should"),
  grammar("a0-g-word-order", "基础词序", "Basic word order", "先用主语 + 动词 + 其他。", "Start with subject + verb + rest.", [["Ik woon in Delft.", "我住在 Delft。", "I live in Delft."]], "must"),
  grammar("a0-g-politeness", "礼貌请求 kunt u ...?", "Polite request kunt u ...?", "不懂时先套 Kunt u dat herhalen?", "When lost, use Kunt u dat herhalen?", [["Kunt u dat herhalen?", "您能重复吗？", "Can you repeat that?"]], "must"),
];

const a1FoundationPatterns = [
  ...[
    ["a1-p-info", "Mijn naam is ... en ik woon in ...", "我的名字是……我住在……", "My name is ... and I live in ...", "个人信息", "Personal info"],
    ["a1-p-time", "Het is ... uur.", "现在……点。", "It is ... o'clock.", "时间", "Time"],
    ["a1-p-date", "Vandaag is ...", "今天是……", "Today is ...", "日期", "Date"],
    ["a1-p-family", "Ik heb een ...", "我有一个……", "I have a ...", "家庭/拥有", "Family/possession"],
    ["a1-p-home", "Mijn huis heeft ...", "我的家有……", "My home has ...", "住处", "Home"],
    ["a1-p-food", "Ik wil graag ...", "我想要……", "I would like ...", "点单", "Ordering"],
    ["a1-p-price", "Hoeveel kost ...?", "……多少钱？", "How much does ... cost?", "购物", "Shopping"],
    ["a1-p-transport", "Ik neem de ...", "我乘坐……", "I take the ...", "交通", "Transport"],
    ["a1-p-weather", "Het is koud/warm.", "天气冷/热。", "It is cold/warm.", "天气", "Weather"],
    ["a1-p-work", "Ik werk/leer ...", "我工作/学习……", "I work/learn ...", "工作学习", "Work/study"],
    ["a1-p-routine", "Ik sta om ... op.", "我……点起床。", "I get up at ...", "作息", "Routine"],
    ["a1-p-health", "Ik heb pijn.", "我疼。", "I have pain.", "身体", "Health"],
    ["a1-p-where", "Waar is ...?", "……在哪里？", "Where is ...?", "地点", "Place"],
    ["a1-p-like", "Ik vind ... leuk.", "我觉得……不错。", "I like/find ... nice.", "喜好", "Preference"],
    ["a1-p-choice", "Ik wil liever ...", "我更想要……", "I would rather like ...", "选择", "Choice"],
    ["a1-p-appointment", "Kan ik om ... komen?", "我可以……点来吗？", "Can I come at ...?", "约时间", "Appointment"],
    ["a1-p-er-is", "Er is ... / Er zijn ...", "有……", "There is ... / There are ...", "存在", "Existence"],
    ["a1-p-question-word", "Wanneer/Waar/Wat ...?", "什么时候/哪里/什么……？", "When/where/what ...?", "疑问词", "Question words"],
    ["a1-p-negative", "Ik heb geen ... / Ik ga niet ...", "我没有……/我不去……", "I have no ... / I do not go ...", "否定", "Negation"],
    ["a1-p-connectors", "... en ..., maar ...", "……和……，但是……", "... and ..., but ...", "连接", "Connectors"],
  ].map(([id, pat, zh, en, sceneZh, sceneEn]) => pattern(id, pat, zh, en, [[pat.replace("...", "koffie"), zh, en]], sceneZh, sceneEn)),
];

const a1FoundationGrammar = [
  grammar("a1-g-pronouns", "人称代词", "Personal pronouns", "ik/jij/u/hij/zij/we/jullie/zij。", "ik/jij/u/hij/zij/we/jullie/zij.", [["Ik woon hier. Zij woont daar.", "我住这里。她住那里。", "I live here. She lives there."]], "must"),
  grammar("a1-g-zijn", "zijn", "zijn", "zijn 是最核心不规则动词。", "zijn is the core irregular verb.", [["Ik ben moe. Wij zijn thuis.", "我累了。我们在家。", "I am tired. We are home."]], "must"),
  grammar("a1-g-hebben", "hebben", "hebben", "用来表达拥有和身体感觉。", "Used for possession and body feelings.", [["Ik heb hoofdpijn.", "我头疼。", "I have a headache."]], "must"),
  grammar("a1-g-regular-present", "规则动词现在时", "Regular present tense", "ik stem, jij/hij/zij stem+t, wij infinitive。", "ik stem, jij/hij/zij stem+t, wij infinitive.", [["Ik werk. Jij werkt. Wij werken.", "我工作。你工作。我们工作。", "I work. You work. We work."]], "must"),
  grammar("a1-g-common-verbs", "常见动词", "Common verbs", "gaan, komen, wonen, werken, leren, kopen, nemen, zoeken。", "gaan, komen, wonen, werken, leren, kopen, nemen, zoeken.", [["Ik zoek brood. Ik neem de trein.", "我找面包。我坐火车。", "I look for bread. I take the train."]], "must"),
  grammar("a1-g-v2", "V2 词序", "V2 word order", "限定动词在第二位置。", "The finite verb takes position 2.", [["Morgen ga ik naar school.", "明天我去学校。", "Tomorrow I go to school."]], "must"),
  grammar("a1-g-yes-no", "yes/no 疑问句", "Yes/no questions", "动词放句首。", "Put the verb first.", [["Woon jij hier?", "你住这里吗？", "Do you live here?"]], "must"),
  grammar("a1-g-question-words", "疑问词", "Question words", "wie/wat/waar/wanneer/hoeveel。", "wie/wat/waar/wanneer/hoeveel.", [["Waar is het station?", "车站在哪里？", "Where is the station?"]], "must"),
  grammar("a1-g-articles", "de/het 基础", "de/het basics", "先记高频词搭配。", "Memorize high-frequency noun pairs.", [["het huis, de fiets", "房子，自行车", "the house, the bike"]], "must"),
  grammar("a1-g-plurals", "复数 -en/-s", "Plurals -en/-s", "boeken, kamers, tafels。", "boeken, kamers, tafels.", [["twee boeken", "两本书", "two books"]], "must"),
  grammar("a1-g-geen-niet", "geen/niet", "geen/niet", "geen 否定不定名词，niet 否定其他。", "geen negates indefinite nouns; niet negates other elements.", [["Ik heb geen fiets. Ik kom niet.", "我没有自行车。我不来。", "I have no bike. I am not coming."]], "must"),
  grammar("a1-g-prepositions", "基础介词", "Basic prepositions", "in, op, naar, bij, met。", "in, op, naar, bij, met.", [["Ik ga met de bus naar school.", "我坐公交去学校。", "I go to school by bus."]], "must"),
  grammar("a1-g-adjectives", "形容词", "Adjectives", "基础形容词放在名词前。", "Basic adjectives before nouns.", [["een klein huis", "一个小房子", "a small house"]], "should"),
  grammar("a1-g-possessives", "物主词", "Possessives", "mijn/jouw/uw/zijn/haar/onze。", "mijn/jouw/uw/zijn/haar/onze.", [["Mijn fiets is rood.", "我的自行车是红色的。", "My bike is red."]], "must"),
  grammar("a1-g-er-is", "er is / er zijn", "er is / er zijn", "表达某处有某物。", "Express there is/there are.", [["Er is een supermarkt.", "有一家超市。", "There is a supermarket."]], "must"),
  grammar("a1-g-time", "时间表达", "Time expressions", "om tien uur, vandaag, morgen。", "om tien uur, vandaag, morgen.", [["Ik kom om tien uur.", "我十点来。", "I come at ten."]], "must"),
  grammar("a1-g-likes", "喜好表达", "Likes/dislikes", "Ik vind ... leuk / Ik hou van ...。", "Ik vind ... leuk / Ik hou van ...", [["Ik vind koffie lekker.", "我觉得咖啡好喝。", "I like coffee."]], "should"),
  grammar("a1-g-connectors", "连接词 en/maar/want", "Connectors en/maar/want", "连接短句并给简单理由。", "Connect short sentences and give simple reasons.", [["Ik wil komen, maar ik ben ziek.", "我想来，但是我病了。", "I want to come, but I am sick."]], "must"),
];

const a0SupplementalThemes = [
  theme("a0-extra-numbers-21-100", "A0 补充：数字 21-100", "A0 extra: numbers 21-100", "补足电话号码、年龄和简单价格前的数字基础。", "Round out number basics for phone numbers, age, and simple prices.", words([
    ["eenentwintig", "二十一", "twenty-one"], ["tweeëntwintig", "二十二", "twenty-two"], ["dertig", "三十", "thirty"], ["veertig", "四十", "forty"], ["vijftig", "五十", "fifty"], ["zestig", "六十", "sixty"], ["zeventig", "七十", "seventy"], ["tachtig", "八十", "eighty"], ["negentig", "九十", "ninety"], ["honderd", "一百", "hundred"],
  ])),
  theme("a0-extra-people-classroom", "A0 补充：人和课堂指令", "A0 extra: people and classroom commands", "支持课堂、app 操作和最小人物词。", "Support classroom/app use and minimum people words.", words([
    ["mens", "人", "person", "should", "de"], ["man", "男人", "man", "should", "de"], ["vrouw", "女人", "woman", "should", "de"], ["kind", "孩子", "child", "should", "het"], ["leraar", "老师", "teacher", "should", "de"], ["student", "学生", "student", "should", "de"], ["luister", "听", "listen"], ["zeg", "说", "say"], ["lees", "读", "read"], ["schrijf", "写", "write"], ["klik", "点击", "click"], ["kijk", "看", "look"], ["begin", "开始", "start"], ["stop", "停止", "stop"], ["open", "打开", "open"], ["sluit", "关闭", "close"], ["nogmaals", "再一次", "again"], ["samen", "一起", "together"], ["alleen", "独自", "alone"],
  ])),
  theme("a0-extra-verbs-adjectives", "A0 补充：基础动词和形容词", "A0 extra: basic verbs and adjectives", "让 A0 能说极短的状态、动作和判断。", "Enable very short statements about state, action, and judgement.", words([
    ["ga", "去", "go"], ["ga naar", "去……", "go to"], ["zie", "看见", "see"], ["wil", "想要", "want"], ["kan", "可以/会", "can"], ["maak", "做", "make"], ["doe", "做", "do"], ["klein", "小的", "small"], ["groot", "大的", "big"], ["nieuw", "新的", "new"], ["oud", "旧的/老的", "old"], ["makkelijk", "容易的", "easy"], ["moeilijk", "难的", "difficult"], ["langzaam", "慢的", "slow"], ["snel", "快的", "fast"], ["klaar", "完成/准备好", "ready/done"], ["juist", "正确的", "correct"], ["fout", "错的", "wrong"],
  ])),
];

const a0SupplementalPatterns = [
  pattern("a0-p-ask-name", "Hoe heet jij?", "你叫什么？", "What is your name?", [["Hoe heet jij?", "你叫什么？", "What is your name?"]], "问名字", "Asking names"),
  pattern("a0-p-formal-name", "Hoe heet u?", "您叫什么？", "What is your name? (formal)", [["Hoe heet u?", "您叫什么？", "What is your name?"]], "礼貌问名字", "Formal name question"),
  pattern("a0-p-where-from", "Waar kom jij vandaan?", "你来自哪里？", "Where do you come from?", [["Waar kom jij vandaan?", "你来自哪里？", "Where do you come from?"]], "问来源", "Origin question"),
  pattern("a0-p-where-live", "Waar woon jij?", "你住在哪里？", "Where do you live?", [["Waar woon jij?", "你住在哪里？", "Where do you live?"]], "问住处", "Residence question"),
  pattern("a0-p-do-you-speak", "Spreek jij ...?", "你说……吗？", "Do you speak ...?", [["Spreek jij Nederlands?", "你说荷兰语吗？", "Do you speak Dutch?"]], "问语言", "Language question"),
  pattern("a0-p-i-can", "Ik kan ...", "我会/可以……", "I can ...", [["Ik kan lezen.", "我会读。", "I can read."]], "基础能力", "Basic ability"),
  pattern("a0-p-i-cannot", "Ik kan niet ...", "我不会/不能……", "I cannot ...", [["Ik kan niet spreken.", "我不会说。", "I cannot speak."]], "基础能力否定", "Negative ability"),
  pattern("a0-p-i-want", "Ik wil ...", "我想要……", "I want ...", [["Ik wil water.", "我想要水。", "I want water."]], "需求", "Want/need"),
  pattern("a0-p-please-slowly", "Langzaam, alstublieft.", "请慢一点。", "Slowly, please.", [["Langzaam, alstublieft.", "请慢一点。", "Slowly, please."]], "听不懂求助", "Help when lost"),
  pattern("a0-p-say-again", "Nog een keer, alstublieft.", "请再说一次。", "One more time, please.", [["Nog een keer, alstublieft.", "请再说一次。", "One more time, please."]], "重复", "Repetition"),
  pattern("a0-p-click", "Klik op ...", "点击……", "Click on ...", [["Klik op start.", "点击开始。", "Click start."]], "app 指令", "App command"),
  pattern("a0-p-listen-repeat", "Luister en herhaal.", "听并重复。", "Listen and repeat.", [["Luister en herhaal.", "听并重复。", "Listen and repeat."]], "课堂指令", "Classroom command"),
  pattern("a0-p-read-write", "Lees en schrijf.", "读并写。", "Read and write.", [["Lees en schrijf.", "读并写。", "Read and write."]], "课堂指令", "Classroom command"),
  pattern("a0-p-correct-wrong", "Dat is juist/fout.", "这是对/错。", "That is correct/wrong.", [["Dat is juist.", "这是对的。", "That is correct."]], "反馈", "Feedback"),
  pattern("a0-p-ready", "Ik ben klaar.", "我完成了。", "I am ready/done.", [["Ik ben klaar.", "我完成了。", "I am done."]], "课堂状态", "Classroom status"),
];

const a0SupplementalGrammar = [
  grammar("a0-g-kan", "kan 的固定生存句", "Fixed survival use of kan", "A0 只把 kan 当固定句使用：Ik kan ... / Ik kan niet ...。", "At A0, use kan only as fixed phrases: Ik kan ... / Ik kan niet ...", [["Ik kan niet spreken.", "我不会说。", "I cannot speak."]], "should"),
  grammar("a0-g-wil", "wil 的固定需求句", "Fixed survival use of wil", "A0 只用 Ik wil ... 表示想要。", "At A0, only use Ik wil ... for wants.", [["Ik wil water.", "我想要水。", "I want water."]], "should"),
  grammar("a0-g-imperatives", "课堂/app 指令", "Classroom/app imperatives", "先作为整体听懂：luister, herhaal, klik, lees, schrijf。", "Understand as chunks first: luister, herhaal, klik, lees, schrijf.", [["Luister en herhaal.", "听并重复。", "Listen and repeat."]], "must"),
];

const a0PronunciationReinforcement = [
  { id: "a0-pron-ui", title: lt("ui in huis", "ui in huis"), sounds: ["ui"], exampleWords: ["huis", "uit"], notesForChineseLearners: "ui 不拆成 u+i，先用 huis / uit 建立声音记忆。" },
  { id: "a0-pron-oe", title: lt("oe in goed", "oe in goed"), sounds: ["oe"], exampleWords: ["goed", "boek"], notesForChineseLearners: "oe 接近 food 里的 oo，不是中文“欧”。" },
  { id: "a0-pron-eu", title: lt("eu in leuk", "eu in leuk"), sounds: ["eu"], exampleWords: ["leuk", "deur"], notesForChineseLearners: "eu 是前舌圆唇音，先通过示范词模仿。" },
  { id: "a0-pron-ij", title: lt("ij/ei in ijs/trein", "ij/ei in ijs/trein"), sounds: ["ij", "ei"], exampleWords: ["ijs", "trein"], notesForChineseLearners: "ij/ei 多数同音，不要拆成 i+j。" },
  { id: "a0-pron-vw", title: lt("v/w 入门对比", "v/w starter contrast"), sounds: ["v", "w"], exampleWords: ["vis", "water"], notesForChineseLearners: "v 有唇齿摩擦，w 摩擦更轻。" },
  { id: "a0-pron-sch", title: lt("sch in school", "sch in school"), sounds: ["sch"], exampleWords: ["school"], notesForChineseLearners: "sch 不是英语 sh，是 s + 后部摩擦音。" },
  { id: "a0-pron-g", title: lt("g in goed", "g in goed"), sounds: ["g"], exampleWords: ["goed"], notesForChineseLearners: "不要读成英语 go 的 g。" },
  { id: "a0-pron-r", title: lt("r awareness", "r awareness"), sounds: ["r"], exampleWords: ["rood", "drie"], notesForChineseLearners: "先能听出 r，不急着追求地区口音。" },
  { id: "a0-pron-en", title: lt("-en ending", "-en ending"), sounds: ["-en"], exampleWords: ["spreken", "wonen"], notesForChineseLearners: "-en 词尾常弱读，先不要每次重读。" },
  { id: "a0-pron-stress", title: lt("短词重音", "Stress in short words"), sounds: ["stress"], exampleWords: ["hallo", "Nederlands"], notesForChineseLearners: "不要每个音节一样重。" },
  { id: "a0-pron-numbers", title: lt("数字发音", "Number pronunciation"), sounds: ["numbers"], exampleWords: ["zeven", "acht", "twintig"], notesForChineseLearners: "数字需要听辨，尤其 zeven/zes 和 acht。" },
];

const a0SupplementalScenarios = [
  scenario("a0-11-classroom", "听懂课堂/app 指令", "Understand classroom/app commands", "听懂 klik, luister, herhaal, lees, schrijf。", "Understand klik, luister, herhaal, lees, schrijf.", ["Luister en herhaal.", "Klik op start."], ["listening", "reading"]),
  scenario("a0-12-number-check", "报一个简单号码", "Say a simple number", "用 0-100 说年龄、号码或简单价格。", "Use 0-100 for age, number, or simple price.", ["Mijn nummer is ...", "Ik ben ... jaar."], ["speaking", "listening"]),
  scenario("a0-13-basic-help", "请别人慢一点", "Ask someone to slow down", "听不懂时请求慢一点或再说一次。", "Ask someone to slow down or repeat.", ["Langzaam, alstublieft.", "Nog een keer, alstublieft."], ["speaking", "listening"]),
];

const a1SupplementalThemes = [
  theme("a1-extra-months-seasons", "A1 补充：月份和季节", "A1 extra: months and seasons", "补足日期、季节和简单计划。", "Round out dates, seasons, and simple planning.", words([
    ["januari", "一月", "January"], ["februari", "二月", "February"], ["maart", "三月", "March"], ["april", "四月", "April"], ["mei", "五月", "May"], ["juni", "六月", "June"], ["juli", "七月", "July"], ["augustus", "八月", "August"], ["september", "九月", "September"], ["oktober", "十月", "October"], ["november", "十一月", "November"], ["december", "十二月", "December"], ["lente", "春天", "spring", "should", "de"], ["zomer", "夏天", "summer", "should", "de"], ["herfst", "秋天", "autumn", "should", "de"], ["winter", "冬天", "winter", "should", "de"],
  ])),
  theme("a1-extra-clothes-colors", "A1 补充：衣服和颜色", "A1 extra: clothes and colors", "描述穿着、颜色和简单选择。", "Describe clothing, colors, and simple choices.", words([
    ["shirt", "T 恤/衬衫", "shirt", "should", "het"], ["trui", "毛衣", "sweater", "should", "de"], ["jurk", "连衣裙", "dress", "nice", "de"], ["rok", "裙子", "skirt", "nice", "de"], ["sok", "袜子", "sock", "should", "de"], ["muts", "帽子", "hat", "nice", "de"], ["rood", "红色", "red"], ["blauw", "蓝色", "blue"], ["groen", "绿色", "green"], ["geel", "黄色", "yellow"], ["zwart", "黑色", "black"], ["wit", "白色", "white"], ["grijs", "灰色", "grey"], ["bruin", "棕色", "brown"],
  ])),
  theme("a1-extra-furniture-home", "A1 补充：家具和家里位置", "A1 extra: furniture and home location", "把家和房间描述得更具体。", "Describe home and rooms more concretely.", words([
    ["bed", "床", "bed", "must", "het"], ["bank", "沙发/银行", "sofa/bank", "should", "de"], ["kast", "柜子", "cabinet", "should", "de"], ["lamp", "灯", "lamp", "should", "de"], ["vloer", "地板", "floor", "should", "de"], ["muur", "墙", "wall", "should", "de"], ["wc", "厕所", "toilet", "must", "de"], ["tuin", "花园", "garden", "should", "de"], ["boven", "楼上/上面", "upstairs/above"], ["beneden", "楼下", "downstairs"], ["binnen", "里面", "inside"], ["buiten", "外面", "outside"], ["naast", "旁边", "next to"], ["tussen", "中间", "between"],
  ])),
  theme("a1-extra-places-directions", "A1 补充：地点和方向", "A1 extra: places and directions", "问路和理解日常地点。", "Ask directions and understand daily places.", words([
    ["centrum", "市中心", "center", "must", "het"], ["markt", "市场", "market", "should", "de"], ["park", "公园", "park", "should", "het"], ["bibliotheek", "图书馆", "library", "should", "de"], ["apotheek", "药房", "pharmacy", "should", "de"], ["dokter", "医生", "doctor", "should", "de"], ["restaurant", "餐厅", "restaurant", "should", "het"], ["café", "咖啡馆", "cafe", "should", "het"], ["ingang", "入口", "entrance", "should", "de"], ["uitgang", "出口", "exit", "should", "de"], ["dichtbij", "附近", "nearby"], ["ver", "远", "far"], ["tegenover", "对面", "opposite"], ["achter", "后面", "behind"],
  ])),
  theme("a1-extra-quantities-shopping", "A1 补充：数量和购物词", "A1 extra: quantities and shopping words", "支持超市里更自然地买东西。", "Support more natural supermarket shopping.", words([
    ["stuk", "个/件", "piece", "must", "het"], ["kilo", "公斤", "kilo", "must", "de"], ["gram", "克", "gram", "should", "de"], ["fles", "瓶", "bottle", "must", "de"], ["pak", "包/盒", "pack", "should", "het"], ["zak", "袋", "bag", "should", "de"], ["bon", "小票", "receipt", "should", "de"], ["kassa", "收银台", "checkout", "must", "de"], ["mandje", "购物篮", "basket", "nice", "het"], ["contant", "现金", "cash"], ["pinpas", "银行卡", "debit card", "should", "de"], ["betalen", "付款", "pay"], ["nodig", "需要", "needed"], ["genoeg", "足够", "enough"],
  ])),
  theme("a1-extra-routine-frequency", "A1 补充：频率和作息动词", "A1 extra: frequency and routine verbs", "把每天、经常、有时说清楚。", "Say every day, often, and sometimes clearly.", words([
    ["altijd", "总是", "always"], ["vaak", "经常", "often"], ["soms", "有时", "sometimes"], ["nooit", "从不", "never"], ["meestal", "通常", "usually"], ["vroeg", "早", "early"], ["laat", "晚", "late"], ["wassen", "洗", "wash"], ["douchen", "洗澡", "shower"], ["ontbijten", "吃早饭", "have breakfast"], ["lunchen", "吃午饭", "have lunch"], ["koken", "做饭", "cook"], ["fietsen", "骑车", "cycle"], ["wandelen", "散步", "walk"],
  ])),
  theme("a1-extra-health-body", "A1 补充：身体和简单健康", "A1 extra: body and simple health", "表达哪里不舒服。", "Say where you feel unwell.", words([
    ["hoofd", "头", "head", "should", "het"], ["buik", "肚子", "belly", "should", "de"], ["arm", "手臂", "arm", "should", "de"], ["been", "腿", "leg", "should", "het"], ["hand", "手", "hand", "should", "de"], ["voet", "脚", "foot", "should", "de"], ["rug", "背", "back", "should", "de"], ["keel", "喉咙", "throat", "should", "de"], ["verkouden", "感冒", "having a cold"], ["hoesten", "咳嗽", "cough"], ["rusten", "休息", "rest"], ["medicijn", "药", "medicine", "nice", "het"],
  ])),
  theme("a1-extra-school-work-items", "A1 补充：学习和工作物品", "A1 extra: school and work items", "描述课程、工作地点和简单任务。", "Describe lessons, workplace, and simple tasks.", words([
    ["les", "课", "lesson", "must", "de"], ["docent", "教师", "teacher", "should", "de"], ["cursus", "课程", "course", "should", "de"], ["computer", "电脑", "computer", "must", "de"], ["laptop", "笔记本电脑", "laptop", "should", "de"], ["papier", "纸", "paper", "should", "het"], ["potlood", "铅笔", "pencil", "nice", "het"], ["agenda", "日程本", "agenda", "should", "de"], ["pauze", "休息", "break", "should", "de"], ["beginnen", "开始", "begin"], ["eindigen", "结束", "end"], ["vragen", "问", "ask"], ["antwoorden", "回答", "answer"], ["begrijpen", "理解", "understand"],
  ])),
];

const a1SupplementalPatterns = [
  ["a1-p-month", "Het is januari.", "现在是一月。", "It is January.", "月份", "Months"],
  ["a1-p-date", "Vandaag is maandag.", "今天是星期一。", "Today is Monday.", "日期", "Dates"],
  ["a1-p-season", "In de winter is het koud.", "冬天很冷。", "It is cold in winter.", "季节", "Seasons"],
  ["a1-p-age", "Ik ben ... jaar.", "我……岁。", "I am ... years old.", "年龄", "Age"],
  ["a1-p-phone", "Mijn telefoonnummer is ...", "我的电话号码是……", "My phone number is ...", "电话", "Phone"],
  ["a1-p-address", "Mijn adres is ...", "我的地址是……", "My address is ...", "地址", "Address"],
  ["a1-p-family-have", "Ik heb een broer en een zus.", "我有一个哥哥和一个妹妹。", "I have a brother and a sister.", "家庭", "Family"],
  ["a1-p-family-no", "Ik heb geen kinderen.", "我没有孩子。", "I have no children.", "家庭", "Family"],
  ["a1-p-room", "Mijn kamer is klein.", "我的房间很小。", "My room is small.", "房间", "Room"],
  ["a1-p-there-in-room", "Er is een tafel in de kamer.", "房间里有一张桌子。", "There is a table in the room.", "房间", "Room"],
  ["a1-p-color", "Mijn jas is blauw.", "我的外套是蓝色的。", "My coat is blue.", "颜色", "Colors"],
  ["a1-p-wearing", "Ik heb een trui aan.", "我穿着毛衣。", "I am wearing a sweater.", "衣服", "Clothes"],
  ["a1-p-food-like", "Ik vind brood lekker.", "我觉得面包好吃。", "I like bread.", "食物", "Food"],
  ["a1-p-drink-want", "Ik wil graag water.", "我想要水。", "I would like water.", "饮料", "Drinks"],
  ["a1-p-price", "Hoeveel kost dit?", "这个多少钱？", "How much does this cost?", "购物", "Shopping"],
  ["a1-p-quantity", "Ik wil twee kilo appels.", "我想要两公斤苹果。", "I would like two kilos of apples.", "购物", "Shopping"],
  ["a1-p-pay", "Kan ik pinnen?", "我可以刷卡吗？", "Can I pay by card?", "付款", "Payment"],
  ["a1-p-station", "Waar is het station?", "车站在哪里？", "Where is the station?", "交通", "Transport"],
  ["a1-p-platform", "De trein vertrekt van spoor twee.", "火车从二号站台出发。", "The train leaves from platform two.", "交通", "Transport"],
  ["a1-p-bus", "Ik neem de bus naar school.", "我坐公交去学校。", "I take the bus to school.", "交通", "Transport"],
  ["a1-p-weather-rain", "Het regent vandaag.", "今天下雨。", "It is raining today.", "天气", "Weather"],
  ["a1-p-weather-sun", "De zon schijnt.", "太阳出来了。", "The sun is shining.", "天气", "Weather"],
  ["a1-p-work", "Ik werk in een winkel.", "我在商店工作。", "I work in a shop.", "工作", "Work"],
  ["a1-p-study", "Ik leer Nederlands.", "我学荷兰语。", "I learn Dutch.", "学习", "Study"],
  ["a1-p-routine-morning", "Ik sta om zeven uur op.", "我七点起床。", "I get up at seven.", "作息", "Routine"],
  ["a1-p-routine-evening", "Ik slaap om tien uur.", "我十点睡觉。", "I sleep at ten.", "作息", "Routine"],
  ["a1-p-frequency", "Ik fiets vaak naar school.", "我经常骑车去学校。", "I often cycle to school.", "频率", "Frequency"],
  ["a1-p-health-head", "Ik heb hoofdpijn.", "我头疼。", "I have a headache.", "健康", "Health"],
  ["a1-p-health-tired", "Ik ben moe.", "我累了。", "I am tired.", "健康", "Health"],
  ["a1-p-direction-left", "Ga links.", "向左走。", "Go left.", "问路", "Directions"],
  ["a1-p-direction-straight", "Ga rechtdoor.", "直走。", "Go straight ahead.", "问路", "Directions"],
  ["a1-p-location-next", "De winkel is naast het station.", "商店在车站旁边。", "The shop is next to the station.", "地点", "Location"],
  ["a1-p-like", "Ik vind fietsen leuk.", "我觉得骑车有趣。", "I like cycling.", "喜好", "Likes"],
  ["a1-p-dislike", "Ik vind regen niet leuk.", "我不喜欢下雨。", "I do not like rain.", "喜好", "Likes"],
  ["a1-p-prefer", "Ik drink liever thee.", "我更愿意喝茶。", "I prefer tea.", "选择", "Choice"],
  ["a1-p-appointment-day", "Kan ik morgen komen?", "我明天可以来吗？", "Can I come tomorrow?", "约时间", "Appointment"],
  ["a1-p-appointment-time", "Ik kan om drie uur.", "我三点可以。", "I can at three o'clock.", "约时间", "Appointment"],
  ["a1-p-why", "Waarom kom je niet?", "你为什么不来？", "Why are you not coming?", "疑问", "Questions"],
  ["a1-p-because", "Ik kom niet, want ik ben ziek.", "我不来，因为我病了。", "I am not coming because I am sick.", "理由", "Reason"],
  ["a1-p-but", "Ik wil komen, maar ik ben moe.", "我想来，但是我累。", "I want to come, but I am tired.", "连接", "Connector"],
].map(([id, pat, zh, en, sceneZh, sceneEn]) => pattern(id, pat, zh, en, [[pat, zh, en]], sceneZh, sceneEn));

const a1SupplementalGrammar = [
  grammar("a1-g-time-fronting", "时间放句首的 V2", "V2 with time first", "时间放第一位时，动词仍在第二位。", "When time comes first, the verb still takes position 2.", [["Vandaag ga ik naar school.", "今天我去学校。", "Today I go to school."]], "must"),
  grammar("a1-g-frequency", "频率词位置", "Frequency word position", "vaak/soms/nooit 常放在动词后面。", "vaak/soms/nooit often come after the finite verb.", [["Ik fiets vaak naar school.", "我经常骑车去学校。", "I often cycle to school."]], "should"),
  grammar("a1-g-aan-clothes", "衣服表达 aan", "aan with clothes", "穿着可以用 Ik heb ... aan。", "For wearing clothes, use Ik heb ... aan.", [["Ik heb een jas aan.", "我穿着外套。", "I am wearing a coat."]], "should"),
  grammar("a1-g-hoeveel", "hoeveel 问数量和价格", "hoeveel for quantity and price", "Hoeveel 问多少、多少钱。", "Hoeveel asks how many or how much.", [["Hoeveel kost dit?", "这个多少钱？", "How much does this cost?"]], "must"),
];

const a1PronunciationReinforcement = [
  { id: "a1-pron-months", title: lt("月份里的长短音", "Vowels in months"), sounds: ["aa", "ei", "ui"], exampleWords: ["maart", "mei", "juli"], notesForChineseLearners: "月份常在日期里快速出现，要先能听出核心元音。" },
  { id: "a1-pron-numbers-time", title: lt("时间和数字听辨", "Time and number listening"), sounds: ["v/z", "ch", "tien/twintig"], exampleWords: ["vijf", "zeven", "acht", "twintig"], notesForChineseLearners: "价格和时间容易听错，数字要单独练。" },
  { id: "a1-pron-clothes", title: lt("衣服词里的 ui/oe", "ui/oe in clothes"), sounds: ["ui", "oe"], exampleWords: ["trui", "schoenen"], notesForChineseLearners: "trui 的 ui 和 schoenen 的 oe 都不能按英语拆读。" },
  { id: "a1-pron-directions", title: lt("问路词的 r/ch", "r/ch in directions"), sounds: ["r", "ch"], exampleWords: ["rechts", "rechtdoor"], notesForChineseLearners: "rechts 里有 r 和 ch，先慢速拆开。" },
  { id: "a1-pron-station", title: lt("交通词重音", "Stress in transport words"), sounds: ["stress"], exampleWords: ["station", "kaartje", "halte"], notesForChineseLearners: "长一点的词先找重音，不要平均读。" },
  { id: "a1-pron-food", title: lt("食物词里的 oo/oe/ij", "oo/oe/ij in food words"), sounds: ["oo", "oe", "ij"], exampleWords: ["brood", "groente", "rijst"], notesForChineseLearners: "brood 和 groente 都是圆唇音，但位置不同。" },
  { id: "a1-pron-sentence-v2", title: lt("V2 句子的节奏", "Rhythm in V2 sentences"), sounds: ["sentence rhythm"], exampleWords: ["Vandaag ga ik", "Morgen kom ik"], notesForChineseLearners: "时间放句首时，动词位置和句子节奏一起练。" },
  { id: "a1-pron-question-intonation", title: lt("疑问句语调", "Question intonation"), sounds: ["intonation"], exampleWords: ["Waar is ...?", "Hoeveel kost ...?"], notesForChineseLearners: "疑问句不是只靠升调，疑问词和动词位置也很重要。" },
];

const a2Themes = [
  theme("a2-health", "家庭医生和药房", "GP and pharmacy", "预约、说明症状、获取帮助。", "Make appointments, describe symptoms, and get help.", words([
    ["huisarts", "家庭医生", "GP", "must", "de"], ["ziekenhuis", "医院", "hospital", "must", "het"], ["apotheek", "药房", "pharmacy", "must", "de"], ["tandarts", "牙医", "dentist", "should", "de"], ["afspraak", "预约", "appointment", "must", "de"], ["klacht", "症状/投诉", "complaint/symptom", "must", "de"], ["pijn", "疼痛", "pain", "must", "de"], ["koorts", "发烧", "fever", "must", "de"], ["hoesten", "咳嗽", "cough"], ["verkouden", "感冒的", "having a cold"], ["medicijn", "药", "medicine", "must", "het"], ["recept", "处方", "prescription", "should", "het"], ["beter", "好转", "better"], ["ziek", "生病", "sick"], ["gezond", "健康", "healthy"],
  ])),
  theme("a2-admin-housing", "市政、住房和表格", "Municipality, housing, and forms", "处理地址、租房和基础官方事务。", "Handle address, housing, and basic official tasks.", words([
    ["gemeente", "市政厅/市政府", "municipality", "must", "de"], ["formulier", "表格", "form", "must", "het"], ["paspoort", "护照", "passport", "should", "het"], ["verblijfsvergunning", "居留许可", "residence permit", "should", "de"], ["inschrijven", "登记", "register"], ["adres", "地址", "address", "must", "het"], ["woning", "住房", "home/dwelling", "must", "de"], ["huur", "租金", "rent", "must", "de"], ["verhuurder", "房东", "landlord", "should", "de"], ["kamer", "房间", "room", "must", "de"], ["contract", "合同", "contract", "should", "het"], ["sleutel", "钥匙", "key", "should", "de"], ["probleem", "问题", "problem", "must", "het"], ["reparatie", "维修", "repair", "should", "de"], ["beschikbaar", "可用的", "available"],
  ])),
  theme("a2-work-travel-money", "工作、交通、账单和保险", "Work, travel, bills, and insurance", "处理请假、延误、付款和保险。", "Handle sick leave, delays, payments, and insurance.", words([
    ["werkgever", "雇主", "employer", "must", "de"], ["collega", "同事", "colleague", "must", "de"], ["ziekmelden", "请病假", "call in sick"], ["dienst", "班次/服务", "shift/service", "should", "de"], ["loon", "工资", "wage", "should", "het"], ["trein", "火车", "train", "must", "de"], ["vertraging", "延误", "delay", "must", "de"], ["spoor", "站台/轨道", "platform/track", "must", "het"], ["vertrekken", "出发", "depart"], ["aankomen", "到达", "arrive"], ["rekening", "账单/账户", "bill/account", "must", "de"], ["betalen", "付款", "pay"], ["bedrag", "金额", "amount", "must", "het"], ["verzekering", "保险", "insurance", "must", "de"], ["zorgverzekering", "医疗保险", "health insurance", "must", "de"],
  ])),
  theme("a2-communication", "邮件、求助和说明问题", "Email, help requests, and problem explanation", "用礼貌短句表达请求、变化和问题。", "Use polite short sentences for requests, changes, and problems.", words([
    ["brief", "信", "letter", "must", "de"], ["e-mail", "邮件", "email", "must", "de"], ["bericht", "消息", "message", "must", "het"], ["vraag", "问题", "question", "must", "de"], ["antwoord", "回答", "answer", "must", "het"], ["helpen", "帮助", "help"], ["herhalen", "重复", "repeat"], ["veranderen", "改变", "change"], ["invullen", "填写", "fill in"], ["sturen", "发送", "send"], ["ontvangen", "收到", "receive"], ["wachten", "等待", "wait"], ["langskomen", "过来", "come by"], ["mogelijk", "可能的", "possible"], ["belangrijk", "重要的", "important"], ["duidelijk", "清楚的", "clear"], ["nodig", "需要的", "needed"], ["graag", "想/乐意", "gladly"], ["alstublieft", "请", "please"], ["misschien", "也许", "maybe"],
  ])),
  theme("a2-society-daily", "基础社会和生活信息", "Basic society and daily information", "理解生活通知和基础社会信息。", "Understand daily notices and basic society information.", words([
    ["informatie", "信息", "information", "must", "de"], ["regel", "规则", "rule", "must", "de"], ["afdeling", "部门", "department", "should", "de"], ["loket", "窗口", "desk", "should", "het"], ["openingstijd", "开放时间", "opening hour", "should", "de"], ["bewijs", "证明", "proof", "must", "het"], ["kopie", "复印件", "copy", "should", "de"], ["handtekening", "签名", "signature", "should", "de"], ["geboortedatum", "出生日期", "date of birth", "must", "de"], ["nationaliteit", "国籍", "nationality", "should", "de"], ["burger", "居民/公民", "citizen", "should", "de"], ["veilig", "安全", "safe"], ["druk", "忙", "busy"], ["later", "晚点/之后", "later"], ["eerder", "更早", "earlier"], ["vandaag", "今天", "today"], ["volgende week", "下周", "next week"], ["vorige maand", "上个月", "last month"], ["samen", "一起", "together"], ["alleen", "独自", "alone"],
  ])),
  theme("a2-expanded-core", "A2 扩展核心词", "A2 expanded core words", "补足常见生活动词、形容词和连接词。", "Round out common daily verbs, adjectives, and connectors.", words([
    ["beginnen", "开始", "begin"], ["stoppen", "停止", "stop"], ["proberen", "尝试", "try"], ["vragen", "询问", "ask"], ["zeggen", "说", "say"], ["vertellen", "告诉", "tell"], ["begrijpen", "理解", "understand"], ["weten", "知道", "know"], ["denken", "想/认为", "think"], ["kijken", "看", "look/watch"], ["lezen", "读", "read"], ["schrijven", "写", "write"], ["bellen", "打电话", "call"], ["opbellen", "打电话给", "call up"], ["terugbellen", "回电话", "call back"], ["meenemen", "带上", "bring/take along"], ["aanvragen", "申请", "apply for"], ["afzeggen", "取消", "cancel"], ["verplaatsen", "改期", "reschedule"], ["klaar", "准备好/完成", "ready/done"], ["open", "开着的", "open"], ["dicht", "关着的", "closed"], ["goedkoop", "便宜", "cheap"], ["duur", "贵", "expensive"], ["gratis", "免费", "free"], ["eenvoudig", "简单", "simple"], ["moeilijk", "困难", "difficult"], ["rustig", "安静", "calm"], ["omdat", "因为", "because"], ["want", "因为", "because"], ["daarom", "所以", "therefore"], ["maar", "但是", "but"], ["ook", "也", "also"], ["nog", "还", "still/yet"], ["al", "已经", "already"], ["vaak", "经常", "often"],
  ])),
];

const a2SupplementalThemes = [
  theme("a2-extra-gp-pharmacy", "A2 补充：医生、药房和症状细化", "A2 extra: GP, pharmacy, and symptoms", "支持预约、说明症状、拿药和复诊。", "Support appointments, symptom explanation, medicine pickup, and follow-up.", words([
    ["assistente", "助理/前台", "assistant", "must", "de"], ["spreekuur", "门诊时间", "consultation hour", "should", "het"], ["wachtkamer", "候诊室", "waiting room", "should", "de"], ["onderzoek", "检查", "examination", "should", "het"], ["temperatuur", "体温", "temperature", "should", "de"], ["allergie", "过敏", "allergy", "should", "de"], ["benauwd", "胸闷/喘不过气", "short of breath"], ["duizelig", "头晕", "dizzy"], ["misselijk", "恶心", "nauseous"], ["overgeven", "呕吐", "vomit"], ["diarree", "腹泻", "diarrhea", "should", "de"], ["tablet", "药片", "tablet", "should", "de"], ["zalf", "药膏", "ointment", "nice", "de"], ["druppels", "滴剂", "drops"], ["dosering", "剂量", "dosage", "should", "de"], ["bijwerking", "副作用", "side effect", "should", "de"], ["herhaalrecept", "续方", "repeat prescription", "nice", "het"], ["verzekeringspas", "保险卡", "insurance card", "should", "de"],
  ])),
  theme("a2-extra-gemeente-forms", "A2 补充：市政和表格", "A2 extra: municipality and forms", "处理登记、证件、表格字段和预约。", "Handle registration, documents, form fields, and appointments.", words([
    ["burgerzaken", "市民事务", "civil affairs"], ["afspraakcode", "预约码", "appointment code", "nice", "de"], ["balie", "柜台", "desk", "should", "de"], ["document", "文件", "document", "must", "het"], ["identiteitsbewijs", "身份证明", "ID document", "must", "het"], ["rijbewijs", "驾照", "driving license", "should", "het"], ["uittreksel", "摘录/证明", "extract", "nice", "het"], ["verhuizen", "搬家", "move house"], ["inschrijving", "登记", "registration", "should", "de"], ["achternaam", "姓", "last name", "must", "de"], ["voorletter", "姓名首字母", "initial", "nice", "de"], ["geslacht", "性别", "gender", "should", "het"], ["geboorteplaats", "出生地", "place of birth", "should", "de"], ["telefoonnummer", "电话号码", "phone number", "must", "het"], ["e-mailadres", "邮箱地址", "email address", "must", "het"], ["handtekening", "签名", "signature", "must", "de"], ["bijlage", "附件", "attachment", "should", "de"], ["kopiëren", "复印", "copy"],
  ])),
  theme("a2-extra-housing-repairs", "A2 补充：租房和维修", "A2 extra: renting and repairs", "说明房屋问题、联系房东和理解租房信息。", "Explain housing issues, contact landlord, and understand rental info.", words([
    ["huurcontract", "租房合同", "rental contract", "must", "het"], ["huurprijs", "租金价格", "rent price", "must", "de"], ["borg", "押金", "deposit", "must", "de"], ["makelaar", "中介", "real estate agent", "should", "de"], ["bezichtiging", "看房", "viewing", "should", "de"], ["verdieping", "楼层", "floor", "should", "de"], ["lift", "电梯", "lift", "should", "de"], ["verwarming", "暖气", "heating", "must", "de"], ["lekkage", "漏水", "leak", "must", "de"], ["schimmel", "霉菌", "mold", "should", "de"], ["kapot", "坏了", "broken"], ["repareren", "维修", "repair"], ["monteur", "维修师傅", "technician", "should", "de"], ["melding", "报告/通知", "report", "should", "de"], ["overlast", "扰民/不便", "nuisance", "should", "de"], ["buurman", "男邻居", "male neighbor", "nice", "de"], ["buurvrouw", "女邻居", "female neighbor", "nice", "de"], ["verhuizen", "搬家", "move"],
  ])),
  theme("a2-extra-work-sick-leave", "A2 补充：工作和请病假", "A2 extra: work and sick leave", "打电话、发消息、解释不能上班和复工。", "Call, message, explain absence, and return to work.", words([
    ["leidinggevende", "主管", "supervisor", "must", "de"], ["manager", "经理", "manager", "should", "de"], ["rooster", "排班表", "schedule", "must", "het"], ["werktijd", "工作时间", "working time", "should", "de"], ["pauze", "休息", "break", "should", "de"], ["ploeg", "班组", "team/shift", "nice", "de"], ["afwezig", "缺席", "absent"], ["aanwezig", "在场", "present"], ["ziekmelding", "病假通知", "sick report", "should", "de"], ["beterschap", "早日康复", "get well soon"], ["terugkomen", "回来", "come back"], ["vervangen", "替换", "replace"], ["overleggen", "商量", "discuss"], ["doorgeven", "转告", "pass on"], ["berichtje", "小消息", "short message", "should", "het"], ["telefonisch", "电话上的", "by phone"], ["vandaag", "今天", "today"], ["morgen", "明天", "tomorrow"],
  ])),
  theme("a2-extra-travel-disruption", "A2 补充：交通延误和改线", "A2 extra: travel delay and rerouting", "理解延误、换乘、取消和替代路线。", "Understand delays, transfers, cancellations, and alternative routes.", words([
    ["perron", "站台", "platform", "must", "het"], ["overstappen", "换乘", "transfer"], ["aansluiting", "衔接车次", "connection", "should", "de"], ["uitvallen", "取消/停运", "be cancelled"], ["annuleren", "取消", "cancel"], ["omleiding", "绕行", "detour", "should", "de"], ["vervangend vervoer", "替代交通", "replacement transport"], ["buschauffeur", "公交司机", "bus driver", "nice", "de"], ["conducteur", "列车员", "conductor", "should", "de"], ["kaartautomaat", "售票机", "ticket machine", "should", "de"], ["inchecken", "刷卡进站", "check in"], ["uitchecken", "刷卡出站", "check out"], ["reisplanner", "行程规划器", "travel planner", "nice", "de"], ["aankomsttijd", "到达时间", "arrival time", "should", "de"], ["vertrektijd", "出发时间", "departure time", "should", "de"], ["minuut", "分钟", "minute", "must", "de"], ["vertragingstijd", "延误时间", "delay time", "nice", "de"], ["route", "路线", "route", "must", "de"],
  ])),
  theme("a2-extra-bills-insurance", "A2 补充：账单、保险和付款", "A2 extra: bills, insurance, and payment", "理解账单、金额、保险和付款问题。", "Understand bills, amounts, insurance, and payment problems.", words([
    ["factuur", "发票", "invoice", "must", "de"], ["termijn", "期限/分期", "term", "should", "de"], ["betaaldatum", "付款日期", "payment date", "should", "de"], ["automatische incasso", "自动扣款", "direct debit"], ["bankrekening", "银行账户", "bank account", "must", "de"], ["rekeningnummer", "账号", "account number", "should", "het"], ["kenmerk", "参考号", "reference", "should", "het"], ["premie", "保费", "premium", "should", "de"], ["eigen risico", "自付额", "deductible", "should", "het"], ["polis", "保单", "policy", "should", "de"], ["dekking", "覆盖范围", "coverage", "should", "de"], ["vergoeding", "报销", "reimbursement", "should", "de"], ["aanmaning", "催款信", "payment reminder", "nice", "de"], ["te laat", "太晚/迟了", "too late"], ["vergeten", "忘记", "forget"], ["terugbetalen", "退还/偿还", "repay"], ["controleren", "检查", "check"], ["kloppen", "正确/符合", "be correct"],
  ])),
  theme("a2-extra-letters-email-complaints", "A2 补充：信件、邮件和投诉", "A2 extra: letters, emails, and complaints", "写简短邮件、说明问题和提出请求。", "Write short emails, explain issues, and make requests.", words([
    ["onderwerp", "主题", "subject", "must", "het"], ["aanhef", "称呼", "salutation", "should", "de"], ["groet", "问候/致意", "greeting", "should", "de"], ["bijgevoegd", "随附", "attached"], ["antwoord geven", "回复", "reply"], ["reageren", "回应", "respond"], ["uitleg", "解释", "explanation", "must", "de"], ["oplossing", "解决方案", "solution", "must", "de"], ["verzoek", "请求", "request", "must", "het"], ["klagen", "投诉", "complain"], ["ontevreden", "不满意", "dissatisfied"], ["fout", "错误", "mistake", "must", "de"], ["ontbreken", "缺少", "be missing"], ["ontvangen", "收到", "receive"], ["bevestigen", "确认", "confirm"], ["afspraakbevestiging", "预约确认", "appointment confirmation", "nice", "de"], ["vriendelijke groet", "友好问候", "kind regards"], ["alvast bedankt", "先谢谢您", "thanks in advance"],
  ])),
  theme("a2-extra-appointment-changes", "A2 补充：改期、取消和求助", "A2 extra: rescheduling, cancelling, and asking for help", "处理日常安排变化和礼貌求助。", "Handle changes in plans and polite help requests.", words([
    ["verzetten", "改期", "reschedule"], ["afspraak verzetten", "更改预约", "reschedule an appointment"], ["afspraak afzeggen", "取消预约", "cancel an appointment"], ["beschikbaarheid", "可用时间", "availability", "should", "de"], ["liever", "更愿意", "prefer"], ["eerder", "更早", "earlier"], ["later", "更晚/之后", "later"], ["past", "合适", "fits"], ["schikt", "方便/合适", "suits"], ["druk", "忙", "busy"], ["dringend", "紧急", "urgent"], ["spoed", "急事", "urgency", "should", "de"], ["spoedlijn", "急诊电话线", "urgent phone line", "nice", "de"], ["tijdslot", "时间段", "time slot", "should", "het"], ["keuze", "选择", "choice", "should", "de"], ["bevestiging", "确认", "confirmation", "should", "de"], ["duidelijk", "清楚", "clear"], ["onduidelijk", "不清楚", "unclear"], ["nogmaals", "再次", "again"], ["rustig", "慢慢/安静", "calmly"], ["meedenken", "一起想办法", "think along"], ["opnieuw", "重新", "again"],
  ])),
];

const a2SupplementalPatterns = [
  ["a2-p-gp-call", "Ik bel voor een afspraak met de huisarts.", "我打电话预约家庭医生。", "I am calling for an appointment with the GP.", "医生预约", "GP appointment"],
  ["a2-p-symptom-since", "Ik heb sinds gisteren hoofdpijn.", "我从昨天开始头疼。", "I have had a headache since yesterday.", "症状", "Symptoms"],
  ["a2-p-fever", "Ik heb koorts en ik hoest.", "我发烧并且咳嗽。", "I have a fever and I cough.", "症状", "Symptoms"],
  ["a2-p-medicine", "Hoe moet ik dit medicijn gebruiken?", "这个药我该怎么用？", "How should I use this medicine?", "药房", "Pharmacy"],
  ["a2-p-prescription", "Ik heb een recept nodig.", "我需要处方。", "I need a prescription.", "药房", "Pharmacy"],
  ["a2-p-repeat-dose", "Kunt u de dosering herhalen?", "您能重复剂量吗？", "Can you repeat the dosage?", "药房", "Pharmacy"],
  ["a2-p-gemeente-appointment", "Ik heb een afspraak bij de gemeente.", "我在市政厅有预约。", "I have an appointment at the municipality.", "市政", "Municipality"],
  ["a2-p-register-address", "Ik wil mijn adres inschrijven.", "我想登记我的地址。", "I want to register my address.", "登记", "Registration"],
  ["a2-p-form-help", "Kunt u mij helpen met dit formulier?", "您能帮我填这个表格吗？", "Can you help me with this form?", "表格", "Forms"],
  ["a2-p-copy-needed", "Ik heb een kopie van mijn paspoort nodig.", "我需要一份护照复印件。", "I need a copy of my passport.", "证件", "Documents"],
  ["a2-p-signature", "Waar moet ik mijn handtekening zetten?", "我应该在哪里签名？", "Where should I put my signature?", "表格", "Forms"],
  ["a2-p-rent-question", "Hoeveel is de huur per maand?", "每月租金是多少？", "How much is the rent per month?", "租房", "Renting"],
  ["a2-p-viewing", "Kan ik de woning bekijken?", "我可以看房吗？", "Can I view the home?", "租房", "Viewing"],
  ["a2-p-leak", "Er is lekkage in de badkamer.", "浴室漏水。", "There is a leak in the bathroom.", "维修", "Repairs"],
  ["a2-p-broken-heating", "De verwarming is kapot.", "暖气坏了。", "The heating is broken.", "维修", "Repairs"],
  ["a2-p-repair-request", "Kunt u een monteur sturen?", "您能派维修师傅来吗？", "Can you send a technician?", "维修", "Repairs"],
  ["a2-p-sick-work", "Ik meld mij vandaag ziek.", "我今天请病假。", "I am calling in sick today.", "病假", "Sick leave"],
  ["a2-p-cannot-work", "Ik kan vandaag niet werken.", "我今天不能工作。", "I cannot work today.", "病假", "Sick leave"],
  ["a2-p-call-tomorrow", "Morgen bel ik u weer.", "明天我再给您打电话。", "I will call you again tomorrow.", "病假", "Sick leave"],
  ["a2-p-roster", "Kunt u mijn rooster controleren?", "您能检查我的排班吗？", "Can you check my schedule?", "工作", "Work"],
  ["a2-p-train-cancelled", "Mijn trein valt uit.", "我的火车取消了。", "My train is cancelled.", "交通", "Transport"],
  ["a2-p-transfer", "Waar moet ik overstappen?", "我在哪里换乘？", "Where do I need to transfer?", "交通", "Transport"],
  ["a2-p-late", "Ik kom tien minuten later.", "我会晚十分钟到。", "I will arrive ten minutes later.", "迟到", "Delay"],
  ["a2-p-platform-change", "Het spoor is veranderd.", "站台改了。", "The platform has changed.", "交通", "Transport"],
  ["a2-p-bill-high", "De rekening is te hoog.", "账单太高了。", "The bill is too high.", "账单", "Bills"],
  ["a2-p-payment-date", "Wanneer moet ik betalen?", "我什么时候必须付款？", "When do I have to pay?", "付款", "Payment"],
  ["a2-p-already-paid", "Ik heb al betaald.", "我已经付款了。", "I have already paid.", "付款", "Payment"],
  ["a2-p-insurance-card", "Ik heb mijn verzekeringspas bij me.", "我带了保险卡。", "I have my insurance card with me.", "保险", "Insurance"],
  ["a2-p-coverage", "Wordt dit vergoed door de verzekering?", "这个保险报销吗？", "Is this reimbursed by insurance?", "保险", "Insurance"],
  ["a2-p-letter-received", "Ik heb een brief ontvangen.", "我收到了一封信。", "I have received a letter.", "信件", "Letters"],
  ["a2-p-letter-understand", "Ik begrijp deze brief niet goed.", "我不太理解这封信。", "I do not understand this letter well.", "信件", "Letters"],
  ["a2-p-explanation", "Kunt u uitleg geven?", "您能解释一下吗？", "Can you give an explanation?", "求助", "Help"],
  ["a2-p-email-attach", "Ik stuur de bijlage mee.", "我随邮件发送附件。", "I am sending the attachment along.", "邮件", "Email"],
  ["a2-p-email-reply", "Kunt u op mijn e-mail reageren?", "您能回复我的邮件吗？", "Can you respond to my email?", "邮件", "Email"],
  ["a2-p-complaint", "Ik ben niet tevreden over ...", "我对……不满意。", "I am not satisfied with ...", "投诉", "Complaint"],
  ["a2-p-solution", "Ik wil graag een oplossing.", "我想要一个解决方案。", "I would like a solution.", "投诉", "Complaint"],
  ["a2-p-change-appointment", "Ik wil mijn afspraak verzetten.", "我想改预约。", "I want to reschedule my appointment.", "改期", "Rescheduling"],
  ["a2-p-cancel-appointment", "Ik wil mijn afspraak afzeggen.", "我想取消预约。", "I want to cancel my appointment.", "取消", "Cancelling"],
  ["a2-p-available", "Ik ben maandag beschikbaar.", "我周一有空。", "I am available on Monday.", "安排", "Scheduling"],
  ["a2-p-not-suitable", "Dat tijdstip schikt mij niet.", "那个时间不方便。", "That time does not suit me.", "安排", "Scheduling"],
  ["a2-p-earlier-later", "Kan het eerder of later?", "可以更早或更晚吗？", "Can it be earlier or later?", "安排", "Scheduling"],
  ["a2-p-polite-opening", "Goedemorgen, u spreekt met ...", "早上好，我是……", "Good morning, you are speaking with ...", "电话", "Phone"],
  ["a2-p-phone-purpose", "Ik bel omdat ik een vraag heb.", "我打电话是因为我有一个问题。", "I am calling because I have a question.", "电话", "Phone"],
  ["a2-p-hold", "Kunt u even wachten?", "您能稍等一下吗？", "Can you wait a moment?", "电话", "Phone"],
  ["a2-p-repeat-slow", "Kunt u dat langzaam herhalen?", "您能慢一点重复吗？", "Can you repeat that slowly?", "听力修复", "Listening repair"],
  ["a2-p-spell", "Kunt u dat spellen?", "您能拼写一下吗？", "Can you spell that?", "听力修复", "Listening repair"],
  ["a2-p-confirm", "Kunt u de afspraak bevestigen?", "您能确认预约吗？", "Can you confirm the appointment?", "确认", "Confirmation"],
  ["a2-p-thanks-help", "Dank u wel voor uw hulp.", "谢谢您的帮助。", "Thank you for your help.", "礼貌", "Politeness"],
  ["a2-p-because-want", "Ik kom later, want mijn trein heeft vertraging.", "我晚点到，因为火车延误。", "I will arrive later because my train is delayed.", "原因", "Reason"],
  ["a2-p-because-omdat", "Ik kan niet komen omdat ik ziek ben.", "我不能来，因为我生病了。", "I cannot come because I am sick.", "从句", "Subordinate clause"],
  ["a2-p-perfect-made", "Ik heb een afspraak gemaakt.", "我已经预约了。", "I have made an appointment.", "完成时", "Perfect tense"],
  ["a2-p-perfect-sent", "Ik heb het formulier gestuurd.", "我已经发送了表格。", "I have sent the form.", "完成时", "Perfect tense"],
  ["a2-p-perfect-called", "Ik heb gisteren gebeld.", "我昨天打过电话。", "I called yesterday.", "完成时", "Perfect tense"],
  ["a2-p-separable-call", "Ik bel u morgen terug.", "我明天给您回电话。", "I will call you back tomorrow.", "可分动词", "Separable verbs"],
  ["a2-p-separable-fill", "Ik vul het formulier in.", "我填写表格。", "I fill in the form.", "可分动词", "Separable verbs"],
  ["a2-p-separable-bring", "Ik neem mijn paspoort mee.", "我带上护照。", "I bring my passport along.", "可分动词", "Separable verbs"],
  ["a2-p-may", "Mag ik iets vragen?", "我可以问一个问题吗？", "May I ask something?", "礼貌请求", "Polite request"],
  ["a2-p-should-bring", "Moet ik mijn paspoort meenemen?", "我必须带护照吗？", "Do I have to bring my passport?", "要求", "Requirement"],
  ["a2-p-would-like", "Ik zou graag een afspraak willen maken.", "我想预约。", "I would like to make an appointment.", "礼貌请求", "Polite request"],
  ["a2-p-simple-email-start", "Beste meneer/mevrouw,", "尊敬的先生/女士：", "Dear Sir/Madam,", "邮件", "Email"],
  ["a2-p-simple-email-end", "Met vriendelijke groet,", "此致敬礼，", "Kind regards,", "邮件", "Email"],
  ["a2-p-form-field", "Hier staat mijn geboortedatum.", "这里是我的出生日期。", "Here is my date of birth.", "表格", "Forms"],
  ["a2-p-missing-info", "Er ontbreekt informatie.", "缺少信息。", "Information is missing.", "表格", "Forms"],
  ["a2-p-copy", "Ik maak een kopie van het document.", "我复印文件。", "I make a copy of the document.", "证件", "Documents"],
  ["a2-p-official-time", "De afspraak is volgende week dinsdag.", "预约是下周二。", "The appointment is next Tuesday.", "预约", "Appointment"],
  ["a2-p-need-help", "Ik heb hulp nodig met deze brief.", "这封信我需要帮助。", "I need help with this letter.", "求助", "Help"],
  ["a2-p-not-clear", "Het is voor mij niet duidelijk.", "这对我来说不清楚。", "It is not clear to me.", "求助", "Help"],
  ["a2-p-check", "Kunt u controleren of dit klopt?", "您能检查这是否正确吗？", "Can you check whether this is correct?", "检查", "Checking"],
  ["a2-p-send-again", "Kunt u het opnieuw sturen?", "您能重新发送吗？", "Can you send it again?", "请求", "Request"],
  ["a2-p-wait-answer", "Ik wacht op uw antwoord.", "我等待您的回复。", "I am waiting for your answer.", "邮件", "Email"],
].map(([id, pat, zh, en, sceneZh, sceneEn]) => pattern(id, pat, zh, en, [[pat, zh, en]], sceneZh, sceneEn));

const a2SupplementalGrammar = [
  grammar("a2-g-modal-end", "情态动词 + 动词原形句尾", "Modal + infinitive at the end", "kunnen/moeten/willen 后，主要动作常放句尾。", "After kunnen/moeten/willen, the main action often goes to the end.", [["Ik wil een afspraak maken.", "我想预约。", "I want to make an appointment."]], "must"),
  grammar("a2-g-mogen", "mogen 礼貌询问", "mogen for polite permission", "Mag ik ...? 用来礼貌地问能不能。", "Mag ik ...? asks for permission politely.", [["Mag ik iets vragen?", "我可以问个问题吗？", "May I ask something?"]], "should"),
  grammar("a2-g-zou-graag", "zou graag 礼貌请求", "zou graag polite request", "Ik zou graag ... 比 Ik wil ... 更礼貌。", "Ik zou graag ... is more polite than Ik wil ...", [["Ik zou graag een afspraak willen maken.", "我想预约。", "I would like to make an appointment."]], "should"),
  grammar("a2-g-perfect-hebben", "hebben 完成时", "Perfect tense with hebben", "多数动作使用 hebben + ge...d/t/en。", "Most actions use hebben + participle.", [["Ik heb gebeld.", "我打过电话。", "I called."]], "must"),
  grammar("a2-g-perfect-zijn", "zijn 完成时入门", "Perfect tense with zijn", "移动/状态变化常用 zijn。", "Movement/change of state often uses zijn.", [["Ik ben naar de gemeente gegaan.", "我去了市政厅。", "I went to the municipality."]], "should"),
  grammar("a2-g-participle-prefix", "过去分词 ge- 入门", "Basic ge- participles", "先识别 gemaakt, gebeld, gestuurd。", "First recognize gemaakt, gebeld, gestuurd.", [["Ik heb een e-mail gestuurd.", "我发了一封邮件。", "I sent an email."]], "must"),
  grammar("a2-g-no-ge", "be-/ver- 动词过去分词不加 ge", "No ge- with be-/ver-", "begrijpen/veranderen 等常不加 ge-。", "Verbs like begrijpen/veranderen often do not add ge-.", [["Ik heb het niet begrepen.", "我没理解。", "I did not understand it."]], "should"),
  grammar("a2-g-separable-present", "可分动词现在时", "Separable verbs in present tense", "前缀常在句尾。", "The prefix often goes to the end.", [["Ik vul het formulier in.", "我填写表格。", "I fill in the form."]], "must"),
  grammar("a2-g-separable-perfect", "可分动词完成时", "Separable verbs in perfect tense", "ge 常夹在前缀和动词中间。", "ge often sits between prefix and verb.", [["Ik heb de afspraak afgezegd.", "我取消了预约。", "I cancelled the appointment."]], "should"),
  grammar("a2-g-omdat-order", "omdat 从句词序", "Word order after omdat", "omdat 后动词到后面。", "After omdat, the verb moves later.", [["Ik kom niet omdat ik ziek ben.", "我不来，因为我病了。", "I am not coming because I am sick."]], "must"),
  grammar("a2-g-want-order", "want 主句词序", "Word order after want", "want 后保持普通主句词序。", "After want, keep normal main-clause order.", [["Ik kom niet, want ik ben ziek.", "我不来，因为我病了。", "I am not coming because I am sick."]], "must"),
  grammar("a2-g-time-place", "时间在地点前", "Time before place", "日常句里常用时间 + 地点。", "Daily sentences often use time before place.", [["Ik kom morgen naar de gemeente.", "我明天去市政厅。", "I will come to the municipality tomorrow."]], "must"),
  grammar("a2-g-er-location", "er 表示某处有", "er for existence", "Er is/Er zijn 用来说明存在。", "Er is/Er zijn express existence.", [["Er is lekkage in de badkamer.", "浴室漏水。", "There is a leak in the bathroom."]], "must"),
  grammar("a2-g-te-adjective", "te + 形容词", "te + adjective", "te hoog/te laat 表示太……。", "te hoog/te laat means too ...", [["De rekening is te hoog.", "账单太高了。", "The bill is too high."]], "must"),
  grammar("a2-g-comparative-time", "eerder/later", "earlier/later", "用于改期和安排。", "Used for rescheduling and planning.", [["Kan het eerder of later?", "可以更早或更晚吗？", "Can it be earlier or later?"]], "must"),
  grammar("a2-g-formal-u", "正式 u 句式", "Formal u forms", "电话、邮件和官方场景优先用 u。", "Use u in phone, email, and official settings.", [["Kunt u mij helpen?", "您能帮我吗？", "Can you help me?"]], "must"),
  grammar("a2-g-email-paragraph", "短邮件段落", "Short email paragraphs", "目的、背景、请求、结束。", "Purpose, context, request, closing.", [["Ik schrijf u omdat ik een vraag heb.", "我写信是因为我有一个问题。", "I am writing because I have a question."]], "must"),
  grammar("a2-g-form-fields", "表格字段语言", "Form field language", "识别 voornaam, achternaam, geboortedatum 等字段。", "Recognize fields like voornaam, achternaam, geboortedatum.", [["Mijn geboortedatum is 1 mei 1990.", "我的出生日期是 1990 年 5 月 1 日。", "My date of birth is 1 May 1990."]], "must"),
];

const a2PronunciationReinforcement = [
  { id: "a2-pron-health-long", title: lt("医疗长词拆块", "Chunking health words"), sounds: ["stress", "ui", "ie"], exampleWords: ["huisarts", "ziekenhuis", "medicijn"], notesForChineseLearners: "医疗词先拆意义块再读，不要整串硬读。" },
  { id: "a2-pron-gemeente", title: lt("gemeente 的 ee 和重音", "ee and stress in gemeente"), sounds: ["ee", "stress"], exampleWords: ["gemeente", "inschrijven"], notesForChineseLearners: "gemeente 不是英语式读法，ee 要稳。" },
  { id: "a2-pron-insurance", title: lt("-ing 和 -ering 词尾", "-ing and -ering endings"), sounds: ["-ing", "-ering"], exampleWords: ["verzekering", "rekening", "inschrijving"], notesForChineseLearners: "这些官方词尾很常见，先练弱读和重音。" },
  { id: "a2-pron-schrijf", title: lt("schr in schrijven", "schr in schrijven"), sounds: ["sch", "r", "ij"], exampleWords: ["schrijven", "schriftelijk"], notesForChineseLearners: "schr 需要慢速分层练，再合起来。" },
  { id: "a2-pron-phone", title: lt("电话里的礼貌句节奏", "Rhythm in phone phrases"), sounds: ["sentence rhythm"], exampleWords: ["Kunt u mij helpen?", "Ik bel omdat ..."], notesForChineseLearners: "电话句要短、清楚、有停顿。" },
  { id: "a2-pron-separable", title: lt("可分动词重音", "Stress in separable verbs"), sounds: ["stress"], exampleWords: ["opbellen", "terugbellen", "invullen"], notesForChineseLearners: "可分前缀常带重音，帮助你听出动词结构。" },
  { id: "a2-pron-delay", title: lt("交通广播关键词", "Travel announcement keywords"), sounds: ["g", "r", "stress"], exampleWords: ["vertraging", "overstappen", "perron"], notesForChineseLearners: "交通广播快，先抓关键词重音。" },
  { id: "a2-pron-email-formal", title: lt("正式邮件常用词发音", "Pronunciation of email/form words"), sounds: ["ij", "ui", "-lijk"], exampleWords: ["bijlage", "duidelijk", "vriendelijke groet"], notesForChineseLearners: "邮件套话要读得清楚，方便口头确认。" },
];

const a2SupplementalScenarios = [
  scenario("a2-09-pharmacy", "去药房拿药", "Pick up medicine at the pharmacy", "询问药品用法、剂量和保险。", "Ask about medicine use, dosage, and insurance.", ["Hoe moet ik dit medicijn gebruiken?", "Wordt dit vergoed?"], ["speaking", "listening", "reading"]),
  scenario("a2-10-form-help", "请人帮忙看表格", "Ask for help with a form", "说明哪里不懂并请求解释字段。", "Explain what is unclear and ask about fields.", ["Kunt u mij helpen met dit formulier?"], ["speaking", "reading", "writing"]),
  scenario("a2-11-register-address", "登记新地址", "Register a new address", "在市政厅说明搬家和地址信息。", "Explain a move and address information at the municipality.", ["Ik wil mijn adres inschrijven."], ["speaking", "reading", "writing"]),
  scenario("a2-12-document-copy", "提交证件复印件", "Submit a document copy", "理解需要什么证件和复印件。", "Understand which documents and copies are needed.", ["Ik heb een kopie nodig."], ["reading", "speaking"]),
  scenario("a2-13-rental-viewing", "预约看房", "Arrange a housing viewing", "询问租金、时间和房屋情况。", "Ask about rent, time, and housing details.", ["Kan ik de woning bekijken?"], ["speaking", "listening"]),
  scenario("a2-14-repair-request", "请求住房维修", "Request a housing repair", "报告漏水、暖气坏了或其他问题。", "Report leakage, broken heating, or another issue.", ["Er is lekkage.", "Kunt u een monteur sturen?"], ["speaking", "writing"]),
  scenario("a2-15-neighbor-issue", "说明邻里问题", "Explain a neighbor issue", "用简单句说明噪音或不便。", "Explain noise or nuisance with simple sentences.", ["Ik heb overlast van ..."], ["speaking", "writing"]),
  scenario("a2-16-roster-question", "询问工作排班", "Ask about a work schedule", "确认工作时间或班次。", "Confirm working time or shift.", ["Kunt u mijn rooster controleren?"], ["speaking", "reading"]),
  scenario("a2-17-return-to-work", "说明何时复工", "Say when you return to work", "请病假后说明明天是否能回来。", "After sick leave, say whether you can return tomorrow.", ["Morgen bel ik u weer."], ["speaking", "writing"]),
  scenario("a2-18-train-cancelled", "火车取消", "Train cancelled", "询问替代路线和换乘。", "Ask about alternative route and transfer.", ["Mijn trein valt uit.", "Waar moet ik overstappen?"], ["speaking", "listening", "reading"]),
  scenario("a2-19-check-in-problem", "交通卡进出站问题", "Check-in/check-out problem", "说明忘记刷卡或机器问题。", "Explain forgotten check-in/out or machine problem.", ["Ik heb een probleem met inchecken."], ["speaking", "writing"]),
  scenario("a2-20-bill-too-high", "账单太高", "Bill is too high", "请求解释金额和付款日期。", "Ask for explanation of amount and payment date.", ["De rekening is te hoog."], ["speaking", "writing", "reading"]),
  scenario("a2-21-insurance-question", "询问保险报销", "Ask about insurance reimbursement", "询问是否报销和需要什么资料。", "Ask whether something is reimbursed and what documents are needed.", ["Wordt dit vergoed door de verzekering?"], ["speaking", "reading"]),
  scenario("a2-22-understand-letter", "看不懂官方信", "Do not understand an official letter", "请求解释信件重点。", "Ask for explanation of the main points of a letter.", ["Ik begrijp deze brief niet goed."], ["speaking", "reading"]),
  scenario("a2-23-send-attachment", "邮件发送附件", "Send an email attachment", "写一句说明附件和请求回复。", "Write a short note about an attachment and ask for reply.", ["Ik stuur de bijlage mee."], ["writing", "reading"]),
  scenario("a2-24-complaint-short", "写简短投诉", "Write a short complaint", "说明不满意、原因和希望的解决方式。", "State dissatisfaction, reason, and desired solution.", ["Ik ben niet tevreden over ..."], ["writing", "reading"]),
  scenario("a2-25-change-appointment", "改预约时间", "Change an appointment", "说不方便并提出新的时间。", "Say a time does not work and propose a new time.", ["Ik wil mijn afspraak verzetten."], ["speaking", "writing", "listening"]),
  scenario("a2-26-cancel-appointment", "取消预约", "Cancel an appointment", "礼貌取消并说明原因。", "Politely cancel and give a reason.", ["Ik wil mijn afspraak afzeggen."], ["speaking", "writing"]),
  scenario("a2-27-phone-spelling", "电话里请求拼写", "Ask for spelling on the phone", "听不清名字、地址或代码时请求拼写。", "Ask for spelling when name, address, or code is unclear.", ["Kunt u dat spellen?"], ["speaking", "listening"]),
];

const b1Themes = [
  theme("b1-work-education", "工作、求职和教育", "Work, job applications, and education", "表达经验、计划和资格。", "Express experience, plans, and qualifications.", words([
    ["sollicitatie", "求职申请", "job application", "must", "de"], ["vacature", "职位空缺", "vacancy", "must", "de"], ["ervaring", "经验", "experience", "must", "de"], ["opleiding", "教育/培训", "education/training", "must", "de"], ["diploma", "文凭", "diploma", "should", "het"], ["vaardigheid", "技能", "skill", "must", "de"], ["verantwoordelijkheid", "责任", "responsibility", "should", "de"], ["team", "团队", "team", "should", "het"], ["vergadering", "会议", "meeting", "must", "de"], ["afspraak", "预约/约定", "appointment", "must", "de"], ["stage", "实习", "internship", "should", "de"], ["cursus", "课程", "course", "should", "de"], ["leidinggevende", "主管", "manager", "should", "de"], ["contract", "合同", "contract", "should", "het"], ["salaris", "薪水", "salary", "should", "het"], ["collega", "同事", "colleague", "must", "de"], ["functie", "职位", "position", "must", "de"], ["bedrijf", "公司", "company", "must", "het"], ["werkplek", "工作场所", "workplace", "should", "de"], ["beschikbaar", "有空/可用", "available"],
  ])),
  theme("b1-opinion-society", "观点、社会和新闻", "Opinions, society, and news", "说明观点并给出简单理由。", "State opinions and give simple reasons.", words([
    ["mening", "观点", "opinion", "must", "de"], ["standpunt", "立场", "position", "must", "het"], ["reden", "原因", "reason", "must", "de"], ["voorbeeld", "例子", "example", "must", "het"], ["voordeel", "优点", "advantage", "must", "het"], ["nadeel", "缺点", "disadvantage", "must", "het"], ["maatschappij", "社会", "society", "should", "de"], ["nieuws", "新闻", "news", "should", "het"], ["gemeente", "市政府", "municipality", "should", "de"], ["overheid", "政府", "government", "should", "de"], ["burger", "公民", "citizen", "should", "de"], ["probleem", "问题", "problem", "must", "het"], ["oplossing", "解决方案", "solution", "must", "de"], ["verandering", "变化", "change", "should", "de"], ["discussie", "讨论", "discussion", "should", "de"], ["argument", "论点", "argument", "must", "het"], ["eens", "同意", "agree"], ["oneens", "不同意", "disagree"], ["belangrijk", "重要", "important"], ["mogelijk", "可能", "possible"],
  ])),
  theme("b1-health-complaints-planning", "健康、投诉和计划", "Health, complaints, and planning", "解释问题、提出请求和安排计划。", "Explain problems, make requests, and plan.", words([
    ["gezondheid", "健康", "health", "must", "de"], ["klacht", "投诉/症状", "complaint", "must", "de"], ["advies", "建议", "advice", "must", "het"], ["behandeling", "治疗", "treatment", "should", "de"], ["afdeling", "部门", "department", "should", "de"], ["planning", "计划", "planning", "must", "de"], ["doel", "目标", "goal", "must", "het"], ["stap", "步骤", "step", "must", "de"], ["keuze", "选择", "choice", "must", "de"], ["gevolg", "后果", "consequence", "should", "het"], ["oorzaak", "原因", "cause", "must", "de"], ["situatie", "情况", "situation", "must", "de"], ["ervaring", "经历", "experience", "must", "de"], ["verleden", "过去", "past", "should", "het"], ["toekomst", "未来", "future", "should", "de"], ["verbeteren", "改善", "improve"], ["uitleggen", "解释", "explain"], ["beschrijven", "描述", "describe"], ["aanpassen", "调整", "adjust"], ["bespreken", "讨论", "discuss"],
  ])),
  theme("b1-formal-writing", "正式邮件和个人经历", "Formal email and personal experiences", "写较完整邮件和叙述经历。", "Write fuller emails and describe experiences.", words([
    ["aanhef", "称呼", "salutation", "should", "de"], ["afsluiting", "结尾", "closing", "should", "de"], ["betreft", "主题", "subject"], ["reactie", "回应", "response", "must", "de"], ["verzoek", "请求", "request", "must", "het"], ["voorstel", "建议/提案", "proposal", "must", "het"], ["bijlage", "附件", "attachment", "should", "de"], ["document", "文件", "document", "should", "het"], ["informatie", "信息", "information", "must", "de"], ["afspraak", "约定", "appointment", "must", "de"], ["herinnering", "提醒", "reminder", "should", "de"], ["bevestiging", "确认", "confirmation", "should", "de"], ["contact", "联系", "contact", "must", "het"], ["bericht", "消息", "message", "must", "het"], ["ervaring", "经历", "experience", "must", "de"], ["gebeurtenis", "事件", "event", "should", "de"], ["verhaal", "故事", "story", "should", "het"], ["duidelijk", "清楚", "clear"], ["formeel", "正式", "formal"], ["vriendelijk", "友好", "friendly"],
  ])),
  theme("b1-connectors", "论证连接词", "Argument connectors", "连接观点、理由和例子。", "Connect opinions, reasons, and examples.", words([
    ["omdat", "因为", "because"], ["doordat", "由于", "because of"], ["daarom", "因此", "therefore"], ["dus", "所以", "so"], ["hoewel", "虽然", "although"], ["toch", "仍然", "still"], ["als", "如果/当", "if/when"], ["toen", "当时", "when in the past"], ["terwijl", "同时/然而", "while"], ["bovendien", "此外", "moreover"], ["daarnaast", "此外", "in addition"], ["bijvoorbeeld", "例如", "for example"], ["ten eerste", "第一", "firstly"], ["ten tweede", "第二", "secondly"], ["kortom", "总之", "in short"], ["volgens mij", "我认为", "in my opinion"], ["aan de ene kant", "一方面", "on the one hand"], ["aan de andere kant", "另一方面", "on the other hand"], ["het hangt ervan af", "这取决于", "it depends"], ["in vergelijking met", "与……相比", "compared with"],
  ])),
];

const b2Themes = [
  theme("b2-professional-study", "专业沟通和高等教育", "Professional communication and higher education", "处理专业、学习和正式交流。", "Handle professional, academic, and formal communication.", words([
    ["beleid", "政策", "policy", "must", "het"], ["organisatie", "组织", "organization", "must", "de"], ["instelling", "机构", "institution", "should", "de"], ["onderzoek", "研究", "research", "must", "het"], ["analyse", "分析", "analysis", "must", "de"], ["resultaat", "结果", "result", "must", "het"], ["conclusie", "结论", "conclusion", "must", "de"], ["samenvatting", "总结", "summary", "must", "de"], ["rapport", "报告", "report", "must", "het"], ["presentatie", "演示", "presentation", "should", "de"], ["deelnemer", "参与者", "participant", "should", "de"], ["doelgroep", "目标群体", "target group", "should", "de"], ["kwaliteit", "质量", "quality", "must", "de"], ["efficiëntie", "效率", "efficiency", "should", "de"], ["ontwikkeling", "发展", "development", "must", "de"], ["strategie", "策略", "strategy", "should", "de"], ["project", "项目", "project", "must", "het"], ["evaluatie", "评估", "evaluation", "should", "de"], ["voorwaarde", "条件", "condition", "should", "de"], ["aanpak", "方法", "approach", "must", "de"],
  ])),
  theme("b2-abstract-policy", "抽象主题、政策和社会", "Abstract topics, policy, and society", "讨论复杂社会议题。", "Discuss complex social issues.", words([
    ["samenleving", "社会", "society", "must", "de"], ["integratie", "融入", "integration", "must", "de"], ["duurzaamheid", "可持续性", "sustainability", "should", "de"], ["gelijkheid", "平等", "equality", "should", "de"], ["vrijheid", "自由", "freedom", "should", "de"], ["verantwoordelijkheid", "责任", "responsibility", "must", "de"], ["maatregel", "措施", "measure", "must", "de"], ["gevolg", "后果", "consequence", "must", "het"], ["oorzaak", "原因", "cause", "must", "de"], ["factor", "因素", "factor", "must", "de"], ["ontwikkeling", "发展", "development", "must", "de"], ["trend", "趋势", "trend", "must", "de"], ["uitdaging", "挑战", "challenge", "must", "de"], ["oplossing", "解决方案", "solution", "must", "de"], ["belang", "利益/重要性", "interest/importance", "must", "het"], ["invloed", "影响", "influence", "must", "de"], ["risico", "风险", "risk", "should", "het"], ["kans", "机会", "chance", "should", "de"], ["standpunt", "立场", "position", "must", "het"], ["nuance", "细微差别", "nuance", "should", "de"],
  ])),
  theme("b2-data-debate", "数据、趋势和辩论", "Data, trends, and debate", "描述图表、趋势和论证关系。", "Describe data, trends, and argumentative relations.", words([
    ["percentage", "百分比", "percentage", "must", "het"], ["aantal", "数量", "number", "must", "het"], ["gemiddelde", "平均值", "average", "must", "het"], ["toename", "增加", "increase", "must", "de"], ["afname", "减少", "decrease", "must", "de"], ["stijging", "上升", "rise", "must", "de"], ["daling", "下降", "decline", "must", "de"], ["vergelijking", "比较", "comparison", "must", "de"], ["grafiek", "图表", "graph", "must", "de"], ["tabel", "表格", "table", "should", "de"], ["gegevens", "数据", "data"], ["bron", "来源", "source", "must", "de"], ["stelling", "命题", "statement", "should", "de"], ["argumentatie", "论证", "argumentation", "should", "de"], ["tegenargument", "反论点", "counterargument", "should", "het"], ["bewijs", "证据", "evidence", "must", "het"], ["aanname", "假设", "assumption", "should", "de"], ["consequentie", "后果", "consequence", "should", "de"], ["daarentegen", "相反", "in contrast"], ["samenvattend", "总结来说", "summarizing"],
  ])),
  theme("b2-formal-register", "正式语域和报告", "Formal register and reports", "清楚组织正式文本。", "Organize formal texts clearly.", words([
    ["inleiding", "引言", "introduction", "must", "de"], ["kern", "主体", "main body", "should", "de"], ["slot", "结尾", "conclusion", "should", "het"], ["paragraaf", "段落", "paragraph", "must", "de"], ["structuur", "结构", "structure", "must", "de"], ["formulering", "措辞", "wording", "should", "de"], ["register", "语域", "register", "should", "het"], ["objectief", "客观的", "objective"], ["subjectief", "主观的", "subjective"], ["genuanceerd", "有细微差别的", "nuanced"], ["relevant", "相关的", "relevant"], ["noodzakelijk", "必要的", "necessary"], ["waarschijnlijk", "可能的", "probable"], ["aanzienlijk", "相当大的", "considerable"], ["beperkt", "有限的", "limited"], ["toelichten", "阐明", "clarify"], ["benadrukken", "强调", "emphasize"], ["verwijzen", "引用/指向", "refer"], ["concluderen", "得出结论", "conclude"], ["samenvatten", "总结", "summarize"],
  ])),
  theme("b2-advanced-connectors", "高级连接和立场表达", "Advanced connectors and stance", "让表达更精确、更正式。", "Make expression more precise and formal.", words([
    ["hoewel", "虽然", "although"], ["ondanks", "尽管", "despite"], ["aangezien", "鉴于/因为", "since"], ["daarentegen", "相反", "in contrast"], ["desondanks", "尽管如此", "nevertheless"], ["namelijk", "也就是说/因为", "namely"], ["immers", "毕竟", "after all"], ["enerzijds", "一方面", "on the one hand"], ["anderzijds", "另一方面", "on the other hand"], ["bovendien", "此外", "moreover"], ["daarbij", "此外", "in addition"], ["dientengevolge", "因此", "as a result"], ["met betrekking tot", "关于", "with regard to"], ["ten aanzien van", "关于", "concerning"], ["in tegenstelling tot", "与……相反", "unlike"], ["naar aanleiding van", "由于/根据", "in response to"], ["op basis van", "基于", "based on"], ["wat betreft", "至于", "as for"], ["samenvattend", "总结来说", "summarizing"], ["concluderend", "结论是", "concluding"],
  ])),
];

export const dutchSyllabus: SyllabusLevel[] = [
  {
    level: "A0",
    title: lt("A0 零基础入门", "A0 Starter"),
    goal: lt("从零开始。学习荷兰语发音、问候、身份表达和最基础造句。", "Start from zero. Learn Dutch sounds, greetings, identity phrases, and very basic sentence building."),
    canDo: [
      lt("能读出常见字母和组合音。", "Can decode common letters and sound combinations."),
      lt("能打招呼并回答最简单问题。", "Can greet people and answer very simple questions."),
      lt("能说姓名、住址城市和来自哪里。", "Can say name, city of residence, and origin."),
    ],
    vocabularyThemes: [...a0StarterUnits, ...a0SupplementalThemes],
    sentencePatterns: [...a0StarterPatterns, ...a0SupplementalPatterns],
    grammarPoints: [...a0StarterGrammar, ...a0SupplementalGrammar],
    pronunciationPoints: [...basePronunciation, ...a0PronunciationReinforcement],
    scenarioTasks: [
      scenario("a0-01-greetings", "打招呼和礼貌表达", "Greetings and politeness", "完成问候、感谢、请和再见。", "Use hello, thanks, please, and goodbye.", ["Hallo.", "Dank je.", "Tot ziens."], ["speaking", "listening"]),
      scenario("a0-02-name", "我叫什么名字", "My name", "说姓名并问别人叫什么。", "Say your name and ask another person's name.", ["Ik heet ...", "Hoe heet jij?"], ["speaking"]),
      scenario("a0-03-origin-home", "我来自哪里、住在哪里", "Where I come from and live", "说国家和城市。", "Say country and city.", ["Ik kom uit ...", "Ik woon in ..."], ["speaking"]),
      scenario("a0-04-languages", "我会/不会说什么语言", "Languages I speak", "说会不会说荷兰语、中文、英文。", "Say whether you speak Dutch, Chinese, or English.", ["Ik spreek ...", "Ik spreek geen ..."], ["speaking", "listening"]),
      scenario("a0-05-numbers", "数字 0-20", "Numbers 0-20", "听和说 0-20。", "Listen to and say 0-20.", ["nul, een, twee", "Mijn nummer is ..."], ["speaking", "listening"]),
      scenario("a0-06-this-that", "这是/那是什么", "This/that and what is it", "指认基础物品。", "Identify basic objects.", ["Dit is ...", "Wat is dat?"], ["speaking", "reading"]),
      scenario("a0-07-have", "我有/我没有", "I have / I don't have", "说有无基础物品。", "Say whether you have basic objects.", ["Ik heb ...", "Ik heb geen ..."], ["speaking", "writing"]),
      scenario("a0-08-repeat", "我听不懂，请重复", "I don't understand, please repeat", "听不懂时求助。", "Ask for repetition when lost.", ["Ik begrijp het niet.", "Kunt u dat herhalen?"], ["speaking", "listening"]),
      scenario("a0-09-sound-review", "基础发音复习", "Basic pronunciation review", "把 oe/ui/eu/ij 放进词里跟读。", "Repeat oe/ui/eu/ij inside words.", ["goed", "huis", "leuk", "trein"], ["speaking", "listening"]),
      scenario("a0-10-first-intro", "第一次介绍自己", "First self-introduction", "完成 20-30 秒自我介绍。", "Give a 20-30 second self-introduction.", ["Hallo, ik heet ...", "Ik kom uit ...", "Ik woon in ..."], ["speaking", "writing"]),
      ...a0SupplementalScenarios,
    ],
    speakingOutputTasks: [lt("完成 20-30 秒自我介绍。", "Give a 20-30 second self-introduction."), lt("能在听不懂时说一句求助句。", "Can use one help phrase when lost.")],
    writingOutputTasks: [lt("写 3-5 句个人信息。", "Write 3-5 personal information sentences."), lt("填写姓名、国家、城市和语言。", "Fill name, country, city, and language.")],
    readingTaskTypes: [lt("识别问候、姓名、国家、数字和基础物品词。", "Recognize greetings, names, countries, numbers, and basic object words.")],
    listeningTaskTypes: [lt("听懂问候、姓名、数字 0-20 和简单 yes/no 回答。", "Understand greetings, names, numbers 0-20, and simple yes/no answers.")],
    examRelevance: lt("A0 是 NedPop 内部预备阶段，不对应官方考试级别。", "A0 is a NedPop internal preparation stage and not an official exam level."),
    notesForChineseLearners: lt("重点是先建立拼读、动词变位意识和最短可说句。", "Focus on decoding, verb-form awareness, and very short usable sentences."),
  },
  {
    level: "A1",
    title: lt("A1 生活基础", "A1 Foundation"),
    goal: lt("能用短句处理基础日常生活主题。", "Handle basic daily life topics with short, simple sentences."),
    canDo: [lt("能买简单物品、问时间和地点。", "Can buy simple items and ask time/place questions."), lt("能介绍家庭、住处和日常。", "Can introduce family, home, and daily routine."), lt("能理解非常短的通知和对话。", "Can understand very short notices and dialogues.")],
    vocabularyThemes: [...a1FoundationUnits, ...a1SupplementalThemes],
    sentencePatterns: [...a1FoundationPatterns, ...a1SupplementalPatterns],
    grammarPoints: [...a1FoundationGrammar, ...a1SupplementalGrammar],
    pronunciationPoints: [...basePronunciation, { id: "a1-rhythm", title: lt("词重音和句子节奏", "Word stress and sentence rhythm"), sounds: ["stress", "rhythm", "r", "v/w"], exampleWords: ["afspraak", "morgen", "water", "vriend"], notesForChineseLearners: "不要每个音节都一样重，荷兰语句子有轻重节奏。" }, ...a1PronunciationReinforcement],
    scenarioTasks: [
      scenario("a1-01-info", "我的日常信息", "My daily information", "说姓名、地址、电话和邮箱。", "Say name, address, phone, and email.", ["Mijn adres is ..."], ["speaking", "writing"]),
      scenario("a1-02-time", "时间和日期", "Time and date", "问时间和说日期。", "Ask time and say dates.", ["Hoe laat is het?", "Vandaag is ..."], ["speaking", "listening"]),
      scenario("a1-03-family", "家庭成员", "Family members", "介绍家庭成员。", "Introduce family members.", ["Ik heb een broer."], ["speaking", "writing"]),
      scenario("a1-04-home", "我的家和房间", "My home and rooms", "描述住处和房间。", "Describe home and rooms.", ["Mijn huis heeft ..."], ["speaking", "writing"]),
      scenario("a1-05-food", "食物和饮料", "Food and drinks", "表达想吃喝什么。", "Say what you want to eat or drink.", ["Ik wil graag ..."], ["speaking", "listening"]),
      scenario("a1-06-supermarket", "在超市买东西", "Buying at the supermarket", "询问价格并选择商品。", "Ask prices and choose items.", ["Hoeveel kost ...?", "Ik neem ..."], ["speaking", "listening"]),
      scenario("a1-07-transport", "交通和车站", "Transport and station", "问车站和交通。", "Ask about stations and transport.", ["Waar is het station?", "Ik neem de trein."], ["speaking", "listening"]),
      scenario("a1-08-weather", "天气和衣服", "Weather and clothes", "描述天气和穿着。", "Describe weather and clothes.", ["Het is koud.", "Ik heb een jas."], ["speaking", "listening"]),
      scenario("a1-09-school-work", "学校和工作", "School and work", "说学习和工作。", "Talk about study and work.", ["Ik werk ...", "Ik leer Nederlands."], ["speaking", "writing"]),
      scenario("a1-10-routine", "日常作息", "Daily routine", "描述一天。", "Describe a day.", ["Ik sta om ... op."], ["speaking", "writing"]),
      scenario("a1-11-health", "简单身体不舒服", "Simple discomfort", "表达简单症状。", "Express simple symptoms.", ["Ik ben ziek.", "Ik heb pijn."], ["speaking", "listening"]),
      scenario("a1-12-directions", "问路和地点", "Directions and places", "问地点和方向。", "Ask place and direction.", ["Waar is ...?", "Ga rechtdoor."], ["speaking", "listening"]),
      scenario("a1-13-likes", "喜好和选择", "Likes and choices", "表达喜欢和选择。", "Express likes and choices.", ["Ik vind ... leuk.", "Ik wil liever ..."], ["speaking"]),
      scenario("a1-14-appointment", "简单约时间", "Simple appointment", "约一个简单时间。", "Make a simple appointment time.", ["Kan ik om ... komen?"], ["speaking", "listening"]),
      scenario("a1-15-review", "A1 综合复习", "A1 review", "综合个人信息、购物、交通和作息。", "Combine personal info, shopping, transport, and routine.", ["Ik woon ... en ik werk ..."], ["speaking", "writing", "reading", "listening"]),
      scenario("a1-16-clothes-shop", "买衣服和说颜色", "Buy clothes and say colors", "说颜色、衣服和简单选择。", "Say colors, clothes, and simple choices.", ["Ik zoek een blauwe trui.", "Ik wil deze jas."], ["speaking", "listening"]),
      scenario("a1-17-home-location", "描述房间里的东西", "Describe things in a room", "用 er is/er zijn 和位置词描述房间。", "Use er is/er zijn and location words to describe a room.", ["Er is een tafel in de kamer."], ["speaking", "writing"]),
      scenario("a1-18-pay-at-checkout", "在收银台付款", "Pay at the checkout", "询问刷卡、收据和数量。", "Ask about card payment, receipt, and quantity.", ["Kan ik pinnen?", "Mag ik de bon?"], ["speaking", "listening", "reading"]),
    ],
    speakingOutputTasks: [lt("做 45-60 秒自我介绍。", "Give a 45-60 second self-introduction."), lt("完成购物、问路、交通或约时间角色扮演。", "Complete a shopping, directions, transport, or appointment role-play.")],
    writingOutputTasks: [lt("写 5-8 句关于自己、家庭、住处和日常。", "Write 5-8 sentences about self, family, home, and routine."), lt("写一条简单约时间消息。", "Write a simple appointment-time message.")],
    readingTaskTypes: [lt("读短广告、营业时间、路线说明、菜单、价格标签和简单表格。", "Read short ads, opening hours, directions, menus, price labels, and simple forms.")],
    listeningTaskTypes: [lt("听懂价格、时间、地点、家庭信息、交通信息和简单日常对话。", "Understand prices, time, place, family info, transport info, and simple daily dialogues.")],
    examRelevance: lt("A1 为 A2 实用任务打基础，不复制任何考试题。", "A1 prepares for A2 practical tasks without copying exam questions."),
    notesForChineseLearners: lt("重点克服 de/het、动词变位、V2 和介词搭配。", "Focus on de/het, verb forms, V2, and prepositions."),
  },
  {
    level: "A2",
    title: lt("A2 生活进阶", "A2 Bridge"),
    goal: lt("能处理实用荷兰语场景，并准备 A2 风格的口语、写作、阅读和听力任务。", "Handle practical Dutch situations and prepare for A2-style speaking, writing, reading, and listening tasks."),
    canDo: [lt("能预约、改期、请病假和说明简单问题。", "Can make appointments, reschedule, call in sick, and explain simple problems."), lt("能写简短邮件和填写简单表格。", "Can write short emails and fill simple forms."), lt("能理解生活通知、账单和基础官方信息。", "Can understand daily notices, bills, and basic official information.")],
    vocabularyThemes: [...a2Themes, ...a2SupplementalThemes],
    sentencePatterns: [
      pattern("a2-appointment", "Ik wil graag een afspraak maken.", "我想预约。", "I would like to make an appointment.", [["Ik wil graag een afspraak maken met de huisarts.", "我想预约家庭医生。", "I would like to make an appointment with the GP."]], "预约", "Appointments"),
      pattern("a2-help", "Kunt u mij helpen?", "您可以帮我吗？", "Can you help me?", [["Kunt u mij helpen met dit formulier?", "您可以帮我填这个表吗？", "Can you help me with this form?"]], "求助", "Help request"),
      pattern("a2-problem", "Ik heb een probleem met ...", "我有……的问题。", "I have a problem with ...", [["Ik heb een probleem met mijn woning.", "我的住房有问题。", "I have a problem with my home."]], "说明问题", "Explaining a problem"),
      pattern("a2-sick", "Ik ben ziek en kan niet komen.", "我生病了，不能来。", "I am sick and cannot come.", [["Ik ben ziek en kan vandaag niet werken.", "我生病了，今天不能工作。", "I am sick and cannot work today."]], "请病假", "Calling in sick"),
      pattern("a2-delay", "Mijn trein heeft vertraging.", "我的火车晚点了。", "My train is delayed.", [["Mijn trein heeft tien minuten vertraging.", "我的火车晚点十分钟。", "My train is ten minutes delayed."]], "交通延误", "Transport delay"),
      pattern("a2-gemeente", "Ik moet naar de gemeente.", "我必须去市政厅。", "I have to go to the municipality.", [["Ik moet naar de gemeente voor mijn adres.", "我必须为地址去市政厅。", "I have to go to the municipality for my address."]], "官方事务", "Official admin"),
      pattern("a2-letter", "Ik heb een brief gekregen.", "我收到了一封信。", "I received a letter.", [["Ik heb een brief van de gemeente gekregen.", "我收到市政厅的一封信。", "I received a letter from the municipality."]], "读信/通知", "Reading letters/notices"),
      pattern("a2-change", "Ik wil dit graag veranderen.", "我想更改这个。", "I would like to change this.", [["Ik wil mijn afspraak graag veranderen.", "我想更改我的预约。", "I would like to change my appointment."]], "改期/更改", "Changing something"),
      pattern("a2-langskomen", "Wanneer kan ik langskomen?", "我什么时候可以过来？", "When can I come by?", [["Wanneer kan ik bij u langskomen?", "我什么时候可以去您那里？", "When can I come by?"]], "约时间", "Scheduling"),
      pattern("a2-repeat", "Kunt u dat herhalen?", "您可以重复一下吗？", "Can you repeat that?", [["Kunt u dat langzaam herhalen?", "您可以慢一点重复吗？", "Can you repeat that slowly?"]], "听力修复", "Listening repair"),
      ...a2SupplementalPatterns,
    ],
    grammarPoints: [
      grammar("a2-modals", "情态动词 kunnen/moeten/willen/mogen", "Modal verbs", "情态动词在第二位，主要动词常去句尾。", "Modal in position 2, main verb often at the end.", [["Ik wil een afspraak maken.", "我想预约。", "I want to make an appointment."]], "must"),
      grammar("a2-perfect", "完成时基础", "Perfect tense basics", "用 hebben/zijn + 过去分词说已发生的事。", "Use hebben/zijn + participle for completed events.", [["Ik heb een brief gekregen.", "我收到了一封信。", "I received a letter."]], "must"),
      grammar("a2-separable", "可分动词", "Separable verbs", "前缀常移动到句尾。", "The prefix often moves to the end.", [["Ik bel de huisarts op.", "我打电话给家庭医生。", "I call the GP."]], "must"),
      grammar("a2-because", "want/omdat 基础", "want/omdat basics", "want 后保持主句词序；omdat 后动词到后面。", "want keeps main-clause order; omdat sends the verb later.", [["Ik kom niet, want ik ben ziek.", "我不来，因为我生病了。", "I am not coming because I am sick."]], "should", "中文“因为”后不改变词序，荷兰语 omdat 会改变词序。"),
      grammar("a2-time", "时间表达", "Time expressions", "能说今天、明天、下周、十分钟后。", "Express today, tomorrow, next week, in ten minutes.", [["Ik kom morgen om tien uur.", "我明天十点来。", "I will come tomorrow at ten."]], "must"),
      grammar("a2-articles", "更多 de/het pattern", "More de/het patterns", "-ing 多数 de，-je 多数 het，复合词看最后词。", "-ing often de, -je usually het, compounds follow the final noun.", [["het ziekenhuis", "医院", "the hospital"]], "should"),
      grammar("a2-plurals", "常见复数 pattern", "Common plural patterns", "扩展 -en, -s, 拼写变化。", "Expand -en, -s, and spelling changes.", [["huis - huizen", "房子 - 房子们", "house - houses"]], "should"),
      grammar("a2-email", "简单邮件结构", "Simple email structure", "称呼、目的、请求、结尾。", "Greeting, purpose, request, closing.", [["Beste meneer Jansen, ik ben vandaag ziek.", "Jansen 先生您好，我今天生病了。", "Dear Mr Jansen, I am sick today."]], "must"),
      grammar("a2-polite", "礼貌请求", "Polite requests", "用 graag, kunt u, alstublieft 降低生硬感。", "Use graag, kunt u, alstublieft to sound polite.", [["Kunt u mij alstublieft helpen?", "您可以帮我吗？", "Could you please help me?"]], "must"),
      ...a2SupplementalGrammar,
    ],
    pronunciationPoints: [...basePronunciation, { id: "a2-long-words", title: lt("长词拆块和重音", "Chunking and stress in longer words"), sounds: ["stress", "sch", "ui", "-ing", "-lijk"], exampleWords: ["ziekenhuis", "verzekering", "gemeente", "vertraging", "duidelijk"], notesForChineseLearners: "A2 长词不要硬背整串，先拆成 sound chunk 和 meaning chunk。" }, ...a2PronunciationReinforcement],
    scenarioTasks: [
      scenario("a2-gp", "预约家庭医生", "Make a GP appointment", "打电话预约并说明简单症状。", "Call to make an appointment and explain a simple symptom.", ["Ik wil graag een afspraak maken.", "Ik ben ziek."], ["speaking", "listening"]),
      scenario("a2-sick", "工作请病假", "Call in sick", "通知雇主今天不能上班。", "Tell employer you cannot work today.", ["Ik ben ziek en kan niet komen."], ["speaking", "writing"]),
      scenario("a2-gemeente", "去市政厅", "Go to the municipality", "询问表格、地址或预约。", "Ask about a form, address, or appointment.", ["Ik moet naar de gemeente.", "Kunt u mij helpen?"], ["speaking", "reading"]),
      scenario("a2-bill", "询问账单", "Ask about a bill", "说明账单问题并请求解释。", "Explain a bill problem and ask for clarification.", ["Ik heb een probleem met de rekening."], ["speaking", "writing", "reading"]),
      scenario("a2-housing", "报告住房问题", "Report a housing problem", "说明维修或租房问题。", "Explain a repair or housing issue.", ["Ik heb een probleem met mijn woning."], ["speaking", "writing"]),
      scenario("a2-delay", "处理火车延误", "Handle train delay", "说明晚点并告知会迟到。", "Explain delay and say you will be late.", ["Mijn trein heeft vertraging."], ["speaking", "listening"]),
      scenario("a2-email", "写短邮件", "Write a short email", "写称呼、目的、请求和结尾。", "Write greeting, purpose, request, and closing.", ["Beste ...", "Met vriendelijke groet"], ["writing"]),
      scenario("a2-form", "填写简单表格", "Fill in a simple form", "填写姓名、地址、出生日期和联系方式。", "Fill name, address, date of birth, and contact details.", ["Mijn geboortedatum is ..."], ["reading", "writing"]),
      ...a2SupplementalScenarios,
    ],
    speakingOutputTasks: [lt("完成 1 分钟实用场景说明。", "Complete a one-minute practical scenario explanation."), lt("用礼貌请求完成电话角色扮演。", "Complete a phone role-play using polite requests.")],
    writingOutputTasks: [lt("写请病假、预约或改期短邮件。", "Write a short sick leave, appointment, or rescheduling email.")],
    readingTaskTypes: [lt("读表格、账单、短邮件、预约确认和生活通知。", "Read forms, bills, short emails, appointment confirmations, and daily notices.")],
    listeningTaskTypes: [lt("听懂预约时间、地点、简单说明和常用电话句。", "Understand appointment times, places, simple explanations, and common phone phrases.")],
    examRelevance: lt("A2 对齐融合式实用语言能力：口语、写作、听力、阅读和基础荷兰社会生活任务。不复制官方考试题。", "A2 aligns with practical integration-style skills: speaking, writing, listening, reading, and basic Dutch society tasks. It does not copy official exam questions."),
    notesForChineseLearners: lt("重点是把礼貌请求、完成时、可分动词和长词拆块变成可套用模板。", "Focus on reusable templates for polite requests, perfect tense, separable verbs, and long-word chunking."),
  },
  {
    level: "B1",
    title: lt("B1 独立表达", "B1 Independent"),
    goal: lt("能表达观点、解释问题、描述经历，并处理工作/学习相关沟通。", "Express opinions, explain problems, describe experiences, and handle work/study-related communication."),
    canDo: [lt("能说明观点并给理由。", "Can state opinions and give reasons."), lt("能写投诉、申请和较完整邮件。", "Can write complaint, application, and fuller emails."), lt("能参与简单会议或讨论。", "Can participate in a simple meeting or discussion.")],
    vocabularyThemes: b1Themes,
    sentencePatterns: [
      pattern("b1-ik-vind-dat", "Ik vind dat ...", "我认为……", "I think that ...", [["Ik vind dat de trein te duur is.", "我认为火车太贵。", "I think the train is too expensive."]], "观点", "Opinion"),
      pattern("b1-volgens-mij", "Volgens mij ...", "在我看来……", "In my opinion ...", [["Volgens mij is dit een goede oplossing.", "在我看来这是一个好解决方案。", "In my opinion this is a good solution."]], "表达看法", "Giving views"),
      pattern("b1-two-sides", "Aan de ene kant ..., aan de andere kant ...", "一方面……另一方面……", "On the one hand ..., on the other hand ...", [["Aan de ene kant is het handig, aan de andere kant is het duur.", "一方面方便，另一方面贵。", "On one hand it is convenient, on the other hand it is expensive."]], "比较利弊", "Comparing pros and cons"),
      pattern("b1-advantage", "Het voordeel is ... / Het nadeel is ...", "优点是……/缺点是……", "The advantage/disadvantage is ...", [["Het voordeel is dat ik dichtbij woon.", "优点是我住得近。", "The advantage is that I live nearby."]], "论证", "Argumentation"),
      pattern("b1-experience", "Ik heb ervaring met ...", "我有……经验。", "I have experience with ...", [["Ik heb ervaring met klantenservice.", "我有客服经验。", "I have experience with customer service."]], "求职", "Job application"),
      pattern("b1-agree", "Ik ben het eens/niet eens met ...", "我同意/不同意……", "I agree/disagree with ...", [["Ik ben het niet eens met deze beslissing.", "我不同意这个决定。", "I disagree with this decision."]], "讨论", "Discussion"),
      pattern("b1-explain-why", "Kunt u uitleggen waarom ...?", "您能解释为什么……吗？", "Can you explain why ...?", [["Kunt u uitleggen waarom de rekening hoger is?", "您能解释为什么账单更高吗？", "Can you explain why the bill is higher?"]], "询问原因", "Asking for reasons"),
      pattern("b1-respond", "Ik wil graag reageren op ...", "我想回应……", "I would like to respond to ...", [["Ik wil graag reageren op uw e-mail.", "我想回复您的邮件。", "I would like to respond to your email."]], "正式邮件", "Formal email"),
      pattern("b1-previous-work", "In mijn vorige werk ...", "在我以前的工作中……", "In my previous job ...", [["In mijn vorige werk hielp ik klanten.", "在我以前的工作中我帮助客户。", "In my previous job I helped customers."]], "经历描述", "Describing experience"),
    ],
    grammarPoints: [
      grammar("b1-past", "过去时", "Past tense", "用于叙述过去经历和故事。", "Used to narrate past experiences and stories.", [["Ik werkte in een winkel.", "我曾在商店工作。", "I worked in a shop."]], "must"),
      grammar("b1-perfect-expanded", "完成时扩展", "Perfect tense expansion", "更自然地讲经历和结果。", "Describe experiences and results more naturally.", [["Ik heb drie jaar in China gewerkt.", "我在中国工作过三年。", "I worked in China for three years."]], "must"),
      grammar("b1-subordinate", "omdat/dat/als/toen 从句", "Subordinate clauses", "从句中动词常到后面。", "The verb often moves later in subordinate clauses.", [["Ik denk dat dit belangrijk is.", "我认为这很重要。", "I think this is important."]], "must"),
      grammar("b1-relative", "关系从句基础", "Relative clauses basics", "用 die/dat 补充说明名词。", "Use die/dat to add information about nouns.", [["De man die daar werkt is mijn collega.", "在那里工作的男人是我的同事。", "The man who works there is my colleague."]], "should"),
      grammar("b1-comparison", "比较级和最高级", "Comparatives and superlatives", "表达更好、最重要等。", "Express better, most important, etc.", [["Dit is goedkoper dan dat.", "这个比那个便宜。", "This is cheaper than that."]], "must"),
      grammar("b1-connectors", "论证连接词", "Connectors for argumentation", "用连接词组织观点。", "Use connectors to organize arguments.", [["Daarom kies ik voor deze oplossing.", "因此我选择这个方案。", "Therefore I choose this solution."]], "must"),
      grammar("b1-passive", "被动语态入门", "Passive voice introduction", "理解正式文本里的 wordt/is + participle。", "Understand wordt/is + participle in formal texts.", [["De brief wordt morgen gestuurd.", "这封信明天会被发送。", "The letter will be sent tomorrow."]], "nice"),
      grammar("b1-formal-email", "正式邮件结构", "Formal email structure", "开头、背景、请求、理由、结尾。", "Opening, context, request, reason, closing.", [["Naar aanleiding van uw bericht schrijf ik deze e-mail.", "根据您的消息，我写这封邮件。", "In response to your message, I am writing this email."]], "must"),
    ],
    pronunciationPoints: [{ id: "b1-fluency", title: lt("自然语流和句子重音", "Natural flow and sentence stress"), sounds: ["sentence stress", "reduction", "linking"], exampleWords: ["volgens mij", "aan de ene kant", "ervaring"], notesForChineseLearners: "B1 重点从单词准确转向句子自然，避免每个词同样重。" }],
    scenarioTasks: [
      scenario("b1-opinion", "表达观点", "Express an opinion", "给出观点、理由和例子。", "Give opinion, reason, and example.", ["Ik vind dat ...", "Bijvoorbeeld ..."], ["speaking", "writing"]),
      scenario("b1-problem", "解释问题", "Explain a problem", "说明原因、影响和希望。", "Explain cause, impact, and desired outcome.", ["Het probleem is dat ..."], ["speaking", "writing"]),
      scenario("b1-complaint", "写投诉邮件", "Write a complaint email", "正式说明问题和请求解决。", "Formally explain a problem and request a solution.", ["Ik wil graag reageren op ..."], ["writing", "reading"]),
      scenario("b1-job", "申请工作", "Apply for a job", "介绍经验和动机。", "Describe experience and motivation.", ["Ik heb ervaring met ..."], ["writing", "speaking"]),
      scenario("b1-pros-cons", "讨论利弊", "Discuss advantages and disadvantages", "比较两个选择。", "Compare two choices.", ["Aan de ene kant ..."], ["speaking"]),
      scenario("b1-past", "描述过去经历", "Describe a past experience", "讲一段过去发生的事。", "Tell about something that happened in the past.", ["Toen ik ..."], ["speaking", "writing"]),
      scenario("b1-meeting", "参加简单会议", "Participate in a simple meeting", "回应观点并提出建议。", "Respond to opinions and propose ideas.", ["Ik ben het eens met ..."], ["speaking", "listening"]),
    ],
    speakingOutputTasks: [lt("表达观点并至少给出两个理由。", "Express an opinion with at least two reasons."), lt("描述一段过去工作或学习经历。", "Describe a past work or study experience.")],
    writingOutputTasks: [lt("写正式投诉邮件或求职邮件。", "Write a formal complaint or job application email.")],
    readingTaskTypes: [lt("读较长邮件、公告、短新闻和说明文本。", "Read longer emails, announcements, short news items, and explanatory texts.")],
    listeningTaskTypes: [lt("听懂工作、学习和社会话题的主旨与细节。", "Understand main ideas and details in work, study, and social topics.")],
    examRelevance: lt("B1 对齐 Staatsexamen Nt2 Programma I 风格技能：阅读、听力、口语、写作。不复制官方考试内容。", "B1 aligns with Staatsexamen Nt2 Programma I-style skills: reading, listening, speaking, writing. It does not copy official exam content."),
    notesForChineseLearners: lt("重点从短句升级到理由、连接词和从句。", "Move from short sentences to reasons, connectors, and subordinate clauses."),
  },
  {
    level: "B2",
    title: lt("B2 高级桥梁", "B2 Advanced Bridge"),
    goal: lt("能在学习、职业和复杂社会语境中清楚沟通。", "Communicate clearly in study, professional, and complex social contexts."),
    canDo: [lt("能结构化表达立场并回应反方观点。", "Can express a structured position and respond to counterarguments."), lt("能总结文本、描述趋势和写正式邮件/报告。", "Can summarize texts, describe trends, and write formal emails/reports."), lt("能参与较正式讨论。", "Can participate in more formal discussions.")],
    vocabularyThemes: b2Themes,
    sentencePatterns: [
      pattern("b2-research", "Uit onderzoek blijkt dat ...", "研究表明……", "Research shows that ...", [["Uit onderzoek blijkt dat de kosten stijgen.", "研究表明成本在上升。", "Research shows that costs are rising."]], "报告/论证", "Reports/argumentation"),
      pattern("b2-sprake", "Er is sprake van ...", "存在……情况。", "There is a case of ...", [["Er is sprake van een duidelijke stijging.", "出现了明显上升。", "There is a clear increase."]], "正式描述", "Formal description"),
      pattern("b2-leidt", "Dit leidt tot ...", "这导致……", "This leads to ...", [["Dit leidt tot meer problemen.", "这导致更多问题。", "This leads to more problems."]], "因果", "Cause-effect"),
      pattern("b2-daarentegen", "Daarentegen ...", "相反……", "In contrast ...", [["Daarentegen is de tweede optie goedkoper.", "相反，第二个选择更便宜。", "In contrast, the second option is cheaper."]], "对比", "Contrast"),
      pattern("b2-hoewel", "Hoewel ..., ...", "虽然……，……", "Although ..., ...", [["Hoewel het duur is, is het noodzakelijk.", "虽然贵，但它是必要的。", "Although it is expensive, it is necessary."]], "让步", "Concession"),
      pattern("b2-necessary", "Het is noodzakelijk dat ...", "有必要……", "It is necessary that ...", [["Het is noodzakelijk dat de gemeente snel reageert.", "市政府有必要快速回应。", "It is necessary that the municipality responds quickly."]], "正式建议", "Formal recommendation"),
      pattern("b2-position", "Mijn standpunt is dat ...", "我的立场是……", "My position is that ...", [["Mijn standpunt is dat deze maatregel nodig is.", "我的立场是这个措施是必要的。", "My position is that this measure is needed."]], "辩论", "Debate"),
      pattern("b2-cause", "De belangrijkste oorzaak is ...", "最重要的原因是……", "The main cause is ...", [["De belangrijkste oorzaak is het tekort aan woningen.", "最重要的原因是住房短缺。", "The main cause is the shortage of homes."]], "分析", "Analysis"),
      pattern("b2-solution", "Een mogelijke oplossing is ...", "一个可能的解决方案是……", "A possible solution is ...", [["Een mogelijke oplossing is betere communicatie.", "一个可能的解决方案是更好的沟通。", "A possible solution is better communication."]], "解决方案", "Solutions"),
      pattern("b2-summary", "Samenvattend ...", "总结来说……", "Summarizing ...", [["Samenvattend zijn er drie belangrijke punten.", "总结来说有三个重点。", "Summarizing, there are three important points."]], "总结", "Summary"),
    ],
    grammarPoints: [
      grammar("b2-complex-subordinate", "复杂从句", "Complex subordinate clauses", "组织多层原因、条件和让步。", "Organize layered reasons, conditions, and concessions.", [["Hoewel de kosten stijgen, blijft de maatregel nodig.", "虽然成本上升，措施仍然必要。", "Although costs rise, the measure remains necessary."]], "must"),
      grammar("b2-connectors", "高级连接词", "Advanced connectors", "用正式连接词表达对比、因果、让步。", "Use formal connectors for contrast, cause, and concession.", [["Desondanks is er een oplossing mogelijk.", "尽管如此，仍有可能解决。", "Nevertheless, a solution is possible."]], "must"),
      grammar("b2-passive", "被动结构", "Passive constructions", "用于正式报告和客观描述。", "Used in formal reports and objective descriptions.", [["De gegevens worden geanalyseerd.", "数据被分析。", "The data are analyzed."]], "must"),
      grammar("b2-nominalisation", "名词化", "Nominalisation", "把动作变成抽象名词，提升正式度。", "Turn actions into abstract nouns for formal style.", [["De invoering van de maatregel kost tijd.", "措施的引入需要时间。", "The implementation of the measure takes time."]], "should"),
      grammar("b2-indirect-speech", "间接引语", "Indirect speech", "转述观点、研究和他人说法。", "Report opinions, research, and what others said.", [["De minister zegt dat de situatie verbetert.", "部长说情况正在改善。", "The minister says the situation is improving."]], "should"),
      grammar("b2-modal-nuance", "细腻情态表达", "Nuanced modal expressions", "表达可能性、必要性和建议程度。", "Express probability, necessity, and degree of recommendation.", [["Dit zou een oplossing kunnen zijn.", "这可能是一个解决方案。", "This could be a solution."]], "must"),
      grammar("b2-formal-register", "正式语域", "Formal register", "避免口语化，使用正式结构和词汇。", "Avoid colloquial style and use formal structures and vocabulary.", [["Naar aanleiding van uw verzoek stuur ik u deze informatie.", "根据您的请求，我发送这些信息。", "In response to your request, I am sending this information."]], "must"),
      grammar("b2-argument-structure", "论证结构", "Argument structure", "立场、论点、证据、反方、结论。", "Position, arguments, evidence, counterargument, conclusion.", [["Mijn standpunt is dat ... Ten eerste ... Daarentegen ... Samenvattend ...", "我的立场是……第一……相反……总结……", "My position is ... Firstly ... In contrast ... Summarizing ..."]], "must"),
    ],
    pronunciationPoints: [{ id: "b2-presentation-speech", title: lt("正式表达的语调和停顿", "Intonation and pauses in formal speech"), sounds: ["intonation", "pausing", "emphasis"], exampleWords: ["samenvattend", "daarentegen", "noodzakelijk"], notesForChineseLearners: "B2 口语要靠停顿组织结构，不是只追求速度。" }],
    scenarioTasks: [
      scenario("b2-opinion", "结构化表达观点", "Give a structured opinion", "用立场、理由、例子和结论组织表达。", "Organize with position, reasons, examples, and conclusion.", ["Mijn standpunt is dat ...", "Samenvattend ..."], ["speaking", "writing"]),
      scenario("b2-summary", "总结文本", "Summarize a text", "抓主旨、关键论点和结论。", "Capture main idea, key arguments, and conclusion.", ["De tekst gaat over ..."], ["reading", "writing", "speaking"]),
      scenario("b2-formal-email", "写正式邮件", "Write a formal email", "用正式语域说明目的、背景和请求。", "Use formal register for purpose, context, and request.", ["Naar aanleiding van ..."], ["writing"]),
      scenario("b2-social-issue", "讨论社会议题", "Discuss a social issue", "比较观点并提出解决方案。", "Compare views and propose a solution.", ["Een mogelijke oplossing is ..."], ["speaking", "listening"]),
      scenario("b2-pros-cons", "呈现利弊", "Present advantages and disadvantages", "平衡说明优点、缺点和条件。", "Present advantages, disadvantages, and conditions.", ["Enerzijds ... anderzijds ..."], ["speaking", "writing"]),
      scenario("b2-data", "描述数据和趋势", "Describe data or trends", "说明上升、下降和原因。", "Explain increases, decreases, and causes.", ["Er is sprake van ..."], ["speaking", "writing", "reading"]),
      scenario("b2-discussion", "参与正式讨论", "Participate in a formal discussion", "回应、补充、反驳并总结。", "Respond, add, counter, and summarize.", ["Daar ben ik het deels mee eens."], ["speaking", "listening"]),
    ],
    speakingOutputTasks: [lt("做 2-3 分钟结构化观点表达。", "Give a 2-3 minute structured opinion."), lt("根据图表或短文做口头总结。", "Give an oral summary based on a chart or short text.")],
    writingOutputTasks: [lt("写正式邮件、摘要、观点文或短报告。", "Write formal emails, summaries, opinion texts, or short reports.")],
    readingTaskTypes: [lt("读报告、观点文章、政策说明和数据文本。", "Read reports, opinion articles, policy explanations, and data texts.")],
    listeningTaskTypes: [lt("听懂演讲、访谈、讨论和专业说明。", "Understand presentations, interviews, discussions, and professional explanations.")],
    examRelevance: lt("B2 对齐 Staatsexamen Nt2 Programma II 风格技能：阅读、听力、口语、写作。不复制官方考试内容。", "B2 aligns with Staatsexamen Nt2 Programma II-style skills: reading, listening, speaking, writing. It does not copy official exam content."),
    notesForChineseLearners: lt("重点是正式语域、长句结构、论证框架和抽象词汇。", "Focus on formal register, longer sentence structure, argument frames, and abstract vocabulary."),
  },
];

export const dutchSyllabusNote = lt(
  "这是 NedPop 为课程设计整理的实用学习大纲，不是官方考试教材。",
  "This is a practical learning syllabus prepared by NedPop for course design. It is not official exam material.",
);

export const getDutchSyllabusLevel = (level: Level) => dutchSyllabus.find((item) => item.level === level);

export const getDutchSyllabusWordCount = (level: Level) =>
  new Set(getDutchSyllabusLevel(level)?.vocabularyThemes.flatMap((item) => item.coreWords.map((word) => word.dutch)) ?? []).size;
