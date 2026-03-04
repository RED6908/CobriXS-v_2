import { useEffect, useState } from "react";
import { getProviders } from "../services/providers.service";
import type { Provider } from "../types/database";

export default function SupplierPayments() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true);
        const data = await getProviders();
        setProviders(data);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar proveedores desde Supabase.");
      } finally {
        setLoading(false);
      }
    }

    loadProviders();
  }, []);

  const totalBalance = providers.reduce((acc, provider) => acc + provider.balance, 0);
  const providersUpToDate = providers.filter((provider) => provider.balance <= 0).length;

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Pagos a Proveedores</h3>
          <p className="text-muted mb-0">Información real cargada desde Supabase</p>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando proveedores...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <SummaryCard title="Saldo Total Pendiente" value={`$${totalBalance.toFixed(2)}`} icon="bi-currency-dollar" />
        <SummaryCard title="Proveedores" value={`${providers.length}`} icon="bi-buildings" />
        <SummaryCard title="Proveedores al día" value={`${providersUpToDate}`} icon="bi-check-circle" />
      </div>

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
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id}>
                    <td>
                      <strong>{provider.name}</strong>
                    </td>
                    <td>{provider.email ?? "-"}</td>
                    <td>{provider.phone ?? "-"}</td>
                    <td className="fw-semibold">${provider.balance.toFixed(2)}</td>
                    <td>
                      {provider.balance <= 0 ? (
                        <span className="badge bg-success">Pagado</span>
                      ) : (
                        <span className="badge bg-danger">Adeudo</span>
                      )}
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No hay proveedores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
}

function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="col-12 col-md-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 text-muted mb-1">
            <i className={`bi ${icon} fs-5`} />
            {title}
          </div>
          <h3 className="fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}
