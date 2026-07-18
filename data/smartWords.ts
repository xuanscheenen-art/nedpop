import { dutchSyllabus } from "@/data/dutchSyllabus";
import { meaningForUsableSentence, primaryUsableSentenceFor } from "@/lib/vocabularySentences";
import type { CourseLevel, LocalizedText, MiniQuiz, SmartWord } from "@/types/course";
import type { SyllabusVocabularyTheme, SyllabusVocabularyWord } from "@/types/syllabus";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

const quiz = (id: string, zh: string, en: string, answer: string): MiniQuiz => ({
  id,
  question: lt(zh, en),
  options: [lt(answer, answer), lt("别的意思", "another meaning"), lt("不确定", "not sure")],
  answerIndex: 0,
  explanation: lt("看拆词和例句，不要孤立背。", "Use the breakdown and sentence, not isolated memorization."),
});

type WordInput = Omit<SmartWord, "meaning" | "wordBreakdown" | "smartAssociation" | "exampleSentence" | "miniQuiz"> & {
  zh: string;
  en: string;
  breakdownZh: string;
  breakdownEn: string;
  associationZh: string;
  associationEn: string;
  sentenceDutch: string;
  sentenceZh: string;
  sentenceEn: string;
};

const makeWord = (input: WordInput): SmartWord => ({
  id: input.id,
  level: input.level,
  dutch: input.dutch,
  article: input.article,
  meaning: lt(input.zh, input.en),
  wordBreakdown: lt(input.breakdownZh, input.breakdownEn),
  smartAssociation: lt(input.associationZh, input.associationEn),
  chineseMemoryHook: input.chineseMemoryHook,
  englishBridge: input.englishBridge,
  soundHint: input.soundHint,
  exampleSentence: {
    dutch: input.sentenceDutch,
    meaning: lt(input.sentenceZh, input.sentenceEn),
  },
  commonPhrase: input.commonPhrase,
  commonMistake: input.commonMistake,
  relatedWords: input.relatedWords,
  scenarioTags: input.scenarioTags,
  miniQuiz: [quiz(`${input.id}-quiz`, `${input.dutch} 是什么意思？`, `What does ${input.dutch} mean?`, input.en)],
});

const baseSmartWords: SmartWord[] = [
  makeWord({ id: "word-hallo", level: "A0", dutch: "hallo", zh: "你好", en: "hello", breakdownZh: "整体记忆", breakdownEn: "learn as a greeting chunk", associationZh: "见面第一声 hallo。", associationEn: "First greeting word.", chineseMemoryHook: "像 hello，一见面就 hallo。", englishBridge: "Looks like hello.", sentenceDutch: "Hallo, ik ben Lin.", sentenceZh: "你好，我是 Lin。", sentenceEn: "Hello, I am Lin.", relatedWords: ["dag", "ik"], scenarioTags: ["greeting"] }),
  makeWord({ id: "word-dag", level: "A0", dutch: "dag", zh: "你好/再见/天", en: "hello/bye/day", breakdownZh: "一个词多个日常用途", breakdownEn: "one common daily word", associationZh: "见面和告别都能 dag。", associationEn: "Used for greeting and goodbye.", chineseMemoryHook: "一天 dag 开始也 dag 结束。", englishBridge: "Like day in meaning when used as noun.", sentenceDutch: "Dag, tot morgen.", sentenceZh: "再见，明天见。", sentenceEn: "Bye, see you tomorrow.", relatedWords: ["hallo", "morgen"], scenarioTags: ["greeting"] }),
  makeWord({ id: "word-ja", level: "A0", dutch: "ja", zh: "是/对", en: "yes", breakdownZh: "短回答词", breakdownEn: "short answer word", associationZh: "点头就是 ja。", associationEn: "The yes word.", chineseMemoryHook: "像德语 ja，也表示 yes。", englishBridge: "Means yes.", sentenceDutch: "Ja, ik ben Lin.", sentenceZh: "是的，我是 Lin。", sentenceEn: "Yes, I am Lin.", relatedWords: ["nee"], scenarioTags: ["yes-no"] }),
  makeWord({ id: "word-nee", level: "A0", dutch: "nee", zh: "不/不是", en: "no", breakdownZh: "短回答词", breakdownEn: "short answer word", associationZh: "摇头就是 nee。", associationEn: "The no word.", chineseMemoryHook: "nee 听起来像“no”的伙伴。", englishBridge: "Means no.", sentenceDutch: "Nee, ik woon niet in Den Haag.", sentenceZh: "不，我不住在海牙。", sentenceEn: "No, I do not live in The Hague.", relatedWords: ["ja", "niet"], scenarioTags: ["yes-no"] }),
  makeWord({ id: "word-ik", level: "A0", dutch: "ik", zh: "我", en: "I", breakdownZh: "自我介绍核心词", breakdownEn: "core self-introduction word", associationZh: "所有自我介绍从 ik 开始。", associationEn: "Start many A0 sentences with ik.", chineseMemoryHook: "ik = I，先记最短句。", englishBridge: "Means I.", sentenceDutch: "Ik ben student.", sentenceZh: "我是学生。", sentenceEn: "I am a student.", relatedWords: ["jij", "ben"], scenarioTags: ["introduction"] }),
  makeWord({ id: "word-jij", level: "A0", dutch: "jij", zh: "你", en: "you", breakdownZh: "问对方时用", breakdownEn: "used for you", associationZh: "jij 是面对面问你。", associationEn: "Informal you.", chineseMemoryHook: "问你叫什么：Hoe heet jij? 初期先认 jij。", englishBridge: "Means you.", sentenceDutch: "Ben jij Anna?", sentenceZh: "你是 Anna 吗？", sentenceEn: "Are you Anna?", relatedWords: ["ik", "ben"], scenarioTags: ["introduction"] }),
  makeWord({ id: "word-naam", level: "A0", dutch: "naam", article: "de", zh: "名字", en: "name", breakdownZh: "naam 像 name", breakdownEn: "looks like name", associationZh: "naam 和 name 很像。", associationEn: "Strong English bridge.", chineseMemoryHook: "问名字就找 naam/name。", englishBridge: "Very close to name.", soundHint: lt("aa 是长开口音。", "aa is a long open vowel."), sentenceDutch: "Mijn naam is Lin.", sentenceZh: "我的名字是 Lin。", sentenceEn: "My name is Lin.", commonPhrase: { dutch: "mijn naam", meaning: lt("我的名字", "my name") }, relatedWords: ["ik", "hallo"], scenarioTags: ["introduction"] }),
  makeWord({ id: "word-woon", level: "A0", dutch: "woon", zh: "居住", en: "live", breakdownZh: "wonen 的 ik 形式", breakdownEn: "ik form of wonen", associationZh: "woon = 我住。", associationEn: "Use with ik for where you live.", chineseMemoryHook: "我住在哪：ik woon in...", soundHint: lt("oo 是圆唇长音。", "oo is a rounded long vowel."), sentenceDutch: "Ik woon in Utrecht.", sentenceZh: "我住在 Utrecht。", sentenceEn: "I live in Utrecht.", commonPhrase: { dutch: "Ik woon in...", meaning: lt("我住在……", "I live in...") }, relatedWords: ["huis", "woning"], scenarioTags: ["home"] }),
  makeWord({ id: "word-kom", level: "A0", dutch: "kom", zh: "来/来自", en: "come", breakdownZh: "komen 的 ik 形式", breakdownEn: "ik form of komen", associationZh: "kom uit = 来自。", associationEn: "Use kom uit for origin.", chineseMemoryHook: "我来自中国：ik kom uit China。", englishBridge: "Related to come.", sentenceDutch: "Ik kom uit China.", sentenceZh: "我来自中国。", sentenceEn: "I come from China.", commonPhrase: { dutch: "Ik kom uit...", meaning: lt("我来自……", "I come from...") }, relatedWords: ["ik", "China"], scenarioTags: ["introduction"] }),
  makeWord({ id: "word-goed", level: "A0", dutch: "goed", zh: "好", en: "good", breakdownZh: "goed 像 good", breakdownEn: "looks like good", associationZh: "good 的荷兰语伙伴。", associationEn: "A strong English bridge.", chineseMemoryHook: "问候回答：goed。", englishBridge: "Looks like good.", soundHint: lt("oe 像 food 的 oo。", "oe sounds like oo in food."), sentenceDutch: "Het gaat goed.", sentenceZh: "一切很好。", sentenceEn: "It is going well.", relatedWords: ["hallo", "beter"], scenarioTags: ["greeting"] }),
  makeWord({ id: "word-goedemorgen", level: "A0", dutch: "goedemorgen", zh: "早上好", en: "good morning", breakdownZh: "goed + morgen：好 + 早上/明天", breakdownEn: "goed + morgen: good + morning/tomorrow", associationZh: "早上见面说 goedemorgen，和 morgen、goedemiddag、goedenavond 成一组。", associationEn: "Use goedemorgen in the morning; connect it with morgen, goedemiddag, and goedenavond.", chineseMemoryHook: "goed = 好，morgen = 早上/明天；早上好就是 goedemorgen。", englishBridge: "Good morning phrase.", sentenceDutch: "Goedemorgen.", sentenceZh: "早上好。", sentenceEn: "Good morning.", commonPhrase: { dutch: "Goedemorgen.", meaning: lt("早上好。", "Good morning.") }, relatedWords: ["morgen", "goedemiddag", "goedenavond"], scenarioTags: ["greeting", "time"] }),
  makeWord({ id: "word-goedemiddag", level: "A0", dutch: "goedemiddag", zh: "下午好", en: "good afternoon", breakdownZh: "goed + middag：好 + 下午", breakdownEn: "goed + middag: good + afternoon", associationZh: "下午见面说 goedemiddag，和 goedemorgen / goedenavond 按一天顺序记。", associationEn: "Use goedemiddag in the afternoon; learn it with goedemorgen and goedenavond.", chineseMemoryHook: "middag = 下午；下午好就是 goedemiddag。", englishBridge: "Good afternoon phrase.", sentenceDutch: "Goedemiddag.", sentenceZh: "下午好。", sentenceEn: "Good afternoon.", commonPhrase: { dutch: "Goedemiddag.", meaning: lt("下午好。", "Good afternoon.") }, relatedWords: ["middag", "goedemorgen", "goedenavond"], scenarioTags: ["greeting", "time"] }),
  makeWord({ id: "word-goedenavond", level: "A0", dutch: "goedenavond", zh: "晚上好", en: "good evening", breakdownZh: "goed + avond：好 + 晚上", breakdownEn: "goed + avond: good + evening", associationZh: "晚上见面说 goedenavond，和 avond、goedemorgen、goedemiddag 成一组。", associationEn: "Use goedenavond in the evening; connect it with avond, goedemorgen, and goedemiddag.", chineseMemoryHook: "avond = 晚上；晚上好就是 goedenavond。", englishBridge: "Good evening phrase.", sentenceDutch: "Goedenavond.", sentenceZh: "晚上好。", sentenceEn: "Good evening.", commonPhrase: { dutch: "Goedenavond.", meaning: lt("晚上好。", "Good evening.") }, relatedWords: ["avond", "goedemorgen", "goedemiddag"], scenarioTags: ["greeting", "time"] }),

  makeWord({ id: "word-huis", level: "A1", dutch: "huis", article: "het", zh: "房子/家", en: "house", breakdownZh: "huis = house", breakdownEn: "huis is house", associationZh: "房子就是 huis。", associationEn: "Close to house.", chineseMemoryHook: "huis 和 house 很像。", englishBridge: "Looks like house.", soundHint: lt("ui 是荷兰语特色音。", "ui is a special Dutch sound."), sentenceDutch: "Het huis is groot.", sentenceZh: "这个房子很大。", sentenceEn: "The house is big.", commonMistake: lt("说 het huis，不是 de huis。", "Say het huis, not de huis."), relatedWords: ["woning", "ziekenhuis"], scenarioTags: ["home"] }),
  makeWord({ id: "word-fiets", level: "A1", dutch: "fiets", article: "de", zh: "自行车", en: "bike", breakdownZh: "整体记忆", breakdownEn: "learn as a daily transport word", associationZh: "荷兰生活必备：fiets。", associationEn: "A core Dutch transport word.", chineseMemoryHook: "在荷兰每天见到 fiets。", soundHint: lt("ie 像 see 的 ee。", "ie sounds like ee in see."), sentenceDutch: "Ik ga met de fiets.", sentenceZh: "我骑自行车去。", sentenceEn: "I go by bike.", relatedWords: ["station", "trein"], scenarioTags: ["transport"] }),
  makeWord({ id: "word-station", level: "A1", dutch: "station", article: "het", zh: "车站", en: "station", breakdownZh: "和 English station 很像", breakdownEn: "same as English station", associationZh: "火车从 station 出发。", associationEn: "Same spelling bridge.", chineseMemoryHook: "station 直接认，注意 het。", englishBridge: "Same as station.", sentenceDutch: "Het station is dichtbij.", sentenceZh: "车站很近。", sentenceEn: "The station is nearby.", relatedWords: ["trein", "fiets"], scenarioTags: ["transport"] }),
  makeWord({ id: "word-supermarkt", level: "A1", dutch: "supermarkt", article: "de", zh: "超市", en: "supermarket", breakdownZh: "super + markt", breakdownEn: "super + market", associationZh: "super market = supermarkt。", associationEn: "Close to supermarket.", chineseMemoryHook: "买菜去 supermarkt。", englishBridge: "Very close to supermarket.", sentenceDutch: "Ik ga naar de supermarkt.", sentenceZh: "我去超市。", sentenceEn: "I go to the supermarket.", relatedWords: ["brood", "boodschappen"], scenarioTags: ["shopping"] }),
  makeWord({ id: "word-brood", level: "A1", dutch: "brood", article: "het", zh: "面包", en: "bread", breakdownZh: "日常食物词", breakdownEn: "daily food word", associationZh: "早餐面包 brood。", associationEn: "Common grocery word.", chineseMemoryHook: "买面包：brood。", soundHint: lt("oo 是圆唇长音。", "oo is a rounded long vowel."), sentenceDutch: "Ik koop brood.", sentenceZh: "我买面包。", sentenceEn: "I buy bread.", relatedWords: ["supermarkt", "boodschappen"], scenarioTags: ["shopping"] }),
  makeWord({ id: "word-water", level: "A1", dutch: "water", article: "het", zh: "水", en: "water", breakdownZh: "和 English water 相似", breakdownEn: "close to water", associationZh: "water 就是水。", associationEn: "Strong English bridge.", chineseMemoryHook: "拼写像 water，发音按荷兰语。", englishBridge: "Looks like water.", sentenceDutch: "Ik drink water.", sentenceZh: "我喝水。", sentenceEn: "I drink water.", relatedWords: ["brood", "goed"], scenarioTags: ["food"] }),
  makeWord({ id: "word-trein", level: "A1", dutch: "trein", article: "de", zh: "火车", en: "train", breakdownZh: "trein 像 train", breakdownEn: "close to train", associationZh: "train 的荷兰语 cousin。", associationEn: "Looks like train.", chineseMemoryHook: "trein 和 train 很像，ei 要按荷兰语读。", englishBridge: "Close to train.", soundHint: lt("ei 和 ij 多数同音。", "ei usually sounds like ij."), sentenceDutch: "De trein heeft vertraging.", sentenceZh: "火车晚点了。", sentenceEn: "The train is delayed.", commonPhrase: { dutch: "de trein nemen", meaning: lt("坐火车", "take the train") }, relatedWords: ["station", "vertraging"], scenarioTags: ["transport"] }),
  makeWord({ id: "word-familie", level: "A1", dutch: "familie", article: "de", zh: "家庭/家人", en: "family", breakdownZh: "familie 像 family", breakdownEn: "close to family", associationZh: "family = familie。", associationEn: "Strong bridge to family.", chineseMemoryHook: "介绍家人时用 familie。", englishBridge: "Close to family.", sentenceDutch: "Mijn familie woont in China.", sentenceZh: "我的家人住在中国。", sentenceEn: "My family lives in China.", relatedWords: ["ik", "woon"], scenarioTags: ["family"] }),
  makeWord({ id: "word-werk", level: "A1", dutch: "werk", article: "het", zh: "工作", en: "work", breakdownZh: "werk 像 work", breakdownEn: "close to work", associationZh: "work = werk。", associationEn: "Strong English bridge.", chineseMemoryHook: "去工作：naar werk。", englishBridge: "Looks like work.", sentenceDutch: "Ik ga naar mijn werk.", sentenceZh: "我去上班。", sentenceEn: "I go to my work.", relatedWords: ["school", "ziek"], scenarioTags: ["work"] }),
  makeWord({ id: "word-school", level: "A1", dutch: "school", article: "de", zh: "学校", en: "school", breakdownZh: "和 English school 相同", breakdownEn: "same spelling as school", associationZh: "school 直接认，sch 要荷兰语读。", associationEn: "Same spelling, Dutch sound.", chineseMemoryHook: "school 认识，但 sch 不读 sh。", englishBridge: "Same as school.", soundHint: lt("sch 是 s + ch。", "sch is s plus Dutch ch."), sentenceDutch: "Ik ga naar school.", sentenceZh: "我去学校。", sentenceEn: "I go to school.", relatedWords: ["fiets", "Nederlands"], scenarioTags: ["study"] }),

  makeWord({ id: "word-ziekenhuis", level: "A2", dutch: "ziekenhuis", article: "het", zh: "医院", en: "hospital", breakdownZh: "ziek + huis", breakdownEn: "sick + house", associationZh: "医院就是病人去的 house。", associationEn: "A hospital is a house for sick people.", chineseMemoryHook: "生病的人去的 house，就是 ziekenhuis。", englishBridge: "ziek is like sick, huis is house.", soundHint: lt("ui in huis 是特殊荷兰语音。", "ui in huis is a special Dutch sound."), sentenceDutch: "Mijn moeder ligt in het ziekenhuis.", sentenceZh: "我妈妈在医院。", sentenceEn: "My mother is in the hospital.", commonPhrase: { dutch: "naar het ziekenhuis gaan", meaning: lt("去医院", "go to the hospital") }, commonMistake: lt("说 het ziekenhuis，因为最后是 het huis。", "Say het ziekenhuis because the final noun huis is het."), relatedWords: ["ziek", "huisarts", "tandarts", "apotheek"], scenarioTags: ["healthcare"] }),
  makeWord({ id: "word-huisarts", level: "A2", dutch: "huisarts", article: "de", zh: "家庭医生", en: "GP / family doctor", breakdownZh: "huis + arts", breakdownEn: "house + doctor", associationZh: "跟家庭相关的医生。", associationEn: "The doctor connected to your home situation.", chineseMemoryHook: "家里的 doctor，不是 hospital doctor，是 huisarts。", englishBridge: "huis is house; arts means doctor.", soundHint: lt("ui 要圆嘴。", "ui needs rounded lips."), sentenceDutch: "Ik bel de huisarts.", sentenceZh: "我打电话给家庭医生。", sentenceEn: "I call the GP.", commonPhrase: { dutch: "de huisarts bellen", meaning: lt("打电话给家庭医生", "call the GP") }, relatedWords: ["ziekenhuis", "afspraak", "ziek"], scenarioTags: ["healthcare"] }),
  makeWord({ id: "word-tandarts", level: "A2", dutch: "tandarts", article: "de", zh: "牙医", en: "dentist", breakdownZh: "tand + arts", breakdownEn: "tooth + doctor", associationZh: "牙齿医生就是 tandarts。", associationEn: "A tooth doctor.", chineseMemoryHook: "tand 是牙，arts 是医生。", englishBridge: "arts means doctor.", sentenceDutch: "Ik ga naar de tandarts.", sentenceZh: "我去看牙医。", sentenceEn: "I go to the dentist.", commonPhrase: { dutch: "naar de tandarts gaan", meaning: lt("去看牙医", "go to the dentist") }, relatedWords: ["huisarts", "afspraak"], scenarioTags: ["healthcare"] }),
  makeWord({ id: "word-afspraak", level: "A2", dutch: "afspraak", article: "de", zh: "预约", en: "appointment", breakdownZh: "af + spraak", breakdownEn: "set + speech", associationZh: "已经说定的安排。", associationEn: "A spoken agreement that is set.", chineseMemoryHook: "说好了的时间就是 afspraak。", englishBridge: "spraak connects to speech.", soundHint: lt("aa 是长开口音。", "aa is a long open vowel."), sentenceDutch: "Ik heb een afspraak om tien uur.", sentenceZh: "我十点有一个预约。", sentenceEn: "I have an appointment at ten.", commonPhrase: { dutch: "een afspraak maken", meaning: lt("预约", "make an appointment") }, relatedWords: ["huisarts", "gemeente"], scenarioTags: ["booking"] }),
  makeWord({ id: "word-gemeente", level: "A2", dutch: "gemeente", article: "de", zh: "市政厅/市政府", en: "municipality", breakdownZh: "ge + meen + te", breakdownEn: "chunked official word", associationZh: "登记地址、办材料去 gemeente。", associationEn: "Local office for forms and registration.", chineseMemoryHook: "办官方事情常去 gemeente。", soundHint: lt("ee 是清楚长音。", "ee is a clear long vowel."), sentenceDutch: "Ik ga naar de gemeente.", sentenceZh: "我去市政厅。", sentenceEn: "I go to the municipality.", commonPhrase: { dutch: "naar de gemeente gaan", meaning: lt("去市政厅", "go to the municipality") }, relatedWords: ["afspraak", "woning"], scenarioTags: ["official"] }),
  makeWord({ id: "word-verzekering", level: "A2", dutch: "verzekering", article: "de", zh: "保险", en: "insurance", breakdownZh: "ver + zeker + ing", breakdownEn: "zeker means sure/certain", associationZh: "把风险变 zeker 一点。", associationEn: "Coverage makes risk more certain.", chineseMemoryHook: "zeker 是确定，verzekering 让风险更确定。", englishBridge: "zeker means sure.", soundHint: lt("-ing 常是 de 词。", "-ing words are often de words."), sentenceDutch: "Ik heb een zorgverzekering nodig.", sentenceZh: "我需要一个医疗保险。", sentenceEn: "I need health insurance.", relatedWords: ["rekening", "huisarts"], scenarioTags: ["healthcare", "admin"] }),
  makeWord({ id: "word-rekening", level: "A2", dutch: "rekening", article: "de", zh: "账单/账户", en: "bill / account", breakdownZh: "reken + ing", breakdownEn: "reken means calculate", associationZh: "算出来的账。", associationEn: "A money item connected to calculating.", chineseMemoryHook: "reken 像 reckon/calculate，算出来就是账。", englishBridge: "reken links to reckon.", sentenceDutch: "Ik betaal de rekening.", sentenceZh: "我付账单。", sentenceEn: "I pay the bill.", commonPhrase: { dutch: "de rekening betalen", meaning: lt("付账单", "pay the bill") }, relatedWords: ["verzekering", "geld"], scenarioTags: ["payment"] }),
  makeWord({ id: "word-woning", level: "A2", dutch: "woning", article: "de", zh: "住房", en: "home / dwelling", breakdownZh: "woon + ing", breakdownEn: "place for wonen", associationZh: "wonen 是住，woning 是住的地方。", associationEn: "A place for living.", chineseMemoryHook: "wonen → woning，住的地方。", sentenceDutch: "Ik zoek een woning.", sentenceZh: "我在找住房。", sentenceEn: "I am looking for a home.", commonPhrase: { dutch: "een woning huren", meaning: lt("租住房", "rent a home") }, relatedWords: ["huis", "gemeente"], scenarioTags: ["housing"] }),
  makeWord({ id: "word-boodschappen", level: "A2", dutch: "boodschappen", zh: "购物/日用品", en: "groceries / errands", breakdownZh: "bood + schap + pen", breakdownEn: "daily errand chunk", associationZh: "去超市买的一堆东西。", associationEn: "The things you go out to get.", chineseMemoryHook: "去超市买东西就是 boodschappen doen。", soundHint: lt("sch 是 s + ch，-en 弱读。", "sch is s + ch; -en is relaxed."), sentenceDutch: "Ik doe boodschappen.", sentenceZh: "我买日用品。", sentenceEn: "I do groceries.", commonPhrase: { dutch: "boodschappen doen", meaning: lt("买菜/采购", "do groceries") }, relatedWords: ["supermarkt", "brood"], scenarioTags: ["shopping"] }),
  makeWord({ id: "word-vertraging", level: "A2", dutch: "vertraging", article: "de", zh: "延误", en: "delay", breakdownZh: "ver + traag + ing", breakdownEn: "traag means slow", associationZh: "火车变慢了，就是 vertraging。", associationEn: "A delay feels slow.", chineseMemoryHook: "traag 是慢，vertraging 就是延误。", soundHint: lt("-ing 常是 de 词。", "-ing words are often de words."), sentenceDutch: "De trein heeft vertraging.", sentenceZh: "火车晚点了。", sentenceEn: "The train is delayed.", commonPhrase: { dutch: "vertraging hebben", meaning: lt("有延误", "be delayed") }, relatedWords: ["trein", "station"], scenarioTags: ["transport"] }),
];

const isCourseLevel = (level: string): level is CourseLevel => level === "A0" || level === "A1" || level === "A2" || level === "B1";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getSoundHint = (dutch: string): LocalizedText | undefined => {
  const soundHints: Array<[string, LocalizedText]> = [
    ["sch", lt("sch 是 s + 荷兰语 ch，不要读成英语 sh。", "sch is s plus Dutch ch, not English sh.")],
    ["ui", lt("ui 是荷兰语特色圆唇音，先夸张练。", "ui is a special rounded Dutch sound; exaggerate it first.")],
    ["oe", lt("oe 接近 food 里的 oo，不是中文“欧”。", "oe is close to oo in food, not an English-style oh.")],
    ["eu", lt("eu 是圆唇音，中文里没有完全一样的音。", "eu is a rounded vowel without an exact Chinese match.")],
    ["ij", lt("ij 和 ei 多数同音。", "ij usually sounds like ei.")],
    ["ei", lt("ei 和 ij 多数同音。", "ei usually sounds like ij.")],
    ["aa", lt("aa 是长开口音。", "aa is a long open vowel.")],
    ["ee", lt("ee 是清楚的长音。", "ee is a clear long vowel.")],
    ["oo", lt("oo 是圆唇长音。", "oo is a rounded long vowel.")],
    ["uu", lt("uu 要把嘴唇收圆。", "uu needs rounded lips.")],
    ["ch", lt("ch 是喉后部摩擦音，不是英语 ch。", "ch is a back-of-throat fricative, not English ch.")],
  ];

  return soundHints.find(([sound]) => dutch.includes(sound))?.[1];
};

const commandObjects: Record<string, string> = {
  begin: "nu",
  klik: "hier",
  lees: "de zin",
  luister: "goed",
  open: "de app",
  schrijf: "mijn naam",
  sluit: "de app",
  stop: "nu",
  zeg: "hallo",
};

const routineObjects: Record<string, string> = {
  bellen: "de huisarts",
  drinken: "water",
  eten: "brood",
  koken: "vandaag",
  leren: "Nederlands",
  lezen: "de zin",
  lopen: "naar huis",
  opstaan: "vroeg",
  slapen: "goed",
  wassen: "mijn handen",
  werken: "vandaag",
  schrijven: "mijn naam",
};

const actionObjectFor = (word: string) => commandObjects[word] ?? routineObjects[word];

const actionSentenceFor = (word: string) => {
  const sentences: Record<string, string> = {
    begin: "Ik begin nu.",
    bellen: "Ik bel de huisarts.",
    drinken: "Ik drink water.",
    eten: "Ik eet brood.",
    klik: "Ik klik hier.",
    koken: "Ik kook vandaag.",
    leren: "Ik leer Nederlands.",
    lees: "Ik lees de zin.",
    lezen: "Ik lees de zin.",
    luister: "Ik luister goed.",
    lopen: "Ik loop naar huis.",
    open: "Ik open de app.",
    opstaan: "Ik sta vroeg op.",
    slapen: "Ik slaap goed.",
    schrijf: "Ik schrijf mijn naam.",
    schrijven: "Ik schrijf mijn naam.",
    sluit: "Ik sluit de app.",
    stop: "Ik stop nu.",
    wassen: "Ik was mijn handen.",
    werken: "Ik werk vandaag.",
    zeg: "Ik zeg hallo.",
  };
  return sentences[word];
};

const actionPhraseFor = (word: string) => {
  const phrases: Record<string, string> = {
    begin: "begin nu",
    bellen: "de huisarts bellen",
    drinken: "water drinken",
    eten: "brood eten",
    klik: "klik hier",
    koken: "vandaag koken",
    leren: "Nederlands leren",
    lees: "lees de zin",
    lezen: "de zin lezen",
    luister: "luister goed",
    lopen: "naar huis lopen",
    open: "open de app",
    opstaan: "vroeg opstaan",
    slapen: "goed slapen",
    schrijf: "schrijf mijn naam",
    schrijven: "mijn naam schrijven",
    sluit: "sluit de app",
    stop: "stop nu",
    wassen: "mijn handen wassen",
    werken: "vandaag werken",
    zeg: "zeg hallo",
  };
  return phrases[word];
};

const makeExampleSentence = (level: CourseLevel, theme: SyllabusVocabularyTheme, word: SyllabusVocabularyWord) => {
  const actionSentence = actionSentenceFor(word.dutch);
  if (actionSentence) {
    return actionSentence;
  }

  return primaryUsableSentenceFor({
    dutch: word.dutch,
    article: word.article,
    theme: theme.id,
    phraseChunks: word.article ? [`${word.article} ${word.dutch}`] : [],
    exampleSentence: {
      dutch: word.article && level === "A0" ? `Dit is ${word.article} ${word.dutch}.` : `Wat betekent ${word.dutch}?`,
    },
  });
};

const makeExampleMeaning = (level: CourseLevel, theme: SyllabusVocabularyTheme, word: SyllabusVocabularyWord) => {
  const sentenceMeaning = meaningForUsableSentence(makeExampleSentence(level, theme, word));
  if (sentenceMeaning.zh !== "可直接使用的荷兰语句子。") {
    return lt(sentenceMeaning.zh, sentenceMeaning.en);
  }

  if (word.article) {
    return lt(`把 ${word.dutch} 放进「${theme.title.zh}」真实场景句。`, `Use ${word.dutch} in a real ${theme.title.en.toLowerCase()} sentence.`);
  }

  const actionObject = actionObjectFor(word.dutch);
  const actionSentence = actionSentenceFor(word.dutch);
  if (actionObject && actionSentence) {
    return lt(`练习这句：${actionSentence}`, `Practice this line: ${actionSentence}`);
  }

  if (level === "A0") {
    return lt(`我说“${word.meaning.zh}”。`, `I say "${word.meaning.en}".`);
  }

  if (level === "A1") {
    return lt(`我今天使用“${word.meaning.zh}”。`, `I use "${word.meaning.en}" today.`);
  }

  return lt(`我需要“${word.meaning.zh}”。`, `I need "${word.meaning.en}".`);
};

const memoryHookFor = (theme: SyllabusVocabularyTheme, word: SyllabusVocabularyWord) => {
  if (theme.id === "time-date") {
    return `${word.dutch} 是时间表达词，约时间、填日期或说日程时会用到。`;
  }
  return word.notesForChineseLearners ?? `${word.dutch} 的核心意思是“${word.meaning.zh}”，优先和常见搭配或自然短句一起记。`;
};

const englishBridgeFor = (theme: SyllabusVocabularyTheme, word: SyllabusVocabularyWord) => {
  if (theme.id === "time-date") {
    return `${word.dutch} is a time word.`;
  }
  return undefined;
};

const commandWordSet = new Set(Object.keys(commandObjects));
const routineWordSet = new Set(Object.keys(routineObjects));
const personWordSet = new Set(["mens", "man", "vrouw", "kind", "leraar", "student", "buurman", "buurvrouw", "vriend", "vriendin", "persoon"]);

const relatedWordsFor = (theme: SyllabusVocabularyTheme, word: SyllabusVocabularyWord) => {
  const themeWords = theme.coreWords.map((item) => item.dutch).filter((item) => item !== word.dutch);
  if (commandWordSet.has(word.dutch)) {
    return themeWords.filter((item) => commandWordSet.has(item)).slice(0, 6);
  }
  if (routineWordSet.has(word.dutch)) {
    return themeWords.filter((item) => routineWordSet.has(item)).slice(0, 6);
  }
  if (personWordSet.has(word.dutch)) {
    return themeWords.filter((item) => personWordSet.has(item)).slice(0, 6);
  }
  const index = theme.coreWords.findIndex((item) => item.dutch === word.dutch);
  const nearby = theme.coreWords
    .slice(Math.max(0, index - 3), index)
    .concat(theme.coreWords.slice(index + 1, index + 4))
    .map((item) => item.dutch)
    .filter((item) => item !== word.dutch);
  return nearby.length ? nearby.slice(0, 6) : themeWords.slice(0, 6);
};

const makeGeneratedSmartWord = (
  level: CourseLevel,
  theme: SyllabusVocabularyTheme,
  word: SyllabusVocabularyWord,
): SmartWord =>
  makeWord({
    id: `word-${slugify(word.dutch)}`,
    level,
    dutch: word.dutch,
    article: word.article,
    zh: word.meaning.zh,
    en: word.meaning.en,
    breakdownZh: word.notesForChineseLearners ?? `先把 ${word.dutch} 当成「${theme.title.zh}」场景词记。`,
    breakdownEn: `Learn ${word.dutch} as a ${theme.title.en.toLowerCase()} word.`,
    associationZh: `${word.dutch} 不单独背，直接放进「${theme.title.zh}」这个生活场景。`,
    associationEn: `Do not memorize ${word.dutch} alone. Connect it to the ${theme.title.en.toLowerCase()} scene.`,
    chineseMemoryHook: memoryHookFor(theme, word),
    englishBridge: englishBridgeFor(theme, word),
    soundHint: getSoundHint(word.dutch),
    sentenceDutch: makeExampleSentence(level, theme, word),
    sentenceZh: makeExampleMeaning(level, theme, word).zh,
    sentenceEn: makeExampleMeaning(level, theme, word).en,
    commonPhrase: word.article
      ? { dutch: `${word.article} ${word.dutch}`, meaning: lt(`${word.article} ${word.meaning.zh}`, `${word.article} ${word.meaning.en}`) }
      : actionPhraseFor(word.dutch)
        ? {
            dutch: actionPhraseFor(word.dutch) ?? word.dutch,
            meaning: lt(`把 ${word.meaning.zh} 放进可说短语。`, `Put ${word.meaning.en} into a usable phrase.`),
          }
        : undefined,
    relatedWords: relatedWordsFor(theme, word),
    scenarioTags: [theme.id],
  });

const baseDutchWords = new Set(baseSmartWords.map((word) => word.dutch.toLowerCase()));
const generatedWordMap = new Map<string, SmartWord>();

dutchSyllabus
  .filter((level) => isCourseLevel(level.level))
  .forEach((level) => {
    const courseLevel = level.level;
    if (!isCourseLevel(courseLevel)) return;

    level.vocabularyThemes.forEach((theme) => {
      theme.coreWords.forEach((word) => {
        const key = word.dutch.toLowerCase();
        if (!baseDutchWords.has(key) && !generatedWordMap.has(key)) {
          generatedWordMap.set(key, makeGeneratedSmartWord(courseLevel, theme, word));
        }
      });
    });
  });

type ExtraSmartWordSeed = {
  dutch: string;
  article?: "de" | "het";
  zh: string;
  en: string;
  tag: string;
};

const extraA2PracticeSeeds: ExtraSmartWordSeed[] = [
  { dutch: "assistentie", article: "de", zh: "协助", en: "assistance", tag: "help" },
  { dutch: "balie", article: "de", zh: "服务台", en: "desk", tag: "official" },
  { dutch: "verwijzing", article: "de", zh: "转诊", en: "referral", tag: "healthcare" },
  { dutch: "recept", article: "het", zh: "处方", en: "prescription", tag: "healthcare" },
  { dutch: "medicijn", article: "het", zh: "药", en: "medicine", tag: "healthcare" },
  { dutch: "dosis", article: "de", zh: "剂量", en: "dose", tag: "healthcare" },
  { dutch: "apotheek", article: "de", zh: "药房", en: "pharmacy", tag: "healthcare" },
  { dutch: "klacht", article: "de", zh: "症状/投诉", en: "complaint", tag: "healthcare" },
  { dutch: "pijn", article: "de", zh: "疼痛", en: "pain", tag: "healthcare" },
  { dutch: "koorts", article: "de", zh: "发烧", en: "fever", tag: "healthcare" },
  { dutch: "hoesten", zh: "咳嗽", en: "coughing", tag: "healthcare" },
  { dutch: "allergie", article: "de", zh: "过敏", en: "allergy", tag: "healthcare" },
  { dutch: "bloeddruk", article: "de", zh: "血压", en: "blood pressure", tag: "healthcare" },
  { dutch: "bevestiging", article: "de", zh: "确认", en: "confirmation", tag: "booking" },
  { dutch: "loket", article: "het", zh: "窗口", en: "service counter", tag: "official" },
  { dutch: "formulier", article: "het", zh: "表格", en: "form", tag: "official" },
  { dutch: "handtekening", article: "de", zh: "签名", en: "signature", tag: "official" },
  { dutch: "bewijs", article: "het", zh: "证明", en: "proof", tag: "official" },
  { dutch: "identiteitsbewijs", article: "het", zh: "身份证件", en: "ID document", tag: "official" },
  { dutch: "verblijfsvergunning", article: "de", zh: "居留许可", en: "residence permit", tag: "official" },
  { dutch: "inschrijving", article: "de", zh: "登记", en: "registration", tag: "official" },
  { dutch: "verhuurder", article: "de", zh: "房东", en: "landlord", tag: "housing" },
  { dutch: "huurcontract", article: "het", zh: "租房合同", en: "rental contract", tag: "housing" },
  { dutch: "borg", article: "de", zh: "押金", en: "deposit", tag: "housing" },
  { dutch: "lekkage", article: "de", zh: "漏水", en: "leak", tag: "housing" },
  { dutch: "verwarming", article: "de", zh: "暖气", en: "heating", tag: "housing" },
  { dutch: "elektriciteit", article: "de", zh: "电", en: "electricity", tag: "housing" },
  { dutch: "waterrekening", article: "de", zh: "水费账单", en: "water bill", tag: "payment" },
  { dutch: "huurtoeslag", article: "de", zh: "房租补贴", en: "rent allowance", tag: "housing" },
  { dutch: "salaris", article: "het", zh: "工资", en: "salary", tag: "work" },
  { dutch: "rooster", article: "het", zh: "排班表", en: "schedule", tag: "work" },
  { dutch: "collega", article: "de", zh: "同事", en: "colleague", tag: "work" },
  { dutch: "leidinggevende", article: "de", zh: "主管", en: "supervisor", tag: "work" },
  { dutch: "ziekmelding", article: "de", zh: "病假通知", en: "sick report", tag: "work" },
  { dutch: "herstel", article: "het", zh: "恢复", en: "recovery", tag: "work" },
  { dutch: "dienst", article: "de", zh: "班次", en: "shift", tag: "work" },
  { dutch: "perron", article: "het", zh: "站台", en: "platform", tag: "transport" },
  { dutch: "spoor", article: "het", zh: "轨道/站台号", en: "track", tag: "transport" },
  { dutch: "overstap", article: "de", zh: "换乘", en: "transfer", tag: "transport" },
  { dutch: "conducteur", article: "de", zh: "列车员", en: "conductor", tag: "transport" },
  { dutch: "kaartje", article: "het", zh: "票", en: "ticket", tag: "transport" },
  { dutch: "abonnement", article: "het", zh: "订阅/通票", en: "subscription", tag: "transport" },
  { dutch: "klantenservice", article: "de", zh: "客服", en: "customer service", tag: "help" },
  { dutch: "herinnering", article: "de", zh: "提醒/催缴信", en: "reminder", tag: "payment" },
  { dutch: "aanmaning", article: "de", zh: "催款通知", en: "payment reminder", tag: "payment" },
  { dutch: "polis", article: "de", zh: "保险单", en: "insurance policy", tag: "insurance" },
  { dutch: "eigen risico", article: "het", zh: "自付额", en: "deductible", tag: "insurance" },
  { dutch: "declaratie", article: "de", zh: "报销申请", en: "claim", tag: "insurance" },
  { dutch: "wijziging", article: "de", zh: "更改", en: "change", tag: "booking" },
  { dutch: "annulering", article: "de", zh: "取消", en: "cancellation", tag: "booking" },
  { dutch: "klachtenformulier", article: "het", zh: "投诉表", en: "complaint form", tag: "help" },
  { dutch: "zorgpas", article: "de", zh: "医保卡", en: "health insurance card", tag: "insurance" },
  { dutch: "telefoonnummer", article: "het", zh: "电话号码", en: "phone number", tag: "forms" },
  { dutch: "geboortedatum", article: "de", zh: "出生日期", en: "date of birth", tag: "forms" },
  { dutch: "achternaam", article: "de", zh: "姓", en: "last name", tag: "forms" },
  { dutch: "voornaam", article: "de", zh: "名", en: "first name", tag: "forms" },
  { dutch: "adreswijziging", article: "de", zh: "地址变更", en: "address change", tag: "official" },
  { dutch: "afspraakkaart", article: "de", zh: "预约卡", en: "appointment card", tag: "booking" },
  { dutch: "wachttijd", article: "de", zh: "等待时间", en: "waiting time", tag: "healthcare" },
  { dutch: "spoed", article: "de", zh: "紧急", en: "urgent care", tag: "healthcare" },
  { dutch: "receptnummer", article: "het", zh: "处方编号", en: "prescription number", tag: "healthcare" },
  { dutch: "bijwerking", article: "de", zh: "副作用", en: "side effect", tag: "healthcare" },
  { dutch: "verzekeringspas", article: "de", zh: "保险卡", en: "insurance card", tag: "insurance" },
  { dutch: "premie", article: "de", zh: "保费", en: "premium", tag: "insurance" },
  { dutch: "zorgkosten", zh: "医疗费用", en: "healthcare costs", tag: "insurance" },
  { dutch: "betalingsregeling", article: "de", zh: "付款安排", en: "payment plan", tag: "payment" },
  { dutch: "incasso", article: "de", zh: "自动扣款", en: "direct debit", tag: "payment" },
  { dutch: "termijn", article: "de", zh: "期限/分期", en: "term", tag: "payment" },
  { dutch: "huurspecificatie", article: "de", zh: "房租明细", en: "rent specification", tag: "housing" },
  { dutch: "servicekosten", zh: "服务费", en: "service costs", tag: "housing" },
  { dutch: "woningcorporatie", article: "de", zh: "住房协会", en: "housing corporation", tag: "housing" },
  { dutch: "onderhoud", article: "het", zh: "维护", en: "maintenance", tag: "housing" },
  { dutch: "reparatie", article: "de", zh: "维修", en: "repair", tag: "housing" },
  { dutch: "schimmel", article: "de", zh: "霉菌", en: "mold", tag: "housing" },
  { dutch: "contractverlenging", article: "de", zh: "合同延长", en: "contract extension", tag: "housing" },
  { dutch: "opzegtermijn", article: "de", zh: "解约通知期", en: "notice period", tag: "housing" },
  { dutch: "proeftijd", article: "de", zh: "试用期", en: "probation period", tag: "work" },
  { dutch: "loonstrook", article: "de", zh: "工资单", en: "payslip", tag: "work" },
  { dutch: "verlof", article: "het", zh: "请假/休假", en: "leave", tag: "work" },
  { dutch: "afwezigheid", article: "de", zh: "缺勤", en: "absence", tag: "work" },
  { dutch: "arbeidsovereenkomst", article: "de", zh: "劳动合同", en: "employment contract", tag: "work" },
  { dutch: "uitzendbureau", article: "het", zh: "派遣公司", en: "temp agency", tag: "work" },
  { dutch: "reisinformatie", article: "de", zh: "出行信息", en: "travel information", tag: "transport" },
  { dutch: "omleiding", article: "de", zh: "绕行", en: "diversion", tag: "transport" },
  { dutch: "vervangend vervoer", article: "het", zh: "替代交通", en: "replacement transport", tag: "transport" },
  { dutch: "bevestigingsmail", article: "de", zh: "确认邮件", en: "confirmation email", tag: "booking" },
  { dutch: "afspraakherinnering", article: "de", zh: "预约提醒", en: "appointment reminder", tag: "booking" },
  { dutch: "wijzigingsformulier", article: "het", zh: "更改表格", en: "change form", tag: "forms" },
  { dutch: "bezwaar", article: "het", zh: "异议/申诉", en: "objection", tag: "official" },
  { dutch: "aanvraag", article: "de", zh: "申请", en: "application", tag: "official" },
  { dutch: "machtiging", article: "de", zh: "授权", en: "authorization", tag: "official" },
  { dutch: "intakegesprek", article: "het", zh: "初次面谈", en: "intake conversation", tag: "official" },
  { dutch: "spreekuur", article: "het", zh: "门诊/咨询时间", en: "consultation hour", tag: "healthcare" },
  { dutch: "huurverhoging", article: "de", zh: "涨房租", en: "rent increase", tag: "housing" },
  { dutch: "storingsnummer", article: "het", zh: "故障电话", en: "fault reporting number", tag: "housing" },
  { dutch: "dienstregeling", article: "de", zh: "时刻表", en: "timetable", tag: "transport" },
];

const existingDutchWords = new Set([...baseDutchWords, ...generatedWordMap.keys()]);
const extraA2PracticeWords = extraA2PracticeSeeds
  .filter((word) => !existingDutchWords.has(word.dutch.toLowerCase()))
  .map((word) =>
    makeWord({
      id: `word-${slugify(word.dutch)}`,
      level: "A2",
      dutch: word.dutch,
      article: word.article,
      zh: word.zh,
      en: word.en,
      breakdownZh: word.dutch.includes("ing") ? `${word.dutch} 有 -ing 词尾，先按名词看。` : `${word.dutch} = ${word.zh}`,
      breakdownEn: word.dutch.includes("ing") ? `${word.dutch} has the -ing ending, so read it as a noun first.` : `${word.dutch} = ${word.en}`,
      associationZh: `${word.dutch} = ${word.zh}`,
      associationEn: `${word.dutch} = ${word.en}`,
      chineseMemoryHook: `${word.dutch} = ${word.zh}`,
      englishBridge: undefined,
      soundHint: getSoundHint(word.dutch),
      sentenceDutch: word.article ? `Ik heb ${word.article} ${word.dutch} nodig.` : `Ik heb ${word.dutch} nodig.`,
      sentenceZh: `我需要${word.zh}。`,
      sentenceEn: `I need the ${word.en}.`,
      commonPhrase: word.article ? { dutch: `${word.article} ${word.dutch}`, meaning: lt(`${word.article} ${word.zh}`, `${word.article} ${word.en}`) } : undefined,
      relatedWords: extraA2PracticeSeeds
        .filter((item) => item.tag === word.tag && item.dutch !== word.dutch)
        .map((item) => item.dutch)
        .slice(0, 6),
      scenarioTags: [word.tag],
    }),
  );

export const smartWords: SmartWord[] = [...baseSmartWords, ...generatedWordMap.values(), ...extraA2PracticeWords];

export const featuredSmartWord = smartWords.find((word) => word.id === "word-ziekenhuis") ?? smartWords[0];
