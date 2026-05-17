import type { ExtractedInvoice } from "@/lib/types";

const columns: Array<[keyof ExtractedInvoice, string]> = [
  ["fileName", "File Name"],
  ["gstNumber", "GST Number"],
  ["invoiceNumber", "Invoice Number"],
  ["companyName", "Company Name"],
  ["date", "Date"],
  ["totalAmount", "Total Amount"],
  ["createdAt", "Extracted At"]
];

function escapeCsv(value: string) {
  const normalized = value ?? "";
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function invoicesToCsv(invoices: ExtractedInvoice[]) {
  const header = columns.map(([, label]) => escapeCsv(label)).join(",");
  const rows = invoices.map((invoice) =>
    columns.map(([key]) => escapeCsv(invoice[key])).join(",")
  );

  return [header, ...rows].join("\n");
}
