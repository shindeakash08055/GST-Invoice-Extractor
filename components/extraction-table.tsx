"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  Eye,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Table2,
  Trash2,
  X
} from "lucide-react";
import { invoicesToCsv } from "@/lib/csv";
import type { EditableInvoiceFields, ExtractedInvoice } from "@/lib/types";

type ExtractionTableProps = {
  invoices: ExtractedInvoice[];
  busyInvoiceId?: string | null;
  onDeleteInvoice: (id: string) => Promise<boolean>;
  onUpdateInvoice: (
    id: string,
    fields: EditableInvoiceFields
  ) => Promise<boolean>;
  onViewInvoiceFile: (invoice: ExtractedInvoice) => Promise<boolean>;
};

const emptyDraft: EditableInvoiceFields = {
  gstNumber: "",
  invoiceNumber: "",
  companyName: "",
  date: "",
  totalAmount: ""
};

export function ExtractionTable({
  invoices,
  busyInvoiceId,
  onDeleteInvoice,
  onUpdateInvoice,
  onViewInvoiceFile
}: ExtractionTableProps) {
  const [exportMessage, setExportMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableInvoiceFields>(emptyDraft);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          invoice.fileName,
          invoice.gstNumber,
          invoice.invoiceNumber,
          invoice.companyName
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const invoiceDate = getDateKey(invoice.date);
      const matchesStart = !startDate || (invoiceDate && invoiceDate >= startDate);
      const matchesEnd = !endDate || (invoiceDate && invoiceDate <= endDate);

      return matchesSearch && Boolean(matchesStart) && Boolean(matchesEnd);
    });
  }, [endDate, invoices, searchTerm, startDate]);

  const hasFilters = Boolean(searchTerm.trim() || startDate || endDate);

  function exportCsv() {
    if (invoices.length === 0) {
      setExportMessage("Extract at least one invoice before exporting.");
      return;
    }

    if (filteredInvoices.length === 0) {
      setExportMessage("No matching rows to export.");
      return;
    }

    const csv = `\uFEFF${invoicesToCsv(filteredInvoices)}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gst-invoice-extractions${hasFilters ? "-filtered" : ""}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage(
      `CSV exported with ${filteredInvoices.length} row${filteredInvoices.length === 1 ? "" : "s"}.`
    );
  }

  function startEditing(invoice: ExtractedInvoice) {
    setEditingId(invoice.id);
    setDraft({
      gstNumber: invoice.gstNumber,
      invoiceNumber: invoice.invoiceNumber,
      companyName: invoice.companyName,
      date: invoice.date,
      totalAmount: invoice.totalAmount
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function saveEdit(id: string) {
    const didSave = await onUpdateInvoice(id, draft);
    if (didSave) cancelEditing();
  }

  async function deleteInvoice(invoice: ExtractedInvoice) {
    const confirmed = window.confirm(
      `Delete the extraction for "${invoice.fileName}"?`
    );
    if (!confirmed) return;

    if (editingId === invoice.id) cancelEditing();
    await onDeleteInvoice(invoice.id);
  }

  function updateDraft(key: keyof EditableInvoiceFields, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  }

  function clearFilters() {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setExportMessage("");
  }

  return (
    <section className="mt-6 rounded-xl border border-ink/10 bg-white shadow-panel">
      <div className="flex flex-col gap-4 border-b border-ink/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-normal">Extracted data</h2>
          <p className="mt-1 text-sm text-ink/60">
            Review, edit, delete, or export saved invoice rows.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 px-4 py-2 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {exportMessage ? (
        <p className="border-b border-ink/10 bg-brand-soft px-5 py-3 text-sm font-semibold text-brand-dark">
          {exportMessage}
        </p>
      ) : null}

      {invoices.length === 0 ? (
        <div className="grid min-h-56 place-items-center px-5 py-10 text-center">
          <div>
            <Table2 className="mx-auto h-10 w-10 text-brand" aria-hidden="true" />
            <p className="mt-4 font-bold">No invoices extracted yet</p>
            <p className="mt-1 text-sm text-ink/60">
              Your extracted GST invoice fields will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-ink/10 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-ink/55">
                  Search
                </span>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Company, GST, invoice number, or file"
                    className="w-full rounded-lg border border-ink/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-ink/55">
                  From
                </span>
                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-lg border border-ink/10 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft lg:w-44"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-ink/55">
                  To
                </span>
                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-lg border border-ink/10 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft lg:w-44"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 px-4 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
            <p className="mt-3 text-xs font-semibold text-ink/55">
              Showing {filteredInvoices.length} of {invoices.length} saved rows
            </p>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="grid min-h-48 place-items-center px-5 py-10 text-center">
              <div>
                <Search className="mx-auto h-10 w-10 text-brand" aria-hidden="true" />
                <p className="mt-4 font-bold">No matching invoices</p>
                <p className="mt-1 text-sm text-ink/60">
                  Clear filters or try another search.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="bg-ink text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">File</th>
                    <th className="px-4 py-3 font-semibold">GST number</th>
                    <th className="px-4 py-3 font-semibold">Invoice number</th>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Total amount</th>
                    <th className="px-4 py-3 font-semibold">Extracted</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {filteredInvoices.map((invoice) => {
                    const isEditing = editingId === invoice.id;
                    const isBusy = busyInvoiceId === invoice.id;

                    return (
                      <tr key={invoice.id} className="align-top">
                        <td className="max-w-56 truncate px-4 py-3 font-semibold">
                          {invoice.fileName}
                        </td>
                        <EditableCell
                          isEditing={isEditing}
                          value={isEditing ? draft.gstNumber : invoice.gstNumber}
                          placeholder="GST number"
                          onChange={(value) => updateDraft("gstNumber", value)}
                        />
                        <EditableCell
                          isEditing={isEditing}
                          value={
                            isEditing ? draft.invoiceNumber : invoice.invoiceNumber
                          }
                          placeholder="Invoice number"
                          onChange={(value) => updateDraft("invoiceNumber", value)}
                        />
                        <EditableCell
                          isEditing={isEditing}
                          value={
                            isEditing ? draft.companyName : invoice.companyName
                          }
                          placeholder="Company name"
                          onChange={(value) => updateDraft("companyName", value)}
                        />
                        <EditableCell
                          isEditing={isEditing}
                          value={isEditing ? draft.date : invoice.date}
                          placeholder="Date"
                          onChange={(value) => updateDraft("date", value)}
                        />
                        <EditableCell
                          isEditing={isEditing}
                          value={
                            isEditing ? draft.totalAmount : invoice.totalAmount
                          }
                          placeholder="Total amount"
                          onChange={(value) => updateDraft("totalAmount", value)}
                        />
                        <td className="px-4 py-3 text-ink/60">
                          {new Date(invoice.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(invoice.id)}
                                disabled={isBusy}
                                title="Save row"
                                aria-label="Save row"
                                className="rounded-md border border-brand/30 p-2 text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={isBusy}
                                title="Cancel edit"
                                aria-label="Cancel edit"
                                className="rounded-md border border-ink/10 p-2 text-ink/60 transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onViewInvoiceFile(invoice)}
                                disabled={
                                  Boolean(busyInvoiceId) || !invoice.storagePath
                                }
                                title="View stored file"
                                aria-label="View stored file"
                                className="rounded-md border border-ink/10 p-2 text-ink/60 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditing(invoice)}
                                disabled={Boolean(busyInvoiceId)}
                                title="Edit row"
                                aria-label="Edit row"
                                className="rounded-md border border-ink/10 p-2 text-ink/60 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteInvoice(invoice)}
                                disabled={Boolean(busyInvoiceId)}
                                title="Delete row"
                                aria-label="Delete row"
                                className="rounded-md border border-ink/10 p-2 text-ink/60 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function getDateKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDate = trimmed.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toISOString().slice(0, 10);
}

function EditableCell({
  isEditing,
  value,
  placeholder,
  onChange
}: {
  isEditing: boolean;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  if (!isEditing) {
    return <td className="px-4 py-3">{value || "-"}</td>;
  }

  return (
    <td className="px-4 py-3">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full min-w-32 rounded-md border border-ink/10 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft"
      />
    </td>
  );
}
