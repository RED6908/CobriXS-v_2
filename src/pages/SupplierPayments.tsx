import { useState, useEffect, useMemo } from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
} from "../services/providers.service";
import { useAuth } from "../hooks/useAuth";
import {
  getPayments,
  registerPayment,
} from "../services/providerPayments.service";
import type { Provider, ProviderPayment } from "../types/database";
import PageHeader from "../components/PageHeader";

type Tab = "proveedores" | "historial";

export default function SupplierPayments() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [providers, setProviders] = useState<Provider[]>([]);
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("proveedores");

  const [showNewProviderModal, setShowNewProviderModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const [providerForm, setProviderForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    provider_id: "",
    amount: "",
    method: "",
    reference: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const provs = await getProviders();
      setProviders(provs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proveedores");
      setProviders([]);
    }
    try {
      const pays = await getPayments();
      setPayments(pays);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPaymentsAmount = useMemo(
    () => payments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
    [payments]
  );

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!providerForm.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      await createProvider({
        name: providerForm.name.trim(),
        email: providerForm.email.trim() || null,
        phone: providerForm.phone.trim() || null,
      });
      setShowNewProviderModal(false);
      setProviderForm({ name: "", email: "", phone: "" });
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al crear proveedor");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    setFormError(null);
    if (!providerForm.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      await updateProvider(editingProvider.id, {
        name: providerForm.name.trim(),
        email: providerForm.email.trim() || null,
        phone: providerForm.phone.trim() || null,
      });
      setShowEditProviderModal(false);
      setEditingProvider(null);
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: Provider) => {
    setEditingProvider(p);
    setProviderForm({
      name: p.name,
      email: p.email ?? "",
      phone: p.phone ?? "",
    });
    setFormError(null);
    setShowEditProviderModal(true);
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!paymentForm.provider_id) {
      setFormError("Selecciona un proveedor.");
      return;
    }
    const amount = Number(paymentForm.amount);
    if (!(amount > 0)) {
      setFormError("El monto debe ser mayor a 0.");
      return;
    }
    setSaving(true);
    try {
      await registerPayment(paymentForm.provider_id, amount, {
        method: paymentForm.method.trim() || undefined,
        reference: paymentForm.reference.trim() || undefined,
        notes: paymentForm.notes.trim() || undefined,
      });
      setShowPaymentModal(false);
      setPaymentForm({ provider_id: "", amount: "", method: "", reference: "", notes: "" });
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al registrar pago");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid supplier-payments-page">
      <PageHeader
        title="Pagos a Proveedores"
        subtitle={isAdmin ? "Registrar y dar seguimiento a pagos" : "Consulta de proveedores y pagos"}
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Proveedores" }]}
      />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div />
        {isAdmin && (
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              setProviderForm({ name: "", email: "", phone: "" });
              setFormError(null);
              setShowNewProviderModal(true);
            }}
          >
            <i className="bi bi-building me-1" />
            Nuevo Proveedor
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPaymentForm({ provider_id: "", amount: "", method: "", reference: "", notes: "" });
              setFormError(null);
              setShowPaymentModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1" />
            Registrar Pago
          </button>
        </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3 d-flex align-items-center justify-content-between" role="alert">
          <span>{error}</span>
          <button type="button" className="btn-close btn-sm" aria-label="Cerrar" onClick={() => setError(null)} />
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small mb-1">Total pagado</div>
                <h4 className="fw-bold mb-0">${totalPaymentsAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="stat-icon success">
                <i className="bi bi-currency-dollar" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small mb-1">Proveedores</div>
                <h4 className="fw-bold mb-0">{providers.length}</h4>
              </div>
              <div className="stat-icon primary">
                <i className="bi bi-buildings" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small mb-1">Pagos registrados</div>
                <h4 className="fw-bold mb-0">{payments.length}</h4>
              </div>
              <div className="stat-icon secondary">
                <i className="bi bi-clock-history" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "proveedores" ? "active" : ""}`}
            onClick={() => setActiveTab("proveedores")}
          >
            Proveedores
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "historial" ? "active" : ""}`}
            onClick={() => setActiveTab("historial")}
          >
            Historial de Pagos
          </button>
        </li>
      </ul>

      {activeTab === "proveedores" && (
        <div className="cobrixs-card">
          <div className="cobrixs-card-header">Lista de Proveedores</div>
          <div className="cobrixs-card-body p-0">
          <div className="table-responsive">
            <table className="table table-professional align-middle mb-0">
              <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Teléfono</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">
                        No hay proveedores. Agrega uno con &quot;Nuevo Proveedor&quot;.
                      </td>
                    </tr>
                  ) : (
                    providers.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          {p.email && (
                            <div className="text-muted small">{p.email}</div>
                          )}
                        </td>
                        <td>{p.phone ?? "-"}</td>
                        <td className="text-end">
                          {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEdit(p)}
                          >
                            Editar
                          </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "historial" && (
        <div className="cobrixs-card">
          <div className="cobrixs-card-header">Historial de Pagos</div>
          <div className="cobrixs-card-body p-0">
          <div className="table-responsive">
            <table className="table table-professional align-middle mb-0">
              <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay pagos registrados.
                      </td>
                    </tr>
                  ) : (
                    payments.map((pay) => (
                      <tr key={pay.id}>
                        <td>{new Date(pay.payment_date || pay.created_at).toLocaleString("es-MX")}</td>
                        <td>{pay.providers?.name ?? "-"}</td>
                        <td className="fw-semibold">
                          ${(pay.amount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </td>
                        <td>{pay.method ?? "-"}</td>
                        <td>{pay.reference ?? "-"}</td>
                        <td className="text-muted small">{pay.notes ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Proveedor */}
      {showNewProviderModal && (
        <div className="modal fade show d-block supplier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Proveedor</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowNewProviderModal(false)} />
              </div>
              <form onSubmit={handleCreateProvider}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input type="text" className="form-control" value={providerForm.name} onChange={(e) => setProviderForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={providerForm.email} onChange={(e) => setProviderForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-control" value={providerForm.phone} onChange={(e) => setProviderForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowNewProviderModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Crear"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Proveedor */}
      {showEditProviderModal && editingProvider && (
        <div className="modal fade show d-block supplier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Proveedor</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => { setShowEditProviderModal(false); setEditingProvider(null); }} />
              </div>
              <form onSubmit={handleUpdateProvider}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input type="text" className="form-control" value={providerForm.name} onChange={(e) => setProviderForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={providerForm.email} onChange={(e) => setProviderForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-control" value={providerForm.phone} onChange={(e) => setProviderForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowEditProviderModal(false); setEditingProvider(null); }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPaymentModal && (
        <div className="modal fade show d-block supplier-modal-overlay" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Pago</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowPaymentModal(false)} />
              </div>
              <form onSubmit={handleRegisterPayment}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Proveedor *</label>
                    <select className="form-select" value={paymentForm.provider_id} onChange={(e) => setPaymentForm((f) => ({ ...f, provider_id: e.target.value }))} required>
                      <option value="">Seleccionar proveedor</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Monto ($) *</label>
                    <input type="number" min="0.01" step="0.01" className="form-control" value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Método</label>
                    <input type="text" className="form-control" value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} placeholder="Ej. Efectivo, Transferencia" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Referencia</label>
                    <input type="text" className="form-control" value={paymentForm.reference} onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))} placeholder="Opcional" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <input type="text" className="form-control" value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Opcional" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Registrando..." : "Registrar Pago"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
