import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Role, User } from "@prisma/client";

const SESSION_COOKIE = "cr_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  locale: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: User, meta?: { userAgent?: string; ip?: string }) {
  const days = Number(process.env.SESSION_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent: meta?.userAgent?.slice(0, 255),
      ip: meta?.ip?.slice(0, 64),
    },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    if (session.user.disabled) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      locale: session.user.locale,
    };
  } catch {
    return null;
  }
}

export function canAccessAdmin(role: Role) {
  return role === "ADMIN" || role === "OWNER";
}

export function canAccessSupport(role: Role) {
  return role === "SUPPORT" || role === "ADMIN" || role === "OWNER";
}

export function requireRole(user: SessionUser | null, roles: Role[]) {
  if (!user || !roles.includes(user.role)) {
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}
