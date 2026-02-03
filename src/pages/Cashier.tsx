export default function Cashier() {
  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Panel de Cobro - CobriXS</h3>
          <p className="text-muted mb-0">
            Sistema profesional de punto de venta
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light">
            <i className="bi bi-search me-1" />
            Consultar Precio
          </button>

          <button className="btn btn-light">
            <i className="bi bi-three-dots-vertical" />
            Acciones Rápidas
          </button>

          <button className="btn btn-primary">
            <i className="bi bi-sliders me-1" />
            Opciones Avanzadas
          </button>
        </div>
      </div>

      {/* Caja Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Cajas de cobro:</span>
          <span className="badge bg-primary fs-6 px-3 py-2">
            <i className="bi bi-display me-1" />
            Caja 1
          </span>
        </div>

        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Nueva Caja
        </button>
      </div>

      {/* Main Layout */}
      <div className="row g-4">

        {/* Left Side */}
        <div className="col-12 col-xl-8">

          {/* Barcode Input */}
          <div className="input-group input-group-lg mb-3">
            <span className="input-group-text bg-white">
              <i className="bi bi-upc-scan fs-4" />
            </span>
            <input
              className="form-control"
              placeholder="Escanee código de barras o ingrese manualmente..."
            />
            <button className="btn btn-primary px-4">
              Agregar
            </button>
          </div>

          {/* Sale Options */}
          <button className="btn btn-light mb-3">
            <i className="bi bi-gear me-1" />
            Opciones de Venta
          </button>

          {/* Empty Cart */}
          <div className="card h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center text-muted py-5">
              <i className="bi bi-cart fs-1 mb-3" />
              <h5 className="fw-semibold">
                Escanee productos para iniciar la venta
              </h5>
              <p className="mb-0">Caja 1</p>
            </div>
          </div>

        </div>

        {/* Right Side */}
        <div className="col-12 col-xl-4">

          {/* Payment Summary */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">$0.00</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-uppercase">
                  Total a pagar
                </span>
                <span className="fs-3 fw-bold text-primary">
                  $0.00
                </span>
              </div>

              <button className="btn btn-primary w-100 py-3 fs-5">
                <i className="bi bi-credit-card me-1" />
                Procesar Pago
              </button>
            </div>
          </div>

          {/* Cash Session */}
          <div className="card border-warning bg-warning-subtle">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-x-circle text-warning fs-5" />
                <span className="fw-semibold">
                  Sin sesión de caja
                </span>
              </div>

              <button className="btn btn-outline-dark w-100">
                <i className="bi bi-box-arrow-in-right me-1" />
                Abrir Caja
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
