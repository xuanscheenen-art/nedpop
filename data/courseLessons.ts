import { lessonPlans } from "@/data/lessonPlans";
import { wordItems } from "@/data/vocabularyPlan";
import { verbUsageFor } from "@/lib/dutchVerbForms";
import { meaningForUsableSentence } from "@/lib/vocabularySentences";
import type { AudioItem, CourseLesson } from "@/types/lesson";
import type { LocalizedText } from "@/types/course";
import type { LessonPlan } from "@/types/lessonPlan";
import type { WordItem } from "@/types/vocabulary";

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });

const audio = (dutch: string, slug: string): AudioItem => ({
  dutch,
  audioText: dutch,
  audioSrc: `/audio/placeholders/a0/${slug}.mp3`,
});

const handcraftedCourseLessons: CourseLesson[] = [
  {
    id: "a0-01",
    lessonPlanId: "a0-01",
    level: "A0",
    order: 1,
    title: lt("打招呼和礼貌表达", "Greetings and Politeness"),
    methodMap: {
      decode: lt("先听 hallo、dag、goed 里的基础音，不急着拼长词。", "First hear the basic sounds in hallo, dag, and goed. Do not rush into long words."),
      link: lt("把礼貌表达当成一颗颗可直接使用的“社交泡泡”。", "Treat polite phrases as ready-to-use social bubbles."),
      rule: lt("A0 第一课只学固定短句：你好、谢谢、请、再见。", "The first A0 lesson only uses fixed chunks: hello, thanks, please, goodbye."),
      speak: lt("最后能完成一次 10 秒的问候和告别。", "By the end, complete a 10-second greeting and goodbye."),
    },
    lessonGoal: {
      goal: lt("会说最基础的你好、再见、谢谢、请和抱歉。", "Use the most basic hello, goodbye, thanks, please, and sorry."),
      estimatedMinutes: 20,
      purpose: lt("这一课先建立开口安全感：见面、感谢、道歉、告别都能用最短的礼貌表达接住。", "This lesson builds safe first contact: greeting, thanking, apologizing, and saying goodbye with tiny polite chunks."),
      canSayAfter: lt("学完后你可以说：Hallo. Dank je. Tot ziens.", "After this lesson you can say: Hallo. Dank je. Tot ziens."),
    },
    soundBase: {
      pronunciationHints: [
        { ...audio("hallo", "hallo"), sound: "a / o", hint: lt("hallo 不要读成英语 hello，最后的 o 更短更稳。", "hallo is not English hello; the final o is shorter and steadier.") },
        { ...audio("dag", "dag"), sound: "g", hint: lt("dag 结尾的 g 是荷兰语后部摩擦音，先听出来即可。", "The final g in dag is a Dutch back fricative. At first, just learn to hear it.") },
        { ...audio("goed", "goed"), sound: "oe", hint: lt("goed 里的 oe 接近 English food 的 oo，不是中文“欧”。", "The oe in goed is close to oo in English food, not Chinese 欧.") },
      ],
    },
    targetWords: [
      {
        ...audio("hallo", "hallo"),
        meaning: lt("你好", "hello"),
        pronunciationHint: lt("ha-llo，两块读，轻松打招呼。", "Read it in two chunks: ha-llo."),
        memoryHook: lt("像 English hello，但不要完全按英语读。", "It looks like English hello, but do not pronounce it exactly like English."),
        exampleSentence: { dutch: "Hallo, ik ben Lin.", meaning: lt("你好，我是 Lin。", "Hello, I am Lin."), audioText: "Hallo, ik ben Lin.", audioSrc: "/audio/placeholders/a0/hallo-ik-ben-lin.mp3" },
      },
      {
        ...audio("dag", "dag"),
        meaning: lt("你好/再见", "hello/bye"),
        pronunciationHint: lt("短短一拍，结尾 g 不要读成 English g。", "One short beat; the final g is not English g."),
        memoryHook: lt("dag 很万能，见面和离开都能用。", "dag is flexible: use it when meeting or leaving."),
        exampleSentence: { dutch: "Dag, tot ziens.", meaning: lt("再见，回头见。", "Bye, see you."), audioText: "Dag, tot ziens.", audioSrc: "/audio/placeholders/a0/dag-tot-ziens.mp3" },
      },
      {
        ...audio("dank je", "dank-je"),
        meaning: lt("谢谢", "thank you"),
        pronunciationHint: lt("dank je 可以连起来轻轻读。", "dank je can be read lightly as one phrase."),
        memoryHook: lt("dank 像 thank，可以先借外形记住意思，发音按荷兰语。", "dank is close to thank, which helps with meaning; pronounce it in Dutch."),
        exampleSentence: { dutch: "Dank je.", meaning: lt("谢谢。", "Thank you."), audioText: "Dank je.", audioSrc: "/audio/placeholders/a0/dank-je.mp3" },
      },
      {
        ...audio("alsjeblieft", "alsjeblieft"),
        meaning: lt("请/给你", "please/here you are"),
        pronunciationHint: lt("这是长一点的礼貌泡泡，先整句模仿。", "This is a longer polite bubble. Imitate the whole phrase first."),
        memoryHook: lt("先别拆语法，把它当“please”整块记。", "Do not analyze the grammar yet; remember it as a whole please chunk."),
        exampleSentence: { dutch: "Water, alsjeblieft.", meaning: lt("请给我水。", "Water, please."), audioText: "Water, alsjeblieft.", audioSrc: "/audio/placeholders/a0/water-alsjeblieft.mp3" },
      },
      {
        ...audio("tot ziens", "tot-ziens"),
        meaning: lt("再见", "see you"),
        pronunciationHint: lt("ziens 里的 ie 要清楚一点。", "Make the ie in ziens clear."),
        memoryHook: lt("tot ziens 是比 dag 更完整的“再见”。", "tot ziens is a fuller goodbye than dag."),
        exampleSentence: { dutch: "Tot ziens.", meaning: lt("再见。", "See you."), audioText: "Tot ziens.", audioSrc: "/audio/placeholders/a0/tot-ziens.mp3" },
      },
      {
        ...audio("sorry", "sorry"),
        meaning: lt("抱歉", "sorry"),
        pronunciationHint: lt("接近英语 sorry，但 r 可以先轻轻带过。", "Close to English sorry; keep the r light for now."),
        memoryHook: lt("和英语一样好用，先作为安全表达。", "Useful like English sorry; keep it as a safe phrase."),
        exampleSentence: { dutch: "Sorry.", meaning: lt("抱歉。", "Sorry."), audioText: "Sorry.", audioSrc: "/audio/placeholders/a0/sorry.mp3" },
      },
    ],
    sentencePatterns: [
      {
        dutchPattern: "Hallo. / Dag.",
        explanation: lt("最小问候。Hallo 更像“你好”，dag 可以你好也可以再见。", "Minimal greeting. Hallo is hello; dag can mean hello or bye."),
        examples: [
          { dutch: "Hallo.", meaning: lt("你好。", "Hello."), audioText: "Hallo.", audioSrc: "/audio/placeholders/a0/pattern-hallo.mp3" },
          { dutch: "Dag.", meaning: lt("你好/再见。", "Hello/bye."), audioText: "Dag.", audioSrc: "/audio/placeholders/a0/pattern-dag.mp3" },
        ],
        commonMistake: lt("不要一上来就背复杂寒暄。A0 先把两个词说自然。", "Do not start with complex small talk. At A0, make these two words natural first."),
      },
      {
        dutchPattern: "Dank je. / Alsjeblieft.",
        explanation: lt("一个是谢谢，一个是请/给你。先作为固定礼貌块。", "One is thank you; the other is please/here you are. Use them as fixed polite chunks."),
        examples: [
          { dutch: "Dank je.", meaning: lt("谢谢。", "Thank you."), audioText: "Dank je.", audioSrc: "/audio/placeholders/a0/pattern-dank-je.mp3" },
          { dutch: "Koffie, alsjeblieft.", meaning: lt("请给我咖啡。", "Coffee, please."), audioText: "Koffie, alsjeblieft.", audioSrc: "/audio/placeholders/a0/koffie-alsjeblieft.mp3" },
        ],
        commonMistake: lt("alsjeblieft 很长，初学者不要边拆边卡住，先整句跟读。", "alsjeblieft is long. Beginners should imitate it as a whole instead of getting stuck analyzing it."),
      },
      {
        dutchPattern: "Tot ziens.",
        explanation: lt("比 dag 更完整的再见。", "A fuller goodbye than dag."),
        examples: [
          { dutch: "Tot ziens.", meaning: lt("再见。", "See you."), audioText: "Tot ziens.", audioSrc: "/audio/placeholders/a0/pattern-tot-ziens.mp3" },
        ],
        commonMistake: lt("不要把 ziens 读成 English signs。这里 ie 是荷兰语清晰的 ie。", "Do not pronounce ziens like English signs. The ie is a clear Dutch ie."),
      },
    ],
    miniGrammar: {
      title: lt("第一课只学固定短句", "Lesson 1 uses fixed chunks only"),
      explanation: lt("这一课不讲变位。你只需要把 hallo、dank je、alsjeblieft、tot ziens 当成能直接拿出来用的小泡泡。", "No conjugation yet. Treat hallo, dank je, alsjeblieft, and tot ziens as small ready-to-use bubbles."),
      pattern: "phrase = ready-to-use chunk",
      examples: [audio("Hallo.", "grammar-hallo"), audio("Dank je.", "grammar-dank-je"), audio("Tot ziens.", "grammar-tot-ziens")],
    },
    listenAndRepeat: [
      audio("Hallo.", "repeat-hallo"),
      audio("Dag.", "repeat-dag"),
      audio("Dank je.", "repeat-dank-je"),
      audio("Alsjeblieft.", "repeat-alsjeblieft"),
      audio("Tot ziens.", "repeat-tot-ziens"),
    ],
    microDialogue: [
      { speaker: "A", ...audio("Hallo.", "dialogue-a0-01-1"), meaning: lt("你好。", "Hello.") },
      { speaker: "B", ...audio("Hallo.", "dialogue-a0-01-2"), meaning: lt("你好。", "Hello.") },
      { speaker: "A", ...audio("Dank je. Tot ziens.", "dialogue-a0-01-3"), meaning: lt("谢谢。再见。", "Thank you. See you.") },
      { speaker: "B", ...audio("Dag.", "dialogue-a0-01-4"), meaning: lt("再见。", "Bye.") },
    ],
    practice: [
      { id: "a0-01-match", type: "match-word", prompt: lt("哪个词是“谢谢”？", "Which word means thank you?"), options: ["dag", "dank je", "tot ziens"], answer: "dank je", audioText: "Dank je.", audioSrc: "/audio/placeholders/a0/practice-a0-01-dank-je.mp3" },
      { id: "a0-01-choose", type: "choose-correct-phrase", prompt: lt("离开时可以说哪一句？", "Which phrase can you say when leaving?"), options: ["Tot ziens.", "Ik woon in Leiden.", "Mijn naam is Lin."], answer: "Tot ziens.", audioText: "Tot ziens.", audioSrc: "/audio/placeholders/a0/practice-a0-01-tot-ziens.mp3" },
      { id: "a0-01-fill", type: "fill-blank", prompt: lt("填空：___ je. = 谢谢。", "Fill in: ___ je. = Thank you."), answer: "Dank", audioText: "Dank je.", audioSrc: "/audio/placeholders/a0/practice-a0-01-fill.mp3" },
      { id: "a0-01-say", type: "say-it-yourself", prompt: lt("自己说：你好。谢谢。再见。", "Say it yourself: Hello. Thank you. Goodbye."), answer: "Hallo. Dank je. Tot ziens.", audioText: "Hallo. Dank je. Tot ziens.", audioSrc: "/audio/placeholders/a0/practice-a0-01-say.mp3" },
    ],
    speakOutput: {
      task: lt("用 3 句话完成一次超短问候：你好、谢谢、再见。", "Use 3 phrases for a tiny greeting: hello, thanks, goodbye."),
      sampleAnswer: { dutch: "Hallo. Dank je. Tot ziens.", meaning: lt("你好。谢谢。再见。", "Hello. Thank you. See you."), audioText: "Hallo. Dank je. Tot ziens.", audioSrc: "/audio/placeholders/a0/output-a0-01.mp3" },
    },
    review: {
      words: ["hallo", "dank je", "tot ziens"],
      sentencePatterns: ["Hallo. / Dag.", "Dank je. / Alsjeblieft."],
      tinyOutput: lt("说：Hallo. Dank je. Tot ziens.", "Say: Hallo. Dank je. Tot ziens."),
    },
    nextLessonId: "a0-02",
  },
  {
    id: "a0-02",
    lessonPlanId: "a0-02",
    level: "A0",
    order: 2,
    title: lt("我叫什么名字", "My Name"),
    methodMap: {
      decode: lt("听 heet、naam、jij 里的 ee/aa/ij。", "Hear ee/aa/ij in heet, naam, and jij."),
      link: lt("naam 像 English name，是很好用的桥梁词。", "naam is like English name, a useful bridge word."),
      rule: lt("只学一个小规则：Ik heet ... = 我叫……。", "Learn one tiny rule: Ik heet ... = my name is ..."),
      speak: lt("最后能说自己的名字，并问别人叫什么。", "By the end, say your name and ask someone theirs."),
    },
    lessonGoal: {
      goal: lt("能说自己叫什么，并问别人名字。", "Say your name and ask another person's name."),
      estimatedMinutes: 22,
      purpose: lt("这一课解决第一次见面最常见的问题：我是谁、我叫什么、怎么礼貌地问对方名字。", "This lesson handles the first meeting basics: who you are, your name, and how to ask someone else's name politely."),
      canSayAfter: lt("学完后你可以说：Ik heet Lin. Hoe heet jij?", "After this lesson you can say: Ik heet Lin. Hoe heet jij?"),
    },
    soundBase: {
      pronunciationHints: [
        { ...audio("heet", "heet"), sound: "ee", hint: lt("heet 里的 ee 是长音，要比短 e 稳。", "The ee in heet is long and steady.") },
        { ...audio("naam", "naam"), sound: "aa", hint: lt("naam 里的 aa 拉开一点，像把名字放出来。", "Hold the aa in naam a little longer.") },
        { ...audio("jij", "jij"), sound: "ij", hint: lt("jij 里的 ij 不要读成 i+j。", "The ij in jij is not i plus j.") },
      ],
    },
    targetWords: [
      {
        ...audio("ik", "ik"),
        meaning: lt("我", "I"),
        pronunciationHint: lt("短促一点，不要读成 English I。", "Short and quick; not English I."),
        memoryHook: lt("ik 是 A0 最重要的“我”泡泡。", "ik is the most important A0 I bubble."),
        exampleSentence: { dutch: "Ik heet Lin.", meaning: lt("我叫 Lin。", "My name is Lin."), audioText: "Ik heet Lin.", audioSrc: "/audio/placeholders/a0/ik-heet-lin.mp3" },
      },
      {
        ...audio("heet", "heet"),
        meaning: lt("叫", "am/is called"),
        pronunciationHint: lt("ee 长一点。", "Hold ee a little."),
        memoryHook: lt("先别纠结原形 heten，A0 先记 Ik heet。", "Do not worry about heten yet. At A0, memorize Ik heet."),
        exampleSentence: { dutch: "Ik heet Anna.", meaning: lt("我叫 Anna。", "My name is Anna."), audioText: "Ik heet Anna.", audioSrc: "/audio/placeholders/a0/ik-heet-anna.mp3" },
      },
      {
        ...audio("naam", "naam"),
        meaning: lt("名字", "name"),
        pronunciationHint: lt("aa 是长音。", "aa is a long vowel."),
        memoryHook: lt("naam 和 English name 长得像，意思也一样。", "naam looks like English name and means the same thing."),
        exampleSentence: { dutch: "Mijn naam is Lin.", meaning: lt("我的名字是 Lin。", "My name is Lin."), audioText: "Mijn naam is Lin.", audioSrc: "/audio/placeholders/a0/mijn-naam-is-lin.mp3" },
      },
      {
        ...audio("jij", "jij"),
        meaning: lt("你", "you"),
        pronunciationHint: lt("ij 是一整块组合音。", "ij is one sound chunk."),
        memoryHook: lt("jij 是比较熟悉的人之间的“你”。", "jij is informal you."),
        exampleSentence: { dutch: "Hoe heet jij?", meaning: lt("你叫什么？", "What is your name?"), audioText: "Hoe heet jij?", audioSrc: "/audio/placeholders/a0/hoe-heet-jij.mp3" },
      },
      {
        ...audio("u", "u"),
        meaning: lt("您", "formal you"),
        pronunciationHint: lt("u 的声音很荷兰语，先模仿，不用和英语 u 对上。", "The sound of u is very Dutch. Imitate it first; do not map it to English u."),
        memoryHook: lt("u 用在礼貌或不熟的人。", "u is used politely or with people you do not know well."),
        exampleSentence: { dutch: "Hoe heet u?", meaning: lt("您叫什么？", "What is your name?"), audioText: "Hoe heet u?", audioSrc: "/audio/placeholders/a0/hoe-heet-u.mp3" },
      },
      {
        ...audio("mijn", "mijn"),
        meaning: lt("我的", "my"),
        pronunciationHint: lt("ij 仍然是一整块。", "ij is still one chunk."),
        memoryHook: lt("mijn naam = my name。", "mijn naam = my name."),
        exampleSentence: { dutch: "Mijn naam is Anna.", meaning: lt("我的名字是 Anna。", "My name is Anna."), audioText: "Mijn naam is Anna.", audioSrc: "/audio/placeholders/a0/mijn-naam-is-anna.mp3" },
      },
    ],
    sentencePatterns: [
      {
        dutchPattern: "Ik heet ...",
        explanation: lt("最直接的“我叫……”。A0 先把它作为整句框架。", "The direct way to say my name is ... At A0, use it as a sentence frame."),
        examples: [
          { dutch: "Ik heet Lin.", meaning: lt("我叫 Lin。", "My name is Lin."), audioText: "Ik heet Lin.", audioSrc: "/audio/placeholders/a0/pattern-ik-heet-lin.mp3" },
          { dutch: "Ik heet Anna.", meaning: lt("我叫 Anna。", "My name is Anna."), audioText: "Ik heet Anna.", audioSrc: "/audio/placeholders/a0/pattern-ik-heet-anna.mp3" },
        ],
        commonMistake: lt("不要说 Ik naam ...。naam 是名词，heet 才是这里的“叫”。", "Do not say Ik naam ... Naam is a noun; heet is the verb here."),
      },
      {
        dutchPattern: "Mijn naam is ...",
        explanation: lt("更像 English my name is ...，也很好用。", "This is close to English my name is ... and is very useful."),
        examples: [
          { dutch: "Mijn naam is Lin.", meaning: lt("我的名字是 Lin。", "My name is Lin."), audioText: "Mijn naam is Lin.", audioSrc: "/audio/placeholders/a0/pattern-mijn-naam-is-lin.mp3" },
        ],
        commonMistake: lt("naam 里的 aa 要读长，不要短促带过。", "Hold the aa in naam; do not make it too short."),
      },
      {
        dutchPattern: "Hoe heet jij? / Hoe heet u?",
        explanation: lt("问名字。jij 比较随意，u 更礼貌。", "Ask someone's name. jij is informal; u is polite."),
        examples: [
          { dutch: "Hoe heet jij?", meaning: lt("你叫什么？", "What is your name?"), audioText: "Hoe heet jij?", audioSrc: "/audio/placeholders/a0/pattern-hoe-heet-jij.mp3" },
          { dutch: "Hoe heet u?", meaning: lt("您叫什么？", "What is your name?"), audioText: "Hoe heet u?", audioSrc: "/audio/placeholders/a0/pattern-hoe-heet-u.mp3" },
        ],
        commonMistake: lt("不要把 u 当英语 you 读。先听音频模仿。", "Do not pronounce u like English you. Imitate the audio first."),
      },
    ],
    miniGrammar: {
      title: lt("Ik heet ... = 我叫……", "Ik heet ... = My name is ..."),
      explanation: lt("这一课只学 heten 的一个形式：Ik heet。先能说自己的名字，不展开完整动词变位。", "This lesson only uses one form of heten: Ik heet. First learn to say your name; no full conjugation yet."),
      pattern: "Ik heet + name",
      examples: [audio("Ik heet Lin.", "grammar-ik-heet-lin"), audio("Ik heet Anna.", "grammar-ik-heet-anna")],
    },
    listenAndRepeat: [
      audio("Ik heet Lin.", "repeat-ik-heet-lin"),
      audio("Mijn naam is Lin.", "repeat-mijn-naam-is-lin"),
      audio("Hoe heet jij?", "repeat-hoe-heet-jij"),
      audio("Hoe heet u?", "repeat-hoe-heet-u"),
    ],
    microDialogue: [
      { speaker: "A", ...audio("Hallo. Ik heet Lin.", "dialogue-a0-02-1"), meaning: lt("你好。我叫 Lin。", "Hello. My name is Lin.") },
      { speaker: "B", ...audio("Hallo Lin. Ik heet Anna.", "dialogue-a0-02-2"), meaning: lt("你好 Lin。我叫 Anna。", "Hello Lin. My name is Anna.") },
      { speaker: "A", ...audio("Hoe heet jij?", "dialogue-a0-02-3"), meaning: lt("你叫什么？", "What is your name?") },
    ],
    practice: [
      { id: "a0-02-match", type: "match-word", prompt: lt("哪个词是“名字”？", "Which word means name?"), options: ["naam", "dag", "goed"], answer: "naam", audioText: "naam", audioSrc: "/audio/placeholders/a0/practice-a0-02-naam.mp3" },
      { id: "a0-02-choose", type: "choose-correct-phrase", prompt: lt("“我叫 Lin”怎么说？", "How do you say My name is Lin?"), options: ["Ik heet Lin.", "Hoe heet jij?", "Tot ziens."], answer: "Ik heet Lin.", audioText: "Ik heet Lin.", audioSrc: "/audio/placeholders/a0/practice-a0-02-ik-heet-lin.mp3" },
      { id: "a0-02-fill", type: "fill-blank", prompt: lt("填空：Ik ___ Lin.", "Fill in: Ik ___ Lin."), answer: "heet", audioText: "Ik heet Lin.", audioSrc: "/audio/placeholders/a0/practice-a0-02-fill.mp3" },
      { id: "a0-02-say", type: "say-it-yourself", prompt: lt("自己说：你好。我叫……。", "Say it yourself: Hello. My name is ..."), answer: "Hallo. Ik heet ...", audioText: "Hallo. Ik heet Lin.", audioSrc: "/audio/placeholders/a0/practice-a0-02-say.mp3" },
    ],
    speakOutput: {
      task: lt("说两句：你好。我叫……。然后问：你叫什么？", "Say two lines: Hello. My name is ... Then ask: What is your name?"),
      sampleAnswer: { dutch: "Hallo. Ik heet Lin. Hoe heet jij?", meaning: lt("你好。我叫 Lin。你叫什么？", "Hello. My name is Lin. What is your name?"), audioText: "Hallo. Ik heet Lin. Hoe heet jij?", audioSrc: "/audio/placeholders/a0/output-a0-02.mp3" },
    },
    review: {
      words: ["ik", "heet", "naam"],
      sentencePatterns: ["Ik heet ...", "Hoe heet jij?"],
      tinyOutput: lt("说：Hallo. Ik heet ... Hoe heet jij?", "Say: Hallo. Ik heet ... Hoe heet jij?"),
    },
    previousLessonId: "a0-01",
    nextLessonId: "a0-03",
  },
  {
    id: "a0-03",
    lessonPlanId: "a0-03",
    level: "A0",
    order: 3,
    title: lt("我来自哪里、住在哪里", "Where I Come From and Live"),
    methodMap: {
      decode: lt("重点听 woon、uit、China、Nederland 的声音块。", "Focus on sound chunks in woon, uit, China, and Nederland."),
      link: lt("uit 像 out/from，in 像 in，用方向感记住来源和住处。", "uit is like out/from; in is like in. Use direction to remember origin and residence."),
      rule: lt("只学两个固定框架：Ik kom uit ... / Ik woon in ...。", "Learn two fixed frames: Ik kom uit ... / Ik woon in ..."),
      speak: lt("最后能把名字、来源和居住地连成 3 句自我介绍。", "By the end, connect name, origin, and residence into a 3-sentence introduction."),
    },
    lessonGoal: {
      goal: lt("能说自己来自哪里、住在哪个城市。", "Say where you come from and which city you live in."),
      estimatedMinutes: 25,
      purpose: lt("这一课把个人信息往前推进一步：不只说名字，还能说来源和现在住在哪里。", "This lesson moves personal information one step forward: not only your name, but where you come from and where you live now."),
      canSayAfter: lt("学完后你可以说：Ik kom uit China. Ik woon in Leiden.", "After this lesson you can say: Ik kom uit China. Ik woon in Leiden."),
    },
    soundBase: {
      pronunciationHints: [
        { ...audio("woon", "woon"), sound: "oo", hint: lt("woon 里的 oo 是长圆唇音，别读太短。", "The oo in woon is a long rounded vowel; do not make it too short.") },
        { ...audio("uit", "uit"), sound: "ui", hint: lt("uit 里的 ui 是特殊音，不要拆成 u+i。", "The ui in uit is a special sound. Do not split it into u+i.") },
        { ...audio("Nederland", "nederland"), sound: "ee / a", hint: lt("Nederland 先按 Ne-der-land 三块慢慢读。", "Read Nederland slowly in chunks: Ne-der-land.") },
      ],
    },
    targetWords: [
      {
        ...audio("kom", "kom"),
        meaning: lt("来/来自", "come"),
        pronunciationHint: lt("短 o，嘴型圆一点。", "Short o with rounded lips."),
        memoryHook: lt("先记固定块：Ik kom uit ... = 我来自……。", "First memorize the chunk: Ik kom uit ... = I come from ..."),
        exampleSentence: { dutch: "Ik kom uit China.", meaning: lt("我来自中国。", "I come from China."), audioText: "Ik kom uit China.", audioSrc: "/audio/placeholders/a0/ik-kom-uit-china.mp3" },
      },
      {
        ...audio("uit", "uit"),
        meaning: lt("从/来自", "from/out"),
        pronunciationHint: lt("ui 是一整块，不要拆读。", "ui is one chunk; do not split it."),
        memoryHook: lt("uit 像 out：从里面出来，所以是“来自”。", "uit is like out: coming out from somewhere, so from."),
        exampleSentence: { dutch: "Ik kom uit Nederland.", meaning: lt("我来自荷兰。", "I come from the Netherlands."), audioText: "Ik kom uit Nederland.", audioSrc: "/audio/placeholders/a0/ik-kom-uit-nederland.mp3" },
      },
      {
        ...audio("woon", "woon"),
        meaning: lt("住", "live"),
        pronunciationHint: lt("oo 长一点。", "Hold oo a little."),
        memoryHook: lt("woon = live。先和 in 绑定：woon in。", "woon = live. Bind it with in: woon in."),
        exampleSentence: { dutch: "Ik woon in Leiden.", meaning: lt("我住在 Leiden。", "I live in Leiden."), audioText: "Ik woon in Leiden.", audioSrc: "/audio/placeholders/a0/ik-woon-in-leiden.mp3" },
      },
      {
        ...audio("in", "in"),
        meaning: lt("在……里", "in"),
        pronunciationHint: lt("短短一拍。", "One short beat."),
        memoryHook: lt("和 English in 一样，是非常好用的桥梁词。", "Same as English in, a very useful bridge word."),
        exampleSentence: { dutch: "Ik woon in Delft.", meaning: lt("我住在 Delft。", "I live in Delft."), audioText: "Ik woon in Delft.", audioSrc: "/audio/placeholders/a0/ik-woon-in-delft.mp3" },
      },
      {
        ...audio("China", "china"),
        meaning: lt("中国", "China"),
        pronunciationHint: lt("按荷兰语读法听，不完全等于中文或英文。", "Listen to the Dutch pronunciation; it is not exactly Chinese or English."),
        memoryHook: lt("这是很多中文学习者第一句自我介绍会用到的词。", "This is often one of the first self-introduction words for Chinese-speaking learners."),
        exampleSentence: { dutch: "Ik kom uit China.", meaning: lt("我来自中国。", "I come from China."), audioText: "Ik kom uit China.", audioSrc: "/audio/placeholders/a0/china-example.mp3" },
      },
      {
        ...audio("Nederland", "nederland"),
        meaning: lt("荷兰", "the Netherlands"),
        pronunciationHint: lt("先拆 Ne-der-land。", "First chunk it as Ne-der-land."),
        memoryHook: lt("Nederland 是你正在学的生活环境关键词。", "Nederland is a key word for the environment where you use Dutch."),
        exampleSentence: { dutch: "Ik woon in Nederland.", meaning: lt("我住在荷兰。", "I live in the Netherlands."), audioText: "Ik woon in Nederland.", audioSrc: "/audio/placeholders/a0/ik-woon-in-nederland.mp3" },
      },
    ],
    sentencePatterns: [
      {
        dutchPattern: "Ik kom uit ...",
        explanation: lt("说“我来自……”。国家、城市都可以先放进去。", "Say I come from ... You can use a country or city."),
        examples: [
          { dutch: "Ik kom uit China.", meaning: lt("我来自中国。", "I come from China."), audioText: "Ik kom uit China.", audioSrc: "/audio/placeholders/a0/pattern-ik-kom-uit-china.mp3" },
          { dutch: "Ik kom uit Beijing.", meaning: lt("我来自北京。", "I come from Beijing."), audioText: "Ik kom uit Beijing.", audioSrc: "/audio/placeholders/a0/pattern-ik-kom-uit-beijing.mp3" },
        ],
        commonMistake: lt("不要说 Ik kom in China 表示来自。来源用 uit。", "Do not use Ik kom in China for origin. Use uit for from."),
      },
      {
        dutchPattern: "Ik woon in ...",
        explanation: lt("说“我住在……”。住处用 in。", "Say I live in ... Use in for residence."),
        examples: [
          { dutch: "Ik woon in Leiden.", meaning: lt("我住在 Leiden。", "I live in Leiden."), audioText: "Ik woon in Leiden.", audioSrc: "/audio/placeholders/a0/pattern-ik-woon-in-leiden.mp3" },
          { dutch: "Ik woon in Nederland.", meaning: lt("我住在荷兰。", "I live in the Netherlands."), audioText: "Ik woon in Nederland.", audioSrc: "/audio/placeholders/a0/pattern-ik-woon-in-nederland.mp3" },
        ],
        commonMistake: lt("不要把 kom uit 和 woon in 混在一起。来源 uit，居住 in。", "Do not mix kom uit and woon in. Origin uses uit; residence uses in."),
      },
      {
        dutchPattern: "Waar woon jij?",
        explanation: lt("问别人住在哪里。", "Ask where someone lives."),
        examples: [
          { dutch: "Waar woon jij?", meaning: lt("你住在哪里？", "Where do you live?"), audioText: "Waar woon jij?", audioSrc: "/audio/placeholders/a0/pattern-waar-woon-jij.mp3" },
        ],
        commonMistake: lt("A0 先整句跟读，不急着拆 waar 的语法。", "At A0, repeat the whole sentence first; no need to analyze waar yet."),
      },
    ],
    miniGrammar: {
      title: lt("uit = 来自，in = 住在", "uit = from, in = in"),
      explanation: lt("这一课只有一个小规则：来源用 uit，居住地用 in。", "This lesson has one tiny rule: use uit for origin and in for where you live."),
      pattern: "Ik kom uit ... / Ik woon in ...",
      examples: [audio("Ik kom uit China.", "grammar-ik-kom-uit-china"), audio("Ik woon in Leiden.", "grammar-ik-woon-in-leiden")],
    },
    listenAndRepeat: [
      audio("Ik kom uit China.", "repeat-ik-kom-uit-china"),
      audio("Ik woon in Leiden.", "repeat-ik-woon-in-leiden"),
      audio("Waar woon jij?", "repeat-waar-woon-jij"),
      audio("Ik woon in Nederland.", "repeat-ik-woon-in-nederland"),
    ],
    microDialogue: [
      { speaker: "A", ...audio("Hallo. Ik heet Lin.", "dialogue-a0-03-1"), meaning: lt("你好。我叫 Lin。", "Hello. My name is Lin.") },
      { speaker: "B", ...audio("Waar woon jij?", "dialogue-a0-03-2"), meaning: lt("你住在哪里？", "Where do you live?") },
      { speaker: "A", ...audio("Ik woon in Leiden.", "dialogue-a0-03-3"), meaning: lt("我住在 Leiden。", "I live in Leiden.") },
      { speaker: "A", ...audio("Ik kom uit China.", "dialogue-a0-03-4"), meaning: lt("我来自中国。", "I come from China.") },
    ],
    practice: [
      { id: "a0-03-match", type: "match-word", prompt: lt("哪个词表示“住”？", "Which word means live?"), options: ["woon", "dag", "naam"], answer: "woon", audioText: "woon", audioSrc: "/audio/placeholders/a0/practice-a0-03-woon.mp3" },
      { id: "a0-03-choose", type: "choose-correct-phrase", prompt: lt("“我来自中国”怎么说？", "How do you say I come from China?"), options: ["Ik kom uit China.", "Ik woon in China.", "Hoe heet jij?"], answer: "Ik kom uit China.", audioText: "Ik kom uit China.", audioSrc: "/audio/placeholders/a0/practice-a0-03-kom-uit.mp3" },
      { id: "a0-03-fill", type: "fill-blank", prompt: lt("填空：Ik woon ___ Leiden.", "Fill in: Ik woon ___ Leiden."), answer: "in", audioText: "Ik woon in Leiden.", audioSrc: "/audio/placeholders/a0/practice-a0-03-fill.mp3" },
      { id: "a0-03-say", type: "say-it-yourself", prompt: lt("自己说：我叫……。我来自……。我住在……。", "Say it yourself: My name is ... I come from ... I live in ..."), answer: "Ik heet ... Ik kom uit ... Ik woon in ...", audioText: "Ik heet Lin. Ik kom uit China. Ik woon in Leiden.", audioSrc: "/audio/placeholders/a0/practice-a0-03-say.mp3" },
    ],
    speakOutput: {
      task: lt("用 3 句介绍自己：名字、来自哪里、住在哪里。", "Use 3 sentences to introduce yourself: name, origin, and residence."),
      sampleAnswer: { dutch: "Ik heet Lin. Ik kom uit China. Ik woon in Leiden.", meaning: lt("我叫 Lin。我来自中国。我住在 Leiden。", "My name is Lin. I come from China. I live in Leiden."), audioText: "Ik heet Lin. Ik kom uit China. Ik woon in Leiden.", audioSrc: "/audio/placeholders/a0/output-a0-03.mp3" },
    },
    writingTask: lt("写 3 句：Ik heet ... / Ik kom uit ... / Ik woon in ...", "Write 3 sentences: Ik heet ... / Ik kom uit ... / Ik woon in ..."),
    review: {
      words: ["kom uit", "woon", "Nederland"],
      sentencePatterns: ["Ik kom uit ...", "Ik woon in ..."],
      tinyOutput: lt("说：Ik heet ... Ik kom uit ... Ik woon in ...", "Say: Ik heet ... Ik kom uit ... Ik woon in ..."),
    },
    previousLessonId: "a0-02",
  },
];

const wordMeaningFallback = lt("本课关键词", "lesson keyword");

const wordLookup = new Map(wordItems.map((word) => [word.dutch.toLowerCase(), word]));

const isGeneratedCategoryMeaning = (meaning?: LocalizedText) => {
  if (!meaning) return false;
  const zh = meaning.zh.trim();
  const en = meaning.en.trim().toLowerCase();
  return (
    /词$/.test(zh) ||
    ["解释问题词", "喜好选择词", "国家城市语言词", "基础问答词", "方向地点词", "求助词"].some((label) => zh.includes(label)) ||
    en.endsWith(" word") ||
    en.includes("theme word") ||
    en.includes("lesson keyword")
  );
};

const isWeakMemoryHook = (hook?: LocalizedText) => {
  if (!hook) return true;
  const zh = hook.zh.trim();
  const en = hook.en.trim();
  return (
    (!zh && !en) ||
    zh.includes("这个句一起记") ||
    zh.includes("本课关键词") ||
    en.includes("lesson keyword") ||
    en.includes("put it into")
  );
};

const levelRank = { A0: 0, A1: 1, A2: 2, B1: 3 } as const;

const lessonWordLemmas: Record<string, string> = {
  ben: "zijn",
  bent: "zijn",
  heb: "hebben",
  hebt: "hebben",
  heeft: "hebben",
  woon: "wonen",
  woont: "wonen",
  kom: "komen",
  komt: "komen",
  spreek: "spreken",
  spreekt: "spreken",
  begrijp: "begrijpen",
  begrijpt: "begrijpen",
  leer: "leren",
  leert: "leren",
  werk: "werken",
  werkt: "werken",
  kijk: "kijken",
  kijkt: "kijken",
  lees: "lezen",
  leest: "lezen",
  schrijf: "schrijven",
  schrijft: "schrijven",
  zeg: "zeggen",
  zegt: "zeggen",
  bel: "bellen",
  belt: "bellen",
  help: "helpen",
  helpt: "helpen",
  maak: "maken",
  maakt: "maken",
  koop: "kopen",
  koopt: "kopen",
  drink: "drinken",
  drinkt: "drinken",
  eet: "eten",
  open: "openen",
  opent: "openen",
  sluit: "sluiten",
};

const normalizeLessonWord = (word: string) => lessonWordLemmas[word.toLowerCase()] ?? word;

const targetVocabularyForPlan = (plan: LessonPlan) => {
  const seen = new Set<string>();
  return plan.targetVocabulary
    .map(normalizeLessonWord)
    .filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const targetWordLimitForPlan = (plan: LessonPlan) => {
  if (plan.id === "a0-05") return 32;
  if (plan.coreTheme.en.toLowerCase().includes("number")) return 32;
  if (plan.level === "B1") return 12;
  return 10;
};

const lessonSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, "-")
    .replace(/^-|-$/g, "");

const lessonAudio = (lessonId: string, dutch: string, key: string): AudioItem => ({
  dutch,
  audioText: dutch,
  audioSrc: `/audio/placeholders/${lessonId}/${key}-${lessonSlug(dutch) || "line"}.mp3`,
});

const normalizedSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const firstAvailable = (vocabulary: string[], candidates: string[], fallback: string) => {
  const normalizedVocabulary = new Set(vocabulary.map((word) => word.toLowerCase()));
  return candidates.find((candidate) => normalizedVocabulary.has(candidate.toLowerCase())) ?? fallback;
};

const articlePhrase = (word: string) => {
  const item = wordLookup.get(word.toLowerCase());
  if (item?.article) return `${item.article} ${word}`;
  if (["boek", "huis", "water", "brood", "station", "plein", "geld", "probleem"].includes(word.toLowerCase())) return `het ${word}`;
  if (["pen", "tas", "fiets", "telefoon", "kaart", "vraag", "supermarkt", "winkel", "trein", "kamer"].includes(word.toLowerCase())) return `de ${word}`;
  return word;
};

const fillPattern = (pattern: string, plan: LessonPlan, index: number, vocabulary = targetVocabularyForPlan(plan)) => {
  const lowerPattern = pattern.toLowerCase();
  const language = firstAvailable(vocabulary, ["Nederlands", "Chinees", "Engels"], index % 2 === 0 ? "Nederlands" : "Engels");
  const food = firstAvailable(vocabulary, ["brood", "water", "kaas", "melk", "koffie", "thee", "appel", "rijst"], "brood");
  const object = firstAvailable(vocabulary, ["boek", "pen", "tas", "telefoon", "fiets", "kaart", "geld"], "boek");
  const place = firstAvailable(vocabulary, ["station", "supermarkt", "school", "werk", "huis", "gemeente"], "station");
  const person = firstAvailable(vocabulary, ["moeder", "vader", "broer", "zus", "collega", "student"], "moeder");

  if (/^ik spreek geen \.\.\./i.test(pattern)) return "Ik spreek geen Engels.";
  if (/^ik spreek een beetje \.\.\./i.test(pattern)) return "Ik spreek een beetje Nederlands.";
  if (/^ik spreek \.\.\./i.test(pattern)) return index % 2 === 0 ? `Ik spreek ${language}.` : "Ik spreek Chinees.";
  if (/^spreek jij \.\.\./i.test(pattern)) return "Spreek jij Engels?";

  if (/^ik kom uit \.\.\./i.test(pattern)) return index % 2 === 0 ? "Ik kom uit China." : "Ik kom uit Nederland.";
  if (/^ik woon in \.\.\./i.test(pattern)) return index % 2 === 0 ? "Ik woon in Delft." : "Ik woon in Nederland.";
  if (/^waar kom jij vandaan/i.test(pattern)) return "Waar kom jij vandaan?";
  if (/^waar woon jij/i.test(pattern)) return "Waar woon jij?";

  if (/^mijn nummer is \.\.\./i.test(pattern)) return "Mijn nummer is nul zes een twee drie vier vijf zes zeven acht.";
  if (/^ik ben \.\.\. jaar/i.test(pattern)) return "Ik ben vijfentwintig jaar.";
  if (/^dat is \.\.\. euro/i.test(pattern)) return "Dat is drie euro.";
  if (/^vandaag is \.\.\./i.test(pattern)) return "Vandaag is maandag.";
  if (/^het is \.\.\. uur/i.test(pattern)) return "Het is drie uur.";
  if (/^de afspraak is op \.\.\./i.test(pattern)) return "De afspraak is op maandag.";

  if (/^dit is \.\.\./i.test(pattern)) return `Dit is een ${object}.`;
  if (/^dat is een \.\.\./i.test(pattern)) return "Dat is een tas.";
  if (/^dat is \.\.\./i.test(pattern)) return `Dat is een ${object}.`;
  if (/^wat is dat/i.test(pattern)) return "Wat is dat?";

  if (/^ik heb geen \.\.\./i.test(pattern)) return `Ik heb geen ${object}.`;
  if (/^ik heb \.\.\. nodig/i.test(pattern)) return "Ik heb hulp nodig.";
  if (/^ik heb \.\.\./i.test(pattern)) return `Ik heb een ${object}.`;
  if (/^heb jij \.\.\./i.test(pattern)) return `Heb jij een ${object}?`;
  if (/^ja, ik heb \.\.\./i.test(pattern)) return `Ja, ik heb een ${object}.`;

  if (/^ik wil graag \.\.\./i.test(pattern)) return `Ik wil graag ${food}.`;
  if (/^ik wil liever \.\.\./i.test(pattern)) return "Ik wil liever koffie.";
  if (/^ik wil \.\.\./i.test(pattern)) return `Ik wil ${food}.`;
  if (/^ik kan niet \.\.\./i.test(pattern)) return "Ik kan niet komen.";
  if (/^ik kan \.\.\./i.test(pattern)) return "Ik kan helpen.";

  if (/^waar is \.\.\./i.test(pattern)) return `Waar is ${articlePhrase(place)}?`;
  if (/^het is tegenover \.\.\./i.test(pattern)) return "Het is tegenover de supermarkt.";
  if (/^de winkel is naast het station/i.test(pattern)) return "De winkel is naast het station.";
  if (/^ga rechtdoor/i.test(pattern)) return "Ga rechtdoor.";

  if (/^hoeveel kost dit/i.test(pattern)) return "Hoeveel kost dit?";
  if (/^ik zoek \.\.\./i.test(pattern)) return `Ik zoek ${food}.`;
  if (/^ik neem \.\.\./i.test(pattern)) return lowerPattern.includes("trein") || vocabulary.includes("trein") ? "Ik neem de trein." : `Ik neem ${food}.`;
  if (/^dat is te duur/i.test(pattern)) return "Dat is te duur.";

  if (/^ik drink \.\.\./i.test(pattern)) return "Ik drink water.";
  if (/^ik eet \.\.\./i.test(pattern)) return "Ik eet brood.";
  if (/^ik vind \.\.\. lekker/i.test(pattern)) return `Ik vind ${food} lekker.`;
  if (/^ik vind \.\.\. niet leuk/i.test(pattern)) return "Ik vind regen niet leuk.";
  if (/^ik vind \.\.\. leuk/i.test(pattern)) return "Ik vind fietsen leuk.";
  if (/^wil je \.\.\. of \.\.\./i.test(pattern)) return "Wil je koffie of thee?";

  if (/^dit is mijn moeder/i.test(pattern)) return "Dit is mijn moeder.";
  if (/^ik heb een broer/i.test(pattern)) return "Ik heb een broer.";
  if (/^mijn familie woont in \.\.\./i.test(pattern)) return "Mijn familie woont in China.";

  if (/^mijn huis heeft \.\.\./i.test(pattern)) return "Mijn huis heeft twee kamers.";
  if (/^er is een tafel in de kamer/i.test(pattern)) return "Er is een tafel in de kamer.";
  if (/^de keuken is klein/i.test(pattern)) return "De keuken is klein.";

  if (/^ik werk in \.\.\./i.test(pattern)) return "Ik werk in Amsterdam.";
  if (/^ik leer nederlands/i.test(pattern)) return "Ik leer Nederlands.";
  if (/^ik ben student/i.test(pattern)) return "Ik ben student.";
  if (/^mijn collega is \.\.\./i.test(pattern)) return "Mijn collega is aardig.";

  if (/^ik sta om zeven uur op/i.test(pattern)) return "Ik sta om zeven uur op.";
  if (/^ik werk elke dag/i.test(pattern)) return "Ik werk elke dag.";
  if (/^ik fiets vaak naar school/i.test(pattern)) return "Ik fiets vaak naar school.";

  if (/^ik ben ziek/i.test(pattern)) return "Ik ben ziek.";
  if (/^ik heb hoofdpijn/i.test(pattern)) return "Ik heb hoofdpijn.";
  if (/^ik ben moe/i.test(pattern)) return "Ik ben moe.";
  if (/^het gaat beter/i.test(pattern)) return "Het gaat beter.";

  if (/^kan ik om \.\.\. komen/i.test(pattern)) return "Kan ik om drie uur komen?";
  if (/^ik kan om drie uur/i.test(pattern)) return "Ik kan om drie uur.";
  if (/^wanneer kan ik komen/i.test(pattern)) return "Wanneer kan ik komen?";
  if (/^ik bel later/i.test(pattern)) return "Ik bel later.";

  if (/^ik bel voor \.\.\./i.test(pattern)) return "Ik bel voor een afspraak.";
  if (/^kunt u dat herhalen/i.test(pattern)) return "Kunt u dat herhalen?";
  if (/^een moment/i.test(pattern)) return "Een moment, alstublieft.";
  if (/^ik bel later terug/i.test(pattern)) return "Ik bel later terug.";

  if (/^ik woon \.\.\. en ik werk \.\.\./i.test(pattern)) return "Ik woon in Delft en ik werk in Amsterdam.";
  if (/^vandaag ga ik \.\.\./i.test(pattern)) return "Vandaag ga ik naar school.";

  const replacements = [
    "Nederlands",
    "water",
    "het station",
    "een afspraak",
    "mijn naam",
    "morgen",
    "brood",
    "de supermarkt",
  ];
  const replacement = replacements[index % replacements.length];
  let line = pattern.replace(/\.\.\./g, replacement);
  return normalizedSentence(line);
};

const sentenceMeaning = (dutch: string, plan: LessonPlan): LocalizedText => {
  const known = meaningForUsableSentence(dutch);
  if (known.zh && known.en) return lt(known.zh, known.en);
  return lt(`用于「${plan.title.zh}」的实用句。`, `A useful sentence for "${plan.title.en}".`);
};

const curatedWordExamples: Record<string, { dutch: string; zh: string; en: string }> = {
  spreken: { dutch: "Ik spreek een beetje Nederlands.", zh: "我会说一点荷兰语。", en: "I speak a little Dutch." },
  nederlands: { dutch: "Ik spreek Nederlands.", zh: "我说荷兰语。", en: "I speak Dutch." },
  chinees: { dutch: "Ik spreek Chinees.", zh: "我说中文。", en: "I speak Chinese." },
  engels: { dutch: "Spreek jij Engels?", zh: "你会说英语吗？", en: "Do you speak English?" },
  "een beetje": { dutch: "Ik spreek een beetje Nederlands.", zh: "我会说一点荷兰语。", en: "I speak a little Dutch." },
  goed: { dutch: "Het gaat goed.", zh: "很好。", en: "It is going well." },
  niet: { dutch: "Ik begrijp het niet.", zh: "我不明白。", en: "I do not understand it." },
  begrijpen: { dutch: "Ik begrijp het niet.", zh: "我不明白。", en: "I do not understand it." },
  taal: { dutch: "Nederlands is een taal.", zh: "荷兰语是一门语言。", en: "Dutch is a language." },
  waar: { dutch: "Waar is het station?", zh: "车站在哪里？", en: "Where is the station?" },
  hier: { dutch: "Ik ben hier.", zh: "我在这里。", en: "I am here." },
  daar: { dutch: "Daar is de winkel.", zh: "商店在那里。", en: "The shop is there." },
  links: { dutch: "Ga links.", zh: "向左走。", en: "Go left." },
  rechts: { dutch: "Ga rechts.", zh: "向右走。", en: "Go right." },
  rechtdoor: { dutch: "Ga rechtdoor.", zh: "直走。", en: "Go straight ahead." },
  straat: { dutch: "De straat is dichtbij.", zh: "这条街很近。", en: "The street is nearby." },
  plein: { dutch: "Het plein is daar.", zh: "广场在那里。", en: "The square is there." },
  naast: { dutch: "De winkel is naast het station.", zh: "商店在车站旁边。", en: "The shop is next to the station." },
  voor: { dutch: "Ik sta voor het station.", zh: "我站在车站前面。", en: "I am standing in front of the station." },
  tegenover: { dutch: "Het is tegenover de supermarkt.", zh: "它在超市对面。", en: "It is opposite the supermarket." },
  achter: { dutch: "De fiets staat achter het huis.", zh: "自行车在房子后面。", en: "The bike is behind the house." },
  boven: { dutch: "De kamer is boven.", zh: "房间在楼上。", en: "The room is upstairs." },
  beneden: { dutch: "De keuken is beneden.", zh: "厨房在楼下。", en: "The kitchen is downstairs." },
  dichtbij: { dutch: "Het station is dichtbij.", zh: "车站很近。", en: "The station is nearby." },
  ver: { dutch: "Het station is ver.", zh: "车站很远。", en: "The station is far away." },
  wil: { dutch: "Ik wil water.", zh: "我想要水。", en: "I want water." },
  nodig: { dutch: "Ik heb hulp nodig.", zh: "我需要帮助。", en: "I need help." },
  kan: { dutch: "Ik kan helpen.", zh: "我可以帮忙。", en: "I can help." },
  helpen: { dutch: "Kunt u mij helpen?", zh: "您能帮我吗？", en: "Can you help me?" },
  hulp: { dutch: "Ik heb hulp nodig.", zh: "我需要帮助。", en: "I need help." },
  langzaam: { dutch: "Kunt u langzaam spreken?", zh: "您能慢一点说吗？", en: "Can you speak slowly?" },
  makkelijk: { dutch: "Dit is makkelijk.", zh: "这很简单。", en: "This is easy." },
  moeilijk: { dutch: "Dit is moeilijk.", zh: "这很难。", en: "This is difficult." },
  komen: { dutch: "Ik kan niet komen.", zh: "我不能来。", en: "I cannot come." },
};

const curatedMemoryHooks: Record<string, LocalizedText> = {
  spreken: lt("spreken 是动词原本的样子；放进句子会变：ik spreek / jij spreekt / wij spreken。A0 先用 Ik spreek ...", "spreken is the base verb. In sentences: ik spreek / jij spreekt / wij spreken."),
  nederlands: lt("Nederlands 是“荷兰语”。语言名直接放在 spreek 后面：Ik spreek Nederlands.", "Nederlands means Dutch. Put language names after spreek: Ik spreek Nederlands."),
  chinees: lt("Chinees 是“中文”。和 Nederlands、Engels 一起作为语言词块记。", "Chinees means Chinese. Learn it with Nederlands and Engels as language chunks."),
  engels: lt("Engels 是“英语”。问别人会不会说：Spreek jij Engels?", "Engels means English. Ask: Spreek jij Engels?"),
  "een beetje": lt("een beetje = 一点点。A0 不求流利，先会说：Ik spreek een beetje Nederlands.", "een beetje means a little. First say: Ik spreek een beetje Nederlands."),
  goed: lt("goed = 好。语言能力里可以先搭配 een beetje，别急着说很复杂。", "goed means good. For language ability, start with simple chunks first."),
  niet: lt("niet = 不。先记救命句：Ik begrijp het niet.", "niet means not. First remember: Ik begrijp het niet."),
  begrijpen: lt("begrijpen 是动词原本的样子；句子里常用 ik begrijp。A0 先整句记：Ik begrijp het niet.", "begrijpen is the base verb; ik begrijp is used in sentences. First remember: Ik begrijp het niet."),
  taal: lt("taal = 语言。Nederlands / Engels / Chinees 都是 taal。", "taal means language. Nederlands / Engels / Chinees are languages."),
  waar: lt("waar 问地点；wanneer 问时间。先把 waar/wanneer 分清。", "waar asks place; wanneer asks time."),
  hier: lt("hier = 这里，指你所在的位置。和 daar（那里）成对记。", "hier means here. Pair it with daar, there."),
  daar: lt("daar = 那里，指离你远一点的位置。和 hier（这里）成对记。", "daar means there. Pair it with hier, here."),
  links: lt("links = 左。问路时和 rechts（右）成对记。", "links means left. Pair it with rechts, right."),
  rechts: lt("rechts = 右。问路时和 links（左）成对记。", "rechts means right. Pair it with links, left."),
  rechtdoor: lt("rechtdoor = 直走。recht 有“直”的感觉，door 有“往前穿过去”的感觉。", "rechtdoor means straight ahead. recht feels straight; door feels through/forward."),
  straat: lt("straat 像 English street，是问路和地址里的高频词。", "straat is close to English street, common for directions and addresses."),
  plein: lt("plein = 广场。城市里问路常会遇到 station、straat、plein。", "plein means square. It often appears with station and straat in directions."),
  naast: lt("naast = 在旁边。记一句：naast het station。", "naast means next to. Remember: naast het station."),
  voor: lt("voor = 在前面/为了。问路这课先记“在前面”。", "voor can mean in front of/for. In this lesson, learn in front of."),
  tegenover: lt("tegenover = 在对面。问路时常说 tegenover de supermarkt。", "tegenover means opposite/across from. Useful in directions."),
  wil: lt("完整动词是 willen。句子里先学 ik wil = 我想要：Ik wil water.", "The base verb is willen. First learn ik wil = I want: Ik wil water."),
  nodig: lt("nodig 不单独当“我需要”用。荷兰语常说：Ik heb ... nodig = 我需要……。", "nodig does not mean I need by itself. Dutch often says: Ik heb ... nodig = I need ..."),
  kan: lt("完整动词是 kunnen。句子里先学 ik kan = 我可以/我能：Ik kan helpen.", "The base verb is kunnen. First learn ik kan = I can: Ik kan helpen."),
  helpen: lt("helpen = 帮助。求助时直接说：Kunt u mij helpen?", "helpen means help. To ask for help, say: Kunt u mij helpen?"),
  hulp: lt("hulp = 帮助，是名词。和 helpen（帮助这个动作）放一起记。", "hulp means help as a noun. Learn it with helpen, the verb."),
  langzaam: lt("langzaam = 慢一点。听不懂时不要硬撑，直接说：Kunt u langzaam spreken?", "langzaam means slowly. When you do not understand, say: Kunt u langzaam spreken?"),
  makkelijk: lt("makkelijk = 简单/容易。和 moeilijk（难）成对记。", "makkelijk means easy. Pair it with moeilijk, difficult."),
  moeilijk: lt("moeilijk = 难。和 makkelijk（简单）成对记。", "moeilijk means difficult. Pair it with makkelijk, easy."),
  komen: lt("komen = 来。A0 先记实用句：Ik kan niet komen.", "komen means come. At A0, remember: Ik kan niet komen."),
};

const curatedWordMeanings: Record<string, LocalizedText> = {
  spreken: lt("说/会说", "speak"),
  begrijpen: lt("理解/明白", "understand"),
  nederlands: lt("荷兰语", "Dutch"),
  chinees: lt("中文", "Chinese"),
  engels: lt("英语", "English"),
  "een beetje": lt("一点点", "a little"),
  taal: lt("语言", "language"),
  dit: lt("这/这个", "this"),
  dat: lt("那/那个", "that"),
  is: lt("是", "is"),
  het: lt("它/这个词块里的 het", "it/the"),
  wat: lt("什么", "what"),
  boek: lt("书", "book"),
  pen: lt("笔", "pen"),
  tas: lt("包", "bag"),
  huis: lt("房子/家", "house/home"),
  water: lt("水", "water"),
  wil: lt("想要（willen 的 ik 形式）", "want (ik form of willen)"),
  nodig: lt("需要/必要（放在 nodig hebben 里用）", "needed/necessary (used in nodig hebben)"),
  kan: lt("可以/能够（kunnen 的 ik 形式）", "can (ik form of kunnen)"),
  helpen: lt("帮助", "help"),
  hulp: lt("帮助", "help"),
  makkelijk: lt("简单/容易", "easy"),
  moeilijk: lt("难/困难", "difficult"),
  komen: lt("来", "come"),
  nul: lt("零", "zero"),
  een: lt("一", "one"),
  twee: lt("二", "two"),
  drie: lt("三", "three"),
  vier: lt("四", "four"),
  vijf: lt("五", "five"),
  zes: lt("六", "six"),
  zeven: lt("七", "seven"),
  acht: lt("八", "eight"),
  negen: lt("九", "nine"),
  tien: lt("十", "ten"),
  elf: lt("十一", "eleven"),
  twaalf: lt("十二", "twelve"),
  dertien: lt("十三", "thirteen"),
  veertien: lt("十四", "fourteen"),
  vijftien: lt("十五", "fifteen"),
  zestien: lt("十六", "sixteen"),
  zeventien: lt("十七", "seventeen"),
  achttien: lt("十八", "eighteen"),
  negentien: lt("十九", "nineteen"),
  twintig: lt("二十", "twenty"),
  dertig: lt("三十", "thirty"),
  veertig: lt("四十", "forty"),
  vijftig: lt("五十", "fifty"),
  zestig: lt("六十", "sixty"),
  zeventig: lt("七十", "seventy"),
  tachtig: lt("八十", "eighty"),
  negentig: lt("九十", "ninety"),
  honderd: lt("一百", "one hundred"),
};

const curatedPronunciationHints: Record<string, LocalizedText> = {
  wil: lt("wil 先当一个短词听，不要读成英文 will。", "Listen to wil as a short Dutch word; do not pronounce it like English will."),
  kan: lt("kan 里的 a 是荷兰语短 a，先听整词 kan。", "The a in kan is a Dutch short a. Listen to the whole word kan."),
  nodig: lt("nodig 里注意 o 和 -ig 结尾；先和 Ik heb ... nodig 一起跟读。", "In nodig, notice the o and the -ig ending. Repeat it inside Ik heb ... nodig."),
  langzaam: lt("langzaam 里 aa 是长音；这节课把它放进请求别人慢一点的句子里。", "In langzaam, aa is a long sound. Use it in a sentence asking someone to slow down."),
};

const dutchNumberWords = new Set([
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

const wordAsVerbItem = (word: string, plan: LessonPlan): WordItem => ({
  id: `lesson-${plan.id}-${lessonSlug(word)}`,
  level: plan.level,
  originalLevel: plan.level,
  appearsInLevels: [plan.level],
  dutch: word,
  meaning: curatedWordMeanings[word.toLowerCase()] ?? wordMeaningFallback,
  theme: plan.coreTheme.en,
  priority: "must",
  activeOrPassive: "active",
  examRelevance: "medium",
  levelConfidence: "high",
  sourceTags: ["manual"],
  scenarioTags: [lessonSlug(plan.coreTheme.en)],
  levelReason: lt("课程生成时用于展示动词三格。", "Used to display verb forms in lesson generation."),
  reviewStatus: "approved",
  memoryHook: curatedMemoryHooks[word.toLowerCase()] ?? lt("", ""),
  phraseChunks: [],
  relatedWords: [],
  exampleSentence: wordExampleFor(word, plan, 0),
  audioText: word,
});

const soundHintForWord = (word: string, plan: LessonPlan): LocalizedText => {
  const lower = word.toLowerCase();
  if (curatedPronunciationHints[lower]) return curatedPronunciationHints[lower];
  const chunk = lower.includes("sch")
    ? "sch"
    : lower.includes("ch")
      ? "ch"
      : lower.includes("aa")
        ? "aa"
        : lower.includes("ee")
          ? "ee"
          : lower.includes("oo")
            ? "oo"
            : lower.includes("ui")
              ? "ui"
              : lower.includes("ei") || lower.includes("ij")
                ? "ei/ij"
                : lower.includes("oe")
                  ? "oe"
                  : lower.includes("eu")
                    ? "eu"
                    : lower.includes("r")
                      ? "r"
                      : "";
  return chunk
    ? lt(`听 ${word} 时注意 ${chunk} 这段声音。`, `When listening to ${word}, notice the ${chunk} sound.`)
    : lt(`先听整词 ${word}，再放进「${plan.title.zh}」的句子里跟读。`, `Listen to ${word} as a whole, then repeat it in a "${plan.title.en}" sentence.`);
};

const wordExampleFor = (word: string, plan: LessonPlan, index: number) => {
  if (plan.id === "a0-05" && dutchNumberWords.has(word.toLowerCase())) {
    const meaning = curatedWordMeanings[word.toLowerCase()] ?? lt("数字", "number");
    const dutch = `${word}.`;
    return {
      dutch,
      meaning: lt(`${word} = ${meaning.zh}`, `${word} = ${meaning.en}`),
      audioText: dutch,
      audioSrc: `/audio/placeholders/${plan.id}/word-example-${lessonSlug(dutch)}.mp3`,
    };
  }

  const curated = curatedWordExamples[word.toLowerCase()];
  if (curated) {
    return {
      dutch: curated.dutch,
      meaning: lt(curated.zh, curated.en),
      audioText: curated.dutch,
      audioSrc: `/audio/placeholders/${plan.id}/word-example-${lessonSlug(curated.dutch)}.mp3`,
    };
  }

  const found = wordLookup.get(word.toLowerCase());
  if (found?.exampleSentence.dutch) {
    return {
      dutch: found.exampleSentence.dutch,
      meaning: found.exampleSentence.meaning,
      audioText: found.exampleSentence.dutch,
      audioSrc: `/audio/placeholders/${plan.id}/word-example-${lessonSlug(found.exampleSentence.dutch)}.mp3`,
    };
  }

  const pattern = plan.targetSentencePatterns[index % Math.max(plan.targetSentencePatterns.length, 1)] ?? `Ik leer ${word}.`;
  const dutch = fillPattern(pattern, plan, index, targetVocabularyForPlan(plan));
  return {
    dutch,
    meaning: sentenceMeaning(dutch, plan),
    audioText: dutch,
    audioSrc: `/audio/placeholders/${plan.id}/word-example-${lessonSlug(dutch)}.mp3`,
  };
};

const generatedTargetWord = (word: string, plan: LessonPlan, index: number): CourseLesson["targetWords"][number] => {
  const found = wordLookup.get(word.toLowerCase());
  const exampleSentence = wordExampleFor(word, plan, index);
  const verbUsage = verbUsageFor(wordAsVerbItem(word, plan));
  const safeFoundMeaning = isGeneratedCategoryMeaning(found?.meaning) ? undefined : found?.meaning;
  const safeFoundMemoryHook = isWeakMemoryHook(found?.memoryHook) ? undefined : found?.memoryHook;
  return {
    ...lessonAudio(plan.id, word, `word-${index + 1}`),
    meaning: curatedWordMeanings[word.toLowerCase()] ?? safeFoundMeaning ?? wordMeaningFallback,
    pronunciationHint: soundHintForWord(word, plan),
    memoryHook:
      curatedMemoryHooks[word.toLowerCase()] ??
      (dutchNumberWords.has(word.toLowerCase())
        ? lt("数字先按 0-20 和整十数分组听，不要一个个孤立背。", "Learn numbers by grouping 0-20 and the tens, not as isolated words.")
        : safeFoundMemoryHook ?? lt(`先和这个句子一起记：${exampleSentence.dutch}`, `First remember it in this sentence: ${exampleSentence.dutch}`)),
    usageNote: verbUsage?.rule,
    baseForm: verbUsage?.infinitive,
    formExamples: verbUsage ? [verbUsage.ikForm, verbUsage.jijForm, verbUsage.wijForm] : undefined,
    exampleSentence,
  };
};

const generatedPattern = (pattern: string, plan: LessonPlan, index: number, vocabulary = targetVocabularyForPlan(plan)): CourseLesson["sentencePatterns"][number] => {
  const examples = [fillPattern(pattern, plan, index, vocabulary), fillPattern(pattern, plan, index + 1, vocabulary)]
    .filter(Boolean)
    .filter((line, lineIndex, lines) => lines.indexOf(line) === lineIndex)
    .slice(0, 2);
  return {
    dutchPattern: pattern,
    explanation: lt(`这是本课输出句型，用来完成：${plan.scenarioOutput.zh}`, `This pattern helps complete: ${plan.scenarioOutput.en}`),
    examples: examples.map((dutch, exampleIndex) => ({
      dutch,
      meaning: sentenceMeaning(dutch, plan),
      audioText: dutch,
      audioSrc: `/audio/placeholders/${plan.id}/pattern-${index + 1}-${exampleIndex + 1}.mp3`,
    })),
    commonMistake: lt("不要只背单词。把词放进这个句型里，整句开口。", "Do not memorize isolated words. Put the word into this pattern and say the full sentence."),
  };
};

const uniqueOptions = (items: string[]) => items.filter((item, index, list) => item.trim() && list.indexOf(item) === index).slice(0, 3);

const practiceOptions = (answer: string, distractors: string[]) => {
  const options = uniqueOptions([answer, ...distractors]);
  return options.length >= 3 ? options : uniqueOptions([answer, ...distractors, "Hallo.", "Tot ziens.", "Ik leer Nederlands."]);
};

const blankSentenceFor = (line: string, vocabulary: string[]) => {
  const candidates = vocabulary
    .filter((word) => !dutchNumberWords.has(word.toLowerCase()))
    .sort((a, b) => b.length - a.length);
  const candidate = candidates.find((word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(line));
  if (candidate) {
    return {
      promptLine: line.replace(new RegExp(`\\b${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "___"),
      answer: candidate,
    };
  }
  return {
    promptLine: line.replace(/\b([A-Za-zÀ-ÿ]+)\b(?=[.!?]?$)/, "___"),
    answer: line.match(/\b([A-Za-zÀ-ÿ]+)\b(?=[.!?]?$)/)?.[1] ?? "",
  };
};

const builderOptionsFor = (line: string) => {
  const parts = line.replace(/[.!?]$/g, "").split(/\s+/);
  return [...parts].sort((a, b) => a.localeCompare(b));
};

const generatedPractice = (
  plan: LessonPlan,
  lessonVocabulary: string[],
  targetWords: CourseLesson["targetWords"],
  repeatLines: string[],
): CourseLesson["practice"] => {
  const firstWord = targetWords[0];
  const answerLine = repeatLines[0] ?? firstWord?.exampleSentence.dutch ?? "Hallo.";
  const repeatPracticeLines = repeatLines.length ? repeatLines : targetWords.map((word) => word.exampleSentence.dutch);
  const practiceWordCandidates = [targetWords[0], targetWords[1], targetWords[5], targetWords[6], targetWords[2], targetWords[3], targetWords[4]]
    .filter((word, index, words): word is CourseLesson["targetWords"][number] => Boolean(word) && words.findIndex((item) => item?.dutch === word?.dutch) === index)
    .slice(0, 4);
  const sentencePracticeLines = repeatPracticeLines.slice(0, 3);

  if (plan.id === "a0-05") {
    return [
      {
        id: `${plan.id}-match`,
        type: "match-word",
        prompt: lt("选择“十二”的荷兰语。", "Choose the Dutch word for twelve."),
        options: ["twaalf", "twintig", "twee"],
        answer: "twaalf",
        audioText: "twaalf",
        audioSrc: `/audio/placeholders/${plan.id}/practice-twaalf.mp3`,
      },
      {
        id: `${plan.id}-choose`,
        type: "choose-correct-phrase",
        prompt: lt("选择“二十”的荷兰语。", "Choose the Dutch word for twenty."),
        options: ["twintig", "twaalf", "dertig"],
        answer: "twintig",
        audioText: "twintig",
        audioSrc: `/audio/placeholders/${plan.id}/practice-twintig.mp3`,
      },
      {
        id: `${plan.id}-fill`,
        type: "fill-blank",
        prompt: lt("补全数字串：nul, een, twee, ___", "Complete the number sequence: nul, een, twee, ___"),
        answer: "drie",
        audioText: "nul, een, twee, drie",
        audioSrc: `/audio/placeholders/${plan.id}/practice-drie.mp3`,
      },
      {
        id: `${plan.id}-build`,
        type: "sentence-builder",
        prompt: lt("把数字顺序拼出来：0 → 1 → 2 → 3", "Build the number sequence: 0 → 1 → 2 → 3"),
        options: ["twee", "nul", "drie", "een"],
        answer: "nul een twee drie",
        audioText: "nul, een, twee, drie",
        audioSrc: `/audio/placeholders/${plan.id}/practice-build.mp3`,
      },
    ];
  }

  const wordPractice = practiceWordCandidates.map((word, index) => ({
    id: `${plan.id}-match-${index + 1}`,
    type: "match-word" as const,
    prompt: lt(`选择“${word.meaning.zh}”的荷兰语。`, `Choose the Dutch word for "${word.meaning.en}".`),
    options: practiceOptions(
      word.dutch,
      practiceWordCandidates
        .filter((item) => item.dutch !== word.dutch)
        .map((item) => item.dutch),
    ),
    answer: word.dutch,
    audioText: word.dutch,
    audioSrc: `/audio/placeholders/${plan.id}/practice-match-${index + 1}.mp3`,
  }));

  const sentencePractice = sentencePracticeLines.slice(0, 2).map((line, index) => {
    const meaning = sentenceMeaning(line, plan);
    return {
      id: `${plan.id}-choose-${index + 1}`,
      type: "choose-correct-phrase" as const,
      prompt: lt(`选择荷兰语：${meaning.zh}`, `Choose the Dutch sentence: ${meaning.en}`),
      options: practiceOptions(
        line,
        sentencePracticeLines.filter((item) => item !== line),
      ),
      answer: line,
      audioText: line,
      audioSrc: `/audio/placeholders/${plan.id}/practice-choose-${index + 1}.mp3`,
    };
  });

  const fillPractice = sentencePracticeLines.slice(0, 2).map((line, index) => {
    const blank = blankSentenceFor(line, lessonVocabulary);
    return {
      id: `${plan.id}-fill-${index + 1}`,
      type: "fill-blank" as const,
      prompt: lt(`补全句子：${blank.promptLine}`, `Complete the sentence: ${blank.promptLine}`),
      answer: blank.answer,
      audioText: line,
      audioSrc: `/audio/placeholders/${plan.id}/practice-fill-${index + 1}.mp3`,
    };
  });

  return [
    ...wordPractice,
    ...sentencePractice,
    ...fillPractice,
    {
      id: `${plan.id}-build`,
      type: "sentence-builder",
      prompt: lt(
        `把词块拼成一句完整荷兰语：${sentenceMeaning(repeatPracticeLines[0] ?? answerLine, plan).zh}`,
        `Build a full Dutch sentence: ${sentenceMeaning(repeatPracticeLines[0] ?? answerLine, plan).en}`,
      ),
      options: builderOptionsFor(repeatPracticeLines[0] ?? answerLine),
      answer: repeatPracticeLines[0] ?? answerLine,
      audioText: repeatPracticeLines[0] ?? answerLine,
      audioSrc: `/audio/placeholders/${plan.id}/practice-build.mp3`,
    },
  ];
};

const cleanSoundExample = (value: string) =>
  value
    .replace(/["“”]/g, "")
    .replace(/\(.+\)/g, "")
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-ZÀ-ÿ-]/g, "");

const exampleWordForPronunciationFocus = (focus: string, plan: LessonPlan, index: number) => {
  const lowerFocus = focus.toLowerCase();
  const inMatch = lowerFocus.match(/\bin\s+([a-zà-ÿ-]+)/i);
  if (inMatch?.[1]) return cleanSoundExample(inMatch[1]);

  if (focus.includes("/")) {
    const firstPart = cleanSoundExample(focus.split("/")[0]);
    if (firstPart) return firstPart;
  }

  const fromVocabulary = plan.targetVocabulary.find((word) => {
    const lowerWord = word.toLowerCase();
    const tokens = lowerFocus.split(/[^a-zà-ÿ]+/).filter((token) => token.length >= 2);
    return tokens.some((token) => lowerWord.includes(token));
  });
  return fromVocabulary ?? plan.targetVocabulary[index] ?? plan.targetVocabulary[0] ?? focus;
};

const soundHintText = (focus: string, exampleWord: string) =>
  lt(
    `本课练「${focus}」。先听例词 ${exampleWord}，再放回本课句子里跟读。`,
    `Practice "${focus}" in this lesson. First listen to ${exampleWord}, then repeat it inside the lesson sentences.`,
  );

const lessonPurposeForPlan = (plan: LessonPlan): LocalizedText => {
  const specialPurpose: Record<string, LocalizedText> = {
    "a0-04": lt(
      "这一课不是背语言名词，而是让你能说明自己会不会说某种语言。先把“会说一点 / 不会说”这种真实开口需求搞清楚。",
      "This lesson is not about memorizing language names only. It helps you say whether you speak a language or not, especially basic speaking ability.",
    ),
    "a0-05": lt(
      "数字课比较特殊：目标是先听懂、读准、认得 0-20 和整十数。后面再把数字放进年龄、号码、价格里用。",
      "This numbers lesson is special: first recognize and pronounce 0-20 and the tens. Later you will use them for age, phone numbers, and prices.",
    ),
    "a0-08": lt(
      "这一课解决最基础的需求表达：想要什么、需要什么、能不能做。先把需求说清楚，不急着讲复杂语法。",
      "This lesson handles basic needs: what you want, what you need, and what you can or cannot do. Say the need clearly first; grammar detail comes later.",
    ),
    "a0-09": lt(
      "这一课是对话里的安全按钮：听不懂时不要卡住，要能礼貌地请求重复、放慢，或者说明自己没听懂。",
      "This lesson is a safety button in conversation: when you do not understand, ask politely for repetition, slower speech, or explain that you did not understand.",
    ),
    "a0-11": lt(
      "这一课是发音整合课：把前面见过的特殊音放回高频词里复习，训练看到新词时先拆声音块。",
      "This is a sound integration lesson: review key Dutch sound chunks inside common words and learn to decode before memorizing.",
    ),
  };

  if (specialPurpose[plan.id]) return specialPurpose[plan.id];

  return lt(
    `这一课解决一个真实小场景：${plan.scenarioOutput.zh}。先知道用途，再按发音、单词、句型、跟读一步步学。`,
    `This lesson handles one practical mini-scenario: ${plan.scenarioOutput.en}. First understand the purpose, then move through sounds, words, patterns, and repeat practice.`,
  );
};

const generatedCourseLessonFromPlan = (plan: LessonPlan): CourseLesson => {
  const lessonVocabulary = targetVocabularyForPlan(plan);
  const targetWords = lessonVocabulary.slice(0, targetWordLimitForPlan(plan)).map((word, index) => generatedTargetWord(word, plan, index));
  const sentencePatterns = plan.targetSentencePatterns.slice(0, 4).map((pattern, index) => generatedPattern(pattern, plan, index, lessonVocabulary));
  const repeatLines = [
    ...sentencePatterns.flatMap((pattern) => pattern.examples.map((example) => example.dutch)),
    ...targetWords.slice(0, 4).map((word) => word.exampleSentence.dutch),
  ].filter((line, index, lines) => lines.indexOf(line) === index).slice(0, 7);
  const dialogueLines = repeatLines.slice(0, 4);

  return {
    id: plan.id,
    lessonPlanId: plan.id,
    level: plan.level,
    order: plan.order,
    title: plan.title,
    methodMap: {
      decode: plan.methodTargets.decode,
      link: plan.methodTargets.link,
      rule: plan.methodTargets.rule,
      speak: plan.methodTargets.speak,
    },
    lessonGoal: {
      goal: plan.learningGoal,
      estimatedMinutes: plan.estimatedTimeMinutes,
      purpose: lessonPurposeForPlan(plan),
      canSayAfter: plan.speakingOutput,
    },
    soundBase: {
      pronunciationHints: (plan.pronunciationFocus.length ? plan.pronunciationFocus : ["sentence rhythm"]).slice(0, 4).map((focus, index) => {
          const word = exampleWordForPronunciationFocus(focus, { ...plan, targetVocabulary: lessonVocabulary }, index);
        return {
          ...lessonAudio(plan.id, word, `sound-${index + 1}`),
          sound: focus,
          hint: soundHintText(focus, word),
        };
      }),
    },
    targetWords,
    sentencePatterns,
    miniGrammar: {
      title: lt(plan.targetGrammarPoints[0] ?? "本课小规则", plan.targetGrammarPoints[0] ?? "Tiny rule"),
      explanation: lt(`本课只抓一个核心：${plan.targetGrammarPoints.slice(0, 3).join(" / ")}。先会用，再慢慢补术语。`, `Focus on: ${plan.targetGrammarPoints.slice(0, 3).join(" / ")}. Use it first; terminology can come later.`),
      pattern: plan.targetSentencePatterns[0] ?? repeatLines[0] ?? plan.title.en,
      examples: repeatLines.slice(0, 3).map((line, index) => lessonAudio(plan.id, line, `grammar-${index + 1}`)),
    },
    listenAndRepeat: repeatLines.map((line, index) => lessonAudio(plan.id, line, `repeat-${index + 1}`)),
    microDialogue: dialogueLines.map((line, index) => ({
      speaker: index % 2 === 0 ? "A" : "B",
      ...lessonAudio(plan.id, line, `dialogue-${index + 1}`),
      meaning: sentenceMeaning(line, plan),
    })),
    practice: generatedPractice(plan, lessonVocabulary, targetWords, repeatLines),
    speakOutput: {
      task: plan.speakingOutput,
      sampleAnswer: {
        dutch: repeatLines.slice(0, 3).join(" "),
        meaning: lt(`示范输出：${plan.speakingOutput.zh}`, `Sample output: ${plan.speakingOutput.en}`),
        audioText: repeatLines.slice(0, 3).join(" "),
        audioSrc: `/audio/placeholders/${plan.id}/output.mp3`,
      },
    },
    writingTask: plan.writingOutput,
    review: {
      words: lessonVocabulary.slice(0, 3),
      sentencePatterns: plan.targetSentencePatterns.slice(0, 2),
      tinyOutput: plan.speakingOutput,
    },
  };
};

const generatedCourseLessons = lessonPlans
  .filter((plan) => ["A0", "A1", "A2", "B1"].includes(plan.level) && !handcraftedCourseLessons.some((lesson) => lesson.id === plan.id))
  .map(generatedCourseLessonFromPlan);

const orderedCourseLessons = [...handcraftedCourseLessons, ...generatedCourseLessons].sort((a, b) => levelRank[a.level] - levelRank[b.level] || a.order - b.order);

export const courseLessons: CourseLesson[] = orderedCourseLessons.map((lesson, index, lessons) => ({
  ...lesson,
  previousLessonId: lessons[index - 1]?.id,
  nextLessonId: lessons[index + 1]?.id,
}));

export const firstCourseLessonId = "a0-01";

export const getCourseLesson = (id: string) => courseLessons.find((lesson) => lesson.id === id);
