import { supabase } from "../lib/supabase";
import type { Provider } from "../types/database";

export async function getProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProvidersSummary() {
  const providers = await getProviders();

  const totalBalance = providers.reduce((acc, provider) => acc + provider.balance, 0);
  const upToDateProviders = providers.filter((provider) => provider.balance <= 0).length;

  return {
    providersCount: providers.length,
    totalBalance,
    upToDateProviders,
  };
}
