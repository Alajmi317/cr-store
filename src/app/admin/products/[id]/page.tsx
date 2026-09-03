import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  const categories = await prisma.category.findMany();
  return <ProductEditor categories={categories.map((c) => ({ id: c.id, name: c.nameEn }))} product={{
    id: product.id, name: product.name, slug: product.slug, shortDescription: product.shortDescription,
    description: product.description, price: Number(product.price), salePrice: product.salePrice != null ? Number(product.salePrice) : 0,
    categoryId: product.categoryId, version: product.version, compatibility: product.compatibility || "",
    requirements: product.requirements || "", features: product.features || "", changelog: product.changelog || "",
    license: product.license || "", status: product.status, featured: product.featured, bestSeller: product.bestSeller,
    tags: product.tags.join(","),
  }} />;
}
