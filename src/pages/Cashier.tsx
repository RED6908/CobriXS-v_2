import { useState, useMemo } from "react";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../types/database";

interface CartItem extends Product {
  quantity: number;
}

export default function Cashier() {
  const { products } = useProducts();
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashSessionOpen, setCashSessionOpen] = useState(false);

  // Buscar producto por código
  const handleAddProduct = () => {
    if (!barcode) return;

    const product = products.find(
      (p) => p.code === barcode || p.name.toLowerCase() === barcode.toLowerCase()
    );

    if (!product) {
      alert("Producto no encontrado");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setBarcode("");
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (item.sale_price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const handleProcessPayment = () => {
    if (!cashSessionOpen) {
      alert("Debes abrir caja primero");
      return;
    }

    if (cart.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }

    alert("Venta procesada correctamente ✅");
    setCart([]);
  };

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4">Panel de Cobro - CobriXS</h3>

      <div className="row g-4">
        {/* LEFT */}
        <div className="col-xl-8">

          {/* Barcode */}
          <div className="input-group input-group-lg mb-3">
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="form-control"
              placeholder="Escanea o escribe código..."
              onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
            />
            <button className="btn btn-primary" onClick={handleAddProduct}>
              Agregar
            </button>
          </div>

          {/* Cart */}
          <div className="card">
            <div className="card-body">
              {cart.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No hay productos en el carrito
                </div>
              ) : (
                <ul className="list-group">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <div>
                        {item.name} x{item.quantity}
                      </div>
                      <strong>
                        $
                        {(
                          (item.sale_price || 0) * item.quantity
                        ).toFixed(2)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-xl-4">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span>Total:</span>
                <span className="fw-bold fs-4">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleProcessPayment}
              >
                Procesar Pago
              </button>
            </div>
          </div>

          <div className="card border-warning bg-warning-subtle">
            <div className="card-body text-center">
              {cashSessionOpen ? (
                <>
                  <p className="fw-semibold text-success">
                    Caja abierta
                  </p>
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={() => setCashSessionOpen(false)}
                  >
                    Cerrar Caja
                  </button>
                </>
              ) : (
                <>
                  <p className="fw-semibold text-warning">
                    Sin sesión de caja
                  </p>
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => setCashSessionOpen(true)}
                  >
                    Abrir Caja
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}