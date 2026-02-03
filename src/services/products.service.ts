import { supabase } from "../lib/supabase";
import type { Product } from ".././types/database";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(product: Omit<Product, "id" | "created_at">) {
  const { error } = await supabase
    .from("products")
    .insert(product);

  if (error) throw error;
}
