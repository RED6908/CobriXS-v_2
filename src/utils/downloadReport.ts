/**
 * Genera y descarga un reporte de ventas en formato CSV
 */
export function downloadReportCSV(
  stats: { totalSales: number; count: number; productsSold: number; avgTicket: number },
  salesByDay: Record<string, number>,
  reportData: Array<{
    id: string;
    total: number;
    created_at: string;
    payment_method?: string;
    sale_items?: Array<{
      quantity: number;
      price: number;
      products?: { name?: string } | null;
    }>;
  }>,
  dateFrom: string,
  dateTo: string
) {
  const rows: string[] = [];
  const sep = ",";
  const escape = (v: string | number) =>
    `"${String(v).replace(/"/g, '""')}"`;

  rows.push("REPORTE DE VENTAS - CobriXS");
  rows.push("");
  rows.push(`Período,${escape(dateFrom)} - ${escape(dateTo)}`);
  rows.push("");
  rows.push("RESUMEN");
  rows.push(["Métrica", "Valor"].join(sep));
  rows.push(
    ["Ventas Totales", `$${stats.totalSales.toFixed(2)}`].join(sep)
  );
  rows.push(["Transacciones", stats.count].join(sep));
  rows.push(
    ["Ticket Promedio", `$${stats.avgTicket.toFixed(2)}`].join(sep)
  );
  rows.push(["Productos Vendidos", stats.productsSold].join(sep));
  rows.push("");
  rows.push("VENTAS POR DÍA");
  rows.push(["Fecha", "Total ($)"].join(sep));
  for (const day of Object.keys(salesByDay).sort()) {
    rows.push([day, salesByDay[day].toFixed(2)].join(sep));
  }
  rows.push("");
  rows.push("DETALLE DE VENTAS");
  rows.push(
    ["ID", "Fecha", "Total", "Método de pago", "Items"].join(sep)
  );
  for (const sale of reportData) {
    const date = sale.created_at?.slice(0, 19).replace("T", " ") ?? "";
    const saleId = sale.id ?? "";
    const method = sale.payment_method ?? "";
    const itemsStr =
      (sale.sale_items ?? [])
        .map(
          (i) =>
            `${(i.products as { name?: string })?.name ?? "Producto"} x${i.quantity} $${(i.quantity * i.price).toFixed(2)}`
        )
        .join("; ") ?? "";
    rows.push(
      [
        saleId,
        date,
        sale.total.toFixed(2),
        method,
        escape(itemsStr),
      ].join(sep)
    );
  }

  const csv = "\uFEFF" + rows.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-ventas-${dateFrom}-${dateTo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
