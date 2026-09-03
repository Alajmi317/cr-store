import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const CATEGORIES: [string, string, string][] = [
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

export async function bootstrapStore(opts: { email: string; password: string; name: string }) {
  const email = opts.email.toLowerCase().trim();
  const ownerCount = await prisma.user.count({ where: { role: "OWNER" } });
  if (ownerCount > 0) {
    throw new Error("ALREADY_SETUP");
  }

  await prisma.user.create({
    data: {
      email,
      name: opts.name.trim() || "Owner",
      passwordHash: await hashPassword(opts.password),
      role: "OWNER",
      emailVerified: new Date(),
    },
  });

  for (let i = 0; i < CATEGORIES.length; i++) {
    const [slug, nameEn, nameAr] = CATEGORIES[i];
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
}
