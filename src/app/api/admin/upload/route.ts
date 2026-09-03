import { NextResponse } from "next/server";
import { getSessionUser, canAccessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED_DIGITAL = new Set(["application/zip", "application/x-zip-compressed", "application/octet-stream"]);
const ALLOWED_IMAGE = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  const productId = String(form.get("productId") || "");
  const kind = String(form.get("kind") || "digital");
  if (!(file instanceof File) || !productId) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  const max = Number(process.env.MAX_UPLOAD_MB || 80) * 1024 * 1024;
  if (file.size > max) return NextResponse.json({ error: "File too large" }, { status: 400 });
  const type = file.type || "application/octet-stream";
  if (kind === "image" && !ALLOWED_IMAGE.has(type)) return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  if (kind !== "image" && !ALLOWED_DIGITAL.has(type) && !file.name.endsWith(".zip") && !file.name.endsWith(".rar") && !file.name.endsWith(".7z")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product missing" }, { status: 404 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (kind === "image") {
    const publicDir = path.join(process.cwd(), "public", "uploads", "products");
    fs.mkdirSync(publicDir, { recursive: true });
    const name = `${productId}-${randomBytes(6).toString("hex")}${path.extname(file.name) || ".png"}`;
    fs.writeFileSync(path.join(publicDir, name), buf);
    const url = `/uploads/products/${name}`;
    await prisma.product.update({ where: { id: productId }, data: { images: { push: url } } });
    return NextResponse.json({ url });
  }

  const storageRoot = path.resolve(process.env.STORAGE_DIR || "./storage");
  const dir = path.join(storageRoot, "products", productId);
  fs.mkdirSync(dir, { recursive: true });
  const keyName = `${randomBytes(8).toString("hex")}${path.extname(file.name) || ".bin"}`;
  const abs = path.join(dir, keyName);
  fs.writeFileSync(abs, buf);
  const storageKey = path.relative(storageRoot, abs);
  await prisma.productFile.create({
    data: {
      productId,
      originalName: file.name,
      storageKey,
      mimeType: type,
      sizeBytes: file.size,
      maxDownloads: 5,
    },
  });
  return NextResponse.json({ ok: true, storageKey });
}
