import { supabase } from "../lib/supabase";
import type { Provider } from "../types/database";

/* =========================================
   GET ALL PROVIDERS
========================================= */

export async function getProviders(storeId?: string | null): Promise<Provider[]> {
  let query = supabase.from("providers").select("*").order("name", { ascending: true });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/* =========================================
   CREATE
========================================= */

export async function createProvider(
  provider: Pick<Provider, "name"> & Partial<Pick<Provider, "phone" | "email">>
): Promise<Provider> {
  const payload: Record<string, unknown> = {
    name: String(provider.name).trim(),
    phone: provider.phone?.trim() || null,
    email: provider.email?.trim() || null,
  };
  const { data, error } = await supabase
    .from("providers")
    .insert(payload)
    .select("id, name, phone, email, created_at")
    .single();
  if (error) throw error;
  return data as Provider;
}

/* =========================================
   UPDATE
========================================= */

export async function updateProvider(
  id: string,
  updates: Partial<Pick<Provider, "name" | "phone" | "email">>
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