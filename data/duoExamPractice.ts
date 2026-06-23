export type LocalizedText = {
  zh: string;
  en: string;
};

export type DuoPracticeKind = "pdf" | "online";
export type DuoPracticeLevel = "A2" | "B1";

export type DuoPracticeAttempt = {
  id: string;
  title: LocalizedText;
  sourceLabel: string;
  url: string;
  kind: DuoPracticeKind;
  durationMinutes?: number;
  focus: LocalizedText[];
};

export type DuoPracticeMiniTask = {
  id: string;
  kindLabel: LocalizedText;
  title: LocalizedText;
  scenario: LocalizedText;
  inputText: string;
  question: LocalizedText;
  sampleDutch?: string;
  sampleMeaning?: LocalizedText;
  answerGuide: LocalizedText;
  checklist: LocalizedText[];
  sourceAlignment: LocalizedText;
};

export type DuoPracticeSection = {
  id: "writing" | "speaking" | "listening" | "reading" | "knm";
  title: LocalizedText;
  dutchTitle: string;
  summary: LocalizedText;
  examFact: LocalizedText;
  attempts: DuoPracticeAttempt[];
  practiceTasks?: DuoPracticeMiniTask[];
};

export type DuoPracticeLevelPack = {
  level: DuoPracticeLevel;
  title: LocalizedText;
  subtitle: LocalizedText;
  status: "ready" | "planned";
  officialLinks: {
    label: string;
    url: string;
  }[];
  emptyState: LocalizedText;
  sections: DuoPracticeSection[];
};

export const duoExamOfficialSources = {
  practicePage: "https://www.inburgeren.nl/examen-doen/oefenen.jsp",
  examContentPage: "https://www.inburgeren.nl/examen-doen/inhoud-taalexamens-a2-b1-b2.jsp",
  b1PracticePortal: "https://nt2-oefenomgeving.facet.onl/facet-openbaar-portaal/",
  b1ExamInfo: "https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit",
};

const a2PracticeSections: DuoPracticeSection[] = [
  {
    id: "writing",
    title: { zh: "写作", en: "Writing" },
    dutchTitle: "Schrijven",
    summary: {
      zh: "打开 DUO 官方写作 PDF，按练习编号进入对应试题资源。",
      en: "Open the official DUO writing PDF resources by practice number.",
    },
    examFact: {
      zh: "A2 写作是纸笔考试：4 个写作任务，40 分钟。",
      en: "A2 Writing is a paper exam: 4 writing tasks in 40 minutes.",
    },
    attempts: [
      {
        id: "writing-1",
        title: { zh: "写作练习 1", en: "Writing practice 1" },
        sourceLabel: "Oefenexamen A2 Schrijven 1",
        url: "https://www.inburgeren.nl/images/oefenexamen-schrijven-1.pdf",
        kind: "pdf",
        durationMinutes: 40,
        focus: [
          { zh: "短信/留言式表达", en: "Short message style" },
          { zh: "表格或个人信息", en: "Form or personal details" },
        ],
      },
      {
        id: "writing-2",
        title: { zh: "写作练习 2", en: "Writing practice 2" },
        sourceLabel: "Oefenexamen A2 Schrijven 2",
        url: "https://www.inburgeren.nl/images/oefenexamen-schrijven-2.pdf",
        kind: "pdf",
        durationMinutes: 40,
        focus: [
          { zh: "简短邮件/说明", en: "Short email or explanation" },
          { zh: "按要求补全信息", en: "Complete requested information" },
        ],
      },
      {
        id: "writing-3",
        title: { zh: "写作练习 3", en: "Writing practice 3" },
        sourceLabel: "Oefenexamen A2 Schrijven 3",
        url: "https://www.inburgeren.nl/images/oefenexamen-schrijven-3.pdf",
        kind: "pdf",
        durationMinutes: 40,
        focus: [
          { zh: "生活事务写作", en: "Daily-life writing" },
          { zh: "清楚表达时间、地点和需求", en: "Clear time, place, and need" },
        ],
      },
    ],
  },
  {
    id: "speaking",
    title: { zh: "口语", en: "Speaking" },
    dutchTitle: "Spreken",
    summary: {
      zh: "打开 DUO 官方口语练习环境，按练习编号进入对应试题。",
      en: "Open the official DUO speaking practice environment by practice number.",
    },
    examFact: {
      zh: "A2 口语在电脑上完成，需要听懂问题并用荷兰语回答，约 35 分钟。",
      en: "A2 Speaking is computer-based: understand questions and answer in Dutch, about 35 minutes.",
    },
    attempts: [
      {
        id: "speaking-1",
        title: { zh: "口语练习 1", en: "Speaking practice 1" },
        sourceLabel: "Oefenexamen Spreken 1",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/DZ66",
        kind: "online",
        durationMinutes: 35,
        focus: [
          { zh: "听问题后直接回答", en: "Answer directly after listening" },
          { zh: "说清楚个人信息和需求", en: "Make personal details and needs clear" },
        ],
      },
      {
        id: "speaking-2",
        title: { zh: "口语练习 2", en: "Speaking practice 2" },
        sourceLabel: "Oefenexamen Spreken 2",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/N94P",
        kind: "online",
        durationMinutes: 35,
        focus: [
          { zh: "日常请求和解释", en: "Daily requests and explanations" },
          { zh: "短句回答，不追求复杂", en: "Short answers, not complex phrasing" },
        ],
      },
      {
        id: "speaking-3",
        title: { zh: "口语练习 3", en: "Speaking practice 3" },
        sourceLabel: "Oefenexamen Spreken 3",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/TKWW",
        kind: "online",
        durationMinutes: 35,
        focus: [
          { zh: "看视频/听问题后作答", en: "Answer after video or audio prompts" },
          { zh: "优先保证意思完整", en: "Prioritize complete meaning" },
        ],
      },
    ],
  },
  {
    id: "listening",
    title: { zh: "听力", en: "Listening" },
    dutchTitle: "Luisteren",
    summary: {
      zh: "打开 DUO 官方听力练习环境，完成官方音频或视频题。",
      en: "Open the official DUO listening practice environment for official audio or video tasks.",
    },
    examFact: {
      zh: "A2 听力在电脑上完成，听文本或看视频回答问题，约 45 分钟。",
      en: "A2 Listening is computer-based: answer questions about audio or videos, about 45 minutes.",
    },
    attempts: [
      {
        id: "listening-1",
        title: { zh: "听力练习 1", en: "Listening practice 1" },
        sourceLabel: "Oefenexamen Luisteren 1",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/NCJ5",
        kind: "online",
        durationMinutes: 45,
        focus: [
          { zh: "数字、时间、地点", en: "Numbers, time, and place" },
          { zh: "听关键词，不逐词翻译", en: "Listen for keywords, not word-for-word translation" },
        ],
      },
      {
        id: "listening-2",
        title: { zh: "听力练习 2", en: "Listening practice 2" },
        sourceLabel: "Oefenexamen Luisteren 2",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/J845",
        kind: "online",
        durationMinutes: 45,
        focus: [
          { zh: "人物关系和场景", en: "People and situations" },
          { zh: "先读题再听", en: "Read the question first" },
        ],
      },
      {
        id: "listening-3",
        title: { zh: "听力练习 3", en: "Listening practice 3" },
        sourceLabel: "Oefenexamen Luisteren 3",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/5QCB",
        kind: "online",
        durationMinutes: 45,
        focus: [
          { zh: "主旨和细节区分", en: "Main idea versus details" },
          { zh: "回听关键词", en: "Replay keywords" },
        ],
      },
    ],
  },
  {
    id: "reading",
    title: { zh: "阅读", en: "Reading" },
    dutchTitle: "Lezen",
    summary: {
      zh: "打开 DUO 官方阅读练习环境，完成官方文本题。",
      en: "Open the official DUO reading practice environment for official text tasks.",
    },
    examFact: {
      zh: "A2 阅读在电脑上完成，需要读文本并回答问题，约 65 分钟。",
      en: "A2 Reading is computer-based: read texts and answer questions, about 65 minutes.",
    },
    attempts: [
      {
        id: "reading-1",
        title: { zh: "阅读练习 1", en: "Reading practice 1" },
        sourceLabel: "Oefenexamen Lezen 1",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/RV5Y",
        kind: "online",
        durationMinutes: 65,
        focus: [
          { zh: "通知、邮件、短文本", en: "Notices, emails, short texts" },
          { zh: "先看题，再找证据", en: "Question first, evidence second" },
        ],
      },
      {
        id: "reading-2",
        title: { zh: "阅读练习 2", en: "Reading practice 2" },
        sourceLabel: "Oefenexamen Lezen 2",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/JJPV",
        kind: "online",
        durationMinutes: 65,
        focus: [
          { zh: "公告和生活信息", en: "Announcements and daily information" },
          { zh: "定位时间、地点、条件", en: "Find time, place, and conditions" },
        ],
      },
      {
        id: "reading-3",
        title: { zh: "阅读练习 3", en: "Reading practice 3" },
        sourceLabel: "Oefenexamen Lezen 3",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/QCA1",
        kind: "online",
        durationMinutes: 65,
        focus: [
          { zh: "问题和文本细节对应", en: "Match questions to text details" },
          { zh: "避免被同形词误导", en: "Avoid being misled by look-alike words" },
        ],
      },
      {
        id: "reading-4",
        title: { zh: "阅读练习 4", en: "Reading practice 4" },
        sourceLabel: "Oefenexamen Lezen 4",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/#/6N1Z",
        kind: "online",
        durationMinutes: 65,
        focus: [
          { zh: "综合阅读练习", en: "Mixed reading practice" },
          { zh: "定位原文证据", en: "Find text evidence" },
        ],
      },
    ],
  },
  {
    id: "knm",
    title: { zh: "荷兰社会知识", en: "Dutch Society Knowledge" },
    dutchTitle: "KNM",
    summary: {
      zh: "打开 DUO 官方 KNM 练习环境，练习荷兰社会知识题。",
      en: "Open the official DUO KNM practice environment for Dutch society knowledge tasks.",
    },
    examFact: {
      zh: "KNM 是荷兰社会知识考试，内容覆盖工作、住房、医疗、市政、学校等日常主题。",
      en: "KNM tests knowledge of Dutch society across daily themes such as work, housing, healthcare, municipality, and school.",
    },
    attempts: [
      {
        id: "knm-1",
        title: { zh: "KNM 练习 1", en: "KNM practice 1" },
        sourceLabel: "Oefenexamen KNM 1",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250ZXh0IjoiVkpNTSJ9.-Qa5IarlRuKR5LjKwnp25UJ0scDIyVcL_OCcK4KjLqw",
        kind: "online",
        focus: [
          { zh: "荷兰生活制度", en: "Dutch daily-life systems" },
          { zh: "工作、住房、医疗等主题", en: "Work, housing, healthcare, and similar themes" },
        ],
      },
      {
        id: "knm-2",
        title: { zh: "KNM 练习 2", en: "KNM practice 2" },
        sourceLabel: "Oefenexamen KNM 2",
        url: "https://oefenexamensduo.optimumassessment.com/spa/assessment-login/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250ZXh0IjoiVlkySyJ9._lDFdnq0xhaSjrxGhvbDaqW4FsBsUREFbHBHxbzdZy4",
        kind: "online",
        focus: [
          { zh: "社会规则和办事场景", en: "Society rules and admin situations" },
          { zh: "常见制度词", en: "Common society words" },
        ],
      },
    ],
  },
];

const b1PortalFocus = {
  officialEnvironment: { zh: "官方练习环境", en: "Official practice environment" },
  programmaI: { zh: "Programma I / B1", en: "Programma I / B1" },
  workStudyLife: { zh: "工作、学习、日常生活", en: "Work, study, daily life" },
};

const b1OfficialAttempt = (
  id: string,
  titleZh: string,
  titleEn: string,
  durationMinutes: number,
  focus: LocalizedText[],
): DuoPracticeAttempt => ({
  id,
  title: { zh: titleZh, en: titleEn },
  sourceLabel: "Staatsexamen Nt2 oefenomgeving",
  url: duoExamOfficialSources.b1PracticePortal,
  kind: "online",
  durationMinutes,
  focus: [b1PortalFocus.officialEnvironment, b1PortalFocus.programmaI, ...focus],
});

const b1PracticeSections: DuoPracticeSection[] = [
  {
    id: "writing",
    title: { zh: "写作", en: "Writing" },
    dutchTitle: "Schrijven",
    summary: {
      zh: "Programma I 写作重点不是写华丽文章，而是在工作、学习和生活事务里把信息写完整、语气写对。",
      en: "Programma I writing is about complete, appropriate messages for work, study, and public-life tasks.",
    },
    examFact: {
      zh: "B1/Programma I 写作 100 分钟。官方说明允许使用 Van Dale NT2 纸质词典，不能用电子工具。",
      en: "B1/Programma I writing lasts 100 minutes. The official instructions allow a Van Dale NT2 paper dictionary, not electronic tools.",
    },
    attempts: [
      b1OfficialAttempt("b1-writing-official", "官方 B1 写作练习入口", "Official B1 writing practice", 100, [
        { zh: "邮件、表格、说明", en: "Email, form, explanation" },
        { zh: "清楚表达原因和请求", en: "State reason and request clearly" },
      ]),
    ],
    practiceTasks: [
      {
        id: "b1-writing-rooster",
        kindLabel: { zh: "写邮件", en: "Email task" },
        title: { zh: "课程时间冲突", en: "Schedule conflict" },
        scenario: {
          zh: "你的 mbo 课程时间和工作排班冲突。写邮件给老师，请求换到另一个小组。",
          en: "Your mbo class conflicts with your work schedule. Email your teacher and ask to join another group.",
        },
        inputText: "Situatie: maandagmiddag heb je les, maar je moet dan werken. Op dinsdagavond is er ook een groep.",
        question: {
          zh: "写 80-120 词：说明问题、提出请求、给出可行时间。",
          en: "Write 80-120 words: explain the problem, make a request, and give a possible time.",
        },
        sampleDutch:
          "Geachte mevrouw De Vries, ik heb een vraag over mijn rooster. Op maandagmiddag moet ik werken, maar dan heb ik ook les. Kan ik misschien naar de groep op dinsdagavond? Die tijd past beter bij mijn werk. Alvast bedankt voor uw reactie. Met vriendelijke groet, Li.",
        sampleMeaning: {
          zh: "正式开头 + 问题 + 具体请求 + 原因 + 礼貌结尾。",
          en: "Formal opening + problem + specific request + reason + polite closing.",
        },
        answerGuide: {
          zh: "B1 目标：句子不必复杂，但信息要齐：wie, wat, waarom, wanneer.",
          en: "B1 target: sentences can be simple, but the message needs who, what, why, and when.",
        },
        checklist: [
          { zh: "有正式称呼和结尾", en: "Use a formal greeting and closing" },
          { zh: "明确写出冲突原因", en: "Name the conflict clearly" },
          { zh: "提出一个具体可执行请求", en: "Make one concrete request" },
        ],
        sourceAlignment: {
          zh: "对齐官方写作：工作/学习场景中的实际书面任务。",
          en: "Aligned with official writing: practical written tasks in work or study contexts.",
        },
      },
      {
        id: "b1-writing-klacht",
        kindLabel: { zh: "投诉/请求", en: "Complaint/request" },
        title: { zh: "商品坏了，要求解决", en: "Product problem" },
        scenario: {
          zh: "你买的耳机两天后坏了。写给 klantenservice，说明情况并提出解决方案。",
          en: "Your headphones broke after two days. Write to customer service and ask for a solution.",
        },
        inputText: "Situatie: aankoopdatum 12 mei, bonnummer 43821, probleem: geen geluid links.",
        question: {
          zh: "写 70-100 词：给购买信息、描述问题、要求换货或退款。",
          en: "Write 70-100 words: give purchase details, describe the problem, and ask for replacement or refund.",
        },
        sampleDutch:
          "Beste klantenservice, op 12 mei heb ik bij u een koptelefoon gekocht. Het bonnummer is 43821. Sinds gisteren doet de linkerkant het niet meer. Ik heb het product pas twee dagen gebruikt. Kunt u mij laten weten of ik een nieuwe koptelefoon krijg of mijn geld terug kan krijgen?",
        sampleMeaning: {
          zh: "购买信息 + 问题 + 使用时间 + 你想要的解决方案。",
          en: "Purchase details + problem + time used + requested solution.",
        },
        answerGuide: {
          zh: "不要只写 Ik ben boos，要写清证据和请求。",
          en: "Do not only write Ik ben boos. Give evidence and a clear request.",
        },
        checklist: [
          { zh: "有日期/订单号/物品", en: "Include date, receipt/order number, item" },
          { zh: "描述故障，不泛泛说不好", en: "Describe the defect specifically" },
          { zh: "提出换货或退款", en: "Ask for replacement or refund" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 公共生活任务：书面投诉和解决问题。",
          en: "Aligned with B1 public-life tasks: written complaint and problem solving.",
        },
      },
      {
        id: "b1-writing-verslag",
        kindLabel: { zh: "简短报告", en: "Short report" },
        title: { zh: "工作交接说明", en: "Work handover note" },
        scenario: {
          zh: "你今天早退，需要给同事写交接：做了什么、还剩什么、谁要继续。",
          en: "You leave work early and need to write a handover note: what is done, what remains, and who continues.",
        },
        inputText: "Situatie: magazijn, levering gecontroleerd, drie dozen ontbreken, manager is gebeld.",
        question: {
          zh: "写 60-90 词：按时间顺序写，避免只列单词。",
          en: "Write 60-90 words in time order; avoid only listing words.",
        },
        sampleDutch:
          "Ik heb de levering van vandaag gecontroleerd. De meeste dozen zijn binnen, maar drie dozen ontbreken nog. Ik heb de manager hierover gebeld en hij neemt contact op met de leverancier. Kun jij morgen controleren of de drie dozen alsnog komen? De lijst ligt op mijn bureau.",
        sampleMeaning: {
          zh: "已完成 + 问题 + 已采取动作 + 请对方继续做什么。",
          en: "Done + problem + action taken + what the other person should do next.",
        },
        answerGuide: {
          zh: "B1 写作要体现逻辑：eerst, daarna, maar, daarom, kun jij...",
          en: "B1 writing needs logic: eerst, daarna, maar, daarom, kun jij...",
        },
        checklist: [
          { zh: "按顺序写清楚", en: "Write in a clear sequence" },
          { zh: "说明剩余问题", en: "Name the remaining issue" },
          { zh: "给出下一步动作", en: "Give the next action" },
        ],
        sourceAlignment: {
          zh: "对齐 Programma I 工作场景和实际书面沟通。",
          en: "Aligned with Programma I work scenarios and practical written communication.",
        },
      },
    ],
  },
  {
    id: "speaking",
    title: { zh: "口语", en: "Speaking" },
    dutchTitle: "Spreken",
    summary: {
      zh: "B1 口语是对着电脑说，不是跟考官聊天。核心是听懂任务后，给出完整、清楚、可执行的回答。",
      en: "B1 speaking is computer-based, not a live interview. The goal is a complete, clear, task-focused response.",
    },
    examFact: {
      zh: "官方说明：Programma I 口语约 25 分钟，戴耳机听题，对着麦克风回答。",
      en: "Official instructions: Programma I speaking takes about 25 minutes; you listen with headphones and answer into a microphone.",
    },
    attempts: [
      b1OfficialAttempt("b1-speaking-official", "官方 B1 口语练习入口", "Official B1 speaking practice", 25, [
        { zh: "短回答和中等长度回答", en: "Short and medium-length responses" },
        { zh: "工作、学习、日常情况", en: "Work, study, daily situations" },
      ]),
    ],
    practiceTasks: [
      {
        id: "b1-speaking-dienst",
        kindLabel: { zh: "短答", en: "Short response" },
        title: { zh: "和同事换班", en: "Swap a shift" },
        scenario: {
          zh: "你星期五不能上班。请同事和你换班，并说明原因。",
          en: "You cannot work on Friday. Ask a colleague to swap shifts and give a reason.",
        },
        inputText: "Opdracht: Vraag uw collega om vrijdag met u te ruilen.",
        question: {
          zh: "20 秒内说：请求 + 原因 + 替代方案。",
          en: "In 20 seconds: request + reason + alternative.",
        },
        sampleDutch:
          "Kun je vrijdag met mij ruilen? Ik heb dan een afspraak bij de gemeente. Ik kan jouw dienst op maandag overnemen.",
        sampleMeaning: {
          zh: "你可以和我换星期五的班吗？我那天有市政厅预约。我可以接你星期一的班。",
          en: "Can you swap Friday with me? I have a municipality appointment. I can take your Monday shift.",
        },
        answerGuide: {
          zh: "口语不要铺垫太久，第一句直接完成任务。",
          en: "Do not spend too long setting context. Complete the task in the first sentence.",
        },
        checklist: [
          { zh: "第一句就是请求", en: "First sentence is the request" },
          { zh: "给一个简短原因", en: "Give one short reason" },
          { zh: "主动给解决方案", en: "Offer a solution" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 口语：实际工作场景、短时作答。",
          en: "Aligned with B1 speaking: practical work situation and timed response.",
        },
      },
      {
        id: "b1-speaking-docent",
        kindLabel: { zh: "解释", en: "Explanation" },
        title: { zh: "作业晚交", en: "Late assignment" },
        scenario: {
          zh: "你不能按时交作业。向老师解释原因，并提出什么时候能交。",
          en: "You cannot submit an assignment on time. Explain why and say when you can submit it.",
        },
        inputText: "Opdracht: Leg uw docent uit waarom u de opdracht later inlevert.",
        question: {
          zh: "30 秒内说：抱歉 + 原因 + 新时间 + 请求确认。",
          en: "In 30 seconds: apology + reason + new time + request for confirmation.",
        },
        sampleDutch:
          "Sorry, ik kan de opdracht vandaag niet inleveren. Mijn computer is kapot en ik kon het bestand niet openen. Ik kan de opdracht morgenochtend sturen. Is dat goed?",
        sampleMeaning: {
          zh: "对不起，我今天不能交作业。电脑坏了，我打不开文件。我明天早上可以发给您。可以吗？",
          en: "Sorry, I cannot submit the assignment today. My computer is broken and I could not open the file. I can send it tomorrow morning. Is that okay?",
        },
        answerGuide: {
          zh: "B1 不是背复杂句，而是把情况和下一步说清。",
          en: "B1 is not about complex sentences. It is about making the situation and next step clear.",
        },
        checklist: [
          { zh: "有礼貌道歉", en: "Apologize politely" },
          { zh: "说明具体原因", en: "Give a specific reason" },
          { zh: "给出新的交付时间", en: "Give the new delivery time" },
        ],
        sourceAlignment: {
          zh: "对齐 Programma I 学习场景和中等长度回答。",
          en: "Aligned with Programma I study contexts and medium-length responses.",
        },
      },
      {
        id: "b1-speaking-mening",
        kindLabel: { zh: "表达意见", en: "Give opinion" },
        title: { zh: "线上课好不好", en: "Online lessons" },
        scenario: {
          zh: "你被问到线上课是否比线下课好。给出你的看法和一个理由。",
          en: "You are asked whether online classes are better than in-person classes. Give your opinion and one reason.",
        },
        inputText: "Opdracht: Wat vindt u van online lessen?",
        question: {
          zh: "30 秒内说：观点 + 理由 + 小例子。",
          en: "In 30 seconds: opinion + reason + small example.",
        },
        sampleDutch:
          "Ik vind online lessen handig, maar niet altijd beter. Je hoeft niet te reizen, dus je bespaart tijd. Maar in de klas kan ik makkelijker vragen stellen.",
        sampleMeaning: {
          zh: "我觉得线上课方便，但不总是更好。不用出行，所以省时间。但在教室里我更容易提问。",
          en: "I think online lessons are convenient, but not always better. You do not need to travel, so you save time. But in class I can ask questions more easily.",
        },
        answerGuide: {
          zh: "用 Ik vind..., want..., maar... 这条骨架就够 B1。",
          en: "The structure Ik vind..., want..., maar... is enough for a B1 answer.",
        },
        checklist: [
          { zh: "清楚给观点", en: "State your opinion clearly" },
          { zh: "至少一个理由", en: "Give at least one reason" },
          { zh: "可以有转折", en: "A contrast is useful" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 口语：学习/日常话题的观点表达。",
          en: "Aligned with B1 speaking: opinion on study or daily-life topics.",
        },
      },
    ],
  },
  {
    id: "listening",
    title: { zh: "听力", en: "Listening" },
    dutchTitle: "Luisteren",
    summary: {
      zh: "B1 听力的声音更接近真实生活：会有重复、停顿、背景音和不同声音。练习时要先读题，再抓任务信息。",
      en: "B1 listening sounds closer to real life, with hesitation, repetition, background sounds, and different voices. Read the question first and listen for task information.",
    },
    examFact: {
      zh: "官方说明：听力约 90 分钟，约 40 题，主题包括工作、学习和荷兰日常生活；每段只能听一次。",
      en: "Official instructions: listening lasts about 90 minutes with about 40 questions on work, study, and daily life; each fragment is played once.",
    },
    attempts: [
      b1OfficialAttempt("b1-listening-official", "官方 B1 听力练习入口", "Official B1 listening practice", 90, [
        { zh: "约 40 道选择题", en: "About 40 multiple-choice questions" },
        { zh: "听前先读题", en: "Read the question first" },
      ]),
    ],
    practiceTasks: [
      {
        id: "b1-listening-voicemail",
        kindLabel: { zh: "听语音留言", en: "Voicemail" },
        title: { zh: "排班改变", en: "Shift change" },
        scenario: {
          zh: "你听到 manager 的语音留言。目标是判断你明天什么时候上班。",
          en: "You hear a voicemail from your manager. Find out when you work tomorrow.",
        },
        inputText:
          "Hoi, met Samira van de planning. Je hoeft morgen niet om acht uur te beginnen. De levering komt later, dus kun je om tien uur starten? Bel mij alleen terug als dat niet lukt.",
        question: {
          zh: "问题：你需要做什么？",
          en: "Question: What do you need to do?",
        },
        answerGuide: {
          zh: "正确方向：明天 10 点开始；只有不行才回电话。",
          en: "Answer direction: start at 10 tomorrow; call back only if that is not possible.",
        },
        checklist: [
          { zh: "听出原时间和新时间", en: "Hear the old and new time" },
          { zh: "注意 alleen als...", en: "Notice alleen als..." },
          { zh: "不要被 levering 分散", en: "Do not get distracted by levering" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 听力：工作场景中的语音留言和具体指令。",
          en: "Aligned with B1 listening: voicemail and concrete instructions at work.",
        },
      },
      {
        id: "b1-listening-school",
        kindLabel: { zh: "听通知", en: "Announcement" },
        title: { zh: "教室临时更换", en: "Room change" },
        scenario: {
          zh: "你听学校前台通知，要找出课程地点和原因。",
          en: "You hear a school reception announcement. Find the classroom and reason.",
        },
        inputText:
          "Let op, de Nederlandse les van groep B1 gaat vandaag niet door in lokaal 2.04. Door onderhoud aan de verwarming is de les verplaatst naar lokaal 1.12.",
        question: {
          zh: "问题：今天去哪个教室？为什么换？",
          en: "Question: Which room today, and why did it change?",
        },
        answerGuide: {
          zh: "正确方向：去 1.12，因为 2.04 暖气维修。",
          en: "Answer direction: go to 1.12 because heating maintenance is happening in 2.04.",
        },
        checklist: [
          { zh: "先听否定：niet in lokaal 2.04", en: "Catch the negative: not room 2.04" },
          { zh: "定位 verplaatst naar", en: "Locate verplaatst naar" },
          { zh: "原因通常跟 door... 之后", en: "The reason often follows door..." },
        ],
        sourceAlignment: {
          zh: "对齐 B1 听力：学习场景、公告、地点变化。",
          en: "Aligned with B1 listening: study setting, announcement, location change.",
        },
      },
      {
        id: "b1-listening-instructie",
        kindLabel: { zh: "听工作指令", en: "Work instruction" },
        title: { zh: "客户投诉处理", en: "Customer complaint" },
        scenario: {
          zh: "你听主管说明客户投诉流程。目标是抓住先做什么、再做什么。",
          en: "You hear a supervisor explain how to handle a customer complaint. Identify the order of actions.",
        },
        inputText:
          "Als een klant klaagt, blijf eerst rustig en luister goed. Noteer daarna de naam en het ordernummer. Pas daarna mag je een oplossing aanbieden of de teamleider erbij halen.",
        question: {
          zh: "问题：正确顺序是什么？",
          en: "Question: What is the correct order?",
        },
        answerGuide: {
          zh: "正确方向：冷静听 -> 记录姓名和订单号 -> 提供解决方案或叫组长。",
          en: "Answer direction: stay calm and listen -> note name and order number -> offer solution or call team leader.",
        },
        checklist: [
          { zh: "抓 eerst / daarna / pas daarna", en: "Catch eerst / daarna / pas daarna" },
          { zh: "不要只听名词，要听顺序词", en: "Listen for sequence words, not only nouns" },
          { zh: "区分方案和求助是最后一步", en: "Solution or help is the final step" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 听力：工作流程说明和排序信息。",
          en: "Aligned with B1 listening: workplace procedure and sequence information.",
        },
      },
    ],
  },
  {
    id: "reading",
    title: { zh: "阅读", en: "Reading" },
    dutchTitle: "Lezen",
    summary: {
      zh: "B1 阅读会读工作、学习和荷兰生活文本。不是逐词翻译，而是判断主题、对象、细节、关系和结论。",
      en: "B1 reading uses texts about work, study, and life in the Netherlands. The work is not word-by-word translation, but identifying topic, audience, detail, relation, and conclusion.",
    },
    examFact: {
      zh: "官方说明：Programma I 阅读 110 分钟，6 篇文本、36 道选择题；允许使用 Van Dale NT2 纸质词典。",
      en: "Official instructions: Programma I reading lasts 110 minutes with 6 texts and 36 multiple-choice questions; a Van Dale NT2 paper dictionary is allowed.",
    },
    attempts: [
      b1OfficialAttempt("b1-reading-official", "官方 B1 阅读练习入口", "Official B1 reading practice", 110, [
        { zh: "6 篇文本 / 36 题", en: "6 texts / 36 questions" },
        { zh: "主题、来源、对象、结论", en: "Topic, source, audience, conclusion" },
      ]),
    ],
    practiceTasks: [
      {
        id: "b1-reading-gemeente",
        kindLabel: { zh: "读官方信", en: "Official letter" },
        title: { zh: "补交材料", en: "Missing document" },
        scenario: {
          zh: "你收到 gemeente 的信。目标是找出你必须补交什么、什么时候交。",
          en: "You receive a municipality letter. Find what you must send and by when.",
        },
        inputText:
          "Wij hebben uw aanvraag ontvangen. Er ontbreekt nog een kopie van uw huurcontract. Stuur dit document voor 15 juni naar ons op. Als wij het document niet op tijd krijgen, kunnen wij uw aanvraag niet behandelen.",
        question: {
          zh: "问题：如果你不按时补交，会发生什么？",
          en: "Question: What happens if you do not send the document on time?",
        },
        answerGuide: {
          zh: "正确方向：gemeente 不能处理你的申请。",
          en: "Answer direction: the municipality cannot process your application.",
        },
        checklist: [
          { zh: "找出 ontbreekt nog", en: "Find ontbreekt nog" },
          { zh: "圈出截止日期", en: "Circle the deadline" },
          { zh: "看 als...niet... 的后果", en: "Read the consequence after als...niet..." },
        ],
        sourceAlignment: {
          zh: "对齐 B1 阅读：官方信件、条件和后果。",
          en: "Aligned with B1 reading: official letter, condition, and consequence.",
        },
      },
      {
        id: "b1-reading-werkmail",
        kindLabel: { zh: "读工作邮件", en: "Work email" },
        title: { zh: "安全说明", en: "Safety instruction" },
        scenario: {
          zh: "你读公司邮件，要判断新规定适用于谁。",
          en: "You read a company email and decide who the new rule applies to.",
        },
        inputText:
          "Vanaf volgende week moeten alle medewerkers in het magazijn veiligheidsschoenen dragen. Voor medewerkers op kantoor verandert er niets. Nieuwe schoenen kunnen maandag bij de teamleider worden opgehaald.",
        question: {
          zh: "问题：谁必须穿安全鞋？",
          en: "Question: Who must wear safety shoes?",
        },
        answerGuide: {
          zh: "正确方向：仓库员工，不是办公室员工。",
          en: "Answer direction: warehouse employees, not office staff.",
        },
        checklist: [
          { zh: "识别 alle medewerkers in het magazijn", en: "Identify alle medewerkers in het magazijn" },
          { zh: "注意 kantoor 是例外", en: "Notice kantoor is the exception" },
          { zh: "不要把 nieuwe schoenen 当答案", en: "Do not treat nieuwe schoenen as the answer" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 阅读：工作通知、对象范围和例外。",
          en: "Aligned with B1 reading: workplace notice, audience scope, and exception.",
        },
      },
      {
        id: "b1-reading-cursus",
        kindLabel: { zh: "读课程通知", en: "Course notice" },
        title: { zh: "考试报名", en: "Exam registration" },
        scenario: {
          zh: "你读语言学校通知，要判断报名步骤。",
          en: "You read a language school notice and identify the registration steps.",
        },
        inputText:
          "Wilt u meedoen aan de proefexamendag? Meld u dan uiterlijk vrijdag aan via het formulier op de website. Na uw aanmelding ontvangt u een bevestiging per e-mail. Zonder bevestiging kunt u niet deelnemen.",
        question: {
          zh: "问题：参加 proefexamendag 前必须收到什么？",
          en: "Question: What must you receive before joining the practice exam day?",
        },
        answerGuide: {
          zh: "正确方向：报名后的邮件确认。",
          en: "Answer direction: an email confirmation after registration.",
        },
        checklist: [
          { zh: "抓住 uiterlijk vrijdag", en: "Catch uiterlijk vrijdag" },
          { zh: "区分 aanmelden 和 bevestiging", en: "Distinguish aanmelden and bevestiging" },
          { zh: "zonder bevestiging 是关键条件", en: "zonder bevestiging is the key condition" },
        ],
        sourceAlignment: {
          zh: "对齐 B1 阅读：学习通知、步骤和条件。",
          en: "Aligned with B1 reading: study notice, steps, and condition.",
        },
      },
    ],
  },
];

export const duoExamPracticeLevels: DuoPracticeLevelPack[] = [
  {
    level: "A2",
    title: { zh: "A2 Inburgering 练习", en: "A2 Inburgering Practice" },
    subtitle: {
      zh: "DUO 官方公开 A2 练习入口：写作、口语、听力、阅读和 KNM。",
      en: "Public DUO A2 practice entries: writing, speaking, listening, reading, and KNM.",
    },
    status: "ready",
    officialLinks: [
      { label: "DUO oefenexamens A2", url: duoExamOfficialSources.practicePage },
      { label: "DUO inhoud taalexamens A2", url: duoExamOfficialSources.examContentPage },
    ],
    emptyState: {
      zh: "A2 官方练习已接入。",
      en: "A2 official practice is connected.",
    },
    sections: a2PracticeSections,
  },
  {
    level: "B1",
    title: { zh: "B1 Staatsexamen NT2 练习", en: "B1 Staatsexamen NT2 Practice" },
    subtitle: {
      zh: "基于官方 Programma I / B1 信息整理：四项官方练习入口 + NedPop 原创题型拆练。",
      en: "Based on official Programma I / B1 information: official practice entry plus NedPop original task drills.",
    },
    status: "ready",
    officialLinks: [
      { label: "NT2 oefenomgeving", url: duoExamOfficialSources.b1PracticePortal },
      { label: "Staatsexamens NT2 exam info", url: duoExamOfficialSources.b1ExamInfo },
      { label: "DUO Staatsexamen NT2", url: "https://www.duo.nl/particulier/staatsexamen-nt2/hoe-het-staatsexamen-nt2-werkt.jsp" },
    ],
    emptyState: {
      zh: "B1 官方入口和拆练卡已接入。",
      en: "B1 official entry and drills are connected.",
    },
    sections: b1PracticeSections,
  },
];

export const defaultDuoExamPracticeLevel: DuoPracticeLevel = "A2";
