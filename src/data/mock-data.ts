import type { Product, StockMovement } from "@/types/inventory";

export const products: Product[] = [
  { id: "1", sku: "EL-1001", name: "Wireless Keyboard", category: "Electronics", supplier: "Northstar Supply", quantity: 38, reorderLevel: 10, unitPrice: 49.99, status: "In stock" },
  { id: "2", sku: "EL-1002", name: "USB-C Dock", category: "Electronics", supplier: "Northstar Supply", quantity: 7, reorderLevel: 12, unitPrice: 89.5, status: "Low stock" },
  { id: "3", sku: "OF-2001", name: "A4 Copy Paper", category: "Office", supplier: "Paper & Co.", quantity: 120, reorderLevel: 30, unitPrice: 8.25, status: "In stock" },
  { id: "4", sku: "FR-3001", name: "Desk Chair", category: "Furniture", supplier: "Workspace Direct", quantity: 0, reorderLevel: 5, unitPrice: 189, status: "Out of stock" },
  { id: "5", sku: "OF-2002", name: "Permanent Markers", category: "Office", supplier: "Paper & Co.", quantity: 16, reorderLevel: 20, unitPrice: 12.75, status: "Low stock" },
];

export const stockMovements: StockMovement[] = [
  { id: "1", productName: "A4 Copy Paper", type: "Stock in", quantity: 50, date: "2026-06-12" },
  { id: "2", productName: "Wireless Keyboard", type: "Stock out", quantity: 4, date: "2026-06-11" },
  { id: "3", productName: "Desk Chair", type: "Adjustment", quantity: -1, date: "2026-06-10" },
  { id: "4", productName: "USB-C Dock", type: "Stock out", quantity: 3, date: "2026-06-09" },
];

export const inventorySummary = {
  products: products.length.toString(),
  unitsInStock: products.reduce((total, product) => total + product.quantity, 0).toString(),
  lowStock: products.filter((product) => product.quantity <= product.reorderLevel).length.toString(),
  inventoryValue: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(products.reduce((total, product) => total + product.quantity * product.unitPrice, 0)),
};
