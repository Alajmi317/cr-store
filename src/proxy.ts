import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN = ["/admin"];
const ACCOUNT = ["/account", "/cart", "/checkout", "/tickets"];

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-not-for-production-change");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("cr_session")?.value;
  let role: string | null = null;
  let uid: string | null = null;

  if (token && process.env.AUTH_SECRET) {
    try {
      const { payload } = await jwtVerify(token, secret());
      role = String(payload.role || "");
      uid = String(payload.uid || "");
    } catch {
      role = null;
    }
  }

  const needsAuth = ACCOUNT.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN.some((p) => pathname.startsWith(p));

  if ((needsAuth || needsAdmin) && !uid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && role !== "ADMIN" && role !== "OWNER" && !(pathname.startsWith("/admin/tickets") && role === "SUPPORT")) {
    if (role === "SUPPORT" && pathname.startsWith("/admin/tickets")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/cart/:path*", "/checkout/:path*", "/tickets/:path*"],
};
