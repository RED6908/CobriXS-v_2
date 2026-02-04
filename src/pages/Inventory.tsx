
export default function Inventory() {
  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestión de Inventario</h3>
        <p className="text-muted">
          Control completo de productos, stock y movimientos
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Productos Totales</span>
                <i className="bi bi-box text-primary" />
              </div>
              <h3 className="fw-bold mt-2">13</h3>
              <small className="text-muted">En 5 categorías</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Alertas de Stock</span>
                <i className="bi bi-exclamation-triangle text-danger" />
              </div>
              <h3 className="fw-bold mt-2">6</h3>
              <small className="text-muted">1 críticos</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Valor Total</span>
                <i className="bi bi-graph-up text-success" />
              </div>
              <h3 className="fw-bold mt-2">$4,735</h3>
              <small className="text-muted">Inventario actual</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Movimientos</span>
                <i className="bi bi-activity text-purple" />
              </div>
              <h3 className="fw-bold mt-2">5</h3>
              <small className="text-muted">Registros totales</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto">
        <button className="btn btn-light fw-semibold active">
          <i className="bi bi-box me-1" /> Productos
        </button>
        <button className="btn btn-light">
          <i className="bi bi-arrow-left-right me-1" /> Movimientos
        </button>
        <button className="btn btn-light">
          <i className="bi bi-exclamation-triangle me-1" /> Alertas (6)
        </button>
        <button className="btn btn-light">
          <i className="bi bi-bar-chart me-1" /> Análisis
        </button>
      </div>

      {/* Search + Button */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            placeholder="Buscar por nombre o código..."
          />
        </div>

        <button className="btn btn-primary ms-md-auto">
          <i className="bi bi-plus-circle me-1" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Categories */}
      <div className="row g-3">
        <CategoryCard
          title="Todos"
          value="13"
          badge="3 bajo"
          icon="bi-funnel"
          active
        />

        <CategoryCard
          title="Bebidas"
          value="4"
          badge="3 bajo"
          icon="bi-cup-straw"
          active
        />

        <CategoryCard
          title="Alimentos"
          value="4"
          badge="1 bajo"
          icon="bi-apple"
        />

        <CategoryCard
          title="Higiene"
          value="3"
          badge="1 bajo"
          icon="bi-stars"
        />

        <CategoryCard
          title="Hogar"
          value="2"
          badge="1 bajo"
          icon="bi-house"
        />

        <CategoryCard
          title="Otros"
          value="0"
          icon="bi-box"
        />
      </div>
    </div>
  );
}

/* ===== Category Card Component ===== */
interface CategoryCardProps {
  title: string;
  value: string;
  icon: string;
  badge?: string;   // opcional
  active?: boolean; // opcional
}

function CategoryCard({ title, value, badge, icon, active = false }: CategoryCardProps) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <div className={`card text-center h-100 ${active ? "border-primary" : ""}`}>
        <div className="card-body">
          <i className={`bi ${icon} fs-3 mb-2 d-block`} />
          <div className="fw-semibold">{title}</div>
          <h4 className="fw-bold mt-2">{value}</h4>

          {badge && (
            <span className="badge bg-danger mt-2">{badge}</span>
          )}
        </div>
      </div>
    </div>
  );
}