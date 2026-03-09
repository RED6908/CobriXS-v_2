import { supabase } from "../lib/supabase";

export async function getSalesReport(from: string, to: string) {
  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(quantity, price, products(name))")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSalesByDay(from: string, to: string) {
  const { data, error } = await supabase
    .from("sales")
    .select("created_at, total")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at");
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

  const { data: payments } = await supabase
    .from("provider_payments")
    .select("amount, providers(name)")
    .eq("cash_session_id", sessionId);

  const totalSales = (sales ?? []).reduce((s, v) => s + v.total, 0);
  const totalPayments = (payments ?? []).reduce((s, p) => s + p.amount, 0);

  const byMethod: Record<string, number> = {};
  for (const sale of sales ?? []) {
    byMethod[sale.payment_method] =
      (byMethod[sale.payment_method] ?? 0) + sale.total;
  }

  return {
    session,
    totalSales,
    totalPayments,
    expectedCash: session.opening_amount + totalSales - totalPayments,
    salesCount: (sales ?? []).length,
    byMethod,
    payments: payments ?? [],
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
