# Memory Relation Engine Rules

NedPop 的记忆关系引擎只负责生成“能解释清楚、能被例句支撑、能帮助学习者记忆”的关系。它不能把同一天、同等级、同场景里看起来相关的词硬塞进前台泡泡。

## Core Principle

每一条关系必须回答三个问题：

1. 这两个荷兰语词到底是什么语言关系？
2. 这个关系是不是来自可靠来源：人工种子、确定规则、词卡已有短语/例句，或人工审核？
3. 学习者看到它以后，能不能马上说出一个短语或句子？

如果回答不了，关系可以留在 Creator Studio 里做候选，但不能显示给学习者。

## Sources

- `seed`: 人工维护的公开词典/教程种子，比如反义词、词族、搭配、易混词、类别词。
- `rule`: 确定规则，比如词卡已有短语、已知复合词拆分、动词变位、冠词/复数规则。
- `derived-pattern`: 可解释的派生模式。当前只允许安全白名单，不能直接靠拼写相似。
- `manual`: 内容后台人工写入并审核过的关系。
- `candidate`: 待审核候选。默认隐藏，不进入学习页。

## Relation Types

- `word-family`: 词族/词根关系。只允许来自种子、安全派生、人工审核，不能靠字符串相似。
- `verb-noun-pair`: 动词和名词配对，比如 `helpen` / `hulp`。
- `compound-part`: 复合词拆分出的组成部分，比如 `ziekenhuis` / `huis`。
- `compound-parent`: 某词所属的复合词家族。默认更多用于 Creator，不优先推前台。
- `opposite`: 明确反义词。
- `comparative-superlative`: 原级、比较级、最高级。
- `category-member`: 清楚类别成员，比如月份、家庭成员、交通工具。
- `collocation`: 高频短语搭配，必须带短语或例句。
- `common-object`: 动作和常见对象，比如 `drinken` / `water`。
- `state-action`: 状态和动作，比如 `dorst` / `drinken`。
- `confusion-pair`: 易混词，理由必须说明区别。
- `english-bridge`: 词卡已有英文桥，只作为记忆提示。
- `verb-conjugation`: 动词变位提示。
- `article-pattern`: 冠词规则，只在语法/Creator 中显示。
- `plural-pattern`: 复数规则，只在语法/Creator 中显示。

## Learner Visibility

`word-link` 页面只显示：

- `showToLearner=true`
- `confidence` 为 `high` 或 `medium`
- `relationSource` 不是 `candidate`
- `needsHumanReview=false`
- 通过 `validateRelationCandidate`
- 类型属于学习页白名单

学习页隐藏：

- 低置信度关系
- 未审核候选
- 语法专用关系：`article-pattern`、`plural-pattern`
- 弱场景邻居或同天/同等级凑出来的关系
- 没有短语/例句支撑的搭配类关系
- 靠字符串相似猜出来的词族关系

## Validation Rules

`validateRelationCandidate` 会标记这些问题：

- 缺少中英文理由
- 词族/动词名词关系来自弱字符串相似
- 搭配、动作对象、状态动作缺少短语或例句
- 英文 `plural` 被误当作荷兰语关系
- 未审核 candidate
- 同天/同等级凑关系
- 低置信度却显示给学习者
- 语法关系误进学习页

有问题的候选默认 `needsHumanReview=true`，学习页不展示。

## Seed Maintenance

种子文件放在 `data/relationSeeds/`：

- `wordFamilySeeds.ts`
- `oppositeSeeds.ts`
- `comparativeSeeds.ts`
- `categorySeeds.ts`
- `collocationSeeds.ts`
- `confusionSeeds.ts`

补种子时优先参考公开荷兰语词典和 NT2 教程里的真实用法。搭配必须带中文/英文释义，最好带完整例句。易混词必须写清区别，不能只写“相关”。

## Creator Workflow

`/creator/relation-engine` 用来批量检查新引擎输出：

1. 生成全库关系。
2. 按词包、等级、类型、来源、置信度、审核状态筛选。
3. 对候选执行 `approve`、`hide`、`edit`、`reject`。
4. 对单词重新生成关系。
5. 导出 JSON，方便把审核结果沉淀回种子或词卡。

`/creator/words/[wordId]` 的系统候选会读取同一套学习页安全过滤后的关系，用来把可靠候选加入单词卡。
