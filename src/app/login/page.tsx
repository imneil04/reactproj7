import Link from "next/link";
import { login } from "@/app/login/actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-sky-200 sm:p-9">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Stockroom
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your inventory.
          </p>
        </div>

        {message && (
          <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <form action={login} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-slate-950 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
