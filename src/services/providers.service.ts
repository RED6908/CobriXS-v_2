import { supabase } from "../lib/supabase";
import type { Provider } from "../types/database";

/* =========================================
   GET ALL PROVIDERS
========================================= */

export async function getProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/* =========================================
   CREATE
========================================= */

export async function createProvider(
  provider: Omit<Provider, "id" | "created_at">
): Promise<Provider> {
  const { data, error } = await supabase
    .from("providers")
    .insert(provider)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* =========================================
   UPDATE
========================================= */

export async function updateProvider(
  id: string,
  updates: Partial<Omit<Provider, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase
    .from("providers")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

/* =========================================
   DELETE
========================================= */

export async function deleteProvider(id: string): Promise<void> {
  const { error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}