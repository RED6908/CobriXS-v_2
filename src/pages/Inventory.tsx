import { useState, useMemo, useCallback } from "react";
import { useInventory } from "../hooks/useInventory";

type Tab = "productos" | "movimientos" | "alertas";

export default function Inventory() {
  const { products, movements, loading, error, stats, addMovement } =
    useInventory();

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

  /* ===============================
     FILTRO PRODUCTOS
  =============================== */

/*   const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]); */

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
      setForm({
        product_id: "",
        type: "entrada",
        quantity: 1,
        description: "",
      });
    } catch (e) {
      setFormError("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [form, addMovement]);

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
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestión de Inventario</h3>
        <p className="text-muted">
          Control completo de productos, stock y movimientos
        </p>
      </div>

      {/* Stats Modernos */}
      <div className="row g-3 mb-4">
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
          color="danger"
        />

        <StatCard
          title="Valor Total"
          value={`$${stats.totalValue.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}`}
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
      <div className="d-flex gap-2 mb-4 overflow-auto">
        {(["productos", "movimientos", "alertas"] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`btn ${
              activeTab === tab ? "btn-primary" : "btn-light"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

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

        <button
          className="btn btn-primary ms-md-auto"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-1" />
          Nuevo Movimiento
        </button>
      </div>

      {/* PRODUCTOS TAB */}
      {activeTab === "productos" && (
        <div className="row g-3">
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
      )}

      {/* MOVIMIENTOS TAB */}
      {activeTab === "movimientos" && (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
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

      {/* ALERTAS TAB */}
      {activeTab === "alertas" && (
        <div className="card border-danger">
          <div className="card-body">
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

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Movimiento</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger">{formError}</div>
                )}

                <select
                  className="form-select mb-3"
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select mb-3"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "entrada" | "salida",
                    })
                  }
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>

                <input
                  type="number"
                  className="form-control mb-3"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: Number(e.target.value),
                    })
                  }
                />
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
    </div>
  );
}

/* ===== STAT CARD ===== */
function StatCard({ title, value, subtitle, icon, color }: any) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <span className="text-muted">{title}</span>
            <i className={`bi ${icon} text-${color}`} />
          </div>
          <h3 className="fw-bold mt-2">{value}</h3>
          <small className="text-muted">{subtitle}</small>
        </div>
      </div>
    </div>
  );
}

/* ===== CATEGORY CARD ===== */
function CategoryCard({ title, value, badge, icon }: any) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <div className="card text-center h-100">
        <div className="card-body">
          <i className={`bi ${icon} fs-3 mb-2 d-block`} />
          <div className="fw-semibold">{title}</div>
          <h4 className="fw-bold mt-2">{value}</h4>
          {badge && <span className="badge bg-danger mt-2">{badge}</span>}
        </div>
      </div>
    </div>
  );
}