import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/inventory";

interface InventoryValueChartProps {
  products: Product[];
}

export function InventoryValueChart({ products }: InventoryValueChartProps) {
  const categoryValues = Object.values(
    products.reduce<Record<string, { category: string; value: number }>>((totals, product) => {
      const category = product.category || "Uncategorized";
      const current = totals[category] ?? { category, value: 0 };

      return {
        ...totals,
        [category]: {
          category,
          value: current.value + product.quantity * product.unitPrice,
        },
      };
    }, {}),
  ).sort((first, second) => second.value - first.value);
  const maxValue = Math.max(...categoryValues.map((item) => item.value), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold">Inventory value by category</h2>
        <p className="text-sm text-slate-500">
          Total value is calculated from quantity multiplied by unit price.
        </p>
      </div>

      {categoryValues.length > 0 ? (
        <div className="space-y-4">
          {categoryValues.map((item) => {
            const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(item.value)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-950"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Add products to see inventory value by category.
        </p>
      )}
    </section>
  );
}
