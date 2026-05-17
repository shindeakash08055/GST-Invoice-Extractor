export type GeminiInvoiceExtraction = {
  gstNumber: string;
  invoiceNumber: string;
  companyName: string;
  date: string;
  totalAmount: string;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
  };
};

const invoiceExtractionSchema = {
  type: "OBJECT",
  properties: {
    gstNumber: {
      type: "STRING",
      description: "GSTIN found on the invoice. Empty string if missing."
    },
    invoiceNumber: {
      type: "STRING",
      description: "Invoice or bill number. Empty string if missing."
    },
    companyName: {
      type: "STRING",
      description: "Supplier or seller company name. Empty string if missing."
    },
    date: {
      type: "STRING",
      description: "Invoice date in YYYY-MM-DD when possible. Empty string if missing."
    },
    totalAmount: {
      type: "STRING",
      description: "Final payable total amount with currency if present. Empty string if missing."
    }
  },
  required: ["gstNumber", "invoiceNumber", "companyName", "date", "totalAmount"],
  propertyOrdering: [
    "gstNumber",
    "invoiceNumber",
    "companyName",
    "date",
    "totalAmount"
  ]
} as const;

export async function extractInvoiceWithGemini({
  fileName,
  mimeType,
  base64
}: {
  fileName: string;
  mimeType: string;
  base64: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Extract structured data from this GST invoice file named "${fileName}". Return only fields that are visible or confidently inferable from the document. Use empty strings for missing values.`
            },
            {
              inlineData: {
                mimeType,
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: invoiceExtractionSchema
      }
    })
  });

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "Gemini extraction request failed.");
  }

  const outputText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) {
    throw new Error("Gemini did not return extracted invoice data.");
  }

  return JSON.parse(outputText) as GeminiInvoiceExtraction;
}
