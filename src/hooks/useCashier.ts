import { useReducer, useState, useEffect, useCallback } from "react";
import type { Product, CashSession, PaymentMethod } from "../types/database";
import { searchByCode, searchProducts, getProducts } from "../services/products.service";
import { createSale } from "../services/sales.service";
import { getActiveSession, openSession, closeSession, getSessionSummary } from "../services/cashSession.service";

export interface CartItem {
  product: Product;
  quantity: number;
}

type CartAction =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.product.id === action.product.id);
      if (existing) {
        return state.map((i) =>
          i.product.id === action.product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { product: action.product, quantity: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.product.id !== action.productId);
    case "SET_QTY":
      return state.map((i) =>
        i.product.id === action.productId
          ? { ...i, quantity: Math.max(1, action.quantity) }
          : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function useCashier() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [session, setSession] = useState<CashSession | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    getActiveSession().then(setSession).catch(() => null);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const handleBarcodeScan = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setError(null);
    try {
      // 1. Buscar por código exacto
      const product = await searchByCode(code.trim());
      if (product) {
        dispatch({ type: "ADD", product });
        setSearchQuery("");
        setSearchResults([]);
        return;
      }
      // 2. Buscar por nombre o código parcial
      const results = await searchProducts(code.trim());
      if (results.length > 0) {
        dispatch({ type: "ADD", product: results[0] });
        setSearchQuery("");
        setSearchResults([]);
      } else {
        setError(`Producto con código o nombre "${code}" no encontrado`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al buscar producto");
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: "ADD", product });
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: "REMOVE", productId });
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "SET_QTY", productId, quantity });
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.quantity * (item.product.sale_price ?? 0),
    0
  );

  const handleOpenSession = useCallback(async (openingAmount: number) => {
    const s = await openSession(openingAmount);
    setSession(s);
  }, []);

  const handleCloseSession = useCallback(async (closingAmount: number) => {
    if (!session) return;
    await closeSession(session.id, closingAmount);
    setSession(null);
  }, [session]);

  const handleProcessSale = useCallback(
    async (
      paymentMethod: PaymentMethod,
      paymentBreakdown?: Record<string, number>
    ): Promise<string> => {
      if (cart.length === 0) throw new Error("El carrito está vacío");
      setProcessing(true);
      setError(null);
      try {
        const sale = await createSale({
          cash_session_id: session?.id ?? null,
          payment_method: paymentMethod,
          payment_breakdown: paymentBreakdown,
          items: cart.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.product.sale_price ?? 0,
          })),
        });
        dispatch({ type: "CLEAR" });
        return sale.id;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al procesar venta";
        setError(msg);
        throw e;
      } finally {
        setProcessing(false);
      }
    },
    [cart, session]
  );

  const loadProductCatalog = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const list = await getProducts();
      setAllProducts(list);
    } catch {
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const getSessionSummaryData = useCallback(async () => {
    if (!session) return null;
    return getSessionSummary(session.id);
  }, [session]);

  return {
    cart,
    session,
    searchQuery,
    searchResults,
    allProducts,
    loadingProducts,
    loadProductCatalog,
    total,
    processing,
    error,
    setError,
    handleSearch,
    handleBarcodeScan,
    addToCart,
    removeFromCart,
    setQty,
    handleOpenSession,
    handleCloseSession,
    handleProcessSale,
    getSessionSummaryData,
  };
}
