import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let ok = false;
  if (token) {
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), verifyToken: null } });
      ok = true;
    }
  }
  return (
    <div className="container-cr py-20 text-center">
      <h1 className="display text-4xl">{ok ? "Email verified" : "Invalid token"}</h1>
      <Link href="/login" className="btn-primary mt-6 inline-block rounded-full px-6 py-3">Login</Link>
    </div>
  );
}
