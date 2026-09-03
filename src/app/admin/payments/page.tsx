import { stripeConfigured } from "@/lib/payments/stripe";
import { paypalConfigured } from "@/lib/payments/paypal";

export default function PaymentsSettings() {
  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Payment settings</h1>
      <div className="glass rounded-2xl p-6 space-y-2 text-sm">
        <p>Stripe: {stripeConfigured() ? "keys detected" : "not configured"}</p>
        <p>PayPal: {paypalConfigured() ? "keys detected" : "not configured"}</p>
        <p className="text-zinc-400">Put keys in environment variables only. Never in the browser bundle except the Stripe publishable key.</p>
        <ul className="list-disc ps-5 text-zinc-400">
          <li>STRIPE_SECRET_KEY</li>
          <li>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
          <li>STRIPE_WEBHOOK_SECRET</li>
          <li>PAYPAL_CLIENT_ID</li>
          <li>PAYPAL_CLIENT_SECRET</li>
          <li>PAYPAL_MODE=sandbox|live</li>
        </ul>
      </div>
    </div>
  );
}
