import { supabase } from "../lib/supabase";

export async function updateStock(
  productId: string,
  quantity: number
) {
  const { error } = await supabase
    .from("products")
    .update({ stock: quantity })
    .eq("id", productId);

  if (error) throw error;
}
