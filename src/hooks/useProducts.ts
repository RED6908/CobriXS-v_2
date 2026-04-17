import { useEffect, useState, useCallback } from "react";
import type { Product } from "../types/database";
import { getProducts } from "../services/products.service";
import { useStore } from "../context/StoreContext";

export function useProducts() {
  const { currentStoreId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(currentStoreId);
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [currentStoreId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    products,
    loading,
    error,
    refetch,
  };
}