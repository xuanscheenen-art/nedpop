import { relationLexicons } from "@/data/relationLexicons";
import { checkMemoryPathQuality } from "@/lib/checkMemoryPathQuality";
import { finiteVerbFormInfoFor, infinitiveForPastParticiple, verbUsageFor } from "@/lib/dutchVerbForms";
import { generateExamplesForWord, type GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { badGenericTargetTemplateIssue, isBroadGenericQuestionTemplate, isIncompletePhraseChunk, isKnownBadLearnerLine } from "@/lib/exampleQualityRules";
import { fallbackExamplesForWord, phraseChunkMeaningFor, type WordType as ExampleWordType } from "@/lib/exampleTemplates";
import {
  classifyMemoryPathWord,
  compoundBreakdowns,
  countryNames,
  dayMonthWords,
  englishBridgeSeeds,
  fixedExpressionSeeds,
  functionWordSeeds,
  fixedOutputSentences,
  functionWords,
  greetingPhraseWords,
  languageNames,
  lexicalMeaningFor,
  memoryPhraseSeeds,
  numberWords,
  phraseBasedWords,
  phraseMeaningForMemoryPath,
  usageAnchorFor,
  wordFormationSeeds,
  type EnglishBridgeSeed,
  type FixedExpressionSeed,
  type FunctionWordSeed,
  type MemoryPathPart,
  type SeededBreakdown,
  type WordFormationSeed,
} from "@/lib/memoryPathStrategies";
import { normalizeWordText } from "@/lib/wordAnalysis";
import type { WordAssociation } from "@/lib/wordAssociations";
import type { ExampleSentence, MemoryPath, MemoryPathStrategy, MemoryPathWordType, PhraseChunk, WordItem } from "@/types/vocabulary";

export type MemoryPathContext = {
  allWords?: WordItem[];
  memoryBubbles?: WordAssociation[];
  phraseChunks?: PhraseChunk[];
  examples?: ExampleSentence[];
};

type MeaningContrast = {
  peers: MemoryPathPart[];
  comparisonZh: string;
  comparisonEn: string;
  noteZh: string;
  noteEn: string;
};

type CategoryMemoryDetails = {
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  hookZh: string;
  hookEn: string;
  usageZh: string;
  usageEn: string;
  warningZh?: string;
  warningEn?: string;
};

const meaningContrastNotes: Record<string, Omit<MeaningContrast, "peers">> = {
  mens: {
    comparisonZh: "mens = 人/人类这个大类；persoon 是具体某个人，man / vrouw / kind 是更具体身份。",
    comparisonEn: "mens is the broad human/person word; persoon is one specific person, while man / vrouw / kind are more specific identities.",
    noteZh: "先把 mens 当“大类的人”记；表格或介绍里说某一个人时，persoon 更具体。",
    noteEn: "Learn mens as the broad human category. For one specific individual in forms or introductions, persoon is more specific.",
  },
  goed: {
    comparisonZh: "goed = 最通用的“好/顺利”；prima / fijn / oké 是相近但语气不同。",
    comparisonEn: "goed is the broad good / going well word; prima / fijn / oké are nearby but differ in tone.",
    noteZh: "prima 更像“可以/挺好”，fijn 偏“舒服/愉快”，oké 偏“可以/没问题”。",
    noteEn: "prima is more fine / good enough, fijn is pleasant / nice, and oké is neutral okay / no problem.",
  },
  prima: {
    comparisonZh: "prima = “挺好/可以/没问题”；和 goed / fijn / oké 放在一起比较。",
    comparisonEn: "prima means fine / good enough / no problem; compare it with goed / fijn / oké.",
    noteZh: "goed 最通用，fijn 偏感受舒服/愉快，oké 更中性；prima 通常比 oké 更积极一点。",
    noteEn: "goed is the broadest, fijn feels pleasant, oké is more neutral; prima is usually a little more positive than oké.",
  },
  fijn: {
    comparisonZh: "fijn = “舒服/愉快/好”；和 goed / prima / oké 都近义，但更强调感受。",
    comparisonEn: "fijn means pleasant / nice / fine; it is close to goed / prima / oké but focuses more on feeling.",
    noteZh: "说体验、安排、消息让人舒服时用 fijn；普通“好”仍然先用 goed。",
    noteEn: "Use fijn for pleasant feelings, plans, or news; use goed for the broad ordinary good.",
  },
  "oké": {
    comparisonZh: "oké = “可以/好的/没问题”；比 prima 更中性。",
    comparisonEn: "oké means okay / fine / no problem; it is more neutral than prima.",
    noteZh: "确认安排时 oké 很自然；评价很积极时可用 prima 或 goed。",
    noteEn: "oké is natural for confirming; use prima or goed for a more positive evaluation.",
  },
  oke: {
    comparisonZh: "oké = “可以/好的/没问题”；oke 是无重音写法。",
    comparisonEn: "oké means okay / fine / no problem; oke is the unaccented spelling.",
    noteZh: "学习时按 oké 记；语气比 prima 更中性。",
    noteEn: "Learn it as oké; its tone is more neutral than prima.",
  },
};

const badOutputPatterns = [
  /^Dit is (de|het)\s+[a-zA-ZÀ-ÿ'’.-]+\.?$/i,
  /^(de|het|een)\s+[a-zA-ZÀ-ÿ'’.-]+\.?$/i,
  /^(De|Het)\s+.+\s+is hier\.?$/i,
  /^Ik vraag naar\s+(de|het|een)?\s*.+\.?$/i,
  /\b(ik|jij|je|u|hij|zij|ze|wij|we|jullie)\s+\1\b/i,
];

const looksLikeAnalyticGloss = (value?: string) => {
  const text = value?.trim() ?? "";
  if (!text) return false;
  return /(^|[\s，。])[^，。.!?]{1,12}\s[+＋]\s[^，。.!?]{1,12}/.test(text);
};

const hasBasicOutputQuality = (sentence: { dutch: string; meaningZh?: string; meaningEn?: string }) =>
  Boolean(sentence.dutch.trim() && sentence.meaningZh?.trim() && sentence.meaningEn?.trim()) &&
  !looksLikeAnalyticGloss(sentence.meaningZh) &&
  !looksLikeAnalyticGloss(sentence.meaningEn) &&
  !isKnownBadLearnerLine(sentence.dutch.trim()) &&
  !badOutputPatterns.some((pattern) => pattern.test(sentence.dutch.trim()));

const isUsableOutput = (word: WordItem, sentence: { dutch: string; meaningZh?: string; meaningEn?: string }) =>
  hasBasicOutputQuality(sentence) &&
  !badGenericTargetTemplateIssue(word, sentence.dutch.trim());

const isUsableCuratedOutput = (sentence: { dutch: string; meaningZh?: string; meaningEn?: string }) =>
  hasBasicOutputQuality(sentence);

const usefulQuestionOutputPatterns = [
  /^Waar is (?:de wc|het station|de balie|de ingang|de uitgang)\?$/i,
  /^Wat is (?:uw|jouw|mijn) .+\?$/i,
  /^Wat is (?:de prijs|het totaal)\?$/i,
];

const extraWeakOutputPatterns = [
  /^We bespreken (?:de|het|een|mijn|uw|deze|dit)\b/i,
  /^Ik zie (?:de|het|een|mijn|uw|deze|dit)\b/i,
  /^Ik gebruik .+ in een zin\.$/i,
  /^Wat is (?:de|het|een) .+\?$/i,
  /^Waar is (?:de|het|een) .+\?$/i,
  /^De .+ is hier\.$/i,
  /^Het .+ is hier\.$/i,
];

const isWeakGenericOutput = (sentence: string) => {
  const normalized = sentence.trim();
  if (usefulQuestionOutputPatterns.some((pattern) => pattern.test(normalized))) return false;
  return isBroadGenericQuestionTemplate(normalized) || extraWeakOutputPatterns.some((pattern) => pattern.test(normalized));
};

const phraseLike = (value: string) => value.trim().split(/\s+/).filter(Boolean).length > 1;

const targetUseExemptTypes = new Set<MemoryPathWordType>(["number", "function-word", "language-name", "country-name", "day-month"]);
const phraseStopTokens = new Set(["de", "het", "een"]);
const phraseMeaningStopTokens = new Set([
  "de",
  "het",
  "een",
  "op",
  "in",
  "naar",
  "van",
  "bij",
  "met",
  "voor",
  "om",
  "aan",
  "te",
  "uit",
]);
const dutchTokenPattern = /[a-zA-ZÀ-ÿ]+(?:['’-][a-zA-ZÀ-ÿ]+)?/g;

const containsDutchToken = (sentence: string, token: string) =>
  Boolean(token.trim()) &&
  new RegExp(`(^|\\W)${token.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(sentence);

const phraseCoreTokens = (value: string) =>
  Array.from(value.toLowerCase().matchAll(dutchTokenPattern), (match) => match[0])
    .filter((token) => !phraseStopTokens.has(token));

const phraseRawTokens = (value: string) =>
  Array.from(value.toLowerCase().matchAll(dutchTokenPattern), (match) => match[0]);

function textContainsPhraseUse(word: WordItem, text: string) {
  const phrase = word.dutch.trim();
  if (!phrase) return false;
  if (containsDutchToken(text, phrase)) return true;

  const tokens = phraseCoreTokens(phrase);
  return tokens.length > 0 && tokens.every((token) => containsDutchToken(text, token));
}

const adjectiveEForm = (adjective: string) => {
  const irregular: Record<string, string> = { groot: "grote", oud: "oude", nieuw: "nieuwe", duur: "dure", goedkoop: "goedkope" };
  return irregular[normalizeWordText(adjective)] ?? `${adjective}e`;
};

function targetFormsFor(word: WordItem) {
  const wordType = classifyMemoryPathWord(word);
  const forms = new Set([word.dutch, word.plural ?? ""]);

  if (wordType === "verb") {
    const verb = verbUsageFor(word);
    if (verb) {
      [verb.infinitive, verb.ikForm, verb.jijForm, verb.wijForm].forEach((form) => {
        form.split("/").forEach((part) => {
          const trimmed = part.trim();
          if (!trimmed) return;
          forms.add(trimmed);
          const lastToken = trimmed.split(/\s+/).pop();
          if (lastToken && lastToken.length >= 3) forms.add(lastToken);
        });
      });
    }
  }

  if (wordType === "adjective") forms.add(adjectiveEForm(word.dutch));

  return Array.from(forms).filter(Boolean);
}

function textContainsTargetUse(word: WordItem, text: string) {
  const wordType = classifyMemoryPathWord(word);
  if (wordType === "phrase") return textContainsPhraseUse(word, text);
  if (targetUseExemptTypes.has(wordType)) return true;
  return targetFormsFor(word).some((form) => containsDutchToken(text, form));
}

function localizedPhrase(chunk: string) {
  const seeded = phraseMeaningForMemoryPath(chunk);
  const generated = phraseChunkMeaningFor(chunk);
  return {
    dutch: chunk,
    meaningZh: seeded.zh || generated?.zh || "",
    meaningEn: seeded.en || generated?.en || "",
  };
}

const localizedMemoryPhraseSeed = (seed: { dutch: string; meaningZh: string; meaningEn: string }) => ({
  dutch: seed.dutch,
  meaningZh: seed.meaningZh,
  meaningEn: seed.meaningEn,
});

const actionObjectPhraseSeeds: Record<string, { dutch: string; meaningZh: string; meaningEn: string }[]> = {
  eten: [
    { dutch: "brood eten", meaningZh: "吃面包", meaningEn: "eat bread" },
    { dutch: "rijst eten", meaningZh: "吃米饭", meaningEn: "eat rice" },
  ],
  drinken: [
    { dutch: "water drinken", meaningZh: "喝水", meaningEn: "drink water" },
    { dutch: "koffie drinken", meaningZh: "喝咖啡", meaningEn: "drink coffee" },
  ],
  kopen: [
    { dutch: "brood kopen", meaningZh: "买面包", meaningEn: "buy bread" },
    { dutch: "een kaartje kopen", meaningZh: "买一张票", meaningEn: "buy a ticket" },
  ],
  betalen: [
    { dutch: "de rekening betalen", meaningZh: "付账单", meaningEn: "pay the bill" },
    { dutch: "met pin betalen", meaningZh: "刷卡付款", meaningEn: "pay by card" },
  ],
  snijden: [
    { dutch: "brood snijden", meaningZh: "切面包", meaningEn: "cut bread" },
    { dutch: "groenten snijden", meaningZh: "切蔬菜", meaningEn: "cut vegetables" },
  ],
  schrijven: [
    { dutch: "mijn naam schrijven", meaningZh: "写我的名字", meaningEn: "write my name" },
    { dutch: "een e-mail schrijven", meaningZh: "写一封邮件", meaningEn: "write an email" },
  ],
  lezen: [
    { dutch: "een brief lezen", meaningZh: "读一封信", meaningEn: "read a letter" },
    { dutch: "de handleiding lezen", meaningZh: "读说明书", meaningEn: "read the manual" },
  ],
  bellen: [
    { dutch: "de huisarts bellen", meaningZh: "给家庭医生打电话", meaningEn: "call the GP" },
    { dutch: "de gemeente bellen", meaningZh: "给市政厅打电话", meaningEn: "call the municipality" },
  ],
  maken: [
    { dutch: "een afspraak maken", meaningZh: "预约", meaningEn: "make an appointment" },
    { dutch: "een plan maken", meaningZh: "做一个计划", meaningEn: "make a plan" },
  ],
  invullen: [
    { dutch: "een formulier invullen", meaningZh: "填写表格", meaningEn: "fill in a form" },
    { dutch: "mijn adres invullen", meaningZh: "填写我的地址", meaningEn: "fill in my address" },
  ],
  aanvragen: [
    { dutch: "huurtoeslag aanvragen", meaningZh: "申请房租补贴", meaningEn: "apply for rent benefit" },
    { dutch: "een document aanvragen", meaningZh: "申请一份文件", meaningEn: "request a document" },
  ],
  sturen: [
    { dutch: "een e-mail sturen", meaningZh: "发送邮件", meaningEn: "send an email" },
    { dutch: "een document sturen", meaningZh: "发送文件", meaningEn: "send a document" },
  ],
  opsturen: [
    { dutch: "een formulier opsturen", meaningZh: "寄/提交表格", meaningEn: "send in a form" },
    { dutch: "een bewijs opsturen", meaningZh: "提交证明", meaningEn: "send proof" },
  ],
  meenemen: [
    { dutch: "mijn pas meenemen", meaningZh: "带上我的证件", meaningEn: "take my pass with me" },
    { dutch: "mijn tas meenemen", meaningZh: "带上我的包", meaningEn: "take my bag with me" },
  ],
  vergeten: [
    { dutch: "mijn pas vergeten", meaningZh: "忘带我的证件", meaningEn: "forget my pass" },
    { dutch: "de afspraak vergeten", meaningZh: "忘记预约", meaningEn: "forget the appointment" },
  ],
  ophalen: [
    { dutch: "medicijnen ophalen", meaningZh: "取药", meaningEn: "pick up medicine" },
    { dutch: "een pakket ophalen", meaningZh: "取包裹", meaningEn: "pick up a package" },
  ],
  brengen: [
    { dutch: "een document brengen", meaningZh: "带来一份文件", meaningEn: "bring a document" },
    { dutch: "mijn kind naar school brengen", meaningZh: "送孩子去学校", meaningEn: "bring my child to school" },
  ],
  zoeken: [
    { dutch: "werk zoeken", meaningZh: "找工作", meaningEn: "look for work" },
    { dutch: "een adres zoeken", meaningZh: "找地址", meaningEn: "look for an address" },
  ],
  sluiten: [
    { dutch: "de deur sluiten", meaningZh: "关门", meaningEn: "close the door" },
    { dutch: "het raam sluiten", meaningZh: "关窗", meaningEn: "close the window" },
  ],
  sluit: [
    { dutch: "sluit de app", meaningZh: "关闭应用", meaningEn: "close the app" },
    { dutch: "de deur sluiten", meaningZh: "关门", meaningEn: "close the door" },
  ],
  openen: [
    { dutch: "de deur openen", meaningZh: "开门", meaningEn: "open the door" },
    { dutch: "het formulier openen", meaningZh: "打开表格", meaningEn: "open the form" },
  ],
  open: [
    { dutch: "open de app", meaningZh: "打开应用", meaningEn: "open the app" },
    { dutch: "de deur openen", meaningZh: "开门", meaningEn: "open the door" },
  ],
  regelen: [
    { dutch: "opvang regelen", meaningZh: "安排托管/照看", meaningEn: "arrange childcare/care" },
    { dutch: "een afspraak regelen", meaningZh: "安排预约", meaningEn: "arrange an appointment" },
  ],
  zeg: [
    { dutch: "zeg hallo", meaningZh: "说你好", meaningEn: "say hello" },
    { dutch: "nog een keer zeggen", meaningZh: "再说一遍", meaningEn: "say it one more time" },
  ],
  zeggen: [
    { dutch: "hallo zeggen", meaningZh: "说你好", meaningEn: "say hello" },
    { dutch: "nog een keer zeggen", meaningZh: "再说一遍", meaningEn: "say it one more time" },
  ],
  luisteren: [
    { dutch: "naar de uitleg luisteren", meaningZh: "听解释", meaningEn: "listen to the explanation" },
    { dutch: "naar Nederlands luisteren", meaningZh: "听荷兰语", meaningEn: "listen to Dutch" },
  ],
  luister: [
    { dutch: "luister naar de uitleg", meaningZh: "听解释", meaningEn: "listen to the explanation" },
    { dutch: "luister naar Nederlands", meaningZh: "听荷兰语", meaningEn: "listen to Dutch" },
  ],
  begin: [
    { dutch: "nu beginnen", meaningZh: "现在开始", meaningEn: "start now" },
    { dutch: "de les begint", meaningZh: "课开始", meaningEn: "the lesson starts" },
  ],
  klik: [
    { dutch: "klik hier", meaningZh: "点击这里", meaningEn: "click here" },
  ],
};

type VerbObjectHookSeed = {
  zh: (objectPicture: string, word: WordItem) => string;
  en: (objectPicture: string, word: WordItem) => string;
};

const makeVerbObjectHook = (
  zh: (objectPicture: string, word: WordItem) => string,
  en: (objectPicture: string, word: WordItem) => string,
): VerbObjectHookSeed => ({ zh, en });

const verbObjectHookSeeds: Record<string, VerbObjectHookSeed> = {
  eten: makeVerbObjectHook(
    (objectPicture) => `盘子里放着 ${objectPicture}，送进嘴里吃；这个动作就是 eten。`,
    (objectPicture) => `Picture ${objectPicture} on a plate and eating it; that action is eten.`,
  ),
  drinken: makeVerbObjectHook(
    (objectPicture) => `杯子里是 ${objectPicture}，举起来喝；这个动作就是 drinken。`,
    (objectPicture) => `Picture ${objectPicture} in a cup and drinking it; that action is drinken.`,
  ),
  kopen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 放进篮子，到收银台付钱；这个动作就是 kopen。`,
    (objectPicture) => `Put ${objectPicture} in the basket and pay at the counter; that action is kopen.`,
  ),
  betalen: makeVerbObjectHook(
    (objectPicture) => `收到账单或到付款机前，把钱付出去；看到 ${objectPicture} 就想到 betalen。`,
    (objectPicture) => `A bill or card terminal asks for money; with ${objectPicture}, the paying action is betalen.`,
  ),
  snijden: makeVerbObjectHook(
    (objectPicture) => `拿刀切 ${objectPicture}；刀落下去的动作，就是 snijden。`,
    (objectPicture) => `Take a knife to ${objectPicture}; the cutting action is snijden.`,
  ),
  schrijven: makeVerbObjectHook(
    (objectPicture) => `笔尖落在 ${objectPicture} 上，把字写出来；这个动作就是 schrijven。`,
    (objectPicture) => `A pen moves over ${objectPicture} and writes it down; that action is schrijven.`,
  ),
  lezen: makeVerbObjectHook(
    (objectPicture) => `眼睛扫过 ${objectPicture}，把文字读出来；这个动作就是 lezen。`,
    (objectPicture) => `Your eyes move over ${objectPicture} and read the text; that action is lezen.`,
  ),
  schrijf: makeVerbObjectHook(
    (objectPicture) => `笔尖落在 ${objectPicture} 上，把字写出来；这个动作就是 schrijf。`,
    (objectPicture) => `A pen moves over ${objectPicture} and writes it down; that action is schrijf.`,
  ),
  lees: makeVerbObjectHook(
    (objectPicture) => `眼睛扫过 ${objectPicture}，把文字读出来；这个动作就是 lees。`,
    (objectPicture) => `Your eyes move over ${objectPicture} and read the text; that action is lees.`,
  ),
  bellen: makeVerbObjectHook(
    (objectPicture) => `拿起电话打给 ${objectPicture}；拨出去的动作就是 bellen。`,
    (objectPicture) => `Pick up the phone and call ${objectPicture}; that calling action is bellen.`,
  ),
  maken: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 做出来或约出来；从没有到有的动作就是 maken。`,
    (objectPicture) => `Make or arrange ${objectPicture}; the action of bringing it into being is maken.`,
  ),
  invullen: makeVerbObjectHook(
    (objectPicture) => `表格上有空格，把 ${objectPicture} 填进去；这个动作就是 invullen。`,
    (objectPicture) => `A form has empty boxes; filling in ${objectPicture} is invullen.`,
  ),
  aanvragen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 交给机构，请他们给你办理；这个动作就是 aanvragen。`,
    (objectPicture) => `Submit ${objectPicture} to an office and ask for it officially; that action is aanvragen.`,
  ),
  sturen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 从你这里发到对方那里；这个动作就是 sturen。`,
    (objectPicture) => `Send ${objectPicture} from you to someone else; that action is sturen.`,
  ),
  opsturen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 正式寄出/提交出去；这个动作就是 opsturen。`,
    (objectPicture) => `Send in or submit ${objectPicture} officially; that action is opsturen.`,
  ),
  meenemen: makeVerbObjectHook(
    (objectPicture) => `出门前把 ${objectPicture} 放进包，带着走；这个动作就是 meenemen。`,
    (objectPicture) => `Put ${objectPicture} in your bag before leaving and take it with you; that action is meenemen.`,
  ),
  vergeten: makeVerbObjectHook(
    (objectPicture) => `人已经到门口，突然发现 ${objectPicture} 没带/忘了；这就是 vergeten。`,
    (objectPicture) => `You reach the door and realize ${objectPicture} is missing; that is vergeten.`,
  ),
  ophalen: makeVerbObjectHook(
    (objectPicture) => `东西已经在那里，过去把 ${objectPicture} 取回来；这个动作就是 ophalen。`,
    (objectPicture) => `${objectPicture} is waiting somewhere; going there to pick it up is ophalen.`,
  ),
  brengen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 从你这里带到别人/别处；这个动作就是 brengen。`,
    (objectPicture) => `Carry ${objectPicture} from you to someone or somewhere else; that action is brengen.`,
  ),
  zoeken: makeVerbObjectHook(
    (objectPicture) => `眼睛在地图、柜台或手机里找 ${objectPicture}；这个动作就是 zoeken。`,
    (objectPicture) => `Your eyes search a map, counter, or phone for ${objectPicture}; that action is zoeken.`,
  ),
  regelen: makeVerbObjectHook(
    (objectPicture) => `把 ${objectPicture} 安排妥当，让事情能运行；这个动作就是 regelen。`,
    (objectPicture) => `Arrange ${objectPicture} so the situation works; that action is regelen.`,
  ),
};

const verbShortActionHooks: Record<string, { zh: string; en: string }> = {
  eten: { zh: "eten=把食物吃掉", en: "eten = eat the food" },
  drinken: { zh: "drinken=把饮料喝下去", en: "drinken = drink it" },
  kopen: { zh: "kopen=拿货去付款", en: "kopen = take it and pay" },
  betalen: { zh: "betalen=把钱付出去", en: "betalen = pay the money" },
  snijden: { zh: "snijden=刀切下去", en: "snijden = cut with a knife" },
  schrijven: { zh: "schrijven=把字写出来", en: "schrijven = write words out" },
  schrijf: { zh: "schrijf=我来写", en: "schrijf = I write" },
  lezen: { zh: "lezen=眼睛读文字", en: "lezen = read text" },
  lees: { zh: "lees=我来读", en: "lees = I read" },
  zeggen: { zh: "zeggen=把内容说出口", en: "zeggen = say it out loud" },
  zeg: { zh: "zeg=说出口这一刻", en: "zeg = say it out loud now" },
  luisteren: { zh: "luisteren=把声音听进去", en: "luisteren = take sound in by listening" },
  luister: { zh: "luister=耳朵开始接收", en: "luister = start receiving with your ears" },
  beginnen: { zh: "beginnen=让事情启动", en: "beginnen = start something" },
  begin: { zh: "begin=启动这一刻", en: "begin = the starting moment" },
  bellen: { zh: "bellen=拨电话出去", en: "bellen = make a call" },
  maken: { zh: "maken=把事情做成", en: "maken = make or arrange" },
  invullen: { zh: "invullen=把空格填满", en: "invullen = fill in blanks" },
  aanvragen: { zh: "aanvragen=正式申请", en: "aanvragen = apply officially" },
  sturen: { zh: "sturen=把信息发出去", en: "sturen = send it out" },
  opsturen: { zh: "opsturen=提交寄出", en: "opsturen = send in" },
  meenemen: { zh: "meenemen=带上一起走", en: "meenemen = take along" },
  vergeten: { zh: "vergeten=到门口才想起", en: "vergeten = realize it is forgotten" },
  ophalen: { zh: "ophalen=过去取回来", en: "ophalen = go pick it up" },
  brengen: { zh: "brengen=带到别人那边", en: "brengen = bring it over" },
  ruilen: { zh: "ruilen=把买到的东西换成别的", en: "ruilen = exchange it for something else" },
  terugbrengen: { zh: "terugbrengen=把东西带回原处/退回去", en: "terugbrengen = bring or return it back" },
  bewaren: { zh: "bewaren=把东西留好收好", en: "bewaren = keep something safely" },
  zoeken: { zh: "zoeken=到处找", en: "zoeken = search around" },
  sluiten: { zh: "sluiten=把开着的关上", en: "sluiten = close what is open" },
  sluit: { zh: "sluit=现在把它关上", en: "sluit = close it now" },
  openen: { zh: "openen=把关着的打开", en: "openen = open what is closed" },
  open: { zh: "open=现在把它打开", en: "open = open it now" },
  regelen: { zh: "regelen=把乱事安排好", en: "regelen = arrange the mess" },
  inloggen: { zh: "inloggen=进入账号系统", en: "inloggen = enter an account system" },
  uitloggen: { zh: "uitloggen=退出账号系统", en: "uitloggen = leave an account system" },
  aankleden: { zh: "aankleden=把衣服穿到自己身上", en: "aankleden = get dressed" },
  glimlachen: { zh: "glimlachen=脸上露出微笑", en: "glimlachen = smile with your face" },
  interesseren: { zh: "interesseren=让某人产生兴趣", en: "interesseren = make someone interested" },
  rennen: { zh: "rennen=脚步加快冲起来", en: "rennen = speed up and run" },
  uitgaan: { zh: "uitgaan=晚上离开家去社交娱乐", en: "uitgaan = go out for an evening activity" },
  verkopen: { zh: "verkopen=把商品交给买家并收钱", en: "verkopen = give goods to a buyer and receive payment" },
  herformuleren: { zh: "herformuleren=同一句话换个说法", en: "herformuleren = say the same thing in another way" },
};

const actionUsageExplanationOverrides: Record<string, { zh: string; en: string }> = {
  inloggen: {
    zh: "账号场景里先认 inloggen met DigiD / met je gebruikersnaam：这是“进入系统”的登录动作。",
    en: "In account contexts, learn chunks like inloggen met DigiD / met je gebruikersnaam: it is the action of entering a system.",
  },
  uitloggen: {
    zh: "账号场景里 inloggen 是进入系统，uitloggen 是退出系统；这一组按进/出对照记。",
    en: "In account contexts, inloggen means entering the system and uitloggen means leaving it; learn them as an in/out pair.",
  },
  aankleden: {
    zh: "aankleden 常和反身词一起用：zich aankleden = 自己穿衣服；句子里会变成 ik kleed mij aan / je kleedt je aan。",
    en: "aankleden is often reflexive: zich aankleden = get dressed; in sentences it becomes ik kleed mij aan / je kleedt je aan.",
  },
  glimlachen: {
    zh: "glimlachen 的动作方向是 naar iemand glimlachen = 对某人微笑；不是只背一个“微笑”。",
    en: "The direction pattern for glimlachen is naar iemand glimlachen = smile at someone, not just the bare word smile.",
  },
  interesseren: {
    zh: "interesseren 有两条常用线：iets interesseert iemand = 某事让某人感兴趣；zich interesseren voor iets = 对某事感兴趣。",
    en: "interesseren has two useful patterns: iets interesseert iemand = something interests someone; zich interesseren voor iets = be interested in something.",
  },
  rennen: {
    zh: "rennen 是具体的奔跑动作，比 lopen 更快；和 hardlopen 相比，它不一定是在做跑步运动。",
    en: "rennen is the concrete action of running, faster than lopen; unlike hardlopen, it is not necessarily running as exercise.",
  },
  uitgaan: {
    zh: "uitgaan 在日常里常指晚上出去社交或娱乐：vanavond uitgaan = 今晚出去玩；不是 komen/uit 的来源结构。",
    en: "uitgaan often means going out socially in the evening: vanavond uitgaan = go out tonight; it is not the source pattern komen uit.",
  },
  verkopen: {
    zh: "verkopen 和 kopen 从买卖双方对着记：de winkel verkoopt，de klant koopt。",
    en: "Learn verkopen opposite kopen from the two sides of a sale: de winkel verkoopt, de klant koopt.",
  },
  herformuleren: {
    zh: "herformuleren 是把同一句话换个说法；常在没听懂或想说清楚时用。",
    en: "herformuleren means saying the same thing in another way; use it when something was unclear or needs clearer wording.",
  },
  ruilen: {
    zh: "ruilen 是把买到/拿到的东西换成别的；退换货时常说 een artikel ruilen 或 deze jas ruilen。",
    en: "ruilen means exchange something you bought or received for something else; in returns, common chunks are een artikel ruilen or deze jas ruilen.",
  },
  terugbrengen: {
    zh: "terugbrengen 是把东西带回原处：商店里是退回/拿回去，图书馆里是还回去；先按 terug + brengen 记方向。",
    en: "terugbrengen means bring something back to where it belongs: return it to a shop or library; learn the direction from terug + brengen.",
  },
  bewaren: {
    zh: "bewaren 是把东西留好、收好；购物后常和 bon/bonnetje/bewijs 连在一起，表示把凭证保存住。",
    en: "bewaren means keep something safely; after shopping it often connects with bon/bonnetje/bewijs, keeping proof or a receipt.",
  },
  pinnen: {
    zh: "pinnen 是用银行卡/借记卡付款；最常见先会问 Kan ik hier pinnen? = 这里能刷卡吗？",
    en: "pinnen means paying by bank/debit card; a key first question is Kan ik hier pinnen? = can I pay by card here?",
  },
  scheiden: {
    zh: "scheiden 是关系正式分开；说婚姻结束时常说 Wij gaan scheiden / Ik ben gescheiden。",
    en: "scheiden means formally separate; for a marriage ending, common lines are Wij gaan scheiden / Ik ben gescheiden.",
  },
  eindigen: {
    zh: "eindigen 看活动落到哪个结束点：De les eindigt om drie uur = 课三点结束。",
    en: "eindigen points to where an activity ends: De les eindigt om drie uur = the lesson ends at three.",
  },
  weten: {
    zh: "weten 是脑子里知道答案或信息；最小块先记 Ik weet het = 我知道这件事/答案。",
    en: "weten means knowing an answer or piece of information; the first small chunk is Ik weet het = I know it.",
  },
  spelen: {
    zh: "spelen 是孩子/人在玩这个动作；后面也能接游戏、球类或乐器。",
    en: "spelen means a child or person is playing; it can also take games, sports, or instruments.",
  },
  klaarmaken: {
    zh: "klaarmaken 是把东西准备好；eten klaarmaken 是准备饭/做饭，不是单纯“吃”。",
    en: "klaarmaken means make something ready; eten klaarmaken means prepare food, not simply eat.",
  },
  waarderen: {
    zh: "waarderen 来自 waarde（价值）：可以 waardeer uw hulp，也可以 waarderen wat iemand doet；核心是“看见价值/表示重视”。",
    en: "waarderen comes from waarde, value: you can say waardeer uw hulp or waarderen wat someone does; the core is seeing value/appreciating it.",
  },
};

const preferredMemoryPhraseChunks: Record<string, string[]> = {
  open: ["open de app"],
  auto: ["met de auto"],
  halte: ["naar de halte gaan"],
  station: ["naar het station gaan"],
  bus: ["de bus nemen"],
  trein: ["de trein nemen"],
  fiets: ["met de fiets"],
};

const normalizeChunkText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

const looksLikePlaceholderChunk = (value: string) => /(?:\.\.\.|…)/.test(value);

function isBareTargetChunk(word: WordItem, chunk: string) {
  if (word.dutch.trim().split(/\s+/).length > 1) return false;
  const normalizedChunk = normalizeChunkText(chunk);
  const normalizedTarget = normalizeChunkText(word.dutch);
  const articleChunk = word.article ? `${word.article} ${normalizedTarget}` : "";
  return normalizedChunk === normalizedTarget || normalizedChunk === articleChunk;
}

const possessiveZh: Record<string, string> = {
  mijn: "我的",
  jouw: "你的",
  uw: "您的",
  zijn: "他的",
  haar: "她的",
  ons: "我们的",
  onze: "我们的",
  hun: "他们的",
};

const quantifierZh: Record<string, string> = {
  geen: "没有",
  veel: "很多",
  weinig: "很少",
  meer: "更多",
  minder: "更少",
  elke: "每个",
};

const phraseVerbZh: Record<string, string> = {
  aanvragen: "申请",
  beginnen: "开始",
  begrijpen: "理解",
  bellen: "给……打电话",
  betalen: "支付",
  brengen: "带来",
  controleren: "检查",
  doen: "做",
  dragen: "戴/穿",
  drinken: "喝",
  eten: "吃",
  geven: "给",
  gaan: "去",
  hebben: "有",
  invullen: "填写",
  koken: "做饭",
  komen: "来",
  kopen: "买",
  leggen: "放平",
  leren: "学习",
  lezen: "读",
  lopen: "走",
  maken: "做",
  meenemen: "带上",
  nemen: "拿/乘坐",
  ophalen: "取",
  opsturen: "寄出/提交",
  printen: "打印",
  regelen: "安排",
  scannen: "扫描",
  schrijven: "写",
  snijden: "切",
  slapen: "睡觉",
  staan: "站",
  sturen: "发送",
  uploaden: "上传",
  wachten: "等待",
  werken: "工作",
  willen: "想要",
  wonen: "住",
  zeggen: "说",
  zoeken: "找",
};

function compactZhToken(token: string, allWords: WordItem[]) {
  const meaning = lexicalMeaningFor(token, allWords);
  return meaning?.zh.split(/[\/,;，；、]/)[0].trim() || "";
}

function compactObjectZh(tokens: string[], allWords: WordItem[]) {
  const useful = tokens.filter((token) =>
    token &&
    !phraseMeaningStopTokens.has(token) &&
    !["ik", "jij", "je", "u", "wij", "we", "zij", "ze", "ben", "bent", "is", "zijn"].includes(token),
  );
  if (!useful.length) return "";
  const first = useful[0];
  if (possessiveZh[first] && useful[1]) return `${possessiveZh[first]}${compactZhToken(useful[1], allWords) || useful[1]}`;
  if (quantifierZh[first] && useful[1]) return `${quantifierZh[first]}${compactZhToken(useful[1], allWords) || useful[1]}`;
  return useful.map((token) => compactZhToken(token, allWords) || token).join("");
}

function naturalPhraseMeaningFor(chunk: string, allWords: WordItem[]) {
  const rawTokens = phraseRawTokens(chunk);
  const coreTokens = rawTokens.filter((token) => !phraseMeaningStopTokens.has(token));
  if (!coreTokens.length) return undefined;
  const hasKnownVerb = rawTokens.some((token) => phraseVerbZh[token]);

  if (!hasKnownVerb && rawTokens[0] && possessiveZh[rawTokens[0]] && rawTokens[1] && rawTokens.length <= 3) {
    const noun = compactZhToken(rawTokens[1], allWords);
    if (noun) return possessiveZh[rawTokens[0]] + noun;
  }

  if (!hasKnownVerb && rawTokens[0] && quantifierZh[rawTokens[0]] && rawTokens[1] && rawTokens.length <= 3) {
    const noun = compactZhToken(rawTokens[1], allWords);
    if (noun) return quantifierZh[rawTokens[0]] + noun;
  }

  if (rawTokens[0] === "niet" && rawTokens[1]) {
    const verb = phraseVerbZh[rawTokens[1]] || compactZhToken(rawTokens[1], allWords);
    if (verb) return `不${verb}`;
  }

  if (rawTokens[0] === "is" && rawTokens[1]) {
    const state = compactZhToken(rawTokens[1], allWords);
    if (state) return `是${state}`;
  }

  if (rawTokens.includes("nodig") && rawTokens.includes("hebben")) {
    const object = compactObjectZh(rawTokens.slice(0, rawTokens.indexOf("nodig")), allWords);
    return object ? `需要${object}` : "需要";
  }

  if (rawTokens.includes("naar") && rawTokens.includes("gaan")) {
    const target = compactObjectZh(rawTokens.slice(rawTokens.indexOf("naar") + 1, rawTokens.indexOf("gaan")), allWords);
    return target ? `去${target}` : "去";
  }

  if (rawTokens.includes("naar") && rawTokens.includes("lopen")) {
    const target = compactObjectZh(rawTokens.slice(rawTokens.indexOf("naar") + 1, rawTokens.indexOf("lopen")), allWords);
    return target ? `走路去${target}` : "走路去";
  }

  if (rawTokens.includes("uit") && rawTokens.includes("komen")) {
    const target = compactObjectZh(rawTokens.slice(rawTokens.indexOf("uit") + 1, rawTokens.indexOf("komen")), allWords);
    return target ? `来自${target}` : "来自";
  }

  if (rawTokens.includes("in") && rawTokens.includes("wonen")) {
    const target = compactObjectZh(rawTokens.slice(rawTokens.indexOf("in") + 1, rawTokens.indexOf("wonen")), allWords);
    return target ? `住在${target}` : "居住";
  }

  const verbIndex = rawTokens.findLastIndex((token) => phraseVerbZh[token]);
  if (verbIndex >= 0) {
    const verb = rawTokens[verbIndex];
    const object = compactObjectZh(rawTokens.slice(0, verbIndex), allWords);
    if (verb === "beginnen" && rawTokens.includes("nu")) return "现在开始";
    if (verb === "slapen" && rawTokens.includes("goed")) return "睡得好";
    if (verb === "wachten" && rawTokens.includes("minuten")) {
      const amount = compactObjectZh(rawTokens.slice(0, rawTokens.indexOf("minuten")), allWords);
      return `等${amount || ""}分钟`;
    }
    if (verb === "maken" && object === "照片") return "拍照片";
    if (verb === "maken" && object === "预约") return "预约";
    if (verb === "nemen" && object === "地方") return "坐下";
    if (verb === "geven" && object === "回答") return "回答";
    if (verb === "dragen" && object) return `戴/穿${object}`;
    if (verb === "bellen" && object) return `给${object}打电话`;
    if (verb === "gaan" && object) return `去${object}`;
    if (verb === "komen" && object) return `来${object}`;
    if (object) return `${phraseVerbZh[verb]}${object}`;
    return phraseVerbZh[verb];
  }

  return undefined;
}

function fallbackPhraseMeaningFor(word: WordItem, chunk: string, allWords: WordItem[]) {
  const key = normalizeWordText(word.dutch);
  const natural = naturalPhraseMeaningFor(chunk, allWords);
  if (natural) {
    return {
      zh: natural,
      en: primaryMeaning(word, "en"),
    };
  }
  const tokens = phraseCoreTokens(chunk);
  const tokenMeanings = tokens
    .filter((token) => !phraseMeaningStopTokens.has(token))
    .map((token) => {
      const meaning = normalizeWordText(token) === key ? word.meaning : lexicalMeaningFor(token, allWords);
      if (!meaning?.zh || !meaning.en) return undefined;
      return {
        zh: meaning.zh.split(/[\/,;，；、]/)[0].trim(),
        en: meaning.en.split(/[\/,;]|\bor\b/)[0].trim(),
      };
    })
    .filter(Boolean) as { zh: string; en: string }[];

  const uniqueMeanings = tokenMeanings.filter((meaning, index, meanings) =>
    meanings.findIndex((item) => item.zh === meaning.zh && item.en === meaning.en) === index,
  );

  if (uniqueMeanings.length >= 2) {
    return {
      zh: primaryMeaning(word, "zh"),
      en: primaryMeaning(word, "en"),
    };
  }
  if (uniqueMeanings.length === 1) {
    return {
      zh: uniqueMeanings[0].zh,
      en: uniqueMeanings[0].en,
    };
  }

  return {
    zh: primaryMeaning(word, "zh"),
    en: primaryMeaning(word, "en"),
  };
}

function cleanPhraseChunks(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const allWords = context.allWords ?? [word];
  const wordType = classifyMemoryPathWord(word);
  const isPhraseChunkLine = (value: string) => {
    const text = value.trim();
    return Boolean(text) && !/[.!?]$/.test(text);
  };
  const fromSeed = (memoryPhraseSeeds[key] ?? [])
    .filter((chunk) => isPhraseChunkLine(chunk.dutch) && textContainsTargetUse(word, chunk.dutch))
    .map(localizedMemoryPhraseSeed);
  const fromActionObject = (actionObjectPhraseSeeds[key] ?? [])
    .filter((chunk) => isPhraseChunkLine(chunk.dutch) && textContainsTargetUse(word, chunk.dutch))
    .map(localizedMemoryPhraseSeed);
  const fromPreferred = (preferredMemoryPhraseChunks[key] ?? [])
    .filter((chunk) => isPhraseChunkLine(chunk) && textContainsTargetUse(word, chunk))
    .map(localizedPhrase);
  const fromContext = (context.phraseChunks ?? [])
    .filter((chunk) => isPhraseChunkLine(chunk.dutch) && !looksLikePlaceholderChunk(chunk.dutch) && (
      (Array.isArray(chunk.relatedWords) && chunk.relatedWords.map(normalizeWordText).includes(key)) ||
      textContainsTargetUse(word, chunk.dutch)
    ) && textContainsTargetUse(word, chunk.dutch))
    .map((chunk) => ({
      dutch: chunk.dutch,
      meaningZh: chunk.meaning.zh,
      meaningEn: chunk.meaning.en,
    }));
  const fromWord = (word.phraseChunks ?? [])
    .filter((chunk) =>
      chunk &&
      isPhraseChunkLine(chunk) &&
      !looksLikePlaceholderChunk(chunk) &&
      normalizeWordText(chunk) !== key &&
      chunk !== `${word.dutch}.` &&
      textContainsTargetUse(word, chunk)
    )
    .map(localizedPhrase);
  const fromWholePhrase = wordType === "phrase"
    ? [{
        dutch: word.dutch,
        meaningZh: primaryMeaning(word, "zh"),
        meaningEn: primaryMeaning(word, "en"),
      }]
    : [];
  const fromExplicitComponents = (phraseComponentOverrides[normalizeChunkText(word.dutch)] ?? [])
    .filter((chunk) => isPhraseChunkLine(chunk.dutch))
    .map((chunk) => ({
      dutch: chunk.dutch,
      meaningZh: chunk.meaningZh,
      meaningEn: chunk.meaningEn,
    }));

  const uniqueChunks = [...fromSeed, ...fromActionObject, ...fromPreferred, ...fromContext, ...fromWord, ...fromWholePhrase, ...fromExplicitComponents]
    .filter((chunk) => !isIncompletePhraseChunk(chunk.dutch))
    .filter((chunk, index, chunks) => chunks.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(chunk.dutch)) === index);
  const chunksWithWordMeanings = uniqueChunks.map((chunk) => {
    if (chunk.meaningZh && chunk.meaningEn) {
      return chunk;
    }
    if (normalizeChunkText(chunk.dutch) !== normalizeChunkText(word.exampleSentence?.dutch ?? "")) {
      const fallback = fallbackPhraseMeaningFor(word, chunk.dutch, allWords);
      return {
        ...chunk,
        meaningZh: fallback.zh,
        meaningEn: fallback.en,
      };
    }
    return {
      ...chunk,
      meaningZh: word.exampleSentence.meaning.zh,
      meaningEn: word.exampleSentence.meaning.en,
    };
  });
  const usefulChunks = chunksWithWordMeanings.filter((chunk) => !isBareTargetChunk(word, chunk.dutch));

  return (usefulChunks.length ? usefulChunks : chunksWithWordMeanings).slice(0, 4);
}

function generatedSentenceCandidates(word: WordItem, context: MemoryPathContext) {
  const templated = fallbackExamplesForWord(word, classifyMemoryPathWord(word) as ExampleWordType)
    .filter((example) => example.confidence !== "low" && !example.needsHumanReview)
    .map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaningZh,
      meaningEn: example.meaningEn,
      trustedTargetUse: true,
      sourceRank: 0.5,
    }));
  const existing = (context.examples ?? []).map((example) => ({
    dutch: example.dutch,
    meaningZh: example.meaning.zh,
    meaningEn: example.meaning.en,
    trustedTargetUse: false,
    sourceRank: 0,
  }));
  const generated = generateExamplesForWord(word, { existingExamples: context.examples })
    .filter((example: GeneratedExample) => example.confidence !== "low" && !example.needsHumanReview && !(example.qualityIssues?.length))
    .map((example) => ({
      dutch: example.dutch,
      meaningZh: example.meaningZh,
      meaningEn: example.meaningEn,
      trustedTargetUse: true,
      sourceRank: 2,
    }));
  const fallback = {
    dutch: word.exampleSentence.dutch,
    meaningZh: word.exampleSentence.meaning.zh,
    meaningEn: word.exampleSentence.meaning.en,
    trustedTargetUse: true,
    sourceRank: 1,
  };

  return [...templated, ...existing, ...generated, fallback]
    .filter((sentence) => isUsableOutput(word, sentence))
    .filter((sentence) => sentence.trustedTargetUse || textContainsTargetUse(word, sentence.dutch))
    .filter((sentence, index, sentences) => sentences.findIndex((item) => normalizeWordText(item.dutch) === normalizeWordText(sentence.dutch)) === index)
    .sort((a, b) => {
      const weakDiff = Number(isWeakGenericOutput(a.dutch)) - Number(isWeakGenericOutput(b.dutch));
      if (weakDiff) return weakDiff;
      return a.sourceRank - b.sourceRank;
    });
}

function outputFromTemplateExample(word: WordItem) {
  const wordType = classifyMemoryPathWord(word);
  const examples = fallbackExamplesForWord(word, wordType as ExampleWordType);
  const usable = examples.find(
    (example) =>
      example.confidence !== "low" &&
      !example.needsHumanReview &&
      isUsableOutput(word, example) &&
      !isWeakGenericOutput(example.dutch),
  );
  if (!usable) return undefined;
  return {
    dutch: usable.dutch,
    meaningZh: usable.meaningZh,
    meaningEn: usable.meaningEn,
    trustedTargetUse: true,
  };
}

const exactScenarioOutputs: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  bijgevoegd: { dutch: "Bijgevoegd vindt u mijn documenten.", meaningZh: "随附的是我的材料。", meaningEn: "Attached you will find my documents." },
  dagkaart: { dutch: "Ik koop een dagkaart voor de trein.", meaningZh: "我买一张火车日票。", meaningEn: "I buy a day ticket for the train." },
  verkopen: { dutch: "De winkel verkoopt fietsen.", meaningZh: "这家店卖自行车。", meaningEn: "The shop sells bicycles." },
  rennen: { dutch: "Ik ren naar de bus.", meaningZh: "我跑向公交车。", meaningEn: "I run to the bus." },
  interesseren: { dutch: "Nederlandse kunst interesseert mij.", meaningZh: "我对荷兰艺术感兴趣。", meaningEn: "Dutch art interests me." },
  "ja hoor": { dutch: "Ja hoor.", meaningZh: "当然可以。", meaningEn: "Yes, sure." },
  "nee hoor": { dutch: "Nee hoor.", meaningZh: "不是/不用。", meaningEn: "No, not really." },
  welkom: { dutch: "Welkom!", meaningZh: "欢迎！", meaningEn: "Welcome!" },
  "tot morgen": { dutch: "Tot morgen!", meaningZh: "明天见！", meaningEn: "See you tomorrow!" },
  "tot straks": { dutch: "Tot straks!", meaningZh: "一会儿见！", meaningEn: "See you soon!" },
  "geen probleem": { dutch: "Geen probleem.", meaningZh: "没问题。", meaningEn: "No problem." },
  "maakt niet uit": { dutch: "Het maakt niet uit.", meaningZh: "没关系/无所谓。", meaningEn: "It does not matter." },
  "ik ook": { dutch: "Ik ook.", meaningZh: "我也是。", meaningEn: "Me too." },
  "ik niet": { dutch: "Ik niet.", meaningZh: "我不。", meaningEn: "Not me." },
  "hier is": { dutch: "Hier is mijn pas.", meaningZh: "这是我的证件。", meaningEn: "Here is my pass." },
  "daar is": { dutch: "Daar is de balie.", meaningZh: "柜台在那里。", meaningEn: "The counter is there." },
  "kom hier": { dutch: "Kom hier.", meaningZh: "过来。", meaningEn: "Come here." },
  "ga weg": { dutch: "Ga weg.", meaningZh: "走开。", meaningEn: "Go away." },
  "wacht even": { dutch: "Wacht even.", meaningZh: "等一下。", meaningEn: "Wait a moment." },
  "kijk hier": { dutch: "Kijk hier.", meaningZh: "看这里。", meaningEn: "Look here." },
  "zeg maar": { dutch: "Zeg maar wat u wilt.", meaningZh: "您可以说您想要什么。", meaningEn: "Just say what you want." },
  gemeente: { dutch: "Ik moet naar de gemeente.", meaningZh: "我必须去市政厅。", meaningEn: "I have to go to the municipality." },
  vandaag: { dutch: "Ik kom vandaag.", meaningZh: "我今天来。", meaningEn: "I am coming today." },
  morgen: { dutch: "Ik kom morgen.", meaningZh: "我明天来。", meaningEn: "I am coming tomorrow." },
  gisteren: { dutch: "Ik was gisteren thuis.", meaningZh: "我昨天在家。", meaningEn: "I was at home yesterday." },
  straks: { dutch: "Ik kom straks.", meaningZh: "我一会儿来。", meaningEn: "I will come soon." },
  meteen: { dutch: "Ik kom meteen.", meaningZh: "我马上来。", meaningEn: "I will come immediately." },
  daarna: { dutch: "Daarna ga ik naar huis.", meaningZh: "之后我回家。", meaningEn: "After that I go home." },
  eerst: { dutch: "Eerst betaal ik.", meaningZh: "我先付款。", meaningEn: "First I pay." },
  laatst: { dutch: "Ik was laatst ziek.", meaningZh: "我最近生病了。", meaningEn: "I was sick recently." },
  hier: { dutch: "Hier is mijn pas.", meaningZh: "这是我的证件。", meaningEn: "Here is my pass." },
  daar: { dutch: "Daar is de balie.", meaningZh: "柜台在那里。", meaningEn: "The counter is there." },
  samen: { dutch: "We lossen het samen op.", meaningZh: "我们一起解决这件事。", meaningEn: "We solve it together." },
  alleen: { dutch: "Ik kom alleen.", meaningZh: "我一个人来。", meaningEn: "I am coming alone." },
  graag: { dutch: "Ik wil graag een afspraak maken.", meaningZh: "我想预约。", meaningEn: "I would like to make an appointment." },
  altijd: { dutch: "Ik neem altijd mijn pas mee.", meaningZh: "我总是带上证件。", meaningEn: "I always take my pass with me." },
  vaak: { dutch: "Ik fiets vaak naar school.", meaningZh: "我经常骑车去学校。", meaningEn: "I often cycle to school." },
  soms: { dutch: "Soms werk ik thuis.", meaningZh: "有时候我在家工作。", meaningEn: "Sometimes I work at home." },
  nooit: { dutch: "Ik kom nooit te laat.", meaningZh: "我从不迟到。", meaningEn: "I am never late." },
  thuis: { dutch: "Ik ben thuis.", meaningZh: "我在家。", meaningEn: "I am at home." },
  pinnen: { dutch: "Kan ik hier pinnen?", meaningZh: "我可以在这里刷卡吗？", meaningEn: "Can I pay by card here?" },
  oefenen: { dutch: "Ik oefen Nederlands.", meaningZh: "我练习荷兰语。", meaningEn: "I practise Dutch." },
  eindigen: { dutch: "De les eindigt om drie uur.", meaningZh: "课三点结束。", meaningEn: "The lesson ends at three." },
  spelen: { dutch: "Het kind speelt.", meaningZh: "孩子在玩。", meaningEn: "The child is playing." },
  weten: { dutch: "Ik weet het.", meaningZh: "我知道。", meaningEn: "I know." },
  denken: { dutch: "Ik denk aan morgen.", meaningZh: "我在想明天。", meaningEn: "I am thinking about tomorrow." },
  vertellen: { dutch: "Ik vertel mijn naam.", meaningZh: "我说出我的名字。", meaningEn: "I tell my name." },
  vinden: { dutch: "Ik vind het goed.", meaningZh: "我觉得可以。", meaningEn: "I think it is good." },
  meenemen: { dutch: "Ik neem mijn tas mee.", meaningZh: "我带上我的包。", meaningEn: "I take my bag with me." },
  boodschappen: { dutch: "Ik doe boodschappen.", meaningZh: "我买日用品/采购。", meaningEn: "I do groceries." },
  samenwerken: { dutch: "Wij werken samen aan de opdracht.", meaningZh: "我们一起合作完成这项任务。", meaningEn: "We work together on the assignment." },
  inwerken: { dutch: "Ik werk een nieuwe collega in.", meaningZh: "我培训一位新同事熟悉工作。", meaningEn: "I onboard a new colleague." },
  wachtkamer: { dutch: "Ik wacht in de wachtkamer.", meaningZh: "我在候诊室等待。", meaningEn: "I wait in the waiting room." },
  huiskamer: { dutch: "Ik zit in de huiskamer.", meaningZh: "我坐在客厅里。", meaningEn: "I sit in the living room." },
  verhuisdatum: { dutch: "Wat is uw verhuisdatum?", meaningZh: "您的搬家日期是什么时候？", meaningEn: "What is your moving date?" },
  stoel: { dutch: "Ik zit op de stoel.", meaningZh: "我坐在椅子上。", meaningEn: "I sit on the chair." },
  tafel: { dutch: "Mijn boek ligt op de tafel.", meaningZh: "我的书在桌上。", meaningEn: "My book is on the table." },
  boom: { dutch: "Ik sta onder de boom.", meaningZh: "我站在树下。", meaningEn: "I stand under the tree." },
  meisje: { dutch: "Het meisje speelt in de tuin.", meaningZh: "女孩在花园里玩。", meaningEn: "The girl plays in the garden." },
  naamkaartje: { dutch: "Ik draag een naamkaartje.", meaningZh: "我戴着名牌。", meaningEn: "I wear a name tag." },
  ontbreken: { dutch: "Er ontbreekt een document.", meaningZh: "缺少一份文件。", meaningEn: "A document is missing." },
  handleiding: { dutch: "Ik lees de handleiding.", meaningZh: "我读说明书。", meaningEn: "I read the manual." },
  familie: { dutch: "Mijn familie woont hier.", meaningZh: "我的家人住在这里。", meaningEn: "My family lives here." },
  moeder: { dutch: "Mijn moeder woont dichtbij.", meaningZh: "我妈妈住得很近。", meaningEn: "My mother lives nearby." },
  vader: { dutch: "Mijn vader werkt vandaag.", meaningZh: "我爸爸今天工作。", meaningEn: "My father works today." },
  broer: { dutch: "Mijn broer komt morgen.", meaningZh: "我兄弟明天来。", meaningEn: "My brother comes tomorrow." },
  zus: { dutch: "Mijn zus is thuis.", meaningZh: "我姐妹在家。", meaningEn: "My sister is at home." },
  zoon: { dutch: "Mijn zoon gaat naar school.", meaningZh: "我儿子去上学。", meaningEn: "My son goes to school." },
  dochter: { dutch: "Mijn dochter komt straks.", meaningZh: "我女儿一会儿来。", meaningEn: "My daughter comes soon." },
  ouders: { dutch: "Mijn ouders wonen in China.", meaningZh: "我父母住在中国。", meaningEn: "My parents live in China." },
  vriend: { dutch: "Een vriend van mij komt op bezoek.", meaningZh: "我的一个朋友来拜访。", meaningEn: "A friend of mine comes to visit." },
  vriendin: { dutch: "Een vriendin van mij belt mij.", meaningZh: "我的一个女性朋友给我打电话。", meaningEn: "A female friend of mine calls me." },
  opa: { dutch: "Mijn opa woont dichtbij.", meaningZh: "我爷爷/外公住得很近。", meaningEn: "My grandfather lives nearby." },
  oma: { dutch: "Mijn oma belt vanavond.", meaningZh: "我奶奶/外婆今晚打电话。", meaningEn: "My grandmother calls tonight." },
  partner: { dutch: "Mijn partner woont hier.", meaningZh: "我伴侣住在这里。", meaningEn: "My partner lives here." },
  dokter: { dutch: "Ik ga naar de dokter.", meaningZh: "我去看医生。", meaningEn: "I go to the doctor." },
  rust: { dutch: "Ik neem even rust.", meaningZh: "我休息一下。", meaningEn: "I take a short rest." },
  supermarkt: { dutch: "Ik ga naar de supermarkt.", meaningZh: "我去超市。", meaningEn: "I go to the supermarket." },
  prijs: { dutch: "Wat is de prijs?", meaningZh: "价格是多少？", meaningEn: "What is the price?" },
  huurprijs: { dutch: "De huurprijs is hoog.", meaningZh: "租金很高。", meaningEn: "The rent price is high." },
  euro: { dutch: "Dat kost één euro.", meaningZh: "那个一欧元。", meaningEn: "That costs one euro." },
  kilo: { dutch: "Ik koop een kilo kaas.", meaningZh: "我买一公斤奶酪。", meaningEn: "I buy one kilo of cheese." },
  gram: { dutch: "Dat is 500 gram.", meaningZh: "那是 500 克。", meaningEn: "That is 500 grams." },
  medicijn: { dutch: "Ik neem mijn medicijn.", meaningZh: "我服用我的药。", meaningEn: "I take my medicine." },
  haar: { dutch: "Mijn haar is nat.", meaningZh: "我的头发湿了。", meaningEn: "My hair is wet." },
  prijskaartje: { dutch: "Op het prijskaartje staat de prijs.", meaningZh: "价签上写着价格。", meaningEn: "The price is on the price tag." },
  regen: { dutch: "Ik loop door de regen.", meaningZh: "我在雨中走。", meaningEn: "I walk through the rain." },
  wind: { dutch: "Er is veel wind.", meaningZh: "风很大。", meaningEn: "There is a lot of wind." },
  collega: { dutch: "Mijn collega helpt mij.", meaningZh: "我的同事帮我。", meaningEn: "My colleague helps me." },
  garantiebewijs: { dutch: "Ik bewaar het garantiebewijs.", meaningZh: "我保存保修凭证。", meaningEn: "I keep the warranty proof." },
  stad: { dutch: "Ik woon in de stad.", meaningZh: "我住在城市里。", meaningEn: "I live in the city." },
  taal: { dutch: "Ik leer de taal.", meaningZh: "我学习这门语言。", meaningEn: "I learn the language." },
  tas: { dutch: "Ik pak mijn tas.", meaningZh: "我拿起我的包。", meaningEn: "I grab my bag." },
  halen: { dutch: "Ik haal brood.", meaningZh: "我去拿/买面包。", meaningEn: "I get bread." },
  week: { dutch: "Deze week heb ik tijd.", meaningZh: "这周我有时间。", meaningEn: "I have time this week." },
  maand: { dutch: "Deze maand betaal ik de huur.", meaningZh: "这个月我付房租。", meaningEn: "This month I pay the rent." },
  jaar: { dutch: "Dit jaar leer ik Nederlands.", meaningZh: "今年我学荷兰语。", meaningEn: "This year I learn Dutch." },
  maandag: { dutch: "Op maandag werk ik.", meaningZh: "周一我工作。", meaningEn: "On Monday I work." },
  dinsdag: { dutch: "Op dinsdag heb ik les.", meaningZh: "周二我有课。", meaningEn: "On Tuesday I have class." },
  woensdag: { dutch: "Op woensdag ben ik vrij.", meaningZh: "周三我有空。", meaningEn: "On Wednesday I am free." },
  donderdag: { dutch: "Op donderdag heb ik een afspraak.", meaningZh: "周四我有预约。", meaningEn: "On Thursday I have an appointment." },
  vrijdag: { dutch: "Op vrijdag betaal ik de rekening.", meaningZh: "周五我付账单。", meaningEn: "On Friday I pay the bill." },
  zaterdag: { dutch: "Op zaterdag doe ik boodschappen.", meaningZh: "周六我买日用品。", meaningEn: "On Saturday I do groceries." },
  zondag: { dutch: "Op zondag ben ik thuis.", meaningZh: "周日我在家。", meaningEn: "On Sunday I am at home." },
  januari: { dutch: "In januari begint het jaar.", meaningZh: "一月是一年的开始。", meaningEn: "The year starts in January." },
  februari: { dutch: "In februari is de maand kort.", meaningZh: "二月这个月很短。", meaningEn: "In February the month is short." },
  maart: { dutch: "In maart maak ik een afspraak.", meaningZh: "三月我预约。", meaningEn: "In March I make an appointment." },
  april: { dutch: "In april betaal ik de huur.", meaningZh: "四月我付房租。", meaningEn: "In April I pay the rent." },
  mei: { dutch: "In mei heb ik vakantie.", meaningZh: "五月我有假期。", meaningEn: "In May I have a holiday." },
  juni: { dutch: "In juni heb ik een gesprek.", meaningZh: "六月我有一次谈话/面谈。", meaningEn: "In June I have an interview/conversation." },
  juli: { dutch: "In juli reis ik.", meaningZh: "七月我旅行。", meaningEn: "In July I travel." },
  augustus: { dutch: "In augustus ben ik vrij.", meaningZh: "八月我有空。", meaningEn: "In August I am free." },
  september: { dutch: "In september begint de cursus.", meaningZh: "九月课程开始。", meaningEn: "The course starts in September." },
  oktober: { dutch: "In oktober controleer ik mijn verzekering.", meaningZh: "十月我检查我的保险。", meaningEn: "In October I check my insurance." },
  november: { dutch: "In november krijg ik een brief.", meaningZh: "十一月我收到一封信。", meaningEn: "In November I get a letter." },
  december: { dutch: "In december sluit ik het jaar af.", meaningZh: "十二月我结束这一年。", meaningEn: "In December I close the year." },
  "elke week": { dutch: "Ik oefen elke week.", meaningZh: "我每周练习。", meaningEn: "I practise every week." },
  "per maand": { dutch: "Ik betaal per maand.", meaningZh: "我按月付款。", meaningEn: "I pay per month." },
  ochtend: { dutch: "Ik werk in de ochtend.", meaningZh: "我上午工作。", meaningEn: "I work in the morning." },
  namiddag: { dutch: "Ik kom in de namiddag.", meaningZh: "我下午晚些时候来。", meaningEn: "I come in the late afternoon." },
  nacht: { dutch: "Ik slaap in de nacht.", meaningZh: "我夜里睡觉。", meaningEn: "I sleep at night." },
  middernacht: { dutch: "Ik slaap om middernacht.", meaningZh: "我午夜时在睡觉。", meaningEn: "I sleep at midnight." },
  middagpauze: { dutch: "Ik heb middagpauze.", meaningZh: "我有午休。", meaningEn: "I have a lunch break." },
  werkdag: { dutch: "Vandaag is een werkdag.", meaningZh: "今天是工作日。", meaningEn: "Today is a workday." },
  feestdag: { dutch: "Vandaag is een feestdag.", meaningZh: "今天是节日/假日。", meaningEn: "Today is a holiday." },
  verjaardag: { dutch: "Vandaag is mijn verjaardag.", meaningZh: "今天是我的生日。", meaningEn: "Today is my birthday." },
  ben: { dutch: "Ik ben Lin.", meaningZh: "我是 Lin。", meaningEn: "I am Lin." },
  bent: { dutch: "Jij bent student.", meaningZh: "你是学生。", meaningEn: "You are a student." },
  is: { dutch: "Dit is mijn boek.", meaningZh: "这是我的书。", meaningEn: "This is my book." },
  zijn: { dutch: "Hij zoekt zijn fiets.", meaningZh: "他在找他的自行车。", meaningEn: "He is looking for his bike." },
  heb: { dutch: "Ik heb tijd.", meaningZh: "我有时间。", meaningEn: "I have time." },
  hebt: { dutch: "Jij hebt tijd.", meaningZh: "你有时间。", meaningEn: "You have time." },
  heeft: { dutch: "Zij heeft een afspraak.", meaningZh: "她有一个预约。", meaningEn: "She has an appointment." },
  hebben: { dutch: "Wij hebben les.", meaningZh: "我们有课。", meaningEn: "We have class." },
  kan: { dutch: "Ik kan helpen.", meaningZh: "我可以帮忙。", meaningEn: "I can help." },
  kunt: { dutch: "U kunt hier wachten.", meaningZh: "您可以在这里等。", meaningEn: "You can wait here." },
  kunnen: { dutch: "Wij kunnen komen.", meaningZh: "我们可以来。", meaningEn: "We can come." },
  wil: { dutch: "Ik wil koffie.", meaningZh: "我想要咖啡。", meaningEn: "I want coffee." },
  wilt: { dutch: "Jij wilt water.", meaningZh: "你想要水。", meaningEn: "You want water." },
  willen: { dutch: "Wij willen betalen.", meaningZh: "我们想付款。", meaningEn: "We want to pay." },
  moet: { dutch: "Ik moet naar de gemeente.", meaningZh: "我必须去市政厅。", meaningEn: "I have to go to the municipality." },
  moeten: { dutch: "Wij moeten wachten.", meaningZh: "我们必须等。", meaningEn: "We have to wait." },
  ga: { dutch: "Ik ga naar huis.", meaningZh: "我回家。", meaningEn: "I go home." },
  gaat: { dutch: "Hij gaat naar school.", meaningZh: "他去学校。", meaningEn: "He goes to school." },
  gaan: { dutch: "Wij gaan samen.", meaningZh: "我们一起去。", meaningEn: "We go together." },
  kalender: { dutch: "De afspraak staat in de kalender.", meaningZh: "预约在日历里。", meaningEn: "The appointment is in the calendar." },
  kapper: { dutch: "Ik ga naar de kapper.", meaningZh: "我去理发店/找理发师。", meaningEn: "I go to the hairdresser." },
  bakker: { dutch: "Ik koop brood bij de bakker.", meaningZh: "我在面包店买面包。", meaningEn: "I buy bread at the bakery." },
  slager: { dutch: "Ik koop vlees bij de slager.", meaningZh: "我在肉店买肉。", meaningEn: "I buy meat at the butcher's." },
  kantoor: { dutch: "Ik werk op kantoor.", meaningZh: "我在办公室工作。", meaningEn: "I work at the office." },
  formulier: { dutch: "Ik vul het formulier in.", meaningZh: "我填写表格。", meaningEn: "I fill in the form." },
  afspraak: { dutch: "Ik maak een afspraak.", meaningZh: "我预约。", meaningEn: "I make an appointment." },
  rekening: { dutch: "Ik betaal de rekening.", meaningZh: "我付账单。", meaningEn: "I pay the bill." },
  dekking: { dutch: "Ik controleer de dekking.", meaningZh: "我查看保障范围。", meaningEn: "I check the coverage." },
  gezondheid: { dutch: "Mijn gezondheid is belangrijk.", meaningZh: "我的健康很重要。", meaningEn: "My health is important." },
  controleren: { dutch: "Kun je het adres controleren?", meaningZh: "你能检查一下地址吗？", meaningEn: "Can you check the address?" },
  betalingsbewijs: { dutch: "Ik stuur het betalingsbewijs.", meaningZh: "我发送付款证明。", meaningEn: "I send the proof of payment." },
  ontbijt: { dutch: "Ik eet ontbijt om acht uur.", meaningZh: "我八点吃早餐。", meaningEn: "I eat breakfast at eight o'clock." },
  heet: { dutch: "Ik heet Anna.", meaningZh: "我叫 Anna。", meaningEn: "My name is Anna." },
  begrijp: { dutch: "Ik begrijp de vraag.", meaningZh: "我理解这个问题。", meaningEn: "I understand the question." },
  schrijf: { dutch: "Ik schrijf mijn naam.", meaningZh: "我写我的名字。", meaningEn: "I write my name." },
  lees: { dutch: "Ik lees de zin.", meaningZh: "我读这个句子。", meaningEn: "I read the sentence." },
  begin: { dutch: "Ik begin nu.", meaningZh: "我现在开始。", meaningEn: "I start now." },
  wacht: { dutch: "Ik wacht tien minuten.", meaningZh: "我等十分钟。", meaningEn: "I wait ten minutes." },
  neem: { dutch: "Ik neem mijn tas mee.", meaningZh: "我带上我的包。", meaningEn: "I take my bag with me." },
  geef: { dutch: "Ik geef antwoord.", meaningZh: "我回答。", meaningEn: "I give an answer." },
  loop: { dutch: "Ik loop naar huis.", meaningZh: "我走路回家。", meaningEn: "I walk home." },
  slaap: { dutch: "Ik slaap goed.", meaningZh: "我睡得好。", meaningEn: "I sleep well." },
  bel: { dutch: "Ik bel de huisarts.", meaningZh: "我给家庭医生打电话。", meaningEn: "I call the GP." },
  oorzaak: { dutch: "Ik zoek de oorzaak.", meaningZh: "我找原因。", meaningEn: "I look for the cause." },
  gevolg: { dutch: "Dat heeft een gevolg.", meaningZh: "那会有后果。", meaningEn: "That has a consequence." },
  hij: { dutch: "Hij woont hier.", meaningZh: "他住在这里。", meaningEn: "He lives here." },
  zij: { dutch: "Zij woont hier.", meaningZh: "她住在这里。", meaningEn: "She lives here." },
  ze: { dutch: "Ze zijn thuis.", meaningZh: "他们/她们在家。", meaningEn: "They are at home." },
  je: { dutch: "Je fiets staat hier.", meaningZh: "你的自行车在这里。", meaningEn: "Your bike is here." },
  u: { dutch: "Kunt u mij helpen?", meaningZh: "您能帮我吗？", meaningEn: "Can you help me?" },
  ons: { dutch: "Ons huis is dichtbij.", meaningZh: "我们的房子很近。", meaningEn: "Our house is nearby." },
  er: { dutch: "Er is een probleem.", meaningZh: "有一个问题。", meaningEn: "There is a problem." },
  wij: { dutch: "Wij wonen in Nederland.", meaningZh: "我们住在荷兰。", meaningEn: "We live in the Netherlands." },
  we: { dutch: "We gaan morgen.", meaningZh: "我们明天去。", meaningEn: "We are going tomorrow." },
  jullie: { dutch: "Jullie zijn op tijd.", meaningZh: "你们准时到了。", meaningEn: "You all are on time." },
  maar: { dutch: "Ik wil koffie, maar ik heb geen tijd.", meaningZh: "我想喝咖啡，但是我没有时间。", meaningEn: "I want coffee, but I do not have time." },
  ook: { dutch: "Ik wil ook koffie.", meaningZh: "我也想要咖啡。", meaningEn: "I also want coffee." },
  nog: { dutch: "Kunt u dat nog een keer zeggen?", meaningZh: "您可以再说一遍吗？", meaningEn: "Can you say that one more time?" },
  al: { dutch: "Ik ben al thuis.", meaningZh: "我已经在家了。", meaningEn: "I am already home." },
  want: { dutch: "Ik blijf thuis, want ik ben ziek.", meaningZh: "我待在家，因为我生病了。", meaningEn: "I stay home because I am sick." },
  omdat: { dutch: "Ik blijf thuis omdat ik ziek ben.", meaningZh: "我待在家，因为我生病了。", meaningEn: "I stay home because I am sick." },
  niet: { dutch: "Ik begrijp het niet.", meaningZh: "我不明白。", meaningEn: "I do not understand it." },
  geen: { dutch: "Ik heb geen tijd.", meaningZh: "我没有时间。", meaningEn: "I have no time." },
  wel: { dutch: "Ik kom wel.", meaningZh: "我会来的。", meaningEn: "I will come after all." },
  en: { dutch: "Ik drink koffie en thee.", meaningZh: "我喝咖啡和茶。", meaningEn: "I drink coffee and tea." },
  of: { dutch: "Wilt u koffie of thee?", meaningZh: "您要咖啡还是茶？", meaningEn: "Would you like coffee or tea?" },
  de: { dutch: "De bus komt.", meaningZh: "公交来了。", meaningEn: "The bus is coming." },
  het: { dutch: "Ik begrijp het niet.", meaningZh: "我不明白这件事。", meaningEn: "I do not understand it." },
  een: { dutch: "Ik heb een vraag.", meaningZh: "我有一个问题。", meaningEn: "I have a question." },
  dit: { dutch: "Dit is mijn adres.", meaningZh: "这是我的地址。", meaningEn: "This is my address." },
  dat: { dutch: "Dat is goed.", meaningZh: "那可以。", meaningEn: "That is fine." },
  om: { dutch: "Ik kom om tien uur.", meaningZh: "我十点来。", meaningEn: "I come at ten o'clock." },
  in: { dutch: "Ik woon in Nederland.", meaningZh: "我住在荷兰。", meaningEn: "I live in the Netherlands." },
  uit: { dutch: "Ik stap hier uit.", meaningZh: "我在这里下车。", meaningEn: "I get off here." },
  op: { dutch: "Het boek ligt op tafel.", meaningZh: "书在桌上。", meaningEn: "The book is on the table." },
  naar: { dutch: "Ik ga naar huis.", meaningZh: "我回家。", meaningEn: "I go home." },
  bij: { dutch: "Ik ben bij de huisarts.", meaningZh: "我在家庭医生那里。", meaningEn: "I am at the GP's." },
  met: { dutch: "Ik ga met de fiets.", meaningZh: "我骑自行车去。", meaningEn: "I go by bike." },
  voor: { dutch: "Dit is voor u.", meaningZh: "这是给您的。", meaningEn: "This is for you." },
  waar: { dutch: "Waar woont u?", meaningZh: "您住在哪里？", meaningEn: "Where do you live?" },
  wanneer: { dutch: "Wanneer komt u?", meaningZh: "您什么时候来？", meaningEn: "When are you coming?" },
  wie: { dutch: "Wie bent u?", meaningZh: "您是谁？", meaningEn: "Who are you?" },
  wat: { dutch: "Wat bedoelt u?", meaningZh: "您是什么意思？", meaningEn: "What do you mean?" },
  hoe: { dutch: "Hoe gaat het?", meaningZh: "你好吗？", meaningEn: "How are you?" },
  welk: { dutch: "Welk nummer heeft u?", meaningZh: "您有什么号码？", meaningEn: "Which number do you have?" },
  welke: { dutch: "Welke dag past het best?", meaningZh: "哪一天最合适？", meaningEn: "Which day works best?" },
  zorgkaart: { dutch: "Ik heb mijn zorgkaart nodig.", meaningZh: "我需要我的医保卡。", meaningEn: "I need my healthcare card." },
  kwijt: { dutch: "Ik ben mijn pas kwijt.", meaningZh: "我把证件弄丢了。", meaningEn: "I have lost my pass." },
  gevonden: { dutch: "Ik heb mijn tas gevonden.", meaningZh: "我找到我的包了。", meaningEn: "I have found my bag." },
  opslaan: { dutch: "Ik sla het document op.", meaningZh: "我保存文件。", meaningEn: "I save the document." },
  optioneel: { dutch: "Dit is optioneel.", meaningZh: "这是可选的。", meaningEn: "This is optional." },
  klachten: { dutch: "Ik heb lichamelijke klachten.", meaningZh: "我有身体不适。", meaningEn: "I have physical complaints." },
  antibiotica: { dutch: "Ik gebruik antibiotica.", meaningZh: "我在用抗生素。", meaningEn: "I use antibiotics." },
  receptplichtig: { dutch: "Dit medicijn is receptplichtig.", meaningZh: "这个药需要处方。", meaningEn: "This medicine requires a prescription." },
  gemeubileerd: { dutch: "De woning is gemeubileerd.", meaningZh: "这套住房带家具。", meaningEn: "The home is furnished." },
  ongemeubileerd: { dutch: "De woning is ongemeubileerd.", meaningZh: "这套住房不带家具。", meaningEn: "The home is unfurnished." },
  gas: { dutch: "Ik betaal voor gas.", meaningZh: "我支付燃气费。", meaningEn: "I pay for gas." },
  waterleiding: { dutch: "De waterleiding lekt.", meaningZh: "水管漏水。", meaningEn: "The water pipe is leaking." },
  wifi: { dutch: "De wifi werkt niet.", meaningZh: "无线网不能用。", meaningEn: "The wifi is not working." },
  schade: { dutch: "Ik heb schade aan mijn fiets.", meaningZh: "我的自行车有损坏。", meaningEn: "I have damage to my bike." },
  vocht: { dutch: "Er is vocht in huis.", meaningZh: "家里有潮湿。", meaningEn: "There is damp in the house." },
  schoonmaak: { dutch: "Ik doe de schoonmaak.", meaningZh: "我做清洁。", meaningEn: "I do the cleaning." },
  polisnummer: { dutch: "Wat is mijn polisnummer?", meaningZh: "我的保单号是什么？", meaningEn: "What is my policy number?" },
  nota: { dutch: "Ik betaal de nota.", meaningZh: "我支付账单。", meaningEn: "I pay the invoice." },
  jaarlijks: { dutch: "Ik betaal jaarlijks.", meaningZh: "我按年付款。", meaningEn: "I pay yearly." },
  maandelijks: { dutch: "Ik betaal maandelijks.", meaningZh: "我按月付款。", meaningEn: "I pay monthly." },
  geachte: { dutch: "Geachte heer of mevrouw,", meaningZh: "尊敬的先生或女士：", meaningEn: "Dear Sir or Madam," },
  beste: { dutch: "Beste Anna,", meaningZh: "亲爱的 Anna：", meaningEn: "Dear Anna," },
  verzonden: { dutch: "Ik heb de e-mail verzonden.", meaningZh: "我已经发送了邮件。", meaningEn: "I have sent the email." },
  geschikt: { dutch: "Dat is geschikt.", meaningZh: "那是合适的。", meaningEn: "That is suitable." },
  ongeschikt: { dutch: "Dat is ongeschikt.", meaningZh: "那是不合适的。", meaningEn: "That is unsuitable." },
  excuses: { dutch: "Mijn excuses.", meaningZh: "抱歉。", meaningEn: "My apologies." },
  reactietermijn: { dutch: "De reactietermijn is twee weken.", meaningZh: "回复期限是两周。", meaningEn: "The response period is two weeks." },
  gezinsleden: { dutch: "Hoeveel gezinsleden heeft u?", meaningZh: "您有几位家庭成员？", meaningEn: "How many household members do you have?" },
  toeslagen: { dutch: "Ik vraag toeslagen aan.", meaningZh: "我申请补贴。", meaningEn: "I apply for allowances." },
  openingstijden: { dutch: "Wat zijn de openingstijden?", meaningZh: "营业时间是什么？", meaningEn: "What are the opening hours?" },
  tijdens: { dutch: "Ik bel tijdens de pauze.", meaningZh: "我在休息时打电话。", meaningEn: "I call during the break." },
  storing: { dutch: "Er is een storing.", meaningZh: "出现故障了。", meaningEn: "There is a malfunction." },
  terugbetaling: { dutch: "Ik vraag een terugbetaling aan.", meaningZh: "我申请退款。", meaningEn: "I request a refund." },
  datum: { dutch: "Ik kies een datum.", meaningZh: "我选择一个日期。", meaningEn: "I choose a date." },
  situatie: { dutch: "De situatie is duidelijk.", meaningZh: "情况很清楚。", meaningEn: "The situation is clear." },
  fout: { dutch: "Er staat een fout in het formulier.", meaningZh: "表格里有一个错误。", meaningEn: "There is an error in the form." },
  zorgverzekeraar: { dutch: "Ik bel mijn zorgverzekeraar.", meaningZh: "我给我的医保公司打电话。", meaningEn: "I call my health insurer." },
  reparatieverzoek: { dutch: "Ik stuur een reparatieverzoek.", meaningZh: "我发送维修申请。", meaningEn: "I send a repair request." },
  geboren: { dutch: "Ik ben in 1990 geboren.", meaningZh: "我出生于 1990 年。", meaningEn: "I was born in 1990." },
  pleister: { dutch: "Ik plak een pleister.", meaningZh: "我贴一片创可贴。", meaningEn: "I put on a plaster." },
  verband: { dutch: "Ik doe verband om mijn arm.", meaningZh: "我给手臂缠绷带。", meaningEn: "I put a bandage around my arm." },
  druppel: { dutch: "Ik gebruik één druppel.", meaningZh: "我用一滴。", meaningEn: "I use one drop." },
  "pijn doen": { dutch: "Mijn arm doet pijn.", meaningZh: "我的手臂疼。", meaningEn: "My arm hurts." },
  snijden: { dutch: "Ik snijd brood.", meaningZh: "我切面包。", meaningEn: "I cut bread." },
  "elke dag": { dutch: "Ik oefen elke dag.", meaningZh: "我每天练习。", meaningEn: "I practise every day." },
  "boek lezen": { dutch: "Ik wil een boek lezen.", meaningZh: "我想读一本书。", meaningEn: "I want to read a book." },
  uitgaan: { dutch: "Ik ga vanavond uit.", meaningZh: "我今晚出去玩。", meaningEn: "I am going out tonight." },
  volgende: { dutch: "De volgende afspraak is morgen.", meaningZh: "下一个预约是明天。", meaningEn: "The next appointment is tomorrow." },
  vorige: { dutch: "De vorige afspraak was gisteren.", meaningZh: "上一个预约是昨天。", meaningEn: "The previous appointment was yesterday." },
  wolken: { dutch: "Er zijn wolken.", meaningZh: "有云。", meaningEn: "There are clouds." },
  halve: { dutch: "Ik wil een halve liter.", meaningZh: "我想要半升。", meaningEn: "I want half a litre." },
  heel: { dutch: "Ik wil een heel brood.", meaningZh: "我想要一整个面包。", meaningEn: "I want a whole loaf of bread." },
  dubbel: { dutch: "Ik betaal dubbel.", meaningZh: "我付双倍。", meaningEn: "I pay double." },
  eerste: { dutch: "Ik ben eerste.", meaningZh: "我是第一名。", meaningEn: "I am first." },
  tweede: { dutch: "Ik ben tweede.", meaningZh: "我是第二名。", meaningEn: "I am second." },
  derde: { dutch: "Ik ben derde.", meaningZh: "我是第三名。", meaningEn: "I am third." },
  laatste: { dutch: "Dit is de laatste bus.", meaningZh: "这是最后一班公交。", meaningEn: "This is the last bus." },
  linksaf: { dutch: "Ga linksaf.", meaningZh: "向左转。", meaningEn: "Turn left." },
  rechtsaf: { dutch: "Ga rechtsaf.", meaningZh: "向右转。", meaningEn: "Turn right." },
  omhoog: { dutch: "Ga omhoog.", meaningZh: "往上走。", meaningEn: "Go up." },
  omlaag: { dutch: "Ga omlaag.", meaningZh: "往下走。", meaningEn: "Go down." },
  vooruit: { dutch: "Ga vooruit.", meaningZh: "往前走。", meaningEn: "Go forward." },
  terug: { dutch: "Ga terug.", meaningZh: "回去。", meaningEn: "Go back." },
  "wachten op": { dutch: "Ik wacht op de bus.", meaningZh: "我在等公交。", meaningEn: "I wait for the bus." },
  "samen oplossen": { dutch: "Ik wil het samen oplossen.", meaningZh: "我想一起解决这件事。", meaningEn: "I want to solve it together." },
  gezellig: { dutch: "Het is gezellig.", meaningZh: "这里很温馨/气氛很好。", meaningEn: "It is cozy and pleasant." },
  normaal: { dutch: "Dat is normaal.", meaningZh: "那很正常。", meaningEn: "That is normal." },
  raar: { dutch: "Dat is raar.", meaningZh: "那很奇怪。", meaningEn: "That is strange." },
  handig: { dutch: "Dat is handig.", meaningZh: "那很方便。", meaningEn: "That is handy." },
  lastig: { dutch: "Dat is lastig.", meaningZh: "那很麻烦/困难。", meaningEn: "That is difficult." },
  onmogelijk: { dutch: "Dat is onmogelijk.", meaningZh: "那不可能。", meaningEn: "That is impossible." },
  voetbal: { dutch: "Ik speel voetbal.", meaningZh: "我踢足球。", meaningEn: "I play football." },
  tennis: { dutch: "Ik speel tennis.", meaningZh: "我打网球。", meaningEn: "I play tennis." },
  televisie: { dutch: "Ik kijk televisie.", meaningZh: "我看电视。", meaningEn: "I watch television." },
  camera: { dutch: "Ik maak een foto met de camera.", meaningZh: "我用相机拍照。", meaningEn: "I take a photo with the camera." },
  doktersverklaring: { dutch: "Ik heb een doktersverklaring nodig.", meaningZh: "我需要医生证明。", meaningEn: "I need a doctor's note." },
  huisartsenpraktijk: { dutch: "Ik bel de huisartsenpraktijk.", meaningZh: "我给家庭医生诊所打电话。", meaningEn: "I call the GP practice." },
  doorgaan: { dutch: "Ik wil doorgaan.", meaningZh: "我想继续。", meaningEn: "I want to continue." },
  digid: { dutch: "Ik log in met DigiD.", meaningZh: "我用 DigiD 登录。", meaningEn: "I log in with DigiD." },
  gegevens: { dutch: "Ik vul mijn gegevens in.", meaningZh: "我填写我的资料。", meaningEn: "I fill in my details." },
  origineel: { dutch: "Ik stuur het originele document.", meaningZh: "我发送原始文件。", meaningEn: "I send the original document." },
  geldig: { dutch: "Mijn pas is geldig.", meaningZh: "我的证件有效。", meaningEn: "My pass is valid." },
  ongeldig: { dutch: "Mijn pas is ongeldig.", meaningZh: "我的证件无效。", meaningEn: "My pass is invalid." },
  verlopen: { dutch: "Mijn pas is verlopen.", meaningZh: "我的证件过期了。", meaningEn: "My pass has expired." },
  basisschool: { dutch: "Mijn kind gaat naar de basisschool.", meaningZh: "我的孩子上小学。", meaningEn: "My child goes to primary school." },
  schoolplein: { dutch: "De kinderen spelen op het schoolplein.", meaningZh: "孩子们在校园操场玩。", meaningEn: "The children play in the schoolyard." },
  schoolvakantie: { dutch: "In de schoolvakantie zijn we thuis.", meaningZh: "学校假期我们在家。", meaningEn: "During the school holiday we are at home." },
  gewerkt: { dutch: "Ik heb vandaag gewerkt.", meaningZh: "我今天工作过了。", meaningEn: "I worked today." },
  gewoond: { dutch: "Ik heb hier gewoond.", meaningZh: "我在这里住过。", meaningEn: "I have lived here." },
  geleerd: { dutch: "Ik heb Nederlands geleerd.", meaningZh: "我学过荷兰语。", meaningEn: "I have learned Dutch." },
  gezocht: { dutch: "Ik heb mijn pas gezocht.", meaningZh: "我找过我的证件。", meaningEn: "I looked for my pass." },
  gekocht: { dutch: "Ik heb brood gekocht.", meaningZh: "我买了面包。", meaningEn: "I bought bread." },
  verkocht: { dutch: "Ik heb mijn fiets verkocht.", meaningZh: "我卖了我的自行车。", meaningEn: "I sold my bike." },
  gebracht: { dutch: "Ik heb mijn kind gebracht.", meaningZh: "我送了我的孩子。", meaningEn: "I brought my child." },
  gehaald: { dutch: "Ik heb mijn kind gehaald.", meaningZh: "我接了我的孩子。", meaningEn: "I picked up my child." },
  gesproken: { dutch: "Ik heb de huisarts gesproken.", meaningZh: "我和家庭医生谈过了。", meaningEn: "I have spoken to the GP." },
  begrepen: { dutch: "Ik heb het begrepen.", meaningZh: "我理解了。", meaningEn: "I understood it." },
  geschreven: { dutch: "Ik heb een e-mail geschreven.", meaningZh: "我写了一封邮件。", meaningEn: "I wrote an email." },
  gelezen: { dutch: "Ik heb de brief gelezen.", meaningZh: "我读了这封信。", meaningEn: "I read the letter." },
  gezien: { dutch: "Ik heb de brief gezien.", meaningZh: "我看到了这封信。", meaningEn: "I saw the letter." },
  gehoord: { dutch: "Ik heb het gehoord.", meaningZh: "我听到了。", meaningEn: "I heard it." },
  geprobeerd: { dutch: "Ik heb het geprobeerd.", meaningZh: "我试过了。", meaningEn: "I tried it." },
  geopend: { dutch: "Ik heb de brief geopend.", meaningZh: "我打开了这封信。", meaningEn: "I opened the letter." },
  gesloten: { dutch: "Ik heb de deur gesloten.", meaningZh: "我关上了门。", meaningEn: "I closed the door." },
  verplaatst: { dutch: "Ik heb de afspraak verplaatst.", meaningZh: "我改了预约时间。", meaningEn: "I moved the appointment." },
  "burgerlijke staat": { dutch: "Wat is uw burgerlijke staat?", meaningZh: "您的婚姻状况是什么？", meaningEn: "What is your marital status?" },
  "volgende week": { dutch: "Ik kom volgende week.", meaningZh: "我下周来。", meaningEn: "I will come next week." },
  "vorige maand": { dutch: "Ik heb vorige maand betaald.", meaningZh: "我上个月付过款。", meaningEn: "I paid last month." },
  burgerzaken: { dutch: "Ik moet naar Burgerzaken.", meaningZh: "我得去市民事务部门。", meaningEn: "I have to go to Civil Affairs." },
  beterschap: { dutch: "Beterschap!", meaningZh: "早日康复！", meaningEn: "Get well soon!" },
  telefonisch: { dutch: "Ik ben telefonisch bereikbaar.", meaningZh: "可以通过电话联系到我。", meaningEn: "I am reachable by phone." },
  "alvast bedankt": { dutch: "Alvast bedankt.", meaningZh: "先谢谢您。", meaningEn: "Thanks in advance." },
  schikt: { dutch: "Schikt deze tijd?", meaningZh: "这个时间方便吗？", meaningEn: "Does this time suit you?" },
  opnieuw: { dutch: "Ik probeer het opnieuw.", meaningZh: "我重新试一次。", meaningEn: "I try it again." },
  "vriendelijke groet": { dutch: "Met vriendelijke groet,", meaningZh: "此致，友好问候。", meaningEn: "Kind regards," },
  "kale huur": { dutch: "De kale huur is exclusief kosten.", meaningZh: "裸租金不含其他费用。", meaningEn: "The basic rent excludes extra costs." },
  "all-in huur": { dutch: "Is dit all-in huur?", meaningZh: "这是全包租金吗？", meaningEn: "Is this all-in rent?" },
  "kraan lekt": { dutch: "De kraan lekt.", meaningZh: "水龙头漏水。", meaningEn: "The tap is leaking." },
  "niet vergoed": { dutch: "Dit wordt niet vergoed.", meaningZh: "这个不报销。", meaningEn: "This is not reimbursed." },
  "eigen bijdrage": { dutch: "Ik betaal een eigen bijdrage.", meaningZh: "我支付自付部分。", meaningEn: "I pay a personal contribution." },
  "halte vervalt": { dutch: "De halte vervalt.", meaningZh: "这个站点取消。", meaningEn: "The stop is cancelled." },
  ogenblik: { dutch: "Een ogenblik alstublieft.", meaningZh: "请稍等。", meaningEn: "One moment please." },
  "in gesprek": { dutch: "De lijn is in gesprek.", meaningZh: "电话占线。", meaningEn: "The line is busy." },
  "slecht bereik": { dutch: "Ik heb slecht bereik.", meaningZh: "我信号不好。", meaningEn: "I have poor reception." },
  "liever niet": { dutch: "Liever niet.", meaningZh: "最好不要。", meaningEn: "Preferably not." },
  "nieuwe datum": { dutch: "Ik wil een nieuwe datum.", meaningZh: "我想要一个新日期。", meaningEn: "I want a new date." },
  "ander tijdstip": { dutch: "Ik wil een ander tijdstip.", meaningZh: "我想要另一个时间。", meaningEn: "I want another time." },
  "op tijd": { dutch: "Ik ben op tijd.", meaningZh: "我准时到。", meaningEn: "I am on time." },
  "betekent dat": { dutch: "Betekent dat dat ik moet betalen?", meaningZh: "这意味着我必须付款吗？", meaningEn: "Does that mean I have to pay?" },
  "in ieder geval": { dutch: "In ieder geval bel ik morgen.", meaningZh: "无论如何，我明天打电话。", meaningEn: "In any case, I will call tomorrow." },
  "verkeerde maat": { dutch: "Dit is de verkeerde maat.", meaningZh: "这个尺码不对。", meaningEn: "This is the wrong size." },
  "contant terug": { dutch: "Krijg ik het contant terug?", meaningZh: "我能拿现金退回吗？", meaningEn: "Do I get it back in cash?" },
  "aan de beurt": { dutch: "U bent aan de beurt.", meaningZh: "轮到您了。", meaningEn: "It is your turn." },
  "afspraak nodig": { dutch: "Heb ik een afspraak nodig?", meaningZh: "我需要预约吗？", meaningEn: "Do I need an appointment?" },
  "eenmaal per dag": { dutch: "Neem dit eenmaal per dag.", meaningZh: "这个每天服用一次。", meaningEn: "Take this once a day." },
  "verkeerd nummer": { dutch: "Sorry, verkeerd nummer.", meaningZh: "抱歉，打错号码了。", meaningEn: "Sorry, wrong number." },
  "daardoor kan ik": { dutch: "Daardoor kan ik niet komen.", meaningZh: "因此我不能来。", meaningEn: "Because of that I cannot come." },
  "beschikbare tijd": { dutch: "Ik geef mijn beschikbare tijd door.", meaningZh: "我告知我的可用时间。", meaningEn: "I pass on my available time." },
  "zo snel mogelijk": { dutch: "Ik bel zo snel mogelijk.", meaningZh: "我会尽快打电话。", meaningEn: "I will call as soon as possible." },
  "maximale grootte": { dutch: "De maximale grootte is 5 MB.", meaningZh: "最大大小是 5 MB。", meaningEn: "The maximum size is 5 MB." },
  "ontvangen bericht": { dutch: "Ik lees het ontvangen bericht.", meaningZh: "我读收到的信息。", meaningEn: "I read the received message." },
  "naar aanleiding van": { dutch: "Ik schrijf naar aanleiding van uw brief.", meaningZh: "我根据您的信来写。", meaningEn: "I write in response to your letter." },
  "openstaande rekening": { dutch: "Ik betaal de openstaande rekening.", meaningZh: "我支付未付账单。", meaningEn: "I pay the outstanding bill." },
  "telefonisch spreekuur": { dutch: "Wanneer is het telefonisch spreekuur?", meaningZh: "电话门诊是什么时候？", meaningEn: "When is the telephone consultation hour?" },
  "aanvullende verzekering": { dutch: "Ik heb een aanvullende verzekering.", meaningZh: "我有补充保险。", meaningEn: "I have supplementary insurance." },
  "verwarming doet het niet": { dutch: "De verwarming doet het niet.", meaningZh: "暖气坏了。", meaningEn: "The heating does not work." },
  "ziekmelden kind": { dutch: "Ik wil mijn kind ziekmelden.", meaningZh: "我想给孩子请病假。", meaningEn: "I want to report my child sick." },
  "middelbare school": { dutch: "Mijn kind gaat naar de middelbare school.", meaningZh: "我的孩子上中学。", meaningEn: "My child goes to secondary school." },
  "bedankt voor uw hulp": { dutch: "Bedankt voor uw hulp.", meaningZh: "谢谢您的帮助。", meaningEn: "Thank you for your help." },
  collegiaal: { dutch: "Mijn collega is collegiaal.", meaningZh: "我的同事很友好合作。", meaningEn: "My colleague is collegial." },
  milieubewust: { dutch: "Ik probeer milieubewust te leven.", meaningZh: "我尽量有环保意识地生活。", meaningEn: "I try to live in an environmentally conscious way." },
  "sociale media": { dutch: "Ik gebruik sociale media.", meaningZh: "我使用社交媒体。", meaningEn: "I use social media." },
  creatief: { dutch: "Mijn idee is creatief.", meaningZh: "我的想法有创意。", meaningEn: "My idea is creative." },
  "kiezen voor": { dutch: "Ik kies voor deze oplossing.", meaningZh: "我选择这个解决办法。", meaningEn: "I choose this solution." },
  "twijfelen over": { dutch: "Ik twijfel over mijn keuze.", meaningZh: "我对自己的选择犹豫。", meaningEn: "I doubt my choice." },
  notulen: { dutch: "Ik lees de notulen.", meaningZh: "我读会议记录。", meaningEn: "I read the minutes." },
  "deelnemen aan": { dutch: "Ik neem deel aan de les.", meaningZh: "我参加这节课。", meaningEn: "I take part in the lesson." },
  "onbekend woord": { dutch: "Dit is een onbekend woord.", meaningZh: "这是一个生词。", meaningEn: "This is an unknown word." },
  "verleden tijd": { dutch: "Dit staat in de verleden tijd.", meaningZh: "这是过去时。", meaningEn: "This is in the past tense." },
  "lokale regel": { dutch: "Ik lees de lokale regel.", meaningZh: "我读本地规则。", meaningEn: "I read the local rule." },
  "informele taal": { dutch: "Gebruik hier informele taal.", meaningZh: "这里使用非正式语言。", meaningEn: "Use informal language here." },
  "beleefde vraag": { dutch: "Ik stel een beleefde vraag.", meaningZh: "我问一个礼貌的问题。", meaningEn: "I ask a polite question." },
  "bedoelde lezer": { dutch: "Wie is de bedoelde lezer?", meaningZh: "目标读者是谁？", meaningEn: "Who is the intended reader?" },
  "vertraging door": { dutch: "Er is vertraging door een storing.", meaningZh: "因为故障而延误。", meaningEn: "There is a delay due to a malfunction." },
  "vergelijken met": { dutch: "Ik vergelijk dit met mijn land.", meaningZh: "我把这和我的国家比较。", meaningEn: "I compare this with my country." },
  "openbare ruimte": { dutch: "Dit is een openbare ruimte.", meaningZh: "这是公共空间。", meaningEn: "This is a public space." },
  "afsluitende zin": { dutch: "Schrijf een afsluitende zin.", meaningZh: "写一个结尾句。", meaningEn: "Write a closing sentence." },
  "ontevreden klant": { dutch: "De klant is ontevreden.", meaningZh: "客户不满意。", meaningEn: "The customer is dissatisfied." },
  "bekend onderwerp": { dutch: "Dit is een bekend onderwerp.", meaningZh: "这是一个熟悉话题。", meaningEn: "This is a familiar topic." },
  "mijn mening geven": { dutch: "Ik wil mijn mening geven.", meaningZh: "我想表达我的意见。", meaningEn: "I want to give my opinion." },
  "aan de beurt zijn": { dutch: "Ik ben aan de beurt.", meaningZh: "轮到我了。", meaningEn: "It is my turn." },
  "nieuw in de buurt": { dutch: "Ik ben nieuw in de buurt.", meaningZh: "我是新搬到这个社区的。", meaningEn: "I am new in the neighborhood." },
  "duidelijke aanhef": { dutch: "De e-mail heeft een duidelijke aanhef.", meaningZh: "这封邮件有清楚的称呼。", meaningEn: "The email has a clear salutation." },
  "vriendelijke toon": { dutch: "Schrijf met een vriendelijke toon.", meaningZh: "用友好语气写。", meaningEn: "Write in a friendly tone." },
  "voltooid deelwoord": { dutch: "Dit is een voltooid deelwoord.", meaningZh: "这是一个过去分词。", meaningEn: "This is a past participle." },
  "nieuwe uitdrukking": { dutch: "Ik leer een nieuwe uitdrukking.", meaningZh: "我学一个新表达。", meaningEn: "I learn a new expression." },
  "favoriete onderwerp": { dutch: "Wat is je favoriete onderwerp?", meaningZh: "你最喜欢的话题是什么？", meaningEn: "What is your favorite topic?" },
  "medische informatie": { dutch: "Ik lees medische informatie.", meaningZh: "我读医疗信息。", meaningEn: "I read medical information." },
  "rekening houden met": { dutch: "Ik houd rekening met de buren.", meaningZh: "我考虑到邻居。", meaningEn: "I take the neighbors into account." },
  "gelijke behandeling": { dutch: "Iedereen krijgt gelijke behandeling.", meaningZh: "每个人都得到平等对待。", meaningEn: "Everyone receives equal treatment." },
  "formeel taalgebruik": { dutch: "Gebruik formeel taalgebruik.", meaningZh: "使用正式语言。", meaningEn: "Use formal language." },
  "voldoende resultaat": { dutch: "Ik heb voldoende resultaat.", meaningZh: "我有合格结果。", meaningEn: "I have a sufficient result." },
  "mogelijke oplossing": { dutch: "Ik stel een mogelijke oplossing voor.", meaningZh: "我提出一个可能的解决办法。", meaningEn: "I suggest a possible solution." },
  "duidelijke afspraak": { dutch: "We maken een duidelijke afspraak.", meaningZh: "我们做一个清楚的约定。", meaningEn: "We make a clear agreement." },
  "gewoonte in nederland": { dutch: "Dit is een gewoonte in Nederland.", meaningZh: "这是荷兰的一个习惯。", meaningEn: "This is a custom in the Netherlands." },
  "doel van de schrijver": { dutch: "Ik zoek het doel van de schrijver.", meaningZh: "我找作者的目的。", meaningEn: "I look for the writer's purpose." },
  "betrouwbare informatie": { dutch: "Ik controleer betrouwbare informatie.", meaningZh: "我核对可靠信息。", meaningEn: "I check reliable information." },
  "reageren op een mening": { dutch: "Ik reageer op een mening.", meaningZh: "我回应一个观点。", meaningEn: "I respond to an opinion." },
  "nederlandse samenleving": { dutch: "Ik leer over de Nederlandse samenleving.", meaningZh: "我学习荷兰社会。", meaningEn: "I learn about Dutch society." },
  "gemeentelijke informatie": { dutch: "Ik lees gemeentelijke informatie.", meaningZh: "我读市政信息。", meaningEn: "I read municipal information." },
  hersenen: { dutch: "De hersenen zijn belangrijk.", meaningZh: "大脑很重要。", meaningEn: "The brain is important." },
  pijnstillers: { dutch: "Ik neem pijnstillers.", meaningZh: "我服用止痛药。", meaningEn: "I take painkillers." },
  "openbaar vervoer": { dutch: "Ik reis met het openbaar vervoer.", meaningZh: "我乘公共交通出行。", meaningEn: "I travel by public transport." },
  "korte tekst": { dutch: "Ik lees een korte tekst.", meaningZh: "我读一篇短文。", meaningEn: "I read a short text." },
  "volgens de brief": { dutch: "Volgens de brief moet ik betalen.", meaningZh: "根据信件，我必须付款。", meaningEn: "According to the letter, I have to pay." },
  "in de tabel staat": { dutch: "In de tabel staat de prijs.", meaningZh: "表格里写着价格。", meaningEn: "The price is in the table." },
  overuren: { dutch: "Ik maak overuren.", meaningZh: "我加班。", meaningEn: "I work overtime." },
  taalschool: { dutch: "Mijn cursus is bij de taalschool.", meaningZh: "我的课程在语言学校。", meaningEn: "My course is at the language school." },
  voorwaarden: { dutch: "Ik lees de voorwaarden.", meaningZh: "我读条件。", meaningEn: "I read the conditions." },
  personeelszaken: { dutch: "Ik bel personeelszaken.", meaningZh: "我给人事部门打电话。", meaningEn: "I call human resources." },
  arbeidsvoorwaarden: { dutch: "Ik lees de arbeidsvoorwaarden.", meaningZh: "我读劳动条件。", meaningEn: "I read the employment conditions." },
  huurvoorwaarden: { dutch: "Ik lees de huurvoorwaarden.", meaningZh: "我读租赁条件。", meaningEn: "I read the rental conditions." },
  contactgegevens: { dutch: "Ik vul mijn contactgegevens in.", meaningZh: "我填写我的联系方式。", meaningEn: "I fill in my contact details." },
  aanmaningskosten: { dutch: "Ik betaal aanmaningskosten.", meaningZh: "我支付催缴费用。", meaningEn: "I pay reminder costs." },
  tandartscontrole: { dutch: "Ik heb een tandartscontrole.", meaningZh: "我有牙医检查。", meaningEn: "I have a dental check-up." },
  "vraag stellen aan de arts": { dutch: "Ik wil een vraag stellen aan de arts.", meaningZh: "我想向医生提问。", meaningEn: "I want to ask the doctor a question." },
  "meedoen in de samenleving": { dutch: "Ik wil meedoen in de samenleving.", meaningZh: "我想参与社会。", meaningEn: "I want to participate in society." },
  "verantwoordelijk zijn voor": { dutch: "Ik ben verantwoordelijk voor mijn werk.", meaningZh: "我对我的工作负责。", meaningEn: "I am responsible for my work." },
  "aantekeningen tijdens de les": { dutch: "Ik maak aantekeningen tijdens de les.", meaningZh: "我在课堂上做笔记。", meaningEn: "I take notes during the lesson." },
  "vast contract": { dutch: "Ik heb een vast contract.", meaningZh: "我有固定合同。", meaningEn: "I have a permanent contract." },
  "online les": { dutch: "Ik volg online les.", meaningZh: "我上线上课。", meaningEn: "I take an online lesson." },
  "kopie paspoort": { dutch: "Ik stuur een kopie van mijn paspoort.", meaningZh: "我发送护照复印件。", meaningEn: "I send a copy of my passport." },
  "doorgeven aan": { dutch: "Ik geef het door aan mijn collega.", meaningZh: "我把它转告给我的同事。", meaningEn: "I pass it on to my colleague." },
  "beschikbaar zijn": { dutch: "Ik ben beschikbaar.", meaningZh: "我有空/可以工作。", meaningEn: "I am available." },
  "adres buitenland": { dutch: "Ik vul mijn adres in het buitenland in.", meaningZh: "我填写我的国外地址。", meaningEn: "I fill in my address abroad." },
  "gevonden voorwerp": { dutch: "Ik meld een gevonden voorwerp.", meaningZh: "我报告一件失物招领物。", meaningEn: "I report a found object." },
  "vertraging vlucht": { dutch: "Mijn vlucht heeft vertraging.", meaningZh: "我的航班延误。", meaningEn: "My flight is delayed." },
  "annulering vlucht": { dutch: "De vlucht is geannuleerd.", meaningZh: "航班取消了。", meaningEn: "The flight is cancelled." },
  "doel van de tekst": { dutch: "Ik zoek het doel van de tekst.", meaningZh: "我找文本目的。", meaningEn: "I look for the purpose of the text." },
  "tijdelijk contract": { dutch: "Ik heb een tijdelijk contract.", meaningZh: "我有临时合同。", meaningEn: "I have a temporary contract." },
  "belangrijkste punt": { dutch: "Ik noteer het belangrijkste punt.", meaningZh: "我记下最重要的一点。", meaningEn: "I note the most important point." },
  "voorlopige aanslag": { dutch: "Ik ontvang een voorlopige aanslag.", meaningZh: "我收到预估税单。", meaningEn: "I receive a provisional assessment." },
  "stopzetten toeslag": { dutch: "Ik wil mijn toeslag stopzetten.", meaningZh: "我想停止我的补贴。", meaningEn: "I want to stop my allowance." },
  "uitnodiging gesprek": { dutch: "Ik heb een uitnodiging voor een gesprek.", meaningZh: "我有一份面试/谈话邀请。", meaningEn: "I have an invitation for an interview." },
  "vervaldatum paspoort": { dutch: "Ik controleer de vervaldatum van mijn paspoort.", meaningZh: "我核对我的护照有效期。", meaningEn: "I check the expiry date of my passport." },
  kaartcontrole: { dutch: "De conducteur doet kaartcontrole.", meaningZh: "列车员查票。", meaningEn: "The conductor checks tickets." },
  fietspad: { dutch: "Ik fiets op het fietspad.", meaningZh: "我在自行车道上骑车。", meaningEn: "I cycle on the bike lane." },
  fietser: { dutch: "De fietser stopt voor het stoplicht.", meaningZh: "骑车人在红绿灯前停下。", meaningEn: "The cyclist stops at the traffic light." },
  kruispunt: { dutch: "Ik steek over bij het kruispunt.", meaningZh: "我在十字路口过马路。", meaningEn: "I cross at the intersection." },
  vrachtwagen: { dutch: "De vrachtwagen rijdt langzaam door de straat.", meaningZh: "卡车慢慢开过街道。", meaningEn: "The truck drives slowly through the street." },
  ongeluk: { dutch: "Er is een ongeluk op de weg.", meaningZh: "路上有一起事故。", meaningEn: "There is an accident on the road." },
  beslistermijn: { dutch: "De beslistermijn is acht weken.", meaningZh: "决定期限是八周。", meaningEn: "The decision period is eight weeks." },
  polisblad: { dutch: "Ik lees het polisblad van mijn verzekering.", meaningZh: "我阅读我的保险保单页。", meaningEn: "I read the policy sheet of my insurance." },
  verzekerde: { dutch: "De verzekerde krijgt een brief van de verzekering.", meaningZh: "被保险人收到保险公司的信。", meaningEn: "The insured person receives a letter from the insurer." },
  zorgverlener: { dutch: "Ik maak een afspraak met een zorgverlener.", meaningZh: "我和一位医疗照护人员预约。", meaningEn: "I make an appointment with a care provider." },
  hersteladvies: { dutch: "Ik volg het hersteladvies van de arts.", meaningZh: "我遵循医生的恢复建议。", meaningEn: "I follow the doctor's recovery advice." },
  maandbedrag: { dutch: "Ik betaal het maandbedrag op tijd.", meaningZh: "我按时支付月金额。", meaningEn: "I pay the monthly amount on time." },
  termijnbedrag: { dutch: "Ik betaal het termijnbedrag elke maand.", meaningZh: "我每月支付分期金额。", meaningEn: "I pay the instalment amount every month." },
  opzegvergoeding: { dutch: "Ik betaal een opzegvergoeding bij vroeg stoppen.", meaningZh: "提前终止时我支付解约费。", meaningEn: "I pay a cancellation fee when stopping early." },
  voorschotbedrag: { dutch: "Het voorschotbedrag staat op de rekening.", meaningZh: "预付款金额写在账单上。", meaningEn: "The advance amount is on the bill." },
  "beschikbaar per direct": { dutch: "Ik ben per direct beschikbaar.", meaningZh: "我可以立即上岗。", meaningEn: "I am available immediately." },
  "langdurig ziek": { dutch: "Ik ben langdurig ziek.", meaningZh: "我长期生病。", meaningEn: "I am ill for a long time." },
  "medisch dossier": { dutch: "Ik wil mijn medisch dossier bekijken.", meaningZh: "我想查看我的医疗档案。", meaningEn: "I want to view my medical file." },
  "ouderlijk gezag": { dutch: "Ik heb ouderlijk gezag.", meaningZh: "我有父母监护权。", meaningEn: "I have parental authority." },
  "huishoudelijke hulp": { dutch: "Ik krijg huishoudelijke hulp.", meaningZh: "我得到家务帮助。", meaningEn: "I receive household help." },
  "inschrijven praktijk": { dutch: "Ik wil me inschrijven bij de praktijk.", meaningZh: "我想在诊所注册。", meaningEn: "I want to register with the practice." },
  "uitschrijven praktijk": { dutch: "Ik wil me uitschrijven bij de praktijk.", meaningZh: "我想退出诊所注册。", meaningEn: "I want to deregister from the practice." },
  "vast tarief": { dutch: "Ik betaal een vast tarief.", meaningZh: "我支付固定费率。", meaningEn: "I pay a fixed rate." },
  "variabel tarief": { dutch: "Ik heb een variabel tarief.", meaningZh: "我有浮动费率。", meaningEn: "I have a variable rate." },
};

const capitalizedDutch = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const addTerminalPunctuation = (value: string, punctuation = ".") =>
  /[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}${punctuation}`;

function sentenceFromPhraseWord(word: WordItem) {
  const phrase = normalizeChunkText(word.dutch);
  if (!phrase.includes(" ")) return undefined;
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const startsQuestion = /^(hoe|wat|waar|wanneer|waarom|wie|welke)\b/.test(phrase);
  const startsSentence = /^(ik|jij|je|u|hij|zij|ze|wij|we|de|het|mijn|uw|dit|dat|er|kan|kunt|mag|moet|wil|wilt|ben|is|zijn|kom|ga|wacht|kijk|zeg)\b/.test(phrase);

  if (startsQuestion || startsSentence) {
    const punctuation = startsQuestion ? "?" : ".";
    return {
      dutch: addTerminalPunctuation(capitalizedDutch(word.dutch.trim()), punctuation),
      meaningZh: zh.endsWith("？") || zh.endsWith("?") || punctuation === "." ? zh : `${zh}？`,
      meaningEn: en,
      trustedTargetUse: true,
    };
  }

  if (/^te\s+/.test(phrase)) {
    return {
      dutch: `Dat is ${word.dutch}.`,
      meaningZh: `那${zh}。`,
      meaningEn: `That is ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (/^(zonder|met)\s+/.test(phrase)) {
    return {
      dutch: `Ik wil koffie ${word.dutch}.`,
      meaningZh: `我想要${zh}的咖啡。`,
      meaningEn: `I want coffee ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (/^(warm|koud)\s+water$/.test(phrase)) {
    return {
      dutch: `Ik wil ${word.dutch}.`,
      meaningZh: `我想要${zh}。`,
      meaningEn: `I want ${en}.`,
      trustedTargetUse: true,
    };
  }

  const actionPhrase = phrase.match(/^(.+)\s+([a-zà-ÿ]+en|doen|maken|nemen|geven|houden|volgen|sturen|lezen|vragen|melden|scheiden|ophalen|afronden|afzeggen|aanvragen|bezoeken|luisteren)$/i);
  if (actionPhrase) {
    const object = actionPhrase[1].trim();
    const verb = actionPhrase[2].trim();
    const noArticleObjects = new Set(["contact", "feedback", "afval", "hulp", "muziek", "gezond", "samen", "regels"]);
    const articleObjects = new Set([
      "besluit",
      "verslag",
      "melding",
      "taak",
      "afspraak",
      "antwoord",
      "reden",
      "kaart",
      "formulier",
      "klacht",
      "vraag",
      "document",
      "bewijs",
      "nummer",
    ]);
    const objectPhrase = noArticleObjects.has(object)
      ? object
      : articleObjects.has(object)
        ? `een ${object}`
        : object;
    return {
      dutch: `Ik wil ${objectPhrase} ${verb}.`,
      meaningZh: `我想${zh}。`,
      meaningEn: `I want to ${en}.`,
      trustedTargetUse: true,
    };
  }

  return undefined;
}

const concreteNounTagPattern =
  /(home|housing|room|rooms|furniture|kitchen|bathroom|tableware|food|supermarket|shopping|clothes|digital|device|technology|document|form|transport|place|places|directions|location|nature|city|family|person|personal|identity|profession|health|body|school|education|work|office|public|sign|leisure|hobby|emotion|grammar|language|media|culture|environment)/;

const abstractNounTagPattern =
  /(cause|result|reason|effect|safety|insurance|permission|condition|information|quality|problem|policy|rule|coverage|process|planning|advice|treatment|complaint)/;

const painBodyNounPattern =
  /^(hoofd|buik|hand|voet|rug|keel|oog|arm|been|gezicht|vinger|teen|borst|hart|huid|lichaam|spier|maag|nek|schouder|knie|tand|oor)$/;

const symptomNounPattern =
  /^(koorts|allergie|diarree|benauwdheid|hoofdpijn|buikpijn|keelpijn|klacht|gezondheidsklacht)$/;

const healthQuestionNounPattern =
  /(onderzoek|uitslag|diagnose|verwijzing|receptnummer|dosering|dosis|temperatuur|wachttijd|spreekuur|kuur|bijwerking|gebruikersadvies|hersteladvies)$/;

const healthDocumentNounPattern =
  /(bijsluiter|recept|herhaalrecept|afspraakbrief|verzekeringspas|zorgpas)$/;

const healthPlaceOrPersonPattern =
  /(specialist|apotheker|assistente|spoedpost|wachtkamer|verpleeghuis|verpleegkundige|verloskundige|mondhygiënist|fysiotherapeut|psycholoog|consultatiebureau|gezondheidscentrum)$/;

const abstractQuestionNounPattern =
  /(termijn|tijd|status|nummer|kenmerk|bedrag|kosten|premie|dekking|polis|informatie|gegevens|regeling|garantie|veiligheid|vergoeding|toestemming|vergunning|verantwoordelijkheid|zorgtoeslag|verzekering)$/;

const abstractHaveNounPattern =
  /(vraag|probleem|klacht|storing|melding|verzoek|aanvraag|reactie|afspraak|sollicitatie|bezwaar|bewijs|formulier)$/;

function safeQuestionSentence(word: WordItem, zh: string, en: string) {
  const articlePhrase = articleWord(word);
  return { dutch: `Wat is ${articlePhrase}?`, meaningZh: `${zh}是什么？`, meaningEn: `What is the ${en}?`, trustedTargetUse: true };
}

function safeHaveSentence(word: WordItem, zh: string, en: string) {
  const key = normalizeWordText(word.dutch);
  if (/^(koorts|diarree|benauwdheid|hoofdpijn|buikpijn|keelpijn)$/.test(key)) {
    return { dutch: `Ik heb ${word.dutch}.`, meaningZh: `我有${zh}。`, meaningEn: `I have ${en}.`, trustedTargetUse: true };
  }
  return { dutch: `Ik heb een ${word.dutch}.`, meaningZh: `我有一个${zh}。`, meaningEn: `I have a ${en}.`, trustedTargetUse: true };
}

function safeAbstractNounSentence(word: WordItem, tags: string) {
  const key = normalizeWordText(word.dutch);
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  if (/(datum|date)/.test(key) || /\bdate\b/i.test(en)) {
    return {
      dutch: `Wat is ${word.article ? articleWord(word) : word.dutch}?`,
      meaningZh: `${zh}是什么时候？`,
      meaningEn: `What is the ${en}?`,
      trustedTargetUse: true,
    };
  }
  if (abstractHaveNounPattern.test(key)) return safeHaveSentence(word, zh, en);
  if (abstractQuestionNounPattern.test(key) || abstractNounTagPattern.test(tags)) return safeQuestionSentence(word, zh, en);
  return undefined;
}

function broadTopicNounSentence(word: WordItem, tags: string) {
  const key = normalizeWordText(word.dutch);
  const articlePhrase = articleWord(word);
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");

  if (/(document|form|admin|email|writing)/.test(tags)) {
    if (/(brief|document|formulier|bestand|pdf|verslag|rapport|tekst|artikel)$/.test(key)) {
      return { dutch: `Ik lees ${articlePhrase} goed door.`, meaningZh: `我仔细读${zh}。`, meaningEn: `I read the ${en} carefully.`, trustedTargetUse: true };
    }
    if (/(bijlage|kopie|bewijs|verklaring|aanvraag|verzoek)$/.test(key)) {
      return { dutch: `Ik stuur ${articlePhrase} mee.`, meaningZh: `我把${zh}一起发过去。`, meaningEn: `I send the ${en} along.`, trustedTargetUse: true };
    }
    return { dutch: `Ik controleer ${articlePhrase}.`, meaningZh: `我核对${zh}。`, meaningEn: `I check the ${en}.`, trustedTargetUse: true };
  }

  if (/(work|office|school|education)/.test(tags)) {
    if (/(vergadering|overleg|gesprek|presentatie)$/.test(key)) {
      return { dutch: `Ik bereid ${articlePhrase} voor.`, meaningZh: `我准备${zh}。`, meaningEn: `I prepare the ${en}.`, trustedTargetUse: true };
    }
    if (/(opdracht|taak|examen|toets|oefening)$/.test(key)) {
      return { dutch: `Ik maak ${articlePhrase}.`, meaningZh: `我做/参加${zh}。`, meaningEn: `I do the ${en}.`, trustedTargetUse: true };
    }
    if (/(advies|feedback|uitleg|instructie|beoordeling)$/.test(key)) {
      return { dutch: `Ik krijg ${articlePhrase}.`, meaningZh: `我收到${zh}。`, meaningEn: `I receive the ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik werk met ${articlePhrase}.`, meaningZh: `我在工作/学习中接触${zh}。`, meaningEn: `I work with the ${en}.`, trustedTargetUse: true };
  }

  if (/(media|language|grammar|reading)/.test(tags)) {
    if (/(podcast|uitzending|fragment|interview)$/.test(key)) {
      return { dutch: `Ik luister naar ${articlePhrase}.`, meaningZh: `我听${zh}。`, meaningEn: `I listen to the ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik zoek ${articlePhrase} in de tekst.`, meaningZh: `我在文本里找${zh}。`, meaningEn: `I look for the ${en} in the text.`, trustedTargetUse: true };
  }

  if (/(culture|leisure)/.test(tags)) {
    if (/(theater|museum|voorstelling|tentoonstelling|optreden)$/.test(key)) {
      return { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik bekijk ${articlePhrase}.`, meaningZh: `我观看/欣赏${zh}。`, meaningEn: `I look at the ${en}.`, trustedTargetUse: true };
  }

  if (/(environment|weather|nature)/.test(tags)) {
    if (/(afval|energie|water|stroom)$/.test(key)) {
      return { dutch: `Ik gebruik minder ${word.dutch}.`, meaningZh: `我少用${zh}。`, meaningEn: `I use less ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `${capitalizedDutch(articlePhrase)} verandert snel.`, meaningZh: `${zh}变化很快。`, meaningEn: `The ${en} changes quickly.`, trustedTargetUse: true };
  }

  if (/(opinion|society|problem|complaint|safety)/.test(tags) || /(argument|reden|voordeel|nadeel|conclusie|oorzaak|gevolg|probleem|oplossing)$/.test(key)) {
    return { dutch: `Ik leg ${articlePhrase} duidelijk uit.`, meaningZh: `我清楚说明${zh}。`, meaningEn: `I explain the ${en} clearly.`, trustedTargetUse: true };
  }

  return undefined;
}

function safeHealthNounSentence(word: WordItem, tags: string) {
  if (!/(body|health|pharmacy)/.test(tags)) return undefined;
  const key = normalizeWordText(word.dutch);
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const articlePhrase = articleWord(word);

  if (painBodyNounPattern.test(key)) {
    return bodyPartOutputSentence(word);
  }
  if (symptomNounPattern.test(key)) return safeHaveSentence(word, zh, en);
  if (/^(paracetamol|medicijn|tablet|zelfzorgmiddel|herhaalmedicatie)$/.test(key)) {
    const object = key === "paracetamol" ? word.dutch : articlePhrase;
    return { dutch: `Ik neem ${object}.`, meaningZh: `我服用${zh}。`, meaningEn: `I take the ${en}.`, trustedTargetUse: true };
  }
  if (/^(zalf|druppels|verband|pleister)$/.test(key)) {
    return { dutch: `Ik gebruik ${articlePhrase}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, trustedTargetUse: true };
  }
  if (healthDocumentNounPattern.test(key)) {
    return { dutch: `Ik lees ${articlePhrase}.`, meaningZh: `我看${zh}。`, meaningEn: `I read the ${en}.`, trustedTargetUse: true };
  }
  if (healthQuestionNounPattern.test(key)) return safeQuestionSentence(word, zh, en);
  if (healthPlaceOrPersonPattern.test(key)) {
    return { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };
  }
  return undefined;
}

const bodyPartOutputSentences: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  hoofd: { dutch: "Ik draai mijn hoofd.", meaningZh: "我转动头。", meaningEn: "I turn my head." },
  buik: { dutch: "Ik leg mijn hand op mijn buik.", meaningZh: "我把手放在肚子上。", meaningEn: "I put my hand on my belly." },
  keel: { dutch: "Mijn keel is droog.", meaningZh: "我的喉咙很干。", meaningEn: "My throat is dry." },
  arm: { dutch: "Ik beweeg mijn arm.", meaningZh: "我活动我的手臂。", meaningEn: "I move my arm." },
  been: { dutch: "Ik sta op één been.", meaningZh: "我单脚站着。", meaningEn: "I stand on one leg." },
  hand: { dutch: "Ik schrijf met mijn hand.", meaningZh: "我用手写字。", meaningEn: "I write with my hand." },
  voet: { dutch: "Ik zet mijn voet op de grond.", meaningZh: "我把脚踩在地上。", meaningEn: "I put my foot on the ground." },
  rug: { dutch: "Ik draag een tas op mijn rug.", meaningZh: "我把包背在背上。", meaningEn: "I carry a bag on my back." },
  oog: { dutch: "Ik zie het met mijn oog.", meaningZh: "我用眼睛看到它。", meaningEn: "I see it with my eye." },
  oor: { dutch: "Ik hoor het met mijn oor.", meaningZh: "我用耳朵听到它。", meaningEn: "I hear it with my ear." },
  neus: { dutch: "Ik adem door mijn neus.", meaningZh: "我用鼻子呼吸。", meaningEn: "I breathe through my nose." },
  mond: { dutch: "Doe uw mond open.", meaningZh: "请张开嘴。", meaningEn: "Open your mouth." },
  tand: { dutch: "Ik poets mijn tanden.", meaningZh: "我刷牙。", meaningEn: "I brush my teeth." },
  knie: { dutch: "Ik buig mijn knie.", meaningZh: "我弯膝盖。", meaningEn: "I bend my knee." },
  schouder: { dutch: "Ik draag een tas op mijn schouder.", meaningZh: "我把包背在肩上。", meaningEn: "I carry a bag on my shoulder." },
  nek: { dutch: "Ik draai mijn nek.", meaningZh: "我转动脖子。", meaningEn: "I turn my neck." },
  borst: { dutch: "Ik adem diep in mijn borst.", meaningZh: "我胸口深呼吸。", meaningEn: "I breathe deeply in my chest." },
  hart: { dutch: "Mijn hart klopt snel.", meaningZh: "我的心跳得很快。", meaningEn: "My heart beats fast." },
  maag: { dutch: "Mijn maag is vol.", meaningZh: "我的胃饱了。", meaningEn: "My stomach is full." },
  huid: { dutch: "Mijn huid is droog.", meaningZh: "我的皮肤很干。", meaningEn: "My skin is dry." },
  lichaam: { dutch: "Mijn lichaam is moe.", meaningZh: "我的身体累了。", meaningEn: "My body is tired." },
};

function bodyPartOutputSentence(word: WordItem) {
  const output = bodyPartOutputSentences[normalizeWordText(word.dutch)];
  return output ? { ...output, trustedTargetUse: true } : undefined;
}

const practicalNounOutputSentences: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  winkel: { dutch: "Ik ga naar de winkel.", meaningZh: "我去商店。", meaningEn: "I go to the shop." },
  bon: { dutch: "Ik bewaar de bon.", meaningZh: "我保存收据。", meaningEn: "I keep the receipt." },
  kassa: { dutch: "Ik betaal bij de kassa.", meaningZh: "我在收银台付款。", meaningEn: "I pay at the checkout." },
  mandje: { dutch: "Ik pak een mandje.", meaningZh: "我拿一个小篮子。", meaningEn: "I take a basket." },
  pinpas: { dutch: "Ik betaal met mijn pinpas.", meaningZh: "我用银行卡付款。", meaningEn: "I pay with my debit card." },
  biljet: { dutch: "Ik betaal met een biljet.", meaningZh: "我用一张纸币付款。", meaningEn: "I pay with a banknote." },
  portemonnee: { dutch: "Ik pak mijn portemonnee.", meaningZh: "我拿出钱包。", meaningEn: "I take my wallet." },
  aanbieding: { dutch: "Deze jas is in de aanbieding.", meaningZh: "这件外套正在打折。", meaningEn: "This jacket is on sale." },
  bonnetje: { dutch: "Ik bewaar het bonnetje.", meaningZh: "我保存小票。", meaningEn: "I keep the receipt." },
  klant: { dutch: "De klant betaalt.", meaningZh: "顾客付款。", meaningEn: "The customer pays." },
  verkoper: { dutch: "De verkoper helpt mij.", meaningZh: "售货员帮我。", meaningEn: "The seller helps me." },
  stuk: { dutch: "Ik neem een stuk kaas.", meaningZh: "我拿一块奶酪。", meaningEn: "I take a piece of cheese." },
  fles: { dutch: "Ik pak een fles water.", meaningZh: "我拿一瓶水。", meaningEn: "I take a bottle of water." },
  pak: { dutch: "Ik pak een pak melk.", meaningZh: "我拿一盒牛奶。", meaningEn: "I take a carton of milk." },
  zak: { dutch: "Ik pak een zak appels.", meaningZh: "我拿一袋苹果。", meaningEn: "I take a bag of apples." },
  lunch: { dutch: "Ik eet mijn lunch.", meaningZh: "我吃午饭。", meaningEn: "I eat my lunch." },
  avondeten: { dutch: "Ik maak avondeten.", meaningZh: "我做晚饭。", meaningEn: "I make dinner." },
  diner: { dutch: "Het diner begint om zes uur.", meaningZh: "晚餐六点开始。", meaningEn: "Dinner starts at six o'clock." },
  gezin: { dutch: "Ik woon met mijn gezin.", meaningZh: "我和家人一起住。", meaningEn: "I live with my family." },
  oom: { dutch: "Mijn oom komt op bezoek.", meaningZh: "我叔叔/舅舅来拜访。", meaningEn: "My uncle comes to visit." },
  tante: { dutch: "Mijn tante belt mij.", meaningZh: "我阿姨/姑姑给我打电话。", meaningEn: "My aunt calls me." },
  neef: { dutch: "Mijn neef woont dichtbij.", meaningZh: "我的堂/表兄弟住得很近。", meaningEn: "My male cousin lives nearby." },
  nicht: { dutch: "Mijn nicht woont dichtbij.", meaningZh: "我的堂/表姐妹住得很近。", meaningEn: "My female cousin lives nearby." },
  buurt: { dutch: "Ik woon in deze buurt.", meaningZh: "我住在这个街区。", meaningEn: "I live in this neighbourhood." },
  buur: { dutch: "Mijn buur groet mij.", meaningZh: "我的邻居向我打招呼。", meaningEn: "My neighbour greets me." },
  buurman: { dutch: "Mijn buurman groet mij.", meaningZh: "我的男邻居向我打招呼。", meaningEn: "My male neighbour greets me." },
  buurvrouw: { dutch: "Mijn buurvrouw helpt mij.", meaningZh: "我的女邻居帮我。", meaningEn: "My female neighbour helps me." },
  kleinkind: { dutch: "Mijn kleinkind komt op bezoek.", meaningZh: "我的孙辈孩子来拜访。", meaningEn: "My grandchild comes to visit." },
  mevrouw: { dutch: "De mevrouw wacht.", meaningZh: "那位女士在等。", meaningEn: "The lady is waiting." },
  meneer: { dutch: "De meneer wacht.", meaningZh: "那位先生在等。", meaningEn: "The gentleman is waiting." },
  persoon: { dutch: "Deze persoon woont hier.", meaningZh: "这个人住在这里。", meaningEn: "This person lives here." },
  minuut: { dutch: "Ik wacht tien minuten.", meaningZh: "我等十分钟。", meaningEn: "I wait ten minutes." },
  uur: { dutch: "Ik kom om drie uur.", meaningZh: "我三点来。", meaningEn: "I come at three o'clock." },
  tijd: { dutch: "Ik heb geen tijd.", meaningZh: "我没有时间。", meaningEn: "I do not have time." },
  avond: { dutch: "Ik kom in de avond.", meaningZh: "我晚上来。", meaningEn: "I come in the evening." },
  leeftijd: { dutch: "Wat is uw leeftijd?", meaningZh: "您的年龄是多少？", meaningEn: "What is your age?" },
  telefoonnummer: { dutch: "Wat is uw telefoonnummer?", meaningZh: "您的电话号码是多少？", meaningEn: "What is your phone number?" },
  geboortedatum: { dutch: "Ik vul mijn geboortedatum in.", meaningZh: "我填写我的出生日期。", meaningEn: "I fill in my date of birth." },
  informatie: { dutch: "Ik heb informatie nodig.", meaningZh: "我需要信息。", meaningEn: "I need information." },
  bioscoop: { dutch: "Ik ga naar de bioscoop.", meaningZh: "我去电影院。", meaningEn: "I go to the cinema." },
  museum: { dutch: "Ik ga naar het museum.", meaningZh: "我去博物馆。", meaningEn: "I go to the museum." },
  zwembad: { dutch: "Ik ga naar het zwembad.", meaningZh: "我去游泳池。", meaningEn: "I go to the swimming pool." },
  sportschool: { dutch: "Ik ga naar de sportschool.", meaningZh: "我去健身房。", meaningEn: "I go to the gym." },
  kerk: { dutch: "Ik ga naar de kerk.", meaningZh: "我去教堂。", meaningEn: "I go to the church." },
  moskee: { dutch: "Ik ga naar de moskee.", meaningZh: "我去清真寺。", meaningEn: "I go to the mosque." },
  toilet: { dutch: "Ik moet naar het toilet.", meaningZh: "我要去厕所。", meaningEn: "I need to go to the toilet." },
  printer: { dutch: "Ik print met de printer.", meaningZh: "我用打印机打印。", meaningEn: "I print with the printer." },
  balpen: { dutch: "Ik schrijf met een balpen.", meaningZh: "我用圆珠笔写。", meaningEn: "I write with a ballpoint pen." },
  bureau: { dutch: "Ik zit aan het bureau.", meaningZh: "我坐在书桌前。", meaningEn: "I sit at the desk." },
  computer: { dutch: "Ik werk op de computer.", meaningZh: "我在电脑上工作。", meaningEn: "I work on the computer." },
  laptop: { dutch: "Ik werk op mijn laptop.", meaningZh: "我在笔记本电脑上工作。", meaningEn: "I work on my laptop." },
  camera: { dutch: "Ik maak een foto met de camera.", meaningZh: "我用相机拍照。", meaningEn: "I take a photo with the camera." },
  programma: { dutch: "Ik kijk naar het programma.", meaningZh: "我看这个节目。", meaningEn: "I watch the programme." },
  scherm: { dutch: "Ik kijk naar het scherm.", meaningZh: "我看屏幕。", meaningEn: "I look at the screen." },
  muis: { dutch: "Ik klik met de muis.", meaningZh: "我用鼠标点击。", meaningEn: "I click with the mouse." },
  oplader: { dutch: "Ik sluit de oplader aan.", meaningZh: "我接上充电器。", meaningEn: "I connect the charger." },
  batterij: { dutch: "De batterij is leeg.", meaningZh: "电池没电了。", meaningEn: "The battery is empty." },
  stekker: { dutch: "Ik doe de stekker in het stopcontact.", meaningZh: "我把插头插进插座。", meaningEn: "I put the plug into the socket." },
  stopcontact: { dutch: "De stekker zit in het stopcontact.", meaningZh: "插头在插座里。", meaningEn: "The plug is in the socket." },
  sms: { dutch: "Ik stuur een sms.", meaningZh: "我发一条短信。", meaningEn: "I send a text message." },
  website: { dutch: "Ik open de website.", meaningZh: "我打开网站。", meaningEn: "I open the website." },
  pagina: { dutch: "Ik lees de pagina.", meaningZh: "我读这一页。", meaningEn: "I read the page." },
  knop: { dutch: "Ik druk op de knop.", meaningZh: "我按按钮。", meaningEn: "I press the button." },
  menu: { dutch: "Ik open het menu.", meaningZh: "我打开菜单。", meaningEn: "I open the menu." },
  instelling: { dutch: "Ik verander de instelling.", meaningZh: "我更改设置。", meaningEn: "I change the setting." },
  geluid: { dutch: "Ik zet het geluid uit.", meaningZh: "我关掉声音。", meaningEn: "I turn off the sound." },
  beeld: { dutch: "Het beeld is duidelijk.", meaningZh: "画面很清楚。", meaningEn: "The image is clear." },
  cadeau: { dutch: "Ik geef een cadeau.", meaningZh: "我送一份礼物。", meaningEn: "I give a present." },
  feestje: { dutch: "Ik ga naar het feestje.", meaningZh: "我去小聚会。", meaningEn: "I go to the small party." },
  bezoek: { dutch: "Ik krijg bezoek.", meaningZh: "我有客人来访。", meaningEn: "I get visitors." },
  bloed: { dutch: "Er is bloed op mijn hand.", meaningZh: "我手上有血。", meaningEn: "There is blood on my hand." },
  kamer: { dutch: "Ik slaap in mijn kamer.", meaningZh: "我睡在自己的房间里。", meaningEn: "I sleep in my room." },
  tuin: { dutch: "Ik zit in de tuin.", meaningZh: "我坐在花园里。", meaningEn: "I sit in the garden." },
  zolder: { dutch: "De doos staat op zolder.", meaningZh: "箱子在阁楼上。", meaningEn: "The box is in the attic." },
  kelder: { dutch: "De fiets staat in de kelder.", meaningZh: "自行车在地下室里。", meaningEn: "The bike is in the basement." },
  balkon: { dutch: "Ik zit op het balkon.", meaningZh: "我坐在阳台上。", meaningEn: "I sit on the balcony." },
  gang: { dutch: "Ik loop door de gang.", meaningZh: "我走过走廊。", meaningEn: "I walk through the hallway." },
  gordijn: { dutch: "Ik doe het gordijn dicht.", meaningZh: "我拉上窗帘。", meaningEn: "I close the curtain." },
  kussen: { dutch: "Het kussen ligt op bed.", meaningZh: "枕头在床上。", meaningEn: "The pillow is on the bed." },
  matras: { dutch: "Het matras ligt op bed.", meaningZh: "床垫在床上。", meaningEn: "The mattress is on the bed." },
  spiegel: { dutch: "Ik kijk in de spiegel.", meaningZh: "我照镜子。", meaningEn: "I look in the mirror." },
  douche: { dutch: "Ik neem een douche.", meaningZh: "我洗澡。", meaningEn: "I take a shower." },
  kraan: { dutch: "Ik draai de kraan open.", meaningZh: "我打开水龙头。", meaningEn: "I turn on the tap." },
  gootsteen: { dutch: "Ik spoel het glas in de gootsteen.", meaningZh: "我在水槽里冲杯子。", meaningEn: "I rinse the glass in the sink." },
  fornuis: { dutch: "Ik kook op het fornuis.", meaningZh: "我在炉灶上做饭。", meaningEn: "I cook on the stove." },
  oven: { dutch: "De oven is warm.", meaningZh: "烤箱是热的。", meaningEn: "The oven is warm." },
  koelkast: { dutch: "De melk staat in de koelkast.", meaningZh: "牛奶在冰箱里。", meaningEn: "The milk is in the fridge." },
  trap: { dutch: "Ik loop de trap op.", meaningZh: "我上楼梯。", meaningEn: "I walk up the stairs." },
  dak: { dutch: "Het dak lekt.", meaningZh: "屋顶漏水。", meaningEn: "The roof leaks." },
  keuken: { dutch: "Ik kook in de keuken.", meaningZh: "我在厨房做饭。", meaningEn: "I cook in the kitchen." },
  badkamer: { dutch: "Ik douche in de badkamer.", meaningZh: "我在浴室洗澡。", meaningEn: "I shower in the bathroom." },
  slaapkamer: { dutch: "Ik slaap in de slaapkamer.", meaningZh: "我在卧室睡觉。", meaningEn: "I sleep in the bedroom." },
  woonkamer: { dutch: "Ik zit in de woonkamer.", meaningZh: "我坐在客厅里。", meaningEn: "I sit in the living room." },
  bed: { dutch: "Ik slaap in bed.", meaningZh: "我在床上睡觉。", meaningEn: "I sleep in bed." },
  bank: { dutch: "Ik zit op de bank.", meaningZh: "我坐在沙发上。", meaningEn: "I sit on the sofa." },
  kast: { dutch: "Mijn jas hangt in de kast.", meaningZh: "我的外套挂在柜子里。", meaningEn: "My coat hangs in the cupboard." },
  lamp: { dutch: "Ik doe de lamp aan.", meaningZh: "我把灯打开。", meaningEn: "I turn on the lamp." },
  vloer: { dutch: "Ik maak de vloer schoon.", meaningZh: "我清洁地板。", meaningEn: "I clean the floor." },
  muur: { dutch: "De foto hangt aan de muur.", meaningZh: "照片挂在墙上。", meaningEn: "The photo hangs on the wall." },
  raam: { dutch: "Ik doe het raam open.", meaningZh: "我打开窗户。", meaningEn: "I open the window." },
  bord: { dutch: "Ik eet van het bord.", meaningZh: "我从盘子里吃。", meaningEn: "I eat from the plate." },
  kom: { dutch: "Ik eet soep uit de kom.", meaningZh: "我从碗里喝汤。", meaningEn: "I eat soup from the bowl." },
  glas: { dutch: "Ik drink uit het glas.", meaningZh: "我用玻璃杯喝。", meaningEn: "I drink from the glass." },
  beker: { dutch: "Ik drink uit de beker.", meaningZh: "我用杯子喝。", meaningEn: "I drink from the cup." },
  kop: { dutch: "Ik drink koffie uit de kop.", meaningZh: "我用杯子喝咖啡。", meaningEn: "I drink coffee from the cup." },
  mes: { dutch: "Ik snijd met het mes.", meaningZh: "我用刀切。", meaningEn: "I cut with the knife." },
  vork: { dutch: "Ik eet met de vork.", meaningZh: "我用叉子吃。", meaningEn: "I eat with the fork." },
  lepel: { dutch: "Ik eet soep met de lepel.", meaningZh: "我用勺子喝汤。", meaningEn: "I eat soup with the spoon." },
  pan: { dutch: "Ik kook in de pan.", meaningZh: "我在锅里做饭。", meaningEn: "I cook in the pan." },
  pot: { dutch: "De pot staat op tafel.", meaningZh: "罐子在桌上。", meaningEn: "The pot is on the table." },
  bak: { dutch: "Ik doe het in de bak.", meaningZh: "我把它放进盒/桶里。", meaningEn: "I put it in the bin/container." },
  bordje: { dutch: "Ik eet van het bordje.", meaningZh: "我从小盘子里吃。", meaningEn: "I eat from the small plate." },
  servet: { dutch: "Ik leg het servet op tafel.", meaningZh: "我把餐巾放在桌上。", meaningEn: "I put the napkin on the table." },
  tafelkleed: { dutch: "Het tafelkleed ligt op tafel.", meaningZh: "桌布在桌上。", meaningEn: "The tablecloth is on the table." },
  zeep: { dutch: "Ik was mijn handen met zeep.", meaningZh: "我用肥皂洗手。", meaningEn: "I wash my hands with soap." },
  handdoek: { dutch: "Ik droog mijn handen met de handdoek.", meaningZh: "我用毛巾擦干手。", meaningEn: "I dry my hands with the towel." },
  vuilniszak: { dutch: "Ik doe afval in de vuilniszak.", meaningZh: "我把垃圾放进垃圾袋。", meaningEn: "I put rubbish in the bin bag." },
  bloem: { dutch: "De bloem staat in de tuin.", meaningZh: "花在花园里。", meaningEn: "The flower is in the garden." },
  gras: { dutch: "Ik loop op het gras.", meaningZh: "我走在草地上。", meaningEn: "I walk on the grass." },
  lucht: { dutch: "De lucht is blauw.", meaningZh: "天空是蓝的。", meaningEn: "The sky is blue." },
  rivier: { dutch: "Ik loop langs de rivier.", meaningZh: "我沿着河走。", meaningEn: "I walk along the river." },
  zee: { dutch: "Ik zwem in de zee.", meaningZh: "我在海里游泳。", meaningEn: "I swim in the sea." },
  strand: { dutch: "Ik loop op het strand.", meaningZh: "我走在海滩上。", meaningEn: "I walk on the beach." },
  brug: { dutch: "Ik loop over de brug.", meaningZh: "我走过桥。", meaningEn: "I walk over the bridge." },
  flat: { dutch: "Ik woon in een flat.", meaningZh: "我住在公寓楼里。", meaningEn: "I live in an apartment building." },
  centimeter: { dutch: "Dat is tien centimeter.", meaningZh: "那是十厘米。", meaningEn: "That is ten centimetres." },
  meter: { dutch: "Dat is één meter.", meaningZh: "那是一米。", meaningEn: "That is one metre." },
  liter: { dutch: "Dat is één liter.", meaningZh: "那是一升。", meaningEn: "That is one litre." },
  foutje: { dutch: "Ik maak een foutje.", meaningZh: "我犯了一个小错。", meaningEn: "I make a small mistake." },
  post: { dutch: "Ik krijg post.", meaningZh: "我收到邮件/信件。", meaningEn: "I receive mail." },
  container: { dutch: "Ik gooi afval in de container.", meaningZh: "我把垃圾扔进垃圾箱。", meaningEn: "I throw rubbish into the container." },
  glasbak: { dutch: "Ik gooi glas in de glasbak.", meaningZh: "我把玻璃扔进玻璃回收箱。", meaningEn: "I throw glass into the glass container." },
  papierbak: { dutch: "Ik gooi papier in de papierbak.", meaningZh: "我把纸扔进纸类回收箱。", meaningEn: "I throw paper into the paper bin." },
  beginner: { dutch: "Ik ben een beginner.", meaningZh: "我是初学者。", meaningEn: "I am a beginner." },
  oorzaak: { dutch: "Ik zoek de oorzaak.", meaningZh: "我找原因。", meaningEn: "I look for the cause." },
  gevolg: { dutch: "Dat heeft een gevolg.", meaningZh: "那会有后果。", meaningEn: "That has a consequence." },
  veiligheid: { dutch: "Veiligheid is belangrijk.", meaningZh: "安全很重要。", meaningEn: "Safety is important." },
  gemeentehuis: { dutch: "Ik heb een afspraak bij het gemeentehuis.", meaningZh: "我在市政厅有预约。", meaningEn: "I have an appointment at the town hall." },
  wachtwoord: { dutch: "Ik typ mijn wachtwoord in.", meaningZh: "我输入我的密码。", meaningEn: "I type in my password." },
  gebruikersnaam: { dutch: "Ik typ mijn gebruikersnaam in.", meaningZh: "我输入我的用户名。", meaningEn: "I type in my username." },
  stempel: { dutch: "Ik zet een stempel op het formulier.", meaningZh: "我在表格上盖章。", meaningEn: "I put a stamp on the form." },
  mapje: { dutch: "Ik doe documenten in een mapje.", meaningZh: "我把文件放进文件夹。", meaningEn: "I put documents in a folder." },
  pakket: { dutch: "Ik haal het pakket op.", meaningZh: "我去取包裹。", meaningEn: "I pick up the parcel." },
  afval: { dutch: "Ik gooi het afval weg.", meaningZh: "我扔掉垃圾。", meaningEn: "I throw away the rubbish." },
  vakje: { dutch: "Ik kruis het vakje aan.", meaningZh: "我勾选小框。", meaningEn: "I tick the box." },
  keuzelijst: { dutch: "Ik kies iets uit de keuzelijst.", meaningZh: "我从下拉列表里选择。", meaningEn: "I choose something from the dropdown list." },
  patiënt: { dutch: "De patiënt wacht in de wachtkamer.", meaningZh: "病人在候诊室等。", meaningEn: "The patient waits in the waiting room." },
  wachtkamer: { dutch: "Ik wacht in de wachtkamer.", meaningZh: "我在候诊室等待。", meaningEn: "I wait in the waiting room." },
  bloedonderzoek: { dutch: "Ik krijg een bloedonderzoek.", meaningZh: "我做血液检查。", meaningEn: "I get a blood test." },
  urineonderzoek: { dutch: "Ik krijg een urineonderzoek.", meaningZh: "我做尿检。", meaningEn: "I get a urine test." },
  uitslag: { dutch: "Ik krijg de uitslag morgen.", meaningZh: "我明天拿到结果。", meaningEn: "I get the result tomorrow." },
  diagnose: { dutch: "De arts stelt de diagnose.", meaningZh: "医生作出诊断。", meaningEn: "The doctor makes the diagnosis." },
  pijnstiller: { dutch: "Ik neem een pijnstiller.", meaningZh: "我吃一片止痛药。", meaningEn: "I take a painkiller." },
  noodnummer: { dutch: "Ik bel het noodnummer.", meaningZh: "我拨打急救号码。", meaningEn: "I call the emergency number." },
  kuur: { dutch: "Ik maak de kuur af.", meaningZh: "我完成疗程。", meaningEn: "I finish the course of treatment." },
  vervaldatum: { dutch: "Ik controleer de vervaldatum.", meaningZh: "我检查有效期。", meaningEn: "I check the expiry date." },
  maaltijd: { dutch: "Ik neem het medicijn bij de maaltijd.", meaningZh: "我随餐服药。", meaningEn: "I take the medicine with the meal." },
  woonruimte: { dutch: "Ik zoek woonruimte.", meaningZh: "我找住处。", meaningEn: "I look for housing." },
  huiskamer: { dutch: "Ik zit in de huiskamer.", meaningZh: "我坐在客厅里。", meaningEn: "I sit in the living room." },
  sleutelbos: { dutch: "Ik pak mijn sleutelbos.", meaningZh: "我拿起我的一串钥匙。", meaningEn: "I grab my key ring." },
  arbodienst: { dutch: "De arbodienst belt mij.", meaningZh: "职业健康服务机构给我打电话。", meaningEn: "The occupational health service calls me." },
  verzuim: { dutch: "Ik meld mijn verzuim.", meaningZh: "我报告缺勤。", meaningEn: "I report my absence." },
  hersteldatum: { dutch: "Ik geef mijn hersteldatum door.", meaningZh: "我告知我的康复日期。", meaningEn: "I pass on my recovery date." },
  privacy: { dutch: "Privacy is belangrijk.", meaningZh: "隐私很重要。", meaningEn: "Privacy is important." },
  vervanger: { dutch: "De vervanger komt vandaag.", meaningZh: "替班人今天来。", meaningEn: "The replacement comes today." },
  zorgtoeslag: { dutch: "Ik vraag zorgtoeslag aan.", meaningZh: "我申请医疗补贴。", meaningEn: "I apply for healthcare allowance." },
  inkomen: { dutch: "Ik geef mijn inkomen door.", meaningZh: "我申报我的收入。", meaningEn: "I pass on my income." },
  budget: { dutch: "Ik maak een budget.", meaningZh: "我做预算。", meaningEn: "I make a budget." },
  eindbestemming: { dutch: "Deze trein heeft Amsterdam als eindbestemming.", meaningZh: "这班火车以阿姆斯特丹为终点。", meaningEn: "This train has Amsterdam as its final destination." },
  controleur: { dutch: "De controleur controleert mijn kaartje.", meaningZh: "查票员检查我的票。", meaningEn: "The inspector checks my ticket." },
  ontvanger: { dutch: "Ik schrijf de ontvanger op de brief.", meaningZh: "我把收件人写在信上。", meaningEn: "I write the recipient on the letter." },
  afzender: { dutch: "Ik zet de afzender op de envelop.", meaningZh: "我把寄件人写在信封上。", meaningEn: "I put the sender on the envelope." },
  concept: { dutch: "Ik schrijf een concept.", meaningZh: "我写一份草稿。", meaningEn: "I write a draft." },
  spam: { dutch: "De spam staat in de spammap.", meaningZh: "垃圾邮件在垃圾邮件文件夹里。", meaningEn: "The spam is in the spam folder." },
  map: { dutch: "Ik open de map.", meaningZh: "我打开文件夹。", meaningEn: "I open the folder." },
  bestand: { dutch: "Ik open het bestand.", meaningZh: "我打开文件。", meaningEn: "I open the file." },
  bereikbaarheid: { dutch: "Ik geef mijn bereikbaarheid door.", meaningZh: "我告知我的可联系时间。", meaningEn: "I pass on when I can be reached." },
  voicemail: { dutch: "Ik luister de voicemail af.", meaningZh: "我听语音留言。", meaningEn: "I listen to the voicemail." },
  notitie: { dutch: "Ik maak een notitie.", meaningZh: "我做记录。", meaningEn: "I make a note." },
  verbinding: { dutch: "De verbinding is slecht.", meaningZh: "连接不好。", meaningEn: "The connection is bad." },
  voorkeur: { dutch: "Mijn voorkeur is vrijdag.", meaningZh: "我的偏好是周五。", meaningEn: "My preference is Friday." },
  reactietermijn: { dutch: "De reactietermijn is twee weken.", meaningZh: "回复期限是两周。", meaningEn: "The response period is two weeks." },
  gemeentebalie: { dutch: "Ik ga naar de gemeentebalie.", meaningZh: "我去市政服务柜台。", meaningEn: "I go to the municipal desk." },
  aanvraagstatus: { dutch: "Ik controleer de aanvraagstatus.", meaningZh: "我查看申请状态。", meaningEn: "I check the application status." },
  loketnummer: { dutch: "Ik kijk naar het loketnummer.", meaningZh: "我看窗口号码。", meaningEn: "I look at the counter number." },
  garantie: { dutch: "Ik heb garantie op dit product.", meaningZh: "这个产品有保修。", meaningEn: "I have a warranty on this product." },
  ruiltermijn: { dutch: "De ruiltermijn is dertig dagen.", meaningZh: "退换期限是三十天。", meaningEn: "The exchange period is thirty days." },
  aankoopdatum: { dutch: "Ik vul de aankoopdatum in.", meaningZh: "我填写购买日期。", meaningEn: "I fill in the purchase date." },
  klantenbalie: { dutch: "Ik ga naar de klantenbalie.", meaningZh: "我去客服柜台。", meaningEn: "I go to the customer service desk." },
  artikelnummer: { dutch: "Ik zoek het artikelnummer.", meaningZh: "我找商品编号。", meaningEn: "I look for the item number." },
  voorraadstatus: { dutch: "Ik controleer de voorraadstatus.", meaningZh: "我查看库存状态。", meaningEn: "I check the stock status." },
  pakketpunt: { dutch: "Ik haal het pakket op bij het pakketpunt.", meaningZh: "我在包裹点取包裹。", meaningEn: "I pick up the parcel at the parcel point." },
  bestelling: { dutch: "Ik controleer mijn bestelling.", meaningZh: "我查看我的订单。", meaningEn: "I check my order." },
  wachtrij: { dutch: "Ik sta in de wachtrij.", meaningZh: "我在排队。", meaningEn: "I stand in the queue." },
  sluitingstijd: { dutch: "Ik kom voor sluitingstijd.", meaningZh: "我在关门前来。", meaningEn: "I come before closing time." },
  "sms-controle": { dutch: "Ik vul de sms-code in.", meaningZh: "我填写短信验证码。", meaningEn: "I fill in the SMS code." },
  "digid-app": { dutch: "Ik open de DigiD-app.", meaningZh: "我打开 DigiD 应用。", meaningEn: "I open the DigiD app." },
  "pdf-bestand": { dutch: "Ik open het pdf-bestand.", meaningZh: "我打开 PDF 文件。", meaningEn: "I open the PDF file." },
  urgentie: { dutch: "De urgentie is hoog.", meaningZh: "紧急程度很高。", meaningEn: "The urgency is high." },
  wond: { dutch: "Ik heb een wond.", meaningZh: "我有一个伤口。", meaningEn: "I have a wound." },
  huurder: { dutch: "De huurder betaalt de huur.", meaningZh: "租客付房租。", meaningEn: "The tenant pays the rent." },
  uitval: { dutch: "Er is uitval op deze lijn.", meaningZh: "这条线路有停运。", meaningEn: "There is disruption on this line." },
  kaartcontrole: { dutch: "Er is kaartcontrole in de trein.", meaningZh: "火车上有查票。", meaningEn: "There is ticket inspection on the train." },
  tijdstip: { dutch: "Ik kies een tijdstip.", meaningZh: "我选择一个时间点。", meaningEn: "I choose a time." },
  datum: { dutch: "Ik kies een datum.", meaningZh: "我选择一个日期。", meaningEn: "I choose a date." },
  informatiebalie: { dutch: "Ik ga naar de informatiebalie.", meaningZh: "我去信息柜台。", meaningEn: "I go to the information desk." },
  gebruikersadvies: { dutch: "Ik lees het gebruikersadvies.", meaningZh: "我阅读使用建议。", meaningEn: "I read the user advice." },
  basisverzekering: { dutch: "Ik heb een basisverzekering.", meaningZh: "我有基础保险。", meaningEn: "I have basic insurance." },
  bestelbevestiging: { dutch: "Ik krijg de bestelbevestiging.", meaningZh: "我收到订单确认。", meaningEn: "I receive the order confirmation." },
  huisnummer: { dutch: "Ik vul mijn huisnummer in.", meaningZh: "我填写我的门牌号。", meaningEn: "I fill in my house number." },
  niveau: { dutch: "Mijn niveau is A2.", meaningZh: "我的水平是 A2。", meaningEn: "My level is A2." },
  aanvrager: { dutch: "De aanvrager vult het formulier in.", meaningZh: "申请人填写表格。", meaningEn: "The applicant fills in the form." },
  bewijsstuk: { dutch: "Ik voeg een bewijsstuk toe.", meaningZh: "我添加一份证明材料。", meaningEn: "I add a supporting document." },
  dossiernummer: { dutch: "Ik vul het dossiernummer in.", meaningZh: "我填写档案号。", meaningEn: "I fill in the case number." },
  toestemming: { dutch: "Ik geef toestemming.", meaningZh: "我给出许可。", meaningEn: "I give permission." },
  referentienummer: { dutch: "Ik geef het referentienummer door.", meaningZh: "我告知参考号。", meaningEn: "I pass on the reference number." },
  verblijfsdocument: { dutch: "Ik toon mijn verblijfsdocument.", meaningZh: "我出示我的居留文件。", meaningEn: "I show my residence document." },
  woning: { dutch: "Ik zoek een woning.", meaningZh: "我找住房。", meaningEn: "I look for a home." },
  vertraging: { dutch: "De trein heeft vertraging.", meaningZh: "火车晚点了。", meaningEn: "The train is delayed." },
  verhuurder: { dutch: "Ik bel de verhuurder.", meaningZh: "我给房东/出租方打电话。", meaningEn: "I call the landlord." },
  contract: { dutch: "Ik lees het contract.", meaningZh: "我阅读合同。", meaningEn: "I read the contract." },
  sleutel: { dutch: "Ik pak mijn sleutel.", meaningZh: "我拿我的钥匙。", meaningEn: "I grab my key." },
  reparatie: { dutch: "Ik meld de reparatie.", meaningZh: "我报修。", meaningEn: "I report the repair." },
  loket: { dutch: "Ik ga naar het loket.", meaningZh: "我去窗口。", meaningEn: "I go to the counter." },
  openingstijd: { dutch: "Ik controleer de openingstijd.", meaningZh: "我查看开放时间。", meaningEn: "I check the opening time." },
  kopie: { dutch: "Ik maak een kopie.", meaningZh: "我复印一份。", meaningEn: "I make a copy." },
  spreekuur: { dutch: "Het spreekuur begint om negen uur.", meaningZh: "门诊/咨询时间九点开始。", meaningEn: "The consultation hour starts at nine." },
  onderzoek: { dutch: "Ik krijg een onderzoek.", meaningZh: "我接受检查。", meaningEn: "I get an examination." },
  temperatuur: { dutch: "Ik meet mijn temperatuur.", meaningZh: "我测量体温。", meaningEn: "I measure my temperature." },
  zalf: { dutch: "Ik smeer de zalf op mijn huid.", meaningZh: "我把药膏涂在皮肤上。", meaningEn: "I apply the ointment to my skin." },
  dosering: { dutch: "Ik controleer de dosering.", meaningZh: "我检查剂量。", meaningEn: "I check the dosage." },
  bijwerking: { dutch: "Ik heb een bijwerking.", meaningZh: "我有副作用。", meaningEn: "I have a side effect." },
  balie: { dutch: "Ik ga naar de balie.", meaningZh: "我去柜台。", meaningEn: "I go to the desk." },
  document: { dutch: "Ik heb een document nodig.", meaningZh: "我需要一份文件。", meaningEn: "I need a document." },
  voorletter: { dutch: "Ik vul mijn voorletter in.", meaningZh: "我填写名字首字母。", meaningEn: "I fill in my initial." },
  geslacht: { dutch: "Ik vul mijn geslacht in.", meaningZh: "我填写性别。", meaningEn: "I fill in my gender." },
  geboorteplaats: { dutch: "Ik vul mijn geboorteplaats in.", meaningZh: "我填写出生地。", meaningEn: "I fill in my place of birth." },
  bijlage: { dutch: "Ik stuur de bijlage mee.", meaningZh: "我随信发送附件。", meaningEn: "I send the attachment along." },
  huurcontract: { dutch: "Ik lees het huurcontract.", meaningZh: "我阅读租房合同。", meaningEn: "I read the rental contract." },
  huurprijs: { dutch: "De huurprijs is hoog.", meaningZh: "租金很高。", meaningEn: "The rent price is high." },
  makelaar: { dutch: "Ik bel de makelaar.", meaningZh: "我给房产中介打电话。", meaningEn: "I call the estate agent." },
  bezichtiging: { dutch: "Ik plan een bezichtiging.", meaningZh: "我安排一次看房。", meaningEn: "I plan a viewing." },
  verdieping: { dutch: "Ik woon op de tweede verdieping.", meaningZh: "我住在二楼/三层。", meaningEn: "I live on the second floor." },
  lift: { dutch: "Ik neem de lift.", meaningZh: "我乘电梯。", meaningEn: "I take the lift." },
  verwarming: { dutch: "De verwarming werkt niet.", meaningZh: "暖气不工作。", meaningEn: "The heating does not work." },
  lekkage: { dutch: "Ik meld de lekkage.", meaningZh: "我报告漏水。", meaningEn: "I report the leak." },
  schimmel: { dutch: "Er is schimmel in de badkamer.", meaningZh: "浴室里有霉菌。", meaningEn: "There is mould in the bathroom." },
  monteur: { dutch: "De monteur komt morgen.", meaningZh: "维修师傅明天来。", meaningEn: "The technician comes tomorrow." },
  overlast: { dutch: "Ik meld overlast.", meaningZh: "我报告扰民/干扰。", meaningEn: "I report nuisance." },
  werktijd: { dutch: "Mijn werktijd begint om negen uur.", meaningZh: "我的工作时间九点开始。", meaningEn: "My working time starts at nine." },
  aansluiting: { dutch: "Ik mis mijn aansluiting.", meaningZh: "我错过了衔接车次。", meaningEn: "I miss my connection." },
  omleiding: { dutch: "De bus rijdt via een omleiding.", meaningZh: "公交经由绕行路线行驶。", meaningEn: "The bus goes via a diversion." },
  buschauffeur: { dutch: "De buschauffeur stopt bij de halte.", meaningZh: "公交司机在站点停车。", meaningEn: "The bus driver stops at the stop." },
  conducteur: { dutch: "De conducteur controleert mijn kaartje.", meaningZh: "列车员检查我的票。", meaningEn: "The conductor checks my ticket." },
  kaartautomaat: { dutch: "Ik koop een kaartje bij de kaartautomaat.", meaningZh: "我在售票机买票。", meaningEn: "I buy a ticket at the ticket machine." },
  reisplanner: { dutch: "Ik controleer de reisplanner.", meaningZh: "我查看行程规划器。", meaningEn: "I check the journey planner." },
  aankomsttijd: { dutch: "Ik controleer de aankomsttijd.", meaningZh: "我查看到达时间。", meaningEn: "I check the arrival time." },
  vertrektijd: { dutch: "Ik controleer de vertrektijd.", meaningZh: "我查看出发时间。", meaningEn: "I check the departure time." },
  route: { dutch: "Ik kies een route.", meaningZh: "我选择一条路线。", meaningEn: "I choose a route." },
  termijn: { dutch: "De termijn is twee weken.", meaningZh: "期限是两周。", meaningEn: "The period is two weeks." },
  betaaldatum: { dutch: "Ik controleer de betaaldatum.", meaningZh: "我查看付款日期。", meaningEn: "I check the payment date." },
  bankrekening: { dutch: "Ik vul mijn bankrekening in.", meaningZh: "我填写我的银行账户。", meaningEn: "I fill in my bank account." },
  rekeningnummer: { dutch: "Ik vul het rekeningnummer in.", meaningZh: "我填写银行账号。", meaningEn: "I fill in the account number." },
  kenmerk: { dutch: "Ik vul het kenmerk in.", meaningZh: "我填写付款参考号。", meaningEn: "I fill in the payment reference." },
  polis: { dutch: "Ik lees mijn polis.", meaningZh: "我阅读我的保险单。", meaningEn: "I read my policy." },
  dekking: { dutch: "Ik controleer de dekking.", meaningZh: "我查看保障范围。", meaningEn: "I check the coverage." },
  vergoeding: { dutch: "Ik vraag een vergoeding aan.", meaningZh: "我申请报销/补偿。", meaningEn: "I request compensation." },
  aanmaning: { dutch: "Ik krijg een aanmaning.", meaningZh: "我收到催款信。", meaningEn: "I receive a payment reminder." },
  onderwerp: { dutch: "Ik vul het onderwerp in.", meaningZh: "我填写主题。", meaningEn: "I fill in the subject." },
  aanhef: { dutch: "Ik schrijf een nette aanhef.", meaningZh: "我写一个礼貌称呼。", meaningEn: "I write a polite salutation." },
  groet: { dutch: "Ik sluit af met een groet.", meaningZh: "我以问候语结尾。", meaningEn: "I close with a greeting." },
  uitleg: { dutch: "Ik vraag om uitleg.", meaningZh: "我请求解释。", meaningEn: "I ask for an explanation." },
  oplossing: { dutch: "Ik zoek een oplossing.", meaningZh: "我找解决方案。", meaningEn: "I look for a solution." },
  spoed: { dutch: "Het heeft spoed.", meaningZh: "这件事很急。", meaningEn: "It is urgent." },
  spoedlijn: { dutch: "Ik bel de spoedlijn.", meaningZh: "我拨打急线。", meaningEn: "I call the urgent line." },
  tijdslot: { dutch: "Ik kies een tijdslot.", meaningZh: "我选择一个时间段。", meaningEn: "I choose a time slot." },
  keuze: { dutch: "Ik maak een keuze.", meaningZh: "我做选择。", meaningEn: "I make a choice." },
  bevestiging: { dutch: "Ik krijg een bevestiging.", meaningZh: "我收到确认。", meaningEn: "I receive a confirmation." },
  verwijzing: { dutch: "Ik krijg een verwijzing.", meaningZh: "我拿到转诊。", meaningEn: "I get a referral." },
  dosis: { dutch: "Ik neem de juiste dosis.", meaningZh: "我服用正确剂量。", meaningEn: "I take the right dose." },
  bloeddruk: { dutch: "Ik meet mijn bloeddruk.", meaningZh: "我测血压。", meaningEn: "I measure my blood pressure." },
  overstap: { dutch: "De overstap duurt tien minuten.", meaningZh: "换乘需要十分钟。", meaningEn: "The transfer takes ten minutes." },
  declaratie: { dutch: "Ik dien een declaratie in.", meaningZh: "我提交报销申请。", meaningEn: "I submit an expense claim." },
  wachttijd: { dutch: "De wachttijd is lang.", meaningZh: "等待时间很长。", meaningEn: "The waiting time is long." },
  receptnummer: { dutch: "Ik geef mijn receptnummer door.", meaningZh: "我告知我的处方号。", meaningEn: "I pass on my prescription number." },
  opzegtermijn: { dutch: "De opzegtermijn is een maand.", meaningZh: "解约通知期是一个月。", meaningEn: "The notice period is one month." },
  proeftijd: { dutch: "Ik zit in mijn proeftijd.", meaningZh: "我在试用期。", meaningEn: "I am in my probation period." },
  huurverhoging: { dutch: "Ik krijg een brief over de huurverhoging.", meaningZh: "我收到一封关于涨租的信。", meaningEn: "I receive a letter about the rent increase." },
  zorgverzekering: { dutch: "Ik heb een zorgverzekering.", meaningZh: "我有医疗保险。", meaningEn: "I have health insurance." },
  vertragingstijd: { dutch: "De vertragingstijd is tien minuten.", meaningZh: "延误时间是十分钟。", meaningEn: "The delay time is ten minutes." },
  beschikbaarheid: { dutch: "Ik controleer de beschikbaarheid.", meaningZh: "我查看可用性。", meaningEn: "I check availability." },
  huurspecificatie: { dutch: "Ik lees de huurspecificatie.", meaningZh: "我看租金明细。", meaningEn: "I read the rent specification." },
  assistentie: { dutch: "Ik vraag om assistentie.", meaningZh: "我请求协助。", meaningEn: "I ask for assistance." },
  klantenservice: { dutch: "Ik bel de klantenservice.", meaningZh: "我给客服打电话。", meaningEn: "I call customer service." },
  contractverlenging: { dutch: "De contractverlenging is akkoord.", meaningZh: "续约已通过。", meaningEn: "The contract extension is approved." },
  verblijfsvergunning: { dutch: "Ik vraag een verblijfsvergunning aan.", meaningZh: "我申请居留许可。", meaningEn: "I apply for a residence permit." },
  "kale huur": { dutch: "De kale huur is exclusief kosten.", meaningZh: "裸租金不含其他费用。", meaningEn: "The basic rent excludes extra costs." },
  besluit: { dutch: "Ik krijg een besluit.", meaningZh: "我收到决定。", meaningEn: "I receive a decision." },
  "beschikbare tijd": { dutch: "Ik geef mijn beschikbare tijd door.", meaningZh: "我告知我的可用时间。", meaningEn: "I pass on my available time." },
  "maximale grootte": { dutch: "De maximale grootte is 5 MB.", meaningZh: "最大大小是 5 MB。", meaningEn: "The maximum size is 5 MB." },
};

function practicalNounSentence(word: WordItem) {
  if (!["A1", "A2"].includes(word.level)) return undefined;
  const exact = practicalNounOutputSentences[normalizeWordText(word.dutch)];
  return exact ? { ...exact, trustedTargetUse: true } : undefined;
}

const adjectiveOutputSentences: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  duur: { dutch: "Dat is duur.", meaningZh: "那个很贵。", meaningEn: "That is expensive." },
  goedkoop: { dutch: "Dat is goedkoop.", meaningZh: "那个很便宜。", meaningEn: "That is cheap." },
  slecht: { dutch: "Dat is slecht.", meaningZh: "那样不好。", meaningEn: "That is bad." },
  nodig: { dutch: "Ik heb dat nodig.", meaningZh: "我需要那个。", meaningEn: "I need that." },
  genoeg: { dutch: "Dat is genoeg.", meaningZh: "那就够了。", meaningEn: "That is enough." },
  gratis: { dutch: "Dat is gratis.", meaningZh: "那个是免费的。", meaningEn: "That is free." },
  sterk: { dutch: "Hij is sterk.", meaningZh: "他很强壮。", meaningEn: "He is strong." },
  grijs: { dutch: "De lucht is grijs.", meaningZh: "天空是灰色的。", meaningEn: "The sky is grey." },
  dicht: { dutch: "De deur is dicht.", meaningZh: "门关着。", meaningEn: "The door is closed." },
  eenvoudig: { dutch: "Dat is eenvoudig.", meaningZh: "那个很简单。", meaningEn: "That is simple." },
  rustig: { dutch: "Het is hier rustig.", meaningZh: "这里很安静。", meaningEn: "It is quiet here." },
  hoog: { dutch: "Het gebouw is hoog.", meaningZh: "这栋楼很高。", meaningEn: "The building is tall." },
  laag: { dutch: "De tafel is laag.", meaningZh: "这张桌子很低。", meaningEn: "The table is low." },
  jong: { dutch: "Hij is nog jong.", meaningZh: "他还很年轻。", meaningEn: "He is still young." },
  zwaar: { dutch: "De tas is zwaar.", meaningZh: "这个包很重。", meaningEn: "The bag is heavy." },
  leeg: { dutch: "De fles is leeg.", meaningZh: "瓶子空了。", meaningEn: "The bottle is empty." },
  schoon: { dutch: "De kamer is schoon.", meaningZh: "房间很干净。", meaningEn: "The room is clean." },
  vies: { dutch: "De vloer is vies.", meaningZh: "地板很脏。", meaningEn: "The floor is dirty." },
  gevaarlijk: { dutch: "Dat is gevaarlijk.", meaningZh: "那很危险。", meaningEn: "That is dangerous." },
  raar: { dutch: "Dat is raar.", meaningZh: "那很奇怪。", meaningEn: "That is strange." },
  lastig: { dutch: "Dat is lastig.", meaningZh: "那很麻烦。", meaningEn: "That is difficult." },
  ziek: { dutch: "Ik ben ziek.", meaningZh: "我生病了。", meaningEn: "I am sick." },
  moe: { dutch: "Ik ben moe.", meaningZh: "我累了。", meaningEn: "I am tired." },
  verkouden: { dutch: "Ik ben verkouden.", meaningZh: "我感冒了。", meaningEn: "I have a cold." },
  gezond: { dutch: "Ik ben gezond.", meaningZh: "我很健康。", meaningEn: "I am healthy." },
  ongezond: { dutch: "Dat is ongezond.", meaningZh: "那不健康。", meaningEn: "That is unhealthy." },
  beter: { dutch: "Ik ben beter.", meaningZh: "我好些了。", meaningEn: "I am better." },
  benauwd: { dutch: "Ik ben benauwd.", meaningZh: "我胸闷/呼吸困难。", meaningEn: "I am short of breath." },
  duizelig: { dutch: "Ik ben duizelig.", meaningZh: "我头晕。", meaningEn: "I am dizzy." },
  misselijk: { dutch: "Ik ben misselijk.", meaningZh: "我恶心。", meaningEn: "I feel nauseous." },
  blij: { dutch: "Ik ben blij.", meaningZh: "我很高兴。", meaningEn: "I am happy." },
  verdrietig: { dutch: "Ik ben verdrietig.", meaningZh: "我很难过。", meaningEn: "I am sad." },
  boos: { dutch: "Ik ben boos.", meaningZh: "我生气了。", meaningEn: "I am angry." },
  bang: { dutch: "Ik ben bang.", meaningZh: "我害怕。", meaningEn: "I am afraid." },
  nerveus: { dutch: "Ik ben nerveus.", meaningZh: "我很紧张。", meaningEn: "I am nervous." },
  wakker: { dutch: "Ik ben wakker.", meaningZh: "我醒着。", meaningEn: "I am awake." },
  slaperig: { dutch: "Ik ben slaperig.", meaningZh: "我困了。", meaningEn: "I am sleepy." },
  tevreden: { dutch: "Ik ben tevreden.", meaningZh: "我很满意。", meaningEn: "I am satisfied." },
  ontevreden: { dutch: "Ik ben ontevreden.", meaningZh: "我不满意。", meaningEn: "I am dissatisfied." },
  verrast: { dutch: "Ik ben verrast.", meaningZh: "我很惊讶。", meaningEn: "I am surprised." },
  verlegen: { dutch: "Ik ben verlegen.", meaningZh: "我很害羞。", meaningEn: "I am shy." },
  trots: { dutch: "Ik ben trots.", meaningZh: "我很骄傲。", meaningEn: "I am proud." },
  vrij: { dutch: "Ik ben vrijdag vrij.", meaningZh: "我周五有空/休息。", meaningEn: "I am free on Friday." },
  beschikbaar: { dutch: "Ik ben beschikbaar.", meaningZh: "我有空/可用。", meaningEn: "I am available." },
  bereikbaar: { dutch: "Ik ben telefonisch bereikbaar.", meaningZh: "电话能联系到我。", meaningEn: "I can be reached by phone." },
  aanwezig: { dutch: "Ik ben aanwezig.", meaningZh: "我在场。", meaningEn: "I am present." },
  afwezig: { dutch: "Ik ben afwezig.", meaningZh: "我缺席。", meaningEn: "I am absent." },
  alleenstaand: { dutch: "Ik ben alleenstaand.", meaningZh: "我是单身。", meaningEn: "I am single." },
  getrouwd: { dutch: "Ik ben getrouwd.", meaningZh: "我已婚。", meaningEn: "I am married." },
  gescheiden: { dutch: "Ik ben gescheiden.", meaningZh: "我离婚了。", meaningEn: "I am divorced." },
  eens: { dutch: "Ik ben het ermee eens.", meaningZh: "我同意。", meaningEn: "I agree with it." },
  oneens: { dutch: "Ik ben het er niet mee eens.", meaningZh: "我不同意。", meaningEn: "I disagree with it." },
  lekker: { dutch: "Het eten is lekker.", meaningZh: "饭/食物很好吃。", meaningEn: "The food is tasty." },
  koud: { dutch: "Het is koud.", meaningZh: "天冷。", meaningEn: "It is cold." },
  warm: { dutch: "Het is warm.", meaningZh: "天气暖和/热。", meaningEn: "It is warm." },
  droog: { dutch: "Het is droog.", meaningZh: "天气是干的/没下雨。", meaningEn: "It is dry." },
  druk: { dutch: "Het is druk.", meaningZh: "很忙/人很多。", meaningEn: "It is busy." },
  glad: { dutch: "Het is glad buiten.", meaningZh: "外面很滑。", meaningEn: "It is slippery outside." },
  verplicht: { dutch: "Dit veld is verplicht.", meaningZh: "这个字段是必填的。", meaningEn: "This field is required." },
  beschadigd: { dutch: "Het pakket is beschadigd.", meaningZh: "包裹损坏了。", meaningEn: "The parcel is damaged." },
  beschikbaarheid: { dutch: "Ik controleer de beschikbaarheid.", meaningZh: "我查看可用性。", meaningEn: "I check availability." },
};

function adjectiveOutputSentence(word: WordItem) {
  const key = normalizeWordText(word.dutch);
  const exact = adjectiveOutputSentences[key];
  if (exact) return { ...exact, trustedTargetUse: true };
  const zh = primaryMeaning(word, "zh").replace(/的$/u, "");
  const en = primaryMeaning(word, "en");
  return {
    dutch: `Dat is ${word.dutch}.`,
    meaningZh: `那是${zh}的。`,
    meaningEn: `That is ${en}.`,
    trustedTargetUse: true,
  };
}

function outputFromSafeUsagePhrase(word: WordItem, context: MemoryPathContext) {
  if (classifyMemoryPathWord(word) !== "noun") return undefined;
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const articlePhrase = articleWord(word);
  const key = normalizeWordText(word.dutch);
  const chunks = cleanPhraseChunks(word, context).map((chunk) => chunk.dutch.trim());
  const objectFromPhrase = (rawObject: string) => {
    const object = rawObject.trim();
    if (!object) return "";
    if (normalizeWordText(object) === key) return articlePhrase;
    if (/^(mijn|uw|jouw|zijn|haar|ons|onze|de|het|een|dit|deze|dat|die)\b/i.test(object)) return object;
    return object;
  };
  const actionOutput = (
    rawObject: string,
    dutchFor: (object: string) => string,
    zhVerb: string,
    enVerb: string,
  ) => {
    const object = objectFromPhrase(rawObject);
    if (!object || !textContainsTargetUse(word, object)) return undefined;
    return {
      dutch: dutchFor(object),
      meaningZh: `我${zhVerb}${zh}。`,
      meaningEn: `I ${enVerb} the ${en}.`,
      trustedTargetUse: true,
    };
  };

  for (const phrase of chunks) {
    let match = phrase.match(/^(naar\s+(?:de|het|een)\s+.+)\s+gaan$/i);
    if (match) return { dutch: `Ik ga ${match[1]}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(bij\s+(?:de|het|een)\s+.+)\s+betalen$/i);
    if (match) return { dutch: `Ik betaal ${match[1]}.`, meaningZh: `我在${zh}付款。`, meaningEn: `I pay at the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(met\s+(?:mijn|de|het|een)\s+.+)\s+betalen$/i);
    if (match) return { dutch: `Ik betaal ${match[1]}.`, meaningZh: `我用${zh}付款。`, meaningEn: `I pay with the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^((?:de|het|een)\s+.+)\s+gebruiken$/i);
    if (match) return { dutch: `Ik gebruik ${match[1]}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(met\s+(?:de|het|een)\s+.+)\s+schrijven$/i);
    if (match) return { dutch: `Ik schrijf ${match[1]}.`, meaningZh: `我用${zh}写。`, meaningEn: `I write with the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(aan\s+(?:de|het|een)\s+.+)\s+zitten$/i);
    if (match) return { dutch: `Ik zit ${match[1]}.`, meaningZh: `我坐在${zh}前。`, meaningEn: `I sit at the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(in\s+(?:deze|de|het|een|mijn)\s+.+)\s+wonen$/i);
    if (match) return { dutch: `Ik woon ${match[1]}.`, meaningZh: `我住在${zh}。`, meaningEn: `I live in the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^((?:de|het|een)\s+.+)\s+bewaren$/i);
    if (match) return { dutch: `Ik bewaar ${match[1]}.`, meaningZh: `我保存${zh}。`, meaningEn: `I keep the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^((?:de|het|een)\s+.+)\s+pakken$/i);
    if (match) return { dutch: `Ik pak ${match[1]}.`, meaningZh: `我拿${zh}。`, meaningEn: `I take the ${en}.`, trustedTargetUse: true };

    match = phrase.match(/^(.+)\s+invullen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik vul ${object} in.`, "填写", "fill in");

    match = phrase.match(/^(.+)\s+doorgeven$/i);
    if (match) return actionOutput(match[1], (object) => `Ik geef ${object} door.`, "告知/提交", "pass on");

    match = phrase.match(/^(.+)\s+melden$/i);
    if (match) return actionOutput(match[1], (object) => `Ik meld ${object}.`, "报告", "report");

    match = phrase.match(/^(.+)\s+veranderen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik verander ${object}.`, "更改", "change");

    match = phrase.match(/^(.+)\s+aanvragen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik vraag ${object} aan.`, "申请", "apply for");

    match = phrase.match(/^(.+)\s+controleren$/i);
    if (match) return actionOutput(match[1], (object) => `Ik controleer ${object}.`, "检查", "check");

    match = phrase.match(/^(.+)\s+betalen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik betaal ${object}.`, "支付", "pay");

    match = phrase.match(/^(.+)\s+krijgen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik krijg ${object}.`, "收到", "receive");

    match = phrase.match(/^(.+)\s+nodig hebben$/i);
    if (match) return actionOutput(match[1], (object) => `Ik heb ${object} nodig.`, "需要", "need");

    match = phrase.match(/^(.+)\s+meenemen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik neem ${object} mee.`, "带上", "take");

    match = phrase.match(/^(.+)\s+tonen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik toon ${object}.`, "出示", "show");

    match = phrase.match(/^(.+)\s+lezen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik lees ${object}.`, "阅读", "read");

    match = phrase.match(/^(.+)\s+sturen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik stuur ${object}.`, "发送", "send");

    match = phrase.match(/^(.+)\s+bellen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik bel ${object}.`, "拨打/联系", "call");

    match = phrase.match(/^(.+)\s+bespreken$/i);
    if (match) return actionOutput(match[1], (object) => `Ik bespreek ${object}.`, "讨论", "discuss");

    match = phrase.match(/^(.+)\s+regelen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik regel ${object}.`, "安排", "arrange");

    match = phrase.match(/^(.+)\s+bevestigen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik bevestig ${object}.`, "确认", "confirm");

    match = phrase.match(/^(.+)\s+ophalen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik haal ${object} op.`, "领取", "pick up");

    match = phrase.match(/^(.+)\s+opladen$/i);
    if (match) return actionOutput(match[1], (object) => `Ik laad ${object} op.`, "充值/充电", "top up");

    match = phrase.match(/^wachten op\s+(.+)$/i);
    if (match) return actionOutput(match[1], (object) => `Ik wacht op ${object}.`, "等待", "wait for");

    match = phrase.match(/^(.+)\s+drinken$/i);
    if (match && textContainsTargetUse(word, match[1])) {
      return { dutch: `Ik drink ${match[1]}.`, meaningZh: `我喝${zh}。`, meaningEn: `I drink ${en}.`, trustedTargetUse: true };
    }

    match = phrase.match(/^(.+)\s+wachten$/i);
    if (match && textContainsTargetUse(word, match[1])) {
      return { dutch: `Ik wacht ${match[1]}.`, meaningZh: `我等${zh}。`, meaningEn: `I wait ${en}.`, trustedTargetUse: true };
    }
  }

  return undefined;
}

function nounFallbackSentence(word: WordItem, tags: string) {
  const articlePhrase = articleWord(word);
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const key = normalizeWordText(word.dutch);
  const hasArticle = Boolean(word.article);
  const nounPhrase = hasArticle ? articlePhrase : word.dutch;

  const practical = practicalNounSentence(word);
  if (practical) return practical;

  const broadTopic = broadTopicNounSentence(word, tags);
  if (broadTopic) return broadTopic;

  const safeAbstract = safeAbstractNounSentence(word, tags);
  if (safeAbstract) return safeAbstract;

  if (abstractNounTagPattern.test(tags)) {
    if (/(nummer|termijn|datum|tijd|prijs|bedrag|kosten|premie|huur|borg|dekking|polis|kenmerk|gegevens|informatie)/.test(key)) {
      return { dutch: `Wat is ${hasArticle ? articlePhrase : word.dutch}?`, meaningZh: `${zh}是什么？`, meaningEn: `What is the ${en}?`, trustedTargetUse: true };
    }
    if (/(klacht|probleem|vraag|fout|schade|storing|melding|verzoek|aanvraag|reactie|afspraak)/.test(key)) {
      return { dutch: `Ik heb een ${word.dutch}.`, meaningZh: `我有一个${zh}。`, meaningEn: `I have a ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik regel ${nounPhrase}.`, meaningZh: `我处理${zh}。`, meaningEn: `I arrange the ${en}.`, trustedTargetUse: true };
  }

  if (!hasArticle && !phraseLike(word.dutch)) return undefined;
  if (!concreteNounTagPattern.test(tags) && !word.phraseChunks.some((chunk) => /^de |^het |^een /i.test(chunk))) return undefined;

  if (/(kapper|bakker|slager|dokter|huisarts|tandarts|apotheek|gemeentehuis|ziekenhuis|station|halte|school|kantoor|winkel|supermarkt)/.test(key)) {
    return { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };
  }

  if (/(digital|device|app|website|phone|computer)/.test(tags)) {
    return { dutch: `Ik gebruik ${articlePhrase}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, trustedTargetUse: true };
  }

  const safeHealth = safeHealthNounSentence(word, tags);
  if (safeHealth) return safeHealth;

  if (/(food|supermarket|shopping)/.test(tags)) {
    return { dutch: `Ik koop ${articlePhrase}.`, meaningZh: `我买${zh}。`, meaningEn: `I buy the ${en}.`, trustedTargetUse: true };
  }

  if (/^(honger|dorst|pijn)$/.test(key)) {
    return { dutch: `Ik heb ${word.dutch}.`, meaningZh: `我${zh}。`, meaningEn: `I have ${en}.`, trustedTargetUse: true };
  }

  if (/(naam|postcode|e-mail|email|bsn|nummer|adres|gegevens)$/.test(key) || /(personal|identity)/.test(tags)) {
    if (/(buur|buurt|meneer|mevrouw|baby|jongen|meisje|man|vrouw|kind|persoon)$/.test(key)) {
      return { dutch: `Ik zie ${articlePhrase}.`, meaningZh: `我看到${zh}。`, meaningEn: `I see the ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik vul ${articlePhrase} in.`, meaningZh: `我填写${zh}。`, meaningEn: `I fill in the ${en}.`, trustedTargetUse: true };
  }

  if (/(transport|travel)/.test(tags)) {
    if (/^(bus|trein|tram|metro|taxi|boot|scooter|fiets|auto|vliegtuig)$/.test(key)) {
      return { dutch: `Ik neem ${articlePhrase}.`, meaningZh: `我坐/乘${zh}。`, meaningEn: `I take the ${en}.`, trustedTargetUse: true };
    }
    if (/(kaart|kaartje|ticket|vervoerbewijs|dagkaart|abonnement)$/.test(key)) {
      return { dutch: `Ik heb ${articlePhrase} nodig.`, meaningZh: `我需要${zh}。`, meaningEn: `I need the ${en}.`, trustedTargetUse: true };
    }
    if (/^(spoor|perron)$/.test(key)) {
      return { dutch: `Op welk ${word.dutch} vertrekt de trein?`, meaningZh: `火车从哪个${zh}出发？`, meaningEn: `From which ${en} does the train leave?`, trustedTargetUse: true };
    }
    return { dutch: `Waar is ${articlePhrase}?`, meaningZh: `${zh}在哪里？`, meaningEn: `Where is the ${en}?`, trustedTargetUse: true };
  }

  if (/(school|education|work|office)/.test(tags)) {
    if (/(docent|leraar|chef|leidinggevende|collega|begeleider|deelnemer|cursist|student|medewerker)$/.test(key)) {
      return { dutch: `Ik praat met ${articlePhrase}.`, meaningZh: `我和${zh}谈。`, meaningEn: `I talk with the ${en}.`, trustedTargetUse: true };
    }
    if (/(les|cursus|opleiding|training)$/.test(key)) {
      return { dutch: `Ik volg ${articlePhrase}.`, meaningZh: `我上/参加${zh}。`, meaningEn: `I follow the ${en}.`, trustedTargetUse: true };
    }
    if (/(toets|examen|praktijkexamen|oefentoets)$/.test(key)) {
      return { dutch: `Ik maak ${articlePhrase}.`, meaningZh: `我参加/做${zh}。`, meaningEn: `I take the ${en}.`, trustedTargetUse: true };
    }
    if (/(huiswerk|opdracht|taak)$/.test(key)) {
      return { dutch: `Ik maak ${articlePhrase}.`, meaningZh: `我做${zh}。`, meaningEn: `I do the ${en}.`, trustedTargetUse: true };
    }
    if (/(lokaal|kantoor|school)$/.test(key)) {
      return { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };
    }
    if (key === "groep") {
      return { dutch: "Ik werk in een groep.", meaningZh: "我在小组里工作/学习。", meaningEn: "I work in a group.", trustedTargetUse: true };
    }
    if (key === "pauze") {
      return { dutch: "Ik neem pauze.", meaningZh: "我休息一下。", meaningEn: "I take a break.", trustedTargetUse: true };
    }
    if (/^(werk|baan)$/.test(key)) {
      return { dutch: `Ik heb ${key === "baan" ? "een baan" : "werk"}.`, meaningZh: `我有${zh}。`, meaningEn: `I have ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik werk met ${articlePhrase}.`, meaningZh: `我在工作/学习中接触${zh}。`, meaningEn: `I work with the ${en}.`, trustedTargetUse: true };
  }

  if (/(home|housing|room|rooms|furniture)/.test(tags)) {
    return { dutch: `Ik gebruik ${articlePhrase} thuis.`, meaningZh: `我在家里用到${zh}。`, meaningEn: `I use the ${en} at home.`, trustedTargetUse: true };
  }

  if (/(digital|device|technology)/.test(tags)) {
    return { dutch: `Ik gebruik ${articlePhrase}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, trustedTargetUse: true };
  }

  if (/(kitchen|tableware|bathroom)/.test(tags)) {
    if (key === "afwas") return { dutch: "Ik doe de afwas.", meaningZh: "我洗碗。", meaningEn: "I do the dishes.", trustedTargetUse: true };
    return { dutch: `Ik gebruik ${articlePhrase}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, trustedTargetUse: true };
  }

  if (/(place|places|directions|location)/.test(tags)) {
    return { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, trustedTargetUse: true };
  }

  if (/(school|education|work|office|grammar|language|media|culture|environment)/.test(tags) || /(heid|ing|schap|strategie|tekst|zin|gesprek|argument|zaak|soort|bouw|tempo|fragment|grafiek|graad)$/.test(key)) {
    if (/(tekst|brief|document|dossier|bestand|pagina|recensie|verslag|grafiek|fragment)$/.test(key)) {
      return { dutch: `Ik lees ${articlePhrase}.`, meaningZh: `我读${zh}。`, meaningEn: `I read the ${en}.`, trustedTargetUse: true };
    }
    if (/(zin|aantekening|notitie)$/.test(key)) {
      return { dutch: `Ik schrijf ${articlePhrase}.`, meaningZh: `我写${zh}。`, meaningEn: `I write the ${en}.`, trustedTargetUse: true };
    }
    return { dutch: `Ik let op ${articlePhrase}.`, meaningZh: `我注意${zh}。`, meaningEn: `I pay attention to the ${en}.`, trustedTargetUse: true };
  }

  if (/(nature|city|leisure|hobby)/.test(tags)) {
    return { dutch: `Ik loop langs ${articlePhrase}.`, meaningZh: `我从${zh}旁边经过。`, meaningEn: `I walk past the ${en}.`, trustedTargetUse: true };
  }

  return {
    dutch: `Ik gebruik ${articlePhrase} in een gewone situatie.`,
    meaningZh: `我在普通情境里用到${zh}。`,
    meaningEn: `I use the ${en} in an ordinary situation.`,
    trustedTargetUse: true,
  };
}

function outputFromSentenceLikePhrase(word: WordItem, context: MemoryPathContext) {
  const sentenceChunk = cleanPhraseChunks(word, context).find((chunk) =>
    /^(Ik|Jij|Je|U|Hij|Zij|Ze|Wij|We|De|Het|Mijn|Uw|Dit|Dat|Er|Kan|Kunt|Mag|Moet|Waar|Wat|Hoe)\b/.test(chunk.dutch.trim()),
  );
  if (!sentenceChunk?.dutch) return undefined;

  const dutch = /[.!?]$/.test(sentenceChunk.dutch.trim()) ? sentenceChunk.dutch.trim() : `${sentenceChunk.dutch.trim()}.`;
  if (normalizeChunkText(dutch) === normalizeChunkText(word.dutch)) return undefined;
  const sameAsWordExample = normalizeChunkText(dutch) === normalizeChunkText(word.exampleSentence.dutch);
  const meaningZh = sentenceChunk.meaningZh || (sameAsWordExample ? word.exampleSentence.meaning.zh : "");
  const meaningEn = sentenceChunk.meaningEn || (sameAsWordExample ? word.exampleSentence.meaning.en : "");
  if (!meaningZh || !meaningEn) return undefined;
  return { dutch, meaningZh, meaningEn, trustedTargetUse: true };
}

function scenarioOutputSentenceFor(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  const exact = exactScenarioOutputs[key];
  if (exact && !isBowlKom(word)) return { ...exact, trustedTargetUse: true };

  const earlyWordType = classifyMemoryPathWord(word);
  if (earlyWordType === "noun") {
    const practical = practicalNounSentence(word);
    if (practical) return practical;
  }

  const fromPhrase = outputFromSentenceLikePhrase(word, context);
  if (fromPhrase && isUsableOutput(word, fromPhrase) && !isWeakGenericOutput(fromPhrase.dutch)) return fromPhrase;

  const wordType = earlyWordType;
  const tags = [word.theme, ...word.scenarioTags].map(normalizeWordText).join(" ");
  const zh = primaryMeaning(word, "zh");
  const en = primaryMeaning(word, "en");
  const articlePhrase = articleWord(word);

  if (wordType === "phrase" || wordType === "verb") {
    const fromTemplate = outputFromTemplateExample(word);
    if (fromTemplate) return fromTemplate;
  }

  if (wordType === "language-name") {
    const language = capitalizedDutch(word.dutch);
    return {
      dutch: `Ik spreek ${language}.`,
      meaningZh: `我说${zh}。`,
      meaningEn: `I speak ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "country-name") {
    const country = capitalizedDutch(word.dutch);
    return {
      dutch: `Ik kom uit ${country}.`,
      meaningZh: `我来自${zh}。`,
      meaningEn: `I come from ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "phrase") {
    const phraseSentence = sentenceFromPhraseWord(word);
    if (phraseSentence) return phraseSentence;
  }

  if (wordType === "verb") {
    const verb = verbUsageFor(word);
    const ikForm = verb?.ikForm.split("/")[0]?.trim();
    if (ikForm) {
      const dutch = /^ik\b/i.test(ikForm) ? `${capitalizedDutch(ikForm)}.` : `Ik ${ikForm}.`;
      return {
        dutch,
        meaningZh: `我${zh}。`,
        meaningEn: `I ${en}.`,
        trustedTargetUse: true,
      };
    }
  }

  if (wordType === "adjective") {
    return adjectiveOutputSentence(word);
  }

  if (wordType === "adverb") {
    return {
      dutch: `Ik kom ${word.dutch}.`,
      meaningZh: `我${zh}来。`,
      meaningEn: `I come ${en}.`,
      trustedTargetUse: true,
    };
  }

  if (wordType === "noun") {
    const practical = practicalNounSentence(word);
    if (practical) return practical;
    const fromTemplate = outputFromTemplateExample(word);
    if (fromTemplate) return fromTemplate;
    const fromUsagePhrase = outputFromSafeUsagePhrase(word, context);
    if (fromUsagePhrase && isUsableOutput(word, fromUsagePhrase) && !isWeakGenericOutput(fromUsagePhrase.dutch)) return fromUsagePhrase;
    const broadTopic = broadTopicNounSentence(word, tags);
    if (broadTopic) return broadTopic;
    const safeAbstract = safeAbstractNounSentence(word, tags);
    if (safeAbstract) return safeAbstract;
    const safeHealth = safeHealthNounSentence(word, tags);
    if (safeHealth) return safeHealth;
    if (tags.includes("food") || tags.includes("supermarket")) {
      return { dutch: `Ik koop ${articlePhrase}.`, meaningZh: `我买${zh}。`, meaningEn: `I buy the ${en}.`, trustedTargetUse: true };
    }
    if (tags.includes("clothes")) {
      return { dutch: `Ik draag ${articlePhrase}.`, meaningZh: `我穿/戴${zh}。`, meaningEn: `I wear the ${en}.`, trustedTargetUse: true };
    }
    if (tags.includes("money") || tags.includes("payment")) {
      if (["pinpas", "bankpas", "creditcard"].includes(key)) {
        return { dutch: `Ik betaal met ${articlePhrase}.`, meaningZh: `我用${zh}付款。`, meaningEn: `I pay with the ${en}.`, trustedTargetUse: true };
      }
      return { dutch: `Ik betaal ${articlePhrase}.`, meaningZh: `我支付${zh}。`, meaningEn: `I pay the ${en}.`, trustedTargetUse: true };
    }
    if (tags.includes("time")) {
      if (word.article) return { dutch: `Wat is ${articlePhrase}?`, meaningZh: `${zh}是什么？`, meaningEn: `What is the ${en}?`, trustedTargetUse: true };
      return undefined;
    }
    return nounFallbackSentence(word, tags);
  }

  return undefined;
}

function outputSentenceFor(word: WordItem, context: MemoryPathContext) {
  const key = normalizeWordText(word.dutch);
  if (classifyMemoryPathWord(word) === "noun") {
    const practical = practicalNounSentence(word);
    if (practical) return practical;
  }
  const fixed = isBowlKom(word) ? undefined : fixedOutputSentences[key];
  if (fixed && isUsableCuratedOutput(fixed) && !isWeakGenericOutput(fixed.dutch)) return fixed;
  const exact = isBowlKom(word) ? undefined : exactScenarioOutputs[key];
  if (exact && isUsableCuratedOutput(exact) && !isWeakGenericOutput(exact.dutch)) return { ...exact, trustedTargetUse: true };
  const scenario = scenarioOutputSentenceFor(word, context);
  if (scenario && isUsableOutput(word, scenario) && !isWeakGenericOutput(scenario.dutch)) return scenario;
  const candidates = generatedSentenceCandidates(word, context);
  const nonGeneric = candidates.find((sentence) => !isWeakGenericOutput(sentence.dutch));
  if (nonGeneric) return nonGeneric;
  return undefined;
}

function dynamicBreakdownFor(word: WordItem, allWords: WordItem[], mode: "all" | "lexicon-only" | "safe-only" = "all"): SeededBreakdown | undefined {
  const key = normalizeWordText(word.dutch);
  const parts = mode === "safe-only"
    ? safeCompoundPartsFor(word, allWords)
    : relationLexicons.compoundParts[key] ?? (mode === "lexicon-only" ? undefined : safeCompoundPartsFor(word, allWords));
  if (!parts || parts.length < 2) return undefined;
  const breakdownParts = parts
    .map((part) => {
      const meaning = lexicalMeaningFor(part, allWords);
      if (!meaning) return undefined;
      return {
        dutch: part,
        meaningZh: meaning.zh,
        meaningEn: meaning.en,
      };
    })
    .filter(Boolean) as SeededBreakdown["parts"];
  if (breakdownParts.length < 2) return undefined;
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const partsZh = breakdownParts.map((part) => `${part.dutch}=${part.meaningZh}`).join(" + ");
  const partsEn = breakdownParts.map((part) => `${part.dutch}=${part.meaningEn}`).join(" + ");
  return {
    parts: breakdownParts,
    noteZh: `${partsZh}，合起来就是「${meaningZh}」。`,
    noteEn: `${partsEn}; together they mean "${meaningEn}".`,
  };
}

const compoundConnectors = ["", "s", "e", "en", "er"];

function safeCompoundPartsFor(word: WordItem, allWords: WordItem[]) {
  if (classifyMemoryPathWord(word) === "verb") return undefined;
  const key = normalizeWordText(word.dutch);
  if (key.length < 6 || key.includes(" ")) return undefined;

  const wordKeys = allWords
    .map((item) => normalizeWordText(item.dutch))
    .filter((item) => item.length >= 3 && !item.includes(" "));
  const knownParts = new Set([
    ...Object.keys(relationLexicons.baseMorphemes),
    ...relationLexicons.knownMorphemes,
    ...wordKeys,
  ]);
  const hasMeaning = (part: string) => Boolean(lexicalMeaningFor(part, allWords));
  const candidates: string[][] = [];

  for (let split = 3; split <= key.length - 3; split += 1) {
    for (const connector of compoundConnectors) {
      const rightStart = split + connector.length;
      if (rightStart > key.length - 3) continue;
      if (connector && key.slice(split, rightStart) !== connector) continue;
      const left = key.slice(0, split);
      const right = key.slice(rightStart);
      if (left === right && left.length < 5) continue;
      if (!knownParts.has(left) || !knownParts.has(right)) continue;
      if (!hasMeaning(left) || !hasMeaning(right)) continue;
      candidates.push([left, right]);
    }
  }

  return candidates
    .sort((a, b) => {
      const meaningScore = (parts: string[]) => parts.filter((part) => relationLexicons.baseMorphemes[part]).length;
      const scoreDiff = meaningScore(b) - meaningScore(a);
      if (scoreDiff) return scoreDiff;
      return b.join("").length - a.join("").length;
    })[0];
}

function englishBridgeFor(word: WordItem) {
  const key = normalizeWordText(word.dutch);
  const seeded = englishBridgeSeeds[key];
  if (seeded) {
    const semanticText = `${word.meaning.zh} ${word.meaning.en}`.toLowerCase();
    const seedMatchesWord = key !== "kom" || (!isBowlKom(word) && /来|来自|\bcome\b|coming/.test(semanticText));
    if (seedMatchesWord) return withEnglishBridgeDifference(word, seeded);
  }
  const primaryEnglish = normalizeWordText(word.meaning.en.split(/[\/,;]/)[0] ?? "");
  const dynamic = dynamicEnglishBridgeFor(word, key);
  if (dynamic) return withEnglishBridgeDifference(word, dynamic);
  if (!word.englishBridge?.trim()) return undefined;
  const looksLikeMeaning =
    primaryEnglish.length >= 3 &&
    (
      key === primaryEnglish ||
      key.startsWith(primaryEnglish.slice(0, 4)) ||
      primaryEnglish.startsWith(key.slice(0, 4))
    );
  if (!looksLikeMeaning) return undefined;
  if (/sounds like|谐音|听起来像/i.test(word.englishBridge)) return undefined;
  return withEnglishBridgeDifference(word, {
    bridge: word.englishBridge,
    noteZh: bridgeShapeNote(word, primaryEnglish).zh,
    noteEn: bridgeShapeNote(word, primaryEnglish).en,
  });
}

function bridgeShapeNote(word: WordItem, english: string, isVerbInfinitive = false) {
  const key = normalizeWordText(word.dutch);
  const normalizedEnglish = normalizeBridgeToken(english);
  const article = word.article ? `${word.article} ${word.dutch}` : word.dutch;
  const plural = word.plural ? `，复数 ${word.plural}` : "";
  const dutchAnchor = word.article
    ? `在荷兰语里连冠词一起记 ${article}${plural}`
    : `实际使用时按荷兰语发音和用法走`;

  if (normalizedEnglish === key) {
    return {
      zh: `${word.dutch} 和英文 ${english} 同拼写；别按英文意思/发音死记，${dutchAnchor}。`,
      en: `${word.dutch} has the same spelling as English ${english}; do not memorize it only by the English meaning or sound, and ${word.article ? `anchor it as ${article}${word.plural ? `, plural ${word.plural}` : ""}` : "use the Dutch pronunciation and usage in sentences"}.`,
    };
  }

  const diffIndexes = normalizedEnglish.length === key.length
    ? normalizedEnglish.split("").flatMap((char, index) => char === key[index] ? [] : [index])
    : [];
  if (diffIndexes.length === 1) {
    const index = diffIndexes[0];
    return {
      zh: `${english} 只换一处：${normalizedEnglish[index]}→${key[index]}，荷兰语 ${word.dutch}。`,
      en: `${english} changes one letter: ${normalizedEnglish[index]}→${key[index]}, giving Dutch ${word.dutch}.`,
    };
  }

  const variantNote = englishBridgeVariantNote(english, key, word.dutch);
  if (variantNote) return variantNote;

  if (normalizedEnglish && key.startsWith(normalizedEnglish) && key.length > normalizedEnglish.length) {
    const suffix = key.slice(normalizedEnglish.length);
    return {
      zh: `${english} 接上荷兰语尾巴 ${suffix}，变 ${word.dutch}。`,
      en: `${english} takes the Dutch tail ${suffix}, becoming ${word.dutch}.`,
    };
  }

  if (normalizedEnglish && normalizedEnglish.startsWith(key) && normalizedEnglish.length > key.length) {
    const suffix = normalizedEnglish.slice(key.length);
    return {
      zh: `${english} 去掉英文尾巴 ${suffix}，荷兰语写作 ${word.dutch}。`,
      en: `${english} drops the English ending ${suffix}; Dutch writes it as ${word.dutch}.`,
    };
  }

  if (isVerbInfinitive) {
    return {
      zh: `${english} 给动作意思；荷兰语完整动词是 ${word.dutch}，尾巴带 -en。`,
      en: `${english} gives the action; the full Dutch verb is ${word.dutch}, with the -en tail.`,
    };
  }

  return {
    zh: `${english} 和 ${word.dutch} 对得上；记住荷兰语写法 ${word.dutch}。`,
    en: `${english} maps to ${word.dutch}; keep the Dutch spelling ${word.dutch}.`,
  };
}

function withEnglishBridgeDifference(word: WordItem, bridge: EnglishBridgeSeed): EnglishBridgeSeed {
  if (bridge.differenceZh && bridge.differenceEn) return bridge;
  const key = normalizeWordText(word.dutch);
  const bridgeText = `${bridge.bridge} ${bridge.noteZh} ${bridge.noteEn}`;
  const meaningZh = shortMeaningZh(primaryMeaning(word, "zh"));
  const meaningEn = shortMeaningEn(primaryMeaning(word, "en"));
  const englishToken = (
    bridge.bridge.split(/≈|=|->|→/).pop() ??
    primaryMeaning(word, "en")
  ).replace(/English/i, "").trim().split(/\s+|\/|,/)[0] ?? "";
  const cleanEnglishToken = englishToken.replace(/[^a-zA-Z-]/g, "");
  const englishLabel = cleanEnglishToken || meaningEn;

  if (/controleren|agenda|not only|不只|更常|日常/i.test(bridgeText)) {
    return {
      ...bridge,
      differenceZh: bridge.noteZh,
      differenceEn: bridge.noteEn,
    };
  }

  if (/het kind|de man|复数|plural|article|冠词/i.test(bridgeText) || word.article || word.plural) {
    const article = word.article ? `${word.article} ${word.dutch}` : word.dutch;
    const plural = word.plural ? `，复数 ${word.plural}` : "";
    return {
      ...bridge,
      differenceZh: `荷兰语形式：${article}${plural}。`,
      differenceEn: `In Dutch, anchor it as ${article}${word.plural ? `, plural ${word.plural}` : ""}.`,
    };
  }

  if (key.endsWith("en") && key.length > 4) {
    return {
      ...bridge,
      differenceZh: `${englishLabel} 给动作意思；荷兰语完整形是 ${word.dutch}。`,
      differenceEn: `${englishLabel} gives the action; the Dutch infinitive is ${word.dutch}.`,
    };
  }

  const bridgeHasLink = /[≈=]/.test(bridge.bridge);
  const normalizedEnglish = normalizeBridgeToken(cleanEnglishToken);
  if (bridgeHasLink && normalizedEnglish && normalizedEnglish !== key) {
    const firstDiffIndex = Array.from({ length: Math.min(normalizedEnglish.length, key.length) }, (_, index) => index)
      .find((index) => normalizedEnglish[index] !== key[index]);
    const singleLetterSwap =
      normalizedEnglish.length === key.length &&
      firstDiffIndex !== undefined &&
      normalizedEnglish.split("").filter((char, index) => char !== key[index]).length === 1;
    if (singleLetterSwap) {
      const englishChar = normalizedEnglish[firstDiffIndex];
      const dutchChar = key[firstDiffIndex];
      return {
        ...bridge,
        differenceZh: `区别卡 ${englishChar}/${dutchChar}：English ${englishLabel}，荷兰语 ${word.dutch}。`,
        differenceEn: `The difference is ${englishChar}/${dutchChar}: English ${englishLabel}, Dutch ${word.dutch}.`,
      };
    }
    return {
      ...bridge,
      differenceZh: `英文给线索，写法固定为荷兰语 ${word.dutch}。`,
      differenceEn: `English gives the clue; the spelling is Dutch ${word.dutch}.`,
    };
  }

  return bridge;
}

function normalizeBridgeToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function englishMeaningCandidates(word: WordItem) {
  const fromMeaning = word.meaning.en
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .split(/[\/,;]|\bor\b/)
    .map((part) => part.trim())
    .filter((part) => part && !part.includes(" "))
    .map(normalizeBridgeToken)
    .filter((part) => part.length >= 3);

  return fromMeaning
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .slice(0, 4);
}

function dutchBridgeCandidates(key: string) {
  const normalized = normalizeBridgeToken(key);
  const forms = [normalized];
  if (normalized.endsWith("en") && normalized.length > 4) forms.push(normalized.slice(0, -2));
  if (normalized.endsWith("t") && normalized.length > 4) forms.push(normalized.slice(0, -1));
  return forms.filter((form, index) => form.length >= 3 && forms.indexOf(form) === index);
}

type EnglishBridgeTransform = {
  value: string;
  kind: "ck-k" | "c-k" | "y-j" | "f-v" | "s-z" | "th-d" | "ph-f" | "tion-tie" | "y-ie" | "i-ie" | "oo-oe" | "ee-ie" | "compound-spelling";
};

function englishToDutchVariantTransforms(english: string): EnglishBridgeTransform[] {
  const normalized = normalizeBridgeToken(english);
  const forms = new Map<string, EnglishBridgeTransform["kind"]>();
  const add = (value: string, kind: EnglishBridgeTransform["kind"]) => {
    if (value.length >= 3 && value !== normalized && !forms.has(value)) forms.set(value, kind);
  };
  const rules: Array<{ kind: Exclude<EnglishBridgeTransform["kind"], "compound-spelling">; apply: (value: string) => string }> = [
    { kind: "ck-k", apply: (value) => value.replace(/ck/g, "k") },
    { kind: "c-k", apply: (value) => value.replace(/c(?=[aou]|[lr]|t|$)/g, "k").replace(/ss$/g, "s") },
    { kind: "y-j", apply: (value) => value.replace(/^y/g, "j") },
    { kind: "f-v", apply: (value) => value.replace(/^f/g, "v") },
    { kind: "s-z", apply: (value) => value.replace(/^s/g, "z") },
    { kind: "th-d", apply: (value) => value.replace(/th/g, "d") },
    { kind: "ph-f", apply: (value) => value.replace(/ph/g, "f") },
    { kind: "tion-tie", apply: (value) => value.replace(/tion$/g, "tie") },
    { kind: "y-ie", apply: (value) => value.replace(/y$/g, "ie") },
    { kind: "i-ie", apply: (value) => value.replace(/i(?=(?:c|k|ck)$)/g, "ie") },
    { kind: "oo-oe", apply: (value) => value.replace(/oo/g, "oe") },
    { kind: "ee-ie", apply: (value) => value.replace(/ee/g, "ie") },
  ];

  const queue: Array<{ value: string; depth: number }> = [{ value: normalized, depth: 0 }];
  const seen = new Set([normalized]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.depth >= 3) continue;
    for (const rule of rules) {
      const next = rule.apply(current.value);
      if (
        next === current.value ||
        next.length < 3 ||
        next.length > normalized.length + 3 ||
        seen.has(next)
      ) {
        continue;
      }
      seen.add(next);
      add(next, current.depth === 0 ? rule.kind : "compound-spelling");
      queue.push({ value: next, depth: current.depth + 1 });
    }
  }
  return Array.from(forms, ([value, kind]) => ({ value, kind }));
}

function englishToDutchVariants(english: string) {
  return englishToDutchVariantTransforms(english).map((transform) => transform.value);
}

function englishBridgeVariantNote(english: string, dutchKey: string, dutchWord: string) {
  const transform = englishToDutchVariantTransforms(english).find((candidate) => candidate.value === dutchKey);
  if (!transform) return undefined;
  if (transform.kind === "compound-spelling") {
    const normalizedEnglish = normalizeBridgeToken(english);
    const changes: string[] = [];
    const changesEn: string[] = [];
    if (normalizedEnglish.startsWith("s") && dutchKey.startsWith("z")) {
      changes.push("开头 s 对荷兰语 z");
      changesEn.push("initial s corresponds to Dutch z");
    }
    if (normalizedEnglish.startsWith("f") && dutchKey.startsWith("v")) {
      changes.push("开头 f 对荷兰语 v");
      changesEn.push("initial f corresponds to Dutch v");
    }
    if (normalizedEnglish.includes("ck") && dutchKey.includes("k")) {
      changes.push("ck 收成 k");
      changesEn.push("ck becomes k");
    }
    if (normalizedEnglish.includes("oo") && dutchKey.includes("oe")) {
      changes.push("oo 对荷兰语 oe");
      changesEn.push("oo corresponds to Dutch oe");
    }
    if (normalizedEnglish.includes("ee") && dutchKey.includes("ie")) {
      changes.push("ee 对荷兰语 ie");
      changesEn.push("ee corresponds to Dutch ie");
    }
    if (normalizedEnglish.includes("i") && dutchKey.includes("ie")) {
      changes.push("i 拉成荷兰语 ie");
      changesEn.push("i becomes Dutch ie");
    }
    if (changes.length) {
      return {
        zh: `${english} 给入口；${changes.join("，")}：${english}→${dutchWord}。别照英文拼或读。`,
        en: `${english} gives the entry point; ${changesEn.join(", ")}: ${english}->${dutchWord}. Do not spell or pronounce it as English.`,
      };
    }
  }
  const notes: Record<EnglishBridgeTransform["kind"], { zh: string; en: string }> = {
    "ck-k": {
      zh: `${english} 里的 ck 到荷兰语常写成 k：${english}→${dutchWord}。`,
      en: `The ck in ${english} is often written as Dutch k: ${english}->${dutchWord}.`,
    },
    "c-k": {
      zh: `${english} 里的硬 c 到荷兰语常写成 k：${english}→${dutchWord}。`,
      en: `The hard c in ${english} often becomes Dutch k: ${english}->${dutchWord}.`,
    },
    "y-j": {
      zh: `${english} 开头的 y 到荷兰语常变 j：${english}→${dutchWord}。`,
      en: `Initial y in ${english} often becomes Dutch j: ${english}->${dutchWord}.`,
    },
    "f-v": {
      zh: `${english} 开头的 f 到荷兰语可对应 v：${english}→${dutchWord}。`,
      en: `Initial f in ${english} can correspond to Dutch v: ${english}->${dutchWord}.`,
    },
    "s-z": {
      zh: `${english} 开头的 s 到荷兰语可对应 z：${english}→${dutchWord}。`,
      en: `Initial s in ${english} can correspond to Dutch z: ${english}->${dutchWord}.`,
    },
    "th-d": {
      zh: `${english} 里的 th 到荷兰语常落成 d：${english}→${dutchWord}。`,
      en: `The th in ${english} often lands as Dutch d: ${english}->${dutchWord}.`,
    },
    "ph-f": {
      zh: `${english} 里的 ph 到荷兰语常写成 f：${english}→${dutchWord}。`,
      en: `The ph in ${english} often becomes Dutch f: ${english}->${dutchWord}.`,
    },
    "tion-tie": {
      zh: `${english} 的 -tion 到荷兰语常对应 -tie：${english}→${dutchWord}。`,
      en: `English -tion often corresponds to Dutch -tie: ${english}->${dutchWord}.`,
    },
    "y-ie": {
      zh: `${english} 末尾的 y 到荷兰语常写成 ie：${english}→${dutchWord}。`,
      en: `Final y in ${english} often becomes Dutch ie: ${english}->${dutchWord}.`,
    },
    "i-ie": {
      zh: `${english} 里的 i 到荷兰语可写成 ie：${english}→${dutchWord}。`,
      en: `The i in ${english} can be written as Dutch ie: ${english}->${dutchWord}.`,
    },
    "oo-oe": {
      zh: `${english} 里的 oo 对到荷兰语 oe：${english}→${dutchWord}，按荷兰语 oe 读。`,
      en: `The oo in ${english} corresponds to Dutch oe: ${english}->${dutchWord}; pronounce the Dutch oe.`,
    },
    "ee-ie": {
      zh: `${english} 里的 ee 对到荷兰语 ie：${english}→${dutchWord}，按荷兰语 ie 读。`,
      en: `The ee in ${english} corresponds to Dutch ie: ${english}->${dutchWord}; pronounce the Dutch ie.`,
    },
    "compound-spelling": {
      zh: `${english} 给入口；荷兰语把几个拼写/读音点一起换成 ${dutchWord}，别照英文拼或读。`,
      en: `${english} gives the entry point; Dutch changes several spelling/pronunciation points into ${dutchWord}.`,
    },
  };
  return notes[transform.kind];
}

function boundedEditDistance(a: string, b: string, maxDistance: number) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function isSafeEnglishBridgeMatch(dutchForm: string, english: string) {
  if (dutchForm === english) return true;
  if (englishToDutchVariants(english).includes(dutchForm)) return true;
  if (dutchForm.endsWith("e") && dutchForm.slice(0, -1) === english) return true;
  if (dutchForm.endsWith("ie") && english.endsWith("y") && dutchForm.slice(0, -2) === english.slice(0, -1)) return true;
  if (dutchForm.length >= 4 && english.length >= 4) {
    if (dutchForm.startsWith(english.slice(0, 4)) || english.startsWith(dutchForm.slice(0, 4))) return true;
  }
  if (dutchForm[0] !== english[0]) return false;
  if (Math.min(dutchForm.length, english.length) >= 3 && boundedEditDistance(dutchForm, english, 1) <= 1) return true;
  if (Math.min(dutchForm.length, english.length) >= 4 && boundedEditDistance(dutchForm, english, 2) <= 2) return true;
  return false;
}

function dynamicEnglishBridgeFor(word: WordItem, key: string): EnglishBridgeSeed | undefined {
  const english = englishMeaningCandidates(word).find((candidate) =>
    dutchBridgeCandidates(key).some((form) => isSafeEnglishBridgeMatch(form, candidate)),
  );
  if (!english) return undefined;
  const isVerbInfinitive = classifyMemoryPathWord(word) === "verb" && key.endsWith("en");
  const note = bridgeShapeNote(word, english, isVerbInfinitive);
  return {
    bridge: `${word.dutch} ≈ ${english}`,
    noteZh: note.zh,
    noteEn: note.en,
  };
}

function meaningContrastFor(word: WordItem, allWords: WordItem[]): MeaningContrast | undefined {
  const key = normalizeWordText(word.dutch);
  const group = relationLexicons.synonyms.find((items) => items.some((item) => normalizeWordText(item) === key));
  if (!group) return undefined;
  const peers = group
    .filter((item) => normalizeWordText(item) !== key)
    .map((item) => {
      const meaning = lexicalMeaningFor(item, allWords);
      if (!meaning) return undefined;
      return {
        dutch: item,
        meaningZh: meaning.zh,
        meaningEn: meaning.en,
      };
    })
    .filter(Boolean) as MemoryPathPart[];
  const usefulPeers = peers.slice(0, 3);
  if (usefulPeers.length < 2) return undefined;
  const peerWords = usefulPeers.map((peer) => peer.dutch).join(" / ");
  const seeded = meaningContrastNotes[key];
  return {
    peers: usefulPeers,
    comparisonZh: seeded?.comparisonZh ?? `${word.dutch} ≈ ${peerWords}`,
    comparisonEn: seeded?.comparisonEn ?? `${word.dutch} ≈ ${peerWords}`,
    noteZh: seeded?.noteZh ?? `${word.dutch} 和 ${peerWords} 词义相近，核心差别看语气和使用范围。`,
    noteEn: seeded?.noteEn ?? `${word.dutch} belongs near ${peerWords} in dictionary meaning; learn the meaning range, not a sound trick.`,
  };
}

const weekdayOrder: Record<string, { zh: string; en: string; nextZh: string; nextEn: string }> = {
  maandag: { zh: "周一", en: "Monday", nextZh: "dinsdag", nextEn: "Tuesday" },
  dinsdag: { zh: "周二", en: "Tuesday", nextZh: "woensdag", nextEn: "Wednesday" },
  woensdag: { zh: "周三", en: "Wednesday", nextZh: "donderdag", nextEn: "Thursday" },
  donderdag: { zh: "周四", en: "Thursday", nextZh: "vrijdag", nextEn: "Friday" },
  vrijdag: { zh: "周五", en: "Friday", nextZh: "zaterdag", nextEn: "Saturday" },
  zaterdag: { zh: "周六", en: "Saturday", nextZh: "zondag", nextEn: "Sunday" },
  zondag: { zh: "周日", en: "Sunday", nextZh: "maandag", nextEn: "Monday" },
};

const monthOrder: Record<string, { zh: string; en: string; index: number; sceneZh: string; sceneEn: string }> = {
  januari: { zh: "一月", en: "January", index: 1, sceneZh: "新年、合同起始、年度账单", sceneEn: "new year, contract starts, annual bills" },
  februari: { zh: "二月", en: "February", index: 2, sceneZh: "短月、付款周期、预约日期", sceneEn: "short month, payment cycle, appointments" },
  maart: { zh: "三月", en: "March", index: 3, sceneZh: "春天开头、搬家和新安排", sceneEn: "start of spring, moving, new plans" },
  april: { zh: "四月", en: "April", index: 4, sceneZh: "春季安排、学校假期、账单", sceneEn: "spring plans, school holidays, bills" },
  mei: { zh: "五月", en: "May", index: 5, sceneZh: "假期、工资、春末安排", sceneEn: "holidays, salary, late-spring plans" },
  juni: { zh: "六月", en: "June", index: 6, sceneZh: "年中、暑假前、续约", sceneEn: "midyear, before summer, renewals" },
  juli: { zh: "七月", en: "July", index: 7, sceneZh: "暑假、旅行、学校安排", sceneEn: "summer holiday, travel, school plans" },
  augustus: { zh: "八月", en: "August", index: 8, sceneZh: "暑假尾巴、新学期前", sceneEn: "end of summer holiday, before school starts" },
  september: { zh: "九月", en: "September", index: 9, sceneZh: "新学期、课程、租房", sceneEn: "new school year, courses, housing" },
  oktober: { zh: "十月", en: "October", index: 10, sceneZh: "秋季安排、保险比较", sceneEn: "autumn plans, insurance comparison" },
  november: { zh: "十一月", en: "November", index: 11, sceneZh: "保险切换、年底信件", sceneEn: "insurance switching, end-year letters" },
  december: { zh: "十二月", en: "December", index: 12, sceneZh: "年底、假期、年度结算", sceneEn: "year end, holidays, annual settlement" },
};

const timeUnitDetails: Record<string, CategoryMemoryDetails> = {
  dag: {
    titleZh: "一天这个单位",
    titleEn: "Day Unit",
    explanationZh: "dag 是“天/日”，也能当简短问候；看语境分清。",
    explanationEn: "dag means day, and can also be a short greeting/goodbye; read it by context.",
    hookZh: "dag既是一天也能打招呼",
    hookEn: "dag can be a day or a greeting.",
    usageZh: "日期、每天一次、见面或离开时的 dag。",
    usageEn: "dates, once per day, and dag as hello/bye.",
    warningZh: "een dag 是一天；单独 Dag! 常是你好/再见。",
    warningEn: "een dag is a day; Dag! alone often means hello/bye.",
  },
  week: {
    titleZh: "一周时间块",
    titleEn: "Week Block",
    explanationZh: "week 是 7 天一组；deze week 本周，volgende week 下周。",
    explanationEn: "week is a seven-day block: deze week this week, volgende week next week.",
    hookZh: "week不是日期，是7天一组",
    hookEn: "week is not a date; it is a seven-day block.",
    usageZh: "这周、下周、每周、课程和预约安排。",
    usageEn: "this week, next week, every week, lessons and appointments.",
  },
  maand: {
    titleZh: "一个月周期",
    titleEn: "Month Cycle",
    explanationZh: "maand 是一个月；deze maand 这个月，per maand 按月。",
    explanationEn: "maand is a month: deze maand this month, per maand per month.",
    hookZh: "maand常跟房租账单走",
    hookEn: "maand often walks with rent and bills.",
    usageZh: "房租、工资、保险、按月付款。",
    usageEn: "rent, salary, insurance, monthly payment.",
  },
  jaar: {
    titleZh: "年度周期",
    titleEn: "Year Cycle",
    explanationZh: "jaar 管年份和“一年”；dit jaar 今年，per jaar 按年。",
    explanationEn: "jaar means year or a year: dit jaar this year, per jaar per year.",
    hookZh: "jaar管年份和一年周期",
    hookEn: "jaar covers the year number and the annual cycle.",
    usageZh: "出生年份、今年、按年费用、年度计划。",
    usageEn: "birth year, this year, yearly costs, annual plans.",
  },
};

const relativeTimeDetails: Record<string, CategoryMemoryDetails> = {
  gisteren: {
    titleZh: "时间轴定位",
    titleEn: "Timeline Position",
    explanationZh: "gisteren 是昨天；常放句首或动词后，不需要硬凑词块。",
    explanationEn: "gisteren means yesterday; it can stand at the front or after the verb without a forced chunk.",
    hookZh: "gisteren=时间轴退一格",
    hookEn: "gisteren is one step back on the timeline.",
    usageZh: "讲昨天发生的事、请假、电话、付款。",
    usageEn: "what happened yesterday, sick leave, calls, payments.",
  },
  vandaag: {
    titleZh: "时间轴定位",
    titleEn: "Timeline Position",
    explanationZh: "vandaag 是今天；直接钉住当前这一天。",
    explanationEn: "vandaag means today; it pins the current day.",
    hookZh: "vandaag=时间轴正中间",
    hookEn: "vandaag is the middle slot on the timeline.",
    usageZh: "今天来、今天付款、今天有预约。",
    usageEn: "coming today, paying today, appointments today.",
  },
  morgen: {
    titleZh: "时间词义对比",
    titleEn: "Time Meaning Contrast",
    explanationZh: "morgen 单独常是明天；在 goedemorgen 里是早上。",
    explanationEn: "morgen alone often means tomorrow; in goedemorgen it means morning.",
    hookZh: "morgen单独常是明天",
    hookEn: "morgen alone is usually tomorrow.",
    usageZh: "明天见、明天来、也出现在早安里。",
    usageEn: "see you tomorrow, coming tomorrow, and good morning.",
    warningZh: "Tot morgen 是明天见；Goedemorgen 是早上好。",
    warningEn: "Tot morgen means see you tomorrow; Goedemorgen means good morning.",
  },
  overmorgen: {
    titleZh: "时间轴定位",
    titleEn: "Timeline Position",
    explanationZh: "overmorgen 是跨过 morgen 之后的那天，也就是后天。",
    explanationEn: "overmorgen is the day over/after morgen: the day after tomorrow.",
    hookZh: "跨过morgen到后天",
    hookEn: "Jump over morgen to the day after tomorrow.",
    usageZh: "改约到后天、后天再来。",
    usageEn: "reschedule to the day after tomorrow, come back then.",
  },
  straks: {
    titleZh: "时间节奏",
    titleEn: "Time Urgency",
    explanationZh: "straks 是“等下/一会儿”，通常还在今天这条时间线上。",
    explanationEn: "straks means soon / later today, usually still on today's timeline.",
    hookZh: "straks=今天稍后再说",
    hookEn: "straks means later today.",
    usageZh: "一会儿来、一会儿打电话、稍后处理。",
    usageEn: "come soon, call later, handle it shortly.",
  },
  meteen: {
    titleZh: "时间节奏",
    titleEn: "Time Urgency",
    explanationZh: "meteen 是“马上/立刻”，中间不等。",
    explanationEn: "meteen means immediately, with no waiting gap.",
    hookZh: "meteen=现在立刻动",
    hookEn: "meteen means move now, immediately.",
    usageZh: "马上来、马上付款、马上处理。",
    usageEn: "come immediately, pay immediately, handle immediately.",
  },
  later: {
    titleZh: "时间节奏",
    titleEn: "Time Urgency",
    explanationZh: "later 把动作推到更后面：稍后或以后。",
    explanationEn: "later pushes the action further down the timeline.",
    hookZh: "later=把事情往后推",
    hookEn: "later pushes it forward in time.",
    usageZh: "稍后打电话、以后再说、晚一点来。",
    usageEn: "call later, discuss later, come later.",
  },
  eerst: {
    titleZh: "时间顺序",
    titleEn: "Sequence Order",
    explanationZh: "eerst 是“先/首先”，把动作排到第一步。",
    explanationEn: "eerst means first; it puts the action in step one.",
    hookZh: "eerst=先把第一步做掉",
    hookEn: "eerst means do the first step first.",
    usageZh: "先付款、先填表、先打电话。",
    usageEn: "pay first, fill in first, call first.",
  },
  daarna: {
    titleZh: "时间顺序",
    titleEn: "Sequence Order",
    explanationZh: "daarna 是“之后/然后”，接在前一个动作后面。",
    explanationEn: "daarna means after that; it follows the previous action.",
    hookZh: "daarna=做完这步再下一步",
    hookEn: "daarna means next after this step.",
    usageZh: "之后回家、之后付款、之后联系。",
    usageEn: "go home after that, pay after that, contact after that.",
  },
  laatst: {
    titleZh: "时间词义对比",
    titleEn: "Time Meaning Contrast",
    explanationZh: "laatst 常指最近某次发生过的事，不等于“最后一个”。",
    explanationEn: "laatst often means recently / the other day, not simply the final one.",
    hookZh: "laatst=前阵子那次",
    hookEn: "laatst means that recent time.",
    usageZh: "最近生病、前阵子打过电话、上次遇到。",
    usageEn: "recently sick, called the other day, met last time.",
    warningZh: "“最后的”常用 laatste；laatst 更像“前阵子”。",
    warningEn: "The adjective last/final is often laatste; laatst is more like recently.",
  },
  altijd: {
    titleZh: "频率刻度",
    titleEn: "Frequency Scale",
    explanationZh: "altijd 表示每次都这样，频率拉满。",
    explanationEn: "altijd means every time: frequency turned all the way up.",
    hookZh: "altijd=每次都这样",
    hookEn: "altijd means every single time.",
    usageZh: "总是迟到、总是工作、一直如此。",
    usageEn: "always late, always working, always like this.",
  },
  vaak: {
    titleZh: "频率刻度",
    titleEn: "Frequency Scale",
    explanationZh: "vaak 是经常，不是每次都发生。",
    explanationEn: "vaak means often, not every single time.",
    hookZh: "vaak=常常但不每次",
    hookEn: "vaak means often, but not always.",
    usageZh: "经常去、经常打电话、经常使用。",
    usageEn: "often go, often call, often use.",
  },
  soms: {
    titleZh: "频率刻度",
    titleEn: "Frequency Scale",
    explanationZh: "soms 是有时候，频率比 vaak 更低。",
    explanationEn: "soms means sometimes, less frequent than vaak.",
    hookZh: "soms=偶尔冒出来",
    hookEn: "soms pops up only sometimes.",
    usageZh: "有时迟到、有时在家、有时需要。",
    usageEn: "sometimes late, sometimes home, sometimes needed.",
  },
  nooit: {
    titleZh: "频率刻度",
    titleEn: "Frequency Scale",
    explanationZh: "nooit 是时间上的彻底否定：从不。",
    explanationEn: "nooit is a full time-frequency negative: never.",
    hookZh: "nooit=一次都没有",
    hookEn: "nooit means not even once.",
    usageZh: "从不做、从没去过、绝不这样。",
    usageEn: "never do, never been, never like that.",
  },
};

const placeAndModeAdverbDetails: Record<string, CategoryMemoryDetails> = {
  hier: {
    titleZh: "空间对照",
    titleEn: "Location Contrast",
    explanationZh: "hier 指说话人这边的“这里”，常和 daar 对着记。",
    explanationEn: "hier means here on the speaker's side; contrast it with daar.",
    hookZh: "hier=手指脚下这里",
    hookEn: "hier points to right here.",
    usageZh: "Kom hier、hier is mijn pas、我在这里。",
    usageEn: "Kom hier, hier is mijn pas, I am here.",
  },
  daar: {
    titleZh: "空间对照",
    titleEn: "Location Contrast",
    explanationZh: "daar 指离说话人远一点的“那里”，和 hier 相对。",
    explanationEn: "daar means there, away from the speaker; contrast it with hier.",
    hookZh: "daar=手指远处那里",
    hookEn: "daar points over there.",
    usageZh: "Daar is de balie、东西在那里、柜台在那里。",
    usageEn: "Daar is de balie, something is there, the counter is there.",
  },
  samen: {
    titleZh: "关系对照",
    titleEn: "Relationship Contrast",
    explanationZh: "samen 表示一起做，不是一个人完成。",
    explanationEn: "samen means doing something together, not alone.",
    hookZh: "samen=两个人一起做",
    hookEn: "samen means doing it together.",
    usageZh: "一起解决、一起去、一起学习。",
    usageEn: "solve together, go together, learn together.",
  },
  graag: {
    titleZh: "礼貌表达",
    titleEn: "Polite Expression",
    explanationZh: "graag 让请求更自然：Ik wil graag... = 我想要/愿意。",
    explanationEn: "graag softens wishes and requests: Ik wil graag... = I would like.",
    hookZh: "graag=礼貌地说我想要",
    hookEn: "graag politely says I would like.",
    usageZh: "点餐、预约、表达愿意做。",
    usageEn: "ordering, appointments, saying you would like to.",
  },
};

function timeMemoryDetailsFor(word: WordItem, wordType: MemoryPathWordType): CategoryMemoryDetails | undefined {
  const key = normalizeWordText(word.dutch);
  const weekday = weekdayOrder[key];
  if (weekday) {
    return {
      titleZh: "星期用法",
      titleEn: "Weekday Use",
      explanationZh: `${word.dutch} 是${weekday.zh}；说“在周一”常用 op ${word.dutch}，句首也能直接放。`,
      explanationEn: `${word.dutch} is ${weekday.en}; use op ${word.dutch} for on ${weekday.en}, or place it at sentence start.`,
      hookZh: `${word.dutch}把${weekday.zh}钉进日程`,
      hookEn: `${word.dutch} pins ${weekday.en} into your schedule.`,
      usageZh: `op ${word.dutch}、${word.dutch} kom ik、下一格是 ${weekday.nextZh}。`,
      usageEn: `op ${word.dutch}, ${word.dutch} kom ik, next weekday is ${weekday.nextEn}.`,
    };
  }

  const month = monthOrder[key];
  if (month) {
    return {
      titleZh: "月份用法",
      titleEn: "Month Use",
      explanationZh: `${word.dutch} 是${month.zh}；月份前常用 in：in ${word.dutch}。`,
      explanationEn: `${word.dutch} is ${month.en}; months often take in: in ${word.dutch}.`,
      hookZh: `${word.dutch}=第${month.index}个月`,
      hookEn: `${word.dutch} is month ${month.index}.`,
      usageZh: `in ${word.dutch}，常见于${month.sceneZh}。`,
      usageEn: `in ${word.dutch}, often for ${month.sceneEn}.`,
    };
  }

  if (timeUnitDetails[key] && wordType === "day-month") return timeUnitDetails[key];
  if (relativeTimeDetails[key] && (wordType === "adverb" || wordType === "day-month")) return relativeTimeDetails[key];
  if (placeAndModeAdverbDetails[key] && wordType === "adverb") return placeAndModeAdverbDetails[key];
  return undefined;
}

const numberUnitParts: Record<string, { zh: string; en: string }> = {
  een: { zh: "一", en: "one" },
  twee: { zh: "二", en: "two" },
  drie: { zh: "三", en: "three" },
  vier: { zh: "四", en: "four" },
  vijf: { zh: "五", en: "five" },
  zes: { zh: "六", en: "six" },
  zeven: { zh: "七", en: "seven" },
  acht: { zh: "八", en: "eight" },
  negen: { zh: "九", en: "nine" },
};

const numberTeenParts: Record<string, { zh: string; en: string; warningZh?: string; warningEn?: string }> = {
  dertien: { zh: "drie 变 der + tien = 十三", en: "drie changes to der + tien = thirteen", warningZh: "三十/十三都不是直接 drie + 后缀，要记 der- 变形。", warningEn: "It is not direct drie + suffix; remember the der- change." },
  veertien: { zh: "vier 变 veer + tien = 十四", en: "vier changes to veer + tien = fourteen" },
  vijftien: { zh: "vijf + tien = 十五", en: "vijf + tien = fifteen" },
  zestien: { zh: "zes + tien = 十六", en: "zes + tien = sixteen" },
  zeventien: { zh: "zeven + tien = 十七", en: "zeven + tien = seventeen" },
  achttien: { zh: "acht + tien = 十八", en: "acht + tien = eighteen" },
  negentien: { zh: "negen + tien = 十九", en: "negen + tien = nineteen" },
};

const numberTenParts: Record<string, { zh: string; en: string; warningZh?: string; warningEn?: string }> = {
  twintig: { zh: "twintig = 二十；先当特殊整十记", en: "twintig = twenty; learn it as a special tens form", warningZh: "二十不是 twee + tig，而是 twintig。", warningEn: "Twenty is not twee + tig; it is twintig." },
  dertig: { zh: "drie 变 der + tig = 三十", en: "drie changes to der + tig = thirty", warningZh: "三十不是 drietig，是 dertig。", warningEn: "Thirty is not drietig; it is dertig." },
  veertig: { zh: "vier 变 veer + tig = 四十", en: "vier changes to veer + tig = forty" },
  vijftig: { zh: "vijf + tig = 五十", en: "vijf + tig = fifty" },
  zestig: { zh: "zes + tig = 六十", en: "zes + tig = sixty" },
  zeventig: { zh: "zeven + tig = 七十", en: "zeven + tig = seventy" },
  tachtig: { zh: "acht 变 tachtig = 八十", en: "acht changes to tachtig = eighty", warningZh: "八十不是 achttig，固定写 tachtig。", warningEn: "Eighty is not achttig; it is tachtig." },
  negentig: { zh: "negen + tig = 九十", en: "negen + tig = ninety" },
};

const numberTenValuesZh: Record<string, string> = {
  twintig: "二十",
  dertig: "三十",
  veertig: "四十",
  vijftig: "五十",
  zestig: "六十",
  zeventig: "七十",
  tachtig: "八十",
  negentig: "九十",
};

const compoundNumberValueZh = (ten: string, unitZh: string) => `${numberTenValuesZh[ten] ?? ten}${unitZh}`;

function numberMemoryDetailsFor(word: WordItem): CategoryMemoryDetails {
  const key = normalizeWordText(word.dutch);
  const compound = /^(.+?)(en|ën)(twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig)$/.exec(key);
  if (compound) {
    const unit = compound[1];
    const connector = compound[2];
    const ten = compound[3];
    const unitZh = numberUnitParts[unit]?.zh ?? unit;
    const tenValueZh = numberTenValuesZh[ten] ?? ten;
    const fullValueZh = compoundNumberValueZh(ten, unitZh);
    return {
      titleZh: "数字构词规律",
      titleEn: "Number Pattern",
      explanationZh: `${word.dutch} 是“个位 + ${connector} + 十位”的几十几结构。`,
      explanationEn: `${word.dutch} follows the Dutch ones + en + tens pattern.`,
      hookZh: `${unit} + ${connector} + ${ten} = ${unitZh} + ${connector} + ${tenValueZh} = ${fullValueZh}`,
      hookEn: `${unit} + ${connector} + ${ten} = ones first, then tens.`,
      usageZh: `几十几先说个位，再接 en，再说十位；${word.dutch} 不是 ${ten}-${unit}，而是 ${unit}-${connector}-${ten}。`,
      usageEn: `Compound numbers say the ones first, then en, then the tens; ${word.dutch} is ${unit}-${connector}-${ten}, not ${ten}-${unit}.`,
      warningZh: connector === "ën" ? "twee/drie 后接 en 写 ën，提醒两个元音分开发音。" : "荷兰语几十几先说个位，再说十位。",
      warningEn: connector === "ën" ? "After twee/drie, en is written ën to keep the vowels separate." : "Dutch compound numbers say the ones first, then the tens.",
    };
  }

  const teen = numberTeenParts[key];
  if (teen) {
    return {
      titleZh: "十几构词规律",
      titleEn: "Teen Number Pattern",
      explanationZh: "十三到十九大多走“数字 + tien”的路线，但有拼写变形。",
      explanationEn: "Thirteen to nineteen mostly follow digit + tien, with spelling changes.",
      hookZh: teen.zh,
      hookEn: teen.en,
      usageZh: "十几的核心是 tien；先看前半截是不是数字变形，再接 tien。",
      usageEn: "The teen core is tien; read the front part as a digit or spelling-changed digit, then add tien.",
      warningZh: teen.warningZh,
      warningEn: teen.warningEn,
    };
  }

  const ten = numberTenParts[key];
  if (ten) {
    return {
      titleZh: "整十构词规律",
      titleEn: "Tens Pattern",
      explanationZh: "几十通常和 -tig 有关，但 twintig / dertig / tachtig 这类要特别提醒变形。",
      explanationEn: "Tens usually connect to -tig, but forms like twintig, dertig, and tachtig need change notes.",
      hookZh: ten.zh,
      hookEn: ten.en,
      usageZh: "整十先抓 -tig；遇到 twintig / dertig / tachtig 这种变形，按整块特别记。",
      usageEn: "For tens, look for -tig; forms like twintig / dertig / tachtig need a special-change reminder.",
      warningZh: ten.warningZh,
      warningEn: ten.warningEn,
    };
  }

  return {
    titleZh: "数字基础词",
    titleEn: "Basic Number Word",
    explanationZh: "0-12 先作为基础数字整体记，后面的十几、几十、几十几会用它们组合。",
    explanationEn: "Learn 0-12 as base numbers; teens, tens, and compound numbers build from them.",
    hookZh: `${word.dutch} = ${primaryMeaning(word, "zh")}`,
    hookEn: `${word.dutch} = ${primaryMeaning(word, "en")}`,
    usageZh: "电话号码、门牌号、价格、数量。",
    usageEn: "phone numbers, house numbers, prices, and quantities.",
  };
}

function categoryDetailsFor(word: WordItem, wordType: MemoryPathWordType) {
  const key = normalizeWordText(word.dutch);
  if (isBowlKom(word) && wordType === "noun") {
    return {
      titleZh: "同形分流",
      titleEn: "Same Form Split",
      explanationZh: "kom 有两个常见入口：de kom 是“碗”；ik kom / kom! 才是“来”。有冠词 de 时先读成餐具，没有冠词并跟着主语时再判断为动词。",
      explanationEn: "kom has two useful entries: de kom is a bowl; ik kom / kom! means come. With de, read it as tableware; with a subject, check the verb use.",
      hookZh: "de kom=碗；ik kom=我来",
      hookEn: "de kom = bowl; ik kom = I come.",
      usageZh: "餐具/厨房场景里说 de kom；动作句里才读作来。",
      usageEn: "Use de kom in kitchen/tableware contexts; read it as come only in verb lines.",
      warningZh: "不要看到 kom 就自动接 English come；有 de 时它是碗。",
      warningEn: "Do not automatically connect kom to English come; with de, it is a bowl.",
    };
  }
  if (languageNames.has(key)) {
    return {
      titleZh: "语言名按类别记",
      titleEn: "Language Name",
      explanationZh: `${word.dutch} 是语言名，常和 spreken / leren 这类动作一起出现。`,
      explanationEn: `${word.dutch} is a language name. Learn it with spreken / leren patterns.`,
      hookZh: `把 ${word.dutch} 当作“一门语言”记。`,
      hookEn: `Remember ${word.dutch} as a language name.`,
      usageZh: "语言能力、学习、翻译或沟通。",
      usageEn: "language ability, learning, translation, or communication.",
      warningZh: key === "engels" ? "Engelsen 是英国人们，不是 het Engels 的普通复数。" : undefined,
      warningEn: key === "engels" ? "Engelsen means English people, not a normal plural of the language word." : undefined,
    };
  }
  if (countryNames.has(key)) {
    return {
      titleZh: "国家名按地点句型记",
      titleEn: "Country Name",
      explanationZh: `${word.dutch} 是国家名，常放在 in / uit 后面。`,
      explanationEn: `${word.dutch} is a country name, often used after in / uit.`,
      hookZh: `先记地点句型：uit ${word.dutch} / in ${word.dutch}。`,
      hookEn: `Start with place chunks: uit ${word.dutch} / in ${word.dutch}.`,
      usageZh: "介绍来自哪里、住在哪里。",
      usageEn: "saying where you come from or live.",
    };
  }
  if (numberWords.has(key)) {
    return numberMemoryDetailsFor(word);
  }
  if (dayMonthWords.has(key)) return timeMemoryDetailsFor(word, wordType);
  if (wordType === "adjective" && ["rood", "blauw", "groen", "geel", "zwart", "wit"].includes(key)) {
    return {
      titleZh: "颜色词按类别记",
      titleEn: "Color Word",
      explanationZh: `${word.dutch} 是颜色词，直接连到“东西是什么颜色”的句子。`,
      explanationEn: `${word.dutch} is a color word; learn it in color-description sentences.`,
      hookZh: "颜色词先按颜色组一起听读。",
      hookEn: "Learn color words as a color group.",
      usageZh: "描述物品、衣服、交通灯。",
      usageEn: "describing objects, clothes, and traffic lights.",
    };
  }
  return undefined;
}

function healthStateAdjectiveDetailsFor(word: WordItem, wordType: MemoryPathWordType): CategoryMemoryDetails | undefined {
  if (wordType !== "adjective") return undefined;
  const key = normalizeWordText(word.dutch);
  if (key !== "verkouden") return undefined;
  return {
    titleZh: "健康状态",
    titleEn: "Health State",
    explanationZh: "verkouden 是身体状态词；说“我感冒了”直接用 ik ben verkouden。",
    explanationEn: "verkouden is a health-state word. Say ik ben verkouden for I have a cold.",
    hookZh: "ik ben verkouden = 我感冒了",
    hookEn: "ik ben verkouden = I have a cold",
    usageZh: "状态词跟 zijn：ik ben verkouden / ben je verkouden?",
    usageEn: "Use it with zijn: ik ben verkouden / ben je verkouden?",
    warningZh: "不要把 verkouden 当动词；动作是 hoesten，状态是 verkouden zijn。",
    warningEn: "Do not treat verkouden as a verb. hoesten is an action; verkouden zijn is the state.",
  };
}

const trimPeriod = (value: string) => value.trim().replace(/[。.!?]+$/g, "");

const primaryMeaning = (word: WordItem, language: "zh" | "en") => {
  const value = word.meaning[language] || (language === "zh" ? word.meaning.en : word.meaning.zh) || word.dutch;
  return value
    .split(/[\/,;，；、]|\bor\b/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? value.trim();
};

const isBowlKom = (word: WordItem) =>
  normalizeWordText(word.dutch) === "kom" && /碗|\bbowl\b/i.test(`${word.meaning.zh} ${word.meaning.en}`);

const articleWord = (word: WordItem) => word.article ? `${word.article} ${word.dutch}` : word.dutch;

const breakdownLine = (breakdown: MemoryPath["breakdown"], language: "zh" | "en") =>
  breakdown?.parts
    .map((part) => `${part.dutch} = ${language === "zh" ? part.meaningZh : part.meaningEn}`)
    .join(" + ") ?? "";

const phraseLine = (phrase: MemoryPath["phraseChunks"][number] | undefined, language: "zh" | "en") => {
  if (!phrase?.dutch) return "";
  const meaning = language === "zh" ? phrase.meaningZh : phrase.meaningEn;
  return meaning ? `${phrase.dutch} = ${meaning}` : phrase.dutch;
};

const outputLine = (output: MemoryPath["outputSentence"] | undefined, language: "zh" | "en") => {
  if (!output?.dutch) return "";
  const meaning = language === "zh" ? output.meaningZh : output.meaningEn;
  return meaning ? `${output.dutch} = ${meaning}` : output.dutch;
};

const lastVerbToken = (value: string) => value.trim().toLowerCase().split(/\s+/).filter(Boolean).at(-1) ?? "";

function verbFormRoleLabel(form: string, usage: NonNullable<ReturnType<typeof verbUsageFor>>) {
  const current = normalizeWordText(form);
  if (infinitiveForPastParticiple(current) === normalizeWordText(usage.infinitive)) {
    return {
      zh: "完成时过去分词",
      en: "past participle used in the perfect tense",
    };
  }
  const ik = lastVerbToken(usage.ikForm);
  const jijForms = usage.jijForm.split("/").map(lastVerbToken);
  const wij = lastVerbToken(usage.wijForm);
  if (current === ik && !jijForms.includes(current)) {
    return {
      zh: "ik 形式/命令形式",
      en: "ik form / command form",
    };
  }
  if (jijForms.includes(current)) {
    return {
      zh: "jij/je/u/hij/zij 形式",
      en: "jij/je/u/hij/zij form",
    };
  }
  if (current === wij) {
    return {
      zh: "复数/原形",
      en: "plural/base form",
    };
  }
  return {
    zh: "句中变位形式",
    en: "sentence form",
  };
}

function pathViaVerbInfinitive(word: WordItem, context: MemoryPathContext, usage: NonNullable<ReturnType<typeof verbUsageFor>>) {
  const current = normalizeWordText(word.dutch);
  const infinitive = normalizeWordText(usage.infinitive);
  if (!current || current === infinitive || phraseLike(word.dutch)) return undefined;

  const baseWord = context.allWords?.find((item) => normalizeWordText(item.dutch) === infinitive) ?? {
    ...word,
    dutch: usage.infinitive,
    audioText: usage.infinitive,
  };
  const role = verbFormRoleLabel(word.dutch, usage);
  const basePath = generateMemoryPath(baseWord, context);
  const formStep = {
    labelZh: "词形提醒",
    labelEn: "Form note",
    contentZh: `${word.dutch}（当前词形）= ${usage.infinitive} 的${role.zh}；记忆路径先按原形 ${usage.infinitive} 走。`,
    contentEn: `${word.dutch} (current form) = the ${role.en} of ${usage.infinitive}; learn the memory path through the base form ${usage.infinitive}.`,
  };

  return {
    ...basePath,
    wordId: word.id,
    dutch: word.dutch,
    explanationZh: `${word.dutch} 不是另一条新词；它回到原形 ${usage.infinitive} 来记。${basePath.explanationZh}`,
    explanationEn: `${word.dutch} is not a separate new word; connect it back to ${usage.infinitive}. ${basePath.explanationEn}`,
    steps: [formStep, ...(basePath.steps ?? [])],
  };
}

const lineAnchor = (
  phraseChunks: MemoryPath["phraseChunks"],
  output: MemoryPath["outputSentence"] | undefined,
  language: "zh" | "en",
) => {
  if (output?.dutch) {
    const meaning = language === "zh" ? output.meaningZh : output.meaningEn;
    return meaning ? `${output.dutch} = ${meaning}` : output.dutch;
  }
  const phrase = phraseChunks[0];
  if (phrase?.dutch) {
    const meaning = language === "zh" ? phrase.meaningZh : phrase.meaningEn;
    return meaning ? `${phrase.dutch} = ${meaning}` : phrase.dutch;
  }
  return "";
};

const weakMemoryHookPattern =
  /先贴到|贴到一个|贴在|小标签|一看到这块|落回荷兰语|场景卡|真实用法|放进短语和例句|短语和例句|常用搭配记|自然词块|整块记|当动词记|动作块|整句跟读|词义和动作|直接放进句子|能说出口|能直接开口|具体场景抓住|暂时没有强|A2 办事时很常见|放进.+场景|钉在|先看见|再想起荷兰语|固定开口方式|帮助你固定|记忆路径生成逻辑|Learn .+inside|placeholder|manual review|generic/i;

const forbiddenMemoryTextPatterns = [
  /动作对象/,
  /动作\+物体/,
  /动作开关/,
  /动作镜头/,
  /小开关/,
  /小机关/,
  /时间、地点或方式开关/,
  /状态画面/,
  /生活画面/,
  /先给这个词一个生活画面/,
  /先放进一个真实短句里记/,
  /固定开口方式/,
  /开口句/,
  /整句触发/,
  /这个词适合放在真实生活里/,
  /帮助你固定这个词/,
  /先背这个词/,
  /再跟句子读/,
  /直接重复词义/,
  /为了凑/,
  /硬编/,
  /落到 .*这个可用词块里/,
  /这个搭配把 .*意思直接带出来/,
  /时间词按类别记/,
  /日历上的一格/,
  /属于这一类/,
  /按日期、星期或月份的位置来记/,
  /先确定它属于星期、月份还是时间单位/,
  /场景卡/,
  /先贴到/,
  /贴到一个/,
  /真实用法/,
  /小标签/,
  /一看到这块/,
  /落回荷兰语/,
  /放进短语和例句/,
  /常用搭配记/,
  /动词要带动作画面记/,
  /钉在/,
  /先看见/,
  /再想起荷兰语/,
  /联想词块/,
  /记忆路径生成逻辑/,
  /put it into a real sentence/i,
  /usable phrases and sentences/i,
  /scene card/i,
];

const hasForbiddenMemoryText = (value?: string) =>
  Boolean(value && forbiddenMemoryTextPatterns.some((pattern) => pattern.test(value)));

function learnerHookFromWord(word: WordItem) {
  const zh = word.memoryHook?.zh?.trim();
  const en = word.memoryHook?.en?.trim();
  if (!zh || !en) return undefined;
  const combined = `${zh} ${en}`;
  if (weakMemoryHookPattern.test(combined)) return undefined;
  if (zh.length < 8 || en.length < 8) return undefined;
  return { zh, en };
}

function themedLifeSceneForWord(word: WordItem) {
  const theme = `${word.theme} ${word.scenarioTags.join(" ")}`.toLowerCase();
  const wordLabel = word.dutch;
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const scene = (zh: string, en: string) => ({ zh, en });

  if (/family-events/.test(theme)) {
    return scene(
      `家庭聚会、生日或探亲时，现场出现的“${meaningZh}”就是 ${wordLabel}。`,
      `At a family gathering, birthday, or visit, the "${meaningEn}" in the scene is ${wordLabel}.`,
    );
  }
  if (/(neighborhood|buurt)/.test(theme)) {
    return scene(
      `走出家门看周围街道和邻里，身边的“${meaningZh}”就是 ${wordLabel}。`,
      `Step outside and look around the neighborhood: the "${meaningEn}" there is ${wordLabel}.`,
    );
  }
  if (/(family|identity|personal|people)/.test(theme)) {
    return scene(
      `翻开家庭相册、介绍身边的人时，画面里的“${meaningZh}”就是 ${wordLabel}。`,
      `Open a family photo or introduce the people around you: the "${meaningEn}" in that scene is ${wordLabel}.`,
    );
  }
  if (/(kitchen-tableware|tableware)/.test(theme)) {
    return scene(
      `打开厨柜、准备摆桌时，手里拿到的“${meaningZh}”就是 ${wordLabel}。`,
      `Open the kitchen cupboard and set the table: the "${meaningEn}" in your hand is ${wordLabel}.`,
    );
  }
  if (/(home|housing|furniture|room|kitchen)/.test(theme)) {
    return scene(
      `走进家里，从门口到房间和厨房，眼前的“${meaningZh}”就是 ${wordLabel}。`,
      `Walk into the home, from the entrance to the rooms and kitchen: the "${meaningEn}" you see is ${wordLabel}.`,
    );
  }
  if (/(transport|travel|train)/.test(theme)) {
    return scene(
      `到站牌、站台或车厢里，出行画面中的“${meaningZh}”就是 ${wordLabel}。`,
      `At a stop, platform, or inside a vehicle, the "${meaningEn}" in the travel scene is ${wordLabel}.`,
    );
  }
  if (/(school|education|work|office|writing|reading)/.test(theme)) {
    return scene(
      `走进教室或办公室，眼前和手边的“${meaningZh}”就是 ${wordLabel}。`,
      `Walk into a classroom or office: the "${meaningEn}" in front of you or at hand is ${wordLabel}.`,
    );
  }
  if (/(technology|digital|phone|media)/.test(theme)) {
    return scene(
      `打开手机或电脑，设备旁或屏幕上的“${meaningZh}”就是 ${wordLabel}。`,
      `Open a phone or computer: the "${meaningEn}" beside the device or on its screen is ${wordLabel}.`,
    );
  }
  if (/(money|shopping|payment|bank|budget|quantit)/.test(theme)) {
    return scene(
      `买东西结账、数数量或查看价格时，柜台前出现的“${meaningZh}”就是 ${wordLabel}。`,
      `While shopping, paying, counting, or checking a price, the "${meaningEn}" at the counter is ${wordLabel}.`,
    );
  }
  if (/(weather|nature|city|environment)/.test(theme)) {
    return scene(
      `走到户外，看天空、街道和周围环境时，眼前的“${meaningZh}”就是 ${wordLabel}。`,
      `Step outside and look at the sky, street, and surroundings: the "${meaningEn}" there is ${wordLabel}.`,
    );
  }
  if (/(clothes|clothing|color)/.test(theme)) {
    return scene(
      `出门前打开衣柜，挑到要穿的“${meaningZh}”时说 ${wordLabel}。`,
      `Open the wardrobe before going out; the "${meaningEn}" you choose is ${wordLabel}.`,
    );
  }
  if (/(food|fruit|drink|supermarket)/.test(theme)) {
    return scene(
      `在超市货架、厨房案板或餐桌上看到“${meaningZh}”，这个东西就是 ${wordLabel}。`,
      `See "${meaningEn}" on a supermarket shelf, chopping board, or dining table: that item is ${wordLabel}.`,
    );
  }
  if (/(health|body|pharmacy|sick)/.test(theme)) {
    return scene(
      `看医生、进药店或描述身体时，要指出的“${meaningZh}”就是 ${wordLabel}。`,
      `At the doctor, pharmacy, or while describing the body, the "${meaningEn}" is ${wordLabel}.`,
    );
  }
  if (/(time|date|month|season)/.test(theme)) {
    return scene(
      `看钟表、日历或安排一天时，标出的“${meaningZh}”就是 ${wordLabel}。`,
      `Look at a clock, calendar, or daily plan: the marked "${meaningEn}" is ${wordLabel}.`,
    );
  }
  if (/(leisure|sport|culture|art)/.test(theme)) {
    return scene(
      `休息日安排活动时，想做或看到的“${meaningZh}”就是 ${wordLabel}。`,
      `While planning free time, the "${meaningEn}" you do or see is ${wordLabel}.`,
    );
  }
  if (/(country|countries|language|place|direction)/.test(theme)) {
    return scene(
      `看地图、路牌或地址时，标出的“${meaningZh}”就是 ${wordLabel}。`,
      `Look at a map, sign, or address: the marked "${meaningEn}" is ${wordLabel}.`,
    );
  }
  if (/(service|gemeente|form|civic)/.test(theme)) {
    return scene(
      `来到服务柜台、填写表格时，正在办理的“${meaningZh}”就是 ${wordLabel}。`,
      `At a service desk or while filling in a form, the "${meaningEn}" being handled is ${wordLabel}.`,
    );
  }
  if (/(emotion|relationship)/.test(theme)) {
    return scene(
      `看见人的表情和反应时，正在发生的“${meaningZh}”就是 ${wordLabel}。`,
      `Look at a person's face and reaction: the "${meaningEn}" happening there is ${wordLabel}.`,
    );
  }

  return scene(
    `把“${meaningZh}”放回最常遇到它的日常场景，那个具体的人、物或事件就是 ${wordLabel}。`,
    `Put "${meaningEn}" back into its most ordinary daily setting; that concrete person, object, or event is ${wordLabel}.`,
  );
}

function nounUsageHookForWord(word: WordItem, _output: MemoryPath["outputSentence"] | undefined, _phraseChunks: MemoryPath["phraseChunks"]) {
  const key = normalizeWordText(word.dutch);
  const exact = exactLifeSceneHooks[key];
  if (exact) return exact;
  return themedLifeSceneForWord(word);
}

function practicalImageHookForWord(word: WordItem, wordType: MemoryPathWordType, output: MemoryPath["outputSentence"] | undefined, phraseChunks: MemoryPath["phraseChunks"], usage: { zh: string; en: string }) {
  const key = normalizeWordText(word.dutch);
  const lineZh = lineAnchor(phraseChunks, output, "zh");
  const lineEn = lineAnchor(phraseChunks, output, "en");
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const sceneZh = trimPeriod(usage.zh);
  const sceneEn = trimPeriod(usage.en);

  if (["vandaag", "gisteren", "morgen", "overmorgen"].includes(key)) {
    return {
      zh: lineZh ? `时间句：${lineZh}` : `${word.dutch} 按时间顺序排：gisteren / vandaag / morgen / overmorgen。`,
      en: lineEn ? `Time line: ${lineEn}` : `Place ${word.dutch} in time order: gisteren / vandaag / morgen / overmorgen.`,
    };
  }

  const exact = exactLifeSceneHooks[key];
  if (exact && wordType !== "verb") {
    return exact;
  }

  if (wordType === "verb") {
    const actionHook = actionObjectHookForWord(word, phraseChunks, output);
    if (actionHook) return actionHook;
    const outputLineZh = outputLine(output, "zh");
    const outputLineEn = outputLine(output, "en");
    return {
      zh: outputLineZh || `${word.dutch} = ${meaningZh}`,
      en: outputLineEn || `${word.dutch} = ${meaningEn}`,
    };
  }

  if (wordType === "adverb") {
    return {
      zh: lineZh
        ? `句中作用：${lineZh}`
        : `${word.dutch} 在短句里负责“${meaningZh}”。`,
      en: lineEn
        ? `Sentence function: ${lineEn}`
        : `Learn ${word.dutch} inside a short line; it means "${meaningEn}".`,
    };
  }

  if (wordType === "phrase") {
    return {
      zh: `${word.dutch} = ${meaningZh}；先把整块当一个表达认出来。`,
      en: `${word.dutch} = ${meaningEn}; recognize the whole expression first.`,
    };
  }

  if (wordType === "noun") {
    return nounUsageHookForWord(word, output, phraseChunks);
  }

  if (wordType === "adjective") {
    return {
      zh: lineZh ? `描述状态：${lineZh}` : `${word.dutch} 用来描述“${meaningZh}”这种状态或性质。`,
      en: lineEn ? `Describe the state: ${lineEn}` : `${word.dutch} describes the state or quality "${meaningEn}".`,
    };
  }

  return {
    zh: lineZh ? `句中作用：${lineZh}` : `${word.dutch} 在句中负责“${meaningZh}”这个功能。`,
    en: lineEn ? `Sentence function: ${lineEn}` : `${word.dutch} carries the sentence function "${meaningEn}".`,
  };
}

function scenarioHookForWord(word: WordItem, wordType: MemoryPathWordType, output: MemoryPath["outputSentence"] | undefined, phraseChunks: MemoryPath["phraseChunks"], usage: { zh: string; en: string }) {
  const learnerHook = learnerHookFromWord(word);
  if (learnerHook) return learnerHook;

  const lineZh = lineAnchor(phraseChunks, output, "zh");
  const lineEn = lineAnchor(phraseChunks, output, "en");
  const sceneZh = trimPeriod(usage.zh);
  const sceneEn = trimPeriod(usage.en);
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");

  if (wordType === "verb") {
    const actionHook = actionObjectHookForWord(word, phraseChunks, output);
    if (actionHook) return actionHook;
  }

  if (lineZh && wordType === "verb") {
    return {
      zh: `动作结构：${lineZh}`,
      en: `Verb pattern: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "adjective") {
    return {
      zh: `描述状态：${lineZh}`,
      en: `Describe the state: ${lineEn}`,
    };
  }
  if (lineZh && wordType === "adverb") {
    return {
      zh: `句中作用：${lineZh} ${word.dutch} 在这里负责“${meaningZh}”。`,
      en: `Sentence function: ${lineEn}. Here, ${word.dutch} carries "${meaningEn}".`,
    };
  }
  if (lineZh && wordType === "function-word") {
    return {
      zh: `结构作用：${lineZh} ${word.dutch} 在这里负责“${meaningZh}”。`,
      en: `Structure function: ${lineEn}. Here, ${word.dutch} carries "${meaningEn}".`,
    };
  }
  if (lineZh && wordType === "phrase") {
    return {
      zh: `${word.dutch} = ${meaningZh}；整块认出，整块使用。`,
      en: `${word.dutch} = ${meaningEn}; recognize and use it as one whole chunk.`,
    };
  }
  if (lineZh && wordType === "noun") {
    return nounUsageHookForWord(word, output, phraseChunks);
  }
  if (lineZh) {
    return {
      zh: `${word.dutch} = ${meaningZh}；可用句：${lineZh}`,
      en: `${word.dutch} = ${meaningEn}; usable line: ${lineEn}`,
    };
  }

  return practicalImageHookForWord(word, wordType, output, phraseChunks, { zh: sceneZh, en: sceneEn });
}

function actionObjectHookForWord(word: WordItem, phraseChunks: MemoryPath["phraseChunks"], output?: MemoryPath["outputSentence"]) {
  const shortHook = verbShortActionHooks[normalizeWordText(word.dutch)];
  if (shortHook) return shortHook;

  const first = phraseChunks.find((chunk) => chunk.dutch.trim() && !/[.!?]$/.test(chunk.dutch.trim()));
  const second = phraseChunks.find((chunk) => chunk !== first && chunk.dutch.trim() && !/[.!?]$/.test(chunk.dutch.trim()));
  const phrasePictureZh = first?.dutch ? `${first.dutch}${first.meaningZh ? `（${first.meaningZh}）` : ""}` : "";
  const phrasePictureEn = first?.dutch ? `${first.dutch}${first.meaningEn ? ` (${first.meaningEn})` : ""}` : "";
  const secondPictureZh = second?.dutch ? `${second.dutch}${second.meaningZh ? `（${second.meaningZh}）` : ""}` : "";
  const secondPictureEn = second?.dutch ? `${second.dutch}${second.meaningEn ? ` (${second.meaningEn})` : ""}` : "";
  const objectPictureZh = [phrasePictureZh, secondPictureZh].filter(Boolean).join("、");
  const objectPictureEn = [phrasePictureEn, secondPictureEn].filter(Boolean).join(", ");
  const verbHookSeed = verbObjectHookSeeds[normalizeWordText(word.dutch)];

  if (objectPictureZh && verbHookSeed) {
    return {
      zh: verbHookSeed.zh(objectPictureZh, word),
      en: verbHookSeed.en(objectPictureEn || objectPictureZh, word),
    };
  }

  return undefined;
}

function phraseHookForWord(word: WordItem, wordType: MemoryPathWordType, phraseChunks: MemoryPath["phraseChunks"], output?: MemoryPath["outputSentence"]) {
  if (wordType === "verb") return actionObjectHookForWord(word, phraseChunks, output);
  if (normalizeChunkText(word.dutch) === "een beetje") {
    return {
      zh: "a bit = een beetje；表示一点点",
      en: "a bit = een beetje; it means a little",
    };
  }

  const phrase = phraseChunks.find((chunk) => chunk.dutch.trim() && !/[.!?]$/.test(chunk.dutch.trim()));
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");

  if (wordType === "phrase") {
    return {
      zh: `${word.dutch} = ${meaningZh}`,
      en: `${word.dutch} = ${meaningEn}`,
    };
  }

	  if (phrase?.dutch) {
	    return {
	      zh: `${phrase.dutch}${phrase.meaningZh ? ` = ${phrase.meaningZh}` : ""}`,
	      en: `${phrase.dutch}${phrase.meaningEn ? ` = ${phrase.meaningEn}` : ""}`,
	    };
	  }

  return undefined;
}

type AutomatedCardTitle =
  | "天然拆词梗"
  | "词形联想"
  | "英文桥梁"
  | "英文易混提示"
  | "易混词对比"
  | "固定表达"
  | "动作词块"
  | "动词结构"
  | "时间词块"
  | "疑问词块"
  | "句型框架"
  | "结构词块"
  | "程度短语"
  | "词块联想"
  | "类别规则"
  | "功能词"
  | "功能规则"
  | "搭配提醒"
  | "常见搭配"
  | "自然短语"
  | "用法落点"
  | "趣味联想"
  | "第一生活画面"
  | "日常生存卡点";

type AutomatedMemoryCard = {
  card_title: AutomatedCardTitle;
  memory_path: string;
  memoryPathEn: string;
  strategy: MemoryPathStrategy;
  confidence: "high" | "medium" | "low";
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  formation?: WordFormationSeed;
  meaningContrast?: MeaningContrast;
  fixedExpression?: FixedExpressionSeed;
  functionWord?: FunctionWordSeed;
  explanationZh?: string;
  explanationEn?: string;
};

const inferredIngFormationBases: Record<string, MemoryPathPart> = {
  verbinding: { dutch: "verbinden", meaningZh: "连接", meaningEn: "connect" },
  bestelling: { dutch: "bestellen", meaningZh: "订购", meaningEn: "order" },
  verklaring: { dutch: "verklaren", meaningZh: "说明 / 声明", meaningEn: "explain / declare" },
  terugbetaling: { dutch: "terugbetalen", meaningZh: "退钱 / 退还", meaningEn: "pay back / refund" },
  inburgering: { dutch: "inburgeren", meaningZh: "融入 / 入籍融入", meaningEn: "integrate civically" },
  vertaling: { dutch: "vertalen", meaningZh: "翻译", meaningEn: "translate" },
  dosering: { dutch: "doseren", meaningZh: "配剂量", meaningEn: "dose" },
  bezichtiging: { dutch: "bezichtigen", meaningZh: "看房 / 参观", meaningEn: "view / inspect" },
  verdieping: { dutch: "verdiepen", meaningZh: "加深 / 分层", meaningEn: "deepen / make into levels" },
  verwarming: { dutch: "verwarmen", meaningZh: "加热 / 供暖", meaningEn: "heat" },
  aansluiting: { dutch: "aansluiten", meaningZh: "连接 / 接上", meaningEn: "connect / join" },
  omleiding: { dutch: "omleiden", meaningZh: "绕行 / 改道", meaningEn: "divert" },
  vergoeding: { dutch: "vergoeden", meaningZh: "报销 / 补偿", meaningEn: "reimburse / compensate" },
  oplossing: { dutch: "oplossen", meaningZh: "解决", meaningEn: "solve" },
  bevestiging: { dutch: "bevestigen", meaningZh: "确认", meaningEn: "confirm" },
  verwijzing: { dutch: "verwijzen", meaningZh: "转诊 / 指向", meaningEn: "refer" },
  annulering: { dutch: "annuleren", meaningZh: "取消", meaningEn: "cancel" },
  vergadering: { dutch: "vergaderen", meaningZh: "开会", meaningEn: "meet / hold a meeting" },
  toestemming: { dutch: "toestemmen", meaningZh: "同意", meaningEn: "consent / agree" },
  vergunning: { dutch: "vergunnen", meaningZh: "准许 / 许可", meaningEn: "grant / permit" },
  aanmaning: { dutch: "aanmanen", meaningZh: "催缴 / 提醒付款", meaningEn: "send a payment reminder" },
  ervaring: { dutch: "ervaren", meaningZh: "经历 / 体验", meaningEn: "experience" },
  afsluiting: { dutch: "afsluiten", meaningZh: "结束 / 封闭", meaningEn: "close / finish" },
  verkiezing: { dutch: "verkiezen", meaningZh: "选举 / 选择", meaningEn: "elect / choose" },
  samenleving: { dutch: "samenleven", meaningZh: "共同生活", meaningEn: "live together" },
  kennismaking: { dutch: "kennismaken", meaningZh: "认识 / 初次见面", meaningEn: "get acquainted" },
  overstroming: { dutch: "overstromen", meaningZh: "泛滥 / 淹没", meaningEn: "flood" },
  vervuiling: { dutch: "vervuilen", meaningZh: "污染", meaningEn: "pollute" },
  uitzending: { dutch: "uitzenden", meaningZh: "播出 / 派出", meaningEn: "broadcast / send out" },
  voorstelling: { dutch: "voorstellen", meaningZh: "呈现 / 表演 / 提出", meaningEn: "present / perform / propose" },
  inleiding: { dutch: "inleiden", meaningZh: "引入 / 开头说明", meaningEn: "introduce" },
  vergelijking: { dutch: "vergelijken", meaningZh: "比较", meaningEn: "compare" },
  beoordeling: { dutch: "beoordelen", meaningZh: "评价 / 评估", meaningEn: "assess / judge" },
  terugkoppeling: { dutch: "terugkoppelen", meaningZh: "反馈", meaningEn: "give feedback" },
  onderneming: { dutch: "ondernemen", meaningZh: "创业 / 采取行动", meaningEn: "undertake / run a business" },
  tentoonstelling: { dutch: "tentoonstellen", meaningZh: "展出", meaningEn: "exhibit" },
  opleiding: { dutch: "opleiden", meaningZh: "培训 / 教育", meaningEn: "train / educate" },
  bemiddeling: { dutch: "bemiddelen", meaningZh: "调解 / 斡旋", meaningEn: "mediate" },
  behandeling: { dutch: "behandelen", meaningZh: "治疗 / 处理", meaningEn: "treat / handle" },
  aantekening: { dutch: "aantekenen", meaningZh: "记下 / 做笔记", meaningEn: "note down" },
  beschrijving: { dutch: "beschrijven", meaningZh: "描述", meaningEn: "describe" },
  uitbetaling: { dutch: "uitbetalen", meaningZh: "支付 / 发放", meaningEn: "pay out" },
  afwijzing: { dutch: "afwijzen", meaningZh: "拒绝", meaningEn: "reject" },
  goedkeuring: { dutch: "goedkeuren", meaningZh: "批准", meaningEn: "approve" },
  vereniging: { dutch: "verenigen", meaningZh: "联合 / 结社", meaningEn: "unite / associate" },
  handhaving: { dutch: "handhaven", meaningZh: "执行 / 维持", meaningEn: "enforce / maintain" },
  herkansing: { dutch: "herkansen", meaningZh: "补考 / 再试", meaningEn: "resit / try again" },
  overnachting: { dutch: "overnachten", meaningZh: "过夜", meaningEn: "stay overnight" },
  samenvatting: { dutch: "samenvatten", meaningZh: "总结", meaningEn: "summarize" },
  beschikking: { dutch: "beschikken", meaningZh: "支配 / 作出决定", meaningEn: "have at disposal / decide" },
  beveiliging: { dutch: "beveiligen", meaningZh: "保护 / 安全防护", meaningEn: "secure / protect" },
  verstopping: { dutch: "verstoppen", meaningZh: "堵住", meaningEn: "block / clog" },
  overschrijving: { dutch: "overschrijven", meaningZh: "转账 / 转写", meaningEn: "transfer / copy over" },
  begeleiding: { dutch: "begeleiden", meaningZh: "陪同 / 指导", meaningEn: "guide / accompany" },
  aanpassing: { dutch: "aanpassen", meaningZh: "调整 / 适应", meaningEn: "adjust / adapt" },
  ondersteuning: { dutch: "ondersteunen", meaningZh: "支持", meaningEn: "support" },
  machtiging: { dutch: "machtigen", meaningZh: "授权", meaningEn: "authorize" },
};

const inferredHeidFormationBases: Record<string, MemoryPathPart> = {
  aanwezigheid: { dutch: "aanwezig", meaningZh: "在场的", meaningEn: "present" },
  afwezigheid: { dutch: "afwezig", meaningZh: "缺席的", meaningEn: "absent" },
  benauwdheid: { dutch: "benauwd", meaningZh: "呼吸困难/胸闷的", meaningEn: "short of breath / tight-chested" },
  bereikbaarheid: { dutch: "bereikbaar", meaningZh: "可联系/可到达的", meaningEn: "reachable / available" },
  beschikbaarheid: { dutch: "beschikbaar", meaningZh: "可用/有空的", meaningEn: "available" },
  duurzaamheid: { dutch: "duurzaam", meaningZh: "可持续的", meaningEn: "sustainable" },
  gelijkheid: { dutch: "gelijk", meaningZh: "平等/相等的", meaningEn: "equal" },
  leefbaarheid: { dutch: "leefbaar", meaningZh: "适合居住的", meaningEn: "liveable" },
  persoonlijkheid: { dutch: "persoonlijk", meaningZh: "个人的/个性的", meaningEn: "personal" },
  vaardigheid: { dutch: "vaardig", meaningZh: "熟练的/有技能的", meaningEn: "skilled" },
  veiligheid: { dutch: "veilig", meaningZh: "安全的", meaningEn: "safe" },
  verantwoordelijkheid: { dutch: "verantwoordelijk", meaningZh: "负责的", meaningEn: "responsible" },
  vrijheid: { dutch: "vrij", meaningZh: "自由的/有空的", meaningEn: "free" },
  zekerheid: { dutch: "zeker", meaningZh: "确定的", meaningEn: "certain" },
};

const inferredBaarFormationBases: Record<string, MemoryPathPart> = {
  bereikbaar: { dutch: "bereiken", meaningZh: "到达/联系到", meaningEn: "reach" },
  beschikbaar: { dutch: "beschikken", meaningZh: "可支配/可使用", meaningEn: "have at disposal" },
  betrouwbaar: { dutch: "vertrouwen", meaningZh: "信任", meaningEn: "trust" },
  bruikbaar: { dutch: "gebruiken", meaningZh: "使用", meaningEn: "use" },
  eetbaar: { dutch: "eten", meaningZh: "吃", meaningEn: "eat" },
  hoorbaar: { dutch: "horen", meaningZh: "听见", meaningEn: "hear" },
  leefbaar: { dutch: "leven", meaningZh: "生活/居住", meaningEn: "live" },
  leesbaar: { dutch: "lezen", meaningZh: "阅读", meaningEn: "read" },
  merkbaar: { dutch: "merken", meaningZh: "察觉", meaningEn: "notice" },
  zichtbaar: { dutch: "zien", meaningZh: "看见", meaningEn: "see" },
};

const automatedTitleEn: Record<AutomatedCardTitle, string> = {
  天然拆词梗: "Natural Compound Hook",
  词形联想: "Word Formation",
  英文桥梁: "English Bridge",
  英文易混提示: "False-Friend Alert",
  易混词对比: "Confusion Pair",
  固定表达: "Fixed Expression",
  动词结构: "Verb Pattern",
  动作词块: "Action Chunk",
  时间词块: "Time Chunk",
  疑问词块: "Question Chunk",
  句型框架: "Sentence Frame",
  结构词块: "Structure Chunk",
  程度短语: "Degree Phrase",
  词块联想: "Chunk Meaning",
  类别规则: "Category Rule",
  功能词: "Function Word",
  功能规则: "Function Rule",
  搭配提醒: "Chunk Note",
  常见搭配: "Common Chunk",
  自然短语: "Natural Phrase",
  用法落点: "Usage Anchor",
  趣味联想: "Memory Hook",
  第一生活画面: "First Life Scene",
  日常生存卡点: "Daily Survival Trigger",
};

function inferredIngFormationFor(word: WordItem, allWords: WordItem[]): WordFormationSeed | undefined {
  const key = normalizeWordText(word.dutch);
  if (!key.endsWith("ing") || key.length < 8) return undefined;

  const byKey = new Map(allWords.map((item) => [normalizeWordText(item.dutch), item]));
  const stem = key.slice(0, -3);
  const candidates = [
    `${stem}en`,
    key.endsWith("ling") ? `${key.slice(0, -4)}len` : "",
  ].filter(Boolean);
  const baseFromWords = candidates.map((candidate) => byKey.get(candidate)).find((item) => item && classifyMemoryPathWord(item) === "verb");
  const base = baseFromWords
    ? { dutch: baseFromWords.dutch, meaningZh: shortMeaningZh(primaryMeaning(baseFromWords, "zh")), meaningEn: shortMeaningEn(primaryMeaning(baseFromWords, "en")) }
    : inferredIngFormationBases[key];
  if (!base) return undefined;

  const baseDutch = normalizeWordText(base.dutch);
  const meaningZh = shortMeaningZh(primaryMeaning(word, "zh"));
  const meaningEn = shortMeaningEn(primaryMeaning(word, "en"));
  return {
    base,
    formed: { dutch: word.dutch, meaningZh, meaningEn },
    noteZh: `${baseDutch} 是动作；${key} 是这个动作形成的事情/结果。`,
    noteEn: `${baseDutch} is the action; ${key} is the thing or result formed from that action.`,
  };
}

function inferredHeidFormationFor(word: WordItem, allWords: WordItem[]): WordFormationSeed | undefined {
  const key = normalizeWordText(word.dutch);
  if (!key.endsWith("heid") || key === "overheid" || key.length < 8) return undefined;

  const byKey = new Map(allWords.map((item) => [normalizeWordText(item.dutch), item]));
  const stem = key.slice(0, -4);
  const baseFromWords = byKey.get(stem);
  const base =
    baseFromWords && classifyMemoryPathWord(baseFromWords) === "adjective"
      ? { dutch: baseFromWords.dutch, meaningZh: shortMeaningZh(primaryMeaning(baseFromWords, "zh")), meaningEn: shortMeaningEn(primaryMeaning(baseFromWords, "en")) }
      : inferredHeidFormationBases[key];
  if (!base) return undefined;

  const meaningZh = shortMeaningZh(primaryMeaning(word, "zh"));
  const meaningEn = shortMeaningEn(primaryMeaning(word, "en"));
  const englishHintZh = key.endsWith("baarheid")
    ? "这类常像英文 -ability：liveable -> liveability。"
    : "这类常像英文 -ness / -ity：safe -> safety。";
  const englishHintEn = key.endsWith("baarheid")
    ? "This often works like English -ability: liveable -> liveability."
    : "This often works like English -ness / -ity: safe -> safety.";
  return {
    base,
    formed: { dutch: word.dutch, meaningZh, meaningEn },
    noteZh: `${base.dutch} 是“${base.meaningZh}”；-heid 把形容词变成性质/状态名词。${base.dutch} + -heid = ${word.dutch}（${meaningZh}）。${englishHintZh}`,
    noteEn: `${base.dutch} means ${base.meaningEn}; -heid turns an adjective into a noun for the quality or state. ${base.dutch} + -heid = ${word.dutch} (${meaningEn}). ${englishHintEn}`,
  };
}

function inferredBaarFormationFor(word: WordItem, allWords: WordItem[]): WordFormationSeed | undefined {
  const key = normalizeWordText(word.dutch);
  if (!key.endsWith("baar") || key.length < 7 || key === "openbaar") return undefined;

  const byKey = new Map(allWords.map((item) => [normalizeWordText(item.dutch), item]));
  const mappedBase = inferredBaarFormationBases[key];
  const stem = key.slice(0, -4);
  const candidates = [
    `${stem}en`,
    `${stem}ken`,
    `${stem}gen`,
  ];
  const baseFromWords = candidates.map((candidate) => byKey.get(candidate)).find((item) => item && classifyMemoryPathWord(item) === "verb");
  const base = baseFromWords
    ? { dutch: baseFromWords.dutch, meaningZh: shortMeaningZh(primaryMeaning(baseFromWords, "zh")), meaningEn: shortMeaningEn(primaryMeaning(baseFromWords, "en")) }
    : mappedBase;
  if (!base) return undefined;

  const meaningZh = shortMeaningZh(primaryMeaning(word, "zh"));
  const meaningEn = shortMeaningEn(primaryMeaning(word, "en"));
  return {
    base,
    formed: { dutch: word.dutch, meaningZh, meaningEn },
    noteZh: `${base.dutch} 是“${base.meaningZh}”；-baar 像英文 -able/-ible，表示“可以被……的/能……的”。${base.dutch} + -baar = ${word.dutch}（${meaningZh}）。`,
    noteEn: `${base.dutch} means ${base.meaningEn}; -baar works like English -able/-ible and means can be ... / able to be .... ${base.dutch} + -baar = ${word.dutch} (${meaningEn}).`,
  };
}

const compactMemoryPath = (value: string) => {
  const compact = value.replace(/\s+/g, " ").trim();
  return Array.from(compact).slice(0, 25).join("");
};

const shortMeaningZh = (value: string) =>
  value
    .replace(/\([^)]*\)/g, "")
    .replace(/[“”"']/g, "")
    .split(/[\/,;，；、\s]/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? value.trim();

const shortMeaningEn = (value: string) =>
  value
    .replace(/\([^)]*\)/g, "")
    .split(/[\/,;]/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? value.trim();

const englishBridgeToken = (bridge: EnglishBridgeSeed) => {
  const raw = bridge.bridge.split(/≈|=|->|→/).pop() ?? bridge.bridge;
  return raw.replace(/English/i, "").trim().split(/\s+/)[0] ?? raw.trim();
};

const isDivergentEnglishBridge = (bridge: EnglishBridgeSeed) =>
  /但|不是|不只|更常|日常|wrong|not only|often means/i.test(`${bridge.noteZh} ${bridge.noteEn}`);

const confusingMemoryPaths: Record<string, { zh: string; en: string }> = {
  niet: { zh: "niet否定动作或整句", en: "niet negates an action or whole sentence" },
  geen: { zh: "geen否定名词", en: "geen negates a noun" },
  veel: { zh: "veel多，weinig少", en: "veel is much/many; weinig is little/few" },
  weinig: { zh: "weinig少，veel多", en: "weinig is little/few; veel is much/many" },
  wel: { zh: "wel肯定，niet否定", en: "wel affirms; niet negates" },
  hier: { zh: "hier这里，daar那里", en: "hier is here; daar is there" },
  daar: { zh: "daar那里，hier这里", en: "daar is there; hier is here" },
  ja: { zh: "ja肯定，nee否定", en: "ja says yes; nee says no" },
  nee: { zh: "nee否定，ja肯定", en: "nee says no; ja says yes" },
};

const fixedExpressionMemoryPaths: Record<string, { zh: string; en: string }> = {
  hallo: { zh: "进店接电话先hallo", en: "Enter a shop or answer a call: hallo." },
  dag: { zh: "见面离开都能dag", en: "Arriving or leaving, dag works." },
  "tot ziens": { zh: "正式退场tot ziens", en: "A polite exit line: tot ziens." },
  "dank je": { zh: "别人帮忙立刻dank je", en: "Someone helps: say dank je immediately." },
  "dank u": { zh: "窗口办事说dank u", en: "At a service counter, use dank u." },
  bedankt: { zh: "收完帮助说bedankt", en: "After receiving help, say bedankt." },
  alsjeblieft: { zh: "递给别人alsjeblieft", en: "Handing something over: alsjeblieft." },
  alstublieft: { zh: "对窗口说alstublieft", en: "Use alstublieft at formal counters." },
  sorry: { zh: "撞到人先sorry", en: "Bump into someone: sorry first." },
  oké: { zh: "确认没问题oké", en: "Confirm it is fine: oké." },
  oke: { zh: "确认没问题oké", en: "Confirm it is fine: oké." },
  "een beetje": {
    zh: "a bit = een beetje",
    en: "a bit / a little = een beetje",
  },
};

type PhrasePathKind = "fixed" | "action" | "time" | "question" | "frame" | "structure" | "chunk";

const strictFixedExpressionPhrases = new Set([
  "geen probleem",
  "maakt niet uit",
  "ja hoor",
  "nee hoor",
  "tot morgen",
  "tot straks",
  "wacht even",
  "alvast bedankt",
  "vriendelijke groet",
  "met vriendelijke groet",
  "een ogenblik",
  "liever niet",
  "aan de beurt",
  "in gesprek",
  "in ieder geval",
  "zo snel mogelijk",
  "naar aanleiding van",
  "aan de ene kant",
  "aan de andere kant",
  "het hangt ervan af",
  "in vergelijking met",
  "ik hoor graag van u",
  "ik ben het niet eens",
  "ik ben het ermee eens",
  "ik verbind u door",
  "rekening houden met",
  "verantwoordelijk zijn voor",
]);

const phraseActionTailPattern =
  /\b(?:aanmaken|aanvragen|aanvullen|aanbieden|aangeven|afmelden|afspraken?|afzeggen|annuleren|bekijken|betalen|beoordelen|beschrijven|bevestigen|bespreken|bijwonen|blokkeren|controleren|doen|doorgeven|geven|gebruiken|hervatten|herstellen|indienen|invullen|kiezen|krijgen|leren|lezen|luisteren|maken|meenemen|melden|ophalen|oplossen|opsturen|opzoeken|organiseren|oefenen|ontvangen|overleggen|regelen|ruilen|schrijven|spreken|stellen|stopzetten|sturen|toevoegen|trekken|verwachten|verlengen|verminderen|verplaatsen|verzetten|verzamelen|vinden|vragen|wijzigen|zoeken)$/;

function phrasePathKindFor(word: WordItem, key: string, wordType: MemoryPathWordType): PhrasePathKind {
  if (strictFixedExpressionPhrases.has(key)) return "fixed";
  if (wordType !== "phrase") return "chunk";
  if (word.article) return "chunk";
  if (/^(hoe|wat|waar|wanneer|welk|welke|met wie)\b/.test(key)) return "question";
  if (/^(ik|kunt u|kan ik|mag ik|de reden is dat|mijn voorstel is|uit de informatie blijkt|dat is voor mij belangrijk)\b/.test(key)) return "frame";
  if (/\b(vorige|volgende|elke|ieder|iedere|per|dag|week|maand|jaar|tijd|tijdstip|datum|ochtend|middag|avond|binnen|voor het eten|na het eten|eenmaal per dag|op tijd|te laat)\b/.test(key)) return "time";
  if (/^(in|uit|op|naar|bij|met|zonder|voor|na|door|tegen|aan)\b/.test(key) || /\b(?:zijn voor|houden met|gaan met|komen uit|wonen in|gaan naar)\b/.test(key)) return "structure";
  if (phraseActionTailPattern.test(key)) return "action";
  return "chunk";
}

const phrasePathTitles: Record<PhrasePathKind, { zh: string; en: string; fallbackZh: string; fallbackEn: string }> = {
  fixed: {
    zh: "固定表达",
    en: "Fixed Expression",
    fallbackZh: "这是固定表达，重点是能听懂并直接说出来。",
    fallbackEn: "This is a fixed expression; focus on recognizing it and saying it directly.",
  },
  action: {
    zh: "动作词块",
    en: "Action Chunk",
    fallbackZh: "这是动作词块，重点是看动作和宾语怎样绑在一起。",
    fallbackEn: "This is an action chunk; focus on how the action and object bind together.",
  },
  time: {
    zh: "时间词块",
    en: "Time Chunk",
    fallbackZh: "这是时间词块，重点是整块放进时间位置里用。",
    fallbackEn: "This is a time chunk; use the whole chunk in the time slot.",
  },
  question: {
    zh: "疑问词块",
    en: "Question Chunk",
    fallbackZh: "这是疑问词块，重点是直接拿来开问题。",
    fallbackEn: "This is a question chunk; use it directly to open a question.",
  },
  frame: {
    zh: "句型框架",
    en: "Sentence Frame",
    fallbackZh: "这是句型框架，重点是把后面的信息接进去。",
    fallbackEn: "This is a sentence frame; attach the missing information after it.",
  },
  structure: {
    zh: "结构词块",
    en: "Structure Chunk",
    fallbackZh: "这是结构词块，重点是看后面接地点、对象还是事情。",
    fallbackEn: "This is a structure chunk; watch what follows it: place, object, or matter.",
  },
  chunk: {
    zh: "词块联想",
    en: "Chunk Meaning",
    fallbackZh: "这是常用词块，重点是先整块认出来，再看里面的词。",
    fallbackEn: "This is a common chunk; recognize the chunk first, then inspect its parts.",
  },
};

function actionPhraseSelfHookForWord(word: WordItem) {
  const key = normalizeChunkText(word.dutch);
  if (!phraseActionTailPattern.test(key)) return undefined;

  const parts = word.dutch.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return undefined;

  const verb = parts[parts.length - 1];
  const front = parts.slice(0, -1).join(" ");
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");

  if (normalizeWordText(verb) === "doen") {
    return {
      zh: `前半块是要做的事，doen 像轻动词，把它变成日常动作：${meaningZh}。`,
      en: `The first part names the thing being done; doen works like a light verb and turns it into the everyday action: ${meaningEn}.`,
    };
  }

  return {
    zh: `${front} 是要处理的内容，${verb} 给出动作；先认成一个动作短语：${meaningZh}。`,
    en: `${front} is what is being handled, and ${verb} gives the action; learn it as one action phrase: ${meaningEn}.`,
  };
}

type PhraseComponent = { dutch: string; meaningZh: string; meaningEn: string };

const phrasePartMeaningOverrides: Record<string, { zh: string; en: string }> = {
  advies: { zh: "建议", en: "advice" },
  feedback: { zh: "反馈", en: "feedback" },
  uitleg: { zh: "解释", en: "explanation" },
  voorbeeld: { zh: "例子", en: "example" },
  reden: { zh: "原因", en: "reason" },
  mening: { zh: "意见/观点", en: "opinion" },
  toestemming: { zh: "许可", en: "permission" },
  reactie: { zh: "回复/反应", en: "response / reaction" },
  oplossing: { zh: "解决办法", en: "solution" },
  informatie: { zh: "信息", en: "information" },
  voorstel: { zh: "建议/提案", en: "proposal" },
  vragen: { zh: "问/请求", en: "ask" },
  vraag: { zh: "问题/请求", en: "question / request" },
  beantwoorden: { zh: "回答", en: "answer" },
  geven: { zh: "给", en: "give" },
  noemen: { zh: "说出/提到", en: "name / mention" },
  bespreken: { zh: "讨论", en: "discuss" },
  aanvragen: { zh: "申请/索取", en: "apply for / request" },
  doorgeven: { zh: "传递/提交/告知", en: "pass on / submit" },
  houden: { zh: "保持/持有", en: "hold / keep" },
  verantwoordelijk: { zh: "负责的", en: "responsible" },
  zijn: { zh: "是/处于", en: "be" },
  dat: { zh: "引出后面的从句", en: "that; opens the following clause" },
  is: { zh: "是", en: "is" },
  stel: { zh: "提出", en: "propose / put forward" },
  voor: { zh: "在固定结构里看后面接什么", en: "in fixed structures, check what follows" },
  met: { zh: "和/把对象接进来", en: "with; brings in the object" },
  anderen: { zh: "别人/他人", en: "others" },
  graag: { zh: "想/乐意，语气更客气", en: "gladly; makes it polite" },
  wil: { zh: "想要", en: "want" },
  ik: { zh: "我", en: "I" },
  mijn: { zh: "我的", en: "my" },
  online: { zh: "在线", en: "online" },
  digitaal: { zh: "电子/数字化", en: "digital" },
  sterk: { zh: "强的", en: "strong" },
  sterke: { zh: "强的", en: "strong" },
  kant: { zh: "方面/一边", en: "side" },
  ervaring: { zh: "经历/经验", en: "experience" },
  delen: { zh: "分享", en: "share" },
  weekend: { zh: "周末", en: "weekend" },
  iemand: { zh: "某人", en: "someone" },
  steunen: { zh: "支持", en: "support" },
  afval: { zh: "垃圾", en: "waste" },
  ophalen: { zh: "取/接/收走", en: "pick up / collect" },
  sociale: { zh: "社交的", en: "social" },
  media: { zh: "媒体", en: "media" },
  twijfelen: { zh: "犹豫/怀疑", en: "doubt / hesitate" },
  over: { zh: "关于/对……", en: "about / over" },
  vaste: { zh: "固定的", en: "fixed" },
  lasten: { zh: "开支/负担", en: "expenses / burdens" },
  gezond: { zh: "健康的", en: "healthy" },
  leven: { zh: "生活", en: "live / life" },
  deelnemen: { zh: "参加", en: "participate" },
  taak: { zh: "任务", en: "task" },
  afronden: { zh: "完成/收尾", en: "finish / complete" },
  regels: { zh: "规则", en: "rules" },
  volgen: { zh: "遵守/跟随", en: "follow" },
  onbekend: { zh: "不认识/未知的", en: "unknown" },
  woord: { zh: "词", en: "word" },
  tekst: { zh: "文本", en: "text" },
  opbouwen: { zh: "搭建/组织", en: "build up / structure" },
  zin: { zh: "句子", en: "sentence" },
  verbinden: { zh: "连接", en: "connect" },
  lokale: { zh: "本地的", en: "local" },
  regel: { zh: "规则", en: "rule" },
  gelijke: { zh: "平等/相同的", en: "equal" },
  kansen: { zh: "机会", en: "chances / opportunities" },
  informele: { zh: "非正式的", en: "informal" },
  taal: { zh: "语言", en: "language" },
  beleefde: { zh: "礼貌的", en: "polite" },
  globaal: { zh: "大概/整体", en: "global / general" },
  lezen: { zh: "读", en: "read" },
  precies: { zh: "精确地", en: "precisely" },
  bedoelde: { zh: "目标/所指的", en: "intended" },
  lezer: { zh: "读者", en: "reader" },
  vertraging: { zh: "延误", en: "delay" },
  door: { zh: "由于/通过", en: "because of / through" },
  betaling: { zh: "付款", en: "payment" },
  missen: { zh: "错过", en: "miss" },
  opvolgen: { zh: "遵循", en: "follow up / follow" },
  betekenis: { zh: "意思", en: "meaning" },
  raden: { zh: "猜", en: "guess" },
  niveau: { zh: "水平", en: "level" },
  verhogen: { zh: "提高", en: "raise" },
  openbare: { zh: "公共的", en: "public" },
  ruimte: { zh: "空间", en: "space" },
  afsluitende: { zh: "结尾的", en: "closing" },
  risico: { zh: "风险", en: "risk" },
  beperken: { zh: "限制/降低", en: "limit / reduce" },
  afspraak: { zh: "约定/预约", en: "appointment / agreement" },
  nakomen: { zh: "履行/遵守", en: "keep / fulfill" },
  discussie: { zh: "讨论", en: "discussion" },
  voeren: { zh: "进行", en: "conduct / carry out" },
  enquête: { zh: "问卷", en: "survey" },
  invullen: { zh: "填写", en: "fill in" },
  bekend: { zh: "熟悉/已知的", en: "known / familiar" },
  onderwerp: { zh: "话题/主题", en: "topic / subject" },
  vloeiend: { zh: "流利地", en: "fluently" },
  spreken: { zh: "说", en: "speak" },
  herkennen: { zh: "识别", en: "recognize" },
  hulp: { zh: "帮助", en: "help" },
  inschakelen: { zh: "启用/求助于", en: "call in / activate" },
  minder: { zh: "更少", en: "less" },
  verbruiken: { zh: "消耗/使用", en: "consume / use" },
  samen: { zh: "一起", en: "together" },
  organiseren: { zh: "组织", en: "organize" },
  klacht: { zh: "投诉", en: "complaint" },
  behandelen: { zh: "处理", en: "handle / treat" },
  context: { zh: "上下文", en: "context" },
  gebruiken: { zh: "使用", en: "use" },
  details: { zh: "细节", en: "details" },
  uitspraak: { zh: "发音", en: "pronunciation" },
  oefenen: { zh: "练习", en: "practice" },
  duidelijke: { zh: "清楚的", en: "clear" },
  aanhef: { zh: "称呼/开头", en: "salutation" },
  bijlage: { zh: "附件", en: "attachment" },
  vermelden: { zh: "提及/注明", en: "mention" },
  vriendelijke: { zh: "友好的", en: "friendly" },
  toon: { zh: "语气", en: "tone" },
  antwoord: { zh: "答案/回复", en: "answer" },
  afleiden: { zh: "推断", en: "infer" },
  aanmoedigen: { zh: "鼓励", en: "encourage" },
  meningen: { zh: "意见/观点", en: "opinions" },
  voltooid: { zh: "完成的", en: "completed" },
  deelwoord: { zh: "分词", en: "participle" },
  nieuwe: { zh: "新的", en: "new" },
  uitdrukking: { zh: "表达", en: "expression" },
  voorbeeldzin: { zh: "例句", en: "example sentence" },
  opdracht: { zh: "任务/作业", en: "assignment" },
  inleveren: { zh: "提交", en: "hand in" },
  verwerken: { zh: "处理/吸收", en: "process" },
  persoonlijke: { zh: "个人的", en: "personal" },
  favoriete: { zh: "最喜欢的", en: "favorite" },
  aantekeningen: { zh: "笔记", en: "notes" },
  maken: { zh: "做/制作", en: "make / do" },
  medicatie: { zh: "药物", en: "medication" },
  medische: { zh: "医疗的", en: "medical" },
  rechten: { zh: "权利", en: "rights" },
  plichten: { zh: "义务", en: "duties" },
  taalniveau: { zh: "语言水平", en: "language level" },
  formeel: { zh: "正式的", en: "formal" },
  taalgebruik: { zh: "语言用法", en: "language use" },
  verwachten: { zh: "期待/预期", en: "expect" },
  selectief: { zh: "选择性地", en: "selectively" },
  luisteren: { zh: "听", en: "listen" },
  opzoeken: { zh: "查找", en: "look up" },
  portfolio: { zh: "作品集/档案", en: "portfolio" },
  aanvullen: { zh: "补充", en: "add / supplement" },
  voldoende: { zh: "足够/合格的", en: "sufficient" },
  resultaat: { zh: "结果", en: "result" },
  probleem: { zh: "问题", en: "problem" },
  analyseren: { zh: "分析", en: "analyze" },
  mogelijke: { zh: "可能的", en: "possible" },
  woorden: { zh: "词", en: "words" },
  leren: { zh: "学习", en: "learn" },
  discussiëren: { zh: "讨论", en: "discuss" },
  vergadering: { zh: "会议", en: "meeting" },
  bijwonen: { zh: "参加/出席", en: "attend" },
  klachten: { zh: "投诉", en: "complaints" },
  verminderen: { zh: "减少", en: "reduce" },
  duidelijk: { zh: "清楚地/清楚的", en: "clearly / clear" },
  formuleren: { zh: "表述", en: "formulate" },
  beoordelen: { zh: "评估/判断", en: "assess" },
  hoofdpunten: { zh: "要点", en: "main points" },
  verzamelen: { zh: "收集", en: "collect" },
  betrouwbare: { zh: "可靠的", en: "reliable" },
  elkaar: { zh: "彼此", en: "each other" },
  laten: { zh: "让", en: "let" },
  uitpraten: { zh: "把话说完", en: "finish speaking" },
  begrijpelijk: { zh: "易懂地/易懂的", en: "understandably / understandable" },
  schrijven: { zh: "写", en: "write" },
  nederlandse: { zh: "荷兰的", en: "Dutch" },
  samenleving: { zh: "社会", en: "society" },
  gemeentelijke: { zh: "市政的", en: "municipal" },
  netjes: { zh: "得体地/礼貌地", en: "properly / politely" },
  vervangend: { zh: "替代的", en: "replacement" },
  vervoer: { zh: "交通/运输", en: "transport" },
  alvast: { zh: "先/提前", en: "in advance" },
  bedankt: { zh: "谢谢", en: "thanks" },
  korte: { zh: "短的", en: "short" },
  toekomstplannen: { zh: "未来计划", en: "future plans" },
  vast: { zh: "固定的", en: "fixed" },
  contract: { zh: "合同", en: "contract" },
  uren: { zh: "工时/小时", en: "hours" },
  gevonden: { zh: "找到的", en: "found" },
  voorwerp: { zh: "物品", en: "object" },
  vlucht: { zh: "航班", en: "flight" },
  annulering: { zh: "取消", en: "cancellation" },
  tijdelijk: { zh: "临时的", en: "temporary" },
  belangrijkste: { zh: "最重要的", en: "most important" },
  punt: { zh: "点/要点", en: "point" },
  voorlopige: { zh: "临时/预先的", en: "provisional" },
  aanslag: { zh: "税单/评估", en: "tax assessment" },
  stopzetten: { zh: "停止", en: "stop / terminate" },
  toeslag: { zh: "补贴", en: "benefit / allowance" },
  gezamenlijk: { zh: "共同的", en: "joint" },
  inkomen: { zh: "收入", en: "income" },
  beschikbaar: { zh: "可用/有空", en: "available" },
  per: { zh: "按/从", en: "per / from" },
  direct: { zh: "立刻", en: "immediately" },
  langdurig: { zh: "长期的", en: "long-term" },
  ziek: { zh: "生病的", en: "sick" },
  medisch: { zh: "医疗的", en: "medical" },
  dossier: { zh: "档案", en: "file / dossier" },
  ouderlijk: { zh: "父母的", en: "parental" },
  gezag: { zh: "监护权/权威", en: "custody / authority" },
  machtigen: { zh: "授权", en: "authorize" },
  huishoudelijke: { zh: "家务的", en: "household" },
  tarief: { zh: "费率", en: "rate / tariff" },
  lek: { zh: "漏水/泄漏", en: "leak" },
  melden: { zh: "报告", en: "report" },
  variabel: { zh: "可变的", en: "variable" },
};

const phraseComponentOverrides: Record<string, PhraseComponent[]> = {
  "waar moet ik zijn": [
    { dutch: "waar", meaningZh: "哪里", meaningEn: "where" },
    { dutch: "moet ik zijn", meaningZh: "我该在哪里/去哪里", meaningEn: "should I be" },
  ],
  "ten eerste": [
    { dutch: "ten eerste", meaningZh: "固定排序词：第一", meaningEn: "fixed ordering phrase: first" },
  ],
  "ten tweede": [
    { dutch: "ten tweede", meaningZh: "固定排序词：第二", meaningEn: "fixed ordering phrase: second" },
  ],
  "in ieder geval": [
    { dutch: "ieder geval", meaningZh: "每种情况", meaningEn: "each case" },
    { dutch: "in ... geval", meaningZh: "放进“情况”里；整块表示无论如何/至少", meaningEn: "inside a case; the whole chunk means in any case / at least" },
  ],
  "aan de ene kant": [
    { dutch: "ene kant", meaningZh: "一边/一方面", meaningEn: "one side" },
    { dutch: "aan ... kant", meaningZh: "站在某一边看问题", meaningEn: "looking from one side" },
  ],
  "aan de andere kant": [
    { dutch: "andere kant", meaningZh: "另一边/另一方面", meaningEn: "the other side" },
    { dutch: "aan ... kant", meaningZh: "换到另一边看问题", meaningEn: "looking from the other side" },
  ],
  "het hangt ervan af": [
    { dutch: "hangt af", meaningZh: "取决于", meaningEn: "depends" },
    { dutch: "ervan", meaningZh: "指前面那件事/情况", meaningEn: "refers to that matter or situation" },
  ],
  "rekening houden met": [
    { dutch: "rekening houden met", meaningZh: "固定结构：考虑到/顾及", meaningEn: "fixed structure: take into account" },
    { dutch: "met", meaningZh: "后面接要考虑的人或事", meaningEn: "introduces the person or matter considered" },
  ],
  "rekening houden met anderen": [
    { dutch: "rekening houden met", meaningZh: "固定结构：考虑到/顾及", meaningEn: "fixed structure: take into account" },
    { dutch: "anderen", meaningZh: "别人/他人", meaningEn: "others" },
  ],
  "verantwoordelijk zijn voor": [
    { dutch: "verantwoordelijk", meaningZh: "负责的", meaningEn: "responsible" },
    { dutch: "zijn voor", meaningZh: "对后面的事/人负责", meaningEn: "be responsible for what follows" },
  ],
  "de reden is dat": [
    { dutch: "reden", meaningZh: "原因", meaningEn: "reason" },
    { dutch: "is dat", meaningZh: "是……；后面接完整原因句", meaningEn: "is that; followed by a full reason clause" },
  ],
  "mijn voorstel is": [
    { dutch: "mijn", meaningZh: "我的", meaningEn: "my" },
    { dutch: "voorstel", meaningZh: "建议/提案", meaningEn: "proposal" },
    { dutch: "is", meaningZh: "后面接具体建议内容", meaningEn: "is; followed by the proposal content" },
  ],
  "ik stel voor": [
    { dutch: "ik", meaningZh: "我", meaningEn: "I" },
    { dutch: "stel voor", meaningZh: "提出/建议", meaningEn: "suggest / propose" },
  ],
  "ik wil graag uitleg geven": [
    { dutch: "ik wil graag", meaningZh: "我想/我愿意，语气客气", meaningEn: "I would like to; polite" },
    { dutch: "uitleg geven", meaningZh: "给解释/说明", meaningEn: "give an explanation" },
  ],
};

function phraseComponentsForWord(word: WordItem, allWords: WordItem[] = []) {
  const key = normalizeChunkText(word.dutch);
  const override = phraseComponentOverrides[key];
  if (override?.length) return override;

  const tokens = phraseCoreTokens(word.dutch);
  if (tokens.length < 2 || tokens.length > 6) return [];

  const seen = new Set<string>();
  const parts: PhraseComponent[] = [];
  for (const token of tokens) {
    const normalized = normalizeWordText(token);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    const meaning = phrasePartMeaningOverrides[normalized] ?? lexicalMeaningFor(normalized, allWords);
    if (!meaning?.zh || !meaning?.en) continue;
    parts.push({ dutch: token, meaningZh: meaning.zh, meaningEn: meaning.en });
  }
  return parts;
}

function phraseComponentStepForWord(word: WordItem, allWords: WordItem[] = []) {
  if (!phraseLike(word.dutch)) return undefined;
  const parts = phraseComponentsForWord(word, allWords);
  if (parts.length < 2 && !phraseComponentOverrides[normalizeChunkText(word.dutch)]) return undefined;
  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  return {
    labelZh: "词块拆开看",
    labelEn: "Inside the chunk",
    contentZh: `拆开：${parts.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + ")}；合起来：${meaningZh}`,
    contentEn: `Inside: ${parts.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + ")}; together: ${meaningEn}`,
  };
}

const functionWordMemoryPaths: Record<string, FunctionWordSeed> = {
  hij: {
    titleZh: "代词用法",
    titleEn: "Pronoun Use",
    explanationZh: "hij 指男性的“他”，动词通常跟 hij-vorm。",
    explanationEn: "hij means he, and usually takes the hij-form of the verb.",
    functionZh: "hij = 他；后面常见 woont / heet / heeft / is。",
    functionEn: "hij = he; common verbs are woont / heet / heeft / is.",
    noteZh: "说别人时用，不要和礼貌的 u 混。",
    noteEn: "Use it to talk about someone else; do not mix it with polite u.",
    usageZh: "介绍别人、说明住处、说状态。",
    usageEn: "introducing someone, residence, state.",
  },
  zij: {
    titleZh: "代词用法",
    titleEn: "Pronoun Use",
    explanationZh: "zij 可以是“她”，也可以是重读的“他们/她们”。",
    explanationEn: "zij can mean she, or stressed they.",
    functionZh: "单数 zij = 她；复数 zij = 他们/她们。",
    functionEn: "Singular zij = she; plural zij = they.",
    noteZh: "看动词：zij woont 是她，zij wonen 是他们/她们。",
    noteEn: "Check the verb: zij woont is she; zij wonen is they.",
    usageZh: "介绍别人、描述多人。",
    usageEn: "introducing people and describing groups.",
  },
  ze: {
    titleZh: "弱读代词",
    titleEn: "Reduced Pronoun",
    explanationZh: "ze 是 zij 的弱读，口语里很常见。",
    explanationEn: "ze is the reduced form of zij and is very common in speech.",
    functionZh: "ze 可指她，也可指他们/她们。",
    functionEn: "ze can mean she or they.",
    noteZh: "靠动词判断单复数：ze is / ze zijn。",
    noteEn: "Use the verb to judge singular/plural: ze is / ze zijn.",
    usageZh: "日常口语、听力识别。",
    usageEn: "everyday speech and listening.",
  },
  wij: {
    titleZh: "代词用法",
    titleEn: "Pronoun Use",
    explanationZh: "wij 是重读的“我们”，强调这一组人。",
    explanationEn: "wij is stressed we, emphasizing our group.",
    functionZh: "wij = 我们；后面接复数动词。",
    functionEn: "wij = we; it takes plural verbs.",
    noteZh: "强调“我们”时用 wij，普通说话常用 we。",
    noteEn: "Use wij for emphasis; use we in ordinary speech.",
    usageZh: "介绍家庭、团队、共同安排。",
    usageEn: "family, teams, shared plans.",
  },
  we: {
    titleZh: "弱读我们",
    titleEn: "Reduced We",
    explanationZh: "we 是 wij 的弱读，日常说话最常见。",
    explanationEn: "we is the reduced form of wij and is most common in daily speech.",
    functionZh: "we = 我们；轻轻带过，不强调。",
    functionEn: "we = we; light and unstressed.",
    noteZh: "写正式句可用 wij；日常对话 we 很自然。",
    noteEn: "wij works in formal/emphatic lines; we is natural in conversation.",
    usageZh: "约时间、说计划、一起行动。",
    usageEn: "appointments, plans, doing things together.",
  },
  jullie: {
    titleZh: "复数你们",
    titleEn: "Plural You",
    explanationZh: "jullie 是“你们”，对一组人说话。",
    explanationEn: "jullie means you plural, used for a group.",
    functionZh: "jullie = 你们；后面接复数动词。",
    functionEn: "jullie = you all; it takes plural verbs.",
    noteZh: "一个人用 jij/u，一群人用 jullie。",
    noteEn: "Use jij/u for one person; jullie for a group.",
    usageZh: "课堂、家庭、团队对话。",
    usageEn: "class, family, group conversations.",
  },
  maar: {
    titleZh: "转折小词",
    titleEn: "Contrast Word",
    explanationZh: "maar 把前后两半句转折起来，等于“但是”。",
    explanationEn: "maar turns the second half against the first: but.",
    functionZh: "A, maar B = A，但是B。",
    functionEn: "A, maar B = A, but B.",
    noteZh: "maar 后面正常接一句完整信息。",
    noteEn: "After maar, continue with a normal full clause.",
    usageZh: "解释限制、拒绝、改口。",
    usageEn: "limits, refusals, corrections.",
  },
  ook: {
    titleZh: "也/还",
    titleEn: "Also",
    explanationZh: "ook 把某人或某事加进同一组里。",
    explanationEn: "ook adds someone or something into the same set.",
    functionZh: "ik ook = 我也是；ook 放在它补充的那个人、事或信息旁。",
    functionEn: "ik ook = me too; ook sits near what it adds.",
    noteZh: "听到 ook，就找“谁也一样/什么也一样”。",
    noteEn: "When you hear ook, ask who or what is also included.",
    usageZh: "附和、补充、点餐加项。",
    usageEn: "agreeing, adding, ordering extra.",
  },
  nog: {
    titleZh: "还/再",
    titleEn: "Still / More",
    explanationZh: "nog 表示事情没结束，或者再来一次。",
    explanationEn: "nog means still, yet, or one more time.",
    functionZh: "nog een keer = 再一次；nog niet = 还没有。",
    functionEn: "nog een keer = once more; nog niet = not yet.",
    noteZh: "它常把时间感拉长：还在、还没、再来。",
    noteEn: "It stretches the time: still, not yet, again.",
    usageZh: "请求重复、说明还没完成。",
    usageEn: "asking for repetition, saying something is not finished.",
  },
  al: {
    titleZh: "已经",
    titleEn: "Already",
    explanationZh: "al 表示事情比预期更早完成或已经发生。",
    explanationEn: "al marks that something has already happened.",
    functionZh: "al klaar = 已经好了；al thuis = 已经到家。",
    functionEn: "al klaar = already ready; al thuis = already home.",
    noteZh: "al 和 nog 常成对：al = 已经，nog = 还。",
    noteEn: "al contrasts with nog: already versus still/yet.",
    usageZh: "付款、完成、到达、确认进度。",
    usageEn: "payment, completion, arrival, progress checks.",
  },
  want: {
    titleZh: "原因连接",
    titleEn: "Reason Connector",
    explanationZh: "want 接原因，语序保持普通句序。",
    explanationEn: "want gives a reason and keeps normal word order.",
    functionZh: "A, want B = A，因为B。",
    functionEn: "A, want B = A, because B.",
    noteZh: "want 后面不用把动词推到句尾。",
    noteEn: "After want, the verb does not move to the end.",
    usageZh: "解释原因、请假、说明限制。",
    usageEn: "explaining reasons, sick leave, limits.",
  },
  omdat: {
    titleZh: "因为从句",
    titleEn: "Because Clause",
    explanationZh: "omdat 接原因，但动词常被推到从句末尾。",
    explanationEn: "omdat gives a reason, and the verb often moves to the clause end.",
    functionZh: "omdat ik ziek ben = 因为我生病了。",
    functionEn: "omdat ik ziek ben = because I am sick.",
    noteZh: "口语先抓意思；写句子时注意动词到后面。",
    noteEn: "Catch the meaning first; in writing, watch the verb position.",
    usageZh: "解释原因、正式邮件、请假。",
    usageEn: "reasons, formal emails, sick leave.",
  },
  doordat: {
    titleZh: "原因从句",
    titleEn: "Cause Clause",
    explanationZh: "doordat 接具体原因，后面是从句结构。",
    explanationEn: "doordat introduces a concrete cause, followed by a subordinate clause.",
    functionZh: "doordat + 原因从句 = 由于……；动词常在从句后面。",
    functionEn: "doordat + cause clause = because/due to; the verb often moves to the clause end.",
    noteZh: "先看它是不是在解释“为什么发生”；写句子时注意从句词序。",
    noteEn: "First ask whether it explains why something happened; in writing, watch subordinate-clause word order.",
    usageZh: "说明延误、问题、变化的原因。",
    usageEn: "explaining causes of delays, problems, and changes.",
  },
  zodat: {
    titleZh: "目的从句",
    titleEn: "Purpose Clause",
    explanationZh: "zodat 接目的或结果：前半句做一件事，后半句说明“这样就能……”。",
    explanationEn: "zodat introduces purpose or result: do A so that B can happen.",
    functionZh: "A, zodat B = A，这样/以便 B；zodat 后面常接从句。",
    functionEn: "A, zodat B = A, so that B; zodat is followed by a subordinate clause.",
    noteZh: "看到 zodat，先找前面做了什么，再看后面想达到什么目的。",
    noteEn: "When you see zodat, find the action before it and the purpose/result after it.",
    usageZh: "说明目的、安排、发送材料的原因。",
    usageEn: "stating purpose, arrangements, or why something is sent.",
  },
  hoewel: {
    titleZh: "让步从句",
    titleEn: "Concession Clause",
    explanationZh: "hoewel 表示“虽然”，先承认一个情况，再接另一边的结果。",
    explanationEn: "hoewel means although: admit one fact, then give the other side.",
    functionZh: "hoewel + 从句 = 虽然……；常和 maar/toch 的语气相近。",
    functionEn: "hoewel + clause = although; it often feels close to a maar/toch contrast.",
    noteZh: "先抓让步关系：虽然 A，但重点通常在后面的 B。",
    noteEn: "Catch the concession: although A, the main point is usually B.",
    usageZh: "表达转折、让步、意见对比。",
    usageEn: "contrast, concession, opinion contrast.",
  },
  voordat: {
    titleZh: "先后从句",
    titleEn: "Before Clause",
    explanationZh: "voordat 表示“在……之前”，用来说明动作发生的先后。",
    explanationEn: "voordat means before, marking what happens before another action.",
    functionZh: "voordat + 从句 = 在……之前；从句里的动词通常去后面。",
    functionEn: "voordat + clause = before; the verb in the subordinate clause usually goes to the end.",
    noteZh: "先找两个动作，再判断哪个动作发生在前。",
    noteEn: "Find the two actions first, then decide which one happens earlier.",
    usageZh: "说明步骤、时间顺序、办事流程。",
    usageEn: "steps, time order, procedures.",
  },
  nadat: {
    titleZh: "之后从句",
    titleEn: "After Clause",
    explanationZh: "nadat 表示“在……之后”，用来接已经先发生的那件事。",
    explanationEn: "nadat means after, introducing the action that happened first.",
    functionZh: "nadat + 从句 = 在……之后；常用于说明前后顺序。",
    functionEn: "nadat + clause = after; it marks sequence.",
    noteZh: "先看 nadat 后面的动作完成了什么，再接后续动作。",
    noteEn: "Read what is completed after nadat, then move to the later action.",
    usageZh: "叙述经历、流程、前后步骤。",
    usageEn: "experiences, processes, step order.",
  },
  dus: {
    titleZh: "结果连接",
    titleEn: "Result Connector",
    explanationZh: "dus 接结果，后面通常保持主句语序。",
    explanationEn: "dus introduces a result and usually keeps main-clause word order.",
    functionZh: "A, dus B = A，所以 B。",
    functionEn: "A, dus B = A, so B.",
    noteZh: "先看前面原因，再看 dus 后面的结论或行动。",
    noteEn: "Read the reason before it, then the conclusion/action after dus.",
    usageZh: "说明结果、决定、下一步。",
    usageEn: "results, decisions, next steps.",
  },
  daarom: {
    titleZh: "原因到结果",
    titleEn: "Therefore",
    explanationZh: "daarom 把前面的原因推到后面的结论，相当于“因此/所以”。",
    explanationEn: "daarom turns the previous reason into a conclusion: therefore.",
    functionZh: "A. Daarom B = 因为 A，所以 B；daarom 放句首时后面常接动词。",
    functionEn: "A. Daarom B = because A, therefore B; at sentence start, daarom is often followed by the verb.",
    noteZh: "先看前一句原因，再看 daarom 后面的决定或结果。",
    noteEn: "Read the previous reason first, then the decision/result after daarom.",
    usageZh: "解释决定、说明结果、写作衔接。",
    usageEn: "decisions, results, writing links.",
  },
  daardoor: {
    titleZh: "由此结果",
    titleEn: "As a Result",
    explanationZh: "daardoor 表示“由于这件事造成……”，强调前面情况带来的结果。",
    explanationEn: "daardoor means as a result of that, emphasizing the consequence of the previous situation.",
    functionZh: "A. Daardoor B = 因此造成 B；句首 daardoor 后面常接动词。",
    functionEn: "A. Daardoor B = as a result, B; at sentence start, daardoor is often followed by the verb.",
    noteZh: "它比 daarom 更像“这个原因导致了结果”。",
    noteEn: "It is more result-causing than plain daarom.",
    usageZh: "说明延误、问题、影响。",
    usageEn: "delays, problems, effects.",
  },
  toch: {
    titleZh: "转折坚持",
    titleEn: "Still / After All",
    explanationZh: "toch 常表示“虽然有前面的情况，但还是/却”。",
    explanationEn: "toch often means still/after all despite something before it.",
    functionZh: "toch = 还是/却；把预期反过来。",
    functionEn: "toch = still/after all; it flips the expectation.",
    noteZh: "听到 toch，找前面那个被它反转的预期。",
    noteEn: "When you hear toch, look for the expectation it reverses.",
    usageZh: "改口、坚持、让步后的结果。",
    usageEn: "correction, insistence, result after concession.",
  },
  als: {
    titleZh: "条件从句",
    titleEn: "If / When Clause",
    explanationZh: "als 可以表示“如果/当……时”，后面接条件或时间从句。",
    explanationEn: "als can mean if or when, followed by a condition/time clause.",
    functionZh: "als + 从句 = 如果/当……；动词常到从句后面。",
    functionEn: "als + clause = if/when; the verb often moves to the clause end.",
    noteZh: "先判断是在说条件，还是在说时间。",
    noteEn: "First decide whether it is a condition or a time relation.",
    usageZh: "提出条件、说明情况、安排下一步。",
    usageEn: "conditions, situations, next steps.",
  },
  toen: {
    titleZh: "过去时间从句",
    titleEn: "Past-Time Connector",
    explanationZh: "toen 指过去某个时候发生的事。",
    explanationEn: "toen points to something that happened at a past time.",
    functionZh: "toen + 过去事件 = 当时/那时……。",
    functionEn: "toen + past event = when/then in the past.",
    noteZh: "先把时间放到过去；现在或将来的“当……时”通常不用 toen。",
    noteEn: "Place it in the past first; present/future when usually does not use toen.",
    usageZh: "叙述经历、说明过去发生顺序。",
    usageEn: "telling experiences and past sequences.",
  },
  terwijl: {
    titleZh: "同时/对比连接",
    titleEn: "While / Contrast Connector",
    explanationZh: "terwijl 可以表示“同时”，也可以表示“然而/而”。",
    explanationEn: "terwijl can mean while at the same time, or while in contrast.",
    functionZh: "terwijl + 从句 = 当……时 / 而……。",
    functionEn: "terwijl + clause = while / whereas.",
    noteZh: "先判断是时间同时，还是两件事在对比。",
    noteEn: "First decide whether it marks simultaneous time or contrast.",
    usageZh: "描述同时发生、对比两个情况。",
    usageEn: "simultaneous actions and contrasting situations.",
  },
  bovendien: {
    titleZh: "补充连接",
    titleEn: "Addition Connector",
    explanationZh: "bovendien 用来补充一个更进一步的信息，相当于“此外/而且”。",
    explanationEn: "bovendien adds an extra point: moreover / in addition.",
    functionZh: "bovendien 常放句首：前面一个理由，后面再加一个理由。",
    functionEn: "bovendien often starts a sentence: one point before, another point after.",
    noteZh: "别当普通“也”记；它更像写作里加第二个理由。",
    noteEn: "Do not treat it as plain also; it is more like adding a second reason in writing.",
    usageZh: "补充理由、正式说明、观点展开。",
    usageEn: "adding reasons, formal explanation, developing an argument.",
  },
  namelijk: {
    titleZh: "解释补充",
    titleEn: "Namely / Explanation",
    explanationZh: "namelijk 用来补一句解释，告诉别人前一句为什么成立。",
    explanationEn: "namelijk adds an explanation for the previous statement.",
    functionZh: "A. Namelijk B = A，具体来说/因为 B。",
    functionEn: "A. Namelijk B = A, namely/because B.",
    noteZh: "看到 namelijk，往前找它在解释哪句话。",
    noteEn: "When you see namelijk, look back to the statement it explains.",
    usageZh: "解释理由、补充细节、正式说明。",
    usageEn: "reasons, extra detail, formal explanation.",
  },
  daarnaast: {
    titleZh: "并列补充",
    titleEn: "Additional Point",
    explanationZh: "daarnaast 表示“除此之外/另外”，把信息并排加上。",
    explanationEn: "daarnaast means besides/in addition, adding a parallel point.",
    functionZh: "daarnaast = 另外；常接第二点、第二个事实。",
    functionEn: "daarnaast = besides/in addition; often introduces a second point.",
    noteZh: "它不是地点 daar + naast 的普通空间意思，写作里常是补充连接。",
    noteEn: "In writing it is usually an addition connector, not a literal there + next to.",
    usageZh: "列举、补充信息、正式邮件。",
    usageEn: "listing, adding information, formal emails.",
  },
  bijvoorbeeld: {
    titleZh: "举例连接",
    titleEn: "Example Marker",
    explanationZh: "bijvoorbeeld 用来引出例子。",
    explanationEn: "bijvoorbeeld introduces an example.",
    functionZh: "bijvoorbeeld = 例如；放在例子前或句中。",
    functionEn: "bijvoorbeeld = for example; it can stand before or inside the example.",
    noteZh: "先找它后面举的那个例子。",
    noteEn: "Look for the example that follows it.",
    usageZh: "举例、解释观点、写作展开。",
    usageEn: "examples, explaining points, expanding writing.",
  },
  volgens: {
    titleZh: "来源依据",
    titleEn: "According To",
    explanationZh: "volgens 表示“根据/按照”，后面接信息来源或规则。",
    explanationEn: "volgens means according to, followed by a source or rule.",
    functionZh: "volgens + 人/规则/文件 = 根据……。",
    functionEn: "volgens + person/rule/document = according to.",
    noteZh: "先看后面是谁说的、哪份文件写的、哪条规则规定的。",
    noteEn: "Check what follows: who says it, which document states it, or which rule applies.",
    usageZh: "引用规定、说明来源、表达观点依据。",
    usageEn: "rules, sources, basis for an opinion.",
  },
  kortom: {
    titleZh: "总结连接",
    titleEn: "Summary Connector",
    explanationZh: "kortom 用来收束前面的内容，相当于“总之”。",
    explanationEn: "kortom wraps up what came before: in short.",
    functionZh: "kortom = 总之；后面接结论。",
    functionEn: "kortom = in short; it introduces the conclusion.",
    noteZh: "先看前面一串信息，再用 kortom 收成一句结论。",
    noteEn: "Read the information before it, then use kortom to land the conclusion.",
    usageZh: "总结观点、收尾、给结论。",
    usageEn: "summarizing opinions, closing, giving a conclusion.",
  },
  "in ieder geval": {
    titleZh: "保底结论",
    titleEn: "In Any Case",
    explanationZh: "in ieder geval 表示“无论如何/至少这一点确定”。",
    explanationEn: "in ieder geval means in any case: at least this remains true.",
    functionZh: "in ieder geval = 无论如何；先把最确定的一点落下来。",
    functionEn: "in ieder geval = in any case; it lands the point that remains certain.",
    noteZh: "前面可能有不确定，但这句话后面通常是保底结论。",
    noteEn: "Something before may be uncertain, but what follows is the fallback/certain point.",
    usageZh: "收束讨论、表达底线、安排下一步。",
    usageEn: "closing a discussion, setting a baseline, next steps.",
  },
  "aan de ene kant": {
    titleZh: "一方面",
    titleEn: "On One Hand",
    explanationZh: "aan de ene kant 用来开启第一边观点，后面通常会有另一边。",
    explanationEn: "aan de ene kant opens one side of an argument, usually followed by the other side.",
    functionZh: "aan de ene kant = 一方面；常和 aan de andere kant 对着用。",
    functionEn: "aan de ene kant = on one hand; often pairs with aan de andere kant.",
    noteZh: "看到它，准备等另一边观点出现。",
    noteEn: "When you see it, expect the other side to appear.",
    usageZh: "比较利弊、写作观点展开。",
    usageEn: "pros and cons, developing an argument.",
  },
  "aan de andere kant": {
    titleZh: "另一方面",
    titleEn: "On The Other Hand",
    explanationZh: "aan de andere kant 接另一边观点，和 aan de ene kant 配成对比。",
    explanationEn: "aan de andere kant gives the other side, paired with aan de ene kant.",
    functionZh: "aan de andere kant = 另一方面；用来补出相反或补充角度。",
    functionEn: "aan de andere kant = on the other hand; it adds the opposite or balancing angle.",
    noteZh: "先找前面那一边，再看这里补出的另一边。",
    noteEn: "Find the first side before it, then read the balancing side here.",
    usageZh: "比较观点、让步、写作转折。",
    usageEn: "comparing views, concession, writing contrast.",
  },
  niet: {
    titleZh: "否定动作",
    titleEn: "Negating Action",
    explanationZh: "niet 常否定动作、状态或整句话。",
    explanationEn: "niet often negates an action, state, or whole sentence.",
    functionZh: "begrijp niet = 不明白；kom niet = 不来。",
    functionEn: "begrijp niet = do not understand; kom niet = do not come.",
    noteZh: "否定名词数量时常用 geen，不是 niet。",
    noteEn: "For no amount of a noun, use geen rather than niet.",
    usageZh: "拒绝、说明不会、听不懂。",
    usageEn: "refusing, saying cannot, not understanding.",
  },
  geen: {
    titleZh: "否定名词",
    titleEn: "Negating Noun",
    explanationZh: "geen 放在名词前，表示“没有一个/没有任何”。",
    explanationEn: "geen stands before a noun and means no / not any.",
    functionZh: "geen tijd = 没时间；geen afspraak = 没预约。",
    functionEn: "geen tijd = no time; geen afspraak = no appointment.",
    noteZh: "有名词跟着时，先想 geen。",
    noteEn: "When a noun follows, think geen first.",
    usageZh: "没时间、没预约、没证件。",
    usageEn: "no time, no appointment, no document.",
  },
  wel: {
    titleZh: "反向肯定",
    titleEn: "Corrective Yes",
    explanationZh: "wel 常用来纠正否定：其实有/其实会/其实来。",
    explanationEn: "wel often corrects a negative: actually yes.",
    functionZh: "ik kom wel = 我会来的。",
    functionEn: "ik kom wel = I will come after all.",
    noteZh: "听到 wel，通常前面有个“不”的压力。",
    noteEn: "wel often answers pressure from a no/not idea.",
    usageZh: "澄清、反驳、补充肯定。",
    usageEn: "clarifying, correcting, affirming.",
  },
  en: {
    titleZh: "并列连接",
    titleEn: "And",
    explanationZh: "en 把两个词、动作或句子并排放在一起。",
    explanationEn: "en places two words, actions, or clauses side by side.",
    functionZh: "brood en melk = 面包和牛奶。",
    functionEn: "brood en melk = bread and milk.",
    noteZh: "en 只负责并列，不负责转折或原因。",
    noteEn: "en only adds; it does not contrast or explain.",
    usageZh: "购物、列清单、连续动作。",
    usageEn: "shopping, lists, chained actions.",
  },
  of: {
    titleZh: "二选一",
    titleEn: "Or",
    explanationZh: "of 把选择摆出来，等于“或/还是”。",
    explanationEn: "of presents a choice: or.",
    functionZh: "koffie of thee = 咖啡还是茶。",
    functionEn: "koffie of thee = coffee or tea.",
    noteZh: "问选择时，of 后面就是另一个选项。",
    noteEn: "In choice questions, the option after of is the alternative.",
    usageZh: "点餐、预约、确认选项。",
    usageEn: "ordering, appointments, confirming options.",
  },
  in: {
    titleZh: "in 常见结构",
    titleEn: "in patterns",
    explanationZh: "in 可以接地点、容器或时间段；中文常翻成“在”，但用法要看后面接什么。",
    explanationEn: "in is not just one word for at/in; read what follows: a place, container, or time period.",
    functionZh: "先认结构：in + 国家/城市；in + 容器；in + 月份/时间段。",
    functionEn: "Read the pattern first: in + country/city; in + container; in + month/period.",
    noteZh: "别只按中文意思死记；先看后面是地点、容器，还是时间。",
    noteEn: "Do not memorize by the English meaning only; check whether the next phrase is a place, container, or time.",
    usageZh: "说住处、东西位置、月份或一天里的时间段。",
    usageEn: "places you live, where things are, months, and parts of the day.",
  },
  uit: {
    titleZh: "uit 常见结构",
    titleEn: "uit patterns",
    explanationZh: "uit 先看“从里面到外面/离开内部”；来源只是其中一个分支。",
    explanationEn: "uit first means moving from inside to outside / leaving an inside space; origin is only one branch.",
    functionZh: "先认结构：uit + 容器；uit + 交通；uit + app/系统；uit + 国家/来源。",
    functionEn: "Read the pattern first: uit + container; uit + transport; uit + app/system; uit + country/origin.",
    noteZh: "别只记“来自”；看到后面的名词再判断是出来、下车、退出，还是来源。",
    noteEn: "Do not learn only from/origin; check the noun after it: out of, get off, log out, or origin.",
    usageZh: "拿出来、下车、退出系统，也可说来源。",
    usageEn: "taking something out, getting off, logging out, and also origin.",
  },
  het: {
    titleZh: "het 用法",
    titleEn: "het Use",
    explanationZh: "het 可以是冠词“the”，也可以指“它/这件事”。",
    explanationEn: "het can be the article the, or it can mean it.",
    functionZh: "het formulier = 这张表格；ik begrijp het = 我懂这件事。",
    functionEn: "het formulier = the form; ik begrijp het = I understand it.",
    noteZh: "名词前看冠词；动词后常像英语 it。",
    noteEn: "Before nouns it is an article; after verbs it often works like it.",
    usageZh: "het-名词、表达“它/这件事”。",
    usageEn: "het-nouns and saying it / the matter.",
  },
  de: {
    titleZh: "de 用法",
    titleEn: "de Use",
	    explanationZh: "de 是最常见冠词，贴在很多名词前。",
	    explanationEn: "de is the most common article and sits before many nouns.",
	    functionZh: "de bus / de stad / de afspraak。",
	    functionEn: "de bus / de stad / de afspraak.",
	    noteZh: "de 像名词前的小标签：de bus、de stad、de afspraak。",
	    noteEn: "de works like a small label before nouns: de bus, de stad, de afspraak.",
    usageZh: "de-名词、复数名词、日常物品。",
    usageEn: "de-nouns, plural nouns, everyday objects.",
  },
  een: {
    titleZh: "不定冠词",
    titleEn: "Indefinite Article",
    explanationZh: "een 放在单数名词前，表示“一个/一件”。",
    explanationEn: "een stands before a singular noun and means a/an or one.",
    functionZh: "een vraag = 一个问题；een afspraak = 一个预约。",
    functionEn: "een vraag = a question; een afspraak = an appointment.",
    noteZh: "第一次提到某物，常用 een。",
    noteEn: "Use een when mentioning something for the first time.",
    usageZh: "提问题、预约、说一个东西。",
    usageEn: "questions, appointments, one item.",
  },
  dit: {
    titleZh: "近处这个",
    titleEn: "This",
    explanationZh: "dit 先按英文 this 理解：手边这个东西，或正在说的这件事。",
    explanationEn: "Read dit through English this: this thing nearby, or this matter we are talking about.",
    functionZh: "后面接名词：dit formulier = 这张表；单独用：dit is goed = 这样可以。",
    functionEn: "Before a noun: dit formulier = this form; alone: dit is goed = this is fine.",
    noteZh: "近处用 dit，远一点用 dat；初学先记 dit = this。",
    noteEn: "Use dit for near and dat for farther away; first learn dit = this.",
    usageZh: "指表格、文件、当前事情。",
    usageEn: "pointing to forms, documents, current matters.",
  },
  dat: {
    titleZh: "远处那个",
    titleEn: "That",
    explanationZh: "dat 指远一点的“那个/那件事”。",
    explanationEn: "dat means that farther thing or matter.",
    functionZh: "dat klopt = 那对；dat formulier = 那张表。",
    functionEn: "dat klopt = that is correct; dat formulier = that form.",
    noteZh: "不在手边、刚说过的事，常用 dat。",
    noteEn: "Use dat for something farther away or just mentioned.",
    usageZh: "确认信息、指代刚说过的事。",
    usageEn: "confirming information, referring back.",
  },
  om: {
    titleZh: "om 常见结构",
    titleEn: "om patterns",
    explanationZh: "om 不能单独硬翻；先看后面接钟点、te+动词、请求内容，还是地点短语。",
    explanationEn: "Do not translate om by itself; check whether it is followed by clock time, te + verb, a requested item, or a place phrase.",
    functionZh: "先认结构：om + 钟点；om ... te + 动词；vragen om + 名词；om + 地点。",
    functionEn: "Read the pattern first: om + clock time; om ... te + verb; vragen om + noun; om + place.",
    noteZh: "具体意思放进短语块记；记忆路径只教你怎么判断。",
    noteEn: "Learn the actual meanings in phrase chunks; the memory path teaches how to decide.",
    usageZh: "约时间、说明目的、请求帮助、说拐角/周围位置。",
    usageEn: "appointments, purpose, asking for help, and around/corner location phrases.",
  },
  naar: {
    titleZh: "naar 常见结构",
    titleEn: "naar patterns",
    explanationZh: "naar 重点不是“到”这个字，而是目的地或方向。",
    explanationEn: "naar is about a destination or direction, not a single Chinese gloss.",
    functionZh: "先认结构：naar + 地点/机构；naar huis；naar + 方向。",
    functionEn: "Read the pattern first: naar + place/institution; naar huis; naar + direction.",
    noteZh: "有“去往/朝向”的感觉时，优先检查 naar。",
    noteEn: "When the idea is going toward something, check for naar.",
    usageZh: "去医生、去学校、回家、指方向。",
    usageEn: "going to the doctor, school, home, or a direction.",
  },
  op: {
    titleZh: "op 常见结构",
    titleEn: "op patterns",
    explanationZh: "op 常看“表面上”、星期/日期，或固定时间短语。",
    explanationEn: "op often marks a surface, a weekday/date, or a fixed time phrase.",
    functionZh: "先认结构：op + 表面；op + 星期/日期；op tijd。",
    functionEn: "Read the pattern first: op + surface; op + weekday/date; op tijd.",
    noteZh: "不要只背 on；日期和准时也常用 op。",
    noteEn: "Do not only map it to on; dates and punctuality also use op.",
    usageZh: "说东西位置、约日期、说准时。",
    usageEn: "object location, appointment dates, being on time.",
  },
  bij: {
    titleZh: "bij 常见结构",
    titleEn: "bij patterns",
    explanationZh: "bij 常表示在某人/机构那里，也可表示靠近某个点。",
    explanationEn: "bij often means at someone's place or institution, and can mean near a point.",
    functionZh: "先认结构：bij + 人/机构；bij iemand thuis；bij + 入口/柜台。",
    functionEn: "Read the pattern first: bij + person/institution; bij someone's home; bij + entrance/desk.",
    noteZh: "看医生、办事、去别人家，不要硬套 in/at。",
    noteEn: "For doctors, service desks, or someone's place, do not force in/at.",
    usageZh: "看医生、柜台办事、在某人家、找入口。",
    usageEn: "doctor visits, service desks, someone's place, entrances.",
  },
  met: {
    titleZh: "met 常见结构",
    titleEn: "met patterns",
    explanationZh: "met 常看“和谁一起”、用什么方式/工具，或带着什么状态。",
    explanationEn: "met often marks company, a method/tool, or a state something comes with.",
    functionZh: "先认结构：met + 人；met + 交通/工具；met + 状态。",
    functionEn: "Read the pattern first: met + person; met + transport/tool; met + state.",
    noteZh: "它不是只等于 with；付款、交通也常用 met。",
    noteEn: "It is not only with; payment and transport often use met too.",
    usageZh: "同行、交通方式、付款方式、紧急状态。",
    usageEn: "company, transport, payment method, urgency.",
  },
  voor: {
    titleZh: "voor 常见结构",
    titleEn: "voor patterns",
    explanationZh: "voor 要看它后面是人、用途/目的，还是时间点前后关系。",
    explanationEn: "voor depends on what follows: a person, a purpose, or a before-time relation.",
    functionZh: "先认结构：voor + 人；voor + 用途/目的；voor + 时间/预约。",
    functionEn: "Read the pattern first: voor + person; voor + purpose; voor + time/appointment.",
    noteZh: "不要只背 for；它也能表示“之前/前面”。",
    noteEn: "Do not only memorize for; it can also mean before/in front of.",
    usageZh: "给别人、说明用途、说截止或预约前。",
    usageEn: "for someone, purpose, deadlines, or before appointments.",
  },
  van: {
    titleZh: "van 常见结构",
    titleEn: "van patterns",
    explanationZh: "van 先看后面是谁/哪里/哪一天：常表示来源、所属，或“从……开始”。",
    explanationEn: "van depends on what follows: a person, place, or day; it often marks source, possession, or starting point.",
    functionZh: "先认结构：van + 人；van + 机构/地点；名词 + van + 名词；van + 时间。",
    functionEn: "Read the pattern first: van + person; van + institution/place; noun + van + noun; van + time.",
    noteZh: "不要只背 from；“谁的/什么的”也常用 van。",
    noteEn: "Do not only memorize from; van often marks of/possession too.",
    usageZh: "说来源、归属、文件所属、起始时间。",
    usageEn: "source, possession, document ownership, starting time.",
  },
  aan: {
    titleZh: "aan 常见结构",
    titleEn: "aan patterns",
    explanationZh: "aan 常看接触点、对象，或“开着/穿着”这类状态。",
    explanationEn: "aan often marks a contact point, a recipient/object, or states such as on/wearing.",
    functionZh: "先认结构：aan + 地点/物体；动词 + aan + 人；衣服/灯 + aan。",
    functionEn: "Read the pattern first: aan + place/object; verb + aan + person; clothing/light + aan.",
    noteZh: "它不是固定等于 on；门口、柜台、穿着、开灯都可能用 aan。",
    noteEn: "It is not simply on; doors, desks, wearing, and lights can all use aan.",
    usageZh: "柜台/门口、给某人、穿着、开着。",
    usageEn: "desks/doors, giving to someone, wearing, switched on.",
  },
  over: {
    titleZh: "over 常见结构",
    titleEn: "over patterns",
    explanationZh: "over 常看“关于”、越过某处，或时间上“再过多久”。",
    explanationEn: "over often means about, over/across a place, or in a certain amount of time.",
    functionZh: "先认结构：over + 话题；over + 地点；over + 时间数量。",
    functionEn: "Read the pattern first: over + topic; over + place; over + time amount.",
    noteZh: "投诉、账单、路线、时间都可能用 over；看后面的名词。",
    noteEn: "Complaints, bills, routes, and time can all use over; read what follows.",
    usageZh: "谈问题、讲路线、说几天后。",
    usageEn: "talking about issues, routes, and time from now.",
  },
  door: {
    titleZh: "door 常见结构",
    titleEn: "door patterns",
    explanationZh: "door 常表示穿过，也能表示原因；在分离动词里还会表示转发/继续。",
    explanationEn: "door often means through, can mark cause, and in separable verbs can mean forward/continue.",
    functionZh: "先认结构：door + 地点；door + 原因；动词 + door。",
    functionEn: "Read the pattern first: door + place; door + cause; verb + door.",
    noteZh: "别只背 through；延误原因和转告也常见。",
    noteEn: "Do not only memorize through; causes and passing on are common too.",
    usageZh: "穿过地点、说明原因、转告/继续。",
    usageEn: "moving through places, giving causes, passing on/continuing.",
  },
  tegen: {
    titleZh: "tegen 常见结构",
    titleEn: "tegen patterns",
    explanationZh: "tegen 常看接触/反对，也能表示接近某个时间点。",
    explanationEn: "tegen often marks against/contact, opposition, or approaching a time.",
    functionZh: "先认结构：tegen + 物体；bezwaar tegen + 事情；tegen + 时间。",
    functionEn: "Read the pattern first: tegen + object; bezwaar tegen + matter; tegen + time.",
    noteZh: "门、墙、决定、时间点，意思不一样；看短语块。",
    noteEn: "Doors, walls, decisions, and time points produce different meanings; use phrase chunks.",
    usageZh: "推/靠某物、提出异议、说快到几点。",
    usageEn: "against an object, objecting, and around a time.",
  },
  tot: {
    titleZh: "tot 常见结构",
    titleEn: "tot patterns",
    explanationZh: "tot 常表示“直到/到……为止”，也出现在告别短语里。",
    explanationEn: "tot often means until/up to, and appears in goodbye phrases.",
    functionZh: "先认结构：tot + 时间；tot + 下次见面；tot ziens。",
    functionEn: "Read the pattern first: tot + time; tot + next meeting; tot ziens.",
    noteZh: "看到 tot morgen 既可能是明天见，也有“直到明天”的底色。",
    noteEn: "tot morgen can be see you tomorrow, with the base idea of until tomorrow.",
    usageZh: "说截止、营业时间、告别。",
    usageEn: "deadlines, opening hours, goodbyes.",
  },
  na: {
    titleZh: "na 常见结构",
    titleEn: "na patterns",
    explanationZh: "na 主要看时间顺序：某事之后、某天之后。",
    explanationEn: "na mainly marks sequence in time: after something or after a day.",
    functionZh: "先认结构：na + 活动；na + 预约/课程；na + 时间。",
    functionEn: "Read the pattern first: na + activity; na + appointment/class; na + time.",
    noteZh: "它通常不是地点介词；先按“之后”判断。",
    noteEn: "It is usually not a place preposition; start with after.",
    usageZh: "饭后、课后、预约后、今天之后。",
    usageEn: "after meals, class, appointments, or today.",
  },
  zonder: {
    titleZh: "zonder 常见结构",
    titleEn: "zonder patterns",
    explanationZh: "zonder 后面接你缺少的东西：没有预约、没有卡、没有外套。",
    explanationEn: "zonder is followed by what is missing: no appointment, no card, no coat.",
    functionZh: "先认结构：zonder + 名词；zonder + 人/东西。",
    functionEn: "Read the pattern first: zonder + noun; zonder + person/thing.",
    noteZh: "这是很好用的生存词：办事前先看有没有 zonder afspraak。",
    noteEn: "This is a survival word: before admin errands, check for zonder afspraak.",
    usageZh: "没预约、没证件、没卡、没工作。",
    usageEn: "without appointment, ID, card, or work.",
  },
  onder: {
    titleZh: "onder 常见结构",
    titleEn: "onder patterns",
    explanationZh: "onder 可以是空间下面，也可以是年龄/数量以下，或“名义/条件下”。",
    explanationEn: "onder can mean physically under, below an age/number, or under a name/condition.",
    functionZh: "先认结构：onder + 物体；onder + 数字；onder + naam/voorwaarde。",
    functionEn: "Read the pattern first: onder + object; onder + number; onder + name/condition.",
    noteZh: "不要只背“下面”；表格和规则里也常见。",
    noteEn: "Do not only memorize under; forms and rules often use it too.",
    usageZh: "位置、年龄限制、名字/条件。",
    usageEn: "location, age limits, names/conditions.",
  },
  tussen: {
    titleZh: "tussen 常见结构",
    titleEn: "tussen patterns",
    explanationZh: "tussen 看两个边界：两个地点、两件事、两个时间点之间。",
    explanationEn: "tussen marks two boundaries: between places, events, or time points.",
    functionZh: "先认结构：tussen A en B；tussen + 两个活动/时间。",
    functionEn: "Read the pattern first: tussen A en B; tussen + two events/times.",
    noteZh: "它天然需要两个端点；看到 en 常一起判断。",
    noteEn: "It naturally needs two endpoints; often look for en.",
    usageZh: "两个预约之间、时间段、两件事之间。",
    usageEn: "between appointments, time ranges, or two events.",
  },
  waar: {
    titleZh: "问地点",
    titleEn: "Where",
    explanationZh: "waar 用来问“在哪里/到哪里”。",
    explanationEn: "waar asks where.",
    functionZh: "Waar woont u? = 您住在哪里？",
    functionEn: "Waar woont u? = Where do you live?",
    noteZh: "问地点、柜台、房间、地址都用它开头。",
    noteEn: "Use it for places, counters, rooms, addresses.",
    usageZh: "问路、问地址、找窗口。",
    usageEn: "directions, addresses, finding counters.",
  },
  wanneer: {
    titleZh: "问时间",
    titleEn: "When",
    explanationZh: "wanneer 用来问“什么时候”。",
    explanationEn: "wanneer asks when.",
    functionZh: "Wanneer komt u? = 您什么时候来？",
    functionEn: "Wanneer komt u? = When are you coming?",
    noteZh: "问日期、时间、预约都可用。",
    noteEn: "Use it for dates, times, appointments.",
    usageZh: "预约、改时间、确认日期。",
    usageEn: "appointments, rescheduling, dates.",
  },
  wie: {
    titleZh: "问人",
    titleEn: "Who",
    explanationZh: "wie 用来问“谁”。",
    explanationEn: "wie asks who.",
    functionZh: "Wie bent u? = 您是谁？",
    functionEn: "Wie bent u? = Who are you?",
    noteZh: "问联系人、负责人、来电人时用。",
    noteEn: "Use it for contact persons, responsible people, callers.",
    usageZh: "身份、联系人、负责人。",
    usageEn: "identity, contact person, responsible person.",
  },
  wat: {
    titleZh: "问内容",
    titleEn: "What",
    explanationZh: "wat 用来问“什么/什么内容”。",
    explanationEn: "wat asks what.",
    functionZh: "Wat bedoelt u? = 您什么意思？",
    functionEn: "Wat bedoelt u? = What do you mean?",
    noteZh: "没听懂任务、信件、要求时很有用。",
    noteEn: "Useful when you do not understand a task, letter, or request.",
    usageZh: "问内容、任务、意思。",
    usageEn: "asking content, task, meaning.",
  },
  hoe: {
    titleZh: "问方式/状态",
    titleEn: "How",
    explanationZh: "hoe 用来问方式、状态或程度。",
    explanationEn: "hoe asks how, condition, or degree.",
    functionZh: "Hoe gaat het? = 你好吗？Hoe laat? = 几点？",
    functionEn: "Hoe gaat het? = How are you? Hoe laat? = What time?",
    noteZh: "问怎么做、身体怎样、几点，都可能见到 hoe。",
    noteEn: "Use it for how to do something, condition, or time.",
    usageZh: "问方式、问状态、问时间。",
    usageEn: "method, condition, time.",
  },
  welk: {
    titleZh: "哪个 het-词",
    titleEn: "Which Het-Noun",
    explanationZh: "welk 问“哪个”，常配 het-词或单数中性名词。",
    explanationEn: "welk asks which, often with het-nouns or neuter singular nouns.",
    functionZh: "welk nummer = 哪个号码。",
    functionEn: "welk nummer = which number.",
    noteZh: "看后面名词：het-词常用 welk。",
    noteEn: "Check the following noun: het-nouns often use welk.",
    usageZh: "问号码、文件、表格选项。",
    usageEn: "numbers, documents, form options.",
  },
  welke: {
    titleZh: "哪个 de/复数词",
    titleEn: "Which De/Plural Noun",
    explanationZh: "welke 问“哪个/哪些”，常配 de-词或复数。",
    explanationEn: "welke asks which, often with de-nouns or plurals.",
    functionZh: "welke dag = 哪一天；welke documenten = 哪些文件。",
    functionEn: "welke dag = which day; welke documenten = which documents.",
    noteZh: "de-词和复数名词前，welke 很常见。",
    noteEn: "With de-nouns and plural nouns, welke is common.",
    usageZh: "问日期、文件、选项。",
    usageEn: "dates, documents, options.",
  },
};

const functionWordShortHooks: Record<string, { zh: string; en: string }> = {
  hij: { zh: "hij=他", en: "hij = he" },
  zij: { zh: "zij看动词分她/他们", en: "zij uses the verb to show she/they" },
  ze: { zh: "ze弱读：她或他们", en: "ze is reduced she/they" },
  wij: { zh: "wij=强调我们", en: "wij = stressed we" },
  we: { zh: "we=日常我们", en: "we = everyday we" },
  jullie: { zh: "jullie=你们", en: "jullie = you plural" },
  maar: { zh: "maar=但是转弯", en: "maar turns the sentence: but" },
  ook: { zh: "ook=也加进去", en: "ook adds also" },
  nog: { zh: "nog=还没结束", en: "nog means still / more" },
  al: { zh: "al=已经发生", en: "al means already" },
  want: { zh: "want后面正常语序", en: "want keeps normal word order" },
  omdat: { zh: "omdat把动词推后", en: "omdat pushes the verb back" },
  niet: { zh: "niet否定动作", en: "niet negates actions" },
  geen: { zh: "geen否定名词", en: "geen negates nouns" },
  wel: { zh: "wel把否定扳回来", en: "wel corrects a negative" },
  en: { zh: "en=并排加上", en: "en adds items side by side" },
  of: { zh: "of=二选一", en: "of presents a choice" },
  in: { zh: "in按地点/时间记", en: "read in by place/time pattern" },
  uit: { zh: "uit先看出来/离开", en: "read uit first as out/leaving" },
  het: { zh: "het=冠词或it", en: "het = article or it" },
  de: { zh: "de贴在名词前", en: "de sticks before nouns" },
  een: { zh: "een=一个/某个", en: "een = a/an or one" },
  dit: { zh: "dit=手边这个", en: "dit = this nearby thing" },
  dat: { zh: "dat=那件事", en: "dat = that thing/matter" },
  om: { zh: "om要按结构记", en: "learn om by pattern" },
  naar: { zh: "naar看目的地", en: "read naar by destination" },
  op: { zh: "op按表面/日期记", en: "read op by surface/date pattern" },
  bij: { zh: "bij看所在处", en: "read bij by place/person" },
  met: { zh: "met看同行/工具", en: "read met by company/tool" },
  voor: { zh: "voor看给谁/何用", en: "read voor by receiver/purpose" },
  van: { zh: "van看来源/归属", en: "read van by source/possession" },
  aan: { zh: "aan看接触/对象", en: "read aan by contact/recipient" },
  over: { zh: "over看话题/越过", en: "read over by topic/across" },
  door: { zh: "door看穿过/原因", en: "read door by through/cause" },
  tegen: { zh: "tegen看顶着/反对", en: "read tegen by against/opposition" },
  tot: { zh: "tot看直到/告别", en: "read tot by until/goodbye" },
  na: { zh: "na看之后", en: "read na by after" },
  zonder: { zh: "zonder看缺什么", en: "read zonder by what is missing" },
  onder: { zh: "onder看下面/以下", en: "read onder by under/below" },
  tussen: { zh: "tussen看两端之间", en: "read tussen by between two points" },
  waar: { zh: "waar=问地点", en: "waar asks where" },
  wanneer: { zh: "wanneer=问时间", en: "wanneer asks when" },
  wie: { zh: "wie=问谁", en: "wie asks who" },
  wat: { zh: "wat=问什么", en: "wat asks what" },
  hoe: { zh: "hoe=问怎么/怎样", en: "hoe asks how" },
  welk: { zh: "welk配het词", en: "welk goes with het-nouns" },
  welke: { zh: "welke配de/复数", en: "welke goes with de/plural nouns" },
};

function shortFunctionHook(key: string, seed: FunctionWordSeed) {
  return functionWordShortHooks[key] ?? {
    zh: compactMemoryPath(seed.functionZh),
    en: seed.functionEn,
  };
}

const usageMemoryPaths: Record<string, { zh: string; en: string; explanationZh: string; explanationEn: string }> = {
  krant: {
    zh: "in de krant staat nieuws",
    en: "in de krant staat nieuws: news is printed in the newspaper.",
    explanationZh: "krant 不只用 de krant lezen；更有用的是 in de krant staat...，表示“报纸上写着/刊登着”。",
    explanationEn: "Do not only anchor krant in de krant lezen; in de krant staat... means something is printed in the newspaper.",
  },
  afdeling: {
    zh: "op de afdeling / van de afdeling",
    en: "op de afdeling / van de afdeling: in or from a department/ward.",
    explanationZh: "afdeling 不是单独背“部门”；工作和医院里常落到 op de afdeling（在部门/科室）或 van de afdeling（来自某部门）。",
    explanationEn: "Do not learn afdeling as a bare department word; in work and hospital contexts it often appears as op de afdeling or van de afdeling.",
  },
  maatschappij: {
    zh: "in de maatschappij",
    en: "in de maatschappij: in society.",
    explanationZh: "maatschappij 讲社会/公共生活时，最常落到 in de maatschappij；和 samenleving 接近，但语气更像“社会这个系统”。",
    explanationEn: "Maatschappij often lands in in de maatschappij for society/public life; it is close to samenleving but more like society as a system.",
  },
  vertrouwen: {
    zh: "vertrouwen hebben in",
    en: "vertrouwen hebben in: have trust/confidence in.",
    explanationZh: "vertrouwen 别只按中文意思死记；先记 vertrouwen hebben in iemand/iets，表示“信任某人/对某事有信心”。",
    explanationEn: "Do not learn vertrouwen bare; anchor it in vertrouwen hebben in someone/something.",
  },
  moeder: {
    zh: "mijn moeder先出口，复数moeders",
    en: "Start from mijn moeder / je moeder; plural is moeders.",
    explanationZh: "moeder 不是先裸背；日常开口多是 mijn moeder、je moeder，复数是 moeders。",
    explanationEn: "Do not start from a bare noun. In daily speech, mijn moeder and je moeder are common; the plural is moeders.",
  },
  vader: {
    zh: "mijn vader先出口，复数vaders",
    en: "Start from mijn vader / je vader; plural is vaders.",
    explanationZh: "vader 常跟 possessive 一起说：mijn vader、je vader；复数是 vaders。",
    explanationEn: "Use vader with possessives such as mijn vader and je vader; the plural is vaders.",
  },
  broer: {
    zh: "mijn broer先出口，复数broers",
    en: "Start from mijn broer / je broer; plural is broers.",
    explanationZh: "broer 说家庭关系时多接 mijn/je/zijn；复数是 broers，不是 broeren。",
    explanationEn: "For family relations, broer often follows mijn/je/zijn; the plural is broers, not broeren.",
  },
  zus: {
    zh: "mijn zus先出口，复数zussen",
    en: "Start from mijn zus / je zus; plural is zussen.",
    explanationZh: "zus 是短词但复数变 zussen；先用 mijn zus / je zus 落到关系里。",
    explanationEn: "zus has the plural zussen. Anchor it in family phrases like mijn zus / je zus.",
  },
  zoon: {
    zh: "mijn zoon先出口，复数zonen",
    en: "Start from mijn zoon / je zoon; plural is zonen.",
    explanationZh: "zoon 讲家庭关系时常跟 possessive；复数记 zonen。",
    explanationEn: "zoon often appears with possessives in family talk; learn the plural zonen.",
  },
  dochter: {
    zh: "mijn dochter先出口，复数dochters",
    en: "Start from mijn dochter / je dochter; plural is dochters.",
    explanationZh: "dochter 多在 mijn/je/haar dochter 里出现；复数是 dochters。",
    explanationEn: "dochter often appears in phrases like mijn/je/haar dochter; the plural is dochters.",
  },
  ouders: {
    zh: "ouders本身就是父母一组",
    en: "ouders already means parents as a pair/group.",
    explanationZh: "ouders 是复数概念，常说 mijn ouders，不要再按单数名词硬拆。",
    explanationEn: "ouders is already a plural idea: parents. Use it naturally as mijn ouders.",
  },
  opa: {
    zh: "mijn opa先出口，复数opa's",
    en: "Start from mijn opa / je opa; plural is opa's.",
    explanationZh: "opa 以元音结尾，复数写 opa's；常用 mijn opa / je opa。",
    explanationEn: "opa ends in a vowel, so the plural is opa's. Use mijn opa / je opa.",
  },
  oma: {
    zh: "mijn oma先出口，复数oma's",
    en: "Start from mijn oma / je oma; plural is oma's.",
    explanationZh: "oma 以元音结尾，复数写 oma's；常用 mijn oma / je oma。",
    explanationEn: "oma ends in a vowel, so the plural is oma's. Use mijn oma / je oma.",
  },
  partner: {
    zh: "mijn partner先出口，复数partners",
    en: "Start from mijn partner; plural is partners.",
    explanationZh: "partner 日常常用 mijn partner / je partner；复数是 partners。",
    explanationEn: "partner is common in mijn partner / je partner; the plural is partners.",
  },
  stad: {
    zh: "in de stad：人在城市里",
    en: "in de stad: living or being in the city.",
    explanationZh: "stad 先落到 in de stad：住在哪里、去哪里活动时都能马上用。",
    explanationEn: "Anchor stad in in de stad: it is immediately useful for where you live or move around.",
  },
  taal: {
    zh: "een taal leren：学一门语言",
    en: "een taal leren: learn a language.",
    explanationZh: "taal 先落到 een taal leren / de taal spreken 这类会开口的语言场景。",
    explanationEn: "Anchor taal in speakable language scenes such as een taal leren or de taal spreken.",
  },
};

const exactCreativeHooks: Record<string, { zh: string; en: string }> = {
  luisteren: { zh: "老师开讲：老实听着", en: "Class starts: listen obediently." },
  vergeten: { zh: "门口一摸包：忘了", en: "At the door, touch the bag: forgotten." },
  begrijpen: { zh: "grijp抓住，be-grijp=懂", en: "Grijp means grip; be-grijp is grasping the meaning." },
  proberen: { zh: "probe一下，不会也试", en: "Probe it once: that is trying." },
  oefenen: { zh: "反复哦分，练到手会", en: "Repeat until the body knows it." },
  zoeken: { zh: "地图狂搜，眼睛扫街", en: "Map search plus street scan: zoeken." },
  vinden: { zh: "搜到那刻叫vinden", en: "The moment search succeeds is vinden." },
  kijken: { zh: "眼睛开机，kijk一下", en: "Switch the eyes on and kijk." },
  bellen: { zh: "bell铃一响就bellen", en: "The bell rings, so you call." },
  duwen: { zh: "门上Duw：手往前怼", en: "Door says Duw: push forward." },
  trekken: { zh: "Trek门把往自己拽", en: "Trek the handle toward you." },
  wonen: { zh: "窝在地址里=wonen", en: "Settle into an address: wonen." },
  slapen: { zh: "眼皮塌下去=slapen", en: "Eyelids drop: slapen." },
  wassen: { zh: "水哗哗，把脏洗掉", en: "Water rushes and dirt disappears." },
  brengen: { zh: "把东西送到那边", en: "Bring something over there." },
  halen: { zh: "跑去柜台把它拿回", en: "Go to the counter and fetch it back." },
  meenemen: { zh: "mee一起，nemen拿走", en: "Mee means along; nemen means take." },
  kwijt: { zh: "口袋一空：完了丢了", en: "Pocket is empty: it is gone." },
  moeilijk: { zh: "墨迹半天还不会", en: "Still stuck after too much effort." },
  makkelijk: { zh: "摸一下就会：简单", en: "One touch and it works: easy." },
  misschien: { zh: "miss一半：也许吧", en: "Half-missed certainty: maybe." },
  denken: { zh: "脑内开会=denken", en: "A meeting inside your head: denken." },
  vertellen: { zh: "把信息倒给别人", en: "Pour the information to someone else." },
  regelen: { zh: "乱事排整齐=regelen", en: "Turn messy tasks into order: regelen." },
  aanvragen: { zh: "向窗口发起请求", en: "Send a request toward the counter." },
  invullen: { zh: "空格被你填满", en: "Fill the blank spaces in." },
  opsturen: { zh: "表格被你送出去", en: "Send the form away." },
  ontbreken: { zh: "缺口露出来=ontbreken", en: "The missing gap shows: ontbreken." },
  gebeuren: { zh: "事情砰一下发生", en: "The thing suddenly happens." },
  verloren: { zh: "东西离你远走=丢了", en: "It has gone away from you: lost." },
  gevonden: { zh: "搜到后亮灯=找到了", en: "The search light turns on: found." },
  verhuizen: { zh: "旧屋打包，新屋落地", en: "Old home packed, new home landed." },
  verhuizing: { zh: "搬家这件事一整包", en: "The whole packed event of moving." },
};

const exactLifeSceneHooks: Record<string, { zh: string; en: string }> = {
  knoflook: {
    zh: "切菜时闻到浓烈的蒜味，案板上那几瓣白色蒜瓣就是 knoflook。",
    en: "While chopping food, the strong smell comes from the white garlic cloves on the board: knoflook.",
  },
  gezin: {
    zh: "介绍住在一起的小家庭时，父母和孩子组成的这一家就是 gezin。",
    en: "When introducing a household, the parents and children who form that family are the gezin.",
  },
  druppel: {
    zh: "雨水、水龙头或药瓶落下的一小滴，就是 druppel。",
    en: "One small drop falling from rain, a tap, or a medicine bottle is a druppel.",
  },
  zin: {
    zh: "课本里从大写字母开始、到句号结束的一整句话，就是 zin。",
    en: "In a textbook, the complete line from a capital letter to the full stop is a zin.",
  },
  gesprek: {
    zh: "两个人面对面或打电话，一来一回地说话；这一段对话就是 gesprek。",
    en: "Two people speak back and forth, face to face or on the phone: that conversation is a gesprek.",
  },
  stuk: {
    zh: "买面包、水果或商品时按“一个/一件”数，een stuk 就是其中一个单位。",
    en: "When bread, fruit, or goods are counted as one item or piece, een stuk is one such unit.",
  },
  bon: {
    zh: "结账后收银机吐出一张写着商品和金额的小票，这张就是 bon。",
    en: "After paying, the till prints a slip with the items and total: that receipt is the bon.",
  },
  kassa: {
    zh: "推着购物篮走到付款处，店员扫码收钱的位置就是 kassa。",
    en: "Take the shopping basket to the place where items are scanned and paid for: that checkout is the kassa.",
  },
  mandje: {
    zh: "进超市先拿一个手提购物篮，边走边把商品放进去；这个篮子就是 mandje。",
    en: "At the supermarket, take the hand basket and place items in it as you shop: that basket is the mandje.",
  },
  pinpas: {
    zh: "结账时把银行卡贴到机器上付款，手里的这张卡就是 pinpas。",
    en: "At checkout, tap the bank card on the terminal to pay: that card is the pinpas.",
  },
  ontbijt: {
    zh: "早上起床后吃的第一顿饭，面包、咖啡或酸奶摆上桌，就是 ontbijt。",
    en: "The first meal after waking up, with bread, coffee, or yoghurt on the table, is ontbijt.",
  },
  afwas: {
    zh: "吃完饭后水槽里等着洗的盘子、杯子和餐具，这一堆就是 afwas。",
    en: "After a meal, the plates, cups, and cutlery waiting in the sink are the afwas.",
  },
  zeep: {
    zh: "洗手或洗东西时挤出泡沫、把污渍洗掉的就是 zeep。",
    en: "The soap that makes foam and washes dirt away is zeep.",
  },
  leiding: {
    zh: "办公室里负责带团队、作决定的管理层，就是 leiding。",
    en: "At work, the people who lead the team and make decisions are the leiding.",
  },
  chef: {
    zh: "工作时分配任务、检查进度的主管，就是 chef。",
    en: "At work, the supervisor who assigns tasks and checks progress is the chef.",
  },
  dorst: {
    zh: "运动后口干，第一反应是找水喝；这种“渴”的感觉就是 dorst。",
    en: "After exercise, your mouth is dry and you look for water: that thirsty feeling is dorst.",
  },
  kapper: {
    zh: "坐进理发店，拿剪刀帮你剪头发的人就是 kapper。",
    en: "At the hair salon, the person who cuts your hair with scissors is the kapper.",
  },
  slager: {
    zh: "走进肉店，柜台后切肉、称重并卖给顾客的人就是 slager。",
    en: "At the butcher's shop, the person who cuts, weighs, and sells meat is the slager.",
  },
  land: {
    zh: "表格问 land 时，填的是国家：Nederland、China 都是 land。",
    en: "When a form asks for land, it means country: Nederland and China are both a land.",
  },
  opdracht: {
    zh: "课堂、工作或表格里出现一项要完成并交出去的事，这一项就是 opdracht。",
    en: "In class, work, or a form, the thing you must complete and hand in is an opdracht.",
  },
  alinea: {
    zh: "一篇文章里，从一个换行到下一个换行的一块文字，就是 alinea。",
    en: "In a text, one block of lines between breaks is an alinea, a paragraph.",
  },
  sollicitatie: {
    zh: "看到职位后写简历、发邮件、等面试，这整套求职申请就是 sollicitatie。",
    en: "Seeing a vacancy, sending a CV, and waiting for an interview: that job application is sollicitatie.",
  },
  vaardigheid: {
    zh: "能写邮件、会沟通、会用软件，这种已经练出来的能力就是 vaardigheid。",
    en: "Being able to write emails, communicate, or use a tool: that learned skill is vaardigheid.",
  },
  afdeling: {
    zh: "公司或医院里按功能分出来的一块区域/团队，比如行政部或科室，就是 afdeling。",
    en: "A section or team inside a company or hospital, like administration or a ward, is an afdeling.",
  },
  stage: {
    zh: "学生进公司边做边学，不是正式工作也不是纯上课，这段实习就是 stage。",
    en: "A student goes into a company to learn by doing: that internship is stage.",
  },
  functie: {
    zh: "招聘广告里写的岗位名称和职责范围，就是 functie。",
    en: "The job title and role in a vacancy is the functie.",
  },
  bedrijf: {
    zh: "有同事、老板、客户和办公地点的那家公司，就是 bedrijf。",
    en: "The company with colleagues, a boss, clients, and a workplace is a bedrijf.",
  },
  richting: {
    zh: "站在路口或站台前，看箭头、线路和目的地指向哪边；这个指向就是 richting。",
    en: "At a crossing or platform, look at the arrow, line, and destination; the way they point is the richting.",
  },
  zout: {
    zh: "做饭或吃饭时手伸向小盐罐，往菜里撒的那一点白色调味就是 zout。",
    en: "While cooking or eating, your hand reaches for the salt shaker; the white seasoning you sprinkle is zout.",
  },
  peper: {
    zh: "餐桌上那个小胡椒瓶，往汤、鸡蛋或菜上转一下，落下的黑色辛香就是 peper。",
    en: "On the table, the little pepper mill you turn over soup, eggs, or food gives the dark spicy seasoning: peper.",
  },
  suiker: {
    zh: "咖啡、茶或甜点旁边的小糖包/糖罐，往里面加的甜味就是 suiker。",
    en: "The sugar packet or jar beside coffee, tea, or dessert gives the sweetness you add: suiker.",
  },
  totaal: {
    zh: "收银屏幕或小票最后一行把所有价格加起来，那一行总数就是 totaal。",
    en: "On a checkout screen or receipt, the final line that adds all prices together is the totaal.",
  },
  extra: {
    zh: "点单或付款时，原本之外又多加的一份、多收的一笔，就是 extra。",
    en: "When ordering or paying, anything added on top of the normal amount or price is extra.",
  },
  minder: {
    zh: "糖、盐、数量或价格想少一点时，那个“少一点”的方向就是 minder。",
    en: "When you want less sugar, salt, quantity, or cost, that 'less' direction is minder.",
  },
  meer: {
    zh: "数量、时间或食物想再多一点时，那个“更多”的方向就是 meer。",
    en: "When you want more quantity, time, or food, that 'more' direction is meer.",
  },
  genoeg: {
    zh: "杯子倒到够了、钱付够了、东西买够了，那个“够了”的点就是 genoeg。",
    en: "When the glass is full enough, the money is enough, or you bought enough, that point is genoeg.",
  },
  biljet: {
    zh: "付款时从钱包里拿出的一张纸币，不是硬币；这一张就是 biljet。",
    en: "When paying, the paper note you take from your wallet, not a coin, is a biljet.",
  },
  portemonnee: {
    zh: "付钱前伸手去包里摸到的钱包，里面放卡、纸币和硬币；这个就是 portemonnee。",
    en: "Before paying, the wallet you reach for, with cards, notes, and coins inside, is the portemonnee.",
  },
  prijskaartje: {
    zh: "prijs 是价格，kaart 是卡片/标签，-je 是小称；货架上那张写价格的小标签就是 het prijskaartje。",
    en: "prijs is price, kaart is card/tag, and -je is diminutive; the small price tag on a shelf is het prijskaartje.",
  },
  aanbieding: {
    zh: "货架上橙色/醒目的特价牌，原价旁边写着优惠；这个优惠就是 aanbieding。",
    en: "On a shelf, the bright special-offer label beside the old price is the aanbieding.",
  },
  klant: {
    zh: "在店里挑东西、排队、付款的那个人，从店员角度看就是 klant。",
    en: "In a shop, the person choosing items, queuing, and paying is the klant from the seller's side.",
  },
  verkoper: {
    zh: "店里回答问题、找尺码、收钱或介绍商品的人，就是 verkoper。",
    en: "In a shop, the person answering questions, finding sizes, taking payment, or presenting products is the verkoper.",
  },
  bonnetje: {
    zh: "付款后收银机吐出来的小纸条，上面有日期、价格和商品；那张小票就是 bonnetje。",
    en: "After paying, the small paper from the till with date, prices, and items is the bonnetje.",
  },
  werkplek: {
    zh: "每天坐下开电脑、放杯子、开始工作的那个位置，就是 werkplek。",
    en: "The place where you sit down, open the laptop, and start work is your werkplek.",
  },
  mening: {
    zh: "别人问“你怎么看”，你说出的自己的看法就是 mening。",
    en: "When someone asks what you think, the view you give is your mening.",
  },
  reden: {
    zh: "别人问“为什么”，后面要说出的那个原因就是 reden。",
    en: "When someone asks why, the reason you give is the reden.",
  },
  voorbeeld: {
    zh: "解释抽象内容时拿出一个具体例子，这个例子就是 voorbeeld。",
    en: "When explaining something abstract, the concrete example you give is a voorbeeld.",
  },
  voordeel: {
    zh: "做一件事带来的好处、加分点，就是 voordeel。",
    en: "The benefit or plus side of doing something is a voordeel.",
  },
  nadeel: {
    zh: "做一件事带来的麻烦、扣分点，就是 nadeel。",
    en: "The drawback or minus side of doing something is a nadeel.",
  },
  maatschappij: {
    zh: "学校、工作、政府、邻里一起运转的那张大网，就是 maatschappij。",
    en: "The big web of school, work, government, and neighborhoods is maatschappij.",
  },
  overheid: {
    zh: "办证、税、规定、补贴背后的政府机构，就是 overheid。",
    en: "The public authority behind permits, taxes, rules, and benefits is overheid.",
  },
  voorstel: {
    zh: "会议里有人说“我们可以这样做”，这个提出的方案就是 voorstel。",
    en: "In a meeting, when someone says what we could do, that proposal is a voorstel.",
  },
  verhaal: {
    zh: "一件事从开头讲到结尾，串起来的故事就是 verhaal。",
    en: "A sequence of events told from start to finish is a verhaal.",
  },
  personeel: {
    zh: "公司里一起上班的员工整体，就是 personeel。",
    en: "The staff working together in a company is personeel.",
  },
  kandidaat: {
    zh: "面试名单上等待被选择的人，就是 kandidaat。",
    en: "The person on the shortlist waiting to be chosen is a kandidaat.",
  },
  praktijk: {
    zh: "不只在书上说，而是真的动手做、现场用，这一块就是 praktijk。",
    en: "Not just theory, but doing it for real: that practical side is praktijk.",
  },
  studiegenoot: {
    zh: "同一门课、同一组作业里一起学习的人，就是 studiegenoot。",
    en: "Someone studying the same course or working in the same study group is a studiegenoot.",
  },
  krant: {
    zh: "桌上摊开的纸质新闻页，标题、图片和栏目一起出现，这就是 krant。",
    en: "The paper news pages spread on a table, with headlines, photos, and columns: that is a krant.",
  },
  karakter: {
    zh: "一个人平时怎么反应、怎么待人，稳定露出来的性格就是 karakter。",
    en: "How someone usually reacts and treats people, their stable character, is karakter.",
  },
  gewoonte: {
    zh: "每天不太思考就会重复做的事，就是 gewoonte。",
    en: "Something you repeat almost automatically every day is a gewoonte.",
  },
  vertrouwen: {
    zh: "你敢把事情交给某人，因为相信他会做好，这份信任就是 vertrouwen。",
    en: "When you dare to leave something to someone because you believe they will handle it, that trust is vertrouwen.",
  },
  tas: {
    zh: "出门前一摸包：钥匙、钱包、证件都在这只 tas 里。",
    en: "Doorway check: keys, wallet, and ID are all in this tas.",
  },
  stoel: {
    zh: "进教室先拉开一把 stoel，坐下才开始上课。",
    en: "Walk into class, pull out a stoel, and sit down before the lesson starts.",
  },
  tafel: {
    zh: "杯子、书、晚饭都落在 tafel 上；看到桌面就想 tafel。",
    en: "Cup, book, and dinner all land on the tafel; the tabletop calls up tafel.",
  },
  boom: {
    zh: "路边那棵高高的 boom，等人时就站在树下。",
    en: "That tall boom by the road: you wait for someone under the tree.",
  },
  appel: {
    zh: "包里滚出一个 appel，咬一口就是苹果画面。",
    en: "An appel rolls out of the bag; one bite gives the apple scene.",
  },
  raam: {
    zh: "早上拉开窗帘，光从 raam 里进来。",
    en: "Open the curtains in the morning and light comes through the raam.",
  },
  deur: {
    zh: "回家先摸门把手，面前这扇就是 deur。",
    en: "Coming home, your hand finds the handle: the panel in front of you is the deur.",
  },
  sleutel: {
    zh: "门口翻包找 sleutel，找不到就进不了门。",
    en: "At the door, you search your bag for the sleutel; without it, you stay outside.",
  },
  bed: {
    zh: "困到不行时，脑子里只剩那张 bed。",
    en: "When you are exhausted, the only image left is the bed.",
  },
  fiets: {
    zh: "荷兰街边一排 fiets，解锁一辆就能走。",
    en: "A row of fietsen on a Dutch street; unlock one and go.",
  },
  trein: {
    zh: "站台上 trein 进站，门一开人群上车。",
    en: "The trein rolls into the platform; doors open and everyone boards.",
  },
  brood: {
    zh: "早餐切一片 brood，抹上黄油就能吃。",
    en: "Slice brood at breakfast, spread butter, and eat.",
  },
  kaas: {
    zh: "面包上盖一片 kaas，荷兰早餐立刻出现。",
    en: "Put a slice of kaas on bread and the Dutch breakfast appears.",
  },
  jas: {
    zh: "出门前抓起 jas，风一吹就知道要穿它。",
    en: "Before going out, grab the jas; the wind tells you to wear it.",
  },
  bril: {
    zh: "字看不清，摸到鼻梁上的 bril，世界就清楚了。",
    en: "The letters blur; touch the bril on your nose and the world sharpens.",
  },
  winkel: {
    zh: "推门进去买东西，灯光货架一起出现：winkel。",
    en: "Push the door open to buy something: lights, shelves, winkel.",
  },
  straat: {
    zh: "一出门脚下就是 straat，车、人、自行车都在这条街上走。",
    en: "Step outside and your feet are on the straat: cars, people, and bikes move there.",
  },
  park: {
    zh: "长椅、草地、树影连在一起，就是 park。",
    en: "Bench, grass, and tree shade together make the park.",
  },
  misverstand: {
    zh: "两个人说的不是同一件事，话越说越岔；这个岔出来的误会就是 misverstand。",
    en: "Two people think they mean the same thing, but the conversation goes off track: that misunderstanding is misverstand.",
  },
  ruzie: {
    zh: "声音变高、脸色变僵，两个人开始吵起来；这场争吵就是 ruzie。",
    en: "Voices rise and faces tense up: that argument is ruzie.",
  },
  recensie: {
    zh: "看完电影、演出或餐厅后，别人写下好不好看的评价；那篇评论就是 recensie。",
    en: "After a film, show, or restaurant visit, someone writes what they thought: that review is a recensie.",
  },
  liniaal: {
    zh: "画直线、量厘米时靠着纸边的尺子就是 liniaal。",
    en: "The ruler laid along the edge of the paper to draw a straight line is a liniaal.",
  },
};

// These are deliberately word-specific A1 scenes. They replace the old broad
// topic templates ("home", "food", "school"...) that made different words
// feel like the same memory path.
const curatedA1LifeSceneHooks: Record<string, string> = {
  huis: "下班或放学回到有门牌、钥匙和自己东西的住处，这个家就是 huis。",
  morgen: "睡前说明天再做，日历翻到下一天时，那个“明天”就是 morgen。",
  ouders: "学校表格上要填爸爸妈妈的联系方式，这一对父母就是 ouders。",
  zus: "介绍家人时，和你同辈的女性兄弟姐妹就是 zus。",
  kamer: "关上门后能睡觉、学习或放私人物品的那一间，就是 kamer。",
  keuken: "切菜、开火、洗锅都发生的家里那一块，就是 keuken。",
  spoor: "站台边两条钢轨一直延伸，火车沿着它走；那条轨道就是 spoor。",
  kast: "衣服、盘子或文件收进去，拉开门才能拿到的柜子就是 kast。",
  muur: "挂画、贴照片、挡住房间边界的那面墙就是 muur。",
  wc: "急着洗手或上厕所时找的那个小房间，就是 wc。",
  tuin: "屋子外能种花、晒太阳或放自行车的小院子，就是 tuin。",
  fles: "拧开盖子后倒水、牛奶或果汁的容器，就是 fles。",
  zak: "买完东西拎在手里、里面装着面包或蔬菜的袋子，就是 zak。",
  koorts: "生病时体温计数字升高，额头发烫；这种发烧状态就是 koorts。",
  hal: "进门后先脱鞋、挂外套、再通往各个房间的入口空间，就是 hal。",
  zolder: "顺着楼梯到屋顶下面，放旧箱子和换季物品的阁楼就是 zolder。",
  kelder: "往地下走，里面凉、暗，常放储物架的那层就是 kelder。",
  gang: "从卧室走到客厅要经过的一条窄通道，就是 gang。",
  gordijn: "早上拉开让阳光进来、晚上拉上挡住窗外的布，就是 gordijn。",
  deken: "睡觉时盖在身上保暖的一层，就是 deken。",
  kussen: "躺下时托住头或靠在背后的软垫，就是 kussen。",
  spiegel: "出门前看头发、脸和衣服反射出来的那块镜面，就是 spiegel。",
  douche: "洗澡时从上面喷水、让人冲干净的装置或洗澡过程，就是 douche。",
  kraan: "洗手时扭一下就流出水的开关，就是 kraan。",
  fornuis: "锅放在火上煮、炒、煎的厨房设备，就是 fornuis。",
  vlees: "超市冷柜或肉店里包装好的鸡肉、牛肉等食材，就是 vlees。",
  komkommer: "切开后里面浅绿、多水，常放进沙拉的长条蔬菜就是 komkommer。",
  wortel: "橙色、脆脆的，削皮后切进汤或沙拉的蔬菜就是 wortel。",
  ui: "切它时容易流眼泪、炒菜前常先下锅的球状蔬菜就是 ui。",
  paprika: "红黄绿几种颜色、切开里面有籽的甜椒就是 paprika。",
  sla: "沙拉碗里一片片绿色叶子打底的蔬菜就是 sla。",
  brommer: "戴头盔、拧油门、比自行车快的小型机动车就是 brommer。",
  chauffeur: "坐在出租车、巴士或接送车前排负责开车的人就是 chauffeur。",
  vertrek: "看车站屏幕，列车要从这里出发的那一刻或那一栏就是 vertrek。",
  aankomst: "举着牌子在出口等人，航班或列车到达的那一刻就是 aankomst。",
  gezicht: "证件照、视频通话或镜子里能看到眼睛鼻子嘴巴的这一面，就是 gezicht。",
  teen: "穿鞋时最前面挤到、走路时脚尖上那一根根小脚趾就是 teen。",
  munten: "钱包底部叮当作响、用来投机器或找零的金属钱币就是 munten。",
  ochtend: "闹钟响、刷牙、吃早餐到出门的那段时间，就是 ochtend。",
  oom: "家族聚会里，爸爸或妈妈的兄弟，或嫁进来的长辈男性就是 oom。",
  tante: "家族聚会里，爸爸或妈妈的姐妹，或嫁进来的长辈女性就是 tante。",
  neef: "亲戚家的男孩，和你同一辈、一起在聚会玩的人就是 neef。",
  cadeau: "生日时包着纸、递到你手里要你拆开的礼物就是 cadeau。",
  bezoek: "有人按门铃进来坐一会儿，或你去别人家看望，这次来访就是 bezoek。",
  verband: "小伤口上先消毒再包住的纱布、绷带，就是 verband。",
  avond: "吃完晚饭、天色变暗、准备放松或睡觉的那段时间，就是 avond。",
  vrouw: "成人女性在表格、介绍或日常对话中的称呼，就是 vrouw。",
  weer: "出门前看温度、雨、风和云，今天外面的天气就是 weer。",
  zon: "晴天抬头看到、晒在脸上发暖的太阳就是 zon。",
  regen: "撑伞时从天上落下、把地面打湿的雨就是 regen。",
  broek: "两条裤腿套上去、腰部扣住的下装就是 broek。",
  baan: "简历和招聘网站里写的那份工作职位，就是 baan。",
  plein: "城市里没有车道、可走路集合或摆市场的开阔广场，就是 plein。",
  lente: "天气开始变暖、树冒新芽、花开起来的季节就是 lente。",
  zomer: "白天很长、穿短袖、去海边或度假的季节就是 zomer。",
  herfst: "叶子变黄落下、风变凉的季节就是 herfst。",
  trui: "天冷时从头套下去、覆盖上半身的针织衣物就是 trui。",
  jurk: "一件式、从肩膀垂到腿部的女装就是 jurk。",
  rok: "围在腰部、没有两条裤腿的下装就是 rok。",
  muts: "冬天戴在头上保暖的帽子就是 muts。",
  bibliotheek: "进去借书、还书、安静学习的公共场所就是 bibliotheek。",
  les: "老师讲、学生听或练习的一节课就是 les。",
  docent: "站在教室前讲课、布置作业的老师就是 docent。",
  potlood: "能削尖、写错后能擦掉的铅笔就是 potlood。",
  pauze: "上课或工作中间停下来喝水、上厕所、休息的那一段就是 pauze。",
  buurt: "你家周围常走的街、邻居和小店构成的片区，就是 buurt。",
  buur: "隔壁住着、偶尔借东西或在门口打招呼的人就是 buur。",
  mevrouw: "正式礼貌地称呼一位成年女性时说 mevrouw。",
  meneer: "正式礼貌地称呼一位成年男性时说 meneer。",
  bord: "盛着晚饭、用叉子吃东西时放在面前的盘子就是 bord。",
  beker: "没有把手、运动或刷牙时常用来喝水的杯子就是 beker。",
  kop: "有把手、盛咖啡或茶的小杯子就是 kop。",
  mes: "切面包、蔬菜或肉时握在手里的刀就是 mes。",
  lepel: "喝汤、舀酸奶或搅咖啡时用的勺子就是 lepel。",
  bak: "把食物、玩具或杂物装进去的盒、盆或容器就是 bak。",
  servet: "吃饭时擦嘴、放在盘子旁边的纸巾或布巾就是 servet。",
  druif: "一串上长着很多颗、剥下来一颗颗吃的小水果就是 druif。",
  aardbei: "表面有小籽、红色带绿叶帽的甜水果就是 aardbei。",
  citroen: "切开酸得皱眉、常挤汁调味的黄色水果就是 citroen。",
  perzik: "表皮有绒毛、果肉香甜的桃子就是 perzik。",
  sap: "从水果里榨出或盒装倒出来喝的果汁就是 sap。",
  bioscoop: "买票、关灯、对着大银幕看电影的地方就是 bioscoop。",
  kerk: "有钟楼、长椅和礼拜活动的教堂就是 kerk。",
  hemd: "有领子、纽扣、比 T 恤更正式的上衣就是 hemd。",
  riem: "穿裤子时穿过腰间扣住的皮带就是 riem。",
  pet: "前面有帽檐、遮太阳的鸭舌帽就是 pet。",
  sjaal: "天冷时绕在脖子上保暖的长条布就是 sjaal。",
  laars: "鞋筒包到脚踝甚至小腿、下雨天常穿的靴子就是 laars。",
  pantoffel: "在家里穿、软软的室内拖鞋就是 pantoffel。",
  maat: "试衣服、鞋子或量尺寸时要确认的号码就是 maat。",
  gum: "铅笔写错后用来擦掉字迹的小橡皮就是 gum。",
  liniaal: "画直线、量厘米时靠着纸边的尺子就是 liniaal。",
  toets: "教室里规定时间完成、老师用来评分的测验就是 toets。",
  lokaal: "课表上标注的、学生坐进去上课的教室就是 lokaal。",
  kantoor: "电脑、工位和同事都在的办公地点就是 kantoor。",
  feest: "音乐、蛋糕、朋友和庆祝活动聚在一起，就是 feest。",
  vakantie: "不用上班或上课、可以旅行休息的一段假期就是 vakantie。",
  bloem: "花瓶里插着、花瓣展开有香味的花就是 bloem。",
  lucht: "抬头看云、太阳、飞机所在的那片天空就是 lucht。",
  wolken: "天空里一团团聚起来、会遮太阳或带来雨的云就是 wolken。",
  zee: "站在海边看见没有尽头的咸水和浪，就是 zee。",
  strand: "海边踩到细沙、晒太阳或散步的地方就是 strand。",
  brug: "跨过河、运河或道路，让人和车从一边到另一边的桥就是 brug。",
  gebouw: "有墙、门、窗和楼层，能进去办公或居住的一栋建筑就是 gebouw。",
  flat: "很多住户上下分层住在同一栋楼里的公寓楼就是 flat。",
  muis: "用手移动、点电脑屏幕上箭头的小设备就是 muis。",
  stekker: "把电器插进墙上插座、让它通电的插头就是 stekker。",
  sms: "手机上很短、以文字发出去的一条信息就是 sms。",
  pagina: "书、表格或网站里翻过去的一整页就是 pagina。",
  knop: "按一下就开关、提交或进入下一步的小按钮就是 knop。",
  instelling: "手机或电脑里调语言、声音、通知的选项页面就是 instelling。",
  geluid: "门铃、音乐、说话或车经过时耳朵听到的声音就是 geluid。",
  beeld: "屏幕、照片或镜头里出现的画面就是 beeld。",
  bureau: "上面放电脑、文件和笔，坐着学习或工作的桌子就是 bureau。",
  stad: "有很多街道、商店、车站和居民的城市就是 stad。",
  dorp: "房子不密、大家容易认识彼此的小型聚居地就是 dorp。",
  taal: "用来跟人说话、写字、理解句子的系统，比如 Nederlands，就是 taal。",
};

// A2 words that have no stronger morphology, bridge, or real fixed expression
// still need a word-specific first scene. Do not send them through topic templates.
const curatedA2LifeSceneHooks: Record<string, string> = {
  bestand: "在电脑里打开一个 Word、PDF 或照片，保存后出现在文件夹里的这一份电子文件就是 bestand。",
  ander: "柜台问“这张卡可以吗？”你摇头并指向旁边那张，说“de andere”；那个另一个就是 ander。",
  helaas: "想去的活动取消了，工作人员带着歉意说 Helaas, het gaat niet door；这种“很遗憾”就是 helaas。",
  bericht: "手机屏幕跳出一条 WhatsApp 或学校通知，点开后看到的那条消息就是 bericht。",
  oorzaak: "医生问问题从哪里开始，或排查故障时顺着线索找到的根源，就是 oorzaak。",
  gevolg: "按下按钮后屏幕跳出结果，或做了决定后随之发生的那件事，就是 gevolg。",
  stempel: "窗口办完手续，工作人员在表格或护照上盖下的印记，就是 stempel。",
  pakket: "门铃响后门口放着一个装好东西的纸箱，需要签收的就是 pakket。",
  afval: "做完饭把菜皮、包装和空瓶分进不同垃圾桶，这些要丢掉的东西就是 afval。",
  uitslag: "抽血或考试之后，等到医生或学校告诉你的结果，就是 uitslag。",
  klachten: "看家庭医生时，先说头痛、咳嗽、睡不好这些不舒服；它们合起来就是 klachten。",
  bijsluiter: "打开药盒，夹在药片旁、写着用法和副作用的折页，就是 bijsluiter。",
  kuur: "医生让你连续几天按时吃药，不是只吃一片；这整段治疗就是 kuur。",
  apotheker: "拿着处方到药店柜台，核对药和用法的专业人员就是 apotheker。",
  schade: "车门被刮出一道痕，或家里漏水弄坏地板，需要向保险说明的损失就是 schade。",
  vocht: "冬天窗户内侧起水珠，或墙角因为潮湿发黑；这里的湿气就是 vocht。",
  arbodienst: "生病请假后，公司安排你和职业健康机构联系；负责这件事的就是 arbodienst。",
  nota: "牙医看完诊后寄来一张写着项目和金额、需要付款或报销的单子，就是 nota。",
  notitie: "开会或接电话时，顺手写下一个名字、日期或待办的小记，就是 notitie。",
  toeslagen: "登录 Mijn Toeslagen 后看到医疗、房租等几项政府补贴，合起来就是 toeslagen。",
  "digid-app": "登录政府网站时，手机弹出确认画面，要点同意的那个应用就是 DigiD-app。",
  voorraad: "网上商店显示“还有 3 件”，仓库或货架上现有的这些货就是 voorraad。",
  koorts: "体温计显示 38 度多，身体发烫需要休息；这种发热就是 koorts。",
  bibliotheek: "借书时刷卡、在书架间找书、安静坐下阅读的地方就是 bibliotheek。",
  tolk: "你和医生语言不通时，电话或现场把双方的话换成另一种语言的人就是 tolk。",
  niveau: "课程开始前做分级测试，被安排到 A2 或 B1；这个程度就是 niveau。",
  bsn: "市政府、税务或医生登记时要核对的那串个人号码，就是 BSN。",
  juf: "小学教室里带孩子读书、做手工的女老师，孩子常叫她 juf。",
  meester: "小学教室里带孩子上课的男老师，孩子常叫他 meester。",
  steun: "难过或遇到困难时，有人帮你撑一把、听你说话；这份支持就是 steun。",
  dienst: "商店、医院或火车公司为你办理事情、提供帮助的那项服务就是 dienst。",
  loon: "月底工资单到账，工作换来的那笔钱就是 loon。",
  bedrag: "结账屏幕上显示 EUR 24,50，这个具体金额就是 bedrag。",
  regel: "表格或说明上写着“请在三天内回复”，这条必须遵守的规定就是 regel。",
  afdeling: "医院或大公司里按工作分开的区域，门牌写着 cardiologie 或 administratie 的就是 afdeling。",
  loket: "市政府或车站隔着玻璃窗口办手续、递材料的地方就是 loket。",
  onderzoek: "医生安排抽血、拍片或问一连串问题来找原因，这整套检查就是 onderzoek。",
  zalf: "皮肤发痒时，从小管里挤出一点涂开的药膏就是 zalf。",
  druppels: "药瓶倒过来，一次落下几滴到眼睛、耳朵或水里；这些小滴就是 druppels。",
  balie: "走进酒店、诊所或市政府，先站到工作人员前面办理事情的长柜台就是 balie。",
  uittreksel: "市政府网站下载或窗口打印的正式登记证明，比如住址证明，就是 uittreksel。",
  geslacht: "填写表格时在 man、vrouw 或 anders 之间选择的这一项，就是 geslacht。",
  bijlage: "发邮件时点回形针加进去的 PDF、照片或文件，就是 bijlage。",
  makelaar: "看房、出价或签购房文件时，在买卖双方之间安排事务的房产中介就是 makelaar。",
  schimmel: "浴室角落长期潮湿后长出的黑点或绿色斑块，就是 schimmel。",
  kapot: "手机摔后屏幕不亮，或洗衣机完全不转；这种坏掉的状态就是 kapot。",
  monteur: "暖气、网络或洗衣机坏了，上门带工具修理的人就是 monteur。",
  rooster: "打开工作或学校 App，看到周一到周日每个时段的班次或课程安排，就是 rooster。",
  ploeg: "足球场上同队一起比赛的人，或工厂同一班次一起工作的人，组成一支 ploeg。",
  perron: "火车站里站在黄线后等车、电子屏显示车次的那一侧平台就是 perron。",
  factuur: "公司或房东寄来一张列出服务、日期和应付金额的正式账单，就是 factuur。",
  onderwerp: "写邮件时，收件人下面那一栏先写“Afspraak”或“Vraag”；这行主题就是 onderwerp。",
  aanhef: "邮件或正式信件一开头的“Beste mevrouw ...”或“Geachte heer ...”，就是 aanhef。",
  groet: "邮件最后写“Met vriendelijke groet”再署名；这句收尾问候就是 groet。",
  spoed: "突然胸痛、严重出血或必须马上处理的事，不等明天的紧急程度就是 spoed。",
  abonnement: "每月自动扣费，持续能坐车、打电话或看电影的长期订购，就是 abonnement。",
  incasso: "银行账户里显示一笔公司自动扣走的房租、保险或订阅费，就是 incasso。",
  onderhoud: "房东定期检查锅炉、修理设备或保养电梯，这类保持正常运转的工作就是 onderhoud。",
  verlof: "提前向工作单位申请几天不来上班、但获得批准的假期就是 verlof。",
  bezwaar: "收到市政府或保险公司的决定后不同意，按规定提交反对意见；这份异议就是 bezwaar。",
};

// B1 fallback words need concrete scenes too. These are deliberately word-specific:
// a generic topic template is not a memory route.
const curatedB1LifeSceneHooks: Record<string, string> = {
  betreft: "正式邮件主题写着 Betreft: wijziging van uw afspraak；这里 betreft 就是在说“这封信关于什么”。",
  termijn: "信上写着 uiterlijk 15 mei betalen；从今天到这个截止日的期限就是 termijn。",
  uitzendkracht: "餐厅突然缺人，派遣公司安排一位只来几周帮忙的员工；他就是 uitzendkracht。",
  stagiair: "办公室来了学生，跟着同事学工作、做真实任务但还在实习；这位学生就是 stagiair。",
  mbo: "选完中学方向后，学校老师介绍职业课程和实习结合的教育路线；这一级别就是 mbo。",
  milieu: "把玻璃、纸和塑料分开丢，是为了少污染周围的空气、水和土地；这一整体环境就是 milieu。",
  klimaat: "新闻说夏天越来越热、冬天下雨更多；许多年累积下来的天气模式就是 klimaat。",
  uitstoot: "汽车尾气从排气管出来，工厂烟囱也排出气体；这些排放就是 uitstoot。",
  natuurgebied: "沿着步道走进一片限制开发、保护鸟和植物的湿地；这片受保护自然地就是 natuurgebied。",
  hittegolf: "连续多天温度超过三十度，晚上也闷热，天气 App 发出警告；这段热浪就是 hittegolf。",
  bron: "写报告时，你在一句资料后标注新闻网站或研究链接；提供这条信息的地方就是 bron。",
  verslag: "开完会议后，有人把讨论、决定和待办写成一份文档；这份记录就是 verslag。",
  kunst: "美术馆里一幅画、一个雕塑或一段装置让人停下来观看；这些创作属于 kunst。",
  schilderij: "墙上挂着画布，上面有颜料画出的风景或人物；这一幅画就是 schilderij。",
  dia: "老师投影时按一下遥控器，屏幕换到下一页标题和图片；这一页就是 dia。",
  kern: "读完一长段说明后，老师问“最重要的点是什么？”；留下来的核心就是 kern。",
  notulen: "会议结束后，秘书把谁参加、说了什么、决定了什么整理出来；这份正式会议记录就是 notulen。",
  inkomsten: "月底查看账户，工资、补贴和兼职收入一笔笔进来；这些进账合起来就是 inkomsten。",
  schuld: "账单到期但账户不够，欠下的钱还没还；这笔欠款就是 schuld。",
  mantelzorger: "一位女儿下班后长期帮年迈父亲买菜、吃药和看医生；她作为家人的照护角色就是 mantelzorger。",
  leefstijl: "有人每天走路、不抽烟、规律吃饭也早睡；这些长期生活习惯合起来就是 leefstijl。",
  straatpoëzie: "走过城市墙面，看到几句被印上去、路人都会读到的诗；这类街头诗就是 straatpoëzie。",
  zinsbouw: "把 Ik morgen naar school ga 改成 Ik ga morgen naar school；句子部件怎么排就是 zinsbouw。",
  leestrategie: "读长文章前先看标题和小标题，再回去找细节；这套读法就是 leestrategie。",
  spreektempo: "老师说得太快时你跟不上，放慢后每个词都听清；说话的快慢就是 spreektempo。",
  beeldfragment: "课堂视频只播放新闻里的二十秒画面，然后停下来提问；这小段影像就是 beeldfragment。",
  tekstsoort: "看到称呼、主题和结尾问候就知道它是邮件；像邮件、广告、新闻这样的文本类别就是 tekstsoort。",
  lesboektekst: "翻开教材的一页，先读一段文章再做后面的题；那段课本材料就是 lesboektekst。",
  vervolgstap: "申请提交后，屏幕告诉你先等邮件、再上传证件；接下来要做的那一步就是 vervolgstap。",
  graad: "天气 App 写 18 graden，烤箱也写 180 graden；这里表示温度或角度的单位就是 graad。",
  wolk: "抬头看天空，一团白灰色水汽遮住太阳；这一团就是 wolk。",
  regenbui: "刚出门还是晴天，十分钟后突然大雨，过一会儿又停；这种短阵雨就是 regenbui。",
  sneeuw: "早晨推开窗，屋顶和车顶盖着一层白色冰晶；这就是 sneeuw。",
  mist: "开车时前方的路和路牌变得模糊，只能慢慢开；这种白蒙蒙的天气就是 mist。",
  droogte: "很久没下雨，草地发黄、河水变低，政府提醒节水；这种长期缺水就是 droogte。",
  deelnemer: "报名跑步活动后站到起跑线上的每一个人，都是 deelnemer。",
  examenleider: "考试开始前，负责发卷、说明规则和收答题纸的人就是 examenleider。",
  ondernemer: "有人自己开咖啡店，负责进货、顾客和账单；这位经营者就是 ondernemer。",
  pakketje: "门铃响后，门口放着一个比 pakket 更小、贴着地址标签的包裹；这就是 pakketje。",
  schrijfopdracht: "考试要求你写一封投诉邮件或一段建议；这项要写出来的任务就是 schrijfopdracht。",
  luisterfragment: "听力练习只播放一小段电话录音，然后让你选答案；那一段录音就是 luisterfragment。",
  luisterstrategie: "第一次听抓大意，第二次听记数字和地点；这套听法就是 luisterstrategie。",
  salarisadministratie: "工资算错或缺了小时数时，公司里负责处理工资单和扣款的部门就是 salarisadministratie。",
  verleden: "填写表格时问“以前住在哪里”，你说的是已经过去的那段时间；这就是 verleden。",
  toekomst: "讨论五年后想做什么，眼前还没发生、在前面的时间就是 toekomst。",
  verpleeghuis: "老人需要每天有人照护、吃药和护理，不再独自住家里；他住的护理机构就是 verpleeghuis。",
  spier: "搬家后手臂酸，抬东西时收紧的那一束组织就是 spier。",
  hersenen: "思考、记忆和控制动作都在头颅里面完成；这个器官就是 hersenen。",
  pijnstillers: "头痛或手术后，医生让你按剂量吃用来减轻疼痛的药；这类药就是 pijnstillers。",
  eigenaar: "租房合同上写着房屋属于谁，收租并决定维修的人就是 eigenaar。",
  bewoner: "同一栋楼里实际住在那套房子的人，不一定是房主；他是 bewoner。",
  fietspad: "路边有红色铺装和自行车标志，骑车的人走这里；这条专用道就是 fietspad。",
  fietser: "戴头盔、踩踏板从你身边经过的人，就是 fietser。",
  vrachtwagen: "高速路上载着货柜、比普通汽车大很多的货车，就是 vrachtwagen。",
  ongeluk: "两辆车在路口相撞，警察和救护车到了；这起意外就是 ongeluk。",
  verpleegkundige: "在医院量血压、给药、协助医生照护病人的专业人员就是 verpleegkundige。",
  grafiek: "报告用一根根柱子或一条线显示销售额上升下降；这张图就是 grafiek。",
  arbeidsduur: "合同写每周工作 32 小时；这段约定的工作时长就是 arbeidsduur。",
  bankpasje: "结账时把小卡贴近读卡机、输入密码付款；这张银行卡就是 bankpasje。",
  cirkel: "用圆规在纸上画出一个没有角、首尾相接的圆形；这就是 cirkel。",
  conciërge: "学校里负责开门、处理小维修、帮老师找设备的工作人员就是 conciërge。",
  werknemer: "签了合同、按班次为公司工作并拿工资的人，就是 werknemer。",
  urencontract: "合同不保证固定周薪，只按你实际工作多少小时付钱；这种合同就是 urencontract。",
  minimumloon: "工资不能低于政府规定的最低小时金额；这个下限就是 minimumloon。",
  overuren: "正常班下班后还留下来继续工作两小时；多出来的这段就是 overuren。",
  wijk: "从家走到超市和公园，邻居、街道都在这一小片区域里；这片就是 wijk。",
  vrijwilliger: "活动现场有人不拿工资也来帮忙登记、倒咖啡；这位志愿者就是 vrijwilliger。",
  taalmaatje: "每周和一位荷兰人见面聊天、练习说话的学习伙伴，就是 taalmaatje。",
  grofvuil: "旧沙发、坏床垫放在指定收集日路边，不能塞进普通垃圾桶；这类大件垃圾就是 grofvuil。",
  aangifte: "手机被偷后去警局说明时间地点并留下正式记录；这份报案就是 aangifte。",
  diefstal: "回家发现自行车锁还在、车却不见了；这类偷走东西的事就是 diefstal。",
  verlies: "钱包找不到，里面的钱和卡都丢了；这种损失或丢失就是 verlies。",
  getuige: "事故发生时正好站在旁边、看见经过并能向警察说明的人就是 getuige。",
  toezicht: "游泳池边工作人员盯着水面，确保孩子安全；这种看护监督就是 toezicht。",
  brandweer: "火警响起后，红色消防车和穿制服的人赶来灭火；他们就是 brandweer。",
  intaketoets: "报名语言课前先做一套题，学校用结果安排你的班级；这套入学测试就是 intaketoets。",
  lesmateriaal: "老师发下文章、练习册和线上录音，这些上课用的材料合起来就是 lesmateriaal。",
  cursist: "晚上来语言学校上课、但不是普通中小学生的人，就是 cursist。",
  begeleider: "实习或课程中，有人定期问进展、给建议并帮你规划；这位指导者就是 begeleider。",
  oefentoets: "正式考试前先做一套计时模拟题，检查自己哪里不会；这套练习测试就是 oefentoets。",
  geslaagd: "考试成绩单显示 voldoende，你可以拿证书或进入下一阶段；这就是 geslaagd。",
  gezakt: "成绩没有达到及格线，需要重考；这种没通过的结果就是 gezakt。",
  cv: "申请工作时，把教育、经历和联系方式整理成一两页发给招聘方；这份简历就是 cv。",
  motivatiebrief: "申请工作时，除了简历还写一封解释为什么想做这份工作的信；这封信就是 motivatiebrief。",
  proefdag: "面试后公司请你来工作一天，看看你和团队是否合适；这一天就是 proefdag。",
  grens: "火车跨过国家之间的检查线，护照和规则开始不同；这条边界就是 grens。",
  douane: "入境时工作人员检查护照和行李，问有没有需要申报的物品；这个海关部门就是 douane。",
  bagage: "旅行时拖着的行李箱、背包和托运行李，合起来就是 bagage。",
  folder: "在市政府、医院或学校门口拿到一张折页，上面简要介绍服务和地址；这张宣传册就是 folder。",
  kopje: "长文章里每一段前有一行小标题，帮助你快速知道下面讲什么；这行小标题就是 kopje。",
  voorwaarden: "点同意订阅前，屏幕列出取消、付款和责任的规则；这些条件就是 voorwaarden。",
  aanslag: "税务局寄来一封信，写明你这一年需要缴多少税；这份税单就是 aanslag。",
  teruggave: "报税后，税务局把多收的钱转回你的账户；这笔返还就是 teruggave。",
  jaaropgave: "年初公司给你一张写着全年工资和已缴税款的文件；这张年度收入单就是 jaaropgave。",
  aftrekpost: "填报税表时，有些费用可以从应税收入里扣掉；这一项就是 aftrekpost。",
  vermogen: "报税表不只问工资，也问存款、投资和房产；这些资产合起来就是 vermogen。",
  voorschot: "正式金额还没确定前，政府或公司先按估计给你一部分钱；这笔预付款就是 voorschot。",
  teamleider: "一个小组里安排工作、带大家开会并向经理汇报的人就是 teamleider。",
  arbeidscontract: "入职时签的文件写着职位、工资、工时和假期；这份劳动合同就是 arbeidscontract。",
  waarborgsom: "租房签约时先交一笔钱，退房没损坏才可能拿回来；这笔押金就是 waarborgsom。",
  oppervlakte: "租房广告写 55 m2，它说的是地板实际覆盖的大小；这个面积就是 oppervlakte。",
  afschrift: "打开银行 App 下载一页列着每笔收支的 PDF；这份账户明细就是 afschrift。",
  polisblad: "买保险后收到一页写着保单号、保障内容和保费的文件；这张保单页就是 polisblad。",
  verzekerde: "保险合同里被保障、名字写在保单上的那个人就是 verzekerde。",
  zorgverlener: "医生、护士或物理治疗师这些向你提供医疗照护的专业人员，都是 zorgverlener。",
  prik: "护士用细针在手臂上打疫苗或抽血的那一下，就是 prik。",
  verloskundige: "怀孕期间定期检查、在分娩前后照护母婴的专业人员就是 verloskundige。",
  mondhygiënist: "看牙前先有人清洁牙齿、检查牙龈并教你刷牙；这位口腔卫生师就是 mondhygiënist。",
  fysiotherapeut: "扭伤后做拉伸和力量练习，指导恢复动作的治疗师就是 fysiotherapeut。",
  mantelzorg: "家人长期帮病人做饭、洗澡、去医院，不是正式受雇护理；这种照护就是 mantelzorg。",
  oppas: "父母晚上出门，请一位熟人来家里陪孩子、等他们睡觉；这位临时看护就是 oppas。",
  familielid: "在婚礼或生日上，父母、兄弟姐妹、叔姨都属于你的 familielid。",
  rolstoel: "腿受伤不能走路时，坐进带轮子的椅子由自己推或别人推；这就是 rolstoel。",
  hulpmiddel: "老人用助行器、放大镜或开瓶器来完成原本困难的动作；这种辅助工具就是 hulpmiddel。",
  consultatiebureau: "孩子很小的时候，父母去那里量身高体重、打疫苗并咨询发育；这个儿童保健中心就是 consultatiebureau。",
  kinderopvangtoeslag: "孩子去托儿所后，政府按收入帮你支付一部分费用；这项托儿补贴就是 kinderopvangtoeslag。",
  weduwe: "一位女性的配偶去世后，她作为留下来的妻子就是 weduwe。",
  weduwnaar: "一位男性的配偶去世后，他作为留下来的丈夫就是 weduwnaar。",
  marktkoopman: "集市上站在摊位后卖水果、衣服或奶酪的人就是 marktkoopman。",
  verbruik: "电表从 1200 跳到 1260，账单按这段时间用了多少电来算；这个用量就是 verbruik。",
  stroom: "按下开关后灯亮、插座给手机充电，在线路里流动的电就是 stroom。",
  warmte: "暖气开着后房间变暖，手靠近散热器感到的热就是 warmte。",
  verbruiksperiode: "能源账单写 1 januari tot 31 maart，这段计算用量的时间就是 verbruiksperiode。",
};

function firstLifeSceneMemoryPathFor(word: WordItem, wordType: MemoryPathWordType) {
  if (wordType !== "noun") return undefined;
  const key = normalizeWordText(word.dutch);
  const exact = exactLifeSceneHooks[key];
  if (exact) return exact;
  const curatedZh = curatedA1LifeSceneHooks[key];
  const curatedA2Zh = curatedA2LifeSceneHooks[key];
  const curatedB1Zh = curatedB1LifeSceneHooks[key];
  if (curatedZh || curatedA2Zh || curatedB1Zh) {
    return {
      zh: curatedZh ?? curatedA2Zh ?? curatedB1Zh ?? "",
      en: `A concrete everyday scene for ${word.dutch}: ${primaryMeaning(word, "en")}.`,
    };
  }
  return themedLifeSceneForWord(word);
}

const bodyPartMapHooks: Record<string, { zh: string; en: string }> = {
  hoofd: {
    zh: "有人叫你时先抬头，点头、摇头、看过去，动作先落在 hoofd。",
    en: "When someone calls you, you raise, nod, or turn your hoofd first.",
  },
  buik: {
    zh: "吃饱后下意识摸一摸肚子，这个最先冒出来的画面就是 buik。",
    en: "After eating, the hand naturally goes to the belly; that first image is buik.",
  },
  arm: {
    zh: "够高处的东西时先把手臂伸出去，伸出去的这一整条就是 arm。",
    en: "When reaching for something, the whole part you stretch out is the arm.",
  },
  been: {
    zh: "准备走路时先迈出一条腿，负责站和走的这一条就是 been。",
    en: "When you start walking, the part you step forward with is the been.",
  },
  hand: {
    zh: "写字、刷卡、开门时最先动的是 hand。",
    en: "Writing, tapping a card, and opening a door all start with the hand.",
  },
  voet: {
    zh: "穿鞋时先找 voet；踩到地上的那一端就是 voet。",
    en: "When putting on shoes, you look for the voet: the part that touches the ground.",
  },
  rug: {
    zh: "背包一背上去，受力的那整片后背就是 rug。",
    en: "When a backpack goes on, the broad back area carrying it is rug.",
  },
  keel: {
    zh: "吞口水或清嗓子时，里面有感觉的地方就是 keel。",
    en: "When swallowing or clearing your voice, the place you feel is keel.",
  },
  oog: {
    zh: "看屏幕、看路、看人时先用 oog。",
    en: "Reading a screen, watching the road, or looking at someone starts with the oog.",
  },
  oor: {
    zh: "听到门铃或别人叫你，声音先进 oor。",
    en: "A doorbell or someone calling you reaches the oor first.",
  },
  neus: {
    zh: "闻到咖啡味、感到鼻塞，第一反应都是 neus。",
    en: "Smelling coffee or feeling a blocked nose points straight to neus.",
  },
  mond: {
    zh: "开口说话、吃东西张开的地方就是 mond。",
    en: "The part that opens for speaking and eating is mond.",
  },
  tand: {
    zh: "咬苹果时一颗颗用力的就是 tand。",
    en: "When biting an apple, each hard biting piece is a tand.",
  },
  knie: {
    zh: "下楼或蹲下时会弯起来的那个点就是 knie。",
    en: "The point that bends when going downstairs or squatting is knie.",
  },
  schouder: {
    zh: "背包带压住、耸一下的地方就是 schouder。",
    en: "The place a bag strap presses, the part you shrug, is schouder.",
  },
  nek: {
    zh: "低头看手机久了，最先僵住的那段就是 nek。",
    en: "After looking down at a phone too long, the stiff part is nek.",
  },
  borst: {
    zh: "深呼吸时上下起伏的胸口这一片就是 borst。",
    en: "The chest area that rises and falls with a deep breath is borst.",
  },
  hart: {
    zh: "手放胸口能感觉到跳动，里面跳着的是 hart。",
    en: "Put a hand on the chest and feel the beat: that is hart.",
  },
  maag: {
    zh: "饿了或吃撑时，里面最有感觉的是 maag。",
    en: "When hungry or too full, the part you notice inside is maag.",
  },
  huid: {
    zh: "洗澡水冷热、衣服摩擦，最外面感受到的是 huid。",
    en: "Hot water, cold air, and clothes rubbing are felt by the huid.",
  },
  lichaam: {
    zh: "不是某一个部位，而是从头到脚整个身体：lichaam。",
    en: "Not one part, but the whole body from head to toe: lichaam.",
  },
};

const bodyPartNeighborHooks: Record<string, { zh: string; en: string }> = {
  hoofd: {
    zh: "常见动作：je hoofd draaien = 转头；met je hoofd knikken = 点头。",
    en: "Common actions: je hoofd draaien = turn your head; met je hoofd knikken = nod.",
  },
  buik: {
    zh: "常见画面：een volle buik = 吃饱的肚子；je buik vasthouden = 捂着肚子。",
    en: "Common images: een volle buik = a full belly; je buik vasthouden = hold your belly.",
  },
  arm: {
    zh: "常见动作：je arm uitsteken = 伸出手臂；iets in je arm houden = 抱着东西。",
    en: "Common actions: je arm uitsteken = stretch out your arm; iets in je arm houden = hold something in your arm.",
  },
  been: {
    zh: "常见动作：op een been staan = 单脚站；je been optillen = 抬腿。",
    en: "Common actions: op een been staan = stand on one leg; je been optillen = lift your leg.",
  },
  hand: {
    zh: "常见动作：je hand opsteken = 举手；met de hand schrijven = 用手写。",
    en: "Common actions: je hand opsteken = raise your hand; met de hand schrijven = write by hand.",
  },
  voet: {
    zh: "常见动作：op je voeten staan = 站着；je voet in een schoen steken = 把脚伸进鞋里。",
    en: "Common actions: op je voeten staan = stand on your feet; je voet in een schoen steken = put your foot in a shoe.",
  },
  rug: {
    zh: "常见画面：een tas op je rug = 背上一个包。",
    en: "Common image: een tas op je rug = a bag on your back.",
  },
  keel: {
    zh: "常见动作：slikken = 吞咽；je keel schrapen = 清嗓子。",
    en: "Common actions: slikken = swallow; je keel schrapen = clear your throat.",
  },
  oog: {
    zh: "常见动作：je ogen dichtdoen = 闭眼；goed kijken = 好好看。",
    en: "Common actions: je ogen dichtdoen = close your eyes; goed kijken = look carefully.",
  },
  oor: {
    zh: "常见动作：goed luisteren = 好好听；iets in je oor horen = 耳朵里听到声音。",
    en: "Common actions: goed luisteren = listen carefully; iets in je oor horen = hear something in your ear.",
  },
  neus: {
    zh: "常见动作：door je neus ademen = 用鼻子呼吸；iets ruiken = 闻味道。",
    en: "Locate neus in the middle of gezicht, below oog and above mond.",
  },
  mond: {
    zh: "常见动作：je mond opendoen = 张嘴；met je mond praten = 用嘴说话。",
    en: "Common actions: je mond opendoen = open your mouth; met je mond praten = speak with your mouth.",
  },
  tand: {
    zh: "常见动作：je tanden poetsen = 刷牙；op iets bijten = 咬东西。",
    en: "Locate tand inside mond, one tooth at a time for biting.",
  },
  knie: {
    zh: "常见动作：door je knieën gaan = 蹲/弯膝；je knie buigen = 弯膝盖。",
    en: "Locate knie in the middle of been, the bending point of the leg.",
  },
  schouder: {
    zh: "常见动作：je schouders ophalen = 耸肩；een tas op je schouder dragen = 肩上背包。",
    en: "Locate schouder beside nek, where arm begins.",
  },
  nek: {
    zh: "常见动作：je nek draaien = 转脖子；je nek strekken = 伸脖子。",
    en: "Common actions: je nek draaien = turn your neck; je nek strekken = stretch your neck.",
  },
  borst: {
    zh: "常见动作：diep ademhalen = 深呼吸；胸口会跟着起伏。",
    en: "Common action: take a deep breath and the chest rises and falls.",
  },
  hart: {
    zh: "常见感觉：je hart klopt = 心在跳。",
    en: "Locate hart inside borst, the core point in the chest.",
  },
  maag: {
    zh: "常见感觉：honger hebben / vol zitten，饿或吃撑时最容易想到 maag。",
    en: "Locate maag inside buik, the part you notice after eating.",
  },
  huid: {
    zh: "常见感觉：huid voelt warm/koud，冷热先落在皮肤上。",
    en: "Locate huid as the outer layer around lichaam, covering every body part.",
  },
  lichaam: {
    zh: "常见画面：heel mijn lichaam = 全身；lichaam 和某个单独部位不一样。",
    en: "Common image: heel mijn lichaam = my whole body; lichaam is not one separate part.",
  },
};

function bodyPartMemoryDetailsFor(word: WordItem, wordType: MemoryPathWordType): CategoryMemoryDetails | undefined {
  if (wordType !== "noun") return undefined;
  const key = normalizeWordText(word.dutch);
  if (!painBodyNounPattern.test(key)) return undefined;

  const mapHook = bodyPartMapHooks[key];
  if (!mapHook) return undefined;

  const article = word.article ? `${word.article} ${word.dutch}` : word.dutch;
  const plural = word.plural ? `，复数 ${word.plural}` : "";
  const neighborHook = bodyPartNeighborHooks[key] ?? {
    zh: `${word.dutch} 先用一个真实动作或触感记住，不靠疼痛句硬记。`,
    en: `Remember ${word.dutch} through a real action or sensation, not through a pain sentence.`,
  };

  return {
    titleZh: "第一动作画面",
    titleEn: "First Action Image",
    explanationZh: `${word.dutch} 先用身体会做的动作/触感来记，不用疼痛句硬套。`,
    explanationEn: `Learn ${word.dutch} through a real body action or sensation, not by forcing a pain sentence.`,
    hookZh: mapHook.zh,
    hookEn: mapHook.en,
    usageZh: neighborHook.zh,
    usageEn: neighborHook.en,
    warningZh: `荷兰语形式：${article}${plural}。`,
    warningEn: `In Dutch, anchor it as ${article}${word.plural ? `, plural ${word.plural}` : ""}.`,
  };
}

function dominantPhraseFor(word: WordItem, context: MemoryPathContext, wordType: MemoryPathWordType) {
  const key = normalizeWordText(word.dutch);
  const seeded = memoryPhraseSeeds[key]?.find((phrase) => phrase.dutch && phrase.meaningZh);
  if (seeded) return localizedMemoryPhraseSeed(seeded);

  const actionSeed = actionObjectPhraseSeeds[key]?.[0];
  if (actionSeed) return localizedMemoryPhraseSeed(actionSeed);

  const allowContextPhrase =
    wordType === "verb" ||
    wordType === "phrase" ||
    phraseBasedWords.has(key) ||
    greetingPhraseWords.has(key);
  if (!allowContextPhrase) return undefined;

  const phraseChunk = cleanPhraseChunks(word, context).find((chunk) => {
    const dutch = chunk.dutch.trim();
    return dutch && chunk.meaningZh && !/[.!?]$/.test(dutch);
  });
  if (phraseChunk) return phraseChunk;
  return undefined;
}

function actionUsageExplanationForWord(
  word: WordItem,
  context: MemoryPathContext,
  wordType: MemoryPathWordType,
  meaningZh: string,
  meaningEn: string,
) {
  if (wordType !== "verb") return undefined;
  const chunks = cleanPhraseChunks(word, context);
  const objectHint = actionObjectHintFromChunks(word, chunks);
  const key = normalizeWordText(word.dutch);
  const infinitive = finiteVerbFormInfoFor(word)?.infinitive;
  const familyKey = infinitive ?? key;
  const override = actionUsageExplanationOverrides[key] ?? actionUsageExplanationOverrides[familyKey];
  if (override) return override;

  const closeLike = familyKey === "sluiten" || key === "sluit";
  if (closeLike) {
    return {
      zh: `${word.dutch} 管“从开到关”；后面常接 ${objectHint.zh || "de deur / het raam / de app"}。`,
      en: `${word.dutch} means turning something open into closed; it often takes ${objectHint.en || "de deur / het raam / de app"}.`,
    };
  }

  const openLike = familyKey === "openen" || key === "open";
  if (openLike) {
    return {
      zh: `${word.dutch} 管“从关到开”；后面常接 ${objectHint.zh || "de deur / de app / het formulier"}。`,
      en: `${word.dutch} means turning something closed into open; it often takes ${objectHint.en || "de deur / de app / het formulier"}.`,
    };
  }

  const comeLike = familyKey === "komen" || key === "kom";
  if (comeLike) {
    return {
      zh: `${word.dutch} 表示“来/到来”：人可以来，车可以到，约定时间也可以到；说来源才用 kom uit。`,
      en: `${word.dutch} means come/arrive: a person comes, transport arrives, or an appointment time comes. Use kom uit only for origin.`,
    };
  }

  if (objectHint.zh && objectHint.en) {
    return {
      zh: `${word.dutch} = ${meaningZh}；常见动作骨架：${word.dutch} + ${objectHint.zh}。`,
      en: `${word.dutch} = ${meaningEn}; common action frame: ${word.dutch} + ${objectHint.en}.`,
    };
  }

  const shortAction = verbShortActionHooks[key] ?? verbShortActionHooks[familyKey];
  if (shortAction) return shortAction;

  return {
    zh: `${word.dutch} = ${meaningZh}；先把动作本身看清，再补它实际需要的人、物或介词。`,
    en: `${word.dutch} = ${meaningEn}; picture the action itself, then add the person, object, or preposition it actually needs.`,
  };
}

function actionObjectHintFromChunks(word: WordItem, chunks: MemoryPath["phraseChunks"]) {
  const key = normalizeWordText(word.dutch);
  const finite = finiteVerbFormInfoFor(word);
  const targetForms = new Set([key, finite?.infinitive, finite?.current.form, ...likelyVerbFormsForKey(key)].filter(Boolean).map(String));
  const prepositionOnlyHints = new Set(["aan", "bij", "door", "in", "met", "naar", "om", "op", "over", "te", "tegen", "tot", "uit", "van", "voor"]);
  const hints = chunks
    .map((chunk) => chunk.dutch.trim())
    .filter((chunk) => chunk && !/[.!?]$/.test(chunk))
    .map((chunk) => chunk
      .split(/\s+/)
      .filter((token) => !targetForms.has(normalizeWordText(token)))
      .join(" ")
      .trim())
    .filter((hint) => hint && !prepositionOnlyHints.has(normalizeWordText(hint)));
  const uniqueHints = Array.from(new Set(hints)).slice(0, 3);
  const text = uniqueHints.join(" / ");
  return { zh: text, en: text };
}

function likelyVerbFormsForKey(key: string) {
  const forms = new Set<string>();
  if (key.endsWith("en")) {
    forms.add(key.slice(0, -2));
    return Array.from(forms);
  }
  forms.add(`${key}en`);
  if (/[bcdfghjklmnpqrstvwxz]$/.test(key)) {
    forms.add(`${key}${key.at(-1)}en`);
  }
  if (key.endsWith("f")) forms.add(`${key.slice(0, -1)}ven`);
  if (key.endsWith("s")) forms.add(`${key.slice(0, -1)}zen`);
  return Array.from(forms);
}

function creativeMemoryPathFor(word: WordItem) {
  const key = normalizeWordText(word.dutch);
  return exactCreativeHooks[key];
}

const exactSurvivalHooks: Record<string, { zh: string; en: string }> = {
  wachten: { zh: "办事看医白坐半小时", en: "The word for waiting through Dutch appointments." },
  korting: { zh: "AH见korting立刻拿", en: "At AH, korting means grab the discount." },
  afspraak: { zh: "看医办事先预约", en: "Dutch admin and care usually start with an appointment." },
  formulier: { zh: "市政厅递纸就填它", en: "Municipal offices hand you the form first." },
  rekening: { zh: "账单一到先看金额", en: "When the bill arrives, check the amount." },
  huisarts: { zh: "生病先找家庭医生", en: "In the Netherlands, illness starts with the GP." },
  gemeente: { zh: "办证搬家找市政厅", en: "Registration, moving, and documents go through the municipality." },
  vertraging: { zh: "NS屏幕跳它就晚点", en: "On an NS board, this means delay." },
  verzekering: { zh: "保险不认账先查它", en: "When insurance refuses, check this word first." },
  dekking: { zh: "保险盖不到就自费", en: "If coverage misses it, you pay yourself." },
  gegevens: { zh: "表格又要全套资料", en: "Forms demand your details again." },
  bewijs: { zh: "没bewijs窗口白跑", en: "No proof, no progress at the counter." },
  klacht: { zh: "客服不理就写klacht", en: "When service ignores you, file a complaint." },
  storing: { zh: "机器罢工屏幕写它", en: "Machines fail and flash this word." },
  boete: { zh: "信箱一封boete心凉", en: "A boete letter in the mailbox hurts." },
  belasting: { zh: "蓝信封来了就是税", en: "The blue envelope means tax." },
  huur: { zh: "每月最痛那笔房租", en: "The monthly rent payment that hurts." },
  borg: { zh: "退房时最怕扣borg", en: "The deposit you fear losing at move-out." },
  apotheek: { zh: "医生开药后冲这里", en: "After the GP, go here for medicine." },
  recept: { zh: "没recept药房不认", en: "No prescription, pharmacy says no." },
  ziekmelding: { zh: "病了还得正式报备", en: "Even sickness needs formal reporting." },
  salaris: { zh: "月底盯银行等它来", en: "End of month: watch the bank for salary." },
  toeslag: { zh: "补贴到账才松口气", en: "Allowance money arriving is relief." },
};

function survivalMemoryPathFor(word: WordItem, wordType: MemoryPathWordType) {
  const key = normalizeWordText(word.dutch);
  const exact = exactSurvivalHooks[key];
  if (exact) return exact;

  return undefined;
}

const multiUseMemoryDetails: Record<string, CategoryMemoryDetails> = {
  zijn: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "zijn 先看位置：跟主语走是动词“是/在”；放在名词前是“他的/它的”；er zijn 表示“有/存在”。",
    explanationEn: "Read zijn by position: with a subject it is the verb to be; before a noun it means his/its; er zijn means there are.",
    hookZh: "主语后=是；名词前=他的",
    hookEn: "After subject = be; before noun = his/its.",
    usageZh: "Wij zijn thuis = 我们在家；zijn fiets = 他的自行车；Er zijn twee ramen = 有两扇窗。",
    usageEn: "Wij zijn thuis = we are home; zijn fiets = his bike; Er zijn twee ramen = there are two windows.",
    warningZh: "不要看到 zijn 就只翻成“是”；先看后面是不是名词。",
    warningEn: "Do not translate every zijn as be; first check whether a noun follows.",
  },
  haar: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "haar 先看外壳：het haar 是“头发”；haar + 名词是“她的”；动词后单独出现多半是“她”。",
    explanationEn: "Read haar by its shell: het haar means hair; haar + noun means her; alone after a verb often means her.",
    hookZh: "het haar=头发；haar fiets=她的车",
    hookEn: "het haar = hair; haar fiets = her bike.",
    usageZh: "Mijn haar is nat = 我的头发湿了；haar fiets = 她的自行车；Ik zie haar = 我看见她。",
    usageEn: "Mijn haar is nat = my hair is wet; haar fiets = her bike; Ik zie haar = I see her.",
    warningZh: "不要看到 haar 就自动翻“她的”；有 het 时通常是头发。",
    warningEn: "Do not always read haar as her; with het it is usually hair.",
  },
  het: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "het 名词前是冠词；动词后常指“它/这件事”；Het is... 还能开天气、状态句。",
    explanationEn: "Before a noun, het is an article; after a verb it often means it/the matter; Het is... opens weather or state lines.",
    hookZh: "名词前=冠词；动词后=这事",
    hookEn: "Before noun = article; after verb = it/the matter.",
    usageZh: "het huis = 这个房子；Ik begrijp het niet = 我不明白这件事；Het is koud = 天冷。",
    usageEn: "het huis = the house; Ik begrijp het niet = I do not understand it; Het is koud = it is cold.",
    warningZh: "别把 het 只当 the；句子里常是在接住“这件事”。",
    warningEn: "Do not treat het only as the; in sentences it often carries the matter/it.",
  },
  je: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "je 是口语万能弱读：句首做“你”，动词后做“你”，名词前做“你的”。",
    explanationEn: "je is a reduced everyday form: subject you, object you, and your before a noun.",
    hookZh: "je bent=你是；je fiets=你的车",
    hookEn: "je bent = you are; je fiets = your bike.",
    usageZh: "Je bent thuis = 你在家；Ik zie je = 我看见你；je fiets = 你的自行车。",
    usageEn: "Je bent thuis = you are home; Ik zie je = I see you; je fiets = your bike.",
    warningZh: "jij/jou/jouw 更清楚；je 最常见但要靠位置判断。",
    warningEn: "jij/jou/jouw are clearer; je is common but position decides the role.",
  },
  u: {
    titleZh: "礼貌用法",
    titleEn: "Formal You",
    explanationZh: "u 是礼貌的“您”，主语和宾语同形；名词前表示“您的”要用 uw。",
    explanationEn: "u is polite you as both subject and object; before a noun, use uw for your.",
    hookZh: "u=您；uw naam=您的名字",
    hookEn: "u = you formal; uw naam = your name.",
    usageZh: "Kunt u mij helpen = 您能帮我吗；Ik bel u morgen = 我明天给您打电话；uw naam = 您的名字。",
    usageEn: "Kunt u mij helpen = can you help me; Ik bel u morgen = I will call you tomorrow; uw naam = your name.",
    warningZh: "不要把 u 和 uw 混写：名词前用 uw。",
    warningEn: "Do not mix u and uw: before a noun, use uw.",
  },
  zij: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "zij 可以是“她”，也可以是重读的“他们/她们”；真正的开关是后面动词。",
    explanationEn: "zij can mean she or stressed they; the real switch is the verb after it.",
    hookZh: "zij is=她；zij zijn=他们",
    hookEn: "zij is = she; zij zijn = they.",
    usageZh: "Zij is thuis = 她在家；Zij zijn mijn ouders = 他们/她们是我的父母。",
    usageEn: "Zij is thuis = she is home; Zij zijn mijn ouders = they are my parents.",
    warningZh: "不要只背 zij=她；看到复数动词就切到“他们/她们”。",
    warningEn: "Do not memorize only zij = she; plural verbs switch it to they.",
  },
  ze: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "ze 是 zij 的弱读，听力里很常见；可指她、他们/她们，也可在动词后作宾语。",
    explanationEn: "ze is the reduced form of zij; in listening it can mean she, they, or them after a verb.",
    hookZh: "ze is=她；ze zijn=他们",
    hookEn: "ze is = she; ze zijn = they.",
    usageZh: "Ze is thuis = 她在家；Ze zijn thuis = 他们/她们在家；Ik zie ze = 我看见他们/她们。",
    usageEn: "Ze is thuis = she is home; Ze zijn thuis = they are home; Ik zie ze = I see them.",
    warningZh: "ze 太轻，别只听词形；跟着动词和位置判断。",
    warningEn: "ze is light; use the verb and position to decide the meaning.",
  },
  ons: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "ons 可作宾语“我们”，也可在 het-名词前作“我们的”；de/复数名词前常换 onze。",
    explanationEn: "ons can be object us, or our before het-nouns; before de/plural nouns it often becomes onze.",
    hookZh: "help ons=帮我们；ons huis=我们的房子",
    hookEn: "help ons = help us; ons huis = our house.",
    usageZh: "De docent helpt ons = 老师帮助我们；ons huis = 我们的房子；onze fietsen = 我们的自行车。",
    usageEn: "De docent helpt ons = the teacher helps us; ons huis = our house; onze fietsen = our bikes.",
    warningZh: "物主用法要看名词性别/复数：ons huis，但 onze fiets。",
    warningEn: "For possessive use, check the noun: ons huis, but onze fiets.",
  },
  jullie: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "jullie 可作主语/宾语“你们”，也可在名词前表示“你们的”。",
    explanationEn: "jullie can be subject/object you plural, and before a noun it means your plural.",
    hookZh: "jullie komen=你们来；jullie afspraak=你们的预约",
    hookEn: "jullie komen = you all come; jullie afspraak = your appointment.",
    usageZh: "Jullie zijn op tijd = 你们准时；Ik zie jullie = 我看见你们；jullie afspraak = 你们的预约。",
    usageEn: "Jullie zijn op tijd = you are on time; Ik zie jullie = I see you all; jullie afspraak = your appointment.",
    warningZh: "jullie 没有单独物主变形；靠位置判断是不是“你们的”。",
    warningEn: "jullie has no separate possessive form; position tells whether it means your.",
  },
  er: {
    titleZh: "多义分叉",
    titleEn: "Multiple Uses",
    explanationZh: "er 不是普通 there；它常开“有/存在”，也可代替已经说过的地点。",
    explanationEn: "er is not a plain there; it often opens existence, or replaces a place already mentioned.",
    hookZh: "er is=有；ik woon er=住那",
    hookEn: "er is = there is; ik woon er = I live there.",
    usageZh: "Er is een probleem = 有一个问题；Ik woon er = 我住在那里；Er zijn twee ramen = 有两扇窗。",
    usageEn: "Er is een probleem = there is a problem; Ik woon er = I live there; Er zijn twee ramen = there are two windows.",
    warningZh: "看到 er 先问：是在说“有”，还是在指回某个地点？",
    warningEn: "When you see er, ask: existence, or pointing back to a place?",
  },
};

function multiUseMemoryDetailsFor(word: WordItem) {
  return multiUseMemoryDetails[normalizeWordText(word.dutch)];
}

function automatedMemoryCardFor(
  word: WordItem,
  context: MemoryPathContext,
  allWords: WordItem[],
  wordType: MemoryPathWordType,
): AutomatedMemoryCard {
  const key = normalizeWordText(word.dutch);
  const meaningZh = shortMeaningZh(primaryMeaning(word, "zh"));
  const meaningEn = shortMeaningEn(primaryMeaning(word, "en"));

  const breakdown = compoundBreakdowns[key] ?? dynamicBreakdownFor(word, allWords);
  if (breakdown?.parts.length && breakdown.parts.length >= 2) {
    const [first, second] = breakdown.parts;
    const path = compactMemoryPath(`${first.dutch}(${shortMeaningZh(first.meaningZh)})+${second.dutch}(${shortMeaningZh(second.meaningZh)})→${meaningZh}`);
    return {
      card_title: "天然拆词梗",
      memory_path: path,
      memoryPathEn: `${first.dutch} (${first.meaningEn}) + ${second.dutch} (${second.meaningEn}) -> ${meaningEn}`,
      strategy: "word-breakdown",
      confidence: "high",
      breakdown,
    };
  }

  const formation = wordFormationSeeds[key] ?? inferredHeidFormationFor(word, allWords) ?? inferredBaarFormationFor(word, allWords) ?? inferredIngFormationFor(word, allWords);
  if (formation) {
    return {
      card_title: "词形联想",
      memory_path: compactMemoryPath(`${formation.base.dutch}(${shortMeaningZh(formation.base.meaningZh)})→${meaningZh}`),
      memoryPathEn: `${formation.base.dutch} (${formation.base.meaningEn}) -> ${meaningEn}`,
      strategy: "word-formation",
      confidence: "high",
      formation,
      explanationZh: formation.noteZh,
      explanationEn: formation.noteEn,
    };
  }

  const earlyFunctionWordCard = functionWordSeeds[key];
  if (earlyFunctionWordCard) {
    const hook = shortFunctionHook(key, earlyFunctionWordCard);
    return {
      card_title: "功能词",
      memory_path: hook.zh,
      memoryPathEn: hook.en,
      strategy: "sentence-based",
      confidence: "high",
      functionWord: earlyFunctionWordCard,
      explanationZh: earlyFunctionWordCard.explanationZh,
      explanationEn: earlyFunctionWordCard.explanationEn,
    };
  }

  const earlyFunctionHookCard = functionWordMemoryPaths[key];
  if (earlyFunctionHookCard) {
    const hook = shortFunctionHook(key, earlyFunctionHookCard);
    return {
      card_title: "功能词",
      memory_path: hook.zh,
      memoryPathEn: hook.en,
      strategy: "sentence-based",
      confidence: "high",
      functionWord: earlyFunctionHookCard,
      explanationZh: earlyFunctionHookCard.explanationZh,
      explanationEn: earlyFunctionHookCard.explanationEn,
    };
  }

  const bridge = englishBridgeFor(word);
  if (bridge && !phraseLike(word.dutch)) {
    const english = englishBridgeToken(bridge);
    const divergent = isDivergentEnglishBridge(bridge);
    return {
      card_title: divergent ? "英文易混提示" : "英文桥梁",
      memory_path: compactMemoryPath(divergent ? `像${english}，其实是${meaningZh}` : `像${english}，意思也一样`),
      memoryPathEn: divergent ? `Looks like ${english}, but means ${meaningEn}.` : `Looks like ${english}; meaning matches.`,
      strategy: "english-bridge",
      confidence: englishBridgeSeeds[key] ? "high" : "medium",
      englishBridge: bridge,
    };
  }

  const confusing = confusingMemoryPaths[key];
  if (confusing) {
    return {
      card_title: "易混词对比",
      memory_path: compactMemoryPath(confusing.zh),
      memoryPathEn: confusing.en,
      strategy: "meaning-contrast",
      confidence: "high",
    };
  }

  const category = categoryDetailsFor(word, wordType);
  if (category && (wordType === "language-name" || wordType === "country-name" || wordType === "number" || wordType === "day-month")) {
    return {
      card_title: "类别规则",
      memory_path: compactMemoryPath(category.hookZh),
      memoryPathEn: category.hookEn,
      strategy: "category-rule",
      confidence: "high",
      explanationZh: category.explanationZh,
      explanationEn: category.explanationEn,
    };
  }

  const functionWord = functionWordSeeds[key];
  if (functionWord) {
    const hook = shortFunctionHook(key, functionWord);
    return {
      card_title: "功能词",
      memory_path: hook.zh,
      memoryPathEn: hook.en,
      strategy: "sentence-based",
      confidence: "high",
      functionWord,
      explanationZh: functionWord.explanationZh,
      explanationEn: functionWord.explanationEn,
    };
  }

  const functionHook = functionWordMemoryPaths[key];
  if (functionHook) {
    const hook = shortFunctionHook(key, functionHook);
    return {
      card_title: "功能词",
      memory_path: hook.zh,
      memoryPathEn: hook.en,
      strategy: "sentence-based",
      confidence: "high",
      functionWord: functionHook,
      explanationZh: functionHook.explanationZh,
      explanationEn: functionHook.explanationEn,
    };
  }

  const fixedExpression = fixedExpressionSeeds[key];
  if (fixedExpression) {
    const hook = fixedExpressionMemoryPaths[key] ?? {
      zh: compactMemoryPath(fixedExpression.functionZh),
      en: fixedExpression.functionEn,
    };
    return {
      card_title: "固定表达",
      memory_path: compactMemoryPath(hook.zh),
      memoryPathEn: hook.en,
      strategy: "fixed-expression",
      confidence: "high",
      fixedExpression,
    };
  }

  const creative = creativeMemoryPathFor(word);
  if (creative) {
    return {
      card_title: "趣味联想",
      memory_path: compactMemoryPath(creative.zh),
      memoryPathEn: creative.en,
      strategy: "no-strong-association",
      confidence: "high",
    };
  }

  const actionExplanation = actionUsageExplanationForWord(word, context, wordType, meaningZh, meaningEn);
  const usageHook = wordType === "noun" ? undefined : usageMemoryPaths[key];
  if (usageHook) {
    return {
      card_title: wordType === "verb" ? "动词结构" : "搭配提醒",
      memory_path: compactMemoryPath(usageHook.zh),
      memoryPathEn: usageHook.en,
      strategy: "sentence-based",
      confidence: "high",
      explanationZh: usageHook.explanationZh,
      explanationEn: usageHook.explanationEn,
    };
  }

  const survival = survivalMemoryPathFor(word, wordType);
  if (survival) {
    return {
      card_title: "日常生存卡点",
      memory_path: compactMemoryPath(survival.zh),
      memoryPathEn: survival.en,
      strategy: "no-strong-association",
      confidence: "high",
    };
  }

  const lifeScene = firstLifeSceneMemoryPathFor(word, wordType);
  if (lifeScene) {
    return {
      card_title: "第一生活画面",
      memory_path: lifeScene.zh,
      memoryPathEn: lifeScene.en,
      strategy: "no-strong-association",
      confidence: exactLifeSceneHooks[key] || curatedA1LifeSceneHooks[key] ? "high" : "medium",
      explanationZh: lifeScene.zh,
      explanationEn: lifeScene.en,
    };
  }

	  if (wordType === "noun") {
	    const output = outputSentenceFor(word, context);
	    const hook = nounUsageHookForWord(word, output, []);
	    return {
	      card_title: "第一生活画面",
	      memory_path: compactMemoryPath(hook.zh),
	      memoryPathEn: hook.en,
	      strategy: "no-strong-association",
	      confidence: exactLifeSceneHooks[key] ? "high" : "medium",
	      explanationZh: hook.zh,
	      explanationEn: hook.en,
	    };
	  }

  return {
    card_title: wordType === "verb" ? "动词结构" : "功能规则",
    memory_path: compactMemoryPath(actionExplanation?.zh ?? `${word.dutch}=${meaningZh}`),
    memoryPathEn: actionExplanation?.en ?? `${word.dutch} = ${meaningEn}`,
    strategy: "sentence-based",
    confidence: "medium",
    explanationZh: actionExplanation?.zh ?? `${word.dutch} 用词义和自然句子稳住，不抢戏乱联想。`,
    explanationEn: actionExplanation?.en ?? `Do not force a hook for ${word.dutch}; keep the meaning and a natural line stable first.`,
  };
}

function automatedExplanationFor(card: AutomatedMemoryCard) {
  if (card.explanationZh && card.explanationEn) {
    return {
      zh: card.explanationZh,
      en: card.explanationEn,
    };
  }
  if (card.breakdown) {
    return {
      zh: card.breakdown.noteZh,
      en: card.breakdown.noteEn,
    };
  }
  if (card.englishBridge) {
    return {
      zh: card.englishBridge.noteZh,
      en: card.englishBridge.noteEn,
    };
  }
  if (card.formation) {
    return {
      zh: card.formation.noteZh,
      en: card.formation.noteEn,
    };
  }
  if (card.fixedExpression) {
    return {
      zh: card.fixedExpression.explanationZh,
      en: card.fixedExpression.explanationEn,
    };
  }
  if (card.functionWord) {
    return {
      zh: card.functionWord.explanationZh,
      en: card.functionWord.explanationEn,
    };
  }
  if (card.card_title === "趣味联想") {
    return {
      zh: card.memory_path,
      en: card.memoryPathEn,
    };
  }
  if (card.card_title === "第一生活画面") {
    return {
      zh: card.memory_path,
      en: card.memoryPathEn,
    };
  }
  if (card.card_title === "日常生存卡点") {
    return {
      zh: "只在真会卡住的荷兰生活节点出现。",
      en: "Only use this for a real Dutch-life friction point.",
    };
  }
  return {
    zh: card.memory_path,
    en: card.memoryPathEn,
  };
}

function automatedStepsFor(card: AutomatedMemoryCard, output?: MemoryPath["outputSentence"]) {
  const outputContentZh = outputLine(output, "zh");
  const outputContentEn = outputLine(output, "en");
  const usageStep = outputContentZh
    ? [{ labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn }]
    : [];
  if (card.breakdown) {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      {
        labelZh: "拆开看",
        labelEn: "Break it down",
        contentZh: card.breakdown.parts.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + "),
        contentEn: card.breakdown.parts.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + "),
      },
      ...usageStep,
    ];
  }

  if (card.englishBridge) {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      { labelZh: "英文桥梁", labelEn: "English bridge", contentZh: card.englishBridge.bridge, contentEn: card.englishBridge.bridge },
      ...(card.englishBridge.differenceZh && card.englishBridge.differenceEn
        ? [{
            labelZh: "差异提醒",
            labelEn: "Difference note",
            contentZh: card.englishBridge.differenceZh,
            contentEn: card.englishBridge.differenceEn,
          }]
        : usageStep),
    ];
  }

  if (card.formation) {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      {
        labelZh: "基础词",
        labelEn: "Base word",
        contentZh: `${card.formation.base.dutch} = ${card.formation.base.meaningZh}`,
        contentEn: `${card.formation.base.dutch} = ${card.formation.base.meaningEn}`,
      },
      ...usageStep,
    ];
  }

  if (card.fixedExpression) {
    return [
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      { labelZh: "表达功能", labelEn: "Expression function", contentZh: card.fixedExpression.functionZh, contentEn: card.fixedExpression.functionEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: card.fixedExpression.usageZh, contentEn: card.fixedExpression.usageEn },
    ];
  }

  if (card.functionWord) {
    return [
      { labelZh: "功能规则", labelEn: "Function rule", contentZh: card.functionWord.functionZh, contentEn: card.functionWord.functionEn },
      { labelZh: "判断方式", labelEn: "How to read it", contentZh: card.functionWord.noteZh, contentEn: card.functionWord.noteEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "类别规则") {
    return [
      { labelZh: "类别规则", labelEn: "Category rule", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "功能词") {
    return [
      { labelZh: "功能", labelEn: "Function", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "用法落点") {
    return [
      { labelZh: "搭配提醒", labelEn: "Chunk note", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "自然短语") {
    return [
      { labelZh: "短语提醒", labelEn: "Phrase note", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "趣味联想") {
    return [
      { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...usageStep,
    ];
  }

  if (card.card_title === "第一生活画面") {
    const speakableStep = outputContentZh
      ? [{ labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn }]
      : [];
    return [
      { labelZh: "第一画面", labelEn: "First scene", contentZh: card.memory_path, contentEn: card.memoryPathEn },
      ...speakableStep,
    ];
  }

  return [
    { labelZh: "日常生存卡点", labelEn: "Daily survival trigger", contentZh: card.memory_path, contentEn: card.memoryPathEn },
    ...usageStep,
  ];
}

function buildAutomatedMemoryPath(
  word: WordItem,
  context: MemoryPathContext,
  wordType: MemoryPathWordType,
  card: AutomatedMemoryCard,
): MemoryPath {
  const phraseChunks = cleanPhraseChunks(word, context);
  const output = outputSentenceFor(word, context);
  const explanation = automatedExplanationFor(card);
  return {
    wordId: word.id,
    dutch: word.dutch,
    strategy: card.strategy,
    wordType,
    titleZh: card.card_title,
    titleEn: automatedTitleEn[card.card_title],
    explanationZh: explanation.zh,
    explanationEn: explanation.en,
    breakdown: card.breakdown,
    englishBridge: card.englishBridge,
    memoryHookZh: card.memory_path,
    memoryHookEn: card.memoryPathEn,
    usageAnchorZh: card.memory_path,
    usageAnchorEn: card.memoryPathEn,
    scenarioAnchor: { zh: card.memory_path, en: card.memoryPathEn },
    phraseChunks,
    outputSentences: output ? [output] : [],
    outputSentence: output,
    confidence: card.confidence,
    needsHumanReview: false,
    steps: automatedStepsFor(card, output),
    warnings: [],
  };
}

function interestingHookFor(word: WordItem, path: {
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  formation?: WordFormationSeed;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  phraseChunks: MemoryPath["phraseChunks"];
  output?: MemoryPath["outputSentence"];
}) {
  const key = normalizeWordText(word.dutch);
  const learnerHook = learnerHookFromWord(word);

  const meaningZh = primaryMeaning(word, "zh");
  const meaningEn = primaryMeaning(word, "en");
  const usage = { zh: path.usageZh, en: path.usageEn };
  const sceneZh = trimPeriod(path.usageZh);
  const sceneEn = trimPeriod(path.usageEn);
  const lineZh = lineAnchor(path.phraseChunks, path.output, "zh");
  const lineEn = lineAnchor(path.phraseChunks, path.output, "en");

  if (path.strategy === "word-breakdown" && path.breakdown?.parts.length) {
    return {
      zh: path.breakdown.noteZh,
      en: path.breakdown.noteEn,
    };
  }

  if (path.strategy === "english-bridge" && path.englishBridge?.bridge) {
    return {
      zh: path.englishBridge.noteZh,
      en: path.englishBridge.noteEn,
    };
  }

  if (path.strategy === "word-formation" && path.formation) {
    return {
      zh: path.formation.noteZh,
      en: path.formation.noteEn,
    };
  }

  if (path.strategy === "fixed-expression" && path.fixedExpression) {
    return {
      zh: `${word.dutch} 是礼貌场景里的现成话：${sceneZh} 时直接说。`,
      en: `${word.dutch} is a polite line card in your pocket: when ${sceneEn} appears, pull it out.`,
    };
  }

  if (path.strategy === "meaning-contrast" && path.meaningContrast) {
    const peersZh = path.meaningContrast.peers.map((peer) => peer.dutch).join(" / ");
    return {
      zh: `把 ${word.dutch} 和 ${peersZh} 排成一排，只抓它自己的语气：${path.meaningContrast.comparisonZh}`,
      en: `Line ${word.dutch} up with ${peersZh} and focus on its own shade: ${path.meaningContrast.comparisonEn}`,
    };
  }

  if (path.strategy === "category-rule") {
    if (path.wordType === "number") {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    if (path.wordType === "day-month") {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    if (path.wordType === "adverb" && relativeTimeDetails[key]) {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    if (path.wordType === "country-name") {
      return {
        zh: `地点结构：in ${word.dutch} = 在${primaryMeaning(word, "zh")}；uit ${word.dutch} = 来自${primaryMeaning(word, "zh")}。`,
        en: `Place pattern: in ${word.dutch} = in ${primaryMeaning(word, "en")}; uit ${word.dutch} = from ${primaryMeaning(word, "en")}.`,
      };
    }
    if (path.wordType === "language-name") {
      return {
        zh: `语言结构：${word.dutch} spreken = 说${primaryMeaning(word, "zh")}；${word.dutch} leren = 学${primaryMeaning(word, "zh")}。`,
        en: `Language pattern: ${word.dutch} spreken = speak ${primaryMeaning(word, "en")}; ${word.dutch} leren = learn ${primaryMeaning(word, "en")}.`,
      };
    }
    return {
      zh: path.memoryHookZh,
      en: path.memoryHookEn,
    };
  }

  if (path.strategy === "phrase-based") {
    if (path.wordType === "verb") {
      const phraseHook = phraseHookForWord(word, path.wordType, path.phraseChunks, path.output);
      if (phraseHook) return phraseHook;
      if (learnerHook) return learnerHook;
      return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
    }
    if (path.wordType === "phrase") {
      const actionSelfHook = actionPhraseSelfHookForWord(word);
      if (actionSelfHook) return actionSelfHook;
    }
    if (learnerHook) return learnerHook;
    const phraseHook = phraseHookForWord(word, path.wordType, path.phraseChunks, path.output);
    if (phraseHook) return phraseHook;
    return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
  }

  if (path.strategy === "sentence-based") {
    if (finiteVerbFormInfoFor(word)) {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    if (path.wordType === "verb") {
      if (!hasForbiddenMemoryText(`${path.memoryHookZh} ${path.memoryHookEn}`)) {
        return {
          zh: path.memoryHookZh,
          en: path.memoryHookEn,
        };
      }
      const actionHook = actionObjectHookForWord(word, path.phraseChunks, path.output);
      if (actionHook) return actionHook;
    }
    if (learnerHook) return learnerHook;
    if (path.functionWord) {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    if (path.wordType !== "noun" && usageMemoryPaths[key]) {
      return {
        zh: path.memoryHookZh,
        en: path.memoryHookEn,
      };
    }
    return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
  }

  return scenarioHookForWord(word, path.wordType, path.output, path.phraseChunks, usage);
}

type MemoryStep = NonNullable<MemoryPath["steps"]>[number];

const cleanMemorySteps = (steps: MemoryStep[], maxSteps = 3) => {
  const seen = new Set<string>();
  const seenDutchAnchors = new Set<string>();
  const seenMeanings = new Set<string>();
  return steps
    .map((step) => ({
      ...step,
      contentZh: step.contentZh.trim(),
      contentEn: step.contentEn.trim(),
    }))
    .filter((step) => step.contentZh && step.contentEn)
    .filter((step) => !hasForbiddenMemoryText(`${step.labelZh} ${step.labelEn} ${step.contentZh} ${step.contentEn}`))
    .filter((step) => {
      const key = normalizeWordText(step.contentZh);
      if (seen.has(key)) return false;
      seen.add(key);
      const dutchAnchor = normalizeMemoryStepDutchAnchor(step.contentZh);
      if (dutchAnchor && seenDutchAnchors.has(dutchAnchor)) return false;
      if (dutchAnchor) seenDutchAnchors.add(dutchAnchor);
      const meaningKey = normalizeMemoryStepMeaning(step.contentZh);
      if (meaningKey && seenMeanings.has(meaningKey)) return false;
      if (meaningKey) seenMeanings.add(meaningKey);
      return true;
    })
    .slice(0, maxSteps);
};

function normalizeMemoryStepDutchAnchor(value: string) {
  const raw = value
    .split(/\s*=\s*/)
    .shift()
    ?.trim() ?? "";
  if (!/[a-zà-ÿ]/i.test(raw)) return "";
  return normalizeChunkText(raw);
}

function normalizeMemoryStepMeaning(value: string) {
  const raw = value
    .replace(/[。.!?]+$/g, "")
    .split(/\s*=\s*/)
    .pop()
    ?.trim() ?? "";
  return raw
    .replace(/^我/, "")
    .replace(/^(现在|马上|立刻)/, "")
    .replace(/[，,；;。.!?\s]/g, "");
}

function stepsFor(path: {
  word: WordItem;
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  titleZh: string;
  titleEn: string;
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  formation?: WordFormationSeed;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  phraseChunks: MemoryPath["phraseChunks"];
  output?: MemoryPath["outputSentence"];
  warningZh?: string;
  warningEn?: string;
  allWords?: WordItem[];
}) {
  const outputDutch = normalizeChunkText(path.output?.dutch ?? "");
  const usefulPhrase =
    path.phraseChunks.find((chunk) => {
      const dutch = chunk.dutch.trim();
      return dutch && normalizeChunkText(dutch) !== outputDutch && !/[.!?]$/.test(dutch);
    }) ??
    path.phraseChunks.find((chunk) => {
      const dutch = chunk.dutch.trim();
      return dutch && normalizeChunkText(dutch) !== outputDutch;
    });
  const secondUsefulPhrase = path.phraseChunks.find((chunk) => {
    const dutch = chunk.dutch.trim();
    return (
      chunk !== usefulPhrase &&
      dutch &&
      normalizeChunkText(dutch) !== outputDutch &&
      !/[.!?]$/.test(dutch)
    );
  });
  const phraseContentZh = usefulPhrase?.dutch
    ? `${usefulPhrase.dutch}${usefulPhrase.meaningZh ? ` = ${usefulPhrase.meaningZh}` : ""}`
    : path.memoryHookZh;
  const phraseContentEn = usefulPhrase?.dutch
    ? `${usefulPhrase.dutch}${usefulPhrase.meaningEn ? ` = ${usefulPhrase.meaningEn}` : ""}`
    : path.memoryHookEn;
  const secondPhraseContentZh = secondUsefulPhrase?.dutch
    ? `${secondUsefulPhrase.dutch}${secondUsefulPhrase.meaningZh ? ` = ${secondUsefulPhrase.meaningZh}` : ""}`
    : "";
  const secondPhraseContentEn = secondUsefulPhrase?.dutch
    ? `${secondUsefulPhrase.dutch}${secondUsefulPhrase.meaningEn ? ` = ${secondUsefulPhrase.meaningEn}` : ""}`
    : "";
  const outputIsBareWord = path.output?.dutch
    ? normalizeChunkText(path.output.dutch) === normalizeChunkText(path.word.dutch)
    : false;
  const outputContentZh = path.output?.dutch && !outputIsBareWord
    ? `${path.output.dutch}${path.output.meaningZh ? ` = ${path.output.meaningZh}` : ""}`
    : "";
  const outputContentEn = path.output?.dutch && !outputIsBareWord
    ? `${path.output.dutch}${path.output.meaningEn ? ` = ${path.output.meaningEn}` : ""}`
    : "";
  const phraseComponentStep = phraseLike(path.word.dutch) ? phraseComponentStepForWord(path.word, path.allWords ?? []) : undefined;
  const isConnectorFunction = Boolean(
    path.functionWord &&
      /连接|从句|结果|条件|让步|举例|总结|补充|并列|一方面|另一方面|according|clause|connector|therefore|result|although|while|example|summary|addition|hand/i.test(
        `${path.titleZh} ${path.titleEn} ${path.functionWord.functionZh} ${path.functionWord.functionEn}`,
      ),
  );
  const phraseStepLabel =
    path.wordType === "adverb"
        ? { zh: "时间搭配", en: "Time chunk" }
        : path.wordType === "verb"
          ? { zh: "接法提醒", en: "Verb pattern" }
        : path.wordType === "phrase"
          ? { zh: "短语用法", en: "Phrase use" }
          : { zh: "结构提醒", en: "Structure note" };

  if (path.strategy === "word-breakdown" || path.strategy === "compound-word") {
    return cleanMemorySteps([
      { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      {
        labelZh: "拆开看",
        labelEn: "Break it down",
        contentZh: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningZh}`).join(" + ") ?? "",
        contentEn: path.breakdown?.parts.map((part) => `${part.dutch} = ${part.meaningEn}`).join(" + ") ?? "",
      },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
    ]);
  }

  if (path.strategy === "english-bridge") {
    return cleanMemorySteps([
      { labelZh: "趣味联想", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "英文桥梁", labelEn: "English bridge", contentZh: path.englishBridge?.bridge ?? "", contentEn: path.englishBridge?.bridge ?? "" },
      ...(path.englishBridge?.differenceZh && path.englishBridge?.differenceEn
        ? [{
            labelZh: "差异提醒",
            labelEn: "Difference note",
            contentZh: path.englishBridge.differenceZh,
            contentEn: path.englishBridge.differenceEn,
          }]
        : [{ labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn }]),
    ]);
  }

  if (path.strategy === "word-formation") {
    const formation = path.formation;
    const isDiminutive = Boolean(formation?.formed.dutch.endsWith("je"));
    const isIngNoun = Boolean(formation?.formed.dutch.endsWith("ing"));
    const isHeidNoun = Boolean(formation?.formed.dutch.endsWith("heid"));
    const isBaarAdjective = Boolean(formation?.formed.dutch.endsWith("baar"));
    return cleanMemorySteps([
      { labelZh: "基础词", labelEn: "Base word", contentZh: formation ? `${formation.base.dutch} = ${formation.base.meaningZh}` : "", contentEn: formation ? `${formation.base.dutch} = ${formation.base.meaningEn}` : "" },
      isDiminutive
        ? {
            labelZh: "小称提醒",
            labelEn: "Diminutive note",
            contentZh: formation ? `${formation.formed.dutch} 是 -je 小称词；小称词通常配 het：het ${formation.formed.dutch}` : "",
            contentEn: formation ? `${formation.formed.dutch} is a -je diminutive; diminutives usually take het: het ${formation.formed.dutch}` : "",
          }
        : isIngNoun
          ? {
              labelZh: "名词化规律",
              labelEn: "Nominalization pattern",
              contentZh: formation ? `很多动词/动词词干接 -ing，会变成表示动作、结果或记录的名词：${formation.base.dutch} -> ${formation.formed.dutch}` : "",
              contentEn: formation ? `Many Dutch verbs or verb stems take -ing to form a noun for the action, result, or record: ${formation.base.dutch} -> ${formation.formed.dutch}` : "",
            }
        : isHeidNoun
          ? {
              labelZh: "-heid 规律",
              labelEn: "-heid pattern",
              contentZh: formation ? `-heid 像英文 -ness/-ity/-ability：把形容词变成性质/状态名词：${formation.base.dutch} -> ${formation.formed.dutch}` : "",
              contentEn: formation ? `-heid works like English -ness/-ity/-ability: it turns an adjective into a noun for a quality or state: ${formation.base.dutch} -> ${formation.formed.dutch}` : "",
            }
        : isBaarAdjective
          ? {
              labelZh: "-baar 规律",
              labelEn: "-baar pattern",
              contentZh: formation ? `-baar 像英文 -able/-ible：把动作或基础词变成“可……的/能……的”：${formation.base.dutch} -> ${formation.formed.dutch}` : "",
              contentEn: formation ? `-baar works like English -able/-ible: it turns a base word into “can be ... / able to be ...”: ${formation.base.dutch} -> ${formation.formed.dutch}` : "",
            }
        : { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
    ]);
  }

  if (path.strategy === "fixed-expression") {
    return cleanMemorySteps([
      { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      ...(phraseComponentStep ? [phraseComponentStep] : []),
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      { labelZh: "表达功能", labelEn: "Expression function", contentZh: path.fixedExpression?.functionZh ?? path.memoryHookZh, contentEn: path.fixedExpression?.functionEn ?? path.memoryHookEn },
    ]);
  }

  if (path.strategy === "meaning-contrast") {
    return cleanMemorySteps([
      { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "词义对比", labelEn: "Meaning contrast", contentZh: path.meaningContrast?.comparisonZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.comparisonEn ?? path.memoryHookEn },
      { labelZh: "差异提醒", labelEn: "Difference note", contentZh: path.meaningContrast?.noteZh ?? path.memoryHookZh, contentEn: path.meaningContrast?.noteEn ?? path.memoryHookEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
    ]);
  }

  if (path.strategy === "sentence-based") {
    if (path.functionWord) {
      const functionLabel = isConnectorFunction
        ? { zh: "连接规则", en: "Connector rule" }
        : { zh: "功能规则", en: "Function rule" };
      return cleanMemorySteps([
        { labelZh: functionLabel.zh, labelEn: functionLabel.en, contentZh: path.functionWord.functionZh, contentEn: path.functionWord.functionEn },
        ...(phraseComponentStep ? [phraseComponentStep] : []),
        {
          labelZh: "判断方式",
          labelEn: "How to read it",
          contentZh: path.functionWord.noteZh,
          contentEn: path.functionWord.noteEn,
        },
        { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      ]);
    }
    if (path.wordType === "noun") {
      return cleanMemorySteps([
        { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      ]);
    }
    const sentenceHookLabel =
      path.wordType === "verb"
          ? /变位|形式|form/i.test(`${path.memoryHookZh} ${path.memoryHookEn}`)
            ? { zh: "变位钩子", en: "Verb-form hook" }
            : { zh: "动作钩子", en: "Action hook" }
          : { zh: "记忆钩子", en: "Memory hook" };
    if (path.wordType === "verb") {
      return cleanMemorySteps([
        { labelZh: sentenceHookLabel.zh, labelEn: sentenceHookLabel.en, contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        ...(usefulPhrase?.dutch ? [{ labelZh: phraseStepLabel.zh, labelEn: phraseStepLabel.en, contentZh: phraseContentZh, contentEn: phraseContentEn }] : []),
        ...(secondUsefulPhrase?.dutch
          ? [{ labelZh: "常用搭配", labelEn: "Common chunk", contentZh: secondPhraseContentZh, contentEn: secondPhraseContentEn }]
          : !usefulPhrase?.dutch
            ? [{ labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn }]
            : []),
      ]);
    }
    return cleanMemorySteps([
      { labelZh: sentenceHookLabel.zh, labelEn: sentenceHookLabel.en, contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      ...(usefulPhrase?.dutch ? [{ labelZh: phraseStepLabel.zh, labelEn: phraseStepLabel.en, contentZh: phraseContentZh, contentEn: phraseContentEn }] : []),
    ]);
  }

  if (path.strategy === "phrase-based") {
    if (normalizeChunkText(path.memoryHookZh).includes("a bit = een beetje")) {
      return cleanMemorySteps([
        { labelZh: "英文桥梁", labelEn: "English bridge", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      ]);
    }
    return cleanMemorySteps([
      ...(usefulPhrase?.dutch
        ? [{ labelZh: phraseStepLabel.zh, labelEn: phraseStepLabel.en, contentZh: phraseContentZh, contentEn: phraseContentEn }]
        : [{ labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn }]),
      ...(phraseComponentStep ? [phraseComponentStep] : []),
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
    ]);
  }

  if (path.strategy === "category-rule") {
    if (path.titleZh === "第一动作画面") {
      return cleanMemorySteps([
        { labelZh: "第一画面", labelEn: "First image", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        { labelZh: "动作联想", labelEn: "Action hook", contentZh: path.usageZh, contentEn: path.usageEn },
        ...(path.warningZh || path.warningEn
          ? [{ labelZh: "冠词/复数", labelEn: "Article / plural", contentZh: path.warningZh ?? "", contentEn: path.warningEn ?? "" }]
          : []),
      ]);
    }
    if (path.wordType === "number") {
      return cleanMemorySteps([
        { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
        { labelZh: "构词规律", labelEn: "Number pattern", contentZh: path.usageZh, contentEn: path.usageEn },
        { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
        ...(path.warningZh || path.warningEn
          ? [{ labelZh: "变形提醒", labelEn: "Change note", contentZh: path.warningZh ?? "", contentEn: path.warningEn ?? "" }]
          : []),
      ]);
    }

    const ruleLabel =
      path.wordType === "day-month"
        ? { zh: "时间用法", en: "Time use" }
        : path.wordType === "adjective"
            ? { zh: "描述用法", en: "Description use" }
            : { zh: "用法规则", en: "Usage rule" };
    return cleanMemorySteps([
      { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: ruleLabel.zh, labelEn: ruleLabel.en, contentZh: path.usageZh, contentEn: path.usageEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
      ...(path.warningZh || path.warningEn
        ? [{ labelZh: "别混淆", labelEn: "Do not mix up", contentZh: path.warningZh ?? "", contentEn: path.warningEn ?? "" }]
        : []),
    ]);
  }

  if (path.strategy === "no-strong-association") {
    return cleanMemorySteps([
      { labelZh: "第一画面", labelEn: "First scene", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
      { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
    ]);
  }

  return cleanMemorySteps([
    { labelZh: "记忆钩子", labelEn: "Memory hook", contentZh: path.memoryHookZh, contentEn: path.memoryHookEn },
    ...(usefulPhrase?.dutch ? [{ labelZh: phraseStepLabel.zh, labelEn: phraseStepLabel.en, contentZh: phraseContentZh, contentEn: phraseContentEn }] : []),
    { labelZh: "能说的一句", labelEn: "Usable line", contentZh: outputContentZh, contentEn: outputContentEn },
  ]);
}

function buildPath(word: WordItem, context: MemoryPathContext, data: {
  strategy: MemoryPathStrategy;
  wordType: MemoryPathWordType;
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  memoryHookZh: string;
  memoryHookEn: string;
  usageZh: string;
  usageEn: string;
  confidence: "high" | "medium" | "low";
  breakdown?: MemoryPath["breakdown"];
  englishBridge?: MemoryPath["englishBridge"];
  fixedExpression?: FixedExpressionSeed;
  formation?: WordFormationSeed;
  meaningContrast?: MeaningContrast;
  functionWord?: FunctionWordSeed;
  warningZh?: string;
  warningEn?: string;
}) {
  const phraseChunks = cleanPhraseChunks(word, context);
  const output = outputSentenceFor(word, context);
  const interestingHook = interestingHookFor(word, {
    strategy: data.strategy,
    wordType: data.wordType,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    fixedExpression: data.fixedExpression,
    formation: data.formation,
    meaningContrast: data.meaningContrast,
    functionWord: data.functionWord,
    memoryHookZh: data.memoryHookZh,
    memoryHookEn: data.memoryHookEn,
    usageZh: data.usageZh,
    usageEn: data.usageEn,
    phraseChunks,
    output,
  });
  const safeHook = hasForbiddenMemoryText(`${interestingHook.zh} ${interestingHook.en}`)
    ? practicalImageHookForWord(word, data.wordType, output, phraseChunks, { zh: data.usageZh, en: data.usageEn })
    : interestingHook;
  const basePath: MemoryPath = {
    wordId: word.id,
    dutch: word.dutch,
    strategy: data.strategy,
    wordType: data.wordType,
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    explanationZh: data.explanationZh,
    explanationEn: data.explanationEn,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    formation: data.formation,
    memoryHookZh: safeHook.zh,
    memoryHookEn: safeHook.en,
    usageAnchorZh: data.usageZh,
    usageAnchorEn: data.usageEn,
    scenarioAnchor: { zh: data.usageZh, en: data.usageEn },
    phraseChunks,
    outputSentences: output ? [output] : [],
    outputSentence: output,
    warningZh: data.warningZh,
    warningEn: data.warningEn,
    confidence: data.confidence,
    needsHumanReview: false,
  };

  const steps = stepsFor({
    word,
    strategy: data.strategy,
    wordType: data.wordType,
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    breakdown: data.breakdown,
    englishBridge: data.englishBridge,
    fixedExpression: data.fixedExpression,
    formation: data.formation,
    meaningContrast: data.meaningContrast,
    functionWord: data.functionWord,
    memoryHookZh: safeHook.zh,
    memoryHookEn: safeHook.en,
    usageZh: data.usageZh,
    usageEn: data.usageEn,
    phraseChunks,
    output,
    warningZh: data.warningZh,
    warningEn: data.warningEn,
    allWords: context.allWords,
  });
  const checked = checkMemoryPathQuality({ ...basePath, steps }, word);

  return {
    ...basePath,
    steps,
    confidence: checked.confidence,
    needsHumanReview: checked.needsHumanReview,
    qualityIssues: checked.issues,
    warnings: checked.warnings,
  };
}

export function generateMemoryPath(word: WordItem, context: MemoryPathContext = {}): MemoryPath {
  const allWords = context.allWords ?? [word];
  const wordType = classifyMemoryPathWord(word);
  const key = normalizeWordText(word.dutch);
  const usage = usageAnchorFor(word);

  const verbUsage = wordType === "verb" ? verbUsageFor(word) : undefined;
  const infinitivePath = verbUsage ? pathViaVerbInfinitive(word, context, verbUsage) : undefined;
  if (infinitivePath) return infinitivePath;

  const seededBridge = englishBridgeSeeds[key] ? englishBridgeFor(word) : undefined;
  const earlyBridge = seededBridge ?? englishBridgeFor(word);

  const multiUse = multiUseMemoryDetailsFor(word);
  if (multiUse) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: multiUse.titleZh,
      titleEn: multiUse.titleEn,
      explanationZh: multiUse.explanationZh,
      explanationEn: multiUse.explanationEn,
      memoryHookZh: multiUse.hookZh,
      memoryHookEn: multiUse.hookEn,
      usageZh: multiUse.usageZh,
      usageEn: multiUse.usageEn,
      warningZh: multiUse.warningZh,
      warningEn: multiUse.warningEn,
      confidence: "high",
    });
  }

  const timeDetails = timeMemoryDetailsFor(word, wordType);
  if (timeDetails) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: timeDetails.titleZh,
      titleEn: timeDetails.titleEn,
      explanationZh: timeDetails.explanationZh,
      explanationEn: timeDetails.explanationEn,
      memoryHookZh: timeDetails.hookZh,
      memoryHookEn: timeDetails.hookEn,
      usageZh: timeDetails.usageZh,
      usageEn: timeDetails.usageEn,
      warningZh: timeDetails.warningZh,
      warningEn: timeDetails.warningEn,
      confidence: "high",
    });
  }

  const healthState = healthStateAdjectiveDetailsFor(word, wordType);
  if (healthState) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: healthState.titleZh,
      titleEn: healthState.titleEn,
      explanationZh: healthState.explanationZh,
      explanationEn: healthState.explanationEn,
      memoryHookZh: healthState.hookZh,
      memoryHookEn: healthState.hookEn,
      usageZh: healthState.usageZh,
      usageEn: healthState.usageEn,
      warningZh: healthState.warningZh,
      warningEn: healthState.warningEn,
      confidence: "high",
    });
  }

  const finiteVerb = finiteVerbFormInfoFor(word);
  if (finiteVerb) {
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: `${finiteVerb.infinitive} 变位`,
      titleEn: "Verb Form",
      explanationZh: finiteVerb.explanationZh,
      explanationEn: finiteVerb.explanationEn,
      memoryHookZh: finiteVerb.hookZh,
      memoryHookEn: finiteVerb.hookEn,
      usageZh: finiteVerb.usageZh,
      usageEn: finiteVerb.usageEn,
      warningZh: finiteVerb.warningZh,
      warningEn: finiteVerb.warningEn,
      confidence: "high",
    });
  }

  const category = categoryDetailsFor(word, wordType);
  if (category && (wordType === "language-name" || wordType === "country-name" || wordType === "number" || wordType === "day-month" || (key === "kom" && wordType === "noun"))) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: category.titleZh,
      titleEn: category.titleEn,
      explanationZh: category.explanationZh,
      explanationEn: category.explanationEn,
      memoryHookZh: category.hookZh,
      memoryHookEn: category.hookEn,
      usageZh: category.usageZh,
      usageEn: category.usageEn,
      warningZh: category.warningZh,
      warningEn: category.warningEn,
      confidence: "high",
    });
  }

  const explicitBreakdown = compoundBreakdowns[key] ?? dynamicBreakdownFor(word, allWords, "lexicon-only");
  if (explicitBreakdown) {
    const usageFromBreakdown = usageAnchorFor(word, { zh: explicitBreakdown.usageZh, en: explicitBreakdown.usageEn });
    return buildPath(word, context, {
      strategy: "word-breakdown",
      wordType,
      titleZh: "拆词联想",
      titleEn: "Word Breakdown",
      explanationZh: "这个词可以自然拆开看，拆完之后意思更容易记。",
      explanationEn: "This word can be meaningfully split, which makes it easier to remember.",
      breakdown: explicitBreakdown,
      memoryHookZh: explicitBreakdown.noteZh,
      memoryHookEn: explicitBreakdown.noteEn,
      usageZh: usageFromBreakdown.zh,
      usageEn: usageFromBreakdown.en,
      confidence: "high",
    });
  }

  const formation = wordFormationSeeds[key] ?? inferredHeidFormationFor(word, allWords) ?? inferredBaarFormationFor(word, allWords) ?? inferredIngFormationFor(word, allWords);
  if (formation) {
    return buildPath(word, context, {
      strategy: "word-formation",
      wordType,
      titleZh: "词形联想",
      titleEn: "Word Formation",
      explanationZh: formation.noteZh,
      explanationEn: formation.noteEn,
      formation,
      memoryHookZh: formation.noteZh,
      memoryHookEn: formation.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: "high",
      warningZh: key === "hulp" ? "Kunt u mij helpen? 用的是动词 helpen，不是名词 hulp。" : undefined,
      warningEn: key === "hulp" ? "Kunt u mij helpen? uses the verb helpen, not the noun hulp." : undefined,
    });
  }

  const breakdown = dynamicBreakdownFor(word, allWords, "safe-only");
  if (breakdown) {
    const usageFromBreakdown = usageAnchorFor(word, { zh: breakdown.usageZh, en: breakdown.usageEn });
    return buildPath(word, context, {
      strategy: "word-breakdown",
      wordType,
      titleZh: "拆词联想",
      titleEn: "Word Breakdown",
      explanationZh: "这个词可以自然拆开看，拆完之后意思更容易记。",
      explanationEn: "This word can be meaningfully split, which makes it easier to remember.",
      breakdown,
      memoryHookZh: breakdown.noteZh,
      memoryHookEn: breakdown.noteEn,
      usageZh: usageFromBreakdown.zh,
      usageEn: usageFromBreakdown.en,
      confidence: "high",
    });
  }

  const earlyFunctionWord = strictFixedExpressionPhrases.has(key) ? undefined : functionWordSeeds[key];
  if (earlyFunctionWord) {
    const hook = shortFunctionHook(key, earlyFunctionWord);
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType: "function-word",
      titleZh: earlyFunctionWord.titleZh,
      titleEn: earlyFunctionWord.titleEn,
      explanationZh: earlyFunctionWord.explanationZh,
      explanationEn: earlyFunctionWord.explanationEn,
      functionWord: earlyFunctionWord,
      memoryHookZh: hook.zh,
      memoryHookEn: hook.en,
      usageZh: earlyFunctionWord.usageZh,
      usageEn: earlyFunctionWord.usageEn,
      confidence: "high",
    });
  }

  const earlyFunctionHook = strictFixedExpressionPhrases.has(key) ? undefined : functionWordMemoryPaths[key];
  if (earlyFunctionHook) {
    const hook = shortFunctionHook(key, earlyFunctionHook);
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType: "function-word",
      titleZh: earlyFunctionHook.titleZh,
      titleEn: earlyFunctionHook.titleEn,
      explanationZh: earlyFunctionHook.explanationZh,
      explanationEn: earlyFunctionHook.explanationEn,
      functionWord: earlyFunctionHook,
      memoryHookZh: hook.zh,
      memoryHookEn: hook.en,
      usageZh: earlyFunctionHook.usageZh,
      usageEn: earlyFunctionHook.usageEn,
      confidence: "high",
    });
  }

  if (earlyBridge && !phraseLike(word.dutch)) {
    return buildPath(word, context, {
      strategy: "english-bridge",
      wordType,
      titleZh: "英文桥梁",
      titleEn: "English Bridge",
      explanationZh: "英文只当入口；真正要抓住荷兰语的形变、冠词和用法差异。",
      explanationEn: "English is only the entry point; keep the Dutch shape, article, and usage difference.",
      englishBridge: earlyBridge,
      memoryHookZh: earlyBridge.noteZh,
      memoryHookEn: earlyBridge.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: seededBridge ? "high" : "medium",
    });
  }

  const bodyPart = bodyPartMemoryDetailsFor(word, wordType);
  if (bodyPart) {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: bodyPart.titleZh,
      titleEn: bodyPart.titleEn,
      explanationZh: bodyPart.explanationZh,
      explanationEn: bodyPart.explanationEn,
      memoryHookZh: bodyPart.hookZh,
      memoryHookEn: bodyPart.hookEn,
      usageZh: bodyPart.usageZh,
      usageEn: bodyPart.usageEn,
      warningZh: bodyPart.warningZh,
      warningEn: bodyPart.warningEn,
      confidence: "high",
    });
  }

  const contrast = meaningContrastFor(word, allWords);
  const shouldUseMeaningContrast =
    wordType === "adjective" ||
    Boolean(meaningContrastNotes[key]);
  if (contrast && shouldUseMeaningContrast) {
    return buildPath(word, context, {
      strategy: "meaning-contrast",
      wordType,
      titleZh: "词义对比",
      titleEn: "Meaning Contrast",
      explanationZh: "近义词并排看，重点是语气和使用范围。",
      explanationEn: "This word is best learned by comparing nearby dictionary meanings, without forcing a sentence into the memory path.",
      meaningContrast: contrast,
      memoryHookZh: contrast.noteZh,
      memoryHookEn: contrast.noteEn,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: "high",
    });
  }

  if (category && wordType === "adjective") {
    return buildPath(word, context, {
      strategy: "category-rule",
      wordType,
      titleZh: category.titleZh,
      titleEn: category.titleEn,
      explanationZh: category.explanationZh,
      explanationEn: category.explanationEn,
      memoryHookZh: category.hookZh,
      memoryHookEn: category.hookEn,
      usageZh: category.usageZh,
      usageEn: category.usageEn,
      warningZh: category.warningZh,
      warningEn: category.warningEn,
      confidence: "high",
    });
  }

  const functionWord = strictFixedExpressionPhrases.has(key) ? undefined : functionWordSeeds[key];
  if (functionWord) {
    const hook = shortFunctionHook(key, functionWord);
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: functionWord.titleZh,
      titleEn: functionWord.titleEn,
      explanationZh: functionWord.explanationZh,
      explanationEn: functionWord.explanationEn,
      functionWord,
      memoryHookZh: hook.zh,
      memoryHookEn: hook.en,
      usageZh: functionWord.usageZh,
      usageEn: functionWord.usageEn,
      confidence: "high",
    });
  }

  const functionHook = strictFixedExpressionPhrases.has(key) ? undefined : functionWordMemoryPaths[key];
  if (functionHook) {
    const hook = shortFunctionHook(key, functionHook);
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType: "function-word",
      titleZh: functionHook.titleZh,
      titleEn: functionHook.titleEn,
      explanationZh: functionHook.explanationZh,
      explanationEn: functionHook.explanationEn,
      functionWord: functionHook,
      memoryHookZh: hook.zh,
      memoryHookEn: hook.en,
      usageZh: functionHook.usageZh,
      usageEn: functionHook.usageEn,
      confidence: "high",
    });
  }

  const fixedExpression = fixedExpressionSeeds[key];
  if (fixedExpression) {
    return buildPath(word, context, {
      strategy: "fixed-expression",
      wordType,
      titleZh: fixedExpression.titleZh,
      titleEn: fixedExpression.titleEn,
      explanationZh: fixedExpression.explanationZh,
      explanationEn: fixedExpression.explanationEn,
      fixedExpression,
      memoryHookZh: fixedExpression.functionZh,
      memoryHookEn: fixedExpression.functionEn,
      usageZh: fixedExpression.usageZh,
      usageEn: fixedExpression.usageEn,
      warningZh: fixedExpression.warningZh,
      warningEn: fixedExpression.warningEn,
      confidence: "high",
    });
  }

  const usageHook = wordType === "noun" ? undefined : usageMemoryPaths[key];
  if (usageHook) {
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: "搭配提醒",
      titleEn: "Chunk Note",
      explanationZh: usageHook.explanationZh,
      explanationEn: usageHook.explanationEn,
      memoryHookZh: usageHook.zh,
      memoryHookEn: usageHook.en,
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: "high",
    });
  }

  const creative = creativeMemoryPathFor(word);
  if (creative) {
    return buildAutomatedMemoryPath(word, context, wordType, {
      card_title: "趣味联想",
      memory_path: compactMemoryPath(creative.zh),
      memoryPathEn: creative.en,
      strategy: "no-strong-association",
      confidence: "high",
    });
  }

  const survival = survivalMemoryPathFor(word, wordType);
  if (survival) {
    return buildAutomatedMemoryPath(word, context, wordType, {
      card_title: "日常生存卡点",
      memory_path: compactMemoryPath(survival.zh),
      memoryPathEn: survival.en,
      strategy: "no-strong-association",
      confidence: "high",
    });
  }

	  const phraseChunksForDecision = cleanPhraseChunks(word, context);
	  const seededPhrase = Boolean(memoryPhraseSeeds[key]?.length);
	  const shouldUsePhrasePath =
	    wordType === "phrase" ||
	    phraseBasedWords.has(key) ||
	    greetingPhraseWords.has(key) ||
	    strictFixedExpressionPhrases.has(key);
	  if (shouldUsePhrasePath) {
	    const firstPhrase = phraseChunksForDecision[0];
	    const secondPhrase = phraseChunksForDecision[1];
	    const phraseKind = phrasePathKindFor(word, key, wordType);
	    const phraseTitle = phrasePathTitles[phraseKind];
	    const phrasePathOverride = normalizeChunkText(word.dutch) === "een beetje"
	      ? {
	          titleZh: "程度短语",
	          titleEn: "Degree Phrase",
	          explanationZh: "a bit / a little 这条英文桥梁直接接到 een beetje；它用来把能力、数量或程度放轻。",
	          explanationEn: "Use the English bridge a bit / a little for een beetje; it softens ability, quantity, or degree.",
	          memoryHookZh: "a bit = een beetje；表示一点点",
	          memoryHookEn: "a bit = een beetje; it means a little",
	        }
	      : undefined;
	    const phraseExplanationZh = firstPhrase
	      ? `${firstPhrase.dutch}${firstPhrase.meaningZh ? ` = ${firstPhrase.meaningZh}` : ""}${secondPhrase?.dutch ? `；${secondPhrase.dutch}${secondPhrase.meaningZh ? ` = ${secondPhrase.meaningZh}` : ""}` : ""}`
	      : "";
	    const phraseExplanationEn = firstPhrase
	      ? `${firstPhrase.dutch}${firstPhrase.meaningEn ? ` = ${firstPhrase.meaningEn}` : ""}${secondPhrase?.dutch ? `; ${secondPhrase.dutch}${secondPhrase.meaningEn ? ` = ${secondPhrase.meaningEn}` : ""}` : ""}`
	      : "";
	    return buildPath(word, context, {
	      strategy: "phrase-based",
	      wordType,
	      titleZh: phrasePathOverride?.titleZh ?? (wordType === "phrase" ? phraseTitle.zh : "短语落点"),
	      titleEn: phrasePathOverride?.titleEn ?? (wordType === "phrase" ? phraseTitle.en : "Phrase Anchor"),
	      explanationZh: phrasePathOverride?.explanationZh ?? (firstPhrase
	        ? phraseExplanationZh
	        : word.article ? `${word.dutch} = ${primaryMeaning(word, "zh")}` : phraseTitle.fallbackZh),
	      explanationEn: phrasePathOverride?.explanationEn ?? (firstPhrase
	        ? phraseExplanationEn
	        : word.article ? `${word.dutch} = ${primaryMeaning(word, "en")}` : phraseTitle.fallbackEn),
	      memoryHookZh: phrasePathOverride?.memoryHookZh ?? (firstPhrase
	        ? `${firstPhrase.dutch}${firstPhrase.meaningZh ? ` = ${firstPhrase.meaningZh}` : ""}`
	        : word.article ? `${word.dutch} = ${primaryMeaning(word, "zh")}` : `${word.dutch} 作为${phraseTitle.zh}来听读。`),
	      memoryHookEn: phrasePathOverride?.memoryHookEn ?? (firstPhrase
	        ? `${firstPhrase.dutch}${firstPhrase.meaningEn ? ` = ${firstPhrase.meaningEn}` : ""}`
	        : word.article ? `${word.dutch} = ${primaryMeaning(word, "en")}` : `Learn ${word.dutch} as a ${phraseTitle.en.toLowerCase()} first.`),
	      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: seededPhrase || phraseBasedWords.has(key) || greetingPhraseWords.has(key) ? "high" : "medium",
    });
  }

  if (wordType === "function-word" || wordType === "adverb" || wordType === "verb" || functionWords.has(key)) {
    const meaningZh = primaryMeaning(word, "zh");
    const meaningEn = primaryMeaning(word, "en");
    const actionExplanation = actionUsageExplanationForWord(word, context, wordType, meaningZh, meaningEn);
    const functionOutput = outputSentenceFor(word, context);
    const functionLineZh = outputLine(functionOutput, "zh");
    const functionLineEn = outputLine(functionOutput, "en");
    const title =
      wordType === "verb"
        ? { zh: "动词结构", en: "Verb Pattern" }
        : wordType === "adverb"
          ? { zh: "句中功能", en: "Sentence Function" }
          : { zh: "功能规则", en: "Function Rule" };
    const verbHookZh = actionExplanation?.zh ?? `${word.dutch} 是“${meaningZh}”这个动作；重点看它接人、接物还是接介词。`;
    const verbHookEn = actionExplanation?.en ?? `${word.dutch} is the action "${meaningEn}"; notice whether it takes a person, object, or preposition.`;
    return buildPath(word, context, {
      strategy: "sentence-based",
      wordType,
      titleZh: title.zh,
      titleEn: title.en,
      explanationZh: wordType === "verb"
        ? actionExplanation?.zh ?? `${word.dutch} 用具体动作画面起步，再看它常接什么。`
        : functionLineZh
          ? `句中作用：${functionLineZh}`
          : `${word.dutch} 在句中表示“${meaningZh}”。`,
      explanationEn: wordType === "verb"
        ? actionExplanation?.en ?? `For ${word.dutch}, build the action scene and notice what usually follows.`
        : functionLineEn
          ? `Sentence function: ${functionLineEn}`
          : `${word.dutch} carries the sentence meaning "${meaningEn}".`,
      memoryHookZh: wordType === "verb" ? verbHookZh : (functionLineZh || `${word.dutch}=${meaningZh}`),
      memoryHookEn: wordType === "verb" ? verbHookEn : (functionLineEn || `${word.dutch} = ${meaningEn}`),
      usageZh: usage.zh,
      usageEn: usage.en,
      confidence: fixedOutputSentences[key] ? "high" : "medium",
    });
  }

  const lifeScene = firstLifeSceneMemoryPathFor(word, wordType);
  if (lifeScene) {
    return buildAutomatedMemoryPath(word, context, wordType, {
      card_title: "第一生活画面",
      memory_path: lifeScene.zh,
      memoryPathEn: lifeScene.en,
      strategy: "no-strong-association",
      confidence: exactLifeSceneHooks[key] || curatedA1LifeSceneHooks[key] ? "high" : "medium",
      explanationZh: lifeScene.zh,
      explanationEn: lifeScene.en,
    });
  }

  const fallbackOutput = outputSentenceFor(word, context);
  const nounFallbackHook = wordType === "noun"
    ? nounUsageHookForWord(word, fallbackOutput, [])
    : undefined;
  const fallbackHookZh = nounFallbackHook?.zh ?? (outputLine(fallbackOutput, "zh") || `${word.dutch} = ${primaryMeaning(word, "zh")}`);
  const fallbackHookEn = nounFallbackHook?.en ?? (outputLine(fallbackOutput, "en") || `${word.dutch} = ${primaryMeaning(word, "en")}`);
  const fallbackTitle =
    wordType === "noun"
      ? { zh: "第一生活画面", en: "First Life Scene" }
      : wordType === "adjective"
        ? { zh: "描述规则", en: "Description Rule" }
        : { zh: "功能规则", en: "Function Rule" };

  return buildPath(word, context, {
    strategy: wordType === "noun" ? "no-strong-association" : "sentence-based",
    wordType,
    titleZh: fallbackTitle.zh,
    titleEn: fallbackTitle.en,
    explanationZh: fallbackHookZh,
    explanationEn: fallbackHookEn,
    memoryHookZh: fallbackHookZh,
    memoryHookEn: fallbackHookEn,
	    usageZh: usage.zh,
	    usageEn: usage.en,
	    confidence: "medium",
  });
}
