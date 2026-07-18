import type { WordItem } from "@/types/vocabulary";
import type { MicroScenario } from "@/lib/dayPackMicroScenario";
import type { TemplateExample, WordType } from "@/lib/exampleTemplates";

const norm = (value: string) => value.trim().toLowerCase();
const hasTag = (word: WordItem, tag: string) => word.scenarioTags.includes(tag);
const inScenario = (microScenario: MicroScenario | undefined, needle: string) =>
  Boolean(microScenario && [microScenario.id, microScenario.titleZh, microScenario.titleEn, ...microScenario.sceneFlowZh, ...microScenario.sceneFlowEn].join(" ").toLowerCase().includes(needle));

const practicalExactScenarioExamples: Record<string, TemplateExample[]> = {
  elektriciteit: [{ dutch: "Ik betaal elke maand voor elektriciteit.", meaningZh: "我每月支付电费。", meaningEn: "I pay for electricity every month.", type: "scenario", phraseChunkUsed: "voor elektriciteit betalen", scenarioTags: ["housing", "payment"] }],
  huurtoeslag: [{ dutch: "Ik vraag huurtoeslag aan.", meaningZh: "我申请房租补贴。", meaningEn: "I apply for housing benefit.", type: "scenario", phraseChunkUsed: "huurtoeslag aanvragen", scenarioTags: ["benefits", "housing"] }],
  wijziging: [{ dutch: "Ik geef de wijziging door.", meaningZh: "我报告这个变更。", meaningEn: "I report the change.", type: "scenario", phraseChunkUsed: "de wijziging doorgeven", scenarioTags: ["appointment", "official"] }],
  annulering: [{ dutch: "Ik bevestig de annulering per e-mail.", meaningZh: "我通过电子邮件确认取消。", meaningEn: "I confirm the cancellation by email.", type: "scenario", phraseChunkUsed: "de annulering bevestigen", scenarioTags: ["appointment", "email"] }],
  afspraakkaart: [{ dutch: "Neem de afspraakkaart mee naar de huisarts.", meaningZh: "把预约卡带去家庭医生那里。", meaningEn: "Take the appointment card to the GP.", type: "scenario", phraseChunkUsed: "de afspraakkaart meenemen", scenarioTags: ["appointment", "health"] }],
  incasso: [{ dutch: "De incasso gaat automatisch van mijn rekening af.", meaningZh: "自动扣款会从我的账户扣除。", meaningEn: "The direct debit is taken automatically from my account.", type: "scenario", phraseChunkUsed: "automatische incasso", scenarioTags: ["payment", "bill"] }],
  onderhoud: [{ dutch: "De verhuurder regelt het onderhoud.", meaningZh: "房东安排维修保养。", meaningEn: "The landlord arranges the maintenance.", type: "scenario", phraseChunkUsed: "onderhoud regelen", scenarioTags: ["housing"] }],
  opzegtermijn: [{ dutch: "De opzegtermijn is een maand.", meaningZh: "解约通知期是一个月。", meaningEn: "The notice period is one month.", type: "scenario", phraseChunkUsed: "de opzegtermijn", scenarioTags: ["housing", "contract"] }],
  huurverhoging: [{ dutch: "Ik krijg een brief over de huurverhoging.", meaningZh: "我收到一封关于涨租的信。", meaningEn: "I receive a letter about the rent increase.", type: "scenario", phraseChunkUsed: "brief over de huurverhoging", scenarioTags: ["housing", "reading"] }],
  storingsnummer: [{ dutch: "Bel het storingsnummer bij een probleem.", meaningZh: "有问题时拨打故障电话。", meaningEn: "Call the fault reporting number when there is a problem.", type: "scenario", phraseChunkUsed: "het storingsnummer bellen", scenarioTags: ["housing", "phone"] }],
  huurspecificatie: [{ dutch: "Op de huurspecificatie staan de servicekosten.", meaningZh: "房租明细上写着服务费。", meaningEn: "The service costs are listed on the rent specification.", type: "scenario", phraseChunkUsed: "op de huurspecificatie", scenarioTags: ["housing", "bill"] }],
  woningcorporatie: [{ dutch: "Ik bel de woningcorporatie over de lekkage.", meaningZh: "我给住房协会打电话说漏水问题。", meaningEn: "I call the housing corporation about the leak.", type: "scenario", phraseChunkUsed: "de woningcorporatie bellen", scenarioTags: ["housing", "phone"] }],
  bevestigingsmail: [{ dutch: "Ik krijg een bevestigingsmail van de afspraak.", meaningZh: "我收到预约确认邮件。", meaningEn: "I receive a confirmation email for the appointment.", type: "scenario", phraseChunkUsed: "een bevestigingsmail krijgen", scenarioTags: ["appointment", "email"] }],
  adreswijziging: [{ dutch: "Ik geef mijn adreswijziging door aan de gemeente.", meaningZh: "我向市政厅申报地址变更。", meaningEn: "I report my address change to the municipality.", type: "scenario", phraseChunkUsed: "adreswijziging doorgeven", scenarioTags: ["gemeente", "form"] }],
  bezwaar: [{ dutch: "Ik wil bezwaar maken tegen het besluit.", meaningZh: "我想对这个决定提出异议。", meaningEn: "I want to object to the decision.", type: "output", phraseChunkUsed: "bezwaar maken tegen", scenarioTags: ["official", "writing"] }],
  intakegesprek: [{ dutch: "Morgen heb ik een intakegesprek.", meaningZh: "明天我有一次初次面谈。", meaningEn: "Tomorrow I have an intake conversation.", type: "scenario", phraseChunkUsed: "een intakegesprek hebben", scenarioTags: ["official", "appointment"] }],
  betalingsregeling: [{ dutch: "Ik vraag een betalingsregeling aan.", meaningZh: "我申请付款安排。", meaningEn: "I apply for a payment plan.", type: "scenario", phraseChunkUsed: "een betalingsregeling aanvragen", scenarioTags: ["payment", "bill"] }],
  contractverlenging: [{ dutch: "Ik bespreek de contractverlenging met mijn werkgever.", meaningZh: "我和雇主讨论合同延长。", meaningEn: "I discuss the contract extension with my employer.", type: "scenario", phraseChunkUsed: "de contractverlenging bespreken", scenarioTags: ["work", "contract"] }],
  arbeidsovereenkomst: [{ dutch: "Ik onderteken de arbeidsovereenkomst.", meaningZh: "我签署劳动合同。", meaningEn: "I sign the employment contract.", type: "scenario", phraseChunkUsed: "de arbeidsovereenkomst ondertekenen", scenarioTags: ["work", "contract"] }],
  afspraakherinnering: [{ dutch: "Ik krijg een afspraakherinnering per sms.", meaningZh: "我收到短信预约提醒。", meaningEn: "I receive an appointment reminder by text message.", type: "scenario", phraseChunkUsed: "een afspraakherinnering krijgen", scenarioTags: ["appointment", "phone"] }],
  wijzigingsformulier: [{ dutch: "Ik vul het wijzigingsformulier in.", meaningZh: "我填写更改表格。", meaningEn: "I fill in the change form.", type: "scenario", phraseChunkUsed: "het wijzigingsformulier invullen", scenarioTags: ["form", "official"] }],
  machtiging: [{ dutch: "Ik geef een machtiging voor automatische incasso.", meaningZh: "我授权自动扣款。", meaningEn: "I give authorization for direct debit.", type: "scenario", phraseChunkUsed: "een machtiging geven", scenarioTags: ["official", "payment"] }],
};

const b1ExactScenarioExamples: Record<string, TemplateExample[]> = {
  afdeling: [{ dutch: "Ik werk op de afdeling administratie.", meaningZh: "我在行政部门工作。", meaningEn: "I work in the administration department.", type: "scenario", phraseChunkUsed: "op de afdeling", scenarioTags: ["work"] }],
  loon: [{ dutch: "Mijn loon wordt elke maand betaald.", meaningZh: "我的工资每个月发放。", meaningEn: "My wage is paid every month.", type: "scenario", phraseChunkUsed: "loon betaald krijgen", scenarioTags: ["work", "money"] }],
  "afspraak maken": [{ dutch: "Ik wil een afspraak maken met de gemeente.", meaningZh: "我想和市政厅预约。", meaningEn: "I want to make an appointment with the municipality.", type: "output", phraseChunkUsed: "een afspraak maken met", scenarioTags: ["appointment", "gemeente"] }],
  docent: [{ dutch: "De docent legt de opdracht uit.", meaningZh: "老师解释任务。", meaningEn: "The teacher explains the assignment.", type: "scenario", phraseChunkUsed: "de opdracht uitleggen", scenarioTags: ["education"] }],
  niveau: [{ dutch: "Deze cursus is op B1-niveau.", meaningZh: "这门课是 B1 等级。", meaningEn: "This course is at B1 level.", type: "scenario", phraseChunkUsed: "op B1-niveau", scenarioTags: ["education"] }],
  "in ieder geval": [{ dutch: "In ieder geval stuur ik vandaag een antwoord.", meaningZh: "无论如何，我今天会发一个回复。", meaningEn: "In any case, I will send a reply today.", type: "output", phraseChunkUsed: "in ieder geval", scenarioTags: ["writing"] }],
  kenmerk: [{ dutch: "Zet het kenmerk in uw e-mail.", meaningZh: "请把编号写在您的邮件里。", meaningEn: "Put the reference number in your email.", type: "scenario", phraseChunkUsed: "het kenmerk vermelden", scenarioTags: ["official", "email"] }],
  termijn: [{ dutch: "De termijn is twee weken.", meaningZh: "期限是两周。", meaningEn: "The deadline is two weeks.", type: "scenario", phraseChunkUsed: "binnen de termijn", scenarioTags: ["official"] }],
  aanvraag: [{ dutch: "Ik dien mijn aanvraag online in.", meaningZh: "我在线提交我的申请。", meaningEn: "I submit my application online.", type: "scenario", phraseChunkUsed: "een aanvraag indienen", scenarioTags: ["form", "digital"] }],
  bijlage: [{ dutch: "Ik stuur de bijlage mee.", meaningZh: "我把附件一起发过去。", meaningEn: "I send the attachment along.", type: "scenario", phraseChunkUsed: "de bijlage meesturen", scenarioTags: ["email", "form"] }],
  bewijs: [{ dutch: "Ik voeg een bewijs van inkomen toe.", meaningZh: "我添加一份收入证明。", meaningEn: "I add proof of income.", type: "scenario", phraseChunkUsed: "bewijs van inkomen", scenarioTags: ["form", "tax"] }],
  kopie: [{ dutch: "Ik stuur een kopie van mijn paspoort mee.", meaningZh: "我附上一份护照复印件。", meaningEn: "I send a copy of my passport along.", type: "scenario", phraseChunkUsed: "een kopie meesturen", scenarioTags: ["form", "document"] }],
  gegevens: [{ dutch: "Controleer uw gegevens op het formulier.", meaningZh: "请检查表格上的个人信息。", meaningEn: "Check your details on the form.", type: "scenario", phraseChunkUsed: "gegevens controleren", scenarioTags: ["form"] }],
  gebruikersnaam: [{ dutch: "Vul uw gebruikersnaam in.", meaningZh: "请填写您的用户名。", meaningEn: "Enter your username.", type: "scenario", phraseChunkUsed: "gebruikersnaam invullen", scenarioTags: ["digital"] }],
  wachtwoord: [{ dutch: "Ik wijzig mijn wachtwoord.", meaningZh: "我修改我的密码。", meaningEn: "I change my password.", type: "scenario", phraseChunkUsed: "wachtwoord wijzigen", scenarioTags: ["digital"] }],
  "sms-controle": [{ dutch: "Bij het inloggen krijg ik een sms-controle.", meaningZh: "登录时我会收到短信验证。", meaningEn: "When logging in, I get an SMS check.", type: "scenario", phraseChunkUsed: "sms-controle krijgen", scenarioTags: ["digital"] }],
  website: [{ dutch: "Op de website kan ik mijn aanvraag bekijken.", meaningZh: "我可以在网站上查看我的申请。", meaningEn: "On the website I can view my application.", type: "scenario", phraseChunkUsed: "op de website", scenarioTags: ["digital", "form"] }],
  uploaden: [{ dutch: "Ik upload het bestand via de website.", meaningZh: "我通过网站上传文件。", meaningEn: "I upload the file through the website.", type: "scenario", phraseChunkUsed: "een bestand uploaden", scenarioTags: ["digital", "form"] }],
  downloaden: [{ dutch: "Ik download het pdf-bestand van de website.", meaningZh: "我从网站下载 PDF 文件。", meaningEn: "I download the PDF file from the website.", type: "scenario", phraseChunkUsed: "een pdf-bestand downloaden", scenarioTags: ["digital"] }],
  "pdf-bestand": [{ dutch: "Ik download het pdf-bestand van de website.", meaningZh: "我从网站下载 PDF 文件。", meaningEn: "I download the PDF file from the website.", type: "scenario", phraseChunkUsed: "het pdf-bestand downloaden", scenarioTags: ["digital"] }],
  huurtoeslag: [{ dutch: "Ik vraag huurtoeslag aan.", meaningZh: "我申请房租补贴。", meaningEn: "I apply for housing benefit.", type: "scenario", phraseChunkUsed: "huurtoeslag aanvragen", scenarioTags: ["benefits"] }],
  zorgtoeslag: [{ dutch: "Ik vraag zorgtoeslag aan.", meaningZh: "我申请医疗保险补贴。", meaningEn: "I apply for healthcare benefit.", type: "scenario", phraseChunkUsed: "zorgtoeslag aanvragen", scenarioTags: ["benefits"] }],
  terugbetalen: [{ dutch: "Ik moet een bedrag terugbetalen.", meaningZh: "我必须退还一笔金额。", meaningEn: "I have to pay back an amount.", type: "scenario", phraseChunkUsed: "een bedrag terugbetalen", scenarioTags: ["payment", "benefits"] }],
  gemeente: [{ dutch: "Ik maak een afspraak bij de gemeente.", meaningZh: "我在市政厅预约。", meaningEn: "I make an appointment at the municipality.", type: "scenario", phraseChunkUsed: "bij de gemeente", scenarioTags: ["gemeente", "appointment"] }],
  aanwezig: [{ dutch: "Ik ben vandaag aanwezig bij de les.", meaningZh: "我今天会到课。", meaningEn: "I am present at class today.", type: "scenario", phraseChunkUsed: "aanwezig zijn", scenarioTags: ["education"] }],
  afwezig: [{ dutch: "Ik ben morgen afwezig door ziekte.", meaningZh: "我明天因病缺席。", meaningEn: "I am absent tomorrow because of illness.", type: "scenario", phraseChunkUsed: "afwezig zijn", scenarioTags: ["education", "health"] }],
  basisschool: [{ dutch: "Mijn kind zit op de basisschool.", meaningZh: "我的孩子在上小学。", meaningEn: "My child is in primary school.", type: "scenario", phraseChunkUsed: "op de basisschool zitten", scenarioTags: ["education"] }],
  kapper: [{ dutch: "Ik maak een afspraak bij de kapper.", meaningZh: "我和理发师预约。", meaningEn: "I make an appointment with the hairdresser.", type: "scenario", phraseChunkUsed: "bij de kapper", scenarioTags: ["service"] }],
  kantoor: [{ dutch: "Ik werk vandaag op kantoor.", meaningZh: "我今天在办公室工作。", meaningEn: "I work at the office today.", type: "scenario", phraseChunkUsed: "op kantoor werken", scenarioTags: ["work"] }],
  "online aanvragen": [{ dutch: "Ik kan de toeslag online aanvragen.", meaningZh: "我可以在线申请补贴。", meaningEn: "I can apply for the benefit online.", type: "scenario", phraseChunkUsed: "online aanvragen", scenarioTags: ["digital", "benefits"] }],
  "digitaal ondertekenen": [{ dutch: "Ik moet het formulier digitaal ondertekenen.", meaningZh: "我必须电子签署表格。", meaningEn: "I have to sign the form digitally.", type: "scenario", phraseChunkUsed: "digitaal ondertekenen", scenarioTags: ["digital", "form"] }],
  toestemming: [{ dutch: "Ik geef toestemming voor contact per e-mail.", meaningZh: "我同意通过电子邮件联系。", meaningEn: "I give permission for contact by email.", type: "scenario", phraseChunkUsed: "toestemming geven", scenarioTags: ["official", "email"] }],
  onderzoek: [{ dutch: "De huisarts doet een onderzoek.", meaningZh: "家庭医生做检查。", meaningEn: "The GP does an examination.", type: "scenario", phraseChunkUsed: "een onderzoek doen", scenarioTags: ["health"] }],
  uitslag: [{ dutch: "Ik krijg de uitslag morgen.", meaningZh: "我明天拿到结果。", meaningEn: "I get the result tomorrow.", type: "scenario", phraseChunkUsed: "de uitslag krijgen", scenarioTags: ["health"] }],
  verwijzing: [{ dutch: "Ik heb een verwijzing nodig voor de specialist.", meaningZh: "我需要一张转诊单去看专科医生。", meaningEn: "I need a referral for the specialist.", type: "scenario", phraseChunkUsed: "een verwijzing nodig hebben", scenarioTags: ["health"] }],
  huid: [{ dutch: "Mijn huid is rood en gevoelig.", meaningZh: "我的皮肤发红并且敏感。", meaningEn: "My skin is red and sensitive.", type: "scenario", phraseChunkUsed: "mijn huid is rood", scenarioTags: ["health"] }],
  schouder: [{ dutch: "Ik draag een tas op mijn schouder.", meaningZh: "我把包背在肩上。", meaningEn: "I carry a bag on my shoulder.", type: "scenario", phraseChunkUsed: "op mijn schouder dragen", scenarioTags: ["health", "body"] }],
  knie: [{ dutch: "Ik buig mijn knie bij het lopen.", meaningZh: "我走路时弯曲膝盖。", meaningEn: "I bend my knee when walking.", type: "scenario", phraseChunkUsed: "mijn knie buigen", scenarioTags: ["health", "body"] }],
  nek: [{ dutch: "Ik draai mijn nek rustig.", meaningZh: "我轻轻转动脖子。", meaningEn: "I turn my neck gently.", type: "scenario", phraseChunkUsed: "mijn nek draaien", scenarioTags: ["health", "body"] }],
  borst: [{ dutch: "Mijn borst beweegt als ik adem.", meaningZh: "我呼吸时胸口会动。", meaningEn: "My chest moves when I breathe.", type: "scenario", phraseChunkUsed: "mijn borst beweegt", scenarioTags: ["health", "body"] }],
  hart: [{ dutch: "Mijn hart klopt snel.", meaningZh: "我的心跳很快。", meaningEn: "My heart is beating fast.", type: "scenario", phraseChunkUsed: "hart klopt snel", scenarioTags: ["health"] }],
  maag: [{ dutch: "Mijn maag is vol na het eten.", meaningZh: "我吃完饭后胃很满。", meaningEn: "My stomach is full after eating.", type: "scenario", phraseChunkUsed: "mijn maag is vol", scenarioTags: ["health", "body"] }],
  bloed: [{ dutch: "De huisarts controleert mijn bloed.", meaningZh: "家庭医生检查我的血液。", meaningEn: "The GP checks my blood.", type: "scenario", phraseChunkUsed: "bloed controleren", scenarioTags: ["health"] }],
  verhuurder: [{ dutch: "Ik bel de verhuurder over de lekkage.", meaningZh: "我给房东打电话说漏水问题。", meaningEn: "I call the landlord about the leak.", type: "scenario", phraseChunkUsed: "de verhuurder bellen", scenarioTags: ["housing"] }],
  schimmel: [{ dutch: "Er zit schimmel in de badkamer.", meaningZh: "浴室里有霉菌。", meaningEn: "There is mould in the bathroom.", type: "scenario", phraseChunkUsed: "schimmel in de badkamer", scenarioTags: ["housing"] }],
  onderhoud: [{ dutch: "De verhuurder regelt het onderhoud.", meaningZh: "房东安排维修保养。", meaningEn: "The landlord arranges the maintenance.", type: "scenario", phraseChunkUsed: "onderhoud regelen", scenarioTags: ["housing"] }],
  monteur: [{ dutch: "De monteur komt morgen langs.", meaningZh: "维修工明天过来。", meaningEn: "The technician will come by tomorrow.", type: "scenario", phraseChunkUsed: "de monteur komt langs", scenarioTags: ["housing"] }],
  dienstregeling: [{ dutch: "De dienstregeling is vandaag aangepast.", meaningZh: "今天的时刻表调整了。", meaningEn: "The timetable has been changed today.", type: "scenario", phraseChunkUsed: "de dienstregeling is aangepast", scenarioTags: ["transport"] }],
  omleiding: [{ dutch: "Door de omleiding rijdt de bus anders.", meaningZh: "因为绕行，公交改道行驶。", meaningEn: "Because of the diversion, the bus runs differently.", type: "scenario", phraseChunkUsed: "door de omleiding", scenarioTags: ["transport"] }],
  conducteur: [{ dutch: "De conducteur controleert mijn kaartje.", meaningZh: "列车员检查我的车票。", meaningEn: "The conductor checks my ticket.", type: "scenario", phraseChunkUsed: "conducteur controleert", scenarioTags: ["transport"] }],
  boete: [{ dutch: "Ik moet een boete betalen.", meaningZh: "我必须交罚款。", meaningEn: "I have to pay a fine.", type: "scenario", phraseChunkUsed: "boete betalen", scenarioTags: ["transport", "payment"] }],
  reisinformatie: [{ dutch: "Ik lees de reisinformatie in de app.", meaningZh: "我在应用里读出行信息。", meaningEn: "I read the travel information in the app.", type: "scenario", phraseChunkUsed: "reisinformatie lezen", scenarioTags: ["transport", "digital"] }],
  overstap: [{ dutch: "Mijn overstap is op spoor 3.", meaningZh: "我的换乘在 3 号轨道。", meaningEn: "My transfer is at track 3.", type: "scenario", phraseChunkUsed: "mijn overstap", scenarioTags: ["transport"] }],
  "vervangend vervoer": [{ dutch: "Er rijdt vervangend vervoer tussen de stations.", meaningZh: "车站之间有替代交通运行。", meaningEn: "Replacement transport runs between the stations.", type: "scenario", phraseChunkUsed: "vervangend vervoer", scenarioTags: ["transport"] }],
  klant: [{ dutch: "De klant heeft een vraag over de bestelling.", meaningZh: "顾客有一个关于订单的问题。", meaningEn: "The customer has a question about the order.", type: "scenario", phraseChunkUsed: "de klant heeft een vraag", scenarioTags: ["shopping"] }],
  klantenservice: [{ dutch: "Ik bel de klantenservice over mijn bestelling.", meaningZh: "我给客服打电话问我的订单。", meaningEn: "I call customer service about my order.", type: "scenario", phraseChunkUsed: "de klantenservice bellen", scenarioTags: ["shopping", "phone"] }],
  klantenbalie: [{ dutch: "Bij de klantenbalie vraag ik om hulp.", meaningZh: "我在客服柜台寻求帮助。", meaningEn: "At the customer desk I ask for help.", type: "scenario", phraseChunkUsed: "bij de klantenbalie", scenarioTags: ["shopping"] }],
  bestelling: [{ dutch: "Mijn bestelling is nog niet aangekomen.", meaningZh: "我的订单还没有到。", meaningEn: "My order has not arrived yet.", type: "scenario", phraseChunkUsed: "mijn bestelling", scenarioTags: ["shopping"] }],
  artikelnummer: [{ dutch: "Het artikelnummer staat op de bon.", meaningZh: "商品编号在收据上。", meaningEn: "The item number is on the receipt.", type: "scenario", phraseChunkUsed: "artikelnummer op de bon", scenarioTags: ["shopping"] }],
  voorraadstatus: [{ dutch: "De voorraadstatus staat op de website.", meaningZh: "库存状态在网站上。", meaningEn: "The stock status is on the website.", type: "scenario", phraseChunkUsed: "voorraadstatus bekijken", scenarioTags: ["shopping", "digital"] }],
  aankoopdatum: [{ dutch: "De aankoopdatum staat op de bon.", meaningZh: "购买日期在收据上。", meaningEn: "The purchase date is on the receipt.", type: "scenario", phraseChunkUsed: "aankoopdatum op de bon", scenarioTags: ["shopping"] }],
  garantie: [{ dutch: "Ik heb nog garantie op dit product.", meaningZh: "这个产品还在保修期内。", meaningEn: "I still have a warranty on this product.", type: "scenario", phraseChunkUsed: "garantie hebben", scenarioTags: ["shopping"] }],
  garantiebewijs: [{ dutch: "Bewaar het garantiebewijs goed.", meaningZh: "请保管好保修凭证。", meaningEn: "Keep the warranty proof safe.", type: "scenario", phraseChunkUsed: "het garantiebewijs bewaren", scenarioTags: ["shopping"] }],
  retourneren: [{ dutch: "Ik wil het product retourneren.", meaningZh: "我想退回这个产品。", meaningEn: "I want to return the product.", type: "scenario", phraseChunkUsed: "een product retourneren", scenarioTags: ["shopping"] }],
  ruiltermijn: [{ dutch: "De ruiltermijn is veertien dagen.", meaningZh: "换货期限是十四天。", meaningEn: "The exchange period is fourteen days.", type: "scenario", phraseChunkUsed: "binnen de ruiltermijn", scenarioTags: ["shopping"] }],
  beschadigd: [{ dutch: "Het pakket is beschadigd aangekomen.", meaningZh: "包裹到达时损坏了。", meaningEn: "The package arrived damaged.", type: "scenario", phraseChunkUsed: "beschadigd aankomen", scenarioTags: ["shopping"] }],
  bezorgkosten: [{ dutch: "De bezorgkosten zijn vijf euro.", meaningZh: "配送费是五欧元。", meaningEn: "The delivery costs are five euros.", type: "scenario", phraseChunkUsed: "bezorgkosten betalen", scenarioTags: ["shopping", "payment"] }],
  pakketpunt: [{ dutch: "Ik haal het pakket op bij het pakketpunt.", meaningZh: "我在包裹点取包裹。", meaningEn: "I pick up the package at the parcel point.", type: "scenario", phraseChunkUsed: "bij het pakketpunt", scenarioTags: ["shopping"] }],
  klacht: [{ dutch: "Ik heb een klacht over de levering.", meaningZh: "我对配送有投诉。", meaningEn: "I have a complaint about the delivery.", type: "output", phraseChunkUsed: "een klacht over", scenarioTags: ["shopping", "complaint"] }],
  reparatieverzoek: [{ dutch: "Ik stuur een reparatieverzoek naar de verhuurder.", meaningZh: "我给房东发送维修请求。", meaningEn: "I send a repair request to the landlord.", type: "scenario", phraseChunkUsed: "een reparatieverzoek sturen", scenarioTags: ["housing"] }],
  bestelbevestiging: [{ dutch: "Ik heb de bestelbevestiging per e-mail gekregen.", meaningZh: "我通过电子邮件收到了订单确认。", meaningEn: "I received the order confirmation by email.", type: "scenario", phraseChunkUsed: "bestelbevestiging per e-mail", scenarioTags: ["shopping", "email"] }],
  opdracht: [{ dutch: "Ik lever de opdracht morgen in.", meaningZh: "我明天提交这项任务。", meaningEn: "I hand in the assignment tomorrow.", type: "scenario", phraseChunkUsed: "de opdracht inleveren", scenarioTags: ["education"] }],
  oplossing: [{ dutch: "Ik wil samen een oplossing zoeken.", meaningZh: "我想一起寻找解决方案。", meaningEn: "I want to look for a solution together.", type: "output", phraseChunkUsed: "een oplossing zoeken", scenarioTags: ["complaint", "work"] }],
  onderwerp: [{ dutch: "Zet het onderwerp duidelijk in de e-mail.", meaningZh: "请把主题清楚地写在邮件里。", meaningEn: "Put the subject clearly in the email.", type: "scenario", phraseChunkUsed: "het onderwerp vermelden", scenarioTags: ["email"] }],
  informatie: [{ dutch: "Ik zoek informatie over de cursus.", meaningZh: "我查找关于课程的信息。", meaningEn: "I look for information about the course.", type: "scenario", phraseChunkUsed: "informatie zoeken", scenarioTags: ["education", "digital"] }],
  tekst: [{ dutch: "Ik lees de tekst en onderstreep de kernwoorden.", meaningZh: "我阅读文本并划出关键词。", meaningEn: "I read the text and underline the key words.", type: "scenario", phraseChunkUsed: "de tekst lezen", scenarioTags: ["reading"] }],
  notitie: [{ dutch: "Ik maak een notitie tijdens het gesprek.", meaningZh: "我在谈话时做笔记。", meaningEn: "I make a note during the conversation.", type: "scenario", phraseChunkUsed: "een notitie maken", scenarioTags: ["work", "writing"] }],
  temperatuur: [{ dutch: "De temperatuur is vandaag lager.", meaningZh: "今天温度更低。", meaningEn: "The temperature is lower today.", type: "scenario", phraseChunkUsed: "de temperatuur is lager", scenarioTags: ["weather"] }],
  wind: [{ dutch: "Er is veel wind vandaag.", meaningZh: "今天风很大。", meaningEn: "There is a lot of wind today.", type: "scenario", phraseChunkUsed: "veel wind", scenarioTags: ["weather"] }],
  afval: [{ dutch: "Ik breng het afval naar de container.", meaningZh: "我把垃圾拿到垃圾桶。", meaningEn: "I bring the waste to the container.", type: "scenario", phraseChunkUsed: "afval wegbrengen", scenarioTags: ["housing", "society"] }],
  besparen: [{ dutch: "Ik wil energie besparen.", meaningZh: "我想节省能源。", meaningEn: "I want to save energy.", type: "scenario", phraseChunkUsed: "energie besparen", scenarioTags: ["housing", "money"] }],
  fruit: [{ dutch: "Ik eet elke dag fruit.", meaningZh: "我每天吃水果。", meaningEn: "I eat fruit every day.", type: "scenario", phraseChunkUsed: "fruit eten", scenarioTags: ["food-drink"] }],
  gratis: [{ dutch: "De cursus is gratis.", meaningZh: "这门课是免费的。", meaningEn: "The course is free.", type: "scenario", phraseChunkUsed: "gratis zijn", scenarioTags: ["education"] }],
  "alvast bedankt": [{ dutch: "Alvast bedankt voor uw reactie.", meaningZh: "提前感谢您的回复。", meaningEn: "Thank you in advance for your response.", type: "output", phraseChunkUsed: "alvast bedankt", scenarioTags: ["email", "writing"] }],
  "naar aanleiding van": [{ dutch: "Naar aanleiding van uw brief stuur ik deze e-mail.", meaningZh: "根据您的来信，我发送这封邮件。", meaningEn: "In response to your letter, I am sending this email.", type: "output", phraseChunkUsed: "naar aanleiding van", scenarioTags: ["email", "writing"] }],
  "met vriendelijke groet": [{ dutch: "Met vriendelijke groet, Fatima.", meaningZh: "此致，Fatima。", meaningEn: "Kind regards, Fatima.", type: "output", phraseChunkUsed: "met vriendelijke groet", scenarioTags: ["email", "writing"] }],
};

export const scenarioExamplesForWord = (
  word: WordItem,
  wordType: WordType,
  microScenario?: MicroScenario,
): TemplateExample[] => {
  const dutch = norm(word.dutch);
  const examples: TemplateExample[] = [];

  if (practicalExactScenarioExamples[dutch]) {
    examples.push(...practicalExactScenarioExamples[dutch]);
  }

  if (word.level === "B1" && b1ExactScenarioExamples[dutch]) {
    examples.push(...b1ExactScenarioExamples[dutch]);
  }

  if (inScenario(microScenario, "gp") || inScenario(microScenario, "huisarts") || hasTag(word, "health") || hasTag(word, "appointment")) {
    if (dutch === "ziek") examples.push({ dutch: "Ik ben ziek.", meaningZh: "我病了。", meaningEn: "I am sick.", type: "scenario", phraseChunkUsed: "ziek zijn", scenarioTags: ["health"] });
    if (dutch === "huisarts") examples.push({ dutch: "Ik bel de huisarts.", meaningZh: "我打电话给家庭医生。", meaningEn: "I call the GP.", type: "scenario", phraseChunkUsed: "de huisarts bellen", scenarioTags: ["health", "appointment"] });
    if (dutch === "afspraak") examples.push({ dutch: "Ik wil graag een afspraak maken.", meaningZh: "我想预约。", meaningEn: "I would like to make an appointment.", type: "scenario", phraseChunkUsed: "een afspraak maken", scenarioTags: ["appointment", "health"] });
    if (dutch === "pijn") examples.push({ dutch: "Ik heb pijn in mijn buik.", meaningZh: "我肚子疼。", meaningEn: "I have pain in my stomach.", type: "scenario", phraseChunkUsed: "pijn in mijn buik", scenarioTags: ["health"] });
    if (dutch === "helpen" || dutch === "help" || dutch === "hulp") examples.push({ dutch: "Kunt u mij helpen?", meaningZh: "您能帮我吗？", meaningEn: "Can you help me?", type: "output", phraseChunkUsed: "Kunt u mij helpen?", scenarioTags: ["help", "health"] });
  }

  if (inScenario(microScenario, "gemeente") || inScenario(microScenario, "form") || hasTag(word, "gemeente") || hasTag(word, "form")) {
    if (dutch === "gemeente") examples.push({ dutch: "Ik ga naar de gemeente.", meaningZh: "我去市政厅。", meaningEn: "I go to the municipality.", type: "scenario", phraseChunkUsed: "naar de gemeente gaan", scenarioTags: ["gemeente"] });
    if (dutch === "formulier") examples.push({ dutch: "Ik moet een formulier invullen.", meaningZh: "我必须填写一张表格。", meaningEn: "I have to fill in a form.", type: "scenario", phraseChunkUsed: "een formulier invullen", scenarioTags: ["form", "gemeente"] });
    if (dutch === "adres") examples.push({ dutch: "Ik vul mijn adres in.", meaningZh: "我填写我的地址。", meaningEn: "I fill in my address.", type: "collocation", phraseChunkUsed: "mijn adres invullen", scenarioTags: ["form", "gemeente"] });
    if (dutch === "document" || dutch === "documenten" || dutch === "nodig") examples.push({ dutch: "Welke documenten heb ik nodig?", meaningZh: "我需要哪些文件？", meaningEn: "Which documents do I need?", type: "output", phraseChunkUsed: "documenten nodig hebben", scenarioTags: ["form", "gemeente"] });
  }

  if (inScenario(microScenario, "supermarket") || inScenario(microScenario, "超市") || hasTag(word, "supermarket")) {
    if (dutch === "brood") examples.push({ dutch: "Ik koop brood.", meaningZh: "我买面包。", meaningEn: "I buy bread.", type: "scenario", phraseChunkUsed: "brood kopen", scenarioTags: ["supermarket"] });
    if (dutch === "melk") examples.push({ dutch: "Ik koop melk.", meaningZh: "我买牛奶。", meaningEn: "I buy milk.", type: "scenario", phraseChunkUsed: "melk kopen", scenarioTags: ["supermarket"] });
    if (dutch === "betalen") examples.push({ dutch: "Kan ik met pin betalen?", meaningZh: "我可以刷卡付款吗？", meaningEn: "Can I pay by card?", type: "output", phraseChunkUsed: "met pin betalen", scenarioTags: ["supermarket", "payment"] });
    if (dutch === "winkel") examples.push({ dutch: "De winkel is open.", meaningZh: "商店开着。", meaningEn: "The shop is open.", type: "scenario", phraseChunkUsed: "de winkel is open", scenarioTags: ["supermarket"] });
  }

  if (inScenario(microScenario, "transport") || hasTag(word, "transport")) {
    if (dutch === "trein") examples.push({ dutch: "Mijn trein heeft vertraging.", meaningZh: "我的火车晚点了。", meaningEn: "My train is delayed.", type: "scenario", phraseChunkUsed: "de trein heeft vertraging", scenarioTags: ["transport"] });
    if (dutch === "vertraging") examples.push({ dutch: "De trein heeft vertraging.", meaningZh: "火车晚点了。", meaningEn: "The train is delayed.", type: "scenario", phraseChunkUsed: "vertraging hebben", scenarioTags: ["transport"] });
    if (dutch === "station") examples.push({ dutch: "Waar is het station?", meaningZh: "车站在哪里？", meaningEn: "Where is the station?", type: "output", phraseChunkUsed: "waar is het station", scenarioTags: ["transport"] });
  }

  if (word.level === "B1" && (hasTag(word, "work") || inScenario(microScenario, "work"))) {
    if (dutch === "sollicitatie") examples.push({ dutch: "Ik heb mijn sollicitatie online verstuurd.", meaningZh: "我已经在线提交了我的求职申请。", meaningEn: "I submitted my job application online.", type: "scenario", phraseChunkUsed: "een sollicitatie versturen", scenarioTags: ["work", "digital"] });
    if (dutch === "sollicitatiegesprek") examples.push({ dutch: "Morgen heb ik een sollicitatiegesprek.", meaningZh: "明天我有一次求职面试。", meaningEn: "Tomorrow I have a job interview.", type: "scenario", phraseChunkUsed: "een sollicitatiegesprek hebben", scenarioTags: ["work"] });
    if (dutch === "vacature") examples.push({ dutch: "Ik reageer op een vacature in de zorg.", meaningZh: "我回复一个医疗护理行业的招聘职位。", meaningEn: "I respond to a vacancy in care.", type: "scenario", phraseChunkUsed: "op een vacature reageren", scenarioTags: ["work"] });
    if (dutch === "cv") examples.push({ dutch: "Ik voeg mijn cv toe aan de sollicitatie.", meaningZh: "我把简历附在求职申请里。", meaningEn: "I add my CV to the job application.", type: "scenario", phraseChunkUsed: "mijn cv toevoegen", scenarioTags: ["work", "digital"] });
    if (dutch === "motivatiebrief") examples.push({ dutch: "In mijn motivatiebrief leg ik uit waarom ik geschikt ben.", meaningZh: "我在动机信里解释为什么我适合。", meaningEn: "In my motivation letter I explain why I am suitable.", type: "output", phraseChunkUsed: "in mijn motivatiebrief", scenarioTags: ["work", "writing"] });
    if (dutch === "werkgever") examples.push({ dutch: "Mijn werkgever stuurt de loonstrook digitaal.", meaningZh: "我的雇主以电子方式发送工资单。", meaningEn: "My employer sends the payslip digitally.", type: "scenario", phraseChunkUsed: "mijn werkgever", scenarioTags: ["work", "digital"] });
    if (dutch === "werknemer") examples.push({ dutch: "Als werknemer heb ik recht op pauze.", meaningZh: "作为雇员，我有休息的权利。", meaningEn: "As an employee I have the right to a break.", type: "scenario", phraseChunkUsed: "als werknemer", scenarioTags: ["work", "law"] });
    if (dutch === "arbeidscontract" || dutch === "contract") examples.push({ dutch: "Ik lees mijn arbeidscontract goed door.", meaningZh: "我认真读我的劳动合同。", meaningEn: "I read my employment contract carefully.", type: "scenario", phraseChunkUsed: "mijn arbeidscontract doorlezen", scenarioTags: ["work"] });
    if (dutch === "loonstrook") examples.push({ dutch: "Op mijn loonstrook staat mijn brutoloon en nettoloon.", meaningZh: "我的工资单上写着税前工资和税后工资。", meaningEn: "My payslip shows my gross pay and net pay.", type: "scenario", phraseChunkUsed: "op mijn loonstrook", scenarioTags: ["work", "money"] });
    if (dutch === "salaris") examples.push({ dutch: "Mijn salaris wordt aan het einde van de maand betaald.", meaningZh: "我的工资在月底支付。", meaningEn: "My salary is paid at the end of the month.", type: "scenario", phraseChunkUsed: "salaris betalen", scenarioTags: ["work", "money"] });
    if (dutch === "proeftijd") examples.push({ dutch: "In mijn proeftijd kan het contract sneller stoppen.", meaningZh: "在试用期内，合同可以更快终止。", meaningEn: "During my probation period, the contract can end more quickly.", type: "scenario", phraseChunkUsed: "in mijn proeftijd", scenarioTags: ["work", "law"] });
    if (dutch === "rooster") examples.push({ dutch: "Volgens mijn rooster werk ik morgen.", meaningZh: "根据我的排班表，我明天工作。", meaningEn: "According to my schedule, I work tomorrow.", type: "scenario", phraseChunkUsed: "volgens mijn rooster", scenarioTags: ["work"] });
    if (dutch === "leidinggevende") examples.push({ dutch: "Ik bespreek het met mijn leidinggevende.", meaningZh: "我和我的主管讨论这件事。", meaningEn: "I discuss it with my supervisor.", type: "scenario", phraseChunkUsed: "met mijn leidinggevende bespreken", scenarioTags: ["work"] });
    if (dutch === "functie") examples.push({ dutch: "Ik wil graag meer informatie over de functie.", meaningZh: "我想了解更多关于这个职位的信息。", meaningEn: "I would like more information about the position.", type: "output", phraseChunkUsed: "informatie over de functie", scenarioTags: ["work"] });
    if (dutch === "werkervaring" || dutch === "ervaring") examples.push({ dutch: "Ik heb werkervaring in de horeca.", meaningZh: "我有餐饮行业的工作经验。", meaningEn: "I have work experience in hospitality.", type: "output", phraseChunkUsed: "werkervaring hebben", scenarioTags: ["work"] });
    if (dutch === "overleg" || dutch === "werkoverleg") examples.push({ dutch: "Tijdens het overleg bespreek ik mijn vraag.", meaningZh: "在会议中我讨论我的问题。", meaningEn: "During the meeting I discuss my question.", type: "scenario", phraseChunkUsed: "tijdens het overleg", scenarioTags: ["work"] });
    if (dutch === "fulltime") examples.push({ dutch: "Deze functie is fulltime, dus 40 uur per week.", meaningZh: "这个职位是全职，也就是每周40小时。", meaningEn: "This position is full-time, so 40 hours per week.", type: "scenario", phraseChunkUsed: "fulltime werken", scenarioTags: ["work"] });
    if (dutch === "parttime") examples.push({ dutch: "Ik zoek parttime werk naast mijn opleiding.", meaningZh: "我在学习之外寻找兼职工作。", meaningEn: "I am looking for part-time work alongside my studies.", type: "scenario", phraseChunkUsed: "parttime werk zoeken", scenarioTags: ["work", "education"] });
  }

  if (word.level === "B1" && (hasTag(word, "education") || inScenario(microScenario, "education"))) {
    if (dutch === "opleiding") examples.push({ dutch: "Ik volg een opleiding op mbo-niveau.", meaningZh: "我在上 mbo 等级的培训/教育。", meaningEn: "I am following a program at mbo level.", type: "scenario", phraseChunkUsed: "een opleiding volgen", scenarioTags: ["education", "work"] });
    if (dutch === "mbo") examples.push({ dutch: "Deze opleiding is op mbo-niveau.", meaningZh: "这个课程是 mbo 水平。", meaningEn: "This program is at mbo level.", type: "scenario", phraseChunkUsed: "op mbo-niveau", scenarioTags: ["education"] });
    if (dutch === "opdracht") examples.push({ dutch: "Ik lever de opdracht morgen in.", meaningZh: "我明天提交这项任务。", meaningEn: "I hand in the assignment tomorrow.", type: "scenario", phraseChunkUsed: "de opdracht inleveren", scenarioTags: ["education"] });
    if (dutch === "stage") examples.push({ dutch: "Tijdens mijn stage leer ik in de praktijk.", meaningZh: "在实习期间我在实践中学习。", meaningEn: "During my internship I learn in practice.", type: "scenario", phraseChunkUsed: "tijdens mijn stage", scenarioTags: ["education", "work"] });
    if (dutch === "studieadvies") examples.push({ dutch: "Ik wil graag studieadvies vragen.", meaningZh: "我想咨询学习建议。", meaningEn: "I would like to ask for study advice.", type: "output", phraseChunkUsed: "studieadvies vragen", scenarioTags: ["education"] });
    if (dutch === "begeleider") examples.push({ dutch: "Mijn begeleider geeft feedback op mijn opdracht.", meaningZh: "我的指导老师对我的作业给反馈。", meaningEn: "My supervisor gives feedback on my assignment.", type: "scenario", phraseChunkUsed: "feedback geven op", scenarioTags: ["education"] });
    if (dutch === "portfolio") examples.push({ dutch: "Ik bewaar mijn opdrachten in mijn portfolio.", meaningZh: "我把作业保存在我的作品/学习档案里。", meaningEn: "I keep my assignments in my portfolio.", type: "scenario", phraseChunkUsed: "in mijn portfolio bewaren", scenarioTags: ["education"] });
  }

  if (word.level === "B1" && (hasTag(word, "reading") || hasTag(word, "writing") || inScenario(microScenario, "official"))) {
    if (dutch === "brief" || dutch === "informatiebrief") examples.push({ dutch: "Volgens de brief moet ik binnen twee weken reageren.", meaningZh: "根据信件，我必须在两周内回复。", meaningEn: "According to the letter, I must respond within two weeks.", type: "scenario", phraseChunkUsed: "volgens de brief", scenarioTags: ["reading", "writing"] });
    if (dutch === "alinea") examples.push({ dutch: "In de eerste alinea staat het belangrijkste punt.", meaningZh: "第一段里写着最重要的点。", meaningEn: "The most important point is in the first paragraph.", type: "scenario", phraseChunkUsed: "in de eerste alinea", scenarioTags: ["reading", "writing"] });
    if (dutch === "aantekening") examples.push({ dutch: "Ik maak een aantekening tijdens het gesprek.", meaningZh: "我在谈话时做一条笔记。", meaningEn: "I make a note during the conversation.", type: "scenario", phraseChunkUsed: "een aantekening maken", scenarioTags: ["writing", "work"] });
    if (dutch === "tabel") examples.push({ dutch: "In de tabel staat hoeveel ik moet betalen.", meaningZh: "表格里写着我必须支付多少。", meaningEn: "The table shows how much I have to pay.", type: "scenario", phraseChunkUsed: "in de tabel staat", scenarioTags: ["reading", "bill"] });
    if (dutch === "besluit") examples.push({ dutch: "Ik begrijp het besluit niet helemaal.", meaningZh: "我不完全理解这个决定。", meaningEn: "I do not fully understand the decision.", type: "output", phraseChunkUsed: "het besluit begrijpen", scenarioTags: ["reading", "form"] });
    if (dutch === "bezwaar") examples.push({ dutch: "Ik wil bezwaar maken tegen het besluit.", meaningZh: "我想对这个决定提出异议。", meaningEn: "I want to object to the decision.", type: "output", phraseChunkUsed: "bezwaar maken", scenarioTags: ["writing", "form"] });
    if (dutch === "samenvatting") examples.push({ dutch: "Ik schrijf een korte samenvatting van de tekst.", meaningZh: "我写一段这个文本的简短总结。", meaningEn: "I write a short summary of the text.", type: "scenario", phraseChunkUsed: "een samenvatting schrijven", scenarioTags: ["writing"] });
    if (dutch === "argument") examples.push({ dutch: "Ik geef een argument voor mijn mening.", meaningZh: "我给出一个支持我观点的理由。", meaningEn: "I give an argument for my opinion.", type: "output", phraseChunkUsed: "een argument geven", scenarioTags: ["writing", "speaking"] });
    if (dutch === "voorstel") examples.push({ dutch: "Ik doe een voorstel voor een oplossing.", meaningZh: "我提出一个解决方案建议。", meaningEn: "I make a proposal for a solution.", type: "output", phraseChunkUsed: "een voorstel doen", scenarioTags: ["writing", "work"] });
  }

  if (word.level === "B1" && (hasTag(word, "digital") || hasTag(word, "tax") || hasTag(word, "benefits"))) {
    if (dutch === "DigiD".toLowerCase() || dutch === "digid") examples.push({ dutch: "Ik log in met mijn DigiD.", meaningZh: "我用我的 DigiD 登录。", meaningEn: "I log in with my DigiD.", type: "scenario", phraseChunkUsed: "inloggen met DigiD", scenarioTags: ["digital"] });
    if (dutch === "belastingaangifte") examples.push({ dutch: "Ik moet mijn belastingaangifte controleren.", meaningZh: "我必须检查我的报税。", meaningEn: "I have to check my tax return.", type: "scenario", phraseChunkUsed: "belastingaangifte controleren", scenarioTags: ["tax"] });
    if (dutch === "inkomen") examples.push({ dutch: "Mijn inkomen bepaalt hoeveel toeslag ik krijg.", meaningZh: "我的收入决定我能拿多少补贴。", meaningEn: "My income determines how much benefit I receive.", type: "scenario", phraseChunkUsed: "mijn inkomen", scenarioTags: ["tax", "benefits"] });
    if (dutch === "brutoloon") examples.push({ dutch: "Mijn brutoloon is hoger dan mijn nettoloon.", meaningZh: "我的税前工资比税后工资高。", meaningEn: "My gross pay is higher than my net pay.", type: "contrast", phraseChunkUsed: "brutoloon en nettoloon", scenarioTags: ["work", "money"] });
    if (dutch === "nettoloon") examples.push({ dutch: "Op mijn rekening komt mijn nettoloon binnen.", meaningZh: "到账的是我的税后工资。", meaningEn: "My net pay arrives in my bank account.", type: "scenario", phraseChunkUsed: "mijn nettoloon", scenarioTags: ["work", "money"] });
    if (dutch === "toeslag" || dutch === "huurtoeslag" || dutch === "zorgtoeslag") examples.push({ dutch: "Ik wil weten of mijn toeslag klopt.", meaningZh: "我想知道我的补贴是否正确。", meaningEn: "I want to know whether my benefit is correct.", type: "output", phraseChunkUsed: "toeslag controleren", scenarioTags: ["benefits"] });
    if (dutch === "bestand") examples.push({ dutch: "Ik voeg het bestand toe aan mijn aanvraag.", meaningZh: "我把文件添加到我的申请里。", meaningEn: "I add the file to my application.", type: "scenario", phraseChunkUsed: "het bestand toevoegen", scenarioTags: ["digital", "form"] });
    if (dutch === "aanvraag") examples.push({ dutch: "Ik dien mijn aanvraag digitaal in.", meaningZh: "我在线提交我的申请。", meaningEn: "I submit my application digitally.", type: "scenario", phraseChunkUsed: "een aanvraag indienen", scenarioTags: ["digital", "form"] });
  }

  if (wordType === "function-word" && dutch === "waar") {
    examples.push({ dutch: "Waar is het station?", meaningZh: "车站在哪里？", meaningEn: "Where is the station?", type: "output", phraseChunkUsed: "waar is het station", scenarioTags: ["directions"] });
  }
  if (wordType === "function-word" && dutch === "wanneer") {
    examples.push({ dutch: "Wanneer kan ik langskomen?", meaningZh: "我什么时候可以过来？", meaningEn: "When can I come by?", type: "output", phraseChunkUsed: "wanneer kan ik langskomen", scenarioTags: ["appointment"] });
  }

  return examples;
};
