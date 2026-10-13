# Stripe Test Mode：推广码验收清单

本功能不得使用 Live API key 或 Live webhook secret 做测试。部署到任何共享环境前，先在隔离的 Supabase 测试项目运行 `docs/stripe-affiliate-referrals.sql`（该脚本依赖 `docs/supabase-user-entitlements.sql` 的基础表结构）。

## 测试环境

- `STRIPE_SECRET_KEY` 使用 `sk_test_...`。
- `STRIPE_WEBHOOK_SECRET` 使用该测试端点/Stripe CLI listener 对应的 `whsec_...`。
- Supabase URL、匿名 key、service-role key 均指向测试项目；不要把 Live 密钥复制到本地测试配置。
- 测试价格 ID 使用 Test Mode 中的价格；确认套餐金额不因推广码变化。
- 管理员测试账号仅在测试数据库设置 `users.is_admin = true`。

## 端到端场景

1. 管理员新增推广码并确认 Checkout 上可输入该码；不填写也能继续付款。
2. 使用有效推广码购买 A1：Stripe Checkout 总价与无推广码相同；Webhook 验签后，推广订单保存用户、套餐、推广码、Session ID、支付金额/币种和 paid 状态，佣金为 €3。
3. 分别以首次购买账号购买 A2、B1、全能包，佣金均为 €5。
4. 用已有付费记录的账号再次购买并填写推广码：课程按原逻辑开通，但不得新建推广佣金。
5. 重放同一 Stripe webhook event：订单与佣金不得重复。
6. 让未登记或已停用的推广码完成付款：原价付款和课程开通仍成功，但不应产生佣金记录。
7. 对全额退款订单发送 `charge.refunded`：付款状态变为 `refunded`、佣金状态变为 `cancelled`；部分退款状态为 `partially_refunded`、佣金为 `review`。
8. 单独测试 Stripe 优惠码：原有优惠码仍按 Stripe 配置生效；推广码不会创建折扣或覆盖优惠码。
9. 未登录无法创建 Checkout；非管理员访问 `/admin/affiliates` 对应 API 应返回 403；管理员可查看推广员汇总及订单明细。

## 上线顺序

先在测试 Supabase 执行迁移并完成以上验收，再将相同迁移应用到目标数据库，然后部署应用代码。不要只部署代码而跳过迁移：Webhook 会写 `user_purchases.affiliate_code`，缺少该列会导致支付事件重试。整个验收过程不修改 Stripe Live 配置。
