import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProductSnapshot } from "@/components/dashboard/product-snapshot";
import { formatCurrency } from "@/lib/formatters";
import { getProducts } from "@/lib/products";
import { getStockMovements } from "@/lib/stock-movements";

export default async function Home() {
  const [
    { products, error: productsError },
    { movements, error: movementsError },
  ] = await Promise.all([getProducts(), getStockMovements(5)]);
  const inventorySummary = {
    products: products.length.toString(),
    unitsInStock: products
      .reduce((total, product) => total + product.quantity, 0)
      .toString(),
    lowStock: products
      .filter((product) => product.quantity <= product.reorderLevel)
      .length.toString(),
    inventoryValue: formatCurrency(
      products.reduce(
        (total, product) => total + product.quantity * product.unitPrice,
        0,
      ),
    ),
  };

  return (
    <DashboardShell title="Dashboard" description="A quick look at your inventory health.">
      {(productsError || movementsError) && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {productsError ?? movementsError}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={inventorySummary.products} />
        <StatCard label="Units in stock" value={inventorySummary.unitsInStock} />
        <StatCard label="Low stock items" value={inventorySummary.lowStock} tone="warning" />
        <StatCard label="Inventory value" value={inventorySummary.inventoryValue} />
      </section>
      <RecentMovements movements={movements} />
      <ProductSnapshot products={products} />
    </DashboardShell>
  );
}
