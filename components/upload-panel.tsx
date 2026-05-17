"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { createInvoiceStoragePath, invoiceFilesBucket } from "@/lib/storage";
import type { ExtractInvoiceResponse, ExtractedInvoice } from "@/lib/types";

const acceptedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

type UploadPanelProps = {
  onExtracted: (invoice: ExtractedInvoice) => void;
};

export function UploadPanel({ onExtracted }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  function validateAndSetFile(nextFile?: File) {
    setError("");
    if (!nextFile) return;

    if (!acceptedTypes.includes(nextFile.type)) {
      setError("Upload a PDF, PNG, JPG, or WebP invoice.");
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      setError("Keep invoices under 10 MB for this starter app.");
      return;
    }

    setFile(nextFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  async function extractInvoice() {
    if (!file) {
      setError("Choose an invoice first.");
      return;
    }

    setIsExtracting(true);
    setError("");

    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const accessToken = session?.access_token;

    if (!accessToken || !session?.user.id) {
      setError("Your session expired. Login again to extract invoices.");
      setIsExtracting(false);
      return;
    }

    try {
      const storagePath = createInvoiceStoragePath(session.user.id, file.name);
      const { error: uploadError } = await supabase.storage
        .from(invoiceFilesBucket)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Could not upload invoice file: ${uploadError.message}`);
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          storagePath
        })
      });

      const payload = (await response.json()) as
        | ExtractInvoiceResponse
        | { error: string };

      if (!response.ok) {
        await supabase.storage.from(invoiceFilesBucket).remove([storagePath]);
        throw new Error("error" in payload ? payload.error : "Extraction failed.");
      }

      if (!("invoice" in payload)) {
        throw new Error("Extraction response did not include invoice data.");
      }

      onExtracted(payload.invoice);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong during extraction."
      );
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <section className="rounded-xl border border-ink/10 bg-white p-5 shadow-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-normal">Dashboard</h1>
          <p className="mt-1 text-sm leading-6 text-ink/65">
            Upload an invoice and let AI extract the fields into a review table.
          </p>
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`grid min-h-52 place-items-center rounded-lg border-2 border-dashed p-5 text-center transition ${
          isDragging
            ? "border-brand bg-brand-soft"
            : "border-ink/15 bg-paper hover:border-brand"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleInputChange}
        />

        {file ? (
          <div className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-4 text-left">
            <div className="flex items-start gap-3">
              <FileUp className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{file.name}</p>
                <p className="mt-1 text-xs font-semibold text-ink/55">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-md p-1 text-ink/45 transition hover:bg-paper hover:text-accent"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <UploadCloud className="mx-auto h-10 w-10 text-brand" aria-hidden="true" />
            <p className="mt-4 text-base font-bold">Drop invoice here</p>
            <p className="mt-1 text-sm text-ink/60">PDF, PNG, JPG, or WebP up to 10 MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-brand"
            >
              Browse file
            </button>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-ink/50">
          Invoices upload privately to Supabase Storage before Gemini extraction.
        </p>
        <button
          type="button"
          onClick={extractInvoice}
          disabled={!file || isExtracting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExtracting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Extract data
        </button>
      </div>
    </section>
  );
}
