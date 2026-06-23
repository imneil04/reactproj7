"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/products/actions";
import { formatCurrency } from "@/lib/formatters";
import type { Product, StockStatus } from "@/types/inventory";

const statusStyles: Record<StockStatus, string> = {
  "In stock": "bg-emerald-50 text-emerald-700",
  "Low stock": "bg-amber-50 text-amber-700",
  "Out of stock": "bg-rose-50 text-rose-700",
};

type ProductFormState = Omit<Product, "id" | "status">;

const emptyProduct: ProductFormState = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  quantity: 0,
  reorderLevel: 0,
  unitPrice: 0,
};

interface ProductTableProps {
  initialProducts: Product[];
  loadError: string | null;
}

export function ProductTable({ initialProducts, loadError }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProductFormState>(emptyProduct);
  const [formError, setFormError] = useState("");
  const [tableActionError, setTableActionError] = useState("");

  const headings = ["Product", "SKU", "Category", "Supplier", "Quantity", "Unit price", "Status", "Actions"];
  const visibleTableError = tableActionError || loadError;
  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return initialProducts;

    return initialProducts.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.sku.toLowerCase().includes(normalizedSearch),
    );
  }, [initialProducts, searchTerm]);

  function openAddForm() {
    setEditingId(null);
    setFormValues(emptyProduct);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setFormValues({
      name: product.name,
      sku: product.sku,
      category: product.category,
      supplier: product.supplier,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      unitPrice: product.unitPrice,
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function updateField<K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSku = formValues.sku.trim().toUpperCase();
    const duplicateSku = initialProducts.some(
      (product) => product.sku.toUpperCase() === normalizedSku && product.id !== editingId,
    );

    if (duplicateSku) {
      setFormError("SKU must be unique.");
      return;
    }

    const productInput = {
      ...formValues,
      name: formValues.name.trim(),
      sku: normalizedSku,
      category: formValues.category.trim(),
      supplier: formValues.supplier.trim(),
    };

    startTransition(async () => {
      const result = editingId
        ? await updateProductAction(editingId, productInput)
        : await createProductAction(productInput);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  function handleDelete(product: Product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setTableActionError("");

    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if (result.error) {
        setTableActionError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="product-search" className="mb-2 block text-sm font-medium text-slate-700">Search products</label>
            <input
              id="product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by product name or SKU"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button type="button" onClick={openAddForm} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Add product
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500" aria-live="polite">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </p>
      </div>

      {visibleTableError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {visibleTableError}
        </p>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{editingId ? "Edit product" : "Add product"}</h2>
              <p className="text-sm text-slate-500">Stock status is calculated automatically.</p>
            </div>
            <button type="button" onClick={closeForm} className="text-sm font-medium text-slate-500 hover:text-slate-950">Cancel</button>
          </div>

          {formError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProductInput label="Product name" value={formValues.name} onChange={(value) => updateField("name", value)} required />
            <ProductInput label="SKU" value={formValues.sku} onChange={(value) => updateField("sku", value)} required />
            <ProductInput label="Category" value={formValues.category} onChange={(value) => updateField("category", value)} required />
            <ProductInput label="Supplier" value={formValues.supplier} onChange={(value) => updateField("supplier", value)} required />
            <ProductInput label="Quantity" type="number" min="0" step="1" value={formValues.quantity} onChange={(value) => updateField("quantity", Number(value))} required />
            <ProductInput label="Reorder level" type="number" min="0" step="1" value={formValues.reorderLevel} onChange={(value) => updateField("reorderLevel", Number(value))} required />
            <ProductInput label="Unit price" type="number" min="0" step="0.01" value={formValues.unitPrice} onChange={(value) => updateField("unitPrice", Number(value))} required />
          </div>

          <button type="submit" disabled={isPending} className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
            {isPending ? "Saving..." : editingId ? "Save changes" : "Create product"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-5xl text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{headings.map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-950">{product.name}</td>
                <td className="px-5 py-4 text-slate-500">{product.sku}</td>
                <td className="px-5 py-4">{product.category}</td>
                <td className="px-5 py-4">{product.supplier}</td>
                <td className="px-5 py-4">{product.quantity}</td>
                <td className="px-5 py-4">{formatCurrency(product.unitPrice)}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status]}`}>{product.status}</span></td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button type="button" disabled={isPending} onClick={() => openEditForm(product)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Edit</button>
                    <button type="button" disabled={isPending} onClick={() => handleDelete(product)} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={headings.length} className="px-5 py-10 text-center text-slate-500">No products match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface ProductInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: string;
  step?: string;
  required?: boolean;
}

function ProductInput({ label, value, onChange, type = "text", ...inputProps }: ProductInputProps) {
  const id = `product-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        {...inputProps}
      />
    </div>
  );
}
