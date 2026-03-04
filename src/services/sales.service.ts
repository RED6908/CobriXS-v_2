import { supabase } from "../lib/supabase";
import type { Sale } from "../types/database";

export async function createSale(total: number) {
  const { data, error } = await supabase
    .from("sales")
    .insert({ total })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSales(limit = 10): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("id, total, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getSalesSummary() {
  const sales = await getSales(200);

  const totalAmount = sales.reduce((acc, sale) => acc + sale.total, 0);
  const averageTicket = sales.length > 0 ? totalAmount / sales.length : 0;

  return {
    salesCount: sales.length,
    totalAmount,
    averageTicket,
  };
}
