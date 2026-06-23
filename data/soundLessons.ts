import type { LocalizedText, MiniQuiz, SoundLesson } from "@/types/course";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

const quiz = (id: string, question: LocalizedText, answer: string): MiniQuiz => ({
  id,
  question,
  options: [lt(answer, answer), lt("另一个发音", "Another sound"), lt("不确定", "Not sure")],
  answerIndex: 0,
  explanation: lt("先看高亮音，再读整个词。", "Spot the highlighted sound before reading the whole word."),
});

const word = (dutch: string, zh: string, en: string, highlight: string) => ({
  dutch,
  meaning: lt(zh, en),
  highlight,
});

const soundStory = (
  descriptionZh: string,
  descriptionEn: string,
  mnemonicZh: string,
  mnemonicEn: string,
  funFactZh: string,
  funFactEn: string,
) => ({
  description: lt(descriptionZh, descriptionEn),
  mnemonic: lt(mnemonicZh, mnemonicEn),
  funFact: lt(funFactZh, funFactEn),
});

const makeSoundLesson = (
  id: string,
  level: SoundLesson["level"],
  sound: string,
  category: SoundLesson["category"],
  zhTitle: string,
  enTitle: string,
  ruleZh: string,
  ruleEn: string,
  mouthZh: string,
  mouthEn: string,
  examples: ReturnType<typeof word>[],
  sentenceDutch: string,
  sentenceZh: string,
  sentenceEn: string,
  mistakeZh: string,
  mistakeEn: string,
  drill: string[],
  chineseApproximation?: string,
  englishBridge?: string,
  soundAssociation?: LocalizedText,
  story?: SoundLesson["soundStory"],
): SoundLesson => ({
  id,
  level,
  title: lt(zhTitle, enTitle),
  sound,
  category,
  rule: lt(ruleZh, ruleEn),
  mouthPosition: lt(mouthZh, mouthEn),
  chineseApproximation,
  englishBridge,
  exampleWords: examples,
  exampleSentence: {
    dutch: sentenceDutch,
    meaning: lt(sentenceZh, sentenceEn),
  },
  commonMistake: lt(mistakeZh, mistakeEn),
  drill,
  soundAssociation,
  soundStory: story,
  miniQuiz: [quiz(`${id}-quiz`, lt(`${sound} 怎么读？`, `How do you read ${sound}?`), sound)],
});

export const soundLessons: SoundLesson[] = [
  makeSoundLesson("sound-alphabet", "A0", "alphabet", "alphabet", "荷兰语字母总览", "Dutch alphabet overview", "先把字母当作拼读系统，不要只背单词发音。", "Treat Dutch letters as a phonics system, not isolated spellings.", "放松嘴巴，先区分短音、长音和组合音。", "Keep the mouth relaxed and notice short, long, and combined vowels.", [word("maan", "月亮", "moon", "aa"), word("vis", "鱼", "fish", "i"), word("boek", "书", "book", "oe")], "Ik lees een woord.", "我读一个词。", "I read a word.", "不要用英语字母名读所有荷兰语字母。", "Do not pronounce every letter with English letter names.", ["a e i o u", "aa ee ie oo uu"]),
  makeSoundLesson("sound-a-aa", "A0", "a / aa", "vowel", "a / aa", "a / aa", "a 短促，aa 更长更打开。", "a is short; aa is longer and more open.", "嘴巴打开，aa 稍微拉长。", "Open the mouth and hold aa a little longer.", [word("man", "男人", "man", "a"), word("maan", "月亮", "moon", "aa"), word("naam", "名字", "name", "aa")], "Mijn naam is Anna.", "我的名字是 Anna。", "My name is Anna.", "aa 不要读成 English ay。", "Do not pronounce aa like English ay.", ["man - maan", "dag - daag"], "a 像短促张口，aa 像把嘴巴打开后多停半拍。", "Short a is quick and open; aa holds the open shape a little longer.", lt("看到双写 aa，就提醒自己：开口音拉长一点。", "Double aa tells you to hold the open vowel a little longer.")),
  makeSoundLesson("sound-e-ee", "A0", "e / ee", "vowel", "e / ee", "e / ee", "e 常短或弱读，ee 更清楚。", "e is short or reduced; ee is clear and longer.", "嘴角微笑，舌头靠前。", "Smile lightly and keep the tongue forward.", [word("bed", "床", "bed", "e"), word("been", "腿", "leg", "ee"), word("lees", "读", "read", "ee")], "Ik lees een zin.", "我读一个句子。", "I read a sentence.", "ee 不要读成 English see 里很长的 ee。", "Do not make ee as long as English see.", ["bed - been", "les - lees"], "像轻轻微笑时的前口腔音：e 短，ee 稳。", "A light smile shape: e is short; ee is steadier.", lt("先做微笑口型，再读 bed / been；不要套英文字母 E。", "Use a light smile shape for bed / been; do not use the English letter E.")),
  makeSoundLesson("sound-i-ie", "A0", "i / ie", "vowel", "i / ie", "i / ie", "i 很短，ie 是长音“衣”，接近 English see 的 ee。", "i is short; ie is a long ee sound, close to ee in see.", "舌头高而靠前，读 ie 时嘴角往两边拉，声音保持一条直线。", "Tongue high and forward; for ie, pull the mouth corners sideways and keep the sound steady.", [word("ik", "我", "I", "i"), word("bier", "啤酒", "beer", "ie"), word("dier", "动物", "animal", "ie"), word("fiets", "自行车", "bike", "ie")], "Ik fiets niet.", "我不骑车。", "I do not bike.", "短 i 不要读成 English eye；ie 要拉直，不要滑成中文“耶”。", "Do not pronounce short i like English eye; keep ie straight and do not glide it.", ["ik - ziek", "vis - vies", "bier - dier - fiets"], undefined, "Short i is quick; ie is the long cheese-smile vowel.", lt("ie 像拍照假笑专用音：嘴角拉开，发一个拉长的“衣”。", "ie is the photo-smile sound: pull the mouth corners wide and hold ee."), soundStory("长音“衣”。拍照假笑专用音。", "Long ee. The photo-smile sound.", "把嘴角拼命往两边拉扯，大喊一声“衣——”。", "Pull the mouth corners wide and say a long ee.", "拍照喊 Cheese 的那个嘴角拉扯感，腮帮子微酸就对了。", "Think of saying Cheese for a photo: wide mouth corners, a slightly tired cheek feeling, and a steady ee.")),
  makeSoundLesson("sound-o-oo", "A0", "o / oo", "vowel", "o / oo", "o / oo", "o 短，oo 更圆更长。", "o is short; oo is longer and rounded.", "嘴唇圆起来，声音保持稳定。", "Round the lips and keep the sound steady.", [word("kop", "杯/头", "cup/head", "o"), word("koop", "买", "buy", "oo"), word("brood", "面包", "bread", "oo")], "Ik koop brood.", "我买面包。", "I buy bread.", "oo 不要扁成 English aw。", "Do not flatten oo into English aw.", ["kop - koop", "zon - zoon"], "像把嘴唇拢成小圆口：o 短一点，oo 多停半拍。", "Round your lips into a small circle: o is quick; oo holds.", lt("看到 oo，不要读成英语 oh；保持圆唇、声音稳定。", "When you see oo, keep rounded lips and a steady vowel, not English oh.")),
  makeSoundLesson("sound-u-uu", "A0", "u / uu", "vowel", "u / uu", "u / uu", "反直觉圆唇音：舌头像“衣”，嘴唇像“吁”，uu 更长。", "A counter-intuitive rounded vowel: ee tongue, rounded lips; uu is longer.", "先做 ee 的舌位，再把嘴唇圆起来，像喊“吁～～”但不要读成 English you。", "Start with an ee tongue position, then round the lips; hold it without turning it into English you.", [word("bus", "公交", "bus", "u"), word("uur", "小时", "hour", "uu"), word("buur", "邻居", "neighbor", "uu")], "De bus komt om vier uur.", "公交四点来。", "The bus comes at four.", "uu 不要读成 English you，也不要漏气成中文“鱼”。", "Do not pronounce uu like English you, and do not let it leak into a Chinese-style yu.", ["bus - buur", "nu - muur", "bus - uur"], "可以先借“吁～”让马停下的圆嘴感觉，但舌头要保持在“衣”的位置；短 u 快，uu 拉长。", "Borrow the rounded-lip feeling of saying a long stop sound, but keep an ee tongue position; short u is quick, uu is held.", lt("直接发出让马停下的“吁～～”，找到圆嘴和长音，再把舌位收回到“衣”。", "Use the long stop-call image to find rounded lips and length, then keep the tongue in an ee position."), soundStory("反直觉神音。嘴唇在“吁”，舌头在“衣”。", "The counter-intuitive one: lips say rounded, tongue says ee.", "直接发出让马停下的“吁～～”；保持圆嘴和长音，别读成 English you。", "Use a long stop-call shape; keep the rounded lips and length, but do not say English you.", "想象你突然需要刹住动作，大喊一声“吁～～～”。这个画面只负责帮你锁住圆嘴，真正发音还要保持前舌位。", "Imagine a sudden stop call. The image locks the rounded lips; the real Dutch sound still keeps the tongue forward.")),
  makeSoundLesson("sound-ei-ij", "A0", "ei / ij", "vowel-combination", "ei / ij", "ei / ij", "ei 和 ij 多数发音一样。", "ei and ij usually share the same sound.", "从较开口开始，向前滑动。", "Start open and glide forward.", [word("trein", "火车", "train", "ei"), word("ijs", "冰", "ice", "ij"), word("blij", "高兴", "happy", "ij")], "De trein is klein.", "火车很小。", "The train is small.", "ij 不要拆成 i + j。", "Do not read ij as separate i plus j.", ["trein - zijn", "klein - blij"]),
  makeSoundLesson("sound-oe", "A0", "oe", "vowel-combination", "oe", "oe", "oe 像 English food 里的 oo，是最老实、最靠后的圆唇“乌”。", "oe sounds like oo in English food: the steady back rounded vowel.", "嘴唇缩成小圆孔，舌头靠后偏高，声音低稳。", "Make a small round lip opening, keep the tongue high/back, and keep the sound steady.", [word("boek", "书", "book", "oe"), word("stoel", "椅子", "chair", "oe"), word("koek", "饼干", "cookie", "oe"), word("goed", "好", "good", "oe")], "Hoe gaat het? Het gaat goed.", "你好吗？很好。", "How are you? It is going well.", "oe 不要读成“欧”，也不要滑成 English oh。", "Do not pronounce oe as 欧 or glide it into English oh.", ["goed boek", "boek stoel koek", "hoe goed"], "接近中文“乌”，不是“欧”。看到 oe 先想到圆唇的“乌”。", "Like oo in food; not English oh.", lt("oe 是稳定的圆唇音：boek / stoel / koek 都先找“乌”的口型。", "oe is a steady rounded vowel: use the oo-in-food shape in boek / stoel / koek."), soundStory("深沉的轰鸣音。最老实、最靠后的“乌”。", "A deep steady hum: the honest back oo sound.", "嘬起最小的圆孔，声音从喉咙后面稳稳出来。", "Make the smallest round lip opening and let the sound come steadily from the back.", "把嘴唇缩到最小，在喉咙深处发出低沉的“呜——”。声音越稳、越靠后越对味。", "Shrink the lips into a small round opening and make a deep steady oo. The steadier and further back, the better.")),
  makeSoundLesson("sound-ui", "A0", "ui", "vowel-combination", "ui", "ui", "ui 是荷兰语终极 Boss：从“呃”滑向圆唇收尾。", "ui is a Dutch boss sound: start open/central and end rounded.", "大方地发“呃”，然后瞬间把嘴唇收成小圆嘴，收尾必须圆。", "Start with an open uh-like sound, then quickly round the lips; the ending must be rounded.", [word("ui", "洋葱", "onion", "ui"), word("huis", "房子", "house", "ui"), word("tuin", "花园", "garden", "ui"), word("uit", "出去", "out", "ui")], "Ik ben thuis.", "我在家。", "I am at home.", "ui 不等于 English we，也不要拆成 u + i。", "ui is not English we, and it is not u plus i.", ["ui - huis - tuin", "huis uit", "tuin thuis"], "像从“呃”出发，最后收成圆嘴“吁”的口型；不要把它拆成两个音节。", "Start from an uh-like sound and end in a rounded lip shape; do not split it into two syllables.", lt("ui 记成“嫌弃脸收圆嘴”：前面打开，最后必须撅圆。", "Remember ui as an annoyed face that ends with rounded lips: open first, rounded at the end."), soundStory("荷兰语终极 Boss。一个自带嫌弃表情包的音。", "The Dutch final boss: a sound with an annoyed facial expression built in.", "先发“呃”，然后马上把嘴唇嘬成小圆嘴。", "Start with uh, then immediately round the lips into a small pout.", "看到很丑的东西时：先“诶/呃——”，最后“吁！”地收圆。重点是收尾嘴唇必须圆、往前。", "Imagine a disgusted uh that finishes with rounded lips. The important part is the final forward rounded shape.")),
  makeSoundLesson("sound-eu", "A0", "eu", "vowel-combination", "eu", "eu", "eu 是前舌圆唇音，像被固定住的小圆管。", "eu is a front rounded vowel, like a fixed small round tube.", "发“呃”的舌位，同时把嘴唇轻轻圆起来，声音不要滑。", "Use an uh-like/front tongue position while rounding the lips softly; do not glide.", [word("deur", "门", "door", "eu"), word("keuken", "厨房", "kitchen", "eu"), word("neus", "鼻子", "nose", "eu"), word("leuk", "有趣", "nice/fun", "eu")], "Dat is leuk.", "那很有趣。", "That is nice.", "eu 不要读成 English you，也不要滑成 ui。", "Do not pronounce eu like English you, and do not glide it into ui.", ["deur - neus", "keuken deur", "leuk neus"], "像要说“诶/饿”的前舌位，但嘴唇圆起来，保持定住。", "Use a front vowel position, then round the lips softly and hold it.", lt("eu 的核心不是 you，而是“前舌 + 圆唇 + 不滑”：deur / keuken / neus 一起练。", "eu is not you; it is front tongue plus rounded lips, with no glide: practice deur / keuken / neus together."), soundStory("极具憋屈感的音，带一点呆萌机械感。", "A slightly squeezed, mechanical-sounding vowel.", "发“呃”的同时，把嘴唇固定成一个小圆圈。", "Say an uh-like sound while fixing the lips into a small round circle.", "想象你正在“呃……”地思考，突然两边脸颊被捏住，嘴被迫变成一个定死的小圆管。", "Imagine thinking uh... while your cheeks are gently squeezed into a fixed round tube.")),
  makeSoundLesson("sound-au-ou", "A0", "au / ou", "vowel-combination", "au / ou", "au / ou", "au 和 ou 多数发音一样。", "au and ou often share the same sound.", "先开口，再滑向圆嘴。", "Start open, then glide into rounded lips.", [word("auto", "汽车", "car", "au"), word("koud", "冷", "cold", "ou"), word("vrouw", "女人", "woman", "ou")], "De auto is koud.", "汽车很冷。", "The car is cold.", "ou 不要读成 English oh。", "Do not pronounce ou like English oh.", ["auto koud", "vrouw goud"]),
  makeSoundLesson("sound-g-ch", "A0", "g / ch", "consonant", "g / ch", "g / ch", "许多口音里 g/ch 是喉后部摩擦音。", "In many accents, g/ch are throat friction sounds.", "舌根靠近软腭，让气流摩擦。", "Lift the back of the tongue and let air pass.", [word("goed", "好", "good", "g"), word("graag", "乐意", "gladly", "g"), word("acht", "八", "eight", "ch")], "Graag gedaan.", "不客气。", "You are welcome.", "g 不要读成 English go 的 g。", "Do not pronounce g like English go.", ["goed graag", "licht acht"]),
  makeSoundLesson("sound-sch", "A0", "sch", "consonant", "sch", "sch", "sch 是 s 加荷兰语 ch。", "sch is s plus Dutch ch.", "先 s，再到喉后部摩擦。", "Start with s, then move to back friction.", [word("school", "学校", "school", "sch"), word("schrijven", "写", "write", "sch"), word("boodschappen", "购物", "groceries", "sch")], "Ik schrijf op school.", "我在学校写。", "I write at school.", "sch 不要读成 English sh。", "Do not pronounce sch like English sh.", ["school schoon", "schrijf school"]),
  makeSoundLesson("sound-ng-nk", "A0", "ng / nk", "consonant", "ng / nk", "ng / nk", "ng 像 English sing 结尾，nk 多一个 k。", "ng is like sing; nk adds a k release.", "舌根触软腭，nk 最后放开 k。", "Back tongue touches soft palate; release for nk.", [word("lang", "长", "long", "ng"), word("jong", "年轻", "young", "ng"), word("bank", "长椅/银行", "bench/bank", "nk")], "Ik denk aan een bank.", "我想到一张长椅。", "I think of a bench.", "ng 后不要加硬 g。", "Do not add a hard g after ng.", ["lang - lank", "denk bank"]),
  makeSoundLesson("sound-en-ending", "A0", "-en", "ending", "-en 结尾", "-en ending", "-en 常弱读。", "Final -en is often reduced.", "结尾放轻，重音留在前面。", "Relax the ending and keep stress earlier.", [word("wonen", "居住", "live", "en"), word("maken", "做", "make", "en"), word("spreken", "说", "speak", "en")], "Wij spreken Nederlands.", "我们说荷兰语。", "We speak Dutch.", "不要每次都重读最后 n。", "Do not over-pronounce final n every time.", ["wonen maken", "leren spreken"]),
  makeSoundLesson("sound-r", "A1", "r", "consonant", "r", "r", "荷兰语 r 有地区差异，先选一个稳定版本。", "Dutch r varies by region; choose one clear version first.", "舌头或喉部参与，但不要吞掉。", "Use tongue or throat clearly, but do not swallow it.", [word("rood", "红色", "red", "r"), word("straat", "街道", "street", "r"), word("morgen", "明天", "tomorrow", "r")], "Morgen schrijf ik een brief.", "明天我写一封信。", "Tomorrow I write a letter.", "不要全部替换成软 English r。", "Do not replace every r with soft English r.", ["rood brief", "straat morgen"]),
  makeSoundLesson("sound-v-w", "A1", "v / w", "consonant", "v / w", "v / w", "v 有轻微摩擦，w 更靠嘴唇。", "v has soft friction; Dutch w uses the lips.", "v 用牙齿和下唇，w 双唇轻触。", "For v use teeth/lower lip; for w use both lips lightly.", [word("vis", "鱼", "fish", "v"), word("water", "水", "water", "w"), word("wonen", "居住", "live", "w")], "Wij wonen bij water.", "我们住在水边。", "We live near water.", "w 不要像 English wow 那么圆。", "Do not make w as round as English wow.", ["vis water", "wij wonen"]),
  makeSoundLesson("sound-ig-lijk", "A1", "-ig / -lijk", "ending", "-ig / -lijk 结尾", "-ig / -lijk endings", "这些高频结尾要作为整体识别。", "Treat these common endings as chunks.", "结尾轻一点，不要每个字母一样重。", "Keep endings light, not equally stressed.", [word("nodig", "需要的", "needed", "ig"), word("rustig", "安静", "calm", "ig"), word("duidelijk", "清楚", "clear", "lijk")], "Dat is duidelijk.", "那很清楚。", "That is clear.", "-lijk 不要读成单独一个词。", "Do not pronounce -lijk as a separate word.", ["nodig rustig", "duidelijk vriendelijk"]),
  makeSoundLesson("sound-word-stress", "A1", "stress", "stress", "单词重音", "word stress", "长词要找重音，不要每个音节一样重。", "Find word stress; do not give every syllable equal weight.", "重音更清楚，非重音更轻。", "Make stressed syllables clearer and unstressed ones lighter.", [word("afspraak", "预约", "appointment", "AF"), word("gemeente", "市政厅", "municipality", "MEEN"), word("ziekenhuis", "医院", "hospital", "ZIE")], "Ik heb een afspraak.", "我有一个预约。", "I have an appointment.", "长词不要平读。", "Do not read long words flat.", ["AF-spraak", "ge-MEEN-te"]),
  makeSoundLesson("sound-sentence-rhythm", "A1", "rhythm", "stress", "句子节奏", "sentence rhythm", "句子里功能词轻，重点信息更清楚。", "Function words are lighter; key information is clearer.", "重要词稍微重，短小词放轻。", "Stress important words and relax small words.", [word("Ik", "我", "I", "Ik"), word("morgen", "明天", "tomorrow", "mor"), word("school", "学校", "school", "sch")], "Morgen ga ik naar school.", "明天我去学校。", "Tomorrow I go to school.", "不要每个词都一样重。", "Do not stress every word equally.", ["Morgen GA ik", "naar SCHOOL"]),
];

export const soundCombinations = ["sch", "ei", "ij", "oe", "ui", "eu", "au", "ou", "ie", "aa", "ee", "oo", "uu", "ch", "ng", "nk", "g"];

export type DecoderExamples = Record<string, { pronunciationHints: string[]; relatedLessons: string[]; exampleSentence: string }>;

export const decoderExamples: DecoderExamples = {
  afspraak: { pronunciationHints: ["aa: long open vowel", "stress: AF-spraak"], relatedLessons: ["a / aa", "word stress"], exampleSentence: "Ik heb morgen een afspraak." },
  ziekenhuis: { pronunciationHints: ["ie: like ee in see", "ui: special Dutch sound"], relatedLessons: ["ie", "ui"], exampleSentence: "Het ziekenhuis is dichtbij." },
  gemeente: { pronunciationHints: ["ee: clear long vowel", "g: throat friction"], relatedLessons: ["e / ee", "g / ch"], exampleSentence: "Ik ga naar de gemeente." },
  huisarts: { pronunciationHints: ["ui: rounded diphthong", "aa: long open vowel"], relatedLessons: ["ui", "a / aa"], exampleSentence: "De huisarts belt mij terug." },
  trein: { pronunciationHints: ["ei: same family as ij"], relatedLessons: ["ei / ij"], exampleSentence: "De trein komt om acht uur." },
  huis: { pronunciationHints: ["ui: Dutch-only rounded diphthong"], relatedLessons: ["ui"], exampleSentence: "Ik ben thuis in mijn huis." },
  leuk: { pronunciationHints: ["eu: front rounded vowel"], relatedLessons: ["eu"], exampleSentence: "Dat is een leuk idee." },
  goed: { pronunciationHints: ["g: throat friction", "oe: like oo in food"], relatedLessons: ["g / ch", "oe"], exampleSentence: "Het gaat goed." },
  schrijven: { pronunciationHints: ["sch: s plus ch", "ij: same as ei", "-en: relaxed ending"], relatedLessons: ["sch", "ei / ij", "-en ending"], exampleSentence: "Ik schrijf een korte zin." },
  boodschappen: { pronunciationHints: ["sch: s plus ch", "aa: long open vowel", "-en: relaxed ending"], relatedLessons: ["sch", "a / aa", "-en ending"], exampleSentence: "Ik doe boodschappen in de winkel." },
};

export const soundDrills = [
  { title: "Round vowel ladder", items: ["oe", "ui", "eu", "uu"], prompt: "Move from easy rounded sounds to Dutch-only rounded sounds." },
  { title: "Long vowel contrast", items: ["a / aa", "e / ee", "o / oo", "u / uu"], prompt: "Keep the short sound quick and the long sound steady." },
  { title: "Real-life chunks", items: ["huisarts", "gemeente", "trein", "boodschappen"], prompt: "Decode the chunk before reading the whole word." },
];

export const soundMiniQuiz: MiniQuiz[] = [
  quiz("sound-quiz-oe", lt("哪个发音接近 English food 里的 oo？", "Which Dutch sound is close to oo in English food?"), "oe"),
  quiz("sound-quiz-ei-ij", lt("哪两个组合通常同音？", "Which pair usually shares the same sound?"), "ei / ij"),
  quiz("sound-quiz-g", lt("很多荷兰语口音里的 g 是什么？", "In many Dutch accents, g is..."), "g / ch"),
];
