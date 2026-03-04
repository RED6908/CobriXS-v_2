import { useProducts } from "../hooks/useProducts";

export default function Dashboard() {
  const { products } = useProducts();

  const totalStock = products.reduce(
    (acc, p) => acc + p.stock,
    0
  );

  const lowStock = products.filter((p) => p.stock < 10);

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Productos en sistema</div>
              <h4 className="fw-bold">{products.length}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Stock total</div>
              <h4 className="fw-bold">{totalStock}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-warning shadow-sm">
        <div className="card-header text-warning fw-semibold">
          Productos con stock bajo
        </div>
        <ul className="list-group list-group-flush">
          {lowStock.length === 0 ? (
            <li className="list-group-item text-muted">
              Todo en orden 👍
            </li>
          ) : (
            lowStock.map((product) => (
              <li
                key={product.id}
                className="list-group-item d-flex justify-content-between"
              >
                {product.name}
                <span className="badge bg-danger">
                  {product.stock} restantes
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}