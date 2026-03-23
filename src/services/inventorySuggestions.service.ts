import { supabase } from "../lib/supabase";
import type { InventorySuggestion } from "../types/database";
import { createMovement } from "./inventory.service";

export async function getSuggestions(
  storeId?: string | null,
  status?: "pendiente" | "aprobado" | "rechazado",
  suggestedBy?: string
): Promise<InventorySuggestion[]> {
  let query = supabase
    .from("inventory_suggestions")
    .select("*, products(name, code)")
    .order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  if (status) query = query.eq("status", status);
  if (suggestedBy) query = query.eq("suggested_by", suggestedBy);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createSuggestion(
  productId: string,
  storeId: string | null,
  type: "entrada" | "salida",
  quantity: number,
  description: string,
  suggestedBy: string
) {
  const payload: Record<string, unknown> = {
    product_id: productId,
    type,
    quantity,
    description: description || null,
    suggested_by: suggestedBy,
    status: "pendiente",
  };
  if (storeId != null) payload.store_id = storeId;
  const { error } = await supabase.from("inventory_suggestions").insert(payload);
  if (error) throw error;
}

export async function approveSuggestion(
  suggestionId: string,
  resolvedBy: string,
  productId: string,
  storeId: string | null,
  type: "entrada" | "salida",
  quantity: number,
  description: string | null
) {
  /*const movement = {
    product_id: productId,
    type,
    quantity,
    description: description ?? null,
    user_id: resolvedBy,
    ...(storeId != null ? { store_id: storeId } : {}),
  };*/ //marca error para el paso 12, fecha 22/03/26

  const movement = {
  product_id: productId,
  type,
  quantity,
  description: description ?? null,
  user_id: resolvedBy,
  store_id: storeId ?? null,
};
  await createMovement(movement);

  const { error } = await supabase
    .from("inventory_suggestions")
    .update({
      status: "aprobado",
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);
  if (error) throw error;
}

export async function rejectSuggestion(suggestionId: string, resolvedBy: string) {
  const { error } = await supabase
    .from("inventory_suggestions")
    .update({
      status: "rechazado",
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);
  if (error) throw error;
}
