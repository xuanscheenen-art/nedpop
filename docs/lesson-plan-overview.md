# NedPop Lesson Plan System

This document describes the lesson plan layer created from the improved A0-A1-A2 Dutch syllabus.

The plans do not contain full lesson content yet. They define the teaching route and target scope for future original NedPop lessons.

## Files

- `types/lessonPlan.ts`: TypeScript types for lesson plans.
- `data/lessonPlans.ts`: A0-A1-A2 lesson plan data.
- `docs/lesson-plan-overview.md`: This overview.

## Design Principle

Every lesson plan connects to the NedPop method:

- Decode: pronunciation or sound-chunk focus.
- Link: target Dutch words connected through memory hooks, bridges, or real-life meaning.
- Rule: the grammar pattern or fixed structure trained in the lesson.
- Speak: the final scenario or output task.

Pronunciation remains a Sound Base that supports beginner lessons. A0 is not only pronunciation; it teaches survival Dutch expressions for absolute beginners.

## Data Shape

Each `LessonPlan` includes:

- `id`
- `level`
- `order`
- bilingual `title`
- bilingual `learningGoal`
- `coreTheme`
- `targetVocabulary`
- `targetSentencePatterns`
- `targetGrammarPoints`
- `pronunciationFocus`
- `scenarioOutput`
- `speakingOutput`
- optional `writingOutput`
- `estimatedTimeMinutes`
- `prerequisites`
- `nextLessonId`
- `methodTargets`

## Counts

| Level | Lessons |
|---|---:|
| A0 | 12 |
| A1 | 18 |
| A2 | 20 |
| Total | 50 |

## A0 Lesson Route

| Order | ID | Title |
|---:|---|---|
| 1 | `a0-01` | 打招呼和礼貌表达 |
| 2 | `a0-02` | 我叫什么名字 |
| 3 | `a0-03` | 我来自哪里、住在哪里 |
| 4 | `a0-04` | 我会/不会说什么语言 |
| 5 | `a0-05` | 数字 0-100 |
| 6 | `a0-06` | 这是/那是什么 |
| 7 | `a0-07` | 我有/我没有 |
| 8 | `a0-08` | 我想要/我需要 |
| 9 | `a0-09` | 我听不懂，请重复 |
| 10 | `a0-10` | 基础时间表达 |
| 11 | `a0-11` | 基础发音整合：oe/ui/eu/ij/g |
| 12 | `a0-12` | A0 综合：第一次介绍自己 |

## A1 Lesson Route

| Order | ID | Title |
|---:|---|---|
| 1 | `a1-01` | 我的日常信息 |
| 2 | `a1-02` | 时间和日期 |
| 3 | `a1-03` | 家庭成员 |
| 4 | `a1-04` | 我的家和房间 |
| 5 | `a1-05` | 食物和饮料 |
| 6 | `a1-06` | 在超市买东西 |
| 7 | `a1-07` | 交通和车站 |
| 8 | `a1-08` | 天气和衣服 |
| 9 | `a1-09` | 学校和工作 |
| 10 | `a1-10` | 日常作息 |
| 11 | `a1-11` | 简单身体不舒服 |
| 12 | `a1-12` | 问路和地点 |
| 13 | `a1-13` | 喜好和选择 |
| 14 | `a1-14` | 简单约时间 |
| 15 | `a1-15` | 价格和付款 |
| 16 | `a1-16` | 简单电话表达 |
| 17 | `a1-17` | A1 场景综合 |
| 18 | `a1-18` | A1 复习测试 |

## A2 Lesson Route

| Order | ID | Title |
|---:|---|---|
| 1 | `a2-01` | 预约家庭医生 |
| 2 | `a2-02` | 描述身体不舒服 |
| 3 | `a2-03` | 去药房拿药 |
| 4 | `a2-04` | 去市政厅 |
| 5 | `a2-05` | 填写表格 |
| 6 | `a2-06` | 租房和住房问题 |
| 7 | `a2-07` | 请病假 |
| 8 | `a2-08` | 工作沟通 |
| 9 | `a2-09` | 火车延误 |
| 10 | `a2-10` | 账单和付款 |
| 11 | `a2-11` | 医疗保险 |
| 12 | `a2-12` | 读懂官方信件 |
| 13 | `a2-13` | 写简单邮件 |
| 14 | `a2-14` | 改约/取消预约 |
| 15 | `a2-15` | 投诉和求助 |
| 16 | `a2-16` | 电话沟通 |
| 17 | `a2-17` | 解释过去发生的事 |
| 18 | `a2-18` | A2 speaking practice |
| 19 | `a2-19` | A2 writing practice |
| 20 | `a2-20` | A2 综合模拟 |

## How This Should Be Used Later

The lesson plan layer should drive future lesson generation:

1. Select a `LessonPlan`.
2. Pull matching syllabus targets from `data/dutchSyllabus.ts`.
3. Generate original lesson content using the target vocabulary, patterns, grammar, pronunciation focus, and scenario output.
4. Keep Dutch example sentences and dialogues in Dutch.
5. Use Chinese/English only for explanations, UI labels, instructions, and learning support.

## Content Policy

These plans are original curriculum planning data. They are based on the NedPop method and the internal syllabus scope. They should not copy textbook chapters, commercial exercises, official exam questions, audio, or images.
