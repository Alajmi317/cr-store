"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export function ProductActions({ productId, dict }: { productId: string; dict: { addToCart: string; buyNow: string } }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  async function add(buyNow = false) {
    setBusy(true);
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) });
    setBusy(false);
    if (res.status === 401) { router.push("/login?next=/cart"); return; }
    if (!res.ok) { toast.push("Could not add to cart"); return; }
    toast.push("Added to cart");
    router.refresh();
    if (buyNow) router.push("/checkout");
  }
  return (
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} onClick={() => add(false)} className="btn-ghost rounded-full px-6 py-3">{dict.addToCart}</button>
      <button disabled={busy} onClick={() => add(true)} className="btn-primary rounded-full px-6 py-3">{dict.buyNow}</button>
    </div>
  );
}
