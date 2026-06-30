"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualStockMovementAction } from "@/app/stock-movements/actions";
import type { Product } from "@/types/inventory";

type MovementType = "stock_in" | "stock_out" | "adjustment";

interface StockMovementFormProps {
  products: Product[];
  loadError: string | null;
}

export function StockMovementForm({ products, loadError }: StockMovementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<MovementType>("stock_in");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedProduct = products.find((product) => product.id === productId);
  const quantityLabel = type === "adjustment" ? "New quantity" : "Quantity";
  const isDisabled = isPending || products.length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!note.trim()) {
      setError("Please add a note before recording the stock movement.");
      return;
    }

    startTransition(async () => {
      const result = await createManualStockMovementAction({
        productId,
        type,
        quantity,
        note,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Stock movement recorded.");
      setNote("");
      setQuantity(type === "adjustment" ? 0 : 1);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Record stock movement</h2>
        <p className="text-sm text-slate-500">
          Add incoming stock, remove outgoing stock, or adjust a product count.
        </p>
      </div>

      {loadError && (
        <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load products: {loadError}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr_auto] lg:items-end">
        <div>
          <label htmlFor="movement-product" className="mb-2 block text-sm font-medium text-slate-700">
            Product
          </label>
          <select
            id="movement-product"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            disabled={isDisabled}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            required
          >
            {products.length === 0 ? (
              <option value="">No products available</option>
            ) : (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))
            )}
          </select>
          {selectedProduct && (
            <p className="mt-2 text-xs text-slate-500">Current quantity: {selectedProduct.quantity}</p>
          )}
        </div>

        <div>
          <label htmlFor="movement-type" className="mb-2 block text-sm font-medium text-slate-700">
            Movement type
          </label>
          <select
            id="movement-type"
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as MovementType;
              setType(nextType);
              setQuantity(nextType === "adjustment" ? selectedProduct?.quantity ?? 0 : 1);
            }}
            disabled={isDisabled}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="stock_in">Stock in</option>
            <option value="stock_out">Stock out</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div>
          <label htmlFor="movement-quantity" className="mb-2 block text-sm font-medium text-slate-700">
            {quantityLabel}
          </label>
          <input
            id="movement-quantity"
            type="number"
            min={type === "adjustment" ? "0" : "1"}
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={isDisabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            required
          />
        </div>

        <div>
          <label htmlFor="movement-note" className="mb-2 block text-sm font-medium text-slate-700">
            Note <span className="text-rose-600">*</span>
          </label>
          <input
            id="movement-note"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Reason or reference"
            disabled={isDisabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Saving..." : "Record"}
        </button>
      </div>
    </form>
  );
}
