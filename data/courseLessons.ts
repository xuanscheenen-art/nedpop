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
  const standaloneNumber = plan.id === "a0-05" ? dutch.replace(/[.!?]+$/g, "").toLowerCase() : "";
  if (standaloneNumber && curatedWordMeanings[standaloneNumber]) return curatedWordMeanings[standaloneNumber];
  const curated = Object.values(curatedA0LessonExamples)
    .flatMap((lesson) => [...Object.values(lesson.patterns).flat(), ...Object.values(lesson.words)])
    .concat(Object.values(curatedA1LessonExamples).flatMap((lesson) => [...Object.values(lesson.patterns ?? {}).flat(), ...Object.values(lesson.words ?? {})]))
    .concat(Object.values(curatedA2LessonExamples).flatMap((lesson) => [...Object.values(lesson.patterns ?? {}).flat(), ...Object.values(lesson.words ?? {})]))
    .concat(Object.values(curatedB1LessonExamples).flatMap((lesson) => [...Object.values(lesson.patterns ?? {}).flat(), ...Object.values(lesson.words ?? {})]))
    .find((example) => example.dutch.toLowerCase() === dutch.toLowerCase());
  if (curated) return lt(curated.zh, curated.en);
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

// These lessons are generated from plans, but their learner-facing examples are
// hand-curated: a generic vocabulary substitution can otherwise produce lines
// such as “Hallo, ik heet Nederlands” or fragments like “goed boek”.
const curatedA0LessonExamples: Record<number, {
  patterns: Record<string, Array<{ dutch: string; zh: string; en: string }>>;
  words: Record<string, { dutch: string; zh: string; en: string }>;
}> = {
  6: {
    patterns: {
      "Dit is ...": [{ dutch: "Dit is een boek.", zh: "这是一本书。", en: "This is a book." }],
      "Dat is ...": [{ dutch: "Dat is mijn tas.", zh: "那是我的包。", en: "That is my bag." }],
      "Dat is een ...": [{ dutch: "Dat is een tas.", zh: "那是一个包。", en: "That is a bag." }],
      "Wat is dat?": [{ dutch: "Wat is dat?", zh: "那是什么？", en: "What is that?" }],
    },
    words: {
      dit: { dutch: "Dit is mijn boek.", zh: "这是我的书。", en: "This is my book." },
      dat: { dutch: "Dat is mijn tas.", zh: "那是我的包。", en: "That is my bag." },
      is: { dutch: "Dit is een pen.", zh: "这是一支笔。", en: "This is a pen." },
      het: { dutch: "Ik begrijp het.", zh: "我明白了。", en: "I understand." },
      wat: { dutch: "Wat is dat?", zh: "那是什么？", en: "What is that?" },
      boek: { dutch: "Dit is een boek.", zh: "这是一本书。", en: "This is a book." },
      pen: { dutch: "Ik schrijf met een pen.", zh: "我用笔写字。", en: "I write with a pen." },
      tas: { dutch: "Mijn tas is zwart.", zh: "我的包是黑色的。", en: "My bag is black." },
      huis: { dutch: "Ik woon in een klein huis.", zh: "我住在一栋小房子里。", en: "I live in a small house." },
      water: { dutch: "Mag ik wat water?", zh: "可以给我一点水吗？", en: "May I have some water?" },
    },
  },
  7: {
    patterns: {
      "Ik heb ...": [{ dutch: "Ik heb een fiets.", zh: "我有一辆自行车。", en: "I have a bike." }],
      "Ik heb geen ...": [{ dutch: "Ik heb geen geld bij me.", zh: "我身上没带钱。", en: "I don't have any money with me." }],
      "Heb jij ...?": [{ dutch: "Heb jij een telefoon?", zh: "你有手机吗？", en: "Do you have a phone?" }],
      "Ja, ik heb ...": [{ dutch: "Ja, ik heb een telefoon.", zh: "有，我有一部手机。", en: "Yes, I have a phone." }],
    },
    words: {
      heb: { dutch: "Ik heb een vraag.", zh: "我有一个问题。", en: "I have a question." },
      hebben: { dutch: "Wij hebben een huis.", zh: "我们有一栋房子。", en: "We have a house." },
      geen: { dutch: "Ik heb geen tijd.", zh: "我没时间。", en: "I don't have time." },
      wel: { dutch: "Ik heb wel een fiets.", zh: "我确实有一辆自行车。", en: "I do have a bike." },
      telefoon: { dutch: "Mijn telefoon ligt op tafel.", zh: "我的手机在桌上。", en: "My phone is on the table." },
      fiets: { dutch: "Ik heb een nieuwe fiets.", zh: "我有一辆新自行车。", en: "I have a new bike." },
      kaart: { dutch: "Heb je een kaart?", zh: "你有地图或卡片吗？", en: "Do you have a map or card?" },
      geld: { dutch: "Ik heb geen geld bij me.", zh: "我身上没带钱。", en: "I don't have any money with me." },
      vraag: { dutch: "Ik heb een vraag.", zh: "我有一个问题。", en: "I have a question." },
      probleem: { dutch: "Er is een probleem met de fiets.", zh: "自行车出了点问题。", en: "There's a problem with the bike." },
    },
  },
  8: {
    patterns: {
      "Ik wil ...": [{ dutch: "Ik wil graag een kopje koffie.", zh: "我想要一杯咖啡。", en: "I'd like a cup of coffee." }],
      "Ik heb ... nodig.": [{ dutch: "Ik heb hulp nodig.", zh: "我需要帮助。", en: "I need help." }],
      "Ik kan ...": [{ dutch: "Ik kan u helpen.", zh: "我可以帮您。", en: "I can help you." }],
      "Ik kan niet ...": [{ dutch: "Ik kan vandaag niet komen.", zh: "我今天不能来。", en: "I can't come today." }],
    },
    words: {
      wil: { dutch: "Ik wil graag wat water.", zh: "我想要一点水。", en: "I'd like some water." },
      kan: { dutch: "Ik kan u helpen.", zh: "我可以帮您。", en: "I can help you." },
      nodig: { dutch: "Ik heb een pen nodig.", zh: "我需要一支笔。", en: "I need a pen." },
      water: { dutch: "Mag ik wat water?", zh: "可以给我一点水吗？", en: "May I have some water?" },
      helpen: { dutch: "Kunt u mij helpen?", zh: "您能帮帮我吗？", en: "Could you help me?" },
      boek: { dutch: "Ik wil een boek.", zh: "我想要一本书。", en: "I want a book." },
      pen: { dutch: "Ik heb een pen nodig.", zh: "我需要一支笔。", en: "I need a pen." },
      langzaam: { dutch: "Kunt u langzamer spreken?", zh: "您能说慢一点吗？", en: "Could you speak more slowly?" },
      makkelijk: { dutch: "Deze oefening is makkelijk.", zh: "这道练习很简单。", en: "This exercise is easy." },
      moeilijk: { dutch: "Dit woord is moeilijk.", zh: "这个词很难。", en: "This word is difficult." },
    },
  },
  9: {
    patterns: {
      "Ik begrijp het niet.": [{ dutch: "Ik begrijp het niet.", zh: "我听不懂。", en: "I don't understand." }],
      "Kunt u dat herhalen?": [{ dutch: "Kunt u dat herhalen?", zh: "您能重复一遍吗？", en: "Could you repeat that?" }],
      "Langzaam, alstublieft.": [{ dutch: "Kunt u wat langzamer spreken, alstublieft?", zh: "您能说慢一点吗？", en: "Could you speak a little more slowly, please?" }],
      "Nog een keer, alstublieft.": [{ dutch: "Kunt u dat nog een keer zeggen?", zh: "您能再说一遍吗？", en: "Could you say that one more time?" }],
    },
    words: {
      begrijp: { dutch: "Ik begrijp het niet.", zh: "我听不懂。", en: "I don't understand." },
      begrijpen: { dutch: "Ik begrijp het niet.", zh: "我听不懂。", en: "I don't understand." },
      niet: { dutch: "Ik begrijp het niet.", zh: "我听不懂。", en: "I don't understand." },
      herhaal: { dutch: "Kunt u dat herhalen?", zh: "您能重复一遍吗？", en: "Could you repeat that?" },
      langzaam: { dutch: "Kunt u wat langzamer spreken?", zh: "您能说慢一点吗？", en: "Could you speak a little more slowly?" },
      alstublieft: { dutch: "Kunt u dat herhalen, alstublieft?", zh: "您能重复一遍吗？", en: "Could you repeat that, please?" },
      sorry: { dutch: "Sorry, ik begrijp het niet.", zh: "不好意思，我没听懂。", en: "Sorry, I don't understand." },
      helpen: { dutch: "Kunt u mij helpen?", zh: "您能帮帮我吗？", en: "Could you help me?" },
      "kunt u": { dutch: "Kunt u dat herhalen?", zh: "您能重复一遍吗？", en: "Could you repeat that?" },
      "nog een keer": { dutch: "Kunt u dat nog een keer zeggen?", zh: "您能再说一遍吗？", en: "Could you say that one more time?" },
      zeggen: { dutch: "Kunt u dat nog een keer zeggen?", zh: "您能再说一遍吗？", en: "Could you say that one more time?" },
    },
  },
  10: {
    patterns: {
      "Vandaag is ...": [{ dutch: "Vandaag is het maandag.", zh: "今天是星期一。", en: "Today is Monday." }],
      "Het is ... uur.": [{ dutch: "Het is drie uur.", zh: "现在三点。", en: "It is three o'clock." }],
      "Ik kom morgen.": [{ dutch: "Ik kom morgen.", zh: "我明天来。", en: "I'll come tomorrow." }],
      "Tot morgen.": [{ dutch: "Tot morgen.", zh: "明天见。", en: "See you tomorrow." }],
    },
    words: {
      vandaag: { dutch: "Vandaag werk ik thuis.", zh: "我今天在家工作。", en: "I'm working from home today." },
      morgen: { dutch: "Ik kom morgen terug.", zh: "我明天回来。", en: "I'll come back tomorrow." },
      maandag: { dutch: "De afspraak is op maandag.", zh: "约在星期一。", en: "The appointment is on Monday." },
      vrijdag: { dutch: "Ik werk op vrijdag.", zh: "我星期五工作。", en: "I work on Fridays." },
      uur: { dutch: "Het is drie uur.", zh: "现在三点。", en: "It is three o'clock." },
      tijd: { dutch: "Heb je vandaag tijd?", zh: "你今天有时间吗？", en: "Do you have time today?" },
      nu: { dutch: "Ik vertrek nu.", zh: "我现在出发。", en: "I'm leaving now." },
      later: { dutch: "Ik bel je later.", zh: "我晚点给你打电话。", en: "I'll call you later." },
      vroeg: { dutch: "Ik sta vroeg op.", zh: "我很早起床。", en: "I get up early." },
      laat: { dutch: "De bus is laat.", zh: "公交车晚点了。", en: "The bus is late." },
    },
  },
  11: {
    patterns: {
      "goed boek": [{ dutch: "Dit is een goed boek.", zh: "这是一本好书。", en: "This is a good book." }],
      "leuk huis": [{ dutch: "Wat een leuk huis!", zh: "这房子真不错！", en: "What a lovely house!" }],
      "Ik kijk.": [{ dutch: "Ik kijk naar de trein.", zh: "我看着火车。", en: "I'm looking at the train." }],
      "Ik ben blij.": [{ dutch: "Ik ben blij met mijn nieuwe fiets.", zh: "我很喜欢我的新自行车。", en: "I'm happy with my new bike." }],
    },
    words: {
      goed: { dutch: "Het gaat goed.", zh: "一切顺利。", en: "Things are going well." },
      boek: { dutch: "Ik lees een goed boek.", zh: "我在读一本好书。", en: "I'm reading a good book." },
      huis: { dutch: "Het huis is groot.", zh: "这栋房子很大。", en: "The house is big." },
      uit: { dutch: "Ik stap bij het station uit.", zh: "我在车站下车。", en: "I get off at the station." },
      leuk: { dutch: "Dat lijkt me leuk.", zh: "我觉得那会很有趣。", en: "That sounds fun to me." },
      deur: { dutch: "De deur is open.", zh: "门开着。", en: "The door is open." },
      trein: { dutch: "De trein komt eraan.", zh: "火车就要进站了。", en: "The train is arriving." },
      ijs: { dutch: "Ik neem een ijsje.", zh: "我要一个冰淇淋。", en: "I'll have an ice cream." },
      kijk: { dutch: "Kijk, daar komt de trein.", zh: "看，火车来了。", en: "Look, there comes the train." },
      kijken: { dutch: "Ik kijk naar de trein.", zh: "我看着火车。", en: "I'm looking at the train." },
      blij: { dutch: "Ik ben blij.", zh: "我很高兴。", en: "I'm happy." },
    },
  },
  12: {
    patterns: {
      "Hallo, ik heet ...": [{ dutch: "Hallo, ik heet Lin.", zh: "你好，我叫 Lin。", en: "Hi, my name is Lin." }],
      "Ik kom uit ...": [{ dutch: "Ik kom uit China.", zh: "我来自中国。", en: "I'm from China." }, { dutch: "Ik kom uit Nederland.", zh: "我来自荷兰。", en: "I'm from the Netherlands." }],
      "Ik woon in ...": [{ dutch: "Ik woon in Leiden.", zh: "我住在 Leiden。", en: "I live in Leiden." }, { dutch: "Ik woon in Delft.", zh: "我住在 Delft。", en: "I live in Delft." }],
      "Ik spreek een beetje Nederlands.": [{ dutch: "Ik spreek een beetje Nederlands.", zh: "我会说一点荷兰语。", en: "I speak a little Dutch." }],
    },
    words: {
      hallo: { dutch: "Hallo, ik heet Lin.", zh: "你好，我叫 Lin。", en: "Hi, my name is Lin." },
      ik: { dutch: "Ik woon in Leiden.", zh: "我住在 Leiden。", en: "I live in Leiden." },
      heet: { dutch: "Ik heet Lin.", zh: "我叫 Lin。", en: "My name is Lin." },
      "kom uit": { dutch: "Ik kom uit China.", zh: "我来自中国。", en: "I'm from China." },
      "woon in": { dutch: "Ik woon in Leiden.", zh: "我住在 Leiden。", en: "I live in Leiden." },
      spreken: { dutch: "Ik spreek een beetje Nederlands.", zh: "我会说一点荷兰语。", en: "I speak a little Dutch." },
      "een beetje": { dutch: "Ik spreek een beetje Nederlands.", zh: "我会说一点荷兰语。", en: "I speak a little Dutch." },
      nederlands: { dutch: "Ik spreek Nederlands.", zh: "我说荷兰语。", en: "I speak Dutch." },
      "dank je": { dutch: "Dank je voor je hulp.", zh: "谢谢你的帮助。", en: "Thank you for your help." },
      "tot ziens": { dutch: "Tot ziens, fijne dag!", zh: "再见，祝你今天愉快！", en: "Goodbye, have a nice day!" },
    },
  },
};

const curatedA1LessonExamples: Record<number, {
  patterns: Record<string, Array<{ dutch: string; zh: string; en: string }>>;
  words: Record<string, { dutch: string; zh: string; en: string }>;
}> = {
  1: {
    patterns: {
      "Mijn adres is ...": [{ dutch: "Mijn adres is Langestraat 12.", zh: "我的地址是 Langestraat 12 号。", en: "My address is 12 Langestraat." }],
      "Mijn telefoonnummer is ...": [{ dutch: "Mijn telefoonnummer is 06-12345678.", zh: "我的电话号码是 06-12345678。", en: "My phone number is 06-12345678." }],
      "Ik ben ... jaar.": [{ dutch: "Ik ben vijfentwintig jaar.", zh: "我二十五岁。", en: "I am twenty-five years old." }],
      "Mijn e-mail is ...": [{ dutch: "Mijn e-mailadres is lin@example.nl.", zh: "我的电子邮箱是 lin@example.nl。", en: "My email address is lin@example.nl." }],
    },
    words: {
      nemen: { dutch: "Ik neem een pak melk.", zh: "我要一盒牛奶。", en: "I'll take a carton of milk." },
      zoeken: { dutch: "Ik zoek brood.", zh: "我在找面包。", en: "I'm looking for bread." },
    },
  },
  2: {
    patterns: {
      "Vandaag is ...": [{ dutch: "Vandaag is het maandag.", zh: "今天是星期一。", en: "Today is Monday." }],
      "De afspraak is op ...": [{ dutch: "De afspraak is op vrijdag.", zh: "约在星期五。", en: "The appointment is on Friday." }],
    },
    words: {},
  },
  3: {
    patterns: {
      "Ik heb een broer.": [{ dutch: "Ik heb een broer.", zh: "我有一个兄弟。", en: "I have a brother." }],
      "Dit is mijn moeder.": [{ dutch: "Dit is mijn moeder.", zh: "这是我妈妈。", en: "This is my mother." }],
      "Mijn familie woont in ...": [{ dutch: "Mijn familie woont in Nederland.", zh: "我的家人住在荷兰。", en: "My family lives in the Netherlands." }],
    },
    words: {
      broer: { dutch: "Ik heb een broer.", zh: "我有一个兄弟。", en: "I have a brother." },
    },
  },
  4: {
    patterns: {},
    words: {
      bed: { dutch: "Ik slaap in mijn bed.", zh: "我在自己的床上睡觉。", en: "I sleep in my bed." },
      kamer: { dutch: "Mijn kamer heeft een raam.", zh: "我的房间有一扇窗户。", en: "My room has a window." },
      huis: { dutch: "Ik woon in een huis.", zh: "我住在一栋房子里。", en: "I live in a house." },
    },
  },
  7: {
    patterns: {
      "Ik neem de trein.": [{ dutch: "Ik neem de trein.", zh: "我坐火车。", en: "I take the train." }],
      "De trein vertrekt van spoor twee.": [{ dutch: "De trein vertrekt van spoor twee.", zh: "火车从 2 号轨道发车。", en: "The train leaves from track 2." }],
    },
    words: {
      auto: { dutch: "Ik ga met de auto naar mijn werk.", zh: "我开车去上班。", en: "I go to work by car." },
      trein: { dutch: "Mijn trein heeft vertraging.", zh: "我的火车晚点了。", en: "My train is delayed." },
    },
  },
  8: {
    patterns: {
      "Het is koud.": [{ dutch: "Het is koud.", zh: "天气很冷。", en: "It is cold." }],
      "Het regent vandaag.": [{ dutch: "Het regent vandaag.", zh: "今天下雨。", en: "It's raining today." }],
      "Ik heb een jas aan.": [{ dutch: "Ik heb een jas aan.", zh: "我穿着一件外套。", en: "I'm wearing a coat." }],
      "Mijn trui is blauw.": [{ dutch: "Mijn trui is blauw.", zh: "我的毛衣是蓝色的。", en: "My sweater is blue." }],
    },
    words: {
      regen: { dutch: "Het regent vandaag.", zh: "今天下雨。", en: "It's raining today." },
    },
  },
  13: {
    patterns: {
      "Ik vind ... leuk.": [{ dutch: "Ik vind fietsen leuk.", zh: "我喜欢骑自行车。", en: "I like cycling." }],
      "Ik vind ... niet leuk.": [{ dutch: "Ik vind regen niet leuk.", zh: "我不喜欢下雨。", en: "I don't like rain." }],
      "Ik wil liever ...": [{ dutch: "Ik wil liever thee.", zh: "我更想要茶。", en: "I'd rather have tea." }],
      "Wil je ... of ...?": [{ dutch: "Wil je koffie of thee?", zh: "你想要咖啡还是茶？", en: "Would you like coffee or tea?" }],
    },
    words: {
      liever: { dutch: "Ik wil liever thee.", zh: "我更想要茶。", en: "I'd rather have tea." },
      vinden: { dutch: "Ik vind fietsen leuk.", zh: "我喜欢骑自行车。", en: "I like cycling." },
    },
  },
  14: {
    patterns: {
      "Kan ik om ... komen?": [{ dutch: "Kan ik om drie uur komen?", zh: "我可以三点来吗？", en: "Can I come at three?" }],
      "Ik kan om drie uur.": [{ dutch: "Ik kan om drie uur komen.", zh: "我三点可以来。", en: "I can come at three." }],
      "Wanneer kan ik komen?": [{ dutch: "Wanneer kan ik komen?", zh: "我什么时候可以来？", en: "When can I come?" }],
      "Ik bel later.": [{ dutch: "Ik bel later.", zh: "我晚点打电话。", en: "I'll call later." }],
    },
    words: {},
  },
  15: {
    patterns: {
      "Hoeveel kost dit?": [{ dutch: "Hoeveel kost dit?", zh: "这个多少钱？", en: "How much does this cost?" }],
      "Ik wil twee kilo ...": [{ dutch: "Ik wil twee kilo appels.", zh: "我想要两公斤苹果。", en: "I'd like two kilos of apples." }],
      "Kan ik pinnen?": [{ dutch: "Kan ik pinnen?", zh: "我可以刷卡吗？", en: "Can I pay by debit card?" }],
      "Mag ik de bon?": [{ dutch: "Mag ik de bon?", zh: "可以给我小票吗？", en: "May I have the receipt?" }],
    },
    words: {
      bon: { dutch: "Mag ik de bon?", zh: "可以给我小票吗？", en: "May I have the receipt?" },
    },
  },
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

// A2 examples are kept separate from the generic pattern filler: arbitrary
// substitutions (such as "water" in a form field) produce unusable Dutch.
const curatedA2LessonExamples: Record<number, {
  patterns: Record<string, Array<{ dutch: string; zh: string; en: string }>>;
  words: Record<string, { dutch: string; zh: string; en: string }>;
}> = {
  1: { patterns: {
    "Ik lees eerst de vraag.": [{ dutch: "Ik lees eerst de vraag.", zh: "我先读题目。", en: "I read the question first." }],
    "Ik luister naar de informatie.": [{ dutch: "Ik luister naar de informatie.", zh: "我听相关信息。", en: "I listen to the information." }],
    "Ik schrijf een kort antwoord.": [{ dutch: "Ik schrijf een kort antwoord.", zh: "我写一个简短的答案。", en: "I write a short answer." }],
  }, words: {} },
  2: { patterns: {
    "Mijn geboortedatum is ...": [{ dutch: "Mijn geboortedatum is 12 mei 1998.", zh: "我的出生日期是 1998 年 5 月 12 日。", en: "My date of birth is 12 May 1998." }],
    "Hier staat mijn adres.": [{ dutch: "Hier staat mijn adres.", zh: "我的地址写在这里。", en: "My address is written here." }],
    "Waar moet ik mijn handtekening zetten?": [{ dutch: "Waar moet ik mijn handtekening zetten?", zh: "我应该在哪里签名？", en: "Where should I sign?" }],
  }, words: { geboortedatum: { dutch: "Mijn geboortedatum is 12 mei 1998.", zh: "我的出生日期是 1998 年 5 月 12 日。", en: "My date of birth is 12 May 1998." }, geboorteplaats: { dutch: "Mijn geboorteplaats is Utrecht.", zh: "我的出生地是乌得勒支。", en: "My place of birth is Utrecht." }, handtekening: { dutch: "Waar moet ik mijn handtekening zetten?", zh: "我应该在哪里签名？", en: "Where should I sign?" } } },
  3: { patterns: {
    "Ik heb een brief ontvangen.": [{ dutch: "Ik heb een brief ontvangen.", zh: "我收到了一封信。", en: "I received a letter." }],
    "De afspraak is op ...": [{ dutch: "De afspraak is op maandag om tien uur.", zh: "预约在星期一上午十点。", en: "The appointment is on Monday at ten o'clock." }],
    "Ik moet een kopie meenemen.": [{ dutch: "Ik moet een kopie meenemen.", zh: "我必须带一份复印件。", en: "I have to bring a copy." }],
  }, words: { brief: { dutch: "Ik heb een brief ontvangen.", zh: "我收到了一封信。", en: "I received a letter." }, bijlage: { dutch: "De brief heeft een bijlage.", zh: "这封信有一个附件。", en: "The letter has an attachment." } } },
  4: { patterns: {
    "Kunt u dat herhalen?": [{ dutch: "Kunt u dat herhalen?", zh: "您能重复一遍吗？", en: "Could you repeat that?" }],
    "Ik hoor de datum en de tijd.": [{ dutch: "Ik hoor de datum en de tijd.", zh: "我听到了日期和时间。", en: "I hear the date and time." }],
    "Het bericht zegt dat ...": [{ dutch: "Het bericht zegt dat de afspraak morgen niet doorgaat.", zh: "留言说，明天的预约取消了。", en: "The message says that tomorrow's appointment is cancelled." }],
  }, words: { vertraging: { dutch: "De trein heeft twintig minuten vertraging.", zh: "火车晚点二十分钟。", en: "The train is delayed by twenty minutes." }, herhalen: { dutch: "Kunt u de datum herhalen?", zh: "您能重复一下日期吗？", en: "Could you repeat the date?" } } },
  5: { patterns: {
    "Ik wil graag een afspraak maken.": [{ dutch: "Ik wil graag een afspraak maken.", zh: "我想预约。", en: "I would like to make an appointment." }],
    "Ik wil mijn afspraak verzetten.": [{ dutch: "Ik wil mijn afspraak verzetten.", zh: "我想改一下预约时间。", en: "I would like to reschedule my appointment." }],
    "Dat tijdstip schikt mij niet.": [{ dutch: "Dat tijdstip schikt mij niet.", zh: "那个时间我不方便。", en: "That time does not suit me." }],
  }, words: { verzetten: { dutch: "Ik wil mijn afspraak verzetten.", zh: "我想改一下预约时间。", en: "I would like to reschedule my appointment." }, beschikbaar: { dutch: "Bent u morgenmiddag beschikbaar?", zh: "您明天下午有空吗？", en: "Are you available tomorrow afternoon?" } } },
  6: { patterns: {
    "Ik bel voor een afspraak met de huisarts.": [{ dutch: "Ik bel voor een afspraak met de huisarts.", zh: "我打电话来预约家庭医生。", en: "I am calling to make an appointment with the GP." }],
    "Ik heb sinds gisteren hoofdpijn.": [{ dutch: "Ik heb sinds gisteren hoofdpijn.", zh: "我从昨天开始头疼。", en: "I have had a headache since yesterday." }],
    "Wanneer kan ik langskomen?": [{ dutch: "Wanneer kan ik langskomen?", zh: "我什么时候可以过去？", en: "When can I come in?" }],
  }, words: { assistente: { dutch: "De assistente neemt de telefoon op.", zh: "助理接起了电话。", en: "The assistant answers the phone." }, spreekuur: { dutch: "Het spreekuur begint om negen uur.", zh: "门诊时间九点开始。", en: "The consultation hours start at nine." }, sinds: { dutch: "Ik ben sinds maandag verkouden.", zh: "我从星期一开始感冒。", en: "I have had a cold since Monday." } } },
  7: { patterns: {
    "Hoe moet ik dit medicijn gebruiken?": [{ dutch: "Hoe moet ik dit medicijn gebruiken?", zh: "这种药应该怎么用？", en: "How should I use this medicine?" }],
    "Ik heb een recept nodig.": [{ dutch: "Ik heb een recept nodig.", zh: "我需要一张处方。", en: "I need a prescription." }],
    "Moet ik dit voor of na het eten innemen?": [{ dutch: "Moet ik dit voor of na het eten innemen?", zh: "这个药应该饭前还是饭后服用？", en: "Should I take this before or after eating?" }],
  }, words: { dosering: { dutch: "Op de verpakking staat de dosering.", zh: "包装上写着用量。", en: "The dosage is written on the packaging." }, bijsluiter: { dutch: "Lees de bijsluiter voordat u dit medicijn gebruikt.", zh: "使用这种药前请阅读说明书。", en: "Read the leaflet before using this medicine." }, verzekering: { dutch: "Vergoedt mijn verzekering dit medicijn?", zh: "我的保险会报销这种药吗？", en: "Does my insurance cover this medicine?" } } },
  8: { patterns: {
    "Ik heb een afspraak bij de gemeente.": [{ dutch: "Ik heb een afspraak bij de gemeente.", zh: "我和市政厅有预约。", en: "I have an appointment at the municipality." }],
    "Ik wil mij op mijn nieuwe adres inschrijven.": [{ dutch: "Ik wil mij op mijn nieuwe adres inschrijven.", zh: "我想登记我的新地址。", en: "I want to register my new address." }],
    "Kunt u mij helpen met dit document?": [{ dutch: "Kunt u mij helpen met dit document?", zh: "您能帮我处理这份文件吗？", en: "Could you help me with this document?" }],
  }, words: { balie: { dutch: "U kunt uw vraag stellen bij de balie.", zh: "您可以在服务柜台咨询。", en: "You can ask your question at the service desk." }, inschrijven: { dutch: "Ik wil mij inschrijven bij de gemeente.", zh: "我想在市政厅登记。", en: "I want to register with the municipality." } } },
  9: { patterns: {
    "Hoeveel is de huur per maand?": [{ dutch: "Hoeveel is de huur per maand?", zh: "每月房租是多少？", en: "How much is the rent per month?" }],
    "Er is lekkage in de badkamer.": [{ dutch: "Er is lekkage in de badkamer.", zh: "浴室漏水了。", en: "There is a leak in the bathroom." }],
    "Kunt u een monteur sturen?": [{ dutch: "Kunt u een monteur sturen?", zh: "您能派一位维修师傅来吗？", en: "Could you send a repair technician?" }],
  }, words: { borg: { dutch: "Ik heb de borg al betaald.", zh: "我已经付了押金。", en: "I have already paid the deposit." }, kapot: { dutch: "De verwarming is kapot.", zh: "暖气坏了。", en: "The heating is broken." }, lekkage: { dutch: "Er is een lekkage onder de gootsteen.", zh: "水槽下面漏水了。", en: "There is a leak under the sink." } } },
  10: { patterns: {
    "Ik meld mij vandaag ziek.": [{ dutch: "Ik meld mij vandaag ziek.", zh: "我今天请病假。", en: "I am calling in sick today." }],
    "Kunt u mijn rooster controleren?": [{ dutch: "Kunt u mijn rooster controleren?", zh: "您能帮我确认一下排班表吗？", en: "Could you check my schedule?" }],
    "Morgen bel ik u weer.": [{ dutch: "Morgen bel ik u weer.", zh: "我明天再给您打电话。", en: "I will call you again tomorrow." }],
  }, words: { rooster: { dutch: "Mijn rooster voor volgende week is nog niet bekend.", zh: "我下周的排班还没出来。", en: "My schedule for next week is not available yet." }, dienst: { dutch: "Mijn dienst begint om acht uur.", zh: "我的班次八点开始。", en: "My shift starts at eight." } } },
  11: { patterns: {
    "Kan ik pinnen?": [{ dutch: "Kan ik pinnen?", zh: "我可以用银行卡付款吗？", en: "Can I pay by debit card?" }],
    "Ik heb een vraag over de bon.": [{ dutch: "Ik heb een vraag over de bon.", zh: "我有一个关于小票的问题。", en: "I have a question about the receipt." }],
    "Ik wil dit graag ruilen.": [{ dutch: "Ik wil dit graag ruilen.", zh: "我想把这个换掉。", en: "I would like to exchange this." }],
  }, words: { bon: { dutch: "Mag ik de bon, alstublieft?", zh: "请给我小票好吗？", en: "May I have the receipt, please?" }, bedrag: { dutch: "Het bedrag is twaalf euro.", zh: "金额是十二欧元。", en: "The amount is twelve euros." } } },
  12: { patterns: {
    "Mijn trein heeft vertraging.": [{ dutch: "Mijn trein heeft twintig minuten vertraging.", zh: "我的火车晚点二十分钟。", en: "My train is delayed by twenty minutes." }],
    "Waar moet ik overstappen?": [{ dutch: "Waar moet ik overstappen?", zh: "我应该在哪里换乘？", en: "Where do I have to change trains?" }],
    "Ik kom tien minuten later.": [{ dutch: "Ik kom ongeveer tien minuten later.", zh: "我大约会晚到十分钟。", en: "I will arrive about ten minutes late." }],
  }, words: { overstappen: { dutch: "In Leiden moet ik overstappen op de bus.", zh: "我必须在莱顿换乘公交车。", en: "I have to change to the bus in Leiden." }, uitvallen: { dutch: "De trein naar Rotterdam valt vandaag uit.", zh: "今天开往鹿特丹的火车停运。", en: "The train to Rotterdam is cancelled today." } } },
  13: { patterns: {
    "Wanneer moet ik betalen?": [{ dutch: "Wanneer moet ik deze rekening betalen?", zh: "我什么时候必须付这张账单？", en: "When do I have to pay this bill?" }],
    "Ik heb al betaald.": [{ dutch: "Ik heb de rekening gisteren al betaald.", zh: "我昨天已经付过账单了。", en: "I already paid the bill yesterday." }],
    "Wordt dit vergoed door de verzekering?": [{ dutch: "Wordt dit vergoed door de verzekering?", zh: "这笔费用能由保险报销吗？", en: "Is this reimbursed by the insurance?" }],
  }, words: { zorgverzekering: { dutch: "Mijn zorgverzekering vergoedt dit bezoek.", zh: "我的医疗保险报销这次就诊费用。", en: "My health insurance covers this visit." }, vergoeding: { dutch: "Ik wil weten of ik een vergoeding krijg.", zh: "我想知道能否获得报销。", en: "I want to know whether I will receive reimbursement." }, factuur: { dutch: "Ik heb de factuur per e-mail ontvangen.", zh: "我通过电子邮件收到了账单。", en: "I received the invoice by email." } } },
  14: { patterns: {
    "Beste meneer/mevrouw,": [{ dutch: "Beste meneer/mevrouw,", zh: "尊敬的先生/女士：", en: "Dear Sir/Madam," }],
    "Ik schrijf u omdat ...": [{ dutch: "Ik schrijf u omdat ik mijn afspraak wil verzetten.", zh: "我写信给您，是因为我想改预约时间。", en: "I am writing because I would like to reschedule my appointment." }],
    "Met vriendelijke groet,": [{ dutch: "Met vriendelijke groet,", zh: "此致，", en: "Kind regards," }],
  }, words: { bijgevoegd: { dutch: "U vindt het formulier bijgevoegd.", zh: "随信附上表格。", en: "The form is attached." }, reageren: { dutch: "Kunt u deze week reageren?", zh: "您能在本周内回复吗？", en: "Could you reply this week?" } } },
  15: { patterns: {
    "Ik ben niet tevreden over ...": [{ dutch: "Ik ben niet tevreden over de reparatie.", zh: "我对这次维修不满意。", en: "I am not satisfied with the repair." }],
    "Ik heb een probleem met ...": [{ dutch: "Ik heb een probleem met mijn bestelling.", zh: "我的订单出了问题。", en: "I have a problem with my order." }],
    "Kunt u controleren of dit klopt?": [{ dutch: "Kunt u controleren of het bedrag klopt?", zh: "您能核实一下金额是否正确吗？", en: "Could you check whether the amount is correct?" }],
  }, words: { fout: { dutch: "Er staat een fout op de rekening.", zh: "账单上有一处错误。", en: "There is a mistake on the bill." }, uitleg: { dutch: "Kunt u mij een uitleg geven?", zh: "您能给我解释一下吗？", en: "Could you give me an explanation?" } } },
  16: { patterns: {
    "Goedemorgen, u spreekt met ...": [{ dutch: "Goedemorgen, u spreekt met Lin Chen.", zh: "早上好，我是 Lin Chen。", en: "Good morning, this is Lin Chen speaking." }],
    "Kunt u dat spellen?": [{ dutch: "Kunt u uw achternaam spellen?", zh: "您能拼一下您的姓氏吗？", en: "Could you spell your surname?" }],
    "Kunt u de afspraak bevestigen?": [{ dutch: "Kunt u de afspraak per e-mail bevestigen?", zh: "您能通过电子邮件确认预约吗？", en: "Could you confirm the appointment by email?" }],
  }, words: { spellen: { dutch: "Kunt u dat woord spellen?", zh: "您能拼一下那个词吗？", en: "Could you spell that word?" }, bevestigen: { dutch: "Wilt u mijn afspraak bevestigen?", zh: "您能确认一下我的预约吗？", en: "Could you confirm my appointment?" } } },
  17: { patterns: {
    "Ik heb een brief gekregen.": [{ dutch: "Ik heb gisteren een brief gekregen.", zh: "我昨天收到了一封信。", en: "I received a letter yesterday." }],
    "Ik heb een afspraak gemaakt.": [{ dutch: "Ik heb online een afspraak gemaakt.", zh: "我在网上预约了。", en: "I made an appointment online." }],
    "Ik ben naar de gemeente gegaan.": [{ dutch: "Ik ben vorige week naar de gemeente gegaan.", zh: "我上周去了市政厅。", en: "I went to the municipality last week." }],
  }, words: { gekregen: { dutch: "Ik heb een bevestiging gekregen.", zh: "我收到了一份确认信息。", en: "I received a confirmation." }, betaald: { dutch: "Ik heb de rekening betaald.", zh: "我付了账单。", en: "I paid the bill." }, "vorige week": { dutch: "Vorige week ben ik naar de huisarts gegaan.", zh: "上周我去了家庭医生那里。", en: "I went to the GP last week." } } },
  18: { patterns: {
    "Ik kan niet komen omdat ik ziek ben.": [{ dutch: "Ik kan niet komen omdat ik ziek ben.", zh: "我不能来，因为我病了。", en: "I cannot come because I am ill." }],
    "Ik kom later, want mijn trein heeft vertraging.": [{ dutch: "Ik kom later, want mijn trein heeft vertraging.", zh: "我会晚些到，因为我的火车晚点了。", en: "I will arrive later because my train is delayed." }],
    "Ik wil liever ...": [{ dutch: "Ik wil liever een afspraak in de ochtend.", zh: "我更想约在上午。", en: "I would prefer an appointment in the morning." }],
  }, words: { omdat: { dutch: "Ik blijf thuis omdat ik koorts heb.", zh: "我待在家里，因为我发烧了。", en: "I am staying home because I have a fever." }, liever: { dutch: "Ik wil liever morgen bellen.", zh: "我更想明天打电话。", en: "I would rather call tomorrow." } } },
  19: { patterns: {
    "Ik wil graag ...": [{ dutch: "Ik wil graag een afspraak met de huisarts.", zh: "我想预约家庭医生。", en: "I would like an appointment with the GP." }],
    "Kunt u mij helpen?": [{ dutch: "Kunt u mij helpen met deze rekening?", zh: "您能帮我看一下这张账单吗？", en: "Could you help me with this bill?" }],
    "Ik heb een probleem met ...": [{ dutch: "Ik heb een probleem met mijn huurwoning.", zh: "我的出租房出了问题。", en: "I have a problem with my rental home." }],
    "Kunt u dat herhalen?": [{ dutch: "Kunt u dat nog een keer herhalen?", zh: "您能再重复一遍吗？", en: "Could you repeat that once more?" }],
  }, words: {} },
  20: { patterns: {
    "Ik heb een brief gekregen.": [{ dutch: "Ik heb een brief gekregen over mijn zorgverzekering.", zh: "我收到了一封关于医疗保险的信。", en: "I received a letter about my health insurance." }],
    "Ik schrijf u omdat ...": [{ dutch: "Ik schrijf u omdat ik een vraag heb over de betaling.", zh: "我写信给您，是因为我有一个关于付款的问题。", en: "I am writing because I have a question about the payment." }],
    "Kunt u de informatie bevestigen?": [{ dutch: "Kunt u de afspraakinformatie bevestigen?", zh: "您能确认一下预约信息吗？", en: "Could you confirm the appointment information?" }],
  }, words: {} },
};

const curatedB1LessonExamples: Record<number, {
  patterns: Record<string, Array<{ dutch: string; zh: string; en: string }>>;
  words: Record<string, { dutch: string; zh: string; en: string }>;
}> = {
  1: { patterns: {
    "Ik lees eerst wat de taak vraagt.": [{ dutch: "Ik lees eerst wat de taak vraagt.", zh: "我先读清楚任务要求。", en: "I first read what the task asks." }],
    "Deze situatie gaat over werk of studie.": [{ dutch: "Deze situatie gaat over werk of studie.", zh: "这个情境和工作或学习有关。", en: "This situation is about work or study." }],
    "Ik moet informatie begrijpen en reageren.": [{ dutch: "Ik moet de informatie begrijpen en daarop reageren.", zh: "我需要理解信息并作出回应。", en: "I need to understand the information and respond to it." }],
  }, words: {} },
  2: { patterns: {
    "Het hoofdpunt van de tekst is ...": [{ dutch: "Het hoofdpunt van de tekst is dat de cursus volgende maand begint.", zh: "文章的重点是课程下个月开始。", en: "The main point of the text is that the course starts next month." }],
    "Deze alinea geeft een voorbeeld.": [{ dutch: "Deze alinea geeft een voorbeeld van de nieuwe regeling.", zh: "这一段举例说明了新规定。", en: "This paragraph gives an example of the new arrangement." }],
    "De schrijver wil uitleg geven over ...": [{ dutch: "De schrijver wil uitleg geven over de aanvraagprocedure.", zh: "作者想介绍申请流程。", en: "The writer wants to explain the application procedure." }],
  }, words: {} },
  3: { patterns: {
    "Eerst moeten we ...": [{ dutch: "Eerst moeten we de formulieren controleren.", zh: "我们首先要检查这些表格。", en: "First, we have to check the forms." }],
    "Daarna controleren we ...": [{ dutch: "Daarna controleren we of alle gegevens kloppen.", zh: "之后我们会检查所有信息是否正确。", en: "After that, we check whether all the details are correct." }],
    "De deadline is volgende week.": [{ dutch: "De deadline is volgende week vrijdag.", zh: "截止日期是下周五。", en: "The deadline is next Friday." }],
  }, words: {} },
  4: { patterns: {
    "Mijn functie is ...": [{ dutch: "Mijn functie is administratief medewerker.", zh: "我的职位是行政助理。", en: "My position is administrative assistant." }],
    "In het contract staat dat ...": [{ dutch: "In het contract staat dat ik 32 uur per week werk.", zh: "合同上写着我每周工作 32 小时。", en: "The contract says that I work 32 hours a week." }],
    "Ik werk ... uur per week.": [{ dutch: "Ik werk 32 uur per week.", zh: "我每周工作 32 小时。", en: "I work 32 hours a week." }],
  }, words: {} },
  5: { patterns: {
    "Ik wil graag verlof aanvragen.": [{ dutch: "Ik wil graag verlof aanvragen voor 14 en 15 juni.", zh: "我想申请 6 月 14 日和 15 日的假。", en: "I would like to request leave for 14 and 15 June." }],
    "Kan ik mijn dienst ruilen?": [{ dutch: "Kan ik mijn dienst van vrijdag met die van maandag ruilen?", zh: "我能把星期五的班和星期一的班调换吗？", en: "Can I swap my Friday shift for Monday's?" }],
    "Mijn leidinggevende heeft het goedgekeurd.": [{ dutch: "Mijn leidinggevende heeft mijn verlofaanvraag goedgekeurd.", zh: "我的主管批准了我的请假申请。", en: "My manager approved my leave request." }],
  }, words: {} },
  6: { patterns: {
    "Ik wil solliciteren naar deze functie.": [{ dutch: "Ik wil solliciteren naar deze functie als verzorgende.", zh: "我想申请这个护理员职位。", en: "I want to apply for this care assistant position." }],
    "Ik heb ervaring met ...": [{ dutch: "Ik heb ervaring met klanten helpen.", zh: "我有帮助顾客的经验。", en: "I have experience helping customers." }],
    "In mijn cv staat ...": [{ dutch: "In mijn cv staat dat ik drie jaar ervaring heb.", zh: "我的简历上写着我有三年工作经验。", en: "My CV says that I have three years of experience." }],
  }, words: {} },
  7: { patterns: {
    "Een voorbeeld uit mijn werk is ...": [{ dutch: "Een voorbeeld uit mijn werk is dat ik een nieuwe collega heb ingewerkt.", zh: "我工作中的一个例子是：我带过一位新同事。", en: "One example from my work is that I trained a new colleague." }],
    "Ik kan goed samenwerken.": [{ dutch: "Ik kan goed samenwerken en ik luister naar mijn collega's.", zh: "我善于合作，也会倾听同事的意见。", en: "I work well with others and listen to my colleagues." }],
    "Ik wil mij verder ontwikkelen.": [{ dutch: "Ik wil mij verder ontwikkelen door een cursus te volgen.", zh: "我想通过参加课程继续提升自己。", en: "I want to develop further by taking a course." }],
  }, words: {} },
  8: { patterns: {
    "Ik volg een opleiding tot ...": [{ dutch: "Ik volg een opleiding tot verpleegkundige.", zh: "我正在参加护士培训。", en: "I am training to become a nurse." }],
    "Ik moet de opdracht vrijdag inleveren.": [{ dutch: "Ik moet de opdracht vrijdag voor vijf uur inleveren.", zh: "我必须在星期五五点前交作业。", en: "I have to hand in the assignment before five on Friday." }],
    "Ik heb hulp nodig bij ...": [{ dutch: "Ik heb hulp nodig bij het schrijven van mijn verslag.", zh: "我写报告时需要帮助。", en: "I need help writing my report." }],
  }, words: {} },
  9: { patterns: {
    "Ik loop stage bij ...": [{ dutch: "Ik loop stage bij een basisschool in Utrecht.", zh: "我在乌得勒支的一所小学实习。", en: "I am doing an internship at a primary school in Utrecht." }],
    "Mijn begeleider geeft feedback over ...": [{ dutch: "Mijn begeleider geeft feedback over mijn gesprekken met cliënten.", zh: "我的指导老师会反馈我与客户沟通的情况。", en: "My supervisor gives feedback on my conversations with clients." }],
    "Ik wil dit verbeteren door ...": [{ dutch: "Ik wil dit verbeteren door duidelijker vragen te stellen.", zh: "我想通过更清楚地提问来改进这一点。", en: "I want to improve this by asking clearer questions." }],
  }, words: {} },
  10: { patterns: {
    "Ik ben verantwoordelijk voor ...": [{ dutch: "Ik ben verantwoordelijk voor het contact met de leverancier.", zh: "我负责与供应商联系。", en: "I am responsible for contacting the supplier." }],
    "We hebben afgesproken dat ...": [{ dutch: "We hebben afgesproken dat Sara het verslag vrijdag verstuurt.", zh: "我们约定由 Sara 在星期五发送报告。", en: "We agreed that Sara will send the report on Friday." }],
    "Het actiepunt is ...": [{ dutch: "Het actiepunt is dat ik de nieuwe planning controleer.", zh: "行动事项是由我检查新的计划表。", en: "The action item is for me to check the new schedule." }],
  }, words: {} },
  11: { patterns: {
    "Het is verplicht om ...": [{ dutch: "Het is verplicht om veiligheidsschoenen te dragen.", zh: "必须穿安全鞋。", en: "It is compulsory to wear safety shoes." }],
    "Het is verboden om ...": [{ dutch: "Het is verboden om hier foto's te maken.", zh: "这里禁止拍照。", en: "Taking photos here is prohibited." }],
    "Controleer eerst of ...": [{ dutch: "Controleer eerst of de machine uitstaat.", zh: "先检查机器是否已经关闭。", en: "First check whether the machine is switched off." }],
  }, words: {} },
  12: { patterns: {
    "Volgens mij is ...": [{ dutch: "Volgens mij is een extra les op woensdag de beste oplossing.", zh: "我认为星期三加一节课是最好的解决办法。", en: "In my opinion, an extra class on Wednesday is the best solution." }],
    "Ik ben het daarmee eens.": [{ dutch: "Ik ben het daarmee eens, omdat iedereen dan kan komen.", zh: "我同意，因为那样大家都能来。", en: "I agree, because everyone can come then." }],
    "Ik begrijp uw punt, maar ...": [{ dutch: "Ik begrijp uw punt, maar we hebben meer tijd nodig.", zh: "我理解您的观点，但我们需要更多时间。", en: "I understand your point, but we need more time." }],
  }, words: {} },
  13: { patterns: {
    "Omdat ik ervaring heb, kan ik snel beginnen.": [{ dutch: "Omdat ik ervaring heb, kan ik volgende week beginnen.", zh: "因为我有经验，所以我下周就能开始。", en: "Because I have experience, I can start next week." }],
    "Hoewel het druk is, blijft de planning duidelijk.": [{ dutch: "Hoewel het druk is, blijft de planning duidelijk.", zh: "虽然很忙，计划仍然很清楚。", en: "Although it is busy, the schedule remains clear." }],
    "Daardoor ontstaat er vertraging.": [{ dutch: "De bus is te laat. Daardoor ontstaat er vertraging.", zh: "公交车晚点了，因此造成了延误。", en: "The bus is late. As a result, there is a delay." }],
  }, words: {} },
  14: { patterns: {
    "Wij hebben uw aanvraag ontvangen.": [{ dutch: "Wij hebben uw aanvraag op 3 oktober ontvangen.", zh: "我们已于 10 月 3 日收到您的申请。", en: "We received your application on 3 October." }],
    "U moet het bewijs voor ... indienen.": [{ dutch: "U moet het bewijs voor 30 oktober indienen.", zh: "您必须在 10 月 30 日之前提交证明材料。", en: "You must submit the evidence before 30 October." }],
    "De termijn eindigt op ...": [{ dutch: "De termijn eindigt op 30 oktober.", zh: "期限于 10 月 30 日截止。", en: "The deadline is 30 October." }],
  }, words: {} },
  15: { patterns: {
    "Ik wil bezwaar maken tegen dit besluit.": [{ dutch: "Ik wil bezwaar maken tegen dit besluit, omdat mijn gegevens niet kloppen.", zh: "我想对这项决定提出异议，因为我的信息不正确。", en: "I want to object to this decision because my details are incorrect." }],
    "Er ontbreekt nog een bewijsstuk.": [{ dutch: "Er ontbreekt nog een bewijsstuk bij mijn aanvraag.", zh: "我的申请还缺一份证明材料。", en: "One piece of evidence is still missing from my application." }],
    "Kunt u mijn aanvraag opnieuw bekijken?": [{ dutch: "Kunt u mijn aanvraag opnieuw bekijken? Ik heb het bewijs meegestuurd.", zh: "您能重新审核我的申请吗？我已经附上证明材料。", en: "Could you review my application again? I have included the evidence." }],
  }, words: {} },
  16: { patterns: {
    "Ik kan niet inloggen.": [{ dutch: "Ik kan niet inloggen met mijn DigiD.", zh: "我无法用 DigiD 登录。", en: "I cannot log in with my DigiD." }],
    "Ik heb het bestand geüpload.": [{ dutch: "Ik heb het gevraagde bestand geüpload.", zh: "我已经上传了所需文件。", en: "I have uploaded the requested file." }],
    "Ik krijg een foutmelding.": [{ dutch: "Ik krijg een foutmelding wanneer ik het formulier verzend.", zh: "我提交表格时收到一条错误提示。", en: "I get an error message when I submit the form." }],
  }, words: {} },
  17: { patterns: {
    "Mijn inkomen is veranderd.": [{ dutch: "Mijn inkomen is veranderd omdat ik meer uren werk.", zh: "我的收入变了，因为我增加了工作时间。", en: "My income has changed because I work more hours." }],
    "Ik moet de wijziging doorgeven.": [{ dutch: "Ik moet de wijziging deze maand aan de gemeente doorgeven.", zh: "我必须在这个月把这项变更告知市政厅。", en: "I have to report the change to the municipality this month." }],
    "Heb ik recht op toeslag?": [{ dutch: "Heb ik met dit inkomen recht op huurtoeslag?", zh: "以我目前的收入，我有资格领取房租补贴吗？", en: "Am I entitled to housing benefit with this income?" }],
  }, words: {} },
  18: { patterns: {
    "De huisarts geeft een verwijzing.": [{ dutch: "De huisarts geeft mij een verwijzing naar het ziekenhuis.", zh: "家庭医生给了我一张转诊单，让我去医院。", en: "The GP gives me a referral to the hospital." }],
    "Ik wil de uitslag bespreken.": [{ dutch: "Ik wil de uitslag van het onderzoek met de huisarts bespreken.", zh: "我想和家庭医生讨论检查结果。", en: "I want to discuss the test results with the GP." }],
    "Mijn klachten zijn erger geworden.": [{ dutch: "Mijn klachten zijn sinds gisteren erger geworden.", zh: "我的症状从昨天开始加重了。", en: "My symptoms have got worse since yesterday." }],
  }, words: {} },
  19: { patterns: {
    "De reparatie is nog niet uitgevoerd.": [{ dutch: "De reparatie is na twee weken nog niet uitgevoerd.", zh: "两周过去了，维修仍未完成。", en: "The repair has still not been carried out after two weeks." }],
    "Ik betaal servicekosten voor ...": [{ dutch: "Ik betaal servicekosten voor het schoonmaken van de gemeenschappelijke ruimte.", zh: "我支付公共区域清洁服务费。", en: "I pay service charges for cleaning the shared area." }],
    "Ik wil een klacht indienen.": [{ dutch: "Ik wil een klacht indienen over de hoge energiekosten.", zh: "我想投诉能源费用过高。", en: "I want to file a complaint about the high energy costs." }],
  }, words: {} },
  20: { patterns: {
    "Door werkzaamheden rijdt er geen trein.": [{ dutch: "Door werkzaamheden rijdt er dit weekend geen trein tussen Leiden en Den Haag.", zh: "由于施工，本周末莱顿和海牙之间没有火车运行。", en: "Due to construction, no trains run between Leiden and The Hague this weekend." }],
    "Ik wil bezwaar maken tegen de boete.": [{ dutch: "Ik wil bezwaar maken tegen de boete, omdat ik al een geldig kaartje had.", zh: "我想对这张罚单提出异议，因为我当时已经有有效车票。", en: "I want to object to the fine because I already had a valid ticket." }],
    "Kan ik een vergoeding krijgen?": [{ dutch: "Kan ik een vergoeding krijgen voor de extra reiskosten?", zh: "我能获得额外交通费用的补偿吗？", en: "Can I get compensation for the extra travel costs?" }],
  }, words: {} },
  21: { patterns: {
    "Het product is beschadigd aangekomen.": [{ dutch: "Het product is beschadigd aangekomen; de verpakking was ook open.", zh: "商品送到时已经损坏，包装也开着。", en: "The product arrived damaged, and the packaging was open too." }],
    "De ruiltermijn is nog niet voorbij.": [{ dutch: "De ruiltermijn is nog niet voorbij; ik heb het vorige week gekocht.", zh: "换货期限还没过；我是上周买的。", en: "The exchange period is not over yet; I bought it last week." }],
    "Ik wil graag mijn geld terug.": [{ dutch: "Ik wil graag mijn geld terug, omdat het product niet werkt.", zh: "因为商品无法使用，我想申请退款。", en: "I would like my money back because the product does not work." }],
  }, words: {} },
  22: { patterns: {
    "U bent verplicht om ...": [{ dutch: "U bent verplicht om een geldig identiteitsbewijs te tonen.", zh: "您必须出示有效身份证件。", en: "You are required to show valid identification." }],
    "Ik heb toestemming nodig voor ...": [{ dutch: "Ik heb toestemming nodig voor het plaatsen van een schutting.", zh: "我需要获得许可才能安装围栏。", en: "I need permission to put up a fence." }],
    "Ik wil een melding doen.": [{ dutch: "Ik wil een melding doen van de beschadiging.", zh: "我想报告这处损坏。", en: "I want to report the damage." }],
  }, words: {} },
  23: { patterns: {
    "Ik wil deelnemen aan ...": [{ dutch: "Ik wil deelnemen aan de bijeenkomst over verkeersveiligheid.", zh: "我想参加关于交通安全的会议。", en: "I want to take part in the meeting about road safety." }],
    "Ik maak mij zorgen over ...": [{ dutch: "Ik maak mij zorgen over het vele verkeer in onze buurt.", zh: "我担心我们社区的交通太拥挤。", en: "I am concerned about the heavy traffic in our neighbourhood." }],
    "Mijn voorstel is om ...": [{ dutch: "Mijn voorstel is om een veilige oversteekplaats te maken.", zh: "我的建议是设置一个安全的人行横道。", en: "My proposal is to create a safe crossing." }],
  }, words: {} },
  24: { patterns: {
    "De tekst gaat over ...": [{ dutch: "De tekst gaat over een nieuwe regeling voor huurtoeslag.", zh: "这篇文章讲的是房租补贴的新规定。", en: "The text is about a new housing-benefit arrangement." }],
    "Mijn mening is dat ...": [{ dutch: "Mijn mening is dat de aanvraagprocedure duidelijker moet.", zh: "我认为申请流程应该更清楚。", en: "My opinion is that the application procedure should be clearer." }],
    "Ik verzoek u om ...": [{ dutch: "Ik verzoek u om mijn aanvraag opnieuw te beoordelen.", zh: "我请求您重新审核我的申请。", en: "I request that you review my application again." }],
    "De beste oplossing is ...": [{ dutch: "De beste oplossing is een nieuwe afspraak met de begeleider.", zh: "最好的解决办法是和指导老师重新约时间。", en: "The best solution is a new appointment with the supervisor." }],
  }, words: {} },
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
  const curatedCourseExample = plan.level === "A0"
    ? curatedA0LessonExamples[plan.order]?.words[word.toLowerCase()]
    : plan.level === "A1"
      ? curatedA1LessonExamples[plan.order]?.words[word.toLowerCase()]
      : plan.level === "A2"
        ? curatedA2LessonExamples[plan.order]?.words[word.toLowerCase()]
        : plan.level === "B1"
          ? curatedB1LessonExamples[plan.order]?.words[word.toLowerCase()]
      : undefined;
  if (curatedCourseExample) {
    return {
      dutch: curatedCourseExample.dutch,
      meaning: lt(curatedCourseExample.zh, curatedCourseExample.en),
      audioText: curatedCourseExample.dutch,
      audioSrc: `/audio/placeholders/${plan.id}/word-example-${lessonSlug(curatedCourseExample.dutch)}.mp3`,
    };
  }

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
  const curated = plan.level === "A0"
    ? curatedA0LessonExamples[plan.order]?.patterns[pattern]
    : plan.level === "A1"
      ? curatedA1LessonExamples[plan.order]?.patterns?.[pattern]
      : plan.level === "A2"
        ? curatedA2LessonExamples[plan.order]?.patterns?.[pattern]
        : plan.level === "B1"
          ? curatedB1LessonExamples[plan.order]?.patterns?.[pattern]
      : undefined;
  const lines = curated?.map((example) => example.dutch) ?? [fillPattern(pattern, plan, index, vocabulary), fillPattern(pattern, plan, index + 1, vocabulary)];
  const examples = lines
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
  const curatedA0Dialogues: Record<number, Array<{ speaker: "A" | "B"; dutch: string; zh: string; en: string }>> = {
    8: [
      { speaker: "A", dutch: "Ik wil graag wat water.", zh: "我想要一点水。", en: "I'd like some water." },
      { speaker: "B", dutch: "Natuurlijk.", zh: "当然可以。", en: "Of course." },
      { speaker: "A", dutch: "Dank je. Ik heb ook hulp nodig.", zh: "谢谢。我还需要帮助。", en: "Thank you. I also need help." },
      { speaker: "B", dutch: "Ik kan u helpen.", zh: "我可以帮您。", en: "I can help you." },
    ],
    9: [
      { speaker: "A", dutch: "Sorry, ik begrijp het niet.", zh: "不好意思，我没听懂。", en: "Sorry, I don't understand." },
      { speaker: "B", dutch: "Natuurlijk. Ik zeg het nog een keer.", zh: "当然可以，我再说一遍。", en: "Of course. I'll say it again." },
      { speaker: "A", dutch: "Kunt u wat langzamer spreken?", zh: "您能说慢一点吗？", en: "Could you speak a little more slowly?" },
      { speaker: "B", dutch: "Ja, natuurlijk.", zh: "好的，当然可以。", en: "Yes, of course." },
    ],
    11: [
      { speaker: "A", dutch: "Dit is een goed boek.", zh: "这是一本好书。", en: "This is a good book." },
      { speaker: "B", dutch: "Wat een leuk huis!", zh: "这房子真不错！", en: "What a lovely house!" },
      { speaker: "A", dutch: "Kijk, daar komt de trein.", zh: "看，火车来了。", en: "Look, the train is coming." },
      { speaker: "B", dutch: "Ik ben blij.", zh: "我很高兴。", en: "I'm happy." },
    ],
    12: [
      { speaker: "A", dutch: "Hallo, ik heet Lin.", zh: "你好，我叫 Lin。", en: "Hi, my name is Lin." },
      { speaker: "B", dutch: "Hallo Lin, ik heet Anna.", zh: "你好，Lin，我叫 Anna。", en: "Hi Lin, my name is Anna." },
      { speaker: "A", dutch: "Ik kom uit China en ik woon in Leiden.", zh: "我来自中国，住在 Leiden。", en: "I'm from China and I live in Leiden." },
      { speaker: "B", dutch: "Ik kom uit Nederland en ik woon in Delft.", zh: "我来自荷兰，住在 Delft。", en: "I'm from the Netherlands and I live in Delft." },
    ],
  };
  const curatedA1Dialogues: Record<number, Array<{ speaker: "A" | "B"; dutch: string; zh: string; en: string }>> = {
    1: [
      { speaker: "A", dutch: "Wat is uw adres?", zh: "您的地址是什么？", en: "What is your address?" },
      { speaker: "B", dutch: "Mijn adres is Langestraat 12.", zh: "我的地址是 Langestraat 12 号。", en: "My address is 12 Langestraat." },
      { speaker: "A", dutch: "Wat is uw telefoonnummer?", zh: "您的电话号码是多少？", en: "What is your phone number?" },
      { speaker: "B", dutch: "Mijn telefoonnummer is 06-12345678.", zh: "我的电话号码是 06-12345678。", en: "My phone number is 06-12345678." },
    ],
    2: [
      { speaker: "A", dutch: "Hoe laat is het?", zh: "现在几点？", en: "What time is it?" },
      { speaker: "B", dutch: "Het is drie uur.", zh: "现在三点。", en: "It is three o'clock." },
      { speaker: "A", dutch: "Welke dag is het vandaag?", zh: "今天星期几？", en: "What day is it today?" },
      { speaker: "B", dutch: "Vandaag is het maandag.", zh: "今天是星期一。", en: "Today is Monday." },
    ],
    3: [
      { speaker: "A", dutch: "Heb je broers of zussen?", zh: "你有兄弟姐妹吗？", en: "Do you have any siblings?" },
      { speaker: "B", dutch: "Ja, ik heb een broer en een zus.", zh: "有，我有一个兄弟和一个姐妹。", en: "Yes, I have a brother and a sister." },
      { speaker: "A", dutch: "Woont je familie ook in Nederland?", zh: "你的家人也住在荷兰吗？", en: "Does your family also live in the Netherlands?" },
      { speaker: "B", dutch: "Ja, mijn ouders wonen hier.", zh: "是的，我父母住在这里。", en: "Yes, my parents live here." },
    ],
    4: [
      { speaker: "A", dutch: "Hoeveel kamers heeft uw huis?", zh: "您的房子有几个房间？", en: "How many rooms does your house have?" },
      { speaker: "B", dutch: "Mijn huis heeft twee kamers.", zh: "我的房子有两个房间。", en: "My house has two rooms." },
      { speaker: "A", dutch: "Staat er een tafel in de kamer?", zh: "房间里有桌子吗？", en: "Is there a table in the room?" },
      { speaker: "B", dutch: "Ja, er staat een tafel naast het raam.", zh: "有，窗户旁边有一张桌子。", en: "Yes, there is a table next to the window." },
    ],
    5: [
      { speaker: "A", dutch: "Wat wilt u eten?", zh: "您想吃什么？", en: "What would you like to eat?" },
      { speaker: "B", dutch: "Ik wil graag brood met kaas.", zh: "我想要面包和奶酪。", en: "I'd like bread with cheese." },
      { speaker: "A", dutch: "Wilt u ook iets drinken?", zh: "您还想喝点什么吗？", en: "Would you like something to drink too?" },
      { speaker: "B", dutch: "Ja, graag. Ik wil thee.", zh: "好啊，我想喝茶。", en: "Yes, please. I'd like tea." },
    ],
    6: [
      { speaker: "A", dutch: "Hoeveel kost dit brood?", zh: "这条面包多少钱？", en: "How much is this loaf of bread?" },
      { speaker: "B", dutch: "Drie euro.", zh: "三欧元。", en: "Three euros." },
      { speaker: "A", dutch: "Dan neem ik het.", zh: "那我买这个。", en: "Then I'll take it." },
      { speaker: "B", dutch: "Alstublieft.", zh: "给您。", en: "Here you are." },
    ],
    7: [
      { speaker: "A", dutch: "Waar is het station?", zh: "车站在哪里？", en: "Where is the station?" },
      { speaker: "B", dutch: "Loop rechtdoor. Het station is links.", zh: "一直往前走，车站在左边。", en: "Go straight ahead. The station is on the left." },
      { speaker: "A", dutch: "Van welk spoor vertrekt de trein?", zh: "火车从几号轨道发车？", en: "Which track does the train leave from?" },
      { speaker: "B", dutch: "Van spoor twee.", zh: "从 2 号轨道。", en: "From track 2." },
    ],
    8: [
      { speaker: "A", dutch: "Wat voor weer is het vandaag?", zh: "今天天气怎么样？", en: "What's the weather like today?" },
      { speaker: "B", dutch: "Het is koud en het regent.", zh: "天气很冷，还在下雨。", en: "It's cold and raining." },
      { speaker: "A", dutch: "Dan doe ik mijn jas aan.", zh: "那我穿上外套。", en: "Then I'll put on my coat." },
      { speaker: "B", dutch: "Goed idee.", zh: "好主意。", en: "Good idea." },
    ],
    9: [
      { speaker: "A", dutch: "Waar werk je?", zh: "你在哪里工作？", en: "Where do you work?" },
      { speaker: "B", dutch: "Ik werk in Amsterdam.", zh: "我在阿姆斯特丹工作。", en: "I work in Amsterdam." },
      { speaker: "A", dutch: "Volg je ook Nederlandse les?", zh: "你也上荷兰语课吗？", en: "Do you also take Dutch lessons?" },
      { speaker: "B", dutch: "Ja, ik leer Nederlands.", zh: "是的，我在学荷兰语。", en: "Yes, I'm learning Dutch." },
    ],
    10: [
      { speaker: "A", dutch: "Hoe laat sta je op?", zh: "你几点起床？", en: "What time do you get up?" },
      { speaker: "B", dutch: "Ik sta om zeven uur op.", zh: "我七点起床。", en: "I get up at seven." },
      { speaker: "A", dutch: "Wat doe je daarna?", zh: "之后你做什么？", en: "What do you do after that?" },
      { speaker: "B", dutch: "Ik eet brood en drink thee.", zh: "我吃面包、喝茶。", en: "I eat bread and drink tea." },
    ],
    11: [
      { speaker: "A", dutch: "Wat is er aan de hand?", zh: "你怎么了？", en: "What's wrong?" },
      { speaker: "B", dutch: "Ik ben ziek en ik heb hoofdpijn.", zh: "我病了，而且头疼。", en: "I'm ill and I have a headache." },
      { speaker: "A", dutch: "Ben je ook moe?", zh: "你也累吗？", en: "Are you tired too?" },
      { speaker: "B", dutch: "Ja, ik neem vandaag rust.", zh: "是的，我今天休息。", en: "Yes, I'm resting today." },
    ],
    12: [
      { speaker: "A", dutch: "Waar is het station?", zh: "车站在哪里？", en: "Where is the station?" },
      { speaker: "B", dutch: "Ga rechtdoor en sla linksaf.", zh: "一直往前走，然后左转。", en: "Go straight ahead and turn left." },
      { speaker: "A", dutch: "Is het naast de supermarkt?", zh: "它在超市旁边吗？", en: "Is it next to the supermarket?" },
      { speaker: "B", dutch: "Nee, het is tegenover de supermarkt.", zh: "不，在超市对面。", en: "No, it's opposite the supermarket." },
    ],
    13: [
      { speaker: "A", dutch: "Wil je koffie of thee?", zh: "你想喝咖啡还是茶？", en: "Would you like coffee or tea?" },
      { speaker: "B", dutch: "Ik wil liever thee.", zh: "我更想喝茶。", en: "I'd rather have tea." },
      { speaker: "A", dutch: "Vind je fietsen leuk?", zh: "你喜欢骑自行车吗？", en: "Do you like cycling?" },
      { speaker: "B", dutch: "Ja, ik vind fietsen leuk.", zh: "喜欢，我喜欢骑自行车。", en: "Yes, I like cycling." },
    ],
    15: [
      { speaker: "A", dutch: "Ik wil twee kilo appels, alstublieft.", zh: "请给我两公斤苹果。", en: "I'd like two kilos of apples, please." },
      { speaker: "B", dutch: "Dat is vijf euro.", zh: "一共五欧元。", en: "That is five euros." },
      { speaker: "A", dutch: "Kan ik pinnen?", zh: "我可以刷卡吗？", en: "Can I pay by debit card?" },
      { speaker: "B", dutch: "Ja, natuurlijk. Wilt u de bon?", zh: "可以，当然。您要小票吗？", en: "Yes, of course. Would you like the receipt?" },
    ],
    16: [
      { speaker: "A", dutch: "Goedemorgen, ik bel voor een afspraak.", zh: "早上好，我打电话来预约。", en: "Good morning, I'm calling to make an appointment." },
      { speaker: "B", dutch: "Op welke dag wilt u komen?", zh: "您想哪一天来？", en: "What day would you like to come?" },
      { speaker: "A", dutch: "Kunt u dat herhalen, alstublieft?", zh: "您能重复一遍吗？", en: "Could you repeat that, please?" },
      { speaker: "B", dutch: "Op welke dag wilt u komen?", zh: "您想哪一天来？", en: "What day would you like to come?" },
    ],
    17: [
      { speaker: "A", dutch: "Waar kan ik een kaartje kopen?", zh: "我在哪里可以买票？", en: "Where can I buy a ticket?" },
      { speaker: "B", dutch: "Bij de kassa, naast de ingang.", zh: "在入口旁边的售票处。", en: "At the ticket counter, next to the entrance." },
      { speaker: "A", dutch: "Van welk spoor vertrekt de trein?", zh: "火车从几号轨道发车？", en: "Which track does the train leave from?" },
      { speaker: "B", dutch: "Van spoor twee. Loop rechtdoor.", zh: "从 2 号轨道。一直往前走。", en: "From track 2. Go straight ahead." },
    ],
    18: [
      { speaker: "A", dutch: "Waar woon je en waar werk je?", zh: "你住在哪里，在哪里工作？", en: "Where do you live and work?" },
      { speaker: "B", dutch: "Ik woon in Delft en ik werk in Amsterdam.", zh: "我住在 Delft，在 Amsterdam 工作。", en: "I live in Delft and work in Amsterdam." },
      { speaker: "A", dutch: "Wat doe je graag in je vrije tijd?", zh: "你空闲时喜欢做什么？", en: "What do you like doing in your free time?" },
      { speaker: "B", dutch: "Ik vind fietsen leuk.", zh: "我喜欢骑自行车。", en: "I like cycling." },
    ],
  };
  const curatedA2Dialogues: Record<number, Array<{ speaker: "A" | "B"; dutch: string; zh: string; en: string }>> = {
    1: [{ speaker: "A", dutch: "Wat moet ik eerst doen?", zh: "我首先要做什么？", en: "What should I do first?" }, { speaker: "B", dutch: "Lees eerst de vraag.", zh: "先读题目。", en: "Read the question first." }, { speaker: "A", dutch: "En daarna?", zh: "然后呢？", en: "And then?" }, { speaker: "B", dutch: "Luister naar de informatie en schrijf een kort antwoord.", zh: "听相关信息，然后写一个简短答案。", en: "Listen to the information and write a short answer." }],
    2: [{ speaker: "A", dutch: "Wat is uw geboortedatum?", zh: "您的出生日期是什么？", en: "What is your date of birth?" }, { speaker: "B", dutch: "12 mei 1998.", zh: "1998 年 5 月 12 日。", en: "12 May 1998." }, { speaker: "A", dutch: "Waar moet ik tekenen?", zh: "我应该在哪里签名？", en: "Where should I sign?" }, { speaker: "B", dutch: "Onderaan het formulier.", zh: "在表格底部。", en: "At the bottom of the form." }],
    3: [{ speaker: "A", dutch: "Wat staat er in de brief?", zh: "信里写了什么？", en: "What does the letter say?" }, { speaker: "B", dutch: "De afspraak is maandag om tien uur.", zh: "预约在星期一上午十点。", en: "The appointment is Monday at ten." }, { speaker: "A", dutch: "Moet ik iets meenemen?", zh: "我需要带什么吗？", en: "Do I need to bring anything?" }, { speaker: "B", dutch: "Ja, neem een kopie mee.", zh: "需要，请带一份复印件。", en: "Yes, bring a copy." }],
    4: [{ speaker: "A", dutch: "Ik heb het bericht niet goed gehoord.", zh: "我没听清这条留言。", en: "I didn't hear the message clearly." }, { speaker: "B", dutch: "De afspraak is morgen om elf uur.", zh: "预约在明天十一点。", en: "The appointment is tomorrow at eleven." }, { speaker: "A", dutch: "Kunt u dat herhalen?", zh: "您能重复一遍吗？", en: "Could you repeat that?" }, { speaker: "B", dutch: "Ja, morgen om elf uur.", zh: "可以，明天十一点。", en: "Yes, tomorrow at eleven." }],
    5: [{ speaker: "A", dutch: "Ik wil mijn afspraak verzetten.", zh: "我想改一下预约时间。", en: "I would like to reschedule my appointment." }, { speaker: "B", dutch: "Welk tijdstip schikt u?", zh: "什么时间方便您？", en: "What time suits you?" }, { speaker: "A", dutch: "Kan het donderdag om twee uur?", zh: "可以改到星期四两点吗？", en: "Could we do Thursday at two?" }, { speaker: "B", dutch: "Ja, ik bevestig de nieuwe afspraak.", zh: "可以，我确认新的预约。", en: "Yes, I confirm the new appointment." }],
    6: [{ speaker: "A", dutch: "Goedemorgen, ik bel voor de huisarts.", zh: "早上好，我打电话联系家庭医生。", en: "Good morning, I am calling about the GP." }, { speaker: "B", dutch: "Wat zijn uw klachten?", zh: "您有什么症状？", en: "What symptoms do you have?" }, { speaker: "A", dutch: "Ik heb sinds gisteren hoofdpijn.", zh: "我从昨天开始头疼。", en: "I have had a headache since yesterday." }, { speaker: "B", dutch: "U kunt morgen om negen uur langskomen.", zh: "您明天九点可以过来。", en: "You can come in tomorrow at nine." }],
    7: [{ speaker: "A", dutch: "Hoe moet ik dit medicijn innemen?", zh: "这种药应该怎么服用？", en: "How should I take this medicine?" }, { speaker: "B", dutch: "Neem één tablet na het eten.", zh: "饭后服用一片。", en: "Take one tablet after eating." }, { speaker: "A", dutch: "Hoe vaak per dag?", zh: "每天几次？", en: "How many times a day?" }, { speaker: "B", dutch: "Twee keer per dag. Lees ook de bijsluiter.", zh: "每天两次。也请阅读说明书。", en: "Twice a day. Also read the leaflet." }],
    8: [{ speaker: "A", dutch: "Ik heb een afspraak bij de gemeente.", zh: "我和市政厅有预约。", en: "I have an appointment at the municipality." }, { speaker: "B", dutch: "Waarvoor komt u?", zh: "您来办理什么？", en: "What are you here for?" }, { speaker: "A", dutch: "Ik wil mijn nieuwe adres inschrijven.", zh: "我想登记新地址。", en: "I want to register my new address." }, { speaker: "B", dutch: "Laat uw paspoort en dit formulier zien.", zh: "请出示护照和这份表格。", en: "Please show your passport and this form." }],
    9: [{ speaker: "A", dutch: "Er is lekkage in de badkamer.", zh: "浴室漏水了。", en: "There is a leak in the bathroom." }, { speaker: "B", dutch: "Sinds wanneer?", zh: "从什么时候开始的？", en: "Since when?" }, { speaker: "A", dutch: "Sinds gisteren. De verwarming is ook kapot.", zh: "从昨天开始。暖气也坏了。", en: "Since yesterday. The heating is broken too." }, { speaker: "B", dutch: "Ik stuur morgen een monteur.", zh: "我明天派维修师傅过去。", en: "I'll send a repair technician tomorrow." }],
    10: [{ speaker: "A", dutch: "Ik meld mij vandaag ziek.", zh: "我今天请病假。", en: "I am calling in sick today." }, { speaker: "B", dutch: "Bedankt dat u het laat weten.", zh: "谢谢您告知。", en: "Thank you for letting me know." }, { speaker: "A", dutch: "Kunt u mijn rooster controleren?", zh: "您能确认一下我的排班吗？", en: "Could you check my schedule?" }, { speaker: "B", dutch: "Ja. Morgen bel ik u terug.", zh: "好的，我明天给您回电话。", en: "Yes. I'll call you back tomorrow." }],
    11: [{ speaker: "A", dutch: "Ik wil dit graag ruilen.", zh: "我想把这个换掉。", en: "I would like to exchange this." }, { speaker: "B", dutch: "Heeft u de bon?", zh: "您有小票吗？", en: "Do you have the receipt?" }, { speaker: "A", dutch: "Ja, hier is de bon.", zh: "有，这是小票。", en: "Yes, here is the receipt." }, { speaker: "B", dutch: "U kunt het bij de kassa ruilen.", zh: "您可以在收银台办理换货。", en: "You can exchange it at the checkout." }],
    12: [{ speaker: "A", dutch: "Mijn trein heeft vertraging.", zh: "我的火车晚点了。", en: "My train is delayed." }, { speaker: "B", dutch: "U moet in Leiden overstappen.", zh: "您需要在莱顿换乘。", en: "You have to change trains in Leiden." }, { speaker: "A", dutch: "Hoe laat komt de trein aan?", zh: "火车几点到？", en: "What time does the train arrive?" }, { speaker: "B", dutch: "Ongeveer tien minuten later.", zh: "大约晚十分钟。", en: "About ten minutes later." }],
    13: [{ speaker: "A", dutch: "Wanneer moet ik deze rekening betalen?", zh: "我什么时候要付这张账单？", en: "When do I have to pay this bill?" }, { speaker: "B", dutch: "Voor 30 oktober.", zh: "10 月 30 日之前。", en: "Before 30 October." }, { speaker: "A", dutch: "Ik heb gisteren al betaald.", zh: "我昨天已经付过了。", en: "I already paid yesterday." }, { speaker: "B", dutch: "Dan controleren we de betaling.", zh: "那我们会核实这笔付款。", en: "Then we will check the payment." }],
    14: [{ speaker: "A", dutch: "Hoe begint u een formele e-mail?", zh: "正式邮件怎么开头？", en: "How do you start a formal email?" }, { speaker: "B", dutch: "Met: Beste meneer/mevrouw.", zh: "可以写：尊敬的先生/女士。", en: "With: Dear Sir/Madam." }, { speaker: "A", dutch: "En hoe sluit ik af?", zh: "结尾怎么写？", en: "And how do I close it?" }, { speaker: "B", dutch: "Met vriendelijke groet.", zh: "可以写：此致。", en: "With kind regards." }],
    15: [{ speaker: "A", dutch: "Ik ben niet tevreden over de reparatie.", zh: "我对这次维修不满意。", en: "I am not satisfied with the repair." }, { speaker: "B", dutch: "Wat is er precies mis?", zh: "具体哪里有问题？", en: "What exactly is wrong?" }, { speaker: "A", dutch: "De verwarming werkt nog steeds niet.", zh: "暖气还是不能用。", en: "The heating still does not work." }, { speaker: "B", dutch: "Ik laat het opnieuw controleren.", zh: "我会安排再次检查。", en: "I will have it checked again." }],
    16: [{ speaker: "A", dutch: "Goedemorgen, u spreekt met Lin Chen.", zh: "早上好，我是 Lin Chen。", en: "Good morning, this is Lin Chen speaking." }, { speaker: "B", dutch: "Kunt u uw achternaam spellen?", zh: "您能拼一下您的姓吗？", en: "Could you spell your surname?" }, { speaker: "A", dutch: "C-H-E-N.", zh: "C-H-E-N。", en: "C-H-E-N." }, { speaker: "B", dutch: "Dank u. Ik bevestig de afspraak per e-mail.", zh: "谢谢。我会通过电子邮件确认预约。", en: "Thank you. I will confirm the appointment by email." }],
    17: [{ speaker: "A", dutch: "Hebt u de brief ontvangen?", zh: "您收到那封信了吗？", en: "Have you received the letter?" }, { speaker: "B", dutch: "Ja, ik heb hem gisteren gekregen.", zh: "收到了，我昨天收到的。", en: "Yes, I got it yesterday." }, { speaker: "A", dutch: "En bent u naar de gemeente gegaan?", zh: "您去市政厅了吗？", en: "And did you go to the municipality?" }, { speaker: "B", dutch: "Ja, ik ben vorige week gegaan.", zh: "去了，我上周去的。", en: "Yes, I went last week." }],
    18: [{ speaker: "A", dutch: "Waarom kunt u niet komen?", zh: "您为什么不能来？", en: "Why can't you come?" }, { speaker: "B", dutch: "Omdat ik ziek ben.", zh: "因为我病了。", en: "Because I am ill." }, { speaker: "A", dutch: "Wilt u een nieuwe afspraak?", zh: "您想重新预约吗？", en: "Would you like a new appointment?" }, { speaker: "B", dutch: "Ja, liefst morgen in de ochtend.", zh: "想，最好是明天上午。", en: "Yes, preferably tomorrow morning." }],
    19: [{ speaker: "A", dutch: "Ik heb een probleem met mijn rekening.", zh: "我的账单有问题。", en: "I have a problem with my bill." }, { speaker: "B", dutch: "Kunt u uitleggen wat er niet klopt?", zh: "您能说明哪里不对吗？", en: "Could you explain what is incorrect?" }, { speaker: "A", dutch: "Het bedrag is twee keer afgeschreven.", zh: "这笔金额被扣了两次。", en: "The amount was charged twice." }, { speaker: "B", dutch: "Ik controleer het voor u.", zh: "我帮您核实一下。", en: "I will check it for you." }],
    20: [{ speaker: "A", dutch: "Ik heb een brief over mijn verzekering gekregen.", zh: "我收到一封关于保险的信。", en: "I received a letter about my insurance." }, { speaker: "B", dutch: "Wat moet u ermee doen?", zh: "您需要怎么处理？", en: "What do you need to do with it?" }, { speaker: "A", dutch: "Ik moet een formulier invullen en terugsturen.", zh: "我必须填好一份表格并寄回去。", en: "I have to complete and return a form." }, { speaker: "B", dutch: "Kunt u de informatie eerst controleren?", zh: "您能先核对一下信息吗？", en: "Could you check the information first?" }],
  };
  const curatedB1Dialogues: Record<number, Array<{ speaker: "A" | "B"; dutch: string; zh: string; en: string }>> = {
    1: [{ speaker: "A", dutch: "Wat vraagt de opdracht?", zh: "任务要求做什么？", en: "What does the assignment ask?" }, { speaker: "B", dutch: "Je moet de tekst lezen en je mening geven.", zh: "你要读这篇文章并表达看法。", en: "You have to read the text and give your opinion." }, { speaker: "A", dutch: "Moet ik ook een voorbeeld geven?", zh: "我还需要举例吗？", en: "Do I also need to give an example?" }, { speaker: "B", dutch: "Ja, leg je antwoord kort uit.", zh: "需要，简短解释你的答案。", en: "Yes, briefly explain your answer." }],
    2: [{ speaker: "A", dutch: "Wat is het hoofdpunt van deze tekst?", zh: "这篇文章的重点是什么？", en: "What is the main point of this text?" }, { speaker: "B", dutch: "De cursus begint volgende maand.", zh: "课程下个月开始。", en: "The course starts next month." }, { speaker: "A", dutch: "Waar staat dat precies?", zh: "具体在哪里写着？", en: "Where exactly does it say that?" }, { speaker: "B", dutch: "In de laatste alinea.", zh: "在最后一段。", en: "In the final paragraph." }],
    3: [{ speaker: "A", dutch: "Wat moeten we eerst doen?", zh: "我们首先要做什么？", en: "What do we need to do first?" }, { speaker: "B", dutch: "Eerst controleren we de formulieren.", zh: "我们先检查表格。", en: "First, we check the forms." }, { speaker: "A", dutch: "En wie controleert de gegevens?", zh: "谁来核对信息？", en: "And who checks the details?" }, { speaker: "B", dutch: "Fatima doet dat voor de deadline.", zh: "Fatima 会在截止日期前完成。", en: "Fatima will do that before the deadline." }],
    4: [{ speaker: "A", dutch: "Wat staat er over mijn werktijd in het contract?", zh: "合同里关于我的工时是怎么写的？", en: "What does the contract say about my working hours?" }, { speaker: "B", dutch: "U werkt 32 uur per week.", zh: "您每周工作 32 小时。", en: "You work 32 hours a week." }, { speaker: "A", dutch: "En wanneer krijg ik mijn salaris?", zh: "我什么时候领工资？", en: "And when will I receive my salary?" }, { speaker: "B", dutch: "Dat staat in artikel vier.", zh: "第四条里有说明。", en: "That is stated in section four." }],
    5: [{ speaker: "A", dutch: "Kan ik vrijdag vrij nemen?", zh: "我星期五可以请假吗？", en: "Can I take Friday off?" }, { speaker: "B", dutch: "Waarom heeft u verlof nodig?", zh: "您为什么需要请假？", en: "Why do you need leave?" }, { speaker: "A", dutch: "Ik heb een afspraak in het ziekenhuis. Ik kan maandag werken.", zh: "我有医院预约。我星期一可以上班。", en: "I have a hospital appointment. I can work on Monday." }, { speaker: "B", dutch: "Ik bespreek het met de leidinggevende.", zh: "我会和主管商量。", en: "I will discuss it with the manager." }],
    6: [{ speaker: "A", dutch: "Waarom solliciteert u naar deze functie?", zh: "您为什么申请这个职位？", en: "Why are you applying for this position?" }, { speaker: "B", dutch: "Ik heb ervaring met klanten helpen.", zh: "我有帮助顾客的经验。", en: "I have experience helping customers." }, { speaker: "A", dutch: "Wanneer bent u beschikbaar?", zh: "您什么时候可以上班？", en: "When are you available?" }, { speaker: "B", dutch: "Ik kan volgende maand beginnen.", zh: "我下个月可以开始。", en: "I can start next month." }],
    7: [{ speaker: "A", dutch: "Kunt u een voorbeeld van samenwerken geven?", zh: "您能举一个合作的例子吗？", en: "Can you give an example of teamwork?" }, { speaker: "B", dutch: "Ik heb een nieuwe collega ingewerkt.", zh: "我带过一位新同事。", en: "I trained a new colleague." }, { speaker: "A", dutch: "Wat hebt u daarvan geleerd?", zh: "您从中学到了什么？", en: "What did you learn from that?" }, { speaker: "B", dutch: "Ik heb geleerd om duidelijk uit te leggen.", zh: "我学会了如何清楚地解释。", en: "I learned to explain things clearly." }],
    8: [{ speaker: "A", dutch: "Ik begrijp de opdracht niet helemaal.", zh: "我不太明白这个作业。", en: "I do not fully understand the assignment." }, { speaker: "B", dutch: "Welk deel is onduidelijk?", zh: "哪一部分不清楚？", en: "Which part is unclear?" }, { speaker: "A", dutch: "Ik weet niet hoe ik het verslag moet beginnen.", zh: "我不知道该怎么开始写报告。", en: "I do not know how to start the report." }, { speaker: "B", dutch: "Laten we de opdracht samen bekijken.", zh: "我们一起看看作业要求吧。", en: "Let's look at the assignment together." }],
    9: [{ speaker: "A", dutch: "Hoe gaat je stage?", zh: "你的实习怎么样？", en: "How is your internship going?" }, { speaker: "B", dutch: "Goed. Mijn begeleider gaf feedback op mijn gesprekken.", zh: "挺好的。指导老师反馈了我的沟通情况。", en: "Well. My supervisor gave feedback on my conversations." }, { speaker: "A", dutch: "Wat wil je verbeteren?", zh: "你想改进什么？", en: "What do you want to improve?" }, { speaker: "B", dutch: "Ik wil duidelijker vragen stellen.", zh: "我想把问题问得更清楚。", en: "I want to ask clearer questions." }],
    10: [{ speaker: "A", dutch: "Wie controleert de planning?", zh: "谁来检查计划？", en: "Who checks the schedule?" }, { speaker: "B", dutch: "Ik ben daarvoor verantwoordelijk.", zh: "这件事由我负责。", en: "I am responsible for that." }, { speaker: "A", dutch: "Wanneer is de deadline?", zh: "截止日期是什么时候？", en: "When is the deadline?" }, { speaker: "B", dutch: "We hebben afgesproken dat ik het vrijdag verstuur.", zh: "我们约定由我星期五发送。", en: "We agreed that I would send it on Friday." }],
    11: [{ speaker: "A", dutch: "Mag ik deze machine gebruiken?", zh: "我可以使用这台机器吗？", en: "May I use this machine?" }, { speaker: "B", dutch: "Eerst moet u de veiligheidsinstructies lezen.", zh: "您必须先阅读安全说明。", en: "First, you have to read the safety instructions." }, { speaker: "A", dutch: "Moet ik veiligheidsschoenen dragen?", zh: "我必须穿安全鞋吗？", en: "Do I have to wear safety shoes?" }, { speaker: "B", dutch: "Ja, dat is verplicht.", zh: "是的，这是强制要求。", en: "Yes, that is compulsory." }],
    12: [{ speaker: "A", dutch: "Volgens mij moeten we een extra les plannen.", zh: "我认为我们应该安排一节额外课程。", en: "I think we should schedule an extra class." }, { speaker: "B", dutch: "Ik begrijp uw punt, maar woensdag is voor mij lastig.", zh: "我理解您的想法，但星期三我不太方便。", en: "I understand your point, but Wednesday is difficult for me." }, { speaker: "A", dutch: "Welke dag past u wel?", zh: "那您哪天方便？", en: "Which day does suit you?" }, { speaker: "B", dutch: "Donderdag zou een goed compromis zijn.", zh: "星期四会是一个不错的折中方案。", en: "Thursday would be a good compromise." }],
    13: [{ speaker: "A", dutch: "Waarom is de vergadering later begonnen?", zh: "会议为什么晚开始了？", en: "Why did the meeting start late?" }, { speaker: "B", dutch: "De trein had vertraging. Daardoor kwam ik later aan.", zh: "火车晚点了，所以我到得晚。", en: "The train was delayed. As a result, I arrived late." }, { speaker: "A", dutch: "Hebt u de groep geïnformeerd?", zh: "您通知大家了吗？", en: "Did you inform the group?" }, { speaker: "B", dutch: "Ja, hoewel ik weinig tijd had.", zh: "通知了，虽然我时间不多。", en: "Yes, although I had little time." }],
    14: [{ speaker: "A", dutch: "Wat vraagt de brief van mij?", zh: "这封信要求我做什么？", en: "What does the letter ask me to do?" }, { speaker: "B", dutch: "U moet het bewijs voor 30 oktober indienen.", zh: "您必须在 10 月 30 日前提交证明。", en: "You must submit the evidence before 30 October." }, { speaker: "A", dutch: "Waar kan ik het formulier vinden?", zh: "我在哪里能找到表格？", en: "Where can I find the form?" }, { speaker: "B", dutch: "Het formulier zit als bijlage bij de brief.", zh: "表格作为附件附在信里。", en: "The form is attached to the letter." }],
    15: [{ speaker: "A", dutch: "Waarom maakt u bezwaar tegen het besluit?", zh: "您为什么对这项决定提出异议？", en: "Why are you objecting to the decision?" }, { speaker: "B", dutch: "Mijn inkomen is verkeerd berekend.", zh: "我的收入计算错了。", en: "My income was calculated incorrectly." }, { speaker: "A", dutch: "Hebt u daar bewijs van?", zh: "您有相关证明吗？", en: "Do you have evidence of that?" }, { speaker: "B", dutch: "Ja, ik stuur de loonstroken mee.", zh: "有，我会附上工资单。", en: "Yes, I will include the payslips." }],
    16: [{ speaker: "A", dutch: "Ik kan niet inloggen op de website.", zh: "我无法登录网站。", en: "I cannot log in to the website." }, { speaker: "B", dutch: "Krijgt u een foutmelding?", zh: "您会看到错误提示吗？", en: "Do you get an error message?" }, { speaker: "A", dutch: "Ja, nadat ik het bestand upload.", zh: "会，在我上传文件之后。", en: "Yes, after I upload the file." }, { speaker: "B", dutch: "Kunt u een schermafbeelding meesturen?", zh: "您能附上一张截图吗？", en: "Could you attach a screenshot?" }],
    17: [{ speaker: "A", dutch: "Mijn inkomen is veranderd.", zh: "我的收入变了。", en: "My income has changed." }, { speaker: "B", dutch: "Hebt u de wijziging al doorgegeven?", zh: "您已经报告这项变更了吗？", en: "Have you reported the change yet?" }, { speaker: "A", dutch: "Nog niet. Heb ik recht op huurtoeslag?", zh: "还没有。我有资格领取房租补贴吗？", en: "Not yet. Am I entitled to housing benefit?" }, { speaker: "B", dutch: "Dat hangt af van uw inkomen en woonsituatie.", zh: "这取决于您的收入和居住情况。", en: "That depends on your income and living situation." }],
    18: [{ speaker: "A", dutch: "Mijn klachten zijn erger geworden.", zh: "我的症状加重了。", en: "My symptoms have got worse." }, { speaker: "B", dutch: "Sinds wanneer merkt u dat?", zh: "您从什么时候开始注意到的？", en: "Since when have you noticed that?" }, { speaker: "A", dutch: "Sinds gisteren. Ik wil de uitslag ook bespreken.", zh: "从昨天开始。我也想讨论一下检查结果。", en: "Since yesterday. I would also like to discuss the test results." }, { speaker: "B", dutch: "Ik maak een afspraak voor u.", zh: "我来帮您安排预约。", en: "I will make an appointment for you." }],
    19: [{ speaker: "A", dutch: "De reparatie is na twee weken nog niet uitgevoerd.", zh: "两周过去了，维修还是没有完成。", en: "The repair has still not been carried out after two weeks." }, { speaker: "B", dutch: "Hebt u al contact opgenomen met de verhuurder?", zh: "您联系过房东了吗？", en: "Have you contacted the landlord yet?" }, { speaker: "A", dutch: "Ja, maar ik heb nog geen reactie gekregen.", zh: "联系了，但我还没有收到回复。", en: "Yes, but I have not received a reply yet." }, { speaker: "B", dutch: "Dan kunt u een formele klacht indienen.", zh: "那么您可以提交正式投诉。", en: "Then you can file a formal complaint." }],
    20: [{ speaker: "A", dutch: "Waarom rijdt er geen trein naar Den Haag?", zh: "为什么没有开往海牙的火车？", en: "Why is there no train to The Hague?" }, { speaker: "B", dutch: "Er zijn werkzaamheden aan het spoor.", zh: "铁路正在施工。", en: "There is work being done on the tracks." }, { speaker: "A", dutch: "Is er vervangend vervoer?", zh: "有替代交通吗？", en: "Is there replacement transport?" }, { speaker: "B", dutch: "Ja, er rijdt een bus vanaf het station.", zh: "有，车站有公交车发车。", en: "Yes, a bus leaves from the station." }],
    21: [{ speaker: "A", dutch: "Het product is beschadigd aangekomen.", zh: "商品送到时已经损坏。", en: "The product arrived damaged." }, { speaker: "B", dutch: "Wanneer hebt u het gekocht?", zh: "您是什么时候买的？", en: "When did you buy it?" }, { speaker: "A", dutch: "Vorige week. Ik heb de bon bij me.", zh: "上周。我带着小票。", en: "Last week. I have the receipt with me." }, { speaker: "B", dutch: "Dan kunnen we het omruilen of uw geld terugstorten.", zh: "那么我们可以给您换货或退款。", en: "Then we can exchange it or refund your money." }],
    22: [{ speaker: "A", dutch: "Heb ik toestemming nodig voor deze verbouwing?", zh: "这次装修需要许可吗？", en: "Do I need permission for this renovation?" }, { speaker: "B", dutch: "Dat hangt af van de regels in uw gemeente.", zh: "这取决于您所在市政厅的规定。", en: "That depends on the rules in your municipality." }, { speaker: "A", dutch: "Waar kan ik dat controleren?", zh: "我在哪里可以查询？", en: "Where can I check that?" }, { speaker: "B", dutch: "Op de website van de gemeente.", zh: "在市政厅的网站上。", en: "On the municipality's website." }],
    23: [{ speaker: "A", dutch: "Kom je naar de bijeenkomst over verkeersveiligheid?", zh: "你会来参加交通安全会议吗？", en: "Are you coming to the meeting about road safety?" }, { speaker: "B", dutch: "Ja. Ik maak mij zorgen over het verkeer in onze buurt.", zh: "会。我担心我们社区的交通状况。", en: "Yes. I am concerned about traffic in our neighbourhood." }, { speaker: "A", dutch: "Heb je een voorstel?", zh: "你有什么建议吗？", en: "Do you have a proposal?" }, { speaker: "B", dutch: "Mijn voorstel is om een veilig fietspad aan te leggen.", zh: "我建议修建一条安全的自行车道。", en: "My proposal is to build a safe cycle path." }],
    24: [{ speaker: "A", dutch: "Wat is het probleem volgens de brief?", zh: "信里提到的问题是什么？", en: "What is the problem according to the letter?" }, { speaker: "B", dutch: "De aanvraag is afgewezen omdat een bewijs ontbreekt.", zh: "申请被拒了，因为缺少一份证明。", en: "The application was rejected because evidence is missing." }, { speaker: "A", dutch: "Wat stelt u voor?", zh: "您建议怎么做？", en: "What do you suggest?" }, { speaker: "B", dutch: "Ik verzoek u om de aanvraag opnieuw te beoordelen.", zh: "我请求您重新审核申请。", en: "I request that you review the application again." }],
  };
  const dialogueOverride = plan.level === "A0"
    ? curatedA0Dialogues[plan.order]
    : plan.level === "A1"
      ? curatedA1Dialogues[plan.order]
      : plan.level === "A2"
        ? curatedA2Dialogues[plan.order]
        : plan.level === "B1"
          ? curatedB1Dialogues[plan.order]
      : undefined;
  const defaultOutputLines = repeatLines.slice(0, 3);
  const curatedA1Outputs: Record<number, { dutch: string; zh: string; en: string }> = {
    1: { dutch: "Mijn naam is Lin. Ik ben vijfentwintig jaar. Mijn adres is Langestraat 12. Mijn telefoonnummer is 06-12345678.", zh: "我叫 Lin，二十五岁。我的地址是 Langestraat 12 号，电话号码是 06-12345678。", en: "My name is Lin. I am twenty-five. My address is 12 Langestraat, and my phone number is 06-12345678." },
    2: { dutch: "Vandaag is het maandag. Het is drie uur. Mijn afspraak is op vrijdag.", zh: "今天是星期一。现在三点。我星期五有预约。", en: "Today is Monday. It is three o'clock. My appointment is on Friday." },
    5: { dutch: "Ik wil graag brood met kaas. Ik drink thee. Ik vind brood lekker.", zh: "我想要面包和奶酪。我喝茶。我觉得面包很好吃。", en: "I'd like bread with cheese. I drink tea. I like bread." },
    6: { dutch: "Ik zoek brood. Hoeveel kost dit? Drie euro? Dan neem ik het.", zh: "我在找面包。这个多少钱？三欧元吗？那我买这个。", en: "I'm looking for bread. How much is this? Three euros? Then I'll take it." },
    7: { dutch: "Waar is het station? Loop rechtdoor. De trein vertrekt van spoor twee.", zh: "车站在哪里？一直往前走。火车从 2 号轨道发车。", en: "Where is the station? Go straight ahead. The train leaves from track 2." },
    8: { dutch: "Het is koud en het regent. Ik doe mijn jas aan. Mijn trui is blauw.", zh: "天气很冷，还在下雨。我穿上外套。我的毛衣是蓝色的。", en: "It's cold and raining. I put on my coat. My sweater is blue." },
    13: { dutch: "Ik vind fietsen leuk. Ik vind regen niet leuk. Ik wil liever thee dan koffie.", zh: "我喜欢骑自行车，不喜欢下雨。我更想喝茶，不想喝咖啡。", en: "I like cycling, but I don't like rain. I'd rather have tea than coffee." },
    15: { dutch: "Ik wil twee kilo appels. Dat kost vijf euro. Kan ik pinnen? Mag ik de bon?", zh: "我想要两公斤苹果，一共五欧元。我可以刷卡吗？可以给我小票吗？", en: "I'd like two kilos of apples. That costs five euros. Can I pay by debit card? May I have the receipt?" },
    16: { dutch: "Goedemorgen, ik bel voor een afspraak. Kunt u dat herhalen? Een moment, alstublieft. Ik bel later terug.", zh: "早上好，我打电话来预约。您能重复一下吗？请稍等。我晚点再打来。", en: "Good morning, I'm calling to make an appointment. Could you repeat that? One moment, please. I'll call back later." },
    17: { dutch: "Ik zoek een kaartje naar Amsterdam. Waar is de kassa? Van welk spoor vertrekt de trein? Ik betaal met mijn pinpas.", zh: "我想买一张去 Amsterdam 的票。售票处在哪里？火车从几号轨道发车？我用银行卡付款。", en: "I'm looking for a ticket to Amsterdam. Where is the ticket counter? Which track does the train leave from? I'll pay with my debit card." },
    18: { dutch: "Ik woon in Delft en ik werk in Amsterdam. Ik ga met de trein naar mijn werk. In mijn vrije tijd vind ik fietsen leuk.", zh: "我住在 Delft，在 Amsterdam 工作。我坐火车上班。空闲时我喜欢骑自行车。", en: "I live in Delft and work in Amsterdam. I take the train to work. In my free time, I like cycling." },
  };
  const a1Output = plan.level === "A1" ? curatedA1Outputs[plan.order] : undefined;
  const curatedA2Outputs: Record<number, { dutch: string; zh: string; en: string }> = {
    1: { dutch: "Ik lees eerst de vraag. Daarna luister ik naar de informatie. Dan schrijf ik een kort antwoord.", zh: "我先读题目，然后听相关信息，最后写一个简短的答案。", en: "I read the question first. Then I listen to the information. Finally, I write a short answer." },
    2: { dutch: "Mijn voornaam is Lin en mijn achternaam is Chen. Mijn geboortedatum is 12 mei 1998. Waar moet ik mijn handtekening zetten?", zh: "我的名字是 Lin，姓 Chen。我的出生日期是 1998 年 5 月 12 日。我应该在哪里签名？", en: "My first name is Lin and my surname is Chen. My date of birth is 12 May 1998. Where should I sign?" },
    3: { dutch: "Ik heb een brief ontvangen. De afspraak is maandag om tien uur. Ik moet mijn paspoort en een kopie meenemen.", zh: "我收到了一封信。预约在星期一上午十点。我必须带上护照和一份复印件。", en: "I received a letter. The appointment is Monday at ten. I have to bring my passport and a copy." },
    4: { dutch: "Ik heb een voicemail ontvangen. De afspraak is morgen om elf uur. Kunt u dat herhalen?", zh: "我收到了一条语音留言。预约在明天十一点。您能重复一遍吗？", en: "I received a voicemail. The appointment is tomorrow at eleven. Could you repeat that?" },
    5: { dutch: "Ik wil mijn afspraak verzetten. Dat tijdstip schikt mij niet. Kan het donderdag om twee uur?", zh: "我想改一下预约时间。那个时间我不方便。可以改到星期四两点吗？", en: "I would like to reschedule my appointment. That time does not suit me. Could we do Thursday at two?" },
    6: { dutch: "Ik bel voor een afspraak met de huisarts. Ik heb sinds gisteren hoofdpijn. Wanneer kan ik langskomen?", zh: "我打电话来预约家庭医生。我从昨天开始头疼。我什么时候可以过去？", en: "I am calling to make an appointment with the GP. I have had a headache since yesterday. When can I come in?" },
    7: { dutch: "Hoe moet ik dit medicijn gebruiken? Moet ik het voor of na het eten innemen? Ik lees ook de bijsluiter.", zh: "这种药应该怎么用？我应该饭前还是饭后服用？我也会阅读说明书。", en: "How should I use this medicine? Should I take it before or after eating? I will also read the leaflet." },
    8: { dutch: "Ik heb een afspraak bij de gemeente. Ik wil mijn nieuwe adres inschrijven. Kunt u mij helpen met dit document?", zh: "我和市政厅有预约。我想登记新地址。您能帮我处理这份文件吗？", en: "I have an appointment at the municipality. I want to register my new address. Could you help me with this document?" },
    9: { dutch: "De huur is achthonderd euro per maand. Er is lekkage in de badkamer. Kunt u een monteur sturen?", zh: "房租每月八百欧元。浴室漏水了。您能派一位维修师傅来吗？", en: "The rent is eight hundred euros per month. There is a leak in the bathroom. Could you send a repair technician?" },
    10: { dutch: "Ik meld mij vandaag ziek. Kunt u mijn rooster controleren? Morgen bel ik u weer.", zh: "我今天请病假。您能确认一下我的排班表吗？我明天再给您打电话。", en: "I am calling in sick today. Could you check my schedule? I will call you again tomorrow." },
    11: { dutch: "Ik heb een vraag over de bon. Kan ik pinnen? Ik wil dit artikel graag ruilen.", zh: "我有一个关于小票的问题。我可以用银行卡付款吗？我想换掉这件商品。", en: "I have a question about the receipt. Can I pay by debit card? I would like to exchange this item." },
    12: { dutch: "Mijn trein heeft twintig minuten vertraging. Waar moet ik overstappen? Ik kom ongeveer tien minuten later.", zh: "我的火车晚点二十分钟。我应该在哪里换乘？我大约会晚到十分钟。", en: "My train is delayed by twenty minutes. Where do I have to change trains? I will arrive about ten minutes late." },
    13: { dutch: "Wanneer moet ik deze rekening betalen? Ik heb gisteren al betaald. Wordt dit vergoed door mijn zorgverzekering?", zh: "我什么时候要付这张账单？我昨天已经付过了。这笔费用能由我的医疗保险报销吗？", en: "When do I have to pay this bill? I already paid yesterday. Is this reimbursed by my health insurance?" },
    14: { dutch: "Beste meneer/mevrouw, Ik schrijf u omdat ik mijn afspraak wil verzetten. Kunt u mij een nieuwe datum sturen? Met vriendelijke groet, Lin Chen", zh: "尊敬的先生/女士：我写信给您，是因为我想改预约时间。您能给我一个新的日期吗？此致，Lin Chen", en: "Dear Sir/Madam, I am writing because I would like to reschedule my appointment. Could you send me a new date? Kind regards, Lin Chen" },
    15: { dutch: "Ik ben niet tevreden over de reparatie. De verwarming werkt nog steeds niet. Kunt u controleren of dit klopt en het probleem oplossen?", zh: "我对这次维修不满意。暖气还是不能用。您能核实一下并解决这个问题吗？", en: "I am not satisfied with the repair. The heating still does not work. Could you check this and solve the problem?" },
    16: { dutch: "Goedemorgen, u spreekt met Lin Chen. Kunt u uw achternaam spellen? Dank u. Kunt u de afspraak per e-mail bevestigen?", zh: "早上好，我是 Lin Chen。您能拼一下您的姓氏吗？谢谢。您能通过电子邮件确认预约吗？", en: "Good morning, this is Lin Chen speaking. Could you spell your surname? Thank you. Could you confirm the appointment by email?" },
    17: { dutch: "Ik heb gisteren een brief gekregen. Ik heb online een afspraak gemaakt. Vorige week ben ik naar de gemeente gegaan.", zh: "我昨天收到了一封信。我在网上预约了。上周我去了市政厅。", en: "I received a letter yesterday. I made an appointment online. I went to the municipality last week." },
    18: { dutch: "Ik kan niet komen omdat ik ziek ben. Ik bel later, want mijn trein heeft vertraging. Ik wil liever morgen een afspraak.", zh: "我不能来，因为我病了。我晚点打电话，因为我的火车晚点了。我更想约在明天。", en: "I cannot come because I am ill. I will call later because my train is delayed. I would prefer an appointment tomorrow." },
    19: { dutch: "Goedemorgen, ik heb een probleem met mijn rekening. Kunt u mij helpen? Het bedrag is twee keer afgeschreven. Kunt u dat controleren?", zh: "早上好，我的账单有问题。您能帮我吗？这笔金额被扣了两次。您能核实一下吗？", en: "Good morning, I have a problem with my bill. Could you help me? The amount was charged twice. Could you check that?" },
    20: { dutch: "Ik heb een brief over mijn verzekering gekregen. Ik moet een formulier invullen en terugsturen. Ik schrijf u omdat ik een vraag heb. Kunt u de informatie bevestigen?", zh: "我收到一封关于保险的信。我必须填好一份表格并寄回去。我写信给您是因为我有一个问题。您能确认一下这些信息吗？", en: "I received a letter about my insurance. I have to complete and return a form. I am writing because I have a question. Could you confirm the information?" },
  };
  const curatedB1Outputs: Record<number, { dutch: string; zh: string; en: string }> = {
    1: { dutch: "Ik lees eerst wat de taak vraagt. Deze situatie gaat over werk. Ik moet de informatie begrijpen en kort uitleggen wat ik ervan vind.", zh: "我先读清楚任务要求。这个情境和工作有关。我需要理解信息，并简短说明自己的看法。", en: "I first read what the task asks. This situation is about work. I need to understand the information and briefly explain my opinion." },
    2: { dutch: "Het hoofdpunt van de tekst is dat de cursus volgende maand begint. De schrijver legt uit hoe deelnemers zich kunnen aanmelden. Aanmelden kan tot 30 oktober.", zh: "文章的重点是课程下个月开始。作者介绍了参加者如何报名。报名截止到 10 月 30 日。", en: "The main point is that the course starts next month. The writer explains how participants can register. Registration is open until 30 October." },
    3: { dutch: "Eerst moeten we de formulieren controleren. Daarna verdelen we de taken. Fatima controleert de gegevens en ik stuur het verslag voor vrijdag op.", zh: "我们先检查表格，然后分配任务。Fatima 核对信息，我在星期五前发送报告。", en: "First, we have to check the forms. Then we divide the tasks. Fatima checks the details, and I send the report before Friday." },
    4: { dutch: "Mijn functie is administratief medewerker. In het contract staat dat ik 32 uur per week werk. Ik wil graag weten wanneer mijn proeftijd eindigt.", zh: "我的职位是行政助理。合同上写着我每周工作 32 小时。我想了解试用期何时结束。", en: "My position is administrative assistant. The contract says I work 32 hours a week. I would like to know when my trial period ends." },
    5: { dutch: "Ik wil graag vrijdag verlof aanvragen, omdat ik een afspraak in het ziekenhuis heb. Ik kan mijn dienst eventueel maandag inhalen. Kunt u laten weten of dat mogelijk is?", zh: "我想申请星期五休假，因为我有医院预约。如有需要，我可以星期一补班。您能告知这样是否可行吗？", en: "I would like to request Friday off because I have a hospital appointment. I can make up my shift on Monday if necessary. Could you let me know if that is possible?" },
    6: { dutch: "Ik wil solliciteren naar de functie van verzorgende. Ik heb ervaring met ouderen helpen en ik kan goed samenwerken. In mijn cv staat meer informatie over mijn opleiding.", zh: "我想申请护理员职位。我有照顾老年人的经验，也善于合作。我的简历里有更多关于教育经历的信息。", en: "I want to apply for the care assistant position. I have experience helping older people and work well with others. My CV has more information about my education." },
    7: { dutch: "Een voorbeeld uit mijn werk is dat ik een nieuwe collega heb ingewerkt. Ik luister goed en kan duidelijk uitleggen. Ik wil mij verder ontwikkelen door een cursus te volgen.", zh: "我工作中的一个例子是带过一位新同事。我善于倾听，也能清楚地解释。我想通过参加课程继续提升自己。", en: "One example from my work is that I trained a new colleague. I listen well and can explain things clearly. I want to develop further by taking a course." },
    8: { dutch: "Ik volg een opleiding tot verpleegkundige. Ik moet mijn opdracht vrijdag voor vijf uur inleveren. Ik heb hulp nodig bij het schrijven van mijn verslag.", zh: "我正在参加护士培训。我必须在星期五五点前交作业。写报告时我需要帮助。", en: "I am training to become a nurse. I have to hand in my assignment before five on Friday. I need help writing my report." },
    9: { dutch: "Ik loop stage bij een basisschool. Mijn begeleider gaf feedback op mijn gesprekken met leerlingen. Ik wil dit verbeteren door rustiger te spreken en duidelijkere vragen te stellen.", zh: "我在一所小学实习。指导老师反馈了我与学生沟通的情况。我想通过说得更从容、提问更清楚来改进。", en: "I am doing an internship at a primary school. My supervisor gave feedback on my conversations with pupils. I want to improve by speaking more calmly and asking clearer questions." },
    10: { dutch: "We hebben afgesproken dat Sara het verslag vrijdag verstuurt. Ik ben verantwoordelijk voor het controleren van de planning. Het actiepunt voor volgende week is de nieuwe taakverdeling bespreken.", zh: "我们约定由 Sara 在星期五发送报告。我负责检查计划表。下周的行动事项是讨论新的任务分配。", en: "We agreed that Sara will send the report on Friday. I am responsible for checking the schedule. Next week's action item is to discuss the new task assignments." },
    11: { dutch: "Het is verplicht om veiligheidsschoenen te dragen. Controleer eerst of de machine uitstaat. Het is verboden om de beschermkap te verwijderen.", zh: "必须穿安全鞋。先检查机器是否关闭。禁止拆下防护罩。", en: "It is compulsory to wear safety shoes. First check whether the machine is switched off. Removing the safety cover is prohibited." },
    12: { dutch: "Volgens mij is een extra les op woensdag de beste oplossing, omdat veel studenten dan tijd hebben. Ik begrijp dat niet iedereen kan komen, dus donderdag kan ook een compromis zijn.", zh: "我认为星期三加一节课最好，因为很多学生那天有时间。我理解不是每个人都能来，所以星期四也可以作为折中方案。", en: "In my opinion, an extra class on Wednesday is the best solution because many students are available then. I understand not everyone can come, so Thursday could be a compromise." },
    13: { dutch: "De bus had vertraging doordat er werkzaamheden waren. Daardoor kwamen enkele collega's te laat. Hoewel het druk was, begon de vergadering op tijd.", zh: "由于道路施工，公交车晚点了，因此几位同事迟到了。尽管很忙，会议还是准时开始了。", en: "The bus was delayed because there was road work. As a result, some colleagues arrived late. Although it was busy, the meeting started on time." },
    14: { dutch: "Wij hebben uw aanvraag ontvangen. U moet het ontbrekende bewijs voor 30 oktober indienen. De termijn eindigt op die datum. Neem contact met ons op als u vragen hebt.", zh: "我们已收到您的申请。您必须在 10 月 30 日前提交缺少的证明。期限于该日截止。如有问题，请与我们联系。", en: "We have received your application. You must submit the missing evidence before 30 October. The deadline is that day. Contact us if you have questions." },
    15: { dutch: "Ik wil bezwaar maken tegen dit besluit, omdat mijn inkomen verkeerd is berekend. Ik heb de loonstroken als bewijs meegestuurd. Kunt u mijn aanvraag opnieuw bekijken?", zh: "我想对这项决定提出异议，因为我的收入计算有误。我已附上工资单作为证明。您能重新审核我的申请吗？", en: "I want to object to this decision because my income was calculated incorrectly. I have included my payslips as evidence. Could you review my application again?" },
    16: { dutch: "Ik kan niet inloggen met mijn DigiD. Nadat ik het bestand upload, krijg ik een foutmelding. Kunt u controleren of mijn aanvraag toch is ontvangen?", zh: "我无法用 DigiD 登录。上传文件后，我收到一条错误提示。您能确认我的申请是否仍已收到吗？", en: "I cannot log in with my DigiD. After I upload the file, I get an error message. Could you check whether my application was received anyway?" },
    17: { dutch: "Mijn inkomen is veranderd omdat ik meer uren werk. Ik moet deze wijziging doorgeven. Kunt u uitleggen of ik nog recht heb op huurtoeslag?", zh: "我的收入变了，因为我增加了工作时间。我必须报告这项变更。您能说明我是否仍有资格领取房租补贴吗？", en: "My income has changed because I work more hours. I have to report this change. Could you explain whether I am still entitled to housing benefit?" },
    18: { dutch: "Mijn klachten zijn sinds gisteren erger geworden. De huisarts heeft mij naar het ziekenhuis verwezen. Ik wil de uitslag bespreken en weten welke behandeling volgt.", zh: "我的症状从昨天开始加重。家庭医生把我转诊到医院。我想讨论检查结果，并了解接下来要接受什么治疗。", en: "My symptoms have got worse since yesterday. The GP referred me to the hospital. I want to discuss the results and find out what treatment comes next." },
    19: { dutch: "De reparatie is na twee weken nog niet uitgevoerd. Ik heb hierover contact opgenomen met de verhuurder, maar geen reactie gekregen. Kunt u laten weten wanneer de monteur komt?", zh: "两周过去了，维修仍未完成。我为此联系了房东，但没有收到回复。您能告知维修师傅什么时候来吗？", en: "The repair has still not been carried out after two weeks. I contacted the landlord about it but received no reply. Could you let me know when the technician will come?" },
    20: { dutch: "Door werkzaamheden rijdt er dit weekend geen trein tussen Leiden en Den Haag. Er rijdt een vervangende bus vanaf het station. Door de vertraging kom ik later aan.", zh: "由于施工，本周末莱顿和海牙之间没有火车。车站有替代公交车。因为延误，我会晚些到达。", en: "Due to construction, no trains run between Leiden and The Hague this weekend. A replacement bus leaves from the station. Because of the delay, I will arrive later." },
    21: { dutch: "Het product is beschadigd aangekomen. Ik heb het vorige week gekocht en de ruiltermijn is nog niet voorbij. Ik wil graag een nieuw product of mijn geld terug.", zh: "商品送到时已经损坏。我是上周买的，换货期限还没过。我希望换一个新商品或退款。", en: "The product arrived damaged. I bought it last week and the exchange period is not over yet. I would like a replacement or a refund." },
    22: { dutch: "Ik wil een schutting plaatsen en heb toestemming nodig. Kunt u mij vertellen welke vergunning hiervoor nodig is? Ik wil de regels graag volgen.", zh: "我想安装围栏，需要获得许可。您能告诉我需要办理哪种许可证吗？我希望遵守相关规定。", en: "I want to put up a fence and need permission. Could you tell me which permit is required? I want to follow the rules." },
    23: { dutch: "Ik wil deelnemen aan de bijeenkomst over verkeersveiligheid. Ik maak mij zorgen over het vele verkeer in onze buurt. Mijn voorstel is om een veilige oversteekplaats te maken.", zh: "我想参加关于交通安全的会议。我担心社区里车流太大。我的建议是设置一个安全的人行横道。", en: "I want to take part in the meeting about road safety. I am concerned about the heavy traffic in our neighbourhood. My proposal is to create a safe crossing." },
    24: { dutch: "De brief zegt dat mijn aanvraag is afgewezen omdat een bewijs ontbreekt. Ik heb het bewijs nu meegestuurd. Ik verzoek u om de aanvraag opnieuw te beoordelen en mij over het besluit te informeren.", zh: "信中说我的申请因缺少证明而被拒。我现在已附上证明。我请求您重新审核申请，并告知我决定结果。", en: "The letter says my application was rejected because evidence is missing. I have now included the evidence. I request that you review the application again and inform me of the decision." },
  };
  const b1Output = plan.level === "B1" ? curatedB1Outputs[plan.order] : undefined;
  const a2Output = plan.level === "A2" ? curatedA2Outputs[plan.order] : undefined;
  const outputExample = plan.id === "a0-12"
    ? {
        dutch: "Hallo, ik heet Lin. Ik kom uit China en ik woon in Leiden. Ik spreek een beetje Nederlands. Dank je!",
        meaning: lt("你好，我叫 Lin。我来自中国，住在 Leiden。我会说一点荷兰语。谢谢！", "Hi, my name is Lin. I'm from China and I live in Leiden. I speak a little Dutch. Thank you!"),
      }
    : a1Output
      ? { dutch: a1Output.dutch, meaning: lt(a1Output.zh, a1Output.en) }
      : a2Output
        ? { dutch: a2Output.dutch, meaning: lt(a2Output.zh, a2Output.en) }
        : b1Output
          ? { dutch: b1Output.dutch, meaning: lt(b1Output.zh, b1Output.en) }
      : {
        dutch: defaultOutputLines.join(" "),
        meaning: lt(
          defaultOutputLines.map((line) => sentenceMeaning(line, plan).zh).join(" "),
          defaultOutputLines.map((line) => sentenceMeaning(line, plan).en).join(" "),
        ),
      };

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
    microDialogue: dialogueOverride
      ? dialogueOverride.map((line, index) => ({
          speaker: line.speaker,
          ...lessonAudio(plan.id, line.dutch, `dialogue-${index + 1}`),
          meaning: lt(line.zh, line.en),
        }))
      : dialogueLines.map((line, index) => ({
          speaker: index % 2 === 0 ? "A" : "B",
          ...lessonAudio(plan.id, line, `dialogue-${index + 1}`),
          meaning: sentenceMeaning(line, plan),
        })),
    practice: generatedPractice(plan, lessonVocabulary, targetWords, repeatLines),
    speakOutput: {
      task: plan.speakingOutput,
      sampleAnswer: {
        dutch: outputExample.dutch,
        meaning: outputExample.meaning,
        audioText: outputExample.dutch,
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
