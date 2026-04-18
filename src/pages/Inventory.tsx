import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
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
import type { Product, InventorySuggestion } from "../types/database";

type Tab = "productos" | "movimientos" | "alertas" | "sugerencias" | "analisis";

/** Tarjetas del tab Análisis: `badge` y `highlight` son opcionales (evita uniones incompatibles en TS). */
type InventoryAnalisisCard = {
  id: string;
  title: string;
  value: string;
  icon: string;
  badge?: string;
  highlight?: boolean;
};

const CATEGORY_ICONS: Record<string, string> = {
  Todos: "bi-funnel",
  Bebidas: "bi-cup-hot",
  Alimentos: "bi-apple",
  Higiene: "bi-stars",
  Hogar: "bi-house",
  Otros: "bi-box",
  "Sin categoría": "bi-tag",
};

function getCategoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] ?? "bi-box";
}

const LOW_STOCK_THRESHOLD_DEFAULT = 10;
const CRITICAL_STOCK = 2;

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
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [showModal, setShowModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    type: "entrada" as "entrada" | "salida",
    quantity: 1,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    if (activeTab === "sugerencias") void loadSuggestions();
  }, [activeTab, loadSuggestions]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== "Todos") {
      list = list.filter(
        (p) => (p.category ?? "Sin categoría") === categoryFilter
      );
    }
    return list;
  }, [products, search, categoryFilter]);

  const categories = useMemo(() => {
    const grouped: Record<string, number> = { Todos: products.length };
    products.forEach((p) => {
      const cat = p.category ?? "Sin categoría";
      grouped[cat] = (grouped[cat] || 0) + 1;
    });
    return grouped;
  }, [products]);

  const lowStockByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const min = p.min_stock ?? LOW_STOCK_THRESHOLD_DEFAULT;
      if (p.stock < min) {
        const cat = p.category ?? "Sin categoría";
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const criticalCount = useMemo(
    () => products.filter((p) => p.stock <= CRITICAL_STOCK).length,
    [products]
  );

  const analisisCards = useMemo((): InventoryAnalisisCard[] => {
    const categoryQty = Object.keys(categories).filter((k) => k !== "Todos").length;
    return [
      {
        id: "skus",
        title: "Productos",
        value: String(stats.total),
        icon: "bi-box-seam",
        highlight: true,
      },
      {
        id: "below_min",
        title: "Stock bajo",
        value: String(stats.lowStock.length),
        icon: "bi-exclamation-triangle",
        badge:
          criticalCount > 0
            ? `${criticalCount} crítico${criticalCount === 1 ? "" : "s"}`
            : undefined,
      },
      {
        id: "categories",
        title: "Categorías",
        value: String(categoryQty),
        icon: "bi-diagram-3",
      },
      {
        id: "valor",
        title: "Valor inventario",
        value: `$${stats.totalValue.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}`,
        icon: "bi-cash-stack",
      },
      {
        id: "movs",
        title: "Movimientos",
        value: String(stats.movementsCount),
        icon: "bi-arrow-left-right",
      },
    ];
  }, [
    categories,
    stats.total,
    stats.lowStock.length,
    stats.totalValue,
    stats.movementsCount,
    criticalCount,
  ]);

  const isLowStock = (p: Product) =>
    p.stock < (p.min_stock ?? LOW_STOCK_THRESHOLD_DEFAULT);

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
      await refetch();
    } catch {
      setFormError("Error al guardar el movimiento");
    } finally {
      setSaving(false);
    }
  }, [form, addMovement, toastSuccess, refetch]);

  const handleSaveSuggestion = useCallback(async () => {
    if (!form.product_id) {
      setFormError("Selecciona un producto");
      return;
    }
    if (form.quantity <= 0) {
      setFormError("Cantidad inválida");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      void loadSuggestions();
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
        void loadSuggestions();
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
        void loadSuggestions();
      } catch {
        toastError("Error al rechazar");
      } finally {
        setSaving(false);
      }
    },
    [toastSuccess, toastError, loadSuggestions]
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const categoryKeys = [
    "Todos",
    ...Object.keys(categories).filter((k) => k !== "Todos"),
  ];

  const categoryCount = Object.keys(categories).filter((k) => k !== "Todos").length;

  return (
    <div className="container-fluid inventory-page">
      <PageHeader
        title="Gestión de Inventario"
        subtitle="Control completo de productos, stock y movimientos"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Inventario" }]}
      />

      <div className="row g-4 mb-4">
        <StatCard
          title="Productos Totales"
          value={stats.total}
          subtitle={`En ${categoryCount || 1} categorías`}
          icon="bi-box"
          color="primary"
        />
        <StatCard
          title="Alertas de Stock"
          value={stats.lowStock.length}
          subtitle={
            criticalCount > 0
              ? `${criticalCount} críticos · stock bajo`
              : "Stock bajo"
          }
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

      <ul className="nav nav-tabs mb-4 flex-wrap">
        {(
          [
            ["productos", "Productos"],
            ["movimientos", "Movimientos"],
            ["alertas", `Alertas (${stats.lowStock.length})`],
            [
              "sugerencias",
              isAdmin ? "Sugerencias pendientes" : "Mis sugerencias",
            ],
            ["analisis", "Análisis"],
          ] as const
        ).map(([tab, label]) => (
          <li key={tab} className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "productos" && (
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-white">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar producto por nombre o código"
            />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/productos" className="btn btn-primary">
              <i className="bi bi-box me-1" />
              Nuevo Producto
            </Link>
            {isAdmin ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setForm({
                    product_id: "",
                    type: "entrada",
                    quantity: 1,
                    description: "",
                  });
                  setFormError(null);
                  setShowModal(true);
                }}
              >
                <i className="bi bi-plus-circle me-1" />
                Nuevo Movimiento
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  setForm({
                    product_id: "",
                    type: "entrada",
                    quantity: 1,
                    description: "",
                  });
                  setFormError(null);
                  setShowSuggestionModal(true);
                }}
              >
                <i className="bi bi-send me-1" />
                Sugerir Ajuste
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "productos" && (
        <div className="row g-3 mb-4">
          {categoryKeys.map((cat) => {
            const count = categories[cat] ?? 0;
            const lowInCat = lowStockByCategory[cat] ?? 0;
            const isActive = categoryFilter === cat;
            return (
              <div key={cat} className="col-6 col-md-4 col-lg-2">
                <button
                  type="button"
                  className={`card w-100 text-center h-100 category-card border ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ background: "white" }}
                >
                  <div className="card-body py-3">
                    <div
                      className="category-card-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isActive ? undefined : "#f8f9fa",
                      }}
                    >
                      <i className={`bi ${getCategoryIcon(cat)}`} />
                    </div>
                    <div className="fw-semibold small">{cat}</div>
                    <h5 className="fw-bold mt-1 mb-0">{count}</h5>
                    {lowInCat > 0 && (
                      <span className="badge bg-danger mt-1 rounded-pill">
                        {lowInCat} bajo
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "productos" && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">
                {categoryFilter === "Todos"
                  ? "Todos los Productos"
                  : `Productos: ${categoryFilter}`}
              </h6>
              <span className="text-muted small">
                {filteredProducts.length} productos encontrados
              </span>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Stock Mín</th>
                    <th>Precio</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th className="text-end">Acc</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        {search || categoryFilter !== "Todos"
                          ? "No hay productos que coincidan con los filtros."
                          : "No hay productos en el inventario."}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const low = isLowStock(p);
                      const min = p.min_stock ?? "-";
                      return (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.name}</td>
                          <td className="text-muted small">{p.code ?? "-"}</td>
                          <td>{p.category ?? "Sin categoría"}</td>
                          <td>{p.stock} pza</td>
                          <td>{min === "-" ? "-" : `${min} pza`}</td>
                          <td>
                            {p.sale_price != null ? `$${p.sale_price}` : "-"}
                          </td>
                          <td className="text-muted small">
                            {p.location ?? "-"}
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill ${
                                low ? "bg-primary" : "bg-secondary"
                              }`}
                            >
                              {low ? "Bajo" : "Normal"}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link
                              to="/productos"
                              className="btn btn-sm btn-light"
                              title="Ver producto"
                              aria-label="Ver producto"
                            >
                              <i className="bi bi-eye" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "movimientos" && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">
                <i className="bi bi-arrow-left-right me-2" />
                Historial de movimientos
              </h6>
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setForm({
                      product_id: "",
                      type: "entrada",
                      quantity: 1,
                      description: "",
                    });
                    setFormError(null);
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-1" />
                  Nuevo Movimiento
                </button>
              )}
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No hay movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          {new Date(m.created_at).toLocaleString("es-MX")}
                        </td>
                        <td>{m.products?.name ?? "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.type === "entrada" ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td>{m.quantity}</td>
                        <td className="text-muted small">
                          {m.description ?? "-"}
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

      {activeTab === "alertas" && (
        <div className="card shadow-sm border-danger">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">
              <i className="bi bi-exclamation-triangle text-danger me-2" />
              Productos con stock bajo
            </h6>
            {stats.lowStock.length === 0 ? (
              <p className="text-success mb-0">
                No hay productos con stock bajo
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {stats.lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span className="fw-semibold">{p.name}</span>
                    <span className="badge bg-danger">
                      {p.stock} restantes
                      {p.stock <= CRITICAL_STOCK && " (crítico)"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
                  : "No has enviado sugerencias. Usa «Sugerir Ajuste» para proponer cambios."}
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
                        <td>
                          {new Date(s.created_at).toLocaleString("es-MX")}
                        </td>
                        {isAdmin && (
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-success me-1"
                              onClick={() => void handleApprove(s)}
                              disabled={saving}
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => void handleReject(s)}
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

      {activeTab === "analisis" && (
        <div className="row g-3">
          {analisisCards.map((card) => (
            <AnalisisSummaryCard key={card.id} card={card} />
          ))}
        </div>
      )}

      {showModal && isAdmin && (
        <div
          className="modal fade show d-block inventory-modal-overlay"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="movement-modal-title"
        >
          <div className="modal-dialog">
            <div className="modal-content position-relative">
              <div className="modal-header">
                <h5 id="movement-modal-title" className="modal-title">
                  Nuevo Movimiento
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                  }}
                />
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger py-2">{formError}</div>
                )}
                <div className="mb-3">
                  <label htmlFor="mov-product" className="form-label">
                    Producto
                  </label>
                  <select
                    id="mov-product"
                    className="form-select"
                    value={form.product_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_id: e.target.value }))
                    }
                    aria-label="Seleccionar producto"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="mov-type" className="form-label">
                    Tipo
                  </label>
                  <select
                    id="mov-type"
                    className="form-select"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as "entrada" | "salida",
                      }))
                    }
                    aria-label="Tipo de movimiento"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="mov-qty" className="form-label">
                    Cantidad
                  </label>
                  <input
                    id="mov-qty"
                    type="number"
                    min={1}
                    className="form-control"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: Number(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="mov-desc" className="form-label">
                    Descripción (opcional)
                  </label>
                  <input
                    id="mov-desc"
                    type="text"
                    className="form-control"
                    placeholder="Ej. Ajuste por conteo"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={() => void handleSaveMovement()}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuggestionModal && !isAdmin && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestion-modal-title"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="suggestion-modal-title" className="modal-title">
                  Sugerir Ajuste de Inventario
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSuggestionModal(false)}
                  aria-label="Cerrar"
                />
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger py-2">{formError}</div>
                )}
                <p className="text-muted small mb-3">
                  Tu sugerencia será revisada por el administrador antes de
                  aplicarse.
                </p>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sug-product">
                    Producto *
                  </label>
                  <select
                    id="sug-product"
                    className="form-select"
                    value={form.product_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_id: e.target.value }))
                    }
                    aria-label="Seleccionar producto"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sug-type">
                    Tipo
                  </label>
                  <select
                    id="sug-type"
                    className="form-select"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as "entrada" | "salida",
                      }))
                    }
                    aria-label="Tipo"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sug-qty">
                    Cantidad
                  </label>
                  <input
                    id="sug-qty"
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: Number(e.target.value) || 1,
                      }))
                    }
                    aria-label="Cantidad"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sug-desc">
                    Motivo o descripción
                  </label>
                  <input
                    id="sug-desc"
                    type="text"
                    className="form-control"
                    placeholder="Opcional"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSuggestionModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={() => void handleSaveSuggestion()}
                >
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

function AnalisisSummaryCard({ card }: { card: InventoryAnalisisCard }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
      <div
        className={`card h-100 shadow-sm ${
          card.highlight ? "border border-primary border-2" : ""
        }`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div className="min-w-0">
              <div className="text-secondary small mb-1">{card.title}</div>
              <h4 className="fw-bold mb-0 text-break">{card.value}</h4>
              {card.badge != null && card.badge !== "" && (
                <span className="badge bg-danger bg-opacity-10 text-danger mt-2">
                  {card.badge}
                </span>
              )}
            </div>
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 ${
                card.highlight ? "bg-primary bg-opacity-10 text-primary" : "bg-light text-secondary"
              }`}
              style={{ width: 44, height: 44 }}
            >
              <i className={`bi ${card.icon} fs-5`} aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
