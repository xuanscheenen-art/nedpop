# NedPop Example Diversity Rules

同一天的例句不能看起来像一个模板批量生成。Day Pack 里的例句应该像同一个小场景里的自然语言材料。

## Micro Scenario First

Each daily word pack can create a small scene.

Example: A2 GP appointment

1. 生病了
2. 打电话给 huisarts
3. 预约
4. 说明疼痛
5. 请求帮助

Good examples:

- `Ik ben ziek.`
- `Ik bel de huisarts.`
- `Ik wil graag een afspraak maken.`
- `Ik heb pijn in mijn buik.`
- `Kunt u mij helpen?`

## Repetition Checks

Flag these issues:

- `repetitive-template`: too many examples share the same opening.
- `too-many-ik-heb`: more than 25% start with `Ik heb`.
- `too-many-dit-is`: more than 20% start with `Dit is`.
- `missing-collocation`: too many examples do not use a phrase chunk.
- `scenario-mismatch`: scenario examples do not fit the day pack theme.

## Preferred Opening Mix

Mix openings when possible:

- `Ik ...`
- `Jij ...`
- `U ...`
- `Kunt u ...`
- `Waar ...`
- `Wanneer ...`
- `Wat ...`
- `Mijn ...`
- `De ...`
- `Het ...`
- `Vandaag ...`

## A2 Practical Questions

A2 packs should include practical questions when natural:

- `Kunt u mij helpen?`
- `Wanneer kan ik langskomen?`
- `Welke documenten heb ik nodig?`
- `Kan ik mijn afspraak verzetten?`
- `Kunt u dat herhalen?`

## No Forced Output

If a word is a number or does not naturally need a phrase chunk, do not force one. Use pronunciation, recognition, ordering, or grouping instead.

