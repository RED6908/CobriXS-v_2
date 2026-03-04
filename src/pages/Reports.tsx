import { useEffect, useState } from "react";
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
import { getProducts } from "../services/products.service";
import { getSales, getSalesSummary } from "../services/sales.service";
import type { Product, Sale } from "../types/database";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
);

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ salesCount: 0, totalAmount: 0, averageTicket: 0 });

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [salesData, productsData, summaryData] = await Promise.all([
          getSales(100),
          getProducts(),
          getSalesSummary(),
        ]);

        setSales(salesData);
        setProducts(productsData);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los reportes desde Supabase.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const salesTrendData = {
    labels: sales.slice(0, 7).reverse().map((sale) => new Date(sale.created_at).toLocaleDateString("es-MX")),
    datasets: [
      {
        label: "Ventas",
        data: sales.slice(0, 7).reverse().map((sale) => sale.total),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        tension: 0.4,
      },
    ],
  };

  const categories = Array.from(new Set(products.map((product) => product.category ?? "Sin categoría")));
  const categoryData = {
    labels: categories,
    datasets: [
      {
        data: categories.map(
          (category) => products.filter((product) => (product.category ?? "Sin categoría") === category).length,
        ),
        backgroundColor: ["#4c51bf", "#3182ce", "#38bdf8", "#059669", "#f59e0b", "#9333ea"],
      },
    ],
  };

  return (
    <div className="container-fluid">
      {loading && <div className="alert alert-info">Cargando reportes...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <StatCard title="Ventas Totales" value={`$${summary.totalAmount.toFixed(2)}`} change="Sincronizado" icon="bi-currency-dollar" positive />
        <StatCard title="Transacciones" value={`${summary.salesCount}`} change="Sincronizado" icon="bi-cart" positive />
        <StatCard title="Ticket Promedio" value={`$${summary.averageTicket.toFixed(2)}`} change="Sincronizado" icon="bi-graph-up" positive />
        <StatCard title="Productos" value={`${products.length}`} change="Sincronizado" icon="bi-box" positive />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Tendencia de Ventas</h5>
              <Line data={salesTrendData} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Productos por Categoría</h5>
              <Pie data={categoryData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  positive: boolean;
}

function StatCard({ title, value, change, icon, positive }: StatCardProps) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card h-100">
        <div className="card-body d-flex justify-content-between">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h4 className="fw-bold mb-1">{value}</h4>
            <small className={positive ? "text-success" : "text-danger"}>{change}</small>
          </div>
          <i className={`bi ${icon} fs-2 text-muted`} />
        </div>
      </div>
    </div>
  );
}
