import { relationLexicons } from "@/data/relationLexicons";
import { goldenMemoryRelations } from "@/data/goldenMemoryRelations";
import { infinitiveForWord } from "@/lib/exampleTemplates";
import { generateRelationsForWord, type MemoryRelationType, type RelationSource } from "@/lib/relationEngine";
import type { LocalizedText } from "@/types/course";
import type { MemoryLink, MemoryLinkType, WordItem } from "@/types/vocabulary";

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export type WordAssociation = {
  dutch: string;
  wordId?: string;
  meaning?: LocalizedText;
  targetExistsInVocabulary?: boolean;
  isExtensionWord?: boolean;
  isExtensionTarget?: boolean;
  source?: RelationSource | "extension";
  type: MemoryRelationType;
  kind: LocalizedText;
  reason: LocalizedText;
};

const relationFallbackLabels: Record<MemoryRelationType, LocalizedText> = {
  "compound-part": text("词里小块", "Word Piece"),
  "compound-parent": text("同组拼词", "Compound Set"),
  "compound-family": text("同组拼词", "Compound Set"),
  "part-related": text("短语小块", "Phrase Piece"),
  "word-family": text("同词族", "Word Family"),
  "pronoun-family": text("代词家族", "Pronoun Set"),
  "verb-form": text("动词形式", "Verb Form"),
  "verb-noun-pair": text("词族联想", "Verb/Noun Pair"),
  synonym: text("同义词", "Synonym"),
  opposite: text("反义/对比", "Opposite/Contrast"),
  "time-contrast": text("时间对照", "Time Contrast"),
  "comparative-superlative": text("比较级 / 最高级", "Comparative"),
  "semantic-series": text("系列关系", "Semantic Series"),
  "time-category": text("时间相关", "Time Related"),
  "scenario-word": text("实用联想", "Useful Link"),
  "action-object": text("动作相关", "Action Link"),
  "state-action": text("状态 → 动作", "State to Action"),
  "category-member": text("同类别", "Category"),
  "confusion-pair": text("易混词", "Confusion Pair"),
  "english-bridge": text("英文桥梁", "English Bridge"),
};

const legacyTypeMap: Record<MemoryLinkType, MemoryRelationType> = {
  "compound-part": "compound-part",
  "compound-parent": "compound-parent",
  "compound-family": "compound-family",
  "part-related": "part-related",
  "same-family": "word-family",
  "root-family": "word-family",
  "prefix-suffix-family": "word-family",
  "word-family": "word-family",
  "verb-form": "verb-form",
  synonym: "synonym",
  opposite: "opposite",
  antonym: "opposite",
  similar: "confusion-pair",
  "time-contrast": "time-contrast",
  "time-category": "time-category",
  "comparative-superlative": "comparative-superlative",
  "english-bridge": "english-bridge",
  "phrase-collocation": "scenario-word",
  "usage-chunk": "scenario-word",
  "verb-noun-pair": "verb-noun-pair",
  "category-member": "category-member",
  "scenario-neighbor": "scenario-word",
  "same-scene": "scenario-word",
  "confusion-pair": "confusion-pair",
  derivation: "word-family",
  "article-family": "scenario-word",
  "plural-family": "scenario-word",
  "number-family": "category-member",
  "scenario-word": "scenario-word",
  "action-object": "action-object",
  "state-action": "state-action",
};

const weakManualReasonPattern =
  /内容后台设置|creator-set|适合放在同一个记忆泡泡|belongs in the same memory bubble|请补充|add why|和当前词一起记|learn with the current word|同等级|同一天|same level|same day|同一个实用场景|useful neighbors|相关词|可以一起记|适合一起记|礼貌表达词组|按对话来回一起记|看病场景词组|按症状、医生、药房一起记/i;

const normalizeDutch = (value: string) => value.trim().toLowerCase().replace(/[.!?]+$/g, "");
const normalizedPairKey = (left: string, right: string) => [normalizeDutch(left), normalizeDutch(right)].sort().join("|");

const humanIdentityWords = new Set([
  "mens",
  "persoon",
  "man",
  "vrouw",
  "kind",
  "baby",
  "jongen",
  "meisje",
  "meid",
  "zoon",
  "dochter",
  "ouders",
  "moeder",
  "vader",
  "broer",
  "zus",
  "opa",
  "oma",
  "oom",
  "tante",
  "neef",
  "nicht",
  "partner",
  "familie",
  "gezin",
]);

const allowedHumanSynonymPairs = new Set([
  "mens|persoon",
]);

const humanContrastPairs = new Set([
  "jongen|meisje",
  "meid|meisje",
  "man|vrouw",
  "moeder|vader",
  "broer|zus",
  "dochter|zoon",
  "oma|opa",
  "oom|tante",
  "neef|nicht",
]);

function normalizedHumanIdentityRelationType(sourceText: string, targetText: string, relationType: MemoryRelationType) {
  if (relationType !== "synonym") return relationType;
  const sourceKey = normalizeDutch(sourceText);
  const targetKey = normalizeDutch(targetText);
  if (!humanIdentityWords.has(sourceKey) || !humanIdentityWords.has(targetKey)) return relationType;
  const pairKey = normalizedPairKey(sourceText, targetText);
  if (allowedHumanSynonymPairs.has(pairKey)) return relationType;
  return humanContrastPairs.has(pairKey) ? "opposite" : "semantic-series";
}

function humanIdentityRelationReason(sourceText: string, targetText: string, relationType: MemoryRelationType) {
  if (relationType === "opposite") {
    return text(
      `${sourceText} 和 ${targetText} 是人/家庭身份里的对照关系，不是同义词。`,
      `${sourceText} and ${targetText} are contrasting people/family identity words, not synonyms.`,
    );
  }
  return text(
    `${sourceText} 和 ${targetText} 都是人/家庭身份词，但不是同义词；按年龄、性别或家庭角色对照记。`,
    `${sourceText} and ${targetText} are people/family identity words, but not synonyms; compare them by age, gender, or family role.`,
  );
}

function normalizeAssociationForDisplay(source: WordItem, association: WordAssociation): WordAssociation {
  const relationType = normalizedHumanIdentityRelationType(source.dutch, association.dutch, association.type);
  if (relationType === association.type) return association;
  return {
    ...association,
    type: relationType,
    kind: relationFallbackLabels[relationType],
    reason: humanIdentityRelationReason(source.dutch, association.dutch, relationType),
  };
}
const usefulVerbFormToInfinitive: Record<string, string> = {
  begin: "beginnen",
  bel: "bellen",
  betaal: "betalen",
  begrijp: "begrijpen",
  bereik: "bereiken",
  bespaar: "besparen",
  beslis: "beslissen",
  bespreek: "bespreken",
  bezoek: "bezoeken",
  bewijs: "bewijzen",
  bied: "aanbieden",
  doe: "doen",
  drink: "drinken",
  eet: "eten",
  ga: "gaan",
  geef: "geven",
  gebruik: "gebruiken",
  gebeur: "gebeuren",
  heb: "hebben",
  heet: "heten",
  help: "helpen",
  herhaal: "herhalen",
  herinner: "herinneren",
  kan: "kunnen",
  kijk: "kijken",
  kies: "kiezen",
  klik: "klikken",
  kom: "komen",
  kook: "koken",
  koop: "kopen",
  leer: "leren",
  lees: "lezen",
  leg: "leggen",
  loop: "lopen",
  luister: "luisteren",
  maak: "maken",
  meld: "melden",
  moet: "moeten",
  neem: "nemen",
  noteer: "noteren",
  ontvang: "ontvangen",
  open: "openen",
  pas: "aanpassen",
  pak: "pakken",
  reageer: "reageren",
  regel: "regelen",
  rust: "rusten",
  slaap: "slapen",
  schrijf: "schrijven",
  sluit: "sluiten",
  spreek: "spreken",
  sta: "staan",
  stop: "stoppen",
  uitleg: "uitleggen",
  verbeter: "verbeteren",
  vergelijk: "vergelijken",
  verhuis: "verhuizen",
  verleng: "verlengen",
  verzend: "verzenden",
  vul: "invullen",
  wacht: "wachten",
  was: "wassen",
  werk: "werken",
  weiger: "weigeren",
  wil: "willen",
  woon: "wonen",
  zeg: "zeggen",
  zie: "zien",
  zit: "zitten",
  zoek: "zoeken",
};
const usefulInfinitiveToVerbForm = Object.entries(usefulVerbFormToInfinitive).reduce<Record<string, string>>(
  (forms, [form, infinitive]) => {
    forms[normalizeDutch(infinitive)] ??= form;
    return forms;
  },
  {},
);
const zijnFormMeanings: Record<string, LocalizedText> = {
  zijn: text("是 / 存在；动词原形", "to be; infinitive"),
  ben: text("我是：ik ben", "am: ik ben"),
  bent: text("你/您是：jij/u bent", "are: jij/u bent"),
  is: text("他/她/它/这是：hij/zij/het/dit is", "is: hij/zij/het/dit is"),
};
const numberRelationText = new Set([
  "-tig",
  "en",
  "nul",
  "een",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
  "tien",
  "elf",
  "twaalf",
  "dertien",
  "veertien",
  "vijftien",
  "zestien",
  "zeventien",
  "achttien",
  "negentien",
  "twintig",
  "dertig",
  "veertig",
  "vijftig",
  "zestig",
  "zeventig",
  "tachtig",
  "negentig",
  "honderd",
  "tweede",
]);
const numberRelationPattern = /(?:tien|tig|twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig|honderd)$/;
const numberStructuralTypes = new Set<MemoryRelationType>(["word-family", "compound-part", "compound-family"]);
const isNumberRelationText = (value: string) => {
  const normalized = normalizeDutch(value);
  return numberRelationText.has(normalized) || numberRelationPattern.test(normalized);
};
const phraseTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;
const phraseComponentKind = text("短语组成", "Phrase Part");
const phraseComponentStopwords = new Set(["de", "het", "een"]);
const phraseComponentMeanings: Record<string, Record<string, LocalizedText>> = {
  "een beetje": {
    een: text("一个 / 一点里的“一”", "one / the one in a little"),
    beetje: text("小点 / 一点", "little bit"),
  },
  "tot ziens": {
    tot: text("到 / 直到", "to / until"),
    ziens: text("再见里的“见”", "the seeing piece in see you"),
  },
  "dank je": {
    dank: text("感谢 / 谢意", "thanks / gratitude"),
    je: text("你（常用弱读）", "you, unstressed"),
  },
  "dank u": {
    dank: text("感谢 / 谢意", "thanks / gratitude"),
    u: text("您", "formal you"),
  },
  "kom uit": {
    kom: text("来 / 过来", "come"),
    uit: text("从 / 来自", "from / out of"),
  },
};

const strongCategoryRelationIds = new Set([
  "body-parts",
  "number-ones",
  "number-teens",
  "number-tens",
  "relative-days",
  "day-parts",
  "time-units",
  "meal-times",
  "ordinal-order",
  "months",
  "weekdays",
  "sequence-time",
  "frequency-time",
  "countries",
  "languages",
  "personal-info",
  "formal-address",
  "public-signs",
  "family",
  "colors",
  "food-drink",
  "fruit-drinks",
  "seasoning-a1",
  "checkout-shopping-a1",
  "quantity-checkout-a1",
  "shopping",
  "directions-position",
  "question-words",
  "naming-words",
  "learning-roles",
  "movement-direction",
  "transport-route-flow",
  "kitchen-tableware",
  "drink-containers",
  "furniture",
  "home-rooms-fixtures",
  "cleaning-basic",
  "clothes",
  "nature-city",
  "measurements",
  "language-skills",
  "digital-click-actions",
  "function-connectors",
  "modal-verbs",
  "have-forms",
  "marital-status",
  "formal-email-writing",
  "text-reading",
  "document-proof-series",
  "open-close-status",
  "walking-running-series",
  "basic-sports-hobbies",
  "morning-routine",
  "basic-action-pairs",
  "dressing-actions",
  "school-supplies",
  "birthday-party",
  "family-life-events",
  "first-aid-basic",
  "basic-feelings-needs",
  "emotions-states",
  "validity-expiry",
  "attendance-status",
  "choice-opinion",
  "admin-change-confirmation",
  "healthcare-route",
  "digital-form-actions",
  "email-status-flow",
  "order-return-flow",
  "complaint-repair-flow",
  "sick-leave-flow",
  "symptom-treatment-series",
  "body-medical-series",
  "housing-repair-series",
  "school-childcare-series",
  "work-contract-series",
  "text-structure-series",
  "civic-safety-series",
  "weather-climate-series",
  "travel-airport-series",
  "tax-income-series",
  "finance-bank-series",
  "formal-contact-series",
  "phone-service-series",
  "identity-admin-series",
  "social-relation-series",
  "media-series",
  "art-culture-series",
  "environment-society-series",
  "society-participation-series",
  "personal-quality-series",
  "interest-motivation-series",
  "practical-problem-series",
  "cleaning-household",
  "legal-safety",
  "official-admin-extended",
  "communication-actions",
  "past-actions",
  "body-appearance",
  "graph-data",
  "b1-connectors",
  "opinion-argument",
  "education-exam",
  "business-workplace",
  "job-search",
  "insurance-task",
  "care-family-task",
  "workplace-roles-task",
  "energy-bill-task",
  "transport-disruption",
  "digital-account-actions",
  "appointment-planning-series",
  "rail-transport",
  "transport",
  "health",
  "complaint",
  "payment",
  "housing",
  "forms-documents",
  "email-message",
  "phone-contact",
  "contact-info",
  "residence-location",
  "places-services",
  "shops-services-people",
  "technology",
  "travel-documents",
  "tax-benefit",
  "shopping-service",
  "sick-leave",
  "admin-actions",
  "practical-actions",
  "descriptive-states",
  "daily-objects",
  "office-basics",
  "grammar-small-words",
  "learning-level",
  "civic-participation",
  "neighborhood-services",
  "language-services",
  "work",
]);

const broadCategoryFallbackRelationIds = new Set([
  "body-parts",
  "food-drink",
  "fruit-drinks",
  "shopping",
  "transport",
  "rail-transport",
  "kitchen-tableware",
  "drink-containers",
  "furniture",
  "home-rooms-fixtures",
  "cleaning-basic",
  "clothes",
  "nature-city",
  "measurements",
  "basic-sports-hobbies",
  "school-supplies",
  "birthday-party",
  "family-life-events",
  "first-aid-basic",
  "body-appearance",
  "health",
  "complaint",
  "payment",
  "housing",
  "forms-documents",
  "email-message",
  "phone-contact",
  "contact-info",
  "residence-location",
  "places-services",
  "shops-services-people",
  "technology",
  "travel-documents",
  "tax-benefit",
  "shopping-service",
  "sick-leave",
  "admin-actions",
  "practical-actions",
  "descriptive-states",
  "daily-objects",
  "office-basics",
  "grammar-small-words",
  "learning-level",
  "civic-participation",
  "neighborhood-services",
  "language-services",
  "work",
]);

function focusedGroupTargets(groups: string[][]): Record<string, string[]> {
  const targets: Record<string, string[]> = {};
  groups.forEach((group) => {
    group.forEach((source) => {
      const sourceKey = normalizeDutch(source);
      const peers = group.filter((target) => normalizeDutch(target) !== sourceKey);
      targets[sourceKey] = [...(targets[sourceKey] ?? []), ...peers];
    });
  });
  return targets;
}

function relationTypeForStrongCategory(categoryId: string, sourceKey?: string): MemoryRelationType {
  if (categoryId === "relative-days" || categoryId === "day-parts") return "time-contrast";
  const hasFocusedTargets = Boolean(sourceKey && focusedStrongCategoryTargets[categoryId]?.[sourceKey]?.length);
  if (broadCategoryFallbackRelationIds.has(categoryId) && !hasFocusedTargets) return "category-member";
  return "semantic-series";
}

const focusedStrongCategoryTargets: Record<string, Record<string, string[]>> = {
  "seasoning-a1": {
    suiker: ["zout", "peper"],
    zout: ["peper", "suiker"],
    peper: ["zout", "suiker"],
  },
  "checkout-shopping-a1": {
    prijskaartje: ["prijs", "aanbieding", "totaal", "bonnetje"],
    aanbieding: ["prijskaartje", "prijs", "korting", "totaal"],
    totaal: ["prijs", "prijskaartje", "bonnetje", "extra"],
    extra: ["totaal", "meer", "minder", "genoeg"],
    bonnetje: ["bon", "bewaren", "totaal", "prijs"],
    bon: ["bonnetje", "bewaren", "totaal"],
    munten: ["biljet", "geld", "portemonnee"],
    biljet: ["munten", "geld", "portemonnee"],
    portemonnee: ["geld", "munten", "biljet", "pinpas"],
    klant: ["verkoper", "kassa", "bonnetje"],
    verkoper: ["klant", "winkel", "kassa"],
  },
  "quantity-checkout-a1": {
    totaal: ["extra", "meer", "minder", "genoeg"],
    extra: ["meer", "totaal", "minder", "genoeg"],
    minder: ["meer", "te weinig", "genoeg"],
    meer: ["minder", "te veel", "genoeg"],
    genoeg: ["te veel", "te weinig", "meer", "minder"],
    "te veel": ["te weinig", "genoeg", "minder"],
    "te weinig": ["te veel", "genoeg", "meer"],
  },
  "food-drink": {
    ...focusedGroupTargets([
      ["brood", "kaas", "vlees", "ei", "soep"],
      ["rijst", "pasta", "noedel", "soep"],
      ["water", "melk", "koffie", "thee", "sap"],
      ["groente", "tomaat", "komkommer", "wortel", "ui", "knoflook", "paprika", "sla", "boon"],
    ]),
    appel: ["appelsap", "sinaasappel", "aardappel"],
  },
  "fruit-drinks": {
    ...focusedGroupTargets([
      ["fruit", "appel", "peer", "druif", "aardbei", "citroen", "meloen", "perzik"],
      ["sap", "appelsap", "sinaasappelsap", "frisdrank", "mineraalwater", "kraanwater", "sojamelk"],
      ["bier", "wijn", "frisdrank"],
      ["ijs", "frisdrank", "sap"],
    ]),
    appel: ["appelsap", "sinaasappel", "aardappel"],
  },
  "order-return-flow": {
    ruilen: ["terugbrengen", "retourneren", "bonnetje", "bewaren", "ruiltermijn"],
    terugbrengen: ["ruilen", "retourneren", "bonnetje", "bewaren"],
    bewaren: ["bonnetje", "bon", "garantiebewijs", "bewijs"],
    bonnetje: ["bon", "bewaren", "ruilen", "terugbrengen"],
    bon: ["bonnetje", "bewaren", "ruilen"],
    retourneren: ["ruilen", "terugbrengen", "retour", "terugstorten"],
  },
  "walking-running-series": {
    lopen: ["wandelen", "hardlopen", "rennen", "loop"],
    wandelen: ["lopen", "hardlopen", "rennen"],
    hardlopen: ["rennen", "lopen", "wandelen"],
    rennen: ["hardlopen", "lopen", "wandelen"],
  },
  transport: {
    trein: ["bus", "tram", "metro", "station", "perron"],
    bus: ["tram", "metro", "trein", "halte"],
    tram: ["metro", "bus", "trein", "halte"],
    metro: ["tram", "bus", "trein", "station"],
    fiets: ["fietsen", "fietspad", "fietser", "fietsenstalling"],
    auto: ["bus", "fiets", "trein", "taxi"],
    boot: ["trein", "bus", "taxi"],
    taxi: ["bus", "trein", "auto", "chauffeur"],
    scooter: ["motor", "brommer", "fiets"],
    motor: ["scooter", "brommer", "auto"],
    brommer: ["scooter", "motor", "fiets"],
    chauffeur: ["taxi", "bus", "rit"],
    rit: ["taxi", "bus", "chauffeur"],
    halte: ["bus", "tram", "metro"],
    station: ["trein", "metro", "perron"],
    kaartje: ["kaart", "ov-chipkaart", "station"],
  },
  "kitchen-tableware": {
    glas: ["beker", "kopje"],
    beker: ["glas", "kopje"],
    mes: ["vork", "lepel"],
    vork: ["mes", "lepel"],
    lepel: ["mes", "vork"],
    pan: ["pot", "fornuis"],
    pot: ["pan", "fornuis"],
    servet: ["tafelkleed", "bord", "lepel"],
    tafelkleed: ["servet", "bord", "glas"],
  },
  "drink-containers": {
    fles: ["glas", "beker", "kopje", "liter"],
    glas: ["beker", "kopje", "fles"],
    beker: ["glas", "kopje", "fles"],
    kopje: ["glas", "beker", "kop"],
    kop: ["kopje", "beker", "glas"],
  },
  clothes: {
    ...focusedGroupTargets([
      ["jas", "broek", "trui", "schoenen", "sok"],
      ["jurk", "rok", "blouse", "riem"],
      ["muts", "pet", "sjaal", "handschoen"],
      ["laars", "pantoffel", "schoenen", "sok"],
      ["pyjama", "ondergoed", "hemd"],
    ]),
  },
  measurements: {
    maat: ["meter", "centimeter", "kilo", "liter"],
    kilo: ["gram"],
    gram: ["kilo"],
    fles: ["liter"],
    liter: ["fles"],
    meter: ["centimeter"],
    centimeter: ["meter"],
    halve: ["heel", "dubbel"],
    heel: ["halve", "dubbel"],
    dubbel: ["halve", "heel"],
  },
  family: {
    familie: ["gezin", "ouders", "moeder", "vader", "kind"],
    gezin: ["familie", "ouders", "moeder", "vader", "kind"],
    ouders: ["moeder", "vader", "kind", "zoon", "dochter"],
    moeder: ["vader", "ouders", "kind", "zoon", "dochter"],
    vader: ["moeder", "ouders", "kind", "zoon", "dochter"],
    kind: ["baby", "jongen", "meisje", "meid", "zoon", "dochter", "moeder", "vader", "ouders"],
    baby: ["kind", "jongen", "meisje", "ouders"],
    jongen: ["meisje", "kind", "zoon"],
    meisje: ["jongen", "meid", "kind", "dochter"],
    meid: ["meisje", "jongen", "kind"],
    zoon: ["dochter", "kind", "ouders", "moeder", "vader"],
    dochter: ["zoon", "kind", "ouders", "moeder", "vader"],
    broer: ["zus", "ouders", "familie"],
    zus: ["broer", "ouders", "familie"],
    opa: ["oma", "kleinkind", "familie"],
    oma: ["opa", "kleinkind", "familie"],
    oom: ["tante", "neef", "nicht", "familie"],
    tante: ["oom", "neef", "nicht", "familie"],
    neef: ["nicht", "oom", "tante", "familie"],
    nicht: ["neef", "oom", "tante", "familie"],
    man: ["vrouw", "meneer", "vader", "buurman"],
    vrouw: ["man", "mevrouw", "moeder", "buurvrouw"],
  },
  furniture: {
    ...focusedGroupTargets([
      ["tafel", "stoel", "bank"],
      ["bed", "kast", "lamp"],
      ["vloer", "muur", "raam", "deur"],
      ["gordijn", "deken", "kussen", "matras", "spiegel"],
    ]),
  },
  "home-rooms-fixtures": {
    ...focusedGroupTargets([
      ["keuken", "wc", "hal", "gang"],
      ["zolder", "kelder", "balkon", "trap"],
      ["douche", "kraan", "gootsteen"],
      ["fornuis", "oven", "koelkast"],
    ]),
  },
  "body-parts": {
    ...focusedGroupTargets([
      ["hoofd", "gezicht", "oog", "keel"],
      ["arm", "hand", "vinger"],
      ["been", "voet", "teen"],
      ["buik", "rug", "lichaam"],
    ]),
  },
  health: {
    ...focusedGroupTargets([
      ["gezond", "ongezond", "gezondheid", "leefstijl"],
      ["ziek", "moe", "pijn", "koorts", "stress"],
      ["dokter", "huisarts", "tandarts", "apotheek", "ziekenhuis"],
      ["medicijn", "pijnstiller", "paracetamol", "antibiotica"],
    ]),
  },
  "first-aid-basic": {
    ...focusedGroupTargets([
      ["pleister", "verband", "druppel", "medicijn"],
      ["snijden", "branden", "jeuken", "pijn"],
    ]),
  },
  "symptom-treatment-series": {
    ...focusedGroupTargets([
      ["klacht", "klachten", "pijn", "moe", "stress", "koorts"],
      ["hoesten", "benauwd", "duizelig", "misselijk", "overgeven", "diarree"],
      ["wond", "bloed", "bloeden", "bloeddruk"],
    ]),
    leefstijl: ["gezond", "ongezond", "stress"],
  },
  "school-supplies": {
    ...focusedGroupTargets([
      ["les", "oefenen", "toets", "groep", "lokaal"],
      ["papier", "potlood", "gum", "liniaal", "schrift", "boek"],
    ]),
  },
  "sports-leisure": {
    ...focusedGroupTargets([
      ["zwemmen", "voetbal", "tennis", "hardlopen", "rennen", "wandelen"],
      ["dansen", "zingen", "muziek", "film", "tekenen"],
    ]),
  },
  "basic-sports-hobbies": {
    ...focusedGroupTargets([
      ["zwemmen", "voetbal", "tennis", "sport", "hobby"],
      ["dansen", "zingen", "muziek", "film", "tekenen"],
    ]),
  },
  technology: {
    ...focusedGroupTargets([
      ["computer", "laptop", "scherm", "muis"],
      ["oplader", "batterij", "stekker", "stopcontact"],
      ["website", "pagina", "knop", "menu", "instelling"],
      ["camera", "foto", "televisie", "programma", "geluid"],
    ]),
  },
  "digital-click-actions": {
    website: ["pagina", "knop", "link", "openen"],
    pagina: ["website", "knop", "link"],
    knop: ["klikken", "link", "website"],
    link: ["klikken", "knop", "website"],
    klikken: ["knop", "link"],
  },
  "daily-objects": {
    bril: ["sleutel", "tas", "papier", "potlood"],
    mandje: ["tas", "boodschappen", "winkel"],
    tas: ["mandje", "sleutel", "papier"],
    papier: ["potlood", "schrift", "boek"],
    potlood: ["papier", "gum", "liniaal"],
  },
  "office-basics": {
    bureau: ["printer", "formulier", "mapje", "balpen"],
    printer: ["bureau", "formulier", "mapje"],
    formulier: ["printer", "mapje", "bureau"],
    mapje: ["formulier", "printer", "bureau"],
    vergadering: ["noteren", "uitleg", "voorbeeld"],
    noteren: ["vergadering", "uitleg", "voorbeeld"],
  },
  "practical-actions": {
    aanraken: ["aanzetten", "uitzetten", "openen", "sluiten"],
    achterlaten: ["onthouden", "terugkomen", "meenemen"],
    onthouden: ["herinneren", "achterlaten", "noteren"],
    klaarmaken: ["inpakken", "uitpakken", "opruimen"],
    proeven: ["eten", "drinken", "lekker"],
    overleggen: ["bespreken", "afspreken", "terugbellen"],
    doorgeven: ["sturen", "doorgeven", "bericht"],
    toelichten: ["uitleg", "uitleggen", "voorbeeld"],
    afstemmen: ["overleggen", "bespreken", "afspraak"],
  },
  "body-appearance": {
    gezicht: ["oog", "huid", "haar"],
    baard: ["haar", "gezicht", "huid"],
    glimlachen: ["gezicht", "blij", "lachen"],
    haar: ["baard", "gezicht", "huid"],
    huid: ["gezicht", "haar", "baard"],
  },
  payment: {
    ...focusedGroupTargets([
      ["euro", "cent", "geld", "contant"],
      ["pinpas", "bankpasje", "rekening", "bedrag"],
      ["prijs", "premie", "betaling", "terugbetaling"],
    ]),
  },
  shopping: {
    boodschappen: ["winkel", "supermarkt", "kassa", "mandje"],
    winkel: ["supermarkt", "kassa", "boodschappen"],
    supermarkt: ["winkel", "kassa", "boodschappen"],
    kassa: ["winkel", "supermarkt", "prijs", "bonnetje"],
  },
  "birthday-party": {
    ...focusedGroupTargets([
      ["verjaardag", "feestje", "feest", "cadeau", "kalender"],
      ["vakantie", "bezoek", "uitnodigen", "logeren"],
    ]),
  },
  "family-life-events": {
    ...focusedGroupTargets([
      ["samenwonen", "scheiden", "geboren", "partner", "gezin", "familie"],
    ]),
  },
  "cleaning-basic": {
    ...focusedGroupTargets([
      ["schoon", "droog", "wassen", "afwas", "zeep", "handdoek", "opruimen"],
    ]),
  },
  "nature-city": {
    ...focusedGroupTargets([
      ["boom", "bloem", "gras", "tuin", "park"],
      ["lucht", "wolken", "wolk"],
      ["rivier", "zee", "strand", "brug"],
      ["gebouw", "flat", "stad", "dorp"],
    ]),
  },
  "places-services": {
    ...focusedGroupTargets([
      ["markt", "winkel", "supermarkt", "restaurant", "café"],
      ["bioscoop", "museum", "bibliotheek", "zwembad"],
      ["kerk", "moskee", "toilet", "parkeerplaats", "ingang", "centrum"],
    ]),
  },
  "shops-services-people": {
    kapper: ["bakker", "slager", "marktkoopman", "winkelmedewerker"],
    bakker: ["kapper", "slager", "marktkoopman"],
    slager: ["bakker", "kapper", "marktkoopman"],
    marktkoopman: ["winkelmedewerker", "bakker", "slager"],
    winkelmedewerker: ["marktkoopman", "verkoper", "klant"],
  },
  "descriptive-states": {
    blij: ["verdrietig", "boos", "bang"],
    verdrietig: ["blij", "boos", "bang"],
    zwak: ["sterk"],
    sterk: ["zwak"],
    lang: ["kort"],
    kort: ["lang"],
    schoon: ["vies", "droog"],
    vies: ["schoon"],
    droog: ["schoon", "nat"],
    gevaarlijk: ["veilig"],
    zeker: ["misschien", "ongeveer"],
    ongeveer: ["zeker", "precies"],
    klaar: ["begin", "einde"],
    lekker: ["vies"],
  },
  "learning-level": {
    beginner: ["niveau", "cursus", "les", "oefenen"],
    niveau: ["beginner", "cursus", "les"],
    cursus: ["niveau", "les", "oefenen"],
    les: ["cursus", "oefenen", "student"],
  },
  "residence-location": {
    ...focusedGroupTargets([
      ["stad", "dorp", "plaats", "gemeente", "woonplaats"],
      ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag"],
      ["straat", "huisnummer", "postcode", "adres", "provincie"],
    ]),
  },
  "forms-documents": {
    formulier: ["document", "bijlage", "kopie", "handtekening"],
    document: ["formulier", "bewijs", "kopie", "bijlage"],
    stempel: ["handtekening", "formulier", "document"],
    mapje: ["formulier", "document", "kopie"],
    printer: ["printen", "scannen", "kopie"],
  },
  "complaint-repair-flow": {
    klacht: ["probleem", "oplossing", "oorzaak", "gevolg"],
    probleem: ["klacht", "oplossing", "oorzaak", "gevolg"],
    gas: ["wifi", "klacht", "probleem", "oplossing"],
    wifi: ["gas", "klacht", "probleem", "oplossing"],
    excuses: ["klacht", "probleem", "oplossing", "reactietermijn"],
    verstopping: ["klacht", "probleem", "oplossing", "gas"],
    internetprovider: ["wifi", "klacht", "probleem"],
  },
  "transport-route-flow": {
    perron: ["spoor", "station", "trein", "vertraging"],
    uitval: ["uitvallen", "vertraging", "omleiding", "perron"],
    uitvallen: ["uitval", "vertraging", "omleiding", "perron"],
    omreizen: ["omleiding", "vertraging", "perron"],
    controleur: ["kaartcontrole", "boete", "conducteur"],
  },
  "language-services": {
    vertaling: ["tolk", "taal", "Nederlands", "Engels"],
    tolk: ["vertaling", "taal", "spreken", "begrijpen"],
  },
  "formal-contact-series": {
    geachte: ["beste", "aanhef", "groet", "met vriendelijke groet"],
    beste: ["geachte", "aanhef", "groet"],
    aanhef: ["geachte", "beste", "groet"],
    groet: ["aanhef", "met vriendelijke groet", "geachte"],
  },
  "email-status-flow": {
    spam: ["map", "afzender", "ontvanger", "bericht"],
    map: ["spam", "concept", "verzonden", "bericht"],
    concept: ["verzonden", "bericht", "map"],
    verzonden: ["concept", "bericht", "map"],
  },
  "shopping-service": {
    voorraad: ["voorraadstatus", "bestelling", "order", "artikelnummer"],
    order: ["bestelling", "bestelbevestiging", "pakketje", "voorraad"],
    pakketje: ["pakketpunt", "bestelling", "order", "bezorgen"],
  },
  "civic-participation": {
    maatschappij: ["samenleving", "overheid", "vereniging", "activiteit"],
    overheid: ["gemeente", "maatschappij", "vergunning", "verkiezing"],
    evenement: ["vergunning", "gemeente", "activiteit"],
    verkiezing: ["stemmen", "overheid", "gemeente"],
    stemmen: ["verkiezing", "overheid", "gemeente"],
    krant: ["maatschappij", "overheid", "berichtgeving"],
    activiteit: ["vereniging", "bibliotheek", "wijkteam"],
    vereniging: ["activiteit", "initiatief", "buurtgenoot"],
  },
  "text-structure-series": {
    krant: ["tekst", "bron", "feit", "berichtgeving"],
    tekst: ["krant", "bron", "feit", "samenvatting"],
    bron: ["krant", "tekst", "feit"],
  },
  "media-series": {
    krant: ["media", "podcast", "uitzending"],
    media: ["krant", "podcast", "uitzending"],
    podcast: ["media", "uitzending", "krant"],
  },
  "attendance-status": {
    verlof: ["aanwezig", "afwezig", "afwezigheid"],
    aanwezig: ["afwezig", "verlof", "aanwezigheid"],
    afwezig: ["aanwezig", "verlof", "afwezigheid"],
  },
  "choice-opinion": {
    keuze: ["kiezen", "vinden", "willen", "zin"],
    kiezen: ["keuze", "willen", "vinden"],
    vinden: ["mening", "keuze", "willen"],
  },
  "admin-actions": {
    accepteren: ["weigeren", "beslissen", "aanpassen"],
    weigeren: ["accepteren", "beslissen", "aanpassen"],
    ontdekken: ["vergelijken", "bespreken", "beslissen"],
    verkorten: ["verlengen", "aanpassen", "beslissen"],
    verlengen: ["verkorten", "aanpassen", "beslissen"],
  },
  "weather-climate-series": {
    weerbericht: ["temperatuur", "wind", "wolk", "regenbui", "sneeuw", "mist", "storm"],
    temperatuur: ["graad", "weerbericht", "klimaat", "hittegolf"],
    graad: ["temperatuur", "weerbericht", "hittegolf"],
    wind: ["storm", "weerbericht", "wolk", "regenbui"],
    storm: ["wind", "regenbui", "weerbericht", "overstroming"],
    wolk: ["weerbericht", "regenbui", "mist", "wind"],
    regenbui: ["weerbericht", "wolk", "wind", "storm", "overstroming"],
    sneeuw: ["weerbericht", "glad", "temperatuur"],
    glad: ["sneeuw", "weerbericht"],
    mist: ["weerbericht", "wolk"],
    droogte: ["klimaat", "hittegolf", "temperatuur"],
    klimaat: ["weerbericht", "temperatuur", "hittegolf", "droogte", "overstroming"],
    hittegolf: ["temperatuur", "klimaat", "droogte"],
    overstroming: ["storm", "regenbui", "klimaat"],
  },
  "environment-society-series": {
    milieu: ["vervuiling", "uitstoot", "milieubewust", "hergebruiken", "klimaat", "natuurgebied"],
    vervuiling: ["uitstoot", "milieu", "milieubewust", "hergebruiken", "klimaat"],
    uitstoot: ["vervuiling", "milieu", "klimaat", "energie", "milieubewust"],
    milieubewust: ["milieu", "hergebruiken", "vervuiling", "uitstoot"],
    hergebruiken: ["milieubewust", "milieu", "vervuiling"],
    klimaat: ["milieu", "uitstoot", "hittegolf", "overstroming", "energie"],
    energie: ["uitstoot", "klimaat", "milieu"],
    natuurgebied: ["milieu", "klimaat", "vervuiling"],
    overstroming: ["klimaat", "milieu", "hittegolf"],
    hittegolf: ["klimaat", "milieu", "overstroming"],
  },
  "society-participation-series": {
    maatschappij: ["gelijke kansen", "discriminatie", "initiatief", "vereniging"],
    "gelijke kansen": ["discriminatie", "maatschappij", "initiatief"],
    discriminatie: ["gelijke kansen", "maatschappij"],
    vereniging: ["initiatief", "buurtgenoot", "taalmaatje"],
    taalmaatje: ["buurtgenoot", "vereniging"],
    buurtgenoot: ["taalmaatje", "vereniging", "initiatief"],
    initiatief: ["vereniging", "maatschappij", "buurtgenoot"],
    straatpoëzie: ["initiatief", "buurtgenoot"],
  },
};

const associationClusters = [
  {
    id: "insurance-task",
    label: text("保险理赔任务", "insurance and claims"),
    words: ["verzekering", "verzekeraar", "basisverzekering", "aanvullende verzekering", "zorgverzekering", "zorgverzekeraar", "reisverzekering", "polis", "polisnummer", "polisblad", "verzekerde", "premie", "dekking", "declaratie", "declareren", "nota", "vergoeding", "vergoeden", "niet vergoed", "eigen risico", "eigen bijdrage", "zorgverlener", "machtiging", "klantenservice", "wijzigen", "opzeggen"],
  },
  {
    id: "care-family-task",
    label: text("照护和家庭办事", "care and family administration"),
    words: ["mantelzorg", "mantelzorger", "zorg nodig hebben", "oppas", "kinderopvangtoeslag", "ouderlijk gezag", "noodcontact", "contactgegevens", "familielid", "samen aanvragen", "iemand machtigen", "toestemmingsformulier", "zorgafspraak", "begeleiding", "assistentie", "huishoudelijke hulp", "rolstoel", "hulpmiddel", "aanpassing", "ondersteuning"],
  },
  {
    id: "workplace-roles-task",
    label: text("学校/职场角色", "school and workplace roles"),
    words: ["conciërge", "directeur", "eigenaar", "personeel", "personeelszaken", "personeelsblad", "receptie", "kantoor", "afdeling", "medewerker", "teamleider", "collega", "werkgever", "werknemer", "werktempo"],
  },
  {
    id: "energy-bill-task",
    label: text("能源账单任务", "energy bill tasks"),
    words: ["energiecontract", "variabel tarief", "vast tarief", "maandbedrag", "jaarafrekening", "verbruik", "stroom", "warmte", "waterverbruik", "meterkast", "meter opnemen", "lek melden", "contract overstappen", "opzegvergoeding", "klantnummer", "verbruiksperiode", "voorschotbedrag", "termijnbedrag"],
  },
] as const;

const closeGreetingGroups = [
  ["dank je", "bedankt", "alsjeblieft", "alstublieft", "sorry"],
  ["tot ziens", "dag"],
  ["goedemorgen", "goedemiddag", "goedenavond"],
] as const;

const dialogueSeriesGroups = [
  ["hallo", "dag", "goedemorgen", "goedemiddag", "goedenavond", "tot ziens"],
  ["dank je", "bedankt", "alsjeblieft", "alstublieft", "sorry"],
  ["ja", "nee", "wel", "niet"],
] as const;

const functionWordSeriesGroups = [
  ["en", "of", "maar", "dus", "want", "omdat", "daarom"],
  ["doordat", "zodat", "hoewel", "terwijl", "tijdens", "voordat", "nadat", "als", "toen"],
  ["bovendien", "daarnaast", "bijvoorbeeld", "ten eerste", "ten tweede", "kortom", "namelijk", "daardoor", "toch", "helaas"],
  ["volgens", "misschien", "ander", "andere"],
  ["wie", "wat", "waar", "wanneer", "hoe", "waarom", "welk", "welke", "waarheen", "waarvandaan"],
  ["in", "uit", "op", "aan", "van", "naar", "voor", "met", "over", "bij", "tegen", "tot"],
] as const;

const zijnFrameTargets: Record<string, string[]> = {
  ben: ["ik"],
  bent: ["jij", "je", "u"],
  is: ["wat", "dit", "dat", "het"],
};
const seasonWords = new Set(["lente", "zomer", "herfst", "winter"]);

function closeGreetingGroupFor(term: string) {
  const key = normalizeDutch(term);
  return closeGreetingGroups.find((group) => group.map(normalizeDutch).includes(key));
}

function isCloseGreetingPair(sourceText: string, targetText: string) {
  const sourceGroup = closeGreetingGroupFor(sourceText);
  if (!sourceGroup) return false;
  return sourceGroup.map(normalizeDutch).includes(normalizeDutch(targetText));
}

function dialogueSeriesFor(term: string) {
  const key = normalizeDutch(term);
  return dialogueSeriesGroups.find((group) => group.map(normalizeDutch).includes(key));
}

function functionWordSeriesFor(term: string) {
  const key = normalizeDutch(term);
  return functionWordSeriesGroups.find((group) => group.map(normalizeDutch).includes(key));
}

function categoryIdsForTerm(term: string) {
  const key = normalizeDutch(term);
  const lexiconCategoryIds = relationLexicons.categories
    .filter((category) => {
      const heads = category.heads.map(normalizeDutch);
      const members = category.members.map(normalizeDutch);
      return heads.includes(key) || members.includes(key);
    })
    .map((category) => category.id);
  const localCategoryIds = associationClusters
    .filter((category) => category.words.map(normalizeDutch).includes(key))
    .map((category) => category.id);
  return [...lexiconCategoryIds, ...localCategoryIds];
}

function sharedStrongCategoryId(sourceText: string, targetText: string) {
  const targetCategories = new Set(categoryIdsForTerm(targetText));
  return categoryIdsForTerm(sourceText).find((categoryId) => strongCategoryRelationIds.has(categoryId) && targetCategories.has(categoryId));
}

function orderFocusedStrongTargets(categoryId: string, sourceKey: string, targets: string[]) {
  const focusOrder = focusedStrongCategoryTargets[categoryId]?.[sourceKey]?.map(normalizeDutch) ?? [];
  if (!focusOrder.length) return targets;
  const focusRank = new Map(focusOrder.map((target, index) => [target, index]));
  return [...targets].sort((left, right) => {
    const leftRank = focusRank.get(normalizeDutch(left)) ?? Number.POSITIVE_INFINITY;
    const rightRank = focusRank.get(normalizeDutch(right)) ?? Number.POSITIVE_INFINITY;
    return leftRank - rightRank;
  });
}

function strongCategoryAssociationsFor(selected: WordItem, words: WordItem[], limit: number): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const sourceKey = normalizeDutch(sourceText);
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  const associations: WordAssociation[] = [];
  const seenTargets = new Set<string>();

  const addTarget = (categoryId: string, targetText: string) => {
    const targetKey = normalizeDutch(targetText);
    if (!targetKey || targetKey === sourceKey || seenTargets.has(targetKey)) return;
    const match = wordByDutch.get(targetKey);
    if (!match) return;
    const reason = strongCategoryReasonFor(categoryId, sourceText, match.dutch);
    if (!reason) return;
    seenTargets.add(targetKey);
    const relationType = relationTypeForStrongCategory(categoryId, sourceKey);
    associations.push({
      dutch: match.dutch,
      wordId: match.id,
      meaning: match.meaning,
      targetExistsInVocabulary: true,
      isExtensionWord: false,
      isExtensionTarget: false,
      source: "rule",
      type: relationType,
      kind: relationFallbackLabels[relationType],
      reason,
    });
  };

  relationLexicons.categories
    .filter((category) => strongCategoryRelationIds.has(category.id))
    .filter((category) => {
      const terms = [...category.heads, ...category.members].map(normalizeDutch);
      return terms.includes(sourceKey);
    })
    .forEach((category) => {
      const focusedTargets = focusedStrongCategoryTargets[category.id]?.[sourceKey];
      if (!focusedTargets?.length && broadCategoryFallbackRelationIds.has(category.id)) return;
      const candidateTerms = focusedTargets?.length
        ? focusedTargets
        : [...category.members, ...category.heads];
      const orderedTerms = orderFocusedStrongTargets(category.id, sourceKey, candidateTerms);
      orderedTerms.forEach((targetText) => addTarget(category.id, targetText));
    });

  associationClusters
    .filter((cluster) => strongCategoryRelationIds.has(cluster.id))
    .filter((cluster) => cluster.words.map(normalizeDutch).includes(sourceKey))
    .forEach((cluster) => cluster.words.forEach((targetText) => addTarget(cluster.id, targetText)));

  return associations.slice(0, Math.max(limit * 2, 8));
}

function strongCategoryReasonFor(categoryId: string, sourceText: string, targetText: string): LocalizedText | undefined {
  const localCluster = associationClusters.find((cluster) => cluster.id === categoryId);
  if (localCluster) {
    return text(
      `${sourceText} 和 ${targetText} 都属于「${localCluster.label.zh}」里的真实任务词，能一起帮你说清一个办事流程。`,
      `${sourceText} and ${targetText} both belong to ${localCluster.label.en}, so they help explain one practical task flow.`,
    );
  }
  if (categoryId === "body-parts") {
    return text(
      `${sourceText} 和 ${targetText} 都是身体部位词，放在同一组里一起认。`,
      `${sourceText} and ${targetText} are both body-part words, so learn them as one group.`,
    );
  }
  if (categoryId === "relative-days") {
    return text(
      "按时间轴记：gisteren 昨天 → vandaag 今天 → morgen 明天 → overmorgen 后天。",
      "Learn the timeline: gisteren yesterday -> vandaag today -> morgen tomorrow -> overmorgen the day after tomorrow.",
    );
  }
  if (categoryId === "day-parts") {
    return text(
      "按一天的顺序记：ochtend 早上 → middag 中午/下午 → avond 晚上 → nacht 夜里。",
      "Learn the order of the day: ochtend morning -> middag midday/afternoon -> avond evening -> nacht night.",
    );
  }
  if (categoryId === "meal-times") {
    return text(
      "按一天的用餐顺序记：ontbijt 早餐 → lunch 午餐 → avondeten/diner 晚饭/晚餐；maaltijd 是“一餐”的总称。",
      "Learn the daily meal order: ontbijt breakfast -> lunch -> avondeten/diner dinner; maaltijd is the general word for a meal.",
    );
  }
  if (categoryId === "time-units") {
    return text(
      `${sourceText} 和 ${targetText} 都是时间单位词，按分钟、小时、天、周、月、年这一组一起认。`,
      `${sourceText} and ${targetText} are time-unit words: minutes, hours, days, weeks, months, and years.`,
    );
  }
  if (categoryId === "food-drink") {
    return text(
      `${sourceText} 和 ${targetText} 都是基础饮食词，按厨房、餐桌或超市货架上的食物饮料一起认。`,
      `${sourceText} and ${targetText} are basic food or drink words, grouped by kitchen, table, or grocery shelf.`,
    );
  }
  if (categoryId === "fruit-drinks") {
    return text(
      `${sourceText} 和 ${targetText} 都在水果/饮品这条线上，适合按超市水果区和饮料一起记。`,
      `${sourceText} and ${targetText} belong to the fruit and drink line, useful as a grocery-shelf group.`,
    );
  }
  if (categoryId === "seasoning-a1") {
    return text(
      `${sourceText} 和 ${targetText} 都是餐桌/厨房里的调味品，按糖、盐、胡椒这一小组一起认。`,
      `${sourceText} and ${targetText} are table or kitchen seasonings: sugar, salt, and pepper.`,
    );
  }
  if (categoryId === "checkout-shopping-a1") {
    return text(
      `${sourceText} 和 ${targetText} 都在超市收银/付款这条线上：价签、优惠、总计、小票、钱包和买卖双方。`,
      `${sourceText} and ${targetText} belong to the checkout line: price tags, offers, totals, receipts, wallet, customer, and seller.`,
    );
  }
  if (categoryId === "quantity-checkout-a1") {
    return text(
      `${sourceText} 和 ${targetText} 都是在数量或付款时判断“多/少/够/总计”的词，适合按收银台数量线一起记。`,
      `${sourceText} and ${targetText} are quantity or checkout words for more, less, enough, extra, and total.`,
    );
  }
  if (categoryId === "ordinal-order") {
    return text(
      `${sourceText} 和 ${targetText} 都在“第几个/最后一个”的顺序线上。`,
      `${sourceText} and ${targetText} both sit on the first-second-third-last order line.`,
    );
  }
  if (categoryId === "months") {
    return text(
      `${sourceText} 和 ${targetText} 都是月份词，最好按月份顺序记。`,
      `${sourceText} and ${targetText} are month names, best learned in calendar order.`,
    );
  }
  if (categoryId === "countries") {
    return text(
      `${sourceText} 和 ${targetText} 都是国家/来源地词；填表或说“我来自……”时会在同一组选项里遇到。`,
      `${sourceText} and ${targetText} are country/origin words; they appear together when filling forms or saying where you are from.`,
    );
  }
  if (categoryId === "languages") {
    return text(
      `${sourceText} 和 ${targetText} 都是语言词；和 spreken/leren/begrijpen 这类语言动作一起用。`,
      `${sourceText} and ${targetText} are language words; they pair with actions like spreken, leren, and begrijpen.`,
    );
  }
  if (categoryId === "personal-info") {
    return text(
      `${sourceText} 和 ${targetText} 都是表格/自我介绍里的个人信息项，按姓名、年龄、出生日期、国籍这些栏目一起认。`,
      `${sourceText} and ${targetText} are personal-information fields for forms or introductions: name, age, birth date, nationality, and similar fields.`,
    );
  }
  if (categoryId === "formal-address") {
    return text(
      `${sourceText} 和 ${targetText} 都是称呼/身份词，按 meneer、mevrouw、man、vrouw 这一组对照认。`,
      `${sourceText} and ${targetText} are address or identity words; compare meneer, mevrouw, man, and vrouw as one set.`,
    );
  }
  if (categoryId === "public-signs") {
    return text(
      `${sourceText} 和 ${targetText} 都常出现在公共标识或提示牌上，按“看到牌子要怎么做”这一组认。`,
      `${sourceText} and ${targetText} often appear on public signs or notices, grouped by what the sign tells you to do.`,
    );
  }
  if (categoryId === "sequence-time") {
    return text(
      "按动作顺序记：eerst 先做，daarna 之后做，meteen 马上做，straks 稍后做。",
      "Learn the action order: eerst first, daarna after that, meteen immediately, straks soon/later.",
    );
  }
  if (categoryId === "frequency-time") {
    return text(
      `${sourceText} 和 ${targetText} 都在说时间频率或周期，按“多久一次”一起记。`,
      `${sourceText} and ${targetText} both express frequency or period, so learn them as how often words.`,
    );
  }
  if (categoryId === "family") {
    return text(
      `${sourceText} 和 ${targetText} 都是亲属/家庭词，放在一张家庭关系图里更好记。`,
      `${sourceText} and ${targetText} are family words, easier to remember on one family map.`,
    );
  }
  if (categoryId === "colors") {
    return text(
      `${sourceText} 和 ${targetText} 都是颜色词，按颜色盘一起认。`,
      `${sourceText} and ${targetText} are color words, so learn them as one color palette.`,
    );
  }
  if (categoryId === "shopping") {
    return text(
      `${sourceText} 和 ${targetText} 都在买东西这条线上，按商店、超市、价格、付款一起认。`,
      `${sourceText} and ${targetText} belong to the shopping line: store, supermarket, price, and payment.`,
    );
  }
  if (categoryId === "directions-position") {
    return text(
      `${sourceText} 和 ${targetText} 都是问路/看位置时会用到的方向词，按左、右、直走、远近和相对位置一起认。`,
      `${sourceText} and ${targetText} are direction or position words for finding your way: left, right, straight, distance, and relative position.`,
    );
  }
  if (categoryId === "furniture") {
    return text(
      `${sourceText} 和 ${targetText} 都是家里能直接看到的家具/物件，按房间里的东西一起认。`,
      `${sourceText} and ${targetText} are home furniture or objects, grouped by what you see in a room.`,
    );
  }
  if (categoryId === "home-rooms-fixtures") {
    return text(
      `${sourceText} 和 ${targetText} 都是家里房间或固定设施词，按进屋能看到/会用到的位置一起认。`,
      `${sourceText} and ${targetText} are home rooms or fixtures, grouped by places and built-in things you use at home.`,
    );
  }
  if (categoryId === "cleaning-basic") {
    return text(
      `${sourceText} 和 ${targetText} 都在清洁/收拾这条线上，按洗、擦、晾干、整理一起认。`,
      `${sourceText} and ${targetText} belong to the cleaning and tidying line: washing, drying, and putting things in order.`,
    );
  }
  if (categoryId === "clothes") {
    return text(
      `${sourceText} 和 ${targetText} 都是衣物词，按穿在身上的东西一起认。`,
      `${sourceText} and ${targetText} are clothing words, grouped by things you wear.`,
    );
  }
  if (categoryId === "kitchen-tableware") {
    return text(
      `${sourceText} 和 ${targetText} 都是厨房/餐桌物件，按吃饭时会拿起来用的东西一起认。`,
      `${sourceText} and ${targetText} are kitchen or tableware items, grouped by things used at meals.`,
    );
  }
  if (categoryId === "drink-containers") {
    return text(
      `${sourceText} 和 ${targetText} 都是盛饮料/喝东西会用到的容器，按瓶子、玻璃杯、杯子、小杯这一组一起认。`,
      `${sourceText} and ${targetText} are drink containers: bottle, glass, cup, and small cup.`,
    );
  }
  if (categoryId === "nature-city") {
    return text(
      `${sourceText} 和 ${targetText} 都是户外环境词，按城市和自然场景里会看到的东西一起认。`,
      `${sourceText} and ${targetText} are outdoor environment words, grouped by city and nature scenes.`,
    );
  }
  if (categoryId === "measurements") {
    return text(
      `${sourceText} 和 ${targetText} 都是数量/尺寸单位词，按买东西、量东西时会用到的单位一起认。`,
      `${sourceText} and ${targetText} are quantity or measurement words, useful when buying or measuring things.`,
    );
  }
  if (categoryId === "sports-leisure") {
    return text(
      `${sourceText} 和 ${targetText} 都是运动/休闲动作，按业余活动一起认。`,
      `${sourceText} and ${targetText} are sport or leisure actions, grouped as free-time activities.`,
    );
  }
  if (categoryId === "daily-verbs") {
    return text(
      `${sourceText} 和 ${targetText} 都是日常动作词，按一天里真实会做的动作一起认。`,
      `${sourceText} and ${targetText} are everyday action verbs, grouped by actions you actually do in a day.`,
    );
  }
  if (categoryId === "walking-running-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在移动方式这条线上：lopen 是走路/行走，wandelen 偏散步，hardlopen/rennen 是跑。`,
      `${sourceText} and ${targetText} belong to movement: lopen is walking, wandelen is strolling, hardlopen/rennen are running.`,
    );
  }
  if (categoryId === "basic-sports-hobbies") {
    return text(
      `${sourceText} 和 ${targetText} 都是基础运动/爱好词，按“空闲时做什么”这一组一起认。`,
      `${sourceText} and ${targetText} are basic sports or hobby words, grouped by what you do in your free time.`,
    );
  }
  if (categoryId === "morning-routine") {
    return text(
      `${sourceText} 和 ${targetText} 都在早上/日常作息里，按起床、洗澡、吃饭、穿衣这一条线一起认。`,
      `${sourceText} and ${targetText} belong to a daily routine: getting up, showering, eating, and getting dressed.`,
    );
  }
  if (categoryId === "basic-action-pairs") {
    return text(
      `${sourceText} 和 ${targetText} 都是基础动作词，按“拿来/带走/留下/练习/觉得”这些常用动作一起认。`,
      `${sourceText} and ${targetText} are basic action words, grouped by common actions like bring, fetch, stay, practice, and find/feel.`,
    );
  }
  if (categoryId === "dressing-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都在穿衣这条线上：衣服本身和穿上、脱下、穿着这些动作一起记。`,
      `${sourceText} and ${targetText} belong to getting dressed: clothes plus putting on, taking off, and wearing.`,
    );
  }
  if (categoryId === "school-supplies") {
    return text(
      `${sourceText} 和 ${targetText} 都是上课/练习时会碰到的学校用品或学习词，按教室桌面一起认。`,
      `${sourceText} and ${targetText} are classroom or study words, grouped by what you use in lessons and practice.`,
    );
  }
  if (categoryId === "birthday-party") {
    return text(
      `${sourceText} 和 ${targetText} 都在生日、聚会、来访或假期这条生活事件线上。`,
      `${sourceText} and ${targetText} belong to birthdays, parties, visits, or holidays.`,
    );
  }
  if (categoryId === "family-life-events") {
    return text(
      `${sourceText} 和 ${targetText} 都在家庭关系和人生状态这条线上：伴侣、同居、出生、分开。`,
      `${sourceText} and ${targetText} belong to family relationships and life events: partner, living together, birth, and separation.`,
    );
  }
  if (categoryId === "first-aid-basic") {
    return text(
      `${sourceText} 和 ${targetText} 都是小伤口/基础急救词，按创可贴、绷带、滴剂、割伤、烫伤和痒痛一起认。`,
      `${sourceText} and ${targetText} are basic first-aid words: plaster, bandage, drops, cuts, burns, itching, and pain.`,
    );
  }
  if (categoryId === "basic-feelings-needs") {
    return text(
      `${sourceText} 和 ${targetText} 都是基础感受或身体需求词，按开心、害怕、饿、渴、困醒这一组一起认。`,
      `${sourceText} and ${targetText} are basic feelings or body-need words: happy, afraid, hungry, thirsty, awake, and tired.`,
    );
  }
  if (categoryId === "emotions-states") {
    return text(
      `${sourceText} 和 ${targetText} 都是情绪/状态词，适合按一个人的当下感觉一起认。`,
      `${sourceText} and ${targetText} are feeling or state words, grouped by how someone feels right now.`,
    );
  }
  if (categoryId === "marital-status") {
    return text(
      `${sourceText} 和 ${targetText} 都是表格里“婚姻状况/家庭状态”的选项，适合放在同一组记。`,
      `${sourceText} and ${targetText} are marital or family-status options on forms, so they belong in one set.`,
    );
  }
  if (categoryId === "naming-words") {
    return text(
      `${sourceText} 和 ${targetText} 都在“名字/称呼”这条线上：naam 是名字，heten 是某人叫什么，noemen 是把人或事称作/提到。`,
      `${sourceText} and ${targetText} sit on the naming line: naam is name, heten is what someone is called, noemen is to call/name or mention.`,
    );
  }
  if (categoryId === "language-skills") {
    return text(
      `${sourceText} 和 ${targetText} 都是语言动作：听、说、读、写、理解，按技能组一起认。`,
      `${sourceText} and ${targetText} are language actions: listening, speaking, reading, writing, or understanding.`,
    );
  }
  if (categoryId === "digital-click-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都在 app/网页操作里：点击、按钮、链接、打开和关闭。`,
      `${sourceText} and ${targetText} belong to app/web actions: click, button, link, open, and close.`,
    );
  }
  if (categoryId === "formal-email-writing") {
    return text(
      `${sourceText} 和 ${targetText} 都是正式邮件/读写里的结构词，能帮你读懂或写清一段内容。`,
      `${sourceText} and ${targetText} are structure words for formal email or reading/writing tasks.`,
    );
  }
  if (categoryId === "text-reading") {
    return text(
      `${sourceText} 和 ${targetText} 都是读文本时抓结构的词，适合按“段落、主题、总结、例子”来记。`,
      `${sourceText} and ${targetText} both help read text structure: paragraphs, topics, summaries, and examples.`,
    );
  }
  if (categoryId === "opinion-argument") {
    return text(
      `${sourceText} 和 ${targetText} 都在表达观点/理由时用，放在一起能组成 B1 写作和口语框架。`,
      `${sourceText} and ${targetText} both support giving opinions and reasons in B1 writing and speaking.`,
    );
  }
  if (categoryId === "education-exam") {
    return text(
      `${sourceText} 和 ${targetText} 都在课程、考试或学习任务里出现，能一起组织学习场景。`,
      `${sourceText} and ${targetText} both appear in course, exam, or study tasks.`,
    );
  }
  if (categoryId === "business-workplace" || categoryId === "job-search") {
    return text(
      `${sourceText} 和 ${targetText} 都是工作/求职里的真实词，能一起说明岗位、经验或工作条件。`,
      `${sourceText} and ${targetText} both belong to real work or job-search language.`,
    );
  }
  if (categoryId === "transport-disruption") {
    return text(
      `${sourceText} 和 ${targetText} 都在交通变化或延误信息里出现，能一起帮你读懂出行通知。`,
      `${sourceText} and ${targetText} both appear in transport disruption information.`,
    );
  }
  if (categoryId === "digital-account-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都在账号登录/线上办事流程里出现，按步骤一起记更稳。`,
      `${sourceText} and ${targetText} both appear in account or digital-service steps.`,
    );
  }
  if (categoryId === "healthcare-route") {
    return text(
      `${sourceText} 和 ${targetText} 都在看病、转诊、拿药这条流程里，按“就医路线”一起认。`,
      `${sourceText} and ${targetText} belong to the doctor-referral-medicine route.`,
    );
  }
  if (categoryId === "digital-form-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都是填表/上传材料时会碰到的操作词，按表单动作一起记。`,
      `${sourceText} and ${targetText} are form or document-upload actions.`,
    );
  }
  if (categoryId === "email-status-flow") {
    return text(
      `${sourceText} 和 ${targetText} 都在邮件/消息流程里，按发件、收件、草稿、已发送这些状态一起认。`,
      `${sourceText} and ${targetText} belong to the email/message flow: sender, receiver, draft, sent, and folders.`,
    );
  }
  if (categoryId === "order-return-flow") {
    return text(
      `${sourceText} 和 ${targetText} 都在下单、配送、退换货这条线上，适合按购物售后流程记。`,
      `${sourceText} and ${targetText} belong to the order, delivery, return, and service flow.`,
    );
  }
  if (categoryId === "complaint-repair-flow") {
    return text(
      `${sourceText} 和 ${targetText} 都在投诉、损坏、原因结果和维修处理这条线上。`,
      `${sourceText} and ${targetText} belong to the complaint, damage, cause-effect, and repair flow.`,
    );
  }
  if (categoryId === "transport-route-flow") {
    return text(
      `${sourceText} 和 ${targetText} 都在出行信息线上：站台、轨道、延误、改道、查票或车次变化。`,
      `${sourceText} and ${targetText} belong to travel information: platforms, tracks, delays, diversions, ticket checks, or service changes.`,
    );
  }
  if (categoryId === "sick-leave-flow") {
    return text(
      `${sourceText} 和 ${targetText} 都在感冒、病假、职业健康服务和复工这条线上。`,
      `${sourceText} and ${targetText} belong to the cold, sick leave, occupational health, and return-to-work flow.`,
    );
  }
  if (categoryId === "symptom-treatment-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在“症状 -> 检查 -> 用药/处理”这条看病线上，适合按身体反应和治疗动作一起记。`,
      `${sourceText} and ${targetText} sit on the symptom, check, and treatment line.`,
    );
  }
  if (categoryId === "body-medical-series") {
    return text(
      `${sourceText} 和 ${targetText} 都是身体部位或医疗角色/地点词，适合按“身体和照护”一起认。`,
      `${sourceText} and ${targetText} are body or care-related medical words.`,
    );
  }
  if (categoryId === "housing-repair-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在租房、住房状态、维修和报修这条线上。`,
      `${sourceText} and ${targetText} belong to the housing, repair, and maintenance line.`,
    );
  }
  if (categoryId === "school-childcare-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在学校/儿童照护这条线上：老师、同学、课程、假期、报名或许可。`,
      `${sourceText} and ${targetText} belong to the school and childcare line.`,
    );
  }
  if (categoryId === "work-contract-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在工作、合同、排班和工资这条线上，适合按职场材料一起记。`,
      `${sourceText} and ${targetText} belong to the work, contract, schedule, and pay line.`,
    );
  }
  if (categoryId === "text-structure-series") {
    return text(
      `${sourceText} 和 ${targetText} 都是读写文本时抓结构的词：主题、细节、段落、连接和表达方式。`,
      `${sourceText} and ${targetText} are text-structure words for reading and writing.`,
    );
  }
  if (categoryId === "civic-safety-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在报警、求助、安全和公共管理这条线上。`,
      `${sourceText} and ${targetText} belong to the report, help, safety, and public-service line.`,
    );
  }
  if (categoryId === "weather-climate-series") {
    return text(
      `${sourceText} 和 ${targetText} 都是天气或气候词，适合按天气预报一起记。`,
      `${sourceText} and ${targetText} belong to weather or climate vocabulary.`,
    );
  }
  if (categoryId === "travel-airport-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在旅行证件、边检、行李和预订这条线上。`,
      `${sourceText} and ${targetText} belong to travel documents, border control, baggage, and booking.`,
    );
  }
  if (categoryId === "tax-income-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在税务、收入和补贴这条线上，适合按办税材料一起记。`,
      `${sourceText} and ${targetText} belong to the tax, income, and benefits line.`,
    );
  }
  if (categoryId === "finance-bank-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在银行、账户、付款和预算这条线上。`,
      `${sourceText} and ${targetText} belong to the banking, account, payment, and budget line.`,
    );
  }
  if (categoryId === "formal-contact-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在正式邮件/书面联系里，按称呼、主题、正文和结尾一起认。`,
      `${sourceText} and ${targetText} belong to formal written contact: address, subject, body, and closing.`,
    );
  }
  if (categoryId === "phone-service-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在电话沟通/客服转接这条线上。`,
      `${sourceText} and ${targetText} belong to the phone contact and service-transfer line.`,
    );
  }
  if (categoryId === "identity-admin-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在身份信息、市政登记或官方材料这条线上。`,
      `${sourceText} and ${targetText} belong to identity, registration, and official-document vocabulary.`,
    );
  }
  if (categoryId === "social-relation-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在关系、信任、误会、争执或互相支持这条线上。`,
      `${sourceText} and ${targetText} belong to relationships, trust, misunderstanding, conflict, or support.`,
    );
  }
  if (categoryId === "media-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在媒体/信息来源这条线上。`,
      `${sourceText} and ${targetText} belong to the media and information-source line.`,
    );
  }
  if (categoryId === "attendance-status") {
    return text(
      `${sourceText} 和 ${targetText} 都在出勤状态这条线上：在场、缺席、请假和相关记录。`,
      `${sourceText} and ${targetText} belong to attendance status: present, absent, leave, and related records.`,
    );
  }
  if (categoryId === "choice-opinion") {
    return text(
      `${sourceText} 和 ${targetText} 都在选择/意见这条线上：想要、选择、觉得和是否合适。`,
      `${sourceText} and ${targetText} belong to choice and opinion: wanting, choosing, thinking, and suitability.`,
    );
  }
  if (categoryId === "art-culture-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在艺术、文化、展览或演出这条线上。`,
      `${sourceText} and ${targetText} belong to the art, culture, exhibition, or performance line.`,
    );
  }
  if (categoryId === "environment-society-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在环境、污染、气候或可持续这条线上。`,
      `${sourceText} and ${targetText} belong to environment, pollution, climate, or sustainability vocabulary.`,
    );
  }
  if (categoryId === "society-participation-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在社会参与、平等或社区议题这条线上。`,
      `${sourceText} and ${targetText} belong to society, equality, or community participation vocabulary.`,
    );
  }
  if (categoryId === "personal-quality-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在性格、习惯、能力或态度这条线上。`,
      `${sourceText} and ${targetText} belong to personality, habit, ability, or attitude vocabulary.`,
    );
  }
  if (categoryId === "interest-motivation-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在兴趣/动机这条线上；如果有 interesse/interessant/interesseren 这种同词根，先按词族记。`,
      `${sourceText} and ${targetText} sit on the interest/motivation line; when interesse/interessant/interesseren share the root, learn the word family first.`,
    );
  }
  if (categoryId === "practical-problem-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在实际问题处理里：哪里不对、是否合适、怎么修正或继续。`,
      `${sourceText} and ${targetText} belong to practical problem handling: what is wrong, whether it fits, and how to fix it.`,
    );
  }
  if (categoryId === "cleaning-household") {
    return text(
      `${sourceText} 和 ${targetText} 都是清洁/家务动作或工具词，适合按家务流程一起记。`,
      `${sourceText} and ${targetText} are cleaning or household-action words.`,
    );
  }
  if (categoryId === "legal-safety") {
    return text(
      `${sourceText} 和 ${targetText} 都在报警、安全、证人、执法或紧急服务这条线上。`,
      `${sourceText} and ${targetText} belong to reporting, safety, witnesses, enforcement, or emergency services.`,
    );
  }
  if (categoryId === "official-admin-extended") {
    return text(
      `${sourceText} 和 ${targetText} 都是官方办事材料里的身份、申请、编号或有效状态词。`,
      `${sourceText} and ${targetText} are official-administration words for identity, applications, numbers, or validity.`,
    );
  }
  if (categoryId === "communication-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都是联系别人时会用到的动作或消息词。`,
      `${sourceText} and ${targetText} are contact, message, or communication-action words.`,
    );
  }
  if (categoryId === "past-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都是常见完成式/过去动作词，看到 ge- 形式时要回到对应动作线。`,
      `${sourceText} and ${targetText} are common completed-action forms; connect ge- forms back to their action line.`,
    );
  }
  if (categoryId === "body-appearance") {
    return text(
      `${sourceText} 和 ${targetText} 都在外貌、身体表现或穿戴这条线上。`,
      `${sourceText} and ${targetText} belong to appearance, body expression, or getting dressed.`,
    );
  }
  if (categoryId === "graph-data") {
    return text(
      `${sourceText} 和 ${targetText} 都是读表格、图表或数据说明时会碰到的词。`,
      `${sourceText} and ${targetText} appear in charts, tables, or data descriptions.`,
    );
  }
  if (categoryId === "b1-connectors") {
    return text(
      `${sourceText} 和 ${targetText} 都是 B1 写作/口语里连接句子逻辑的词。`,
      `${sourceText} and ${targetText} are B1 connectors for linking sentence logic.`,
    );
  }
  if (categoryId === "appointment-planning-series") {
    return text(
      `${sourceText} 和 ${targetText} 都在预约/日程调整这条线上：时间、日期、日程、改期或另一个时间。`,
      `${sourceText} and ${targetText} belong to appointment planning: time, date, agenda, rescheduling, or another slot.`,
    );
  }
  if (categoryId === "rail-transport" || categoryId === "transport") {
    return text(
      `${sourceText} 和 ${targetText} 都在交通出行这条线上，能一起帮你读路线、站点、换乘或检票信息。`,
      `${sourceText} and ${targetText} belong to transport: routes, stops, transfers, or ticket checks.`,
    );
  }
  if (categoryId === "health") {
    return text(
      `${sourceText} 和 ${targetText} 都是健康/就医词，适合按身体状态、医生和处理方式一起认。`,
      `${sourceText} and ${targetText} are health or care words: body state, doctor, and handling.`,
    );
  }
  if (categoryId === "complaint") {
    return text(
      `${sourceText} 和 ${targetText} 都在投诉/问题处理里，按问题、原因、结果和解决一起记。`,
      `${sourceText} and ${targetText} belong to complaint/problem handling: problem, cause, result, and solution.`,
    );
  }
  if (categoryId === "payment") {
    return text(
      `${sourceText} 和 ${targetText} 都在付款/账务这条线上，能一起帮你看懂金额、账户、扣款或退款。`,
      `${sourceText} and ${targetText} belong to payment/account language: amounts, accounts, charges, or refunds.`,
    );
  }
  if (categoryId === "housing") {
    return text(
      `${sourceText} 和 ${targetText} 都在住房/租房这条线上，适合按地址、房屋、租金和空间一起记。`,
      `${sourceText} and ${targetText} belong to housing and renting: address, home, rent, and space.`,
    );
  }
  if (categoryId === "forms-documents") {
    return text(
      `${sourceText} 和 ${targetText} 都是表格/材料词，提交材料时经常需要一起判断。`,
      `${sourceText} and ${targetText} are form/document words often handled together when submitting materials.`,
    );
  }
  if (categoryId === "email-message") {
    return text(
      `${sourceText} 和 ${targetText} 都在邮件/消息结构里，按发出、收到、附件、主题和文件夹一起认。`,
      `${sourceText} and ${targetText} belong to email/message structure: send, receive, attachment, subject, and folders.`,
    );
  }
  if (categoryId === "phone-contact" || categoryId === "contact-info") {
    return text(
      `${sourceText} 和 ${targetText} 都在联系信息/电话沟通里，按号码、消息和联系动作一起认。`,
      `${sourceText} and ${targetText} belong to contact information or phone communication.`,
    );
  }
  if (categoryId === "residence-location") {
    return text(
      `${sourceText} 和 ${targetText} 都在住址/地点信息里，适合按地址、城市、街道和区域一起记。`,
      `${sourceText} and ${targetText} belong to residence/location information.`,
    );
  }
  if (categoryId === "places-services") {
    return text(
      `${sourceText} 和 ${targetText} 都是公共地点/服务地点词，适合按城市里会去的地方一起认。`,
      `${sourceText} and ${targetText} are public place or service-location words.`,
    );
  }
  if (categoryId === "shops-services-people") {
    return text(
      `${sourceText} 和 ${targetText} 都是店铺服务/服务人员词，按办事时会遇到的人一起记。`,
      `${sourceText} and ${targetText} are shop/service-person words.`,
    );
  }
  if (categoryId === "technology") {
    return text(
      `${sourceText} 和 ${targetText} 都在手机、电脑或网页操作里，按数字工具一起记。`,
      `${sourceText} and ${targetText} belong to phone, computer, or web-tool language.`,
    );
  }
  if (categoryId === "travel-documents") {
    return text(
      `${sourceText} 和 ${targetText} 都在旅行证件/出行材料里，按旅行前要准备的东西一起认。`,
      `${sourceText} and ${targetText} belong to travel documents and trip preparation.`,
    );
  }
  if (categoryId === "tax-benefit") {
    return text(
      `${sourceText} 和 ${targetText} 都在税务/补贴材料里，按收入、申报、退税和预付款一起记。`,
      `${sourceText} and ${targetText} belong to tax/benefit documents: income, filing, refunds, and advances.`,
    );
  }
  if (categoryId === "shopping-service") {
    return text(
      `${sourceText} 和 ${targetText} 都在网购/客服/售后这条线上，按库存、订单、配送、退换和保修一起认。`,
      `${sourceText} and ${targetText} belong to shopping, service, stock, orders, delivery, returns, and warranty.`,
    );
  }
  if (categoryId === "sick-leave") {
    return text(
      `${sourceText} 和 ${targetText} 都在请病假/复工这条线上，按生病、通知、缺勤和恢复一起认。`,
      `${sourceText} and ${targetText} belong to sick-leave and return-to-work language.`,
    );
  }
  if (categoryId === "admin-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都是办事/表格里常见的处理动作，按申请、接受、拒绝、修改和核对一起认。`,
      `${sourceText} and ${targetText} are administration actions: apply, accept, refuse, change, or check.`,
    );
  }
  if (categoryId === "practical-actions") {
    return text(
      `${sourceText} 和 ${targetText} 都是实际办事动作，按“我接下来要做什么”这条线一起记。`,
      `${sourceText} and ${targetText} are practical action words, useful for what to do next.`,
    );
  }
  if (categoryId === "descriptive-states") {
    return text(
      `${sourceText} 和 ${targetText} 都是描述状态/判断的词，适合按“是否合适、正常、清楚、重要”一起认。`,
      `${sourceText} and ${targetText} are descriptive state or judgement words.`,
    );
  }
  if (categoryId === "daily-objects") {
    return text(
      `${sourceText} 和 ${targetText} 都是日常随身/桌面物件，按出门或学习时会摸到的东西一起认。`,
      `${sourceText} and ${targetText} are everyday carry or desk objects, grouped by things you touch when going out or studying.`,
    );
  }
  if (categoryId === "office-basics") {
    return text(
      `${sourceText} 和 ${targetText} 都是办公室/课堂里常见的物件或处理词，按桌面、文件和小错误一起认。`,
      `${sourceText} and ${targetText} are office or classroom basics, grouped by desks, documents, and small mistakes.`,
    );
  }
  if (categoryId === "grammar-small-words") {
    return text(
      `${sourceText} 和 ${targetText} 都是小功能词，别只按中文意思死记，要放进真实句子里看它怎么指代或连接。`,
      `${sourceText} and ${targetText} are small function words; don't memorize only by English meaning, see how they point or connect inside sentences.`,
    );
  }
  if (categoryId === "civic-participation" || categoryId === "neighborhood-services") {
    return text(
      `${sourceText} 和 ${targetText} 都在社区/公共服务/社会参与这条线上。`,
      `${sourceText} and ${targetText} belong to community, public services, or civic participation.`,
    );
  }
  if (categoryId === "language-services") {
    return text(
      `${sourceText} 和 ${targetText} 都在语言学习、翻译或理解这条线上。`,
      `${sourceText} and ${targetText} belong to language learning, translation, or understanding.`,
    );
  }
  if (categoryId === "learning-level") {
    return text(
      `${sourceText} 和 ${targetText} 都在学习等级/课程这条线上，按初学者、水平、课程、练习一起认。`,
      `${sourceText} and ${targetText} belong to the learning-level line: beginner, level, course, lesson, and practice.`,
    );
  }
  if (categoryId === "work") {
    return text(
      `${sourceText} 和 ${targetText} 都是工作基础词，适合按工作、岗位和同事一起认。`,
      `${sourceText} and ${targetText} are basic work words: work, job, workplace, and colleagues.`,
    );
  }
  return undefined;
}

const pronounMeanings: Record<string, LocalizedText> = {
  ik: text("我（主语）", "I as subject"),
  mij: text("我（宾语，强调）", "me as object, stressed"),
  me: text("我（宾语，弱读）", "me as object, unstressed"),
  mijn: text("我的", "my"),
  wij: text("我们（主语，强调）", "we as subject, stressed"),
  we: text("我们（主语，弱读）", "we as subject, unstressed"),
  ons: text("我们 / 我们的（het 词）", "us / our with het-words"),
  onze: text("我们的（de 词）", "our with de-words"),
  jij: text("你（主语，强调）", "you as subject, stressed"),
  je: text("你 / 你的（弱读）", "you / your, unstressed"),
  jou: text("你（宾语，强调）", "you as object, stressed"),
  jouw: text("你的（强调）", "your, stressed"),
  u: text("您（礼貌说法）", "you, polite"),
  uw: text("您的（礼貌说法）", "your, polite"),
  jullie: text("你们 / 你们的", "you plural / your plural"),
  hij: text("他（主语）", "he as subject"),
  hem: text("他（宾语）", "him"),
  zijn: text("他的 / 是", "his / to be"),
  zij: text("她 / 他们（强调）", "she / they, stressed"),
  ze: text("她 / 他们（弱读）", "she / they, unstressed"),
  haar: text("她 / 她的", "her"),
  hen: text("他们（宾语）", "them as object"),
  hun: text("他们的 / 给他们", "their / to them"),
};

const pronounFamilies: Record<string, string[]> = {
  ik: ["mij", "me", "mijn", "wij", "we", "ons", "onze"],
  mij: ["ik", "me", "mijn", "wij", "we", "ons", "onze"],
  me: ["ik", "mij", "mijn", "wij", "we", "ons", "onze"],
  mijn: ["ik", "mij", "me", "wij", "we", "ons", "onze"],
  wij: ["we", "ons", "onze", "ik", "mijn"],
  we: ["wij", "ons", "onze", "ik", "mijn"],
  ons: ["wij", "we", "onze", "ik", "mijn"],
  onze: ["wij", "we", "ons", "ik", "mijn"],
  jij: ["je", "jou", "jouw", "u", "uw", "jullie"],
  je: ["jij", "jou", "jouw", "u", "uw", "jullie"],
  jou: ["jij", "je", "jouw", "u", "uw", "jullie"],
  jouw: ["jij", "je", "jou", "u", "uw", "jullie"],
  u: ["uw", "jij", "je", "jou", "jouw", "jullie"],
  uw: ["u", "jij", "je", "jouw", "jullie"],
  jullie: ["jij", "je", "jou", "jouw", "u", "uw"],
  hij: ["hem", "zijn", "zij", "ze"],
  hem: ["hij", "zijn"],
  zijn: ["hij", "hem"],
  zij: ["ze", "haar", "hen", "hun"],
  ze: ["zij", "haar", "hen", "hun"],
  haar: ["zij", "ze"],
  hen: ["zij", "ze", "hun"],
  hun: ["zij", "ze", "hen"],
};

const looseGeneratedRelationTypes = new Set<MemoryRelationType>(["scenario-word", "action-object", "state-action"]);
const technicalReasonPattern =
  /安全拆出|安全回到|意思部件|核心部件|真实词根\/部件|语义桶|校验|显式关联词|规则筛选|同一个生活任务|component word|meaningful part|safely links|passed the semantic bucket|role-aware|same real-life task/i;

const looksLikeExplanationTarget = (value: string) =>
  /^(looks like|means|close to|same as|related to)\b/i.test(value.trim()) ||
  /^(de|het|een)\s+/i.test(value.trim()) ||
  /[.!?]$/.test(value.trim()) ||
  value.trim().split(/\s+/).length > 1;

const isContrastReason = (reason: string) =>
  /区别|不要混|容易混|不同|不是|confus|different|not the same|noun|verb|名词|动词/i.test(reason);

const isUsefulManualLink = (source: WordItem, link: MemoryLink) => {
  if (link.type === "english-bridge") return false;
  const relationType = legacyTypeMap[link.type] ?? "word-family";
  if (looseGeneratedRelationTypes.has(relationType)) return false;
  const reason = `${link.explanation?.zh ?? ""} ${link.explanation?.en ?? ""}`.trim();
  if (!link.dutch.trim() || looksLikeExplanationTarget(link.dutch) || !reason || weakManualReasonPattern.test(reason)) return false;
  if ((link.type === "article-family" || link.type === "plural-family") && (!source.article || /\s/.test(source.dutch))) return false;
  if ((link.type === "confusion-pair" || link.type === "similar") && !isContrastReason(reason)) return false;
  return true;
};

function manualRelationTypeFor(link: MemoryLink): MemoryRelationType {
  const reason = `${link.explanation?.zh ?? ""} ${link.explanation?.en ?? ""}`.toLowerCase();
  if (/ik\/命令形式|命令形式|imperative form|ik form/.test(reason)) return "verb-form";
  if (/名词.*动词|动词.*名词|noun.*verb|verb.*noun/.test(reason)) return "verb-noun-pair";
  return legacyTypeMap[link.type] ?? "word-family";
}

function manualLinksFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return (selected.memoryLinks ?? [])
    .filter((link) => isUsefulManualLink(selected, link))
    .map((link) => {
      const relationType = manualRelationTypeFor(link);
      const match = wordByDutch.get(normalizeDutch(link.dutch));
      const extensionMeaning = relationLexicons.baseMorphemes[normalizeDutch(link.dutch) as keyof typeof relationLexicons.baseMorphemes];
      const usefulExtensionMeaning = extensionMeaning?.zh || extensionMeaning?.en ? extensionMeaning : undefined;
      return {
        dutch: link.dutch,
        wordId: match?.id,
        meaning: match?.meaning ?? usefulExtensionMeaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: !match && Boolean(usefulExtensionMeaning),
        isExtensionTarget: !match && Boolean(usefulExtensionMeaning),
        source: match ? "manual" : "extension",
        type: relationType,
        kind: relationFallbackLabels[relationType],
        reason: link.explanation,
      };
    });
}

function goldenAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const relations = goldenMemoryRelations[normalizeDutch(selected.dutch)] ?? [];
  if (!relations.length) return [];
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return relations
    .filter((relation) => relation.showToLearner !== false && relation.needsHumanReview !== true)
    .map((relation) => {
      const targetKey = normalizeDutch(relation.targetText);
      const match = wordByDutch.get(targetKey);
      const extensionMeaning = relationLexicons.baseMorphemes[targetKey as keyof typeof relationLexicons.baseMorphemes];
      const usefulExtensionMeaning = extensionMeaning?.zh || extensionMeaning?.en ? extensionMeaning : undefined;
      const relationType = (legacyTypeMap[relation.relationType as MemoryLinkType] ?? relation.relationType) as MemoryRelationType;
      return {
        dutch: relation.targetText,
        wordId: match?.id,
        meaning: match?.meaning ?? usefulExtensionMeaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: !match && Boolean(usefulExtensionMeaning),
        isExtensionTarget: !match && Boolean(usefulExtensionMeaning),
        source: "manual" as const,
        type: relationType,
        kind: text(relation.labelZh, relation.labelEn),
        reason: text(relation.reasonZh, relation.reasonEn),
      } satisfies WordAssociation;
    })
    .filter((association) => association.targetExistsInVocabulary || association.isExtensionWord || association.meaning?.zh || association.meaning?.en);
}

function phraseComponentReasonFor(sourceKey: string, token: string, targetText: string, sourceText: string) {
  if (sourceKey === "een beetje" && token === "een") {
    return text(
      "een 在这里不用当冠词硬背，先把它看成“一点点”里的“一”。",
      "In een beetje, read een as the one/a piece inside a little bit rather than overthinking the article.",
    );
  }
  if (sourceKey === "een beetje" && token === "beetje") {
    return text(
      "beetje 是“小点/一点”。een + beetje 合起来，就是“一点点”。",
      "beetje means little bit. een + beetje gives you a little bit.",
    );
  }
  if (sourceKey === "tot ziens" && token === "tot") {
    return text(
      "tot 是“到/直到”。tot ziens 整块可以想成“到再见那一刻/回头见”。",
      "tot means to/until. Read tot ziens as a fixed goodbye chunk, roughly until seeing you again.",
    );
  }
  if (sourceKey === "tot ziens" && token === "ziens") {
    return text(
      "ziens 是这个固定告别短语里的“见”这一块。不要单独硬背，先把 tot ziens 当成“回头见”。",
      "ziens is the seeing piece inside this fixed goodbye phrase. Do not memorize it alone; learn tot ziens as see you.",
    );
  }
  if ((sourceKey === "dank je" || sourceKey === "dank u") && token === "dank") {
    return text(
      "dank 是“感谢/谢意”这块。dank je 是日常谢谢你，dank u 是更礼貌的谢谢您。",
      "dank carries thanks/gratitude. dank je is everyday thank you; dank u is the polite form.",
    );
  }
  if (sourceKey === "dank je" && token === "je") {
    return text(
      "je 是日常弱读的“你”。dank + je 合起来，就是对熟人或日常场景说“谢谢你”。",
      "je is the everyday unstressed you. dank + je gives you a casual thank you.",
    );
  }
  if (sourceKey === "dank u" && token === "u") {
    return text(
      "u 是礼貌的“您”。dank + u 合起来，就是更正式的“谢谢您”。",
      "u is formal you. dank + u gives you the polite thank you.",
    );
  }
  if (sourceKey === "kom uit" && token === "kom") {
    return text(
      "kom 在 kom uit 里是 komen 的短形式，意思是“来/过来”；不是 de kom 这个“碗”。",
      "kom in kom uit is the short form of komen, meaning come; it is not the noun de kom, bowl.",
    );
  }
  if (sourceKey === "kom uit" && token === "uit") {
    return text(
      "uit 在 kom uit 里标来源：从哪里来。kom + uit 合起来，就是“来自”。",
      "uit marks origin inside kom uit: where someone comes from. kom + uit means come from.",
    );
  }
  return text(
    `${sourceText} 里有 ${targetText} 这一小块。先认出它，再把整块短语拿去用。`,
    `${sourceText} contains the small piece ${targetText}. Recognize it first, then use the whole phrase as a chunk.`,
  );
}

function phraseComponentAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const sourceKey = normalizeDutch(sourceText);
  const explicitComponents = phraseComponentMeanings[sourceKey] ?? {};
  const tokens = Array.from(sourceText.matchAll(phraseTokenPattern), (match) => normalizeDutch(match[0]))
    .filter(Boolean);
  const uniqueTokens = Array.from(new Set(tokens));
  if (uniqueTokens.length < 2) return [];

  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return uniqueTokens.flatMap((token) => {
    if (phraseComponentStopwords.has(token) && !explicitComponents[token]) return [];
    const match = wordByDutch.get(token);
    const extensionMeaning = explicitComponents[token] ?? relationLexicons.baseMorphemes[token as keyof typeof relationLexicons.baseMorphemes];
    if (!match && !extensionMeaning) return [];

    const targetText = match?.dutch ?? token;
    const targetMeaning = explicitComponents[token] ?? match?.meaning ?? extensionMeaning;
    const targetExists = Boolean(match);
    return [{
      dutch: targetText,
      wordId: match?.id,
      meaning: targetMeaning,
      targetExistsInVocabulary: targetExists,
      isExtensionWord: !targetExists,
      isExtensionTarget: !targetExists,
      source: targetExists ? "rule" : "extension",
      type: "part-related",
      kind: phraseComponentKind,
      reason: phraseComponentReasonFor(sourceKey, token, targetText, sourceText),
    } satisfies WordAssociation];
  });
}

function pronounReasonFor(sourceText: string, targetText: string): LocalizedText {
  const source = normalizeDutch(sourceText);
  const target = normalizeDutch(targetText);
  if (source === "ik" && (target === "mijn" || target === "mij" || target === "me")) {
    return text(
      "ik 是“我”做主语；mijn/mij/me 是“我的/我”在别的位置。先把一整组“我”放一起记。",
      "ik is I as the subject; mijn/mij/me are my/me in other positions. Learn the whole I-family together.",
    );
  }
  if ((source === "jij" || source === "je") && ["jou", "jouw", "u", "uw", "jullie"].includes(target)) {
    return text(
      "jij/je 是“你”；jou/jouw 是“你/你的”，u/uw 是礼貌说法，jullie 是“你们”。这一组开口很常用。",
      "jij/je means you; jou/jouw are you/your, u/uw are polite, and jullie is you plural. This set is used constantly.",
    );
  }
  if (["wij", "we", "ons", "onze"].includes(source) || ["wij", "we", "ons", "onze"].includes(target)) {
    return text(
      "wij/we/ons/onze 都围绕“我们”。主语、宾语和“我们的”分开看，句子会稳很多。",
      "wij/we/ons/onze all orbit we/us/our. Separating subject, object, and our makes sentences much steadier.",
    );
  }
  return text(
    `${sourceText} 和 ${targetText} 是同一组代词变化。先按人称家族记，再放进句子里用。`,
    `${sourceText} and ${targetText} belong to the same pronoun family. Learn the person-family first, then use it in sentences.`,
  );
}

function pronounFamilyAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const sourceKey = normalizeDutch(sourceText);
  const targets = pronounFamilies[sourceKey];
  if (!targets) return [];

  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return targets.map((target) => {
    const match = wordByDutch.get(target);
    const targetText = match?.dutch ?? target;
    const targetExists = Boolean(match);
    return {
      dutch: targetText,
      wordId: match?.id,
      meaning: match?.meaning ?? pronounMeanings[target],
      targetExistsInVocabulary: targetExists,
      isExtensionWord: !targetExists,
      isExtensionTarget: !targetExists,
      source: targetExists ? "rule" : "extension",
      type: "pronoun-family",
      kind: relationFallbackLabels["pronoun-family"],
      reason: pronounReasonFor(sourceText, targetText),
    } satisfies WordAssociation;
  });
}

function dialogueSeriesReasonFor(sourceText: string, targetText: string): LocalizedText {
  const group = dialogueSeriesFor(sourceText)?.map(normalizeDutch) ?? [];
  if (group.includes("bedankt")) {
    return text(
      `${sourceText} 和 ${targetText} 属于谢谢、回应、道歉这一组，按对话来回一起认。`,
      `${sourceText} and ${targetText} belong to the thanks, reply, and apology set; learn them as dialogue turns.`,
    );
  }
  if (group.includes("goedemorgen")) {
    return text(
      `${sourceText} 和 ${targetText} 都是见面/告别入口，按一天里的问候顺序放一起。`,
      `${sourceText} and ${targetText} are greeting or goodbye entries; group them by the day and conversation flow.`,
    );
  }
  return text(
    `${sourceText} 和 ${targetText} 是对话里的小功能词，按肯定/否定这一组一起认。`,
    `${sourceText} and ${targetText} are small dialogue function words; learn them as the yes/no set.`,
  );
}

function dialogueSeriesAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const group = dialogueSeriesFor(sourceText);
  if (!group) return [];
  const sourceKey = normalizeDutch(sourceText);
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return group
    .filter((target) => normalizeDutch(target) !== sourceKey)
    .slice(0, 4)
    .map((target) => {
      const match = wordByDutch.get(normalizeDutch(target));
      const targetText = match?.dutch ?? target;
      return {
        dutch: targetText,
        wordId: match?.id,
        meaning: match?.meaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: !match,
        isExtensionTarget: !match,
        source: match ? "rule" : "extension",
        type: "semantic-series",
        kind: relationFallbackLabels["semantic-series"],
        reason: dialogueSeriesReasonFor(sourceText, targetText),
      } satisfies WordAssociation;
    });
}

function functionWordSeriesReasonFor(sourceText: string, targetText: string): LocalizedText {
  const group = functionWordSeriesFor(sourceText)?.map(normalizeDutch) ?? [];
  if (group.includes("bovendien")) {
    return text(
      `${sourceText} 和 ${targetText} 都是写作/表达里的连接词；按“补充、举例、排序、总结”这一组认。`,
      `${sourceText} and ${targetText} are connector words for writing/speaking; group them as adding, examples, ordering, and summarizing.`,
    );
  }
  if (group.includes("zodat")) {
    return text(
      `${sourceText} 和 ${targetText} 都在连接从句；重点看它们连接的是原因、目的、让步还是时间。`,
      `${sourceText} and ${targetText} connect clauses; focus on whether they mark cause, purpose, concession, or time.`,
    );
  }
  if (group.includes("wie")) {
    return text(
      `${sourceText} 和 ${targetText} 都是问句入口；按“问人、问事、问地点、问时间、问方式”这一组认。`,
      `${sourceText} and ${targetText} are question-word entries; group them by asking person, thing, place, time, or manner.`,
    );
  }
  if (group.includes("in")) {
    return text(
      `${sourceText} 和 ${targetText} 都是位置/方向/关系小词；别只按一个中文死记，要看后面接什么。`,
      `${sourceText} and ${targetText} are small position/direction/relation words; learn them by what follows, not one fixed translation.`,
    );
  }
  return text(
    `${sourceText} 和 ${targetText} 都是小功能词；按“连接句子”的功能一起认，不按中文逐字硬翻。`,
    `${sourceText} and ${targetText} are small function words; learn them by sentence-connection function, not by word-for-word translation.`,
  );
}

function functionWordSeriesAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const group = functionWordSeriesFor(sourceText);
  if (!group) return [];
  const sourceKey = normalizeDutch(sourceText);
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return group
    .filter((target) => normalizeDutch(target) !== sourceKey)
    .slice(0, 5)
    .map((target) => {
      const match = wordByDutch.get(normalizeDutch(target));
      const targetText = match?.dutch ?? target;
      return {
        dutch: targetText,
        wordId: match?.id,
        meaning: match?.meaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: !match,
        isExtensionTarget: !match,
        source: match ? "rule" : "extension",
        type: "semantic-series",
        kind: relationFallbackLabels["semantic-series"],
        reason: functionWordSeriesReasonFor(sourceText, targetText),
      } satisfies WordAssociation;
    });
}

function zijnFrameReasonFor(sourceText: string, targetText: string): LocalizedText {
  const sourceKey = normalizeDutch(sourceText);
  if (sourceKey === "ben") {
    return text(
      "ben 最先和 ik 绑住：ik ben。它们是“我……”开口框架。",
      "ben first binds to ik: ik ben. This is the basic I am opening frame.",
    );
  }
  if (sourceKey === "bent") {
    return text(
      "bent 常跟 jij/je/u 走：jij bent、u bent。先按主语搭子认。",
      "bent commonly goes with jij/je/u: jij bent, u bent. Learn it by subject partner.",
    );
  }
  return text(
    `is 常在 wat is / dit is / dat is / het is 这些开口里出现；${targetText} 是它的高频搭子。`,
    `is often appears in wat is / dit is / dat is / het is openings; ${targetText} is a frequent partner.`,
  );
}

function zijnFrameAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const sourceText = selected.dutch.trim();
  const targets = zijnFrameTargets[normalizeDutch(sourceText)];
  if (!targets) return [];
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return targets.map((target) => {
    const match = wordByDutch.get(target);
    const targetText = match?.dutch ?? target;
    return {
      dutch: targetText,
      wordId: match?.id,
      meaning: match?.meaning ?? pronounMeanings[target],
      targetExistsInVocabulary: Boolean(match),
      isExtensionWord: !match,
      isExtensionTarget: !match,
      source: match ? "rule" : "extension",
      type: "semantic-series",
      kind: relationFallbackLabels["semantic-series"],
      reason: zijnFrameReasonFor(sourceText, targetText),
    } satisfies WordAssociation;
  });
}

function relatedWordReasonFor(source: WordItem, targetText: string, target?: WordItem): LocalizedText {
  const sourceText = source.dutch;
  const sourceKey = normalizeDutch(sourceText);
  const targetKey = normalizeDutch(targetText);
  const targetMeaning = target?.meaning ?? relationLexicons.baseMorphemes[targetKey as keyof typeof relationLexicons.baseMorphemes];
  const targetZh = targetMeaning?.zh ? `（${targetMeaning.zh}）` : "";
  const targetEn = targetMeaning?.en ? ` (${targetMeaning.en})` : "";
  if (targetKey.length >= 3 && sourceKey.includes(targetKey) && sourceKey !== targetKey) {
    return text(
      `${sourceText} 里能看见 ${targetText}${targetZh} 这一小块。先抓住这块，再记整个词。`,
      `${sourceText} contains the small piece ${targetText}${targetEn}. Catch that piece first, then remember the whole word.`,
    );
  }
  const sharedTags = target
    ? source.scenarioTags.filter((tag) => target.scenarioTags.includes(tag))
    : [];
  if (isCloseGreetingPair(sourceText, targetText)) {
    const group = closeGreetingGroupFor(sourceText)?.map(normalizeDutch) ?? [];
    if (group.includes("dank je")) {
      return text(
        `${sourceText} 和 ${targetText} 属于“谢谢/回应/抱歉”这一小组，按真实对话来回记。`,
        `${sourceText} and ${targetText} belong to the thanks/reply/apology mini-set; learn them as dialogue turns.`,
      );
    }
    if (group.includes("tot ziens")) {
      return text(
        `${sourceText} 和 ${targetText} 都是告别出口，见面结束时最容易互相带出来。`,
        `${sourceText} and ${targetText} are goodbye exits, so they cue each other at the end of a conversation.`,
      );
    }
    return text(
      `${sourceText} 和 ${targetText} 按一天里的问候顺序记：早上、下午、晚上。`,
      `${sourceText} and ${targetText} belong to the time-of-day greeting sequence: morning, afternoon, evening.`,
    );
  }
  if (sharedTags.includes("form") || sharedTags.includes("gemeente")) {
    return text(
      `${sourceText} 和 ${targetText} 都会出现在表格/市政厅办事流程里。`,
      `${sourceText} and ${targetText} both appear in form or municipality tasks.`,
    );
  }
  if (sharedTags.includes("housing")) {
    return text(
      `${sourceText} 和 ${targetText} 都在住房、搬家或地址变更任务里用，放在一起更容易填表和说明情况。`,
      `${sourceText} and ${targetText} both belong to housing, moving, or address-change tasks, so learning them together helps with forms and explanations.`,
    );
  }
  if (sharedTags.includes("email")) {
    return text(
      `${sourceText} 和 ${targetText} 都在邮件/信件里出现，按“写信、回复、转发、查看文件夹”一起记。`,
      `${sourceText} and ${targetText} both appear in email or letter tasks; learn them through writing, replying, forwarding, and checking folders.`,
    );
  }
  if (sharedTags.includes("health")) {
    return text(
      `${sourceText} 和 ${targetText} 都在看病/健康任务里用，放在一起更容易说完整情况。`,
      `${sourceText} and ${targetText} both belong to health tasks, so learning them together helps you explain the situation.`,
    );
  }
  if (sharedTags.includes("transport")) {
    return text(
      `${sourceText} 和 ${targetText} 都是出行流程里的词，能一起组成路线或交通句。`,
      `${sourceText} and ${targetText} both belong to travel flow and can build transport sentences together.`,
    );
  }
  if (sharedTags.includes("supermarket") || sharedTags.includes("bill")) {
    return text(
      `${sourceText} 和 ${targetText} 都和购物/付款有关，适合按“看价格、买、付钱”一起记。`,
      `${sourceText} and ${targetText} both connect to shopping or payment; learn them through checking, buying, and paying.`,
    );
  }
  if ((source.phraseChunks ?? []).some((chunk) => normalizeDutch(chunk).includes(normalizeDutch(targetText)))) {
    return text(
      `${targetText} 会直接出现在 ${sourceText} 的常用短语里，先按整块短语记。`,
      `${targetText} appears directly in common chunks for ${sourceText}; learn it as part of the phrase.`,
    );
  }
  return text(
    `${sourceText} 和 ${targetText} 能在同一个可说句子里互相带出来。`,
    `${sourceText} and ${targetText} can cue each other inside the same usable sentence.`,
  );
}

function relatedWordAssociationsFor(selected: WordItem, words: WordItem[]): WordAssociation[] {
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  return (selected.relatedWords ?? [])
    .map((related) => related.trim())
    .filter(Boolean)
    .filter((related) => normalizeDutch(related) !== normalizeDutch(selected.dutch))
    .flatMap((related) => {
      const match = wordByDutch.get(normalizeDutch(related));
      const targetText = match?.dutch ?? related;
      const targetKey = normalizeDutch(targetText);
      const isVisibleWordPiece = targetKey.length >= 3 && normalizeDutch(selected.dutch).includes(targetKey) && normalizeDutch(selected.dutch) !== targetKey;
      const sharedCategory = sharedStrongCategoryId(selected.dutch, targetText);
      const sourceKey = normalizeDutch(selected.dutch);
      const sharedTags = match
        ? selected.scenarioTags.filter((tag) => match.scenarioTags.includes(tag))
        : [];
      const isSelectedPhrase = /\s/.test(selected.dutch.trim());
      const isPhraseChunkPart = isSelectedPhrase && (selected.phraseChunks ?? []).some((chunk) => normalizeDutch(chunk).includes(targetKey));
      const isGreetingPair = isCloseGreetingPair(sourceKey, targetKey);
      const focusedSharedTargets = sharedCategory ? focusedStrongCategoryTargets[sharedCategory]?.[sourceKey]?.map(normalizeDutch) ?? [] : [];
      if (
        sharedCategory &&
        focusedSharedTargets.length &&
        !focusedSharedTargets.includes(targetKey) &&
        !isVisibleWordPiece &&
        !isPhraseChunkPart &&
        !isGreetingPair
      ) {
        return [];
      }
      if (!isVisibleWordPiece && !sharedCategory && !isPhraseChunkPart && !isGreetingPair) {
        return [];
      }
      if (!isVisibleWordPiece && !sharedCategory && !isPhraseChunkPart && !isGreetingPair && !match) {
        return [];
      }
      const sharedCategoryRelationType = sharedCategory ? relationTypeForStrongCategory(sharedCategory, sourceKey) : undefined;
      const relationType: MemoryRelationType = isVisibleWordPiece
        ? "compound-part"
        : isPhraseChunkPart
          ? "part-related"
        : sharedCategoryRelationType
          ? sharedCategoryRelationType
          : isGreetingPair
            ? "semantic-series"
            : "scenario-word";
      return [{
        dutch: targetText,
        wordId: match?.id,
        meaning: match?.meaning,
        targetExistsInVocabulary: Boolean(match),
        isExtensionWord: !match,
        isExtensionTarget: !match,
        source: match ? "seed" : "extension",
        type: relationType,
        kind: relationFallbackLabels[relationType],
        reason: sharedCategory
          ? strongCategoryReasonFor(sharedCategory, selected.dutch, targetText) ?? relatedWordReasonFor(selected, targetText, match)
          : relatedWordReasonFor(selected, targetText, match),
      } satisfies WordAssociation];
    });
}

function learnerReasonFor(
  source: WordItem,
  association: Pick<WordAssociation, "dutch" | "meaning" | "type" | "reason" | "targetExistsInVocabulary" | "isExtensionWord" | "isExtensionTarget">,
): LocalizedText {
  const original = association.reason;
  const reasonText = `${original.zh} ${original.en}`;

  const target = association.dutch;
  const targetZh = association.meaning?.zh ? `（${association.meaning.zh}）` : "";
  const targetEn = association.meaning?.en ? ` (${association.meaning.en})` : "";
  const sourceText = source.dutch;

  if (association.type === "verb-form") {
    const sourceKey = normalizeDutch(sourceText);
    const targetKey = normalizeDutch(target);
    if (zijnFormMeanings[sourceKey] && zijnFormMeanings[targetKey]) {
      return original;
    }
    if (usefulInfinitiveToVerbForm[sourceKey] === targetKey) {
      return text(
        `${target} 是 ${sourceText} 的 ik/命令形式；看到原形时一起把这个开口形式带出来。`,
        `${target} is the ik/imperative form of ${sourceText}; connect the infinitive with this short usable form.`,
      );
    }
    if (usefulVerbFormToInfinitive[sourceKey] === targetKey) {
      return text(
        `${sourceText} 是 ${target} 的 ik/命令形式；点回原形看完整动词。`,
        `${sourceText} is the ik/imperative form of ${target}; open the infinitive for the full verb.`,
      );
    }
    if (association.targetExistsInVocabulary && !association.isExtensionWord && !association.isExtensionTarget) {
      return text(
        `${sourceText} 和 ${target} 是同一个动词的不同形式；别当成两个不相干的词。`,
        `${sourceText} and ${target} are forms of the same verb; do not learn them as unrelated words.`,
      );
    }
    return text(
      `${sourceText} 和 ${target} 是同一个动词的不同形式。`,
      `${sourceText} and ${target} are forms of the same verb.`,
    );
  }

  if (association.type === "time-category" && seasonWords.has(normalizeDutch(sourceText)) && seasonWords.has(normalizeDutch(target))) {
    return text(
      "按四季顺序记：lente 春天 → zomer 夏天 → herfst 秋天 → winter 冬天。",
      "Learn the season order: lente spring -> zomer summer -> herfst autumn -> winter winter.",
    );
  }

  if (!technicalReasonPattern.test(reasonText)) return original;

  switch (association.type) {
    case "compound-part":
    case "part-related":
      return text(
        `${sourceText} 里能看见 ${target}${targetZh} 这一小块。先抓住这块，再记整个词或短语。`,
        `${sourceText} contains the small piece ${target}${targetEn}. Catch that piece first, then remember the whole word or phrase.`,
      );
    case "compound-family":
    case "compound-parent":
      return text(
        `${sourceText} 和 ${target} 是同一组拼出来的词。认出共同的小块，整组都更好记。`,
        `${sourceText} and ${target} belong to the same compound-word set. Spot the shared piece and the set becomes easier to remember.`,
      );
    case "word-family":
    case "verb-noun-pair":
      return text(
        `${sourceText} 和 ${target} 像一组亲戚词，词形或意思有明显关系，放在一起记更稳。`,
        `${sourceText} and ${target} are word-family relatives. Their form or meaning connects, so learning them together helps.`,
      );
    case "scenario-word":
    case "semantic-series":
    case "category-member":
      return text(
        `${sourceText} 和 ${target} 常在同一个生活场景里碰到。把它们当一组实用词记。`,
        `${sourceText} and ${target} often appear in the same real-life situation. Learn them as a practical set.`,
      );
    case "action-object":
      return text(
        `${sourceText} 和 ${target} 常组成动作搭配，按“动作 + 对象”一起记。`,
        `${sourceText} and ${target} often form an action-object chunk, so learn them as one usable pair.`,
      );
    case "state-action":
      return text(
        `${sourceText} 和 ${target} 一个像状态，一个像处理动作，放在一起更容易开口用。`,
        `${sourceText} and ${target} connect as a state and a related action, useful for speaking.`,
      );
    default:
      return text(
        `${sourceText} 和 ${target} 有真实用法上的关系，放在一起记更容易想起来。`,
        `${sourceText} and ${target} have a real usage connection, so learning them together makes recall easier.`,
      );
  }
}

const associationTypePriority: Record<MemoryRelationType, number> = {
  "compound-part": 100,
  "part-related": 98,
  "pronoun-family": 94,
  "verb-form": 92,
  "verb-noun-pair": 90,
  "compound-parent": 91,
  "compound-family": 89,
  "word-family": 88,
  synonym: 82,
  opposite: 82,
  "confusion-pair": 81,
  "time-contrast": 80,
  "comparative-superlative": 80,
  "semantic-series": 79,
  "time-category": 68,
  "category-member": 30,
  "action-object": 58,
  "state-action": 56,
  "scenario-word": 52,
  "english-bridge": 0,
};

const associationSourcePriority: Record<NonNullable<WordAssociation["source"]>, number> = {
  manual: 10,
  seed: 8,
  rule: 6,
  extension: 4,
  candidate: 0,
};

function associationRank(association: WordAssociation) {
  const typeRank = associationTypePriority[association.type] ?? 0;
  const sourceRank = association.source ? (associationSourcePriority[association.source] ?? 0) : 0;
  const vocabularyRank = association.targetExistsInVocabulary && association.source !== "seed" ? 2 : 0;
  return typeRank * 100 + sourceRank * 10 + vocabularyRank;
}

function associationTypeCap(type: MemoryRelationType) {
  switch (type) {
    case "word-family":
      return 4;
    case "synonym":
    case "opposite":
      return 3;
    case "verb-form":
      return 4;
    case "compound-part":
      return 4;
    case "category-member":
      return 2;
    case "semantic-series":
      return 4;
    case "time-category":
    case "scenario-word":
      return 3;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

const genericAssociationReasonPattern =
  /同一个可说句子|同一个生活任务|同一个生活场景|都常在.+场景|都在看病\/健康任务|都常在看病|能一起组成|same usable sentence|same real-life task|same practical scenario|both appear in .+contexts|both belong to health tasks/i;
const genericCategoryReasonPattern =
  /明确的同类语义关系|都属于个人信息|真实使用时经常能一起遇到|clear same-category|belong to personal information|often appear together in real use/i;
const genericWordFamilyReasonPattern =
  /共同的词形线索|share a form clue/i;

const looseUsageAssociationTypes = new Set<MemoryRelationType>([
  "scenario-word",
  "action-object",
  "state-action",
]);

const levelBridgeAssociationTypes = new Set<MemoryRelationType>([
  "compound-part",
  "compound-parent",
  "compound-family",
  "part-related",
  "pronoun-family",
  "verb-form",
  "verb-noun-pair",
  "word-family",
  "synonym",
  "opposite",
  "time-contrast",
  "comparative-superlative",
  "semantic-series",
  "confusion-pair",
  "category-member",
]);

function isGenericSameSceneAssociation(association: WordAssociation) {
  const reason = `${association.reason.zh} ${association.reason.en}`;
  return genericAssociationReasonPattern.test(reason);
}

function isGenericCategoryAssociation(association: WordAssociation) {
  const reason = `${association.reason.zh} ${association.reason.en}`;
  return association.type === "category-member" && genericCategoryReasonPattern.test(reason);
}

function isGenericWordFamilyAssociation(association: WordAssociation) {
  const reason = `${association.reason.zh} ${association.reason.en}`;
  return association.type === "word-family" && genericWordFamilyReasonPattern.test(reason);
}

function shouldSkipBubbleAssociation(association: WordAssociation) {
  if (association.type === "english-bridge") return true;
  if (association.type === "category-member") return true;
  if (looseUsageAssociationTypes.has(association.type)) return true;
  if (isGenericSameSceneAssociation(association)) return true;
  if (isGenericCategoryAssociation(association)) return true;
  if (isGenericWordFamilyAssociation(association)) return true;
  return false;
}

function canBridgeLevelForBubble(association: WordAssociation) {
  return levelBridgeAssociationTypes.has(association.type) &&
    (association.source === "manual" || association.source === "seed" || association.source === "rule" || association.source === "extension");
}

function isPureVerbFormAssociation(selected: WordItem, association: WordAssociation) {
  if (association.type === "verb-noun-pair" || association.type === "confusion-pair") return false;
  const selectedInfinitive = infinitiveForWord(selected);
  if (!selectedInfinitive) return false;
  const selectedKey = normalizeDutch(selected.dutch);
  const targetKey = normalizeDutch(association.dutch);
  const infinitiveKey = normalizeDutch(selectedInfinitive);
  if (targetKey === infinitiveKey && selectedKey !== targetKey) return true;
  const targetInfinitive = infinitiveForWord(association.dutch);
  return Boolean(targetInfinitive) &&
    normalizeDutch(targetInfinitive) === infinitiveKey &&
    selectedKey !== targetKey;
}

function isUsefulVerbFormAssociation(selected: WordItem, association: WordAssociation) {
  if (association.type !== "verb-form") return false;
  const selectedKey = normalizeDutch(selected.dutch);
  const targetKey = normalizeDutch(association.dutch);
  if (zijnFormMeanings[selectedKey] && zijnFormMeanings[targetKey]) return true;
  const infinitive = usefulVerbFormToInfinitive[selectedKey];
  if (infinitive && targetKey === normalizeDutch(infinitive)) return true;
  return usefulInfinitiveToVerbForm[selectedKey] === targetKey;
}

function dedupeAssociations(associations: WordAssociation[], limit: number) {
  const bestByKey = new Map<string, WordAssociation>();
  const firstIndex = new Map<string, number>();
  associations.forEach((association, index) => {
    if (shouldSkipBubbleAssociation(association)) return;
    const key = normalizeDutch(association.dutch);
    if (!key) return;
    if (!firstIndex.has(key)) firstIndex.set(key, index);
    const current = bestByKey.get(key);
    if (!current || associationRank(association) > associationRank(current)) {
      bestByKey.set(key, association);
      return;
    }
    if (!current.meaning && association.meaning) {
      bestByKey.set(key, { ...current, meaning: association.meaning });
    }
  });

  const rankedAssociations = Array.from(bestByKey.entries())
    .sort((left, right) => {
      const rankDiff = associationRank(right[1]) - associationRank(left[1]);
      if (rankDiff) return rankDiff;
      return (firstIndex.get(left[0]) ?? 0) - (firstIndex.get(right[0]) ?? 0);
    });

  const selected: WordAssociation[] = [];
  const relationCounts = new Map<MemoryRelationType, number>();
  let genericSameSceneCount = 0;
  const takeAssociation = (association: WordAssociation) => {
    const relationCount = relationCounts.get(association.type) ?? 0;
    const isGenericSameScene = isGenericSameSceneAssociation(association);
    if (relationCount >= associationTypeCap(association.type)) return;
    if (isGenericSameScene && genericSameSceneCount >= 3) return;
    selected.push(association);
    relationCounts.set(association.type, relationCount + 1);
    if (isGenericSameScene) genericSameSceneCount += 1;
  };

  for (const [, association] of rankedAssociations) {
    takeAssociation(association);
    if (selected.length >= limit) break;
  }

  return selected;
}

const suppressLooseGeneratedRelationsFor = (word: WordItem) =>
  word.dutch.trim().split(/\s+/).filter(Boolean).length > 1;

const isLooseGeneratedAssociation = (association: WordAssociation) =>
  looseGeneratedRelationTypes.has(association.type) && association.source !== "manual" && association.source !== "seed";

export function memoryAssociationsFor(selected: WordItem, words: WordItem[], limit = 8): WordAssociation[] {
  const shouldHideAdvancedTargets = selected.originalLevel !== "B1" && selected.originalLevel !== "B2";
  const nonAdvancedTargets = new Set(
    words
      .filter((word) => word.originalLevel !== "B1" && word.originalLevel !== "B2")
      .map((word) => normalizeDutch(word.dutch)),
  );
  const hiddenAdvancedTargets = new Set(
    shouldHideAdvancedTargets
      ? words
          .filter((word) => word.originalLevel === "B1" || word.originalLevel === "B2")
          .map((word) => normalizeDutch(word.dutch))
          .filter((word) => !nonAdvancedTargets.has(word))
      : [],
  );
  const associationWords = selected.originalLevel === "B1" || selected.originalLevel === "B2"
    ? words
    : words.filter((word) => word.originalLevel !== "B1" && word.originalLevel !== "B2");
  const wordByDutch = new Map(words.map((word) => [normalizeDutch(word.dutch), word]));
  const candidateLimit = Math.max(limit * 3, 16);
  const generated = generateRelationsForWord(selected, words, { pageContext: "word-link", limit: candidateLimit })
    .map((relation) => {
      const match = relation.targetWordId
        ? words.find((word) => word.id === relation.targetWordId)
        : wordByDutch.get(normalizeDutch(relation.targetText));
      const extensionMeaning = relationLexicons.baseMorphemes[normalizeDutch(relation.targetText) as keyof typeof relationLexicons.baseMorphemes];
      const usefulRelationMeaning = relation.targetMeaning?.zh || relation.targetMeaning?.en ? relation.targetMeaning : undefined;
      const usefulExtensionMeaning = extensionMeaning?.zh || extensionMeaning?.en ? extensionMeaning : undefined;
      const source: RelationSource | "extension" = relation.relationSource;
      const association = {
        dutch: relation.targetText,
        wordId: match?.id,
        meaning: match?.meaning ?? usefulRelationMeaning ?? usefulExtensionMeaning,
        targetExistsInVocabulary: relation.targetExistsInVocabulary ?? Boolean(match),
        isExtensionWord: relation.isExtensionWord ?? relation.isExtensionTarget,
        isExtensionTarget: relation.isExtensionTarget ?? relation.isExtensionWord,
        source,
        type: relation.relationType,
        kind: relationFallbackLabels[relation.relationType],
        reason: text(relation.reasonZh, relation.reasonEn),
      };
      return {
        ...association,
        reason: learnerReasonFor(selected, association),
      };
    });
  const suppressLooseGeneratedRelations = suppressLooseGeneratedRelationsFor(selected);
  const pronounAssociations = pronounFamilyAssociationsFor(selected, associationWords);
  const highSignalAssociations = [
    ...pronounAssociations,
    ...dialogueSeriesAssociationsFor(selected, associationWords),
    ...functionWordSeriesAssociationsFor(selected, associationWords),
    ...zijnFrameAssociationsFor(selected, associationWords),
    ...strongCategoryAssociationsFor(selected, words, limit),
    ...phraseComponentAssociationsFor(selected, words),
    ...goldenAssociationsFor(selected, associationWords),
    ...manualLinksFor(selected, associationWords),
    ...relatedWordAssociationsFor(selected, associationWords),
  ];
  const visibleAssociations = [...highSignalAssociations, ...generated]
    .map((association) => normalizeAssociationForDisplay(selected, association))
    .filter((association) => association.type !== "english-bridge")
    .filter((association) => !isNumberRelationText(selected.dutch) || !numberStructuralTypes.has(association.type) || isNumberRelationText(association.dutch))
    .filter((association) => !(suppressLooseGeneratedRelations && isLooseGeneratedAssociation(association)))
    .filter((association) => association.type !== "verb-form" || isUsefulVerbFormAssociation(selected, association))
    .filter((association) => association.type === "verb-form" || !isPureVerbFormAssociation(selected, association))
    .filter((association) => canBridgeLevelForBubble(association) || !hiddenAdvancedTargets.has(normalizeDutch(association.dutch)));
  const preliminary = dedupeAssociations(visibleAssociations, limit);
  return preliminary;
}
