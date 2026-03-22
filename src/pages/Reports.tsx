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
import { useStore } from "../context/StoreContext";
import { getSalesByDay, getSalesReport } from "../services/reports.service";
import { downloadReportCSV } from "../utils/downloadReport";
import PageHeader from "../components/PageHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function getDefaultRange() {
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

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: string;
  color: string;
}

export default function Reports() {
  const { currentStoreId } = useStore();
  const [dateFrom, setDateFrom] = useState(defaultRange.fromDate);
  const [dateTo, setDateTo] = useState(defaultRange.toDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesByDay, setSalesByDay] = useState<Record<string, number>>({});
  const [reportData, setReportData] = useState<
    Array<{
      id: string;
      total: number;
      created_at: string;
      payment_method?: string;
      sale_items?: Array<{ quantity: number; price: number; products?: { name?: string } | null }>;
    }>
  >([]);

  const range = useMemo(
    () => ({
      from: `${dateFrom}T00:00:00.000Z`,
      to: `${dateTo}T23:59:59.999Z`,
    }),
    [dateFrom, dateTo]
  );

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
      getSalesByDay(from, to, currentStoreId),
      getSalesReport(from, to, currentStoreId),
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
  }, [range.from, range.to, currentStoreId]);

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
    return { totalSales, count, productsSold, avgTicket };
  }, [reportData]);

  const sortedDays = useMemo(() => Object.keys(salesByDay).sort(), [salesByDay]);

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
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
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
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"],
      },
    ],
  };

  if (loading && reportData.length === 0)
    return (
      <div className="container-fluid">
        <PageHeader title="Reportes" breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Reportes" }]} />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container-fluid">
        <PageHeader title="Reportes" breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Reportes" }]} />
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container-fluid">
      <PageHeader
        title="Reportes"
        subtitle="Análisis de ventas y desempeño"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Reportes" }]}
      />

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <label className="d-flex align-items-center gap-2">
            <span className="text-secondary small">Desde</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Fecha desde"
            />
          </label>
          <label className="d-flex align-items-center gap-2">
            <span className="text-secondary small">Hasta</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Fecha hasta"
            />
          </label>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() =>
            downloadReportCSV(stats, salesByDay, reportData, dateFrom, dateTo)
          }
        >
          <i className="bi bi-download me-1" />
          Descargar CSV
        </button>
      </div>

      <div className="row g-4 mb-4">
        <StatCard
          title="Ventas Totales"
          value={`$${stats.totalSales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          icon="bi-currency-dollar"
          color="success"
        />
        <StatCard
          title="Transacciones"
          value={String(stats.count)}
          icon="bi-cart"
          color="primary"
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${stats.avgTicket.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          icon="bi-graph-up"
          color="primary"
        />
        <StatCard
          title="Productos Vendidos"
          value={String(stats.productsSold)}
          icon="bi-box"
          color="primary"
        />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="cobrixs-card h-100">
            <div className="cobrixs-card-header">
              Tendencia de Ventas {sortedDays.length ? `(${sortedDays.length} días)` : ""}
            </div>
            <div className="cobrixs-card-body">
              {sortedDays.length > 0 ? (
                <Line data={salesTrendData} />
              ) : (
                <p className="text-muted mb-0">No hay ventas en el período seleccionado.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="cobrixs-card h-100">
            <div className="cobrixs-card-header">Ventas por Categoría</div>
            <div className="cobrixs-card-body">
              <p className="text-muted small mb-3">
                Próximamente con datos reales por categoría.
              </p>
              <Pie data={categoryData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <div className="stat-card h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="text-secondary small mb-1">{title}</div>
          <h4 className="fw-bold mb-0">{value}</h4>
        </div>
        <div className={`stat-icon ${color}`}>
          <i className={`bi ${icon}`} />
        </div>
      </div>
    </div>
  </div>
);
