import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function DownloadsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const downloads = await prisma.download.findMany({ where: { userId: user.id }, include: { product: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-8 text-4xl">Downloads</h1>
      {downloads.length === 0 ? <p className="text-zinc-500">No downloads yet. They appear after a confirmed payment.</p> : (
        <div className="space-y-3">
          {downloads.map((d) => (
            <div key={d.id} className="glass flex items-center justify-between rounded-2xl p-4">
              <div>
                <div className="font-semibold">{d.product.name}</div>
                <div className="text-xs text-zinc-500">Remaining: {d.remaining} · {d.enabled ? "Active" : "Disabled"}</div>
              </div>
              {d.enabled && d.remaining > 0 ? (
                <a className="btn-primary rounded-full px-4 py-2" href={`/api/downloads/${d.token}`}>Download</a>
              ) : <span className="text-zinc-500 text-sm">Unavailable</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
