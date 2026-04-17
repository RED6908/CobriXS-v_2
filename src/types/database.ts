export type UserRole = "admin" | "vendedor";

/* =========================
   TIENDAS
========================= */
export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

/* =========================
   PRODUCTOS
========================= */
export interface Product {
  id: string;
  store_id: string | null;
  name: string;
  code: string | null;
  category: string | null;
  stock: number;
  min_stock?: number | null;
  max_stock?: number | null;
  location?: string | null;
  unit?: string | null;
  product_type?: string | null;
  provider_id?: string | null;
  purchase_price: number | null;
  sale_price: number | null;
  created_at: string;
}

/* =========================
   MOVIMIENTOS DE INVENTARIO
========================= */
export type MovementType = "entrada" | "salida";

export interface InventoryMovement {
  id: string;
  product_id: string;
  store_id: string | null;
  type: MovementType;
  quantity: number;
  description: string | null;
  user_id: string | null;
  created_at: string;
  products?: Pick<Product, "name" | "code">;
}

export type InventorySuggestionStatus = "pendiente" | "aprobado" | "rechazado";

export interface InventorySuggestion {
  id: string;
  product_id: string;
  store_id: string | null;
  type: MovementType;
  quantity: number;
  description: string | null;
  suggested_by: string;
  status: InventorySuggestionStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  products?: Pick<Product, "name" | "code">;
}

/* =========================
   PROVEEDORES (match your DB: id, name, phone, email, created_at)
========================= */
export interface Provider {
  id: string;
  store_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

/* =========================
   PAGOS A PROVEEDORES (match your DB: payment_date, method, reference, notes)
========================= */
export interface ProviderPayment {
  id: string;
  provider_id: string;
  amount: number;
  payment_date: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  providers?: Pick<Provider, "name">;
}

/* =========================
   USUARIOS
========================= */
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

/* =========================
   SESIÓN DE CAJA
========================= */
export type CashSessionStatus = "open" | "closed";

export interface CashSession {
  id: string;
  store_id: string | null;
  user_id: string | null;
  opening_amount: number;
  closing_amount: number | null;
  opened_at: string;
  closed_at: string | null;
  status: CashSessionStatus;
}

/* =========================
   VENTAS
========================= */
export type PaymentMethod =
  | "efectivo"
  | "tarjeta"
  | "transferencia"
  | "mixto";

export interface Sale {
  id: string;
  store_id: string | null;
  user_id: string | null;
  cash_session_id: string | null;
  total: number;
  payment_method: PaymentMethod;
  payment_breakdown?: Record<string, number>;
  created_at: string;
}

/* =========================
   DETALLE DE VENTA
========================= */
export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: Pick<Product, "name" | "code">;
}

/* =========================
   MOVIMIENTOS DE CAJA
========================= */
export type CashMovementType = "entrada" | "salida";

export interface CashMovement {
  id: string;
  cash_session_id: string | null;
  type: CashMovementType;
  amount: number;
  description: string | null;
  created_at: string;
}