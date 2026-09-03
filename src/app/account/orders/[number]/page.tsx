import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { notFound } from "next/navigation";
export default async function OrderDetails({ params }: { params: Promise<{ number: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { number } = await params;
  const order = await prisma.order.findFirst({ where: { number, userId: user.id }, include: { items: true, payments: true } });
  if (!order) notFound();
  return (
    <div className="container-cr py-12">
      <h1 className="display text-4xl">{order.number}</h1>
      <p className="mt-2 text-zinc-400">{order.status} · {formatMoney(Number(order.total), order.currency)}</p>
      <ul className="glass mt-6 rounded-2xl p-6 space-y-2">
        {order.items.map((i) => <li key={i.id}>{i.name} × {i.quantity} — {formatMoney(Number(i.price))}</li>)}
      </ul>
    </div>
  );
}
