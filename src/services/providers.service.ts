import { supabase } from "../lib/supabase";

export async function getProviders() {
  const { data, error } = await supabase
    .from("providers")
    .select("*");

  if (error) throw error;
  return data;
}
