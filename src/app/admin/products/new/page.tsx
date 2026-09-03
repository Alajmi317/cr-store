import { prisma } from "@/lib/prisma";
import { ProductEditor } from "@/components/admin/ProductEditor";
export default async function NewProduct() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return <ProductEditor categories={categories.map((c) => ({ id: c.id, name: c.nameEn }))} />;
}
