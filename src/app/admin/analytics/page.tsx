import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export default async function AnalyticsPage() {
  const paid = await prisma.order.findMany({ where: { status: "PAID" } });
  const byDay = new Map<string, number>();
  for (const o of paid) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + Number(o.total));
  }
  const rows = [...byDay.entries()].sort().slice(-14);
  return (
    <div>
      <h1 className="display mb-6 text-3xl">Analytics</h1>
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Revenue last days</h2>
        {rows.length === 0 ? <p className="text-zinc-500">No paid orders yet.</p> : rows.map(([d, v]) => (
          <div key={d} className="flex justify-between border-b border-white/10 py-2 text-sm">
            <span>{d}</span><span>{formatMoney(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
