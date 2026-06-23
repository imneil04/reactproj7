import { createClient } from "@/lib/supabase/server";

interface SupplierRow {
  id: string;
  name: string;
  products: { id: string; name: string }[] | null;
}

export interface SupplierSummary {
  id: string;
  name: string;
  productCount: number;
  products: { id: string; name: string }[];
}

export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, products(id, name)")
    .order("name");

  if (error) {
    return { suppliers: [], error: error.message };
  }

  return {
    suppliers: (data as SupplierRow[]).map((supplier) => {
      const products = supplier.products ?? [];

      return {
        id: supplier.id,
        name: supplier.name,
        productCount: products.length,
        products,
      };
    }),
    error: null,
  };
}
