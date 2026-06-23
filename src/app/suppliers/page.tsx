import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSuppliers } from "@/lib/suppliers";

export default async function SuppliersPage() {
  const { suppliers, error } = await getSuppliers();

  return (
    <DashboardShell title="Suppliers" description="Keep track of your product sources.">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load suppliers: {error}
        </p>
      ) : suppliers.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No suppliers yet. Add a product to create the first supplier.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <article
              key={supplier.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">{supplier.name}</h2>
              <p className="mt-2 text-sm text-slate-500">
                Supplies {supplier.productCount}{" "}
                {supplier.productCount === 1 ? "product" : "products"}
              </p>
              {supplier.products.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {supplier.products.map((product) => (
                    <li key={product.id} className="rounded-xl bg-slate-50 px-3 py-2">
                      {product.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No products assigned yet.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
