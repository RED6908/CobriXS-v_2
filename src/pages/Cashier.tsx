import { useState, useCallback, useEffect } from "react";
import { useCashier } from "../hooks/useCashier";
import { getActiveSession } from "../services/cashSession.service";
import type { PaymentMethod } from "../types/database";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
];

export default function Cashier() {
  const {
    cart,
    session,
    total,
    processing,
    error,
    setError,
    handleBarcodeScan,
    addToCart,
    removeFromCart,
    setQty,
    handleOpenSession,
    handleCloseSession,
    handleProcessSale,
    searchQuery,
    searchResults,
    handleSearch,
  } = useCashier();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [openAmount, setOpenAmount] = useState("");
  const [openingSession, setOpeningSession] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("efectivo");
  const [sessionRefresh, setSessionRefresh] = useState(0);

  useEffect(() => {
    getActiveSession()
      .then(() => setSessionRefresh((s) => s + 1))
      .catch(() => {});
  }, [sessionRefresh, session?.id]);

  useEffect(() => {
    if (!barcodeInput.trim()) {
      handleSearch("");
      return;
    }
    const t = setTimeout(() => handleSearch(barcodeInput), 250);
    return () => clearTimeout(t);
  }, [barcodeInput, handleSearch]);

  const handleAddFromInput = useCallback(() => {
    const code = barcodeInput.trim();
    if (!code) return;
    handleBarcodeScan(code);
    setBarcodeInput("");
  }, [barcodeInput, handleBarcodeScan]);

  const handleOpenCaja = useCallback(async () => {
    const amount = Number(openAmount) || 0;
    if (amount < 0) {
      setError("El monto debe ser mayor o igual a 0");
      return;
    }
    setOpeningSession(true);
    setError(null);
    try {
      await handleOpenSession(amount);
      setShowOpenSessionModal(false);
      setOpenAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al abrir caja");
    } finally {
      setOpeningSession(false);
    }
  }, [openAmount, handleOpenSession, setError]);

  const handleProcessPayment = useCallback(async () => {
    if (!session) {
      setError("Abre una sesión de caja primero");
      return;
    }
    if (cart.length === 0) {
      setError("Agrega productos al carrito");
      return;
    }
    setShowPaymentModal(true);
  }, [session, cart.length]);

  const confirmPayment = useCallback(async () => {
    setError(null);
    try {
      await handleProcessSale(selectedPayment);
      setShowPaymentModal(false);
    } catch {
      // error already set in hook
    }
  }, [selectedPayment, handleProcessSale]);

  const subtotal = total;

  return (
    <div className="cashier-page">
      <nav className="text-muted small mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-receipt me-1" />
            Panel de Cobro
          </li>
          <li className="breadcrumb-item">
            <i className="bi bi-display me-1" />
            Escritorio
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Panel de Cobro - CobriXS</h3>
          <p className="text-muted mb-0">
            Sistema profesional de punto de venta
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-light">
            <i className="bi bi-search me-1" />
            Consultar Precio
          </button>
          <button type="button" className="btn btn-light">
            <i className="bi bi-three-dots-vertical" />
            Acciones Rápidas
          </button>
          <button type="button" className="btn btn-primary cashier-btn-advanced">
            <i className="bi bi-sliders me-1" />
            Opciones Avanzadas
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Cajas de cobro:</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled
            title="Caja activa"
          >
            <i className="bi bi-display me-1" />
            Caja 1
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowOpenSessionModal(true)}
          disabled={!!session}
        >
          <i className="bi bi-plus-lg me-1" />
          Nueva Caja
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3 d-flex align-items-center justify-content-between" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-close btn-sm"
            aria-label="Cerrar"
            onClick={() => setError(null)}
          />
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="input-group input-group-lg mb-3">
            <span className="input-group-text bg-white">
              <i className="bi bi-fullscreen me-1 text-muted" aria-hidden />
            </span>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted" aria-hidden />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Escanee código de barras o ingrese manualmente..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFromInput()}
              aria-label="Código de barras o búsqueda"
            />
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleAddFromInput}
            >
              Agregar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="list-group mb-3">
              {searchResults.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex justify-content-between"
                  onClick={() => {
                    addToCart(p);
                    setBarcodeInput("");
                  }}
                >
                  <span>{p.name}</span>
                  <span className="text-muted small">{p.code ?? ""}</span>
                </button>
              ))}
            </div>
          )}

          <button type="button" className="btn btn-light mb-3">
            <i className="bi bi-gear me-1" />
            Opciones de Venta
          </button>

          <div className="card h-100 min-h-300">
            <div className="card-body d-flex flex-column">
              {cart.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center text-center text-muted flex-grow-1 py-5">
                  <i className="bi bi-cart display-4 mb-3 opacity-50" />
                  <h5 className="fw-semibold">
                    Escanee productos para iniciar la venta
                  </h5>
                  <p className="mb-0">Caja 1</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {cart.map((item) => (
                    <li
                      key={item.product.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <strong>{item.product.name}</strong>
                        <span className="badge bg-light text-dark rounded-pill">
                          x{item.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label="Quitar"
                        >
                          <i className="bi bi-trash small" />
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          className="form-control form-control-sm text-end"
                          style={{ width: 60 }}
                          value={item.quantity}
                          onChange={(e) =>
                            setQty(item.product.id, Number(e.target.value) || 1)
                          }
                        />
                        <strong>
                          $
                          {(
                            (item.product.sale_price ?? 0) * item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-uppercase small">
                  Total a pagar
                </span>
                <span className="fs-3 fw-bold text-primary">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary w-100 py-3 fs-5 cashier-btn-process"
                onClick={handleProcessPayment}
                disabled={processing || cart.length === 0}
              >
                <i className="bi bi-credit-card me-1" />
                Procesar Pago
              </button>
            </div>
          </div>

          {!session ? (
            <div className="card border-warning bg-warning bg-opacity-10">
              <div className="card-body">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <i className="bi bi-x-circle text-warning fs-4" />
                  <span className="fw-semibold text-dark">
                    Sin sesión de caja
                  </span>
                </div>
                <p className="text-muted small mb-3">
                  Abre una sesión para registrar ventas en caja.
                </p>
                <button
                  type="button"
                  className="btn btn-warning w-100"
                  onClick={() => setShowOpenSessionModal(true)}
                >
                  <i className="bi bi-arrow-right me-1" />
                  Abrir Caja
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-success bg-success bg-opacity-10">
              <div className="card-body">
                <div className="fw-semibold text-success mb-2">
                  <i className="bi bi-check-circle me-1" />
                  Caja abierta
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 btn-sm"
                  onClick={() => {
                    const amount = window.prompt("Monto en caja al cerrar ($)", "0");
                    if (amount != null) handleCloseSession(Number(amount) || 0);
                  }}
                >
                  Cerrar Caja
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Abrir Caja */}
      {showOpenSessionModal && (
        <div
          className="modal fade show d-block cashier-modal-overlay"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="open-session-title"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="open-session-title" className="modal-title">
                  Abrir Caja
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => {
                    setShowOpenSessionModal(false);
                    setOpenAmount("");
                    setError(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <label htmlFor="open-amount" className="form-label">
                  Monto de apertura ($)
                </label>
                <input
                  id="open-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={openAmount}
                  onChange={(e) => setOpenAmount(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOpenSessionModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={openingSession}
                  onClick={handleOpenCaja}
                >
                  {openingSession ? "Abriendo..." : "Abrir Caja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Procesar Pago (método) */}
      {showPaymentModal && (
        <div
          className="modal fade show d-block cashier-modal-overlay"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="payment-modal-title" className="modal-title">
                  Procesar Pago
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowPaymentModal(false)}
                />
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  Total: <strong>${subtotal.toFixed(2)}</strong>
                </p>
                <label className="form-label">Método de pago</label>
                <select
                  className="form-select"
                  value={selectedPayment}
                  onChange={(e) =>
                    setSelectedPayment(e.target.value as PaymentMethod)
                  }
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={processing}
                  onClick={confirmPayment}
                >
                  {processing ? "Procesando..." : "Confirmar venta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
