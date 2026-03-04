import { useState, useMemo } from "react";
import { useProducts } from "../hooks/useProducts";
import { supabase } from "../lib/supabase";

export default function Products() {
  const { products, loading, error, refetch } = useProducts();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    code: "",
    stock: 0,
    purchase_price: 0,
    sale_price: 0,
    category: "",
  });

  /* =========================
     FILTRO BUSCADOR
  ========================== */

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  /* =========================
     GUARDAR PRODUCTO
  ========================== */

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      name: form.name,
      code: form.code || null,
      stock: Number(form.stock),
      purchase_price: Number(form.purchase_price),
      sale_price: Number(form.sale_price),
      category: form.category || null,
    };

    if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setShowModal(false);
    setForm({
      id: "",
      name: "",
      code: "",
      stock: 0,
      purchase_price: 0,
      sale_price: 0,
      category: "",
    });

    await refetch();
    setSaving(false);
  };

  /* =========================
     ELIMINAR
  ========================== */

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    await refetch();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h3 className="fw-bold">Catálogo de Productos</h3>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning">
          {lowStockProducts.length} productos con stock bajo
        </div>
      )}

      {/* SEARCH + ACTIONS */}
      <div className="d-flex justify-content-between mb-4">
        <input
          className="form-control w-50"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Nuevo Producto
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Stock</th>
                <th>Compra</th>
                <th>Venta</th>
                <th>Categoría</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.code ?? "-"}</td>
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
                    {p.purchase_price
                      ? `$${p.purchase_price.toFixed(2)}`
                      : "-"}
                  </td>
                  <td>
                    {p.sale_price
                      ? `$${p.sale_price.toFixed(2)}`
                      : "-"}
                  </td>
                  <td>{p.category ?? "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setForm({
                          id: p.id,
                          name: p.name,
                          code: p.code ?? "",
                          stock: p.stock,
                          purchase_price: p.purchase_price ?? 0,
                          sale_price: p.sale_price ?? 0,
                          category: p.category ?? "",
                        });
                        setShowModal(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No hay productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5 className="mb-3">
                {form.id ? "Editar Producto" : "Nuevo Producto"}
              </h5>

              <input
                className="form-control mb-2"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Código"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Precio Compra"
                value={form.purchase_price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchase_price: Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                className="form-control mb-3"
                placeholder="Precio Venta"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sale_price: Number(e.target.value),
                  })
                }
              />

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={handleSave}
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