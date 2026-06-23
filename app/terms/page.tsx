export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black tracking-[0.16em] text-pop">Terms</p>
      <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">使用条款</h1>
      <div className="mt-8 space-y-6 rounded-[30px] border border-blue-100 bg-white p-6 text-base font-bold leading-8 text-ocean/75 shadow-sm sm:p-8">
        <section>
          <h2 className="text-2xl font-black text-ink">服务内容</h2>
          <p className="mt-3">
            NedPop 是荷兰语学习辅助工具，提供 A0 到 B1 的课程、单词泡泡、发音解码、语法工具、场景输出和复习功能。
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">课程权益</h2>
          <p className="mt-3">
            A0 免费开放。A1、A2、B1 和全能通关包购买后绑定到当前登录账号。请在付款前确认你使用的是自己的账号。
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">学习结果</h2>
          <p className="mt-3">
            NedPop 帮助你更高效地理解、记忆和输出荷兰语，但不承诺任何考试通过结果。考试报名、评分和证书由对应官方机构负责。
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">合理使用</h2>
          <p className="mt-3">
            请不要批量抓取、复制或转售课程内容。账号权益仅供本人学习使用。
          </p>
        </section>
      </div>
    </main>
  );
}
