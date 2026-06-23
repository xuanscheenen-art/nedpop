export default function RefundPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black tracking-[0.16em] text-pop">Refunds</p>
      <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">退款说明</h1>
      <div className="mt-8 space-y-6 rounded-[30px] border border-blue-100 bg-white p-6 text-base font-bold leading-8 text-ocean/75 shadow-sm sm:p-8">
        <section>
          <h2 className="text-2xl font-black text-ink">适用范围</h2>
          <p className="mt-3">
            NedPop 的 A1、A2、B1 和全能通关包是数字学习内容。付款成功后课程会绑定到你的登录账号。
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">申请方式</h2>
          <p className="mt-3">
            如果你买错套餐、重复付款，或付款后没有正确解锁，请通过页脚邮箱联系 NedPop，并附上登录邮箱、购买套餐和付款时间。
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">处理原则</h2>
          <p className="mt-3">
            我们会优先修复未解锁或重复扣款问题。符合退款条件的订单会通过原支付方式退回。你的法定消费者权利不受本说明影响。
          </p>
        </section>
      </div>
    </main>
  );
}
