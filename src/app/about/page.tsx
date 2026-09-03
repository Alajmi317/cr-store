import { getSettings } from "@/lib/settings";
export default async function About() {
  const s = await getSettings();
  return (
    <div className="container-cr py-16 max-w-3xl">
      <h1 className="display text-4xl">About {s.storeName}</h1>
      <p className="mt-4 text-zinc-400">{s.storeDescription}</p>
      <p className="mt-4 text-zinc-400">{s.storeDescriptionAr}</p>
    </div>
  );
}
