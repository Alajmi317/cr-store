import { prisma } from "@/lib/prisma";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="display mb-6 text-3xl">Users</h1>
      <div className="space-y-2">
        {users.map((u) => (
          <form key={u.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm" action="/api/admin/users" method="post">
            <div>{u.name} · {u.email} · {u.role} {u.disabled ? "(disabled)" : ""}</div>
            <div className="flex gap-2">
              <input type="hidden" name="id" value={u.id} />
              <select name="role" defaultValue={u.role} className="w-auto">
                <option>CUSTOMER</option>
                <option>SUPPORT</option>
                <option>ADMIN</option>
                <option>OWNER</option>
              </select>
              <button className="btn-ghost rounded-lg px-3 py-1" name="action" value="role">Set role</button>
              <button className="btn-ghost rounded-lg px-3 py-1" name="action" value="toggle">{u.disabled ? "Enable" : "Disable"}</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
