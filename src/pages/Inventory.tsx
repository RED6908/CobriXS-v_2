import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import type { Product } from "../types/database";

type Tab = "productos" | "movimientos" | "alertas" | "analisis";

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
  const { products, movements, loading, error, stats, addMovement } =
    useInventory();

  const [activeTab, setActiveTab] = useState<Tab>("productos");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    type: "entrada" as "entrada" | "salida",
    quantity: 1,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      setForm({
        product_id: "",
        type: "entrada",
        quantity: 1,
        description: "",
      });
    } catch {
      setFormError("Error al guardar el movimiento");
    } finally {
      setSaving(false);
    }
  }, [form, addMovement]);

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

  const categoryKeys = ["Todos", ...Object.keys(categories).filter((k) => k !== "Todos")];

  return (
    <div className="inventory-page">
      {/* Breadcrumb */}
      <nav className="text-muted small mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <span>Inventario</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Escritorio
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestión de Inventario</h3>
        <p className="text-muted mb-0">
          Control completo de productos, stock y movimientos
        </p>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small mb-1">Productos Totales</p>
                <h4 className="fw-bold mb-0">{stats.total}</h4>
                <small className="text-muted">
                  En {Object.keys(categories).filter((k) => k !== "Todos").length || 1} categorías
                </small>
              </div>
              <div className="stat-card-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-box fs-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small mb-1">Alertas de Stock</p>
                <h4 className="fw-bold mb-0">{stats.lowStock.length}</h4>
                <small className="text-muted">
                  {criticalCount > 0 ? `${criticalCount} críticos` : "Stock bajo"}
                </small>
              </div>
              <div className="stat-card-icon bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-exclamation-triangle fs-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small mb-1">Valor Total</p>
                <h4 className="fw-bold mb-0">
                  ${stats.totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </h4>
                <small className="text-muted">Inventario actual</small>
              </div>
              <div className="stat-card-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-graph-up fs-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small mb-1">Movimientos</p>
                <h4 className="fw-bold mb-0">{stats.movementsCount}</h4>
                <small className="text-muted">Registros totales</small>
              </div>
              <div className="stat-card-icon bg-secondary bg-opacity-10 text-secondary">
                <i className="bi bi-activity fs-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {(
          [
            { id: "productos", label: "Productos", icon: "bi-box" },
            { id: "movimientos", label: "Movimientos", icon: "bi-arrow-left-right" },
            { id: "alertas", label: `Alertas (${stats.lowStock.length})`, icon: "bi-exclamation-triangle" },
            { id: "analisis", label: "Análisis", icon: "bi-bar-chart" },
          ] as const
        ).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-tab d-inline-flex align-items-center gap-2 ${
              activeTab === id ? "active" : ""
            }`}
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
          >
            <i className={`bi ${icon}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Search + Actions (only when Productos tab) */}
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
          <div className="d-flex gap-2">
            <Link to="/productos" className="btn btn-primary">
              <i className="bi bi-box me-1" />
              Nuevo Producto
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-1" />
              Nuevo Movimiento
            </button>
          </div>
        </div>
      )}

      {/* Category filter cards (Productos tab) */}
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

      {/* Productos tab: table */}
      {activeTab === "productos" && (
        <div className="card shadow-sm">
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
                  {filteredProducts.map((p) => {
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
                          {p.sale_price != null
                            ? `$${p.sale_price}`
                            : "-"}
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
                            to={`/productos`}
                            className="btn btn-sm btn-light"
                            title="Ver producto"
                            aria-label="Ver producto"
                          >
                            <i className="bi bi-eye" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movimientos tab */}
      {activeTab === "movimientos" && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">
                <i className="bi bi-arrow-left-right me-2" />
                Historial de movimientos
              </h6>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-circle me-1" />
                Nuevo Movimiento
              </button>
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
                              m.type === "entrada"
                                ? "bg-success"
                                : "bg-danger"
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

      {/* Alertas tab */}
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

      {/* Análisis tab (placeholder) */}
      {activeTab === "analisis" && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            <i className="bi bi-bar-chart fs-1 mb-3 d-block" />
            <p className="mb-0">Análisis de inventario próximamente</p>
          </div>
        </div>
      )}

      {/* Modal Nuevo Movimiento */}
      {showModal && (
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
                  onClick={handleSaveMovement}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
