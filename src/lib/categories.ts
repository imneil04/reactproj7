import { createClient } from "@/lib/supabase/server";

interface CategoryRow {
  id: string;
  name: string;
  products: { id: string; name: string }[] | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  productCount: number;
  products: { id: string; name: string }[];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, products(id, name)")
    .order("name");

  if (error) {
    return { categories: [], error: error.message };
  }

  return {
    categories: (data as CategoryRow[]).map((category) => {
      const products = category.products ?? [];

      return {
        id: category.id,
        name: category.name,
        productCount: products.length,
        products,
      };
    }),
    error: null,
  };
}
