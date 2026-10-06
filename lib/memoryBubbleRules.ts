import { relationLexicons } from "@/data/relationLexicons";
import { inferWordType, infinitiveForWord } from "@/lib/exampleTemplates";
import type { MemoryBubbleCandidate, MemoryBubbleRelationType } from "@/lib/memoryBubbleEngine";
import {
  contextTagsFor,
  functionWordRelatedBuckets,
  hasSharedSemanticContext,
  hasSharedStrictSemanticContext,
  phraseLikeTarget,
  safeRelatedBucketFor,
  shouldSuppressBroadCategoryRelation,
  usesStrictAssociations,
} from "@/lib/memoryBubbleSemantics";
import { analyzeWordFormationFromAnalysis } from "@/lib/wordFormationAnalyzer";
import type { WordAnalysis } from "@/lib/wordAnalysis";
import { analyzeWord, normalizeWordText } from "@/lib/wordAnalysis";
import type { MemoryLink, MemoryLinkType, WordItem } from "@/types/vocabulary";

const wordMapFor = (words: WordItem[]) => new Map(words.map((word) => [normalizeWordText(word.dutch), word]));

const titleFor = (value: string) => value;

const manualLinkTypeMap: Partial<Record<MemoryLinkType, MemoryBubbleRelationType>> = {
  "compound-part": "compound-part",
  "compound-parent": "compound-parent",
  "compound-family": "compound-family",
  "part-related": "part-related",
  "same-family": "word-family",
  "root-family": "word-family",
  "prefix-suffix-family": "word-family",
  "word-family": "word-family",
  derivation: "word-family",
  "number-family": "word-family",
  "verb-noun-pair": "verb-noun-pair",
  synonym: "synonym",
  opposite: "opposite",
  antonym: "opposite",
  similar: "confusion-pair",
  "confusion-pair": "confusion-pair",
  "time-contrast": "time-contrast",
  "time-category": "time-category",
  "comparative-superlative": "comparative-superlative",
  "category-member": "category-member",
  "scenario-word": "scenario-word",
  "scenario-neighbor": "scenario-word",
  "same-scene": "scenario-word",
  "action-object": "action-object",
  "state-action": "state-action",
};

const looseManualLinkTypes = new Set<MemoryLinkType>([
  "phrase-collocation",
  "usage-chunk",
  "scenario-word",
  "scenario-neighbor",
  "same-scene",
  "action-object",
  "state-action",
  "article-family",
  "plural-family",
]);

const weakManualReasonPattern =
  /内容后台设置|creator-set|适合放在同一个记忆泡泡|belongs in the same memory bubble|请补充|add why|和当前词一起记|learn with the current word|同等级|同一天|same level|same day|同一个实用场景|useful neighbors|相关词|可以一起记|适合一起记|礼貌表达词组|按对话来回一起记|看病场景词组|按症状、医生、药房一起记/i;

function manualLinkShouldShow(link: MemoryLink) {
  if (link.showToLearner === false || link.reviewStatus === "rejected") return false;
  if (link.type === "english-bridge" || link.type === "article-family" || link.type === "plural-family") return false;
  const text = `${link.dutch} ${link.explanation.zh} ${link.explanation.en}`.trim();
  if (!link.dutch.trim() || phraseLikeTarget(link.dutch) || weakManualReasonPattern.test(text)) return false;
  if (looseManualLinkTypes.has(link.type) && link.reviewStatus !== "approved") return false;
  return Boolean(manualLinkTypeMap[link.type]);
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
    forms[normalizeWordText(infinitive)] ??= form;
    return forms;
  },
  {},
);

const zijnFormMeanings: Record<string, { zh: string; en: string }> = {
  zijn: { zh: "是 / 存在；动词原形", en: "to be; infinitive" },
  ben: { zh: "我是：ik ben", en: "am: ik ben" },
  bent: { zh: "你/您是：jij/u bent", en: "are: jij/u bent" },
  is: { zh: "他/她/它/这是：hij/zij/het/dit is", en: "is: hij/zij/het/dit is" },
};

const zijnFormOrder = ["zijn", "ben", "bent", "is"];

function isZijnForm(value: string) {
  return Boolean(zijnFormMeanings[normalizeWordText(value)]);
}

function zijnFormReason(source: string, target: string) {
  if (target === "zijn") {
    return {
      zh: `${source} 是动词 zijn 的现在时形式；先连回原形 zijn，再看主语是谁。`,
      en: `${source} is a present-tense form of zijn; link it back to the infinitive zijn, then check the subject.`,
    };
  }
  return {
    zh: `${source} 和 ${target} 都是 zijn 的现在时变位：ik ben，jij/u bent，hij/zij/het is。`,
    en: `${source} and ${target} are present-tense forms of zijn: ik ben, jij/u bent, hij/zij/het is.`,
  };
}

function targetAvailable(target: string, wordMap: Map<string, WordItem>) {
  return wordMap.get(normalizeWordText(target));
}

function targetMeaningFor(target: string) {
  return relationLexicons.baseMorphemes[normalizeWordText(target)];
}

function lexiconCategoryIdsFor(target: string) {
  const key = normalizeWordText(target);
  return relationLexicons.categories
    .filter((category) => {
      const heads = category.heads.map(normalizeWordText);
      const members = category.members.map(normalizeWordText);
      return heads.includes(key) || members.includes(key);
    })
    .map((category) => normalizeWordText(category.id));
}

function sharesExactLexiconCategory(source: string, target: string) {
  const targetIds = new Set(lexiconCategoryIdsFor(target));
  return lexiconCategoryIdsFor(source).some((id) => targetIds.has(id));
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

function isReciprocalRelated(source: WordItem, target: WordItem | undefined) {
  if (!target) return false;
  const sourceKey = normalizeWordText(source.dutch);
  return (target.relatedWords ?? []).map(normalizeWordText).includes(sourceKey);
}

function isCompoundSource(analysis: WordAnalysis) {
  return analysis.possibleCompoundParts.map(normalizeWordText)
    .filter((part) => part && part !== analysis.normalizedForm)
    .length >= 2;
}

function isDeclaredRelated(source: WordItem, targetText: string) {
  const target = normalizeWordText(targetText);
  return (source.relatedWords ?? []).map(normalizeWordText).includes(target);
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

function categoryReasonFor(categoryId: string, sourceText: string, target: string, sourceIsHead = false) {
  const headPrefix = sourceIsHead
    ? `${target} 是 ${sourceText} 这个主题下的具体词。`
    : `${sourceText} 和 ${target}`;
  const headEnPrefix = sourceIsHead
    ? `${target} is a concrete word under the ${sourceText} topic.`
    : `${sourceText} and ${target}`;

  switch (categoryId) {
    case "relative-days":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 在同一条“昨天、今天、明天、后天”的时间线上。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} sit on the same yesterday-today-tomorrow timeline.`,
      };
    case "day-parts":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 是一天里的时间段，按早上、中午、晚上、夜里顺序记。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are parts of the day; learn them in morning-to-night order.`,
      };
    case "meal-times":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在一天的用餐顺序里：早餐、午餐、晚饭/晚餐；maaltijd 是“一餐”的总称。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit in the daily meal order: breakfast, lunch, and dinner; maaltijd is the general word for a meal.`,
      };
    case "number-ones":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是 0-9 的基础数字，先按个位数小表一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are base digits from 0-9; learn them together as the ones table.`,
      };
    case "number-teens":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在十几数字组里；elf/twaalf 特殊，后面多看“数字 + tien”的规律。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit in the teen-number group; elf/twaalf are special, then look for number + tien.`,
      };
    case "number-tens":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是整十数字；重点抓 -tig，同时记住 twintig/dertig/tachtig 这类变形。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are tens; focus on -tig and note forms like twintig/dertig/tachtig.`,
      };
    case "learning-roles":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是学习场景里的人：学生、学员、同学、老师或辅导者。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are people in a learning setting: student, learner, classmate, teacher, or guide.`,
      };
    case "movement-direction":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“来/去/进出/方向”这条线上；komen 和 gaan 要成对记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the come-go-in-out direction line; learn komen and gaan as a pair.`,
      };
    case "transport-route-flow":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在出行路线里：站点、站台、线路、方向、换乘、出发和到达。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to route flow: stop, platform, line, direction, transfer, departure, and arrival.`,
      };
    case "document-proof-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是办事材料里的文件/证明/附件词，适合按材料包一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are document, proof, or attachment words in admin paperwork; learn them as one file pack.`,
      };
    case "open-close-status":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“开/关/开始/结束”状态线上，门、app、流程里都会用到。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the open-close-start-end status line for doors, apps, and processes.`,
      };
    case "validity-expiry":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“有效/无效/过期/到期日”这条状态线上，证件、合同、申请材料里经常一起出现。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the valid-invalid-expired-expiry-date line for documents, contracts, and applications.`,
      };
    case "attendance-status":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“在场/缺席/出勤状态”这条线上，工作、学校和预约场景里常见。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the present-absent-attendance status line for work, school, and appointments.`,
      };
    case "admin-change-confirmation":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是办事流程里的状态词：变更、确认、补偿或相关材料。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are process words for changes, confirmations, compensation, or related documents.`,
      };
    case "healthcare-route":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在看病、转诊、拿药这条流程里，按“就医路线”一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the doctor-referral-medicine route.`,
      };
    case "digital-form-actions":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是填表/上传材料时会碰到的操作词，按表单动作一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are form or document-upload actions.`,
      };
    case "email-status-flow":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在邮件/消息流程里，按发件、收件、草稿、已发送这些状态一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the email/message flow: sender, receiver, draft, sent, and folders.`,
      };
    case "order-return-flow":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在下单、配送、退换货这条线上，适合按购物售后流程记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the order, delivery, return, and service flow.`,
      };
    case "complaint-repair-flow":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在投诉、损坏、原因结果和维修处理这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the complaint, damage, cause-effect, and repair flow.`,
      };
    case "sick-leave-flow":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在感冒、病假、职业健康服务和复工这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the cold, sick leave, occupational health, and return-to-work flow.`,
      };
    case "symptom-treatment-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“症状 -> 检查 -> 用药/处理”这条看病线上，适合按身体反应和治疗动作一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the symptom, check, and treatment line.`,
      };
    case "body-medical-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是身体部位或医疗角色/地点词，适合按“身体和照护”一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are body or care-related medical words.`,
      };
    case "housing-repair-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在租房、住房状态、维修和报修这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the housing, repair, and maintenance line.`,
      };
    case "school-childcare-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在学校/儿童照护这条线上：老师、同学、课程、假期、报名或许可。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the school and childcare line.`,
      };
    case "work-contract-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在工作、合同、排班和工资这条线上，适合按职场材料一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the work, contract, schedule, and pay line.`,
      };
    case "text-structure-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是读写文本时抓结构的词：主题、细节、段落、连接和表达方式。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are text-structure words for reading and writing.`,
      };
    case "civic-safety-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在报警、求助、安全和公共管理这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the report, help, safety, and public-service line.`,
      };
    case "weather-climate-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是天气或气候词，适合按天气预报一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to weather or climate vocabulary.`,
      };
    case "travel-airport-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在旅行证件、边检、行李和预订这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to travel documents, border control, baggage, and booking.`,
      };
    case "tax-income-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在税务、收入和补贴这条线上，适合按办税材料一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the tax, income, and benefits line.`,
      };
    case "finance-bank-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在银行、账户、付款和预算这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the banking, account, payment, and budget line.`,
      };
    case "formal-contact-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在正式邮件/书面联系里，按称呼、主题、正文和结尾一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to formal written contact: address, subject, body, and closing.`,
      };
    case "phone-service-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在电话沟通/客服转接这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the phone contact and service-transfer line.`,
      };
    case "identity-admin-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在身份信息、市政登记或官方材料这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to identity, registration, and official-document vocabulary.`,
      };
    case "social-relation-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在关系、信任、误会、争执或互相支持这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to relationships, trust, misunderstanding, conflict, or support.`,
      };
    case "media-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在媒体/信息来源这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the media and information-source line.`,
      };
    case "art-culture-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在艺术、文化、展览或演出这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to the art, culture, exhibition, or performance line.`,
      };
    case "environment-society-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在环境、污染、气候或可持续这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to environment, pollution, climate, or sustainability vocabulary.`,
      };
    case "society-participation-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在社会参与、平等或社区议题这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to society, equality, or community participation vocabulary.`,
      };
    case "personal-quality-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在性格、习惯、兴趣、能力或态度这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to personality, habit, interest, ability, or attitude vocabulary.`,
      };
    case "practical-problem-series":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在实际问题处理里：哪里不对、是否合适、怎么修正或继续。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to practical problem handling: what is wrong, whether it fits, and how to fix it.`,
      };
    case "cleaning-household":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是清洁/家务动作或工具词，适合按家务流程一起记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are cleaning or household-action words.`,
      };
    case "legal-safety":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在报警、安全、证人、执法或紧急服务这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to reporting, safety, witnesses, enforcement, or emergency services.`,
      };
    case "official-admin-extended":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是官方办事材料里的身份、申请、编号或有效状态词。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are official-administration words for identity, applications, numbers, or validity.`,
      };
    case "communication-actions":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是联系别人时会用到的动作或消息词。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are contact, message, or communication-action words.`,
      };
    case "past-actions":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是常见完成式/过去动作词，看到 ge- 形式时要回到对应动作线。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are common completed-action forms; connect ge- forms back to their action line.`,
      };
    case "body-appearance":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在外貌、身体表现或穿戴这条线上。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to appearance, body expression, or getting dressed.`,
      };
    case "graph-data":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是读表格、图表或数据说明时会碰到的词。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} appear in charts, tables, or data descriptions.`,
      };
    case "b1-connectors":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是 B1 写作/口语里连接句子逻辑的词。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are B1 connectors for linking sentence logic.`,
      };
    case "personal-info":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都常出现在个人信息表或自我介绍里。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both appear in personal-information forms or introductions.`,
      };
    case "naming-words":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在“名字/称呼”这条线上：名字、我叫、把别人称作，要分清谁被叫。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the naming line: name, be called, and call/name someone.`,
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
    case "furniture":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是家里能看见的家具词；bank 在这里按“沙发/长椅”这层意思记。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are furniture words; bank here is the sofa/bench sense.`,
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
    case "opinion-argument":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在表达观点/理由/论证这条线上：意见、原因、例子、优缺点和讨论。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the opinion-reason-argument line: opinion, reason, example, pros/cons, and discussion.`,
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
    case "language-skills":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是语言动作：听、说、读、写、理解，按技能组一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are language actions: listening, speaking, reading, writing, or understanding.`,
      };
    case "digital-click-actions":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在 app/网页操作里：点击、按钮、链接、打开和关闭。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} belong to app/web actions: click, button, link, open, and close.`,
      };
    case "digital-account-actions":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都在账号操作线上：登录、退出、注册、注销、用户名、密码和验证。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} sit on the account-action line: log in, log out, sign up, sign off, username, password, and verification.`,
      };
    case "question-words":
      return {
        zh: sourceIsHead ? headPrefix : `${sourceText} 和 ${target} 都是问词，按“谁/什么/哪里/何时/怎样/哪个”一起认。`,
        en: sourceIsHead ? headEnPrefix : `${sourceText} and ${target} are question words; learn them as who/what/where/when/how/which.`,
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
    case "body-parts":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是身体部位词，放在同一组里一起认。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are body-part words; learn them as one group.`,
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
    case "sequence-time":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都在表达动作或时间顺序：先、之后、马上、稍后。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both express action or time order: first, after that, immediately, or soon.`,
      };
    case "frequency-time":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都在表达频率或周期，适合按“多久一次”一起记。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} both express frequency or period, so learn them as how often words.`,
      };
    case "family":
      return {
        zh: sourceIsHead ? headPrefix : `${headPrefix} 都是亲属/家庭词，放在家庭关系图里更好记。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are family words, easier to remember on one family map.`,
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
        zh: sourceIsHead ? headPrefix : `${headPrefix} 是正式称呼里最常见的一对：meneer 称呼先生，mevrouw 称呼女士。邮件、柜台、电话里先认这一对。`,
        en: sourceIsHead ? headEnPrefix : `${headEnPrefix} are the core formal address pair: meneer for Mr./sir, mevrouw for Ms./madam. Recognize them in emails, desks, and calls.`,
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
    "pronoun-family",
    "comparative-superlative",
    "time-contrast",
    "time-category",
    "english-bridge",
    "word-family",
    "synonym",
    "opposite",
    "confusion-pair",
    "category-member",
    "scenario-word",
    "action-object",
    "state-action",
  ].includes(type);
}

const pronounFamilies: Record<string, string[]> = {
  ik: ["mij", "me", "mijn", "wij", "we"],
  mij: ["ik", "me", "mijn"],
  me: ["ik", "mij", "mijn"],
  mijn: ["ik", "mij", "me"],
  wij: ["we", "ons", "onze", "ik"],
  we: ["wij", "ons", "onze", "ik"],
  ons: ["wij", "we", "onze"],
  onze: ["wij", "we", "ons"],
  jij: ["je", "jou", "jouw", "jullie"],
  je: ["jij", "jou", "jouw", "jullie"],
  jou: ["jij", "je", "jouw"],
  jouw: ["jij", "je", "jou"],
  u: ["uw", "jij", "je"],
  uw: ["u"],
  jullie: ["jij", "je", "jou", "jouw"],
};

export function generatePronounFamilyRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const targets = pronounFamilies[analysis.normalizedForm];
  if (!targets) return [];

  return targets
    .map((target) =>
      candidate(analysis, target, "pronoun-family", allWords, {
        evidence: "lexicon",
        source: "seed",
        targetMeaning: targetMeaningFor(target),
        reasonZh: `${analysis.word.dutch} 和 ${target} 是同一组人称代词/物主形式，先放在一张小表里一起记。`,
        reasonEn: `${analysis.word.dutch} and ${target} belong to the same pronoun or possessive set, so learn them together as one small table.`,
        strength: "strong",
        confidence: "high",
      }),
    )
    .filter(Boolean) as MemoryBubbleCandidate[];
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

export function generateDeclaredMemoryLinkRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const links = analysis.word.memoryLinks ?? [];
  return links
    .filter(manualLinkShouldShow)
    .map((link) => {
      const relationType = manualLinkTypeMap[link.type];
      if (!relationType) return undefined;
      return candidate(analysis, link.dutch, relationType, allWords, {
        evidence: "manual",
        source: "manual",
        reasonZh: link.explanation.zh,
        reasonEn: link.explanation.en,
        strength: link.strength ?? (looseManualLinkTypes.has(link.type) ? "medium" : "strong"),
        confidence: link.reviewStatus === "pending" ? "medium" : "high",
      });
    })
    .filter(Boolean) as MemoryBubbleCandidate[];
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

export function generateZijnFormRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (!isZijnForm(analysis.normalizedForm)) return [];

  return zijnFormOrder
    .filter((target) => target !== analysis.normalizedForm)
    .map((target) => {
      const reason = zijnFormReason(analysis.word.dutch, target);
      return candidate(analysis, target, "verb-form", allWords, {
        evidence: "lexicon",
        source: "seed",
        targetMeaning: zijnFormMeanings[target],
        reasonZh: reason.zh,
        reasonEn: reason.en,
        strength: "strong",
        confidence: "high",
        isExtensionWord: !targetAvailable(target, wordMapFor(allWords)),
      });
    })
    .filter(Boolean) as MemoryBubbleCandidate[];
}

export function generateVerbFormRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  if (isZijnForm(analysis.normalizedForm)) return [];
  const infinitive = usefulVerbFormToInfinitive[analysis.normalizedForm];
  const speakableForm = usefulInfinitiveToVerbForm[analysis.normalizedForm];
  if (!infinitive && !speakableForm) return [];

  return [
    infinitive && normalizeWordText(infinitive) !== analysis.normalizedForm
      ? candidate(analysis, infinitive, "verb-form", allWords, {
          evidence: "safe-rule",
          source: "rule",
          targetMeaning: targetMeaningFor(infinitive) ?? {
            zh: analysis.word.meaning.zh,
            en: analysis.word.meaning.en,
          },
          reasonZh: `${analysis.word.dutch} 是 ${infinitive} 的 ik/命令形式；点回原形能看到完整动词家族。`,
          reasonEn: `${analysis.word.dutch} is the ik/imperative form of ${infinitive}; link back to the infinitive for the full verb family.`,
          strength: "strong",
          confidence: "high",
        })
      : undefined,
    speakableForm
      ? candidate(analysis, speakableForm, "verb-form", allWords, {
          evidence: "safe-rule",
          source: "rule",
          targetMeaning: targetMeaningFor(speakableForm) ?? {
            zh: analysis.word.meaning.zh,
            en: analysis.word.meaning.en,
          },
          reasonZh: `${analysis.word.dutch} 是完整动词；${speakableForm} 是最常拿来开口的 ik/命令形式。`,
          reasonEn: `${analysis.word.dutch} is the infinitive; ${speakableForm} is the common speakable ik/imperative form.`,
          strength: "strong",
          confidence: "high",
        })
      : undefined,
  ].filter(Boolean) as MemoryBubbleCandidate[];
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
    "aan|uit": {
      zh: "aan/uit 是开关方向：灯、设备、账号状态里经常就是“开 ↔ 关”。",
      en: "aan/uit is the on/off switch contrast for lights, devices, and account states.",
    },
    "alleen|samen": {
      zh: "alleen 是一个人/独自，samen 是一起；说做事方式时天然成对。",
      en: "alleen means alone/by oneself, samen means together. They form a natural contrast for how an action is done.",
    },
    "antwoorden|vragen": {
      zh: "vragen 是提出问题，antwoorden 是回答问题；一问一答，应该成对记。",
      en: "vragen means to ask, antwoorden means to answer. They form a question-answer pair.",
    },
    "antwoord|vraag": {
      zh: "vraag 是问题，antwoord 是答案；课堂、表格、邮件里都是一组来回。",
      en: "vraag is the question, antwoord is the answer. They are a natural pair in class, forms, and email.",
    },
    "binnen|buiten": {
      zh: "binnen 是里面/室内，buiten 是外面/室外；位置方向正好相反。",
      en: "binnen means inside/indoors; buiten means outside/outdoors. The location direction is opposite.",
    },
    "boven|beneden": {
      zh: "boven 是上面/楼上，beneden 是下面/楼下；按空间上下对照记。",
      en: "boven means above/upstairs; beneden means below/downstairs. Learn them as a vertical contrast.",
    },
    "bruto|netto": {
      zh: "bruto 是税前/总额，netto 是税后/净额；工资和税务里必须成对区分。",
      en: "bruto is gross; netto is net. They must be contrasted in salary and tax contexts.",
    },
    "dit|dat": {
      zh: "dit 指近处/当前这个，dat 指远处/刚说的那个；都常接 het-词或整件事。",
      en: "dit points to this nearby/current thing; dat points to that farther or previously mentioned thing. Both often refer to het-words or whole ideas.",
    },
    "deze|die": {
      zh: "deze 指这个/这些，die 指那个/那些；都跟 de-词或复数名词走。",
      en: "deze means this/these, die means that/those. Both go with de-words or plural nouns.",
    },
    "afwijzing|goedkeuring": {
      zh: "goedkeuring 是批准，afwijzing 是拒绝；官方信件里常见的决定结果对照。",
      en: "goedkeuring is approval; afwijzing is rejection. They contrast decision outcomes in official letters.",
    },
    "geldig|verlopen": {
      zh: "geldig 是还有效，verlopen 是已经过期；证件、卡、许可里要直接对照。",
      en: "geldig means valid, verlopen means expired. Contrast them for documents, cards, and permits.",
    },
    "geldig|ongeldig": {
      zh: "geldig 是有效，ongeldig 是无效；表格、票、证件里常成对判断。",
      en: "geldig means valid, ongeldig means invalid. They pair naturally for forms, tickets, and documents.",
    },
    "geven|krijgen": {
      zh: "geven 是给出去，krijgen 是收到/得到；同一件东西的方向相反。",
      en: "geven is giving out, krijgen is receiving/getting. The direction of the same item is opposite.",
    },
    "downloaden|uploaden": {
      zh: "uploaden 是上传，downloaden 是下载；数字办事里方向相反。",
      en: "uploaden means upload; downloaden means download. The digital direction is opposite.",
    },
    "in|uit": {
      zh: "in/uit 是进出方向：in 是进到里面，uit 是从里面出来或关掉。",
      en: "in/uit is the in-out direction: in goes inside, uit comes out or turns off.",
    },
    "inkomen|uitgaven": {
      zh: "inkomen 是收入，uitgaven 是支出；预算和税务里一进一出。",
      en: "inkomen is income, uitgaven are expenses. They are the in/out money contrast for budgeting and tax.",
    },
    "inloggen|uitloggen": {
      zh: "inloggen 是登录，uitloggen 是退出登录；账户操作里的进/出对照。",
      en: "inloggen is log in; uitloggen is log out. They form an in/out account-action pair.",
    },
    "instappen|uitstappen": {
      zh: "instappen 是上车，uitstappen 是下车；公共交通里成对记。",
      en: "instappen is to get on; uitstappen is to get off. They pair naturally in public transport.",
    },
    "gaan|komen": {
      zh: "gaan 是离开/去那边，komen 是朝说话人/这里来；方向相反，应该成对记。",
      en: "gaan is going away/to there; komen is coming toward the speaker/here. The movement direction is opposite.",
    },
    "hier|daar": {
      zh: "hier 是这里，daar 是那里；先按说话人位置的近/远对照记。",
      en: "hier is here, daar is there. Learn them as near/far from the speaker.",
    },
    "leraar|student": {
      zh: "student 是学习的人，leraar 是教的人；课堂角色一前一后，适合对照记。",
      en: "student is the learner; leraar is the person teaching. They are classroom role counterparts.",
    },
    "docent|student": {
      zh: "student 是学习的人，docent 是授课的人；学校/课程场景里要成对区分。",
      en: "student is the learner; docent is the instructor. Contrast them in school or course contexts.",
    },
    "leerling|leraar": {
      zh: "leerling 是跟着学的人，leraar 是教的人；同一课堂里的角色对照。",
      en: "leerling is the learner/pupil; leraar is the teacher. They form a classroom role contrast.",
    },
    "docent|leerling": {
      zh: "leerling 是学生/学习者，docent 是授课老师；一个学，一个教。",
      en: "leerling is the pupil/learner; docent is the instructor. One learns, one teaches.",
    },
    "leerlingen|leraar": {
      zh: "leerlingen 是学生们，leraar 是老师；这是课堂里的“学生们 ↔ 老师”。",
      en: "leerlingen are the pupils/students; leraar is the teacher. This is the classroom group-versus-teacher contrast.",
    },
    "docent|leerlingen": {
      zh: "leerlingen 是学生们，docent 是授课老师；课程场景里成对出现。",
      en: "leerlingen are the pupils/students; docent is the instructor. They pair naturally in course contexts.",
    },
    "kopen|verkopen": {
      zh: "kopen 是买，verkopen 是卖；同一笔交易里买方和卖方动作相反。",
      en: "kopen is buy, verkopen is sell. They are opposite actions in the same transaction.",
    },
    "open|dicht": {
      zh: "open 是开着/开放，dicht 是关着；门、店、窗口状态直接对照。",
      en: "open means open, dicht means closed. Contrast them for doors, shops, and counters.",
    },
    "openen|sluiten": {
      zh: "openen 是打开，sluiten 是关闭；动作方向相反。",
      en: "openen means to open, sluiten means to close. The action direction is opposite.",
    },
    "voor|achter": {
      zh: "voor 是前面/之前，achter 是后面；空间位置先成对记。",
      en: "voor is in front/before, achter is behind. Start with the spatial contrast.",
    },
    "voor|na": {
      zh: "voor 也能表示之前，na 是之后；时间顺序上刚好相反。",
      en: "voor can mean before, na means after. They contrast in time order.",
    },
    "vertrek|aankomst": {
      zh: "vertrek 是出发，aankomst 是到达；旅行时间表里一头一尾。",
      en: "vertrek is departure, aankomst is arrival. They are the two ends of a travel timetable.",
    },
    "aankomen|vertrekken": {
      zh: "vertrekken 是出发/离开，aankomen 是到达；出行方向一出一到。",
      en: "vertrekken is depart/leave, aankomen is arrive. One leaves, the other arrives.",
    },
    "verplicht|optioneel": {
      zh: "verplicht 是必须做，optioneel 是可选；表格、课程、规则里要分清。",
      en: "verplicht means mandatory, optioneel means optional. Contrast them in forms, courses, and rules.",
    },
    "voordeel|nadeel": {
      zh: "voordeel 是优点/好处，nadeel 是缺点/坏处；表达观点时天然成对。",
      en: "voordeel is advantage, nadeel is disadvantage. They pair naturally in opinions and arguments.",
    },
    "eens|oneens": {
      zh: "eens 是同意，oneens 是不同意；讨论观点时直接对照。",
      en: "eens means agree, oneens means disagree. Use them as an opinion contrast.",
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

const orderedTimeGroups = [
  {
    id: "relative-day",
    words: ["gisteren", "vandaag", "morgen", "overmorgen"],
    reasonZh: "这组按时间轴记：gisteren 昨天 → vandaag 今天 → morgen 明天 → overmorgen 后天。",
    reasonEn: "Learn this as a timeline: gisteren yesterday -> vandaag today -> morgen tomorrow -> overmorgen the day after tomorrow.",
  },
  {
    id: "day-part",
    words: ["ochtend", "middag", "avond", "nacht"],
    reasonZh: "这组按一天的顺序记：ochtend 早上 → middag 中午/下午 → avond 晚上 → nacht 夜里。",
    reasonEn: "Learn these in the order of the day: ochtend morning -> middag midday/afternoon -> avond evening -> nacht night.",
  },
  {
    id: "weekday",
    words: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
    reasonZh: "这组按星期顺序记，比只说“都是时间词”更容易回忆。",
    reasonEn: "Learn these in weekday order; that is more memorable than a broad time category.",
  },
] as const;

export function generateOrderedTimeRelations(analysis: WordAnalysis, allWords: WordItem[]) {
  const source = analysis.normalizedForm;
  return orderedTimeGroups.flatMap((group) => {
    const index = group.words.map(normalizeWordText).indexOf(source);
    if (index < 0) return [];
    const targets = group.words
      .map((target, targetIndex) => ({ target, distance: Math.abs(targetIndex - index) }))
      .filter((item) => item.distance > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, group.id === "relative-day" ? 3 : 2);

    return targets
      .map(({ target }) => candidate(analysis, target, "time-contrast", allWords, {
        evidence: "lexicon",
        source: "seed",
        targetMeaning: targetMeaningFor(target),
        reasonZh: group.reasonZh,
        reasonEn: group.reasonEn,
        strength: "strong",
        confidence: "high",
      }))
      .filter(Boolean) as MemoryBubbleCandidate[];
  });
}

const focusedCategoryTargets: Record<string, Record<string, string[]>> = {
  "naming-words": {
    naam: ["heet", "heten", "noemen", "voornaam", "achternaam"],
    heet: ["heten", "naam", "noem", "noemen"],
    heten: ["heet", "naam", "noemen", "noem"],
    noem: ["noemen", "naam", "heet", "heten"],
    noemen: ["noem", "naam", "heten", "heet"],
    voornaam: ["achternaam", "naam", "heet", "heten"],
    achternaam: ["voornaam", "naam", "heet", "heten"],
  },
  "language-skills": {
    luister: ["luisteren", "spreek", "spreken", "lees", "schrijf"],
    luisteren: ["luister", "spreken", "lezen", "schrijven", "begrijpen"],
    spreek: ["spreken", "luister", "luisteren", "zeg", "zeggen"],
    spreken: ["spreek", "luisteren", "zeggen", "begrijpen", "lezen"],
    lees: ["lezen", "schrijf", "schrijven", "luister", "spreek"],
    lezen: ["lees", "schrijven", "luisteren", "spreken", "begrijpen"],
    schrijf: ["schrijven", "lees", "lezen", "zeg", "spreek"],
    schrijven: ["schrijf", "lezen", "spreken", "zeggen", "begrijpen"],
    zeg: ["zeggen", "spreek", "spreken", "luister", "noem"],
    zeggen: ["zeg", "spreken", "luisteren", "begrijpen"],
    begrijp: ["begrijpen", "luisteren", "lezen", "spreken"],
    begrijpen: ["begrijp", "luisteren", "lezen", "spreken"],
  },
  "digital-click-actions": {
    klik: ["klikken", "knop", "link", "open", "sluit"],
    klikken: ["klik", "knop", "link", "openen", "sluiten"],
    knop: ["klik", "klikken", "link", "pagina"],
    link: ["klik", "klikken", "pagina", "website"],
    website: ["pagina", "link", "klik", "knop"],
    pagina: ["website", "link", "klik", "knop"],
    open: ["openen", "sluit", "sluiten", "klik"],
    openen: ["open", "sluiten", "klik", "knop"],
    sluit: ["sluiten", "open", "openen", "klik"],
    sluiten: ["sluit", "openen", "klik", "knop"],
  },
  "meal-times": {
    ontbijt: ["lunch", "avondeten", "diner", "maaltijd"],
    lunch: ["ontbijt", "avondeten", "diner", "maaltijd"],
    avondeten: ["diner", "lunch", "ontbijt", "maaltijd"],
    diner: ["avondeten", "lunch", "ontbijt", "maaltijd"],
    maaltijd: ["ontbijt", "lunch", "avondeten", "diner"],
  },
  family: {
    moeder: ["vader", "ouders", "kind", "zoon", "dochter", "familie", "gezin"],
    vader: ["moeder", "ouders", "kind", "zoon", "dochter", "familie", "gezin"],
    ouders: ["moeder", "vader", "kind", "zoon", "dochter", "familie", "gezin"],
    broer: ["zus", "moeder", "vader", "familie", "gezin"],
    zus: ["broer", "moeder", "vader", "familie", "gezin"],
    zoon: ["dochter", "kind", "moeder", "vader", "ouders", "familie"],
    dochter: ["zoon", "kind", "moeder", "vader", "ouders", "familie"],
    kind: ["baby", "jongen", "meisje", "meid", "moeder", "vader", "ouders", "familie"],
    kleinkind: ["opa", "oma", "kind", "familie", "gezin"],
    baby: ["kind", "jongen", "meisje", "meid", "moeder", "vader", "familie"],
    jongen: ["meisje", "meid", "kind", "baby", "familie"],
    meisje: ["meid", "jongen", "kind", "baby", "familie"],
    meid: ["meisje", "jongen", "kind", "familie"],
    oom: ["tante", "neef", "nicht", "familie", "man"],
    tante: ["oom", "neef", "nicht", "familie", "vrouw"],
    neef: ["nicht", "oom", "tante", "familie"],
    nicht: ["neef", "oom", "tante", "familie"],
    opa: ["oma", "kleinkind", "familie"],
    oma: ["opa", "kleinkind", "familie"],
    man: ["vrouw", "familie", "vader", "oom"],
    vrouw: ["man", "familie", "moeder", "tante"],
  },
  "sequence-time": {
    eerst: ["daarna", "meteen", "straks", "laatst", "eerder", "later"],
    daarna: ["eerst", "meteen", "straks", "later"],
    meteen: ["straks", "daarna", "eerst", "later"],
    straks: ["meteen", "daarna", "later", "eerst"],
    laatst: ["eerst", "daarna", "eerder", "later", "laatste"],
    eerder: ["later", "eerst", "daarna"],
    later: ["eerder", "daarna", "straks"],
  },
  "frequency-time": {
    "elke week": ["week", "maand", "jaar", "dag", "vaak", "soms"],
    "per maand": ["maand", "week", "jaar", "dag", "vaak", "soms"],
    week: ["maand", "jaar", "dag", "elke week", "per maand"],
    maand: ["week", "jaar", "dag", "per maand", "elke week"],
    jaar: ["maand", "week", "dag"],
    dag: ["week", "maand", "jaar", "vandaag", "morgen"],
    altijd: ["vaak", "soms", "nooit", "meestal"],
    vaak: ["soms", "altijd", "meestal", "nooit"],
    soms: ["vaak", "nooit", "altijd", "meestal"],
    nooit: ["soms", "vaak", "altijd"],
    meestal: ["vaak", "soms", "altijd"],
  },
  "business-workplace": {
    kantoor: ["bedrijf", "receptie", "personeel", "afdeling", "werkplek", "leiding", "chef", "winkelmedewerker"],
    bedrijf: ["kantoor", "receptie", "personeel", "afdeling", "werkplek", "directeur"],
    receptie: ["kantoor", "bedrijf", "personeel", "medewerker"],
    personeel: ["bedrijf", "kantoor", "directeur", "afdeling", "werkplek"],
    directeur: ["bedrijf", "kantoor", "personeel", "afdeling"],
    leiding: ["chef", "directeur", "personeel", "bedrijf", "kantoor"],
  },
  "weather-climate-series": {
    weerbericht: ["temperatuur", "wind", "regenbui", "storm", "wolk", "sneeuw"],
    temperatuur: ["graad", "weerbericht", "hittegolf", "droogte", "klimaat"],
    graad: ["temperatuur", "weerbericht", "hittegolf"],
    wind: ["storm", "weerbericht", "wolk", "regenbui"],
    storm: ["wind", "regenbui", "wolk", "weerbericht"],
    wolk: ["regenbui", "wind", "storm", "weerbericht"],
    regenbui: ["wolk", "wind", "weerbericht", "storm"],
    sneeuw: ["glad", "weerbericht", "temperatuur"],
    glad: ["sneeuw", "weerbericht", "temperatuur"],
    mist: ["weerbericht", "wolk", "temperatuur"],
    droogte: ["hittegolf", "klimaat", "temperatuur"],
    klimaat: ["hittegolf", "droogte", "overstroming", "temperatuur"],
    hittegolf: ["temperatuur", "droogte", "klimaat"],
    overstroming: ["klimaat", "regenbui", "storm"],
  },
  "environment-society-series": {
    milieu: ["vervuiling", "uitstoot", "hergebruiken", "milieubewust", "natuurgebied", "klimaat"],
    vervuiling: ["milieu", "uitstoot", "milieubewust", "hergebruiken", "klimaat", "natuurgebied"],
    uitstoot: ["vervuiling", "milieu", "klimaat", "energie", "milieubewust"],
    energie: ["uitstoot", "klimaat", "milieu"],
    klimaat: ["milieu", "uitstoot", "hittegolf", "overstroming", "natuurgebied"],
    hergebruiken: ["milieubewust", "milieu", "vervuiling", "uitstoot"],
    milieubewust: ["milieu", "hergebruiken", "vervuiling", "uitstoot"],
    natuurgebied: ["milieu", "vervuiling", "klimaat", "overstroming"],
    overstroming: ["klimaat", "milieu", "natuurgebied", "hittegolf"],
    hittegolf: ["klimaat", "uitstoot", "milieu", "overstroming"],
  },
  "society-participation-series": {
    maatschappij: ["samenleving", "gelijke kansen", "discriminatie", "vereniging", "initiatief"],
    "gelijke kansen": ["discriminatie", "maatschappij", "samenleving"],
    discriminatie: ["gelijke kansen", "maatschappij", "samenleving"],
    vereniging: ["buurtgenoot", "initiatief", "taalmaatje", "maatschappij"],
    taalmaatje: ["vereniging", "buurtgenoot", "initiatief"],
    buurtgenoot: ["vereniging", "taalmaatje", "initiatief"],
    initiatief: ["vereniging", "buurtgenoot", "maatschappij"],
    "straatpoëzie": ["initiatief", "buurtgenoot", "vereniging"],
  },
};

function orderedFocusedTargets(categoryId: string, source: string, targets: string[]) {
  const priority = focusedCategoryTargets[normalizeWordText(categoryId)]?.[source];
  if (!priority?.length) return targets;
  const available = new Set(targets.map(normalizeWordText));
  return priority.filter((target) => available.has(normalizeWordText(target)));
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
    if (shouldSuppressBroadCategoryRelation(analysis, category.id, sourceIsHead)) return [];
    const isBroadMemberGroup = category.members.length > 8;
    const sourceHasFocus = Boolean(focusedCategoryTargets[normalizeWordText(category.id)]?.[source]?.length);
    // A large category is only useful from a member when that word has a curated,
    // source-specific set of peers. Otherwise unrelated co-members leak into bubbles.
    if (sourceIsMember && isBroadMemberGroup && !sourceHasFocus) return [];
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
    const focusedTargets = category.id === "formal-address" && !sourceIsHead
      ? targets.filter((target) => ["meneer", "mevrouw"].includes(normalizeWordText(target)))
      : orderedFocusedTargets(category.id, source, targets);
    const configuredLimit = "headPreviewLimit" in category && typeof category.headPreviewLimit === "number"
      ? category.headPreviewLimit
      : undefined;
    const targetLimit = configuredLimit ?? (sourceIsHead && category.members.length > 8 ? 4 : 6);
    return focusedTargets.slice(0, targetLimit).map((target) => {
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
    const heads = category.heads.map(normalizeWordText);
    const members = category.members.map(normalizeWordText);
    if (!heads.includes(source) && !members.includes(source)) return [];
    if (category.members.length > 8 && !focusedCategoryTargets[normalizeWordText(category.id)]?.[source]?.length) return [];
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
  const reviewedA2Reasons: Record<string, { zh: string; en: string }> = {
    "kom|bord": { zh: "这里的 kom 指盛食物的碗，和 bord（盘子）是同一套餐具。", en: "Here kom means a bowl; it belongs with bord (plate) as tableware." },
    "kom|lepel": { zh: "这里的 kom 是餐桌上的碗，常和 lepel（勺子）一起使用。", en: "Here kom is a table bowl, commonly used with a lepel (spoon)." },
    "kom|glas": { zh: "这里的 kom 指碗，和 glas（玻璃杯）都是餐桌上的器具。", en: "Here kom means bowl; it and glas (drinking glass) are tableware." },
    "kilo|gram": { zh: "kilo 和 gram 都是重量单位；1 公斤等于 1000 克，是购物称重时会遇到的单位换算。", en: "Kilo and gram are weight units; one kilogram equals 1,000 grams, a conversion used when weighing groceries." },
    "liter|fles": { zh: "liter 是容量单位，fles（瓶子）常标出以 liter 计的容量。", en: "Liter is a unit of volume, and a fles (bottle) often shows its capacity in liters." },
    "invullen|formulier": { zh: "formulier 是需要填写的表格，invullen 是填写其中的信息。", en: "A formulier is a form to complete; invullen is the action of filling in its information." },
    "invullen|adres": { zh: "搬家或登记时，常要把新地址 invullen（填写）在表格上。", en: "When registering or moving, you often invullen (fill in) your new adres on a form." },
    "regelen|afspraak": { zh: "afspraak maken/regelen 是常见搭配：安排或确认一次预约。", en: "Afspraak maken/regelen is a common collocation: arrange or confirm an appointment." },
    "besparen|geld": { zh: "besparen betekent minder uitgeven zodat je geld overhoudt.", en: "Besparen means spending less so that you keep more geld (money)." },
    "aanbieden|hulp": { zh: "hulp aanbieden 是“主动提供帮助”的常用搭配。", en: "Hulp aanbieden is a common collocation meaning to offer help." },
    "aanbieden|oplossing": { zh: "Een oplossing aanbieden 是提供解决办法的自然搭配。", en: "Een oplossing aanbieden is a natural collocation meaning to offer a solution." },
    "regel|boete": { zh: "违反某条 regel（规则）可能会得到 boete（罚款）；这是规则与后果的联系，不是同义词。", en: "Breaking a regel (rule) can lead to a boete (fine): this is a rule-and-consequence link, not a synonym." },
    "regel|lezen": { zh: "de regel lezen 是词条里的常用搭配：阅读并理解规则。", en: "De regel lezen is a useful collocation: read and understand the rule." },
    "regel|uitleggen": { zh: "de regel uitleggen 是常见搭配：把规则解释清楚。", en: "De regel uitleggen is a common collocation: explain the rule clearly." },
    "regel|regeling": { zh: "regel 是一条规则；regeling 常指一套规定或安排。二者同词根、词义相关，但不是可互换的同义词。", en: "Regel is a rule; regeling often means a set of regulations or an arrangement. They share a root and related meaning, but are not interchangeable synonyms." },
    "postkantoor|pakket": { zh: "postkantoor（邮局）是寄送或领取 pakket（包裹）的地点。", en: "A postkantoor (post office) is a place to send or collect a pakket (parcel)." },
    "DigiD-app|privacy": { zh: "使用 DigiD-app 办理身份验证时，也要保护个人 privacy（隐私）。", en: "When using the DigiD app for authentication, personal privacy must also be protected." },
    "besluit|gemeente": { zh: "gemeente（市政厅）会对申请作出正式 besluit（决定）。", en: "A gemeente (municipality) makes a formal besluit (decision) on an application." },
    "afzeggen|afspraak": { zh: "afspraak afzeggen 是词典和预约场景中的固定搭配：取消预约。", en: "Afspraak afzeggen is a standard dictionary and appointment collocation: cancel an appointment." },
    "veranderen|adres": { zh: "mijn adres veranderen 是常见搭配：更改地址。", en: "Mijn adres veranderen is a common collocation: change one's address." },
    "treinverkeer|vertraging": { zh: "treinverkeer 遇到 verstoring 时常会有 vertraging（延误）；二者属于列车运行信息场景。", en: "Disruptions in treinverkeer often cause vertraging (delays); both belong to train travel information." },
    "buslijn|halte": { zh: "buslijn 会经过不同的 halte（站点）；线路通知也常说明哪些站点停靠或取消。", en: "A buslijn serves different haltes (stops); route notices often say which stops are served or cancelled." },
    "betaalverzoek|rekening": { zh: "betaalverzoek 是请求支付款项，rekening 是需要支付的账单；两者常出现在付款流程中。", en: "A betaalverzoek requests a payment, while a rekening is a bill to pay; both occur in payment workflows." },
    "kwijt|paspoort": { zh: "paspoort kwijt 是“护照丢了”的常用说法；kwijt 常和重要证件搭配。", en: "Paspoort kwijt is a common way to say that a passport is missing; kwijt often pairs with important documents." },
    "kwijt|rijbewijs": { zh: "rijbewijs kwijt 是“驾照丢了”的常用说法。", en: "Rijbewijs kwijt is a common way to say that a driving licence is missing." },
    "gevonden|paspoort": { zh: "护照丢失后也可能被 gevonden（找到）；和 kwijt 构成一组失物状态。", en: "A missing passport may later be gevonden (found), contrasting with kwijt (lost)." },
    "gevonden|rijbewijs": { zh: "驾照丢失后也可能被 gevonden（找到）；和 kwijt 构成一组失物状态。", en: "A missing driving licence may later be gevonden (found), contrasting with kwijt (lost)." },
    "verplicht|formulier": { zh: "表格会标出哪些信息是 verplicht（必填/必须提供）。", en: "A form indicates which information is verplicht (required)." },
    "verplicht|vakje": { zh: "表格里的 vakje 可能是 verplicht（必须勾选或填写）的项目。", en: "A vakje (field/box) on a form may be verplicht (required)." },
    "optioneel|vakje": { zh: "表格里的 vakje 也可能是 optioneel（可选）的项目。", en: "A vakje (field/box) on a form may be optioneel (optional)." },
    "optioneel|keuzelijst": { zh: "keuzelijst（下拉选择列表）里的项目有时是可选的。", en: "An item in a keuzelijst (selection list) may be optional." },
    "jaarlijks|maandelijks": { zh: "jaarlijks 是每年，maandelijks 是每月；对照频率记，不是反义词。", en: "Jaarlijks means yearly and maandelijks means monthly; compare the frequency, not as opposites." },
    "maandelijks|jaarlijks": { zh: "maandelijks 是每月，jaarlijks 是每年；对照频率记，不是反义词。", en: "Maandelijks means monthly and jaarlijks means yearly; compare the frequency, not as opposites." },
    "dossier|huisarts": { zh: "huisarts（家庭医生）会建立并查看患者的 dossier（病历/档案）。", en: "A huisarts (GP) keeps and consults a patient's dossier (file/medical record)." },
    "dossier|controle": { zh: "就诊或复查时，医生可能会查看 dossier（病历/档案）。", en: "During a check-up, a clinician may consult the dossier (record)." },
    "mobiel|bellen": { zh: "mobiel 在这里指手机；mobiel bellen 就是用手机打电话。", en: "Mobiel here means mobile phone; mobiel bellen means making a call on a mobile." },
    "inschrijving|formulier": { zh: "办理 inschrijving（登记）时，通常要填写 formulier（表格）。", en: "An inschrijving (registration) commonly involves completing a formulier (form)." },
    "inschrijving|gemeente": { zh: "很多住址登记要在 gemeente（市政厅）办理。", en: "Many address registrations are handled by the gemeente (municipality)." },
    "balie|medewerker": { zh: "balie 是办事柜台，medewerker 是在柜台提供帮助的工作人员。", en: "A balie is a service counter; a medewerker is the staff member who helps there." },
    "balie|informatie": { zh: "去 balie 常是为了询问或领取 informatie（信息）。", en: "People often go to a balie to ask for or receive informatie (information)." },
    "nodig|hulp": { zh: "hulp nodig hebben 是“需要帮助”的常用搭配；nodig 不等于 belangrijk。", en: "Hulp nodig hebben is a common phrase meaning to need help; nodig is not the same as belangrijk." },
    "nodig|afspraak": { zh: "预约事项里常会说明是否 afspraak（预约） nodig is（需要）。", en: "Appointment information often says whether an afspraak (appointment) is nodig (needed)." },
    "duidelijk|uitleggen": { zh: "uitleggen（解释）是让信息 duidelijk（清楚）的常用办法。", en: "Uitleggen (explaining) is a common way to make information duidelijk (clear)." },
    "dosering|bijsluiter": { zh: "bijsluiter（药品说明书）会说明药物的 dosering（剂量/用法）。", en: "A bijsluiter (medicine leaflet) explains the dosering (dosage)." },
    "dosering|medicijn": { zh: "dosering 指 medicijn（药物）应该使用的剂量。", en: "Dosering is the amount of a medicijn (medicine) to use." },
    "dosis|medicijn": { zh: "dosis 是一次使用的药量；medicijn 是药物本身。", en: "Dosis is an amount taken at one time; medicijn is the medicine itself." },
    "dosis|bijsluiter": { zh: "bijsluiter 会告诉你每次的 dosis（剂量）。", en: "The bijsluiter tells you the dosis (dose) to take." },
    "hersteldatum|verzuim": { zh: "hersteldatum 是缺勤/病假（verzuim）后预计恢复工作的日期。", en: "A hersteldatum is the expected return date after verzuim (absence/sick leave)." },
    "hersteldatum|bedrijfsarts": { zh: "需要评估复工时间时，bedrijfsarts（职业医生）可能会讨论 hersteldatum。", en: "A bedrijfsarts (occupational physician) may discuss a hersteldatum when assessing return to work." },
    "betaalverzoek|iban": { zh: "电子 betaalverzoek 通常会使用收款方的 IBAN。", en: "An electronic betaalverzoek commonly uses the recipient's IBAN." },
    "betaalverzoek|overschrijving": { zh: "收到 betaalverzoek 后，可以通过 overschrijving（银行转账）付款。", en: "After receiving a betaalverzoek, you can pay by overschrijving (bank transfer)." },
    "eindbestemming|tussenstop": { zh: "旅行路线从 tussenstop（中途停靠）继续到 eindbestemming（最终目的地）。", en: "A route continues from a tussenstop (intermediate stop) to the eindbestemming (final destination)." },
    "eindbestemming|aansluiting": { zh: "规划到 eindbestemming 的路线时，可能需要留意换乘 aansluiting。", en: "When planning a route to the eindbestemming, you may need to check a connecting service (aansluiting)." },
    "tussenstop|aansluiting": { zh: "在 tussenstop 换乘时，可能需要赶上下一班 aansluiting（接续交通）。", en: "At a tussenstop, you may need to catch the next aansluiting (connecting service)." },
    "vervoerbewijs|controleur": { zh: "controleur 会检查乘客是否持有有效 vervoerbewijs。", en: "A controleur checks whether passengers have a valid vervoerbewijs (travel ticket)." },
    "vervoerbewijs|dagkaart": { zh: "dagkaart 是一种可在当天使用的 vervoerbewijs。", en: "A dagkaart (day ticket) is one type of vervoerbewijs (travel ticket)." },
    "vervoerbewijs|abonnement": { zh: "abonnement 是长期/定期使用的 vervoerbewijs 形式之一。", en: "An abonnement (pass/subscription) is one type of ongoing vervoerbewijs." },
    "bereikbaarheid|voicemail": { zh: "联系不到某人时，电话可能转到 voicemail（语音信箱）。", en: "If someone is not reachable, a call may go to voicemail." },
    "bereikbaarheid|terugbelverzoek": { zh: "无法接通时，可以留下 terugbelverzoek（回电请求）。", en: "If someone cannot be reached, you can leave a terugbelverzoek (call-back request)." },
    "bereikbaarheid|telefoonnummer": { zh: "想确认一个人是否 bereikbaar，通常需要他的 telefoonnummer。", en: "To check whether someone is reachable, you usually need their telefoonnummer (phone number)." },
    "verbinding|opnemen": { zh: "电话 verbinding 接通后，对方可以 opnemen（接听）。", en: "Once the phoneverbinding is established, the other person can opnemen (answer the call)." },
    "verbinding|voicemail": { zh: "电话 verbinding 无法建立时，可能会进入 voicemail。", en: "If a phoneverbinding cannot be established, the call may go to voicemail." },
    "voorkeur|beschikbaarheid": { zh: "安排时间时，要把自己的 voorkeur 和对方的 beschikbaarheid（可用时间）对上。", en: "When scheduling, match your voorkeur (preference) with the other person's beschikbaarheid (availability)." },
    "aanvraagstatus|afwijzing": { zh: "aanvraagstatus 会显示申请是否被 afwijzing（拒绝）。", en: "The aanvraagstatus shows whether an application resulted in an afwijzing (rejection)." },
    "aanvraagstatus|goedkeuring": { zh: "aanvraagstatus 会显示申请是否得到 goedkeuring（批准）。", en: "The aanvraagstatus shows whether an application received goedkeuring (approval)." },
    "aanvraagstatus|beslistermijn": { zh: "beslistermijn 是等待 aanvraagstatus / 正式决定的处理期限。", en: "The beslistermijn is the processing period for receiving an application status or decision." },
    "aanvraagstatus|toeslagen": { zh: "toeslagen 申请页面会显示每项申请的 aanvraagstatus。", en: "A toeslagen (benefits) portal shows the aanvraagstatus of each application." },
    "klantenbalie|artikelnummer": { zh: "退换商品时，klantenbalie 可能会询问商品的 artikelnummer。", en: "At a returns counter, staff may ask for the item's artikelnummer (item number)." },
    "klantenbalie|aankoopdatum": { zh: "办理退换货时，klantenbalie 可能需要 aankoopdatum（购买日期）。", en: "At a customer-service counter, staff may need the aankoopdatum (purchase date) for a return." },
    "DigiD-app|machtigingscode": { zh: "DigiD-app 登录或授权流程可能要求输入 machtigingscode（授权码）。", en: "A DigiD-app sign-in or authorization flow may ask for a machtigingscode (authorization code)." },
    "DigiD-app|beveiliging": { zh: "beveiliging（安全保护）是 DigiD-app 身份验证的重要部分。", en: "Beveiliging (security) is an important part of authentication in the DigiD app." },
    "DigiD-app|privacyverklaring": { zh: "使用 DigiD-app 时，privacyverklaring 说明个人数据如何处理。", en: "The privacyverklaring (privacy statement) explains how personal data is handled when using the DigiD app." },
    "gebruik|medicijn": { zh: "medicijngebruik 指药物的使用方式；药盒或说明书会解释如何使用。", en: "Medicijngebruik means the use of medicine; the package or leaflet explains how to use it." },
    "hoofdpijn|koorts": { zh: "头痛（hoofdpijn）和发烧（koorts）都是常见症状，但彼此不同。", en: "Hoofdpijn (headache) and koorts (fever) are common but distinct symptoms." },
    "buikpijn|hoesten": { zh: "buikpijn 和 hoesten 都是看病时可能要说明的症状。", en: "Buikpijn (stomach ache) and hoesten (coughing) are symptoms a patient may report." },
    "keelpijn|duizelig": { zh: "看病时可以分别描述 keelpijn（喉咙痛）和 duizelig（头晕）。", en: "At a medical visit, you may report keelpijn (sore throat) and duizeligheid (dizziness)." },
    "wijkteam|inburgering": { zh: "wijkteam 可协助居民了解本地的 inburgering（融入/公民教育）支持。", en: "A wijkteam may help residents find local inburgering (civic integration) support." },
    "wijkteam|taalcursus": { zh: "wijkteam 可以帮助居民找到合适的 taalcursus（语言课程）。", en: "A wijkteam may help residents find a suitable taalcursus (language course)." },
    "wijkteam|schoolarts": { zh: "涉及儿童和家庭的问题，wijkteam 有时会与 schoolarts（校医）协作。", en: "For issues involving children and families, a wijkteam may coordinate with a schoolarts (school doctor)." },
    "inburgering|taalcursus": { zh: "taalcursus（语言课）是 inburgering（融入学习）中常见的一部分。", en: "A taalcursus (language course) is a common part of inburgering (civic integration)." },
    "informatiebalie|servicepunt": { zh: "informatiebalie 和 servicepunt 都是获取公共服务信息的地点。", en: "An information desk and a service point are both places to get public-service information." },
    "informatiebalie|medewerker": { zh: "在 informatiebalie，medewerker 会回答问题或指引办事流程。", en: "At an information desk, a medewerker (staff member) answers questions or guides you through a process." },
    "doktersverklaring|verzuim": { zh: "doktersverklaring 可能用于说明病假或其他 verzuim（缺勤）。", en: "A doktersverklaring (doctor's note) may document sick leave or other verzuim (absence)." },
    "doktersverklaring|privacy": { zh: "doktersverklaring 涉及健康信息，因此也要注意 privacy（隐私）。", en: "A doctor's note contains health information, so privacy matters too." },
    "contract|huur": { zh: "租房 contract 会写明 huur（租金）及其他租赁条件。", en: "A rental contract specifies the huur (rent) and other lease conditions." },
    "contract|verhuurder": { zh: "verhuurder（房东）是租赁 contract 的一方。", en: "The verhuurder (landlord) is one party to a rental contract." },
    "contract|reparatie": { zh: "住房 contract 会说明出现 reparatie（维修）问题时房东和租客的责任。", en: "A housing contract describes tenant and landlord responsibilities for repairs." },
    "vertrekken|trein": { zh: "trein vertrekken 是描述火车出发的常用搭配。", en: "Trein vertrekken is a common way to describe a train leaving." },
    "vertrekken|vertraging": { zh: "trein vertraging 可能影响原定的 vertrekken（出发）时间。", en: "A train vertraging (delay) may affect the planned departure time." },
    "aankomen|station": { zh: "火车或乘客会在 station aankomen（到站/到达）。", en: "A train or passenger can aankomen (arrive) at a station." },
    "aankomen|bestemming": { zh: "aankomen 描述抵达 bestemming（目的地）。", en: "Aankomen means to arrive at a bestemming (destination)." },
    "loket|informatie": { zh: "去 loket 常是为了询问或领取 informatie（信息）。", en: "People often go to a loket to ask for or receive information." },
    "loket|bewijs": { zh: "办理业务时，loket 可能要求出示 bewijs（证明）。", en: "At a service counter, you may be asked to show a bewijs (proof/document)." },
    "loket|kopie": { zh: "有些手续需要把 kopie（复印件）交到 loket。", en: "Some procedures require handing in a kopie (copy) at the service counter." },
    "kopie|bewijs": { zh: "kopie van een bewijs 是证明文件的复印件。", en: "A kopie van een bewijs is a copy of a supporting document." },
    "kopie|handtekening": { zh: "办理手续时，kopie 可能要和签好的 handtekening 一起提交。", en: "An administrative copy may need to be submitted with a signed handtekening (signature)." },
    "kopie|paspoort": { zh: "paspoort 的 kopie 是常见的身份材料复印件。", en: "A kopie van een paspoort is a common copy of an identity document." },
    "veilig|privacy": { zh: "保护个人信息时，veiligheid 和 privacy 都很重要，但含义不同。", en: "When protecting personal information, safety and privacy both matter, but mean different things." },
    "bijwerking|medicijn": { zh: "bijwerking 是 medicijn（药物）可能带来的副作用。", en: "A bijwerking is a possible side effect of a medicijn (medicine)." },
    "verhuizen|inschrijving": { zh: "搬家后通常要办理新地址的 inschrijving（登记）。", en: "After moving, you usually need to complete an inschrijving (registration) at your new address." },
    "verhuizen|gemeente": { zh: "在荷兰，搬家后的地址变更通常要向 gemeente（市政厅）申报。", en: "In the Netherlands, an address change after moving is usually reported to the gemeente (municipality)." },
    "e-mailadres|telefoonnummer": { zh: "e-mailadres 和 telefoonnummer 都是联系表格中常见的联系方式。", en: "An e-mailadres and telefoonnummer are both common contact details on forms." },
    "e-mailadres|bijlage": { zh: "通过 e-mail 发送文件时，文件会作为 bijlage（附件）添加。", en: "When sending a file by email, it is added as a bijlage (attachment)." },
    "leidinggevende|rooster": { zh: "rooster（排班表）有变化时，通常要联系 leidinggevende（主管）。", en: "When a work roster changes, you usually contact your leidinggevende (supervisor)." },
    "leidinggevende|werktijd": { zh: "werktijd（工作时间）常由员工和 leidinggevende 协商。", en: "Werktijd (working hours) is often discussed with a leidinggevende (supervisor)." },
    "beterschap|ziekmelding": { zh: "ziekmelding 是报告生病；beterschap 是祝对方早日康复。", en: "Ziekmelding means reporting sick; beterschap is a wish for a speedy recovery." },
    "beterschap|afwezig": { zh: "生病 afwezig（缺席）时，同事常说 beterschap（祝早日康复）。", en: "When someone is absent due to illness, colleagues often say beterschap (get well soon)." },
    "beterschap|terugkomen": { zh: "beterschap 是祝康复，之后希望对方能 terugkomen（回来）。", en: "Beterschap wishes recovery, after which the person can terugkomen (return)." },
    "buschauffeur|conducteur": { zh: "buschauffeur 开公交车，conducteur 是公共交通中的另一类工作人员。", en: "A buschauffeur drives a bus; a conducteur is another kind of public-transport staff member." },
    "buschauffeur|omleiding": { zh: "发生 omleiding（绕行）时，buschauffeur 会按临时路线行驶。", en: "During an omleiding (diversion), the buschauffeur follows a temporary route." },
    "buschauffeur|inchecken": { zh: "乘客上车后通常要 inchecken；buschauffeur 会提醒乘客遵守乘车流程。", en: "Passengers usually check in when boarding; the buschauffeur may remind them of the travel procedure." },
    "aanmaning|vervaldatum": { zh: "未在 vervaldatum（到期日）付款，之后可能收到 aanmaning（催款通知）。", en: "If you do not pay by the vervaldatum (due date), you may later receive an aanmaning (payment reminder)." },
    "aanmaning|terugbetalen": { zh: "收到 aanmaning 后，通常需要尽快 betalen 或 terugbetalen 尚欠金额。", en: "After receiving an aanmaning, you usually need to pay or terugbetalen (repay) the outstanding amount." },
    "spoedlijn|dringend": { zh: "spoedlijn 用于处理 dringend（紧急）的情况。", en: "A spoedlijn is used for dringend (urgent) situations." },
    "spoedlijn|bevestiging": { zh: "通过 spoedlijn 联系服务方后，可能会收到 afspraak 或处理结果的 bevestiging。", en: "After contacting a service on a spoedlijn, you may receive confirmation of an appointment or next step." },
    "elektriciteit|energieleverancier": { zh: "energieleverancier 负责提供 elektriciteit（电力）并按用量收费。", en: "An energieleverancier supplies electricity and bills for its use." },
    "elektriciteit|meterstand": { zh: "meterstand 用来记录 elektriciteit 的用量。", en: "A meterstand records how much elektriciteit (electricity) has been used." },
    "elektriciteit|rekening": { zh: "电力使用费用会出现在 elektriciteit 的 rekening（账单）上。", en: "The cost of electricity appears on the electricity rekening (bill)." },
    "annulering|afspraak": { zh: "annulering 是取消；常见对象之一是 afspraak（预约）。", en: "Annulering means cancellation; an afspraak (appointment) is a common thing to cancel." },
    "annulering|bevestiging": { zh: "取消预约后，服务方可能发送 annulering 的 bevestiging（确认）。", en: "After cancelling an appointment, the provider may send a bevestiging (confirmation) of the annulering." },
    "servicekosten|huurcontract": { zh: "huurcontract 会说明 huur 之外是否要支付 servicekosten。", en: "A huurcontract (rental contract) states whether servicekosten (service charges) are due in addition to rent." },
    "servicekosten|verhuurder": { zh: "verhuurder 通常会说明并结算 servicekosten。", en: "The verhuurder (landlord) usually explains and settles the servicekosten (service charges)." },
    "verzekeringspas|verzekering": { zh: "verzekeringspas 是证明医疗保险身份的卡片。", en: "A verzekeringspas is a card showing your insurance details." },
    "verzekeringspas|herhaalrecept": { zh: "看诊或领取 herhaalrecept 时，药房/诊所可能需要核对 verzekeringspas。", en: "A clinic or pharmacy may check your insurance card for a repeat prescription." },
    "verblijfsvergunning|paspoort": { zh: "申请 verblijfsvergunning（居留许可）时，paspoort 常是所需身份文件。", en: "A paspoort (passport) is commonly required when applying for a verblijfsvergunning (residence permit)." },
    "verblijfsvergunning|gemeente": { zh: "居留手续可能需要与 gemeente（市政厅）办理相关登记。", en: "Residence procedures may involve registration with the gemeente (municipality)." },
    "verblijfsvergunning|inschrijven": { zh: "领取或申请居留许可后，通常还要在当地登记住所。", en: "After arranging residence permission, you usually also register your address locally." },
    "vergunning|gemeenteloket": { zh: "有些 vergunning（许可证）要通过 gemeenteloket（市政窗口）申请。", en: "Some vergunningen (permits) are requested through the gemeenteloket (municipal service desk)." },
    "vergunning|formulier": { zh: "申请 vergunning 时，通常要提交 formulier（申请表）。", en: "Applying for a vergunning (permit) usually requires submitting a formulier (form)." },
    "belangrijk|informatie": { zh: "重要事项通常会在重要 informatie（信息）中说明；这是常见搭配，不是同义关系。", en: "Important details are often given as belangrijke informatie; this is a collocation, not a synonym." },
    "pauzeren|pauze": { zh: "pauzeren 是暂停这个动作，pauze 是暂停/休息这段时间。", en: "Pauzeren is the action to pause; pauze is the break itself." },
    "doorgaan|stoppen": { zh: "doorgaan 是继续，stoppen 是停止；两者是动作对照。", en: "Doorgaan means continue; stoppen means stop. They contrast as actions." },
    "besluit|beslissen": { zh: "beslissen 是作出决定，besluit 是作出的决定（名词）。", en: "Beslissen is to make a decision; besluit is the decision (noun)." },
    "onduidelijk|uitleggen": { zh: "内容不清楚（onduidelijk）时，可以请人 uitleggen（解释）。", en: "When something is onduidelijk (unclear), you can ask someone to uitleggen (explain) it." },
    "verkeerde maat|ruilen": { zh: "买到 verkeerde maat（尺码不合）时，常要 ruilen（换货）。", en: "If you get the verkeerde maat (wrong size), you may need to ruilen (exchange it)." },
    "verkeerde maat|terugbrengen": { zh: "尺码不合时，可以把商品 terugbrengen（拿回店里退换）。", en: "If the size is wrong, you can terugbrengen (take the item back to the shop)." },
    "kraan lekt|waterleiding": { zh: "水龙头（kraan）漏水可能与 waterleiding（水管）有关。", en: "A leaking kraan (tap) may involve the waterleiding (water pipe)." },
    "kraan lekt|monteur": { zh: "kraan lekt（龙头漏水）时，可能需要请 monteur（维修工）处理。", en: "If the tap leaks, you may need a monteur (technician) to fix it." },
    "te laat|vertraging": { zh: "交通 vertraging（延误）会让人 te laat（迟到）。", en: "A transport vertraging (delay) can make someone te laat (late)." },
    "oude adres|verhuizen": { zh: "verhuizen（搬家）时，需要区分旧地址和新地址。", en: "When you verhuizen (move), you need to distinguish your old and new addresses." },
    "all-in huur|servicekosten": { zh: "all-in huur 通常把 servicekosten 等费用包含在总租金里。", en: "All-in huur usually includes servicekosten (service charges) in the total rent." },
    "kale huur|servicekosten": { zh: "kale huur 是不含 servicekosten 等附加费用的基础租金。", en: "Kale huur is the base rent before servicekosten and other additional charges." },
    "vriendelijke groet|e-mail": { zh: "vriendelijke groet 是 e-mail 或正式信件末尾的常见结尾语。", en: "Vriendelijke groet is a common closing at the end of an email or formal letter." },
    "uitgaven|budget": { zh: "uitgaven（支出）需要放进 budget（预算）里一起管理。", en: "Uitgaven (expenses) are tracked and managed within a budget." },
    "uitgaven|bijhouden": { zh: "uitgaven bijhouden 是记录每月支出的常用搭配。", en: "Uitgaven bijhouden is a common collocation meaning to keep track of expenses." },
    "beslissen|kiezen": { zh: "kiezen 是在选项中选择，beslissen 是作出决定；两者相关但不完全相同。", en: "Kiezen is selecting among options; beslissen is making a decision. They are related, not identical." },
    "besluit|afwijzing": { zh: "行政 besluit（决定）可能是 afwijzing（拒绝），也可能是 goedkeuring（批准）。", en: "An administrative besluit (decision) may be an afwijzing (rejection) or a goedkeuring (approval)." },
    "besluit|goedkeuring": { zh: "行政 besluit（决定）可能是 goedkeuring（批准），也可能是 afwijzing（拒绝）。", en: "An administrative besluit (decision) may be a goedkeuring (approval) or an afwijzing (rejection)." },
    "vervangen|vervanger": { zh: "vervangen 是替换/代替，vervanger 是代替某人的人；是动词与名词的词族联系。", en: "Vervangen means to replace; a vervanger is a person who fills in. They are a verb/noun word-family link." },
    "vergunning|aanvragen": { zh: "vergunning aanvragen 是申请许可证的常用办事搭配。", en: "Vergunning aanvragen is a common administrative collocation: apply for a permit." },
    "medicijnen ophalen|apotheek": { zh: "处方药通常要到 apotheek（药房）去 ophalen（领取）。", en: "Prescription medicine is usually opgehaald (picked up) at an apotheek (pharmacy)." },
    "werk hervatten|verzuim": { zh: "verzuim 是缺勤；缺勤后会讨论何时 werk hervatten（恢复工作）。", en: "Verzuim is absence from work; after an absence, people discuss when to werk hervatten (resume work)." },
    "werk hervatten|herstel": { zh: "恢复工作（werk hervatten）通常与 herstel（康复/恢复）进度有关。", en: "Resuming work (werk hervatten) often depends on herstel (recovery)." },
    "halte vervalt|omleiding": { zh: "某个 halte vervalt（站点停用）时，乘客可能需要 volgen 的 omleiding（绕行路线）。", en: "When a halte vervalt (is out of service), passengers may need an omleiding (diversion)." },
    "halte vervalt|vertraging": { zh: "站点停用可能造成 vertraging（延误）或改乘。", en: "A stop being out of service can cause vertraging (delays) or require a change of route." },
    "naam spellen|telefoonnummer": { zh: "打电话报 telefoonnummer 时，常需要把姓名拼读出来。", en: "When giving a telefoonnummer over the phone, you may need to spell your name." },
    "slecht bereik|verbinding": { zh: "slecht bereik（信号差）会导致电话 verbinding（连接）不稳定。", en: "Slecht bereik (poor signal) can make a phoneverbinding (connection) unstable." },
    "foto meesturen|bijlage": { zh: "邮件里 foto meesturen 时，照片通常作为 bijlage（附件）发送。", en: "When you send a photo along, it is usually included as a bijlage (attachment)." },
    "vraag stellen|antwoord": { zh: "提出 vraag（问题）通常是为了得到 antwoord（回答）。", en: "A vraag (question) is asked to get an antwoord (answer)." },
    "klacht indienen|bezwaar": { zh: "klacht indienen 是提交投诉；bezwaar 是对正式决定提出异议，相关但不是同义词。", en: "Klacht indienen means submit a complaint; bezwaar is a formal objection to a decision. They are related, not synonyms." },
    "klacht indienen|formulier": { zh: "正式提交 klacht（投诉）时，可能需要填写 formulier（表格）。", en: "Submitting a formal klacht (complaint) may require a formulier (form)." },
    "fout herstellen|oplossing": { zh: "发现 fout（错误）后，要找 oplossing（解决办法）并把它 herstellen（修复）。", en: "After finding a fout (error), find an oplossing (solution) and herstel (fix) it." },
    "zonder afspraak|balie": { zh: "zonder afspraak（没有预约）到场时，通常要先询问 balie（柜台）。", en: "If you arrive zonder afspraak (without an appointment), you usually ask at the balie (service desk)." },
    "beschikbare tijd|voorkeur": { zh: "选择预约时间时，先看 beschikbare tijd（可用时间），再说明 voorkeur（偏好）。", en: "When scheduling, check the beschikbare tijd (available time) and state your voorkeur (preference)." },
    "online aanvragen|website": { zh: "很多手续可以通过 website（网站）online aanvragen（在线申请）。", en: "Many services can be applied for online via a website." },
    "nummertje trekken|loket": { zh: "在服务大厅 nummertje trekken（取号）后，等叫号去 loket（窗口）。", en: "At a service hall, take a number and wait to be called to the loket (counter)." },
    "nummertje trekken|wachten": { zh: "取号（nummertje trekken）后通常要 wachten（等待）。", en: "After taking a number (nummertje trekken), you usually wait (wachten)." },
    "formulier ophalen|loket": { zh: "到 loket（窗口）可以询问或 ophalen（领取）formulier（表格）。", en: "At a loket (counter), you can ask for or pick up a formulier (form)." },
    "formulier inleveren|balie": { zh: "填好的 formulier（表格）常在 balie（柜台）inleveren（提交）。", en: "A completed formulier (form) is often handed in at a balie (service desk)." },
    "openstaande rekening|betalen": { zh: "openstaande rekening 是尚未支付的账单，需要 betalen（付款）。", en: "An openstaande rekening is an unpaid bill that still needs to be betaald (paid)." },
    "openstaande rekening|bedrag": { zh: "账单会列出 openstaande rekening 尚欠的 bedrag（金额）。", en: "A bill lists the bedrag (amount) still owed on an openstaande rekening." },
    "digitaal ondertekenen|document": { zh: "digitaal ondertekenen 就是在 document（文件）上进行电子签名。", en: "Digitaal ondertekenen means signing a document electronically." },
    "digitaal ondertekenen|handtekening": { zh: "digitaal ondertekenen 是添加电子 handtekening（签名）。", en: "Digitaal ondertekenen means adding an electronic handtekening (signature)." },
    "gebruikersnaam herstellen|account": { zh: "忘记 gebruikersnaam 时，通常要通过 account herstel流程找回账户。", en: "If you forget a gebruikersnaam, you use the account recovery process to regain access." },
    "gebruikersnaam herstellen|wachtwoord": { zh: "恢复账户时，常常也需要重新设置 wachtwoord（密码）。", en: "Account recovery often also involves resetting the wachtwoord (password)." },
    "wat kost het|prijs": { zh: "问 Wat kost het? 是在询问商品或服务的 prijs（价格）。", en: "Wat kost het? asks for the prijs (price) of a product or service." },
    "wat kost het|bedrag": { zh: "Wat kost het? 是询问最后要付的 bedrag（金额）。", en: "Wat kost het? asks for the bedrag (amount) you will have to pay." },
    "welke documenten|paspoort": { zh: "办理手续时，paspoort（护照）是常见的 documenten（文件）之一。", en: "A paspoort (passport) is one of the common documents requested for administrative tasks." },
    "welke documenten|bewijs": { zh: "办理手续时，可能会被要求提供 bewijs（证明文件）。", en: "Administrative tasks may ask for a bewijs (supporting document/proof)." },
    "hoe lang duurt het|termijn": { zh: "询问一项申请要多久，通常是在问处理 termijn（期限）。", en: "Asking how long an application takes is asking about its processing termijn (time period)." },
    "hoe lang duurt het|wachten": { zh: "问 Hoe lang duurt het? 常是在确认需要等待（wachten）多久。", en: "Hoe lang duurt het? often asks how long you need to wait (wachten)." },
  };
  return relationLexicons.scenarioRelations
    .filter(([from]) => normalizeWordText(from) === source)
    .map(([_, target, type]) => {
      const reviewedReason = reviewedA2Reasons[`${source}|${normalizeWordText(target)}`];
      return candidate(analysis, target, type as MemoryBubbleRelationType, allWords, {
        evidence: reviewedReason ? "manual" : "lexicon",
        source: reviewedReason ? "manual" : "seed",
        reasonZh: reviewedReason?.zh ?? `${analysis.word.dutch} 和 ${target} 常在同一个生活任务里碰到，放在一起记更顺。`,
        reasonEn: reviewedReason?.en ?? `${analysis.word.dutch} and ${target} often appear in the same real-life task, so learning them together helps.`,
        strength: "strong",
        confidence: "high",
      });
    })
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
    ...actionObjectReasonFor(analysis.word.dutch, analysis.baseForm || analysis.normalizedForm, target),
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

function actionObjectReasonFor(sourceText: string, action: string, target: string) {
  const key = `${normalizeWordText(action)}|${normalizeWordText(target)}`;
  const notes: Record<string, { reasonZh: string; reasonEn: string }> = {
    "schrijven|naam": {
      reasonZh: "写表格、签收、报名时最常见：schrijf je naam，先把“写名字”连住。",
      reasonEn: "Forms, sign-ins, and registration often ask you to write your name: schrijf je naam.",
    },
    "schrijven|zin": {
      reasonZh: "课堂或练习里常写 zin；看到 schrijf，就能接“写一句”。",
      reasonEn: "In class or exercises you often write a zin, a sentence.",
    },
    "schrijven|brief": {
      reasonZh: "brief 是信；schrijf + brief 直接落到“写信”这个动作。",
      reasonEn: "brief means letter; schrijf + brief gives the action write a letter.",
    },
    "schrijven|e-mail": {
      reasonZh: "线上办事经常要写 e-mail；这是写作动作的真实出口。",
      reasonEn: "Practical admin often needs writing an e-mail; this is a real output use.",
    },
    "schrijven|formulier": {
      reasonZh: "formulier 不是拿来背的，是要在上面写信息的。",
      reasonEn: "A formulier is not just read; you write information on it.",
    },
    "lezen|boek": {
      reasonZh: "boek 最自然的动作就是 lezen；读书这一组直接锁住。",
      reasonEn: "The natural action for a boek is lezen: reading a book.",
    },
    "lezen|tekst": {
      reasonZh: "考试、信件、网页都先读 tekst；lees 一出现就找文本。",
      reasonEn: "Exams, letters, and pages all start with reading the tekst.",
    },
    "lezen|zin": {
      reasonZh: "学语言时常从 de zin lezen 开始：先读句子，再会造句。",
      reasonEn: "Language learning often starts with de zin lezen: read the sentence first.",
    },
    "lezen|brief": {
      reasonZh: "收到官方 brief，第一步不是慌，是 lees de brief。",
      reasonEn: "When an official brief arrives, the first step is to read the letter.",
    },
    "zeggen|hallo": {
      reasonZh: "hallo 是最小开口句；zeg hallo 就是把问候说出口。",
      reasonEn: "hallo is the smallest opening line; zeg hallo means say the greeting out loud.",
    },
    "zeg|hallo": {
      reasonZh: "Zeg hallo. 是直接能用的命令：先把问候说出口。",
      reasonEn: "Zeg hallo. is a direct command: say the greeting out loud.",
    },
    "zeggen|woord": {
      reasonZh: "学发音时不是只认 woord，还要能把这个词 zeggen 出来。",
      reasonEn: "When learning pronunciation, a woord is not only recognized; you need to say it.",
    },
    "zeg|woord": {
      reasonZh: "看到 zeg，就可以接 een woord：把一个词说出来。",
      reasonEn: "zeg can take een woord: say a word out loud.",
    },
    "zeggen|zin": {
      reasonZh: "语言课里常说 een zin zeggen：不是背词，是把句子说出来。",
      reasonEn: "In language class, een zin zeggen means saying a sentence, not just memorizing words.",
    },
    "zeg|zin": {
      reasonZh: "zeg + zin 把“说一句话”这个动作锁住。",
      reasonEn: "zeg + zin locks in the action of saying a sentence.",
    },
    "zeggen|antwoord": {
      reasonZh: "回答问题时，antwoord 要被说出来：zeg het antwoord。",
      reasonEn: "When answering a question, the antwoord is spoken: zeg het antwoord.",
    },
    "zeg|antwoord": {
      reasonZh: "课堂或练习里 Zeg het antwoord. 就是“说出答案”。",
      reasonEn: "In class or exercises, Zeg het antwoord. means say the answer.",
    },
    "luisteren|uitleg": {
      reasonZh: "老师、医生、柜台解释时，第一动作是 luisteren naar de uitleg。",
      reasonEn: "When a teacher, doctor, or desk worker explains, the first action is listening to the explanation.",
    },
    "luister|uitleg": {
      reasonZh: "Luister naar de uitleg：先听解释，再行动。",
      reasonEn: "Luister naar de uitleg: listen to the explanation first, then act.",
    },
    "luisteren|nederlands": {
      reasonZh: "听力训练不是抽象的：你是在 luisteren naar Nederlands。",
      reasonEn: "Listening practice is concrete: you are listening to Dutch.",
    },
    "luister|nederlands": {
      reasonZh: "听荷兰语输入时，luister 和 Nederlands 自然绑在一起。",
      reasonEn: "For Dutch input, luister and Nederlands naturally belong together.",
    },
    "luisteren|taal": {
      reasonZh: "taal 要进耳朵：luisteren 是把语言听进去的动作。",
      reasonEn: "taal enters through the ear; luisteren is taking language in by listening.",
    },
    "luister|taal": {
      reasonZh: "luister 抓的是语言输入，不只是“乖乖听话”。",
      reasonEn: "luister catches language input, not just obeying a command to listen.",
    },
    "luisteren|bericht": {
      reasonZh: "语音留言、通知、电话内容都可能要先 luisteren naar het bericht。",
      reasonEn: "A voice message, notice, or phone content may need luisteren naar het bericht first.",
    },
    "luister|bericht": {
      reasonZh: "bericht 不只读，也可能听；语音消息就要 luister。",
      reasonEn: "A bericht is not only read; if it is a voice message, you listen to it.",
    },
  };
  return notes[key] ?? {
    reasonZh: `${sourceText} 常直接带 ${target} 这个对象，按“动作 + 对象”一起记。`,
    reasonEn: `${sourceText} often takes ${target} as its object; learn it as action + object.`,
  };
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
    const broadBucketNeedsExactCategory = new Set(["study", "home", "describing"]);
    if (broadBucketNeedsExactCategory.has(bucket.id) && !sharesExactLexiconCategory(analysis.word.dutch, targetWord?.dutch ?? target)) {
      return [];
    }
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
    "arts|dokter": {
      zh: "dokter 是日常说“医生”的词，arts 更正式/职业名；看医疗词时可以互相连。",
      en: "dokter is the everyday word for doctor; arts is the more formal/professional term.",
    },
    "arts|huisarts": {
      zh: "arts 是医生总称，huisarts 是家庭医生/全科医生；huisarts 是更具体的一类 arts。",
      en: "arts is a general doctor; huisarts is a GP/family doctor, a more specific kind of arts.",
    },
    "baan|werk": {
      zh: "werk 是工作这件事/工作内容，baan 更像一个职位/一份工作；求职语境里常互通但角度不同。",
      en: "werk is work as activity/context; baan is a job/position. They overlap in job contexts but the angle differs.",
    },
    "baan|werkplek": {
      zh: "baan 是一份工作，werkplek 是工作地点；都在工作线里，但一个说职位，一个说地点。",
      en: "baan is a job, werkplek is the workplace. One is the position, the other the place.",
    },
    "bewering|stelling": {
      zh: "stelling 是立场/论点，bewering 是说法/主张；讨论观点时意思靠近但力度不同。",
      en: "stelling is a thesis/position, bewering is a claim. They are close in argument contexts but differ in force.",
    },
    "bijsluiter|handleiding": {
      zh: "handleiding 是说明书总称，bijsluiter 常指药盒里的说明书；一个泛，一个更医疗。",
      en: "handleiding is a manual in general; bijsluiter is usually a medicine leaflet. One is broad, one is medical.",
    },
    "controle|nakijken": {
      zh: "controleren/nakijken 都是检查；nakijken 更像把作业/材料看一遍，controleren 更像核对是否正确。",
      en: "controleren/nakijken both mean check; nakijken is reviewing work/material, controleren is verifying correctness.",
    },
    "controleren|nakijken": {
      zh: "controleren 是核对检查，nakijken 是看一遍/批改；都接“检查”，但动作感觉不同。",
      en: "controleren is verify/check, nakijken is review/mark. Both are checking with different action feel.",
    },
    "eenvoudig|makkelijk": {
      zh: "makkelijk 是容易做，eenvoudig 是简单不复杂；都表示“不难”，但角度不同。",
      en: "makkelijk means easy to do; eenvoudig means simple/not complex. Both mean not difficult from different angles.",
    },
    "factuur|nota": {
      zh: "factuur 是发票/正式账单，nota 也是账单/票据；付款场景里意思接近。",
      en: "factuur is an invoice/formal bill, nota can also be a bill or note. They overlap in payment contexts.",
    },
    "factuur|rekening": {
      zh: "rekening 是账单/账户，factuur 是更正式的发票账单；收到要付款的文件时常连在一起。",
      en: "rekening is bill/account, factuur is a more formal invoice. They connect when you receive something to pay.",
    },
    "nota|rekening": {
      zh: "nota 和 rekening 都能是账单；rekening 还常表示账户，所以要顺手区分。",
      en: "nota and rekening can both mean bill; rekening can also mean account, so keep that difference.",
    },
    "handleiding|instructie": {
      zh: "instructie 是指令/说明，handleiding 是完整说明书；一个是一条说明，一个是一整本/一整份。",
      en: "instructie is an instruction; handleiding is a full manual. One is a step, one is the document.",
    },
    "klacht|melding": {
      zh: "klacht 是投诉/症状，melding 是报告/通知；很多正式场景会把问题作为 melding 提交。",
      en: "klacht is complaint/symptom, melding is report/notification. In official contexts, a problem may be submitted as a melding.",
    },
    "loket|balie": {
      zh: "loket 和 balie 都是办事柜台；loket 更像窗口，balie 更像接待台。",
      en: "loket and balie are both service desks; loket is more window/counter, balie more reception desk.",
    },
    "moeilijk|lastig": {
      zh: "moeilijk 是困难，lastig 是麻烦/棘手；都表示不好处理，但 lastig 更偏烦人难搞。",
      en: "moeilijk is difficult, lastig is tricky/annoying. Both are hard, but lastig feels more troublesome.",
    },
    "salaris|loon": {
      zh: "salaris 和 loon 都是工资；salaris 更像月薪/职位工资，loon 更泛也常出现在 brutoloon/nettoloon。",
      en: "salaris and loon both mean pay/wage; salaris often feels like salary, loon is broader and appears in brutoloon/nettoloon.",
    },
    "tas|zak": {
      zh: "tas 是包，zak 是袋子/口袋；都能装东西，但形状和使用场景不同。",
      en: "tas is a bag, zak is a sack/bag/pocket. Both hold things, but the object type differs.",
    },
    "veranderen|wijzigen": {
      zh: "veranderen 是改变，wijzigen 是修改/变更；wijzigen 更常用于信息、申请、设置的正式改动。",
      en: "veranderen means change, wijzigen means modify/change formally, often for information, applications, or settings.",
    },
    "versturen|verzenden": {
      zh: "versturen 和 verzenden 都是发送/寄出；verzenden 更正式，常见于系统按钮或邮寄流程。",
      en: "versturen and verzenden both mean send; verzenden is more formal and common in system buttons or mailing.",
    },
    "doorsturen|verzenden": {
      zh: "verzenden 是发送，doorsturen 是转发；都在发送线里，但 doorsturen 是把已有内容再发出去。",
      en: "verzenden is send, doorsturen is forward. Both are sending, but doorsturen sends existing content onward.",
    },
    "afzeggen|annuleren": {
      zh: "annuleren 是取消，afzeggen 更常用于取消约定/预约；一个泛，一个更偏约好的事。",
      en: "annuleren means cancel, afzeggen is often cancel an appointment/arrangement. One is broad, one is appointment-like.",
    },
    "afzeggen|opzeggen": {
      zh: "afzeggen 是取消一次约定，opzeggen 是取消合同/订阅/租约；别混成同一种取消。",
      en: "afzeggen cancels an appointment, opzeggen terminates a contract/subscription/lease. Do not merge the two kinds of cancel.",
    },
    "annuleren|opzeggen": {
      zh: "annuleren 是取消某件事，opzeggen 是终止长期关系/合同；取消的对象不同。",
      en: "annuleren cancels an event/action, opzeggen terminates an ongoing relation or contract. The object differs.",
    },
    "boeken|reserveren": {
      zh: "boeken 和 reserveren 都是预订；boeken 更像订票/订住宿，reserveren 更像先占一个位置。",
      en: "boeken and reserveren both mean book/reserve; boeken is common for tickets/stays, reserveren is holding a spot.",
    },
    "pakken|nemen": {
      zh: "pakken 是拿起来/抓取，nemen 是拿/选择/乘坐；都能接“拿”，但 nemen 更抽象更广。",
      en: "pakken is grab/take physically, nemen is take/choose/ride. Both can mean take, but nemen is broader.",
    },
    "passen|proberen": {
      zh: "proberen 是尝试，passen 是试穿/合适；买衣服时 passen 是一种具体的 proberen。",
      en: "proberen means try, passen means try on/fit. In clothing contexts, passen is a specific kind of trying.",
    },
    "veiligheid|beveiliging": {
      zh: "veiligheid 是安全这个状态/目标，beveiliging 是保护措施/安保系统；一个说结果，一个说保护手段。",
      en: "veiligheid is safety/security as a state or goal, beveiliging is protection/security measures.",
    },
    "woning|thuis": {
      zh: "woning 是住房/房屋，thuis 是家/在家；一个偏房子对象，一个偏生活位置。",
      en: "woning is a dwelling/home as a unit, thuis is home/at home as lived place.",
    },
    "huis|woning": {
      zh: "huis 是房子/家，woning 更正式地说住房；租房、政府文件里常用 woning。",
      en: "huis is house/home, woning is the more formal dwelling/home, common in housing and official contexts.",
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
    "leerling|student": {
      zh: "student 和 leerling 都能指学生；student 常偏大学/成人学习，leerling 更像中小学或跟老师学的人。",
      en: "student and leerling both mean student/learner; student often points to higher education or adult study, while leerling is more pupil/learner with a teacher.",
    },
    "leerlingen|student": {
      zh: "student 和 leerlingen 都接“学生”这层意思；leerlingen 是复数/群体，更偏学生们或学习者们。",
      en: "student and leerlingen share the student/learner meaning; leerlingen is plural and more like pupils/learners as a group.",
    },
    "leerling|leerlingen": {
      zh: "leerling 是一个学生/学习者，leerlingen 是复数；先按单复数和学习者身份一起记。",
      en: "leerling is one pupil/learner; leerlingen is the plural. Learn them as the singular-plural learner pair.",
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
  ).filter((candidate) => !relationLexicons.confusionPairs.some(([left, right]) => {
    const source = normalizeWordText(analysis.word.dutch);
    const target = normalizeWordText(candidate.targetText);
    return (normalizeWordText(left) === source && normalizeWordText(right) === target) ||
      (normalizeWordText(right) === source && normalizeWordText(left) === target);
  }));
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
    ...generateDeclaredMemoryLinkRelations(analysis, allWords),
    ...generateWordFormationRelations(analysis, allWords),
    ...generateCompoundRelations(analysis, allWords),
    ...generatePronounFamilyRelations(analysis, allWords),
    ...generateVerbNounPairRelations(analysis, allWords),
    ...generateDerivationRelations(analysis, allWords),
    ...generateSafeRootFamilyRelations(analysis, allWords),
    ...generateSynonymRelations(analysis, allWords),
    ...generateOppositeRelations(analysis, allWords),
    ...generateComparativeRelations(analysis, allWords),
    ...generateOrderedTimeRelations(analysis, allWords),
    ...generateCategoryRelations(analysis, allWords),
    ...generateScenarioRelations(analysis, allWords),
    ...generateActionObjectRelations(analysis, allWords),
    ...generateStateActionRelations(analysis, allWords),
    ...generateLearningContextRelations(analysis, allWords),
    ...generateConfusionRelations(analysis, allWords),
    ...generateDeclaredRelatedWordRelations(analysis, allWords),
  ];
  const screenedPrimary = screenBubbleCandidates(analysis, primaryCandidates);
  const strongPrimaryCount = screenedPrimary.filter((candidate) =>
    candidate.strength === "strong" || candidate.source === "seed" || candidate.evidence === "lexicon"
  ).length;
  const fallbackCandidates = strongPrimaryCount < 2
    ? generateWordTypeFallbackRelations(analysis, allWords)
    : [];

  return screenBubbleCandidates(analysis, [...screenedPrimary, ...fallbackCandidates]);
}

function screenBubbleCandidates(analysis: WordAnalysis, candidates: MemoryBubbleCandidate[]) {
  return candidates
    .filter((candidate) => candidate.relationType !== "verb-form")
    .filter((candidate) => candidate.relationType !== "english-bridge")
    .filter((candidate) => !isPureVerbFormCandidate(analysis, candidate));
}

function isUsefulVerbFormCandidate(analysis: WordAnalysis, candidate: MemoryBubbleCandidate) {
  if (candidate.relationType !== "verb-form") return false;
  if (isZijnForm(analysis.normalizedForm) && isZijnForm(candidate.targetText)) return true;
  const infinitive = usefulVerbFormToInfinitive[analysis.normalizedForm];
  const target = normalizeWordText(candidate.targetText);
  if (infinitive && target === normalizeWordText(infinitive)) return true;
  return usefulInfinitiveToVerbForm[analysis.normalizedForm] === target;
}

function isPureVerbFormCandidate(analysis: WordAnalysis, candidate: MemoryBubbleCandidate) {
  if (candidate.relationType === "verb-noun-pair" || candidate.relationType === "confusion-pair") return false;
  if (analysis.wordType !== "verb") return false;
  const sourceKey = analysis.normalizedForm;
  const baseKey = normalizeWordText(analysis.baseForm);
  const targetKey = normalizeWordText(candidate.targetText);
  if (baseKey && baseKey !== sourceKey && targetKey === baseKey) return true;
  const targetInfinitive = infinitiveForWord(candidate.targetText);
  return Boolean(targetInfinitive) &&
    normalizeWordText(targetInfinitive) === (baseKey || sourceKey) &&
    targetKey !== sourceKey;
}
