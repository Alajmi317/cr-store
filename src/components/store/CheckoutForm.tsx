"use client";
import { useState } from "react";
export function CheckoutForm({ stripeOn, paypalOn }: { stripeOn: boolean; paypalOn: boolean }) {
  const [coupon, setCoupon] = useState("");
  const [err, setErr] = useState("");
  async function pay(path: string) {
    setErr("");
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coupon }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Payment provider not ready"); return; }
    if (data.url) window.location.href = data.url;
  }
  return (
    <div className="glass rounded-3xl p-8 space-y-4">
      <h2 className="display text-2xl">Payment</h2>
      <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button disabled={!stripeOn} onClick={() => pay("/api/checkout/stripe")} className="btn-primary w-full rounded-full py-3">
        Pay with Card / Apple Pay (Stripe)
      </button>
      {!stripeOn && <p className="text-xs text-zinc-500">Stripe keys are not set. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>}
      <button disabled={!paypalOn} onClick={() => pay("/api/checkout/paypal")} className="btn-ghost w-full rounded-full py-3">Pay with PayPal</button>
      {!paypalOn && <p className="text-xs text-zinc-500">PayPal keys are not set. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.</p>}
    </div>
  );
}
