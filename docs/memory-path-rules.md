# NedPop Memory Path Rules

Memory Path is the primary learner-facing route for remembering one Dutch word.
It is separate from memory bubbles, examples, and phrase-bank generation.

## Goal

Each word should get exactly one primary strategy:

- `word-breakdown`: a real compound or meaningful split.
- `english-bridge`: a safe English-looking bridge.
- `fixed-expression`: greetings, thanks, polite responses, yes/no/okay as ready-made expressions.
- `meaning-contrast`: safe dictionary synonym/contrast groups.
- `word-formation`: a real base-word or word-family formation.
- `phrase-based`: the word is best learned through a strong collocation.
- `sentence-based`: function words, verbs, and abstract words learned in sentences.
- `category-rule`: language names, countries, months, weekdays, numbers, colors, family categories.
- `no-strong-association`: last fallback only.

The path must help a Chinese-speaking learner:

1. remember the word,
2. understand why it looks like this,
3. know where to use it.

The output sentence remains required data for the blue sentence card.
Do not repeat common phrases or "One Sentence I Can Say" inside Memory Path.
Memory Path explains how to remember the word; the blue card handles speaking practice and audio.

## Strategy Order

1. Category rules for closed groups: languages, countries, numbers, dates, colors.
2. Real word breakdown: `ziekenhuis = ziek + huis`, `middernacht = midden + nacht`.
3. English bridge: `adres ≈ address`, `trein ≈ train`.
4. Meaning contrast: `prima ≈ goed / fijn / oké`.
5. Word formation: `helpen → hulp`, `betalen → betaling`.
6. Fixed expression function: `hallo`, `tot ziens`, `dank je`, `alsjeblieft`.
7. Function word role: `ik`, `u`, `niet`, `geen`.
8. Strong phrase: `afspraak maken`, `formulier invullen`.
9. Sentence role: `maar`, verbs, abstract words.
10. No strong association.

## Quality Gate

Reject or mark for review if:

- the path is generic filler,
- it says "put into a sentence" but has no useful sentence,
- it uses forced homophones,
- the breakdown is fake,
- the English bridge is fake or misleading,
- phrase-based paths have no useful phrase,
- sentence-based paths have no sentence,
- language names create wrong plurals such as `Engelsen` for `het Engels`,
- there is no output sentence,
- there is no concrete usage scenario,
- the Chinese explanation is too abstract,
- the strategy does not match the word type.

## Learner Labels

`word-breakdown`:

- 拆开看
- 意思怎么合起来
- 使用提醒

`english-bridge`:

- 英文桥梁
- 差异提醒
- 使用提醒

Use this before phrase-based paths when the Dutch form or a safe stem is close to
the English meaning. Examples: `eten ≈ eat`, `drinken ≈ drink`,
`werken ≈ work`, `maken ≈ make`, `helpen ≈ help`. Phrase chunks can still appear
in the blue sentence area, but they should not replace an obvious English memory
hook.

`fixed-expression`:

- 表达功能
- 记忆重点
- 使用提醒

`meaning-contrast`:

- 词义对比
- 差异提醒
- 使用提醒

`word-formation`:

- 基础词
- 词形怎么长出来
- 使用提醒

`phrase-based`:

- 记忆入口
- 为什么这样记
- 使用提醒

`sentence-based`:

- 句子功能
- 使用提醒

`category-rule`:

- 先看类别
- 类别规则
- 别混淆

`no-strong-association`:

- 不硬编联想
- 使用提醒

## Fallback Rule

`no-strong-association` is allowed only after every other strategy fails.
It must still include a concrete usage anchor and one output sentence in data.
The output sentence is displayed by the blue sentence card, not as a Memory Path step.
It must not say only "这个词建议通过短语和例句记。"
