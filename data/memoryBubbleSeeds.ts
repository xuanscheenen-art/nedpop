import type { MemoryBubbleRelationType } from "@/lib/relationEngine";

export type MemoryBubbleSeedLink = {
  source: string;
  target: string;
  relationType: MemoryBubbleRelationType;
  reasonZh: string;
  reasonEn: string;
  strength?: "strong" | "medium" | "weak";
  confidence?: "high" | "medium" | "low";
};

export type MemoryBubbleScenarioSeed = {
  id: string;
  labelZh: string;
  labelEn: string;
  members: string[];
  reasonZh: string;
  reasonEn: string;
  maxLearnerLinks?: number;
  links?: MemoryBubbleSeedLink[];
};

export const memoryBubbleScenarioSeeds: MemoryBubbleScenarioSeed[] = [
  {
    id: "shopping",
    labelZh: "购物",
    labelEn: "shopping",
    members: ["winkel", "supermarkt", "boodschappen", "kassa", "kopen", "betalen", "geld", "prijs", "tas", "mandje", "bon"],
    reasonZh: "这些词都属于购物场景，能帮助把地点、动作和付款连起来。",
    reasonEn: "These words belong to shopping and connect place, action, and payment.",
    links: [
      { source: "winkel", target: "boodschappen", relationType: "scenario-word", reasonZh: "winkel 和 boodschappen 都属于购物场景。", reasonEn: "winkel and boodschappen belong to shopping." },
      { source: "winkel", target: "supermarkt", relationType: "scenario-word", reasonZh: "supermarkt 是常见购物地点，和 winkel 同场景。", reasonEn: "supermarkt is a common shopping place like winkel." },
      { source: "winkel", target: "kassa", relationType: "scenario-word", reasonZh: "kassa 是商店里的收银台。", reasonEn: "kassa is the checkout in a shop." },
      { source: "winkel", target: "kopen", relationType: "action-object", reasonZh: "在 winkel 里常见动作是 kopen。", reasonEn: "A common action in a winkel is kopen." },
      { source: "winkel", target: "betalen", relationType: "action-object", reasonZh: "买完东西需要 betalen。", reasonEn: "After buying something, you betalen." },
      { source: "winkel", target: "geld", relationType: "scenario-word", reasonZh: "购物付款会用到 geld。", reasonEn: "Shopping and paying involve geld." },
      { source: "winkel", target: "prijs", relationType: "scenario-word", reasonZh: "购物时会看 prijs。", reasonEn: "When shopping, you check the prijs." },
      { source: "boodschappen", target: "winkel", relationType: "scenario-word", reasonZh: "boodschappen 通常在 winkel 或 supermarkt 里买。", reasonEn: "boodschappen are usually bought in a winkel or supermarkt." },
      { source: "boodschappen", target: "supermarkt", relationType: "scenario-word", reasonZh: "supermarkt 是买 boodschappen 的常见地点。", reasonEn: "A supermarkt is a common place for boodschappen." },
      { source: "boodschappen", target: "kopen", relationType: "action-object", reasonZh: "boodschappen 和 kopen 是购物动作链。", reasonEn: "boodschappen and kopen form a shopping action link." },
      { source: "boodschappen", target: "betalen", relationType: "action-object", reasonZh: "买 boodschappen 后要 betalen。", reasonEn: "After buying boodschappen, you betalen." },
      { source: "boodschappen", target: "tas", relationType: "scenario-word", reasonZh: "买东西常会用 tas 装。", reasonEn: "You often carry shopping in a tas." },
      { source: "boodschappen", target: "geld", relationType: "scenario-word", reasonZh: "boodschappen 和 geld 都在购物付款场景里。", reasonEn: "boodschappen and geld meet in shopping and payment." },
    ],
  },
  {
    id: "food-drink",
    labelZh: "吃喝",
    labelEn: "food and drink",
    members: ["eten", "drinken", "brood", "rijst", "appel", "water", "koffie", "thee", "honger", "dorst", "drank"],
    reasonZh: "这些词组成基础吃喝场景：动作、对象和身体状态。",
    reasonEn: "These words form a basic food and drink scene: actions, objects, and states.",
    links: [
      { source: "drinken", target: "eten", relationType: "scenario-word", reasonZh: "eten 和 drinken 是吃喝动作对。", reasonEn: "eten and drinken are the basic eating/drinking pair." },
      { source: "drinken", target: "water", relationType: "action-object", reasonZh: "water 是 drinken 最常见的对象。", reasonEn: "water is a common object of drinken." },
      { source: "drinken", target: "koffie", relationType: "action-object", reasonZh: "koffie 常和 drinken 连在一起。", reasonEn: "koffie commonly goes with drinken." },
      { source: "drinken", target: "thee", relationType: "action-object", reasonZh: "thee 常和 drinken 连在一起。", reasonEn: "thee commonly goes with drinken." },
      { source: "drinken", target: "dorst", relationType: "state-action", reasonZh: "dorst 是口渴状态，drinken 是对应动作。", reasonEn: "dorst is the state; drinken is the action." },
      { source: "eten", target: "drinken", relationType: "scenario-word", reasonZh: "eten 和 drinken 是吃喝动作对。", reasonEn: "eten and drinken are the basic eating/drinking pair." },
      { source: "eten", target: "brood", relationType: "action-object", reasonZh: "brood 是 eten 的常见对象。", reasonEn: "brood is a common object of eten." },
      { source: "eten", target: "rijst", relationType: "action-object", reasonZh: "rijst 是 eten 的常见对象。", reasonEn: "rijst is a common object of eten." },
      { source: "eten", target: "appel", relationType: "action-object", reasonZh: "appel 是 eten 的常见对象。", reasonEn: "appel is a common object of eten." },
      { source: "eten", target: "honger", relationType: "state-action", reasonZh: "honger 是饿的状态，eten 是对应动作。", reasonEn: "honger is the state; eten is the action." },
    ],
  },
  {
    id: "time",
    labelZh: "时间",
    labelEn: "time",
    members: ["maand", "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december", "dag", "week", "jaar"],
    reasonZh: "这些是时间单位或月份，适合按时间类别一起记。",
    reasonEn: "These are time units or months and belong together.",
    links: [
      { source: "maand", target: "januari", relationType: "category-member", reasonZh: "januari 是一年中的 maand。", reasonEn: "januari is a month of the year." },
      { source: "maand", target: "februari", relationType: "category-member", reasonZh: "februari 是一年中的 maand。", reasonEn: "februari is a month of the year." },
      { source: "maand", target: "maart", relationType: "category-member", reasonZh: "maart 是一年中的 maand。", reasonEn: "maart is a month of the year." },
      { source: "maand", target: "april", relationType: "category-member", reasonZh: "april 是一年中的 maand。", reasonEn: "april is a month of the year." },
      { source: "maand", target: "mei", relationType: "category-member", reasonZh: "mei 是一年中的 maand。", reasonEn: "mei is a month of the year." },
      { source: "maand", target: "dag", relationType: "category-member", reasonZh: "dag 和 maand 都是时间单位。", reasonEn: "dag and maand are both time units." },
      { source: "maand", target: "week", relationType: "category-member", reasonZh: "week 和 maand 都是时间单位。", reasonEn: "week and maand are both time units." },
      { source: "maand", target: "jaar", relationType: "category-member", reasonZh: "maand 是 jaar 里面的时间单位。", reasonEn: "maand is a time unit inside a jaar." },
    ],
  },
  {
    id: "language",
    labelZh: "语言",
    labelEn: "language",
    members: ["taal", "Nederlands", "Engels", "Chinees", "spreken", "leren", "begrijpen"],
    reasonZh: "这些词围绕语言和语言动作。",
    reasonEn: "These words connect language names with language actions.",
    links: [
      { source: "taal", target: "Nederlands", relationType: "category-member", reasonZh: "Nederlands 是一门 taal。", reasonEn: "Nederlands is a taal." },
      { source: "taal", target: "Engels", relationType: "category-member", reasonZh: "Engels 是一门 taal。", reasonEn: "Engels is a taal." },
      { source: "taal", target: "Chinees", relationType: "category-member", reasonZh: "Chinees 是一门 taal。", reasonEn: "Chinees is a taal." },
      { source: "taal", target: "spreken", relationType: "action-object", reasonZh: "taal 常和 spreken 这个动作一起用。", reasonEn: "taal naturally connects with the action spreken." },
      { source: "taal", target: "leren", relationType: "action-object", reasonZh: "taal 常和 leren 这个动作一起用。", reasonEn: "taal naturally connects with the action leren." },
      { source: "taal", target: "begrijpen", relationType: "action-object", reasonZh: "taal 常和 begrijpen 这个动作一起用。", reasonEn: "taal naturally connects with the action begrijpen." },
    ],
  },
  {
    id: "help",
    labelZh: "求助",
    labelEn: "asking for help",
    members: ["hulp", "helpen", "nodig", "vragen", "vraag", "medewerker", "formulier", "probleem", "uitleg", "advies"],
    reasonZh: "这些词用于求助、提问和解决问题。",
    reasonEn: "These words belong to asking for help and solving a problem.",
    links: [
      { source: "hulp", target: "helpen", relationType: "verb-noun-pair", reasonZh: "hulp 是名词“帮助”，helpen 是动词“帮助”。", reasonEn: "hulp is the noun help; helpen is the verb to help." },
      { source: "hulp", target: "nodig", relationType: "state-action", reasonZh: "需要帮助时常会想到 nodig。", reasonEn: "When you need help, nodig is the useful state word." },
      { source: "hulp", target: "vragen", relationType: "action-object", reasonZh: "hulp 常和 vragen 这个动作连在一起。", reasonEn: "hulp naturally connects with the action vragen." },
      { source: "helpen", target: "hulp", relationType: "verb-noun-pair", reasonZh: "helpen 是动词，hulp 是同家族名词。", reasonEn: "helpen is the verb; hulp is the noun in the same family." },
      { source: "helpen", target: "medewerker", relationType: "scenario-word", reasonZh: "需要帮助时常会找 medewerker。", reasonEn: "When you need help, a medewerker may help you." },
      { source: "helpen", target: "formulier", relationType: "scenario-word", reasonZh: "填 formulier 时常需要别人 helpen。", reasonEn: "When filling in a formulier, someone may helpen." },
    ],
  },
  {
    id: "health",
    labelZh: "健康",
    labelEn: "health",
    members: ["ziek", "ziekenhuis", "huisarts", "apotheek", "pijn", "medicijn", "dokter", "afspraak", "recept", "koorts"],
    reasonZh: "这些词属于看病、药房和身体不舒服场景。",
    reasonEn: "These words belong to illness, GP, and pharmacy scenarios.",
    links: [
      { source: "ziekenhuis", target: "ziek", relationType: "compound-part", reasonZh: "ziekenhuis 里包含 ziek/zieken，和“生病”有关。", reasonEn: "ziekenhuis contains the sick-related part ziek/zieken." },
      { source: "ziekenhuis", target: "huis", relationType: "compound-part", reasonZh: "ziekenhuis 里有 huis，字面像 sick house。", reasonEn: "ziekenhuis contains huis: a sick house." },
      { source: "ziekenhuis", target: "huisarts", relationType: "scenario-word", reasonZh: "huisarts 和 ziekenhuis 都在医疗场景里。", reasonEn: "huisarts and ziekenhuis both belong to health care." },
      { source: "ziekenhuis", target: "apotheek", relationType: "scenario-word", reasonZh: "看病后可能会去 apotheek 拿药。", reasonEn: "After medical care you may go to an apotheek." },
      { source: "ziekenhuis", target: "pijn", relationType: "state-action", reasonZh: "有 pijn 时可能需要医院或医生。", reasonEn: "When there is pijn, a doctor or hospital may be needed." },
      { source: "huisarts", target: "huis", relationType: "compound-part", reasonZh: "huisarts 里有 huis，表示家庭医生。", reasonEn: "huisarts contains huis and means GP/family doctor." },
      { source: "huisarts", target: "arts", relationType: "compound-part", reasonZh: "huisarts 里有 arts，arts 是医生。", reasonEn: "huisarts contains arts, doctor." },
      { source: "huisarts", target: "afspraak", relationType: "scenario-word", reasonZh: "看 huisarts 通常需要 afspraak。", reasonEn: "Seeing a huisarts usually involves an afspraak." },
      { source: "huisarts", target: "ziek", relationType: "state-action", reasonZh: "ziek 时可能会找 huisarts。", reasonEn: "When you are ziek, you may contact a huisarts." },
      { source: "huisarts", target: "pijn", relationType: "state-action", reasonZh: "有 pijn 时可能会找 huisarts。", reasonEn: "When there is pijn, you may contact a huisarts." },
      { source: "huisarts", target: "medicijn", relationType: "scenario-word", reasonZh: "huisarts 可能会开 medicijn。", reasonEn: "A huisarts may prescribe medicijn." },
    ],
  },
  {
    id: "gemeente",
    labelZh: "市政",
    labelEn: "municipality",
    members: ["gemeente", "formulier", "adres", "postcode", "document", "paspoort", "balie", "loket", "afspraak", "bewijs"],
    reasonZh: "这些词用于市政厅、表格和证件办理。",
    reasonEn: "These words belong to municipality, forms, and documents.",
    links: [
      { source: "adres", target: "address", relationType: "english-bridge", reasonZh: "adres 和英文 address 很接近，是记忆桥。", reasonEn: "adres is close to English address, a memory bridge." },
      { source: "adres", target: "formulier", relationType: "scenario-word", reasonZh: "adres 常出现在 formulier 里。", reasonEn: "adres often appears on a formulier." },
      { source: "adres", target: "gemeente", relationType: "scenario-word", reasonZh: "搬家或登记 adres 常和 gemeente 有关。", reasonEn: "Changing or registering an adres often involves the gemeente." },
      { source: "adres", target: "postcode", relationType: "category-member", reasonZh: "postcode 是 adres 信息的一部分。", reasonEn: "postcode is part of address information." },
      { source: "adres", target: "woning", relationType: "scenario-word", reasonZh: "adres 指向你的 woning 或住处。", reasonEn: "adres points to your woning or place of residence." },
    ],
  },
  {
    id: "transport",
    labelZh: "交通",
    labelEn: "transport",
    members: ["station", "trein", "bus", "tram", "halte", "kaartje", "perron", "vertraging", "reis", "fiets"],
    reasonZh: "这些词属于出行和公共交通场景。",
    reasonEn: "These words belong to travel and public transport.",
  },
  {
    id: "family",
    labelZh: "家庭",
    labelEn: "family",
    members: ["familie", "moeder", "vader", "ouders", "broer", "zus", "kind", "zoon", "dochter", "partner"],
    reasonZh: "这些是家庭成员词，按人物关系一起记。",
    reasonEn: "These are family-member words.",
  },
  {
    id: "housing",
    labelZh: "住房",
    labelEn: "housing",
    members: ["woning", "huis", "kamer", "huur", "huurcontract", "verhuurder", "huurder", "adres", "postcode", "sleutel"],
    reasonZh: "这些词属于住房、租房和地址场景。",
    reasonEn: "These words belong to housing, rent, and address.",
  },
  {
    id: "work",
    labelZh: "工作",
    labelEn: "work",
    members: ["werk", "werken", "baan", "werkgever", "werknemer", "contract", "salaris", "collega", "sollicitatie", "cv"],
    reasonZh: "这些词属于工作和求职场景。",
    reasonEn: "These words belong to work and job-search contexts.",
  },
  {
    id: "payment",
    labelZh: "付款",
    labelEn: "payment",
    members: ["geld", "betalen", "rekening", "bedrag", "betaling", "pinpas", "contant", "euro", "cent", "wisselgeld", "prijs"],
    reasonZh: "这些词属于付款、金额和账单场景。",
    reasonEn: "These words belong to payment, amounts, and bills.",
  },
];
