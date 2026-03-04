import { useState, useCallback } from "react";
import { useInventory } from "../hooks/useInventory";

type Tab = "productos" | "movimientos" | "alertas";

export default function Inventory() {
  const { products, movements, loading, error, stats, addMovement } =
    useInventory();

  const [activeTab, setActiveTab] = useState<Tab>("productos");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    type: "entrada" as "entrada" | "salida",
    quantity: 1,
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* ================================
     FILTROS
  ================================= */

  const categories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category ?? "Sin categoría"))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code ?? "").toLowerCase().includes(search.toLowerCase());

    const matchCat =
      categoryFilter === "Todos" ||
      (p.category ?? "Sin categoría") === categoryFilter;

    return matchSearch && matchCat;
  });

  /* ================================
     GUARDAR MOVIMIENTO
  ================================= */

  const handleSaveMovement = useCallback(async () => {
    if (!form.product_id) {
      setFormError("Selecciona un producto");
      return;
    }

    if (form.quantity <= 0) {
      setFormError("La cantidad debe ser mayor a 0");
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
      setFormError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [form, addMovement]);

  /* ================================
     LOADING / ERROR
  ================================= */

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  /* ================================
     RENDER
  ================================= */

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestión de Inventario</h3>
        <p className="text-muted mb-0">
          Control completo de productos, stock y movimientos
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Productos Totales</div>
              <h3 className="fw-bold">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Alertas Stock</div>
              <h3 className="fw-bold text-danger">
                {stats.lowStock.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Valor Total</div>
              <h3 className="fw-bold">
                $
                {stats.totalValue.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Movimientos</div>
              <h3 className="fw-bold">{stats.movementsCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        {(["productos", "movimientos", "alertas"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`btn ${
              activeTab === t ? "btn-primary" : "btn-light"
            }`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="d-flex gap-3 mb-4">
        <input
          className="form-control"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {activeTab === "productos" && (
          <select
            className="form-select w-auto"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}

        <button
          className="btn btn-primary ms-auto"
          onClick={() => setShowModal(true)}
        >
          Nuevo Movimiento
        </button>
      </div>

      {/* PRODUCTOS */}
      {activeTab === "productos" && (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.code ?? "-"}</td>
                    <td>{p.category ?? "Sin categoría"}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.stock <= 5 ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      $
                      {(p.sale_price ?? 0).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOVIMIENTOS */}
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
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
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
                    <td>{m.description ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALERTAS */}
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

                <textarea
                  className="form-control"
                  placeholder="Descripción"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
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