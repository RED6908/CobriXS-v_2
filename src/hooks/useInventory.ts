import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Product, InventoryMovement } from "../types/database";
import {
  getMovements,
  createMovement,
  subscribeToProducts,
} from "../services/inventory.service";
import { getProducts } from "../services/products.service";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, movs] = await Promise.all([getProducts(), getMovements()]);
      setProducts(prods);
      setMovements(movs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = subscribeToProducts(() => {
      getProducts().then(setProducts).catch(console.error);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const addMovement = useCallback(
    async (
      productId: string,
      type: "entrada" | "salida",
      quantity: number,
      description: string
    ) => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      
      await createMovement({
        product_id: productId,
        type,
        quantity,
        description,
        user_id: user.id,
      });
      await fetchAll();
    },
    [fetchAll]
  );

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock <= 5),
    totalValue: products.reduce(
      (sum, p) => sum + p.stock * (p.purchase_price ?? 0),
      0
    ),
    movementsCount: movements.length,
  };

  return { products, movements, loading, error, stats, addMovement, refetch: fetchAll };
}
