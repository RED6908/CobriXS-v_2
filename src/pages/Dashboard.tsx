export default function Dashboard() {
  return (
    <>
      {/* Alert */}
      <div className="alert alert-success d-flex align-items-center mb-4">
        <i className="bi bi-display fs-4 me-3"></i>
        <div>
          <strong>Modo Escritorio:</strong>
          <div className="small">
            Acceso completo a todos los módulos, incluyendo el Panel de Cobro.
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-4 mb-4">
        {[
          ["Ventas del día", "$15,450", "currency-dollar"],
          ["Productos vendidos", "127", "cart"],
          ["Productos en stock", "1,234", "box"],
          ["Usuarios activos", "8", "people"],
        ].map(([title, value, icon]) => (
          <div className="col-md-3" key={title}>
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <div className="text-muted small">{title}</div>
                  <h4 className="fw-bold">{value}</h4>
                </div>
                <i className={`bi bi-${icon} fs-2 text-primary`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lists */}
      <div className="row g-4">
        {/* Ventas */}
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="bi bi-cart me-2" />
              Ventas recientes
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                #001 – 10:30 <strong>$45.50</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                #002 – 10:15 <strong>$28.75</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                #003 – 09:45 <strong>$67.20</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Stock bajo */}
        <div className="col-lg-5">
          <div className="card border-warning shadow-sm h-100">
            <div className="card-header fw-semibold text-warning">
              <i className="bi bi-exclamation-triangle me-2" />
              Stock bajo
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                Coca Cola 600ml
                <span className="badge bg-danger">5 restantes</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Pan Bimbo
                <span className="badge bg-danger">12 restantes</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Leche Lala
                <span className="badge bg-danger">8 restantes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}