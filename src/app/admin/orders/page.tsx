import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: true } });
  return (
    <div>
      <h1 className="display mb-6 text-3xl">Orders</h1>
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="glass flex justify-between rounded-xl p-4 text-sm">
            <span>{o.number} · {o.user.email}</span>
            <span>{o.status} · {formatMoney(Number(o.total), o.currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
