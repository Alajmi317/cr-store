import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dl = await prisma.download.findUnique({ where: { token } });
  if (!dl || !dl.enabled || dl.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (dl.expiresAt && dl.expiresAt < new Date()) return NextResponse.json({ error: "Expired" }, { status: 410 });
  if (dl.remaining <= 0) return NextResponse.json({ error: "Download limit reached" }, { status: 429 });
  if (!dl.fileId) return NextResponse.json({ error: "File not attached yet" }, { status: 404 });
  const file = await prisma.productFile.findUnique({ where: { id: dl.fileId } });
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 404 });
  const abs = path.resolve(process.env.STORAGE_DIR || "./storage", file.storageKey);
  const root = path.resolve(process.env.STORAGE_DIR || "./storage");
  if (!abs.startsWith(root)) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  if (!fs.existsSync(abs)) return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  await prisma.download.update({ where: { id: dl.id }, data: { remaining: { decrement: 1 }, lastDownload: new Date() } });
  const buf = fs.readFileSync(abs);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.originalName.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
