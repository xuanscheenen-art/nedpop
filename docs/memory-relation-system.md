# NedPop Memory Relation Bubble System

这是 NedPop 的单词联想泡泡生成规则。目标不是把同一天的词硬连在一起，而是只保留真正能帮助记忆和使用的关系。

## Core Principle

联想泡泡必须回答一个问题：

这个词和当前词到底是什么关系？

如果说不清关系，就不应该显示给学习者。

## Relation Types

- `compound-part`: 复合词部件，比如 `ziekenhuis -> ziek / huis`
- `compound-parent`: 当前词出现在更大的复合词里，比如 `appel -> aardappel`
- `same-family`: 同一自然词族
- `root-family`: 同词根或派生关系，比如 `helpen -> hulp`
- `prefix-suffix-family`: 前缀/后缀线索
- `synonym`: 同义词
- `opposite`: 反义词
- `phrase-collocation`: 常用搭配，比如 `afspraak -> een afspraak maken`
- `verb-noun-pair`: 动词/名词配对，比如 `helpen -> hulp`
- `category-member`: 同类别，比如 `minuut / uur / dag`
- `scenario-neighbor`: 同场景词，比如 `huisarts / afspraak / ziek`
- `confusion-pair`: 易混词，需要解释区别
- `english-bridge`: 英文桥梁，比如 `trein ≈ train`
- `article-family`: de/het 线索
- `plural-family`: 复数规则相同

## What Must Not Happen

不要再显示这些低质量关系：

- 只因为同一天学就连在一起
- 只因为同等级就连在一起
- 解释是“适合一起记”“相关词”“请补充”
- 没有具体关系类型
- 没有中文和英文解释
- 把语言名错误复数化，比如 `Engels -> Engelsen`
- 把动词变位当作新单词硬连，比如 `kijken -> kijk`

## Generation Flow

1. 读取 effective words，也就是 base seed content + creator localStorage overrides。
2. 先读取人工审核过的 `memoryLinks`，但过滤掉弱占位解释。
3. 生成规则关系：
   - golden examples
   - compound parts
   - root families
   - collocations
   - synonyms/opposites
   - categories
   - scenario neighbors
   - confusion pairs
   - article/plural families
   - English bridge
4. 运行 quality check。
5. 只把 `showToLearner=true` 且 `needsHumanReview=false` 的关系显示给前台。

## Creator Workflow

Creator 可以在这些地方处理联想泡泡：

- `/creator/memory-relations`: 批量查看、筛选、导出、隐藏、审核关系。
- `/creator/words/[wordId]`: 编辑单词自己的记忆关联泡泡。
- `/creator/batch-complete`: 批量生成当前词包的联想泡泡。

人工已审核内容优先，但不覆盖 base data。上线前需要把 localStorage overrides 导出并固化到数据文件或后续数据库。

## Learner Display

前台 Word Link 页面只显示 learner-safe 关系：

- 按关系类型分组。
- 默认最多显示 6 个。
- 悬停或点击时显示解释。
- 关系标签必须清楚，比如“同词根”“反义词”“常用搭配”，不能只写“相关”。
