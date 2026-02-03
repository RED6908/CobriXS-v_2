import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../types/database";

export default function TestSupabase() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) {
        console.error(error);
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Productos desde Supabase</h2>

      {products.length === 0 && <p>Sin productos</p>}

      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} — Stock: {p.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
