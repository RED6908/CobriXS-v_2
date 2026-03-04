import { supabase } from "../lib/supabase";
import type { Product } from "../types/database";

/* =========================================
   GET PRODUCTS
========================================= */

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/* =========================================
   SEARCH
========================================= */

export async function searchByCode(code: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    .order("name", { ascending: true })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

/* =========================================
   CREATE
========================================= */

export async function createProduct(
  product: Omit<Product, "id" | "created_at">
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .insert(product);

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