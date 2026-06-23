import Link from "next/link";
import type { Product } from "@/types/inventory";

interface ProductSnapshotProps {
  products: Product[];
}

export function ProductSnapshot({ products }: ProductSnapshotProps) {
  const attentionItems = products
    .filter((product) => product.quantity <= product.reorderLevel)
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Inventory attention</h2>
          <p className="text-sm text-slate-500">
            Products at or below their reorder level.
          </p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-slate-950 hover:underline">
          Manage products
        </Link>
      </div>

      {attentionItems.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {attentionItems.map((product) => (
            <div key={product.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-slate-500">{product.sku}</p>
              </div>
              <p className="text-sm text-slate-500">
                {product.quantity} in stock
              </p>
              <p className="text-sm text-slate-500">
                Reorder at {product.reorderLevel}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-sm text-slate-500">
          No low-stock products right now.
        </p>
      )}
    </section>
  );
}
