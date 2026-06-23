import { createClient } from "@/lib/supabase/server";
import type { Product, StockStatus } from "@/types/inventory";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorder_level: number;
  unit_price: number | string;
  categories: { name: string } | { name: string }[] | null;
  suppliers: { name: string } | { name: string }[] | null;
}

function getStockStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity === 0) return "Out of stock";
  if (quantity <= reorderLevel) return "Low stock";
  return "In stock";
}

function getJoinedName(value: { name: string } | { name: string }[] | null) {
  if (!value) return "";
  return Array.isArray(value) ? value[0]?.name ?? "" : value.name;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: getJoinedName(row.categories),
    supplier: getJoinedName(row.suppliers),
    quantity: row.quantity,
    reorderLevel: row.reorder_level,
    unitPrice: Number(row.unit_price),
    status: getStockStatus(row.quantity, row.reorder_level),
  };
}

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      sku,
      name,
      quantity,
      reorder_level,
      unit_price,
      categories ( name ),
      suppliers ( name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { products: [], error: error.message };
  }

  return {
    products: (data ?? []).map((row) => mapProduct(row as ProductRow)),
    error: null,
  };
}
