import { supabase } from "../lib/supabase";
import type { ProviderPayment } from "../types/database";
import { getActiveSession } from "./cashSession.service";

export async function registerPayment(
  providerId: string,
  amount: number,
  opts: { method?: string; reference?: string; notes?: string } = {}
): Promise<ProviderPayment> {
  const session = await getActiveSession().catch(() => null);
  const payload: Record<string, unknown> = {
    provider_id: providerId,
    amount,
    payment_date: new Date().toISOString(),
    method: opts.method ?? null,
    reference: opts.reference ?? null,
    notes: opts.notes ?? null,
  };
  if (session?.id) payload.cash_session_id = session.id;

  const { data: payment, error } = await supabase
    .from("provider_payments")
    .insert(payload)
    .select("id, provider_id, amount, payment_date, method, reference, notes, created_at")
    .single();
  if (error) throw error;
  return payment as ProviderPayment;
}

export async function getPayments(
  providerId?: string
): Promise<ProviderPayment[]> {
  let query = supabase
    .from("provider_payments")
    .select("id, provider_id, amount, payment_date, method, reference, notes, created_at, providers(name)")
    .order("created_at", { ascending: false });
  if (providerId) query = query.eq("provider_id", providerId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProviderPayment[];
}
