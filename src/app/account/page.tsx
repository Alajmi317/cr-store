import { getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/account/LogoutButton";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) return null;
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-2 text-4xl">Account</h1>
      <p className="mb-8 text-zinc-400">{user.name} · {user.email} · {user.role}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/account/orders", "Orders"],
          ["/account/downloads", "Downloads"],
          ["/tickets", "Support tickets"],
          ["/account/profile", "Profile"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="glass rounded-2xl p-6">{label}</Link>
        ))}
      </div>
      <div className="mt-8"><LogoutButton /></div>
    </div>
  );
}
