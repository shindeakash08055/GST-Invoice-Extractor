"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then login.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/65 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>

        <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-panel sm:p-8">
          <div className="mb-7">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-brand text-sm font-black text-white">
              GST
            </div>
            <h1 className="text-2xl font-black tracking-normal">
              {mode === "login" ? "Login to your dashboard" : "Create an account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Use email and password authentication powered by Supabase.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-paper p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "login" ? "bg-white text-brand shadow-sm" : "text-ink/60"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "signup" ? "bg-white text-brand shadow-sm" : "text-ink/60"
              }`}
            >
              Sign up
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-ink/10 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-ink/10 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft"
              />
            </label>

            {message ? (
              <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-dark">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
