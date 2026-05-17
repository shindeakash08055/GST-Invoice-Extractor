export const invoiceFilesBucket = "invoice-files";

export function createInvoiceStoragePath(userId: string, fileName: string) {
  const safeFileName = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return `${userId}/${crypto.randomUUID()}-${safeFileName || "invoice"}`;
}
