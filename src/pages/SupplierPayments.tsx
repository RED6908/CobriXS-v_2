export default function SupplierPayments() {
  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Pagos a Proveedores</h3>
          <p className="text-muted mb-0">
            Registrar, descontar y dar seguimiento a pagos
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light">
            <i className="bi bi-building me-1" />
            Nuevo Proveedor
          </button>

          <button className="btn btn-primary">
            <i className="bi bi-plus-lg me-1" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted mb-1">
                <i className="bi bi-currency-dollar fs-5" />
                Saldo Total Pendiente
              </div>
              <h3 className="fw-bold">$23,751.25</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted mb-1">
                <i className="bi bi-buildings fs-5" />
                Proveedores
              </div>
              <h3 className="fw-bold">3</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted mb-1">
                <i className="bi bi-check-circle text-success fs-5" />
                Proveedores al día
              </div>
              <h3 className="fw-bold">1</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-light fw-semibold">
          Proveedores
        </button>
        <button className="btn btn-outline-secondary">
          Historial de Pagos
        </button>
      </div>

      {/* Providers Table */}
      <div className="card">
        <div className="card-body">

          <h5 className="fw-semibold mb-3">
            <i className="bi bi-list-ul me-1" />
            Lista de Proveedores
          </h5>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Proveedor</th>
                  <th>RFC</th>
                  <th>Contacto</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>
                    <strong>Distribuidora La Popular</strong>
                    <div className="text-muted small">
                      ventas@lapopular.com
                    </div>
                  </td>
                  <td>DLP850101ABC</td>
                  <td>
                    Juan Pérez
                    <div className="text-muted small">555-0101</div>
                  </td>
                  <td className="fw-semibold">$15,000.50</td>
                  <td>
                    <span className="badge bg-danger">
                      $15,000.50
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm">
                      Editar
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Abarrotes El Sureste</strong>
                    <div className="text-muted small">
                      compras@elsureste.com
                    </div>
                  </td>
                  <td>AES920201DEF</td>
                  <td>
                    María González
                    <div className="text-muted small">555-0202</div>
                  </td>
                  <td className="fw-semibold">$8,750.75</td>
                  <td>
                    <span className="badge bg-danger">
                      $8,750.75
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm">
                      Editar
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Productos Frescos SA</strong>
                    <div className="text-muted small">
                      contacto@frescos.com
                    </div>
                  </td>
                  <td>PFS880301GHT</td>
                  <td>
                    Carlos López
                    <div className="text-muted small">555-0303</div>
                  </td>
                  <td className="fw-semibold">$0.00</td>
                  <td>
                    <span className="badge bg-success">
                      <i className="bi bi-check-lg me-1" />
                      Pagado
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm">
                      Editar
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
}
