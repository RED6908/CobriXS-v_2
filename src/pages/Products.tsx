import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products.service";
import { getProviders } from "../services/providers.service";
import type { Product, Provider } from "../types/database";

const CATEGORIES = ["Bebidas", "Alimentos", "Higiene", "Hogar", "Otros"];
const UNITS = ["Pieza", "Kg", "Litro", "Caja", "Paquete", "Metro"];
const PRODUCT_TYPES = ["Unidad", "Granel", "Servicio"];

const emptyForm = {
  id: "",
  name: "",
  code: "",
  category_id: "Bebidas",
  unit: "Pieza",
  product_type: "Unidad",
  stock: 0,
  min_stock: 0,
  max_stock: 0,
  location: "",
  purchase_price: 0,
  sale_price: 0,
  profit_percentage: 0,
  provider_id: "",
};

export default function Products() {
  const { products, loading, error, refetch } = useProducts();
  const [providers, setProviders] = useState<Provider[]>([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Load providers for modal and for table (Proveedor column)
  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  const providerNames: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    providers.forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [providers]);

  const [sortBy, setSortBy] = useState<"name" | "code" | "stock" | "purchase_price" | "sale_price">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (providerNames[p.provider_id ?? ""]?.toLowerCase().includes(search.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortBy === "name") { va = a.name; vb = b.name; }
      else if (sortBy === "code") { va = a.code ?? ""; vb = b.code ?? ""; }
      else if (sortBy === "stock") { va = a.stock; vb = b.stock; }
      else if (sortBy === "purchase_price") { va = a.purchase_price ?? 0; vb = b.purchase_price ?? 0; }
      else if (sortBy === "sale_price") { va = a.sale_price ?? 0; vb = b.sale_price ?? 0; }
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return list;
  }, [products, search, sortBy, sortAsc, providerNames]);

  const lowStockProducts = products.filter((p) => (p.min_stock ?? 10) > p.stock);
  const lowStockCount = lowStockProducts.length;

  const handleExportExcel = () => {
    const headers = ["Producto", "C├│digo", "Stock", "Precio Compra", "Precio Venta", "Proveedor"];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.code ?? "",
      p.stock,
      p.purchase_price ?? "",
      p.sale_price ?? "",
      providerNames[p.provider_id ?? ""] ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogo-productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: typeof sortBy) => {
    setSortBy(field);
    setSortAsc((prev) => (sortBy === field ? !prev : true));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    if (!form.name.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      // Payload with only columns from the base products table (no min_stock, location, etc.)
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        stock: Number(form.stock),
        purchase_price: Number(form.purchase_price) || null,
        sale_price: Number(form.sale_price) || null,
        category: form.category_id.trim() || null,
      };

      if (form.id) {
        await updateProduct(form.id, payload as Partial<Omit<Product, "id" | "created_at">>);
      } else {
        await createProduct(payload as Omit<Product, "id" | "created_at">);
      }

      setShowModal(false);
      resetForm();
      setSaving(false);
      refetch().catch(() => {});
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Error al guardar el producto";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("┬┐Eliminar producto?")) return;
    setErrorMessage(null);
    try {
      await deleteProduct(id);
      await refetch();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error al eliminar el producto"
      );
    }
  };

  const openEdit = (product: Product) => {
    const cost = product.purchase_price ?? 0;
    const sale = product.sale_price ?? 0;
    const marginPct =
      cost > 0 ? (((sale - cost) / cost) * 100) : 0;
    setForm({
      id: product.id,
      name: product.name,
      code: product.code ?? "",
      category_id: product.category ?? "Bebidas",
      unit: product.unit ?? "Pieza",
      product_type: product.product_type ?? "Unidad",
      stock: product.stock,
      min_stock: product.min_stock ?? 0,
      max_stock: product.max_stock ?? 0,
      location: product.location ?? "",
      purchase_price: cost,
      sale_price: sale,
      profit_percentage: marginPct,
      provider_id: product.provider_id ?? "",
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Cargando productos...</p>
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
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <nav className="text-muted small mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-archive me-1" />
            Productos
          </li>
          <li className="breadcrumb-item">
            <i className="bi bi-display me-1" />
            Escritorio
          </li>
        </ol>
      </nav>

      <div className="mb-3">
        <h3 className="fw-bold mb-1">Cat├ílogo de Productos</h3>
        <p className="text-muted mb-0">
          Gesti├│n del cat├ílogo de productos disponibles
        </p>
      </div>

      {lowStockCount > 0 && (
        <div className="alert alert-warning mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2 fs-5" />
          <span>Alerta: {lowStockCount} productos con stock bajo</span>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-2 mb-4">
        <div className="input-group flex-grow-1">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            id="products-search"
            type="search"
            className="form-control"
            placeholder="Buscar producto, c├│digo o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar producto, c├│digo o proveedor"
          />
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light border"
            onClick={handleExportExcel}
          >
            <i className="bi bi-file-earmark-excel me-1" />
            Exportar Excel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="bi bi-box me-1" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>
                    <button type="button" className="btn btn-link p-0 text-dark text-decoration-none fw-semibold" onClick={() => toggleSort("name")}>
                      Producto <i className={`bi bi-arrow-down-up ms-1 small ${sortBy === "name" ? "opacity-100" : "opacity-50"}`} />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="btn btn-link p-0 text-dark text-decoration-none fw-semibold" onClick={() => toggleSort("code")}>
                      C├│digo <i className={`bi bi-arrow-down-up ms-1 small ${sortBy === "code" ? "opacity-100" : "opacity-50"}`} />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="btn btn-link p-0 text-dark text-decoration-none fw-semibold" onClick={() => toggleSort("stock")}>
                      Stock <i className={`bi bi-arrow-down-up ms-1 small ${sortBy === "stock" ? "opacity-100" : "opacity-50"}`} />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="btn btn-link p-0 text-dark text-decoration-none fw-semibold" onClick={() => toggleSort("purchase_price")}>
                      Precio Compra <i className={`bi bi-arrow-down-up ms-1 small ${sortBy === "purchase_price" ? "opacity-100" : "opacity-50"}`} />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="btn btn-link p-0 text-dark text-decoration-none fw-semibold" onClick={() => toggleSort("sale_price")}>
                      Precio Venta <i className={`bi bi-arrow-down-up ms-1 small ${sortBy === "sale_price" ? "opacity-100" : "opacity-50"}`} />
                    </button>
                  </th>
                  <th className="fw-semibold">Proveedor</th>
                  <th className="text-end fw-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const minStock = product.min_stock ?? 10;
                  const isLowStock = product.stock < minStock;
                  return (
                    <tr key={product.id}>
                      <td className="fw-semibold">{product.name}</td>
                      <td>{product.code ?? "-"}</td>
                      <td>
                        <span className={`badge rounded-pill ${isLowStock ? "bg-secondary" : "bg-primary"}`}>
                          {product.stock} {isLowStock ? "Bajo" : "Normal"}
                        </span>
                      </td>
                      <td>
                        {product.purchase_price != null
                          ? `$${Number(product.purchase_price).toFixed(2)}`
                          : "-"}
                      </td>
                      <td>
                        {product.sale_price != null
                          ? `$${Number(product.sale_price).toFixed(2)}`
                          : "-"}
                      </td>
                      <td>{product.provider_id ? (providerNames[product.provider_id] ?? "-") : "-"}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-1"
                          onClick={() => openEdit(product)}
                          title="Editar"
                          aria-label="Editar producto"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(product.id)}
                          title="Eliminar"
                          aria-label="Eliminar producto"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal
          form={form}
          setForm={setForm}
          providers={providers}
          errorMessage={errorMessage}
          saving={saving}
          isEdit={!!form.id}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          onClear={resetForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ===== Product Modal (two columns, design match) ===== */
type ProductFormState = typeof emptyForm;

function ProductModal({
  form,
  setForm,
  providers,
  errorMessage,
  saving,
  isEdit,
  onClose,
  onClear,
  onSave,
}: {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  providers: Provider[];
  errorMessage: string | null;
  saving: boolean;
  isEdit: boolean;
  onClose: () => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const cost = form.purchase_price || 0;
  const sale = form.sale_price || 0;
  const marginPct =
    cost > 0 ? (((sale - cost) / cost) * 100) : 0;
  const profitFromPct = cost * (form.profit_percentage / 100);

  return (
    <div
      className="modal fade show d-block products-modal-overlay"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-4 position-relative">
          <button
            type="button"
            className="btn btn-link position-absolute top-0 end-0 p-2 text-dark text-decoration-none products-modal-close-btn"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" />
          </button>
          <div className="mb-2">
            <h5 id="product-modal-title" className="mb-1 pe-4">
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h5>
            <p className="text-muted small mb-0">
              Completa la informaci├│n del producto
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
            noValidate
          >
            <div className="row g-3">
              {/* Left column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="product-name" className="form-label fw-semibold">
                    Nombre del producto <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Coca Cola 600ml"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    aria-required="true"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="product-category" className="form-label fw-semibold">
                    Categor├¡a <span className="text-danger">*</span>
                  </label>
                  <select
                    id="product-category"
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category_id: e.target.value }))
                    }
                    aria-label="Categor├¡a"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-unit" className="form-label fw-semibold">
                    Unidad de medida <span className="text-danger">*</span>
                  </label>
                  <select
                    id="product-unit"
                    className="form-select"
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    aria-label="Unidad de medida"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-min-stock" className="form-label fw-semibold">
                    Stock m├¡nimo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-min-stock"
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.min_stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        min_stock: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="product-purchase" className="form-label fw-semibold">
                    Precio de costo <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id="product-purchase"
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={form.purchase_price || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          purchase_price: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-sale" className="form-label fw-semibold">
                    Precio de venta <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id="product-sale"
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={form.sale_price || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sale_price: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <p className="text-muted small mb-0">
                    Margen calculado: {marginPct.toFixed(2)}%
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-location" className="form-label fw-semibold">
                    Ubicaci├│n en almac├®n <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-location"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Pasillo A - Estante 1"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="product-code" className="form-label fw-semibold">
                    C├│digo de barras <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-code"
                    type="text"
                    className="form-control"
                    placeholder="Ej: 7501055363087"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="product-type" className="form-label fw-semibold">
                    Tipo de producto <span className="text-danger">*</span>
                  </label>
                  <select
                    id="product-type"
                    className="form-select"
                    value={form.product_type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_type: e.target.value }))
                    }
                    aria-label="Tipo de producto"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-stock" className="form-label fw-semibold">
                    Stock inicial <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="product-max-stock" className="form-label fw-semibold">
                    Stock m├íximo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-max-stock"
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.max_stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        max_stock: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="product-profit-pct" className="form-label fw-semibold">
                    Porcentaje de ganancia <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      id="product-profit-pct"
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={form.profit_percentage || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          profit_percentage: Number(e.target.value) || 0,
                        }))
                      }
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <p className="text-muted small mb-0">
                    Ganancia: ${profitFromPct.toFixed(2)}
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="product-provider" className="form-label fw-semibold">
                    Proveedor <span className="text-danger">*</span>
                  </label>
                  <select
                    id="product-provider"
                    className="form-select"
                    value={form.provider_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, provider_id: e.target.value }))
                    }
                    aria-label="Proveedor"
                  >
                    <option value="">Selecciona un proveedor</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light border"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-light border"
                onClick={onClear}
              >
                Limpiar datos
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar"
                    : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
