import { supabase } from "../lib/supabase";
import type { CashSession } from "../types/database";

export async function openSession(openingAmount: number): Promise<CashSession> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("cash_sessions")
    .insert({
      user_id: user?.id ?? null,
      opening_amount: openingAmount,
      status: "open",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function closeSession(
  sessionId: string,
  closingAmount: number
): Promise<void> {
  const { error } = await supabase
    .from("cash_sessions")
    .update({
      closing_amount: closingAmount,
      closed_at: new Date().toISOString(),
      status: "closed",
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getActiveSession(): Promise<CashSession | null> {
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSessionSummary(sessionId: string) {
  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("total, payment_method")
    .eq("cash_session_id", sessionId);
  if (salesError) throw salesError;

  const { data: payments, error: paymentsError } = await supabase
    .from("provider_payments")
    .select("amount")
    .eq("cash_session_id", sessionId);
  if (paymentsError) throw paymentsError;

  const totalSales = (sales ?? []).reduce((s, v) => s + v.total, 0);
  const totalPayments = (payments ?? []).reduce((s, p) => s + p.amount, 0);

  const { data: session } = await supabase
    .from("cash_sessions")
    .select("opening_amount")
    .eq("id", sessionId)
    .single();

  return {
    totalSales,
    totalPayments,
    openingAmount: session?.opening_amount ?? 0,
    expectedCash:
      (session?.opening_amount ?? 0) + totalSales - totalPayments,
    salesCount: (sales ?? []).length,
  };
}

export async function getSessions(): Promise<CashSession[]> {
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("*")
    .order("opened_at", { ascending: false });
  if (error) throw error;
  return data;
}
