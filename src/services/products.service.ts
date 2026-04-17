import { supabase } from "../lib/supabase";
import type { Product } from "../types/database";

/* =========================================
   GET PRODUCTS
========================================= */

export async function getProducts(storeId?: string | null): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("name", { ascending: true });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/* =========================================
   SEARCH
========================================= */

export async function searchByCode(code: string, storeId?: string | null): Promise<Product | null> {
  let q = supabase.from("products").select("*").eq("code", code);
  if (storeId) q = q.eq("store_id", storeId);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data;
}

export async function searchProducts(query: string, storeId?: string | null): Promise<Product[]> {
  let q = supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    .order("name", { ascending: true })
    .limit(20);
  if (storeId) q = q.eq("store_id", storeId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/* =========================================
   CREATE
========================================= */

export async function createProduct(
  product: Omit<Product, "id" | "created_at">
): Promise<void> {
  const { error } = await supabase.from("products").insert(product);
  if (error) throw error;
}

/* =========================================
   UPDATE
========================================= */

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

/* =========================================
   DELETE
========================================= */

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}