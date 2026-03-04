export type UserRole = "admin" | "vendedor";

/* =========================
   PRODUCTOS
========================= */
export interface Product {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  stock: number;
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
  type: MovementType;
  quantity: number;
  description: string | null;
  user_id: string | null;
  created_at: string;
  products?: Pick<Product, "name" | "code">;
}

/* =========================
   PROVEEDORES
========================= */
export interface Provider {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rfc: string | null;
  contact: string | null;
  balance: number;
  created_at: string;
}

/* =========================
   PAGOS A PROVEEDORES
========================= */
export interface ProviderPayment {
  id: string;
  provider_id: string;
  cash_session_id: string | null;
  amount: number;
  description: string | null;
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
  | "transferencia";

export interface Sale {
  id: string;
  user_id: string | null;
  cash_session_id: string | null;
  total: number;
  payment_method: PaymentMethod;
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