import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export default async function AdminHome() {
  const [orders, users, products, tickets, paid] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
    prisma.order.findMany({ where: { status: "PAID" }, select: { total: true, createdAt: true } }),
  ]);
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
  const start = new Date(); start.setHours(0,0,0,0);
  const today = paid.filter((o) => o.createdAt >= start).reduce((s, o) => s + Number(o.total), 0);
  const recent = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } });
  const top = await prisma.product.findMany({ orderBy: { salesCount: "desc" }, take: 5 });
  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Revenue", formatMoney(revenue)],
          ["Today", formatMoney(today)],
          ["Orders", String(orders)],
          ["Customers", String(users)],
          ["Products", String(products)],
          ["Open tickets", String(tickets)],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-zinc-500">{k}</div>
            <div className="mt-2 text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-semibold">Recent orders</h2>
          {recent.map((o) => (
            <div key={o.id} className="flex justify-between border-b border-white/10 py-2 text-sm">
              <span>{o.number}</span><span>{o.status} · {formatMoney(Number(o.total))}</span>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-semibold">Top products</h2>
          {top.map((p) => (
            <div key={p.id} className="flex justify-between border-b border-white/10 py-2 text-sm">
              <span>{p.name}</span><span>{p.salesCount} sales</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
