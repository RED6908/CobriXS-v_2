import { supabase } from "../lib/supabase";
import type { ProviderPayment } from "../types/database";
import { getActiveSession } from "./cashSession.service";

export async function registerPayment(
  providerId: string,
  amount: number,
  description: string
): Promise<ProviderPayment> {
  const session = await getActiveSession();

  const { data: payment, error: paymentError } = await supabase
    .from("provider_payments")
    .insert({
      provider_id: providerId,
      cash_session_id: session?.id ?? null,
      amount,
      description,
    })
    .select()
    .single();
  if (paymentError) throw paymentError;

  if (session) {
    await supabase.from("cash_movements").insert({
      cash_session_id: session.id,
      type: "salida",
      amount,
      description: `Pago a proveedor: ${description}`,
    });
  }

  return payment;
}

export async function getPayments(
  providerId?: string
): Promise<ProviderPayment[]> {
  let query = supabase
    .from("provider_payments")
    .select("*, providers(name)")
    .order("created_at", { ascending: false });

  if (providerId) query = query.eq("provider_id", providerId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
