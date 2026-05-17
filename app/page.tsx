import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Table2 } from "lucide-react";

const highlights = [
  {
    icon: FileText,
    title: "Upload invoices",
    copy: "Accept PDF, PNG, JPG, and WebP invoices from vendors and customers."
  },
  {
    icon: ShieldCheck,
    title: "Authenticated workspace",
    copy: "Supabase email authentication protects every dashboard session."
  },
  {
    icon: Table2,
    title: "Export ready",
    copy: "Review extracted GST fields and download clean CSV files."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-sm font-black text-white">
              GST
            </div>
            <span className="text-base font-bold tracking-tight">
              GST Invoice Extractor
            </span>
          </div>
          <Link
            href="/auth"
            className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
          >
            Login
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-dark">
              AI SaaS starter for Indian invoice workflows
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              GST Invoice Extractor
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Upload an invoice PDF or image, extract GST number, invoice
              number, company name, date, and total amount, then export the
              result as CSV.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                Start extracting
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-ink/10 px-5 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-panel">
            <div className="rounded-lg border border-ink/10 bg-paper p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold">Recent extraction</span>
                <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-bold text-brand-dark">
                  Ready
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Field</th>
                      <th className="px-3 py-3 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    <tr>
                      <td className="px-3 py-3 text-ink/60">GST number</td>
                      <td className="px-3 py-3 font-semibold">29ABCDE1234F1Z5</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 text-ink/60">Invoice number</td>
                      <td className="px-3 py-3 font-semibold">INV-1048</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 text-ink/60">Company</td>
                      <td className="px-3 py-3 font-semibold">Acme Traders</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 text-ink/60">Total amount</td>
                      <td className="px-3 py-3 font-semibold">Rs. 48,760.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pb-10 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-ink/10 bg-white p-5"
            >
              <item.icon className="mb-4 h-5 w-5 text-brand" aria-hidden="true" />
              <h2 className="font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
