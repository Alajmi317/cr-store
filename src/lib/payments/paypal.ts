const LIVE = "https://api-m.paypal.com";
const SANDBOX = "https://api-m.sandbox.paypal.com";

export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function base() {
  return process.env.PAYPAL_MODE === "live" ? LIVE : SANDBOX;
}

export async function paypalToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal keys missing");
  const res = await fetch(`${base()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal auth failed");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(opts: { total: string; currency: string; reference: string; returnUrl: string; cancelUrl: string }) {
  const token = await paypalToken();
  const res = await fetch(`${base()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opts.reference,
          amount: { currency_code: opts.currency, value: opts.total },
        },
      ],
      application_context: {
        brand_name: "CR Store",
        user_action: "PAY_NOW",
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ id: string; links: { rel: string; href: string }[] }>;
}

export async function capturePaypalOrder(id: string) {
  const token = await paypalToken();
  const res = await fetch(`${base()}/v2/checkout/orders/${id}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ id: string; status: string }>;
}
