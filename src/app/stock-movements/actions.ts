"use server";

import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/lib/audit-logs";
import { createClient } from "@/lib/supabase/server";

type ManualStockMovementType = "stock_in" | "stock_out" | "adjustment";

interface ManualStockMovementInput {
  productId: string;
  type: ManualStockMovementType;
  quantity: number;
  note?: string;
}

interface ActionResult {
  error?: string;
}

function revalidateInventoryRoutes() {
  revalidatePath("/");
  revalidatePath("/audit-log");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/stock-movements");
  revalidatePath("/suppliers");
}

function getNextQuantity(type: ManualStockMovementType, currentQuantity: number, quantity: number) {
  if (type === "stock_in") return currentQuantity + quantity;
  if (type === "stock_out") return currentQuantity - quantity;
  return quantity;
}

function getMovementLabel(type: ManualStockMovementType) {
  if (type === "stock_in") return "Stock in";
  if (type === "stock_out") return "Stock out";
  return "Adjustment";
}

export async function createManualStockMovementAction(
  input: ManualStockMovementInput,
): Promise<ActionResult> {
  const productId = input.productId.trim();
  const quantity = Number(input.quantity);
  const note = input.note?.trim() ?? "";

  if (!productId) {
    return { error: "Please choose a product." };
  }

  if (!["stock_in", "stock_out", "adjustment"].includes(input.type)) {
    return { error: "Please choose a valid movement type." };
  }

  if (!note) {
    return { error: "Please add a note before recording the stock movement." };
  }

  if (!Number.isFinite(quantity) || quantity < 0) {
    return { error: "Quantity must be a valid positive number." };
  }

  if (input.type !== "adjustment" && quantity === 0) {
    return { error: "Stock in and stock out quantities must be greater than zero." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to record stock movements." };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, sku, quantity")
    .eq("id", productId)
    .single();

  if (productError) {
    return { error: productError.message };
  }

  const currentQuantity = Number(product.quantity);
  const nextQuantity = getNextQuantity(input.type, currentQuantity, quantity);

  if (nextQuantity < 0) {
    return { error: `${product.name} only has ${currentQuantity} units available.` };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ quantity: nextQuantity })
    .eq("id", productId);

  if (updateError) {
    return { error: updateError.message };
  }

  const { error: movementError } = await supabase.from("stock_movements").insert({
    product_id: productId,
    type: input.type,
    quantity,
    note,
    created_by: user.id,
  });

  if (movementError) {
    return { error: movementError.message };
  }

  await recordAuditLog({
    action: "update",
    entityType: "product",
    entityId: productId,
    entityName: product.name,
    details: {
      reason: "Manual stock movement",
      movement: getMovementLabel(input.type),
      sku: product.sku,
      previous_quantity: currentQuantity,
      next_quantity: nextQuantity,
      quantity,
      note,
    },
  });

  revalidateInventoryRoutes();
  return {};
}
