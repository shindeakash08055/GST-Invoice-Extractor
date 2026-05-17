export function isValidGSTIN(gstin: string): boolean {
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  return gstinRegex.test(gstin);
}

export function extractGSTIN(text: string): string | null {
  const gstinMatch = text.match(
    /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/
  );
  return gstinMatch ? gstinMatch[0] : null;
}

