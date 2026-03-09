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

  // ==============================
  // AGREGAR PRODUCTO
  // ==============================
  const handleAddProduct = () => {
    if (!barcode) return;

    const product = products.find(
      (p) =>
        p.code === barcode ||
        p.name.toLowerCase() === barcode.toLowerCase()
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

  // ==============================
  // CALCULAR TOTAL
  // ==============================
  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc + (item.sale_price || 0) * item.quantity,
      0
    );
  }, [cart]);

  // ==============================
  // PROCESAR PAGO
  // ==============================
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

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Panel de Cobro - CobriXS</h3>
          <p className="text-muted mb-0">
            Sistema profesional de punto de venta
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light">
            <i className="bi bi-search me-1" />
            Consultar Precio
          </button>

          <button className="btn btn-light">
            <i className="bi bi-three-dots-vertical" />
            Acciones Rápidas
          </button>

          <button className="btn btn-primary">
            <i className="bi bi-sliders me-1" />
            Opciones Avanzadas
          </button>
        </div>
      </div>

      {/* Caja Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Cajas de cobro:</span>
          <span className="badge bg-primary fs-6 px-3 py-2">
            <i className="bi bi-display me-1" />
            Caja 1
          </span>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setCashSessionOpen(true)}
        >
          <i className="bi bi-plus-lg me-1" />
          Nueva Caja
        </button>
      </div>

      {/* Main Layout */}
      <div className="row g-4">

        {/* LEFT SIDE */}
        <div className="col-12 col-xl-8">

          {/* Barcode Input */}
          <div className="input-group input-group-lg mb-3">
            <span className="input-group-text bg-white">
              <i className="bi bi-upc-scan fs-4" />
            </span>

            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddProduct()
              }
              className="form-control"
              placeholder="Escanee código de barras o ingrese manualmente..."
            />

            <button
              className="btn btn-primary px-4"
              onClick={handleAddProduct}
            >
              Agregar
            </button>
          </div>

          {/* Sale Options */}
          <button className="btn btn-light mb-3">
            <i className="bi bi-gear me-1" />
            Opciones de Venta
          </button>

          {/* Cart */}
          <div className="card h-100">
            <div className="card-body">
              {cart.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center text-center text-muted py-5">
                  <i className="bi bi-cart fs-1 mb-3" />
                  <h5 className="fw-semibold">
                    Escanee productos para iniciar la venta
                  </h5>
                  <p className="mb-0">Caja 1</p>
                </div>
              ) : (
                <ul className="list-group">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <div className="text-muted small">
                          x{item.quantity}
                        </div>
                      </div>
                      <strong>
                        $
                        {(
                          (item.sale_price || 0) *
                          item.quantity
                        ).toFixed(2)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-12 col-xl-4">

          {/* Payment Summary */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-uppercase">
                  Total a pagar
                </span>
                <span className="fs-3 fw-bold text-primary">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-primary w-100 py-3 fs-5"
                onClick={handleProcessPayment}
              >
                <i className="bi bi-credit-card me-1" />
                Procesar Pago
              </button>
            </div>
          </div>

          {/* Cash Session */}
          <div
            className={`card ${
              cashSessionOpen
                ? "border-success bg-success-subtle"
                : "border-warning bg-warning-subtle"
            }`}
          >
            <div className="card-body text-center">
              {cashSessionOpen ? (
                <>
                  <div className="fw-semibold text-success mb-3">
                    Caja abierta
                  </div>
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={() => setCashSessionOpen(false)}
                  >
                    Cerrar Caja
                  </button>
                </>
              ) : (
                <>
                  <div className="fw-semibold text-warning mb-3">
                    Sin sesión de caja
                  </div>
                  <button
                    className="btn btn-outline-dark w-100"
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