"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { ExtractionTable } from "@/components/extraction-table";
import { UploadPanel } from "@/components/upload-panel";
import {
  createInvoiceUpdate,
  invoiceExtractionColumns,
  mapInvoiceRow
} from "@/lib/invoices";
import { invoiceFilesBucket } from "@/lib/storage";
import type {
  EditableInvoiceFields,
  ExtractedInvoice,
  InvoiceExtractionRow
} from "@/lib/types";

export function DashboardClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyInvoiceId, setBusyInvoiceId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>([]);
  const [profile, setprofile] = useState<any>(null);
  const freeLimitReached =
  profile?.plan === "free" &&
  profile?.invoice_count >= 5;

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace("/auth");
        return;
      }

      setEmail(data.user.email ?? "Authenticated user");
      setIsCheckingSession(false);

const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", data.user.id)
  .single();

setprofile(profileData);

      setIsLoadingInvoices(true);
      const { data: rows, error: rowsError } = await supabase
        .from("invoice_extractions")
        .select(invoiceExtractionColumns)
        .order("created_at", { ascending: false })
        .returns<InvoiceExtractionRow[]>();

      if (rowsError) {
        setLoadError(rowsError.message);
      } else {
        setInvoices((rows ?? []).map(mapInvoiceRow));
      }

      setIsLoadingInvoices(false);
    });
  }, [router]);

  async function updateInvoice(id: string, fields: EditableInvoiceFields) {
    const supabase = createBrowserSupabaseClient();
    setActionMessage("");
    setActionError("");
    setBusyInvoiceId(id);

    const { data: row, error } = await supabase
      .from("invoice_extractions")
      .update(createInvoiceUpdate(fields))
      .eq("id", id)
      .select(invoiceExtractionColumns)
      .single<InvoiceExtractionRow>();

    setBusyInvoiceId(null);

    if (error) {
      setActionError(error.message);
      return false;
    }

    if (row) {
      const updatedInvoice = mapInvoiceRow(row);
      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id === updatedInvoice.id ? updatedInvoice : invoice
        )
      );
    }

    setActionMessage("Invoice row updated.");
    return true;
  }

  async function deleteInvoice(id: string) {
    const supabase = createBrowserSupabaseClient();
    setActionMessage("");
    setActionError("");
    setBusyInvoiceId(id);
    const invoiceToDelete = invoices.find((invoice) => invoice.id === id);

    const { error } = await supabase
      .from("invoice_extractions")
      .delete()
      .eq("id", id);

    setBusyInvoiceId(null);

    if (error) {
      setActionError(error.message);
      return false;
    }

    if (invoiceToDelete?.storagePath) {
      const { error: storageError } = await supabase.storage
        .from(invoiceFilesBucket)
        .remove([invoiceToDelete.storagePath]);

      if (storageError) {
        setActionError(
          `Row deleted, but file cleanup failed: ${storageError.message}`
        );
      }
    }

    setInvoices((current) => current.filter((invoice) => invoice.id !== id));
    setActionMessage("Invoice row deleted.");
    return true;
  }

  async function viewInvoiceFile(invoice: ExtractedInvoice) {
    const supabase = createBrowserSupabaseClient();
    setActionMessage("");
    setActionError("");

    if (!invoice.storagePath) {
      setActionError("This row does not have a stored invoice file.");
      return false;
    }

    setBusyInvoiceId(invoice.id);
    const { data, error } = await supabase.storage
      .from(invoiceFilesBucket)
      .createSignedUrl(invoice.storagePath, 120);
    setBusyInvoiceId(null);

    if (error || !data?.signedUrl) {
      setActionError(error?.message || "Could not create a file view link.");
      return false;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    setActionMessage("Opened a private signed file link.");
    return true;
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="rounded-xl border border-ink/10 bg-white p-6 text-center shadow-panel">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg bg-brand text-sm font-black text-white">
            GST
          </div>
          <p className="text-sm font-bold text-ink/65">Checking your session...</p>
        </div>
      </main>
    );
  }

  return (
    <DashboardShell userEmail={email}>
      <UploadPanel
        onExtracted={(invoice) => setInvoices((current) => [invoice, ...current])}
      />
    {profile ? (
      <div className="mt-4 rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-sm font-bold">
      Plan: {profile.plan}
      </p>

      <p className="mt-1 text-sm text-ink/70">
      Invoices Used: {profile.invoice_count}/5
      </p>
      </div>
      ) : null}

      {isLoadingInvoices ? (
        <p className="mt-4 rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/60">
          Loading saved extractions...
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Could not load saved extractions: {loadError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="mt-4 rounded-lg bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-dark">
          {actionMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Action failed: {actionError}
        </p>
      ) : null}
      <ExtractionTable
        invoices={invoices}
        busyInvoiceId={busyInvoiceId}
        onDeleteInvoice={deleteInvoice}
        onUpdateInvoice={updateInvoice}
        onViewInvoiceFile={viewInvoiceFile}
      />
    </DashboardShell>
  );
}
