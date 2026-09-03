"use client";
import { useRouter } from "next/navigation";
export function CartControls({ productId, quantity }: { productId: string; quantity: number }) {
  const router = useRouter();
  async function setQty(q: number) {
    if (q <= 0) await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    else await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: q }) });
    router.refresh();
  }
  return (
    <div className="flex items-center gap-2">
      <button className="btn-ghost rounded-lg px-3 py-1" onClick={() => setQty(quantity - 1)}>-</button>
      <span>{quantity}</span>
      <button className="btn-ghost rounded-lg px-3 py-1" onClick={() => setQty(quantity + 1)}>+</button>
    </div>
  );
}
