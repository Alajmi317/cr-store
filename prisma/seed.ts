import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.OWNER_EMAIL || "owner@crstore.local").toLowerCase();
  const password = process.env.OWNER_PASSWORD || "ChangeThisOwnerPassword!";
  const name = process.env.OWNER_NAME || "CR Owner";

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: "OWNER", passwordHash, name },
    create: {
      email,
      name,
      passwordHash,
      role: "OWNER",
      emailVerified: new Date(),
    },
  });

  const cats = [
    ["scripts", "FiveM Scripts", "سكربتات FiveM"],
    ["files", "FiveM Files", "ملفات FiveM"],
    ["onesync", "OneSync", "OneSync"],
    ["cars", "FiveM Cars", "سيارات FiveM"],
    ["vehicles", "Vehicles", "مركبات"],
    ["maps", "FiveM Maps", "خرائط FiveM"],
    ["mlo", "MLO", "MLO"],
    ["eup", "EUP", "EUP"],
    ["ui", "UI", "واجهات"],
    ["bots", "Discord Bots", "بوتات ديسكورد"],
    ["packs", "Server Packs", "حزم السيرفر"],
    ["tebex", "Tebex / Store Files", "ملفات المتجر"],
  ];

  for (let i = 0; i < cats.length; i++) {
    const [slug, nameEn, nameAr] = cats[i];
    await prisma.category.upsert({
      where: { slug },
      update: { nameEn, nameAr, sortOrder: i },
      create: { slug, nameEn, nameAr, sortOrder: i },
    });
  }

  await prisma.setting.upsert({
    where: { key: "store" },
    update: {},
    create: {
      key: "store",
      value: {
        storeName: "CR Store",
        storeLogo: "/brand/logo.png",
        favicon: "/brand/logo.png",
      },
    },
  });

  console.log("Seed complete.");
  console.log("Owner login:", email);
}

main().finally(() => prisma.$disconnect());
