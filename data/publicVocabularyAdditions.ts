import type { CourseLevel } from "@/types/course";
import { b1VocabularyThemes } from "@/data/b1VocabularyThemes";

export type PublicVocabularyEntry = [dutch: string, zh: string, en: string, article?: "de" | "het"];

export type PublicVocabularyTheme = {
  level: CourseLevel;
  theme: string;
  titleZh: string;
  titleEn: string;
  entries: PublicVocabularyEntry[];
};

const publicVocabularyBaseAdditions: PublicVocabularyTheme[] = [
  {
    level: "A0",
    theme: "a0-survival-classroom-extra",
    titleZh: "A0 生存课堂补充",
    titleEn: "A0 survival classroom extra",
    entries: [
      ["luister", "听", "listen"], ["lees", "读", "read"], ["schrijf", "写", "write"], ["zeg", "说", "say"], ["klik", "点击", "click"], ["kijk", "看", "look"], ["begin", "开始", "start"], ["stop", "停止", "stop"], ["open", "打开", "open"], ["sluit", "关闭", "close"], ["herhaal", "重复", "repeat"], ["wacht", "等一下", "wait"], ["samen", "一起", "together"], ["alleen", "独自", "alone"], ["nogmaals", "再一次", "again"], ["klaar", "完成/准备好", "ready/done"], ["juist", "正确", "correct"], ["fout", "错误", "wrong"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-people-extra",
    titleZh: "A0 人和身份补充",
    titleEn: "A0 people and identity extra",
    entries: [
      ["persoon", "人", "person", "de"], ["mens", "人", "human/person", "de"], ["man", "男人", "man", "de"], ["vrouw", "女人", "woman", "de"], ["kind", "孩子", "child", "het"], ["vriend", "朋友", "friend", "de"], ["vriendin", "女性朋友/女友", "female friend/girlfriend", "de"], ["student", "学生", "student", "de"], ["leraar", "老师", "teacher", "de"], ["buurman", "男邻居", "male neighbor", "de"], ["buurvrouw", "女邻居", "female neighbor", "de"], ["familie", "家庭/家人", "family", "de"], ["ouders", "父母", "parents"], ["partner", "伴侣", "partner", "de"], ["baby", "婴儿", "baby", "de"], ["meisje", "女孩", "girl", "het"], ["jongen", "男孩", "boy", "de"], ["naamkaartje", "名牌", "name tag", "het"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-objects-extra",
    titleZh: "A0 基础物品补充",
    titleEn: "A0 basic objects extra",
    entries: [
      ["stoel", "椅子", "chair", "de"], ["tafel", "桌子", "table", "de"], ["bed", "床", "bed", "het"], ["lamp", "灯", "lamp", "de"], ["deur", "门", "door", "de"], ["raam", "窗", "window", "het"], ["sleutel", "钥匙", "key", "de"], ["tas", "包", "bag", "de"], ["jas", "外套", "coat", "de"], ["bril", "眼镜", "glasses", "de"], ["papier", "纸", "paper", "het"], ["schrift", "本子", "notebook", "het"], ["potlood", "铅笔", "pencil", "het"], ["computer", "电脑", "computer", "de"], ["laptop", "笔记本电脑", "laptop", "de"], ["app", "应用", "app", "de"], ["foto", "照片", "photo", "de"], ["kaartje", "票/卡片", "ticket/card", "het"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-food-place-extra",
    titleZh: "A0 食物地点补充",
    titleEn: "A0 food and place extra",
    entries: [
      ["brood", "面包", "bread", "het"], ["melk", "牛奶", "milk", "de"], ["koffie", "咖啡", "coffee", "de"], ["thee", "茶", "tea", "de"], ["appel", "苹果", "apple", "de"], ["rijst", "米饭", "rice", "de"], ["soep", "汤", "soup", "de"], ["ei", "鸡蛋", "egg", "het"], ["school", "学校", "school", "de"], ["winkel", "商店", "shop", "de"], ["station", "车站", "station", "het"], ["straat", "街道", "street", "de"], ["kamer", "房间", "room", "de"], ["keuken", "厨房", "kitchen", "de"], ["wc", "厕所", "toilet", "de"], ["links", "左边", "left"], ["rechts", "右边", "right"], ["rechtdoor", "直走", "straight ahead"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-short-extra",
    titleZh: "A0 短词补充",
    titleEn: "A0 short word extra",
    entries: [
      ["ja hoor", "当然/好的", "yes sure"], ["nee hoor", "不/没关系", "no"], ["prima", "很好/可以", "fine"], ["oké", "好的", "okay"], ["welkom", "欢迎", "welcome"], ["tot morgen", "明天见", "see you tomorrow"], ["tot straks", "一会儿见", "see you soon"], ["geen probleem", "没问题", "no problem"], ["maakt niet uit", "没关系", "it does not matter"], ["ik ook", "我也是", "me too"], ["ik niet", "我不是/我没有", "not me"], ["hier is", "这里是/这是", "here is"], ["daar is", "那里是", "there is"], ["kom hier", "来这里", "come here"], ["ga weg", "走开/离开", "go away"], ["wacht even", "等一下", "wait a moment"], ["kijk hier", "看这里", "look here"], ["zeg maar", "请说/你说", "go ahead/say it"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-basic-actions-extra",
    titleZh: "A0 基础动作补充",
    titleEn: "A0 basic actions extra",
    entries: [
      ["neem", "拿/带", "take"], ["geef", "给", "give"], ["pak", "拿", "grab"], ["zet", "放置", "put"], ["leg", "放平", "lay"], ["zit", "坐", "sit"], ["sta", "站", "stand"], ["loop", "走", "walk"], ["eet", "吃", "eat"], ["drink", "喝", "drink"], ["slaap", "睡", "sleep"], ["werk", "工作", "work"], ["leer", "学习", "learn"], ["bel", "打电话", "call"], ["zoek", "找", "search"], ["koop", "买", "buy"], ["vraag", "问", "ask"], ["antwoord", "回答", "answer"],
    ],
  },
  {
    level: "A0",
    theme: "a0-survival-tiny-extra",
    titleZh: "A0 余量短词",
    titleEn: "A0 tiny reserve words",
    entries: [
      ["mooi", "好看", "nice"], ["lekker", "好吃", "tasty"], ["warm", "暖/热", "warm"], ["koud", "冷", "cold"], ["nieuw", "新的", "new"], ["oud", "旧/老", "old"], ["klein", "小", "small"], ["groot", "大", "big"], ["veel", "很多", "much/many"], ["weinig", "很少", "little/few"], ["meer", "更多", "more"], ["minder", "更少", "less"],
    ],
  },
  {
    level: "A1",
    theme: "personal-details-expanded",
    titleZh: "个人信息扩展",
    titleEn: "expanded personal details",
    entries: [
      ["geboorteplaats", "出生地", "place of birth", "de"], ["nationaliteit", "国籍", "nationality", "de"], ["burgerlijke staat", "婚姻状况", "marital status"], ["alleenstaand", "单身的", "single"], ["getrouwd", "已婚的", "married"], ["gescheiden", "离婚的", "divorced"], ["weduwe", "寡妇", "widow", "de"], ["weduwnaar", "鳏夫", "widower", "de"], ["mobiel", "手机", "mobile phone", "de"], ["nummer", "号码", "number", "het"], ["huisnummer", "门牌号", "house number", "het"], ["straatnaam", "街名", "street name", "de"], ["woonplaats", "居住地", "place of residence", "de"], ["provincie", "省", "province", "de"], ["buurt", "社区", "neighborhood", "de"], ["buur", "邻居", "neighbor", "de"], ["mevrouw", "女士", "madam/Ms.", "de"], ["meneer", "先生", "sir/Mr.", "de"],
    ],
  },
  {
    level: "A1",
    theme: "countries-languages-expanded",
    titleZh: "国家语言扩展",
    titleEn: "expanded countries and languages",
    entries: [
      ["Duitsland", "德国", "Germany", "het"], ["België", "比利时", "Belgium", "het"], ["Frankrijk", "法国", "France", "het"], ["Spanje", "西班牙", "Spain", "het"], ["Italië", "意大利", "Italy", "het"], ["Polen", "波兰", "Poland", "het"], ["Turkije", "土耳其", "Turkey", "het"], ["Marokko", "摩洛哥", "Morocco", "het"], ["Syrië", "叙利亚", "Syria", "het"], ["Oekraïne", "乌克兰", "Ukraine", "de"], ["Duits", "德语", "German", "het"], ["Frans", "法语", "French", "het"], ["Spaans", "西班牙语", "Spanish", "het"], ["Arabisch", "阿拉伯语", "Arabic", "het"], ["Pools", "波兰语", "Polish", "het"], ["Turks", "土耳其语", "Turkish", "het"], ["vertaling", "翻译", "translation", "de"], ["tolk", "口译员", "interpreter", "de"],
    ],
  },
  {
    level: "A1",
    theme: "home-kitchen-expanded",
    titleZh: "家与厨房扩展",
    titleEn: "expanded home and kitchen",
    entries: [
      ["woonkamer", "客厅", "living room", "de"], ["hal", "门厅", "hallway", "de"], ["zolder", "阁楼", "attic", "de"], ["kelder", "地下室", "basement", "de"], ["balkon", "阳台", "balcony", "het"], ["lift", "电梯", "elevator", "de"], ["gang", "走廊", "corridor", "de"], ["gordijn", "窗帘", "curtain", "het"], ["deken", "毯子", "blanket", "de"], ["kussen", "枕头", "pillow", "het"], ["matras", "床垫", "mattress", "het"], ["spiegel", "镜子", "mirror", "de"], ["douche", "淋浴", "shower", "de"], ["kraan", "水龙头", "tap", "de"], ["gootsteen", "水槽", "sink", "de"], ["fornuis", "炉灶", "stove", "het"], ["oven", "烤箱", "oven", "de"], ["koelkast", "冰箱", "fridge", "de"],
    ],
  },
  {
    level: "A1",
    theme: "kitchen-tableware",
    titleZh: "餐具和厨房用品",
    titleEn: "tableware and kitchen items",
    entries: [
      ["bord", "盘子", "plate", "het"], ["kom", "碗", "bowl", "de"], ["glas", "玻璃杯", "glass", "het"], ["beker", "杯子", "cup", "de"], ["kop", "杯子/头", "cup/head", "de"], ["mes", "刀", "knife", "het"], ["vork", "叉子", "fork", "de"], ["lepel", "勺子", "spoon", "de"], ["pan", "锅", "pan", "de"], ["pot", "罐/锅", "pot", "de"], ["bak", "盒/盆", "container", "de"], ["bordje", "小盘子", "small plate", "het"], ["servet", "餐巾", "napkin", "het"], ["tafelkleed", "桌布", "tablecloth", "het"], ["afwas", "洗碗", "dishes", "de"], ["zeep", "肥皂", "soap", "de"], ["handdoek", "毛巾", "towel", "de"], ["vuilniszak", "垃圾袋", "trash bag", "de"],
    ],
  },
  {
    level: "A1",
    theme: "food-expanded",
    titleZh: "食物扩展",
    titleEn: "expanded food",
    entries: [
      ["ei", "鸡蛋", "egg", "het"], ["vlees", "肉", "meat", "het"], ["rundvlees", "牛肉", "beef", "het"], ["varkensvlees", "猪肉", "pork", "het"], ["groente", "蔬菜", "vegetable", "de"], ["tomaat", "番茄", "tomato", "de"], ["komkommer", "黄瓜", "cucumber", "de"], ["wortel", "胡萝卜", "carrot", "de"], ["ui", "洋葱", "onion", "de"], ["knoflook", "大蒜", "garlic", "de"], ["paprika", "彩椒", "bell pepper", "de"], ["sla", "生菜", "lettuce", "de"], ["boon", "豆子", "bean", "de"], ["pasta", "意面", "pasta", "de"], ["noedel", "面条", "noodle", "de"], ["suiker", "糖", "sugar", "de"], ["zout", "盐", "salt", "het"], ["peper", "胡椒", "pepper", "de"],
    ],
  },
  {
    level: "A1",
    theme: "fruit-drinks-expanded",
    titleZh: "水果和饮料扩展",
    titleEn: "expanded fruit and drinks",
    entries: [
      ["peer", "梨", "pear", "de"], ["druif", "葡萄", "grape", "de"], ["aardbei", "草莓", "strawberry", "de"], ["citroen", "柠檬", "lemon", "de"], ["meloen", "甜瓜", "melon", "de"], ["perzik", "桃子", "peach", "de"], ["fruit", "水果", "fruit", "het"], ["aardappel", "土豆", "potato", "de"], ["sinaasappel", "橙子", "orange", "de"], ["sap", "果汁", "juice", "het"], ["sinaasappelsap", "橙汁", "orange juice", "het"], ["frisdrank", "软饮", "soft drink", "de"], ["bier", "啤酒", "beer", "het"], ["wijn", "葡萄酒", "wine", "de"], ["sojamelk", "豆奶", "soy milk", "de"], ["kraanwater", "自来水", "tap water", "het"], ["mineraalwater", "矿泉水", "mineral water", "het"], ["warm water", "热水", "hot water"], ["koud water", "冷水", "cold water"], ["zonder suiker", "不加糖", "without sugar"],
    ],
  },
  {
    level: "A1",
    theme: "transport-expanded",
    titleZh: "交通扩展",
    titleEn: "expanded transport",
    entries: [
      ["vliegtuig", "飞机", "airplane", "het"], ["vliegen", "飞/乘飞机", "fly"], ["boot", "船", "boat", "de"], ["taxi", "出租车", "taxi", "de"], ["scooter", "踏板车", "scooter", "de"], ["motor", "摩托车", "motorbike", "de"], ["brommer", "轻便摩托", "moped", "de"], ["chauffeur", "司机", "driver", "de"], ["reiziger", "乘客/旅客", "traveler", "de"], ["rit", "一段车程", "ride", "de"], ["reisplanner", "行程规划器", "travel planner", "de"], ["vertrek", "出发", "departure", "het"], ["aankomst", "到达", "arrival", "de"], ["richting", "方向", "direction", "de"], ["lijn", "线路", "line", "de"], ["overstappen", "换乘", "transfer"], ["inchecken", "刷卡进站", "check in"], ["uitchecken", "刷卡出站", "check out"], ["ov-chipkaart", "公共交通卡", "public transport card", "de"],
    ],
  },
  {
    level: "A1",
    theme: "places-services",
    titleZh: "地点和基础服务",
    titleEn: "places and basic services",
    entries: [
      ["postkantoor", "邮局", "post office", "het"], ["bank", "银行", "bank", "de"], ["gemeentehuis", "市政厅", "town hall", "het"], ["ziekenhuis", "医院", "hospital", "het"], ["politiebureau", "警察局", "police station", "het"], ["bioscoop", "电影院", "cinema", "de"], ["museum", "博物馆", "museum", "het"], ["zwembad", "游泳池", "swimming pool", "het"], ["sportschool", "健身房", "gym", "de"], ["kerk", "教堂", "church", "de"], ["moskee", "清真寺", "mosque", "de"], ["stationingang", "车站入口", "station entrance", "de"], ["halteplaats", "停靠点", "stop location", "de"], ["balie", "柜台", "service desk", "de"], ["wachtruimte", "等候区", "waiting area", "de"], ["toilet", "厕所", "toilet", "het"], ["parkeerplaats", "停车位", "parking place", "de"], ["fietsenstalling", "自行车停车处", "bike parking", "de"],
    ],
  },
  {
    level: "A1",
    theme: "clothes-expanded",
    titleZh: "衣服扩展",
    titleEn: "expanded clothes",
    entries: [
      ["hemd", "背心/衬衣", "undershirt/shirt", "het"], ["blouse", "女式衬衫", "blouse", "de"], ["jaszak", "外套口袋", "coat pocket", "de"], ["riem", "腰带", "belt", "de"], ["pet", "鸭舌帽", "cap", "de"], ["sjaal", "围巾", "scarf", "de"], ["handschoen", "手套", "glove", "de"], ["laars", "靴子", "boot", "de"], ["pantoffel", "拖鞋", "slipper", "de"], ["ondergoed", "内衣", "underwear", "het"], ["pyjama", "睡衣", "pyjamas", "de"], ["maat", "尺码", "size", "de"], ["passen", "试穿/合适", "fit/try on"], ["dragen", "穿/戴", "wear"], ["aantrekken", "穿上", "put on"], ["uittrekken", "脱下", "take off"], ["wassen", "洗", "wash"], ["droog", "干的", "dry"],
    ],
  },
  {
    level: "A1",
    theme: "body-expanded",
    titleZh: "身体扩展",
    titleEn: "expanded body",
    entries: [
      ["oog", "眼睛", "eye", "het"], ["gezicht", "脸", "face", "het"], ["haar", "头发", "hair", "het"], ["vinger", "手指", "finger", "de"], ["teen", "脚趾", "toe", "de"], ["knie", "膝盖", "knee", "de"], ["schouder", "肩膀", "shoulder", "de"], ["nek", "脖子", "neck", "de"], ["borst", "胸", "chest", "de"], ["hart", "心脏", "heart", "het"], ["maag", "胃", "stomach", "de"], ["huid", "皮肤", "skin", "de"], ["lichaam", "身体", "body", "het"], ["gezond", "健康的", "healthy"], ["ongezond", "不健康的", "unhealthy"], ["zwak", "虚弱的", "weak"], ["sterk", "强壮的", "strong"], ["bloed", "血", "blood", "het"],
    ],
  },
  {
    level: "A1",
    theme: "daily-verbs-expanded",
    titleZh: "日常动词扩展",
    titleEn: "expanded daily verbs",
    entries: [
      ["pakken", "拿", "take/grab"], ["brengen", "带来/送", "bring"], ["halen", "取/接", "fetch"], ["geven", "给", "give"], ["krijgen", "得到", "get"], ["zetten", "放置", "put"], ["leggen", "放平", "lay/put"], ["zitten", "坐", "sit"], ["staan", "站/位于", "stand"], ["liggen", "躺/位于", "lie"], ["blijven", "留下", "stay"], ["wachten", "等待", "wait"], ["spelen", "玩", "play"], ["horen", "听见", "hear"], ["zien", "看见", "see"], ["proberen", "尝试", "try"], ["gebruiken", "使用", "use"], ["helpen", "帮助", "help"], ["hulp", "帮助", "help", "de"],
    ],
  },
  {
    level: "A1",
    theme: "adjectives-expanded",
    titleZh: "基础形容词扩展",
    titleEn: "expanded adjectives",
    entries: [
      ["hoog", "高的", "high"], ["laag", "低的", "low"], ["lang", "长的/高的", "long/tall"], ["kort", "短的", "short"], ["jong", "年轻的/小的", "young"], ["licht", "轻的/亮的", "light"], ["zwaar", "重的", "heavy"], ["vol", "满的", "full"], ["leeg", "空的", "empty"], ["open", "开的", "open"], ["dicht", "关的/近的", "closed/near"], ["schoon", "干净的", "clean"], ["vies", "脏的", "dirty"], ["druk", "忙/拥挤", "busy"], ["rustig", "安静的", "quiet"], ["veilig", "安全的", "safe"], ["gevaarlijk", "危险的", "dangerous"], ["klaar", "准备好/完成", "ready/done"], ["belangrijk", "重要的", "important"],
    ],
  },
  {
    level: "A1",
    theme: "question-connector-expanded",
    titleZh: "疑问和连接词扩展",
    titleEn: "expanded questions and connectors",
    entries: [
      ["waarheen", "去哪里", "to where"], ["waarvandaan", "从哪里来", "from where"], ["hoe laat", "几点", "what time"], ["hoe lang", "多久/多长", "how long"], ["hoe vaak", "多频繁", "how often"], ["welk", "哪个", "which"], ["welke", "哪个", "which"], ["want", "因为", "because"], ["dus", "所以", "so"], ["daarom", "因此", "therefore"], ["en", "和", "and"], ["ook", "也", "also"], ["nog", "还/再", "still/another"], ["al", "已经", "already"], ["toch", "还是/却", "still/after all"], ["misschien", "也许", "maybe"], ["zeker", "当然/确定", "certainly"], ["ongeveer", "大约", "about"],
    ],
  },
  {
    level: "A1",
    theme: "school-work-expanded",
    titleZh: "学校工作扩展",
    titleEn: "expanded school and work",
    entries: [
      ["schrift", "本子", "notebook", "het"], ["boekentas", "书包", "school bag", "de"], ["gum", "橡皮", "eraser", "de"], ["liniaal", "尺子", "ruler", "de"], ["toets", "测验", "test", "de"], ["examen", "考试", "exam", "het"], ["huiswerk", "作业", "homework", "het"], ["opdracht", "任务", "assignment", "de"], ["groep", "小组", "group", "de"], ["lokaal", "教室", "classroom", "het"], ["kantoor", "办公室", "office", "het"], ["bedrijf", "公司", "company", "het"], ["winkelmedewerker", "店员", "shop worker", "de"], ["leiding", "管理/领导", "management", "de"], ["chef", "主管", "boss", "de"], ["sollicitatie", "求职申请", "job application", "de"], ["ervaring", "经验", "experience", "de"], ["opleiding", "培训/教育", "education/training", "de"],
    ],
  },
  {
    level: "A1",
    theme: "leisure-expanded",
    titleZh: "休闲爱好扩展",
    titleEn: "expanded leisure",
    entries: [
      ["zwemmen", "游泳", "swim"], ["voetbal", "足球", "football", "het"], ["tennis", "网球", "tennis", "het"], ["hardlopen", "跑步", "run"], ["rennen", "奔跑/跑", "run"], ["dansen", "跳舞", "dance"], ["zingen", "唱歌", "sing"], ["tekenen", "画画", "draw"], ["foto", "照片", "photo", "de"], ["camera", "相机", "camera", "de"], ["televisie", "电视", "television", "de"], ["programma", "节目", "program", "het"], ["nieuws", "新闻", "news", "het"], ["boek lezen", "读书", "read a book"], ["muziek luisteren", "听音乐", "listen to music"], ["vrienden bezoeken", "拜访朋友", "visit friends"], ["uitgaan", "外出娱乐", "go out"], ["feest", "聚会", "party", "het"], ["vakantie", "假期", "holiday", "de"],
    ],
  },
  {
    level: "A1",
    theme: "public-signs",
    titleZh: "公共标识",
    titleEn: "public signs",
    entries: [
      ["verboden", "禁止", "forbidden"], ["toegestaan", "允许", "allowed"], ["gratis", "免费", "free"], ["openbaar", "公共的", "public"], ["privé", "私人的", "private"], ["ingang", "入口", "entrance", "de"], ["uitgang", "出口", "exit", "de"], ["nooduitgang", "紧急出口", "emergency exit", "de"], ["duwen", "推", "push"], ["trekken", "拉", "pull"], ["aanmelden", "登记/报名", "register"], ["afmelden", "取消登记", "cancel registration"], ["wachtwoord", "密码", "password", "het"], ["gebruikersnaam", "用户名", "username", "de"], ["volgende", "下一个", "next"], ["vorige", "上一个", "previous"], ["bevestigen", "确认", "confirm"], ["annuleren", "取消", "cancel"],
    ],
  },
  {
    level: "A1",
    theme: "money-shopping-expanded",
    titleZh: "钱和购物扩展",
    titleEn: "expanded money and shopping",
    entries: [
      ["munten", "硬币", "coins"], ["biljet", "纸币", "banknote", "het"], ["portemonnee", "钱包", "wallet", "de"], ["prijskaartje", "价签", "price tag", "het"], ["aanbieding", "特价", "special offer", "de"], ["totaal", "总计", "total"], ["extra", "额外", "extra"], ["minder", "更少", "less"], ["meer", "更多", "more"], ["genoeg", "足够", "enough"], ["te veel", "太多", "too much"], ["te weinig", "太少", "too little"], ["ruilen", "退换", "exchange"], ["terugbrengen", "拿回来/退回", "bring back"], ["bewaren", "保存", "keep"], ["bonnetje", "小票", "receipt", "het"], ["klant", "顾客", "customer", "de"], ["verkoper", "销售员", "seller", "de"], ["verkopen", "卖", "sell"],
    ],
  },
  {
    level: "A1",
    theme: "time-frequency-expanded",
    titleZh: "时间频率扩展",
    titleEn: "expanded time and frequency",
    entries: [
      ["ochtend", "上午", "morning", "de"], ["namiddag", "下午晚些时候", "late afternoon", "de"], ["nacht", "夜晚", "night", "de"], ["middernacht", "午夜", "midnight", "de"], ["middagpauze", "午休", "lunch break", "de"], ["werkdag", "工作日", "working day", "de"], ["feestdag", "节日", "holiday", "de"], ["verjaardag", "生日", "birthday", "de"], ["agenda", "日程", "agenda", "de"], ["kalender", "日历", "calendar", "de"], ["nu", "现在", "now"], ["straks", "一会儿", "later soon"], ["meteen", "马上", "immediately"], ["daarna", "之后", "after that"], ["eerst", "首先", "first"], ["laatst", "最近/最后", "recently/last"], ["elke week", "每周", "every week"], ["per maand", "每月", "per month"],
    ],
  },
  {
    level: "A1",
    theme: "household-actions-expanded",
    titleZh: "家务动作扩展",
    titleEn: "expanded household actions",
    entries: [
      ["opruimen", "整理", "tidy up"], ["schoonmaken", "打扫", "clean"], ["stofzuigen", "吸尘", "vacuum"], ["afwassen", "洗碗", "wash dishes"], ["afdrogen", "擦干", "dry dishes"], ["vegen", "扫", "sweep"], ["dweilen", "拖地", "mop"], ["strijken", "熨烫", "iron"], ["vouwen", "折叠", "fold"], ["ophangen", "挂起来", "hang up"], ["weggooien", "扔掉", "throw away"], ["repareren", "修理", "repair"], ["verhuizen", "搬家", "move house"], ["inpakken", "打包", "pack"], ["uitpakken", "拆包", "unpack"], ["aanzetten", "打开设备", "turn on"], ["uitzetten", "关闭设备", "turn off"], ["aanraken", "触摸", "touch"],
    ],
  },
  {
    level: "A1",
    theme: "basic-emotions-expanded",
    titleZh: "情绪状态扩展",
    titleEn: "expanded emotions and states",
    entries: [
      ["blij", "高兴", "happy"], ["verdrietig", "难过", "sad"], ["boos", "生气", "angry"], ["bang", "害怕", "afraid"], ["rustig", "平静", "calm"], ["nerveus", "紧张", "nervous"], ["moe", "累", "tired"], ["honger", "饿/饥饿", "hunger", "de"], ["dorst", "渴/口渴", "thirst", "de"], ["wakker", "醒着", "awake"], ["slaperig", "困的", "sleepy"], ["ziek", "生病", "sick"], ["beter", "好些", "better"], ["druk", "忙", "busy"], ["vrij", "有空/自由", "free"], ["tevreden", "满意", "satisfied"], ["ontevreden", "不满意", "dissatisfied"], ["verrast", "惊讶", "surprised"], ["verlegen", "害羞", "shy"], ["trots", "骄傲", "proud"],
    ],
  },
  {
    level: "A1",
    theme: "basic-nature-city-expanded",
    titleZh: "自然城市扩展",
    titleEn: "expanded nature and city",
    entries: [
      ["boom", "树", "tree", "de"], ["bloem", "花", "flower", "de"], ["gras", "草", "grass", "het"], ["lucht", "天空/空气", "air/sky", "de"], ["wolken", "云", "clouds"], ["rivier", "河", "river", "de"], ["zee", "海", "sea", "de"], ["strand", "海滩", "beach", "het"], ["brug", "桥", "bridge", "de"], ["plein", "广场", "square", "het"], ["gebouw", "建筑", "building", "het"], ["flat", "公寓楼", "apartment block", "de"], ["huisartspraktijk", "家庭医生诊所", "GP practice", "de"], ["kapper", "理发师/理发店", "hairdresser", "de"], ["bakker", "面包店/面包师", "baker", "de"], ["slager", "肉店/肉铺", "butcher", "de"], ["marktkoopman", "市场商贩", "market seller", "de"], ["pleincentrum", "中心广场", "central square", "het"],
    ],
  },
  {
    level: "A1",
    theme: "basic-technology-expanded",
    titleZh: "基础科技扩展",
    titleEn: "expanded basic technology",
    entries: [
      ["scherm", "屏幕", "screen", "het"], ["toets", "按键/测试", "key/test", "de"], ["muis", "鼠标", "mouse", "de"], ["oplader", "充电器", "charger", "de"], ["batterij", "电池", "battery", "de"], ["stekker", "插头", "plug", "de"], ["stopcontact", "插座", "socket", "het"], ["berichtje", "小消息", "short message", "het"], ["sms", "短信", "text message", "de"], ["website", "网站", "website", "de"], ["pagina", "页面", "page", "de"], ["knop", "按钮", "button", "de"], ["menu", "菜单", "menu", "het"], ["instelling", "设置", "setting", "de"], ["geluid", "声音", "sound", "het"], ["beeld", "图像", "image", "het"], ["aanmelden", "登录/报名", "log in/register"], ["uitloggen", "退出登录", "log out"],
    ],
  },
  {
    level: "A1",
    theme: "basic-family-events-expanded",
    titleZh: "家庭事件扩展",
    titleEn: "expanded family events",
    entries: [
      ["gezin", "小家庭", "household/family", "het"], ["kleinkind", "孙辈", "grandchild", "het"], ["oom", "叔叔/舅舅", "uncle", "de"], ["tante", "阿姨/姑姑", "aunt", "de"], ["neef", "侄子/外甥/堂表兄弟", "nephew/cousin", "de"], ["nicht", "侄女/外甥女/堂表姐妹", "niece/cousin", "de"], ["verjaardag", "生日", "birthday", "de"], ["cadeau", "礼物", "gift", "het"], ["kaart", "卡片", "card", "de"], ["feestje", "小聚会", "small party", "het"], ["bezoek", "拜访", "visit", "het"], ["logeren", "借宿", "stay over"], ["uitnodigen", "邀请", "invite"], ["komen eten", "来吃饭", "come for dinner"], ["thuis", "在家", "at home"], ["samenwonen", "同住", "live together"], ["scheiden", "离婚", "divorce"], ["geboren", "出生的", "born"],
    ],
  },
  {
    level: "A1",
    theme: "basic-measurements-expanded",
    titleZh: "尺寸度量扩展",
    titleEn: "expanded measurements",
    entries: [
      ["centimeter", "厘米", "centimeter", "de"], ["meter", "米", "meter", "de"], ["liter", "升", "liter", "de"], ["halve", "半个/半的", "half"], ["heel", "整个/很", "whole/very"], ["dubbel", "双倍", "double"], ["eerste", "第一", "first"], ["tweede", "第二", "second"], ["derde", "第三", "third"], ["laatste", "最后", "last"], ["volgende", "下一个", "next"], ["vorige", "上一个", "previous"], ["linksaf", "向左转", "turn left"], ["rechtsaf", "向右转", "turn right"], ["omhoog", "向上", "upward"], ["omlaag", "向下", "downward"], ["vooruit", "向前", "forward"], ["terug", "回来/返回", "back"],
    ],
  },
  {
    level: "A1",
    theme: "basic-office-services-expanded",
    titleZh: "办公室和服务扩展",
    titleEn: "expanded office and services",
    entries: [
      ["printer", "打印机", "printer", "de"], ["printen", "打印", "print"], ["scannen", "扫描", "scan"], ["kopiëren", "复印", "copy"], ["formulier", "表格", "form", "het"], ["handtekening", "签名", "signature", "de"], ["stempel", "印章", "stamp", "de"], ["mapje", "文件夹", "folder", "het"], ["balpen", "圆珠笔", "ballpoint pen", "de"], ["bureau", "书桌/办公室", "desk/office", "het"], ["vergadering", "会议", "meeting", "de"], ["noteren", "记录", "note down"], ["afspreken", "约定", "agree/make appointment"], ["uitleg", "解释", "explanation", "de"], ["voorbeeld", "例子", "example", "het"], ["foutje", "小错误", "small mistake", "het"], ["opnieuw", "重新", "again"], ["duidelijk", "清楚的", "clear"],
    ],
  },
  {
    level: "A1",
    theme: "basic-health-services-expanded",
    titleZh: "基础健康服务扩展",
    titleEn: "expanded basic health services",
    entries: [
      ["afspraakkaart", "预约卡", "appointment card", "de"], ["zorgkaart", "医疗卡", "healthcare card", "de"], ["assistente", "助理", "assistant", "de"], ["wachtkamer", "候诊室", "waiting room", "de"], ["temperatuur", "体温/温度", "temperature", "de"], ["pleister", "创可贴", "plaster", "de"], ["verband", "绷带", "bandage", "het"], ["druppel", "滴", "drop", "de"], ["zalf", "药膏", "ointment", "de"], ["tablet", "药片", "tablet", "de"], ["slikken", "吞咽", "swallow"], ["ademen", "呼吸", "breathe"], ["vallen", "摔倒", "fall"], ["snijden", "切/割", "cut"], ["branden", "烧/烫", "burn"], ["jeuken", "发痒", "itch"], ["bloeden", "流血", "bleed"], ["pijn doen", "疼", "hurt"],
    ],
  },
  {
    level: "A1",
    theme: "basic-civic-life-expanded",
    titleZh: "基础公共生活扩展",
    titleEn: "expanded basic civic life",
    entries: [
      ["gemeente", "市政府", "municipality", "de"], ["loket", "窗口", "counter", "het"], ["nummer trekken", "取号", "take a number"], ["wachten op", "等待", "wait for"], ["brief", "信", "letter", "de"], ["bericht", "消息", "message", "het"], ["pakket", "包裹", "parcel", "het"], ["post", "邮政/邮件", "post/mail", "de"], ["afval", "垃圾", "waste", "het"], ["container", "容器/垃圾桶", "container", "de"], ["glasbak", "玻璃回收箱", "glass recycling bin", "de"], ["papierbak", "纸类回收箱", "paper bin", "de"], ["paspoort", "护照", "passport", "het"], ["rijbewijs", "驾照", "driving license", "het"], ["kaart aanvragen", "申请卡", "apply for a card"], ["kwijt", "丢了", "lost"], ["gevonden", "找到了", "found"], ["meenemen", "带上", "bring along"],
    ],
  },
  {
    level: "A1",
    theme: "basic-reserve-expanded",
    titleZh: "A1 余量实用词",
    titleEn: "A1 practical reserve words",
    entries: [
      ["gezellig", "舒服热闹/惬意", "cozy/pleasant"], ["normaal", "正常的", "normal"], ["raar", "奇怪的", "strange"], ["handig", "方便的", "handy"], ["lastig", "麻烦的", "tricky"], ["mogelijk", "可能的", "possible"], ["onmogelijk", "不可能的", "impossible"], ["nodig hebben", "需要", "need"], ["meenemen", "带上", "bring along"], ["achterlaten", "留下", "leave behind"], ["onthouden", "记住", "remember"], ["vergeten", "忘记", "forget"], ["beginner", "初学者", "beginner", "de"], ["niveau", "水平/等级", "level", "het"], ["interesseren", "使感兴趣/让人有兴趣", "interest someone"], ["pauzeren", "暂停", "pause"], ["doorgaan", "继续", "continue"], ["klaarmaken", "准备", "prepare"], ["proeven", "品尝", "taste"],
    ],
  },
  {
    level: "A1",
    theme: "a1-core-daily-refinement",
    titleZh: "A1 核心日常补强",
    titleEn: "A1 core daily refinement",
    entries: [
      ["dinsdag", "星期二", "Tuesday", "de"], ["woensdag", "星期三", "Wednesday", "de"], ["donderdag", "星期四", "Thursday", "de"], ["zaterdag", "星期六", "Saturday", "de"], ["zondag", "星期日", "Sunday", "de"], ["water", "水", "water", "het"], ["ontbijt", "早餐", "breakfast", "het"], ["lunch", "午餐", "lunch", "de"], ["avondeten", "晚饭", "dinner", "het"], ["diner", "晚餐", "dinner", "het"], ["boodschappen", "日用品/采购", "groceries"], ["boodschappen doen", "买菜/采购", "do groceries"], ["kopen", "买", "buy"], ["betalen", "付款", "pay"], ["pinnen", "刷卡/用借记卡付款", "pay by debit card"], ["zoeken", "找", "look for"], ["vinden", "找到/觉得", "find"], ["maken", "做/制作", "make"], ["doen", "做", "do"], ["begrijpen", "理解", "understand"], ["spreken", "说/讲话", "speak"], ["wonen", "住", "live"],
    ],
  },
  {
    level: "A1",
    theme: "a1-basic-transport-refinement",
    titleZh: "A1 基础交通补强",
    titleEn: "A1 basic transport refinement",
    entries: [
      ["lopen", "走路", "walk"], ["tram", "电车", "tram", "de"], ["metro", "地铁", "metro", "de"],
    ],
  },
  {
    level: "A2",
    theme: "official-admin-expanded",
    titleZh: "官方行政扩展",
    titleEn: "expanded official administration",
    entries: [
      ["identiteitsbewijs", "身份证明", "proof of identity", "het"], ["verblijfsdocument", "居留文件", "residence document", "het"], ["bsn", "公民服务号", "citizen service number", "het"], ["DigiD", "荷兰数字身份", "DigiD"], ["inschrijven", "登记", "register"], ["uitschrijven", "注销登记", "deregister"], ["aanvrager", "申请人", "applicant", "de"], ["aanmeldformulier", "报名表", "registration form", "het"], ["gegevens", "资料", "data"], ["persoonlijke gegevens", "个人资料", "personal data"], ["kopie maken", "复印", "make a copy"], ["origineel", "原件", "original"], ["geldig", "有效的", "valid"], ["ongeldig", "无效的", "invalid"], ["verlopen", "过期的", "expired"], ["bewijsstuk", "证明材料", "supporting document", "het"], ["dossiernummer", "档案号", "file number", "het"], ["referentienummer", "参考号", "reference number", "het"],
    ],
  },
  {
    level: "A2",
    theme: "forms-procedures-expanded",
    titleZh: "表格流程扩展",
    titleEn: "expanded forms and procedures",
    entries: [
      ["invullen", "填写", "fill in"], ["aanvinken", "勾选", "tick/check"], ["ondertekenen", "签名", "sign"], ["uploaden", "上传", "upload"], ["downloaden", "下载", "download"], ["toevoegen", "添加", "add"], ["verwijderen", "删除", "remove"], ["opslaan", "保存", "save"], ["versturen", "发送", "send"], ["ontvangen", "收到", "receive"], ["controleren", "检查", "check"], ["nakijken", "检查", "review/check"], ["ontbreken", "缺少", "be missing"], ["bijvoegen", "附上", "attach"], ["verplicht", "必填/必须", "required"], ["optioneel", "可选", "optional"], ["vakje", "小框", "box/field", "het"], ["keuzelijst", "下拉选择列表", "selection list", "de"],
    ],
  },
  {
    level: "A2",
    theme: "healthcare-expanded",
    titleZh: "医疗看诊扩展",
    titleEn: "expanded healthcare",
    entries: [
      ["huisartsenpraktijk", "家庭医生诊所", "GP practice", "de"], ["assistente", "助理", "assistant", "de"], ["patiënt", "病人", "patient", "de"], ["spreekuur", "门诊时间", "consultation hour", "het"], ["telefonisch spreekuur", "电话门诊", "telephone consultation"], ["doorverwijzen", "转诊", "refer"], ["specialist", "专科医生", "specialist", "de"], ["bloedonderzoek", "验血", "blood test", "het"], ["urineonderzoek", "尿检", "urine test", "het"], ["uitslag", "结果", "result", "de"], ["diagnose", "诊断", "diagnosis", "de"], ["behandeling", "治疗", "treatment", "de"], ["advies", "建议", "advice", "het"], ["klachten", "症状/投诉", "complaints"], ["benauwdheid", "呼吸困难", "shortness of breath", "de"], ["pijnstiller", "止痛药", "painkiller", "de"], ["spoedpost", "急诊门诊", "urgent care post", "de"], ["noodnummer", "急救号码", "emergency number", "het"],
    ],
  },
  {
    level: "A2",
    theme: "pharmacy-medicine-expanded",
    titleZh: "药房药品扩展",
    titleEn: "expanded pharmacy and medicine",
    entries: [
      ["bijsluiter", "药品说明书", "package leaflet", "de"], ["dosering", "剂量", "dosage", "de"], ["innemen", "服用", "take medicine"], ["smeren", "涂抹", "apply ointment"], ["schudden", "摇匀", "shake"], ["kuur", "疗程", "course of treatment", "de"], ["antibiotica", "抗生素", "antibiotics"], ["paracetamol", "扑热息痛", "paracetamol", "de"], ["receptplichtig", "处方药的", "prescription-only"], ["zelfzorgmiddel", "非处方药", "over-the-counter medicine", "het"], ["herhaalmedicatie", "重复用药", "repeat medication", "de"], ["vervaldatum", "有效期", "expiry date", "de"], ["apotheker", "药剂师", "pharmacist", "de"], ["gebruikersadvies", "用药建议", "usage advice", "het"], ["maaltijd", "餐", "meal", "de"], ["voor het eten", "饭前", "before eating"], ["na het eten", "饭后", "after eating"], ["eenmaal per dag", "每天一次", "once per day"],
    ],
  },
  {
    level: "A2",
    theme: "housing-contract-expanded",
    titleZh: "住房合同扩展",
    titleEn: "expanded housing contracts",
    entries: [
      ["huurprijs", "租金", "rent price", "de"], ["kale huur", "裸租金", "basic rent"], ["all-in huur", "全包租金", "all-inclusive rent"], ["waarborgsom", "押金", "deposit", "de"], ["contractduur", "合同期限", "contract duration", "de"], ["opzeggen", "终止/取消", "terminate/cancel"], ["huurverhoging", "涨租", "rent increase", "de"], ["huurverlaging", "降租", "rent reduction", "de"], ["woningcorporatie", "住房协会", "housing corporation", "de"], ["makelaar", "房产中介", "estate agent", "de"], ["bezichtiging", "看房", "viewing", "de"], ["woonruimte", "居住空间", "living space", "de"], ["gemeubileerd", "带家具的", "furnished"], ["ongemeubileerd", "不带家具的", "unfurnished"], ["oppervlakte", "面积", "surface area", "de"], ["verdieping", "楼层", "floor", "de"], ["huurvoorwaarden", "租赁条件", "rental conditions"], ["sleutelbos", "一串钥匙", "bunch of keys", "de"],
    ],
  },
  {
    level: "A2",
    theme: "repairs-utilities-expanded",
    titleZh: "维修和公用事业",
    titleEn: "repairs and utilities",
    entries: [
      ["elektriciteit", "电", "electricity", "de"], ["gas", "燃气", "gas", "het"], ["waterleiding", "水管", "water pipe", "de"], ["meterstand", "表读数", "meter reading", "de"], ["energieleverancier", "能源供应商", "energy supplier", "de"], ["internetprovider", "网络供应商", "internet provider", "de"], ["wifi", "无线网络", "wifi", "de"], ["stroomstoring", "停电", "power outage", "de"], ["verstopping", "堵塞", "blockage", "de"], ["kraan lekt", "水龙头漏水", "tap is leaking"], ["verwarming doet het niet", "暖气坏了", "heating does not work"], ["monteur sturen", "派维修工", "send a technician"], ["afspraak maken", "预约", "make an appointment"], ["reparatieverzoek", "维修请求", "repair request", "het"], ["schade", "损坏", "damage", "de"], ["vocht", "潮气", "moisture", "het"], ["geluidsoverlast", "噪音扰民", "noise nuisance", "de"], ["schoonmaak", "清洁", "cleaning", "de"],
    ],
  },
  {
    level: "A2",
    theme: "work-contract-expanded",
    titleZh: "工作合同扩展",
    titleEn: "expanded work contracts",
    entries: [
      ["werkgever", "雇主", "employer", "de"], ["werknemer", "雇员", "employee", "de"], ["arbeidscontract", "劳动合同", "employment contract", "het"], ["tijdelijk contract", "临时合同", "temporary contract"], ["vast contract", "固定合同", "permanent contract"], ["urencontract", "小时合同", "hours contract", "het"], ["minimumloon", "最低工资", "minimum wage", "het"], ["brutoloon", "税前工资", "gross wage", "het"], ["nettoloon", "税后工资", "net wage", "het"], ["vakantiegeld", "假期津贴", "holiday allowance", "het"], ["overuren", "加班时间", "overtime hours"], ["ploegendienst", "轮班", "shift work", "de"], ["nachtdienst", "夜班", "night shift", "de"], ["inwerken", "培训上岗", "onboard/train in"], ["functioneringsgesprek", "绩效谈话", "performance review", "het"], ["arbeidsvoorwaarden", "劳动条件", "employment conditions"], ["personeelszaken", "人事部门", "HR"], ["uitbetaling", "支付工资", "payment", "de"],
    ],
  },
  {
    level: "A2",
    theme: "sick-leave-expanded",
    titleZh: "请病假扩展",
    titleEn: "expanded sick leave",
    entries: [
      ["ziekmelden", "报病假", "report sick"], ["beter melden", "报恢复上班", "report recovered"], ["bedrijfsarts", "公司医生", "company doctor", "de"], ["arbodienst", "职业健康服务", "occupational health service", "de"], ["verzuim", "缺勤", "absence", "het"], ["hersteldatum", "恢复日期", "recovery date", "de"], ["gedeeltelijk werken", "部分工作", "work partially"], ["volledig werken", "全职恢复工作", "work fully"], ["thuisblijven", "待在家", "stay home"], ["koorts hebben", "发烧", "have a fever"], ["niet kunnen komen", "不能来", "cannot come"], ["leidinggevende bellen", "给主管打电话", "call the supervisor"], ["doktersverklaring", "医生证明", "doctor's note", "de"], ["privacy", "隐私", "privacy", "de"], ["afspraak afzeggen", "取消预约", "cancel an appointment"], ["vervanger", "替班人", "replacement", "de"], ["melding doen", "报告", "make a report"], ["werk hervatten", "恢复工作", "resume work"],
    ],
  },
  {
    level: "A2",
    theme: "finance-bills-expanded",
    titleZh: "账单财务扩展",
    titleEn: "expanded finance and bills",
    entries: [
      ["bankrekening", "银行账户", "bank account", "de"], ["rekeningnummer", "账号", "account number", "het"], ["iban", "IBAN 账号", "IBAN", "de"], ["automatische incasso", "自动扣款", "direct debit"], ["overschrijving", "转账", "bank transfer", "de"], ["betaalverzoek", "付款请求", "payment request", "het"], ["openstaande rekening", "未付账单", "outstanding bill"], ["vervaldatum", "到期日", "due date", "de"], ["aanmaningskosten", "催缴费用", "reminder costs"], ["boete", "罚款", "fine", "de"], ["korting", "折扣", "discount", "de"], ["toeslag", "补贴", "allowance", "de"], ["huurtoeslag", "房租补贴", "rent benefit", "de"], ["zorgtoeslag", "医疗补贴", "healthcare benefit", "de"], ["inkomen", "收入", "income", "het"], ["uitgaven", "支出", "expenses"], ["budget", "预算", "budget", "het"], ["afschrift", "账单明细", "bank statement", "het"],
    ],
  },
  {
    level: "A2",
    theme: "insurance-expanded",
    titleZh: "保险扩展",
    titleEn: "expanded insurance",
    entries: [
      ["basisverzekering", "基础保险", "basic insurance", "de"], ["aanvullende verzekering", "补充保险", "additional insurance"], ["zorgverzekeraar", "医疗保险公司", "health insurer", "de"], ["polisnummer", "保单号", "policy number", "het"], ["polisblad", "保单页", "policy sheet", "het"], ["verzekerde", "被保险人", "insured person", "de"], ["declareren", "报销申报", "claim expenses"], ["nota", "账单/票据", "invoice", "de"], ["vergoeden", "报销", "reimburse"], ["niet vergoed", "不报销", "not reimbursed"], ["eigen bijdrage", "自付部分", "personal contribution"], ["zorgverlener", "医疗服务提供者", "healthcare provider", "de"], ["machtiging", "授权", "authorization", "de"], ["klantenservice", "客服", "customer service", "de"], ["wijzigen", "更改", "change"], ["opzeggen", "取消/终止", "cancel"], ["jaarlijks", "每年", "yearly"], ["maandelijks", "每月", "monthly"],
    ],
  },
  {
    level: "A2",
    theme: "transport-disruption-expanded",
    titleZh: "交通延误扩展",
    titleEn: "expanded transport disruption",
    entries: [
      ["treinverkeer", "火车交通", "train traffic", "het"], ["buslijn", "公交线路", "bus line", "de"], ["halte vervalt", "站点取消", "stop is cancelled"], ["spoorwijziging", "站台变更", "platform change", "de"], ["eindbestemming", "终点站", "final destination", "de"], ["tussenstop", "中途站", "intermediate stop", "de"], ["aansluiting", "接驳/换乘连接", "connection", "de"], ["gemist", "错过了", "missed"], ["vertrouwd", "熟悉的", "familiar"], ["omreizen", "绕路出行", "travel around"], ["reisadvies", "出行建议", "travel advice", "het"], ["uitstappen", "下车", "get off"], ["instappen", "上车", "get on"], ["controleur", "查票员", "ticket inspector", "de"], ["vervoerbewijs", "乘车凭证", "travel ticket", "het"], ["dagkaart", "日票", "day ticket", "de"], ["abonnement", "订阅/通票", "subscription", "het"], ["reiskosten", "交通费用", "travel costs"],
    ],
  },
  {
    level: "A2",
    theme: "email-letter-expanded",
    titleZh: "邮件信件扩展",
    titleEn: "expanded email and letters",
    entries: [
      ["geachte", "尊敬的", "dear/formal"], ["beste", "亲爱的/您好", "dear"], ["met vriendelijke groet", "此致敬礼", "kind regards"], ["alvast bedankt", "提前感谢", "thanks in advance"], ["naar aanleiding van", "根据/关于", "in response to"], ["betreft", "主题/关于", "regarding"], ["bijgevoegd", "随信附上", "attached"], ["doorsturen", "转发", "forward"], ["beantwoorden", "回复", "reply"], ["ontvanger", "收件人", "recipient", "de"], ["afzender", "发件人", "sender", "de"], ["concept", "草稿", "draft", "het"], ["verzonden", "已发送", "sent"], ["ontvangen bericht", "收到的信息", "received message"], ["spam", "垃圾邮件", "spam", "de"], ["map", "文件夹", "folder", "de"], ["bestand", "文件", "file", "het"], ["bestandsgrootte", "文件大小", "file size", "de"],
    ],
  },
  {
    level: "A2",
    theme: "phone-conversation-expanded",
    titleZh: "电话沟通扩展",
    titleEn: "expanded phone conversations",
    entries: [
      ["met wie spreek ik", "请问您是哪位", "who am I speaking with"], ["een ogenblik", "请稍等", "one moment"], ["aan de lijn blijven", "保持在线", "stay on the line"], ["ik verbind u door", "我为您转接", "I will connect you"], ["bereikbaarheid", "可联系时间", "availability", "de"], ["voicemail", "语音信箱", "voicemail", "de"], ["bericht achterlaten", "留言", "leave a message"], ["terugbelverzoek", "回电请求", "callback request", "het"], ["notitie", "记录", "note", "de"], ["naam spellen", "拼写名字", "spell a name"], ["langzamer spreken", "说慢一点", "speak more slowly"], ["duidelijk spreken", "说清楚", "speak clearly"], ["verkeerd nummer", "打错号码", "wrong number"], ["in gesprek", "占线", "busy on the phone"], ["verbinding", "连接", "connection", "de"], ["slecht bereik", "信号不好", "poor reception"], ["ophangen", "挂断", "hang up"], ["opnemen", "接电话", "answer the phone"],
    ],
  },
  {
    level: "A2",
    theme: "appointments-expanded",
    titleZh: "预约改约扩展",
    titleEn: "expanded appointments",
    entries: [
      ["beschikbare tijd", "可用时间", "available time"], ["voorkeur", "偏好", "preference", "de"], ["liever niet", "最好不要", "prefer not"], ["geschikt", "合适的", "suitable"], ["ongeschikt", "不合适的", "unsuitable"], ["eerder komen", "早点来", "come earlier"], ["later komen", "晚点来", "come later"], ["afspraak bevestigen", "确认预约", "confirm appointment"], ["afspraak verzetten", "改约", "reschedule appointment"], ["afspraak annuleren", "取消预约", "cancel appointment"], ["nieuwe datum", "新日期", "new date"], ["ander tijdstip", "其他时间", "another time"], ["wachttijd", "等待时间", "waiting time", "de"], ["te laat", "太晚/迟到", "too late"], ["op tijd", "准时", "on time"], ["bevestigingsmail", "确认邮件", "confirmation email", "de"], ["agenda controleren", "检查日程", "check the calendar"], ["uitnodiging accepteren", "接受邀请", "accept invitation"],
    ],
  },
  {
    level: "A2",
    theme: "complaints-expanded",
    titleZh: "投诉和问题扩展",
    titleEn: "expanded complaints and problems",
    entries: [
      ["klacht indienen", "提交投诉", "submit a complaint"], ["ontevreden", "不满意", "dissatisfied"], ["tevreden", "满意", "satisfied"], ["oplossen", "解决", "solve"], ["oplossing zoeken", "寻找解决方案", "look for a solution"], ["oorzaak", "原因", "cause", "de"], ["gevolg", "后果", "consequence", "het"], ["beschrijven", "描述", "describe"], ["uitleg vragen", "请求解释", "ask for explanation"], ["bewijs sturen", "发送证据", "send proof"], ["foto meesturen", "附上照片", "send a photo along"], ["binnen drie dagen", "三天内", "within three days"], ["zo snel mogelijk", "尽快", "as soon as possible"], ["niet akkoord", "不同意", "not agreed"], ["akkoord gaan", "同意", "agree"], ["excuses", "道歉", "apologies"], ["fout herstellen", "改正错误", "correct a mistake"], ["reactietermijn", "回复期限", "response period", "de"],
    ],
  },
  {
    level: "A2",
    theme: "child-school-expanded",
    titleZh: "孩子学校扩展",
    titleEn: "expanded child and school",
    entries: [
      ["basisschool", "小学", "primary school", "de"], ["middelbare school", "中学", "secondary school", "de"], ["opvang", "托管", "childcare", "de"], ["kinderdagverblijf", "日托", "daycare", "het"], ["peuterspeelzaal", "幼儿游戏班", "preschool playgroup", "de"], ["oudergesprek", "家长会谈", "parent meeting", "het"], ["rapport", "成绩报告", "report card", "het"], ["ziekmelden kind", "给孩子请病假", "report child sick"], ["schoolplein", "校园操场", "schoolyard", "het"], ["juf", "女老师", "female teacher", "de"], ["meester", "男老师", "male teacher", "de"], ["klasgenoot", "同班同学", "classmate", "de"], ["trakteren", "生日分发小礼物/食物", "treat classmates"], ["gymles", "体育课", "PE lesson", "de"], ["zwemles", "游泳课", "swimming lesson", "de"], ["schoolvakantie", "学校假期", "school holiday", "de"], ["leerplicht", "义务教育", "compulsory education", "de"], ["toestemming", "许可", "permission", "de"],
    ],
  },
  {
    level: "A2",
    theme: "municipality-benefits-expanded",
    titleZh: "市政和补贴扩展",
    titleEn: "expanded municipality and benefits",
    entries: [
      ["gemeentebalie", "市政柜台", "municipal desk", "de"], ["afspraakcode", "预约码", "appointment code", "de"], ["uittreksel aanvragen", "申请摘录", "request an extract"], ["verhuizing doorgeven", "报告搬家", "report a move"], ["adreswijziging", "地址变更", "address change", "de"], ["gezinsleden", "家庭成员", "family members"], ["inkomensverklaring", "收入证明", "income statement", "de"], ["belastingdienst", "税务局", "tax authority", "de"], ["toeslagen", "补贴", "benefits"], ["aanvraagstatus", "申请状态", "application status", "de"], ["beslistermijn", "决定期限", "decision period", "de"], ["afwijzing", "拒绝", "rejection", "de"], ["goedkeuring", "批准", "approval", "de"], ["bezwaar maken", "提出异议", "file an objection"], ["termijn verlengen", "延长期限", "extend the deadline"], ["contactpersoon", "联系人", "contact person", "de"], ["openingstijden", "开放时间", "opening hours"], ["loketnummer", "窗口号", "desk number", "het"],
    ],
  },
  {
    level: "A2",
    theme: "past-events-expanded",
    titleZh: "过去事件扩展",
    titleEn: "expanded past events",
    entries: [
      ["gewerkt", "工作过", "worked"], ["gewoond", "住过", "lived"], ["geleerd", "学过", "learned"], ["gezocht", "找过", "looked for"], ["gekocht", "买了", "bought"], ["verkocht", "卖了", "sold"], ["gebracht", "带来了/送了", "brought"], ["gehaald", "取了/接了", "fetched"], ["gesproken", "说过/谈过", "spoken"], ["begrepen", "理解了", "understood"], ["geschreven", "写了", "written"], ["gelezen", "读了", "read"], ["gezien", "看见了", "seen"], ["gehoord", "听见了", "heard"], ["geprobeerd", "尝试了", "tried"], ["geopend", "打开了", "opened"], ["gesloten", "关闭了", "closed"], ["verplaatst", "改期了/移动了", "moved/rescheduled"],
    ],
  },
  {
    level: "A2",
    theme: "formal-connectors-expanded",
    titleZh: "正式连接表达",
    titleEn: "formal connectors",
    entries: [
      ["omdat", "因为", "because"], ["zodat", "以便", "so that"], ["hoewel", "虽然", "although"], ["als", "如果/当", "if/when"], ["wanneer", "当/什么时候", "when"], ["voordat", "在……之前", "before"], ["nadat", "在……之后", "after"], ["tijdens", "在……期间", "during"], ["volgens", "根据", "according to"], ["betekent dat", "这意味着", "means that"], ["daarnaast", "此外", "besides"], ["bovendien", "而且", "moreover"], ["bijvoorbeeld", "例如", "for example"], ["namelijk", "也就是说/因为", "namely"], ["toch", "然而/还是", "nevertheless"], ["daardoor", "因此", "as a result"], ["daardoor kan ik", "因此我可以", "because of that I can"], ["in ieder geval", "无论如何", "in any case"],
    ],
  },
  {
    level: "A2",
    theme: "neighborhood-society-expanded",
    titleZh: "社区社会扩展",
    titleEn: "expanded neighborhood and society",
    entries: [
      ["wijk", "街区", "district", "de"], ["buurtcentrum", "社区中心", "community center", "het"], ["vrijwilliger", "志愿者", "volunteer", "de"], ["activiteit", "活动", "activity", "de"], ["taalmaatje", "语言伙伴", "language buddy", "het"], ["bibliotheekpas", "图书馆卡", "library card", "de"], ["afvalcontainer", "垃圾桶", "waste container", "de"], ["grofvuil", "大件垃圾", "bulky waste", "het"], ["milieustraat", "垃圾回收站", "recycling center", "de"], ["veiligheid", "安全", "safety", "de"], ["overlast melden", "报告扰民", "report nuisance"], ["buurtbewoner", "居民", "neighborhood resident", "de"], ["vereniging", "协会", "association", "de"], ["cursus volgen", "参加课程", "take a course"], ["inburgeringscursus", "融入课程", "integration course", "de"], ["taalschool", "语言学校", "language school", "de"], ["vrijwilligerswerk", "志愿工作", "volunteer work", "het"], ["informatieavond", "信息晚会", "information evening", "de"],
    ],
  },
  {
    level: "A2",
    theme: "legal-safety-expanded",
    titleZh: "法律安全扩展",
    titleEn: "expanded legal and safety",
    entries: [
      ["melding", "报告", "report", "de"], ["aangifte", "报案", "police report", "de"], ["diefstal", "盗窃", "theft", "de"], ["verlies", "丢失", "loss", "het"], ["gevonden voorwerp", "失物招领物", "found object"], ["verzekeren", "投保", "insure"], ["getuige", "目击者", "witness", "de"], ["handhaving", "执法", "enforcement", "de"], ["boete betalen", "缴罚款", "pay a fine"], ["waarschuwing", "警告", "warning", "de"], ["regel", "规则", "rule", "de"], ["toezicht", "监督", "supervision", "het"], ["vergunning aanvragen", "申请许可", "apply for a permit"], ["identificeren", "证明身份", "identify oneself"], ["noodsituatie", "紧急情况", "emergency situation", "de"], ["brandweer", "消防队", "fire brigade", "de"], ["ambulance", "救护车", "ambulance", "de"], ["veilig melden", "安全报告", "report safely"],
    ],
  },
  {
    level: "A2",
    theme: "education-training-expanded",
    titleZh: "教育培训扩展",
    titleEn: "expanded education and training",
    entries: [
      ["taalniveau", "语言等级", "language level", "het"], ["intaketoets", "入学测试", "intake test", "de"], ["lesmateriaal", "教材", "lesson material", "het"], ["aanwezigheid", "出勤", "attendance", "de"], ["afwezig", "缺席的", "absent"], ["certificaat", "证书", "certificate", "het"], ["diploma", "文凭", "diploma", "het"], ["cursist", "学员", "course participant", "de"], ["begeleider", "辅导员", "supervisor/coach", "de"], ["huiswerkopdracht", "家庭作业任务", "homework assignment", "de"], ["roosterwijziging", "课表变更", "schedule change", "de"], ["online les", "线上课", "online lesson"], ["praktijkexamen", "实操考试", "practical exam", "het"], ["oefentoets", "练习测试", "practice test", "de"], ["geslaagd", "通过考试", "passed"], ["gezakt", "考试未通过", "failed"], ["herkansing", "补考", "resit", "de"], ["studieadvies", "学习建议", "study advice", "het"],
    ],
  },
  {
    level: "A2",
    theme: "job-search-expanded",
    titleZh: "求职扩展",
    titleEn: "expanded job search",
    entries: [
      ["vacature", "职位空缺", "vacancy", "de"], ["cv", "简历", "CV", "het"], ["motivatiebrief", "动机信", "motivation letter", "de"], ["werkervaring", "工作经验", "work experience", "de"], ["referentie", "推荐人/参考", "reference", "de"], ["uitnodiging gesprek", "面试邀请", "interview invitation"], ["sollicitatiegesprek", "求职面试", "job interview", "het"], ["beschikbaar per direct", "可立即上岗", "available immediately"], ["parttime", "兼职", "part-time"], ["fulltime", "全职", "full-time"], ["dienstverband", "雇佣关系", "employment relationship", "het"], ["proefdag", "试工日", "trial day", "de"], ["functie", "职位", "position", "de"], ["werkplek", "工作地点", "workplace", "de"], ["vaardigheid", "技能", "skill", "de"], ["betrouwbaar", "可靠的", "reliable"], ["flexibel", "灵活的", "flexible"], ["beschikbaar zijn", "有空/可工作", "be available"],
    ],
  },
  {
    level: "A2",
    theme: "shopping-returns-expanded",
    titleZh: "购物退换扩展",
    titleEn: "expanded shopping returns",
    entries: [
      ["garantie", "保修", "warranty", "de"], ["garantiebewijs", "保修凭证", "warranty proof", "het"], ["retourneren", "退货", "return"], ["ruiltermijn", "退换期限", "return period", "de"], ["beschadigd", "损坏的", "damaged"], ["verkeerde maat", "尺码不对", "wrong size"], ["aankoopdatum", "购买日期", "purchase date", "de"], ["klantenbalie", "客服柜台", "customer desk", "de"], ["terugstorten", "退回款项", "refund to account"], ["contant terug", "现金退回", "cash back"], ["artikelnummer", "商品编号", "item number", "het"], ["voorraadstatus", "库存状态", "stock status", "de"], ["bezorgen", "配送", "deliver"], ["bezorgkosten", "配送费", "delivery costs"], ["afhalen", "自取", "pick up"], ["pakketpunt", "包裹点", "parcel point", "het"], ["bestelling", "订单", "order", "de"], ["bestelbevestiging", "订单确认", "order confirmation", "de"],
    ],
  },
  {
    level: "A2",
    theme: "public-health-expanded",
    titleZh: "公共健康扩展",
    titleEn: "expanded public health",
    entries: [
      ["vaccinatie", "疫苗接种", "vaccination", "de"], ["prik", "针/注射", "jab", "de"], ["afspraakbrief", "预约信", "appointment letter", "de"], ["gezondheidscentrum", "健康中心", "health center", "het"], ["consultatiebureau", "儿童保健中心", "child health clinic", "het"], ["verloskundige", "助产士", "midwife", "de"], ["tandartscontrole", "牙医检查", "dental check-up", "de"], ["mondhygiënist", "口腔卫生师", "dental hygienist", "de"], ["fysiotherapeut", "物理治疗师", "physiotherapist", "de"], ["psycholoog", "心理医生", "psychologist", "de"], ["wachtdienst", "值班服务", "on-call service", "de"], ["medisch dossier", "医疗档案", "medical file", "het"], ["toestemming geven", "给予许可", "give permission"], ["uitschrijven praktijk", "退出诊所注册", "deregister from practice"], ["inschrijven praktijk", "注册诊所", "register with practice"], ["gezondheidsklacht", "健康问题", "health complaint", "de"], ["langdurig ziek", "长期生病", "long-term sick"], ["hersteladvies", "恢复建议", "recovery advice", "het"],
    ],
  },
  {
    level: "A2",
    theme: "travel-documents-expanded",
    titleZh: "旅行证件扩展",
    titleEn: "expanded travel documents",
    entries: [
      ["reisdocument", "旅行证件", "travel document", "het"], ["visum", "签证", "visa", "het"], ["verblijfsvergunning", "居留许可", "residence permit", "de"], ["pasfoto", "证件照", "passport photo", "de"], ["kopie paspoort", "护照复印件", "passport copy"], ["afgiftedatum", "签发日期", "date of issue", "de"], ["vervaldatum paspoort", "护照有效期", "passport expiry date"], ["spoedaanvraag", "加急申请", "urgent application", "de"], ["reisverzekering", "旅行保险", "travel insurance", "de"], ["grens", "边境", "border", "de"], ["douane", "海关", "customs", "de"], ["bagage", "行李", "luggage", "de"], ["instapkaart", "登机牌", "boarding pass", "de"], ["vertraging vlucht", "航班延误", "flight delay"], ["annulering vlucht", "航班取消", "flight cancellation"], ["reservering", "预订", "reservation", "de"], ["overnachting", "过夜住宿", "overnight stay", "de"], ["adres buitenland", "国外地址", "foreign address"],
    ],
  },
  {
    level: "A2",
    theme: "service-desk-expanded",
    titleZh: "服务柜台扩展",
    titleEn: "expanded service desk",
    entries: [
      ["volgnummer", "排队号码", "queue number", "het"], ["nummertje trekken", "取号", "take a number"], ["aan de beurt", "轮到", "one's turn"], ["wachtrij", "队列", "queue", "de"], ["medewerker spreken", "和工作人员交谈", "speak to an employee"], ["vraag stellen", "提问", "ask a question"], ["document laten zien", "出示文件", "show a document"], ["gegevens controleren", "核对资料", "check data"], ["formulier ophalen", "领取表格", "pick up a form"], ["formulier inleveren", "提交表格", "hand in a form"], ["kopie meenemen", "带复印件", "bring a copy"], ["bewijs ontvangen", "收到证明", "receive proof"], ["afspraak nodig", "需要预约", "appointment needed"], ["zonder afspraak", "无需预约", "without appointment"], ["openingstijd", "开放时间", "opening time", "de"], ["sluitingstijd", "关闭时间", "closing time", "de"], ["informatiebalie", "信息柜台", "information desk", "de"], ["servicepunt", "服务点", "service point", "het"],
    ],
  },
  {
    level: "A2",
    theme: "a2-life-task-refinement",
    titleZh: "A2 生活任务补强",
    titleEn: "A2 practical life-task refinement",
    entries: [
      ["verhuizing", "搬家/迁址", "move / relocation", "de"], ["verhuisdatum", "搬家日期", "moving date", "de"], ["nieuw adres", "新地址", "new address"], ["oude adres", "旧地址", "old address"], ["postadres", "通讯地址", "mailing address", "het"], ["inschrijving bevestigen", "确认登记", "confirm registration"], ["afspraak verplaatsen", "改约", "reschedule an appointment"], ["afspraak annuleren", "取消预约", "cancel an appointment"], ["terugbellen", "回电话", "call back"], ["bereikbaar zijn", "联系得到/可接通", "be reachable"], ["klantnummer", "客户号码", "customer number", "het"], ["kenmerk vermelden", "注明编号", "mention the reference"], ["betalingsbewijs", "付款证明", "proof of payment", "het"], ["huur betalen", "付房租", "pay rent"], ["medicijnen ophalen", "取药", "pick up medicine"], ["pijn aangeven", "说明疼痛", "describe pain"], ["klacht uitleggen", "说明问题/投诉", "explain the complaint"], ["formulier opsturen", "寄送表格", "send the form"], ["bijlage toevoegen", "添加附件", "add an attachment"], ["hulp vragen", "求助", "ask for help"],
    ],
  },
  {
    level: "A2",
    theme: "practical-reading-expanded",
    titleZh: "实用阅读扩展",
    titleEn: "expanded practical reading",
    entries: [
      ["advertentie", "广告", "advertisement", "de"], ["folder", "宣传册", "leaflet", "de"], ["handleiding", "说明书", "manual", "de"], ["berichtgeving", "通知/报道", "communication", "de"], ["kopje", "小标题/小杯", "heading/small cup", "het"], ["paragraaf", "段落", "paragraph", "de"], ["samenvatting", "摘要", "summary", "de"], ["belangrijkste punt", "重点", "main point"], ["doel van de tekst", "文本目的", "purpose of the text"], ["afspraakkaart", "预约卡", "appointment card", "de"], ["dienstregeling", "时刻表", "timetable", "de"], ["voorwaarden", "条件", "conditions"], ["stappenplan", "步骤计划", "step-by-step plan", "het"], ["instructie", "说明", "instruction", "de"], ["waarschuwingstekst", "警示文字", "warning text", "de"], ["informatiebrief", "信息信", "information letter", "de"], ["nieuwsbericht", "新闻消息", "news item", "het"], ["webformulier", "网页表格", "web form", "het"],
    ],
  },
  {
    level: "A2",
    theme: "practical-speaking-expanded",
    titleZh: "实用口语扩展",
    titleEn: "expanded practical speaking",
    entries: [
      ["ik bel over", "我打电话是关于", "I am calling about"], ["ik heb een vraag over", "我有一个关于……的问题", "I have a question about"], ["kunt u uitleggen", "您能解释吗", "can you explain"], ["ik begrijp het niet", "我不明白", "I do not understand"], ["kunt u dat herhalen", "您能重复吗", "can you repeat that"], ["wat moet ik doen", "我该做什么", "what should I do"], ["waar moet ik zijn", "我应该去哪里", "where should I be"], ["welke documenten", "哪些文件", "which documents"], ["hoe lang duurt het", "需要多久", "how long does it take"], ["wat kost het", "多少钱", "what does it cost"], ["ik wil graag", "我想要", "I would like"], ["ik kan helaas niet", "很遗憾我不能", "unfortunately I cannot"], ["dat komt niet uit", "那个时间不方便", "that does not suit"], ["dat is mogelijk", "那是可能的", "that is possible"], ["dat lukt niet", "那不行", "that will not work"], ["ik stuur het vandaag", "我今天发送", "I will send it today"], ["ik kom morgen langs", "我明天过来", "I will come by tomorrow"], ["bedankt voor uw hulp", "谢谢您的帮助", "thank you for your help"],
    ],
  },
  {
    level: "A2",
    theme: "care-family-expanded",
    titleZh: "照护家庭扩展",
    titleEn: "expanded care and family",
    entries: [
      ["mantelzorg", "非正式照护", "informal care", "de"], ["zorg nodig hebben", "需要照护", "need care"], ["oppas", "临时看护", "babysitter", "de"], ["kinderopvangtoeslag", "托儿补贴", "childcare benefit", "de"], ["ouderlijk gezag", "父母监护权", "parental authority", "het"], ["noodcontact", "紧急联系人", "emergency contact", "het"], ["contactgegevens", "联系方式", "contact details"], ["familielid", "家庭成员", "family member", "het"], ["samen aanvragen", "一起申请", "apply together"], ["iemand machtigen", "授权某人", "authorize someone"], ["toestemmingsformulier", "同意表", "consent form", "het"], ["zorgafspraak", "照护预约", "care appointment", "de"], ["begeleiding", "陪同/指导", "support/guidance", "de"], ["huishoudelijke hulp", "家务帮助", "domestic help"], ["rolstoel", "轮椅", "wheelchair", "de"], ["hulpmiddel", "辅助器具", "aid/device", "het"], ["aanpassing", "调整/改造", "adjustment", "de"], ["ondersteuning", "支持", "support", "de"],
    ],
  },
  {
    level: "A2",
    theme: "tax-benefit-expanded",
    titleZh: "税务补贴扩展",
    titleEn: "expanded tax and benefits",
    entries: [
      ["belastingaangifte", "报税", "tax return", "de"], ["aanslag", "税单/评估", "tax assessment", "de"], ["teruggave", "退税", "refund", "de"], ["voorlopige aanslag", "预估税单", "provisional assessment"], ["jaaropgave", "年度收入单", "annual income statement", "de"], ["loonheffing", "工资税扣缴", "payroll tax", "de"], ["aftrekpost", "可扣除项", "deductible item", "de"], ["vermogen", "资产", "assets", "het"], ["partnerinkomen", "伴侣收入", "partner income", "het"], ["wijziging doorgeven", "报告变更", "report a change"], ["stopzetten toeslag", "停止补贴", "stop benefit"], ["terugbetalen", "偿还", "pay back"], ["voorschot", "预付款", "advance payment", "het"], ["beschikking", "决定书", "decision notice", "de"], ["toeslagpartner", "补贴伴侣", "benefit partner", "de"], ["jaarinkomen", "年收入", "annual income", "het"], ["gezamenlijk inkomen", "共同收入", "joint income"], ["aanvraag wijzigen", "修改申请", "change application"],
    ],
  },
  {
    level: "A2",
    theme: "digital-admin-expanded",
    titleZh: "数字办事扩展",
    titleEn: "expanded digital administration",
    entries: [
      ["inloggen met DigiD", "用 DigiD 登录", "log in with DigiD"], ["sms-controle", "短信验证", "SMS verification", "de"], ["DigiD-app", "DigiD 应用", "DigiD app", "de"], ["machtigingscode", "授权码", "authorization code", "de"], ["beveiliging", "安全保护", "security", "de"], ["privacyverklaring", "隐私声明", "privacy statement", "de"], ["account aanmaken", "创建账户", "create an account"], ["account blokkeren", "冻结账户", "block account"], ["wachtwoord vergeten", "忘记密码", "forgot password"], ["gebruikersnaam herstellen", "恢复用户名", "recover username"], ["melding ontvangen", "收到通知", "receive notification"], ["status bekijken", "查看状态", "view status"], ["online aanvragen", "在线申请", "apply online"], ["digitaal ondertekenen", "电子签名", "sign digitally"], ["bestand kiezen", "选择文件", "choose file"], ["maximale grootte", "最大大小", "maximum size"], ["pdf-bestand", "PDF 文件", "PDF file", "het"], ["bevestigingspagina", "确认页面", "confirmation page", "de"],
    ],
  },
  {
    level: "A2",
    theme: "energy-water-expanded",
    titleZh: "能源水务扩展",
    titleEn: "expanded energy and water",
    entries: [
      ["energiecontract", "能源合同", "energy contract", "het"], ["variabel tarief", "浮动费率", "variable tariff"], ["vast tarief", "固定费率", "fixed tariff"], ["maandbedrag", "月付金额", "monthly amount", "het"], ["jaarafrekening", "年度结算", "annual settlement", "de"], ["verbruik", "用量", "usage", "het"], ["stroom", "电流/电", "electricity", "de"], ["warmte", "热", "heat", "de"], ["waterverbruik", "用水量", "water usage", "het"], ["meterkast", "电表柜", "meter cupboard", "de"], ["meter opnemen", "抄表", "read the meter"], ["lek melden", "报告漏水", "report a leak"], ["contract overstappen", "换合同/供应商", "switch contract"], ["opzegvergoeding", "解约费", "cancellation fee", "de"], ["klantnummer", "客户号", "customer number", "het"], ["verbruiksperiode", "用量周期", "usage period", "de"], ["voorschotbedrag", "预付金额", "advance amount", "het"], ["termijnbedrag", "分期金额", "instalment amount", "het"],
    ],
  },
  {
    level: "A2",
    theme: "workplace-communication-expanded",
    titleZh: "职场沟通扩展",
    titleEn: "expanded workplace communication",
    entries: [
      ["overleg", "协商/会议", "consultation", "het"], ["werkoverleg", "工作会议", "work meeting", "het"], ["teamleider", "组长", "team leader", "de"], ["planning", "计划/排班", "planning", "de"], ["taakverdeling", "任务分配", "task division", "de"], ["instructie krijgen", "收到指示", "receive instructions"], ["doorgeven aan", "转告给", "pass on to"], ["afstemmen", "协调", "coordinate"], ["beschikbaar blijven", "保持可用", "remain available"], ["pauze nemen", "休息", "take a break"], ["dienst ruilen", "换班", "swap shifts"], ["uren doorgeven", "提交工时", "submit hours"], ["te laat melden", "报告迟到", "report lateness"], ["werkdruk", "工作压力", "work pressure", "de"], ["veilig werken", "安全工作", "work safely"], ["werkkleding", "工作服", "work clothes", "de"], ["personeelsnummer", "员工编号", "personnel number", "het"], ["instructiekaart", "说明卡", "instruction card", "de"],
    ],
  },
  {
    level: "A2",
    theme: "a2-active-reserve-expanded",
    titleZh: "A2 active 余量词",
    titleEn: "A2 active reserve words",
    entries: [
      ["regelen", "安排/处理", "arrange"], ["aanpassen", "调整", "adjust"], ["melden", "报告", "report"], ["bewijzen", "证明", "prove"], ["weigeren", "拒绝", "refuse"], ["accepteren", "接受", "accept"], ["bespreken", "讨论", "discuss"], ["uitleggen", "解释", "explain"], ["verbeteren", "改善", "improve"], ["veranderen", "改变", "change"], ["ontdekken", "发现", "discover"], ["controleren", "检查", "check"], ["bezoeken", "拜访/访问", "visit"], ["verhuizen", "搬家", "move house"], ["verlengen", "延长", "extend"], ["verkorten", "缩短", "shorten"], ["bereiken", "到达/联系到", "reach"], ["besparen", "节省", "save"], ["vergelijken", "比较", "compare"], ["kiezen", "选择", "choose"], ["beslissen", "决定", "decide"], ["aanbieden", "提供", "offer"], ["ontvangen", "收到", "receive"], ["verzenden", "发送", "send"],
    ],
  },
];

export const publicVocabularyAdditions: PublicVocabularyTheme[] = [
  ...publicVocabularyBaseAdditions,
  ...b1VocabularyThemes,
];
