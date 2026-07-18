# NedPop 记忆路径重写报告

生成日期：2026-07-03

## 修改文件

- `lib/memoryPathEngine.ts`
- `lib/memoryPathStrategies.ts`
- `lib/checkMemoryPathQuality.ts`
- `data/vocabularyPlan.ts`
- `data/smartWords.ts`
- `app/word-link/page.tsx`

## 修复范围

- 全量 `wordItems`：2426 个词全部重新通过记忆路径生成与质量检查。
- Daily packs：2240 个包内词全部重新通过记忆路径生成与质量检查。
- 检查结果：
  - 禁用模板文案：0
  - 空记忆路径：0
  - 超过 3 张卡片：0
  - 重复卡片：0
- 质量检查 issue：0

本次追加修复了展示优先级：当词条里保留的旧 `memoryPath` 还是空泛模板、错误策略或低质量兜底内容时，页面会优先使用新的生成结果。这样 `kalender` 这类词会显示英文桥梁，`planning` 会显示 `plan / plannen` 词形联想，`betalingsbewijs` 会显示真实拆词，而不是继续沿用旧的常用搭配模板。

## 删除和拦截的空泛模板

本次把以下用户可见的后台说明、方法论废话和空泛模板加入拦截，并从生成逻辑中移除：

- 先给这个词一个生活画面
- 先放进一个真实短句里记
- 动词要带动作画面记
- 要钉在 / 钉在
- 先看见 / 再想起荷兰语
- 固定开口方式
- 这个词适合放在真实生活里
- 帮助你固定这个词
- 联想词块
- 记忆路径生成逻辑
- 先背这个词，再跟句子读
- 先整块记、场景里记、放进短语和例句等同类模板

同时把旧的机械短语解释从 `A + B` 形式改成自然中文含义。全量扫描后，机械加号解释只保留在真实拆词卡里，例如 `ziekenhuis = ziek + huis`、`betalingsbewijs = betaling + bewijs`。

## 天然拆词钩子

对真实复合词、短语和可拆词条优先使用“拆开看 + 记忆钩子”，不再硬拆音节。

代表词：

- `ziekenhuis`：`ziek + huis`，生病的人去的房子，就是医院。
- `betalingsbewijs`：`betaling + bewijs`，付款留下的证明，就是付款证明。
- `dienstregeling`：`dienst + regeling`，服务/班次的安排，就是时刻表。
- `goedenavond`：`goede + avond`，好的晚上，就是晚上好。
- `zorgverzekering`：`zorg + verzekering`，照护相关的保险，就是健康保险。

## 英文桥梁

英文桥梁只保留在词形和意思确实接近的词上，并补上差异提醒，避免只写 `xxx ≈ English xxx`。

代表词：

- `goed`：像 `good`，意思也是“好”，但发音按荷兰语来。
- `dag`：像 `day`，但荷兰语里还能打招呼或说再见。
- `kalender`：像 `calendar`，但荷兰语用 `k` 开头。
- `controleren`：像 `control`，但日常更常是 `check / 检查`。
- `formulier`：借 `form` 认出“表格”，实际搭配要说 `formulier invullen`。
- `origineel`、`normaal`、`service` 等相近词补充了差异或使用提醒。

## 画面记忆

没有天然拆词或强英文桥梁时，改用具体场景画面，而不是泛泛说“放进生活场景”。

代表词：

- `afspraak`：日历上被圈出来的那个时间，就是 afspraak。
- `rekening`：收到一张账单，下一步就是 betalen。
- `dekking`：保险能“盖住”的范围，就是 dekking。
- `gezondheid`：体检表、药房、家庭医生都围着“健康”转。
- `kantoor`：早上坐到电脑前开始工作，那个地方就是 kantoor。
- `servicepunt`：遇到问题去柜台求助，那个柜台就是 servicepunt。

## 常用搭配

无强钩子的词不再硬编趣味联想，改成常用搭配和自然短句。

代表搭配：

- `een afspraak maken` = 预约
- `een rekening betalen` = 付账单
- `een formulier invullen` = 填表
- `dekking van de verzekering` = 保险覆盖范围
- `op kantoor werken` = 在办公室工作
- `naar het servicepunt gaan` = 去服务点
- `mijn naam schrijven` = 写我的名字
- `de zin lezen` = 读句子

## 动作 + 物体搭配

动词不再孤立解释，优先绑定最常见宾语或动作对象。

代表词：

- `snijden`：`brood snijden`、`groenten snijden`，句子 `Ik snijd brood.`
- `controleren`：`het adres controleren`、`de gegevens controleren`
- `betalen`：`met pin betalen`、`een rekening betalen`
- `schrijven`：`mijn naam schrijven`、`een e-mail schrijven`
- `lezen`：`de zin lezen`、`een brief lezen`
- `bellen`：`de huisarts bellen`
- `lopen`：`naar huis lopen`
- `wachten`：`tien minuten wachten`

## 对比记忆

近义词、反义词和功能词保留对比式记忆，不只列词。

代表词：

- `goed / prima / fijn / oké`
- `veel / weinig`
- `niet / geen`
- `mooi / leuk / goed`

## 没有强钩子的词

部分词没有自然拆词、英文桥梁或强画面。此类词不再强行写“趣味联想”，只保留搭配、使用提醒和自然例句。

代表类型：

- 一些功能词、连接词和频率词
- 一些月份、数字、国家/语言名称
- 一些单独记忆成本低、强行联想反而绕的高频词

处理方式：

- 保留自然短语或句子。
- 不强行凑满 3 张卡片。
- 不使用“趣味联想”作为默认标题。
- 低钩子兜底不再显示为“句子记忆”，统一显示为“记忆钩子”。

## 验证

已运行：

```bash
pnpm exec tsc --noEmit
```

已通过。

已运行全量记忆路径扫描：

- `wordItems`：2426 个词
- `wordDayPacks`：2240 个包内词

扫描项目：

- 禁用模板文案
- 空路径
- 重复卡片
- 超过 3 张卡片
- `checkMemoryPathQuality` issues

结果全部为 0。

## 2026-07-03 追加修正

针对抽查中出现的 `mens`、`vrouw`、`kind`、`kom` 这类基础词，继续收紧生成器：

- 基础人物词不再用“我看到某人”当记忆钩子，改成类别、冠词、复数或常见身份差异。
- `kalender` 优先走英文桥梁：`kalender ≈ calendar`，并提醒荷兰语用 `k` 开头。
- 只有 `snijden` 这类真实“动作 + 对象”的动词才显示“动作+物体”。
- `kom`、`kom uit` 这类来源/来去表达改成使用提醒或固定表达，不再误标为动作物体。
- 继续拦截把普通例句包装成“记忆画面”的低质量兜底。

追加抽样验证：

- `mens`：使用提醒 + `ieder mens`
- `vrouw`：`de vrouw` / `mijn vrouw` 差异提醒
- `kind`：英文桥梁 `kid / child` + `het kind` / `kinderen`
- `kom`：`komen` 的 `ik` 形式 + `uit China komen`
- `kom uit`：来源从地图上拉出来的固定表达
- `kalender`：英文桥梁
- `snijden`：动作 + 物体搭配

追加类型检查：

```bash
pnpm exec tsc --noEmit
```

已通过。
