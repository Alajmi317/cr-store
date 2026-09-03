import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { Dictionary } from "@/i18n/dictionaries";
import type { StoreSettings } from "@/lib/settings";

export function Footer({ dict, settings, locale }: { dict: Dictionary; settings: StoreSettings; locale: "ar" | "en" }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40">
      <div className="container-cr grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo size={56} withText name={settings.storeName} />
          <p className="text-sm text-zinc-400">{locale === "ar" ? settings.storeDescriptionAr : settings.storeDescription}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm uppercase tracking-widest text-zinc-400">Store</h3>
          <div className="flex flex-col gap-2 text-sm text-zinc-300">
            <Link href="/store">{dict.nav.store}</Link>
            <Link href="/categories">{dict.nav.categories}</Link>
            <Link href="/support">{dict.nav.support}</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm uppercase tracking-widest text-zinc-400">Legal</h3>
          <div className="flex flex-col gap-2 text-sm text-zinc-300">
            <Link href="/terms">{dict.footer.terms}</Link>
            <Link href="/privacy">{dict.footer.privacy}</Link>
            <Link href="/refund">{dict.footer.refund}</Link>
          </div>
        </div>
        <div className="text-sm text-zinc-400">
          <p>{settings.contactEmail}</p>
          {settings.socialDiscord ? <p className="mt-2">{settings.socialDiscord}</p> : null}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {year} {settings.storeName}. {dict.footer.rights}. {locale === "ar" ? settings.footerTextAr : settings.footerText}
      </div>
    </footer>
  );
}
