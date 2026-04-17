import { supabase } from "../lib/supabase";
import type { Sale, SaleItem, PaymentMethod } from "../types/database";

export interface CreateSaleInput {
  cash_session_id: string | null;
  store_id?: string | null;
  payment_method: PaymentMethod;
  payment_breakdown?: Record<string, number>;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

/* =========================================
   CREATE SALE (transacción atómica)
========================================= */

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  if (!input.items.length) {
    throw new Error("La venta debe tener al menos un producto");
  }

  const total = input.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const itemsJson = input.items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
    price: i.price,
  }));

  const { data: saleId, error } = await supabase.rpc("create_sale_atomic", {
    p_cash_session_id: input.cash_session_id,
    p_payment_method: input.payment_method,
    p_payment_breakdown: input.payment_breakdown ?? null,
    p_items: itemsJson,
  });

  if (error) {
    if (error.message?.includes("Stock insuficiente")) {
      throw new Error("Stock insuficiente para uno o más productos");
    }
    const useLegacy =
      error.code === "42883" ||
      error.code === "PGRST116" ||
      error.code === "PGRST202" ||
      (error as { status?: number }).status === 404 ||
      error.message?.includes("does not exist") ||
      error.message?.includes("not found");
    if (useLegacy) {
      return createSaleLegacy(input);
    }
    throw error;
  }

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .single();

  if (sale) return sale;

  return {
    id: saleId as string,
    store_id: input.store_id ?? null,
    user_id: null,
    cash_session_id: input.cash_session_id,
    total,
    payment_method: input.payment_method,
    payment_breakdown: input.payment_breakdown,
    created_at: new Date().toISOString(),
  };
}

async function createSaleLegacy(input: CreateSaleInput): Promise<Sale> {
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

  const total = input.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const { data: { user } } = await supabase.auth.getUser();
  const saleBase = {
    cash_session_id: input.cash_session_id,
    total,
    user_id: user?.id ?? null,
  };

  let sale: { id: string };
  let usePaymentsTable = false;

  const { data: saleWithPm, error: saleError } = await supabase
    .from("sales")
    .insert({ ...saleBase, payment_method: input.payment_method })
    .select()
    .single();

  if (saleError && (saleError.message?.includes("payment_method") || saleError.code === "42703")) {
    const { data: saleNoPm, error: saleNoPmError } = await supabase
      .from("sales")
      .insert(saleBase)
      .select()
      .single();
    if (saleNoPmError) throw saleNoPmError;
    sale = saleNoPm;
    usePaymentsTable = true;
  } else if (saleError) {
    throw saleError;
  } else {
    sale = saleWithPm!;
  }

  await insertSaleItemsAndPayments(sale.id, input, usePaymentsTable);
  return sale as Sale;
}

async function insertSaleItemsAndPayments(
  saleId: string,
  input: CreateSaleInput,
  usePaymentsTable: boolean
): Promise<void> {
  const itemsWithSubtotal = input.items.map((item) => ({
    sale_id: saleId,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.quantity * item.price,
  }));

  const { error: itemsError } = await supabase.from("sale_items").insert(itemsWithSubtotal);
  if (itemsError) {
    const withoutSubtotal = input.items.map((item) => ({
      sale_id: saleId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
    await supabase.from("sale_items").insert(withoutSubtotal);
  }

  if (usePaymentsTable) {
    const totalAmount = input.items.reduce((s, i) => s + i.quantity * i.price, 0);
    if (input.payment_breakdown && Object.keys(input.payment_breakdown).length > 0) {
      const { error: payErr } = await supabase.from("payments").insert(
        Object.entries(input.payment_breakdown).map(([method, amount]) => ({
          sale_id: saleId,
          method,
          amount,
        }))
      );
      if (payErr && payErr.code !== "42P01") throw payErr;
    } else {
      const { error: payErr } = await supabase.from("payments").insert({
        sale_id: saleId,
        method: input.payment_method,
        amount: totalAmount,
      });
      if (payErr && payErr.code !== "42P01") throw payErr;
    }
  }

  for (const item of input.items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();
    if (product) {
      await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.product_id);
    }
  }
}

/* =========================================
   GET SALES
========================================= */

export async function getSales(
  from?: string,
  to?: string,
  storeId?: string | null
): Promise<Sale[]> {
  let query = supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (storeId) query = query.eq("store_id", storeId);

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
