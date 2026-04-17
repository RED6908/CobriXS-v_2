import { useState, useMemo } from "react";
import { useProducts } from "../hooks/useProducts";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/PageHeader";

export default function Products() {

  const { products, loading, error, refetch } = useProducts();
  const { success: toastSuccess, error: toastError } = useToast();

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

    if (!form.name) {
      toastError("El nombre es obligatorio");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      code: form.code || null,
      stock: Number(form.stock),
      purchase_price: Number(form.purchase_price),
      sale_price: Number(form.sale_price),
      category: form.category || null,
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
      toastError(error.message);
      setSaving(false);
      return;
    }

    setShowModal(false);
    toastSuccess(form.id ? "Producto actualizado" : "Producto creado");
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
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toastError(error.message);
      return;
    }
    toastSuccess("Producto eliminado");
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
      <PageHeader
        title="Catálogo de Productos"
        subtitle="Gestión del catálogo de productos disponibles"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Productos" }]}
      />

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {lowStockProducts.length} productos con stock bajo
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center mb-4">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar producto"
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ id: "", name: "", code: "", stock: 0, purchase_price: 0, sale_price: 0, category: "" }); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-1" />
          Nuevo Producto
        </button>
      </div>

      <div className="cobrixs-card">
        <div className="table-responsive">
          <table className="table table-professional align-middle mb-0">
            <thead>
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
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {

                          setForm({
                            id: product.id,
                            name: product.name,
                            code: product.code ?? "",
                            stock: product.stock,
                            purchase_price: product.purchase_price ?? 0,
                            sale_price: product.sale_price ?? 0,
                            category: product.category ?? "",
                          });

                          setShowModal(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${product.name}"?`)) handleDelete(product.id);
                        }}
                        aria-label="Eliminar producto"
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

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{form.id ? "Editar Producto" : "Nuevo Producto"}</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    className="form-control"
                    placeholder="Nombre del producto"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-label="Nombre"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Código</label>
                  <input
                    className="form-control"
                    placeholder="Código o SKU"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    aria-label="Código"
                  />
                </div>
                <div className="row g-2">
                  <div className="col-4">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      aria-label="Stock"
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Precio compra</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      step="0.01"
                      value={form.purchase_price}
                      onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })}
                      aria-label="Precio compra"
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Precio venta</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      step="0.01"
                      value={form.sale_price}
                      onChange={(e) => setForm({ ...form, sale_price: Number(e.target.value) })}
                      aria-label="Precio venta"
                    />
                  </div>
                </div>
                <div className="mb-0 mt-3">
                  <label className="form-label">Categoría</label>
                  <input
                    className="form-control"
                    placeholder="Ej. Bebidas, Despensa"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    aria-label="Categoría"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
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