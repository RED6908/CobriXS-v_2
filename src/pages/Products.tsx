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
    category_id: "",
  });

  /* =========================
     FILTRO
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
     GUARDAR
  ========================== */

  const handleSave = async () => {

    if (!form.name) return alert("El nombre es obligatorio");

    setSaving(true);

    const payload = {
      name: form.name,
      code: form.code || null,
      stock: Number(form.stock),
      purchase_price: Number(form.purchase_price),
      sale_price: Number(form.sale_price),
      category_id: form.category_id || null,
    };

    let error;

    if (form.id) {
      ({ error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", form.id));
    } else {
      ({ error } = await supabase
        .from("products")
        .insert(payload));
    }

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setShowModal(false);

    setForm({
      id: "",
      name: "",
      code: "",
      stock: 0,
      purchase_price: 0,
      sale_price: 0,
      category_id: "",
    });

    await refetch();
    setSaving(false);
  };

  /* =========================
     ELIMINAR
  ========================== */

  const handleDelete = async (id: string) => {

    if (!confirm("¿Eliminar producto?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await refetch();
  };

  /* ========================= */

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
        <h3 className="fw-bold mb-1">Catálogo de Productos</h3>
        <p className="text-muted">
          Gestión del catálogo de productos disponibles
        </p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning mb-4">
          ⚠ {lowStockProducts.length} productos con stock bajo
        </div>
      )}

      <div className="d-flex justify-content-between mb-4">

        <input
          type="text"
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

      <div className="card shadow-sm">
        <div className="table-responsive">

          <table className="table align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Stock</th>
                <th>Compra</th>
                <th>Venta</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product) => {

                const isLowStock = product.stock <= 5;

                return (
                  <tr key={product.id}>

                    <td>{product.name}</td>

                    <td>{product.code ?? "-"}</td>

                    <td>
                      <span className={`badge ${isLowStock ? "bg-warning" : "bg-success"}`}>
                        {product.stock}
                      </span>
                    </td>

                    <td>
                      {product.purchase_price
                        ? `$${product.purchase_price}`
                        : "-"}
                    </td>

                    <td>
                      {product.sale_price
                        ? `$${product.sale_price}`
                        : "-"}
                    </td>

                    <td>

                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {

                          setForm({
                            id: product.id,
                            name: product.name,
                            code: product.code ?? "",
                            stock: product.stock,
                            purchase_price: product.purchase_price ?? 0,
                            sale_price: product.sale_price ?? 0,
                            category_id: product.category_id ?? "",
                          });

                          setShowModal(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}

      {showModal && (

        <div className="modal fade show d-block">

          <div className="modal-dialog">

            <div className="modal-content p-4">

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
                placeholder="Precio compra"
                value={form.purchase_price}
                onChange={(e) =>
                  setForm({ ...form, purchase_price: Number(e.target.value) })
                }
              />

              <input
                type="number"
                className="form-control mb-3"
                placeholder="Precio venta"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: Number(e.target.value) })
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