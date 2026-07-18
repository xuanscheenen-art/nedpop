"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { SentencePattern } from "@/types/course";
import { useLanguage } from "@/lib/i18n";

type WordOrderRule = {
  id: string;
  level: "A1" | "A2" | "B1";
  titleZh: string;
  titleEn: string;
  coreZh: string;
  coreEn: string;
  formulaZh: string;
  formulaEn: string;
  blocks: string[];
  correct: string;
  wrong: string;
  whyZh: string;
  whyEn: string;
  memoryZh: string;
  memoryEn: string;
};

type PracticeQuestion = {
  id: string;
  ruleId: string;
  questionZh: string;
  questionEn: string;
  options: string[];
  answer: string;
  explanationZh: string;
  explanationEn: string;
};

const wordOrderRules: WordOrderRule[] = [
  {
    id: "main-v2",
    level: "A1",
    titleZh: "主句 V2：动词站第二位",
    titleEn: "Main Clause V2: Verb in Position 2",
    coreZh: "普通陈述句里，限定动词要站在第二位置。",
    coreEn: "In a normal statement, the finite verb takes position 2.",
    formulaZh: "位置 1 + 动词 + 其他",
    formulaEn: "position 1 + verb + the rest",
    blocks: ["Ik", "ga", "morgen", "naar school"],
    correct: "Ik ga morgen naar school.",
    wrong: "Ik morgen ga naar school.",
    whyZh: "荷兰语主句很重视“第二位置”。中文可以按“谁 + 什么时候 + 做什么”来排，但荷兰语先锁定会变的动词位置：Ik 是位置 1，ga 必须是位置 2，后面再放时间和地点。",
    whyEn: "Dutch main clauses strongly protect position 2. Chinese can arrange who + when + action, but Dutch first locks the finite verb: Ik is position 1, ga must be position 2, then time and place follow.",
    memoryZh: "先找会变的动词，它要站第二。",
    memoryEn: "Find the changing verb first; it wants position 2.",
  },
  {
    id: "time-first",
    level: "A1",
    titleZh: "时间放前面：主语要让位",
    titleEn: "Time First: Subject Moves After Verb",
    coreZh: "如果 morgen/vandaag 站在第一位，动词仍然第二位，所以 ik 要到动词后面。",
    coreEn: "If morgen/vandaag takes position 1, the verb is still position 2, so ik moves after the verb.",
    formulaZh: "时间 + 动词 + 主语 + 其他",
    formulaEn: "time + verb + subject + the rest",
    blocks: ["Morgen", "ga", "ik", "naar school"],
    correct: "Morgen ga ik naar school.",
    wrong: "Morgen ik ga naar school.",
    whyZh: "把时间放到句首是为了强调“明天”。但 Morgen 已经占了位置 1，动词 ga 仍然要守住位置 2，所以主语 ik 只能移到 ga 后面。",
    whyEn: "Putting Morgen first emphasizes tomorrow. But Morgen has taken position 1, and ga still keeps position 2, so the subject ik moves after ga.",
    memoryZh: "时间先来，动词不退。",
    memoryEn: "Time can come first, but the verb does not move back.",
  },
  {
    id: "yes-no-question",
    level: "A1",
    titleZh: "是/不是问句：动词直接开头",
    titleEn: "Yes/No Questions: Verb First",
    coreZh: "问是不是、有没有、去不去时，把限定动词放到句首。",
    coreEn: "For yes/no questions, put the finite verb first.",
    formulaZh: "动词 + 主语 + 其他?",
    formulaEn: "verb + subject + the rest?",
    blocks: ["Ga", "jij", "morgen", "naar school?"],
    correct: "Ga jij morgen naar school?",
    wrong: "Jij gaat morgen naar school?",
    whyZh: "yes/no 问句没有疑问词，所以荷兰语直接把会变的动词提到最前面。还要注意 jij/je 在动词后面时，末尾的 t 会掉下来：ga jij，不是 gaat jij。",
    whyEn: "A yes/no question has no question word, so Dutch moves the finite verb to the front. Also, when jij/je comes after the verb, the final t drops: ga jij, not gaat jij.",
    memoryZh: "问是不是，动词先出门。",
    memoryEn: "For yes/no questions, the verb walks out first.",
  },
  {
    id: "question-word",
    level: "A1",
    titleZh: "疑问词问句：疑问词第一，动词第二",
    titleEn: "Question Word: Question Word First, Verb Second",
    coreZh: "waar/wanneer/hoe/wat 放第一位，动词还是第二位。",
    coreEn: "waar/wanneer/hoe/wat takes position 1, and the verb still takes position 2.",
    formulaZh: "疑问词 + 动词 + 主语 + 其他?",
    formulaEn: "question word + verb + subject + the rest?",
    blocks: ["Wanneer", "ga", "jij", "naar school?"],
    correct: "Wanneer ga jij naar school?",
    wrong: "Wanneer jij gaat naar school?",
    whyZh: "疑问词 wanneer 已经是位置 1。荷兰语主句仍然要求动词第二，所以要 Wanneer ga jij...，不能按中文“什么时候你去”直译成 Wanneer jij gaat。",
    whyEn: "The question word wanneer is position 1. Dutch still requires the verb in position 2, so it is Wanneer ga jij..., not a word-for-word order like Wanneer jij gaat.",
    memoryZh: "疑问词占第一，动词紧跟第二。",
    memoryEn: "The question word takes first place; the verb follows second.",
  },
  {
    id: "time-place",
    level: "A1",
    titleZh: "时间地点：先时间，再地点",
    titleEn: "Time and Place: Time Before Place",
    coreZh: "基础句里常用：谁 + 动词 + 时间 + 地点。",
    coreEn: "A common basic order is: who + verb + time + place.",
    formulaZh: "主语 + 动词 + 时间 + 地点",
    formulaEn: "subject + verb + time + place",
    blocks: ["Ik", "werk", "vandaag", "thuis"],
    correct: "Ik werk vandaag thuis.",
    wrong: "Ik werk thuis vandaag.",
    whyZh: "荷兰语里时间和地点都可以移动，但 A1 先用最稳的顺序：先说什么时候，再说在哪里。这样句子更容易被听懂，也方便之后学习更复杂的变化。",
    whyEn: "Dutch can move time and place around, but at A1 the safest order is when before where. It is easier to understand and prepares you for more complex variations later.",
    memoryZh: "先说什么时候，再说在哪里。",
    memoryEn: "Say when first, then where.",
  },
  {
    id: "modal-end",
    level: "A2",
    titleZh: "情态动词：主要动词去句尾",
    titleEn: "Modal Verbs: Main Verb Goes to the End",
    coreZh: "wil/moet/kan 放第二位，真正要做的动作放句尾。",
    coreEn: "wil/moet/kan is in position 2; the main action goes to the end.",
    formulaZh: "主语 + 情态动词 + 其他 + 动词原形",
    formulaEn: "subject + modal + the rest + infinitive",
    blocks: ["Ik", "wil", "een afspraak", "maken"],
    correct: "Ik wil een afspraak maken.",
    wrong: "Ik wil maken een afspraak.",
    whyZh: "情态动词 wil/moet/kan 自己会变，所以它占第二位。真正的动作 maken 不再变形，像一个“动词原形尾巴”放到句尾。",
    whyEn: "The modal wil/moet/kan changes form, so it takes position 2. The real action maken no longer changes and moves to the end as an infinitive.",
    memoryZh: "想/能/必须先说，真正动作压到最后。",
    memoryEn: "Say want/can/must early; push the real action to the end.",
  },
  {
    id: "subordinate-because",
    level: "A2",
    titleZh: "omdat 从句：动词去最后",
    titleEn: "Omdat Clause: Verb Goes to the End",
    coreZh: "omdat 后面是从句，从句里的动词常常去最后。",
    coreEn: "After omdat, the clause is subordinate, and the verb often goes to the end.",
    formulaZh: "omdat + 主语 + 其他 + 动词",
    formulaEn: "omdat + subject + the rest + verb",
    blocks: ["omdat", "ik", "ziek", "ben"],
    correct: "Ik kom niet, omdat ik ziek ben.",
    wrong: "Ik kom niet, omdat ik ben ziek.",
    whyZh: "omdat 会打开一个从句。从句不是普通主句，所以不再用 V2。中文会说“因为我生病”，但荷兰语从句要把动词 ben 推到最后：omdat ik ziek ben。",
    whyEn: "Omdat opens a subordinate clause. It is not a normal main clause, so V2 no longer applies. The verb ben is pushed to the end: omdat ik ziek ben.",
    memoryZh: "看到 omdat，动词往后站。",
    memoryEn: "When you see omdat, the verb steps back.",
  },
  {
    id: "separable",
    level: "A2",
    titleZh: "可分动词：小尾巴去句尾",
    titleEn: "Separable Verbs: Prefix Goes to the End",
    coreZh: "opbellen 这类动词会拆开：bel ... op。",
    coreEn: "Verbs like opbellen split: bel ... op.",
    formulaZh: "主语 + 动词主体 + 其他 + 前缀",
    formulaEn: "subject + verb stem + the rest + prefix",
    blocks: ["Ik", "bel", "de huisarts", "op"],
    correct: "Ik bel de huisarts op.",
    wrong: "Ik opbel de huisarts.",
    whyZh: "可分动词像一个带小尾巴的动词。主句里会变的部分 bel 站第二位，小尾巴 op 被放到句尾，所以是 bel ... op。",
    whyEn: "A separable verb works like a verb with a small tail. In the main clause, the changing part bel takes position 2, and the prefix op goes to the end.",
    memoryZh: "可分动词的小尾巴，常常跑到最后。",
    memoryEn: "The small separable prefix often runs to the end.",
  },
  {
    id: "niet-place",
    level: "A1",
    titleZh: "niet 的位置：放在被否定信息前/后",
    titleEn: "Niet Placement: Near What You Negate",
    coreZh: "A1 先记常用块：niet + 形容词，地点/时间后面常放 niet。",
    coreEn: "At A1, learn common chunks: niet + adjective; after place/time in many simple sentences.",
    formulaZh: "主语 + 动词 + 信息 + niet",
    formulaEn: "subject + verb + information + niet",
    blocks: ["Ik", "woon", "hier", "niet"],
    correct: "Ik woon hier niet.",
    wrong: "Ik niet woon hier.",
    whyZh: "中文“不”常常放在动词前，但荷兰语 niet 不这样直接放。A1 先把常见句块记住：地点/时间信息之后放 niet，例如 Ik woon hier niet。",
    whyEn: "Chinese often puts 'not' before the verb, but Dutch niet is not placed that way. At A1, learn common chunks: after place/time information, e.g. Ik woon hier niet.",
    memoryZh: "不是中文“不”直接放动词前。",
    memoryEn: "Dutch niet is not placed like Chinese bu before the verb.",
  },
  {
    id: "toen-past",
    level: "B1",
    titleZh: "toen 从句：过去某一刻",
    titleEn: "Toen Clause: A Past Moment",
    coreZh: "toen 用在过去的一次事件或过去一段时期；它打开从句，从句动词放后面。",
    coreEn: "Toen is used for one past event or a past period; it opens a subordinate clause, so the verb goes back.",
    formulaZh: "toen + 主语 + 其他 + 动词, 主句",
    formulaEn: "toen + subject + rest + verb, main clause",
    blocks: ["Toen", "ik", "thuiskwam,", "had", "ik", "al betaald"],
    correct: "Toen ik thuiskwam, had ik al betaald.",
    wrong: "Toen ik kwam thuis, had ik al betaald.",
    whyZh: "toen 不是普通时间词随便插进去。它打开一个过去时间从句，所以 thuiskwam 要收在从句末尾。因为从句放在前面，后面的主句直接用 had 接上。",
    whyEn: "Toen is not just a loose time word. It opens a past-time subordinate clause, so thuiskwam closes that clause. Because the subordinate clause comes first, the main clause starts with had.",
    memoryZh: "toen = 过去那一刻；从句动词收尾。",
    memoryEn: "toen = that past moment; close the clause with the verb.",
  },
  {
    id: "toen-als-wanneer",
    level: "B1",
    titleZh: "toen / als / wanneer：别都翻成 when",
    titleEn: "toen / als / wanneer: not one when",
    coreZh: "toen 指过去特定时间；als 常表示如果/每当；wanneer 常用于提问或较正式的什么时候。",
    coreEn: "Toen marks a specific past time; als often means if/whenever; wanneer asks or states when more formally.",
    formulaZh: "过去那时 = toen · 条件/每当 = als · 问时间 = wanneer",
    formulaEn: "past then = toen · if/whenever = als · asking when = wanneer",
    blocks: ["Toen", "ik", "klein", "was,", "woonde", "ik", "in Utrecht"],
    correct: "Toen ik klein was, woonde ik in Utrecht.",
    wrong: "Als ik klein was, woonde ik in Utrecht.",
    whyZh: "这里说的是过去一段具体人生时期，不是“如果我小”或“每当我小”。所以用 toen。als 更像条件或重复情况；wanneer 更像问什么时候。",
    whyEn: "This refers to one specific past life period, not if I was little or whenever I was little. Use toen. Als is more conditional/repeated; wanneer asks when.",
    memoryZh: "过去那时用 toen；如果/每当用 als。",
    memoryEn: "Use toen for that past time; als for if/whenever.",
  },
  {
    id: "while-sequence",
    level: "B1",
    titleZh: "terwijl / nadat / voordat：时间关系从句",
    titleEn: "terwijl / nadat / voordat: time-relation clauses",
    coreZh: "terwijl 表示同时；nadat 表示之后；voordat 表示之前。它们都打开从句，动词去后面。",
    coreEn: "Terwijl means while; nadat means after; voordat means before. They open subordinate clauses, so the verb goes back.",
    formulaZh: "连接词 + 主语 + 其他 + 动词",
    formulaEn: "connector + subject + rest + verb",
    blocks: ["Nadat", "ik", "de brief", "had gelezen,", "belde", "ik", "de gemeente"],
    correct: "Nadat ik de brief had gelezen, belde ik de gemeente.",
    wrong: "Nadat ik had gelezen de brief, belde ik de gemeente.",
    whyZh: "B1 写邮件和讲事情经过时，经常要说先后。nadat 打开从句，had gelezen 作为动词组收在从句后面；后面的主句 belde 保持 V2。",
    whyEn: "At B1, emails and narratives often need sequence. Nadat opens the subordinate clause, had gelezen closes it as the verb group; the main clause keeps V2 with belde.",
    memoryZh: "先后同时看连接词；从句动词往后收。",
    memoryEn: "Use the connector for timing; push subordinate verbs back.",
  },
  {
    id: "cause-result-b1",
    level: "B1",
    titleZh: "doordat / daardoor：原因和结果",
    titleEn: "doordat / daardoor: cause and result",
    coreZh: "doordat 后面接原因从句；daardoor 放在主句里表示结果，后面仍然按 V2。",
    coreEn: "Doordat introduces a cause clause; daardoor sits in a main clause for the result, so V2 still applies.",
    formulaZh: "doordat + 从句；daardoor + 动词 + 主语",
    formulaEn: "doordat + subclause; daardoor + verb + subject",
    blocks: ["Daardoor", "kwam", "ik", "te laat"],
    correct: "De trein viel uit, daardoor kwam ik te laat.",
    wrong: "De trein viel uit, daardoor ik kwam te laat.",
    whyZh: "daardoor 是结果副词，不是 omdat 那种从属连词。它放在第一位时，主句仍然要 V2：kwam 第二位，ik 到后面。",
    whyEn: "Daardoor is a result adverb, not a subordinating conjunction like omdat. When it takes position 1, the main clause still uses V2: kwam is second, ik follows.",
    memoryZh: "doordat 推动词；daardoor 还守 V2。",
    memoryEn: "doordat pushes verbs back; daardoor keeps V2.",
  },
];

const practiceQuestions: PracticeQuestion[] = [
  {
    id: "q-v2",
    ruleId: "main-v2",
    questionZh: "“明天我去学校”哪个正确？",
    questionEn: "Which is correct for “Tomorrow I go to school”?",
    options: ["Morgen ga ik naar school.", "Morgen ik ga naar school.", "Morgen naar school ik ga."],
    answer: "Morgen ga ik naar school.",
    explanationZh: "Morgen 是第一位，ga 必须第二位。",
    explanationEn: "Morgen is position 1, so ga must be position 2.",
  },
  {
    id: "q-v2-2",
    ruleId: "main-v2",
    questionZh: "“我今天工作”哪个正确？",
    questionEn: "Which is correct for “I work today”?",
    options: ["Ik werk vandaag.", "Ik vandaag werk.", "Werk ik vandaag."],
    answer: "Ik werk vandaag.",
    explanationZh: "普通陈述句里，Ik 第一位，werk 第二位。",
    explanationEn: "In a normal statement, Ik is position 1 and werk is position 2.",
  },
  {
    id: "q-time-first",
    ruleId: "time-first",
    questionZh: "时间放前面时，哪个正确？",
    questionEn: "When time comes first, which sentence is correct?",
    options: ["Vandaag werk ik thuis.", "Vandaag ik werk thuis.", "Vandaag thuis werk ik."],
    answer: "Vandaag werk ik thuis.",
    explanationZh: "Vandaag 占第一位，werk 仍然第二位，所以 ik 在 werk 后面。",
    explanationEn: "Vandaag takes position 1, werk stays position 2, so ik comes after werk.",
  },
  {
    id: "q-time-first-2",
    ruleId: "time-first",
    questionZh: "“今晚我打电话”哪个正确？",
    questionEn: "Which is correct for “Tonight I call”?",
    options: ["Vanavond bel ik.", "Vanavond ik bel.", "Ik vanavond bel."],
    answer: "Vanavond bel ik.",
    explanationZh: "Vanavond 是第一位，bel 是第二位。",
    explanationEn: "Vanavond is position 1, bel is position 2.",
  },
  {
    id: "q-question",
    ruleId: "yes-no-question",
    questionZh: "Yes/no 问句哪个正确？",
    questionEn: "Which yes/no question is correct?",
    options: ["Ga jij morgen?", "Jij gaat morgen?", "Gaat jij morgen?"],
    answer: "Ga jij morgen?",
    explanationZh: "问句动词开头；jij 在动词后面时，gaat 变 ga。",
    explanationEn: "The verb starts the question; with jij after the verb, gaat becomes ga.",
  },
  {
    id: "q-question-2",
    ruleId: "yes-no-question",
    questionZh: "“你住在 Utrecht 吗？”哪个正确？",
    questionEn: "Which is correct for “Do you live in Utrecht?”",
    options: ["Woon je in Utrecht?", "Je woont in Utrecht?", "Woont je in Utrecht?"],
    answer: "Woon je in Utrecht?",
    explanationZh: "yes/no 问句动词在前；je 在后面时，woont 变 woon。",
    explanationEn: "In a yes/no question the verb comes first; with je after it, woont becomes woon.",
  },
  {
    id: "q-question-word",
    ruleId: "question-word",
    questionZh: "疑问词问句哪个正确？",
    questionEn: "Which question-word sentence is correct?",
    options: ["Waar woon jij?", "Waar jij woont?", "Waar woont jij?"],
    answer: "Waar woon jij?",
    explanationZh: "Waar 第一位，woon 第二位；jij 在动词后面，t 掉下来。",
    explanationEn: "Waar is position 1, woon is position 2; with jij after the verb, the t drops.",
  },
  {
    id: "q-question-word-2",
    ruleId: "question-word",
    questionZh: "“你什么时候来？”哪个正确？",
    questionEn: "Which is correct for “When are you coming?”",
    options: ["Wanneer kom je?", "Wanneer je komt?", "Wanneer komt je?"],
    answer: "Wanneer kom je?",
    explanationZh: "Wanneer 是疑问词第一位，kom 是第二位。",
    explanationEn: "Wanneer is the question word in position 1, kom is position 2.",
  },
  {
    id: "q-time-place",
    ruleId: "time-place",
    questionZh: "A1 稳定顺序哪个更好？",
    questionEn: "Which is the safer A1 order?",
    options: ["Ik ga morgen naar de huisarts.", "Ik ga naar de huisarts morgen.", "Ik morgen ga naar de huisarts."],
    answer: "Ik ga morgen naar de huisarts.",
    explanationZh: "A1 先用：主语 + 动词 + 时间 + 地点。",
    explanationEn: "At A1, use: subject + verb + time + place.",
  },
  {
    id: "q-time-place-2",
    ruleId: "time-place",
    questionZh: "“我今天在家学习”哪个正确？",
    questionEn: "Which is correct for “I study at home today”?",
    options: ["Ik leer vandaag thuis.", "Ik leer thuis vandaag.", "Ik vandaag leer thuis."],
    answer: "Ik leer vandaag thuis.",
    explanationZh: "基础顺序：leer 第二位，vandaag 在 thuis 前面。",
    explanationEn: "Basic order: leer in position 2, vandaag before thuis.",
  },
  {
    id: "q-modal",
    ruleId: "modal-end",
    questionZh: "“我想预约”哪个正确？",
    questionEn: "Which is correct for “I want to make an appointment”?",
    options: ["Ik wil een afspraak maken.", "Ik wil maken een afspraak.", "Ik een afspraak wil maken."],
    answer: "Ik wil een afspraak maken.",
    explanationZh: "wil 第二位，maken 去句尾。",
    explanationEn: "wil is position 2, maken goes to the end.",
  },
  {
    id: "q-modal-2",
    ruleId: "modal-end",
    questionZh: "“我必须填表”哪个正确？",
    questionEn: "Which is correct for “I must fill in a form”?",
    options: ["Ik moet een formulier invullen.", "Ik moet invullen een formulier.", "Ik invullen moet een formulier."],
    answer: "Ik moet een formulier invullen.",
    explanationZh: "moet 第二位，真正动作 invullen 去句尾。",
    explanationEn: "moet is position 2, the real action invullen goes to the end.",
  },
  {
    id: "q-omdat",
    ruleId: "subordinate-because",
    questionZh: "omdat 从句哪个正确？",
    questionEn: "Which omdat clause is correct?",
    options: ["omdat ik ziek ben", "omdat ik ben ziek", "omdat ben ik ziek"],
    answer: "omdat ik ziek ben",
    explanationZh: "omdat 后面动词 ben 放到从句最后。",
    explanationEn: "After omdat, ben goes to the end of the subordinate clause.",
  },
  {
    id: "q-omdat-2",
    ruleId: "subordinate-because",
    questionZh: "“因为我今天工作”哪个从句正确？",
    questionEn: "Which clause is correct for “because I work today”?",
    options: ["omdat ik vandaag werk", "omdat ik werk vandaag", "omdat werk ik vandaag"],
    answer: "omdat ik vandaag werk",
    explanationZh: "omdat 从句里，werk 放到从句最后。",
    explanationEn: "In an omdat clause, werk goes to the end of the clause.",
  },
  {
    id: "q-separable",
    ruleId: "separable",
    questionZh: "opbellen 的主句哪个正确？",
    questionEn: "Which main clause with opbellen is correct?",
    options: ["Ik bel de huisarts op.", "Ik opbel de huisarts.", "Ik bel op de huisarts."],
    answer: "Ik bel de huisarts op.",
    explanationZh: "opbellen 拆成 bel ... op。",
    explanationEn: "opbellen splits into bel ... op.",
  },
  {
    id: "q-separable-2",
    ruleId: "separable",
    questionZh: "“我早起”哪个正确？",
    questionEn: "Which is correct for “I get up early”?",
    options: ["Ik sta vroeg op.", "Ik opsta vroeg.", "Ik sta op vroeg."],
    answer: "Ik sta vroeg op.",
    explanationZh: "opstaan 拆成 sta ... op，小尾巴 op 去句尾。",
    explanationEn: "opstaan splits into sta ... op; the prefix op goes to the end.",
  },
  {
    id: "q-niet",
    ruleId: "niet-place",
    questionZh: "niet 的位置哪个更自然？",
    questionEn: "Which niet placement is more natural?",
    options: ["Ik woon hier niet.", "Ik niet woon hier.", "Niet ik woon hier."],
    answer: "Ik woon hier niet.",
    explanationZh: "先记常用块：Ik woon hier niet。",
    explanationEn: "Learn the common chunk: Ik woon hier niet.",
  },
  {
    id: "q-niet-2",
    ruleId: "niet-place",
    questionZh: "“我今天不工作”哪个更自然？",
    questionEn: "Which is more natural for “I do not work today”?",
    options: ["Ik werk vandaag niet.", "Ik niet werk vandaag.", "Niet ik werk vandaag."],
    answer: "Ik werk vandaag niet.",
    explanationZh: "A1 先记：时间信息后面放 niet。不是按中文把“不”放动词前。",
    explanationEn: "At A1, learn: niet after the time information. Do not place it like Chinese before the verb.",
  },
  {
    id: "q-toen-1",
    ruleId: "toen-past",
    questionZh: "toen 从句哪个正确？",
    questionEn: "Which toen clause is correct?",
    options: ["Toen ik thuiskwam, had ik al betaald.", "Toen ik kwam thuis, had ik al betaald.", "Toen had ik thuiskwam al betaald."],
    answer: "Toen ik thuiskwam, had ik al betaald.",
    explanationZh: "toen 从句里 thuiskwam 收在从句末尾；主句 had 接上。",
    explanationEn: "In the toen clause, thuiskwam closes the clause; the main clause starts with had.",
  },
  {
    id: "q-toen-2",
    ruleId: "toen-als-wanneer",
    questionZh: "“我小时候住在 Utrecht”哪个更对？",
    questionEn: "Which is better for “When I was little, I lived in Utrecht”?",
    options: ["Toen ik klein was, woonde ik in Utrecht.", "Als ik klein was, woonde ik in Utrecht.", "Wanneer ik klein was, woonde ik in Utrecht."],
    answer: "Toen ik klein was, woonde ik in Utrecht.",
    explanationZh: "这里是过去一段具体时期，用 toen。",
    explanationEn: "This is a specific past period, so use toen.",
  },
  {
    id: "q-sequence-b1",
    ruleId: "while-sequence",
    questionZh: "nadat 从句哪个正确？",
    questionEn: "Which nadat clause is correct?",
    options: ["Nadat ik de brief had gelezen, belde ik de gemeente.", "Nadat ik had gelezen de brief, belde ik de gemeente.", "Nadat had ik de brief gelezen, belde ik de gemeente."],
    answer: "Nadat ik de brief had gelezen, belde ik de gemeente.",
    explanationZh: "nadat 从句里动词组 had gelezen 收在后面。",
    explanationEn: "In the nadat clause, the verb group had gelezen goes to the end.",
  },
  {
    id: "q-cause-result-b1",
    ruleId: "cause-result-b1",
    questionZh: "daardoor 主句哪个正确？",
    questionEn: "Which daardoor main clause is correct?",
    options: ["Daardoor kwam ik te laat.", "Daardoor ik kwam te laat.", "Daardoor te laat kwam ik."],
    answer: "Daardoor kwam ik te laat.",
    explanationZh: "Daardoor 第一位，kwam 第二位，主语 ik 在动词后面。",
    explanationEn: "Daardoor takes position 1, kwam is position 2, and subject ik follows the verb.",
  },
];

function WordBlock({ text, index, highlight }: { text: string; index: number; highlight?: boolean }) {
  return (
    <span className={`rounded-2xl px-4 py-3 text-sm font-black ${highlight ? "bg-pop text-ink" : "bg-white text-ocean"}`}>
      <span className="mr-2 text-xs opacity-70">P{index + 1}</span>
      {text}
    </span>
  );
}

function RuleCard({ rule }: { rule: WordOrderRule }) {
  const { language } = useLanguage();

  return (
    <article className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-skywash px-3 py-1 text-xs font-black text-ocean">{rule.level}</span>
          <h4 className="mt-3 text-2xl font-black leading-tight text-ink">{language === "zh" ? rule.titleZh : rule.titleEn}</h4>
          <p className="mt-2 font-bold leading-7 text-ocean/70">{language === "zh" ? rule.coreZh : rule.coreEn}</p>
        </div>
        <span className="rounded-full bg-peach px-3 py-1 text-xs font-black text-pop">
          {language === "zh" ? rule.formulaZh : rule.formulaEn}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 rounded-[24px] bg-skywash p-4">
        {rule.blocks.map((block, index) => (
          <WordBlock key={`${rule.id}-${block}-${index}`} text={block} index={index} highlight={index === 1 || rule.id === "yes-no-question" && index === 0} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-mint p-4">
          <p className="flex items-center gap-2 text-sm font-black text-ocean"><CheckCircle2 size={16} />Correct</p>
          <p className="mt-2 text-xl font-black text-ink">{rule.correct}</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-red-700"><XCircle size={16} />Wrong</p>
          <p className="mt-2 text-xl font-black text-red-800">{rule.wrong}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
        <p className="rounded-2xl bg-slate-50 p-4 font-bold leading-7 text-ocean">{language === "zh" ? rule.whyZh : rule.whyEn}</p>
        <p className="rounded-2xl bg-peach p-4 font-black leading-7 text-ink">{language === "zh" ? rule.memoryZh : rule.memoryEn}</p>
      </div>
    </article>
  );
}

export function SentenceOrderTrainer({ patterns: _patterns }: { patterns: SentencePattern[] }) {
  const { t, language } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<"all" | "A1" | "A2" | "B1">("all");
  const [activeRuleId, setActiveRuleId] = useState(wordOrderRules[0].id);

  const visibleRules = useMemo(
    () => wordOrderRules.filter((rule) => levelFilter === "all" || rule.level === levelFilter),
    [levelFilter],
  );
  const activeRule = visibleRules.find((rule) => rule.id === activeRuleId) ?? visibleRules[0] ?? wordOrderRules[0];
  const activeRuleIndex = Math.max(visibleRules.findIndex((rule) => rule.id === activeRule.id), 0);
  const activePractice = practiceQuestions.filter((question) => question.ruleId === activeRule.id);

  const chooseLevel = (level: "all" | "A1" | "A2" | "B1") => {
    const nextRules = wordOrderRules.filter((rule) => level === "all" || rule.level === level);
    setLevelFilter(level);
    setActiveRuleId(nextRules[0]?.id ?? wordOrderRules[0].id);
  };

  const moveRule = (direction: -1 | 1) => {
    const nextRule = visibleRules[Math.min(Math.max(activeRuleIndex + direction, 0), visibleRules.length - 1)];
    if (nextRule) setActiveRuleId(nextRule.id);
  };

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-start">
        <div>
          <h3 className="text-3xl font-black text-ink">{t("label.sentenceOrder")}</h3>
          <p className="mt-3 max-w-3xl text-lg font-bold leading-8 text-ocean/75">
            {language === "zh"
              ? "词序规则很多，但一次只看一个。先从左边选规则，看清楚正确/错误对比，再做下面的小练习。"
              : "There are many word-order rules, but study one at a time. Pick a rule, compare correct/wrong forms, then do the mini practice."}
          </p>
        </div>
        <div className="rounded-[26px] bg-ink p-5 text-white">
          <p className="text-sm font-black tracking-[0.14em] text-orange-200">{language === "zh" ? "核心判断流程" : "Core Check Flow"}</p>
          <ol className="mt-4 space-y-3 text-sm font-black leading-6 text-blue-50">
            <li>1. {language === "zh" ? "先找会变的动词。" : "Find the finite verb."}</li>
            <li>2. {language === "zh" ? "判断这是主句、问句还是从句。" : "Check: main clause, question, or subordinate clause."}</li>
            <li>3. {language === "zh" ? "主句看 V2；从句看动词后置。" : "Main clause uses V2; subordinate clause pushes the verb back."}</li>
            <li>4. {language === "zh" ? "有第二个动词时，通常去句尾。" : "If there is a second verb, it often goes to the end."}</li>
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "A1", "A2", "B1"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => chooseLevel(level)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${levelFilter === level ? "bg-ink text-white" : "bg-skywash text-ocean hover:bg-peach"}`}
          >
            {level === "all" ? (language === "zh" ? "全部规则" : "All Rules") : level}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="rounded-[26px] bg-slate-50 p-4 ring-1 ring-blue-100 lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-pop">{language === "zh" ? "规则目录" : "Rule Menu"}</p>
              <p className="mt-1 text-xs font-bold text-ocean/65">
                {activeRuleIndex + 1} / {visibleRules.length}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
              {levelFilter === "all" ? "A1-B1" : levelFilter}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {visibleRules.map((rule, index) => {
              const isActive = rule.id === activeRule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setActiveRuleId(rule.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive ? "border-ink bg-ink text-white" : "border-blue-100 bg-white text-ink hover:bg-peach"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${isActive ? "bg-white/10 text-orange-200" : "bg-skywash text-ocean"}`}>
                      {rule.level}
                    </span>
                    <span className={`text-xs font-black ${isActive ? "text-white/60" : "text-ocean/45"}`}>{index + 1}</span>
                  </div>
                  <p className="mt-2 text-sm font-black leading-5">{language === "zh" ? rule.titleZh : rule.titleEn}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          <RuleCard rule={activeRule} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveRule(-1)}
              disabled={activeRuleIndex <= 0}
              className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-black text-ink transition hover:bg-skywash disabled:cursor-not-allowed disabled:opacity-40"
            >
              {language === "zh" ? "上一个规则" : "Previous Rule"}
            </button>
            <button
              type="button"
              onClick={() => moveRule(1)}
              disabled={activeRuleIndex >= visibleRules.length - 1}
              className="rounded-full bg-ink px-4 py-2 text-sm font-black text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-40"
            >
              {language === "zh" ? "下一个规则" : "Next Rule"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-7 rounded-[30px] bg-slate-50 p-5 ring-1 ring-blue-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-pop">{language === "zh" ? "当前规则练习" : "Current Rule Practice"}</p>
            <h4 className="mt-1 text-2xl font-black text-ink">{language === "zh" ? "选正确词序" : "Choose the Correct Word Order"}</h4>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
            {language === "zh" ? activeRule.titleZh : activeRule.titleEn}
          </span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {activePractice.map((question) => {
            const picked = answers[question.id];
            const isAnswered = Boolean(picked);
            const isCorrect = picked === question.answer;
            return (
              <article key={question.id} className="rounded-[24px] bg-white p-4 ring-1 ring-blue-100">
                <p className="text-lg font-black leading-7 text-ink">{language === "zh" ? question.questionZh : question.questionEn}</p>
                <div className="mt-4 grid gap-2">
                  {question.options.map((option) => {
                    const isPicked = picked === option;
                    const optionCorrect = option === question.answer;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                        className={`rounded-2xl border px-4 py-3 text-left font-black transition ${
                          isPicked && optionCorrect
                            ? "border-green-200 bg-mint text-ocean"
                            : isPicked
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-blue-100 bg-white text-ink hover:bg-skywash"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {isAnswered ? (
                  <p className={`mt-4 rounded-2xl p-4 font-bold leading-7 ${isCorrect ? "bg-mint text-ocean" : "bg-red-50 text-red-700"}`}>
                    {isCorrect ? (language === "zh" ? "对。" : "Correct.") : (language === "zh" ? "不对。" : "Not quite.")}{" "}
                    {language === "zh" ? question.explanationZh : question.explanationEn}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
        {activePractice.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-4 font-bold text-ocean/70">
            {language === "zh"
              ? "这个规则先看例句和表格，相关练习会放在对应课程里。"
              : "Start with the examples and table here. Related practice appears inside the matching lessons."}
          </p>
        ) : null}
      </section>
    </section>
  );
}
