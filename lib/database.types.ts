import type {
  InvoiceExtractionInsert,
  InvoiceExtractionRow,
  InvoiceExtractionUpdate
} from "@/lib/types";

export type Database = {
  public: {
    Tables: {
      invoice_extractions: {
        Row: InvoiceExtractionRow;
        Insert: InvoiceExtractionInsert;
        Update: Partial<InvoiceExtractionUpdate>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
