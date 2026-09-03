import type { Metadata } from "next";
import { Outfit, Rajdhani, Cairo } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { WelcomeSplash } from "@/components/layout/WelcomeSplash";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: { default: s.storeName, template: `%s | ${s.storeName}` },
    description: s.storeDescription,
    icons: { icon: s.favicon || "/brand/logo.png" },
    openGraph: {
      title: s.storeName,
      description: s.storeDescription,
      images: [s.storeLogo || "/brand/logo.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: s.storeName,
      description: s.storeDescription,
      images: [s.storeLogo || "/brand/logo.png"],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = ((jar.get("cr_locale")?.value as Locale) || "ar") === "en" ? "en" : "ar";
  const dict = dictionaries[locale];
  const settings = await getSettings();
  const user = await getSessionUser();
  let cartCount = 0;
  if (user) {
    try {
      cartCount = await prisma.cartItem.count({ where: { userId: user.id } });
    } catch {
      cartCount = 0;
    }
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${outfit.variable} ${rajdhani.variable} ${cairo.variable}`}>
      <body className="antialiased">
        <ToastProvider>
          {settings.announcementEnabled && (
            <div className="border-b border-white/10 bg-white/5 py-2 text-center text-xs tracking-wide text-zinc-300">
              {locale === "ar" ? settings.announcementAr : settings.announcement}
            </div>
          )}
          <Navbar dict={dict} locale={locale} user={user} storeName={settings.storeName} cartCount={cartCount} />
          <main className="min-h-[70vh]">{children}</main>
          <Footer dict={dict} settings={settings} locale={locale} />
        </ToastProvider>
      </body>
    </html>
  );
}
