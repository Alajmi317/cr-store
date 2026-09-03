import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function POST(req: Request) {
  const actor = await getSessionUser();
  if (!actor || (actor.role !== "ADMIN" && actor.role !== "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const action = String(form.get("action") || "");
  const role = String(form.get("role") || "") as Role;
  if (action === "role" && ["CUSTOMER", "SUPPORT", "ADMIN", "OWNER"].includes(role)) {
    if (role === "OWNER" && actor.role !== "OWNER") return NextResponse.redirect(new URL("/admin/users", req.url));
    await prisma.user.update({ where: { id }, data: { role } });
  }
  if (action === "toggle") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) await prisma.user.update({ where: { id }, data: { disabled: !user.disabled } });
  }
  return NextResponse.redirect(new URL("/admin/users", req.url));
}
