"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { SessionUser } from "@/lib/auth";

export function Navbar({
  dict,
  locale,
  user,
  storeName,
  cartCount,
}: {
  dict: Dictionary;
  locale: Locale;
  user: SessionUser | null;
  storeName: string;
  cartCount: number;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  async function toggleLocale() {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: locale === "ar" ? "en" : "ar" }),
    });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container-cr flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0">
          <Logo size={42} withText name={storeName} />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
          <Link href="/store">{dict.nav.store}</Link>
          <Link href="/categories">{dict.nav.categories}</Link>
          <Link href="/support">{dict.nav.support}</Link>
          <Link href="/about">{dict.nav.about}</Link>
        </nav>
        <form onSubmit={search} className="hidden flex-1 md:block">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.nav.search} />
        </form>
        <div className="ms-auto flex items-center gap-2 text-sm">
          <button type="button" onClick={toggleLocale} className="btn-ghost rounded-full px-3 py-1.5">
            {locale === "ar" ? "EN" : "عربي"}
          </button>
          <Link href="/cart" className="btn-ghost rounded-full px-3 py-1.5">
            {dict.nav.cart} {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>
          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "OWNER" || user.role === "SUPPORT") && (
                <Link href="/admin" className="hidden md:inline">{dict.nav.admin}</Link>
              )}
              <Link href="/account" className="hidden md:inline">{dict.nav.account}</Link>
            </>
          ) : (
            <Link href="/login" className="btn-primary rounded-full px-4 py-1.5">{dict.nav.login}</Link>
          )}
          <button className="md:hidden btn-ghost rounded-lg px-3 py-1.5" onClick={() => setOpen((v) => !v)}>☰</button>
        </div>
      </div>
      {open && (
        <div className="container-cr space-y-3 pb-4 md:hidden">
          <form onSubmit={search}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.nav.search} /></form>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/store">{dict.nav.store}</Link>
            <Link href="/categories">{dict.nav.categories}</Link>
            <Link href="/support">{dict.nav.support}</Link>
            <Link href={user ? "/account" : "/login"}>{user ? dict.nav.account : dict.nav.login}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
