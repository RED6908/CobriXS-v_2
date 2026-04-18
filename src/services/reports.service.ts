import { supabase } from "../lib/supabase";

export async function getSalesReport(from: string, to: string, storeId?: string | null) {
  let query = supabase
    .from("sales")
    .select("*, sale_items(quantity, price, products(name))")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSalesByDay(from: string, to: string, storeId?: string | null) {
  let query = supabase
    .from("sales")
    .select("created_at, total")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at");
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;

  const byDay: Record<string, number> = {};
  for (const sale of data ?? []) {
    const day = sale.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + sale.total;
  }
  return byDay;
}

export async function getCashCutReport(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (sessionError) throw sessionError;

  const { data: sales } = await supabase
    .from("sales")
    .select("total, payment_method")
    .eq("cash_session_id", sessionId);

  let totalPayments = 0;
  const payments: { amount: number; providers?: { name: string } }[] = [];
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("provider_payments")
    .select("amount, providers(name)")
    .eq("cash_session_id", sessionId);
  if (!paymentsError && paymentsData && Array.isArray(paymentsData)) {
    for (const row of paymentsData as { amount: number; providers?: { name: string } | { name: string }[] }[]) {
      const prov = row.providers;
      payments.push({
        amount: row.amount,
        providers: Array.isArray(prov) ? prov[0] : prov,
      });
      totalPayments += row.amount ?? 0;
    }
  }
  // If provider_payments has no cash_session_id column, paymentsError will be set; ignore and use 0

  const totalSales = (sales ?? []).reduce((s, v) => s + (v.total ?? 0), 0);
  const byMethod: Record<string, number> = {};
  for (const sale of sales ?? []) {
    const method = sale.payment_method ?? "efectivo";
    byMethod[method] = (byMethod[method] ?? 0) + (sale.total ?? 0);
  }

  return {
    session,
    totalSales,
    totalPayments,
    expectedCash: (session?.opening_amount ?? 0) + totalSales - totalPayments,
    salesCount: (sales ?? []).length,
    byMethod,
    payments,
  };
}

export async function getInventoryReport(from: string, to: string) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, products(name, code)")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
