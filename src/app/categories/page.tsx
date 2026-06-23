import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCategories } from "@/lib/categories";

export default async function CategoriesPage() {
  const { categories, error } = await getCategories();

  return (
    <DashboardShell title="Categories" description="Organize products into useful groups.">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load categories: {error}
        </p>
      ) : categories.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No categories yet. Add a product to create the first category.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">{category.name}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {category.productCount} {category.productCount === 1 ? "product" : "products"}
              </p>
              {category.products.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {category.products.map((product) => (
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
