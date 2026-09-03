import { prisma } from "./prisma";

export type StoreSettings = {
  storeName: string;
  storeLogo: string;
  favicon: string;
  storeDescription: string;
  storeDescriptionAr: string;
  heroTitle: string;
  heroTitleAr: string;
  heroDescription: string;
  heroDescriptionAr: string;
  heroImage: string;
  announcement: string;
  announcementAr: string;
  announcementEnabled: boolean;
  footerText: string;
  footerTextAr: string;
  contactEmail: string;
  contactDiscord: string;
  socialTwitter: string;
  socialYoutube: string;
  socialDiscord: string;
  taxEnabled: boolean;
  taxRate: number;
};

export const defaultSettings: StoreSettings = {
  storeName: "CR Store",
  storeLogo: "/brand/logo.png",
  favicon: "/brand/logo.png",
  storeDescription: "Premium FiveM files, scripts, vehicles, maps, MLO, EUP and server packs.",
  storeDescriptionAr: "متجر متخصص في ملفات FiveM والسكربتات والسيارات والخرائط وMLO وEUP وحزم السيرفرات.",
  heroTitle: "Premium FiveM Assets",
  heroTitleAr: "منتجات FiveM احترافية",
  heroDescription: "Scripts, vehicles, maps, MLO, EUP, UI, bots and ready server packs — built for serious servers.",
  heroDescriptionAr: "سكربتات، سيارات، خرائط، MLO، EUP، واجهات، بوتات وحزم سيرفر جاهزة لسيرفرات محترفة.",
  heroImage: "/brand/logo.png",
  announcement: "New drops every week — exclusive FiveM files for serious servers.",
  announcementAr: "إصدارات جديدة كل أسبوع — ملفات FiveM حصرية للسيرفرات المحترفة.",
  announcementEnabled: true,
  footerText: "CR Store — Digital FiveM marketplace.",
  footerTextAr: "CR Store — متجر رقمي متخصص في FiveM.",
  contactEmail: "support@crstore.local",
  contactDiscord: "",
  socialTwitter: "",
  socialYoutube: "",
  socialDiscord: "",
  taxEnabled: false,
  taxRate: 0,
};

export async function getSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "store" } });
    if (!row) return defaultSettings;
    return { ...defaultSettings, ...(row.value as Partial<StoreSettings>) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(patch: Partial<StoreSettings>) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await prisma.setting.upsert({
    where: { key: "store" },
    update: { value: next },
    create: { key: "store", value: next },
  });
  return next;
}
