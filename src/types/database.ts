export type UserRole = "admin" | "user";
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

export interface Provider {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  balance: number;
  created_at: string;
}

export interface Sale {
  id: string;
  total: number;
  created_at: string;
}
