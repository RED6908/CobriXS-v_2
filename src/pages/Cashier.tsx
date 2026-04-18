import { useState, useCallback, useEffect } from "react";
import { useCashier } from "../hooks/useCashier";
import { useToast } from "../context/ToastContext";
import { getActiveSession } from "../services/cashSession.service";
import { printTicket } from "../utils/printTicket";
import type { PaymentMethod } from "../types/database";
import PageHeader from "../components/PageHeader";

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
    searchResults,
    handleSearch,
    allProducts,
    loadingProducts,
    loadProductCatalog,
  } = useCashier();

  const { success: toastSuccess, error: toastError } = useToast();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
  const [openAmount, setOpenAmount] = useState("");
  const [closeAmount, setCloseAmount] = useState("");
  const [openingSession, setOpeningSession] = useState(false);
  const [closingSession, setClosingSession] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("efectivo");
  const [paymentMode, setPaymentMode] = useState<"simple" | "mixed">("simple");
  const [mixedAmounts, setMixedAmounts] = useState({ efectivo: 0, tarjeta: 0, transferencia: 0 });
  const [sessionRefresh, setSessionRefresh] = useState(0);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

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
      toastSuccess("Caja abierta correctamente");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al abrir caja");
    } finally {
      setOpeningSession(false);
    }
  }, [openAmount, handleOpenSession, setError, toastSuccess]);

  const handleCloseCaja = useCallback(async () => {
    const amount = Number(closeAmount) || 0;
    if (amount < 0) {
      setError("El monto debe ser mayor o igual a 0");
      return;
    }
    setClosingSession(true);
    setError(null);
    try {
      await handleCloseSession(amount);
      setShowCloseSessionModal(false);
      setCloseAmount("");
      toastSuccess("Caja cerrada correctamente");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cerrar caja");
    } finally {
      setClosingSession(false);
    }
  }, [closeAmount, handleCloseSession, setError, toastSuccess]);

  const handleProcessPayment = useCallback(() => {
    if (!session) {
      setError("Abre una sesión de caja primero");
      return;
    }
    if (cart.length === 0) {
      setError("Agrega productos al carrito");
      return;
    }
    setShowPaymentModal(true);
  }, [session, cart.length, setError]);

  const subtotal = total;

  const confirmPayment = useCallback(async () => {
    setError(null);
    const totalToPay = total;
    const cartSnapshot = [...cart];
    let paymentMethod: PaymentMethod | "mixto" = selectedPayment;
    let paymentBreakdown: Record<string, number> | undefined;

    if (paymentMode === "mixed") {
      const sum = mixedAmounts.efectivo + mixedAmounts.tarjeta + mixedAmounts.transferencia;
      if (Math.abs(sum - totalToPay) > 0.01) {
        toastError(`El total debe sumar $${totalToPay.toFixed(2)}. Actual: $${sum.toFixed(2)}`);
        return;
      }
      paymentMethod = "mixto";
      paymentBreakdown = {};
      if (mixedAmounts.efectivo > 0) paymentBreakdown.efectivo = mixedAmounts.efectivo;
      if (mixedAmounts.tarjeta > 0) paymentBreakdown.tarjeta = mixedAmounts.tarjeta;
      if (mixedAmounts.transferencia > 0) paymentBreakdown.transferencia = mixedAmounts.transferencia;
    }

    try {
      const saleId = await handleProcessSale(paymentMethod as PaymentMethod, paymentBreakdown);
      setShowPaymentModal(false);
      setPaymentMode("simple");
      setMixedAmounts({ efectivo: 0, tarjeta: 0, transferencia: 0 });
      toastSuccess("Venta procesada correctamente");

      printTicket({
        items: cartSnapshot,
        total: totalToPay,
        paymentMethod,
        paymentBreakdown,
        saleId,
        date: new Date(),
      });
    } catch {
      toastError(error ?? "Error al procesar la venta");
    }
  }, [
    selectedPayment,
    handleProcessSale,
    paymentMode,
    mixedAmounts,
    total,
    cart,
    error,
    setError,
    toastSuccess,
    toastError,
  ]);

  return (
    <div className="container-fluid cashier-page">
      <PageHeader
        title="Panel de Cobro"
        subtitle="Punto de venta · Escanea y procesa ventas"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Panel de Cobro" }]}
      />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          {!session ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowOpenSessionModal(true)}
            >
              <i className="bi bi-unlock me-1" />
              Abrir Caja
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                setCloseAmount("");
                setShowCloseSessionModal(true);
              }}
            >
              <i className="bi bi-lock me-1" />
              Cerrar Caja
            </button>
          )}
        </div>
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
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text bg-white">
              <i className="bi bi-upc-scan text-muted" aria-hidden />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Código o nombre del producto · Escanee, escriba y presione Enter"
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
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowProductCatalog(true);
                loadProductCatalog();
              }}
              title="Seleccionar producto del catálogo"
            >
              <i className="bi bi-box-seam me-1" />
              Seleccionar
            </button>
          </div>
          <p className="text-muted small mb-3">
            Sin escáner: escriba el código o nombre y presione Enter, o haga clic en un resultado, o use &quot;Seleccionar&quot; para ver el catálogo.
          </p>

          {searchResults.length > 0 && (
            <div className="list-group mb-3">
              {searchResults.slice(0, 8).map((p) => (
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

          <div className="cobrixs-card min-h-300">
            <div className="cobrixs-card-body d-flex flex-column">
              {cart.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center text-center text-muted flex-grow-1 py-5">
                  <i className="bi bi-cart display-4 mb-3 opacity-50" />
                  <h5 className="fw-semibold">Agregue productos para iniciar la venta</h5>
                  <p className="mb-0 small">Escanee, escriba el código/nombre, o use &quot;Seleccionar&quot; para elegir del catálogo</p>
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
                        <span className="badge bg-light text-dark rounded-pill">x{item.quantity}</span>
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
                          onChange={(e) => setQty(item.product.id, Number(e.target.value) || 1)}
                          aria-label={`Cantidad de ${item.product.name}`}
                        />
                        <strong>
                          ${((item.product.sale_price ?? 0) * item.quantity).toFixed(2)}
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
          <div className="cobrixs-card mb-3">
            <div className="cobrixs-card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-uppercase small">Total a pagar</span>
                <span className="fs-3 fw-bold text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary w-100 py-3"
                onClick={handleProcessPayment}
                disabled={processing || cart.length === 0 || !session}
              >
                <i className="bi bi-credit-card me-1" />
                Procesar Pago
              </button>
            </div>
          </div>

          {!session ? (
            <div className="cobrixs-card border-warning">
              <div className="cobrixs-card-body">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <i className="bi bi-x-circle text-warning fs-4" />
                  <span className="fw-semibold text-dark">Sin sesión de caja</span>
                </div>
                <p className="text-muted small mb-3">
                  Abre una sesión para registrar ventas.
                </p>
                <button
                  type="button"
                  className="btn btn-warning w-100"
                  onClick={() => setShowOpenSessionModal(true)}
                >
                  <i className="bi bi-unlock me-1" />
                  Abrir Caja
                </button>
              </div>
            </div>
          ) : (
            <div className="cobrixs-card border-success">
              <div className="cobrixs-card-body">
                <div className="fw-semibold text-success mb-2">
                  <i className="bi bi-check-circle me-1" />
                  Caja abierta
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 btn-sm"
                  onClick={() => {
                    setCloseAmount("");
                    setShowCloseSessionModal(true);
                  }}
                >
                  <i className="bi bi-lock me-1" />
                  Cerrar Caja
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Abrir Caja */}
      {showOpenSessionModal && (
        <div className="modal fade show d-block cashier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="open-session-title">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="open-session-title" className="modal-title">Abrir Caja</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => { setShowOpenSessionModal(false); setOpenAmount(""); setError(null); }} />
              </div>
              <div className="modal-body">
                <label htmlFor="open-amount" className="form-label">Monto de apertura ($)</label>
                <input
                  id="open-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control form-control-lg"
                  placeholder="0.00"
                  value={openAmount}
                  onChange={(e) => setOpenAmount(e.target.value)}
                  aria-label="Monto de apertura"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOpenSessionModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" disabled={openingSession} onClick={handleOpenCaja}>
                  {openingSession ? "Abriendo..." : "Abrir Caja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cerrar Caja */}
      {showCloseSessionModal && (
        <div className="modal fade show d-block cashier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="close-session-title">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="close-session-title" className="modal-title">Cerrar Caja</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowCloseSessionModal(false)} />
              </div>
              <div className="modal-body">
                <label htmlFor="close-amount" className="form-label">Monto en caja al cierre ($)</label>
                <input
                  id="close-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control form-control-lg"
                  placeholder="0.00"
                  value={closeAmount}
                  onChange={(e) => setCloseAmount(e.target.value)}
                  aria-label="Monto en caja"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCloseSessionModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" disabled={closingSession} onClick={handleCloseCaja}>
                  {closingSession ? "Cerrando..." : "Cerrar Caja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Procesar Pago */}
      {showPaymentModal && (
        <div className="modal fade show d-block cashier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="payment-modal-title" className="modal-title">Procesar Pago</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowPaymentModal(false)} />
              </div>
              <div className="modal-body">
                <p className="mb-3">Total: <strong>${subtotal.toFixed(2)}</strong></p>

                <div className="mb-3">
                  <div className="btn-group w-100" role="group" aria-label="Modo de pago">
                    <button
                      type="button"
                      className={`btn ${paymentMode === "simple" ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setPaymentMode("simple")}
                    >
                      Pago único
                    </button>
                    <button
                      type="button"
                      className={`btn ${paymentMode === "mixed" ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setPaymentMode("mixed")}
                    >
                      Pago mixto
                    </button>
                  </div>
                </div>

                {paymentMode === "simple" ? (
                  <>
                    <label className="form-label">Método de pago</label>
                    <select
                      className="form-select"
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                      aria-label="Método de pago"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <label className="form-label">Repartir el total por método</label>
                    {PAYMENT_METHODS.map((m) => (
                      <div key={m.value} className="input-group">
                        <span className="input-group-text" style={{ minWidth: 100 }}>{m.label}</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          placeholder="0.00"
                          value={(mixedAmounts as Record<string, number>)[m.value] ?? ""}
                          onChange={(e) =>
                            setMixedAmounts((prev) => ({ ...prev, [m.value]: Number(e.target.value) || 0 }))
                          }
                          aria-label={`Monto en ${m.label}`}
                        />
                      </div>
                    ))}
                    <small className="text-muted">
                      Suma: ${(mixedAmounts.efectivo + mixedAmounts.tarjeta + mixedAmounts.transferencia).toFixed(2)}
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" disabled={processing} onClick={confirmPayment}>
                  {processing ? "Procesando..." : "Confirmar venta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Seleccionar producto del catálogo */}
      {showProductCatalog && (
        <div className="modal fade show d-block cashier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title">
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="catalog-modal-title" className="modal-title">Seleccionar producto</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => { setShowProductCatalog(false); setCatalogSearch(""); }} />
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Filtrar por nombre o código..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  autoFocus
                />
                {loadingProducts ? (
                  <div className="text-center py-4 text-muted">Cargando productos...</div>
                ) : (() => {
                  const filtered = allProducts.filter(
                    (p) =>
                      !catalogSearch.trim() ||
                      (p.name?.toLowerCase().includes(catalogSearch.toLowerCase()) ?? false) ||
                      (p.code?.toLowerCase().includes(catalogSearch.toLowerCase()) ?? false)
                  );
                  return (
                    <div className="list-group" style={{ maxHeight: 400, overflowY: "auto" }}>
                      {filtered.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          onClick={() => {
                            addToCart(p);
                            setShowProductCatalog(false);
                            setCatalogSearch("");
                          }}
                        >
                          <span>{p.name}</span>
                          <span className="text-muted small">
                            {p.code && <span className="me-2">{p.code}</span>}
                            ${(p.sale_price ?? 0).toFixed(2)}
                          </span>
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <div className="list-group-item text-muted text-center">No hay productos que coincidan</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
