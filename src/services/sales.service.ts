import { supabase } from "../lib/supabase";
import type { Sale, SaleItem, PaymentMethod } from "../types/database";

export interface CreateSaleInput {
  cash_session_id: string | null;
  payment_method: PaymentMethod;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

/* =========================================
   CREATE SALE (PRO VERSION)
========================================= */

export async function createSale(
  input: CreateSaleInput
): Promise<Sale> {
  if (!input.items.length) {
    throw new Error("La venta debe tener al menos un producto");
  }

  // 🔹 Calcular total
  const total = input.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // 🔹 1. Verificar stock antes de vender
  for (const item of input.items) {
    const { data: product, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (error) throw error;

    if (!product || product.stock < item.quantity) {
      throw new Error("Stock insuficiente para uno o más productos");
    }
  }

  // 🔹 2. Crear venta
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      cash_session_id: input.cash_session_id,
      payment_method: input.payment_method,
      total,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  // 🔹 3. Insertar items
  const saleItems = input.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(saleItems);

  if (itemsError) throw itemsError;

  // 🔹 4. Descontar inventario
  for (const item of input.items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({
          stock: product.stock - item.quantity,
        })
        .eq("id", item.product_id);
    }
  }

  return sale;
}

/* =========================================
   GET SALES
========================================= */

export async function getSales(
  from?: string,
  to?: string
): Promise<Sale[]> {
  let query = supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/* =========================================
   GET SALE ITEMS
========================================= */

export async function getSaleItems(
  saleId: string
): Promise<SaleItem[]> {
  const { data, error } = await supabase
    .from("sale_items")
    .select("*, products(name, code)")
    .eq("sale_id", saleId);

  if (error) throw error;
  return data ?? [];
}

/* =========================================
   TODAY TOTAL
========================================= */

export async function getTodaySalesTotal(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("sales")
    .select("total")
    .gte("created_at", today.toISOString());

  if (error) return 0;

  return (data ?? []).reduce(
    (sum, s) => sum + (s.total ?? 0),
    0
  );
}