"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, Clock3, ListOrdered, Play, Puzzle, Search, TableProperties } from "lucide-react";
import { ArticleDetector } from "@/components/ArticleDetector";
import { NextStepCard } from "@/components/NextStepCard";
import { PluralTrainer } from "@/components/PluralTrainer";
import { RulePartNavigator } from "@/components/RulePartNavigator";
import { SentenceOrderTrainer } from "@/components/SentenceOrderTrainer";
import { nounEntries, pluralEntries, sentencePatterns } from "@/data/grammarRules";
import { useLanguage } from "@/lib/i18n";
import { getLearningProgress, updateLearningProgress } from "@/lib/learningProgress";
import type { LocalizedText } from "@/types/course";

type ToolId = "verbs" | "articles" | "plurals" | "order" | "prepositions" | "adjectives" | "past";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });
const gt = (language: "zh" | "en", text: string) => (language === "zh" ? text : grammarEn[text] ?? text);

const grammarEn: Record<string, string> = {
  "工作": "work",
  "学习": "learn",
  "住": "live",
  "做": "make/do",
  "主语：ik": "Subject: ik",
  "主语：单数主语": "Subject: singular subjects",
  "主语：复数主语": "Subject: plural subjects",
  "去掉 -en": "remove -en",
  "去掉 -en，再加 t": "remove -en, then add t",
  "用动词原本的样子": "use the infinitive form",
  "ik 最简单，只去掉 -en。": "ik is the simplest: remove -en only.",
  "单数主语，通常加 t。": "Singular subjects usually add t.",
  "复数人多，动词回到原本的样子。": "Plural subjects use the original infinitive form.",
  "我工作": "I work",
  "你工作": "you work",
  "他工作": "he works",
  "她工作": "she works",
  "它工作 / 它有效": "it works / it functions",
  "您工作": "you work (formal)",
  "我们工作": "we work",
  "你们工作": "you all work",
  "他们/她们工作": "they work",
  "我是": "I am",
  "你是": "you are",
  "他是": "he is",
  "她是": "she is",
  "它是": "it is",
  "您是": "you are (formal)",
  "我们是": "we are",
  "你们是": "you all are",
  "他们/她们是": "they are",
  "我有": "I have",
  "你有": "you have",
  "他有": "he has",
  "她有": "she has",
  "它有": "it has",
  "您有": "you have (formal)",
  "我们有": "we have",
  "你们有": "you all have",
  "他们/她们有": "they have",
  "ik 后面只去掉 -en，不加 t。": "After ik, remove -en only; do not add t.",
  "jij 正常在前面时，要加 t。": "When jij comes before the verb, add t.",
  "jij 在动词后面，t 要掉下来。": "When jij follows the verb, the t drops.",
  "u 不像 jij/je，u 后面仍然保留 t。": "u is not like jij/je; the t stays.",
  "wij 是复数，动词用原本的样子。": "wij is plural, so use the infinitive form.",
  "zijn 是特殊动词，ik 用 ben。": "zijn is irregular; ik uses ben.",
  "这里 zij 是“他们/她们”，所以用 zijn。": "Here zij means they, so use zijn.",
  "hebben 是特殊动词，hij/zij/het 用 heeft。": "hebben is irregular; hij/zij/het use heeft.",
  "ben 是“是”，不要在每个动词前面加 ben。": "ben means am; do not put it before every verb.",
  "ik 后面去掉 -en。": "After ik, remove -en.",
  "jij 在前面，动词加 t。": "When jij comes first, add t.",
  "u 不掉 t。": "u does not drop the t.",
  "这里 zij 是“她”，所以用 is。": "Here zij means she, so use is.",
  "hebben 是特殊动词，hij 用 heeft。": "hebben is irregular; hij uses heeft.",
  "这辆自行车更便宜：Deze fiets is ___ dan die fiets.": "This bike is cheaper: Deze fiets is ___ dan die fiets.",
  "这家店最便宜：Deze winkel is ___.": "This shop is the cheapest: Deze winkel is ___.",
  "我住在第一层：Ik woon op de ___ verdieping.": "I live on the first floor: Ik woon op de ___ verdieping.",
  "这是我的第二个预约：Dit is mijn ___ afspraak.": "This is my second appointment: Dit is mijn ___ afspraak.",
  "火车比公交快：De trein is ___ dan de bus.": "The train is faster than the bus: De trein is ___ dan de bus.",
  "这个方案最适合：Dit plan is ___.": "This plan is the most suitable: Dit plan is ___.",
  "比较两个东西，用比较级 goedkoper + dan。": "To compare two things, use the comparative goedkoper + dan.",
  "最高级常用 het + adjective + st。": "The superlative often uses het + adjective + st.",
  "第几层要用序数词 eerste。": "Floors/order use the ordinal eerste.",
  "第二个用 tweede，不是 twee。": "Use tweede for second, not twee.",
  "比较两个交通工具，用 sneller dan。": "To compare two transport options, use sneller dan.",
  "geschikt 这种较长/较正式形容词，常用 meest geschikt 表示最适合。": "Longer or more formal adjectives like geschikt often use meest geschikt for the superlative.",
  "这座大房子：het ___ huis": "This big house: het ___ huis",
  "一座大房子：een ___ huis": "A big house: een ___ huis",
  "这个小房间：de ___ kamer": "This small room: de ___ kamer",
  "房子很大：Het huis is ___.": "The house is big: Het huis is ___.",
  "一个好问题：een ___ vraag": "A good question: een ___ vraag",
  "这本小书：het ___ boek": "This small book: het ___ boek",
  "het + 形容词 + 名词，形容词通常加 -e。": "het + adjective + noun usually gives the adjective -e.",
  "huis 是 het 词；een + het-word 单数，不加 -e。": "huis is a het-word; een + singular het-word does not add -e.",
  "kamer 是 de 词，形容词在名词前加 -e。": "kamer is a de-word; an adjective before it takes -e.",
  "形容词在 is 后面，不是在名词前，通常不加 -e。": "After is, the adjective is not before a noun, so it usually does not take -e.",
  "vraag 是 de 词，所以 een goede vraag。": "vraag is a de-word, so it is een goede vraag.",
  "有 het 在前面时：het kleine boek。": "With het before the noun: het kleine boek.",
  "第一": "first",
  "第二": "second",
  "第三": "third",
  "第四": "fourth",
  "第五": "fifth",
  "第六": "sixth",
  "第七": "seventh",
  "第八": "eighth",
  "第九": "ninth",
  "第十": "tenth",
  "第十一": "eleventh",
  "第十二": "twelfth",
  "第十三": "thirteenth",
  "第十四": "fourteenth",
  "第十五": "fifteenth",
  "第二十": "twentieth",
  "第二十一": "twenty-first",
  "第三十": "thirtieth",
  "两个预约": "two appointments",
  "第二个预约": "the second appointment",
  "六月一日": "June first",
  "五月二日": "May second",
  "四月二十日": "April twentieth",
  "第一层/一楼": "the first floor",
  "第二层": "the second floor",
  "第三个窗口": "the third counter",
  "我的第二个预约": "my second appointment",
  "第三次": "the third time",
  "第一班火车": "the first train",
  "说“第二个预约”要用 tweede，不是数量词 twee。": "For second appointment, use tweede, not the cardinal twee.",
  "楼层/顺序要用序数词 eerste。": "Floors and order use the ordinal eerste.",
  "第几次要用 derde keer。": "For the third time, use derde keer.",
  "第二十是一个词：twintigste。": "Twentieth is one word: twintigste.",
  "放在名词前一般用 eerste，不是 eerst。": "Before a noun, use eerste, not eerst.",
  "第几个预约用序数词 tweede。": "Use the ordinal tweede for the second appointment.",
  "第几层用 eerste verdieping。": "Use eerste verdieping for the first floor.",
  "我坐第三班火车：Ik neem de ___ trein.": "I am taking the third train: Ik neem de ___ trein.",
  "第三班用 de derde trein。": "Use de derde trein for the third train.",
  "这是第十题：Dit is de ___ vraag.": "This is the tenth question: Dit is de ___ vraag.",
  "第十是 tiende。": "Tenth is tiende.",
  "四月二十日：de ___ april.": "April twentieth: de ___ april.",
  "日期里的 20 常读作 de twintigste。": "In dates, 20 is often read as de twintigste.",
  "第三次：de ___ keer.": "The third time: de ___ keer.",
  "第几次用序数词 + keer。": "Use an ordinal + keer for the nth time.",
  "完成时：已经做了": "Perfect tense: something has been done",
  "简单过去式：过去做/当时是": "Simple past: did / was at that time",
  "过去完成式：之前已经做了": "Past perfect: had already done",
  "A2 核心": "A2 core",
  "A2/B1 过渡": "A2/B1 bridge",
  "B1 前置认知": "B1 preview",
  "A2 办事、邮件、电话里最常用：我已经打过电话、已经收到信、已经付款。荷兰语常用 heb/ben + 过去分词。": "In A2 tasks, emails, and phone calls, you often need: I have called, received the letter, paid the bill. Dutch commonly uses heb/ben + participle.",
  "简单过去式常用于讲故事、描述过去背景，也有一些高频动词很常见：was, had, ging, kwam, moest, kon。": "The simple past is common in stories and background descriptions; frequent forms include was, had, ging, kwam, moest, kon.",
  "过去完成式表示：在另一个过去时间点之前，事情已经发生了。比如到办公室时，我已经付过钱了。": "Past perfect means something had already happened before another past moment. For example: when I arrived at the office, I had already paid.",
  "我已经给家庭医生打过电话。": "I have called the GP.",
  "我已经付了账单。": "I have paid the bill.",
  "我已经去了市政厅。": "I have gone to the municipality.",
  "多数动作先用 hebben。移动方向/状态变化常用 zijn：Ik ben gegaan, Ik ben gekomen.": "Most actions use hebben first. Movement/change of state often uses zijn: Ik ben gegaan, Ik ben gekomen.",
  "我昨天生病了。": "I was sick yesterday.",
  "我当时没有时间。": "I had no time.",
  "我当时去了家庭医生那里。": "I went to the GP.",
  "A2 先把 was/had/ging/kwam/moest/kon 当高频词块记。规则动词过去式可以后面系统学。": "At A2, first learn was/had/ging/kwam/moest/kon as high-frequency chunks. Regular past-tense forms can come later.",
  "我那时已经付过账单了。": "I had already paid the bill.",
  "我那时已经去过市政厅了。": "I had already gone to the municipality.",
  "我那时已经发过邮件了。": "I had already sent the email.",
  "A2 不需要大量输出过去完成式，但要能看懂。B1 再系统练。": "A2 does not need heavy past-perfect output, but learners should recognize it. Practice it systematically at B1.",
  "普通动作过去发生，常用 heb + 过去分词，不是 was + 原形。": "For a completed normal action, use heb + participle, not was + infinitive.",
  "gaan 表示移动方向，完成时常用 zijn。": "gaan expresses movement/direction, so the perfect tense often uses zijn.",
  "完成时后面要用过去分词 betaald，不是原形 betalen。": "Perfect tense needs the participle betaald, not the infinitive betalen.",
  "过去完成式也要用过去分词。": "Past perfect also needs the participle.",
  "描述过去状态，高频用 was。": "For a past state, was is common.",
  "我已经打过电话：Ik ___ de huisarts ___.": "I have called the GP: Ik ___ de huisarts ___.",
  "我已经去了市政厅：Ik ___ naar de gemeente ___.": "I have gone to the municipality: Ik ___ naar de gemeente ___.",
  "我昨天生病了：Ik ___ gisteren ziek.": "I was sick yesterday: Ik ___ gisteren ziek.",
  "我当时没有时间：Ik ___ geen tijd.": "I had no time then: Ik ___ geen tijd.",
  "我那时已经付过账单了：Ik ___ de rekening al ___.": "I had already paid the bill then: Ik ___ de rekening al ___.",
  "我已经发过邮件：Ik heb de e-mail ___.": "I have sent the email: Ik heb de e-mail ___.",
  "bellen 是普通动作，完成时用 heb + gebeld。": "bellen is a normal action; use heb + gebeld.",
  "gaan 表示移动方向，完成时常用 ben + gegaan。": "gaan expresses movement/direction, so the perfect tense often uses ben + gegaan.",
  "过去状态用 was 很常见。": "was is common for a past state.",
  "hebben 的简单过去式是 had。": "The simple past of hebben is had.",
  "“那时已经……”用过去完成式 had + betaald。": "For had already..., use past perfect: had + betaald.",
  "完成时用过去分词 gestuurd。": "Perfect tense uses the participle gestuurd.",
  "wij 是复数，用动词原本的样子。": "wij is plural, so use the infinitive form.",
  "语法书里会把“去掉 -en 后的部分”叫 stem / 词干。但在这个阶段，你先不用记这个词。": "Grammar books call the part left after removing -en the stem. At this stage, you do not need to memorize the term yet.",
  "先记住：": "Remember this first:",
  "ik 去 en，": "ik removes -en,",
  "单数加 t，": "singular subjects add t,",
  "复数用原形，": "plural subjects use the infinitive,",
  "jij/je 倒装掉 t，": "jij/je after the verb drops t,",
  "zijn / hebben 单独背。": "memorize zijn / hebben separately.",
  "形容词 -e：放在名词前会变": "Adjective -e: adjectives change before nouns",
  "形容词如果只是放在句子后面描述主语，通常不加 -e：Het huis is groot。放到名词前面时，很多情况要加 -e：het grote huis。": "If an adjective describes the subject after the verb, it usually does not take -e: Het huis is groot. Before a noun, it often takes -e: het grote huis.",
  "形容词在名词前：通常 + e；een + het-word 单数：不加 e": "adjective before noun: usually + e; een + singular het-word: no e",
  "这座大房子很漂亮。": "This big house is beautiful.",
  "这个小房间很冷。": "This small room is cold.",
  "我不买那辆贵的自行车。": "I am not buying that expensive bike.",
  "那是一个好问题。": "That is a good question.",
  "我有一座大房子。": "I have a big house.",
  "先记一个判断：形容词在名词后面不变；在名词前面多半加 -e。最常见例外是 een + het-word + 单数：een groot huis, een klein boek。": "Use this first decision: after the noun or after is, the adjective stays unchanged; before a noun, it often takes -e. The common exception is een + singular het-word: een groot huis, een klein boek.",
  "比较级：更……": "Comparative: more / -er",
  "比较两个东西时，荷兰语通常在形容词后面加 -er，再用 dan 表示“比”。": "When comparing two things, Dutch usually adds -er to the adjective and uses dan for than.",
  "这个面包比那个面包便宜。": "This bread is cheaper than that bread.",
  "我的房间比你的房间大。": "My room is bigger than your room.",
  "火车比公交快。": "The train is faster than the bus.",
  "如果形容词比较长，尤其是复杂形容词，常用 meer + adjective：meer praktisch, meer geschikt。": "For longer or more formal adjectives, Dutch often uses meer + adjective: meer praktisch, meer geschikt.",
  "最高级：最……": "Superlative: the most / -st",
  "从一组东西里选“最……”，荷兰语常用 het + 形容词 + st。": "To say something is the most in a group, Dutch often uses het + adjective + st.",
  "这家店最便宜。": "This shop is the cheapest.",
  "这套房子最大。": "This house is the biggest.",
  "火车最快。": "The train is the fastest.",
  "口语里常把最高级当固定块记：het best, het liefst, het meest geschikt。": "In speech, learn frequent superlatives as chunks: het best, het liefst, het meest geschikt.",
  "rangtelwoorden：第几": "Ordinals: first, second, third",
  "数字说数量，序数词说顺序。比如 één 是一，eerste 是第一；twee 是二，tweede 是第二。": "Numbers say quantity; ordinals say order. één is one, eerste is first; twee is two, tweede is second.",
  "我住在一楼/第一层。": "I live on the first floor.",
  "这是我的第二个预约。": "This is my second appointment.",
  "我坐第三班火车。": "I am taking the third train.",
  "日期里也常用序数感觉：1 juni 读作 de eerste juni；20e = twintigste。": "Dates often use ordinal-style reading too: 1 juni is read de eerste juni; 20e = twintigste.",
  "短形容词一般直接加 -er，不用 meer。": "Short adjectives usually add -er directly; do not use meer.",
  "最高级常用 het + ... + st。": "The superlative usually uses het + ... + st.",
  "说“第几层/第几个”要用序数词，不是普通数字。": "Use an ordinal for floor/order, not a normal number.",
  "第二个预约要说 tweede afspraak。": "Second appointment is tweede afspraak.",
  "比较时“比”一般用 dan。": "For comparisons, than is usually dan.",
  "het + 形容词 + 名词：形容词通常加 -e。": "het + adjective + noun: the adjective usually takes -e.",
  "kamer 是 de 词，形容词在名词前要加 -e。": "kamer is a de-word, so the adjective before it takes -e.",
  "huis 是 het 词；een + het-word 单数时，形容词不加 -e。": "huis is a het-word; with een + singular het-word, the adjective does not take -e.",
  "形容词在 is 后面描述主语时，不放在名词前，通常不加 -e。": "After is, the adjective describes the subject and is not before a noun, so it usually does not take -e.",
  "vraag 是 de 词；即使用 een，形容词也要加 -e。": "vraag is a de-word; even with een, the adjective takes -e.",
  "先分清：数量词 vs 序数词": "First distinguish: numbers vs ordinals",
  "数量词回答“几个”：een, twee, drie。序数词回答“第几个”：eerste, tweede, derde。": "Numbers answer how many: een, twee, drie. Ordinals answer which one in order: eerste, tweede, derde.",
  "twee afspraken = 两个预约": "twee afspraken = two appointments",
  "de tweede afspraak = 第二个预约": "de tweede afspraak = the second appointment",
  "1、2、3 先单独背": "Memorize 1, 2, 3 separately first",
  "eerste, tweede, derde 是最高频，也最不适合硬套规则。先当固定词块记。": "eerste, tweede, derde are very frequent and not worth forcing into a pattern. Learn them as fixed chunks first.",
  "4 到 19 多数加 -de": "Most 4 to 19 forms take -de",
  "vierde, vijfde, zesde, zevende, negende, tiende。先背高频，不要一开始纠结每个拼写细节。": "vierde, vijfde, zesde, zevende, negende, tiende. Learn the common ones first; do not obsess over every spelling detail at the start.",
  "20、30、40 这些整十常用 -ste": "Round tens like 20, 30, 40 often take -ste",
  "twintigste, dertigste, veertigste。日期和排名里很常见。": "twintigste, dertigste, veertigste. These are common in dates and rankings.",
  "日期": "Dates",
  "荷兰语日期里经常有“第几”的感觉。": "Dutch dates often feel like ordinals.",
  "楼层/地址": "Floors / addresses",
  "看房、住址、医院楼层、市政厅窗口都可能用到。": "You may need this for housing viewings, addresses, hospital floors, and service counters.",
  "预约/顺序": "Appointments / order",
  "A1/A2 办事时会说第几次、第几个预约、第几班车。": "In A1/A2 practical tasks, you may need the nth time, second appointment, or third train.",
  "已经做了：Ik heb gebeld": "Already done: Ik heb gebeld",
  "过去状态：Ik was ziek": "Past state: Ik was ziek",
  "之前已经：Ik had betaald": "Already before then: Ik had betaald",
};

const tools: Array<{ id: ToolId; title: LocalizedText; body: LocalizedText; icon: typeof TableProperties }> = [
  { id: "verbs", title: lt("动词变形", "Verb Conjugation"), body: lt("动词会跟着主语变形。先掌握现在时。", "Verbs change with the subject. Start with present tense."), icon: TableProperties },
  { id: "articles", title: lt("de/het 探测器", "De/Het Detective"), body: lt("名词前面常要带 de 或 het。先学线索和高频词。", "Nouns often need de or het. Learn clues and high-frequency chunks first."), icon: Search },
  { id: "plurals", title: lt("单复数生成器", "Plural Builder"), body: lt("复数不是只加 s，荷兰语常见 -en 和 -s。", "Plural is not just adding s; Dutch often uses -en and -s."), icon: BookOpenCheck },
  { id: "order", title: lt("词序训练", "Sentence Order"), body: lt("荷兰语不是中文词序。动词位置是核心。", "Dutch word order is not Chinese word order. Verb position is central."), icon: Puzzle },
  { id: "prepositions", title: lt("介词结构", "Preposition Patterns"), body: lt("in/uit/op/naar/om 先看后面接什么。", "For in/uit/op/naar/om, first check what follows."), icon: Puzzle },
  { id: "adjectives", title: lt("形容词与顺序表达", "Adjectives & Order"), body: lt("包含形容词 -e、比较级、最高级和序数词。", "Includes adjective -e, comparatives, superlatives, and ordinals."), icon: ListOrdered },
  { id: "past", title: lt("过去表达", "Past Time"), body: lt("学会说已经做了、过去做、之前已经做了。", "Learn completed actions, past tense, and past perfect."), icon: Clock3 },
];

const grammarConcepts: Record<ToolId, {
  label: LocalizedText;
  what: LocalizedText;
  why: LocalizedText;
  formula: string;
  examples: string[];
  chineseMistake: LocalizedText;
  learnerAction: LocalizedText;
}> = {
  verbs: {
    label: lt("动词变形是什么？", "What is verb conjugation?"),
    what: lt("荷兰语动词会根据主语变化。中文里“我工作、你工作、他工作”的“工作”不变，但荷兰语里会变成 ik werk, jij werkt, hij werkt。", "Dutch verbs change with the subject. In Chinese, the verb stays the same, but Dutch changes: ik werk, jij werkt, hij werkt."),
    why: lt("你不需要一开始背完整语法书。A1 先掌握一个高频规则：ik 用词干，jij/hij/zij 加 t，复数回到原形。", "You do not need a whole grammar book first. At A1, learn one high-frequency rule: ik uses the stem, jij/hij/zij add t, plurals use the infinitive."),
    formula: "ik = stem · jij/hij/zij = stem + t · wij/jullie/zij = infinitive",
    examples: ["Ik werk.", "Jij werkt.", "Wij werken."],
    chineseMistake: lt("中文学习者最常见错误是给 ik 也加 t：Ik werkt。正确是 Ik werk。", "A common mistake is adding t after ik: Ik werkt. Correct: Ik werk."),
    learnerAction: lt("先选一个动词，看表格，再自己造一句 ik 句子。", "Pick one verb, read the table, then make one ik sentence."),
  },
  articles: {
    label: lt("de/het 是什么？", "What are de and het?"),
    what: lt("de 和 het 都相当于 English the。它们不能 100% 靠规则预测，但很多名词有线索：复数、小词、词尾、类型、复合词。", "de and het both roughly mean the. They cannot be predicted 100%, but many nouns have clues: plural, diminutive, ending, type, and compounds."),
    why: lt("A1/A2 先学会看线索，剩下的高频词再和 de/het 一起背。", "At A1/A2, learn to look for clues first, then memorize high-frequency nouns with de/het."),
    formula: "type / ending / compound → clue → de or het",
    examples: ["de boeken", "het kopje", "de rekening", "het ziekenhuis"],
    chineseMistake: lt("中文没有 de/het，所以容易只记 huis，不记 het huis。正确做法是先看线索，再把高频词当词块记。", "Chinese does not have de/het, so learners often memorize huis without het. The better approach is to use clues first, then memorize frequent chunks."),
    learnerAction: lt("判断流程：复数看 de，小词看 het，词尾找线索，复合词看最后，没线索就和词一起背。", "Decision flow: plurals use de, diminutives use het, endings give clues, compounds follow the final noun, and unclear words are memorized as chunks."),
  },
  plurals: {
    label: lt("复数是什么？", "What are plurals?"),
    what: lt("复数就是“一个”变“多个”。荷兰语不是只加 s，要先看单词结尾，再决定加 -en、-s 或 's。", "Plural means one becomes many. Dutch is not just adding s; first look at the word ending, then choose -en, -s, or 's."),
    why: lt("生活里很快会用到复数：boeken, afspraken, rekeningen。先学结尾规则，再慢慢积累例外。", "You quickly need plurals in daily life: boeken, afspraken, rekeningen. Learn ending-based rules first, exceptions later."),
    formula: "look at ending → choose -en / -s / 's",
    examples: ["boek → boeken", "kamer → kamers", "auto → auto's", "huis → huizen"],
    chineseMistake: lt("不要把所有词都按英语加 s。boek 的复数是 boeken，不是 boeks；huis 还会变成 huizen。", "Do not add English-style s to every noun. boek becomes boeken, not boeks; huis becomes huizen."),
    learnerAction: lt("先看单词结尾，再选规则。遇到高频例外，直接作为词块记。", "Look at the ending first, then choose the rule. For high-frequency exceptions, memorize the chunk."),
  },
  order: {
    label: lt("词序规则是什么？", "What is word order?"),
    what: lt("荷兰语句子不是按中文直接翻译排词。最重要的入门规则是 V2：限定动词站在第二位置。", "Dutch sentences are not word-by-word Chinese translations. The key starter rule is V2: the finite verb takes position 2."),
    why: lt("掌握 V2 后，你才能理解 Morgen ga ik... 为什么不是 Morgen ik ga...。A2 还会遇到情态动词和可分动词。", "Once you understand V2, Morgen ga ik... makes sense, not Morgen ik ga... At A2, modal and separable verbs build on this."),
    formula: "position 1 + finite verb + subject/rest",
    examples: ["Ik ga morgen naar school.", "Morgen ga ik naar school.", "Ik wil een afspraak maken."],
    chineseMistake: lt("中文会说“明天我去学校”，直译成 Morgen ik ga naar school 是错的。荷兰语要 Morgen ga ik naar school。", "Chinese says tomorrow I go school, but Morgen ik ga naar school is wrong. Dutch needs Morgen ga ik naar school."),
    learnerAction: lt("先找限定动词，再数它是不是第二位。", "First find the finite verb, then check whether it is in position 2."),
  },
  prepositions: {
    label: lt("介词结构是什么？", "What are preposition patterns?"),
    what: lt("荷兰语介词不能只背成一个中文。in、uit、op、naar、bij、om 这类词要先看后面接的是地点、方向、来源、时间、工具还是目的。", "Dutch prepositions cannot be memorized as one Chinese translation. For words like in, uit, op, naar, bij, and om, first check whether the phrase after it is place, direction, source, time, tool, or purpose."),
    why: lt("单词泡泡只负责提醒你“这个词要按结构记”。真正的结构判断和练习，放在语法模块里系统做。", "Word bubbles only remind you that this word must be learned structurally. The real pattern decision and practice belong in the grammar module."),
    formula: "preposition + phrase type → meaning",
    examples: ["in Nederland", "uit China", "naar de huisarts", "op maandag", "om tien uur"],
    chineseMistake: lt("中文常用一个“在/从/到”兜住很多情况，但荷兰语要选具体结构：住在荷兰是 in Nederland，去医生那里是 naar de huisarts，周一是 op maandag。", "Chinese can cover many cases with 在/从/到, but Dutch needs a specific pattern: living in the Netherlands is in Nederland, going to the doctor is naar de huisarts, and Monday is op maandag."),
    learnerAction: lt("先问：后面是地点、方向、来源、时间、工具还是目的？再选介词。", "First ask: is the following phrase place, direction, source, time, tool, or purpose? Then choose the preposition."),
  },
  adjectives: {
    label: lt("形容词与顺序表达是什么？", "What are adjectives and order expressions?"),
    what: lt("荷兰语形容词会因为位置变化。放在名词前时，很多时候要加 -e：een groot huis，但 het grote huis。比较级表达“更……”，最高级表达“最……”，rangtelwoorden 表达“第几”。", "Dutch adjectives change depending on position. Before a noun, they often take -e: een groot huis, but het grote huis. Comparatives express more..., superlatives express the most..., and ordinals express first/second/etc."),
    why: lt("中文形容词一般不变，但荷兰语要先看：形容词是不是站在名词前？前面是 de/het/een？名词是 de 词还是 het 词？", "Chinese adjectives usually do not change, but Dutch asks: is the adjective before a noun? Is it after de/het/een? Is the noun a de-word or het-word?"),
    formula: "adjective before noun → often + e · een + het-word singular → no e",
    examples: ["het huis is groot", "het grote huis", "een groot huis", "de grote kamer"],
    chineseMistake: lt("不要所有形容词都不变，也不要所有情况都加 e。先抓最常用判断：de 词加 e；het/de/dit/dat 后加 e；een + het 词单数不加 e。", "Do not leave every adjective unchanged, and do not add e everywhere. Learn the common decision: de-words take e; after het/de/dit/dat add e; een + singular het-word does not take e."),
    learnerAction: lt("先判断形容词是不是在名词前。如果不是，通常不加 e。如果在名词前，再看前面的冠词和名词类型。", "First check whether the adjective is before a noun. If not, usually no e. If yes, check the article and noun type."),
  },
  past: {
    label: lt("过去表达是什么？", "What is past-time expression?"),
    what: lt("荷兰语说过去不只有一种方式。A2 最常用的是完成时：Ik heb gebeld。简单过去式常见于讲故事或固定高频动词。过去完成式表示“在另一个过去时间之前已经发生”。", "Dutch has more than one way to talk about the past. At A2, the perfect tense is most useful: Ik heb gebeld. Simple past is common in storytelling and frequent verbs. Past perfect means something had already happened before another past moment."),
    why: lt("中文常靠“了/过/已经”表达过去，但荷兰语要选结构：heb/ben + 过去分词，或者 was/had + 过去分词。先分清场景，不要一次背所有变化表。", "Chinese often uses particles like 了/过/已经, but Dutch needs a structure: heb/ben + participle, or was/had + participle. First choose the situation; do not memorize every table at once."),
    formula: "perfect: heb/ben + participle · simple past: werkte/ging/was · past perfect: had/was + participle",
    examples: ["Ik heb gebeld.", "Ik ging naar de gemeente.", "Ik had al betaald."],
    chineseMistake: lt("不要把所有过去都翻成 ik was + 动词。Ik was bellen 是错的。要说 Ik heb gebeld。", "Do not translate every past action as ik was + verb. Ik was bellen is wrong. Say Ik heb gebeld."),
    learnerAction: lt("先问：这是不是“已经做了”？优先用完成时。是不是讲故事背景？再看简单过去式。是不是“之前已经”？用过去完成式。", "First ask: is it a completed action? Prefer perfect tense. Is it story background? Consider simple past. Is it already before another past moment? Use past perfect."),
  },
};

const originalVerbExamples = [
  ["werken", "工作"],
  ["leren", "学习"],
  ["wonen", "住"],
  ["maken", "做"],
];

const subjectRuleCards = [
  {
    title: "主语：ik",
    rule: "去掉 -en",
    hint: "ik 最简单，只去掉 -en。",
    examples: ["werken → ik werk", "leren → ik leer", "wonen → ik woon"],
  },
  {
    title: "主语：单数主语",
    subjects: ["jij / je", "hij", "zij / ze", "het", "u"],
    rule: "去掉 -en，再加 t",
    hint: "单数主语，通常加 t。",
    examples: ["jij werkt", "je werkt", "hij werkt", "zij werkt", "ze werkt", "het werkt", "u werkt"],
  },
  {
    title: "主语：复数主语",
    subjects: ["wij / we", "jullie", "zij / ze"],
    rule: "用动词原本的样子",
    hint: "复数人多，动词回到原本的样子。",
    examples: ["wij werken", "we werken", "jullie werken", "zij werken", "ze werken"],
  },
];

const werkenRows = [
  ["ik", "ik werk", "我工作"],
  ["jij / je", "jij werkt / je werkt", "你工作"],
  ["hij", "hij werkt", "他工作"],
  ["zij / ze", "zij werkt / ze werkt", "她工作"],
  ["het", "het werkt", "它工作 / 它有效"],
  ["u", "u werkt", "您工作"],
  ["wij / we", "wij werken / we werken", "我们工作"],
  ["jullie", "jullie werken", "你们工作"],
  ["zij / ze", "zij werken / ze werken", "他们/她们工作"],
];

const zijnRows = [
  ["ik", "ik ben", "我是"],
  ["jij / je", "jij bent / je bent", "你是"],
  ["hij", "hij is", "他是"],
  ["zij / ze", "zij is / ze is", "她是"],
  ["het", "het is", "它是"],
  ["u", "u bent", "您是"],
  ["wij / we", "wij zijn / we zijn", "我们是"],
  ["jullie", "jullie zijn", "你们是"],
  ["zij / ze", "zij zijn / ze zijn", "他们/她们是"],
];

const hebbenRows = [
  ["ik", "ik heb", "我有"],
  ["jij / je", "jij hebt / je hebt", "你有"],
  ["hij", "hij heeft", "他有"],
  ["zij / ze", "zij heeft / ze heeft", "她有"],
  ["het", "het heeft", "它有"],
  ["u", "u heeft / u hebt", "您有"],
  ["wij / we", "wij hebben / we hebben", "我们有"],
  ["jullie", "jullie hebben", "你们有"],
  ["zij / ze", "zij hebben / ze hebben", "他们/她们有"],
];

const presentTenseMistakes = [
  ["Ik werkt.", "Ik werk.", "ik 后面只去掉 -en，不加 t。"],
  ["Jij werk.", "Jij werkt.", "jij 正常在前面时，要加 t。"],
  ["Werkt jij?", "Werk jij?", "jij 在动词后面，t 要掉下来。"],
  ["Werk u?", "Werkt u?", "u 不像 jij/je，u 后面仍然保留 t。"],
  ["Wij werkt.", "Wij werken.", "wij 是复数，动词用原本的样子。"],
  ["Ik zijn student.", "Ik ben student.", "zijn 是特殊动词，ik 用 ben。"],
  ["Zij is mijn ouders.", "Zij zijn mijn ouders.", "这里 zij 是“他们/她们”，所以用 zijn。"],
  ["Hij heb een fiets.", "Hij heeft een fiets.", "hebben 是特殊动词，hij/zij/het 用 heeft。"],
  ["Ik ben werk.", "Ik werk.", "ben 是“是”，不要在每个动词前面加 ben。"],
];

const presentPractice = [
  { id: "p1", question: "Ik ___ Nederlands.", options: ["leer", "leert", "leren"], answer: "leer", explanation: "ik 后面去掉 -en。" },
  { id: "p2", question: "Jij ___ in Amsterdam.", options: ["woon", "woont", "wonen"], answer: "woont", explanation: "jij 在前面，动词加 t。" },
  { id: "p3", question: "___ jij vandaag?", options: ["Werk", "Werkt", "Werken"], answer: "Werk", explanation: "jij 在动词后面，t 掉下来。" },
  { id: "p4", question: "___ u vandaag?", options: ["Werk", "Werkt", "Werken"], answer: "Werkt", explanation: "u 不掉 t。" },
  { id: "p5", question: "Wij ___ vandaag.", options: ["werk", "werkt", "werken"], answer: "werken", explanation: "wij 是复数，用动词原本的样子。" },
  { id: "p6", question: "Ik ___ student.", options: ["ben", "bent", "is", "zijn"], answer: "ben", explanation: "zijn 是特殊动词，ik 用 ben。" },
  { id: "p7", question: "Zij ___ mijn moeder.", options: ["is", "zijn"], answer: "is", explanation: "这里 zij 是“她”，所以用 is。" },
  { id: "p8", question: "Zij ___ mijn ouders.", options: ["is", "zijn"], answer: "zijn", explanation: "这里 zij 是“他们/她们”，所以用 zijn。" },
  { id: "p9", question: "Hij ___ een boek.", options: ["heb", "hebt", "heeft", "hebben"], answer: "heeft", explanation: "hebben 是特殊动词，hij 用 heeft。" },
];

const comparisonRules = [
  {
    id: "adjective-e",
    title: "形容词 -e：放在名词前会变",
    badge: "A1",
    why: "形容词如果只是放在句子后面描述主语，通常不加 -e：Het huis is groot。放到名词前面时，很多情况要加 -e：het grote huis。",
    rule: "形容词在名词前：通常 + e；een + het-word 单数：不加 e",
    examples: [
      ["groot", "grote", "Het grote huis is mooi.", "这座大房子很漂亮。"],
      ["klein", "kleine", "De kleine kamer is koud.", "这个小房间很冷。"],
      ["duur", "dure", "Ik koop de dure fiets niet.", "我不买那辆贵的自行车。"],
      ["goed", "goede", "Dat is een goede vraag.", "那是一个好问题。"],
      ["groot", "groot", "Ik heb een groot huis.", "我有一座大房子。"],
    ],
    note: "先记一个判断：形容词在名词后面不变；在名词前面多半加 -e。最常见例外是 een + het-word + 单数：een groot huis, een klein boek。",
  },
  {
    id: "comparative",
    title: "比较级：更……",
    badge: "A1/A2",
    why: "比较两个东西时，荷兰语通常在形容词后面加 -er，再用 dan 表示“比”。",
    rule: "adjective + er + dan",
    examples: [
      ["goedkoop", "goedkoper", "Dit brood is goedkoper dan dat brood.", "这个面包比那个面包便宜。"],
      ["groot", "groter", "Mijn kamer is groter dan jouw kamer.", "我的房间比你的房间大。"],
      ["snel", "sneller", "De trein is sneller dan de bus.", "火车比公交快。"],
    ],
    note: "如果形容词比较长，尤其是复杂形容词，常用 meer + adjective：meer praktisch, meer geschikt。",
  },
  {
    id: "superlative",
    title: "最高级：最……",
    badge: "A1/A2",
    why: "从一组东西里选“最……”，荷兰语常用 het + 形容词 + st。",
    rule: "het + adjective + st",
    examples: [
      ["goedkoop", "het goedkoopst", "Deze winkel is het goedkoopst.", "这家店最便宜。"],
      ["groot", "het grootst", "Dit huis is het grootst.", "这套房子最大。"],
      ["snel", "het snelst", "De trein is het snelst.", "火车最快。"],
    ],
    note: "口语里常把最高级当固定块记：het best, het liefst, het meest geschikt。",
  },
  {
    id: "ordinal",
    title: "rangtelwoorden：第几",
    badge: "A1/A2",
    why: "数字说数量，序数词说顺序。比如 één 是一，eerste 是第一；twee 是二，tweede 是第二。",
    rule: "number → ordinal: eerste, tweede, derde, vierde...",
    examples: [
      ["een", "eerste", "Ik woon op de eerste verdieping.", "我住在一楼/第一层。"],
      ["twee", "tweede", "Dit is mijn tweede afspraak.", "这是我的第二个预约。"],
      ["drie", "derde", "Ik neem de derde trein.", "我坐第三班火车。"],
    ],
    note: "日期里也常用序数感觉：1 juni 读作 de eerste juni；20e = twintigste。",
  },
];

const comparisonMistakes = [
  ["meer groot", "groter", "短形容词一般直接加 -er，不用 meer。"],
  ["de goedkoopst", "het goedkoopst", "最高级常用 het + ... + st。"],
  ["een verdieping", "de eerste verdieping", "说“第几层/第几个”要用序数词，不是普通数字。"],
  ["twee afspraak", "de tweede afspraak", "第二个预约要说 tweede afspraak。"],
  ["goedkoper als", "goedkoper dan", "比较时“比”一般用 dan。"],
];

const adjectiveEMistakes = [
  ["het groot huis", "het grote huis", "het + 形容词 + 名词：形容词通常加 -e。"],
  ["de klein kamer", "de kleine kamer", "kamer 是 de 词，形容词在名词前要加 -e。"],
  ["een grote huis", "een groot huis", "huis 是 het 词；een + het-word 单数时，形容词不加 -e。"],
  ["Het grote is huis.", "Het huis is groot.", "形容词在 is 后面描述主语时，不放在名词前，通常不加 -e。"],
  ["een goed vraag", "een goede vraag", "vraag 是 de 词；即使用 een，形容词也要加 -e。"],
];

const comparisonPractice = [
  { id: "c1", question: "这辆自行车更便宜：Deze fiets is ___ dan die fiets.", options: ["goedkoper", "goedkoopst", "meer goedkoop"], answer: "goedkoper", explanation: "比较两个东西，用比较级 goedkoper + dan。" },
  { id: "c2", question: "这家店最便宜：Deze winkel is ___.", options: ["het goedkoopst", "goedkoper", "de goedkoopst"], answer: "het goedkoopst", explanation: "最高级常用 het + adjective + st。" },
  { id: "c3", question: "我住在第一层：Ik woon op de ___ verdieping.", options: ["eerste", "een", "eerst"], answer: "eerste", explanation: "第几层要用序数词 eerste。" },
  { id: "c4", question: "这是我的第二个预约：Dit is mijn ___ afspraak.", options: ["tweede", "twee", "tweet"], answer: "tweede", explanation: "第二个用 tweede，不是 twee。" },
  { id: "c5", question: "火车比公交快：De trein is ___ dan de bus.", options: ["sneller", "snelst", "meest snel"], answer: "sneller", explanation: "比较两个交通工具，用 sneller dan。" },
  { id: "c6", question: "这个方案最适合：Dit plan is ___.", options: ["het meest geschikt", "meer geschikt", "geschikter dan"], answer: "het meest geschikt", explanation: "geschikt 这种较长/较正式形容词，常用 meest geschikt 表示最适合。" },
];

const adjectiveEPractice = [
  { id: "ae1", question: "这座大房子：het ___ huis", options: ["grote", "groot", "groter"], answer: "grote", explanation: "het + 形容词 + 名词，形容词通常加 -e。" },
  { id: "ae2", question: "一座大房子：een ___ huis", options: ["groot", "grote", "grooter"], answer: "groot", explanation: "huis 是 het 词；een + het-word 单数，不加 -e。" },
  { id: "ae3", question: "这个小房间：de ___ kamer", options: ["kleine", "klein", "kleiner"], answer: "kleine", explanation: "kamer 是 de 词，形容词在名词前加 -e。" },
  { id: "ae4", question: "房子很大：Het huis is ___.", options: ["groot", "grote", "groter"], answer: "groot", explanation: "形容词在 is 后面，不是在名词前，通常不加 -e。" },
  { id: "ae5", question: "一个好问题：een ___ vraag", options: ["goede", "goed", "goeder"], answer: "goede", explanation: "vraag 是 de 词，所以 een goede vraag。" },
  { id: "ae6", question: "这本小书：het ___ boek", options: ["kleine", "klein", "kleiner"], answer: "kleine", explanation: "有 het 在前面时：het kleine boek。" },
];

const ordinalCoreRows = [
  ["1", "een", "eerste", "第一"],
  ["2", "twee", "tweede", "第二"],
  ["3", "drie", "derde", "第三"],
  ["4", "vier", "vierde", "第四"],
  ["5", "vijf", "vijfde", "第五"],
  ["6", "zes", "zesde", "第六"],
  ["7", "zeven", "zevende", "第七"],
  ["8", "acht", "achtste", "第八"],
  ["9", "negen", "negende", "第九"],
  ["10", "tien", "tiende", "第十"],
  ["11", "elf", "elfde", "第十一"],
  ["12", "twaalf", "twaalfde", "第十二"],
  ["13", "dertien", "dertiende", "第十三"],
  ["14", "veertien", "veertiende", "第十四"],
  ["15", "vijftien", "vijftiende", "第十五"],
  ["20", "twintig", "twintigste", "第二十"],
  ["21", "eenentwintig", "eenentwintigste", "第二十一"],
  ["30", "dertig", "dertigste", "第三十"],
];

const ordinalRules = [
  {
    title: "先分清：数量词 vs 序数词",
    body: "数量词回答“几个”：een, twee, drie。序数词回答“第几个”：eerste, tweede, derde。",
    examples: ["twee afspraken = 两个预约", "de tweede afspraak = 第二个预约"],
  },
  {
    title: "1、2、3 先单独背",
    body: "eerste, tweede, derde 是最高频，也最不适合硬套规则。先当固定词块记。",
    examples: ["de eerste keer", "mijn tweede afspraak", "de derde trein"],
  },
  {
    title: "4 到 19 多数加 -de",
    body: "vierde, vijfde, zesde, zevende, negende, tiende。先背高频，不要一开始纠结每个拼写细节。",
    examples: ["de vierde dag", "de vijfde les", "de tiende vraag"],
  },
  {
    title: "20、30、40 这些整十常用 -ste",
    body: "twintigste, dertigste, veertigste。日期和排名里很常见。",
    examples: ["de twintigste", "de dertigste", "de eerste juni"],
  },
];

const ordinalSceneCards = [
  {
    title: "日期",
    why: "荷兰语日期里经常有“第几”的感觉。",
    examples: [
      ["1 juni", "de eerste juni", "六月一日"],
      ["2 mei", "de tweede mei", "五月二日"],
      ["20 april", "de twintigste april", "四月二十日"],
    ],
  },
  {
    title: "楼层/地址",
    why: "看房、住址、医院楼层、市政厅窗口都可能用到。",
    examples: [
      ["de eerste verdieping", "第一层/一楼"],
      ["de tweede verdieping", "第二层"],
      ["het derde loket", "第三个窗口"],
    ],
  },
  {
    title: "预约/顺序",
    why: "A1/A2 办事时会说第几次、第几个预约、第几班车。",
    examples: [
      ["mijn tweede afspraak", "我的第二个预约"],
      ["de derde keer", "第三次"],
      ["de eerste trein", "第一班火车"],
    ],
  },
];

const ordinalMistakes = [
  ["de twee afspraak", "de tweede afspraak", "说“第二个预约”要用 tweede，不是数量词 twee。"],
  ["een verdieping", "de eerste verdieping", "楼层/顺序要用序数词 eerste。"],
  ["de drie keer", "de derde keer", "第几次要用 derde keer。"],
  ["twintig de", "twintigste", "第二十是一个词：twintigste。"],
  ["de eerst afspraak", "de eerste afspraak", "放在名词前一般用 eerste，不是 eerst。"],
];

const ordinalPractice = [
  { id: "o1", question: "这是我的第二个预约：Dit is mijn ___ afspraak.", options: ["tweede", "twee", "tweet"], answer: "tweede", explanation: "第几个预约用序数词 tweede。" },
  { id: "o2", question: "我住在第一层：Ik woon op de ___ verdieping.", options: ["eerste", "een", "eerst"], answer: "eerste", explanation: "第几层用 eerste verdieping。" },
  { id: "o3", question: "我坐第三班火车：Ik neem de ___ trein.", options: ["derde", "drie", "dried"], answer: "derde", explanation: "第三班用 de derde trein。" },
  { id: "o4", question: "这是第十题：Dit is de ___ vraag.", options: ["tiende", "tien", "tienst"], answer: "tiende", explanation: "第十是 tiende。" },
  { id: "o5", question: "四月二十日：de ___ april.", options: ["twintigste", "twintig", "tweede"], answer: "twintigste", explanation: "日期里的 20 常读作 de twintigste。" },
  { id: "o6", question: "第三次：de ___ keer.", options: ["derde", "drie", "driede"], answer: "derde", explanation: "第几次用序数词 + keer。" },
];

const pastRules = [
  {
    id: "perfect",
    title: "完成时：已经做了",
    badge: "A2 核心",
    why: "A2 办事、邮件、电话里最常用：我已经打过电话、已经收到信、已经付款。荷兰语常用 heb/ben + 过去分词。",
    rule: "subject + heb/ben + rest + participle",
    examples: [
      ["bellen", "Ik heb de huisarts gebeld.", "我已经给家庭医生打过电话。"],
      ["betalen", "Ik heb de rekening betaald.", "我已经付了账单。"],
      ["gaan", "Ik ben naar de gemeente gegaan.", "我已经去了市政厅。"],
    ],
    note: "多数动作先用 hebben。移动方向/状态变化常用 zijn：Ik ben gegaan, Ik ben gekomen.",
  },
  {
    id: "simple-past",
    title: "简单过去式：过去做/当时是",
    badge: "A2/B1 过渡",
    why: "简单过去式常用于讲故事、描述过去背景，也有一些高频动词很常见：was, had, ging, kwam, moest, kon。",
    rule: "regular: stem + de/te · frequent irregulars: was/had/ging/kwam",
    examples: [
      ["zijn", "Ik was gisteren ziek.", "我昨天生病了。"],
      ["hebben", "Ik had geen tijd.", "我当时没有时间。"],
      ["gaan", "Ik ging naar de huisarts.", "我当时去了家庭医生那里。"],
    ],
    note: "A2 先把 was/had/ging/kwam/moest/kon 当高频词块记。规则动词过去式可以后面系统学。",
  },
  {
    id: "past-perfect",
    title: "过去完成式：之前已经做了",
    badge: "B1 前置认知",
    why: "过去完成式表示：在另一个过去时间点之前，事情已经发生了。比如到办公室时，我已经付过钱了。",
    rule: "subject + had/was + rest + participle",
    examples: [
      ["betalen", "Ik had de rekening al betaald.", "我那时已经付过账单了。"],
      ["gaan", "Ik was al naar de gemeente gegaan.", "我那时已经去过市政厅了。"],
      ["sturen", "Ik had de e-mail al gestuurd.", "我那时已经发过邮件了。"],
    ],
    note: "A2 不需要大量输出过去完成式，但要能看懂。B1 再系统练。",
  },
];

const participleBlocks = [
  ["bellen", "gebeld", "Ik heb gebeld."],
  ["maken", "gemaakt", "Ik heb een afspraak gemaakt."],
  ["betalen", "betaald", "Ik heb betaald."],
  ["sturen", "gestuurd", "Ik heb een e-mail gestuurd."],
  ["gaan", "gegaan", "Ik ben gegaan."],
  ["komen", "gekomen", "Ik ben gekomen."],
];

const pastMistakes = [
  ["Ik was bellen.", "Ik heb gebeld.", "普通动作过去发生，常用 heb + 过去分词，不是 was + 原形。"],
  ["Ik heb naar de gemeente gegaan.", "Ik ben naar de gemeente gegaan.", "gaan 表示移动方向，完成时常用 zijn。"],
  ["Ik heb de rekening betalen.", "Ik heb de rekening betaald.", "完成时后面要用过去分词 betaald，不是原形 betalen。"],
  ["Ik had betaal.", "Ik had betaald.", "过去完成式也要用过去分词。"],
  ["Ik ben ziek gisteren.", "Ik was gisteren ziek.", "描述过去状态，高频用 was。"],
];

const pastPractice = [
  { id: "past-1", question: "我已经打过电话：Ik ___ de huisarts ___.", options: ["heb / gebeld", "was / bellen", "ben / gebeld"], answer: "heb / gebeld", explanation: "bellen 是普通动作，完成时用 heb + gebeld。" },
  { id: "past-2", question: "我已经去了市政厅：Ik ___ naar de gemeente ___.", options: ["ben / gegaan", "heb / gegaan", "was / gaan"], answer: "ben / gegaan", explanation: "gaan 表示移动方向，完成时常用 ben + gegaan。" },
  { id: "past-3", question: "我昨天生病了：Ik ___ gisteren ziek.", options: ["was", "heb", "had"], answer: "was", explanation: "过去状态用 was 很常见。" },
  { id: "past-4", question: "我当时没有时间：Ik ___ geen tijd.", options: ["had", "heb", "was"], answer: "had", explanation: "hebben 的简单过去式是 had。" },
  { id: "past-5", question: "我那时已经付过账单了：Ik ___ de rekening al ___.", options: ["had / betaald", "heb / betalen", "was / betaald"], answer: "had / betaald", explanation: "“那时已经……”用过去完成式 had + betaald。" },
  { id: "past-6", question: "我已经发过邮件：Ik heb de e-mail ___.", options: ["gestuurd", "sturen", "stuurde"], answer: "gestuurd", explanation: "完成时用过去分词 gestuurd。" },
];

const prepositionGroups = [
  {
    id: "in",
    level: "A1",
    title: lt("in：里面/范围/时间段", "in: inside / area / period"),
    decision: lt("后面是国家、城市、空间容器或一段时间，优先检查 in。", "If the phrase is a country, city, container-like place, or time period, first check in."),
    rule: "in + place/container/period",
    examples: [
      ["in Nederland", "在荷兰", "国家/城市"],
      ["in de tas", "在包里", "容器里面"],
      ["in maart", "在三月", "月份/时间段"],
      ["in de ochtend", "在早上", "一天中的时间段"],
    ],
    mistakes: [
      ["op Nederland", "in Nederland", "国家、城市通常用 in，不用 op。"],
      ["naar de tas", "in de tas", "在包里是位置，不是方向。"],
    ],
  },
  {
    id: "uit",
    level: "A1",
    title: lt("uit：从里面出来/来自", "uit: out of / from"),
    decision: lt("后面是来源地、出发点或从某个空间里拿出来，先看 uit。", "If the phrase is a source, origin, or something taken out of a space, first check uit."),
    rule: "uit + source/container",
    examples: [
      ["uit China", "来自中国", "来源地"],
      ["uit de trein stappen", "从火车下来", "从交通工具里出来"],
      ["uit de tas halen", "从包里拿出来", "从容器里出来"],
      ["uit school komen", "放学出来", "从机构/场景出来"],
    ],
    mistakes: [
      ["van China", "uit China", "来自国家/城市，日常先用 uit。"],
      ["in de trein stappen", "uit de trein stappen", "下车是从里面出来，用 uit。"],
    ],
  },
  {
    id: "op",
    level: "A1/A2",
    title: lt("op：表面/日子/预约场景", "op: surface / days / appointments"),
    decision: lt("后面是表面、星期/日期、网站/页面或某些固定办事场景，先看 op。", "If the phrase is a surface, day/date, website/page, or common service setting, first check op."),
    rule: "op + surface/day/platform",
    examples: [
      ["op tafel", "在桌上", "表面"],
      ["op maandag", "在周一", "星期"],
      ["op 5 juli", "在七月五日", "具体日期"],
      ["op de website", "在网站上", "平台/页面"],
    ],
    mistakes: [
      ["in maandag", "op maandag", "星期用 op。"],
      ["in tafel", "op tafel", "在桌面上是 op。"],
    ],
  },
  {
    id: "naar",
    level: "A1",
    title: lt("naar：朝某处去/方向", "naar: to / toward"),
    decision: lt("后面是目的地、方向或你要去见的人/机构，先看 naar。", "If the phrase is a destination, direction, or person/institution you are going to, first check naar."),
    rule: "naar + destination/direction",
    examples: [
      ["naar huis", "回家/去家里", "目的地"],
      ["naar de huisarts", "去家庭医生那里", "去某人/机构"],
      ["naar school", "去学校", "目的地"],
      ["naar links", "向左", "方向"],
    ],
    mistakes: [
      ["in de huisarts", "naar de huisarts", "去医生那里是方向/目的地，用 naar。"],
      ["op huis", "naar huis", "回家/去家里是 naar huis。"],
    ],
  },
  {
    id: "bij",
    level: "A1/A2",
    title: lt("bij：在某人/机构那里", "bij: at someone's / with an institution"),
    decision: lt("后面是人、柜台、公司、医生或“在某人家/身边”，先看 bij。", "If the phrase is a person, counter, company, doctor, or someone's place/side, first check bij."),
    rule: "bij + person/place-as-host",
    examples: [
      ["bij de huisarts", "在家庭医生那里", "在某机构/专业人士那里"],
      ["bij de balie", "在柜台", "服务点"],
      ["bij mij thuis", "在我家", "某人家"],
      ["bij Albert Heijn", "在 AH", "公司/门店"],
    ],
    mistakes: [
      ["in de huisarts", "bij de huisarts", "人在医生那里，不是在医生里面。"],
      ["op mij thuis", "bij mij thuis", "在某人家常用 bij。"],
    ],
  },
  {
    id: "met",
    level: "A1",
    title: lt("met：和/用某工具", "met: with / by means of"),
    decision: lt("后面是一起的人、交通工具、付款方式或手段，先看 met。", "If the phrase is a companion, transport, payment method, or tool/means, first check met."),
    rule: "met + companion/tool/means",
    examples: [
      ["met mijn partner", "和我的伴侣", "一起的人"],
      ["met de fiets", "骑自行车/用自行车", "交通方式"],
      ["met pin betalen", "刷卡付款", "付款方式"],
      ["met een formulier", "用一张表格", "工具"],
    ],
    mistakes: [
      ["door de fiets", "met de fiets", "交通方式日常说 met de fiets。"],
      ["voor pin betalen", "met pin betalen", "付款方式用 met。"],
    ],
  },
  {
    id: "voor",
    level: "A1/A2",
    title: lt("voor：为了/给/在前面", "voor: for / before / in front of"),
    decision: lt("后面是受益对象、用途、理由，或表示在某物前面，先看 voor。", "If the phrase is a beneficiary, purpose, reason, or location in front of something, first check voor."),
    rule: "voor + person/purpose/front",
    examples: [
      ["voor u", "给您/为您", "对象"],
      ["voor mijn werk", "为了我的工作", "目的/理由"],
      ["voor de afspraak", "在预约前", "时间上的前"],
      ["voor het station", "在车站前面", "空间上的前"],
    ],
    mistakes: [
      ["om u", "voor u", "给某人/为某人常用 voor。"],
      ["bij het station", "voor het station", "强调正前方，用 voor。"],
    ],
  },
  {
    id: "om",
    level: "A2/B1",
    title: lt("om：钟点/目的/请求/绕着", "om: clock time / purpose / request / around"),
    decision: lt("om 不只等于 at。先看后面：钟点、om te + 动词、请求内容，还是绕着某处。", "om is not just at. First check what follows: clock time, om te + verb, requested content, or movement around a place."),
    rule: "om + clock time · om te + infinitive · om + requested thing",
    examples: [
      ["om tien uur", "在十点", "钟点"],
      ["om Nederlands te leren", "为了学荷兰语", "目的：om te + 动词"],
      ["om hulp vragen", "请求帮助", "请求内容"],
      ["om de hoek", "在拐角处/绕过拐角", "围绕/转角"],
    ],
    mistakes: [
      ["op tien uur", "om tien uur", "具体钟点用 om。"],
      ["voor te helpen", "om te helpen", "标准荷兰语里目的结构用 om te。"],
    ],
  },
  {
    id: "b1",
    level: "B1",
    title: lt("B1 扩展：别一词一译", "B1 extension: stop one-word translation"),
    decision: lt("B1 开始要认结构：关于、经过、直到、没有、之间、反对，都不是一个中文能解决。", "At B1, recognize structures: about, through/by, until, without, between, against cannot be solved by one Chinese word."),
    rule: "meaning role + phrase type → preposition",
    examples: [
      ["over de huur praten", "谈房租", "关于"],
      ["door de regen fietsen", "冒雨骑车/穿过雨", "经过/原因"],
      ["tot morgen", "到明天/明天见", "直到"],
      ["zonder afspraak", "没有预约", "没有"],
      ["tussen twee stations", "在两个站之间", "之间"],
      ["tegen de regels", "违反规则/反对规则", "反对/逆着"],
    ],
    mistakes: [
      ["praten op de huur", "praten over de huur", "谈论某主题用 over。"],
      ["met afspraak niet", "zonder afspraak", "没有某物用 zonder。"],
    ],
  },
];

const prepositionPractice = [
  { id: "prep-1", question: "我住在荷兰：Ik woon ___ Nederland.", options: ["in", "op", "naar"], answer: "in", explanation: "国家/城市作为位置，通常用 in。" },
  { id: "prep-2", question: "我去家庭医生那里：Ik ga ___ de huisarts.", options: ["naar", "in", "op"], answer: "naar", explanation: "去某人/机构那里，是方向/目的地，用 naar。" },
  { id: "prep-3", question: "我周一有时间：Ik heb ___ maandag tijd.", options: ["op", "in", "om"], answer: "op", explanation: "星期用 op。" },
  { id: "prep-4", question: "我十点来：Ik kom ___ tien uur.", options: ["om", "op", "voor"], answer: "om", explanation: "具体钟点用 om。" },
  { id: "prep-5", question: "我刷卡付款：Ik betaal ___ pin.", options: ["met", "door", "voor"], answer: "met", explanation: "付款方式/工具用 met。" },
  { id: "prep-6", question: "我请求帮助：Ik vraag ___ hulp.", options: ["om", "voor", "naar"], answer: "om", explanation: "om hulp vragen 是“请求帮助”的结构。" },
];

function PrepositionPatternModule({ language }: { language: "zh" | "en" }) {
  const [activeGroupId, setActiveGroupId] = useState(prepositionGroups[0].id);
  const [activePart, setActivePart] = useState<"map" | "mistakes" | "practice">("map");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentGroup = prepositionGroups.find((group) => group.id === activeGroupId) ?? prepositionGroups[0];

  useEffect(() => {
    setActivePart("map");
  }, [activeGroupId]);

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-blue-100 lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "介词目录" : "Preposition Menu"}</p>
          <div className="mt-4 space-y-2">
            {prepositionGroups.map((group, index) => {
              const isActive = group.id === activeGroupId;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    isActive ? "bg-ink text-white" : "bg-white text-ocean ring-1 ring-blue-100 hover:bg-skywash"
                  }`}
                >
                  <span className={`text-xs font-black ${isActive ? "text-orange-200" : "text-pop"}`}>0{index + 1} · {group.level}</span>
                  <span className="mt-1 block text-base font-black">{group.title[language]}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-peach p-4 text-sm font-black leading-6 text-ink">
            {language === "zh"
              ? "判断顺序：先看后面接什么，再决定介词意思。不要把一个介词硬翻成一个中文。"
              : "Decision order: first inspect what follows, then decide the meaning. Do not memorize by the English meaning only."}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-[30px] bg-ink p-6 text-white">
            <p className="text-sm font-black tracking-[0.16em] text-orange-200">{currentGroup.level} Pattern</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">{currentGroup.title[language]}</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-blue-50">{currentGroup.decision[language]}</p>
            <div className="mt-5 rounded-[24px] bg-white p-5 text-ink">
              <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "判断公式" : "Decision pattern"}</p>
              <p className="mt-2 text-3xl font-black leading-tight">{currentGroup.rule}</p>
            </div>
          </div>

          <RulePartNavigator
            title={language === "zh" ? "介词先按三块看" : "Read prepositions in three parts"}
            activeId={activePart}
            onSelect={setActivePart}
            items={[
              {
                id: "map",
                label: language === "zh" ? "用法地图" : "Usage Map",
                body: language === "zh" ? "先看这个介词后面常接什么。" : "First see what this preposition commonly attaches to.",
              },
              {
                id: "mistakes",
                label: language === "zh" ? "别这样翻" : "Avoid This",
                body: language === "zh" ? "专门对比中文直译会错在哪里。" : "Contrast where direct translation breaks.",
              },
              {
                id: "practice",
                label: language === "zh" ? "立刻练习" : "Practice",
                body: language === "zh" ? "用真实短句练判断，不放进记忆路径硬背。" : "Practice real short sentences, not memory-path stuffing.",
              },
            ]}
          />

          {activePart === "map" ? (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {currentGroup.examples.map(([dutch, zh, role]) => (
                  <article key={`${currentGroup.id}-${dutch}`} className="rounded-[24px] border border-blue-100 bg-white p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-pop">{role}</p>
                        <p className="mt-2 text-2xl font-black leading-8 text-ink">{dutch}</p>
                        <p className="mt-2 font-bold text-ocean/65">{zh}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakDutch(dutch)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-4 py-3 font-black text-ocean transition hover:bg-peach"
                      >
                        <Play size={16} />
                        {language === "zh" ? "听" : "Play"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-peach p-5">
                <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "记忆路径该做什么" : "What the memory path should do"}</p>
                <p className="mt-2 font-black leading-8 text-ink">
                  {language === "zh"
                    ? "单词泡泡只提示“这个词按结构判断”。真正的多用法、错法对比和短句训练，都在这里做。"
                    : "The word bubble only flags that this word needs structural judgment. Multiple uses, mistake contrasts, and sentence practice happen here."}
                </p>
              </div>
            </>
          ) : null}

          {activePart === "mistakes" ? (
            <div className="mt-7 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
              <h3 className="text-2xl font-black text-ink">{language === "zh" ? "中文直译常见坑" : "Common Direct-Translation Traps"}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {currentGroup.mistakes.map(([wrong, correct, reason]) => (
                  <article key={`${wrong}-${correct}`} className="rounded-2xl bg-white p-4">
                    <p className="font-black text-red-600">x {wrong}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="font-black text-emerald-700">✓ {correct}</p>
                      <button type="button" onClick={() => speakDutch(correct)} className="rounded-full bg-skywash p-2 text-ocean hover:bg-peach" aria-label={`Play ${correct}`}>
                        <Play size={13} />
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{reason}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activePart === "practice" ? (
            <div className="mt-7 rounded-[28px] border border-blue-100 bg-white p-5">
              <h3 className="text-2xl font-black text-ink">{language === "zh" ? "立刻练习" : "Practice Now"}</h3>
              <div className="mt-4 grid gap-4">
                {prepositionPractice.map((question) => {
                  const selected = answers[question.id];
                  const isCorrect = selected === question.answer;
                  return (
                    <article key={question.id} className="rounded-[22px] bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-lg font-black leading-7 text-ink">{question.question}</p>
                        <button
                          type="button"
                          onClick={() => speakDutch(question.question.replace("___", question.answer).replace(/^.*：/, ""))}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-ocean ring-1 ring-blue-100 hover:bg-peach"
                        >
                          <Play size={14} />
                          {language === "zh" ? "听答案句" : "Play answer"}
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {question.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                            className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                              selected === option
                                ? isCorrect
                                  ? "bg-mint text-ocean ring-emerald-100"
                                  : "bg-peach text-ocean ring-orange-100"
                                : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {selected ? (
                        <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                          {isCorrect ? (language === "zh" ? "对了。" : "Correct.") : `${language === "zh" ? "答案" : "Answer"}: ${question.answer}`} {question.explanation}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PresentTenseModule({ language }: { language: "zh" | "en" }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audioStatus, setAudioStatus] = useState("");
  const [activeLessonPart, setActiveLessonPart] = useState<"core" | "tables" | "practice">("core");

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioStatus(language === "zh" ? "当前浏览器不支持朗读。" : "This browser does not support speech playback.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const dutchVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("nl"));
    if (dutchVoice) utterance.voice = dutchVoice;
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    utterance.onstart = () => setAudioStatus(language === "zh" ? `正在播放：${text}` : `Playing: ${text}`);
    utterance.onend = () => setAudioStatus(language === "zh" ? "播放完成，跟读一遍。" : "Done. Repeat it once.");
    window.speechSynthesis.speak(utterance);
  };

  const AudioButton = ({ text }: { text: string }) => (
    <button
      type="button"
      onClick={() => speakDutch(text)}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
      aria-label={`${language === "zh" ? "播放" : "Play"} ${text}`}
    >
      <Play size={13} />
      {language === "zh" ? "听" : "Play"}
    </button>
  );

  const ExampleLine = ({ text, className = "" }: { text: string; className?: string }) => (
    <div className={`flex flex-col gap-2 rounded-2xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-xl font-black text-ink">{text}</p>
      <AudioButton text={text.replace("?", "?")} />
    </div>
  );

  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
      <div className="rounded-[30px] bg-ink p-6 text-white">
        <p className="text-sm font-black tracking-[0.16em] text-orange-200">A1 Rule</p>
        <h2 className="mt-3 text-4xl font-black leading-tight">
          {language === "zh" ? "A1 现在时动词：先看主语，再变动词" : "A1 present tense verbs: check the subject, then change the verb"}
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[24px] bg-white/10 p-5">
            <p className="text-lg font-bold leading-9 text-blue-50">
              {language === "zh"
                ? "中文里可以说：我工作 / 你工作 / 他工作 / 我们工作，“工作”这个词不变。"
                : "In Chinese, the verb can stay the same: I work / you work / he works / we work."}
            </p>
            <p className="mt-3 text-lg font-bold leading-9 text-blue-50">
              {language === "zh" ? "但荷兰语不一样：ik werk, jij werkt, hij werkt, wij werken。" : "Dutch changes the verb: ik werk, jij werkt, hij werkt, wij werken."}
            </p>
            <p className="mt-3 text-lg font-bold leading-9 text-blue-50">
              {language === "zh" ? "荷兰语动词放进句子里，要先看前面的主语是谁。" : "When a Dutch verb enters a sentence, first check which subject comes before it."}
            </p>
          </div>
          <div className="rounded-[24px] bg-pop p-5 text-ink">
            <p className="text-sm font-black tracking-[0.14em]">{language === "zh" ? "核心一句话" : "Core idea"}</p>
            <p className="mt-3 text-4xl font-black leading-tight">{language === "zh" ? "先看主语，再变动词。" : "Check the subject, then change the verb."}</p>
          </div>
        </div>
        {audioStatus ? <p className="mt-4 text-sm font-black text-orange-200">{audioStatus}</p> : null}
      </div>

      <RulePartNavigator
        title={language === "zh" ? "这一节分成三块" : "This lesson has three parts"}
        activeId={activeLessonPart}
        onSelect={setActiveLessonPart}
        items={[
          {
            id: "core",
            label: language === "zh" ? "先懂规则" : "Core Rule",
            body: language === "zh" ? "动词原形、主语三类、核心口诀。" : "Infinitive, subject groups, and the core chant.",
          },
          {
            id: "tables",
            label: language === "zh" ? "看表和特殊动词" : "Tables",
            body: language === "zh" ? "倒装掉 t、werken 表、zijn / hebben。" : "Inversion, werken table, zijn / hebben.",
          },
          {
            id: "practice",
            label: language === "zh" ? "错误和练习" : "Practice",
            body: language === "zh" ? "常见错句、选择练习、最后收口。" : "Common mistakes, quiz, and quick summary.",
          },
        ]}
      />

      {activeLessonPart === "core" ? (
        <>
      <div className="mt-8 rounded-[30px] bg-slate-50 p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 1</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "动词原本的样子" : "The base form of a verb"}</h3>
        <p className="mt-4 text-lg font-bold leading-8 text-ocean/75">
          {language === "zh" ? "很多荷兰语动词原本的样子以 -en 结尾。" : "Many Dutch infinitives end in -en."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {originalVerbExamples.map(([dutch, zh]) => (
            <div key={dutch} className="rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-black text-ink">{dutch}</p>
                <AudioButton text={dutch} />
              </div>
              <p className="mt-2 font-bold text-ocean/65">{gt(language, zh)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[24px] bg-white p-5">
          <p className="text-sm font-black tracking-[0.14em] text-pop">werken</p>
          <p className="mt-2 text-lg font-bold text-ocean/70">{language === "zh" ? "放进句子后会变成：" : "Inside a sentence it becomes:"}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["ik werk", "jij werkt", "wij werken"].map((item) => <ExampleLine key={item} text={item} />)}
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-peach p-4 text-sm font-black leading-6 text-ink">
          {language === "zh" ? "小注：语法书里会把“动词原本的样子”叫 infinitive / 动词原形。" : "Small note: grammar books call the base verb form the infinitive."}
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 2</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "主语分三类" : "Subjects fall into three groups"}</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {subjectRuleCards.map((card) => (
            <article key={card.title} className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100 shadow-sm">
              <h4 className="text-2xl font-black text-ink">{gt(language, card.title)}</h4>
              {card.subjects ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.subjects.map((subject) => (
                    <span key={subject} className="rounded-full bg-skywash px-3 py-1 text-sm font-black text-ocean">{subject}</span>
                  ))}
                </div>
              ) : null}
              <p className="mt-4 rounded-2xl bg-ink p-4 text-xl font-black text-white">{gt(language, card.rule)}</p>
              <p className="mt-3 font-black leading-7 text-pop">{gt(language, card.hint)}</p>
              <div className="mt-4 grid gap-2">
                {card.examples.map((example) => <ExampleLine key={example} text={example.replace(" → ", ", ")} />)}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[30px] bg-peach p-6">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 3</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "口诀" : "Memory chant"}</h3>
        <p className="mt-5 text-5xl font-black leading-tight text-ink">
          {language === "zh" ? (
            <>ik 去 en，<br />单数加 t，<br />复数用原形。</>
          ) : (
            <>ik removes -en,<br />singular adds t,<br />plural uses the infinitive.</>
          )}
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {["ik werk", "jij werkt", "wij werken"].map((item) => <ExampleLine key={item} text={item} />)}
        </div>
      </div>
        </>
      ) : null}

      {activeLessonPart === "tables" ? (
        <>
      <div className="mt-8 rounded-[30px] bg-slate-50 p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 4</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "特殊：jij / je 放到动词后面，t 掉下来" : "Special case: when jij / je follows the verb, the t drops"}</h3>
        <p className="mt-4 text-lg font-bold leading-8 text-ocean/75">{language === "zh" ? "正常句子里：jij werkt / je werkt。" : "In normal statements: jij werkt / je werkt."}</p>
        <p className="mt-2 text-lg font-bold leading-8 text-ocean/75">
          {language === "zh"
            ? "但是疑问句或倒装时，jij / je 放在动词后面，动词末尾的 t 要去掉。"
            : "But in questions or inversion, jij / je comes after the verb, so the final t drops."}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-white p-5">
            <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "jij / je 掉 t" : "jij / je drops t"}</p>
            <div className="mt-4 grid gap-2">
              {["werk jij?", "werk je?", "vandaag werk jij", "vandaag werk je"].map((item) => <ExampleLine key={item} text={item} />)}
            </div>
          </div>
          <div className="rounded-[24px] bg-white p-5">
            <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "不要这样" : "Avoid this"}</p>
            <div className="mt-4 grid gap-2">
              {["werkt jij? ❌", "werkt je? ❌"].map((item) => (
                <div key={item} className="rounded-2xl bg-peach p-4 text-xl font-black text-ink">{item}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-[24px] bg-ink p-5 text-white">
          <p className="text-sm font-black tracking-[0.14em] text-orange-200">Important</p>
          <p className="mt-2 text-2xl font-black">{language === "zh" ? "u 不掉 t。" : "u does not drop the t."}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ExampleLine text="werkt u?" className="text-ink" />
            <div className="rounded-2xl bg-peach p-4 text-xl font-black text-ink">werk u? ❌</div>
          </div>
          <p className="mt-4 rounded-2xl bg-pop p-4 font-black text-ink">{language === "zh" ? "jij/je 倒装掉 t，u 不掉。" : "With inversion, jij/je drops t; u does not."}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[30px] bg-white p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 5</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "完整例子：werken" : "Full example: werken"}</h3>
        <div className="mt-5 overflow-hidden rounded-[24px] border border-blue-100">
          <div className="grid grid-cols-[0.8fr_1.1fr_1fr_80px] bg-ink px-4 py-3 text-sm font-black text-white">
            <span>{language === "zh" ? "主语" : "Subject"}</span>
            <span>{language === "zh" ? "动词形式" : "Verb form"}</span>
            <span>{language === "zh" ? "意思" : "Meaning"}</span>
            <span>{language === "zh" ? "语音" : "Audio"}</span>
          </div>
          {werkenRows.map(([subject, form, zh]) => (
            <div key={`${subject}-${form}`} className="grid grid-cols-[0.8fr_1.1fr_1fr_80px] items-center gap-2 border-t border-blue-50 px-4 py-3 text-sm font-bold text-ocean">
              <span className="font-black text-ink">{subject}</span>
              <span className="text-lg font-black text-ink">{form}</span>
              <span>{gt(language, zh)}</span>
              <AudioButton text={form.split(" / ")[0]} />
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["werk jij?", "werk je?", "werkt u?"].map((item) => <ExampleLine key={item} text={item} />)}
        </div>
      </div>

      <div className="mt-8 rounded-[30px] bg-slate-50 p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 6</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "最高频特殊动词：zijn 和 hebben" : "High-frequency irregular verbs: zijn and hebben"}</h3>
        <p className="mt-4 text-lg font-bold leading-8 text-ocean/75">
          {language === "zh"
            ? "前面学的是普通动词，比如 werken。但 zijn（是）和 hebben（有）太常用了，而且不按普通规则变化。所以先不要套规则，直接当固定词块记。"
            : "The earlier rule is for regular verbs like werken. But zijn (to be) and hebben (to have) are extremely common and irregular, so learn them as fixed chunks first."}
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SpecialVerbTable
            language={language}
            title={language === "zh" ? "Part A: zijn = 是" : "Part A: zijn = to be"}
            hook={language === "zh" ? "我是 ben，你是 bent，他她它 is，复数都是 zijn。" : "I am ben, you are bent, he/she/it is is, and plurals use zijn."}
            rows={zijnRows}
            speakDutch={speakDutch}
          />
          <SpecialVerbTable
            language={language}
            title={language === "zh" ? "Part B: hebben = 有" : "Part B: hebben = to have"}
            hook={language === "zh" ? "我有 heb，你有 hebt，他她它 heeft，复数 hebben。" : "I have heb, you have hebt, he/she/it has heeft, and plurals use hebben."}
            rows={hebbenRows}
            speakDutch={speakDutch}
          />
        </div>
        <div className="mt-6 rounded-[24px] bg-white p-5">
          <p className="text-sm font-black tracking-[0.14em] text-pop">zij can mean both “she” and “they”</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ExampleLine text="Zij is mijn moeder." />
            <ExampleLine text="Zij zijn mijn ouders." />
          </div>
          <p className="mt-3 font-bold leading-7 text-ocean/70">
            {language === "zh"
              ? "Zij is mijn moeder. 她是我妈妈。 / Zij zijn mijn ouders. 他们/她们是我的父母。"
              : "Zij is mijn moeder = she is my mother. / Zij zijn mijn ouders = they are my parents."}
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["Ik heb een boek.", "Jij hebt een fiets.", "Hij heeft een huis.", "Wij hebben tijd."].map((item) => <ExampleLine key={item} text={item} />)}
        </div>
      </div>
        </>
      ) : null}

      {activeLessonPart === "practice" ? (
        <>
      <div className="mt-8">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 7</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "常见错误" : "Common Mistakes"}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presentTenseMistakes.map(([wrong, correct, reason], index) => (
            <article key={wrong} className="rounded-[24px] bg-white p-5 ring-1 ring-blue-100 shadow-sm">
              <p className="text-sm font-black tracking-[0.14em] text-pop">Mistake {index + 1}</p>
              <p className="mt-3 text-xl font-black text-red-600">❌ {wrong}</p>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-mint p-3">
                <p className="text-xl font-black text-ocean">✅ {correct}</p>
                <AudioButton text={correct} />
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-ocean/70">
                {language === "zh" ? "原因：" : "Reason: "}{gt(language, reason)}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[30px] bg-white p-6 ring-1 ring-blue-100">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 8</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? "立刻练习" : "Practice Now"}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presentPractice.map((question, index) => {
            const selected = answers[question.id];
            const isCorrect = selected === question.answer;
            return (
              <article key={question.id} className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-blue-100">
                <p className="text-sm font-black text-pop">Question {index + 1}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-2xl font-black text-ink">{question.question}</p>
                  <AudioButton text={question.question.replace("___", question.answer)} />
                </div>
                <div className="mt-4 grid gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                      className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                        selected === option ? (isCorrect ? "bg-mint text-ocean ring-emerald-100" : "bg-peach text-ocean ring-orange-100") : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {selected ? (
                  <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                    {isCorrect ? (language === "zh" ? "对了。" : "Correct.") : `${language === "zh" ? "答案" : "Answer"}: ${question.answer}`} {gt(language, question.explanation)}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-[30px] bg-peach p-6">
        <p className="text-sm font-black tracking-[0.16em] text-pop">SECTION 9</p>
        <h3 className="mt-2 text-3xl font-black text-ink">Tiny terminology note</h3>
        <p className="mt-4 font-black leading-8 text-ink">
          {gt(language, "语法书里会把“去掉 -en 后的部分”叫 stem / 词干。但在这个阶段，你先不用记这个词。")}
        </p>
        <p className="mt-4 text-3xl font-black leading-tight text-ink">
          {gt(language, "先记住：")}<br />
          {gt(language, "ik 去 en，")}<br />
          {gt(language, "单数加 t，")}<br />
          {gt(language, "复数用原形，")}<br />
          {gt(language, "jij/je 倒装掉 t，")}<br />
          {gt(language, "zijn / hebben 单独背。")}
        </p>
      </div>
        </>
      ) : null}
    </section>
  );
}

function SpecialVerbTable({
  language,
  title,
  hook,
  rows,
  speakDutch,
}: {
  language: "zh" | "en";
  title: string;
  hook: string;
  rows: string[][];
  speakDutch: (text: string) => void;
}) {
  return (
    <article className="rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
      <h4 className="text-2xl font-black text-ink">{title}</h4>
      <p className="mt-3 rounded-2xl bg-peach p-3 font-black leading-7 text-ink">{hook}</p>
      <div className="mt-4 grid gap-2">
        {rows.map(([subject, form, zh]) => (
          <div key={`${subject}-${form}`} className="grid grid-cols-[0.7fr_1.2fr_0.8fr_56px] items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-ocean">
            <span>{subject}</span>
            <span className="text-lg font-black text-ink">{form}</span>
            <span>{gt(language, zh)}</span>
            <button
              type="button"
              onClick={() => speakDutch(form.split(" / ")[0])}
              className="inline-flex items-center justify-center rounded-full bg-white p-2 text-ocean ring-1 ring-blue-100 hover:bg-peach"
              aria-label={`Play ${form}`}
            >
              <Play size={13} />
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}

function ComparisonOrdinalModule({ language }: { language: "zh" | "en" }) {
  const [activeRule, setActiveRule] = useState(comparisonRules[0].id);
  const [activeDetailPart, setActiveDetailPart] = useState<"rule" | "mistakes" | "practice">("rule");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentRule = comparisonRules.find((rule) => rule.id === activeRule) ?? comparisonRules[0];
  const isOrdinalRule = currentRule.id === "ordinal";
  const isAdjectiveERule = currentRule.id === "adjective-e";
  const activeMistakes = isAdjectiveERule ? adjectiveEMistakes : comparisonMistakes;
  const activePractice = isAdjectiveERule ? adjectiveEPractice : comparisonPractice;

  useEffect(() => {
    setActiveDetailPart("rule");
  }, [activeRule]);

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-blue-100 lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "规则目录" : "Rule Menu"}</p>
          <div className="mt-4 space-y-2">
            {comparisonRules.map((rule, index) => {
              const isActive = rule.id === activeRule;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setActiveRule(rule.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    isActive ? "bg-ink text-white" : "bg-white text-ocean ring-1 ring-blue-100 hover:bg-skywash"
                  }`}
                >
                  <span className={`text-xs font-black ${isActive ? "text-orange-200" : "text-pop"}`}>0{index + 1} · {rule.badge}</span>
                  <span className="mt-1 block text-base font-black">{gt(language, rule.title)}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-[30px] bg-ink p-6 text-white">
            <p className="text-sm font-black tracking-[0.16em] text-orange-200">A1/A2 Rule</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">{gt(language, currentRule.title)}</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-blue-50">{gt(language, currentRule.why)}</p>
            <div className="mt-5 rounded-[24px] bg-white p-5 text-ink">
              <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "规则公式" : "Pattern"}</p>
              <p className="mt-2 text-3xl font-black leading-tight">{gt(language, currentRule.rule)}</p>
            </div>
          </div>

          <RulePartNavigator
            title={language === "zh" ? "当前规则分成三块" : "This rule has three parts"}
            activeId={activeDetailPart}
            onSelect={setActiveDetailPart}
            items={[
              {
                id: "rule",
                label: language === "zh" ? "规则和例子" : "Rule",
                body: language === "zh" ? "先看公式、核心例句和使用场景。" : "Formula, core examples, and use cases.",
              },
              {
                id: "mistakes",
                label: language === "zh" ? "常见错误" : "Mistakes",
                body: language === "zh" ? "专门看中文学习者容易错的地方。" : "Common Chinese-speaker mistakes.",
              },
              {
                id: "practice",
                label: language === "zh" ? "立刻练习" : "Practice",
                body: language === "zh" ? "做选择题，再用口诀收口。" : "Do the quiz, then close with the summary.",
              },
            ]}
          />

          {isOrdinalRule ? (
            <>
              {activeDetailPart === "rule" ? (
                <>
              <div className="mt-5 rounded-[28px] bg-peach p-5">
                <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "先分清" : "First Split"}</p>
                <h3 className="mt-2 text-3xl font-black text-ink">
                  {language === "zh" ? "数量词说“几个”，序数词说“第几个”。" : "Numbers say how many; ordinals say which one in order."}
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-black text-pop">{language === "zh" ? "数量" : "Quantity"}</p>
                    <p className="mt-2 text-2xl font-black text-ink">twee afspraken</p>
                    <p className="mt-1 font-bold text-ocean/70">{gt(language, "两个预约")}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-black text-pop">{language === "zh" ? "顺序" : "Order"}</p>
                    <p className="mt-2 text-2xl font-black text-ink">de tweede afspraak</p>
                    <p className="mt-1 font-bold text-ocean/70">{gt(language, "第二个预约")}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-[28px] border border-blue-100 bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "核心表" : "Core Table"}</p>
                    <h3 className="mt-2 text-3xl font-black text-ink">
                      {language === "zh" ? "先把最高频序数词听熟" : "Listen to the most frequent ordinals first"}
                    </h3>
                  </div>
                  <p className="rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
                    {language === "zh" ? "eerste / tweede / derde 最重要" : "eerste / tweede / derde matter most"}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {ordinalCoreRows.map(([number, cardinal, ordinal, zh]) => (
                    <article key={ordinal} className="rounded-[22px] bg-slate-50 p-4 ring-1 ring-blue-100">
                      <p className="text-sm font-black text-pop">{number}</p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-ocean/65">{cardinal} = {number}</p>
                          <p className="text-2xl font-black text-ink">{ordinal}</p>
                          <p className="mt-1 font-bold text-ocean/70">{gt(language, zh)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakDutch(ordinal)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-ocean ring-1 ring-blue-100 hover:bg-peach"
                        >
                          <Play size={14} />
                          {language === "zh" ? "听" : "Play"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {ordinalRules.map((rule) => (
                  <article key={rule.title} className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-blue-100">
                    <h3 className="text-2xl font-black text-ink">{gt(language, rule.title)}</h3>
                    <p className="mt-3 font-bold leading-7 text-ocean/70">{gt(language, rule.body)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {rule.examples.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => speakDutch(example)}
                          className="rounded-full bg-white px-4 py-2 text-sm font-black text-ocean ring-1 ring-blue-100 hover:bg-peach"
                        >
                          {gt(language, example)}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-7 rounded-[28px] bg-white p-5 ring-1 ring-blue-100">
                <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "用在哪里" : "Where You Use It"}</p>
                <h3 className="mt-2 text-3xl font-black text-ink">
                  {language === "zh" ? "日期、楼层、预约顺序都要用" : "Dates, floors, and appointment order all use ordinals"}
                </h3>
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {ordinalSceneCards.map((scene) => (
                    <article key={scene.title} className="rounded-[24px] bg-slate-50 p-5">
                      <h4 className="text-2xl font-black text-ink">{gt(language, scene.title)}</h4>
                      <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{gt(language, scene.why)}</p>
                      <div className="mt-4 grid gap-2">
                        {scene.examples.map(([dutch, spokenOrZh, maybeZh]) => {
                          const spoken = maybeZh ? spokenOrZh : dutch;
                          const zh = maybeZh ?? spokenOrZh;
                          return (
                            <button
                              key={`${dutch}-${zh}`}
                              type="button"
                              onClick={() => speakDutch(spoken)}
                              className="rounded-2xl bg-white p-3 text-left ring-1 ring-blue-100 hover:bg-peach"
                            >
                              <span className="block text-lg font-black text-ink">{dutch}</span>
                              {maybeZh ? <span className="mt-1 block text-sm font-black text-ocean">{spokenOrZh}</span> : null}
                              <span className="mt-1 block text-sm font-bold text-ocean/65">{gt(language, zh)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-7 rounded-[28px] bg-ink p-5 text-white">
                <p className="text-sm font-black tracking-[0.14em] text-orange-200">{language === "zh" ? "收口口诀" : "Quick Summary"}</p>
                <p className="mt-3 text-3xl font-black leading-tight">
                  {language === "zh" ? "数量：" : "Quantity: "}een, twee, drie<br />
                  {language === "zh" ? "顺序：" : "Order: "}eerste, tweede, derde<br />
                  {language === "zh" ? "4-19 多数 -de" : "Most 4-19 forms take -de"}<br />
                  {language === "zh" ? "20/30 多数 -ste" : "Most 20/30 forms take -ste"}
                </p>
              </div>
                </>
              ) : null}

              {activeDetailPart === "mistakes" ? (
              <div className="mt-7 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                <h3 className="text-2xl font-black text-ink">{language === "zh" ? "常见错误" : "Common Mistakes"}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {ordinalMistakes.map(([wrong, correct, reason]) => (
                    <article key={wrong} className="rounded-2xl bg-white p-4">
                      <p className="font-black text-red-600">x {wrong}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="font-black text-emerald-700">✓ {correct}</p>
                        <button type="button" onClick={() => speakDutch(correct)} className="rounded-full bg-skywash p-2 text-ocean hover:bg-peach" aria-label={`Play ${correct}`}>
                          <Play size={13} />
                        </button>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{gt(language, reason)}</p>
                    </article>
                  ))}
                </div>
              </div>
              ) : null}

              {activeDetailPart === "practice" ? (
              <div className="mt-7 rounded-[28px] border border-blue-100 bg-white p-5">
                <h3 className="text-2xl font-black text-ink">{language === "zh" ? "立刻练习" : "Practice Now"}</h3>
                <div className="mt-4 grid gap-4">
                  {ordinalPractice.map((question) => {
                    const selected = answers[question.id];
                    const isCorrect = selected === question.answer;
                    return (
                      <article key={question.id} className="rounded-[22px] bg-slate-50 p-4">
                        <p className="text-lg font-black leading-7 text-ink">{gt(language, question.question)}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {question.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                              className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                                selected === option
                                  ? isCorrect
                                    ? "bg-mint text-ocean ring-emerald-100"
                                    : "bg-peach text-ocean ring-orange-100"
                                  : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {selected ? (
                          <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                            {isCorrect ? (language === "zh" ? "对了。" : "Correct.") : `${language === "zh" ? "答案" : "Answer"}: ${question.answer}`} {gt(language, question.explanation)}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
              ) : null}
            </>
          ) : (
            <>
              {activeDetailPart === "rule" ? (
                <>
              <div className="mt-5 grid gap-3">
                {currentRule.examples.map(([base, form, sentence, zh]) => (
                  <article key={`${base}-${form}`} className="rounded-[24px] border border-blue-100 bg-white p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-pop">{base} → {form}</p>
                        <p className="mt-2 text-2xl font-black leading-8 text-ink">{sentence}</p>
                        <p className="mt-2 font-bold text-ocean/65">{gt(language, zh)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakDutch(sentence)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-4 py-3 font-black text-ocean transition hover:bg-peach"
                      >
                        <Play size={16} />
                        {language === "zh" ? "听例句" : "Play"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-peach p-5">
                <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "为什么要这样学" : "Why this matters"}</p>
                <p className="mt-2 font-black leading-8 text-ink">{gt(language, currentRule.note)}</p>
              </div>
                </>
              ) : null}

              {activeDetailPart === "mistakes" ? (
              <div className="mt-7 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
                <h3 className="text-2xl font-black text-ink">{language === "zh" ? "常见错误" : "Common Mistakes"}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {activeMistakes.map(([wrong, correct, reason]) => (
                    <article key={wrong} className="rounded-2xl bg-white p-4">
                      <p className="font-black text-red-600">x {wrong}</p>
                      <p className="mt-1 font-black text-emerald-700">✓ {correct}</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{gt(language, reason)}</p>
                    </article>
                  ))}
                </div>
              </div>
              ) : null}

              {activeDetailPart === "practice" ? (
                <>
              <div className="mt-7 rounded-[28px] border border-blue-100 bg-white p-5">
                <h3 className="text-2xl font-black text-ink">{language === "zh" ? "立刻练习" : "Practice Now"}</h3>
                <div className="mt-4 grid gap-4">
                  {activePractice.map((question) => {
                    const selected = answers[question.id];
                    const isCorrect = selected === question.answer;
                    return (
                      <article key={question.id} className="rounded-[22px] bg-slate-50 p-4">
                        <p className="text-lg font-black leading-7 text-ink">{gt(language, question.question)}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {question.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                              className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                                selected === option
                                  ? isCorrect
                                    ? "bg-mint text-ocean ring-emerald-100"
                                    : "bg-peach text-ocean ring-orange-100"
                                  : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {selected ? (
                          <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                            {isCorrect ? (language === "zh" ? "对了。" : "Correct.") : `${language === "zh" ? "答案" : "Answer"}: ${question.answer}`} {gt(language, question.explanation)}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="mt-7 rounded-[28px] bg-ink p-5 text-white">
                <p className="text-sm font-black tracking-[0.14em] text-orange-200">{language === "zh" ? "收口口诀" : "Quick Summary"}</p>
                <p className="mt-3 text-3xl font-black leading-tight">
                  {isAdjectiveERule ? (
                    <>
                      {language === "zh" ? "名词后：不加 e" : "After the noun: no e"}<br />
                      {language === "zh" ? "名词前：多半 + e" : "Before the noun: usually + e"}<br />
                      {language === "zh" ? "een + het 词单数：不加 e" : "een + singular het-word: no e"}
                    </>
                  ) : (
                    <>
                      {language === "zh" ? "比较两个：-er + dan" : "Compare two: -er + dan"}<br />
                      {language === "zh" ? "一组里最：het + -st" : "Most in a group: het + -st"}<br />
                      {language === "zh" ? "表示第几：rangtelwoorden" : "Order: rangtelwoorden"}
                    </>
                  )}
                </p>
              </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PastTenseModule({ language }: { language: "zh" | "en" }) {
  const [activeRule, setActiveRule] = useState(pastRules[0].id);
  const [activeDetailPart, setActiveDetailPart] = useState<"rule" | "table" | "practice">("rule");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentRule = pastRules.find((rule) => rule.id === activeRule) ?? pastRules[0];

  useEffect(() => {
    setActiveDetailPart("rule");
  }, [activeRule]);

  const speakDutch = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-blue-100 lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "过去表达目录" : "Past-Time Menu"}</p>
          <div className="mt-4 space-y-2">
            {pastRules.map((rule, index) => {
              const isActive = rule.id === activeRule;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setActiveRule(rule.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    isActive ? "bg-ink text-white" : "bg-white text-ocean ring-1 ring-blue-100 hover:bg-skywash"
                  }`}
                >
                  <span className={`text-xs font-black ${isActive ? "text-orange-200" : "text-pop"}`}>0{index + 1} · {gt(language, rule.badge)}</span>
                  <span className="mt-1 block text-base font-black">{gt(language, rule.title)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-peach p-4 text-sm font-black leading-6 text-ink">
            {language === "zh"
              ? "学习顺序：A2 先会完成时；简单过去式先认高频词；过去完成式先能看懂。"
              : "Order: learn perfect tense first for A2; recognize frequent simple past; understand past perfect first."}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-[30px] bg-ink p-6 text-white">
            <p className="text-sm font-black tracking-[0.16em] text-orange-200">Past Time</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">{gt(language, currentRule.title)}</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-blue-50">{gt(language, currentRule.why)}</p>
            <div className="mt-5 rounded-[24px] bg-white p-5 text-ink">
              <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "规则公式" : "Pattern"}</p>
              <p className="mt-2 text-3xl font-black leading-tight">{gt(language, currentRule.rule)}</p>
            </div>
          </div>

          <RulePartNavigator
            title={language === "zh" ? "当前过去表达分成三块" : "This past-time rule has three parts"}
            activeId={activeDetailPart}
            onSelect={setActiveDetailPart}
            items={[
              {
                id: "rule",
                label: language === "zh" ? "规则和例句" : "Rule",
                body: language === "zh" ? "先看什么时候用，以及三条例句。" : "When to use it, plus three core examples.",
              },
              {
                id: "table",
                label: language === "zh" ? "过去分词表" : "Participle Table",
                body: language === "zh" ? "把高频办事动词先当词块记。" : "Learn frequent task verbs as chunks first.",
              },
              {
                id: "practice",
                label: language === "zh" ? "错误和练习" : "Practice",
                body: language === "zh" ? "对比错句，做题，再收口判断。" : "Compare mistakes, quiz, then summarize.",
              },
            ]}
          />

          {activeDetailPart === "rule" ? (
            <>
          <div className="mt-5 grid gap-3">
            {currentRule.examples.map(([base, sentence, zh]) => (
              <article key={`${base}-${sentence}`} className="rounded-[24px] border border-blue-100 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-pop">{base}</p>
                    <p className="mt-2 text-2xl font-black leading-8 text-ink">{sentence}</p>
                    <p className="mt-2 font-bold text-ocean/65">{gt(language, zh)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakDutch(sentence)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-4 py-3 font-black text-ocean transition hover:bg-peach"
                  >
                    <Play size={16} />
                    {language === "zh" ? "听例句" : "Play"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] bg-peach p-5">
            <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "为什么这样安排" : "Why this order"}</p>
            <p className="mt-2 font-black leading-8 text-ink">{gt(language, currentRule.note)}</p>
          </div>
            </>
          ) : null}

          {activeDetailPart === "table" ? (
          <div className="mt-7 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
            <h3 className="text-2xl font-black text-ink">{language === "zh" ? "过去分词小表" : "Participle Mini Table"}</h3>
            <p className="mt-2 font-bold leading-7 text-ocean/70">
              {language === "zh" ? "先把 A2 高频办事动词当词块记，不急着背所有拼写变化。" : "Treat frequent A2 task verbs as chunks first; do not memorize every spelling change yet."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {participleBlocks.map(([base, participle, sentence]) => (
                <article key={base} className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-pop">{base} → {participle}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-lg font-black text-ink">{sentence}</p>
                    <button
                      type="button"
                      onClick={() => speakDutch(sentence)}
                      className="rounded-full bg-skywash p-2 text-ocean hover:bg-peach"
                      aria-label={`Play ${sentence}`}
                    >
                      <Play size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
          ) : null}

          {activeDetailPart === "practice" ? (
            <>
          <div className="mt-7 rounded-[28px] bg-slate-50 p-5 ring-1 ring-blue-100">
            <h3 className="text-2xl font-black text-ink">{language === "zh" ? "常见错误" : "Common Mistakes"}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {pastMistakes.map(([wrong, correct, reason]) => (
                <article key={wrong} className="rounded-2xl bg-white p-4">
                  <p className="font-black text-red-600">x {wrong}</p>
                  <p className="mt-1 font-black text-emerald-700">✓ {correct}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{gt(language, reason)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-[28px] border border-blue-100 bg-white p-5">
            <h3 className="text-2xl font-black text-ink">{language === "zh" ? "立刻练习" : "Practice Now"}</h3>
            <div className="mt-4 grid gap-4">
              {pastPractice.map((question) => {
                const selected = answers[question.id];
                const isCorrect = selected === question.answer;
                return (
                  <article key={question.id} className="rounded-[22px] bg-slate-50 p-4">
                    <p className="text-lg font-black leading-7 text-ink">{gt(language, question.question)}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                          className={`rounded-2xl px-4 py-3 text-left font-black ring-1 ${
                            selected === option
                              ? isCorrect
                                ? "bg-mint text-ocean ring-emerald-100"
                                : "bg-peach text-ocean ring-orange-100"
                              : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {selected ? (
                      <p className={`mt-3 rounded-2xl p-3 text-sm font-black leading-6 ${isCorrect ? "bg-mint text-ocean" : "bg-peach text-ocean"}`}>
                        {isCorrect ? (language === "zh" ? "对了。" : "Correct.") : `${language === "zh" ? "答案" : "Answer"}: ${question.answer}`} {gt(language, question.explanation)}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-7 rounded-[28px] bg-ink p-5 text-white">
            <p className="text-sm font-black tracking-[0.14em] text-orange-200">{language === "zh" ? "收口判断" : "Quick Decision"}</p>
            <p className="mt-3 text-3xl font-black leading-tight">
              {gt(language, "已经做了：Ik heb gebeld")}<br />
              {gt(language, "过去状态：Ik was ziek")}<br />
              {gt(language, "之前已经：Ik had betaald")}
            </p>
          </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function RulesPage() {
  const { language } = useLanguage();
  const [activeTool, setActiveTool] = useState<ToolId>("verbs");
  const [focus, setFocus] = useState<string | undefined>();
  const [baseCompleted, setBaseCompleted] = useState(false);
  const concept = grammarConcepts[activeTool];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tool = params.get("tool");
    const mode = params.get("mode");
    const focusParam = params.get("focus");
    if (tool === "verbs" || tool === "articles" || tool === "plurals" || tool === "order" || tool === "prepositions" || tool === "adjectives" || tool === "past") {
      setActiveTool(tool);
    } else if (mode === "foundation") {
      setActiveTool("verbs");
    }
    if (focusParam) {
      setFocus(focusParam);
    }
    setBaseCompleted(getLearningProgress().grammarBaseCompleted);
  }, []);

  const completeGrammarBase = () => {
    updateLearningProgress({
      grammarBaseCompleted: true,
      currentStep: "lesson",
      lastVisitedRoute: "/rules",
    });
    setBaseCompleted(true);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7">
        <p className="text-sm font-black tracking-[0.18em] text-pop">Rule</p>
        <h1 className="mt-3 text-5xl font-black text-ink">{language === "zh" ? "语法规则" : "Grammar Rules"}</h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-ocean/70">
          {language === "zh"
            ? "先学 A0 生存句需要的最小规则，后面的 de/het、复数、完成时和可分动词都按每日内容遇到再补。"
            : "Start with the tiny rule base needed for A0 survival sentences. Add de/het, plurals, perfect tense, and separable verbs when daily content needs them."}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`rounded-[28px] p-5 text-left ring-1 transition ${
                isActive ? "bg-ink text-white ring-ink shadow-soft" : "bg-white text-ocean ring-blue-100 hover:bg-skywash"
              }`}
            >
              <Icon size={24} className={isActive ? "text-orange-200" : "text-pop"} />
              <p className="mt-4 text-xl font-black">{tool.title[language]}</p>
              <p className={`mt-2 text-sm font-bold leading-6 ${isActive ? "text-blue-50" : "text-ocean/65"}`}>{tool.body[language]}</p>
            </button>
          );
        })}
      </section>

      {activeTool !== "verbs" && activeTool !== "order" && activeTool !== "prepositions" && activeTool !== "adjectives" && activeTool !== "past" ? (
        <section className="mt-7 rounded-[34px] border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "先解释" : "Explanation first"}</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-ink">{concept.label[language]}</h2>
              <p className="mt-5 text-lg font-bold leading-8 text-ocean/75">{concept.what[language]}</p>
              <p className="mt-4 text-lg font-bold leading-8 text-ocean/75">{concept.why[language]}</p>
              <div className="mt-5 rounded-[24px] bg-peach p-5">
                <p className="text-sm font-black tracking-[0.14em] text-pop">{language === "zh" ? "中文学习者常见误区" : "Common Chinese-speaker mistake"}</p>
                <p className="mt-2 font-black leading-8 text-ink">{concept.chineseMistake[language]}</p>
              </div>
            </div>
            <div className="rounded-[30px] bg-ink p-6 text-white">
              <p className="text-sm font-black tracking-[0.16em] text-orange-200">{language === "zh" ? "规则公式" : "Pattern"}</p>
              <p className="mt-4 rounded-[22px] bg-white p-4 text-2xl font-black leading-9 text-ink">{concept.formula}</p>
              <div className="mt-5 grid gap-3">
                {concept.examples.map((example) => (
                  <div key={example} className="rounded-2xl bg-white/10 p-4 font-black text-blue-50">
                    {example}
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-2xl bg-pop p-4 font-black leading-7 text-ink">{concept.learnerAction[language]}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-7">
        {activeTool === "verbs" ? <PresentTenseModule language={language} /> : null}

        {activeTool === "articles" ? <ArticleDetector nouns={nounEntries} focusSingular={focus} /> : null}
        {activeTool === "plurals" ? <PluralTrainer patterns={pluralEntries} /> : null}
        {activeTool === "order" ? <SentenceOrderTrainer patterns={sentencePatterns} /> : null}
        {activeTool === "prepositions" ? <PrepositionPatternModule language={language} /> : null}
        {activeTool === "adjectives" ? <ComparisonOrdinalModule language={language} /> : null}
        {activeTool === "past" ? <PastTenseModule language={language} /> : null}
      </section>

      <section className="mt-7">
        {baseCompleted ? (
          <NextStepCard
            eyebrow={language === "zh" ? "学习接力" : "Learning handoff"}
            currentLabel={language === "zh" ? "最小语法已完成" : "Grammar base complete"}
            title={language === "zh" ? "下一步：A0 Day 1" : "Next: A0 Day 1"}
            reason={language === "zh" ? "你已经有生存词和最小规则了，现在可以开始每日课程和单词泡泡。" : "You have starter words and the tiny rule base. Now start the daily lesson and word bubbles."}
            buttonLabel={language === "zh" ? "进入 A0 Day 1" : "Open A0 Day 1"}
            route="/learn/a0-01"
          />
        ) : (
          <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-pop">
                {language === "zh" ? "最小语法地基" : "Grammar Base 1"}
              </p>
              <p className="mt-2 font-bold leading-7 text-ocean/70">
                {language === "zh"
                  ? "先只补能马上用上的规则：ik ben、ik heb、简单词序和 Waar woon je 这类问题。其他规则遇到再学。"
                  : "Only add the rules you can use right away: ik ben, ik heb, simple word order, and questions like Waar woon je. Learn the rest on demand."}
              </p>
            </div>
            <button
              type="button"
              onClick={completeGrammarBase}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean sm:mt-0"
            >
              {language === "zh" ? "完成最小语法" : "Mark Grammar Base 1 complete"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
