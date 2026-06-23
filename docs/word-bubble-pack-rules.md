# NedPop Word Bubble Pack Rules

这是 NedPop 每日单词泡泡包的生成规则。目标是让学习页使用经过审计的词汇数据，而不是随机 A0/A1/A2 分组。

## 1. originalLevel 和 appearsInLevels

`originalLevel` 表示一个词第一次应该被正式学习的等级。

Examples:

- `hallo`: `originalLevel = A0`
- `fiets`: `originalLevel = A1`
- `huisarts`: `originalLevel = A2`

`appearsInLevels` 表示这个词可以在哪些等级里复习或复用。

Examples:

- `hallo`: `appearsInLevels = ["A0", "A1", "A2"]`
- `fiets`: `appearsInLevels = ["A1", "A2"]`
- `huisarts`: `appearsInLevels = ["A2"]`

所以 A2 词包里可以出现 `hallo` 或数字词，但它们不是 A2 新词，而是累计复习词。

## 2. learningRoleInPack

每个词进入某一天的词包时，会得到一个当天角色：

- `new`: 这个等级的新词。
- `review`: 低等级学过，现在在高等级复用。
- `recognition`: 先用于阅读/听力识别，暂不要求主动输出。

Example:

- `hallo` in A0 Day 1: `new`
- `hallo` in A2 Day 1: `review`
- `afspraakbevestiging` in A2: may be `recognition`

## 3. Learner Visibility

学习页只显示适合学习者直接学习的词。

Excluded from learner daily packs:

- `reviewStatus = too-hard`
- `reviewStatus = duplicate`
- `reviewStatus = not-useful`
- `reviewStatus = needs-review`
- `sourceTags = ["generated"]` and not approved
- `levelConfidence = low` and not approved

Creator pages may still show these words for review.

## 4. Daily Pack Size

A0:

- 8-10 new words per day
- 0-3 review words
- mostly active words
- excludes abstract/admin vocabulary

A1:

- 10-12 new words per day
- 3-5 A0 review words
- mostly active words
- practical daily themes

A2:

- 10-12 new A2 words per day
- 3-5 cumulative review words from A0/A1
- 2-4 recognition words when useful
- prioritizes high/medium exam relevance

## 5. A2 Theme Priority

A2 prioritizes practical task scenarios:

- health
- appointment
- gemeente
- housing
- work
- sick-leave
- transport
- bill
- insurance
- email
- form
- phone-call
- complaint

This supports practical A2-style speaking, writing, reading, and listening tasks without copying official exam questions.

## 6. Sorting Priority

Within each level and theme, words are sorted by:

1. active words first
2. high exam relevance
3. high level confidence
4. approved review status

The goal is thematic daily coherence, not alphabetic word lists.

## 7. Why Cumulative Review Exists

A2 does not mean every visible word is an A2 new word.

A2 means the learner is using A0 + A1 + A2 vocabulary together in practical situations. Basic words such as greetings, numbers, time, and simple verbs may reappear because real A2 tasks still require them.

In the learner UI, these words must be marked:

- `累计复习`
- `originalLevel: A0/A1`

They must not be shown as A2 new words.
