import { useState, useMemo, useCallback, useEffect } from "react";
import { useInventory } from "../hooks/useInventory";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { useStore } from "../context/StoreContext";
import {
  getSuggestions,
  createSuggestion,
  approveSuggestion,
  rejectSuggestion,
} from "../services/inventorySuggestions.service";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/PageHeader";
import type { InventorySuggestion } from "../types/database";

type Tab = "productos" | "movimientos" | "alertas" | "sugerencias";

export default function Inventory() {
  const { profile } = useAuth();
  const { currentStoreId } = useStore();
  const { products, movements, loading, error, stats, addMovement, refetch } =
    useInventory();
  const { success: toastSuccess, error: toastError } = useToast();
  const isAdmin = profile?.role === "admin";

  const [suggestions, setSuggestions] = useState<InventorySuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("productos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    type: "entrada" as "entrada" | "salida",
    quantity: 1,
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const data = await getSuggestions(
        currentStoreId,
        isAdmin ? "pendiente" : undefined,
        !isAdmin && user ? user.id : undefined
      );
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [currentStoreId, isAdmin]);

  useEffect(() => {
    if (activeTab === "sugerencias") loadSuggestions();
  }, [activeTab, loadSuggestions]);

  /* ===============================
     FILTRO PRODUCTOS
  =============================== */

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ===============================
     CATEGORÍAS DINÁMICAS
  =============================== */

  const categories = useMemo(() => {
    const grouped: Record<string, number> = {};

    products.forEach((p) => {
      const cat = p.category ?? "Sin categoría";
      grouped[cat] = (grouped[cat] || 0) + 1;
    });

    return grouped;
  }, [products]);

  /* ===============================
     GUARDAR MOVIMIENTO
  =============================== */

  const handleSaveMovement = useCallback(async () => {
    if (!form.product_id) {
      setFormError("Selecciona un producto");
      return;
    }

    if (form.quantity <= 0) {
      setFormError("Cantidad inválida");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await addMovement(
        form.product_id,
        form.type,
        form.quantity,
        form.description
      );

      setShowModal(false);
      toastSuccess("Movimiento registrado correctamente");
      setForm({
        product_id: "",
        type: "entrada",
        quantity: 1,
        description: "",
      });
    } catch {
      setFormError("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [form, addMovement, toastSuccess]);

  const handleSaveSuggestion = useCallback(async () => {
    if (!form.product_id) {
      setFormError("Selecciona un producto");
      return;
    }
    if (form.quantity <= 0) {
      setFormError("Cantidad inválida");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFormError("Debes iniciar sesión");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const product = products.find((p) => p.id === form.product_id);
      await createSuggestion(
        form.product_id,
        product?.store_id ?? currentStoreId ?? null,
        form.type,
        form.quantity,
        form.description,
        user.id
      );
      setShowSuggestionModal(false);
      setForm({ product_id: "", type: "entrada", quantity: 1, description: "" });
      toastSuccess("Sugerencia enviada. El administrador la revisará.");
      loadSuggestions();
    } catch {
      setFormError("Error al enviar sugerencia");
      toastError("Error al enviar sugerencia");
    } finally {
      setSaving(false);
    }
  }, [form, products, currentStoreId, toastSuccess, toastError, loadSuggestions]);

  const handleApprove = useCallback(
    async (s: InventorySuggestion) => {
      setSaving(true);
      try {
        await approveSuggestion(
          s.id,
          (await supabase.auth.getUser()).data.user!.id,
          s.product_id,
          s.store_id,
          s.type,
          s.quantity,
          s.description
        );
        toastSuccess("Sugerencia aprobada y movimiento aplicado");
        await refetch();
        loadSuggestions();
      } catch {
        toastError("Error al aprobar");
      } finally {
        setSaving(false);
      }
    },
    [toastSuccess, toastError, refetch, loadSuggestions]
  );

  const handleReject = useCallback(
    async (s: InventorySuggestion) => {
      setSaving(true);
      try {
        await rejectSuggestion(s.id, (await supabase.auth.getUser()).data.user!.id);
        toastSuccess("Sugerencia rechazada");
        loadSuggestions();
      } catch {
        toastError("Error al rechazar");
      } finally {
        setSaving(false);
      }
    },
    [toastSuccess, toastError, loadSuggestions]
  );

  /* ===============================
     LOADING / ERROR
  =============================== */

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="container-fluid">
      <PageHeader
        title="Gestión de Inventario"
        subtitle="Control completo de productos, stock y movimientos"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Inventario" }]}
      />

      <div className="row g-4 mb-4">
        <StatCard
          title="Productos Totales"
          value={stats.total}
          subtitle={`${Object.keys(categories).length} categorías`}
          icon="bi-box"
          color="primary"
        />
        <StatCard
          title="Alertas de Stock"
          value={stats.lowStock.length}
          subtitle="Stock menor a 10"
          icon="bi-exclamation-triangle"
          color="warning"
        />
        <StatCard
          title="Valor Total"
          value={`$${stats.totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          subtitle="Inventario actual"
          icon="bi-graph-up"
          color="success"
        />
        <StatCard
          title="Movimientos"
          value={stats.movementsCount}
          subtitle="Registros totales"
          icon="bi-activity"
          color="secondary"
        />
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {(["productos", "movimientos", "alertas", "sugerencias"] as Tab[]).map((tab) => (
          <li key={tab} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "productos"
                ? "Productos"
                : tab === "movimientos"
                ? "Movimientos"
                : tab === "alertas"
                ? "Alertas"
                : isAdmin
                ? "Sugerencias pendientes"
                : "Mis sugerencias"}
            </button>
          </li>
        ))}
      </ul>

      {/* Search + Button */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin ? (
          <button
            className="btn btn-primary ms-md-auto"
            onClick={() => {
              setForm({ product_id: "", type: "entrada", quantity: 1, description: "" });
              setFormError(null);
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1" />
            Nuevo Movimiento
          </button>
        ) : (
          <button
            className="btn btn-outline-primary ms-md-auto"
            onClick={() => {
              setForm({ product_id: "", type: "entrada", quantity: 1, description: "" });
              setFormError(null);
              setShowSuggestionModal(true);
            }}
          >
            <i className="bi bi-send me-1" />
            Sugerir Ajuste
          </button>
        )}
      </div>

      {/* PRODUCTOS TAB */}
      {activeTab === "productos" && (
        <>
          <div className="row g-3 mb-4">
            {Object.entries(categories).map(([cat, count]) => (
              <CategoryCard
                key={cat}
                title={cat}
                value={count}
                badge={
                  products.filter(
                    (p) => (p.category ?? "Sin categoría") === cat && p.stock < 10
                  ).length > 0
                    ? `${
                        products.filter(
                          (p) =>
                            (p.category ?? "Sin categoría") === cat &&
                            p.stock < 10
                        ).length
                      } bajo`
                    : undefined
                }
                icon="bi-funnel"
              />
            ))}
          </div>

          <div className="cobrixs-card">
            <div className="cobrixs-card-header">Listado de productos</div>
            <div className="cobrixs-card-body">
              <div className="table-responsive">
                <table className="table table-professional align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Código</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Precio compra</th>
                      <th>Precio venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          {search
                            ? "No hay productos que coincidan con la búsqueda."
                            : "No hay productos en el inventario."}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.name}</td>
                          <td>{p.code ?? "—"}</td>
                          <td>{p.category ?? "Sin categoría"}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span
                              className={`badge ${
                                p.stock <= 10 ? "bg-danger" : "bg-success"
                              }`}
                            >
                              {p.stock <= 10 ? "Bajo" : "Normal"}
                            </span>
                          </td>
                          <td>
                            ${(p.purchase_price ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            ${(p.sale_price ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "movimientos" && (
        <div className="cobrixs-card">
          <div className="cobrixs-card-header">Historial de movimientos</div>
          <div className="table-responsive">
            <table className="table table-professional align-middle mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                    <td>{m.products?.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          m.type === "entrada"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td>{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "sugerencias" && (
        <div className="cobrixs-card">
          <div className="cobrixs-card-header">
            {isAdmin ? "Sugerencias pendientes de aprobación" : "Mis sugerencias"}
          </div>
          <div className="cobrixs-card-body">
            {suggestionsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" />
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-muted mb-0">
                {isAdmin
                  ? "No hay sugerencias pendientes."
                  : "No has enviado sugerencias. Usa 'Sugerir Ajuste' para proponer cambios."}
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-professional align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Fecha</th>
                      {isAdmin && <th className="text-end">Acciones</th>}
                      {!isAdmin && <th>Estado</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.products?.name ?? "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              s.type === "entrada" ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {s.type}
                          </span>
                        </td>
                        <td>{s.quantity}</td>
                        <td>{new Date(s.created_at).toLocaleString("es-MX")}</td>
                        {isAdmin && (
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => handleApprove(s)}
                              disabled={saving}
                            >
                              Aprobar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleReject(s)}
                              disabled={saving}
                            >
                              Rechazar
                            </button>
                          </td>
                        )}
                        {!isAdmin && (
                          <td>
                            <span
                              className={`badge ${
                                s.status === "pendiente"
                                  ? "bg-warning"
                                  : s.status === "aprobado"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "alertas" && (
        <div className="cobrixs-card border-danger">
          <div className="cobrixs-card-header text-danger">
            <i className="bi bi-exclamation-triangle me-2" />
            Alertas de Stock
          </div>
          <div className="cobrixs-card-body">
            {stats.lowStock.length === 0 ? (
              <div className="text-success">
                No hay productos con stock bajo
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {stats.lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    {p.name}
                    <span className="badge bg-danger">
                      {p.stock} restantes
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Movimiento</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger py-2">{formError}</div>}

                <div className="mb-3">
                  <label className="form-label">Producto *</label>
                  <select
                    className="form-select"
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    aria-label="Seleccionar producto"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "entrada" | "salida" })}
                    aria-label="Tipo de movimiento"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    aria-label="Cantidad"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={handleSaveMovement}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuggestionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sugerir Ajuste de Inventario</h5>
                <button className="btn-close" onClick={() => setShowSuggestionModal(false)} aria-label="Cerrar" />
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger py-2">{formError}</div>}
                <p className="text-muted small mb-3">
                  Tu sugerencia será revisada por el administrador antes de aplicarse.
                </p>
                <div className="mb-3">
                  <label className="form-label">Producto *</label>
                  <select
                    className="form-select"
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    aria-label="Seleccionar producto"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "entrada" | "salida" })}
                    aria-label="Tipo"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    aria-label="Cantidad"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Motivo o descripción</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Opcional"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSuggestionModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" disabled={saving} onClick={handleSaveSuggestion}>
                  {saving ? "Enviando..." : "Enviar Sugerencia"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="stat-card h-100">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-secondary small mb-1">{title}</div>
            <h4 className="fw-bold mb-0">{value}</h4>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`stat-icon ${color}`}>
            <i className={`bi ${icon}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  value: number;
  badge?: string;
  icon: string;
}

function CategoryCard({ title, value, badge, icon }: CategoryCardProps) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <div className="cobrixs-card text-center h-100">
        <div className="cobrixs-card-body">
          <i className={`bi ${icon} fs-3 mb-2 d-block`} />
          <div className="fw-semibold">{title}</div>
          <h4 className="fw-bold mt-2">{value}</h4>
          {badge && <span className="badge bg-danger mt-2">{badge}</span>}
        </div>
      </div>
    </div>
  );
}