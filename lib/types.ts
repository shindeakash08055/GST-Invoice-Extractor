export type ExtractedInvoice = {
  id: string;
  fileName: string;
  gstNumber: string;
  invoiceNumber: string;
  companyName: string;
  date: string;
  totalAmount: string;
  storagePath: string;
  createdAt: string;
};

export type ExtractInvoiceResponse = {
  invoice: ExtractedInvoice;
};

export type EditableInvoiceFields = Pick<
  ExtractedInvoice,
  "gstNumber" | "invoiceNumber" | "companyName" | "date" | "totalAmount"
>;

export type InvoiceExtractionRow = {
  id: string;
  user_id: string;
  file_name: string;
  gst_number: string | null;
  invoice_number: string | null;
  company_name: string | null;
  invoice_date: string | null;
  total_amount: string | null;
  storage_path: string | null;
  created_at: string;
};

export type InvoiceExtractionInsert = {
  user_id: string;
  file_name: string;
  gst_number: string;
  invoice_number: string;
  company_name: string;
  invoice_date: string;
  total_amount: string;
  storage_path: string;
};

export type InvoiceExtractionUpdate = {
  gst_number: string;
  invoice_number: string;
  company_name: string;
  invoice_date: string;
  total_amount: string;
};
