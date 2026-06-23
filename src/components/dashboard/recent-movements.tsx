import { formatDate } from "@/lib/formatters";
import type { StockMovement } from "@/types/inventory";

interface RecentMovementsProps {
  movements: StockMovement[];
}

const movementStyles = {
  "Stock in": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Stock out": "bg-red-50 text-red-900 ring-red-200",
  Adjustment: "bg-amber-50 text-amber-700 ring-amber-200",
} satisfies Record<StockMovement["type"], string>;

const quantityStyles = {
  "Stock in": "bg-emerald-600 text-white",
  "Stock out": "bg-red-900 text-white",
  Adjustment: "bg-slate-700 text-white",
} satisfies Record<StockMovement["type"], string>;

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold">Recent stock movements</h2></div>
      {movements.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {movements.map((movement) => (
            <div key={movement.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
              <div>
                <p className="font-medium">{movement.productName}</p>
                {movement.note && <p className="text-sm text-slate-500">{movement.note}</p>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`rounded-full px-3 py-1 font-medium ring-1 ${movementStyles[movement.type]}`}
                >
                  {movement.type}
                </span>
                <span className={`rounded-full px-2.5 py-1 font-semibold ${quantityStyles[movement.type]}`}>
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>
              </div>
              <time className="text-sm text-slate-500">{formatDate(movement.date)}</time>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-sm text-slate-500">
          No stock movements recorded yet.
        </p>
      )}
    </section>
  );
}
