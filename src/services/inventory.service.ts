import { supabase } from "../lib/supabase";
import type { InventoryMovement } from "../types/database";

/* =========================================
   INVENTORY MOVEMENTS
========================================= */

export async function getMovements(): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, products(name, code)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createMovement(
  movement: Omit<InventoryMovement, "id" | "created_at" | "products">
) {
  const { error } = await supabase
    .from("inventory_movements")
    .insert(movement);

  if (error) throw error;
}

/* =========================================
   STOCK UPDATE
========================================= */

export async function updateStock(
  productId: string,
  quantity: number
) {
  const { error } = await supabase
    .from("products")
    .update({ stock: quantity })
    .eq("id", productId);

  if (error) throw error;
}

/* =========================================
   DASHBOARD STATS
========================================= */

export async function getStockStats() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, stock, category, purchase_price");

  if (error) throw error;

  const safeProducts = products ?? [];

  const total = safeProducts.length;
  const lowStock = safeProducts.filter((p) => p.stock <= 5);
  const totalValue = safeProducts.reduce(
    (sum, p) => sum + (p.stock ?? 0) * (p.purchase_price ?? 0),
    0
  );

  return { total, lowStock, totalValue, products: safeProducts };
}

/* =========================================
   REALTIME SUBSCRIPTION
========================================= */

export function subscribeToProducts(
  callback: (payload: unknown) => void
) {
  return supabase
    .channel("products-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      callback
    )
    .subscribe();
}