import type { WordItem } from "@/types/vocabulary";
import type { MemoryRelationType } from "@/types/memoryRelation";

export const relationPriority: MemoryRelationType[] = [
  "compound-part",
  "compound-parent",
  "phrase-collocation",
  "verb-form",
  "verb-noun-pair",
  "root-family",
  "same-family",
  "category-member",
  "opposite",
  "confusion-pair",
  "scenario-neighbor",
  "article-family",
  "plural-family",
  "prefix-suffix-family",
  "synonym",
];

export const relationLabels: Record<MemoryRelationType, { zh: string; en: string; groupZh: string; groupEn: string }> = {
  "compound-part": { zh: "词里小块", en: "Word Piece", groupZh: "拼词线索", groupEn: "Word Pieces" },
  "compound-parent": { zh: "同组拼词", en: "Compound Set", groupZh: "拼词线索", groupEn: "Word Pieces" },
  "same-family": { zh: "同家族", en: "Same Family", groupZh: "同词根 / 同家族", groupEn: "Word Family" },
  "root-family": { zh: "同词根", en: "Root Family", groupZh: "同词根 / 同家族", groupEn: "Word Family" },
  "prefix-suffix-family": { zh: "词尾线索", en: "Suffix Clue", groupZh: "de/het 线索", groupEn: "Article Clues" },
  synonym: { zh: "同义词", en: "Synonym", groupZh: "同义 / 反义", groupEn: "Synonyms / Opposites" },
  opposite: { zh: "反义词", en: "Opposite", groupZh: "同义 / 反义", groupEn: "Synonyms / Opposites" },
  "phrase-collocation": { zh: "常用搭配", en: "Useful Chunk", groupZh: "常用搭配", groupEn: "Useful Chunks" },
  "verb-form": { zh: "动词形式", en: "Verb Form", groupZh: "动词形式", groupEn: "Verb Forms" },
  "verb-noun-pair": { zh: "动词/名词配对", en: "Verb/Noun Pair", groupZh: "同词根 / 同家族", groupEn: "Word Family" },
  "category-member": { zh: "同类别", en: "Category", groupZh: "同类别", groupEn: "Same Category" },
  "scenario-neighbor": { zh: "同场景", en: "Same Scenario", groupZh: "同场景", groupEn: "Same Scenario" },
  "confusion-pair": { zh: "易混词", en: "Confusion Pair", groupZh: "易混词", groupEn: "Confusion Pairs" },
  "english-bridge": { zh: "记忆提示", en: "Memory Hint", groupZh: "记忆提示", groupEn: "Memory Hints" },
  "article-family": { zh: "de/het 线索", en: "Article Clue", groupZh: "de/het 线索", groupEn: "Article Clues" },
  "plural-family": { zh: "复数规则", en: "Plural Rule", groupZh: "复数规则", groupEn: "Plural Rules" },
};

export const knownCompoundParts: Record<string, Array<{ part: string; zh: string; en: string }>> = {
  goedemorgen: [
    { part: "goed", zh: "好", en: "good" },
    { part: "morgen", zh: "早上/明天", en: "morning/tomorrow" },
  ],
  goedemiddag: [
    { part: "goed", zh: "好", en: "good" },
    { part: "middag", zh: "下午", en: "afternoon" },
  ],
  goedenavond: [
    { part: "goed", zh: "好", en: "good" },
    { part: "avond", zh: "晚上", en: "evening" },
  ],
  ziekenhuis: [
    { part: "ziek", zh: "生病", en: "sick" },
    { part: "huis", zh: "房子", en: "house" },
  ],
  huisarts: [
    { part: "huis", zh: "家/家庭", en: "home" },
    { part: "arts", zh: "医生", en: "doctor" },
  ],
  tandarts: [
    { part: "tand", zh: "牙", en: "tooth" },
    { part: "arts", zh: "医生", en: "doctor" },
  ],
  zorgverzekering: [
    { part: "zorg", zh: "照护/医疗", en: "care" },
    { part: "verzekering", zh: "保险", en: "insurance" },
  ],
  treinkaart: [
    { part: "trein", zh: "火车", en: "train" },
    { part: "kaart", zh: "票/卡", en: "card/ticket" },
  ],
  woordenboek: [
    { part: "woord", zh: "词", en: "word" },
    { part: "boek", zh: "书", en: "book" },
  ],
  aardappel: [
    { part: "aard", zh: "土/地", en: "earth" },
    { part: "appel", zh: "苹果", en: "apple" },
  ],
  sinaasappel: [
    { part: "sinaas", zh: "橙子相关的旧词根", en: "orange-related stem" },
    { part: "appel", zh: "苹果", en: "apple" },
  ],
  appelsap: [
    { part: "appel", zh: "苹果", en: "apple" },
    { part: "sap", zh: "汁", en: "juice" },
  ],
  waterrekening: [
    { part: "water", zh: "水", en: "water" },
    { part: "rekening", zh: "账单", en: "bill" },
  ],
  ziekmelding: [
    { part: "ziek", zh: "生病", en: "sick" },
    { part: "melding", zh: "通知", en: "report/notification" },
  ],
};

export const rootFamilies: string[][] = [
  ["morgen", "goedemorgen"],
  ["middag", "goedemiddag"],
  ["avond", "goedenavond"],
  ["werk", "werken"],
  ["vraag", "vragen"],
  ["antwoord", "antwoorden"],
  ["hulp", "helpen"],
  ["woon", "wonen", "woning"],
  ["leer", "leren", "leraar", "leerling", "Nederlandse les"],
  ["schrijf", "schrijven"],
  ["betaal", "betalen", "betaling"],
  ["meld", "melden", "melding", "ziekmelding"],
  ["uitleg", "uitleggen"],
  ["verander", "veranderen", "verandering"],
  ["inschrijf", "inschrijven", "inschrijving"],
  ["herhaal", "herhalen", "herhaling", "herhaalrecept"],
  ["appel", "aardappel", "sinaasappel", "appelsap"],
];

export const oppositePairs: Array<[string, string, string, string]> = [
  ["ja", "nee", "Ja, dat klopt.", "Nee, dat klopt niet."],
  ["goed", "slecht", "Het gaat goed.", "Het gaat slecht."],
  ["open", "dicht", "De winkel is open.", "De winkel is dicht."],
  ["open", "sluit", "Open de app.", "Sluit de app."],
  ["goedkoop", "duur", "Dat is goedkoop.", "Dat is duur."],
  ["vroeg", "laat", "Ik ben vroeg.", "Ik ben laat."],
  ["groot", "klein", "Het huis is groot.", "De kamer is klein."],
  ["warm", "koud", "Het is warm.", "Het is koud."],
  ["langzaam", "snel", "Kunt u langzaam spreken?", "De trein is snel."],
  ["makkelijk", "moeilijk", "Deze oefening is makkelijk.", "Deze oefening is moeilijk."],
  ["binnen", "buiten", "Ik ben binnen.", "Ik ben buiten."],
  ["links", "rechts", "Ga links.", "Ga rechts."],
  ["voor", "achter", "De winkel is voor het station.", "De fiets staat achter het huis."],
  ["boven", "beneden", "De slaapkamer is boven.", "De keuken is beneden."],
];

export const synonymPairs: Array<[string, string, string]> = [
  ["goed", "prima", "prima is ook goed, maar iets informeler."],
  ["woning", "huis", "woning is formeler; huis is algemener."],
  ["makkelijk", "eenvoudig", "eenvoudig is neutraler; makkelijk is dagelijks."],
  ["bedankt", "dank je", "Beide betekenen bedankt."],
];

export const collocationRules: Record<string, Array<{ target: string; phrase: string; zh: string; en: string; sentence?: string; sentenceZh?: string; sentenceEn?: string }>> = {
  afspraak: [
    { target: "maken", phrase: "een afspraak maken", zh: "预约", en: "make an appointment", sentence: "Ik wil graag een afspraak maken.", sentenceZh: "我想预约。", sentenceEn: "I would like to make an appointment." },
    { target: "verzetten", phrase: "een afspraak verzetten", zh: "改约", en: "reschedule an appointment", sentence: "Ik wil mijn afspraak verzetten.", sentenceZh: "我想改约。", sentenceEn: "I want to reschedule my appointment." },
    { target: "afzeggen", phrase: "een afspraak afzeggen", zh: "取消预约", en: "cancel an appointment", sentence: "Ik moet mijn afspraak afzeggen.", sentenceZh: "我必须取消预约。", sentenceEn: "I have to cancel my appointment." },
  ],
  rekening: [
    { target: "betalen", phrase: "de rekening betalen", zh: "付账单", en: "pay the bill", sentence: "Ik moet de rekening betalen.", sentenceZh: "我必须付账单。", sentenceEn: "I have to pay the bill." },
    { target: "krijgen", phrase: "een rekening krijgen", zh: "收到一张账单", en: "receive a bill", sentence: "Ik heb een rekening gekregen.", sentenceZh: "我收到了一张账单。", sentenceEn: "I received a bill." },
    { target: "uitleggen", phrase: "de rekening uitleggen", zh: "解释账单", en: "explain the bill", sentence: "Kunt u de rekening uitleggen?", sentenceZh: "您能解释一下这张账单吗？", sentenceEn: "Can you explain the bill?" },
  ],
  formulier: [
    { target: "invullen", phrase: "het formulier invullen", zh: "填写表格", en: "fill in the form", sentence: "Ik moet het formulier invullen.", sentenceZh: "我必须填写表格。", sentenceEn: "I have to fill in the form." },
  ],
  adres: [
    { target: "invullen", phrase: "het adres invullen", zh: "填写地址", en: "fill in the address", sentence: "Ik vul mijn adres in.", sentenceZh: "我填写我的地址。", sentenceEn: "I fill in my address." },
    { target: "veranderen", phrase: "mijn adres veranderen", zh: "更改我的地址", en: "change my address", sentence: "Ik wil mijn adres veranderen.", sentenceZh: "我想更改我的地址。", sentenceEn: "I want to change my address." },
  ],
  hulp: [
    { target: "nodig", phrase: "hulp nodig hebben", zh: "需要帮助", en: "need help", sentence: "Ik heb hulp nodig.", sentenceZh: "我需要帮助。", sentenceEn: "I need help." },
    { target: "vragen", phrase: "om hulp vragen", zh: "求助", en: "ask for help", sentence: "Ik vraag om hulp.", sentenceZh: "我请求帮助。", sentenceEn: "I ask for help." },
  ],
  taal: [
    { target: "spreken", phrase: "een taal spreken", zh: "说一门语言", en: "speak a language", sentence: "Ik spreek Nederlands.", sentenceZh: "我说荷兰语。", sentenceEn: "I speak Dutch." },
    { target: "leren", phrase: "een taal leren", zh: "学习一门语言", en: "learn a language", sentence: "Ik leer Nederlands.", sentenceZh: "我学荷兰语。", sentenceEn: "I learn Dutch." },
  ],
  trein: [
    { target: "vertraging", phrase: "vertraging hebben", zh: "有延误", en: "be delayed", sentence: "De trein heeft vertraging.", sentenceZh: "火车晚点了。", sentenceEn: "The train is delayed." },
  ],
  herhaal: [
    { target: "herhaling", phrase: "iets herhalen", zh: "重复某事", en: "repeat something", sentence: "Kunt u dat herhalen?", sentenceZh: "您能重复一下吗？", sentenceEn: "Can you repeat that?" },
    { target: "langzaam", phrase: "langzaam herhalen", zh: "慢一点重复", en: "repeat slowly", sentence: "Kunt u dat langzaam herhalen?", sentenceZh: "您能慢一点重复吗？", sentenceEn: "Can you repeat that slowly?" },
  ],
  herhalen: [
    { target: "herhaling", phrase: "iets herhalen", zh: "重复某事", en: "repeat something", sentence: "Kunt u dat herhalen?", sentenceZh: "您能重复一下吗？", sentenceEn: "Can you repeat that?" },
    { target: "langzaam", phrase: "langzaam herhalen", zh: "慢一点重复", en: "repeat slowly", sentence: "Kunt u dat langzaam herhalen?", sentenceZh: "您能慢一点重复吗？", sentenceEn: "Can you repeat that slowly?" },
  ],
  langzaam: [
    { target: "herhaal", phrase: "langzaam herhalen", zh: "慢一点重复", en: "repeat slowly", sentence: "Kunt u dat langzaam herhalen?", sentenceZh: "您能慢一点重复吗？", sentenceEn: "Can you repeat that slowly?" },
    { target: "spreken", phrase: "langzaam spreken", zh: "慢一点说", en: "speak slowly", sentence: "Kunt u langzaam spreken?", sentenceZh: "您能慢一点说吗？", sentenceEn: "Can you speak slowly?" },
  ],
  appel: [
    { target: "aardappel", phrase: "aardappel = aard + appel", zh: "土豆：土地里的 apple", en: "potato: earth apple", sentence: "Ik koop aardappels.", sentenceZh: "我买土豆。", sentenceEn: "I buy potatoes." },
    { target: "sinaasappel", phrase: "sinaasappel", zh: "橙子，里面也有 appel", en: "orange, also contains appel", sentence: "Ik koop sinaasappels.", sentenceZh: "我买橙子。", sentenceEn: "I buy oranges." },
    { target: "appelsap", phrase: "appel + sap", zh: "苹果汁", en: "apple juice", sentence: "Ik drink appelsap.", sentenceZh: "我喝苹果汁。", sentenceEn: "I drink apple juice." },
  ],
};

export const categoryGroups: Array<{ category: string; members: string[]; reasonZh: string; reasonEn: string }> = [
  { category: "dagdeel", members: ["morgen", "middag", "avond", "goedemorgen", "goedemiddag", "goedenavond"], reasonZh: "时间段和对应问候一起记：morgen → goedemorgen，middag → goedemiddag，avond → goedenavond。", reasonEn: "Connect day parts with greetings: morgen → goedemorgen, middag → goedemiddag, avond → goedenavond." },
  { category: "begroeting", members: ["hallo", "dag", "goedemorgen", "goedemiddag", "goedenavond", "tot ziens"], reasonZh: "问候和告别按一天的对话顺序记，不是易混词。", reasonEn: "Greeting and goodbye chunks belong to one daily conversation flow; they are not confusion pairs." },
  { category: "taal", members: ["Nederlands", "Engels", "Chinees"], reasonZh: "语言名按 taal 这个类别一起记。", reasonEn: "Language names belong under taal." },
  { category: "kleur", members: ["rood", "blauw", "groen", "geel", "zwart", "wit"], reasonZh: "颜色词按 kleur 一组记。", reasonEn: "Color words belong under kleur." },
  { category: "familie", members: ["moeder", "vader", "broer", "zus", "ouders", "kind"], reasonZh: "家庭成员按 familie 一组记。", reasonEn: "Family members belong under familie." },
  { category: "vervoer", members: ["trein", "bus", "fiets", "auto", "tram", "metro"], reasonZh: "交通工具按 vervoer 一组记。", reasonEn: "Transport words belong under vervoer." },
  { category: "eten", members: ["brood", "kaas", "melk", "rijst", "appel", "aardappel"], reasonZh: "食物词按 eten 一组记。", reasonEn: "Food words belong under eten." },
  { category: "lichaam", members: ["hoofd", "buik", "arm", "been", "hand", "voet", "rug", "keel"], reasonZh: "身体部位按 lichaam 一组记。", reasonEn: "Body parts belong under lichaam." },
  { category: "tijd", members: ["uur", "minuut", "vandaag", "morgen", "gisteren", "middag", "avond", "weekend", "vroeg", "laat"], reasonZh: "时间词按日程顺序一起记：今天、明天、早晚、几点。", reasonEn: "Time words belong together for schedules: today, tomorrow, day parts, and clock time." },
  { category: "vraagwoord", members: ["wie", "wat", "waar", "wanneer", "hoe", "hoeveel", "waarom", "welke"], reasonZh: "疑问词按问答功能一起记。", reasonEn: "Question words belong together by question function." },
  { category: "richting", members: ["links", "rechts", "rechtdoor", "naast", "tegenover", "achter", "voor", "boven", "beneden", "dichtbij", "ver"], reasonZh: "方向和位置词按地图场景一起记。", reasonEn: "Direction and location words belong together in map situations." },
  { category: "boodschappen", members: ["supermarkt", "winkel", "mandje", "kassa", "bon", "prijs", "korting", "fles", "pak", "doos", "gram", "kilo"], reasonZh: "超市购物词按拿东西、问价格、付款的流程记。", reasonEn: "Supermarket words follow the flow: pick items, ask price, pay." },
  { category: "dag", members: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag"], reasonZh: "星期词按 dag 一组记。", reasonEn: "Weekdays belong under dag." },
  { category: "maand", members: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"], reasonZh: "月份词按 maand 一组记。", reasonEn: "Months belong under maand." },
];

export const semanticTagGroups: Record<string, { relation: "category-member" | "scenario-neighbor"; reasonZh: string; reasonEn: string; max: number }> = {
  numbers: { relation: "category-member", reasonZh: "数字词按数列顺序记，适合放在同一个数字泡泡里。", reasonEn: "Number words are learned as a sequence.", max: 5 },
  time: { relation: "category-member", reasonZh: "时间词按日程表达一起记。", reasonEn: "Time words belong together in schedule expressions.", max: 4 },
  family: { relation: "category-member", reasonZh: "家庭成员词按人物关系一起记。", reasonEn: "Family words connect through family roles.", max: 4 },
  transport: { relation: "scenario-neighbor", reasonZh: "交通词按出行流程一起记：站点、车、票、延误。", reasonEn: "Transport words connect through travel flow: station, vehicle, ticket, delay.", max: 4 },
  supermarket: { relation: "scenario-neighbor", reasonZh: "购物词按超市场景一起记：商品、价格、付款。", reasonEn: "Shopping words connect through supermarket use: items, price, payment.", max: 4 },
  health: { relation: "scenario-neighbor", reasonZh: "健康词按身体不舒服和求医场景一起记。", reasonEn: "Health words connect through symptoms and care scenarios.", max: 4 },
  housing: { relation: "scenario-neighbor", reasonZh: "住房词按住处、租房、维修场景一起记。", reasonEn: "Housing words connect through home, renting, and repair situations.", max: 4 },
  appointment: { relation: "scenario-neighbor", reasonZh: "预约词按约时间、改约、取消的流程一起记。", reasonEn: "Appointment words connect through making, changing, and cancelling appointments.", max: 4 },
  gemeente: { relation: "scenario-neighbor", reasonZh: "市政厅办事词按预约、表格、证件、地址一起记。", reasonEn: "Municipality words connect through appointments, forms, documents, and address changes.", max: 4 },
  bill: { relation: "scenario-neighbor", reasonZh: "账单付款词按收到账单、看金额、付款一起记。", reasonEn: "Bill words connect through receiving, checking, and paying bills.", max: 4 },
  insurance: { relation: "scenario-neighbor", reasonZh: "保险词按医保、账单、报销和文件一起记。", reasonEn: "Insurance words connect through health insurance, bills, claims, and documents.", max: 4 },
  "phone-call": { relation: "scenario-neighbor", reasonZh: "电话词按开场、等待、重复、确认一起记。", reasonEn: "Phone words connect through opening, waiting, repeating, and confirming.", max: 4 },
  email: { relation: "scenario-neighbor", reasonZh: "邮件词按主题、正文、附件、回复一起记。", reasonEn: "Email words connect through subject, message, attachment, and reply.", max: 4 },
  form: { relation: "scenario-neighbor", reasonZh: "表格词按填写个人信息和提交文件一起记。", reasonEn: "Form words connect through filling personal information and submitting documents.", max: 4 },
};

export const scenarioNeighbors: Record<string, Array<{ target: string; phrase?: string; zh: string; en: string }>> = {
  goedemorgen: [
    { target: "morgen", phrase: "Goedemorgen.", zh: "goedemorgen 是早上问候；morgen 在这里是“早上”，也可表示“明天”。", en: "goedemorgen is the morning greeting; morgen means morning here and can also mean tomorrow." },
    { target: "goedemiddag", phrase: "Goedemorgen. Goedemiddag.", zh: "按一天时间顺序记：早上 goedemorgen，下午 goedemiddag。", en: "Learn greetings by time of day: morning goedemorgen, afternoon goedemiddag." },
    { target: "goedenavond", phrase: "Goedemorgen. Goedenavond.", zh: "按一天时间顺序记：早上 goedemorgen，晚上 goedenavond。", en: "Learn greetings by time of day: morning goedemorgen, evening goedenavond." },
  ],
  goedemiddag: [
    { target: "middag", phrase: "Goedemiddag.", zh: "goedemiddag 是下午问候；middag 是“下午”。", en: "goedemiddag is the afternoon greeting; middag means afternoon." },
    { target: "goedemorgen", phrase: "Goedemorgen. Goedemiddag.", zh: "按一天时间顺序记：早上 goedemorgen，下午 goedemiddag。", en: "Learn greetings by time of day: morning goedemorgen, afternoon goedemiddag." },
    { target: "goedenavond", phrase: "Goedemiddag. Goedenavond.", zh: "按一天时间顺序记：下午 goedemiddag，晚上 goedenavond。", en: "Learn greetings by time of day: afternoon goedemiddag, evening goedenavond." },
  ],
  goedenavond: [
    { target: "avond", phrase: "Goedenavond.", zh: "goedenavond 是晚上问候；avond 是“晚上”。", en: "goedenavond is the evening greeting; avond means evening." },
    { target: "goedemorgen", phrase: "Goedemorgen. Goedenavond.", zh: "按一天时间顺序记：早上 goedemorgen，晚上 goedenavond。", en: "Learn greetings by time of day: morning goedemorgen, evening goedenavond." },
    { target: "goedemiddag", phrase: "Goedemiddag. Goedenavond.", zh: "按一天时间顺序记：下午 goedemiddag，晚上 goedenavond。", en: "Learn greetings by time of day: afternoon goedemiddag, evening goedenavond." },
  ],
  huisarts: [
    { target: "afspraak", phrase: "een afspraak met de huisarts", zh: "huisarts 常和 afspraak 一起出现：预约家庭医生。", en: "huisarts often appears with afspraak: an appointment with the GP." },
    { target: "ziek", zh: "生病时联系 huisarts。", en: "When you are sick, you contact the huisarts." },
    { target: "pijn", zh: "看 huisarts 时常说明哪里 pijn。", en: "At the GP, you often explain where you have pain." },
  ],
  gemeente: [
    { target: "formulier", phrase: "een formulier bij de gemeente", zh: "去 gemeente 办事常要填 formulier。", en: "At the municipality you often need a form." },
    { target: "adres", phrase: "mijn adres veranderen", zh: "改地址是 gemeente 常见场景。", en: "Changing address is a common gemeente scenario." },
    { target: "afspraak", phrase: "een afspraak bij de gemeente", zh: "去 gemeente 常需要预约。", en: "You often need an appointment at the municipality." },
  ],
  woning: [
    { target: "huur", zh: "woning 和 huur 都属于租房场景。", en: "woning and huur belong to renting/housing." },
    { target: "reparatie", zh: "住房问题常涉及 reparatie。", en: "Housing problems often involve repair." },
    { target: "verhuurder", zh: "租房时会联系 verhuurder。", en: "When renting, you contact the landlord." },
  ],
  trein: [
    { target: "station", zh: "坐 trein 通常从 station 出发。", en: "You usually take a train at the station." },
    { target: "vertraging", phrase: "De trein heeft vertraging.", zh: "火车场景高频搭配：trein + vertraging。", en: "A common train scenario: train delay." },
    { target: "kaartje", zh: "坐 trein 常需要 kaartje。", en: "For the train, you often need a ticket." },
  ],
  verzekering: [
    { target: "zorgverzekering", zh: "zorgverzekering 是保险里的医疗保险。", en: "zorgverzekering is health insurance." },
    { target: "rekening", zh: "保险和账单在办事场景里常一起出现。", en: "Insurance and bills often appear together in admin tasks." },
  ],
};

export const confusionPairs: Array<{ a: string; b: string; reasonZh: string; reasonEn: string; sentenceA: string; sentenceB: string }> = [
  { a: "hulp", b: "helpen", reasonZh: "hulp 是名词，helpen 是动词。", reasonEn: "hulp is a noun; helpen is a verb.", sentenceA: "Ik heb hulp nodig.", sentenceB: "Kunt u mij helpen?" },
  { a: "zijn", b: "hebben", reasonZh: "zijn 是“是”，hebben 是“有”。", reasonEn: "zijn means to be; hebben means to have.", sentenceA: "Ik ben student.", sentenceB: "Ik heb een fiets." },
  { a: "u", b: "jij", reasonZh: "u 更礼貌，jij 更熟悉。", reasonEn: "u is polite; jij is familiar.", sentenceA: "Spreekt u Nederlands?", sentenceB: "Spreek jij Nederlands?" },
  { a: "niet", b: "geen", reasonZh: "geen 放在无冠词名词前；niet 否定其他部分。", reasonEn: "geen negates nouns without an article; niet negates other parts.", sentenceA: "Ik heb geen tijd.", sentenceB: "Ik kom niet." },
  { a: "dag", b: "maandag", reasonZh: "dag 可以是你好/再见/天；maandag 是星期一。", reasonEn: "dag can mean hello/goodbye/day; maandag is Monday.", sentenceA: "Dag!", sentenceB: "Vandaag is maandag." },
  { a: "zij", b: "ze", reasonZh: "zij/ze 都可表示她或他们/她们，要看句子里的动词。", reasonEn: "zij/ze can mean she or they; check the verb.", sentenceA: "Zij is mijn moeder.", sentenceB: "Zij zijn mijn ouders." },
];

export function byDutch(words: WordItem[]) {
  return new Map(words.map((word) => [word.dutch.toLowerCase(), word]));
}

export function visibleTargetExists(target: string, wordMap: Map<string, WordItem>) {
  return wordMap.has(target.toLowerCase()) || /\s/.test(target);
}
