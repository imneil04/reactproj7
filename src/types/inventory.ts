export type StockStatus = "In stock" | "Low stock" | "Out of stock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  status: StockStatus;
}

export interface StockMovement {
  id: string;
  productName: string;
  type: "Stock in" | "Stock out" | "Adjustment";
  quantity: number;
  date: string;
  note?: string | null;
}
