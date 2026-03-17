import { useState, useEffect, useMemo } from "react";
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
import type { FC } from "react";
import { Link } from "react-router-dom";
import { getSalesByDay, getSalesReport } from "../services/reports.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function getDefaultRange(): { from: string; to: string; fromDate: string; toDate: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

const defaultRange = getDefaultRange();

/* ===== Types ===== */
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: string;
  positive: boolean;
}

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(defaultRange.fromDate);
  const [dateTo, setDateTo] = useState(defaultRange.toDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesByDay, setSalesByDay] = useState<Record<string, number>>({});
  const [reportData, setReportData] = useState<
    { total: number; sale_items?: { quantity: number }[] }[]
  >([]);

  const range = useMemo(() => ({
    from: `${dateFrom}T00:00:00.000Z`,
    to: `${dateTo}T23:59:59.999Z`,
  }), [dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    const from = range.from;
    const to = range.to;

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    Promise.all([
      getSalesByDay(from, to),
      getSalesReport(from, to),
    ])
      .then(([byDay, report]) => {
        if (cancelled) return;
        setSalesByDay(byDay);
        setReportData(report ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Error al cargar reportes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const stats = useMemo(() => {
    const totalSales = reportData.reduce((s, r) => s + (r.total ?? 0), 0);
    const count = reportData.length;
    const productsSold = reportData.reduce(
      (s, r) =>
        s +
        (r.sale_items ?? []).reduce((q, i) => q + (i.quantity ?? 0), 0),
      0
    );
    const avgTicket = count > 0 ? totalSales / count : 0;
    return {
      totalSales,
      count,
      productsSold,
      avgTicket,
    };
  }, [reportData]);

  const sortedDays = useMemo(() => {
    return Object.keys(salesByDay).sort();
  }, [salesByDay]);

  const salesTrendData = useMemo(
    () => ({
      labels: sortedDays.map((d) => {
        const [, m, day] = d.split("-");
        return `${day}/${m}`;
      }),
      datasets: [
        {
          label: "Ventas",
          data: sortedDays.map((d) => salesByDay[d] ?? 0),
          borderColor: "#6f6ad8",
          backgroundColor: "rgba(111,106,216,0.15)",
          tension: 0.4,
          fill: true,
        },
      ],
    }),
    [sortedDays, salesByDay]
  );

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

  if (loading && reportData.length === 0)
    return (
      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Reportes</li>
          </ol>
        </nav>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Reportes</li>
          </ol>
        </nav>
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container-fluid reports-page">
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Reportes</li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <label className="d-flex align-items-center gap-2">
          <span className="text-muted small">Desde</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Fecha desde"
          />
        </label>
        <label className="d-flex align-items-center gap-2">
          <span className="text-muted small">Hasta</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Fecha hasta"
          />
        </label>
      </div>

      {/* ===== Stats ===== */}
      <div className="row g-3 mb-4">
        <StatCard
          title="Ventas Totales"
          value={`$${stats.totalSales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          change="En el período seleccionado"
          icon="bi-currency-dollar"
          positive
        />
        <StatCard
          title="Transacciones"
          value={String(stats.count)}
          change="En el período seleccionado"
          icon="bi-cart"
          positive
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${stats.avgTicket.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          change="Por venta"
          icon="bi-graph-up"
          positive
        />
        <StatCard
          title="Productos Vendidos"
          value={String(stats.productsSold)}
          change="Unidades en el período"
          icon="bi-box"
          positive
        />
      </div>

      {/* ===== Tabs ===== */}
      <div className="d-flex gap-2 mb-4">
        <button type="button" className="btn btn-light fw-semibold">Dashboard</button>
        <button type="button" className="btn btn-outline-secondary">Ventas</button>
        <button type="button" className="btn btn-outline-secondary">Productos</button>
        <button type="button" className="btn btn-outline-secondary">Vendedores</button>
      </div>

      {/* ===== Charts ===== */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">
                Tendencia de Ventas {sortedDays.length ? `(${sortedDays.length} días)` : ""}
              </h5>
              {sortedDays.length > 0 ? (
                <Line data={salesTrendData} />
              ) : (
                <p className="text-muted mb-0">No hay ventas en el período seleccionado.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Ventas por Categoría</h5>
              <p className="text-muted small mb-0">
                Próximamente con datos reales por categoría de productos.
              </p>
              <Pie data={categoryData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  positive,
}) => (
  <div className="col-12 col-md-6 col-xl-3">
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted mb-1">{title}</p>
          <h4 className="fw-bold mb-1">{value}</h4>
          {change && (
            <small className={positive ? "text-success" : "text-danger"}>
              {change}
            </small>
          )}
        </div>
        <i className={`bi ${icon} fs-2 text-muted`} aria-hidden />
      </div>
    </div>
  </div>
);
