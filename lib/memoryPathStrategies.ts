import { relationLexicons } from "@/data/relationLexicons";
import { inferWordType } from "@/lib/exampleTemplates";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import { normalizeWordText } from "@/lib/wordAnalysis";
import type { LocalizedText } from "@/types/course";
import type { MemoryPathWordType, WordItem } from "@/types/vocabulary";

export type MemoryPathPart = {
  dutch: string;
  meaningZh: string;
  meaningEn: string;
};

export type SeededBreakdown = {
  parts: MemoryPathPart[];
  noteZh: string;
  noteEn: string;
  usageZh?: string;
  usageEn?: string;
};

export type EnglishBridgeSeed = {
  bridge: string;
  noteZh: string;
  noteEn: string;
};

export type WordFormationSeed = {
  base: MemoryPathPart;
  formed: MemoryPathPart;
  noteZh: string;
  noteEn: string;
};

export type FixedExpressionSeed = {
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  functionZh: string;
  functionEn: string;
  noteZh: string;
  noteEn: string;
  usageZh: string;
  usageEn: string;
  warningZh?: string;
  warningEn?: string;
};

export type FunctionWordSeed = {
  titleZh: string;
  titleEn: string;
  explanationZh: string;
  explanationEn: string;
  functionZh: string;
  functionEn: string;
  noteZh: string;
  noteEn: string;
  usageZh: string;
  usageEn: string;
};

export type MemoryPhraseSeed = {
  dutch: string;
  meaningZh: string;
  meaningEn: string;
};

export type FunMemorySeed = {
  hookZh: string;
  hookEn: string;
};

export const languageNames = new Set(["engels", "nederlands", "chinees", "duits", "frans", "spaans", "arabisch", "pools", "turks"]);
export const countryNames = new Set([
  "china",
  "nederland",
  "duitsland",
  "belgië",
  "belgie",
  "frankrijk",
  "spanje",
  "italië",
  "italie",
  "polen",
  "turkije",
  "marokko",
  "syrië",
  "syrie",
  "oekraïne",
  "oekraine",
]);
export const greetingPhraseWords = new Set(["hallo", "dag", "goedemorgen", "goedemiddag", "goedenavond", "tot ziens", "dank je", "dank u", "bedankt", "alsjeblieft", "alstublieft", "sorry", "ja", "nee", "oké", "oke"]);
export const numberWords = new Set([
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
]);
export const dayMonthWords = new Set(["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag", "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december", "dag", "week", "maand", "jaar"]);
export const functionWords = new Set(["ik", "jij", "je", "u", "hij", "zij", "ze", "wij", "we", "jullie", "maar", "ook", "nog", "al", "want", "omdat", "niet", "geen", "wel", "en", "of", "de", "het", "een", "dit", "dat", "om", "in", "op", "naar", "bij", "met", "voor", "waar", "wanneer", "wie", "wat", "hoe", "welk", "welke"]);
export const adverbWords = new Set(["hier", "daar", "vandaag", "morgen", "gisteren", "later", "samen", "alleen", "graag", "straks", "meteen", "altijd", "vaak", "soms", "nooit"]);
export const adjectiveWords = new Set(["goed", "prima", "fijn", "slecht", "beter", "koud", "warm", "duur", "goedkoop", "leuk", "lekker", "mooi", "groot", "klein", "makkelijk", "moeilijk", "ziek", "verkouden", "duizelig", "misselijk", "moe", "benauwd", "rood", "blauw", "groen", "geel", "zwart", "wit"]);
export const phraseBasedWords = new Set(["afspraak", "hulp", "rekening", "formulier", "klacht", "vertraging", "boodschappen"]);

export const fixedExpressionSeeds: Record<string, FixedExpressionSeed> = {
  hallo: {
    titleZh: "问候固定表达",
    titleEn: "Greeting Expression",
    explanationZh: "hallo 是见面或电话开头的“你好”，整块记，不需要找搭配。",
    explanationEn: "hallo is a greeting for meeting someone or starting a call. Learn it as a whole expression.",
    functionZh: "见面、进店、接电话时用 hallo 打开对话。",
    functionEn: "Use hallo to open a conversation when meeting someone, entering a shop, or answering a call.",
    noteZh: "它像 English hello，但发音按荷兰语；记功能，不硬编搭配。",
    noteEn: "It looks like English hello, but pronounce it in Dutch; remember the function, not a forced collocation.",
    usageZh: "打招呼、电话开头、进入店铺。",
    usageEn: "greeting people, starting calls, entering shops.",
  },
  dag: {
    titleZh: "问候/告别固定表达",
    titleEn: "Greeting/Goodbye Expression",
    explanationZh: "dag 可以是“你好/再见”，在 A0 先当礼貌短句整块记。",
    explanationEn: "dag can mean hello or bye. At A0, learn it as a short polite expression.",
    functionZh: "见面或离开时都能用 dag。",
    functionEn: "Use dag when greeting someone or leaving.",
    noteZh: "dag 也有“天”的意思；在这里先记它作为问候/告别。",
    noteEn: "dag also means day; here remember its greeting/goodbye use first.",
    usageZh: "问候、告别、简短日常对话。",
    usageEn: "greetings, goodbyes, short daily exchanges.",
  },
  "tot ziens": {
    titleZh: "告别固定表达",
    titleEn: "Goodbye Expression",
    explanationZh: "tot ziens 是完整的“再见”，整块听读，不需要拆成普通句子。",
    explanationEn: "tot ziens is a full goodbye expression. Learn it as one spoken chunk.",
    functionZh: "离开、结束对话、告别时说 tot ziens。",
    functionEn: "Use tot ziens when leaving or ending a conversation.",
    noteZh: "比 dag 更完整、更正式一点；重点是整块说顺。",
    noteEn: "It is fuller and a bit more formal than dag; focus on saying the whole chunk smoothly.",
    usageZh: "告别、离开店铺、结束对话。",
    usageEn: "saying goodbye, leaving a shop, ending a conversation.",
  },
  "dank je": {
    titleZh: "感谢固定表达",
    titleEn: "Thank-you Expression",
    explanationZh: "dank je 是“谢谢你”，整块当感谢表达记。",
    explanationEn: "dank je means thank you. Learn it as one gratitude expression.",
    functionZh: "别人帮你、递东西给你、回答你之后，用 dank je 表示感谢。",
    functionEn: "Use dank je after someone helps you, gives you something, or answers you.",
    noteZh: "dank je 偏日常；更正式可以用 dank u。",
    noteEn: "dank je is everyday; dank u is more formal.",
    usageZh: "感谢、收东西、回应帮助。",
    usageEn: "thanking someone, receiving something, responding to help.",
  },
  "dank u": {
    titleZh: "正式感谢固定表达",
    titleEn: "Formal Thank-you Expression",
    explanationZh: "dank u 是更正式的“谢谢您”。",
    explanationEn: "dank u is the more formal thank you.",
    functionZh: "对陌生人、工作人员、长辈或正式场合说 dank u。",
    functionEn: "Use dank u with strangers, staff, older people, or formal situations.",
    noteZh: "je 是日常“你”，u 是礼貌“您”。",
    noteEn: "je is everyday you; u is polite/formal you.",
    usageZh: "正式感谢、办事窗口、服务场景。",
    usageEn: "formal thanks, service desks, official situations.",
  },
  bedankt: {
    titleZh: "感谢固定表达",
    titleEn: "Thank-you Expression",
    explanationZh: "bedankt 是常用的“谢谢”，可以单独说。",
    explanationEn: "bedankt is a common thank-you expression and can stand alone.",
    functionZh: "收到帮助或服务后直接说 bedankt。",
    functionEn: "Say bedankt after receiving help or service.",
    noteZh: "它和 dank je 都能表示感谢；bedankt 更像一个完整短词块。",
    noteEn: "It overlaps with dank je; bedankt works as a complete short chunk.",
    usageZh: "感谢、结账、收东西、结束互动。",
    usageEn: "thanks, checkout, receiving something, closing an interaction.",
  },
  alsjeblieft: {
    titleZh: "礼貌固定表达",
    titleEn: "Polite Expression",
    explanationZh: "alsjeblieft 有两个常见功能：请求时的“请”，递东西时的“给你”。",
    explanationEn: "alsjeblieft has two common functions: please in requests, and here you are when giving something.",
    functionZh: "请求时表示“请”，递东西时表示“给你”。",
    functionEn: "In requests it means please; when handing something over it means here you are.",
    noteZh: "先按“请/给你”两个功能记，比拆字母更有用。",
    noteEn: "Remember the two functions first: please / here you are.",
    usageZh: "请求、点餐、递东西、礼貌互动。",
    usageEn: "requests, ordering, handing something over, polite exchanges.",
  },
  alstublieft: {
    titleZh: "正式礼貌固定表达",
    titleEn: "Formal Polite Expression",
    explanationZh: "alstublieft 是 alsjeblieft 的正式版本。",
    explanationEn: "alstublieft is the formal version of alsjeblieft.",
    functionZh: "对工作人员、陌生人或正式场合，用 alstublieft 表示“请/给您”。",
    functionEn: "Use alstublieft with staff, strangers, or formal situations for please / here you are.",
    noteZh: "u 是礼貌“您”，所以 alstublieft 比 alsjeblieft 更正式。",
    noteEn: "u is formal you, so alstublieft is more formal than alsjeblieft.",
    usageZh: "办事、请求重复、正式礼貌表达。",
    usageEn: "official situations, asking politely, formal requests.",
  },
  sorry: {
    titleZh: "道歉/打扰固定表达",
    titleEn: "Apology Expression",
    explanationZh: "sorry 和英语意思接近，作为安全礼貌词整块记。",
    explanationEn: "sorry is close to English sorry. Learn it as a safe polite expression.",
    functionZh: "碰到人、打扰别人、没听清时，可以先说 sorry。",
    functionEn: "Use sorry when bumping into someone, interrupting, or when you did not catch something.",
    noteZh: "它不需要搭配联想，重点是知道什么时候开口用。",
    noteEn: "It does not need a collocation mnemonic; know when to use it.",
    usageZh: "道歉、打扰、请求重复前。",
    usageEn: "apologizing, interrupting, before asking for repetition.",
  },
  ja: {
    titleZh: "回答词",
    titleEn: "Answer Word",
    explanationZh: "ja 是“是/对/好”的肯定回答，整块记。",
    explanationEn: "ja is the yes/affirmative answer word.",
    functionZh: "回答是否问题时用 ja。",
    functionEn: "Use ja to answer yes/no questions affirmatively.",
    noteZh: "和 nee 一起成对记，比硬找搭配更有用。",
    noteEn: "Learn it together with nee; that is more useful than forcing a collocation.",
    usageZh: "是否回答、确认、同意。",
    usageEn: "yes/no answers, confirmation, agreement.",
  },
  nee: {
    titleZh: "回答词",
    titleEn: "Answer Word",
    explanationZh: "nee 是“不/不是”的否定回答，整块记。",
    explanationEn: "nee is the no/negative answer word.",
    functionZh: "回答是否问题时用 nee。",
    functionEn: "Use nee to answer yes/no questions negatively.",
    noteZh: "和 ja 成对记；真正否定句再用 niet / geen。",
    noteEn: "Learn it with ja; full negative sentences use niet / geen.",
    usageZh: "是否回答、拒绝、否认。",
    usageEn: "yes/no answers, refusal, denial.",
  },
  "oké": {
    titleZh: "确认固定表达",
    titleEn: "Confirmation Expression",
    explanationZh: "oké 表示“好的/可以/没问题”，整块当回应词记。",
    explanationEn: "oké means okay / fine / no problem. Learn it as a response word.",
    functionZh: "确认安排、接受建议或回应别人时用 oké。",
    functionEn: "Use oké to confirm plans, accept suggestions, or respond.",
    noteZh: "oké 比 prima 更中性；prima 往往更积极一点。",
    noteEn: "oké is more neutral than prima; prima is often a bit more positive.",
    usageZh: "确认、接受、回应。",
    usageEn: "confirming, accepting, responding.",
  },
  oke: {
    titleZh: "确认固定表达",
    titleEn: "Confirmation Expression",
    explanationZh: "oke 是 oké 的无重音写法，意思同样是“好的/可以”。",
    explanationEn: "oke is the unaccented spelling of oké, with the same okay meaning.",
    functionZh: "确认安排、接受建议或回应别人时用 oké。",
    functionEn: "Use oké to confirm plans, accept suggestions, or respond.",
    noteZh: "学习时按 oké 记；发音和用法一样。",
    noteEn: "Learn it as oké; pronunciation and use are the same.",
    usageZh: "确认、接受、回应。",
    usageEn: "confirming, accepting, responding.",
  },
  "een beetje": {
    titleZh: "程度短语",
    titleEn: "Degree Phrase",
    explanationZh: "een beetje 表示“一点点/有一点”，整块当可用词块记，不拆成普通名词短语。",
    explanationEn: "een beetje means a little. Learn it as one usable chunk, not as an ordinary noun phrase.",
    functionZh: "用来把能力、数量或程度放轻：Ik spreek een beetje Nederlands.",
    functionEn: "Use it to soften ability, quantity, or degree: Ik spreek een beetje Nederlands.",
    noteZh: "een 是“一/一个”的感觉，beetje 是“小点/一点”；合起来就是“一点点”。核心不是语言名，而是程度。",
    noteEn: "een gives the one/a feeling, and beetje means little bit; together they mean a little. The core is degree, not a language name.",
    usageZh: "语言能力、数量/程度表达、礼貌降低语气。",
    usageEn: "language ability, quantity/degree, and softening statements.",
  },
};

export const functionWordSeeds: Record<string, FunctionWordSeed> = {
  ik: {
    titleZh: "主语代词",
    titleEn: "Subject Pronoun",
    explanationZh: "ik 是“我”，记它在句子里的主语位置，而不是拿整句当联想。",
    explanationEn: "ik means I. Remember its subject position, not a whole sentence as a mnemonic.",
    functionZh: "ik 放在句首表示说话人自己。",
    functionEn: "ik at the start of a sentence refers to the speaker.",
    noteZh: "ik 后面常接 ben / heet / woon / heb / wil 这类 ik 形式。",
    noteEn: "ik is often followed by ik-forms such as ben / heet / woon / heb / wil.",
    usageZh: "自我介绍、姓名、住处、状态。",
    usageEn: "self-introduction, name, residence, state.",
  },
  jij: {
    titleZh: "主语代词",
    titleEn: "Subject Pronoun",
    explanationZh: "jij 是日常的“你”，重点是和 u 区分。",
    explanationEn: "jij is informal you; contrast it with u.",
    functionZh: "和熟人或同辈说话时用 jij。",
    functionEn: "Use jij with familiar people or peers.",
    noteZh: "正式场合先用 u；jij 更日常。",
    noteEn: "Use u first in formal situations; jij is more everyday.",
    usageZh: "熟人对话、问名字、日常问答。",
    usageEn: "familiar conversation, asking names, daily questions.",
  },
  je: {
    titleZh: "弱读你/你的",
    titleEn: "Reduced You/Your",
    explanationZh: "je 常是 jij / jouw 的弱读形式，口语里很常见。",
    explanationEn: "je is often the reduced form of jij / jouw and is common in speech.",
    functionZh: "je 可以表示“你”，也可以表示“你的”。",
    functionEn: "je can mean you or your.",
    noteZh: "先在短句里识别它，不要单独硬拆。",
    noteEn: "Recognize it in short sentences first; do not overanalyze it alone.",
    usageZh: "日常问答、口语句子。",
    usageEn: "daily questions and spoken sentences.",
  },
  u: {
    titleZh: "礼貌代词",
    titleEn: "Polite Pronoun",
    explanationZh: "u 是礼貌的“您”，正式场合优先用。",
    explanationEn: "u is polite/formal you and is preferred in formal settings.",
    functionZh: "和陌生人、工作人员、医生或老师说话时用 u。",
    functionEn: "Use u with strangers, staff, doctors, or teachers.",
    noteZh: "u 比 jij 更礼貌；A0/A1 办事场景先用 u 更安全。",
    noteEn: "u is more polite than jij; it is safer in service and official contexts.",
    usageZh: "办事、看医生、请求帮助、正式对话。",
    usageEn: "official tasks, doctor visits, asking for help, formal conversation.",
  },
};

export const compoundBreakdowns: Record<string, SeededBreakdown> = {
  ziekenhuis: {
    parts: [
      { dutch: "ziek", meaningZh: "生病", meaningEn: "sick" },
      { dutch: "huis", meaningZh: "房子/家", meaningEn: "house/home" },
    ],
    noteZh: "生病的人去的 house，就是 ziekenhuis。",
    noteEn: "A house for sick people: ziekenhuis.",
    usageZh: "看病、急诊、住院。",
    usageEn: "doctor visits, emergency care, or hospital stays.",
  },
  middernacht: {
    parts: [
      { dutch: "midden", meaningZh: "中间", meaningEn: "middle" },
      { dutch: "nacht", meaningZh: "夜晚", meaningEn: "night" },
    ],
    noteZh: "夜晚的中间就是午夜。",
    noteEn: "The middle of the night is midnight.",
    usageZh: "说一天里的时间点。",
    usageEn: "time of day.",
  },
  aardappel: {
    parts: [
      { dutch: "aard", meaningZh: "土地/地", meaningEn: "earth/ground" },
      { dutch: "appel", meaningZh: "苹果", meaningEn: "apple" },
    ],
    noteZh: "aardappel 像 earth apple：地里的 apple，就是土豆。",
    noteEn: "aardappel feels like earth apple: potato.",
    usageZh: "买菜、做饭、点餐。",
    usageEn: "groceries, cooking, and meals.",
  },
  tandarts: {
    parts: [
      { dutch: "tand", meaningZh: "牙齿", meaningEn: "tooth" },
      { dutch: "arts", meaningZh: "医生", meaningEn: "doctor" },
    ],
    noteZh: "tand + arts = 牙齿医生，也就是牙医。",
    noteEn: "tand + arts = tooth doctor, dentist.",
    usageZh: "牙痛、检查牙齿、预约牙医。",
    usageEn: "toothache, dental checks, dentist appointments.",
  },
  huisarts: {
    parts: [
      { dutch: "huis", meaningZh: "家", meaningEn: "home/house" },
      { dutch: "arts", meaningZh: "医生", meaningEn: "doctor" },
    ],
    noteZh: "huisarts 是和家庭/住处相关的医生，也就是家庭医生。",
    noteEn: "huisarts is the doctor connected to your home situation: a GP.",
    usageZh: "打电话给家庭医生、预约看病。",
    usageEn: "calling the GP or making a medical appointment.",
  },
  woordenboek: {
    parts: [
      { dutch: "woord", meaningZh: "词", meaningEn: "word" },
      { dutch: "boek", meaningZh: "书", meaningEn: "book" },
    ],
    noteZh: "woordenboek 字面是“词的书”，也就是词典。",
    noteEn: "A word book is a dictionary.",
    usageZh: "查词、学习、翻译。",
    usageEn: "looking up words, studying, translating.",
  },
  vliegtuig: {
    parts: [
      { dutch: "vlieg", meaningZh: "飞", meaningEn: "fly" },
      { dutch: "tuig", meaningZh: "工具/设备", meaningEn: "tool/equipment" },
    ],
    noteZh: "vliegtuig 是会飞的设备，也就是飞机。",
    noteEn: "A flying machine: vliegtuig.",
    usageZh: "旅行、机场、订票。",
    usageEn: "travel, airports, tickets.",
  },
  treinkaart: {
    parts: [
      { dutch: "trein", meaningZh: "火车", meaningEn: "train" },
      { dutch: "kaart", meaningZh: "票/卡", meaningEn: "ticket/card" },
    ],
    noteZh: "treinkaart = 火车票/卡。",
    noteEn: "treinkaart = train ticket/card.",
    usageZh: "坐火车、买票。",
    usageEn: "taking a train or buying tickets.",
  },
  zorgverzekering: {
    parts: [
      { dutch: "zorg", meaningZh: "照顾/医疗 care", meaningEn: "care" },
      { dutch: "verzekering", meaningZh: "保险", meaningEn: "insurance" },
    ],
    noteZh: "zorgverzekering 是医疗照顾相关的保险。",
    noteEn: "zorgverzekering is care/health insurance.",
    usageZh: "医疗保险、账单、注册。",
    usageEn: "health insurance, bills, registration.",
  },
  betalingsbewijs: {
    parts: [
      { dutch: "betaling", meaningZh: "付款", meaningEn: "payment" },
      { dutch: "bewijs", meaningZh: "证明", meaningEn: "proof" },
    ],
    noteZh: "betaling 是付款，bewijs 是证明；把银行回执或付款截图想成“付款留下的证据”，就是 betalingsbewijs。",
    noteEn: "betaling is payment and bewijs is proof; picture the bank receipt or screenshot as the proof left after paying: betalingsbewijs.",
    usageZh: "账单、报销、邮件或办事时提交付款证明。",
    usageEn: "submitting proof of payment for bills, reimbursement, emails, or admin tasks.",
  },
};

export const englishBridgeSeeds: Record<string, EnglishBridgeSeed> = {
  boek: {
    bridge: "boek ≈ book",
    noteZh: "boek 和 English book 很近，先借 book 抓住“书”，再按荷兰语发音记。",
    noteEn: "boek is close to English book. Use book as the meaning hook, then pronounce it in Dutch.",
  },
  dokter: {
    bridge: "dokter ≈ doctor",
    noteZh: "dokter 和 English doctor 很近，先借 doctor 抓住“医生”。",
    noteEn: "dokter is close to English doctor; use doctor as the meaning hook.",
  },
  telefoon: {
    bridge: "telefoon ≈ telephone",
    noteZh: "telefoon 和 English telephone 很近，现代日常里常指电话/手机。",
    noteEn: "telefoon is close to English telephone and often means phone in daily use.",
  },
  adres: {
    bridge: "adres ≈ address",
    noteZh: "adres 和 English address 很像，但荷兰语少一个 d。",
    noteEn: "adres looks like address, but Dutch has one d.",
  },
  open: {
    bridge: "open = open",
    noteZh: "open 和 English open 拼写一样。先借英文抓住“打开/开着”，再区分句子里是动作还是状态。",
    noteEn: "open is spelled like English open. Use English as the hook, then notice whether Dutch uses it as an action or a state.",
  },
  auto: {
    bridge: "auto ≈ automobile / auto",
    noteZh: "auto 不直接等于 English car 的拼写，但可以借 English automobile / auto 记“汽车”。",
    noteEn: "auto is not shaped like car, but English automobile / auto gives a clean hook for car.",
  },
  halte: {
    bridge: "halte ≈ halt / stop",
    noteZh: "halte 可以借 English halt 抓住“停”的感觉；在交通里就是公交/电车的站点。",
    noteEn: "halte can hook to English halt / stop; in transport it means a stop.",
  },
  app: {
    bridge: "app = app",
    noteZh: "app 和 English app 一样，直接按应用程序记。",
    noteEn: "app is the same as English app.",
  },
  computer: {
    bridge: "computer = computer",
    noteZh: "computer 和 English computer 一样，注意荷兰语发音。",
    noteEn: "computer is the same as English computer; pronounce it in Dutch.",
  },
  laptop: {
    bridge: "laptop = laptop",
    noteZh: "laptop 和 English laptop 一样。",
    noteEn: "laptop is the same as English laptop.",
  },
  hotel: {
    bridge: "hotel = hotel",
    noteZh: "hotel 和 English hotel 一样，住宿场景直接认。",
    noteEn: "hotel is the same as English hotel.",
  },
  restaurant: {
    bridge: "restaurant = restaurant",
    noteZh: "restaurant 和 English restaurant 一样，点餐/外食场景直接认。",
    noteEn: "restaurant is the same as English restaurant.",
  },
  museum: {
    bridge: "museum = museum",
    noteZh: "museum 和 English museum 一样，注意荷兰语发音。",
    noteEn: "museum is the same as English museum; pronounce it in Dutch.",
  },
  route: {
    bridge: "route = route",
    noteZh: "route 和 English route 一样，用在路线/出行场景。",
    noteEn: "route is the same as English route and belongs to travel/directions.",
  },
  tram: {
    bridge: "tram = tram",
    noteZh: "tram 和 English tram 一样。",
    noteEn: "tram is the same as English tram.",
  },
  metro: {
    bridge: "metro = metro",
    noteZh: "metro 和 English metro 一样。",
    noteEn: "metro is the same as English metro.",
  },
  stop: {
    bridge: "stop = stop",
    noteZh: "stop 和 English stop 一样，直接借英文记“停止”。",
    noteEn: "stop is the same as English stop.",
  },
  eten: {
    bridge: "eten ≈ eat",
    noteZh: "eten 和 English eat 是强联想：先借 eat 抓住“吃”，再记完整形式 eten / ik eet。",
    noteEn: "eten has a strong link to English eat: use eat for the meaning, then learn eten / ik eet.",
  },
  eet: {
    bridge: "eet ≈ eat",
    noteZh: "eet 和 English eat 很近，先借 eat 记“吃”。",
    noteEn: "eet is close to English eat; use eat to remember the meaning.",
  },
  drinken: {
    bridge: "drinken ≈ drink",
    noteZh: "drinken 直接连到 English drink；-en 是荷兰语动词完整形式。",
    noteEn: "drinken connects directly to English drink; -en is the Dutch infinitive ending.",
  },
  drink: {
    bridge: "drink = drink",
    noteZh: "drink 和 English drink 拼写一样，意思也是“喝”。",
    noteEn: "drink is spelled like English drink and means drink.",
  },
  werken: {
    bridge: "werken ≈ work",
    noteZh: "werken 和 English work 是强联想；先借 work 记“工作”，再记完整形式 werken。",
    noteEn: "werken is strongly connected to English work; use work for the meaning, then learn werken.",
  },
  werk: {
    bridge: "werk ≈ work",
    noteZh: "werk 和 English work 很近，先借 work 抓住“工作”。",
    noteEn: "werk is close to English work; use work as the meaning hook.",
  },
  maken: {
    bridge: "maken ≈ make",
    noteZh: "maken 和 English make 很近；先借 make 抓住“做/制作”。",
    noteEn: "maken is close to English make; use make for the meaning.",
  },
  maak: {
    bridge: "maak ≈ make",
    noteZh: "maak 和 English make 很近，常见于 ik maak。",
    noteEn: "maak is close to English make and appears in ik maak.",
  },
  helpen: {
    bridge: "helpen ≈ help",
    noteZh: "helpen 直接连到 English help；-en 是荷兰语动词完整形式。",
    noteEn: "helpen links directly to English help; -en is the Dutch infinitive ending.",
  },
  help: {
    bridge: "help = help",
    noteZh: "help 和 English help 一样，意思也是“帮助”。",
    noteEn: "help is the same shape as English help and means help.",
  },
  spreken: {
    bridge: "spreken ≈ speak",
    noteZh: "spreken 和 English speak 是强联想；先借 speak 抓住“说”。",
    noteEn: "spreken has a strong link to English speak; use speak for the meaning.",
  },
  slapen: {
    bridge: "slapen ≈ sleep",
    noteZh: "slapen 和 English sleep 是强联想；先借 sleep 抓住“睡觉”。",
    noteEn: "slapen has a strong link to English sleep; use sleep for the meaning.",
  },
  leren: {
    bridge: "leren ≈ learn",
    noteZh: "leren 和 English learn 很近；先借 learn 抓住“学习”。",
    noteEn: "leren is close to English learn; use learn for the meaning.",
  },
  wassen: {
    bridge: "wassen ≈ wash",
    noteZh: "wassen 和 English wash 很近；先借 wash 抓住“洗”。",
    noteEn: "wassen is close to English wash; use wash for the meaning.",
  },
  koken: {
    bridge: "koken ≈ cook",
    noteZh: "koken 和 English cook 是强联想；先借 cook 抓住“做饭”。",
    noteEn: "koken has a strong link to English cook; use cook for the meaning.",
  },
  pauzeren: {
    bridge: "pauzeren ≈ pause",
    noteZh: "pauzeren 和 English pause 很近；先借 pause 抓住“暂停”。",
    noteEn: "pauzeren is close to English pause; use pause for the meaning.",
  },
  repareren: {
    bridge: "repareren ≈ repair",
    noteZh: "repareren 和 English repair 很近；先借 repair 抓住“修理”。",
    noteEn: "repareren is close to English repair; use repair for the meaning.",
  },
  trein: {
    bridge: "trein ≈ train",
    noteZh: "trein 和 English train 很像，拼写和发音按荷兰语走。",
    noteEn: "trein looks like train; pronounce it in Dutch.",
  },
  water: {
    bridge: "water = water",
    noteZh: "water 和 English water 拼写一样，但发音按荷兰语。",
    noteEn: "water is spelled like English water, with Dutch pronunciation.",
  },
  appel: {
    bridge: "appel ≈ apple",
    noteZh: "appel 像 English apple，荷兰语双 p、单 l。",
    noteEn: "appel looks like apple, with Dutch spelling.",
  },
  bus: {
    bridge: "bus = bus",
    noteZh: "bus 和 English bus 拼写一样，直接放进交通场景记。",
    noteEn: "bus is spelled like English bus; learn it in transport contexts.",
  },
  station: {
    bridge: "station = station",
    noteZh: "station 和 English station 拼写一样，常用于火车站/车站。",
    noteEn: "station is spelled like English station and used for stations.",
  },
  menu: {
    bridge: "menu = menu",
    noteZh: "menu 和 English menu 一样，点餐时直接用。",
    noteEn: "menu is the same as English menu, useful when ordering.",
  },
};

export const wordFormationSeeds: Record<string, WordFormationSeed> = {
  planning: {
    base: { dutch: "plan / plannen", meaningZh: "计划 / 安排", meaningEn: "plan / schedule" },
    formed: { dutch: "planning", meaningZh: "排好的计划/排班", meaningEn: "planned schedule" },
    noteZh: "planning 不要只当英文词背：先抓 plan，再接动词 plannen；安排完留下来的那张表，就是 planning。",
    noteEn: "Do not learn planning only as English. Start from plan, add the verb plannen; the schedule left after planning is the planning.",
  },
  vrouwelijk: {
    base: { dutch: "vrouw", meaningZh: "女人", meaningEn: "woman" },
    formed: { dutch: "vrouwelijk", meaningZh: "女性的/女性化的", meaningEn: "female/feminine" },
    noteZh: "看到 vrouw，就能联想到 vrouwelijk。",
    noteEn: "Start from vrouw, then remember vrouwelijk as feminine.",
  },
  woning: {
    base: { dutch: "wonen", meaningZh: "居住", meaningEn: "live" },
    formed: { dutch: "woning", meaningZh: "住房", meaningEn: "dwelling/home" },
    noteZh: "wonen 是住，woning 是住的地方。",
    noteEn: "wonen means live; woning is a place to live.",
  },
  betaling: {
    base: { dutch: "betalen", meaningZh: "付款", meaningEn: "pay" },
    formed: { dutch: "betaling", meaningZh: "付款", meaningEn: "payment" },
    noteZh: "betalen 是动作，betaling 是这件付款。",
    noteEn: "betalen is the action; betaling is the payment.",
  },
  verzekering: {
    base: { dutch: "verzekeren", meaningZh: "投保/保险", meaningEn: "insure" },
    formed: { dutch: "verzekering", meaningZh: "保险", meaningEn: "insurance" },
    noteZh: "verzekeren 是投保，verzekering 是保险。",
    noteEn: "verzekeren is to insure; verzekering is insurance.",
  },
  hulp: {
    base: { dutch: "helpen", meaningZh: "帮助", meaningEn: "help" },
    formed: { dutch: "hulp", meaningZh: "帮助", meaningEn: "help/helping noun" },
    noteZh: "helpen 是动词“帮助”，hulp 是名词“帮助”。",
    noteEn: "helpen is the verb; hulp is the noun.",
  },
  werk: {
    base: { dutch: "werken", meaningZh: "工作", meaningEn: "work" },
    formed: { dutch: "werk", meaningZh: "工作", meaningEn: "work/job" },
    noteZh: "werken 是工作这个动作，werk 是工作这件事/岗位。",
    noteEn: "werken is the action; werk is work/job.",
  },
  vraag: {
    base: { dutch: "vragen", meaningZh: "问", meaningEn: "ask" },
    formed: { dutch: "vraag", meaningZh: "问题", meaningEn: "question" },
    noteZh: "vragen 是问，vraag 是一个问题。",
    noteEn: "vragen means ask; vraag is a question.",
  },
  antwoord: {
    base: { dutch: "antwoorden", meaningZh: "回答", meaningEn: "answer" },
    formed: { dutch: "antwoord", meaningZh: "回答/答案", meaningEn: "answer" },
    noteZh: "antwoorden 是回答这个动作，antwoord 是答案。",
    noteEn: "antwoorden is the action; antwoord is the answer.",
  },
};

export const fixedOutputSentences: Record<string, { dutch: string; meaningZh: string; meaningEn: string }> = {
  ziekenhuis: { dutch: "Ik moet naar het ziekenhuis.", meaningZh: "我必须去医院。", meaningEn: "I have to go to the hospital." },
  middernacht: { dutch: "Het is middernacht.", meaningZh: "现在是午夜。", meaningEn: "It is midnight." },
  adres: { dutch: "Ik vul mijn adres in.", meaningZh: "我填写我的地址。", meaningEn: "I fill in my address." },
  open: { dutch: "Open de app.", meaningZh: "打开应用。", meaningEn: "Open the app." },
  auto: { dutch: "Ik ga met de auto.", meaningZh: "我开车/坐车去。", meaningEn: "I go by car." },
  halte: { dutch: "Ik ga naar de halte.", meaningZh: "我去站点。", meaningEn: "I go to the stop." },
  station: { dutch: "Ik ga naar het station.", meaningZh: "我去车站。", meaningEn: "I go to the station." },
  bus: { dutch: "Ik neem de bus.", meaningZh: "我坐公交。", meaningEn: "I take the bus." },
  trein: { dutch: "Ik neem de trein.", meaningZh: "我坐火车。", meaningEn: "I take the train." },
  fiets: { dutch: "Ik ga met de fiets.", meaningZh: "我骑自行车去。", meaningEn: "I go by bike." },
  afspraak: { dutch: "Ik wil graag een afspraak maken.", meaningZh: "我想预约。", meaningEn: "I would like to make an appointment." },
  maar: { dutch: "Ik wil koffie, maar ik heb geen tijd.", meaningZh: "我想喝咖啡，但是我没有时间。", meaningEn: "I want coffee, but I do not have time." },
  ook: { dutch: "Ik wil ook koffie.", meaningZh: "我也想要咖啡。", meaningEn: "I also want coffee." },
  nog: { dutch: "Kunt u dat nog een keer zeggen?", meaningZh: "您可以再说一遍吗？", meaningEn: "Can you say that one more time?" },
  niet: { dutch: "Ik begrijp het niet.", meaningZh: "我不明白。", meaningEn: "I do not understand it." },
  geen: { dutch: "Ik heb geen tijd.", meaningZh: "我没有时间。", meaningEn: "I have no time." },
  engels: { dutch: "Ik spreek Engels.", meaningZh: "我说英语。", meaningEn: "I speak English." },
  nederlands: { dutch: "Ik spreek Nederlands.", meaningZh: "我说荷兰语。", meaningEn: "I speak Dutch." },
  januari: { dutch: "In januari begint het jaar.", meaningZh: "一月是一年的开始。", meaningEn: "The year starts in January." },
  maandag: { dutch: "Maandag werk ik.", meaningZh: "星期一我工作。", meaningEn: "On Monday I work." },
  rood: { dutch: "Het licht is rood.", meaningZh: "灯是红色的。", meaningEn: "The light is red." },
  hulp: { dutch: "Ik heb hulp nodig.", meaningZh: "我需要帮助。", meaningEn: "I need help." },
  prima: { dutch: "Prima.", meaningZh: "很好/可以。", meaningEn: "Fine/okay." },
  "oké": { dutch: "Oké.", meaningZh: "好的。", meaningEn: "Okay." },
  oke: { dutch: "Oké.", meaningZh: "好的。", meaningEn: "Okay." },
  "een beetje": { dutch: "Ik spreek een beetje Nederlands.", meaningZh: "我会说一点荷兰语。", meaningEn: "I speak a little Dutch." },
  vakantie: { dutch: "Ik heb vakantie.", meaningZh: "我放假。", meaningEn: "I am on holiday." },
  duwen: { dutch: "Duw tegen de deur.", meaningZh: "推这扇门。", meaningEn: "Push against the door." },
  trekken: { dutch: "Trek aan de deur.", meaningZh: "拉这扇门。", meaningEn: "Pull the door." },
  ingang: { dutch: "Waar is de ingang?", meaningZh: "入口在哪里？", meaningEn: "Where is the entrance?" },
  uitgang: { dutch: "Waar is de uitgang?", meaningZh: "出口在哪里？", meaningEn: "Where is the exit?" },
  nooduitgang: { dutch: "Gebruik de nooduitgang.", meaningZh: "请使用紧急出口。", meaningEn: "Use the emergency exit." },
  verboden: { dutch: "Roken is verboden.", meaningZh: "禁止吸烟。", meaningEn: "Smoking is forbidden." },
  toegestaan: { dutch: "Parkeren is toegestaan.", meaningZh: "允许停车。", meaningEn: "Parking is allowed." },
};

export const memoryPhraseSeeds: Record<string, MemoryPhraseSeed[]> = {
  vakantie: [
    { dutch: "op vakantie gaan", meaningZh: "去度假", meaningEn: "go on holiday" },
    { dutch: "vakantie hebben", meaningZh: "放假", meaningEn: "be on holiday / have time off" },
    { dutch: "de vakantie begint maandag", meaningZh: "假期周一开始", meaningEn: "the holiday starts on Monday" },
  ],
  duwen: [
    { dutch: "tegen de deur duwen", meaningZh: "推门", meaningEn: "push against the door" },
    { dutch: "Duw tegen de deur.", meaningZh: "推这扇门。", meaningEn: "Push against the door." },
    { dutch: "duwen en trekken", meaningZh: "推和拉", meaningEn: "push and pull" },
  ],
  trekken: [
    { dutch: "aan de deur trekken", meaningZh: "拉门", meaningEn: "pull the door" },
    { dutch: "Trek aan de deur.", meaningZh: "拉这扇门。", meaningEn: "Pull the door." },
    { dutch: "duwen en trekken", meaningZh: "推和拉", meaningEn: "push and pull" },
  ],
  ingang: [
    { dutch: "waar is de ingang", meaningZh: "入口在哪里", meaningEn: "where is the entrance" },
    { dutch: "bij de ingang", meaningZh: "在入口处", meaningEn: "at the entrance" },
  ],
  uitgang: [
    { dutch: "waar is de uitgang", meaningZh: "出口在哪里", meaningEn: "where is the exit" },
    { dutch: "naar de uitgang", meaningZh: "去出口", meaningEn: "to the exit" },
  ],
  nooduitgang: [
    { dutch: "de nooduitgang", meaningZh: "紧急出口", meaningEn: "the emergency exit" },
    { dutch: "naar de nooduitgang", meaningZh: "去紧急出口", meaningEn: "to the emergency exit" },
  ],
  verboden: [
    { dutch: "roken is verboden", meaningZh: "禁止吸烟", meaningEn: "smoking is forbidden" },
    { dutch: "parkeren is verboden", meaningZh: "禁止停车", meaningEn: "parking is forbidden" },
  ],
  toegestaan: [
    { dutch: "parkeren is toegestaan", meaningZh: "允许停车", meaningEn: "parking is allowed" },
    { dutch: "is toegestaan", meaningZh: "是允许的", meaningEn: "is allowed" },
  ],
};

export const funMemorySeeds: Record<string, FunMemorySeed> = {
  vandaag: {
    hookZh: "vandaag 先抓 dag：把时间轴想成三格，gisteren 在左、vandaag 站中间、morgen 在右；手指按住中间这一格，就是今天。",
    hookEn: "For vandaag, notice dag. Picture a three-slot timeline: gisteren on the left, vandaag in the middle, morgen on the right; your finger on the middle slot is today.",
  },
  gisteren: {
    hookZh: "gisteren 放在时间轴左边：今天往回退一格，就是昨天；和 vandaag / morgen 成一排记。",
    hookEn: "Put gisteren on the left side of the timeline: one step back from today is yesterday; learn it with vandaag and morgen.",
  },
  morgen: {
    hookZh: "morgen 有两个常见画面：早上的 morgen，和时间轴右边的“明天”。看到 goedemorgen 先想早上，单独用 morgen 常是明天。",
    hookEn: "morgen has two common pictures: morning, and the next slot on the timeline. In goedemorgen think morning; alone, morgen often means tomorrow.",
  },
  overmorgen: {
    hookZh: "overmorgen = 跨过 morgen 再往前一格：今天、明天、后天，像在日历上跳两步。",
    hookEn: "overmorgen is one step over morgen: today, tomorrow, then the day after tomorrow, like jumping two calendar squares.",
  },
  straks: {
    hookZh: "straks 像把事情放到眼前不远处：不是现在这秒，是一会儿就到的那个小时间点。",
    hookEn: "straks puts an action just a little ahead of now: not this second, but soon.",
  },
  meteen: {
    hookZh: "meteen 是没有缓冲的“马上”：听到它，就想手刚碰到按钮，事情立刻开始。",
    hookEn: "meteen means immediately: picture pressing a button and the action starting right away.",
  },
  daarna: {
    hookZh: "daarna = daar + na：先有前一件事，手指再往后挪一格，就是之后。",
    hookEn: "daarna is daar + na: after one thing happens, move your finger to the next slot.",
  },
  eerst: {
    hookZh: "eerst 像队伍里的第一个人：先做它，后面的事才排队跟上。",
    hookEn: "eerst is like the first person in line: do this first, then the rest can follow.",
  },
  laatst: {
    hookZh: "laatst 不是“最后一个”那么死板；把它想成最近刚发生过、还在脑子边上的一件事。",
    hookEn: "laatst is not only the last item; picture something that happened recently and is still nearby in your memory.",
  },
  vakantie: {
    hookZh: "vakantie 和 English vacation 是一类“把日常暂停一下”的假期词；荷兰语这里用 k，不用 c。",
    hookEn: "vakantie sits near English vacation: a word for pausing normal routine. In Dutch it uses k, not c.",
  },
  kantoor: {
    hookZh: "kantoor 的画面应该是办公桌、电脑、同事和文件，不是家里的 kamer。先把它钉在“去办公室/在办公室工作”的画面上。",
    hookEn: "The picture for kantoor is a desk, computer, colleagues, and documents, not a room at home. Anchor it in going to or working in an office.",
  },
  dienstregeling: {
    hookZh: "dienstregeling 可以拆成 dienst（班次/服务）+ regeling（安排）：站牌上把一班班车排成时间表，就是 dienstregeling。",
    hookEn: "dienstregeling is dienst (service/run) + regeling (arrangement): the timetable that lines up transport runs.",
  },
  toekomstplan: {
    hookZh: "toekomst 是未来，plan 是计划；脑子里翻到未来那一页，上面写着的计划就是 toekomstplan。",
    hookEn: "toekomst means future and plan means plan; picture a future calendar page with a plan written on it.",
  },
  duwen: {
    hookZh: "把 duwen 想成门口标识上的一个短动作：Duw. 手往前推；旁边常见反动作 trekken。",
    hookEn: "Think of duwen as the short action on a door sign: Duw. Your hand pushes forward; the opposite is trekken.",
  },
  trekken: {
    hookZh: "trekken 是 duwen 的反方向：手抓住门把往自己这边拉。门口标识常成对出现 Duwen / Trekken。",
    hookEn: "trekken goes the opposite way from duwen: your hand pulls the handle toward you. Door signs often pair Duwen / Trekken.",
  },
  ingang: {
    hookZh: "ingang 里先抓 in：往里面走的口，就是入口。",
    hookEn: "In ingang, notice in: the way to go in, so entrance.",
  },
  uitgang: {
    hookZh: "uitgang 里先抓 uit：往外走的口，就是出口。",
    hookEn: "In uitgang, notice uit: the way to go out, so exit.",
  },
  nooduitgang: {
    hookZh: "nood 是紧急情况，uitgang 是出口；nooduitgang 就是紧急时用的出口。",
    hookEn: "nood means emergency and uitgang means exit; nooduitgang is the exit used in an emergency.",
  },
  verboden: {
    hookZh: "verboden 是公共标识里的“红灯词”：看到它，先理解为这件事不可以做。",
    hookEn: "verboden is a red-light sign word: when you see it, understand that the action is not allowed.",
  },
  toegestaan: {
    hookZh: "toegestaan 是 verboden 的反面：公共规则里表示这件事可以做、被允许。",
    hookEn: "toegestaan is the opposite of verboden: in public rules it means the action is allowed.",
  },
};

export const phraseMeaningSeeds: Record<string, LocalizedText> = {
  "een beetje": { zh: "一点点", en: "a little" },
  "een beetje Nederlands": { zh: "一点荷兰语", en: "a little Dutch" },
  "een afspraak maken": { zh: "预约", en: "make an appointment" },
  "hulp nodig hebben": { zh: "需要帮助", en: "need help" },
  "een formulier invullen": { zh: "填写表格", en: "fill in a form" },
  "een rekening betalen": { zh: "付账单", en: "pay a bill" },
  "boodschappen doen": { zh: "买日用品/购物", en: "do groceries" },
  "open de app": { zh: "打开应用", en: "open the app" },
  "met de auto": { zh: "开车/坐车", en: "by car" },
  "naar de halte gaan": { zh: "去站点", en: "go to the stop" },
  "naar het station gaan": { zh: "去车站", en: "go to the station" },
  "de bus nemen": { zh: "坐公交", en: "take the bus" },
  "de trein nemen": { zh: "坐火车", en: "take the train" },
  "met de fiets": { zh: "骑自行车/用自行车", en: "by bike" },
  "op vakantie gaan": { zh: "去度假", en: "go on holiday" },
  "vakantie hebben": { zh: "放假", en: "be on holiday / have time off" },
  "de vakantie begint maandag": { zh: "假期周一开始", en: "the holiday starts on Monday" },
  "tegen de deur duwen": { zh: "推门", en: "push against the door" },
  "Duw tegen de deur.": { zh: "推这扇门。", en: "Push against the door." },
  "duwen en trekken": { zh: "推和拉", en: "push and pull" },
  "aan de deur trekken": { zh: "拉门", en: "pull the door" },
  "Trek aan de deur.": { zh: "拉这扇门。", en: "Pull the door." },
  "waar is de ingang": { zh: "入口在哪里", en: "where is the entrance" },
  "bij de ingang": { zh: "在入口处", en: "at the entrance" },
  "waar is de uitgang": { zh: "出口在哪里", en: "where is the exit" },
  "naar de uitgang": { zh: "去出口", en: "to the exit" },
  "de nooduitgang": { zh: "紧急出口", en: "the emergency exit" },
  "naar de nooduitgang": { zh: "去紧急出口", en: "to the emergency exit" },
  "roken is verboden": { zh: "禁止吸烟", en: "smoking is forbidden" },
  "parkeren is verboden": { zh: "禁止停车", en: "parking is forbidden" },
  "parkeren is toegestaan": { zh: "允许停车", en: "parking is allowed" },
  "is toegestaan": { zh: "是允许的", en: "is allowed" },
};

export function classifyMemoryPathWord(word: WordItem): MemoryPathWordType {
  const key = normalizeWordText(word.dutch);
  if (greetingPhraseWords.has(key)) return "phrase";
  if (word.dutch.trim().split(/\s+/).length > 1) return "phrase";
  if (countryNames.has(key)) return "country-name";
  if (languageNames.has(key)) return "language-name";
  if (numberWords.has(key)) return "number";
  if (dayMonthWords.has(key)) return "day-month";
  if (word.article) return "noun";
  if (functionWords.has(key)) return "function-word";
  if (adverbWords.has(key)) return "adverb";
  if (adjectiveWords.has(key)) return "adjective";
  const inferred = inferWordType(word);
  if (inferred !== "noun") return inferred;
  if (verbUsageFor(word)) return "verb";
  return "noun";
}

export function lexicalMeaningFor(part: string, allWords: WordItem[] = []) {
  const key = normalizeWordText(part);
  const word = allWords.find((item) => normalizeWordText(item.dutch) === key);
  return word?.meaning ?? relationLexicons.baseMorphemes[key];
}

export function phraseMeaningForMemoryPath(phrase: string) {
  return phraseMeaningSeeds[phrase] ?? { zh: "", en: "" };
}

const usageAnchorOverrides: Record<string, LocalizedText> = {
  hallo: { zh: "打招呼、电话开头、进入店铺。", en: "greeting people, starting calls, and entering shops." },
  dag: { zh: "问候、告别、简短日常对话。", en: "greetings, goodbyes, and short daily exchanges." },
  sorry: { zh: "道歉、打扰别人、请求重复前。", en: "apologizing, interrupting, and asking for repetition." },
  open: { zh: "打开应用、开门、看店铺是否开着。", en: "opening apps or doors, and checking whether a shop is open." },
  eten: { zh: "吃饭、点餐、说饮食习惯。", en: "eating, ordering food, and talking about eating habits." },
  eet: { zh: "吃饭、点餐、说自己吃什么。", en: "eating, ordering food, and saying what you eat." },
  drinken: { zh: "喝水、点饮料、说想喝什么。", en: "drinking water, ordering drinks, and saying what you want to drink." },
  drink: { zh: "喝水、点饮料、说自己喝什么。", en: "drinking water, ordering drinks, and saying what you drink." },
  kopen: { zh: "购物、买东西、问价格或付款。", en: "shopping, buying things, asking prices, or paying." },
  koop: { zh: "购物、买东西、说自己买什么。", en: "shopping, buying things, and saying what you buy." },
  lezen: { zh: "读书、读表格、读邮件或说明。", en: "reading books, forms, emails, or instructions." },
  lees: { zh: "读书、读表格、读邮件或说明。", en: "reading books, forms, emails, or instructions." },
  lopen: { zh: "走路、问路、说去哪里。", en: "walking, directions, and saying where you go." },
  loop: { zh: "走路、问路、说自己走去哪。", en: "walking, directions, and saying where you walk." },
  werken: { zh: "工作、日程、说今天是否上班。", en: "work, schedules, and saying whether you work today." },
  werk: { zh: "工作、找工作、说工作安排。", en: "work, job search, and work arrangements." },
  maken: { zh: "制作、安排、预约或办事动作。", en: "making, arranging, appointments, or practical tasks." },
  maak: { zh: "制作、安排、说自己正在做什么。", en: "making, arranging, and saying what you make/do." },
  helpen: { zh: "求助、服务窗口、请别人帮忙。", en: "asking for help, service desks, and getting assistance." },
  help: { zh: "求助、服务窗口、请别人帮忙。", en: "asking for help, service desks, and getting assistance." },
  hulp: { zh: "需要帮助、求助、说明问题。", en: "needing help, asking for help, and explaining a problem." },
  spreken: { zh: "语言能力、沟通、说某种语言。", en: "language ability, communication, and speaking a language." },
  slapen: { zh: "睡觉、作息、身体状态。", en: "sleep, daily routine, and physical state." },
  leren: { zh: "学习、课程、语言学习。", en: "study, lessons, and language learning." },
  wassen: { zh: "洗身体、洗衣服、日常清洁。", en: "washing yourself, laundry, and daily cleaning." },
  koken: { zh: "做饭、厨房、准备食物。", en: "cooking, kitchens, and preparing food." },
  printen: { zh: "打印文件、表格、办事材料。", en: "printing documents, forms, and official papers." },
  scannen: { zh: "扫描文件、上传材料、办事流程。", en: "scanning documents, uploading files, and admin tasks." },
  downloaden: { zh: "下载文件、表格、应用或附件。", en: "downloading files, forms, apps, or attachments." },
  uploaden: { zh: "上传文件、表格、证明或附件。", en: "uploading files, forms, proof, or attachments." },
  auto: { zh: "交通、出行、说怎么去一个地方。", en: "transport, travel, and saying how you go somewhere." },
  halte: { zh: "公交/电车站点、问路、出行。", en: "bus/tram stops, directions, and travel." },
  station: { zh: "车站、问路、坐火车或换乘。", en: "stations, directions, taking trains, and transfers." },
  vakantie: { zh: "假期、休闲计划、学校或工作休假。", en: "holidays, leisure plans, and school or work time off." },
  duwen: { zh: "公共标识、门口提示、推/拉动作。", en: "public signs, doors, and push/pull actions." },
  trekken: { zh: "公共标识、门口提示、推/拉动作。", en: "public signs, doors, and push/pull actions." },
  ingang: { zh: "公共场所、找入口、问路。", en: "public places, finding entrances, and directions." },
  uitgang: { zh: "公共场所、找出口、离开建筑。", en: "public places, finding exits, and leaving buildings." },
  nooduitgang: { zh: "公共标识、安全提示、紧急出口。", en: "public signs, safety notices, and emergency exits." },
  verboden: { zh: "公共标识、规则、禁止事项。", en: "public signs, rules, and things that are not allowed." },
  toegestaan: { zh: "公共标识、规则、允许事项。", en: "public signs, rules, and what is allowed." },
};

const usageByTag: Record<string, LocalizedText> = {
  "public-signs": { zh: "公共标识、规则、入口出口、推拉提示。", en: "public signs, rules, entrances/exits, and push/pull notices." },
  "leisure-expanded": { zh: "休闲、爱好、假期和日常活动。", en: "leisure, hobbies, holidays, and daily activities." },
  leisure: { zh: "休闲、爱好、假期和日常活动。", en: "leisure, hobbies, holidays, and daily activities." },
  travel: { zh: "旅行、订票、路线和出行计划。", en: "travel, tickets, routes, and travel plans." },
  transport: { zh: "交通、车站、买票或出行场景。", en: "transport, station, ticket, or travel contexts." },
  directions: { zh: "问路、找地点、入口出口。", en: "directions, finding places, entrances, and exits." },
  supermarket: { zh: "购物、超市、付款场景。", en: "shopping, supermarket, or payment contexts." },
  shopping: { zh: "购物、超市、付款场景。", en: "shopping, supermarket, or payment contexts." },
  "food-drinks": { zh: "吃喝、点餐、说饮食习惯。", en: "food, drinks, ordering, and eating habits." },
  food: { zh: "吃喝、点餐、说饮食习惯。", en: "food, drinks, ordering, and eating habits." },
  routine: { zh: "日常作息、每天做什么。", en: "daily routine and what you do each day." },
  health: { zh: "看病、预约、药房或身体不舒服场景。", en: "doctor, appointment, pharmacy, or illness contexts." },
  "personal-info": { zh: "自我介绍、填表、个人信息场景。", en: "introductions, forms, and personal information." },
  identity: { zh: "自我介绍、个人身份和基本信息。", en: "introductions, identity, and basic personal details." },
  form: { zh: "表格、文件、填写和提交材料。", en: "forms, documents, filling in, and submitting materials." },
  gemeente: { zh: "市政厅、表格、文件办理场景。", en: "municipality, forms, and document handling." },
  language: { zh: "语言能力、学习、翻译或沟通场景。", en: "language ability, learning, translation, or communication." },
  languages: { zh: "语言能力、学习、翻译或沟通场景。", en: "language ability, learning, translation, or communication." },
  work: { zh: "工作、同事、请假或合同场景。", en: "work, colleagues, sick leave, or contracts." },
  education: { zh: "学校、课程、培训和学习安排。", en: "school, lessons, training, and study plans." },
  school: { zh: "学校、课堂、作业和学习安排。", en: "school, class, homework, and study plans." },
  housing: { zh: "住房、租房、搬家和维修。", en: "housing, renting, moving, and repairs." },
  appointment: { zh: "预约、改时间、取消或确认安排。", en: "appointments, rescheduling, cancelling, or confirming plans." },
  bill: { zh: "账单、付款、金额和费用。", en: "bills, payments, amounts, and costs." },
  payment: { zh: "付款、价格、账单和收据。", en: "payment, prices, bills, and receipts." },
  insurance: { zh: "保险、账单、报销或保障范围。", en: "insurance, bills, reimbursement, or coverage." },
  email: { zh: "邮件、附件、回复和书面沟通。", en: "email, attachments, replies, and written communication." },
  "phone-call": { zh: "电话、留言、回电和口头沟通。", en: "phone calls, messages, call-backs, and spoken contact." },
  complaint: { zh: "投诉、说明问题、维修或求助。", en: "complaints, explaining problems, repairs, or asking for help." },
  help: { zh: "求助、说明问题、请别人帮忙。", en: "asking for help, explaining problems, and getting assistance." },
  digital: { zh: "网站、应用、账号、上传下载和在线办理。", en: "websites, apps, accounts, uploads/downloads, and online tasks." },
  safety: { zh: "安全规则、紧急情况和公共提示。", en: "safety rules, emergencies, and public notices." },
  time: { zh: "约时间、填日期、说日程。", en: "appointments, dates, and schedules." },
  family: { zh: "家庭、亲属、孩子和日常照顾。", en: "family, relatives, children, and daily care." },
  media: { zh: "新闻、媒体、信息和阅读。", en: "news, media, information, and reading." },
  society: { zh: "社区、公共生活、邻里和社会话题。", en: "community, public life, neighborhoods, and social topics." },
  neighborhood: { zh: "邻里、社区活动和公共生活。", en: "neighborhoods, community activities, and public life." },
};

function usageFromTags(word: WordItem) {
  const tags = [word.dutch, word.theme, ...word.scenarioTags].map(normalizeWordText).filter(Boolean);
  const byExactTag = tags.map((tag) => usageByTag[tag]).find(Boolean);
  if (byExactTag) return byExactTag;
  if (tags.some((tag) => tag.includes("leisure") || tag.includes("hobby"))) return usageByTag.leisure;
  if (tags.some((tag) => tag.includes("public") || tag.includes("sign"))) return usageByTag["public-signs"];
  if (tags.some((tag) => tag.includes("transport") || tag.includes("train"))) return usageByTag.transport;
  if (tags.some((tag) => tag.includes("shopping") || tag.includes("supermarket") || tag.includes("food"))) return usageByTag.shopping;
  if (tags.some((tag) => tag.includes("health") || tag.includes("pharmacy") || tag.includes("body"))) return usageByTag.health;
  if (tags.some((tag) => tag.includes("form") || tag.includes("document"))) return usageByTag.form;
  if (tags.some((tag) => tag.includes("work") || tag.includes("job"))) return usageByTag.work;
  if (tags.some((tag) => tag.includes("housing") || tag.includes("rent"))) return usageByTag.housing;
  if (tags.some((tag) => tag.includes("email") || tag.includes("letter"))) return usageByTag.email;
  if (tags.some((tag) => tag.includes("phone"))) return usageByTag["phone-call"];
  return { zh: "日常生活、办事或真实对话里的高频用法。", en: "high-frequency use in daily life, practical tasks, or real conversations." };
}

export function usageAnchorFor(word: WordItem, strategyUsage?: { zh?: string; en?: string }) {
  const fallbackUsage = usageAnchorOverrides[normalizeWordText(word.dutch)] ?? usageFromTags(word);
  if (strategyUsage?.zh || strategyUsage?.en) {
    return {
      zh: strategyUsage.zh?.trim() || fallbackUsage.zh,
      en: strategyUsage.en?.trim() || fallbackUsage.en,
    };
  }
  const key = normalizeWordText(word.dutch);
  const seededUsage = usageAnchorOverrides[key];
  if (seededUsage) return seededUsage;
  const tags = new Set(word.scenarioTags.map(normalizeWordText));
  if (tags.has("food-drinks")) return { zh: "吃喝、点餐、说饮食习惯。", en: "food, drinks, ordering, and eating habits." };
  if (tags.has("routine")) return { zh: "日常作息、每天做什么。", en: "daily routine and what you do each day." };
  if (tags.has("health")) return { zh: "看病、预约、药房或身体不舒服场景。", en: "doctor, appointment, pharmacy, or illness contexts." };
  if (tags.has("shopping") || tags.has("supermarket")) return { zh: "购物、超市、付款场景。", en: "shopping, supermarket, or payment contexts." };
  if (tags.has("transport")) return { zh: "交通、车站、买票或出行场景。", en: "transport, station, ticket, or travel contexts." };
  if (tags.has("personal-info") || tags.has("identity")) return { zh: "自我介绍、填表、个人信息场景。", en: "introductions, forms, and personal information." };
  if (tags.has("form") || tags.has("gemeente")) return { zh: "市政厅、表格、文件办理场景。", en: "municipality, forms, and document handling." };
  if (tags.has("language")) return { zh: "语言能力、学习、翻译或沟通场景。", en: "language ability, learning, translation, or communication." };
  if (tags.has("work")) return { zh: "工作、同事、请假或合同场景。", en: "work, colleagues, sick leave, or contracts." };
  if (["prima", "goed", "fijn", "oké", "oke"].includes(key)) {
    return { zh: "回应别人、评价情况、确认安排。", en: "responding, evaluating a situation, or confirming plans." };
  }
  return fallbackUsage;
}
