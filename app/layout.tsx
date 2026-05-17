import { Analytics } from "@vercel/analytics/next";
import type {Metadata} from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "GST Invoice Extractor",
  description: "AI-powered GST invoice data extraction for small teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}