import { relationLexicons } from "@/data/relationLexicons";
import type { MemoryBubbleRelationType } from "@/lib/memoryBubbleEngine";
import type { WordAnalysis } from "@/lib/wordAnalysis";
import { analyzeWord, normalizeWordText } from "@/lib/wordAnalysis";
import type { WordItem } from "@/types/vocabulary";

const strictAssociationWords = new Set([
  "aangifte",
  "afsluiting",
  "betreft",
  "besluit",
  "gebeurtenis",
  "herinnering",
  "reactie",
  "reactietermijn",
  "uitnodiging",
  "vergunning",
  "voorstel",
  "waarschuwing",
]);

const broadCategoryIdsForStrictWords = new Set([
  "business-workplace",
  "civic-participation",
  "community",
  "contact-info",
  "digital-admin",
  "digital-account-actions",
  "email-message",
  "formal-email-writing",
  "forms-documents",
  "gemeente",
  "housing",
  "job-search",
  "legal-safety",
  "marital-status",
  "neighborhood-services",
  "official-admin-extended",
  "opinion-argument",
  "personal-info",
  "phone-contact",
  "public-services",
  "residence-location",
  "text-reading",
  "work",
]);

export function usesStrictAssociations(analysis: WordAnalysis) {
  const theme = normalizeWordText(analysis.word.theme);
  return (
    analysis.word.level === "B1" ||
    analysis.word.originalLevel === "B1" ||
    strictAssociationWords.has(analysis.normalizedForm) ||
    theme.startsWith("b1") ||
    /official|formal|letter|admin|safety|legal|society/.test(theme)
  );
}

export function allowsLooseFallbackRelations(analysis: WordAnalysis) {
  return !["phrase", "function-word", "adverb"].includes(analysis.wordType);
}

export function shouldSuppressBroadCategoryRelation(analysis: WordAnalysis, categoryId: string, sourceIsHead: boolean) {
  const normalizedCategory = normalizeWordText(categoryId);
  if (!sourceIsHead && normalizedCategory === "email-message" && analysis.word.scenarioTags.map(normalizeWordText).includes("email")) {
    return false;
  }
  return !sourceIsHead && usesStrictAssociations(analysis) && broadCategoryIdsForStrictWords.has(normalizedCategory);
}

export function phraseLikeTarget(target: string) {
  return target.trim().split(/\s+/).filter(Boolean).length > 1 || /[.!?]$/.test(target.trim());
}

function lexicalContextFor(analysis: WordAnalysis) {
  return [
    analysis.normalizedForm,
    analysis.word.theme,
    analysis.word.meaning.zh,
    analysis.word.meaning.en,
    ...analysis.categoryTags,
  ].join(" ").toLowerCase();
}

function contextTokensFor(context: string) {
  return new Set(context.split(/[^a-zA-ZÀ-ÿ0-9]+/).map(normalizeWordText).filter(Boolean));
}

function hasAnyToken(tokens: Set<string>, values: string[]) {
  return values.some((value) => tokens.has(normalizeWordText(value)));
}

const safeRelatedBuckets = [
  {
    id: "greeting",
    labelZh: "问候礼貌",
    labelEn: "greetings and polite phrases",
    words: ["hallo", "dag", "bedankt", "sorry", "welkom", "goedemorgen", "goedemiddag", "goedenavond", "tot ziens", "alsjeblieft", "alstublieft"],
    patterns: [/\b(greeting|polite|groet|hello|thanks|sorry)\b/i, /你好|谢谢|抱歉|礼貌|问候/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "identity",
    labelZh: "个人信息",
    labelEn: "personal information",
    words: ["naam", "voornaam", "achternaam", "heet", "heten", "ben", "bent", "is", "mijn", "jouw", "uw", "wie", "wat", "leeftijd", "geboortedatum"],
    patterns: [/\b(name|naam|geboorte|leeftijd)\b/i, /名字|姓名|出生|几岁|叫/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "study",
    labelZh: "学习读写",
    labelEn: "study, reading, and writing",
    words: ["boek", "woordenboek", "schrift", "pen", "potlood", "papier", "tekst", "zin", "lezen", "schrijven", "leren", "oefenen", "herhalen", "luisteren", "spreken"],
    patterns: [/\b(school|study|class|text|read|write|learn|lesson|cursus)\b/i, /学习|学校|读|写|课|本子|笔|文本|句子/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "weather",
    labelZh: "天气",
    labelEn: "weather",
    words: ["weer", "zon", "regen", "wind", "warm", "koud"],
    patterns: [/\b(weather|rain|sun|wind|warm|cold)\b/i, /天气|太阳|雨|风|冷|热/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "clothes",
    labelZh: "衣物",
    labelEn: "clothes",
    words: ["jas", "trui", "broek", "schoenen", "jurk", "rok", "sok", "muts", "shirt", "hemd"],
    patterns: [/\b(clothes|coat|shirt|shoe|sock|wear)\b/i, /衣|外套|裤|鞋|袜|帽|穿/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "colors",
    labelZh: "颜色",
    labelEn: "colors",
    words: ["rood", "blauw", "groen", "geel", "zwart", "wit", "grijs", "bruin", "kleur"],
    patterns: [/\b(color|colour|red|blue|green|yellow|black|white|grey|gray|brown)\b/i, /颜色|红|蓝|绿|黄|黑|白|灰|棕/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "seasons",
    labelZh: "季节",
    labelEn: "seasons",
    words: ["lente", "zomer", "herfst", "winter"],
    patterns: [/\b(season|spring|summer|autumn|fall|winter)\b/i, /季节|春|夏|秋|冬/],
    relationType: "time-category" as MemoryBubbleRelationType,
  },
  {
    id: "home",
    labelZh: "家和空间",
    labelEn: "home and space",
    words: ["huis", "kamer", "deur", "raam", "sleutel", "woning", "woonruimte", "woonkamer", "thuis", "adres"],
    patterns: [/\b(home|house|room|door|window|key|housing)\b/i, /家|房|门|窗|钥匙|住房/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "transport",
    labelZh: "交通出行",
    labelEn: "transport",
    words: ["trein", "bus", "fiets", "auto", "station", "halte", "perron", "spoor", "kaartje", "reis", "rit", "route", "reisplanner", "richting", "lijn", "overstappen", "inchecken", "uitchecken", "ov-chipkaart", "vertraging", "lopen"],
    patterns: [/\b(transport|train|bus|bike|station|travel|trip|walk|route|check in|check out|transfer)\b/i, /交通|火车|公交|自行车|车站|旅行|路线|换乘|刷卡|走/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "basic-actions",
    labelZh: "基础动作",
    labelEn: "basic actions",
    words: ["gaan", "ga", "komen", "kom", "lopen", "loop", "staan", "sta", "zitten", "zit", "liggen", "leg", "leggen", "maken", "maak", "doen", "doe", "geven", "geef", "kijken", "kijk", "zien", "zie", "eten", "eet", "drinken", "drink", "slapen", "slaap"],
    patterns: [/\b(action|verb|walk|stand|sit|make|do|give|look|see|eat|drink|sleep)\b/i, /动作|走|站|坐|做|给|看|吃|喝|睡/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "describing",
    labelZh: "描述词",
    labelEn: "describing words",
    words: ["oud", "nieuw", "snel", "langzaam", "juist", "fout", "groot", "klein", "makkelijk", "moeilijk", "goed", "slecht"],
    patterns: [/\b(old|new|fast|slow|right|wrong|big|small|easy|difficult|good|bad)\b/i, /旧|老|新|快|慢|对|错|大|小|容易|难|好|坏/],
    relationType: "category-member" as MemoryBubbleRelationType,
  },
  {
    id: "digital",
    labelZh: "手机电脑",
    labelEn: "phone and computer",
    words: ["app", "foto", "computer", "laptop", "telefoon", "bericht", "e-mail", "e-mailadres"],
    patterns: [/\b(app|photo|computer|laptop|phone|message|email)\b/i, /应用|照片|电脑|手机|电话|消息|邮件/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "phone-contact",
    labelZh: "电话联系方式",
    labelEn: "phone contact",
    words: ["telefoon", "telefoonnummer", "mobiel", "nummer", "bellen", "bericht"],
    patterns: [/\b(phone|mobile|telephone|call|message|contact)\b/i, /电话|手机|联系|消息/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
  {
    id: "email-message",
    labelZh: "邮件信件",
    labelEn: "email and letters",
    words: ["e-mail", "e-mailadres", "bericht", "bijlage", "onderwerp", "aanhef", "groet", "antwoord", "geachte", "doorsturen", "beantwoorden", "ontvanger", "afzender", "concept", "verzonden", "spam", "map"],
    patterns: [/\b(email|e-mail|message|letter|reply|forward|recipient|sender|draft|sent|spam|folder)\b/i, /邮件|信件|回复|转发|收件人|发件人|草稿|已发送|垃圾邮件|文件夹/],
    relationType: "scenario-word" as MemoryBubbleRelationType,
  },
] as const;

export const functionWordRelatedBuckets = new Set(["greeting", "identity"]);

function safeRelatedBucketIdsForWord(word: WordItem | undefined, fallbackText: string) {
  const key = normalizeWordText(fallbackText);
  const context = [
    key,
    word?.theme,
    word?.meaning.zh,
    word?.meaning.en,
    ...(word?.scenarioTags ?? []),
  ].filter(Boolean).join(" ");
  return safeRelatedBuckets
    .filter((bucket) =>
      bucket.words.map(normalizeWordText).includes(key) ||
      bucket.patterns.some((pattern) => pattern.test(context)),
    )
    .map((bucket) => bucket.id);
}

export function safeRelatedBucketFor(source: WordItem, target: WordItem | undefined, targetText: string) {
  const sourceBuckets = safeRelatedBucketIdsForWord(source, source.dutch);
  const targetBuckets = safeRelatedBucketIdsForWord(target, targetText);
  const shared = sourceBuckets.find((bucket) => targetBuckets.includes(bucket));
  return safeRelatedBuckets.find((bucket) => bucket.id === shared);
}

function lexiconCategoryTagsFor(target: string) {
  const key = normalizeWordText(target);
  const tags = new Set<string>();
  relationLexicons.categories.forEach((category) => {
    const heads = category.heads.map(normalizeWordText);
    const members = category.members.map(normalizeWordText);
    if (!heads.includes(key) && !members.includes(key)) return;
    tags.add(normalizeWordText(category.id));
    category.tags.forEach((tag) => tags.add(normalizeWordText(tag)));
  });
  return tags;
}

function semanticTagsFor(word: WordItem | undefined, fallbackText: string) {
  const tags = new Set<string>([
    ...safeRelatedBucketIdsForWord(word, fallbackText).map(normalizeWordText),
    ...lexiconCategoryTagsFor(fallbackText),
  ]);
  word?.scenarioTags.forEach((tag) => tags.add(normalizeWordText(tag)));
  return tags;
}

export function hasSharedSemanticContext(source: WordItem, target: WordItem | undefined, targetText: string) {
  const sourceTags = semanticTagsFor(source, source.dutch);
  const targetTags = semanticTagsFor(target, targetText);
  return [...sourceTags].some((tag) => targetTags.has(tag));
}

function strictSemanticTagsFor(word: WordItem | undefined, fallbackText: string, allWords: WordItem[]) {
  const tags = new Set<string>(lexiconCategoryTagsFor(fallbackText));
  word?.scenarioTags.forEach((tag) => tags.add(normalizeWordText(tag)));
  if (word) {
    analyzeWord(word, allWords).categoryTags.forEach((tag) => tags.add(normalizeWordText(tag)));
  }
  return tags;
}

export function hasSharedStrictSemanticContext(source: WordAnalysis, target: WordItem | undefined, targetText: string, allWords: WordItem[]) {
  const sourceTags = new Set([
    ...source.scenarioTags.map(normalizeWordText),
    ...source.categoryTags.map(normalizeWordText),
    ...lexiconCategoryTagsFor(source.normalizedForm),
  ]);
  const targetTags = strictSemanticTagsFor(target, targetText, allWords);
  return [...sourceTags].some((tag) => targetTags.has(tag));
}

export function contextTagsFor(analysis: WordAnalysis) {
  const context = lexicalContextFor(analysis);
  const tokens = contextTokensFor(context);
  const tags = new Set(analysis.categoryTags.map(normalizeWordText));
  const isEmailAddress = /e-?mail|email/.test(context);
  const residenceLike =
    !isEmailAddress &&
    (
      hasAnyToken(tokens, ["woon", "wonen", "woning", "adres", "postcode", "provincie", "buurt", "wijk", "straat", "huisnummer", "plaats", "stad"]) ||
      /居住|住址|邮编|社区|省|街区|街道|门牌/.test(context)
    );

  if (residenceLike) {
    tags.delete("shopping");
    tags.delete("supermarket");
    tags.add("residence-location");
    tags.add("housing");
    tags.add("gemeente");
  }
  if (hasAnyToken(tokens, ["naam", "voornaam", "achternaam", "leeftijd", "geboorte", "geboortedatum", "geboorteplaats", "nationaliteit", "geslacht", "personal", "details"]) || /名字|姓名|出生|国籍|性别/.test(context)) {
    tags.add("personal-info");
  }
  if (hasAnyToken(tokens, ["alleenstaand", "getrouwd", "gescheiden", "weduwe", "weduwnaar"]) || /婚姻|单身|已婚|离婚|寡妇|鳏夫/.test(context)) {
    tags.add("marital-status");
  }
  if (hasAnyToken(tokens, ["meneer", "mevrouw", "aanspreking"]) || /先生|女士|称呼/.test(context)) {
    tags.add("formal-address");
  }
  if (hasAnyToken(tokens, ["land", "landen", "countries", "country", "nederland", "china", "duitsland", "belgië", "frankrijk", "spanje"]) || /国家|中国|荷兰|德国|法国|西班牙|比利时/.test(context)) {
    tags.add("countries");
  }
  if (hasAnyToken(tokens, ["taal", "language", "languages", "nederlands", "engels", "chinees", "duits", "frans", "spaans", "vertaling", "tolk"]) || /语言|荷兰语|英语|中文|翻译|口译/.test(context)) {
    tags.add("language");
  }
  if (hasAnyToken(tokens, ["telefoon", "telefoonnummer", "mobiel", "nummer", "bellen", "email", "contact"]) || /e-?mail|mailadres|电话|手机|号码|邮箱|邮件地址|联系方式/.test(context)) {
    tags.add("contact");
    tags.add("phone-contact");
  }
  if (hasAnyToken(tokens, ["bijlage", "bericht", "onderwerp", "aanhef", "groet", "afzender", "ontvanger", "email"]) || /e-?mail|邮件|附件|发件人|收件人|主题/.test(context)) {
    tags.add("email");
  }
  if (hasAnyToken(tokens, ["formulier", "document", "bijlage", "kopie", "kopiëren", "handtekening", "stempel", "printer", "printen", "scannen", "mapje", "bewijs", "verklaring"]) || /表格|文件|附件|复印|签名|印章|打印|扫描/.test(context)) {
    tags.add("form");
    tags.add("document");
  }
  if (hasAnyToken(tokens, ["gemeente", "paspoort", "inschrijven", "aanvraag", "afspraak"]) || /市政|护照|登记|申请|预约/.test(context)) {
    tags.add("gemeente");
  }
  if (hasAnyToken(tokens, ["huur", "kamer", "verhuurder", "reparatie", "sleutel"]) || /住房|租|房间|维修|钥匙/.test(context)) {
    tags.add("housing");
  }
  if (hasAnyToken(tokens, ["boodschap", "boodschappen", "winkel", "supermarkt", "kassa", "prijs", "geld"]) || /购物|商店|超市|收银|价格/.test(context)) {
    tags.add("shopping");
  }
  if (hasAnyToken(tokens, ["trein", "bus", "fiets", "station", "halte", "perron", "spoor", "transport", "vervoer", "route", "reisplanner", "richting", "lijn", "overstappen", "inchecken", "uitchecken", "ov-chipkaart"]) || /交通|火车|公交|自行车|车站|站台|轨道|路线|换乘|刷卡进站|刷卡出站/.test(context)) {
    tags.add("transport");
  }
  if (hasAnyToken(tokens, ["huisarts", "ziek", "pijn", "medicijn", "apotheek", "gezondheid"]) || /医生|生病|疼|药/.test(context)) {
    tags.add("health");
  }
  if (hasAnyToken(tokens, ["eten", "drinken", "brood", "melk", "water", "koffie", "thee", "food", "drink"]) || /吃|喝|面包|牛奶|咖啡/.test(context)) {
    tags.add("food-drink");
  }
  if (hasAnyToken(tokens, ["hulp", "helpen", "vraag", "medewerker", "help"]) || /帮助|问题/.test(context)) {
    tags.add("help");
  }
  if (hasAnyToken(tokens, ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "twintig", "honderd", "number"]) || /数字|零/.test(context)) {
    tags.add("numbers");
  }

  return Array.from(tags);
}
