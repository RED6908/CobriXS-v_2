import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Product, InventoryMovement } from "../types/database";
import {
  getMovements,
  createMovement,
  subscribeToProducts,
} from "../services/inventory.service";
import { getProducts } from "../services/products.service";
import { useStore } from "../context/StoreContext";

export function useInventory() {
  const { currentStoreId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, movs] = await Promise.all([
        getProducts(currentStoreId),
        getMovements(currentStoreId),
      ]);
      setProducts(prods);
      setMovements(movs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, [currentStoreId]);

  useEffect(() => {
    fetchAll();

    const channel = subscribeToProducts(() => {
      getProducts(currentStoreId).then(setProducts).catch(console.error);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, currentStoreId]);

  const addMovement = useCallback(
    async (
      productId: string,
      type: "entrada" | "salida",
      quantity: number,
      description: string
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      const product = products.find((p) => p.id === productId);
      await createMovement({
        product_id: productId,
        store_id: product?.store_id ?? currentStoreId ?? null,
        type,
        quantity,
        description,
        user_id: user.id,
      });
      await fetchAll();
    },
    [fetchAll, products, currentStoreId]
  );

  const defaultMinStock = 10;
  const stats = {
    total: products.length,
    lowStock: products.filter(
      (p) => p.stock < (p.min_stock ?? defaultMinStock)
    ),
    totalValue: products.reduce(
      (sum, p) => sum + p.stock * (p.purchase_price ?? 0),
      0
    ),
    movementsCount: movements.length,
  };

  return { products, movements, loading, error, stats, addMovement, refetch: fetchAll };
}
