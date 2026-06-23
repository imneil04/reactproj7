"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface ProductInput {
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
}

interface ActionResult {
  error?: string;
}

type NormalizedProductInput =
  | { value: Required<ProductInput> }
  | { error: string };

function normalizeProductInput(input: ProductInput): NormalizedProductInput {
  const name = input.name.trim();
  const sku = input.sku.trim().toUpperCase();
  const category = input.category.trim();
  const supplier = input.supplier.trim();
  const quantity = Number(input.quantity);
  const reorderLevel = Number(input.reorderLevel);
  const unitPrice = Number(input.unitPrice);

  if (!name || !sku || !category || !supplier) {
    return { error: "Product name, SKU, category, and supplier are required." };
  }

  if (
    !Number.isFinite(quantity) ||
    !Number.isFinite(reorderLevel) ||
    !Number.isFinite(unitPrice) ||
    quantity < 0 ||
    reorderLevel < 0 ||
    unitPrice < 0
  ) {
    return { error: "Quantity, reorder level, and unit price must be valid positive numbers." };
  }

  return {
    value: {
      name,
      sku,
      category,
      supplier,
      quantity,
      reorderLevel,
      unitPrice,
    },
  };
}

async function upsertLookup(table: "categories" | "suppliers", name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .upsert({ name }, { onConflict: "name" })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

function getDuplicateSkuMessage(message: string) {
  if (message.toLowerCase().includes("duplicate")) {
    return "SKU must be unique.";
  }

  return message;
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function recordStockMovement({
  productId,
  type,
  quantity,
  note,
}: {
  productId: string;
  type: "stock_in" | "stock_out" | "adjustment";
  quantity: number;
  note: string;
}) {
  if (quantity === 0) return;

  const supabase = await createClient();
  const createdBy = await getCurrentUserId();

  if (!createdBy) {
    throw new Error("You must be signed in to record stock movements.");
  }

  const { error } = await supabase.from("stock_movements").insert({
    product_id: productId,
    type,
    quantity: Math.abs(quantity),
    note,
    created_by: createdBy,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function revalidateInventoryRoutes() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/suppliers");
  revalidatePath("/stock-movements");
}

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  const normalized = normalizeProductInput(input);

  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const supabase = await createClient();
  const product = normalized.value;

  try {
    const categoryId = await upsertLookup("categories", product.category);
    const supplierId = await upsertLookup("suppliers", product.supplier);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        sku: product.sku,
        category_id: categoryId,
        supplier_id: supplierId,
        quantity: product.quantity,
        reorder_level: product.reorderLevel,
        unit_price: product.unitPrice,
      })
      .select("id")
      .single();

    if (error) {
      return { error: getDuplicateSkuMessage(error.message) };
    }

    if (product.quantity > 0) {
      await recordStockMovement({
        productId: data.id as string,
        type: "stock_in",
        quantity: product.quantity,
        note: "Initial product quantity",
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create product." };
  }

  revalidateInventoryRoutes();
  return {};
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const normalized = normalizeProductInput(input);

  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const supabase = await createClient();
  const product = normalized.value;

  try {
    const { data: existingProduct, error: existingProductError } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", id)
      .single();

    if (existingProductError) {
      return { error: existingProductError.message };
    }

    const categoryId = await upsertLookup("categories", product.category);
    const supplierId = await upsertLookup("suppliers", product.supplier);
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        sku: product.sku,
        category_id: categoryId,
        supplier_id: supplierId,
        quantity: product.quantity,
        reorder_level: product.reorderLevel,
        unit_price: product.unitPrice,
      })
      .eq("id", id);

    if (error) {
      return { error: getDuplicateSkuMessage(error.message) };
    }

    const previousQuantity = Number(existingProduct.quantity);
    const quantityDifference = product.quantity - previousQuantity;

    if (quantityDifference !== 0) {
      await recordStockMovement({
        productId: id,
        type: quantityDifference > 0 ? "stock_in" : "stock_out",
        quantity: Math.abs(quantityDifference),
        note: "Product quantity updated",
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update product." };
  }

  revalidateInventoryRoutes();
  return {};
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateInventoryRoutes();
  return {};
}
