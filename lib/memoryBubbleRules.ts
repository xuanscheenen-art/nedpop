import { relationLexicons } from "@/data/relationLexicons";
import { inferWordType } from "@/lib/exampleTemplates";
import type { MemoryBubbleCandidate, MemoryBubbleRelationType } from "@/lib/memoryBubbleEngine";
import { analyzeWordFormationFromAnalysis } from "@/lib/wordFormationAnalyzer";
import type { WordAnalysis } from "@/lib/wordAnalysis";
import { analyzeWord, normalizeWordText } from "@/lib/wordAnalysis";
import type { WordItem } from "@/types/vocabulary";

const wordMapFor = (words: WordItem[]) => new Map(words.map((word) => [normalizeWordText(word.dutch), word]));

const titleFor = (value: string) => value;

function targetAvailable(target: string, wordMap: Map<string, WordItem>) {
  return wordMap.get(normalizeWordText(target));
}

function targetMeaningFor(target: string) {
  return relationLexicons.baseMorphemes[normalizeWordText(target)];
}

function knownMeaningOrWord(target: string, allWords: WordItem[]) {
  const key = normalizeWordText(target);
  return Boolean(targetMeaningFor(key) || targetAvailable(key, wordMapFor(allWords)));
}

function shortenedPluralVariant(root: string) {
  return root.replace(/([aeiou])\1([^aeiou])$/i, "$1$2") + "en";
}

function safeCoreRootsFor(analysis: WordAnalysis, allWords: WordItem[]) {
  const roots = new Set<string>();
  const source = analysis.normalizedForm;
  const candidates = [
    ...analysis.possibleCompoundParts,
    source,
  ].map(normalizeWordText);

  for (const candidateRoot of candidates) {
    if (candidateRoot.length >= 4 && knownMeaningOrWord(candidateRoot, allWords)) {
      roots.add(candidateRoot);
    }
    if (candidateRoot.endsWith("t")) {
      const withoutFinalT = candidateRoot.slice(0, -1);
      if (withoutFinalT.length >= 4 && knownMeaningOrWord(withoutFinalT, allWords)) {
        roots.add(withoutFinalT);
      }
    }
  }

  return Array.from(roots);
}

function rootFamilyTargets(root: string, allWords: WordItem[]) {
  const pluralVariant = shortenedPluralVariant(root);
  const entries = [
    ...allWords.map((word) => word.dutch),
    ...Object.keys(relationLexicons.baseMorphemes),
  ];
  return Array.from(new Set(entries))
    .filter((target) => {
      const key = normalizeWordText(target);
      if (!key || phraseLikeTarget(key) || key === root) return false;
      return key.startsWith(root) || key === pluralVariant || (relationLexicons.compoundParts[key] ?? []).map(normalizeWordText).includes(root);
    })
    .sort((a, b) => {
      const aKey = normalizeWordText(a);
      const bKey = normalizeWordText(b);
      const score = (key: string) => {
        if (key === pluralVariant) return 0;
        if ((relationLexicons.compoundParts[key] ?? []).map(normalizeWordText).includes(root)) return 1;
        if (key.startsWith(root)) return 2;
        return 3;
      };
      const scoreDiff = score(aKey) - score(bKey);
      if (scoreDiff) return scoreDiff;
      return aKey.length - bKey.length;
    });
}

const genericCompoundRoots = new Set([
  "huis",
  "man",
  "vrouw",
  "werk",
  "nummer",
  "plaats",
  "kaart",
  "post",
  "code",
  "centrum",
  "dag",
]);

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

function usesStrictAssociations(analysis: WordAnalysis) {
  const theme = normalizeWordText(analysis.word.theme);
  return (
    analysis.word.level === "B1" ||
    analysis.word.originalLevel === "B1" ||
    strictAssociationWords.has(analysis.normalizedForm) ||
    theme.startsWith("b1") ||
    /official|formal|letter|admin|safety|legal|society/.test(theme)
  );
}

function allowsLooseFallbackRelations(analysis: WordAnalysis) {
  return !["phrase", "function-word", "adverb"].includes(analysis.wordType);
}

function shouldSuppressBroadCategoryRelation(analysis: WordAnalysis, categoryId: string, sourceIsHead: boolean) {
  return !sourceIsHead && usesStrictAssociations(analysis) && broadCategoryIdsForStrictWords.has(normalizeWordText(categoryId));
}

function phraseLikeTarget(target: string) {
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
] as const;

const functionWordRelatedBuckets = new Set(["greeting", "identity"]);

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

function safeRelatedBucketFor(source: WordItem, target: WordItem | undefined, targetText: string) {
  const sourceBuckets = safeRelatedBucketIdsForWord(source, source.dutch);
  const targetBuckets = safeRelatedBucketIdsForWord(target, targetText);
  const shared = sourceBuckets.find((bucket) => targetBuckets.includes(bucket));
  return safeRelatedBuckets.find((bucket) => bucket.id === shared);
}

function hasSharedScenarioTag(source: WordItem, target: WordItem | undefined) {
  if (!target) return false;
  const targetTags = new Set(target.scenarioTags.map(normalizeWordText));
  return source.scenarioTags.some((tag) => targetTags.has(normalizeWordText(tag)));
}

function isReciprocalRelated(source: WordItem, target: WordItem | undefined) {
  if (!target) return false;
  const sourceKey = normalizeWordText(source.dutch);
  return target.relatedWords.map(normalizeWordText).includes(sourceKey);
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

function hasSharedSemanticContext(source: WordItem, target: WordItem | undefined, targetText: string) {
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

function hasSharedStrictSemanticContext(source: WordAnalysis, target: WordItem | undefined, targetText: string, allWords: WordItem[]) {
  const sourceTags = new Set([
    ...source.scenarioTags.map(normalizeWordText),
    ...source.categoryTags.map(normalizeWordText),
    ...lexiconCategoryTagsFor(source.normalizedForm),
  ]);
  const targetTags = strictSemanticTagsFor(target, targetText, allWords);
  return [...sourceTags].some((tag) => targetTags.has(tag));
}

function isCompoundSource(analysis: WordAnalysis) {
  return analysis.possibleCompoundParts.map(normalizeWordText)
    .filter((part) => part && part !== analysis.normalizedForm)
    .length >= 2;
}

function isDeclaredRelated(source: WordItem, targetText: string) {
  const target = normalizeWordText(targetText);
  return source.relatedWords.map(normalizeWordText).includes(target);
}

function shouldShowRootFamilyTarget(analysis: WordAnalysis, root: string, target: string, allWords: WordItem[]) {
  if (!isCompoundSource(analysis)) return true;
  const targetWord = targetAvailable(target, wordMapFor(allWords));
  const rootKey = normalizeWordText(root);
  const targetKey = normalizeWordText(target);
  if (isDeclaredRelated(analysis.word, target)) return true;
  if (rootKey === analysis.normalizedForm || targetKey.startsWith(analysis.normalizedForm)) return true;
  if (genericCompoundRoots.has(rootKey)) {
    return hasSharedStrictSemanticContext(analysis, targetWord, target, allWords);
  }
  return hasSharedSemanticContext(analysis.word, targetWord, target);
}

function contextTagsFor(analysis: WordAnalysis) {
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

function categoryReasonFor(categoryId: string, sourceText: string, target: string, sourceIsHead = false) {
  const headPrefix = sourceIsHead
    ? `${target} 是 ${sourceText} 这个主题下的具体词。`
    : `${sourceText} 和 ${target}`;
  const headEnPrefix = sourceIsHead
    ? `${target} is a concrete word under the ${sourceText} topic.`
    : `${sourceText} and ${target}`;

  switch (categoryId) {
    case "personal-info":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常出现在个人信息表或自我介绍里。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in personal-information forms or introductions.`,
      };
    case "marital-status":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是表格里的婚姻状态选项。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are both marital-status options on forms.`,
      };
    case "neighborhood":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都围绕社区、街区或邻居关系。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to neighborhood or neighbor relations.`,
      };
    case "residence-location":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都用来说明居住地址或所在地区。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both describe residence address or location.`,
      };
    case "gemeente":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在市政厅办事或填表场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in municipality or form-filling situations.`,
      };
    case "housing":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是住房、租房或居住场景的高频词。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to housing, renting, or living contexts.`,
      };
    case "shopping":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在购物、超市或付款场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in shopping, supermarket, or payment contexts.`,
      };
    case "transport":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都属于交通出行词。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to transport and travel vocabulary.`,
      };
    case "rail-transport":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在火车站、站台或换乘场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in train station, platform, or transfer contexts.`,
      };
    case "forms-documents":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是表格、文件或复印扫描场景里的词。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to forms, documents, copying, or scanning.`,
      };
    case "email-message":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在邮件、消息或附件场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in email, message, or attachment contexts.`,
      };
    case "contact-info":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是联系方式或联系信息。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to contact information.`,
      };
    case "phone-contact":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是电话或手机联系方式。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to phone or mobile contact information.`,
      };
    case "health":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在看病、药房或身体不舒服场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in doctor, pharmacy, or illness contexts.`,
      };
    case "complaint":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在投诉、报修或说明问题的场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in complaint, repair, or problem-reporting contexts.`,
      };
    case "sick-leave":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常在请病假、复工或联系职业健康服务的场景出现。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in sick-leave, return-to-work, or occupational-health contexts.`,
      };
    case "time-units":
    case "months":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是时间表达。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are both time expressions.`,
      };
    case "languages":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都属于语言学习或交流场景。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to language learning or communication.`,
      };
    case "language-services":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都围绕语言理解、翻译或沟通。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both belong to language understanding, translation, or communication.`,
      };
    case "countries":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是国家名，常和 in / uit 一起用。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are country names, often used with in / uit.`,
      };
    case "formal-address":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是称呼或称谓相关词。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are address/title words.`,
      };
    case "work":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是工作场景里的常用词。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in work situations.`,
      };
    default:
      return {
        zh: sourceIsHead ? headPrefix : `${headText(sourceText, target)} 有明确的同类语义关系。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} have a clear semantic category link.`,
      };
  }
}

function headText(sourceText: string, target: string) {
  return `${sourceText} 和 ${target}`;
}

function allowLexiconOnlyTarget(type: MemoryBubbleRelationType) {
  return [
    "compound-part",
    "compound-parent",
    "compound-family",
    "part-related",
    "verb-form",
    "verb-noun-pair",
    "comparative-superlative",
    "time-contrast",
    "time-category",
    "english-bridge",
    "word-family",
    "synonym",
    "opposite",
    "category-member",
    "scenario-word",
    "action-object",
    "state-action",
  ].includes(type);
}

function candidate(
  analysis: WordAnalysis,
  target: string,
  relationType: MemoryBubbleRelationType,
  allWords: WordItem[],
  data: {
    reasonZh: string;
    reasonEn: string;
    evidence: MemoryBubbleCandidate["evidence"];
    source?: MemoryBubbleCandidate["source"];
    strength?: MemoryBubbleCandidate["strength"];
    confidence?: MemoryBubbleCandidate["confidence"];
    targetMeaning?: MemoryBubbleCandidate["targetMeaning"];
    isExtensionWord?: boolean;
  },
): MemoryBubbleCandidate | undefined {
  const wordMap = wordMapFor(allWords);
  const targetWord = targetAvailable(target, wordMap);
  const targetMeaning = targetWord?.meaning ?? data.targetMeaning ?? targetMeaningFor(target);
  const canUseExtension = !targetWord && Boolean(targetMeaning) && allowLexiconOnlyTarget(relationType);
  if (relationType !== "english-bridge" && phraseLikeTarget(target)) return undefined;
  if (!targetWord && !canUseExtension && relationType !== "english-bridge") return undefined;
  if (!targetWord && !targetMeaning && relationType !== "english-bridge") return undefined;
  const isExtensionWord = data.isExtensionWord ?? canUseExtension;
  return {
    sourceWordId: analysis.word.id,
    sourceText: analysis.word.dutch,
    targetWordId: targetWord?.id,
    targetText: titleFor(target),
    targetMeaning,
    targetExistsInVocabulary: Boolean(targetWord),
    isExtensionWord,
    isExtensionTarget: isExtensionWord,
    relationType,
    source: data.source ?? "rule",
    evidence: data.evidence,
    reasonZh: data.reasonZh,
    reasonEn: data.reasonEn,
    strength: data.strength ?? (data.evidence === "candidate" ? "weak" : "medium"),
    confidence: data.confidence ?? (data.evidence === "candidate" ? "low" : "medium"),
    showToLearner: true,
    sourceLevel: analysis.word.level,
    targetLevel: targetWord?.level,
  };
}

function pairCandidates(
  analysis: WordAnalysis,
  allWords: WordItem[],
  pairs: ReadonlyArray<ReadonlyArray<string>>,
  relationType: MemoryBubbleRelationType,
  reason: (target: string, group: ReadonlyArray<string>) => { zh: string; en: string },
  evidence: MemoryBubbleCandidate["evidence"] = "lexicon",
) {
  const source = analysis.normalizedForm;
  return pairs.flatMap((group) => {
    if (!group.map(normalizeWordText).includes(source)) return [];
    return group
      .filter((item) => normalizeWordText(item) !== source)
      .map((target) => {
        const text = reason(target, group);
        return candidate(analysis, target, relationType, allWords, {
          evidence,
          source: "seed",
          reasonZh: text.zh,
          reasonEn: text.en,
          strength: "strong",
          confidence: "high",
        });
      })
      .filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateCompoundRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const parentRelations = Object.entries(relationLexicons.compoundParts).flatMap(([compound, parts]) => {
    if (normalizeWordText(compound) === analysis.normalizedForm) return [];
    if (!parts.map(normalizeWordText).includes(analysis.normalizedForm)) return [];
    return candidate(analysis, compound, "compound-family", allWords, {
      evidence: "lexicon",
      source: "rule",
      targetMeaning: targetMeaningFor(compound),
      reasonZh: `${compound} 里藏着 ${analysis.word.dutch} 这一块。先认出这块，整词就不用硬背。`,
      reasonEn: `${compound} contains ${analysis.word.dutch}. Spot that piece first, then the full word is easier to remember.`,
      strength: "medium",
      confidence: "high",
    });
  }).filter(Boolean) as MemoryBubbleCandidate[];

  return parentRelations;
}

export function generateWordFormationRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return analyzeWordFormationFromAnalysis(analysis, allWords);
}

export function generateVerbFormRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (analysis.wordType !== "verb") return [];

  const source = analysis.normalizedForm;
  const base = normalizeWordText(analysis.baseForm);
  const targets = new Set<string>();

  if (base && base !== source) {
    targets.add(analysis.baseForm);
  }

  if (base === source) {
    allWords
      .filter((word) => normalizeWordText(word.dutch) !== source)
      .filter((word) => inferWordType(word) === "verb")
      .filter((word) => analyzeWord(word, allWords).baseForm === source)
      .slice(0, 3)
      .forEach((word) => targets.add(word.dutch));
  }

  return Array.from(targets)
    .map((target) => {
      const targetKey = normalizeWordText(target);
      const targetIsBase = targetKey === base;
      return candidate(analysis, target, "verb-form", allWords, {
        evidence: "safe-rule",
        source: "rule",
        targetMeaning: targetMeaningFor(target),
        reasonZh: targetIsBase
          ? `${analysis.word.dutch} 是 ${target} 的当前动词形式；先认出这个形式，再回到动词原形 ${target}。`
          : `${target} 是 ${analysis.word.dutch} 的当前动词形式；把它和动词原形 ${analysis.word.dutch} 连起来记。`,
        reasonEn: targetIsBase
          ? `${analysis.word.dutch} is a current verb form of ${target}; learn the form, then connect it back to the infinitive ${target}.`
          : `${target} is a current verb form of ${analysis.word.dutch}; connect it back to the infinitive ${analysis.word.dutch}.`,
        strength: "strong",
        confidence: "high",
      });
    })
    .filter(Boolean) as MemoryBubbleCandidate[];
}

function derivationRelationTypeFor(group: { reasonZh: string; reasonEn: string }): MemoryBubbleRelationType {
  const reason = `${group.reasonZh} ${group.reasonEn}`.toLowerCase();
  if (/ik\/命令形式|命令形式|imperative form|ik form/.test(reason)) return "verb-form";
  if (/名词.*动词|动词.*名词|noun.*verb|verb.*noun/.test(reason)) return "verb-noun-pair";
  return "word-family";
}

export function generateDerivationRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return relationLexicons.derivationGroups.flatMap((group) => {
    const members = group.words;
    if (!members.map(normalizeWordText).includes(analysis.normalizedForm)) return [];
    const relationType = derivationRelationTypeFor(group);
    return members
      .filter((member) => normalizeWordText(member) !== analysis.normalizedForm)
      .map((target) => candidate(analysis, target, relationType, allWords, {
        evidence: "lexicon",
        source: "seed",
        reasonZh: group.reasonZh,
        reasonEn: group.reasonEn,
        strength: "strong",
        confidence: "high",
      }))
      .filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateSafeRootFamilyRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  const compoundSource = isCompoundSource(analysis);
  return safeCoreRootsFor(analysis, allWords).flatMap((root) => {
    const rootMeaning = targetMeaningFor(root);
    return rootFamilyTargets(root, allWords)
      .filter((target) => normalizeWordText(target) !== source)
      .filter((target) => shouldShowRootFamilyTarget(analysis, root, target, allWords))
      .slice(0, 5)
      .map((target) => candidate(analysis, target, "word-family", allWords, {
        evidence: rootMeaning && !compoundSource ? "lexicon" : "safe-rule",
        source: "rule",
        targetMeaning: targetMeaningFor(target),
        reasonZh: rootMeaning
          ? `${analysis.word.dutch} 和 ${target} 都带着 ${root}（${rootMeaning.zh}）这块意思，像一组亲戚词。`
          : `${analysis.word.dutch} 和 ${target} 有共同的词形线索，放在一起更容易记。`,
        reasonEn: rootMeaning
          ? `${analysis.word.dutch} and ${target} both carry ${root} (${rootMeaning.en}), like words in the same family.`
          : `${analysis.word.dutch} and ${target} share a form clue, so they are easier to learn together.`,
        strength: compoundSource ? "medium" : "strong",
        confidence: compoundSource ? "medium" : "high",
      }))
      .filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateVerbNounPairRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  return relationLexicons.verbNounPairs.flatMap(([noun, verb, reasonZh, reasonEn]) => {
    const nounKey = normalizeWordText(noun);
    const verbKey = normalizeWordText(verb);
    if (source !== nounKey && source !== verbKey && analysis.baseForm !== verbKey) return [];
    const target = source === nounKey ? verb : noun;
    return candidate(analysis, target, "verb-noun-pair", allWords, {
      evidence: "lexicon",
      source: "seed",
      targetMeaning: targetMeaningFor(target),
      reasonZh,
      reasonEn,
      strength: "strong",
      confidence: "high",
    });
  }).filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateOppositeRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return pairCandidates(
    analysis,
    allWords,
    relationLexicons.opposites,
    "opposite",
    (target) => oppositeSenseReason(analysis.word.dutch, target),
  );
}

function oppositeSenseReason(source: string, target: string) {
  const sourceKey = normalizeWordText(source);
  const targetKey = normalizeWordText(target);
  const key = [sourceKey, targetKey].sort().join("|");
  const notes: Record<string, { zh: string; en: string }> = {
    "begin|stop": {
      zh: "begin 和 stop 是动作开关：开始 ↔ 停止。口令和练习里常成对出现。",
      en: "begin and stop form an action switch: start versus stop. They often appear as commands or practice cues.",
    },
    "beginnen|stoppen": {
      zh: "beginnen 是开始做某事，stoppen 是停下来；这是清楚的动作反义/对比。",
      en: "beginnen means to start doing something; stoppen means to stop. This is a clear action contrast.",
    },
    "beginnen|eindigen": {
      zh: "beginnen 是开始，eindigen 是结束；适合按时间顺序成对记。",
      en: "beginnen is to begin; eindigen is to end. Learn them as a time-order contrast.",
    },
    "aanmelden|afmelden": {
      zh: "aanmelden 是报名/登记，afmelden 是取消登记或退出报名；前缀 aan/af 表示相反动作方向。",
      en: "aanmelden is to register; afmelden is to deregister/cancel registration. The prefixes aan/af point in opposite directions.",
    },
    "aanwezig|afwezig": {
      zh: "aanwezig 是在场，afwezig 是缺席；课堂和工作考勤里成对出现。",
      en: "aanwezig means present; afwezig means absent. They pair naturally in attendance contexts.",
    },
    "aanwezigheid|afwezigheid": {
      zh: "aanwezigheid 是出勤/在场，afwezigheid 是缺勤；这是考勤里的名词对照。",
      en: "aanwezigheid is attendance/presence; afwezigheid is absence. This is a noun contrast for attendance.",
    },
    "bruto|netto": {
      zh: "bruto 是税前/总额，netto 是税后/净额；工资和税务里必须成对区分。",
      en: "bruto is gross; netto is net. They must be contrasted in salary and tax contexts.",
    },
    "afwijzing|goedkeuring": {
      zh: "goedkeuring 是批准，afwijzing 是拒绝；官方信件里常见的决定结果对照。",
      en: "goedkeuring is approval; afwijzing is rejection. They contrast decision outcomes in official letters.",
    },
    "downloaden|uploaden": {
      zh: "uploaden 是上传，downloaden 是下载；数字办事里方向相反。",
      en: "uploaden means upload; downloaden means download. The digital direction is opposite.",
    },
    "inloggen|uitloggen": {
      zh: "inloggen 是登录，uitloggen 是退出登录；账户操作里的进/出对照。",
      en: "inloggen is log in; uitloggen is log out. They form an in/out account-action pair.",
    },
    "instappen|uitstappen": {
      zh: "instappen 是上车，uitstappen 是下车；公共交通里成对记。",
      en: "instappen is to get on; uitstappen is to get off. They pair naturally in public transport.",
    },
    "fulltime|parttime": {
      zh: "fulltime 是全职，parttime 是兼职/非全职；求职和合同里要对照理解。",
      en: "fulltime is full-time; parttime is part-time. Contrast them in job and contract contexts.",
    },
  };
  return notes[key] ?? {
    zh: `${source} 和 ${target} 是明确的反义/对比关系，适合成对记。`,
    en: `${source} and ${target} form a clear opposite/contrast pair, useful to learn together.`,
  };
}

export function generateComparativeRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return pairCandidates(
    analysis,
    allWords,
    relationLexicons.comparatives,
    "comparative-superlative",
    (_target, group) => ({
      zh: `${group.join(" → ")} 是一组比较级/最高级。`,
      en: `${group.join(" → ")} is a comparative/superlative family.`,
    }),
  );
}

export function generateCategoryRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  return relationLexicons.categories.flatMap((category) => {
    const heads = category.heads.map(normalizeWordText);
    const members = category.members.map(normalizeWordText);
    const sourceIsHead = heads.includes(source);
    const sourceIsMember = members.includes(source);
    if (!sourceIsHead && !sourceIsMember) return [];
    const hasRoleAwareScenario = relationLexicons.scenarioRelations.some(([from]) => normalizeWordText(from) === source);
    if (hasRoleAwareScenario) return [];
    if (category.id === "family" && !sourceIsHead) return [];
    if (shouldSuppressBroadCategoryRelation(analysis, category.id, sourceIsHead)) return [];
    const sourceHasActionObjects = Boolean(relationLexicons.actionObjects[analysis.baseForm] ?? relationLexicons.actionObjects[analysis.normalizedForm]);
    const targets = sourceIsHead
      ? [
          ...category.heads.filter((head) => normalizeWordText(head) !== source),
          ...(sourceHasActionObjects ? [] : category.members),
        ]
      : [
          ...category.heads.filter((head) => targetAvailable(head, wordMapFor(allWords))),
          ...category.members.filter((member) => normalizeWordText(member) !== source),
        ];
    const configuredLimit = "headPreviewLimit" in category && typeof category.headPreviewLimit === "number"
      ? category.headPreviewLimit
      : undefined;
    const targetLimit = configuredLimit ?? (sourceIsHead && category.members.length > 8 ? 4 : 6);
    return targets.slice(0, targetLimit).map((target) => {
      const reason = categoryReasonFor(category.id, analysis.word.dutch, target, sourceIsHead);
      return candidate(analysis, target, "category-member", allWords, {
        evidence: "lexicon",
        source: "seed",
        reasonZh: reason.zh,
        reasonEn: reason.en,
        strength: sourceIsHead ? "strong" : "medium",
        confidence: sourceIsHead ? "high" : "medium",
      });
    }).filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateSameCategoryFallbackRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (usesStrictAssociations(analysis)) return [];
  const source = analysis.normalizedForm;
  const contextTags = new Set(contextTagsFor(analysis));
  return relationLexicons.categories.flatMap((category) => {
    const categoryKeys = new Set([category.id, ...category.tags].map(normalizeWordText));
    if (![...contextTags].some((tag) => categoryKeys.has(tag))) return [];
    const targets = [...category.heads, ...category.members]
      .filter((target) => normalizeWordText(target) !== source)
      .filter((target) => !phraseLikeTarget(target))
      .filter((target) => targetAvailable(target, wordMapFor(allWords)) || targetMeaningFor(target))
      .slice(0, 4);
    return targets.map((target) => {
      const reason = categoryReasonFor(category.id, analysis.word.dutch, target, false);
      return candidate(analysis, target, "category-member", allWords, {
        evidence: "safe-rule",
        source: "rule",
        targetMeaning: targetMeaningFor(target),
        reasonZh: reason.zh,
        reasonEn: reason.en,
        strength: "medium",
        confidence: "medium",
      });
    }).filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateScenarioRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  return relationLexicons.scenarioRelations
    .filter(([from]) => normalizeWordText(from) === source)
    .map(([_, target, type]) => candidate(analysis, target, type as MemoryBubbleRelationType, allWords, {
      evidence: "lexicon",
      source: "seed",
      reasonZh: `${analysis.word.dutch} 和 ${target} 常在同一个生活任务里碰到，放在一起记更顺。`,
      reasonEn: `${analysis.word.dutch} and ${target} often appear in the same real-life task, so learning them together helps.`,
      strength: "strong",
      confidence: "high",
    }))
    .filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateScenarioAnchorFallbackRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (usesStrictAssociations(analysis)) return [];
  const source = analysis.normalizedForm;
  return contextTagsFor(analysis).flatMap((tag) => {
    const anchors = relationLexicons.scenarioAnchors[tag] ?? [];
    return anchors
      .filter((target) => normalizeWordText(target) !== source)
      .filter((target) => !phraseLikeTarget(target))
      .filter((target) => targetAvailable(target, wordMapFor(allWords)) || targetMeaningFor(target))
      .slice(0, 4)
      .map((target) =>
        candidate(analysis, target, "scenario-word", allWords, {
          evidence: "safe-rule",
          source: "rule",
          targetMeaning: targetMeaningFor(target),
          reasonZh: `${analysis.word.dutch} 在「${tag}」场景里常和 ${target} 一起出现。`,
          reasonEn: `${analysis.word.dutch} and ${target} naturally belong to the ${tag} scenario.`,
          strength: "medium",
          confidence: "medium",
        }),
      )
      .filter(Boolean) as MemoryBubbleCandidate[];
  });
}

export function generateActionObjectRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const direct = relationLexicons.actionObjects[analysis.baseForm] ?? relationLexicons.actionObjects[analysis.normalizedForm] ?? [];
  const directCandidates = direct.map((target) => candidate(analysis, target, "action-object", allWords, {
    evidence: "lexicon",
    source: "seed",
    reasonZh: `${target} 是 ${analysis.word.dutch} 常见连接的对象词。`,
    reasonEn: `${target} is a common object linked to ${analysis.word.dutch}.`,
    strength: "strong",
    confidence: "high",
  }));

  const reverseCandidates = Object.entries(relationLexicons.actionObjects).flatMap(([action, objects]) => {
    if (!objects.map(normalizeWordText).includes(analysis.normalizedForm)) return [];
    return candidate(analysis, action, "action-object", allWords, {
      evidence: "lexicon",
      source: "seed",
      reasonZh: `${analysis.word.dutch} 常和 ${action} 这个动作连在一起。`,
      reasonEn: `${analysis.word.dutch} commonly links to the action ${action}.`,
      strength: "medium",
      confidence: "high",
    });
  });

  return [...directCandidates, ...reverseCandidates].filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateStateActionRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const direct = relationLexicons.stateActions[analysis.normalizedForm] ?? [];
  const directCandidates = direct.map((target) => candidate(analysis, target, "state-action", allWords, {
    evidence: "lexicon",
    source: "seed",
    reasonZh: `${analysis.word.dutch} 是状态词，${target} 是自然相关的动作/处理方式。`,
    reasonEn: `${analysis.word.dutch} is a state word; ${target} is a natural related action.`,
    strength: "strong",
    confidence: "high",
  }));

  const reverseCandidates = Object.entries(relationLexicons.stateActions).flatMap(([state, actions]) => {
    if (!actions.map(normalizeWordText).includes(analysis.baseForm) && !actions.map(normalizeWordText).includes(analysis.normalizedForm)) return [];
    return candidate(analysis, state, "state-action", allWords, {
      evidence: "lexicon",
      source: "seed",
      reasonZh: `${state} 是状态，${analysis.word.dutch} 是对应的动作/处理方式。`,
      reasonEn: `${state} is the state; ${analysis.word.dutch} is the related action.`,
      strength: "medium",
      confidence: "high",
    });
  });

  return [...directCandidates, ...reverseCandidates].filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateDeclaredRelatedWordRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const wordMap = wordMapFor(allWords);
  const direct = analysis.word.relatedWords ?? [];
  const targets = Array.from(new Set(direct.map(normalizeWordText)))
    .filter((target) => target && target !== analysis.normalizedForm && !phraseLikeTarget(target));

  return targets.flatMap((target) => {
    const targetWord = wordMap.get(target);
    if (usesStrictAssociations(analysis) && !isReciprocalRelated(analysis.word, targetWord)) return [];
    const bucket = safeRelatedBucketFor(analysis.word, targetWord, target);
    if (!bucket) return [];
    if (bucket.id === "basic-actions") return [];
    const targetType = targetWord ? inferWordType(targetWord) : undefined;
    if (
      (analysis.wordType === "function-word" || targetType === "function-word") &&
      (!bucket || !functionWordRelatedBuckets.has(bucket.id))
    ) {
      return [];
    }
    const relationType = bucket?.relationType ?? "scenario-word";
    const bucketZh = bucket?.labelZh ?? "同一学习场景";
    const bucketEn = bucket?.labelEn ?? "the same learning context";
    const targetText = targetWord?.dutch ?? target;

    return candidate(analysis, targetText, relationType, allWords, {
      evidence: "safe-rule",
      source: "rule",
      targetMeaning: targetMeaningFor(targetText),
      reasonZh: `${analysis.word.dutch} 和 ${targetText} 都属于${bucketZh}，真实使用时经常能一起遇到。`,
      reasonEn: `${analysis.word.dutch} and ${targetText} both belong to ${bucketEn}, and you often meet them together in real use.`,
      strength: bucket ? "strong" : "medium",
      confidence: bucket ? "high" : "medium",
    });
  }).filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateWordTypeFallbackRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (analysis.wordType === "language-name") {
    return ["Nederlands", "Engels", "Chinees", "spreken", "leren", "begrijpen"]
      .filter((target) => normalizeWordText(target) !== analysis.normalizedForm)
      .map((target) => candidate(analysis, target, "scenario-word", allWords, {
        evidence: "safe-rule",
        source: "rule",
        targetMeaning: targetMeaningFor(target),
        reasonZh: `${analysis.word.dutch} 是语言名，常和 ${target} 放在语言学习/交流场景里记。`,
        reasonEn: `${analysis.word.dutch} is a language name and naturally connects with ${target}.`,
        strength: "medium",
        confidence: "medium",
      }))
      .filter(Boolean) as MemoryBubbleCandidate[];
  }

  if (analysis.wordType === "verb") {
    return generateVerbNounPairRelations(analysis, allWords);
  }

  if (analysis.wordType === "adjective") {
    return [
      ...generateOppositeRelations(analysis, allWords),
      ...generateComparativeRelations(analysis, allWords),
    ];
  }

  if (analysis.wordType === "noun") {
    return [
      ...generateSameCategoryFallbackRelations(analysis, allWords),
      ...generateScenarioAnchorFallbackRelations(analysis, allWords),
    ];
  }

  return [];
}

function learningContextKeysFor(analysis: WordAnalysis) {
  const source = analysis.normalizedForm;
  const tokens = source.split(/[^a-zA-ZÀ-ÿ]+/).map(normalizeWordText).filter(Boolean);
  const keys = Object.keys(relationLexicons.learningContextRelations);
  return keys.filter((key) => {
    const normalized = normalizeWordText(key);
    return source === normalized || analysis.baseForm === normalized || tokens.includes(normalized);
  });
}

export function generateLearningContextRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return learningContextKeysFor(analysis).flatMap((key) =>
    relationLexicons.learningContextRelations[key].map((relation) =>
      candidate(analysis, relation.target, relation.relationType as MemoryBubbleRelationType, allWords, {
        evidence: "lexicon",
        source: "seed",
        targetMeaning: targetMeaningFor(relation.target),
        reasonZh: relation.reasonZh,
        reasonEn: relation.reasonEn,
        strength: relation.strength ?? "strong",
        confidence: "high",
      }),
    ).filter(Boolean) as MemoryBubbleCandidate[],
  );
}

export function generateConfusionRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  return relationLexicons.confusionPairs.flatMap(([a, b, reasonZh, reasonEn]) => {
    if (source !== normalizeWordText(a) && source !== normalizeWordText(b)) return [];
    const target = source === normalizeWordText(a) ? b : a;
    return candidate(analysis, target, "confusion-pair", allWords, {
      evidence: "lexicon",
      source: "seed",
      reasonZh,
      reasonEn,
      strength: "strong",
      confidence: "high",
    });
  }).filter(Boolean) as MemoryBubbleCandidate[];
}

function synonymSenseReason(source: string, target: string) {
  const sourceKey = normalizeWordText(source);
  const targetKey = normalizeWordText(target);
  const key = [sourceKey, targetKey].sort().join("|");
  const notes: Record<string, { zh: string; en: string }> = {
    "goed|prima": {
      zh: "词典义对比：prima = heel goed / uitstekend，goed 是最通用的“好”。prima 更像“很好、可以、没问题”。",
      en: "Dictionary sense: prima means very good/excellent; goed is the general word for good. Prima often means fine/okay/great.",
    },
    "fijn|prima": {
      zh: "词典义对比：prima 偏“很好/可以”，fijn 偏“愉快、舒服、令人感觉好”。都能表示正向评价，但语气不同。",
      en: "Dictionary sense: prima is fine/very good, while fijn is pleasant/nice. Both are positive, but the tone differs.",
    },
    "oké|prima": {
      zh: "词典义对比：oké 和 prima 都能用来表示“可以/没问题”。prima 往往比 oké 更积极一点。",
      en: "Dictionary sense: oké and prima can both mean okay/fine. Prima is often a little more positive.",
    },
    "prima|uitstekend": {
      zh: "词典义对比：prima 常被解释为 heel goed / uitstekend，所以 uitstekend 是更明确的“非常好、优秀”。",
      en: "Dictionary sense: prima is often explained as very good/excellent; uitstekend is the explicit excellent word.",
    },
    "best|prima": {
      zh: "词典义对比：prima 和 best 都能表示“很好/相当好”，适合放在正向评价词里一起记。",
      en: "Dictionary sense: prima and best can both express very good/quite good, so they belong together as positive evaluations.",
    },
    "fijn|goed": {
      zh: "词典义对比：goed 是通用的“好”，fijn 更偏“感觉好、愉快、舒服”。",
      en: "Dictionary sense: goed is general good; fijn is more about pleasant, nice, or comfortable.",
    },
    "goed|oké": {
      zh: "词典义对比：goed 是“好”，oké 是“可以/同意”。在回答别人时都能表示认可。",
      en: "Dictionary sense: goed means good; oké means okay/agreed. In replies, both can show acceptance.",
    },
    "fijn|leuk": {
      zh: "词典义对比：fijn 的常见义是 leuk / prettig；leuk 更偏“有趣、不错”。",
      en: "Dictionary sense: fijn overlaps with leuk/prettig; leuk is more nice/fun.",
    },
    "fijn|prettig": {
      zh: "词典义对比：fijn 和 prettig 都偏“愉快、舒服”，prettig 更书面/中性一点。",
      en: "Dictionary sense: fijn and prettig both mean pleasant; prettig is a little more neutral/formal.",
    },
    "aangenaam|fijn": {
      zh: "词典义对比：fijn 的同义词里有 aangenaam；两者都表示“令人舒服、愉快”。",
      en: "Dictionary sense: aangenaam is listed with fijn; both mean pleasant or agreeable.",
    },
    "goed|mooi": {
      zh: "词典义对比：goed 是通用“好”，mooi 常是“好看/漂亮”，也可口语里表示“好、不错”。",
      en: "Dictionary sense: goed is general good; mooi is usually beautiful/nice and can also mean good in context.",
    },
    "fijn|mooi": {
      zh: "词典义对比：fijn 偏“感觉好”，mooi 偏“好看/不错”。都属于正向评价词。",
      en: "Dictionary sense: fijn is pleasant; mooi is beautiful/nice. Both are positive evaluation words.",
    },
    "mooi|prima": {
      zh: "词典义对比：prima 偏“很好/可以”，mooi 偏“好看/不错”。都可用于正向评价，但适用对象不同。",
      en: "Dictionary sense: prima is fine/very good; mooi is beautiful/nice. Both are positive but used for different targets.",
    },
  };
  return notes[key] ?? {
    zh: `线上词典把 ${source} 和 ${target} 放在近义/同义范围里；先按“意思接近，但语气和场景不同”来对照记。`,
    en: `Online dictionaries place ${source} and ${target} in a close synonym range; learn them as close in meaning with different tone or usage.`,
  };
}

export function generateSynonymRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  return pairCandidates(
    analysis,
    allWords,
    relationLexicons.synonyms,
    "synonym",
    (target) => synonymSenseReason(analysis.word.dutch, target),
  );
}

export function generateEnglishBridgeRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const bridge = relationLexicons.englishBridges[analysis.normalizedForm] ?? analysis.word.englishBridge;
  if (!bridge || bridge.trim().split(/\s+/).length > 1 || /[.!?]/.test(bridge)) return [];
  return [
    candidate(analysis, bridge, "english-bridge", allWords, {
      evidence: "lexicon",
      source: "seed",
      reasonZh: `${analysis.word.dutch} 可以用英文 ${bridge} 做记忆桥。`,
      reasonEn: `${analysis.word.dutch} can use English ${bridge} as a memory bridge.`,
      strength: "medium",
      confidence: "medium",
    }),
  ].filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateAllRuleCandidates(analysis: WordAnalysis, allWords: WordItem[]) {
  const primaryCandidates = [
    ...generateWordFormationRelations(analysis, allWords),
    ...generateCompoundRelations(analysis, allWords),
    ...generateVerbFormRelations(analysis, allWords),
    ...generateVerbNounPairRelations(analysis, allWords),
    ...generateDerivationRelations(analysis, allWords),
    ...generateSafeRootFamilyRelations(analysis, allWords),
    ...generateSynonymRelations(analysis, allWords),
    ...generateOppositeRelations(analysis, allWords),
    ...generateComparativeRelations(analysis, allWords),
    ...generateCategoryRelations(analysis, allWords),
    ...generateScenarioRelations(analysis, allWords),
    ...generateActionObjectRelations(analysis, allWords),
    ...generateStateActionRelations(analysis, allWords),
    ...generateLearningContextRelations(analysis, allWords),
    ...generateConfusionRelations(analysis, allWords),
    ...generateDeclaredRelatedWordRelations(analysis, allWords),
    ...generateEnglishBridgeRelations(analysis, allWords),
  ];
  const hasUsablePrimary = primaryCandidates.some((candidate) =>
    candidate.showToLearner &&
    candidate.strength !== "weak" &&
    candidate.confidence !== "low",
  );
  const fallbackCandidates = hasUsablePrimary
    ? []
    : allowsLooseFallbackRelations(analysis)
      ? [
        ...generateSameCategoryFallbackRelations(analysis, allWords),
        ...generateScenarioAnchorFallbackRelations(analysis, allWords),
        ...generateWordTypeFallbackRelations(analysis, allWords),
      ]
      : [];
  return [...primaryCandidates, ...fallbackCandidates];
}
