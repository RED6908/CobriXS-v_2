import { supabase } from "../lib/supabase";
import type { InventoryMovement } from "../types/database";

/* =========================================
   INVENTORY MOVEMENTS
========================================= */

export async function getMovements(storeId?: string | null): Promise<InventoryMovement[]> {
  let query = supabase
    .from("inventory_movements")
    .select("*, products(name, code)")
    .order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createMovement(
  movement: Omit<InventoryMovement, "id" | "created_at" | "products"> & { store_id?: string | null }
) {
  const { store_id, ...rest } = movement;
  const payload = store_id != null ? { ...rest, store_id } : rest;
  const { error } = await supabase.from("inventory_movements").insert(payload);
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

export async function getStockStats(storeId?: string | null) {
  let query = supabase
    .from("products")
    .select("id, name, stock, category, purchase_price");
  if (storeId) query = query.eq("store_id", storeId);
  const { data: products, error } = await query;

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