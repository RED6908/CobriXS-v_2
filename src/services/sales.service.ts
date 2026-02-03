import { supabase } from "../lib/supabase";

export async function createSale(total: number) {
  const { data, error } = await supabase
    .from("sales")
    .insert({ total })
    .select()
    .single();

  if (error) throw error;
  return data;
}
