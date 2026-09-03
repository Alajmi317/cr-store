import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await getSessionUser();
  const { order: number } = await searchParams;
  const order = number && user ? await prisma.order.findFirst({ where: { number, userId: user.id }, include: { items: true } }) : null;
  return (
    <div className="container-cr py-16 text-center">
      <h1 className="display text-5xl">Payment Successful</h1>
      {!order ? <p className="mt-4 text-zinc-400">Order will appear after the payment webhook confirms the charge.</p> : (
        <div className="glass mx-auto mt-8 max-w-xl rounded-3xl p-8 text-start space-y-2">
          <p>Order: <b>{order.number}</b></p>
          <p>Status: {order.status}</p>
          <p>Total: {formatMoney(Number(order.total), order.currency)}</p>
          <p>Date: {order.paidAt?.toLocaleString() || order.createdAt.toLocaleString()}</p>
          <ul className="mt-4 list-disc ps-5">{order.items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
          <Link href="/account/downloads" className="btn-primary mt-6 inline-block rounded-full px-6 py-3">Download Products</Link>
        </div>
      )}
    </div>
  );
}
