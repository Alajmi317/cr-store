import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";
export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-8 text-4xl">Orders</h1>
      {orders.length === 0 ? <p className="text-zinc-500">No orders yet.</p> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/account/orders/${o.number}`} className="glass flex justify-between rounded-2xl p-4">
              <span>{o.number}</span>
              <span>{o.status} · {formatMoney(Number(o.total), o.currency)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
