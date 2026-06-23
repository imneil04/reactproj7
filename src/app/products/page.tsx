import { ProductTable } from "@/components/inventory/product-table";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const { products, error } = await getProducts();

  return (
    <DashboardShell title="Products" description="Browse and monitor all inventory items.">
      <ProductTable initialProducts={products} loadError={error} />
    </DashboardShell>
  );
}
