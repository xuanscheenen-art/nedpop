import { relationLexicons } from "@/data/relationLexicons";
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
};

const strongCategoryRelationIds = new Set([
  "body-parts",
  "relative-days",
  "day-parts",
  "ordinal-order",
  "months",
  "weekdays",
  "sequence-time",
  "frequency-time",
  "countries",
  "languages",
  "family",
  "colors",
  "food-drink",
  "directions-position",
  "question-words",
  "function-connectors",
  "modal-verbs",
  "have-forms",
  "marital-status",
  "formal-email-writing",
  "text-reading",
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
]);

const concreteTaskTags = new Set([
  "form",
  "gemeente",
  "housing",
  "email",
  "writing",
  "reading",
  "transport",
  "supermarket",
  "bill",
  "insurance",
  "family",
  "health",
  "job-search",
  "digital",
]);

const associationClusters = [
  {
    id: "insurance-task",
    label: text("保险理赔任务", "insurance and claims"),
    words: ["basisverzekering", "aanvullende verzekering", "zorgverzekeraar", "polisnummer", "polisblad", "verzekerde", "declareren", "nota", "vergoeden", "niet vergoed", "eigen bijdrage", "zorgverlener", "machtiging", "klantenservice", "wijzigen", "opzeggen"],
  },
  {
    id: "care-family-task",
    label: text("照护和家庭办事", "care and family administration"),
    words: ["mantelzorg", "zorg nodig hebben", "oppas", "kinderopvangtoeslag", "ouderlijk gezag", "noodcontact", "contactgegevens", "familielid", "samen aanvragen", "iemand machtigen", "toestemmingsformulier", "zorgafspraak", "begeleiding", "huishoudelijke hulp", "rolstoel", "hulpmiddel", "aanpassing", "ondersteuning"],
  },
  {
    id: "workplace-roles-task",
    label: text("学校/职场角色", "school and workplace roles"),
    words: ["conciërge", "directeur", "eigenaar", "personeel", "receptie", "kantoor", "afdeling", "medewerker", "teamleider", "collega", "werkgever", "werknemer"],
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

function closeGreetingGroupFor(term: string) {
  const key = normalizeDutch(term);
  return closeGreetingGroups.find((group) => group.map(normalizeDutch).includes(key));
}

function isCloseGreetingPair(sourceText: string, targetText: string) {
  const sourceGroup = closeGreetingGroupFor(sourceText);
  if (!sourceGroup) return false;
  return sourceGroup.map(normalizeDutch).includes(normalizeDutch(targetText));
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
      `${sourceText} 和 ${targetText} 都在身体地图上，指部位时能互相定位。`,
      `${sourceText} and ${targetText} both sit on the body map, so they help locate body parts.`,
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
  if (categoryId === "marital-status") {
    return text(
      `${sourceText} 和 ${targetText} 都是表格里“婚姻状况/家庭状态”的选项，适合放在同一组记。`,
      `${sourceText} and ${targetText} are marital or family-status options on forms, so they belong in one set.`,
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

const looseGeneratedRelationTypes = new Set<MemoryRelationType>(["category-member", "scenario-word", "action-object", "state-action"]);
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
  if (source.phraseChunks.some((chunk) => normalizeDutch(chunk).includes(normalizeDutch(targetText)))) {
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
      const isPhraseChunkPart = selected.phraseChunks.some((chunk) => normalizeDutch(chunk).includes(targetKey));
      const isGreetingPair = isCloseGreetingPair(sourceKey, targetKey);
      const hasConcreteTaskLink = sharedTags.some((tag) => concreteTaskTags.has(tag));
      if (!isVisibleWordPiece && !sharedCategory && !isPhraseChunkPart && !isGreetingPair && !hasConcreteTaskLink) {
        return [];
      }
      if (!isVisibleWordPiece && !sharedCategory && !isPhraseChunkPart && !isGreetingPair && !hasConcreteTaskLink && !match) {
        return [];
      }
      const relationType: MemoryRelationType = isVisibleWordPiece
        ? "compound-part"
        : sharedCategory === "relative-days" || sharedCategory === "day-parts"
          ? "time-contrast"
          : sharedCategory
            ? "category-member"
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

function learnerReasonFor(source: WordItem, association: Pick<WordAssociation, "dutch" | "meaning" | "type" | "reason">): LocalizedText {
  const original = association.reason;
  const reasonText = `${original.zh} ${original.en}`;
  if (!technicalReasonPattern.test(reasonText)) return original;

  const target = association.dutch;
  const targetZh = association.meaning?.zh ? `（${association.meaning.zh}）` : "";
  const targetEn = association.meaning?.en ? ` (${association.meaning.en})` : "";
  const sourceText = source.dutch;

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
  "word-family": 88,
  "compound-family": 86,
  "compound-parent": 84,
  synonym: 82,
  opposite: 82,
  "time-contrast": 80,
  "comparative-superlative": 80,
  "action-object": 78,
  "state-action": 76,
  "category-member": 70,
  "time-category": 68,
  "scenario-word": 64,
  "confusion-pair": 62,
  "english-bridge": 30,
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
  const vocabularyRank = association.targetExistsInVocabulary ? 2 : 0;
  return typeRank * 100 + sourceRank * 10 + vocabularyRank;
}

const genericAssociationReasonPattern =
  /同一个可说句子|同一个生活任务|同一个生活场景|都常在.+场景|都在看病\/健康任务|都常在看病|能一起组成|same usable sentence|same real-life task|same practical scenario|both appear in .+contexts|both belong to health tasks/i;

function isGenericSameSceneAssociation(association: WordAssociation) {
  const reason = `${association.reason.zh} ${association.reason.en}`;
  return genericAssociationReasonPattern.test(reason);
}

function dedupeAssociations(associations: WordAssociation[], limit: number) {
  const bestByKey = new Map<string, WordAssociation>();
  const firstIndex = new Map<string, number>();
  associations.forEach((association, index) => {
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

  const selected: WordAssociation[] = [];
  const relationCounts = new Map<MemoryRelationType, number>();
  let genericSameSceneCount = 0;

  for (const [, association] of Array.from(bestByKey.entries())
    .sort((left, right) => {
      const rankDiff = associationRank(right[1]) - associationRank(left[1]);
      if (rankDiff) return rankDiff;
      return (firstIndex.get(left[0]) ?? 0) - (firstIndex.get(right[0]) ?? 0);
    })) {
    const relationCount = relationCounts.get(association.type) ?? 0;
    const isGenericSameScene = isGenericSameSceneAssociation(association);
    if (association.type === "scenario-word" && relationCount >= 3) continue;
    if (association.type === "category-member" && relationCount >= 6) continue;
    if (isGenericSameScene && genericSameSceneCount >= 3) continue;
    selected.push(association);
    relationCounts.set(association.type, relationCount + 1);
    if (isGenericSameScene) genericSameSceneCount += 1;
    if (selected.length >= limit) break;
  }

  return selected;
}

const suppressLooseGeneratedRelationsFor = (word: WordItem) =>
  word.dutch.trim().split(/\s+/).filter(Boolean).length > 1;

const isLooseGeneratedAssociation = (association: WordAssociation) =>
  looseGeneratedRelationTypes.has(association.type) && association.source !== "manual" && association.source !== "seed";

const taskTagLabels: Record<string, LocalizedText> = {
  work: text("工作任务", "work tasks"),
  "job-search": text("求职任务", "job search"),
  education: text("学习任务", "education tasks"),
  school: text("学习任务", "study tasks"),
  writing: text("写作任务", "writing tasks"),
  reading: text("阅读任务", "reading tasks"),
  email: text("邮件任务", "email tasks"),
  form: text("表格任务", "form tasks"),
  gemeente: text("市政厅办事", "municipality tasks"),
  digital: text("线上办事", "digital tasks"),
  tax: text("税务/补贴", "tax and benefits"),
  benefits: text("税务/补贴", "tax and benefits"),
  health: text("健康任务", "health tasks"),
  housing: text("住房任务", "housing tasks"),
  transport: text("交通任务", "transport tasks"),
  payment: text("付款任务", "payment tasks"),
  bill: text("账单任务", "bill tasks"),
  complaint: text("投诉任务", "complaint tasks"),
  opinion: text("观点表达", "opinion expression"),
  presentation: text("展示/会议", "presentations and meetings"),
  neighborhood: text("社区任务", "neighborhood tasks"),
  society: text("社会信息", "society and public life"),
  safety: text("安全任务", "safety tasks"),
  legal: text("法律/规定", "legal and rule tasks"),
};

const preferredTaskTags = Object.keys(taskTagLabels);

function taskTagReasonFor(source: WordItem, target: WordItem, tag: string): LocalizedText {
  const label = taskTagLabels[tag] ?? text(tag, tag);
  return text(
    `${source.dutch} 和 ${target.dutch} 都能放进「${label.zh}」里，但作用不同；一起记可以帮你组织一整句话或一段说明。`,
    `${source.dutch} and ${target.dutch} both belong to ${label.en}, but play different roles; learning them together helps build a full sentence or explanation.`,
  );
}

function sharedTaskTagFor(source: WordItem, target: WordItem) {
  const targetTags = new Set(target.scenarioTags.map(normalizeDutch));
  const sourceTags = source.scenarioTags.map(normalizeDutch);
  return preferredTaskTags.find((tag) => sourceTags.includes(tag) && targetTags.has(tag));
}

function taskAnchorAssociationsFor(selected: WordItem, words: WordItem[], existing: WordAssociation[], limit: number): WordAssociation[] {
  if (limit <= 0) return [];
  const sourceKey = normalizeDutch(selected.dutch);
  const existingKeys = new Set(existing.map((association) => normalizeDutch(association.dutch)));
  const selectedTheme = normalizeDutch(selected.theme);
  const candidates = words
    .filter((word) => normalizeDutch(word.dutch) !== sourceKey)
    .filter((word) => !existingKeys.has(normalizeDutch(word.dutch)))
    .filter((word) => word.dutch.trim().split(/\s+/).filter(Boolean).length <= 3)
    .flatMap((word) => {
      const sharedTag = sharedTaskTagFor(selected, word);
      if (!sharedTag) return [];
      const sharedTagCount = selected.scenarioTags.filter((tag) => word.scenarioTags.map(normalizeDutch).includes(normalizeDutch(tag))).length;
      return [{
        word,
        sharedTag,
        score: 20 + sharedTagCount * 4 + (selectedTheme && normalizeDutch(word.theme) === selectedTheme ? 2 : 0) + (word.originalLevel === selected.originalLevel ? 2 : 0),
      }];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return candidates.map(({ word, sharedTag }) => {
    const tag = sharedTag;
    const reason = taskTagReasonFor(selected, word, sharedTag);
    const relationType: MemoryRelationType = ["work", "education", "writing", "reading", "email", "form", "gemeente", "digital", "tax", "benefits", "health", "housing", "transport", "payment", "bill", "complaint", "opinion", "presentation", "neighborhood", "society", "safety", "legal"].includes(tag)
      ? "scenario-word"
      : "category-member";
    return {
      dutch: word.dutch,
      wordId: word.id,
      meaning: word.meaning,
      targetExistsInVocabulary: true,
      isExtensionWord: false,
      isExtensionTarget: false,
      source: "rule",
      type: relationType,
      kind: relationFallbackLabels[relationType],
      reason,
    } satisfies WordAssociation;
  });
}

function minimumAssociationCountFor(word: WordItem) {
  const isB1 = word.originalLevel === "B1" || word.level === "B1" || normalizeDutch(word.theme).startsWith("b1");
  if (!isB1) return 1;
  return word.dutch.trim().split(/\s+/).filter(Boolean).length > 1 ? 4 : 5;
}

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
  const wordByDutch = new Map(associationWords.map((word) => [normalizeDutch(word.dutch), word]));
  const generated = generateRelationsForWord(selected, associationWords, { pageContext: "word-link" })
    .map((relation) => {
      const match = relation.targetWordId
        ? associationWords.find((word) => word.id === relation.targetWordId)
        : wordByDutch.get(normalizeDutch(relation.targetText));
      const extensionMeaning = relationLexicons.baseMorphemes[normalizeDutch(relation.targetText) as keyof typeof relationLexicons.baseMorphemes];
      const usefulRelationMeaning = relation.targetMeaning?.zh || relation.targetMeaning?.en ? relation.targetMeaning : undefined;
      const usefulExtensionMeaning = extensionMeaning?.zh || extensionMeaning?.en ? extensionMeaning : undefined;
      const source: RelationSource | "extension" = (relation.isExtensionWord ?? relation.isExtensionTarget) ? "extension" : relation.relationSource;
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
    ...phraseComponentAssociationsFor(selected, words),
    ...manualLinksFor(selected, associationWords),
    ...relatedWordAssociationsFor(selected, associationWords),
  ];
  const visibleAssociations = [...highSignalAssociations, ...generated]
    .filter((association) => !(suppressLooseGeneratedRelations && isLooseGeneratedAssociation(association)))
    .filter((association) => association.type === "part-related" || !hiddenAdvancedTargets.has(normalizeDutch(association.dutch)));
  const preliminary = dedupeAssociations(visibleAssociations, limit);
  const minimumCount = Math.min(limit, minimumAssociationCountFor(selected));
  if (preliminary.length >= minimumCount) return preliminary;
  const topUp = taskAnchorAssociationsFor(selected, associationWords, preliminary, minimumCount - preliminary.length);
  return dedupeAssociations([...visibleAssociations, ...topUp], limit);
}
