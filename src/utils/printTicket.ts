import type { CartItem } from "../hooks/useCashier";
import type { PaymentMethod } from "../types/database";

const METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  mixto: "Pago mixto",
};

export interface PrintTicketData {
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod | "mixto";
  paymentBreakdown?: Record<string, number>;
  saleId?: string;
  date?: Date;
}

export function printTicket(data: PrintTicketData) {
  const win = window.open("", "_blank", "width=300,height=500");
  if (!win) {
    console.warn("No se pudo abrir ventana de impresión");
    return;
  }

  const date = data.date ?? new Date();
  const lines: string[] = [
    "===================================",
    "         COBRIXS POS",
    "     Ticket de Venta",
    "===================================",
    `Fecha: ${date.toLocaleString("es-MX")}`,
    data.saleId ? `Folio: ${data.saleId.slice(0, 8)}` : "",
    "-----------------------------------",
    "PRODUCTO              CANT   TOTAL",
    "-----------------------------------",
  ];

  for (const item of data.items) {
    const name = item.product.name.slice(0, 18).padEnd(18);
    const qty = String(item.quantity).padStart(4);
    const subtotal = (item.quantity * (item.product.sale_price ?? 0)).toFixed(2);
    lines.push(`${name} ${qty} $${subtotal}`);
  }

  lines.push("-----------------------------------");
  lines.push(`TOTAL:                    $${data.total.toFixed(2)}`);
  lines.push("-----------------------------------");
  lines.push(`Pago: ${METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}`);

  if (data.paymentBreakdown && Object.keys(data.paymentBreakdown).length > 0) {
    for (const [method, amount] of Object.entries(data.paymentBreakdown)) {
      if (amount > 0) {
        lines.push(`  - ${METHOD_LABELS[method] ?? method}: $${amount.toFixed(2)}`);
      }
    }
  }

  lines.push("===================================");
  lines.push("    ¡Gracias por su compra!");
  lines.push("===================================");

  const content = lines.filter(Boolean).join("\n");

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket - CobriXS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      max-width: 280px;
    }
  </style>
</head>
<body>${content.replace(/\n/g, "<br>")}</body>
</html>`);
  win.document.close();

  win.onload = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
}
