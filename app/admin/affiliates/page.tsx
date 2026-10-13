"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AffiliateCode = {
  id: string;
  code: string;
  affiliate_name: string;
  is_active: boolean;
  created_at: string;
};

type AffiliateOrder = {
  id: string;
  affiliate_code: string;
  affiliate_name: string;
  user_id: string;
  user_email: string | null;
  plan_id: string;
  stripe_checkout_session_id: string;
  purchase_amount_minor: number;
  purchase_currency: string;
  payment_status: string;
  commission_amount_minor: number;
  commission_currency: string;
  commission_status: string;
  refunded_amount_minor: number;
  created_at: string;
};

type Summary = { affiliate_name: string; referrals: number; commissionMinor: number; cancelledMinor: number };

const formatMoney = (minor: number, currency: string) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);

export default function AffiliateAdminPage() {
  const [codes, setCodes] = useState<AffiliateCode[]>([]);
  const [orders, setOrders] = useState<AffiliateOrder[]>([]);
  const [affiliateName, setAffiliateName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/affiliates", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "加载推广数据失败。");
      setCodes(payload.codes ?? []);
      setOrders(payload.orders ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "加载推广数据失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const summaries = useMemo(() => {
    const byAffiliate = new Map<string, Summary>();
    for (const order of orders) {
      const summary = byAffiliate.get(order.affiliate_name) ?? {
        affiliate_name: order.affiliate_name,
        referrals: 0,
        commissionMinor: 0,
        cancelledMinor: 0,
      };
      summary.referrals += 1;
      if (order.commission_status === "cancelled") summary.cancelledMinor += order.commission_amount_minor;
      else summary.commissionMinor += order.commission_amount_minor;
      byAffiliate.set(order.affiliate_name, summary);
    }
    return [...byAffiliate.values()].sort((a, b) => a.affiliate_name.localeCompare(b.affiliate_name));
  }, [orders]);

  const createCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, affiliateName }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "创建推广码失败。");
      setCode("");
      setAffiliateName("");
      setNotice("推广码已创建。");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "创建推广码失败。");
    } finally {
      setSaving(false);
    }
  };

  const toggleCode = async (item: AffiliateCode) => {
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: !item.is_active }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "更新推广码失败。");
      return;
    }
    setNotice(`推广码 ${item.code} 已${item.is_active ? "停用" : "启用"}。`);
    await refresh();
  };

  const editCode = async (item: AffiliateCode) => {
    const nextName = window.prompt("推广员名称", item.affiliate_name);
    if (nextName === null) return;
    const nextCode = window.prompt("推广码", item.code);
    if (nextCode === null) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, affiliateName: nextName, code: nextCode }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "更新推广码失败。");
      return;
    }
    setNotice("推广员资料已更新；已有订单保留原归属快照。");
    await refresh();
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-5 py-10 text-ink sm:px-8">
      <header>
        <p className="text-sm font-black tracking-[0.16em] text-pop">NEDPOP · ADMIN</p>
        <h1 className="mt-2 text-4xl font-black">推广员与佣金</h1>
        <p className="mt-3 max-w-3xl font-bold leading-7 text-ocean/70">
          仅记录有效推广码带来的首笔已付款订单。A1 佣金 €3，A2 / B1 / 全能包 €5；退款会取消佣金或标记待复核。
        </p>
      </header>

      {error ? <p role="alert" className="rounded-2xl bg-red-50 p-4 font-bold text-red-800">{error}</p> : null}
      {notice ? <p role="status" className="rounded-2xl bg-mint p-4 font-bold text-ocean">{notice}</p> : null}

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-black">推广码对应关系</h2>
        <form onSubmit={createCode} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-1 text-sm font-bold text-ocean">
            推广码
            <input value={code} onChange={(event) => setCode(event.target.value)} required maxLength={32} placeholder="例如 NEDPOP2026" className="rounded-xl border border-blue-100 px-3 py-2.5 text-base uppercase text-ink outline-none focus:border-ocean" />
          </label>
          <label className="grid gap-1 text-sm font-bold text-ocean">
            推广员
            <input value={affiliateName} onChange={(event) => setAffiliateName(event.target.value)} required maxLength={120} placeholder="姓名或团队名称" className="rounded-xl border border-blue-100 px-3 py-2.5 text-base text-ink outline-none focus:border-ocean" />
          </label>
          <button disabled={saving} className="self-end rounded-xl bg-ink px-5 py-3 font-black text-white disabled:opacity-50">{saving ? "保存中…" : "新增推广码"}</button>
        </form>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead><tr className="border-b border-blue-100 text-ocean/60"><th className="py-3 pr-4">推广码</th><th className="py-3 pr-4">推广员</th><th className="py-3 pr-4">状态</th><th className="py-3">操作</th></tr></thead>
            <tbody>{codes.map((item) => (
              <tr key={item.id} className="border-b border-blue-50">
                <td className="py-3 pr-4 font-black">{item.code}</td>
                <td className="py-3 pr-4">{item.affiliate_name}</td>
                <td className="py-3 pr-4">{item.is_active ? "启用" : "停用"}</td>
                <td className="space-x-2 py-3"><button type="button" onClick={() => void editCode(item)} className="rounded-full bg-skywash px-3 py-1.5 font-bold text-ocean">编辑</button><button type="button" onClick={() => void toggleCode(item)} className="rounded-full bg-skywash px-3 py-1.5 font-bold text-ocean">{item.is_active ? "停用" : "重新启用"}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-black">推广员汇总</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map((summary) => (
            <article key={summary.affiliate_name} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-blue-100">
              <h3 className="font-black">{summary.affiliate_name}</h3>
              <p className="mt-2 text-sm font-bold text-ocean/70">有效首购：{summary.referrals}</p>
              <p className="mt-1 text-xl font-black">佣金 €{(summary.commissionMinor / 100).toFixed(2)}</p>
              {summary.cancelledMinor ? <p className="mt-1 text-xs font-bold text-red-700">已取消 €{(summary.cancelledMinor / 100).toFixed(2)}</p> : null}
            </article>
          ))}
          {!summaries.length ? <p className="text-sm font-bold text-ocean/60">暂无推广订单。</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">推广订单</h2>
          <button type="button" onClick={() => void refresh()} className="rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">刷新</button>
        </div>
        {loading ? <p className="mt-4 font-bold text-ocean/60">加载中…</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead><tr className="border-b border-blue-100 text-ocean/60"><th className="py-3 pr-3">时间</th><th className="py-3 pr-3">推广员 / 码</th><th className="py-3 pr-3">用户</th><th className="py-3 pr-3">套餐</th><th className="py-3 pr-3">Session ID</th><th className="py-3 pr-3">支付</th><th className="py-3 pr-3">支付状态</th><th className="py-3 pr-3">佣金</th><th className="py-3">佣金状态</th></tr></thead>
            <tbody>{orders.map((order) => (
              <tr key={order.id} className="border-b border-blue-50 align-top">
                <td className="py-3 pr-3 whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</td>
                <td className="py-3 pr-3"><span className="font-black">{order.affiliate_name}</span><br /><span className="text-ocean/60">{order.affiliate_code}</span></td>
                <td className="py-3 pr-3"><span>{order.user_email ?? "—"}</span><br /><span className="text-xs text-ocean/50">{order.user_id}</span></td>
                <td className="py-3 pr-3">{order.plan_id}</td>
                <td className="py-3 pr-3 font-mono text-xs" title={order.stripe_checkout_session_id}>{order.stripe_checkout_session_id.slice(0, 24)}…</td>
                <td className="py-3 pr-3">{formatMoney(order.purchase_amount_minor, order.purchase_currency)}</td>
                <td className="py-3 pr-3">{order.payment_status}{order.refunded_amount_minor ? ` · 退款 ${formatMoney(order.refunded_amount_minor, order.purchase_currency)}` : ""}</td>
                <td className="py-3 pr-3">{formatMoney(order.commission_amount_minor, order.commission_currency)}</td>
                <td className="py-3">{order.commission_status}</td>
              </tr>
            ))}</tbody>
          </table>
          {!loading && !orders.length ? <p className="py-4 text-sm font-bold text-ocean/60">暂无推广订单。</p> : null}
        </div>
      </section>
    </main>
  );
}
