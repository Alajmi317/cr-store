"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Cat = { id: string; name: string };
type Product = {
  id?: string; name: string; slug: string; shortDescription: string; description: string;
  price: number; salePrice: number; categoryId: string; version: string; compatibility: string;
  requirements: string; features: string; changelog: string; license: string; status: string;
  featured: boolean; bestSeller: boolean; tags: string;
};

export function ProductEditor({ categories, product }: { categories: Cat[]; product?: Partial<Product> }) {
  const [form, setForm] = useState<Product>({
    name: "", slug: "", shortDescription: "", description: "", price: 0, salePrice: 0,
    categoryId: categories[0]?.id || "", version: "1.0.0", compatibility: "FiveM / OneSync",
    requirements: "", features: "", changelog: "", license: "Personal server use", status: "DRAFT",
    featured: false, bestSeller: false, tags: "", ...product,
  });
  const [msg, setMsg] = useState("");
  const router = useRouter();
  function patch<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "Error"); return; }
      router.push("/admin/products");
      router.refresh();
    }}>
      <h1 className="display text-3xl">{form.id ? "Edit product" : "New product"}</h1>
      <input placeholder="Name" value={form.name} onChange={(e) => patch("name", e.target.value)} required />
      <input placeholder="Slug" value={form.slug} onChange={(e) => patch("slug", e.target.value)} />
      <input placeholder="Short description" value={form.shortDescription} onChange={(e) => patch("shortDescription", e.target.value)} />
      <textarea rows={5} placeholder="Description" value={form.description} onChange={(e) => patch("description", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" step="0.01" value={form.price} onChange={(e) => patch("price", Number(e.target.value))} />
        <input type="number" step="0.01" value={form.salePrice} onChange={(e) => patch("salePrice", Number(e.target.value))} />
      </div>
      <select value={form.categoryId} onChange={(e) => patch("categoryId", e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input placeholder="Version" value={form.version} onChange={(e) => patch("version", e.target.value)} />
      <input placeholder="Compatibility" value={form.compatibility} onChange={(e) => patch("compatibility", e.target.value)} />
      <textarea placeholder="Requirements" value={form.requirements} onChange={(e) => patch("requirements", e.target.value)} />
      <textarea placeholder="Features" value={form.features} onChange={(e) => patch("features", e.target.value)} />
      <textarea placeholder="Changelog" value={form.changelog} onChange={(e) => patch("changelog", e.target.value)} />
      <input placeholder="License" value={form.license} onChange={(e) => patch("license", e.target.value)} />
      <input placeholder="Tags" value={form.tags} onChange={(e) => patch("tags", e.target.value)} />
      <select value={form.status} onChange={(e) => patch("status", e.target.value)}>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="HIDDEN">Hidden</option>
      </select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => patch("featured", e.target.checked)} /> Featured</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bestSeller} onChange={(e) => patch("bestSeller", e.target.checked)} /> Best seller</label>
      {form.id && (
        <div className="glass rounded-2xl p-4">
          <p className="mb-2 text-sm text-zinc-400">Upload image or digital file. Files are stored outside public/.</p>
          <input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !form.id) return;
            const fd = new FormData();
            fd.append("file", file);
            fd.append("productId", form.id);
            fd.append("kind", file.type.startsWith("image/") ? "image" : "digital");
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            setMsg(res.ok ? "Uploaded" : "Upload failed");
          }} />
        </div>
      )}
      <button className="btn-primary rounded-full px-6 py-3">Save</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
