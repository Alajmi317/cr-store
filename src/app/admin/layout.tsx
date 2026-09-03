import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const all = [
  ["/admin", "Overview"],
  ["/admin/products", "Products"],
  ["/admin/orders", "Orders"],
  ["/admin/users", "Users"],
  ["/admin/tickets", "Tickets"],
  ["/admin/analytics", "Analytics"],
  ["/admin/settings", "Settings"],
  ["/admin/payments", "Payments"],
  ["/admin/customize", "Customization"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["ADMIN", "OWNER", "SUPPORT"].includes(user.role)) redirect("/");
  const links = user.role === "SUPPORT" ? all.filter((l) => l[0] === "/admin" || l[0].includes("ticket")) : all;
  return (
    <div className="container-cr grid gap-8 py-8 md:grid-cols-[220px_1fr]">
      <aside className="glass h-fit space-y-1 rounded-2xl p-3">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5">{label}</Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
