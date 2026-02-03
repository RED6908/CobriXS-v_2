import { useProducts } from "../hooks/useProducts";

export default function Products() {
  const { products, loading, error } = useProducts();

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
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Catálogo de Productos</h3>
        <p className="text-muted">
          Gestión del catálogo de productos disponibles
        </p>
      </div>

      {/* Alert */}
      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>
            <strong>Alerta:</strong> {lowStockProducts.length} productos con stock bajo
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">

        {/* Search */}
        <div className="input-group w-100 w-md-50">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto o código..."
          />
        </div>

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="bi bi-file-earmark-excel me-1" />
            Exportar Excel
          </button>

          <button className="btn btn-primary">
            <i className="bi bi-box me-1" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Stock</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Categoría</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const isLowStock = product.stock <= 5;

                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.code ?? "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          isLowStock
                            ? "bg-warning text-dark"
                            : "bg-primary"
                        }`}
                      >
                        {isLowStock ? "Bajo" : "Normal"}
                      </span>
                    </td>
                    <td>
                      {product.purchase_price
                        ? `$${product.purchase_price.toFixed(2)}`
                        : "-"}
                    </td>
                    <td>
                      {product.sale_price
                        ? `$${product.sale_price.toFixed(2)}`
                        : "-"}
                    </td>
                    <td>{product.category ?? "-"}</td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay productos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
