# NedPop Content Repair Workflow

这是 NedPop 的 creator-facing 内容修复流水线。它的目标不是删除词，也不是把低质量内容过滤掉，而是把质量问题转成可审核、可编辑、可接受的修复建议。

## Flow

1. `lib/contentQuality.ts` 扫描 effective creator words，生成 quality issues。
2. `/creator/quality-queue` 展示问题：坏例句、缺翻译、弱记忆路径、短语块问题、动词形式问题等。
3. `lib/contentRepairSuggestions.ts` 把每个 issue 转成一个 `RepairSuggestion`。
4. `/creator/repair-suggestions` 展示建议。
5. Creator 可以 `Accept / Edit / Reject / Regenerate`。
6. Accept 后写入 `nedpop.creator.wordOverrides`。
7. Learner-facing Word Link 通过 effective content layer 读取：
   `base seed content + creator overrides = effective content`。

## RepairSuggestion

每条建议包含：

- `wordId`: 要修的词
- `issueId`: 来自 quality queue 的问题
- `targetField`: 要修的字段
- `before`: 当前坏内容
- `suggestedPatch`: 建议 patch
- `confidence`: high / medium / low
- `reasonZh`: 为什么这样修
- `needsHumanReview`: 是否必须人工看一眼

建议不会自动覆盖原内容。只有 creator 点击 Accept 才会写入 localStorage override。

## Repair Rules

### Missing Example

生成符合等级的例句：

- A0: 极短句，避免行政/抽象表达。
- A1: 日常生活句，主要用现在时和基础句型。
- A2: 医生、市政厅、住房、工作、交通、邮件、表格等办事情境句。

坏例句会被替换为可用例句；已有可用例句会保留。

### Bad Memory Path

根据 word type 重新生成 memory path：

- `compound-word`: `ziekenhuis = ziek + huis`
- `english-bridge`: `trein ≈ train`
- `phrase-based`: `een afspraak maken`
- `sentence-based`: `maar`、`geen`、动词等放进句子
- `category-rule`: 语言、国家、数字、日期等类别词
- `no-strong-association`: 不硬编联想

语言名禁止生成误导路径，例如：

`Engels -> Engelsen`

`Engels` 应该走 category-rule：

- `het Engels`
- `Engels spreken`
- `Engels leren`
- `Ik spreek Engels.`

### Missing Phrase Chunk

根据词性生成真实搭配：

- noun: article + noun 或常用动词搭配
- verb: 变位后的可用短句
- language-name: `spreken / leren`
- function-word: sentence chunk

短语块不能只是单词本身。

### Missing Article Reason

有线索就解释线索：

- `-je` 小词通常用 `het`
- `-ing` 多半用 `de`
- 复合词看最后一个核心词

没有明显线索时写：

“没有明显规则，建议和冠词一起记。”

### Generic Filler

如果内容类似：

- “这个词最好通过常用搭配记”
- “放进一个真实短句”
- “This sentence needs a manual meaning”

就应该替换为具体短语、具体例句和具体解释。

## LocalStorage Keys

- `nedpop.creator.wordOverrides`
- `nedpop.creator.dayPackOverrides`
- `nedpop.creator.lastUpdated`

修复建议 Accept 后写入 `wordOverrides`。前台刷新后通过 effective content layer 自动显示修复结果。

## Policy

- 不删除词。
- 不跳过词。
- 不直接覆盖 approved 内容。
- 不把 generated low-confidence 内容直接放进 learner UI。
- Repair queue 是内容生产线，不是学习端 UI。
