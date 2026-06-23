export type CollocationSeed = {
  headword: string;
  chunks: Array<{
    dutch: string;
    meaningZh: string;
    meaningEn: string;
    exampleSentence?: string;
    exampleZh?: string;
    exampleEn?: string;
  }>;
};

export const collocationSeeds: CollocationSeed[] = [
  {
    headword: "adres",
    chunks: [
      { dutch: "het adres invullen", meaningZh: "填写地址", meaningEn: "fill in the address", exampleSentence: "Ik vul mijn adres in.", exampleZh: "我填写我的地址。", exampleEn: "I fill in my address." },
      { dutch: "mijn adres veranderen", meaningZh: "更改我的地址", meaningEn: "change my address", exampleSentence: "Ik wil mijn adres veranderen.", exampleZh: "我想更改我的地址。", exampleEn: "I want to change my address." },
      { dutch: "op dit adres wonen", meaningZh: "住在这个地址", meaningEn: "live at this address", exampleSentence: "Ik woon op dit adres.", exampleZh: "我住在这个地址。", exampleEn: "I live at this address." },
    ],
  },
  {
    headword: "afspraak",
    chunks: [
      { dutch: "een afspraak maken", meaningZh: "预约", meaningEn: "make an appointment", exampleSentence: "Ik wil een afspraak maken.", exampleZh: "我想预约。", exampleEn: "I want to make an appointment." },
      { dutch: "een afspraak verzetten", meaningZh: "改约", meaningEn: "reschedule an appointment", exampleSentence: "Ik wil mijn afspraak verzetten.", exampleZh: "我想改约。", exampleEn: "I want to reschedule my appointment." },
      { dutch: "een afspraak afzeggen", meaningZh: "取消预约", meaningEn: "cancel an appointment", exampleSentence: "Ik moet mijn afspraak afzeggen.", exampleZh: "我必须取消预约。", exampleEn: "I have to cancel my appointment." },
    ],
  },
  {
    headword: "rekening",
    chunks: [
      { dutch: "de rekening betalen", meaningZh: "付账单", meaningEn: "pay the bill", exampleSentence: "Ik moet de rekening betalen.", exampleZh: "我必须付账单。", exampleEn: "I have to pay the bill." },
      { dutch: "een rekening krijgen", meaningZh: "收到一张账单", meaningEn: "receive a bill", exampleSentence: "Ik krijg een rekening.", exampleZh: "我收到一张账单。", exampleEn: "I receive a bill." },
      { dutch: "de rekening uitleggen", meaningZh: "解释账单", meaningEn: "explain the bill", exampleSentence: "Kunt u de rekening uitleggen?", exampleZh: "您能解释这张账单吗？", exampleEn: "Can you explain the bill?" },
    ],
  },
  {
    headword: "hulp",
    chunks: [
      { dutch: "hulp nodig hebben", meaningZh: "需要帮助", meaningEn: "need help", exampleSentence: "Ik heb hulp nodig.", exampleZh: "我需要帮助。", exampleEn: "I need help." },
      { dutch: "om hulp vragen", meaningZh: "求助", meaningEn: "ask for help", exampleSentence: "Ik vraag om hulp.", exampleZh: "我请求帮助。", exampleEn: "I ask for help." },
      { dutch: "bedankt voor uw hulp", meaningZh: "谢谢您的帮助", meaningEn: "thank you for your help", exampleSentence: "Bedankt voor uw hulp.", exampleZh: "谢谢您的帮助。", exampleEn: "Thank you for your help." },
    ],
  },
  {
    headword: "formulier",
    chunks: [
      { dutch: "het formulier invullen", meaningZh: "填写表格", meaningEn: "fill in the form", exampleSentence: "Ik moet het formulier invullen.", exampleZh: "我必须填写表格。", exampleEn: "I have to fill in the form." },
      { dutch: "het formulier opsturen", meaningZh: "寄出/提交表格", meaningEn: "send the form", exampleSentence: "Ik stuur het formulier op.", exampleZh: "我寄出表格。", exampleEn: "I send the form." },
    ],
  },
  {
    headword: "taal",
    chunks: [
      { dutch: "een taal spreken", meaningZh: "说一门语言", meaningEn: "speak a language", exampleSentence: "Ik spreek Nederlands.", exampleZh: "我说荷兰语。", exampleEn: "I speak Dutch." },
      { dutch: "een taal leren", meaningZh: "学习一门语言", meaningEn: "learn a language", exampleSentence: "Ik leer Nederlands.", exampleZh: "我学荷兰语。", exampleEn: "I learn Dutch." },
      { dutch: "een taal begrijpen", meaningZh: "理解一门语言", meaningEn: "understand a language", exampleSentence: "Ik begrijp de taal.", exampleZh: "我理解这门语言。", exampleEn: "I understand the language." },
    ],
  },
  {
    headword: "drinken",
    chunks: [
      { dutch: "water drinken", meaningZh: "喝水", meaningEn: "drink water", exampleSentence: "Ik drink water.", exampleZh: "我喝水。", exampleEn: "I drink water." },
      { dutch: "koffie drinken", meaningZh: "喝咖啡", meaningEn: "drink coffee", exampleSentence: "Wij drinken koffie.", exampleZh: "我们喝咖啡。", exampleEn: "We drink coffee." },
      { dutch: "thee drinken", meaningZh: "喝茶", meaningEn: "drink tea", exampleSentence: "Ik drink thee.", exampleZh: "我喝茶。", exampleEn: "I drink tea." },
    ],
  },
  {
    headword: "eten",
    chunks: [
      { dutch: "brood eten", meaningZh: "吃面包", meaningEn: "eat bread", exampleSentence: "Ik eet brood.", exampleZh: "我吃面包。", exampleEn: "I eat bread." },
      { dutch: "rijst eten", meaningZh: "吃米饭", meaningEn: "eat rice", exampleSentence: "Ik eet rijst.", exampleZh: "我吃米饭。", exampleEn: "I eat rice." },
      { dutch: "een appel eten", meaningZh: "吃一个苹果", meaningEn: "eat an apple", exampleSentence: "Ik eet een appel.", exampleZh: "我吃一个苹果。", exampleEn: "I eat an apple." },
    ],
  },
  {
    headword: "betalen",
    chunks: [
      { dutch: "met pin betalen", meaningZh: "刷卡付款", meaningEn: "pay by card", exampleSentence: "Ik betaal met pin.", exampleZh: "我刷卡付款。", exampleEn: "I pay by card." },
      { dutch: "de rekening betalen", meaningZh: "付账单", meaningEn: "pay the bill", exampleSentence: "Ik betaal de rekening.", exampleZh: "我付账单。", exampleEn: "I pay the bill." },
    ],
  },
  {
    headword: "invullen",
    chunks: [
      { dutch: "het formulier invullen", meaningZh: "填写表格", meaningEn: "fill in the form", exampleSentence: "Ik vul het formulier in.", exampleZh: "我填写表格。", exampleEn: "I fill in the form." },
      { dutch: "het adres invullen", meaningZh: "填写地址", meaningEn: "fill in the address", exampleSentence: "Ik vul het adres in.", exampleZh: "我填写地址。", exampleEn: "I fill in the address." },
    ],
  },
  {
    headword: "bellen",
    chunks: [
      { dutch: "de huisarts bellen", meaningZh: "给家庭医生打电话", meaningEn: "call the GP", exampleSentence: "Ik bel de huisarts.", exampleZh: "我给家庭医生打电话。", exampleEn: "I call the GP." },
      { dutch: "terugbellen", meaningZh: "回电话", meaningEn: "call back", exampleSentence: "Kunt u mij terugbellen?", exampleZh: "您能给我回电话吗？", exampleEn: "Can you call me back?" },
    ],
  },
  {
    headword: "maand",
    chunks: [
      { dutch: "deze maand", meaningZh: "这个月", meaningEn: "this month", exampleSentence: "Ik werk deze maand.", exampleZh: "我这个月工作。", exampleEn: "I work this month." },
      { dutch: "volgende maand", meaningZh: "下个月", meaningEn: "next month", exampleSentence: "Ik kom volgende maand.", exampleZh: "我下个月来。", exampleEn: "I come next month." },
      { dutch: "vorige maand", meaningZh: "上个月", meaningEn: "last month", exampleSentence: "Ik was hier vorige maand.", exampleZh: "我上个月来过这里。", exampleEn: "I was here last month." },
    ],
  },
  {
    headword: "weinig",
    chunks: [
      { dutch: "weinig tijd", meaningZh: "很少时间", meaningEn: "little time", exampleSentence: "Ik heb weinig tijd.", exampleZh: "我时间很少。", exampleEn: "I have little time." },
    ],
  },
];
