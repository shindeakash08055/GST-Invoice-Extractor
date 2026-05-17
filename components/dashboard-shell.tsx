"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

type DashboardShellProps = {
  userEmail: string;
  children: ReactNode;
};

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-sm font-black text-white">
              GST
            </div>
            <div>
              <p className="text-base font-black tracking-normal">
                GST Invoice Extractor
              </p>
              <p className="text-xs font-semibold text-ink/55">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 px-4 py-2 text-sm font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">{children}</div>
    </main>
  );
}
