import type {
  EditableInvoiceFields,
  ExtractedInvoice,
  InvoiceExtractionInsert,
  InvoiceExtractionRow,
  InvoiceExtractionUpdate
} from "@/lib/types";

export const invoiceExtractionColumns =
  "id,user_id,file_name,gst_number,invoice_number,company_name,invoice_date,total_amount,storage_path,created_at";

export function mapInvoiceRow(row: InvoiceExtractionRow): ExtractedInvoice {
  return {
    id: row.id,
    fileName: row.file_name,
    gstNumber: row.gst_number ?? "",
    invoiceNumber: row.invoice_number ?? "",
    companyName: row.company_name ?? "",
    date: row.invoice_date ?? "",
    totalAmount: row.total_amount ?? "",
    storagePath: row.storage_path ?? "",
    createdAt: row.created_at
  };
}

export function createInvoiceInsert({
  userId,
  fileName,
  gstNumber,
  invoiceNumber,
  companyName,
  date,
  totalAmount,
  storagePath
}: {
  userId: string;
  fileName: string;
  gstNumber: string;
  invoiceNumber: string;
  companyName: string;
  date: string;
  totalAmount: string;
  storagePath: string;
}): InvoiceExtractionInsert {
  return {
    user_id: userId,
    file_name: fileName,
    gst_number: gstNumber,
    invoice_number: invoiceNumber,
    company_name: companyName,
    invoice_date: date,
    total_amount: totalAmount,
    storage_path: storagePath
  };
}

export function createInvoiceUpdate(
  fields: EditableInvoiceFields
): InvoiceExtractionUpdate {
  return {
    gst_number: fields.gstNumber,
    invoice_number: fields.invoiceNumber,
    company_name: fields.companyName,
    invoice_date: fields.date,
    total_amount: fields.totalAmount
  };
}
