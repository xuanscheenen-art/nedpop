type WordSentenceSource = {
  dutch: string;
  article?: "de" | "het";
  theme?: string;
  scenarioTags?: string[];
  phraseChunks?: string[];
  exampleSentence?: {
    dutch: string;
  };
};

type SentenceMeaning = {
  zh: string;
  en: string;
};

const nounZh: Record<string, string> = {
  boek: "书",
  boeken: "书",
  pen: "笔",
  pennen: "笔",
  tas: "包",
  tassen: "包",
  telefoon: "电话/手机",
  telefoons: "电话/手机",
  tafel: "桌子",
  tafels: "桌子",
  stoel: "椅子",
  stoelen: "椅子",
  station: "车站",
  trein: "火车",
  formulier: "表格",
  document: "文件",
  afspraak: "预约",
  gemeente: "市政厅",
  huisarts: "家庭医生",
  ziekenhuis: "医院",
  rekening: "账单",
  factuur: "发票",
  woning: "住房",
  water: "水",
  koffie: "咖啡",
  brood: "面包",
  hulp: "帮助",
  adres: "地址",
  naam: "名字",
  taal: "语言",
  Nederlands: "荷兰语",
  Engels: "英语",
  Chinees: "中文",
  student: "学生",
  leraar: "老师",
  collega: "同事",
  Lin: "Lin",
  Anna: "Anna",
};

const nounLabel = (value: string) => nounZh[value] ?? value;

const nounEn: Record<string, string> = {
  boek: "book",
  boeken: "books",
  pen: "pen",
  pennen: "pens",
  tas: "bag",
  tassen: "bags",
  telefoon: "phone",
  telefoons: "phones",
  tafel: "table",
  tafels: "tables",
  stoel: "chair",
  stoelen: "chairs",
  station: "station",
  trein: "train",
  formulier: "form",
  document: "document",
  afspraak: "appointment",
  gemeente: "municipality",
  huisarts: "GP",
  ziekenhuis: "hospital",
  rekening: "bill",
  factuur: "invoice",
  woning: "home",
  water: "water",
  koffie: "coffee",
  brood: "bread",
  hulp: "help",
  adres: "address",
  naam: "name",
  taal: "language",
  Nederlands: "Dutch",
  Engels: "English",
  Chinees: "Chinese",
  student: "student",
  leraar: "teacher",
  collega: "colleague",
  Lin: "Lin",
  Anna: "Anna",
};

const nounLabelEn = (value: string) => nounEn[value] ?? value;

const looseGlossZh: Record<string, string> = {
  ik: "我",
  jij: "你",
  je: "你",
  u: "您",
  mijn: "我的",
  dit: "这/这个",
  dat: "那/那个",
  ja: "是/对",
  nee: "不/不是",
  geen: "没有/不是一个",
  niet: "不",
  ben: "是",
  bent: "是",
  is: "是",
  heet: "叫",
  naam: "名字",
  woon: "住",
  woont: "住",
  kom: "来/来自",
  komt: "来/来自",
  spreek: "说",
  spreekt: "说",
  leer: "学",
  leert: "学",
  heb: "有",
  hebt: "有",
  heeft: "有",
  wil: "想要",
  wilt: "想要",
  kan: "可以/会",
  kunt: "可以",
  moet: "必须/需要",
  naar: "去/到",
  in: "在",
  uit: "来自",
  waar: "哪里",
  hoe: "怎么/如何",
  wat: "什么",
  alstublieft: "请",
  graag: "想要/请",
  nodig: "需要的",
  helpen: "帮助",
  herhalen: "重复",
  invullen: "填写",
  betalen: "付款",
  veranderen: "更改",
};

const looseGlossEn: Record<string, string> = {
  ik: "I",
  jij: "you",
  je: "you",
  u: "you",
  mijn: "my",
  dit: "this",
  dat: "that",
  ja: "yes",
  nee: "no",
  geen: "no/not a",
  niet: "not",
  ben: "am",
  bent: "are",
  is: "is",
  heet: "am/is called",
  naam: "name",
  woon: "live",
  woont: "live",
  kom: "come",
  komt: "come",
  spreek: "speak",
  spreekt: "speak",
  leer: "learn",
  leert: "learn",
  heb: "have",
  hebt: "have",
  heeft: "has",
  wil: "want",
  wilt: "want",
  kan: "can",
  kunt: "can",
  moet: "must",
  naar: "to",
  in: "in",
  uit: "from",
  waar: "where",
  hoe: "how",
  wat: "what",
  alstublieft: "please",
  graag: "please/would like",
  nodig: "needed",
  helpen: "help",
  herhalen: "repeat",
  invullen: "fill in",
  betalen: "pay",
  veranderen: "change",
};

const identityZh: Record<string, string> = {
  student: "学生",
  leraar: "老师",
  ziek: "生病了",
  moe: "累了",
  nieuw: "新来的",
  klaar: "完成了",
  thuis: "在家",
  Lin: "Lin",
  Anna: "Anna",
};

const identityEn: Record<string, string> = {
  student: "a student",
  leraar: "a teacher",
  ziek: "sick",
  moe: "tired",
  nieuw: "new",
  klaar: "done",
  thuis: "home",
  Lin: "Lin",
  Anna: "Anna",
};

const sentenceMeanings: Record<string, SentenceMeaning> = {
  "Hallo.": { zh: "你好。", en: "Hello." },
  "Hallo, ik ben Lin.": { zh: "你好，我是 Lin。", en: "Hello, I am Lin." },
  "Hallo, hoe gaat het?": { zh: "你好，你好吗？", en: "Hello, how are you?" },
  "Dag.": { zh: "你好/再见。", en: "Hello/bye." },
  "Dag, tot morgen.": { zh: "再见，明天见。", en: "Bye, see you tomorrow." },
  "Dag, tot ziens.": { zh: "再见，回头见。", en: "Bye, see you." },
  "Goedemorgen.": { zh: "早上好。", en: "Good morning." },
  "Goedemorgen, hoe gaat het?": { zh: "早上好，你好吗？", en: "Good morning, how are you?" },
  "Goedemorgen, ik ben Lin.": { zh: "早上好，我是 Lin。", en: "Good morning, I am Lin." },
  "Goedenavond.": { zh: "晚上好。", en: "Good evening." },
  "Goedenavond, hoe gaat het?": { zh: "晚上好，你好吗？", en: "Good evening, how are you?" },
  "Goedenavond, tot ziens.": { zh: "晚上好，再见。", en: "Good evening, goodbye." },
  "Tot ziens.": { zh: "再见。", en: "See you." },
  "Tot ziens, fijne dag.": { zh: "再见，祝你今天愉快。", en: "See you, have a nice day." },
  "Tot ziens, tot morgen.": { zh: "再见，明天见。", en: "See you, see you tomorrow." },
  "Dank je.": { zh: "谢谢你。", en: "Thank you." },
  "Dank je wel.": { zh: "非常感谢。", en: "Thank you very much." },
  "Dank je voor je hulp.": { zh: "谢谢你的帮助。", en: "Thank you for your help." },
  "Bedankt.": { zh: "谢谢。", en: "Thanks." },
  "Bedankt voor uw hulp.": { zh: "谢谢您的帮助。", en: "Thank you for your help." },
  "Alvast bedankt.": { zh: "先谢谢您。", en: "Thanks in advance." },
  "Alsjeblieft.": { zh: "请/给你。", en: "Please / here you are." },
  "Een koffie, alsjeblieft.": { zh: "一杯咖啡，谢谢。", en: "A coffee, please." },
  "Hier, alsjeblieft.": { zh: "给你。", en: "Here you are." },
  "Sorry.": { zh: "抱歉。", en: "Sorry." },
  "Sorry, ik begrijp het niet.": { zh: "抱歉，我不懂。", en: "Sorry, I do not understand." },
  "Sorry, kunt u dat herhalen?": { zh: "抱歉，您能重复一下吗？", en: "Sorry, can you repeat that?" },
  "Ja.": { zh: "是/对。", en: "Yes." },
  "Ja, dat klopt.": { zh: "是的，没错。", en: "Yes, that is correct." },
  "Ja, graag.": { zh: "好的，谢谢/要的。", en: "Yes, please." },
  "Nee.": { zh: "不是/不。", en: "No." },
  "Nee, dat klopt niet.": { zh: "不，那不对。", en: "No, that is not correct." },
  "Nee, dank je.": { zh: "不用了，谢谢。", en: "No, thank you." },
  "Ik ben Lin.": { zh: "我是 Lin。", en: "I am Lin." },
  "Ik ben student.": { zh: "我是学生。", en: "I am a student." },
  "Ben jij Anna?": { zh: "你是 Anna 吗？", en: "Are you Anna?" },
  "Mijn naam is Lin.": { zh: "我的名字是 Lin。", en: "My name is Lin." },
  "Wat is uw naam?": { zh: "您叫什么名字？", en: "What is your name?" },
  "Wat is jouw naam?": { zh: "你叫什么名字？", en: "What is your name?" },
  "Wat is je naam?": { zh: "你叫什么名字？", en: "What is your name?" },
  "De trein heeft vijf minuten vertraging.": { zh: "火车晚点五分钟。", en: "The train is delayed by five minutes." },
  "Een uur heeft zestig minuten.": { zh: "一小时有六十分钟。", en: "An hour has sixty minutes." },
  "Ik wacht tien minuten.": { zh: "我等十分钟。", en: "I wait ten minutes." },
  "Hoe laat is het?": { zh: "现在几点？", en: "What time is it?" },
  "Het is drie uur.": { zh: "现在三点。", en: "It is three o'clock." },
  "Volgende week heb ik een afspraak.": { zh: "下周我有一个预约。", en: "Next week I have an appointment." },
  "Deze week werk ik.": { zh: "这周我工作。", en: "I work this week." },
  "Een week heeft zeven dagen.": { zh: "一周有七天。", en: "A week has seven days." },
  "Volgende maand verhuis ik.": { zh: "下个月我搬家。", en: "I move next month." },
  "Deze maand betaal ik de huur.": { zh: "这个月我付房租。", en: "This month I pay the rent." },
  "Een jaar heeft twaalf maanden.": { zh: "一年有十二个月。", en: "A year has twelve months." },
  "Ik woon hier twee jaar.": { zh: "我在这里住了两年。", en: "I have lived here for two years." },
  "Welk jaar is het?": { zh: "现在是哪一年？", en: "What year is it?" },
  "Vandaag leer ik Nederlands.": { zh: "今天我学荷兰语。", en: "Today I learn Dutch." },
  "Vandaag heb ik tijd.": { zh: "今天我有时间。", en: "I have time today." },
  "Vandaag ga ik naar school.": { zh: "今天我去学校。", en: "Today I go to school." },
  "Morgen heb ik een afspraak.": { zh: "明天我有一个预约。", en: "Tomorrow I have an appointment." },
  "Tot morgen.": { zh: "明天见。", en: "See you tomorrow." },
  "Morgen ga ik naar de gemeente.": { zh: "明天我去市政厅。", en: "Tomorrow I go to the municipality." },
  "Gisteren was ik ziek.": { zh: "昨天我生病了。", en: "Yesterday I was sick." },
  "Gisteren heb ik gebeld.": { zh: "昨天我打过电话。", en: "Yesterday I called." },
  "Gisteren had de trein vertraging.": { zh: "昨天火车晚点了。", en: "Yesterday the train was delayed." },
  "Ik wil graag een afspraak maken.": { zh: "我想预约。", en: "I would like to make an appointment." },
  "Wanneer kan ik langskomen?": { zh: "我什么时候可以过来？", en: "When can I come by?" },
  "Wanneer begint de les?": { zh: "课什么时候开始？", en: "When does the lesson start?" },
  "Wanneer komt de trein?": { zh: "火车什么时候来？", en: "When does the train come?" },
  "Wie ben jij?": { zh: "你是谁？", en: "Who are you?" },
  "Wie is dat?": { zh: "那是谁？", en: "Who is that?" },
  "Wie komt vandaag?": { zh: "今天谁来？", en: "Who is coming today?" },
  "Wat is dit?": { zh: "这是什么？", en: "What is this?" },
  "Wat wil je?": { zh: "你想要什么？", en: "What do you want?" },
  "Waar woon jij?": { zh: "你住在哪里？", en: "Where do you live?" },
  "Waar is het station?": { zh: "车站在哪里？", en: "Where is the station?" },
  "Ik ben hier.": { zh: "我在这里。", en: "I am here." },
  "Daar is de winkel.": { zh: "商店在那里。", en: "The shop is there." },
  "Ga links.": { zh: "向左走。", en: "Go left." },
  "Ga rechts.": { zh: "向右走。", en: "Go right." },
  "Ga rechtdoor.": { zh: "直走。", en: "Go straight ahead." },
  "De straat is dichtbij.": { zh: "这条街很近。", en: "The street is nearby." },
  "Het plein is daar.": { zh: "广场在那里。", en: "The square is there." },
  "De winkel is naast het station.": { zh: "商店在车站旁边。", en: "The shop is next to the station." },
  "Ik sta voor het station.": { zh: "我站在车站前面。", en: "I am standing in front of the station." },
  "Het is tegenover de supermarkt.": { zh: "它在超市对面。", en: "It is opposite the supermarket." },
  "De fiets staat achter het huis.": { zh: "自行车在房子后面。", en: "The bike is behind the house." },
  "De kamer is boven.": { zh: "房间在楼上。", en: "The room is upstairs." },
  "De keuken is beneden.": { zh: "厨房在楼下。", en: "The kitchen is downstairs." },
  "Het station is dichtbij.": { zh: "车站很近。", en: "The station is nearby." },
  "Het station is ver.": { zh: "车站很远。", en: "The station is far away." },
  "Waar kom jij vandaan?": { zh: "你来自哪里？", en: "Where do you come from?" },
  "Hoe gaat het?": { zh: "你好吗？", en: "How are you?" },
  "Hoe heet jij?": { zh: "你叫什么名字？", en: "What is your name?" },
  "Hoeveel kost dit?": { zh: "这个多少钱？", en: "How much does this cost?" },
  "Hoeveel minuten vertraging is er?": { zh: "晚点几分钟？", en: "How many minutes of delay are there?" },
  "Waarom kom je niet?": { zh: "你为什么不来？", en: "Why are you not coming?" },
  "Waarom is de rekening hoog?": { zh: "账单为什么高？", en: "Why is the bill high?" },
  "Welke dag is het vandaag?": { zh: "今天星期几？", en: "What day is it today?" },
  "Welke trein neem je?": { zh: "你坐哪趟火车？", en: "Which train are you taking?" },
  "Kan ik de afspraak verplaatsen?": { zh: "我可以改预约吗？", en: "Can I move the appointment?" },
  "Ik ga naar het station.": { zh: "我去车站。", en: "I go to the station." },
  "De trein heeft vertraging.": { zh: "火车晚点了。", en: "The train is delayed." },
  "Ik koop een kaartje.": { zh: "我买一张票。", en: "I buy a ticket." },
  "Ik ben ziek.": { zh: "我生病了。", en: "I am sick." },
  "Ik bel de huisarts.": { zh: "我给家庭医生打电话。", en: "I call the GP." },
  "Ik heb pijn.": { zh: "我疼。", en: "I have pain." },
  "Ik heb hulp nodig.": { zh: "我需要帮助。", en: "I need help." },
  "Kunt u mij helpen?": { zh: "您可以帮我吗？", en: "Can you help me?" },
  "Kunt u dat uitleggen?": { zh: "您可以解释一下吗？", en: "Can you explain that?" },
  "Ik heb een boek.": { zh: "我有一本书。", en: "I have a book." },
  "Heb jij een pen?": { zh: "你有一支笔吗？", en: "Do you have a pen?" },
  "Ik heb geen tas.": { zh: "我没有包。", en: "I do not have a bag." },
  "Wij hebben tijd.": { zh: "我们有时间。", en: "We have time." },
  "Ik heb wel tijd.": { zh: "我确实有时间。", en: "I do have time." },
  "Ik heb geen tijd.": { zh: "我没有时间。", en: "I do not have time." },
  "Ik zeg hallo.": { zh: "我说“你好”。", en: "I say hello." },
  "Zeg hallo.": { zh: "说“你好”。", en: "Say hello." },
  "Kun je dat nog een keer zeggen?": { zh: "你可以再说一遍吗？", en: "Can you say that one more time?" },
  "Ik begin nu.": { zh: "我现在开始。", en: "I start now." },
  "Begin nu.": { zh: "现在开始。", en: "Start now." },
  "Wanneer beginnen we?": { zh: "我们什么时候开始？", en: "When do we start?" },
  "Ik klik hier.": { zh: "我点击这里。", en: "I click here." },
  "Ik klik op de knop.": { zh: "我点击按钮。", en: "I click the button." },
  "Waar moet ik klikken?": { zh: "我应该点哪里？", en: "Where should I click?" },
  "Klik hier.": { zh: "点击这里。", en: "Click here." },
  "Ik stop nu.": { zh: "我现在停止。", en: "I stop now." },
  "Ik stop hier.": { zh: "我在这里停下。", en: "I stop here." },
  "Wanneer stopt de bus?": { zh: "公交车什么时候停？", en: "When does the bus stop?" },
  "Stop nu.": { zh: "现在停下。", en: "Stop now." },
  "Ik open de app.": { zh: "我打开应用。", en: "I open the app." },
  "Ik open het formulier.": { zh: "我打开表格。", en: "I open the form." },
  "Kun je de deur openen?": { zh: "你可以开门吗？", en: "Can you open the door?" },
  "Open de app.": { zh: "打开应用。", en: "Open the app." },
  "Ik sluit de app.": { zh: "我关闭应用。", en: "I close the app." },
  "Ik sluit het raam.": { zh: "我关窗。", en: "I close the window." },
  "Kun je de deur sluiten?": { zh: "你可以关门吗？", en: "Can you close the door?" },
  "Sluit de app.": { zh: "关闭应用。", en: "Close the app." },
  "Ik kijk naar het bord.": { zh: "我看黑板。", en: "I look at the board." },
  "Wij kijken samen.": { zh: "我们一起看。", en: "We look together." },
  "Kun je even kijken?": { zh: "你可以看一下吗？", en: "Can you take a look?" },
  "Kijk naar de zin.": { zh: "看这个句子。", en: "Look at the sentence." },
  "Ik lees de zin.": { zh: "我读这个句子。", en: "I read the sentence." },
  "Ik lees de brief.": { zh: "我读这封信。", en: "I read the letter." },
  "Kun je dit lezen?": { zh: "你可以读这个吗？", en: "Can you read this?" },
  "Lees de zin.": { zh: "读这个句子。", en: "Read the sentence." },
  "Ik schrijf mijn naam.": { zh: "我写我的名字。", en: "I write my name." },
  "Ik schrijf een korte zin.": { zh: "我写一个短句。", en: "I write a short sentence." },
  "Kun je een e-mail schrijven?": { zh: "你可以写一封邮件吗？", en: "Can you write an email?" },
  "Schrijf je naam.": { zh: "写你的名字。", en: "Write your name." },
  "Ik luister goed.": { zh: "我认真听。", en: "I listen carefully." },
  "Ik luister naar de zin.": { zh: "我听这个句子。", en: "I listen to the sentence." },
  "Kun je luisteren en herhalen?": { zh: "你可以听并重复吗？", en: "Can you listen and repeat?" },
  "Luister goed.": { zh: "认真听。", en: "Listen carefully." },
  "Ik werk vandaag.": { zh: "我今天工作。", en: "I work today." },
  "Waar werk je?": { zh: "你在哪里工作？", en: "Where do you work?" },
  "Ik werk in Amsterdam.": { zh: "我在阿姆斯特丹工作。", en: "I work in Amsterdam." },
  "Ik leer elke dag.": { zh: "我每天学习。", en: "I learn every day." },
  "Wat leer je vandaag?": { zh: "你今天学什么？", en: "What do you learn today?" },
  "Ik woon in Delft.": { zh: "我住在代尔夫特。", en: "I live in Delft." },
  "Ik woon in Nederland.": { zh: "我住在荷兰。", en: "I live in the Netherlands." },
  "Ik kom uit China.": { zh: "我来自中国。", en: "I come from China." },
  "Ik kom uit Nederland.": { zh: "我来自荷兰。", en: "I come from the Netherlands." },
  "Kunt u mij terugbellen?": { zh: "您可以给我回电话吗？", en: "Can you call me back?" },
  "Ik wil vandaag bellen.": { zh: "我想今天打电话。", en: "I want to call today." },
  "Ik drink water.": { zh: "我喝水。", en: "I drink water." },
  "Wil je iets drinken?": { zh: "你想喝点什么吗？", en: "Do you want something to drink?" },
  "Ik drink koffie.": { zh: "我喝咖啡。", en: "I drink coffee." },
  "Ik eet brood.": { zh: "我吃面包。", en: "I eat bread." },
  "Ik wil iets eten.": { zh: "我想吃点东西。", en: "I want something to eat." },
  "Wij eten om zes uur.": { zh: "我们六点吃饭。", en: "We eat at six o'clock." },
  "Ik kook vandaag.": { zh: "我今天做饭。", en: "I cook today." },
  "Wij koken thuis.": { zh: "我们在家做饭。", en: "We cook at home." },
  "Wat kook je vandaag?": { zh: "你今天做什么菜？", en: "What are you cooking today?" },
  "Ik loop naar huis.": { zh: "我走路回家。", en: "I walk home." },
  "Wij lopen naar het station.": { zh: "我们走去车站。", en: "We walk to the station." },
  "Ik loop rechtdoor.": { zh: "我直走。", en: "I walk straight ahead." },
  "Ik sta vroeg op.": { zh: "我早起。", en: "I get up early." },
  "Hoe laat sta je op?": { zh: "你几点起床？", en: "What time do you get up?" },
  "Vandaag sta ik om zeven uur op.": { zh: "今天我七点起床。", en: "Today I get up at seven." },
  "Ik slaap goed.": { zh: "我睡得好。", en: "I sleep well." },
  "Ik wil slapen.": { zh: "我想睡觉。", en: "I want to sleep." },
  "Hoe laat slaap je?": { zh: "你几点睡？", en: "What time do you sleep?" },
  "Ik was mijn handen.": { zh: "我洗手。", en: "I wash my hands." },
  "Ik was mijn gezicht.": { zh: "我洗脸。", en: "I wash my face." },
  "Waar kan ik mijn handen wassen?": { zh: "我在哪里可以洗手？", en: "Where can I wash my hands?" },
  "Ik help u.": { zh: "我帮您。", en: "I help you." },
  "Wij helpen samen.": { zh: "我们一起帮忙。", en: "We help together." },
  "Ik spreek een beetje Nederlands.": { zh: "我会说一点荷兰语。", en: "I speak a little Dutch." },
  "Ik spreek Nederlands.": { zh: "我说荷兰语。", en: "I speak Dutch." },
  "Ik spreek Chinees.": { zh: "我说中文。", en: "I speak Chinese." },
  "Spreek jij Engels?": { zh: "你会说英语吗？", en: "Do you speak English?" },
  "Ik begrijp het niet.": { zh: "我不明白。", en: "I do not understand it." },
  "Jij begrijpt de zin.": { zh: "你理解这个句子。", en: "You understand the sentence." },
  "Wij begrijpen het.": { zh: "我们明白。", en: "We understand it." },
  "Nederlands is een taal.": { zh: "荷兰语是一门语言。", en: "Dutch is a language." },
  "Engels is een taal.": { zh: "英语是一门语言。", en: "English is a language." },
  "Chinees is een taal.": { zh: "中文是一门语言。", en: "Chinese is a language." },
  "Ik spreek geen Engels.": { zh: "我不会说英语。", en: "I do not speak English." },
  "Mijn nummer is nul zes een twee drie vier vijf zes zeven acht.": { zh: "我的号码是 0612345678。", en: "My number is 0612345678." },
  "Ik ben vijfentwintig jaar.": { zh: "我二十五岁。", en: "I am twenty-five years old." },
  "Dat is drie euro.": { zh: "那是三欧元。", en: "That is three euros." },
  "De afspraak is op maandag.": { zh: "预约在星期一。", en: "The appointment is on Monday." },
  "Dit is een boek.": { zh: "这是一本书。", en: "This is a book." },
  "Dit is een pen.": { zh: "这是一支笔。", en: "This is a pen." },
  "Dat is een boek.": { zh: "那是一本书。", en: "That is a book." },
  "Dat is een pen.": { zh: "那是一支笔。", en: "That is a pen." },
  "Dat is een tas.": { zh: "那是一个包。", en: "That is a bag." },
  "Ik heb een pen.": { zh: "我有一支笔。", en: "I have a pen." },
  "Heb jij een boek?": { zh: "你有一本书吗？", en: "Do you have a book?" },
  "Ja, ik heb een boek.": { zh: "是的，我有一本书。", en: "Yes, I have a book." },
  "Ik wil water.": { zh: "我想要水。", en: "I want water." },
  "Ik kan helpen.": { zh: "我可以帮忙。", en: "I can help." },
  "Ik kan niet komen.": { zh: "我不能来。", en: "I cannot come." },
  "Ik wil graag brood.": { zh: "我想要面包。", en: "I would like bread." },
  "Ik zoek brood.": { zh: "我找面包。", en: "I am looking for bread." },
  "Ik neem brood.": { zh: "我要面包。", en: "I will take bread." },
  "Dat is te duur.": { zh: "那太贵了。", en: "That is too expensive." },
  "Ik vind brood lekker.": { zh: "我觉得面包好吃。", en: "I like bread." },
  "Ik vind regen niet leuk.": { zh: "我不喜欢下雨。", en: "I do not like rain." },
  "Ik vind fietsen leuk.": { zh: "我喜欢骑自行车。", en: "I like cycling." },
  "Wil je koffie of thee?": { zh: "你想要咖啡还是茶？", en: "Do you want coffee or tea?" },
  "Mijn familie woont in China.": { zh: "我的家人住在中国。", en: "My family lives in China." },
  "Mijn huis heeft twee kamers.": { zh: "我的房子有两个房间。", en: "My home has two rooms." },
  "Er is een tafel in de kamer.": { zh: "房间里有一张桌子。", en: "There is a table in the room." },
  "De keuken is klein.": { zh: "厨房很小。", en: "The kitchen is small." },
  "Mijn collega is aardig.": { zh: "我的同事很友好。", en: "My colleague is nice." },
  "Ik sta om zeven uur op.": { zh: "我七点起床。", en: "I get up at seven." },
  "Ik werk elke dag.": { zh: "我每天工作。", en: "I work every day." },
  "Ik fiets vaak naar school.": { zh: "我经常骑车去学校。", en: "I often cycle to school." },
  "Ik heb hoofdpijn.": { zh: "我头疼。", en: "I have a headache." },
  "Ik ben moe.": { zh: "我累了。", en: "I am tired." },
  "Het gaat beter.": { zh: "好多了。", en: "It is getting better." },
  "Kan ik om drie uur komen?": { zh: "我可以三点来吗？", en: "Can I come at three o'clock?" },
  "Ik kan om drie uur.": { zh: "我三点可以。", en: "I can do three o'clock." },
  "Wanneer kan ik komen?": { zh: "我什么时候可以来？", en: "When can I come?" },
  "Ik bel later.": { zh: "我稍后打电话。", en: "I will call later." },
  "Ik bel voor een afspraak.": { zh: "我打电话是为了预约。", en: "I am calling for an appointment." },
  "Een moment, alstublieft.": { zh: "请稍等。", en: "One moment, please." },
  "Ik bel later terug.": { zh: "我稍后回电话。", en: "I will call back later." },
  "Ik woon in Delft en ik werk in Amsterdam.": { zh: "我住在代尔夫特，在阿姆斯特丹工作。", en: "I live in Delft and work in Amsterdam." },
};

const explicitLines: Record<string, string[]> = {
  hallo: ["Hallo.", "Hallo, ik ben Lin.", "Hallo, hoe gaat het?"],
  dag: ["Dag.", "Dag, tot morgen.", "Dag, tot ziens."],
  goedemorgen: ["Goedemorgen.", "Goedemorgen, hoe gaat het?", "Goedemorgen, ik ben Lin."],
  goedenavond: ["Goedenavond.", "Goedenavond, hoe gaat het?", "Goedenavond, tot ziens."],
  "tot ziens": ["Tot ziens.", "Tot ziens, fijne dag.", "Tot ziens, tot morgen."],
  "dank je": ["Dank je.", "Dank je wel.", "Dank je voor je hulp."],
  bedankt: ["Bedankt.", "Bedankt voor uw hulp.", "Alvast bedankt."],
  alsjeblieft: ["Alsjeblieft.", "Een koffie, alsjeblieft.", "Hier, alsjeblieft."],
  sorry: ["Sorry.", "Sorry, ik begrijp het niet.", "Sorry, kunt u dat herhalen?"],
  ja: ["Ja.", "Ja, dat klopt.", "Ja, graag."],
  nee: ["Nee.", "Nee, dat klopt niet.", "Nee, dank je."],
  heet: ["Ik heet Lin.", "Hoe heet jij?", "Mijn naam is Lin."],
  heb: ["Ik heb een boek.", "Heb jij een pen?", "Ik heb geen tas."],
  hebben: ["Wij hebben tijd.", "Ik heb een boek.", "Heb jij een pen?"],
  geen: ["Ik heb geen tas.", "Ik heb geen tijd.", "Nee, ik heb geen pen."],
  wel: ["Ik heb wel tijd.", "Ja, ik heb wel een pen.", "Dat klopt wel."],
  ben: ["Ik ben Lin.", "Ik ben student.", "Ben jij Anna?"],
  woon: ["Ik woon in Delft.", "Waar woon jij?", "Ik woon in Nederland."],
  kom: ["Ik kom uit China.", "Waar kom jij vandaan?", "Ik kom uit Nederland."],
  spreek: ["Ik spreek een beetje Nederlands.", "Spreek jij Engels?", "Ik spreek Chinees."],
  naam: ["Mijn naam is Lin.", "Hoe heet jij?", "Wat is uw naam?"],
  mijn: ["Mijn naam is Lin.", "Mijn telefoonnummer is ...", "Dit is mijn boek."],
  jouw: ["Wat is jouw naam?", "Is dit jouw boek?", "Jouw adres is belangrijk."],
  wie: ["Wie ben jij?", "Wie is dat?", "Wie komt vandaag?"],
  wat: ["Wat is dit?", "Wat betekent dit?", "Wat wil je?"],
  waar: ["Waar woon jij?", "Waar is het station?", "Waar kom jij vandaan?"],
  wanneer: ["Wanneer kan ik langskomen?", "Wanneer begint de les?", "Wanneer komt de trein?"],
  hoe: ["Hoe gaat het?", "Hoe heet jij?", "Hoe laat is het?"],
  hoeveel: ["Hoeveel kost dit?", "Hoeveel minuten vertraging is er?", "Hoeveel is de huur per maand?"],
  waarom: ["Waarom kom je niet?", "Waarom is de rekening hoog?", "Kunt u uitleggen waarom?"],
  welke: ["Welke dag is het vandaag?", "Welke trein neem je?", "Welke afspraak bedoelt u?"],
  afspraak: ["Ik wil graag een afspraak maken.", "Ik heb morgen een afspraak.", "Kan ik een afspraak verplaatsen?"],
  ziekenhuis: ["Ik moet naar het ziekenhuis.", "Mijn moeder ligt in het ziekenhuis.", "Waar is het ziekenhuis?"],
  huisarts: ["Ik bel de huisarts.", "Ik wil graag een afspraak maken met de huisarts.", "Kan ik vandaag naar de huisarts?"],
  tandarts: ["Ik ga naar de tandarts.", "Ik heb een afspraak bij de tandarts.", "Ik bel de tandarts."],
  gemeente: ["Ik ga naar de gemeente.", "Ik heb een afspraak bij de gemeente.", "Ik moet een formulier invullen."],
  apotheek: ["Ik ga naar de apotheek.", "Ik haal mijn medicijn bij de apotheek.", "Waar is de apotheek?"],
  medicijn: ["Ik neem het medicijn.", "Ik haal het medicijn bij de apotheek.", "Ik heb een medicijn nodig."],
  recept: ["Ik heb een recept nodig.", "De huisarts stuurt het recept.", "Ik haal het recept bij de apotheek."],
  formulier: ["Ik vul het formulier in.", "Ik moet het formulier ondertekenen.", "Waar moet ik het formulier inleveren?"],
  handtekening: ["Ik zet mijn handtekening.", "Hier moet mijn handtekening staan.", "Ik moet het formulier ondertekenen."],
  bewijs: ["Ik heb een bewijs nodig.", "Kunt u mij een bewijs geven?", "Ik neem het bewijs mee."],
  woning: ["Ik zoek een woning.", "Ik wil een woning huren.", "De woning is te duur."],
  huur: ["Ik betaal huur.", "De huur is hoog.", "Wanneer moet ik de huur betalen?"],
  huurcontract: ["Ik heb een huurcontract.", "Ik moet het huurcontract tekenen.", "Ik lees het huurcontract."],
  reparatie: ["Ik wil een reparatie melden.", "De reparatie is nodig.", "Wanneer komt de monteur?"],
  lekkage: ["Er is lekkage in de badkamer.", "Ik wil lekkage melden.", "De lekkage is dringend."],
  verwarming: ["De verwarming werkt niet.", "Ik wil de verwarming laten repareren.", "De verwarming is kapot."],
  rekening: ["Ik betaal de rekening.", "Ik heb een rekening gekregen.", "De rekening is te hoog."],
  factuur: ["Ik heb een factuur gekregen.", "Ik betaal de factuur.", "Kunt u de factuur uitleggen?"],
  verzekering: ["Ik heb een verzekering.", "Ik bel de verzekering.", "Wordt dit door de verzekering vergoed?"],
  zorgpas: ["Ik neem mijn zorgpas mee.", "Ik heb mijn zorgpas nodig.", "Waar is mijn zorgpas?"],
  premie: ["Ik betaal premie.", "De premie is hoog.", "Wanneer betaal ik de premie?"],
  trein: ["Ik neem de trein.", "De trein heeft vertraging.", "Wanneer komt de trein?"],
  station: ["Ik ga naar het station.", "Het station is dichtbij.", "Waar is het station?"],
  perron: ["De trein vertrekt van perron 3.", "Waar is het perron?", "Ik sta op het perron."],
  spoor: ["De trein vertrekt van spoor 4.", "Op welk spoor komt de trein?", "Ik zoek het spoor."],
  vertraging: ["De trein heeft vertraging.", "Ik kom later door vertraging.", "Hoeveel minuten vertraging is er?"],
  kaartje: ["Ik koop een kaartje.", "Ik heb een kaartje nodig.", "Waar kan ik een kaartje kopen?"],
  werk: ["Ik ga naar mijn werk.", "Ik ben vandaag op het werk.", "Ik kan niet naar mijn werk komen."],
  collega: ["Ik bel mijn collega.", "Mijn collega is ziek.", "Ik werk met mijn collega."],
  ziekmelding: ["Ik doe een ziekmelding.", "Ik bel voor een ziekmelding.", "Mijn ziekmelding is doorgegeven."],
  salaris: ["Mijn salaris staat op mijn rekening.", "Ik krijg mijn salaris op vrijdag.", "Ik heb een vraag over mijn salaris."],
  "e-mail": ["Ik stuur een e-mail.", "Ik heb een e-mail gekregen.", "Kunt u mij een e-mail sturen?"],
  bericht: ["Ik stuur een bericht.", "Ik heb een bericht gekregen.", "Kunt u het bericht herhalen?"],
  telefoonnummer: ["Mijn telefoonnummer is ...", "Kunt u mijn telefoonnummer noteren?", "Ik geef mijn telefoonnummer door."],
  hulp: ["Ik heb hulp nodig.", "Kunt u mij helpen?", "Ik vraag om hulp."],
  helpen: ["Kunt u mij helpen?", "Ik help u.", "Wij helpen samen."],
  probleem: ["Ik heb een probleem.", "Kunt u mij helpen met dit probleem?", "Het probleem is dringend."],
  klacht: ["Ik heb een klacht.", "Ik wil een klacht doorgeven.", "Mijn klacht gaat over de woning."],
  minuut: ["De trein heeft vijf minuten vertraging.", "Een uur heeft zestig minuten.", "Ik wacht tien minuten."],
  uur: ["Hoe laat is het?", "Het is drie uur.", "Een uur heeft zestig minuten."],
  week: ["Volgende week heb ik een afspraak.", "Deze week werk ik.", "Een week heeft zeven dagen."],
  maand: ["Volgende maand verhuis ik.", "Deze maand betaal ik de huur.", "Een jaar heeft twaalf maanden."],
  jaar: ["Ik woon hier twee jaar.", "Een jaar heeft twaalf maanden.", "Welk jaar is het?"],
  vandaag: ["Vandaag leer ik Nederlands.", "Vandaag heb ik tijd.", "Vandaag ga ik naar school."],
  morgen: ["Morgen heb ik een afspraak.", "Tot morgen.", "Morgen ga ik naar de gemeente."],
  gisteren: ["Gisteren was ik ziek.", "Gisteren heb ik gebeld.", "Gisteren had de trein vertraging."],
  avond: ["Goedenavond.", "Vanavond ben ik thuis.", "Ik bel u vanavond."],
  middag: ["Goedemiddag.", "Vanmiddag heb ik tijd.", "Ik kom vanmiddag langs."],
  ochtend: ["Goedemorgen.", "Morgenochtend bel ik.", "Ik werk in de ochtend."],
  maandag: ["Maandag heb ik les.", "Tot maandag.", "Maandag werk ik."],
  vrijdag: ["Vrijdag heb ik vrij.", "Tot vrijdag.", "Vrijdag ga ik naar huis."],
  uit: ["Ik kom uit China.", "Waar kom jij vandaan?", "Ik kom uit Nederland."],
  hier: ["Ik woon hier.", "Kom hier, alstublieft.", "Hier is mijn adres."],
  daar: ["Het station is daar.", "De balie is daar.", "Daar is de ingang."],
  arm: ["Mijn arm doet pijn.", "Ik heb pijn aan mijn arm.", "Ik beweeg mijn arm."],
  been: ["Mijn been doet pijn.", "Ik heb pijn aan mijn been.", "Mijn been is moe."],
  hoofd: ["Ik heb hoofdpijn.", "Mijn hoofd doet pijn.", "Ik ben duizelig."],
  buik: ["Ik heb buikpijn.", "Mijn buik doet pijn.", "Ik heb pijn in mijn buik."],
  hand: ["Mijn hand doet pijn.", "Ik was mijn handen.", "Ik schrijf met mijn hand."],
  voet: ["Mijn voet doet pijn.", "Ik heb pijn aan mijn voet.", "Mijn voet is koud."],
  rug: ["Mijn rug doet pijn.", "Ik heb pijn aan mijn rug.", "Ik kan niet lang zitten."],
  keel: ["Ik heb keelpijn.", "Mijn keel doet pijn.", "Ik moet hoesten."],
  verkouden: ["Ik ben verkouden.", "Ik voel me verkouden.", "Ik ben ziek en verkouden."],
  hoesten: ["Ik moet hoesten.", "Ik hoest veel.", "Ik moet vaak hoesten."],
  rusten: ["Ik rust even.", "Ik moet vandaag rusten.", "Ik wil even rusten."],
  herstel: ["Mijn herstel duurt langer.", "Ik heb tijd nodig voor herstel.", "Ik ben nog bezig met herstel."],
  loonstrook: ["Ik heb mijn loonstrook gekregen.", "Op mijn loonstrook staat mijn salaris.", "Ik heb een vraag over mijn loonstrook."],
  proeftijd: ["Mijn proeftijd is drie maanden.", "Ik zit nog in mijn proeftijd.", "Wanneer eindigt mijn proeftijd?"],
  afwezigheid: ["Ik geef mijn afwezigheid door.", "Mijn afwezigheid staat in het systeem.", "Ik meld mijn afwezigheid vandaag."],
  uitzendbureau: ["Ik werk via een uitzendbureau.", "Het uitzendbureau belt mij morgen.", "Ik heb contact met het uitzendbureau."],
  verlof: ["Ik vraag verlof aan.", "Ik heb morgen verlof.", "Mijn verlof is goedgekeurd."],
  waterrekening: ["Ik moet de waterrekening betalen.", "De waterrekening is hoger dan normaal.", "Ik heb een vraag over de waterrekening."],
  herinnering: ["Ik heb een herinnering gekregen.", "De herinnering gaat over de rekening.", "Ik moet op de herinnering reageren."],
};

const actionLines: Record<string, string[]> = {
  begin: ["Ik begin nu.", "Begin nu.", "Wanneer beginnen we?"],
  bellen: ["Ik bel de huisarts.", "Kunt u mij terugbellen?", "Ik wil vandaag bellen."],
  drinken: ["Ik drink water.", "Wil je iets drinken?", "Ik drink koffie."],
  eten: ["Ik eet brood.", "Ik wil iets eten.", "Wij eten om zes uur."],
  klik: ["Klik hier.", "Ik klik op de knop.", "Waar moet ik klikken?"],
  koken: ["Ik kook vandaag.", "Wij koken thuis.", "Wat kook je vandaag?"],
  leren: ["Ik leer Nederlands.", "Ik leer elke dag.", "Wat leer je vandaag?"],
  lees: ["Lees de zin.", "Ik lees de zin.", "Kun je dit lezen?"],
  lezen: ["Ik lees de brief.", "Kun je dit lezen?", "Ik lees Nederlands."],
  luister: ["Luister goed.", "Ik luister naar de zin.", "Kun je luisteren en herhalen?"],
  lopen: ["Ik loop naar huis.", "Wij lopen naar het station.", "Ik loop rechtdoor."],
  open: ["Open de app.", "Ik open het formulier.", "Kun je de deur openen?"],
  opstaan: ["Ik sta vroeg op.", "Hoe laat sta je op?", "Vandaag sta ik om zeven uur op."],
  slapen: ["Ik slaap goed.", "Ik wil slapen.", "Hoe laat slaap je?"],
  schrijf: ["Schrijf je naam.", "Ik schrijf mijn naam.", "Kun je dit opschrijven?"],
  schrijven: ["Ik schrijf een korte zin.", "Ik schrijf mijn naam.", "Kun je een e-mail schrijven?"],
  sluit: ["Sluit de app.", "Ik sluit het raam.", "Kun je de deur sluiten?"],
  stop: ["Stop nu.", "Ik stop hier.", "Wanneer stopt de bus?"],
  wassen: ["Ik was mijn handen.", "Ik was mijn gezicht.", "Waar kan ik mijn handen wassen?"],
  werken: ["Ik werk vandaag.", "Waar werk je?", "Ik werk in Amsterdam."],
  zeg: ["Zeg hallo.", "Ik zeg mijn naam.", "Kun je dat nog een keer zeggen?"],
  kijk: ["Kijk naar de zin.", "Ik kijk naar het bord.", "Kun je even kijken?"],
  kijken: ["Ik kijk naar het bord.", "Wij kijken samen.", "Kun je even kijken?"],
};

const weakSentencePatterns = [
  /^Ik leer het woord /,
  /^Ik leer [a-zA-ZÀ-ÿ\s-]+\.$/,
  /^Wat betekent /,
  /^Ik zeg [a-zA-ZÀ-ÿ\s-]+\.$/,
  /^Dat is [a-zA-ZÀ-ÿ\s-]+\.$/,
  /^Dit is (de|het)\s+[a-zA-ZÀ-ÿ-]+\.?$/i,
];

const bodyPartWordsPattern = "(arm|been|hoofd|buik|hand|voet|rug|keel|oor|neus|mond|tand|schouder|knie|nek)";
const symptomWordsPattern = "(verkouden|hoesten|hoofdpijn|buikpijn|keelpijn|koorts|duizelig|misselijk|moe|benauwd)";
const adminWorkWordsPattern = "(salaris|loonstrook|proeftijd|afwezigheid|herinnering|waterrekening|herstel|verlof|uitzendbureau)";
const badLearnerLinePatterns = [
  /^Ik ga naar (uit|hier|daar)\.?$/i,
  new RegExp(`^Ik ga naar ((de|het)\\s+)?${bodyPartWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik ga naar ${symptomWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik gebruik ((de|het)\\s+)?${bodyPartWordsPattern}\\.?$`, "i"),
  new RegExp(`^Waar is ((de|het)\\s+)?${bodyPartWordsPattern}\\??$`, "i"),
  new RegExp(`^Ik heb (de|het)\\s+${bodyPartWordsPattern} nodig\\.?$`, "i"),
  new RegExp(`^Ik zoek ((de|het|een)\\s+)?${adminWorkWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik ga naar ${adminWorkWordsPattern}\\.?$`, "i"),
  /^Ik zeg (heet|heb|ben|wel|geen|wanneer|waar|wat|wie|hoe)\.?$/i,
  /^Dit is (heet|ben|heb|wil|kan|dit|dat|dag)\.?$/i,
  /^Dit is (de|het)\s+[a-zA-ZÀ-ÿ-]+\.?$/i,
];

const isBadLearnerLine = (value: string) => badLearnerLinePatterns.some((pattern) => pattern.test(value.trim()));

const withPeriod = (value: string) => {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const isSentence = (value: string) => /[.!?]$/.test(value.trim()) || /^(Ik|Jij|U|Wij|De|Het|Er|Waar|Wanneer|Kan|Kunt|Mijn)\b/.test(value.trim());

const isWeakSentence = (value: string) => weakSentencePatterns.some((pattern) => pattern.test(value.trim()));

const isBareWordSentence = (line: string, word: string) => {
  const normalizedLine = line.trim().replace(/[.!?]$/, "").toLowerCase();
  return normalizedLine === word.trim().toLowerCase();
};

const themeLines: Record<string, (word: WordSentenceSource) => string[]> = {
  "time-date": (word) => [`Hoe laat is het?`, `Ik wacht tien minuten.`, `Volgende week heb ik tijd.`],
  appointments: (word) => [`Ik wil graag een afspraak maken.`, `Wanneer kan ik langskomen?`, `Kan ik de afspraak verplaatsen?`],
  transport: (word) => [`Ik ga naar het station.`, `De trein heeft vertraging.`, `Ik koop een kaartje.`],
  "transport-delays": (word) => [`De trein heeft vertraging.`, `Hoeveel minuten vertraging is er?`, `Ik kom later.`],
  health: (word) => [`Ik ben ziek.`, `Ik bel de huisarts.`, `Ik heb pijn.`],
  gp: (word) => [`Ik bel de huisarts.`, `Ik wil graag een afspraak maken.`, `Ik heb een klacht.`],
  pharmacy: (word) => [`Ik haal mijn medicijn bij de apotheek.`, `Ik heb een recept nodig.`, `Hoe moet ik dit medicijn gebruiken?`],
  "forms-documents": (word) => [`Ik vul het formulier in.`, `Waar moet ik tekenen?`, `Ik neem het document mee.`],
  municipality: (word) => [`Ik ga naar de gemeente.`, `Ik heb een afspraak bij de gemeente.`, `Kunt u mij helpen?`],
  "bills-payments": (word) => [`Ik betaal de rekening.`, `Ik heb een vraag over de factuur.`, `Het bedrag klopt niet.`],
  insurance: (word) => [`Ik bel de verzekering.`, `Wordt dit vergoed?`, `Ik heb mijn zorgpas nodig.`],
  "phone-calls": (word) => [`Ik bel u morgen terug.`, `Kunt u dat herhalen?`, `Kunt u mijn telefoonnummer noteren?`],
  help: (word) => [`Kunt u mij helpen?`, `Ik heb hulp nodig.`, `Kunt u dat uitleggen?`],
};

function linesFromTheme(word: WordSentenceSource) {
  const keys = [word.theme, ...(word.scenarioTags ?? [])].filter(Boolean) as string[];
  return keys.flatMap((key) => themeLines[key]?.(word) ?? []);
}

function lineFromPhrase(phrase: string) {
  const value = phrase.trim();
  if (!value) return undefined;
  if (isSentence(value) && !isWeakSentence(value)) return withPeriod(value);
  if (value.endsWith(" maken")) return `Ik wil graag ${value}.`;
  if (value.startsWith("naar ") && value.endsWith(" gaan")) return `Ik ga ${value.replace(/ gaan$/, "")}.`;
  if (value.endsWith(" bellen")) return `Ik wil ${value}.`;
  if (value.endsWith(" betalen")) return `Ik wil ${value}.`;
  if (value.endsWith(" invullen")) return `Ik moet ${value}.`;
  if (value.endsWith(" schrijven")) return `Ik wil ${value}.`;
  if (value.endsWith(" doen")) return `Ik moet ${value}.`;
  return undefined;
}

export function usableSentenceLinesFor(word: WordSentenceSource, limit = 3) {
  const lines = new Set<string>();
  const explicit = explicitLines[word.dutch] ?? actionLines[word.dutch];
  explicit?.forEach((line) => lines.add(line));
  linesFromTheme(word).forEach((line) => lines.add(line));

  word.phraseChunks?.forEach((phrase) => {
    const line = lineFromPhrase(phrase);
    if (line) lines.add(line);
  });

  const example = word.exampleSentence?.dutch;
  if (example && !isWeakSentence(example) && !isBareWordSentence(example, word.dutch)) lines.add(withPeriod(example));

  return Array.from(lines)
    .filter((line) => !isBadLearnerLine(line))
    .slice(0, limit);
}

export function primaryUsableSentenceFor(word: WordSentenceSource) {
  return usableSentenceLinesFor(word, 1)[0] ?? "";
}

const sentenceCase = (value: string) => value ? value[0].toUpperCase() + value.slice(1) : value;

const cleanDutchText = (value: string) => value.trim().replace(/\s+/g, " ");

const withoutFinalPunctuation = (value: string) => cleanDutchText(value).replace(/[.!?]+$/g, "");

const objectZh = (value: string) => nounLabel(withoutFinalPunctuation(value).replace(/^(de|het|een)\s+/i, ""));

const objectEn = (value: string) => nounLabelEn(withoutFinalPunctuation(value).replace(/^(de|het|een)\s+/i, ""));

const looseGlossMeaning = (value: string): SentenceMeaning => {
  const tokens = withoutFinalPunctuation(value)
    .split(/\s+/)
    .map((token) => token.replace(/[,;:]/g, ""))
    .filter(Boolean);
  if (!tokens.length) return { zh: "", en: "" };

  const zhParts = tokens.map((token) => looseGlossZh[token] ?? nounZh[token] ?? "");
  const enParts = tokens.map((token) => looseGlossEn[token] ?? nounEn[token] ?? "");
  const knownCount = zhParts.filter(Boolean).length;
  if (knownCount < Math.max(1, Math.ceil(tokens.length * 0.65))) return { zh: "", en: "" };

  return {
    zh: `${zhParts.map((part, index) => part || tokens[index]).join(" / ")}。`,
    en: `${sentenceCase(enParts.map((part, index) => part || tokens[index]).join(" / "))}.`,
  };
};

export function meaningForUsableSentence(sentence: string): SentenceMeaning {
  const normalized = sentence.trim();
  if (sentenceMeanings[normalized]) return sentenceMeanings[normalized];

  const ikBen = normalized.match(/^Ik ben ([A-ZÀ-ÿa-z-]+)\.$/);
  if (ikBen) {
    const word = ikBen[1];
    return {
      zh: `我是${identityZh[word] ?? word}。`,
      en: `I am ${identityEn[word] ?? word}.`,
    };
  }

  const benJij = normalized.match(/^Ben jij ([A-ZÀ-ÿa-z-]+)\?$/);
  if (benJij) {
    const word = benJij[1];
    return {
      zh: `你是${identityZh[word] ?? word}吗？`,
      en: `Are you ${identityEn[word] ?? word}?`,
    };
  }

  const ikHeet = normalized.match(/^Ik heet (.+)\.$/);
  if (ikHeet) {
    return {
      zh: `我叫${ikHeet[1]}。`,
      en: `My name is ${ikHeet[1]}.`,
    };
  }

  const mijnNaam = normalized.match(/^Mijn naam is (.+)\.$/);
  if (mijnNaam) {
    return {
      zh: `我的名字是${mijnNaam[1]}。`,
      en: `My name is ${mijnNaam[1]}.`,
    };
  }

  const watIsNaam = normalized.match(/^Wat is (jouw|je|uw) naam\?$/);
  if (watIsNaam) {
    return {
      zh: watIsNaam[1] === "uw" ? "您叫什么名字？" : "你叫什么名字？",
      en: "What is your name?",
    };
  }

  const ikWoon = normalized.match(/^Ik woon in (.+)\.$/);
  if (ikWoon) {
    return {
      zh: `我住在${ikWoon[1]}。`,
      en: `I live in ${ikWoon[1]}.`,
    };
  }

  const ikKomUit = normalized.match(/^Ik kom uit (.+)\.$/);
  if (ikKomUit) {
    return {
      zh: `我来自${ikKomUit[1]}。`,
      en: `I come from ${ikKomUit[1]}.`,
    };
  }

  const ikSpreek = normalized.match(/^Ik spreek (.+)\.$/);
  if (ikSpreek) {
    return {
      zh: `我说${objectZh(ikSpreek[1])}。`,
      en: `I speak ${objectEn(ikSpreek[1])}.`,
    };
  }

  const spreektU = normalized.match(/^Spreekt u (.+)\?$/);
  if (spreektU) {
    return {
      zh: `您说${objectZh(spreektU[1])}吗？`,
      en: `Do you speak ${objectEn(spreektU[1])}?`,
    };
  }

  const ikLeer = normalized.match(/^Ik leer (.+)\.$/);
  if (ikLeer) {
    return {
      zh: `我学${objectZh(ikLeer[1])}。`,
      en: `I learn ${objectEn(ikLeer[1])}.`,
    };
  }

  const ditIs = normalized.match(/^(Dit|Dat) is (de|het|een) (.+)\.$/);
  if (ditIs) {
    const isThis = ditIs[1] === "Dit";
    const article = ditIs[2];
    const noun = ditIs[3];
    return {
      zh: `${isThis ? "这是" : "那是"}${nounLabel(noun)}。`,
      en: `${isThis ? "This" : "That"} is ${article === "een" ? "a" : "the"} ${nounLabelEn(noun)}.`,
    };
  }

  const ikHebNodig = normalized.match(/^Ik heb (de|het|een) (.+) nodig\.$/);
  if (ikHebNodig) {
    const object = ikHebNodig[2];
    return {
      zh: `我需要${nounLabel(object)}。`,
      en: `I need ${ikHebNodig[1] === "een" ? "a" : "the"} ${nounLabelEn(object)}.`,
    };
  }

  const ikHebGeen = normalized.match(/^Ik heb geen (.+)\.$/);
  if (ikHebGeen) {
    return {
      zh: `我没有${objectZh(ikHebGeen[1])}。`,
      en: `I do not have ${objectEn(ikHebGeen[1])}.`,
    };
  }

  const ikHeb = normalized.match(/^Ik heb (de|het|een) (.+)\.$/);
  if (ikHeb) {
    return {
      zh: `我有${nounLabel(ikHeb[2])}。`,
      en: `I have ${ikHeb[1] === "een" ? "a" : "the"} ${nounLabelEn(ikHeb[2])}.`,
    };
  }

  const ikHebVraagOver = normalized.match(/^Ik heb een vraag over (de|het|een) (.+)\.$/);
  if (ikHebVraagOver) {
    return {
      zh: `我有一个关于${nounLabel(ikHebVraagOver[2])}的问题。`,
      en: `I have a question about the ${nounLabelEn(ikHebVraagOver[2])}.`,
    };
  }

  const hebJij = normalized.match(/^Heb jij (de|het|een) (.+)\?$/);
  if (hebJij) {
    return {
      zh: `你有${nounLabel(hebJij[2])}吗？`,
      en: `Do you have ${hebJij[1] === "een" ? "a" : "the"} ${nounLabelEn(hebJij[2])}?`,
    };
  }

  const waarIs = normalized.match(/^Waar is (de|het) (.+)\?$/);
  if (waarIs) {
    return {
      zh: `${nounLabel(waarIs[2])}在哪里？`,
      en: `Where is the ${waarIs[2]}?`,
    };
  }

  const ikGaNaar = normalized.match(/^Ik ga naar (de|het) (.+)\.$/);
  if (ikGaNaar) {
    return {
      zh: `我去${nounLabel(ikGaNaar[2])}。`,
      en: `I go to the ${ikGaNaar[2]}.`,
    };
  }

  const ikWil = normalized.match(/^Ik wil(?: graag)? (.+)\.$/);
  if (ikWil) {
    return {
      zh: `我想要${objectZh(ikWil[1])}。`,
      en: `I would like ${objectEn(ikWil[1])}.`,
    };
  }

  const ikKan = normalized.match(/^Ik kan (.+)\.$/);
  if (ikKan) {
    return {
      zh: `我可以${objectZh(ikKan[1])}。`,
      en: `I can ${objectEn(ikKan[1])}.`,
    };
  }

  const kuntU = normalized.match(/^Kunt u (mij|dat) (helpen|herhalen|uitleggen)\?$/);
  if (kuntU) {
    const verbZh: Record<string, string> = { helpen: "帮我", herhalen: "重复一下", uitleggen: "解释一下" };
    const verbEn: Record<string, string> = { helpen: "help me", herhalen: "repeat that", uitleggen: "explain that" };
    return {
      zh: `您可以${verbZh[kuntU[2]]}吗？`,
      en: `Can you ${verbEn[kuntU[2]]}?`,
    };
  }

  const ikBel = normalized.match(/^Ik bel (de|het) (.+)\.$/);
  if (ikBel) {
    return {
      zh: `我给${nounLabel(ikBel[2])}打电话。`,
      en: `I call the ${nounLabelEn(ikBel[2])}.`,
    };
  }

  const ikKoop = normalized.match(/^Ik koop (de|het|een) (.+)\.$/);
  if (ikKoop) {
    return {
      zh: `我买${nounLabel(ikKoop[2])}。`,
      en: `I buy ${ikKoop[1] === "een" ? "a" : "the"} ${nounLabelEn(ikKoop[2])}.`,
    };
  }

  const ikVulIn = normalized.match(/^Ik vul (mijn|het|de) (.+) in\.$/);
  if (ikVulIn) {
    return {
      zh: `我填写${nounLabel(ikVulIn[2])}。`,
      en: `I fill in ${ikVulIn[1] === "mijn" ? "my" : "the"} ${nounLabelEn(ikVulIn[2])}.`,
    };
  }

  const ikBetaal = normalized.match(/^Ik betaal (de|het) (.+)\.$/);
  if (ikBetaal) {
    return {
      zh: `我支付${nounLabel(ikBetaal[2])}。`,
      en: `I pay the ${nounLabelEn(ikBetaal[2])}.`,
    };
  }

  const phraseOnly = withoutFinalPunctuation(normalized);
  if (nounZh[phraseOnly] || nounEn[phraseOnly]) {
    return {
      zh: nounZh[phraseOnly] ? `${nounZh[phraseOnly]}。` : "",
      en: nounEn[phraseOnly] ? `${sentenceCase(nounEn[phraseOnly])}.` : "",
    };
  }

  const loose = looseGlossMeaning(normalized);
  if (loose.zh || loose.en) return loose;

  return {
    zh: "",
    en: "",
  };
}
