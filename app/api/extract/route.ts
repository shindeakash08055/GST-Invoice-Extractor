import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceWithGemini } from "@/lib/gemini";
import {
  createInvoiceInsert,
  invoiceExtractionColumns,
  mapInvoiceRow
} from "@/lib/invoices";
import { invoiceFilesBucket } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { InvoiceExtractionRow } from "@/lib/types";

export const runtime = "nodejs";

const supportedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

type ExtractRequestBody = {
  fileName?: string;
  mimeType?: string;
  storagePath?: string;
};

async function verifyUser(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return {
    token,
    user: data.user
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session) return jsonError("Unauthorized. Please login again.", 401);

    const body = (await request.json()) as ExtractRequestBody;
    const fileName = body.fileName?.trim();
    const mimeType = body.mimeType?.trim();
    const storagePath = body.storagePath?.trim();

    if (!fileName || !mimeType || !storagePath) {
      return jsonError("Missing stored invoice file details.");
    }

    if (!storagePath.startsWith(`${session.user.id}/`)) {
      return jsonError("Invalid invoice storage path.", 403);
    }

    if (!supportedTypes.has(mimeType)) {
      return jsonError("Only PDF, PNG, JPG, and WebP invoices are supported.");
    }

    const supabase = createServerSupabaseClient(session.token);
    const { data: storedFile, error: downloadError } = await supabase.storage
      .from(invoiceFilesBucket)
      .download(storagePath);

    if (downloadError || !storedFile) {
      return jsonError(
        downloadError?.message || "Could not download stored invoice file.",
        400
      );
    }

    if (storedFile.size > 10 * 1024 * 1024) {
      return jsonError("The invoice file must be smaller than 10 MB.");
    }

    const arrayBuffer = await storedFile.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);
    const base64 = bytes.toString("base64");
    const extracted = await extractInvoiceWithGemini({
      fileName,
      mimeType,
      base64
    });

    const { data: savedRow, error: saveError } = await supabase
      .from("invoice_extractions")
      .insert(
        createInvoiceInsert({
          userId: session.user.id,
          fileName,
          gstNumber: extracted.gstNumber ?? "",
          invoiceNumber: extracted.invoiceNumber ?? "",
          companyName: extracted.companyName ?? "",
          date: extracted.date ?? "",
          totalAmount: extracted.totalAmount ?? "",
          storagePath
        })
      )
      .select(invoiceExtractionColumns)
      .single<InvoiceExtractionRow>();

    if (saveError) {
      await supabase.storage.from(invoiceFilesBucket).remove([storagePath]);
      throw new Error(
        `Gemini extracted the invoice, but Supabase could not save it: ${saveError.message}`
      );
    }

    const invoice = savedRow
      ? mapInvoiceRow(savedRow)
      : {
      id: crypto.randomUUID(),
      fileName,
      gstNumber: extracted.gstNumber ?? "",
      invoiceNumber: extracted.invoiceNumber ?? "",
      companyName: extracted.companyName ?? "",
      date: extracted.date ?? "",
      totalAmount: extracted.totalAmount ?? "",
      storagePath,
      createdAt: new Date().toISOString()
        };

    return NextResponse.json({ invoice });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to extract invoice data.";
    return jsonError(message, 500);
  }
}
