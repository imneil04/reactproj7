import { RecentMovements } from "@/components/dashboard/recent-movements";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StockMovementForm } from "@/components/stock-movements/stock-movement-form";
import { getProducts } from "@/lib/products";
import { getStockMovements } from "@/lib/stock-movements";

export default async function StockMovementsPage() {
  const { movements, error } = await getStockMovements(50);
  const { products, error: productsError } = await getProducts();

  return (
    <DashboardShell title="Stock movements" description="Review incoming, outgoing, and adjusted stock.">
      <StockMovementForm products={products} loadError={productsError} />
      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      <RecentMovements movements={movements} />
    </DashboardShell>
  );
}
