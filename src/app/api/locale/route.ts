import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { locale } = await req.json();
  const value = locale === "en" ? "en" : "ar";
  (await cookies()).set("cr_locale", value, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return NextResponse.json({ ok: true });
}
