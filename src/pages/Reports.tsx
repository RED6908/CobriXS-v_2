import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Reports() {
  const salesTrendData = {
    labels: ["01/10", "02/10", "03/10", "04/10", "05/10", "06/10", "07/10"],
    datasets: [
      {
        label: "Ventas",
        data: [12000, 15000, 11000, 18500, 16500, 22000, 19500],
        borderColor: "#6f6ad8",
        backgroundColor: "rgba(111,106,216,0.15)",
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: ["Bebidas", "Despensa", "Lácteos", "Panadería", "Limpieza"],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "#4c51bf",
          "#3182ce",
          "#38bdf8",
          "#059669",
          "#f59e0b",
        ],
      },
    ],
  };

  return (
    <div className="container-fluid">

      {/* Stats */}
      <div className="row g-3 mb-4">

        <StatCard
          title="Ventas Totales"
          value="$59,330"
          change="+12.5% Este mes"
          icon="bi-currency-dollar"
          positive
        />

        <StatCard
          title="Transacciones"
          value="208"
          change="+8.2% Este mes"
          icon="bi-cart"
          positive
        />

        <StatCard
          title="Ticket Promedio"
          value="$285.24"
          change="+3.8% Este mes"
          icon="bi-graph-up"
          positive
        />

        <StatCard
          title="Productos Vendidos"
          value="435"
          change="-2.1% Este mes"
          icon="bi-box"
          positive={false}
        />

      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-light fw-semibold">Dashboard</button>
        <button className="btn btn-outline-secondary">Ventas</button>
        <button className="btn btn-outline-secondary">Productos</button>
        <button className="btn btn-outline-secondary">Vendedores</button>
      </div>

      {/* Charts */}
      <div className="row g-4">

        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">
                Tendencia de Ventas (7 días)
              </h5>
              <Line data={salesTrendData} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">
                Ventas por Categoría
              </h5>
              <Pie data={categoryData} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== Reusable Card ===== */
function StatCard({ title, value, change, icon, positive }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card h-100">
        <div className="card-body d-flex justify-content-between">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h4 className="fw-bold mb-1">{value}</h4>
            <small
              className={positive ? "text-success" : "text-danger"}
            >
              {change}
            </small>
          </div>
          <i className={`bi ${icon} fs-2 text-muted`} />
        </div>
      </div>
    </div>
  );
}
