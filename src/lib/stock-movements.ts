import { createClient } from "@/lib/supabase/server";
import type { StockMovement } from "@/types/inventory";

type StockMovementType = "stock_in" | "stock_out" | "adjustment";

interface StockMovementRow {
  id: string;
  type: StockMovementType;
  quantity: number;
  note: string | null;
  created_at: string;
  products: { name: string } | { name: string }[] | null;
}

function getJoinedProductName(value: { name: string } | { name: string }[] | null) {
  if (!value) return "Deleted product";
  return Array.isArray(value) ? value[0]?.name ?? "Deleted product" : value.name;
}

function getDisplayType(type: StockMovementType): StockMovement["type"] {
  if (type === "stock_in") return "Stock in";
  if (type === "stock_out") return "Stock out";
  return "Adjustment";
}

function getDisplayQuantity(type: StockMovementType, quantity: number) {
  if (type === "stock_out") return -Math.abs(quantity);
  return quantity;
}

function mapStockMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    productName: getJoinedProductName(row.products),
    type: getDisplayType(row.type),
    quantity: getDisplayQuantity(row.type, row.quantity),
    date: row.created_at,
    note: row.note,
  };
}

export async function getStockMovements(limit = 10) {
  const supabase = await createClient();
  const query = supabase
    .from("stock_movements")
    .select(`
      id,
      type,
      quantity,
      note,
      created_at,
      products ( name )
    `)
    .order("created_at", { ascending: false });

  const { data, error } = await query.limit(limit);

  if (error) {
    return { movements: [], error: error.message };
  }

  return {
    movements: (data ?? []).map((row) => mapStockMovement(row as StockMovementRow)),
    error: null,
  };
}
